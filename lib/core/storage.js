/**
 * Storage module providing HookArray functionality for data transformation and batching
 * Extracted from index.js to eliminate global dependencies
 */

/** @typedef {import('../../types.js').Context} Context */
/** @typedef {import('../../types.js').HookedArray<any>} HookedArray */
/** @typedef {import('../../types.js').Storage} Storage */
/** @typedef {import('../../types.js').hookArrayOptions<any>} hookArrayOptions */

import { existsSync } from "fs";
import pLimit from 'p-limit';
import os from "os";
import path from "path";
import * as u from "../utils/utils.js";
import { dataLogger as logger } from "../utils/logger.js";

/**
 * Creates a hooked array that transforms data on push and handles batching/disk writes
 * @param {Array} arr - Base array to enhance
 * @param {hookArrayOptions} opts - Configuration options
 * @returns {Promise<HookedArray>} Enhanced array with hookPush and flush methods
 */
export async function createHookArray(arr = [], opts) {
	const {
		hook = a => a,
		type = "",
		filepath = "./defaultFile",
		format = "csv",
		concurrency = 1,
		context = /** @type {Context} */ ({}),
		...rest
	} = opts || {};

	const FILE_CONN = pLimit(concurrency);
	const {
		config = {},
		runtime = {
			operations: 0,
			eventCount: 0,
			userCount: 0,
			isBatchMode: false,
			verbose: false
		}
	} = context;
	const BATCH_SIZE = config.batchSize || 1_000_000;
	const NODE_ENV = process.env.NODE_ENV || "unknown";

	let batch = 0;
	let writeDir;
	let isBatchMode = runtime.isBatchMode || false;
	let isWriting = false; // Prevent concurrent writes

	// Determine write directory
	const dataFolder = path.resolve("./data");
	if (existsSync(dataFolder)) writeDir = dataFolder;
	else writeDir = path.resolve("./");

	if (NODE_ENV?.toLowerCase()?.startsWith("prod")) {
		writeDir = path.resolve(os.tmpdir());
	}

	if (typeof config.writeToDisk === "string" && config.writeToDisk.startsWith('gs://')) {
		writeDir = config.writeToDisk;
	}

	function getWritePath() {
		const gzipSuffix = (config.gzip) ? '.gz' : '';
		
		if (isBatchMode) {
			if (writeDir?.startsWith('gs://')) return `${writeDir}/${filepath}-part-${batch.toString()}.${format}${gzipSuffix}`;
			return path.join(writeDir, `${filepath}-part-${batch.toString()}.${format}${gzipSuffix}`);
		}
		else {
			if (writeDir?.startsWith('gs://')) return `${writeDir}/${filepath}.${format}${gzipSuffix}`;
			return path.join(writeDir, `${filepath}.${format}${gzipSuffix}`);
		}
	}

	function getWriteDir() {
		return writeDir;
	}

	async function transformThenPush(item, meta) {
		if (item === null || item === undefined) return false;
		if (typeof item === 'object' && Object.keys(item).length === 0) return false;

		// Skip hook for types already hooked in generators/orchestrators to prevent double-firing
		// Types hooked upstream: "event" (events.js), "user" (user-loop.js), "scd" (user-loop.js)
		// Types only hooked here: "mirror", "ad-spend", "group", "lookup"
		const alreadyHooked = type === "event" || type === "user" || type === "scd";

		// Performance optimization: skip hook overhead for passthrough hooks
		// Only treat as passthrough if the function body is trivially simple (just returns its argument)
		const hookStr = hook.toString();
		const isPassthroughHook = hook.length === 1 || /^\s*function\s*\([^)]*\)\s*\{\s*return\s+\w+;?\s*\}\s*$/.test(hookStr) || /^\s*\(?[^)]*\)?\s*=>\s*\w+\s*$/.test(hookStr);

		if (alreadyHooked || isPassthroughHook) {
			// Fast path for passthrough hooks - no transformation needed
			if (Array.isArray(item)) {
				arr.push(...item);
			} else {
				arr.push(item);
			}
		} else {
			// Slow path for actual transformation hooks
			const allMetaData = { ...rest, ...meta };

			// Helper to validate events have required properties
			// Note: event-type hooks are handled in the fast path (alreadyHooked),
			// so this only runs for storage-only hook types (mirror, ad-spend, group, lookup)
			const isValidEvent = (e) => {
				if (!e || typeof e !== 'object') return false;
				return true;
			};

			if (Array.isArray(item)) {
				for (const i of item) {
					try {
						const enriched = await hook(i, type, allMetaData);
						if (Array.isArray(enriched)) {
							enriched.forEach(e => {
								if (isValidEvent(e)) arr.push(e);
							});
						} else if (isValidEvent(enriched)) {
							arr.push(enriched);
						}
					} catch (e) {
						logger.error({ err: e }, 'Hook error during batch processing');
						if (isValidEvent(i)) arr.push(i);
					}
				}
			} else {
				try {
					const enriched = await hook(item, type, allMetaData);
					if (Array.isArray(enriched)) {
						enriched.forEach(e => {
							if (isValidEvent(e)) arr.push(e);
						});
					} else if (isValidEvent(enriched)) {
						arr.push(enriched);
					}
				} catch (e) {
					logger.error({ err: e }, 'Hook error during single item processing');
					if (isValidEvent(item)) arr.push(item);
				}
			}
		}

		// Check batch size and handle writes synchronously to prevent race conditions
		if (arr.length > BATCH_SIZE && !isWriting) {
			isWriting = true; // Lock to prevent concurrent writes
			isBatchMode = true;
			runtime.isBatchMode = true; // Update runtime state
			batch++;
			const writePath = getWritePath();
			
			try {
				// Create a copy of the data to write
				const dataToWrite = [...arr];
				// Clear the array immediately to prevent race conditions
				arr.length = 0;

				// Write to disk/cloud - always blocking to prevent OOM
				const writeResult = await FILE_CONN(() => writeToDisk(dataToWrite, { writePath }));
				return writeResult;
			} finally {
				isWriting = false; // Release the lock
			}
		} else {
			return Promise.resolve(false);
		}
	}

	async function writeToDisk(data, options) {
		const { writePath } = options;
		let writeResult;

		const isDev = process.env.NODE_ENV !== 'production';
		if (config.verbose && isDev) {
			console.log(`\n\twriting ${writePath}\n`);
		} else if (config.verbose) {
			logger.info({ path: writePath }, `Writing ${writePath}`);
		}

		const streamOptions = {
			gzip: config.gzip || false
		};

		switch (format) {
			case "csv":
				writeResult = await u.streamCSV(writePath, data, streamOptions);
				break;
			case "json":
				writeResult = await u.streamJSON(writePath, data, streamOptions);
				break;
			case "parquet":
				writeResult = await u.streamParquet(writePath, data, streamOptions);
				break;
			default:
				throw new Error(`format ${format} is not supported`);
		}

		// Array clearing now handled in transformThenPush to ensure proper timing
		return writeResult;
	}

	async function flush() {
		if (arr.length > 0) {
			// Wait for any ongoing writes to complete
			while (isWriting) {
				await new Promise(resolve => setTimeout(resolve, 10));
			}
			
			isWriting = true;
			try {
				batch++;
				const writePath = getWritePath();
				const dataToWrite = [...arr];
				arr.length = 0; // Clear array after copying data
				await FILE_CONN(() => writeToDisk(dataToWrite, { writePath }));
			} finally {
				isWriting = false;
			}
		}
	}

	// Enhance the array with our methods
	/** @type {HookedArray} */
	const enrichedArray = /** @type {any} */ (arr);
	enrichedArray.hookPush = transformThenPush;
	enrichedArray.flush = flush;
	enrichedArray.getWriteDir = getWriteDir;
	enrichedArray.getWritePath = getWritePath;

	// Add additional properties from rest
	for (const key in rest) {
		enrichedArray[key.toString()] = rest[key];
	}

	return enrichedArray;
}

/**
 * Storage manager class for initializing and managing all storage containers
 */
export class StorageManager {
	constructor(context) {
		this.context = context;
	}

	/**
	 * Initialize all storage containers for the data generation process
	 * @returns {Promise<Storage>} Storage containers object
	 */
	async initializeContainers() {
		const { config } = this.context;

		// Validate configuration for potential data loss scenarios
		this.validateConfiguration(config);

		/** @type {Storage} */
		const storage = {
			eventData: await createHookArray([], {
				hook: config.hook,
				type: "event",
				filepath: `${config.name}-EVENTS`,
				format: config.format || "csv",
				concurrency: config.concurrency || 1,
				context: this.context
			}),

			userProfilesData: await createHookArray([], {
				hook: config.hook,
				type: "user",
				filepath: `${config.name}-USERS`,
				format: config.format || "csv",
				concurrency: config.concurrency || 1,
				context: this.context
			}),

			adSpendData: await createHookArray([], {
				hook: config.hook,
				type: "ad-spend",
				filepath: `${config.name}-ADSPEND`,
				format: config.format || "csv",
				concurrency: config.concurrency || 1,
				context: this.context
			}),

			scdTableData: [],
			groupProfilesData: [],
			lookupTableData: [],

			mirrorEventData: await createHookArray([], {
				hook: config.hook,
				type: "mirror",
				filepath: `${config.name}-MIRROR`,
				format: config.format || "csv",
				concurrency: config.concurrency || 1,
				context: this.context
			})
		};

		// Initialize SCD tables if configured
		if (config.scdProps && Object.keys(config.scdProps).length > 0) {
			for (const scdKey of Object.keys(config.scdProps)) {
				const scdConfig = config.scdProps[scdKey];
				const scdArray = await createHookArray([], {
					hook: config.hook,
					type: "scd",
					filepath: `${config.name}-${scdKey}-SCD`,
					format: config.format || "csv",
					concurrency: config.concurrency || 1,
					context: this.context
				});
				scdArray.scdKey = scdKey;
				// Store entity type (user or group) from config
				const entityType = (typeof scdConfig === 'object' && scdConfig.type) ? scdConfig.type : 'user';
				scdArray.entityType = entityType;
				storage.scdTableData.push(scdArray);
			}
		}

		// Initialize group profile tables if configured
		if (config.groupKeys && config.groupKeys.length > 0) {
			for (const [groupKey] of config.groupKeys) {
				const groupArray = await createHookArray([], {
					hook: config.hook,
					type: "group",
					filepath: `${config.name}-${groupKey}-GROUPS`,
					format: config.format || "csv",
					concurrency: config.concurrency || 1,
					context: this.context
				});
				groupArray.groupKey = groupKey;
				storage.groupProfilesData.push(groupArray);
			}
		}

		// Initialize lookup tables if configured
		if (config.lookupTables && config.lookupTables.length > 0) {
			for (const lookupConfig of config.lookupTables) {
				const lookupArray = await createHookArray([], {
					hook: config.hook,
					type: "lookup",
					filepath: `${config.name}-${lookupConfig.key}-LOOKUP`,
					format: "csv", // Always force CSV for lookup tables
					concurrency: config.concurrency || 1,
					context: this.context
				});
				lookupArray.lookupKey = lookupConfig.key;
				storage.lookupTableData.push(lookupArray);
			}
		}

		return storage;
	}

	/**
	 * Validates configuration to prevent data loss scenarios
	 * @param {Object} config - Configuration object
	 */
	validateConfiguration(config) {
		// Check for potential data loss scenario: writeToDisk=false with low batchSize
		if (config.writeToDisk === false) {
			const batchSize = config.batchSize || 1_000_000;
			const numEvents = config.numEvents || 0;

			if (batchSize < numEvents) {
				console.warn(
					`⚠️  writeToDisk is false but batchSize (${batchSize.toLocaleString()}) < numEvents (${numEvents.toLocaleString()}). ` +
					`Batch files will be written to disk temporarily to avoid OOM. ` +
					`They will be cleaned up after Mixpanel import if a token is provided.`
				);
			}
		}
	}
}