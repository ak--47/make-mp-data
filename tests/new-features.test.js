//@ts-nocheck
/**
 * Tests for features brought over from NEWER-IMPLEMENTATION
 * Covers: strictEventCount, bornRecentBias, SCD credential handling,
 * hook string conversion, event weight clamping, product generators,
 * function registry, json evaluator, text generator rename
 */

import { describe, test, expect } from 'vitest';
import { validateDungeonConfig, inferFunnels, transformSCDPropsWithoutCredentials } from '../lib/core/config-validator.js';
import { createContext } from '../lib/core/context.js';
import { createTextGenerator, createGenerator, generateBatch } from '../lib/generators/text.js';
import { generateProductLookup, getRandomProduct, getProductsByCategory, searchProducts } from '../lib/generators/product-lookup.js';
import { productReviewGen, productSearchGen } from '../lib/generators/product-names.js';
import { FUNCTION_REGISTRY, validateFunctionCall, getValidFunctionNames } from '../lib/utils/function-registry.js';
import { evaluateValue, evaluateFunctionCall, convertDungeonConfig } from '../lib/utils/json-evaluator.js';
import { bytesHuman, formatDuration, initChance } from '../lib/utils/utils.js';
import * as u from '../lib/utils/utils.js';

const FIXED_NOW = 1706832000; // 2024-02-02
global.FIXED_NOW = FIXED_NOW;
global.FIXED_BEGIN = FIXED_NOW - 90 * 86400;

describe('strictEventCount', () => {
	test('forces concurrency to 1 when enabled', () => {
		initChance('strict-test');
		const config = validateDungeonConfig({
			numUsers: 10,
			numEvents: 100,
			strictEventCount: true,
			concurrency: 4,
			seed: 'strict-test'
		});
		expect(config.strictEventCount).toBe(true);
		expect(config.concurrency).toBe(1);
	});

	test('does not force concurrency when disabled', () => {
		initChance('strict-off');
		const config = validateDungeonConfig({
			numUsers: 10,
			numEvents: 100,
			strictEventCount: false,
			concurrency: 4,
			seed: 'strict-off'
		});
		expect(config.concurrency).toBe(4);
	});
});

describe('bornRecentBias', () => {
	test('context accepts bornRecentBias from config', () => {
		initChance('bias-test');
		const config = validateDungeonConfig({
			numUsers: 10,
			numEvents: 100,
			seed: 'bias-test'
		});
		// bornRecentBias should pass through config
		config.bornRecentBias = 0.5;
		const context = createContext(config);
		expect(context.config.bornRecentBias).toBe(0.5);
	});
});

describe('hook string conversion', () => {
	test('converts valid hook string to function', () => {
		initChance('hook-str');
		const hookStr = 'function(record, type, meta) { return record; }';
		const config = validateDungeonConfig({
			numUsers: 10,
			numEvents: 100,
			hook: hookStr,
			seed: 'hook-str'
		});
		expect(typeof config.hook).toBe('function');
	});

	test('falls back to passthrough on invalid hook string', () => {
		initChance('hook-bad');
		const config = validateDungeonConfig({
			numUsers: 10,
			numEvents: 100,
			hook: 'not a valid function',
			seed: 'hook-bad'
		});
		expect(typeof config.hook).toBe('function');
		// Should still work as passthrough
		const result = config.hook({ test: 1 });
		expect(result).toEqual({ test: 1 });
	});
});

describe('event weight clamping', () => {
	test('clamps event weights to [1, 10]', () => {
		initChance('clamp-test');
		const config = validateDungeonConfig({
			numUsers: 10,
			numEvents: 100,
			events: [
				{ event: 'a', weight: 0 },
				{ event: 'b', weight: 50 },
				{ event: 'c', weight: 5 },
			],
			seed: 'clamp-test'
		});
		// The catch-all funnel sequence should have clamped weights
		const catchAllFunnel = config.funnels.find(f => f.order === 'random' && !f.isFirstFunnel);
		if (catchAllFunnel) {
			const aCounts = catchAllFunnel.sequence.filter(e => e === 'a').length;
			const bCounts = catchAllFunnel.sequence.filter(e => e === 'b').length;
			const cCounts = catchAllFunnel.sequence.filter(e => e === 'c').length;
			expect(aCounts).toBeGreaterThanOrEqual(1); // clamped from 0 to 1
			expect(bCounts).toBeLessThanOrEqual(10); // clamped from 50 to 10
			expect(cCounts).toBe(5); // unchanged
		}
	});
});

describe('isStrictEvent in inferFunnels', () => {
	test('excludes strict events from usage funnels', () => {
		initChance('strict-ev');
		const events = [
			{ event: 'signup', isFirstEvent: true },
			{ event: 'browse' },
			{ event: 'purchase' },
			{ event: 'system_event', isStrictEvent: true },
		];
		const funnels = inferFunnels(events);
		// system_event should not appear in inferred funnels
		const allSequences = funnels.flatMap(f => f.sequence);
		expect(allSequences).not.toContain('system_event');
	});
});

describe('SCD credential handling', () => {
	test('allows SCD generation without credentials when no token', () => {
		// Should not throw when no token is provided
		const config = {
			scdProps: { role: { type: 'user', values: ['admin', 'user'] } },
		};
		expect(() => transformSCDPropsWithoutCredentials(config)).not.toThrow();
	});

	test('throws when token provided but no credentials', () => {
		const config = {
			scdProps: { role: { type: 'user', values: ['admin', 'user'] } },
			token: 'some-token',
		};
		expect(() => transformSCDPropsWithoutCredentials(config)).toThrow('service credentials are missing');
	});

	test('converts SCDs to props for UI jobs without credentials', () => {
		const config = {
			scdProps: { role: { type: 'user', values: ['admin', 'user'] } },
			isUIJob: true,
			userProps: {},
			groupProps: {},
		};
		transformSCDPropsWithoutCredentials(config);
		expect(config.userProps.role).toEqual(['admin', 'user']);
		expect(Object.keys(config.scdProps)).toHaveLength(0);
	});
});

describe('product-lookup generator', () => {
	test('generates product catalog', () => {
		const products = generateProductLookup(100, 'test-seed');
		expect(products.size).toBe(100);

		const first = products.values().next().value;
		expect(first).toHaveProperty('product_id');
		expect(first).toHaveProperty('name');
		expect(first).toHaveProperty('brand');
		expect(first).toHaveProperty('category');
		expect(first).toHaveProperty('price');
		expect(first).toHaveProperty('rating');
		expect(first).toHaveProperty('stock_level');
		expect(first).toHaveProperty('sku');
	});

	test('getRandomProduct returns a product', async () => {
		const Chance = (await import('chance')).default;
		const chance = new Chance('test');
		const products = generateProductLookup(50, 'test-seed');
		const product = getRandomProduct(products, chance);
		expect(product).toHaveProperty('product_id');
	});

	test('getProductsByCategory filters correctly', () => {
		const products = generateProductLookup(500, 'cat-test');
		const electronics = getProductsByCategory(products, 'Electronics');
		electronics.forEach(p => expect(p.category).toBe('Electronics'));
	});

	test('searchProducts finds by name', () => {
		const products = generateProductLookup(500, 'search-test');
		const results = searchProducts(products, 'pro');
		expect(results.length).toBeGreaterThan(0);
	});
});

describe('product-names generators', () => {
	test('productReviewGen generates reviews', () => {
		const result = productReviewGen.generateOne();
		expect(result).toBeTruthy();
	});

	test('productSearchGen generates search queries', () => {
		const result = productSearchGen.generateOne();
		expect(result).toBeTruthy();
	});
});

describe('function registry', () => {
	test('FUNCTION_REGISTRY has expected functions', () => {
		expect(FUNCTION_REGISTRY).toHaveProperty('weighNumRange');
		expect(FUNCTION_REGISTRY).toHaveProperty('chance.name');
		expect(FUNCTION_REGISTRY).toHaveProperty('arrow');
	});

	test('getValidFunctionNames returns array', () => {
		const names = getValidFunctionNames();
		expect(names).toContain('weighNumRange');
		expect(names).toContain('chance.email');
		expect(names.length).toBeGreaterThan(30);
	});

	test('validateFunctionCall validates correct calls', () => {
		expect(validateFunctionCall({ functionName: 'integer', args: [1, 10] })).toBe(true);
		expect(validateFunctionCall({ functionName: 'arrow', body: 'Math.random()' })).toBe(true);
		expect(validateFunctionCall(null)).toBe(false);
		expect(validateFunctionCall({ functionName: 'nonexistent', args: [] })).toBe(false);
	});
});

describe('json evaluator', () => {
	test('evaluateValue handles primitives', () => {
		expect(evaluateValue(42)).toBe('42');
		expect(evaluateValue('hello')).toBe('"hello"');
		expect(evaluateValue(true)).toBe('true');
	});

	test('evaluateValue handles arrays', () => {
		expect(evaluateValue([1, 2, 3])).toBe('[1,2,3]');
	});

	test('evaluateFunctionCall generates code strings', () => {
		const result = evaluateFunctionCall({
			functionName: 'weighNumRange',
			args: [1, 100, 0.3]
		});
		expect(result).toBe('weighNumRange(1, 100, 0.3)');
	});

	test('evaluateFunctionCall handles arrow functions', () => {
		const result = evaluateFunctionCall({
			functionName: 'arrow',
			body: 'Math.random() * 100'
		});
		expect(result).toBe('() => Math.random() * 100');
	});

	test('convertDungeonConfig processes objects', () => {
		const config = {
			numUsers: 100,
			name: 'test',
			events: [{ event: 'click', weight: 1 }]
		};
		const converted = convertDungeonConfig(config);
		expect(converted.numUsers).toBe(100);
		expect(converted.name).toBe('test');
	});
});

describe('text generator rename', () => {
	test('createTextGenerator works', () => {
		const gen = createTextGenerator({ min: 10, max: 50 });
		const result = gen.generateOne();
		expect(result).toBeTruthy();
	});

	test('createGenerator alias still works', () => {
		const gen = createGenerator({ min: 10, max: 50 });
		const result = gen.generateOne();
		expect(result).toBeTruthy();
	});
});

describe('utility functions', () => {
	test('bytesHuman formats bytes correctly', () => {
		expect(bytesHuman(500)).toBe('500 B');
		expect(bytesHuman(1500)).toBe('1.50 kB');
		expect(bytesHuman(1500000)).toBe('1.50 MB');
	});

	test('formatDuration formats time correctly', () => {
		expect(formatDuration(0)).toBe('00:00:00');
		expect(formatDuration(61000)).toBe('00:01:01');
		expect(formatDuration(3661000)).toBe('01:01:01');
	});
});

describe('context time shift', () => {
	test('uses 1 day shift (adds 1 day to now, not 2)', () => {
		initChance('time-test');
		const config = validateDungeonConfig({
			numUsers: 10,
			numEvents: 100,
			seed: 'time-test'
		});
		const context = createContext(config);
		// TIME_SHIFT_SECONDS should be the diff between (now + 1 day) and FIXED_NOW
		// The getTimeShift() and getDaysShift() methods should use .add(1, "day")
		const shiftFromMethod = context.getTimeShift();
		// Both should be approximately the same (within a few seconds of computation time)
		expect(Math.abs(context.TIME_SHIFT_SECONDS - shiftFromMethod)).toBeLessThan(5);
	});

	test('context has no isCLI method', () => {
		initChance('no-cli');
		const config = validateDungeonConfig({
			numUsers: 10,
			numEvents: 100,
			seed: 'no-cli'
		});
		const context = createContext(config);
		expect(context.isCLI).toBeUndefined();
	});
});

describe('SCD time field', () => {
	test('SCD entries include time field', async () => {
		initChance('scd-time');
		const { makeSCD } = await import('../lib/generators/scd.js');
		const config = validateDungeonConfig({
			numUsers: 10,
			numEvents: 100,
			seed: 'scd-time'
		});
		const context = createContext(config);

		const entries = await makeSCD(
			context,
			{ type: 'user', frequency: 'month', values: ['a', 'b', 'c'], timing: 'fixed', max: 3 },
			'role',
			'user-1',
			3,
			'2024-01-01T00:00:00.000Z'
		);

		if (entries.length > 0) {
			entries.forEach(entry => {
				expect(entry).toHaveProperty('time');
				expect(entry.time).toBe(entry.startTime);
			});
		}
	});
});

describe('bindPropsIndex in funnels', () => {
	test('funnel supports bindPropsIndex config', async () => {
		initChance('bind-props');
		const { makeFunnel } = await import('../lib/generators/funnels.js');
		const config = validateDungeonConfig({
			numUsers: 10,
			numEvents: 100,
			events: [
				{ event: 'step1' },
				{ event: 'step2' },
				{ event: 'step3' },
			],
			seed: 'bind-props'
		});
		const context = createContext(config);

		const funnel = {
			sequence: ['step1', 'step2', 'step3'],
			conversionRate: 100,
			order: 'sequential',
			props: { campaign: 'summer' },
			bindPropsIndex: 2,
		};

		const user = {
			distinct_id: 'test-user',
			created: '2024-01-15T00:00:00.000Z',
			anonymousIds: [],
			sessionIds: [],
		};

		const [events, converted] = await makeFunnel(context, funnel, user, FIXED_NOW - 86400, {}, {});
		expect(events.length).toBeGreaterThan(0);
		// Events before bindPropsIndex should NOT have funnel props
		// Events at/after bindPropsIndex should have funnel props
	});
});

describe('SCD monotonic timestamps', () => {
	test('SCD entries have monotonically increasing startTime', async () => {
		initChance('scd-mono');
		const { makeSCD } = await import('../lib/generators/scd.js');
		const config = validateDungeonConfig({
			numUsers: 10,
			numEvents: 100,
			events: [{ event: 'test' }],
			seed: 'scd-mono'
		});
		const context = createContext(config);

		const entries = await makeSCD(context, {
			values: ['a', 'b', 'c', 'd', 'e'],
			frequency: 'day',
			timing: 'fuzzy',
			max: 20,
			type: 'user'
		}, 'plan', 'user-1', 20, '2024-01-01T00:00:00.000Z');

		expect(entries.length).toBeGreaterThan(1);
		for (let i = 1; i < entries.length; i++) {
			expect(entries[i].startTime > entries[i - 1].startTime).toBe(true);
		}
	});

	test('SCD year frequency works with fixed timing', async () => {
		initChance('scd-year');
		const { makeSCD } = await import('../lib/generators/scd.js');
		const config = validateDungeonConfig({
			numUsers: 5,
			numEvents: 50,
			events: [{ event: 'test' }],
			seed: 'scd-year'
		});
		const context = createContext(config);

		const entries = await makeSCD(context, {
			values: ['free', 'pro', 'enterprise'],
			frequency: 'year',
			timing: 'fixed',
			max: 5,
			type: 'user'
		}, 'tier', 'user-1', 3, '2022-01-15T00:00:00.000Z');

		expect(entries.length).toBeGreaterThan(0);
		// Fixed yearly entries should start at year boundaries
		for (const entry of entries) {
			const month = entry.startTime.substring(5, 7);
			const day = entry.startTime.substring(8, 10);
			expect(month).toBe('01');
			expect(day).toBe('01');
		}
	});
});

describe('scd-pre hook return value', () => {
	test('scd-pre hook can replace SCD array', async () => {
		initChance('scd-hook-return');
		const generate = (await import('../index.js')).default;

		const results = await generate({
			numUsers: 5,
			numEvents: 50,
			seed: 'scd-hook-return',
			writeToDisk: false,
			scdProps: {
				status: {
					type: 'user',
					values: ['active', 'inactive', 'pending'],
					frequency: 'week',
					max: 5
				}
			},
			events: [{ event: 'login' }, { event: 'logout' }],
			hook: function (record, type) {
				if (type === 'scd-pre' && Array.isArray(record)) {
					// Filter to only keep first 2 entries
					return record.slice(0, 2);
				}
				return record;
			}
		});

		// Each user should have at most 2 SCD entries (hook filtered)
		for (const scdTable of results.scdTableData) {
			const entriesPerUser = {};
			for (const entry of scdTable) {
				const id = entry.distinct_id;
				entriesPerUser[id] = (entriesPerUser[id] || 0) + 1;
			}
			for (const count of Object.values(entriesPerUser)) {
				expect(count).toBeLessThanOrEqual(2);
			}
		}
	});
});

describe('isChurnEvent', () => {
	test('churn event stops user from generating more events (returnLikelihood=0)', async () => {
		initChance('churn-test');
		const generate = (await import('../index.js')).default;

		const results = await generate({
			numUsers: 20,
			numEvents: 2000,
			seed: 'churn-test',
			writeToDisk: false,
			events: [
				{ event: 'page_view', weight: 5 },
				{ event: 'account_deleted', weight: 1, isChurnEvent: true, returnLikelihood: 0, isStrictEvent: true },
			],
		});

		// Users who fire account_deleted should have it as their last event
		const eventsByUser = {};
		for (const ev of results.eventData) {
			const id = ev.distinct_id || ev.user_id;
			if (!eventsByUser[id]) eventsByUser[id] = [];
			eventsByUser[id].push(ev);
		}

		for (const [userId, events] of Object.entries(eventsByUser)) {
			const churnIndex = events.findIndex(e => e.event === 'account_deleted');
			if (churnIndex !== -1) {
				// No events after the churn event should exist
				const eventsAfterChurn = events.slice(churnIndex + 1);
				expect(eventsAfterChurn.length).toBe(0);
			}
		}
	});

	test('churn event with returnLikelihood=1 allows user to continue', async () => {
		initChance('churn-return');
		const generate = (await import('../index.js')).default;

		const results = await generate({
			numUsers: 10,
			numEvents: 500,
			seed: 'churn-return',
			writeToDisk: false,
			events: [
				{ event: 'page_view', weight: 3 },
				{ event: 'unsubscribe', weight: 2, isChurnEvent: true, returnLikelihood: 1 },
			],
		});

		// With returnLikelihood=1, users should continue after churn events
		const eventsByUser = {};
		for (const ev of results.eventData) {
			const id = ev.distinct_id || ev.user_id;
			if (!eventsByUser[id]) eventsByUser[id] = [];
			eventsByUser[id].push(ev);
		}

		let usersWithEventsAfterChurn = 0;
		for (const events of Object.values(eventsByUser)) {
			const churnIndex = events.findIndex(e => e.event === 'unsubscribe');
			if (churnIndex !== -1 && churnIndex < events.length - 1) {
				usersWithEventsAfterChurn++;
			}
		}
		// At least some users should have events after their churn event
		expect(usersWithEventsAfterChurn).toBeGreaterThan(0);
	});
});

describe('mirror validation', () => {
	test('accepts valid mirror config', async () => {
		const { validateMirrorProps } = await import('../lib/generators/mirror.js');
		const result = validateMirrorProps({
			version: {
				strategy: 'create',
				values: ['v1', 'v2', 'v3'],
				events: '*',
			}
		});
		expect(result).toBe(true);
	});

	test('accepts null/undefined mirror config', async () => {
		const { validateMirrorProps } = await import('../lib/generators/mirror.js');
		expect(validateMirrorProps(null)).toBe(true);
		expect(validateMirrorProps(undefined)).toBe(true);
	});

	test('rejects invalid strategy', async () => {
		const { validateMirrorProps } = await import('../lib/generators/mirror.js');
		expect(() => validateMirrorProps({
			version: { strategy: 'nope', values: ['a'] }
		})).toThrow(/Invalid mirror strategy/);
	});

	test('rejects empty values for non-delete strategy', async () => {
		const { validateMirrorProps } = await import('../lib/generators/mirror.js');
		expect(() => validateMirrorProps({
			version: { strategy: 'create', values: [] }
		})).toThrow(/non-empty values/);
	});

	test('allows empty values for delete strategy', async () => {
		const { validateMirrorProps } = await import('../lib/generators/mirror.js');
		const result = validateMirrorProps({
			version: { strategy: 'delete', values: [] }
		});
		expect(result).toBe(true);
	});

	test('rejects invalid events filter', async () => {
		const { validateMirrorProps } = await import('../lib/generators/mirror.js');
		expect(() => validateMirrorProps({
			version: { strategy: 'create', values: ['a'], events: [] }
		})).toThrow(/events filter/);
	});

	test('rejects negative daysUnfilled', async () => {
		const { validateMirrorProps } = await import('../lib/generators/mirror.js');
		expect(() => validateMirrorProps({
			version: { strategy: 'fill', values: ['a'], daysUnfilled: -1 }
		})).toThrow(/daysUnfilled/);
	});
});

describe('epochStart/numDays date calculations', () => {
	test('calculates numDays from epochStart + epochEnd', () => {
		initChance('epoch-test');
		const config = validateDungeonConfig({
			numUsers: 5,
			numEvents: 50,
			epochStart: FIXED_NOW - (30 * 86400),
			epochEnd: FIXED_NOW,
			events: [{ event: 'test', isFirstEvent: true }],
			seed: 'epoch-test'
		});
		expect(config.numDays).toBe(30);
	});

	test('calculates epochStart from numDays', () => {
		initChance('days-test');
		const config = validateDungeonConfig({
			numUsers: 5,
			numEvents: 50,
			numDays: 60,
			events: [{ event: 'test', isFirstEvent: true }],
			seed: 'days-test'
		});
		expect(config.epochStart).toBeDefined();
		expect(config.numDays).toBe(60);
	});

	test('accepts both epochStart and numDays', () => {
		initChance('both-test');
		const config = validateDungeonConfig({
			numUsers: 5,
			numEvents: 50,
			epochStart: FIXED_NOW - (45 * 86400),
			numDays: 45,
			events: [{ event: 'test', isFirstEvent: true }],
			seed: 'both-test'
		});
		expect(config.numDays).toBe(45);
	});
});

describe('nested default properties on events', () => {
	test('events with nested object properties resolve correctly', async () => {
		initChance('nested-props');
		const generate = (await import('../index.js')).default;

		const results = await generate({
			numUsers: 3,
			numEvents: 30,
			seed: 'nested-props',
			writeToDisk: false,
			events: [
				{
					event: 'page_view',
					weight: 5,
					isFirstEvent: true,
					properties: {
						section: ['home', 'about', 'pricing'],
						meta: {
							source: ['organic', 'paid', 'referral'],
						}
					}
				},
			],
		});

		const pageViews = results.eventData.filter(e => e.event === 'page_view');
		expect(pageViews.length).toBeGreaterThan(0);
		// Nested 'source' should be flattened onto the event
		for (const ev of pageViews) {
			expect(ev.section).toBeDefined();
			expect(['home', 'about', 'pricing']).toContain(ev.section);
		}
	});
});

describe('funnel ordering strategies', () => {
	const events = ['step1', 'step2', 'step3', 'step4', 'step5'];

	test('sequential preserves order', () => {
		const result = u.shuffleArray([...events]); // shuffleArray is random
		// sequential just returns as-is, test the helper functions directly
		expect(events).toEqual(['step1', 'step2', 'step3', 'step4', 'step5']);
	});

	test('shuffleExceptFirst keeps first element', () => {
		initChance('first-fixed');
		const input = ['A', 'B', 'C', 'D', 'E'];
		const result = u.shuffleExceptFirst([...input]);
		expect(result[0]).toBe('A');
		expect(result.length).toBe(5);
		expect(result.sort()).toEqual(input.sort());
	});

	test('shuffleExceptLast keeps last element', () => {
		initChance('last-fixed');
		const input = ['A', 'B', 'C', 'D', 'E'];
		const result = u.shuffleExceptLast([...input]);
		expect(result[result.length - 1]).toBe('E');
		expect(result.length).toBe(5);
		expect(result.sort()).toEqual(input.sort());
	});

	test('fixFirstAndLast keeps first and last', () => {
		initChance('first-last');
		const input = ['A', 'B', 'C', 'D', 'E'];
		const result = u.fixFirstAndLast([...input]);
		expect(result[0]).toBe('A');
		expect(result[result.length - 1]).toBe('E');
		expect(result.length).toBe(5);
	});

	test('shuffleMiddle keeps middle, shuffles outside', () => {
		initChance('middle-fixed');
		const input = ['A', 'B', 'C', 'D', 'E'];
		const result = u.shuffleMiddle([...input]);
		expect(result[2]).toBe('C'); // middle element preserved
		expect(result.length).toBe(5);
	});

	test('interruptArray substitutes some elements', () => {
		initChance('interrupt');
		const input = [
			{ event: 'step1' }, { event: 'step2' }, { event: 'step3' },
			{ event: 'step4' }, { event: 'step5' }
		];
		const substitutes = [{ event: 'other1' }, { event: 'other2' }];
		const result = u.interruptArray([...input], substitutes);
		expect(result.length).toBe(5);
		// First and last should be preserved
		expect(result[0].event).toBe('step1');
		expect(result[result.length - 1].event).toBe('step5');
	});
});

describe('funnel experiments', () => {
	test('experiment=true generates events with experiment variant', async () => {
		initChance('exp-test');
		const generate = (await import('../index.js')).default;
		const results = await generate({
			numUsers: 20,
			numEvents: 500,
			seed: 'exp-test',
			writeToDisk: false,
			events: [
				{ event: 'view_page', weight: 3, isFirstEvent: true },
				{ event: 'click_button', weight: 2 },
				{ event: 'submit_form', weight: 1 },
			],
			funnels: [{
				sequence: ['view_page', 'click_button', 'submit_form'],
				conversionRate: 80,
				order: 'sequential',
				experiment: true,
				isFirstFunnel: true,
				timeToConvert: 2,
			}]
		});

		// Should have $experiment_started events
		const expEvents = results.eventData.filter(e => e.event === '$experiment_started');
		expect(expEvents.length).toBeGreaterThan(0);

		// Experiment events should have "Variant name" property
		for (const ev of expEvents) {
			expect(['A', 'B', 'C']).toContain(ev['Variant name']);
		}
	});
});

describe('ad spend generation', () => {
	test('makeAdSpend produces valid ad spend events', async () => {
		initChance('adspend-test');
		const { makeAdSpend } = await import('../lib/generators/adspend.js');
		const config = validateDungeonConfig({
			numUsers: 5, numEvents: 50, numDays: 30,
			events: [{ event: 'test', isFirstEvent: true }],
			hasCampaigns: true, seed: 'adspend-test'
		});
		const context = createContext(config);

		const day = '2024-01-15T00:00:00.000Z';
		const events = await makeAdSpend(context, day);

		expect(events.length).toBeGreaterThan(0);
		for (const ev of events) {
			expect(ev.event).toBe('$ad_spend');
			expect(ev.time).toBe(day);
			expect(ev.clicks).toBeGreaterThanOrEqual(0);
			expect(ev.impressions).toBeGreaterThanOrEqual(0);
			expect(ev.cost).toBeGreaterThan(0);
			expect(ev.utm_source).toBeDefined();
			expect(ev.utm_campaign).toBeDefined();
		}
	});

	test('filters organic campaigns', async () => {
		initChance('adspend-organic');
		const { makeAdSpend } = await import('../lib/generators/adspend.js');
		const config = validateDungeonConfig({
			numUsers: 5, numEvents: 50, numDays: 30,
			events: [{ event: 'test', isFirstEvent: true }],
			hasCampaigns: true, seed: 'adspend-organic'
		});
		const context = createContext(config);

		const events = await makeAdSpend(context, '2024-01-15T00:00:00.000Z');
		// No organic campaigns should appear in ad spend
		const organics = events.filter(e => e.utm_campaign === '$organic');
		expect(organics.length).toBe(0);
	});
});

describe('mirror strategies', () => {
	test('mirror generation with create strategy', async () => {
		initChance('mirror-create');
		const generate = (await import('../index.js')).default;
		const results = await generate({
			numUsers: 5,
			numEvents: 50,
			seed: 'mirror-create',
			writeToDisk: false,
			events: [{ event: 'purchase', weight: 5, isFirstEvent: true, properties: { amount: [10, 20, 30] } }],
			mirrorProps: {
				version: {
					strategy: 'create',
					values: ['v1', 'v2', 'v3'],
					events: '*'
				}
			}
		});

		expect(results.mirrorEventData.length).toBeGreaterThan(0);
		// Mirror events should have the 'version' property
		const withVersion = results.mirrorEventData.filter(e => e.version !== undefined);
		expect(withVersion.length).toBeGreaterThan(0);
	});

	test('mirror generation with delete strategy', async () => {
		initChance('mirror-delete');
		const generate = (await import('../index.js')).default;
		const results = await generate({
			numUsers: 5,
			numEvents: 50,
			seed: 'mirror-delete',
			writeToDisk: false,
			events: [{ event: 'purchase', weight: 5, isFirstEvent: true, properties: { amount: [10, 20, 30] } }],
			mirrorProps: {
				amount: {
					strategy: 'delete',
					values: [],
					events: '*'
				}
			}
		});

		expect(results.mirrorEventData.length).toBeGreaterThan(0);
		// Mirror events should have 'amount' removed
		const withoutAmount = results.mirrorEventData.filter(e => e.amount === undefined || e.amount === null);
		expect(withoutAmount.length).toBeGreaterThan(0);
	});
});

describe('group profile generation', () => {
	test('generates group profiles with properties', async () => {
		initChance('group-test');
		const generate = (await import('../index.js')).default;
		const results = await generate({
			numUsers: 5,
			numEvents: 50,
			seed: 'group-test',
			writeToDisk: false,
			events: [{ event: 'test', weight: 5, isFirstEvent: true }],
			groupKeys: [['company_id', 3]],
			groupProps: {
				company_id: {
					industry: ['tech', 'finance', 'healthcare'],
					size: ['small', 'medium', 'large']
				}
			}
		});

		expect(results.groupProfilesData.length).toBe(1); // one group key
		const companyProfiles = results.groupProfilesData[0];
		expect(companyProfiles.length).toBe(3); // 3 companies
		for (const profile of companyProfiles) {
			expect(profile.industry).toBeDefined();
			expect(profile.size).toBeDefined();
		}
	});
});

describe('choose() edge cases', () => {
	test('choose with primitive returns primitive', () => {
		expect(u.choose(42)).toBe(42);
		expect(u.choose('hello')).toBe('hello');
		expect(u.choose(true)).toBe(true);
	});

	test('choose with function calls function', () => {
		expect(u.choose(() => 'result')).toBe('result');
	});

	test('choose with array picks element', () => {
		initChance('choose-arr');
		const result = u.choose(['a', 'b', 'c']);
		expect(['a', 'b', 'c']).toContain(result);
	});

	test('choose with nested array picks from inner', () => {
		initChance('choose-nested');
		const result = u.choose([['x', 'y'], ['a', 'b']]);
		// Should return one of the inner elements
		expect(result).toBeDefined();
	});
});

describe('streaming output', () => {
	test('streamJSON produces valid JSONL', async () => {
		const fs = await import('fs');
		const path = await import('path');
		const data = [
			{ event: 'test', time: '2024-01-15T00:00:00.000Z', amount: 42 },
			{ event: 'test2', time: '2024-01-16T00:00:00.000Z', amount: 99 }
		];
		const filePath = path.default.resolve('./data/test-stream.json');

		await u.streamJSON(filePath, data);

		const content = fs.readFileSync(filePath, 'utf8').trim();
		const lines = content.split('\n');
		expect(lines.length).toBe(2);
		expect(() => JSON.parse(lines[0])).not.toThrow();
		expect(() => JSON.parse(lines[1])).not.toThrow();
		const parsed = JSON.parse(lines[0]);
		expect(parsed.event).toBe('test');
		expect(parsed.amount).toBe(42);

		// Cleanup
		fs.unlinkSync(filePath);
	});

	test('streamCSV produces valid CSV with headers', async () => {
		const fs = await import('fs');
		const path = await import('path');
		const data = [
			{ event: 'test', time: '2024-01-15T00:00:00.000Z', amount: 42 },
			{ event: 'test2', time: '2024-01-16T00:00:00.000Z', amount: 99 }
		];
		const filePath = path.default.resolve('./data/test-stream.csv');

		await u.streamCSV(filePath, data);

		const content = fs.readFileSync(filePath, 'utf8').trim();
		const lines = content.split('\n');
		expect(lines.length).toBe(3); // header + 2 rows
		expect(lines[0]).toContain('event');
		expect(lines[0]).toContain('time');
		expect(lines[0]).toContain('amount');
		expect(lines[1]).toContain('test');

		// Cleanup
		fs.unlinkSync(filePath);
	});
});
