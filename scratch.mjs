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


import main from "./index.js";

import * as execSync from 'child_process';
import simple from './dungeons/simple.js';

const numEvents = 1000;

/** @type {import('./types').Dungeon} */
const spec = {
	...simple,
	numUsers: 10_000,
	numEvents: 100_000,
	// batchSize: 1_000,	
	// writeToDisk: "gs://dungeon_master_4/scratch",
	verbose: true,
	makeChart: false,
	hasAnonIds: true,
	hasSessionIds: true
	// format: "csv",
	// numEvents,
	// numUsers: numEvents / 100,
	
};


execSync.execSync('npm run prune');
const RESULT = await main(spec);
const { 
	eventData,
	groupProfilesData,
	lookupTableData,
	mirrorEventData,
	scdTableData,
	userProfilesData,
	importResults,
	files,
	adSpendData
} = RESULT;


debugger;

