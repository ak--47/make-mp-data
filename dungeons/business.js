/**
 * This is the default configuration file for the data generator in COMPLEX mode
 * notice how the config object is structured, and see it's type definition in ./types.d.ts
 * feel free to modify this file to customize the data you generate
 * see helper functions in utils.js for more ways to generate data
 */


const Chance = require('chance');
const chance = new Chance();
const { weighNumRange, date, integer, pickAWinner, exhaust } = require('../lib/utils/utils.js');
const u = require('ak-tools');

const channel_ids = [...Array(1234).keys()].map(i => i + 1).map(n => `channel_id_${n}`);
const channel_names = chance.n(u.makeName, 1234);
const video_ids = [...Array(50000).keys()].map(i => i + 1).map(n => n.toString());
const video_names = chance.n(u.makeName, 50000);

const EVENTS = 50_000
const USERS = EVENTS / 100


/** @type {import('../types.js').Dungeon} */
const config = {
	token: "",	
	seed: "it's business time...",
	numDays: 90, //how many days worth of data
	numEvents: EVENTS, //how many events
	numUsers: USERS, //how many users	
	format: 'json', //csv or json
	region: "US",
	hasAnonIds: false, //if true, anonymousIds are created for each user
	hasSessionIds: false, //if true, hasSessionIds are created for each user
	hasLocation: true,
	hasAndroidDevices: true,
	hasIOSDevices: true,
	hasDesktopDevices: true,
	hasBrowser: true,
	hasCampaigns: true,
	isAnonymous: false,
	hasAdSpend: true,

	hasAvatar: false,
	makeChart: true,

	batchSize: 500_000,
	concurrency: 500,

	funnels: [
		{
			sequence: ["watch video", "like video", "subscribe", "purchase video"],
			conversionRate: 35,
			props: {
				channel_id: pickAWinner(channel_ids),
				video_id: weighNumRange(1, 50000, 1.4),
				category: pickAWinner(["funny", "educational", "music", "news", "sports", "cooking", "DIY", "travel", "gaming"]),
				isFeatured: () => { chance.bool({ likelihood: 25 }); },
			}
		},
		{
			sequence: ["watch video", "dislike video"],
			conversionRate: 10,
			order: "sequential",
			props: {
				channel_id: pickAWinner(channel_ids),
				video_id: weighNumRange(1, 50000, .67),
				category: pickAWinner(["funny", "educational", "music", "news", "sports", "cooking", "DIY", "travel", "gaming"]),
				isFeatured: () => { chance.bool({ likelihood: 25 }); },
			}
		},
	],
	events: [
		{
			"event": "watch video",
			"weight": 75,
			"properties": {
				"#hashtags": makeHashTags,
				"watch time (sec)": weighNumRange(10, 600, .25),
				"quality": pickAWinner(["2160p", "1440p", "1080p", "720p", "480p", "360p", "240p"], 1)
			}
		},
		{
			"event": "like video",
			"weight": 30,
			"properties": {

			}
		},
		{
			"event": "dislike video",
			"weight": 15,
			"properties": {

			}
		},
		{
			"event": "subscribe",
			"weight": 10,
			"properties": {
				"UI": pickAWinner(["button", "link", "modal", "menu"]),
			}
		},
		{
			"event": "search",
			"weight": 10,
			"properties": {
				term: () => { return chance.word(); },
				"# results": weighNumRange(1, 100, .25),
				"UI": pickAWinner(["button", "link", "modal", "menu"]),
			}
		},
		{
			"event": "comment",
			"weight": 6,
			"properties": {
				length: weighNumRange(1, 500, .25),
				video_id: weighNumRange(1, 50000, .72),
				"has replies": [true, false, false, false, false],
				"has photos": [true, false, false, false, false],

			}
		},
		{
			"event": "save video",
			"weight": 17,
			"properties": {
				video_id: weighNumRange(1, 50000, 1.4),
				UI: pickAWinner(["toolbar", "menu", "keyboard"])

			}
		},
		{
			"event": "create playlist",
			"weight": 5,
			"properties": {
				"# of videos": weighNumRange(1, 100, .25),
				"UI": pickAWinner(["toolbar", "menu", "keyboard"]),
				"visibility": pickAWinner(["public", "private", "unlisted"]),
			}
		},
		{
			"event": "purchase video",
			"weight": 12,
			"properties": {
				video_id: weighNumRange(1, 50000, 1.4),
				basket: makeProducts(5),


			}
		},
		{
			"event": "support ticket",
			"weight": 10,
			"properties": {
				description: chance.sentence.bind(chance),
				severity: ["low", "medium", "high"],
				ticket_id: chance.guid.bind(chance)
			}
		},
		{
			"event": "app error",
			"weight": 15,
			"properties": {
				code: pickAWinner(["404", "500", "403", "401", "400", "503", "504", "429"]),
				error: chance.sentence.bind(chance),
				component: pickAWinner(["video player", "search", "comment", "profile", "settings", "billing", "support"]),
			}
		},
		{
			"event": "sign up",
			"isFirstEvent": true,
			"weight": 0,
			"properties": {

			}
		}
	],
	superProps: {


	},
	/*
	user properties work the same as event properties
	each key should be an array or function reference
	*/
	userProps: {
		title: chance.profession.bind(chance),
		luckyNumber: weighNumRange(42, 420),
		experiment: designExperiment(),
		spiritAnimal: ["unicorn", "dragon", "phoenix", "sasquatch", "yeti", "kraken", "jackalope", "thunderbird", "mothman", "nessie", "chupacabra", "jersey devil", "bigfoot", "weindgo", "bunyip", "mokele-mbembe", "tatzelwurm", "megalodon"],
		
		ip: chance.ip.bind(chance),

	},

	/** each generates it's own table */
	scdProps: {
		plan: ["free", "free", "free", "free", "basic", "basic", "basic", "premium", "premium", "enterprise"],
		MRR: weighNumRange(0, 10000, .15),
		NPS: weighNumRange(0, 10, 2, 150),
	},

	mirrorProps: {

	},

	/*
	for group analytics keys, we need an array of arrays [[],[],[]] 
	each pair represents a group_key and the number of profiles for that key
	*/
	groupKeys: [
		['channel_id', 1234, ["save video", "comment", "watch video", "purchase video", "like video", "dislike video", "subscribe"]],

	],
	groupProps: {
		channel_id: {
			"name": exhaust(channel_names),
			"viewers": weighNumRange(5, 500, .25),
			"rating": weighNumRange(1, 5),
			"reviews": weighNumRange(0, 35)
		}

	},

	lookupTables: [
		{
			key: "video_id",
			entries: 50000,
			attributes: {
				isFlagged: [true, false, false, false, false],
				copyright: ["all rights reserved", "creative commons", "creative commons", "public domain", "fair use"],
				uploader_id: chance.guid.bind(chance),
				"uploader influence": ["low", "low", "low", "medium", "medium", "high"],
				thumbs: weighNumRange(0, 4000, .25),
				video_name: exhaust(video_names),
				rating: ["G", "PG", "PG-13", "R", "NC-17", "PG-13", "R", "NC-17", "R", "PG", "PG"]
			}

		}
	],

	hook: function (record, type, meta) {
		return record;
	}
};



function makeHashTags() {
	const possibleHashtags = [];
	for (let i = 0; i < 20; i++) {
		possibleHashtags.push('#' + u.makeName(2, ''));
	}

	const numHashtags = integer(integer(1, 5), integer(5, 10));
	const hashtags = [];
	for (let i = 0; i < numHashtags; i++) {
		hashtags.push(chance.pickone(possibleHashtags));
	}
	return [hashtags];
};

function makeProducts(maxItems = 10) {
	return function () {
		const categories = ["Device Accessories", "eBooks", "Automotive", "Baby Products", "Beauty", "Books", "Camera & Photo", "Cell Phones & Accessories", "Collectible Coins", "Consumer Electronics", "Entertainment Collectibles", "Fine Art", "Grocery & Gourmet Food", "Health & Personal Care", "Home & Garden", "Independent Design", "Industrial & Scientific", "Accessories", "Major Appliances", "Music", "Musical Instruments", "Office Products", "Outdoors", "Personal Computers", "Pet Supplies", "Software", "Sports", "Sports Collectibles", "Tools & Home Improvement", "Toys & Games", "Video, DVD & Blu-ray", "Video Games", "Watches"];
		const slugs = ['/sale/', '/featured/', '/home/', '/search/', '/wishlist/', '/'];
		const assetExtension = ['.png', '.jpg', '.jpeg', '.heic', '.mp4', '.mov', '.avi'];
		const data = [];
		const numOfItems = integer(1, 12);

		for (var i = 0; i < numOfItems; i++) {
			const category = chance.pickone(categories);
			const slug = chance.pickone(slugs);
			const asset = chance.pickone(assetExtension);
			const product_id = chance.guid();
			const price = integer(1, 300);
			const quantity = integer(1, 5);

			const item = {
				product_id: product_id,
				sku: integer(11111, 99999),
				amount: price,
				quantity: quantity,
				value: price * quantity,
				featured: chance.pickone([true, false]),
				category: category,
				urlSlug: slug + category,
				asset: `${category}-${integer(1, 20)}${asset}`
			};

			data.push(item);
		}

		return [data];
	};
};


function designExperiment() {
	return function () {
		const variants = ["A", "B", "C", "Control"];
		const variant = chance.pickone(variants);
		const experiments = ["no password", "social sign in", "new tutorial", "new search"];
		const experiment = chance.pickone(experiments);
		const multi_variates = ["A/B", "A/B/C", "A/B/C/D", "Control"];
		const multi_variate = chance.pickone(multi_variates);
		const impression_id = chance.guid();



		const chosen = {
			variant,
			experiment,
			multi_variate,
			impression_id
		};

		return [chosen];
	};
}






module.exports = config;