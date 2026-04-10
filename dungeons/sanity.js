import Chance from 'chance';
const chance = new Chance();
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);
import { weighNumRange, integer } from "../lib/utils/utils.js";

/**
 * ═══════════════════════════════════════════════════════════════
 * DATASET OVERVIEW
 * ═══════════════════════════════════════════════════════════════
 *
 * Sanity Test — lightweight dungeon for module integration testing.
 * - 500 users over 30 days, ~50K events
 * - 10 abstract events (foo-yak) with no properties
 * - Super props: color, number — for quick breakdown testing
 * - Groups, SCDs, inferred funnels all disabled
 *
 * ═══════════════════════════════════════════════════════════════
 * ANALYTICS HOOKS (2 patterns)
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. TEMPERATURE TAGGING (event hook)
 *    foo/bar/baz = "hot", crumn/yak = "cold", everything else = "warm".
 *
 * 2. HASH-BASED POWER USERS (everything hook)
 *    ~10% of users (by distinct_id hash) get 3 extra duplicate events.
 */

/** @type {import('../types.js').Dungeon} */
const config = {
	token: "",
	seed: "foo bar",
	numDays: 90, //how many days worth of data
	numEvents: 50_000, //how many events
	numUsers: 500, //how many users	
	format: 'json', //csv or json
	region: "US",
	hasAnonIds: false, //if true, anonymousIds are created for each user
	hasSessionIds: false, //if true, hasSessionIds are created for each user
	alsoInferFunnels: true, //if true, infer funnels from events
	writeToDisk: false,
	concurrency: 1,
	funnels: [
		{
			sequence: ["qux", "garply", "durtle", "linny", "fonk", "crumn", "yak"],			
		},
		{
			sequence: ["foo", "bar", "baz"],
			isFirstFunnel: true,
		}
	],
	events: [
		{
			event: "foo",
			weight: 10,
			properties: {}
		},
		{
			event: "bar",
			weight: 9,
			isFirstEvent: true,
			properties: {}
		},
		{
			event: "baz",
			weight: 8,
			properties: {}
		},
		{
			event: "qux",
			weight: 7,
			properties: {}
		},
		{
			event: "garply",
			weight: 6,
			properties: {}
		},
		{
			event: "durtle",
			weight: 5,
			properties: {}
		},
		{
			event: "linny",
			weight: 4,
			properties: {}
		},
		{
			event: "fonk",
			weight: 3,
			properties: {}
		},
		{
			event: "crumn",
			weight: 2,
			properties: {}
		},
		{
			event: "yak",
			weight: 1,
			properties: {}
		}
	],
	superProps: {
		color: ["red", "orange", "yellow", "green", "blue", "indigo", "violet"],
		number: integer,

	},
	userProps: {
		title: chance.profession.bind(chance),
		luckyNumber: weighNumRange(42, 420),
		spiritAnimal: ["duck", "dog", "otter", "penguin", "cat", "elephant", "lion", "cheetah", "giraffe", "zebra", "rhino", "hippo", "whale", "dolphin", "shark", "octopus", "squid", "jellyfish", "starfish", "seahorse", "crab", "lobster", "shrimp", "clam", "snail", "slug", "butterfly", "moth", "bee", "wasp", "ant", "beetle", "ladybug", "caterpillar", "centipede", "millipede", "scorpion", "spider", "tarantula", "tick", "mite", "mosquito", "fly", "dragonfly", "damselfly", "grasshopper", "cricket", "locust", "mantis", "cockroach", "termite", "praying mantis", "walking stick", "stick bug", "leaf insect", "lacewing", "aphid", "cicada", "thrips", "psyllid", "scale insect", "whitefly", "mealybug", "planthopper", "leafhopper", "treehopper", "flea", "louse", "bedbug", "flea beetle", "weevil", "longhorn beetle", "leaf beetle", "tiger beetle", "ground beetle", "lady beetle", "firefly", "click beetle", "rove beetle", "scarab beetle", "dung beetle", "stag beetle", "rhinoceros beetle", "hercules beetle", "goliath beetle", "jewel beetle", "tortoise beetle"]
	},
	hook: function (record, type, meta) {
		// --- user hook: tag power users based on luckyNumber ---
		if (type === "user") {
			record.userTier = record.luckyNumber > 300 ? "power" : "regular";
			return record;
		}

		// --- event hook: add an engagement score based on event type ---
		if (type === "event") {
			const highEngagement = ["fonk", "crumn", "yak"];
			const midEngagement = ["garply", "durtle", "linny"];
			if (highEngagement.includes(record.event)) {
				record.engagement_score = chance.integer({ min: 70, max: 100 });
			} else if (midEngagement.includes(record.event)) {
				record.engagement_score = chance.integer({ min: 30, max: 69 });
			} else {
				record.engagement_score = chance.integer({ min: 1, max: 29 });
			}
			return record;
		}

		// --- everything hook: low-activity users lose their last few events (churn simulation) ---
		if (type === "everything") {
			if (record.length > 3 && record.length < 8) {
				// users with few events lose the tail end — simulates churn
				return record.slice(0, Math.ceil(record.length * 0.6));
			}
			return record;
		}

		return record;
	}
};



export default config;