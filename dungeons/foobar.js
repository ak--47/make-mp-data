/**
 * This is the default configuration file for the data generator in SIMPLE mode
 * notice how the config object is structured, and see it's type definition in ./types.d.ts
 * feel free to modify this file to customize the data you generate
 * see helper functions in utils.js for more ways to generate data
 */




function integer(min = 1, max = 100) {
	// If min equals max, just return the value
	if (min === max) {
		return min;
	}

	// Swap min and max if min is greater than max
	if (min > max) {
		[min, max] = [max, min];
	}

	// Generate a random integer between min and max (inclusive)
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


const dates = [
	"2024-09-18T21:48:28.173Z",
	"2024-12-09T03:17:46.661Z",
	"2024-02-26T07:52:14.943Z",
	"2024-04-22T08:35:17.647Z",
	"2024-11-25T17:03:58.061Z",
	"2024-01-14T21:46:58.982Z",
	"2024-06-20T12:47:25.687Z",
	"2024-08-13T22:18:08.665Z",
	"2024-08-09T07:47:18.321Z",
	"2024-06-21T19:04:43.432Z",
	"2024-03-09T00:18:37.705Z",
	"2024-08-02T09:23:41.699Z",
	"2024-11-26T13:25:08.673Z",
	"2024-05-23T11:51:34.238Z",
	"2024-10-24T20:14:05.106Z",
	"2024-10-01T18:52:32.463Z",
	"2024-10-15T19:22:40.675Z",
	"2024-06-13T21:29:11.962Z",
	"2024-08-29T12:02:48.632Z",
	"2024-12-22T12:11:40.809Z",
	"2024-01-03T03:39:19.446Z",
	"2024-06-28T10:05:43.908Z",
	"2024-12-01T18:49:00.447Z",
	"2024-12-30T05:44:23.418Z",
	"2024-03-14T22:38:40.833Z",
	"2024-12-28T06:45:31.946Z",
	"2024-07-20T21:40:19.498Z",
	"2024-12-26T06:44:41.982Z",
	"2024-10-28T13:45:35.409Z",
	"2024-02-28T00:11:54.916Z",
	"2024-07-08T10:01:57.834Z",
	"2024-02-23T08:00:59.386Z",
	"2024-08-20T05:23:33.024Z",
	"2024-02-10T20:52:46.564Z",
	"2024-08-24T21:32:15.202Z",
	"2024-06-17T03:51:35.142Z",
	"2024-04-09T13:13:45.218Z",
	"2024-07-26T16:31:51.091Z",
	"2024-05-26T04:06:33.013Z",
	"2024-11-05T17:15:37.412Z",
	"2024-10-20T17:01:38.205Z",
	"2024-01-08T05:09:18.692Z",
	"2024-08-24T13:52:14.774Z",
	"2024-06-26T13:47:07.276Z",
	"2024-06-19T15:05:53.246Z",
	"2024-05-01T04:06:52.028Z",
	"2024-05-26T22:45:59.626Z",
	"2024-04-17T20:50:58.460Z",
	"2024-07-28T04:32:04.578Z",
	"2024-01-29T05:31:48.744Z",
	"2024-08-06T18:47:29.190Z",
	"2024-04-03T23:12:20.415Z",
	"2024-09-13T08:47:35.938Z",
	"2024-07-27T15:12:15.145Z",
	"2024-10-24T00:39:21.835Z",
	"2024-10-08T16:50:36.591Z",
	"2024-02-27T15:53:19.204Z",
	"2024-04-21T08:24:05.883Z",
	"2024-03-08T10:07:46.720Z",
	"2024-01-10T08:36:19.554Z",
	"2024-02-17T12:56:00.562Z",
	"2024-10-03T07:54:46.486Z",
	"2024-05-29T10:18:36.289Z",
	"2024-05-06T23:27:07.145Z",
	"2024-05-27T08:41:47.787Z",
	"2024-09-16T12:22:09.573Z",
	"2024-05-03T00:31:06.036Z",
	"2024-11-24T19:38:43.380Z",
	"2024-06-03T04:01:56.328Z",
	"2024-05-04T02:25:25.455Z",
	"2024-12-19T18:35:25.052Z",
	"2024-05-07T21:54:28.113Z",
	"2024-11-24T09:58:08.766Z",
	"2024-03-17T02:46:20.903Z",
	"2024-09-04T09:20:24.930Z",
	"2024-02-04T10:23:33.624Z",
	"2024-01-26T02:42:06.668Z",
	"2024-08-11T02:26:21.969Z",
	"2024-07-11T13:34:51.283Z",
	"2024-12-20T00:09:10.080Z",
	"2024-05-28T00:20:07.079Z",
	"2024-01-13T14:54:03.339Z",
	"2024-08-10T17:18:12.759Z",
	"2024-10-06T15:05:11.437Z",
	"2024-11-18T03:53:12.932Z",
	"2024-02-19T18:06:13.680Z",
	"2024-08-03T11:48:00.207Z",
	"2024-11-22T15:19:47.316Z",
	"2024-06-30T19:56:49.636Z",
	"2024-12-03T00:25:23.926Z",
	"2024-07-30T15:27:18.198Z",
	"2024-09-07T01:40:58.245Z",
	"2024-05-16T05:24:14.727Z",
	"2024-11-14T03:46:49.323Z",
	"2024-02-16T09:18:23.473Z",
	"2024-10-19T14:07:11.462Z",
	"2024-02-09T08:52:04.735Z",
	"2024-06-06T09:41:11.810Z",
	"2024-05-07T23:14:05.114Z",
	"2024-06-03T06:52:21.652Z"
];

const billionsOfEvents = 2

const numEvents = billionsOfEvents * 1_000_000_000;
const eventPerUser = 1_000;
const numUsers = Math.floor(numEvents / eventPerUser);
const seed = Math.random().toString()

/** @type {import('../types').Dungeon} */
const config = {
	token: "3cd6d9fb43b02f8fd731a6d814ac4b8f",
	seed: seed,
	numDays: 30, //how many days worth of data
	numEvents: numEvents, //how many events
	numUsers: numUsers, //how many users	
	format: 'json', //csv or json
	region: "US",
	hasAnonIds: false, //if true, anonymousIds are created for each user
	hasSessionIds: false, //if true, hasSessionIds are created for each user
	batchSize: 2_500_000,
	hasAdSpend: false,
	hasAvatar: false,
	hasBrowser: false,
	hasCampaigns: false,
	hasIOSDevices: false,
	hasLocation: false,
	isAnonymous: true,
	hasAndroidDevices: false,
	hasDesktopDevices: false,
	writeToDisk: false,
	concurrency: 500,

	events: [
		{
			event: "foo",
			weight: 10,
			properties: {}
		},
		{
			event: "bar",
			weight: 9,
			properties: {}
		},
		{
			event: "baz",
			weight: 8,
			properties: {}
		},
		{
			event: "qux",
			weight: 7,
			properties: {}
		},
		{
			event: "garply",
			weight: 6,
			properties: {}
		},
		{
			event: "durtle",
			weight: 5,
			properties: {}
		},
		{
			event: "linny",
			weight: 4,
			properties: {}
		},
		{
			event: "fonk",
			weight: 3,
			properties: {}
		},
		{
			event: "crumn",
			weight: 2,
			properties: {}
		},
		{
			event: "yak",
			weight: 1,
			properties: {}
		}
	],
	superProps: {
		string: ["red", "orange", "yellow", "green", "blue", "indigo", "violet"],
		number: integer,
		boolean: [true, false],
		date: dates,

	},
	userProps: {
		luckyNumber: integer,
		spiritAnimal: ["duck", "dog", "otter", "penguin", "cat", "elephant", "lion", "cheetah", "giraffe", "zebra", "rhino", "hippo", "whale", "dolphin", "shark", "octopus", "squid", "jellyfish", "starfish", "seahorse", "crab", "lobster", "shrimp", "clam", "snail", "slug", "butterfly", "moth", "bee", "wasp", "ant", "beetle", "ladybug", "caterpillar", "centipede", "millipede", "scorpion", "spider", "tarantula", "tick", "mite", "mosquito", "fly", "dragonfly", "damselfly", "grasshopper", "cricket", "locust", "mantis", "cockroach", "termite", "praying mantis", "walking stick", "stick bug", "leaf insect", "lacewing", "aphid", "cicada", "thrips", "psyllid", "scale insect", "whitefly", "mealybug", "planthopper", "leafhopper", "treehopper", "flea", "louse", "bedbug", "flea beetle", "weevil", "longhorn beetle", "leaf beetle", "tiger beetle", "ground beetle", "lady beetle", "firefly", "click beetle", "rove beetle", "scarab beetle", "dung beetle", "stag beetle", "rhinoceros beetle", "hercules beetle", "goliath beetle", "jewel beetle", "tortoise beetle"],
		created: dates,
	},

	scdProps: {},
	mirrorProps: {},
	lookupTables: [],
	groupKeys: [
	],
	groupProps: {
	},

	hook: function (record, type, meta) {
		return record;
	}
};



export default config;