import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";

const SEED = "harness-fintech";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef  {import("../types.d.ts").Dungeon} Config */

/**
 * ===================================================================
 * DATASET OVERVIEW
 * ===================================================================
 *
 * NexBank — a Chime/Revolut-style neobank app. Users open accounts
 * (personal or business), transact across 7 merchant categories,
 * send transfers, pay bills, set budgets, invest, apply for loans,
 * and earn tier-scaled rewards.
 *
 * Scale: 5,000 users · 600K events · 100 days · 18 event types
 * Groups: 500 households
 * Tiers: Basic (free) / Plus ($4.99/mo) / Premium ($14.99/mo)
 *
 * Core loop: onboarding → daily banking → financial planning →
 *   budgets & savings → investments → rewards & monetization
 *
 * Funnels:
 *   - Onboarding: account opened → app session → balance checked
 *   - Daily banking: app session → balance checked → transaction
 *   - Transfers: app session → transfer sent → notification opened
 *   - Bill payment: app session → bill paid → notification opened
 *   - Financial planning: budget created → budget alert → savings goal
 *   - Investment: balance checked → investment made → reward redeemed
 *   - Support: support contacted → card locked → dispute filed
 *   - Lending: loan applied → loan approved → premium upgraded
 */

/**
 * ===================================================================
 * ANALYTICS HOOKS (8 architected patterns)
 * ===================================================================
 *
 * 1. PERSONAL VS BUSINESS ACCOUNTS (user hook)
 *    20% business (employee_count, revenue, industry), 80% personal
 *    (age_range, life_stage). Breakdown: account_segment.
 *    → Insights: any event by unique users, breakdown account_segment
 *    → Insights: "transaction completed" avg amount, breakdown account_segment
 *
 * 2. PAYDAY PATTERNS (event hook)
 *    Direct deposits 3x on 1st/15th (payday: true). Transfers 2x on
 *    days 1-3 and 15-17 (post_payday_spending: true).
 *    → Insights: "transaction completed" avg amount, filter direct_deposit, breakdown payday
 *    → Insights: "transfer sent" avg amount, breakdown post_payday_spending
 *
 * 3. FRAUD DETECTION (everything hook)
 *    3% of users get a fraud burst at timeline midpoint: 3-5 rapid
 *    high-value txns → card locked → dispute → support. Tagged
 *    fraud_sequence: true.
 *    → Insights: "transaction completed" total, filter fraud_sequence = true
 *    → Funnels: card locked → dispute filed → support contacted, filter fraud_sequence = true
 *
 * 4. LOW BALANCE CHURN (everything hook)
 *    Users with 3+ balance checks < $15K lose 50% of events after
 *    day 30. Surviving events tagged low_balance_churn: true.
 *    → Retention: any → any, segment low_balance_churn = true vs others
 *    → Insights: any event total over time, filter low_balance_churn = true
 *
 * 5. BUDGET USERS SAVE MORE (everything hook)
 *    Budget creators get 2x savings contributions, 1.5x investment
 *    amounts, extra savings goals. Tagged budget_discipline: true.
 *    → Insights: "savings goal set" avg monthly_contribution, breakdown budget_discipline
 *    → Insights: "investment made" avg amount, breakdown budget_discipline
 *
 * 6. AUTO-PAY LOYALTY (event hook)
 *    Manual payers (auto_pay=false) miss 30% of bills (event renamed
 *    to "bill payment missed"). Auto-pay users never miss.
 *    → Insights: "bill paid" + "bill payment missed" totals side by side
 *    → Insights: "bill paid" total, breakdown manual_payment
 *
 * 7. PREMIUM TIER VALUE (event hook)
 *    Premium: 3x rewards, 2x investment sell returns. Plus: 1.5x
 *    rewards. Tagged premium_reward / premium_returns.
 *    → Insights: "reward redeemed" avg value, breakdown account_tier
 *      (expected: premium ~$30, plus ~$15, basic ~$10)
 *    → Insights: "investment made" avg amount, filter action=sell, breakdown premium_returns
 *
 * 8. MONTH-END ANXIETY (event hook)
 *    Days >= 28: sessions 40% longer, balances 30% lower. Tagged
 *    month_end_anxiety / month_end_check.
 *    → Insights: "app session" avg session_duration_sec, breakdown month_end_anxiety
 *    → Insights: "balance checked" avg account_balance, breakdown month_end_check
 *
 * ===================================================================
 * ADVANCED ANALYSIS IDEAS
 * ===================================================================
 *
 * Cross-hook patterns:
 *   - Budget + Low Balance: Do budget creators avoid low-balance churn?
 *   - Premium + Auto-Pay: Do premium users adopt auto-pay more?
 *   - Fraud + Churn: Do fraud victims churn more? Does resolution help?
 *   - Payday + Month-End: Do payday spenders run out by month-end?
 *   - Business vs Personal Fraud: Are business accounts more targeted?
 *
 * Cohort analysis:
 *   - By account_tier: upgrade paths, value realization
 *   - By signup_channel: referral retention vs organic
 *   - By income_bracket: feature adoption by income
 *   - By credit_score_range: loan approvals, tier adoption
 *
 * ===================================================================
 * EXPECTED METRICS SUMMARY
 * ===================================================================
 *
 * Hook                  | Metric                | Baseline | Effect | Ratio
 * ----------------------|-----------------------|----------|--------|------
 * Personal vs Business  | Avg transaction amt   | $50      | $200+  | ~4x
 * Payday Patterns       | Deposit amount        | $50      | $100   | 2x
 * Fraud Detection       | Users affected        | 0%       | 3%     | --
 * Low Balance Churn     | D30+ event count      | 100%     | 50%    | 0.5x
 * Budget Discipline     | Monthly contribution  | $200     | $400   | 2x
 * Auto-Pay Loyalty      | Bill completion rate   | 100%     | 70%    | 0.7x
 * Premium Tier Value    | Reward value           | $10      | $30    | 3x
 * Month-End Anxiety     | Session duration       | 60s      | 84s    | 1.4x
 */

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
			sequence: ["account opened", "app session", "balance checked"],
			isFirstFunnel: true,
			conversionRate: 85,
			timeToConvert: 0.25,
		},
		{
			// Daily banking: check balance, view transactions - most common activity
			sequence: ["app session", "balance checked", "transaction completed"],
			conversionRate: 80,
			timeToConvert: 0.5,
			weight: 5,
		},
		{
			// Transfers and notifications
			sequence: ["app session", "transfer sent", "notification opened"],
			conversionRate: 50,
			timeToConvert: 1,
			weight: 3,
		},
		{
			// Bill payment flow
			sequence: ["app session", "bill paid", "notification opened"],
			conversionRate: 60,
			timeToConvert: 1,
			weight: 3,
		},
		{
			// Financial planning: budgets and savings
			sequence: ["budget created", "budget alert", "savings goal set"],
			conversionRate: 40,
			timeToConvert: 12,
			weight: 2,
		},
		{
			// Investment and rewards
			sequence: ["balance checked", "investment made", "reward redeemed"],
			conversionRate: 30,
			timeToConvert: 5,
			weight: 2,
		},
		{
			// Support and account management
			sequence: ["support contacted", "card locked", "dispute filed"],
			conversionRate: 35,
			timeToConvert: 2,
			weight: 1,
		},
		{
			// Lending flow
			sequence: ["loan applied", "loan approved", "premium upgraded"],
			conversionRate: 25,
			timeToConvert: 10,
			weight: 1,
		},
	],

	events: [
		{
			event: "account opened",
			weight: 1,
			isFirstEvent: true,
			properties: {
				"account_type": u.pickAWinner(["personal", "business", "personal"]),
				"signup_channel": ["app", "web", "referral", "branch"],
			}
		},
		{
			event: "app session",
			weight: 20,
			properties: {
				"session_duration_sec": u.weighNumRange(10, 600, 0.3, 60),
				"pages_viewed": u.weighNumRange(1, 15, 0.5, 3),
			}
		},
		{
			event: "balance checked",
			weight: 15,
			properties: {
				"account_balance": u.weighNumRange(0, 50000, 0.8, 2500),
				"account_type": ["checking", "savings", "investment"],
			}
		},
		{
			event: "transaction completed",
			weight: 18,
			properties: {
				"transaction_type": ["purchase", "atm", "direct_deposit", "refund"],
				"amount": u.weighNumRange(1, 5000, 0.3, 50),
				"merchant_category": ["grocery", "restaurant", "gas", "retail", "online", "subscription", "utilities"],
				"payment_method": ["debit", "credit", "contactless", "online"],
			}
		},
		{
			event: "transfer sent",
			weight: 8,
			properties: {
				"transfer_type": ["internal", "external", "p2p", "wire"],
				"amount": u.weighNumRange(10, 10000, 0.3, 200),
				"recipient_type": ["friend", "family", "business", "self"],
			}
		},
		{
			event: "bill paid",
			weight: 6,
			properties: {
				"bill_type": ["rent", "utilities", "phone", "insurance", "subscription", "loan_payment"],
				"amount": u.weighNumRange(20, 3000, 0.5, 150),
				"auto_pay": u.pickAWinner([true, false], 0.4),
			}
		},
		{
			event: "budget created",
			weight: 3,
			properties: {
				"category": ["food", "transport", "entertainment", "shopping", "bills", "savings"],
				"monthly_limit": u.weighNumRange(50, 2000, 0.5, 300),
			}
		},
		{
			event: "budget alert",
			weight: 4,
			properties: {
				"alert_type": ["approaching_limit", "exceeded", "on_track"],
				"percent_used": u.weighNumRange(50, 150, 1, 90),
			}
		},
		{
			event: "savings goal set",
			weight: 3,
			properties: {
				"goal_type": ["emergency", "vacation", "car", "home", "education", "retirement"],
				"target_amount": u.weighNumRange(500, 50000, 0.3, 5000),
				"monthly_contribution": u.weighNumRange(25, 2000, 0.5, 200),
			}
		},
		{
			event: "investment made",
			weight: 4,
			properties: {
				"investment_type": ["stocks", "etf", "crypto", "bonds", "mutual_fund"],
				"amount": u.weighNumRange(10, 10000, 0.3, 250),
				"action": u.pickAWinner(["buy", "sell", "buy"]),
			}
		},
		{
			event: "card locked",
			weight: 1,
			properties: {
				"reason": ["lost", "stolen", "suspicious_activity", "travel"],
			}
		},
		{
			event: "dispute filed",
			weight: 1,
			properties: {
				"dispute_amount": u.weighNumRange(10, 2000, 0.5, 100),
				"reason": ["unauthorized", "duplicate", "not_received", "damaged", "wrong_amount"],
			}
		},
		{
			event: "loan applied",
			weight: 2,
			properties: {
				"loan_type": ["personal", "auto", "home", "student", "business"],
				"requested_amount": u.weighNumRange(1000, 100000, 0.3, 10000),
			}
		},
		{
			event: "loan approved",
			weight: 1,
			properties: {
				"loan_type": ["personal", "auto", "home", "student", "business"],
				"approved_amount": u.weighNumRange(1000, 100000, 0.3, 10000),
				"interest_rate": u.weighNumRange(3, 25, 1, 8),
			}
		},
		{
			event: "premium upgraded",
			weight: 2,
			properties: {
				"old_tier": ["basic", "plus", "premium"],
				"new_tier": u.pickAWinner(["plus", "premium", "premium"]),
				"monthly_fee": u.pickAWinner([4.99, 9.99, 14.99]),
			}
		},
		{
			event: "support contacted",
			weight: 3,
			properties: {
				"channel": ["chat", "phone", "email", "in_app"],
				"issue_type": ["transaction", "account", "card", "transfer", "technical"],
				"resolved": u.pickAWinner([true, false], 0.8),
			}
		},
		{
			event: "notification opened",
			weight: 10,
			properties: {
				"notification_type": ["transaction", "low_balance", "bill_due", "reward", "security", "promo"],
				"action_taken": u.pickAWinner([true, false], 0.6),
			}
		},
		{
			event: "reward redeemed",
			weight: 4,
			properties: {
				"reward_type": ["cashback", "points", "discount", "partner_offer"],
				"value": u.weighNumRange(1, 100, 0.5, 10),
			}
		}
	],

	superProps: {
		account_tier: u.pickAWinner(["basic", "basic", "basic", "plus", "plus", "premium"]),
		platform: ["ios", "android", "web"],
	},

	userProps: {
		"credit_score_range": ["300-579", "580-669", "670-739", "740-799", "800-850"],
		"income_bracket": ["under_30k", "30k_50k", "50k_75k", "75k_100k", "100k_150k", "over_150k"],
		"account_age_months": u.weighNumRange(1, 60, 0.5, 12),
		"total_balance": u.weighNumRange(0, 100000, 0.3, 5000),
		"has_direct_deposit": u.pickAWinner([true, false], 0.6),
	},

	groupKeys: [
		["household_id", 500, ["transaction completed", "transfer sent", "bill paid", "savings goal set"]],
	],

	groupProps: {
		household_id: {
			"household_size": u.weighNumRange(1, 6),
			"combined_income": u.weighNumRange(20000, 300000, 0.3, 75000),
			"financial_health_score": u.weighNumRange(1, 100, 1, 65),
			"primary_bank": u.pickAWinner(["NexBank_only", "multi_bank", "NexBank_only"]),
		}
	},

	lookupTables: [],

	/**
	 * ARCHITECTED ANALYTICS HOOKS
	 *
	 * This hook function creates 8 deliberate patterns in the data:
	 *
	 * 1. PERSONAL VS BUSINESS: Business accounts get employee_count, revenue; personal get age_range, life_stage
	 * 2. PAYDAY PATTERNS: Transactions spike on 1st/15th with bigger deposits and post-payday spending
	 * 3. FRAUD DETECTION: 3% of users experience a fraud burst (rapid high-value txns -> card lock -> dispute -> support)
	 * 4. LOW BALANCE CHURN: Users with chronic low balances (<$15K) lose 50% of activity after day 30
	 * 5. BUDGET DISCIPLINE: Budget creators save 2x more and invest 1.5x more
	 * 6. AUTO-PAY LOYALTY: Auto-pay users never miss bills; manual payers miss 30%
	 * 7. PREMIUM TIER VALUE: Premium users get 3x rewards; Plus users get 1.5x; Premium investors get 2x returns
	 * 8. MONTH-END ANXIETY: Last 3 days of month see 40% longer sessions and 30% lower balances
	 */
	hook: function (record, type, meta) {
		const NOW = dayjs();
		const DATASET_START = NOW.subtract(days, "days");

		// ===============================================================
		// Hook #1: PERSONAL VS BUSINESS ACCOUNTS (user)
		// 20% of users are randomly tagged as business accounts with
		// employee_count, annual_revenue, and industry. The other 80% get
		// personal attributes: age_range and life_stage.
		// ===============================================================
		if (type === "user") {
			const isBusiness = chance.bool({ likelihood: 20 });
			if (isBusiness) {
				record.account_segment = "business";
				record.employee_count = chance.integer({ min: 5, max: 500 });
				record.annual_revenue = chance.integer({ min: 100000, max: 10000000 });
				record.industry = chance.pickone(["tech", "retail", "food", "services", "healthcare"]);
			} else {
				record.account_segment = "personal";
				record.age_range = `${chance.pickone([18, 25, 35, 45, 55])}-${chance.pickone([24, 34, 44, 54, 65])}`;
				record.life_stage = chance.pickone(["student", "early_career", "established", "pre_retirement", "retired"]);
			}
		}

		// ===============================================================
		// Hook #2: PAYDAY PATTERNS (event)
		// On the 1st and 15th, direct deposit transactions are 2x bigger
		// and tagged with payday: true. On days 1-3 and 15-17, transfers
		// have a 40% chance of 1.5x boost (post-payday spending).
		// ===============================================================
		if (type === "event") {
			const EVENT_TIME = dayjs(record.time);
			const dayOfMonth = EVENT_TIME.date();

			// Payday: 1st and 15th
			if (record.event === "transaction completed" && record.transaction_type === "direct_deposit") {
				if (dayOfMonth === 1 || dayOfMonth === 15) {
					record.amount = Math.floor((record.amount || 50) * 3);
					record.payday = true;
				} else {
					record.payday = false;
				}
			}

			// Post-payday spending: days 1-3 and 15-17
			if (record.event === "transfer sent") {
				const isPaydayWindow = (dayOfMonth >= 1 && dayOfMonth <= 3) || (dayOfMonth >= 15 && dayOfMonth <= 17);
				if (isPaydayWindow && chance.bool({ likelihood: 60 })) {
					record.amount = Math.floor((record.amount || 200) * 2.0);
					record.post_payday_spending = true;
				} else {
					record.post_payday_spending = false;
				}
			}

			// ===============================================================
			// Hook #6: AUTO-PAY LOYALTY (event)
			// Users with auto_pay=false on bill paid events have a 30% chance
			// of the event being dropped entirely (missed payment). Surviving
			// manual payments get tagged. Auto-pay users always succeed.
			// ===============================================================
			if (record.event === "bill paid") {
				if (record.auto_pay === false || record.auto_pay === undefined) {
					if (chance.bool({ likelihood: 30 })) {
						record.event = "bill payment missed";
						record.missed_payment = true;
						record.manual_payment = false;
					} else {
						record.missed_payment = false;
						record.manual_payment = true;
					}
				} else {
					record.missed_payment = false;
					record.manual_payment = false;
				}
			}

			// ===============================================================
			// Hook #7: PREMIUM TIER VALUE (event)
			// Premium tier users get 3x reward values and 2x investment sell
			// returns. Plus tier users get 1.5x rewards.
			// ===============================================================
			if (record.event === "reward redeemed") {
				if (record.account_tier === "premium") {
					record.value = Math.floor((record.value || 10) * 3);
					record.premium_reward = true;
				} else if (record.account_tier === "plus") {
					record.value = Math.floor((record.value || 10) * 1.5);
					record.premium_reward = false;
				} else {
					record.premium_reward = false;
				}
			}

			if (record.event === "investment made" && record.action === "sell") {
				if (record.account_tier === "premium") {
					record.amount = Math.floor((record.amount || 250) * 2);
					record.premium_returns = true;
				} else {
					record.premium_returns = false;
				}
			}

			// ===============================================================
			// Hook #8: MONTH-END ANXIETY (event)
			// Last 3 days of month (day >= 28) see 40% longer app sessions
			// and 30% lower balances when checked.
			// ===============================================================
			if (record.event === "app session") {
				if (dayOfMonth >= 28) {
					record.session_duration_sec = Math.floor((record.session_duration_sec || 60) * 1.4);
					record.month_end_anxiety = true;
				} else {
					record.month_end_anxiety = false;
				}
			}

			if (record.event === "balance checked") {
				if (dayOfMonth >= 28) {
					record.account_balance = Math.floor((record.account_balance || 2500) * 0.7);
					record.month_end_check = true;
				} else {
					record.month_end_check = false;
				}
			}
		}

		// ===============================================================
		// Hook #3, #4, #5: EVERYTHING - Complex behavioral patterns
		// These hooks operate on the full event stream per user for
		// fraud injection, low-balance churn, and budget discipline.
		// ===============================================================
		if (type === "everything") {
			const userEvents = record;
			const firstEventTime = userEvents.length > 0 ? dayjs(userEvents[0].time) : null;

			// -----------------------------------------------------------
			// Hook #3: FRAUD DETECTION PATTERN
			// 3% of users experience a fraud event sequence: a burst of
			// 3-5 rapid high-value transactions within 1 hour, followed by
			// card locked, dispute filed, and support contacted events.
			// All injected events are tagged with fraud_sequence: true.
			// -----------------------------------------------------------
			if (chance.bool({ likelihood: 3 })) {
				// Find the midpoint of the user's timeline
				if (userEvents.length >= 2) {
					const midIdx = Math.floor(userEvents.length / 2);
					const midEvent = userEvents[midIdx];
					const midTime = dayjs(midEvent.time);
					const distinctId = midEvent.user_id;

					// Inject 3-5 rapid high-value transactions
					const burstCount = chance.integer({ min: 3, max: 5 });
					const fraudEvents = [];

					for (let i = 0; i < burstCount; i++) {
						fraudEvents.push({
							event: "transaction completed",
							time: midTime.add(i * 10, "minutes").toISOString(),
							user_id: distinctId,
							transaction_type: "purchase",
							amount: chance.integer({ min: 500, max: 3000 }),
							merchant_category: chance.pickone(["online", "retail"]),
							payment_method: "credit",
							fraud_sequence: true,
						});
					}

					// Card locked after the burst
					fraudEvents.push({
						event: "card locked",
						time: midTime.add(burstCount * 10 + 5, "minutes").toISOString(),
						user_id: distinctId,
						reason: "suspicious_activity",
						fraud_sequence: true,
					});

					// Dispute filed shortly after
					fraudEvents.push({
						event: "dispute filed",
						time: midTime.add(burstCount * 10 + 30, "minutes").toISOString(),
						user_id: distinctId,
						dispute_amount: chance.integer({ min: 500, max: 3000 }),
						reason: "unauthorized",
						fraud_sequence: true,
					});

					// Support contacted
					fraudEvents.push({
						event: "support contacted",
						time: midTime.add(burstCount * 10 + 45, "minutes").toISOString(),
						user_id: distinctId,
						channel: "phone",
						issue_type: "card",
						resolved: true,
						fraud_sequence: true,
					});

					// Splice all fraud events into the user's timeline
					userEvents.splice(midIdx + 1, 0, ...fraudEvents);
				}
			}

			// -----------------------------------------------------------
			// Hook #4: LOW BALANCE CHURN
			// Users who have 3+ balance checks showing < $15,000 are
			// "struggling". After day 30, 50% of their events are removed
			// and remaining events are tagged low_balance_churn: true.
			// -----------------------------------------------------------
			let lowBalanceChecks = 0;
			userEvents.forEach((event) => {
				if (event.event === "balance checked" && (event.account_balance || 0) < 15000) {
					lowBalanceChecks++;
				}
			});

			if (lowBalanceChecks >= 3) {
				const day30 = DATASET_START.add(30, "days");
				for (let i = userEvents.length - 1; i >= 0; i--) {
					const evt = userEvents[i];
					if (dayjs(evt.time).isAfter(day30)) {
						if (chance.bool({ likelihood: 50 })) {
							userEvents.splice(i, 1);
						} else {
							evt.low_balance_churn = true;
						}
					}
				}
			}

			// -----------------------------------------------------------
			// Hook #5: BUDGET USERS SAVE MORE
			// Users who created any budget have 2x savings contributions,
			// 1.5x investment amounts, and extra savings goal events
			// spliced into their timeline. Tagged budget_discipline: true.
			// -----------------------------------------------------------
			let hasBudget = false;
			userEvents.forEach((event) => {
				if (event.event === "budget created") {
					hasBudget = true;
				}
			});

			if (hasBudget) {
				userEvents.forEach((event, idx) => {
					const eventTime = dayjs(event.time);

					// Double savings contributions
					if (event.event === "savings goal set") {
						event.monthly_contribution = Math.floor((event.monthly_contribution || 200) * 2);
						event.budget_discipline = true;
					}

					// 1.5x investment amounts
					if (event.event === "investment made") {
						event.amount = Math.floor((event.amount || 250) * 1.5);
						event.budget_discipline = true;
					}

					// Splice extra savings goal events (budget-conscious users set more goals)
					if (event.event === "budget created" && chance.bool({ likelihood: 50 })) {
						const extraGoal = {
							event: "savings goal set",
							time: eventTime.add(chance.integer({ min: 1, max: 7 }), "days").toISOString(),
							user_id: event.user_id,
							goal_type: chance.pickone(["emergency", "vacation", "car", "home"]),
							target_amount: chance.integer({ min: 1000, max: 20000 }),
							monthly_contribution: chance.integer({ min: 100, max: 800 }),
							budget_discipline: true,
						};
						userEvents.splice(idx + 1, 0, extraGoal);
					}
				});
			}
		}

		return record;
	}
};

export default config;
