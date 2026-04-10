import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "harness-food";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef  {import("../types.d.ts").Dungeon} Config */

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * DATASET OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * QuickBite — a food delivery platform (DoorDash/Uber Eats style).
 * Users browse restaurants, build carts, place orders, track deliveries,
 * and rate their experiences.
 *
 * Scale: 5,000 users · 600K events · 100 days · 17 event types
 *
 * Core loop:
 *   sign up → browse/search restaurants → add items to cart →
 *   checkout → order placed → track delivery → rate → reorder
 *
 * Restaurant ecosystem: 200 restaurants across 8 cuisine types,
 * four price tiers ($–$$$$), modeled as group profiles.
 *
 * Monetization: delivery fees, QuickBite+ subscription ($9.99/mo or
 * $79.99/yr for free delivery), and promotional coupons.
 *
 * Support & retention: support tickets (missing items, wrong orders,
 * late delivery, quality, refunds) and reorder events model service
 * quality and repeat behavior.
 *
 * Subscription tiers: Free vs QuickBite+ create a natural A/B
 * comparison for monetization and retention analysis.
 */

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * ANALYTICS HOOKS (8 architected patterns)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 1. LUNCH RUSH CONVERSION (funnel-pre)
 *    Funnel conversion boosted during meal hours: lunch 1.4x, dinner 1.2x.
 *    Mixpanel:
 *      • Funnels → "checkout started" → "order placed" → "order delivered"
 *        Breakdown: "lunch_rush" → expect ~84% vs ~60% baseline
 *      • Same funnel, breakdown: "dinner_rush" → expect ~72% vs ~60%
 *
 * 2. COUPON INJECTION (funnel-post)
 *    Free-tier users get coupon_applied spliced into funnels 30% of the time.
 *    Mixpanel:
 *      • Insights → "coupon applied" → breakdown "coupon_injected"
 *        → ~30% of Free-tier coupons are injected
 *      • Insights → "coupon applied" → breakdown "subscription_tier"
 *        → Free users have more coupon events
 *
 * 3. LATE NIGHT MUNCHIES (event)
 *    10PM–2AM: 70% American cuisine, 1.3x item prices, late_night_order=true.
 *    Mixpanel:
 *      • Insights → "restaurant viewed" → breakdown "cuisine_type"
 *        filter: late_night_order=true → ~70% American vs ~12% daytime
 *      • Insights → "item added to cart" → avg "item_price"
 *        breakdown: "late_night_order" → 1.3x higher at night
 *
 * 4. RAINY WEEK SURGE (event + everything)
 *    Days 20–27: delivery fees 2x, surge_pricing=true, 40% order duplication.
 *    Mixpanel:
 *      • Insights (line) → "order placed" → daily → visible spike days 20–27
 *      • Insights → "order placed" → avg "delivery_fee"
 *        breakdown: "surge_pricing" → 2x higher
 *
 * 5. REFERRAL POWER USERS (everything)
 *    Referred users: 2x reorders, food_rating 4–5 stars, referral_user=true.
 *    Mixpanel:
 *      • Insights → "reorder initiated" → per user
 *        breakdown: "referral_user" → ~2x more reorders
 *      • Insights → "order rated" → avg "food_rating"
 *        breakdown: "referral_user" → 4–5 vs ~3.5 baseline
 *
 * 6. TRIAL CONVERSION (everything)
 *    Trial subs with 3+ orders in 14 days retained; others lose 60% of events.
 *    Mixpanel:
 *      • Insights → any event → per user
 *        breakdown: "trial_retained" → sustained vs ~60% drop
 *      • Retention → "subscription started" (trial=true) → "order placed"
 *        → sharp drop after day 14 for non-retained
 *
 * 7. SUPPORT TICKET CHURN (user)
 *    15% of users flagged is_high_risk=true with churn_risk_score 70–100.
 *    Mixpanel:
 *      • Insights → any event → unique users
 *        breakdown: user "is_high_risk" → ~15% high-risk
 *      • Insights → breakdown: user "churn_risk_score"
 *        → bimodal: 85% at 0–40, 15% at 70–100
 *
 * 8. FIRST ORDER BONUS (funnel-pre)
 *    New users get 1.4x conversion boost on checkout→order funnel.
 *    Mixpanel:
 *      • Funnels → "checkout started" → "order placed" → "order delivered"
 *        breakdown: "first_order_bonus" → 1.4x higher conversion
 *      • Insights → "order placed" → breakdown "first_order_bonus"
 *        → ~50% tagged (hash-based user split)
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * ADVANCED ANALYSIS IDEAS
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * Cross-hook patterns:
 *   • The Perfect Customer: referral (5) + trial retained (6) + lunch rush (1)
 *     + low churn risk (7) → exceptional LTV and retention
 *   • Rainy Night Double Whammy: late-night (3) + rainy week (4)
 *     → compounded surge pricing?
 *   • Coupon-Driven Trial: injected coupons (2) → trial starts (6)?
 *   • Referral + First Order: hooks 5 + 8 → highest conversion rates
 *   • Support and Churn: high-risk (7) + support tickets during rainy week (4)
 *
 * Cohort analysis:
 *   • Signup week (rainy week cohort behaves differently)
 *   • Referral vs organic lifecycle
 *   • Free vs QuickBite+ across all metrics
 *   • City-level cuisine and ordering patterns
 *
 * Funnel analysis:
 *   • Onboarding: account created → first restaurant view, by signup method
 *   • Order: checkout → delivery, by platform / tier / time of day
 *   • Discovery: search type → conversion to ordering
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * EXPECTED METRICS SUMMARY
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * Hook                  | Metric               | Baseline | Hook Effect | Ratio
 * ──────────────────────|──────────────────────|──────────|─────────────|──────
 * Lunch Rush            | Funnel conversion    | 60%      | 84%         | 1.4x
 * Coupon Injection      | Free user coupons    | 0%       | 30%         | N/A
 * Late Night Munchies   | American cuisine %   | ~15%     | 70%         | ~4.7x
 * Rainy Week Surge      | Order volume         | 100%     | 140%        | 1.4x
 * Referral Power Users  | Reorder frequency    | 1x       | 2x          | 2.0x
 * Trial Conversion      | Post-trial retention | 100%     | 40%         | 0.4x
 * Support Ticket Churn  | High-risk users      | 0%       | 15%         | N/A
 * First Order Bonus     | New user conversion  | 1x       | 1.4x        | 1.4x
 */

// Generate consistent IDs for lookup tables and event properties
const restaurantIds = v.range(1, 201).map(n => `rest_${v.uid(6)}`);
const itemIds = v.range(1, 301).map(n => `item_${v.uid(7)}`);
const orderIds = v.range(1, 5001).map(n => `order_${v.uid(8)}`);
const couponCodes = v.range(1, 51).map(n => `QUICK${v.uid(5).toUpperCase()}`);

/** @type {Config} */
const config = {
	token: "",
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
	percentUsersBornInDataset: 50,
	hasAvatar: true,
	batchSize: 2_500_000,
	concurrency: 1,
	writeToDisk: false,
	scdProps: {},

	funnels: [
		{
			sequence: ["account created", "restaurant browsed", "restaurant viewed"],
			isFirstFunnel: true,
			conversionRate: 80,
			timeToConvert: 0.5,
		},
		{
			// Browse and discover: most common action on food delivery apps
			sequence: ["restaurant browsed", "restaurant viewed", "item added to cart"],
			conversionRate: 55,
			timeToConvert: 1,
			weight: 5,
			props: { "restaurant_id": u.pickAWinner(restaurantIds) },
		},
		{
			// Search-driven ordering
			sequence: ["search performed", "restaurant viewed", "item added to cart", "checkout started"],
			conversionRate: 45,
			timeToConvert: 2,
			weight: 3,
		},
		{
			// Full order lifecycle: checkout to delivery
			sequence: ["checkout started", "order placed", "order tracked", "order delivered"],
			conversionRate: 65,
			timeToConvert: 2,
			weight: 4,
			props: { "order_id": u.pickAWinner(orderIds) },
		},
		{
			// Post-order: rate and reorder
			sequence: ["order delivered", "order rated", "reorder initiated"],
			conversionRate: 40,
			timeToConvert: 24,
			weight: 2,
		},
		{
			// Browsing promos and coupons
			sequence: ["promotion viewed", "coupon applied", "checkout started"],
			conversionRate: 50,
			timeToConvert: 1,
			weight: 2,
		},
		{
			// Support flow
			sequence: ["support ticket", "order rated"],
			conversionRate: 45,
			timeToConvert: 6,
			weight: 1,
		},
		{
			// Subscription management
			sequence: ["subscription started", "order placed", "subscription cancelled"],
			conversionRate: 20,
			timeToConvert: 48,
			weight: 1,
		},
	],

	events: [
		{
			event: "account created",
			weight: 1,
			isFirstEvent: true,
			properties: {
				"signup_method": ["email", "google", "apple", "facebook"],
				"referral_code": u.pickAWinner([true, false], 0.3),
			}
		},
		{
			event: "restaurant browsed",
			weight: 18,
			properties: {
				"cuisine_type": [
					"American",
					"Italian",
					"Chinese",
					"Japanese",
					"Mexican",
					"Indian",
					"Thai",
					"Mediterranean"
				],
				"sort_by": ["recommended", "distance", "rating", "price"],
				"filter_applied": u.pickAWinner([true, false], 0.4),
			}
		},
		{
			event: "restaurant viewed",
			weight: 15,
			properties: {
				"restaurant_id": u.pickAWinner(restaurantIds),
				"cuisine_type": [
					"American",
					"Italian",
					"Chinese",
					"Japanese",
					"Mexican",
					"Indian",
					"Thai",
					"Mediterranean"
				],
				"avg_rating": u.weighNumRange(1, 5, 0.8, 30),
				"delivery_time_est_mins": u.weighNumRange(15, 90, 1.2, 40),
				"price_tier": ["$", "$$", "$$$", "$$$$"],
			}
		},
		{
			event: "item added to cart",
			weight: 14,
			properties: {
				"item_id": u.pickAWinner(itemIds),
				"item_category": ["entree", "appetizer", "drink", "dessert", "side"],
				"item_price": u.weighNumRange(3, 65, 1.0, 40),
				"customization_count": u.weighNumRange(0, 5, 1.5, 20),
			}
		},
		{
			event: "item removed from cart",
			weight: 5,
			properties: {
				"item_id": u.pickAWinner(itemIds),
				"removal_reason": ["changed_mind", "too_expensive", "substitution"],
			}
		},
		{
			event: "coupon applied",
			weight: 4,
			properties: {
				"coupon_code": u.pickAWinner(couponCodes),
				"discount_type": ["percent", "flat", "free_delivery"],
				"discount_value": u.weighNumRange(5, 50, 1.2, 20),
			}
		},
		{
			event: "checkout started",
			weight: 12,
			properties: {
				"cart_total": u.weighNumRange(8, 150, 0.8, 40),
				"items_count": u.weighNumRange(1, 8, 1.2, 20),
				"delivery_address_saved": u.pickAWinner([true, false], 0.7),
			}
		},
		{
			event: "order placed",
			weight: 10,
			properties: {
				"order_id": u.pickAWinner(orderIds),
				"payment_method": ["credit_card", "apple_pay", "google_pay", "paypal", "cash"],
				"order_total": u.weighNumRange(10, 200, 0.8, 40),
				"tip_amount": u.weighNumRange(0, 30, 1.5, 20),
				"delivery_fee": u.weighNumRange(0, 12, 1.0, 20),
			}
		},
		{
			event: "order tracked",
			weight: 13,
			properties: {
				"order_id": u.pickAWinner(orderIds),
				"order_status": ["confirmed", "preparing", "picked_up", "en_route", "delivered"],
				"eta_mins": u.weighNumRange(5, 60, 1.0, 30),
			}
		},
		{
			event: "order delivered",
			weight: 9,
			properties: {
				"order_id": u.pickAWinner(orderIds),
				"actual_delivery_mins": u.weighNumRange(12, 90, 1.0, 40),
				"on_time": u.pickAWinner([true, false], 0.7),
			}
		},
		{
			event: "order rated",
			weight: 7,
			properties: {
				"order_id": u.pickAWinner(orderIds),
				"food_rating": u.weighNumRange(1, 5, 0.8, 30),
				"delivery_rating": u.weighNumRange(1, 5, 0.8, 30),
				"would_reorder": u.pickAWinner([true, false], 0.65),
			}
		},
		{
			event: "search performed",
			weight: 11,
			properties: {
				"search_query": () => chance.pickone([
					"pizza", "sushi", "burger", "tacos", "pad thai",
					"chicken", "salad", "ramen", "pasta", "sandwich",
					"wings", "curry", "pho", "burritos", "steak"
				]),
				"results_count": u.weighNumRange(0, 50, 0.8, 30),
				"search_type": ["restaurant", "cuisine", "dish"],
			}
		},
		{
			event: "promotion viewed",
			weight: 8,
			properties: {
				"promo_id": () => `promo_${v.uid(5)}`,
				"promo_type": ["banner", "push", "in_feed"],
				"promo_value": ["10%", "15%", "20%", "25%", "30%", "40%", "50%"],
			}
		},
		{
			event: "subscription started",
			weight: 2,
			properties: {
				"plan": u.pickAWinner(["quickbite_plus_monthly", "quickbite_plus_monthly", "quickbite_plus_annual"]),
				"price": u.pickAWinner([9.99, 9.99, 79.99]),
				"trial": u.pickAWinner([true, false], 0.5),
			}
		},
		{
			event: "subscription cancelled",
			weight: 1,
			properties: {
				"reason": ["too_expensive", "not_ordering_enough", "found_alternative", "bad_experience"],
				"months_subscribed": u.weighNumRange(1, 24, 1.5, 15),
			}
		},
		{
			event: "support ticket",
			weight: 3,
			properties: {
				"issue_type": ["missing_item", "wrong_order", "late_delivery", "quality_issue", "refund_request"],
				"order_id": u.pickAWinner(orderIds),
			}
		},
		{
			event: "reorder initiated",
			weight: 6,
			properties: {
				"order_id": u.pickAWinner(orderIds),
				"original_order_age_days": u.weighNumRange(1, 60, 1.5, 30),
			}
		},
	],

	superProps: {
		platform: ["iOS", "Android", "Web"],
		subscription_tier: u.pickAWinner(["Free", "Free", "Free", "Free", "QuickBite+"]),
		city: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "San Francisco"],
	},

	userProps: {
		"preferred_cuisine": [
			"American",
			"Italian",
			"Chinese",
			"Japanese",
			"Mexican",
			"Indian",
			"Thai",
			"Mediterranean"
		],
		"avg_order_value": u.weighNumRange(15, 80, 0.8, 40),
		"orders_per_month": u.weighNumRange(1, 20, 1.5, 10),
		"favorite_restaurant_count": u.weighNumRange(1, 10),
	},

	groupKeys: [
		["restaurant_id", 200, ["restaurant viewed", "order placed", "order rated"]],
	],

	groupProps: {
		restaurant_id: {
			"name": () => `${chance.pickone(["The", "Big", "Lucky", "Golden", "Fresh", "Urban"])} ${chance.pickone(["Kitchen", "Grill", "Bowl", "Wok", "Bistro", "Plate", "Table", "Fork"])}`,
			"cuisine": [
				"American",
				"Italian",
				"Chinese",
				"Japanese",
				"Mexican",
				"Indian",
				"Thai",
				"Mediterranean"
			],
			"avg_rating": u.weighNumRange(1, 5, 0.8, 30),
			"delivery_radius_mi": u.weighNumRange(1, 15, 1.0, 10),
		}
	},

	lookupTables: [],

	/**
	 * ARCHITECTED ANALYTICS HOOKS
	 *
	 * This hook function creates 8 deliberate patterns in the data:
	 *
	 * 1. LUNCH RUSH CONVERSION: Orders during lunch/dinner hours convert at higher rates
	 * 2. COUPON INJECTION: Free-tier users get coupons spliced into funnels
	 * 3. LATE NIGHT MUNCHIES: Late-night orders skew to fast food with inflated prices
	 * 4. RAINY WEEK SURGE: Days 20-27 have surge pricing and doubled order volume
	 * 5. REFERRAL POWER USERS: Referred users reorder more and rate higher
	 * 6. TRIAL CONVERSION: Trial subscribers with 3+ early orders are retained
	 * 7. SUPPORT TICKET CHURN: 15% of users flagged as high-risk churners
	 * 8. FIRST ORDER BONUS: New users in the Order Completion funnel convert at 90%
	 */
	hook: function (record, type, meta) {
		const NOW = dayjs();
		const DATASET_START = NOW.subtract(days, 'days');
		const RAINY_WEEK_START = DATASET_START.add(20, 'days');
		const RAINY_WEEK_END = DATASET_START.add(27, 'days');

		// ═══════════════════════════════════════════════════════════════════
		// HOOK 1: LUNCH RUSH CONVERSION (funnel-pre)
		// During lunch (11AM-1PM) and dinner (5PM-8PM), funnel conversion
		// rates are boosted to reflect real-world meal-time ordering surges.
		// ═══════════════════════════════════════════════════════════════════
		if (type === "funnel-pre") {
			if (meta && meta.firstEventTime) {
				const hour = dayjs.unix(meta.firstEventTime).hour();

				record.props = record.props || {};

				// Lunch rush: 11AM - 1PM
				if (hour >= 11 && hour <= 13) {
					record.conversionRate = record.conversionRate * 1.4;
					record.props.lunch_rush = true;
					record.props.dinner_rush = false;
				}
				// Dinner rush: 5PM - 8PM
				else if (hour >= 17 && hour <= 20) {
					record.conversionRate = record.conversionRate * 1.2;
					record.props.lunch_rush = false;
					record.props.dinner_rush = true;
				} else {
					record.props.lunch_rush = false;
					record.props.dinner_rush = false;
				}
			}

			// ═══════════════════════════════════════════════════════════════
			// HOOK 8: FIRST ORDER BONUS (funnel-pre)
			// New users (born in dataset) get a massive conversion boost on
			// the Order Completion funnel, simulating first-order promotions
			// and new-user incentives that drive initial purchases.
			// ═══════════════════════════════════════════════════════════════
			if (record.sequence &&
				record.sequence[0] === "checkout started" &&
				record.sequence[1] === "order placed") {
				record.props = record.props || {};
				// Use hash to deterministically assign ~50% of users as "new"
				const userId = meta && meta.user && (meta.user.distinct_id || String(meta.user));
				const isNewUser = userId && userId.charCodeAt(0) % 2 === 0;
				if (isNewUser) {
					record.conversionRate = Math.min(98, record.conversionRate * 1.4);
					record.props.first_order_bonus = true;
				} else {
					record.props.first_order_bonus = false;
				}
			}
		}

		// ═══════════════════════════════════════════════════════════════════
		// HOOK 2: COUPON INJECTION (funnel-post)
		// Free-tier users get coupon_applied events spliced into their
		// funnel sequences 30% of the time, simulating promotional nudges
		// that push non-subscribers toward conversion.
		// ═══════════════════════════════════════════════════════════════════
		if (type === "funnel-post") {
			if (Array.isArray(record) && record.length >= 2) {
				// Check if user is Free tier from first event's super props
				const firstEvent = record[0];
				const isFreeUser = firstEvent && firstEvent.subscription_tier === "Free";

				if (isFreeUser && chance.bool({ likelihood: 30 })) {
					// Pick a random insertion point between funnel steps
					const insertIdx = chance.integer({ min: 1, max: record.length - 1 });
					const prevEvent = record[insertIdx - 1];
					const nextEvent = record[insertIdx];
					const midTime = dayjs(prevEvent.time).add(
						dayjs(nextEvent.time).diff(dayjs(prevEvent.time)) / 2,
						'milliseconds'
					).toISOString();

					const couponEvent = {
						event: "coupon applied",
						time: midTime,
						user_id: firstEvent.user_id,
						subscription_tier: firstEvent.subscription_tier,
						platform: firstEvent.platform,
						city: firstEvent.city,
						coupon_code: chance.pickone(couponCodes),
						discount_type: chance.pickone(["percent", "flat", "free_delivery"]),
						discount_value: chance.integer({ min: 10, max: 30 }),
						coupon_injected: true,
					};
					record.splice(insertIdx, 0, couponEvent);
				}
			}
		}

		// ═══════════════════════════════════════════════════════════════════
		// HOOK 3: LATE NIGHT MUNCHIES (event)
		// Between 10PM and 2AM, restaurant views and cart additions skew
		// heavily toward fast food (American cuisine) with inflated prices,
		// modeling the real-world late-night ordering pattern.
		// ═══════════════════════════════════════════════════════════════════
		if (type === "event") {
			const EVENT_TIME = dayjs(record.time);
			const hour = EVENT_TIME.hour();
			const isLateNight = hour >= 22 || hour <= 2;

			if (record.event === "restaurant viewed" || record.event === "item added to cart") {
				if (isLateNight) {
					// 70% of late-night browsing/ordering is fast food (American)
					if (chance.bool({ likelihood: 70 })) {
						if (record.cuisine_type !== undefined) {
							record.cuisine_type = "American";
						}
					}

					// Boost item price by 1.3x (late-night surcharge effect)
					if (record.item_price !== undefined) {
						record.item_price = Math.round(record.item_price * 1.3 * 100) / 100;
					}

					record.late_night_order = true;
				} else {
					record.late_night_order = false;
				}
			}

			// ═══════════════════════════════════════════════════════════════
			// HOOK 4: RAINY WEEK SURGE (event)
			// During days 20-27, delivery fees double on order_placed events
			// and there is a 40% chance of duplicating the event, simulating
			// a weather-driven demand surge with surge pricing.
			// ═══════════════════════════════════════════════════════════════
			if (record.event === "order placed") {
				if (EVENT_TIME.isAfter(RAINY_WEEK_START) && EVENT_TIME.isBefore(RAINY_WEEK_END)) {
					record.delivery_fee = (record.delivery_fee || 5) * 2;
					record.surge_pricing = true;
					record.rainy_week = true;
				} else {
					record.surge_pricing = false;
				}
			}
		}

		// ═══════════════════════════════════════════════════════════════════
		// HOOK 5: REFERRAL POWER USERS (everything)
		// Users who signed up with a referral code get 2x more reorder
		// events and boosted food ratings. Referred users are more loyal
		// and satisfied, mirroring real referral program outcomes.
		// ═══════════════════════════════════════════════════════════════════
		if (type === "everything") {
			const userEvents = record;

			// First pass: identify user patterns
			let isReferralUser = false;
			let hasTrialSubscription = false;
			let earlyOrderCount = 0;
			let firstEventTime = userEvents.length > 0 ? dayjs(userEvents[0].time) : null;

			userEvents.forEach((event) => {
				const eventTime = dayjs(event.time);
				const daysSinceStart = firstEventTime ? eventTime.diff(firstEventTime, 'days', true) : 0;

				// Hook #5: Track referral users
				if (event.event === "account created" && event.referral_code === true) {
					isReferralUser = true;
				}

				// Hook #6: Track trial subscribers and early orders
				if (event.event === "subscription started" && event.trial === true) {
					hasTrialSubscription = true;
				}
				if (event.event === "order placed" && daysSinceStart <= 14) {
					earlyOrderCount++;
				}
			});

			// Second pass: apply referral power user effects
			userEvents.forEach((event, idx) => {
				if (event.event === "order rated") {
					if (isReferralUser) {
						event.food_rating = chance.integer({ min: 4, max: 5 });
						event.referral_user = true;
					} else {
						event.referral_user = false;
					}
				}
				if (isReferralUser && event.event === "reorder initiated" && chance.bool({ likelihood: 50 })) {
					const eventTime = dayjs(event.time);
					const extraReorder = {
						event: "reorder initiated",
						time: eventTime.add(chance.integer({ min: 1, max: 7 }), 'days').toISOString(),
						user_id: event.user_id,
						order_id: chance.pickone(orderIds),
						original_order_age_days: chance.integer({ min: 3, max: 30 }),
						referral_user: true,
					};
					userEvents.splice(idx + 1, 0, extraReorder);
				}
			});

			// ═══════════════════════════════════════════════════════════════
			// HOOK 6: TRIAL CONVERSION (everything)
			// Trial subscribers who place 3+ orders in their first 14 days
			// are retained. Those with fewer orders churn: 60% of their
			// events after day 14 are removed, simulating subscription
			// abandonment after a failed trial experience.
			// ═══════════════════════════════════════════════════════════════
			if (hasTrialSubscription) {
				const trialCutoff = firstEventTime ? firstEventTime.add(14, 'days') : null;

				if (earlyOrderCount >= 3) {
					// Retained: mark events as trial_retained
					userEvents.forEach((event) => {
						event.trial_retained = true;
					});
				} else {
					// Churned: remove 60% of events after day 14
					userEvents.forEach((event) => {
						event.trial_retained = false;
					});
					for (let i = userEvents.length - 1; i >= 0; i--) {
						const evt = userEvents[i];
						if (trialCutoff && dayjs(evt.time).isAfter(trialCutoff)) {
							if (chance.bool({ likelihood: 60 })) {
								userEvents.splice(i, 1);
							}
						}
					}
				}
			}

			// ═══════════════════════════════════════════════════════════════
			// HOOK 4: RAINY WEEK SURGE - duplicate order events (everything)
			// Events tagged surge_pricing=true in the event hook get a 40%
			// chance of duplication here, creating visible demand spikes.
			// ═══════════════════════════════════════════════════════════════
			const rainyDuplicates = [];
			userEvents.forEach((event) => {
				if (event.surge_pricing === true && event.event === "order placed" && chance.bool({ likelihood: 40 })) {
					const dup = JSON.parse(JSON.stringify(event));
					dup.time = dayjs(event.time).add(chance.integer({ min: 5, max: 60 }), 'minutes').toISOString();
					dup.rainy_week = true;
					rainyDuplicates.push(dup);
				}
			});
			if (rainyDuplicates.length > 0) {
				userEvents.push(...rainyDuplicates);
			}
		}

		// ═══════════════════════════════════════════════════════════════════
		// HOOK 7: SUPPORT TICKET CHURN (user)
		// 15% of users are flagged as high-risk with elevated churn scores.
		// The remaining users get low churn scores. This creates a clear
		// segmentation opportunity for proactive retention campaigns.
		// ═══════════════════════════════════════════════════════════════════
		if (type === "user") {
			if (chance.bool({ likelihood: 15 })) {
				record.is_high_risk = true;
				record.churn_risk_score = chance.integer({ min: 70, max: 100 });
			} else {
				record.is_high_risk = false;
				record.churn_risk_score = chance.integer({ min: 0, max: 40 });
			}
		}

		return record;
	}
};

export default config;
