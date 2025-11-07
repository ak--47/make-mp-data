

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import { weighNumRange, range, date, initChance, exhaust, choose, integer, decimal } from "../lib/utils/utils.js";

const SEED = "thfdgdsdfsdfdffgdfgank sup hello 2020 money!!!";
dayjs.extend(utc);
const chance = initChance(SEED);
const num_users = 2_000;
const days = 60;

/** @typedef  {import("../types.js").Dungeon} Dungeon */

/** @type {Dungeon} */
const dungeon = {
	token: "945aa091867cec089e6d26a9d51e86fe",
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
		version: "3"
	},
	// AI-generated schema content:
	funnels: [		
		{
			name: "AI Interaction",
			sequence: [
				"AI: Launch",
				"AI: Prompt Sent",
				"AI: Response Sent",
				"AI: Dismissed"
			],			
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
				"AI: Launch",
				"AI: Prompt Sent",
				"AI: Response Sent",
				"AI: API Error",
				"AI: Dismissed"
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
			event: "AI: Launch",
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
			event: "AI: Prompt Sent",
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
			event: "AI: Response Sent",
			weight: 10,
			properties: {
				cost: weighNumRange(1, 10, 0.2),
				tokens: weighNumRange(100, 1000, 0.4),
				time_to_generate_ms: weighNumRange(1000, 10000, 0.2)
			}
		},	
		{
			event: "AI: Dismissed",
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
			event: "AI: API Error",
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
		const FLASH_LAUNCH = NOW.subtract(50, 'day');
		const TURBO_LAUNCH = NOW.subtract(20, 'day');
		const HOMEGROWN_LAUNCH = NOW.subtract(10, 'day');
		const DATE_HOMEGROWN_LAUNCH = NOW.subtract(10, 'day');
		const DATE_HOMEGROWN_IMPROVEMENT = NOW.subtract(5, 'day');
		const OVER_THINGS_GET_BETTER = NOW.subtract(30, 'day');

		if (type === "event") {
			const EVENT_TIME = dayjs(record.time);

			if (record.prompt) {
				// calculate prompt length
				record.prompt_length = record.prompt.length;
			}
			// models: "5-turbo", "5-flash", "5-flagship", "homegrown"
			if (record?.["AI Model"]) {
				let modelPool = ["5-flagship"];
				if (EVENT_TIME.isAfter(FLASH_LAUNCH)) modelPool.push("5-flash");
				if (EVENT_TIME.isAfter(TURBO_LAUNCH)) modelPool.push("5-turbo");
				if (EVENT_TIME.isAfter(HOMEGROWN_LAUNCH)) modelPool.push("homegrown");
				
				const chosenModel = chance.pickone(modelPool);
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

