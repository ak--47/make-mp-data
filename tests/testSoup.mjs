import { generateLineChart } from '../lib/utils/chart.js';
import { TimeSoup } from '../lib/utils/utils.js';
import dayjs from 'dayjs';
import { progress } from 'ak-tools';
import TEST_CASES from './testCases.mjs';

import execSync from 'child_process';

async function genViz(soup) {
	const { mean = 0, deviation = 2, peaks = 5, name } = soup;
	const data = [];
	const start = dayjs().subtract(90, 'd').unix();
	const end = dayjs().unix();
	console.log(`\n\nTEST CASE: ${name}\n\n`);
	for (let i = 0; i < 100_000; i++) {
		progress([['processing', i]]);
		const time = TimeSoup(start, end, peaks, deviation, mean);
		data.push({ time });
	}

	const chart = await generateLineChart(data, [], name);
	return chart;
}

execSync.execSync('npm run prune');
// @ts-ignore
await Promise.all(TEST_CASES.map(genViz));
console.log('done');
