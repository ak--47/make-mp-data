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

/** @type {import('../types.js').Dungeon} */
const config = {
	// token: "",
	name: "5M-Events-Light",
	format: 'json', //csv or json
	seed: "one million events",
	numDays: 92, //how many days worth of data
	numEvents: 5_000_000, //how many events
	numUsers: 10_000, //how many users
	strictEventCount: true,
	
	region: "US",
	hasAnonIds: false, //if true, anonymousIds are created for each user
	hasSessionIds: false, //if true, hasSessionIds are created for each user
	hasAdSpend: false,
	makeChart: false,
	hasLocation: false,
	hasAndroidDevices: false,
	hasIOSDevices: false,
	hasDesktopDevices: false,
	hasBrowser: false,
	hasCampaigns: false,
	isAnonymous: false,
	alsoInferFunnels: true,
	// concurrency automatically set to 1 when strictEventCount is enabled
	writeToDisk: false,
	batchSize: 12_500_000,

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
	},
	/*
	user properties work the same as event properties
	each key should be an array or function reference
	*/
	userProps: {},
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