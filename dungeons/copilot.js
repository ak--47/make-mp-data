/**
 * This is the default configuration file for the data generator in SIMPLE mode
 * notice how the config object is structured, and see it's type definition in ./types.d.ts
 * feel free to modify this file to customize the data you generate
 * see helper functions in utils.js for more ways to generate data
 */




import Chance from 'chance';
let chance = new Chance();
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);
import { uid, comma } from 'ak-tools';
import { pickAWinner, weighNumRange, date, integer, weighChoices, decimal } from "../lib/utils/utils.js";

const itemCategories = ["Books", "Movies", "Music", "Games", "Electronics", "Computers", "Smart Home", "Home", "Garden", "Pet", "Beauty", "Health", "Toys", "Kids", "Baby", "Handmade", "Sports", "Outdoors", "Automotive", "Industrial", "Entertainment", "Art", "Food", "Appliances", "Office", "Wedding", "Software"];
const videoCategories = ["funny", "educational", "inspirational", "music", "news", "sports", "cooking", "DIY", "travel", "gaming"];
const spiritAnimals = ["duck", "dog", "otter", "penguin", "cat", "elephant", "lion", "cheetah", "giraffe", "zebra", "rhino", "hippo", "whale", "dolphin", "shark", "octopus", "squid", "jellyfish", "starfish", "seahorse", "crab", "lobster", "shrimp", "clam", "snail", "slug", "butterfly", "moth", "bee", "wasp", "ant", "beetle", "ladybug", "caterpillar", "centipede", "millipede", "scorpion", "spider", "tarantula", "tick", "mite", "mosquito", "fly", "dragonfly", "damselfly", "grasshopper", "cricket", "locust", "mantis", "cockroach", "termite", "praying mantis", "walking stick", "stick bug", "leaf insect", "lacewing", "aphid", "cicada", "thrips", "psyllid", "scale insect", "whitefly", "mealybug", "planthopper", "leafhopper", "treehopper", "flea", "louse", "bedbug", "flea beetle", "weevil", "longhorn beetle", "leaf beetle", "tiger beetle", "ground beetle", "lady beetle", "firefly", "click beetle", "rove beetle", "scarab beetle", "dung beetle", "stag beetle", "rhinoceros beetle", "hercules beetle", "goliath beetle", "jewel beetle", "tortoise beetle"];


function makeProducts(maxItems = 5) {
	return function () {
		const categories = ["electronics", "books", "clothing", "home", "garden", "toys", "sports", "automotive", "beauty", "health", "grocery", "jewelry", "shoes", "tools", "office supplies"];
		const descriptors = ["brand new", "open box", "refurbished", "used", "like new", "vintage", "antique", "collectible"];
		const suffix = ["item", "product", "good", "merchandise", "thing", "object", "widget", "gadget", "device", "apparatus", "contraption", "instrument", "tool", "implement", "utensil", "appliance", "machine", "equipment", "gear", "kit", "set", "package"];
		const assetPreview = ['.png', '.jpg', '.jpeg', '.heic', '.mp4', '.mov', '.avi'];
		const data = [];
		const numOfItems = integer(1, maxItems);

		for (var i = 0; i < numOfItems; i++) {
			const category = chance.pickone(categories);
			const descriptor = chance.pickone(descriptors);
			const suffixWord = chance.pickone(suffix);
			const slug = `${descriptor.replace(/\s+/g, '-').toLowerCase()}-${suffixWord.replace(/\s+/g, '-').toLowerCase()}`;
			const asset = chance.pickone(assetPreview);

			// const product_id = chance.guid();
			const price = integer(1, 100);
			const quantity = integer(1, 5);

			const item = {
				// product_id: product_id,
				// sku: integer(11111, 99999),
				amount: price,
				quantity: quantity,
				total_value: price * quantity,
				featured: chance.pickone([true, false, false]),
				category: category,
				descriptor: descriptor,
				slug: slug,
				assetPreview: `https://example.com/assets/${slug}${asset}`,
				assetType: asset

			};

			data.push(item);
		}

		return () => [data];
	};
};


/** @type {import('../types').Dungeon} */
const config = {
	token: "",
	seed: "simple is best",
	numDays: 108, //how many days worth1 of data
	numEvents: 2_000_000, //how many events
	numUsers: 50_000, //how many users
	format: 'json', //csv or json
	region: "US",
	hasAnonIds: false, //if true, anonymousIds are created for each user
	hasSessionIds: false, //if true, hasSessionIds are created for each user
	hasAdSpend: false,
	hasLocation: true,
	hasAndroidDevices: true,
	hasIOSDevices: true,
	hasDesktopDevices: true,
	hasBrowser: true,
	hasCampaigns: false,
	isAnonymous: false,
	alsoInferFunnels: false,
	concurrency: 1,
	batchSize: 2_500_000,
	percentUsersBornInDataset: 25,
	events: [
		{
			event: "checkout",
			weight: 2,
			properties: {
				currency: ["USD", "CAD", "EUR", "BTC", "ETH", "JPY"],
				coupon: weighChoices(["none", "none", "none", "none", "10%OFF", "20%OFF", "10%OFF", "20%OFF", "30%OFF", "40%OFF", "50%OFF"]),
				cart: makeProducts()
			}
		},
		{
			event: "add to cart",
			weight: 4,
			properties: {
				item: makeProducts(1),
			}
		},
		{
			event: "view item",
			weight: 8,
			properties: {
				item: makeProducts(1)
			}
		},
		{
			event: "save item",
			weight: 5,
			properties: {
				item: makeProducts(1),
			}
		},
		{
			event: "page view",
			weight: 10,
			properties: {
				page: ["/", "/help", "/account", "/watch", "/listen", "/product", "/people", "/peace"],
			}
		},
		{
			event: "watch video",
			weight: 8,
			properties: {
				watchTimeSec: weighNumRange(10, 600, .25),
			}
		},
		{
			event: "like video",
			weight: 6,
			properties: {

			}
		},
		{
			event: "dislike video",
			weight: 4,
			properties: {

			}
		},
		{
			event: "sign up",
			weight: 1,
			isFirstEvent: true,
			properties: {
				signupMethod: ["email", "google", "facebook", "twitter", "linkedin", "github"],
				referral: weighChoices(["none", "none", "none", "friend", "ad", "ad", "ad", "friend", "friend", "friend", "friend"]),
			}
		},

	],
	funnels: [
		{
			sequence: ["page view", "view item", "save item", "page view", "sign up"],
			conversionRate: 50,
			order: "first-and-last-fixed",
			weight: 1,
			isFirstFunnel: true,
			timeToConvert: 2,
			experiment: false,
			name: "Signup Flow"

		},
		{
			sequence: ["watch video", "like video", "watch video", "like video"],
			name: "Video Likes",
			conversionRate: 60,
			props: {
				videoCategory: videoCategories,
				quality: ["2160p", "1440p", "1080p", "720p", "480p", "360p", "240p"],
				format: ["mp4", "avi", "mov", "mpg"],
				uploader_id: chance.guid.bind(chance)
			}
		},
		{
			name: "Video Dislikes",
			sequence: ["watch video", "dislike video", "watch video", "dislike video"],
			conversionRate: 20,
			props: {
				videoCategory: videoCategories,
				quality: ["2160p", "1440p", "1080p", "720p", "480p", "360p", "240p"],
				format: ["mp4", "avi", "mov", "mpg"],
				uploader_id: chance.guid.bind(chance)
			}
		},
		{
			name: "eCommerce Purchase",
			sequence: ["view item", "view item", "add to cart", "view item", "add to cart", "checkout"],
			conversionRate: 15,
			requireRepeats: true,
			weight: 10,
			order: "last-fixed",
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
		spiritAnimal: spiritAnimals
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

		if (type === "event") {
			const NOW = dayjs();
			const DAY_SIGNUPS_IMPROVED = NOW.subtract(7, 'day');
			const DAY_WATCH_TIME_WENT_UP = NOW.subtract(30, 'day');
			const eventTime = dayjs(record.time);

			// unflattering 'items'			
			if (record.item && Array.isArray(record.item)) {
				record = { ...record, ...record.item[0] };
				delete record.item;
			}

			if (record.event === 'sign up') {
				record.signup_flow = "v1";
				if (eventTime.isBefore(DAY_SIGNUPS_IMPROVED)) {
					// tag 50% for removal (filtered in "everything" hook)
					if (chance.bool({ likelihood: 50 })) {
						record._drop = true;
					}
				}
				if (eventTime.isAfter(DAY_SIGNUPS_IMPROVED)) {
					record.signup_flow = "v2";
				}
			}

			if (record.event === 'watch video') {
				const factor = decimal(0.25, 0.79);
				if (eventTime.isBefore(DAY_WATCH_TIME_WENT_UP)) {
					record.watchTimeSec = Math.round(record.watchTimeSec * (1 - factor));
				}
				if (eventTime.isAfter(DAY_WATCH_TIME_WENT_UP)) {
					// increase watch time by 33%
					record.watchTimeSec = Math.round(record.watchTimeSec * (1 + factor));
				}

			}

			// toys + shoes frequently purchases together (and are higher cart values)
			if (record.event === 'checkout' && Array.isArray(record.cart)) {
				const hasToys = record.cart.some(item => item.category === 'toys');
				const hasShoes = record.cart.some(item => item.category === 'shoes');
				if (hasToys && !hasShoes) {
					const bigCart = makeProducts(20)()()[0];
					const shoeItems = bigCart.filter(item => item.category === 'shoes');
					if (shoeItems.length > 0) {
						record.cart.push(shoeItems[0]);
					}
				}

				if (hasShoes && !hasToys) {
					const bigCart = makeProducts(20)()()[0];
					const toyItems = bigCart.filter(item => item.category === 'toys');
					if (toyItems.length > 0) {
						record.cart.push(toyItems[0]);
					}
				}

				if (!hasToys && !hasShoes) {
					const cheapFactor = decimal(.75, 0.9);
					// make every item a bit cheaper
					record.cart = record.cart.map(item => {
						return {
							...item,
							amount: Math.round(item.amount * cheapFactor),
							total_value: Math.round(item.total_value * cheapFactor)
						};
					});
				}
			}
			// high quality video means longer watch times (lower quality shorter watch times)
			if (record.event === 'watch video') {
				const qualityFactors = {
					"2160p": 1.5,
					"1440p": 1.4,
					"1080p": 1.3,
					"720p": 1.15,
					"480p": 1.0,
					"360p": 0.85,
					"240p": 0.7
				};
				const quality = record.quality || "480p";
				const factor = qualityFactors[quality] || 1.0;
				record.watchTimeSec = Math.round(record.watchTimeSec * factor);
			}



		}



		if (type === "everything") {
			// big themes!

			// users who view items in the home and garden category churn more frequently
			


			// dark mode leads to faster purchase conversion


			// people who pay in bitcoin tend to buy more electronics and gadgets


			//custom themes purchase more:
			// const numCustomMode = record.filter(a => a.theme === 'custom').length;
			// const numLightMode = record.filter(a => a.theme === 'light').length;
			// const numDarkMode = record.filter(a => a.theme === 'dark').length;
			// if (numCustomMode > numLightMode || numCustomMode > numDarkMode) {
			// 	//triple their checkout events
			// 	const checkoutEvents = record.filter(a => a.event === 'checkout');
			// 	const newCheckouts = checkoutEvents.map(a => {
			// 		const randomInt = integer(-48, 48);
			// 		const newCheckout = {
			// 			...a,
			// 			time: dayjs(a.time).add(randomInt, 'hour').toISOString(),
			// 			event: "checkout",
			// 			amount: a.amount * 2,
			// 			coupon: "50%OFF"
			// 		};
			// 		return newCheckout;
			// 	});
			// 	record.push(...newCheckouts);
			// }

			// //users who watch low quality videos churn more:
			// const loQuality = ["480p", "360p", "240p"];
			// const lowQualityWatches = record.filter(a => a.event === 'watch video' && loQuality.includes(a.quality));
			// const highQualityWatches = record.filter(a => a.event === 'watch video' && !loQuality.includes(a.quality));
			// if (lowQualityWatches.length > highQualityWatches.length) {
			// 	if (flip()) {
			// 		// find midpoint of records
			// 		const midpoint = Math.floor(record.length / 2);
			// 		record = record.slice(0, midpoint);

			// 	}
			// }




		}

		// Filter out events tagged for removal in the event hook
		if (type === "everything") {
			record = record.filter(e => !e._drop);
		}

		return record;
	}
};

function flip(likelihood = 50) {
	return chance.bool({ likelihood });
}


export default config;