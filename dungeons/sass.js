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

/** @typedef  {import("../../types.js").Dungeon} Config */

/**
 * CLOUDFORGE - B2B Cloud Infrastructure Monitoring & Deployment Platform
 *
 * CloudForge is a B2B SaaS platform that combines infrastructure monitoring (like Datadog)
 * with deployment automation (like Terraform). It serves engineering teams across companies
 * of all sizes - from startups deploying their first microservice to enterprises managing
 * thousands of services across multi-cloud environments.
 *
 * CORE PLATFORM:
 * Teams create workspaces, deploy services across AWS/GCP/Azure, and monitor everything
 * from a unified dashboard. The platform tracks uptime, latency, error rates, CPU/memory
 * usage, and costs. When things go wrong, CloudForge triggers alerts that route through
 * PagerDuty/Slack integrations, and on-call engineers acknowledge and resolve incidents
 * using automated runbooks.
 *
 * DEPLOYMENT PIPELINE:
 * CloudForge manages CI/CD pipelines that deploy services to production, staging, and dev
 * environments. Pipelines track commit counts, duration, and success/failure rates. When
 * deployments fail, recovery deploys take longer as engineers carefully roll forward.
 * Infrastructure can scale automatically or manually based on load.
 *
 * INCIDENT MANAGEMENT:
 * Alerts flow through a severity system (info -> warning -> critical -> emergency).
 * Critical and emergency alerts sometimes escalate into formal incidents with P1/P2
 * classification, paging multiple teams. Teams with Slack + PagerDuty integrations
 * respond and resolve incidents significantly faster than those without.
 *
 * COST MANAGEMENT:
 * The platform generates cost reports showing daily/weekly/monthly spend. When costs
 * spike beyond budgets, teams react by scaling down infrastructure. End-of-quarter
 * pushes drive plan upgrades and team expansion as companies rush to hit targets.
 *
 * SECURITY & COMPLIANCE:
 * Regular security scans check for vulnerabilities, compliance violations, and access
 * audit issues. Feature flags control rollout of new capabilities across environments.
 *
 * PRICING MODEL:
 * Four tiers: Free (limited), Team (small teams), Business (mid-market), Enterprise
 * (large organizations). Pricing based on seat count and resource usage. Enterprise
 * customers get dedicated customer success managers and annual contracts.
 *
 * TARGET USERS:
 * Engineers, SREs, DevOps professionals, engineering managers, and executives who
 * need visibility into their cloud infrastructure and deployment processes.
 *
 * WHY THESE EVENTS/PROPERTIES?
 * - Events model a complete B2B SaaS lifecycle: onboarding -> adoption -> expansion -> renewal
 * - Properties enable cohort analysis: company size, plan tier, role, cloud provider
 * - Funnels reveal friction: onboarding completion, incident resolution, deployment success
 * - Hooks simulate real operational insights hidden in production telemetry data
 * - The "needle in haystack" hooks create discoverable patterns that mirror real B2B analytics
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

/**
 * =================================================================================
 * NEEDLE IN A HAYSTACK - CLOUDFORGE B2B SAAS ANALYTICS
 * =================================================================================
 *
 * A B2B cloud infrastructure monitoring and deployment platform dungeon with 8
 * deliberately architected analytics insights hidden in the data. This dungeon
 * simulates CloudForge - a Datadog + Terraform hybrid serving engineering teams
 * across companies of all sizes.
 *
 * =================================================================================
 * DATASET OVERVIEW
 * =================================================================================
 *
 * - 5,000 users over 100 days
 * - 360K events across 18 event types (+ 1 hook-created event type)
 * - 3 funnels (onboarding, incident response, deployment pipeline)
 * - Group analytics (companies)
 * - Lookup tables (services, alerts)
 * - Desktop/browser only (B2B SaaS - no mobile devices)
 *
 * =================================================================================
 * THE 8 ARCHITECTED HOOKS
 * =================================================================================
 *
 * Each hook creates a specific, discoverable analytics insight that simulates
 * real-world B2B SaaS behavior patterns. Several hooks use techniques like
 * event removal (splice), event replacement, and module-level closure
 * state tracking via Map objects.
 *
 * ---------------------------------------------------------------------------------
 * 1. END-OF-QUARTER SPIKE (event hook)
 * ---------------------------------------------------------------------------------
 *
 * PATTERN: During days 80-90 of the dataset (end of quarter), billing events
 * shift toward plan upgrades 40% of the time, and team member invitations are
 * duplicated 50% of the time. All affected events are tagged with
 * quarter_end_push: true.
 *
 * HOW TO FIND IT IN MIXPANEL:
 *
 *   Report 1: Plan Upgrades Over Time
 *   • Report type: Insights (line chart)
 *   • Event: "billing event"
 *   • Measure: Total events
 *   • Filter: "event_type" = "plan_upgraded"
 *   • Time: Daily trend
 *   • Expected: Spike in plan upgrades during days 80-90 (4x normal volume)
 *
 *   Report 2: Team Expansion Surge
 *   • Report type: Insights (line chart)
 *   • Event: "team member invited"
 *   • Measure: Total events
 *   • Time: Daily trend
 *   • Filter: "quarter_end_push" = true
 *   • Expected: Clear volume spike in last 10 days with duplicate invites
 *
 * EXPECTED INSIGHT: Clear spike in plan_upgraded billing events and team
 * invitations in the final 10 days. Duplicate invitations create an
 * artificially inflated invite count.
 *
 * REAL-WORLD ANALOGUE: End-of-quarter sales pushes, budget utilization
 * deadlines, and team expansion before fiscal year-end.
 *
 * ---------------------------------------------------------------------------------
 * 2. CHURNED ACCOUNT SILENCING (everything hook)
 * ---------------------------------------------------------------------------------
 *
 * PATTERN: ~10% of users (determined by hash of distinct_id) go completely
 * silent after day 30. ALL of their events after month 1 are removed via
 * splice() - they simply vanish from the dataset.
 *
 * HOW TO FIND IT IN MIXPANEL:
 *
 *   Report 1: Churned Account Retention
 *   • Report type: Retention
 *   • Event A: Any event
 *   • Event B: Any event
 *   • Breakdown: User profile "churned_account"
 *   • Expected: churned_account=true users show 0% retention after day 30
 *     (complete silence), while others retain normally
 *
 *   Report 2: Churned Account Activity
 *   • Report type: Insights (line chart)
 *   • Event: Any event
 *   • Measure: Total events per user
 *   • Breakdown: User profile "churned_account"
 *   • Time: Weekly trend
 *   • Expected: churned_account=true flatlines after week 4,
 *     ~10% of all users are tagged churned_account=true
 *
 * EXPECTED INSIGHT: A distinct cohort of ~300 users with activity exclusively
 * in the first month. No gradual decline - a hard cutoff at day 30.
 *
 * REAL-WORLD ANALOGUE: Trial users who never convert, accounts that churn
 * after initial evaluation period, or companies that lose budget approval.
 *
 * ---------------------------------------------------------------------------------
 * 3. ALERT ESCALATION REPLACEMENT (event hook)
 * ---------------------------------------------------------------------------------
 *
 * PATTERN: When an "alert triggered" event has severity "critical" or
 * "emergency", there is a 30% chance the event is REPLACED entirely with a
 * new event type: "incident created". This event type does NOT exist in the
 * events array - it only appears because of hooks.
 *
 * HOW TO FIND IT IN MIXPANEL:
 *
 *   Report 1: Incident Created Discovery
 *   • Report type: Insights
 *   • Event: "incident created" (this event type is hook-generated only)
 *   • Measure: Total events
 *   • Breakdown: "escalation_level"
 *   • Expected: P1 and P2 incidents appear, representing ~30% of
 *     critical/emergency alerts that were escalated
 *
 *   Report 2: Alert vs Incident Ratio
 *   • Report type: Insights
 *   • Events: "alert triggered" AND "incident created"
 *   • Measure: Total events (both)
 *   • Expected: incident created count ≈ 30% of critical+emergency alerts
 *
 * EXPECTED INSIGHT: Approximately 30% of critical/emergency alerts escalate
 * into formal incidents. The "incident created" event is a hidden event type
 * that analysts must discover through exploration.
 *
 * REAL-WORLD ANALOGUE: Automated escalation systems that create incident
 * records from high-severity alerts (PagerDuty, OpsGenie workflows).
 *
 * ---------------------------------------------------------------------------------
 * 4. INTEGRATION USERS SUCCEED (everything hook)
 * ---------------------------------------------------------------------------------
 *
 * PATTERN: Users who have configured BOTH Slack AND PagerDuty integrations
 * respond to and resolve alerts significantly faster:
 *   - alert_acknowledged response_time_mins reduced by 60%
 *   - alert_resolved resolution_time_mins reduced by 50%
 *   - Affected events tagged with integrated_team: true
 *
 * HOW TO FIND IT IN MIXPANEL:
 *
 *   Report 1: Integration Impact on Response Time
 *   • Report type: Insights
 *   • Event: "alert acknowledged"
 *   • Measure: Average of "response_time_mins"
 *   • Breakdown: "integrated_team"
 *   • Expected: integrated_team=true ≈ 60% lower response time
 *     (e.g., ~20 min vs ~50 min)
 *
 *   Report 2: Integration Impact on Resolution
 *   • Report type: Insights
 *   • Event: "alert resolved"
 *   • Measure: Average of "resolution_time_mins"
 *   • Breakdown: "integrated_team"
 *   • Expected: integrated_team=true ≈ 50% faster resolution
 *
 * EXPECTED INSIGHT: Users with both integrations have median response time
 * ~60% lower than baseline. This is a two-feature combination effect.
 *
 * REAL-WORLD ANALOGUE: Tool integration stacks that compound productivity
 * (e.g., CI/CD + monitoring + alerting creating faster MTTR).
 *
 * ---------------------------------------------------------------------------------
 * 5. DOCS READERS DEPLOY MORE (everything hook)
 * ---------------------------------------------------------------------------------
 *
 * PATTERN: Users who view "best_practices" documentation 3 or more times get
 * 2-3 extra "service deployed" events with environment: "production" spliced
 * into their event stream. Tagged with docs_informed: true.
 *
 * HOW TO FIND IT IN MIXPANEL:
 *
 *   Report 1: Docs-Informed Deployments
 *   • Report type: Insights
 *   • Event: "service deployed"
 *   • Measure: Total events per user
 *   • Filter: "environment" = "production"
 *   • Breakdown: "docs_informed"
 *   • Expected: docs_informed=true shows extra production deployments
 *
 *   Report 2: Docs Readers vs Non-Readers
 *   • Report type: Insights
 *   • Event: "service deployed"
 *   • Measure: Total events per user
 *   • Filter: "environment" = "production"
 *   • Segment: Users who did "documentation viewed" (doc_section = "best_practices") >= 3
 *   • Expected: ~1.8x more production deploys per user for docs readers
 *
 * EXPECTED INSIGHT: Users who read best practices documentation 3+ times
 * deploy more services to production, suggesting docs drive confidence
 * and adoption.
 *
 * REAL-WORLD ANALOGUE: Documentation engagement as a leading indicator of
 * product adoption (developer tools where docs reading predicts usage).
 *
 * ---------------------------------------------------------------------------------
 * 6. COST OVERRUN PATTERN (event hook - closure state)
 * ---------------------------------------------------------------------------------
 *
 * PATTERN: When a "cost report generated" event has cost_change_percent > 25,
 * the user is stored in a module-level Map. When that same user later triggers
 * an "infrastructure scaled" event, the scale_direction is forced to "down"
 * (cost-cutting reaction). Uses closure-based state tracking across separate
 * hook calls.
 *
 * HOW TO FIND IT IN MIXPANEL:
 *
 *   Report 1: Cost Overrun → Scale Down
 *   • Report type: Insights
 *   • Event: "infrastructure scaled"
 *   • Measure: Total events
 *   • Breakdown: "cost_reaction"
 *   • Expected: cost_reaction=true events are 100% scale_direction="down"
 *
 *   Report 2: Budget Exceeded Users
 *   • Report type: Insights
 *   • Event: "cost report generated"
 *   • Measure: Total events
 *   • Breakdown: "budget_exceeded"
 *   • Expected: budget_exceeded=true events represent users with
 *     cost_change_percent > 25%, who then scale down infrastructure
 *
 * EXPECTED INSIGHT: Users who experience cost overruns (>25% increase)
 * consistently scale down their infrastructure afterward. The Map-based
 * tracking creates a causal chain across separate events.
 *
 * REAL-WORLD ANALOGUE: Cloud cost management behavior - teams that exceed
 * budgets immediately react by reducing resource allocation.
 *
 * ---------------------------------------------------------------------------------
 * 7. FAILED DEPLOYMENT RECOVERY (event hook - closure state)
 * ---------------------------------------------------------------------------------
 *
 * PATTERN: When a deployment pipeline fails, the user is stored in a
 * module-level Map. Their next successful deployment has duration_sec
 * multiplied by 1.5x (recovery deploys are slower/more careful). Tagged
 * with recovery_deployment: true.
 *
 * HOW TO FIND IT IN MIXPANEL:
 *
 *   Report 1: Recovery Deploy Duration
 *   • Report type: Insights
 *   • Event: "deployment pipeline run"
 *   • Measure: Average of "duration_sec"
 *   • Breakdown: "recovery_deployment"
 *   • Expected: recovery_deployment=true ≈ 1.5x longer duration
 *     (e.g., ~750 sec vs ~500 sec)
 *
 *   Report 2: Recovery Deploy Volume
 *   • Report type: Insights
 *   • Event: "deployment pipeline run"
 *   • Measure: Total events
 *   • Breakdown: "recovery_deployment"
 *   • Filter: "status" = "success"
 *   • Expected: recovery_deployment=true represents post-failure careful deploys
 *
 * EXPECTED INSIGHT: Recovery deployments after failures take 50% longer
 * than normal deployments, reflecting more cautious deployment practices.
 *
 * REAL-WORLD ANALOGUE: Post-incident deployment behavior - engineers take
 * extra care after a failed deploy, adding more checks and review steps.
 *
 * ---------------------------------------------------------------------------------
 * 8. ENTERPRISE VS STARTUP (user hook)
 * ---------------------------------------------------------------------------------
 *
 * PATTERN: Based on company_size, users get additional profile properties:
 *   - enterprise: seat_count (50-500), annual_contract_value (50K-500K), customer_success_manager: true
 *   - mid_market: seat_count (10-50), annual_contract_value (12K-50K)
 *   - smb: seat_count (3-10), annual_contract_value (3.6K-12K)
 *   - startup: seat_count (1-5), annual_contract_value (0-3.6K)
 *   - All users get customer_health_score (1-100)
 *
 * HOW TO FIND IT IN MIXPANEL:
 *
 *   Report 1: ACV by Company Size
 *   • Report type: Insights
 *   • Event: Any event
 *   • Measure: Unique users
 *   • Breakdown: User profile "company_size"
 *   • Expected: Four clear segments with distinct ACV ranges:
 *     startup ($0-3.6K), smb ($3.6K-12K), mid_market ($12K-50K), enterprise ($50K-500K)
 *
 *   Report 2: Enterprise CSM Coverage
 *   • Report type: Insights
 *   • Event: Any event
 *   • Measure: Unique users
 *   • Breakdown: User profile "customer_success_manager"
 *   • Expected: customer_success_manager=true only for enterprise users
 *
 * EXPECTED INSIGHT: Clear segmentation of user base by company size with
 * corresponding ACV and seat count distributions. Enterprise customers
 * uniquely have dedicated CSMs.
 *
 * REAL-WORLD ANALOGUE: B2B SaaS customer segmentation where company size
 * directly determines contract value, support tier, and expansion potential.
 *
 * =================================================================================
 * ADVANCED ANALYSIS IDEAS
 * =================================================================================
 *
 * CROSS-HOOK PATTERNS:
 *
 * 1. Churned + Enterprise: Do churned accounts (Hook #2) skew toward startups
 *    or are enterprise accounts also silenced? Cross-reference company_size
 *    with the ~10% churn cohort.
 *
 * 2. Integration + Cost: Do teams with full integrations (Hook #4) also manage
 *    costs better (Hook #6)? Integrated teams may detect cost overruns faster.
 *
 * 3. Docs + Deploys + Failures: Do docs readers (Hook #5) have fewer failed
 *    deployments (Hook #7)? Best practices readers may deploy more carefully.
 *
 * 4. Quarter Spike + Churn: Are quarter-end upgrades (Hook #1) correlated with
 *    accounts that later churn? False expansion before abandonment.
 *
 * 5. Enterprise Recovery: Do enterprise customers (Hook #8) recover from failed
 *    deployments (Hook #7) differently than startups?
 *
 * COHORT ANALYSIS:
 *
 * - Cohort by company_size: Compare all metrics across startup/smb/mid_market/enterprise
 * - Cohort by plan_tier: Free vs. Team vs. Business vs. Enterprise engagement
 * - Cohort by cloud_provider: AWS vs. GCP vs. Azure deployment and alert patterns
 * - Cohort by primary_role: Engineer vs. SRE vs. DevOps vs. Manager behaviors
 *
 * FUNNEL ANALYSIS:
 *
 * - Onboarding: workspace created -> service deployed -> dashboard viewed
 *   Compare by company_size and plan_tier
 * - Incident Response: alert triggered -> acknowledged -> resolved
 *   Compare integrated_team vs. non-integrated response times
 * - Deployment: pipeline run -> service deployed -> dashboard viewed
 *   Compare recovery_deployment vs. normal deployment success
 *
 * KEY METRICS TO TRACK:
 *
 * - MTTR (Mean Time To Resolve): alert triggered -> alert resolved duration
 * - Deployment Frequency: service deployed events per user per week
 * - Deployment Success Rate: pipeline success vs. failure ratio
 * - Cost Efficiency: total_cost trend over time per company
 * - Feature Adoption: integration configured events by type
 * - Documentation Engagement: documentation viewed by section
 *
 * =================================================================================
 * EXPECTED METRICS SUMMARY
 * =================================================================================
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
 * =================================================================================
 * HOW TO RUN THIS DUNGEON
 * =================================================================================
 *
 * From the dm4 root directory:
 *
 *   npm start
 *
 * Or programmatically:
 *
 *   import generate from './index.js';
 *   import config from './dungeons/harness-sass.js';
 *   const results = await generate(config);
 *
 * =================================================================================
 * TECHNICAL NOTES
 * =================================================================================
 *
 * - Module-level Maps (costOverrunUsers, failedDeployUsers) provide closure-based
 *   state tracking across individual event hook calls. This is the key differentiator
 *   for this dungeon - hooks 6 and 7 maintain state between separate invocations.
 *
 * - Hook #3 creates "incident created" events that do NOT exist in the events array.
 *   This event type only appears because of hook-based event replacement.
 *
 * - Hook #2 uses splice() in the "everything" handler to remove events after day 30
 *   for ~10% of users. This creates accounts with a hard activity cutoff - complete silence.
 *
 * - The "everything" hooks (2, 4, and 5) operate on the full user event array, enabling
 *   two-pass analysis: first identify patterns, then modify events accordingly.
 *
 * - Desktop/browser only: hasAndroidDevices and hasIOSDevices are both false,
 *   reflecting the B2B SaaS reality that CloudForge is used from workstations.
 *
 * =================================================================================
 */
