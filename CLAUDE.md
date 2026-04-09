# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**make-mp-data** (aka DM4 — Dungeon Master 4) is a Node.js CLI tool and ES module for generating realistic fake Mixpanel data at scale. It creates events, user profiles, group profiles, SCDs (Slowly Changing Dimensions), lookup tables, ad spend data, funnel analytics, and organic text — everything needed for testing and demoing Mixpanel.

It is a **CLI tool** (`npx make-mp-data`) and an **npm module** (`import generate from 'make-mp-data'`). It is NOT a cloud function or server.

## Architecture

```
lib/
├── core/           # Context, config validation, HookedArray storage
├── generators/     # Event, funnel, profile, SCD, adspend, mirror, text, product generators
├── orchestrators/  # user-loop (main generation), mixpanel-sender (import)
├── utils/          # utils, logger (Pino), mixpanel tracking, chart, project
├── cli/            # CLI argument parsing (yargs)
└── templates/      # Default data, phrase banks, AI instruction templates, hook examples
scripts/            # dungeon management (create, run, convert to/from JSON)
dungeons/           # Pre-built dungeon configurations (simple, complex, sanity, etc.)
tests/              # Vitest test suite
```

### Key Patterns

- **Context Pattern**: All state flows through a `Context` object (config, storage, defaults, runtime metrics, time constants). No global state except `FIXED_NOW`/`FIXED_BEGIN` timestamps.
- **HookedArray**: Storage containers that support hook-based transformation, automatic batching to disk, and streaming to CSV/JSON/Parquet with optional gzip.
- **Dungeon Configs**: JS files that export a `Dungeon` configuration object defining events, funnels, user/group props, SCDs, etc.
- **Seeded RNG**: All randomness uses `chance` with configurable seeds for reproducible output.

### Data Generation Pipeline (index.js)

1. Validate config + compute `FIXED_BEGIN` from `numDays`
2. Create context
3. Initialize HookedArray storage containers
4. Generate ad spend (if `hasAdSpend`)
5. Main `userLoop()` — generates users, profiles, events, funnels, SCDs
6. Generate group profiles
7. Generate group SCDs
8. Generate lookup tables
9. Generate mirror datasets
10. Flush to disk (if `writeToDisk`)
11. Send to Mixpanel (if `token` provided)
12. Return results

## Commands

```bash
npm test                      # Vitest test suite
npm run typecheck             # tsc --noEmit
npm run dev                   # nodemon scratch.mjs
npm run prune                 # Clean generated data files

# Dungeon management
npm run dungeon:new           # Create new dungeon template
npm run dungeon:run           # Run a dungeon file
npm run dungeon:to-json       # Convert JS dungeon → JSON (for UI)
npm run dungeon:from-json     # Convert JSON → JS dungeon

# CLI usage
npx make-mp-data --simple     # Simple dungeon
npx make-mp-data --complex    # Complex dungeon with groups, SCDs, lookups
npx make-mp-data myConfig.js  # Custom dungeon file
```

## Tests

Uses **Vitest** (ESM-native). Test files:

- `tests/unit.test.js` — Individual function tests (text generator, utils, weights)
- `tests/int.test.js` — Integration tests (context, storage, orchestrators)
- `tests/e2e.test.js` — End-to-end generation + Mixpanel import
- `tests/cli.test.js` — CLI argument parsing and execution
- `tests/sanity.test.js` — Module integration (all dungeon types, formats, batch mode)
- `tests/performance.test.js` — Context caching, device pools, time shift
- `tests/hooks.test.js` — Hook system: all hook types, double-fire prevention, patterns (temporal, two-pass, closure state)
- `tests/new-features.test.js` — strictEventCount, bornRecentBias, hook strings, product generators, function registry, JSON evaluator

## Core Modules

### Generators (`lib/generators/`)

| File | Purpose |
|------|---------|
| `events.js` | Creates individual Mixpanel events with TimeSoup time distribution |
| `funnels.js` | Conversion sequences with ordering strategies, experiments (A/B/C variants), `bindPropsIndex` |
| `profiles.js` | User and group profile generation via `choose()` property resolution |
| `scd.js` | Slowly Changing Dimensions with frequency/timing/max config; outputs `time`, `startTime`, `insertTime` |
| `adspend.js` | Ad spend events with realistic cost/CPC/CTR/click metrics |
| `mirror.js` | Transform event data (create/update/fill/delete strategies) |
| `text.js` | Organic text generation (`createTextGenerator`/`generateBatch`) with styles, tones, typos, keywords |
| `product-lookup.js` | E-commerce product catalog (10K+ products with categories, ratings, stock) |
| `product-names.js` | Pre-configured text generators for product reviews, searches, comparisons |

### Core (`lib/core/`)

| File | Purpose |
|------|---------|
| `context.js` | Context factory. Pre-computes weighted defaults, device pools. Time shift uses `.add(1, "day")`. No `isCLI`. |
| `config-validator.js` | Validates/enriches dungeon config. Hook string→function conversion, `strictEventCount` forces concurrency=1, event weight clamping [1,10], SCD credential fallback for UI jobs, `isStrictEvent` filtering in `inferFunnels()` |
| `storage.js` | HookedArray with batching, event validation in hook path, Pino logging, entity type tracking for SCDs |

### Utils (`lib/utils/`)

| File | Purpose |
|------|---------|
| `utils.js` | RNG (`initChance`/`getChance`), pickers (`pick`/`choose`/`weighArray`), `TimeSoup`, streaming (CSV/JSON/Parquet), `bytesHuman`, `formatDuration` |
| `logger.js` | Pino structured logging. Silent in `NODE_ENV=test`, pretty in dev, JSON in production. Child loggers: `serverLogger`, `dataLogger`, `importLogger` |
| `mixpanel.js` | Server-side Mixpanel tracking for AI observability (`trackAIJob`) |
| `function-registry.js` | Registry of valid functions for JSON dungeon configs (validation) |
| `json-evaluator.js` | Converts JSON function call objects to JavaScript code strings |
| `project.js` | Mixpanel project setup utilities |

### Orchestrators (`lib/orchestrators/`)

| File | Purpose |
|------|---------|
| `user-loop.js` | Main generation loop. `strictEventCount` bailout, `bornRecentBias` (power function for birth dates), memory/time in progress display, `percentUsersBornInDataset` default=15 |
| `mixpanel-sender.js` | Imports all data types to Mixpanel. Reads from batch files if needed. SCD type inference from values. |

## Key Config Properties

```typescript
interface Dungeon {
  // Core
  numUsers, numEvents, numDays, seed, format, token, region

  // Features
  hasAdSpend, hasCampaigns, hasLocation, hasAvatar, hasBrowser
  hasAndroidDevices, hasIOSDevices, hasDesktopDevices
  hasAnonIds, hasSessionIds, isAnonymous

  // Data model
  events: EventConfig[]         // event name, weight, properties, isFirstEvent, isStrictEvent
  funnels: Funnel[]             // sequence, conversionRate, order, experiment, bindPropsIndex
  userProps, superProps, groupKeys, groupProps, scdProps, mirrorProps, lookupTables

  // Advanced
  strictEventCount: boolean     // Stop at exact numEvents (forces concurrency=1)
  bornRecentBias: number        // 0=uniform, 1=heavily recent user births (default 0.3)
  percentUsersBornInDataset     // Default 15
  soup: SoupPreset | SoupConfig     // Time distribution (see TimeSoup section below)

  // I/O
  writeToDisk, gzip, batchSize, concurrency, verbose
  hook: Hook                    // Transform function (string or function)
}
```

## Hook System

Hooks are the primary mechanism for engineering deliberate trends and patterns in generated data. A hook is a single function on the dungeon config that receives every piece of data as it flows through the pipeline, with the opportunity to mutate it.

### Signature

```javascript
hook: function(record, type, meta) {
  // mutate record or return a new one
  return record;
}
```

- `record` — the data object being processed (event, profile, funnel config, or array of events)
- `type` — string identifying what kind of data (`"event"`, `"user"`, `"everything"`, etc.)
- `meta` — contextual metadata (varies by type)

### Hook Types and Execution Order

Per user, hooks fire in this order:

| Type | Fires in | `record` is | Return value | Metadata |
|------|----------|-------------|--------------|----------|
| `"user"` | `user-loop.js:137` | User profile object | Ignored (mutate in-place) | `{ user, config, userIsBornInDataset }` |
| `"scd-pre"` | `user-loop.js:156` | Array of SCD entries | Ignored (mutate in-place) | `{ profile, type, scd, config, allSCDs }` |
| `"funnel-pre"` | `funnels.js:70` | Funnel config object | Ignored (mutate in-place) | `{ user, profile, scd, funnel, config, firstEventTime }` |
| `"event"` | `events.js:176` | Single event (flat props) | **Used** (replaces event) | `{ user: { distinct_id }, config }` |
| `"funnel-post"` | `funnels.js:153` | Array of funnel events | Ignored (mutate in-place) | `{ user, profile, scd, funnel, config }` |
| `"everything"` | `user-loop.js:222` | Array of ALL user events | **Used** if array returned | `{ profile, scd, config, userIsBornInDataset }` |

Storage-only hooks (no upstream execution):

| Type | Fires in | `record` is |
|------|----------|-------------|
| `"ad-spend"` | `storage.js` | Ad spend event |
| `"group"` | `storage.js` | Group profile |
| `"mirror"` | `storage.js` | Mirror data point |
| `"lookup"` | `storage.js` | Lookup table entry |

**Important**: `event`, `user`, and `scd` hooks fire only once — in the generator/orchestrator. The storage layer skips re-running hooks for these types to prevent double-fire mutations (e.g., `price *= 2` would otherwise apply twice).

### Hook Patterns Catalog

These are the proven techniques used across harness dungeons:

| Pattern | Hook Type | Description | Example |
|---------|-----------|-------------|---------|
| **Property modification** | `event` | Set/modify properties on specific events | `record.amount = 999` |
| **Event renaming** | `event` | Change event name to create hook-only event types | `record.event = "incident created"` |
| **Temporal windowing** | `event` | Modify events within a date range (cursed week, product launch) | Check `dayjs(record.time).isAfter(start)` |
| **Relative date windows** | `event` | Use `DATASET_START.add(N, 'days')` for portable time ranges | Launch day 45, outage days 20-27 |
| **User profile enrichment** | `user` | Add computed properties to profiles | `record.segment = "power_user"` |
| **Funnel conversion manipulation** | `funnel-pre` | Change `record.conversionRate` based on user properties | Premium users get 1.3x conversion |
| **Funnel event injection** | `funnel-post` | Splice extra events between funnel steps | Push coupon event into array |
| **Two-pass processing** | `everything` | First pass: scan patterns. Second pass: modify events | Identify buyers, then tag all their events |
| **Cross-table correlation** | `everything` | Use `meta.profile` to drive event modifications | User tier determines event behavior |
| **Event filtering/removal** | `everything` | Return filtered array to simulate churn | `return record.filter(e => ...)` |
| **Event injection** | `everything` | Append synthetic events to user's event stream | Push "milestone" events |
| **Event duplication** | `everything` | Clone events with time offsets (weekend surge, viral) | Spread copies + add 1-3 hour offset |
| **Closure-based state (Maps)** | `event` | Module-level Maps track state across users | Cost overrun → forced scale-down next event |
| **Hash-based cohorts** | `everything` | Deterministic user segmentation without randomness | `userId.charCodeAt(0) % 10 === 0` |
| **Compound conditions** | `everything` | Require multiple behaviors for an effect | Slack AND PagerDuty → faster resolution |

### Critical Hook Rules

1. **Properties are FLAT on event records** — use `record.amount`, NOT `record.properties.amount`
2. **Spliced events need `user_id`** — copy from source event: `user_id: event.user_id` (not `distinct_id`)
3. **Spliced events need `time`** — must be a valid ISO string
4. **Use `dayjs` for time operations** inside hooks
5. **Use the seeded `chance` instance** from module scope for randomness
6. **`everything` is the most powerful hook** — it sees all events for one user, can correlate across event types, and access `meta.profile` to drive behavior based on user properties
7. **Return `record`** from `event` hooks (single object only — do NOT return arrays). For `everything`, return the (possibly modified) array
8. **To drop/filter events (churn, drop-off, seasonal dips)**: you cannot drop events from the `event` hook. Use the `everything` hook: `return record.filter(e => !shouldDrop(e))`. For tag-and-filter: set `record._drop = true` in the `event` hook, then `return record.filter(e => !e._drop)` in `everything`. Do NOT use `return {}` — it creates broken events with no event name

## TimeSoup — Time Distribution System

TimeSoup controls how events are distributed across the time range. It uses Gaussian cluster sampling layered with day-of-week and hour-of-day accept/reject weighting derived from real Mixpanel data.

### Soup Presets

Set `soup` to a preset string for quick configuration:

```javascript
soup: "growth"     // default — gradual uptrend with weekly cycle
soup: "steady"     // flat, mature SaaS pattern
soup: "spiky"      // dramatic peaks and valleys
soup: "seasonal"   // 3-4 major waves across the dataset
soup: "global"     // flat DOW + flat HOD (no cyclical patterns)
soup: "churny"     // flat distribution, all users pre-exist (pair with churn hooks)
soup: "chaotic"    // wild variation, few tight peaks
```

Presets also suggest `bornRecentBias` and `percentUsersBornInDataset` values (applied only if not explicitly set in the dungeon config).

### Custom Soup Config

Override specific parameters or use a preset as a base:

```javascript
// Preset with overrides
soup: { preset: "spiky", deviation: 5 }

// Fully custom
soup: {
  peaks: 200,           // number of Gaussian clusters (default: numDays*2)
  deviation: 2,         // peak tightness, higher = tighter (default: 2)
  mean: 0,              // offset from chunk center (default: 0)
  dayOfWeekWeights: [0.637, 1.0, 0.999, 0.998, 0.966, 0.802, 0.528],  // [Sun..Sat]
  hourOfDayWeights: [/* 24 elements, 0=midnight UTC */],
}

// Disable cyclical patterns
soup: { dayOfWeekWeights: null, hourOfDayWeights: null }
```

### Key Implementation Details

- DOW uses accept/reject sampling (retry with new Gaussian sample if rejected)
- HOD uses redistribution (directly sample a new hour from weight distribution)
- Peaks default to `numDays * 2` to avoid chunk-boundary interference with 7-day week cycle
- Default weights are derived from real Mixpanel data and produce realistic weekly "matterhorn hump" and daily curves
- Presets are defined in `lib/templates/soup-presets.js` and resolved in `config-validator.js`

## Dependencies

**Core**: `ak-tools`, `chance`, `dayjs`, `yargs`, `mixpanel-import`, `p-limit`, `seedrandom`, `pino`, `pino-pretty`, `mixpanel`, `sentiment`, `tracery-grammar`, `hyparquet-writer`

**Cloud**: `@google-cloud/storage` (for `gs://` output paths)

**Dev**: `vitest`, `nodemon`, `typescript`

## Important Notes

- **ESM only** — `"type": "module"` in package.json
- **Time model**: Events are generated in a fixed historical window (`FIXED_NOW` = 2024-02-02), then shifted forward to present. `FIXED_BEGIN` is computed dynamically from `numDays`.
- **Hook types**: See Hook System section above. Core types: `event`, `user`, `everything`, `funnel-pre`, `funnel-post`, `scd-pre`. Storage-only: `ad-spend`, `group`, `mirror`, `lookup`

---

## TODO

### Performance: dayjs optimization (deferred)

Primary bottleneck is date/time manipulation. `TimeSoup` creates dayjs objects + `toISOString()` on every event. Fix: perform all time calculations using numeric Unix timestamps and only convert to ISO string once at the end. Key locations: `TimeSoup` in `utils.js`, timestamp handling in `events.js` and `user-loop.js`. Constraint: must preserve deterministic seeded generation within a bounded time range, then shift timestamps forward to present.
