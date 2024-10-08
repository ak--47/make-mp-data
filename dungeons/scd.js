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
const { pickAWinner, weighNumRange, date, integer, weighChoices } = require('../components/utils');

const itemCategories = ["Books", "Movies", "Music", "Games", "Electronics", "Computers", "Smart Home", "Home", "Garden", "Pet", "Beauty", "Health", "Toys", "Kids", "Baby", "Handmade", "Sports", "Outdoors", "Automotive", "Industrial", "Entertainment", "Art", "Food", "Appliances", "Office", "Wedding", "Software"];

const videoCategories = ["funny", "educational", "inspirational", "music", "news", "sports", "cooking", "DIY", "travel", "gaming"];

/** @type {import('../types').Dungeon} */
const config = {
	token: "",
	seed: "simple is best",
	numDays: 30, //how many days worth1 of data
	numEvents: 50000, //how many events
	numUsers: 500, //how many users	
	format: 'csv', //csv or json
	region: "US",
	hasAnonIds: false, //if true, anonymousIds are created for each user
	hasSessionIds: false, //if true, hasSessionIds are created for each user
	hasAdSpend: false,
	makeChart: true,
	hasLocation: true,
	hasAndroidDevices: true,
	hasIOSDevices: true,
	hasDesktopDevices: true,
	hasBrowser: true,
	hasCampaigns: true,
	isAnonymous: false,


	events: [
		{
			event: "checkout",
			weight: 2,
			properties: {
				amount: weighNumRange(5, 500, .25),
				currency: pickAWinner(["USD", "CAD", "EUR", "BTC", "ETH", "JPY"], 0),
				coupon: weighChoices(["none", "none", "none", "none", "10%OFF", "20%OFF", "10%OFF", "20%OFF", "30%OFF", "40%OFF", "50%OFF"]),
				numItems: weighNumRange(1, 10),

			}
		},
		{
			event: "add to cart",
			weight: 4,
			properties: {
				amount: weighNumRange(5, 500, .25),
				rating: weighNumRange(1, 5),
				reviews: weighNumRange(0, 35),
				isFeaturedItem: [true, false, false],
				itemCategory: pickAWinner(itemCategories, integer(0, 27)),
				dateItemListed: date(30, true, 'YYYY-MM-DD'),
			}
		},
		{
			event: "page view",
			weight: 10,
			properties: {
				page: pickAWinner(["/", "/", "/help", "/account", "/watch", "/listen", "/product", "/people", "/peace"]),
				utm_source: pickAWinner(["$organic", "$organic", "$organic", "$organic", "google", "google", "google", "facebook", "facebook", "twitter", "linkedin"]),
			}
		},
		{
			event: "watch video",
			weight: 8,
			properties: {
				videoCategory: pickAWinner(videoCategories, integer(0, 9)),
				isFeaturedItem: [true, false, false],
				watchTimeSec: weighNumRange(10, 600, .25),
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
				itemCategory: pickAWinner(itemCategories, integer(0, 27)),
				dateItemListed: date(30, true, 'YYYY-MM-DD'),
			}
		},
		{
			event: "save item",
			weight: 5,
			properties: {
				isFeaturedItem: [true, false, false],
				itemCategory: pickAWinner(itemCategories, integer(0, 27)),
				dateItemListed: date(30, true, 'YYYY-MM-DD'),
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
		currentTheme: weighChoices(["light", "dark", "custom", "light", "dark"]),
	},
	/*
	user properties work the same as event properties
	each key should be an array or function reference
	*/
	userProps: {
		title: chance.profession.bind(chance),
		luckyNumber: weighNumRange(42, 420, .3),
		spiritAnimal: pickAWinner(["duck", "dog", "otter", "penguin", "cat", "elephant", "lion", "cheetah", "giraffe", "zebra", "rhino", "hippo", "whale", "dolphin", "shark", "octopus", "squid", "jellyfish", "starfish", "seahorse", "crab", "lobster", "shrimp", "clam", "snail", "slug", "butterfly", "moth", "bee", "wasp", "ant", "beetle", "ladybug", "caterpillar", "centipede", "millipede", "scorpion", "spider", "tarantula", "tick", "mite", "mosquito", "fly", "dragonfly", "damselfly", "grasshopper", "cricket", "locust", "mantis", "cockroach", "termite", "praying mantis", "walking stick", "stick bug", "leaf insect", "lacewing", "aphid", "cicada", "thrips", "psyllid", "scale insect", "whitefly", "mealybug", "planthopper", "leafhopper", "treehopper", "flea", "louse", "bedbug", "flea beetle", "weevil", "longhorn beetle", "leaf beetle", "tiger beetle", "ground beetle", "lady beetle", "firefly", "click beetle", "rove beetle", "scarab beetle", "dung beetle", "stag beetle", "rhinoceros beetle", "hercules beetle", "goliath beetle", "jewel beetle", "tortoise beetle"])
	},
	scdProps: {
		role: {
			type: "user",
			frequency: "week",
			values: ["admin", "collaborator", "user", "view only", "no access"],
			timing: 'fuzzy',
			max: 10
		},
		NPS: {
			type: "user",
			frequency: "day",
			values: weighNumRange(1, 10, 2, 150),
			timing: 'fuzzy',
			max: 10
		},
		MRR: {
			type: "company_id",
			frequency: "month",
			values: weighNumRange(0, 10000, .15),
			timing: 'fixed',
			max: 10
		},
		AccountHealthScore: {
			type: "company_id",
			frequency: "week",
			values: weighNumRange(1, 10, .15),
			timing: 'fixed',
			max: 40
		},
		plan: {
			type: "company_id",
			frequency: "month",
			values: ["free", "basic", "premium", "enterprise"],
			timing: 'fixed',
			max: 10
		}
	},
	groupKeys: [["company_id", 1_000]],
	groupProps: {
		company_id: {
			name: () => { return chance.name(); },
			email: () => { return `CSM: ${chance.pickone(["AK", "Neha", "Rajiv", "Deepak", "Justin", "Hans", "Katie", "Somya", "Tony", "Kaan"])}`; },
			industry: pickAWinner([
				"technology",
				"education",
				"finance",
				"healthcare",
				"retail",
				"manufacturing",
				"transportation",
				"entertainment",
				"media",
				"real estate",
				"construction",
				"hospitality",
				"energy",
				"utilities",
				"agriculture",
				"other",
			]),
			segment: ["SMB", "SMB", "SMB", "Mid Market", "Mid Market", "Enterprise"],
			"# active users": chance.integer({ min: 2, max: 20 })
		}
	},
	hook: function (record, type, meta) {
		return record;
	}
};



module.exports = config;