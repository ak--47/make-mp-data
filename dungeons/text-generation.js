import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import { weighNumRange, range, date, initChance, exhaust, choose, integer } from "../lib/utils/utils.js";
import { createGenerator, generateBatch } from "../lib/generators/text.js";

const SEED = "make me text yo";
dayjs.extend(utc);
const chance = initChance(SEED);
const num_users = 1_000;
const days = 90;

/** @typedef  {import("../types.js").Dungeon} Dungeon */


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
	// System is now always optimized for speed + uniqueness
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
	userPersona: true,
	min: 60,
	max: 300,
	includeMetadata: false
});

// Social Media Generators
const twitterGen = createGenerator({
	style: "chat",
	tone: "neu",
	formality: "casual",
	keywords: {
		products: ['@company', 'the app', 'your platform'],
		features: ['new update', 'dark mode', 'mobile app', 'API'],
		hashtags: ['#ProductHunt', '#SaaS', '#TechReview', '#UserExperience']
	},
	mixedSentiment: true,
	authenticityLevel: 0.9,
	typos: true,
	typoRate: 0.06,
	sentimentDrift: 0.5,
	min: 10,
	max: 280, // Twitter character limit
	includeMetadata: false
});

const linkedinGen = createGenerator({
	style: "feedback", 
	tone: "neu",
	formality: "business",
	keywords: {
		business: ['ROI', 'team productivity', 'workflow efficiency', 'digital transformation'],
		products: ['this solution', 'the platform', 'our implementation'],
		metrics: ['25% time savings', '40% faster', 'reduced costs', 'improved outcomes']
	},
	authenticityLevel: 0.4,
	specificityLevel: 0.8,
	userPersona: true,
	min: 50,
	max: 400,
	includeMetadata: false
});

const redditGen = createGenerator({
	style: "forum",
	tone: "neu", 
	formality: "casual",
	keywords: {
		reddit: ['UPDATE:', 'TL;DR', 'Edit:', 'Anyone else?', 'PSA'],
		products: ['this tool', 'the service', 'their platform'],
		community: ['r/SaaS', 'fellow devs', 'community']
	},
	mixedSentiment: true,
	authenticityLevel: 0.8,
	typos: true,
	typoRate: 0.03,
	sentimentDrift: 0.4,
	min: 30,
	max: 500,
	includeMetadata: false
});

// Product Usage Generators
const bugReportGen = createGenerator({
	style: "support",
	tone: "neg",
	formality: "technical",
	keywords: {
		technical: ['console errors', 'reproduction steps', 'browser version', 'stack trace'],
		errors: ['TypeError', 'ReferenceError', '404', '500', 'timeout'],
		environment: ['Chrome 118', 'macOS Ventura', 'Windows 11', 'mobile Safari']
	},
	authenticityLevel: 0.6,
	specificityLevel: 0.9,
	typos: true,
	typoRate: 0.02,
	min: 80,
	max: 400,
	includeMetadata: false
});

const featureRequestGen = createGenerator({
	style: "feedback",
	tone: "pos",
	formality: "business", 
	keywords: {
		requests: ['would love to see', 'feature request', 'enhancement idea', 'suggestion'],
		features: ['bulk export', 'dark mode', 'keyboard shortcuts', 'advanced filters'],
		justification: ['save time', 'improve workflow', 'user experience', 'competitive feature']
	},
	authenticityLevel: 0.5,
	specificityLevel: 0.7,
	min: 40,
	max: 300,
	includeMetadata: false
});

const onboardingGen = createGenerator({
	style: "feedback",
	tone: "neu",
	formality: "casual",
	keywords: {
		onboarding: ['getting started', 'first impression', 'setup process', 'initial experience'],
		products: ['the dashboard', 'onboarding flow', 'tutorial', 'setup wizard'],
		feelings: ['confused', 'excited', 'overwhelmed', 'impressed', 'frustrated']
	},
	mixedSentiment: true,
	authenticityLevel: 0.6,
	typos: true,
	typoRate: 0.04,
	min: 30,
	max: 250,
	includeMetadata: false
});

// Community Interaction Generators  
const tutorialCommentGen = createGenerator({
	style: "forum",
	tone: "pos",
	formality: "casual",
	keywords: {
		tutorial: ['thanks for this', 'helpful tutorial', 'step by step', 'great explanation'],
		products: ['the docs', 'this guide', 'the video', 'walkthrough'],
		learning: ['learned something new', 'finally understand', 'makes sense now']
	},
	authenticityLevel: 0.5,
	min: 20,
	max: 150,
	includeMetadata: false
});

const webinarChatGen = createGenerator({
	style: "chat",
	tone: "neu",
	formality: "casual", 
	keywords: {
		webinar: ['great presentation', 'can you share slides', 'question about', 'thanks for hosting'],
		products: ['the demo', 'live demo', 'presentation', 'your product'],
		chat: ['Q:', 'thanks!', 'link?', '+1', 'same question']
	},
	authenticityLevel: 0.7,
	typos: true,
	typoRate: 0.05,
	min: 5,
	max: 100,
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
	hasAndroidDevices: false,
	hasIOSDevices: false,
	hasDesktopDevices: false,
	hasBrowser: false,
	hasCampaigns: false,
	isAnonymous: false,
	hasAdSpend: false,

	hasAvatar: false,
	makeChart: false,

	batchSize: 1_500_000,
	concurrency: 50,
	writeToDisk: false,

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
		
		// Social Media Events
		{
			event: "twitter_post",
			weight: 8,
			properties: {
				post_text: () => twitterGen.generateOne(),
				character_count: weighNumRange(10, 280, 0.4),
				has_hashtags: [true, true, false], // 67% have hashtags
				has_mentions: [true, false, false], // 33% have mentions
				engagement_type: ["like", "retweet", "reply", "quote_tweet"],
				follower_count: weighNumRange(50, 50000, 0.7),
				is_thread: [true, false, false, false], // 25% are threads
				posted_via: ["web", "mobile", "api", "third_party"]
			}
		},
		{
			event: "linkedin_post",
			weight: 4,
			properties: {
				post_text: () => linkedinGen.generateOne(),
				post_type: ["update", "article", "job_posting", "company_news"],
				industry_tag: ["technology", "business", "marketing", "sales", "hr"],
				connection_level: ["1st", "2nd", "3rd", "not_connected"],
				engagement_score: weighNumRange(0, 1000, 0.6),
				is_sponsored: [true, false, false, false], // 25% sponsored
				company_size: ["startup", "small", "medium", "large", "enterprise"]
			}
		},
		{
			event: "reddit_comment",
			weight: 12,
			properties: {
				comment_text: () => redditGen.generateOne(),
				subreddit: ["r/SaaS", "r/webdev", "r/startups", "r/technology", "r/programming"],
				comment_depth: weighNumRange(0, 10, 0.8), // Most are top-level
				upvotes: weighNumRange(-5, 500, 0.5),
				is_edited: [true, false, false], // 33% edited
				account_age_days: weighNumRange(1, 3650, 0.3),
				is_op: [true, false, false, false], // 25% from original poster
				parent_comment_id: () => chance.hash({ length: 8 })
			}
		},
		
		// Product Usage Events
		{
			event: "bug_report_submitted",
			weight: 5,
			properties: {
				report_text: () => bugReportGen.generateOne(),
				severity: ["critical", "high", "medium", "low"],
				bug_category: ["ui", "api", "performance", "data", "security"],
				steps_to_reproduce: weighNumRange(2, 10, 0.4),
				browser_info: ["Chrome 118", "Firefox 119", "Safari 17", "Edge 118"],
				os_info: ["Windows 11", "macOS Ventura", "Ubuntu 22.04", "iOS 17"],
				is_reproducible: [true, true, true, false], // 75% reproducible
				affects_workflow: [true, true, false], // 67% affect workflow
				has_screenshot: [true, true, false], // 67% include screenshots
				reporter_role: ["admin", "user", "developer", "qa_tester"]
			}
		},
		{
			event: "feature_request_submitted",
			weight: 6,
			properties: {
				request_text: () => featureRequestGen.generateOne(),
				request_category: ["ui_improvement", "new_feature", "integration", "performance"],
				priority_level: ["nice_to_have", "important", "critical", "blocker"],
				estimated_users_affected: weighNumRange(1, 10000, 0.6),
				business_impact: ["low", "medium", "high", "critical"],
				similar_requests: weighNumRange(0, 50, 0.7),
				requester_plan: ["free", "basic", "pro", "enterprise"],
				implementation_complexity: ["simple", "moderate", "complex", "very_complex"],
				votes: weighNumRange(0, 200, 0.5)
			}
		},
		{
			event: "onboarding_feedback",
			weight: 15,
			properties: {
				feedback_text: () => onboardingGen.generateOne(),
				onboarding_step: ["signup", "email_verification", "profile_setup", "first_use", "tutorial"],
				completion_rate: weighNumRange(0, 100, 0.3), // Most struggle
				time_spent_minutes: weighNumRange(1, 120, 0.6),
				dropped_at_step: ["signup", "tutorial", "first_action", "payment", "completed"],
				help_docs_accessed: [true, false, false], // 33% read docs
				support_contacted: [true, false, false, false], // 25% contact support
				device_type: ["desktop", "mobile", "tablet"],
				signup_source: ["organic", "paid_ad", "referral", "social_media"]
			}
		},
		
		// Community Interaction Events
		{
			event: "tutorial_comment_posted",
			weight: 7,
			properties: {
				comment_text: () => tutorialCommentGen.generateOne(),
				tutorial_section: ["getting_started", "advanced_features", "api_guide", "troubleshooting"],
				helpfulness_rating: weighNumRange(1, 5, 0.4), // Skewed positive
				comment_type: ["question", "clarification", "praise", "suggestion", "correction"],
				user_experience_level: ["beginner", "intermediate", "advanced", "expert"],
				tutorial_completion: weighNumRange(0, 100, 0.5),
				follow_up_questions: weighNumRange(0, 5, 0.8),
				marked_as_helpful: [true, true, false], // 67% helpful
				time_on_tutorial_minutes: weighNumRange(2, 60, 0.6)
			}
		},
		{
			event: "webinar_chat_message",
			weight: 20,
			properties: {
				message_text: () => webinarChatGen.generateOne(),
				webinar_topic: ["product_demo", "feature_update", "best_practices", "q_and_a"],
				message_timestamp_minutes: weighNumRange(0, 90, 0.5), // Throughout webinar
				attendee_count: weighNumRange(50, 1000, 0.4),
				is_question: [true, true, false], // 67% are questions
				is_answered: [true, false, false], // 33% get answered
				reaction_emoji: ["👍", "❤️", "😍", "🤔", "👏", null, null], // Some have reactions
				is_moderator: [true, false, false, false, false], // 20% from moderators
				attendee_type: ["customer", "prospect", "partner", "employee"]
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
	
	funnels: [
		
	],
	
	superProps: {
		product_tier: ["free", "basic", "pro", "enterprise"],
		data_center: ["us-east", "us-west", "eu-central", "asia-pacific"],
		feature_flags: () => {
			// Dynamic feature flags
			const flags = ["new_dashboard", "beta_api", "advanced_analytics", "mobile_v2"];
			// @ts-ignore
			return flags.filter(() => chance.bool({likelihood: 5})); // 5% chance each flag is enabled
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
	scdProps: {},
	
	// ============= Lookup Tables =============
	lookupTables: [
		
	],

	hook: function (record, type, meta) {
		return record;
	}
};

export default dungeon;