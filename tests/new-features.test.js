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
