import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "harness-media";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef  {import("../../types.js").Dungeon} Config */

/**
 * STREAMVAULT - Video Streaming Platform Analytics
 *
 * StreamVault is a Netflix/Hulu-style video streaming platform where users browse a rich
 * catalog of movies, series, documentaries, and specials. Users manage watchlists, watch
 * content with configurable playback options, rate and share content, and manage family
 * profiles under a single account. Monetization runs through tiered subscriptions:
 * Free (ad-supported), Standard (ad-free HD), and Premium (4K, offline downloads, 5 profiles).
 *
 * CONTENT DISCOVERY:
 * Users land on a personalized home screen with sections like "Continue Watching",
 * "Trending Now", "New Releases", and genre-based rows. A recommendation engine (using
 * collaborative filtering, content-based, trending, and editorial algorithms) surfaces
 * relevant content. Users can also search by title, actor, director, or genre. The browse
 * and search patterns reveal how users navigate the catalog and which discovery paths
 * lead to actual viewership.
 *
 * PLAYBACK EXPERIENCE:
 * Once content is selected, playback begins with quality auto-selected based on connection
 * speed (480p to 4K). Users can adjust playback speed, toggle subtitles in multiple
 * languages, and pause/resume. Playback completion percentage and watch duration are
 * tracked to understand engagement depth. Some users exhibit "binge-watching" behavior,
 * consuming multiple episodes consecutively with high completion rates and minimal pausing.
 *
 * PROFILE MANAGEMENT:
 * A single account supports multiple profiles: main, kids, partner, and guest. The kids
 * profile has content restrictions (only animation and documentaries, no ads). Profile
 * switching events reveal household composition and viewing patterns across family members.
 *
 * MONETIZATION MODEL:
 * - Free tier: Ad-supported with pre-roll, mid-roll, banner, and interstitial ads. Users
 *   on this tier experience ad fatigue over time, which drives churn or upgrades.
 * - Standard tier ($9.99/mo): Ad-free viewing in HD, 2 simultaneous streams.
 * - Premium tier ($14.99/mo): 4K streaming, offline downloads, 5 profiles, early access.
 * - Subscription changes (upgrades, downgrades, cancellations, resubscriptions) are tracked
 *   with reasons to understand the lifecycle of subscriber value.
 *
 * CONTENT ENGAGEMENT:
 * Users rate content (1-5 stars with optional review text), add/remove items from their
 * watchlist, share content via link/social/DM/email, and download content for offline
 * viewing. These engagement signals feed back into the recommendation engine and reveal
 * content quality and user satisfaction patterns.
 *
 * WHY THESE EVENTS/PROPERTIES?
 * - Events model the full streaming lifecycle: onboarding -> discovery -> consumption -> engagement -> monetization
 * - Properties enable cohort analysis: subscription tier, device type, genre preference, viewing patterns
 * - Funnels reveal friction: where do users drop off between browsing, selecting, starting, and finishing content?
 * - The recommendation engine creates measurable A/B-testable discovery paths
 * - Ad impression tracking enables fatigue analysis and churn prediction for free-tier users
 * - Profile switching reveals household dynamics and kids safety patterns
 * - The 8 "needle in haystack" hooks simulate real product insights hidden in production data
 */

// Generate consistent content IDs for lookup tables and events
const contentIds = v.range(1, 501).map(n => `content_${v.uid(8)}`);
const blockbusterId = `blockbuster_${v.uid(8)}`;

/** @type {Config} */
const config = {
	token: "a25c84d324e76cca047c53a4f0a85552",
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
	makeChart: false,
	batchSize: 2_500_000,
	concurrency: 10,
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
				"signup_source": u.pickAWinner(["organic", "referral", "trial_offer", "ad"]),
				"plan_selected": u.pickAWinner(["free", "standard", "premium"]),
			}
		},
		{
			event: "content browsed",
			weight: 20,
			properties: {
				"browse_section": u.pickAWinner(["home", "trending", "new_releases", "genre", "continue_watching"]),
				"genre": u.pickAWinner(["action", "comedy", "drama", "documentary", "horror", "sci_fi", "animation", "thriller", "romance"]),
			}
		},
		{
			event: "content selected",
			weight: 15,
			properties: {
				"content_type": u.pickAWinner(["movie", "series", "documentary", "special"]),
				"genre": u.pickAWinner(["action", "comedy", "drama", "documentary", "horror", "sci_fi", "animation", "thriller", "romance"]),
				"content_id": u.pickAWinner(contentIds),
			}
		},
		{
			event: "playback started",
			weight: 18,
			properties: {
				"content_id": u.pickAWinner(contentIds),
				"content_type": u.pickAWinner(["movie", "series", "documentary", "special"]),
				"playback_quality": u.pickAWinner(["480p", "720p", "1080p", "4k"]),
				"subtitle_language": u.pickAWinner(["none", "english", "spanish", "french", "japanese", "korean"], 0),
				"playback_speed": u.pickAWinner(["0.5x", "1x", "1x", "1x", "1.25x", "1.5x", "2x"]),
			}
		},
		{
			event: "playback completed",
			weight: 12,
			properties: {
				"content_id": u.pickAWinner(contentIds),
				"content_type": u.pickAWinner(["movie", "series", "documentary", "special"]),
				"watch_duration_min": u.weighNumRange(5, 180, 0.5, 45),
				"completion_percent": u.weighNumRange(10, 100, 1.5, 85),
			}
		},
		{
			event: "playback paused",
			weight: 10,
			properties: {
				"content_id": u.pickAWinner(contentIds),
				"pause_reason": u.pickAWinner(["manual", "ad_break", "buffering", "notification"]),
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
				"content_type": u.pickAWinner(["movie", "series", "documentary", "special"]),
				"genre": u.pickAWinner(["action", "comedy", "drama", "documentary", "horror", "sci_fi", "animation", "thriller", "romance"]),
			}
		},
		{
			event: "watchlist removed",
			weight: 3,
			properties: {
				"content_id": u.pickAWinner(contentIds),
				"reason": u.pickAWinner(["watched", "not_interested", "expired"]),
			}
		},
		{
			event: "search performed",
			weight: 7,
			properties: {
				"search_term": () => chance.word(),
				"results_count": u.weighNumRange(0, 50, 0.5, 15),
				"search_type": u.pickAWinner(["title", "actor", "director", "genre"]),
			}
		},
		{
			event: "recommendation clicked",
			weight: 9,
			properties: {
				"algorithm": u.pickAWinner(["collaborative_filtering", "content_based", "trending", "editorial"]),
				"position": u.weighNumRange(1, 20),
			}
		},
		{
			event: "profile switched",
			weight: 4,
			properties: {
				"profile_type": u.pickAWinner(["main", "kids", "partner", "guest"]),
			}
		},
		{
			event: "ad impression",
			weight: 8,
			properties: {
				"ad_type": u.pickAWinner(["pre_roll", "mid_roll", "banner", "interstitial"]),
				"ad_duration_sec": u.weighNumRange(5, 30),
				"skipped": u.pickAWinner([true, false], 0.4),
			}
		},
		{
			event: "subscription changed",
			weight: 2,
			properties: {
				"old_plan": u.pickAWinner(["free", "standard", "premium"]),
				"new_plan": u.pickAWinner(["free", "standard", "premium"]),
				"change_reason": u.pickAWinner(["upgrade", "downgrade", "cancel", "resubscribe"]),
			}
		},
		{
			event: "download started",
			weight: 5,
			properties: {
				"content_id": u.pickAWinner(contentIds),
				"content_type": u.pickAWinner(["movie", "series", "documentary", "special"]),
				"download_quality": u.pickAWinner(["720p", "1080p", "4k"]),
			}
		},
		{
			event: "share content",
			weight: 3,
			properties: {
				"share_method": u.pickAWinner(["link", "social", "dm", "email"]),
				"content_type": u.pickAWinner(["movie", "series", "documentary", "special"]),
			}
		},
		{
			event: "subtitle toggled",
			weight: 4,
			properties: {
				"subtitle_language": u.pickAWinner(["none", "english", "spanish", "french", "japanese", "korean"], 0),
				"action": u.pickAWinner(["enabled", "disabled", "changed"]),
			}
		},
	],

	superProps: {
		subscription_plan: u.pickAWinner(["free", "free", "standard", "standard", "standard", "premium"]),
		device_type: u.pickAWinner(["smart_tv", "mobile", "tablet", "laptop", "desktop"]),
	},

	scdProps: {},

	userProps: {
		"preferred_genre": u.pickAWinner(["action", "comedy", "drama", "documentary", "horror", "sci_fi", "animation"]),
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
	 * 4. AD FATIGUE CHURN: Free-tier users with 20+ ads churn after day 45 (everything)
	 * 5. NEW RELEASE SPIKE: Blockbuster release on day 50 drives content selection (event)
	 * 6. KIDS PROFILE SAFETY: Kids mode restricts genres and drops ads (event)
	 * 7. RECOMMENDATION ENGINE IMPROVEMENT: Post-day-60 boost to engagement funnel (funnel-pre)
	 * 8. SUBTITLE USERS WATCH MORE: Subtitle-enabled users have higher completion rates (everything)
	 */
	hook: function (record, type, meta) {
		const NOW = dayjs();
		const DATASET_START = NOW.subtract(days, 'days');

		// ─────────────────────────────────────────────────────────────
		// Hook #1: GENRE FUNNEL CONVERSION (funnel-pre)
		// Comedy/Animation funnels convert 1.3x better; Documentary 0.7x
		// ─────────────────────────────────────────────────────────────
		if (type === "funnel-pre") {
			const props = record.props || {};
			const genre = props.genre;

			if (genre === "comedy" || genre === "animation") {
				record.conversionRate = record.conversionRate * 1.3;
				record.genre_boost = true;
				record.genre_penalty = false;
			} else if (genre === "documentary") {
				record.conversionRate = record.conversionRate * 0.7;
				record.genre_boost = false;
				record.genre_penalty = true;
			} else if (!genre && chance.bool({ likelihood: 25 })) {
				// Randomly apply genre effects when genre isn't in funnel props
				if (chance.bool({ likelihood: 60 })) {
					record.conversionRate = record.conversionRate * 1.3;
					record.genre_boost = true;
					record.genre_penalty = false;
				} else {
					record.conversionRate = record.conversionRate * 0.7;
					record.genre_boost = false;
					record.genre_penalty = true;
				}
			} else {
				record.genre_boost = false;
				record.genre_penalty = false;
			}

			// ─────────────────────────────────────────────────────────────
			// Hook #7: RECOMMENDATION ENGINE IMPROVEMENT (funnel-pre)
			// After day 60 (proxied by 50% chance), engagement funnel gets 1.5x boost
			// ─────────────────────────────────────────────────────────────
			const seq = record.sequence || [];
			const isEngagementFunnel = seq.includes("recommendation clicked");

			if (isEngagementFunnel && chance.bool({ likelihood: 50 })) {
				record.conversionRate = record.conversionRate * 1.5;
				record.improved_recs = true;
			} else {
				record.improved_recs = false;
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
			// Free-tier users with 20+ ads lose 50% of events after day 45
			if (isFreeTier && adImpressionCount >= 20) {
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

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NEEDLE IN A HAYSTACK - STREAMVAULT VIDEO STREAMING ANALYTICS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * A video streaming platform dungeon with 8 deliberately architected analytics
 * insights hidden in the data. This dungeon simulates a Netflix/Hulu-style service
 * and is designed to showcase advanced product analytics patterns for streaming
 * media businesses.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * DATASET OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * - 5,000 users over 100 days
 * - 360,000 events across 17 event types
 * - 3 funnels (onboarding, content discovery, engagement loop)
 * - 1 lookup table (content catalog with 500 titles)
 * - Subscription tiers: Free (ad-supported), Standard, Premium
 * - Device types: Smart TV, Mobile, Tablet, Laptop, Desktop
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE 8 ARCHITECTED HOOKS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Each hook creates a specific, discoverable analytics insight that simulates
 * real-world streaming platform behavior patterns.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 1. GENRE FUNNEL CONVERSION (funnel-pre)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Comedy and Animation content has 1.3x higher funnel conversion rates,
 * while Documentary content has 0.7x conversion (users browse but abandon more).
 *
 * HOW TO FIND IT:
 *   - Break down funnels by genre property
 *   - Compare: conversion rate for Comedy/Animation vs Documentary vs other genres
 *   - Look for: genre_boost = true or genre_penalty = true tags
 *
 * EXPECTED INSIGHT: Comedy and Animation content converts browsers to completers
 * at 1.3x the baseline rate. Documentary has high browse rates but low completion,
 * suggesting users are interested but find long-form docs harder to finish.
 *
 * REAL-WORLD ANALOGUE: Content genre significantly affects engagement depth.
 * Light entertainment converts better than educational content, informing
 * content acquisition and recommendation strategy.
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
 *   - Segment users by: binge_session = true on any event
 *   - Compare: total playback completed count per user
 *   - Compare: average completion_percent for binge vs non-binge users
 *   - Compare: playback paused frequency
 *
 * EXPECTED INSIGHT: Binge-watchers consume 40-60% more content, with near-perfect
 * completion rates. They pause far less frequently. This cohort drives the majority
 * of total watch hours on the platform.
 *
 * REAL-WORLD ANALOGUE: Netflix's binge-viewing behavior - a small percentage of
 * users generate a disproportionate share of total viewing. Identifying and
 * nurturing binge-watchers is critical for retention and content ROI.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 3. WEEKEND vs WEEKDAY PATTERNS (event)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Weekend viewing sessions are 1.5x longer than weekday sessions.
 * Weekday viewing concentrates in evening prime-time (6PM-11PM).
 *
 * HOW TO FIND IT:
 *   - Filter: playback completed events
 *   - Compare: average watch_duration_min by day of week
 *   - Filter: weekend_viewing = true vs prime_time = true
 *   - Chart: event volume by hour of day, split by weekend vs weekday
 *
 * EXPECTED INSIGHT: Weekend watch_duration_min averages ~67 mins vs ~45 mins
 * weekday. Weekday prime-time (6PM-11PM) accounts for 60-70% of weekday views.
 *
 * REAL-WORLD ANALOGUE: All streaming platforms see this pattern. Understanding
 * peak viewing windows drives content release strategy (release on Friday for
 * weekend binge), ad pricing, and infrastructure capacity planning.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 4. AD FATIGUE CHURN (everything)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Free-tier users who see 20+ ad impressions experience 50% churn
 * after day 45 of their lifecycle.
 *
 * HOW TO FIND IT:
 *   - Segment: subscription_plan = "free"
 *   - Count: ad impression events per user
 *   - Compare: users with 20+ ads vs <20 ads
 *   - Chart: event activity over time for high-ad-exposure free users
 *   - Look for: ad_fatigue = true tag on surviving events
 *
 * EXPECTED INSIGHT: Free-tier users with heavy ad exposure show a sharp activity
 * cliff around day 45. Remaining events carry the ad_fatigue tag. This simulates
 * the real tension between ad revenue and user experience on free tiers.
 *
 * REAL-WORLD ANALOGUE: Ad-supported streaming tiers (Hulu, Peacock) must balance
 * ad load against churn. Too many ads drive users to cancel or switch to
 * competitors. This hook reveals the "ad tolerance threshold."
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
 *   - Chart: content selected and playback started by day
 *   - Filter: blockbuster_release = true
 *   - Filter: content_id = blockbuster ID
 *   - Compare: ratings distribution before vs after day 50
 *
 * EXPECTED INSIGHT: Clear spike in content engagement after day 50, with a
 * single content_id dominating selections. Ratings for this title cluster at
 * 4-5 stars, showing strong audience reception.
 *
 * REAL-WORLD ANALOGUE: Major content releases (Stranger Things season drop,
 * Disney+ Marvel premiere) create massive engagement spikes that affect all
 * platform metrics. Understanding release impact is crucial for content
 * scheduling and marketing spend.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 6. KIDS PROFILE SAFETY (event)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: 15% of the time, events are tagged as kids profile activity:
 *   - Content selection restricted to animation and documentary genres
 *   - Ad impressions are dropped entirely (no ads for kids)
 *   - Events tagged with kids_profile = true
 *
 * HOW TO FIND IT:
 *   - Filter: kids_profile = true
 *   - Compare: genre distribution for kids vs non-kids events
 *   - Count: ad impression events for kids vs non-kids
 *   - Notice: zero ad impressions when kids_profile = true
 *
 * EXPECTED INSIGHT: Kids profile content is 100% animation/documentary. Zero ads
 * served to kids profiles. This shows proper content gating and ad-free kids
 * experience, which is a regulatory and trust requirement.
 *
 * REAL-WORLD ANALOGUE: COPPA compliance and parental controls. All major
 * streaming platforms (Netflix Kids, Disney+, YouTube Kids) restrict content
 * and ads for children's profiles. Verifying this works correctly is critical.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 7. RECOMMENDATION ENGINE IMPROVEMENT (funnel-pre)
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: After day 60 (proxied by 50% probability), the engagement loop funnel
 * (recommendation clicked -> playback started -> content rated) gets a 1.5x
 * conversion rate boost, simulating a recommendation engine improvement.
 *
 * HOW TO FIND IT:
 *   - Compare: engagement funnel conversion over time (first half vs second half)
 *   - Filter: improved_recs = true on funnel events
 *   - Chart: recommendation clicked -> playback started conversion by week
 *
 * EXPECTED INSIGHT: The engagement funnel conversion rate improves ~1.5x in the
 * latter half of the dataset. Events tagged with improved_recs = true show higher
 * conversion, simulating an A/B test or algorithm deployment.
 *
 * REAL-WORLD ANALOGUE: Recommendation engine updates are the highest-leverage
 * product changes at streaming companies. Netflix estimates its rec engine saves
 * $1B/year in retention. Measuring before/after impact of algorithm changes is
 * critical product analytics.
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
 *   - Create segment: users who did "subtitle toggled" where action = "enabled"
 *   - Compare: average completion_percent (subtitle users vs non-subtitle users)
 *   - Compare: average watch_duration_min
 *   - Compare: total playback completed count per user
 *
 * EXPECTED INSIGHT: Subtitle users complete content 25% more often and watch 15%
 * longer per session. They also consume 20% more titles overall. This suggests
 * subtitles reduce comprehension friction and keep viewers engaged.
 *
 * REAL-WORLD ANALOGUE: Subtitle usage has exploded on streaming platforms.
 * Netflix reports 40%+ of viewing uses subtitles. Subtitle users exhibit higher
 * engagement, especially with foreign-language content (Korean dramas, anime).
 * This insight drives investment in subtitle/dub quality and availability.
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
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * HOW TO RUN THIS DUNGEON
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * From the dm4 root directory:
 *
 *   npm start
 *
 * Or programmatically:
 *
 *   import generate from './index.js';
 *   import config from './dungeons/harness-media.js';
 *   const results = await generate(config);
 *
 * OUTPUT FILES (with writeToDisk: true, format: "json", gzip: true):
 *
 *   - needle-haystack-streaming__events.json.gz - All event data
 *   - needle-haystack-streaming__user_profiles.json.gz - User profiles
 *   - needle-haystack-streaming__content_id_lookup.json.gz - Content catalog
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * TESTING YOUR ANALYTICS PLATFORM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This dungeon is perfect for testing:
 *
 * 1. Funnel Breakdown: Can you break down funnels by genre to find conversion differences?
 * 2. Behavioral Clustering: Can you identify binge-watchers from event patterns?
 * 3. Time-Based Analysis: Can you detect weekend vs weekday viewing patterns?
 * 4. Churn Prediction: Can you predict ad-fatigue churn before it happens?
 * 5. Content Impact: Can you measure the blockbuster release's platform-wide effect?
 * 6. Safety Compliance: Can you verify kids profiles never see ads?
 * 7. A/B Testing: Can you measure the recommendation engine improvement's impact?
 * 8. Feature Impact: Can you quantify the subtitle-engagement correlation?
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * WHY "NEEDLE IN A HAYSTACK"?
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Each hook is a "needle" - a meaningful, actionable insight hidden in a
 * "haystack" of 360K events. The challenge is:
 *
 * 1. FINDING the needles (discovery)
 * 2. VALIDATING they're real patterns (statistical significance)
 * 3. UNDERSTANDING why they matter (business impact)
 * 4. ACTING on them (product decisions)
 *
 * This mirrors real-world streaming analytics: your data contains valuable
 * insights about viewer behavior, content performance, and monetization
 * efficiency, but you need the right tools and skills to find them.
 *
 * Happy Streaming!
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */
