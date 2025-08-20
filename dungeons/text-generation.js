

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import { weighNumRange, range, date, initChance, exhaust, choose, integer } from "../lib/utils/utils.js";

import { buildGenerator } from "../lib/generators/text.js";

const SEED = "make me text yo";
dayjs.extend(utc);
const chance = initChance(SEED);
const num_users = 5_000;
const days = 90;

/** @typedef  {import("../types.js").Dungeon} Dungeon */

const supportTicketGen = buildGenerator({
	chaos: 0.2,
	formality: "technical",
	style: "support",
	min: 50,
	max: 255
})

const reviewWritingGen = buildGenerator({
	chaos: 0.2,
	style: "review",
	min: 10,
	max: 255
	
})


const searchGen = buildGenerator({
	chaos: 0.3,
	style: "search",
	min: 4,
	max: 42
})

const feedbackGen = buildGenerator({
	chaos: 0.25,
	style: "feedback",
	min: 20,
	max: 120
})

const conversationGen = buildGenerator({
	chaos: 0.4,
	style: "chat",
	min: 3,
	max: 255
})




/** @type {Dungeon} */
const dungeon = {
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
	hasAndroidDevices: false,
	hasIOSDevices: false,
	hasDesktopDevices: false,
	hasBrowser: false,
	hasCampaigns: false,
	isAnonymous: false,
	hasAdSpend: false,

	hasAvatar: false,
	makeChart: false,

	batchSize: 1_500_000,
	concurrency: 50,
	writeToDisk: true,

	// AI-generated schema content:
	events: [		
		{
			event: "create support ticket",
			weight: 2,
			properties: {
				support_text: supportTicketGen.generateRandom,
				priority: [
					"low",
					"medium",
					"high",
					"urgent"
				],
				category: [
					"billing",
					"technical",
					"account",
					"general",
					"bug report"
				],
				channel: [
					"email",
					"phone",
					"chat",
					"web form"
				],
				is_resolved: [
					true,
					true,
					false
				]
			}
		},
		{
			event: "write review",
			weight: 3,
			properties: {
				rating: weighNumRange(1, 5),
				product_id: range(1, 1000),
				review_text: reviewWritingGen.generateRandom,
				is_verified_purchase: [
					true,
					true,
					false
				]
			}
		},
		{
			event: "search",
			weight: 15,
			properties: {
				query_length: weighNumRange(1, 25),
				results_count: weighNumRange(0, 100, 0.1),
				search_text: searchGen.generateRandom,
				clicked_result: [
					true,
					true,
					false
				],
				search_type: [
					"product",
					"help_article",
					"user",
					"general"
				]
			}
		},
		{
			event: "give feedback",
			weight: 4,
			properties: {
				score: weighNumRange(1, 10),
				feedback_text: feedbackGen.generateRandom,
				feedback_type: [
					"suggestion",
					"bug_report",
					"compliment",
					"complaint"
				],
				context: [
					"app_experience",
					"website",
					"support_interaction",
					"product_quality"
				]
			}
		},
		{
			event: "send chat",
			weight: 20,
			properties: {
				writing_method: [
					"typing",
					"voice dictation",
					"handwriting recognition",
					"gesture input"
				],
				chat_text: conversationGen.generateRandom,
				has_attachment: [
					true,
					false,
					false,
					false
				],
				
			}
		}
	],
	funnels: [
	],
	superProps: {
		FOO: [
			"bar",
			"baz",
			"qux",
			"waldo",
			"garply"
		],
		
	},
	userProps: {
		account_age_days: weighNumRange(0, 1095, 0.4),
		user_tier: [
			"free",
			"free",
			"free",
			"premium",
			"pro"
		],
		country: chance.country.bind(chance),
		signup_method: [
			"email",
			"google",
			"facebook",
			"apple"
		],
		notification_enabled: [
			true,
			true,
			false
		],
		has_purchased: [
			true,
			false,
			false
		]
	},
	scdProps: {
		
	},
	lookupTables: [
	
	],

	hook: function (record, type, meta) {
		// const NOW = dayjs();

		if (type === "event") {
			// const EVENT_TIME = dayjs(record.time);
		}

		if (type === "user") {

		}

		if (type === "funnel-post") {

		}

		if (type === "funnel-pre") {

		}

		if (type === "scd-pre") {

		}

		if (type === "everything") {

		}

		return record;
	}
};

export default dungeon;