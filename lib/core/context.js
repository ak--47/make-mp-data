/**
 * Context module - replaces global variables with a context object
 * Provides centralized state management and dependency injection
 */

/** @typedef {import('../../types').Dungeon} Dungeon */
/** @typedef {import('../../types').Storage} Storage */
/** @typedef {import('../../types').Context} Context */
/** @typedef {import('../../types').RuntimeState} RuntimeState */
/** @typedef {import('../../types').Defaults} Defaults */

import dayjs from "dayjs";
import { campaigns, devices, locations } from '../data/defaults.js';
import * as u from '../utils/utils.js';

/**
 * Creates a defaults factory function that computes weighted defaults
 * @param {Dungeon} config - Configuration object
 * @param {Array} campaignData - Campaign data array
 * @returns {Defaults} Defaults object with factory functions
 */
function createDefaults(config, campaignData) {
    const { singleCountry } = config;
    
    // Pre-compute weighted arrays based on configuration
    const locationsUsers = singleCountry ? 
        locations.filter(l => l.country === singleCountry) : 
        locations;
    
    const locationsEvents = singleCountry ? 
        locations.filter(l => l.country === singleCountry) : 
        locations;

    return {
        locationsUsers: () => u.weighArray(locationsUsers),
        locationsEvents: () => u.weighArray(locationsEvents),
        iOSDevices: () => u.weighArray(devices.iosDevices),
        androidDevices: () => u.weighArray(devices.androidDevices),
        desktopDevices: () => u.weighArray(devices.desktopDevices),
        browsers: () => u.weighArray(devices.browsers),
        campaigns: () => u.weighArray(campaignData)
    };
}

/**
 * Creates a runtime state object for tracking execution state
 * @returns {RuntimeState} Runtime state with counters and flags
 */
function createRuntimeState() {
    return {
        operations: 0,
        eventCount: 0,
        userCount: 0,
        isBatchMode: false,
        verbose: false,
        isCLI: false
    };
}

/**
 * Context factory that creates a complete context object for data generation
 * @param {Dungeon} config - Validated configuration object
 * @param {Storage|null} storage - Storage containers (optional, can be set later)
 * @param {boolean} [isCliMode] - Whether running in CLI mode (optional, will detect if not provided)
 * @returns {Context} Context object containing all state and dependencies
 */
export function createContext(config, storage = null, isCliMode = null) {
    // Import campaign data (could be made configurable)
    const campaignData = campaigns;
    
    // Create computed defaults based on config
    const defaults = createDefaults(config, campaignData);
    
    // Create runtime state
    const runtime = createRuntimeState();
    
    // Set runtime flags from config
    runtime.verbose = config.verbose || false;
    runtime.isBatchMode = config.batchSize && config.batchSize < config.numEvents;
    runtime.isCLI = isCliMode !== null ? isCliMode : (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('cli.js'));
    
    const context = {
        config,
        storage,
        defaults,
        campaigns: campaignData,
        runtime,
        
        // Helper methods for updating state
        incrementOperations() {
            runtime.operations++;
        },
        
        incrementEvents() {
            runtime.eventCount++;
        },
        
        incrementUsers() {
            runtime.userCount++;
        },
        
        setStorage(storageObj) {
            this.storage = storageObj;
        },
        
        // Getter methods for runtime state
        getOperations() {
            return runtime.operations;
        },
        
        getEventCount() {
            return runtime.eventCount;
        },
        
        getUserCount() {
            return runtime.userCount;
        },
        
        incrementUserCount() {
            runtime.userCount++;
        },
        
        incrementEventCount() {
            runtime.eventCount++;
        },
        
        isBatchMode() {
            return runtime.isBatchMode;
        },
        
        isCLI() {
            return runtime.isCLI;
        },
        
        // Time helper methods
        getTimeShift() {
            const actualNow = dayjs().add(2, "day");
            return actualNow.diff(dayjs.unix(global.FIXED_NOW), "seconds");
        },
        
        getDaysShift() {
            const actualNow = dayjs().add(2, "day");
            return actualNow.diff(dayjs.unix(global.FIXED_NOW), "days");
        },
        
        // Time constants (previously globals)
        FIXED_NOW: global.FIXED_NOW,
        FIXED_BEGIN: global.FIXED_BEGIN
    };
    
    return context;
}

/**
 * Updates an existing context with new storage containers
 * @param {Context} context - Existing context object
 * @param {Storage} storage - New storage containers
 * @returns {Context} Updated context object
 */
export function updateContextWithStorage(context, storage) {
    context.storage = storage;
    return context;
}

/**
 * Validates that a context object has all required properties
 * @param {Context} context - Context to validate
 * @throws {Error} If context is missing required properties
 */
export function validateContext(context) {
    const required = ['config', 'defaults', 'campaigns', 'runtime'];
    const missing = required.filter(prop => !context[prop]);
    
    if (missing.length > 0) {
        throw new Error(`Context is missing required properties: ${missing.join(', ')}`);
    }
    
    if (!context.config.numUsers || !context.config.numEvents) {
        throw new Error('Context config must have numUsers and numEvents');
    }
}