/**
 * @fileoverview this is a highly verbose schema for a dungeon that shows all the options available
 * and how they might be implemented with extensive comments so an AI can understand it
 * it is not meant to be used as a template, but rather as a reference for how to create a dungeon
 * it is also used as a test for the AI to see if it can generate a dungeon with the same structure
 */



import Chance from "chance";
const chance = new Chance();
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);
import "dotenv/config";
import { weighNumRange, range, date, initChance, exhaust, choose, integer, decimal } from "../../lib/utils/utils.js";
const { NODE_ENV = "unknown" } = process.env;


/** @type {import("../../types.js").Dungeon} */
//SPLIT HERE
const DUNGEON = {

	/**
	 * events are the core building blocks of the dungeon
	 * each event has a name, a weight, and properties
	 * the weight determines how often the event occurs relative to other events
	 * properties are the data associated with the event
	 * they can be simple values or functions that return a value
	 * we have a few built-in functions to help you generate data
	 * you MUST create events for every dungeon
	 */
	events: [
		{
			event: "checkout",
			weight: 2,
			properties: {
				amount: weighNumRange(5, 500, .25), // this is ok if you need to pick a number from a range; params are min, max, skew (opt), and size (size of pool, also opt)
				currency: ["USD", "CAD", "EUR", "BTC", "ETH", "JPY"],
				coupon: ["none", "none", "none", "none", "10%OFF", "20%OFF", "10%OFF", "20%OFF", "30%OFF", "40%OFF", "50%OFF"],
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
				itemCategory: ["Books", "Movies", "Music", "Games", "Electronics", "Computers", "Smart Home", "Home", "Garden", "Pet", "Beauty", "Health", "Toys", "Kids", "Baby", "Handmade", "Sports", "Outdoors", "Automotive", "Industrial", "Entertainment", "Art", "Food", "Appliances", "Office", "Wedding", "Software"],
				dateItemListed: date(30, true, "YYYY-MM-DD") // this is ok if you need to pick a date from a range; params are intheLastDays, isPast, format
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
				watchTimeSec: weighNumRange(10, 600, .25),
				quality: ["2160p", "1440p", "1080p", "720p", "480p", "360p", "240p"],
				format: ["mp4", "avi", "mov", "mpg"],
				uploader_id: chance.guid.bind(chance), // You have access to the chance.js library for generating random data. You can assign a chance function directly to a property, like name: chance.company or uploader_id: chance.guid.
				video_id: range(1, 1000) // SEE LOOKUP TABLES BELOW

			}
		},
		{
			event: "view item",
			weight: 8,
			properties: {
				isFeaturedItem: [true, false, false],
				itemCategory: ["Books", "Movies", "Music", "Games", "Electronics", "Computers", "Smart Home", "Home", "Garden", "Pet", "Beauty", "Health", "Toys", "Kids", "Baby", "Handmade", "Sports", "Outdoors", "Automotive", "Industrial", "Entertainment", "Art", "Food", "Appliances", "Office", "Wedding", "Software"],
				dateItemListed: date(30, true, "YYYY-MM-DD"),
				product_id: range(1, 1000) // SEE LOOKUP TABLES BELOW
			}
		},
		{
			event: "save item",
			weight: 5,
			properties: {
				isFeaturedItem: [true, false, false],
				itemCategory: ["Books", "Movies", "Music", "Games", "Electronics", "Computers", "Smart Home", "Home", "Garden", "Pet", "Beauty", "Health", "Toys", "Kids", "Baby", "Handmade", "Sports", "Outdoors", "Automotive", "Industrial", "Entertainment", "Art", "Food", "Appliances", "Office", "Wedding", "Software"],
				dateItemListed: date(30, true, "YYYY-MM-DD"),
			}
		},
		{
			event: "sign up",
			isFirstEvent: true,
			weight: 0,
			properties: {
				variants: ["A", "B", "C", "Control"],
				flows: ["new", "existing", "loyal", "churned"],
				flags: ["on", "off"],
				experiment_ids: ["1234", "5678", "9012", "3456", "7890"],
				multiVariate: [true, false]
			}
		}
	],
	/**
	 * superProps are properties that are attached to every event
	 * they are selected randomly each time an event is generated
	 * they can be simple values or functions that return a value
	 * you will LIKELY create superProps for every dungeon
	 */
	superProps: {
		theme: ["light", "dark", "custom", "light", "dark"],
	},
	/**
	 * user properties work the same as event properties during the generation phase
	 * except each user has a single set of user properties
	 * these are properties that are attached to the user profile
	 * they can be simple values or functions that return a value
	 * you MUST create userProps for every dungeon
	 */
	userProps: {
		title: ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof.", "Sir", "Madam", "Lord", "Lady", "Dame", "Baron", "Baroness", "Count", "Countess", "Viscount", "Viscountess", "Marquis", "Marchioness"],
		role: ["basic", "basic", "basic", "premium", "admin"], // role property that can be used in funnel conditions
		luckyNumber: weighNumRange(42, 420, .3),
		spiritAnimal: ["duck", "dog", "otter", "penguin", "cat", "elephant", "lion", "cheetah", "giraffe", "zebra", "rhino", "hippo", "whale", "dolphin", "shark", "octopus", "squid", "jellyfish", "starfish", "seahorse", "crab", "lobster", "shrimp", "clam", "snail", "slug", "butterfly", "moth", "bee", "wasp", "ant", "beetle", "ladybug", "caterpillar", "centipede", "millipede", "scorpion", "spider", "tarantula", "tick", "mite", "mosquito", "fly", "dragonfly", "damselfly", "grasshopper", "cricket", "locust", "mantis", "cockroach", "termite", "praying mantis", "walking stick", "stick bug", "leaf insect", "lacewing", "aphid", "cicada", "thrips", "psyllid", "scale insect", "whitefly", "mealybug", "planthopper", "leafhopper", "treehopper", "flea", "louse", "bedbug", "flea beetle", "weevil", "longhorn beetle", "leaf beetle", "tiger beetle", "ground beetle", "lady beetle", "firefly", "click beetle", "rove beetle", "scarab beetle", "dung beetle", "stag beetle", "rhinoceus beetle", "hercules beetle", "goliath beetle", "jewel beetle", "tortoise beetle"]
	},
	/**
	 * Funnels represent intentional user journeys (e.g., sign-up, checkout), 
	 * composed of a sequence of events. 
	 * You should design at least one first-time funnel (e.g., onboarding) 
	 * and one recurring funnel (e.g., purchases or content browsing) 
	 * unless otherwise specified in the prompt.
	 * Funnels are the primary mechanism used to generate the example data, and it's critical sequences match events in the events array.
	 * there are many different options for the funnels like: 
	 * 	isFirstFunnel, conversionRate, isChurnFunnel, order, props, requireRepeats, timeToConvert, weight, conditions
	 * 
	 * isFirstFunnel are funnels a user will only go through once (like a sign up)
	 * non isFirstFunnel are funnels a user will go through multiple times (like a purchase)
	 * 
	 * conditions are used to filter which users are eligible for a specific funnel based on their user properties
	 * this is useful when different user segments should have different behavioral patterns
	 * for example: premium users might have access to advanced features, students vs teachers have different workflows
	 *
	 */
	funnels: [
		{
			name: "sign up funnel",
			description: "journey for users signing up",
			sequence: ["page view", "page view", "sign up"],
			isFirstFunnel: true,
			conversionRate: 50, // 50% of users will convert		
			order: "sequential", // events must occur in order
			requireRepeats: false, // users can repeat events in the funnel
			props: {}, // you can add properties to the funnel
			timeToConvert: 1, // time to convert in hours	
		},
		{
			name: "purchase funnel",
			description: "how users purchase items",
			sequence: ["page view", "view item", "add to cart", "checkout"],
			isFirstFunnel: false,
			conversionRate: 10,
			timeToConvert: 24,
			requireRepeats: true, // users can repeat events in the funnel
			order: "first-and-last-fixed"
		},
		{
			name: "browsing funnel",
			description: "how users browse items",
			sequence: ["page view", "view item", "watch video", "save item"],
			isFirstFunnel: false,
			conversionRate: 65,
			timeToConvert: 2,
			requireRepeats: true, // users can repeat events in the funnel
			order: "random",
			props: {
				"browsing type": ["casual", "intentional", "exploratory"] // you can add properties to the funnel
			}
		},
		{
			name: "premium user workflow",
			description: "advanced features only available to premium users",
			sequence: ["page view", "view item", "save item", "checkout"],
			isFirstFunnel: false,
			conversionRate: 85,
			timeToConvert: 3,
			conditions: {
				role: "premium" // only users with role "premium" are eligible for this funnel
			},
			order: "sequential",
			props: {
				"feature_tier": "premium"
			}
		}
	],
	/**
	 * scdProps are used for to represent slowly changing dimensions (at both a user and group level)
	 * these are properties that change over time, but not frequently
	 * and importantly we care about behaviors (events) during different epochs of SCD state
	 * you do NOT need to make SCD properties for every dungeon; only the ones with a use case for them
	 */
	scdProps: {
		role: {
			type: "user",
			frequency: "week",
			values: ["admin", "collaborator", "user", "view only", "no access"],
			timing: "fuzzy",
			max: 10
		},
		NPS: {
			type: "user",
			frequency: "day",
			values: weighNumRange(1, 10, 2, 150),
			timing: "fuzzy",
			max: 10
		},
		MRR: {
			type: "company_id",
			frequency: "month",
			values: weighNumRange(0, 10000, .15),
			timing: "fixed",
			max: 10
		},
		AccountHealthScore: {
			type: "company_id",
			frequency: "week",
			values: weighNumRange(1, 10, .15),
			timing: "fixed",
			max: 40
		},
		plan: {
			type: "company_id",
			frequency: "month",
			values: ["free", "basic", "premium", "enterprise"],
			timing: "fixed",
			max: 10
		}
	},


	/**
	 * groupKeys are used to represent entities for custom uniqueBy analysis
	 * they are an array of arrays, where each inner array is a pair of group_key and the number of profiles for that key
	 * this is useful for group analysis, where you want to analyze data by groups of users (by company, institution, school, etc...)
	 * groups have props too (they can also have events) ... but there can be more than one "group entity"
	 * you do NOT need to make groupKeys for every dungeon; only the ones with a use case for them
	 */
	groupKeys: [
		["company_id", 500, []],
		["room_id", 10000, ["save video", "comment", "watch video"]]
	],
	groupProps: {
		company_id: {
			name: () => { return chance.company(); }, // YOU CAN USE CHANCE IT"S BUILT IN!
			email: () => { return `CSM: ${chance.pickone(["AK", "Jessica", "Michelle", "Dana", "Brian", "Dave"])}`; },
			"# of employees": weighNumRange(3, 10000),
			"industry": ["tech", "finance", "healthcare", "education", "government", "non-profit"],
			"segment": ["enterprise", "SMB", "mid-market"],
			"products": [["core"], ["core"], ["core", "add-ons"], ["core", "pro-serve"], ["core", "add-ons", "pro-serve"], ["core", "BAA", "enterprise"], ["free"], ["free"], ["free", "addons"]],
		},
		room_id: {
			name: () => { return `#${chance.word({ length: integer(4, 24), capitalize: true })}`; },
			email: ["public", "private"],
			"room provider": ["partner", "core", "core", "core"],
			"room capacity": weighNumRange(3, 1000000),
			"isPublic": [true, false, false, false, false],
			"country": chance.country.bind(chance),
			"isVerified": [true, true, false, false, false],
		}
	},

	/**
	 * groupEvents are used to represent events that are associated with a group that occur
	 * regularly (like a card charged, or a subscription renewed)
	 * they are generally NOT attributed to a user, but rather to a group entity
	 * you do NOT need to make groupEvents for every dungeon; only the ones with a use case for them
	 */
	groupEvents: [
		{
			attribute_to_user: false,
			event: "card charged",
			weight: 1,

			frequency: 30,
			group_key: "company_id",
			group_size: 500,
			properties: {
				amount: weighNumRange(5, 500, .25),
				currency: ["USD", "USD", "USD", "CAD", "EUR", "EUR", "BTC", "BTC", "ETH", "JPY"],
				plan: ["basic", "premium", "enterprise"],
				"payment method": []
			}
		}],

	/**
	 * lookupTables are used to represent static data that can be used in events
	 * they are an array of objects, where each object is a key-value pair
	 * this is useful for representing static data that can be used in events
	 * like product information, user information, etc...
	 * you do NOT need to make lookupTables for every dungeon; only the ones with a use case for them
	 * if you DO make a lookupTable, you MUST provide a key in some events whose value will be numerical
	 */
	lookupTables: [{
		key: "product_id",
		entries: 1000,
		attributes: {
			category: [
				"Books", "Movies", "Music", "Games", "Electronics", "Computers", "Smart Home", "Home", "Garden & Tools", "Pet Supplies", "Food & Grocery", "Beauty", "Health", "Toys", "Kids", "Baby", "Handmade", "Sports", "Outdoors", "Automotive", "Industrial", "Entertainment", "Art"
			],
			"demand": ["high", "medium", "medium", "low"],
			"supply": ["high", "medium", "medium", "low"],
			"manufacturer": chance.company.bind(chance),
			"price": weighNumRange(5, 500, .25),
			"rating": weighNumRange(1, 5),
			"reviews": weighNumRange(0, 35)
		}

	},
	{
		key: "video_id",
		entries: 50000,
		attributes: {
			isFlagged: [true, false, false, false, false],
			copyright: ["all rights reserved", "creative commons", "creative commons", "public domain", "fair use"],
			uploader_id: chance.guid.bind(chance),
			"uploader influence": ["low", "low", "low", "medium", "medium", "high"],
			thumbs: weighNumRange(0, 35),
			rating: ["G", "PG", "PG-13", "R", "NC-17", "PG-13", "R", "NC-17", "R", "PG", "PG"]
		}

	}],
};
