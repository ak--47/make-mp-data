/**
 * A "validValue" can be a primitive, an array of primitives, 
 * or a function that returns a primitive or an array of primitives.
 * This is the building block for all property values in the dungeon.
 */
type Primitives = string | number | boolean | Date;
type ValueValid = Primitives | Primitives[] | (() => Primitives | Primitives[]);


/**
 * The main configuration object for the entire data generation spec, known as a "Dungeon".
 * This is the high-level object you will be constructing.
 */
export interface Dungeon {
    /** A list of all possible events that can occur in the simulation. */
    events?: EventConfig[];
    
    /** A list of event sequences that represent user journeys (e.g., sign-up, purchase). */
    funnels?: Funnel[];
    
    /** Properties that are attached to every event for all users. */
    superProps?: Record<string, ValueValid>;
    
    /** Properties that define the characteristics of individual users. */
    userProps?: Record<string, ValueValid>;
    
    /** Properties that change for users or groups over time (Slowly Changing Dimensions). */
    scdProps?: Record<string, SCDProp>;
    
    /** Defines group entities, like companies or teams, and how many of each to create. */
    groupKeys?: [string, number, string[]?][]; // [key, numGroups, optional_events_for_group]
    
    /** Properties that define the characteristics of the groups defined in groupKeys. */
    groupProps?: Record<string, Record<string, ValueValid>>;

    /** Events that are attributed to a group entity rather than an individual user. */
    groupEvents?: GroupEventConfig[];
    
    /** Static data tables (e.g., product catalogs) that can be referenced in events. */
    lookupTables?: LookupTableSchema[];

}


/**
 * Defines a single event, its properties, and its likelihood of occurring.
 */
interface EventConfig {
    /** The name of the event (e.g., "Page View", "Add to Cart"). */
    event?: string;
    
    /** The relative frequency of this event compared to others. Higher numbers are more frequent. */
    weight?: number;
    
    /** A dictionary of properties associated with this event. */
    properties?: Record<string, ValueValid>;
    
    /** If true, this event will be the first event for a new user. */
    isFirstEvent?: boolean;
    
    /** If true, this event signifies that a user has churned. */
    isChurnEvent?: boolean;
}


/**
 * Defines a sequence of events that represents a meaningful user journey or workflow.
 */
interface Funnel {
    /** The name of the funnel (e.g., "Purchase Funnel"). */
    name?: string;

    /** A list of event names that make up the sequence of this funnel. */
    sequence: string[];
    
    /** The likelihood that a user will attempt this funnel. */
    weight?: number;
    
    /** If true, this funnel is part of the initial user experience (e.g., onboarding). */
    isFirstFunnel?: boolean;
    
    /** The probability (0-100) that a user who starts the funnel will complete it. */
    conversionRate?: number;
    
    /** The average time (in hours) it takes a user to complete the funnel. */
    timeToConvert?: number;
    
    /** * Defines the ordering of events within the funnel for a user.
     * "sequential": Events must happen in the exact order defined in `sequence`.
     * "random": Events can happen in any order.
     * "first-and-last-fixed": The first and last events are fixed, but the middle ones are random.
     */
    order?: "sequential" | "random" | "first-and-last-fixed" | "first-fixed" | "last-fixed" | "interrupted";
    
    /** Properties that will be attached to every event generated within this funnel journey. */
    props?: Record<string, ValueValid>;
}


/**
 * Defines a "Slowly Changing Dimension" — a property of a user or group
 * that changes periodically over time (e.g., subscription plan, user role).
 */
interface SCDProp {
    /** The entity this property belongs to ('user' or a group key like 'company_id'). */
    type?: string;
    
    /** How often the value of this property can change. */
    frequency: "day" | "week" | "month" | "year";
    
    /** A list or function defining the possible values for this property. */
    values: ValueValid;
    
    /** * 'fixed': Changes occur exactly on the frequency interval.
     * 'fuzzy': Changes occur randomly around the frequency interval.
     */
    timing: "fixed" | "fuzzy";

    /** The maximum number of times this property can change for a single entity. */
    max?: number;
}


/**
 * Defines an event that is attributed to a group and occurs on a regular schedule.
 * (e.g., a monthly subscription charge for a company).
 */
interface GroupEventConfig extends EventConfig {
    /** How often the event occurs (in days). */
    frequency: number; 
    
    /** The group key this event is associated with (e.g., "company_id"). */
    group_key: string; 
    
    /** If true, a random user within the group is also associated with the event. */
    attribute_to_user: boolean; 
    
    /** The number of entities in this group. */
    group_size: number; 
}


/**
 * Defines the schema for a static lookup table, which can be used to enrich event data.
 * For example, a "products" table could hold details about product IDs.
 */
interface LookupTableSchema {
    /** The name of the key that will be used to join this table in an event (e.g., "product_id"). */
    key: string;
    
    /** The number of unique rows to generate for this table. */
    entries: number;
    
    /** A dictionary of attributes (columns) for the table and their possible values. */
    attributes: Record<string, ValueValid>;
}
/**
 