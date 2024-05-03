// types.d.ts

type primitives = string | number | boolean | Date | Object;
type valueValid = primitives | primitives[] | (() => primitives | primitives[]);

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
  groupKeys?: [string, number][];
  groupProps?: Record<string, GroupProperty>; // Adjust according to usage
  lookupTables?: LookupTable[];
  writeToDisk?: boolean;
  simulationName?: string;
  verbose?: boolean;
  anonIds?: boolean;
  sessionIds?: boolean;
}

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
