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
		try {
			const choice = chance.pickone(this);
			return choice;
		}
		catch (e) {
			return null;
		}
	}
	return chance.pickone(items);
}

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
}

function dates(inTheLast = 30, numPairs = 5, format = 'YYYY-MM-DD') {
	const pairs = [];
	for (let i = 0; i < numPairs; i++) {
		pairs.push([date(inTheLast, format), date(inTheLast, format)]);
	}
	return pairs;

}

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

}

function choose(value) {
	if (typeof value === 'function') {
		return value();
	}
	if (Array.isArray(value)) {
		return chance.pickone(value);
	}

	return value;
}

function exhaust(arr) {
	return function () {
		return arr.shift();
	};
}


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
}

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
}

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
}

// Box-Muller transform to generate standard normally distributed values
function boxMullerRandom() {
	let u = 0, v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Apply skewness to the value
function applySkew(value, skew) {
	if (skew === 1) return value;
	// Adjust the value based on skew
	let sign = value < 0 ? -1 : 1;
	return sign * Math.pow(Math.abs(value), skew);
}

// Map standard normal value to our range
function mapToRange(value, mean, sd) {
	return Math.round(value * sd + mean);
}

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
}

function progress(thing, p) {
	readline.cursorTo(process.stdout, 0);
	process.stdout.write(`${thing} processed ... ${comma(p)}`);
}



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
}

function getUniqueKeys(data) {
	const keysSet = new Set();
	data.forEach(item => {
		Object.keys(item).forEach(key => keysSet.add(key));
	});
	return Array.from(keysSet);
}

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
}

function generateName() {
	var adjs = [
		"autumn", "hidden", "bitter", "misty", "silent", "empty", "dry", "dark",
		"summer", "icy", "delicate", "quiet", "white", "cool", "spring", "winter",
		"patient", "twilight", "dawn", "crimson", "wispy", "weathered", "blue",
		"billowing", "broken", "cold", "damp", "falling", "frosty", "green",
		"long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
		"red", "rough", "still", "small", "sparkling", "throbbing", "shy",
		"wandering", "withered", "wild", "black", "young", "holy", "solitary",
		"fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
		"polished", "ancient", "purple", "lively", "nameless", "gentle", "gleaming", "furious", "luminous", "obscure", "poised", "shimmering", "swirling",
		"sombre", "steamy", "whispering", "jagged", "melodic", "moonlit", "starry", "forgotten",
		"peaceful", "restive", "rustling", "sacred", "ancient", "haunting", "solitary", "mysterious",
		"silver", "dusky", "earthy", "golden", "hallowed", "misty", "roaring", "serene", "vibrant",
		"stalwart", "whimsical", "timid", "tranquil", "vast", "youthful", "zephyr", "raging",
		"sapphire", "turbulent", "whirling", "sleepy", "ethereal", "tender", "unseen", "wistful"
	];

	var nouns = [
		"waterfall", "river", "breeze", "moon", "rain", "wind", "sea", "morning",
		"snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn", "glitter",
		"forest", "hill", "cloud", "meadow", "sun", "glade", "bird", "brook",
		"butterfly", "bush", "dew", "dust", "field", "fire", "flower", "firefly",
		"feather", "grass", "haze", "mountain", "night", "pond", "darkness",
		"snowflake", "silence", "sound", "sky", "shape", "surf", "thunder",
		"violet", "water", "wildflower", "wave", "water", "resonance", "sun",
		"wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
		"frog", "smoke", "star", "glow", "wave", "riverbed", "cliff", "deluge", "prairie", "creek", "ocean",
		"peak", "valley", "starlight", "quartz", "woodland", "marsh", "earth", "canopy",
		"petal", "stone", "orb", "gale", "bay", "canyon", "watercourse", "vista", "raindrop",
		"boulder", "grove", "plateau", "sand", "mist", "tide", "blossom", "leaf", "flame",
		"shade", "coil", "grotto", "pinnacle", "scallop", "serenity", "abyss", "skyline",
		"drift", "echo", "nebula", "horizon", "crest", "wreath", "twilight", "balm", "glimmer"
	];

	var verbs = [
		"dancing", "whispering", "flowing", "shimmering", "swirling", "echoing", "sparkling", "glistening",
		"cascading", "drifting", "glowing", "rippling", "quivering", "singing", "twinkling", "radiating",
		"enveloping", "enchanting", "captivating", "embracing", "embracing", "illuminating", "pulsating", "gliding",
		"soaring", "wandering", "meandering", "dazzling", "cuddling", "embracing", "caressing", "twisting",
		"twirling", "tumbling", "surging", "glimmering", "gushing", "splashing", "rolling", "splintering",
		"splintering", "crescendoing", "whirling", "bursting", "shining", "gushing", "emerging", "revealing",
		"emerging", "unfolding", "unveiling", "emerging", "surrounding", "unveiling", "materializing", "revealing"
	];

	var adverbs = [
		"gracefully", "softly", "smoothly", "gently", "tenderly", "quietly", "serenely", "peacefully",
		"delicately", "effortlessly", "subtly", "tranquilly", "majestically", "silently", "calmly", "harmoniously",
		"elegantly", "luminously", "ethereally", "mysteriously", "sublimely", "radiantly", "dreamily", "ethereally",
		"mesmerizingly", "hypnotically", "mystically", "enigmatically", "spellbindingly", "enchantingly", "fascinatingly",
		"bewitchingly", "captivatingly", "entrancingly", "alluringly", "rapturously", "seductively", "charismatically",
		"seductively", "envelopingly", "ensnaringly", "entrancingly", "intoxicatingly", "irresistibly", "transcendentally",
		"envelopingly", "rapturously", "intimately", "intensely", "tangibly", "vividly", "intensely", "deeply"
	];


	// ? http://stackoverflow.com/a/17516862/103058
	var adj = adjs[Math.floor(Math.random() * adjs.length)];
	var noun = nouns[Math.floor(Math.random() * nouns.length)];
	var verb = verbs[Math.floor(Math.random() * verbs.length)];
	var adverb = adverbs[Math.floor(Math.random() * adverbs.length)];


	return adj + '-' + noun + '-' + verb + '-' + adverb;

}

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

	//anon Ids
	const anonymousIds = [];
	const clusterSize = integer(2, 10);
	for (let i = 0; i < clusterSize; i++) {
		anonymousIds.push(uid(42));
	}

	//session Ids
	const sessionIds = [];
	const sessionSize = integer(5, 30);
	for (let i = 0; i < sessionSize; i++) {
		sessionIds.push([uid(5), uid(5), uid(5), uid(5)].join("-"));
	}



	return {
		$name,
		$email,
		$avatar,
		$created,
		anonymousIds,
		sessionIds
	};
}

module.exports = {
	weightedRange,
	pick,
	day,
	integer,
	makeProducts,
	date,
	progress,
	choose,
	range,
	exhaust,
	openFinder,
	applySkew,
	boxMullerRandom,
	generateEmoji,
	getUniqueKeys,
	makeHashTags,
	generateName,
	person
};