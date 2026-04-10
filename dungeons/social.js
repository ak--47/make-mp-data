import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "harness-social";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef  {import("../types.js").Dungeon} Config */

/*
 * =====================================================================================
 * DATASET OVERVIEW
 * =====================================================================================
 *
 * Chirp — A Twitter+Instagram-style social media platform with algorithmic feed,
 * creator monetization, communities, and direct messaging.
 *
 * CORE LOOP:
 * Users sign up, build a profile, follow people, consume content in their feed,
 * create their own posts/stories, and engage via likes, shares, and comments.
 * Power users become "creators" with subscriber tiers. Monetization through
 * native ads woven into feed and story placements.
 *
 * - 5,000 users over 100 days
 * - 600,000 base events across 18 event types
 * - 8 funnels (onboarding, engagement, discovery, creator journey, ads)
 * - Group analytics (100 communities)
 * - Account types: personal, creator, business
 * =====================================================================================
 */

/*
 * =====================================================================================
 * ANALYTICS HOOKS
 * =====================================================================================
 *
 * 8 deliberately architected patterns hidden in the data:
 *
 * -------------------------------------------------------------------------------------
 * 1. VIRAL CONTENT CASCADE (everything hook)
 * -------------------------------------------------------------------------------------
 * 5% of users with 10+ posts become "viral creators." Each of their posts generates
 * 10-20 extra post viewed, post liked, and post shared events (viral_cascade: true).
 *
 * Mixpanel Steps:
 *   - Insights > "post viewed" > Total events > Breakdown: "viral_cascade"
 *   - Insights > "post liked" > Total events per user > Breakdown: "viral_cascade"
 *
 * -------------------------------------------------------------------------------------
 * 2. FOLLOW-BACK SNOWBALL (everything hook)
 * -------------------------------------------------------------------------------------
 * Users with 5+ "user followed" events become prolific creators. 50% of their posts
 * get duplicated (follow_back_effect: true), plus extra comments are injected.
 *
 * Mixpanel Steps:
 *   - Insights > "post created" > Total per user > Breakdown: "follow_back_effect"
 *   - Insights > "post created" > Total per user > Cohort: users with 5+ follows
 *
 * -------------------------------------------------------------------------------------
 * 3. ALGORITHM CHANGE (event hook)
 * -------------------------------------------------------------------------------------
 * Day 45: content discovery flips from feed to explore. Before day 45, 70% of
 * post viewed source = "feed." After, 70% shift to source = "explore."
 *
 * Mixpanel Steps:
 *   - Insights (line) > "post viewed" > Total > Breakdown: "source" > Daily trend
 *   - Compare date ranges before/after day 45: feed vs explore ratio inverts
 *
 * -------------------------------------------------------------------------------------
 * 4. ENGAGEMENT BAIT (event hook)
 * -------------------------------------------------------------------------------------
 * 20% of post viewed events are engagement_bait: true with view durations of 1-5 sec.
 * High impressions but terrible engagement quality.
 *
 * Mixpanel Steps:
 *   - Insights > "post viewed" > Avg "view_duration_sec" > Breakdown: "engagement_bait"
 *   - Expected: bait ~2-3 sec avg vs normal ~15-30 sec avg
 *
 * -------------------------------------------------------------------------------------
 * 5. NOTIFICATION RE-ENGAGEMENT (event hook)
 * -------------------------------------------------------------------------------------
 * After day 30, 30% of post viewed events get source overridden to "notification"
 * with trending_reengagement: true.
 *
 * Mixpanel Steps:
 *   - Insights (line) > "post viewed" > Total > Filter: source = "notification" > Daily
 *   - Near-zero before day 30, then ~30% of views from notifications
 *
 * -------------------------------------------------------------------------------------
 * 6. CREATOR MONETIZATION (everything hook)
 * -------------------------------------------------------------------------------------
 * Users with any "creator subscription started" event post 3x more. Two extra posts
 * injected per original (monetized_creator: true). Also extra profile-source views.
 *
 * Mixpanel Steps:
 *   - Insights > "post created" > Total per user > Breakdown: "monetized_creator"
 *   - Insights > "post viewed" > Filter: source = "profile" > Breakdown: "monetized_creator"
 *
 * -------------------------------------------------------------------------------------
 * 7. TOXICITY CHURN (everything hook)
 * -------------------------------------------------------------------------------------
 * Users with 3+ reports lose 60% of events after day 30. Remaining events tagged
 * toxic_user: true. Simulates churn from toxic content exposure.
 *
 * Mixpanel Steps:
 *   - Retention > Segment: users with 3+ "report submitted" vs fewer
 *   - Insights (line) > Any event > Total per user > Breakdown: "toxic_user" > Weekly
 *
 * -------------------------------------------------------------------------------------
 * 8. WEEKEND CONTENT SURGE (event + everything hook)
 * -------------------------------------------------------------------------------------
 * Saturday/Sunday post/story events tagged weekend_surge: true. 30% get a duplicate
 * event 1-3 hours later (weekend_duplicate: true).
 *
 * Mixpanel Steps:
 *   - Insights (bar) > "post created" > Total > Breakdown: Day of Week
 *   - Expected: Sat/Sun bars ~30% taller than weekday bars
 *
 * =====================================================================================
 * EXPECTED METRICS SUMMARY
 * =====================================================================================
 *
 * Hook                      | Metric                  | Baseline     | Hook Effect    | Ratio
 * --------------------------|-------------------------|--------------|----------------|-------
 * Viral Content Cascade     | Engagement per post     | 1-2x         | 10-20x         | ~15x
 * Follow-Back Snowball      | Posts per user           | ~4           | ~8             | 2x
 * Algorithm Change          | Feed vs. Explore source  | 70/15        | 15/70          | Flip
 * Engagement Bait           | View duration (sec)      | 15-30        | 1-5            | ~0.2x
 * Notification Re-engage    | Notification source %    | ~10%         | ~30%           | 3x
 * Creator Monetization      | Content creation freq    | 1x           | 3x             | 3x
 * Toxicity Churn            | Post-day-30 retention    | ~80%         | ~40%           | 0.5x
 * Weekend Content Surge     | Weekend vs. weekday vol  | 1x           | 1.3x           | 1.3x
 *
 * =====================================================================================
 * ADVANCED ANALYSIS IDEAS
 * =====================================================================================
 *
 * - Viral Creators + Algorithm Change: Do viral creators benefit more from the
 *   explore-based algorithm? Compare viral cascade engagement before/after day 45.
 * - Follow-Back Snowball + Creator Monetization: Users with both effects compound
 *   to ~6x content output (2x from follows * 3x from monetization).
 * - Engagement Bait + Toxicity Churn: Correlation between engagement_bait exposure
 *   and toxic_user tagging / report submission rates.
 * - Weekend Surge + Viral Cascade: Compounding creates extreme engagement spikes
 *   on weekend days.
 * - Notification Re-engagement + Toxicity Churn: Do trending notifications help
 *   retain toxic_user-tagged users, or do they still churn?
 * - Cohort by signup method, content niche, account type, community membership,
 *   or join week (users joining during algorithm change see a different product).
 * - Funnel analysis: onboarding by signup method, engagement by source, creator
 *   journey before/after algorithm change.
 * =====================================================================================
 */

// Generate consistent post IDs for lookup tables
const postIds = v.range(1, 1001).map(n => `post_${v.uid(8)}`);

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
	scdProps: {},

	funnels: [
		{
			sequence: ["account created", "profile updated", "post created"],
			isFirstFunnel: true,
			conversionRate: 70,
			timeToConvert: 0.5,
		},
		{
			// Feed consumption: view → like → comment (most common loop)
			sequence: ["post viewed", "post liked", "comment posted"],
			conversionRate: 45,
			timeToConvert: 0.5,
			weight: 6,
		},
		{
			// Content creation cycle: create → views → engagement
			sequence: ["post created", "post viewed", "post liked", "post shared"],
			conversionRate: 30,
			timeToConvert: 3,
			weight: 3,
		},
		{
			// Stories engagement
			sequence: ["story created", "story viewed", "dm sent"],
			conversionRate: 40,
			timeToConvert: 1,
			weight: 3,
		},
		{
			// Discovery and follow loop
			sequence: ["search performed", "post viewed", "user followed"],
			conversionRate: 35,
			timeToConvert: 1,
			weight: 2,
		},
		{
			// Notifications driving re-engagement
			sequence: ["notification received", "post viewed", "post liked"],
			conversionRate: 50,
			timeToConvert: 0.5,
			weight: 2,
		},
		{
			// Profile management and creator monetization
			sequence: ["profile updated", "creator subscription started", "post created"],
			conversionRate: 15,
			timeToConvert: 24,
			weight: 1,
		},
		{
			// Ad interaction and moderation
			sequence: ["ad viewed", "ad clicked", "report submitted"],
			conversionRate: 20,
			timeToConvert: 2,
			weight: 1,
		},
	],

	events: [
		{
			event: "account created",
			weight: 1,
			isFirstEvent: true,
			properties: {
				"signup_method": ["email", "google", "apple", "sso"],
				"referred_by": ["organic", "friend", "ad", "influencer"],
			}
		},
		{
			event: "post created",
			weight: 12,
			properties: {
				"post_type": ["text", "image", "video", "poll", "link"],
				"character_count": u.weighNumRange(1, 280),
				"has_media": u.pickAWinner([true, false], 0.4),
				"hashtag_count": u.weighNumRange(0, 10, 0.5),
			}
		},
		{
			event: "post viewed",
			weight: 30,
			properties: {
				"post_type": ["text", "image", "video", "poll", "link"],
				"view_duration_sec": u.weighNumRange(1, 120, 0.3, 5),
				"source": ["feed", "explore", "search", "profile", "notification"],
			}
		},
		{
			event: "post liked",
			weight: 18,
			properties: {
				"post_type": ["text", "image", "video", "poll", "link"],
			}
		},
		{
			event: "post shared",
			weight: 6,
			properties: {
				"share_destination": ["repost", "dm", "external", "copy_link"],
			}
		},
		{
			event: "comment posted",
			weight: 10,
			properties: {
				"comment_length": u.weighNumRange(1, 500, 0.3, 20),
				"has_mention": u.pickAWinner([true, false, false]),
			}
		},
		{
			event: "user followed",
			weight: 8,
			properties: {
				"discovery_source": ["suggested", "search", "post", "profile", "mutual"],
			}
		},
		{
			event: "user unfollowed",
			weight: 2,
			properties: {
				"reason": ["content_quality", "too_frequent", "lost_interest", "offensive"],
			}
		},
		{
			event: "story viewed",
			weight: 15,
			properties: {
				"story_type": ["photo", "video", "text"],
				"view_duration_sec": u.weighNumRange(1, 30, 0.5, 5),
				"completed": u.pickAWinner([true, false], 0.6),
			}
		},
		{
			event: "story created",
			weight: 5,
			properties: {
				"story_type": ["photo", "video", "text"],
				"has_filter": u.pickAWinner([true, false], 0.5),
				"has_sticker": u.pickAWinner([true, false], 0.3),
			}
		},
		{
			event: "search performed",
			weight: 7,
			properties: {
				"search_type": ["users", "hashtags", "posts"],
				"results_count": u.weighNumRange(0, 50, 0.5, 10),
			}
		},
		{
			event: "notification received",
			weight: 12,
			properties: {
				"notification_type": ["like", "follow", "comment", "mention", "trending"],
				"clicked": u.pickAWinner([true, false], 0.4),
			}
		},
		{
			event: "dm sent",
			weight: 8,
			properties: {
				"message_type": ["text", "image", "voice", "link"],
				"conversation_length": u.weighNumRange(1, 100),
			}
		},
		{
			event: "ad viewed",
			weight: 10,
			properties: {
				"ad_format": ["feed_native", "story", "banner", "video"],
				"ad_category": ["retail", "tech", "food", "finance", "entertainment"],
				"view_duration_sec": u.weighNumRange(1, 30, 0.3),
			}
		},
		{
			event: "ad clicked",
			weight: 2,
			properties: {
				"ad_format": ["feed_native", "story", "banner", "video"],
				"ad_category": ["retail", "tech", "food", "finance", "entertainment"],
			}
		},
		{
			event: "report submitted",
			weight: 1,
			properties: {
				"report_type": ["spam", "harassment", "misinformation", "hate_speech", "other"],
				"content_type": ["post", "comment", "user", "dm"],
			}
		},
		{
			event: "profile updated",
			weight: 3,
			properties: {
				"field_updated": ["bio", "avatar", "display_name", "privacy_settings", "interests"],
			}
		},
		{
			event: "creator subscription started",
			weight: 2,
			properties: {
				"tier": ["basic", "premium", "vip"],
				"price_usd": u.pickAWinner([4.99, 9.99, 19.99]),
			}
		},
	],

	superProps: {
		app_version: ["4.0", "4.1", "4.2", "4.3", "5.0"],
		account_type: ["personal", "creator", "business"],
	},

	userProps: {
		"follower_count": u.weighNumRange(0, 10000, 0.2, 50),
		"following_count": u.weighNumRange(0, 5000, 0.3, 100),
		"bio_length": u.weighNumRange(0, 160),
		"verified": u.pickAWinner([true, false], 0.05),
		"content_niche": ["lifestyle", "tech", "food", "fitness", "travel", "comedy", "news", "art"],
	},

	groupKeys: [
		["community_id", 100, ["post created", "comment posted", "post liked", "post shared"]],
	],

	groupProps: {
		community_id: {
			"name": () => `${chance.word()} ${chance.pickone(["Hub", "Circle", "Squad", "Zone", "Space"])}`,
			"member_count": u.weighNumRange(50, 5000, 0.3, 200),
			"category": ["technology", "entertainment", "sports", "politics", "art", "science"],
			"is_moderated": u.pickAWinner([true, false], 0.7),
		}
	},

	lookupTables: [],

	hook: function (record, type, meta) {
		const NOW = dayjs();
		const DATASET_START = NOW.subtract(days, 'days');
		const ALGORITHM_CHANGE_DAY = DATASET_START.add(45, 'days');
		const REENGAGEMENT_START = DATASET_START.add(30, 'days');

		// ─── EVENT-LEVEL HOOKS ───────────────────────────────────────────

		if (type === "event") {
			const EVENT_TIME = dayjs(record.time);

			// Hook #3: ALGORITHM CHANGE - Day 45 flips feed to explore
			if (record.event === "post viewed") {
				if (EVENT_TIME.isAfter(ALGORITHM_CHANGE_DAY)) {
					// After day 45: 70% explore, 15% feed
					if (chance.bool({ likelihood: 70 })) {
						record.source = "explore";
					}
				} else {
					// Before day 45: 70% feed, 15% explore (reinforce default)
					if (chance.bool({ likelihood: 70 })) {
						record.source = "feed";
					}
				}
			}

			// Hook #4: ENGAGEMENT BAIT - High hashtag posts get short view durations
			if (record.event === "post viewed") {
				// 20% of post views are engagement-bait content
				if (chance.bool({ likelihood: 20 })) {
					record.view_duration_sec = chance.integer({ min: 1, max: 5 });
					record.engagement_bait = true;
				} else {
					record.engagement_bait = false;
				}

				// Hook #5: NOTIFICATION RE-ENGAGEMENT - Trending drives views after day 30
				if (EVENT_TIME.isAfter(REENGAGEMENT_START) && chance.bool({ likelihood: 30 })) {
					record.source = "notification";
					record.trending_reengagement = true;
				} else {
					record.trending_reengagement = false;
				}
			}

			// Hook #8: WEEKEND CONTENT SURGE - tag weekend content (duplication handled in everything hook)
			if (record.event === "post created" || record.event === "story created") {
				const dayOfWeek = EVENT_TIME.day(); // 0 = Sunday, 6 = Saturday
				if (dayOfWeek === 0 || dayOfWeek === 6) {
					record.weekend_surge = true;
				} else {
					record.weekend_surge = false;
				}
			}
		}

		// ─── EVERYTHING-LEVEL HOOKS ──────────────────────────────────────

		if (type === "everything") {
			const userEvents = record;
			if (!userEvents || userEvents.length === 0) return record;

			// Tracking variables for user patterns
			let postCreatedCount = 0;
			let followReceivedCount = 0;
			let reportSubmittedCount = 0;
			let hasCreatorSubscription = false;
			let isViralCreator = false;

			// First pass: identify user patterns
			userEvents.forEach((event) => {
				if (event.event === "post created") {
					postCreatedCount++;
				}
				if (event.event === "user followed") {
					followReceivedCount++;
				}
				if (event.event === "report submitted") {
					reportSubmittedCount++;
				}
				if (event.event === "creator subscription started") {
					hasCreatorSubscription = true;
				}
			});

			// Hook #1: VIRAL CONTENT CASCADE
			// Users with 10+ posts and 5% random chance are viral creators
			if (postCreatedCount >= 10 && chance.bool({ likelihood: 5 })) {
				isViralCreator = true;
			}

			// Second pass: set schema defaults then modify/inject based on patterns
			for (let idx = userEvents.length - 1; idx >= 0; idx--) {
				const event = userEvents[idx];
				const eventTime = dayjs(event.time);

				// Set schema defaults for conditional properties
				if (event.event === "post created" || event.event === "story created") {
					if (event.monetized_creator === undefined) event.monetized_creator = false;
					if (event.follow_back_effect === undefined) event.follow_back_effect = false;
				}
				if (event.event === "post viewed") {
					if (event.viral_cascade === undefined) event.viral_cascade = false;
				}
				if (event.toxic_user === undefined) event.toxic_user = false;

				// Hook #1: VIRAL CONTENT CASCADE
				// Viral creators get 10-20x engagement on their posts
				if (isViralCreator && event.event === "post created") {
					const viralViews = chance.integer({ min: 10, max: 20 });
					const viralLikes = chance.integer({ min: 10, max: 20 });
					const viralShares = chance.integer({ min: 10, max: 20 });
					const injected = [];

					for (let i = 0; i < viralViews; i++) {
						injected.push({
							event: "post viewed",
							time: eventTime.add(chance.integer({ min: 1, max: 180 }), 'minutes').toISOString(),
							user_id: event.user_id,
							post_type: event.post_type || "text",
							source: chance.pickone(["feed", "explore", "search"]),
							view_duration_sec: chance.integer({ min: 5, max: 90 }),
							viral_cascade: true,
						});
					}
					for (let i = 0; i < viralLikes; i++) {
						injected.push({
							event: "post liked",
							time: eventTime.add(chance.integer({ min: 2, max: 240 }), 'minutes').toISOString(),
							user_id: event.user_id,
							post_type: event.post_type || "text",
							viral_cascade: true,
						});
					}
					for (let i = 0; i < viralShares; i++) {
						injected.push({
							event: "post shared",
							time: eventTime.add(chance.integer({ min: 5, max: 300 }), 'minutes').toISOString(),
							user_id: event.user_id,
							share_destination: chance.pickone(["repost", "dm", "external", "copy_link"]),
							viral_cascade: true,
						});
					}

					// Splice all injected events after the post created event
					userEvents.splice(idx + 1, 0, ...injected);
				}

				// Hook #2: FOLLOW-BACK SNOWBALL
				// Users with 5+ follows become prolific creators
				if (followReceivedCount >= 5 && event.event === "post created") {
					if (chance.bool({ likelihood: 50 })) {
						const duplicatePost = {
							event: "post created",
							time: eventTime.add(chance.integer({ min: 30, max: 240 }), 'minutes').toISOString(),
							user_id: event.user_id,
							post_type: chance.pickone(["text", "image", "video"]),
							character_count: chance.integer({ min: 10, max: 280 }),
							has_media: chance.bool({ likelihood: 60 }),
							hashtag_count: chance.integer({ min: 0, max: 5 }),
							follow_back_effect: true,
						};
						const extraComment = {
							event: "comment posted",
							time: eventTime.add(chance.integer({ min: 10, max: 120 }), 'minutes').toISOString(),
							user_id: event.user_id,
							comment_length: chance.integer({ min: 5, max: 200 }),
							has_mention: chance.bool({ likelihood: 40 }),
							follow_back_effect: true,
						};
						userEvents.splice(idx + 1, 0, duplicatePost, extraComment);
					}
				}

				// Hook #6: CREATOR MONETIZATION
				// Monetized creators post 3x more frequently
				if (hasCreatorSubscription && event.event === "post created") {
					// Triple frequency: add 2 extra posts for each existing one
					for (let i = 0; i < 2; i++) {
						const extraPost = {
							event: "post created",
							time: eventTime.add(chance.integer({ min: 1, max: 12 }), 'hours').toISOString(),
							user_id: event.user_id,
							post_type: chance.pickone(["text", "image", "video", "link"]),
							character_count: chance.integer({ min: 20, max: 280 }),
							has_media: chance.bool({ likelihood: 70 }),
							hashtag_count: chance.integer({ min: 1, max: 8 }),
							monetized_creator: true,
						};
						userEvents.splice(idx + 1, 0, extraPost);
					}
				}
				if (hasCreatorSubscription && event.event === "story created") {
					// Also triple story creation
					for (let i = 0; i < 2; i++) {
						const extraStory = {
							event: "story created",
							time: eventTime.add(chance.integer({ min: 1, max: 8 }), 'hours').toISOString(),
							user_id: event.user_id,
							story_type: chance.pickone(["photo", "video", "text"]),
							has_filter: chance.bool({ likelihood: 60 }),
							has_sticker: chance.bool({ likelihood: 40 }),
							monetized_creator: true,
						};
						userEvents.splice(idx + 1, 0, extraStory);
					}
				}
				// Monetized creators also check their analytics more (extra post views)
				if (hasCreatorSubscription && event.event === "post viewed") {
					if (chance.bool({ likelihood: 25 })) {
						const analyticsView = {
							event: "post viewed",
							time: eventTime.add(chance.integer({ min: 1, max: 30 }), 'minutes').toISOString(),
							user_id: event.user_id,
							post_type: event.post_type || "text",
							source: "profile",
							view_duration_sec: chance.integer({ min: 10, max: 60 }),
							monetized_creator: true,
						};
						userEvents.splice(idx + 1, 0, analyticsView);
					}
				}
			}

			// Hook #8: WEEKEND CONTENT SURGE - inject duplicate events for weekend content
			for (let idx = userEvents.length - 1; idx >= 0; idx--) {
				const event = userEvents[idx];
				if (event.weekend_surge && !event.weekend_duplicate) {
					if (chance.bool({ likelihood: 30 })) {
						const etime = dayjs(event.time);
						const dup = {
							...event,
							time: etime.add(chance.integer({ min: 1, max: 3 }), 'hours').toISOString(),
							weekend_duplicate: true,
						};
						userEvents.splice(idx + 1, 0, dup);
					}
				}
			}

			// Hook #7: TOXICITY CHURN
			// Users with 3+ reports lose 60% of activity after day 30
			if (reportSubmittedCount >= 3) {
				const churnCutoff = DATASET_START.add(30, 'days');
				for (let i = userEvents.length - 1; i >= 0; i--) {
					const evt = userEvents[i];
					if (dayjs(evt.time).isAfter(churnCutoff)) {
						if (chance.bool({ likelihood: 60 })) {
							userEvents.splice(i, 1);
						} else {
							evt.toxic_user = true;
						}
					}
				}
			}
		}

		return record;
	}
};

export default config;
