const run = require("../index.js");
const SEED = "my-seed";
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
require("dotenv").config();
const u = require("../components/utils");
const v = require("ak-tools");
const { projectId, serviceAccount, serviceSecret } = require("./adspend");
const chance = u.initChance(SEED);
const num_users = 1_500;
const days = 91;

const GOVERNANCE_TOKEN = process.env.GOVERNANCE_TOKEN;
const GOVERNANCE_ID = process.env.GOVERNANCE_ID;
const GOVERNANCE_ACCT = process.env.GOVERNANCE_ACCT;
const GOVERNANCE_SECRET = process.env.GOVERNANCE_SECRET;

const URLS = [
	"/",
	"/refinance-student-loan/",
	"/private-student-loans/",
	"/personal-loans/",
	"/home-loans/",
	"/invest/",
	"/banking/",
	"/relay/",
	"/life-insurance/",
	"/learn/",
	"/faq/",
	"/career-advisory/",
	"/member-benefits/",
	"/experiences/",
	"/member-stories/",
	"/contact-us/",
	"/jobs/",
	"/on-the-money/",
	"/about-sofi/",
	"/management-team/",
	"/eligibility-criteria/",
	"/referral-program/",
	"/sofi-at-work/"
];

/** @type {Config} */
const commonOpts = {
	verbose: true,
	token: GOVERNANCE_TOKEN,
	projectId: GOVERNANCE_ID,
	serviceAccount: GOVERNANCE_ACCT,
	serviceSecret: GOVERNANCE_SECRET,
	numDays: days,
	numEvents: num_users * 100,
	numUsers: num_users,
	hasAnonIds: false,
	hasSessionIds: true,
	format: "json",
	alsoInferFunnels: true,
	hasLocation: true,
	hasAndroidDevices: false,
	hasIOSDevices: false,
	hasDesktopDevices: false,
	hasBrowser: true,
	hasCampaigns: false,
	isAnonymous: false,
	hasAdSpend: false,

	hasAvatar: true,
	makeChart: false,

	batchSize: 1_500_000,
	concurrency: 1,
	writeToDisk: false,
	percentUsersBornInDataset: 15
	
};

/** @typedef  {import("../types").Dungeon} Config */

/** @type {Config} */
const diffNameSameMeaning = {
	...commonOpts,
	name: "same-meaning",
	hasAdSpend: true,
	seed: "foo",
	description: "A dungeon with really unclear event names",
	funnels: [],
	events: [
		//@ts-ignore
		" login", "login ", " sign in", "login", "Log In", "Sign In", "sign in", "signin", "page view", "page viewed", "viewed page", "view page", "pageview", "page viewed", "page view", "pageviewed", "page viewed", "page view", "pageview", "page viewed", "page view", "pageviewed", "page viewed", "page view", "pageview", "page viewed", "page view", "pageviewed", "page viewed", "page view", "pageview", "page viewed", "page view", "pageviewed", "page viewed", "page view", "pageview", "page viewed", "page view", "pageviewed", "page viewed", "page view", "pageview", "page viewed", "page view", "pageviewed", "page viewed", "page view", "pageview", "page viewed", "page view", "pageviewed", "page viewed", "page view", "pageview", "page viewed", "page view", "pageviewed", "page viewed", "page view", "pageview", "page viewed", "page view", "pageviewed", "page viewed", "page view", "pageview", "page viewed", "page view", "pageviewed", "page viewed", "page view", "pageview", "page viewed", "page view", "pageviewed", "page viewed", "page view", "pageview", "page viewed", "page view", "pageviewed", "page viewed", "page view", "pageview", "page viewed", "page view", "pageviewed", "page viewed", "page view", "pageview", "page viewed", "page view", "page_viewed", "page"
	],
	superProps: {
		"theme": "diff name; same meaning",
		"url": u.pickAWinner(URLS, 0)
	},
	userProps: {},	 
	hook: (a, type) => {
		if (type === "everything") {
			return a;
		}

		return a;
	}
};


/** @type {Config} */
const sameNameDiffMeaning = {
	...commonOpts,
	name: "diff-meanings",
	seed: "bar",
	description: "a dataset with a single event that means different things",
	funnels: [],
	events: [
		{
			event: "button click",
			properties: {
				"button name": ["start now", "register", "submit", "learn more", "try now", "free trial"],
				"form name": u.pickAWinner(["mortgage", "student loan", "personal loan ", "credit card ", "savings account", "subscribe form"]),
				"cta": ["free for 30d", "decision in 5min", "chat with a human", "try it in the app"],
			}
		}
	],
	superProps: {
		"theme": "same name; diff meaning",
		"url": u.pickAWinner(URLS, 0)
	},
	userProps: {},
	scdProps: {},
	hook: (a, type) => {
		if (type === "everything") {
			return a;
		}

		return a;
	}
};

/** @type {Config} */
const Borrowing = {
	...commonOpts,
	percentUsersBornInDataset: 100,
	alsoInferFunnels: false,
	name: "borrowing",
	seed: "baz",
	description: "a dataset which requires borrowing",
	funnels: [
		{
			"sequence": ["page viewed", "click!", "sign up"],
			"isFirstFunnel": true,
			"order": "sequential"
		},
		{
			"sequence": ["start application", "submit application"],
			"props": {
				"product": u.pickAWinner(["mortgage", "student loan", "personal loan ", "credit card ", "savings account", "investing account"]),
				"application Id": () => { return v.uid(10); },
			}
		}
	],
	events: [
		{
			event: "page viewed",
			properties: {
				"marketing channel": u.pickAWinner(["organic", "meta", "google", "x", "snapchat", "youtube", "instagram"], 0),
			}
		},
		{
			event: "click!",
			properties: {
				"CTA clicked": u.pickAWinner(["start now", "register", "submit", "learn more", "try now", "free trial"]),
			}
		},
		{
			event: "sign up",
			properties: {
				"A/B test": ["fast onboarding", "custom colors", "localization", "new design"],
				"Variant": ["A", "B", "C", "Control"]
			},
			isFirstEvent: true
		},
		{
			event: "start application",

		},
		{
			event: "submit application",
		},
	],
	superProps: {
		"theme": "requires borrows",
		"url": u.pickAWinner(URLS, 0)
	},
	userProps: {},
	scdProps: {},
	hook: (a, type) => {
		if (type === "everything") {
			return a;
		}

		return a;
	}
};


/** @type {Config} */
const Modeling = {
	...commonOpts,
	percentUsersBornInDataset: 100,
	alsoInferFunnels: false,
	name: "bad shapes",
	seed: "qux",
	description: "a data set with bad modeling",
	funnels: [

	],
	events: [
		{
			event: "nested nightmare",
			properties: {
				data: buildAStupidNestedObject
			}
		},
	],
	superProps: {
		"theme": "deeply nested",
		"url": u.pickAWinner(URLS, 0)
	},
	userProps: {},
	scdProps: {},
	hook: (a, type) => {
		if (type === "everything") {
			return a;
		}

		return a;
	}
};

const metaValues = u.pickAWinner(["foo", "bar", "baz", "qux", "quux", "corge", "grault", "garply", "waldo", "fred", "plugh", "xyzzy", "thud"]);
function buildAStupidNestedObject(depth = 0) {
	let obj = {};
	const keyPrefix = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
	const keySuffix = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

	let numKeys = chance.integer({ min: 1, max: 5 });
	for (let i = 0; i < numKeys; i++) {
		if (depth <= 3 && chance.bool({ likelihood: 10 })) {
			let key = chance.pickone(keyPrefix) + ">" + chance.pickone(keySuffix);
			obj[key] = buildAStupidNestedObject();
		}
		else {
			let key = chance.pickone(keyPrefix) + "|" + chance.pickone(keySuffix);
			let value = u.choose(metaValues);
			obj[key] = value;
		}
	}
	return obj;
}


const dungeons = [
	diffNameSameMeaning,
	sameNameDiffMeaning,
	Borrowing,
	Modeling
];

async function runDungeons() {
	const results = [];
	for (let dungeon of dungeons) {
		const job = await run(dungeon);
		results.push(job);
	}
	return results;
}

runDungeons()
	.then(results => {
		debugger;
	})
	.catch(e => {
		console.error(e);
		debugger;

	});

module.exports = {};
