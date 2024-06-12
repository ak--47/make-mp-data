import main from "./index.js";
import amir from './customers/amir.js';
import simple from './schemas/simple.js';
import funnels from './schemas/funnels.js';
import foobar from './schemas/foobar.js';
import complex from './schemas/complex.js';
import deepNest from './schemas/deepNest.js';
import anon from './schemas/anon.js';
import execSync from 'child_process';


/** @type {main.Config} */
const spec = {
	...complex,
	writeToDisk: false,
	verbose: true,
	makeChart: false,
	numUsers: 500,
	numEvents: 25000,
	numDays: 90,
	token: "4fa8df8bc677bec67162d6ebcc155053"
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