/* cSpell:disable */
// @ts-nocheck
/* eslint-disable no-undef */
/* eslint-disable no-debugger */
/* eslint-disable no-unused-vars */
const generate = require('../core/index.js');
require('dotenv').config();
const { execSync } = require("child_process");
const u = require('ak-tools');

const simple = require('../schemas/simple.js');
const complex = require('../schemas/complex.js');
const anon = require('../schemas/anon.js');
const funnels = require('../schemas/funnels.js');
const foobar = require('../schemas/foobar.js');

const timeout = 60000;
const testToken = process.env.TEST_TOKEN;

describe('module', () => {

	test('works as module (no config)', async () => {
		console.log('MODULE TEST');
		const results = await generate({ verbose: true, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it" });
		const { eventData, groupProfilesData, lookupTableData, scdTableData, userProfilesData } = results;
		expect(eventData.length).toBeGreaterThan(980);
		expect(groupProfilesData.length).toBe(0);
		expect(lookupTableData.length).toBe(0);
		expect(scdTableData.length).toBe(0);
		expect(userProfilesData.length).toBe(100);

	}, timeout);

	test('works as module (simple)', async () => {
		console.log('MODULE TEST: SIMPLE');
		const results = await generate({ ...simple, verbose: true, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it" });
		const { eventData, groupProfilesData, lookupTableData, scdTableData, userProfilesData } = results;
		expect(eventData.length).toBeGreaterThan(980);
		expect(groupProfilesData.length).toBe(0);
		expect(lookupTableData.length).toBe(0);
		expect(scdTableData.length).toBe(0);
		expect(userProfilesData.length).toBe(100);

	}, timeout);

	test('works as module (complex)', async () => {
		console.log('MODULE TEST: COMPLEX');
		const results = await generate({ ...complex, verbose: true, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it" });
		const { eventData, groupProfilesData, lookupTableData, scdTableData, userProfilesData } = results;
		expect(eventData.length).toBeGreaterThan(980);
		expect(groupProfilesData[0]?.data?.length).toBe(500);
		expect(lookupTableData.length).toBe(2);
		expect(lookupTableData[0].data.length).toBe(1000);
		expect(scdTableData.length).toBe(5);
		expect(userProfilesData.length).toBe(100);

	}, timeout);


	test('fails with invalid configuration', async () => {
		try {
			await generate({ numUsers: -10 });
		} catch (e) {
			expect(e).toBeDefined();
		}
	}, timeout);


	test('works with no params', async () => {
		const { eventData, userProfilesData, groupProfilesData, files, importResults, lookupTableData, mirrorEventData, scdTableData } = await generate({ writeToDisk: false });
		debugger;
	}, timeout);




});

describe('cli', () => {
	test('works as CLI (no args)', async () => {
		console.log('COMPLEX CLI TEST');
		const run = execSync(`node ./core/index.js --numEvents 1000 --numUsers 100`, { stdio: 'ignore' });
		// expect(run.toString().trim().includes('have a wonderful day :)')).toBe(true);
		const csvs = (await u.ls('./data')).filter(a => a.includes('.csv'));
		expect(csvs.length).toBe(2);
		clearData();
	}, timeout);

	test('works as CLI (complex)', async () => {
		console.log('COMPLEX CLI TEST');
		const run = execSync(`node ./core/index.js --numEvents 1000 --numUsers 100 --seed "deal with it" --complex`, { stdio: 'ignore' });
		// expect(run.toString().trim().includes('have a wonderful day :)')).toBe(true);
		const csvs = (await u.ls('./data')).filter(a => a.includes('.csv'));
		expect(csvs.length).toBe(13);
		clearData();
	}, timeout);

	test('works as CLI (simple)', async () => {
		console.log('simple CLI TEST');
		const run = execSync(`node ./core/index.js --numEvents 1000 --numUsers 100 --seed "deal with it" --simple`);
		expect(run.toString().trim().includes('have a wonderful day :)')).toBe(true);
		const csvs = (await u.ls('./data')).filter(a => a.includes('.csv'));
		expect(csvs.length).toBe(2);
		clearData();
	}, timeout);


});


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
		const results = await generate({ verbose: true, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it", token: testToken });
		const { events, users, groups } = results.importResults;
		expect(events.success).toBeGreaterThan(980);
		expect(users.success).toBe(100);
		expect(groups.length).toBe(0);
	}, timeout);

	test('every record is valid', async () => {
		console.log('VALIDATION TEST');
		const results = await generate({ verbose: true, writeToDisk: false, numEvents: 10000, numUsers: 500 });
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
		const results = await generate({ ...simple, writeToDisk: false, verbose: true,  numEvents: 10000, numUsers: 500 });
		const { eventData } = results;
		const invalidDates = eventData.filter(e => !validateTime(e.time));
		expect(eventData.every(e => validateTime(e.time))).toBe(true);

	}, timeout);

	test('anonymous users', async () => {
		console.log('ANON TEST');
		const results = await generate({ ...anon, writeToDisk: false, verbose: true, numEvents: 10000, numUsers: 500 });
		const { userProfilesData } = results;
		expect(userProfilesData.every(u => u.name === 'Anonymous User')).toBe(true);

	}, timeout);

});

afterAll(() => {
	clearData();
});

//helpers

function clearData() {
	try {
		console.log('clearing...');
		execSync(`npm run prune`);
		console.log('...files cleared 👍');
	}
	catch (err) {
		console.log('error clearing files');
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
	if (!user.created) return false;
	return true;
}


function validateTime(str) {
	if (!str) return false;
	if (str.startsWith('-')) return false;
	if (!str.startsWith('20')) return false;
	return true;
}