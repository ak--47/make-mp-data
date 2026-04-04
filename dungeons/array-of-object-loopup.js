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
import { pickAWinner, weighNumRange, date, integer, weighChoices } from "../lib/utils/utils.js";

const videoCategories = ["funny", "educational", "inspirational", "music", "news", "sports", "cooking", "DIY", "travel", "gaming"];
const spiritAnimals = ["duck", "dog", "otter", "penguin", "cat", "elephant", "lion", "cheetah", "giraffe", "zebra", "rhino", "hippo", "whale", "dolphin", "shark", "octopus", "squid", "jellyfish", "starfish", "seahorse", "crab", "lobster", "shrimp", "clam", "snail", "slug", "butterfly", "moth", "bee", "wasp", "ant", "beetle", "ladybug", "caterpillar", "centipede", "millipede", "scorpion", "spider", "tarantula", "tick", "mite", "mosquito", "fly", "dragonfly", "damselfly", "grasshopper", "cricket", "locust", "mantis", "cockroach", "termite", "praying mantis", "walking stick", "stick bug", "leaf insect", "lacewing", "aphid", "cicada", "thrips", "psyllid", "scale insect", "whitefly", "mealybug", "planthopper", "leafhopper", "treehopper", "flea", "louse", "bedbug", "flea beetle", "weevil", "longhorn beetle", "leaf beetle", "tiger beetle", "ground beetle", "lady beetle", "firefly", "click beetle", "rove beetle", "scarab beetle", "dung beetle", "stag beetle", "rhinoceros beetle", "hercules beetle", "goliath beetle", "jewel beetle", "tortoise beetle"];

/** @type {import('../types.js').Dungeon} */
const config = {
	// token: "0a3e6aa01225ed03856dca545c2b5b3d",
	seed: "test array of objects lookup",
	name: "array-of-object-lookup",
	numDays: 60, //how many days worth1 of data
	numEvents: 100_000, //how many events
	numUsers: 1_000, //how many users
	format: 'json', //csv or json
	region: "US",
	hasAnonIds: true, //if true, anonymousIds are created for each user
	hasSessionIds: true, //if true, hasSessionIds are created for each user
	hasAdSpend: false,
	makeChart: false,
	hasLocation: true,
	hasAndroidDevices: false,
	hasIOSDevices: false,
	hasDesktopDevices: true,
	hasBrowser: true,
	hasCampaigns: false,
	isAnonymous: false,
	alsoInferFunnels: true,
	concurrency: 1,
	batchSize: 250_000,
	writeToDisk: true,
	events: [
		{
			event: "checkout",
			weight: 2,
			properties: {
				currency: pickAWinner(["USD", "CAD", "EUR", "BTC", "ETH", "JPY"], 0),
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
		}		
	],
	funnels: [	],
	superProps: {
		theme: pickAWinner(["light", "dark", "custom", "light", "dark"]),
	},
	/*
	user properties work the same as event properties
	each key should be an array or function reference
	*/
	userProps: {
		// title: chance.profession.bind(chance),
		// luckyNumber: weighNumRange(1, 500, .3),
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
	lookupTables: [{
		key: "product_id",
		entries: 1000,
		attributes: {
			amount: weighNumRange(1, 1000, .3),
			quantity: weighNumRange(1, 10, .3),
			featured: flip,
			category: ["electronics", "books", "clothing", "home", "garden", "toys", "sports", "automotive", "beauty", "health", "grocery", "jewelry", "shoes", "tools", "office supplies"],
			descriptor: ["brand new", "open box", "refurbished", "used", "like new", "vintage", "antique", "collectible"]
			
		}

	}],
	hook: function (record, type, meta) {

		const NOW = dayjs();

		if (type === "event") {
			// Pattern 1: Checkouts with coupons get a discount_applied flag and adjusted total
			if (record.event === "checkout" && record.coupon && record.coupon !== "none") {
				record.discount_applied = true;
				const pctMatch = record.coupon.match(/(\d+)%/);
				if (pctMatch) {
					record.discount_percent = parseInt(pctMatch[1]);
				}
			}

			// Pattern 2: "save item" events on weekends are tagged as wishlist behavior
			if (record.event === "save item") {
				const dow = dayjs(record.time).day();
				if (dow === 0 || dow === 6) {
					record.save_context = "weekend_browse";
				} else {
					record.save_context = "weekday_intent";
				}
			}
		}

		if (type === "everything") {
			// Pattern 3: Users who view 5+ items but never checkout are tagged as window shoppers
			const views = record.filter(e => e.event === "view item").length;
			const checkouts = record.filter(e => e.event === "checkout").length;
			if (views >= 5 && checkouts === 0) {
				for (const e of record) {
					e.user_segment = "window_shopper";
				}
			}
		}

		return record;
	}
};

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
			const product_id = integer(1, 1_000);

			const item = {
				product_id: product_id,
				product_url: `https://example.com/assets/${product_id}`,
				// sku: integer(11111, 99999),
				// amount: price,
				// quantity: quantity,
				// total_value: price * quantity,
				// featured: chance.pickone([true, false, false]),
				// category: category,
				// descriptor: descriptor,
				// slug: slug,
				
				// assetType: asset

			};

			data.push(item);
		}

		return () => [data];
	};
};


function flip(likelihood = 50) {
	return chance.bool({ likelihood });
}


export default config;