/**
 * Profile generator module
 * Creates user and group profiles with realistic properties
 */

/** @typedef {import('../../types').Context} Context */

import * as u from "../utils/utils.js";

/**
 * Creates a user or group profile by choosing from available property values
 * @param {Context} context - Context object containing config, defaults, etc.
 * @param {Object} props - Properties to include in the profile
 * @param {Object} defaults - Default values to merge with props
 * @returns {Promise<Object>} Generated profile object
 */
export async function makeProfile(context, props = {}, defaults = {}) {
    // Update operation counter
    context.incrementOperations();
    
    // Keys that should not be processed with the choose function
    const keysToNotChoose = ["anonymousIds", "sessionIds"];

    // Start with defaults
    const profile = { ...defaults };

    // Process default values first
    for (const key in profile) {
        if (keysToNotChoose.includes(key)) continue;
        
        try {
            profile[key] = u.choose(profile[key]);
        } catch (e) {
            console.error(`Error processing default property ${key}:`, e);
            // Keep original value on error
        }
    }

    // Process provided props (these override defaults)
    for (const key in props) {
        try {
            profile[key] = u.choose(props[key]);
        } catch (e) {
            console.error(`Error processing property ${key}:`, e);
            // Keep original value on error
        }
    }

    return profile;
}

/**
 * Creates a user profile with typical user properties
 * @param {Context} context - Context object
 * @param {Object} userProps - User-specific properties
 * @param {Object} baseProfile - Base profile to extend
 * @returns {Promise<Object>} Generated user profile
 */
export async function makeUserProfile(context, userProps = {}, baseProfile = {}) {
    const { config } = context;
    
    // Combine user props with any configured user properties
    const combinedProps = {
        ...config.userProps,
        ...userProps
    };
    
    return makeProfile(context, combinedProps, baseProfile);
}

/**
 * Creates a group profile with group-specific properties
 * @param {Context} context - Context object
 * @param {string} groupKey - Group identifier
 * @param {Object} groupProps - Group-specific properties
 * @param {Object} baseProfile - Base profile to extend
 * @returns {Promise<Object>} Generated group profile
 */
export async function makeGroupProfile(context, groupKey, groupProps = {}, baseProfile = {}) {
    const { config } = context;
    
    // Get group properties from config for this specific group
    const configGroupProps = config.groupProps?.[groupKey] || {};
    
    // Combine with provided props
    const combinedProps = {
        ...configGroupProps,
        ...groupProps,
        groupKey // Always include the group key
    };
    
    return makeProfile(context, combinedProps, baseProfile);
}