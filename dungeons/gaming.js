
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "my-seed";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 12_000;
const days = 180;

/** @typedef  {import("../types.js").Dungeon} Config */

/** @type {Config} */
const config = {
	token: "",
	seed: "i am gamer face",
	numDays: days,
	numEvents: num_users * 90,
	numUsers: num_users,
	hasAnonIds: false,
	hasSessionIds: false,
	format: "json",
	alsoInferFunnels: true,
	hasLocation: true,
	hasAndroidDevices: false,
	hasIOSDevices: false,
	hasDesktopDevices: false,
	hasBrowser: false,
	hasCampaigns: false,
	isAnonymous: false,
	hasAdSpend: false,
	percentUsersBornInDataset: 25,

	hasAvatar: true,

	batchSize: 2_500_000,
	concurrency: 1,
	writeToDisk: false,
	funnels: [
		{
			"sequence": ["app install", "character creation", "join party"],
			"isFirstFunnel": true,
			"conversionRate": 0.8,
			"timeToConvert": .25,
		},
		{
			"sequence": ["start quest", "gameplay summary", "complete quest"],
			conversionRate: 0.99,
			timeToConvert: 1,
			props: {
				"quest type": [
					"Rescue",
					"Retrieve",
					"Explore",
					"Destroy",
					"Investigate",
				],
				"quest difficulty": [
					"Easy",
					"Medium",
					"Hard",
					"Legendary",
				],
				"quest location": [
					"Forest",
					"Dungeon",
					"Mountain",
					"City",
					"Desert",
				]
			}
		},
	],
	events: [
		{ event: "app install", weight: 10, isFirstEvent: true },
		{
			event: "character creation",
			weight: 2,
			properties: {
				mode: ["fast", "slow", "template"],
			},
		},
		{
			event: "join party",
			weight: 8,
			properties: {
				"party size": u.weighNumRange(1, 6),
				"party leader": [
					"Bard",
					"Cleric",
					"Fighter",
					"Rogue",
					"Wizard",
					"Paladin",
					"Ranger",
					"Sorcerer",
					"Warlock",
				],
			},
		},
		{
			event: "start quest",
			weight: 12,
			properties: {
				"quest type": [
					"Rescue",
					"Retrieve",
					"Explore",
					"Destroy",
					"Investigate",
				],
				"quest difficulty": [
					"Easy",
					"Medium",
					"Hard",
					"Legendary",
				],
				"quest location": [
					"Forest",
					"Dungeon",
					"Mountain",
					"City",
					"Desert",
				],
				"party size": u.weighNumRange(1, 6),
				"used hint": u.pickAWinner(["yes", "no"], 0.3),
				"used boost": u.pickAWinner(["yes", "no"], 0.2),
				"level at start": u.weighNumRange(1, 20),
			},
		},
		{
			event: "complete quest",
			weight: 12,
			properties: {
				"completion time (mins)": u.weighNumRange(5, 120, 1, 30),
				"quest reward (gold)": u.weighNumRange(10, 500, 1, 100),
				"quest success": u.pickAWinner(["yes", "no"], 0.9),
				"used hint": u.pickAWinner(["yes", "no"], 0.3),
				"used boost": u.pickAWinner(["yes", "no"], 0.2),
				"number of deaths": u.weighNumRange(0, 5, 1, 2),
				"level at start": u.weighNumRange(1, 20),
				"level at end": u.weighNumRange(1, 20),
			},
		},
		{
			"event": "gameplay summary",
			"weight": 14,
			"properties": {
				"# enemies defeated": u.weighNumRange(0, 100),
				"# respawns": u.weighNumRange(0, 10, 5),
				"# attacks": u.weighNumRange(0, 100, 6, 12),
				"# gold found": u.weighNumRange(0, 1000),
			}
		},
		{
			"event": "in-game purchase",
			"weight": 2,
			"properties": {
				"purchase type": [
					"Gold",
					"Gems",
					"Items: Weapons",
					"Items: Armor",
					"Items: Potions",
					"Items: Scrolls",
					"Boosts",
					"Currency",
				],
				"purchase amount": u.weighNumRange(1, 50, 1, 20),
			}
		},
		{
			event: "fight boss",
			weight: 3,
			properties: {
				"boss type": [
					"Dragon",
					"Demon",
					"Lich",
					"Vampire",
					"Beholder",
				],
				"boss level": u.weighNumRange(10, 20),
				"boss difficulty": [
					"Hard",
					"Legendary",
					"Impossible",
				],
				"fight duration (mins)": u.weighNumRange(1, 60),
				
			},
		},
		{
			event: "level up",
			weight: 1,
			properties: {
				"new abilities": [
					"Attack",
					"Spell",
					"Feat",
					"Skill",
				],
			},
		},
		{
			event: "attack",
			weight: 5,
			properties: {
				generic_prop: ["foo", "bar", "baz", "qux"],
			}
		},
		{
			event: "defend",
			weight: 3,
			properties: {
				generic_prop: ["foo", "bar", "baz", "qux"],
			}
		},
	],
	superProps: {
		platform: [
			"Mobile",
			"Xbox",
			"Playstation",
			"Switch",
			"Web"
		],
		"game mode": u.pickAWinner([
			"Single Player",
			"Multiplayer",
		], 1),
		language: [
			"English",
			"Spanish",
			"French",
			"German",
			"Japanese",
			"Korean",
			"Chinese",
		],

	},
	scdProps: {
		// "subscription MRR" : {
		// 	"frequency": "week",
		// 	"type": "number",
		// 	values: u.weighNumRange(0, 250, 1, 200),
		// 	timing: "fixed",
		// 	max: 250,			
		// }
	},
	userProps: {
		experiment: [
			"fast leveling",
			"tension economy",
			"free trial",
		],
		variant: ["A", "B", "C", "Control"],

		race: [
			"Human",
			"Elf",
			"Dwarf",
			"Halfling",
			"Dragonborn",
			"Gnome",
			"Half-Elf",
			"Half-Orc",
			"Tiefling",
		],
		class: [
			"Barbarian",
			"Bard",
			"Cleric",
			"Druid",
			"Fighter",
			"Monk",
			"Paladin",
			"Ranger",
			"Rogue",
			"Sorcerer",
			"Warlock",
			"Wizard",
		],
		alignment: [
			"Lawful Good",
			"Neutral Good",
			"Chaotic Good",
			"Lawful Neutral",
			"True Neutral",
			"Chaotic Neutral",
			"Lawful Evil",
			"Neutral Evil",
			"Chaotic Evil",
		],
		level: u.weighNumRange(1, 20),
		background: [
			"Acolyte",
			"Charlatan",
			"Criminal",
			"Entertainer",
			"Folk Hero",
			"Guild Artisan",
			"Hermit",
			"Noble",
			"Outlander",
			"Sage",
			"Sailor",
			"Soldier",
			"Urchin",
		],
		"subscription MRR": u.weighNumRange(0, 250, 1, 200)
	},
	/**
	 * ARCHITECTED ANALYTICS HOOKS
	 *
	 * This hook function creates 3 deliberate patterns in the data:
	 *
	 * 1. GOLD SCALING: Higher-level players earn more gold (multiplicative scaling)
	 * 2. WHALE PURCHASES: ~33% of users are whales with 1.8x purchase amounts
	 * 3. ALIGNMENT ARCHETYPE: User profiles enriched with hero/villain/neutral archetype
	 *
	 * ───────────────────────────────────────────────────────────────────────────────
	 * 1. GOLD SCALING BY LEVEL (event hook)
	 * ───────────────────────────────────────────────────────────────────────────────
	 *
	 * PATTERN: On "complete quest" events, the quest reward (gold) is multiplied by
	 * (1 + level * 0.1), so a level-10 player earns 2x gold and a level-20 player
	 * earns 3x gold compared to level-1.
	 *
	 * HOW TO FIND IT IN MIXPANEL:
	 *
	 *   Report 1: Gold Reward by Level
	 *   • Report type: Insights
	 *   • Event: "complete quest"
	 *   • Measure: Average of "quest reward (gold)"
	 *   • Breakdown: "level at end"
	 *   • Expected: Linear increase — level 1 ≈ 55 gold, level 10 ≈ 110 gold,
	 *     level 20 ≈ 165 gold. Clear positive correlation between level and reward.
	 *
	 * ───────────────────────────────────────────────────────────────────────────────
	 * 2. WHALE PURCHASES (event hook)
	 * ───────────────────────────────────────────────────────────────────────────────
	 *
	 * PATTERN: ~33% of users (determined by first character of user_id hash) are
	 * "whales" who spend 1.8x on in-game purchases and are tagged is_whale: true.
	 *
	 * HOW TO FIND IT IN MIXPANEL:
	 *
	 *   Report 1: Whale vs Normal Purchase Amounts
	 *   • Report type: Insights
	 *   • Event: "in-game purchase"
	 *   • Measure: Average of "purchase amount"
	 *   • Breakdown: "is_whale"
	 *   • Expected: is_whale=true shows ~1.8x higher avg purchase amount than
	 *     is_whale=false (e.g., ~18 vs ~10)
	 *
	 *   Report 2: Revenue Concentration
	 *   • Report type: Insights
	 *   • Event: "in-game purchase"
	 *   • Measure: Sum of "purchase amount"
	 *   • Breakdown: "is_whale"
	 *   • Expected: ~33% of users (whales) contribute disproportionate total revenue
	 *
	 * ───────────────────────────────────────────────────────────────────────────────
	 * 3. ALIGNMENT ARCHETYPE (user hook)
	 * ───────────────────────────────────────────────────────────────────────────────
	 *
	 * PATTERN: User profiles are enriched with an "archetype" property based on
	 * alignment. Evil alignments → "villain", Good alignments → "hero", others → "neutral".
	 *
	 * HOW TO FIND IT IN MIXPANEL:
	 *
	 *   Report 1: Archetype Distribution
	 *   • Report type: Insights
	 *   • Event: Any event (e.g., "complete quest")
	 *   • Measure: Total unique users
	 *   • Breakdown: User profile "archetype"
	 *   • Expected: Three segments — "hero" (~22%), "villain" (~22%), "neutral" (~56%)
	 *     matching the 2/9, 2/9, 5/9 alignment split
	 *
	 *   Report 2: Archetype Behavior Comparison
	 *   • Report type: Insights
	 *   • Event: "fight boss"
	 *   • Measure: Total events per user
	 *   • Breakdown: User profile "archetype"
	 *   • Expected: All three archetypes should show similar event volumes
	 *     (archetype doesn't affect gameplay — just a profiling hook)
	 */
	hook: function (record, type, meta) {

		if (type === "event") {
			// Pattern 1: Higher-level players earn more gold and defeat more enemies
			if (record.event === "complete quest") {
				const level = record["level at end"] || 1;
				record["quest reward (gold)"] = Math.round((record["quest reward (gold)"] || 50) * (1 + level * 0.1));
			}

			// Pattern 2: In-game purchases are bigger for "free trial" experiment users
			if (record.event === "in-game purchase") {
				// We don't have profile here, so use a hash-based approach
				const uid = record.user_id || record.distinct_id || "";
				if (uid.charCodeAt(0) % 3 === 0) {
					record["purchase amount"] = Math.round((record["purchase amount"] || 10) * 1.8);
					record.is_whale = true;
				}
			}
		}

		if (type === "user") {
			// Pattern 3: Chaotic Evil players get a "villain" tag; Lawful Good get "hero"
			if (record.alignment === "Chaotic Evil" || record.alignment === "Neutral Evil") {
				record.archetype = "villain";
			} else if (record.alignment === "Lawful Good" || record.alignment === "Neutral Good") {
				record.archetype = "hero";
			} else {
				record.archetype = "neutral";
			}
		}

		if (type === "funnel-post") {

		}

		if (type === "funnel-pre") {

		}

		if (type === "scd") {

		}

		if (type === "everything") {

		}

		return record;
	}
};

export default config;
