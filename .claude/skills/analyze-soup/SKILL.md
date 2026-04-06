---
name: analyze-soup
description: Run a dungeon locally (no Mixpanel), then use DuckDB to analyze the time distribution at week/day/hour/minute granularities. Produces a soup-analysis.md diagnostic report.
argument-hint: [dungeon path, e.g. dungeons/soup-test.js]
model: claude-opus-4-6
effort: max
---

# Analyze TimeSoup Distribution

Run a dungeon and analyze the time distribution of generated events to evaluate TimeSoup parameters.

**Dungeon file:** `$ARGUMENTS` (default: `dungeons/soup-test.js`)

## Step 1: Run the Dungeon

Run the dungeon with forced local-only settings:

```bash
npm run prune
node -e "
import generate from './index.js';
import config from './$ARGUMENTS';
const result = await generate({ ...config, writeToDisk: true, format: 'json', token: '', verbose: true, name: 'soup-analysis' });
console.log('Events:', result.eventCount, 'Users:', result.userCount);
"
```

Wait for generation to complete. Note the event count and EPS.

## Step 2: Query with DuckDB

Run these DuckDB queries against the generated JSONL file. Use `duckdb` CLI.

### 2a. Week over Week
```bash
duckdb -c "
SELECT date_trunc('week', (time::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles')) as week,
       count(*) as events
FROM read_json_auto('./data/soup-analysis-EVENTS.json')
GROUP BY 1 ORDER BY 1;
"
```

### 2b. Day over Day
```bash
duckdb -c "
SELECT date_trunc('day', (time::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles')) as day,
       count(*) as events
FROM read_json_auto('./data/soup-analysis-EVENTS.json')
GROUP BY 1 ORDER BY 1;
"
```

### 2c. Hour over Hour (last 7 days only)
```bash
duckdb -c "
SELECT date_trunc('hour', (time::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles')) as hour,
       count(*) as events
FROM read_json_auto('./data/soup-analysis-EVENTS.json')
WHERE (time::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles') > (SELECT max((time::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles')) - interval '7 days' FROM read_json_auto('./data/soup-analysis-EVENTS.json'))
GROUP BY 1 ORDER BY 1;
"
```

### 2d. Minute over Minute (last 24 hours only)
```bash
duckdb -c "
SELECT date_trunc('minute', (time::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles')) as minute,
       count(*) as events
FROM read_json_auto('./data/soup-analysis-EVENTS.json')
WHERE (time::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles') > (SELECT max((time::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles')) - interval '1 day' FROM read_json_auto('./data/soup-analysis-EVENTS.json'))
GROUP BY 1 ORDER BY 1;
"
```

### 2e. Distribution Statistics
```bash
duckdb -c "
WITH daily AS (
  SELECT date_trunc('day', (time::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles')) as day, count(*) as events
  FROM read_json_auto('./data/soup-analysis-EVENTS.json')
  GROUP BY 1
),
hourly AS (
  SELECT date_trunc('hour', (time::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles')) as hour, count(*) as events
  FROM read_json_auto('./data/soup-analysis-EVENTS.json')
  WHERE (time::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles') > (SELECT max((time::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles')) - interval '7 days' FROM read_json_auto('./data/soup-analysis-EVENTS.json'))
  GROUP BY 1
)
SELECT 'daily' as granularity,
       count(*) as buckets,
       round(avg(events), 1) as avg_events,
       min(events) as min_events,
       max(events) as max_events,
       round(max(events)::float / nullif(avg(events), 0), 2) as max_to_avg_ratio,
       round(stddev(events) / nullif(avg(events), 0), 3) as cv
FROM daily
UNION ALL
SELECT 'hourly',
       count(*),
       round(avg(events), 1),
       min(events),
       max(events),
       round(max(events)::float / nullif(avg(events), 0), 2),
       round(stddev(events) / nullif(avg(events), 0), 3)
FROM hourly;
"
```

### 2f. Spike Detection
```bash
duckdb -c "
WITH daily AS (
  SELECT date_trunc('day', (time::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles')) as day, count(*) as events
  FROM read_json_auto('./data/soup-analysis-EVENTS.json')
  GROUP BY 1
)
SELECT
  'last_day_vs_avg' as check,
  CASE WHEN last_events > avg_events * 2.0 THEN '❌ FAIL (>2x avg)'
       WHEN last_events > avg_events * 1.5 THEN '⚠️ WARN (>1.5x avg)'
       ELSE '✅ PASS' END as result,
  last_events,
  round(avg_events, 0) as avg_events,
  round(last_events::float / avg_events, 2) as ratio
FROM (
  SELECT
    (SELECT events FROM daily ORDER BY day DESC LIMIT 1) as last_events,
    (SELECT avg(events) FROM daily) as avg_events
);
"
```

## Step 3: Write Report

Create `soup-analysis.md` in the project root with:

1. **Config**: The soup parameters used (peaks, deviation, mean, numDays)
2. **Summary stats**: Total events, event count, avg EPS
3. **Distribution tables**: Week/Day/Hour/Minute tables from Step 2
4. **Statistics**: CV, max-to-avg ratio at each granularity
5. **Spike detection**: Pass/fail for last day and last hour
6. **Assessment**: Overall quality judgment and recommendations

### Quality Criteria
- **Daily CV**: 0.2-0.6 is ideal (some variation, not flat or spiky)
- **Max-to-avg ratio**: < 2.0 at daily level, < 3.0 at hourly level
- **Last day spike**: < 1.5x average = PASS, < 2x = WARN, > 2x = FAIL
- **Hourly pattern**: Should show visible peaks but no single hour > 5x average

## Step 4: Cleanup

```bash
npm run prune
```

Remove `soup-analysis.md` only if the user asks. It's meant to persist for comparison across runs.
