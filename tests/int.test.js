const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const fs = require('fs');
const u = require('ak-tools');
dayjs.extend(utc);
require('dotenv').config();
const path = require('path');

/** @typedef {import('../types.js').Config} Config */
/** @typedef {import('../types.js').EventConfig} EventConfig */
/** @typedef {import('../types.js').ValueValid} ValueValid */
/** @typedef {import('../types.js').EnrichedArray} hookArray */
/** @typedef {import('../types.js').hookArrayOptions} hookArrayOptions */
/** @typedef {import('../types.js').Person} Person */
/** @typedef {import('../types.js').Funnel} Funnel */
/** @typedef {import('../types.js').UserProfile} UserProfile */
/** @typedef {import('../types.js').SCDSchema} SCDSchema */

const MAIN = require('../core/index.js');
const { generators, orchestrators } = MAIN;
const { makeAdSpend, makeEvent, makeFunnel, makeProfile, makeSCD } = generators;
const { sendToMixpanel, userLoop, validateDungeonConfig, writeFiles } = orchestrators;
const { hookArray, validEvent } = require('../core/utils.js');


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

	test('adspend: empty', () => {
		const result = makeAdSpend(dayjs().subtract(30, 'day').toISOString(), []);
		expect(result.length).toBe(0);
	});

	test('adspend: external', () => {
		const campaigns = [
			{ utm_source: ["source1"], utm_campaign: ["one"], utm_medium: ["two"], utm_content: ["three"], utm_term: ["four"] },
			{ utm_source: ["source2"], utm_campaign: ["two"], utm_medium: ["three"], utm_content: ["four"], utm_term: ["five"] }
		];
		const result = makeAdSpend(dayjs().subtract(30, 'day').toISOString(), campaigns);
		expect(result.length).toBe(2);
		result.forEach(event => {
			expect(event).toHaveProperty('event', '$ad_spend');
			expect(event).toHaveProperty('utm_campaign');
			expect(event).toHaveProperty('utm_source');
			expect(event).toHaveProperty('cost');
			expect(event).toHaveProperty('clicks');
			expect(event).toHaveProperty('impressions');
			expect(event).toHaveProperty('views');
		});
	});


	test('makeEvent: works', () => {
		/** @type {EventConfig} */
		const eventConfig = {
			event: "test_event",
			properties: {
				prop1: ["value1", "value2"],
				prop2: ["value3", "value4"],
				prop3: ["value5"]
			},
		};
		const result = makeEvent("known_id", dayjs().subtract(1, 'd').unix(), eventConfig, ["anon_id"], ["session_id"]);
		expect(result).toHaveProperty('event', 'test_event');
		expect(result).toHaveProperty('device_id', 'anon_id');
		// expect(result).toHaveProperty('user_id', 'known_id'); // Known ID not always on the event
		expect(result).toHaveProperty('session_id', 'session_id');
		expect(result).toHaveProperty('source', 'dm4');
		expect(result).toHaveProperty('insert_id');
		expect(result).toHaveProperty('time');
		expect(result).toHaveProperty('prop1');
		expect(result).toHaveProperty('prop2');
		expect(result.prop1 === "value1" || result.prop1 === "value2").toBeTruthy();
		expect(result.prop2 === "value3" || result.prop2 === "value4").toBeTruthy();
		expect(result).toHaveProperty('prop3', 'value5');
	});

	test('makeEvent: opt params', () => {
		const eventConfig = { event: "test_event", properties: {} };
		const result = makeEvent("known_id", dayjs().subtract(1, 'd').unix(), eventConfig);
		expect(result).toHaveProperty('event', 'test_event');
		expect(result).toHaveProperty('user_id', 'known_id');
		expect(result).toHaveProperty('source', 'dm4');
		expect(result).toHaveProperty('insert_id');
		expect(result).toHaveProperty('time');
	});

	test('makeEvent: correct defaults', () => {
		const eventConfig = {
			event: "test_event",
			properties: {
				prop1: ["value1", "value2"],
				prop2: ["value3", "value4"]
			},
		};
		const result = makeEvent("known_id", dayjs().subtract(1, 'd').unix(), eventConfig, ["anon_id"], ["session_id"]);
		expect(result.prop1 === "value1" || result.prop1 === "value2").toBeTruthy();
		expect(result.prop2 === "value3" || result.prop2 === "value4").toBeTruthy();
	});


	test('makeFunnel: works', () => {
		const funnelConfig = {
			sequence: ["step1", "step2"],
			conversionRate: 100,
			order: 'sequential'
		};
		/** @type {Person} */
		const user = { distinct_id: "user1", name: "test", created: dayjs().toISOString(), anonymousIds: [], sessionIds: [] };
		/** @type {UserProfile} */
		const profile = { created: dayjs().toISOString(), distinct_id: "user1" };
		/** @type {Record<string, SCDSchema[]>} */
		const scd = { "scd_example": [{ distinct_id: "user1", insertTime: dayjs().toISOString(), startTime: dayjs().toISOString() }] };

		const [result, converted] = makeFunnel(funnelConfig, user, dayjs().unix(), profile, scd, {});
		expect(result.length).toBe(2);
		expect(converted).toBe(true);
		expect(result.every(e => validEvent(e))).toBeTruthy();
	});

	test('makeFunnel: conversion rates', () => {
		const funnelConfig = {
			sequence: ["step1", "step2", "step3"],
			conversionRate: 50,
			order: 'sequential'
		};
		const user = { distinct_id: "user1", name: "test", created: dayjs().toISOString(), anonymousIds: [], sessionIds: [] };
		const profile = { created: dayjs().toISOString(), distinct_id: "user1" };
		const scd = { "scd_example": [{ distinct_id: "user1", insertTime: dayjs().toISOString(), startTime: dayjs().toISOString() }] };

		const [result, converted] = makeFunnel(funnelConfig, user, dayjs().unix(), profile, scd, {});
		expect(result.length).toBeGreaterThanOrEqual(1);
		expect(result.length).toBeLessThanOrEqual(3);
		expect(result.every(e => validEvent(e))).toBeTruthy();
	});

	test('makeFunnel: ordering', () => {
		const funnelConfig = {
			sequence: ["step1", "step2", "step3"],
			conversionRate: 100,
			order: 'random'
		};
		const user = { distinct_id: "user1", name: "test", created: dayjs().toISOString(), anonymousIds: [], sessionIds: [] };
		const profile = { created: dayjs().toISOString(), distinct_id: "user1" };
		const scd = { "scd_example": [{ distinct_id: "user1", insertTime: dayjs().toISOString(), startTime: dayjs().toISOString() }] };

		const [result, converted] = makeFunnel(funnelConfig, user, dayjs().unix(), profile, scd, {});
		expect(result.length).toBe(3);
		expect(converted).toBe(true);
		expect(result.every(e => validEvent(e))).toBeTruthy();
	});


	test('makeProfile: works', () => {
		const props = {
			name: ["John", "Jane"],
			age: [25, 30]
		};
		const result = makeProfile(props, { foo: "bar" });
		expect(result).toHaveProperty('name');
		expect(result).toHaveProperty('age');
		expect(result).toHaveProperty('foo', 'bar');
		expect(result.name === "John" || result.name === "Jane").toBeTruthy();
		expect(result.age === 25 || result.age === 30).toBeTruthy();
	});

	test('makeProfile: correct defaults', () => {
		const props = {
			name: ["John", "Jane"],
			age: [25, 30]
		};
		const result = makeProfile(props);
		expect(result).toHaveProperty('name');
		expect(result).toHaveProperty('age');
		expect(result.name === "John" || result.name === "Jane").toBeTruthy();
		expect(result.age === 25 || result.age === 30).toBeTruthy();
	});


	test('makeSCD: works', () => {
		const result = makeSCD(["value1", "value2"], "prop1", "distinct_id", 2, dayjs().toISOString());
		expect(result.length).toBe(2);
		const [first, second] = result;
		expect(first).toHaveProperty('prop1');
		expect(second).toHaveProperty('prop1');
		expect(first).toHaveProperty('distinct_id', 'distinct_id');
		expect(second).toHaveProperty('distinct_id', 'distinct_id');
		expect(first).toHaveProperty('startTime');
		expect(second).toHaveProperty('startTime');
		expect(first).toHaveProperty('insertTime');
		expect(second).toHaveProperty('insertTime');
		expect(first.prop1 === "value1" || first.prop1 === "value2").toBeTruthy();
		expect(second.prop1 === "value1" || second.prop1 === "value2").toBeTruthy();
		expect(result[0]).toHaveProperty('distinct_id', 'distinct_id');
		expect(result[0]).toHaveProperty('startTime');
		expect(result[0]).toHaveProperty('insertTime');
	});

	test('makeSCD: no mutations', () => {
		const result = makeSCD(["value1", "value2"], "prop1", "distinct_id", 0, dayjs().toISOString());
		expect(result.length).toBe(0);
	});

	test('makeSCD: large mutations', () => {
		const result = makeSCD(["value1", "value2"], "prop1", "distinct_id", 100, dayjs().toISOString());
		expect(result.length).toBe(5);
		result.forEach(entry => {
			expect(entry).toHaveProperty('prop1');
			expect(entry).toHaveProperty('distinct_id', 'distinct_id');
			expect(entry).toHaveProperty('startTime');
			expect(entry).toHaveProperty('insertTime');
			expect(entry.prop1 === "value1" || entry.prop1 === "value2").toBeTruthy();
		});
	});


});

describe('orchestrators', () => {

	test('sendToMixpanel: works', async () => {
		CONFIG.token = "test_token";
		const result = await sendToMixpanel(CONFIG, STORAGE);
		expect(result).toHaveProperty('events');
		expect(result).toHaveProperty('users');
		expect(result).toHaveProperty('groups');
	});

	test('sendToMixpanel: no token', async () => {
		CONFIG.token = null;
		await expect(sendToMixpanel(CONFIG, STORAGE)).rejects.toThrow();
	});

	test('sendToMixpanel: empty storage', async () => {
		CONFIG.token = "test_token";
		STORAGE = {
			eventData: hookArray([], {}),
			userProfilesData: hookArray([], {}),
			adSpendData: hookArray([], {}),
			scdTableData: [hookArray([], {})],
			groupProfilesData: hookArray([], {}),
			lookupTableData: hookArray([], {}),
			mirrorEventData: hookArray([], {})
		};
		const result = await sendToMixpanel(CONFIG, STORAGE);
		expect(result.events.success).toBe(0);
		expect(result.users).toEqual({});
		expect(result.groups).toHaveLength(0);
	});


	test('userLoop: works (no funnels)', () => {
		/** @type {Config} */
		const config = {
			numUsers: 2,
			numEvents: 25,
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
		userLoop(config, STORAGE);
		expect(STORAGE.userProfilesData.length).toBe(2);
		expect(STORAGE.eventData.length).toBeGreaterThan(15);
		expect(STORAGE.eventData.every(e => validEvent(e))).toBeTruthy();
	});


	test('userLoop: works (funnels)', () => {
		/** @type {Config} */
		const config = {
			numUsers: 2,
			numEvents: 50,
			numDays: 30,
			userProps: {},
			scdProps: {},
			events: [],
			funnels: [{ sequence: ["step1", "step2"], conversionRate: 100, order: 'sequential' }],
		};
		userLoop(config, STORAGE);
		expect(STORAGE.userProfilesData.length).toBe(2);
		expect(STORAGE.eventData.length).toBeGreaterThan(25);
		expect(STORAGE.eventData.every(e => validEvent(e))).toBeTruthy();


	});

	test('userLoop: mixed config', () => {
		const config = {
			numUsers: 3,
			numEvents: 15,
			numDays: 10,
			userProps: { name: ["Alice", "Bob", "Charlie"] },
			scdProps: { prop1: ["value1", "value2"] },
			funnels: [],	
			events: [{ event: "event1" }, { event: "event2" }]
		};
		userLoop(config, STORAGE);
		expect(STORAGE.userProfilesData.length).toBe(3);
		expect(STORAGE.eventData.length).toBeGreaterThan(0);
		expect(STORAGE.eventData.every(e => validEvent(e))).toBeTruthy();
	});

	test('userLoop: no events', () => {
		const config = {
			numUsers: 2,
			numEvents: 0,
			numDays: 30,
			userProps: {},
			scdProps: {},
			funnels: [],
			isAnonymous: false,
			hasAnonIds: false,
			hasSessionIds: false,
			hasLocation: false,
			events: []
		};
		userLoop(config, STORAGE);
		expect(STORAGE.userProfilesData.length).toBe(2);
		expect(STORAGE.eventData.length).toBe(0);
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

	test('validateDungeonConfig: correct defaults', () => {
		const config = {};
		const result = validateDungeonConfig(config);
		expect(result).toHaveProperty('numEvents', 100_000);
		expect(result).toHaveProperty('numUsers', 1000);
		expect(result).toHaveProperty('numDays', 30);
		expect(result).toHaveProperty('events');
		expect(result).toHaveProperty('superProps');
	});

	test('validateDungeonConfig: merges', () => {
		const config = {
			numEvents: 100,
			numUsers: 10,
			numDays: 30,
			events: [{ event: "test_event" }],
			superProps: { luckyNumber: [7] }
		};
		const result = validateDungeonConfig(config);
		expect(result).toHaveProperty('numEvents', 100);
		expect(result).toHaveProperty('numUsers', 10);
		expect(result).toHaveProperty('numDays', 30);
		expect(result).toHaveProperty('events', [{ event: "test_event" }]);
		expect(result).toHaveProperty('superProps', { luckyNumber: [7] });
	});


	test('writeFiles: works', async () => {
		/** @type {Config} */
		const config = {
			format: 'json',
			writeToDisk: './data',
			simulationName: 'TestSimulation'
		};
		const result = await writeFiles(config, STORAGE);
		const [first, second] = result;
		expect(result).toBeInstanceOf(Array);
		expect(path.basename(first)).toBe('TestSimulation-EVENTS.json');
		expect(path.basename(second)).toBe('TestSimulation-USERS.json');
		const dir = await u.ls('./data');
		expect(dir).toContain(first);
		expect(dir).toContain(second);
		const removeOne = await u.rm(first);
		const removeTwo = await u.rm(second);
	});


	test('writeFiles: CSVs', async () => {
		const config = {
			format: 'csv',
			writeToDisk: './data',
			simulationName: 'TestSimulation'
		};
		const result = await writeFiles(config, STORAGE);
		expect(result).toBeInstanceOf(Array);
		const dir = await u.ls('./data');
		result.forEach(file => {
			expect(dir).toContain(file);
		});
		await Promise.all(result.map(file => u.rm(file)));
	});

});
