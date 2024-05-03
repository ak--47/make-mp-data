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
const {
	weightedRange,
	pick,
	day,
	integer,
	makeProducts,
	date,
	progress,
	person,
	choose,
	range,
	exhaust,
	openFinder,
	applySkew,
	boxMullerRandom,
	getUniqueKeys
} = require("./utils.js");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const cliParams = require("./cli.js");
const { makeName } = require('ak-tools');

Array.prototype.pickOne = pick;
const NOW = dayjs().unix();
let VERBOSE = false;

/** @typedef {import('./types.d.ts').Config} Config */
/** @typedef {import('./types.d.ts').EventConfig} EventConfig */


const PEAK_DAYS = [
	dayjs().subtract(2, "day").unix(),
	dayjs().subtract(3, "day").unix(),
	dayjs().subtract(5, "day").unix(),
	dayjs().subtract(7, "day").unix(),
	dayjs().subtract(11, "day").unix(),
	dayjs().subtract(13, "day").unix(),
	dayjs().subtract(17, "day").unix(),
	dayjs().subtract(19, "day").unix(),
	dayjs().subtract(23, "day").unix(),
	dayjs().subtract(29, "day").unix(),
];

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
			spiritAnimal: chance.animal,
		},
		scdProps = { NPS: weightedRange(0, 10, 150, 1.6) },
		groupKeys = [],
		groupProps = {},
		lookupTables = [],
		format = "csv",
		token = null,
		region = "US",
		writeToDisk = false,
		verbose = false,
	} = config;
	VERBOSE = verbose;
	config.simulationName = makeName();
	const uuidChance = new Chance(seed);
	log(`------------------SETUP------------------`);
	log(`\nyour data simulation will heretofore be known as: \n\n\t${config.simulationName.toUpperCase()}...\n`);
	log(`and your configuration is:\n`, JSON.stringify({ seed, numEvents, numUsers, numDays, format, token, region, writeToDisk }, null, 2));
	log(`------------------SETUP------------------`, "\n");


	//the function which generates $distinct_id + $created, skewing towards the present
	function uuid() {
		const distinct_id = uuidChance.guid();
		let z = boxMullerRandom();
		const skew = chance.normal({ mean: 10, dev: 3 });
		z = applySkew(z, skew);

		// Scale and shift the normally distributed value to fit the range of days
		const maxZ = integer(2, 4);
		const scaledZ = (z / maxZ + 1) / 2;
		const daysAgoBorn = Math.round(scaledZ * (numDays - 1)) + 1;

		return {
			distinct_id,
			...person(daysAgoBorn),
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
	const eventData = [];
	const userProfilesData = [];
	let scdTableData = [];
	const groupProfilesData = [];
	const lookupTableData = [];
	const avgEvPerUser = Math.floor(numEvents / numUsers);

	//user loop
	log(`---------------SIMULATION----------------`, `\n\n`);
	for (let i = 1; i < numUsers + 1; i++) {
		progress("users", i);
		const user = uuid();
		const { distinct_id, $created, anonymousIds } = user;
		userProfilesData.push(makeProfile(userProps, user));
		const mutations = chance.integer({ min: 1, max: 10 });
		scdTableData.push(makeSCD(scdProps, distinct_id, mutations, $created));
		const numEventsThisUser = Math.round(
			chance.normal({ mean: avgEvPerUser, dev: avgEvPerUser / integer(3, 7) })
		);

		if (firstEvents.length) {
			eventData.push(
				makeEvent(
					distinct_id,
					anonymousIds,
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
			eventData.push(
				makeEvent(
					distinct_id,
					anonymousIds,
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
			progress("groups", i);
			const group = {
				[groupKey]: i,
				...makeProfile(groupProps[groupKey]),
				$distinct_id: i,
			};
			groupProfiles.push(group);
		}
		groupProfilesData.push({ key: groupKey, data: groupProfiles });
	}
	log("\n");

	// make lookup tables
	for (const lookupTable of lookupTables) {
		const { key, entries, attributes } = lookupTable;
		const data = [];
		for (let i = 1; i < entries + 1; i++) {
			progress("lookups", i);
			const item = {
				[key]: i,
				...makeProfile(attributes),
			};
			data.push(item);
		}
		lookupTableData.push({ key, data });
	}
	const { eventFiles, userFiles, scdFiles, groupFiles, lookupFiles, folder } =
		buildFileNames(config);
	const pairs = [
		[eventFiles, eventData],
		[userFiles, userProfilesData],
		[scdFiles, scdTableData],
		[groupFiles, groupProfilesData],
		[lookupFiles, lookupTableData],
	];
	log("\n", `---------------SIMULATION----------------`, "\n");
	
	if (!writeToDisk && !token) {
		return {
			eventData,
			userProfilesData,
			scdTableData,
			groupProfilesData,
			lookupTableData,
		};
	}
	log(`-----------------WRITES------------------`, `\n\n`);
	//write the files
	if (writeToDisk) {
		if (verbose) log(`writing files... for ${config.simulationName}`);
		for (const pair of pairs) {
			const [paths, data] = pair;
			for (const path of paths) {
				let datasetsToWrite;
				if (data?.[0]?.["key"]) datasetsToWrite = data.map((d) => d.data);
				else datasetsToWrite = [data];
				for (const writeData of datasetsToWrite) {
					if (format === "csv") {
						log(`writing ${path}`);
						const columns = getUniqueKeys(writeData);
						//papa parse needs nested JSON stringified
						writeData.forEach((e) => {
							for (const key in e) {
								if (typeof e[key] === "object") e[key] = JSON.stringify(e[key]);
							}
						});
						const csv = Papa.unparse(writeData, { columns });
						await touch(path, csv);
						log(`\tdone\n`);
					} else {
						const ndjson = data.map((d) => JSON.stringify(d)).join("\n");
						await touch(path, ndjson, true);
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
	log(`-----------------WRITES------------------`, "\n");
	return {
		import: importResults,
		files: [eventFiles, userFiles, scdFiles, groupFiles, lookupFiles, folder],
	};
}

function makeProfile(props, defaults) {
	//build the spec
	const profile = {
		...defaults,
	};

	for (const key in props) {
		try {
			profile[key] = choose(props[key]);
		} catch (e) {
			// debugger;
		}
	}

	return profile;
}

function makeSCD(props, distinct_id, mutations, $created) {
	const scdEntries = [];
	let lastInserted = dayjs($created);
	const deltaDays = dayjs().diff(lastInserted, "day");

	for (let i = 0; i < mutations; i++) {
		if (lastInserted.isAfter(dayjs())) break;
		const scd = makeProfile(props, { distinct_id });
		scd.startTime = lastInserted.toISOString();
		lastInserted = lastInserted.add(integer(1, 1000), "seconds");
		scd.insertTime = lastInserted.toISOString();
		scdEntries.push({ ...scd });
		lastInserted = lastInserted
			.add(integer(0, deltaDays), "day")
			.subtract(integer(1, 1000), "seconds");
	}

	return scdEntries;
}

/**
 * creates a random event
 * @param  {string} distinct_id
 * @param  {string[]} anonymousIds
 * @param  {number} earliestTime
 * @param  {Object[]} events
 * @param  {Object} superProps
 * @param  {Object} groupKeys
 * @param  {Boolean} isFirstEvent=false
 */
function makeEvent(distinct_id, anonymousIds, earliestTime, events, superProps, groupKeys, isFirstEvent = false) {

	let chosenEvent = events.pickOne();
	if (typeof chosenEvent === "string")
		chosenEvent = { event: chosenEvent, properties: {} };
	const event = {
		event: chosenEvent.event,
		$device_id: chance.pickone(anonymousIds), // always have a $device_id		
		$source: "AKsTimeSoup",
	};

	if (isFirstEvent) event.time = dayjs.unix(earliestTime).toISOString();
	if (!isFirstEvent) event.time = AKsTimeSoup(earliestTime, NOW, PEAK_DAYS);

	//sometimes have a $user_id
	if (!isFirstEvent && chance.bool({ likelihood: 42 })) event.$user_id = distinct_id;

	const props = { ...chosenEvent.properties, ...superProps };

	//iterate through custom properties
	for (const key in props) {
		try {
			event[key] = choose(props[key]);
		} catch (e) {
			console.error(`error with ${key} in ${chosenEvent.event} event`, e);
			debugger;
		}
	}

	//iterate through groups
	for (const groupPair of groupKeys) {
		const groupKey = groupPair[0];
		const groupCardinality = groupPair[1];

		event[groupKey] = weightedRange(1, groupCardinality).pickOne();
	}

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
		eventFiles: [path.join(writeDir, `events-${simName}.${extension}`)],
		userFiles: [path.join(writeDir, `users-${simName}.${extension}`)],
		scdFiles: [path.join(writeDir, `scd-${simName}.${extension}`)],
		groupFiles: [],
		lookupFiles: [],
		folder: writeDir,
	};

	for (const groupPair of groupKeys) {
		const groupKey = groupPair[0];
		writePaths.groupFiles.push(
			path.join(writeDir, `group-${groupKey}-${simName}.${extension}`)
		);
	}

	for (const lookupTable of lookupTables) {
		const { key } = lookupTable;
		writePaths.lookupFiles.push(
			path.join(writeDir, `lookup-${key}-${simName}.${extension}`)
		);
	}

	return writePaths;
}

/**
 * essentially, a timestamp generator with a twist
 * @param {number} earliestTime - The earliest timestamp in Unix format.
 * @param {number} latestTime - The latest timestamp in Unix format.
 * @param {Array} peakDays - Array of Unix timestamps representing the start of peak days.
 * @returns {number} - The generated event timestamp in Unix format.
 */
function AKsTimeSoup(earliestTime, latestTime = NOW, peakDays = PEAK_DAYS) {
	// Define business hours
	const peakStartHour = 4; // 4 AM
	const peakEndHour = 23; // 11 PM
	const likelihoodOfPeakDay = chance.integer({ min: integer(5, 42), max: integer(43, 69) }); // Randomize likelihood with CHAOS!~~

	// Select a day, with a preference for peak days
	let selectedDay;
	if (chance.bool({ likelihood: likelihoodOfPeakDay })) { // Randomized likelihood to pick a peak day
		selectedDay = peakDays.length > 0 ? chance.pickone(peakDays) : integer(earliestTime, latestTime);
	} else {
		// Introduce minor peaks by allowing some events to still occur during business hours
		selectedDay = chance.bool({ likelihood: integer(1, 42) })
			? chance.pickone(peakDays)
			: integer(earliestTime, latestTime);
	}

	// Normalize selectedDay to the start of the day
	selectedDay = dayjs.unix(selectedDay).startOf('day').unix();

	// Generate a random time within business hours with a higher concentration in the middle of the period
	const businessStart = dayjs.unix(selectedDay).hour(peakStartHour).minute(0).second(0).unix();
	const businessEnd = dayjs.unix(selectedDay).hour(peakEndHour).minute(0).second(0).unix();
	let eventTime;
	if (selectedDay === peakDays[0]) {
		// Use a skewed distribution for peak days
		eventTime = chance.normal({ mean: (businessEnd + businessStart) / integer(1, 4), dev: (businessEnd - businessStart) / integer(2, 8) });
	} else {
		// For non-peak days, use a uniform distribution to add noise
		eventTime = integer(integer(businessStart, businessEnd), integer(businessStart, businessEnd));
	}

	// usually, ensure the event time is within business hours
	if (chance.bool({ likelihood: 42 })) eventTime = Math.min(Math.max(eventTime, businessStart), businessEnd);

	return dayjs.unix(eventTime).toISOString();
}



// this is for CLI
if (require.main === module) {
	const args = cliParams();
	const { token, seed, format, numDays, numUsers, numEvents, region, writeToDisk } = args;
	const suppliedConfig = args._[0];

	//if the user specifics an separate config file
	let config = null;
	if (suppliedConfig) {
		log(`using ${suppliedConfig} for data\n`);
		config = require(path.resolve(suppliedConfig));
	} else {
		log(`... using default configuration ...\n`);
		config = require("./default.js");
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
			const { events, groups, users } = data.import;
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
			log(`\nfiles written to ${folder} ...`);
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
			openFinder(path.resolve("./data"));
		});
} else {
	module.exports = {
		generate: main,
		weightedRange,
		pick,
		day,
		integer,
		makeProducts,
		date,
		progress,
		person,
		choose,
		range,
		exhaust,
		openFinder,
	};
}


function log(...args) {
	if (VERBOSE) console.log(...args);
}