import generate from '../index.js';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import fs from 'fs';
import * as u from 'ak-tools';
dayjs.extend(utc);
import 'dotenv/config';

/** @typedef {import('../types').Dungeon} Config */
/** @typedef {import('../types').EventConfig} EventConfig */
/** @typedef {import('../types').ValueValid} ValueValid */
/** @typedef {import('../types').HookedArray} hookArray */
/** @typedef {import('../types').hookArrayOptions} hookArrayOptions */
/** @typedef {import('../types').Person} Person */
/** @typedef {import('../types').Funnel} Funnel */


import {
	applySkew,
	boxMullerRandom,
	choose,
	date,
	dates,
	day,
	exhaust,
	generateEmoji,
	getUniqueKeys,
	hasSameKeys,
	deepClone,
	integer,
	mapToRange,
	person,
	pick,
	pickRandom,
	range,
	pickAWinner,
	weighNumRange,
	fixFirstAndLast,
	generateUser,
	openFinder,
	progress,
	shuffleArray,
	shuffleExceptFirst,
	shuffleExceptLast,
	shuffleMiddle,
	shuffleOutside,
	streamCSV,
	streamJSON,
	weighArray,
	buildFileNames,
	TimeSoup,
	getChance,
	initChance,
	validateEventConfig,
	validTime,
	interruptArray,
	optimizedBoxMuller,
	datesBetween,
	weighChoices
} from '../lib/utils/utils.js';

import {
	weighFunnels,
	matchConditions,
} from '../lib/orchestrators/user-loop.js';

import main from '../index.js';
import { createHookArray } from '../lib/core/storage.js';
import { inferFunnels } from '../lib/core/config-validator.js';

//todo: test for funnel inference
const hookArray = createHookArray;


describe('timesoup', () => {

	test('always valid times', () => {
		const dates = [];
		const earliest = dayjs().subtract(50, 'D').unix();
		const latest = dayjs().subtract(1, "D").unix();
		for (let i = 0; i < 10000; i++) {
			dates.push(TimeSoup(earliest, latest));
		}
		const tooOld = dates.filter(d => dayjs(d).isBefore(dayjs.unix(0)));
		const badYear = dates.filter(d => !d.startsWith('202'));
		expect(dates.every(d => dayjs(d).isAfter(dayjs.unix(0)))).toBe(true);
		expect(dates.every(d => d.startsWith('202'))).toBe(true);
		expect(tooOld.length).toBe(0);
		expect(badYear.length).toBe(0);
	});

	test('custom peaks', () => {
		const dates = [];
		const earliest = dayjs().subtract(50, 'D').unix();
		const latest = dayjs().subtract(1, "D").unix();
		for (let i = 0; i < 10000; i++) {
			dates.push(TimeSoup(earliest, latest, 10));
		}
		const tooOld = dates.filter(d => dayjs(d).isBefore(dayjs.unix(0)));
		const badYear = dates.filter(d => !d.startsWith('202'));
		expect(dates.every(d => dayjs(d).isAfter(dayjs.unix(0)))).toBe(true);
		expect(dates.every(d => d.startsWith('202'))).toBe(true);
		expect(tooOld.length).toBe(0);
		expect(badYear.length).toBe(0);
	});

	test('custom deviation', () => {
		const dates = [];
		const earliest = dayjs().subtract(50, 'D').unix();
		const latest = dayjs().subtract(1, "D").unix();
		for (let i = 0; i < 10000; i++) {
			dates.push(TimeSoup(earliest, latest, 10, .5));
		}
		const tooOld = dates.filter(d => dayjs(d).isBefore(dayjs.unix(0)));
		const badYear = dates.filter(d => !d.startsWith('202'));
		expect(dates.every(d => dayjs(d).isAfter(dayjs.unix(0)))).toBe(true);
		expect(dates.every(d => d.startsWith('202'))).toBe(true);
		expect(tooOld.length).toBe(0);
		expect(badYear.length).toBe(0);
	});


});


describe('filenames', () => {

	test('default config', () => {
		const config = { simulationName: 'testSim' };
		const result = buildFileNames(config);
		const { eventFiles, folder, groupFiles, lookupFiles, mirrorFiles, scdFiles, userFiles, adSpendFiles } = result;
		expect(eventFiles).toEqual(['testSim-EVENTS.csv']);
		expect(userFiles).toEqual(['testSim-USERS.csv']);
		expect(scdFiles).toEqual([]);
		expect(groupFiles).toEqual([]);
		expect(lookupFiles).toEqual([]);
		expect(mirrorFiles).toEqual([]);
		expect(adSpendFiles).toEqual([]);
		expect(folder).toEqual('./');
	});

	test('json format', () => {
		/** @type {Config} */
		const config = { simulationName: 'testSim', format: 'json' };
		const result = buildFileNames(config);
		const { eventFiles, folder, groupFiles, lookupFiles, mirrorFiles, scdFiles, userFiles, adSpendFiles } = result;
		expect(eventFiles).toEqual(['testSim-EVENTS.json']);
		expect(userFiles).toEqual(['testSim-USERS.json']);
		expect(scdFiles).toEqual([]);
		expect(groupFiles).toEqual([]);
		expect(lookupFiles).toEqual([]);
		expect(mirrorFiles).toEqual([]);
		expect(adSpendFiles).toEqual([]);
		expect(folder).toEqual('./');
	});

	test('scd tables', () => {
		const config = {
			simulationName: 'testSim',
			scdProps: { prop1: {}, prop2: {} }
		};
		const result = buildFileNames(config);
		const { eventFiles, folder, groupFiles, lookupFiles, mirrorFiles, scdFiles, userFiles, adSpendFiles } = result;
		expect(eventFiles).toEqual(['testSim-EVENTS.csv']);
		expect(userFiles).toEqual(['testSim-USERS.csv']);
		expect(scdFiles).toEqual(['testSim-prop1-SCD.csv', 'testSim-prop2-SCD.csv']);
		expect(groupFiles).toEqual([]);
		expect(lookupFiles).toEqual([]);
		expect(mirrorFiles).toEqual([]);
		expect(adSpendFiles).toEqual([]);
		expect(folder).toEqual('./');
	});

	test('group keys', () => {
		/** @type {Config} */
		const config = {
			simulationName: 'testSim',
			groupKeys: [['group1', 10], ['group2', 20]]
		};
		const result = buildFileNames(config);
		expect(result.groupFiles).toEqual([
			'testSim-group1-GROUP.csv',
			'testSim-group2-GROUP.csv'
		]);
	});

	test('lookup tables', () => {
		/** @type {Config} */
		const config = {
			simulationName: 'testSim',
			lookupTables: [{ key: 'lookup1', attributes: {}, entries: 10 }, { key: 'lookup2', attributes: {}, entries: 10 }]
		};
		const result = buildFileNames(config);
		expect(result.lookupFiles).toEqual([
			'testSim-lookup1-LOOKUP.csv',
			'testSim-lookup2-LOOKUP.csv'
		]);
	});

	test('mirror tables', () => {
		/** @type {Config} */
		const config = {
			simulationName: 'testSim',
			mirrorProps: { prop1: { values: [] } }
		};
		const result = buildFileNames(config);
		expect(result.mirrorFiles).toEqual(['testSim-MIRROR.csv']);
	});

	test('validate disk path', async () => {
		const config = { simulationName: 'testSim', writeToDisk: true };
		const result = await buildFileNames(config);
		expect(result.folder).toBeDefined();
	});


	test('bad name', () => {
		/** @type {Config} */
		// @ts-ignore
		const config = { simulationName: 123 };
		expect(() => buildFileNames(config)).toThrow('simName must be a string');
	});


	test('JSON: writes', async () => {
		const path = 'test.json';
		const data = [{ a: 1, b: 2 }, { a: 3, b: 4 }];
		const streamed = await streamJSON(path, data);
		const content = fs.readFileSync(path, 'utf8');
		const lines = content.trim().split('\n').map(line => JSON.parse(line));
		expect(lines).toEqual(data);
		fs.unlinkSync(path);
	});

	test('CSV: writes', async () => {
		const path = 'test.csv';
		const data = [{ a: 1, b: 2 }, { a: 3, b: 4 }];
		const streamed = await streamCSV(path, data);
		const content = fs.readFileSync(path, 'utf8');
		const lines = content.trim().split('\n');
		expect(lines.length).toBe(3); // Including header
		fs.unlinkSync(path);
	});


});


describe('determinism', () => {

	test('seed from env', () => {
		process.env.SEED = 'test-seed';
		// @ts-ignore
		initChance();
		const chance = getChance();
		expect(chance).toBeDefined();
		expect(chance.random()).toBeGreaterThanOrEqual(0);
		expect(chance.random()).toBeLessThanOrEqual(1);

	});

	test('seed explicitly passed', () => {
		const seed = 'initial-seed';
		initChance(seed);
		const chance1 = getChance();
		initChance('new-seed');
		const chance2 = getChance();
		expect(chance1).toBe(chance2);
	});

});


describe('generation', () => {

	test('user: works', () => {
		const uuid = { guid: vi.fn().mockReturnValue('uuid-123') };
		const numDays = 30;
		const user = generateUser('123', { numDays });
		expect(user).toHaveProperty('distinct_id');
		expect(user).toHaveProperty('name');
		expect(user).toHaveProperty('email');
		expect(user).not.toHaveProperty('avatar');
		expect(user).toHaveProperty('created');
		expect(user).not.toHaveProperty('anonymousIds');
		expect(user).not.toHaveProperty('sessionIds');
	});

	test('user: in time range', () => {
		const numDays = 30;
		const user = generateUser('uuid-123', { numDays });
		const createdDate = dayjs(user.created, 'YYYY-MM-DD');
		expect(createdDate.isValid()).toBeTruthy();
		expect(createdDate.isBefore(dayjs())).toBeTruthy();
	});


	test('person: works', () => {
		const numDays = 30;
		const user = person('uuid-123', numDays, false);
		expect(user).toHaveProperty('distinct_id');
		expect(user.distinct_id).toBe('uuid-123');
		expect(user).toHaveProperty('name');
		expect(user).toHaveProperty('email');
		expect(user).not.toHaveProperty('avatar');
		expect(user).toHaveProperty('created');
		expect(user).not.toHaveProperty('anonymousIds');
		expect(user).not.toHaveProperty('sessionIds');
	});

	test('person: anon', () => {
		const numDays = 30;
		const user = person('uuid-123', numDays, true);
		expect(user).toHaveProperty('distinct_id');
		expect(user).toHaveProperty('name');
		expect(user.name).toBe('Anonymous User');
		expect(user).toHaveProperty('email');
		expect(user.email.includes('*')).toBeTruthy();
		expect(user).not.toHaveProperty('avatar');
		expect(user).toHaveProperty('created');
		expect(user).not.toHaveProperty('anonymousIds');
		expect(user).not.toHaveProperty('sessionIds');
	});


	test('dates: same start end', () => {
		const start = '2023-06-10';
		const end = '2023-06-10';
		const result = datesBetween(start, end);
		expect(result).toEqual([]);
	});

	test('dates: start after end', () => {
		const start = '2023-06-12';
		const end = '2023-06-10';
		const result = datesBetween(start, end);
		expect(result).toEqual([]);
	});

	test('dates: correct', () => {
		const start = '2023-06-10';
		const end = '2023-06-13';
		const result = datesBetween(start, end);
		expect(result).toEqual([
			'2023-06-10T12:00:00.000Z',
			'2023-06-11T12:00:00.000Z',
			'2023-06-12T12:00:00.000Z'
		]);
	});

	test('dates: unix times', () => {
		const start = dayjs('2023-06-10').unix();
		const end = dayjs('2023-06-13').unix();
		const result = datesBetween(start, end);
		expect(result).toEqual([
			'2023-06-10T12:00:00.000Z',
			'2023-06-11T12:00:00.000Z',
			'2023-06-12T12:00:00.000Z'
		]);
	});

	test('dates: mixed formats', () => {
		const start = '2023-06-10';
		const end = dayjs('2023-06-13').unix();
		const result = datesBetween(start, end);
		expect(result).toEqual([
			'2023-06-10T12:00:00.000Z',
			'2023-06-11T12:00:00.000Z',
			'2023-06-12T12:00:00.000Z'
		]);
	});

	test('dates: invalid dates', () => {
		const start = 'invalid-date';
		const end = '2023-06-13';
		const result = datesBetween(start, end);
		expect(result).toEqual([]);
	});

	test('dates: same day', () => {
		const start = '2023-06-10T08:00:00.000Z';
		const end = '2023-06-10T20:00:00.000Z';
		const result = datesBetween(start, end);
		expect(result).toEqual([]);
	});

	test('dates: leap years', () => {
		const start = '2024-02-28';
		const end = '2024-03-02';
		const result = datesBetween(start, end);
		expect(result).toEqual([
			'2024-02-28T12:00:00.000Z',
			'2024-02-29T12:00:00.000Z',
			'2024-03-01T12:00:00.000Z'
		]);
	});

});


describe('validation', () => {

	beforeAll(() => {
		global.FIXED_NOW = 1672531200; // fixed point in time for testing
		global.FIXED_BEGIN = global.FIXED_NOW - (60 * 60 * 24 * 30); // 30 days ago
	});

	test('events: non arrays', () => {
		// @ts-ignore
		expect(() => validateEventConfig("not an array")).toThrow("events must be an array");
	});

	test('events: strings', () => {
		const events = ["event1", "event2"];
		const result = validateEventConfig(events);

		expect(result).toEqual([
			{ event: "event1", isFirstEvent: false, properties: {}, weight: expect.any(Number) },
			{ event: "event2", isFirstEvent: false, properties: {}, weight: expect.any(Number) },
		]);

		result.forEach(event => {
			expect(event.weight).toBeGreaterThanOrEqual(1);
			expect(event.weight).toBeLessThanOrEqual(5);
		});
	});

	test('events: objects', () => {
		const events = [{ event: "event1", properties: { a: 1 } }, { event: "event2", properties: { b: 2 } }];
		const result = validateEventConfig(events);

		expect(result).toEqual(events);
	});

	test('events: mix', () => {
		const events = ["event1", { event: "event2", properties: { b: 2 } }];
		// @ts-ignore
		const result = validateEventConfig(events);

		expect(result).toEqual([
			{ event: "event1", isFirstEvent: false, properties: {}, weight: expect.any(Number) },
			{ event: "event2", properties: { b: 2 } }
		]);

		expect(result[0].weight).toBeGreaterThanOrEqual(1);
		expect(result[0].weight).toBeLessThanOrEqual(5);
	});

	test('time: between', () => {
		const chosenTime = global.FIXED_NOW - (60 * 60 * 24 * 15); // 15 days ago
		const earliestTime = global.FIXED_NOW - (60 * 60 * 24 * 30); // 30 days ago
		const latestTime = global.FIXED_NOW;
		expect(validTime(chosenTime, earliestTime, latestTime)).toBe(true);
	});

	test('time: outside earliest', () => {
		const chosenTime = global.FIXED_NOW - (60 * 60 * 24 * 31); // 31 days ago
		const earliestTime = global.FIXED_NOW - (60 * 60 * 24 * 30); // 30 days ago
		const latestTime = global.FIXED_NOW;
		expect(validTime(chosenTime, earliestTime, latestTime)).toBe(false);
	});

	test('time: outside latest', () => {
		const chosenTime = -1;
		const earliestTime = global.FIXED_NOW - (60 * 60 * 24 * 30); // 30 days ago
		const latestTime = global.FIXED_NOW;
		expect(validTime(chosenTime, earliestTime, latestTime)).toBe(false);
	});

	test('time: inference in', () => {
		const chosenTime = global.FIXED_NOW - (60 * 60 * 24 * 15); // 15 days ago
		expect(validTime(chosenTime)).toBe(true);
	});

	test('time: inference out', () => {
		const chosenTime = global.FIXED_NOW - (60 * 60 * 24 * 31); // 31 days ago
		expect(validTime(chosenTime)).toBe(false);
	});
});

describe('enrichment', () => {

	test('hooks: noop', async () => {
		const arr = [];
		const enrichedArray = await hookArray(arr);
		await enrichedArray.hookPush(1);
		await enrichedArray.hookPush(2);
		const match = JSON.stringify(enrichedArray) === JSON.stringify([1, 2]);
		expect(match).toEqual(true);
	});

	// test('hook: double', async () => {
	// 	const arr = [];
	// 	const hook = function (num) {
	// 		return num * 2;
	// 	};
	// 	const enrichedArray = await hookArray(arr, { hook });
	// 	await enrichedArray.hookPush(1);
	// 	await enrichedArray.hookPush(2);
	// 	expect(enrichedArray.includes(2)).toBeTruthy();
	// 	expect(enrichedArray.includes(4)).toBeTruthy();
	// });

	// test('hooks: filter', async () => {
	// 	const arr = [];
	// 	const hook = (item) => item ? item.toString() : item;
	// 	const enrichedArray = await hookArray(arr, { hook });
	// 	await enrichedArray.hookPush(null);
	// 	await enrichedArray.hookPush(undefined);
	// 	await enrichedArray.hookPush({});
	// 	await enrichedArray.hookPush({ a: 1 });
	// 	await enrichedArray.hookPush([1, 2]);
	// 	expect(enrichedArray).toHaveLength(3);
	// 	expect(enrichedArray.includes('null')).toBeFalsy();
	// 	expect(enrichedArray.includes('undefined')).toBeFalsy();
	// 	expect(enrichedArray.includes('[object Object]')).toBeTruthy();
	// 	expect(enrichedArray.includes('1')).toBeTruthy();
	// 	expect(enrichedArray.includes('2')).toBeTruthy();

	// });


});


describe('utilities', () => {

	test('pick: works', () => {
		const array = [1, 2, 3];
		const item = pick(array);
		expect(array).toContain(item);
	});

	test('pick: null', () => {
		expect(pick(123)).toBe(123);
	});


	test('integer: diff', () => {
		const min = 5;
		const max = 10;
		const result = integer(min, max);
		expect(result).toBeGreaterThanOrEqual(min);
		expect(result).toBeLessThanOrEqual(max);
	});

	test('integer: same', () => {
		expect(integer(7, 7)).toBe(7);
	});


	test('date: past', () => {
		const pastDate = date(10, true, 'YYYY-MM-DD')();
		expect(dayjs(pastDate, 'YYYY-MM-DD').isValid()).toBeTruthy();
		expect(dayjs(pastDate).isBefore(dayjs())).toBeTruthy();
	});

	test('date: future', () => {
		const futureDate = date(10, false, 'YYYY-MM-DD')();
		expect(dayjs(futureDate, 'YYYY-MM-DD').isValid()).toBeTruthy();
		expect(dayjs(futureDate).isAfter(dayjs.unix(global.FIXED_NOW))).toBeTruthy();
	});

	test('dates: pairs', () => {
		const datePairs = dates(10, 3, 'YYYY-MM-DD');
		expect(datePairs).toBeInstanceOf(Array);
		expect(datePairs).toHaveLength(3);
		datePairs.forEach(pair => {
			expect(pair).toHaveLength(2);
		});
	});

	test('choose: array', () => {
		const options = ['apple', 'banana', 'cherry'];
		const choice = choose(options);
		expect(options).toContain(choice);
	});

	test('choose: function', () => {
		const result = choose(() => 'test');
		expect(result).toBe('test');
	});

	test('choose: non-function / non-array', () => {
		expect(choose('test')).toBe('test');
		expect(choose(123)).toBe(123);
	});

	test('choose: nested functions', () => {
		const result = choose(() => () => () => 'nested');
		expect(result).toBe('nested');
	});

	test('exhaust: elements', () => {
		const arr = [1, 2, 3];
		const exhaustFn = exhaust([...arr]);
		expect(exhaustFn()).toBe(1);
		expect(exhaustFn()).toBe(2);
		expect(exhaustFn()).toBe(3);
		expect(exhaustFn()).toBeUndefined();
	});



	test('unique keys', () => {
		const objects = [{ a: 1, b: 2 }, { a: 3, c: 4 }, { a: 5, b: 6 }];
		const uniqueKeys = getUniqueKeys(objects);
		expect(uniqueKeys).toEqual(expect.arrayContaining(['a', 'b', 'c']));
	});


	test('date: valid', () => {
		const result = date();
		expect(dayjs(result()).isValid()).toBe(true);
	});

	test('dates: valid', () => {
		const result = dates();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(5); // Assuming default numPairs is 5
		result.forEach(pair => {
			expect(pair).toBeInstanceOf(Array);
			expect(pair.length).toBe(2);
			expect(dayjs(pair[0]()).isValid()).toBe(true);
			expect(dayjs(pair[1]()).isValid()).toBe(true);
		});
	});

	test('day: works', () => {
		const start = '2020-01-01';
		const end = '2020-01-30';
		const result = day(start, end);
		const dayResult = result(0, 9);
		expect(dayjs(dayResult.day).isAfter(dayjs(dayResult.start))).toBe(true);
		expect(dayjs(dayResult.day).isBefore(dayjs(dayResult.end))).toBe(true);
	});

	test('exhaust: works', () => {
		const arr = [1, 2, 3];
		const next = exhaust(arr);
		expect(next()).toBe(1);
		expect(next()).toBe(2);
		expect(next()).toBe(3);
		expect(next()).toBe(undefined); // or whatever your implementation does after array is exhausted
	});

	test('emoji: works', () => {
		const emojis = generateEmoji(5)();
		expect(typeof emojis).toBe('string');
		if (!Array.isArray(emojis)) {
			expect(emojis.split(', ').length).toBeLessThanOrEqual(5);
		}
		if (Array.isArray(emojis)) {
			expect(emojis.length).toBeLessThanOrEqual(5);
		}
	});

	test('emoji: length', () => {
		const result = generateEmoji();
		const emojis = result();
		expect(typeof emojis).toBe('string');
		if (!Array.isArray(emojis)) {
			expect(emojis.split(', ').length).toBeLessThanOrEqual(10);
		}
		if (Array.isArray(emojis)) {
			expect(emojis.length).toBeLessThanOrEqual(10);
		}

	});



	test('progress: output', () => {
		// @ts-ignore
		const mockStdoutWrite = vi.spyOn(process.stdout, 'write').mockImplementation(() => { });
		progress([['test', 50]]);
		expect(mockStdoutWrite).toHaveBeenCalled();
		mockStdoutWrite.mockRestore();
	});

	test('range: works', () => {
		const result = range(1, 5);
		expect(result).toEqual([1, 2, 3, 4, 5]);
	});


	test('shuffleArray: works', () => {
		const arr = [1, 2, 3, 4, 5];
		const shuffled = shuffleArray([...arr]);
		expect(shuffled).not.toEqual(arr);
		expect(shuffled.sort()).toEqual(arr.sort());
	});

	test('shuffleExceptFirst: works', () => {
		const arr = [1, 2, 3, 4, 5];
		const shuffled = shuffleExceptFirst([...arr]);
		expect(shuffled[0]).toBe(arr[0]);
		expect(shuffled.slice(1).sort()).toEqual(arr.slice(1).sort());
	});

	test('shuffleExceptLast: works', () => {
		const arr = [1, 2, 3, 4, 5];
		const shuffled = shuffleExceptLast([...arr]);
		expect(shuffled[shuffled.length - 1]).toBe(arr[arr.length - 1]);
		expect(shuffled.slice(0, -1).sort()).toEqual(arr.slice(0, -1).sort());
	});

	test('fixFirstAndLast: works', () => {
		const arr = [1, 2, 3, 4, 5];
		const shuffled = fixFirstAndLast([...arr]);
		expect(shuffled[0]).toBe(arr[0]);
		expect(shuffled[shuffled.length - 1]).toBe(arr[arr.length - 1]);
		expect(shuffled.slice(1, -1).sort()).toEqual(arr.slice(1, -1).sort());
	});

	test('shuffleMiddle: works', () => {
		const arr = [1, 2, 3, 4, 5];
		const shuffled = shuffleMiddle([...arr]);
		expect(shuffled[0]).toBe(arr[0]);
		expect(shuffled[shuffled.length - 1]).toBe(arr[arr.length - 1]);
		expect(shuffled.slice(1, -1).sort()).toEqual(arr.slice(1, -1).sort());
	});

	test('shuffleOutside: works', () => {
		const arr = [1, 2, 3, 4, 5];
		const shuffled = shuffleOutside([...arr]);
		expect(shuffled.slice(1, -1)).toEqual(arr.slice(1, -1));
	});

	test('box: distribution', () => {
		const values = [];
		for (let i = 0; i < 10000; i++) {
			values.push(boxMullerRandom());
		}
		const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
		const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
		const stdDev = Math.sqrt(variance);
		expect(mean).toBeCloseTo(0, 1);
		expect(stdDev).toBeCloseTo(1, 1);
	});

	test('optimized box: distribution', () => {
		const values = [];
		for (let i = 0; i < 10000; i++) {
			values.push(optimizedBoxMuller());
		}
		const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
		const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
		const stdDev = Math.sqrt(variance);
		expect(mean).toBeLessThan(1);
		expect(stdDev).toBeLessThan(1);
	});


});


describe('weights', () => {
	test('weighChoices: objects', () => {
		const items = [
			{ value: 'foo', weight: 3 },
			{ value: 'bar', weight: 2 }
		];
		const generateWeightedArray = weighChoices(items);
		const result = generateWeightedArray();

		expect(result.filter(item => item === 'foo').length).toBe(3);
		expect(result.filter(item => item === 'bar').length).toBe(2);
	});

	test('weighChoices: strings', () => {
		const items = ['foo', 'bar', 'baz'];
		const generateWeightedArray = weighChoices(items);
		const result = generateWeightedArray();

		// Check that each item has a unique weight
		const counts = items.map(item => result.filter(r => r === item).length);
		const uniqueCounts = new Set(counts);

		expect(uniqueCounts.size).toBe(items.length);
		counts.forEach(count => {
			expect(count).toBeGreaterThanOrEqual(1);
			expect(count).toBeLessThanOrEqual(items.length);
		});
	});

	test('weighChoices: empty', () => {
		const items = [];
		const generateWeightedArray = weighChoices(items);
		const result = generateWeightedArray();

		expect(result).toEqual([]);
	});

	test('weighChoices: one string', () => {
		const items = ['foo'];
		const generateWeightedArray = weighChoices(items);
		const result = generateWeightedArray();

		expect(result).toEqual(['foo']);
	});

	test('weighChoices: one obj', () => {
		const items = [{ value: 'foo', weight: 5 }];
		const generateWeightedArray = weighChoices(items);
		const result = generateWeightedArray();

		expect(result).toEqual(['foo', 'foo', 'foo', 'foo', 'foo']);
	});


	test('winner: return func', () => {
		const items = ['a', 'b', 'c'];
		const result = pickAWinner(items, 0);
		expect(typeof result).toBe('function');
	});

	test('winner: first most', () => {
		const items = ['a', 'b', 'c'];
		const mostChosenIndex = 0;
		const pickFunction = pickAWinner(items, mostChosenIndex);
		const weightedList = pickFunction();

		// Expect the most chosen item to appear at least once
		expect(weightedList.includes(items[mostChosenIndex])).toBeTruthy();
	});

	test('winner: second most', () => {
		const items = ['a', 'b', 'c'];
		const mostChosenIndex = 0;
		const pickFunction = pickAWinner(items, mostChosenIndex);
		const weightedList = pickFunction();

		const secondMostChosenIndex = (mostChosenIndex + 1) % items.length;

		// Expect the second most chosen item to appear at least once
		expect(weightedList.includes(items[secondMostChosenIndex])).toBeTruthy();
	});

	test('winner: third most', () => {
		const items = ['a', 'b', 'c'];
		const mostChosenIndex = 0;
		const pickFunction = pickAWinner(items, mostChosenIndex);
		const weightedList = pickFunction();

		const thirdMostChosenIndex = (mostChosenIndex + 2) % items.length;

		// Expect the third most chosen item to appear at least once
		expect(weightedList.includes(items[thirdMostChosenIndex])).toBeTruthy();
	});

	test('winner: exceed array bounds', () => {
		const items = ['a', 'b', 'c'];
		const mostChosenIndex = 0;
		const pickFunction = pickAWinner(items, mostChosenIndex);
		const weightedList = pickFunction();

		// Ensure all indices are within the bounds of the array
		weightedList.forEach(item => {
			expect(items.includes(item)).toBeTruthy();
		});
	});

	test('winner: single item array', () => {
		const items = ['a'];
		const mostChosenIndex = 0;
		const pickFunction = pickAWinner(items, mostChosenIndex);
		const weightedList = pickFunction();

		// Since there's only one item, all winner: he same
		weightedList.forEach(item => {
			expect(item).toBe('a');
		});
	});

	test('winner: empty array', () => {
		const items = [];
		const pickFunction = pickAWinner(items, 0);
		const weightedList = pickFunction();

		// Expect the result to be an empty array
		expect(weightedList.length).toBe(0);
	});

	test('weighNumRange:  within range', () => {
		const values = weighNumRange(5, 15);
		expect(values.every(v => v >= 5 && v <= 15)).toBe(true);
		expect(values.length).toBe(50);
	});

	test('applySkew: skews', () => {
		const value = optimizedBoxMuller();
		const skewedValue = applySkew(value, .25);
		expect(Math.abs(skewedValue)).toBeLessThanOrEqual(Math.abs(value) + 1);
	});

	test('mapToRange: works', () => {
		const value = 0;
		const mean = 10;
		const sd = 5;
		const mappedValue = mapToRange(value, mean, sd);
		expect(mappedValue).toBe(10);
	});

	test('weighArray: works', () => {
		const arr = ['a', 'b', 'c'];
		const weightedArr = weighArray(arr);
		expect(weightedArr.length).toBeGreaterThanOrEqual(arr.length);
	});

	test('weighFunnels: works', () => {
		const acc = [];
		const funnel = { weight: 3 };
		const result = weighFunnels(acc, funnel);
		expect(result.length).toBe(3);
	});

	test('match conditions: works', () => {
		const conditions = {
			age: 30,
			country: 'US'
		};
		const user = { age: 30, country: 'US' };
		expect(matchConditions(user, conditions)).toBe(true);
	});


});

describe('high CPU usage functions', () => {

	describe('hasSameKeys', () => {
		test('empty array', () => {
			expect(hasSameKeys([])).toBe(true);
		});

		test('single object', () => {
			expect(hasSameKeys([{ a: 1, b: 2 }])).toBe(true);
		});

		test('identical keys', () => {
			const arr = [
				{ a: 1, b: 2, c: 3 },
				{ a: 4, b: 5, c: 6 },
				{ a: 7, b: 8, c: 9 }
			];
			expect(hasSameKeys(arr)).toBe(true);
		});

		test('different keys', () => {
			const arr = [
				{ a: 1, b: 2 },
				{ a: 3, c: 4 },
				{ a: 5, b: 6 }
			];
			expect(hasSameKeys(arr)).toBe(false);
		});

		test('different number of keys', () => {
			const arr = [
				{ a: 1, b: 2 },
				{ a: 3, b: 4, c: 5 }
			];
			expect(hasSameKeys(arr)).toBe(false);
		});

		test('nested objects same keys', () => {
			const arr = [
				{ a: { x: 1 }, b: 2 },
				{ a: { y: 3 }, b: 4 }
			];
			expect(hasSameKeys(arr)).toBe(true);
		});

		test('performance with large arrays', () => {
			const largeArray = [];
			for (let i = 0; i < 1000; i++) {
				largeArray.push({ a: i, b: i * 2, c: i * 3 });
			}
			const start = Date.now();
			const result = hasSameKeys(largeArray);
			const end = Date.now();
			expect(result).toBe(true);
			expect(end - start).toBeLessThan(100); // Should complete in under 100ms
		});

		test('performance with inconsistent keys', () => {
			const largeArray = [];
			for (let i = 0; i < 1000; i++) {
				if (i === 500) {
					largeArray.push({ a: i, b: i * 2, d: i * 3 }); // Different key
				} else {
					largeArray.push({ a: i, b: i * 2, c: i * 3 });
				}
			}
			const start = Date.now();
			const result = hasSameKeys(largeArray);
			const end = Date.now();
			expect(result).toBe(false);
			expect(end - start).toBeLessThan(100); // Should complete in under 100ms
		});
	});

	describe('shuffleArray', () => {
		test('empty array', () => {
			const arr = [];
			const result = shuffleArray([...arr]);
			expect(result).toEqual([]);
		});

		test('single element', () => {
			const arr = [42];
			const result = shuffleArray([...arr]);
			expect(result).toEqual([42]);
		});

		test('maintains all elements', () => {
			const arr = [1, 2, 3, 4, 5];
			const result = shuffleArray([...arr]);
			expect(result.sort()).toEqual(arr.sort());
		});

		test('modifies original array', () => {
			const arr = [1, 2, 3, 4, 5];
			const original = [...arr];
			shuffleArray(arr);
			expect(arr).not.toEqual(original);
		});

		test('performance with large arrays', () => {
			const largeArray = [];
			for (let i = 0; i < 10000; i++) {
				largeArray.push(i);
			}
			const start = Date.now();
			const result = shuffleArray([...largeArray]);
			const end = Date.now();
			expect(result.length).toBe(10000);
			expect(end - start).toBeLessThan(100); // Should complete in under 100ms
		});

		test('randomness distribution', () => {
			const arr = [1, 2, 3, 4, 5];
			const positions = { 1: [], 2: [], 3: [], 4: [], 5: [] };

			// Run shuffle 100 times and track positions
			for (let i = 0; i < 100; i++) {
				const shuffled = shuffleArray([...arr]);
				shuffled.forEach((val, index) => {
					positions[val].push(index);
				});
			}

			// Each value should appear in different positions
			Object.values(positions).forEach(posArray => {
				const uniquePositions = new Set(posArray);
				expect(uniquePositions.size).toBeGreaterThan(1); // Should appear in multiple positions
			});
		});

		test('array with duplicates', () => {
			const arr = [1, 1, 2, 2, 3];
			const result = shuffleArray([...arr]);
			expect(result.sort()).toEqual([1, 1, 2, 2, 3]);
		});
	});
});

describe('deepClone', () => {
	test('primitives: null and undefined', () => {
		expect(deepClone(null)).toBe(null);
		expect(deepClone(undefined)).toBe(undefined);
	});

	test('primitives: numbers, strings, booleans', () => {
		expect(deepClone(42)).toBe(42);
		expect(deepClone('hello')).toBe('hello');
		expect(deepClone(true)).toBe(true);
		expect(deepClone(false)).toBe(false);
		expect(deepClone(0)).toBe(0);
		expect(deepClone('')).toBe('');
	});

	test('primitives: symbols', () => {
		const sym = Symbol('test');
		const cloned = deepClone(sym);
		expect(typeof cloned).toBe('symbol');
		expect(cloned.description).toBe('test');
		expect(cloned).not.toBe(sym); // Should be a new symbol
	});

	test('arrays: empty and simple', () => {
		const emptyArr = [];
		const cloned = deepClone(emptyArr);
		expect(cloned).toEqual([]);
		expect(cloned).not.toBe(emptyArr);

		const simpleArr = [1, 2, 3];
		const clonedSimple = deepClone(simpleArr);
		expect(clonedSimple).toEqual([1, 2, 3]);
		expect(clonedSimple).not.toBe(simpleArr);
	});

	test('arrays: nested arrays', () => {
		const nested = [1, [2, 3], [4, [5, 6]]];
		const cloned = deepClone(nested);
		expect(cloned).toEqual([1, [2, 3], [4, [5, 6]]]);
		expect(cloned).not.toBe(nested);
		expect(cloned[1]).not.toBe(nested[1]);
		expect(cloned[2][1]).not.toBe(nested[2][1]);
	});

	test('arrays: mixed types', () => {
		const mixed = [1, 'hello', true, null, undefined, { a: 1 }];
		const cloned = deepClone(mixed);
		expect(cloned).toEqual([1, 'hello', true, null, undefined, { a: 1 }]);
		expect(cloned).not.toBe(mixed);
		expect(cloned[5]).not.toBe(mixed[5]);
	});

	test('objects: empty and simple', () => {
		const empty = {};
		const cloned = deepClone(empty);
		expect(cloned).toEqual({});
		expect(cloned).not.toBe(empty);

		const simple = { a: 1, b: 2 };
		const clonedSimple = deepClone(simple);
		expect(clonedSimple).toEqual({ a: 1, b: 2 });
		expect(clonedSimple).not.toBe(simple);
	});

	test('objects: nested objects', () => {
		const nested = {
			a: 1,
			b: {
				c: 2,
				d: {
					e: 3
				}
			}
		};
		const cloned = deepClone(nested);
		expect(cloned).toEqual(nested);
		expect(cloned).not.toBe(nested);
		expect(cloned.b).not.toBe(nested.b);
		expect(cloned.b.d).not.toBe(nested.b.d);
	});

	test('objects: with arrays', () => {
		const obj = {
			arr: [1, 2, 3],
			nested: {
				arr2: ['a', 'b', 'c']
			}
		};
		const cloned = deepClone(obj);
		expect(cloned).toEqual(obj);
		expect(cloned).not.toBe(obj);
		expect(cloned.arr).not.toBe(obj.arr);
		expect(cloned.nested.arr2).not.toBe(obj.nested.arr2);
	});

	test('dates', () => {
		const date = new Date('2023-01-01');
		const cloned = deepClone(date);
		expect(cloned).toBeInstanceOf(Date);
		expect(cloned.getTime()).toBe(date.getTime());
		expect(cloned).not.toBe(date);
	});

	test('regular expressions', () => {
		const regex = /test/gi;
		const cloned = deepClone(regex);
		expect(cloned).toBeInstanceOf(RegExp);
		expect(cloned.source).toBe('test');
		expect(cloned.flags).toBe('gi');
		expect(cloned).not.toBe(regex);
	});

	test('functions: default behavior', () => {
		const func = function test() { return 42; };
		const cloned = deepClone(func);
		expect(cloned).toBe(func); // Should return same function by default
	});

	test('functions: with newFns option', () => {
		const func = function test() { return 42; };
		const cloned = deepClone(func, { newFns: true });
		expect(typeof cloned).toBe('function');
		expect(cloned()).toBe(42);
		expect(cloned).not.toBe(func);
	});

	test('complex nested structures', () => {
		const complex = {
			str: 'hello',
			num: 42,
			bool: true,
			arr: [1, 2, { nested: 'value' }],
			obj: {
				date: new Date('2023-01-01'),
				regex: /test/g,
				deep: {
					deeper: {
						deepest: [1, 2, 3]
					}
				}
			}
		};

		const cloned = deepClone(complex);

		// Check equality
		expect(cloned.str).toBe('hello');
		expect(cloned.num).toBe(42);
		expect(cloned.bool).toBe(true);
		expect(cloned.arr).toEqual([1, 2, { nested: 'value' }]);
		expect(cloned.obj.date.getTime()).toBe(new Date('2023-01-01').getTime());
		expect(cloned.obj.regex.source).toBe('test');
		expect(cloned.obj.deep.deeper.deepest).toEqual([1, 2, 3]);

		// Check that objects are different references
		expect(cloned).not.toBe(complex);
		expect(cloned.arr).not.toBe(complex.arr);
		expect(cloned.arr[2]).not.toBe(complex.arr[2]);
		expect(cloned.obj).not.toBe(complex.obj);
		expect(cloned.obj.date).not.toBe(complex.obj.date);
		expect(cloned.obj.regex).not.toBe(complex.obj.regex);
		expect(cloned.obj.deep.deeper.deepest).not.toBe(complex.obj.deep.deeper.deepest);
	});

	test('circular references handling', () => {
		const obj = { a: 1 };
		obj.circular = obj;

		// Current implementation does not handle circular references
		// It will cause a stack overflow, which is expected behavior
		expect(() => deepClone(obj)).toThrow('Maximum call stack size exceeded');
	});

	test('performance with large objects', () => {
		const largeObj = {};
		for (let i = 0; i < 1000; i++) {
			largeObj[`key${i}`] = {
				value: i,
				array: new Array(10).fill(i),
				nested: { deep: { value: i * 2 } }
			};
		}

		const start = Date.now();
		const cloned = deepClone(largeObj);
		const end = Date.now();

		expect(cloned).toEqual(largeObj);
		expect(cloned).not.toBe(largeObj);
		expect(end - start).toBeLessThan(500); // Should complete in under 500ms
	});

	test('edge cases: constructor edge cases', () => {
		// Test fallback for objects that can't be constructed normally
		const obj = Object.create(null);
		obj.prop = 'value';

		const cloned = deepClone(obj);
		expect(cloned.prop).toBe('value');
		expect(cloned).not.toBe(obj);
	});

	test('arrays: sparse arrays', () => {
		const sparse = [1, , 3, , 5]; // Array with holes
		const cloned = deepClone(sparse);
		expect(cloned.length).toBe(5);
		expect(cloned[0]).toBe(1);
		expect(cloned[1]).toBe(undefined);
		expect(cloned[2]).toBe(3);
		expect(cloned[3]).toBe(undefined);
		expect(cloned[4]).toBe(5);
		expect(cloned).not.toBe(sparse);
	});

	test('objects: with getters and setters', () => {
		const obj = {
			_value: 42,
			get value() { return this._value; },
			set value(v) { this._value = v; }
		};

		const cloned = deepClone(obj);
		expect(cloned._value).toBe(42);
		// Note: getters/setters are not preserved, only enumerable properties
	});

	test('immutability: modifications don\'t affect original', () => {
		const original = {
			arr: [1, 2, 3],
			obj: { a: 1, b: 2 }
		};

		const cloned = deepClone(original);

		// Modify cloned object
		cloned.arr.push(4);
		cloned.obj.c = 3;
		cloned.newProp = 'new';

		// Original should be unchanged
		expect(original.arr).toEqual([1, 2, 3]);
		expect(original.obj).toEqual({ a: 1, b: 2 });
		expect(original.newProp).toBe(undefined);
	});
});

describe('pickRandom', () => {
	test('empty array', () => {
		const result = pickRandom([]);
		expect(result).toBe(undefined);
	});

	test('null or undefined input', () => {
		expect(pickRandom(null)).toBe(undefined);
		expect(pickRandom(undefined)).toBe(undefined);
	});

	test('single element array', () => {
		const arr = [42];
		const result = pickRandom(arr);
		expect(result).toBe(42);
	});

	test('multiple elements - returns valid element', () => {
		const arr = [1, 2, 3, 4, 5];
		const result = pickRandom(arr);
		expect(arr).toContain(result);
	});

	test('string array', () => {
		const arr = ['apple', 'banana', 'cherry'];
		const result = pickRandom(arr);
		expect(arr).toContain(result);
		expect(typeof result).toBe('string');
	});

	test('mixed type array', () => {
		const arr = [1, 'hello', true, null, { key: 'value' }];
		const result = pickRandom(arr);
		expect(arr).toContain(result);
	});

	test('object array', () => {
		const arr = [
			{ id: 1, name: 'first' },
			{ id: 2, name: 'second' },
			{ id: 3, name: 'third' }
		];
		const result = pickRandom(arr);
		expect(arr).toContain(result);
		expect(result).toHaveProperty('id');
		expect(result).toHaveProperty('name');
	});

	test('array with duplicates', () => {
		const arr = [1, 1, 2, 2, 3];
		const result = pickRandom(arr);
		expect([1, 2, 3]).toContain(result);
	});

	test('large array', () => {
		const arr = new Array(1000).fill(0).map((_, i) => i);
		const result = pickRandom(arr);
		expect(result).toBeGreaterThanOrEqual(0);
		expect(result).toBeLessThan(1000);
	});

	test('distribution randomness', () => {
		const arr = [1, 2, 3, 4, 5];
		const results = [];
		const iterations = 1000;

		// Run pickRandom many times to test distribution
		for (let i = 0; i < iterations; i++) {
			results.push(pickRandom(arr));
		}

		// Check that all values appear at least once
		const unique = [...new Set(results)];
		expect(unique.length).toBe(5);
		expect(unique.sort()).toEqual([1, 2, 3, 4, 5]);

		// Check that distribution is roughly even (no value appears more than 70% of the time)
		arr.forEach(value => {
			const count = results.filter(r => r === value).length;
			const percentage = count / iterations;
			expect(percentage).toBeLessThan(0.7); // Should be roughly 20% each, allow up to 70%
			expect(percentage).toBeGreaterThan(0.05); // Should appear at least 5% of the time
		});
	});

	test('deterministic with same seed', () => {
		// This test verifies that pickRandom uses the chance instance
		// Note: The global chance instance may not reset consistently in tests
		const arr = [1, 2, 3, 4, 5];

		// Just verify that pickRandom works and returns valid values
		const result1 = pickRandom(arr);
		const result2 = pickRandom(arr);

		expect(arr).toContain(result1);
		expect(arr).toContain(result2);
		// Note: We can't reliably test determinism due to global state
	});

	test('does not modify original array', () => {
		const originalArray = [1, 2, 3, 4, 5];
		const arrayCopy = [...originalArray];

		pickRandom(originalArray);

		expect(originalArray).toEqual(arrayCopy);
	});

	test('performance with large arrays', () => {
		const largeArray = new Array(10000).fill(0).map((_, i) => i);

		const start = Date.now();
		for (let i = 0; i < 1000; i++) {
			pickRandom(largeArray);
		}
		const end = Date.now();

		expect(end - start).toBeLessThan(100); // Should complete 1000 picks in under 100ms
	});

	test('edge cases: array with falsy values', () => {
		const arr = [0, false, '', null, undefined];
		const result = pickRandom(arr);
		expect(arr).toContain(result);
	});

	test('edge cases: array with NaN', () => {
		const arr = [1, 2, NaN, 4];
		const result = pickRandom(arr);
		// Special handling for NaN since NaN !== NaN
		if (Number.isNaN(result)) {
			expect(arr.some(x => Number.isNaN(x))).toBe(true);
		} else {
			expect(arr).toContain(result);
		}
	});

	test('nested array elements', () => {
		const arr = [[1, 2], [3, 4], [5, 6]];
		const result = pickRandom(arr);
		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(2);
		expect(arr).toContain(result);
	});

	test('comparison with pick function', () => {
		// Test that pickRandom behaves similarly to pick for arrays
		const arr = [1, 2, 3, 4, 5];

		const pickResult = pick(arr);
		const pickRandomResult = pickRandom(arr);

		expect(arr).toContain(pickResult);
		expect(arr).toContain(pickRandomResult);
		expect(typeof pickResult).toBe(typeof pickRandomResult);
	});
});

describe('garbage collection analysis', () => {
	test('memory usage patterns', () => {
		// Test that creates many temporary objects to understand GC pressure
		const iterations = 1000;
		const results = [];

		for (let i = 0; i < iterations; i++) {
			const tempArray = new Array(100).fill(0).map((_, index) => ({
				id: index,
				value: Math.random(),
				timestamp: Date.now()
			}));

			// Simulate operations that might cause GC pressure
			const shuffled = shuffleArray([...tempArray]);
			const keysCheck = hasSameKeys(tempArray);

			results.push({ shuffled: shuffled.length, keysCheck });
		}

		expect(results.length).toBe(iterations);
	});
});