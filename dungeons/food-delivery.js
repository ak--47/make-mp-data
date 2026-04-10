import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "dm4-food-delivery";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef  {import("../types.d.ts").Dungeon} Config */

/**
 * ===============================================================================
 * DATASET OVERVIEW
 * ===============================================================================
 *
 * QuickBite Delivery - A food delivery platform modeled after DoorDash/UberEats,
 * focused on the discovery-to-loyalty pipeline: users browse restaurants, discover
 * menu items, build favorites lists, and place orders.
 *
 * CORE USER LOOP:
 * Sign up -> browse restaurants -> view menu items -> favorite items -> build cart
 * -> checkout -> order -> delivery -> rate -> reorder
 *
 * The central mechanic is item discovery and favoriting. Users who curate a focused
 * favorites list (exactly 3 items) have the highest order values and most orders.
 * Over-favoriters (4+) are impulsive and actually perform worse. Users who never
 * favorite anything churn at high rates.
 *
 * SCALE:
 * - 5,000 users over 100 days (~600K events)
 * - 18 event types, 4 funnels (onboarding, order, discovery, reorder)
 * - 200 restaurants (group analytics)
 * - Subscription tiers: Free, QuickBite+
 * - Session tracking enabled
 */

/**
 * ===============================================================================
 * ANALYTICS HOOKS
 * ===============================================================================
 *
 * 4 deliberately architected hooks centered on the discovery-to-loyalty pipeline.
 * The hooks create a cascading behavioral pattern: views -> favorites -> orders -> retention.
 *
 * ---------------------------------------------------------------------------
 * 1. BELL CURVE: VIEW -> FAVORITE RELATIONSHIP (everything hook)
 * ---------------------------------------------------------------------------
 *
 * PATTERN: Bell-shaped relationship between menu item views and favorites.
 * Gaussian peaks at ~25 views -> 5 favorites. Users with <=3 views get 0 favorites.
 * Formula: targetFav = round(5 * exp(-((views-25)^2) / (2*12^2)))
 *
 * MIXPANEL REPORT:
 *   1. Insights > Segmentation
 *   2. Count "view menu item" per user -> bucket into ranges
 *   3. Count "favorite item" per user
 *   4. Plot favorites vs. views -- clear bell curve peaking at ~25 views
 *   5. Bucket users by view count, compute avg favorites per bucket
 *
 * EXPECTED: Inverted-U peaking at ~5 favorites for 25 views, 0 at both extremes.
 *
 * ---------------------------------------------------------------------------
 * 2. MAGIC NUMBER: 3 FAVORITES = PEAK ORDER PERFORMANCE (everything hook)
 * ---------------------------------------------------------------------------
 *
 * PATTERN: Exactly 3 favorites is the sweet spot.
 *   - 3 favorites: 1.6x order values, ~35% extra order duplication
 *   - 1-2 favorites: 1.15x small boost
 *   - 4+ favorites: PENALIZED -- 0.7x order values, ~30% orders removed, views removed
 *
 * MIXPANEL REPORT:
 *   1. Insights > Segmentation
 *   2. Segment users by favorite count: 0, 1-2, 3, 4+
 *   3. Compare avg order_total and order count per segment
 *   4. Filter: magic_number_customer = true to isolate the effect
 *   5. Verify 4+ favorites has LOWEST order values (even below baseline)
 *
 * EXPECTED: 3 favorites dominates on order value and count. Over-favoriters
 * are impulsive and indecisive -- they perform worse than focused curators.
 * Real-world analogue: Facebook's "7 friends in 10 days" activation threshold.
 *
 * ---------------------------------------------------------------------------
 * 3. SESSION AMPLIFICATION (everything hook)
 * ---------------------------------------------------------------------------
 *
 * PATTERN: Magic-number boost is amplified for users with 10+ distinct sessions.
 * These users get 2.2x order value (vs 1.6x) and 60% order duplication (vs 35%).
 * Only applies to exactly-3-favorites users.
 *
 * MIXPANEL REPORT:
 *   1. Insights > Segmentation
 *   2. Count distinct session_id per user
 *   3. Segment: 3 favorites AND 10+ sessions vs 3 favorites AND <10 sessions
 *   4. Compare order_total and order count between segments
 *   5. Filter: session_amplified = true
 *
 * EXPECTED: Compound effect of magic number + session depth creates the
 * highest-value "power user" segment.
 *
 * ---------------------------------------------------------------------------
 * 4. NO FAVORITES -> CHURN (everything hook)
 * ---------------------------------------------------------------------------
 *
 * PATTERN: Users who never favorite any item lose ~60% of their events from
 * the second half of their timeline, simulating disengagement and abandonment.
 *
 * MIXPANEL REPORT:
 *   1. Insights > Segmentation
 *   2. Segment users: any "favorite item" event vs none
 *   3. Compare median total event count per user (use median, not mean)
 *   4. Look for ~60% fewer events in the 0-favorites group
 *
 * EXPECTED: 0-favorites users have ~60% fewer events. They fade out.
 *
 * ---------------------------------------------------------------------------
 * ADVANCED ANALYSIS IDEAS
 * ---------------------------------------------------------------------------
 *
 * CROSS-HOOK PATTERNS:
 *   - Full Cascade: views -> favorites -> orders -> retention (Hooks 1-4 chain)
 *   - Over-Favoriting Paradox: more favorites = WORSE performance past 3
 *   - Magic Number Discovery: plot order value by favorite count, peak at 3
 *   - Session-to-Activation: how many sessions before hitting magic number?
 *
 * COHORT ANALYSIS:
 *   - By favorites count: 0, 1-2, 3 (magic), 4+
 *   - By session depth: <10, 10+
 *   - By view count bucket: 0-5, 6-10, 11-15, 16-25, 25+
 *   - Cross-cohort: favorites x sessions matrix
 *
 * ---------------------------------------------------------------------------
 * EXPECTED METRICS SUMMARY
 * ---------------------------------------------------------------------------
 *
 * Hook                    | Metric                  | Baseline | Hook Effect  | Ratio
 * ------------------------|-------------------------|----------|--------------|------
 * Bell Curve              | Favorites at 25 views   | random   | ~5           | peak
 * Bell Curve              | Favorites at 50+ views  | random   | ~0-1         | zero
 * Magic Number (3 fav)    | Order total             | ~$70     | ~$143        | 2.0x
 * Magic Number (3 fav)    | Orders per user         | ~4       | ~9           | 2.3x
 * Over-Favoriter (4+ fav) | Order total             | ~$70     | ~$48         | 0.7x
 * Over-Favoriter (4+ fav) | Avg views               | ~16      | ~13          | lower
 * Session Amplification   | Order total (10+ sess)  | ~$143    | ~$153        | 2.2x
 * No Favorites -> Churn   | Median events (0 fav)   | ~78      | ~27          | 0.35x
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
