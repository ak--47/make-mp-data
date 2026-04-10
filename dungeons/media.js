import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "harness-media";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef  {import("../types.js").Dungeon} Config */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DATASET OVERVIEW — STREAMVAULT VIDEO STREAMING PLATFORM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * StreamVault is a Netflix/Hulu-style video streaming platform where users browse a rich
 * catalog of movies, series, documentaries, and specials. Users manage watchlists, watch
 * content with configurable playback options, rate and share content, and manage family
 * profiles under a single account.
 *
 * - 5,000 users over 100 days
 * - ~600,000 events across 17 event types
 * - 9 funnels (onboarding, content discovery, engagement loop, search, watchlist, etc.)
 * - Subscription tiers: Free (ad-supported), Standard ($9.99/mo), Premium ($14.99/mo)
 * - Device types: Smart TV, Mobile, Tablet, Laptop, Desktop
 * - Content catalog: 500 titles with genres, types, and a blockbuster release event
 *
 * Core loop: onboarding -> discovery -> consumption -> engagement -> monetization.
 * Users land on a personalized home screen, discover content via browse/search/recommendations,
 * watch with quality and subtitle options, rate and share, and manage subscriptions.
 * Profile switching (main, kids, partner, guest) reveals household dynamics.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ANALYTICS HOOKS (8 architected patterns)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 1. GENRE FUNNEL CONVERSION (funnel-pre)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Comedy and Animation content has 1.3x higher funnel conversion rates,
 * while Documentary content has 0.7x conversion (users browse but abandon more).
 *
 * HOW TO FIND IT:
 *   - Funnels: "content browsed" -> "content selected" -> "playback started" -> "playback completed"
 *   - Breakdown: "genre"
 *   - Expected: Comedy/Animation convert at ~65% vs Documentary at ~35%
 *   - Also try: Insights on "content selected", breakdown by "genre_boost"
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 2. BINGE-WATCHING PATTERN (everything)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Users who complete 3+ episodes consecutively become "binge-watchers":
 *   - Extra playback started + playback completed events are spliced in
 *   - Completion percentages are 90-100% (they finish every episode)
 *   - Pause events are reduced by 60% (they don't stop watching)
 *   - Events tagged with binge_session = true
 *
 * HOW TO FIND IT:
 *   - Insights: "playback completed", total events per user, breakdown by "binge_session"
 *   - Expected: binge_session=true users have 40-60% more completions per user
 *   - Also try: Average of "completion_percent" by "binge_session" (90-100% vs ~70%)
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 3. WEEKEND vs WEEKDAY PATTERNS (event)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Weekend viewing sessions are 1.5x longer than weekday sessions.
 * Weekday viewing concentrates in evening prime-time (6PM-11PM).
 *
 * HOW TO FIND IT:
 *   - Insights: "playback completed", average of "watch_duration_min", breakdown by "weekend_viewing"
 *   - Expected: weekend_viewing=true ~67 min avg vs false ~45 min avg (1.5x)
 *   - Also try: Total "playback completed" events by "prime_time" (60-70% of weekday views)
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 4. AD FATIGUE CHURN (everything)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Free-tier users who see 10+ ad impressions experience 50% churn
 * after day 45 of their lifecycle.
 *
 * HOW TO FIND IT:
 *   - Retention: any event (filter subscription_plan=free), segment by ad impression count >= 10 vs < 10
 *   - Expected: 10+ ad users show ~50% retention drop after day 45
 *   - Also try: Insights line chart, any event filtered by "ad_fatigue" = true, weekly trend
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 5. NEW RELEASE SPIKE (event)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: On day 50, a blockbuster movie releases, creating a content spike:
 *   - 20% of content selected and playback started events redirect to the blockbuster
 *   - Content rated events for the blockbuster skew to 4-5 star ratings
 *   - All affected events tagged with blockbuster_release = true
 *
 * HOW TO FIND IT:
 *   - Insights line chart: "content selected", filter "blockbuster_release" = true, daily trend
 *   - Expected: Zero before day 50, then ~20% of content selections
 *   - Also try: "content rated" average of "rating" by "blockbuster_release" (4-5 vs ~3.5)
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 6. KIDS PROFILE SAFETY (event)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: 15% of the time, events are tagged as kids profile activity:
 *   - Content selection restricted to animation and documentary genres
 *   - Ad impressions are blocked (ad_blocked = true)
 *   - Events tagged with kids_profile = true
 *
 * HOW TO FIND IT:
 *   - Insights: "content selected", breakdown by "genre", filter "kids_profile" = true
 *   - Expected: 100% animation and documentary genres only
 *   - Also try: "ad impression" breakdown by "kids_profile" — kids should have ad_blocked=true
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 7. RECOMMENDATION ENGINE IMPROVEMENT (funnel-pre)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: After day 60, the engagement loop funnel (recommendation clicked ->
 * playback started -> content rated) gets a 1.5x conversion rate boost,
 * simulating a recommendation engine improvement.
 *
 * HOW TO FIND IT:
 *   - Funnels: "recommendation clicked" -> "playback started" -> "playback completed" -> "content rated"
 *   - Breakdown: "improved_recs"
 *   - Expected: improved_recs=true shows ~1.5x higher conversion rate
 *   - Also try: Insights line chart of "recommendation clicked" filtered by "improved_recs" = true
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 8. SUBTITLE USERS WATCH MORE (everything)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Users who enable subtitles have measurably higher engagement:
 *   - 25% higher completion_percent on playback completed events (capped at 100)
 *   - 15% longer watch_duration_min
 *   - 20% more playback completed events (extra content consumption)
 *   - Events tagged with subtitle_user = true
 *
 * HOW TO FIND IT:
 *   - Insights: "playback completed", average of "completion_percent", breakdown by "subtitle_user"
 *   - Expected: subtitle_user=true ~85% completion vs false ~68% (1.25x)
 *   - Also try: Average of "watch_duration_min" by "subtitle_user" (~15% longer)
 *   - Also try: Total events per user by "subtitle_user" (~20% more completions)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * EXPECTED METRICS SUMMARY
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Hook                     | Metric                  | Baseline  | Hook Effect | Ratio
 * ─────────────────────────|─────────────────────────|───────────|─────────────|──────
 * Genre Funnel Conversion  | Funnel conversion rate  | 50%       | 65% / 35%   | 1.3x / 0.7x
 * Binge-Watching           | Content consumed/user   | 12        | 18-20       | ~1.5x
 * Weekend vs Weekday       | Watch duration (min)    | 45        | 67 (weekend)| 1.5x
 * Ad Fatigue Churn         | Post-day-45 activity    | 100%      | 50%         | 0.5x
 * New Release Spike        | Content selections/day  | baseline  | +20% spike  | 1.2x
 * Kids Profile Safety      | Ad impressions          | normal    | 0 (dropped) | 0x
 * Rec Engine Improvement   | Engagement funnel conv  | 30%       | 45%         | 1.5x
 * Subtitle Users           | Completion percent      | 68%       | 85%         | 1.25x
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVANCED ANALYSIS IDEAS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * CROSS-HOOK PATTERNS:
 *
 * 1. Binge + Subtitle: Do subtitle-enabled binge-watchers have the highest
 *    total watch hours? (Hooks #2 + #8 combined)
 *
 * 2. Ad Fatigue + Blockbuster: Does the blockbuster release (Hook #5) rescue
 *    free-tier users from ad fatigue churn (Hook #4)?
 *
 * 3. Kids + Weekend: Is kids profile viewing concentrated on weekends (Hook #6
 *    + #3)? Does weekend kids viewing show different genre preferences?
 *
 * 4. Rec Engine + Genre: Does the recommendation engine improvement (Hook #7)
 *    disproportionately help certain genres (Hook #1)?
 *
 * 5. Subtitle + Binge + Weekend: The "super viewer" - subtitle-enabled,
 *    binge-watching on weekends. What is their lifetime watch hours?
 *
 * COHORT ANALYSIS:
 *
 * - Cohort by signup_source: Do referral users binge more than organic?
 * - Cohort by device_type: Do smart TV users watch longer than mobile?
 * - Cohort by subscription_plan: Do premium users binge more, or does
 *   ad-free viewing change consumption patterns?
 * - Cohort by preferred_genre: Does genre preference predict churn?
 *
 * FUNNEL ANALYSIS:
 *
 * - Onboarding Funnel: account created -> content browsed -> playback started.
 *   How does signup_source affect first-session conversion?
 * - Content Discovery Funnel: Does the browse_section (home vs trending vs
 *   genre) affect downstream completion rates?
 * - Engagement Loop: How does recommendation algorithm type (collaborative
 *   filtering vs editorial) affect the full loop conversion?
 *
 * MONETIZATION ANALYSIS:
 *
 * - Free-to-Standard conversion: Which events predict upgrade?
 * - Ad tolerance threshold: At what ad count do free users start churning?
 * - Premium value: Do premium users actually consume more content, or just
 *   consume at higher quality (4K)?
 * - Download behavior: Does offline download usage correlate with retention?
 */

// Generate consistent content IDs for lookup tables and events
const contentIds = v.range(1, 501).map(n => `content_${v.uid(8)}`);
const blockbusterId = `blockbuster_${v.uid(8)}`;

/** @type {Config} */
const config = {
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
	percentUsersBornInDataset: 50,
	hasAvatar: true,
	batchSize: 2_500_000,
	concurrency: 1,
	writeToDisk: false,

	funnels: [
		{
			sequence: ["account created", "content browsed", "playback started"],
			isFirstFunnel: true,
			conversionRate: 80,
			timeToConvert: 0.25,
		},
		{
			// Core viewing loop: browse → select → watch → finish (most common)
			sequence: ["content browsed", "content selected", "playback started", "playback completed"],
			conversionRate: 55,
			timeToConvert: 2,
			weight: 5,
			props: {
				genre: ["action", "comedy", "drama", "documentary", "horror", "sci_fi", "animation", "thriller", "romance"],
			},
		},
		{
			// Recommendation-driven viewing
			sequence: ["recommendation clicked", "playback started", "playback completed", "content rated"],
			conversionRate: 35,
			timeToConvert: 1,
			weight: 3,
		},
		{
			// Search-driven discovery
			sequence: ["search performed", "content selected", "playback started"],
			conversionRate: 50,
			timeToConvert: 0.5,
			weight: 3,
		},
		{
			// Watchlist management
			sequence: ["content browsed", "watchlist added", "content selected", "playback started"],
			conversionRate: 40,
			timeToConvert: 12,
			weight: 2,
		},
		{
			// Profile and subtitle management
			sequence: ["profile switched", "subtitle toggled", "playback started", "playback completed"],
			conversionRate: 45,
			timeToConvert: 1,
			weight: 2,
		},
		{
			// Ad experience (free tier)
			sequence: ["ad impression", "playback started", "playback paused"],
			conversionRate: 60,
			timeToConvert: 0.5,
			weight: 2,
		},
		{
			// Content sharing and downloads
			sequence: ["playback completed", "share content", "download started"],
			conversionRate: 25,
			timeToConvert: 1,
			weight: 1,
		},
		{
			// Subscription changes
			sequence: ["content browsed", "subscription changed"],
			conversionRate: 15,
			timeToConvert: 24,
			weight: 1,
		},
	],

	events: [
		{
			event: "account created",
			weight: 1,
			isFirstEvent: true,
			properties: {
				"signup_source": ["organic", "referral", "trial_offer", "ad"],
				"plan_selected": ["free", "standard", "premium"],
			}
		},
		{
			event: "content browsed",
			weight: 20,
			properties: {
				"browse_section": ["home", "trending", "new_releases", "genre", "continue_watching"],
				"genre": ["action", "comedy", "drama", "documentary", "horror", "sci_fi", "animation", "thriller", "romance"],
			}
		},
		{
			event: "content selected",
			weight: 15,
			properties: {
				"content_type": ["movie", "series", "documentary", "special"],
				"genre": ["action", "comedy", "drama", "documentary", "horror", "sci_fi", "animation", "thriller", "romance"],
				"content_id": u.pickAWinner(contentIds),
			}
		},
		{
			event: "playback started",
			weight: 18,
			properties: {
				"content_id": u.pickAWinner(contentIds),
				"content_type": ["movie", "series", "documentary", "special"],
				"playback_quality": ["480p", "720p", "1080p", "4k"],
				"subtitle_language": ["none", "english", "spanish", "french", "japanese", "korean"],
				"playback_speed": u.pickAWinner(["0.5x", "1x", "1x", "1x", "1.25x", "1.5x", "2x"]),
			}
		},
		{
			event: "playback completed",
			weight: 12,
			properties: {
				"content_id": u.pickAWinner(contentIds),
				"content_type": ["movie", "series", "documentary", "special"],
				"watch_duration_min": u.weighNumRange(5, 180, 0.5, 45),
				"completion_percent": u.weighNumRange(10, 100, 1.5, 85),
			}
		},
		{
			event: "playback paused",
			weight: 10,
			properties: {
				"content_id": u.pickAWinner(contentIds),
				"pause_reason": ["manual", "ad_break", "buffering", "notification"],
			}
		},
		{
			event: "content rated",
			weight: 6,
			properties: {
				"content_id": u.pickAWinner(contentIds),
				"rating": u.weighNumRange(1, 5, 2, 4),
				"review_text_length": u.weighNumRange(0, 500, 0.2, 0),
			}
		},
		{
			event: "watchlist added",
			weight: 8,
			properties: {
				"content_id": u.pickAWinner(contentIds),
				"content_type": ["movie", "series", "documentary", "special"],
				"genre": ["action", "comedy", "drama", "documentary", "horror", "sci_fi", "animation", "thriller", "romance"],
			}
		},
		{
			event: "watchlist removed",
			weight: 3,
			properties: {
				"content_id": u.pickAWinner(contentIds),
				"reason": ["watched", "not_interested", "expired"],
			}
		},
		{
			event: "search performed",
			weight: 7,
			properties: {
				"search_term": () => chance.word(),
				"results_count": u.weighNumRange(0, 50, 0.5, 15),
				"search_type": ["title", "actor", "director", "genre"],
			}
		},
		{
			event: "recommendation clicked",
			weight: 9,
			properties: {
				"algorithm": ["collaborative_filtering", "content_based", "trending", "editorial"],
				"position": u.weighNumRange(1, 20),
			}
		},
		{
			event: "profile switched",
			weight: 4,
			properties: {
				"profile_type": ["main", "kids", "partner", "guest"],
			}
		},
		{
			event: "ad impression",
			weight: 8,
			properties: {
				"ad_type": ["pre_roll", "mid_roll", "banner", "interstitial"],
				"ad_duration_sec": u.weighNumRange(5, 30),
				"skipped": u.pickAWinner([true, false], 0.4),
			}
		},
		{
			event: "subscription changed",
			weight: 2,
			properties: {
				"old_plan": ["free", "standard", "premium"],
				"new_plan": ["free", "standard", "premium"],
				"change_reason": ["upgrade", "downgrade", "cancel", "resubscribe"],
			}
		},
		{
			event: "download started",
			weight: 5,
			properties: {
				"content_id": u.pickAWinner(contentIds),
				"content_type": ["movie", "series", "documentary", "special"],
				"download_quality": ["720p", "1080p", "4k"],
			}
		},
		{
			event: "share content",
			weight: 3,
			properties: {
				"share_method": ["link", "social", "dm", "email"],
				"content_type": ["movie", "series", "documentary", "special"],
			}
		},
		{
			event: "subtitle toggled",
			weight: 4,
			properties: {
				"subtitle_language": ["none", "english", "spanish", "french", "japanese", "korean"],
				"action": ["enabled", "disabled", "changed"],
			}
		},
	],

	superProps: {
		subscription_plan: u.pickAWinner(["free", "free", "standard", "standard", "standard", "premium"]),
		device_type: ["smart_tv", "mobile", "tablet", "laptop", "desktop"],
	},

	scdProps: {},

	userProps: {
		"preferred_genre": ["action", "comedy", "drama", "documentary", "horror", "sci_fi", "animation"],
		"avg_session_duration_min": u.weighNumRange(10, 180, 0.5, 45),
		"total_watch_hours": u.weighNumRange(0, 500, 0.8, 50),
		"profiles_count": u.weighNumRange(1, 5),
		"downloads_enabled": u.pickAWinner([true, false], 0.4),
	},

	lookupTables: [],

	/**
	 * ARCHITECTED ANALYTICS HOOKS
	 *
	 * This hook function creates 8 deliberate patterns in the data:
	 *
	 * 1. GENRE FUNNEL CONVERSION: Comedy/Animation complete more; Documentary abandons more (funnel-pre)
	 * 2. BINGE-WATCHING: Users with 3+ consecutive completions get extra episodes (everything)
	 * 3. WEEKEND vs WEEKDAY: Weekend sessions 1.5x longer; weekday prime-time tagging (event)
	 * 4. AD FATIGUE CHURN: Free-tier users with 10+ ads churn after day 45 (everything)
	 * 5. NEW RELEASE SPIKE: Blockbuster release on day 50 drives content selection (event)
	 * 6. KIDS PROFILE SAFETY: Kids mode restricts genres and drops ads (event)
	 * 7. RECOMMENDATION ENGINE IMPROVEMENT: Post-day-60 boost to engagement funnel (funnel-pre)
	 * 8. SUBTITLE USERS WATCH MORE: Subtitle-enabled users have higher completion rates (everything)
	 */
	hook: function (record, type, meta) {
		const NOW = dayjs();
		const DATASET_START = NOW.subtract(days, 'days');
		// FIXED_START is the pre-shift time range start; needed because
		// meta.firstEventTime in funnel-pre is in the FIXED (pre-shift) timeframe
		const FIXED_START = dayjs.unix(global.FIXED_NOW).subtract(days, 'days');

		// ─────────────────────────────────────────────────────────────
		// Hook #1: GENRE FUNNEL CONVERSION (funnel-pre)
		// Comedy/Animation funnels convert 1.3x better; Documentary 0.7x
		// ─────────────────────────────────────────────────────────────
		if (type === "funnel-pre") {
			record.props = record.props || {};
			const genre = record.props.genre;

			if (genre === "comedy" || genre === "animation") {
				record.conversionRate = record.conversionRate * 1.3;
				record.props.genre_boost = true;
				record.props.genre_penalty = false;
			} else if (genre === "documentary") {
				record.conversionRate = record.conversionRate * 0.7;
				record.props.genre_boost = false;
				record.props.genre_penalty = true;
			} else if (!genre && chance.bool({ likelihood: 25 })) {
				// Randomly apply genre effects when genre isn't in funnel props
				if (chance.bool({ likelihood: 60 })) {
					record.conversionRate = record.conversionRate * 1.3;
					record.props.genre_boost = true;
					record.props.genre_penalty = false;
				} else {
					record.conversionRate = record.conversionRate * 0.7;
					record.props.genre_boost = false;
					record.props.genre_penalty = true;
				}
			} else {
				record.props.genre_boost = false;
				record.props.genre_penalty = false;
			}

			// ─────────────────────────────────────────────────────────────
			// Hook #7: RECOMMENDATION ENGINE IMPROVEMENT (funnel-pre)
			// After day 60, engagement funnel gets 1.5x boost
			// ─────────────────────────────────────────────────────────────
			const seq = record.sequence || [];
			const isEngagementFunnel = seq.includes("recommendation clicked");
			const funnelTime = meta && meta.firstEventTime ? dayjs.unix(meta.firstEventTime) : null;
			const isAfterImprovement = funnelTime && funnelTime.isAfter(FIXED_START.add(60, 'days'));

			if (isEngagementFunnel && isAfterImprovement) {
				record.conversionRate = record.conversionRate * 1.5;
				record.props.improved_recs = true;
			} else {
				record.props.improved_recs = false;
			}

			return record;
		}

		// ─────────────────────────────────────────────────────────────
		// Hook #3: WEEKEND vs WEEKDAY PATTERNS (event)
		// Weekend: 1.5x watch duration. Weekday 6PM-11PM: prime_time tag
		// ─────────────────────────────────────────────────────────────
		if (type === "event") {
			const EVENT_TIME = dayjs(record.time);
			const dayOfWeek = EVENT_TIME.day(); // 0 = Sunday, 6 = Saturday
			const hour = EVENT_TIME.hour();
			const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

			if (isWeekend) {
				record.weekend_viewing = true;
				record.prime_time = false;
				if (record.event === "playback completed" && record.watch_duration_min) {
					record.watch_duration_min = Math.round(record.watch_duration_min * 1.5);
				}
			} else {
				record.weekend_viewing = false;
				// Weekday prime-time: 6PM to 11PM
				if (hour >= 18 && hour <= 23) {
					record.prime_time = true;
				} else {
					record.prime_time = false;
				}
			}

			// ─────────────────────────────────────────────────────────────
			// Hook #5: NEW RELEASE SPIKE (event)
			// After day 50, blockbuster release drives content selection
			// ─────────────────────────────────────────────────────────────
			const BLOCKBUSTER_RELEASE = DATASET_START.add(50, 'days');
			if (record.event === "content selected" || record.event === "playback started") {
				if (EVENT_TIME.isAfter(BLOCKBUSTER_RELEASE) && chance.bool({ likelihood: 20 })) {
					record.content_type = "movie";
					record.content_id = blockbusterId;
					record.blockbuster_release = true;
				} else {
					record.blockbuster_release = false;
				}
			}

			if (record.event === "content rated") {
				if (EVENT_TIME.isAfter(BLOCKBUSTER_RELEASE) && chance.bool({ likelihood: 20 })) {
					record.rating = chance.integer({ min: 4, max: 5 });
					record.content_id = blockbusterId;
					record.blockbuster_release = true;
				} else {
					record.blockbuster_release = false;
				}
			}

			// ─────────────────────────────────────────────────────────────
			// Hook #6: KIDS PROFILE SAFETY (event)
			// 15% of the time, apply kids mode: restrict genres, drop ads
			// ─────────────────────────────────────────────────────────────
			if (chance.bool({ likelihood: 15 })) {
				record.kids_profile = true;
				if (record.event === "content selected" || record.event === "playback started") {
					record.genre = chance.pickone(["animation", "documentary"]);
				} else if (record.event === "ad impression") {
					record.ad_blocked = true;
				}
			} else {
				record.kids_profile = false;
				if (record.event === "ad impression") {
					record.ad_blocked = false;
				}
			}

			return record;
		}

		// ─────────────────────────────────────────────────────────────
		// Hook #2, #4, #8: EVERYTHING PASS - Complex behavioral patterns
		// ─────────────────────────────────────────────────────────────
		if (type === "everything") {
			const userEvents = record;
			if (!userEvents || userEvents.length === 0) return record;

			const firstEventTime = dayjs(userEvents[0].time);

			// ─── First pass: identify user patterns ───
			let consecutiveCompletions = 0;
			let maxConsecutiveCompletions = 0;
			let isBingeWatcher = false;
			let adImpressionCount = 0;
			let isFreeTier = false;
			let hasSubtitlesEnabled = false;

			userEvents.forEach((event, idx) => {
				// Track subscription tier from superProps
				if (idx === 0 && event.subscription_plan) {
					isFreeTier = event.subscription_plan === "free";
				}

				// Hook #2: Track consecutive playback completions
				if (event.event === "playback completed") {
					consecutiveCompletions++;
					if (consecutiveCompletions > maxConsecutiveCompletions) {
						maxConsecutiveCompletions = consecutiveCompletions;
					}
				} else if (event.event !== "playback started") {
					// Reset streak on non-playback events (started doesn't break streak)
					consecutiveCompletions = 0;
				}

				// Hook #4: Count ad impressions for free-tier users
				if (event.event === "ad impression") {
					adImpressionCount++;
				}

				// Hook #8: Check for subtitle enabled
				if (event.event === "subtitle toggled" && event.action === "enabled") {
					hasSubtitlesEnabled = true;
				}
			});

			isBingeWatcher = maxConsecutiveCompletions >= 3;

			// ─── Second pass: set schema defaults then modify ───

			// Set defaults for conditional properties on all events
			userEvents.forEach((event) => {
				if (event.event === "playback completed") {
					if (event.binge_session === undefined) event.binge_session = false;
					if (event.subtitle_user === undefined) event.subtitle_user = false;
				}
				if (event.event === "playback started") {
					if (event.binge_session === undefined) event.binge_session = false;
				}
				if (event.ad_fatigue === undefined) event.ad_fatigue = false;
			});

			// Hook #2: BINGE-WATCHING PATTERN
			// Binge-watchers get extra episodes, high completion, fewer pauses
			if (isBingeWatcher) {
				for (let i = userEvents.length - 1; i >= 0; i--) {
					const event = userEvents[i];
					const eventTime = dayjs(event.time);

					// Remove some pause events (binge-watchers don't stop)
					if (event.event === "playback paused") {
						if (chance.bool({ likelihood: 60 })) {
							userEvents.splice(i, 1);
							continue;
						}
					}

					// Add extra viewing events after completions
					if (event.event === "playback completed" && chance.bool({ likelihood: 40 })) {
						const nextContentId = chance.pickone(contentIds);
						const extraStart = {
							event: "playback started",
							time: eventTime.add(chance.integer({ min: 1, max: 5 }), 'minutes').toISOString(),
							user_id: event.user_id,
							content_id: nextContentId,
							content_type: "series",
							playback_quality: event.playback_quality || "1080p",
							binge_session: true,
						};
						const extraComplete = {
							event: "playback completed",
							time: eventTime.add(chance.integer({ min: 25, max: 60 }), 'minutes').toISOString(),
							user_id: event.user_id,
							content_id: nextContentId,
							content_type: "series",
							watch_duration_min: chance.integer({ min: 20, max: 55 }),
							completion_percent: chance.integer({ min: 90, max: 100 }),
							binge_session: true,
						};
						userEvents.splice(i + 1, 0, extraStart, extraComplete);
					}
				}
			}

			// Hook #4: AD FATIGUE CHURN
			// Free-tier users with 10+ ads lose 50% of events after day 45
			if (isFreeTier && adImpressionCount >= 10) {
				const churnCutoff = firstEventTime.add(45, 'days');
				for (let i = userEvents.length - 1; i >= 0; i--) {
					const evt = userEvents[i];
					if (dayjs(evt.time).isAfter(churnCutoff)) {
						if (chance.bool({ likelihood: 50 })) {
							userEvents.splice(i, 1);
						} else {
							evt.ad_fatigue = true;
						}
					}
				}
			}

			// Hook #8: SUBTITLE USERS WATCH MORE
			// Users who enabled subtitles have 25% higher completion and 15% longer watch time
			if (hasSubtitlesEnabled) {
				for (let i = 0; i < userEvents.length; i++) {
					const event = userEvents[i];

					if (event.event === "playback completed") {
						// Boost completion percent (cap at 100)
						if (event.completion_percent) {
							event.completion_percent = Math.min(100, Math.round(event.completion_percent * 1.25));
						}
						// Boost watch duration
						if (event.watch_duration_min) {
							event.watch_duration_min = Math.round(event.watch_duration_min * 1.15);
						}
						event.subtitle_user = true;
					}
				}

				// Splice extra playback completed events (subtitle users watch more overall)
				const completionEvents = userEvents.filter(e => e.event === "playback completed");
				const extraCount = Math.floor(completionEvents.length * 0.2); // 20% more completions
				for (let j = 0; j < extraCount; j++) {
					const templateEvent = chance.pickone(completionEvents);
					const templateTime = dayjs(templateEvent.time);
					const extraCompletion = {
						event: "playback completed",
						time: templateTime.add(chance.integer({ min: 30, max: 180 }), 'minutes').toISOString(),
						user_id: templateEvent.user_id,
						content_id: chance.pickone(contentIds),
						content_type: chance.pickone(["movie", "series", "documentary"]),
						watch_duration_min: chance.integer({ min: 25, max: 120 }),
						completion_percent: chance.integer({ min: 80, max: 100 }),
						subtitle_user: true,
					};
					userEvents.push(extraCompletion);
				}
			}

			return record;
		}

		return record;
	}
};

export default config;
