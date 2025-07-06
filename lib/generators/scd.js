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
    
    const { frequency, max, timing, values, type = "user" } = scdProp;
    
    // Return empty array if no values provided
    if (JSON.stringify(values) === "{}" || JSON.stringify(values) === "[]") {
        return [];
    }
    
    const scdEntries = [];
    let lastInserted = dayjs(created);
    const deltaDays = dayjs().diff(lastInserted, "day");
    const uuidKeyName = type === 'user' ? 'distinct_id' : type;

    for (let i = 0; i < mutations; i++) {
        // Stop if we've reached the current time
        if (lastInserted.isAfter(dayjs())) break;
        
        // Create profile with the SCD property
        const scd = await makeProfile(context, { [scdKey]: values }, { [uuidKeyName]: distinct_id });

        // Create SCD entry with all required properties
        const scdEntry = {
            ...scd,
            [uuidKeyName]: scd.distinct_id || distinct_id,
            startTime: null,
            insertTime: null
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
            }
        }

        if (timing === 'fuzzy') {
            scdEntry.startTime = lastInserted.toISOString();
        }

        // Set insert time (slightly after start time)
        const insertTime = lastInserted.add(u.integer(1, 9000), "seconds");
        scdEntry.insertTime = insertTime.toISOString();

        // Only add entry if all required properties are set
        if (scdEntry.hasOwnProperty('insertTime') && scdEntry.hasOwnProperty('startTime')) {
            scdEntries.push(scdEntry);
        }

        // Advance time for next entry
        lastInserted = lastInserted
            .add(u.integer(0, deltaDays), "day")
            .subtract(u.integer(1, 9000), "seconds");
    }

    // De-duplicate on startTime
    const deduped = scdEntries.filter((entry, index, self) =>
        index === self.findIndex((t) => t.startTime === entry.startTime)
    );
    
    return deduped;
}