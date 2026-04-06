/**
 * Bare dungeon for testing TimeSoup time distribution.
 * No hooks, no funnels, no ad spend — pure event generation
 * so TimeSoup's distribution is the only thing shaping the data.
 */

/** @type {import('../types').Dungeon} */
const config = {
	token: "",
	seed: "soup-test",
	numDays: 100,
	numEvents: 50_000,
	numUsers: 500,
	format: "json",
	writeToDisk: true,
	concurrency: 1,
	hasAdSpend: false,
	hasCampaigns: false,
	hasLocation: false,
	hasAvatar: false,
	hasBrowser: false,
	hasAnonIds: false,
	hasSessionIds: false,
	hasAndroidDevices: true,
	hasIOSDevices: true,
	hasDesktopDevices: true,
	isAnonymous: false,
	alsoInferFunnels: false,
	verbose: true,
	batchSize: 2_500_000,
	name: "soup-test",

	// Uses default soup params — change these to test different distributions
	// soup: { peaks: 5, deviation: 2, mean: 0 },

	events: [
		{ event: "page_view", weight: 5, isFirstEvent: true, properties: {} },
		{ event: "click", weight: 3, properties: {} },
		{ event: "purchase", weight: 1, properties: {} },
	],

	superProps: {},
	userProps: {},
	funnels: [],
	scdProps: {},
	mirrorProps: {},
	groupKeys: [],
	groupProps: {},
	lookupTables: [],
};

export default config;
