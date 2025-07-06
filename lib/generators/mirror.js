/**
 * Mirror dataset generator module
 * Creates mirror datasets in a future state with different transformation strategies
 */

/** @typedef {import('../../types').Context} Context */

import dayjs from "dayjs";
import { clone } from "ak-tools";
import * as u from "../utils/utils.js";

/**
 * Takes event data and creates mirror datasets in a future state
 * depending on the mirror strategy configuration
 * @param {Context} context - Context object containing config, defaults, etc.
 * @returns {Promise<void>}
 */
export async function makeMirror(context) {
    const { config, storage } = context;
    const { mirrorProps } = config;
    const { eventData, mirrorEventData } = storage;
    
    if (!mirrorProps || Object.keys(mirrorProps).length === 0) {
        return; // No mirror properties configured
    }
    
    const now = dayjs();

    for (const oldEvent of eventData) {
        let newEvent = null;
        const eventTime = dayjs(oldEvent.time);
        const delta = now.diff(eventTime, "day");

        for (const mirrorProp in mirrorProps) {
            const prop = mirrorProps[mirrorProp];
            const { 
                daysUnfilled = 7, 
                events = "*", 
                strategy = "create", 
                values = [] 
            } = prop;
            
            // Check if this event should be processed
            if (shouldProcessEvent(oldEvent.event, events)) {
                // Clone event only when needed
                if (!newEvent) {
                    newEvent = clone(oldEvent);
                }

                // Apply the specified strategy
                applyMirrorStrategy(
                    strategy, 
                    newEvent, 
                    oldEvent, 
                    mirrorProp, 
                    values, 
                    delta, 
                    daysUnfilled
                );
            }
        }

        // Push the processed event (or original if no changes)
        const mirrorDataPoint = newEvent || oldEvent;
        await mirrorEventData.hookPush(mirrorDataPoint);
    }
}

/**
 * Determines if an event should be processed based on event filter
 * @param {string} eventName - Name of the event to check
 * @param {string|Array} eventFilter - Event filter ("*" for all, or array of event names)
 * @returns {boolean} True if event should be processed
 */
function shouldProcessEvent(eventName, eventFilter) {
    if (eventFilter === "*") {
        return true;
    }
    
    if (Array.isArray(eventFilter)) {
        return eventFilter.includes(eventName);
    }
    
    return false;
}

/**
 * Applies the specified mirror strategy to an event
 * @param {string} strategy - Mirror strategy to apply
 * @param {Object} newEvent - Event object to modify
 * @param {Object} oldEvent - Original event object
 * @param {string} propName - Property name to modify
 * @param {Array} values - Possible values for the property
 * @param {number} delta - Days between event time and now
 * @param {number} daysUnfilled - Days threshold for fill strategy
 */
function applyMirrorStrategy(strategy, newEvent, oldEvent, propName, values, delta, daysUnfilled) {
    switch (strategy) {
        case "create":
            // Always add the property with a random value
            newEvent[propName] = u.choose(values);
            break;
            
        case "delete":
            // Remove the property from the event
            delete newEvent[propName];
            break;
            
        case "fill":
            // Fill missing properties if enough time has passed
            if (delta >= daysUnfilled) {
                oldEvent[propName] = u.choose(values);
            }
            newEvent[propName] = u.choose(values);
            break;
            
        case "update":
            // Update only if property doesn't exist
            if (!oldEvent[propName]) {
                newEvent[propName] = u.choose(values);
            } else {
                newEvent[propName] = oldEvent[propName];
            }
            break;
            
        default:
            throw new Error(`Unknown mirror strategy: ${strategy}`);
    }
}

/**
 * Validates mirror properties configuration
 * @param {Object} mirrorProps - Mirror properties configuration to validate
 * @returns {boolean} True if valid, throws error if invalid
 */
export function validateMirrorProps(mirrorProps) {
    if (!mirrorProps || typeof mirrorProps !== 'object') {
        return true; // Mirror props are optional
    }
    
    const validStrategies = ['create', 'delete', 'fill', 'update'];
    
    for (const [propName, config] of Object.entries(mirrorProps)) {
        if (!config || typeof config !== 'object') {
            throw new Error(`Mirror property '${propName}' must have a configuration object`);
        }
        
        const { strategy = 'create', values = [], events = '*', daysUnfilled = 7 } = config;
        
        if (!validStrategies.includes(strategy)) {
            throw new Error(`Invalid mirror strategy '${strategy}' for property '${propName}'. Must be one of: ${validStrategies.join(', ')}`);
        }
        
        if (strategy !== 'delete' && (!values || !Array.isArray(values) || values.length === 0)) {
            throw new Error(`Mirror property '${propName}' with strategy '${strategy}' must have non-empty values array`);
        }
        
        if (events !== '*' && (!Array.isArray(events) || events.length === 0)) {
            throw new Error(`Mirror property '${propName}' events filter must be "*" or non-empty array`);
        }
        
        if (typeof daysUnfilled !== 'number' || daysUnfilled < 0) {
            throw new Error(`Mirror property '${propName}' daysUnfilled must be a non-negative number`);
        }
    }
    
    return true;
}