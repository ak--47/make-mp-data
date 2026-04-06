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

/** @typedef  {import("../../types.js").Dungeon} Config */

/**
 * NEEDLE IN A HAYSTACK - FOOD DELIVERY APP DESIGN
 *
 * QuickBite - A food delivery platform connecting hungry customers with local restaurants.
 * Think DoorDash/Uber Eats: users browse restaurants, build carts, place orders, track
 * deliveries in real-time, and rate their experiences afterward.
 *
 * CORE USER LOOP:
 * Users sign up (email, Google, Apple, Facebook) and immediately enter a discovery flow.
 * They browse restaurants by cuisine, sort by distance/rating/price, search for specific
 * dishes, and eventually land on a restaurant page. From there, they build a cart by adding
 * items (entrees, appetizers, drinks, desserts, sides) with customizations. Checkout
 * captures payment, tip, and delivery details. After ordering, users track their delivery
 * through multiple statuses (confirmed, preparing, picked up, en route, delivered).
 *
 * RESTAURANT ECOSYSTEM:
 * 200 restaurants across cuisine types: American, Italian, Chinese, Japanese, Mexican,
 * Indian, Thai, and Mediterranean. Restaurants span four price tiers ($, $$, $$$, $$$$)
 * with varying delivery times and ratings. This models a realistic marketplace with
 * restaurant-level analytics via group profiles.
 *
 * DISCOVERY & SEARCH:
 * Two paths to finding food: browsing (filtering by cuisine, sorting by rating/distance/price)
 * and searching (by restaurant name, cuisine type, or specific dish). The search-to-order
 * funnel captures intent-driven behavior vs. casual browsing.
 *
 * MONETIZATION MODEL:
 * - Delivery fees ($0-$12, waived for QuickBite+ subscribers)
 * - QuickBite+ subscription ($9.99/month or $79.99/year) for free delivery and perks
 * - Promotions and coupons drive trial and reactivation
 * - Restaurant-promoted listings (not modeled as user events)
 *
 * CART BEHAVIOR:
 * Cart events (add/remove) capture the deliberation process. Removal reasons
 * (changed_mind, too_expensive, substitution) reveal price sensitivity and UX friction.
 * Customization counts show engagement depth with individual items.
 *
 * ORDER LIFECYCLE:
 * order placed -> order tracked (multiple status updates) -> order delivered -> order rated
 * This models the full post-purchase experience. On-time delivery, actual vs. estimated
 * delivery time, and food/delivery ratings capture service quality metrics.
 *
 * SUPPORT & RETENTION:
 * Support tickets (missing items, wrong orders, late delivery, quality issues, refund
 * requests) model service failures. Reorder events capture repeat behavior and loyalty.
 * The ratio of support tickets to orders is a key service quality indicator.
 *
 * WHY THESE EVENTS/PROPERTIES?
 * - Events model the complete food delivery loop: discovery -> consideration -> purchase -> fulfillment -> retention
 * - Properties enable cohort analysis: cuisine preferences, price sensitivity, platform usage, subscription status
 * - Funnels reveal friction: where do users drop off between browsing and ordering?
 * - Time-based patterns (lunch rush, late night) simulate real delivery demand curves
 * - Subscription tier (Free vs QuickBite+) creates a natural A/B comparison for monetization analysis
 * - Support and rating events drive churn prediction and service quality monitoring
 * - The "needle in haystack" hooks simulate real product insights hidden in production data
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
				const hour = dayjs(meta.firstEventTime).hour();

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
					record.conversionRate = 0.90;
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

					// 40% chance to duplicate the event (more orders during rain)
					if (chance.bool({ likelihood: 40 })) {
						const duplicateEvent = {
							event: "order placed",
							time: EVENT_TIME.add(chance.integer({ min: 5, max: 60 }), 'minutes').toISOString(),
							user_id: record.user_id,
							order_id: chance.pickone(orderIds),
							payment_method: chance.pickone(["credit_card", "apple_pay", "google_pay"]),
							order_total: chance.integer({ min: 15, max: 120 }),
							tip_amount: chance.integer({ min: 0, max: 20 }),
							delivery_fee: chance.integer({ min: 6, max: 24 }),
							surge_pricing: true,
							rainy_week: true,
						};
						return [record, duplicateEvent];
					}
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

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NEEDLE IN A HAYSTACK - QUICKBITE FOOD DELIVERY ANALYTICS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * A food delivery app dungeon with 8 deliberately architected analytics
 * insights hidden in the data. This dungeon is designed to showcase advanced
 * product analytics patterns and demonstrate how to find "needles" (meaningful
 * insights) in "haystacks" (large datasets).
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * DATASET OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * - 5,000 users over 100 days
 * - 360K events across 17 event types
 * - 3 funnels (onboarding, order completion, discovery to order)
 * - Group analytics (restaurants)
 * - Lookup tables (menu items, coupon codes)
 * - Subscription tiers (Free, QuickBite+)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE 8 ARCHITECTED HOOKS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Each hook creates a specific, discoverable analytics insight that simulates
 * real-world product behavior patterns.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 1. LUNCH RUSH CONVERSION (funnel-pre)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Funnel conversion rates are boosted during meal-time hours.
 * Lunch (11AM-1PM) gets a 1.4x multiplier; dinner (5PM-8PM) gets 1.2x.
 * Events during these windows carry lunch_rush or dinner_rush properties.
 *
 * HOW TO FIND IT:
 *   - Break down funnel conversion by hour of day
 *   - Compare conversion rates during 11AM-1PM vs. off-peak hours
 *   - Filter events where lunch_rush = true or dinner_rush = true
 *
 * EXPECTED INSIGHT: Lunch hour funnels convert ~40% better than baseline.
 * Dinner hour funnels convert ~20% better. Clear time-of-day pattern in
 * the checkout-to-order-to-delivery pipeline.
 *
 * REAL-WORLD ANALOGUE: Food delivery apps see massive demand spikes during
 * traditional meal times. Users ordering during these windows have higher
 * intent and thus higher conversion rates.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 2. COUPON INJECTION (funnel-post)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Free-tier users get coupon_applied events spliced into their
 * funnel sequences 30% of the time. These injected coupons carry the
 * coupon_injected: true property to distinguish them from organic usage.
 *
 * HOW TO FIND IT:
 *   - Segment by subscription_tier = "Free"
 *   - Look for coupon_applied events with coupon_injected = true
 *   - Compare funnel completion rates for Free users with/without coupons
 *
 * EXPECTED INSIGHT: ~30% of Free users receive promotional coupons mid-funnel.
 * These users should show different downstream conversion behavior, simulating
 * how promotional nudges affect the purchase funnel.
 *
 * REAL-WORLD ANALOGUE: Apps frequently inject promotional offers (push
 * notifications, in-app banners) to non-paying users during key funnel
 * moments to boost conversion.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 3. LATE NIGHT MUNCHIES (event)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Between 10PM and 2AM, restaurant views and cart additions skew
 * 70% toward American (fast food) cuisine. Item prices are boosted by 1.3x.
 * Events carry late_night_order: true.
 *
 * HOW TO FIND IT:
 *   - Break down restaurant_viewed by hour of day and cuisine_type
 *   - Compare cuisine distribution at 10PM-2AM vs. daytime
 *   - Filter late_night_order = true and compare average item_price
 *
 * EXPECTED INSIGHT: Late-night orders are overwhelmingly fast food with
 * higher average prices. The cuisine distribution at night is dramatically
 * different from daytime patterns.
 *
 * REAL-WORLD ANALOGUE: Late-night food delivery is dominated by fast food
 * and comfort food. Many platforms charge late-night surcharges or see
 * naturally inflated basket sizes during these hours.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 4. RAINY WEEK SURGE (event)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: During days 20-27 of the dataset, a simulated rainy week causes:
 *   - Delivery fees double on order_placed events
 *   - surge_pricing: true flag added
 *   - 40% chance of duplicate order events (demand surge)
 *
 * HOW TO FIND IT:
 *   - Chart order_placed event count by day
 *   - Filter days 20-27 and compare delivery_fee averages
 *   - Look for surge_pricing = true and rainy_week = true properties
 *
 * EXPECTED INSIGHT: Clear spike in order volume around days 20-27, with
 * doubled delivery fees and surge pricing markers. The demand surge is
 * visible as a ~40% increase in order_placed event volume.
 *
 * REAL-WORLD ANALOGUE: Weather events drive significant demand surges for
 * food delivery. Platforms respond with surge pricing on delivery fees,
 * and order volume increases as people avoid going out.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 5. REFERRAL POWER USERS (everything)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Users whose account_created event has referral_code = true:
 *   - Get 2x more reorder_initiated events (higher loyalty)
 *   - Have food_rating boosted to 4-5 (higher satisfaction)
 *   - Carry referral_user: true on affected events
 *
 * HOW TO FIND IT:
 *   - Segment users by: referral_code = true on account_created
 *   - Compare: reorder_initiated event count per user
 *   - Compare: average food_rating on order_rated events
 *
 * EXPECTED INSIGHT: Referred users reorder roughly 2x more often and rate
 * food 4-5 stars consistently. They represent a higher-LTV, more-satisfied
 * segment of the user base.
 *
 * REAL-WORLD ANALOGUE: Referral programs consistently produce higher-quality
 * users. Referred customers have lower acquisition costs, higher retention,
 * and higher satisfaction because they come with built-in social proof.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 6. TRIAL CONVERSION (everything)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Users with subscription_started where trial = true are evaluated:
 *   - If they place 3+ orders in their first 14 days: retained (all events kept)
 *   - If fewer than 3 orders: churned (60% of events after day 14 removed)
 *   - Retained users carry trial_retained: true
 *
 * HOW TO FIND IT:
 *   - Segment users by: subscription_started with trial = true
 *   - Count order_placed events within first 14 days per user
 *   - Compare: event volume after day 14 for 3+ orders vs. <3 orders
 *   - Look for trial_retained = true property
 *
 * EXPECTED INSIGHT: Trial users who place 3+ early orders show sustained
 * engagement. Those who don't show a dramatic drop-off after day 14, with
 * 60% fewer events. The "magic number" for trial conversion is 3 orders.
 *
 * REAL-WORLD ANALOGUE: Subscription services often find a "magic number"
 * of early actions that predict long-term retention. For food delivery,
 * this is typically a threshold of orders during the trial period.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 7. SUPPORT TICKET CHURN (user)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: 15% of users are flagged as is_high_risk = true with a
 * churn_risk_score between 70-100. The remaining 85% get scores of 0-40.
 * This creates a binary segmentation opportunity for retention teams.
 *
 * HOW TO FIND IT:
 *   - Segment users by: is_high_risk = true
 *   - Compare: churn_risk_score distribution
 *   - Cross-reference: support_ticket event frequency for high-risk users
 *   - Compare: retention and ordering behavior by risk segment
 *
 * EXPECTED INSIGHT: 15% of users have churn scores above 70, creating a
 * clear at-risk segment. These users likely correlate with higher support
 * ticket rates and lower order frequency.
 *
 * REAL-WORLD ANALOGUE: Customer health scoring is used by subscription
 * businesses to identify at-risk users for proactive retention outreach.
 * ML models in production generate similar risk scores from behavioral data.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 8. FIRST ORDER BONUS (funnel-pre)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: For the Order Completion funnel (checkout started -> order placed
 * -> order delivered), new users (born in dataset) get their conversion rate
 * boosted to 90%. Events carry first_order_bonus: true.
 *
 * HOW TO FIND IT:
 *   - Segment the Order Completion funnel by new vs. existing users
 *   - Compare: conversion rates for new users vs. returning users
 *   - Filter: first_order_bonus = true
 *
 * EXPECTED INSIGHT: New users convert at ~90% through the order funnel,
 * dramatically higher than the 60% baseline. This simulates first-order
 * promotions (free delivery, $10 off) that most food delivery apps offer.
 *
 * REAL-WORLD ANALOGUE: Every major food delivery app offers aggressive
 * first-order incentives. These dramatically boost initial conversion but
 * the real question is whether those users return (see Hook #6).
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVANCED ANALYSIS IDEAS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * CROSS-HOOK PATTERNS:
 *
 * 1. The Perfect Customer: Users who:
 *    - Signed up via referral (Hook #5)
 *    - Started a trial and placed 3+ early orders (Hook #6)
 *    - Order during lunch rush (Hook #1)
 *    - Have low churn risk score (Hook #7)
 *    These users should have exceptional LTV and retention metrics.
 *
 * 2. Rainy Night Double Whammy: Do late-night orders during rainy week
 *    (Hook #3 + Hook #4) show compounded surge pricing effects?
 *
 * 3. Coupon-Driven Trial Conversion: Do free users who receive injected
 *    coupons (Hook #2) eventually start trials (Hook #6)?
 *
 * 4. Referral + First Order: Referred users (Hook #5) who also get the
 *    first order bonus (Hook #8) should have the highest conversion rates.
 *
 * 5. Support Tickets and Churn Risk: Do high-risk users (Hook #7) file
 *    more support tickets, and does this correlate with rainy week
 *    late deliveries (Hook #4)?
 *
 * COHORT ANALYSIS:
 *
 * - Cohort by signup week: Users who started during rainy week (days 20-27)
 *   should show different ordering patterns
 * - Cohort by referral source: Referred vs. organic user lifecycle comparison
 * - Cohort by subscription tier: Free vs. QuickBite+ across all metrics
 * - Cohort by city: Do different cities show different cuisine preferences
 *   and ordering patterns?
 *
 * FUNNEL ANALYSIS:
 *
 * - Onboarding Funnel: How quickly do users go from account creation to
 *   first restaurant view? Break down by signup method.
 * - Order Funnel: Compare checkout-to-delivery completion by platform,
 *   subscription tier, and time of day.
 * - Discovery Funnel: How does search type (restaurant vs. cuisine vs. dish)
 *   affect downstream conversion to ordering?
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * EXPECTED METRICS SUMMARY
 * ═══════════════════════════════════════════════════════════════════════════════
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
 * First Order Bonus     | New user conversion  | 60%      | 90%         | 1.5x
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * HOW TO RUN THIS DUNGEON
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * From the dm4 root directory:
 *
 *   npm start
 *
 * Or programmatically:
 *
 *   import generate from './index.js';
 *   import config from './dungeons/harness-food.js';
 *   const results = await generate(config);
 *
 * OUTPUT FILES (with writeToDisk: false, format: "json", gzip: true):
 *
 *   - needle-haystack-food__events.json.gz - All event data
 *   - needle-haystack-food__user_profiles.json.gz - User profiles
 *   - needle-haystack-food__group_profiles.json.gz - Restaurant profiles
 *   - needle-haystack-food__item_id_lookup.json.gz - Menu item catalog
 *   - needle-haystack-food__coupon_code_lookup.json.gz - Coupon catalog
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * TESTING YOUR ANALYTICS PLATFORM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This dungeon is perfect for testing:
 *
 * 1. Time-of-Day Analysis: Can you detect the lunch and dinner rush patterns?
 * 2. Promotional Impact: Can you measure the effect of injected coupons?
 * 3. Behavioral Shifts: Can you discover the late-night cuisine preferences?
 * 4. Anomaly Detection: Can you spot the rainy week demand surge?
 * 5. Referral Analysis: Can you quantify the referral user advantage?
 * 6. Trial Optimization: Can you find the "magic number" of early orders?
 * 7. Churn Prediction: Can you identify high-risk users before they leave?
 * 8. New User Funnels: Can you measure the first-order bonus impact?
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * WHY "NEEDLE IN A HAYSTACK"?
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Each hook is a "needle" - a meaningful, actionable insight hidden in a
 * "haystack" of 360K events. The challenge is:
 *
 * 1. FINDING the needles (discovery)
 * 2. VALIDATING they're real patterns (statistical significance)
 * 3. UNDERSTANDING why they matter (business impact)
 * 4. ACTING on them (product decisions)
 *
 * This mirrors real-world product analytics: your data contains valuable insights,
 * but you need the right tools and skills to find them.
 *
 * Happy Hunting!
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */
