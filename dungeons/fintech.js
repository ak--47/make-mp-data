import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";

const SEED = "harness-fintech";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef  {import("../../types.js").Dungeon} Config */

/**
 * NEEDLE IN A HAYSTACK - NEOBANK APP DESIGN
 *
 * NexBank - A Chime/Revolut-style neobank app where users manage accounts, make transactions,
 * send transfers, pay bills, set budgets, invest, apply for loans, and earn rewards.
 *
 * CORE USER LOOP:
 * Users open accounts (personal or business) through one of four channels (app, web, referral,
 * branch). They begin using the app to check balances, make transactions (purchases, ATM
 * withdrawals, direct deposits, refunds), and send transfers (internal, external, P2P, wire).
 * The app tracks spending patterns and encourages financial wellness through budgets, savings
 * goals, and investment tools.
 *
 * ACCOUNT TIERS:
 * Three-tiered system drives monetization and user segmentation:
 * - Basic (free): Standard banking, limited rewards
 * - Plus ($4.99/mo): Enhanced rewards, priority support, budgeting tools
 * - Premium ($14.99/mo): 3x rewards, 2x investment returns, premium analytics
 * Tiers are assigned as superProps, creating a persistent segmentation dimension.
 *
 * TRANSACTION ECOSYSTEM:
 * Transactions are the heartbeat of the app. Seven merchant categories (grocery, restaurant,
 * gas, retail, online, subscription, utilities) and four payment methods (debit, credit,
 * contactless, online) model realistic spending. Transaction amounts follow a power-law
 * distribution centered around $50, with occasional large purchases up to $5,000.
 *
 * FINANCIAL WELLNESS:
 * Budget creation and alerts model the "financial health" feature set. Users create budgets
 * across six categories with monthly limits, then receive alerts when approaching or exceeding
 * limits. This creates a measurable engagement loop: budget creators save more and invest more
 * (Hook #5: Budget Users Save More).
 *
 * SAVINGS & INVESTMENT:
 * Savings goals (emergency, vacation, car, home, education, retirement) with target amounts
 * and monthly contributions model long-term financial planning. Investment events (stocks, ETF,
 * crypto, bonds, mutual funds) with buy/sell actions model portfolio activity.
 *
 * LENDING:
 * Loan applications (personal, auto, home, student, business) flow through apply-to-approved
 * funnel. Requested vs. approved amounts and interest rates create realistic lending analytics.
 *
 * SUPPORT & ENGAGEMENT:
 * Support contacts across four channels (chat, phone, email, in-app) with resolution tracking.
 * Notifications (transaction, low_balance, bill_due, reward, security, promo) with action
 * tracking model re-engagement effectiveness.
 *
 * BILL PAYMENTS:
 * Six bill types (rent, utilities, phone, insurance, subscription, loan_payment) with auto-pay
 * toggle. Hook #6 (Auto-Pay Loyalty) creates a pattern where auto-pay users never miss
 * payments while manual payers miss 30%, modeling real-world payment reliability.
 *
 * REWARDS:
 * Four reward types (cashback, points, discount, partner_offer) with values scaled by
 * account tier. Premium users earn 3x rewards (Hook #7), creating clear tier-based value
 * differentiation visible in the data.
 *
 * HOUSEHOLD GROUPS:
 * 500 households group users for shared financial analytics. Household-level properties
 * (size, combined income, financial health score, primary bank) enable group-level analysis
 * of shared financial behaviors.
 *
 * WHY THESE EVENTS/PROPERTIES?
 * - Events model a complete banking loop: onboarding -> daily use -> financial planning -> monetization
 * - Properties enable cohort analysis: account type, tier, income bracket, credit score
 * - Funnels reveal friction: onboarding completion, transfer flows, investment journeys
 * - Financial wellness features (budgets, goals) create engagement depth visible in the data
 * - Tier-based rewards and investment returns drive business metric differences
 * - The "needle in haystack" hooks simulate real fintech product insights hidden in production data
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
	 * 4. LOW BALANCE CHURN: Users with chronic low balances (<$500) lose 50% of activity after day 30
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
			// Users who have 3+ balance checks showing < $500 are
			// "struggling". After day 30, 50% of their events are removed
			// and remaining events are tagged low_balance_churn: true.
			// -----------------------------------------------------------
			let lowBalanceChecks = 0;
			userEvents.forEach((event) => {
				if (event.event === "balance checked" && (event.account_balance || 0) < 3000) {
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

/**
 * ===================================================================
 * NEEDLE IN A HAYSTACK - NEXBANK NEOBANK ANALYTICS
 * ===================================================================
 *
 * A Chime/Revolut-style neobank dungeon with 8 deliberately architected
 * analytics insights hidden in the data. This dungeon is designed to
 * showcase advanced fintech product analytics patterns and demonstrate
 * how to find "needles" (meaningful insights) in "haystacks" (large
 * banking datasets).
 *
 * ===================================================================
 * DATASET OVERVIEW
 * ===================================================================
 *
 * - 5,000 users over 100 days
 * - 360,000 events across 18 event types
 * - 3 funnels (onboarding, transfer flow, investment journey)
 * - Group analytics (500 households)
 * - Lookup table (500 merchant/transaction entries)
 * - Account tiers (Basic, Plus, Premium)
 *
 * ===================================================================
 * THE 8 ARCHITECTED HOOKS
 * ===================================================================
 *
 * Each hook creates a specific, discoverable analytics insight that
 * simulates real-world fintech product behavior patterns.
 *
 * -------------------------------------------------------------------
 * 1. PERSONAL VS BUSINESS ACCOUNTS (user)
 * -------------------------------------------------------------------
 *
 * PATTERN: 20% of users are business accounts with employee_count
 * (5-500), annual_revenue ($100K-$10M), and industry. The other 80%
 * are personal accounts with age_range and life_stage.
 *
 * HOW TO FIND IT:
 *   - Segment users by: account_segment = "business" vs "personal"
 *   - Compare: Transaction volumes, average amounts, transfer patterns
 *   - Analyze: Industry distribution among business accounts
 *
 * EXPECTED INSIGHT: Business accounts have fundamentally different
 * usage patterns - higher transaction amounts, more wire transfers,
 * and different bill payment profiles.
 *
 * REAL-WORLD ANALOGUE: Identifying and serving different customer
 * segments (B2C vs B2B) with tailored features and pricing.
 *
 * -------------------------------------------------------------------
 * 2. PAYDAY PATTERNS (event)
 * -------------------------------------------------------------------
 *
 * PATTERN: On the 1st and 15th of each month, direct deposit
 * transactions are 2x bigger and tagged with payday: true. On days
 * 1-3 and 15-17, transfer amounts have a 40% chance of being 1.5x
 * larger, tagged with post_payday_spending: true.
 *
 * HOW TO FIND IT:
 *   - Chart: transaction completed count and amount by day of month
 *   - Filter: transaction_type = "direct_deposit"
 *   - Compare: Average transfer amount on days 1-3/15-17 vs other days
 *   - Look for: payday: true and post_payday_spending: true tags
 *
 * EXPECTED INSIGHT: Clear biweekly spikes in deposit amounts and
 * subsequent spending activity. The 2-3 days after payday show
 * elevated transfer activity as users move money around.
 *
 * REAL-WORLD ANALOGUE: Payroll cycle effects on banking activity.
 * Banks use this to time marketing, credit offers, and overdraft
 * protection promotions.
 *
 * -------------------------------------------------------------------
 * 3. FRAUD DETECTION PATTERN (everything)
 * -------------------------------------------------------------------
 *
 * PATTERN: 3% of users experience a fraud event sequence at their
 * timeline midpoint: 3-5 rapid high-value transactions ($500-$3,000)
 * within 1 hour, followed by card locked (suspicious_activity),
 * dispute filed (unauthorized), and support contacted (phone/card).
 * All injected events tagged with fraud_sequence: true.
 *
 * HOW TO FIND IT:
 *   - Filter events: fraud_sequence = true
 *   - Analyze: Time between fraud transactions (< 10 min gaps)
 *   - Funnel: transaction completed -> card locked -> dispute filed -> support contacted
 *   - Segment: Users with any fraud_sequence event
 *
 * EXPECTED INSIGHT: ~150 users (3% of 5,000) show a distinctive burst
 * pattern of rapid high-value purchases followed by account lockdown.
 * Clear temporal clustering of fraud events.
 *
 * REAL-WORLD ANALOGUE: Fraud detection in banking. Unusual velocity
 * and amount patterns trigger automated alerts and account freezes.
 *
 * -------------------------------------------------------------------
 * 4. LOW BALANCE CHURN (everything)
 * -------------------------------------------------------------------
 *
 * PATTERN: Users with 3+ balance checks showing < $500 are
 * "struggling" users. After day 30, 50% of their events are removed
 * (simulating reduced app usage) and surviving events are tagged
 * with low_balance_churn: true.
 *
 * HOW TO FIND IT:
 *   - Segment: Users where count of (balance checked, account_balance < 500) >= 3
 *   - Compare: Event counts before day 30 vs after day 30
 *   - Filter: low_balance_churn = true
 *   - Retention analysis: Compare D30+ retention for low vs healthy balance users
 *
 * EXPECTED INSIGHT: Struggling users show a dramatic drop in activity
 * after the first month. Their engagement halves while healthy-balance
 * users maintain consistent usage.
 *
 * REAL-WORLD ANALOGUE: Financial stress-driven churn. Users who
 * can't maintain balances disengage from their banking app, which
 * predicts account closure.
 *
 * -------------------------------------------------------------------
 * 5. BUDGET USERS SAVE MORE (everything)
 * -------------------------------------------------------------------
 *
 * PATTERN: Users who create any budget have 2x monthly savings
 * contributions, 1.5x investment amounts, and extra savings goal
 * events spliced into their timeline. All affected events tagged
 * with budget_discipline: true.
 *
 * HOW TO FIND IT:
 *   - Segment: Users who did "budget created" vs those who didn't
 *   - Compare: Average monthly_contribution on savings goal events
 *   - Compare: Average investment amount
 *   - Count: savings goal set events per user (budget users have more)
 *   - Filter: budget_discipline = true
 *
 * EXPECTED INSIGHT: Budget creators save 2x more and invest 1.5x more
 * than non-budget users. They also set more savings goals, showing
 * compound financial wellness behavior.
 *
 * REAL-WORLD ANALOGUE: Financial planning tools drive better outcomes.
 * Users who engage with budgeting features are more financially active
 * and retain longer - a key product-market fit signal.
 *
 * -------------------------------------------------------------------
 * 6. AUTO-PAY LOYALTY (event)
 * -------------------------------------------------------------------
 *
 * PATTERN: Bill paid events with auto_pay = false have a 30% chance
 * of being dropped entirely (simulating missed payments). Auto-pay
 * users never miss. Surviving manual payments are tagged with
 * manual_payment: true.
 *
 * HOW TO FIND IT:
 *   - Segment: bill paid events by auto_pay = true vs false
 *   - Compare: Total bill paid count per user in each segment
 *   - Calculate: Effective bill completion rate by segment
 *   - Filter: manual_payment = true for surviving manual payments
 *
 * EXPECTED INSIGHT: Auto-pay users have 100% bill completion while
 * manual payers show only ~70% completion. This creates a clear
 * reliability gap that would drive auto-pay adoption campaigns.
 *
 * REAL-WORLD ANALOGUE: Auto-pay enrollment is one of the strongest
 * retention predictors in fintech. Users who set up auto-pay are
 * less likely to miss payments and less likely to churn.
 *
 * -------------------------------------------------------------------
 * 7. PREMIUM TIER VALUE (event)
 * -------------------------------------------------------------------
 *
 * PATTERN: Premium tier users get 3x reward values and 2x investment
 * sell returns. Plus tier users get 1.5x rewards. Tagged with
 * premium_reward: true and premium_returns: true respectively.
 *
 * HOW TO FIND IT:
 *   - Segment: Events by account_tier (basic, plus, premium)
 *   - Compare: Average reward value on reward redeemed events
 *   - Compare: Average amount on investment made (action = sell)
 *   - Filter: premium_reward = true, premium_returns = true
 *   - Analyze: Total reward value per user by tier
 *
 * EXPECTED INSIGHT: Clear tier-based value curve. Premium users
 * earn 3x the rewards and 2x the investment returns of Basic users,
 * with Plus users in between. This validates tier pricing.
 *
 * REAL-WORLD ANALOGUE: Premium banking tiers that provide tangible
 * financial benefits. The reward multiplier justifies the monthly
 * fee and drives upgrade conversions.
 *
 * -------------------------------------------------------------------
 * 8. MONTH-END ANXIETY (event)
 * -------------------------------------------------------------------
 *
 * PATTERN: On the last 3 days of each month (day >= 28), app sessions
 * are 40% longer and balance checks show 30% lower balances. Tagged
 * with month_end_anxiety: true and month_end_check: true.
 *
 * HOW TO FIND IT:
 *   - Chart: Average session_duration_sec by day of month
 *   - Chart: Average account_balance on balance checked by day of month
 *   - Filter: month_end_anxiety = true, month_end_check = true
 *   - Compare: Day 1-27 vs day 28-31 engagement metrics
 *
 * EXPECTED INSIGHT: Users spend 40% more time in the app at month-end,
 * checking lower balances. This reflects pre-bill-pay anxiety and
 * end-of-month financial stress.
 *
 * REAL-WORLD ANALOGUE: Month-end financial anxiety drives app
 * engagement spikes. Banks can leverage this pattern for timely
 * overdraft protection offers, savings nudges, and bill reminders.
 *
 * ===================================================================
 * ADVANCED ANALYSIS IDEAS
 * ===================================================================
 *
 * CROSS-HOOK PATTERNS:
 *
 * 1. Budget + Low Balance: Do budget creators (Hook #5) avoid the
 *    low-balance churn pattern (Hook #4)? Budget discipline should
 *    correlate with healthier balances.
 *
 * 2. Premium + Auto-Pay: Do premium tier users (Hook #7) have higher
 *    auto-pay adoption than basic users? Does tier upgrading predict
 *    auto-pay enrollment?
 *
 * 3. Fraud + Churn: Do fraud victims (Hook #3) churn more than
 *    non-victims? Does support resolution quality affect post-fraud
 *    retention?
 *
 * 4. Payday + Month-End: Compare payday spending spikes (Hook #2)
 *    with month-end anxiety (Hook #8). Do payday spenders run out
 *    of money by month-end?
 *
 * 5. Business vs Personal Fraud: Are business accounts (Hook #1)
 *    more or less likely to be fraud targets (Hook #3)?
 *
 * COHORT ANALYSIS:
 *
 * - Cohort by account_tier: Track upgrade paths and value realization
 *   across Basic -> Plus -> Premium
 * - Cohort by signup_channel: Do referral users have better retention
 *   and higher balances?
 * - Cohort by income_bracket: How does income correlate with feature
 *   adoption (budgets, investments, savings goals)?
 * - Cohort by credit_score_range: Do higher credit scores predict
 *   loan approvals and premium tier adoption?
 *
 * FUNNEL ANALYSIS:
 *
 * - Onboarding Funnel: account opened -> app session -> balance checked
 *   by account type and signup channel
 * - Transfer Flow: app session -> transfer sent -> notification opened
 *   by tier and platform
 * - Investment Journey: balance checked -> investment made -> reward redeemed
 *   by income bracket and budget creation status
 *
 * ===================================================================
 * EXPECTED METRICS SUMMARY
 * ===================================================================
 *
 * Hook                  | Metric                | Baseline | Hook Effect | Ratio
 * ----------------------|-----------------------|----------|-------------|------
 * Personal vs Business  | Avg transaction amt   | $50      | $200+       | ~4x
 * Payday Patterns       | Deposit amount        | $50      | $100        | 2x
 * Fraud Detection       | Users affected        | 0%       | 3%          | --
 * Low Balance Churn     | D30+ event count      | 100%     | 50%         | 0.5x
 * Budget Discipline     | Monthly contribution  | $200     | $400        | 2x
 * Auto-Pay Loyalty      | Bill completion rate   | 100%     | 70%         | 0.7x
 * Premium Tier Value    | Reward value           | $10      | $30         | 3x
 * Month-End Anxiety     | Session duration       | 60s      | 84s         | 1.4x
 *
 * ===================================================================
 * HOW TO RUN THIS DUNGEON
 * ===================================================================
 *
 * From the dm4 root directory:
 *
 *   npm start
 *
 * Or programmatically:
 *
 *   import generate from './index.js';
 *   import config from './dungeons/harness-fintech.js';
 *   const results = await generate(config);
 *
 * OUTPUT FILES (with writeToDisk: false):
 *
 *   - needle-haystack-fintech__events.json.gz       - All event data
 *   - needle-haystack-fintech__user_profiles.json.gz - User profiles
 *   - needle-haystack-fintech__group_profiles.json.gz - Household profiles
 *   - needle-haystack-fintech__transaction_id_lookup.json.gz - Merchant catalog
 *
 * ===================================================================
 * TESTING YOUR ANALYTICS PLATFORM
 * ===================================================================
 *
 * This dungeon is perfect for testing:
 *
 * 1. Segmentation: Can you separate business vs personal accounts?
 * 2. Time Patterns: Can you detect the biweekly payday cycle?
 * 3. Anomaly Detection: Can you find the fraud burst patterns?
 * 4. Churn Prediction: Can you predict churn from low balance signals?
 * 5. Feature Impact: Can you measure budget tools' effect on savings?
 * 6. Behavioral Analysis: Can you quantify auto-pay vs manual reliability?
 * 7. Tier Analysis: Can you calculate reward ROI by account tier?
 * 8. Temporal Patterns: Can you identify month-end anxiety in the data?
 *
 * ===================================================================
 * WHY "NEEDLE IN A HAYSTACK"?
 * ===================================================================
 *
 * Each hook is a "needle" - a meaningful, actionable insight hidden in a
 * "haystack" of 360K events. The challenge is:
 *
 * 1. FINDING the needles (discovery)
 * 2. VALIDATING they're real patterns (statistical significance)
 * 3. UNDERSTANDING why they matter (business impact)
 * 4. ACTING on them (product decisions)
 *
 * This mirrors real-world fintech analytics: your transaction data contains
 * valuable insights about user behavior, but you need the right tools and
 * skills to find them.
 *
 * ===================================================================
 */
