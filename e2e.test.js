/* cSpell:disable */
// @ts-nocheck
/* eslint-disable no-undef */
/* eslint-disable no-debugger */
/* eslint-disable no-unused-vars */
const { generate } = require('./index.js');
require('dotenv').config();
const { execSync } = require("child_process");
const u = require('ak-tools');

const timeout = 60000;
const testToken = process.env.TEST_TOKEN;


describe('e2e', () => {

	test('works as module', async () => {
		console.log('MODULE TEST');
		const results = await generate({ writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it" });
		const { eventData, groupProfilesData, lookupTableData, scdTableData, userProfilesData } = results;
		expect(eventData.length).toBeGreaterThan(980);
		expect(groupProfilesData.length).toBe(0);
		expect(lookupTableData.length).toBe(0);
		expect(scdTableData.length).toBeGreaterThan(200);
		expect(userProfilesData.length).toBe(100);

	}, timeout);

	test('works as CLI', async () => {
		console.log('CLI TEST');
		const run = execSync(`node ./index.js --numEvents 1000 --numUsers 100 --seed "deal with it"`);
		expect(run.toString().trim().includes('have a wonderful day :)')).toBe(true);
		const csvs = (await u.ls('./data')).filter(a => a.includes('.csv'));
		expect(csvs.length).toBe(5);
	}, timeout);

	test('sends data to mixpanel', async () => {
		console.log('NETWORK TEST');
		const results = await generate({ writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it", token: testToken });
		const { events, users, groups } = results.import;
		expect(events.success).toBeGreaterThan(980);
		expect(users.success).toBe(100);
		expect(groups.length).toBe(0);
	}, timeout);

	test('every record is valid', async () => {
		console.log('VALIDATION TEST');
		const results = await generate({ writeToDisk: false, numEvents: 10000, numUsers: 500 });
		const { eventData, userProfilesData } = results;
		const areEventsValid = eventData.every(validateEvent);
		const areUsersValid = userProfilesData.every(validateUser);

		const invalidEvents = eventData.filter(e => !validateEvent(e));
		const invalidUsers = userProfilesData.filter(u => !validateUser(u));
		
		expect(areEventsValid).toBe(true);
		expect(areUsersValid).toBe(true);
	}, timeout);


});

describe('options + tweaks', () => {
	test('creates sessionIds', async () => {
		const results = await generate({ writeToDisk: false, numEvents: 1000, numUsers: 100, sessionIds: true });
		const { eventData } = results;
		const sessionIds = eventData.map(a => a.$session_id).filter(a => a);
		expect(sessionIds.length).toBe(eventData.length);
	}, timeout);

	test('no sessionIds', async () => {
		const results = await generate({ writeToDisk: false, numEvents: 1000, numUsers: 100, sessionIds: false });
		const { eventData } = results;
		const sessionIds = eventData.map(a => a.$session_id).filter(a => a);
		expect(sessionIds.length).toBe(0);
	}, timeout);

	test('creates anonymousIds', async () => {
		const results = await generate({ writeToDisk: false, numEvents: 1000, numUsers: 100, anonIds: true });
		const { eventData } = results;
		const anonIds = eventData.map(a => a.$device_id).filter(a => a);
		const userIds = eventData.map(a => a.$user_id).filter(a => a);
		expect(anonIds.length).toBe(eventData.length);
		expect(userIds.length).toBeLessThan(anonIds.length);
	}, timeout);

	test('no anonymousIds', async () => {
		const results = await generate({ writeToDisk: false, numEvents: 1000, numUsers: 100, anonIds: false });
		const { eventData } = results;
		const anonIds = eventData.map(a => a.$device_id).filter(a => a);
		expect(anonIds.length).toBe(0);
	}, timeout);


});



afterEach(() => {

});

afterAll(() => {
	try {
		console.log('clearing...');
		execSync(`npm run prune`);
		console.log('...files cleared 👍');
	}
	catch (err) {
		console.log('error clearing files');
	}
});

//helpers

function validateEvent(event) {
	if (!event.event) return false;
	if (!event.$device_id && !event.$user_id) return false;
	if (!event.time) return false;
	if (!event.$insert_id) return false;
	return true;
}


function validateUser(user) {
	if (!user.distinct_id) return false;
	if (!user.$name) return false;
	if (!user.$email) return false;
	if (!user.$created) return false;
	return true;
}