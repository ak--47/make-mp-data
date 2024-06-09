
declare namespace main {
  type Primitives = string | number | boolean | Date | Record<string, any>;

  // Recursive type to handle functions returning functions that eventually return Primitives or arrays of Primitives
  export type ValueValid = Primitives | ValueValid[] | (() => ValueValid);

  // MAIN CONFIGURATION OBJECT
  export interface Config {
    token?: string;
    seed?: string;
    numDays?: number;
	epochStart?: number;
	epochEnd?: number;
    numEvents?: number;
    numUsers?: number;
    format?: "csv" | "json";
    region?: "US" | "EU";
	chance?: any;
    events?: EventConfig[];
    superProps?: Record<string, ValueValid>;
    funnels?: Funnel[];
    userProps?: Record<string, ValueValid>;
    scdProps?: Record<string, ValueValid>;
    mirrorProps?: Record<string, MirrorProps>;
    groupKeys?: [string, number][] | [string, number, string[]][]; // [key, numGroups, [events]]
    groupProps?: Record<string, Record<string, ValueValid>>;
    lookupTables?: LookupTable[];
    writeToDisk?: boolean;
    simulationName?: string;
    verbose?: boolean;
    anonIds?: boolean;
    sessionIds?: boolean;
	makeChart?: boolean | string;
	amp?: number;
	freq?: number;
	skew?: number;
	noise?: number;
    hook?: Hook<any>;
  }

  type hookTypes =
    | "event"
    | "user"
    | "group"
    | "lookup"
    | "scd"
    | "mirror"
    | "funnel-pre"
    | "funnel-post"
    | "";
  export type Hook<T> = (record: any, type: hookTypes, meta: any) => T;

  export interface EnrichArrayOptions<T> {
    hook?: Hook<T>;
    type?: hookTypes;
    [key: string]: any;
  }

  export interface EnrichedArray<T> extends Array<T> {
    hookPush: (item: T) => number;
  }

  export interface EventConfig {
    event?: string;
    weight?: number;
    properties?: Record<string, ValueValid>;
    isFirstEvent?: boolean;
	relativeTimeMs?: number;
  }

  export interface Funnel {
    sequence: string[];
    weight?: number;
    isFirstFunnel?: boolean;
    order?:
      | "sequential"
      | "first-fixed"
      | "last-fixed"
      | "random"
      | "first-and-last-fixed"
      | "middle-fixed";
    conversionRate?: number;
    timeToConvert?: number;
    props?: Record<string, ValueValid>;
  }

  export interface MirrorProps {
    events: string[] | "*";
    values: ValueValid[];
  }

  export interface LookupTable {
    key: string;
    entries: number;
    attributes: Record<string, ValueValid>;
  }

  export interface SCDTableRow {
    distinct_id: string;
    insertTime: string;
    startTime: string;
    [key: string]: ValueValid;
  }

  export type Result = {
    eventData: EventData[];
    userProfilesData: any[];
    scdTableData: any[];
    groupProfilesData: GroupProfilesData[];
    lookupTableData: LookupTableData[];
    import?: ImportResults;
    files?: string[];
  };

  export interface EventData {
    event: string;
    source: string;
    time: string;
    device_id?: string;
    session_id?: string;
    user_id?: string;
    [key: string]: any;
  }

  export interface GroupProfilesData {
    key: string;
    data: any[];
  }

  export interface LookupTableData {
    key: string;
    data: any[];
  }

  export interface ImportResults {
    events: ImportResult;
    users: ImportResult;
    groups: ImportResult[];
  }

  export interface ImportResult {
    success: number;
    bytes: number;
  }
  export interface Person {
    name: string;
    email: string;
    avatar: string;
    created: string | undefined;
    anonymousIds: string[];
    sessionIds: string[];
    distinct_id?: string;
  }

  export interface UserProfile {
    name?: string;
    email?: string;
    avatar?: string;
    created: string | undefined;
    distinct_id: string;
    [key: string]: ValueValid;
  }
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
