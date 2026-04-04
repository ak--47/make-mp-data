---
name: verify-hooks
description: Run a dungeon with constrained parameters and use DuckDB to verify that hook-created data patterns actually appear in the output. Produces a hook-results.md diagnostic report.
argument-hint: [path to dungeon file, e.g. dungeons/harness/harness-gaming.js]
model: claude-opus-4-6
effort: max
---

# Verify Hooks

Verify that the hooks in a dungeon config actually produce their intended data patterns. Run the dungeon at small scale, query the output with DuckDB, and produce a diagnostic `hook-results.md` report.

**Dungeon file:** `$ARGUMENTS`

## Important: How Hooks Execute in the Pipeline

Before analyzing hooks, understand the execution model so you can correctly predict what the output data should look like:

### Hook Type Execution Order (per user)

1. `"user"` — profile created, hook fires (user-loop.js:137)
2. `"scd-pre"` — SCD entries created, hook fires (user-loop.js:156)
3. `"funnel-pre"` → `"event"` (per funnel event) → `"funnel-post"` — for each funnel
4. `"event"` — for non-funnel events (events.js:176)
5. `"everything"` — all user events at once (user-loop.js:222)
6. **Storage phase** — data written to disk. Hooks for `event`, `user`, `scd` do NOT re-fire here (already applied above). Hooks for `mirror`, `ad-spend`, `group`, `lookup` fire only in storage.

### Return Value Behavior

- `"event"` hook: return value IS used (replaces the event)
- `"everything"` hook: return value IS used if it's an array (replaces event list)
- `"user"`, `"scd-pre"`, `"funnel-post"` hooks: return value is IGNORED — only in-place mutations work
- `"funnel-pre"` hook: return value is IGNORED — mutate the `record` object in-place (e.g., `record.conversionRate = 0.9`)

### Nested Properties

Event properties are usually flat, but some dungeons may use arrays of objects or nested structures in event properties. When querying with DuckDB:
- Use `json_extract()` or arrow syntax (`column->'key'`) for nested JSON fields
- Use `UNNEST()` for array-type columns
- Check the dungeon's event property definitions for any non-scalar types before writing queries
- Run a quick `SELECT * FROM read_json_auto('./data/verify-hooks-EVENTS.json') LIMIT 5` to inspect the actual schema

## Step 1: Read & Catalog the Hooks

Read the dungeon file at `$ARGUMENTS`. If it's a bare filename (no `/`), check `dungeons/` and `dungeons/harness/` directories.

Find and analyze:

1. **The `hook:` function** — read the full function body
2. **The documentation comment block** — typically a `/** ... */` block above or near the hook that describes all the architected patterns
3. **Module-level closure state** — look for `Map`, `Set`, or tracking variables defined outside the hook function but used inside it

For each hook/pattern, catalog:
- **Hook number and name** (e.g., "Hook #1: Ancient Compass users have 3x quest completion")
- **Hook type** (`event`, `everything`, `funnel-pre`, `funnel-post`, `user`, `scd-pre`)
- **Mechanism** — what the hook code actually does (modifies properties, splices events, changes conversion rates, etc.)
- **Expected signal** — the specific, measurable outcome you should see in the data (e.g., "compass_user=true events should have ~1.5x reward_gold compared to compass_user=false")
- **Which output file** the signal lives in (events, users, groups, etc.)

## Step 2: Run the Dungeon

Create a temporary runner script and execute the dungeon with constrained parameters.

Create `verify-runner.mjs` in the project root:

```javascript
import generate from './index.js';
import path from 'path';

const dungeonPath = process.argv[2];
const absolutePath = path.isAbsolute(dungeonPath)
  ? dungeonPath
  : path.resolve(process.cwd(), dungeonPath);

const { default: config } = await import(absolutePath);

const results = await generate({
  ...config,
  token: "",
  numUsers: 1000,
  numEvents: 100_000,
  format: "json",
  gzip: false,
  writeToDisk: true,
  name: "verify-hooks",
  concurrency: 1,
});

console.log(JSON.stringify({
  eventCount: results.eventCount,
  userCount: results.userCount,
  files: results.files,
  duration: results.time?.human || results.time?.delta + 'ms'
}));
```

Run it:
```bash
node verify-runner.mjs <absolute-path-to-dungeon>
```

After the run completes, delete `verify-runner.mjs`.

**Expected output files** (in `./data/`):
- `verify-hooks-EVENTS.json` — all events (JSONL format, one JSON object per line)
- `verify-hooks-USERS.json` — user profiles
- `verify-hooks-*-GROUPS.json` — group profiles (if dungeon has groups)
- `verify-hooks-*-SCD.json` — SCD data (if dungeon has SCDs)

## Step 3: Verify Each Hook with DuckDB

For each cataloged hook, write and execute a DuckDB SQL query that tests whether the expected pattern exists in the data.

**DuckDB command pattern:**
```bash
/opt/homebrew/bin/duckdb -c "SQL_QUERY_HERE"
```

**Reading data files:**
```sql
-- Events
SELECT * FROM read_json_auto('./data/verify-hooks-EVENTS.json')

-- User profiles
SELECT * FROM read_json_auto('./data/verify-hooks-USERS.json')
```

### Important DuckDB Notes

- The output is **JSONL** (newline-delimited JSON) — `read_json_auto()` handles this natively
- **Properties are FLAT on event records** — use `event.amount`, NOT `event.properties.amount`
- **Time field** is an ISO string — use `CAST(time AS TIMESTAMP)` or `time::TIMESTAMP` for date operations
- Use `COALESCE(column, default)` for properties that only exist on some events (spliced events may lack some fields)
- Use `TRY_CAST()` instead of `CAST()` for columns that might have mixed types
- For large queries, use `LIMIT` to keep output manageable
- Escape single quotes in bash: use `$'...'` syntax or double-quote the SQL and escape internal quotes

### Query Design Approach

For each hook, design a query that compares:
- **Affected group** (users/events where the hook should have had an effect)
- **Control group** (users/events where the hook should NOT have had an effect)
- **Metric** (the specific measure that should differ between groups)

Then compute a **ratio** or **difference** and compare it to the expected effect size.

### DuckDB Query Templates by Hook Archetype

**Segment Comparison** (e.g., "premium users have higher engagement"):
```sql
SELECT
  segment_property,
  COUNT(*) as event_count,
  AVG(metric) as avg_metric,
  COUNT(DISTINCT user_id) as unique_users
FROM read_json_auto('./data/verify-hooks-EVENTS.json')
WHERE event = 'relevant_event'
GROUP BY segment_property
ORDER BY segment_property;
```

**Time-Based Anomaly** (e.g., "cursed week has higher death rate"):
```sql
WITH events AS (
  SELECT *, time::TIMESTAMP as ts
  FROM read_json_auto('./data/verify-hooks-EVENTS.json')
)
SELECT
  CASE
    WHEN ts BETWEEN 'start_date' AND 'end_date' THEN 'anomaly_window'
    ELSE 'normal'
  END as period,
  COUNT(*) FILTER (WHERE event = 'target_event') as target_count,
  COUNT(*) as total_events,
  ROUND(COUNT(*) FILTER (WHERE event = 'target_event') * 100.0 / COUNT(*), 2) as target_pct
FROM events
GROUP BY period;
```

**Retention / Churn** (e.g., "early guild joiners retain better"):
```sql
WITH user_first_event AS (
  SELECT user_id, MIN(time::TIMESTAMP) as first_seen
  FROM read_json_auto('./data/verify-hooks-EVENTS.json')
  GROUP BY user_id
),
user_segments AS (
  SELECT
    e.user_id,
    BOOL_OR(e.event = 'guild joined'
      AND (e.time::TIMESTAMP - f.first_seen) < INTERVAL '3 days') as early_joiner
  FROM read_json_auto('./data/verify-hooks-EVENTS.json') e
  JOIN user_first_event f ON e.user_id = f.user_id
  GROUP BY e.user_id
),
user_activity AS (
  SELECT
    e.user_id,
    MAX(e.time::TIMESTAMP) - MIN(e.time::TIMESTAMP) as active_span
  FROM read_json_auto('./data/verify-hooks-EVENTS.json') e
  GROUP BY e.user_id
)
SELECT
  s.early_joiner,
  COUNT(*) as users,
  AVG(EXTRACT(DAY FROM a.active_span)) as avg_active_days
FROM user_segments s
JOIN user_activity a ON s.user_id = a.user_id
GROUP BY s.early_joiner;
```

**Revenue / LTV** (e.g., "lucky charm buyers spend 5x more"):
```sql
WITH buyer_segments AS (
  SELECT
    user_id,
    BOOL_OR(event = 'real money purchase' AND product = 'Lucky Charm Pack') as is_target_buyer
  FROM read_json_auto('./data/verify-hooks-EVENTS.json')
  GROUP BY user_id
)
SELECT
  b.is_target_buyer,
  COUNT(*) FILTER (WHERE e.event = 'real money purchase') as purchase_count,
  ROUND(AVG(TRY_CAST(e.price_usd AS DOUBLE)), 2) as avg_purchase,
  ROUND(SUM(TRY_CAST(e.price_usd AS DOUBLE)), 2) as total_revenue,
  COUNT(DISTINCT b.user_id) as users
FROM buyer_segments b
JOIN read_json_auto('./data/verify-hooks-EVENTS.json') e ON b.user_id = e.user_id
GROUP BY b.is_target_buyer;
```

**Funnel Conversion** (e.g., "segment A converts better"):
```sql
WITH step1 AS (
  SELECT DISTINCT user_id, segment_prop
  FROM read_json_auto('./data/verify-hooks-EVENTS.json')
  WHERE event = 'funnel_step_1'
),
step2 AS (
  SELECT DISTINCT user_id
  FROM read_json_auto('./data/verify-hooks-EVENTS.json')
  WHERE event = 'funnel_step_2'
)
SELECT
  s1.segment_prop,
  COUNT(DISTINCT s1.user_id) as started,
  COUNT(DISTINCT s2.user_id) as completed,
  ROUND(COUNT(DISTINCT s2.user_id) * 100.0 / COUNT(DISTINCT s1.user_id), 2) as conversion_pct
FROM step1 s1
LEFT JOIN step2 s2 ON s1.user_id = s2.user_id
GROUP BY s1.segment_prop;
```

**Property Distribution Shift** (e.g., "completion_status breakdown differs by segment"):
```sql
SELECT
  segment_column,
  property_column,
  COUNT(*) as cnt,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY segment_column), 2) as pct
FROM read_json_auto('./data/verify-hooks-EVENTS.json')
WHERE event = 'relevant_event'
GROUP BY segment_column, property_column
ORDER BY segment_column, cnt DESC;
```

**Event Existence After Date** (e.g., "legendary weapon only appears after day 45"):
```sql
SELECT
  CASE WHEN time::TIMESTAMP < 'release_date' THEN 'before' ELSE 'after' END as period,
  COUNT(*) as occurrences
FROM read_json_auto('./data/verify-hooks-EVENTS.json')
WHERE event = 'find treasure' AND treasure_type = 'Shadowmourne Legendary'
GROUP BY period;
```

**Cross-Table Correlation** (e.g., "user profile tier drives event behavior via `everything` hook"):

The `everything` hook can read `meta.profile` and stamp user properties onto every event. To verify, JOIN events with user profiles:
```sql
WITH users AS (
  SELECT * FROM read_json_auto('./data/verify-hooks-USERS.json')
),
events AS (
  SELECT * FROM read_json_auto('./data/verify-hooks-EVENTS.json')
)
SELECT
  u.tier,
  COUNT(*) as event_count,
  COUNT(DISTINCT e.user_id) as user_count,
  ROUND(COUNT(*) * 1.0 / COUNT(DISTINCT e.user_id), 2) as events_per_user,
  AVG(TRY_CAST(e.metric AS DOUBLE)) as avg_metric
FROM events e
JOIN users u ON e.user_id = u.distinct_id
GROUP BY u.tier
ORDER BY u.tier;
```

When verifying `everything` hooks, check BOTH the events file AND the users file — the hook may stamp properties from profiles onto events, creating correlations that span both tables. Common patterns:
- User tier/segment → event count, conversion, revenue differences
- User profile enrichment (via `user` hook) → event behavior (via `everything` hook)
- Churn simulation: users with certain profiles have fewer events in later time periods

**Output files by data type:**
- `verify-hooks-EVENTS.json` — events (most hooks produce effects here)
- `verify-hooks-USERS.json` — user profiles (check for `user` hook enrichment)
- `verify-hooks-*-GROUPS.json` — group profiles (if groups configured)
- `verify-hooks-*-SCD.json` — SCD data (if SCDs configured)

### Query Execution

Run each query separately. For each query:
1. Execute via `/opt/homebrew/bin/duckdb -c "..."`
2. Capture the output
3. If a query fails (column not found, type error), adjust and retry — the schema depends on what the hook actually writes
4. Record both the query and the raw results

### Statistical Caveats

With ~1000 users and ~100K events:
- Most hooks with >= 10% affected population will show clear signal
- Hooks affecting < 2% of users (e.g., "2% find legendary weapon") may show WEAK results due to small sample size — this is expected
- Note sample size in the report when it's a factor

## Step 4: Write hook-results.md

Write the diagnostic report to `./hook-results.md` in the project root.

### Report Structure

```markdown
# Hook Verification Report

**Dungeon:** `<filename>`
**Run Date:** <date>
**Users:** <count> | **Events:** <count> | **Duration:** <time>

## Summary

| # | Hook Name | Type | Expected Effect | Observed | Verdict |
|---|-----------|------|-----------------|----------|---------|
| 1 | ... | event | ... | ... | PASS |
| 2 | ... | everything | ... | ... | WEAK |
| 3 | ... | funnel-pre | ... | ... | FAIL |

## Detailed Results

### Hook #1: <Name>

**Intent:** <what the hook is supposed to do>
**Type:** `<hook type>`
**Mechanism:** <brief description of how the code works>

**Query:**
```sql
<the actual SQL executed>
`` `

**Results:**
<paste the DuckDB output table>

**Analysis:** <interpret the numbers — does the ratio/difference match expectations?>

**Verdict:** PASS / WEAK / FAIL

---
<repeat for each hook>

## Recommendations

<For any WEAK or FAIL hooks, provide specific, actionable suggestions>
<Include what the hook code should change to produce the intended effect>
<Reference specific line numbers in the hook function>
```

### Verdict Criteria

- **PASS** — The observed effect is >= 60% of the expected magnitude and in the correct direction
- **WEAK** — The pattern exists (correct direction) but is weaker than expected (30-60% of target), OR the sample size is too small to be conclusive
- **FAIL** — No discernible pattern, the effect is reversed, or the hook-created properties don't appear in the data at all

## Step 5: Cleanup

After writing the report:

```bash
rm -f ./data/verify-hooks-*
rm -f ./verify-runner.mjs
```

Remove ALL files matching the `verify-hooks-*` pattern in `./data/`. These are throwaway diagnostic files.

## Final Output

After cleanup, tell the user:
1. Where the report is: `./hook-results.md`
2. How many hooks passed, were weak, or failed
3. A one-line summary of the most interesting finding

If hooks failed, note that `hook-results.md` can be used as context for fixing the hooks (e.g., "read hook-results.md and fix the failing hooks in <dungeon-file>").
