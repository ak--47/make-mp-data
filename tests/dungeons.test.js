//@ts-nocheck
/**
 * Dungeon Validation Tests
 *
 * Validates that all dungeon configs in ./dungeons/ are structurally valid
 * without running them. Checks imports, config shape, event/funnel consistency,
 * hook presence, and packaging rules (no tokens, writeToDisk: false).
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateDungeonConfig } from '../lib/core/config-validator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dungeonDir = path.join(__dirname, '..', 'dungeons');
const dungeonFiles = fs.readdirSync(dungeonDir)
	.filter(f => f.endsWith('.js'))
	.sort();

describe('Dungeon Validation', () => {
	it('has dungeons to test', () => {
		expect(dungeonFiles.length).toBeGreaterThan(0);
	});

	for (const file of dungeonFiles) {
		const name = file.replace('.js', '');
		const filePath = path.join(dungeonDir, file);

		describe(name, () => {
			let config;

			it('imports without error', async () => {
				const mod = await import(filePath);
				config = mod.default;
				expect(config).toBeDefined();
			});

			it('has required config fields', () => {
				if (!config) return;
				expect(config.numEvents).toBeDefined();
				expect(config.numUsers).toBeDefined();
				expect(config.numDays).toBeDefined();
				expect(config.events).toBeDefined();
				expect(Array.isArray(config.events)).toBe(true);
				expect(config.events.length).toBeGreaterThan(0);
			});

			it('has no hardcoded token', () => {
				if (!config) return;
				const token = config.token || '';
				expect(token).toBe('');
			});

			it('has writeToDisk: false', () => {
				if (!config) return;
				if (config.writeToDisk !== undefined) {
					expect(config.writeToDisk).toBe(false);
				}
			});

			it('has lowercase-hyphen filename', () => {
				expect(name).toMatch(/^[a-z0-9-]+$/);
			});

			it('has at least one event with isFirstEvent', () => {
				if (!config) return;
				const hasFirst = config.events.some(e => e.isFirstEvent);
				expect(hasFirst).toBe(true);
			});

			it('funnel event names exist in events array', () => {
				if (!config || !config.funnels || config.funnels.length === 0) return;
				const eventNames = new Set(config.events.map(e => e.event));
				for (const funnel of config.funnels) {
					if (!funnel.sequence) continue;
					for (const step of funnel.sequence) {
						expect(eventNames.has(step), `Funnel step "${step}" not found in events`).toBe(true);
					}
				}
			});

			it('passes validateDungeonConfig', () => {
				if (!config) return;
				expect(() => validateDungeonConfig({ ...config })).not.toThrow();
			});
		});
	}
});
