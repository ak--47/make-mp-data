import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "harness-sass";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef  {import("../types.js").Dungeon} Config */

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * DATASET OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * CLOUDFORGE - B2B Cloud Infrastructure Monitoring & Deployment Platform
 *
 * CloudForge is a B2B SaaS platform that combines infrastructure monitoring (like Datadog)
 * with deployment automation (like Terraform). It serves engineering teams across companies
 * of all sizes - from startups deploying their first microservice to enterprises managing
 * thousands of services across multi-cloud environments.
 *
 * - 5,000 users over 100 days
 * - 600K events across 18 event types (+ 1 hook-created event type)
 * - 8 funnels (onboarding, monitoring, incident response, deployment, infra, team, docs, billing)
 * - Group analytics (companies)
 * - Desktop/browser only (B2B SaaS - no mobile devices)
 *
 * CORE PLATFORM:
 * Teams create workspaces, deploy services across AWS/GCP/Azure, and monitor everything
 * from a unified dashboard. The platform tracks uptime, latency, error rates, CPU/memory
 * usage, and costs. When things go wrong, CloudForge triggers alerts that route through
 * PagerDuty/Slack integrations, and on-call engineers acknowledge and resolve incidents
 * using automated runbooks.
 *
 * PRICING MODEL:
 * Four tiers: Free, Team, Business, Enterprise. Enterprise customers get dedicated
 * customer success managers and annual contracts. Pricing based on seat count and
 * resource usage.
 */

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * ANALYTICS HOOKS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 8 deliberately architected patterns hidden in the data, simulating real-world
 * B2B SaaS behavior. Several hooks use event removal (splice), event replacement,
 * and module-level closure state tracking via Map objects.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. END-OF-QUARTER SPIKE (event hook)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Days 80-90: billing events shift toward plan upgrades 40% of the time, and team
 * member invitations are duplicated 50% of the time. Tagged: quarter_end_push: true.
 *
 * Mixpanel Report — Plan Upgrades Over Time:
 *   • Insights line chart
 *   • Event: "billing event", filter "event_type" = "plan_upgraded"
 *   • Daily trend
 *   • Expected: Spike in plan upgrades during days 80-90 (4x normal volume)
 *
 * Mixpanel Report — Team Expansion Surge:
 *   • Insights line chart
 *   • Event: "team member invited", filter "quarter_end_push" = true
 *   • Daily trend
 *   • Expected: Clear volume spike in last 10 days with duplicate invites
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2. CHURNED ACCOUNT SILENCING (everything hook)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ~10% of users (hash of distinct_id, idHash % 5 === 0) go completely silent
 * after day 30. ALL events after month 1 are removed via splice(). User profiles
 * are tagged churned_account: true for discoverability.
 *
 * Mixpanel Report — Churned Account Retention:
 *   • Retention report
 *   • Event A/B: Any event
 *   • Breakdown: User profile "churned_account"
 *   • Expected: churned_account=true shows 0% retention after day 30
 *
 * Mixpanel Report — Churned Account Activity:
 *   • Insights line chart
 *   • Event: Any event, measure total per user
 *   • Breakdown: User profile "churned_account"
 *   • Weekly trend
 *   • Expected: churned_account=true flatlines after week 4
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 3. ALERT ESCALATION REPLACEMENT (event hook)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 30% of critical/emergency "alert triggered" events are REPLACED with a new
 * event type "incident created" (not in the events array — hook-only). Includes
 * escalation_level (P1/P2), teams_paged, incident_id.
 *
 * Mixpanel Report — Incident Created Discovery:
 *   • Insights report
 *   • Event: "incident created"
 *   • Breakdown: "escalation_level"
 *   • Expected: P1 and P2 incidents, ~30% of critical/emergency alert volume
 *
 * Mixpanel Report — Alert vs Incident Ratio:
 *   • Insights report
 *   • Events: "alert triggered" AND "incident created"
 *   • Expected: incident created count ~ 30% of critical+emergency alerts
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 4. INTEGRATION USERS SUCCEED (everything hook)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Users with BOTH Slack AND PagerDuty integrations resolve alerts faster:
 * response_time_mins reduced 60%, resolution_time_mins reduced 50%.
 * Tagged: integrated_team: true.
 *
 * Mixpanel Report — Integration Impact on Response Time:
 *   • Insights report
 *   • Event: "alert acknowledged", measure avg "response_time_mins"
 *   • Breakdown: "integrated_team"
 *   • Expected: integrated_team=true ~ 60% lower response time
 *
 * Mixpanel Report — Integration Impact on Resolution:
 *   • Insights report
 *   • Event: "alert resolved", measure avg "resolution_time_mins"
 *   • Breakdown: "integrated_team"
 *   • Expected: integrated_team=true ~ 50% faster resolution
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 5. DOCS READERS DEPLOY MORE (everything hook)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Users with 3+ "best_practices" documentation views get 2-3 extra production
 * deploys spliced into their event stream. Tagged: docs_informed: true.
 *
 * Mixpanel Report — Docs-Informed Deployments:
 *   • Insights report
 *   • Event: "service deployed", filter "environment" = "production"
 *   • Breakdown: "docs_informed"
 *   • Expected: docs_informed=true shows extra production deployments
 *
 * Mixpanel Report — Docs Readers vs Non-Readers:
 *   • Insights report
 *   • Event: "service deployed", measure total per user
 *   • Segment: Users with 3+ "documentation viewed" (doc_section = "best_practices")
 *   • Expected: ~1.8x more production deploys per user for docs readers
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 6. COST OVERRUN PATTERN (event hook — closure state)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * When cost_change_percent > 25 on a "cost report generated" event, the user
 * is stored in a module-level Map. Their next "infrastructure scaled" event
 * is forced to scale_direction: "down". Tagged: budget_exceeded, cost_reaction.
 *
 * Mixpanel Report — Cost Overrun to Scale Down:
 *   • Insights report
 *   • Event: "infrastructure scaled"
 *   • Breakdown: "cost_reaction"
 *   • Expected: cost_reaction=true events are 100% scale_direction="down"
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 7. FAILED DEPLOYMENT RECOVERY (event hook — closure state)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * After a failed pipeline run, the user's next successful deploy has
 * duration_sec * 1.5 (recovery deploys are slower). Tagged: recovery_deployment.
 * Uses module-level Map for cross-call state.
 *
 * Mixpanel Report — Recovery Deploy Duration:
 *   • Insights report
 *   • Event: "deployment pipeline run", measure avg "duration_sec"
 *   • Breakdown: "recovery_deployment"
 *   • Expected: recovery_deployment=true ~ 1.5x longer duration
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 8. ENTERPRISE VS STARTUP (user hook)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Company size determines seat_count, annual_contract_value, and
 * customer_success_manager (enterprise only). All users get customer_health_score.
 *
 * Mixpanel Report — ACV by Company Size:
 *   • Insights report
 *   • Event: Any, measure unique users
 *   • Breakdown: User profile "company_size"
 *   • Expected: startup ($0-3.6K), smb ($3.6K-12K), mid_market ($12K-50K),
 *     enterprise ($50K-500K)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EXPECTED METRICS SUMMARY
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Hook                     | Metric                   | Baseline  | Hook Effect    | Ratio
 * -------------------------|--------------------------|-----------|----------------|------
 * End-of-Quarter Spike     | Plan upgrades/day        | ~2/day    | ~8/day         | 4x
 * Churned Accounts         | Users active month 2     | 100%      | 90%            | 0.9x
 * Alert Escalation         | Incidents from alerts    | 0%        | ~30% of crit   | new
 * Integration Users        | MTTR (minutes)           | ~300      | ~150           | 0.5x
 * Docs Readers             | Prod deploys/user        | ~3        | ~5-6           | 1.8x
 * Cost Overrun             | Scale-down after overrun | 50%       | 100%           | 2x
 * Failed Deploy Recovery   | Deploy duration (sec)    | ~500      | ~750           | 1.5x
 * Enterprise vs Startup    | ACV range                | $0-3.6K   | $50K-500K      | 100x+
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ADVANCED ANALYSIS IDEAS
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * CROSS-HOOK PATTERNS:
 * - Churned + Enterprise: Do churned accounts skew toward startups or are
 *   enterprise accounts also silenced?
 * - Integration + Cost: Do teams with full integrations manage costs better?
 * - Docs + Deploys + Failures: Do docs readers have fewer failed deployments?
 * - Quarter Spike + Churn: Are quarter-end upgrades correlated with later churn?
 * - Enterprise Recovery: Do enterprise customers recover from failed deploys
 *   differently than startups?
 *
 * COHORT ANALYSIS:
 * - By company_size: Compare all metrics across startup/smb/mid_market/enterprise
 * - By plan_tier: Free vs. Team vs. Business vs. Enterprise engagement
 * - By cloud_provider: AWS vs. GCP vs. Azure deployment and alert patterns
 * - By primary_role: Engineer vs. SRE vs. DevOps vs. Manager behaviors
 *
 * KEY METRICS:
 * - MTTR: alert triggered → alert resolved duration
 * - Deployment Frequency: service deployed per user per week
 * - Deployment Success Rate: pipeline success vs. failure ratio
 * - Cost Efficiency: total_cost trend over time per company
 * - Feature Adoption: integration configured events by type
 * - Documentation Engagement: documentation viewed by section
 */

// Generate consistent IDs for lookup tables and event properties
const serviceIds = v.range(1, 201).map(() => `svc_${v.uid(8)}`);
const alertIds = v.range(1, 501).map(() => `alert_${v.uid(6)}`);
const pipelineIds = v.range(1, 101).map(() => `pipe_${v.uid(6)}`);
const runbookIds = v.range(1, 51).map(() => `rb_${v.uid(6)}`);
const companyIds = v.range(1, 301).map(() => `comp_${v.uid(8)}`);

// Module-level Maps for closure-based state tracking across hook calls
const costOverrunUsers = new Map();
const failedDeployUsers = new Map();

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
	hasAndroidDevices: false,
	hasIOSDevices: false,
	hasDesktopDevices: true,
	hasBrowser: true,
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
			sequence: ["workspace created", "service deployed", "dashboard viewed"],
			isFirstFunnel: true,
			conversionRate: 70,
			timeToConvert: 2,
		},
		{
			// Daily monitoring: dashboards, queries, API calls (most common)
			sequence: ["dashboard viewed", "query executed", "api call"],
			conversionRate: 80,
			timeToConvert: 0.5,
			weight: 5,
		},
		{
			// Incident response pipeline
			sequence: ["alert triggered", "alert acknowledged", "alert resolved"],
			conversionRate: 55,
			timeToConvert: 6,
			weight: 4,
		},
		{
			// Deployment cycle
			sequence: ["deployment pipeline run", "service deployed", "dashboard viewed"],
			conversionRate: 65,
			timeToConvert: 1,
			weight: 3,
		},
		{
			// Infrastructure management
			sequence: ["cost report generated", "infrastructure scaled", "security scan"],
			conversionRate: 50,
			timeToConvert: 4,
			weight: 2,
		},
		{
			// Team and config management
			sequence: ["team member invited", "integration configured", "feature flag toggled"],
			conversionRate: 40,
			timeToConvert: 8,
			weight: 2,
		},
		{
			// Documentation and runbook usage
			sequence: ["documentation viewed", "runbook executed", "service deployed"],
			conversionRate: 45,
			timeToConvert: 2,
			weight: 2,
		},
		{
			// Billing and account management
			sequence: ["billing event", "dashboard viewed"],
			conversionRate: 60,
			timeToConvert: 1,
			weight: 1,
		},
	],

	events: [
		{
			event: "workspace created",
			weight: 1,
			isFirstEvent: true,
			properties: {
				company_size: ["startup", "smb", "mid_market", "enterprise"],
				industry: ["tech", "finance", "healthcare", "retail", "media"],
			}
		},
		{
			event: "service deployed",
			weight: 10,
			properties: {
				service_id: u.pickAWinner(serviceIds),
				service_type: ["web_app", "api", "database", "cache", "queue", "ml_model"],
				environment: ["production", "staging", "dev"],
				cloud_provider: ["aws", "gcp", "azure"],
			}
		},
		{
			event: "dashboard viewed",
			weight: 20,
			properties: {
				dashboard_type: ["overview", "cost", "performance", "security", "custom"],
				time_range: ["1h", "6h", "24h", "7d", "30d"],
			}
		},
		{
			event: "alert triggered",
			weight: 12,
			properties: {
				alert_id: u.pickAWinner(alertIds),
				severity: ["info", "warning", "critical", "emergency"],
				alert_type: ["cpu", "memory", "latency", "error_rate", "disk", "network"],
				service_id: u.pickAWinner(serviceIds),
			}
		},
		{
			event: "alert acknowledged",
			weight: 8,
			properties: {
				alert_id: u.pickAWinner(alertIds),
				response_time_mins: u.weighNumRange(1, 120),
				acknowledged_by_role: ["engineer", "sre", "manager", "oncall"],
			}
		},
		{
			event: "alert resolved",
			weight: 7,
			properties: {
				alert_id: u.pickAWinner(alertIds),
				resolution_time_mins: u.weighNumRange(5, 1440),
				root_cause: ["config_change", "capacity", "bug", "dependency", "network"],
			}
		},
		{
			event: "deployment pipeline run",
			weight: 9,
			properties: {
				pipeline_id: u.pickAWinner(pipelineIds),
				status: ["success", "failed", "cancelled"],
				duration_sec: u.weighNumRange(30, 1800),
				commit_count: u.weighNumRange(1, 20),
			}
		},
		{
			event: "infrastructure scaled",
			weight: 5,
			properties: {
				service_id: u.pickAWinner(serviceIds),
				scale_direction: u.pickAWinner(["up", "down"], 0.15),
				previous_capacity: u.weighNumRange(1, 100),
				new_capacity: u.weighNumRange(1, 100),
				auto_scaled: u.pickAWinner([true, false], 0.15),
			}
		},
		{
			event: "cost report generated",
			weight: 4,
			properties: {
				report_period: ["daily", "weekly", "monthly"],
				total_cost: u.weighNumRange(100, 50000),
				cost_change_percent: u.weighNumRange(-30, 50),
			}
		},
		{
			event: "team member invited",
			weight: 3,
			properties: {
				role: ["admin", "editor", "viewer", "billing"],
				invitation_method: ["email", "sso", "slack"],
			}
		},
		{
			event: "integration configured",
			weight: 4,
			properties: {
				integration_type: ["slack", "pagerduty", "jira", "github", "datadog", "terraform"],
				status: ["active", "paused", "error"],
			}
		},
		{
			event: "query executed",
			weight: 15,
			properties: {
				query_type: ["metrics", "logs", "traces"],
				time_range_hours: u.weighNumRange(1, 720),
				result_count: u.weighNumRange(0, 10000),
			}
		},
		{
			event: "runbook executed",
			weight: 3,
			properties: {
				runbook_id: u.pickAWinner(runbookIds),
				trigger: ["manual", "automated", "alert_triggered"],
				success: u.pickAWinner([true, false], 0.15),
			}
		},
		{
			event: "billing event",
			weight: 3,
			properties: {
				event_type: ["invoice_generated", "payment_received", "payment_failed", "plan_upgraded", "plan_downgraded"],
				amount: u.weighNumRange(99, 25000),
			}
		},
		{
			event: "security scan",
			weight: 6,
			properties: {
				scan_type: ["vulnerability", "compliance", "access_audit"],
				findings_count: u.weighNumRange(0, 50),
				critical_findings: u.weighNumRange(0, 10),
			}
		},
		{
			event: "api call",
			weight: 16,
			properties: {
				endpoint: ["/deploy", "/status", "/metrics", "/alerts", "/config", "/billing"],
				method: ["GET", "POST", "PUT", "DELETE"],
				response_time_ms: u.weighNumRange(10, 5000),
				status_code: u.pickAWinner([200, 201, 400, 401, 403, 500, 503]),
			}
		},
		{
			event: "documentation viewed",
			weight: 7,
			properties: {
				doc_section: ["getting_started", "api_reference", "best_practices", "troubleshooting", "changelog"],
				time_on_page_sec: u.weighNumRange(5, 600),
			}
		},
		{
			event: "feature flag toggled",
			weight: 4,
			properties: {
				flag_name: () => `flag_${chance.word()}`,
				new_state: u.pickAWinner(["enabled", "disabled"], 0.15),
				environment: ["production", "staging", "dev"],
			}
		},
	],

	superProps: {
		plan_tier: u.pickAWinner(["free", "free", "team", "team", "business", "enterprise"]),
		cloud_provider: ["aws", "gcp", "azure", "multi_cloud"],
	},

	userProps: {
		company_size: u.pickAWinner(["startup", "startup", "smb", "mid_market", "enterprise"]),
		primary_role: ["engineer", "sre", "devops", "manager", "executive"],
		team_name: ["Platform", "Backend", "Frontend", "Data", "Security", "Infrastructure"],
	},

	groupKeys: [
		["company_id", 300, ["workspace created", "service deployed", "billing event", "team member invited"]],
	],

	groupProps: {
		company_id: {
			name: () => `${chance.word({ capitalize: true })} ${chance.pickone(["Systems", "Technologies", "Labs", "Cloud", "Digital", "Networks", "Solutions"])}`,
			industry: ["tech", "finance", "healthcare", "retail", "media", "manufacturing", "logistics"],
			employee_count: ["1-10", "11-50", "51-200", "201-1000", "1001-5000", "5000+"],
			arr_bucket: ["<10k", "10k-50k", "50k-200k", "200k-1M", "1M+"],
		}
	},

	lookupTables: [],

	/**
	 * ARCHITECTED ANALYTICS HOOKS
	 *
	 * This hook function creates 8 deliberate patterns in the data:
	 *
	 * 1. END-OF-QUARTER SPIKE: Days 80-90 drive plan upgrades and team expansion
	 * 2. CHURNED ACCOUNT SILENCING: ~10% of users go completely silent after month 1
	 * 3. ALERT ESCALATION REPLACEMENT: Critical alerts become "incident created" events
	 * 4. INTEGRATION USERS SUCCEED: Slack+PagerDuty users resolve incidents 50-60% faster
	 * 5. DOCS READERS DEPLOY MORE: Best practices readers get extra production deploys
	 * 6. COST OVERRUN PATTERN: Budget-exceeded users react by scaling down infrastructure
	 * 7. FAILED DEPLOYMENT RECOVERY: Recovery deploys take 1.5x longer, tracked across calls
	 * 8. ENTERPRISE VS STARTUP: Company size determines seat count, ACV, and health score
	 */
	hook: function (record, type, meta) {
		const NOW = dayjs();
		const DATASET_START = NOW.subtract(days, "days");

		// ─────────────────────────────────────────────────────────────
		// Hook #1: END-OF-QUARTER SPIKE (event)
		// Days 80-90: billing upgrades and team expansion surge
		// ─────────────────────────────────────────────────────────────
		if (type === "event") {
			const EVENT_TIME = dayjs(record.time);
			const dayInDataset = EVENT_TIME.diff(DATASET_START, "days", true);

			if (record.event === "billing event") {
				if (dayInDataset >= 80 && dayInDataset <= 90 && chance.bool({ likelihood: 40 })) {
					record.event_type = "plan_upgraded";
					record.quarter_end_push = true;
				} else {
					record.quarter_end_push = false;
				}
			}

			if (record.event === "team member invited") {
				if (dayInDataset >= 80 && dayInDataset <= 90) {
					record.quarter_end_push = true;
					// 50% of the time duplicate the invite event (hiring push)
					if (chance.bool({ likelihood: 50 })) {
						return {
							event: "team member invited",
							time: EVENT_TIME.add(chance.integer({ min: 1, max: 60 }), "minutes").toISOString(),
							user_id: record.user_id,
							role: chance.pickone(["editor", "viewer"]),
							invitation_method: chance.pickone(["email", "sso", "slack"]),
							quarter_end_push: true,
							duplicate_invite: true,
						};
					}
				} else {
					record.quarter_end_push = false;
				}
			}
		}

		// ─────────────────────────────────────────────────────────────
		// Hook #3: ALERT ESCALATION REPLACEMENT (event)
		// Critical/emergency alerts sometimes become formal incidents
		// ─────────────────────────────────────────────────────────────
		if (type === "event") {
			if (record.event === "alert triggered") {
				const severity = record.severity;
				if ((severity === "critical" || severity === "emergency") && chance.bool({ likelihood: 30 })) {
					// REPLACE the event entirely with an "incident created" event
					return {
						event: "incident created",
						time: record.time,
						user_id: record.user_id,
						escalation_level: chance.pickone(["P1", "P2"]),
						teams_paged: chance.integer({ min: 1, max: 5 }),
						incident_id: `inc_${v.uid(8)}`,
						original_severity: severity,
						original_alert_type: record.alert_type,
						service_id: record.service_id,
						auto_escalated: true,
					};
				}
			}
		}

		// ─────────────────────────────────────────────────────────────
		// Hook #6: COST OVERRUN PATTERN (event)
		// Budget-exceeded users react by scaling down infrastructure
		// Uses module-level costOverrunUsers Map for cross-call state
		// ─────────────────────────────────────────────────────────────
		if (type === "event") {
			if (record.event === "cost report generated") {
				const costChange = record.cost_change_percent;
				if (costChange > 25) {
					record.cost_alert = true;
					record.budget_exceeded = true;
					costOverrunUsers.set(record.user_id, true);
				} else {
					record.cost_alert = false;
					record.budget_exceeded = false;
				}
			}

			if (record.event === "infrastructure scaled") {
				if (costOverrunUsers.has(record.user_id)) {
					record.scale_direction = "down";
					record.cost_reaction = true;
					costOverrunUsers.delete(record.user_id);
				} else {
					record.cost_reaction = false;
				}
			}
		}

		// ─────────────────────────────────────────────────────────────
		// Hook #7: FAILED DEPLOYMENT RECOVERY (event)
		// Recovery deploys take 1.5x longer after a failure
		// Uses module-level failedDeployUsers Map for cross-call state
		// ─────────────────────────────────────────────────────────────
		if (type === "event") {
			if (record.event === "deployment pipeline run") {
				const status = record.status;
				if (status === "failed") {
					failedDeployUsers.set(record.user_id, true);
					record.recovery_deployment = false;
				} else if (status === "success" && failedDeployUsers.has(record.user_id)) {
					record.duration_sec = Math.floor((record.duration_sec || 300) * 1.5);
					record.recovery_deployment = true;
					failedDeployUsers.delete(record.user_id);
				} else {
					record.recovery_deployment = false;
				}
			}
		}

		// ─────────────────────────────────────────────────────────────
		// Hook #2: CHURNED ACCOUNT SILENCING (everything)
		// ~20% targeted (hash % 5), yielding ~10% visible after accounting for invisible churned users
		// ─────────────────────────────────────────────────────────────
		if (type === "everything") {
			const userEvents = record;
			if (userEvents && userEvents.length > 0) {
				const firstEvent = userEvents[0];
				const idHash = String(firstEvent.user_id || firstEvent.device_id).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
				const isChurnedAccount = (idHash % 5) === 0;

				if (isChurnedAccount) {
					for (let i = userEvents.length - 1; i >= 0; i--) {
						const evt = userEvents[i];
						const dayInDataset = dayjs(evt.time).diff(DATASET_START, "days", true);
						if (dayInDataset > 30) {
							userEvents.splice(i, 1);
						}
					}
				}
			}
		}

		// ─────────────────────────────────────────────────────────────
		// Hook #4: INTEGRATION USERS SUCCEED (everything)
		// Users with both Slack AND PagerDuty integrations resolve faster
		// ─────────────────────────────────────────────────────────────
		if (type === "everything") {
			const userEvents = record;

			// First pass: check if user has both slack and pagerduty integrations
			let hasSlack = false;
			let hasPagerduty = false;

			userEvents.forEach((event) => {
				if (event.event === "integration configured") {
					const integrationType = event.integration_type;
					if (integrationType === "slack") hasSlack = true;
					if (integrationType === "pagerduty") hasPagerduty = true;
				}
			});

			const hasFullIntegration = hasSlack && hasPagerduty;

			// Second pass: set integrated_team on all alert events, then boost for integrated users
			userEvents.forEach((event) => {
				if (event.event === "alert acknowledged") {
					if (hasFullIntegration && event.response_time_mins) {
						event.response_time_mins = Math.floor(event.response_time_mins * 0.4);
						event.integrated_team = true;
					} else {
						event.integrated_team = false;
					}
				}
				if (event.event === "alert resolved") {
					if (hasFullIntegration && event.resolution_time_mins) {
						event.resolution_time_mins = Math.floor(event.resolution_time_mins * 0.5);
						event.integrated_team = true;
					} else {
						event.integrated_team = false;
					}
				}
			});
		}

		// ─────────────────────────────────────────────────────────────
		// Hook #5: DOCS READERS DEPLOY MORE (everything)
		// Users who read best_practices 3+ times get extra production deploys
		// ─────────────────────────────────────────────────────────────
		if (type === "everything") {
			const userEvents = record;

			// First pass: count best_practices documentation views
			let bestPracticesCount = 0;
			userEvents.forEach((event) => {
				if (event.event === "documentation viewed" && event.doc_section === "best_practices") {
					bestPracticesCount++;
				}
			});

			// Second pass: if 3+ best practices views, add extra production deploys
			if (bestPracticesCount >= 3) {
				const extraDeploys = chance.integer({ min: 2, max: 3 });
				const lastEvent = userEvents[userEvents.length - 1];
				if (lastEvent) {
					for (let i = 0; i < extraDeploys; i++) {
						const deployEvent = {
							event: "service deployed",
							time: dayjs(lastEvent.time).add(chance.integer({ min: 1, max: 48 }), "hours").toISOString(),
							user_id: lastEvent.user_id,
							service_id: chance.pickone(serviceIds),
							service_type: chance.pickone(["web_app", "api", "database", "cache", "queue", "ml_model"]),
							environment: "production",
							cloud_provider: chance.pickone(["aws", "gcp", "azure"]),
							docs_informed: true,
						};
						userEvents.splice(userEvents.length, 0, deployEvent);
					}
				}
			}
		}

		// ─────────────────────────────────────────────────────────────
		// Hook #8: ENTERPRISE VS STARTUP (user)
		// Company size determines seat count, ACV, and health score
		// ─────────────────────────────────────────────────────────────
		if (type === "user") {
			// Hook #2 support: tag churned accounts on user profile for discoverability
			const idHash = String(record.distinct_id || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
			record.churned_account = (idHash % 5) === 0;

			const companySize = record.company_size;

			if (companySize === "enterprise") {
				record.seat_count = chance.integer({ min: 50, max: 500 });
				record.annual_contract_value = chance.integer({ min: 50000, max: 500000 });
				record.customer_success_manager = true;
			} else if (companySize === "mid_market") {
				record.seat_count = chance.integer({ min: 10, max: 50 });
				record.annual_contract_value = chance.integer({ min: 12000, max: 50000 });
				record.customer_success_manager = false;
			} else if (companySize === "smb") {
				record.seat_count = chance.integer({ min: 3, max: 10 });
				record.annual_contract_value = chance.integer({ min: 3600, max: 12000 });
				record.customer_success_manager = false;
			} else if (companySize === "startup") {
				record.seat_count = chance.integer({ min: 1, max: 5 });
				record.annual_contract_value = chance.integer({ min: 0, max: 3600 });
				record.customer_success_manager = false;
			}

			record.customer_health_score = chance.integer({ min: 1, max: 100 });
		}

		return record;
	}
};

export default config;
