/**
 * This is the default configuration file for the data generator in SIMPLE mode
 * notice how the config object is structured, and see it's type definition in ./types.d.ts
 * feel free to modify this file to customize the data you generate
 * see helper functions in utils.js for more ways to generate data
 */




const Chance = require('chance');
const chance = new Chance();
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const { uid, comma } = require('ak-tools');
const { weighList, weightedRange, date, integer } = require('../utils');

const itemCategories = ["Books", "Movies", "Music", "Games", "Electronics", "Computers", "Smart Home", "Home", "Garden", "Pet", "Beauty", "Health", "Toys", "Kids", "Baby", "Handmade", "Sports", "Outdoors", "Automotive", "Industrial", "Entertainment", "Art", "Food", "Appliances", "Office", "Wedding", "Software"];

const videoCategories = ["funny", "educational", "inspirational", "music", "news", "sports", "cooking", "DIY", "travel", "gaming"];

/** @type {import('../types').Config} */
const config = {
	token: "",
	seed: "simple is best",
	numDays: 30, //how many days worth of data
	numEvents: 50000, //how many events
	numUsers: 500, //how many users	
	format: 'csv', //csv or json
	region: "US",
	anonIds: false, //if true, anonymousIds are created for each user
	sessionIds: false, //if true, sessionIds are created for each user

	events: [
		{
			event: "checkout",
			weight: 2,
			properties: {
				amount: weightedRange(5, 500, 1000, .25),
				currency: ["USD", "CAD", "EUR", "BTC", "ETH", "JPY"],
				coupon: ["none", "none", "none", "none", "10%OFF", "20%OFF", "10%OFF", "20%OFF", "30%OFF", "40%OFF", "50%OFF"],
				numItems: weightedRange(1, 10),

			}
		},
		{
			event: "add to cart",
			weight: 4,
			properties: {
				amount: weightedRange(5, 500, 1000, .25),
				rating: weightedRange(1, 5),
				reviews: weightedRange(0, 35),
				isFeaturedItem: [true, false, false],
				itemCategory: weighList(itemCategories, integer(0, 27)),
				dateItemListed: date(30, true, 'YYYY-MM-DD'),
				itemId: integer(1000, 9999),
			}
		},
		{
			event: "page view",
			weight: 10,
			properties: {
				page: ["/", "/", "/help", "/account", "/watch", "/listen", "/product", "/people", "/peace"],
				utm_source: ["$organic", "$organic", "$organic", "$organic", "google", "google", "google", "facebook", "facebook", "twitter", "linkedin"],
			}
		},
		{
			event: "watch video",
			weight: 8,
			properties: {
				videoCategory: weighList(videoCategories, integer(0, 9)),
				isFeaturedItem: [true, false, false],
				watchTimeSec: weightedRange(10, 600, 1000, .25),
				quality: ["2160p", "1440p", "1080p", "720p", "480p", "360p", "240p"],
				format: ["mp4", "avi", "mov", "mpg"],
				uploader_id: chance.guid.bind(chance)

			}
		},
		{
			event: "view item",
			weight: 8,
			properties: {
				isFeaturedItem: [true, false, false],
				itemCategory: weighList(itemCategories, integer(0, 27)),
				dateItemListed: date(30, true, 'YYYY-MM-DD'),
				itemId: integer(1000, 9999),
			}
		},
		{
			event: "save item",
			weight: 5,
			properties: {
				isFeaturedItem: [true, false, false],
				itemCategory: weighList(itemCategories, integer(0, 27)),
				dateItemListed: date(30, true, 'YYYY-MM-DD'),
				itemId: integer(1000, 9999),
			}
		},
		{
			event: "sign up",
			isFirstEvent: true,
			weight: 0,
			properties: {
				variants: ["A", "B", "C", "Control"],
				flows: ["new", "existing", "loyal", "churned"],
				flags: ["on", "off"],
				experiment_ids: ["1234", "5678", "9012", "3456", "7890"],
				multiVariate: [true, false]
			}
		}
	],
	superProps: {
		platform: ["web", "mobile", "web", "mobile", "web", "web", "kiosk", "smartTV"],
		currentTheme: ["light", "dark", "custom", "light", "dark"],
		// emotions: generateEmoji(),

	},
	/*
	user properties work the same as event properties
	each key should be an array or function reference
	*/
	userProps: {
		title: chance.profession.bind(chance),
		luckyNumber: weightedRange(42, 420),
		spiritAnimal: ["duck", "dog", "otter", "penguin", "cat", "elephant", "lion", "cheetah", "giraffe", "zebra", "rhino", "hippo", "whale", "dolphin", "shark", "octopus", "squid", "jellyfish", "starfish", "seahorse", "crab", "lobster", "shrimp", "clam", "snail", "slug", "butterfly", "moth", "bee", "wasp", "ant", "beetle", "ladybug", "caterpillar", "centipede", "millipede", "scorpion", "spider", "tarantula", "tick", "mite", "mosquito", "fly", "dragonfly", "damselfly", "grasshopper", "cricket", "locust", "mantis", "cockroach", "termite", "praying mantis", "walking stick", "stick bug", "leaf insect", "lacewing", "aphid", "cicada", "thrips", "psyllid", "scale insect", "whitefly", "mealybug", "planthopper", "leafhopper", "treehopper", "flea", "louse", "bedbug", "flea beetle", "weevil", "longhorn beetle", "leaf beetle", "tiger beetle", "ground beetle", "lady beetle", "firefly", "click beetle", "rove beetle", "scarab beetle", "dung beetle", "stag beetle", "rhinoceros beetle", "hercules beetle", "goliath beetle", "jewel beetle", "tortoise beetle"]
	},

	scdProps: {},
	mirrorProps: {
		isBot: { events: "*", values: [false, false, false, false, true] },
		profit: { events: ["checkout"], values: [4, 2, 42, 420] },
		watchTimeSec: {
			events: ["watch video"],
			values: weightedRange(50, 1200, 247, 6)
		}

	},

	/*
	for group analytics keys, we need an array of arrays [[],[],[]] 
	each pair represents a group_key and the number of profiles for that key
	*/
	groupKeys: [],
	groupProps: {},
	lookupTables: [],
	hook: function (record, type, meta) {
		return record;
	}
};



module.exports = config;