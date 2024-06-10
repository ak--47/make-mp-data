import main from "./index.js";
import { generateLineChart } from './chart.js';
import { TimeSoup } from './utils.js';
import dayjs from 'dayjs';
import simple from './schemas/simple.js';
import { progress } from 'ak-tools';
import TEST_CASES from './soupTestCases.js';
import Chance from 'chance';
const chance = new Chance('hello');



/**
 * 
 */
async function genViz(soup) {
	// const { amplitude, dev, frequency, index, mean, noise, points, skew, name } = soup;
	const data = [];
	const start = dayjs().subtract(90, 'd').unix();
	const end = dayjs().unix();
	for (let i = 0; i < 100_000; i++) {
		progress('processing', i);
		const time = TimeSoup(start, end);
		// const time = generateTimestamp(start, end);
		data.push({ time });
	}

	const chart = await generateLineChart(data, [], soup.name);
	return chart;
}

// await genViz(TEST_CASES[0]);

// await Promise.all(TEST_CASES.map(genViz));








/** @type {main.Config} */
const spec = {
	...simple,
	writeToDisk: false,
	verbose: true,
	makeChart: true,
	soup: {
		peaks: 5,
		dev:4

	}

};



const { eventData, groupProfilesData, lookupTableData, mirrorEventData, scdTableData, userProfilesData, importResults } = await main(spec);
// debugger;