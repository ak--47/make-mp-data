/**
 * This is the default configuration file for the data generator in SIMPLE mode
 * notice how the config object is structured, and see it's type definition in ./types.d.ts
 * feel free to modify this file to customize the data you generate
 * see helper functions in utils.js for more ways to generate data
 */


/* cSpell:disable */



const Chance = require('chance');
const chance = new Chance();
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const { uid, comma } = require('ak-tools');
const { pickAWinner, weighNumRange, date, integer } = require('../components/utils');

/** @type {import('../types').Dungeon} */
const config = {
	token: "",
	seed: "lets go",
	numDays: 90, //how many days worth of data
	numEvents: 100_000, //how many events
	numUsers: 10_000, //how many users	
	format: 'csv', //csv or json
	region: "US",
	hasAnonIds: true, //if true, anonymousIds are created for each user
	hasSessionIds: false, //if true, hasSessionIds are created for each user
	hasLocation: true,
	events: [
		{
			event: "foo",
			weight: 10,
			properties: {}
		},
		{
			event: "bar",
			weight: 9,
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

	scdProps: {
		"donk": ["dude", "man", "brok"],
		"pronk": ["monk", "lonk", "aonk"],
	},
	mirrorProps: {},
	groupKeys: [
		["companies", 100_000],
		["servers", 3_000_000],
		["crews", 1000],

	],
	groupProps: {
		companies: {
			name: chance.company.bind(chance),
			industry: ["tech", "finance", "healthcare", "education", "retail", "manufacturing", "entertainment", "government", "non-profit", "other"],
		},
		servers: {
			name: chance.word.bind(chance),
			ram: weighNumRange(4, 64, .25),
			cpu: weighNumRange(1, 16, .25),

		},
		crews: {
			name: chance.word.bind(chance),
			department: ["engineering", "design", "marketing", "sales", "finance", "hr", "legal", "operations", "support", "other"],
			size: weighNumRange(5, 50, .25)
		}
	},
	lookupTables: [{
			key: "product_id",
			entries: 2_000_000,
			attributes: {
				category: [
					"Books", "Movies", "Music", "Games", "Electronics", "Computers", "Smart Home", "Home", "Garden & Tools", "Pet Supplies", "Food & Grocery", "Beauty", "Health", "Toys", "Kids", "Baby", "Handmade", "Sports", "Outdoors", "Automotive", "Industrial", "Entertainment", "Art"
				],
				"demand": ["high", "medium", "medium", "low"],
				"supply": ["high", "medium", "medium", "low"],
				"manufacturer": chance.company.bind(chance),
				"price": weighNumRange(5, 500, .25),
				"rating": weighNumRange(1, 5),
				"reviews": weighNumRange(0, 35)
			}

		},
		{
			key: "video_id",
			entries: 10_000_000,
			attributes: {
				isFlagged: [true, false, false, false, false],
				copyright: ["all rights reserved", "creative commons", "creative commons", "public domain", "fair use"],
				uploader_id: chance.guid.bind(chance),
				"uploader influence": ["low", "low", "low", "medium", "medium", "high"],
				thumbs: weighNumRange(0, 35),
				rating: ["G", "PG", "PG-13", "R", "NC-17", "PG-13", "R", "NC-17", "R", "PG", "PG"]
			}

		}],
	hook: function (record, type, meta) {
		return record;
	}
};



module.exports = config;