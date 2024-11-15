/**
 * This is the default configuration file for the data generator in SIMPLE mode
 * notice how the config object is structured, and see it's type definition in ./types.d.ts
 * feel free to modify this file to customize the data you generate
 * see helper functions in utils.js for more ways to generate data
 */


/* cSpell:disable */


const seed = "lets go big ONE";
const Chance = require('chance');
const chance = new Chance();
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const { uid, comma, makeName } = require('ak-tools');
const { pickAWinner, weighNumRange, integer, date, choose } = require('../components/utils');


const eventsPerQuarter = 5_000_000_000 // ~5 billion
const numQuarters = 8; // 24 months
const parallelism = 5000; 
const totalEvents = Math.floor((eventsPerQuarter * numQuarters) / parallelism);
const eventPerUser = 500;
const totalUsers = Math.floor(totalEvents / eventPerUser);
const totalDays = (numQuarters * 90) + 10;

/** @type {import('../types').Dungeon} */
const config = {
	token: "",
	seed: seed,
	numDays: totalDays,
	numEvents: totalEvents,
	numUsers: totalUsers,
	format: 'json', //csv or json
	region: "US",
	hasAnonIds: false, //if true, anonymousIds are created for each user
	hasSessionIds: false, //if true, hasSessionIds are created for each user
	hasLocation: true,
	hasAndroidDevices: false,
	alsoInferFunnels: false,
	batchSize: 2_000_000,
	hasAvatar: true,
	hasAdSpend: false,
	hasBrowser: false,
	hasCampaigns: false,
	hasDesktopDevices: false,
	hasIOSDevices: false,
	writeToDisk: false,
	funnels: [
		{
			"sequence": ["foo", "bar", "baz", "qux", "garply", "durtle", "linny", "fonk", "crumn", "yak"],
			weight: 1,
			order: "sequential"
		},
		{
			"sequence": ["foo", "bar"],
			weight: 25,
			order: "sequential"
		},
		{
			"sequence": ["foo", "bar", "baz"],
			weight: 20,
			order: "sequential"
		},
		{
			"sequence": ["foo", "bar", "baz", "qux"],
			weight: 15,
			order: "sequential"
		},
		{
			"sequence": ["foo", "bar", "baz", "qux", "garply"],
			weight: 10,
			order: "sequential"
		},
		{
			"sequence": ["foo", "bar", "baz", "qux", "garply", "durtle"],
			weight: 8,
			order: "sequential"
		},
		{
			"sequence": ["foo", "bar", "baz", "qux", "garply", "durtle", "linny"],
			weight: 6,
			order: "sequential"
		},
		{
			"sequence": ["foo", "bar", "baz", "qux", "garply", "durtle", "linny", "fonk"],
			weight: 4,
			order: "sequential"
		},
		{
			"sequence": ["foo", "bar", "baz", "qux", "garply", "durtle", "linny", "fonk", "crumn"],
			weight: 2,
			order: "sequential"
		},
		{
			"sequence": ["foo", "bar", "baz", "qux", "garply", "durtle", "linny", "fonk", "crumn", "yak"],
			weight: 1,
			order: "sequential"
		}

	],
	events: [
		{ event: "foo" },
		{ event: "bar" },
		{ event: "baz" },
		{ event: "qux" },
		{ event: "garply" },
		{ event: "durtle" },
		{ event: "linny" },
		{ event: "fonk" },
		{ event: "crumn" },
		{ event: "yak" }
	],
	//? https://docs.mixpanel.com/docs/data-structure/property-reference/data-type
	superProps: {		
		"string": pickAWinner(["red", "orange", "yellow", "green", "blue", "indigo", "violet"]),
		"number": integer,
		"boolean": [true, true, false],
		"date": () => date(90),
		"string []": buildStringArray,
		"number []": buildNumberArray,
		"object {}": buildObjectProp,
		"object [{}]": buildObjArrayProp
	},
	userProps: {
		title: chance.profession.bind(chance),
		luckyNumber: weighNumRange(42, 420),
		spiritAnimal: pickAWinner(["duck", "dog", "otter", "penguin", "cat", "elephant", "lion", "cheetah", "giraffe", "zebra", "rhino", "hippo", "whale", "dolphin", "shark", "octopus", "squid", "jellyfish", "starfish", "seahorse", "crab", "lobster", "shrimp", "clam", "snail", "slug", "butterfly", "moth", "bee", "wasp", "ant", "beetle", "ladybug", "caterpillar", "centipede", "millipede", "scorpion", "spider", "tarantula", "tick", "mite", "mosquito", "fly", "dragonfly", "damselfly", "grasshopper", "cricket", "locust", "mantis", "cockroach", "termite", "praying mantis", "walking stick", "stick bug", "leaf insect", "lacewing", "aphid", "cicada", "thrips", "psyllid", "scale insect", "whitefly", "mealybug", "planthopper", "leafhopper", "treehopper", "flea", "louse", "bedbug", "flea beetle", "weevil", "longhorn beetle", "leaf beetle", "tiger beetle", "ground beetle", "lady beetle", "firefly", "click beetle", "rove beetle", "scarab beetle", "dung beetle", "stag beetle", "rhinoceros beetle", "hercules beetle", "goliath beetle", "jewel beetle", "tortoise beetle"]),
		isHappyCustomer: pickAWinner([true, true, false]),
	},
	hook: function (record, type, meta) {


		// if (type === "event") {
		// 	debugger;
		// }

		// if (type === "user") {

		// }

		// if (type === "funnel-post") {

		// }

		// if (type === "funnel-pre") {

		// }

		// if (type === "scd") {

		// }

		// if (type === "everything") {
		// 	debugger;
		// }

		return record;
	}
};


function buildObjectProp() {
	return function () {
		return {
			"foo key": choose(pickAWinner(["red", "orange", "yellow", "green", "blue", "indigo", "violet"])()),
			"bar key": integer(1, 100),
			"baz key": choose(pickAWinner([true, true, false])()),
		};
	};
}


function buildNumberArray() {
	return function () {
		const arr = [];
		const times = integer(1, 10);
		for (let i = 0; i < times; i++) {
			arr.push(integer(1, 100));
		}
		return [arr];
	};
}

function buildStringArray() {
	return function () {
		const arr = [];
		const times = integer(1, 10);
		for (let i = 0; i < times; i++) {
			arr.push(makeName(integer(1, 3), " "));
		}
		return [arr];
	};
}


function buildObjArrayProp(maxItems = 5) {

	return function () {
		const categories = ["Device Accessories", "eBooks", "Automotive", "Baby Products", "Beauty", "Books", "Camera & Photo", "Cell Phones & Accessories", "Collectible Coins", "Consumer Electronics", "Entertainment Collectibles", "Fine Art", "Grocery & Gourmet Food", "Health & Personal Care", "Home & Garden", "Independent Design", "Industrial & Scientific", "Accessories", "Major Appliances", "Music", "Musical Instruments", "Office Products", "Outdoors", "Personal Computers", "Pet Supplies", "Software", "Sports", "Sports Collectibles", "Tools & Home Improvement", "Toys & Games", "Video, DVD & Blu-ray", "Video Games", "Watches"];
		const slugs = ['/sale/', '/featured/', '/home/', '/search/', '/wishlist/', '/'];
		const assetExtension = ['.png', '.jpg', '.jpeg', '.heic', '.mp4', '.mov', '.avi'];
		const data = [];
		const numOfItems = integer(1, maxItems);

		for (var i = 0; i < numOfItems; i++) {
			const category = chance.pickone(categories);
			const slug = chance.pickone(slugs);
			const asset = chance.pickone(assetExtension);
			const price = integer(1, 300);
			const quantity = integer(1, 5);

			const item = {
				sku: integer(11111, 99999),
				amount: price,
				quantity: quantity,
				total: price * quantity,
				featured: chance.pickone([true, false]),
				category: category,
				urlSlug: slug + category,
				asset: `${category}-${integer(1, 20)}${asset}`
			};

			data.push(item);
		}

		return () => [data];
	};
};


module.exports = config;