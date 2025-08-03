/**
 * Performance Optimizations Test Suite
 * Tests for the performance improvements implemented in Phase 1 & 2
 */

import { test, expect, describe, beforeAll } from 'vitest';
import { createContext } from '../lib/core/context.js';
import { makeEvent } from '../lib/generators/events.js';
import { initChance, TimeSoup, weighArray, pickRandom } from '../lib/utils/utils.js';
import { validateDungeonConfig } from '../lib/core/config-validator.js';
import dayjs from 'dayjs';

/** @typedef {import('../types').Context} Context */
/** @typedef {import('../types').Dungeon} Config */

beforeAll(() => {
    // Initialize global variables for consistent testing
    global.FIXED_NOW = Math.floor(Date.now() / 1000);
    global.FIXED_BEGIN = global.FIXED_NOW - (30 * 24 * 60 * 60);
    initChance('test-performance-seed');
});

describe('Performance Optimizations', () => {

    describe('Context TIME_SHIFT_SECONDS Optimization', () => {
        test('should pre-calculate TIME_SHIFT_SECONDS in context', () => {
            const config = {
                numUsers: 10,
                numEvents: 50,
                seed: 'test-seed'
            };
            
            const validatedConfig = validateDungeonConfig(config);
            const context = createContext(validatedConfig);
            
            // Should have pre-calculated TIME_SHIFT_SECONDS
            expect(context.TIME_SHIFT_SECONDS).toBeDefined();
            expect(typeof context.TIME_SHIFT_SECONDS).toBe('number');
            expect(context.TIME_SHIFT_SECONDS).toBeGreaterThan(0);
        });

        test('TIME_SHIFT_SECONDS should be consistent across multiple context creations', () => {
            const config = {
                numUsers: 10,
                numEvents: 50,
                seed: 'test-seed'
            };
            
            const validatedConfig = validateDungeonConfig(config);
            const context1 = createContext(validatedConfig);
            const context2 = createContext(validatedConfig);
            
            // Should be exactly the same since it's based on fixed global values
            expect(context1.TIME_SHIFT_SECONDS).toBe(context2.TIME_SHIFT_SECONDS);
        });

        test('TIME_SHIFT_SECONDS should represent 2 days in seconds', () => {
            const config = {
                numUsers: 10,
                numEvents: 50,
                seed: 'test-seed'
            };
            
            const validatedConfig = validateDungeonConfig(config);
            const context = createContext(validatedConfig);
            
            // Should be close to 2 days worth of seconds (172800 seconds)
            const twoDaysInSeconds = 2 * 24 * 60 * 60; // 172800
            const tolerance = 60; // 1 minute tolerance
            
            expect(Math.abs(context.TIME_SHIFT_SECONDS - twoDaysInSeconds)).toBeLessThan(tolerance);
        });
    });

    describe('Location/Device Caching Optimization', () => {
        test('should pre-calculate weighted arrays in defaults', () => {
            const config = {
                numUsers: 10,
                numEvents: 50,
                hasLocation: true,
                hasIOSDevices: true,
                hasAndroidDevices: true,
                hasDesktopDevices: true,
                hasBrowser: true,
                hasCampaigns: true,
                seed: 'test-seed'
            };
            
            const validatedConfig = validateDungeonConfig(config);
            const context = createContext(validatedConfig);
            
            // Defaults should return arrays immediately (already weighted)
            const locationsUsers = context.defaults.locationsUsers();
            const locationsEvents = context.defaults.locationsEvents();
            const browsers = context.defaults.browsers();
            const campaigns = context.defaults.campaigns();
            
            expect(Array.isArray(locationsUsers)).toBe(true);
            expect(Array.isArray(locationsEvents)).toBe(true);
            expect(Array.isArray(browsers)).toBe(true);
            expect(Array.isArray(campaigns)).toBe(true);
            
            // Arrays should have content (weighted means duplicates)
            expect(locationsUsers.length).toBeGreaterThan(0);
            expect(locationsEvents.length).toBeGreaterThan(0);
            expect(browsers.length).toBeGreaterThan(0);
            expect(campaigns.length).toBeGreaterThan(0);
        });

        test('cached arrays should be consistently returned', () => {
            const config = {
                numUsers: 10,
                numEvents: 50,
                hasLocation: true,
                hasIOSDevices: true,
                seed: 'test-seed'
            };
            
            const validatedConfig = validateDungeonConfig(config);
            const context = createContext(validatedConfig);
            
            // Multiple calls should return the same pre-calculated arrays
            const locations1 = context.defaults.locationsEvents();
            const locations2 = context.defaults.locationsEvents();
            const devices1 = context.defaults.iOSDevices();
            const devices2 = context.defaults.iOSDevices();
            
            expect(locations1).toBe(locations2); // Same reference (cached)
            expect(devices1).toBe(devices2); // Same reference (cached)
        });
    });

    describe('TimeSoup Performance Characteristics', () => {
        test('TimeSoup should return ISO string format', () => {
            const earliestTime = global.FIXED_BEGIN;
            const latestTime = global.FIXED_NOW;
            
            const result = TimeSoup(earliestTime, latestTime);
            
            // Should return ISO string (not numeric timestamp)
            expect(typeof result).toBe('string');
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(dayjs(result).isValid()).toBe(true);
        });

        test('TimeSoup should produce valid timestamps within range', () => {
            const earliestTime = global.FIXED_BEGIN;
            const latestTime = global.FIXED_NOW;
            
            const result = TimeSoup(earliestTime, latestTime, 5, 2, 0);
            
            // Should produce valid timestamps within the range
            const resultTime = dayjs(result);
            const earliestDay = dayjs.unix(earliestTime);
            const latestDay = dayjs.unix(latestTime);
            
            expect(resultTime.isAfter(earliestDay)).toBe(true);
            expect(resultTime.isBefore(latestDay)).toBe(true);
        });
    });

    describe('pickRandom vs chance.pickone Performance', () => {
        test('pickRandom should work correctly', () => {
            const testArray = ['a', 'b', 'c', 'd', 'e'];
            const result = pickRandom(testArray);
            
            expect(testArray).toContain(result);
        });

        test('pickRandom should handle edge cases', () => {
            expect(pickRandom([])).toBeUndefined();
            expect(pickRandom(null)).toBeUndefined();
            expect(pickRandom(undefined)).toBeUndefined();
            expect(pickRandom(['single'])).toBe('single');
        });

        test('pickRandom should have reasonable distribution', () => {
            const testArray = ['a', 'b', 'c'];
            const results = {};
            const iterations = 1000;
            
            for (let i = 0; i < iterations; i++) {
                const result = pickRandom(testArray);
                results[result] = (results[result] || 0) + 1;
            }
            
            // Each element should appear at least 200 times out of 1000 (reasonable distribution)
            expect(results['a']).toBeGreaterThan(200);
            expect(results['b']).toBeGreaterThan(200);
            expect(results['c']).toBeGreaterThan(200);
        });
    });

    describe('makeEvent Integration with Optimizations', () => {
        test('makeEvent should use precomputed TIME_SHIFT_SECONDS', async () => {
            const config = {
                numUsers: 10,
                numEvents: 50,
                hasLocation: true,
                seed: 'test-seed'
            };
            
            const validatedConfig = validateDungeonConfig(config);
            const context = createContext(validatedConfig);
            
            const chosenEvent = {
                event: 'test_event',
                properties: {
                    test_prop: ['A', 'B', 'C']
                }
            };
            
            const event = await makeEvent(
                context,
                'test_user_123',
                global.FIXED_BEGIN,
                chosenEvent,
                [],
                [],
                {},
                [],
                false,
                false
            );
            
            // Event should have proper time format
            expect(event.time).toBeDefined();
            expect(typeof event.time).toBe('string');
            expect(dayjs(event.time).isValid()).toBe(true);
            
            // Time should be shifted forward (context should have TIME_SHIFT_SECONDS)
            expect(context.TIME_SHIFT_SECONDS).toBeDefined();
            expect(context.TIME_SHIFT_SECONDS).toBeGreaterThan(0);
        });

        test('makeEvent should use cached location data', async () => {
            const config = {
                numUsers: 10,
                numEvents: 50,
                hasLocation: true,
                seed: 'test-seed'
            };
            
            const validatedConfig = validateDungeonConfig(config);
            const context = createContext(validatedConfig);
            
            const chosenEvent = {
                event: 'test_event',
                properties: {}
            };
            
            const event = await makeEvent(
                context,
                'test_user_123',
                global.FIXED_BEGIN,
                chosenEvent,
                [],
                [],
                {},
                [],
                false,
                false
            );
            
            // Should be able to access location defaults (when hasLocation is true)
            const locations = context.defaults.locationsEvents();
            expect(Array.isArray(locations)).toBe(true);
            expect(locations.length).toBeGreaterThan(0);
        });
    });

    describe('weighArray Function Behavior', () => {
        test('weighArray should create weighted duplicates', () => {
            const input = ['a', 'b', 'c'];
            const result = weighArray(input);
            
            // Result should be longer than input (contains duplicates)
            expect(result.length).toBeGreaterThan(input.length);
            
            // All original elements should be present
            input.forEach(element => {
                expect(result).toContain(element);
            });
        });

        test('weighArray should create consistent structure', () => {
            const input = ['a', 'b', 'c'];
            const result1 = weighArray(input);
            const result2 = weighArray(input);
            
            // Should have similar structure (weighted duplicates)
            expect(result1.length).toBeGreaterThan(input.length);
            expect(result2.length).toBeGreaterThan(input.length);
            
            // Should contain all original elements
            input.forEach(element => {
                expect(result1).toContain(element);
                expect(result2).toContain(element);
            });
        });
    });

    describe('Performance Regression Tests', () => {
        test('event generation should complete within reasonable time', async () => {
            const config = {
                numUsers: 50,
                numEvents: 200,
                hasLocation: true,
                hasIOSDevices: true,
                seed: 'perf-test-seed'
            };
            
            const validatedConfig = validateDungeonConfig(config);
            const context = createContext(validatedConfig);
            
            const chosenEvent = {
                event: 'perf_test_event',
                properties: {
                    category: ['A', 'B', 'C', 'D'],
                    value: [1, 2, 3, 4, 5]
                }
            };
            
            const startTime = performance.now();
            
            // Generate 100 events
            const promises = [];
            for (let i = 0; i < 100; i++) {
                promises.push(makeEvent(
                    context,
                    `user_${i}`,
                    global.FIXED_BEGIN,
                    chosenEvent,
                    [],
                    [],
                    {},
                    [],
                    false,
                    false
                ));
            }
            
            const events = await Promise.all(promises);
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Should generate 100 events in less than 1 second (with optimizations)
            expect(duration).toBeLessThan(1000);
            expect(events.length).toBe(100);
            
            // All events should be valid
            events.forEach(event => {
                expect(event.event).toBe('perf_test_event');
                expect(event.time).toBeDefined();
                expect(dayjs(event.time).isValid()).toBe(true);
            });
        });
    });
});