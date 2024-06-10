import main from "./index.js";
import simple from './schemas/simple.js';
import execSync from 'child_process';


/** @type {main.Config} */
const spec = {	
	...simple,
	numUsers: 50_000 / 2,
	numEvents: 1_000_000 / 2,
	writeToDisk: false,
	verbose: true,
	makeChart: false,
	soup: {
		deviation: 2,
		mean: 0,
		peaks: 5
	},
	"token": "8ee01204e3def8c12e51d6735fa73138",

};


execSync.execSync('npm run prune');
const { eventData, groupProfilesData, lookupTableData, mirrorEventData, scdTableData, userProfilesData, importResults } = await main(spec);
debugger;