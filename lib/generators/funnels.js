/**
 * Funnel generator module
 * Creates conversion sequences with realistic timing and ordering
 */

/** @typedef {import('../../types').Context} Context */

import dayjs from "dayjs";
import * as u from "../utils/utils.js";
import { makeEvent } from "./events.js";

/**
 * Creates a funnel (sequence of events) for a user with conversion logic
 * @param {Context} context - Context object containing config, defaults, etc.
 * @param {Object} funnel - Funnel configuration
 * @param {Object} user - User object with distinct_id, created, etc.
 * @param {number} firstEventTime - Unix timestamp for first event
 * @param {Object} profile - User profile object
 * @param {Object} scd - Slowly changing dimensions object
 * @returns {Promise<[Array, boolean]>} Tuple of [events, didConvert]
 */
export async function makeFunnel(context, funnel, user, firstEventTime, profile = {}, scd = {}) {
	if (!funnel) throw new Error("no funnel");
	if (!user) throw new Error("no user");

	const { config } = context;
	const chance = u.getChance();
	const { hook = async (a) => a } = config;

	// Get session start events if configured
	const sessionStartEvents = config.events?.filter(a => a.isSessionStartEvent) || [];

	// Clone funnel to avoid mutating the original object
	funnel = { ...funnel };

	// Experiment handling: if funnel.experiment === true, create 3 variants
	let experimentVariant = null;
	let experimentName = null;

	if (funnel.experiment) {
		experimentName = funnel.name + ` Experiment` || "Unnamed Funnel";

		// Evenly distribute across 3 variants (33.33% each) using seeded chance
		const randomValue = chance.floating({ min: 0, max: 1 });
		if (randomValue < 0.333) {
			// Variant A: WORSE conversion, slower
			funnel.conversionRate = Math.max(1, Math.floor(funnel.conversionRate * 0.7));
			funnel.timeToConvert = Math.max(0.1, funnel.timeToConvert * 1.5);
			experimentVariant = "A";
		} else if (randomValue < 0.666) {
			// Variant B: BETTER conversion, faster
			funnel.conversionRate = Math.min(100, Math.ceil(funnel.conversionRate * 1.3));
			funnel.timeToConvert = Math.max(0.1, funnel.timeToConvert * 0.7);
			experimentVariant = "B";
		} else {
			// Variant C: CONTROL - original values (no changes)
			experimentVariant = "C";
		}

		// Mark that this funnel has experiment metadata (used later)
		funnel._experimentName = experimentName;
		funnel._experimentVariant = experimentVariant;

		// Insert $experiment_started at beginning of sequence (clone array to avoid mutation)
		funnel.sequence = ["$experiment_started", ...funnel.sequence];
	}

	// Call pre-funnel hook
	await hook(funnel, "funnel-pre", { user, profile, scd, funnel, config, firstEventTime });

	// Extract funnel configuration
	let {
		sequence,
		conversionRate = 50,
		order = 'sequential',
		timeToConvert = 1,
		props = {},
		requireRepeats = false,
		_experimentName: expName,
		_experimentVariant: expVariant,
	} = funnel;

	const { distinct_id, created, anonymousIds = [], sessionIds = [] } = user;
	const { superProps = {}, groupKeys = [] } = config;

	// Choose properties for this funnel instance
	const chosenFunnelProps = { ...props, ...superProps };
	for (const key in props) {
		try {
			chosenFunnelProps[key] = u.choose(chosenFunnelProps[key]);
		} catch (e) {
			console.error(`error with ${key} in ${funnel.sequence.join(" > ")} funnel`, e);
		}
	}

	// Build event specifications for funnel steps
	const funnelPossibleEvents = buildFunnelEvents(context, sequence, chosenFunnelProps, expName, expVariant);

	// Handle repeat logic and conversion rate adjustment
	const { processedEvents, adjustedConversionRate } = processEventRepeats(
		funnelPossibleEvents,
		requireRepeats,
		conversionRate,
		chance
	);

	// Determine if user converts and how many steps they'll take
	const { doesUserConvert, numStepsUserWillTake } = determineConversion(
		adjustedConversionRate,
		sequence.length,
		chance
	);

	// Get steps user will actually take
	const funnelStepsUserWillTake = processedEvents.slice(0, numStepsUserWillTake);

	// Apply ordering strategy
	const funnelActualOrder = applyOrderingStrategy(
		funnelStepsUserWillTake,
		order,
		config,
		sequence
	);

	// Add timing offsets to events
	const funnelEventsWithTiming = addTimingOffsets(
		funnelActualOrder,
		timeToConvert,
		numStepsUserWillTake
	);

	// Add session start event if configured
	if (sessionStartEvents.length) {
		const sessionStartEvent = chance.pickone(sessionStartEvents);
		sessionStartEvent.relativeTimeMs = -15000; // 15 seconds before funnel
		funnelEventsWithTiming.push(sessionStartEvent);
	}

	// Generate actual events with timing
	const finalEvents = await generateFunnelEvents(
		context,
		funnelEventsWithTiming,
		distinct_id,
		firstEventTime || dayjs(created).unix(),
		anonymousIds,
		sessionIds,
		groupKeys
	);

	// Call post-funnel hook
	await hook(finalEvents, "funnel-post", { user, profile, scd, funnel, config });

	return [finalEvents, doesUserConvert];
}

/**
 * Builds event specifications for funnel steps
 * @param {Context} context - Context object
 * @param {Array} sequence - Array of event names
 * @param {Object} chosenFunnelProps - Properties to apply to all events
 * @param {string} [experimentName] - Name of experiment (if experiment is enabled)
 * @param {string} [experimentVariant] - Variant name (A, B, or C)
 * @returns {Array} Array of event specifications
 */
function buildFunnelEvents(context, sequence, chosenFunnelProps, experimentName, experimentVariant) {
	const { config } = context;

	return sequence.map((eventName) => {
		// Handle $experiment_started event specially
		if (eventName === "$experiment_started" && experimentName && experimentVariant) {
			return {
				event: "$experiment_started",
				properties: {
					"Experiment name": experimentName,
					"Variant name": experimentVariant
				}
			};
		}

		const foundEvent = config.events?.find((e) => e.event === eventName);

		// PERFORMANCE: Shallow copy instead of deepClone for better performance
		// We only need to copy the top-level structure since we're rebuilding properties anyway
		const eventSpec = foundEvent ? {
			event: foundEvent.event,
			properties: { ...foundEvent.properties }
		} : { event: eventName, properties: {} };

		// Process event properties
		for (const key in eventSpec.properties) {
			try {
				eventSpec.properties[key] = u.choose(eventSpec.properties[key]);
			} catch (e) {
				console.error(`error with ${key} in ${eventSpec.event} event`, e);
			}
		}

		// Merge funnel properties (no need to delete properties since we're creating a new object)
		eventSpec.properties = { ...eventSpec.properties, ...chosenFunnelProps };

		return eventSpec;
	});
}

/**
 * Processes event repeats and adjusts conversion rate
 * @param {Array} events - Array of event specifications
 * @param {boolean} requireRepeats - Whether repeats are required
 * @param {number} conversionRate - Base conversion rate
 * @param {Object} chance - Chance.js instance
 * @returns {Object} Object with processedEvents and adjustedConversionRate
 */
function processEventRepeats(events, requireRepeats, conversionRate, chance) {
	let adjustedConversionRate = conversionRate;

	const processedEvents = events.reduce((acc, step) => {
		if (!requireRepeats) {
			if (acc.find(e => e.event === step.event)) {
				if (chance.bool({ likelihood: 50 })) {
					adjustedConversionRate = Math.floor(adjustedConversionRate * 1.35); // Increase conversion rate
					acc.push(step);
				} else {
					adjustedConversionRate = Math.floor(adjustedConversionRate * 0.70); // Reduce conversion rate
					return acc; // Skip the step
				}
			} else {
				acc.push(step);
			}
		} else {
			acc.push(step);
		}
		return acc;
	}, []);

	// Clamp conversion rate
	if (adjustedConversionRate > 100) adjustedConversionRate = 100;
	if (adjustedConversionRate < 0) adjustedConversionRate = 0;

	return { processedEvents, adjustedConversionRate };
}

/**
 * Determines if user converts and how many steps they'll take
 * @param {number} conversionRate - Adjusted conversion rate
 * @param {number} totalSteps - Total number of steps in funnel
 * @param {Object} chance - Chance.js instance
 * @returns {Object} Object with doesUserConvert and numStepsUserWillTake
 */
function determineConversion(conversionRate, totalSteps, chance) {
	const doesUserConvert = chance.bool({ likelihood: conversionRate });
	const numStepsUserWillTake = doesUserConvert ?
		totalSteps :
		u.integer(1, totalSteps - 1);

	return { doesUserConvert, numStepsUserWillTake };
}

/**
 * Applies ordering strategy to funnel steps
 * @param {Array} steps - Funnel steps to order
 * @param {string} order - Ordering strategy
 * @param {Object} config - Configuration object
 * @param {Array} sequence - Original sequence for interrupted mode
 * @returns {Array} Ordered funnel steps
 */
function applyOrderingStrategy(steps, order, config, sequence) {
	switch (order) {
		case "sequential":
			return steps;
		case "random":
			return u.shuffleArray(steps);
		case "first-fixed":
			return u.shuffleExceptFirst(steps);
		case "last-fixed":
			return u.shuffleExceptLast(steps);
		case "first-and-last-fixed":
			return u.fixFirstAndLast(steps);
		case "middle-fixed":
			return u.shuffleOutside(steps);
		case "interrupted":
			const potentialSubstitutes = config.events
				?.filter(e => !e.isFirstEvent)
				?.filter(e => !sequence.includes(e.event)) || [];
			return u.interruptArray(steps, potentialSubstitutes);
		default:
			return steps;
	}
}

/**
 * Adds timing offsets to funnel events
 * @param {Array} events - Events to add timing to
 * @param {number} timeToConvert - Total time to convert (in hours)
 * @param {number} numSteps - Number of steps in funnel
 * @returns {Array} Events with timing information
 */
function addTimingOffsets(events, timeToConvert, numSteps) {
	const msInHour = 60000 * 60;
	let lastTimeJump = 0;

	return events.map((event, index) => {
		if (index === 0) {
			event.relativeTimeMs = 0;
			return event;
		}

		// Calculate base increment for each step
		const baseIncrement = (timeToConvert * msInHour) / numSteps;

		// Add random fluctuation
		const fluctuation = u.integer(
			-baseIncrement / u.integer(3, 5),
			baseIncrement / u.integer(3, 5)
		);

		// Ensure increasing timestamps
		const previousTime = lastTimeJump;
		const currentTime = previousTime + baseIncrement + fluctuation;
		const chosenTime = Math.max(currentTime, previousTime + 1);

		lastTimeJump = chosenTime;
		event.relativeTimeMs = chosenTime;

		return event;
	});
}

/**
 * Generates actual events with proper timing
 * @param {Context} context - Context object
 * @param {Array} eventsWithTiming - Events with timing information
 * @param {string} distinct_id - User ID
 * @param {number} earliestTime - Base timestamp
 * @param {Array} anonymousIds - Anonymous IDs
 * @param {Array} sessionIds - Session IDs
 * @param {Array} groupKeys - Group keys
 * @returns {Promise<Array>} Generated events
 */
async function generateFunnelEvents(
	context,
	eventsWithTiming,
	distinct_id,
	earliestTime,
	anonymousIds,
	sessionIds,
	groupKeys
) {
	let funnelStartTime;

	const finalEvents = await Promise.all(eventsWithTiming.map(async (event, index) => {
		const newEvent = await makeEvent(
			context,
			distinct_id,
			earliestTime,
			event,
			anonymousIds,
			sessionIds,
			{},
			groupKeys,
			false  // Let all funnel events use TimeSoup for proper time distribution
		);

		if (index === 0) {
			funnelStartTime = dayjs(newEvent.time);
			delete newEvent.relativeTimeMs;
			return newEvent;
		}

		try {
			newEvent.time = dayjs(funnelStartTime)
				.add(event.relativeTimeMs, "milliseconds")
				.toISOString();
			delete newEvent.relativeTimeMs;
			return newEvent;
		} catch (e) {
			console.error("Error setting funnel event time:", e);
			return newEvent;
		}
	}));

	return finalEvents;
}