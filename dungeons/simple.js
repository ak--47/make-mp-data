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
import { pickAWinner, weighNumRange, date, integer, weighChoices } from '../lib/utils/utils.js';

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
	makeChart: false,
	hasLocation: true,
	hasAndroidDevices: true,
	hasIOSDevices: true,
	hasDesktopDevices: true,
	hasBrowser: true,
	hasCampaigns: true,
	isAnonymous: false,
	concurrency: 10,


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
		theme: pickAWinner(["light", "dark", "custom", "light", "dark"]),
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
	scdProps: {},
	mirrorProps: {},

	/*
	for group analytics keys, we need an array of arrays [[],[],[]] 
	each pair represents a group_key and the number of profiles for that key
	*/
	groupKeys: [],
	groupProps: {},
	lookupTables: [],
	hook: function (record, type, meta) {
		if (type === "everything") {

			//custom themers purchase more:
			const numCustomMode = record.filter(a => a.theme === 'custom').length;
			const numLightMode = record.filter(a => a.theme === 'light').length;
			const numDarkMode = record.filter(a => a.theme === 'dark').length;
			if (numCustomMode > numLightMode || numCustomMode > numDarkMode) {
				//triple their checkout events
				const checkoutEvents = record.filter(a => a.event === 'checkout');
				const newCheckouts = checkoutEvents.map(a => {
					const randomInt = integer(-48, 48);
					const newCheckout = {
						...a,
						time: dayjs(a.time).add(randomInt, 'hour').toISOString(),
						event: "checkout",
						amount: a.amount * 2,
						coupon: "50%OFF"
					};
					return newCheckout;
				});
				record.push(...newCheckouts);
			}

			//users who watch low quality videos churn more:
			const loQuality = ["480p", "360p", "240p"];
			const lowQualityWatches = record.filter(a => a.event === 'watch video' && loQuality.includes(a.quality));
			const highQualityWatches = record.filter(a => a.event === 'watch video' && !loQuality.includes(a.quality));
			if (lowQualityWatches.length > highQualityWatches.length) {
				if (flip()) {
					// find midpoint of records
					const midpoint = Math.floor(record.length / 2);
					record = record.slice(0, midpoint);

				}
			}

		}



		return record;
	}
};

function flip(likelihood = 50) {
	return chance.bool({ likelihood });
}


export default config;