const Chance = require('chance');
const chance = new Chance();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const readline = require('readline');
dayjs.extend(utc);
const {comma} = require('ak-tools')


function pick() {
	const choice = chance.pickone(this);
	return choice;
}

function date(inTheLast = 30, isPast = true, format = 'YYYY-MM-DD') {
	const now = dayjs.utc();
	return function () {
		const when = chance.integer({ min: 0, max: inTheLast });
		let then;
		if (isPast) then = now.subtract(when, 'day');
		if (!isPast) then = now.add(when, 'day');
		if (format) return then.format(format);
		if (!format) return then.toISOString();
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


function fakeIp() {
	var ip = chance.ip();
	return ip;
}

function integer(min, max) {
	if (min > max) {
		return chance.integer({
			min: max,
			max: min
		});
	}

	return chance.integer({
		min: min,
		max: max
	});
}

function makeProducts() {
	let categories = ["Device Accessories", "eBooks", "Automotive & Powersports", "Baby Products (excluding apparel)", "Beauty", "Books", "Camera & Photo", "Cell Phones & Accessories", "Collectible Coins", "Consumer Electronics", "Entertainment Collectibles", "Fine Art", "Grocery & Gourmet Food", "Health & Personal Care", "Home & Garden", "Independent Design", "Industrial & Scientific", "Accessories", "Major Appliances", "Music", "Musical Instruments", "Office Products", "Outdoors", "Personal Computers", "Pet Supplies", "Software", "Sports", "Sports Collectibles", "Tools & Home Improvement", "Toys & Games", "Video, DVD & Blu-ray", "Video Games", "Watches"];
	let slugs = ['/sale/', '/featured/', '/home/', '/search/', '/wishlist/', '/'];
	let assetExtention = ['.png', '.jpg', '.jpeg', '.heic', '.mp4', '.mov', '.avi'];
	let data = [];
	let numOfItems = integer(1, 12);

	for (var i = 0; i < numOfItems; i++) {

		let category = chance.pickone(categories);
		let slug = chance.pickone(slugs);
		let asset = chance.pickone(assetExtention);
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

function range(min, max, size = 100, skew = 1) {
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

	return {
		$name,
		$email,
		$avatar,
		$created
	};
}




module.exports = {
	range,
	pick,
	day,
	fakeIp,
	integer,
	makeProducts,
	date,
	progress,
	person,
	choose
};