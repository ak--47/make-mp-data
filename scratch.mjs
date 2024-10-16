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

import simple from './dungeons/simple.js';
import funnels from './dungeons/funnels.js';
import foobar from './dungeons/foobar.js';
import complex from './dungeons/complex.js';
import adspend from './dungeons/adspend.js'

import anon from './dungeons/anon.js';
import execSync from 'child_process';
import mirror from './dungeons/mirror.js'
// import mds from './dungeons/modern-data-stack.js'
import big from './dungeons/big.js'

const numEvents = 1000;

/** @type {main.Config} */
const spec = {
	...big,
	writeToDisk: true,
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