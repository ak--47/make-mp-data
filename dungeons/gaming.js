
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "my-seed";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 1_000;
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
	percentUsersBornInDataset: 35,

	hasAvatar: true,
	makeChart: false,

	batchSize: 1_500_000,
	concurrency: 1,
	writeToDisk: true,
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
				"quest type": u.pickAWinner([
					"Rescue",
					"Retrieve",
					"Explore",
					"Destroy",
					"Investigate",
				]),
				"quest difficulty": u.pickAWinner([
					"Easy",
					"Medium",
					"Hard",
					"Legendary",
				]),
				"quest location": u.pickAWinner([
					"Forest",
					"Dungeon",
					"Mountain",
					"City",
					"Desert",
				])
			}
		},
	],
	events: [
		{ event: "app install", weight: 10, isFirstEvent: true },
		{
			event: "character creation",
			weight: 2,
			properties: {
				mode: u.pickAWinner(["fast", "slow", "template"]),
			},
		},
		{
			event: "join party",
			weight: 8,
			properties: {
				"party size": u.weighNumRange(1, 6),
				"party leader": u.pickAWinner([
					"Bard",
					"Cleric",
					"Fighter",
					"Rogue",
					"Wizard",
					"Paladin",
					"Ranger",
					"Sorcerer",
					"Warlock",
				]),
			},
		},
		{
			event: "start quest",
			weight: 12,
			properties: {
				"quest type": u.pickAWinner([
					"Rescue",
					"Retrieve",
					"Explore",
					"Destroy",
					"Investigate",
				]),
				"quest difficulty": u.pickAWinner([
					"Easy",
					"Medium",
					"Hard",
					"Legendary",
				]),
				"quest location": u.pickAWinner([
					"Forest",
					"Dungeon",
					"Mountain",
					"City",
					"Desert",
				]),
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
				"purchase type": u.pickAWinner([
					"Gold",
					"Gems",
					"Items: Weapons",
					"Items: Armor",
					"Items: Potions",
					"Items: Scrolls",
					"Boosts",
					"Currency",
				]),
				"purchase amount": u.weighNumRange(1, 50, 1, 20),
			}
		},
		{
			event: "fight boss",
			weight: 3,
			properties: {
				"boss type": u.pickAWinner([
					"Dragon",
					"Demon",
					"Lich",
					"Vampire",
					"Beholder",
				]),
				"boss level": u.weighNumRange(10, 20),
				"boss difficulty": u.pickAWinner([
					"Hard",
					"Legendary",
					"Impossible",
				]),
				"fight duration (mins)": u.weighNumRange(1, 60),
				
			},
		},
		{
			event: "level up",
			weight: 1,
			properties: {
				"new abilities": u.pickAWinner([
					"Attack",
					"Spell",
					"Feat",
					"Skill",
				]),
			},
		},
		{
			event: "attack",
			weight: 5,
			properties: {
				generic_prop: u.pickAWinner(["foo", "bar", "baz", "qux"]),
			}
		},
		{
			event: "defend",
			weight: 3,
			properties: {
				generic_prop: u.pickAWinner(["foo", "bar", "baz", "qux"]),
			}
		},
	],
	superProps: {
		platform: u.pickAWinner([
			"Mobile",
			"Xbox",
			"Playstation",
			"Switch",
			"Web"
		]),
		"game mode": u.pickAWinner([
			"Single Player",
			"Multiplayer",
		], 1),
		language: u.pickAWinner([
			"English",
			"Spanish",
			"French",
			"German",
			"Japanese",
			"Korean",
			"Chinese",
		], 0),

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
		experiment: u.pickAWinner([
			"fast leveling",
			"tension economy",
			"free trial",
		]),
		variant: ["A", "B", "C", "Control"],

		race: u.pickAWinner([
			"Human",
			"Elf",
			"Dwarf",
			"Halfling",
			"Dragonborn",
			"Gnome",
			"Half-Elf",
			"Half-Orc",
			"Tiefling",
		]),
		class: u.pickAWinner([
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
		]),
		alignment: u.pickAWinner([
			"Lawful Good",
			"Neutral Good",
			"Chaotic Good",
			"Lawful Neutral",
			"True Neutral",
			"Chaotic Neutral",
			"Lawful Evil",
			"Neutral Evil",
			"Chaotic Evil",
		]),
		level: u.weighNumRange(1, 20),
		background: u.pickAWinner([
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
		]),
		"subscription MRR": u.weighNumRange(0, 250, 1, 200)
	},
	hook: function (record, type, meta) {
		// const NOW = dayjs();

		if (type === "event") {
			// const EVENT_TIME = dayjs(record.time);
		}

		if (type === "user") {

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
