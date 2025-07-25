/**
 * This is the default configuration file for the data generator in SIMPLE mode
 * notice how the config object is structured, and see it's type definition in ./types.d.ts
 * feel free to modify this file to customize the data you generate
 * see helper functions in utils.js for more ways to generate data
 */




import Chance from 'chance';
const chance = new Chance();
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);
import { uid, comma } from 'ak-tools';
import { pickAWinner, weighNumRange, date, integer } from '../lib/utils/utils.js';

/** @type {import('../types').Dungeon} */
const config = {
	token: "",
	seed: "foo bar",
	numDays: 365, //how many days worth of data
	numEvents: 10000000, //how many events
	numUsers: 25000, //how many users	
	format: 'json', //csv or json
	region: "US",
	hasAnonIds: true, //if true, anonymousIds are created for each user
	hasSessionIds: false, //if true, hasSessionIds are created for each user
	hasAdSpend: true,
	events: [
		{
			event: "foo",
			weight: 10,
		},
		{
			event: "bar",
			weight: 9,
		},
		{
			event: "baz",
			weight: 8,
		},
		{
			event: "qux",
			weight: 7,
		},
		{
			event: "garply",
			weight: 6,
		},
		{
			event: "durtle",
			weight: 5,
		},
		{
			event: "linny",
			weight: 4,
		},
		{
			event: "fonk",
			weight: 3,
		},
		{
			event: "crumn",
			weight: 2,
		},
		{
			event: "yak",
			weight: 1,
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

	scdProps: {},
	mirrorProps: {},
	groupKeys: [],
	groupProps: {},
	lookupTables: [],
	hook: function (record, type, meta) {
		return record;
	}
};



export default config;