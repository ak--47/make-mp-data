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
	seed: "mirror me",
	numDays: 30, //how many days worth of data
	numEvents: 10000, //how many events
	numUsers: 1000, //how many users	
	format: 'json', //csv or json
	region: "US",
	hasAnonIds: true, //if true, anonymousIds are created for each user
	hasSessionIds: false, //if true, hasSessionIds are created for each user

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
		deleteMe: ["hello", "world", "i", "should", "be", "deleted"],		
		updateMe: weighNumRange(1, 10)
	},
	userProps: {
		title: chance.profession.bind(chance),
		luckyNumber: weighNumRange(42, 420),
		spiritAnimal: ["duck", "dog", "otter", "penguin", "cat", "elephant", "lion", "cheetah", "giraffe", "zebra", "rhino", "hippo", "whale", "dolphin", "shark", "octopus", "squid", "jellyfish", "starfish", "seahorse", "crab", "lobster", "shrimp", "clam", "snail", "slug", "butterfly", "moth", "bee", "wasp", "ant", "beetle", "ladybug", "caterpillar", "centipede", "millipede", "scorpion", "spider", "tarantula", "tick", "mite", "mosquito", "fly", "dragonfly", "damselfly", "grasshopper", "cricket", "locust", "mantis", "cockroach", "termite", "praying mantis", "walking stick", "stick bug", "leaf insect", "lacewing", "aphid", "cicada", "thrips", "psyllid", "scale insect", "whitefly", "mealybug", "planthopper", "leafhopper", "treehopper", "flea", "louse", "bedbug", "flea beetle", "weevil", "longhorn beetle", "leaf beetle", "tiger beetle", "ground beetle", "lady beetle", "firefly", "click beetle", "rove beetle", "scarab beetle", "dung beetle", "stag beetle", "rhinoceros beetle", "hercules beetle", "goliath beetle", "jewel beetle", "tortoise beetle"]
	},

	scdProps: {},
	mirrorProps: {
		"newlyCreated": {
			events: "*",
			strategy: "create",
			values: ["fickle", "buckle", "tickle", "mackle"]

		},
		"deleteMe": {
			events: "*",
			strategy: "delete",
			values: ["ignored"]
		},
		"fillMe": {
			events: "*",
			strategy: "fill",
			values: ["deal", "with", "it"]
		},
		"updateMe": {
			events: "*",
			strategy: "update",
			values: weighNumRange(11, 20)
		},
	},
	groupKeys: [],
	groupProps: {},
	lookupTables: [],
	hook: function (record, type, meta) {
		return record;
	}
};



export default config;