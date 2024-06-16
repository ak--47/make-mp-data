const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const fs = require('fs');
const u = require('ak-tools');
dayjs.extend(utc);
require('dotenv').config();

/** @typedef {import('../types.js').Config} Config */
/** @typedef {import('../types.js').EventConfig} EventConfig */
/** @typedef {import('../types.js').ValueValid} ValueValid */
/** @typedef {import('../types.js').EnrichedArray} hookArray */
/** @typedef {import('../types.js').hookArrayOptions} hookArrayOptions */
/** @typedef {import('../types.js').Person} Person */
/** @typedef {import('../types.js').Funnel} Funnel */

const MAIN = require('../core/index.js');
const { generators, orchestrators } = MAIN;
const { makeAdSpend, makeEvent, makeFunnel, makeProfile, makeSCD } = generators;
const { sendToMixpanel, userLoop, validateDungeonConfig, writeFiles } = orchestrators;
const { hookArray } = require('../core/utils.js');


// Mock the global variables
let CAMPAIGNS;
let DEFAULTS;
let STORAGE;
let CONFIG;
const { campaigns, devices, locations } = require('../core/defaults.js');

beforeEach(() => {
	// Reset global variables before each test
	CAMPAIGNS = [
		{ utm_campaign: ["campaign1", "campaign2"], utm_source: ["source1"], utm_medium: ["medium1"], utm_content: ["content1"], utm_term: ["term1"] }
	];
	DEFAULTS = {
		locationsUsers: () => ({ city: 'San Francisco' }),
		locationsEvents: () => ({ city: 'San Francisco' }),
		iOSDevices: () => 'iPhone',
		androidDevices: () => 'Android',
		desktopDevices: () => 'Desktop',
		browsers: () => 'Chrome',
		campaigns: () => 'campaign1'
	};
	STORAGE = {
		eventData: hookArray([], {}),
		userProfilesData: hookArray([], {}),
		adSpendData: hookArray([], {}),
		scdTableData: [hookArray([], {})],
		groupProfilesData: hookArray([], {}),
		lookupTableData: hookArray([], {}),
		mirrorEventData: hookArray([], {})
	};
	CONFIG = {
		numUsers: 10,
		numEvents: 100,
		numDays: 30,
		simulationName: 'TestSimulation',
		hook: (record) => record
	};
	global.CAMPAIGNS = CAMPAIGNS;
	global.DEFAULTS = DEFAULTS;
	global.STORAGE = STORAGE;
	global.CONFIG = CONFIG;
	global.NOW = dayjs().unix(); // Mock global NOW

});

beforeEach(() => {

});

describe('generators', () => {

	test('adspend: works', () => {
		const campaigns = [{
			utm_source: ["foo"],
			utm_campaign: ["one"],
			utm_medium: ["two"],
			utm_content: ["three"],
			utm_term: ["four"]
		},
		{
			utm_source: ["bar"],
			utm_campaign: ["five"],
			utm_medium: ["six"],
			utm_content: ["seven"],
			utm_term: ["eight"]
		}];
		const result = makeAdSpend(dayjs().subtract(30, 'day').toISOString(), campaigns);
		expect(result.length).toBe(2);
		expect(result[0]).toHaveProperty('event', '$ad_spend');
		expect(result[1]).toHaveProperty('event', '$ad_spend');
	});

	test('makeEvent: works', () => {
		const eventConfig = {
			event: "test_event",
			properties: {
				prop1: ["value1", "value2"],
				prop2: [1, 2, 3]
			}
		};
		const result = makeEvent("distinct_id", ["anon_id"], ["session_id"], dayjs().unix(), eventConfig, {}, []);
		expect(result).toHaveProperty('event', 'test_event');
		expect(result).toHaveProperty('distinct_id', 'distinct_id');
	});

	test('makeFunnel: works', () => {
		const funnelConfig = {
			sequence: ["step1", "step2"],
			conversionRate: 100,
			order: 'sequential'
		};
		const user = { distinct_id: "user1", created: dayjs().toISOString(), anonymousIds: [], sessionIds: [] };
		const profile = {};
		const scd = {};
		const result = makeFunnel(funnelConfig, user, profile, scd, dayjs().unix(), {});
		expect(result[0].length).toBe(2);
		expect(result[1]).toBe(true);
	});

	test('makeProfile: works', () => {
		const props = {
			name: ["John", "Jane"],
			age: [25, 30]
		};
		const result = makeProfile(props, {});
		expect(result).toHaveProperty('name');
		expect(result).toHaveProperty('age');
	});

	test('makeSCD: works', () => {
		const result = makeSCD({ prop1: ["value1", "value2"] }, "prop1", "distinct_id", 2, dayjs().toISOString());
		expect(result.length).toBe(2);
		expect(result[0]).toHaveProperty('distinct_id', 'distinct_id');
		expect(result[0]).toHaveProperty('startTime');
		expect(result[0]).toHaveProperty('insertTime');
	});

});

describe('orchestrators', () => {

	test('sendToMixpanel: works', async () => {
		const config = { token: "test_token" };
		const result = await sendToMixpanel(config, storage);
		expect(result).toHaveProperty('events');
		expect(result).toHaveProperty('users');
	});

	test('userLoop: works', () => {
		const config = {
			numUsers: 10,
			numEvents: 100,
			numDays: 30,
			userProps: {},
			scdProps: {},
			funnels: [],
			isAnonymous: false,
			hasAnonIds: false,
			hasSessionIds: false,
			hasLocation: false,
			events: [{ event: "foo" }, { event: "bar" }, { event: "baz" }]
		};
		userLoop(config, storage);
		expect(storage.userProfilesData.length).toBe(10);
		expect(storage.eventData.length).toBeGreaterThan(0);
	});

	test('validateDungeonConfig: works', () => {
		const config = {
			numEvents: 100,
			numUsers: 10,
			numDays: 30
		};
		const result = validateDungeonConfig(config);
		expect(result).toHaveProperty('numEvents', 100);
		expect(result).toHaveProperty('numUsers', 10);
		expect(result).toHaveProperty('numDays', 30);
		expect(result).toHaveProperty('events');
		expect(result).toHaveProperty('superProps');
	});

	test('writeFiles: works', async () => {
		const config = {
			format: 'json',
			writeToDisk: true
		};
		const result = await writeFiles(config, storage);
		expect(result).toBeInstanceOf(Array);
	});
});
