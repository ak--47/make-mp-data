import fs from 'fs';
import Chance from 'chance';
import readline from 'readline';
import { comma, uid } from 'ak-tools';
import { spawn } from 'child_process';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import path from 'path';
import { mkdir, parseGCSUri } from 'ak-tools';
import { existsSync } from 'fs';
dayjs.extend(utc);
import 'dotenv/config';
import { domainSuffix, domainPrefix } from '../templates/defaults.js';
const {NODE_ENV = "unknown"} = process.env;

/** @typedef {import('../../types').Dungeon} Config */
/** @typedef {import('../../types').EventConfig} EventConfig */
/** @typedef {import('../../types').ValueValid} ValueValid */
/** @typedef {import('../../types').HookedArray} hookArray */
/** @typedef {import('../../types').hookArrayOptions} hookArrayOptions */
/** @typedef {import('../../types').Person} Person */
/** @typedef {import('../../types').Funnel} Funnel */

let globalChance;
let chanceInitialized = false;

const ACTUAL_NOW = dayjs.utc();


import { Storage as cloudStorage } from '@google-cloud/storage';
const projectId = 'YOUR_PROJECT_ID';
const storage = new cloudStorage({ projectId });


/*
----
RNG
----
*/

/**
 * the random number generator initialization function
 * @param  {string} seed
 * @returns {Chance}
 */
function initChance(seed) {
	if (process.env.SEED) seed = process.env.SEED;  // Override seed with environment variable if available
	if (!chanceInitialized) {
		globalChance = new Chance(seed);
		chanceInitialized = true;
	}
	return globalChance;
}

/**
 * the random number generator getter function
 * @returns {Chance}
 */
function getChance() {
	if (!chanceInitialized) {
		const seed = process.env.SEED || "";
		if (!seed) {
			return new Chance(); // this is a new RNG and therefore not deterministic
		}
		return initChance(seed);
	}
	return globalChance;
}

/*
----
PICKERS
----
*/

/**
 * choose a value from an array or a function
 * @param  {ValueValid} items
 */
function pick(items) {
	const chance = getChance();
	if (!Array.isArray(items)) {
		if (typeof items === 'function') {
			const selection = items();
			if (Array.isArray(selection)) {
				return chance.pickone(selection);
			}
			else {
				return selection;
			}
		}
		return items;

	}
	return chance.pickone(items);
};

/**
 * returns a random date in the past or future
 * @param  {number} inTheLast=30
 * @param  {boolean} isPast=true
 * @param  {string} format='YYYY-MM-DD'
 */
function date(inTheLast = 30, isPast = true, format = 'YYYY-MM-DD') {
	const chance = getChance();
	// const now = global.FIXED_NOW ? dayjs.unix(global.FIXED_NOW) : dayjs();
	const now = ACTUAL_NOW;
	if (Math.abs(inTheLast) > 365 * 10) inTheLast = chance.integer({ min: 1, max: 180 });
	return function () {
		const when = chance.integer({ min: 0, max: Math.abs(inTheLast) });
		let then;
		if (isPast) {
			then = now.subtract(when, 'day')
				.subtract(integer(0, 23), 'hour')
				.subtract(integer(0, 59), 'minute')
				.subtract(integer(0, 59), 'second');
		} else {
			then = now.add(when, 'day')
				.add(integer(0, 23), 'hour')
				.add(integer(0, 59), 'minute')
				.add(integer(0, 59), 'second');
		}

		return format ? then.format(format) : then.toISOString();
	};
}

/**
 * returns pairs of random date in the past or future
 * @param  {number} inTheLast=30
 * @param  {number} numPairs=5
 * @param  {string} format='YYYY-MM-DD'
 */
function dates(inTheLast = 30, numPairs = 5, format = 'YYYY-MM-DD') {
	const pairs = [];
	for (let i = 0; i < numPairs; i++) {
		pairs.push([date(inTheLast, true, format), date(inTheLast, true, format)]);
	}
	return pairs;
};

function datesBetween(start, end) {
	const result = [];
	if (typeof start === 'number') start = dayjs.unix(start).utc();
	if (typeof start !== 'number') start = dayjs(start).utc();
	if (typeof end === 'number') end = dayjs.unix(end).utc();
	if (typeof end !== 'number') end = dayjs(end).utc();
	const diff = end.diff(start, 'day');
	for (let i = 0; i < diff; i++) {
		const day = start.add(i, 'day').startOf('day').add(12, 'hour');
		result.push(day.toISOString());
	}

	return result;
}

/**
 * returns a random date
 * @param  {any} start
 * @param  {any} end
 */
function day(start, end) {
	// if (!end) end = global.FIXED_NOW ? global.FIXED_NOW : dayjs().unix();
	if (!start) start = ACTUAL_NOW.subtract(30, 'd').toISOString();
	if (!end) end = ACTUAL_NOW.toISOString();
	const chance = getChance();
	const format = 'YYYY-MM-DD';
	return function (min, max) {
		start = dayjs(start);
		end = dayjs(end);
		const diff = end.diff(start, 'day');
		const delta = chance.integer({ min: min, max: diff });
		const day = start.add(delta, 'day');
		return {
			start: start.format(format),
			end: end.format(format),
			day: day.format(format)
		};
	};

};

/**
 * similar to pick
 * @param  {ValueValid} value
 */
function choose(value) {
	const chance = getChance();

	// most of the time this will receive a list of strings; 
	// when that is the case, we need to ensure some 'keywords' like 'variant' or 'test' aren't in the array
	// next we want to see if the array is unweighted ... i.e. no dupe strings and each string only occurs once ['a', 'b', 'c', 'd']
	// if all these are true we will pickAWinner(value)()
	if (Array.isArray(value) && value.length > 2 && value.length < 20 && value.every(item => typeof item === 'string')) {
		// ensure terms 'variant' 'group' 'experiment' or 'population' are NOT in any of the items
		if (!value.some(item => item.includes('variant') || item.includes('group') || item.includes('experiment') || item.includes('population'))) {
			// check to make sure that each element in the array only occurs once...
			const uniqueItems = new Set(value);
			if (uniqueItems.size === value.length) {
				// Array has no duplicates, use pickAWinner
				const quickList = pickAWinner(value, 0)();
				const theChosenOne = chance.pickone(quickList);
				return theChosenOne;
			}

		}

	}


	try {
		// Keep resolving the value if it's a function (with caching)
		while (typeof value === 'function') {
			const funcString = value.toString();

			// Check cache for weighted array functions
			if (typeof global.weightedArrayCache === 'undefined') {
				global.weightedArrayCache = new Map();
			}

			if (global.weightedArrayCache.has(funcString)) {
				value = global.weightedArrayCache.get(funcString);
				break;
			}

			const result = value();
			if (Array.isArray(result) && result.length > 10) {
				// Cache large arrays (likely weighted arrays)
				global.weightedArrayCache.set(funcString, result);
			}
			value = result;
		}

		if (Array.isArray(value) && value.length === 0) {
			return ""; // Return empty string if the array is empty
		}

		// [[],[],[]] should pick one
		if (Array.isArray(value) && Array.isArray(value[0])) {
			return chance.pickone(value);
		}

		// PERFORMANCE: Optimized array handling - check first item type instead of every()
		if (Array.isArray(value) && value.length > 0) {
			const firstType = typeof value[0];
			if (firstType === 'string' || firstType === 'number') {
				return chance.pickone(value);
			}
		}

		if (Array.isArray(value) && value.every(item => typeof item === 'object')) {
			if (hasSameKeys(value)) return value;
			else {
				if (process.env.NODE_ENV === "dev") debugger;
			}
		}

		// ["","",""] should pick-a-winner
		if (Array.isArray(value) && typeof value[0] === "string") {
			value = pickAWinner(value)();
		}

		// [0,1,2] should pick one
		if (Array.isArray(value) && typeof value[0] === "number") {
			return chance.pickone(value);
		}

		if (Array.isArray(value)) {
			return chance.pickone(value);
		}

		if (typeof value === 'string') {
			return value;
		}

		if (typeof value === 'number') {
			return value;
		}

		// If it's not a function or array, return it as is
		return value;
	}
	catch (e) {
		console.error(`\n\nerror on value: ${value};\n\n`, e, '\n\n');
		if (process.env?.NODE_ENV === 'dev') debugger;
		throw e;

	}
}


function hasSameKeys(arr) {
	if (arr.length <= 1) {
		return true; // An empty array or an array with one object always has the same keys
	}

	const firstKeys = Object.keys(arr[0]);

	for (let i = 1; i < arr.length; i++) {
		const currentKeys = Object.keys(arr[i]);

		if (currentKeys.length !== firstKeys.length) {
			return false; // Different number of keys
		}

		for (const key of firstKeys) {
			if (!currentKeys.includes(key)) {
				return false; // Key missing in current object
			}
		}
	}

	return true; // All objects have the same keys
}

/**
 * keeps picking from an array until the array is exhausted
 * @param  {Array} arr
 */
function exhaust(arr) {
	return function () {
		return arr.shift();
	};
};

/**
 * returns a random integer between min and max
 * @param  {number} min=1
 * @param  {number} max=100
 */
function integer(min = 1, max = 100) {
	const chance = getChance();
	if (min === max) {
		return min;
	}

	if (min > max) {
		return chance.integer({
			min: max,
			max: min
		});
	}

	if (min < max) {
		return chance.integer({
			min: min,
			max: max
		});
	}

	return 0;
};


function decimal(min = 0, max = 1, fixed = 2) {
	const chance = getChance();
	return chance.floating({ min, max, fixed });
}


/*
----
GENERATORS
----
*/

/**
 * returns a random float between 0 and 1
 * a substitute for Math.random
 */
function boxMullerRandom() {
	const chance = getChance();
	let u = 0, v = 0;
	while (u === 0) u = chance.floating({ min: 0, max: 1, fixed: 13 });
	while (v === 0) v = chance.floating({ min: 0, max: 1, fixed: 13 });
	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

function optimizedBoxMuller() {
	const chance = getChance();
	const u = Math.max(Math.min(chance.normal({ mean: .5, dev: .25 }), 1), 0);
	const v = Math.max(Math.min(chance.normal({ mean: .5, dev: .25 }), 1), 0);
	const result = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
	//ensure we didn't get infinity
	if (result === Infinity || result === -Infinity) return chance.floating({ min: 0, max: 1 });
	return result;

}

/**
 * applies a skew to a value;
 * Skew=0.5: When the skew is 0.5, the distribution becomes more compressed, with values clustering closer to the mean.
 * Skew=1: With a skew of 1, the distribution remains unchanged, as this is equivalent to applying no skew.
 * Skew=2: When the skew is 2, the distribution spreads out, with values extending further from the mean.
 * @param  {number} value
 * @param  {number} skew
 */
function applySkew(value, skew) {
	if (skew === 1) return value;
	// Adjust the value based on skew
	let sign = value < 0 ? -1 : 1;
	return sign * Math.pow(Math.abs(value), skew);
};

// Map standard normal value to our range
function mapToRange(value, mean, sd) {
	return Math.round(value * sd + mean);
};

/**
 * generate a range of numbers
 * @param  {number} a
 * @param  {number} b
 * @param  {number} step=1
 */
function range(a, b, step = 1) {
	const arr = [];
	step = !step ? 1 : step;
	b = b / step;
	for (var i = a; i <= b; i++) {
		arr.push(i * step);
	}
	return arr;
};


function companyName(words = 2, separator = " ") {
	const industryAdjectives = ["advanced", "premier", "integrated", "optimized", "comprehensive", "expert",
		"visionary", "progressive", "transformative", "pioneering", "streamlined",
		"cutting-edge", "impactful", "purpose-driven", "value-oriented", "future-ready",
		"scalable", "responsive", "data-driven", "cloud-based", "user-friendly",
		"high-performance", "secure", "compliant", "ethical", "inclusive",
		"transparent", "community-focused", "environmentally-conscious", "socially-responsible", "innovative", "dynamic", "global", "leading", "reliable", "trusted",
		"strategic", "efficient", "sustainable", "creative", "agile", "resilient",
		"collaborative", "customer-centric", "forward-thinking", "results-driven", "gizmo", "contraption", "doodle", "whimsy", "quirk", "spark", "zing",
		"zap", "pop", "fizz", "whirl", "twirl", "swirl", "jumble", "tumble",
		"hodgepodge", "mishmash", "kaleidoscope", "labyrinth", "maze", "puzzle",
		"enigma", "conundrum", "paradox", "oxymoron", "chimera", "centaur",
		"griffin", "phoenix", "unicorn", "dragon", "mermaid", "yeti", "bigfoot",
		"loch ness monster", "chupacabra", "kraken", "leviathan", "behemoth",
		"juggernaut", "goliath", "david", "odyssey", "pilgrimage", "crusade",
		"quest", "adventure", "escapade", "frolic", "romp", "lark", "spree",
		"binge", "jag", "bender", "tear", "rampage", "riot", "ruckus", "rumpus",
		"hullabaloo", "brouhaha", "kerfuffle", "shindig", "hootenanny", "jamboree",
		"fiesta", "carnival", "gala", "soiree", "bash", "fete", "jubilee"

	];

	const companyNouns = [
		"solutions", "group", "partners", "ventures", "holdings", "enterprises",
		"systems", "technologies", "innovations", "associates", "corporation", "inc.",
		"ltd.", "plc.", "gmbh", "s.a.", "llc.", "network", "alliance", "consortium", "collective", "foundation", "institute",
		"laboratory", "agency", "bureau", "department", "division", "branch",
		"office", "center", "hub", "platform", "ecosystem", "marketplace",
		"exchange", "clearinghouse", "repository", "archive", "registry",
		"database", "framework", "infrastructure", "architecture", "protocol",
		"standard", "specification", "guideline", "blueprint", "roadmap",
		"strategy", "plan", "initiative", "program", "project", "campaign",
		"operation", "mission", "task", "force", "team", "crew", "squad",
		"unit", "cell", "pod", "cohort", "community", "network", "circle",
		"forum", "council", "board", "committee", "panel", "jury", "tribunal"
	];

	let name = "";
	const cycle = [industryAdjectives, companyNouns];
	for (let i = 0; i < words; i++) {
		const index = i % cycle.length;
		const word = cycle[index][Math.floor(Math.random() * cycle[index].length)];
		if (name === "") {
			name = word;
		} else {
			name += separator + word;
		}
	}

	return name;
}


/*
----
STREAMERS
----
*/

function streamJSON(filePath, data) {
	return new Promise((resolve, reject) => {
		let writeStream;
		if (filePath?.startsWith('gs://')) {
			const { uri, bucket, file } = parseGCSUri(filePath);
			writeStream = storage.bucket(bucket).file(file).createWriteStream({ gzip: true });
		}
		else {
			writeStream = fs.createWriteStream(filePath, { encoding: 'utf8' });
		}
		data.forEach(item => {
			writeStream.write(JSON.stringify(item) + '\n');
		});
		writeStream.end();
		writeStream.on('finish', () => {
			resolve(filePath);
		});
		writeStream.on('error', reject);
	});
}

function streamCSV(filePath, data) {
	return new Promise((resolve, reject) => {
		let writeStream;
		if (filePath?.startsWith('gs://')) {
			const { uri, bucket, file } = parseGCSUri(filePath);
			writeStream = storage.bucket(bucket).file(file).createWriteStream({ gzip: true });
		}
		else {
			writeStream = fs.createWriteStream(filePath, { encoding: 'utf8' });
		}

		// Extract all unique keys from the data array
		const columns = getUniqueKeys(data);  // Assuming getUniqueKeys properly retrieves all keys

		// Stream the header
		writeStream.write(columns.join(',') + '\n');

		// Stream each data row
		data.forEach(item => {
			for (const key in item) {
				// Ensure all nested objects are properly stringified
				if (typeof item[key] === "object") item[key] = JSON.stringify(item[key]);
			}
			const row = columns.map(col => item[col] ? `"${item[col].toString().replace(/"/g, '""')}"` : "").join(',');
			writeStream.write(row + '\n');
		});

		writeStream.end();
		writeStream.on('finish', () => {
			resolve(filePath);
		});
		writeStream.on('error', reject);
	});
}


/*
----
WEIGHERS
----
*/



/**
 * a utility function to generate a range of numbers within a given skew
 * Skew = 0.5: The values are more concentrated towards the extremes (both ends of the range) with a noticeable dip in the middle. The distribution appears more "U" shaped. Larger sizes result in smoother distributions but maintain the overall shape.
 * 
 * Skew = 1: This represents the default normal distribution without skew. The values are normally distributed around the mean. Larger sizes create a clearer bell-shaped curve.
 * 
 * Skew = 2: The values are more concentrated towards the mean, with a steeper drop-off towards the extremes. The distribution appears more peaked, resembling a "sharper" bell curve. Larger sizes enhance the clarity of this peaked distribution.
 * 
 * Size represents the size of the pool to choose from; Larger sizes result in smoother distributions but maintain the overall shape.
 * @param  {number} min
 * @param  {number} max
 * @param  {number} skew=1
 * @param  {number} size=100
 */
function weighNumRange(min, max, skew = 1, size = 50) {
	if (size > 2000) size = 2000;
	const mean = (max + min) / 2;
	const sd = (max - min) / 4;
	const array = [];
	while (array.length < size) {
		// const normalValue = boxMullerRandom();
		const normalValue = optimizedBoxMuller();
		const skewedValue = applySkew(normalValue, skew);
		const mappedValue = mapToRange(skewedValue, mean, sd);
		if (mappedValue >= min && mappedValue <= max) {
			array.push(mappedValue);
		}
	}
	return array;
}

/**
 * arbitrarily weigh an array of values to create repeats
 * @param  {Array<any>} arr
 */
function weighArray(arr) {
	// Calculate the upper bound based on the size of the array with added noise
	const maxCopies = arr.length + integer(1, arr.length);

	// Create an empty array to store the weighted elements
	const weightedArray = [];

	// Iterate over the input array and copy each element a random number of times
	arr.forEach(element => {
		let copies = integer(1, maxCopies);
		for (let i = 0; i < copies; i++) {
			weightedArray.push(element);
		}
	});

	return weightedArray;
}

/**
 * Creates a function that generates a weighted array of values.
 * 
 * @overload
 * @param {Array<{value: string, weight: number}>} items - An array of weighted objects or an array of strings.
 * @returns {function(): Array<string>} A function that returns a weighted array of values when called.
 * 
 * @overload
 * @param {Array<string>} items - An array of strings.
 * @returns {function(): Array<string>} A function that returns a weighted array with automatically assigned random weights to each string.
 */

function weighChoices(items) {
	let weightedItems;

	// If items are strings, assign unique random weights
	if (items.every(item => typeof item === 'string')) {
		const weights = shuffleArray(range(1, items.length));
		weightedItems = items.map((item, index) => ({
			value: item,
			weight: weights[index]
		}));
	} else {
		weightedItems = items;
	}

	return function generateWeightedArray() {
		const weightedArray = [];

		// Add each value to the array the number of times specified by its weight
		weightedItems.forEach(({ value, weight }) => {
			if (!weight) weight = 1;
			for (let i = 0; i < weight; i++) {
				weightedArray.push(value);
			}
		});

		return weightedArray;
	};
}

/**
 * Creates a function that generates a weighted list of items
 * with a higher likelihood of picking a specified index and clear second and third place indices.
 * 
 * @param {Array} items - The list of items to pick from.
 * @param {number} [mostChosenIndex] - The index of the item to be most favored.
 * @returns {function} - A function that returns a weighted list of items.
 */
function pickAWinner(items, mostChosenIndex) {
	const chance = getChance();

	// Ensure mostChosenIndex is within the bounds of the items array
	if (!items) return () => { return ""; };
	if (!items.length) return () => { return ""; };
	if (!mostChosenIndex) mostChosenIndex = chance.integer({ min: 0, max: items.length - 1 });
	if (mostChosenIndex >= items.length) mostChosenIndex = items.length - 1;

	// Calculate second and third most chosen indices
	const secondMostChosenIndex = (mostChosenIndex + 1) % items.length;
	const thirdMostChosenIndex = (mostChosenIndex + 2) % items.length;

	// Return a function that generates a weighted list
	return function () {
		const weighted = [];
		for (let i = 0; i < 10; i++) {
			const rand = chance.d10(); // Random number between 1 and 10

			// 35% chance to favor the most chosen index
			if (chance.bool({ likelihood: 35 })) {
				// 50% chance to slightly alter the index
				if (chance.bool({ likelihood: 50 })) {
					weighted.push(items[mostChosenIndex]);
				} else {
					const addOrSubtract = chance.bool({ likelihood: 50 }) ? -rand : rand;
					let newIndex = mostChosenIndex + addOrSubtract;

					// Ensure newIndex is within bounds
					if (newIndex < 0) newIndex = 0;
					if (newIndex >= items.length) newIndex = items.length - 1;
					weighted.push(items[newIndex]);
				}
			}
			// 25% chance to favor the second most chosen index
			else if (chance.bool({ likelihood: 25 })) {
				weighted.push(items[secondMostChosenIndex]);
			}
			// 15% chance to favor the third most chosen index
			else if (chance.bool({ likelihood: 15 })) {
				weighted.push(items[thirdMostChosenIndex]);
			}
			// Otherwise, pick a random item from the list
			else {
				weighted.push(chance.pickone(items));
			}
		}
		return weighted;
	};
}

function quickHash(str, seed = 0) {
	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
	h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
	h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

	return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString();
};

/*
----
SHUFFLERS
----
*/

// Function to shuffle array
function shuffleArray(array) {
	const chance = getChance();
	for (let i = array.length - 1; i > 0; i--) {
		const j = chance.integer({ min: 0, max: i });
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}

function pickRandom(array) {
	if (!array || array.length === 0) return undefined;
	// PERFORMANCE: Use Math.random() instead of chance.integer() for simple cases
	const randomIndex = Math.floor(Math.random() * array.length);
	return array[randomIndex];
}

function shuffleExceptFirst(array) {
	if (array.length <= 1) return array;
	const restShuffled = shuffleArray(array.slice(1));
	return [array[0], ...restShuffled];
}

function shuffleExceptLast(array) {
	if (array.length <= 1) return array;
	const restShuffled = shuffleArray(array.slice(0, -1));
	return [...restShuffled, array[array.length - 1]];
}

function fixFirstAndLast(array) {
	if (array.length <= 2) return array;
	const middleShuffled = shuffleArray(array.slice(1, -1));
	return [array[0], ...middleShuffled, array[array.length - 1]];
}

function shuffleMiddle(array) {
	if (array.length <= 2) return array;
	const middleShuffled = shuffleArray(array.slice(1, -1));
	return [array[0], ...middleShuffled, array[array.length - 1]];
}

function shuffleOutside(array) {
	if (array.length <= 2) return array;
	const middleFixed = array.slice(1, -1);
	const outsideShuffled = shuffleArray([array[0], array[array.length - 1]]);
	return [outsideShuffled[0], ...middleFixed, outsideShuffled[1]];
}

/**
 * given a funnel, shuffle the events in the sequence with random events
 * @param  {EventConfig[]} funnel
 * @param  {EventConfig[]} possibles
 */
function interruptArray(funnel, possibles, percent = 50) {
	if (!Array.isArray(funnel)) return funnel;
	if (!Array.isArray(possibles)) return funnel;
	if (!funnel.length) return funnel;
	if (!possibles.length) return funnel;
	const ignorePositions = [0, funnel.length - 1];
	const chance = getChance();
	loopSteps: for (const [index, event] of funnel.entries()) {
		if (ignorePositions.includes(index)) continue loopSteps;
		if (chance.bool({ likelihood: percent })) {
			funnel[index] = chance.pickone(possibles);
		}
	}

	return funnel;
}

/*
----
VALIDATORS
----
*/


/**
 * @param  {EventConfig[] | string[]} events
 */
function validateEventConfig(events) {
	if (!Array.isArray(events)) throw new Error("events must be an array");
	const cleanEventConfig = [];
	for (const event of events) {
		if (typeof event === "string") {
			/** @type {EventConfig} */
			const eventTemplate = {
				event,
				isFirstEvent: false,
				properties: {},
				weight: integer(1, 5)
			};
			cleanEventConfig.push(eventTemplate);
		}
		if (typeof event === "object") {
			cleanEventConfig.push(event);
		}
	}
	return cleanEventConfig;
}

function validTime(chosenTime, earliestTime, latestTime) {
	if (!earliestTime) earliestTime = global.FIXED_BEGIN ? global.FIXED_BEGIN : dayjs().subtract(30, 'd').unix(); // 30 days ago
	if (!latestTime) latestTime = global.FIXED_NOW ? global.FIXED_NOW : dayjs().unix();

	if (typeof chosenTime === 'number') {
		if (chosenTime > 0) {
			if (chosenTime > earliestTime) {
				if (chosenTime < (latestTime)) {
					return true;
				}

			}
		}
	}
	return false;
}

function validEvent(row) {
	if (!row) return false;
	if (!row.event) return false;
	if (!row.time) return false;
	if (!row.device_id && !row.user_id) return false;
	if (!row.insert_id) return false;
	if (!row.source) return false;
	if (typeof row.time !== 'string') return false;
	return true;
}


/*
----
META
----
*/



/**
 * @param  {Config} config
 */
function buildFileNames(config) {
	const { format = "csv", groupKeys = [], lookupTables = [] } = config;
	let extension = "";
	extension = format === "csv" ? "csv" : "json";
	// const current = dayjs.utc().format("MM-DD-HH");
	let simName = config.simulationName;
	let writeDir = typeof config.writeToDisk === 'string' ? config.writeToDisk : "./";
	if (config.writeToDisk) {
		const dataFolder = path.resolve("./data");
		if (existsSync(dataFolder)) writeDir = dataFolder;
		else writeDir = path.resolve("./");
	}
	if (typeof writeDir !== "string") throw new Error("writeDir must be a string");
	if (typeof simName !== "string") throw new Error("simName must be a string");

	const writePaths = {
		eventFiles: [path.join(writeDir, `${simName}-EVENTS.${extension}`)],
		userFiles: [path.join(writeDir, `${simName}-USERS.${extension}`)],
		adSpendFiles: [],
		scdFiles: [],
		mirrorFiles: [],
		groupFiles: [],
		lookupFiles: [],
		folder: writeDir,
	};
	//add ad spend files
	if (config?.hasAdSpend) {
		writePaths.adSpendFiles.push(path.join(writeDir, `${simName}-AD-SPEND.${extension}`));
	}

	//add SCD files
	const scdKeys = Object.keys(config?.scdProps || {});
	for (const key of scdKeys) {
		writePaths.scdFiles.push(
			path.join(writeDir, `${simName}-${key}-SCD.${extension}`)
		);
	}

	//add group files
	for (const groupPair of groupKeys) {
		const groupKey = groupPair[0];

		writePaths.groupFiles.push(
			path.join(writeDir, `${simName}-${groupKey}-GROUP.${extension}`)
		);
	}

	//add lookup files
	for (const lookupTable of lookupTables) {
		const { key } = lookupTable;
		writePaths.lookupFiles.push(
			//lookups are always CSVs
			path.join(writeDir, `${simName}-${key}-LOOKUP.csv`)
		);
	}

	//add mirror files
	const mirrorProps = config?.mirrorProps || {};
	if (Object.keys(mirrorProps).length) {
		writePaths.mirrorFiles.push(
			path.join(writeDir, `${simName}-MIRROR.${extension}`)
		);
	}

	return writePaths;
}

/**
 * @param  {[string, number][]} arrayOfArrays
 */
function progress(arrayOfArrays) {
	const terminalWidth = process.stdout.columns || 120;

	// Clear the entire line
	readline.cursorTo(process.stdout, 0);
	readline.clearLine(process.stdout, 0);

	// Build message with better formatting
	const items = arrayOfArrays.map(([thing, p]) => {
		return `${thing}: ${comma(p)}`;
	});

	const message = items.join(' │ ');

	// Ensure we don't exceed terminal width
	const finalMessage = message.length > terminalWidth
		? message.substring(0, terminalWidth - 3) + '...'
		: message.padEnd(terminalWidth, ' ');

	process.stdout.write(finalMessage);
}

function openFinder(path, callback) {
	path = path || '/';
	let p = spawn('open', [path]);
	p.on('error', (err) => {
		p.kill();
		return callback(err);
	});
};

function getUniqueKeys(data) {
	const keysSet = new Set();
	data.forEach(item => {
		Object.keys(item).forEach(key => keysSet.add(key));
	});
	return Array.from(keysSet);
};


/*
----
CORE
----
*/

//the function which generates $distinct_id + $anonymous_ids, $session_ids, and created, skewing towards the present
function generateUser(user_id, opts, amplitude = 1, frequency = 1, skew = 1) {
	const chance = getChance();
	const { numDays, isAnonymous, hasAvatar, hasAnonIds, hasSessionIds } = opts;
	// Uniformly distributed `u`, then skew applied
	let u = Math.pow(chance.random(), skew);

	// Sine function for a smoother curve
	const sineValue = (Math.sin(u * Math.PI * frequency - Math.PI / 2) * amplitude + 1) / 2;

	// Scale the sineValue to the range of days
	let daysAgoBorn = Math.round(sineValue * (numDays - 1)) + 1;

	// Clamp values to ensure they are within the desired range
	daysAgoBorn = Math.min(daysAgoBorn, numDays);
	const props = person(user_id, daysAgoBorn, isAnonymous, hasAvatar, hasAnonIds, hasSessionIds);

	const user = {
		distinct_id: user_id,
		...props,
	};


	return user;
}

let soupHits = 0;
/**
 * build sign waves basically
 * @param  {number} [earliestTime]
 * @param  {number} [latestTime]
 * @param  {number} [peaks=5]
 */
function TimeSoup(earliestTime, latestTime, peaks = 5, deviation = 2, mean = 0) {
	if (!earliestTime) earliestTime = global.FIXED_BEGIN ? global.FIXED_BEGIN : dayjs().subtract(30, 'd').unix(); // 30 days ago
	if (!latestTime) latestTime = global.FIXED_NOW ? global.FIXED_NOW : dayjs().unix();
	const chance = getChance();
	const totalRange = latestTime - earliestTime;
	const chunkSize = totalRange / peaks;

	// Select a random chunk based on the number of peaks
	const peakIndex = integer(0, peaks - 1);
	const chunkStart = earliestTime + peakIndex * chunkSize;
	const chunkEnd = chunkStart + chunkSize;
	const chunkMid = (chunkStart + chunkEnd) / 2;

	// Generate a single timestamp within this chunk using a normal distribution centered at chunkMid
	let offset;
	let iterations = 0;
	let isValidTime = false;
	do {
		iterations++;
		soupHits++;
		offset = chance.normal({ mean: mean, dev: chunkSize / deviation });
		isValidTime = validTime(chunkMid + offset, earliestTime, latestTime);
		if (iterations > 25000) {
			throw `${iterations} iterations... exceeded`;
		}
	} while (chunkMid + offset < chunkStart || chunkMid + offset > chunkEnd);

	try {
		return dayjs.unix(chunkMid + offset).toISOString();
	}

	catch (e) {
		//escape hatch
		// console.log('BAD TIME', e?.message);
		if (NODE_ENV === 'dev') debugger;
		return dayjs.unix(integer(earliestTime, latestTime)).toISOString();
	}
}


function NewTimeSoup(earliestTime, latestTime, peaks = 5, deviation = 2, mean = 0) {
	if (!earliestTime) earliestTime = global.FIXED_BEGIN ? global.FIXED_BEGIN : dayjs().subtract(30, 'd').unix(); // 30 days ago
	if (!latestTime) latestTime = global.FIXED_NOW ? global.FIXED_NOW : dayjs().unix();
	const chance = getChance();
	let totalRange = latestTime - earliestTime;
	if (totalRange <= 0 || earliestTime > latestTime) {
		//just flip earliest and latest
		let tempEarly = latestTime;
		let tempLate = earliestTime;
		earliestTime = tempEarly;
		latestTime = tempLate;
		totalRange = latestTime - earliestTime;
	}
	const chunkSize = totalRange / peaks;

	// Select a random chunk based on the number of peaks
	const peakIndex = integer(0, peaks - 1);
	const chunkStart = earliestTime + peakIndex * chunkSize;
	const chunkEnd = chunkStart + chunkSize;
	const chunkMid = (chunkStart + chunkEnd) / 2;

	// Optimized timestamp generation - clamp to valid range instead of looping
	const maxDeviation = chunkSize / deviation;
	let offset = chance.normal({ mean: mean, dev: maxDeviation });

	// Clamp to chunk boundaries to prevent infinite loops
	const proposedTime = chunkMid + offset;
	const clampedTime = Math.max(chunkStart, Math.min(chunkEnd, proposedTime));

	// Ensure it's within the overall valid range
	const finalTime = Math.max(earliestTime, Math.min(latestTime, clampedTime));

	// Update soup hits counter (keep for compatibility)
	soupHits++;

	try {
		return dayjs.unix(finalTime).toISOString();
	}

	catch (e) {
		//escape hatch
		// console.log('BAD TIME', e?.message);
		return dayjs.unix(integer(earliestTime, latestTime)).toISOString();
	}
}


/**
 * @param {string} userId
 * @param  {number} bornDaysAgo=30
 * @param {boolean} isAnonymous
 * @param {boolean} hasAvatar
 * @param {boolean} hasAnonIds
 * @param {boolean} hasSessionIds
 * @return {Person}
 */
function person(userId, bornDaysAgo = 30, isAnonymous = false, hasAvatar = false, hasAnonIds = false, hasSessionIds = false) {
	const chance = getChance();
	//names and photos
	const l = chance.letter.bind(chance);
	let gender = chance.pickone(['male', 'female']);
	if (!gender) gender = "female";
	let first = chance.first({ gender });
	let last = chance.last();
	let name = `${first} ${last}`;
	let email = `${first[0]}.${last}@${choose(domainPrefix)}.${choose(domainSuffix)}`;
	let avatarPrefix = `https://randomuser.me/api/portraits`;
	let randomAvatarNumber = integer(1, 99);
	let avPath = gender === 'male' ? `/men/${randomAvatarNumber}.jpg` : `/women/${randomAvatarNumber}.jpg`;
	let avatar = avatarPrefix + avPath;
	let created = dayjs().subtract(bornDaysAgo, 'day').format('YYYY-MM-DD');


	// const created = date(bornDaysAgo, true)();


	/** @type {Person} */
	const user = {
		distinct_id: userId,
		name,
		email,
		avatar,
		created,
		anonymousIds: [],
		sessionIds: []
	};

	if (isAnonymous) {
		user.name = "Anonymous User";
		user.email = l() + l() + `*`.repeat(integer(3, 6)) + l() + `@` + l() + `*`.repeat(integer(3, 6)) + l() + `.` + choose(domainSuffix);
		delete user.avatar;
	}

	if (!hasAvatar) delete user.avatar;

	//anon Ids
	if (hasAnonIds) {
		const clusterSize = integer(2, 10);
		for (let i = 0; i < clusterSize; i++) {
			const anonId = uid(42);
			user.anonymousIds.push(anonId);
		}
	}

	if (!hasAnonIds) delete user.anonymousIds;

	//session Ids
	if (hasSessionIds) {
		const sessionSize = integer(5, 30);
		for (let i = 0; i < sessionSize; i++) {
			const sessionId = [uid(5), uid(5), uid(5), uid(5)].join("-");
			user.sessionIds.push(sessionId);
		}
	}

	if (!hasSessionIds) delete user.sessionIds;

	return user;
};


function wrapFunc(obj, func, recursion = 0, parentKey = null, grandParentKey = null, whitelist = [
	"events",
	"superProps",
	"userProps",
	"scdProps",
	"mirrorProps",
	"groupEvents",
	"groupProps"
]) {
	if (recursion === 0) {
		// Only process top-level keys in the whitelist
		for (const key in obj) {
			if (whitelist.includes(key)) {
				obj[key] = wrapFunc(obj[key], func, recursion + 1, key, null, whitelist);
			}
		}
	} else {
		if (Array.isArray(obj) && grandParentKey === 'properties') {
			return func(obj);
		} else if (typeof obj === 'object' && obj !== null) {
			for (const key in obj) {
				if (obj.hasOwnProperty(key)) {
					obj[key] = wrapFunc(obj[key], func, recursion + 1, key, parentKey, whitelist);
				}
			}
		}
	}
	return obj;
}

//UNUSED

// function fixFunkyTime(earliestTime, latestTime) {
// 	if (!earliestTime) earliestTime = global.NOW - (60 * 60 * 24 * 30); // 30 days ago
// 	// if (typeof earliestTime !== "number") {
// 	// 	if (parseInt(earliestTime) > 0) earliestTime = parseInt(earliestTime);
// 	// 	if (dayjs(earliestTime).isValid()) earliestTime = dayjs(earliestTime).unix();
// 	// }
// 	if (typeof earliestTime !== "number") earliestTime = dayjs.unix(earliestTime).unix();
// 	if (typeof latestTime !== "number") latestTime = global.NOW;
// 	if (typeof latestTime === "number" && latestTime > global.NOW) latestTime = global.NOW;
// 	if (earliestTime > latestTime) {
// 		const tempEarlyTime = earliestTime;
// 		const tempLateTime = latestTime;
// 		earliestTime = tempLateTime;
// 		latestTime = tempEarlyTime;
// 	}
// 	if (earliestTime === latestTime) {
// 		earliestTime = dayjs.unix(earliestTime)
// 			.subtract(integer(1, 14), "day")
// 			.subtract(integer(1, 23), "hour")
// 			.subtract(integer(1, 59), "minute")
// 			.subtract(integer(1, 59), "second")
// 			.unix();
// 	}
// 	return [earliestTime, latestTime];

// }

const chance = getChance();
function odds(num) {	
	return chance.bool({ likelihood: num });
}

/**
 * makes a random-sized array of emojis
 * @param  {number} max=10
 * @param  {boolean} array=false
 */
function generateEmoji(max = 10, array = false) {
	const chance = getChance();
	return function () {
		const emojis = ['😀', '😂', '😍', '😎', '😜', '😇', '😡', '😱', '😭', '😴', '🤢', '🤠', '🤡', '👽', '👻', '💩', '👺', '👹', '👾', '🤖', '🤑', '🤗', '🤓', '🤔', '🤐', '😀', '😂', '😍', '😎', '😜', '😇', '😡', '😱', '😭', '😴', '🤢', '🤠', '🤡', '👽', '👻', '💩', '👺', '👹', '👾', '🤖', '🤑', '🤗', '🤓', '🤔', '🤐', '😈', '👿', '👦', '👧', '👨', '👩', '👴', '👵', '👶', '🧒', '👮', '👷', '💂', '🕵', '👩‍⚕️', '👨‍⚕️', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳', '👩‍🎓', '👨‍🎓', '👩‍🎤', '👨‍🎤', '👩‍🏫', '👨‍🏫', '👩‍🏭', '👨‍🏭', '👩‍💻', '👨‍💻', '👩‍💼', '👨‍💼', '👩‍🔧', '👨‍🔧', '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨', '👩‍🚒', '👨‍🚒', '👩‍✈️', '👨‍✈️', '👩‍🚀', '👨‍🚀', '👩‍⚖️', '👨‍⚖️', '🤶', '🎅', '👸', '🤴', '👰', '🤵', '👼', '🤰', '🙇', '💁', '🙅', '🙆', '🙋', '🤦', '🤷', '🙎', '🙍', '💇', '💆', '🕴', '💃', '🕺', '🚶', '🏃', '🤲', '👐', '🙌', '👏', '🤝', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤙', '💪', '🖕', '✍️', '🤳', '💅', '👂', '👃', '👣', '👀', '👁', '🧠', '👅', '👄', '💋', '👓', '🕶', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '👙', '👚', '👛', '👜', '👝', '🛍', '🎒', '👞', '👟', '👠', '👡', '👢', '👑', '👒', '🎩', '🎓', '🧢', '⛑', '📿', '💄', '💍', '💎', '🔇', '🔈', '🔉', '🔊', '📢', '📣', '📯', '🔔', '🔕', '🎼', '🎵', '🎶', '🎙', '🎚', '🎛', '🎤', '🎧', '📻', '🎷', '🎸', '🎹', '🎺', '🎻', '🥁', '📱', '📲', '💻', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '📡', '🔍', '🔎', '🔬', '🔭', '📡', '💡', '🔦', '🏮', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '🗞', '📑', '🔖', '🏷', '💰', '💴', '💵', '💶', '💷', '💸', '💳', '🧾', '💹', '💱', '💲', '✉️', '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳', '✏️', '✒️', '🖋', '🖊', '🖌', '🖍', '📝', '💼', '📁', '📂', '🗂', '📅', '📆', '🗒', '🗓', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇', '📏', '📐', '✂️', '🗃', '🗄', '🗑', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝', '🔨', '⛏', '⚒', '🛠', '🗡', '⚔️', '🔫', '🏹', '🛡', '🔧', '🔩', '⚙️', '🗜', '⚖️', '🔗', '⛓', '🧰', '🧲', '⚗️', '🧪', '🧫', '🧬', '🔬', '🔭', '📡', '💉', '💊', '🛏', '🛋', '🚪', '🚽', '🚿', '🛁', '🧴', '🧷', '🧹', '🧺', '🧻', '🧼', '🧽', '🧯', '🚬', '⚰️', '⚱️', '🗿', '🏺', '🧱', '🎈', '🎏', '🎀', '🎁', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧'];
		let num = integer(1, max);
		let arr = [];
		for (let i = 0; i < num; i++) {
			arr.push(chance.pickone(emojis));
		}
		if (array) return arr;
		if (!array) return arr.join(', ');
		return "🤷";
	};
};

function deepClone(thing, opts) {
	// Handle primitives first (most common case)
	if (thing === null || thing === undefined) return thing;

	const type = typeof thing;
	if (type !== 'object' && type !== 'function') {
		if (type === 'symbol') {
			return Symbol(thing.description);
		}
		return thing;
	}

	// Handle arrays (common case)
	if (Array.isArray(thing)) {
		const result = new Array(thing.length);
		for (let i = 0; i < thing.length; i++) {
			result[i] = deepClone(thing[i], opts);
		}
		return result;
	}

	// Handle other object types
	if (thing instanceof Date) return new Date(thing.getTime());
	if (thing instanceof RegExp) return new RegExp(thing.source, thing.flags);
	if (thing instanceof Function) {
		return opts && opts.newFns ?
			new Function('return ' + thing.toString())() :
			thing;
	}

	// Handle plain objects
	if (thing.constructor === Object) {
		const newObject = {};
		const keys = Object.keys(thing);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			newObject[key] = deepClone(thing[key], opts);
		}
		return newObject;
	}

	// Handle other object types
	try {
		return new thing.constructor(thing);
	} catch (e) {
		// Fallback for objects that can't be constructed this way
		const newObject = Object.create(Object.getPrototypeOf(thing));
		const keys = Object.keys(thing);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			newObject[key] = deepClone(thing[key], opts);
		}
		return newObject;
	}
};


export {
	pick,
	date,
	dates,
	day,
	choose,
	pickRandom,
	exhaust,
	integer,
	TimeSoup,
	companyName,
	generateEmoji,
	hasSameKeys,
	deepClone,
	initChance,
	getChance,
	decimal,
	odds,
	validTime,
	validEvent,

	boxMullerRandom,
	applySkew,
	mapToRange,
	weighNumRange,
	progress,
	range,
	openFinder,
	getUniqueKeys,
	person,
	pickAWinner,
	quickHash,
	weighArray,
	validateEventConfig,
	shuffleArray,
	shuffleExceptFirst,
	shuffleExceptLast,
	fixFirstAndLast,
	shuffleMiddle,
	shuffleOutside,
	interruptArray,
	generateUser,
	optimizedBoxMuller,
	buildFileNames,
	streamJSON,
	streamCSV,
	datesBetween,
	weighChoices,
	wrapFunc,
};