/**
 * Configuration validation and enrichment module
 * Extracted from index.js validateDungeonConfig function
 */

/** @typedef {import('../../types.js').Dungeon} Dungeon */
/** @typedef {import('../../types.js').EventConfig} EventConfig */
/** @typedef {import('../../types.js').Context} Context */
/** @typedef {import('../../types.js').Funnel} Funnel */

import dayjs from "dayjs";
import { makeName } from "ak-tools";
import * as u from "../utils/utils.js";

/**
 * Infers funnels from the provided events
 * @param {EventConfig[]} events - Array of event configurations
 * @returns {Funnel[]} Array of inferred funnel configurations
 */
function inferFunnels(events) {
	const createdFunnels = [];
	const firstEvents = events.filter((e) => e.isFirstEvent).map((e) => e.event);
	const strictEvents = events.filter((e) => e.isStrictEvent).map((e) => e.event);
	const usageEvents = events
		.filter((e) => !e.isFirstEvent && !e.isStrictEvent)
		.map((e) => e.event);
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
		funnel.conversionRate = u.integer(10, 50);
		funnel.timeToConvert = u.integer(24, 72);
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
 * @param {Partial<Dungeon>} config - Raw configuration object
 * @returns {Dungeon} Validated and enriched configuration
 */
export function validateDungeonConfig(config) {
	const chance = u.getChance();

	// Transform SCD props to regular props if credentials are missing
	// This MUST happen BEFORE we extract values from the config
	transformSCDPropsWithoutCredentials(config);

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
		batchSize = 2_500_000,
		concurrency = 1,
		strictEventCount = false
	} = config;

	// Allow concurrency override from config (default is now 1)
	if (config.concurrency === undefined || config.concurrency === null) {
		concurrency = 1;
	}

	// Force concurrency to 1 when strictEventCount is enabled
	// This ensures the bailout check works correctly without race conditions
	if (strictEventCount && concurrency !== 1) {
		concurrency = 1;
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

	// Use provided name if non-empty string, otherwise generate one
	if (!name || name === "") {
		name = makeName();
	}

	// Convert string hook to function
	if (typeof hook === 'string') {
		try {
			// Use eval in a controlled manner to convert the string to a function
			// The string should be: function(record, type, meta) { ... }
			// eslint-disable-next-line no-eval
			hook = eval(`(${hook})`);

			// Validate it's actually a function
			if (typeof hook !== 'function') {
				throw new Error('Hook string did not evaluate to a function');
			}
		} catch (error) {
			console.warn(`\u26a0\ufe0f Failed to convert hook string to function: ${error.message}`);
			console.warn('Using default pass-through hook');
			hook = (record) => record;
		}
	}

	// Ensure hook is a function
	if (typeof hook !== 'function') {
		console.warn('\u26a0\ufe0f Hook is not a function, using default pass-through hook');
		hook = (record) => record;
	}

	// Validate events
	if (!events || !events.length) events = [{ event: "foo" }, { event: "bar" }, { event: "baz" }];

	// Convert string events to objects  
	if (typeof events[0] === "string") {
		events = events.map(e => ({ event: /** @type {string} */ (e) }));
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
			// Clamp weight to reasonable range (1-10) and ensure integer
			evWeight = Math.max(1, Math.min(Math.floor(evWeight) || 1, 10));
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

	// ensure every event in funnel sequence exists in our eventConfig
	const eventInFunnels = Array.from(new Set(funnels.map(funnel => funnel.sequence).flat()));

	const definedEvents = events.map(e => e.event);
	const missingEvents = eventInFunnels.filter(event => !definedEvents.includes(event));
	if (missingEvents.length) {
		throw new Error(`Funnel sequences contain events that are not defined in the events config:\n\n${missingEvents.join(', ')}\n\nPlease ensure all events in funnel sequences are defined in the events array.`);
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
		name,
		makeChart,
		strictEventCount
	};

	return validatedConfig;
}

/**
 * Validates configuration for required fields
 * @param {Object} config - Configuration to validate
 * @throws {Error} If required fields are missing
 */
/**
 * Validates required configuration parameters
 * @param {Dungeon} config - Configuration object to validate
 * @returns {boolean} True if validation passes
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

/**
 * Transforms SCD properties to regular user/group properties when service account credentials are missing
 * ONLY applies to UI jobs - programmatic usage always generates SCD files
 * @param {Partial<Dungeon>} config - Configuration object
 * @returns {void} Modifies config in place
 */
function transformSCDPropsWithoutCredentials(config) {
	const { serviceAccount, projectId, serviceSecret, scdProps, isUIJob, token } = config;

	// If no SCD props configured, nothing to validate
	if (!scdProps || Object.keys(scdProps).length === 0) {
		return;
	}

	// If we have all credentials, SCD import can proceed
	if (serviceAccount && projectId && serviceSecret) {
		return;
	}

	// Missing credentials - handle based on job type
	if (!isUIJob) {
		// For programmatic/CLI usage, throw an error if trying to send SCDs to Mixpanel without credentials
		if (token) {
			throw new Error(
				'Configuration error: SCD properties are configured but service credentials are missing.\n' +
				'To import SCD data to Mixpanel, you must provide:\n' +
				'  - serviceAccount: Your Mixpanel service account username\n' +
				'  - serviceSecret: Your Mixpanel service account secret\n' +
				'  - projectId: Your Mixpanel project ID\n' +
				'Without these credentials, SCD data cannot be imported to Mixpanel.'
			);
		}
		// If not sending to Mixpanel (no token), allow generation for testing
		return;
	}

	// UI job without credentials - convert SCD props to regular props
	console.log('\u26a0\ufe0f  Service account credentials missing - converting SCD properties to static properties');

	// Ensure userProps and groupProps exist
	if (!config.userProps) config.userProps = {};
	if (!config.groupProps) config.groupProps = {};

	// Process each SCD property
	for (const [propKey, scdProp] of Object.entries(scdProps)) {
		const { type = "user", values } = scdProp;

		// Skip if no values
		if (!values || JSON.stringify(values) === "{}" || JSON.stringify(values) === "[]") {
			continue;
		}

		// Determine if this is a user or group property
		if (type === "user") {
			// Add to userProps
			config.userProps[propKey] = values;
			console.log(`  \u2713 Converted user SCD property: ${propKey}`);
		} else {
			// Add to groupProps for the specific group type
			if (!config.groupProps[type]) {
				config.groupProps[type] = {};
			}
			config.groupProps[type][propKey] = values;
			console.log(`  \u2713 Converted group SCD property: ${propKey} (${type})`);
		}
	}

	// Clear out scdProps since we've converted everything
	config.scdProps = {};
	console.log('\u2713 SCD properties converted to static properties\n');
}

export { inferFunnels, transformSCDPropsWithoutCredentials };