#! /usr/bin/env node


/*
make fake mixpanel data easily!
by AK 
ak@mixpanel.com
*/

const RUNTIME = process.env.RUNTIME || "unspecified";
const mp = require("mixpanel-import");
const path = require("path");
const Chance = require("chance");
const chance = new Chance();
const { touch, comma, bytesHuman, mkdir } = require("ak-tools");
const Papa = require("papaparse");
const u = require("./utils.js");
const AKsTimeSoup = require("./timesoup.js");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const cliParams = require("./cli.js");
const { makeName, md5, clone } = require('ak-tools');
const NOW = dayjs().unix();
let VERBOSE = false;

/** @typedef {import('./types.d.ts').Config} Config */
/** @typedef {import('./types.d.ts').EventConfig} EventConfig */

/**
 * generates fake mixpanel data
 * @param  {Config} config
 */
async function main(config) {
	let {
		seed = "every time a rug is micturated upon in this fair city...",
		numEvents = 100000,
		numUsers = 1000,
		numDays = 30,
		events = [{ event: "foo" }, { event: "bar" }, { event: "baz" }],
		superProps = { platform: ["web", "iOS", "Android"] },
		userProps = {
			favoriteColor: ["red", "green", "blue", "yellow"],
			spiritAnimal: chance.animal.bind(chance),
		},
		scdProps = {},
		mirrorProps = {},
		groupKeys = [],
		groupProps = {},
		lookupTables = [],
		anonIds = true,
		sessionIds = true,
		format = "csv",
		token = null,
		region = "US",
		writeToDisk = false,
		verbose = false,
		hook = (record) => record,
	} = config;
	VERBOSE = verbose;
	config.simulationName = makeName();
	global.MP_SIMULATION_CONFIG = config;
	const uuidChance = new Chance(seed);
	log(`------------------SETUP------------------`);
	log(`\nyour data simulation will heretofore be known as: \n\n\t${config.simulationName.toUpperCase()}...\n`);
	log(`and your configuration is:\n\n`, JSON.stringify({ seed, numEvents, numUsers, numDays, format, token, region, writeToDisk }, null, 2));
	log(`------------------SETUP------------------`, "\n");


	//the function which generates $distinct_id + $anonymous_ids, $session_ids, and $created, skewing towards the present
	function generateUser() {
		const distinct_id = uuidChance.guid();
		let z = u.boxMullerRandom();
		const skew = chance.normal({ mean: 10, dev: 3 });
		z = u.applySkew(z, skew);

		// Scale and shift the normally distributed value to fit the range of days
		const maxZ = u.integer(2, 4);
		const scaledZ = (z / maxZ + 1) / 2;
		const daysAgoBorn = Math.round(scaledZ * (numDays - 1)) + 1;

		return {
			distinct_id,
			...u.person(daysAgoBorn),
		};
	}

	// weigh events for random selection
	const weightedEvents = events
		.reduce((acc, event) => {
			const weight = event.weight || 1;
			for (let i = 0; i < weight; i++) {

				acc.push(event);
			}
			return acc;
		}, [])

		.filter((e) => !e.isFirstEvent);

	const firstEvents = events.filter((e) => e.isFirstEvent);
	const eventData = enrichArray([], { hook, type: "event", config });
	const userProfilesData = enrichArray([], { hook, type: "user", config });
	let scdTableData = enrichArray([], { hook, type: "scd", config });
	const groupProfilesData = enrichArray([], { hook, type: "groups", config });
	const lookupTableData = enrichArray([], { hook, type: "lookups", config });
	const avgEvPerUser = Math.floor(numEvents / numUsers);

	//user loop
	log(`---------------SIMULATION----------------`, "\n\n");
	for (let i = 1; i < numUsers + 1; i++) {
		u.progress("users", i);
		const user = generateUser();
		const { distinct_id, $created, anonymousIds, sessionIds } = user;
		userProfilesData.hPush(makeProfile(userProps, user));
		const mutations = chance.integer({ min: 1, max: 10 });
		scdTableData.hPush(makeSCD(scdProps, distinct_id, mutations, $created));
		const numEventsThisUser = Math.round(
			chance.normal({ mean: avgEvPerUser, dev: avgEvPerUser / u.integer(3, 7) })
		);

		if (firstEvents.length) {
			eventData.hPush(
				makeEvent(
					distinct_id,
					anonymousIds,
					sessionIds,
					dayjs($created).unix(),
					firstEvents,
					superProps,
					groupKeys,
					true
				)
			);
		}

		//event loop
		for (let j = 0; j < numEventsThisUser; j++) {
			eventData.hPush(
				makeEvent(
					distinct_id,
					anonymousIds,
					sessionIds,
					dayjs($created).unix(),
					weightedEvents,
					superProps,
					groupKeys
				)
			);
		}
	}

	//flatten SCD
	scdTableData = scdTableData.flat();

	log("\n");

	// make group profiles
	for (const groupPair of groupKeys) {
		const groupKey = groupPair[0];
		const groupCardinality = groupPair[1];
		const groupProfiles = [];
		for (let i = 1; i < groupCardinality + 1; i++) {
			u.progress("groups", i);
			const group = {
				[groupKey]: i,
				...makeProfile(groupProps[groupKey]),
				// $distinct_id: i,
			};
			groupProfiles.push(group);
		}
		groupProfilesData.hPush({ key: groupKey, data: groupProfiles });
	}
	log("\n");

	// make lookup tables
	for (const lookupTable of lookupTables) {
		const { key, entries, attributes } = lookupTable;
		const data = [];
		for (let i = 1; i < entries + 1; i++) {
			u.progress("lookups", i);
			const item = {
				[key]: i,
				...makeProfile(attributes),
			};
			data.push(item);
		}
		lookupTableData.hPush({ key, data });
	}

	// deal with mirror props
	let mirrorEventData = [];
	const mirrorPropKeys = Object.keys(mirrorProps);
	if (mirrorPropKeys.length) {
		mirrorEventData = clone(eventData);
		for (const row of mirrorEventData) {
			for (const key of mirrorPropKeys) {
				if (mirrorProps[key]?.events?.includes(row?.event)) row[key] = u.choose(mirrorProps[key]?.values);				
				if (mirrorProps[key]?.events === "*") row[key] = u.choose(mirrorProps[key]?.values);
			}
		}
	}

	const { eventFiles, userFiles, scdFiles, groupFiles, lookupFiles, mirrorFiles, folder } =
		buildFileNames(config);
	const pairs = [
		[eventFiles, eventData],
		[userFiles, userProfilesData],
		[scdFiles, scdTableData],
		[groupFiles, groupProfilesData],
		[lookupFiles, lookupTableData],
		[mirrorFiles, mirrorEventData],
	];
	log("\n");
	log(`---------------SIMULATION----------------`, "\n");

	if (!writeToDisk && !token) {
		return {
			eventData,
			userProfilesData,
			scdTableData,
			groupProfilesData,
			lookupTableData,
			mirrorEventData,
			import: {},
			files: []
		};
	}
	log(`-----------------WRITES------------------`, `\n\n`);
	//write the files
	if (writeToDisk) {
		if (verbose) log(`writing files... for ${config.simulationName}`);
		loopFiles: for (const pair of pairs) {
			const [paths, data] = pair;
			if (!data.length) continue loopFiles;
			for (const path of paths) {
				let datasetsToWrite;
				if (data?.[0]?.["key"]) datasetsToWrite = data.map((d) => d.data);
				else datasetsToWrite = [data];
				for (const writeData of datasetsToWrite) {
					//if it's a lookup table, it's always a CSV
					if (format === "csv" || path.includes("-LOOKUP.csv")) {
						log(`\twriting ${path}`);
						const columns = u.getUniqueKeys(writeData);
						//papa parse needs nested JSON stringified
						writeData.forEach((e) => {
							for (const key in e) {
								if (typeof e[key] === "object") e[key] = JSON.stringify(e[key]);
							}
						});
						const csv = Papa.unparse(writeData, { columns });
						await touch(path, csv);
					} else {
						const ndjson = data.map((d) => JSON.stringify(d)).join("\n");
						await touch(path, ndjson, false);
					}
				}
			}
		}
	}

	const importResults = { events: {}, users: {}, groups: [] };

	//send to mixpanel
	if (token) {
		/** @type {import('mixpanel-import').Creds} */
		const creds = { token };
		/** @type {import('mixpanel-import').Options} */
		const commonOpts = {

			region,
			fixData: true,
			verbose: false,
			forceStream: true,
			strict: false,
			dryRun: false,
			abridged: false,
		};

		if (eventData) {
			log(`importing events to mixpanel...`);
			const imported = await mp(creds, eventData, {
				recordType: "event",
				fixData: true,
				fixJson: true,
				strict: false,
				...commonOpts,
			});
			log(`\tsent ${comma(imported.success)} events\n`);
			importResults.events = imported;
		}
		if (userProfilesData) {
			log(`importing user profiles to mixpanel...`);
			const imported = await mp(creds, userProfilesData, {
				recordType: "user",
				...commonOpts,
			});
			log(`\tsent ${comma(imported.success)} user profiles\n`);
			importResults.users = imported;
		}
		if (groupProfilesData) {
			for (const groupProfiles of groupProfilesData) {
				const groupKey = groupProfiles.key;
				const data = groupProfiles.data;
				log(`importing ${groupKey} profiles to mixpanel...`);
				const imported = await mp({ token, groupKey }, data, {
					recordType: "group",
					...commonOpts,
				});
				log(`\tsent ${comma(imported.success)} ${groupKey} profiles\n`);

				importResults.groups.push(imported);
			}
		}

	}
	log(`\n-----------------WRITES------------------`, "\n");
	return {
		import: importResults,
		files: [eventFiles, userFiles, scdFiles, groupFiles, lookupFiles, mirrorFiles, folder],
	};
}




function makeProfile(props, defaults) {
	//build the spec
	const profile = {
		...defaults,
	};

	for (const key in props) {
		try {
			profile[key] = u.choose(props[key]);
		} catch (e) {
			// debugger;
		}
	}

	return profile;
}

function makeSCD(props, distinct_id, mutations, $created) {
	if (JSON.stringify(props) === "{}") return [];
	const scdEntries = [];
	let lastInserted = dayjs($created);
	const deltaDays = dayjs().diff(lastInserted, "day");

	for (let i = 0; i < mutations; i++) {
		if (lastInserted.isAfter(dayjs())) break;
		const scd = makeProfile(props, { distinct_id });
		scd.startTime = lastInserted.toISOString();
		lastInserted = lastInserted.add(u.integer(1, 1000), "seconds");
		scd.insertTime = lastInserted.toISOString();
		scdEntries.push({ ...scd });
		lastInserted = lastInserted
			.add(u.integer(0, deltaDays), "day")
			.subtract(u.integer(1, 1000), "seconds");
	}

	return scdEntries;
}

/**
 * creates a random event
 * @param  {string} distinct_id
 * @param  {string[]} anonymousIds
 * @param  {string[]} sessionIds
 * @param  {number} earliestTime
 * @param  {Object[]} events
 * @param  {Object} superProps
 * @param  {Object} groupKeys
 * @param  {Boolean} isFirstEvent=false
 */
function makeEvent(distinct_id, anonymousIds, sessionIds, earliestTime, events, superProps, groupKeys, isFirstEvent = false) {
	let chosenEvent = chance.pickone(events);

	//allow for a string shorthand
	if (typeof chosenEvent === "string") {
		chosenEvent = { event: chosenEvent, properties: {} };
	}

	//event model
	const event = {
		event: chosenEvent.event,
		$source: "AKsTimeSoup",
	};

	//event time
	if (isFirstEvent) event.time = dayjs.unix(earliestTime).toISOString();
	if (!isFirstEvent) event.time = AKsTimeSoup(earliestTime, NOW);

	// anonymous and session ids
	if (global.MP_SIMULATION_CONFIG?.anonIds) event.$device_id = chance.pickone(anonymousIds);
	if (global.MP_SIMULATION_CONFIG?.sessionIds) event.$session_id = chance.pickone(sessionIds);

	//sometimes have a $user_id
	if (!isFirstEvent && chance.bool({ likelihood: 42 })) event.$user_id = distinct_id;

	// ensure that there is a $user_id or $device_id
	if (!event.$user_id && !event.$device_id) event.$user_id = distinct_id;

	const props = { ...chosenEvent.properties, ...superProps };

	//iterate through custom properties
	for (const key in props) {
		try {
			event[key] = u.choose(props[key]);
		} catch (e) {
			console.error(`error with ${key} in ${chosenEvent.event} event`, e);
			debugger;
		}
	}

	//iterate through groups
	for (const groupPair of groupKeys) {
		const groupKey = groupPair[0];
		const groupCardinality = groupPair[1];

		event[groupKey] = u.pick(u.weightedRange(1, groupCardinality));
	}

	//make $insert_id
	event.$insert_id = md5(JSON.stringify(event));

	return event;
}

function buildFileNames(config) {
	const { format = "csv", groupKeys = [], lookupTables = [] } = config;
	const extension = format === "csv" ? "csv" : "json";
	// const current = dayjs.utc().format("MM-DD-HH");
	const simName = config.simulationName;
	let writeDir = "./";
	if (config.writeToDisk) writeDir = mkdir("./data");

	const writePaths = {
		eventFiles: [path.join(writeDir, `${simName}-EVENTS.${extension}`)],
		userFiles: [path.join(writeDir, `${simName}-USERS.${extension}`)],
		scdFiles: [path.join(writeDir, `${simName}-SCD.${extension}`)],
		mirrorFiles: [path.join(writeDir, `${simName}-MIRROR-FUTURE.${extension}`)],
		groupFiles: [],
		lookupFiles: [],
		folder: writeDir,
	};

	for (const groupPair of groupKeys) {
		const groupKey = groupPair[0];
		writePaths.groupFiles.push(
			path.join(writeDir, `${simName}-${groupKey}-GROUP.${extension}`)
		);
	}

	for (const lookupTable of lookupTables) {
		const { key } = lookupTable;
		writePaths.lookupFiles.push(
			//lookups are always CSVs
			path.join(writeDir, `${simName}-${key}-LOOKUP.csv`)
		);
	}

	return writePaths;
}


function enrichArray(arr = [], opts = {}) {
	const { hook = a => a, type = "", config = {} } = opts;

	function transformThenPush(item) {
		return arr.push(hook(item, type, config));
	}

	arr.hPush = transformThenPush;

	return arr;
};



// this is for CLI
if (require.main === module) {
	const args = cliParams();
	const { token, seed, format, numDays, numUsers, numEvents, region, writeToDisk, complex = false } = args;
	const suppliedConfig = args._[0];

	//if the user specifics an separate config file
	//todo this text isn't displaying
	let config = null;
	if (suppliedConfig) {
		console.log(`using ${suppliedConfig} for data\n`);
		config = require(path.resolve(suppliedConfig));
	}
	else {
		if (complex) {
			console.log(`... using default COMPLEX configuration [everything] ...\n`);
			console.log(`... for more simple data, don't use the --complex flag ...\n`);
			console.log(`... or specify your own js config file (see docs or --help) ...\n`);
			config = require(path.resolve(__dirname, "./models/complex.js"));
		}
		else {
			console.log(`... using default SIMPLE configuration [events + users] ...\n`);
			console.log(`... for more complex data, use the --complex flag ...\n`);
			config = require(path.resolve(__dirname, "./models/simple.js"));
		}
	}

	//override config with cli params
	if (token) config.token = token;
	if (seed) config.seed = seed;
	if (format) config.format = format;
	if (numDays) config.numDays = numDays;
	if (numUsers) config.numUsers = numUsers;
	if (numEvents) config.numEvents = numEvents;
	if (region) config.region = region;
	if (writeToDisk) config.writeToDisk = writeToDisk;
	if (writeToDisk === 'false') config.writeToDisk = false;
	config.verbose = true;

	main(config)
		.then((data) => {
			log(`-----------------SUMMARY-----------------`);
			const d = { success: 0, bytes: 0 };
			const darr = [d];
			const { events = d, groups = darr, users = d } = data.import;
			const files = data.files;
			const folder = files?.pop();
			const groupBytes = groups.reduce((acc, group) => {
				return acc + group.bytes;
			}, 0);
			const groupSuccess = groups.reduce((acc, group) => {
				return acc + group.success;
			}, 0);
			const bytes = events.bytes + groupBytes + users.bytes;
			const stats = {
				events: comma(events.success || 0),
				users: comma(users.success || 0),
				groups: comma(groupSuccess || 0),
				bytes: bytesHuman(bytes || 0),
			};
			if (bytes > 0) console.table(stats);
			log(`\nfiles written to ${folder || "no where; we didn't write anything"} ...`);
			log("  " + files?.flat().join("\n  "));
			log(`\n----------------SUMMARY-----------------\n\n\n`);
		})
		.catch((e) => {
			log(`------------------ERROR------------------`);
			console.error(e);
			log(`------------------ERROR------------------`);
			debugger;
		})
		.finally(() => {
			log("have a wonderful day :)");
			u.openFinder(path.resolve("./data"));
		});
} else {
	main.utils = { ...u };
	main.timeSoup = AKsTimeSoup;
	module.exports = main;
}


function log(...args) {
	if (VERBOSE) console.log(...args);
}