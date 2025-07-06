/**
 * Storage module providing HookArray functionality for data transformation and batching
 * Extracted from index.js to eliminate global dependencies
 */

/** @typedef {import('../../types').Context} Context */

import { existsSync } from "fs";
import pLimit from 'p-limit';
import os from "os";
import path from "path";
import * as u from "../utils/utils.js";

/**
 * Creates a hooked array that transforms data on push and handles batching/disk writes
 * @param {Array} arr - Base array to enhance
 * @param {Object} opts - Configuration options
 * @param {Function} opts.hook - Transform function applied to each item
 * @param {string} opts.type - Type identifier for the hook function
 * @param {string} opts.filepath - Base filename for disk writes
 * @param {string} opts.format - Output format ('csv' or 'json')
 * @param {number} opts.concurrency - Max concurrent file operations
 * @param {Context} opts.context - Context object with config, batchSize, etc.
 * @returns {Promise<Array>} Enhanced array with hookPush and flush methods
 */
export async function createHookArray(arr = [], opts = {}) {
	const {
		hook = a => a,
		type = "",
		filepath = "./defaultFile",
		format = "csv",
		concurrency = 1,
		context = {},
		...rest
	} = opts;

	const FILE_CONN = pLimit(concurrency);
	const { config = {}, runtime = {} } = context;
	const BATCH_SIZE = config.batchSize || 1_000_000;
	const NODE_ENV = process.env.NODE_ENV || "unknown";

	let batch = 0;
	let writeDir;
	let isBatchMode = runtime.isBatchMode || false;

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
		if (isBatchMode) {
			if (writeDir?.startsWith('gs://')) return `${writeDir}/${filepath}-part-${batch.toString()}.${format}`;
			return path.join(writeDir, `${filepath}-part-${batch.toString()}.${format}`);
		}
		else {
			if (writeDir?.startsWith('gs://')) return `${writeDir}/${filepath}.${format}`;
			return path.join(writeDir, `${filepath}.${format}`);
		}
	}

	function getWriteDir() {
		return path.join(writeDir, `${filepath}.${format}`);
	}

	async function transformThenPush(item, meta) {
		if (item === null || item === undefined) return false;
		if (typeof item === 'object' && Object.keys(item).length === 0) return false;

		const allMetaData = { ...rest, ...meta };

		if (Array.isArray(item)) {
			for (const i of item) {
				try {
					const enriched = await hook(i, type, allMetaData);
					if (Array.isArray(enriched)) enriched.forEach(e => arr.push(e));
					else arr.push(enriched);
				} catch (e) {
					console.error(`\n\nyour hook had an error\n\n`, e);
					arr.push(i);
				}
			}
		} else {
			try {
				const enriched = await hook(item, type, allMetaData);
				if (Array.isArray(enriched)) enriched.forEach(e => arr.push(e));
				else arr.push(enriched);
			} catch (e) {
				console.error(`\n\nyour hook had an error\n\n`, e);
				arr.push(item);
			}
		}

		if (arr.length > BATCH_SIZE) {
			isBatchMode = true;
			runtime.isBatchMode = true; // Update runtime state
			batch++;
			const writePath = getWritePath();
			const writeResult = await FILE_CONN(() => writeToDisk(arr, { writePath }));
			return writeResult;
		} else {
			return Promise.resolve(false);
		}
	}

	async function writeToDisk(data, options) {
		const { writePath } = options;
		let writeResult;

		if (config.verbose) {
			console.log(`\n\n\twriting ${writePath}\n\n`);
		}

		switch (format) {
			case "csv":
				writeResult = await u.streamCSV(writePath, data);
				break;
			case "json":
				writeResult = await u.streamJSON(writePath, data);
				break;
			default:
				throw new Error(`format ${format} is not supported`);
		}

		if (isBatchMode) data.length = 0;
		return writeResult;
	}

	async function flush() {
		if (arr.length > 0) {
			batch++;
			const writePath = getWritePath();
			await FILE_CONN(() => writeToDisk(arr, { writePath }));
			if (isBatchMode) arr.length = 0; // free up memory for batch mode
		}
	}

	// Enhance the array with our methods
	const enrichedArray = arr;
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
	 * @returns {import('../../types').Storage} Storage containers object
	 */
	async initializeContainers() {
		const { config } = this.context;

		const storage = {
			eventData: await createHookArray([], {
				hook: config.hook,
				type: "event",
				filepath: `${config.simulationName || 'events'}-EVENTS`,
				format: config.format || "csv",
				concurrency: config.concurrency || 1,
				context: this.context
			}),

			userProfilesData: await createHookArray([], {
				hook: config.hook,
				type: "user",
				filepath: `${config.simulationName || 'users'}-USERS`,
				format: config.format || "csv",
				concurrency: config.concurrency || 1,
				context: this.context
			}),

			adSpendData: await createHookArray([], {
				hook: config.hook,
				type: "adspend",
				filepath: `${config.simulationName || 'adspend'}-ADSPEND`,
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
				filepath: `${config.simulationName || 'mirror'}-MIRROR`,
				format: config.format || "csv",
				concurrency: config.concurrency || 1,
				context: this.context
			})
		};

		// Initialize SCD tables if configured
		if (config.scdProps && Object.keys(config.scdProps).length > 0) {
			for (const scdKey of Object.keys(config.scdProps)) {
				const scdArray = await createHookArray([], {
					hook: config.hook,
					type: "scd",
					filepath: `${config.simulationName || 'scd'}-${scdKey}-SCD`,
					format: config.format || "csv",
					concurrency: config.concurrency || 1,
					context: this.context
				});
				scdArray.scdKey = scdKey;
				storage.scdTableData.push(scdArray);
			}
		}

		// Initialize group profile tables if configured
		if (config.groupKeys && config.groupKeys.length > 0) {
			for (const [groupKey] of config.groupKeys) {
				const groupArray = await createHookArray([], {
					hook: config.hook,
					type: "group",
					filepath: `${config.simulationName || 'groups'}-${groupKey}-GROUPS`,
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
					filepath: `${config.simulationName || 'lookup'}-${lookupConfig.key}-LOOKUP`,
					format: config.format || "csv",
					concurrency: config.concurrency || 1,
					context: this.context
				});
				lookupArray.lookupKey = lookupConfig.key;
				storage.lookupTableData.push(lookupArray);
			}
		}

		return storage;
	}
}