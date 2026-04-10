import Chance from 'chance';
const chance = new Chance();
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
 * SCD Test — dungeon focused on Slowly Changing Dimensions.
 * - 500 users over 30 days, ~50K events (CSV format)
 * - E-commerce events: checkout, add to cart, page view, watch video, view/save item
 * - User SCDs: role (weekly), NPS (daily)
 * - Group SCDs: MRR (monthly), AccountHealthScore (weekly), plan (monthly)
 * - 1,000 company groups with industry, segment, CSM assignments
 *
 * ═══════════════════════════════════════════════════════════════
 * ANALYTICS HOOKS (3 patterns)
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. SPEND TIERS (user hook)
 *    Users with luckyNumber > 250 = "high_spender", else "budget".
 *
 * 2. COUPON DISCOUNTS + WEEKEND VIEWING (event hook)
 *    Checkouts with coupons get discounted amounts. Weekend video
 *    watchers get 1.5x watch time with is_weekend: true.
 *
 *    Mixpanel Report:
 *    - Insights: "checkout", AVG(amount), breakdown by discount_applied
 *      Expected: discount_applied=true shows lower amounts
 *    - Insights: "watch video", AVG(watchTimeSec), breakdown by is_weekend
 *      Expected: weekend watch times ~1.5x higher
 *
 * 3. CART ABANDONMENT (everything hook)
 *    Users who add to cart but never checkout get a synthetic
 *    "cart_abandoned" event 30 min after last add-to-cart.
 *
 *    Mixpanel Report:
 *    - Insights: "cart_abandoned" total events
 *      Expected: visible volume of abandoned cart events
 */

/** @type {import('../types').Dungeon} */
const config = {
	token: "",
	seed: "simple is best",
	numDays: 30, //how many days worth1 of data
	numEvents: 50000, //how many events
	numUsers: 500, //how many users	
	format: 'csv', //csv or json
	region: "US",
	hasAnonIds: false, //if true, anonymousIds are created for each user
	hasSessionIds: false, //if true, hasSessionIds are created for each user
	hasAdSpend: false,
	hasLocation: true,
	hasAndroidDevices: true,
	hasIOSDevices: true,
	hasDesktopDevices: true,
	hasBrowser: true,
	hasCampaigns: true,
	isAnonymous: false,


	events: [
		{
			event: "checkout",
			weight: 2,
			properties: {
				amount: weighNumRange(5, 500, .25),
				currency: ["USD", "CAD", "EUR", "BTC", "ETH", "JPY"],
				coupon: weighChoices(["none", "none", "none", "none", "10%OFF", "20%OFF", "10%OFF", "20%OFF", "30%OFF", "40%OFF", "50%OFF"]),
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
				itemCategory: pickAWinner(itemCategories, integer(0, 27)),
				dateItemListed: date(30, true, 'YYYY-MM-DD'),
			}
		},
		{
			event: "page view",
			weight: 10,
			properties: {
				page: pickAWinner(["/", "/", "/help", "/account", "/watch", "/listen", "/product", "/people", "/peace"]),
				utm_source: pickAWinner(["$organic", "$organic", "$organic", "$organic", "google", "google", "google", "facebook", "facebook", "twitter", "linkedin"]),
			}
		},
		{
			event: "watch video",
			weight: 8,
			properties: {
				videoCategory: pickAWinner(videoCategories, integer(0, 9)),
				isFeaturedItem: [true, false, false],
				watchTimeSec: weighNumRange(10, 600, .25),
				quality: ["2160p", "1440p", "1080p", "720p", "480p", "360p", "240p"],
				format: ["mp4", "avi", "mov", "mpg"],
				uploader_id: chance.guid.bind(chance)

			}
		},
		{
			event: "view item",
			weight: 8,
			properties: {
				isFeaturedItem: [true, false, false],
				itemCategory: pickAWinner(itemCategories, integer(0, 27)),
				dateItemListed: date(30, true, 'YYYY-MM-DD'),
			}
		},
		{
			event: "save item",
			weight: 5,
			properties: {
				isFeaturedItem: [true, false, false],
				itemCategory: pickAWinner(itemCategories, integer(0, 27)),
				dateItemListed: date(30, true, 'YYYY-MM-DD'),
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
	superProps: {
		platform: ["web", "mobile", "web", "mobile", "web", "web", "kiosk", "smartTV"],
		currentTheme: weighChoices(["light", "dark", "custom", "light", "dark"]),
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
	scdProps: {
		role: {
			type: "user",
			frequency: "week",
			values: ["admin", "collaborator", "user", "view only", "no access"],
			timing: 'fuzzy',
			max: 10
		},
		NPS: {
			type: "user",
			frequency: "day",
			values: weighNumRange(1, 10, 2, 150),
			timing: 'fuzzy',
			max: 10
		},
		MRR: {
			type: "company_id",
			frequency: "month",
			values: weighNumRange(0, 10000, .15),
			timing: 'fixed',
			max: 10
		},
		AccountHealthScore: {
			type: "company_id",
			frequency: "week",
			values: weighNumRange(1, 10, .15),
			timing: 'fixed',
			max: 40
		},
		plan: {
			type: "company_id",
			frequency: "month",
			values: ["free", "basic", "premium", "enterprise"],
			timing: 'fixed',
			max: 10
		}
	},
	groupKeys: [["company_id", 1_000]],
	groupProps: {
		company_id: {
			name: () => { return chance.name(); },
			email: () => { return `CSM: ${chance.pickone(["AK", "Neha", "Rajiv", "Deepak", "Justin", "Hans", "Katie", "Somya", "Tony", "Kaan"])}`; },
			industry: [
				"technology",
				"education",
				"finance",
				"healthcare",
				"retail",
				"manufacturing",
				"transportation",
				"entertainment",
				"media",
				"real estate",
				"construction",
				"hospitality",
				"energy",
				"utilities",
				"agriculture",
				"other",
			],
			segment: ["SMB", "SMB", "SMB", "Mid Market", "Mid Market", "Enterprise"],
			"# active users": chance.integer({ min: 2, max: 20 })
		}
	},
	hook: function (record, type, meta) {
		// --- user hook: classify users into spending tiers ---
		if (type === "user") {
			record.spendTier = record.luckyNumber > 250 ? "high_spender" : "budget";
			return record;
		}

		// --- event hook: coupon users get discounted checkout amounts ---
		if (type === "event") {
			if (record.event === "checkout" && record.coupon && record.coupon !== "none") {
				const discountPct = parseInt(record.coupon) || 10;
				record.amount = Math.round(record.amount * (1 - discountPct / 100));
				record.discount_applied = true;
			}
			// weekend watchers get longer watch times
			if (record.event === "watch video" && record.time) {
				const day = dayjs(record.time).day();
				if (day === 0 || day === 6) {
					record.watchTimeSec = Math.round((record.watchTimeSec || 60) * 1.5);
					record.is_weekend = true;
				}
			}
			return record;
		}

		// --- everything hook: simulate cart abandonment ---
		if (type === "everything") {
			const hasAddToCart = record.some(e => e.event === "add to cart");
			const hasCheckout = record.some(e => e.event === "checkout");
			// users who added to cart but never checked out: remove checkout events (if any slipped through)
			// and mark them as abandoned
			if (hasAddToCart && !hasCheckout && record.length > 2) {
				const lastAdd = record.filter(e => e.event === "add to cart").pop();
				if (lastAdd) {
					record.push({
						event: "cart_abandoned",
						time: dayjs(lastAdd.time).add(30, "minute").toISOString(),
						user_id: lastAdd.user_id,
						platform: lastAdd.platform,
						amount: lastAdd.amount
					});
				}
			}
			return record;
		}

		return record;
	}
};



export default config;