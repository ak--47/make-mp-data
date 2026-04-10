/**
 * User Loop Orchestrator module
 * Manages user generation and event creation workflow
 */

/** @typedef {import('../../types').Context} Context */

import dayjs from "dayjs";
import pLimit from 'p-limit';
import os from 'os';
import * as u from "../utils/utils.js";
import * as t from 'ak-tools';
import { makeEvent } from "../generators/events.js";
import { makeFunnel } from "../generators/funnels.js";
import { makeUserProfile } from "../generators/profiles.js";
import { makeSCD } from "../generators/scd.js";

/**
 * Main user generation loop that creates users, their profiles, events, and SCDs
 * @param {Context} context - Context object containing config, defaults, storage, etc.
 * @returns {Promise<void>}
 */
export async function userLoop(context) {
	const { config, storage, defaults } = context;
	const chance = u.getChance();
	const concurrency = config?.concurrency ?? 1;
	const USER_CONN = pLimit(concurrency);

	const {
		verbose,
		numUsers,
		numEvents,
		isAnonymous,
		hasAvatar,
		hasAnonIds,
		hasSessionIds,
		hasLocation,
		funnels,
		userProps,
		scdProps,
		numDays,
		percentUsersBornInDataset = 15,
		strictEventCount = false,
		bornRecentBias = 0.3, // 0 = uniform distribution, 1 = heavily biased toward recent births
	} = config;

	const { eventData, userProfilesData, scdTableData } = storage;
	const avgEvPerUser = numEvents / numUsers;
	const startTime = Date.now();

	// Create batches for parallel processing
	const batchSize = Math.max(1, Math.ceil(numUsers / concurrency));
	const userPromises = [];

	// Track if we've already logged the strict event count message
	let hasLoggedStrictCountReached = false;

	// Handle graceful shutdown on SIGINT (Ctrl+C)
	let cancelled = false;
	const onSigint = () => {
		cancelled = true;
		USER_CONN.clearQueue();
		if (verbose) console.log(`\n\nStopping generation (Ctrl+C)...\n`);
	};
	process.on('SIGINT', onSigint);

	for (let i = 0; i < numUsers; i++) {
		const userPromise = USER_CONN(async () => {
			// Bail out if cancelled
			if (cancelled) return;

			// Bail out early if strictEventCount is enabled and we've hit numEvents
			if (strictEventCount && context.getEventCount() >= numEvents) {
				if (verbose && !hasLoggedStrictCountReached) {
					console.log(`\n\u2713 Reached target of ${numEvents.toLocaleString()} events with strict event count enabled. Stopping user generation.`);
					hasLoggedStrictCountReached = true;
				}
				return;
			}

			context.incrementUserCount();
			const eps = Math.floor(context.getEventCount() / ((Date.now() - startTime) / 1000));
			const memUsed = u.bytesHuman(process.memoryUsage().heapUsed);
			const duration = u.formatDuration(Date.now() - startTime);

			if (verbose) {
				u.progress([
					["users", context.getUserCount()],
					["events", context.getEventCount()],
					["eps", eps],
					["mem", memUsed],
					["time", duration]
				]);
			}

			const userId = chance.guid();
			const user = u.generateUser(userId, { numDays, isAnonymous, hasAvatar, hasAnonIds, hasSessionIds });
			const { distinct_id, created } = user;
			const userIsBornInDataset = chance.bool({ likelihood: percentUsersBornInDataset });
			let numEventsPreformed = 0;

			if (!userIsBornInDataset) delete user.created;

			// Calculate time adjustments
			const daysShift = context.getDaysShift();

			// Apply recency bias to birth dates for users born in dataset
			// bornRecentBias: 0 = uniform distribution, 1 = heavily biased toward recent
			let adjustedCreated;
			if (userIsBornInDataset) {
				let biasedCreated = dayjs(created).subtract(daysShift, 'd');

				if (bornRecentBias !== 0) {
					// Calculate how far into the dataset this user was born (0 = start, 1 = end/recent)
					const datasetStart = dayjs.unix(global.FIXED_BEGIN);
					const datasetEnd = dayjs.unix(context.FIXED_NOW);
					const totalDuration = datasetEnd.diff(datasetStart);
					// Clamp userPosition to [0, 1] to handle edge cases from rounding in time calculations
					const userPosition = Math.max(0, Math.min(1, biasedCreated.diff(datasetStart) / totalDuration));

					let biasedPosition;
					if (bornRecentBias > 0) {
						// Positive bias: exponent < 1 shifts distribution toward 1 (recent)
						const exponent = 1 - (bornRecentBias * 0.7); // 0.3 bias -> 0.79 exponent (gentle nudge)
						biasedPosition = Math.pow(userPosition, exponent);
					} else {
						// Negative bias: mirror the power function to shift toward 0 (early)
						// -0.3 bias -> 0.79 exponent applied to (1 - position), then mirrored back
						const exponent = 1 - (Math.abs(bornRecentBias) * 0.7);
						biasedPosition = 1 - Math.pow(1 - userPosition, exponent);
					}

					// Convert back to timestamp
					biasedCreated = datasetStart.add(biasedPosition * totalDuration, 'millisecond');
				}

				adjustedCreated = biasedCreated;
				// Update user.created to match biased timestamp for profile consistency
				user.created = adjustedCreated.toISOString();
			} else {
				adjustedCreated = dayjs.unix(global.FIXED_BEGIN);
			}

			if (hasLocation) {
				const location = u.pickRandom(u.choose(defaults.locationsUsers));
				for (const key in location) {
					user[key] = location[key];
				}
			}

			// Profile creation
			const profile = await makeUserProfile(context, userProps, user);

			// Call user hook after profile creation
			if (config.hook) {
				await config.hook(profile, "user", {
					user,
					config,
					userIsBornInDataset
				});
			}

			// SCD creation
			// @ts-ignore
			const scdUserTables = t.objFilter(scdProps, (scd) => scd.type === 'user' || !scd.type);
			const scdTableKeys = Object.keys(scdUserTables);

			const userSCD = {};
			for (const [index, key] of scdTableKeys.entries()) {
				const { max = 10 } = scdProps[key];
				const mutations = chance.integer({ min: 1, max });
				let changes = await makeSCD(context, scdProps[key], key, distinct_id, mutations, created);
				userSCD[key] = changes;

				const hookResult = await config.hook(changes, "scd-pre", {
					profile,
					type: 'user',
					scd: { [key]: scdProps[key] },
					config,
					allSCDs: userSCD
				});
				if (Array.isArray(hookResult)) {
					changes = hookResult;
					userSCD[key] = changes;
				}
			}

			let numEventsThisUserWillPreform = Math.floor(chance.normal({
				mean: avgEvPerUser,
				dev: avgEvPerUser / u.integer(u.integer(2, 5), u.integer(2, 7))
			}) * 0.714159265359);

			// Power users and low-activity users logic
			chance.bool({ likelihood: 20 }) ? numEventsThisUserWillPreform *= 5 : null;
			chance.bool({ likelihood: 15 }) ? numEventsThisUserWillPreform *= 0.333 : null;
			numEventsThisUserWillPreform = Math.round(numEventsThisUserWillPreform);

			let userFirstEventTime;

			const firstFunnels = funnels.filter((f) => f.isFirstFunnel)
				.filter((f) => !f.conditions || matchConditions(profile, f.conditions))
				.reduce(weighFunnels, []);
			const usageFunnels = funnels.filter((f) => !f.isFirstFunnel)
				.filter((f) => !f.conditions || matchConditions(profile, f.conditions))
				.reduce(weighFunnels, []);

			const secondsInDay = 86400;
			const noise = () => chance.integer({ min: 0, max: secondsInDay });
			let usersEvents = [];
			let userConverted = true;

			// Pre-compute weighted events array for standalone event selection
			const weightedEvents = config.events.reduce((acc, event) => {
				const w = Math.max(1, Math.min(Math.floor(event.weight) || 1, 10));
				for (let i = 0; i < w; i++) acc.push(event);
				return acc;
			}, []);

			// Build churn event lookup: { eventName: returnLikelihood }
			const churnEvents = new Map();
			for (const ev of config.events) {
				if (ev.isChurnEvent) {
					churnEvents.set(ev.event, ev.returnLikelihood ?? 0);
				}
			}

			// PATH FOR USERS BORN IN DATASET AND PERFORMING FIRST FUNNEL
			if (firstFunnels.length && userIsBornInDataset) {
				const firstFunnel = chance.pickone(firstFunnels, user);
				const firstTime = adjustedCreated.subtract(noise(), 'seconds').unix();
				const [data, converted] = await makeFunnel(context, firstFunnel, user, firstTime, profile, userSCD);
				userConverted = converted;

				const timeShift = context.getTimeShift();
				userFirstEventTime = dayjs(data[0].time).subtract(timeShift, 'seconds').unix();
				numEventsPreformed += data.length;
				usersEvents = usersEvents.concat(data);
			} else {
				userFirstEventTime = adjustedCreated.subtract(noise(), 'seconds').unix();
			}

			// ALL SUBSEQUENT EVENTS (funnels for converted users, standalone for all)
			let userChurned = false;
			while (numEventsPreformed < numEventsThisUserWillPreform && !cancelled) {
				let newEvents;
				if (usageFunnels.length && userConverted) {
					const currentFunnel = chance.pickone(usageFunnels);
					const [data, converted] = await makeFunnel(context, currentFunnel, user, userFirstEventTime, profile, userSCD);
					numEventsPreformed += data.length;
					newEvents = data;
				} else {
					const data = await makeEvent(context, distinct_id, userFirstEventTime, u.pick(weightedEvents), user.anonymousIds, user.sessionIds, {}, config.groupKeys, true);
					numEventsPreformed++;
					newEvents = [data];
				}
				usersEvents = usersEvents.concat(newEvents);

				// Check for churn events — if user churned, they may stop generating
				if (churnEvents.size > 0) {
					const eventsToCheck = Array.isArray(newEvents[0]) ? newEvents.flat() : newEvents;
					for (const ev of eventsToCheck) {
						if (ev.event && churnEvents.has(ev.event)) {
							const returnLikelihood = churnEvents.get(ev.event);
							const userReturns = returnLikelihood > 0 && chance.bool({ likelihood: returnLikelihood * 100 });
							if (!userReturns) {
								userChurned = true;
								break;
							}
						}
					}
					if (userChurned) break;
				}
			}

			// Remove events flagged as future timestamps (before dungeon hooks see them)
			usersEvents = usersEvents.filter(e => !e._drop);

			// Hook for processing all user events
			if (config.hook) {
				const newEvents = await config.hook(usersEvents, "everything", {
					profile,
					scd: userSCD,
					config,
					userIsBornInDataset
				});
				if (Array.isArray(newEvents)) usersEvents = newEvents;
			}

			// Store all user data
			await userProfilesData.hookPush(profile);

			if (Object.keys(userSCD).length) {
				for (const [key, changesArray] of Object.entries(userSCD)) {
					for (const changes of changesArray) {
						try {
							const target = scdTableData.filter(arr => arr.scdKey === key).pop();
							await target.hookPush(changes, { profile, type: 'user' });
						}
						catch (e) {
							// This is probably a test
							const target = scdTableData[0];
							await target.hookPush(changes, { profile, type: 'user' });
						}
					}
				}
			}

			await eventData.hookPush(usersEvents, { profile });
		});

		userPromises.push(userPromise);
	}

	// Wait for all users to complete
	await Promise.all(userPromises);

	// Clean up SIGINT handler
	process.removeListener('SIGINT', onSigint);
}


export function weighFunnels(acc, funnel) {
	const weight = funnel?.weight || 1;
	for (let i = 0; i < weight; i++) {
		acc.push(funnel);
	}
	return acc;
}

export function matchConditions(profile, conditions) {
	for (const [key, value] of Object.entries(conditions)) {
		if (profile[key] !== value) return false;
	}
	return true;
}
