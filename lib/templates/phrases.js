/**
 * Organic Phrase Bank for Natural Text Generation
 * Contains real human speech patterns, not templates
 */

// ============= Core Phrase Bank =============

export const PHRASE_BANK = {
    // Products and systems (expanded from phrases-bak.js)
    products: [
        // Generic references
        "the dashboard", "this release", "the latest build", "this app",
        "the platform", "the system", "the tool", "the software",
        "the interface", "the UI", "the experience", "the workflow",
        "the solution", "the service", "the implementation", "the framework",
        "the codebase", "the infrastructure", "the ecosystem", "the stack",
        
        // Specific features/areas
        "the analytics dashboard", "the admin panel", "the settings page",
        "the export function", "the search feature", "the API",
        "the mobile version", "the desktop app", "the web interface",
        "the integration", "the plugin", "the extension", "the widget",
        "the microservice", "the component library", "the database layer",
        "the frontend framework", "the backend service", "the CLI tool",
        
        // Natural references
        "this thing", "what we're using", "our setup", "the whole system",
        "everything", "the current version", "the new update", "the latest changes",
        "this contraption", "the whole shebang", "the entire apparatus",
        "our deployment", "the current iteration", "this implementation",
        
        // Version-specific
        "v3.2.1", "the beta", "the stable release", "production",
        "the March update", "2.0", "the legacy version", "the new architecture",
        "the canary build", "the hotfix", "the patch release", "staging",
        "the preview version", "the RC candidate", "the nightly build", "our instance"
    ],
    
    features: [
        // Core functionality
        "search", "export", "import", "sync", "backup", "restore",
        "notifications", "alerts", "reports", "dashboards", "analytics",
        "permissions", "authentication", "authorization", "SSO", "2FA",
        "indexing", "archival", "replication", "migration", "orchestration",
        
        // UI features
        "dark mode", "themes", "customization", "drag and drop",
        "keyboard shortcuts", "tooltips", "hover states", "animations",
        "responsive design", "mobile view", "print layout", "fullscreen",
        "accessibility", "internationalization", "localization", "virtualization",
        "lazy loading", "infinite scroll", "modal dialogs", "breadcrumbs",
        
        // Data features
        "filtering", "sorting", "pagination", "bulk operations",
        "batch processing", "real-time updates", "auto-save",
        "version history", "change tracking", "audit logs",
        "data validation", "schema evolution", "ETL pipelines", "data lineage",
        "anomaly detection", "data profiling", "metadata management",
        
        // Specific problematic areas
        "the login flow", "password reset", "file upload",
        "data export", "CSV import", "PDF generation",
        "email notifications", "push alerts", "webhook configuration",
        "CORS handling", "rate limiting", "circuit breakers", "health checks",
        "feature flags", "A/B testing", "rollback mechanisms",
        
        // Performance related
        "loading times", "response time", "caching", "optimization",
        "memory usage", "CPU utilization", "network requests",
        "database queries", "API calls", "rendering performance",
        "latency", "throughput", "scalability", "concurrency",
        "garbage collection", "connection pooling", "resource allocation",
        "the API", "the admin panel", "settings", "integrations",
        "the mobile app", "the workflow", "automation", "templates"
    ],
    
    issues: [
        "crashes", "freezes", "errors out", "times out", "loses data",
        "won't load", "breaks", "glitches", "bugs out", "fails",
        "disconnects", "hangs", "corrupts files", "memory leaks",
        "throws errors", "returns 404", "gives me 500 errors",
        "doesn't respond", "goes blank", "stops working", "malfunctions",
        "acts up", "behaves strangely", "performs poorly", "lags severely"
    ],
    
    // Advanced vocabulary from phrases-bak.js
    product: [
        // Generic references
        "the dashboard", "this release", "the latest build", "the app",
        "the platform", "the system", "the tool", "the software",
        "the interface", "the UI", "the experience", "the workflow",
        "the solution", "the service", "the implementation", "the framework",
        "the codebase", "the infrastructure", "the ecosystem", "the stack"
    ],
    
    feature: [
        // Core functionality
        "search", "export", "import", "sync", "backup", "restore",
        "notifications", "alerts", "reports", "dashboards", "analytics",
        "permissions", "authentication", "authorization", "SSO", "2FA",
        "indexing", "archival", "replication", "migration", "orchestration"
    ],
    
    team: [
        "the team", "support", "the devs", "engineering",
        "the founders", "the company", "customer service",
        "the product team", "the UX folks", "QA",
        "you guys", "y'all", "the folks at [company]",
        "whoever built this", "whoever's responsible",
        "the person who designed this", "management"
    ],
    
    // Emotional/Reaction Vocabulary
    adj_pos: [
        // Mild positive
        "good", "nice", "solid", "decent", "fine", "okay",
        "workable", "acceptable", "reasonable", "fair",
        "adequate", "serviceable", "competent", "passable",
        "pretty good", "not bad", "alright", "satisfactory",
        
        // Strong positive  
        "great", "excellent", "fantastic", "amazing", "incredible",
        "brilliant", "perfect", "flawless", "outstanding", "exceptional",
        "superb", "magnificent", "phenomenal", "exemplary", "pristine",
        "immaculate", "sublime", "transcendent", "superlative",
        
        // Modern internet positive
        "fire", "slaps", "hits different", "no cap good", "actually fire",
        "lowkey amazing", "highkey incredible", "absolutely sends",
        "chef's kiss", "10/10", "100/100", "elite tier",
        "S-tier", "god tier", "built different", "just hits",
        
        // Enthusiastic positive
        "mind-blowing", "game-changing", "life-changing", "revolutionary",
        "groundbreaking", "next level", "insane", "wild", "crazy good",
        "absolutely mental", "bonkers good", "unreal", "legendary",
        
        // Technical positive
        "fast", "responsive", "intuitive", "clean", "efficient",
        "reliable", "stable", "robust", "scalable", "performant",
        "optimized", "streamlined", "fault-tolerant", "resilient",
        "maintainable", "extensible", "modular", "cohesive",
        "crisp", "snappy", "buttery smooth", "lightning fast",
        
        // UX positive
        "smooth", "seamless", "polished", "refined", "elegant",
        "beautiful", "delightful", "pleasant", "enjoyable", "satisfying",
        "ergonomic", "harmonious", "sophisticated", "intuitive",
        "frictionless", "effortless", "graceful", "tactful",
        "chef's kiss", "immaculate vibes", "pristine experience"
    ],
    
    adj_neg: [
        // Mild negative
        "bad", "poor", "weak", "lacking", "subpar",
        "disappointing", "underwhelming", "mediocre", "average",
        "deficient", "inadequate", "insufficient", "questionable",
        "kinda sus", "not it", "mid", "lowkey trash", "questionable vibes",
        
        // Strong negative
        "terrible", "awful", "horrible", "atrocious", "abysmal",
        "useless", "worthless", "damaged", "unusable", "unacceptable",
        "deplorable", "egregious", "catastrophic", "abhorrent",
        "detestable", "reprehensible", "inexcusable", "unconscionable",
        
        // Modern internet negative
        "trash", "garbage", "hot garbage", "absolute trash", "dumpster fire",
        "cursed", "big yikes", "ain't it chief", "this ain't it",
        "straight up broken", "absolutely cooked", "completely fried",
        "dead on arrival", "L + ratio", "took an L", "major L",
        "actually unhinged", "lowkey unhinged", "highkey problematic",
        
        // Intensely negative
        "absolutely diabolical", "criminally bad", "war crime levels of bad",
        "should be illegal", "actually offensive", "personally attacked",
        "violence", "straight disrespectful", "audacious", "the audacity",
        "absolutely not", "hard no", "absolutely sent me to the shadow realm",
        
        // Technical negative
        "slow", "laggy", "buggy", "glitchy", "unstable",
        "unreliable", "inconsistent", "fragile", "brittle", "flaky",
        "deprecated", "obsolete", "antiquated", "convoluted",
        "byzantine", "arcane", "esoteric", "inscrutable",
        "janky", "scuffed", "absolutely cooked", "borked",
        
        // UX negative
        "clunky", "awkward", "confusing", "frustrating", "annoying",
        "painful", "tedious", "cumbersome", "convoluted", "unintuitive",
        "jarring", "disorienting", "bewildering", "labyrinthine",
        "torturous", "excruciating", "maddening", "infuriating",
        "cursed UX", "pain simulator", "digital torture device"
    ],
    
    adj_neu: [
        "okay", "fine", "average", "standard", "typical",
        "normal", "regular", "common", "basic", "simple",
        "functional", "working", "operational", "adequate", "sufficient",
        "acceptable", "passable", "usable", "serviceable", "middling",
        
        // Modern neutral with slight emotional undertones
        "mid", "it's giving mid", "lowkey mid", "kinda mid",
        "exists", "it's there", "does what it says on the tin",
        "baseline", "bare minimum", "does the thing",
        "no complaints no compliments", "meh tier", "B-tier",
        "cautiously optimistic", "reserved judgment", "jury's still out",
        "wait and see", "could go either way", "time will tell"
    ],
    
    // Action Verbs
    verb_pos: [
        "functions perfectly", "runs smoothly", "performs well", "exceeds expectations",
        "saves time", "increases productivity", "simplifies workflows", "reduces friction",
        "solves the problem", "addresses our needs", "delivers value", "impresses clients",
        "streamlines processes", "automates tasks", "eliminates errors", "prevents issues",
        "operates flawlessly", "executes impeccably", "performs seamlessly", "facilitates effortlessly",
        "optimizes efficiently", "orchestrates beautifully", "harmonizes perfectly", "synthesizes elegantly",
        "catalyzes innovation", "galvanizes productivity", "revolutionizes workflows", "transforms operations",
        "transcends limitations", "surpasses benchmarks", "epitomizes excellence", "exemplifies sophistication"
    ],
    
    verb_neg: [
        "crashes constantly", "fails randomly", "breaks frequently", "errors out",
        "loses data", "corrupts files", "times out", "hangs indefinitely",
        "wastes time", "creates problems", "causes headaches", "frustrates users",
        "blocks workflows", "prevents progress", "introduces bugs", "degrades performance",
        "malfunctions egregiously", "deteriorates precipitously", "disintegrates catastrophically", "falters inexplicably",
        "stagnates perpetually", "obfuscates unnecessarily", "complicates excessively", "confounds systematically",
        "undermines productivity", "sabotages efficiency", "thwarts innovation", "impedes advancement",
        "exacerbates problems", "compounds difficulties", "amplifies frustrations", "perpetuates dysfunction"
    ],
    
    verb_neu: [
        "operates sometimes", "functions adequately", "performs as expected", "does the job",
        "meets requirements", "fulfills its purpose", "serves its function", "runs normally",
        "handles basic tasks", "covers essentials", "provides basics", "delivers minimum"
    ],
    
    // Natural Speech Elements
    hedge: [
        "honestly", "to be fair", "in my opinion", "from what I can tell",
        "as far as I know", "based on my experience", "personally",
        "I think", "I feel like", "seems like", "looks like",
        "apparently", "supposedly", "allegedly", "reportedly",
        "ostensibly", "purportedly", "presumably", "conceivably",
        "arguably", "conceivably", "theoretically", "hypothetically",
        "in theory", "on paper", "superficially", "nominally",
        "by all accounts", "from my vantage point", "in my estimation"
    ],
    
    connector: [
        "and", "but", "so", "also", "plus", "however",
        "although", "though", "yet", "still", "meanwhile",
        "besides", "furthermore", "moreover", "additionally", "therefore", 
        "consequently", "likewise", "meanwhile", "nevertheless", "thus"
    ],
    
    time: [
        "today", "yesterday", "this week", "last month", "recently",
        "just now", "a while ago", "for months", "since January",
        "after the update", "before the change", "during testing",
        "in production", "on staging", "in development"
    ],
    
    // Specific Detail Patterns
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
        "drops decimal precision",
        "throttles inexplicably under load",
        "exhibits nondeterministic behavior",
        "suffers from race conditions",
        "experiences cascading failures",
        "demonstrates pathological performance",
        "manifests sporadic anomalies",
        "encounters byzantine errors",
        "plagued by intermittent glitches",
        "riddled with concurrency issues",
        "hamstrung by architectural limitations"
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
        "eliminated 90% of errors",
        "achieved sub-millisecond latency",
        "demonstrates remarkable resilience",
        "exhibits exemplary performance characteristics",
        "maintains impeccable uptime metrics",
        "delivers consistently stellar results",
        "operates with clockwork precision",
        "performs beyond expectations",
        "exceeds all benchmarks",
        "surpasses industry standards",
        "demonstrates unparalleled efficiency"
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
        "reminds me of software from the 90s",
        "pales in comparison to [Competitor]",
        "feels antiquated compared to [Modern Alternative]",
        "lacks the sophistication of [Premium Solution]",
        "exhibits none of the elegance of [Benchmark]",
        "falls woefully short of [Industry Standard]",
        "demonstrates inferior craftsmanship to [Reference]",
        "seems primitive alongside [Contemporary Tool]",
        "appears rudimentary next to [Advanced Platform]"
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
        "I can't even",
        "genuinely flummoxed",
        "utterly bewildered",
        "completely stupefied",
        "thoroughly perplexed",
        "profoundly disconcerted",
        "inexorably drawn to despair",
        "categorically bamboozled",
        "unequivocally nonplussed",
        "irrevocably disillusioned",
        "fundamentally exasperated",
        
        // Modern internet emotional markers
        "no cap", "deadass", "fr fr", "on god", "I'm literally",
        "actually deceased", "sent to another dimension", "absolutely sent",
        "I'm done", "pack it up", "delete this", "log off",
        "touch grass", "go outside", "this is it", "say less",
        "period", "and that's on period", "no printer just facts",
        "speaking facts", "spitting", "this is the tweet",
        "main character energy", "villain origin story", "character development",
        
        // Nuanced emotional expressions
        "cautiously optimistic", "reserved excitement", "qualified enthusiasm",
        "mixed feelings", "bittersweet", "conflicted", "torn",
        "pleasantly surprised", "unexpectedly moved", "grudgingly impressed",
        "reluctantly admit", "hate to say it but", "as much as it pains me",
        "against my better judgment", "despite my reservations"
    ],
    
    trail_offs: [
        "...",
        "... whatever",
        "... I guess",
        "... or something", 
        "... you know?",
        "... if that makes sense",
        "... but still",
        "... nevermind",
        "... sigh",
        "... ugh",
        "... honestly",
        "... basically",
        "... essentially"
    ],
    
    emotions: {
        pos: [
            "love it", "amazing", "fantastic", "impressed", "blown away",
            "thrilled", "excited", "happy", "satisfied", "pleased",
            "works great", "perfect", "excellent", "outstanding", "brilliant",
            
            // Modern internet positive emotions
            "absolutely sends", "no cap love this", "lowkey obsessed", "highkey amazing",
            "this slaps", "it hits different", "chef's kiss", "immaculate vibes",
            "living for this", "stan this", "absolutely here for it",
            "big fan", "major win", "W", "absolute W", "huge W",
            "fire emoji fire emoji", "literally crying", "I'm deceased",
            "dead from how good this is", "sent me", "I can't even",
            
            // Nuanced positive emotions
            "cautiously excited", "pleasantly surprised", "unexpectedly good",
            "better than expected", "genuinely impressed", "actually pretty great",
            "solid choice", "really growing on me", "warming up to it",
            "getting better", "promising start", "on the right track"
        ],
        neg: [
            "frustrated", "annoyed", "angry", "disappointed", "fed up",
            "pissed off", "irritated", "upset", "furious", "done with this",
            "hate it", "terrible", "awful", "useless", "broken",
            
            // Modern internet negative emotions
            "big yikes", "major L", "took an L", "this ain't it chief",
            "absolutely not", "hard pass", "straight up disrespectful",
            "the audacity", "I'm pressed", "lowkey heated", "highkey mad",
            "absolutely cooked", "sent to the shadow realm", "violence",
            "personally attacked", "catching strays", "absolutely done",
            "pack it up", "delete this", "touch grass moment",
            
            // Nuanced negative emotions
            "mildly concerned", "slightly worried", "getting frustrated",
            "losing patience", "starting to doubt", "having second thoughts",
            "not feeling it", "kinda over it", "lowkey disappointed",
            "mixed feelings leaning negative", "cautiously pessimistic",
            "reserved but concerned", "hoping for improvement"
        ],
        neu: [
            "it's okay", "fine", "decent", "works", "functional",
            "average", "nothing special", "gets the job done", "adequate",
            "serviceable", "unremarkable", "standard", "typical", "normal",
            
            // Modern neutral emotions with personality
            "it's giving mid", "kinda mid", "exists I guess", "it's there",
            "no strong feelings", "jury's still out", "wait and see",
            "could go either way", "time will tell", "reserved judgment",
            "cautiously neutral", "withholding opinion", "baseline expectations",
            "does what it says on the tin", "meh", "shrug emoji",
            "no complaints no compliments", "it is what it is"
        ]
    },
    
    // Comments-specific vocabulary
    charity_causes: [
        "medical bills", "education fund", "disaster relief", "animal rescue",
        "community center", "local food bank", "homeless shelter", "environmental cleanup",
        "children's hospital", "scholarship fund", "youth programs", "senior care"
    ],
    
    wedding_phrases: [
        "beautiful ceremony", "perfect day", "lovely couple", "magical moment",
        "dream wedding", "gorgeous venue", "amazing celebration", "touching vows",
        "stunning bride", "handsome groom", "fairy tale wedding", "romantic setting"
    ],
    
    support_expressions: [
        "sending love", "thoughts and prayers", "here for you", "stay strong",
        "you've got this", "thinking of you", "rooting for you", "with you always",
        "sending positive vibes", "keeping you close", "praying for you", "much love"
    ],
    
    congratulations: [
        "congratulations", "so happy for you", "well deserved", "amazing achievement",
        "proud of you", "fantastic news", "wonderful news", "incredible accomplishment",
        "way to go", "you did it", "celebration time", "thrilled for you"
    ],
    
    // Tweet-specific vocabulary  
    announcement_starters: [
        "excited to announce", "proud to share", "thrilled to reveal", "big news",
        "important update", "breaking news", "just launched", "new release",
        "coming soon", "stay tuned", "major announcement", "exciting news"
    ],
    
    social_hashtags: [
        "#excited", "#grateful", "#milestone", "#teamwork", "#innovation",
        "#growth", "#success", "#community", "#grateful", "#blessed",
        "#announcement", "#news", "#update", "#launch", "#release"
    ],
    
    social_emojis: [
        "🎉", "🚀", "💪", "👀", "❤️", "🔥", "📈", "💯", "🙏", "🎯",
        "✨", "⚡", "🛠️", "😓", "🔧", "📋", "🤔", "👋", "📅", "📸"
    ],
    
    casual_reactions: [
        "this is sick", "absolutely love this", "can't even", "so pumped",
        "this slaps", "no cap", "literally crying", "I'm dead", "hits different",
        "not gonna lie", "low key obsessed", "high key amazing", "straight fire",
        
        // Expanded modern reactions
        "absolutely sends", "chef's kiss", "immaculate vibes", "pure serotonin",
        "dopamine hit", "endorphin rush", "living for this", "here for it",
        "stan this", "I worship", "bow down", "we love to see it",
        "as it should be", "deserved", "earned", "valid", "based",
        "cracked", "goated", "built different", "elite", "S-tier",
        "god tier", "legendary", "iconic", "revolutionary", "groundbreaking",
        
        // Internet slang reactions
        "bussin", "periodt", "slay", "ate and left no crumbs", "served",
        "understood the assignment", "passed the vibe check", "main character energy",
        "big mood", "mood af", "relatable content", "calling me out",
        "felt that", "spoke to my soul", "hit me in the feels",
        
        // Casual positive  
        "pretty neat", "kinda cool", "not bad", "solid stuff",
        "decent vibes", "good energy", "positive feels", "wholesome content",
        "clean", "crisp", "smooth", "buttery", "satisfying",
        
        // Enthusiastic but casual
        "yo this goes hard", "absolutely bangs", "certified banger",
        "this one hits", "straight up vibing", "major vibes", "big energy",
        "chaotic good energy", "unhinged in the best way"
    ],
    
    // Tracery patterns for core generation
    pos_core: [
        "#products# is genuinely really good",
        "loving #features# so far",
        "#products# totally #pos_verb#",
        "the #features# feature alone is worth it",
        "#products# exceeded my expectations"
    ],
    
    neg_core: [
        "#products# is completely damaged",
        "#features# #issues# constantly",
        "can't even get #features# to function",
        "#products# is the worst",
        "seriously considering switching because #features# #issues#"
    ],
    
    neu_core: [
        "#products# functions most of the time",
        "#features# is okay I guess",
        "no strong feelings about #products#",
        "#features# does what it's supposed to",
        "#products# is pretty average"
    ],
    
    pos_verb: [
        "functions perfectly", "saves time", "simplifies everything",
        "increases productivity", "solves our problems", "delivers value",
        "impresses clients", "streamlines workflows", "exceeds expectations"
    ],
    
    neg_verb: [
        "crashes constantly", "wastes time", "complicates everything",
        "blocks productivity", "creates problems", "loses data",
        "frustrates everyone", "breaks workflows", "fails expectations"
    ],
    
    neu_verb: [
        "operates sometimes", "functions adequately", "does the job",
        "meets requirements", "runs normally", "performs as expected"
    ],
    
    pos_point: [
        "it really does function well",
        "definitely worth trying",
        "huge improvement over before"
    ],
    
    neg_point: [
        "it's pretty frustrating",
        "lots of issues to fix",
        "needs serious work"
    ],
    
    pos_clause: [
        "the performance is great",
        "UI is intuitive",
        "support is responsive"
    ],
    
    neg_clause: [
        "the bugs are annoying",
        "interface is confusing",
        "support never responds"
    ],
    
    pos_short: [
        "love it", "functions great", "highly recommend"
    ],
    
    neg_short: [
        "damaged", "useless", "avoid"
    ],
    
    pos_wrap: [
        "Definitely recommend!",
        "Worth every penny.",
        "Game changer!"
    ],
    
    neg_wrap: [
        "Not recommended.",
        "Look elsewhere.",
        "Waste of money."
    ],
    
    neu_wrap: [
        "It's okay.",
        "Your mileage may vary.",
        "Depends on your needs."
    ],
    
    openings: [
        "Hi", "Hey", "Hello", "So", "Okay", "Right", "Look",
        "Quick question", "Need help", "FYI", "Just wanted to say"
    ],
    
    context: [
        "been using this for months",
        "just started yesterday",
        "our team relies on this",
        "testing for our company",
        "evaluating alternatives"
    ],
    
    details: [
        "specifically the part where",
        "especially when",
        "particularly with",
        "mainly around",
        "mostly concerning"
    ],
    
    short_burst: [
        "ugh", "seriously?", "come on", "finally", "yes!",
        "nope", "broken", "why", "how", "what even",
        "can't even", "done", "over it", "help", "please"
    ],
    
    // Support-specific patterns
    origin_support_pos: [
        "Hi team, quick question about #features# - it's working great but wondering if #pos_clause#?",
        "Love #products#! Just curious about #features# - any plans to enhance?",
        "#features# is fantastic, just need help with one small thing"
    ],
    
    origin_support_neg: [
        "URGENT: #products# #issues# and it's blocking our work. #features# completely broken!",
        "Help! #features# #issues# constantly. Tried everything. This is critical!",
        "Ticket #RAND5#: #products# has been down all day. #features# returns errors"
    ],
    
    origin_support_neu: [
        "Question about #features# - how do I configure it properly?",
        "Need assistance with #products# setup. Not sure about #features#",
        "Following up on #features# issue from last week"
    ],
    
    // Review-specific patterns
    origin_review_pos: [
        "5 stars! #products# #pos_verb# and the #features# is incredible. #pos_wrap#",
        "Been using #products# for months and it's fantastic. #features# alone makes it worth it.",
        "Switched from competitor and #products# is so much better. Love the #features#!"
    ],
    
    origin_review_neg: [
        "1 star. #products# #issues# constantly. The #features# is completely broken. #neg_wrap#",
        "Waste of money. #features# never works and #products# #neg_verb#. Switching back.",
        "Terrible experience. #products# promised so much but #features# #issues# daily."
    ],
    
    origin_review_neu: [
        "3 stars. #products# is okay. #features# works but nothing special. #neu_wrap#",
        "Average product. #products# does what it says but #features# could be better.",
        "Mixed feelings. Some parts like #features# work fine, others not so much."
    ],
    
    // Chat-specific patterns
    origin_chat_pos: [
        "yo #products# is actually sick! the #features# thing is 🔥",
        "anyone else loving #products#?? #features# works perfectly lol",
        "ngl #products# kinda slaps... #features# is smooth af"
    ],
    
    origin_chat_neg: [
        "bruh #products# is broken again... #features# #issues# smh",
        "#products# is trash rn. can't even use #features# 😤",
        "why does #features# keep breaking?? this is ridiculous"
    ],
    
    origin_chat_neu: [
        "anyone know how to use #features# in #products#?",
        "#products# is fine i guess. #features# works sometimes",
        "meh #products# is okay. nothing special about #features#"
    ],
    
    // Feedback-specific patterns
    origin_feedback_pos: [
        "Positive feedback on #products#: The #features# significantly #pos_verb#. Very impressed with the results.",
        "Great experience with #products#. #features# has improved our workflow considerably.",
        "Team loves #products#. The #features# feature is exactly what we needed."
    ],
    
    origin_feedback_neg: [
        "Concerning issues with #products#: #features# consistently #issues#. This is impacting productivity.",
        "Negative feedback: #products# has multiple problems. #features# is unreliable and needs immediate attention.",
        "Critical issue with #products# - the #features# feature #neg_verb#. Please prioritize fixes."
    ],
    
    origin_feedback_neu: [
        "Feedback on #products#: Generally functional but #features# could use improvement.",
        "Mixed experience with #products#. The #features# works adequately but has room for enhancement.",
        "Neutral assessment: #products# meets basic needs. #features# is standard."
    ],
    
    // Search query patterns
    origin_search_pos: [
        "#products# #features# awesome",
        "best #features# settings",
        "#products# tutorial"
    ],
    
    origin_search_neg: [
        "#products# #features# not working",
        "fix #features# error",
        "#products# #issues# help"
    ],
    
    origin_search_neu: [
        "how to use #features#",
        "#products# #features# guide",
        "#products# documentation"
    ],
    
    // Email patterns
    origin_email_pos: [
        "Hello,\n\nI wanted to share positive feedback about #products#. The #features# has been working excellently.\n\nBest regards",
        "Hi team,\n\nJust a quick note to say #products# is fantastic. Particularly impressed with #features#.\n\nThanks"
    ],
    
    origin_email_neg: [
        "Hello,\n\nWe're experiencing critical issues with #products#. The #features# #issues# repeatedly.\n\nPlease advise urgently.",
        "Hi,\n\nI need to report problems with #products#. #features# is not functioning properly.\n\nThis needs immediate attention."
    ],
    
    origin_email_neu: [
        "Hello,\n\nI have a question about #products#. Could you explain how #features# works?\n\nThank you",
        "Hi,\n\nRequesting information about #features# in #products#.\n\nLooking forward to your response."
    ],
    
    // Forum patterns
    origin_forum_pos: [
        "[SOLVED] #products# #features# is amazing!\n\nJust wanted to share that #pos_clause#. Really impressed.",
        "PSA: #products# actually works great\n\nBeen testing #features# and it #pos_verb#. Highly recommend!"
    ],
    
    // Comments patterns for charity/fundraiser/wedding sites
    origin_comments_pos: [
        "Congratulations! Wishing you all the best!",
        "So happy for you both! 💕",
        "This is amazing! Thanks for sharing your story.",
        "Beautiful cause! Donated and shared with friends.",
        "Thank you for making a difference in our community!",
        "Your wedding looks absolutely magical! ✨",
        "Such an inspiring journey. Keep up the great work!",
        "Congratulations on reaching your goal! Well deserved.",
        "This brought tears to my eyes. Thank you for everything you do.",
        "Amazing work! The community is lucky to have you."
    ],
    
    origin_comments_neg: [
        "Hope things get better soon.",
        "Sending prayers and positive thoughts.",
        "Sorry to hear about the challenges. Stay strong!",
        "Wish I could do more to help right now.",
        "This is heartbreaking. Hoping for better days ahead.",
        "Times are tough but don't give up.",
        "Sorry I can't contribute more at the moment.",
        "Praying for a positive outcome.",
        "Keep fighting the good fight. We're with you.",
        "Sending love and support during this difficult time."
    ],
    
    origin_comments_neu: [
        "Thanks for the update!",
        "Good luck with everything.",
        "Keeping you in my thoughts.",
        "Hope all goes well.",
        "Best wishes!",
        "Take care!",
        "Thinking of you.",
        "Wishing you success.",
        "Hope this helps!",
        "Stay safe!"
    ],
    
    // Tweet patterns for social media posts/announcements
    origin_tweet_pos: [
        "Excited to announce our latest milestone! 🎉 #grateful #milestone",
        "Just launched something amazing! Can't wait for you to try it 🚀",
        "Incredible news to share with our community! 💪 #teamwork",
        "Big announcement coming tomorrow! Stay tuned 👀 #exciting",
        "Celebrating an amazing achievement today! Thank you to everyone who made this possible ❤️",
        "Game-changing update just dropped! Check it out 🔥 #innovation",
        "Proud to share our latest success story! 📈 #growth",
        "Amazing feedback from our users today! Keep it coming 💯",
        "Just hit a major goal! Thank you for all the support 🙏 #grateful",
        "New feature alert! This one's a game changer 🎯 #newrelease"
    ],
    
    origin_tweet_neg: [
        "Experiencing some technical difficulties. Working on a fix! 🔧",
        "Unfortunately we need to postpone today's event. Sorry for the inconvenience.",
        "Having issues with our servers. Bear with us while we resolve this 😓",
        "Not the news we wanted to share, but transparency is important to us.",
        "Technical difficulties are affecting some users. We're on it! 🛠️",
        "Apologizing for the service disruption. Fix incoming ⚡",
        "Dealing with some unexpected challenges today. Updates to follow.",
        "Service is down for some users. Our team is working around the clock 💪",
        "Hit a snag with today's launch. Pushing back to ensure quality 📋",
        "Temporary setback but we'll bounce back stronger! 💪 #resilience"
    ],
    
    origin_tweet_neu: [
        "Just sharing some thoughts on the latest industry trends 🤔",
        "Interesting article about the future of our industry. What do you think?",
        "Regular maintenance scheduled for tonight. Brief downtime expected ⚙️",
        "Checking in with our community! How's everyone doing? 👋",
        "Quick reminder about our upcoming event next week 📅",
        "Sharing some behind-the-scenes content from our team 📸",
        "Reflecting on this week's progress. Solid steps forward 📊",
        "Random thought: what would you like to see from us next?",
        "Survey time! Help us improve by sharing your feedback 📝",
        "End of week recap: here's what we accomplished 📋"
    ],
    
    origin_forum_neg: [
        "[HELP] #products# #features# broken\n\nAnyone else having issues? It #issues# constantly. Error: #RAND_ERROR#",
        "[BUG] Major problem with #features#\n\n#products# has serious issues. #neg_clause#. Any workarounds?"
    ],
    
    origin_forum_neu: [
        "[QUESTION] How does #features# work in #products#?\n\nTrying to understand the functionality. Documentation unclear.",
        "[DISCUSSION] Thoughts on #products#?\n\nConsidering using it. How's the #features# feature?"
    ],
    
    // Fallback origin
    origin_neu: [
        "#products# is #neu_verb#. The #features# works as expected.",
        "Using #products# and it's fine. #features# does what it says.",
        "#products# - nothing special but functional. #features# is okay."
    ],
    
    // Missing pattern definitions that were causing placeholder bugs
    GREETING: [
        "Hi", "Hello", "Hey there", "Good morning", "Dear team", "Hi support",
        "To whom it may concern", "Greetings", "Hey", "Dear support team"
    ],
    
    PURPOSE: [
        "I'm writing regarding the platform", "I need help with this tool", 
        "I wanted to share feedback", "I have a question about the system",
        "I'm experiencing issues with", "I wanted to report a problem with",
        "I'm following up on", "I need assistance with", "I'm contacting you about"
    ],
    
    DETAILS: [
        "The feature has been working well", "I've been experiencing crashes",
        "The interface is confusing", "Performance has been slow",
        "The export function is broken", "Authentication keeps failing",
        "The dashboard won't load", "Data sync is not working"
    ],
    
    ACTION_NEEDED: [
        "Please let me know if there's a fix", "Could you help resolve this",
        "Please advise on next steps", "I'd appreciate your assistance",
        "Please provide guidance", "Can you help me troubleshoot this",
        "Please investigate this issue", "I need this resolved urgently"
    ],
    
    CLOSING: [
        "Best regards", "Thank you", "Thanks for your help", "Sincerely",
        "Looking forward to hearing from you", "Appreciate your time", "Cheers",
        "Thanks in advance", "Best", "Regards"
    ],
    
    RATING: [
        "5/5 stars", "4/5 stars", "3/5 stars", "2/5 stars", "1/5 stars",
        "★★★★★", "★★★★☆", "★★★☆☆", "★★☆☆☆", "★☆☆☆☆",
        "10/10", "8/10", "6/10", "4/10", "2/10"
    ],
    
    QUALITY: [
        "excellent", "good", "decent", "poor", "terrible",
        "outstanding", "solid", "mediocre", "disappointing", "awful",
        "fantastic", "reliable", "inconsistent", "unreliable", "broken"
    ],
    
    PERFORMANCE: [
        "loads quickly", "runs smoothly", "works as expected", "is slow", "crashes frequently",
        "performs well", "is responsive", "has issues", "is buggy", "is unstable",
        "exceeds expectations", "meets requirements", "needs improvement", "fails to deliver", "is unreliable"
    ],
    
    RECOMMENDATION: [
        "Highly recommend", "Would recommend", "Worth trying", "Not recommended", "Avoid",
        "Must have", "Great choice", "Decent option", "Look elsewhere", "Save your money",
        "Perfect for our needs", "Good value", "Overpriced", "Not worth it", "Complete waste"
    ],
    
    ASSESSMENT: [
        "it's been great", "it works well", "it's okay", "it's disappointing", "it's terrible",
        "very impressed", "pretty satisfied", "mixed feelings", "quite frustrated", "completely fed up",
        "exceeded expectations", "met expectations", "below expectations", "failed to deliver", "total disaster"
    ],
    
    IMPACT: [
        "This has improved our workflow", "It's saved us time", "No significant impact", 
        "It's slowed us down", "This has caused major problems",
        "Productivity increased", "Process streamlined", "Neutral effect", 
        "Efficiency decreased", "Operations disrupted"
    ],
    
    SUGGESTION: [
        "Keep up the good work", "Add more features", "Improve the documentation",
        "Fix the bugs", "Complete overhaul needed",
        "Minor improvements needed", "Consider user feedback", "Focus on stability",
        "Redesign the interface", "Start over from scratch"
    ],
    
    TAG: [
        "[HELP]", "[QUESTION]", "[BUG]", "[FEATURE REQUEST]", "[URGENT]",
        "[SOLVED]", "[ISSUE]", "[DISCUSSION]", "[FEEDBACK]", "[SUPPORT]"
    ],
    
    TITLE: [
        "System not responding", "Feature request", "Login problems", "Data export issues",
        "Performance problems", "Interface questions", "Configuration help needed",
        "Integration difficulties", "Billing questions", "Account access issues"
    ],
    
    ISSUE_DETAIL: [
        "getting 500 errors", "can't login", "export is broken", "dashboard won't load",
        "sync keeps failing", "search not working", "reports are empty", "permissions are wrong",
        "notifications don't work", "mobile app crashes"
    ],
    
    QUESTION: [
        "Anyone else seeing this?", "Any workarounds?", "How do I fix this?", "Is this expected?",
        "What am I doing wrong?", "Any suggestions?", "How long until this is fixed?",
        "Is there an alternative?", "Can someone help?", "What's the status?"
    ],
    
    CONTEXT: [
        "using for the past month", "new to this platform", "testing for our team",
        "been a user for years", "evaluating options", "recent upgrade", "beta testing",
        "production environment", "trial period", "enterprise setup"
    ],
    
    SHORT_THOUGHT: [
        "functions great", "totally damaged", "pretty good", "kinda meh", "love it",
        "hate this", "so-so", "amazing", "awful", "perfect", "terrible", "decent"
    ],
    
    EMOJI: [
        "😀", "😕", "😍", "😡", "🤔", "👍", "👎", "🔥", "💯", "😤", "✨", "💩"
    ],
    
    timeframe: [
        "the past few months", "about a week", "several years", "a couple days",
        "the last month", "over a year", "just a few hours", "quite some time"
    ],
    
    assessment: [
        "it's been fantastic", "it's working well", "mixed results", "quite disappointed", "absolutely terrible",
        "really impressed", "pretty happy", "it's okay", "somewhat frustrated", "completely broken"
    ],
    
    quality: [
        "excellent", "really good", "decent", "below average", "absolutely terrible",
        "outstanding", "solid", "acceptable", "poor", "complete garbage"
    ],
    
    comparison: [
        "Much better than before", "Similar to competitors", "Worse than expected",
        "Best in class", "Needs significant improvement", "On par with others",
        "Exceeded my expectations", "Below industry standards"
    ],
    
    recommendation: [
        "Definitely recommend", "Worth considering", "Proceed with caution", "Would not recommend", "Avoid at all costs",
        "Must have tool", "Good option", "There are better alternatives", "Save your money", "Look elsewhere"
    ],
    
    greeting: [
        "Hi", "Hello", "Hey", "Dear team", "Good morning", "Hi there",
        "To the team", "Hey everyone", "Dear support", "Hello team"
    ],
    
    mainPoint: [
        "I've been having trouble with the login system", "The dashboard has been acting up",
        "I wanted to share some feedback", "There seems to be an issue with exports",
        "I have a question about pricing", "The mobile app keeps crashing",
        "I can't access my account", "The API documentation is unclear"
    ],
    
    supportingDetail: [
        "This happens every time I try to log in", "It started after the recent update",
        "Several team members are experiencing this", "This is blocking our work",
        "I've tried the troubleshooting steps", "The error message is unclear",
        "This worked fine before", "Other users report the same issue"
    ],
    
    closing: [
        "Thanks for your help", "Please let me know", "I appreciate your assistance",
        "Looking forward to a solution", "Thanks in advance", "Please advise",
        "Hope to hear back soon", "Any help is appreciated"
    ],
    
    specs: [
        "Chrome 91, Windows 10", "Safari 14, macOS Big Sur", "Firefox 89, Ubuntu 20.04",
        "Edge 91, Windows 11", "Chrome 90, Android 11", "Safari 13, iOS 14",
        "Chrome 92, macOS Monterey", "Firefox 88, Windows 10"
    ],
    
    detailed_problem: [
        "Login button doesn't respond", "Dashboard shows blank page", "Export generates empty file",
        "Search returns no results", "Notifications don't appear", "Settings won't save",
        "Mobile app crashes on startup", "Sync fails with error 500"
    ],
    
    steps: [
        "1. Navigate to dashboard 2. Click export 3. Select CSV format 4. Error appears",
        "1. Open app 2. Enter credentials 3. Click login 4. Nothing happens",
        "1. Go to settings 2. Change notification preferences 3. Click save 4. Changes revert",
        "1. Access mobile app 2. Attempt sync 3. Wait for completion 4. Sync fails"
    ],
    
    troubleshooting: [
        "clearing cache", "restarting the browser", "checking network connection",
        "updating the app", "logging out and back in", "disabling extensions",
        "trying incognito mode", "restarting the device"
    ],
    
    urgency: [
        "critical", "urgent", "high priority", "blocking", "time-sensitive",
        "important", "needs immediate attention", "affecting production"
    ],
    
    performance: [
        "works perfectly", "performs well", "has some issues", "is quite slow", "completely fails",
        "exceeds expectations", "meets requirements", "needs improvement", "is unreliable", "doesn't work"
    ],
    
    concern: [
        "the interface could be clearer", "response times are slow", "some features are missing",
        "documentation is lacking", "bugs appear frequently", "stability is questionable",
        "user experience needs work", "performance could be better"
    ],
    
    improvement: [
        "add better error messages", "improve loading times", "enhance the user interface",
        "provide more documentation", "fix the existing bugs", "add missing features",
        "optimize performance", "simplify the workflow"
    ],
    
    // Complex Origin Patterns (from phrases-bak.js)
    
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
        "10/10 would buy again",
        
        // Modern positive reactions
        "chef's kiss perfect", "absolutely sends me", "living my best life",
        "main character energy", "understood the assignment completely",
        "passed the vibe check with flying colors", "elite tier quality",
        "S-tier performance", "god tier execution", "built different",
        "no cap the best", "deadass amazing", "fr fr impressed",
        "lowkey obsessed", "highkey in love", "absolutely here for it",
        "we love to see it", "as it should be", "deserved success",
        
        // Nuanced positive reactions
        "pleasantly surprised", "better than expected", "genuinely solid",
        "cautiously optimistic turned full believer", "skeptical but converted",
        "reluctantly impressed", "hate to admit but it's good",
        "exceeded my admittedly low expectations", "proved me wrong",
        "growing on me", "warming up to it", "getting better over time"
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
        "learned my lesson",
        
        // Modern negative reactions
        "this ain't it chief", "absolutely not", "hard pass forever",
        "took the biggest L", "major L energy", "straight up disrespectful",
        "the audacity", "actually offensive", "personally attacked",
        "violence", "war crime levels of bad", "should be illegal",
        "delete this from existence", "pack it up", "log off energy",
        "touch grass immediately", "unhinged behavior", "chaotic evil",
        
        // Internet culture negative
        "big yikes energy", "cringe compilation material", "secondhand embarrassment",
        "giving me the ick", "red flag city", "toxic waste dump",
        "dumpster fire situation", "cursed experience", "nightmare fuel",
        "absolutely cooked", "sent to the shadow realm", "ratio deserved",
        
        // Nuanced negative reactions  
        "slowly losing faith", "growing concerns", "red flags everywhere",
        "mixed feelings leaning negative", "cautiously pessimistic",
        "benefit of the doubt expired", "patience wearing thin",
        "giving one last chance", "on thin ice", "final warning territory"
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
        "works for now",
        
        // Modern neutral reactions
        "it's giving mid", "lowkey mid energy", "baseline vibes",
        "no strong feelings either way", "neutral territory",
        "shrug emoji energy", "meh tier", "B-tier at best",
        "does what it says on the tin", "bare minimum achieved",
        "exists and that's about it", "it's there",
        
        // Nuanced neutral reactions
        "cautiously watching", "wait and see approach", "provisional approval",
        "qualified optimism", "reserved enthusiasm", "tentative support",
        "conditional endorsement", "preliminary assessment positive",
        "early days but promising", "room for improvement",
        "solid foundation to build on", "potential is there",
        "could go either way", "50/50 on this", "coin flip situation"
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
    ],
    
    // Helper function for ticket IDs
    TICKET_ID: () => {
        const prefix = ['TKT', 'CASE', 'REQ', 'INC', 'BUG'];
        const p = prefix[Math.floor(Math.random() * prefix.length)];
        const num = Math.floor(10000 + Math.random() * 90000);
        return `${p}-${num}`;
    },
    
    // Helper functions for random values
    RAND5: () => Math.floor(10000 + Math.random() * 90000),
    RAND_ERROR: () => {
        const errors = ["404 Not Found", "500 Internal Server Error", "403 Forbidden", "Connection Timeout"];
        return errors[Math.floor(Math.random() * errors.length)];
    }
};

// ============= Organic Pattern Library =============

export const ORGANIC_PATTERNS = {
    thoughtPatterns: {
        pos: [
            "okay so {product} is genuinely incredible",
            "i'm genuinely impressed with {feature}",
            "not gonna lie, this {feature} thing is amazing",
            "holy crap {product} really functions",
            "this is exactly what i needed"
        ],
        neg: [
            "i can't believe {product} is this damaged",
            "seriously {feature} {issue} AGAIN",
            "{product} is driving me insane",
            "why does {feature} never function properly",
            "this is absolutely ridiculous"
        ],
        neu: [
            "so {product} exists",
            "{feature} does what it says i guess",
            "using {product} for work stuff",
            "the {feature} is there",
            "it's a {product}"
        ]
    },
    
    interruptions: [
        "wait actually",
        "oh and another thing",
        "scratch that",
        "no wait",
        "actually forget what i said",
        "hold up",
        "okay but",
        "oh right"
    ],
    
    bursts: {
        excitement: {
            openings: ["OMG", "YES", "FINALLY", "Holy crap", "No way", "This is incredible"],
            emphasis: ["I'm not even joking", "literally perfect", "BEST THING EVER", "game changer"],
            closers: ["!!!!", "🎉", "I'm so happy", "Thank you!", "Love this"]
        },
        frustration: {
            openings: ["UGH", "SERIOUSLY??", "Come ON", "Are you KIDDING me", "For real?", "I can't"],
            emphasis: ["This is BROKEN", "Nothing works", "Complete disaster", "Waste of time"],
            closers: ["I'm done", "Fix this", "Unbelievable", "...", "Whatever"]
        },
        confusion: {
            openings: ["Wait what", "I don't understand", "Huh?", "Um", "So confused"],
            emphasis: ["makes no sense", "what is happening", "I'm lost", "help"],
            closers: ["???", "someone explain", "idk anymore", "...", "nevermind"]
        }
    },
    
    transitions: [
        "so yeah",
        "but like", 
        "the thing is",
        "also",
        "oh and",
        "speaking of which",
        "btw",
        "side note",
        "quick tangent",
        "meanwhile",
        "actually",
        "honestly",
        "basically",
        "essentially",
        "incidentally"
    ],
    
    fragments: {
        incomplete: [
            "i was gonna",
            "trying to",
            "can't even",
            "supposed to",
            "thought it would",
            "expected",
            "hoping for",
            "wanted to"
        ],
        short: [
            "broken",
            "why",
            "how",
            "nope",
            "done",
            "help",
            "please",
            "ugh",
            "finally",
            "yes"
        ]
    },
    
    authenticity: {
        selfCorrections: [
            "I mean",
            "or rather",
            "well actually",
            "wait no",
            "let me rephrase"
        ],
        fillers: [
            "like",
            "you know",
            "basically",
            "sort of",
            "kind of",
            "or whatever",
            "and stuff",
            "I guess"
        ],
        asides: [
            "(not even joking)",
            "(true story)",
            "(yes really)",
            "(I checked)",
            "(multiple times)"
        ]
    },
    
    openings: {
        support: [
            "Hi support team",
            "Need help with something",
            "Quick question",
            "Having an issue",
            "Urgent request"
        ],
        review: [
            "Been using this for a while",
            "Just wanted to share",
            "My experience so far",
            "Honest review",
            "Real talk"
        ],
        chat: [
            "hey",
            "yo",
            "sup",
            "anyone here?",
            "quick q"
        ],
        feedback: [
            "Wanted to provide feedback",
            "Some thoughts",
            "Observations from usage",
            "Points to consider",
            "User feedback"
        ],
        email: [
            "Hello,",
            "Hi team,",
            "Good morning,",
            "Dear support,",
            "To whom it may concern,"
        ],
        forum: [
            "[HELP]",
            "[QUESTION]",
            "[BUG]",
            "[SOLVED]",
            "PSA:"
        ],
        search: [
            "",
            "how to",
            "fix",
            "error",
            "tutorial"
        ],
        comments: [
            "",
            "Wow!",
            "Amazing!",
            "Just wanted to say",
            "This is so",
            "Absolutely"
        ],
        tweet: [
            "",
            "Just",
            "Currently",
            "Breaking:",
            "Update:",
            "PSA:"
        ],
        default: [
            "So",
            "Okay",
            "Right",
            "Well",
            "Look"
        ]
    },
    
    addons: {
        pos: [
            "Really happy with this",
            "Exceeded expectations",
            "Would recommend",
            "Great job team",
            "Keep it up"
        ],
        neg: [
            "This needs work",
            "Very disappointed",
            "Expected better",
            "Not acceptable",
            "Please fix"
        ],
        neu: [
            "It's fine",
            "Room for improvement",
            "Does the job",
            "Nothing special",
            "Average"
        ]
    },
    
    closings: {
        pos: [
            "Thanks!",
            "Appreciate it!",
            "Love it!",
            "Great work!",
            "Keep it up!"
        ],
        neg: [
            "Please help",
            "Fix this",
            "Not happy",
            "Disappointed",
            "..."
        ],
        neu: [
            "Thanks",
            "FYI",
            "Just saying",
            "Cheers",
            "That's all"
        ]
    }
};

// ============= Generation Patterns =============

export const GENERATION_PATTERNS = {
    structures: {
        support: [
            { pattern: "#openings#", probability: 0.9, transition: true },
            { pattern: "#context#", probability: 0.6, transition: true },
            { pattern: "#products# #issues#", probability: 0.95, transition: false },
            { pattern: "#details#", probability: 0.5, transition: true },
            { pattern: "Please help", probability: 0.8, transition: false }
        ],
        review: [
            { pattern: "Rating: #RATING#", probability: 0.7, transition: true },
            { pattern: "#context#", probability: 0.8, transition: true },
            { pattern: "#products# is #QUALITY#", probability: 0.95, transition: true },
            { pattern: "#features# #PERFORMANCE#", probability: 0.9, transition: true },
            { pattern: "#RECOMMENDATION#", probability: 0.85, transition: false }
        ],
        chat: [
            { pattern: "#GREETING#", probability: 0.6, transition: false },
            { pattern: "#SHORT_THOUGHT#", probability: 0.95, transition: false },
            { pattern: "#EMOJI#", probability: 0.4, transition: false }
        ],
        feedback: [
            { pattern: "Feedback on #products#:", probability: 0.8, transition: true },
            { pattern: "#features# #ASSESSMENT#", probability: 0.95, transition: true },
            { pattern: "#IMPACT#", probability: 0.7, transition: true },
            { pattern: "#SUGGESTION#", probability: 0.6, transition: false }
        ],
        email: [
            { pattern: "#GREETING#", probability: 1, transition: true },
            { pattern: "#PURPOSE#", probability: 0.95, transition: true },
            { pattern: "#DETAILS#", probability: 0.9, transition: true },
            { pattern: "#ACTION_NEEDED#", probability: 0.7, transition: true },
            { pattern: "#CLOSING#", probability: 0.95, transition: false }
        ],
        forum: [
            { pattern: "#TAG#", probability: 0.8, transition: true },
            { pattern: "#TITLE#", probability: 1, transition: true },
            { pattern: "#CONTEXT#", probability: 0.7, transition: true },
            { pattern: "#ISSUE_DETAIL#", probability: 0.95, transition: true },
            { pattern: "#QUESTION#", probability: 0.6, transition: false }
        ],
        search: [
            { pattern: "#QUERY#", probability: 1, transition: false }
        ],
        comments: [
            { pattern: "#congratulations#", probability: 0.7, transition: true },
            { pattern: "#support_expressions#", probability: 0.8, transition: true },
            { pattern: "#social_emojis#", probability: 0.4, transition: false }
        ],
        tweet: [
            { pattern: "#announcement_starters#", probability: 0.6, transition: true },
            { pattern: "#casual_reactions#", probability: 0.5, transition: true },
            { pattern: "#social_hashtags#", probability: 0.8, transition: true },
            { pattern: "#social_emojis#", probability: 0.7, transition: false }
        ],
        default: [
            { pattern: "#products#", probability: 0.8, transition: true },
            { pattern: "#features#", probability: 0.7, transition: true },
            { pattern: "#OBSERVATION#", probability: 0.9, transition: false }
        ]
    },
    
    narratives: {
        support: [
            { template: "#greeting# I need help with #products#", optional: false },
            { template: "The #features# feature #issues# when I try to use it", optional: false },
            { template: "I've tried #troubleshooting# but nothing works", optional: true },
            { template: "This is #urgency# for our team", optional: true },
            { template: "Please advise on next steps", optional: false }
        ],
        review: [
            { template: "I've been using #products# for #timeframe#", optional: false },
            { template: "Overall, #assessment#", optional: false },
            { template: "The #features# is #quality#", optional: false },
            { template: "#comparison#", optional: true },
            { template: "#recommendation#", optional: false }
        ],
        feedback: [
            { template: "After using #products# extensively", optional: true },
            { template: "I wanted to share feedback on #features#", optional: false },
            { template: "It #performance# in most cases", optional: false },
            { template: "However, #concern#", optional: true },
            { template: "Suggestion: #improvement#", optional: true }
        ],
        email: [
            { template: "#greeting#", optional: false },
            { template: "I'm writing regarding #products#", optional: false },
            { template: "#mainPoint#", optional: false },
            { template: "#supportingDetail#", optional: true },
            { template: "#closing#", optional: false }
        ],
        forum: [
            { template: "#title#", optional: false },
            { template: "System specs: #specs#", optional: true },
            { template: "Issue: #detailed_problem#", optional: false },
            { template: "Steps to reproduce: #steps#", optional: true },
            { template: "Anyone else experiencing this?", optional: true }
        ],
        comments: [
            { template: "#congratulations#!", optional: true },
            { template: "#support_expressions# #social_emojis#", optional: false },
            { template: "Thank you for sharing this with us", optional: true }
        ],
        tweet: [
            { template: "#announcement_starters#", optional: true },
            { template: "#casual_reactions# #social_emojis#", optional: false },
            { template: "#social_hashtags#", optional: true }
        ]
    }
};

// Export everything
export default PHRASE_BANK;