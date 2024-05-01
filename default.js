const Chance = require('chance');
const chance = new Chance();
const { weightedRange, makeProducts, date, generateEmoji } = require('./utils.js');

const config = {
	token: "",
	seed: "foo bar baz",
	numDays: 30, //how many days worth of data
	numEvents: 100000, //how many events
	numUsers: 1000, //how many users	
	format: 'csv', //csv or json
	region: "US",

	events: [
		{
			"event": "checkout",
			"weight": 2,
			"properties": {
				amount: weightedRange(5, 500, 1000, .25),
				currency: ["USD", "CAD", "EUR", "BTC", "ETH", "JPY"],
				cart: makeProducts,
			}
		},
		{
			"event": "add to cart",
			"weight": 4,
			"properties": {
				isFeaturedItem: [true, false, false],
				amount: weightedRange(5, 500, 1000, .25),
				rating: weightedRange(1, 5),
				reviews: weightedRange(0, 35),
				product_id: weightedRange(1, 1000)
			}
		},
		{
			"event": "page view",
			"weight": 10,
			"properties": {
				page: ["/", "/", "/help", "/account", "/watch", "/listen", "/product", "/people", "/peace"],
				utm_source: ["$organic", "$organic", "$organic", "$organic", "google", "google", "google", "facebook", "facebook", "twitter", "linkedin"],
			}
		},
		{
			"event": "view item",
			"weight": 8,
			"properties": {
				product_id: weightedRange(1, 1000),
				colors: ["light", "dark", "custom", "dark"]
			}
		},
		{
			"event": "save item",
			"weight": 5,
			"properties": {
				product_id: weightedRange(1, 1000),
				colors: ["light", "dark", "custom", "dark"]
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
		platform: ["web", "mobile", "web", "mobile", "web", "kiosk"],
		emotions: generateEmoji(),

	},
	/*
	user properties work the same as event properties
	each key should be an array or function reference
	*/
	userProps: {
		title: chance.profession.bind(chance),
		luckyNumber: weightedRange(42, 420),
		vibe: generateEmoji(),		
		spiritAnimal: chance.animal.bind(chance)
	},

	scdProps: {
		plan: ["free", "free", "free", "free", "basic", "basic", "basic", "premium", "premium", "enterprise"],
		MRR: weightedRange(0, 10000, 1000, .15),
		NPS: weightedRange(0, 10, 150, 2),
		marketingOptIn: [true, true, false],
		dateOfRenewal: date(100, false),
	},

	/*
	for group analytics keys, we need an array of arrays [[],[],[]] 
	each pair represents a group_key and the number of profiles for that key
	*/
	groupKeys: [
		['company_id', 350],

	],
	groupProps: {
		company_id: {
			$name: () => { return chance.company(); },
			$email: () => { return `CSM ${chance.pickone(["AK", "Jessica", "Michelle", "Dana", "Brian", "Dave"])}`; },
			"# of employees": weightedRange(3, 10000),
			"sector": ["tech", "finance", "healthcare", "education", "government", "non-profit"],
			"segment": ["enterprise", "SMB", "mid-market"],
		}
	},

	lookupTables: [
		{
			key: "product_id",
			entries: 1000,
			attributes: {
				category: [
					"Books",
					"Movies",
					"Music",
					"Games",
					"Electronics",
					"Computers",
					"Smart Home",
					"Home",
					"Garden & Tools",
					"Pet Supplies",
					"Food & Grocery",
					"Beauty",
					"Health",
					"Toys",
					"Kids",
					"Baby",
					"Handmade",
					"Sports",
					"Outdoors",
					"Automotive",
					"Industrial",
					"Entertainment",
					"Art"
				],
				"demand": ["high", "medium", "medium", "low"],
				"supply": ["high", "medium", "medium", "low"],
				"manufacturer": chance.company.bind(chance),
				"price": weightedRange(5, 500, 1000, .25),
				"rating": weightedRange(1, 5),
				"reviews": weightedRange(0, 35)
			}

		}
	],
};

module.exports = config;