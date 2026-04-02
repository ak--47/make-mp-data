//@ts-nocheck
/**
 * Module Integration Tests
 *
 * These tests validate the core data generation functionality by calling
 * the main() function directly (programmatic API) rather than via CLI.
 * They ensure proper validation, data quality, and file output.
 */

import generate from '../index.js';
import 'dotenv/config';
import * as u from 'ak-tools';
import Papa from 'papaparse';

import simple from '../dungeons/simple.js';
import complex from '../dungeons/complex.js';
import anon from '../dungeons/anon.js';
import funnels from '../dungeons/funnels.js';
import foobar from '../dungeons/foobar.js';
import mirror from '../dungeons/mirror.js';
import adspend from '../dungeons/adspend.js';
import scd from '../dungeons/scd.js';

const timeout = 600000;

/** @typedef {import('../types').Dungeon} Dungeon */


// Use sequential execution to prevent tests from interfering with each other
// since they create/modify files in the same directories
describe.sequential('Module Integration Tests', () => {

	test('sanity check - basic data generation', async () => {
		console.log('SANITY TEST');
		/** @type {Dungeon} */
		const config = {
			numEvents: 100,
			numUsers: 10,
			numDays: 7,
			writeToDisk: true,
			format: 'csv',
			seed: 'sanity-test'
		};

		const result = await generate(config);

		// Validate result object
		expect(result.eventCount).toBeGreaterThan(0);
		expect(result.userCount).toBeGreaterThan(0);
		expect(result.files.length).toBeGreaterThan(0);

		// Check files were created
		const files = (await u.ls('./data')).filter(a => a.includes('.csv'));
		expect(files.length).toBe(2);

		const users = files.filter(a => a.includes('USERS'));
		const events = files.filter(a => a.includes('EVENTS'));
		expect(users.length).toBe(1);
		expect(events.length).toBe(1);

		// Validate data quality
		const eventData = (await u.load(events[0])).trim();
		const userProfilesData = (await u.load(users[0])).trim();
		const parsedEvents = Papa.parse(eventData, { header: true }).data;
		const parsedUsers = Papa.parse(userProfilesData, { header: true }).data;

		expect(parsedEvents.length).toBeGreaterThan(10);
		expect(parsedUsers.length).toBeGreaterThan(5);
		expect(parsedUsers.every(u => u.distinct_id)).toBe(true);
		expect(parsedEvents.every(e => e.event)).toBe(true);
		expect(parsedEvents.every(e => e.time)).toBe(true);
		expect(parsedEvents.every(e => e.insert_id)).toBe(true);
		expect(parsedEvents.every(e => e.device_id || e.user_id)).toBe(true);
		expect(parsedUsers.every(u => u.name)).toBe(true);
		expect(parsedUsers.every(u => u.email)).toBe(true);
		expect(parsedUsers.every(u => u.avatar)).toBe(false);
		expect(parsedEvents.every(e => validateEvent(e))).toBe(true);
		expect(parsedUsers.every(u => validateUser(u))).toBe(true);
	}, timeout);

	test('minimal config - default values', async () => {
		console.log('MINIMAL CONFIG TEST');
		/** @type {Dungeon} */
		const config = {
			numEvents: 100,
			numUsers: 10,
			writeToDisk: true,
			seed: 'minimal-test'
		};

		const result = await generate(config);

		expect(result.eventCount).toBeGreaterThan(0);
		expect(result.userCount).toBe(10);
		const csvs = (await u.ls('./data')).filter(a => a.includes('.csv'));
		expect(csvs.length).toBe(2);
	}, timeout);

	test('complex dungeon - full data model', async () => {
		console.log('COMPLEX DUNGEON TEST');
		/** @type {Dungeon} */
		const config = {
			...complex,
			numEvents: 100,
			numUsers: 10,
			seed: "complex-test",
			writeToDisk: true,
			format: 'json'
		};

		const result = await generate(config);

		expect(result.eventCount).toBeGreaterThan(0);
		expect(result.userCount).toBe(10);

		// Complex should have events, users, groups, lookups
		// Note: SCD files not generated without service account credentials
		const jsonFiles = (await u.ls('./data')).filter(a => a.includes('.json'));
		expect(jsonFiles.length).toBeGreaterThan(4);
	}, timeout);

	test('simple dungeon - basic model', async () => {
		console.log('SIMPLE DUNGEON TEST');
		/** @type {Dungeon} */
		const config = {
			...simple,
			numEvents: 100,
			numUsers: 10,
			seed: "simple-test",
			writeToDisk: true,
			format: 'csv',
			hasAdSpend: false
		
		};

		const result = await generate(config);

		expect(result.eventCount).toBeGreaterThan(0);
		expect(result.userCount).toBe(10);
		const csvs = (await u.ls('./data')).filter(a => a.includes('.csv'));
		expect(csvs.length).toBe(2);
	}, timeout);

	test('parquet format output', async () => {
		console.log('PARQUET FORMAT TEST');
		/** @type {Dungeon} */
		const config = {
			numEvents: 50,
			numUsers: 5,
			writeToDisk: true,
			format: 'parquet',
			seed: 'parquet-test'
		};

		const result = await generate(config);

		expect(result.files.length).toBeGreaterThan(0);
		const parquetFiles = result.files.filter(f => f.includes('.parquet'));
		expect(parquetFiles.length).toBeGreaterThan(0);
	}, timeout);

	test('gzip compression', async () => {
		console.log('GZIP COMPRESSION TEST');
		/** @type {Dungeon} */
		const config = {
			numEvents: 50,
			numUsers: 5,
			writeToDisk: true,
			format: 'json',
			gzip: true,
			seed: 'gzip-test'
		};

		const result = await generate(config);

		expect(result.files.length).toBeGreaterThan(0);
		const gzipFiles = result.files.filter(f => f.endsWith('.gz'));
		expect(gzipFiles.length).toBeGreaterThan(0);
	}, timeout);

	test('in-memory only - no disk writes', async () => {
		console.log('IN-MEMORY TEST');
		/** @type {Dungeon} */
		const config = {
			numEvents: 50,
			numUsers: 5,
			writeToDisk: false,
			batchSize: 100000, // Must be >= numEvents when writeToDisk is false
			seed: 'memory-test'
		};

		const result = await generate(config);

		expect(result.eventCount).toBeGreaterThan(30);
		expect(result.userCount).toBe(5);
		expect(result.eventData).toBeDefined();
		expect(result.userProfilesData).toBeDefined();
		expect(result.eventData.length).toBeGreaterThan(30);
		expect(result.userProfilesData.length).toBe(5);
	}, timeout);

	test('batch mode - writes multiple files and imports correctly', async () => {
		console.log('BATCH MODE TEST');
		/** @type {Dungeon} */
		const config = {
			numEvents: 150,
			numUsers: 10,
			writeToDisk: true,
			format: 'csv',
			batchSize: 50, // Force batch mode with small batch size
			seed: 'batch-test',
			token: process.env.MIXPANEL_TOKEN || 'test-token'
		};

		const result = await generate(config);

		// Verify event and user counts
		expect(result.eventCount).toBeGreaterThan(100);
		expect(result.userCount).toBe(10);

		// Verify multiple batch files were created
		const files = (await u.ls('./data')).filter(a => a.includes('.csv'));
		expect(files.length).toBeGreaterThan(2); // Should have multiple batches

		// Check for batch file naming pattern (e.g., "-part-1.csv", "-part-2.csv")
		const eventBatches = files.filter(f => f.includes('EVENTS') && f.includes('-part-'));
		const userBatches = files.filter(f => f.includes('USERS') && f.includes('-part-'));

		expect(eventBatches.length).toBeGreaterThan(1); // At least 2 event batch files
		expect(userBatches.length).toBeGreaterThan(0); // At least 1 user batch file

		// If a real token is provided, verify import results
		if (process.env.MIXPANEL_TOKEN && result.importResults) {
			expect(result.importResults.events).toBeDefined();
			expect(result.importResults.users).toBeDefined();
			expect(result.importResults.events.success).toBeGreaterThan(0);
			expect(result.importResults.users.success).toBeGreaterThan(0);
			console.log(`✅ Batch mode imported ${result.importResults.events.success} events and ${result.importResults.users.success} users`);
		} else {
			console.log('⚠️  Skipping import verification (no MIXPANEL_TOKEN provided)');
		}
	}, timeout);

	test('write to disk with import - data persists and imports correctly', async () => {
		console.log('WRITE TO DISK + IMPORT TEST');
		/** @type {Dungeon} */
		const config = {
			numEvents: 75,
			numUsers: 8,
			writeToDisk: true,
			format: 'json',
			seed: 'write-import-test',
			token: process.env.MIXPANEL_TOKEN || 'test-token'
		};

		const result = await generate(config);

		// Verify data was generated
		expect(result.eventCount).toBeGreaterThan(20);
		expect(result.userCount).toBe(8);

		// Verify files were created
		const files = (await u.ls('./data')).filter(a => a.includes('.json'));
		expect(files.length).toBe(2); // events + users

		const eventFiles = files.filter(f => f.includes('EVENTS'));
		const userFiles = files.filter(f => f.includes('USERS'));

		expect(eventFiles.length).toBe(1);
		expect(userFiles.length).toBe(1);

		// Verify files contain data
		const eventData = await u.load(eventFiles[0]);
		const userData = await u.load(userFiles[0]);

		const eventLines = eventData.trim().split('\n');
		const userLines = userData.trim().split('\n');

		expect(eventLines.length).toBeGreaterThan(50);
		expect(userLines.length).toBe(8);

		// Verify each line is valid JSON
		expect(() => JSON.parse(eventLines[0])).not.toThrow();
		expect(() => JSON.parse(userLines[0])).not.toThrow();

		// If a real token is provided, verify import results
		if (process.env.MIXPANEL_TOKEN && result.importResults) {
			expect(result.importResults.events).toBeDefined();
			expect(result.importResults.users).toBeDefined();

			// THIS IS THE KEY TEST: Files were flushed to disk, arrays are empty,
			// but import should still read from disk and succeed
			expect(result.importResults.events.success).toBeGreaterThan(0);
			expect(result.importResults.users.success).toBeGreaterThan(0);

			// Verify imported counts match generated counts
			expect(result.importResults.events.success).toBe(result.eventCount);
			expect(result.importResults.users.success).toBe(result.userCount);

			console.log(`✅ Write-to-disk mode imported ${result.importResults.events.success} events and ${result.importResults.users.success} users from files`);
		} else {
			console.log('⚠️  Skipping import verification (no MIXPANEL_TOKEN provided)');
		}
	}, timeout);
});

beforeEach(() => {
	clearData();
});

afterEach(() => {
	clearData();
});

function clearData() {
	try {
		console.log('clearing data files...');
		const { execSync } = require('child_process');
		execSync(`npm run prune`, { stdio: 'ignore' });
		console.log('...files cleared 👍');
	}
	catch (err) {
		console.log('error clearing files (may be expected)');
	}
}

function validateEvent(event) {
	if (!event.event) return false;
	if (!event.device_id && !event.user_id) return false;
	if (!event.time) return false;
	if (!event.insert_id) return false;
	return true;
}

function validateUser(user) {
	if (!user.distinct_id) return false;
	if (!user.name) return false;
	if (!user.email) return false;
	return true;
}

function validTime(str) {
	if (!str) return false;
	if (str.startsWith('-')) return false;
	if (!str.startsWith('20')) return false;
	return true;
}
