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
    // constants
    token?: string;
    seed?: string;
    numDays?: number;
    epochStart?: number;
    epochEnd?: number;
    numEvents?: number;
    numUsers?: number;
    format?: "csv" | "json" | "parquet" | string;
    region?: "US" | "EU";
    concurrency?: number;
    batchSize?: number;

    serviceAccount?: string;
    serviceSecret?: string;
    projectId?: string;

    // ids
    name?: string;

    //switches
    isAnonymous?: boolean;
    hasAvatar?: boolean;
    hasLocation?: boolean;
    hasCampaigns?: boolean;
    hasAdSpend?: boolean;
    hasIOSDevices?: boolean;
    hasAndroidDevices?: boolean;
    hasDesktopDevices?: boolean;
    hasBrowser?: boolean;
    writeToDisk?: boolean | string;
    gzip?: boolean;
    verbose?: boolean;
    hasAnonIds?: boolean;
    hasSessionIds?: boolean;
    alsoInferFunnels?: boolean;
    makeChart?: boolean | string;
    singleCountry?: string;

    //models
    events?: EventConfig[]; //| string[]; //can also be a array of strings
    superProps?: Record<string, ValueValid>;
    funnels?: Funnel[];
    userProps?: Record<string, ValueValid>;
    scdProps?: Record<string, SCDProp>;
    mirrorProps?: Record<string, MirrorProps>;
    groupKeys?: [string, number][] | [string, number, string[]][]; // [key, numGroups, [events]]
    groupProps?: Record<string, Record<string, ValueValid>>;
    groupEvents?: GroupEventConfig[];
    lookupTables?: LookupTableSchema[];
    soup?: soup;
    hook?: Hook<any>;

    //allow anything to be on the config
    [key: string]: any;

    //probabilities
    percentUsersBornInDataset?: number;
}

export type SCDProp = {
    type?: string | "user" | "company_id" | "team_id" | "department_id";
    frequency: "day" | "week" | "month" | "year";
    values: ValueValid;
    timing: "fixed" | "fuzzy";
    max?: number;
};

/**
 * the soup is a set of parameters that determine the distribution of events over time
 */
type soup = {
    deviation?: number;
    peaks?: number;
    mean?: number;
};

/**
 * the types of hooks that can be used
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
 * a hook is a function that can be called before each entity is created, and can be used to modify attributes
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
    isCLI: boolean;
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
    isCLI(): boolean;

    // Time helper methods
    getTimeShift(): number;
    getDaysShift(): number;
}

/**
 * how we define events and their properties
 */
export interface EventConfig {
    event?: string;
    weight?: number;
    properties?: Record<string, ValueValid>;
    isFirstEvent?: boolean;
    isChurnEvent?: boolean;
    isSessionStartEvent?: boolean;
    relativeTimeMs?: number;
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
     * todo: implement this
     * if set, the funnel might be the last thing the user does
     * ^ the numerical value is the likelihood that the user will churn
     * todo: allow for users to be resurrected
     */
    isChurnFunnel?: void | number;
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
