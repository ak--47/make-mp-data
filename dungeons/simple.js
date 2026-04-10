import Chance from 'chance';
let chance = new Chance();
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);
import { uid, comma } from 'ak-tools';
import { pickAWinner, weighNumRange, date, integer, weighChoices } from "../lib/utils/utils.js";

const itemCategories = ["Books", "Movies", "Music", "Games", "Electronics", "Computers", "Smart Home", "Home", "Garden", "Pet", "Beauty", "Health", "Toys", "Kids", "Baby", "Handmade", "Sports", "Outdoors", "Automotive", "Industrial", "Entertainment", "Art", "Food", "Appliances", "Office", "Wedding", "Software"];

const videoCategories = ["funny", "educational", "inspirational", "music", "news", "sports", "cooking", "DIY", "travel", "gaming"];

/**
 * ═══════════════════════════════════════════════════════════════
 * DATASET OVERVIEW
 * ═══════════════════════════════════════════════════════════════
 *
 * Simple E-Commerce + Media App
 * - 5,000 users over 100 days, ~500K events
 * - Events: ad impressions/clicks, page views, video watching,
 *   item browsing/saving, cart, checkout, signup
 * - Signup funnel with A/B experiment
 * - Campaigns, location, browser, and device data enabled
 *
 * ═══════════════════════════════════════════════════════════════
 * ANALYTICS HOOKS (3 patterns)
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. TEMPORAL IMPROVEMENT (event hook)
 *    After 15 days ago: checkout amounts 1.5x, watch times 1.5x.
 *    Before that: 33% of events are dropped (tagged _drop, filtered in everything).
 *
 *    Mixpanel Report:
 *    - Insights > Line Chart: "checkout", AVG(amount) by Day
 *      Expected: visible 1.5x uplift in the last 15 days
 *    - Insights > Line Chart: Total event count by Day
 *      Expected: ~33% lower volume before 15 days ago, then step-up
 *
 * 2. CUSTOM THEME POWER BUYERS (everything hook)
 *    Users whose custom-theme events outnumber light or dark get
 *    all checkout events tripled with 2x amount and "50%OFF" coupon.
 *
 *    Mixpanel Report:
 *    - Funnels: any multi-step funnel, breakdown by theme
 *      Expected: "custom" theme users show much higher checkout counts
 *    - Insights: "checkout", AVG(amount), breakdown by coupon
 *      Expected: "50%OFF" spike from power buyers
 *
 * 3. LOW-QUALITY VIDEO CHURN (everything hook)
 *    Users who watch more low-quality (480p/360p/240p) than high-quality
 *    video have a 50% chance of losing all events after their midpoint.
 *
 *    Mixpanel Report:
 *    - Retention: breakdown by video quality
 *      Expected: low-quality watchers show ~50% drop-off from midpoint
 *    - Insights > Stacked Line: event count by quality
 *      Expected: low-quality cohort volume thins out after midpoint
 */

/** @type {import('../types').Dungeon} */
const config = {
	token: "",
	seed: "simple is best",
	numDays: 100, //how many days worth1 of data
	numEvents: 500_000, //how many events
	numUsers: 5_000, //how many users
	format: 'json', //csv or json
	region: "US",
	hasAnonIds: true, //if true, anonymousIds are created for each user
	hasSessionIds: true, //if true, hasSessionIds are created for each user
	hasAdSpend: false,
	hasLocation: true,
	hasAndroidDevices: true,
	hasIOSDevices: true,
	hasDesktopDevices: true,
	hasBrowser: true,
	hasCampaigns: true,
	isAnonymous: false,
	alsoInferFunnels: true,
	concurrency: 1,
	batchSize: 2_500_000,


	events: [
		{
			event: "ad impression",
			weight: 15,
			properties: {
				partner: ["google", "facebook", "twitter", "linkedin", "bing", "taboola", "outbrain", "quora", "pinterest"],
			}
		},
		{
			event: "ad click",
			weight: 10,
			properties: {
				partner: ["google", "facebook", "twitter", "linkedin", "bing", "taboola", "outbrain", "quora", "pinterest"],
			}
		},
		{
			event: "checkout",
			weight: 2,
			properties: {
				amount: weighNumRange(5, 500, .25),
				currency: ["USD", "CAD", "EUR", "BTC", "ETH", "JPY"],
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
			experiment: true,
			name: "Signup Flow"

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

		const NOW = dayjs();
		// const DATE_HOMEGROWN_LAUNCH = NOW.subtract(25, 'day');
		// const DATE_HOMEGROWN_IMPROVEMENT = NOW.subtract(10, 'day');
		const OVER_THINGS_GET_BETTER = NOW.subtract(15, 'day');

		if (type === "event") {
			const EVENT_TIME = dayjs(record.time);

			if (EVENT_TIME.isAfter(OVER_THINGS_GET_BETTER)) {
				// checkouts are bigger
				if (record.event === "checkout") {
					record.amount = Math.round(record.amount * 1.5);
				}

				// videos are longer
				if (record.event === "watch video") {
					record.watchTimeSec = Math.round(record.watchTimeSec * 1.5);
				}
			}

			if (EVENT_TIME.isBefore(OVER_THINGS_GET_BETTER)) {
				// tag 33% for removal (filtered in "everything" hook)
				if (chance.bool({ likelihood: 33 })) record._drop = true;
			}
		}

		if (type === "everything") {

			//custom themes purchase more:
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

			// Filter out events tagged for removal in the event hook
			record = record.filter(e => !e._drop);
		}

		return record;
	}
};

function flip(likelihood = 50) {
	return chance.bool({ likelihood });
}


export default config;