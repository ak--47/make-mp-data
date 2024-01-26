const Chance = require('chance');
const chance = new Chance();
const { range, makeProducts, date } = require('./utils.js');

const config = {
	// token & secret; you can pass these as command line params too.
	token: "{{PROJECT TOKEN}}",
	seed: "foo bar baz",
	numDays: 30, //how many days worth of data
	numEvents: 10000, //how many events
	numUsers: 100, //how many users	
	format: 'csv', //csv or json

	events: [
		{
			"event": "checkout",
			"weight": 2,
			"properties": {
				amount: range(5, 500, 1000, .25),
				currency: ["USD", "CAD", "EUR", "BTC", "ETH", "JPY"],
				cart: makeProducts,
			}
		},
		{
			"event": "add to cart",
			"weight": 4,
			"properties": {
				isFeaturedItem: [true, false, false],
				amount: range(5, 500, 1000, .25),
				rating: range(1, 5),
				reviews: range(0, 35),
				product_id: range(1, 1000)
			}
		},
		{
			"event": "page view",
			"weight": 10,
			"properties": {
				path: ["/", "/", "/help", "/account", "/watch", "/listen", "/product", "/people", "/peace"],
			}
		},
		{
			"event": "view item",
			"weight": 8,
			"properties": {
				category: chance.animal.bind(chance),
				item_name: chance.avatar.bind(chance),
			}
		},
		{
			"event": "save item",
			"weight": 5,
			"properties": {
				category: chance.animal.bind(chance),
			}
		},
		{
			"event": "sign up",
			"isFirstEvent": true,
			"weight": 0,
			"properties": {
				variant: ["A", "B", "C", "Control"],
				experiment: ["no password", "social sign in", "new tutorial"],
			}
		}
	],
	superProps: {
		platform: ["web", "mobile", "kiosk"],

	},
	/*
	user properties work the same as event properties
	each key should be an array or function reference
	*/
	userProps: {
		title: chance.profession.bind(chance),
		luckyNumber: range(42, 420),
		servicesUsed: [["foo"], ["foo", "bar"], ["foo", "bar", "baz"], ["foo", "bar", "baz", "qux"], ["baz", "qux"], ["qux"]],
		spiritAnimal: chance.animal.bind(chance)
	},

	scdProps: {
		plan: ["free", "free", "free", "basic", "basic", "premium", "enterprise"],
		MRR: range(0, 10000, 1000, .15),
		NPS: range(0, 10, 150, 2),
		marketingOptIn: [true, true, false],
		dateOfRenewal: date(100, false),

	},

	/*
	for group analytics keys, we need an array of arrays [[],[],[]] 
	each pair represents a group_key and the number of profiles for that key
	*/
	groupKeys: [
		['company_id', 1000],

	],
	groupProps: {
		company_id: {
			$name: () => { return chance.company(); },
			"# of employees": range(3, 10000),
			"sector": ["tech", "finance", "healthcare", "education", "government", "non-profit"],
			"segment": ["enterprise", "SMB", "mid-market"],
		}
	},

	lookupTables: [],
};

module.exports = config;