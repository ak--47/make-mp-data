
const SEED = "hello-world";
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
require("dotenv").config();
const u = require("../components/utils");
const v = require("ak-tools");
const chance = u.initChance(SEED);
const num_users = 50_000;
const days = 90;

/** @type {import("../types").Dungeon} */
const config = {
	token: "204809263e148f5a7cc63e171865a4b2",
	seed: SEED,
	numDays: days,
	numEvents: num_users * 50,
	numUsers: num_users,
	hasAnonIds: false,
	hasSessionIds: false,
	format: "json",
	alsoInferFunnels: false,
	hasLocation: true,
	hasAndroidDevices: false,
	hasIOSDevices: false,
	hasDesktopDevices: true,
	hasBrowser: false,
	hasCampaigns: true,
	isAnonymous: false,
	hasAdSpend: false,
	percentUsersBornInDataset: 75,
	hasAvatar: false,
	makeChart: false,

	batchSize: 1_500_000,
	concurrency: 1,
	writeToDisk: false,

	funnels: [
		{
			sequence: ["home page view", "get started button click", "next button click", "next button click", "sign up button click"],
			conversionRate: 25,
			timeToConvert: 1,
			requireRepeats: true,
			isFirstFunnel: true,
			props: {
				"browser": ["Chrome", "Safari", "Firefox", "Edge", "IE"]
			}
		},
	],
	events: [
		{
			"event": "home page view",
			weight: 100,

		},
		{
			"event": "get started button click",
			weight: 50,
			isFirstEvent: true,
		},
		{
			"event": "next button click",
			weight: 50,
			isFirstEvent: true,
		},

		{
			"event": "sign up button click",
			weight: 30,
			isFirstEvent: true,
		},
		{
			"event": "log in",
			weight: 70
		},
		{
			"event": "send money",
			weight: 65,
		},
		{
			"event": "receive money",
			weight: 45,
		},
		{
			"event": "check balance",
			weight: 70,
		},
		{
			"event": "bill pay",
			weight: 50,
		},
		{
			"event": "connect account",
			weight: 25,
		},
		{
			"event": "view dashboard",
			weight: 30,
		},
		{
			"event": "view credit score",
			weight: 20,
		},
		{
			"event": "apply for loan",
			weight: 10,
		}
	],
	superProps: {
		"browser": u.pickAWinner(["Chrome", "Safari", "Firefox", "Edge", "IE"], 0),
	},
	userProps: {},
	scdProps: {},
	mirrorProps: {},
	groupKeys: [],
	groupProps: {},
	lookupTables: [],
	hook: function (record, type, meta) {
		const NOW = dayjs();
		const bugStartDate = NOW.subtract(7, 'days');
		// const bugFixedDate = NOW.subtract(3, 'days');
		// const featureReleaseData = NOW.subtract(7, 'days');

		if (type === "event") {
			// const EVENT_TIME = dayjs(record.time);

		}

		if (type === "funnel-post") {
			// there's a bug in Chrome where users can't complete the funnel
			if (record[1]?.event === 'get started button click') {
				if (dayjs(record[0].time).isAfter(bugStartDate)) {
					if (record[0]?.["browser"] === "Chrome") {
						if (record.length > 3) {
							record = record.slice(0, 3);

						}
					}
				}
			}

		}

		if (type === "everything") {
			

			if (record[1]?.event === "get started button click") {
				
				// most users don't convert
				if (chance.bool({ likelihood: u.integer(69, 75) })) {
					record = record.slice(0, u.integer(1, 4));
				}
				
				
				// chrome case, never converts, can't reach step 3
				if (record[0]?.["browser"] === "Chrome") {
					if (dayjs(record[0].time).isAfter(bugStartDate)) {
						if (record.length > 3) {
							record = record.slice(0, 3);
						}
					}
				}
			}
		}

		return record;

	}


};

module.exports = config;
