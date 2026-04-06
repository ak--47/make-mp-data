/**
 * most of the time, the value of a property is a primitive
 */
type Primitives = string | number | boolean | Date | Record<string, any>;

/**
 * a "validValue" can be a primitive, an array of primitives, or a function that returns a primitive
 */
export type ValueValid = Primitives | ValueValid[] | (() => ValueValid);

/**
 * main config object for the entire data generation
 */
export interface Dungeon {
    // ── Core Parameters ──
    /** Mixpanel project token. If provided, data will be imported to Mixpanel after generation. */
    token?: string;
    /** RNG seed for reproducible output. Same seed + concurrency=1 = identical data. */
    seed?: string;
    /** Number of days the dataset spans (from "now" looking backward). Default: 30 */
    numDays?: number;
    /** Explicit start of dataset window (unix seconds). Alternative to numDays. */
    epochStart?: number;
    /** Explicit end of dataset window (unix seconds). Defaults to FIXED_NOW. */
    epochEnd?: number;
    /** Target total number of events to generate across all users. */
    numEvents?: number;
    /** Number of unique users to generate. */
    numUsers?: number;
    /** Output format for files written to disk. */
    format?: "csv" | "json" | "parquet" | string;
    /** Mixpanel data residency region. */
    region?: "US" | "EU";
    /** User generation concurrency. Default: 1. Values > 1 break seed reproducibility and provide no performance benefit (CPU-bound). */
    concurrency?: number;
    /** Number of records before auto-flushing to disk. Prevents OOM for large datasets. Default: 1,000,000 */
    batchSize?: number;

    // ── Mixpanel Import Credentials (for SCD import) ──
    serviceAccount?: string;
    serviceSecret?: string;
    projectId?: string;

    // ── Identifiers ──
    /** Dataset name prefix for output files. Auto-generated if not set. */
    name?: string;

    // ── Feature Switches ──
    /** If true, users have no distinct_id (anonymous-only tracking). */
    isAnonymous?: boolean;
    /** If true, user profiles include avatar URLs. */
    hasAvatar?: boolean;
    /** If true, events include geo properties (city, region, country, lat/lng). */
    hasLocation?: boolean;
    /** If true, events include UTM campaign properties. */
    hasCampaigns?: boolean;
    /** If true, generates ad spend data (impressions, clicks, cost). */
    hasAdSpend?: boolean;
    /** If true, device pool includes iOS devices. */
    hasIOSDevices?: boolean;
    /** If true, device pool includes Android devices. */
    hasAndroidDevices?: boolean;
    /** If true, device pool includes desktop devices. */
    hasDesktopDevices?: boolean;
    /** If true, events include browser properties. */
    hasBrowser?: boolean;
    /** If true (default), writes output files to ./data/. Can also be a directory path string. */
    writeToDisk?: boolean | string;
    /** If true, gzip-compresses output files. */
    gzip?: boolean;
    /** If true, prints progress to stdout during generation. */
    verbose?: boolean;
    /** If true, users get anonymous device IDs in addition to distinct_id. */
    hasAnonIds?: boolean;
    /** If true, users get session IDs attached to events. */
    hasSessionIds?: boolean;
    /** If true, auto-generates funnels from the events array in addition to any explicit funnels. */
    alsoInferFunnels?: boolean;
    /** Restrict all location data to a single country (e.g., "US", "GB"). */
    singleCountry?: string;
    /** If true, stops generation at exactly numEvents (forces concurrency=1). Without this, event count is approximate. */
    strictEventCount?: boolean;
    /** Internal flag for UI-triggered jobs (affects SCD credential handling). */
    isUIJob?: boolean;

    // ── Data Models ──
    /** Event definitions: names, weights, properties, and behavioral flags. */
    events?: EventConfig[];
    /** Properties that appear on EVERY event (e.g., platform, app_version). */
    superProps?: Record<string, ValueValid>;
    /** Funnel definitions: conversion sequences, rates, ordering strategies. */
    funnels?: Funnel[];
    /** User profile properties set once per user. */
    userProps?: Record<string, ValueValid>;
    /** Slowly Changing Dimension properties: time-series mutations of user/group attributes. */
    scdProps?: Record<string, SCDProp>;
    /** Mirror dataset definitions: create transformed copies of event data. */
    mirrorProps?: Record<string, MirrorProps>;
    /** Group analytics keys. Format: [key, numGroups] or [key, numGroups, [associatedEvents]]. */
    groupKeys?: [string, number][] | [string, number, string[]][];
    /** Properties for each group key's entities. */
    groupProps?: Record<string, Record<string, ValueValid>>;
    /** Group-level events (stub — not yet implemented). */
    groupEvents?: GroupEventConfig[];
    /** Lookup table definitions for dimension tables. */
    lookupTables?: LookupTableSchema[];
    /** TimeSoup configuration: controls the temporal distribution of events (peaks, deviation, mean). */
    soup?: soup;
    /** Hook function called on every data point. The primary mechanism for engineering deliberate trends and patterns. */
    hook?: Hook<any>;

    /** Allow arbitrary additional properties on the config. */
    [key: string]: any;

    // ── Distribution Controls ──
    /** Percentage of users whose account creation falls within the dataset window (vs. pre-existing). Default: 15 */
    percentUsersBornInDataset?: number;
    /** Bias toward recent birth dates for users born in dataset (0 = uniform, 1 = heavily recent). Default: 0.3 */
    bornRecentBias?: number;
}

export type SCDProp = {
    /** Entity type this SCD applies to. "user" for user profiles; use a group key (e.g., "company_id") for group SCDs. Default: "user" */
    type?: string | "user" | "company_id" | "team_id" | "department_id";
    /** How often the property mutates. Default: "day" */
    frequency?: "day" | "week" | "month" | "year";
    /** Array of possible values, or a function that returns values. */
    values: ValueValid;
    /** "fixed" = mutations at clean boundaries (start of day/week/month/year). "fuzzy" = mutations at any time. Default: "fuzzy" */
    timing?: "fixed" | "fuzzy";
    /** Maximum number of mutations per entity. Default: 10 */
    max?: number;
};

/**
 * the soup is a set of parameters that determine the distribution of events over time
 */
type soup = {
    /** Controls clustering tightness. Higher = tighter peaks. Default: 2 */
    deviation?: number;
    /** Number of time clusters to distribute events across. Default: dynamic (numDays/7, minimum 5) */
    peaks?: number;
    /** Offset for the normal distribution center within each peak. Default: 0 */
    mean?: number;
};

/**
 * Hook types and when they fire (in order per user):
 * - "user"        — user profile object (mutate in-place, return ignored)
 * - "scd-pre"     — array of SCD entries (mutate in-place OR return new array to replace)
 * - "funnel-pre"  — funnel config object (mutate conversionRate, timeToConvert, etc. in-place)
 * - "event"       — single event with FLAT properties (return value replaces event)
 * - "funnel-post" — array of generated funnel events (mutate in-place, splice to inject)
 * - "everything"  — array of ALL events for one user (return array to replace; meta.profile available)
 *
 * Storage-only hooks (fire during hookPush, not in generators):
 * - "ad-spend", "group", "mirror", "lookup"
 */
export type hookTypes =
    | "event"
    | "user"
    | "group"
    | "lookup"
    | "scd"
    | "scd-pre"
    | "mirror"
    | "funnel-pre"
    | "funnel-post"
    | "ad-spend"
    | "churn"
    | "group-event"
    | "everything"
    | "";

/**
 * A hook function that receives every piece of data as it flows through the pipeline.
 * @param record - The data being processed (event, profile, array of events, etc.)
 * @param type - Which hook type is firing
 * @param meta - Contextual metadata (varies by type; "everything" includes meta.profile and meta.scd)
 */
export type Hook<T> = (record: any, type: hookTypes, meta: any) => T;

export interface hookArrayOptions<T> {
    hook?: Hook<T>;
    type?: hookTypes;
    filename?: string;
    format?: "csv" | "json" | "parquet" | string;
    concurrency?: number;
    context?: Context;
    [key: string]: any;
}

/**
 * an enriched array is an array that has a hookPush method that can be used to transform-then-push items into the array
 */
export interface HookedArray<T> extends Array<T> {
    hookPush: (item: T | T[], ...meta: any[]) => any;
    flush: () => void;
    getWriteDir: () => string;
    getWritePath: () => string;
    [key: string]: any;
}

export type AllData =
    | HookedArray<EventSchema>
    | HookedArray<UserProfile>
    | HookedArray<GroupProfileSchema>
    | HookedArray<LookupTableSchema>
    | HookedArray<SCDSchema>
    | any[];

/**
 * the storage object is a key-value store that holds arrays of data
 */
export interface Storage {
    eventData?: HookedArray<EventSchema>;
    mirrorEventData?: HookedArray<EventSchema>;
    userProfilesData?: HookedArray<UserProfile>;
    adSpendData?: HookedArray<EventSchema>;
    groupProfilesData?: HookedArray<GroupProfileSchema>[];
    lookupTableData?: HookedArray<LookupTableSchema>[];
    scdTableData?: HookedArray<SCDSchema>[];
    groupEventData?: HookedArray<EventSchema>;
}

/**
 * Runtime state for tracking execution metrics and flags
 */
export interface RuntimeState {
    operations: number;
    eventCount: number;
    userCount: number;
    isBatchMode: boolean;
    verbose: boolean;
}

/**
 * Default data factories for generating realistic test data
 */
export interface Defaults {
    locationsUsers: () => any[];
    locationsEvents: () => any[];
    iOSDevices: () => any[];
    androidDevices: () => any[];
    desktopDevices: () => any[];
    browsers: () => any[];
    campaigns: () => any[];
    devicePools: { android: any[]; ios: any[]; desktop: any[] };
    allDevices:any[];
}

/**
 * Context object that replaces global variables with dependency injection
 * Contains validated config, storage containers, defaults, and runtime state
 */
export interface Context {
    config: Dungeon;
    storage: Storage | null;
    defaults: Defaults;
    campaigns: any[];
    runtime: RuntimeState;
    FIXED_NOW: number;
    FIXED_BEGIN?: number;
    TIME_SHIFT_SECONDS: number;
    MAX_TIME: number;

    // State update methods
    incrementOperations(): void;
    incrementEvents(): void;
    incrementUsers(): void;
    setStorage(storage: Storage): void;

    // State getter methods
    getOperations(): number;
    getEventCount(): number;
    getUserCount(): number;
    incrementUserCount(): void;
    incrementEventCount(): void;
    isBatchMode(): boolean;

    // Time helper methods
    getTimeShift(): number;
    getDaysShift(): number;
}

/**
 * how we define events and their properties
 */
export interface EventConfig {
    /** The event name (e.g., "page viewed", "purchase completed"). */
    event?: string;
    /** Relative frequency weight (1-10). Higher = more likely to be selected. Used for both standalone event selection and funnel sequence building. Default: 1 */
    weight?: number;
    /** Properties to attach to this event type. Values can be arrays (random pick), functions, or primitives. */
    properties?: Record<string, ValueValid>;
    /** If true, this is the user's first-ever event (e.g., "sign up"). Used to create onboarding funnels. */
    isFirstEvent?: boolean;
    /** If true, generating this event signals the user has churned. The user stops producing further events unless returnLikelihood allows them to come back. */
    isChurnEvent?: boolean;
    /** Probability (0-1) that a churned user returns and continues generating events. 0 = permanent churn, 1 = always returns. Only used when isChurnEvent is true. Default: 0 */
    returnLikelihood?: number;
    /** If true, this event is automatically prepended 15 seconds before each funnel sequence (e.g., "$session_started"). */
    isSessionStartEvent?: boolean;
    /** Internal: timing offset in milliseconds (set by funnel system, not user-configured). */
    relativeTimeMs?: number;
    /** If true, this event is excluded from auto-generated funnels (inferFunnels and catch-all). Use for system events that shouldn't appear in conversion sequences. */
    isStrictEvent?: boolean;
}

export interface GroupEventConfig extends EventConfig {
    frequency: number; //how often the event occurs (in days)
    group_key: string; //the key that the group is based on
    attribute_to_user: boolean; //if true, the event also goes to a user
    group_size: number; //the number of users in the group
}

/**
 * the generated event data
 */
export interface EventSchema {
    event: string;
    time: string;
    source: string;
    insert_id: string;
    device_id?: string;
    session_id?: string;
    user_id?: string;
    [key: string]: ValueValid;
}

/**
 * how we define funnels and their properties
 */
export interface Funnel {
    /**
     * the name of the funnel
     */
    name?: string;
    /**
     * the description of the funnel
     */
    description?: string;
    /**
     * the sequence of events that define the funnel
     */
    sequence: string[];
    /**
     * how likely the funnel is to be selected
     */
    weight?: number;
    /**
     * If true, the funnel will be the first thing the user does
     */
    isFirstFunnel?: boolean;
    /**
     * If true, the funnel will require the user to repeat the sequence of events in order to convert
     * If false, the user does not need to repeat the sequence of events in order to convert
     * ^ when false, users who repeat the repetitive steps are more likely to convert
     */
    requireRepeats?: boolean;
    /**
     * how the events in the funnel are ordered for each user
     */
    order?:
        | "sequential"
        | "first-fixed"
        | "last-fixed"
        | "random" //totally shuffled
        | "first-and-last-fixed"
        | "middle-fixed"
        | "interrupted"
        | string;

    /**
     * the likelihood that a user will convert (0-100%)
     */
    conversionRate?: number;
    /**
     * the time it takes (on average) to convert in hours
     */
    timeToConvert?: number;
    /**
     * funnel properties go onto each event in the funnel and are held constant
     */
    props?: Record<string, ValueValid>;
    /**
     * funnel conditions (user properties) are used to filter users who are eligible for the funnel
     * these conditions must match the current user's profile for the user to be eligible for the funnel
     */
    conditions?: Record<string, ValueValid>;
	/**
	 * If true, the funnel will be part of an experiment where we generate 3 variants of the funnel with different conversion rates
	 *
	 */
	experiment?: boolean;
	/**
	 * optional: if set, in sequential funnels, this will determine WHEN the property is bound to the rest of the events in the funnel
	 */
	bindPropsIndex?: number;
}

/**
 * mirror props are used to show mutations of event data over time
 * there are different strategies for how to mutate the data
 */
export interface MirrorProps {
    /**
     * the event that will be mutated in the new version
     */
    events?: string[] | "*";
    /**
     * "create" - create this key in the new version; value are chosen
     * "update" - update this key in the new version; values are chosen
     * "fill" - update this key in the new version, but only if the existing key is null or unset
     * "delete" - delete this key in the new version; values are ignored
     */
    strategy?: "create" | "update" | "fill" | "delete" | "";
    values?: ValueValid[];
    /**
     * optional: for 'fill' mode, daysUnfilled will dictate where the cutoff is in the unfilled data
     */
    daysUnfilled?: number;
}

export interface UserProfile {
    name?: string;
    email?: string;
    avatar?: string;
    created: string | undefined;
    distinct_id: string;
    [key: string]: ValueValid;
}

export interface Person {
    name: string;
    email?: string;
    avatar?: string;
    created: string | undefined;
    anonymousIds: string[];
    sessionIds: string[];
    distinct_id?: string;
}

/**
 * the generated user data
 */
export interface LookupTableSchema {
    key: string;
    entries: number;
    attributes: Record<string, ValueValid>;
}

export interface LookupTableData {
    key: string;
    data: any[];
}

export interface SCDSchema {
    distinct_id: string;
    insertTime: string;
    startTime: string;
    [key: string]: ValueValid;
}

export interface GroupProfileSchema {
    key: string;
    data: any[];
}

/**
 * the end result of importing data into mixpanel
 */
export interface ImportResults {
    events: ImportResult;
    users: ImportResult;
    groups: ImportResult[];
}
type ImportResult = import("mixpanel-import").ImportResults;

/**
 * the end result of the data generation
 */
export type Result = {
    eventData: EventSchema[];
    mirrorEventData: EventSchema[];
    userProfilesData: any[];
    scdTableData: any[][];
    adSpendData: EventSchema[];
    groupProfilesData: GroupProfileSchema[][];
    lookupTableData: LookupTableData[][];
    importResults?: ImportResults;
    files?: string[];
    time?: {
        start: number;
        end: number;
        delta: number;
        human: string;
    };
    operations?: number;
    eventCount?: number;
    userCount?: number;
    groupCount?: number;
    avgEPS?: number;
};

/**
 * Mixpanel Data Generator
 * model events, users, groups, and lookup tables (and SCD props!)
 * @example
 * import datagenerator from 'make-mp-data';
 * const data = await datagenerator({...opts});
 */
declare function main(config: Dungeon): Promise<Result>;

export default main;

// ============= Text Generator Types =============

/**
 * Sentiment tone of generated text
 */
export type TextTone = "pos" | "neg" | "neu";

/**
 * Style of text generation
 * 
 * Supported styles:
 * - "support": Customer support tickets and requests
 * - "review": Product reviews and ratings
 * - "search": Search queries and keywords
 * - "feedback": User feedback and suggestions
 * - "chat": Casual chat messages and conversations
 * - "email": Formal email communications
 * - "forum": Forum posts and discussions
 * - "comments": Social media comments and reactions
 * - "tweet": Twitter-style social media posts
 */
export type TextStyle = "support" | "review" | "search" | "feedback" | "chat" | "email" | "forum" | "comments" | "tweet";

/**
 * Emotional intensity level
 */
export type TextIntensity = "low" | "medium" | "high";

/**
 * Language formality level
 */
export type TextFormality = "casual" | "business" | "technical";

/**
 * Output format for batch generation
 */
export type TextReturnType = "strings" | "objects";

/**
 * Domain-specific keywords to inject into generated text
 * 
 * Common predefined categories include:
 * - features: Product features to mention
 * - products: Product/company names  
 * - competitors: Competitor names for comparisons
 * - technical: Technical terms and jargon
 * - versions: Version numbers and releases
 * - errors: Specific error messages or codes
 * - metrics: Business metrics or KPIs
 * - events: Event types (e.g., 'wedding', 'celebration', 'conference')
 * - emotions: Emotional descriptors (e.g., 'inspiring', 'heartwarming')
 * - issues: Common problems or issues
 * - team: Team or role references
 * - business_impact: Business impact phrases
 * - comparisons: Comparison phrases
 * - credibility: Credibility markers
 * - user_actions: User action descriptions
 * - specific_praise: Specific positive details
 * - specific_issues: Specific negative details
 * - error_messages: Error message text
 * - categories: General categories
 * - brands: Brand names
 * - vendors: Vendor references
 * - services: Service types
 * - locations: Location references
 * 
 * Custom categories can be added as needed.
 */
export interface TextKeywordSet {
    /** Product features to mention */
    features?: string[];
    /** Product/company names */
    products?: string[];
    /** Competitor names for comparisons */
    competitors?: string[];
    /** Technical terms and jargon */
    technical?: string[];
    /** Version numbers and releases */
    versions?: string[];
    /** Specific error messages or codes */
    errors?: string[];
    /** Business metrics or KPIs */
    metrics?: string[];
    /** Event types (e.g., 'wedding', 'celebration', 'conference') */
    events?: string[];
    /** Emotional descriptors (e.g., 'inspiring', 'heartwarming') */
    emotions?: string[];
    /** Common problems or issues */
    issues?: string[];
    /** Team or role references */
    team?: string[];
    /** Business impact phrases */
    business_impact?: string[];
    /** Comparison phrases */
    comparisons?: string[];
    /** Credibility markers */
    credibility?: string[];
    /** User action descriptions */
    user_actions?: string[];
    /** Specific positive details */
    specific_praise?: string[];
    /** Specific negative details */
    specific_issues?: string[];
    /** Error message text */
    error_messages?: string[];
    /** General categories */
    categories?: string[];
    /** Brand names */
    brands?: string[];
    /** Vendor references */
    vendors?: string[];
    /** Service types */
    services?: string[];
    /** Location references */
    locations?: string[];
    /** Allow any custom keyword category */
    [key: string]: string[] | undefined;
}

/**
 * Configuration for text generator instance
 */
export interface TextGeneratorConfig {
    /** Default sentiment tone */
    tone?: TextTone;
    /** Type of text to generate */
    style?: TextStyle;
    /** Emotional intensity */
    intensity?: TextIntensity;
    /** Language formality */
    formality?: TextFormality;
    /** Minimum text length in characters */
    min?: number;
    /** Maximum text length in characters */
    max?: number;
    /** RNG seed for reproducibility */
    seed?: string;
    /** Domain-specific keywords to inject */
    keywords?: TextKeywordSet;
    /** Probability of keyword injection (0-1) */
    keywordDensity?: number;
    /** Enable realistic typos */
    typos?: boolean;
    /** Base typo probability per word */
    typoRate?: number;
    /** Allow sentiment mixing for realism */
    mixedSentiment?: boolean;
    /** Amount of authentic markers (0-1) */
    authenticityLevel?: number;
    /** Add timestamps to some messages */
    timestamps?: boolean;
    /** Include user role/experience markers */
    userPersona?: boolean;
    /** Allow sentiment to drift during generation (0-1) */
    sentimentDrift?: number;
    /** Add metadata to generated text */
    includeMetadata?: boolean;
    /** How specific/detailed to make claims (0-1) */
    specificityLevel?: number;
    /** Filter near-duplicates */
    enableDeduplication?: boolean;
    /** Max generation attempts per item */
    maxAttempts?: number;
    // performanceMode removed - system is always optimized for speed + uniqueness
}

/**
 * Metadata for generated text
 */
export interface TextMetadata {
    /** Timestamp if enabled */
    timestamp?: string;
    /** Sentiment analysis score */
    sentimentScore?: number;
    /** Keywords that were injected */
    injectedKeywords?: string[];
    /** User persona information */
    persona?: Record<string, any>;
    /** Flesch reading ease score */
    readabilityScore?: number;
    /** Text style used */
    style?: TextStyle | string;
    /** Intensity level used */
    intensity?: TextIntensity | string;
    /** Formality level used */
    formality?: TextFormality | string;
}

/**
 * Simple generated text object (without metadata)
 */
export interface SimpleGeneratedText {
    /** The generated text */
    text: string;
    /** Actual tone of generated text */
    tone: TextTone | string;
}

/**
 * Generated text with metadata
 */
export interface GeneratedText {
    /** The generated text */
    text: string;
    /** Actual tone of generated text */
    tone: TextTone | string;
    /** Additional metadata */
    metadata?: TextMetadata;
}

/**
 * Options for batch text generation
 */
export interface TextBatchOptions {
    /** Number of items to generate */
    n: number;
    /** Output format */
    returnType?: TextReturnType;
    /** Override tone for this batch */
    tone?: TextTone;
    /** Generate related/coherent items */
    related?: boolean;
    /** Shared context/topic for related items */
    sharedContext?: string;
}

/**
 * Statistics for text generator performance
 */
export interface TextGeneratorStats {
    /** Configuration used */
    config: TextGeneratorConfig;
    /** Total items generated */
    generatedCount: number;
    /** Items that were duplicates */
    duplicateCount: number;
    /** Items that failed generation */
    failedCount: number;
    /** Average generation time per item */
    avgGenerationTime: number;
    /** Total generation time */
    totalGenerationTime: number;
}

/**
 * Text generator instance interface
 */
export interface TextGenerator {
    /** Generate a single text item */
    generateOne(): string | GeneratedText | null;
    /** Generate multiple text items in batch */
    generateBatch(options: TextBatchOptions): (string | GeneratedText | SimpleGeneratedText)[];
    /** Get generation statistics */
    getStats(): TextGeneratorStats;
}

/**
 * Creates a new text generator instance
 * @param config - Configuration options for the generator
 * @returns Text generator instance
 */
export declare function createTextGenerator(config?: TextGeneratorConfig): TextGenerator;

/**
 * Generate a batch of text items directly (standalone function)
 * @param options - Combined generator config and batch options
 * @returns Array of generated text items
 */
export declare function generateBatch(options: TextGeneratorConfig & TextBatchOptions): (string | GeneratedText | SimpleGeneratedText)[];

// ============= Additional Utility Types =============

/**
 * File path configuration for data generation output
 */
export interface WritePaths {
    eventFiles: string[];
    userFiles: string[];
    adSpendFiles: string[];
    scdFiles: string[];
    mirrorFiles: string[];
    groupFiles: string[];
    lookupFiles: string[];
    folder: string;
}

/**
 * Configuration for TimeSoup time distribution function
 */
export interface TimeSoupOptions {
    earliestTime?: number;
    latestTime?: number;
    peaks?: number;
    deviation?: number;
    mean?: number;
}

/**
 * Test context configuration for unit/integration tests
 */
export interface TestContext {
    config: Dungeon;
    storage: Storage | null;
    defaults: Defaults;
    campaigns: any[];
    runtime: RuntimeState;
    [key: string]: any;
}
