const fs = require('fs');
const Chance = require('chance');
const chance = new Chance();
const readline = require('readline');
const { comma, uid } = require('ak-tools');
const { spawn } = require('child_process');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const path = require('path');
const { mkdir } = require('ak-tools');

dayjs.extend(utc);


function pick(items) {
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

function date(inTheLast = 30, isPast = true, format = 'YYYY-MM-DD') {
	const now = dayjs();
	// dates must be in the the last 10 years
	if (Math.abs(inTheLast) > 365 * 10) inTheLast = chance.integer({ min: 1, max: 180 });
	return function () {
		try {
			const when = chance.integer({ min: 0, max: Math.abs(inTheLast) });
			let then;
			if (isPast) {
				then = now.subtract(when, 'day')
					.subtract(integer(0, 23), 'hour')
					.subtract(integer(0, 59), 'minute')
					.subtract(integer(0, 59), 'second');
			}
			if (!isPast) {
				then = now.add(when, 'day')
					.add(integer(0, 23), 'hour')
					.add(integer(0, 59), 'minute')
					.add(integer(0, 59), 'second');
			}
			if (format) return then?.format(format);
			if (!format) return then?.toISOString();
		}
		catch (e) {
			if (format) return now?.format(format);
			if (!format) return now?.toISOString();
		}
	};
};

function dates(inTheLast = 30, numPairs = 5, format = 'YYYY-MM-DD') {
	const pairs = [];
	for (let i = 0; i < numPairs; i++) {
		pairs.push([date(inTheLast, true, format), date(inTheLast, true, format)]);
	}
	return pairs;
};

function day(start, end) {
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

function choose(value) {
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
function exhaust(arr) {
	return function () {
		return arr.shift();
	};
};

function integer(min = 1, max = 100) {
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

// Box-Muller transform to generate standard normally distributed values
function boxMullerRandom() {
	let u = 0, v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

// Apply skewness to the value
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

function unOptimizedWeightedRange(min, max, size = 100, skew = 1) {
	const mean = (max + min) / 2;
	const sd = (max - min) / 4;
	let array = [];

	for (let i = 0; i < size; i++) {
		let normalValue = boxMullerRandom();
		let skewedValue = applySkew(normalValue, skew);
		let mappedValue = mapToRange(skewedValue, mean, sd);

		// Ensure the mapped value is within our min-max range
		if (mappedValue >= min && mappedValue <= max) {
			array.push(mappedValue);
		} else {
			i--; // If out of range, redo this iteration
		}
	}

	return array;
};

// optimized weighted range
function weightedRange(min, max, size = 100, skew = 1) {
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

function progress(thing, p) {
	// @ts-ignore
	readline.cursorTo(process.stdout, 0);
	process.stdout.write(`${thing} processed ... ${comma(p)}`);
};

function range(a, b, step = 1) {
	step = !step ? 1 : step;
	b = b / step;
	for (var i = a; i <= b; i++) {
		this.push(i * step);
	}
	return this;
};


//helper to open the finder
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

//
/**
 * makes a random-sized array of emojis
 * @param  {number} max=10
 * @param  {boolean} array=false
 */
function generateEmoji(max = 10, array = false) {
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

/** @typedef {import('./types').Person} Person */

/**
 * @param  {number} bornDaysAgo=30
 * @return {Person}
 */
function person(bornDaysAgo = 30) {
	//names and photos
	let gender = chance.pickone(['male', 'female']);
	if (!gender) gender = "female";
	// @ts-ignore
	const first = chance.first({ gender });
	const last = chance.last();
	const $name = `${first} ${last}`;
	const $email = `${first[0]}.${last}@${chance.domain()}.com`;
	const avatarPrefix = `https://randomuser.me/api/portraits`;
	const randomAvatarNumber = chance.integer({
		min: 1,
		max: 99
	});
	const avPath = gender === 'male' ? `/men/${randomAvatarNumber}.jpg` : `/women/${randomAvatarNumber}.jpg`;
	const $avatar = avatarPrefix + avPath;
	const $created = date(bornDaysAgo, true)();

	/** @type {Person} */
	const user = {
		$name,
		$email,
		$avatar,
		$created,
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


function pickAWinner(items, mostChosenIndex) {
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


function weighFunnels(acc, funnel) {
	const weight = funnel?.weight || 1;
	for (let i = 0; i < weight; i++) {
		acc.push(funnel);
	}
	return acc;
}


// Function to shuffle array
function shuffleArray(array) {
	return array.sort(() => Math.random() - 0.5);
}

// Function to shuffle all except the first element
function shuffleExceptFirst(array) {
	if (array.length <= 1) return array;
	const restShuffled = shuffleArray(array.slice(1));
	return [array[0], ...restShuffled];
};

// Function to shuffle all except the last element
function shuffleExceptLast(array) {
	if (array.length <= 1) return array;
	const restShuffled = shuffleArray(array.slice(0, -1));
	return [...restShuffled, array[array.length - 1]];
};

// Function to fix the first and last elements and shuffle the middle ones
function fixFirstAndLast(array) {
	if (array.length <= 2) return array;
	const middleShuffled = shuffleArray(array.slice(1, -1));
	return [array[0], ...middleShuffled, array[array.length - 1]];
};

// Function to shuffle only the middle elements
function shuffleMiddle(array) {
	if (array.length <= 2) return array;
	const middleShuffled = shuffleArray(array.slice(1, -1));
	return [array[0], ...middleShuffled, array[array.length - 1]];
};

function shuffleOutside(array) {
	if (array.length <= 2) return array;
	const middleFixed = array.slice(1, -1);
	const outsideShuffled = shuffleArray([array[0], array[array.length - 1]]);
	return [outsideShuffled[0], ...middleFixed, outsideShuffled[1]];
};


//the function which generates $distinct_id + $anonymous_ids, $session_ids, and $created, skewing towards the present
function generateUser(uuid, numDays) {
	const distinct_id = uuid.guid();
	let z = boxMullerRandom();
	const skew = chance.normal({ mean: 10, dev: 3 });
	z = applySkew(z, skew);

	// Scale and shift the normally distributed value to fit the range of days
	const maxZ = integer(2, 4);
	const scaledZ = (z / maxZ + 1) / 2;
	const daysAgoBorn = Math.round(scaledZ * (numDays - 1)) + 1;

	return {
		distinct_id,
		...person(daysAgoBorn),
	};
}

/** @typedef {import('./types').EnrichedArray} EnrichArray */
/** @typedef {import('./types').EnrichArrayOptions} EnrichArrayOptions */

/** 
 * @param  {any[]} arr
 * @param  {EnrichArrayOptions} opts
 * @returns {EnrichArray}}
 */
function enrichArray(arr = [], opts = {}) {
	const { hook = a => a, type = "", ...rest } = opts;

	function transformThenPush(item) {
		if (Array.isArray(item)) {
			for (const i of item) {
				arr.push(hook(i, type, rest));
			}
			return -1;
		}
		else {
			return arr.push(hook(item, type, rest));
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



module.exports = {
	pick,
	date,
	dates,
	day,
	choose,
	exhaust,
	integer,

	boxMullerRandom,
	applySkew,
	mapToRange,
	weightedRange,
	progress,
	range,
	openFinder,
	getUniqueKeys,
	generateEmoji,
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