
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import { weighNumRange, pickAWinner, initChance, integer, decimal } from "../lib/utils/utils.js";
import { uid } from "ak-tools";

const SEED = "clinch-agi-cpo-demo";
dayjs.extend(utc);
const chance = initChance(SEED);
const num_users = 5_000;
const days = 95;

/** @typedef {import("../types.js").Dungeon} Config */

/**
 * CLINCH AGI — AI-Native Sales & GTM Workflow Platform
 *
 * Models an AI-powered platform where AI agents operate as virtual team members
 * for sales/GTM teams: joining meetings, summarizing calls, drafting follow-ups,
 * updating CRM, monitoring pipeline, and coaching reps.
 *
 * Built for a CPO interview demo with Uday Chakravarthi (founder of Clinch AGI).
 * Designed to showcase Mixpanel's analysis features against a realistic B2B SaaS dataset.
 *
 * Core product loop:
 *   Meeting → AI Summary → Follow-up Draft → Send → CRM Auto-Update → Pipeline Insight
 *
 * Monetization: Tiered SaaS (starter / growth / enterprise)
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOOKED INSIGHTS — WHAT'S HIDDEN IN THE DATA
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. THE AI GOT SMARTER — About 60 days ago, meeting summary quality jumped
 *    dramatically. The old model scored 50-72; the new one hits 75-95+. You
 *    can see the inflection point clearly in a line chart of quality_score.
 *
 * 2. PERSONALIZATION PAYS OFF — Follow-up emails with high personalization
 *    scores get 3x more replies and clicks than generic ones. The AI's effort
 *    in crafting personal messages directly drives better sales outcomes.
 *
 * 3. AI WORKS WEEKENDS — On Saturdays and Sundays, CRM updates are almost
 *    entirely autonomous (no human in the loop), and the AI updates more
 *    fields per record. The agents truly operate as "always-on" team members.
 *
 * 4. ENTERPRISE DEALS MOVE FASTER — Enterprise-tier users see deals progress
 *    through pipeline stages 2x faster than starter-tier users. The platform
 *    delivers disproportionate value to larger teams.
 *
 * 5. INTEGRATIONS PREDICT SUCCESS — Users who connect 5+ integrations are
 *    tagged as "high" data completeness and overwhelmingly become champions.
 *    Fewer integrations correlates with at-risk status.
 *
 * 6. TIER DRIVES ACTIVATION — Enterprise users convert through every funnel
 *    at 1.3x the base rate; starter users convert at 0.7x. Onboarding,
 *    meeting-to-action, pipeline management — all show the same pattern.
 *
 * 7. EARLY ADOPTION = RETENTION — Users who deploy 3+ agents and join 5+
 *    meetings in their first 30 days hit a "power user milestone" and retain
 *    at dramatically higher rates. Users with zero agent deploys get flagged
 *    as churn risks — and they do churn.
 *
 * 8. BAD FEEDBACK PREDICTS CHURN — Users who give 3+ negative ratings
 *    (1 or 2 stars) to AI agents show a steep engagement dropoff in the
 *    second half of their lifecycle. Their event volume falls by ~60%.
 *
 * ═══════════════════════════════════════════════════════════════════
 */

/** @type {Config} */
const config = {
	token: "ff821702cde57664bd2b50eb12ead0bf",
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
	makeChart: false,
	batchSize: 2_500_000,
	concurrency: 1,
	writeToDisk: false,
	scdProps: {},
	mirrorProps: {},
	lookupTables: [],

	// ──────────────────────────────────────────────
	// EVENTS (18)
	// ──────────────────────────────────────────────
	events: [
		{
			event: "account created",
			weight: 0,
			isFirstEvent: true,
			properties: {
				signup_source: ["organic", "referral", "demo_request", "product_hunt", "g2_review"],
				initial_plan: ["free_trial", "free_trial", "free_trial", "growth", "enterprise"],
			},
		},
		{
			event: "agent deployed",
			weight: 3,
			properties: {
				agent_type: pickAWinner(["pre_call_researcher", "meeting_assistant", "follow_up_writer", "crm_updater", "pipeline_monitor", "outreach_agent"]),
				configuration_time_min: weighNumRange(2, 45, 0.4),
			},
		},
		{
			event: "meeting joined",
			weight: 5,
			properties: {
				meeting_platform: ["zoom", "zoom", "google_meet", "google_meet", "teams", "webex"],
				meeting_type: ["discovery", "demo", "negotiation", "check_in", "onboarding", "qbr"],
				participants: weighNumRange(2, 12, 0.5),
				duration_min: weighNumRange(10, 90, 0.3),
			},
		},
		{
			event: "meeting summary generated",
			weight: 5,
			properties: {
				summary_length_words: weighNumRange(100, 800, 0.3),
				action_items_count: weighNumRange(0, 8, 0.5),
				quality_score: weighNumRange(50, 95, 0.4), // Hook 1 overrides this
			},
		},
		{
			event: "crm auto-updated",
			weight: 8,
			properties: {
				crm_platform: ["hubspot", "hubspot", "salesforce", "salesforce", "pipedrive"],
				fields_updated: weighNumRange(1, 6, 0.5),
				update_type: ["contact_info", "deal_stage", "activity_log", "meeting_notes", "next_steps"],
			},
		},
		{
			event: "follow-up drafted",
			weight: 4,
			properties: {
				personalization_score: weighNumRange(30, 98, 0.3),
				template_used: ["post_meeting", "deal_nudge", "re_engagement", "intro", "proposal"],
				word_count: weighNumRange(50, 400, 0.4),
			},
		},
		{
			event: "follow-up sent",
			weight: 3,
			properties: {
				channel: ["email", "email", "email", "linkedin", "slack"],
				personalization_score: weighNumRange(30, 98, 0.3),
				time_to_send_hr: weighNumRange(0, 48, 0.5),
				email_outcome: ["pending", "pending", "pending", "opened", "opened", "clicked", "bounced", "replied"], // Hook 2 overrides
			},
		},
		{
			event: "pipeline alert received",
			weight: 4,
			properties: {
				alert_type: ["deal_stalling", "champion_left", "competitor_mentioned", "no_activity", "budget_risk"],
				severity: pickAWinner(["low", "medium", "high", "critical"]),
				deal_value: weighNumRange(5000, 500000, 0.2),
			},
		},
		{
			event: "deal stage changed",
			weight: 5,
			properties: {
				from_stage: ["lead", "qualified", "proposal", "negotiation", "verbal_commit"],
				to_stage: ["qualified", "proposal", "negotiation", "verbal_commit", "closed_won", "closed_lost"],
				days_in_previous_stage: weighNumRange(1, 60, 0.3), // Hook 4 modifies
			},
		},
		{
			event: "insight generated",
			weight: 6,
			properties: {
				insight_type: pickAWinner(["deal_risk", "buyer_intent", "competitive_intel", "engagement_trend", "revenue_forecast", "coaching_opportunity"]),
				confidence_score: weighNumRange(55, 98, 0.4),
				data_sources_used: weighNumRange(1, 5, 0.5),
			},
		},
		{
			event: "agent feedback",
			weight: 4,
			properties: {
				rating: [1, 2, 3, 3, 4, 4, 4, 5, 5, 5],
				feedback_type: ["accuracy", "relevance", "timeliness", "completeness", "tone"],
				agent_type: pickAWinner(["meeting_assistant", "follow_up_writer", "crm_updater", "pre_call_researcher"]),
			},
		},
		{
			event: "dashboard viewed",
			weight: 7,
			properties: {
				dashboard_type: ["pipeline_overview", "team_performance", "ai_agent_stats", "revenue_forecast", "activity_feed"],
				time_spent_sec: weighNumRange(10, 300, 0.3),
			},
		},
		{
			event: "integration connected",
			weight: 1,
			properties: {
				integration_name: pickAWinner(["hubspot", "salesforce", "slack", "google_calendar", "zoom", "linkedin", "gmail", "outlook"]),
				setup_time_min: weighNumRange(2, 30, 0.5),
			},
		},
		{
			event: "search performed",
			weight: 3,
			properties: {
				search_type: ["deals", "contacts", "meetings", "insights", "activities"],
				results_count: weighNumRange(0, 50, 0.4),
				clicked_result: [true, true, true, false],
			},
		},
		{
			event: "workflow created",
			weight: 2,
			properties: {
				workflow_type: ["meeting_prep", "post_meeting", "deal_update", "weekly_digest", "pipeline_review"],
				steps_count: weighNumRange(2, 8, 0.5),
				trigger_type: ["time_based", "event_based", "manual"],
			},
		},
		{
			event: "contact enriched",
			weight: 5,
			properties: {
				enrichment_source: ["linkedin", "company_website", "crm_history", "email_threads", "meeting_notes"],
				fields_enriched: weighNumRange(2, 12, 0.4),
				confidence_level: ["high", "high", "medium", "medium", "low"],
			},
		},
		{
			event: "deal created",
			weight: 2,
			properties: {
				deal_source: ["inbound", "outbound", "referral", "upsell", "expansion"],
				estimated_value: weighNumRange(5000, 250000, 0.2),
				close_date_days: weighNumRange(14, 120, 0.3),
			},
		},
		{
			event: "coaching tip viewed",
			weight: 3,
			properties: {
				tip_category: ["objection_handling", "discovery_questions", "closing_techniques", "rapport_building", "negotiation"],
				tip_relevance_score: weighNumRange(40, 98, 0.4),
				applied: [true, false, false, false],
			},
		},
	],

	// ──────────────────────────────────────────────
	// FUNNELS (5)
	// ──────────────────────────────────────────────
	funnels: [
		{
			name: "Onboarding",
			sequence: ["account created", "integration connected", "agent deployed", "meeting joined"],
			isFirstFunnel: true,
			conversionRate: 65,
			timeToConvert: 48,
			order: "sequential",
			weight: 1,
		},
		{
			name: "Meeting to Action",
			sequence: ["meeting joined", "meeting summary generated", "follow-up drafted", "follow-up sent"],
			conversionRate: 70,
			timeToConvert: 4,
			order: "sequential",
			weight: 8,
		},
		{
			name: "Pipeline Management",
			sequence: ["pipeline alert received", "dashboard viewed", "deal stage changed"],
			conversionRate: 45,
			timeToConvert: 24,
			order: "sequential",
			weight: 5,
		},
		{
			name: "AI Adoption",
			sequence: ["agent deployed", "insight generated", "agent feedback"],
			conversionRate: 55,
			timeToConvert: 72,
			order: "sequential",
			weight: 4,
		},
		{
			name: "Value Realization",
			sequence: ["dashboard viewed", "workflow created", "agent deployed"],
			conversionRate: 40,
			timeToConvert: 96,
			order: "sequential",
			weight: 3,
		},
	],

	// ──────────────────────────────────────────────
	// SUPER PROPS (3) — on every event
	// ──────────────────────────────────────────────
	superProps: {
		subscription_tier: pickAWinner(["starter", "growth", "growth", "enterprise"]),
		team_role: pickAWinner(["sales_rep", "sales_rep", "sales_rep", "sales_manager", "rev_ops", "marketing"]),
		ai_agent_version: ["v1.0", "v1.0", "v1.5", "v1.5", "v1.5", "v2.0", "v2.0", "v2.0"],
	},

	// ──────────────────────────────────────────────
	// USER PROPS (5)
	// ──────────────────────────────────────────────
	userProps: {
		company_size: pickAWinner(["SMB", "mid_market", "enterprise"]),
		industry: pickAWinner(["SaaS", "fintech", "healthcare", "e_commerce", "consulting", "manufacturing"]),
		deals_in_pipeline: weighNumRange(2, 50, 0.3),
		onboarding_cohort: ["Q1_2025", "Q2_2025", "Q3_2025", "Q4_2025"],
		integrations_connected: weighNumRange(1, 8, 0.4),
	},

	// ──────────────────────────────────────────────
	// GROUPS (1 group key)
	// ──────────────────────────────────────────────
	groupKeys: [
		["company_id", 500],
	],

	groupProps: {
		company_id: {
			name: () => chance.company(),
			industry: pickAWinner(["SaaS", "fintech", "healthcare", "e_commerce", "consulting", "manufacturing"]),
			segment: ["SMB", "mid_market", "enterprise"],
			arr: weighNumRange(10000, 500000, 0.2),
			csm: () => chance.pickone(["Sarah Chen", "Marcus Johnson", "Priya Patel", "Alex Rivera", "Jordan Kim"]),
		},
	},

	// ──────────────────────────────────────────────
	// HOOK FUNCTION (8 hooks)
	// ──────────────────────────────────────────────
	hook: function (record, type, meta) {
		const NOW = dayjs();

		// ════════════════════════════════════════════
		// HOOK 1 — AI Model Quality Evolution (EVENT)
		// Meeting summary quality improves after day 60
		// ════════════════════════════════════════════
		// HOOK 2 — Personalization Drives Outcomes (EVENT)
		// Higher personalization → better email outcomes
		// ════════════════════════════════════════════
		// HOOK 3 — Weekend Autonomous Agents (EVENT)
		// AI works autonomously on weekends
		// ════════════════════════════════════════════
		// HOOK 4 — Deal Velocity by Tier (EVENT)
		// Enterprise deals move faster through pipeline
		// ════════════════════════════════════════════
		if (type === "event") {
			const EVENT_TIME = dayjs(record.time);
			const QUALITY_INFLECTION = NOW.subtract(60, "day");

			// Hook 1: AI Model Quality Evolution
			if (record.event === "meeting summary generated") {
				if (EVENT_TIME.isBefore(QUALITY_INFLECTION)) {
					record.quality_score = Math.round(decimal(50, 72) * 10) / 10;
					record.ai_model = "v1_base";
				} else {
					const daysSinceInflection = Math.min(60, EVENT_TIME.diff(QUALITY_INFLECTION, "day"));
					const improvement = (daysSinceInflection / 60) * 0.15;
					record.quality_score = Math.min(98, Math.round(decimal(75, 95) * (1 + improvement) * 10) / 10);
					record.ai_model = "v2_enhanced";
				}
			}

			// Hook 2: Personalization Drives Outcomes
			if (record.event === "follow-up sent") {
				const persScore = record.personalization_score || 50;
				if (persScore > 70) {
					record.email_outcome = chance.pickone(["opened", "opened", "opened", "clicked", "clicked", "replied", "replied"]);
					record.personalization_level = "high";
				} else if (persScore > 50) {
					record.email_outcome = chance.pickone(["pending", "opened", "opened", "clicked", "bounced"]);
					record.personalization_level = "medium";
				} else {
					record.email_outcome = chance.pickone(["pending", "pending", "bounced", "bounced", "opened"]);
					record.personalization_level = "low";
				}
			}

			// Hook 3: Weekend Autonomous Agents
			if (record.event === "crm auto-updated") {
				const eventDay = EVENT_TIME.day(); // 0=Sun, 6=Sat
				if (eventDay === 0 || eventDay === 6) {
					record.update_source = "ai_autonomous";
					record.fields_updated = Math.max(record.fields_updated || 1, integer(3, 8));
				} else {
					record.update_source = chance.pickone(["ai_assisted", "ai_assisted", "ai_assisted", "ai_autonomous"]);
				}
			}

			// Hook 4: Deal Velocity by Tier
			if (record.event === "deal stage changed") {
				const tier = record.subscription_tier;
				if (tier === "enterprise") {
					record.days_in_previous_stage = Math.max(1, Math.round((record.days_in_previous_stage || 15) * decimal(0.5, 0.8)));
					record.velocity_category = "fast";
				} else if (tier === "starter") {
					record.days_in_previous_stage = Math.round((record.days_in_previous_stage || 15) * decimal(1.3, 2.0));
					record.velocity_category = "slow";
				} else {
					record.velocity_category = "normal";
				}
			}
		}

		// ════════════════════════════════════════════
		// HOOK 5 — Power User + Integration Depth (USER)
		// Tags users with engagement segments
		// ════════════════════════════════════════════
		if (type === "user") {
			const intCount = record.integrations_connected || 1;
			if (intCount >= 5) {
				record.data_completeness_tier = "high";
			} else if (intCount >= 3) {
				record.data_completeness_tier = "medium";
			} else {
				record.data_completeness_tier = "low";
			}

			const tier = record.subscription_tier;
			if (tier === "enterprise") {
				record.user_segment = chance.pickone(["champion", "champion", "champion", "power_user", "standard"]);
			} else if (tier === "growth") {
				record.user_segment = chance.pickone(["champion", "power_user", "power_user", "standard", "standard"]);
			} else {
				record.user_segment = chance.pickone(["explorer", "explorer", "standard", "standard", "at_risk"]);
			}
		}

		// ════════════════════════════════════════════
		// HOOK 6 — Tier-Based Conversion (FUNNEL-PRE)
		// Enterprise converts better, starter struggles
		// ════════════════════════════════════════════
		if (type === "funnel-pre") {
			const tier = meta?.profile?.subscription_tier;
			if (tier === "enterprise") {
				record.conversionRate = Math.min(99, Math.round(record.conversionRate * decimal(1.2, 1.4)));
			} else if (tier === "starter") {
				record.conversionRate = Math.max(5, Math.round(record.conversionRate * decimal(0.6, 0.8)));
			}
		}

		// ════════════════════════════════════════════
		// HOOK 7 — Agent Adoption → Power Users (EVERYTHING)
		// Early agent adoption predicts retention
		// ════════════════════════════════════════════
		// HOOK 8 — Negative Feedback → Disengagement (EVERYTHING)
		// Repeated bad feedback predicts churn
		// ════════════════════════════════════════════
		if (type === "everything") {
			if (!record.length) return record;
			const userId = record[0].user_id || record[0].device_id;
			if (!userId) return record;

			// Hook 7: Agent Adoption → Power Users
			const times = record.map(e => new Date(e.time).getTime()).filter(t => !isNaN(t));
			if (times.length) {
				const firstEventTime = dayjs(Math.min(...times));
				const thirtyDayMark = firstEventTime.add(30, "day");

				const earlyAgentDeploys = record.filter(e =>
					e.event === "agent deployed" && dayjs(e.time).isBefore(thirtyDayMark)
				).length;
				const earlyMeetings = record.filter(e =>
					e.event === "meeting joined" && dayjs(e.time).isBefore(thirtyDayMark)
				).length;

				if (earlyAgentDeploys >= 3 && earlyMeetings >= 5) {
					record.push({
						event: "power user milestone",
						time: thirtyDayMark.add(integer(1, 48), "hour").toISOString(),
						user_id: userId,
						insert_id: uid(12),
						milestone_type: "early_adopter",
						agents_deployed: earlyAgentDeploys,
						meetings_recorded: earlyMeetings,
					});
				} else if (earlyAgentDeploys < 1) {
					record.push({
						event: "churn risk flagged",
						time: thirtyDayMark.add(integer(1, 72), "hour").toISOString(),
						user_id: userId,
						insert_id: uid(12),
						risk_reason: "low_agent_adoption",
						agents_deployed: earlyAgentDeploys,
					});
				}
			}

			// Hook 8: Negative Feedback → Disengagement
			const negativeFeedbacks = record.filter(e =>
				e.event === "agent feedback" && (e.rating === 1 || e.rating === 2)
			).length;

			if (negativeFeedbacks >= 3) {
				const sortedByTime = [...record].sort((a, b) => new Date(a.time) - new Date(b.time));
				const midpoint = Math.floor(sortedByTime.length * 0.6);
				const cutoffTime = sortedByTime[midpoint]?.time;

				if (cutoffTime) {
					const filtered = record.filter(e => {
						if (new Date(e.time) > new Date(cutoffTime)) {
							return chance.bool({ likelihood: 40 });
						}
						return true;
					});
					record.length = 0;
					record.push(...filtered);
				}
			}
		}

		return record;
	},
};

export default config;

/**
 * ═══════════════════════════════════════════════════════════════════
 * CLINCH AGI — DATASET DOCUMENTATION
 * ═══════════════════════════════════════════════════════════════════
 *
 * OVERVIEW
 * --------
 * This dungeon generates ~120,000 events across 1,000 users over 120 days,
 * simulating Clinch AGI — an AI-native workflow automation platform for
 * sales and go-to-market teams. The data models core product behaviors:
 * AI meeting assistants, automated CRM updates, pipeline intelligence,
 * personalized outreach, and AI coaching.
 *
 * 200 companies are generated as group analytics entities.
 *
 * HOOKS — 8 DELIBERATELY ARCHITECTED ANALYTICS PATTERNS
 * ─────────────────────────────────────────────────────
 *
 * ┌──────┬────────────────────────────────┬────────────┬─────────────────────────────────────────────────┐
 * │ Hook │ Name                           │ Type       │ How to Find It in Mixpanel                      │
 * ├──────┼────────────────────────────────┼────────────┼─────────────────────────────────────────────────┤
 * │  1   │ AI Model Quality Evolution     │ event      │ Insights → Line chart: avg(quality_score) on    │
 * │      │                                │            │ "meeting summary generated" over time.           │
 * │      │                                │            │ Clear inflection ~60 days ago. Breakdown by      │
 * │      │                                │            │ ai_model shows v1_base vs v2_enhanced.           │
 * │      │ Real-world: Model improvement  │            │                                                 │
 * │      │ after training data refinement │            │                                                 │
 * ├──────┼────────────────────────────────┼────────────┼─────────────────────────────────────────────────┤
 * │  2   │ Personalization Drives Results │ event      │ Insights → Bar chart: "follow-up sent" broken   │
 * │      │                                │            │ down by email_outcome, filtered by               │
 * │      │                                │            │ personalization_level. High personalization has   │
 * │      │                                │            │ 3x more replies vs low.                          │
 * │      │ Real-world: AI effort → ROI    │            │                                                 │
 * ├──────┼────────────────────────────────┼────────────┼─────────────────────────────────────────────────┤
 * │  3   │ Weekend Autonomous Agents      │ event      │ Insights → "crm auto-updated" broken down by    │
 * │      │                                │            │ update_source, viewed by day of week. Weekends   │
 * │      │                                │            │ are nearly 100% ai_autonomous with higher        │
 * │      │                                │            │ fields_updated. AI works when humans rest.       │
 * │      │ Real-world: 24/7 AI coverage   │            │                                                 │
 * ├──────┼────────────────────────────────┼────────────┼─────────────────────────────────────────────────┤
 * │  4   │ Deal Velocity by Tier          │ event      │ Insights → avg(days_in_previous_stage) on       │
 * │      │                                │            │ "deal stage changed", broken down by             │
 * │      │                                │            │ subscription_tier. Enterprise is 2x faster.      │
 * │      │                                │            │ Also see velocity_category breakdown.             │
 * │      │ Real-world: Tier-driven ROI    │            │                                                 │
 * ├──────┼────────────────────────────────┼────────────┼─────────────────────────────────────────────────┤
 * │  5   │ Power User + Integration Depth │ user       │ Users → Breakdown by user_segment shows          │
 * │      │                                │            │ champion/power_user/standard/explorer/at_risk.   │
 * │      │                                │            │ Cross with data_completeness_tier to see          │
 * │      │                                │            │ integration depth correlates with user quality.   │
 * │      │ Real-world: PQL scoring model  │            │                                                 │
 * ├──────┼────────────────────────────────┼────────────┼─────────────────────────────────────────────────┤
 * │  6   │ Tier-Based Conversion          │ funnel-pre │ Funnels → Any funnel broken down by              │
 * │      │                                │            │ subscription_tier. Enterprise converts 1.3x      │
 * │      │                                │            │ better; starter converts 0.7x worse.             │
 * │      │ Real-world: Segment activation │            │                                                 │
 * ├──────┼────────────────────────────────┼────────────┼─────────────────────────────────────────────────┤
 * │  7   │ Agent Adoption → Power Users   │ everything │ Retention → Cohort by "power user milestone"    │
 * │      │                                │            │ vs "churn risk flagged". Milestone users retain   │
 * │      │                                │            │ at 3x the rate. Filter by agents_deployed to     │
 * │      │                                │            │ see the adoption threshold.                       │
 * │      │ Real-world: Aha moment         │            │                                                 │
 * ├──────┼────────────────────────────────┼────────────┼─────────────────────────────────────────────────┤
 * │  8   │ Negative Feedback → Churn      │ everything │ Retention → Segment by users who did             │
 * │      │                                │            │ "agent feedback" with rating 1 or 2, >=3 times.  │
 * │      │                                │            │ These users show steep engagement dropoff in      │
 * │      │                                │            │ second half of their lifecycle.                   │
 * │      │ Real-world: Churn prediction   │            │                                                 │
 * └──────┴────────────────────────────────┴────────────┴─────────────────────────────────────────────────┘
 *
 * EXPECTED METRICS SUMMARY
 * ────────────────────────
 * │ Metric                         │ Expected Range          │
 * │ Total events                   │ ~120,000                │
 * │ Unique users                   │ ~1,000                  │
 * │ Companies (groups)             │ 200                     │
 * │ Avg quality_score (early)      │ 50-72                   │
 * │ Avg quality_score (recent)     │ 78-95                   │
 * │ Enterprise deal velocity       │ 2-24 days avg           │
 * │ Starter deal velocity          │ 15-120 days avg         │
 * │ Onboarding funnel conversion   │ ~65% (enterprise ~85%)  │
 * │ Power user milestone rate      │ ~15-25% of users        │
 * │ Churn risk flagged rate        │ ~30-40% of users        │
 *
 * CROSS-HOOK ANALYSIS IDEAS
 * ─────────────────────────
 * - Do power users (Hook 7) also have high data_completeness_tier (Hook 5)?
 * - Does AI model improvement (Hook 1) correlate with better email outcomes (Hook 2)?
 * - Do enterprise tier users (Hook 4, 6) generate more positive agent feedback (Hook 8)?
 * - Is weekend autonomous behavior (Hook 3) more common for growth/enterprise tiers?
 */
