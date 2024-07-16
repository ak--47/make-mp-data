
const SEED = "my-seed";
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
require("dotenv").config();
const u = require("../components/utils");
const v = require("ak-tools");
const chance = u.initChance(SEED);
const num_users = 1000;
const days = 90;

/** @type {import("../types").Config} */
const config = {
	token: "0135b13525b21294e9e599a483eb35b2",
	seed: SEED,
	numDays: days,
	numEvents: num_users * 100,
	numUsers: num_users,
	hasAnonIds: false,
	hasSessionIds: false,
	format: "json",
	alsoInferFunnels: false,
	hasLocation: true,
	hasAndroidDevices: false,
	hasIOSDevices: false,
	hasDesktopDevices: true,
	hasBrowser: true,
	hasCampaigns: true,
	isAnonymous: false,
	hasAdSpend: true,

	hasAvatar: true,
	makeChart: true,

	batchSize: 500_000,
	concurrency: 500,
	writeToDisk: false,

	funnels: [
		{
			sequence: ["view page", "watch video", "like video"],
			conversionRate: 25,
			timeToConvert: 1
		},
		{
			sequence: ["view page", "watch video", "dislike video"],
			conversionRate: 20,
			timeToConvert: 1
		},
		{
			sequence: ["view page", "watch video", "comment on video"],
			conversionRate: 15,
			timeToConvert: 1
		},
		{
			sequence: ["view page", "sign up"],
			conversionRate: 70,
			isFirstFunnel: true,

		}
	],
	events: [
		{
			"event": "view page",
			weight: 100,

		},
		{
			"event": "watch video",
			weight: 150,
			"properties": {
				"watch time (mins)": u.weighNumRange(1, 60, .34)
			}
		},
		{
			"event": "like video",
			weight: 50
		},
		{
			"event": "dislike video",
			weight: 40
		},
		{
			"event": "comment on video",
			weight: 30
		},
		{
			"event": "new feature: AI Filters",
			weight: 10
		},
		{
			"event": "sign up",
			weight: 10,
			"isFirstEvent": true,
		}
	],
	superProps: {},
	userProps: {},
	scdProps: {},
	mirrorProps: {},
	groupKeys: [],
	groupProps: {},
	lookupTables: [],
	hook: function (record, type, meta) {
		const NOW = dayjs();	
		const bugStartDate = NOW.subtract(14, 'days');
		const bugFixedDate = NOW.subtract(3, 'days');
		const featureReleaseData = NOW.subtract(7, 'days');

		if (type === "event") {
			const EVENT_TIME = dayjs(record.time);
			if (record.event === "new feature: AI Filters" && EVENT_TIME.isBefore(featureReleaseData)) {
				return null;
			}
		}

		if (type === "funnel-post") {
			// there's a bug in Chrome where users can't complete the funnel
			if (dayjs(record[0].time).isAfter(bugStartDate) && dayjs(record[0].time).isBefore(bugFixedDate)) {
				if (record[0].browser === "Chrome") {
					if (record.length > 2) {						
						record.pop(); // remove the last event						
					}
				}
			}
			
		}

		return record;
	}


};

module.exports = config;
