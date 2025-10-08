
const SEED = "my-seed";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);
import 'dotenv/config';
import * as u from '../lib/utils/utils.js';
import * as v from 'ak-tools';
const chance = u.initChance(SEED);
const num_users = 10_000;
const days = 125;

/** @typedef  {import("../types.js").Dungeon} Config */

function genIds(numIds = 1000) {
	const ids = [];
	for (let i = 0; i < numIds; i++) {
		ids.push(v.uid());
	}
	return ids;
}

const videoIds = genIds();
const channelIds = genIds(100);

/** @type {Config} */
const config = {
	token: "",
	seed: `LFG!`, //,
	numDays: days,
	numEvents: num_users * 62,
	numUsers: num_users,
	hasAnonIds: false,
	hasSessionIds: false,
	format: "parquet",
	alsoInferFunnels: false,
	hasLocation: false,
	hasAndroidDevices: true,
	hasIOSDevices: true,
	hasDesktopDevices: true,
	hasBrowser: false,
	hasCampaigns: false,
	isAnonymous: false,
	hasAdSpend: false,

	hasAvatar: false,
	makeChart: false,

	batchSize: 1_500_000,
	concurrency: 10,
	writeToDisk: true,

	funnels: [],

	events: [
		{
			event: "watch video",
			weight: 55,
			properties: {
				video_id: u.pickAWinner(videoIds),
				"watch percent": u.pickAWinner([
					25,
					50,
					75,
					100,
				]),
				"watch time": u.weighNumRange(1, 65, .89, 100),

				"category": u.pickAWinner([
					"comedy",
					"educational",
					"music",
					"sports",
					"news",
					"gaming",
					"travel",
				]),
				quality: u.pickAWinner([
					"240p",
					"360p",
					"480p",
					"720p",
					"1080p",
					"4k",
				], 4),
				autoplay: [
					true,
					false,
				],
				fullscreen: [
					true,
					false,
				],
				"ads?": [
					true, true,
					false,
				],
			},
		},
		{
			event: "like",
			weight: 10,
			properties: {
				video_id: u.pickAWinner(videoIds),
			},
		},
		{
			event: "comment",
			weight: 5,
			properties: {
				video_id: u.pickAWinner(videoIds),
				comment_length: [
					"short",
					"medium",
					"long",
				],
			},
		},
		{
			event: "share",
			weight: 3,
			properties: {
				video_id: u.pickAWinner(videoIds),
				"share network": u.pickAWinner([
					"facebook",
					"twitter",
					"reddit",
					"email",
					"whatsapp",
				]),
			},
		},
		{
			event: "search",
			weight: 25,
			properties: {
				search_term: [
					"cats",
					"dogs",
					"tutorial",
					"news",
					"music",
				],
				"results count": u.pickAWinner([
					0,
					1,
					2,
					3,
					4,
					5,
					6, 7, 8, 9, 10
				], 5),
				"search category": [
					"all",
					"channels",
					"playlists",
				],
			},
		},
		{
			event: "subscribe",
			weight: 7,
			properties: {
				channel_id: u.pickAWinner(genIds()),
			},
		},
		{
			event: "unsubscribe",
			weight: 2,
			properties: {
				channel_id: u.pickAWinner(genIds()),
			},
		},
		{
			event: "create playlist",
			weight: 4,
			properties: {
				"play list name": u.pickAWinner([
					"favorites",
					"watch later",
					"my music",
					"funny videos",
					"educational",
				]),
				privacy: u.pickAWinner([
					"public",
					"private",
					"unlisted",
				]),
			},
		},
		{
			event: "account signup",
			weight: 1,
			isFirstEvent: true,
			properties: {
				"sign up method": [
					"email",
					"google",
					"facebook",
				],
			},
		},
		{
			event: "account login",
			weight: 9,
			properties: {
				"log in method": u.pickAWinner([
					"email",
					"google",
					"facebook",
				]),
				success: [
					true,
					false,
				],
				error_message: [
					"incorrect password",
					"user not found",
					"account locked",
				],
			},
		},
		{
			event: "$experiment_started",
			weight: 5,
			isSessionStartEvent: true,
			properties: {
				"$experiment_type": "ak_ad_hoc",
				"Experiment name": "show results on empty search",
				"Variant name": ["feature enabled", "feature disabled"],
			}
		}
	],
	superProps: {
		platform: u.pickAWinner([
			"web",
			"ios",
			"android",
		]),
		network_type: [
			"wifi",
			"cellular",
		],
	},
	userProps: {
		subscription_status: [
			"free",
			"free",
			"premium",
		],
		age_range: [
			"13-17",
			"18-24",
			"25-34",
			"35-44",
			"45-54",
			"55+",
		],
		preferred_genre: u.pickAWinner([
			"comedy",
			"action",
			"drama",
			"sci-fi",
			"horror",
		]),
		upload_count: [
			0,
			1,
			5,
			10,
			20,
		],
		following_count: [
			0,
			10,
			50,
			100,
			500,
		],
		dark_mode_enabled: [
			true,
			false,
		],
	},

	scdProps: {},
	mirrorProps: {},
	groupKeys: [],
	groupProps: {},
	lookupTables: [],
	hook: function (record, type, meta) {
		return record;
	}
};

export default config;
