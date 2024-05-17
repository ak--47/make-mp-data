declare namespace main {
  type primitives = string | number | boolean | Date | Object;
  type valueValid =
    | primitives
    | primitives[]
    | (() => primitives | primitives[]);

  export interface Config {
    token?: string;
    seed?: string;
    numDays?: number;
    numEvents?: number;
    numUsers?: number;
    format?: "csv" | "json";
    region?: string;
    events?: EventConfig[];
    superProps?: Record<string, valueValid>;
    userProps?: Record<string, valueValid>;
    scdProps?: Record<string, valueValid>;
	mirrorProps?: Record<string, { events: string[]; values: valueValid[] }>;
    groupKeys?: [string, number][];
    groupProps?: Record<string, GroupProperty>; // Adjust according to usage
    lookupTables?: LookupTable[];
    writeToDisk?: boolean;
    simulationName?: string;
    verbose?: boolean;
    anonIds?: boolean;
    sessionIds?: boolean;
    hook?: Hook;
  }

  export type Hook = (record: any, type: string, meta: any) => any;

  interface EventConfig {
    event?: string;
    weight?: number;
    properties?: {
      [key: string]: valueValid; // Consider refining based on actual properties used
    };
    isFirstEvent?: boolean;
  }

  interface GroupProperty {
    [key?: string]: valueValid;
  }

  interface LookupTable {
    key: string;
    entries: number;
    attributes: {
      [key?: string]: valueValid;
    };
  }

  type Result = {
    eventData: {
      event: any;
      $source: string;
    }[];
    userProfilesData: any[];
    scdTableData: any[];
    groupProfilesData: {
      key: string;
      data: any[];
    }[];
    lookupTableData: {
      key: string;
      data: any[];
    }[];
    import?: undefined;
    files?: undefined;
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
