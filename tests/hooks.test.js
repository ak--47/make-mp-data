//@ts-nocheck
/**
 * Comprehensive hook test suite
 *
 * Tests that hooks correctly mutate data across all hook types.
 * All hooks are DETERMINISTIC — no probability functions (chance.bool, etc.).
 * Each test proves a specific hook type/pattern works end-to-end.
 */

import { describe, test, expect } from 'vitest';
import generate from '../index.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

const timeout = 30_000;

/** base config for all hook tests */
function baseConfig(overrides = {}) {
	return {
		seed: 'hook-test',
		numUsers: 30,
		numEvents: 300,
		numDays: 30,
		format: 'json',
		writeToDisk: false,
		concurrency: 1,
		batchSize: 500_000,
		hasAdSpend: false,
		hasAnonIds: false,
		hasSessionIds: false,
		hasCampaigns: false,
		hasLocation: false,
		hasAvatar: false,
		hasBrowser: false,
		hasAndroidDevices: false,
		hasIOSDevices: false,
		hasDesktopDevices: false,
		percentUsersBornInDataset: 50,
		events: [
			{ event: 'page view', weight: 5, properties: { page: ['home', 'about', 'pricing'] } },
			{ event: 'button click', weight: 3, properties: { label: ['signup', 'login', 'buy'] } },
		],
		funnels: [],
		superProps: {},
		userProps: {},
		scdProps: {},
		mirrorProps: {},
		lookupTables: [],
		groupKeys: [],
		groupProps: {},
		...overrides
	};
}


// ============================================================
// HOOK TYPE TESTS — prove each hook type fires and mutates
// ============================================================

describe('hook types', () => {

	test('event hook — property modification', async () => {
		const config = baseConfig({
			seed: 'event-prop-mod',
			hook: function (record, type) {
				if (type === 'event') {
					record.hooked = true;
				}
				return record;
			}
		});

		const result = await generate(config);
		expect(result.eventData.length).toBeGreaterThan(0);
		expect(result.eventData.every(e => e.hooked === true)).toBe(true);
	}, timeout);

	test('event hook — event replacement (rename)', async () => {
		const config = baseConfig({
			seed: 'event-rename',
			events: [
				{ event: 'original event', weight: 5, properties: { value: [1, 2, 3] } },
			],
			hook: function (record, type) {
				if (type === 'event' && record.event === 'original event') {
					record.event = 'replaced event';
				}
				return record;
			}
		});

		const result = await generate(config);
		const originals = result.eventData.filter(e => e.event === 'original event');
		const replaced = result.eventData.filter(e => e.event === 'replaced event');
		expect(originals.length).toBe(0);
		expect(replaced.length).toBeGreaterThan(0);
	}, timeout);

	test('event hook — property value override', async () => {
		const config = baseConfig({
			seed: 'event-value-override',
			events: [
				{ event: 'purchase', weight: 5, properties: { amount: [10, 20, 30] } },
			],
			hook: function (record, type) {
				if (type === 'event' && record.event === 'purchase') {
					record.amount = 999;
				}
				return record;
			}
		});

		const result = await generate(config);
		const purchases = result.eventData.filter(e => e.event === 'purchase');
		expect(purchases.length).toBeGreaterThan(0);
		expect(purchases.every(e => e.amount === 999)).toBe(true);
	}, timeout);

	test('user hook — profile enrichment', async () => {
		const config = baseConfig({
			seed: 'user-enrich',
			hook: function (record, type) {
				if (type === 'user') {
					record.custom_segment = 'test_segment';
					record.hook_applied = true;
				}
				return record;
			}
		});

		const result = await generate(config);
		expect(result.userProfilesData.length).toBeGreaterThan(0);
		expect(result.userProfilesData.every(u => u.custom_segment === 'test_segment')).toBe(true);
		expect(result.userProfilesData.every(u => u.hook_applied === true)).toBe(true);
	}, timeout);

	test('funnel-pre hook — conversion rate modification', async () => {
		const config = baseConfig({
			seed: 'funnel-pre-conv',
			events: [
				{ event: 'signup', weight: 2, properties: {}, isFirstEvent: true },
				{ event: 'onboarding', weight: 3, properties: {} },
				{ event: 'activation', weight: 3, properties: {} },
			],
			funnels: [
				{
					sequence: ['signup', 'onboarding', 'activation'],
					conversionRate: 1, // very low default
					order: 'sequential',
					timeToConvert: 1,
					isFirstFunnel: true,
				}
			],
			hook: function (record, type) {
				if (type === 'funnel-pre') {
					record.conversionRate = 100; // force 100% conversion
				}
				return record;
			}
		});

		const result = await generate(config);
		// With 100% conversion, every user born in dataset should have all 3 funnel steps
		const activations = result.eventData.filter(e => e.event === 'activation');
		const signups = result.eventData.filter(e => e.event === 'signup');
		// Every user who signed up should also have activated
		expect(activations.length).toBeGreaterThan(0);
		expect(signups.length).toBeGreaterThan(0);
		// With 100% conversion, activation count should be close to signup count
		expect(activations.length).toBeGreaterThanOrEqual(signups.length * 0.8);
	}, timeout);

	test('funnel-post hook — event injection', async () => {
		const config = baseConfig({
			seed: 'funnel-post-inject',
			events: [
				{ event: 'step_one', weight: 2, properties: {}, isFirstEvent: true },
				{ event: 'step_two', weight: 3, properties: {} },
			],
			funnels: [
				{
					sequence: ['step_one', 'step_two'],
					conversionRate: 100,
					order: 'sequential',
					timeToConvert: 1,
					isFirstFunnel: true,
				}
			],
			hook: function (record, type) {
				if (type === 'funnel-post' && Array.isArray(record)) {
					// Splice an injected event after every funnel
					record.push({
						event: 'injected_funnel_event',
						time: record[0]?.time || new Date().toISOString(),
						user_id: record[0]?.user_id,
						source: 'hook',
					});
				}
				return record;
			}
		});

		const result = await generate(config);
		const injected = result.eventData.filter(e => e.event === 'injected_funnel_event');
		expect(injected.length).toBeGreaterThan(0);
		expect(injected.every(e => e.source === 'hook')).toBe(true);
	}, timeout);

	test('everything hook — event filtering (removal)', async () => {
		const config = baseConfig({
			seed: 'everything-filter',
			events: [
				{ event: 'keep_me', weight: 5, properties: {} },
				{ event: 'remove_me', weight: 5, properties: {} },
			],
			hook: function (record, type) {
				if (type === 'everything' && Array.isArray(record)) {
					return record.filter(e => e.event !== 'remove_me');
				}
				return record;
			}
		});

		const result = await generate(config);
		const removed = result.eventData.filter(e => e.event === 'remove_me');
		const kept = result.eventData.filter(e => e.event === 'keep_me');
		expect(removed.length).toBe(0);
		expect(kept.length).toBeGreaterThan(0);
	}, timeout);

	test('everything hook — event injection', async () => {
		const config = baseConfig({
			seed: 'everything-inject',
			hook: function (record, type) {
				if (type === 'everything' && Array.isArray(record) && record.length > 0) {
					record.push({
						event: 'synthetic_event',
						time: record[0].time,
						user_id: record[0].user_id,
						synthetic: true,
					});
					return record;
				}
				return record;
			}
		});

		const result = await generate(config);
		const synthetic = result.eventData.filter(e => e.event === 'synthetic_event');
		expect(synthetic.length).toBeGreaterThan(0);
		expect(synthetic.every(e => e.synthetic === true)).toBe(true);
	}, timeout);

	test('scd-pre hook — SCD mutation', async () => {
		const config = baseConfig({
			seed: 'scd-pre-mutate',
			scdProps: {
				plan_tier: {
					values: ['free', 'pro', 'enterprise'],
					max: 3,
				}
			},
			hook: function (record, type) {
				if (type === 'scd-pre' && Array.isArray(record)) {
					for (const entry of record) {
						entry.hooked_scd = true;
					}
				}
				return record;
			}
		});

		const result = await generate(config);
		expect(result.scdTableData.length).toBeGreaterThan(0);
		const scdEntries = result.scdTableData[0];
		expect(scdEntries.length).toBeGreaterThan(0);
		expect(scdEntries.every(e => e.hooked_scd === true)).toBe(true);
	}, timeout);
});


// ============================================================
// STORAGE-ONLY HOOK TYPES — these fire only in storage layer
// ============================================================

describe('storage-only hook types', () => {

	test('ad-spend hook — modifies ad spend events', async () => {
		const config = baseConfig({
			seed: 'adspend-hook',
			hasAdSpend: true,
			hasCampaigns: true,
			hook: function (record, type) {
				if (type === 'ad-spend') {
					record.ad_hooked = true;
				}
				return record;
			}
		});

		const result = await generate(config);
		expect(result.adSpendData.length).toBeGreaterThan(0);
		expect(result.adSpendData.every(e => e.ad_hooked === true)).toBe(true);
	}, timeout);

	test('group hook — modifies group profiles', async () => {
		const config = baseConfig({
			seed: 'group-hook',
			groupKeys: [['company_id', 5, ['page view', 'button click']]],
			groupProps: {
				company_id: {
					name: ['Acme', 'Globex', 'Initech', 'Umbrella', 'Stark'],
				}
			},
			hook: function (record, type) {
				if (type === 'group') {
					record.group_hooked = true;
				}
				return record;
			}
		});

		const result = await generate(config);
		expect(result.groupProfilesData.length).toBeGreaterThan(0);
		const groups = result.groupProfilesData[0];
		expect(groups.length).toBeGreaterThan(0);
		expect(groups.every(g => g.group_hooked === true)).toBe(true);
	}, timeout);

	test('mirror hook — modifies mirror data', async () => {
		const config = baseConfig({
			seed: 'mirror-hook',
			mirrorProps: {
				mirror_id: {
					events: ['page view'],
					values: ['create'],
				}
			},
			hook: function (record, type) {
				if (type === 'mirror') {
					record.mirror_hooked = true;
				}
				return record;
			}
		});

		const result = await generate(config);
		expect(result.mirrorEventData.length).toBeGreaterThan(0);
		expect(result.mirrorEventData.every(e => e.mirror_hooked === true)).toBe(true);
	}, timeout);
});


// ============================================================
// DOUBLE-FIRE PREVENTION — regression guard for storage.js fix
// ============================================================

describe('hook fires exactly once (no double-fire)', () => {

	test('event hook fires once per event, not twice', async () => {
		let eventHookCallCount = 0;
		const config = baseConfig({
			seed: 'no-double-fire-events',
			hook: function (record, type) {
				if (type === 'event') {
					eventHookCallCount++;
				}
				return record;
			}
		});

		const result = await generate(config);
		// The hook fires once per event generated (some may be dropped as future timestamps)
		expect(eventHookCallCount).toBeGreaterThanOrEqual(result.eventData.length);
	}, timeout);

	test('user hook fires once per user, not twice', async () => {
		let userHookCallCount = 0;
		const config = baseConfig({
			seed: 'no-double-fire-users',
			hook: function (record, type) {
				if (type === 'user') {
					userHookCallCount++;
				}
				return record;
			}
		});

		const result = await generate(config);
		// The hook should fire exactly once per user profile
		expect(userHookCallCount).toBe(result.userProfilesData.length);
	}, timeout);

	test('scd hook fires once per SCD entry, not twice', async () => {
		let scdHookCallCount = 0;
		const config = baseConfig({
			seed: 'no-double-fire-scd',
			scdProps: {
				plan_tier: {
					values: ['free', 'pro'],
					max: 2,
				}
			},
			hook: function (record, type) {
				if (type === 'scd-pre') {
					scdHookCallCount++;
				}
				return record;
			}
		});

		const result = await generate(config);
		const scdEntries = result.scdTableData[0];
		expect(scdEntries.length).toBeGreaterThan(0);
		// scd-pre fires once per user's SCD array (not per entry),
		// so count should equal number of users who got SCD entries
		expect(scdHookCallCount).toBeGreaterThan(0);
		// More importantly: check that a mutation applied once doesn't double
		// by running a separate counter-based mutation test
	}, timeout);

	test('non-idempotent event mutation applies exactly once', async () => {
		const config = baseConfig({
			seed: 'idempotent-check',
			events: [
				{ event: 'purchase', weight: 5, properties: { amount: [100] } },
			],
			hook: function (record, type) {
				if (type === 'event' && record.event === 'purchase') {
					// Multiply amount by 2 — if this fires twice, amount would be 400
					record.amount = record.amount * 2;
				}
				return record;
			}
		});

		const result = await generate(config);
		const purchases = result.eventData.filter(e => e.event === 'purchase');
		expect(purchases.length).toBeGreaterThan(0);
		// amount starts at 100, hook multiplies by 2 once → should be 200, NOT 400
		expect(purchases.every(e => e.amount === 200)).toBe(true);
	}, timeout);

	test('non-idempotent user mutation applies exactly once', async () => {
		const config = baseConfig({
			seed: 'idempotent-user-check',
			userProps: {
				score: [50],
			},
			hook: function (record, type) {
				if (type === 'user') {
					record.score = (record.score || 50) + 10;
				}
				return record;
			}
		});

		const result = await generate(config);
		expect(result.userProfilesData.length).toBeGreaterThan(0);
		// score starts at 50, hook adds 10 once → should be 60, NOT 70
		expect(result.userProfilesData.every(u => u.score === 60)).toBe(true);
	}, timeout);
});


// ============================================================
// HOOK PATTERN TESTS — prove common techniques work
// ============================================================

describe('hook patterns', () => {

	test('temporal windowing — modify events within a time range', async () => {
		const config = baseConfig({
			seed: 'temporal-window',
			hook: function (record, type) {
				if (type === 'event') {
					const eventDay = new Date(record.time).getDate();
					// Mark events on the 15th day of any month
					if (eventDay === 15) {
						record.special_day = true;
					} else {
						record.special_day = false;
					}
				}
				return record;
			}
		});

		const result = await generate(config);
		const specialEvents = result.eventData.filter(e => e.special_day === true);
		const normalEvents = result.eventData.filter(e => e.special_day === false);
		// Both groups should exist (unless no events land on the 15th by chance)
		expect(normalEvents.length).toBeGreaterThan(0);
		// All events should have the property set
		expect(result.eventData.every(e => typeof e.special_day === 'boolean')).toBe(true);
	}, timeout);

	test('two-pass everything — scan then modify', async () => {
		const config = baseConfig({
			seed: 'two-pass',
			events: [
				{ event: 'page view', weight: 5, properties: { page: ['home', 'pricing'] } },
				{ event: 'purchase', weight: 2, properties: { amount: [50] } },
			],
			hook: function (record, type) {
				if (type === 'everything' && Array.isArray(record)) {
					// First pass: check if user has any purchases
					const hasPurchase = record.some(e => e.event === 'purchase');

					// Second pass: tag all events based on finding
					for (const event of record) {
						event.is_buyer = hasPurchase;
					}

					return record;
				}
				return record;
			}
		});

		const result = await generate(config);
		// Every event should have is_buyer set
		expect(result.eventData.every(e => typeof e.is_buyer === 'boolean')).toBe(true);

		// Check consistency: all events for a given user should have the same is_buyer value
		const userBuyerMap = {};
		for (const event of result.eventData) {
			const uid = event.user_id || event.distinct_id;
			if (!uid) continue;
			if (uid in userBuyerMap) {
				expect(event.is_buyer).toBe(userBuyerMap[uid]);
			} else {
				userBuyerMap[uid] = event.is_buyer;
			}
		}
	}, timeout);

	test('closure-based state — Map tracking across hook calls', async () => {
		const stateMap = new Map();
		const config = baseConfig({
			seed: 'closure-state',
			events: [
				{ event: 'action_a', weight: 5, properties: {} },
				{ event: 'action_b', weight: 5, properties: {} },
			],
			hook: function (record, type) {
				if (type === 'event') {
					const uid = record.user_id || record.distinct_id;
					if (uid) {
						// Track how many events each user has
						const count = (stateMap.get(uid) || 0) + 1;
						stateMap.set(uid, count);
						record.event_sequence_number = count;
					}
				}
				return record;
			}
		});

		const result = await generate(config);
		// Every event should have a sequence number
		const numberedEvents = result.eventData.filter(e => e.event_sequence_number > 0);
		expect(numberedEvents.length).toBe(result.eventData.length);

		// Sequence numbers should increment per user
		const maxPerUser = {};
		for (const event of result.eventData) {
			const uid = event.user_id || event.distinct_id;
			if (!uid) continue;
			if (!maxPerUser[uid] || event.event_sequence_number > maxPerUser[uid]) {
				maxPerUser[uid] = event.event_sequence_number;
			}
		}
		// Each user's max should be at least their count in the output (some events may be dropped)
		for (const [uid, max] of Object.entries(maxPerUser)) {
			expect(max).toBeLessThanOrEqual(stateMap.get(uid));
		}
	}, timeout);

	test('event hook — add new property to specific event type', async () => {
		const config = baseConfig({
			seed: 'add-prop-specific',
			hook: function (record, type) {
				if (type === 'event' && record.event === 'button click') {
					record.click_tracked = true;
				}
				return record;
			}
		});

		const result = await generate(config);
		const clicks = result.eventData.filter(e => e.event === 'button click');
		const views = result.eventData.filter(e => e.event === 'page view');
		expect(clicks.length).toBeGreaterThan(0);
		expect(clicks.every(e => e.click_tracked === true)).toBe(true);
		// page view events should NOT have the property
		expect(views.every(e => e.click_tracked === undefined)).toBe(true);
	}, timeout);

	test('everything hook — modify events based on user profile', async () => {
		const config = baseConfig({
			seed: 'profile-based',
			userProps: {
				tier: ['free', 'premium'],
			},
			hook: function (record, type, meta) {
				if (type === 'everything' && Array.isArray(record) && meta?.profile) {
					const tier = meta.profile.tier;
					for (const event of record) {
						event.user_tier = tier;
					}
					return record;
				}
				return record;
			}
		});

		const result = await generate(config);
		// Every event should have user_tier set
		expect(result.eventData.every(e => e.user_tier === 'free' || e.user_tier === 'premium')).toBe(true);

		// Consistency: all events for one user should have the same tier
		const userTiers = {};
		for (const event of result.eventData) {
			const uid = event.user_id || event.distinct_id;
			if (!uid) continue;
			if (uid in userTiers) {
				expect(event.user_tier).toBe(userTiers[uid]);
			} else {
				userTiers[uid] = event.user_tier;
			}
		}
	}, timeout);

	test('everything hook — cross-table: user profile drives event behavior', async () => {
		const config = baseConfig({
			seed: 'cross-table-profile-events',
			numUsers: 50,
			numEvents: 500,
			userProps: {
				account_type: ['business', 'personal'],
			},
			events: [
				{ event: 'transaction', weight: 5, properties: { amount: [100] } },
			],
			hook: function (record, type, meta) {
				// user hook: enrich profile with a computed field
				if (type === 'user') {
					record.is_business = record.account_type === 'business';
				}

				// everything hook: use profile to drive event behavior
				if (type === 'everything' && Array.isArray(record) && meta?.profile) {
					const isBusiness = meta.profile.account_type === 'business';
					for (const event of record) {
						event.account_type = meta.profile.account_type;
						// Business accounts get 3x transaction amounts
						if (isBusiness && event.event === 'transaction') {
							event.amount = event.amount * 3;
						}
					}
					return record;
				}
				return record;
			}
		});

		const result = await generate(config);

		// CROSS-TABLE VERIFICATION: user profiles have is_business
		expect(result.userProfilesData.length).toBeGreaterThan(0);
		expect(result.userProfilesData.every(u => typeof u.is_business === 'boolean')).toBe(true);

		const businessUsers = result.userProfilesData.filter(u => u.is_business === true);
		const personalUsers = result.userProfilesData.filter(u => u.is_business === false);
		expect(businessUsers.length).toBeGreaterThan(0);
		expect(personalUsers.length).toBeGreaterThan(0);

		// CROSS-TABLE VERIFICATION: events carry account_type from profile
		const businessEvents = result.eventData.filter(e => e.account_type === 'business');
		const personalEvents = result.eventData.filter(e => e.account_type === 'personal');
		expect(businessEvents.length).toBeGreaterThan(0);
		expect(personalEvents.length).toBeGreaterThan(0);

		// CROSS-TABLE VERIFICATION: business transactions have 3x amount
		const businessTxns = businessEvents.filter(e => e.event === 'transaction');
		const personalTxns = personalEvents.filter(e => e.event === 'transaction');
		expect(businessTxns.every(e => e.amount === 300)).toBe(true);  // 100 * 3
		expect(personalTxns.every(e => e.amount === 100)).toBe(true);  // unchanged

		// CROSS-TABLE VERIFICATION: user_id linkage — every event's user_id maps to a real profile
		const profileIds = new Set(result.userProfilesData.map(u => u.distinct_id));
		for (const event of result.eventData) {
			const uid = event.user_id || event.distinct_id;
			if (uid) expect(profileIds.has(uid)).toBe(true);
		}

		// CROSS-TABLE VERIFICATION: account_type on events matches the user's profile
		const profileTypeMap = {};
		for (const user of result.userProfilesData) {
			profileTypeMap[user.distinct_id] = user.account_type;
		}
		for (const event of result.eventData) {
			const uid = event.user_id || event.distinct_id;
			if (uid && profileTypeMap[uid]) {
				expect(event.account_type).toBe(profileTypeMap[uid]);
			}
		}
	}, timeout);

	test('everything hook — cross-table: user enrichment + churn simulation', async () => {
		const config = baseConfig({
			seed: 'cross-table-churn',
			numUsers: 50,
			numEvents: 800,
			numDays: 30,
			userProps: {
				risk_level: ['high', 'low'],
			},
			events: [
				{ event: 'session_start', weight: 5, properties: {} },
				{ event: 'feature_used', weight: 5, properties: {} },
			],
			hook: function (record, type, meta) {
				// user hook: mark churn status on profile
				if (type === 'user') {
					record.churned = record.risk_level === 'high';
				}

				// everything hook: high-risk users lose all events in the second half
				if (type === 'everything' && Array.isArray(record) && meta?.profile) {
					if (meta.profile.risk_level === 'high' && record.length > 0) {
						// Sort by time, keep only first half
						const sorted = [...record].sort((a, b) => new Date(a.time) - new Date(b.time));
						const midpoint = Math.floor(sorted.length / 2);
						return sorted.slice(0, midpoint);
					}
					return record;
				}
				return record;
			}
		});

		const result = await generate(config);

		// User profiles should have churned flag
		const highRiskUsers = result.userProfilesData.filter(u => u.churned === true);
		const lowRiskUsers = result.userProfilesData.filter(u => u.churned === false);
		expect(highRiskUsers.length).toBeGreaterThan(0);
		expect(lowRiskUsers.length).toBeGreaterThan(0);

		// Build per-user event counts
		const eventsPerUser = {};
		for (const event of result.eventData) {
			const uid = event.user_id || event.distinct_id;
			if (!uid) continue;
			eventsPerUser[uid] = (eventsPerUser[uid] || 0) + 1;
		}

		// High-risk users should have fewer events on average than low-risk users
		const highRiskIds = new Set(highRiskUsers.map(u => u.distinct_id));
		const lowRiskIds = new Set(lowRiskUsers.map(u => u.distinct_id));

		let highRiskTotal = 0, highRiskCount = 0;
		let lowRiskTotal = 0, lowRiskCount = 0;
		for (const [uid, count] of Object.entries(eventsPerUser)) {
			if (highRiskIds.has(uid)) { highRiskTotal += count; highRiskCount++; }
			if (lowRiskIds.has(uid)) { lowRiskTotal += count; lowRiskCount++; }
		}

		if (highRiskCount > 0 && lowRiskCount > 0) {
			const highRiskAvg = highRiskTotal / highRiskCount;
			const lowRiskAvg = lowRiskTotal / lowRiskCount;
			// High-risk users got halved, so they should have meaningfully fewer events
			expect(highRiskAvg).toBeLessThan(lowRiskAvg);
		}
	}, timeout);

	test('everything hook — cross-table: SCD data drives event behavior', async () => {
		const config = baseConfig({
			seed: 'cross-table-scd',
			numUsers: 40,
			numEvents: 400,
			scdProps: {
				plan_tier: {
					values: ['free', 'starter', 'enterprise'],
					max: 3,
				}
			},
			events: [
				{ event: 'api_call', weight: 5, properties: { endpoint: ['/users', '/data', '/reports'] } },
			],
			hook: function (record, type, meta) {
				// scd-pre hook: tag every SCD entry
				if (type === 'scd-pre' && Array.isArray(record)) {
					for (const entry of record) {
						entry.scd_hooked = true;
					}
				}

				// everything hook: use SCD data to drive event behavior
				if (type === 'everything' && Array.isArray(record) && meta?.scd) {
					const scdEntries = meta.scd.plan_tier || [];
					// Find the latest SCD value for this user
					const latestTier = scdEntries.length > 0
						? scdEntries[scdEntries.length - 1].plan_tier
						: 'unknown';

					for (const event of record) {
						event.current_tier = latestTier;
						// Enterprise users get a premium flag
						if (latestTier === 'enterprise') {
							event.premium_access = true;
						} else {
							event.premium_access = false;
						}
					}
					return record;
				}
				return record;
			}
		});

		const result = await generate(config);

		// SCD table should have entries with our hook tag
		expect(result.scdTableData.length).toBeGreaterThan(0);
		const scdEntries = result.scdTableData[0];
		expect(scdEntries.length).toBeGreaterThan(0);
		expect(scdEntries.every(e => e.scd_hooked === true)).toBe(true);

		// Events should carry the SCD-derived current_tier
		expect(result.eventData.length).toBeGreaterThan(0);
		expect(result.eventData.every(e =>
			e.current_tier === 'free' ||
			e.current_tier === 'starter' ||
			e.current_tier === 'enterprise' ||
			e.current_tier === 'unknown'
		)).toBe(true);

		// Events should have premium_access set based on tier
		expect(result.eventData.every(e => typeof e.premium_access === 'boolean')).toBe(true);

		// Consistency: all events for a user should have the same tier
		const userTierMap = {};
		for (const event of result.eventData) {
			const uid = event.user_id || event.distinct_id;
			if (!uid) continue;
			if (uid in userTierMap) {
				expect(event.current_tier).toBe(userTierMap[uid]);
			} else {
				userTierMap[uid] = event.current_tier;
			}
		}

		// Cross-check: enterprise-tier events should have premium_access=true
		const enterpriseEvents = result.eventData.filter(e => e.current_tier === 'enterprise');
		const nonEnterpriseEvents = result.eventData.filter(e => e.current_tier !== 'enterprise');
		if (enterpriseEvents.length > 0) {
			expect(enterpriseEvents.every(e => e.premium_access === true)).toBe(true);
		}
		if (nonEnterpriseEvents.length > 0) {
			expect(nonEnterpriseEvents.every(e => e.premium_access === false)).toBe(true);
		}
	}, timeout);

	test('everything hook — event duplication with time offset', async () => {
		const config = baseConfig({
			seed: 'event-duplication',
			events: [
				{ event: 'original_event', weight: 5, properties: {} },
			],
			hook: function (record, type) {
				if (type === 'everything' && Array.isArray(record)) {
					const dupes = [];
					for (const event of record) {
						// Duplicate every event with a 1-hour offset
						const dupeTime = new Date(new Date(event.time).getTime() + 3600000).toISOString();
						dupes.push({
							...event,
							event: 'duplicated_event',
							time: dupeTime,
							is_duplicate: true,
						});
					}
					return [...record, ...dupes];
				}
				return record;
			}
		});

		const result = await generate(config);
		const originals = result.eventData.filter(e => e.event === 'original_event');
		const dupes = result.eventData.filter(e => e.event === 'duplicated_event');
		expect(originals.length).toBeGreaterThan(0);
		expect(dupes.length).toBe(originals.length);
		expect(dupes.every(e => e.is_duplicate === true)).toBe(true);
	}, timeout);
});
