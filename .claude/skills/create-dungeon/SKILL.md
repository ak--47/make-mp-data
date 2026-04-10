---
name: create-dungeon
description: Design and create a new DM4 dungeon configuration file with realistic events, funnels, and deliberately architected analytics hooks that create discoverable insights.
argument-hint: []
model: claude-opus-4-6
effort: max
---

# Create a Dungeon

Design and build a complete DM4 dungeon for: **$ARGUMENTS**

## Your Task

Create a single `.js` file in `dungeons/` that defines a complete, realistic data schema for the described app/vertical. The dungeon must include deliberately architected analytics "hooks" — hidden trends and patterns that simulate real-world product insights buried in large datasets.

Before writing any code, read these reference files to understand patterns and conventions:
- `types.d.ts` — **the complete API reference** for all config options, event flags, hook types, SCD props, funnel options, and type definitions. Every feature is documented with JSDoc comments.
- `lib/utils/utils.js` — search for `pickAWinner`, `weighNumRange`, `initChance`, `exhaust`, `takeSome` to understand available utilities
- `lib/generators/events.js` — search for `hook` to see how `type === "event"` hooks are called (properties are FLAT on record)
- `lib/generators/funnels.js` — search for `hook` to see `funnel-pre` and `funnel-post` invocation
- `lib/orchestrators/user-loop.js` — search for `hook` to see `user`, `scd-pre`, and `everything` invocation
- `lib/core/config-validator.js` — understand validation rules (especially funnel event name matching)

If you wish, you can view how existing ./dungeons are structured for reference and how ./customers dungeons are for specific customers. Try to provide a realistic event/prop/user schema with the context you have from the prompt.

## File Structure

The file is organized so humans (and AI) can understand the intent before reading code:

1. **Imports + constants** — boilerplate, seed, IDs
2. **Dataset Overview** — what app this models, scale, core loop, monetization
3. **Analytics Hooks** — each hook with quick Mixpanel report steps
4. **Code** — the config object, with inline comments in the hook function explaining each mutation

```javascript
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "dm4-VERTICAL";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef  {import("../types").Dungeon} Config */

// Generate consistent IDs at module level
const entityIds = v.range(1, N).map(n => `prefix_${v.uid(8)}`);

/**
 * ═══════════════════════════════════════════════════════════════
 * DATASET OVERVIEW
 * ═══════════════════════════════════════════════════════════════
 *
 * App Name — what it models, the core user loop, monetization.
 * - N users over M days, ~X events
 * - Key entities and relationships
 * - Why these events/properties were chosen
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * ANALYTICS HOOKS
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. HOOK NAME (hook type: event/everything/funnel-pre/etc.)
 *    What it does to the data and why.
 *
 *    Mixpanel Report:
 *    • Type: Insights | Funnels | Retention
 *    • Event: "event_name"
 *    • Measure: Average of "property"
 *    • Breakdown: "segment_property"
 *    • Expected: segment_a ~Nx higher than segment_b
 *
 * 2. NEXT HOOK NAME (hook type)
 *    ...
 *
 * ═══════════════════════════════════════════════════════════════
 * EXPECTED METRICS SUMMARY
 * ═══════════════════════════════════════════════════════════════
 *
 * Hook            | Metric          | Baseline | Effect | Ratio
 * ────────────────|─────────────────|──────────|────────|──────
 * Hook Name       | order_total     | $50      | $150   | 3x
 */

/** @type {Config} */
const config = {
  // ... events, funnels, props ...

  hook: function (record, type, meta) {
    if (type === "everything") {
      // ── HOOK 1: HOOK NAME ──────────────────────────────────
      // Explain what this block does and why
      // e.g., "Boost order values 1.5x for premium users"
      // ...mutations with inline comments...
    }
    return record;
  }
};

export default config;
```

**Key principles:**
- Documentation comes BEFORE code so intent is clear before implementation
- Hook code has inline comments explaining each mutation (what it does to engineer the trend)
- No giant doc block after `export default` — all docs are above the config
- Mixpanel report steps are concise and actionable (report type, event, measure, breakdown, expected result)

## Base Config (use these exact values)

```javascript
token: "",
seed: SEED,
numDays: days,
numEvents: num_users * 120,
numUsers: num_users,
hasAnonIds: false,
hasSessionIds: true,
format: "json",
gzip: true,
alsoInferFunnels: false,
hasLocation: true,
hasAndroidDevices: true,
hasIOSDevices: true,
hasDesktopDevices: true,
hasBrowser: false,
hasCampaigns: false,
isAnonymous: false,
hasAdSpend: false,
percentUsersBornInDataset: 35,
hasAvatar: true,
batchSize: 2_500_000,
concurrency: 1,
writeToDisk: false,
scdProps: {},
mirrorProps: {},
lookupTables: [],  // NEVER add lookup tables — they require manual import and are not automated
```

## TimeSoup — Time Distribution (usually omit this)

**DEFAULT BEHAVIOR: Do NOT include `soup` in the config unless the user's prompt explicitly asks for a specific time distribution pattern** (e.g., "make it spiky", "seasonal pattern", "global users"). The default "growth" preset applies automatically and is correct for the vast majority of dungeons. Do not infer a preset from the vertical — a gaming dungeon does NOT automatically need "spiky", an e-commerce dungeon does NOT automatically need "seasonal". Only set `soup` when the user says so.

If the user does request a specific time pattern, use one of these presets:

```javascript
soup: "steady"     // flat, mature SaaS (low variation)
soup: "growth"     // gradual uptrend with realistic weekly cycle (this is the default if omitted)
soup: "spiky"      // dramatic peaks and valleys
soup: "seasonal"   // 3-4 major waves across the dataset
soup: "global"     // flat DOW + flat HOD (no cyclical patterns)
soup: "churny"     // flat distribution, no growth (pair with churn hooks for declining pattern)
soup: "chaotic"    // wild variation, few tight peaks
```

For fine-grained custom control (only if the user specifically asks):

```javascript
// Preset + overrides
soup: { preset: "spiky", deviation: 5 }

// Fully custom — see lib/templates/soup-presets.js for weight arrays
soup: {
  peaks: 200,                    // Gaussian clusters (default: numDays*2)
  deviation: 2,                  // peak tightness (higher = tighter)
  mean: 0,                       // offset from chunk center
  dayOfWeekWeights: [/* 7 values, Sun..Sat, max=1.0 */],
  hourOfDayWeights: [/* 24 values, 0=midnight UTC, max=1.0 */],
}
```

## Required Components

### 1. Events (15-20)
- Include `isFirstEvent: true` on the signup/account creation event
- **Plain string arrays are automatically power-law weighted** — `["a", "b", "c", "d"]` (3+ unique strings) gets `pickAWinner` applied under the hood by `choose()`. Do NOT wrap these in `pickAWinner()` explicitly.
- Use `u.pickAWinner(array)` ONLY when you need to pass a second argument for explicit index control, or for arrays with < 3 items
- Use `u.weighNumRange(min, max, skew?, center?)` for numeric ranges (Box-Muller)
- Use arrays with **duplicates** for explicit frequency weighting: `["common", "common", "common", "rare"]`
- Each event needs `event` (name), `weight` (relative frequency 1-10), `properties` (object)

#### Event Flags (see `types.d.ts` EventConfig for full reference)
- `isFirstEvent: true` — marks the signup/onboarding event (used for first funnels)
- `isChurnEvent: true` — when generated, signals the user has churned and stops further event generation. Pair with `returnLikelihood` (0-1) to control whether users can come back (0 = permanent churn, 1 = always returns). Mark churn events with `isStrictEvent: true` so they don't end up in auto-generated funnels.
- `isSessionStartEvent: true` — automatically prepended 15 seconds before each funnel (e.g., `$session_started`). Use for session tracking events.
- `isStrictEvent: true` — excluded from auto-generated funnels (both `inferFunnels` and the catch-all). Use for system events, churn events, or events that shouldn't appear in conversion sequences.

### 2. Funnels (3)
- Mark one with `isFirstFunnel: true` (onboarding funnel)
- Set `conversionRate` (0-1) and `timeToConvert` (days)
- **CRITICAL**: Every event name in `sequence` arrays MUST exist in the `events` array

### 3. SuperProps (2-3)
- Properties that appear on EVERY event (platform, subscription tier, etc.)
- These are accessible in hooks via `record.propName` on every event

### 4. UserProps (4-6)
- User profile properties set once per user

### 5. Groups (0-2)
- Format: `["group_key", count, ["event1", "event2"]]`
- With corresponding `groupProps` object

### 6. Hook Function (8 hooks)
- Single `hook: function(record, type, meta) { ... return record; }` function
- Must implement exactly **8** deliberately architected analytics patterns

## Hook System Reference

### Hook Types and When They Fire

| Type | `record` is | Return behavior | Fires in |
|------|-------------|-----------------|----------|
| `"event"` | Single event object (flat props) | Return value replaces event (must be single object) | `events.js` per event |
| `"user"` | User profile object | Ignored — mutate in-place | `user-loop.js` per user |
| `"funnel-pre"` | Funnel config `{sequence, conversionRate, timeToConvert, props}` | Ignored — mutate in-place | `funnels.js` before generation |
| `"funnel-post"` | Array of generated funnel events | Ignored — mutate in-place | `funnels.js` after generation |
| `"scd-pre"` | Array of SCD entries | Return array to replace, or mutate in-place | `user-loop.js` before SCD write |
| `"everything"` | Array of ALL events for one user | Return array to replace event list | `user-loop.js` after all events generated |

### Critical Hook Rules

1. **Properties are FLAT on event records in hooks** — use `record.amount`, NOT `record.properties.amount`
2. When splicing events in `everything`, new events need: `event`, `time` (ISO string), `user_id` (copied from source event's `event.user_id`), plus flat properties. The pipeline uses `user_id` NOT `distinct_id`.
3. Use `dayjs` for all time operations inside hooks
4. Use the seeded `chance` instance (from module scope) for randomness in hooks
5. **Always return `record`** at the very end of the hook function. Every code path must reach `return record`. If you want to suppress an event from the `event` hook, assign it to an empty object (`record = {}`) and let it fall through to `return record` — do NOT use `return {}` as an early return or `return null`.
6. **To drop/filter events** (for churn, drop-off, or trend patterns): you CANNOT truly drop events from the `event` hook — assigning `record = {}` creates a broken empty record. Instead, use ONE of these patterns in the `everything` hook:
   - **Tag-and-filter**: In the `event` hook, tag events to drop with a property (e.g., `record._drop = true`). Then in the `everything` hook, filter them out: `return record.filter(e => !e._drop)`
   - **Direct filter in `everything`**: Skip the tagging and just filter directly in the `everything` hook based on conditions: `return record.filter(e => !shouldDrop(e))`
   - **Splice removal**: In the `everything` hook, iterate backwards and `splice(i, 1)` to remove events
   
   This is critical for architecting churn, drop-off, seasonal dips, and other "absence of data" patterns. The `everything` hook is the ONLY place where events can be removed.

### Hook Technique Catalog

Use a MIX of these techniques across your 8 hooks — don't put everything in `"everything"`:

#### Event-Level Techniques (`type === "event"`)

- **Property modification**: Set/change properties based on conditions. `record.amount *= 1.5`
- **Event renaming/replacement**: Change `record.event` to create hook-only event types (e.g., critical alert → "incident created")
- **Temporal windowing**: Modify events within a date range using relative dates:
  ```javascript
  const DATASET_START = NOW.subtract(days, 'days');
  const LAUNCH_DATE = DATASET_START.add(45, 'days');  // product launch on day 45
  const OUTAGE_START = DATASET_START.add(20, 'days');  // outage starts day 20
  const OUTAGE_END = DATASET_START.add(27, 'days');    // outage ends day 27
  if (dayjs(record.time).isAfter(LAUNCH_DATE)) { /* post-launch behavior */ }
  ```
- **Day-of-week patterns**: Weekend surges, weekday prime-time tagging
- **Closure-based state (Maps)**: Module-level Maps track state across calls. E.g., user who exceeded budget → next scale event forced to "down"

#### User-Level Techniques (`type === "user"`)

- **Profile enrichment**: Add computed segments: `record.segment = "champion"` based on random bucketing
- **Tier-based properties**: Enterprise vs startup, premium vs free — determines seat count, ACV, etc.

#### Funnel Techniques (`type === "funnel-pre"` / `"funnel-post"`)

- **Conversion rate manipulation** (funnel-pre): `record.conversionRate *= 1.3` for premium users, `*= 0.6` for free
- **Event injection** (funnel-post): Splice coupon/intermediate events between funnel steps
- **Time-to-convert manipulation** (funnel-pre): `record.timeToConvert *= 0.5` for power users

#### Everything Techniques (`type === "everything"`) — Most Powerful

The `"everything"` hook is the most powerful because it sees ALL events for one user AND has access to `meta.profile`. This enables **cross-table correlation** — driving event behavior based on user profile properties:

- **Two-pass processing**: First pass scans for conditions (has purchase? joined guild early?), second pass modifies ALL events based on findings
- **Cross-table correlation**: Use `meta.profile.tier` to set properties on every event → creates discoverable segment differences across both user and event tables
- **Event filtering/dropping (churn, drop-off, seasonal dips)**: `return record.filter(e => ...)` — the ONLY way to remove events. Remove 60-70% of events after a date to simulate disengagement, filter by tag to create volume dips, or remove events matching conditions to architect absence-of-data patterns. This is essential for modeling churn, seasonal drop-off, and degraded experience periods.
- **Event injection**: Append synthetic milestone/churn-risk events to the stream
- **Event duplication**: Clone events with 1-3 hour time offsets (viral cascades, weekend surges)
- **Compound conditions**: Require multiple behaviors before applying effect (Slack AND PagerDuty → faster resolution)

#### Relative Date Patterns (Important!)

Always define time windows relative to `DATASET_START`, not absolute dates. This makes hooks work regardless of `numDays`:

```javascript
const NOW = dayjs();
const DATASET_START = NOW.subtract(days, 'days');  // 'days' from module scope

// Product launch happened 25 days ago
const LAUNCH_DATE = NOW.subtract(25, 'days');

// Promotional period: started 40 days in, ended 55 days in
const PROMO_START = DATASET_START.add(40, 'days');
const PROMO_END = DATASET_START.add(55, 'days');

// Last week's outage
const OUTAGE_START = NOW.subtract(7, 'days');
const OUTAGE_END = NOW.subtract(3, 'days');
```

### Aim for this distribution across your 8 hooks:
- 2-3 `event` hooks (property modification, temporal windows, day-of-week)
- 3-4 `everything` hooks — this is the most powerful hook type; it sees the user's full event history AND `meta.profile`, enabling cross-table correlation, two-pass analysis, churn simulation, event injection, and behavioral segmentation. Lean heavily on this.
- 1-2 of: `user`, `funnel-pre`, or `funnel-post`
- 0-1 using module-level closure state (Maps)

### Hook Reference Examples

These are proven, production-tested implementations. Use them as templates.

#### Example 1: Two-Pass Everything Hook (scan then modify)

The most important pattern. First pass identifies behavioral signals across all events, second pass modifies events based on those signals. Always set schema defaults before conditional modification.

```javascript
if (type === "everything") {
  const userEvents = record;
  const firstEventTime = userEvents.length > 0 ? dayjs(userEvents[0].time) : null;

  // ── FIRST PASS: Scan for user behavioral patterns ──
  let usedPowerFeature = false;
  let earlyAdopter = false;
  let earlyFailures = 0;

  userEvents.forEach((event) => {
    const eventTime = dayjs(event.time);
    const daysSinceStart = firstEventTime ? eventTime.diff(firstEventTime, 'days', true) : 0;

    if (event.event === "use item" && event.item_type === "Ancient Compass") {
      usedPowerFeature = true;
    }
    if (event.event === "guild joined" && daysSinceStart < 3) {
      earlyAdopter = true;
    }
    if (event.event === "player death" && daysSinceStart < 7) {
      earlyFailures++;
    }
  });

  // ── SECOND PASS: Modify events based on patterns ──
  userEvents.forEach((event, idx) => {
    const eventTime = dayjs(event.time);

    // Set schema defaults FIRST (ensures property exists on all events of this type)
    if (event.event === "quest turned in") {
      event.compass_user = false;
    }

    // Then conditionally override
    if (usedPowerFeature && event.event === "quest turned in") {
      event.reward_gold = Math.floor((event.reward_gold || 100) * 1.5);
      event.compass_user = true;

      // Inject extra events via splice
      if (chance.bool({ likelihood: 40 })) {
        userEvents.splice(idx + 1, 0, {
          event: "quest turned in",
          time: eventTime.add(chance.integer({ min: 10, max: 120 }), 'minutes').toISOString(),
          user_id: event.user_id,  // MUST use user_id, not distinct_id
          reward_gold: chance.integer({ min: 100, max: 500 }),
          compass_user: true,
        });
      }
    }
  });

  return record;  // Return the (possibly modified) array
}
```

#### Example 2: Churn Simulation via Reverse Splice

To drop events (simulate churn, disengagement, seasonal dips), iterate backwards and splice. Forward iteration corrupts indices when removing elements.

```javascript
if (type === "everything") {
  const userEvents = record;
  const firstEventTime = userEvents.length > 0 ? dayjs(userEvents[0].time) : null;

  // Identify churn candidates (e.g., non-joiners with poor scores)
  let joinedEarly = false;
  let hasLowScore = false;
  userEvents.forEach((event) => {
    const days = firstEventTime ? dayjs(event.time).diff(firstEventTime, 'days', true) : 0;
    if (event.event === "study group joined" && days <= 10) joinedEarly = true;
    if (event.event === "quiz completed" && event.score_percent < 60) hasLowScore = true;
  });

  if (!joinedEarly && hasLowScore) {
    // Remove 70% of events after day 14 (churn simulation)
    const churnCutoff = firstEventTime ? firstEventTime.add(14, 'days') : null;
    for (let i = userEvents.length - 1; i >= 0; i--) {  // BACKWARDS iteration
      if (churnCutoff && dayjs(userEvents[i].time).isAfter(churnCutoff)) {
        if (chance.bool({ likelihood: 70 })) {
          userEvents.splice(i, 1);
        }
      }
    }
  } else if (joinedEarly) {
    // Retained users get bonus engagement events
    const lastEvent = userEvents[userEvents.length - 1];
    if (lastEvent && chance.bool({ likelihood: 60 })) {
      userEvents.push({
        event: "discussion posted",
        time: dayjs(lastEvent.time).add(chance.integer({ min: 1, max: 3 }), 'days').toISOString(),
        user_id: lastEvent.user_id,
        study_group_member: true,
      });
    }
  }

  return record;
}
```

#### Example 3: Closure-Based State with Maps

Module-level Maps enable cross-event causality: one event sets state, a later event reads and reacts to it. Define Maps outside the hook function.

```javascript
// ── Module scope (outside config object) ──
const costOverrunUsers = new Map();
const failedDeployUsers = new Map();

// ── Inside hook function ──
if (type === "event") {
  // Cost overrun → forced scale-down on next infrastructure event
  if (record.event === "cost report generated" && record.cost_change_percent > 25) {
    record.budget_exceeded = true;
    costOverrunUsers.set(record.user_id, true);       // SET state
  }
  if (record.event === "infrastructure scaled" && costOverrunUsers.has(record.user_id)) {
    record.scale_direction = "down";                   // REACT to state
    record.cost_reaction = true;
    costOverrunUsers.delete(record.user_id);            // CLEAR state
  }

  // Failed deploy → recovery deploy takes 1.5x longer
  if (record.event === "deployment pipeline run") {
    if (record.status === "failed") {
      failedDeployUsers.set(record.user_id, true);
    } else if (record.status === "success" && failedDeployUsers.has(record.user_id)) {
      record.duration_sec = Math.floor((record.duration_sec || 300) * 1.5);
      record.recovery_deployment = true;
      failedDeployUsers.delete(record.user_id);
    }
  }
}
```

#### Example 4: Funnel-Post Event Injection

Splice events between funnel steps (coupons, intermediate actions). Calculate midpoint time between adjacent events.

```javascript
if (type === "funnel-post") {
  if (Array.isArray(record) && record.length >= 2) {
    const firstEvent = record[0];
    const isFreeUser = firstEvent && firstEvent.subscription_tier === "Free";

    if (isFreeUser && chance.bool({ likelihood: 30 })) {
      const insertIdx = chance.integer({ min: 1, max: record.length - 1 });
      const prevEvent = record[insertIdx - 1];
      const nextEvent = record[insertIdx];
      // Calculate midpoint time between adjacent funnel steps
      const midTime = dayjs(prevEvent.time).add(
        dayjs(nextEvent.time).diff(dayjs(prevEvent.time)) / 2, 'milliseconds'
      ).toISOString();

      record.splice(insertIdx, 0, {
        event: "coupon applied",
        time: midTime,
        user_id: firstEvent.user_id,
        coupon_code: chance.pickone(["SAVE10", "WELCOME", "FLASH20"]),
        discount_percent: chance.integer({ min: 10, max: 30 }),
        coupon_injected: true,
      });
    }
  }
}
```

#### Example 5: User Profile Enrichment (Conditional Properties)

Add computed properties to user profiles based on existing attributes. Different user segments get different property sets.

```javascript
if (type === "user") {
  const companySize = record.company_size;

  if (companySize === "enterprise") {
    record.seat_count = chance.integer({ min: 50, max: 500 });
    record.annual_contract_value = chance.integer({ min: 50000, max: 500000 });
    record.customer_success_manager = true;
  } else if (companySize === "startup") {
    record.seat_count = chance.integer({ min: 1, max: 5 });
    record.annual_contract_value = chance.integer({ min: 0, max: 3600 });
    record.customer_success_manager = false;
  }

  // Universal properties (all users get these)
  record.customer_health_score = chance.integer({ min: 1, max: 100 });
}
```

#### Example 6: Event Property Modification + Day-of-Month Patterns

Modify properties based on calendar patterns. Always set boolean tags for both true AND false cases so the property appears consistently in the schema.

```javascript
if (type === "event") {
  const EVENT_TIME = dayjs(record.time);
  const dayOfMonth = EVENT_TIME.date();

  // Payday cycle: 1st and 15th see bigger deposits
  if (record.event === "transaction completed" && record.transaction_type === "direct_deposit") {
    if (dayOfMonth === 1 || dayOfMonth === 15) {
      record.amount = Math.floor((record.amount || 50) * 3);
      record.payday = true;
    } else {
      record.payday = false;   // ALWAYS set both cases
    }
  }

  // Post-payday spending window (days 1-3 and 15-17)
  if (record.event === "transfer sent") {
    const isPaydayWindow = (dayOfMonth >= 1 && dayOfMonth <= 3) || (dayOfMonth >= 15 && dayOfMonth <= 17);
    if (isPaydayWindow && chance.bool({ likelihood: 60 })) {
      record.amount = Math.floor((record.amount || 200) * 2.0);
      record.post_payday_spending = true;
    } else {
      record.post_payday_spending = false;
    }
  }
}
```

#### Example 7: Mass Event Injection in Everything Hook

For viral cascades, engagement bursts, or seasonal spikes — accumulate events in an array, then splice all at once.

```javascript
if (type === "everything") {
  const userEvents = record;

  // Identify viral creators (5% of users with 10+ posts)
  let postCount = 0;
  userEvents.forEach(e => { if (e.event === "post created") postCount++; });
  const isViralCreator = postCount >= 10 && chance.bool({ likelihood: 5 });

  if (isViralCreator) {
    userEvents.forEach((event, idx) => {
      if (event.event === "post created") {
        const eventTime = dayjs(event.time);
        const injected = [];

        // Generate 10-20 engagement events per viral post
        const viewCount = chance.integer({ min: 10, max: 20 });
        for (let i = 0; i < viewCount; i++) {
          injected.push({
            event: "post viewed",
            time: eventTime.add(chance.integer({ min: 1, max: 180 }), 'minutes').toISOString(),
            user_id: event.user_id,
            source: chance.pickone(["feed", "explore", "search"]),
            viral_cascade: true,
          });
        }

        // Single splice with spread for all injected events
        userEvents.splice(idx + 1, 0, ...injected);
      }
    });
  }

  return record;
}
```

#### Example 8: Cross-Table Correlation via Everything + meta.profile

The `everything` hook receives `meta.profile` — the user's full profile object. This lets you drive event behavior based on user properties, creating discoverable correlations across both tables.

```javascript
if (type === "everything") {
  const userEvents = record;
  const profile = meta.profile;

  // Use profile properties to segment and modify all events
  const tier = profile.subscription_tier || "free";
  const isEnterprise = profile.company_size === "enterprise";

  userEvents.forEach((event) => {
    // Stamp tier onto every event (creates cross-table join signal)
    event.user_tier = tier;

    // Enterprise users get faster response times
    if (isEnterprise && event.event === "support ticket resolved") {
      event.resolution_hours = Math.floor((event.resolution_hours || 24) * 0.4);
      event.priority_support = true;
    }

    // Premium users get higher reward multipliers
    if (tier === "premium" && event.event === "reward redeemed") {
      event.value = Math.floor((event.value || 10) * 3);
      event.premium_reward = true;
    }
  });

  // Enterprise users also get a synthetic "account review" event monthly
  if (isEnterprise && userEvents.length > 0) {
    const lastEvent = userEvents[userEvents.length - 1];
    userEvents.push({
      event: "account review",
      time: dayjs(lastEvent.time).add(1, 'day').toISOString(),
      user_id: lastEvent.user_id,
      user_tier: tier,
      review_type: "quarterly_business_review",
    });
  }

  return record;
}
```

#### Example 9: Fraud/Anomaly Injection in Everything Hook

Inject a realistic burst of anomalous events at the midpoint of a user's timeline. Perfect for fraud detection, outage simulation, or bot behavior patterns.

```javascript
if (type === "everything") {
  const userEvents = record;

  // 3% of users experience a fraud event sequence
  if (chance.bool({ likelihood: 3 }) && userEvents.length >= 2) {
    const midIdx = Math.floor(userEvents.length / 2);
    const midEvent = userEvents[midIdx];
    const midTime = dayjs(midEvent.time);
    const userId = midEvent.user_id;

    // Inject burst of 3-5 rapid high-value transactions within 1 hour
    const burstCount = chance.integer({ min: 3, max: 5 });
    const fraudEvents = [];

    for (let i = 0; i < burstCount; i++) {
      fraudEvents.push({
        event: "transaction completed",
        time: midTime.add(i * 10, "minutes").toISOString(),
        user_id: userId,
        amount: chance.integer({ min: 500, max: 3000 }),
        payment_method: "credit",
        fraud_sequence: true,
      });
    }

    // Follow-up: card locked + dispute filed
    fraudEvents.push({
      event: "card locked",
      time: midTime.add(burstCount * 10 + 5, "minutes").toISOString(),
      user_id: userId,
      reason: "suspicious_activity",
      fraud_sequence: true,
    });
    fraudEvents.push({
      event: "dispute filed",
      time: midTime.add(burstCount * 10 + 30, "minutes").toISOString(),
      user_id: userId,
      dispute_amount: chance.integer({ min: 500, max: 3000 }),
      fraud_sequence: true,
    });

    // Single splice to inject entire sequence
    userEvents.splice(midIdx + 1, 0, ...fraudEvents);
  }

  return record;
}
```

## Hook Documentation: Mixpanel Report Instructions (Required)

Every hook's documentation block MUST include a **"Mixpanel Report"** section with step-by-step instructions for recreating the insight in Mixpanel's UI. These instructions should be specific enough that someone unfamiliar with the data can follow them exactly and see the pattern.

### Report Types to Use

| Mixpanel Report Type | When to Use |
|---------------------|-------------|
| **Insights** | Comparing metrics across segments, property distributions, time series |
| **Funnels** | Conversion rate differences between segments |
| **Retention** | Cohort-based retention differences |
| **Flows** | Path analysis, event sequencing |

### Required Fields Per Hook

Each hook's "HOW TO FIND IT" section must include:

1. **Report type** — Which Mixpanel report to create (Insights, Funnels, Retention)
2. **Events** — Which event(s) to add to the report
3. **Measure** — What metric to use (Total, Uniques, Avg, Median, etc.)
4. **Breakdown** — Which property to break down by (if applicable)
5. **Filter** — Any filters to apply (property = value)
6. **Comparison** — What the user should compare (segment A vs B, before vs after, etc.)
7. **Expected result** — What the numbers should look like (e.g., "Premium segment should show ~3x higher avg reward value than Basic")

### Documentation Template Per Hook

```
───────────────────────────────────────────────────────────────────────────────
N. HOOK NAME (hook type)
───────────────────────────────────────────────────────────────────────────────

PATTERN: <what the hook does to the data>

HOW TO FIND IT IN MIXPANEL:

  Report 1: <Title>
  • Report type: Insights
  • Event: "<event_name>"
  • Measure: Average of <property_name>
  • Breakdown: <segment_property>
  • Filter: (optional) <property> = <value>
  • Compare: <segment_a> vs <segment_b>
  • Expected: <segment_a> should show ~Nx higher <metric> than <segment_b>

  Report 2 (optional): <Title>
  • Report type: Funnels
  • Steps: "<step1>" → "<step2>" → "<step3>"
  • Breakdown: <property>
  • Expected: <segment> should convert at ~X% vs ~Y% baseline

REAL-WORLD ANALOGUE: <why this pattern matters in production>
```

### Examples of Good Mixpanel Report Instructions

**Good (specific, actionable):**
```
HOW TO FIND IT IN MIXPANEL:

  Report 1: Premium Reward Value
  • Report type: Insights
  • Event: "reward redeemed"
  • Measure: Average of "value"
  • Breakdown: "account_tier"
  • Expected: "premium" should show ~3x higher avg value than "basic"
    (premium ≈ $30, plus ≈ $15, basic ≈ $10)

  Report 2: Premium Investment Returns
  • Report type: Insights
  • Event: "investment made"
  • Measure: Average of "amount"
  • Filter: "action" = "sell"
  • Breakdown: "account_tier"
  • Expected: "premium" should show ~2x higher avg sell amount
```

**Bad (vague, not actionable):**
```
HOW TO FIND IT:
  - Segment by account_tier
  - Compare reward values
  - Look for premium_reward = true
```

The bad example doesn't tell the user what report type to create, what metric to measure, or what numbers to expect. Always be specific.

## Common Pitfalls to Avoid

1. **Don't wrap plain string arrays in `pickAWinner()`**: Arrays of 3+ unique strings like `["email", "google", "facebook"]` are automatically power-law weighted by the engine. Just use the plain array. Only use `pickAWinner()` explicitly when you need the second argument or have < 3 items. Note: `u.pickAWinner(["a","b"], 0)` with 2 elements and integer index CRASHES — use a float index or add a 3rd element.
2. **Funnel event name mismatch**: If your funnel has `"first quest accepted"` but events array has `"quest accepted"`, validation fails. Names must match exactly.
3. **Using `record.properties.X` in hooks**: Properties are flat. Use `record.X` directly.
4. **Using `distinct_id` on spliced events**: The pipeline uses `user_id`, NOT `distinct_id`. Always copy `user_id: event.user_id` from the source event when creating new events in hooks.
5. **Using `scdProps`**: SCDs generate locally without credentials. Only Mixpanel *import* needs service credentials. You can use `scdProps` freely for local generation with `writeToDisk: true`.
6. **NEVER use `lookupTables`**: Always set to `[]`. Lookup tables require a separate manual import step that is not automated. Events should carry all their attributes directly as flat properties.
7. **Churn events in funnels**: Always mark `isChurnEvent` events with `isStrictEvent: true` so they aren't included in auto-generated funnels (otherwise the churn event can fire mid-funnel, which is wrong).

## JSON Schema Output (Required)

After writing the `.js` dungeon file, also generate a companion `<name>-schema.json` file in `./dungeons/` containing a stripped-down, plain JSON version of the schema — no function calls, no JS imports, just portable data.

### JSON Format Rules

- **Arrays** → keep as-is (random selection from values)
- **`weighNumRange(min, max, ...)`** → `{"$range": [min, max]}` (integer range)
- **`pickAWinner(array)`** → plain array (drop the weighting, just list the values)
- **`chance.xxx.bind(chance)`** → omit the property or use a static placeholder
- **Arrow functions / closures** → omit or use a static placeholder
- **`decimal(min, max, places)`** → `{"$float": [min, max], "decimals": places}`
- **Static values** → keep as-is
- **Hooks, mirrorProps, scdProps, groupKeys, groupProps** → omit (JS-only features)

### JSON Structure

```json
{
  "events": [
    {
      "event": "event_name",
      "weight": 5,
      "properties": {
        "prop_name": ["val1", "val2"],
        "numeric_prop": {"$range": [10, 500]},
        "float_prop": {"$float": [1.0, 5.0], "decimals": 2},
        "static_prop": "constant"
      }
    }
  ],
  "superProps": { ... },
  "userProps": { ... },
  "funnels": [
    {
      "sequence": ["event1", "event2"],
      "conversionRate": 50,
      "order": "sequential",
      "timeToConvert": 24,
      "isFirstFunnel": false,
      "weight": 5
    }
  ]
}
```

Include `isFirstEvent`, `isFirstFunnel`, `name`, `weight`, `order`, and other non-function config fields as-is. Omit any field whose value is a JS function.

## After Writing the Files

1. Validate the JS dungeon with: `node -e "import { validateDungeonConfig } from './lib/core/config-validator.js'; import c from './dungeons/FILENAME.js'; validateDungeonConfig(c); console.log('valid');"`
2. If validation fails, fix the issue (usually funnel event names or pickAWinner crashes)
3. Verify the hook function loads without errors
4. Verify the JSON schema file is valid JSON: `node -e "import fs from 'fs'; JSON.parse(fs.readFileSync('./dungeons/FILENAME-schema.json', 'utf8')); console.log('valid json');"`

## Verifying Hooks

A verify runner already exists at `scripts/verify-runner.mjs` — do NOT create a new one. Use it to generate a small dataset and verify hooks with DuckDB:

```bash
# Generate test data (1K users, 100K events)
node scripts/verify-runner.mjs dungeons/FILENAME.js verify-FILENAME

# Query the output with DuckDB to verify hook patterns
duckdb -c "SELECT ... FROM 'verify-FILENAME__events.json'"
```

The runner overrides: `numUsers=1000, numEvents=100_000, format=json, writeToDisk=true, concurrency=1`.

## Quality Checklist

- [ ] App narrative is detailed and explains design choices
- [ ] 15-20 events with realistic properties and weights
- [ ] 5 funnels with one marked `isFirstFunnel`
- [ ] All funnel event names exist in events array
- [ ] 8 hooks using varied techniques (not all `everything`)
- [ ] Each hook has a clear "how to find it" with **specific Mixpanel report instructions** (report type, event, measure, breakdown, filter, expected result)
- [ ] Each hook has a real-world analogue explained
- [ ] Documentation block includes metrics summary table
- [ ] No `pickAWinner` calls with exactly 2 items and integer index
- [ ] `lookupTables: []` (no lookup tables — events carry all attributes)
- [ ] Passes `validateDungeonConfig`
- [ ] Companion `<name>-schema.json` file generated with portable JSON schema
- [ ] JSON schema is valid JSON and matches the JS dungeon's events/funnels/props
