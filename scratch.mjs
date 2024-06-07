import main from "./index.js";
import funnels from "./schemas/funnels.js";

/** @type {main.Config} */
const spec = {
	...funnels,
	numUsers: 1000,
	writeToDisk: false,
	numEvents: 100000,

};

const { eventData, groupProfilesData, lookupTableData, mirrorEventData, scdTableData, userProfilesData } = await main(spec);

debugger;