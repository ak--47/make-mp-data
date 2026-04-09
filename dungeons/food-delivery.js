import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "sdfsdf-needle-haystack-food-delivery-lets-go";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef  {import("../types.js").Dungeon} Config */

/**
 * NEEDLE IN A HAYSTACK - FOOD DELIVERY APP DESIGN
 *
 * QuickBite Delivery - A food delivery platform where users browse restaurants,
 * discover menu items, build favorites lists, and place orders. Think DoorDash/UberEats
 * with a focus on the discovery-to-loyalty pipeline.
 *
 * CORE USER LOOP:
 * Users sign up and browse restaurants by cuisine type, price, and rating. They view
 * individual menu items, favorite the ones they like, build carts, and place orders.
 * After delivery, they rate their experience. The app rewards engagement: users who
 * curate a favorites list of items they love tend to order more frequently and spend
 * more per order.
 *
 * DISCOVERY & FAVORITING:
 * The central mechanic is item discovery. Users browse and view menu items, and the
 * Gaussian relationship between views and favorites peaks at ~25 views → 5 favorites.
 * But 3 favorites is the "magic number" — users who favorite exactly 3 items have the
 * highest order values and most orders. Users who over-favorite (4+) are impulsive and
 * actually perform worse: lower order values, fewer views, fewer purchases.
 *
 * LOYALTY LOOP:
 * The magic number of 3 favorites is the key activation metric. Users who hit it
 * reorder frequently and spend more, especially with 10+ sessions. Users who
 * over-favorite are indecisive — they favorite everything but commit to nothing.
 * Users who never favorite anything disengage and churn at much higher rates.
 *
 * MONETIZATION MODEL:
 * - Delivery fees ($0-$10)
 * - Tips to drivers
 * - QuickBite+ subscription for free delivery
 * - Promotions and coupons for reactivation
 *
 * WHY THESE EVENTS/PROPERTIES?
 * - Events model the complete discovery → consideration → purchase → retention loop
 * - The view/favorite/order chain creates a clear behavioral funnel for analysis
 * - Session IDs enable session-depth analysis (key to Hook #3)
 * - Properties enable cohort analysis: cuisine, price tier, platform, city
 */

// Generate consistent IDs for entity references
const restaurantIds = v.range(1, 201).map(() => `rest_${v.uid(6)}`);
const itemIds = v.range(1, 401).map(() => `item_${v.uid(7)}`);
const orderIds = v.range(1, 5001).map(() => `order_${v.uid(8)}`);
const couponCodes = v.range(1, 51).map(() => `QUICK${v.uid(5).toUpperCase()}`);

const cuisineTypes = ["American", "Italian", "Chinese", "Japanese", "Mexican", "Indian", "Thai", "Mediterranean"];
const itemCategories = ["entree", "appetizer", "drink", "dessert", "side"];

/** @type {Config} */
const config = {
	token: "dbdf44f9b8f6527c71262030119de387",
	seed: SEED,
	numDays: days,
	numEvents: num_users * 120,
	numUsers: num_users,
	hasAnonIds: false,
	hasSessionIds: true,
	format: "json",
	gzip: true,
	alsoInferFunnels: false,
	hasLocation: true,
	hasAndroidDevices: true,
	hasIOSDevices: true,
	hasDesktopDevices: true,
	hasBrowser: false,
	hasCampaigns: false,
	isAnonymous: false,
	hasAdSpend: false,
	percentUsersBornInDataset: 35,
	hasAvatar: true,
	batchSize: 2_500_000,
	concurrency: 1,
	writeToDisk: false,
	scdProps: {},
	mirrorProps: {},
	lookupTables: [],

	events: [
		{
			event: "account created",
			weight: 1,
			isFirstEvent: true,
			properties: {
				signup_method: ["email", "google", "apple", "facebook"],
				referral_source: ["organic", "referral", "paid_ad", "social_media"],
			}
		},
		{
			event: "app opened",
			weight: 2,
			isSessionStartEvent: true,
			properties: {
				open_source: ["direct", "push_notification", "deeplink", "widget"],
			}
		},
		{
			event: "browse restaurants",
			weight: 15,
			properties: {
				cuisine_filter: cuisineTypes,
				sort_by: ["recommended", "distance", "rating", "price", "delivery_time"],
				price_filter: ["any", "$", "$$", "$$$", "$$$$"],
			}
		},
		{
			event: "search",
			weight: 10,
			properties: {
				search_query: () => chance.pickone([
					"pizza", "sushi", "burgers", "tacos", "pad thai",
					"chicken wings", "salad", "ramen", "pasta", "sandwiches",
					"burritos", "curry", "pho", "steak", "dumplings",
					"acai bowl", "falafel", "poke", "fried rice", "soup"
				]),
				results_count: u.weighNumRange(0, 50, 0.8, 30),
				search_type: ["dish", "restaurant", "cuisine"],
			}
		},
		{
			event: "restaurant viewed",
			weight: 14,
			properties: {
				restaurant_id: u.pickAWinner(restaurantIds),
				cuisine_type: cuisineTypes,
				avg_rating: u.weighNumRange(1, 5, 0.8, 30),
				delivery_time_est: u.weighNumRange(15, 75, 1.0, 35),
				price_tier: ["$", "$$", "$$$", "$$$$"],
			}
		},
		{
			event: "view menu item",
			weight: 16,
			properties: {
				item_id: u.pickAWinner(itemIds),
				item_category: itemCategories,
				item_price: u.weighNumRange(3, 55, 1.0, 25),
				restaurant_id: u.pickAWinner(restaurantIds),
				has_photo: u.pickAWinner([true, true, true, false]),
			}
		},
		{
			event: "favorite item",
			weight: 5,
			properties: {
				item_id: u.pickAWinner(itemIds),
				item_category: itemCategories,
				item_price: u.weighNumRange(3, 55, 1.0, 25),
				restaurant_id: u.pickAWinner(restaurantIds),
			}
		},
		{
			event: "add to cart",
			weight: 12,
			properties: {
				item_id: u.pickAWinner(itemIds),
				item_price: u.weighNumRange(3, 55, 1.0, 25),
				quantity: u.weighNumRange(1, 5, 2.0, 10),
				customization_count: u.weighNumRange(0, 4, 1.5, 15),
			}
		},
		{
			event: "remove from cart",
			weight: 3,
			properties: {
				item_id: u.pickAWinner(itemIds),
				removal_reason: ["changed_mind", "too_expensive", "substitution"],
			}
		},
		{
			event: "checkout started",
			weight: 8,
			properties: {
				cart_total: u.weighNumRange(10, 120, 0.8, 35),
				items_count: u.weighNumRange(1, 8, 1.2, 15),
				delivery_address_saved: u.pickAWinner([true, true, true, false]),
			}
		},
		{
			event: "order placed",
			weight: 7,
			properties: {
				order_id: u.pickAWinner(orderIds),
				payment_method: ["credit_card", "apple_pay", "google_pay", "debit_card", "paypal"],
				order_total: u.weighNumRange(12, 150, 0.8, 35),
				tip_amount: u.weighNumRange(0, 25, 1.5, 15),
				delivery_fee: u.weighNumRange(0, 10, 1.0, 15),
			}
		},
		{
			event: "order tracked",
			weight: 9,
			properties: {
				order_id: u.pickAWinner(orderIds),
				tracking_status: ["confirmed", "preparing", "picked_up", "en_route", "delivered"],
				eta_mins: u.weighNumRange(5, 60, 1.0, 25),
			}
		},
		{
			event: "order delivered",
			weight: 6,
			properties: {
				order_id: u.pickAWinner(orderIds),
				delivery_time_mins: u.weighNumRange(15, 80, 1.0, 35),
				on_time: u.pickAWinner([true, true, true, false]),
			}
		},
		{
			event: "order rated",
			weight: 5,
			properties: {
				order_id: u.pickAWinner(orderIds),
				food_rating: u.weighNumRange(1, 5, 0.8, 30),
				delivery_rating: u.weighNumRange(1, 5, 0.8, 30),
				would_reorder: u.pickAWinner([true, true, false]),
			}
		},
		{
			event: "promotion viewed",
			weight: 6,
			properties: {
				promo_type: ["banner", "push_notification", "in_feed", "email"],
				promo_value: ["10%", "15%", "20%", "25%", "$5 off", "$10 off", "free delivery"],
			}
		},
		{
			event: "coupon applied",
			weight: 3,
			properties: {
				coupon_code: u.pickAWinner(couponCodes),
				discount_type: ["percent", "flat", "free_delivery"],
				discount_value: u.weighNumRange(5, 40, 1.2, 15),
			}
		},
		{
			event: "reorder initiated",
			weight: 4,
			properties: {
				original_order_id: u.pickAWinner(orderIds),
				days_since_original: u.weighNumRange(1, 45, 1.5, 20),
			}
		},
		{
			event: "support contacted",
			weight: 2,
			properties: {
				issue_type: ["missing_item", "wrong_order", "late_delivery", "quality_issue", "refund_request", "app_bug"],
				order_id: u.pickAWinner(orderIds),
			}
		},
	],

	funnels: [
		{
			sequence: ["account created", "browse restaurants", "restaurant viewed"],
			isFirstFunnel: true,
			conversionRate: 75,
			timeToConvert: 0.5,
		},
		{
			sequence: ["view menu item", "add to cart", "checkout started", "order placed"],
			conversionRate: 50,
			timeToConvert: 1,
			weight: 5,
		},
		{
			sequence: ["browse restaurants", "restaurant viewed", "view menu item", "favorite item"],
			conversionRate: 35,
			timeToConvert: 2,
			weight: 3,
		},
		{
			sequence: ["order delivered", "order rated", "reorder initiated"],
			conversionRate: 40,
			timeToConvert: 24,
			weight: 2,
		},
	],

	superProps: {
		platform: ["iOS", "Android", "Web"],
		subscription_tier: u.pickAWinner(["Free", "Free", "Free", "Free", "QuickBite+"]),
		city: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "San Francisco", "Seattle", "Miami"],
	},

	userProps: {
		preferred_cuisine: cuisineTypes,
		avg_order_value: u.weighNumRange(15, 80, 0.8, 35),
		orders_per_month: u.weighNumRange(1, 15, 1.5, 8),
		account_age_days: u.weighNumRange(1, 365, 0.5, 60),
	},

	groupKeys: [
		["restaurant_id", 200, ["restaurant viewed", "order placed", "order rated"]],
	],

	groupProps: {
		restaurant_id: {
			name: () => `${chance.pickone(["The", "Big", "Lucky", "Golden", "Fresh", "Urban", "Tasty", "Royal"])} ${chance.pickone(["Kitchen", "Grill", "Bowl", "Wok", "Bistro", "Plate", "Table", "Fork"])}`,
			cuisine: cuisineTypes,
			avg_rating: u.weighNumRange(1, 5, 0.8, 30),
			delivery_radius_mi: u.weighNumRange(1, 12, 1.0, 8),
		}
	},

	/**
	 * ARCHITECTED ANALYTICS HOOKS
	 *
	 * This hook function creates 4 deliberate patterns in the data:
	 *
	 * 1. BELL CURVE: VIEW → FAVORITE RELATIONSHIP
	 *    Users who view ~25 menu items favorite ~5 (peak). Few views or 55+ views → 0.
	 *    The curve produces a range of 0-5 favorites across the user population.
	 *
	 * 2. MAGIC NUMBER: 3 FAVORITES = PEAK ORDER PERFORMANCE
	 *    Exactly 3 favorites is the sweet spot. These users get the highest order
	 *    values (1.6x) and extra orders. Users with 1-2 favorites get a small boost (1.15x).
	 *    Users with 4+ favorites (over-favoriters) are PENALIZED: lower order values (0.7x),
	 *    fewer orders, and fewer view events — they favorite impulsively without engaging deeply.
	 *
	 * 3. SESSION AMPLIFICATION
	 *    The magic-number boost is amplified for users with 10+ sessions (2.2x instead of 1.6x).
	 *
	 * 4. NO FAVORITES → CHURN
	 *    Users who never favorite an item churn significantly — 60% of their late events are removed.
	 */
	hook: function (record, type, meta) {

		if (type === "everything") {
			const userEvents = record;
			if (!userEvents || userEvents.length === 0) return record;

			// ═══════════════════════════════════════════════════════════════
			// HOOK 1: BELL CURVE — VIEWS → FAVORITES
			// Gaussian: peak at 25 views → 5 favorites. Sigma=12.
			// Users with ≤3 views are forced to 0 favorites.
			// Range: 0-5 favorites across the population.
			// ═══════════════════════════════════════════════════════════════

			// Count view menu item events
			let viewCount = 0;
			userEvents.forEach(e => {
				if (e.event === "view menu item") viewCount++;
			});

			// Gaussian: peak at 25 views → 5 favorites, sigma=12
			// Users with very few views (≤3) get forced to 0
			const rawTarget = Math.round(5 * Math.exp(-((viewCount - 25) ** 2) / (2 * 12 ** 2)));
			const targetFav = viewCount <= 3 ? 0 : rawTarget;

			// Count current favorites
			let currentFav = 0;
			userEvents.forEach(e => {
				if (e.event === "favorite item") currentFav++;
			});

			// Adjust favorites to match bell curve target
			if (currentFav > targetFav) {
				// Remove excess favorites (backwards to avoid index issues)
				let toRemove = currentFav - targetFav;
				for (let i = userEvents.length - 1; i >= 0 && toRemove > 0; i--) {
					if (userEvents[i].event === "favorite item") {
						userEvents.splice(i, 1);
						toRemove--;
					}
				}
			} else if (currentFav < targetFav) {
				// Add favorites near existing view events
				const viewEvents = userEvents.filter(e => e.event === "view menu item");
				const toAdd = targetFav - currentFav;
				for (let j = 0; j < toAdd && j < viewEvents.length; j++) {
					const sourceView = viewEvents[j];
					userEvents.push({
						event: "favorite item",
						time: dayjs(sourceView.time).add(chance.integer({ min: 10, max: 120 }), 'seconds').toISOString(),
						user_id: sourceView.user_id,
						item_id: sourceView.item_id,
						item_category: sourceView.item_category,
						item_price: sourceView.item_price,
						restaurant_id: sourceView.restaurant_id,
					});
				}
			}

			// ═══════════════════════════════════════════════════════════════
			// Recount favorites after adjustment
			// ═══════════════════════════════════════════════════════════════
			let favCount = 0;
			userEvents.forEach(e => {
				if (e.event === "favorite item") favCount++;
			});

			// ═══════════════════════════════════════════════════════════════
			// Count distinct sessions (for Hook 3)
			// ═══════════════════════════════════════════════════════════════
			const sessionSet = new Set();
			userEvents.forEach(e => {
				if (e.session_id) sessionSet.add(e.session_id);
			});
			const sessionCount = sessionSet.size;

			// ═══════════════════════════════════════════════════════════════
			// HOOK 2 + 3: MAGIC NUMBER (3 FAVORITES) + SESSION AMPLIFICATION
			//
			// Exactly 3 favorites = peak order performance (the sweet spot).
			// 1-2 favorites = small boost (engaged but haven't found the groove).
			// 4+ favorites = over-favoriters: penalized with lower order values,
			//   fewer orders, and fewer view events.
			// Session amplification only applies at the magic number.
			// ═══════════════════════════════════════════════════════════════
			if (favCount === 3) {
				// MAGIC NUMBER: maximum order boost
				const amplified = sessionCount > 10;
				const valueMultiplier = amplified ? 2.2 : 1.6;
				const dupeChance = amplified ? 60 : 35;

				for (let i = userEvents.length - 1; i >= 0; i--) {
					const event = userEvents[i];
					if (event.event === "order placed") {
						event.order_total = Math.round((event.order_total || 30) * valueMultiplier * 100) / 100;
						event.magic_number_customer = true;
						if (amplified) event.session_amplified = true;

						if (chance.bool({ likelihood: dupeChance })) {
							const extraOrder = {
								event: "order placed",
								time: dayjs(event.time).add(chance.integer({ min: 1, max: 5 }), 'days').toISOString(),
								user_id: event.user_id,
								order_id: chance.pickone(orderIds),
								payment_method: chance.pickone(["credit_card", "apple_pay", "google_pay", "debit_card"]),
								order_total: Math.round(chance.integer({ min: 25, max: 120 }) * valueMultiplier * 100) / 100,
								tip_amount: chance.integer({ min: 3, max: 20 }),
								delivery_fee: chance.integer({ min: 0, max: 8 }),
								magic_number_customer: true,
								bonus_order: true,
							};
							if (amplified) extraOrder.session_amplified = true;
							userEvents.splice(i + 1, 0, extraOrder);
						}
					}
				}
			} else if (favCount > 0 && favCount < 3) {
				// Below magic number: small boost (engaged but not at sweet spot)
				for (let i = 0; i < userEvents.length; i++) {
					if (userEvents[i].event === "order placed") {
						userEvents[i].order_total = Math.round((userEvents[i].order_total || 30) * 1.15 * 100) / 100;
					}
				}
			} else if (favCount > 3) {
				// Over-favoriters: PENALTY
				// Lower order values (0.7x) and remove ~30% of orders
				for (let i = userEvents.length - 1; i >= 0; i--) {
					if (userEvents[i].event === "order placed") {
						userEvents[i].order_total = Math.round((userEvents[i].order_total || 30) * 0.7 * 100) / 100;
						if (chance.bool({ likelihood: 30 })) {
							userEvents.splice(i, 1);
						}
					}
				}
				// Remove view events — scale with distance from magic number
				const excessFavs = favCount - 3;
				let viewsToRemove = Math.ceil(viewCount * Math.min(0.6, excessFavs * 0.25));
				for (let i = userEvents.length - 1; i >= 0 && viewsToRemove > 0; i--) {
					if (userEvents[i].event === "view menu item") {
						userEvents.splice(i, 1);
						viewsToRemove--;
					}
				}
			}

			// ═══════════════════════════════════════════════════════════════
			// HOOK 4: NO FAVORITES → CHURN
			// Users who never favorite any item lose ~60% of their events
			// from the second half of their timeline.
			// ═══════════════════════════════════════════════════════════════
			if (favCount === 0) {
				const midIdx = Math.floor(userEvents.length / 2);
				for (let i = userEvents.length - 1; i >= midIdx; i--) {
					if (chance.bool({ likelihood: 60 })) {
						userEvents.splice(i, 1);
					}
				}
			}

			return record;
		}

		return record;
	}
};

export default config;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NEEDLE IN A HAYSTACK - QUICKBITE DELIVERY ANALYTICS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * A food delivery app dungeon with 4 deliberately architected analytics
 * insights centered on the discovery-to-loyalty pipeline. The hooks create
 * a cascading behavioral pattern: views → favorites → orders → retention.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * DATASET OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * - 5,000 users over 100 days
 * - ~600K events across 18 event types
 * - 4 funnels (onboarding, order completion, discovery, reorder)
 * - Group analytics (200 restaurants)
 * - Subscription tiers (Free, QuickBite+)
 * - Session tracking enabled
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE 4 ARCHITECTED HOOKS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 1. BELL CURVE: VIEW → FAVORITE RELATIONSHIP (everything)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Bell-shaped relationship between menu item views and favorites.
 * The Gaussian peaks at ~25 views → 5 favorites. Users with ≤3 views get
 * forced to 0 favorites. The curve produces a distribution of 0-5 favorites
 * across the user population.
 *
 * MECHANISM: Gaussian formula: targetFav = round(5 * exp(-((views-25)^2) / (2*12^2)))
 *   0-3 views → 0 favorites (forced floor)
 *   5 views → 1 favorite
 *   10 views → 2 favorites
 *   13-14 views → 3 favorites (magic number zone)
 *   18-20 views → 4-5 favorites
 *   25 views → 5 favorites (Gaussian peak)
 *   37-38 views → 3 favorites (magic number zone, right side)
 *   50+ views → 1 favorite
 *   55+ views → 0 favorites
 *
 * HOW TO FIND IT:
 *   - Count "view menu item" events per user
 *   - Count "favorite item" events per user
 *   - Plot favorites vs. views — see clear bell curve peaking at ~25 views
 *   - Bucket users by view count and compute avg favorites per bucket
 *
 * EXPECTED INSIGHT: Clear inverted-U relationship. The bell curve peaks at
 * ~5 favorites for 25 views, with 0 at both extremes. Users are distributed
 * across 0-5 favorites, enabling the magic number analysis in Hook 2.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 2. MAGIC NUMBER: 3 FAVORITES = PEAK ORDER PERFORMANCE (everything)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: 3 favorites is the "magic number." Users with exactly 3 favorites
 * have the highest order values (1.6x boost) and the most orders (~35% extra
 * order duplication). Users with 1-2 favorites get a small boost (1.15x).
 * Users with 4+ favorites are PENALIZED: 0.7x order values, ~30% of orders
 * removed, and ~25-50% of view events removed (over-favoriters engage less
 * deeply with menu items).
 *
 * HOW TO FIND IT:
 *   - Segment users by favorite count: 0, 1-2, 3, 4+
 *   - Compare: avg order_total and order count per segment
 *   - 3 favorites should clearly dominate on both metrics
 *   - 4+ favorites should have the LOWEST order values (even below baseline)
 *   - 4+ favorites should also have fewer view events than 3-fav users
 *   - Filter: magic_number_customer = true
 *
 * EXPECTED INSIGHT: 3 favorites is the sweet spot. Users who favorite too
 * many items are impulsive and indecisive — they actually perform worse than
 * users who curate a focused favorites list.
 *
 * REAL-WORLD ANALOGUE: The "magic number" concept (like Facebook's "7 friends
 * in 10 days"). There's an optimal activation threshold — too little engagement
 * and users don't activate, too much and they're overwhelmed.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 3. SESSION AMPLIFICATION (everything)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: The magic-number boost is amplified for users with 10+ distinct
 * sessions. These users get 2.2x order value (vs 1.6x) and 60% order
 * duplication (vs 35%). Only applies to exactly-3-favorites users.
 *
 * HOW TO FIND IT:
 *   - Count distinct session_id values per user
 *   - Segment: 3 favorites AND 10+ sessions vs 3 favorites AND <10 sessions
 *   - Compare: order_total and order count between segments
 *   - Filter: session_amplified = true
 *
 * EXPECTED INSIGHT: The compound effect of magic number + session depth
 * creates the highest-value "power user" segment. Session amplification
 * only kicks in at the magic number — over-favoriters don't benefit.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 4. NO FAVORITES → CHURN (everything)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Users who never favorite any item experience severe churn. ~60%
 * of their events from the second half of their timeline are removed,
 * simulating disengagement and eventual abandonment.
 *
 * HOW TO FIND IT:
 *   - Segment users by: any favorite_item event vs none
 *   - Compare: median total event count per user (use median, not mean)
 *   - Look for ~60% fewer events in the 0-favorites group
 *
 * EXPECTED INSIGHT: Users without any favorites have roughly 60% fewer
 * events. They effectively "fade out" of the product.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVANCED ANALYSIS IDEAS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * CROSS-HOOK PATTERNS:
 *
 * 1. The Full Cascade: Track users from views → favorites → orders → retention.
 *    The bell curve (Hook 1) determines favorite count, which drives the magic
 *    number effect (Hook 2), amplified by sessions (Hook 3). Zero favorites
 *    triggers churn (Hook 4).
 *
 * 2. Over-Favoriting Paradox: Users who view more items and favorite more
 *    actually perform WORSE than those who curate a focused list of 3.
 *    This creates a non-obvious insight in the data.
 *
 * 3. Magic Number Discovery: What's the optimal number of favorites?
 *    Plot order value by favorite count — the peak at 3 is unmistakable.
 *
 * 4. Session-to-Activation Pipeline: How many sessions before a user hits
 *    the magic number? Do over-favoriters favorite too early?
 *
 * COHORT ANALYSIS:
 *
 * - Cohort by favorites count: 0, 1-2, 3 (magic), 4+
 * - Cohort by session depth: <10, 10+
 * - Cohort by view count bucket: 0-5, 6-10, 11-15, 16-25, 25+
 * - Cross-cohort: favorites × sessions matrix
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * EXPECTED METRICS SUMMARY
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Hook                    | Metric                  | Baseline | Hook Effect  | Ratio
 * ────────────────────────|─────────────────────────|──────────|──────────────|──────
 * Bell Curve              | Favorites at 25 views   | random   | ~5           | peak
 * Bell Curve              | Favorites at 50+ views  | random   | ~0-1         | zero
 * Magic Number (3 fav)    | Order total             | ~$70     | ~$143        | 2.0x
 * Magic Number (3 fav)    | Orders per user         | ~4       | ~9           | 2.3x
 * Over-Favoriter (4+ fav) | Order total             | ~$70     | ~$48         | 0.7x
 * Over-Favoriter (4+ fav) | Avg views               | ~16      | ~13          | lower
 * Session Amplification   | Order total (10+ sess)  | ~$143    | ~$153        | 2.2x
 * No Favorites → Churn    | Median events (0 fav)   | ~78      | ~27          | 0.35x
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */
