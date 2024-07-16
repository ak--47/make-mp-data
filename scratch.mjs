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

import simple from './schemas/simple.js';
import funnels from './schemas/funnels.js';
import foobar from './schemas/foobar.js';
import complex from './schemas/complex.js';
import adspend from './schemas/adspend.js'

import anon from './schemas/anon.js';
import execSync from 'child_process';
import mirror from './schemas/mirror.js'
// import mds from './dungeons/modern-data-stack.js'
import big from './schemas/big.js'

const numEvents = 1000;

/** @type {main.Config} */
const spec = {
	...big,
	writeToDisk: true,
	verbose: true,
	makeChart: false,
	// format: "csv",
	// numEvents,
	// numUsers: numEvents / 100,
	
};


execSync.execSync('npm run dev:prine');
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