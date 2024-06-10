const fs = require('fs');
const Chance = require('chance');
const readline = require('readline');
const { comma, uid } = require('ak-tools');
const { spawn } = require('child_process');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const path = require('path');
const { mkdir } = require('ak-tools');
dayjs.extend(utc);
require('dotenv').config();

/** @typedef {import('./types').Config} Config */
/** @typedef {import('./types').ValueValid} ValueValid */
/** @typedef {import('./types').EnrichedArray} EnrichArray */
/** @typedef {import('./types').EnrichArrayOptions} EnrichArrayOptions */
/** @typedef {import('./types').Person} Person */

let globalChance;
let chanceInitialized = false;

/*
----
RNG
----
*/

/**
 * the random number generator initialization function
 * @param  {string} seed
 */
function initChance(seed) {
	if (process.env.SEED) seed = process.env.SEED;  // Override seed with environment variable if available
	if (!chanceInitialized) {
		globalChance = new Chance(seed);
		if (global.MP_SIMULATION_CONFIG) global.MP_SIMULATION_CONFIG.chance = globalChance;
		chanceInitialized = true;
	}
}

/**
 * the random number generator getter function
 * @returns {Chance}
 */
function getChance() {
	if (!chanceInitialized) {
		const seed = process.env.SEED || global.MP_SIMULATION_CONFIG?.seed;
		if (!seed) {
			return new Chance();
		}
		initChance(seed);
		return globalChance;
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
	const now = global.NOW ? dayjs.unix(global.NOW) : dayjs();
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

/**
 * returns a random date
 * @param  {any} start
 * @param  {any} end=global.NOW
 */
function day(start, end = global.NOW) {
	const chance = getChance();
	const format = 'YYYY-MM-DD';
	return function (min, max) {
		start = dayjs(start);
		end = dayjs.unix(global.NOW);
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
	try {
		// Keep resolving the value if it's a function
		while (typeof value === 'function') {
			value = value();
		}

		// Now, if the resolved value is an array, use chance.pickone
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
		return '';
	}
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


function pickAWinner(items, mostChosenIndex) {
	const chance = getChance();
	if (mostChosenIndex > items.length) mostChosenIndex = items.length;
	return function () {
		const weighted = [];
		for (let i = 0; i < 10; i++) {
			if (chance.bool({ likelihood: integer(10, 35) })) {
				if (chance.bool({ likelihood: 50 })) {
					weighted.push(items[mostChosenIndex]);
				}
				else {
					const rand = chance.d10();
					const addOrSubtract = chance.bool({ likelihood: 50 }) ? -rand : rand;
					let newIndex = mostChosenIndex + addOrSubtract;
					if (newIndex < 0) newIndex = 0;
					if (newIndex > items.length) newIndex = items.length;
					weighted.push(items[newIndex]);
				}
			}
			else {
				weighted.push(chance.pickone(items));
			}
		}
		return weighted;

	};
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
	step = !step ? 1 : step;
	b = b / step;
	for (var i = a; i <= b; i++) {
		this.push(i * step);
	}
	return this;
};


/*
----
STREAMERS
----
*/

function streamJSON(path, data) {
	return new Promise((resolve, reject) => {
		const writeStream = fs.createWriteStream(path, { encoding: 'utf8' });
		data.forEach(item => {
			writeStream.write(JSON.stringify(item) + '\n');
		});
		writeStream.end();
		writeStream.on('finish', () => {
			resolve(path);
		});
		writeStream.on('error', reject);
	});
}

function streamCSV(path, data) {
	return new Promise((resolve, reject) => {
		const writeStream = fs.createWriteStream(path, { encoding: 'utf8' });
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
			resolve(path);
		});
		writeStream.on('error', reject);
	});
}


/*
----
WEIGHERS
----
*/

function weighFunnels(acc, funnel) {
	const weight = funnel?.weight || 1;
	for (let i = 0; i < weight; i++) {
		acc.push(funnel);
	}
	return acc;
}

/**
 * a utility function to generate a range of numbers within a given skew
 * Skew = 0.5: The values are more concentrated towards the extremes (both ends of the range) with a noticeable dip in the middle. The distribution appears more "U" shaped. Larger sizes result in smoother distributions but maintain the overall shape.
 * Skew = 1: This represents the default normal distribution without skew. The values are normally distributed around the mean. Larger sizes create a clearer bell-shaped curve.
 * Skew = 2: The values are more concentrated towards the mean, with a steeper drop-off towards the extremes. The distribution appears more peaked, resembling a "sharper" bell curve. Larger sizes enhance the clarity of this peaked distribution.
 * Size represents the size of the pool to choose from; Larger sizes result in smoother distributions but maintain the overall shape.
 * @param  {number} min
 * @param  {number} max
 * @param  {number} skew=1
 * @param  {number} size=100
 */
function weightedRange(min, max, skew = 1, size = 100) {
	const mean = (max + min) / 2;
	const sd = (max - min) / 4;
	const array = [];
	while (array.length < size) {
		const normalValue = boxMullerRandom();
		const skewedValue = applySkew(normalValue, skew);
		const mappedValue = mapToRange(skewedValue, mean, sd);
		if (mappedValue >= min && mappedValue <= max) {
			array.push(mappedValue);
		}
	}
	return array;
}

function weighArray(arr) {

	// Calculate the upper bound based on the size of the array with added noise
	const maxCopies = arr.length + integer(1, arr.length);

	// Create an empty array to store the weighted elements
	let weightedArray = [];

	// Iterate over the input array and copy each element a random number of times
	arr.forEach(element => {
		let copies = integer(1, maxCopies);
		for (let i = 0; i < copies; i++) {
			weightedArray.push(element);
		}
	});

	return weightedArray;
}

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
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
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

/*
----
META
----
*/

/** 
 * our meta programming function which lets you mutate items as they are pushed into an array
 * @param  {any[]} arr
 * @param  {EnrichArrayOptions} opts
 * @returns {EnrichArray}}
 */
function enrichArray(arr = [], opts = {}) {
	const { hook = a => a, type = "", ...rest } = opts;

	function transformThenPush(item) {
		if (item === null) return 0;
		if (item === undefined) return 0;
		if (typeof item === 'object') {
			if (Object.keys(item).length === 0) return 0;
		}
		if (Array.isArray(item)) {
			for (const i of item) {
				try {
					const enriched = hook(i, type, rest);
					arr.push(enriched);
				}
				catch (e) {
					console.error(`\n\nyour hook had an error\n\n`, e);
					arr.push(i);
				}

			}
			return -1;
		}
		else {
			try {
				const enriched = hook(item, type, rest);
				return arr.push(enriched);
			}
			catch (e) {
				console.error(`\n\nyour hook had an error\n\n`, e);
				return arr.push(item);
			}
		}

	}

	/** @type {EnrichArray} */
	// @ts-ignore
	const enrichedArray = arr;


	enrichedArray.hookPush = transformThenPush;


	return enrichedArray;
};

function buildFileNames(config) {
	const { format = "csv", groupKeys = [], lookupTables = [] } = config;
	let extension = "";
	extension = format === "csv" ? "csv" : "json";
	// const current = dayjs.utc().format("MM-DD-HH");
	const simName = config.simulationName;
	let writeDir = "./";
	if (config.writeToDisk) writeDir = mkdir("./data");
	if (typeof writeDir !== "string") throw new Error("writeDir must be a string");
	if (typeof simName !== "string") throw new Error("simName must be a string");

	const writePaths = {
		eventFiles: [path.join(writeDir, `${simName}-EVENTS.${extension}`)],
		userFiles: [path.join(writeDir, `${simName}-USERS.${extension}`)],
		scdFiles: [],
		mirrorFiles: [],
		groupFiles: [],
		lookupFiles: [],
		folder: writeDir,
	};

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


function progress(thing, p) {
	// @ts-ignore
	readline.cursorTo(process.stdout, 0);
	process.stdout.write(`${thing} processed ... ${comma(p)}`);
};


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
function generateUser(user_id, numDays, amplitude = 1, frequency = 1, skew = 1) {
	const chance = getChance();
	// Uniformly distributed `u`, then skew applied
	let u = Math.pow(chance.random(), skew);

	// Sine function for a smoother curve
	const sineValue = (Math.sin(u * Math.PI * frequency - Math.PI / 2) * amplitude + 1) / 2;

	// Scale the sineValue to the range of days
	let daysAgoBorn = Math.round(sineValue * (numDays - 1)) + 1;

	// Clamp values to ensure they are within the desired range
	daysAgoBorn = Math.min(daysAgoBorn, numDays);

	const user = {
		distinct_id: user_id,
		...person(numDays),
	};


	return user;
}

/**
 * build sign waves basically
 * @param  {number} [earliestTime]
 * @param  {number} [latestTime]
 * @param  {number} [numPeaks=5]
 */
function TimeSoup(earliestTime, latestTime, numPeaks = 5, deviation = 2) {
	if (!earliestTime) earliestTime = global.NOW - (60 * 60 * 24 * 30); // 30 days ago
	if (!latestTime) latestTime = global.NOW;
	const chance = getChance();
	const totalRange = latestTime - earliestTime;
	const chunkSize = totalRange / numPeaks;

	// Select a random chunk based on the number of peaks
	const peakIndex = integer(0, numPeaks - 1);
	const chunkStart = earliestTime + peakIndex * chunkSize;
	const chunkEnd = chunkStart + chunkSize;
	const chunkMid = (chunkStart + chunkEnd) / 2;

	// Generate a single timestamp within this chunk using a normal distribution centered at chunkMid
	let offset;
	do {
		offset = chance.normal({ mean: 0, dev: chunkSize / deviation });
	} while (chunkMid + offset < chunkStart || chunkMid + offset > chunkEnd);

	return dayjs.unix(chunkMid + offset).toISOString();
}

/**
 * @param  {number} bornDaysAgo=30
 * @return {Person}
 */
function person(bornDaysAgo = 30) {
	const chance = getChance();
	//names and photos
	let gender = chance.pickone(['male', 'female']);
	if (!gender) gender = "female";
	// @ts-ignore
	const first = chance.first({ gender });
	const last = chance.last();
	const name = `${first} ${last}`;
	const email = `${first[0]}.${last}@${chance.domain()}.com`;
	const avatarPrefix = `https://randomuser.me/api/portraits`;
	const randomAvatarNumber = chance.integer({
		min: 1,
		max: 99
	});
	const avPath = gender === 'male' ? `/men/${randomAvatarNumber}.jpg` : `/women/${randomAvatarNumber}.jpg`;
	const avatar = avatarPrefix + avPath;
	const created = dayjs.unix(global.NOW).subtract(bornDaysAgo, 'day').format('YYYY-MM-DD')
	// const created = date(bornDaysAgo, true)();

	/** @type {Person} */
	const user = {
		name,
		email,
		avatar,
		created,
		anonymousIds: [],
		sessionIds: []
	};

	//anon Ids
	if (global.MP_SIMULATION_CONFIG?.anonIds) {
		const clusterSize = integer(2, 10);
		for (let i = 0; i < clusterSize; i++) {
			const anonId = uid(42);
			user.anonymousIds.push(anonId);
		}

	}

	//session Ids
	if (global.MP_SIMULATION_CONFIG?.sessionIds) {
		const sessionSize = integer(5, 30);
		for (let i = 0; i < sessionSize; i++) {
			const sessionId = [uid(5), uid(5), uid(5), uid(5)].join("-");
			user.sessionIds.push(sessionId);
		}
	}

	return user;
};




//UNUSED

function fixFunkyTime(earliestTime, latestTime) {
	if (!earliestTime) earliestTime = global.NOW - (60 * 60 * 24 * 30); // 30 days ago
	// if (typeof earliestTime !== "number") {
	// 	if (parseInt(earliestTime) > 0) earliestTime = parseInt(earliestTime);
	// 	if (dayjs(earliestTime).isValid()) earliestTime = dayjs(earliestTime).unix();
	// }
	if (typeof earliestTime !== "number") earliestTime = dayjs.unix(earliestTime).unix();
	if (typeof latestTime !== "number") latestTime = global.NOW;
	if (typeof latestTime === "number" && latestTime > global.NOW) latestTime = global.NOW;
	if (earliestTime > latestTime) {
		const tempEarlyTime = earliestTime;
		const tempLateTime = latestTime;
		earliestTime = tempLateTime;
		latestTime = tempEarlyTime;
	}
	if (earliestTime === latestTime) {
		earliestTime = dayjs.unix(earliestTime)
			.subtract(integer(1, 14), "day")
			.subtract(integer(1, 23), "hour")
			.subtract(integer(1, 59), "minute")
			.subtract(integer(1, 59), "second")
			.unix();
	}
	return [earliestTime, latestTime];

}


function isValidTime(chosenTime, earliestTime, latestTime) {
	if (!earliestTime) earliestTime = global.NOW - (60 * 60 * 24 * 30); // 30 days ago
	if (!latestTime) latestTime = global.NOW;

	const parsedTime = typeof chosenTime === "number" ? dayjs.unix(chosenTime) : dayjs(chosenTime);
	const unixTime = parsedTime.unix();
	if (unixTime > 0) {
		if (unixTime > earliestTime) {
			if (unixTime < (latestTime - (60 * 2))) {
				if (parsedTime.toISOString().startsWith('20')) {
					return true;
				}
			}

		}
	}
	return false;
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



module.exports = {
	pick,
	date,
	dates,
	day,
	choose,
	exhaust,
	integer,
	TimeSoup,

	generateEmoji,


	initChance,
	getChance,

	boxMullerRandom,
	applySkew,
	mapToRange,
	weightedRange,
	progress,
	range,
	openFinder,
	getUniqueKeys,
	person,
	pickAWinner,
	weighArray,
	weighFunnels,

	shuffleArray,
	shuffleExceptFirst,
	shuffleExceptLast,
	fixFirstAndLast,
	shuffleMiddle,
	shuffleOutside,

	generateUser,
	enrichArray,

	buildFileNames,
	streamJSON,
	streamCSV
};