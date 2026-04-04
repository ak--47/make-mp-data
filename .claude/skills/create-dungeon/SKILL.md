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
- `brain/utils/utils.js` — search for `pickAWinner`, `weighNumRange`, `initChance`, `exhaust`, `takeSome` to understand available utilities
- `brain/generators/events.js` — search for `hook` to see how `type === "event"` hooks are called (properties are FLAT on record)
- `brain/generators/funnels.js` — search for `hook` to see `funnel-pre` and `funnel-post` invocation
- `brain/orchestrators/user-loop.js` — search for `hook` to see `user`, `scd-pre`, and `everything` invocation
- `brain/core/config-validator.js` — understand validation rules (especially funnel event name matching)

If you wish, you can view how existing ./dungeons are structured for reference and how ./customers dungeons are for specific customers. Try to provide a realistic event/prop/user schema with the context you have from the prompt.

## File Structure

```javascript
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../brain/utils/utils.js";
import * as v from "ak-tools";

const SEED = "needle-haystack-VERTICAL";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef  {import("../types.js").Dungeon} Config */

/**
 * APP DESIGN DOCUMENTATION
 * - App name, concept, what it models
 * - Core gameplay/usage loop
 * - Why each event and property was chosen
 * - Monetization model
 */

// Generate consistent IDs at module level
const entityIds = v.range(1, N).map(n => `prefix_${v.uid(8)}`);

/** @type {Config} */
const config = { ... };

export default config;

/**
 * COMPREHENSIVE DOCUMENTATION BLOCK
 * - Dataset overview
 * - All 8 hooks with: pattern, how to find it, expected insight, real-world analogue
 * - Expected metrics summary table
 * - Cross-hook analysis ideas
 */
```

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
makeChart: false,
batchSize: 2_500_000,
concurrency: 1,
writeToDisk: false,
scdProps: {},
mirrorProps: {},
lookupTables: [],
```

## Required Components

### 1. Events (15-20)
- Include `isFirstEvent: true` on the signup/account creation event
- Use `u.pickAWinner(array)` for categorical distributions (power-law weighted)
- Use `u.weighNumRange(min, max, skew?, center?)` for numeric ranges (Box-Muller)
- Use plain arrays `[val1, val2, val3]` for uniform random selection
- Each event needs `event` (name), `weight` (relative frequency), `properties` (object)

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
| `"scd-pre"` | Array of SCD entries | Ignored — mutate in-place | `user-loop.js` before SCD write |
| `"everything"` | Array of ALL events for one user | Return array to replace event list | `user-loop.js` after all events generated |

### Critical Hook Rules

1. **Properties are FLAT on event records in hooks** — use `record.amount`, NOT `record.properties.amount`
2. When splicing events in `everything`, new events need: `event`, `time` (ISO string), `user_id` (copied from source event's `event.user_id`), plus flat properties. The pipeline uses `user_id` NOT `distinct_id`.
3. Use `dayjs` for all time operations inside hooks
4. Use the seeded `chance` instance (from module scope) for randomness in hooks
5. Return `record` to keep/modify from `event` hooks (single object only — do NOT return arrays).
6. **To drop/filter events** (for churn, drop-off, or trend patterns): you CANNOT drop events from the `event` hook — there is no way to suppress an event from within `type === "event"`. Instead, use ONE of these patterns:
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
- 2-4 `event` hooks (property modification, temporal windows, day-of-week)
- 1-2 `everything` hooks (two-pass processing, cross-table correlation, churn/retention)
- 1-2 of: `user`, `funnel-pre`, or `funnel-post`
- 0-1 using module-level closure state (Maps)

## Common Pitfalls to Avoid

1. **`pickAWinner` with 2-element arrays and integer index**: `u.pickAWinner(["a","b"], 0)` CRASHES. Fix: add a 3rd element `u.pickAWinner(["a","b","a"])` or use a float index `u.pickAWinner(["a","b"], 0.3)`
2. **Funnel event name mismatch**: If your funnel has `"first quest accepted"` but events array has `"quest accepted"`, validation fails. Names must match exactly.
3. **Using `record.properties.X` in hooks**: Properties are flat. Use `record.X` directly.
4. **Using `distinct_id` on spliced events**: The pipeline uses `user_id`, NOT `distinct_id`. Always copy `user_id: event.user_id` from the source event when creating new events in hooks.
5. **Using `scdProps`**: Leave as `{}` — SCD import requires service credentials we don't have.
6. **Using `lookupTables`**: Always set to `[]` — events should carry all their attributes directly as properties, no separate dimension tables.

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

1. Validate the JS dungeon with: `node -e "import { validateDungeonConfig } from './brain/core/config-validator.js'; import c from './dungeons/FILENAME.js'; validateDungeonConfig(c); console.log('valid');"`
2. If validation fails, fix the issue (usually funnel event names or pickAWinner crashes)
3. Verify the hook function loads without errors
4. Verify the JSON schema file is valid JSON: `node -e "import fs from 'fs'; JSON.parse(fs.readFileSync('./dungeons/FILENAME-schema.json', 'utf8')); console.log('valid json');"`

## Quality Checklist

- [ ] App narrative is detailed and explains design choices
- [ ] 15-20 events with realistic properties and weights
- [ ] 5 funnels with one marked `isFirstFunnel`
- [ ] All funnel event names exist in events array
- [ ] 8 hooks using varied techniques (not all `everything`)
- [ ] Each hook has a clear "how to find it" in the documentation
- [ ] Each hook has a real-world analogue explained
- [ ] Documentation block includes metrics summary table
- [ ] No `pickAWinner` calls with exactly 2 items and integer index
- [ ] `lookupTables: []` (no lookup tables — events carry all attributes)
- [ ] Passes `validateDungeonConfig`
- [ ] Companion `<name>-schema.json` file generated with portable JSON schema
- [ ] JSON schema is valid JSON and matches the JS dungeon's events/funnels/props
