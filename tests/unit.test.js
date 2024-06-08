const generate = require('../index.js');
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const fs = require('fs');
const u = require('ak-tools');
dayjs.extend(utc);
const { timeSoup } = generate;
require('dotenv').config();

const { applySkew,
	boxMullerRandom,
	choose,
	date,
	dates,
	day,
	exhaust,
	generateEmoji,
	getUniqueKeys,
	integer,
	mapToRange,
	person,
	pick,
	range,
	pickAWinner,
	weightedRange,
	enrichArray,
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
	weighFunnels,
	buildFileNames
} = require('../utils');


describe('timesoup', () => {
	test('always valid times', () => {
		const dates = [];
		for (let i = 0; i < 10000; i++) {
			const earliest = dayjs().subtract(u.rand(5, 50), 'D');
			dates.push(timeSoup());
		}
		const tooOld = dates.filter(d => dayjs(d).isBefore(dayjs.unix(0)));
		const badYear = dates.filter(d => !d.startsWith('202'));
		expect(dates.every(d => dayjs(d).isAfter(dayjs.unix(0)))).toBe(true);
		expect(dates.every(d => d.startsWith('202'))).toBe(true);

	});
});


describe('naming things', () => {

	test('default config', () => {
        const config = { simulationName: 'testSim' };
        const result = buildFileNames(config);
        expect(result.eventFiles).toEqual(['testSim-EVENTS.csv']);
        expect(result.userFiles).toEqual(['testSim-USERS.csv']);
        expect(result.scdFiles).toEqual([]);
        expect(result.groupFiles).toEqual([]);
        expect(result.lookupFiles).toEqual([]);
        expect(result.mirrorFiles).toEqual([]);
        expect(result.folder).toEqual('./');
    });

    test('json format', () => {
        const config = { simulationName: 'testSim', format: 'json' };
        const result = buildFileNames(config);
        expect(result.eventFiles).toEqual(['testSim-EVENTS.json']);
        expect(result.userFiles).toEqual(['testSim-USERS.json']);
    });

    test('with scdProps', () => {
        const config = {
            simulationName: 'testSim',
            scdProps: { prop1: {}, prop2: {} }
        };
        const result = buildFileNames(config);
        expect(result.scdFiles).toEqual([
            'testSim-prop1-SCD.csv',
            'testSim-prop2-SCD.csv'
        ]);
    });

    test('with groupKeys', () => {
        const config = {
            simulationName: 'testSim',
            groupKeys: [['group1'], ['group2']]
        };
        const result = buildFileNames(config);
        expect(result.groupFiles).toEqual([
            'testSim-group1-GROUP.csv',
            'testSim-group2-GROUP.csv'
        ]);
    });

    test('with lookupTables', () => {
        const config = {
            simulationName: 'testSim',
            lookupTables: [{ key: 'lookup1' }, { key: 'lookup2' }]
        };
        const result = buildFileNames(config);
        expect(result.lookupFiles).toEqual([
            'testSim-lookup1-LOOKUP.csv',
            'testSim-lookup2-LOOKUP.csv'
        ]);
    });

    test('with mirrorProps', () => {
        const config = {
            simulationName: 'testSim',
            mirrorProps: { prop1: {} }
        };
        const result = buildFileNames(config);
        expect(result.mirrorFiles).toEqual(['testSim-MIRROR.csv']);
    });

    test('writeToDisk', async () => {
        const config = { simulationName: 'testSim', writeToDisk: true };
        const result = await buildFileNames(config);
        expect(result.folder).toBeDefined();

    });


    test('invalid simName', () => {
        const config = { simulationName: 123 };
        expect(() => buildFileNames(config)).toThrow('simName must be a string');
    });


	test('streamJSON: writes to file', async () => {
		const path = 'test.json';
		const data = [{ a: 1, b: 2 }, { a: 3, b: 4 }];
		await streamJSON(path, data);
		const content = fs.readFileSync(path, 'utf8');
		const lines = content.trim().split('\n').map(line => JSON.parse(line));
		expect(lines).toEqual(data);
		fs.unlinkSync(path);
	});

	test('streamCSV: writes to file', async () => {
		const path = 'test.csv';
		const data = [{ a: 1, b: 2 }, { a: 3, b: 4 }];
		await streamCSV(path, data);
		const content = fs.readFileSync(path, 'utf8');
		const lines = content.trim().split('\n');
		expect(lines.length).toBe(3); // Including header
		fs.unlinkSync(path);
	});


	test('generateUser: works', () => {
		const uuid = { guid: jest.fn().mockReturnValue('uuid-123') };
		const numDays = 30;
		const user = generateUser(numDays);
		expect(user).toHaveProperty('distinct_id');
		expect(user).toHaveProperty('$name');
		expect(user).toHaveProperty('$email');
		expect(user).toHaveProperty('$avatar');
	});

	test('enrichArray: works', () => {
		const arr = [];
		const enrichedArray = enrichArray(arr);
		enrichedArray.hookPush(1);
		enrichedArray.hookPush(2);
		const match = JSON.stringify(enrichedArray) === JSON.stringify([1, 2]);
		expect(match).toEqual(true);
	});

});



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

	test('progress: outputs correctly', () => {
		// @ts-ignore
		const mockStdoutWrite = jest.spyOn(process.stdout, 'write').mockImplementation(() => { });
		progress('test', 50);
		expect(mockStdoutWrite).toHaveBeenCalled();
		mockStdoutWrite.mockRestore();
	});

	test('range: works', () => {
		const result = [];
		range.call(result, 1, 5);
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


});
