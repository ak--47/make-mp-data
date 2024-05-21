declare namespace main {
	type Primitives = string | number | boolean | Date | Record<string, any>;
  
	// Recursive type to handle functions returning functions that eventually return Primitives or arrays of Primitives
	type ValueValid =
	  | Primitives
	  | ValueValid[]
	  | (() => ValueValid);
  
	// MAIN CONFIGURATION OBJECT
	export interface Config {
	  token?: string;
	  seed?: string;
	  numDays?: number;
	  numEvents?: number;
	  numUsers?: number;
	  format?: "csv" | "json";
	  region?: string;
	  events?: EventConfig[];
	  superProps?: Record<string, ValueValid>;
	  userProps?: Record<string, ValueValid>;
	  scdProps?: Record<string, ValueValid>;
	  mirrorProps?: Record<string, MirrorProps>;
	  groupKeys?: [string, number][];
	  groupProps?: Record<string, Record<string, ValueValid>>;
	  lookupTables?: LookupTable[];
	  writeToDisk?: boolean;
	  simulationName?: string;
	  verbose?: boolean;
	  anonIds?: boolean;
	  sessionIds?: boolean;
	  hook?: Hook;
	}
  
	export type Hook = (record: any, type: string, meta: any) => any;
  
	export interface EventConfig {
	  event?: string;
	  weight?: number;
	  properties?: Record<string, ValueValid>;
	  isFirstEvent?: boolean;
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
  
	export interface SCDTable {
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
	  $source: string;
	  time: string;
	  $device_id?: string;
	  $session_id?: string;
	  $user_id?: string;
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
		$name: string;
		$email: string;
		$avatar: string;
		$created: string | undefined;
		anonymousIds: string[];
		sessionIds: string[];
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
  