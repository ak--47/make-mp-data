// types.d.ts
import { Chance } from "chance";

export interface Config {
  token?: string;
  seed?: string;
  numDays?: number;
  numEvents?: number;
  numUsers?: number;
  format?: "csv" | "json";
  region?: string;
  events?: EventConfig[];
  superProps?: Record<string, string[]>; // Flexible for any string keys
  userProps?: Record<string, any>; // Could be more specific based on actual usage
  scdProps?: {
    plan?: string[];
    MRR?: number;
    NPS?: number;
    marketingOptIn?: boolean[];
    dateOfRenewal?: Date;
  };
  groupKeys?: [string, number][];
  groupProps?: Record<string, GroupProperty>; // Adjust according to usage
  lookupTables?: LookupTable[];
  writeToDisk?: boolean;
}

interface EventConfig {
  event?: string;
  weight?: number;
  properties?: {
    [key: string]: any; // Consider refining based on actual properties used
  };
  isFirstEvent?: boolean;
}

interface GroupProperty {
  [key?: string]: any;
}

interface LookupTable {
  key?: string;
  entries?: number;
  attributes?: {
    category?: string[];
    demand?: string[];
    supply?: string[];
    manufacturer?: () => string;
    price?: number;
    rating?: number;
    reviews?: number;
  };
}
