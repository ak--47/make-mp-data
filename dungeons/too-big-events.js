/**
 * "Too Big Events" dungeon
 * Tests Mixpanel row limit (1MB) and column limit (8KB for arrays of objects)
 * Generates events with absurd numbers of properties and oversized array-of-object columns
 */

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);

function integer(min = 1, max = 100) {
	if (min === max) return min;
	if (min > max) [min, max] = [max, min];
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loremChunk(size = 200) {
	const words = ["foo", "bar", "baz", "qux", "garply", "waldo", "fred", "plugh", "xyzzy", "thud", "corge", "grault", "flob", "zorp", "narf", "blip", "snork", "quux", "wobble", "crumn"];
	let result = "";
	while (result.length < size) {
		result += words[Math.floor(Math.random() * words.length)] + " ";
	}
	return result.trim();
}

// Generate a fat array of objects (targeting >8KB per column)
function bigArrayOfObjects(numItems = 50) {
	numItems = numItems * 2
	return () => {
		const arr = [];
		for (let i = 0; i < numItems; i++) {
			arr.push({
				id: `item_${i}_${Math.random().toString(36).slice(2, 10)}`,
				name: loremChunk(80),
				description: loremChunk(150),
				category: ["foo", "bar", "baz", "qux"][Math.floor(Math.random() * 4)],
				price: parseFloat((Math.random() * 999).toFixed(2)),
				quantity: integer(1, 100),
				tags: ["alpha", "beta", "gamma", "delta", "epsilon"].slice(0, integer(1, 5)),
				metadata: {
					source: loremChunk(40),
					ref: Math.random().toString(36).slice(2, 14),
					ts: new Date().toISOString()
				}
			});
		}
		return arr;
	};
}

// Generate a truly massive array of objects (way over 8KB)
function hugeArrayOfObjects() {
	return bigArrayOfObjects(150)();
}

// Build a ton of flat properties to bloat row size toward 1MB
function manyProperties(count = 200) {
	count = count * 2
	const props = {};
	for (let i = 0; i < count; i++) {
		const type = i % 4;
		if (type === 0) props[`str_prop_${i}`] = () => loremChunk(300);
		else if (type === 1) props[`num_prop_${i}`] = () => integer(1, 999999);
		else if (type === 2) props[`bool_prop_${i}`] = [true, false];
		else props[`list_prop_${i}`] = () => Array.from({ length: integer(5, 20) }, () => loremChunk(50));
	}
	return props;
}

const seed = "too-big-" + Math.random().toString(36).slice(2, 8);

/** @type {import('../types').Dungeon} */
const config = {
	token: "",
	seed: seed,
	numDays: 30,
	numEvents: 1000,
	numUsers: 50,
	format: 'json',
	region: "US",
	hasAnonIds: false,
	hasSessionIds: false,
	batchSize: 10000,
	hasAdSpend: false,
	hasAvatar: false,
	hasBrowser: false,
	hasCampaigns: false,
	hasIOSDevices: false,
	hasLocation: false,
	isAnonymous: true,
	hasAndroidDevices: false,
	hasDesktopDevices: false,
	writeToDisk: false,
	concurrency: 1,

	events: [
		{
			// ~200 string/number/bool/list properties = fat rows approaching 1MB
			event: "mega_row",
			weight: 5,
			properties: {
				...manyProperties(250),
				// also throw in some big array-of-object columns
				cart_items: bigArrayOfObjects(60),
				order_history: bigArrayOfObjects(80),
			}
		},
		{
			// single event focused on huge array-of-object columns (well over 8KB each)
			event: "array_bomb",
			weight: 5,
			properties: {
				massive_list_a: bigArrayOfObjects(150),
				massive_list_b: bigArrayOfObjects(150),
				massive_list_c: bigArrayOfObjects(100),
				some_prop: ["foo", "bar", "baz"],
				another_prop: () => integer(1, 1000),
			}
		},
		{
			// moderate event with a mix of oversized columns
			event: "chonky_boi",
			weight: 3,
			properties: {
				...manyProperties(100),
				nested_blob: () => {
					const obj = {};
					for (let i = 0; i < 50; i++) {
						obj[`key_${i}`] = {
							value: loremChunk(200),
							items: Array.from({ length: 20 }, (_, j) => ({
								id: j,
								data: loremChunk(100),
								flag: Math.random() > 0.5
							}))
						};
					}
					return obj;
				},
				product_catalog: bigArrayOfObjects(120),
			}
		},
		{
			// normal-ish event for contrast
			event: "smol_event",
			weight: 2,
			properties: {
				color: ["red", "blue", "green"],
				count: () => integer(1, 10),
			}
		}
	],

	superProps: {},
	userProps: {
		name: () => `user_${Math.random().toString(36).slice(2, 8)}`,
	},

	scdProps: {},
	mirrorProps: {},
	lookupTables: [],
	groupKeys: [],
	groupProps: {},

	hook: function (record, type, meta) {
		// --- event hook: tag events with estimated row size category ---
		if (type === "event") {
			const propCount = Object.keys(record).length;
			if (propCount > 300) {
				record.size_class = "mega";
			} else if (propCount > 100) {
				record.size_class = "large";
			} else {
				record.size_class = "normal";
			}
			return record;
		}

		// --- everything hook: append a summary event tallying the user's event types ---
		if (type === "everything" && record.length > 0) {
			const counts = {};
			for (const e of record) {
				counts[e.event] = (counts[e.event] || 0) + 1;
			}
			const lastEvent = record[record.length - 1];
			record.push({
				event: "user_event_summary",
				time: dayjs(lastEvent.time).add(1, "second").toISOString(),
				user_id: lastEvent.user_id,
				mega_row_count: counts["mega_row"] || 0,
				array_bomb_count: counts["array_bomb"] || 0,
				chonky_boi_count: counts["chonky_boi"] || 0,
				smol_event_count: counts["smol_event"] || 0,
				total_events: record.length
			});
			return record;
		}

		return record;
	}
};

export default config;
