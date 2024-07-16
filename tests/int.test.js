const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const fs = require('fs');
const u = require('ak-tools');
dayjs.extend(utc);
require('dotenv').config();
const path = require('path');

/** @typedef {import('../types.js').Config} Config */
/** @typedef {import('../types.js').EventConfig} EventConfig */
/** @typedef {import("../types.js").EventSchema} EventSchema */
/** @typedef {import('../types.js').ValueValid} ValueValid */
/** @typedef {import('../types.js').HookedArray} hookArray */
/** @typedef {import('../types.js').hookArrayOptions} hookArrayOptions */
/** @typedef {import('../types.js').Person} Person */
/** @typedef {import('../types.js').Funnel} Funnel */
/** @typedef {import('../types.js').UserProfile} UserProfile */
/** @typedef {import('../types.js').SCDSchema} SCDSchema */
/** @typedef {import('../types.js').Storage} Storage */

const MAIN = require('../index.js');
const { generators, orchestrators, meta } = MAIN;
const { makeAdSpend, makeEvent, makeFunnel, makeProfile, makeSCD, makeMirror } = generators;
const { sendToMixpanel, userLoop, validateDungeonConfig } = orchestrators;
const { hookArray, inferFunnels } = meta;
const { validEvent } = require('../components/utils.js');


// Mock the global variables
let CAMPAIGNS;
let DEFAULTS;
let STORAGE;
let CONFIG;
const { campaigns, devices, locations } = require('../components/defaults.js');

beforeEach(async () => {
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

	/** @type {Storage} */
	STORAGE = {
		eventData: await hookArray([], {}),
		userProfilesData: await hookArray([], {}),
		adSpendData: await hookArray([], {}),
		scdTableData: [await hookArray([], {})],
		groupProfilesData: await hookArray([], {}),
		lookupTableData: await hookArray([], {}),
		mirrorEventData: await hookArray([], {})
	};


	/** @type {Config} */
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
	global.FIXED_NOW = dayjs().unix(); // Mock global NOW

});

beforeEach(() => {

});

describe('generators', () => {

	test('adspend: works', async () => {
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
		const result = await makeAdSpend(dayjs().subtract(30, 'day').toISOString(), campaigns);
		expect(result.length).toBe(2);
		expect(result[0]).toHaveProperty('event', '$ad_spend');
		expect(result[1]).toHaveProperty('event', '$ad_spend');
	});

	test('adspend: empty', async () => {
		const result = await makeAdSpend(dayjs().subtract(30, 'day').toISOString(), []);
		expect(result.length).toBe(0);
	});

	test('adspend: external', async () => {
		const campaigns = [
			{ utm_source: ["source1"], utm_campaign: ["one"], utm_medium: ["two"], utm_content: ["three"], utm_term: ["four"] },
			{ utm_source: ["source2"], utm_campaign: ["two"], utm_medium: ["three"], utm_content: ["four"], utm_term: ["five"] }
		];
		const result = await makeAdSpend(dayjs().subtract(30, 'day').toISOString(), campaigns);
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


	test('makeEvent: works', async () => {
		/** @type {EventConfig} */
		const eventConfig = {
			event: "test_event",
			properties: {
				prop1: ["value1", "value2"],
				prop2: ["value3", "value4"],
				prop3: ["value5"]
			},
		};
		const result = await makeEvent("known_id", dayjs().subtract(1, 'd').unix(), eventConfig, ["anon_id"], ["session_id"]);
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

	test('makeEvent: opt params', async () => {
		const eventConfig = { event: "test_event", properties: {} };
		const result = await makeEvent("known_id", dayjs().subtract(1, 'd').unix(), eventConfig);
		expect(result).toHaveProperty('event', 'test_event');
		expect(result).toHaveProperty('user_id', 'known_id');
		expect(result).toHaveProperty('source', 'dm4');
		expect(result).toHaveProperty('insert_id');
		expect(result).toHaveProperty('time');
	});

	test('makeEvent: correct defaults', async () => {
		const eventConfig = {
			event: "test_event",
			properties: {
				prop1: ["value1", "value2"],
				prop2: ["value3", "value4"]
			},
		};
		const result = await makeEvent("known_id", dayjs().subtract(1, 'd').unix(), eventConfig, ["anon_id"], ["session_id"]);
		expect(result.prop1 === "value1" || result.prop1 === "value2").toBeTruthy();
		expect(result.prop2 === "value3" || result.prop2 === "value4").toBeTruthy();
	});


	test('makeFunnel: works', async () => {
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

		const [result, converted] = await makeFunnel(funnelConfig, user, dayjs().unix(), profile, scd, {});
		expect(result.length).toBe(2);
		expect(converted).toBe(true);
		expect(result.every(e => validEvent(e))).toBeTruthy();
	});

	test('makeFunnel: conversion rates', async () => {
		const funnelConfig = {
			sequence: ["step1", "step2", "step3"],
			conversionRate: 50,
			order: 'sequential'
		};
		const user = { distinct_id: "user1", name: "test", created: dayjs().toISOString(), anonymousIds: [], sessionIds: [] };
		const profile = { created: dayjs().toISOString(), distinct_id: "user1" };
		const scd = { "scd_example": [{ distinct_id: "user1", insertTime: dayjs().toISOString(), startTime: dayjs().toISOString() }] };

		const [result, converted] = await makeFunnel(funnelConfig, user, dayjs().unix(), profile, scd, {});
		expect(result.length).toBeGreaterThanOrEqual(1);
		expect(result.length).toBeLessThanOrEqual(3);
		expect(result.every(e => validEvent(e))).toBeTruthy();
	});

	test('makeFunnel: ordering', async () => {
		const funnelConfig = {
			sequence: ["step1", "step2", "step3"],
			conversionRate: 100,
			order: 'random'
		};
		const user = { distinct_id: "user1", name: "test", created: dayjs().toISOString(), anonymousIds: [], sessionIds: [] };
		const profile = { created: dayjs().toISOString(), distinct_id: "user1" };
		const scd = { "scd_example": [{ distinct_id: "user1", insertTime: dayjs().toISOString(), startTime: dayjs().toISOString() }] };

		const [result, converted] = await makeFunnel(funnelConfig, user, dayjs().unix(), profile, scd, {});
		expect(result.length).toBe(3);
		expect(converted).toBe(true);
		expect(result.every(e => validEvent(e))).toBeTruthy();
	});


	test('makeProfile: works', async () => {
		const props = {
			name: ["John", "Jane"],
			age: [25, 30]
		};
		const result = await makeProfile(props, { foo: "bar" });
		expect(result).toHaveProperty('name');
		expect(result).toHaveProperty('age');
		expect(result).toHaveProperty('foo', 'bar');
		expect(result.name === "John" || result.name === "Jane").toBeTruthy();
		expect(result.age === 25 || result.age === 30).toBeTruthy();
	});

	test('makeProfile: correct defaults', async () => {
		const props = {
			name: ["John", "Jane"],
			age: [25, 30]
		};
		const result = await makeProfile(props);
		expect(result).toHaveProperty('name');
		expect(result).toHaveProperty('age');
		expect(result.name === "John" || result.name === "Jane").toBeTruthy();
		expect(result.age === 25 || result.age === 30).toBeTruthy();
	});


	test('makeSCD: works', async () => {
		const result = await makeSCD(["value1", "value2"], "prop1", "distinct_id", 5, dayjs().toISOString());
		expect(result.length).toBeGreaterThan(0);
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

	test('makeSCD: no mutations', async () => {
		const result = await makeSCD(["value1", "value2"], "prop1", "distinct_id", 0, dayjs().toISOString());
		expect(result.length).toBe(0);
	});

	test('makeSCD: large mutations', async () => {
		const result = await makeSCD(["value1", "value2"], "prop1", "distinct_id", 100, dayjs().subtract(100, 'd').toISOString());
		expect(result.length).toBeGreaterThan(0);
		result.forEach(entry => {
			expect(entry).toHaveProperty('prop1');
			expect(entry).toHaveProperty('distinct_id', 'distinct_id');
			expect(entry).toHaveProperty('startTime');
			expect(entry).toHaveProperty('insertTime');
			expect(entry.prop1 === "value1" || entry.prop1 === "value2").toBeTruthy();
		});
	});

	test('mirror: create', async () => {
		/** @type {EventSchema} */
		const oldEvent = {
			event: "old",
			insert_id: "test",
			source: "test",
			time: dayjs().toISOString(),
			user_id: "test"
		};

		/** @type {Config} */
		const config = {
			mirrorProps: {
				"newProp": {
					events: "*",
					strategy: "create",
					values: ["new"]
				}
			}
		};
		await STORAGE.eventData.hookPush(oldEvent);
		//ugh side fx
		await makeMirror(config, STORAGE);
		const [newData] = STORAGE.mirrorEventData;
		expect(newData).toHaveProperty('newProp', "new");
	});

	test('mirror: delete', async () => {
		/** @type {EventSchema} */
		const oldEvent = {
			event: "old",
			insert_id: "test",
			source: "test",
			time: dayjs().toISOString(),
			user_id: "test",
			oldProp: "valueToDelete"
		};

		/** @type {Config} */
		const config = {
			mirrorProps: {
				"oldProp": {
					events: "*",
					strategy: "delete"
				}
			}
		};
		await STORAGE.eventData.hookPush(oldEvent);

		await makeMirror(config, STORAGE);
		const [newData] = STORAGE.mirrorEventData;
		expect(newData).not.toHaveProperty('oldProp');
	});

	test('mirror: fill', async () => {
		/** @type {EventSchema} */
		const oldEvent = {
			event: "old",
			insert_id: "test",
			source: "test",
			time: dayjs().subtract(8, 'days').toISOString(),  // Set time to 8 days ago
			user_id: "test",
			fillProp: "initialValue"
		};

		/** @type {Config} */
		const config = {
			mirrorProps: {
				"fillProp": {
					events: "*",
					strategy: "fill",
					values: ["filledValue"],
					daysUnfilled: 7
				}
			}
		};
		await STORAGE.eventData.hookPush(oldEvent);

		await makeMirror(config, STORAGE);
		const [newData] = STORAGE.mirrorEventData;
		expect(newData).toHaveProperty('fillProp', "filledValue");
	});

	test('mirror: update', async () => {
		/** @type {EventSchema} */
		const oldEvent = {
			event: "old",
			insert_id: "test",
			source: "test",
			time: dayjs().toISOString(),
			user_id: "test",
			updateProp: "initialValue"
		};

		/** @type {Config} */
		const config = {
			mirrorProps: {
				"updateProp": {
					events: "*",
					strategy: "update",
					values: ["updatedValue"]
				}
			}
		};
		await STORAGE.eventData.hookPush(oldEvent);

		await makeMirror(config, STORAGE);
		const [newData] = STORAGE.mirrorEventData;
		expect(newData).toHaveProperty('updateProp', "initialValue");
	});

	test('mirror: update nulls', async () => {
		/** @type {EventSchema} */
		const oldEvent = {
			event: "old",
			insert_id: "test",
			source: "test",
			time: dayjs().toISOString(),
			user_id: "test"
			// updateProp is not set initially
		};

		/** @type {Config} */
		const config = {
			mirrorProps: {
				"updateProp": {
					events: "*",
					strategy: "update",
					values: ["updatedValue"]
				}
			}
		};
		await STORAGE.eventData.hookPush(oldEvent);

		await makeMirror(config, STORAGE);
		const [newData] = STORAGE.mirrorEventData;
		expect(newData).toHaveProperty('updateProp', "updatedValue");
	});


	test('mirror: update with no initial value', async () => {
		/** @type {EventSchema} */
		const oldEvent = {
			event: "old",
			insert_id: "test",
			source: "test",
			time: dayjs().toISOString(),
			user_id: "test"
			// updateProp is not set initially
		};

		/** @type {Config} */
		const config = {
			mirrorProps: {
				"updateProp": {
					events: "*",
					strategy: "update",
					values: ["updatedValue"]
				}
			}
		};
		await STORAGE.eventData.hookPush(oldEvent);

		await makeMirror(config, STORAGE);
		const [newData] = STORAGE.mirrorEventData;
		expect(newData).toHaveProperty('updateProp', "updatedValue");
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
			eventData: await hookArray([], {}),
			userProfilesData: await hookArray([], {}),
			adSpendData: await hookArray([], {}),
			scdTableData: [await hookArray([], {})],
			groupProfilesData: await hookArray([], {}),
			lookupTableData: await hookArray([], {}),
			mirrorEventData: await hookArray([], {})
		};
		const result = await sendToMixpanel(CONFIG, STORAGE);
		expect(result.events.success).toBe(0);
		expect(result.users.success).toBe(0)
		expect(result.groups).toHaveLength(0);
	});


	test('userLoop: works (no funnels)', async () => {
		/** @type {Config} */
		const config = {
			numUsers: 2,
			numEvents: 40,
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
		await userLoop(config, STORAGE);
		expect(STORAGE.userProfilesData.length).toBe(2);
		expect(STORAGE.eventData.length).toBeGreaterThan(15);
		expect(STORAGE.eventData.every(e => validEvent(e))).toBeTruthy();
	});


	test('userLoop: works (funnels)', async () => {
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
		await userLoop(config, STORAGE);
		expect(STORAGE.userProfilesData.length).toBe(2);
		expect(STORAGE.eventData.length).toBeGreaterThan(15);
		expect(STORAGE.eventData.every(e => validEvent(e))).toBeTruthy();


	});

	test('userLoop: mixed config', async () => {
		const config = {
			numUsers: 3,
			numEvents: 15,
			numDays: 10,
			userProps: { name: ["Alice", "Bob", "Charlie"] },
			scdProps: { prop1: ["value1", "value2"] },
			funnels: [],
			events: [{ event: "event1" }, { event: "event2" }]
		};
		await userLoop(config, STORAGE);
		expect(STORAGE.userProfilesData.length).toBe(3);
		expect(STORAGE.eventData.length).toBeGreaterThan(0);
		expect(STORAGE.eventData.every(e => validEvent(e))).toBeTruthy();
	});

	test('userLoop: no events', async () => {
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
		await userLoop(config, STORAGE);
		expect(STORAGE.userProfilesData.length).toBe(2);
		expect(STORAGE.eventData.length).toBe(0);
	});



	test('validateDungeonConfig: works', async () => {
		const config = {
			numEvents: 100,
			numUsers: 10,
			numDays: 30
		};
		const result = await validateDungeonConfig(config);
		expect(result).toHaveProperty('numEvents', 100);
		expect(result).toHaveProperty('numUsers', 10);
		expect(result).toHaveProperty('numDays', 30);
		expect(result).toHaveProperty('events');
		expect(result).toHaveProperty('superProps');
	});

	test('validateDungeonConfig: correct defaults', async () => {
		const config = {};
		const result = await validateDungeonConfig(config);
		expect(result).toHaveProperty('numEvents', 100_000);
		expect(result).toHaveProperty('numUsers', 1000);
		expect(result).toHaveProperty('numDays', 30);
		expect(result).toHaveProperty('events');
		expect(result).toHaveProperty('superProps');
	});

	test('validateDungeonConfig: merges', async () => {
		const config = {
			numEvents: 100,
			numUsers: 10,
			numDays: 30,
			events: [{ event: "test_event" }],
			superProps: { luckyNumber: [7] }
		};
		const result = await validateDungeonConfig(config);
		expect(result).toHaveProperty('numEvents', 100);
		expect(result).toHaveProperty('numUsers', 10);
		expect(result).toHaveProperty('numDays', 30);
		expect(result).toHaveProperty('events', [{ event: "test_event" }]);
		expect(result).toHaveProperty('superProps', { luckyNumber: [7] });
	});



});
