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
		const results = await generate({ writeToDisk: false, numEvents: 1100, numUsers: 100, seed: "deal with it", token: testToken});
		const {events, users, groups } = results.import;
		expect(events.success).toBeGreaterThan(980);
		expect(users.success).toBe(100);
		expect(groups.length).toBe(0);		

	}, timeout);
	


});



afterEach(() => {

});

afterAll(() => {
	console.log('clearing...');
	execSync(`npm run prune`);
	console.log('...files cleared 👍');
});