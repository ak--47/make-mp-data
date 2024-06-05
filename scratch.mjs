import main from "./index.js";
import funnels from "./schemas/funnels.js";

/** @type {main.Config} */
const spec = {
	...funnels,
	numUsers: 100,
	writeToDisk: false,
	numEvents: 10000,

};

const { eventData, groupProfilesData, lookupTableData, mirrorEventData, scdTableData, userProfilesData } = await main(spec);

debugger;