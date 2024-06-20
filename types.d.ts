declare namespace main {
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
  export interface Config {
    // constants
    token?: string;
    seed?: string;
    numDays?: number;
    epochStart?: number;
    epochEnd?: number;
    numEvents?: number;
    numUsers?: number;
    format?: "csv" | "json" | string;
    region?: "US" | "EU";
    simulationName?: string;

    //switches
    isAnonymous?: boolean;
    hasLocation?: boolean;
    hasCampaigns?: boolean;
    hasAdSpend?: boolean;
    hasIOSDevices?: boolean;
    hasAndroidDevices?: boolean;
    hasDesktopDevices?: boolean;
    hasBrowser?: boolean;
    writeToDisk?: boolean | string;
    verbose?: boolean;
    hasAnonIds?: boolean;
    hasSessionIds?: boolean;
    makeChart?: boolean | string;

    //models
    events?: EventConfig[] | string[]; //can also be a array of strings
    superProps?: Record<string, ValueValid>;
    funnels?: Funnel[];
    userProps?: Record<string, ValueValid>;
    scdProps?: Record<string, ValueValid>;
    mirrorProps?: Record<string, MirrorProps>;
    groupKeys?: [string, number][] | [string, number, string[]][]; // [key, numGroups, [events]]
    groupProps?: Record<string, Record<string, ValueValid>>;
    lookupTables?: LookupTableSchema[];
    soup?: soup;
    hook?: Hook<any>;

    //allow anything to be on the config
    [key: string]: any;
  }

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
  type hookTypes =
    | "event"
    | "user"
    | "group"
    | "lookup"
    | "scd"
    | "mirror"
    | "funnel-pre"
    | "funnel-post"
    | "ad-spend"
    | "churn"
    | "";

  /**
   * a hook is a function that can be called before each entity is created, and can be used to modify attributes
   */
  export type Hook<T> = (record: any, type: hookTypes, meta: any) => T;

  export interface hookArrayOptions<T> {
    hook?: Hook<T>;
    type?: hookTypes;
    [key: string]: any;
  }

  /**
   * an enriched array is an array that has a hookPush method that can be used to transform-then-push items into the array
   */
  export interface EnrichedArray<T> extends Array<T> {
    hookPush: (item: T | T[]) => boolean;
  }

  /**
   * the storage object is a key-value store that holds arrays of data
   */
  export interface Storage {
    eventData?: EnrichedArray<EventSchema>;
    mirrorEventData?: EnrichedArray<EventSchema>;
    userProfilesData?: EnrichedArray<UserProfile>;
    groupProfilesData?: EnrichedArray<GroupProfileSchema>;
    lookupTableData?: EnrichedArray<LookupTableSchema>;
    adSpendData?: EnrichedArray<EventSchema>;
    scdTableData?: EnrichedArray<SCDSchema>[];
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
    relativeTimeMs?: number;
  }

  /**
   * how we define funnels and their properties
   */
  export interface Funnel {
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
      | string
      | "sequential"
      | "first-fixed"
      | "last-fixed"
      | "random" //totally shuffled
      | "first-and-last-fixed"
      | "middle-fixed"
      | "interrupted";

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
    scdTableData: any[];
    adSpendData: EventSchema[];
    groupProfilesData: GroupProfileSchema[];
    lookupTableData: LookupTableData[];
    importResults?: ImportResults;
    files?: string[];
  };
}

/**
 * Mixpanel Data Generator
 * model events, users, groups, and lookup tables (and SCD props!)
 * @example
 * const gen = require('make-mp-data')
 * const dta = gen({writeToDisk: false})
 */
declare function main(config: main.Config): Promise<main.Result>;

export = main;
