const Chance = require("chance");
const chance = new Chance();
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const { integer } = require('./utils');
const NOW = dayjs().unix();

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

/**
 * Essentially, a timestamp generator with a twist
 * @param {number} [earliestTime] - The earliest timestamp in Unix format.
 * @param {number} [latestTime] - The latest timestamp in Unix format.
 * @param {Array} [peakDays] - Array of Unix timestamps representing the start of peak days.
 * @returns {string} - The generated event timestamp in Unix format.
 */
function AKsTimeSoup(earliestTime, latestTime = NOW, peakDays = PEAK_DAYS) {
	let iterations = 0;
	let chosenTime;
	let eventTime;
	let validTime = false;
	const { epochStart = 0, epochEnd = 0 } = global.MP_SIMULATION_CONFIG || {};
	if (!earliestTime) earliestTime = NOW - (60 * 60 * 24 * 30); // 30 days ago
	if (typeof earliestTime !== "number") {
		if (parseInt(earliestTime) > 0) earliestTime = parseInt(earliestTime);
		if (dayjs(earliestTime).isValid()) earliestTime = dayjs(earliestTime).unix();
	}

	// just choose a random time
	if (chance.bool({ likelihood: 36 })) {
		chosenTime = dayjs.unix(integer(earliestTime, latestTime)).toISOString();
	}

	// 10% of the time, choose a time more towards the middle of the range
	if (chance.bool({ likelihood: 20 })) {
		chosenTime = dayjs.unix(integer(earliestTime * 2, latestTime / 2)).toISOString();
	}

	// 5% of the time, choose a time more towards the end or beginning
	if (chance.bool({ likelihood: 15 })) {
		const isEarly = chance.bool({ likelihood: 50 });
		if (isEarly) {
			chosenTime = dayjs.unix(integer(earliestTime, earliestTime * integer(2, 5))).toISOString();
		} else {
			chosenTime = dayjs.unix(integer(latestTime / integer(2, 5), latestTime)).toISOString();
		}
	}

	// Ensure the chosen time is valid
	if (chosenTime) {
		if (dayjs(chosenTime).unix() > earliestTime) {
			if (dayjs(chosenTime).unix() < (latestTime - (60 * 15))) {
				return chosenTime;
			}
		}
	}

	while (!validTime) {
		iterations++;
		// Define business hours
		const peakStartHour = 4; // 4 AM
		const peakEndHour = 23; // 11 PM

		// Smooth out the likelihood of peak days
		const likelihoodOfPeakDay = 70; // Reduced likelihood for peak days
		const likelihoodOfAdjacentDay = 30; // Increased likelihood for adjacent days

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
		// Time checks
		if (eventTime > 0) validTime = true;
		const parsedTime = dayjs.unix(eventTime).toISOString();
		if (!parsedTime.startsWith('20')) validTime = false;
		if (eventTime >= (latestTime - (60 * 15))) validTime = false;
		if (epochEnd && eventTime >= epochEnd) validTime = false;
		if (eventTime < earliestTime) validTime = false;
		if (epochStart && eventTime <= epochStart) validTime = false;
		if (iterations > 1000) debugger;

	}
	chosenTime = dayjs.unix(eventTime).toISOString();

	// Should never get here
	if (eventTime < 0) debugger;
	if (!chosenTime.startsWith('20')) debugger;
	if (epochEnd && eventTime >= epochEnd) debugger;
	if (epochStart && eventTime <= epochStart) debugger;

	return chosenTime;
}

module.exports = AKsTimeSoup;
