/**
 * A "ValueValid" can be:
 * - A primitive value (string, number, boolean)
 * - An array of primitives (the system picks one randomly)
 * - A function call object: { "functionName": "...", "args": [...] }
 * - An arrow function object: { "functionName": "arrow", "body": "..." }
 *
 * This is the building block for all property values in the dungeon.
 */
type Primitives = string | number | boolean;
type FunctionCall = { functionName: string; args?: any[]; body?: string };
type ValueValid = Primitives | Primitives[] | FunctionCall;


/**
 * The main configuration object for the entire data generation spec, known as a "Dungeon".
 * This is the high-level object you will be constructing.
 *
 * REQUIRED fields: events, funnels, superProps, userProps
 * OPTIONAL fields: scdProps, groupKeys, groupProps, groupEvents
 */
export interface Dungeon {
    /** REQUIRED: A list of all possible events that can occur in the simulation. */
    events: EventConfig[];

    /** REQUIRED: A list of event sequences that represent user journeys (e.g., sign-up, purchase). */
    funnels: Funnel[];

    /** REQUIRED: Properties that are attached to every event for all users. */
    superProps: Record<string, ValueValid>;

    /** REQUIRED: Properties that define the characteristics of individual users. */
    userProps: Record<string, ValueValid>;

    /** OPTIONAL: Properties that change for users or groups over time (Slowly Changing Dimensions). Only include when properties explicitly change over time. */
    scdProps?: Record<string, SCDProp>;

    /** OPTIONAL: Defines group entities (companies, teams). Format: [["group_key", count], ...]. ONLY for B2B/SaaS scenarios. */
    groupKeys?: [string, number][];

    /** OPTIONAL: Properties for groups defined in groupKeys. ONLY include if groupKeys is defined. */
    groupProps?: Record<string, Record<string, ValueValid>>;

    /** OPTIONAL: Events attributed to groups on a schedule (e.g., monthly billing). Rarely needed. */
    groupEvents?: GroupEventConfig[];
}


/**
 * Defines a single event, its properties, and its likelihood of occurring.
 *
 * The "weight" determines relative frequency - an event with weight 10 occurs
 * roughly 10x more often than an event with weight 1.
 */
interface EventConfig {
    /** REQUIRED: The name of the event (e.g., "Page View", "Add to Cart", "checkout"). */
    event: string;

    /** OPTIONAL: The relative frequency of this event. Higher numbers = more frequent. Default: 1 */
    weight?: number;

    /** OPTIONAL: Properties associated with this event. Each property can be a value or array. */
    properties?: Record<string, ValueValid>;

    /** OPTIONAL: If true, this event will be the first event for a new user (e.g., "sign up"). Only one event should have this. */
    isFirstEvent?: boolean;

    /** OPTIONAL: If true, this event signifies that a user has churned (e.g., "account deleted"). */
    isChurnEvent?: boolean;
}


/**
 * Defines a sequence of events that represents a meaningful user journey or workflow.
 *
 * Funnels model how users progress through your product - from sign-up to purchase,
 * from onboarding to activation, etc. The conversionRate determines what percentage
 * of users who start the funnel will complete it.
 */
interface Funnel {
    /** REQUIRED: Event names that make up this journey. Must match event names in the events array. */
    sequence: string[];

    /** REQUIRED: Percentage (0-100) of users who complete the funnel. 15 means 15% conversion. */
    conversionRate: number;

    /** OPTIONAL: The name of the funnel (e.g., "Purchase Funnel", "Onboarding Flow"). */
    name?: string;

    /** OPTIONAL: The likelihood that a user will attempt this funnel vs others. Default: 1 */
    weight?: number;

    /** OPTIONAL: If true, this is an initial user experience funnel (e.g., onboarding). */
    isFirstFunnel?: boolean;

    /** OPTIONAL: Average hours to complete the funnel. Default: 1 */
    timeToConvert?: number;

    /**
     * OPTIONAL: How events are ordered within the funnel.
     * - "sequential" (default): Events happen in exact order
     * - "random": Events can happen in any order
     * - "first-fixed": First event is fixed, rest are random
     * - "last-fixed": Last event is fixed, rest are random
     * - "first-and-last-fixed": First and last are fixed, middle is random
     */
    order?: "sequential" | "random" | "first-fixed" | "last-fixed" | "first-and-last-fixed";

    /** OPTIONAL: Properties attached to every event in this funnel (e.g., experiment_variant, traffic_source). */
    props?: Record<string, ValueValid>;

    /** OPTIONAL: User property conditions for eligibility. Only users matching these values run this funnel. */
    conditions?: Record<string, ValueValid>;

    /** OPTIONAL: If true, generates 3 variants with different conversion rates for A/B testing analysis. */
    experiment?: boolean;
}


/**
 * Defines a "Slowly Changing Dimension" - a property of a user or group
 * that changes periodically over time (e.g., subscription plan, user role).
 *
 * ONLY include SCDs when properties explicitly need to change over time.
 * For static properties, just use userProps or groupProps.
 */
interface SCDProp {
    /** OPTIONAL: The entity type - 'user' or a group key like 'company_id'. Default: 'user' */
    type?: "user" | string;

    /** REQUIRED: How often this property can change. */
    frequency: "day" | "week" | "month" | "year";

    /** REQUIRED: Possible values for this property. */
    values: ValueValid;

    /**
     * REQUIRED: When changes occur.
     * - "fixed": Changes occur exactly on the frequency interval
     * - "fuzzy": Changes occur randomly around the interval
     */
    timing: "fixed" | "fuzzy";

    /** OPTIONAL: Maximum number of times this property can change per entity. Default: 100 */
    max?: number;
}


/**
 * Defines an event attributed to a group on a regular schedule.
 * Example: monthly subscription charges, weekly reports, etc.
 *
 * This is rarely needed - only use for B2B scenarios with recurring group-level events.
 */
interface GroupEventConfig {
    /** REQUIRED: The name of the event. */
    event: string;

    /** REQUIRED: How often the event occurs (in days). e.g., 30 for monthly. */
    frequency: number;

    /** REQUIRED: The group key this event belongs to (e.g., "company_id"). */
    group_key: string;

    /** OPTIONAL: If true, a random user in the group is also attributed to the event. */
    attribute_to_user?: boolean;

    /** OPTIONAL: Properties for this event. */
    properties?: Record<string, ValueValid>;

    /** OPTIONAL: Relative frequency of this event. */
    weight?: number;
}
