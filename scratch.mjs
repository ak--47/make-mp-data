import main from "./core/index.js";

import simple from './schemas/simple.js';
import funnels from './schemas/funnels.js';
import foobar from './schemas/foobar.js';
import complex from './schemas/complex.js';

import anon from './schemas/anon.js';
import execSync from 'child_process';
import mirror from './schemas/mirror.js'

const numEvents = 1000;

/** @type {main.Config} */
const spec = {
	...mirror,
	writeToDisk: false,
	verbose: true,
	makeChart: false,	
	numEvents,
	numUsers: numEvents / 100,
	
};


execSync.execSync('npm run prune');
const { eventData,
	groupProfilesData,
	lookupTableData,
	mirrorEventData,
	scdTableData,
	userProfilesData,
	importResults,
	files,
	adSpendData
} = await main(spec);
debugger;