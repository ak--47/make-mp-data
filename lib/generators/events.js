/**
 * Event generator module
 * Creates individual Mixpanel events with realistic properties and timing
 */

/** @typedef {import('../../types').Dungeon} Config */
/** @typedef {import('../../types').EventConfig} EventConfig */
/** @typedef {import('../../types').ValueValid} ValueValid */
/** @typedef {import('../../types').EventSchema} EventSchema */
/** @typedef {import('../../types').Context} Context */

import dayjs from "dayjs";
import * as u from "../utils/utils.js";

/**
 * Creates a Mixpanel event with a flat shape
 * @param {Context} context - Context object containing config, defaults, etc.
 * @param {string} distinct_id - User identifier
 * @param {number} earliestTime - Unix timestamp for earliest possible event time
 * @param {Object} chosenEvent - Event configuration object
 * @param {string[]} [anonymousIds] - Array of anonymous/device IDs
 * @param {string[]} [sessionIds] - Array of session IDs
 * @param {Object} [superProps] - Super properties to add to event
 * @param {Array} [groupKeys] - Group key configurations
 * @param {boolean} [isFirstEvent] - Whether this is the user's first event
 * @param {boolean} [skipDefaults] - Whether to skip adding default properties
 * @returns {Promise<Object>} Generated event object
 */
export async function makeEvent(
    context, 
    distinct_id, 
    earliestTime, 
    chosenEvent, 
    anonymousIds = [], 
    sessionIds = [], 
    superProps = {}, 
    groupKeys = [], 
    isFirstEvent = false, 
    skipDefaults = false
) {
    // Validate required parameters
    if (!distinct_id) throw new Error("no distinct_id");
    if (!earliestTime) throw new Error("no earliestTime");
    if (!chosenEvent) throw new Error("no chosenEvent");

    // Update context metrics
    context.incrementOperations();
    context.incrementEvents();

    const { config, defaults } = context;
    const chance = u.getChance();
    
    // Extract soup configuration for time distribution
    const { mean = 0, deviation = 2, peaks = 5 } = config.soup || {};
    
    // Extract feature flags from config
    const {
        hasAndroidDevices = false,
        hasBrowser = false,
        hasCampaigns = false,
        hasDesktopDevices = false,
        hasIOSDevices = false,
        hasLocation = false
    } = config;

    // Create base event template
    const eventTemplate = {
        event: chosenEvent.event,
        source: "dm4",
        time: "",
        insert_id: "",
    };

    let defaultProps = {};

    // Add default properties based on configuration
    if (hasLocation) {
        defaultProps.location = u.pickRandom(defaults.locationsEvents());
    }
    
    if (hasBrowser) {
        defaultProps.browser = u.choose(defaults.browsers());
    }

    // Add campaigns with attribution likelihood
    if (hasCampaigns && chance.bool({ likelihood: 25 })) {
        defaultProps.campaigns = u.pickRandom(defaults.campaigns());
    }
    
    // PERFORMANCE: Use pre-computed device pool instead of rebuilding every time
    if (defaults.allDevices.length) {
        defaultProps.device = u.pickRandom(defaults.allDevices);
    }

    // Set event time using TimeSoup for realistic distribution
    if (earliestTime) {
        if (isFirstEvent) {
            // PERFORMANCE: Direct numeric calculation instead of dayjs object creation
            const shiftedTimestamp = earliestTime + context.TIME_SHIFT_SECONDS;
            eventTemplate.time = dayjs.unix(shiftedTimestamp).toISOString();
        } else {
            // Get time from TimeSoup (returns ISO string) and apply precomputed time shift
            const soupTime = u.TimeSoup(earliestTime, context.FIXED_NOW, peaks, deviation, mean);
            // PERFORMANCE: Parse ISO directly to milliseconds, add shift, convert back to ISO with one dayjs call
            const soupTimestamp = new Date(soupTime).getTime() / 1000; // Convert to unix seconds
            const shiftedTimestamp = soupTimestamp + context.TIME_SHIFT_SECONDS;
            eventTemplate.time = dayjs.unix(shiftedTimestamp).toISOString();
        }
    }

    // Add anonymous and session identifiers
    if (anonymousIds.length) {
        eventTemplate.device_id = u.pickRandom(anonymousIds);
    }
    
    if (sessionIds.length) {
        eventTemplate.session_id = u.pickRandom(sessionIds);
    }

    // Sometimes add user_id (for attribution modeling)
    if (!isFirstEvent && chance.bool({ likelihood: 42 })) {
        eventTemplate.user_id = distinct_id;
    }

    // Ensure we have either user_id or device_id
    if (!eventTemplate.user_id && !eventTemplate.device_id) {
        eventTemplate.user_id = distinct_id;
    }

    // PERFORMANCE: Process properties directly without creating intermediate object
    // Add custom properties from event configuration
    if (chosenEvent.properties) {
        const eventKeys = Object.keys(chosenEvent.properties);
        for (let i = 0; i < eventKeys.length; i++) {
            const key = eventKeys[i];
            try {
                eventTemplate[key] = u.choose(chosenEvent.properties[key]);
            } catch (e) {
                console.error(`error with ${key} in ${chosenEvent.event} event`, e);
                // Continue processing other properties
            }
        }
    }
    
    // Add super properties (override event properties if needed)
    if (superProps) {
        const superKeys = Object.keys(superProps);
        for (let i = 0; i < superKeys.length; i++) {
            const key = superKeys[i];
            try {
                eventTemplate[key] = u.choose(superProps[key]);
            } catch (e) {
                console.error(`error with ${key} in super props`, e);
                // Continue processing other properties
            }
        }
    }

    // Add default properties if not skipped
    if (!skipDefaults) {
        addDefaultProperties(eventTemplate, defaultProps);
    }

    // Add group properties
    addGroupProperties(eventTemplate, groupKeys);

    // Generate unique insert_id
	const distinctId = eventTemplate.user_id || eventTemplate.device_id || eventTemplate.distinct_id || distinct_id;
	const tuple = `${eventTemplate.event}-${eventTemplate.time}-${distinctId}`;
    eventTemplate.insert_id = u.quickHash(tuple);

    // Call hook if configured (before returning the event)
    const { hook } = config;
    if (hook) {
        const hookedEvent = await hook(eventTemplate, "event", { 
            user: { distinct_id }, 
            config 
        });
        // If hook returns a modified event, use it; otherwise use original
        if (hookedEvent && typeof hookedEvent === 'object') {
            return hookedEvent;
        }
    }

    // Note: Time shift already applied above during timestamp calculation

    return eventTemplate;
}

/**
 * Adds default properties to an event template
 * Handles complex nested property structures
 * @param {Object} eventTemplate - Event object to modify
 * @param {Object} defaultProps - Default properties to add
 */
function addDefaultProperties(eventTemplate, defaultProps) {
    for (const key in defaultProps) {
        if (Array.isArray(defaultProps[key])) {
            const choice = u.choose(defaultProps[key]);
            
            if (typeof choice === "string") {
                if (!eventTemplate[key]) eventTemplate[key] = choice;
            }
            else if (Array.isArray(choice)) {
                for (const subChoice of choice) {
                    if (!eventTemplate[key]) eventTemplate[key] = subChoice;
                }
            }
            else if (typeof choice === "object") {
                addNestedObjectProperties(eventTemplate, choice);
            }
        }
        else if (typeof defaultProps[key] === "object") {
            addNestedObjectProperties(eventTemplate, defaultProps[key]);
        }
        else {
            if (!eventTemplate[key]) eventTemplate[key] = defaultProps[key];
        }
    }
}

/**
 * Adds nested object properties to event template
 * @param {Object} eventTemplate - Event object to modify
 * @param {Object} obj - Object with properties to add
 */
function addNestedObjectProperties(eventTemplate, obj) {
    for (const subKey in obj) {
        if (typeof obj[subKey] === "string") {
            if (!eventTemplate[subKey]) eventTemplate[subKey] = obj[subKey];
        }
        else if (Array.isArray(obj[subKey])) {
            const subChoice = u.choose(obj[subKey]);
            if (!eventTemplate[subKey]) eventTemplate[subKey] = subChoice;
        }
        else if (typeof obj[subKey] === "object") {
            for (const subSubKey in obj[subKey]) {
                if (!eventTemplate[subSubKey]) {
                    eventTemplate[subSubKey] = obj[subKey][subSubKey];
                }
            }
        }
    }
}

/**
 * Adds group properties to event based on group key configuration
 * @param {Object} eventTemplate - Event object to modify
 * @param {Array} groupKeys - Array of group key configurations
 */
function addGroupProperties(eventTemplate, groupKeys) {
    for (const groupPair of groupKeys) {
        const groupKey = groupPair[0];
        const groupCardinality = groupPair[1];
        const groupEvents = groupPair[2] || [];

        // Empty array for group events means all events get the group property
        if (!groupEvents.length) {
            eventTemplate[groupKey] = u.pick(u.weighNumRange(1, groupCardinality));
        }
        
        // Only add group property if event is in the specified group events
        if (groupEvents.includes(eventTemplate.event)) {
            eventTemplate[groupKey] = u.pick(u.weighNumRange(1, groupCardinality));
        }
    }
}