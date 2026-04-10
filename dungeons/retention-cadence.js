const SEED = "kurby-retention";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);
import * as u from "../lib/utils/utils.js";
import * as v from 'ak-tools';
const chance = u.initChance(SEED);

const num_users = 100;
const days = 360;

/** @typedef {import("../types.js").Dungeon} Config */

/**
 * ═══════════════════════════════════════════════════════════════
 * DATASET OVERVIEW
 * ═══════════════════════════════════════════════════════════════
 *
 * Retention Cadence — tests behavior frequency and color-based churn.
 * - 100 users over 360 days, ~5K base events (replaced by cadenced events)
 * - 4 behavior cadences: hourly, daily, weekly, monthly
 * - Churn rates vary by user's "favorite color" (red, blue, green, yellow, purple)
 * - The everything hook REPLACES all generated events with precisely
 *   cadenced behavior events, making this a pure retention analysis dataset
 *
 * ═══════════════════════════════════════════════════════════════
 * ANALYTICS HOOKS (1 pattern — everything hook)
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. COLOR-BASED CADENCED CHURN (everything hook)
 *    All raw events are replaced with 4 cadenced behavior streams
 *    (hourly/daily/weekly/monthly). Each user's "favorite color"
 *    determines their churn likelihood per cadence:
 *    - red: high daily churn (40%)
 *    - blue: high weekly churn (40%)
 *    - green: low churn across all cadences (5%)
 *    - yellow: high monthly churn (40%)
 *    - purple: high hourly churn (40%)
 *    Churned behaviors get a "churn - X behavior" event at the churn point.
 *
 *    Mixpanel Report:
 *    - Retention: Event A: "first behavior", Event B: "daily behavior",
 *      breakdown by "favorite color"
 *      Expected: red users show ~40% daily churn, green users retain well
 *    - Insights: "churn - *" events, breakdown by "favorite color"
 *      Expected: each color dominates its respective cadence's churn events
 */

// Churn rates by favorite color per behavior type (percentage likelihood)
const CHURN_RATES = {
	red:    { hourly: 15, daily: 40, weekly: 15, monthly: 10 },
	blue:   { hourly: 15, daily: 15, weekly: 40, monthly: 10 },
	green:  { hourly: 5,  daily: 5,  weekly: 5,  monthly: 5 },
	yellow: { hourly: 15, daily: 15, weekly: 15, monthly: 40 },
	purple: { hourly: 40, daily: 15, weekly: 15, monthly: 10 },
};

// Behavior cadence definitions: [intervalAmount, intervalUnit, jitterMax, jitterUnit]
const BEHAVIORS = {
	hourly:  { interval: 1,  unit: 'hour',  jitterMax: 10, jitterUnit: 'minute' },
	daily:   { interval: 1,  unit: 'day',   jitterMax: 2,  jitterUnit: 'hour' },
	weekly:  { interval: 7,  unit: 'day',   jitterMax: 12, jitterUnit: 'hour' },
	monthly: { interval: 30, unit: 'day',   jitterMax: 2,  jitterUnit: 'day' },
};

function generateCadencedEvents(behaviorName, cadence, startTime, endTime, churnTime, userId) {
	const events = [];
	let cursor = dayjs(startTime);
	const end = dayjs(endTime);

	while (cursor.isBefore(end)) {
		if (churnTime && cursor.isAfter(churnTime)) break;

		const jitter = chance.integer({ min: -cadence.jitterMax, max: cadence.jitterMax });
		const eventTime = cursor.add(jitter, cadence.jitterUnit);

		if (eventTime.isBefore(end) && eventTime.isAfter(startTime)) {
			events.push({
				event: `${behaviorName} behavior`,
				time: eventTime.toISOString(),
				user_id: userId,
				insert_id: v.uid(12),
			});
		}

		cursor = cursor.add(cadence.interval, cadence.unit);
	}

	// Insert churn event if user churns on this behavior
	if (churnTime && dayjs(churnTime).isBefore(end)) {
		events.push({
			event: `churn - ${behaviorName} behavior`,
			time: dayjs(churnTime).toISOString(),
			user_id: userId,
			insert_id: v.uid(12),
		});
	}

	return events;
}

/** @type {Config} */
const config = {
	token: "",
	seed: "lets go",
	numDays: days,
	numEvents: num_users * 50,
	numUsers: num_users,
	hasAnonIds: false,
	hasSessionIds: false,
	format: "json",
	alsoInferFunnels: false,
	hasLocation: false,
	hasAndroidDevices: false,
	hasIOSDevices: false,
	hasDesktopDevices: false,
	hasBrowser: false,
	hasCampaigns: false,
	isAnonymous: false,
	hasAdSpend: false,
	hasAvatar: false,
	batchSize: 5_500_000,
	concurrency: 1,
	writeToDisk: false,
	percentUsersBornInDataset: 100,

	funnels: [],

	events: [
		{
			event: "first behavior",
			weight: 1,
			isFirstEvent: true,
			properties: {},
		},
		{
			event: "hourly behavior",
			weight: 40,
			properties: {},
		},
		{
			event: "daily behavior",
			weight: 30,
			properties: {},
		},
		{
			event: "weekly behavior",
			weight: 15,
			properties: {},
		},
		{
			event: "monthly behavior",
			weight: 10,
			properties: {},
		},
		{
			event: "placeholder",
			weight: 50,
			properties: {},
		},
	],

	superProps: {},

	userProps: {
		"favorite color": ["red", "blue", "green", "yellow", "purple"],
	},

	scdProps: {},
	mirrorProps: {},
	groupKeys: [],
	groupProps: {},
	lookupTables: [],

	hook: function (record, type, meta) {
		if (type === "everything") {
			if (!record.length) return record;

			const userId = record[0].user_id || record[0].device_id;
			if (!userId) return record;

			const favoriteColor = meta.profile?.["favorite color"] || "green";
			const colorChurnRates = CHURN_RATES[favoriteColor] || CHURN_RATES.green;

			// Find the time range from the raw events
			const times = record.map(e => new Date(e.time).getTime()).filter(t => !isNaN(t));
			if (!times.length) return record;
			const startTime = dayjs(Math.min(...times));
			const endTime = dayjs(Math.max(...times));
			const totalSpanHours = endTime.diff(startTime, 'hour');

			if (totalSpanHours < 1) return record;

			// Keep the "first behavior" event from the original stream
			const firstBehavior = record.find(e => e.event === "first behavior");
			const newEvents = [];

			if (firstBehavior) {
				newEvents.push(firstBehavior);
			} else {
				// Create a first behavior event at the start
				newEvents.push({
					event: "first behavior",
					time: startTime.toISOString(),
					user_id: userId,
					insert_id: v.uid(12),
				});
			}

			// For each behavior type, determine churn and generate cadenced events
			for (const [behaviorKey, cadence] of Object.entries(BEHAVIORS)) {
				const churnRate = colorChurnRates[behaviorKey];
				let churnTime = null;

				if (chance.bool({ likelihood: churnRate })) {
					// Pick churn time between 20% and 80% into the active period
					const churnOffsetHours = chance.integer({
						min: Math.floor(totalSpanHours * 0.2),
						max: Math.floor(totalSpanHours * 0.8),
					});
					churnTime = startTime.add(churnOffsetHours, 'hour');
				}

				const behaviorEvents = generateCadencedEvents(
					behaviorKey,
					cadence,
					startTime,
					endTime,
					churnTime,
					userId
				);
				newEvents.push(...behaviorEvents);
			}

			// Sort all events by time
			newEvents.sort((a, b) => new Date(a.time) - new Date(b.time));
			return newEvents;
		}

		return record;
	},
};

export default config;
