/**
 * Slowly Changing Dimensions (SCD) generator module
 * Creates time-series data showing how properties change over time
 */

/** @typedef {import('../../types').Context} Context */

import dayjs from "dayjs";
import * as u from "../utils/utils.js";
import { makeProfile } from "./profiles.js";

/**
 * Creates SCD (Slowly Changing Dimensions) entries for a given property
 * @param {Context} context - Context object containing config, defaults, etc.
 * @param {Array|Object} scdProp - SCD property configuration or simple array of values
 * @param {string} scdKey - Key name for the SCD property
 * @param {string} distinct_id - User/entity identifier
 * @param {number} mutations - Number of mutations to create
 * @param {string | number} created - Creation timestamp for the entity
 * @returns {Promise<Array>} Array of SCD entries
 */
export async function makeSCD(context, scdProp, scdKey, distinct_id, mutations, created) {
    // Convert simple array to full configuration object
    if (Array.isArray(scdProp)) {
        scdProp = { 
            values: scdProp, 
            frequency: 'week', 
            max: 10, 
            timing: 'fuzzy', 
            type: 'user' 
        };
    }
	if (typeof created === 'number') created = dayjs.unix(created).toISOString();
    
    const {
        frequency = 'day',     // Default to daily frequency
        max = 10,             // Default max mutations
        timing = 'fuzzy',     // Default to fuzzy timing
        values,
        type = "user"
    } = scdProp;
    
    // Return empty array if no values provided
    if (!values || (Array.isArray(values) && values.length === 0) ||
        (typeof values === 'object' && Object.keys(values).length === 0)) {
        return [];
    }

    const scdEntries = [];
    let lastInserted = dayjs(created);
    const now = dayjs();
    const deltaDays = now.diff(lastInserted, "day");
    const uuidKeyName = type === 'user' ? 'distinct_id' : type;
    let lastStartTime = null; // Track for monotonic ordering

    for (let i = 0; i < mutations; i++) {
        // Stop if we've reached the current time
        if (lastInserted.isAfter(now)) break;

        // Create profile with the SCD property
        const scd = await makeProfile(context, { [scdKey]: values }, { [uuidKeyName]: distinct_id });

        // Create SCD entry with all required properties
        const scdEntry = {
            ...scd,
            [uuidKeyName]: scd.distinct_id || distinct_id,
            startTime: null,
            insertTime: null,
            time: null // Required field for Mixpanel SCD import
        };

        // Set start time based on timing strategy
        if (timing === 'fixed') {
            switch (frequency) {
                case "day":
                    scdEntry.startTime = lastInserted.add(1, "day").startOf('day').toISOString();
                    break;
                case "week":
                    scdEntry.startTime = lastInserted.add(1, "week").startOf('week').toISOString();
                    break;
                case "month":
                    scdEntry.startTime = lastInserted.add(1, "month").startOf('month').toISOString();
                    break;
                case "year":
                    scdEntry.startTime = lastInserted.add(1, "year").startOf('year').toISOString();
                    break;
            }
        }

        if (timing === 'fuzzy') {
            scdEntry.startTime = lastInserted.toISOString();
        }

        // Enforce monotonic ordering — startTime must advance
        if (lastStartTime && scdEntry.startTime && scdEntry.startTime <= lastStartTime) {
            scdEntry.startTime = dayjs(lastStartTime).add(1, "second").toISOString();
        }
        lastStartTime = scdEntry.startTime;

        // Set insert time (slightly after start time)
        const insertTime = dayjs(scdEntry.startTime).add(u.integer(1, 9000), "seconds");
        scdEntry.insertTime = insertTime.toISOString();

        // Set the time field for Mixpanel SCD import (uses startTime)
        scdEntry.time = scdEntry.startTime;

        // Only add entry if all required properties are set
        if (scdEntry.startTime && scdEntry.insertTime && scdEntry.time) {
            scdEntries.push(scdEntry);
        }

        // Advance time for next entry — scale step size to available range
        if (deltaDays > 1) {
            const advance = Math.max(1, u.integer(0, Math.ceil(deltaDays / mutations)));
            lastInserted = dayjs(scdEntry.startTime).add(advance, "day");
        } else {
            // Short range: advance by hours instead of days
            const advance = Math.max(1, u.integer(1, 12));
            lastInserted = dayjs(scdEntry.startTime).add(advance, "hour");
        }
    }

    return scdEntries;
}