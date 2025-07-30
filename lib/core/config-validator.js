/**
 * Configuration validation and enrichment module
 * Extracted from index.js validateDungeonConfig function
 */

import dayjs from "dayjs";
import { makeName } from "ak-tools";
import * as u from "../utils/utils.js";
import os from "os";

/**
 * Infers funnels from the provided events
 * @param {Array} events - Array of event configurations
 * @returns {Array} Array of inferred funnel configurations
 */
function inferFunnels(events) {
    const createdFunnels = [];
    const firstEvents = events.filter((e) => e.isFirstEvent).map((e) => e.event);
    const usageEvents = events.filter((e) => !e.isFirstEvent).map((e) => e.event);
    const numFunnelsToCreate = Math.ceil(usageEvents.length);
    
    /** @type {import('../../types.js').Funnel} */
    const funnelTemplate = {
        sequence: [],
        conversionRate: 50,
        order: 'sequential',
        requireRepeats: false,
        props: {},
        timeToConvert: 1,
        isFirstFunnel: false,
        weight: 1
    };
    
    // Create funnels for first events
    if (firstEvents.length) {
        for (const event of firstEvents) {
            createdFunnels.push({ 
                ...u.deepClone(funnelTemplate), 
                sequence: [event], 
                isFirstFunnel: true, 
                conversionRate: 100 
            });
        }
    }

    // At least one funnel with all usage events
    createdFunnels.push({ ...u.deepClone(funnelTemplate), sequence: usageEvents });

    // Create random funnels for the rest
    for (let i = 1; i < numFunnelsToCreate; i++) {
        /** @type {import('../../types.js').Funnel} */
        const funnel = { ...u.deepClone(funnelTemplate) };
        funnel.conversionRate = u.integer(25, 75);
        funnel.timeToConvert = u.integer(1, 10);
        funnel.weight = u.integer(1, 10);
        const sequence = u.shuffleArray(usageEvents).slice(0, u.integer(2, usageEvents.length));
        funnel.sequence = sequence;
        funnel.order = 'random';
        createdFunnels.push(funnel);
    }

    return createdFunnels;
}

/**
 * Validates and enriches a dungeon configuration object
 * @param {Object} config - Raw configuration object
 * @returns {Object} Validated and enriched configuration
 */
export function validateDungeonConfig(config) {
    const chance = u.getChance();
    
    // Extract configuration with defaults
    let {
        seed,
        numEvents = 100_000,
        numUsers = 1000,
        numDays = 30,
        epochStart = 0,
        epochEnd = dayjs().unix(),
        events = [{ event: "foo" }, { event: "bar" }, { event: "baz" }],
        superProps = { luckyNumber: [2, 2, 4, 4, 42, 42, 42, 2, 2, 4, 4, 42, 42, 42, 420] },
        funnels = [],
        userProps = {
            spiritAnimal: chance.animal.bind(chance),
        },
        scdProps = {},
        mirrorProps = {},
        groupKeys = [],
        groupProps = {},
        lookupTables = [],
        hasAnonIds = false,
        hasSessionIds = false,
        format = "csv",
        token = null,
        region = "US",
        writeToDisk = false,
        verbose = true,
        makeChart = false,
        soup = {},
        hook = (record) => record,
        hasAdSpend = false,
        hasCampaigns = false,
        hasLocation = false,
        hasAvatar = false,
        isAnonymous = false,
        hasBrowser = false,
        hasAndroidDevices = false,
        hasDesktopDevices = false,
        hasIOSDevices = false,
        alsoInferFunnels = false,
        name = "",
        batchSize = 500_000,
        concurrency
    } = config;

    // Set concurrency default only if not provided
    if (concurrency === undefined || concurrency === null) {
        concurrency = Math.min(os.cpus().length * 2, 16);
    }

    // Ensure defaults for deep objects
    if (!config.superProps) config.superProps = superProps;
    if (!config.userProps || Object.keys(config?.userProps || {})) config.userProps = userProps;

    // Setting up "TIME"
    if (epochStart && !numDays) numDays = dayjs.unix(epochEnd).diff(dayjs.unix(epochStart), "day");
    if (!epochStart && numDays) epochStart = dayjs.unix(epochEnd).subtract(numDays, "day").unix();
    if (epochStart && numDays) { } // noop
    if (!epochStart && !numDays) {
        throw new Error("Either epochStart or numDays must be provided");
    }

    // Generate simulation name
    config.simulationName = name || makeName();
    config.name = config.simulationName;

    // Validate events
    if (!events || !events.length) events = [{ event: "foo" }, { event: "bar" }, { event: "baz" }];
    
    // Convert string events to objects
    if (typeof events[0] === "string") {
        events = events.map(e => ({ event: e }));
    }

    // Handle funnel inference
    if (alsoInferFunnels) {
        const inferredFunnels = inferFunnels(events);
        funnels = [...funnels, ...inferredFunnels];
    }

    // Create funnel for events not in other funnels
    const eventContainedInFunnels = Array.from(funnels.reduce((acc, f) => {
        const events = f.sequence;
        events.forEach(event => acc.add(event));
        return acc;
    }, new Set()));

    const eventsNotInFunnels = events
        .filter(e => !e.isFirstEvent)
        .filter(e => !eventContainedInFunnels.includes(e.event))
        .map(e => e.event);
        
    if (eventsNotInFunnels.length) {
        const sequence = u.shuffleArray(eventsNotInFunnels.flatMap(event => {
            let evWeight;
            // First check the config
            if (config.events) {
                evWeight = config.events.find(e => e.event === event)?.weight || 1;
            }
            // Fallback on default
            else {
                evWeight = 1;
            }
            return Array(evWeight).fill(event);
        }));

        funnels.push({
            sequence,
            conversionRate: 50,
            order: 'random',
            timeToConvert: 24 * 14,
            requireRepeats: false,
        });
    }

    // Event validation 
    const validatedEvents = u.validateEventConfig(events);
    
    // Build final config object
    const validatedConfig = {
        ...config,
        concurrency,
        funnels,
        batchSize,
        seed,
        numEvents,
        numUsers,
        numDays,
        epochStart,
        epochEnd,
        events: validatedEvents,
        superProps,
        userProps,
        scdProps,
        mirrorProps,
        groupKeys,
        groupProps,
        lookupTables,
        hasAnonIds,
        hasSessionIds,
        format,
        token,
        region,
        writeToDisk,
        verbose,
        makeChart,
        soup,
        hook,
        hasAdSpend,
        hasCampaigns,
        hasLocation,
        hasAvatar,
        isAnonymous,
        hasBrowser,
        hasAndroidDevices,
        hasDesktopDevices,
        hasIOSDevices,
        simulationName: config.simulationName,
        name: config.name
    };

    return validatedConfig;
}

/**
 * Validates configuration for required fields
 * @param {Object} config - Configuration to validate
 * @throws {Error} If required fields are missing
 */
export function validateRequiredConfig(config) {
    if (!config) {
        throw new Error("Configuration is required");
    }
    
    if (typeof config !== 'object') {
        throw new Error("Configuration must be an object");
    }
    
    // Could add more specific validation here
    return true;
}

export { inferFunnels };