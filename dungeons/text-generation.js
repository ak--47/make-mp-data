import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import { weighNumRange, range, date, initChance, exhaust, choose, integer } from "../lib/utils/utils.js";
import { createTextGenerator, generateBatch } from "../lib/generators/text.js";

const SEED = "SUPER DUPER DANGEROUS BROOO";
dayjs.extend(utc);
const chance = initChance(SEED);
const num_users = 8_000;
const days = 92;

/** @typedef  {import("../types.js").Dungeon} Dungeon */


// Enterprise support ticket generator with keywords and high authenticity
const enterpriseSupportGen = createTextGenerator({
	style: "support",
	tone: "neg",
	intensity: "high",
	formality: "technical",
	keywords: {
		features: ['Dashboard Analytics', 'Export API', 'SSO Login', 'Admin Console', 'User Management', 'SAML Authentication', 'OAuth Integration', 'Multi-Factor Auth', 'Role-Based Access Control', 'Audit Logs', 'Webhook Configuration', 'Data Pipeline', 'Custom Reports', 'Scheduled Exports', 'Real-Time Sync', 'Bulk Import', 'API Rate Limits', 'Usage Metrics', 'Team Permissions', 'Single Sign-On', 'LDAP Integration', 'Data Retention Policies', 'Custom Domains', 'White-Label Branding', 'Advanced Filtering', 'Query Builder', 'Notification Rules', 'Email Templates', 'Workflow Automation', 'Integration Hub', 'Data Validation', 'Field Mapping', 'Schema Management', 'Version Control', 'Rollback Capability', 'Disaster Recovery', 'High Availability', 'Load Balancing', 'Auto-Scaling', 'Performance Monitoring'],
		products: ['DataViz Pro', 'Enterprise Suite', 'v3.2.1', 'v2.8.4', 'Analytics Platform', 'Cloud Dashboard', 'v4.1.0', 'v3.9.2', 'Enterprise Edition', 'Professional Tier', 'Business Intelligence Module', 'Data Warehouse Connector', 'Mobile SDK', 'REST API v2', 'GraphQL Endpoint', 'Legacy Platform', 'Next-Gen Analytics', 'Premium Package', 'Ultimate Plan', 'Advanced Analytics Suite', 'Reporting Engine', 'Data Integration Platform', 'ETL Pipeline', 'Real-Time Analytics', 'Batch Processing Module', 'Stream Processing', 'Visualization Library', 'Dashboard Builder', 'Report Designer'],
		technical: ['CORS error', 'timeout', 'memory leak', 'authentication', 'database', 'connection pooling', 'rate limiting', 'SSL handshake', 'DNS resolution', 'load balancer', 'cache invalidation', 'session timeout', 'deadlock detection', 'query optimization', 'index fragmentation', 'replication lag', 'connection refused', 'network latency', 'packet loss', 'firewall rules', 'proxy configuration', 'certificate expiration', 'API throttling', 'websocket disconnection', 'redis cluster', 'kafka consumer lag', 'database migration', 'schema validation', 'token refresh', 'OAuth flow', 'SAML assertion', 'JWT validation', 'API Gateway', 'reverse proxy', 'CDN distribution', 'geo-replication', 'data consistency', 'eventual consistency', 'distributed transactions', 'circuit breaker', 'retry logic', 'exponential backoff', 'service mesh', 'container orchestration', 'pod scheduling', 'horizontal scaling', 'vertical scaling', 'auto-discovery', 'health checks', 'graceful shutdown'],
		errors: ['ERR_CONNECTION_REFUSED', '500 Internal Server', 'TIMEOUT_ERROR', 'AUTH_FAILED', '502 Bad Gateway', '503 Service Unavailable', '504 Gateway Timeout', '401 Unauthorized', '403 Forbidden', '429 Too Many Requests', 'ECONNRESET', 'ETIMEDOUT', 'ERR_SSL_PROTOCOL', 'DATABASE_CONNECTION_FAILED', 'INVALID_TOKEN', 'SESSION_EXPIRED', 'QUOTA_EXCEEDED', 'CORS_POLICY_VIOLATION', 'VALIDATION_ERROR', 'PERMISSION_DENIED', 'RESOURCE_NOT_FOUND', 'DUPLICATE_ENTRY', 'CONSTRAINT_VIOLATION', 'OUT_OF_MEMORY', 'DISK_FULL', 'MAX_CONNECTIONS_REACHED', 'DEADLOCK_DETECTED', 'TRANSACTION_ROLLBACK', 'REPLICATION_ERROR', 'CLUSTER_SPLIT_BRAIN', 'FAILOVER_TRIGGERED', 'BACKUP_FAILED', 'RESTORE_ERROR', 'MIGRATION_FAILED', 'SCHEMA_MISMATCH', 'VERSION_CONFLICT'],
		competitors: ['Tableau', 'PowerBI', 'Looker', 'Qlik', 'Domo', 'Sisense', 'ThoughtSpot', 'Mode Analytics', 'Metabase', 'Redash', 'Chartio', 'Periscope Data', 'Google Data Studio', 'Amazon QuickSight', 'IBM Cognos', 'SAP Analytics', 'Oracle BI', 'MicroStrategy', 'Yellowfin', 'Birst', 'Alteryx', 'Dataiku', 'Databricks', 'Snowflake', 'BigQuery', 'Redshift', 'Azure Synapse', 'Splunk', 'New Relic', 'Datadog']
	},
	mixedSentiment: true,
	authenticityLevel: 0.7,
	typos: true,
	typoRate: 0.02,
	specificityLevel: 0.8,
	min: 80,
	max: 254,
	includeMetadata: false,
});

// Casual review generator with typos and mixed sentiment
const casualReviewGen = createTextGenerator({
	style: "review",
	tone: "pos",
	intensity: "medium",
	formality: "casual",
	keywords: {
		features: ['user interface', 'mobile app', 'notifications', 'search function', 'dark mode', 'offline mode', 'sync feature', 'sharing options', 'customization', 'templates', 'shortcuts', 'filters', 'drag and drop', 'auto-save', 'undo feature', 'export options', 'integrations', 'widgets', 'dashboard', 'settings panel', 'navigation menu', 'quick actions', 'gesture controls', 'voice commands', 'keyboard shortcuts', 'batch operations', 'smart suggestions', 'auto-complete', 'real-time updates', 'collaboration tools', 'comment threads', 'version history', 'file upload', 'cloud storage', 'cross-platform sync', 'responsive design', 'accessibility features', 'performance', 'loading speed', 'battery usage', 'data usage', 'privacy controls', 'security settings', 'backup and restore', 'multi-language support', 'localization', 'themes', 'layouts', 'custom views', 'saved filters'],
		products: ['the app', 'this tool', 'the platform', 'this software', 'the service', 'the product', 'this solution', 'the system', 'the dashboard', 'the interface', 'the application', 'the website', 'the mobile version', 'the desktop app', 'the web app', 'this program', 'the extension', 'the plugin', 'the widget', 'the suite', 'the ecosystem', 'the workspace', 'the portal', 'the client', 'the UI', 'the experience', 'the offering', 'the tool set'],
		metrics: ['response time', 'uptime', 'user experience', 'ease of use', 'learning curve', 'reliability', 'stability', 'speed', 'performance', 'load times', 'smoothness', 'intuitiveness', 'simplicity', 'flexibility', 'customizability', 'value for money', 'customer support', 'documentation quality', 'feature completeness', 'design quality', 'mobile experience', 'desktop experience', 'integration quality', 'data accuracy', 'reporting quality', 'usability', 'accessibility', 'efficiency', 'productivity gains', 'time savings', 'error rates', 'crash frequency', 'bug density', 'update frequency', 'feature velocity', 'support responsiveness', 'community engagement', 'ecosystem maturity']
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
const technicalForumGen = createTextGenerator({
	style: "forum",
	tone: "neu",
	formality: "technical",
	keywords: {
		technical: ['REST API', 'GraphQL', 'webhooks', 'microservices', 'cloud infrastructure', 'Kubernetes', 'Docker containers', 'CI/CD pipeline', 'serverless functions', 'Lambda', 'API Gateway', 'load balancing', 'horizontal scaling', 'database sharding', 'caching layer', 'message queue', 'event streaming', 'pub/sub', 'service mesh', 'OAuth2', 'JWT tokens', 'CORS policy', 'WebSocket', 'gRPC', 'Protocol Buffers', 'MongoDB', 'PostgreSQL', 'Redis', 'Elasticsearch', 'S3 bucket', 'CloudFront', 'CDN', 'DNS records', 'SSL/TLS', 'reverse proxy', 'nginx', 'Apache', 'auto-scaling', 'VPC', 'subnet', 'security groups', 'IAM roles', 'environment variables', 'config management', 'secrets manager', 'monitoring', 'logging', 'distributed tracing', 'metrics', 'alerting', 'APM', 'observability', 'infrastructure as code', 'Terraform', 'CloudFormation', 'Ansible', 'Chef', 'Puppet', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI', 'Travis CI', 'code review', 'pull requests', 'merge strategies', 'branching model', 'git workflow', 'semantic versioning', 'changelog', 'release notes', 'feature flags', 'canary deployment', 'blue-green deployment', 'rolling updates'],
		versions: ['v1.2.3', 'latest', 'beta', 'stable release', 'v2.0.0', 'v3.1.4', 'v4.0.0-rc1', 'LTS', 'nightly build', 'canary', 'alpha', 'RC2', 'stable', 'edge', 'preview', '1.x', '2.x', '3.x', 'legacy', 'deprecated', 'EOL', 'current', 'next', 'experimental', 'mainline', 'development', 'production', 'staging', 'QA', 'hotfix', 'patch', 'minor', 'major', 'breaking'],
		errors: ['404 Not Found', 'Rate Limiting', 'SSL Certificate', '502 Bad Gateway', '503 Service Unavailable', '401 Unauthorized', '403 Forbidden', '408 Request Timeout', '413 Payload Too Large', '500 Internal Server Error', 'CORS error', 'DNS resolution failed', 'connection timeout', 'read timeout', 'write timeout', 'circuit breaker', 'health check failed', 'deployment failed', 'build error', 'test failure', 'merge conflict', 'dependency error', 'version mismatch', 'breaking change', 'backward incompatible', 'compilation error', 'runtime exception', 'null pointer', 'race condition', 'deadlock', 'memory exhaustion', 'CPU throttling', 'disk I/O', 'network partition', 'split brain', 'consensus failure', 'quorum lost']
	},
	userPersona: true,
	timestamps: true,
	authenticityLevel: 0.6,
	specificityLevel: 0.9,	
	min: 50,
	max: 254,
	includeMetadata: false
});

// Search queries with realistic typos
const searchQueryGen = createTextGenerator({
	style: "search",
	tone: "neu",
	formality: "casual",
	keywords: {
		features: ['export data', 'user settings', 'help docs', 'pricing', 'billing', 'account settings', 'password reset', 'two factor authentication', 'team management', 'permissions', 'API keys', 'webhooks', 'integrations', 'custom fields', 'bulk upload', 'import CSV', 'export PDF', 'download report', 'sharing options', 'collaboration', 'notifications', 'email preferences', 'mobile app', 'desktop app', 'browser extension', 'keyboard shortcuts', 'templates', 'automation', 'workflows', 'filters', 'search', 'sorting', 'grouping', 'charts', 'dashboards', 'analytics', 'reports', 'insights', 'trends', 'forecasting', 'benchmarks', 'goals', 'KPIs', 'metrics', 'data visualization', 'custom reports', 'scheduled reports', 'alerts', 'reminders', 'tasks', 'projects', 'files', 'attachments', 'comments', 'mentions', 'tags', 'labels', 'categories', 'folders', 'archive', 'trash', 'restore', 'backup', 'export', 'import', 'migrate', 'sync', 'offline access', 'dark theme', 'language settings', 'time zone', 'date format', 'currency', 'units', 'accessibility', 'privacy', 'security', 'compliance', 'audit trail', 'version history', 'changelog'],
		technical: ['API documentation', 'integration guide', 'troubleshooting', 'SDK reference', 'REST API', 'GraphQL', 'authentication', 'OAuth', 'SSO setup', 'SAML', 'rate limits', 'error codes', 'status page', 'changelog', 'release notes', 'migration guide', 'upgrade path', 'deprecation notice', 'API versioning', 'webhooks setup', 'callback URL', 'payload format', 'request headers', 'response codes', 'pagination', 'filtering', 'sorting API', 'batch endpoints', 'async operations', 'retry logic', 'timeout settings', 'CORS configuration', 'IP whitelist', 'security best practices', 'code examples', 'sample requests', 'postman collection', 'curl commands', 'client libraries', 'npm packages', 'pip packages', 'gem install', 'maven dependency', 'nuget package', 'composer require', 'quickstart tutorial', 'getting started', 'hello world', 'first API call', 'authentication flow', 'token management', 'refresh tokens', 'scopes', 'permissions', 'roles', 'rate limit handling', 'error handling', 'best practices', 'common pitfalls', 'FAQ', 'support forum']
	},
	typos: true,
	typoRate: 0.05,	
	min: 2,
	max: 50,
	includeMetadata: false
});

// Business feedback with professional tone
const businessFeedbackGen = createTextGenerator({
	style: "feedback",
	tone: "neu",
	formality: "business",
	keywords: {
		metrics: ['ROI', 'efficiency', 'cost savings', 'productivity', 'revenue growth', 'profit margin', 'conversion rate', 'customer acquisition cost', 'lifetime value', 'churn rate', 'retention rate', 'engagement rate', 'adoption rate', 'time to value', 'operational efficiency', 'resource utilization', 'cost per transaction', 'revenue per user', 'gross margin', 'net promoter score', 'customer satisfaction', 'employee satisfaction', 'market share', 'growth rate', 'scalability', 'performance metrics', 'KPI achievement', 'goal attainment', 'benchmark comparison', 'industry standards', 'competitive advantage', 'process improvement', 'quality metrics', 'error rate', 'uptime SLA', 'response time SLA', 'mean time to resolution', 'first contact resolution', 'customer effort score', 'employee Net Promoter Score', 'revenue per employee', 'operating margin', 'EBITDA', 'cash flow', 'burn rate', 'runway', 'payback period', 'IRR', 'NPV', 'break-even analysis', 'variance analysis', 'trend analysis', 'cohort analysis', 'funnel conversion', 'pipeline velocity', 'win rate', 'average deal size', 'sales cycle length', 'quota attainment', 'forecast accuracy'],
		features: ['reporting', 'analytics', 'integration capabilities', 'dashboard customization', 'automated workflows', 'data visualization', 'forecasting tools', 'predictive analytics', 'real-time monitoring', 'alert system', 'custom reports', 'scheduled reports', 'export functionality', 'API access', 'bulk operations', 'team collaboration', 'role-based access', 'audit trails', 'compliance features', 'data security', 'backup and recovery', 'scalability', 'mobile access', 'offline capabilities', 'third-party integrations', 'CRM integration', 'ERP integration', 'accounting software', 'payment gateways', 'marketing tools', 'customer support', 'training resources', 'documentation', 'professional services', 'dedicated support', 'white-glove onboarding', 'custom development', 'consulting services', 'implementation support', 'change management', 'data migration', 'system integration', 'workflow automation', 'process optimization', 'business intelligence', 'advanced analytics', 'machine learning', 'AI capabilities', 'natural language processing', 'sentiment analysis', 'anomaly detection', 'pattern recognition']
	},
	authenticityLevel: 0.3,
	specificityLevel: 0.7,	
	min: 40,
	max: 180,
	includeMetadata: false
});

// Chat messages with high authenticity and typos
const chatMessageGen = createTextGenerator({
	style: "chat",
	tone: "neu",
	formality: "casual",
	keywords: {
		products: ['the app', 'dashboard', 'mobile version', 'desktop app', 'web interface', 'admin panel', 'user portal', 'control center', 'main screen', 'home page', 'settings menu', 'profile page', 'analytics view', 'reports section', 'tools menu', 'workspace', 'project view', 'task board', 'calendar', 'inbox', 'activity feed', 'timeline', 'kanban board', 'list view', 'grid view', 'table view', 'card view', 'sidebar', 'toolbar', 'command palette', 'search bar'],
		features: ['notifications', 'sync', 'offline mode', 'dark theme', 'search bar', 'filters', 'sorting', 'export', 'import', 'sharing', 'comments', 'mentions', 'attachments', 'tags', 'labels', 'priorities', 'due dates', 'reminders', 'templates', 'shortcuts', 'quick actions', 'bulk edit', 'drag and drop', 'auto-save', 'undo', 'redo', 'copy', 'paste', 'duplicate', 'archive', 'delete', 'restore', 'permissions', 'privacy settings', 'integrations', 'plugins', 'extensions', 'widgets', 'customization', 'themes', 'layouts', 'columns', 'rows', 'groups', 'sections', 'tabs', 'panels', 'modals', 'drawers', 'tooltips', 'popups', 'dropdowns', 'menus', 'buttons', 'icons', 'avatars', 'badges', 'chips', 'cards', 'lists', 'tables', 'forms', 'inputs', 'selects', 'checkboxes', 'radios', 'switches', 'sliders', 'pickers', 'calendars']
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

// Comment generator for charity/fundraiser/wedding sites
const charityCommentGen = createTextGenerator({
	style: "comments",
	tone: "pos",
	formality: "casual", 
	keywords: {
		causes: ['medical expenses', 'education fund', 'disaster relief', 'animal rescue', 'cancer treatment', 'surgery costs', 'hospital bills', 'therapy sessions', 'medication costs', 'emergency fund', 'family support', 'rebuilding homes', 'fire victims', 'flood relief', 'hurricane recovery', 'earthquake aid', 'homeless shelter', 'food bank', 'clean water', 'orphanage', 'scholarship fund', 'school supplies', 'music program', 'sports team', 'library books', 'art classes', 'STEM education', 'vocational training', 'wildlife conservation', 'pet adoption', 'veterinary care', 'sanctuary support', 'endangered species', 'habitat restoration', 'community garden', 'youth programs', 'senior care', 'veteran support', 'mental health', 'addiction recovery', 'domestic violence shelter', 'refugee assistance', 'clean energy', 'environmental protection', 'climate action', 'ocean cleanup', 'reforestation', 'bee preservation', 'sustainable farming', 'fair trade', 'microfinance', 'poverty alleviation', 'hunger relief', 'literacy programs', 'healthcare access', 'vaccine distribution', 'maternal health', 'child welfare', 'disability support', 'autism awareness', 'Alzheimer research', 'diabetes foundation', 'heart disease', 'rare diseases', 'transplant fund', 'burn victims', 'spinal injury', 'ALS research', 'MS foundation', 'Parkinson support'],
		events: ['wedding', 'graduation', 'celebration', 'memorial', 'anniversary', 'birthday', 'retirement', 'baby shower', 'baptism', 'bar mitzvah', 'quinceañera', 'engagement', 'homecoming', 'reunion', 'fundraiser', 'gala', 'benefit concert', 'charity run', 'walkathon', 'bake sale', 'auction', 'raffle', 'tribute', 'remembrance', 'celebration of life', 'milestone', 'achievement', 'honor', 'recognition', 'award ceremony', 'dedication', 'inauguration', 'opening ceremony', 'grand opening', 'ribbon cutting', 'groundbreaking', 'cornerstone laying', 'time capsule', 'vigil', 'candlelight service', 'prayer service', 'blessing ceremony', 'consecration', 'ordination', 'confirmation', 'first communion', 'christening', 'naming ceremony', 'baby blessing'],
		emotions: ['inspiring', 'heartwarming', 'touching', 'amazing', 'beautiful', 'wonderful', 'incredible', 'uplifting', 'moving', 'powerful', 'meaningful', 'blessed', 'grateful', 'thankful', 'appreciative', 'hopeful', 'encouraging', 'supportive', 'loving', 'caring', 'compassionate', 'generous', 'kind', 'thoughtful', 'selfless', 'brave', 'courageous', 'strong', 'resilient', 'determined', 'faithful', 'spiritual', 'prayerful', 'miraculous', 'life-changing', 'transformative', 'impactful', 'significant', 'important', 'special', 'memorable', 'unforgettable', 'precious', 'cherished', 'treasured', 'beloved', 'dear', 'valued', 'respected', 'honored', 'admired', 'celebrated', 'praised', 'acclaimed', 'commended', 'recognized', 'acknowledged', 'appreciated', 'esteemed', 'revered', 'venerated', 'hallowed', 'sacred', 'holy', 'divine', 'heavenly', 'angelic', 'saintly', 'virtuous', 'noble', 'dignified', 'graceful', 'elegant', 'refined', 'cultured', 'sophisticated', 'distinguished', 'eminent', 'illustrious', 'renowned', 'celebrated', 'famous', 'notable', 'prominent', 'leading', 'foremost', 'preeminent', 'outstanding', 'exceptional', 'extraordinary', 'remarkable', 'phenomenal', 'spectacular', 'stupendous', 'magnificent', 'majestic', 'grand', 'glorious', 'sublime', 'exquisite', 'superb', 'splendid', 'marvelous', 'fabulous', 'terrific', 'fantastic']
	},
	mixedSentiment: false,
	authenticityLevel: 0.9,
	typos: true,
	typoRate: 0.02,
	min: 10,
	max: 100,
	includeMetadata: false
});

// Tweet generator for social media announcements
const socialTweetGen = createTextGenerator({
	style: "tweet", 
	tone: "neu",
	formality: "casual",
	keywords: {
		announcements: ['new feature', 'product launch', 'company news', 'milestone', 'breaking news', 'just launched', 'now available', 'coming soon', 'sneak peek', 'behind the scenes', 'exclusive', 'limited time', 'special offer', 'big update', 'major release', 'version 2.0', 'redesign', 'rebrand', 'partnership', 'collaboration', 'acquisition', 'funding round', 'growth milestone', '10k users', '100k signups', 'went viral', 'trending', 'featured in', 'award winning', 'recognition', 'celebrating', 'thank you', 'shoutout', 'appreciation post', 'team highlight', 'customer story', 'success story', 'case study', 'testimonial', 'review', 'feedback', 'poll', 'question', 'discussion', 'hot take', 'unpopular opinion', 'PSA', 'reminder', 'tip', 'hack', 'tutorial', 'how-to', 'guide', 'resource', 'announcement', 'press release', 'media coverage', 'interview', 'podcast', 'webinar', 'event', 'conference', 'meetup', 'workshop', 'hackathon', 'demo day', 'pitch competition', 'startup weekend', 'accelerator', 'incubator', 'seed funding', 'Series A', 'venture capital', 'angel investment', 'bootstrapped', 'profitable', 'revenue', 'ARR', 'MRR', 'growth rate', 'user acquisition', 'retention rate', 'churn rate', 'conversion rate', 'engagement metrics', 'product-market fit', 'traction', 'momentum', 'scaling', 'expansion', 'international launch', 'new market', 'vertical', 'pivot', 'iteration', 'MVP', 'beta testing', 'alpha release', 'public launch', 'general availability', 'early access', 'waitlist', 'invite only', 'closed beta', 'open beta'],
		hashtags: ['#startup', '#tech', '#innovation', '#community', '#SaaS', '#B2B', '#B2C', '#ProductHunt', '#IndieHacker', '#Entrepreneur', '#Founder', '#CEO', '#CTO', '#Developer', '#Design', '#UX', '#UI', '#Growth', '#Marketing', '#Sales', '#CustomerSuccess', '#Support', '#Analytics', '#Data', '#AI', '#ML', '#Cloud', '#API', '#Mobile', '#Web', '#Remote', '#WFH', '#Productivity', '#Tools', '#Software', '#Platform', '#App', '#Launch', '#BuildInPublic', '#Makers', '#Creators', '#SmallBusiness', '#Enterprise', '#Digital', '#Transformation', '#Future', '#Trends', '#News', '#Update', '#Technology', '#Engineering', '#Product', '#Business', '#Startup Life', '#Founder Journey', '#Entrepreneurship', '#Innovation', '#Disruption', '#Game Changer', '#Industry', '#Market', '#Competition', '#Strategy', '#Vision', '#Mission', '#Values', '#Culture', '#Team', '#Hiring', '#Jobs', '#Careers', '#Talent', '#Recruitment', '#HR', '#People', '#Leadership', '#Management', '#Coaching', '#Mentoring', '#Advising', '#Investing', '#VC', '#Angel', '#Funding', '#Capital', '#Money', '#Finance', '#Revenue', '#Profit', '#Growth', '#Scale', '#Metrics', '#KPIs', '#OKRs', '#Goals', '#Success', '#Win', '#Achievement', '#Milestone', '#Celebration', '#Announcement', '#Release', '#Feature', '#Update', '#Beta', '#Alpha', '#Preview', '#Sneak Peek', '#Coming Soon', '#Launch Day', '#Go Live', '#Ship It', '#Deploy', '#CI CD', '#DevOps', '#Agile', '#Scrum', '#Kanban', '#Sprint', '#Iteration', '#MVP', '#PMF', '#Traction', '#Momentum', '#Pivot', '#Iterate', '#Learn', '#Build', '#Test', '#Measure', '#Optimize', '#Improve', '#Enhance', '#Upgrade', '#Refactor', '#Rewrite', '#Redesign', '#Rebrand', '#Refresh', '#Modernize', '#Transform', '#Evolve', '#Adapt', '#Change', '#Progress', '#Forward', '#Next', '#Future', '#Tomorrow', '#Today', '#Now', '#Live', '#Active', '#Online', '#Available', '#Ready', '#Set', '#Go'],
		mentions: ['@followers', '@team', '@customers', '@users', '@community', '@fans', '@supporters', '@partners', '@investors', '@advisors', '@mentors', '@influencers', '@press', '@media', '@industry', '@competitors', '@friends', '@colleagues', '@experts', '@leaders', '@pioneers', '@innovators', '@builders', '@creators', '@makers', '@founders', '@entrepreneurs', '@developers', '@designers', '@engineers', '@marketers', '@sales', '@support', '@success', '@product', '@growth', '@data', '@analytics', '@AI', '@ML', '@cloud', '@API', '@mobile', '@web', '@platform', '@ecosystem', '@network', '@alliance', '@consortium', '@association', '@organization', '@foundation', '@institute', '@university', '@research', '@lab', '@studio', '@agency', '@firm', '@company', '@corporation', '@enterprise', '@business', '@startup', '@scaleup', '@unicorn', '@decacorn', '#hectocorn', '@IPO', '@acquisition', '@merger', '@exit', '@success']
	},
	mixedSentiment: true,
	authenticityLevel: 0.7,
	typos: true,
	typoRate: 0.03,
	sentimentDrift: 0.3,
	min: 10,
	max: 280, // Twitter character limit
	includeMetadata: false
});

// Email communication generator
const emailGen = createTextGenerator({
	style: "email",
	tone: "neu",
	formality: "business",
	keywords: {
		features: ['account management', 'billing', 'subscription', 'payment method', 'invoice', 'receipt', 'credit card', 'auto-renewal', 'cancellation', 'refund', 'upgrade', 'downgrade', 'plan change', 'usage limits', 'overage charges', 'discount code', 'promo code', 'trial extension', 'grace period', 'payment failed', 'card expired', 'update payment', 'billing cycle', 'annual plan', 'monthly plan', 'enterprise pricing', 'volume discount', 'custom quote', 'purchase order', 'tax exempt', 'VAT', 'sales tax', 'billing address', 'company details', 'account settings', 'security settings', 'privacy settings', 'notification preferences', 'email preferences', 'team members', 'user roles', 'permissions', 'access control', 'API keys', 'webhooks', 'integrations', 'data export', 'account closure', 'data deletion', 'GDPR compliance', 'data portability', 'right to be forgotten', 'consent management', 'opt-in', 'opt-out', 'unsubscribe', 'email frequency', 'digest settings', 'real-time alerts', 'summary emails', 'weekly reports', 'monthly statements', 'quarterly reviews', 'annual summaries'],
		products: ['Enterprise Plan', 'Pro Account', 'Business Plan', 'Premium Subscription', 'Starter Package', 'Professional Tier', 'Ultimate Edition', 'Team Plan', 'Individual Plan', 'Free Trial', 'Paid Plan', 'Custom Package', 'Add-on Services', 'Premium Features', 'Advanced Analytics', 'Priority Support', 'Dedicated Account Manager', 'SLA Agreement', 'Service Level', 'Support Package', 'Training Program', 'Onboarding Service', 'Consulting Hours', 'Implementation Support', 'Migration Assistance', 'Data Integration', 'Custom Development', 'White-Label Solution', 'Reseller Program', 'Partner Plan', 'Affiliate Program', 'Referral Rewards', 'Loyalty Benefits', 'Early Adopter', 'Beta Access', 'Preview Program']
	},
	authenticityLevel: 0.5,	
	userPersona: true,
	min: 60,
	max: 254,
	includeMetadata: false
});

// Social Media Generators
const twitterGen = createTextGenerator({
	style: "chat",
	tone: "neu",
	formality: "casual",
	keywords: {
		products: ['@company', 'the app', 'your platform', '@brand', 'the service', '@product', 'the tool', '@startup', 'the software', '@team', 'the dashboard', '@support', 'the website', '@api', 'the mobile app', '@enterprise', 'the solution', '@cloud', 'the system', '@tech', 'the interface', '@dev', 'the platform', '@community', 'the product', '@official', 'the app', '@business', 'the suite', '@premium'],
		features: ['new update', 'dark mode', 'mobile app', 'API', 'latest release', 'version 2.0', 'beta feature', 'early access', 'preview', 'redesign', 'UI refresh', 'performance improvements', 'bug fixes', 'security patch', 'new integration', 'webhook support', 'OAuth login', 'SSO', '2FA', 'export feature', 'bulk operations', 'advanced search', 'custom filters', 'real-time sync', 'offline mode', 'collaboration tools', 'team features', 'admin panel', 'analytics dashboard', 'reporting', 'automation', 'workflows', 'templates', 'shortcuts', 'notifications', 'email alerts', 'push notifications', 'desktop app', 'browser extension', 'CLI tool', 'SDK', 'REST API', 'GraphQL', 'documentation', 'changelog', 'release notes', 'roadmap', 'feature request', 'community feedback', 'user voice', 'product board', 'beta program', 'alpha testing', 'dogfooding', 'user testing', 'A/B testing', 'feature flag', 'gradual rollout', 'soft launch', 'public beta', 'general availability'],
		hashtags: ['#ProductHunt', '#SaaS', '#TechReview', '#UserExperience', '#UX', '#UI', '#Design', '#Tech', '#Startup', '#IndieHacker', '#BuildInPublic', '#Founder', '#Entrepreneur', '#Developer', '#Programming', '#Code', '#WebDev', '#MobileDev', '#API', '#Cloud', '#DevTools', '#Productivity', '#Tools', '#Software', '#App', '#Platform', '#Innovation', '#Digital', '#Technology', '#Engineering', '#Product', '#Launch', '#Release', '#Update', '#Feature', '#Beta', '#Preview', '#Review', '#Feedback', '#CustomerSuccess', '#Support', '#Community', '#OpenSource', '#GitHub', '#JavaScript', '#TypeScript', '#React', '#Vue', '#Angular', '#Node', '#Python', '#Go', '#Rust', '#Swift', '#Kotlin', '#Flutter', '#ReactNative', '#iOS', '#Android', '#macOS', '#Windows', '#Linux', '#DevOps', '#CI/CD', '#Kubernetes', '#Docker', '#AWS', '#Azure', '#GCP', '#Firebase', '#Supabase', '#Vercel', '#Netlify', '#Cloudflare', '#MongoDB', '#PostgreSQL', '#MySQL', '#Redis', '#GraphQL', '#REST', '#gRPC', '#WebSocket', '#Serverless', '#Edge', '#JAMstack', '#Headless', '#NoCode', '#LowCode']
	},
	mixedSentiment: true,
	authenticityLevel: 0.9,
	typos: true,
	typoRate: 0.06,
	sentimentDrift: 0.5,
	min: 10,
	max: 254, // Twitter character limit
	includeMetadata: false
});

const linkedinGen = createTextGenerator({
	style: "feedback", 
	tone: "neu",
	formality: "business",
	keywords: {
		business: ['ROI', 'team productivity', 'workflow efficiency', 'digital transformation', 'operational excellence', 'strategic initiative', 'business intelligence', 'data-driven decisions', 'competitive advantage', 'market leadership', 'customer experience', 'employee engagement', 'talent acquisition', 'organizational growth', 'process optimization', 'cost reduction', 'revenue growth', 'profit margins', 'market share', 'brand value', 'stakeholder value', 'sustainable growth', 'innovation culture', 'agile methodology', 'lean operations', 'six sigma', 'continuous improvement', 'change management', 'risk management', 'compliance', 'governance', 'cybersecurity', 'data privacy', 'cloud migration', 'automation', 'AI adoption', 'machine learning', 'predictive analytics', 'business model', 'value proposition', 'go-to-market strategy', 'sales enablement', 'marketing automation', 'customer retention', 'lifetime value', 'acquisition cost', 'conversion optimization', 'funnel metrics', 'pipeline management', 'revenue operations', 'customer success', 'account expansion', 'upsell', 'cross-sell', 'customer health score', 'product-led growth', 'community-led growth', 'network effects', 'viral coefficient', 'referral programs', 'partnership ecosystem', 'channel strategy', 'direct sales', 'inside sales', 'field sales', 'enterprise sales', 'mid-market', 'SMB', 'self-serve', 'product qualified leads', 'sales qualified leads', 'marketing qualified leads'],
		products: ['this solution', 'the platform', 'our implementation', 'enterprise software', 'SaaS platform', 'cloud solution', 'business tool', 'productivity suite', 'analytics platform', 'CRM system', 'ERP solution', 'collaboration tool', 'project management', 'workflow automation', 'data warehouse', 'BI dashboard', 'reporting tool', 'integration platform', 'API solution', 'mobile app', 'web application', 'infrastructure', 'technology stack', 'digital ecosystem', 'unified platform', 'all-in-one solution', 'best-of-breed', 'enterprise grade', 'mission critical', 'business critical', 'strategic system', 'core platform', 'foundational technology', 'enabling platform', 'transformation engine'],
		metrics: ['25% time savings', '40% faster', 'reduced costs', 'improved outcomes', '3x ROI', '50% efficiency gain', '60% cost reduction', '2x revenue growth', '35% productivity boost', '45% faster time-to-market', '70% error reduction', '80% automation rate', '90% customer satisfaction', '95% uptime', '99.9% reliability', '10x scale', '5-star rating', 'industry-leading', 'best-in-class', 'award-winning', 'certified', 'proven results', 'measurable impact', 'significant improvement', 'dramatic increase', 'substantial savings', 'notable enhancement', 'remarkable transformation', 'exceptional performance', 'outstanding results', 'impressive growth', 'record-breaking', 'unprecedented success', 'game-changing', 'paradigm shift', 'breakthrough innovation', 'disruptive technology', 'cutting-edge solution', 'next-generation platform', 'future-proof architecture', 'scalable infrastructure', 'flexible framework', 'modular design', 'extensible platform', 'API-first approach', 'microservices architecture', 'event-driven design', 'real-time processing', 'batch processing', 'hybrid approach', 'multi-tenant', 'single-tenant', 'dedicated instance', 'shared infrastructure', 'private cloud', 'public cloud', 'hybrid cloud', 'multi-cloud', 'cloud-native', 'cloud-agnostic', 'on-premise', 'hybrid deployment', 'distributed system']
	},
	authenticityLevel: 0.4,
	specificityLevel: 0.8,
	userPersona: true,
	min: 50,
	max: 254,
	includeMetadata: false
});

const redditGen = createTextGenerator({
	style: "forum",
	tone: "neu", 
	formality: "casual",
	keywords: {
		reddit: ['UPDATE:', 'TL;DR', 'Edit:', 'Anyone else?', 'PSA', 'HELP', 'URGENT', 'Story time', 'Long post ahead', 'Sorry for formatting', 'On mobile', 'Throwaway account', 'First time posting', 'Not sure if this belongs here', 'Mods delete if not allowed', 'Cross-posted from', 'Shout out to', 'Thanks in advance', 'Will update later', 'UPDATE 2:', 'FINAL UPDATE', 'SOLVED', 'Still broken', 'Obligatory', 'RIP inbox', 'Thanks kind stranger', 'This blew up', 'Wow front page', 'Thanks for the gold', 'Award speech edit', 'Hijacking top comment', 'Came here to say this', 'This', 'Underrated comment', 'Found the', 'Username checks out', 'Take my upvote', 'Have my poor mans gold', 'So much this', 'Literally this', 'Came to the comments for this', 'Not disappointed', 'Doing gods work', 'Real MVP', 'The hero we need', 'You sir are a gentleman and a scholar', 'Take my energy', 'Instructions unclear', 'Task failed successfully', 'Perfectly balanced', 'As all things should be', 'I see this as an absolute win', 'They had us in the first half', 'Not gonna lie', 'Ngl', 'Fr fr', 'No cap', 'Lowkey', 'Highkey', 'Deadass', 'Bet', 'Facts', 'Big if true', 'Source?', 'Citation needed', 'Sauce?', 'This guy', 'Username relevant', 'Flair checks out', 'Comment checks out', 'Math checks out', 'Story checks out', 'Seems legit', 'Can confirm', 'Can verify', 'As a', 'I too'],
		products: ['this tool', 'the service', 'their platform', 'the app', 'the software', 'the program', 'the site', 'the website', 'the API', 'the plugin', 'the extension', 'the integration', 'the framework', 'the library', 'the package', 'the solution', 'the product', 'the system', 'open source alternative', 'paid version', 'free tier', 'premium plan', 'enterprise edition', 'self-hosted', 'cloud-based', 'web-based', 'desktop app', 'mobile app', 'command line', 'GUI version', 'CLI version', 'the dashboard', 'the interface', 'the UI', 'the UX', 'the design', 'the implementation', 'the deployment', 'the setup', 'the config', 'the docs', 'the documentation', 'the tutorial', 'the guide', 'the wiki', 'the FAQ', 'the help center', 'the support', 'the community', 'the forum', 'the Discord', 'the Slack', 'the subreddit', 'the GitHub', 'the repo', 'the codebase', 'the source code'],
		community: ['r/SaaS', 'fellow devs', 'community', 'r/webdev', 'r/programming', 'r/startups', 'r/entrepreneur', 'r/technology', 'r/datascience', 'r/analytics', 'r/marketing', 'r/productivity', 'r/selfhosted', 'r/opensource', 'this subreddit', 'you guys', 'y\'all', 'folks', 'people here', 'hivemind', 'fellow redditors', 'OP', 'the community', 'everyone', 'somebody', 'anyone know', 'does anyone', 'has anyone tried', 'looking for recommendations', 'seeking advice', 'need help', 'can someone explain', 'ELI5', 'explain like I\'m five', 'out of the loop', 'OOTL', 'what did I miss', 'context?', 'background?', 'what\'s the story', 'what happened', 'why is this', 'how does this', 'when did this', 'where can I', 'who knows', 'asking for a friend', 'no stupid questions', 'dumb question', 'probably obvious but', 'might be a silly question', 'hope this is allowed', 'delete if not appropriate']
	},
	mixedSentiment: true,
	authenticityLevel: 0.8,
	typos: true,
	typoRate: 0.03,
	sentimentDrift: 0.4,
	min: 30,
	max: 254,
	includeMetadata: false
});

// Product Usage Generators
const bugReportGen = createTextGenerator({
	style: "support",
	tone: "neg",
	formality: "technical",
	keywords: {
		technical: ['console errors', 'reproduction steps', 'browser version', 'stack trace', 'error logs', 'debug mode', 'developer tools', 'network tab', 'console output', 'browser cache', 'cookies', 'local storage', 'session storage', 'IndexedDB', 'service worker', 'WebSocket', 'AJAX request', 'fetch API', 'XMLHttpRequest', 'promise rejection', 'async/await', 'callback hell', 'memory leak', 'CPU spike', 'performance profiler', 'flame graph', 'heap snapshot', 'garbage collection', 'event listener', 'DOM manipulation', 'render blocking', 'layout thrashing', 'paint flashing', 'compositing layers', 'GPU acceleration', 'requestAnimationFrame', 'intersection observer', 'mutation observer', 'resize observer', 'scroll event', 'click handler', 'form validation', 'input sanitization', 'XSS vulnerability', 'CSRF token', 'API endpoint', 'request payload', 'response headers', 'status code', 'CORS preflight', 'OPTIONS request', 'authentication token', 'session expired', 'rate limit exceeded', 'browser fingerprinting', 'user agent', 'viewport size', 'screen resolution', 'color depth', 'pixel ratio', 'touch support', 'WebGL', 'Canvas', 'SVG', 'media queries', 'responsive breakpoints', 'mobile first', 'progressive enhancement', 'graceful degradation', 'polyfills', 'transpilation', 'bundling', 'code splitting', 'tree shaking', 'minification', 'compression', 'source maps', 'HMR', 'live reload', 'webpack', 'vite', 'rollup', 'parcel', 'esbuild'],
		errors: ['TypeError', 'ReferenceError', '404', '500', 'timeout', 'SyntaxError', 'RangeError', 'URIError', 'EvalError', 'InternalError', 'null is not an object', 'undefined is not a function', 'cannot read property', 'cannot set property', 'division by zero', 'stack overflow', 'out of memory', 'maximum call stack size exceeded', 'too much recursion', 'illegal invocation', 'failed to fetch', 'network request failed', 'CORS policy', 'mixed content', 'invalid JSON', 'unexpected token', 'unexpected end of input', '401 Unauthorized', '403 Forbidden', '408 Request Timeout', '429 Too Many Requests', '500 Internal Server Error', '502 Bad Gateway', '503 Service Unavailable', '504 Gateway Timeout', 'ERR_CONNECTION_REFUSED', 'ERR_CONNECTION_RESET', 'ERR_NETWORK_CHANGED', 'ERR_SSL_PROTOCOL_ERROR', 'ERR_CERT_AUTHORITY_INVALID', 'DNS_PROBE_FINISHED_NXDOMAIN', 'ERR_NAME_NOT_RESOLVED', 'ERR_INTERNET_DISCONNECTED', 'ERR_ADDRESS_UNREACHABLE', 'ERR_CONNECTION_TIMED_OUT', 'ERR_EMPTY_RESPONSE', 'ERR_CONTENT_DECODING_FAILED', 'ERR_TOO_MANY_REDIRECTS', 'ERR_UNSAFE_REDIRECT', 'ERR_BLOCKED_BY_CLIENT', 'ERR_BLOCKED_BY_RESPONSE', 'NetworkError when attempting to fetch resource', 'Failed to load resource', 'Script error', 'Uncaught exception', 'Unhandled promise rejection'],
		environment: ['Chrome 118', 'macOS Ventura', 'Windows 11', 'mobile Safari', 'Firefox 119', 'Safari 17', 'Edge 118', 'Opera 104', 'Brave', 'Chrome 120', 'Firefox ESR', 'Safari Technology Preview', 'Chrome Canary', 'Firefox Nightly', 'Edge Dev', 'macOS Sonoma', 'macOS Monterey', 'macOS Big Sur', 'Windows 10', 'Windows Server 2022', 'Ubuntu 22.04', 'Ubuntu 20.04', 'Debian 12', 'Fedora 39', 'RHEL 9', 'iOS 17', 'iOS 16', 'iPadOS 17', 'Android 14', 'Android 13', 'Android 12', 'ChromeOS', 'Node.js 20', 'Node.js 18', 'Deno', 'Bun', 'npm 10', 'pnpm 8', 'yarn 4', 'webpack 5', 'vite 5', 'rollup 4', 'esbuild', 'turbopack', 'React 18', 'Vue 3', 'Angular 17', 'Svelte 4', 'Next.js 14', 'Nuxt 3', 'Remix', 'Astro', 'SvelteKit', 'Solid.js', 'Qwik', 'Alpine.js', 'htmx', 'Lit', 'Stencil', 'Preact', 'Inferno', 'Mithril']
	},
	authenticityLevel: 0.6,
	specificityLevel: 0.9,
	typos: true,
	typoRate: 0.02,
	min: 80,
	max: 254,
	includeMetadata: false
});

const featureRequestGen = createTextGenerator({
	style: "feedback",
	tone: "pos",
	formality: "business", 
	keywords: {
		requests: ['would love to see', 'feature request', 'enhancement idea', 'suggestion', 'please add', 'it would be great if', 'can we get', 'missing feature', 'critical need', 'nice to have', 'must have', 'deal breaker', 'considering switching because', 'compared to competitors', 'industry standard', 'best practice', 'common feature', 'expected functionality', 'surprised this isn\'t available', 'shocked there\'s no', 'desperately need', 'would pay extra for', 'enterprise requirement', 'compliance need', 'accessibility requirement', 'security concern', 'privacy feature', 'GDPR compliance', 'SOC2 requirement', 'HIPAA compliance', 'audit trail', 'data governance', 'role-based access', 'granular permissions', 'API endpoint', 'webhook event', 'integration with', 'support for', 'compatibility with', 'import from', 'export to', 'migration tool', 'parity with', 'feature gap', 'missing capability', 'lacking functionality', 'incomplete implementation', 'partial support', 'beta feature', 'experimental', 'early access', 'preview', 'roadmap item', 'planned feature', 'upcoming release', 'next version', 'future update', 'long-term goal', 'strategic initiative', 'product vision', 'user research', 'customer feedback', 'common request', 'frequently asked', 'top voted', 'highly requested', 'most wanted', 'popular demand'],
		features: ['bulk export', 'dark mode', 'keyboard shortcuts', 'advanced filters', 'custom fields', 'templates', 'automation rules', 'scheduled tasks', 'recurring events', 'reminders', 'notifications', 'email alerts', 'SMS alerts', 'push notifications', 'in-app messaging', 'real-time sync', 'offline mode', 'mobile app', 'desktop app', 'browser extension', 'API access', 'webhooks', 'OAuth integration', 'SSO support', 'SAML', 'LDAP', '2FA', 'MFA', 'biometric auth', 'passwordless login', 'magic links', 'audit logs', 'version history', 'rollback', 'undo/redo', 'bulk operations', 'batch processing', 'CSV import', 'Excel import', 'PDF export', 'JSON export', 'API export', 'data warehouse', 'analytics', 'reporting', 'dashboards', 'custom reports', 'scheduled reports', 'report builder', 'chart types', 'data visualization', 'pivot tables', 'SQL queries', 'advanced search', 'full-text search', 'fuzzy matching', 'regex support', 'saved searches', 'smart folders', 'tags', 'labels', 'categories', 'custom taxonomy', 'hierarchical data', 'nested items', 'relationships', 'dependencies', 'linked records', 'cross-references', 'comments', 'mentions', 'activity feed', 'audit trail', 'change log', 'revision history', 'time tracking', 'billing', 'invoicing', 'payments', 'subscriptions', 'usage metering', 'quota management', 'resource limits', 'rate limiting', 'throttling', 'caching', 'CDN', 'edge computing', 'geo-distribution', 'multi-region', 'high availability', 'disaster recovery', 'backup', 'restore', 'archival', 'data retention', 'GDPR tools', 'privacy controls', 'consent management', 'cookie banner', 'terms acceptance', 'e-signature', 'digital contracts', 'workflow approvals', 'multi-step forms'],
		justification: ['save time', 'improve workflow', 'user experience', 'competitive feature', 'increase productivity', 'reduce errors', 'automate manual work', 'scale operations', 'support growth', 'meet demand', 'customer request', 'team feedback', 'user survey', 'pain point', 'bottleneck', 'inefficiency', 'workaround needed', 'manual process', 'time consuming', 'error prone', 'frustrating', 'confusing', 'difficult to use', 'accessibility issue', 'mobile limitation', 'performance problem', 'security risk', 'compliance gap', 'integration need', 'migration blocker', 'adoption barrier', 'onboarding friction', 'training overhead', 'support burden', 'maintenance cost', 'technical debt', 'legacy system', 'modern standard', 'industry norm', 'best practice', 'user expectation', 'market requirement', 'competitive pressure', 'differentiation', 'value proposition', 'ROI improvement', 'cost savings', 'revenue opportunity', 'market expansion', 'customer retention', 'churn reduction', 'user engagement', 'feature adoption', 'platform stickiness', 'network effects', 'viral growth', 'word of mouth', 'brand reputation', 'market positioning', 'strategic advantage', 'future proofing', 'technology leadership', 'innovation', 'disruption', 'transformation', 'modernization', 'digital evolution']
	},
	authenticityLevel: 0.5,
	specificityLevel: 0.7,
	min: 40,
	max: 254,
	includeMetadata: false
});

const onboardingGen = createTextGenerator({
	style: "feedback",
	tone: "neu",
	formality: "casual",
	keywords: {
		onboarding: ['getting started', 'first impression', 'setup process', 'initial experience', 'signup flow', 'registration', 'account creation', 'verification email', 'email confirmation', 'welcome screen', 'intro tour', 'product tour', 'guided tutorial', 'interactive walkthrough', 'onboarding checklist', 'getting started guide', 'quick start', 'first steps', 'initial setup', 'configuration', 'preferences', 'profile setup', 'team invite', 'workspace creation', 'project setup', 'data import', 'migration wizard', 'sample data', 'demo mode', 'sandbox environment', 'learning resources', 'video tutorials', 'documentation', 'help articles', 'knowledge base', 'FAQs', 'tooltip', 'hint', 'callout', 'banner', 'modal', 'popover', 'empty state', 'placeholder', 'default settings', 'recommended settings', 'best practices', 'common pitfalls', 'troubleshooting', 'support chat', 'help widget', 'customer success', 'onboarding call', 'kickoff meeting', 'training session', 'certification', 'academy', 'learning path', 'course curriculum', 'module completion', 'progress tracking', 'achievement badges', 'skill levels', 'mastery', 'competency', 'proficiency', 'beginner mode', 'advanced mode', 'expert settings', 'power user', 'keyboard ninja', 'productivity tips', 'time savers', 'hidden features', 'pro tips', 'expert advice', 'insider knowledge'],
		products: ['the dashboard', 'onboarding flow', 'tutorial', 'setup wizard', 'welcome screen', 'intro video', 'help center', 'product tour', 'guided setup', 'configuration panel', 'settings page', 'user interface', 'main screen', 'home page', 'getting started page', 'documentation site', 'knowledge base', 'help docs', 'video library', 'training portal', 'academy', 'learning center', 'resource hub', 'community forum', 'support portal', 'chat widget', 'help bot', 'virtual assistant', 'interactive demo', 'sandbox mode', 'playground', 'demo environment', 'test account', 'trial period', 'evaluation', 'proof of concept', 'pilot program', 'beta testing', 'early access', 'preview mode'],
		feelings: ['confused', 'excited', 'overwhelmed', 'impressed', 'frustrated', 'anxious', 'nervous', 'curious', 'interested', 'motivated', 'discouraged', 'intimidated', 'confident', 'uncertain', 'lost', 'stuck', 'struggling', 'learning', 'discovering', 'exploring', 'understanding', 'grasping', 'clicking', 'getting it', 'making progress', 'succeeding', 'accomplishing', 'achieving', 'completing', 'mastering', 'enjoying', 'appreciating', 'loving', 'hating', 'disliking', 'tolerating', 'accepting', 'adapting', 'adjusting', 'transitioning', 'switching', 'migrating', 'upgrading', 'downgrading', 'reconsidering', 'second-guessing', 'doubting', 'questioning', 'wondering', 'hoping', 'wishing', 'expecting', 'anticipating', 'pleased', 'satisfied', 'delighted', 'thrilled', 'amazed', 'surprised', 'shocked', 'disappointed', 'let down', 'underwhelmed', 'oversold', 'misled', 'deceived', 'skeptical', 'suspicious', 'cautious', 'wary', 'hesitant', 'reluctant', 'resistant', 'opposed', 'against', 'for it', 'supportive', 'enthusiastic', 'passionate', 'committed', 'dedicated', 'devoted', 'loyal', 'faithful', 'true believer', 'advocate', 'champion', 'evangelist', 'promoter', 'detractor', 'critic', 'skeptic', 'cynic', 'pessimist', 'optimist', 'realist', 'pragmatist', 'idealist']
	},
	mixedSentiment: true,
	authenticityLevel: 0.6,
	typos: true,
	typoRate: 0.04,
	min: 30,
	max: 254,
	includeMetadata: false
});

// Community Interaction Generators  
const tutorialCommentGen = createTextGenerator({
	style: "forum",
	tone: "pos",
	formality: "casual",
	keywords: {
		tutorial: ['thanks for this', 'helpful tutorial', 'step by step', 'great explanation', 'clear instructions', 'easy to follow', 'well written', 'comprehensive guide', 'detailed walkthrough', 'excellent resource', 'bookmark worthy', 'saved for later', 'sharing with team', 'exactly what I needed', 'perfect timing', 'life saver', 'game changer', 'mind blown', 'aha moment', 'lightbulb moment', 'super helpful', 'very useful', 'extremely valuable', 'highly recommend', 'best tutorial', 'better than official docs', 'clearer than documentation', 'more practical', 'real world example', 'actual use case', 'working code', 'tested this', 'tried it myself', 'works perfectly', 'solved my problem', 'fixed my issue', 'answered my question', 'addressed my concern', 'covered everything', 'nothing missing', 'thorough', 'complete', 'exhaustive', 'definitive guide', 'ultimate resource', 'go-to reference', 'bookmark this', 'pinning this', 'adding to favorites', 'starred on GitHub', 'upvoted', 'shared on Twitter', 'posted in Slack', 'sent to team', 'mandatory reading', 'required material', 'essential knowledge', 'fundamental concepts', 'core principles', 'foundational understanding', 'prerequisite', 'building blocks', 'first principles', 'back to basics', 'fundamentals', 'beginner friendly', 'newbie approved', 'noob friendly', 'accessible', 'approachable', 'welcoming', 'inclusive', 'no gatekeeping', 'no jargon', 'plain English', 'simple terms', 'layman terms', 'ELI5', 'explain like I\'m five', 'dumbed down', 'simplified', 'distilled', 'condensed', 'summarized', 'cliff notes', 'cheat sheet', 'quick reference', 'tldr', 'executive summary'],
		products: ['the docs', 'this guide', 'the video', 'walkthrough', 'tutorial', 'article', 'blog post', 'documentation', 'README', 'wiki page', 'knowledge base', 'help article', 'how-to guide', 'getting started guide', 'quick start', 'reference', 'manual', 'handbook', 'playbook', 'cookbook', 'recipe', 'code example', 'sample code', 'demo project', 'starter template', 'boilerplate', 'repository', 'gist', 'snippet', 'screen recording', 'video tutorial', 'screencast', 'livestream', 'webinar', 'workshop', 'course', 'lesson', 'module', 'chapter', 'section', 'part', 'series', 'playlist', 'collection', 'compilation', 'anthology', 'compendium', 'encyclopedia', 'glossary', 'dictionary', 'index', 'table of contents', 'outline', 'syllabus', 'curriculum', 'learning path', 'roadmap', 'journey', 'progression', 'sequence', 'order', 'steps', 'stages', 'phases', 'milestones', 'checkpoints', 'achievements', 'badges', 'certificates', 'credentials', 'certifications'],
		learning: ['learned something new', 'finally understand', 'makes sense now', 'clicked for me', 'got it', 'understand now', 'see how it works', 'know what to do', 'figured it out', 'solved it', 'working now', 'no longer confused', 'crystal clear', 'perfectly clear', 'totally clear', 'much clearer', 'way easier', 'so simple', 'not as hard', 'easier than expected', 'straightforward', 'simple once you know', 'obvious in hindsight', 'wish I knew earlier', 'should have read this first', 'saved me hours', 'saved me days', 'prevented mistakes', 'avoided pitfalls', 'skipped the frustration', 'bypassed the struggle', 'shortcut to success', 'fast track', 'accelerated learning', 'leveled up', 'skill unlocked', 'knowledge gained', 'expertise acquired', 'mastery achieved', 'competence reached', 'proficiency attained', 'confidence boosted', 'understanding deepened', 'perspective shifted', 'mindset changed', 'paradigm shift', 'mental model', 'conceptual framework', 'theoretical foundation', 'practical application', 'hands-on experience', 'real-world practice', 'applied knowledge', 'transferable skills', 'cross-functional', 'interdisciplinary', 'holistic view', 'big picture', 'systems thinking', 'first principles', 'root cause', 'underlying mechanism', 'how it really works', 'what actually happens', 'behind the scenes', 'under the hood', 'inner workings', 'implementation details', 'nitty gritty', 'nuts and bolts', 'technical specifics', 'edge cases', 'corner cases', 'gotchas', 'pitfalls', 'common mistakes', 'anti-patterns', 'bad practices', 'code smells', 'best practices', 'design patterns', 'architectural patterns', 'industry standards', 'conventions', 'idioms', 'patterns']
	},
	authenticityLevel: 0.5,
	min: 20,
	max: 150,
	includeMetadata: false
});

const webinarChatGen = createTextGenerator({
	style: "chat",
	tone: "neu",
	formality: "casual", 
	keywords: {
		webinar: ['great presentation', 'can you share slides', 'question about', 'thanks for hosting', 'excellent webinar', 'very informative', 'learned a lot', 'appreciate the demo', 'love the examples', 'great use cases', 'real world scenarios', 'practical tips', 'useful insights', 'valuable information', 'recording available', 'will slides be shared', 'where to download', 'follow up questions', 'can you repeat', 'missed that part', 'audio issues', 'can\'t hear', 'screen sharing problem', 'can\'t see slides', 'lag on my end', 'connection issues', 'zoom problems', 'technical difficulties', 'please unmute', 'you\'re on mute', 'can\'t see video', 'camera off', 'share screen', 'next slide please', 'go back one slide', 'zoom in please', 'can\'t read that', 'too small', 'font size', 'contrast issues', 'poll results', 'survey link', 'resource links', 'documentation', 'github repo', 'code examples', 'discount code', 'special offer', 'trial extension', 'contact info', 'sales team', 'support email', 'book a demo', 'schedule call', 'free trial', 'pricing details', 'ROI calculator', 'case studies', 'white papers', 'data sheets', 'product brief', 'comparison chart', 'feature matrix', 'roadmap', 'release notes', 'changelog', 'API docs', 'integration guide', 'migration path', 'implementation timeline', 'onboarding process', 'training program', 'certification', 'partner program', 'reseller info', 'affiliate link', 'referral bonus', 'customer testimonials', 'success stories', 'user reviews', 'analyst reports', 'industry awards', 'press coverage', 'media kit', 'brand assets', 'logo files', 'screenshot library', 'video demos', 'tutorial videos', 'webinar series', 'event calendar', 'office hours', 'community forum', 'user group', 'slack channel', 'discord server'],
		products: ['the demo', 'live demo', 'presentation', 'your product', 'the platform', 'the solution', 'the tool', 'the software', 'the app', 'the service', 'the API', 'the integration', 'the feature', 'the dashboard', 'the interface', 'the system', 'the framework', 'the library', 'the package', 'the plugin', 'the extension', 'your offering', 'the enterprise version', 'the pro plan', 'the premium tier', 'the free trial', 'the starter plan', 'the business plan', 'the implementation', 'the deployment', 'the migration', 'the setup process', 'the onboarding', 'the training', 'the configuration', 'the customization', 'the integration', 'the workflow', 'the automation', 'the template', 'the blueprint', 'the architecture', 'the infrastructure', 'the stack', 'the pipeline', 'the ecosystem', 'the marketplace', 'the app store', 'the plugin directory', 'the integration hub', 'the partner network'],
		chat: ['Q:', 'thanks!', 'link?', '+1', 'same question', 'agreed', 'exactly', 'yes', 'no', 'maybe', 'interesting', 'cool', 'nice', 'awesome', 'great', 'excellent', 'perfect', 'helpful', 'useful', 'good point', 'makes sense', 'I see', 'got it', 'understood', 'noted', 'thanks', 'thank you', 'appreciate it', 'very helpful', 'super useful', 'this is great', 'loving this', 'fantastic', 'amazing', 'brilliant', 'smart', 'clever', 'innovative', 'impressive', 'wow', 'nice!', 'sweet', 'dope', 'fire', '🔥', '👍', '👏', '💯', '❤️', '😍', 'lol', 'lmao', 'haha', 'true', 'facts', 'real', 'relatable', 'same', 'me too', 'also wondering', 'following', 'interested', 'curious about', 'want to know', 'how about', 'what about', 'does it support', 'is there', 'will there be', 'when will', 'any plans for', 'roadmap', 'coming soon', 'ETA', 'timeline', 'pricing', 'cost', 'free tier', 'discount', 'coupon code', 'special offer', 'enterprise pricing', 'volume discount', 'annual vs monthly', 'refund policy', 'trial period', 'cancel anytime', 'no credit card', 'free forever', 'freemium', 'pay as you go', 'usage based', 'seat based', 'per user', 'unlimited', 'limits', 'quotas', 'overage', 'billing', 'invoice', 'receipt', 'payment method', 'credit card', 'paypal', 'wire transfer', 'purchase order', 'ACH', 'international', 'currency', 'VAT', 'tax', 'compliance', 'security', 'SOC2', 'GDPR', 'HIPAA', 'ISO', 'certifications', 'audit', 'penetration test', 'vulnerability scan', 'bug bounty', 'responsible disclosure', 'privacy policy', 'terms of service', 'SLA', 'uptime', 'support', '24/7', 'business hours', 'response time', 'ticket system', 'live chat', 'phone support', 'email support', 'community forum', 'self-service', 'knowledge base', 'documentation', 'tutorials', 'training', 'onboarding', 'implementation', 'professional services', 'consulting', 'custom development', 'white-glove', 'dedicated account manager', 'CSM', 'customer success', 'technical account manager', 'solutions architect', 'integration specialist']
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
	token: "",
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

	batchSize: 2_500_000,
	concurrency: 1,
	writeToDisk: false,

	// ============= Enhanced Events with New API =============
	events: [		
		{
			event: "enterprise_support_ticket",
			weight: 1,
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
			weight: 1,
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
			weight: 1,
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
			weight: 1, // Most frequent event
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
			weight: 1,
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
			weight: 10,
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
			weight: 1,
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
			weight: 1,
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
			weight: 1,
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
			weight: 1,
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
			weight: 1,
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
			weight: 1,
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
			weight: 1,
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
			weight: 1,
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
			weight: 1,
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
		
		// New text types - Comments for charity/fundraiser/wedding sites
		{
			event: "charity_comment_posted",
			weight: 8,
			properties: {
				comment_text: () => charityCommentGen.generateOne(),
				comment_type: ["donation_thanks", "support_message", "congratulations", "encouragement"],
				cause_category: ["medical", "education", "disaster_relief", "animal_welfare", "community"],
				donation_amount: weighNumRange(5, 500, 0.7), // Most small donations
				is_anonymous: [true, false, false], // 33% anonymous
				includes_prayer: [true, false, false, false], // 25% include prayers
				emotional_tone: ["supportive", "inspiring", "grateful", "hopeful"],
				relationship_to_cause: ["friend", "family", "stranger", "community_member"]
			}
		},
		{
			event: "wedding_comment_posted", 
			weight: 6,
			properties: {
				comment_text: () => charityCommentGen.generateOne(), // Reuse same generator
				comment_type: ["congratulations", "well_wishes", "memory_share", "blessing"],
				wedding_phase: ["engagement", "ceremony", "reception", "honeymoon"],
				includes_emoji: [true, true, false], // 67% have emojis
				relationship_to_couple: ["family", "friend", "coworker", "acquaintance"],
				comment_length: weighNumRange(10, 150, 0.6),
				is_public: [true, true, true, false] // 75% public
			}
		},
		{
			event: "social_media_tweet",
			weight: 15,
			properties: {
				tweet_text: () => socialTweetGen.generateOne(),
				tweet_type: ["announcement", "update", "opinion", "question", "share"],
				character_count: weighNumRange(10, 280, 0.4),
				has_hashtags: [true, true, false], // 67% have hashtags
				has_mentions: [true, false, false], // 33% have mentions
				has_media: [true, false, false, false], // 25% have images/videos
				engagement_score: weighNumRange(0, 1000, 0.8), // Most get low engagement
				is_retweet: [true, false, false, false], // 25% are retweets
				time_of_day: ["morning", "afternoon", "evening", "night"],
				device_type: ["mobile", "desktop", "tablet"]
			}
		},
		{
			event: "company_announcement_tweet",
			weight: 3,
			properties: {
				tweet_text: () => socialTweetGen.generateOne(),
				announcement_type: ["product_launch", "milestone", "hiring", "partnership", "event"],
				urgency: ["low", "medium", "high"],
				target_audience: ["customers", "investors", "employees", "general_public"],
				includes_link: [true, true, false], // 67% include links
				is_scheduled: [true, false], // 50% are scheduled posts
				campaign_tag: ["product", "brand", "recruitment", "pr", "organic"],
				expected_reach: weighNumRange(100, 50000, 0.6)
			}
		},
		
		// Batch generation examples for related content
		{
			event: "api_discussion_thread",
			weight: 1,
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
		// --- user hook: classify users by engagement and tier ---
		if (type === "user") {
			record.is_power_user = record.engagement_score > 70;
			record.risk_level = record.last_active_days_ago > 20 ? "high_churn" : "healthy";
			return record;
		}

		// --- event hook: enterprise support tickets get auto-escalated if critical ---
		if (type === "event") {
			if (record.event === "enterprise_support_ticket" && record.priority === "critical") {
				record.escalation_level = Math.min((record.escalation_level || 1) + 1, 3);
				record.auto_escalated = true;
			}
			// bug reports with critical severity get flagged for immediate review
			if (record.event === "bug_report_submitted" && record.severity === "critical" && record.is_reproducible === true) {
				record.requires_immediate_review = true;
				record.estimated_fix_hours = chance.integer({ min: 1, max: 8 });
			}
			return record;
		}

		// --- everything hook: enterprise users get a satisfaction survey event ---
		if (type === "everything" && meta && meta.profile) {
			if (meta.profile.user_tier === "enterprise" && record.length > 5) {
				const lastEvent = record[record.length - 1];
				record.push({
					event: "satisfaction_survey_triggered",
					time: lastEvent.time,
					user_id: lastEvent.user_id,
					product_tier: "enterprise",
					survey_type: "quarterly_nps",
					score: chance.integer({ min: 1, max: 10 })
				});
			}
			return record;
		}

		return record;
	}
};

export default dungeon;