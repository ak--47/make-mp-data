import main from "./index.js";
// import funnels from "./schemas/funnels.js";
import amir from './customers/amir.js'

/** @type {main.Config} */
const spec = {
	...amir,
	// numUsers: 500,
	writeToDisk: false,
	// numEvents: 10000,
	verbose: true,

};

const { eventData, groupProfilesData, lookupTableData, mirrorEventData, scdTableData, userProfilesData } = await main(spec);

debugger;