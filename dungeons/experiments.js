
const SEED = "my-seed";
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
require("dotenv").config();
const u = require("../components/utils");
const v = require("ak-tools");
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef  {import("../types").Dungeon} Config */

/** @type {Config} */
const config = {
	token: "",
	seed: SEED,
	numDays: days,
	numEvents: num_users * 100,
	numUsers: num_users,
	hasAnonIds: false,
	hasSessionIds: false,
	format: "json",
	alsoInferFunnels: true,
	hasLocation: true,
	hasAndroidDevices: true,
	hasIOSDevices: true,
	hasDesktopDevices: true,
	hasBrowser: true,
	hasCampaigns: true,
	isAnonymous: false,
	hasAdSpend: false,

	hasAvatar: true,
	makeChart: false,


	batchSize: 1_500_000,
	concurrency: 1,
	writeToDisk: false,

	funnels: [],
	events: [
		{
			event: "$experiment_started",
			weight: 5,
			isSessionStartEvent: true,
			properties: {
				"$experiment_type": "all_my_own",
				"Experiment name": "name of experiment",
				"Variant name": ["variant 1", "variant 2", "variant 3", "control"],
			}
		},
		{
			event: "super common event",
			weight: 50,
			properties: {
				"foo": u.pickAWinner(["bar", "baz", "qux"], 0),
			}
		},
		{
			event: "less common event",
			weight: 20,
			properties: {
				"hello": u.pickAWinner(["world", "universe", "galaxy"], 0),
			}
		},
		{
			event: "rare event",
			weight: 5,
			properties: {
				"goodbye": u.pickAWinner(["cruel world", "universe", "galaxy"], 0),
			}
		},
		{
			event: "money event",
			weight: 10,
			properties: {
				"amount": u.weighNumRange(5, 500, .25),
				"currency": u.pickAWinner(["USD", "CAD", "EUR", "BTC", "ETH", "JPY"], 0),				
				"numItems": u.weighNumRange(1, 10),
			}
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

		if (type === "event") {
			const EVENT_TIME = dayjs(record.time);
		}

		if (type === "user") {

		}

		if (type === "funnel-post") {

		}

		if (type === "funnel-pre") {

		}

		if (type === "scd") {

		}

		if (type === "everything") {

		}

		return record;
	}
};

module.exports = config;
