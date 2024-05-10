const Chance = require('chance');
const chance = new Chance();
const readline = require('readline');
const { comma, uid } = require('ak-tools');
const { spawn } = require('child_process');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

function pick(items) {
	if (!Array.isArray(items)) {
		if (typeof items === 'function') {
			const selection = items();
			if (Array.isArray(selection)) {
				return chance.pickone(selection);
			}
			else {
				return selection;
			}
		}
		return items;

	}
	return chance.pickone(items);
};

function date(inTheLast = 30, isPast = true, format = 'YYYY-MM-DD') {
	const now = dayjs.utc();
	// dates must be in the the last 10 years
	if (Math.abs(inTheLast) > 365 * 10) inTheLast = chance.integer({ min: 1, max: 180 });
	return function () {
		try {
			const when = chance.integer({ min: 0, max: Math.abs(inTheLast) });
			let then;
			if (isPast) {
				then = now.subtract(when, 'day')
					.subtract(integer(0, 23), 'hour')
					.subtract(integer(0, 59), 'minute')
					.subtract(integer(0, 59), 'second');
			}
			if (!isPast) {
				then = now.add(when, 'day')
					.add(integer(0, 23), 'hour')
					.add(integer(0, 59), 'minute')
					.add(integer(0, 59), 'second');
			}
			if (format) return then?.format(format);
			if (!format) return then?.toISOString();
		}
		catch (e) {
			if (format) return now?.format(format);
			if (!format) return now?.toISOString();
		}
	};
};

function dates(inTheLast = 30, numPairs = 5, format = 'YYYY-MM-DD') {
	const pairs = [];
	for (let i = 0; i < numPairs; i++) {
		pairs.push([date(inTheLast, format), date(inTheLast, format)]);
	}
	return pairs;

};

function day(start, end) {
	const format = 'YYYY-MM-DD';
	return function (min, max) {
		start = dayjs(start);
		end = dayjs(end);
		const diff = end.diff(start, 'day');
		const delta = chance.integer({ min: min, max: diff });
		const day = start.add(delta, 'day');
		return {
			start: start.format(format),
			end: end.format(format),
			day: day.format(format)
		};
	};

};

function choose(value) {
	try {
		// Keep resolving the value if it's a function
		while (typeof value === 'function') {
			value = value();
		}

		// Now, if the resolved value is an array, use chance.pickone
		if (Array.isArray(value)) {
			return chance.pickone(value);
		}

		// If it's not a function or array, return it as is
		return value;
	}
	catch (e) {
		return '';
	}
}
function exhaust(arr) {
	return function () {
		return arr.shift();
	};
};


function integer(min, max) {
	if (min === max) {
		return min;
	}

	if (min > max) {
		return chance.integer({
			min: max,
			max: min
		});
	}

	if (min < max) {
		return chance.integer({
			min: min,
			max: max
		});
	}

	return 0;
};

function makeHashTags() {
	const popularHashtags = [
		'#GalacticAdventures',
		'#EnchantedExplorations',
		'#MagicalMoments',
		'#EpicQuests',
		'#WonderfulWorlds',
		'#FantasyFrenzy',
		'#MysticalMayhem',
		'#MythicalMarvels',
		'#LegendaryLegends',
		'#DreamlandDiaries',
		'#WhimsicalWonders',
		'#FabledFables'
	];

	const numHashtags = integer(integer(1, 5), integer(5, 10));
	const hashtags = [];
	for (let i = 0; i < numHashtags; i++) {
		hashtags.push(chance.pickone(popularHashtags));
	}
	return hashtags;
};

function makeProducts() {
	let categories = ["Device Accessories", "eBooks", "Automotive", "Baby Products", "Beauty", "Books", "Camera & Photo", "Cell Phones & Accessories", "Collectible Coins", "Consumer Electronics", "Entertainment Collectibles", "Fine Art", "Grocery & Gourmet Food", "Health & Personal Care", "Home & Garden", "Independent Design", "Industrial & Scientific", "Accessories", "Major Appliances", "Music", "Musical Instruments", "Office Products", "Outdoors", "Personal Computers", "Pet Supplies", "Software", "Sports", "Sports Collectibles", "Tools & Home Improvement", "Toys & Games", "Video, DVD & Blu-ray", "Video Games", "Watches"];
	let slugs = ['/sale/', '/featured/', '/home/', '/search/', '/wishlist/', '/'];
	let assetExtension = ['.png', '.jpg', '.jpeg', '.heic', '.mp4', '.mov', '.avi'];
	let data = [];
	let numOfItems = integer(1, 12);

	for (var i = 0; i < numOfItems; i++) {

		let category = chance.pickone(categories);
		let slug = chance.pickone(slugs);
		let asset = chance.pickone(assetExtension);
		let product_id = chance.guid();
		let price = integer(1, 300);
		let quantity = integer(1, 5);

		let item = {
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

	return data;
};

// Box-Muller transform to generate standard normally distributed values
function boxMullerRandom() {
	let u = 0, v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

// Apply skewness to the value
function applySkew(value, skew) {
	if (skew === 1) return value;
	// Adjust the value based on skew
	let sign = value < 0 ? -1 : 1;
	return sign * Math.pow(Math.abs(value), skew);
};

// Map standard normal value to our range
function mapToRange(value, mean, sd) {
	return Math.round(value * sd + mean);
};

function weightedRange(min, max, size = 100, skew = 1) {
	const mean = (max + min) / 2;
	const sd = (max - min) / 4;
	let array = [];

	for (let i = 0; i < size; i++) {
		let normalValue = boxMullerRandom();
		let skewedValue = applySkew(normalValue, skew);
		let mappedValue = mapToRange(skewedValue, mean, sd);

		// Ensure the mapped value is within our min-max range
		if (mappedValue >= min && mappedValue <= max) {
			array.push(mappedValue);
		} else {
			i--; // If out of range, redo this iteration
		}
	}

	return array;
};

function progress(thing, p) {
	readline.cursorTo(process.stdout, 0);
	process.stdout.write(`${thing} processed ... ${comma(p)}`);
};

function range(a, b, step = 1) {
	step = !step ? 1 : step;
	b = b / step;
	for (var i = a; i <= b; i++) {
		this.push(i * step);
	}
	return this;
};


//helper to open the finder
function openFinder(path, callback) {
	path = path || '/';
	let p = spawn('open', [path]);
	p.on('error', (err) => {
		p.kill();
		return callback(err);
	});
};

function getUniqueKeys(data) {
	const keysSet = new Set();
	data.forEach(item => {
		Object.keys(item).forEach(key => keysSet.add(key));
	});
	return Array.from(keysSet);
};

//makes a random-sized array of emojis
function generateEmoji(max = 10, array = false) {
	return function () {
		const emojis = ['😀', '😂', '😍', '😎', '😜', '😇', '😡', '😱', '😭', '😴', '🤢', '🤠', '🤡', '👽', '👻', '💩', '👺', '👹', '👾', '🤖', '🤑', '🤗', '🤓', '🤔', '🤐', '😀', '😂', '😍', '😎', '😜', '😇', '😡', '😱', '😭', '😴', '🤢', '🤠', '🤡', '👽', '👻', '💩', '👺', '👹', '👾', '🤖', '🤑', '🤗', '🤓', '🤔', '🤐', '😈', '👿', '👦', '👧', '👨', '👩', '👴', '👵', '👶', '🧒', '👮', '👷', '💂', '🕵', '👩‍⚕️', '👨‍⚕️', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳', '👩‍🎓', '👨‍🎓', '👩‍🎤', '👨‍🎤', '👩‍🏫', '👨‍🏫', '👩‍🏭', '👨‍🏭', '👩‍💻', '👨‍💻', '👩‍💼', '👨‍💼', '👩‍🔧', '👨‍🔧', '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨', '👩‍🚒', '👨‍🚒', '👩‍✈️', '👨‍✈️', '👩‍🚀', '👨‍🚀', '👩‍⚖️', '👨‍⚖️', '🤶', '🎅', '👸', '🤴', '👰', '🤵', '👼', '🤰', '🙇', '💁', '🙅', '🙆', '🙋', '🤦', '🤷', '🙎', '🙍', '💇', '💆', '🕴', '💃', '🕺', '🚶', '🏃', '🤲', '👐', '🙌', '👏', '🤝', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤙', '💪', '🖕', '✍️', '🤳', '💅', '👂', '👃', '👣', '👀', '👁', '🧠', '👅', '👄', '💋', '👓', '🕶', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '👙', '👚', '👛', '👜', '👝', '🛍', '🎒', '👞', '👟', '👠', '👡', '👢', '👑', '👒', '🎩', '🎓', '🧢', '⛑', '📿', '💄', '💍', '💎', '🔇', '🔈', '🔉', '🔊', '📢', '📣', '📯', '🔔', '🔕', '🎼', '🎵', '🎶', '🎙', '🎚', '🎛', '🎤', '🎧', '📻', '🎷', '🎸', '🎹', '🎺', '🎻', '🥁', '📱', '📲', '💻', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '📡', '🔍', '🔎', '🔬', '🔭', '📡', '💡', '🔦', '🏮', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '🗞', '📑', '🔖', '🏷', '💰', '💴', '💵', '💶', '💷', '💸', '💳', '🧾', '💹', '💱', '💲', '✉️', '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳', '✏️', '✒️', '🖋', '🖊', '🖌', '🖍', '📝', '💼', '📁', '📂', '🗂', '📅', '📆', '🗒', '🗓', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇', '📏', '📐', '✂️', '🗃', '🗄', '🗑', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝', '🔨', '⛏', '⚒', '🛠', '🗡', '⚔️', '🔫', '🏹', '🛡', '🔧', '🔩', '⚙️', '🗜', '⚖️', '🔗', '⛓', '🧰', '🧲', '⚗️', '🧪', '🧫', '🧬', '🔬', '🔭', '📡', '💉', '💊', '🛏', '🛋', '🚪', '🚽', '🚿', '🛁', '🧴', '🧷', '🧹', '🧺', '🧻', '🧼', '🧽', '🧯', '🚬', '⚰️', '⚱️', '🗿', '🏺', '🧱', '🎈', '🎏', '🎀', '🎁', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧'];
		let num = integer(1, max);
		let arr = [];
		for (let i = 0; i < num; i++) {
			arr.push(chance.pickone(emojis));
		}
		if (array) return arr;
		if (!array) return arr.join(', ');
		return "🤷";
	};
};


function person(bornDaysAgo = 30) {
	//names and photos
	const gender = chance.pickone(['male', 'female']);
	const first = chance.first({ gender });
	const last = chance.last();
	const $name = `${first} ${last}`;
	const $email = `${first[0]}.${last}@${chance.domain()}.com`;
	const avatarPrefix = `https://randomuser.me/api/portraits`;
	const randomAvatarNumber = chance.integer({
		min: 1,
		max: 99
	});
	const avPath = gender === 'male' ? `/men/${randomAvatarNumber}.jpg` : `/women/${randomAvatarNumber}.jpg`;
	const $avatar = avatarPrefix + avPath;
	const $created = date(bornDaysAgo, true, null)();

	const user = {
		$name,
		$email,
		$avatar,
		$created,
	};

	//anon Ids
	if (global.MP_SIMULATION_CONFIG?.anonIds) {
		const anonymousIds = [];
		const clusterSize = integer(2, 10);
		for (let i = 0; i < clusterSize; i++) {
			anonymousIds.push(uid(42));
		}
		user.anonymousIds = anonymousIds;
	}

	//session Ids
	if (global.MP_SIMULATION_CONFIG?.sessionIds) {
		const sessionIds = [];
		const sessionSize = integer(5, 30);
		for (let i = 0; i < sessionSize; i++) {
			sessionIds.push([uid(5), uid(5), uid(5), uid(5)].join("-"));
		}
		user.sessionIds = sessionIds;
	}

	return user;
};


function weighList(items, mostChosenIndex) {
	if (mostChosenIndex > items.length) mostChosenIndex = items.length;
	return function () {
		const weighted = [];
		for (let i = 0; i < 10; i++) {
			if (chance.bool({ likelihood: integer(10, 35) })) {
				if (chance.bool({ likelihood: 50 })) {
					weighted.push(items[mostChosenIndex]);
				}
				else {
					const rand = chance.d10();
					const addOrSubtract = chance.bool({ likelihood: 50 }) ? -rand : rand;
					let newIndex = mostChosenIndex + addOrSubtract;
					if (newIndex < 0) newIndex = 0;
					if (newIndex > items.length) newIndex = items.length;
					weighted.push(items[newIndex]);
				}
			}
			else {
				weighted.push(chance.pickone(items));
			}
		}
		return weighted;

	};
}

module.exports = {
	pick,
	date,
	dates,
	day,
	choose,
	exhaust,
	integer,
	makeHashTags,
	makeProducts,
	boxMullerRandom,
	applySkew,
	mapToRange,
	weightedRange,
	progress,
	range,
	openFinder,
	getUniqueKeys,
	generateEmoji,
	person,
	weighList
};