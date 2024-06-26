/*
----
TO DOs
----
*/

//!feature: fixedTimeFunnel? if set this funnel will occur for all users at the same time ['cards charged', 'charge complete']
//!feature: churn ... is churnFunnel, possible to return, etc
//!feature: send SCD data to mixpanel (blocked on dev)
//!feature: send and map lookup tables to mixpanel (also blocked on dev)
//!bug: using --mc flag reverts to --complex for some reason


import main from "../../index.js";
import simple from '../../schemas/simple.js';

/** @typedef {import('../../types').Config} Config */

/** @type {Config} */
const noWrites = {
	...simple,
	numUsers: 10_000,
	numEvents: 250_000,
	writeToDisk: false,
};

/** @type {Config} */
const yesWrites = {
	...noWrites,
	writeToDisk: true
};

console.log('concurrency benchmarking');

const concurrency = [1, 2, 3, 4, 5];

const results = [];
for (const concurrent of concurrency) {
	console.log(`concurrency: ${concurrent}`);
	// @ts-ignore
	const test = await main({ ...noWrites, concurrency: concurrent });
	results.push({ human: test.time.human, concurrency: concurrent });
	console.log(`\t\tdone: ${test.time.human}\n\n`);
}

const display = results.map((r) => {
	return `concurrency: ${r.concurrency} | duration: ${r.human}`;
});

console.log(display.join('\n\n'));

debugger;