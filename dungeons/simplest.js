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
 * Simplest E-Commerce App — the minimal dungeon with no hooks.
 * - 2,500 users over 100 days, ~250K events
 * - 25 event types covering browse, search, cart, checkout,
 *   notifications, reviews, wishlists, rewards
 * - 11 funnels (signup, purchase, content, browse-to-cart, etc.)
 * - No device/location/campaign data — pure event stream
 *
 * ═══════════════════════════════════════════════════════════════
 * ANALYTICS HOOKS
 * ═══════════════════════════════════════════════════════════════
 *
 * None — this is a baseline dungeon with a no-op hook function.
 * Use it for testing core generation, funnel inference, or as a
 * starting template for new dungeons.
 */

/** @type {import('../types.js').Dungeon} */
const config = {
	token: "",
	seed: "simple is best",
	numDays: 100, //how many days worth1 of data
	numEvents: 250_000, //how many events
	numUsers: 2_500, //how many users
	format: 'json', //csv or json
	region: "US",
	hasAnonIds: false, //if true, anonymousIds are created for each user
	hasSessionIds: false, //if true, hasSessionIds are created for each user
	hasAdSpend: false,
	hasLocation: false,
	hasAndroidDevices: false,
	hasIOSDevices: false,
	hasDesktopDevices: false,
	hasBrowser: false,
	hasCampaigns: false,
	isAnonymous: false,
	alsoInferFunnels: false,
	concurrency: 1,
	batchSize: 2_500_000,
	writeToDisk: false,

	events: [
		{
			event: "page view",
			weight: 10,
			properties: {
				page: pickAWinner(["/", "/", "/help", "/account", "/pricing", "/product", "/about", "/blog"]),
				utm_source: pickAWinner(["$organic", "$organic", "$organic", "$organic", "google", "google", "google", "facebook", "facebook", "twitter", "linkedin"]),
			}
		},
		{
			event: "sign up",
			weight: 1,
			isFirstEvent: true,
			properties: {
				signupMethod: ["email", "google", "facebook", "github"],
				referral: weighChoices(["none", "none", "none", "friend", "ad", "ad", "friend", "friend"]),
			}
		},
		{
			event: "login",
			weight: 8,
			properties: {
				method: ["password", "google", "facebook", "github"],
			}
		},
		{
			event: "search",
			weight: 7,
			properties: {
				query_length: weighNumRange(1, 50),
				resultsReturned: weighNumRange(0, 100, .25),
				category: pickAWinner(itemCategories, integer(0, 27)),
			}
		},
		{
			event: "view item",
			weight: 9,
			properties: {
				isFeaturedItem: [true, false, false],
				itemCategory: pickAWinner(itemCategories, integer(0, 27)),
				price: weighNumRange(5, 500, .25),
				rating: weighNumRange(1, 5),
			}
		},
		{
			event: "add to cart",
			weight: 5,
			properties: {
				amount: weighNumRange(5, 500, .25),
				itemCategory: pickAWinner(itemCategories, integer(0, 27)),
				numItems: weighNumRange(1, 5),
			}
		},
		{
			event: "checkout",
			weight: 3,
			properties: {
				amount: weighNumRange(10, 500, .25),
				currency: ["USD", "CAD", "EUR", "JPY"],
				coupon: weighChoices(["none", "none", "none", "none", "10%OFF", "20%OFF", "30%OFF"]),
				numItems: weighNumRange(1, 10),
			}
		},
		{
			event: "watch video",
			weight: 6,
			properties: {
				videoCategory: pickAWinner(videoCategories, integer(0, 9)),
				watchTimeSec: weighNumRange(10, 600, .25),
				quality: ["1080p", "720p", "480p", "360p"],
			}
		},
		{
			event: "share content",
			weight: 2,
			properties: {
				platform: ["twitter", "facebook", "linkedin", "email", "link"],
				contentType: ["video", "product", "article"],
			}
		},
		{
			event: "rate item",
			weight: 4,
			properties: {
				rating: weighNumRange(1, 5),
				itemCategory: pickAWinner(itemCategories, integer(0, 27)),
				hasReviewText: [true, false, false, false],
			}
		},
		// weight 1 used by sign up (isFirstEvent)
		// weights 1-10 across 26 events; some sharing is unavoidable
		// but no two adjacent events share a weight
		{
			event: "support ticket",
			weight: 2,
			properties: {
				priority: weighChoices(["low", "low", "medium", "medium", "medium", "high"]),
				category: ["billing", "technical", "account", "shipping", "returns"],
			}
		},
		{
			event: "add to wishlist",
			weight: 4,
			properties: {
				itemCategory: pickAWinner(itemCategories, integer(0, 27)),
				price: weighNumRange(5, 500, .25),
			}
		},
		{
			event: "remove from cart",
			weight: 3,
			properties: {
				reason: weighChoices(["changed mind", "too expensive", "found better", "duplicate", "changed mind", "changed mind"]),
			}
		},
		{
			event: "apply coupon",
			weight: 2,
			properties: {
				couponCode: weighChoices(["SAVE10", "SAVE20", "WELCOME", "FREESHIP", "VIP30", "SAVE10", "SAVE10"]),
				discountPercent: weighNumRange(5, 50),
			}
		},
		{
			event: "notification received",
			weight: 7,
			properties: {
				channel: ["push", "email", "in-app", "sms"],
				type: ["promo", "order update", "recommendation", "reminder"],
			}
		},
		{
			event: "notification clicked",
			weight: 5,
			properties: {
				channel: ["push", "email", "in-app", "sms"],
				type: ["promo", "order update", "recommendation", "reminder"],
			}
		},
		{
			event: "add payment method",
			weight: 1,
			properties: {
				type: ["credit card", "debit card", "paypal", "apple pay", "google pay"],
			}
		},
		{
			event: "update profile",
			weight: 3,
			properties: {
				field: ["avatar", "name", "email", "address", "phone", "preferences"],
			}
		},
		{
			event: "invite friend",
			weight: 1,
			properties: {
				method: ["email", "link", "sms"],
			}
		},
		{
			event: "view category",
			weight: 8,
			properties: {
				category: pickAWinner(itemCategories, integer(0, 27)),
				sortBy: ["popular", "newest", "price low", "price high", "rating"],
			}
		},
		{
			event: "save address",
			weight: 1,
			properties: {
				type: ["home", "work", "other"],
			}
		},
		{
			event: "compare items",
			weight: 3,
			properties: {
				numItems: weighNumRange(2, 5),
				itemCategory: pickAWinner(itemCategories, integer(0, 27)),
			}
		},
		{
			event: "subscribe newsletter",
			weight: 1,
			properties: {
				frequency: ["daily", "weekly", "monthly"],
				topics: pickAWinner(["deals", "new arrivals", "recommendations", "deals", "deals"]),
			}
		},
		{
			event: "leave review",
			weight: 2,
			properties: {
				rating: weighNumRange(1, 5),
				wordCount: weighNumRange(10, 200, .25),
				hasPhotos: [true, false, false, false, false],
			}
		},
		{
			event: "redeem reward",
			weight: 1,
			properties: {
				rewardType: ["discount", "free shipping", "free item", "points bonus"],
				pointsUsed: weighNumRange(100, 5000, .25),
			}
		},

	],
	funnels: [
		{
			sequence: ["page view", "sign up"],
			conversionRate: 55,
			order: "sequential",
			weight: 5,
			isFirstFunnel: true,
			timeToConvert: 1,
			name: "Signup Funnel"
		},
		{
			sequence: ["search", "view item", "add to cart", "checkout"],
			conversionRate: 35,
			order: "sequential",
			weight: 8,
			timeToConvert: 3,
			name: "Purchase Funnel"
		},
		{
			sequence: ["page view", "watch video", "share content"],
			conversionRate: 40,
			order: "sequential",
			weight: 6,
			timeToConvert: 2,
			name: "Content Engagement"
		},
		{
			sequence: ["view item", "rate item"],
			conversionRate: 25,
			order: "sequential",
			weight: 3,
			timeToConvert: 5,
			name: "Review Funnel"
		},
		{
			sequence: ["view category", "view item", "compare items", "add to cart"],
			conversionRate: 30,
			order: "sequential",
			weight: 7,
			timeToConvert: 3,
			name: "Browse to Cart"
		},
		{
			sequence: ["notification received", "notification clicked", "view item"],
			conversionRate: 45,
			order: "sequential",
			weight: 4,
			timeToConvert: 1,
			name: "Notification Engagement"
		},
		{
			sequence: ["view item", "add to wishlist", "apply coupon", "add to cart", "checkout"],
			conversionRate: 20,
			order: "sequential",
			weight: 2,
			timeToConvert: 7,
			name: "Wishlist to Purchase"
		},
		{
			sequence: ["checkout", "leave review", "invite friend"],
			conversionRate: 15,
			order: "sequential",
			weight: 1,
			timeToConvert: 14,
			name: "Post-Purchase Advocacy"
		},
		{
			sequence: ["login", "view item", "add to cart", "apply coupon", "checkout"],
			conversionRate: 30,
			order: "sequential",
			weight: 9,
			timeToConvert: 2,
			name: "Coupon Purchase Flow"
		},
		{
			sequence: ["subscribe newsletter", "notification received", "notification clicked", "checkout"],
			conversionRate: 10,
			order: "sequential",
			weight: 3,
			timeToConvert: 14,
			name: "Newsletter to Purchase"
		},
		{
			sequence: ["support ticket", "update profile", "checkout"],
			conversionRate: 20,
			order: "sequential",
			weight: 10,
			timeToConvert: 7,
			name: "Support Recovery"
		},

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

		// no hooks!
		return record;
	}
};




export default config;