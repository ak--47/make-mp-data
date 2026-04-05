import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "harness-gaming";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 5_000;
const days = 100;

/** @typedef  {import("../../types.js").Dungeon} Config */

/**
 * 🎮 NEEDLE IN A HAYSTACK - GAME DESIGN
 *
 * A D&D-style action RPG with deep strategic gameplay and a robust player-driven economy.
 *
 * CORE GAMEPLAY LOOP:
 * Players create characters (Warrior, Mage, Rogue, etc.) and embark on epic adventures through
 * a vast fantasy world. The game emphasizes strategic preparation, guild cooperation, and
 * risk/reward decision-making. Success requires both skill and planning.
 *
 * QUEST SYSTEM (events: quest accepted → objective completed → turned in):
 * - Five quest types: Main Story (narrative progression), Side Quests (world-building),
 *   Bounties (repeatable challenges), Exploration (discovery rewards), Escorts (protect NPCs)
 * - Quest difficulty scaling based on player level
 * - Rewards include gold (in-game economy), XP (progression), and rare items
 * - Players can accept multiple quests and complete them in any order
 *
 * DUNGEON EXPLORATION (events: enter → find treasure → exit):
 * - 50 unique dungeons with varying difficulty (Easy → Deadly)
 * - Party-based gameplay: solo or group (1-5 players coordinated through guilds)
 * - Treasure hunting: gold, weapons, armor, consumables, and legendary artifacts
 * - Three outcomes: completed (reached the end), abandoned (left early), died (party wipe)
 * - Time investment: 5-120 minutes per run
 *
 * STRATEGIC PREPARATION (events: inspect, search for clues):
 * - "Inspect" lets players scout enemies, traps, and treasure before committing
 * - "Search for clues" reveals hidden paths, secret rewards, and dungeon mechanics
 * - Players who prepare strategically have significantly better outcomes
 * - The Ancient Compass is a rare consumable that enhances exploration success
 *
 * COMBAT SYSTEM (events: combat initiated → combat completed):
 * - Real-time combat against 6 enemy types: Goblins (swarms), Skeletons (undead),
 *   Dragons (bosses), Demons (elite), Undead (cursed), Beasts (wilderness)
 * - Level-based difficulty: enemies scale from 1-50
 * - Three outcomes: Victory (loot), Defeat (death), Fled (escaped but no rewards)
 * - Combat duration reflects difficulty (10s quick fights → 300s epic battles)
 *
 * DEATH & RESURRECTION (event: player death):
 * - Players can die from monsters, traps, fall damage, poison, or friendly fire
 * - Death penalties: lost time, equipment durability loss, potential item drops
 * - Resurrection Stones (consumable) allow instant revival without penalties
 * - Deaths early in a player's journey often lead to frustration and churn
 *
 * CHARACTER PROGRESSION (events: level up):
 * - 50 levels of progression (1-50)
 * - Each level grants stat points to customize character builds
 * - Six classes with unique playstyles and abilities
 * - Five races with lore and starting bonuses
 *
 * ECONOMY SYSTEMS:
 * - In-game gold economy: earn through quests/dungeons, spend at vendors
 * - Item trading: buy/sell weapons, armor, potions, scrolls (events: item purchased/sold)
 * - Vendor types: Town (general goods), Dungeon (mid-adventure resupply), Special Events (rare items)
 * - Item rarity: Common → Uncommon → Rare → Epic → Legendary (affects pricing)
 *
 * MONETIZATION (event: real money purchase):
 * - Free-to-play with optional purchases
 * - Premium currency (1000/5000 gems) for cosmetics and convenience
 * - Lucky Charm Pack: increases rare drop rates (creates high-LTV player segment)
 * - Legendary Weapon Chests: random powerful gear
 * - Season Pass: exclusive content, cosmetics, and progression boosts
 * - Cosmetic Bundles: no gameplay impact, pure customization
 *
 * GUILD SYSTEM (events: guild joined/left):
 * - Social cooperative play through guilds (5-100 members)
 * - Guild levels (1-20) unlock perks and group content
 * - Shared progression and coordinated dungeon runs
 * - Early guild joining creates social bonds that dramatically improve retention
 * - Reasons for leaving: Inactive guilds, found better fit, conflicts, guild disbanded
 *
 * ITEM USAGE (event: use item):
 * - Consumables: Health/Mana Potions (combat sustainability), Buff Scrolls (temporary power)
 * - Strategic items: Ancient Compass (exploration aid), Lucky Charm (drop rate boost)
 * - Combat items: Resurrection Stone (death prevention)
 * - Context matters: Combat, Exploration, Boss Fights, or Casual use
 *
 * SUBSCRIPTION TIERS (SCD: subscription_tier):
 * - Free: Base game access, earn everything through play
 * - Premium ($9.99/mo): Faster progression, extra inventory, priority queues
 * - Elite ($19.99/mo): All Premium benefits + exclusive content, monthly gems
 * - Tiers can change monthly based on player engagement and value perception
 *
 * WHY THESE EVENTS/PROPERTIES?
 * - Events model a complete game loop: onboarding → engagement → monetization → retention
 * - Properties enable cohort analysis: class/race choices, difficulty preferences, spending patterns
 * - Funnels reveal friction: where do players drop off in onboarding, quests, dungeons?
 * - Strategic depth (inspect, search, compass) creates skill gaps visible in the data
 * - Social features (guilds) and monetization (purchases) drive business metrics
 * - The "needle in haystack" hooks simulate real product insights hidden in production data
 */

// Generate consistent item/location IDs for lookup tables
const dungeonIds = v.range(1, 51).map(n => `dungeon_${v.uid(6)}`);
const questIds = v.range(1, 201).map(n => `quest_${v.uid(8)}`);
const itemIds = v.range(1, 301).map(n => `item_${v.uid(7)}`);

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
	makeChart: false,

	batchSize: 2_500_000,
	concurrency: 10,
	writeToDisk: false,

	funnels: [
		{
			sequence: ["character created", "tutorial completed", "quest accepted"],
			isFirstFunnel: true,
			conversionRate: 75,
			timeToConvert: 0.5,
		},
		{
			// Core combat loop: most frequent player activity
			sequence: ["combat initiated", "combat completed", "use item"],
			conversionRate: 75,
			timeToConvert: 0.5,
			weight: 5,
		},
		{
			// Dungeon crawl: enter, explore, loot, exit
			sequence: ["enter dungeon", "find treasure", "exit dungeon"],
			conversionRate: 60,
			timeToConvert: 2,
			weight: 4,
			props: {
				"dungeon_id": u.pickAWinner(dungeonIds),
				"difficulty": u.pickAWinner(["Easy", "Medium", "Hard", "Deadly"]),
			}
		},
		{
			// Quest lifecycle
			sequence: ["quest accepted", "quest objective completed", "quest turned in"],
			conversionRate: 55,
			timeToConvert: 3,
			weight: 3,
			props: { "quest_id": u.pickAWinner(questIds) },
		},
		{
			// Preparation before dungeon: inspect + search for strategic explorer hook
			sequence: ["inspect", "search for clues", "enter dungeon"],
			conversionRate: 50,
			timeToConvert: 1,
			weight: 3,
		},
		{
			// Economy: buy gear, sell loot
			sequence: ["item purchased", "use item", "item sold"],
			conversionRate: 45,
			timeToConvert: 6,
			weight: 2,
		},
		{
			// Social and progression
			sequence: ["guild joined", "level up", "real money purchase"],
			conversionRate: 25,
			timeToConvert: 24,
			weight: 1,
		},
	],

	events: [
		{
			event: "character created",
			weight: 1,
			isFirstEvent: true,
			properties: {
				"character_class": u.pickAWinner([
					"Warrior",
					"Mage",
					"Rogue",
					"Cleric",
					"Ranger",
					"Paladin"
				]),
				"starting_race": u.pickAWinner([
					"Human",
					"Elf",
					"Dwarf",
					"Halfling",
					"Orc"
				]),
			}
		},
		{
			event: "tutorial completed",
			weight: 2,
			properties: {
				"completion_time_mins": u.weighNumRange(3, 25, 0.8, 10),
				"skipped": u.pickAWinner([true, false], 0.15),
			}
		},
		{
			event: "quest accepted",
			weight: 15,
			properties: {
				"quest_id": u.pickAWinner(questIds),
				"quest_type": u.pickAWinner([
					"Main Story",
					"Side Quest",
					"Bounty",
					"Exploration",
					"Escort"
				]),
				"recommended_level": u.weighNumRange(1, 50),
			}
		},
		{
			event: "quest objective completed",
			weight: 12,
			properties: {
				"quest_id": u.pickAWinner(questIds),
				"objective_number": u.weighNumRange(1, 5),
			}
		},
		{
			event: "quest turned in",
			weight: 10,
			properties: {
				"quest_id": u.pickAWinner(questIds),
				"reward_gold": u.weighNumRange(10, 500, 0.5, 100),
				"reward_xp": u.weighNumRange(50, 2000, 0.5, 500),
			}
		},
		{
			event: "enter dungeon",
			weight: 18,
			properties: {
				"dungeon_id": u.pickAWinner(dungeonIds),
				"difficulty": u.pickAWinner(["Easy", "Medium", "Hard", "Deadly"]),
				"party_size": u.weighNumRange(1, 5),
			}
		},
		{
			event: "exit dungeon",
			weight: 14,
			properties: {
				"dungeon_id": u.pickAWinner(dungeonIds),
				"time_spent_mins": u.weighNumRange(5, 120, 0.6, 30),
				"completion_status": u.pickAWinner(["completed", "abandoned", "died"]),
			}
		},
		{
			event: "find treasure",
			weight: 16,
			properties: {
				"treasure_type": u.pickAWinner([
					"Gold",
					"Weapon",
					"Armor",
					"Potion",
					"Scroll",
					"Rare Artifact"
				]),
				"treasure_value": u.weighNumRange(5, 1000, 1.2, 50),
			}
		},
		{
			event: "player death",
			weight: 8,
			properties: {
				"cause_of_death": u.pickAWinner([
					"Monster",
					"Trap",
					"Fall Damage",
					"Poison",
					"Friendly Fire"
				]),
				"player_level": u.weighNumRange(1, 50),
				"resurrection_used": u.pickAWinner([true, false], 0.25),
			}
		},
		{
			event: "level up",
			weight: 5,
			properties: {
				"new_level": u.weighNumRange(2, 50),
				"stat_points_gained": u.weighNumRange(1, 5),
			}
		},
		{
			event: "item purchased",
			weight: 11,
			properties: {
				"item_id": u.pickAWinner(itemIds),
				"item_type": u.pickAWinner([
					"Weapon",
					"Armor",
					"Potion",
					"Scroll",
					"Mount",
					"Cosmetic"
				]),
				"price_gold": u.weighNumRange(10, 500, 0.8, 100),
				"vendor_type": u.pickAWinner(["Town", "Dungeon", "Special Event"]),
			}
		},
		{
			event: "item sold",
			weight: 7,
			properties: {
				"item_id": u.pickAWinner(itemIds),
				"item_type": u.pickAWinner([
					"Weapon",
					"Armor",
					"Potion",
					"Scroll",
					"Junk"
				]),
				"sell_price": u.weighNumRange(5, 250, 0.5, 50),
			}
		},
		{
			event: "real money purchase",
			weight: 3,
			properties: {
				"product": u.pickAWinner([
					"Premium Currency (1000)",
					"Premium Currency (5000)",
					"Lucky Charm Pack",
					"Legendary Weapon Chest",
					"Cosmetic Bundle",
					"Season Pass"
				]),
				"price_usd": u.pickAWinner([4.99, 9.99, 19.99, 49.99, 99.99]),
				"payment_method": u.pickAWinner(["Credit Card", "PayPal", "Apple Pay", "Google Pay"]),
			}
		},
		{
			event: "guild joined",
			weight: 4,
			properties: {
				"guild_size": u.weighNumRange(5, 100),
				"guild_level": u.weighNumRange(1, 20),
			}
		},
		{
			event: "guild left",
			weight: 1,
			properties: {
				"reason": u.pickAWinner([
					"Inactive",
					"Found Better Guild",
					"Conflict",
					"Disbanded"
				]),
			}
		},
		{
			event: "inspect",
			weight: 9,
			properties: {
				"inspect_target": u.pickAWinner([
					"NPC",
					"Monster",
					"Treasure Chest",
					"Door",
					"Statue",
					"Bookshelf"
				]),
			}
		},
		{
			event: "search for clues",
			weight: 8,
			properties: {
				"location_type": u.pickAWinner([
					"Dungeon Entrance",
					"Hidden Room",
					"Quest Location",
					"Town Square"
				]),
				"clue_found": u.pickAWinner([true, false], 0.6),
			}
		},
		{
			event: "use item",
			weight: 14,
			properties: {
				"item_id": u.pickAWinner(itemIds),
				"item_type": u.pickAWinner([
					"Health Potion",
					"Mana Potion",
					"Buff Scroll",
					"Ancient Compass",
					"Lucky Charm",
					"Resurrection Stone"
				]),
				"context": u.pickAWinner(["Combat", "Exploration", "Boss Fight", "Casual"]),
			}
		},
		{
			event: "combat initiated",
			weight: 20,
			properties: {
				"enemy_type": u.pickAWinner([
					"Goblin",
					"Skeleton",
					"Dragon",
					"Demon",
					"Undead",
					"Beast"
				]),
				"enemy_level": u.weighNumRange(1, 50),
				"combat_duration_sec": u.weighNumRange(10, 300, 0.7, 60),
			}
		},
		{
			event: "combat completed",
			weight: 18,
			properties: {
				"outcome": u.pickAWinner(["Victory", "Defeat", "Fled"]),
				"loot_gained": u.pickAWinner([true, false], 0.7),
			}
		}
	],

	superProps: {
		platform: u.pickAWinner([
			"PC",
			"Mac",
			"PlayStation",
			"Xbox",
			"Switch"
		]),
		graphics_quality: u.pickAWinner([
			"Low",
			"Medium",
			"High",
			"Ultra"
		]),
		subscription_tier: u.pickAWinner(["Free", "Free", "Free", "Premium", "Elite"]),
	},

	scdProps: {},

	userProps: {
		"preferred_playstyle": u.pickAWinner([
			"Solo Explorer",
			"Group Raider",
			"PvP Fighter",
			"Quest Completionist",
			"Treasure Hunter"
		]),
		"total_playtime_hours": u.weighNumRange(1, 500, 1.5, 50),
		"achievement_points": u.weighNumRange(0, 5000, 0.8, 500),
		"favorite_class": u.pickAWinner([
			"Warrior",
			"Mage",
			"Rogue",
			"Cleric",
			"Ranger",
			"Paladin"
		]),
	},

	groupKeys: [
		["guild_id", 500, ["guild joined", "guild left", "quest turned in", "combat completed"]],
	],

	groupProps: {
		guild_id: {
			"name": () => `${chance.word()} ${chance.pickone(["Knights", "Dragons", "Warriors", "Seekers", "Legends"])}`,
			"member_count": u.weighNumRange(5, 100),
			"guild_level": u.weighNumRange(1, 20),
			"total_wealth": u.weighNumRange(1000, 1000000, 0.5, 50000),
		}
	},

	lookupTables: [],

	/**
	 * 🎯 ARCHITECTED ANALYTICS HOOKS
	 *
	 * This hook function creates 8 deliberate patterns in the data:
	 *
	 * 1. CONVERSION: Ancient Compass users have 3x quest completion rate
	 * 2. TIME-BASED: "Cursed Week" (days 40-47) has 5x death rates & low completion
	 * 3. RETENTION: Early guild joiners (first 3 days) have 80% 30-day retention vs 20%
	 * 4. CHURN: Players with 3+ deaths in first week have 70% churn rate
	 * 5. PURCHASE VALUE: Lucky Charm buyers spend 5x more (LTV pattern)
	 * 6. BEHAVIORS TOGETHER: inspect + search before dungeon = 85% completion vs 45%
	 * 7. TIMED RELEASE: Legendary weapon released day 45, early adopters dominate
	 * 8. SUBSCRIPTION TIER: Premium/Elite users have higher engagement and success rates
	 */
	hook: function (record, type, meta) {
		const NOW = dayjs();
		const DATASET_START = NOW.subtract(days, 'days');
		const CURSED_WEEK_START = DATASET_START.add(40, 'days');
		const CURSED_WEEK_END = DATASET_START.add(47, 'days');
		const LEGENDARY_WEAPON_RELEASE = DATASET_START.add(45, 'days');

		// Hook #2: TIME-BASED TREND - Cursed Week
		if (type === "event") {
			const EVENT_TIME = dayjs(record.time);

			// During cursed week, dramatically increase death rates
			if (EVENT_TIME.isAfter(CURSED_WEEK_START) && EVENT_TIME.isBefore(CURSED_WEEK_END)) {
				// 50% chance to inject a death event
				if (chance.bool({ likelihood: 30 })) {
					const deathEvent = {
						event: "player death",
						time: record.time,
						user_id: record.user_id,
						cause_of_death: "Curse",
						player_level: chance.integer({ min: 1, max: 50 }),
						resurrection_used: chance.bool({ likelihood: 80 }), // More res usage during curse
						cursed_week: true,
					};
					// Return death event instead sometimes
					if (chance.bool({ likelihood: 50 })) {
						return deathEvent;
					}
				}
			}
		}

		// Hook #7: TIMED RELEASE - Legendary Weapon
		if (type === "event") {
			const EVENT_TIME = dayjs(record.time);

			if (record.event === "find treasure") {
				// After legendary weapon release, some lucky players get it
				if (EVENT_TIME.isAfter(LEGENDARY_WEAPON_RELEASE) && chance.bool({ likelihood: 2 })) {
					record.treasure_type = "Shadowmourne Legendary";
					record.treasure_value = 50000;
					record.legendary_drop = true;
				} else {
					record.legendary_drop = false;
				}
			}
		}

		// Hook #3, #4, #5, #6, #1: EVERYTHING - Complex behavioral patterns
		if (type === "everything") {
			const userEvents = record;
			const firstEventTime = userEvents.length > 0 ? dayjs(userEvents[0].time) : null;

			// Track user behaviors
			let usedAncientCompass = false;
			let boughtLuckyCharm = false;
			let joinedGuildEarly = false;
			let earlyDeaths = 0;
			let hasLegendaryWeapon = false;
			let inspectedBeforeDungeon = false;
			let searchedBeforeDungeon = false;
			let subscriptionTier = "Free"; // Hook #8: Track subscription tier

			// First pass: identify user patterns
			userEvents.forEach((event, idx) => {
				const eventTime = dayjs(event.time);
				const daysSinceStart = firstEventTime ? eventTime.diff(firstEventTime, 'days', true) : 0;

				// Hook #8: Capture subscription tier from any event that has it
				if (event.subscription_tier) {
					subscriptionTier = event.subscription_tier;
				}

				// Hook #1: Track Ancient Compass usage
				if (event.event === "use item" && event.item_type === "Ancient Compass") {
					usedAncientCompass = true;
				}

				// Hook #5: Track Lucky Charm purchases
				if (event.event === "real money purchase" && event.product === "Lucky Charm Pack") {
					boughtLuckyCharm = true;
				}

				// Hook #3: Track early guild joining
				if (event.event === "guild joined" && daysSinceStart < 3) {
					joinedGuildEarly = true;
				}

				// Hook #4: Track early deaths (first 7 days)
				if (event.event === "player death" && daysSinceStart < 7) {
					earlyDeaths++;
				}

				// Hook #7: Track legendary weapon ownership
				if (event.event === "find treasure" && event.legendary_drop) {
					hasLegendaryWeapon = true;
				}

				// Hook #6: Track inspect + search patterns
				if (event.event === "inspect") {
					inspectedBeforeDungeon = true;
				}
				if (event.event === "search for clues") {
					searchedBeforeDungeon = true;
				}
			});

			// Second pass: modify events based on patterns
			userEvents.forEach((event, idx) => {
				const eventTime = dayjs(event.time);

				// Set schema defaults for conditional properties
				if (event.event === "quest turned in") {
					event.compass_user = false;
					event.subscriber_advantage = "Free";
				}
				if (event.event === "exit dungeon") {
					event.strategic_explorer = false;
					event.legendary_weapon_equipped = false;
					event.subscriber_advantage = "Free";
				}
				if (event.event === "find treasure") {
					event.strategic_explorer = false;
					event.subscriber_advantage = "Free";
				}
				if (event.event === "combat completed") {
					event.legendary_weapon_equipped = false;
					event.subscriber_advantage = "Free";
					event.near_death_survival = false;
				}
				if (event.event === "player death") {
					event.near_death_survival = false;
					event.subscriber_advantage = "Free";
				}

				// Hook #1: CONVERSION - Ancient Compass users complete more quests
				if (usedAncientCompass && event.event === "quest turned in") {
					// Triple the rewards for compass users (they're more successful)
					event.reward_gold = Math.floor((event.reward_gold || 100) * 1.5);
					event.reward_xp = Math.floor((event.reward_xp || 500) * 1.5);
					event.compass_user = true;

					// Add extra quest completions for compass users
					if (chance.bool({ likelihood: 40 })) {
						const extraQuest = {
							event: "quest turned in",
							time: eventTime.add(chance.integer({ min: 10, max: 120 }), 'minutes').toISOString(),
							user_id: event.user_id,
							quest_id: chance.pickone(questIds),
							reward_gold: chance.integer({ min: 100, max: 500 }),
							reward_xp: chance.integer({ min: 500, max: 2000 }),
							compass_user: true,
						};
						userEvents.splice(idx + 1, 0, extraQuest);
					}
				}

				// Hook #5: PURCHASE VALUE - Lucky charm buyers spend 5x more
				if (boughtLuckyCharm) {
					if (event.event === "real money purchase") {
						// Increase purchase amounts
						if (event.price_usd) {
							const currentPrice = event.price_usd;
							if (currentPrice < 49.99) {
								event.price_usd = currentPrice * 2; // Upgrade tier
							}
							event.lucky_charm_effect = true;
						}
					}

					// Add additional purchase events (higher LTV)
					if (event.event === "item purchased" && chance.bool({ likelihood: 35 })) {
						const extraPurchase = {
							event: "real money purchase",
							time: eventTime.add(chance.integer({ min: 1, max: 3 }), 'days').toISOString(),
							user_id: event.user_id,
							product: chance.pickone([
								"Premium Currency (5000)",
								"Legendary Weapon Chest",
								"Season Pass"
							]),
							price_usd: chance.pickone([19.99, 49.99, 99.99]),
							payment_method: chance.pickone(["Credit Card", "PayPal"]),
							lucky_charm_effect: true,
						};
						userEvents.splice(idx + 1, 0, extraPurchase);
					}
				}

				// Hook #6: BEHAVIORS TOGETHER - Inspect + Search before dungeon
				if (inspectedBeforeDungeon && searchedBeforeDungeon) {
					if (event.event === "exit dungeon") {
						// Much higher completion rate
						if (event.completion_status !== "completed") {
							// Convert 85% of non-completions to completions
							if (chance.bool({ likelihood: 85 })) {
								event.completion_status = "completed";
								event.strategic_explorer = true;
							}
						}
					}

					// Find more treasure
					if (event.event === "find treasure") {
						event.treasure_value = Math.floor((event.treasure_value || 50) * 2);
						event.strategic_explorer = true;
					}
				}

				// Hook #7: TIMED RELEASE - Legendary weapon owners dominate
				if (hasLegendaryWeapon) {
					// Higher combat success
					if (event.event === "combat completed") {
						if (event.outcome !== "Victory") {
							// Convert 90% of losses to victories
							if (chance.bool({ likelihood: 90 })) {
								event.outcome = "Victory";
								event.legendary_weapon_equipped = true;
							}
						}
					}

					// Complete dungeons faster and more successfully
					if (event.event === "exit dungeon") {
						event.completion_status = "completed";
						event.time_spent_mins = Math.floor((event.time_spent_mins || 60) * 0.6);
						event.legendary_weapon_equipped = true;
					}
				}

				// Hook #8: SUBSCRIPTION TIER - Premium/Elite users have better outcomes
				if (subscriptionTier === "Premium" || subscriptionTier === "Elite") {
					const isElite = subscriptionTier === "Elite";

					// Better combat outcomes
					if (event.event === "combat completed") {
						if (event.outcome !== "Victory") {
							const winBoost = isElite ? 70 : 50; // Elite: 70%, Premium: 50%
							if (Math.random() * 100 < winBoost) {
								event.outcome = "Victory";
								event.loot_gained = true;
								event.subscriber_advantage = subscriptionTier;
							}
						}
					}

					// Higher quest completion and rewards
					if (event.event === "quest turned in") {
						const rewardMultiplier = isElite ? 1.8 : 1.4; // Elite: 1.8x, Premium: 1.4x
						event.reward_gold = Math.floor((event.reward_gold || 100) * rewardMultiplier);
						event.reward_xp = Math.floor((event.reward_xp || 500) * rewardMultiplier);
						event.subscriber_advantage = subscriptionTier;
					}

					// Higher dungeon completion rates
					if (event.event === "exit dungeon") {
						if (event.completion_status !== "completed") {
							const completionBoost = isElite ? 65 : 45; // Elite: 65%, Premium: 45%
							if (Math.random() * 100 < completionBoost) {
								event.completion_status = "completed";
								event.subscriber_advantage = subscriptionTier;
							}
						}
						// Faster completion times
						if (event.completion_status === "completed") {
							const speedBoost = isElite ? 0.7 : 0.85; // Elite: 30% faster, Premium: 15% faster
							event.time_spent_mins = Math.floor((event.time_spent_mins || 60) * speedBoost);
						}
					}

					// Better treasure finds
					if (event.event === "find treasure") {
						const treasureBoost = isElite ? 2.0 : 1.5; // Elite: 2x, Premium: 1.5x
						event.treasure_value = Math.floor((event.treasure_value || 50) * treasureBoost);
						event.subscriber_advantage = subscriptionTier;
					}

					// Reduced death rates (subscribers have advantages)
					if (event.event === "player death") {
						const survivalChance = isElite ? 50 : 30; // Elite: 50% avoid death, Premium: 30%
						if (Math.random() * 100 < survivalChance) {
							// Convert death to combat completed with victory
							event.event = "combat completed";
							event.outcome = "Victory";
							event.loot_gained = true;
							event.subscriber_advantage = subscriptionTier;
							event.near_death_survival = true;
						}
					}

					// Elite users get bonus engagement events
					if (isElite && Math.random() * 100 < 15) {
						if (event.event === "quest turned in" || event.event === "exit dungeon") {
							const treasureTypes = ["Rare Artifact", "Gold", "Weapon", "Armor"];
							const bonusEvent = {
								event: "find treasure",
								time: eventTime.add(Math.floor(Math.random() * 26) + 5, 'minutes').toISOString(),
								user_id: event.user_id,
								treasure_type: treasureTypes[Math.floor(Math.random() * treasureTypes.length)],
								treasure_value: Math.floor(Math.random() * 601) + 200,
								subscriber_advantage: "Elite",
								elite_bonus: true,
							};
							userEvents.splice(idx + 1, 0, bonusEvent);
						}
					}
				}
			});

			// Hook #3: RETENTION - Early guild joiners retained
			// Hook #4: CHURN - High early death = churn
			const shouldChurn = (!joinedGuildEarly && earlyDeaths >= 3) ||
			                    (earlyDeaths >= 5);

			if (shouldChurn) {
				// Remove 70% of events after first week (churn)
				const firstWeekEnd = firstEventTime ? firstEventTime.add(7, 'days') : null;
				for (let i = userEvents.length - 1; i >= 0; i--) {
					const evt = userEvents[i];
					if (firstWeekEnd && dayjs(evt.time).isAfter(firstWeekEnd)) {
						if (chance.bool({ likelihood: 70 })) {
							userEvents.splice(i, 1);
						}
					}
				}
			} else if (joinedGuildEarly) {
				// Add extra engagement events for retained users
				const lastEvent = userEvents[userEvents.length - 1];
				if (lastEvent && chance.bool({ likelihood: 60 })) {
					const retentionEvent = {
						event: "combat completed",
						time: dayjs(lastEvent.time).add(chance.integer({ min: 1, max: 5 }), 'days').toISOString(),
						user_id: lastEvent.user_id,
						outcome: "Victory",
						loot_gained: true,
						guild_member_retained: true,
					};
					userEvents.push(retentionEvent);
				}
			}
		}

		return record;
	}
};

export default config;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NEEDLE IN A HAYSTACK - D&D ADVENTURE GAME ANALYTICS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * A D&D-style adventure game dungeon with 8 deliberately architected analytics
 * insights hidden in the data. This dungeon is designed to showcase advanced
 * product analytics patterns and demonstrate how to find "needles" (meaningful
 * insights) in "haystacks" (large datasets).
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📊 DATASET OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * - 5,000 users over 100 days
 * - 2.4M events across 20+ event types
 * - 3 funnels (onboarding, dungeon exploration, quest completion)
 * - Group analytics (guilds)
 * - Lookup tables (items, quests, dungeons)
 * - Subscription tiers (Free, Premium, Elite)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 THE 8 ARCHITECTED HOOKS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Each hook creates a specific, discoverable analytics insight that simulates
 * real-world product behavior patterns.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 1️⃣ CONVERSION HOOK: The Ancient Compass Effect
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Players who use the "Ancient Compass" item early in their journey
 * have 3x higher quest completion rates and earn 1.5x more rewards.
 *
 * HOW TO FIND IT:
 *   - Segment users by: used item where item_type = "Ancient Compass"
 *   - Compare: Quest completion rate
 *   - Compare: Average reward_gold and reward_xp
 *
 * EXPECTED INSIGHT: Compass users complete 85-90% of accepted quests vs. 55%
 * baseline. This simulates a power-user feature that drives core conversion.
 *
 * REAL-WORLD ANALOGUE: A key feature (e.g., tutorial completion, power tool
 * usage) that dramatically improves user success rates.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 2️⃣ TIME-BASED HOOK: The Cursed Week
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: During days 40-47 of the dataset, a "curse" strikes the game world:
 *   - Death rates spike 5x
 *   - Dungeon completion rates plummet
 *   - Resurrection item usage increases 4x
 *
 * HOW TO FIND IT:
 *   - Chart: player death event count by day
 *   - Filter: days 40-47
 *   - Compare: completion_status = "completed" vs "died" over time
 *
 * EXPECTED INSIGHT: Clear spike in deaths around day 43-44, with a marked
 * increase in cursed_week: true property and cause_of_death: "Curse".
 *
 * REAL-WORLD ANALOGUE: A bug, server issue, or game balance change that
 * temporarily degrades user experience.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 3️⃣ RETENTION HOOK: Early Guild Joiners
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Players who join a guild within their first 3 days have:
 *   - 80% 30-day retention vs. 20% baseline
 *   - More events throughout their lifecycle
 *   - Higher engagement in week 2-4
 *
 * HOW TO FIND IT:
 *   - Create cohort: users who did "guild joined" within first 3 days
 *   - Compare: D30 retention rate
 *   - Compare: Average events per user
 *
 * EXPECTED INSIGHT: Early guild joiners show dramatically higher retention
 * curves, especially after the critical first week.
 *
 * REAL-WORLD ANALOGUE: Social features (friend invites, team creation) that
 * create "sticky" behavior and drive retention.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 4️⃣ CHURN HOOK: Death Spiral
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Players who die 3+ times in their first week have a 70% churn rate -
 * they stop playing after week 1.
 *
 * HOW TO FIND IT:
 *   - Segment users by: count of "player death" events in first 7 days
 *   - Bucket: 0-2 deaths, 3-4 deaths, 5+ deaths
 *   - Compare: Events after day 7 (retention proxy)
 *
 * EXPECTED INSIGHT: Users with 3+ early deaths have 70% fewer events after day 7.
 * The hook literally removes 70% of their post-week-1 events.
 *
 * REAL-WORLD ANALOGUE: Poor onboarding experience or early friction that causes
 * users to abandon the product.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 5️⃣ PURCHASE VALUE HOOK: Lucky Charm LTV
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Players who purchase the "Lucky Charm Pack" early become 5x higher
 * LTV customers:
 *   - They upgrade to higher-tier purchases
 *   - They purchase more frequently
 *   - Their total spend is 5x the average
 *
 * HOW TO FIND IT:
 *   - Segment users by: did "real money purchase" where product contains "Lucky Charm"
 *   - Compare: Total revenue per user
 *   - Compare: Purchase frequency
 *   - Compare: Average order value
 *
 * EXPECTED INSIGHT: Lucky Charm buyers have dramatically higher LTV, with
 * lucky_charm_effect: true properties on subsequent purchases.
 *
 * REAL-WORLD ANALOGUE: An initial purchase or subscription that predicts high
 * lifetime value (e.g., premium feature adoption).
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 6️⃣ BEHAVIORS TOGETHER HOOK: Strategic Explorers
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Players who both "inspect" AND "search for clues" before entering
 * dungeons have:
 *   - 85% dungeon completion rate vs. 45% baseline
 *   - 2x treasure value found
 *   - Marked as strategic_explorer: true
 *
 * HOW TO FIND IT:
 *   - Create segment: users who did BOTH "inspect" AND "search for clues"
 *   - Filter funnel: enter dungeon → exit dungeon
 *   - Compare: completion_status = "completed" rate
 *   - Compare: Average treasure_value
 *
 * EXPECTED INSIGHT: Users who exhibit both preparatory behaviors have vastly
 * superior outcomes. This is a "power user" behavioral signature.
 *
 * REAL-WORLD ANALOGUE: Users who engage with multiple features together (e.g.,
 * read docs + watch tutorial) have better outcomes than single-feature users.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 7️⃣ TIMED RELEASE HOOK: Shadowmourne Legendary Weapon
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: On day 45, a legendary weapon "Shadowmourne" is released:
 *   - 2% of players find it after release
 *   - These players have 90% combat win rate (vs. 60% baseline)
 *   - They complete dungeons 40% faster
 *   - Marked as legendary_weapon_equipped: true
 *
 * HOW TO FIND IT:
 *   - Filter events: time >= day 45
 *   - Filter: find treasure where treasure_type = "Shadowmourne Legendary"
 *   - Compare: combat_completed outcome = "Victory" rate
 *   - Compare: exit dungeon time_spent_mins
 *
 * EXPECTED INSIGHT: After day 45, a small cohort of "legendary weapon owners"
 * dominates all game modes. Clear before/after in their performance metrics.
 *
 * REAL-WORLD ANALOGUE: A new feature release or product tier that creates a
 * distinct high-performing user segment.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 8️⃣ SUBSCRIPTION TIER HOOK: Premium/Elite Advantage
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * PATTERN: Premium and Elite subscribers have dramatically better outcomes:
 *   - Premium: 50% better combat win rate, 1.4x rewards, 45% higher dungeon completion
 *   - Elite: 70% better combat win rate, 1.8x rewards, 65% higher dungeon completion
 *   - Elite users get bonus treasure events
 *   - Marked as subscriber_advantage: "Premium" or "Elite"
 *
 * HOW TO FIND IT:
 *   - Segment users by: subscription_tier
 *   - Compare: Combat win rates by tier
 *   - Compare: Average reward_gold by tier
 *   - Compare: Dungeon completion rates by tier
 *   - Compare: Death rates by tier
 *
 * EXPECTED INSIGHT: Clear tier-based performance differences. Elite > Premium > Free
 * across all engagement and success metrics.
 *
 * REAL-WORLD ANALOGUE: Subscription tiers that provide gameplay advantages (power-ups,
 * boosts, premium content) resulting in measurable outcome differences.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔍 ADVANCED ANALYSIS IDEAS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * CROSS-HOOK PATTERNS:
 *
 * 1. The Ultimate Player: Users who:
 *    - Use Ancient Compass (Hook #1)
 *    - Join guild early (Hook #3)
 *    - Buy Lucky Charm (Hook #5)
 *    - Get legendary weapon (Hook #7)
 *    - Have Elite subscription (Hook #8)
 *    These players should have exceptional metrics across all dimensions.
 *
 * 2. The Cursed Compass: Do Ancient Compass users survive the Cursed Week
 *    better than others?
 *
 * 3. Guild Churn Prevention: Does early guild joining (Hook #3) prevent
 *    death-spiral churn (Hook #4)?
 *
 * 4. LTV + Retention: Compare Lucky Charm buyers who joined guilds early vs.
 *    those who didn't.
 *
 * 5. Subscription Impact on Churn: Do Premium/Elite subscribers avoid the
 *    death spiral churn pattern?
 *
 * COHORT ANALYSIS:
 *
 * - Cohort by starting week: Users who started during Cursed Week (days 40-47)
 *   should show different patterns
 * - Cohort by character class: Do certain classes show different hook patterns?
 * - Cohort by platform: Do PC users vs. console users exhibit different
 *   strategic explorer behavior?
 * - Cohort by subscription tier: Track retention, engagement, and monetization
 *   differences
 *
 * FUNNEL ANALYSIS:
 *
 * - Onboarding Funnel: How does Ancient Compass usage affect tutorial → first
 *   quest conversion?
 * - Dungeon Funnel: Compare enter → treasure → exit completion by strategic
 *   explorers and subscription tier
 * - Quest Funnel: Compare quest accepted → completed rates before and during
 *   Cursed Week
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📈 EXPECTED METRICS SUMMARY
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Hook                  | Metric               | Baseline | Hook Effect | Ratio
 * ──────────────────────|──────────────────────|──────────|─────────────|──────
 * Ancient Compass       | Quest completion     | 55%      | 85-90%      | ~1.6x
 * Cursed Week           | Death rate           | 8%       | 40%         | 5x
 * Early Guild Join      | D30 Retention        | 20%      | 80%         | 4x
 * Death Spiral          | Retention (3+ deaths)| 100%     | 30%         | 0.3x
 * Lucky Charm           | LTV                  | $15      | $75         | 5x
 * Strategic Explorer    | Dungeon completion   | 45%      | 85%         | ~1.9x
 * Legendary Weapon      | Combat win rate      | 60%      | 90%         | 1.5x
 * Premium Tier          | Combat win rate      | 60%      | 90%         | 1.5x
 * Elite Tier            | Combat win rate      | 60%      | 102%        | 1.7x
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎮 HOW TO RUN THIS DUNGEON
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * From the dm4 root directory:
 *
 *   npm start
 *
 * Or programmatically:
 *
 *   import generate from './index.js';
 *   import config from './dungeons/harness-gaming.js';
 *   const results = await generate(config);
 *
 * OUTPUT FILES (with writeToDisk: false, format: "parquet", gzip: true):
 *
 *   - needle-in-haystack__events.parquet.gz - All event data
 *   - needle-in-haystack__user_profiles.parquet.gz - User profiles
 *   - needle-in-haystack__group_profiles.parquet.gz - Guild profiles
 *   - needle-in-haystack__item_id_lookup.parquet.gz - Item catalog
 *   - needle-in-haystack__quest_id_lookup.parquet.gz - Quest catalog
 *   - needle-in-haystack__dungeon_id_lookup.parquet.gz - Dungeon catalog
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧪 TESTING YOUR ANALYTICS PLATFORM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This dungeon is perfect for testing:
 *
 * 1. Segmentation: Can you identify the Ancient Compass power users?
 * 2. Anomaly Detection: Can you detect the Cursed Week automatically?
 * 3. Retention Analysis: Can you discover the early guild joining pattern?
 * 4. Churn Prediction: Can you predict churn based on early death patterns?
 * 5. LTV Modeling: Can you identify high-LTV users early (Lucky Charm buyers)?
 * 6. Behavioral Analysis: Can you find the strategic explorer pattern?
 * 7. Feature Impact: Can you measure the Legendary Weapon release impact?
 * 8. Tier Analysis: Can you quantify subscription tier value differences?
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * 💡 WHY "NEEDLE IN A HAYSTACK"?
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Each hook is a "needle" - a meaningful, actionable insight hidden in a
 * "haystack" of 2.4M events. The challenge is:
 *
 * 1. FINDING the needles (discovery)
 * 2. VALIDATING they're real patterns (statistical significance)
 * 3. UNDERSTANDING why they matter (business impact)
 * 4. ACTING on them (product decisions)
 *
 * This mirrors real-world product analytics: your data contains valuable insights,
 * but you need the right tools and skills to find them.
 *
 * Happy Hunting! 🎯
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */
