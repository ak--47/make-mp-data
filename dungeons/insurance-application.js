import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";

const SEED = "dm4-insurance";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef {import("../types").Dungeon} Config */

/*
 * ===================================================================
 * DATASET OVERVIEW
 * ===================================================================
 *
 * SAFEHAVEN INSURANCE — Web Application Dungeon
 *
 * SafeHaven Insurance is a modern insurance application where users
 * browse coverage options, request quotes, complete multi-step
 * applications, manage policies, file claims, and make premium payments.
 *
 * - 5,000 users over 100 days
 * - 600,000 events across 18 event types
 * - 5 funnels (onboarding, application, approval, claims, renewal)
 * - 5 insurance types as super property (auto, home, life, health, renters)
 * - Deterministic app versioning (2.10 → 2.11 → 2.12 → 2.13)
 * - Platforms: web, iOS, Android
 *
 * CORE LOOP:
 * Users create an account, browse insurance products, and request quotes.
 * They start multi-step applications (personal info, coverage selection,
 * document upload) and submit for approval. Once approved, they activate
 * a policy, make premium payments, and manage renewals. If something
 * goes wrong, they file claims and create support tickets.
 *
 * KEY DATA STORY — VERSION 2.13 RELEASE:
 * The app has gone through versions 2.10 → 2.11 → 2.12 → 2.13.
 * Version 2.13 was released 10 days ago and fixed critical UX issues.
 * Two effects are visible: support ticket volume drops immediately,
 * and application funnel conversion improves significantly.
 */

/*
 * ===================================================================
 * ANALYTICS HOOKS
 * ===================================================================
 *
 * -------------------------------------------------------------------
 * 1. VERSION STAMPING (event hook)
 * -------------------------------------------------------------------
 * Every event gets a deterministic app_version based on its timestamp.
 * All users shift simultaneously on release dates:
 *   - Days 0-30:    v2.10
 *   - Days 30-60:   v2.11
 *   - Days 60-90:   v2.12
 *   - Last 10 days: v2.13
 *
 * MIXPANEL REPORT:
 *   1. Insights > "page viewed" > Breakdown by app_version
 *   2. Chart event volume over time, colored by app_version
 *   3. Confirm: no overlap between versions (deterministic cutover)
 *
 * -------------------------------------------------------------------
 * 2. SUPPORT TICKET VOLUME DROP (everything hook)
 * -------------------------------------------------------------------
 * Before v2.13, support ticket volume is high — each user gets 2-3
 * extra tickets injected with bug-related categories (form_crash,
 * login_error, page_timeout, payment_failure). After v2.13, tickets
 * are progressively removed (30% on day 1 → 85% on day 10).
 *
 * MIXPANEL REPORT:
 *   1. Insights > "support ticket created" count over time (line chart)
 *   2. Break down by app_version: v2.12 has high volume, v2.13 drops
 *   3. Filter issue_category to bug categories (form_crash, etc.)
 *   4. Filter pre_release_bug = true for injected tickets only
 *   5. Compare weekly ticket volume before vs after v2.13 release
 *
 * -------------------------------------------------------------------
 * 3. APPLICATION CONVERSION BOOST (everything hook)
 * -------------------------------------------------------------------
 * Before v2.13, 40% of "application approved" and "policy activated"
 * events are removed, simulating a broken application flow. After
 * v2.13, all events are preserved — creating a visible conversion jump.
 *
 * MIXPANEL REPORT:
 *   1. Funnels > application submitted → approved → policy activated
 *   2. Break down by app_version (v2.12 vs v2.13)
 *   3. Compare conversion rates: pre-v2.13 ~60% of post-v2.13
 *   4. Insights > "application approved" count over time — step change
 *
 * ===================================================================
 * EXPECTED METRICS SUMMARY
 * ===================================================================
 *
 * Hook                    | Metric                  | Pre-v2.13 | Post-v2.13
 * ------------------------|-------------------------|-----------|----------
 * Version Stamping        | Events per version      | ~30d each | 10 days
 * Support Ticket Volume   | Weekly ticket count     | HIGH      | ~70% lower
 * Application Conversion  | Approval rate           | ~42%      | ~70%
 *
 * ===================================================================
 * ADVANCED ANALYSIS IDEAS
 * ===================================================================
 *
 * 1. Version Impact Dashboard: Chart both support tickets AND
 *    application conversion by app_version to show v2.13's dual impact.
 *
 * 2. Bug Category Analysis: Which pre_release_bug categories were most
 *    common? Do they correlate with the application steps where users
 *    were dropping off?
 *
 * 3. Platform Comparison: Did the v2.13 improvement affect all platforms
 *    equally, or did web/iOS/Android see different magnitudes?
 *
 * 4. Insurance Type Breakdown: Are certain insurance types (auto vs home
 *    vs life) more affected by the conversion improvement?
 *
 * 5. Time-to-Approval: Did v2.13 also change the approval_time_hours
 *    distribution, or just the volume of approvals?
 */

// ── Time constants for hook calculations ──
const NOW = dayjs();
const DATASET_START = NOW.subtract(days, "days");
const V211_DATE = DATASET_START.add(30, "days");
const V212_DATE = DATASET_START.add(60, "days");
const V213_DATE = NOW.subtract(10, "days");

/** @type {Config} */
const config = {
	token: "3651ac6819e284fbf528d86036eec785",
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

	// ── Events ──
	events: [
		{
			event: "account created",
			weight: 1,
			isFirstEvent: true,
			properties: {
				signup_source: ["web", "mobile", "agent_referral", "partner"],
				account_type: ["individual", "family", "business"],
			},
		},
		{
			event: "page viewed",
			weight: 10,
			properties: {
				page_name: [
					"home",
					"quotes",
					"coverage_options",
					"claims",
					"faq",
					"profile",
					"payment",
					"documents",
				],
				referrer: ["direct", "google", "email", "social_media"],
			},
		},
		{
			event: "quote requested",
			weight: 5,
			properties: {
				coverage_level: ["basic", "standard", "premium"],
				deductible: u.weighNumRange(250, 5000, 0.5, 1000),
			},
		},
		{
			event: "quote received",
			weight: 4,
			properties: {
				monthly_premium: u.weighNumRange(30, 800, 0.3, 150),
				coverage_amount: u.weighNumRange(10000, 500000, 0.3, 100000),
				quote_comparison_count: u.weighNumRange(1, 5, 0.5, 2),
			},
		},
		{
			event: "application started",
			weight: 4,
			properties: {
				coverage_level: ["basic", "standard", "premium"],
				estimated_premium: u.weighNumRange(30, 800, 0.3, 150),
			},
		},
		{
			event: "application step completed",
			weight: 6,
			properties: {
				step_name: [
					"personal_info",
					"coverage_selection",
					"medical_history",
					"vehicle_info",
					"beneficiary",
					"review",
				],
				step_number: u.weighNumRange(1, 6),
				time_on_step_sec: u.weighNumRange(15, 600, 0.3, 90),
			},
		},
		{
			event: "document uploaded",
			weight: 3,
			properties: {
				document_type: [
					"drivers_license",
					"proof_of_address",
					"vehicle_registration",
					"medical_records",
					"property_photos",
				],
				file_size_kb: u.weighNumRange(50, 5000, 0.5, 500),
			},
		},
		{
			event: "application submitted",
			weight: 3,
			properties: {
				documents_attached: u.weighNumRange(1, 5, 0.5, 2),
				application_time_min: u.weighNumRange(5, 60, 0.3, 15),
			},
		},
		{
			event: "application approved",
			weight: 2,
			properties: {
				approved_premium: u.weighNumRange(30, 800, 0.3, 150),
				approval_time_hours: u.weighNumRange(1, 72, 0.5, 24),
			},
		},
		{
			event: "policy activated",
			weight: 2,
			properties: {
				policy_term_months: [6, 12, 12, 12, 24],
				effective_date_offset_days: u.weighNumRange(0, 30, 0.5, 7),
			},
		},
		{
			event: "claim filed",
			weight: 2,
			properties: {
				claim_type: [
					"collision",
					"theft",
					"water_damage",
					"fire",
					"medical",
					"liability",
				],
				estimated_amount: u.weighNumRange(100, 50000, 0.3, 3000),
			},
		},
		{
			event: "claim status checked",
			weight: 4,
			properties: {
				claim_status: [
					"submitted",
					"under_review",
					"approved",
					"denied",
					"payment_pending",
				],
				days_since_filed: u.weighNumRange(1, 60, 0.5, 10),
			},
		},
		{
			event: "payment made",
			weight: 5,
			properties: {
				payment_method: ["credit_card", "bank_transfer", "auto_pay", "check"],
				amount: u.weighNumRange(30, 800, 0.3, 150),
				payment_status: ["success", "success", "success", "success", "failed"],
			},
		},
		{
			event: "support ticket created",
			weight: 4,
			properties: {
				issue_category: [
					"billing",
					"claims",
					"coverage",
					"technical",
					"policy_change",
				],
				priority: ["low", "medium", "medium", "high"],
				channel: ["chat", "phone", "email", "web_form"],
			},
		},
		{
			event: "support ticket resolved",
			weight: 3,
			properties: {
				resolution_type: [
					"self_service",
					"agent_assisted",
					"escalated",
					"auto_resolved",
				],
				satisfaction_score: u.weighNumRange(1, 5, 1, 4),
				resolution_time_hours: u.weighNumRange(0.5, 72, 0.3, 8),
			},
		},
		{
			event: "coverage reviewed",
			weight: 4,
			properties: {
				current_premium: u.weighNumRange(30, 800, 0.3, 150),
				coverage_adequate: [true, true, true, false],
			},
		},
		{
			event: "profile updated",
			weight: 2,
			properties: {
				field_updated: [
					"address",
					"phone",
					"email",
					"beneficiary",
					"payment_method",
					"vehicle_info",
				],
			},
		},
		{
			event: "renewal completed",
			weight: 2,
			properties: {
				renewal_premium: u.weighNumRange(30, 800, 0.3, 150),
				premium_change_pct: u.weighNumRange(-15, 20, 1, 3),
				auto_renewed: [true, true, false],
			},
		},
	],

	// ── Funnels ──
	funnels: [
		{
			name: "Onboarding",
			sequence: ["account created", "page viewed", "quote requested"],
			isFirstFunnel: true,
			conversionRate: 85,
			timeToConvert: 0.5,
		},
		{
			name: "Application Completion",
			sequence: [
				"application started",
				"application step completed",
				"document uploaded",
				"application submitted",
			],
			conversionRate: 60,
			timeToConvert: 48,
			weight: 4,
			order: "sequential",
		},
		{
			name: "Application Approval",
			sequence: [
				"application submitted",
				"application approved",
				"policy activated",
			],
			conversionRate: 70,
			timeToConvert: 72,
			weight: 3,
			order: "sequential",
		},
		{
			name: "Claims Process",
			sequence: [
				"claim filed",
				"claim status checked",
				"support ticket created",
			],
			conversionRate: 50,
			timeToConvert: 24,
			weight: 2,
		},
		{
			name: "Policy Renewal",
			sequence: ["coverage reviewed", "payment made", "renewal completed"],
			conversionRate: 65,
			timeToConvert: 72,
			weight: 3,
		},
	],

	// ── Super Props (on every event) ──
	superProps: {
		platform: ["web", "ios", "android"],
		insurance_type: ["auto", "home", "life", "health", "renters"],
	},

	// ── User Props (set once per user) ──
	userProps: {
		age_range: ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"],
		risk_profile: ["low", "medium", "high"],
		policy_count: u.weighNumRange(0, 5, 0.5, 1),
		lifetime_premium: u.weighNumRange(0, 50000, 0.3, 5000),
		preferred_contact: ["email", "phone", "app_notification"],
	},

	// ── Hook Function ──
	/**
	 * ARCHITECTED ANALYTICS HOOKS
	 *
	 * This hook function creates 3 deliberate patterns in the data:
	 *
	 * 1. VERSION STAMPING (event): Every event gets a deterministic app_version
	 *    based on its timestamp. v2.10 → v2.11 → v2.12 → v2.13.
	 *    All users shift simultaneously on release dates.
	 *
	 * 2. SUPPORT TICKET VOLUME (everything): Pre-v2.13 period has inflated
	 *    support ticket volume (2-3 extra tickets per user with bug-related
	 *    categories). Post-v2.13, tickets are progressively removed — creating
	 *    a clear volume drop that trends downward.
	 *
	 * 3. APPLICATION CONVERSION BOOST (everything): Pre-v2.13, ~40% of
	 *    application approved and policy activated events are removed,
	 *    lowering the effective funnel conversion rate. Post-v2.13 events
	 *    are left intact, making the conversion visibly jump up.
	 */
	hook: function (record, type, meta) {
		// =============================================================
		// Hook #1: VERSION STAMPING (event)
		// Deterministic app_version on every event based on timestamp.
		// v2.10 (days 0-30) → v2.11 (30-60) → v2.12 (60-90) → v2.13 (last 10 days)
		// =============================================================
		if (type === "event") {
			const eventTime = dayjs(record.time);

			if (eventTime.isBefore(V211_DATE)) {
				record.app_version = "2.10";
			} else if (eventTime.isBefore(V212_DATE)) {
				record.app_version = "2.11";
			} else if (eventTime.isBefore(V213_DATE)) {
				record.app_version = "2.12";
			} else {
				record.app_version = "2.13";
			}
		}

		// =============================================================
		// Hook #2 & #3: SUPPORT TICKET VOLUME + APPLICATION CONVERSION
		// (everything)
		// =============================================================
		if (type === "everything") {
			const userEvents = record;
			if (userEvents.length === 0) return record;

			// Find a user_id from any existing event
			const userId =
				userEvents.find((e) => e.user_id)?.user_id ||
				userEvents[0]?.device_id;

			// ─── Hook #2: SUPPORT TICKET VOLUME ───
			// PRE-V2.13: Inject 2-3 extra support tickets with bug-related categories
			const preV213Tickets = userEvents.filter(
				(e) =>
					e.event === "support ticket created" &&
					dayjs(e.time).isBefore(V213_DATE)
			);

			if (preV213Tickets.length > 0) {
				const extraCount = chance.integer({ min: 2, max: 3 });
				const bugCategories = [
					"form_crash",
					"login_error",
					"page_timeout",
					"payment_failure",
				];

				for (let i = 0; i < extraCount; i++) {
					// Pick a random pre-v2.13 ticket to base timing on
					const sourceTicket = chance.pickone(preV213Tickets);
					const sourceTime = dayjs(sourceTicket.time);
					// Offset by a few hours to days
					const offsetHours = chance.integer({ min: 1, max: 72 });
					let newTime = sourceTime.add(offsetHours, "hours");
					// Ensure it stays before v2.13
					if (newTime.isAfter(V213_DATE)) {
						newTime = V213_DATE.subtract(
							chance.integer({ min: 1, max: 48 }),
							"hours"
						);
					}

					// Compute app_version for injected event
					let injectedVersion;
					if (newTime.isBefore(V211_DATE)) {
						injectedVersion = "2.10";
					} else if (newTime.isBefore(V212_DATE)) {
						injectedVersion = "2.11";
					} else {
						injectedVersion = "2.12"; // always pre-v2.13
					}

					userEvents.push({
						event: "support ticket created",
						time: newTime.toISOString(),
						user_id: userId,
						app_version: injectedVersion,
						issue_category: chance.pickone(bugCategories),
						priority: chance.pickone(["medium", "high", "high"]),
						channel: chance.pickone([
							"chat",
							"phone",
							"email",
							"web_form",
						]),
						pre_release_bug: true,
					});
				}
			}

			// POST-V2.13: Remove support tickets with increasing probability
			// Day 1 after release: ~30% removal
			// Day 5: ~60% removal
			// Day 10: ~85% removal
			for (let i = userEvents.length - 1; i >= 0; i--) {
				const evt = userEvents[i];
				if (evt.event === "support ticket created") {
					const evtTime = dayjs(evt.time);
					if (evtTime.isAfter(V213_DATE)) {
						const daysSinceRelease = evtTime.diff(
							V213_DATE,
							"days",
							true
						);
						// Linear ramp: 30% base + 5.5% per day → ~85% at day 10
						const removalLikelihood = Math.min(
							85,
							30 + daysSinceRelease * 5.5
						);
						if (chance.bool({ likelihood: removalLikelihood })) {
							userEvents.splice(i, 1);
						}
					}
				}
			}

			// ─── Hook #3: APPLICATION CONVERSION BOOST ───
			// PRE-V2.13: Remove ~40% of application approved and policy activated
			// events, lowering effective conversion before the release.
			for (let i = userEvents.length - 1; i >= 0; i--) {
				const evt = userEvents[i];
				if (
					(evt.event === "application approved" ||
						evt.event === "policy activated") &&
					dayjs(evt.time).isBefore(V213_DATE)
				) {
					if (chance.bool({ likelihood: 40 })) {
						userEvents.splice(i, 1);
					}
				}
			}

			// Sort events by time after injection/removal
			userEvents.sort(
				(a, b) => new Date(a.time) - new Date(b.time)
			);

			return record;
		}

		return record;
	},
};

export default config;
