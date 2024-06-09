import main from "./index.js";
// import funnels from "./schemas/funnels.js";
import amir from './customers/amir.js';

/** @type {main.Config} */
const spec = {
	...amir,
	numUsers: 5_000,
	writeToDisk: false,
	numEvents: 200_000,
	verbose: true,

};

// await Promise.all([

// 	// default
// 	main({ ...spec, "makeChart": "DEFAULT" }),

// 	// then larger than 1
// 	main({ ...spec, amp: 2.5, "makeChart": "amplitude-2.5" }),
// 	main({ ...spec, freq: 2.5, "makeChart": "frequency2.5" }),
// 	main({ ...spec, skew: 2.5, "makeChart": "skew2.5" }),
// 	main({ ...spec, noise: 2.5, "makeChart": "noise2.5" }),

// 	//then smaller than 1
// 	main({ ...spec, amp: 0.5, "makeChart": "amplitude-0.5" }),
// 	main({ ...spec, freq: 0.5, "makeChart": "frequency-0.5" }),
// 	main({ ...spec, skew: 0.5, "makeChart": "skew-0.5" }),
// 	main({ ...spec, noise: 0.5, "makeChart": "noise-0.5" }),

// 	//then huge
// 	main({ ...spec, amp: 10, "makeChart": "amplitude-10" }),
// 	main({ ...spec, freq: 10, "makeChart": "frequency-10" }),
// 	main({ ...spec, skew: 10, "makeChart": "skew-10" }),
// 	main({ ...spec, noise: 10, "makeChart": "noise-10" }),

// 	//then tiny
// 	main({ ...spec, amp: 0.1, "makeChart": "amplitude-0.1" }),
// 	main({ ...spec, freq: 0.1, "makeChart": "frequency-0.1" }),
// 	main({ ...spec, skew: 0.1, "makeChart": "skew-0.1" }),
// 	main({ ...spec, noise: 0.1, "makeChart": "noise-0.1" }),


// 	//then set them all to strange values
// 	main({ ...spec, amp: 1, freq: 1, skew: 1, noise: 1, "makeChart": "all-1" }),
// 	main({ ...spec, amp: 0.1, freq: 0.1, skew: 0.1, noise: 0.1, "makeChart": "all-0.1" }),
// 	main({ ...spec, amp: 10, freq: 10, skew: 10, noise: 10, "makeChart": "all-10" }),

// 	//big freq, small skew
// 	main({ ...spec, freq: 10, skew: 0.1, "makeChart": "freq-10-skew-0.1" }),
// 	main({ ...spec, freq: 10, skew: 0.5, "makeChart": "freq-10-skew-0.5" }),
// 	main({ ...spec, freq: 10, skew: 0.9, "makeChart": "freq-10-skew-0.9" }),

// 	//big freq, big skew
// 	main({ ...spec, freq: 10, skew: 10, "makeChart": "freq-10-skew-10" }),
// 	main({ ...spec, freq: 10, skew: 5, "makeChart": "freq-10-skew-5" }),
// 	main({ ...spec, freq: 10, skew: 2, "makeChart": "freq-10-skew-2" }),

// 	//small freq, small skew
// 	main({ ...spec, freq: 0.1, skew: 0.1, "makeChart": "freq-0.1-skew-0.1" }),
// 	main({ ...spec, freq: 0.1, skew: 0.5, "makeChart": "freq-0.1-skew-0.5" }),
// 	main({ ...spec, freq: 0.1, skew: 0.9, "makeChart": "freq-0.1-skew-0.9" }),

// 	//small freq, big skew
// 	main({ ...spec, freq: 0.1, skew: 10, "makeChart": "freq-0.1-skew-10" }),
// 	main({ ...spec, freq: 0.1, skew: 5, "makeChart": "freq-0.1-skew-5" }),
// 	main({ ...spec, freq: 0.1, skew: 2, "makeChart": "freq-0.1-skew-2" }),

// ]);



const { eventData, groupProfilesData, lookupTableData, mirrorEventData, scdTableData, userProfilesData, importResults } = await main(spec);
// debugger;