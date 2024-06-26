/* cSpell:disable */
// @ts-nocheck
/* eslint-disable no-undef */
/* eslint-disable no-debugger */
/* eslint-disable no-unused-vars */
const generate = require('../index.js');
require('dotenv').config();
const { execSync } = require("child_process");
const u = require('ak-tools');
const Papa = require('papaparse');

const simple = require('../schemas/simple.js');
const complex = require('../schemas/complex.js');
const anon = require('../schemas/anon.js');
const funnels = require('../schemas/funnels.js');
const foobar = require('../schemas/foobar.js');
const mirror = require('../schemas/mirror.js');
const adspend = require('../schemas/adspend.js');

const timeout = 600000;
const testToken = process.env.TEST_TOKEN || "hello token!";

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
		expect(groupProfilesData[0]?.length).toBe(500);
		expect(lookupTableData.length).toBe(2);
		expect(lookupTableData[0].length).toBe(1000);
		expect(scdTableData.length).toBe(5);
		expect(userProfilesData.length).toBe(100);

	}, timeout);

	test('works as module (funnels)', async () => {
		console.log('MODULE TEST: FUNNELS');
		const results = await generate({ ...funnels, verbose: true, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it" });
		const { eventData, groupProfilesData, scdTableData, userProfilesData } = results;
		expect(eventData.length).toBeGreaterThan(980);
		expect(groupProfilesData.length).toBe(3);
		expect(groupProfilesData[0]?.length).toBe(5000);
		expect(groupProfilesData[1]?.length).toBe(500);
		expect(groupProfilesData[2]?.length).toBe(50);
		expect(scdTableData.length).toBe(2);
		expect(scdTableData[0]?.length).toBeGreaterThan(200);
		expect(scdTableData[1]?.length).toBeGreaterThan(200);
		expect(userProfilesData.length).toBe(100);

	}, timeout);

	test('works as module (mirror)', async () => {
		console.log('MODULE TEST: MIRROR');
		const results = await generate({ ...mirror, verbose: true, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it" });
		const { eventData, userProfilesData, mirrorEventData } = results;
		expect(eventData.length).toBeGreaterThan(980);
		expect(mirrorEventData.length).toBeGreaterThan(980);
		expect(mirrorEventData.every(e => e.newlyCreated)).toBe(true);
		expect(eventData.every(e => e.newlyCreated)).toBe(false);
		expect(userProfilesData.length).toBe(100);

	}, timeout);

	test('works as module (foobar)', async () => {
		console.log('MODULE TEST: FOOBAR');
		const results = await generate({ ...foobar, verbose: true, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it" });
		const { eventData, userProfilesData } = results;
		expect(eventData.length).toBeGreaterThan(980);
		expect(userProfilesData.length).toBe(100);

	}, timeout);

	test('works as module (adspend)', async () => {
		console.log('MODULE TEST: ADSPEND');
		const results = await generate({ ...adspend, verbose: true, writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it" });
		const { eventData, adSpendData, userProfilesData } = results;
		expect(eventData.length).toBeGreaterThan(980);
		expect(userProfilesData.length).toBe(100);
		expect(adSpendData.length).toBe(14600);

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
		expect(eventData.length).toBeGreaterThan(100000);
		expect(userProfilesData.length).toBe(1000);
		expect(groupProfilesData.length).toBe(0);
		expect(importResults).toBe(undefined);
		expect(scdTableData.length).toBe(0);
		expect(lookupTableData.length).toBe(0);
		expect(mirrorEventData.length).toBe(0);
	}, timeout);




});

describe('batching', () => {
	test('batch writes', async () => {
		const results = await generate({ ...foobar, batchSize: 1000, writeToDisk: true, numEvents: 10_000, numUsers: 5000, seed: "deal" });
		const { eventData, userProfilesData } = results;
		const files = (await u.ls('./data')).filter(a => a.endsWith('.json'));
		const eventFiles = files.filter(a => a.includes('EVENTS'));
		const userFiles = files.filter(a => a.includes('USERS'));
		const evWriteDir = eventData.getWriteDir();
		const usWriteDir = userProfilesData.getWriteDir();
		const evWritePath = eventData.getWritePath();
		const usWritePath = userProfilesData.getWritePath();

		const expectedEvWriteDir = `-EVENTS.json`;
		const expectedUsWriteDir = `-USERS.json`;
		const expectedWritePath = `-part-`;

		expect(eventFiles.length).toBe(23);
		expect(userFiles.length).toBe(5);

		expect(eventFiles.filter(a => a.includes('part')).length).toBe(23);
		expect(userFiles.filter(a => a.includes('part')).length).toBe(5);
		expect(evWriteDir.endsWith(expectedEvWriteDir)).toBe(true);
		expect(usWriteDir.endsWith(expectedUsWriteDir)).toBe(true);
		expect(evWritePath.includes(expectedWritePath)).toBe(true);
		expect(usWritePath.includes(expectedWritePath)).toBe(true);
		
	}, timeout);


	test('dont batch', async () => {
		const results = await generate({ ...foobar, writeToDisk: true, numEvents: 5000, numUsers: 1000, seed: "deal" });
		const { eventData, userProfilesData } = results;
		const files = await u.ls('./data');
		const eventFiles = files.filter(a => a.includes('EVENTS'));
		const userFiles = files.filter(a => a.includes('USERS'));
		expect(eventFiles.length).toBe(1);
		expect(userFiles.length).toBe(1);
		expect(eventFiles.filter(a => a.includes('part')).length).toBe(0);
		const evWriteDir = eventData.getWriteDir();
		const usWriteDir = userProfilesData.getWriteDir();
		const expectedEvWriteDir = `-EVENTS.json`;
		const expectedUsWriteDir = `-USERS.json`;
		expect(evWriteDir.endsWith(expectedEvWriteDir)).toBe(true);
		expect(usWriteDir.endsWith(expectedUsWriteDir)).toBe(true);

		const evWritePath = eventData.getWritePath();
		const usWritePath = userProfilesData.getWritePath();
		expect(evWritePath.endsWith(expectedEvWriteDir)).toBe(true);
		expect(usWritePath.endsWith(expectedUsWriteDir)).toBe(true);
		
	}, timeout);
	
	test('send to mp: batches', async () => {
		const results = await generate({ ...foobar, numDays: 90, hasAdSpend: true, token: testToken, batchSize: 4500, writeToDisk: true, numEvents: 10_000, numUsers: 5000, seed: "deal" });
		const { importResults } = results;
		const { adSpend, events, groups, users } = importResults;
		expect(adSpend.success).toBeGreaterThan(0);
		expect(events.success).toBeGreaterThan(0);
		expect(users.success).toBeGreaterThan(0);
		expect(groups[0].success).toBeGreaterThan(0);
		expect(groups[1].success).toBeGreaterThan(0);
		expect(adSpend.success).toBe(adSpend.total);
		expect(events.success).toBe(events.total);
	//	expect(users.success).toBe(users.total);
		expect(groups.length).toBe(2);
		expect(groups[0].success).toBe(groups[0].total);
		expect(groups[1].success).toBe(groups[1].total);
		expect(adSpend.failed).toBe(0);
		expect(events.failed).toBe(0);
		expect(users.failed).toBe(0);
		expect(groups[0].failed).toBe(0);
		expect(groups[1].failed).toBe(0);

		
	}, timeout);

	test('send to mp: no batch', async () => {
		const results = await generate({ ...foobar, numDays: 90, hasAdSpend: true, token: testToken, writeToDisk: true, numEvents: 5000, numUsers: 1000, seed: "deal" });
		const { importResults } = results;
		const { adSpend, events, groups, users } = importResults;
		expect(adSpend.success).toBeGreaterThan(0);
		expect(events.success).toBeGreaterThan(0);
		expect(users.success).toBeGreaterThan(0);
		expect(groups[0].success).toBeGreaterThan(0);
		expect(groups[1].success).toBeGreaterThan(0);
		expect(adSpend.success).toBe(adSpend.total);
		expect(events.success).toBe(events.total);
		expect(users.success).toBe(users.total);
		expect(groups.length).toBe(2);
		expect(groups[0].success).toBe(groups[0].total);
		expect(groups[1].success).toBe(groups[1].total);
		expect(adSpend.failed).toBe(0);
		expect(events.failed).toBe(0);
		expect(users.failed).toBe(0);
		expect(groups[0].failed).toBe(0);
		expect(groups[1].failed).toBe(0);
		
	}, timeout);
});

describe('cli', () => {

	test('sanity check', async () => {
		console.log('SANITY TEST');
		const run = execSync(`node ./index.js`);
		const ending = `enjoy your data! :)`;
		expect(run.toString().trim().endsWith(ending)).toBe(true);
		const files = (await u.ls('./data')).filter(a => a.includes('.csv'));
		expect(files.length).toBe(2);
		const users = files.filter(a => a.includes('USERS'));
		const events = files.filter(a => a.includes('EVENTS'));
		expect(users.length).toBe(1);
		expect(events.length).toBe(1);
		const eventData = (await u.load(events[0])).trim();
		const userProfilesData = (await u.load(users[0])).trim();
		const parsedEvents = Papa.parse(eventData, { header: true }).data;
		const parsedUsers = Papa.parse(userProfilesData, { header: true }).data;
		expect(parsedEvents.length).toBeGreaterThan(42000);
		expect(parsedUsers.length).toBeGreaterThan(420);
		expect(parsedUsers.every(u => u.distinct_id)).toBe(true);
		expect(parsedEvents.every(e => e.event)).toBe(true);
		expect(parsedEvents.every(e => e.time)).toBe(true);
		expect(parsedEvents.every(e => e.insert_id)).toBe(true);
		expect(parsedEvents.every(e => e.device_id || e.user_id)).toBe(true);
		expect(parsedUsers.every(u => u.name)).toBe(true);
		expect(parsedUsers.every(u => u.email)).toBe(true);
		expect(parsedUsers.every(u => u.created)).toBe(true);
		expect(parsedUsers.every(u => u.avatar)).toBe(false);
		expect(parsedEvents.every(e => validateEvent(e))).toBe(true);
		expect(parsedUsers.every(u => validateUser(u))).toBe(true);
	}, timeout);

	test('no args', async () => {
		console.log('BARE CLI TEST');
		const run = execSync(`node ./index.js --numEvents 1000 --numUsers 100`);
		expect(run.toString().trim().includes('enjoy your data! :)')).toBe(true);
		const csvs = (await u.ls('./data')).filter(a => a.includes('.csv'));
		expect(csvs.length).toBe(2);
		
	}, timeout);

	test('--complex', async () => {
		console.log('COMPLEX CLI TEST');
		const run = execSync(`node ./index.js --numEvents 1000 --numUsers 100 --seed "deal with it" --complex`, { stdio: "ignore" });
		const csvs = (await u.ls('./data')).filter(a => a.includes('.csv'));
		expect(csvs.length).toBe(13);
		
	}, timeout);

	test('--simple', async () => {
		console.log('SIMPLE CLI TEST');
		const run = execSync(`node ./index.js --numEvents 1000 --numUsers 100 --seed "deal with it" --simple`);
		expect(run.toString().trim().includes('enjoy your data! :)')).toBe(true);
		const csvs = (await u.ls('./data')).filter(a => a.includes('.csv'));
		expect(csvs.length).toBe(2);
	
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
		const results = await generate({ verbose: true, writeToDisk: false, numEvents: 1000, numUsers: 100 });
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
		const results = await generate({ ...simple, writeToDisk: false, verbose: true, numEvents: 1000, numUsers: 100 });
		const { eventData } = results;
		const invalidDates = eventData.filter(e => !validTime(e.time));
		expect(eventData.every(e => validTime(e.time))).toBe(true);

	}, timeout);

	test('anonymous users', async () => {
		console.log('ANON TEST');
		const results = await generate({ ...anon, writeToDisk: false, verbose: true, numEvents: 1000, numUsers: 100 });
		const { userProfilesData } = results;
		expect(userProfilesData.every(u => u.name === 'Anonymous User')).toBe(true);

	}, timeout);

	test('no avatars (default)', async () => {
		console.log('AVATAR TEST');
		const results = await generate({ ...simple, writeToDisk: false, verbose: true, numEvents: 1000, numUsers: 100 });
		const { userProfilesData } = results;
		expect(userProfilesData.every(u => !u.avatar)).toBe(true);

	}, timeout);

	test('yes avatars', async () => {
		console.log('AVATAR TEST');
		const results = await generate({ ...simple, writeToDisk: false, verbose: true, numEvents: 1000, numUsers: 100, hasAvatar: true });
		const { userProfilesData } = results;
		expect(userProfilesData.every(u => u.avatar)).toBe(true);

	}, timeout);

});

beforeEach(() => {
	clearData();
});

afterEach(() => {
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


function validTime(str) {
	if (!str) return false;
	if (str.startsWith('-')) return false;
	if (!str.startsWith('20')) return false;
	return true;
}