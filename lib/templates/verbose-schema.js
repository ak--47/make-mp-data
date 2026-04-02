/**
 * @fileoverview this is a highly verbose schema for a dungeon that shows all the options available
 * and how they might be implemented with extensive comments so an AI can understand it
 * it is not meant to be used as a template, but rather as a reference for how to create a dungeon
 * it is also used as a test for the AI to see if it can generate a dungeon with the same structure
 *
 * IMPORTANT: This file uses the NEW JSON format for function calls with "functionName" and "args"
 */



import Chance from "chance";
const chance = new Chance();
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);
import "dotenv/config";
import { weighNumRange, range, date, initChance, exhaust, integer, decimal, odds } from "../utils/utils.js";
const { NODE_ENV = "unknown" } = process.env;


/** @type {import("../../types.js").Dungeon} */
//SPLIT HERE
const DUNGEON = {
	/**
	 * ⚠️ IMPORTANT NOTE ABOUT THIS EXAMPLE:
	 * This is a comprehensive example showing ALL possible features.
	 * Most dungeons will NOT need all these features, especially:
	 * - Groups (groupKeys, groupProps) - ONLY for B2B/SaaS scenarios
	 * - SCDs - ONLY when properties change over time
	 *
	 * Focus on the REQUIRED fields: events, funnels, superProps, userProps
	 */

	/**
	 * events are the core building blocks of the dungeon
	 * each event has a name, a weight, and properties
	 * the weight determines how often the event occurs relative to other events
	 * properties are the data associated with the event
	 * they can be simple values or functions that return a value
	 * we have a few built-in functions to help you generate data
	 * you MUST create events for every dungeon
	 *
	 * IMPORTANT: All function calls use the new JSON format with functionName and args
	 */
	events: [
		{
			event: "checkout",
			weight: 2,
			properties: {
				amount: { "functionName": "weighNumRange", "args": [5, 500, 0.25] }, // weighted random number in range
				currency: ["USD", "CAD", "EUR", "BTC", "ETH", "JPY"],
				coupon: ["none", "none", "none", "none", "10%OFF", "20%OFF", "10%OFF", "20%OFF", "30%OFF", "40%OFF", "50%OFF"],
				numItems: { "functionName": "weighNumRange", "args": [1, 10] },
			}
		},
		{
			event: "add to cart",
			weight: 4,
			properties: {
				amount: { "functionName": "weighNumRange", "args": [5, 500, 0.25] },
				rating: { "functionName": "weighNumRange", "args": [1, 5] },
				reviews: { "functionName": "weighNumRange", "args": [0, 35] },
				isFeaturedItem: [true, false, false],
				itemCategory: ["Books", "Movies", "Music", "Games", "Electronics", "Computers", "Smart Home", "Home", "Garden", "Pet", "Beauty", "Health", "Toys", "Kids", "Baby", "Handmade", "Sports", "Outdoors", "Automotive", "Industrial", "Entertainment", "Art", "Food", "Appliances", "Office", "Wedding", "Software"],
				dateItemListed: { "functionName": "date", "args": [30, true, "YYYY-MM-DD"] } // date in the last 30 days
			}
		},
		{
			event: "page view",
			weight: 10,
			properties: {
				page: ["/", "/", "/help", "/account", "/watch", "/listen", "/product", "/people", "/peace"],
				utm_source: ["$organic", "$organic", "$organic", "$organic", "google", "google", "google", "facebook", "facebook", "twitter", "linkedin"],
			}
		},
		{
			event: "watch video",
			weight: 8,
			properties: {
				videoCategory: ["funny", "educational", "inspirational", "music", "news", "sports", "cooking", "DIY", "travel", "gaming"],
				isFeaturedItem: [true, false, false],
				watchTimeSec: { "functionName": "weighNumRange", "args": [10, 600, 0.25] },
				quality: ["2160p", "1440p", "1080p", "720p", "480p", "360p", "240p"],
				format: ["mp4", "avi", "mov", "mpg"],
				uploader_id: { "functionName": "chance.guid", "args": [] } // Using chance.js library with dot notation
			}
		},
		{
			event: "view item",
			weight: 8,
			properties: {
				isFeaturedItem: [true, false, false],
				itemCategory: ["Books", "Movies", "Music", "Games", "Electronics", "Computers", "Smart Home", "Home", "Garden", "Pet", "Beauty", "Health", "Toys", "Kids", "Baby", "Handmade", "Sports", "Outdoors", "Automotive", "Industrial", "Entertainment", "Art", "Food", "Appliances", "Office", "Wedding", "Software"],
				dateItemListed: { "functionName": "date", "args": [30, true, "YYYY-MM-DD"] }
			}
		},
		{
			event: "save item",
			weight: 5,
			properties: {
				isFeaturedItem: [true, false, false],
				itemCategory: ["Books", "Movies", "Music", "Games", "Electronics", "Computers", "Smart Home", "Home", "Garden", "Pet", "Beauty", "Health", "Toys", "Kids", "Baby", "Handmade", "Sports", "Outdoors", "Automotive", "Industrial", "Entertainment", "Art", "Food", "Appliances", "Office", "Wedding", "Software"],
				dateItemListed: { "functionName": "date", "args": [30, true, "YYYY-MM-DD"] },
			}
		},
		{
			event: "sign up",
			isFirstEvent: true,
			weight: 1,
			properties: {
				wasReferred: [true, false, false, false],
			}
		},
		{
			event: "search",
			weight: 6,
			properties: {
				query: { "functionName": "chance.word", "args": [] },
				resultsFound: { "functionName": "weighNumRange", "args": [0, 100, 0.25] },
			}
		},
		{
			event: "remove from cart",
			weight: 1,
			properties: {
				amount: { "functionName": "weighNumRange", "args": [5, 500, 0.25] },
				reason: ["changed mind", "too expensive", "found better", "not needed"],
			}
		},
		{
			event: "share item",
			weight: 2,
			properties: {
				medium: ["email", "facebook", "twitter", "whatsapp", "sms", "slack"],
				recipient_count: { "functionName": "weighNumRange", "args": [1, 10] },
			}
		},
		{
			event: "session end",
			weight: 1
		}
	],

	/**
	 * superProps are properties that are added to EVERY event
	 * they can be simple values or functions that return a value
	 * the random values will be chosen for each event
	 * you MUST create superProps for every dungeon
	 */
	superProps: {
		plan: ["free", "free", "free", "plus", "plus", "pro"], // arrays are randomly sampled from
		// using arrow functions with the new format
		region: { "functionName": "arrow", "body": "chance.pickone(['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'])" }
	},

	/**
	 * userProps are properties that are associated with a user
	 * they can be simple values or functions that return a value
	 * this is the $set property on the user profile
	 * you MUST create userProps for every dungeon
	 */
	userProps: {
		favoriteBrand: ["nike", "adidas", "puma", "reebok", "new balance", "asics", "vans", "converse"],
		favoriteProduct: ["shoes", "clothing", "sports", "equipment"],
		// Example using chance.integer with options
		age: { "functionName": "chance.integer", "args": [{"min": 18, "max": 65}] },
		isSubscribed: [true, false],
		plan: ["free", "free", "free", "plus", "plus", "pro"],
		signupDate: { "functionName": "date", "args": [365, true, "YYYY-MM-DD"] },
		// Example using arrow function for complex expression
		user_id: { "functionName": "arrow", "body": "`user_${chance.guid()}`" },
		company: { "functionName": "chance.company", "args": [] },
		email: { "functionName": "chance.email", "args": [] },
		name: { "functionName": "chance.name", "args": [] }
	},

	/**
	 * funnels are sequences of events that represent a user journey
	 * each funnel has a sequence of events and a conversion rate
	 * the conversion rate determines how many users complete the funnel
	 * you can also add conditions to funnels to filter users based on properties
	 * you MUST create funnels for every dungeon
	 */
	funnels: [
		{
			sequence: ["sign up", "page view", "view item", "add to cart", "checkout"],
			conversionRate: 15,  // Integer 0-100 representing percentage
		},
		{
			sequence: ["page view", "watch video"],
			conversionRate: 65,
		},
		{
			sequence: ["page view", "view item", "save item"],
			conversionRate: 25,
			conditions: { plan: "free" }  // Conditions must be an object, not a string expression
		},
		{
			sequence: ["search", "view item", "add to cart"],
			conversionRate: 35
		},
		{
			sequence: ["page view", "view item", "share item"],
			conversionRate: 10
		}
	],

	/**
	 * scdProps are Slowly Changing Dimensions properties
	 * these are properties that change over time for users or groups
	 * each SCD property has a type (user or group), frequency, values, timing, and max changes
	 * OPTIONAL: only include if your use case involves properties that change over time
	 */
	scdProps: {
		role: {
			type: "user",
			frequency: "month", // how often the property changes
			values: ["admin", "user", "viewer", "editor"],
			timing: "fixed", // fixed or fuzzy
			max: 5 // maximum number of changes per entity
		},
		subscription_tier: {
			type: "user",
			frequency: "month", // Changed from "quarter" - valid options are: day, week, month, year
			values: ["free", "basic", "premium", "enterprise"],
			timing: "fuzzy", // Changed from "random" - valid options are: fixed, fuzzy
			max: 3
		}
	},

	/**
	 * groupKeys define the types of groups in your data
	 * Each group key is a tuple of [groupName, numberOfGroups]
	 *
	 * ⚠️ IMPORTANT: Groups are OPTIONAL and should ONLY be included when:
	 * - The use case explicitly involves B2B relationships
	 * - You have SaaS with company/team accounts
	 * - There's a clear one-to-many relationship (one company → many users)
	 * - Keywords mentioned: "company", "organization", "team", "workspace", "account"
	 *
	 * DO NOT include for B2C (business to consumer) scenarios
	 * DO NOT include unless explicitly needed for group analytics
	 */
	groupKeys: [
		["company_id", 1000], // 1000 companies
		["team_id", 5000] // 5000 teams
	],

	/**
	 * groupProps are properties associated with groups
	 * Similar to userProps but for group entities
	 *
	 * ⚠️ IMPORTANT: ONLY include if you have groupKeys defined
	 * These represent attributes of the group entities (companies, teams, etc.)
	 */
	groupProps: {
		company_id: {
			name: { "functionName": "chance.company", "args": [] },
			plan: ["startup", "growth", "enterprise"],
			employees: { "functionName": "weighNumRange", "args": [1, 5000, 0.3] },
			industry: { "functionName": "chance.pickone", "args": [["tech", "finance", "healthcare", "retail", "manufacturing"]] }
		},
		team_id: {
			name: { "functionName": "arrow", "body": "`Team ${chance.word()}`" },
			size: { "functionName": "weighNumRange", "args": [2, 50, 0.2] },
			department: ["engineering", "sales", "marketing", "support", "product"]
		}
	}
};

export default DUNGEON;