
const SEED = "my-seed";
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
require("dotenv").config();
const u = require("../components/utils.js");
const v = require("ak-tools");
const chance = u.initChance(SEED);
const num_users = 10_000;
const days = 108;

/** @typedef  {import("../types.js").Dungeon} Config */

/** @type {Config} */
const config = {
	token: "",
	seed: "twerk",
	numDays: days,
	numEvents: num_users * 100,
	numUsers: num_users,
	hasAnonIds: false,
	hasSessionIds: false,
	format: "json",
	alsoInferFunnels: false,
	hasLocation: true,
	hasAndroidDevices: true,
	hasIOSDevices: true,
	hasDesktopDevices: true,
	hasBrowser: false,
	hasCampaigns: false,
	isAnonymous: false,
	hasAdSpend: false,
	percentUsersBornInDataset: 35,

	hasAvatar: true,
	makeChart: false,

	batchSize: 1_500_000,
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
			properties: {},
		},
		{
			event: "complete quest",
			weight: 12,
			properties: {},
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
		// {
		// 	event: "generic event (common)",
		// 	weight: 5,
		// 	properties: {
		// 		generic_prop: u.pickAWinner(["foo", "bar", "baz", "qux"]),
		// 	}
		// },
		{
			event: "$experiment_started",
			weight: 3,
			properties: {
				"Experiment name": u.pickAWinner([
					"fast leveling",
					"tension economy",
					"free trial",
				]),
				"Variant": ["A", "B", "C", "Control"],
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
			const sequence = v.clone(record.sequence);
			if (sequence.includes("$experiment_started")) {
				//ensure there's only one experiment per user flow
				const newSequence = sequence.filter((event) => event !== "$experiment_started");

				newSequence.unshift("$experiment_started");


				record.sequence = newSequence;
			}

		}

		if (type === "scd") {

		}

		if (type === "everything") {
			
		}

		return record;
	}
};

module.exports = config;
