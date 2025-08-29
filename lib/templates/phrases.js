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
/**
 * Main phrase bank with Tracery grammar patterns
 * Uses # symbols to denote template variables
 */
export const PHRASE_BANK = {
    // ============= Core Vocabulary =============
    
    product: [
        // Generic references
        "the dashboard", "this release", "the latest build", "the app",
        "the platform", "the system", "the tool", "the software",
        "the interface", "the UI", "the experience", "the workflow",
        
        // Specific features/areas
        "the analytics dashboard", "the admin panel", "the settings page",
        "the export function", "the search feature", "the API",
        "the mobile version", "the desktop app", "the web interface",
        "the integration", "the plugin", "the extension", "the widget",
        
        // Natural references
        "this thing", "what we're using", "our setup", "the whole system",
        "everything", "the current version", "the new update", "the latest changes",
        
        // Version-specific
        "v3.2.1", "the beta", "the stable release", "production",
        "the March update", "2.0", "the legacy version", "the new architecture"
    ],
    
    feature: [
        // Core functionality
        "search", "export", "import", "sync", "backup", "restore",
        "notifications", "alerts", "reports", "dashboards", "analytics",
        "permissions", "authentication", "authorization", "SSO", "2FA",
        
        // UI features
        "dark mode", "themes", "customization", "drag and drop",
        "keyboard shortcuts", "tooltips", "hover states", "animations",
        "responsive design", "mobile view", "print layout", "fullscreen",
        
        // Data features
        "filtering", "sorting", "pagination", "bulk operations",
        "batch processing", "real-time updates", "auto-save",
        "version history", "change tracking", "audit logs",
        
        // Specific problematic areas
        "the login flow", "password reset", "file upload",
        "data export", "CSV import", "PDF generation",
        "email notifications", "push alerts", "webhook configuration",
        
        // Performance related
        "loading times", "response time", "caching", "optimization",
        "memory usage", "CPU utilization", "network requests",
        "database queries", "API calls", "rendering performance"
    ],
    
    team: [
        "the team", "support", "the devs", "engineering",
        "the founders", "the company", "customer service",
        "the product team", "the UX folks", "QA",
        "you guys", "y'all", "the folks at [company]",
        "whoever built this", "whoever's responsible",
        "the person who designed this", "management"
    ],
    
    // ============= Emotional/Reaction Vocabulary =============
    
    adj_pos: [
        // Mild positive
        "good", "nice", "solid", "decent", "fine", "okay",
        "workable", "acceptable", "reasonable", "fair",
        
        // Strong positive
        "great", "excellent", "fantastic", "amazing", "incredible",
        "brilliant", "perfect", "flawless", "outstanding", "exceptional",
        
        // Technical positive
        "fast", "responsive", "intuitive", "clean", "efficient",
        "reliable", "stable", "robust", "scalable", "performant",
        
        // UX positive
        "smooth", "seamless", "polished", "refined", "elegant",
        "beautiful", "delightful", "pleasant", "enjoyable", "satisfying"
    ],
    
    adj_neg: [
        // Mild negative
        "bad", "poor", "weak", "lacking", "subpar",
        "disappointing", "underwhelming", "mediocre", "average",
        
        // Strong negative
        "terrible", "awful", "horrible", "atrocious", "abysmal",
        "useless", "worthless", "broken", "unusable", "unacceptable",
        
        // Technical negative
        "slow", "laggy", "buggy", "glitchy", "unstable",
        "unreliable", "inconsistent", "fragile", "brittle", "flaky",
        
        // UX negative
        "clunky", "awkward", "confusing", "frustrating", "annoying",
        "painful", "tedious", "cumbersome", "convoluted", "unintuitive"
    ],
    
    adj_neu: [
        "okay", "fine", "average", "standard", "typical",
        "normal", "regular", "common", "basic", "simple",
        "functional", "working", "operational", "adequate", "sufficient",
        "acceptable", "passable", "usable", "serviceable", "middling"
    ],
    
    // ============= Action Verbs =============
    
    verb_pos: [
        "works perfectly", "runs smoothly", "performs well", "exceeds expectations",
        "saves time", "increases productivity", "simplifies workflows", "reduces friction",
        "solves the problem", "addresses our needs", "delivers value", "impresses clients",
        "streamlines processes", "automates tasks", "eliminates errors", "prevents issues"
    ],
    
    verb_neg: [
        "crashes constantly", "fails randomly", "breaks frequently", "errors out",
        "loses data", "corrupts files", "times out", "hangs indefinitely",
        "wastes time", "creates problems", "causes headaches", "frustrates users",
        "blocks workflows", "prevents progress", "introduces bugs", "degrades performance"
    ],
    
    verb_neu: [
        "works sometimes", "functions adequately", "performs as expected", "does the job",
        "meets requirements", "fulfills its purpose", "serves its function", "operates normally",
        "handles basic tasks", "covers essentials", "provides basics", "delivers minimum"
    ],
    
    // ============= Natural Speech Elements =============
    
    hedge: [
        "honestly", "to be fair", "in my opinion", "from what I can tell",
        "as far as I know", "based on my experience", "personally",
        "I think", "I feel like", "seems like", "looks like",
        "apparently", "supposedly", "allegedly", "reportedly"
    ],
    
    connector: [
        "and", "but", "so", "also", "plus", "however",
        "although", "though", "yet", "still", "meanwhile",
        "anyway", "besides", "furthermore", "moreover", "additionally"
    ],
    
    time: [
        "today", "yesterday", "this week", "last month", "recently",
        "just now", "a while ago", "for months", "since January",
        "after the update", "before the change", "during testing",
        "in production", "on staging", "in development"
    ],
    
    // ============= Specific Detail Patterns =============
    
    specific_issues: [
        "crashes 3-4 times per day",
        "takes 30+ seconds to load",
        "returns 404 on every third request",
        "memory leak after ~1000 records",
        "CPU spikes to 100%",
        "freezes for 5-10 seconds",
        "loses connection every hour",
        "duplicates data randomly",
        "skips every other record",
        "timeout after exactly 30 seconds",
        "breaks with files over 10MB",
        "fails silently with no error",
        "shows blank page intermittently",
        "corrupts UTF-8 characters",
        "drops decimal precision"
    ],
    
    specific_praise: [
        "loads in under 100ms",
        "handles 10k records smoothly",
        "reduced our costs by 40%",
        "saved 2 hours daily",
        "zero downtime in 6 months",
        "processes batches in seconds",
        "scales to millions of users",
        "cut deployment time in half",
        "increased conversion by 25%",
        "eliminated 90% of errors"
    ],
    
    error_messages: [
        "undefined is not a function",
        "cannot read property of null",
        "CORS policy blocked",
        "401 unauthorized",
        "500 internal server error",
        "connection refused",
        "SSL certificate invalid",
        "maximum call stack exceeded",
        "out of memory",
        "segmentation fault",
        "null pointer exception",
        "index out of bounds",
        "syntax error unexpected token",
        "module not found",
        "permission denied"
    ],
    
    user_actions: [
        "tried refreshing",
        "cleared cache",
        "restarted the app",
        "reinstalled everything",
        "checked the docs",
        "googled the error",
        "asked on Stack Overflow",
        "posted in Discord",
        "filed a ticket",
        "contacted support",
        "DMed the founder",
        "tweeted about it",
        "gave up and used Excel",
        "built a workaround",
        "wrote a script"
    ],
    
    business_impact: [
        "blocking our launch",
        "costing us customers",
        "hurting revenue",
        "damaging our reputation",
        "frustrating the team",
        "delaying the project",
        "increasing support tickets",
        "causing compliance issues",
        "failing security audits",
        "breaking SLAs",
        "missing deadlines",
        "burning budget",
        "losing competitive edge",
        "preventing scaling",
        "limiting growth"
    ],
    
    comparisons: [
        "even Excel does this better",
        "WordPress from 2010 was more stable",
        "[Competitor] figured this out years ago",
        "the free version of [Alternative] works better",
        "like [Good Product] but broken",
        "trying to be [Leader] but failing",
        "poor man's [Premium Tool]",
        "wish.com version of [Product]",
        "makes me miss [Old Tool]",
        "reminds me of software from the 90s"
    ],
    
    credibility: [
        "I've been in tech for 10+ years",
        "as a senior developer",
        "we're a paying enterprise customer",
        "I rarely complain but",
        "I've evaluated dozens of tools",
        "speaking from experience",
        "not my first rodeo",
        "I know what I'm talking about",
        "trust me on this",
        "I've built similar systems"
    ],
    
    emotional_markers: [
        "I'm not even exaggerating",
        "I wish I was joking",
        "absolutely unbelievable",
        "beyond frustrated",
        "losing my mind",
        "about to rage quit",
        "crying actual tears",
        "dead inside",
        "this is insane",
        "I can't even"
    ],
    
    trail_offs: [
        "...",
        "... whatever",
        "... I guess",
        "... or something",
        "... you know?",
        "... if that makes sense",
        "... but anyway",
        "... nevermind",
        "... sigh",
        "... ugh"
    ],
    
    // ============= Complex Origin Patterns =============
    
    // Positive origins with different intensities
    origin_pos_low: [
        "#hedge#, #product# is #adj_pos#. #feature.capitalize# works as expected. Not perfect but #verb_pos#.",
        "It's decent. #team.capitalize# did okay with #feature#. #time.capitalize# it's been stable.",
        "#product.capitalize# is fine. Does what it says. #specific_praise#. Can't complain really."
    ],
    
    origin_pos_medium: [
        "#hedge.capitalize#, I'm impressed. #product.capitalize# #verb_pos# and #feature# is #adj_pos#. #specific_praise#.",
        "#time.capitalize# we switched to #product# and it #verb_pos#. The #feature# especially is #adj_pos#.",
        "Really happy with #product#. #team.capitalize# #verb_pos# and the #feature# is exactly what we needed."
    ],
    
    origin_pos_high: [
        "GAME CHANGER! #product.capitalize# completely #verb_pos#! #specific_praise# #emotional_markers#",
        "#credibility# and this is the BEST. #product.capitalize# #verb_pos# beyond belief. #specific_praise#!!!",
        "Holy crap #product# is #adj_pos#! #feature.capitalize# alone #verb_pos#. Shut up and take my money!"
    ],
    
    // Negative origins with different intensities
    origin_neg_low: [
        "#hedge#, #product# has issues. #feature.capitalize# is #adj_neg# and occasionally #specific_issues#.",
        "Not great. #product.capitalize# is #adj_neg#. #team.capitalize# should look at #feature# - it's problematic.",
        "#time.capitalize# noticed #product# is getting #adj_neg#. The #feature# specifically #verb_neg#."
    ],
    
    origin_neg_medium: [
        "#product.capitalize# is #adj_neg#. #specific_issues# and #team# hasn't fixed it. Really frustrating.",
        "#credibility# - this is bad. #feature.capitalize# #verb_neg# and it's #business_impact#. Not acceptable.",
        "Major problems with #product#. #specific_issues# #time#. Support is useless. #comparisons#."
    ],
    
    origin_neg_high: [
        "ABSOLUTE GARBAGE! #product.capitalize# #verb_neg# CONSTANTLY! #specific_issues# #emotional_markers# #business_impact#!!!",
        "DO NOT USE #product#! #credibility# and this is the WORST. #verb_neg.capitalize# and #verb_neg#. RUN AWAY!",
        "#emotional_markers.capitalize#! #product.capitalize# is completely broken! #specific_issues# Error: #error_messages#. I'm DONE!"
    ],
    
    // Neutral origins
    origin_neu: [
        "#product.capitalize# is #adj_neu#. #feature.capitalize# works but nothing special. #verb_neu.capitalize#.",
        "#hedge#, mixed feelings about #product#. Some parts #adj_pos#, others #adj_neg#. It's complicated.",
        "#time.capitalize# using #product#. It's functional. The #feature# does what it claims. That's about it."
    ],
    
    // Style-specific origins
    origin_support_pos: [
        "Hi team, loving #product# but quick question about #feature#. It mostly #verb_pos# but sometimes #trail_offs#",
        "Ticket #TICKET_ID#: #product# is great! Just wondering if #feature# could be enhanced? Currently #specific_praise#"
    ],
    
    origin_support_neg: [
        "URGENT: #product# is completely broken! #specific_issues# Error: #error_messages#. #business_impact#. Need immediate help!",
        "Ticket #TICKET_ID# - CRITICAL: #feature# #verb_neg# since #time#. Tried: #user_actions#. Nothing works. This is #business_impact#!"
    ],
    
    origin_review_pos: [
        "⭐⭐⭐⭐⭐ #credibility# and #product# is fantastic! #specific_praise# The #feature# alone is worth it. Highly recommend!",
        "5/5 - #product.capitalize# #verb_pos# as advertised. #time.capitalize# using it and still impressed. #specific_praise#"
    ],
    
    origin_review_neg: [
        "⭐ Waste of money. #product.capitalize# #verb_neg# constantly. #specific_issues# #comparisons#. Save yourself the trouble.",
        "1/5 - #credibility# but this is terrible. #specific_issues# Support ignored me. It's #business_impact#. AVOID!"
    ],
    
    origin_chat_pos: [
        "hey guys, just discovered #product# and OMG it's #adj_pos#! the #feature# is sick 🔥 #specific_praise#",
        "anyone else using #product#? it's actually pretty #adj_pos# lol... #feature# #verb_pos# really well"
    ],
    
    origin_chat_neg: [
        "ugh #product# is being #adj_neg# again... #specific_issues# anyone know a fix? #trail_offs#",
        "lmao #product# just #verb_neg# during my presentation 😭 #error_messages# fml... switching to #comparisons#"
    ],
    
    origin_email_pos: [
        "Hi team,\n\nQuick update on #product# - it's been #adj_pos#. The #feature# #verb_pos# and we're seeing #specific_praise#.\n\nBest,\n[Name]",
        "Following up on #product# evaluation. Results are #adj_pos#. #specific_praise# Recommend moving forward.\n\nRegards"
    ],
    
    origin_email_neg: [
        "Team,\n\nWe have serious issues with #product#. #specific_issues# This is #business_impact#.\n\nPlease advise on next steps.",
        "Hi,\n\n#product# is not working as expected. #feature.capitalize# #verb_neg# and it's causing problems. #specific_issues#\n\nNeed resolution ASAP."
    ],
    
    origin_forum_pos: [
        "[SOLVED] #product# #feature# is amazing!\n\n#credibility# and just wanted to share that #specific_praise#. If you're on the fence, go for it!",
        "PSA: #product# actually #verb_pos#\n\nBeen using it #time# and it's legit. The #feature# especially is #adj_pos#. AMA!"
    ],
    
    origin_forum_neg: [
        "[HELP] #product# #verb_neg# - anyone else?\n\n#specific_issues# Tried #user_actions# but nothing works. Error: #error_messages#\n\nAny ideas?",
        "WARNING: #product# is #adj_neg#\n\n#credibility# and need to warn others. #specific_issues# It's #business_impact#. #comparisons#"
    ],
    
    // Reaction patterns
    react_pos: [
        "I'm genuinely impressed",
        "this exceeded expectations",
        "worth every penny",
        "game changer for our team",
        "can't imagine working without it",
        "best investment this year",
        "recommending to everyone",
        "finally something that works",
        "exactly what we needed",
        "10/10 would buy again"
    ],
    
    react_neg: [
        "I want my money back",
        "switching to competitor",
        "complete waste of time",
        "regret this purchase",
        "warning others to stay away",
        "filing for refund",
        "escalating to management",
        "considering legal action",
        "worst decision ever",
        "learned my lesson"
    ],
    
    react_neu: [
        "it's okay I guess",
        "jury's still out",
        "time will tell",
        "we'll see how it goes",
        "cautiously optimistic",
        "reserving judgment",
        "mixed feelings",
        "could be better could be worse",
        "it is what it is",
        "works for now"
    ],
    
    // Wrap-up patterns
    wrap_pos: [
        "Highly recommend!",
        "Two thumbs up.",
        "Chef's kiss.",
        "This is the way.",
        "Ship it!",
        "Take my money!",
        "Finally!",
        "Nailed it.",
        "Perfect.",
        "Love it!"
    ],
    
    wrap_neg: [
        "Hard pass.",
        "Not recommended.",
        "Look elsewhere.",
        "Save your money.",
        "Disappointing.",
        "Failed expectations.",
        "Back to drawing board.",
        "Uninstalling.",
        "Requesting refund.",
        "Never again."
    ],
    
    wrap_neu: [
        "Your mileage may vary.",
        "It's fine.",
        "Decent enough.",
        "Works for some.",
        "Not bad not great.",
        "Depends on needs.",
        "Could be worse.",
        "It's something.",
        "Exists.",
        "Meh."
    ],

    // ============= Missing Fallback Patterns =============
    
    // Generic tone-based origins (fallbacks when style-specific ones don't exist)
    origin_pos: [
        "#product.capitalize# is #adj_pos#! #feature.capitalize# #verb_pos# and #specific_praise#. #react_pos#",
        "#hedge.capitalize#, really happy with #product#. The #feature# is #adj_pos# and #verb_pos#. #wrap_pos#",
        "#time.capitalize# switched to #product# and it's been #adj_pos#. #specific_praise# Definitely recommend!"
    ],
    
    origin_neg: [
        "#product.capitalize# is #adj_neg#. #feature.capitalize# #verb_neg# and #specific_issues#. #react_neg#",
        "#hedge.capitalize#, not impressed with #product#. It's #adj_neg# and #business_impact#. #wrap_neg#",
        "#credibility# but #product# is terrible. #specific_issues# #comparisons# Looking for alternatives."
    ],
    
    origin_neu: [
        "#product.capitalize# is #adj_neu#. #feature.capitalize# #verb_neu# but nothing special. #react_neu#",
        "#hedge#, mixed feelings about #product#. Some parts work, others don't. #verb_neu.capitalize#. #wrap_neu#",
        "#time.capitalize# using #product#. It's functional but #adj_neu#. Does the job I guess."
    ],

    // Intensity-specific neutral patterns (needed for mixed sentiment generation)
    origin_neu_low: [
        "#product.capitalize# is #adj_neu#. #feature.capitalize# #verb_neu# mostly. Could be better.",
        "#hedge#, #product# is fine. The #feature# works but nothing special.",
        "#time.capitalize# been using #product# and it's #adj_neu#. Does the job."
    ],

    origin_neu_medium: [
        "#product.capitalize# is #adj_neu#. #feature.capitalize# #verb_neu# but has room for improvement.",
        "#hedge#, mixed feelings about #product#. Some parts #adj_pos#, others #adj_neg#. #react_neu#",
        "#time.capitalize# evaluating #product#. It's functional but #feature# could be enhanced."
    ],

    origin_neu_high: [
        "#product.capitalize# is incredibly #adj_neu#! #feature.capitalize# #verb_neu# exactly as expected. Perfectly average!",
        "#hedge#, #product# is the most #adj_neu# thing I've ever used! #feature.capitalize# #verb_neu# precisely as designed!",
        "Wow, #product# is absolutely #adj_neu#! #feature.capitalize# #verb_neu# with mathematical precision!"
    ],
    
    // Missing style-specific neutral patterns
    origin_support_neu: [
        "Hi team, quick question about #product#. The #feature# is #adj_neu# but wondering if there are better options?",
        "Ticket #TICKET_ID#: #product# is working but #feature# could be improved. It's #adj_neu# currently.",
        "Support request: #product# #verb_neu# but having some minor issues with #feature#. Thanks!"
    ],
    
    origin_review_neu: [
        "⭐⭐⭐ #product# is fine. The #feature# works as expected. #verb_neu.capitalize# but nothing groundbreaking. It's okay.",
        "3/5 - #product.capitalize# is #adj_neu#. Does what it says but #feature# could be better. #wrap_neu#"
    ],
    
    origin_chat_neu: [
        "anyone tried #product#? the #feature# seems #adj_neu#... like it works but nothing amazing",
        "using #product# rn and it's... fine? #feature# is #adj_neu# i guess #trail_offs#"
    ],
    
    origin_email_neu: [
        "Hi team,\n\nUpdate on #product# - it's functional. The #feature# #verb_neu# and meets basic requirements.\n\nLet me know thoughts.",
        "Following up on #product# evaluation. Results are mixed. #feature.capitalize# works but room for improvement."
    ],
    
    origin_forum_neu: [
        "[DISCUSSION] #product# - anyone else think it's just okay?\n\nThe #feature# works but feels #adj_neu#. Not bad, not great.",
        "Thoughts on #product#?\n\nBeen using it #time# and it's functional. #feature.capitalize# does the job but #wrap_neu#"
    ],
    
    origin_feedback_pos: [
        "Excellent feedback on #product#! The #feature# is #adj_pos# and #verb_pos#. #specific_praise# #react_pos#",
        "Great experience with #product#. #hedge.capitalize#, really impressed with how the #feature# #verb_pos#. #wrap_pos#",
        "Positive feedback: #product# #verb_pos# and the #feature# is exactly what we needed. #specific_praise#"
    ],

    origin_feedback_neg: [
        "Negative feedback on #product#. The #feature# is #adj_neg# and #verb_neg#. #specific_issues# #react_neg#",
        "Poor experience with #product#. #credibility# but the #feature# is terrible. #business_impact# #wrap_neg#",
        "Critical feedback: #product# #verb_neg# constantly. #specific_issues# This needs immediate attention."
    ],

    origin_feedback_neu: [
        "Feedback on #product#: It's adequate. The #feature# works as designed but could use some polish.",
        "Mixed review of #product#. Some things work well, others are #adj_neu#. The #feature# specifically needs work."
    ],

    origin_search_pos: [
        "#product# #feature# awesome",
        "best #product# #feature#",
        "#product# #feature# love it",
        "amazing #product# #feature#",
        "#product# #feature# perfect"
    ],

    origin_search_neg: [
        "#product# #feature# broken",
        "#product# #feature# terrible",
        "#product# #feature# problems",
        "fix #product# #feature#",
        "#product# #feature# not working"
    ],

    // Intensity-specific patterns for feedback style
    origin_feedback_pos_low: [
        "Good feedback on #product#. The #feature# is #adj_pos# and works well.",
        "Positive experience with #product#. The #feature# is decent and #verb_pos#."
    ],

    origin_feedback_pos_medium: [
        "Great feedback on #product#! The #feature# is #adj_pos# and #verb_pos#. #specific_praise#",
        "Really positive experience with #product#. The #feature# #verb_pos# and meets our needs perfectly."
    ],

    origin_feedback_pos_high: [
        "AMAZING feedback on #product#! The #feature# is absolutely #adj_pos# and #verb_pos# beyond belief! #specific_praise#!!!",
        "Incredible experience with #product#! The #feature# is phenomenally #adj_pos# and completely #verb_pos#!"
    ],

    origin_feedback_neg_low: [
        "Some concerns about #product#. The #feature# is #adj_neg# and could be improved.",
        "Mixed feedback on #product#. The #feature# has issues and #verb_neg# occasionally."
    ],

    origin_feedback_neg_medium: [
        "Negative feedback on #product#. The #feature# is #adj_neg# and #verb_neg#. #specific_issues#",
        "Poor experience with #product#. The #feature# is problematic and needs attention."
    ],

    origin_feedback_neg_high: [
        "TERRIBLE feedback on #product#! The #feature# is absolutely #adj_neg# and completely #verb_neg#! #specific_issues#!!!",
        "Awful experience with #product#! The #feature# is utterly #adj_neg# and totally #verb_neg#!"
    ],

    // Intensity-specific patterns for search style
    origin_search_pos_low: [
        "#product# #feature# good",
        "#product# #feature# works",
        "#product# #feature# decent"
    ],

    origin_search_pos_medium: [
        "#product# #feature# great",
        "#product# #feature# excellent",
        "#product# #feature# impressive"
    ],

    origin_search_pos_high: [
        "#product# #feature# AMAZING",
        "#product# #feature# INCREDIBLE",
        "#product# #feature# BEST EVER"
    ],

    origin_search_neg_low: [
        "#product# #feature# issues",
        "#product# #feature# slow",
        "#product# #feature# meh"
    ],

    origin_search_neg_medium: [
        "#product# #feature# broken",
        "#product# #feature# bad",
        "#product# #feature# problems"
    ],

    origin_search_neg_high: [
        "#product# #feature# TERRIBLE",
        "#product# #feature# WORST",
        "#product# #feature# BROKEN AF"
    ],
    
    origin_search_neu: [
        "#product# #feature# okay",
        "is #product# worth it",
        "#product# vs alternatives",
        "#feature# #product# review",
        "how good is #product#"
    ],
    
    // Additional clause patterns for length adjustment
    clause_pos: [
        "it really #verb_pos#",
        "the #feature# is fantastic",
        "#specific_praise#",
        "totally worth it",
        "exceeded my expectations"
    ],
    
    clause_neg: [
        "it constantly #verb_neg#",
        "the #feature# is broken",
        "#specific_issues#",
        "complete waste of money",
        "very disappointed"
    ],
    
    clause_neu: [
        "it #verb_neu#",
        "the #feature# is okay",
        "works as expected",
        "nothing special",
        "decent enough"
    ],
    
    // Observation patterns
    obs_pos: [
        "Great job by #team#",
        "This is how software should work",
        "Finally a tool that gets it right",
        "Impressed with the quality"
    ],
    
    obs_neg: [
        "#team# needs to fix this",
        "This is unacceptable quality",
        "Expected better from #team#",
        "Seriously considering alternatives"
    ],
    
    obs_neu: [
        "It's what you'd expect",
        "Standard functionality",
        "Meets basic requirements",
        "Nothing to write home about"
    ]
};

// Helper function for ticket IDs
PHRASE_BANK.TICKET_ID = () => {
    const prefix = ['TKT', 'CASE', 'REQ', 'INC', 'BUG'];
    const p = prefix[Math.floor(Math.random() * prefix.length)];
    const num = Math.floor(10000 + Math.random() * 90000);
    return `${p}-${num}`;
};

// Export default
export default PHRASE_BANK;