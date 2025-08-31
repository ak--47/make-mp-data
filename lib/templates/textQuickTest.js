import { createGenerator, generateBatch } from "../generators/text.js";

function main() {
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

	const fiftyEnterpriseSupport = enterpriseSupportGen.generateBatch({ n: 50 });

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

	const fiftyCasualReviews = casualReviewGen.generateBatch({ n: 50 });

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

	const fiftyTechForms = technicalForumGen.generateBatch({ n: 50 });

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

	const fiftySearch = searchQueryGen.generateBatch({ n: 50 });

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

	const fiftyFeedback = businessFeedbackGen.generateBatch({ n: 50 });

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

	const fiftyChatMsg = chatMessageGen.generateBatch({ n: 50 });

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

	const fiftyEmails = emailGen.generateBatch({ n: 50 });

	return {
		email: fiftyEmails,
		chat: fiftyChatMsg,
		feedback: fiftyFeedback,
		search: fiftySearch,
		tech: fiftyTechForms,
		casual: fiftyCasualReviews,
		enterprise: fiftyEnterpriseSupport
	};

}


const result = main();


debugger;