const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
require('dotenv').config();
const { integer } = require('./utils');
const u = require('./utils.js');


const PEAK_DAYS = [
	dayjs().subtract(2, "day").unix(),
	dayjs().subtract(3, "day").unix(),
	dayjs().subtract(5, "day").unix(),
	dayjs().subtract(7, "day").unix(),
	dayjs().subtract(11, "day").unix(),
	dayjs().subtract(13, "day").unix(),
	dayjs().subtract(17, "day").unix(),
	dayjs().subtract(19, "day").unix(),
	dayjs().subtract(23, "day").unix(),
	dayjs().subtract(29, "day").unix(),
];

// THIS NEEDS TO BE REFACTORED... CODE IS A MESS

/**
 * Essentially, a timestamp generator with a twist
 * @param {number} [earliestTime] - The earliest timestamp in Unix format.
 * @param {number} [latestTime] - The latest timestamp in Unix format.
 * @param {Array} [peakDays] - Array of Unix timestamps representing the start of peak days.
 * @returns {string} - The generated event timestamp in Unix format.
 */
function AKsTimeSoup(earliestTime, latestTime = global.NOW, peakDays = PEAK_DAYS) {
	let iterations = 0;
	let chosenTime;
	let eventTime;
	let validTime = false;
	const chance = u.getChance();

	// just choose a random time
	if (chance.bool({ likelihood: 40 })) {
		chosenTime = dayjs.unix(integer(earliestTime, latestTime)).toISOString();
	}

	if (chance.bool({ likelihood: 20 })) {
		chosenTime = dayjs.unix(integer(earliestTime * 2, latestTime / 2)).toISOString();
	}

	if (chance.bool({ likelihood: 20 })) {
		chosenTime = dayjs.unix(integer(earliestTime, earliestTime + (integer(2, 14) * 60 * 60 * 24))).toISOString();
	}

	// Ensure the chosen time is valid
	if (chosenTime) {
		if (isValidTime(chosenTime, earliestTime, latestTime)) {
			return chosenTime;
		}
	}

	while (!validTime) {
		iterations++;
		if (iterations > 1000) {
			const [early, late] = fixFunkyTime(earliestTime, latestTime);
			earliestTime = early;
			latestTime = late;
		}
		const delta = latestTime - earliestTime;
		if (delta < 60 * 60 * 24 * 2) {
			eventTime = integer(earliestTime, latestTime);
		}
		else {
			// Define business hours
			const peakStartHour = 4; // 4 AM
			const peakEndHour = 23; // 11 PM

			// Smooth out the likelihood of peak days
			const likelihoodOfPeakDay = 20; // Reduced likelihood for peak days
			const likelihoodOfAdjacentDay = 15; // Increased likelihood for adjacent days

			// Select a day, with a preference for peak days
			let selectedDay;
			if (chance.bool({ likelihood: likelihoodOfPeakDay })) {
				selectedDay = peakDays.length > 0 ? chance.pickone(peakDays) : integer(earliestTime, latestTime);
			} else if (chance.bool({ likelihood: likelihoodOfAdjacentDay })) {
				selectedDay = chance.pickone(peakDays.map(day => dayjs.unix(day).add(chance.pickone([-1, 1]), 'day').unix()));
			} else {
				selectedDay = integer(earliestTime, latestTime);
			}

			// Normalize selectedDay to the start of the day
			selectedDay = dayjs.unix(selectedDay).startOf('day').unix();

			// Generate a random time within business hours with a higher concentration in the middle of the period
			const businessStart = dayjs.unix(selectedDay).hour(peakStartHour).minute(0).second(0).unix();
			const businessEnd = dayjs.unix(selectedDay).hour(peakEndHour).minute(0).second(0).unix();

			// Use a skewed distribution for peak days and adjacent days
			if (chance.bool({ likelihood: 50 })) {
				eventTime = chance.normal({ mean: (businessEnd + businessStart) / 2, dev: (businessEnd - businessStart) / 4 });
			} else {
				eventTime = integer(businessStart, businessEnd);
			}

			// Ensure the event time is within business hours
			if (chance.bool({ likelihood: 42 })) eventTime = Math.min(Math.max(eventTime, businessStart), businessEnd);
			eventTime = Math.floor(eventTime);
			if (iterations > 10000) eventTime = integer(earliestTime, latestTime);
		}
		validTime = isValidTime(eventTime, earliestTime, latestTime);

	}
	chosenTime = dayjs.unix(eventTime).toISOString();

	// Should never get here
	if (eventTime < 0) debugger;
	if (!chosenTime.startsWith('20')) debugger;
	return chosenTime;
}


function fixFunkyTime(earliestTime, latestTime) {
	if (!earliestTime) earliestTime = global.NOW - (60 * 60 * 24 * 30); // 30 days ago
	if (typeof earliestTime !== "number") {
		if (parseInt(earliestTime) > 0) earliestTime = parseInt(earliestTime);
		if (dayjs(earliestTime).isValid()) earliestTime = dayjs(earliestTime).unix();
	}
	if (typeof latestTime !== "number") latestTime = global.NOW;
	if (typeof latestTime === "number" && latestTime > global.NOW) latestTime = global.NOW;
	if (earliestTime > latestTime) {
		const tempEarlyTime = earliestTime;
		const tempLateTime = latestTime;
		earliestTime = tempLateTime;
		latestTime = tempEarlyTime;
	}
	if (earliestTime === latestTime) {
		earliestTime = dayjs.unix(earliestTime)
			.subtract(u.integer(1, 14), "day")
			.subtract(u.integer(1, 23), "hour")
			.subtract(u.integer(1, 59), "minute")
			.subtract(u.integer(1, 59), "second")
			.unix();
	}
	return [earliestTime, latestTime];

}

function isValidTime(chosenTime, earliestTime, latestTime) {
	if (!earliestTime) earliestTime = global.NOW - (60 * 60 * 24 * 30); // 30 days ago
	if (!latestTime) latestTime = global.NOW;

	const parsedTime = typeof chosenTime === "number" ? dayjs.unix(chosenTime) : dayjs(chosenTime);
	const unixTime = parsedTime.unix();
	if (unixTime > 0) {
		if (unixTime > earliestTime) {
			if (unixTime < (latestTime - (60 * 2))) {
				if (parsedTime.toISOString().startsWith('20')) {
					return true;
				}
			}

		}
	}
	return false;
}

module.exports = AKsTimeSoup;
