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

const timeout = 600000;
const testToken = process.env.TEST_TOKEN || "hello token!";

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
		// expect(parsedUsers.every(u => u.created)).toBe(true);
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
		const csvs = (await u.ls('./data')).filter(a => a.includes('.json'));
		expect(csvs.length).toBe(8);

	}, timeout);

	test('--simple', async () => {
		console.log('SIMPLE CLI TEST');
		const run = execSync(`node ./index.js --numEvents 1000 --numUsers 100 --seed "deal with it" --simple`);
		expect(run.toString().trim().includes('enjoy your data! :)')).toBe(true);
		const csvs = (await u.ls('./data')).filter(a => a.includes('.csv'));
		expect(csvs.length).toBe(2);

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
	// if (!user.created) return false;
	return true;
}


function validTime(str) {
	if (!str) return false;
	if (str.startsWith('-')) return false;
	if (!str.startsWith('20')) return false;
	return true;
}