/**
 * Benchmark Dungeon Configuration
 * Generates one million events across 10,000 users
 * ensure we have multiple property types and distributions
 */




import Chance from 'chance';
let chance = new Chance();
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);
import { uid, comma } from 'ak-tools';
import { pickAWinner, weighNumRange, date, integer, weighChoices } from "../lib/utils/utils.js";
import { createTextGenerator } from '../lib/generators/text.js';

// list of strings use case
function buildListOfFeatures() {
	const fullFeatureList = ["beta flags", "alpha flags", "custom themes", "API access", "webhooks", "data export", "data import", "external integrations", "private cloud", "multi factor auth", "audit logs", "custom domain", "personalized landing"];
	const numFeatures = integer(3, 7);
	const selectedFeatures = chance.pickset(fullFeatureList, numFeatures);
	return [selectedFeatures];
}

// object use case
function buildLocalConfig() {
	const allPossibleConfigs = {
		"theme": pickAWinner(["light", "dark", "custom"]),
		"notifications": pickAWinner(["all", "mentions", "none"]),
		"itemsPerPage": pickAWinner([10, 25, 50, 100]),
		"language": pickAWinner(["en", "es", "fr", "de", "zh", "jp", "ru"]),
		"timezone": pickAWinner(["UTC", "PST", "EST", "CST", "MST", "GMT", "CET", "IST", "JST", "AEST"]),
		"privacyLevel": pickAWinner(["public", "friends only", "private"]),
		"dataSharing": [true, false],
		"autoSave": [true, false],
		"fontSize": ["small", "medium", "large"],
		"layout": ["grid", "list", "compact"]
	};
	const config = {};

	for (const [key, values] of Object.entries(allPossibleConfigs)) {
		let value;
		if (typeof values === 'function') {
			value = values();
		} else if (Array.isArray(values)) {
			value = values;
		} else {
			value = values;
		}
		config[key] = chance.pickone(value);
	}
	return config;
}


// array of object use case
function buildCart() {
	const allPossibleItems = [
		{ itemId: uid(), name: "widget foo", price: 9.99, category: "Gadgets", isPremium: false, stock: 150 },
		{ itemId: uid(), name: "poker bar", price: 14.99, category: "Gizmos", isPremium: true, stock: 100 },
		{ itemId: uid(), name: "limited baz", price: 4.99, category: "Toys", isPremium: false, stock: 200 },
		{ itemId: uid(), name: "foolish qux", price: 19.99, category: "Tools", isPremium: false, stock: 50 },
		{ itemId: uid(), name: "topical mux", price: 29.99, category: "Components", isPremium: true, stock: 75 },
		{ itemId: uid(), name: "random garply", price: 24.99, category: "Gadgets", isPremium: false, stock: 30 },
		{ itemId: uid(), name: "helpful waldo", price: 39.99, category: "Gizmos", isPremium: true, stock: 20 },
		{ itemId: uid(), name: "hillarious defcon", price: 11.99, category: "Toys", isPremium: false, stock: 120 },
		{ itemId: uid(), name: "final radiator", price: 7.99, category: "Tools", isPremium: false, stock: 80 },
		{ itemId: uid(), name: "leaning wholesome", price: 49.99, category: "Components", isPremium: true, stock: 10 },
		{ itemId: uid(), name: "whose friends", price: 17.99, category: "Gadgets", isPremium: false, stock: 60 },
	];
	const numItems = integer(1, 20);
	const selectedItems = chance.pickset(allPossibleItems, numItems);
	// add quantity to each item
	for (const item of selectedItems) {
		item.quantity = integer(1, 8);
		item.totalPrice = item.price * item.quantity;
	}
	return [...selectedItems];

}



const commentGenerator = createTextGenerator({
	authenticityLevel: 0.8,
	enableDeduplication: true,
	includeMetadata: false,
	style: "comments",
	formality: "casual",
	mixedSentiment: true,
	keywords: {
		"brands": ["Nike", "Adidas", "Puma", "Reebok", "Under Armour", "New Balance", "Asics", "Skechers", "Converse", "Vans"],
		"categories": ["shoes", "sneakers", "running shoes", "basketball shoes", "casual shoes", "formal shoes", "boots", "sandals", "heels", "flats"],
		"credibility": ["verified purchase", "top reviewer", "frequent buyer", "long-time customer", "new customer"],
		"features": ["comfort", "durability", "style", "fit", "value for money", "design", "color options", "material quality", "breathability", "support"],
		"issues": ["size runs small", "poor arch support", "slippery sole", "uncomfortable", "not true to color", "weak laces", "easily scuffed", "bad odor", "heavy weight", "limited stock"],
	},
	typos: false,
	min: 20,
	max: 255,

});



/** @type {import('../types.js').Dungeon} */
const config = {
	// token: process.env.MASTER_PROJECT_TOKEN || "",
	name: "300k-Events-Heavy",
	format: 'json', //csv or json
	seed: "one million events",
	numDays: 92, //how many days worth of data
	numEvents: 300_000, //how many events
	numUsers: 10_000, //how many users
	strictEventCount: true,

	region: "US",
	hasAnonIds: true, //if true, anonymousIds are created for each user
	hasSessionIds: true, //if true, hasSessionIds are created for each user
	hasAdSpend: false,
	makeChart: false,
	hasLocation: true,
	hasAndroidDevices: true,
	hasIOSDevices: true,
	hasDesktopDevices: true,
	hasBrowser: true,
	hasCampaigns: true,
	isAnonymous: false,
	alsoInferFunnels: true,
	// concurrency automatically set to 1 when strictEventCount is enabled
	writeToDisk: true,
	batchSize: 2_500_000,

	events: [
		{
			event: "Page View",
			weight: 50,

		},
		{
			event: "Product View",
			weight: 30,
		},
		{
			event: "Add to Cart",
			weight: 10,
		},
		{
			event: "Checkout Started",
			weight: 5,
		},
		{
			event: "Purchase",
			weight: 1,
		},
		{
			event: "Product Review",
			weight: 3,
		},
		{
			event: "Search",
			weight: 17,
		},
		{
			event: "Browse",
			weight: 25,

		},
		{
			event: "Save for Later",
			weight: 4,
		},
		{
			event: "Remove from Cart",
			weight: 2,
		},
		{
			event: "Empty Cart",
			weight: 4,
		}
	],
	funnels: [
		{
			"name": "Purchase Funnel",
			"sequence": [
				"Page View",
				"Product View",
				"Add to Cart",
				"Checkout Started",
				"Purchase"
			],
			requireRepeats: true,
			"conversionRate": 30,
			"order": "fixed",
			"weight": 1,
			"isFirstFunnel": false,
			"timeToConvert": 5,
			"experiment": true,
		}
	],
	superProps: {
		"theme (string)": pickAWinner(["light", "dark", "custom", "light", "dark"]),
		"latency (number)": weighNumRange(20, 600, 0.7),
		"beta user (boolean)": [true, false, false, false],
		"birthdate (date)": date(30000, true, 'YYYY-MM-DD'),
		"features (list)": buildListOfFeatures,
		"config (object)": buildLocalConfig,
		"cart (array of objects)": buildCart,
		"comment (text)": commentGenerator,
	},
	/*
	user properties work the same as event properties
	each key should be an array or function reference
	*/
	userProps: {
		

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
		// if (type === "everything") {
		// 	debugger;
		// }
		return record;
	}
};



export default config;