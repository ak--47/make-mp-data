const generate = require('../index.js');
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const u = require('ak-tools');
dayjs.extend(utc);
const { timeSoup } = generate;
require('dotenv').config();


describe('timeSoup', () => {
	test('always positive dates', () => {
		const dates = [];
		for (let i = 0; i < 10000; i++) {
			const earliest = dayjs().subtract(u.rand(2, 360), 'D');
			dates.push(timeSoup());
		}
		const tooOld = dates.filter(d => dayjs(d).isBefore(dayjs.unix(0)));
		const badYear = dates.filter(d => !d.startsWith('202'));
		expect(dates.every(d => dayjs(d).isAfter(dayjs.unix(0)))).toBe(true);
		expect(dates.every(d => d.startsWith('202'))).toBe(true);

	});
});
