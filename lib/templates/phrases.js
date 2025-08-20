export const STYLE_MODIFIERS = {
	support: {
		prefix: ["Ticket #", "Case: ", "Issue: ", "Help - ", "Support request: ", "Bug report: ", "Feature request: ", "Question: ", ""],
		urgency: ["URGENT: ", "High Priority: ", "Low Priority: ", "FYI: ", "ASAP: ", "Critical: ", "Important: ", ""],
		closing: ["Please help.", "Thanks in advance.", "Any help appreciated.", "Need this resolved ASAP.", "Thanks!", "Help needed.", "Looking forward to a fix.", "Hope this gets sorted.", ""]
	},
	review: {
		rating: ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐", "1/5", "2/5", "3/5", "4/5", "5/5", "Rating: 2/10", "Rating: 7/10"],
		summary: ["Pros:", "Cons:", "Bottom line:", "TL;DR:", "Summary:", "Overall:", "The good:", "The bad:", "My take:", "Quick thoughts:"],
		verified: ["Verified purchase", "Long-time user", "New user", "Switched from competitor", "Been using for months", "First-time buyer", "Regular customer", ""]
	},
	search: {
		fragments: ["how to", "why does", "fix", "error", "tutorial", "guide", "help with", "can't", "won't", "broken", "not working", "stuck on", "issue with", "problem with"],
		operators: ["", "site:docs", "-exclude", '"exact match"', "OR", "AND", ""]
	},
	feedback: {
		channel: ["via email", "from app", "in-product", "survey response", "feedback form", "user testing", "beta feedback", ""],
		nps: ["NPS: 0-6", "NPS: 7-8", "NPS: 9-10", "Would not recommend", "Might recommend", "Definitely recommend"]
	},
	chat: {
		greeting: ["hey", "hi", "hello", "yo", "sup", "hey there", "hiya", "what's up", ""],
		emotion: ["😊", "😕", "😡", "🤔", "👍", "👎", "💔", "🎉", "😤", "🙄", "😅", "🤷", "💯", "🔥", ""]
	},
	// New natural speech patterns
	speech_patterns: {
		filler_words: ["um", "uh", "like", "you know", "I mean", "so", "well", "basically", "actually", "literally"],
		interjections: ["oh", "ah", "hmm", "wow", "geez", "man", "dude", "ugh", "meh", "yep", "nope", "sure"],
		emphasis: ["really", "super", "totally", "absolutely", "definitely", "seriously", "honestly", "genuinely", "completely"],
		qualifiers: ["kinda", "sorta", "pretty much", "mostly", "somewhat", "fairly", "quite", "rather", "a bit"],
		conversational_starters: ["So yeah", "Anyway", "Oh btw", "Quick question", "Real quick", "Just wondering", "One thing though"]
	}
};

export const INTENSITY_MODIFIERS = {
	low: {
		amplifiers: ["a bit", "somewhat", "slightly", "kinda", "sort of", "relatively", "fairly", "mildly", "a little", "not too"],
		hedges: ["I guess", "maybe", "perhaps", "possibly", "I suppose", "might be", "could be", "seems like", "probably"],
		expressions: ["it's okay", "not bad", "decent enough", "could be worse", "works for now", "manageable", "tolerable"]
	},
	medium: {
		amplifiers: ["really", "quite", "very", "definitely", "certainly", "clearly", "obviously", "pretty", "rather", "significantly"],
		hedges: ["I think", "I believe", "it seems", "apparently", "evidently", "looks like", "appears to be", "from what I can tell"],
		expressions: ["it's solid", "works well", "does the job", "pretty good", "on the right track", "heading in the right direction"]
	},
	high: {
		amplifiers: ["absolutely", "completely", "totally", "utterly", "extremely", "incredibly", "unbelievably", "ridiculously", "insanely", "crazy"],
		hedges: ["without a doubt", "unquestionably", "undeniably", "100%", "no question", "for sure", "hands down", "no doubt about it"],
		expressions: ["blown away", "game changer", "mind-blowing", "off the charts", "next level", "phenomenal", "revolutionary"]
	}
};

export const FORMALITY_MODIFIERS = {
	casual: {
		contractions: true,
		slang: ["gonna", "wanna", "gotta", "dunno", "ain't", "y'all", "lol", "tbh", "imo", "fwiw", "ngl", "fr", "bet", "lowkey", "highkey", "sus", "cap", "no cap", "salty", "based", "cringe", "slaps", "hits different", "it's giving", "periodt", "say less", "that's rough buddy", "big mood", "vibes", "sending me"],
		punctuation: ["...", "!!", "???", "!?", "-", "—", "~"],
		intensifiers: ["super", "hella", "mad", "crazy", "sick", "dope", "lit", "fire", "solid"],
		connectors: ["and yeah", "but like", "so basically", "anyway", "whatever", "or something", "idk"]
	},
	business: {
		contractions: false,
		titles: ["Mr.", "Ms.", "Dr.", "Prof.", "Director", "Manager", "VP"],
		closings: ["Best regards,", "Sincerely,", "Thank you,", "Regards,", "Kind regards,", "Respectfully,"],
		punctuation: [".", ",", ";", ":"],
		phrases: ["I appreciate", "I would like to", "Please consider", "I am writing to", "Thank you for your time"]
	},
	technical: {
		contractions: false,
		jargon: ["API", "UI/UX", "backend", "frontend", "stack", "pipeline", "workflow", "integration", "deployment", "infrastructure", "scalability", "architecture"],
		precision: ["specifically", "precisely", "exactly", "technically", "functionally", "programmatically", "systematically"],
		punctuation: [".", ",", ";", ":", "()", "[]"],
		qualifiers: ["according to the specs", "based on the documentation", "per the requirements", "as implemented", "by design"]
	}
};

export const USER_PERSONAS = [
	{ 
		role: "developer", 
		experience: ["junior", "senior", "lead", "staff", "principal"], 
		domain: ["frontend", "backend", "fullstack", "devops", "mobile", "data"],
		speech_patterns: ["code-heavy", "solution-focused", "detail-oriented", "efficiency-minded"],
		common_phrases: ["edge case", "tech debt", "refactor", "optimization", "debugging", "implementation", "race condition", "memory leak", "null pointer", "stack overflow", "buffer overflow", "code smell", "spaghetti code", "rubber ducking", "bikeshedding", "yak shaving", "breaking changes", "backwards compatibility", "semantic versioning", "feature flag", "hotfix", "rollback", "A/B testing", "canary deployment"]
	},
	{ 
		role: "designer", 
		experience: ["UX", "UI", "product", "visual", "interaction"], 
		domain: ["web", "mobile", "enterprise", "startup"],
		speech_patterns: ["user-centered", "aesthetic-focused", "empathetic", "iteration-minded"],
		common_phrases: ["user journey", "design system", "accessibility", "usability", "wireframe", "prototype", "user persona", "information architecture", "visual hierarchy", "color contrast", "typography scale", "white space", "cognitive load", "friction points", "conversion funnel", "heatmap analysis", "click-through rate", "bounce rate", "user flow", "design tokens", "component library", "style guide", "brand guidelines", "responsive breakpoints"]
	},
	{ 
		role: "manager", 
		experience: ["project", "product", "engineering", "team lead"], 
		domain: ["startup", "enterprise", "agency", "consulting"],
		speech_patterns: ["big-picture", "process-focused", "diplomatic", "results-oriented"],
		common_phrases: ["roadmap", "stakeholder", "deliverable", "milestone", "resource", "alignment", "scope creep", "MVP", "user story", "acceptance criteria", "sprint planning", "backlog grooming", "velocity tracking", "burn down chart", "retrospective", "post-mortem", "risk mitigation", "dependency mapping", "critical path", "resource allocation", "budget constraints", "timeline compression", "go-to-market strategy", "competitive analysis"]
	},
	{ 
		role: "analyst", 
		experience: ["business", "data", "QA", "research"], 
		domain: ["finance", "marketing", "operations", "strategy"],
		speech_patterns: ["data-driven", "analytical", "methodical", "evidence-based"],
		common_phrases: ["metrics", "KPI", "benchmark", "correlation", "trend", "insight", "conversion rate", "churn analysis", "cohort study", "funnel analysis", "attribution modeling", "statistical significance", "confidence interval", "p-value", "A/B test results", "regression analysis", "time series data", "outlier detection", "data quality", "sample bias", "false positive", "predictive model", "machine learning", "data pipeline"]
	},
	{ 
		role: "admin", 
		experience: ["system", "database", "network", "security"], 
		domain: ["cloud", "on-prem", "hybrid", "infrastructure"],
		speech_patterns: ["security-conscious", "reliability-focused", "risk-aware", "systematic"],
		common_phrases: ["uptime", "backup", "security", "compliance", "monitoring", "incident", "disaster recovery", "failover", "load balancing", "auto-scaling", "security patch", "vulnerability scan", "penetration test", "SSL certificate", "firewall rules", "access logs", "audit trail", "GDPR compliance", "SOC 2", "ISO 27001", "threat detection", "incident response", "change management", "configuration drift"]
	},
	{ 
		role: "user", 
		experience: ["power", "casual", "new", "expert"], 
		domain: ["personal", "business", "education", "nonprofit"],
		speech_patterns: ["outcome-focused", "practical", "time-conscious", "value-seeking"],
		common_phrases: ["workflow", "productivity", "time-saving", "user-friendly", "intuitive", "helpful", "muscle memory", "keyboard shortcuts", "batch processing", "automation", "template library", "quick actions", "smart defaults", "one-click solution", "seamless integration", "contextual help", "progressive disclosure", "guided tour", "power user features", "accessibility options", "mobile-first", "offline capability", "real-time sync", "version history"]
	}
];

// Additional natural language elements
export const DISCOURSE_MARKERS = {
	opinion: ["I think", "In my opinion", "Personally", "From my perspective", "It seems to me", "I feel like", "My take is"],
	agreement: ["Exactly", "Totally agree", "Same here", "Couldn't agree more", "You're right", "That's true", "Fair point"],
	disagreement: ["I disagree", "Not really", "I don't think so", "Actually", "On the contrary", "I beg to differ", "That's not quite right"],
	uncertainty: ["I'm not sure", "Hard to say", "Could go either way", "Jury's still out", "Remains to be seen", "Time will tell"],
	frustration: ["Ugh", "Come on", "Seriously?", "Are you kidding me?", "This is ridiculous", "I can't even", "What the heck", "For real?", "Not again", "Why is this so hard?", "This makes no sense", "I'm about to lose it", "What is happening", "This is broken", "Why me?"],
	excitement: ["OMG", "Wow", "Amazing", "Incredible", "No way", "That's awesome", "So cool", "Love it", "This is sick!", "Finally!", "Yes!", "Boom!", "Nailed it!", "Let's go!", "This slaps", "Chef's kiss", "Perfection", "Exactly what I needed"]
};

// Common typo patterns
export const TYPO_PATTERNS = [
	{ pattern: /ing\b/g, replacements: ["ign", "ing", "in"] },
	{ pattern: /the\b/g, replacements: ["teh", "th", "hte"] },
	{ pattern: /tion\b/g, replacements: ["toin", "tion", "iton"] },
	{ pattern: /([a-z])\1/g, replacements: ["$1", "$1$1$1"] }, // double letters
	{ pattern: /\s([,.!?])/g, replacements: ["$1", " $1"] }, // spacing around punctuation
	// More realistic typos
	{ pattern: /your\b/g, replacements: ["you're", "youre", "ur"] },
	{ pattern: /there\b/g, replacements: ["their", "they're", "thier"] },
	{ pattern: /receive\b/g, replacements: ["recieve", "recive"] },
	{ pattern: /definitely\b/g, replacements: ["definately", "defiantly"] },
	{ pattern: /separate\b/g, replacements: ["seperate", "seprate"] }
];

/** @type {Record<string,string[]>} */
export const PHRASE_BANK = {
	// Core nouns/subjects
	product: [
		"the new dashboard", "this release", "the latest build", "the mobile app",
		"the reporting view", "the onboarding flow", "the editor", "the timeline",
		"the search experience", "the alerts panel", "the review screen", "the export tool",
		"the analytics suite", "the admin console", "the workspace", "the platform",
		"the integration layer", "the API endpoints", "the documentation site", "the help center",
		"the billing portal", "the settings page", "the profile section", "the collaboration tools",
		"the data viewer", "the import wizard", "the scheduling system", "the workflow builder",
		"the notification center", "the team hub", "the project view", "the calendar interface",
		"the chat feature", "the file manager", "the template library", "the resource center",
		"the automation engine", "the monitoring dashboard", "the security settings", "the backup system",
		"the migration tool", "the testing environment", "the deployment pipeline", "the version control",
		"the tagging system", "the search filters", "the bulk editor", "the preview mode",
		"the custom fields", "the reporting engine", "the audit logs", "the permission system",
		"the theme customizer", "the widget library", "the form builder", "the email templates",
		"the knowledge base", "the ticket system", "the feedback portal", "the user directory",
		// More conversational/natural references
		"this thing", "the app", "the site", "the tool", "the system", "the interface", "the whole setup",
		"everything", "the experience", "what we're using", "the current version", "this update",
		"the latest changes", "what they built", "the new stuff", "the redesign", "the refresh",
		"the product", "the solution", "the software", "the service", "the framework",
		"our setup", "our implementation", "our config", "our instance", "our environment",
		// Oddly specific interface references
		"the left sidebar", "the top navigation", "the footer links", "the hamburger menu", "the breadcrumbs",
		"the status bar", "the progress indicator", "the loading spinner", "the error toast", "the confirmation modal",
		"the three-dot menu", "the gear icon", "the save button", "the cancel link", "the submit form",
		"the dropdown arrow", "the checkbox list", "the radio buttons", "the slider control", "the toggle switch",
		"the search box", "the filter panel", "the sort dropdown", "the pagination controls", "the table headers",
		"the row actions", "the bulk selection", "the context menu", "the right-click options", "the keyboard shortcuts"
	],
	
	feature: [
		"search", "exports", "notifications", "sync", "shortcuts", "performance", "filters",
		"bulk actions", "dashboards", "comments", "sharing", "access control", "offline mode",
		"auto-save", "version history", "drag and drop", "keyboard navigation", "dark mode",
		"real-time updates", "API access", "webhooks", "custom fields", "templates", "integrations",
		"data validation", "batch processing", "scheduled reports", "user permissions", "audit trails",
		"two-factor auth", "SSO", "data encryption", "backup and restore", "import/export",
		"multi-language support", "timezone handling", "mobile sync", "push notifications", "email alerts",
		"custom workflows", "automation rules", "conditional logic", "formula fields", "calculated metrics",
		"role-based access", "team collaboration", "activity feeds", "change tracking", "revision history",
		"smart search", "advanced filtering", "saved views", "custom dashboards", "data visualization",
		"file attachments", "inline editing", "bulk updates", "quick actions", "context menus",
		"undo/redo", "autofill", "spell check", "rich text editing", "markdown support",
		"code highlighting", "image uploads", "video embedding", "link previews", "mentions",
		"hashtags", "bookmarks", "favorites", "pinned items", "archived content",
		"recurring tasks", "dependencies", "milestones", "gantt charts", "kanban boards",
		"time tracking", "resource planning", "capacity management", "forecasting", "analytics",
		// More natural feature references
		"the login stuff", "file handling", "data sync", "the UI", "loading times", "responsiveness",
		"the flows", "navigation", "the buttons", "layout", "spacing", "colors", "fonts",
		"error handling", "validation", "the forms", "input fields", "dropdowns", "modals",
		"tooltips", "help text", "onboarding", "tutorials", "documentation", "support",
		"speed", "reliability", "uptime", "stability", "consistency", "accuracy",
		// Oddly specific feature references
		"autocomplete suggestions", "fuzzy search matching", "infinite scroll", "lazy loading", "image compression",
		"rate limiting", "cache invalidation", "session timeout", "password strength meter", "CAPTCHA verification",
		"CSV import validation", "PDF generation", "email bounce handling", "webhook retries", "API throttling",
		"browser compatibility", "mobile viewport", "touch gestures", "keyboard accessibility", "screen reader support",
		"timezone conversion", "currency formatting", "date picker localization", "file size limits", "upload progress",
		"preview thumbnails", "batch operations", "undo/redo history", "clipboard integration", "drag-and-drop zones"
	],
	
	team: [
		"the team", "the folks behind it", "the devs", "support", "the product crew", "engineering",
		"the designers", "the PMs", "the founders", "the company", "customer success", "the QA team",
		"the leadership", "the backend team", "the frontend folks", "the data team", "the ops crew",
		"the UX researchers", "the content team", "the marketing folks", "the sales team", "the architects",
		"the consultants", "the community managers", "the documentation writers", "the security team",
		"the infrastructure team", "the mobile developers", "the platform engineers", "the growth team",
		"the analytics team", "the partnership team", "the legal department", "the finance team",
		"the HR folks", "the interns", "the contractors", "the remote team", "the core contributors",
		"the beta testers", "the advisory board", "the stakeholders", "the product owners", "the scrum masters",
		"the release managers", "the DevOps engineers", "the database administrators", "the system admins"
	],
	
	hedge: [
		"to be fair", "in all honesty", "from what I've seen so far", "after a full week",
		"as a quick note", "for context", "speaking candidly", "after kicking the tires",
		"based on real usage", "from a day-to-day view", "in my experience", "from our perspective",
		"given the circumstances", "all things considered", "to put it mildly", "if I'm being honest",
		"after extensive testing", "having used it daily", "from a practical standpoint", "in practice",
		"looking at the big picture", "diving deeper", "on closer inspection", "at first glance",
		"after the honeymoon phase", "with fresh eyes", "coming from a different tool", "as someone who",
		"having seen competitors", "for what it's worth", "to give credit where due", "objectively speaking",
		"setting aside preferences", "putting bias aside", "from a user standpoint", "technically speaking",
		"functionally", "aesthetically", "ergonomically", "strategically", "operationally", "realistically",
		"pragmatically", "comparatively", "relatively speaking", "contextually", "historically", "traditionally",
		"conventionally", "surprisingly enough", "interestingly", "curiously", "notably", "importantly",
		"significantly", "meaningfully", "substantively", "fundamentally", "essentially", "basically",
		"simply put", "in simple terms", "bottom line", "net-net", "at the end of the day",
		// More casual/natural hedges
		"look", "listen", "here's the thing", "real talk", "not gonna lie", "tbh", "honestly",
		"I mean", "like", "you know", "so", "well", "anyway", "whatever", "I guess",
		"maybe it's just me but", "could be wrong but", "might be crazy but", "don't quote me but",
		"from where I sit", "in my book", "personally", "IMHO", "just saying", "my two cents",
		"take it or leave it", "for better or worse", "love it or hate it", "call me old-fashioned but"
	],
	
	connector: [
		"and", "but", "so", "plus", "honestly", "overall", "that said", "meanwhile",
		"however", "although", "while", "yet", "still", "nonetheless", "nevertheless", "furthermore",
		"moreover", "additionally", "besides", "also", "likewise", "similarly", "conversely", "alternatively",
		"on the flip side", "on the other hand", "in contrast", "by comparison", "equally", "simultaneously",
		"incidentally", "coincidentally", "subsequently", "consequently", "therefore", "thus", "hence",
		"accordingly", "as a result", "for instance", "for example", "specifically", "particularly",
		"especially", "notably", "surprisingly", "unexpectedly", "predictably", "unsurprisingly", "ironically",
		"paradoxically", "counterintuitively", "logically", "naturally", "obviously", "clearly", "evidently",
		"apparently", "seemingly", "ostensibly", "presumably", "supposedly", "allegedly", "reportedly",
		"admittedly", "granted", "sure", "okay", "fine", "look", "listen", "see",
		// More natural speech connectors
		"but yeah", "so anyway", "oh and", "also though", "but then again", "having said that",
		"that being said", "at the same time", "on top of that", "not to mention", "what's more",
		"speaking of which", "funny thing is", "weird thing is", "strange thing is", "thing is though",
		"problem is", "issue is", "catch is", "downside is", "upside is", "good news is", "bad news is",
		"plot twist", "turns out", "go figure", "who knew", "believe it or not", "would you believe"
	],
	
	time: [
		"today", "this morning", "over the weekend", "lately", "all week", "just now", "recently",
		"yesterday", "last night", "this afternoon", "this evening", "earlier", "a moment ago", "right now",
		"currently", "presently", "at the moment", "these days", "nowadays", "this month", "this quarter",
		"this year", "last week", "last month", "last quarter", "last year", "a while back", "previously",
		"formerly", "originally", "initially", "at first", "in the beginning", "from the start", "from day one",
		"since launch", "since the update", "post-migration", "pre-launch", "during beta", "in production",
		"in testing", "in development", "in staging", "after deployment", "before the rollout", "mid-sprint",
		"end of sprint", "start of quarter", "fiscal year-end", "during onboarding", "post-onboarding",
		"during training", "after training", "in the pilot", "during the trial", "after the trial",
		"continuously", "consistently", "periodically", "occasionally", "frequently", "rarely", "always",
		"never", "sometimes", "often", "seldom", "habitually", "routinely", "regularly", "intermittently",
		// Oddly specific time references
		"during the 3pm deploy", "over lunch break", "between meetings", "on my commute", "while multitasking",
		"during the all-hands", "in the Slack thread", "on the client call", "during the demo", "in the retrospective",
		"after the standup", "before the deadline", "during crunch time", "on Black Friday", "during the outage",
		"when the servers were down", "during maintenance window", "on mobile data", "with spotty wifi",
		"while traveling", "from the coffee shop", "on the train", "from my phone", "late at night",
		"early morning", "first thing Monday", "end of day Friday", "over the holiday", "during vacation"
	],
	
	adverb: [
		"surprisingly", "genuinely", "frankly", "remarkably", "mostly", "honestly", "consistently", "noticeably",
		"absolutely", "completely", "entirely", "totally", "utterly", "thoroughly", "perfectly", "precisely",
		"exactly", "specifically", "particularly", "especially", "exceptionally", "extraordinarily", "incredibly",
		"amazingly", "astonishingly", "wonderfully", "beautifully", "elegantly", "gracefully", "smoothly",
		"seamlessly", "effortlessly", "painlessly", "naturally", "intuitively", "logically", "systematically",
		"methodically", "carefully", "thoughtfully", "deliberately", "intentionally", "purposefully", "strategically",
		"tactically", "practically", "realistically", "theoretically", "hypothetically", "potentially", "possibly",
		"probably", "definitely", "certainly", "undoubtedly", "unquestionably", "indisputably", "arguably",
		"debatably", "questionably", "dubiously", "suspiciously", "mysteriously", "inexplicably", "oddly",
		"strangely", "weirdly", "bizarrely", "unusually", "uncommonly", "rarely", "seldom", "hardly",
		"barely", "scarcely", "slightly", "somewhat", "moderately", "reasonably", "fairly", "quite",
		"rather", "pretty", "very", "extremely", "immensely", "tremendously", "enormously", "massively"
	],

	// Positive vocabulary
	adj_pos: [
		"smooth", "thoughtful", "delightful", "fast", "intuitive", "reliable", "helpful", "polished",
		"snappy", "clear", "well-organized", "predictable", "solid", "responsive", "refined",
		"elegant", "sophisticated", "streamlined", "efficient", "effective", "powerful", "robust", "stable",
		"secure", "scalable", "flexible", "versatile", "adaptable", "customizable", "configurable", "extensible",
		"modular", "composable", "reusable", "maintainable", "testable", "debuggable", "observable", "monitorable",
		"performant", "optimized", "lightweight", "lean", "clean", "tidy", "organized", "structured",
		"coherent", "consistent", "uniform", "harmonious", "balanced", "proportioned", "aligned", "centered",
		"accessible", "inclusive", "accommodating", "welcoming", "friendly", "approachable", "inviting", "engaging",
		"compelling", "captivating", "immersive", "interactive", "dynamic", "animated", "lively", "vibrant",
		"colorful", "beautiful", "gorgeous", "stunning", "striking", "impressive", "remarkable", "exceptional",
		"outstanding", "excellent", "superb", "magnificent", "brilliant", "fantastic", "wonderful", "amazing",
		"awesome", "incredible", "extraordinary", "phenomenal", "spectacular", "marvelous", "fabulous", "terrific",
		"great", "good", "nice", "pleasant", "enjoyable", "satisfying", "fulfilling", "rewarding",
		"valuable", "useful", "practical", "functional", "operational", "workable", "feasible", "viable",
		"sustainable", "durable", "lasting", "enduring", "permanent", "timeless", "classic", "modern",
		"contemporary", "cutting-edge", "innovative", "revolutionary", "groundbreaking", "pioneering", "visionary"
	],
	
	verb_pos: [
		"nailed it", "made it easier", "saved me time", "exceeded expectations", "cleaned things up",
		"just works", "reduced friction", "hit the mark", "streamlined the workflow", "cut the noise",
		"handled edge cases well", "delivered on promises", "improved productivity", "enhanced usability",
		"simplified complexity", "eliminated confusion", "removed barriers", "lowered the learning curve",
		"accelerated development", "boosted efficiency", "increased velocity", "improved collaboration",
		"strengthened security", "enhanced performance", "optimized resources", "maximized value",
		"minimized effort", "automated tedium", "solved pain points", "addressed concerns", "fixed issues",
		"resolved problems", "answered questions", "clarified ambiguity", "provided clarity", "offered flexibility",
		"enabled customization", "empowered users", "facilitated workflows", "supported growth", "scaled beautifully",
		"adapted gracefully", "evolved thoughtfully", "matured nicely", "progressed steadily", "advanced significantly",
		"transformed operations", "revolutionized processes", "modernized infrastructure", "upgraded capabilities",
		"elevated standards", "raised the bar", "set new benchmarks", "broke new ground", "pushed boundaries",
		"exceeded limits", "surpassed competitors", "outperformed alternatives", "dominated the space",
		"won me over", "earned my respect", "gained my trust", "proved its worth", "demonstrated value",
		"showed potential", "revealed possibilities", "unlocked opportunities", "opened doors", "created pathways",
		"built bridges", "connected dots", "closed gaps", "filled voids", "met needs", "satisfied requirements",
		"fulfilled expectations", "delivered results", "achieved goals", "realized vision", "executed flawlessly",
		"performed admirably", "functioned perfectly", "operated smoothly", "ran efficiently", "worked seamlessly"
	],
	
	react_pos: [
		"I'm excited to keep using it", "this made my day", "I'd recommend it to my team",
		"it's a breath of fresh air", "it earned my trust", "I can move faster now",
		"it fits into our process nicely", "I'm genuinely impressed", "this changes everything for us",
		"I wish I'd found this sooner", "it's exactly what we needed", "I'm spreading the word",
		"my team loves it", "it's become indispensable", "I can't imagine working without it",
		"it's a game-changer", "it's transformed how we work", "productivity is through the roof",
		"it paid for itself already", "ROI is obvious", "the value is undeniable", "worth every penny",
		"best investment we've made", "it's saving us hours daily", "efficiency gains are real",
		"adoption was instant", "everyone picked it up quickly", "training was unnecessary",
		"it just clicked", "intuitive from day one", "zero learning curve", "onboarding was a breeze",
		"migration was painless", "transition was smooth", "setup was trivial", "configuration was simple",
		"it integrated perfectly", "works great with our stack", "plays nice with everything",
		"no compatibility issues", "scales with our needs", "grows with us", "future-proof solution",
		"confident in the roadmap", "excited about what's coming", "looking forward to updates",
		"each release gets better", "continuous improvements", "they listen to feedback", "responsive to requests",
		"support is fantastic", "documentation is thorough", "examples are helpful", "tutorials are clear",
		"community is active", "ecosystem is thriving", "plugins are abundant", "extensions are useful",
		"customization is powerful", "flexibility is appreciated", "options are thoughtful", "defaults are sensible",
		"it respects our workflow", "doesn't get in the way", "enhances what we do", "amplifies our efforts"
	],
	
	obs_pos: [
		"#product.capitalize# feels #adj_pos#",
		"#team# #verb_pos#",
		"the #feature# upgrade is #adj_pos#",
		"setup was #adj_pos# and quick",
		"navigation is #adj_pos# and consistent",
		"defaults are #adj_pos#, which helps new users",
		"the UI is #adj_pos# and #adj_pos#",
		"performance has been #adverb# #adj_pos#",
		"stability is #adj_pos# across all environments",
		"the architecture is #adj_pos# and well-thought-out",
		"error handling is #adj_pos# and informative",
		"the feedback loops are #adj_pos# and actionable",
		"data presentation is #adj_pos# and insightful",
		"the mobile experience is #adj_pos# and responsive",
		"cross-platform support is #adj_pos#",
		"the API design is #adj_pos# and developer-friendly",
		"documentation quality is #adj_pos#",
		"the onboarding process is #adj_pos# and welcoming",
		"customer support has been #adj_pos#",
		"the pricing model is #adj_pos# and transparent",
		"security measures are #adj_pos# and comprehensive",
		"the update process is #adj_pos# and non-disruptive",
		"backwards compatibility is #adj_pos#",
		"the plugin ecosystem is #adj_pos# and growing",
		"third-party integrations are #adj_pos#",
		"the #feature# implementation is #adj_pos#",
		"#team# has been #adverb# #adj_pos# to work with",
		"response times are #adj_pos#",
		"the learning resources are #adj_pos#",
		"community engagement is #adj_pos#"
	],

	// Negative vocabulary
	adj_neg: [
		"clunky", "inconsistent", "slow", "confusing", "unpolished", "buggy", "frustrating",
		"laggy", "brittle", "noisy", "overcomplicated", "obscure", "rough", "awkward",
		"broken", "unreliable", "unstable", "unpredictable", "erratic", "flaky", "fragile", "delicate",
		"problematic", "troublesome", "difficult", "challenging", "complex", "convoluted", "intricate", "labyrinthine",
		"opaque", "unclear", "ambiguous", "vague", "misleading", "deceptive", "dishonest", "untrustworthy",
		"insecure", "vulnerable", "exposed", "risky", "dangerous", "harmful", "destructive", "damaging",
		"inefficient", "ineffective", "unproductive", "wasteful", "redundant", "repetitive", "tedious", "monotonous",
		"boring", "dull", "bland", "uninspiring", "unimaginative", "uncreative", "derivative", "generic",
		"outdated", "obsolete", "antiquated", "archaic", "legacy", "deprecated", "abandoned", "neglected",
		"unmaintained", "unsupported", "undocumented", "unexplained", "mysterious", "cryptic", "enigmatic", "puzzling",
		"inaccessible", "exclusive", "discriminatory", "biased", "unfair", "unjust", "unethical", "immoral",
		"ugly", "hideous", "unsightly", "unattractive", "repulsive", "offensive", "distasteful", "unpleasant",
		"uncomfortable", "painful", "agonizing", "excruciating", "torturous", "unbearable", "intolerable", "unacceptable",
		"inadequate", "insufficient", "incomplete", "partial", "limited", "restricted", "constrained", "confined",
		"inflexible", "rigid", "stiff", "unyielding", "stubborn", "obstinate", "uncooperative", "hostile",
		"aggressive", "confrontational", "combative", "antagonistic", "adversarial", "contentious", "controversial", "divisive",
		"chaotic", "disorganized", "messy", "cluttered", "scattered", "fragmented", "disjointed", "disconnected",
		"illogical", "irrational", "nonsensical", "absurd", "ridiculous", "laughable", "pathetic", "pitiful"
	],
	
	verb_neg: [
		"missed the mark", "made basic tasks harder", "introduced friction", "wasted time",
		"got in the way", "fell apart under load", "buried key actions", "added guesswork",
		"slowed the team down", "broke existing workflows", "created more problems", "complicated everything",
		"confused users", "frustrated everyone", "alienated customers", "lost our trust", "damaged reputation",
		"corrupted data", "lost information", "leaked memory", "crashed repeatedly", "froze constantly",
		"failed silently", "errored cryptically", "timed out frequently", "disconnected randomly", "synced incorrectly",
		"duplicated efforts", "created silos", "blocked progress", "halted development", "stalled projects",
		"increased costs", "blew the budget", "missed deadlines", "delayed launches", "postponed releases",
		"required workarounds", "necessitated hacks", "forced compromises", "demanded sacrifices", "imposed limitations",
		"restricted options", "removed features", "eliminated functionality", "reduced capabilities", "diminished value",
		"degraded performance", "impaired usability", "hindered adoption", "prevented scaling", "blocked growth",
		"discouraged usage", "repelled users", "drove people away", "caused abandonment", "triggered churn",
		"generated complaints", "spawned tickets", "created backlash", "provoked anger", "inspired frustration",
		"worsened experience", "deteriorated quality", "regressed functionality", "devolved features", "backtracked progress",
		"undermined confidence", "eroded trust", "destroyed credibility", "ruined reputation", "tarnished image",
		"squandered potential", "wasted opportunity", "missed chances", "lost momentum", "killed enthusiasm",
		"drained energy", "exhausted patience", "tested limits", "pushed boundaries", "crossed lines",
		"violated expectations", "betrayed promises", "failed commitments", "abandoned users", "neglected needs",
		"ignored feedback", "dismissed concerns", "overlooked issues", "minimized problems", "downplayed severity",
		"complicated setup", "obscured options", "hidden features", "buried settings", "cluttered interface"
	],
	
	react_neg: [
		"I'm switching back for now", "this killed my momentum", "I can't justify using it yet",
		"I'm pretty disappointed", "it makes me hesitate", "I'll wait for fixes",
		"we're looking at alternatives", "considering other options", "shopping around again",
		"regretting the purchase", "feeling buyer's remorse", "wish we'd chosen differently",
		"can't recommend this", "warning others away", "telling people to avoid it",
		"filing for a refund", "canceling our subscription", "not renewing the contract",
		"escalating to management", "bringing in legal", "considering litigation",
		"it's hurting productivity", "costing us money", "damaging our operations",
		"clients are complaining", "users are leaving", "adoption is failing",
		"the team is frustrated", "morale is suffering", "people are angry",
		"trust is broken", "confidence is shattered", "faith is lost",
		"this is unacceptable", "it's not working out", "we made a mistake",
		"back to square one", "starting over again", "wasted months on this",
		"what were we thinking", "how did this ship", "who approved this",
		"it's getting worse", "each update breaks more", "regression after regression",
		"support is useless", "documentation is wrong", "examples don't work",
		"promises were broken", "roadmap is fiction", "timeline is fantasy",
		"communication is terrible", "transparency is lacking", "accountability is absent",
		"this needs a complete rebuild", "throw it away and start over", "fundamentally flawed",
		"architecturally unsound", "technically bankrupt", "design is broken",
		"I'm exhausted by this", "tired of the issues", "worn out from problems",
		"giving up on this", "throwing in the towel", "calling it quits"
	],
	
	obs_neg: [
		"#product.capitalize# feels #adj_neg#",
		"#team# #verb_neg#",
		"the #feature# change is #adj_neg#",
		"setup was #adj_neg# and slow",
		"navigation is #adj_neg# in common flows",
		"defaults are #adj_neg#, which creates rework",
		"the UI is #adj_neg# and #adj_neg#",
		"performance has been #adverb# #adj_neg#",
		"stability is #adj_neg# across environments",
		"the architecture seems #adj_neg# and poorly planned",
		"error handling is #adj_neg# and unhelpful",
		"the feedback loops are #adj_neg# and confusing",
		"data presentation is #adj_neg# and misleading",
		"the mobile experience is #adj_neg# and broken",
		"cross-platform support is #adj_neg#",
		"the API design is #adj_neg# and developer-hostile",
		"documentation quality is #adj_neg#",
		"the onboarding process is #adj_neg# and overwhelming",
		"customer support has been #adj_neg#",
		"the pricing model is #adj_neg# and deceptive",
		"security measures are #adj_neg# and concerning",
		"the update process is #adj_neg# and disruptive",
		"backwards compatibility is #adj_neg#",
		"the plugin ecosystem is #adj_neg# and dying",
		"third-party integrations are #adj_neg#",
		"the #feature# implementation is #adj_neg#",
		"#team# has been #adverb# #adj_neg# to work with",
		"response times are #adj_neg#",
		"the learning resources are #adj_neg#",
		"community engagement is #adj_neg#"
	],

	// Neutral vocabulary
	adj_neu: [
		"usable", "mixed", "mostly fine", "serviceable", "okay", "ordinary", "workable", "middling",
		"passable", "basic", "expected", "unremarkable", "balanced", "steady",
		"adequate", "sufficient", "acceptable", "tolerable", "moderate", "average", "standard", "typical",
		"normal", "regular", "common", "conventional", "traditional", "familiar", "recognizable", "predictable",
		"stable", "consistent", "uniform", "standardized", "normalized", "regularized", "homogenized", "sanitized",
		"neutral", "impartial", "unbiased", "objective", "factual", "straightforward", "direct", "plain",
		"simple", "basic", "fundamental", "elementary", "primary", "essential", "minimal", "bare",
		"functional", "operational", "working", "running", "active", "live", "online", "available",
		"accessible", "reachable", "obtainable", "achievable", "attainable", "feasible", "possible", "doable",
		"manageable", "handleable", "controllable", "maintainable", "sustainable", "viable", "practical", "pragmatic",
		"realistic", "reasonable", "rational", "logical", "sensible", "sound", "valid", "legitimate",
		"acceptable", "permissible", "allowable", "admissible", "passable", "satisfactory", "competent", "capable",
		"proficient", "qualified", "skilled", "experienced", "trained", "educated", "knowledgeable", "informed",
		"aware", "conscious", "mindful", "attentive", "observant", "watchful", "vigilant", "alert",
		"ready", "prepared", "equipped", "armed", "supplied", "stocked", "loaded", "charged"
	],
	
	verb_neu: [
		"covers the basics", "gets the job done", "has ups and downs", "lands somewhere in the middle",
		"works with caveats", "needs polish but functions", "doesn't break new ground",
		"meets minimum requirements", "satisfies basic needs", "fulfills core functions", "handles typical cases",
		"manages common scenarios", "addresses standard issues", "solves routine problems", "performs expected tasks",
		"delivers promised features", "implements specified requirements", "follows established patterns", "adheres to conventions",
		"maintains status quo", "preserves existing state", "continues current trends", "extends previous work",
		"builds on foundations", "leverages existing assets", "reuses known solutions", "applies proven methods",
		"follows best practices", "implements standards", "complies with regulations", "meets compliance requirements",
		"passes basic tests", "clears minimum bar", "achieves baseline performance", "reaches acceptable levels",
		"stays within bounds", "remains in limits", "keeps to constraints", "operates within parameters",
		"functions as designed", "behaves as expected", "responds as documented", "performs as specified",
		"works most of the time", "succeeds often enough", "fails occasionally", "struggles sometimes",
		"varies by use case", "depends on context", "changes with conditions", "fluctuates with load",
		"scales to a point", "grows within limits", "expands moderately", "contracts gracefully",
		"adapts somewhat", "adjusts partially", "modifies slightly", "tweaks minimally",
		"improves gradually", "evolves slowly", "progresses steadily", "advances incrementally",
		"maintains position", "holds ground", "stays competitive", "remains relevant",
		"serves its purpose", "fills a niche", "occupies a space", "has its place"
	],
	
	react_neu: [
		"I can live with it", "I'm on the fence", "it's fine for now", "I'll watch how it evolves",
		"I don't love it, but it works", "I'm cautiously optimistic",
		"jury's still out", "time will tell", "we'll see what happens", "reserving judgment",
		"giving it a chance", "keeping an open mind", "withholding opinion", "staying neutral",
		"it has potential", "room for improvement", "could go either way", "mixed feelings",
		"some good, some bad", "win some, lose some", "swings and roundabouts", "six of one",
		"neither here nor there", "middle of the road", "sitting on fence", "split decision",
		"partially satisfied", "somewhat pleased", "moderately happy", "reasonably content",
		"tentatively positive", "guardedly hopeful", "carefully optimistic", "measured enthusiasm",
		"it serves a purpose", "does what it says", "nothing special", "unremarkable but functional",
		"gets us by", "makes do", "suffices for now", "adequate solution",
		"temporary fix", "stopgap measure", "interim solution", "placeholder approach",
		"workable compromise", "acceptable trade-off", "reasonable balance", "fair middle ground",
		"could be worse", "could be better", "seen worse", "seen better",
		"not my first choice", "not my last choice", "somewhere in between", "middle option",
		"standard fare", "typical offering", "expected quality", "average experience",
		"maintaining course", "staying put", "holding pattern", "wait and see",
		"monitoring situation", "tracking progress", "evaluating options", "assessing alternatives"
	],
	
	obs_neu: [
		"#product.capitalize# is #adj_neu#",
		"#team# #verb_neu#",
		"the #feature# change is #adj_neu#",
		"setup was #adj_neu# and straightforward",
		"navigation is #adj_neu# in typical flows",
		"the UI is #adj_neu# but familiar",
		"performance has been #adverb# #adj_neu#",
		"stability is #adj_neu# under normal conditions",
		"the architecture is #adj_neu# and conventional",
		"error handling is #adj_neu# but present",
		"the feedback loops are #adj_neu# and standard",
		"data presentation is #adj_neu# and factual",
		"the mobile experience is #adj_neu# and usable",
		"cross-platform support is #adj_neu#",
		"the API design is #adj_neu# and documented",
		"documentation exists and is #adj_neu#",
		"the onboarding process is #adj_neu# and structured",
		"customer support has been #adj_neu#",
		"the pricing model is #adj_neu# and market-standard",
		"security measures are #adj_neu# and basic",
		"the update process is #adj_neu# and regular",
		"backwards compatibility is #adj_neu#",
		"the plugin ecosystem is #adj_neu# and stable",
		"third-party integrations are #adj_neu#",
		"the #feature# implementation is #adj_neu#",
		"#team# has been #adverb# #adj_neu# to work with",
		"response times are #adj_neu#",
		"the learning resources are #adj_neu#",
		"community engagement is #adj_neu#"
	],

	// Clause structures
	clause_pos: [
		"#connector# #hedge#, #obs_pos#",
		"#connector# #obs_pos#",
		"#connector# it's #adverb# #adj_pos# #time#",
		"#connector# #react_pos#",
		"#connector# the #feature# feature #verb_pos#",
		"#connector# #team# really #verb_pos# here",
		"#connector# I'm #adverb# impressed with how #adj_pos# the #feature# is",
		"#connector# the attention to detail is #adj_pos#",
		"#connector# the execution is #adj_pos#",
		"#connector# the implementation is #adj_pos#",
		"#connector# the results speak for themselves",
		"#connector# the improvement is #adj_pos#",
		"#connector# the difference is #adj_pos#",
		"#connector# the impact has been #adj_pos#",
		"#connector# the value is #adverb# #adj_pos#"
	],
	
	clause_neg: [
		"#connector# #hedge#, #obs_neg#",
		"#connector# #obs_neg#",
		"#connector# it's #adverb# #adj_neg# #time#",
		"#connector# #react_neg#",
		"#connector# the #feature# feature #verb_neg#",
		"#connector# #team# really #verb_neg# here",
		"#connector# I'm #adverb# frustrated with how #adj_neg# the #feature# is",
		"#connector# the lack of attention is #adj_neg#",
		"#connector# the execution is #adj_neg#",
		"#connector# the implementation is #adj_neg#",
		"#connector# the results are disappointing",
		"#connector# the regression is #adj_neg#",
		"#connector# the degradation is #adj_neg#",
		"#connector# the impact has been #adj_neg#",
		"#connector# the cost is #adverb# #adj_neg#"
	],
	
	clause_neu: [
		"#connector# #hedge#, #obs_neu#",
		"#connector# #obs_neu#",
		"#connector# it's #adverb# #adj_neu# #time#",
		"#connector# #react_neu#",
		"#connector# the #feature# feature #verb_neu#",
		"#connector# #team# #verb_neu# here",
		"#connector# I'm #adverb# neutral on how #adj_neu# the #feature# is",
		"#connector# the approach is #adj_neu#",
		"#connector# the execution is #adj_neu#",
		"#connector# the implementation is #adj_neu#",
		"#connector# the results are mixed",
		"#connector# the change is #adj_neu#",
		"#connector# the adjustment is #adj_neu#",
		"#connector# the impact has been #adj_neu#",
		"#connector# the trade-off is #adverb# #adj_neu#"
	],

	// Lead phrases
	lead_pos: [
		"Honestly, I'm thrilled #time#",
		"I'm pleasantly surprised #time#",
		"Didn't expect this, but I'm impressed #time#",
		"It's rare, but this clicked #time#",
		"Wow, #team# really delivered #time#",
		"I'm genuinely excited about this #time#",
		"This exceeded my expectations #time#",
		"I'm blown away by the quality #time#",
		"Finally, something that works #time#",
		"This is exactly what we needed #time#",
		"I'm loving the direction #time#",
		"The improvements are noticeable #time#",
		"I'm seeing real value #time#",
		"This has been a game-changer #time#",
		"I'm thoroughly impressed #time#"
	],
	
	lead_neg: [
		"Honestly, I'm disappointed #time#",
		"I'm pretty frustrated #time#",
		"Didn't expect this, and it let me down #time#",
		"It's hard to say this, #time#",
		"Unfortunately, #team# missed the mark #time#",
		"I'm genuinely concerned about this #time#",
		"This fell short of expectations #time#",
		"I'm struggling with the quality #time#",
		"Still broken after all this time #time#",
		"This is not what we needed #time#",
		"I'm worried about the direction #time#",
		"The problems are mounting #time#",
		"I'm not seeing value #time#",
		"This has been problematic #time#",
		"I'm thoroughly disappointed #time#"
	],
	
	lead_neu: [
		"Honestly, I feel mixed #time#",
		"I'm somewhere in the middle #time#",
		"It's a bit of both #time#",
		"Hard to call it either way #time#",
		"So far, #team# has delivered something average #time#",
		"I'm neutral about this #time#",
		"This met basic expectations #time#",
		"I'm seeing standard quality #time#",
		"It works as advertised #time#",
		"This is what we expected #time#",
		"I'm watching the direction #time#",
		"The changes are noticeable #time#",
		"I'm seeing some value #time#",
		"This has been adequate #time#",
		"I'm reserving judgment #time#"
	],

	// Wrap phrases
	wrap_pos: [
		"#react_pos#.", "that's a big win.", "it's headed the right way.", "more of this, please.",
		"keep up the great work.", "this is the right direction.", "I'm all in.", "count me as a fan.",
		"you've earned a loyal user.", "this is how it's done.", "textbook execution.", "chef's kiss.",
		"10/10 would recommend.", "shut up and take my money.", "worth every cent.", "no notes.",
		"absolutely stellar.", "knocked it out of the park.", "home run.", "grand slam.",
		"mission accomplished.", "objective achieved.", "goal reached.", "target hit.",
		"success story.", "case study material.", "best in class.", "industry leading.",
		"setting the standard.", "raising the bar.", "pushing boundaries.", "breaking barriers."
	],
	
	wrap_neg: [
		"#react_neg#.", "that's a deal-breaker for me.", "it needs real fixes.", "I'm filing a ticket.",
		"please fix this urgently.", "this needs immediate attention.", "I can't use this.", "back to the drawing board.",
		"you've lost a user.", "this is not acceptable.", "complete failure.", "epic fail.",
		"0/10 would not recommend.", "want my money back.", "not worth it.", "many notes.",
		"absolutely terrible.", "struck out completely.", "swing and a miss.", "fumbled badly.",
		"mission failed.", "objective missed.", "goal not reached.", "target missed.",
		"cautionary tale.", "what not to do.", "worst in class.", "industry lagging.",
		"setting a bad example.", "lowering the bar.", "going backwards.", "creating barriers."
	],
	
	wrap_neu: [
		"#react_neu#.", "we'll see where it goes.", "I can work with it.", "it balances out.",
		"room for growth.", "potential exists.", "time will tell.", "jury's out.",
		"keeping an eye on it.", "monitoring progress.", "standard stuff.", "par for the course.",
		"5/10 perfectly average.", "you get what you pay for.", "market rate.", "no surprises.",
		"meets expectations.", "nothing special.", "middle of the pack.", "average performance.",
		"mission ongoing.", "objective in progress.", "goal partially met.", "target approached.",
		"developing story.", "work in progress.", "middle tier.", "industry standard.",
		"maintaining pace.", "holding steady.", "treading water.", "status quo maintained."
	],

	// Origin patterns (entry points)
	origin_pos: [
		"#lead_pos#, #hedge#, #obs_pos#, #clause_pos#, #wrap_pos#",
		"#lead_pos#, #obs_pos#, #clause_pos#, #wrap_pos#",
		"#obs_pos#. #clause_pos#. #wrap_pos#",
		"#hedge#, #obs_pos#, #clause_pos#, and #react_pos#.",
		"#time.capitalize#, #obs_pos#. #clause_pos#, #wrap_pos#",
		"Been using #product# #time# - #obs_pos#. #wrap_pos#",
		"Quick feedback: #obs_pos#, #clause_pos#. #react_pos#.",
		"#team.capitalize# #verb_pos# with #product#. #wrap_pos#"
	],
	
	origin_neg: [
		"#lead_neg#, #hedge#, #obs_neg#, #clause_neg#, #wrap_neg#",
		"#lead_neg#, #obs_neg#, #clause_neg#, #wrap_neg#",
		"#obs_neg#. #clause_neg#. #wrap_neg#",
		"#hedge#, #obs_neg#, #clause_neg#, and #react_neg#.",
		"#time.capitalize#, #obs_neg#. #clause_neg#, #wrap_neg#",
		"Been using #product# #time# - #obs_neg#. #wrap_neg#",
		"Quick feedback: #obs_neg#, #clause_neg#. #react_neg#.",
		"#team.capitalize# #verb_neg# with #product#. #wrap_neg#"
	],
	
	origin_neu: [
		"#lead_neu#, #hedge#, #obs_neu#, #clause_neu#, #wrap_neu#",
		"#lead_neu#, #obs_neu#, #clause_neu#, #wrap_neu#",
		"#obs_neu#. #clause_neu#. #wrap_neu#",
		"#hedge#, #obs_neu#, #clause_neu#, and #react_neu#.",
		"#time.capitalize#, #obs_neu#. #clause_neu#, #wrap_neu#",
		"Been using #product# #time# - #obs_neu#. #wrap_neu#",
		"Quick feedback: #obs_neu#, #clause_neu#. #react_neu#.",
		"#team.capitalize# #verb_neu# with #product#. #wrap_neu#"
	]
};