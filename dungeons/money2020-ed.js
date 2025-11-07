

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import { weighNumRange, range, date, initChance, exhaust, choose, integer, decimal } from "../lib/utils/utils.js";

const SEED = "thfdgdfgdfgank sup hello 2020 money!!!";
dayjs.extend(utc);
const chance = initChance(SEED);
const num_users = 4_200;
const days = 35;

/** @typedef  {import("../types.js").Dungeon} Dungeon */

/** @type {Dungeon} */
const dungeon = {
	token: "",
	seed: SEED,
	numDays: days,
	numEvents: num_users * 120,
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
	hasAdSpend: false,
	percentUsersBornInDataset: 40,
	hasAvatar: true,

	batchSize: 1_500_000,
	concurrency: 1,
	writeToDisk: false,
	superProps: {
		version: "2"
	},
	// AI-generated schema content:
	funnels: [
		{
			"name": "User Onboarding",
			"sequence": [
				"App Opened",
				"View Balance",
				"Add Contact"
			],
			"weight": 10,
			"isFirstFunnel": true,
			"conversionRate": 80,
			"timeToConvert": 0.1,
			"order": "sequential"
		},
		{
			"name": "Standard Money Transfer",
			"sequence": [
				"App Opened",
				"View Balance",
				"Initiate Transfer",
				"Send Money"
			],
			
			"weight": 20,
			"conversionRate": 65,
			"timeToConvert": 0.2,
			"order": "first-and-last-fixed",
			"experiment": true,
			"conditions": {
				"account_tier": [
					"Basic",
					"Plus"
				]
			}
		},
		{
			"name": "Premium Money Transfer",
			"sequence": [
				"App Opened",
				"View Balance",
				"Initiate Transfer",
				"Send Money"
			],
			experiment: true,
			"weight": 15,
			"conversionRate": 90,
			"timeToConvert": 0.1,
			"order": "sequential",
			"conditions": {
				"account_tier": "Premium"
			},
			"props": {
				"is_priority_transfer": true
			}
		},
		{
			"name": "Get Financial Advice",
			"sequence": [
				"App Opened",
				"Prompt AI Chatbot"
			],
			"weight": 8,
			"conversionRate": 95,
			"timeToConvert": 0.1,
			"order": "sequential"
		},
		{
			"name": "Review and Save Transaction",
			"sequence": [
				"App Opened",
				"View Transaction History",
				"Print Receipt"
			],
			"weight": 12,
			"conversionRate": 50,
			"timeToConvert": 0.5,
			"order": "random"
		},

		{
			name: "Sign Up",
			sequence: [
				"Page View",
				"Sign Up"
			],
			isFirstFunnel: true,
			conversionRate: 20,
			timeToConvert: 10,
			order: "sequential"
		},
		{
			name: "AI Interaction",
			sequence: [
				"Launch AI",
				"AI Prompt Sent",
				"AI Response Sent",
				"User Feedback",
				"AI Dismissed"
			],
			experiment: true,
			isFirstFunnel: false,
			conversionRate: 38,
			timeToConvert: 5,
			order: "sequential",
			weight: 7,
			props: { "AI Model": ["5-turbo", "5-flash", "5-flagship", "homegrown"] }
		},
		{
			name: "AI Interaction Errors",
			sequence: [
				"Launch AI",
				"AI Prompt Sent",
				"AI Response Sent",
				"API Error",
				"User Feedback",
				"AI Dismissed"
			],
			isFirstFunnel: false,
			conversionRate: 27,
			timeToConvert: 5,
			order: "sequential",
			weight: 3,
			props: { "AI Model": ["5-turbo", "5-flash", "5-flagship", "homegrown"] }
		}
	],
	events: [
		{
			"event": "Page View",
			"weight": 15,
			"isFirstEvent": true,
			"properties": {
				"page_url": [
					"/",
					"/features",
					"/pricing",
					"/about",
					"/contact"
				]
			}
		},
		{
			"event": "App Opened",
			"weight": 10,
			"isFirstEvent": true,
			"properties": {
				"platform": [
					"iOS",
					"Android",
					"Web"
				],
				"app_version": [
					"2.1.0",
					"2.1.1",
					"2.2.0",
					"2.0.5"
				]
			}
		},
		{
			"event": "View Balance",
			"weight": 8,
			"properties": {
				"account_type": [
					"Checking",
					"Savings",
					"Credit"
				],
				"currency": [
					"USD",
					"EUR",
					"GBP",
					"JPY"
				]
			}
		},
		{
			"event": "Initiate Transfer",
			"weight": 6,
			"properties": {
				"transfer_method": [
					"Bank Transfer",
					"Peer-to-Peer",
					"Card Payment"
				],
				"is_international": [
					true,
					false,
					false
				]
			}
		},
		{
			"event": "Send Money",
			"weight": 5,
			"properties": {
				"amount": weighNumRange(10, 5000, 0.3),
				"currency": [
					"USD",
					"EUR",
					"GBP",
					"JPY",
					"CAD"
				],
				"fee_amount": weighNumRange(0, 50, 0.1),
				"transfer_speed": [
					"Instant",
					"Standard",
					"Economy"
				]
			}
		},
		{
			"event": "Add Contact",
			"weight": 3,
			"properties": {
				"contact_method": [
					"Phone Number",
					"Email",
					"Username"
				],
				"is_verified_user": [
					true,
					true,
					false
				]
			}
		},
		{
			"event": "Print Receipt",
			"weight": 2,
			"properties": {
				"transaction_id": chance.guid.bind(chance),
				"format": [
					"PDF",
					"Image",
					"Text"
				]
			}
		},
		{
			"event": "Prompt AI Chatbot",
			"weight": 4,
			"properties": {
				"prompt_topic": [
					"Budgeting",
					"Investment Advice",
					"Savings Goals",
					"Credit Score",
					"Fraud Prevention"
				],
				"prompt_length": weighNumRange(10, 200),
				"response_quality_rating": weighNumRange(1, 5)
			}
		},
		{
			"event": "View Transaction History",
			"weight": 7,
			"properties": {
				"time_range": [
					"Last 7 Days",
					"Last 30 Days",
					"Last 90 Days",
					"All Time"
				],
				"filter_by": [
					"Sent",
					"Received",
					"Failed",
					"None"
				]
			}
		},
		{
			"event": "Request Money",
			"weight": 3,
			"properties": {
				"amount": weighNumRange(5, 1000, 0.4),
				"currency": [
					"USD",
					"EUR",
					"GBP"
				],
				"request_status": [
					"Pending",
					"Accepted",
					"Declined"
				]
			}
		},
		{
			"event": "Account Deactivated",
			"weight": 1,
			"isChurnEvent": true,
			"properties": {
				"reason": [
					"Switched to competitor",
					"Security concerns",
					"Poor user experience",
					"No longer needed"
				]
			}
		},

		{
			event: "Sign Up",
			isFirstEvent: true,
			weight: 0,
			properties: {
				signup_method: [
					"email",
					"google",
					"github"
				]
			}
		},
		{
			event: "Purchase",
			weight: 40,
			properties: {
				amount: weighNumRange(20, 500, 0.3),
				currency: [
					"USD",
					"EUR",
					"GBP"
				],
				item_count: weighNumRange(1, 10)
			}
		},
		{
			event: "Launch AI",
			weight: 2,
			properties: {
				entry_point: [
					"dashboard_widget",
					"header_button",
					"in_app_prompt"
				]
			}
		},
		{
			event: "AI Prompt Sent",
			weight: 10,
			properties: {
				prompt: [
					"how can I make a dashboard?",
					"what is a funnel?",
					"what drives new users?",
					"show me my top performing campaigns",
					"compare user retention by country"
				],
				prompt_length: weighNumRange(15, 150)
			}
		},
		{
			event: "AI Response Sent",
			weight: 10,
			properties: {
				cost: weighNumRange(1, 10, 0.2),
				tokens: weighNumRange(100, 1000, 0.4),
				time_to_generate_ms: weighNumRange(1000, 10000, 0.2)
			}
		},
		{
			event: "User Feedback",
			weight: 4,
			properties: {
				feedback: [
					"I love it!",
					"meh...",
					"This sucks",
					"Fine"
				],
				sentiment: [
					"thumbs up",
					"thumbs down"
				]
			}
		},
		{
			event: "AI Dismissed",
			weight: 2,
			properties: {
				reason: [
					"finished",
					"clicked_away",
					"new_prompt",
					"error"
				]
			}
		},
		{
			event: "API Error",
			weight: 2,
			properties: {
				error_code: [
					400,
					401,
					429,
					500,
					503
				],
				error_message: [
					"Bad Request",
					"Unauthorized",
					"Too Many Requests",
					"Internal Server Error",
					"Service Unavailable"
				]
			}
		}
	],
	userProps: {
		plan_type: [
			"free",
			"pro",
			"pro",
			"enterprise",
			"free"
		],
		company_size: [
			"1-10",
			"11-50",
			"51-200",
			"201-1000",
			"1000+"
		],
		account_tier: [
			"Basic",
			"Plus",
			"Premium",
		],
		created_date: date(365, true, 'YYYY-MM-DD')
	},

	hook: function (record, type, meta) {
		const NOW = dayjs();
		const DATE_HOMEGROWN_LAUNCH = NOW.subtract(25, 'day');
		const DATE_HOMEGROWN_IMPROVEMENT = NOW.subtract(10, 'day');
		const OVER_THINGS_GET_BETTER = NOW.subtract(30, 'day');

		if (type === "event") {
			const EVENT_TIME = dayjs(record.time);

			if (record.prompt) {
				// calculate prompt length
				record.prompt_length = record.prompt.length;
			}
			// models: "5-turbo", "5-flash", "5-flagship", "homegrown"
			if (record?.["AI Model"]) {
				const allModels = ["5-turbo", "5-flash", "5-flash", "5-flagship", "5-flagship", "5-flagship", "homegrown"];
				const chosenModel = chance.pickone(allModels);
				record["AI Model"] = chosenModel;

				// choose which model based on date + weights
				if (EVENT_TIME.isBefore(DATE_HOMEGROWN_LAUNCH)) {
					if (chosenModel === "homegrown") {
						if (chance.bool({ likelihood: 75 })) {
							record["AI Model"] = "5-flagship";
						}
					}
				}

				if (EVENT_TIME.isAfter(DATE_HOMEGROWN_LAUNCH)) {
					if (chosenModel !== "homegrown") {
						if (chance.bool({ likelihood: 27 })) {
							record["AI Model"] = "homegrown";
						}
					}

					if (record["AI Model"] && record["cost"] && record["tokens"]) {

						// update params 
						switch (record["AI Model"]) {
							// 5 turbo is most expensive and slowest
							case "5-turbo":
								record["cost"] *= decimal(1.2, 1.7, 3);
								record["tokens"] *= decimal(1.2, 1.7, 3);
								break;
							// 5 flash is least expensive and fastest
							case "5-flash":
								record["cost"] *= decimal(0.8, 0.8, 3);
								record["tokens"] *= decimal(0.8, 0.8, 3);
								break;
							// 5 flagship is in between in both areas
							case "5-flagship":
								record["cost"] *= decimal(1.0, 1.0, 3);
								record["tokens"] *= decimal(1.0, 1.0, 3);
								break;
							// homegrown is chaotic is chaotic
							case "homegrown":

								record["cost"] *= decimal(0.5, 2.5, 3);
								record["tokens"] *= decimal(0.5, 2.5, 3);
								if (EVENT_TIME.isBefore(DATE_HOMEGROWN_IMPROVEMENT)) {
									record["cost"] *= decimal(1.2, 5.0, 3);
									record["tokens"] *= decimal(1.2, 3.0, 3);
								}
								if (EVENT_TIME.isAfter(DATE_HOMEGROWN_IMPROVEMENT)) {
									record["cost"] *= decimal(0.5, 1.0, 3);
									record["tokens"] *= decimal(0.5, 0.75, 3);
								}
								break;
							default:
								break;
						}
					}

				}
			}



		}
		if (type === "funnel-pre") {
			const parsedFirstEventTime = dayjs.unix(meta.firstEventTime);
			if (!parsedFirstEventTime.isValid()) debugger;
			//stupid offset thing we need to do...
			const actualFunnelTime = parsedFirstEventTime.add(NOW.diff(dayjs.unix(global.FIXED_NOW), 'h'), 'h');
			if (actualFunnelTime.isBefore(OVER_THINGS_GET_BETTER)) {
				record.conversionRate *= decimal(0.5, 0.9, 3);
				// record.timeToConvert *= decimal(1.5, 3.0, 3);
			}
			if (actualFunnelTime.isAfter(OVER_THINGS_GET_BETTER)) {
				const distanceDays = Math.min(30, actualFunnelTime.diff(OVER_THINGS_GET_BETTER, 'day'));
				const improvementFactor = 1.0 + (distanceDays / 30) * 0.5;
				// record.timeToConvert *= decimal(0.5, 0.75, 3) / improvementFactor;
				record.conversionRate *= decimal(1.0, 2.0, 4) * improvementFactor;
			}
		}
		return record;
	}
};

export default dungeon;

