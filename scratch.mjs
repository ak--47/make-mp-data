import main from "./index.js";
import amir from './customers/amir.js';
import simple from './schemas/simple.js';
import funnels from './schemas/funnels.js';
import foobar from './schemas/foobar.js';
import complex from './schemas/complex.js';
import deepNest from './schemas/deepNest.js';
import execSync from 'child_process';


/** @type {main.Config} */
const spec = {	
	...funnels,	
	writeToDisk: false,
	verbose: true,
	makeChart: false,	
};


execSync.execSync('npm run prune');
const { eventData, groupProfilesData, lookupTableData, mirrorEventData, scdTableData, userProfilesData, importResults } = await main(spec);
debugger;