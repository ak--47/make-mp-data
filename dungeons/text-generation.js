import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import { weighNumRange, range, date, initChance, exhaust, choose, integer } from "../lib/utils/utils.js";

import { createGenerator, generateBatch } from "../lib/generators/text.js";

const SEED = "make me text yo";
dayjs.extend(utc);
const chance = initChance(SEED);
const num_users = 10_000;
const days = 90;

/** @typedef  {import("../types.js").Dungeon} Dungeon */

// ============= Advanced Text Generators =============
// All generators use performanceMode: true for optimal speed (~5000+ texts/sec)
// Set performanceMode: false for maximum quality at ~1200 texts/sec
//
// Example usage:
// const highQualityGen = createGenerator({
//   style: 'support',
//   authenticityLevel: 0.9,
//   typos: true,
//   enableDeduplication: true,
//   performanceMode: false  // 🎯 Maximum quality, slower generation
// });
//
// const highSpeedGen = createGenerator({
//   style: 'support', 
//   authenticityLevel: 0.9,  // Will be reduced to 0.3
//   typos: true,             // Will be disabled
//   enableDeduplication: true, // Will be disabled
//   performanceMode: true    // 🚀 High speed, good quality
// });

// Enterprise support ticket generator with keywords and high authenticity
const enterpriseSupportGen = createGenerator({
	style: "support",
	tone: "neg",
	intensity: "high",
	formality: "technical",
	keywords: {
		features: ['Dashboard Analytics', 'Export API', 'SSO Login', 'Admin Console', 'User Management'],
		products: ['DataViz Pro', 'Enterprise Suite', 'v3.2.1', 'v2.8.4'],
		technical: ['CORS error', 'timeout', 'memory leak', 'authentication', 'database'],
		errors: ['ERR_CONNECTION_REFUSED', '500 Internal Server', 'TIMEOUT_ERROR', 'AUTH_FAILED'],
		competitors: ['Tableau', 'PowerBI', 'Looker', 'Qlik']
	},
	mixedSentiment: true,
	authenticityLevel: 0.7,
	typos: true,
	typoRate: 0.02,
	specificityLevel: 0.8,
	min: 80,
	max: 300,
	includeMetadata: false,
	performanceMode: true // Enable performance optimizations
});

// Casual review generator with typos and mixed sentiment
const casualReviewGen = createGenerator({
	style: "review",
	tone: "pos",
	intensity: "medium",
	formality: "casual",
	keywords: {
		features: ['user interface', 'mobile app', 'notifications', 'search function'],
		products: ['the app', 'this tool', 'the platform'],
		metrics: ['response time', 'uptime', 'user experience']
	},
	mixedSentiment: true,
	authenticityLevel: 0.4,
	typos: true,
	typoRate: 0.03,
	sentimentDrift: 0.3,
	performanceMode: true,
	min: 30,
	max: 200,
	includeMetadata: false
});

// Technical forum posts with advanced features
const technicalForumGen = createGenerator({
	style: "forum",
	tone: "neu",
	formality: "technical",
	keywords: {
		technical: ['REST API', 'GraphQL', 'webhooks', 'microservices', 'cloud infrastructure'],
		versions: ['v1.2.3', 'latest', 'beta', 'stable release'],
		errors: ['404 Not Found', 'Rate Limiting', 'SSL Certificate']
	},
	userPersona: true,
	timestamps: true,
	authenticityLevel: 0.6,
	specificityLevel: 0.9,
	performanceMode: true,
	min: 50,
	max: 250,
	includeMetadata: false
});

// Search queries with realistic typos
const searchQueryGen = createGenerator({
	style: "search",
	tone: "neu",
	formality: "casual",
	keywords: {
		features: ['export data', 'user settings', 'help docs', 'pricing'],
		technical: ['API documentation', 'integration guide', 'troubleshooting']
	},
	typos: true,
	typoRate: 0.05,
	performanceMode: true,
	min: 2,
	max: 50,
	includeMetadata: false
});

// Business feedback with professional tone
const businessFeedbackGen = createGenerator({
	style: "feedback",
	tone: "neu",
	formality: "business",
	keywords: {
		metrics: ['ROI', 'efficiency', 'cost savings', 'productivity'],
		features: ['reporting', 'analytics', 'integration capabilities']
	},
	authenticityLevel: 0.3,
	specificityLevel: 0.7,
	performanceMode: true,
	min: 40,
	max: 180,
	includeMetadata: false
});

// Chat messages with high authenticity and typos
const chatMessageGen = createGenerator({
	style: "chat",
	tone: "neu",
	formality: "casual",
	keywords: {
		products: ['the app', 'dashboard', 'mobile version'],
		features: ['notifications', 'sync', 'offline mode']
	},
	mixedSentiment: true,
	authenticityLevel: 0.8,
	typos: true,
	typoRate: 0.04,
	sentimentDrift: 0.4,
	performanceMode: true,
	min: 5,
	max: 150,
	includeMetadata: false
});

// Email communication generator
const emailGen = createGenerator({
	style: "email",
	tone: "neu",
	formality: "business",
	keywords: {
		features: ['account management', 'billing', 'subscription'],
		products: ['Enterprise Plan', 'Pro Account']
	},
	authenticityLevel: 0.5,
	performanceMode: true,
	userPersona: true,
	min: 60,
	max: 300,
	includeMetadata: false
});

/** @type {Dungeon} */
const dungeon = {
	seed: SEED,
	numDays: days,
	numEvents: num_users * 120, // Increased for more variety
	numUsers: num_users,
	hasAnonIds: false,
	hasSessionIds: true, // Enable for chat flow tracking
	format: "json",
	alsoInferFunnels: true,
	hasLocation: true,
	hasAndroidDevices: true,
	hasIOSDevices: true,
	hasDesktopDevices: true,
	hasBrowser: true,
	hasCampaigns: false,
	isAnonymous: false,
	hasAdSpend: false,

	hasAvatar: false,
	makeChart: false,

	batchSize: 1_500_000,
	concurrency: 50,
	writeToDisk: true,

	// ============= Enhanced Events with New API =============
	events: [		
		{
			event: "enterprise_support_ticket",
			weight: 3,
			properties: {
				ticket_text: () => enterpriseSupportGen.generateOne(),
				priority: ["critical", "high", "medium", "low"],
				category: ["authentication", "performance", "integration", "billing", "bug_report"],
				account_tier: ["enterprise", "business", "pro"],
				escalation_level: [1, 1, 1, 2, 3], // Most tickets level 1
				estimated_resolution_hours: weighNumRange(1, 72, 0.3),
				has_screenshot: [true, true, false, false], // 50% have screenshots
				channel: ["email", "phone", "chat", "portal"],
				is_resolved: [true, true, true, false], // 75% resolved
				resolution_time_minutes: weighNumRange(15, 2880, 0.6) // 15min to 2 days
			}
		},
		{
			event: "casual_product_review",
			weight: 5,
			properties: {
				review_text: () => casualReviewGen.generateOne(),
				rating: weighNumRange(1, 5, 0.4), // Skewed toward higher ratings
				product_category: ["mobile_app", "web_platform", "desktop_app", "api"],
				is_verified_purchase: [true, true, true, false], // 75% verified
				helpful_votes: weighNumRange(0, 50, 0.8),
				would_recommend: [true, true, true, false], // 75% would recommend
				usage_duration_days: weighNumRange(1, 365, 0.5)
			}
		},
		{
			event: "technical_forum_post",
			weight: 4,
			properties: {
				post_text: () => technicalForumGen.generateOne(),
				topic_category: ["api_help", "integration", "troubleshooting", "feature_request"],
				upvotes: weighNumRange(0, 25, 0.7),
				has_code_snippet: [true, false, false], // 33% have code
				is_solved: [true, true, false], // 67% solved
				response_count: weighNumRange(0, 15, 0.6),
				user_experience_level: ["beginner", "intermediate", "advanced", "expert"]
			}
		},
		{
			event: "search_query",
			weight: 25, // Most frequent event
			properties: {
				query_text: () => searchQueryGen.generateOne(),
				search_category: ["help", "documentation", "features", "pricing", "support"],
				results_found: weighNumRange(0, 100, 0.3),
				clicked_result: [true, true, false], // 67% click through
				result_position_clicked: weighNumRange(1, 10, 0.8), // Most click top results
				search_duration_seconds: weighNumRange(1, 300, 0.7),
				refined_search: [true, false, false, false] // 25% refine search
			}
		},
		{
			event: "business_feedback",
			weight: 3,
			properties: {
				feedback_text: () => businessFeedbackGen.generateOne(),
				satisfaction_score: weighNumRange(1, 10, 0.3),
				feedback_category: ["feature_request", "improvement", "compliment", "concern"],
				department: ["engineering", "sales", "marketing", "support", "executive"],
				follow_up_requested: [true, false, false], // 33% want follow-up
				urgency: ["low", "medium", "high"],
				implementation_priority: weighNumRange(1, 5, 0.4)
			}
		},
		{
			event: "chat_message",
			weight: 20,
			properties: {
				message_text: () => chatMessageGen.generateOne(),
				chat_type: ["support", "sales", "general", "technical"],
				message_length: weighNumRange(5, 200, 0.6),
				contains_emoji: [true, false, false], // 33% have emojis
				response_time_seconds: weighNumRange(1, 3600, 0.8), // Most respond quickly
				is_agent_response: [true, false], // 50/50 agent vs customer
				satisfaction_rating: [1, 2, 3, 4, 5, null, null], // Not always rated
				requires_escalation: [true, false, false, false] // 25% escalated
			}
		},
		{
			event: "email_correspondence",
			weight: 6,
			properties: {
				email_text: () => emailGen.generateOne(),
				email_type: ["support", "billing", "account", "marketing_opt_out"],
				thread_length: weighNumRange(1, 8, 0.7),
				priority: ["normal", "high", "urgent"],
				has_attachment: [true, false, false, false], // 25% have attachments
				auto_response: [true, false, false, false], // 25% auto-responses
				response_time_hours: weighNumRange(0.25, 48, 0.5),
				customer_type: ["new", "existing", "enterprise", "trial"]
			}
		},
		
		// Batch generation examples for related content
		{
			event: "api_discussion_thread",
			weight: 2,
			properties: {
				// Using generateBatch for related forum posts in a thread
				thread_messages: () => generateBatch({
					n: integer(2, 6), // 2-6 messages per thread
					style: 'forum',
					tone: 'neu',
					related: true,
					sharedContext: 'API integration issues',
					keywords: {
						technical: ['REST API', 'authentication', 'rate limiting', 'webhooks'],
						errors: ['401 Unauthorized', '429 Too Many Requests', 'timeout']
					},
					min: 40,
					max: 200,
					includeMetadata: false
				}),
				api_version: ["v1", "v2", "v3", "beta"],
				severity: ["low", "medium", "high", "critical"],
				affects_production: [true, false, false], // 33% affect production
				resolution_status: ["open", "investigating", "resolved", "closed"]
			}
		}
	],
	
	// ============= Enhanced Funnels =============
	funnels: [
		{
			sequence: ["search_query", "casual_product_review", "enterprise_support_ticket"],
			conversionRate: 0.05, // 5% conversion from search to review to support
			timeToConvert: 24,
			props: {
				funnel_type: "research_to_concern"
			}
		},
		{
			sequence: ["chat_message", "email_correspondence", "business_feedback"],
			conversionRate: 0.12, // 12% go from chat to email to feedback
			timeToConvert: 6,
			props: {
				funnel_type: "support_to_feedback"
			}
		}
	],
	
	superProps: {
		product_tier: ["free", "basic", "pro", "enterprise"],
		data_center: ["us-east", "us-west", "eu-central", "asia-pacific"],
		feature_flags: () => {
			// Dynamic feature flags
			const flags = ["new_dashboard", "beta_api", "advanced_analytics", "mobile_v2"];
			return flags.filter(() => chance.bool({likelihood: 30})); // 30% chance each flag is enabled
		}
	},
	
	userProps: {
		account_age_days: weighNumRange(0, 1095, 0.4),
		user_tier: ["free", "free", "basic", "pro", "enterprise"],	
		signup_method: ["email", "google", "microsoft", "sso", "invite"],
		notification_enabled: [true, true, false],
		has_purchased: [true, false, false],
		primary_use_case: ["analytics", "reporting", "integration", "automation"],
		company_size: ["1-10", "11-50", "51-200", "201-1000", "1000+"],
		industry: ["technology", "finance", "healthcare", "retail", "education", "other"],
		technical_expertise: ["beginner", "intermediate", "advanced", "expert"],
		engagement_score: weighNumRange(0, 100, 0.3), // Most users low engagement
		last_active_days_ago: weighNumRange(0, 30, 0.6),
		preferred_communication: ["email", "chat", "phone", "self_service"]
	},
	
	// ============= Slowly Changing Dimensions =============
	scdProps: {
		user_tier: {
			type: "user",
			frequency: "month",
			values: ["free", "basic", "pro", "enterprise"],
			timing: "fixed",
			max: 3 // Max 3 tier changes per user
		},
		engagement_level: {
			type: "user", 
			frequency: "week",
			values: ["low", "medium", "high"],
			timing: "fuzzy",
			max: 8 // Can change engagement weekly
		}
	},
	
	// ============= Lookup Tables =============
	lookupTables: [
		
	],

	hook: function (record, type, meta) {
		// Enhanced hooks for realistic data patterns
		
		if (type === "event") {
			// Add realistic timestamp patterns for business hours
			const eventTime = dayjs(record.time);
			const hour = eventTime.hour();
			const dayOfWeek = eventTime.day();
			
			// Business events more likely during business hours
			if (["enterprise_support_ticket", "business_feedback", "email_correspondence"].includes(record.event)) {
				// Add business_hours flag
				record.is_business_hours = hour >= 9 && hour <= 17 && dayOfWeek >= 1 && dayOfWeek <= 5;
			}
			
			// Chat messages more frequent during peak hours
			if (record.event === "chat_message") {
				record.is_peak_hours = hour >= 10 && hour <= 16;
			}
		}

		if (type === "user") {
			// Add computed fields based on other properties
			if (record.user_tier === "enterprise" && record.company_size) {
				record.is_enterprise_account = record.company_size.includes("1000+") || record.company_size.includes("201-1000");
			}
			
			// Add engagement scoring
			const factors = [
				record.has_purchased ? 30 : 0,
				record.notification_enabled ? 10 : 0,
				record.account_age_days > 30 ? 15 : 0,
				record.technical_expertise === "expert" ? 20 : 0
			];
			record.computed_engagement_score = factors.reduce((a, b) => a + b, 0);
		}

		return record;
	}
};

export default dungeon;