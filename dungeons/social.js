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

/** @typedef  {import("../../types.js").Dungeon} Config */

/**
 * NEEDLE IN A HAYSTACK - SOCIAL MEDIA APP DESIGN
 *
 * Chirp - A Twitter+Instagram-style social media platform with algorithmic feed,
 * creator monetization, communities, and direct messaging.
 *
 * CORE LOOP:
 * Users sign up, build a profile, follow people, consume content in their feed,
 * create their own posts/stories, and engage via likes, shares, and comments.
 * Power users become "creators" with subscriber tiers. Monetization through
 * native ads woven into feed and story placements.
 *
 * CONTENT CREATION (events: post created, story created):
 * - Five post types: text (classic tweet), image, video, poll, link
 * - Character count up to 280, optional media, hashtags for discoverability
 * - Stories are ephemeral (photo, video, text) with filters and stickers
 * - Creators post 3x more frequently once they start monetizing
 *
 * CONTENT CONSUMPTION (events: post viewed, story viewed):
 * - Algorithmic feed is the primary discovery surface (pre day-45)
 * - Explore tab surfaces trending and personalized content
 * - Search allows finding users, hashtags, and specific posts
 * - View duration is a key quality signal - engagement bait gets short views
 *
 * SOCIAL GRAPH (events: user followed, user unfollowed):
 * - Follow/unfollow mechanics drive the social network
 * - Users who receive 5+ follows become prolific creators (follow-back snowball)
 * - Discovery sources: suggested, search, post interactions, mutual connections
 * - Unfollows track reasons to understand content quality issues
 *
 * ENGAGEMENT (events: post liked, post shared, comment posted):
 * - Likes are lightweight engagement (highest volume after views)
 * - Shares amplify reach via repost, DM, external, or copy link
 * - Comments drive conversation with mentions and threaded replies
 * - Viral creators (5% of users) generate 10-20x engagement cascades
 *
 * MESSAGING (event: dm sent):
 * - Direct messages support text, image, voice, and link content
 * - Conversation threads build over time
 * - DMs are a key sharing destination for content
 *
 * NOTIFICATIONS (event: notification received):
 * - Five types: like, follow, comment, mention, trending
 * - Trending notifications drive re-engagement after day 30
 * - Click-through rates vary by notification type
 *
 * DISCOVERY & SEARCH (event: search performed):
 * - Three search types: users, hashtags, posts
 * - Results count varies; empty results indicate content gaps
 * - Search is a secondary discovery surface behind feed/explore
 *
 * ADVERTISING (events: ad viewed, ad clicked):
 * - Four ad formats: feed native, story, banner, video
 * - Five ad categories: retail, tech, food, finance, entertainment
 * - View duration and click-through tracked for ad effectiveness
 *
 * CREATOR ECONOMY (event: creator subscription started):
 * - Three tiers: basic ($4.99), premium ($9.99), vip ($19.99)
 * - Subscribers unlock exclusive content from creators
 * - Monetized creators post 3x more (they have financial incentive)
 *
 * MODERATION (event: report submitted):
 * - Users report spam, harassment, misinformation, hate speech
 * - Content types: posts, comments, users, DMs
 * - Users who report 3+ times show 60% churn (toxic environment drives them out)
 *
 * COMMUNITIES (group: community_id):
 * - 100 communities with categories (tech, entertainment, sports, etc.)
 * - Communities aggregate posts, comments, likes, and shares
 * - Moderated vs unmoderated communities behave differently
 *
 * WHY THESE EVENTS/PROPERTIES?
 * - Events model a complete social media loop: signup -> engagement -> creation -> monetization
 * - Properties enable cohort analysis: account type, content niche, verification status
 * - Funnels reveal friction: onboarding drop-off, content-to-engagement conversion
 * - The algorithm change (day 45) creates a clear before/after for A/B analysis
 * - Viral cascades and follow-back snowballs simulate real network effects
 * - Weekend surges create visible temporal patterns in content creation
 * - The "needle in haystack" hooks simulate real product insights hidden in production data
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

	/**
	 * ARCHITECTED ANALYTICS HOOKS
	 *
	 * This hook function creates 8 deliberate patterns in the data:
	 *
	 * 1. VIRAL CONTENT CASCADE: 5% of prolific users generate 10-20x engagement
	 * 2. FOLLOW-BACK SNOWBALL: Users with 5+ follows become prolific creators
	 * 3. ALGORITHM CHANGE: Day 45 flips discovery from feed to explore
	 * 4. ENGAGEMENT BAIT: High-hashtag posts get views but terrible view durations
	 * 5. NOTIFICATION RE-ENGAGEMENT: Trending notifications drive post views after day 30
	 * 6. CREATOR MONETIZATION: Subscribed creators post 3x more frequently
	 * 7. TOXICITY CHURN: Users with 3+ reports lose 60% of activity after day 30
	 * 8. WEEKEND CONTENT SURGE: 30% more content creation on Saturdays and Sundays
	 */
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

/**
 * =====================================================================================
 * NEEDLE IN A HAYSTACK - CHIRP SOCIAL MEDIA APP ANALYTICS
 * =====================================================================================
 *
 * A Twitter+Instagram-style social media platform with 8 deliberately architected
 * analytics insights hidden in the data. This dungeon simulates realistic social
 * media behavioral patterns including viral cascades, algorithmic feed changes,
 * creator economies, and content moderation challenges.
 *
 * =====================================================================================
 * DATASET OVERVIEW
 * =====================================================================================
 *
 * - 5,000 users over 100 days
 * - 360,000 base events across 18 event types
 * - 3 funnels (onboarding, content engagement, creator journey)
 * - Group analytics (100 communities)
 * - Lookup table (1,000 posts with metadata)
 * - Account types: personal, creator, business
 *
 * =====================================================================================
 * THE 8 ARCHITECTED HOOKS
 * =====================================================================================
 *
 * Each hook creates a specific, discoverable analytics insight that simulates
 * real-world social media product behavior patterns.
 *
 * -------------------------------------------------------------------------------------
 * 1. VIRAL CONTENT CASCADE (everything hook)
 * -------------------------------------------------------------------------------------
 *
 * PATTERN: 5% of users who have created 10+ posts are tagged as "viral creators."
 * Each of their posts generates 10-20 extra post viewed, post liked, and post shared
 * events, all tagged with viral_cascade: true.
 *
 * HOW TO FIND IT:
 *   - Filter events where viral_cascade = true
 *   - Segment users by viral_cascade presence
 *   - Compare: engagement metrics (views, likes, shares) per post for viral vs. normal users
 *
 * EXPECTED INSIGHT: A small minority of users (roughly 250 out of 5,000) drive a
 * disproportionate share of total engagement. Viral creators generate 10-20x more
 * views, likes, and shares per post than the average user.
 *
 * REAL-WORLD ANALOGUE: Power-law distribution in social media where a tiny fraction
 * of creators generate the majority of platform engagement (the 1% rule).
 *
 * -------------------------------------------------------------------------------------
 * 2. FOLLOW-BACK SNOWBALL (everything hook)
 * -------------------------------------------------------------------------------------
 *
 * PATTERN: Users who receive 5 or more "user followed" events become prolific
 * content creators. 50% of their post created events get duplicated (with
 * follow_back_effect: true), and extra comment posted events are injected.
 *
 * HOW TO FIND IT:
 *   - Segment users by count of "user followed" events (5+ vs. fewer)
 *   - Compare: post creation frequency and comment frequency
 *   - Filter: follow_back_effect = true
 *
 * EXPECTED INSIGHT: Users who gain a following create significantly more content.
 * The follow-back snowball creates a positive feedback loop: more followers ->
 * more content -> more engagement -> more followers.
 *
 * REAL-WORLD ANALOGUE: Network effects in social media. Users who gain traction
 * become more active, which further accelerates their growth. This is the
 * mechanism behind "going viral" on platforms like Twitter/X and Instagram.
 *
 * -------------------------------------------------------------------------------------
 * 3. ALGORITHM CHANGE (event hook)
 * -------------------------------------------------------------------------------------
 *
 * PATTERN: On day 45 of the dataset, the content discovery algorithm changes.
 * Before day 45, 70% of post viewed events have source = "feed." After day 45,
 * 70% shift to source = "explore."
 *
 * HOW TO FIND IT:
 *   - Chart: post viewed events broken down by source over time
 *   - Look for the crossover point around day 45
 *   - Compare: engagement metrics before vs. after the algorithm change
 *
 * EXPECTED INSIGHT: A clear inflection point around day 45 where feed traffic
 * drops and explore traffic surges. This simulates a real algorithm deployment
 * and its impact on content discovery patterns.
 *
 * REAL-WORLD ANALOGUE: Platform algorithm changes (e.g., Instagram shifting from
 * chronological feed to algorithmic recommendations, Twitter introducing "For You"
 * tab). These changes fundamentally alter content distribution.
 *
 * -------------------------------------------------------------------------------------
 * 4. ENGAGEMENT BAIT (event hook)
 * -------------------------------------------------------------------------------------
 *
 * PATTERN: 20% of post viewed events are tagged as engagement_bait: true and
 * have very short view durations (1-5 seconds). These represent clickbait or
 * hashtag-stuffed content that attracts views but fails to hold attention.
 *
 * HOW TO FIND IT:
 *   - Filter: post viewed where engagement_bait = true
 *   - Compare: average view_duration_sec for engagement_bait vs. normal views
 *   - Correlate: engagement_bait with downstream actions (likes, comments, shares)
 *
 * EXPECTED INSIGHT: Engagement bait posts get views but have 5-10x shorter view
 * durations. This creates a quality gap: high impression count but poor engagement
 * quality. Users who consume engagement bait likely have lower satisfaction.
 *
 * REAL-WORLD ANALOGUE: Clickbait and hashtag abuse on social platforms. Content
 * that games the algorithm for reach but delivers poor user experience.
 *
 * -------------------------------------------------------------------------------------
 * 5. NOTIFICATION RE-ENGAGEMENT (event hook)
 * -------------------------------------------------------------------------------------
 *
 * PATTERN: After day 30, 30% of post viewed events have their source overridden
 * to "notification" and are tagged with trending_reengagement: true. This simulates
 * the platform using trending notifications to re-engage lapsed users.
 *
 * HOW TO FIND IT:
 *   - Chart: post viewed by source over time, focusing on "notification" after day 30
 *   - Filter: trending_reengagement = true
 *   - Compare: notification-driven views vs. organic views in engagement quality
 *
 * EXPECTED INSIGHT: After day 30, notification-driven views spike as the platform
 * pushes trending content to re-engage users. This creates a visible shift in the
 * source distribution for post views.
 *
 * REAL-WORLD ANALOGUE: Push notification strategies used by social apps to
 * re-engage dormant users with trending or personalized content (e.g., "You're
 * missing out on what's trending").
 *
 * -------------------------------------------------------------------------------------
 * 6. CREATOR MONETIZATION (everything hook)
 * -------------------------------------------------------------------------------------
 *
 * PATTERN: Users who have any "creator subscription started" event post 3x more
 * frequently. For each post created and story created event, 2 additional copies
 * are injected with monetized_creator: true. They also check their own content
 * more (extra post viewed events from "profile" source).
 *
 * HOW TO FIND IT:
 *   - Segment users by: has "creator subscription started" event
 *   - Compare: post creation and story creation frequency
 *   - Filter: monetized_creator = true
 *   - Compare: post viewed source = "profile" rate (analytics checking behavior)
 *
 * EXPECTED INSIGHT: Monetized creators produce 3x more content and check their
 * own profiles more often. The subscription creates a financial incentive that
 * dramatically increases content output.
 *
 * REAL-WORLD ANALOGUE: Creator monetization programs (YouTube Partner Program,
 * TikTok Creator Fund, Twitter/X subscriptions) that incentivize consistent
 * content production from top creators.
 *
 * -------------------------------------------------------------------------------------
 * 7. TOXICITY CHURN (everything hook)
 * -------------------------------------------------------------------------------------
 *
 * PATTERN: Users who submit 3 or more reports experience 60% event removal after
 * day 30 of the dataset. Remaining events are tagged with toxic_user: true. These
 * users encountered enough bad content to file multiple reports, and many of them
 * churned as a result.
 *
 * HOW TO FIND IT:
 *   - Segment users by: count of "report submitted" events (3+ vs. fewer)
 *   - Compare: event volume before and after day 30
 *   - Filter: toxic_user = true
 *   - Compare: D30+ retention rates
 *
 * EXPECTED INSIGHT: Users who report 3+ pieces of content show a dramatic drop
 * in activity after day 30. This simulates the real pattern where users exposed
 * to toxic content eventually leave the platform.
 *
 * REAL-WORLD ANALOGUE: Content moderation challenges on social platforms.
 * Users who encounter repeated toxic content (and report it) eventually churn,
 * even though they're the "good actors" trying to improve the platform.
 *
 * -------------------------------------------------------------------------------------
 * 8. WEEKEND CONTENT SURGE (event hook)
 * -------------------------------------------------------------------------------------
 *
 * PATTERN: Post created and story created events that fall on Saturday or Sunday
 * are tagged with weekend_surge: true. 30% of these weekend events generate a
 * duplicate event 1-3 hours later (tagged weekend_duplicate: true).
 *
 * HOW TO FIND IT:
 *   - Chart: post created and story created events by day of week
 *   - Filter: weekend_surge = true or weekend_duplicate = true
 *   - Compare: weekday vs. weekend content creation volumes
 *
 * EXPECTED INSIGHT: Saturdays and Sundays show roughly 30% more content creation
 * than weekdays. The weekly pattern is clearly visible in a time-series chart,
 * creating a sawtooth pattern in content creation volume.
 *
 * REAL-WORLD ANALOGUE: Real social media usage patterns where users have more
 * leisure time on weekends, leading to increased content creation and consumption.
 * Most social platforms see clear weekly seasonality.
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
 * CROSS-HOOK ANALYSIS IDEAS
 * =====================================================================================
 *
 * 1. Viral Creators + Algorithm Change:
 *    Do viral creators benefit more from the explore-based algorithm? Compare viral
 *    cascade engagement before and after day 45. The explore algorithm may amplify
 *    viral content even further.
 *
 * 2. Follow-Back Snowball + Creator Monetization:
 *    Users who gain followers AND start creator subscriptions should be the most
 *    prolific content producers. The two hooks compound: 2x from follows * 3x from
 *    monetization = 6x content output.
 *
 * 3. Engagement Bait + Toxicity Churn:
 *    Do users who consume high amounts of engagement bait also submit more reports?
 *    Is there a correlation between engagement_bait exposure and toxic_user tagging?
 *
 * 4. Weekend Surge + Viral Cascade:
 *    Are viral cascades more likely on weekends when more content is created?
 *    The compounding of weekend surge + viral cascade should create extreme
 *    engagement spikes on weekend days.
 *
 * 5. Notification Re-engagement + Toxicity Churn:
 *    Do trending notifications help retain toxic_user-tagged users, or do they
 *    still churn despite re-engagement efforts?
 *
 * 6. Algorithm Change + Engagement Bait:
 *    Does the shift from feed to explore change the proportion of engagement bait?
 *    The explore algorithm may surface different content quality than the feed.
 *
 * 7. Creator Monetization + Viral Cascade:
 *    Monetized creators who are also viral should have astronomical engagement.
 *    These are the platform's most valuable users.
 *
 * 8. Follow-Back Snowball + Toxicity Churn:
 *    Do users who gain many followers also attract more reports? Is popularity
 *    correlated with toxicity exposure?
 *
 * =====================================================================================
 * COHORT ANALYSIS IDEAS
 * =====================================================================================
 *
 * - Cohort by signup method: Do google/apple signups retain better than email?
 * - Cohort by content niche: Which niches produce the most viral creators?
 * - Cohort by account type: How do personal vs. creator vs. business accounts differ?
 * - Cohort by community membership: Do community members engage more?
 * - Cohort by week: Users who joined during algorithm change (day 45) see a
 *   fundamentally different product experience
 *
 * =====================================================================================
 * FUNNEL ANALYSIS IDEAS
 * =====================================================================================
 *
 * - Onboarding Funnel: account created -> profile updated -> post created
 *   How does signup method affect onboarding completion?
 * - Content Engagement Funnel: post viewed -> post liked -> comment posted
 *   Compare conversion by source (feed vs. explore vs. notification)
 * - Creator Journey Funnel: post created -> post viewed -> post liked -> post shared
 *   How does the algorithm change affect creator content reach?
 *
 * =====================================================================================
 * HOW TO RUN THIS DUNGEON
 * =====================================================================================
 *
 * From the dm4 root directory:
 *
 *   npm start
 *
 * Or programmatically:
 *
 *   import generate from './index.js';
 *   import config from './dungeons/harness-social.js';
 *   const results = await generate(config);
 *
 * =====================================================================================
 */
