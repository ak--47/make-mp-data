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
 * essentially, a timestamp generator with a twist
 * @param {number} [earliestTime] - The earliest timestamp in Unix format.
 * @param {number} [latestTime] - The latest timestamp in Unix format.
 * @param {Array} [peakDays] - Array of Unix timestamps representing the start of peak days.
 * @returns {string} - The generated event timestamp in Unix format.
 */
function AKsTimeSoup(earliestTime, latestTime = NOW, peakDays = PEAK_DAYS) {
	let chosenTime;
	let eventTime;
	let validTime = false;

	if (typeof earliestTime !== "number") {
		if (parseInt(earliestTime) > 0) earliestTime = parseInt(earliestTime);
		if (dayjs(earliestTime).isValid()) earliestTime = dayjs(earliestTime).unix();
	}

	//25% of the time, just choose a random time
	if (chance.bool({ likelihood: 25 })) {
		chosenTime = dayjs.unix(integer(earliestTime, latestTime)).toISOString();
		return chosenTime;
	}

	while (!validTime) {

		// Define business hours
		const peakStartHour = 4; // 4 AM
		const peakEndHour = 23; // 11 PM
		const likelihoodOfPeakDay = integer(integer(integer(1, 42), integer(1, 42)), integer(integer(1, 42), integer(1, 42)));

		// Select a day, with a preference for peak days
		let selectedDay;
		if (chance.bool({ likelihood: likelihoodOfPeakDay })) { // Randomized likelihood to pick a peak day
			selectedDay = peakDays.length > 0 ? chance.pickone(peakDays) : integer(earliestTime, latestTime);
		} else {
			// Introduce minor peaks by allowing some events to still occur during business hours
			selectedDay = chance.bool({ likelihood: integer(1, 42) })
				? chance.pickone(peakDays)
				: integer(earliestTime, latestTime);
		}

		// Normalize selectedDay to the start of the day
		selectedDay = dayjs.unix(selectedDay).startOf('day').unix();

		// Generate a random time within business hours with a higher concentration in the middle of the period
		const businessStart = dayjs.unix(selectedDay).hour(peakStartHour).minute(0).second(0).unix();
		const businessEnd = dayjs.unix(selectedDay).hour(peakEndHour).minute(0).second(0).unix();

		if (selectedDay === peakDays[0]) {
			// Use a skewed distribution for peak days
			eventTime = chance.normal({ mean: (businessEnd + businessStart) / integer(1, 4), dev: (businessEnd - businessStart) / integer(2, 8) });
		} else {
			// For non-peak days, use a uniform distribution to add noise
			eventTime = integer(integer(businessStart, businessEnd), integer(businessStart, businessEnd));
		}

		// usually, ensure the event time is within business hours
		if (chance.bool({ likelihood: 42 })) eventTime = Math.min(Math.max(eventTime, businessStart), businessEnd);

		if (eventTime > 0) validTime = true;
		const parsedTime = dayjs.unix(eventTime).toISOString();
		if (!parsedTime.startsWith('20')) validTime = false;

	}
	chosenTime = dayjs.unix(eventTime).toISOString();

	//should never get here
	if (eventTime < 0) debugger;
	if (!chosenTime.startsWith('20')) debugger;


	return chosenTime;
}


module.exports = AKsTimeSoup;