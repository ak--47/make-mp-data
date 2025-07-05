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

// Utilities
import getCliParams from './lib/cli/cli.js';
import * as u from './lib/utils/utils.js';
import { generateLineChart } from './lib/utils/chart.js';

// External dependencies
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import functions from '@google-cloud/functions-framework';
import { timer, sLog } from 'ak-tools';
import fs from 'fs';

// Initialize dayjs and time constants
dayjs.extend(utc);
const FIXED_NOW = dayjs('2024-02-02').unix();
global.FIXED_NOW = FIXED_NOW;
let FIXED_BEGIN = dayjs.unix(FIXED_NOW).subtract(90, 'd').unix();
global.FIXED_BEGIN = FIXED_BEGIN;

// Package version
const { version } = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Environment
const { NODE_ENV = "unknown" } = process.env;
const isCLI = process.argv[1].endsWith('index.js') || process.argv[1].endsWith('cli.js');

/**
 * Main data generation function
 * @param {Config} config - Configuration object for data generation
 * @returns {Promise<Result>} Generated data and metadata
 */
async function main(config) {
    const jobTimer = timer('job');
    jobTimer.start();

    try {
        // Step 1: Validate and enrich configuration
        const validatedConfig = validateDungeonConfig(config);
        
        // Step 2: Create context with validated config
        const context = createContext(validatedConfig);
        
        // Step 3: Initialize storage containers
        const storageManager = new StorageManager();
        const storage = storageManager.initializeContainers(validatedConfig);
        updateContextWithStorage(context, storage);
        
        // Step 4: Generate ad spend data (if enabled)
        if (validatedConfig.hasAdSpend) {
            await generateAdSpendData(context);
        }
        
        // Step 5: Main user and event generation
        await userLoop(context, validatedConfig.concurrency);
        
        // Step 6: Generate mirror datasets (if configured)
        if (validatedConfig.mirrorProps && Object.keys(validatedConfig.mirrorProps).length > 0) {
            await makeMirror(context);
        }
        
        // Step 7: Generate charts (if enabled)
        if (validatedConfig.makeChart) {
            await generateCharts(context);
        }
        
        // Step 8: Send to Mixpanel (if token provided)
        let importResults = {};
        if (validatedConfig.token) {
            importResults = await sendToMixpanel(context);
        }
        
        // Step 9: Compile results
        jobTimer.stop(false);
        const { start, end, delta, human } = jobTimer.report(false);
        
        return {
            eventData: storage.eventData || [],
            mirrorEventData: storage.mirrorEventData || [],
            userProfilesData: storage.userProfilesData || [],
            scdTableData: storage.scdTableData || [],
            adSpendData: storage.adSpendData || [],
            groupProfilesData: storage.groupProfilesData || [],
            lookupTableData: storage.lookupTableData || [],
            importResults,
            files: extractFileInfo(storage),
            time: { start, end, delta, human },
            operations: context.getOperations(),
            eventCount: context.getEventCount(),
            userCount: context.getUserCount()
        };
        
    } catch (error) {
        sLog("Main execution error", { error: error.message, stack: error.stack }, "ERROR");
        throw error;
    }
}

/**
 * Generate ad spend data for configured date range
 * @param {Object} context - Context object
 */
async function generateAdSpendData(context) {
    const { config, storage } = context;
    const { numDays } = config;
    
    for (let day = 0; day < numDays; day++) {
        const targetDay = dayjs.unix(global.FIXED_BEGIN).add(day, 'day').toISOString();
        const adSpendEvents = await makeAdSpend(context, targetDay);
        
        if (adSpendEvents.length > 0) {
            await storage.adSpendData.hookPush(adSpendEvents);
        }
    }
}

/**
 * Generate charts for data visualization
 * @param {Object} context - Context object
 */
async function generateCharts(context) {
    const { config, storage } = context;
    
    if (config.makeChart && storage.eventData?.length > 0) {
        const chartPath = typeof config.makeChart === 'string' 
            ? config.makeChart 
            : `./charts/${config.simulationName}-timeline.png`;
            
        await generateLineChart(storage.eventData, chartPath);
        sLog("Chart generated", { path: chartPath });
    }
}

/**
 * Extract file information from storage containers
 * @param {Storage} storage - Storage object
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

// CLI execution
if (isCLI) {
    const cliConfig = getCliParams();
    main(cliConfig)
        .then(result => {
            sLog("Job completed successfully", {
                events: result.eventCount,
                users: result.userCount,
                time: result.time.human
            });
            process.exit(0);
        })
        .catch(error => {
            sLog("Job failed", { error: error.message }, "ERROR");
            process.exit(1);
        });
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