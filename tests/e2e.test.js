/* cSpell:disable */
// @ts-nocheck
/* eslint-disable no-undef */
/* eslint-disable no-debugger */
/* eslint-disable no-unused-vars */
import generate from '../index.js';
import 'dotenv/config';
import { execSync } from "child_process";
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

// 1 minute timeout
const timeout = 60000;
const testToken = process.env.TEST_TOKEN || "hello token!";

/**
 * Clean up data directory between tests that write to disk
 */
function clearData() {
	try {
		execSync(`npm run prune`, { stdio: 'ignore' });
	} catch (err) {
		// Ignore cleanup errors
	}
}

describe('module', () => {

	test('works as module (no config)', async () => {
		console.log('MODULE TEST');
		const results = await generate({ verbose: false, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it" });
		const { eventData, groupProfilesData, lookupTableData, scdTableData, userProfilesData } = results;
		expect(eventData.length).toBeGreaterThan(980);
		expect(groupProfilesData.length).toBe(0);
		expect(lookupTableData.length).toBe(0);
		expect(scdTableData.length).toBe(0);
		expect(userProfilesData.length).toBe(100);

	}, timeout);

	test('works as module (simple)', async () => {
		console.log('MODULE TEST: SIMPLE');
		const results = await generate({ ...simple, verbose: false, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it" });
		const { eventData, groupProfilesData, lookupTableData, scdTableData, userProfilesData } = results;
		expect(eventData.length).toBeGreaterThan(980);
		expect(groupProfilesData.length).toBe(0);
		expect(lookupTableData.length).toBe(0);
		expect(scdTableData.length).toBe(0);
		expect(userProfilesData.length).toBe(100);

	}, timeout);

	test('works as module (complex)', async () => {
		console.log('MODULE TEST: COMPLEX');
		const results = await generate({ ...complex, verbose: false, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it" });
		const { eventData, groupProfilesData, lookupTableData, scdTableData, userProfilesData } = results;
		expect(eventData.length).toBeGreaterThan(980);
		expect(groupProfilesData[0]?.length).toBe(500);
		expect(lookupTableData.length).toBe(2);
		expect(lookupTableData[0].length).toBe(1000);
		expect(scdTableData.length).toBe(5);
		expect(userProfilesData.length).toBe(100);

	}, timeout);

	test('works as module (funnels)', async () => {
		console.log('MODULE TEST: FUNNELS');
		const results = await generate({ ...funnels, verbose: false, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it" });
		const { eventData, groupProfilesData, scdTableData, userProfilesData } = results;
		expect(eventData.length).toBeGreaterThan(980);
		expect(groupProfilesData.length).toBe(3);
		expect(groupProfilesData[0]?.length).toBe(5000);
		expect(groupProfilesData[1]?.length).toBe(500);
		expect(groupProfilesData[2]?.length).toBe(50);
		expect(userProfilesData.length).toBe(100);

	}, timeout);

	test('works as module (mirror)', async () => {
		console.log('MODULE TEST: MIRROR');
		const results = await generate({ ...mirror, verbose: false, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it" });
		const { eventData, userProfilesData, mirrorEventData } = results;
		expect(eventData.length).toBeGreaterThan(980);
		expect(mirrorEventData.length).toBeGreaterThan(980);
		expect(mirrorEventData.every(e => e.newlyCreated)).toBe(true);
		expect(eventData.every(e => e.newlyCreated)).toBe(false);
		expect(userProfilesData.length).toBe(100);

	}, timeout);

	test('works as module (foobar)', async () => {
		console.log('MODULE TEST: FOOBAR');
		const results = await generate({ ...foobar, verbose: false, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it" });
		const { eventData, userProfilesData } = results;
		expect(eventData.length).toBeGreaterThan(980);
		expect(userProfilesData.length).toBe(100);

	}, timeout);

	test('works as module (adspend)', async () => {
		console.log('MODULE TEST: ADSPEND');
		const results = await generate({ ...adspend, verbose: false, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it" });
		const { eventData, adSpendData, userProfilesData } = results;
		expect(eventData.length).toBeGreaterThan(980);
		expect(userProfilesData.length).toBe(100);
		expect(adSpendData.length).toBe(14600);

	}, timeout);

	// // ! this test takes 35s because SCDs don't have a public API
	// test('works as module (scd)', async () => {
	// 	console.log('MODULE TEST: scd');
	// 	// const scdSchema = (await import('../dungeons/scd.js')).default;
	// 	const config = {
	// 		...scd,
	// 		token: testToken,
	// 		serviceAccount: process.env.SERVICE_ACCOUNT,
	// 		projectId: process.env.PROJECT_ID,
	// 		serviceSecret: process.env.SERVICE_SECRET,
	// 		verbose: false, writeToDisk: false, numEvents: 100, numUsers: 10, seed: "deal with it"
	// 	};
	// 	const results = await generate(config);
	// 	const { importResults } = results;
	// 	const { MRR_scd, NPS_scd, plan_scd, role_scd } = importResults;
	// 	expect(MRR_scd.success).toBeGreaterThan(10);
	// 	expect(NPS_scd.success).toBeGreaterThan(10);
	// 	expect(plan_scd.success).toBeGreaterThan(10);
	// 	expect(role_scd.success).toBeGreaterThan(10);
	// 	expect(MRR_scd.failed).toBe(0);
	// 	expect(NPS_scd.failed).toBe(0);
	// 	expect(plan_scd.failed).toBe(0);
	// 	expect(role_scd.failed).toBe(0);


	// }, timeout);

	test('fails with invalid configuration', async () => {
		try {
			await generate({ numUsers: -10 });
		} catch (e) {
			expect(e).toBeDefined();
		}
	}, timeout);


	test('works with no params', async () => {
		const { eventData, userProfilesData, groupProfilesData, files, importResults, lookupTableData, mirrorEventData, scdTableData } = await generate({ writeToDisk: false });
		expect(eventData.length).toBeGreaterThan(100000);
		expect(userProfilesData.length).toBe(1000);
		expect(groupProfilesData.length).toBe(0);
		expect(importResults).toBe(undefined);
		expect(scdTableData.length).toBe(0);
		expect(lookupTableData.length).toBe(0);
		expect(mirrorEventData.length).toBe(0);
	}, timeout);

	test('respects explicit name in file output', async () => {
		console.log('EXPLICIT NAME TEST');
		
		// Clean up before test
		clearData();
		
		const customName = 'my-test-dataset';

		// Generate data with explicit name
		const results = await generate({
			name: customName,
			writeToDisk: true,
			numEvents: 100,
			numUsers: 10,
			seed: "explicit-name-test",
			verbose: false,
			format: 'csv'
		});

		const { files, eventCount, userCount } = results;
		
		// Validate that data was generated (when writeToDisk=true, arrays are flushed)
		expect(eventCount).toBeGreaterThan(90);
		expect(userCount).toBe(10);
		
		// Validate that files were written
		expect(files).toBeDefined();
		expect(files.length).toBeGreaterThan(0);
		
		// Check that all files start with our custom name
		const relevantFiles = files.filter(file => 
			file.includes('EVENTS') || file.includes('USERS')
		);
		
		expect(relevantFiles.length).toBeGreaterThan(0);
		
		for (const filePath of relevantFiles) {
			const fileName = filePath.split('/').pop();
			expect(fileName).toMatch(new RegExp(`^${customName}-`));
		}
		
		// Verify specific file patterns
		const eventFile = relevantFiles.find(f => f.includes('EVENTS'));
		const userFile = relevantFiles.find(f => f.includes('USERS'));
		
		expect(eventFile).toBeDefined();
		expect(userFile).toBeDefined();
		
		const eventFileName = eventFile.split('/').pop();
		const userFileName = userFile.split('/').pop();
		
		expect(eventFileName).toBe(`${customName}-EVENTS.csv`);
		expect(userFileName).toBe(`${customName}-USERS.csv`);
		
	}, timeout);

	test('generates random name when name is empty string', async () => {
		console.log('EMPTY NAME TEST');
		
		// Clean up before test
		clearData();
		
		// Generate data with empty name (should trigger makeName)
		const results = await generate({
			name: "",  // Empty string should trigger makeName()
			writeToDisk: true,
			numEvents: 50,
			numUsers: 5,
			seed: "empty-name-test",
			verbose: false,
			format: 'csv'
		});

		const { files, eventCount, userCount } = results;
		
		// Validate that data was generated
		expect(eventCount).toBeGreaterThan(29);  // Lower threshold since it's random
		expect(userCount).toBe(5);
		
		// Validate that files were written
		expect(files).toBeDefined();
		expect(files.length).toBeGreaterThan(0);
		
		// Check that files have generated names (not empty)
		const relevantFiles = files.filter(file => 
			file.includes('EVENTS') || file.includes('USERS')
		);
		
		expect(relevantFiles.length).toBeGreaterThan(0);
		
		for (const filePath of relevantFiles) {
			const fileName = filePath.split('/').pop();
			// Should NOT start with just "-" (which would happen if name was empty)
			expect(fileName).not.toMatch(/^-/);
			// Should have a generated name format (word-word-word pattern from makeName)
			expect(fileName).toMatch(/^[a-z]+-[a-z]+-[a-z]+-/);
		}
		
	}, timeout);




});

// describe('batching', () => {
// 	test('batch writes', async () => {
// 		const results = await generate({ ...foobar, batchSize: 1000, writeToDisk: true, numEvents: 10_000, numUsers: 5000, seed: "deal" });
// 		const { eventData, userProfilesData } = results;
// 		const files = (await u.ls('./data')).filter(a => a.endsWith('.json'));
// 		const eventFiles = files.filter(a => a.includes('EVENTS'));
// 		const userFiles = files.filter(a => a.includes('USERS'));
// 		const evWriteDir = eventData.getWriteDir();
// 		const usWriteDir = userProfilesData.getWriteDir();
// 		const evWritePath = eventData.getWritePath();
// 		const usWritePath = userProfilesData.getWritePath();

// 		const expectedEvWriteDir = `-EVENTS.json`;
// 		const expectedUsWriteDir = `-USERS.json`;
// 		const expectedWritePath = `-part-`;

// 		expect(eventFiles.length).toBe(22);
// 		expect(userFiles.length).toBe(5);

// 		expect(eventFiles.filter(a => a.includes('part')).length).toBe(23);
// 		expect(userFiles.filter(a => a.includes('part')).length).toBe(5);
// 		expect(evWriteDir.endsWith(expectedEvWriteDir)).toBe(true);
// 		expect(usWriteDir.endsWith(expectedUsWriteDir)).toBe(true);
// 		expect(evWritePath.includes(expectedWritePath)).toBe(true);
// 		expect(usWritePath.includes(expectedWritePath)).toBe(true);

// 	}, timeout);


// 	test('dont batch', async () => {
// 		const results = await generate({ ...foobar, writeToDisk: true, numEvents: 5000, numUsers: 1000, seed: "deal" });
// 		const { eventData, userProfilesData } = results;
// 		const files = await u.ls('./data');
// 		const eventFiles = files.filter(a => a.includes('EVENTS'));
// 		const userFiles = files.filter(a => a.includes('USERS'));
// 		expect(eventFiles.length).toBe(1);
// 		expect(userFiles.length).toBe(1);
// 		expect(eventFiles.filter(a => a.includes('part')).length).toBe(0);
// 		const evWriteDir = eventData.getWriteDir();
// 		const usWriteDir = userProfilesData.getWriteDir();
// 		const expectedEvWriteDir = `-EVENTS.json`;
// 		const expectedUsWriteDir = `-USERS.json`;
// 		expect(evWriteDir.endsWith(expectedEvWriteDir)).toBe(true);
// 		expect(usWriteDir.endsWith(expectedUsWriteDir)).toBe(true);

// 		const evWritePath = eventData.getWritePath();
// 		const usWritePath = userProfilesData.getWritePath();
// 		expect(evWritePath.endsWith(expectedEvWriteDir)).toBe(true);
// 		expect(usWritePath.endsWith(expectedUsWriteDir)).toBe(true);

// 	}, timeout);

// 	test('send to mp: batches', async () => {
// 		const results = await generate({ ...foobar, numDays: 90, hasAdSpend: true, token: testToken, batchSize: 4500, writeToDisk: true, numEvents: 10_000, numUsers: 5000, seed: "deal" });
// 		const { importResults } = results;
// 		const { adSpend, events, groups, users } = importResults;
// 		expect(adSpend.success).toBeGreaterThan(0);
// 		expect(events.success).toBeGreaterThan(0);
// 		expect(users.success).toBeGreaterThan(0);
// 		expect(groups[0].success).toBeGreaterThan(0);
// 		expect(groups[1].success).toBeGreaterThan(0);
// 		expect(adSpend.success).toBe(adSpend.total);
// 		expect(events.success).toBe(events.total);
// 		//	expect(users.success).toBe(users.total);
// 		expect(groups.length).toBe(2);
// 		expect(groups[0].success).toBe(groups[0].total);
// 		expect(groups[1].success).toBe(groups[1].total);
// 		expect(adSpend.failed).toBe(0);
// 		expect(events.failed).toBe(0);
// 		expect(users.failed).toBe(0);
// 		expect(groups[0].failed).toBe(0);
// 		expect(groups[1].failed).toBe(0);


// 	}, timeout);

// 	test('send to mp: no batch', async () => {
// 		const results = await generate({ ...foobar, numDays: 90, hasAdSpend: true, token: testToken, writeToDisk: true, numEvents: 5000, numUsers: 1000, seed: "deal" });
// 		const { importResults } = results;
// 		const { adSpend, events, groups, users } = importResults;
// 		expect(adSpend.success).toBeGreaterThan(0);
// 		expect(events.success).toBeGreaterThan(0);
// 		expect(users.success).toBeGreaterThan(0);
// 		expect(groups[0].success).toBeGreaterThan(0);
// 		expect(groups[1].success).toBeGreaterThan(0);
// 		expect(adSpend.success).toBe(adSpend.total);
// 		expect(events.success).toBe(events.total);
// 		expect(users.success).toBe(users.total);
// 		expect(groups.length).toBe(2);
// 		expect(groups[0].success).toBe(groups[0].total);
// 		expect(groups[1].success).toBe(groups[1].total);
// 		expect(adSpend.failed).toBe(0);
// 		expect(events.failed).toBe(0);
// 		expect(users.failed).toBe(0);
// 		expect(groups[0].failed).toBe(0);
// 		expect(groups[1].failed).toBe(0);

// 	}, timeout);
// });


describe('options + tweaks', () => {
	test('creates sessionIds', async () => {
		const results = await generate({ writeToDisk: false, numEvents: 1000, numUsers: 100, hasSessionIds: true });
		const { eventData } = results;
		const sessionIds = eventData.map(a => a.session_id).filter(a => a);
		expect(sessionIds.length).toBe(eventData.length);
	}, timeout);

	test('no hasSessionIds', async () => {
		const results = await generate({ writeToDisk: false, numEvents: 1000, numUsers: 100, hasSessionIds: false });
		const { eventData } = results;
		const noSessionIds = eventData.map(a => a.session_id).filter(a => a);
		expect(noSessionIds.length).toBe(0);
	}, timeout);

	test('creates anonymousIds', async () => {
		const results = await generate({ writeToDisk: false, numEvents: 1000, numUsers: 100, hasAnonIds: true });
		const { eventData } = results;
		const anonymousEvents = eventData.map(a => a.device_id).filter(a => a);
		const userIds = eventData.map(a => a.user_id).filter(a => a);
		expect(anonymousEvents.length).toBe(eventData.length);
		expect(userIds.length).toBeLessThan(anonymousEvents.length);
	}, timeout);

	test('no anonymousIds', async () => {
		const results = await generate({ writeToDisk: false, numEvents: 1000, numUsers: 100, hasAnonIds: false });
		const { eventData } = results;
		const unanonymousEvents = eventData.map(a => a.device_id).filter(a => a);
		expect(unanonymousEvents.length).toBe(0);
	}, timeout);

	test('sends data to mixpanel', async () => {
		console.log('NETWORK TEST');
		const results = await generate({ verbose: false, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it", token: testToken });
		const { events, users, groups } = results.importResults;
		expect(events.success).toBeGreaterThan(980);
		expect(users.success).toBe(100);
		expect(groups.length).toBe(0);
	}, timeout);

	test('every record is valid', async () => {
		console.log('VALIDATION TEST');
		const results = await generate({ verbose: false, writeToDisk: false, numEvents: 1000, numUsers: 100 });
		const { eventData, userProfilesData } = results;
		const areEventsValid = eventData.every(validateEvent);
		const areUsersValid = userProfilesData.every(validateUser);

		const invalidEvents = eventData.filter(e => !validateEvent(e));
		const invalidUsers = userProfilesData.filter(u => !validateUser(u));

		expect(areEventsValid).toBe(true);
		expect(areUsersValid).toBe(true);
	}, timeout);

	test('every date is valid', async () => {
		console.log('DATE TEST');
		const results = await generate({ ...simple, writeToDisk: false, verbose: false, numEvents: 1000, numUsers: 100 });
		const { eventData } = results;
		const invalidDates = eventData.filter(e => !validTime(e.time));
		expect(eventData.every(e => validTime(e.time))).toBe(true);

	}, timeout);

	test('anonymous users', async () => {
		console.log('ANON TEST');
		const results = await generate({ ...anon, writeToDisk: false, verbose: false, numEvents: 1000, numUsers: 100 });
		const { userProfilesData } = results;
		expect(userProfilesData.every(u => u.name === 'Anonymous User')).toBe(true);

	}, timeout);

	test('no avatars (default)', async () => {
		console.log('AVATAR TEST');
		const results = await generate({ ...simple, writeToDisk: false, verbose: false, numEvents: 1000, numUsers: 100 });
		const { userProfilesData } = results;
		expect(userProfilesData.every(u => !u.avatar)).toBe(true);

	}, timeout);

	test('yes avatars', async () => {
		console.log('AVATAR TEST');
		const results = await generate({ ...simple, writeToDisk: false, verbose: false, numEvents: 1000, numUsers: 100, hasAvatar: true });
		const { userProfilesData } = results;
		expect(userProfilesData.every(u => u.avatar)).toBe(true);

	}, timeout);

	test('parquet format support', async () => {
		console.log('PARQUET FORMAT TEST');
		
		// Clean up before test
		clearData();
		const results = await generate({ 
			writeToDisk: true, 
			format: 'parquet',
			verbose: false, 
			numEvents: 100, 
			numUsers: 10,
			numDays: 5,
			seed: 'parquet-test',
			events: [
				{
					event: 'test_event',
					weight: 10,
					properties: {
						value: [1, 2, 3, 4, 5]
					}
				}
			]
		});
		
		const { files } = results;
		expect(files.some(f => f.endsWith('.parquet'))).toBe(true);

		// Check that files exist on disk
		const fs = await import('fs');
		const parquetFiles = files.filter(f => f.endsWith('.parquet'));
		expect(parquetFiles.length).toBeGreaterThan(0);
		
		for (const file of parquetFiles) {
			expect(fs.existsSync(file)).toBe(true);
			const stats = fs.statSync(file);
			expect(stats.size).toBeGreaterThan(0); // File should not be empty
		}

	}, timeout);

	test('gzip compression for CSV', async () => {
		console.log('GZIP CSV TEST');
		
		// Clean up before test
		clearData();
		const results = await generate({ 
			writeToDisk: true, 
			format: 'csv',
			gzip: true,
			verbose: false, 
			numEvents: 100, 
			numUsers: 10,
			numDays: 5,
			seed: 'gzip-csv-test',
			events: [
				{
					event: 'test_event',
					weight: 10,
					properties: {
						value: [1, 2, 3, 4, 5]
					}
				}
			]
		});
		
		const { files } = results;
		expect(files.some(f => f.endsWith('.csv.gz'))).toBe(true);

		// Check that gzipped files exist on disk
		const fs = await import('fs');
		const gzipFiles = files.filter(f => f.endsWith('.csv.gz'));
		expect(gzipFiles.length).toBeGreaterThan(0);
		
		for (const file of gzipFiles) {
			expect(fs.existsSync(file)).toBe(true);
			const stats = fs.statSync(file);
			expect(stats.size).toBeGreaterThan(0); // File should not be empty
		}

	}, timeout);

	test('gzip compression for JSON', async () => {
		console.log('GZIP JSON TEST');
		
		// Clean up before test
		clearData();
		const results = await generate({ 
			writeToDisk: true, 
			format: 'json',
			gzip: true,
			verbose: false, 
			numEvents: 100, 
			numUsers: 10,
			numDays: 5,
			seed: 'gzip-json-test',
			events: [
				{
					event: 'test_event',
					weight: 10,
					properties: {
						value: [1, 2, 3, 4, 5]
					}
				}
			]
		});
		
		const { files } = results;
		expect(files.some(f => f.endsWith('.json.gz'))).toBe(true);

		// Check that gzipped files exist on disk
		const fs = await import('fs');
		const gzipFiles = files.filter(f => f.endsWith('.json.gz'));
		expect(gzipFiles.length).toBeGreaterThan(0);
		
		for (const file of gzipFiles) {
			expect(fs.existsSync(file)).toBe(true);
			const stats = fs.statSync(file);
			expect(stats.size).toBeGreaterThan(0); // File should not be empty
		}

	}, timeout);

	test('gzip compression for parquet', async () => {
		console.log('GZIP PARQUET TEST');
		
		// Clean up before test
		clearData();
		const results = await generate({ 
			writeToDisk: true, 
			format: 'parquet',
			gzip: true,
			verbose: false, 
			numEvents: 100, 
			numUsers: 10,
			numDays: 5,
			seed: 'gzip-parquet-test',
			events: [
				{
					event: 'test_event',
					weight: 10,
					properties: {
						value: [1, 2, 3, 4, 5]
					}
				}
			]
		});
		
		const { files } = results;
		expect(files.some(f => f.endsWith('.parquet.gz'))).toBe(true);

		// Check that gzipped parquet files exist on disk
		const fs = await import('fs');
		const gzipFiles = files.filter(f => f.endsWith('.parquet.gz'));
		expect(gzipFiles.length).toBeGreaterThan(0);
		
		for (const file of gzipFiles) {
			expect(fs.existsSync(file)).toBe(true);
			const stats = fs.statSync(file);
			expect(stats.size).toBeGreaterThan(0); // File should not be empty
		}

	}, timeout);

	test('validation: writeToDisk=false with low batchSize throws error', async () => {
		console.log('VALIDATION ERROR TEST');
		
		await expect(async () => {
			await generate({
				numUsers: 10,
				numEvents: 100,
				batchSize: 50,
				writeToDisk: false,
				verbose: false,
				seed: 'validation-test'
			});
		}).rejects.toThrow(/Configuration error.*writeToDisk.*batchSize/);

	}, timeout);

	test('validation: writeToDisk=false with adequate batchSize works', async () => {
		console.log('VALIDATION SUCCESS TEST');
		
		const results = await generate({
			numUsers: 10,
			numEvents: 100,
			batchSize: 150, // Higher than numEvents
			writeToDisk: false,
			verbose: false,
			seed: 'validation-success-test'
		});
		
		expect(results.eventData.length).toBeGreaterThan(70);
		expect(results.userProfilesData.length).toBe(10);

	}, timeout);

});



//helpers



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
	// if (!user.created) return false;
	return true;
}


function validTime(str) {
	if (!str) return false;
	if (str.startsWith('-')) return false;
	if (!str.startsWith('20')) return false;
	return true;
}