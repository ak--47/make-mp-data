const generate = require('../index.js');
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const u = require('ak-tools');
dayjs.extend(utc);
const { timeSoup } = generate;
require('dotenv').config();



describe('timeSoup', () => {
	test('always positive dates', () => {
		const dates = [];
		for (let i = 0; i < 20000; i++) {
			const earliest = dayjs().subtract(u.rand(2, 360), 'D');
			dates.push(timeSoup());
		}
		const tooOld = dates.filter(d => dayjs(d).isBefore(dayjs.unix(0)));
		const badYear = dates.filter(d => !d.startsWith('202'));
		expect(dates.every(d => dayjs(d).isAfter(dayjs.unix(0)))).toBe(true);
		expect(dates.every(d => d.startsWith('202'))).toBe(true);

	});
});



const { applySkew, boxMullerRandom, choose, date, dates, day, exhaust, generateEmoji, getUniqueKeys, integer, mapToRange, person, pick, range, pickAWinner, weightedRange } = require('../utils');

describe('utils', () => {

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




	test('person: fields', () => {
		const generatedPerson = person();
		expect(generatedPerson).toHaveProperty('$name');
		expect(generatedPerson).toHaveProperty('$email');
		expect(generatedPerson).toHaveProperty('$avatar');
	});


	test('date: past', () => {
		const pastDate = date(10, true, 'YYYY-MM-DD')();
		expect(dayjs(pastDate, 'YYYY-MM-DD').isValid()).toBeTruthy();
		expect(dayjs(pastDate).isBefore(dayjs())).toBeTruthy();
	});

	test('date: future', () => {
		const futureDate = date(10, false, 'YYYY-MM-DD')();
		expect(dayjs(futureDate, 'YYYY-MM-DD').isValid()).toBeTruthy();
		expect(dayjs(futureDate).isAfter(dayjs())).toBeTruthy();
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

	test('weightedRange:  within range', () => {
		const values = weightedRange(5, 15, 100);
		expect(values.every(v => v >= 5 && v <= 15)).toBe(true);
		expect(values.length).toBe(100);
	});

	test('applySkew: skews', () => {
		const value = boxMullerRandom();
		const skewedValue = applySkew(value, .25);
		expect(Math.abs(skewedValue)).toBeGreaterThanOrEqual(Math.abs(value));
	});

	test('mapToRange: works', () => {
		const value = 0;
		const mean = 10;
		const sd = 5;
		const mappedValue = mapToRange(value, mean, sd);
		expect(mappedValue).toBe(10);
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


	test('date', () => {
		const result = date();
		expect(dayjs(result()).isValid()).toBe(true);
	});

	test('dates', () => {
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

	test('day', () => {
		const start = '2020-01-01';
		const end = '2020-01-30';
		const result = day(start, end);
		const dayResult = result(0, 9);
		expect(dayjs(dayResult.day).isAfter(dayjs(dayResult.start))).toBe(true);
		expect(dayjs(dayResult.day).isBefore(dayjs(dayResult.end))).toBe(true);
	});

	test('exhaust', () => {
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


});
