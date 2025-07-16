#! /usr/bin/env node

/**
 * make-mp-data: Generate realistic Mixpanel data for testing and demos
 * Modular, scalable data generation with support for events, users, funnels, SCDs, and more
 * 
 * @author AK <ak@mixpanel.com>
 * @version 3.0.0
 */

/** @typedef {import('./types').Dungeon} Config */
/** @typedef {import('./types').Storage} Storage */
/** @typedef {import('./types').Result} Result */
/** @typedef {import('./types').Context} Context */

// Core modules
import { createContext, updateContextWithStorage } from './lib/core/context.js';
import { validateDungeonConfig } from './lib/core/config-validator.js';
import { StorageManager } from './lib/core/storage.js';

// Orchestrators  
import { userLoop } from './lib/orchestrators/user-loop.js';
import { sendToMixpanel } from './lib/orchestrators/mixpanel-sender.js';
import { handleCloudFunctionEntry } from './lib/orchestrators/worker-manager.js';

// Generators
import { makeAdSpend } from './lib/generators/adspend.js';
import { makeMirror } from './lib/generators/mirror.js';
import { makeGroupProfile, makeProfile } from './lib/generators/profiles.js';

// Utilities
import { generateLineChart } from './lib/utils/chart.js';

// External dependencies
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import functions from '@google-cloud/functions-framework';
import { timer, sLog } from 'ak-tools';
import fs, { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize dayjs and time constants
dayjs.extend(utc);
const FIXED_NOW = dayjs('2024-02-02').unix();
global.FIXED_NOW = FIXED_NOW;
let FIXED_BEGIN = dayjs.unix(FIXED_NOW).subtract(90, 'd').unix();
global.FIXED_BEGIN = FIXED_BEGIN;


/**
 * Main data generation function
 * @param {Config} config - Configuration object for data generation
 * @returns {Promise<Result>} Generated data and metadata
 */
async function main(config) {
	const jobTimer = timer('job');
	jobTimer.start();

	//cli mode check for positional dungeon config
	const isCLI = config._ && Array.isArray(config._);
	if (isCLI) {
		const firstArg = config._.slice().pop();
		if (firstArg?.endsWith('.js') && existsSync(firstArg)) {
			if (config.verbose) {
				console.log(`\n🔍 Loading dungeon config from: ${firstArg}`);
			}
			try {
				const dungeonConfig = await import(firstArg);
				config = dungeonConfig.default || dungeonConfig;
			} catch (error) {
				console.error(`\n❌ Error loading dungeon config from ${firstArg}: ${error.message}`);
				throw error;
			}
		}

	}

	if (config.verbose) console.log(`\n🔧 Configuring dungeon with seed: ${config.seed}`);
	let validatedConfig;
	try {
		// Step 1: Validate and enrich configuration
		validatedConfig = validateDungeonConfig(config);

		// Step 2: Create context with validated config
		const context = createContext(validatedConfig, null, isCLI);

		// Step 3: Initialize storage containers
		const storageManager = new StorageManager(context);
		const storage = await storageManager.initializeContainers();
		updateContextWithStorage(context, storage);

		// Step 4: Generate ad spend data (if enabled)
		if (validatedConfig.hasAdSpend) {
			await generateAdSpendData(context);
		}

		if (context.config.verbose) console.log(`\n🔄 Starting user and event generation...\n`);
		// Step 5: Main user and event generation
		await userLoop(context);

		// Step 6: Generate group profiles (if configured)
		if (validatedConfig.groupKeys && validatedConfig.groupKeys.length > 0) {
			await generateGroupProfiles(context);
		}

		// Step 7: Generate group SCDs (if configured)
		if (validatedConfig.scdProps && validatedConfig.groupKeys && validatedConfig.groupKeys.length > 0) {
			await generateGroupSCDs(context);
		}

		// Step 8: Generate lookup tables (if configured)
		if (validatedConfig.lookupTables && validatedConfig.lookupTables.length > 0) {
			await generateLookupTables(context);
		}

		// Step 9: Generate mirror datasets (if configured)
		if (validatedConfig.mirrorProps && Object.keys(validatedConfig.mirrorProps).length > 0) {
			await makeMirror(context);
		}

		// Step 10: Generate charts (if enabled)
		if (validatedConfig.makeChart) {
			await generateCharts(context);
		}

		// Step 11: Flush storage containers to disk (if writeToDisk enabled)
		if (validatedConfig.writeToDisk) {
			await flushStorageToDisk(storage, validatedConfig);
		}

		// Step 12: Send to Mixpanel (if token provided)
		let importResults;
		if (validatedConfig.token) {
			importResults = await sendToMixpanel(context);
		}

		// Step 13: Compile results
		jobTimer.stop(false);
		const { start, end, delta, human } = jobTimer.report(false);

		const extractedData = extractStorageData(storage);

		return {
			...extractedData,
			importResults,
			files: extractFileInfo(storage),
			time: { start, end, delta, human },
			operations: context.getOperations(),
			eventCount: context.getEventCount(),
			userCount: context.getUserCount()
		};

	} catch (error) {
		if (validatedConfig?.verbose) {
			console.error(`\n❌ Error: ${error.message}\n`);
			console.error(error.stack);
		} else {
			sLog("Main execution error", { error: error.message, stack: error.stack }, "ERROR");
		}
		throw error;
	}
}

/**
 * Generate ad spend data for configured date range
 * @param {Context} context - Context object
 */
async function generateAdSpendData(context) {
	const { config, storage } = context;
	const { numDays } = config;

	for (let day = 0; day < numDays; day++) {
		const targetDay = dayjs.unix(global.FIXED_BEGIN).add(day, 'day').toISOString();
		const adSpendEvents = await makeAdSpend(context, targetDay);

		if (adSpendEvents.length > 0) {
			for (const adSpendEvent of adSpendEvents) {
				await storage.adSpendData.hookPush(adSpendEvent);
			}
		}
	}
}

/**
 * Generate group profiles for all configured group keys
 * @param {Context} context - Context object
 */
async function generateGroupProfiles(context) {
	const { config, storage } = context;
	const { groupKeys, groupProps = {} } = config;

	if (context.isCLI() || config.verbose) {
		console.log('\n👥 Generating group profiles...');
	}

	for (let i = 0; i < groupKeys.length; i++) {
		const [groupKey, groupCount] = groupKeys[i];
		const groupContainer = storage.groupProfilesData[i];

		if (!groupContainer) {
			console.warn(`Warning: No storage container found for group key: ${groupKey}`);
			continue;
		}

		if (context.isCLI() || config.verbose) {
			console.log(`   Creating ${groupCount.toLocaleString()} ${groupKey} profiles...`);
		}

		// Get group-specific props if available
		const specificGroupProps = groupProps[groupKey] || {};

		for (let j = 0; j < groupCount; j++) {
			const groupProfile = await makeGroupProfile(context, groupKey, specificGroupProps, {
				[groupKey]: `${groupKey}_${j + 1}`
			});

			await groupContainer.hookPush(groupProfile);
		}
	}

	if (context.isCLI() || config.verbose) {
		console.log('✅ Group profiles generated successfully');
	}
}

/**
 * Generate lookup tables for all configured lookup schemas
 * @param {Context} context - Context object
 */
async function generateLookupTables(context) {
	const { config, storage } = context;
	const { lookupTables } = config;

	if (context.isCLI() || config.verbose) {
		console.log('\n🔍 Generating lookup tables...');
	}

	for (let i = 0; i < lookupTables.length; i++) {
		const lookupConfig = lookupTables[i];
		const { key, entries, attributes } = lookupConfig;
		const lookupContainer = storage.lookupTableData[i];

		if (!lookupContainer) {
			console.warn(`Warning: No storage container found for lookup table: ${key}`);
			continue;
		}

		if (context.isCLI() || config.verbose) {
			console.log(`   Creating ${entries.toLocaleString()} ${key} lookup entries...`);
		}

		for (let j = 0; j < entries; j++) {
			const lookupEntry = await makeProfile(context, attributes, {
				[key]: `${key}_${j + 1}`
			});

			await lookupContainer.hookPush(lookupEntry);
		}
	}

	if (context.isCLI() || config.verbose) {
		console.log('✅ Lookup tables generated successfully');
	}
}

/**
 * Generate SCDs for group entities
 * @param {Context} context - Context object
 */
async function generateGroupSCDs(context) {
	const { config, storage } = context;
	const { scdProps, groupKeys } = config;

	if (context.isCLI() || config.verbose) {
		console.log('\n📊 Generating group SCDs...');
	}

	// Import utilities and generators
	const { objFilter } = await import('ak-tools');
	const { makeSCD } = await import('./lib/generators/scd.js');
	const u = await import('./lib/utils/utils.js');
	const chance = u.getChance();

	// Get only group SCDs (not user SCDs)
	// @ts-ignore
	const groupSCDProps = objFilter(scdProps, (scd) => scd.type && scd.type !== 'user');

	for (const [groupKey, groupCount] of groupKeys) {
		// Filter SCDs that apply to this specific group key
		// @ts-ignore
		const groupSpecificSCDs = objFilter(groupSCDProps, (scd) => scd.type === groupKey);

		if (Object.keys(groupSpecificSCDs).length === 0) {
			continue; // No SCDs for this group type
		}

		if (context.isCLI() || config.verbose) {
			console.log(`   Generating SCDs for ${groupCount.toLocaleString()} ${groupKey} entities...`);
		}

		// Generate SCDs for each group entity
		for (let i = 0; i < groupCount; i++) {
			const groupId = `${groupKey}_${i + 1}`;

			// Generate SCDs for this group entity
			for (const [scdKey, scdConfig] of Object.entries(groupSpecificSCDs)) {
				const { max = 10 } = scdConfig;
				const mutations = chance.integer({ min: 1, max });

				// Use a base time for the group entity (similar to user creation time)
				const baseTime = context.FIXED_BEGIN || context.FIXED_NOW;
				const changes = await makeSCD(context, scdConfig, scdKey, groupId, mutations, baseTime);

				// Apply hook if configured
				if (config.hook) {
					await config.hook(changes, "scd-pre", {
						type: 'group',
						groupKey,
						scd: { [scdKey]: scdConfig },
						config
					});
				}

				// Store SCDs in the appropriate SCD table
				for (const change of changes) {
					try {
						const target = storage.scdTableData.filter(arr => arr.scdKey === scdKey).pop();
						await target.hookPush(change, { type: 'group', groupKey });
					} catch (e) {
						// Fallback for tests
						const target = storage.scdTableData[0];
						await target.hookPush(change, { type: 'group', groupKey });
					}
				}
			}
		}
	}

	if (context.isCLI() || config.verbose) {
		console.log('✅ Group SCDs generated successfully');
	}
}

/**
 * Generate charts for data visualization
 * @param {Context} context - Context object
 */
async function generateCharts(context) {
	const { config, storage } = context;

	if (config.makeChart && storage.eventData?.length > 0) {
		const chartPath = typeof config.makeChart === 'string'
			? config.makeChart
			: `./charts/${config.simulationName}-timeline.png`;

		await generateLineChart(storage.eventData, undefined, chartPath);

		if (context.isCLI() || config.verbose) {
			console.log(`📊 Chart generated: ${chartPath}`);
		} else {
			sLog("Chart generated", { path: chartPath });
		}
	}
}

/**
 * Flush all storage containers to disk
 * @param {import('./types').Storage} storage - Storage containers
 * @param {import('./types').Dungeon} config - Configuration object
 */
async function flushStorageToDisk(storage, config) {
	if (config.verbose) {
		console.log('\n💾 Writing data to disk...');
	}

	const flushPromises = [];

	// Flush single HookedArray containers
	if (storage.eventData?.flush) flushPromises.push(storage.eventData.flush());
	if (storage.userProfilesData?.flush) flushPromises.push(storage.userProfilesData.flush());
	if (storage.adSpendData?.flush) flushPromises.push(storage.adSpendData.flush());
	if (storage.mirrorEventData?.flush) flushPromises.push(storage.mirrorEventData.flush());
	if (storage.groupEventData?.flush) flushPromises.push(storage.groupEventData.flush());

	// Flush arrays of HookedArrays
	[storage.scdTableData, storage.groupProfilesData, storage.lookupTableData].forEach(arrayOfContainers => {
		if (Array.isArray(arrayOfContainers)) {
			arrayOfContainers.forEach(container => {
				if (container?.flush) flushPromises.push(container.flush());
			});
		}
	});

	await Promise.all(flushPromises);

	if (config.verbose) {
		console.log('✅ Data flushed to disk successfully');
	}
}

/**
 * Extract file information from storage containers
 * @param {import('./types').Storage} storage - Storage object
 * @returns {string[]} Array of file paths
 */
function extractFileInfo(storage) {
	const files = [];

	Object.values(storage).forEach(container => {
		if (Array.isArray(container)) {
			container.forEach(subContainer => {
				if (subContainer?.getWritePath) {
					files.push(subContainer.getWritePath());
				}
			});
		} else if (container?.getWritePath) {
			files.push(container.getWritePath());
		}
	});

	return files;
}

/**
 * Extract data from storage containers, preserving array structure for groups/lookups/SCDs
 * @param {import('./types').Storage} storage - Storage object
 * @returns {object} Extracted data in Result format
 */
function extractStorageData(storage) {
	return {
		eventData: storage.eventData || [],
		mirrorEventData: storage.mirrorEventData || [],
		userProfilesData: storage.userProfilesData || [],
		adSpendData: storage.adSpendData || [],
		// Keep arrays of HookedArrays as separate arrays (don't flatten)
		scdTableData: storage.scdTableData || [],
		groupProfilesData: storage.groupProfilesData || [],
		lookupTableData: storage.lookupTableData || []
	};
}

// Cloud Functions setup
functions.http('entry', async (req, res) => {
	await handleCloudFunctionEntry(req, res, main);
});

// ES Module export
export default main;

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
	module.exports = main;
}

