#! /usr/bin/env node

/*
make fake mixpanel data easily!
by AK 
ak@mixpanel.com
*/

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
} = require("./utils.js");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const cliParams = require("./cli.js");

dayjs.extend(utc);
Array.prototype.pickOne = pick;
const now = dayjs().unix();
const dayInSec = 86400;
const PEAK_DAYS = [
	dayjs().subtract(1, "day").unix(),
	dayjs().subtract(5, "day").unix(),
	dayjs().subtract(10, "day").unix(),
	dayjs().subtract(15, "day").unix(),
];

//our main program
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
	} = config;
	if (require.main === module) writeToDisk = true;
	const uuidChance = new Chance(seed);

	//the function which generates $distinct_id
	function uuid() {
		const distinct_id = uuidChance.guid();
		const daysAgoBorn = chance.integer({ min: 1, max: numDays });
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
	for (let i = 1; i < numUsers + 1; i++) {
		progress("users", i);
		const user = uuid();
		const { distinct_id, $created } = user;
		userProfilesData.push(makeProfile(userProps, user));
		const mutations = chance.integer({ min: 1, max: 20 });
		scdTableData.push(makeSCD(scdProps, distinct_id, mutations, $created));
		const numEventsThisUser = Math.round(
			chance.normal({ mean: avgEvPerUser, dev: avgEvPerUser / 4 })
		);

		if (firstEvents.length) {
			eventData.push(
				makeEvent(
					distinct_id,
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

	console.log("\n");

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
	console.log("\n");

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
	console.log("\n");

	if (!writeToDisk && !token)
		return {
			eventData,
			userProfilesData,
			scdTableData,
			groupProfilesData,
			lookupTableData,
		};
	//write the files
	for (const pair of pairs) {
		const [paths, data] = pair;
		for (const path of paths) {
			let datasetsToWrite;
			if (data?.[0]?.["key"]) datasetsToWrite = data.map((d) => d.data);
			else datasetsToWrite = [data];
			for (const writeData of datasetsToWrite) {
				if (format === "csv") {
					console.log(`writing ${path}`);
					const csv = Papa.unparse(writeData, {});
					await touch(path, csv);
					console.log(`\tdone\n`);
				} else {
					await touch(path, data, true);
				}
			}
		}
	}

	const importResults = { events: {}, users: {}, groups: [] };
	/** @type {import('mixpanel-import').Creds} */
	const creds = { token };
	/** @type {import('mixpanel-import').Options} */
	const importOpts = {
		fixData: true,
		verbose: false,
		forceStream: true,
		strict: false,
		dryRun: false,
		abridged: false,
		region,
	};
	//send to mixpanel
	if (token) {
		if (eventData) {
			console.log(`importing events to mixpanel...`);
			const imported = await mp(creds, eventData, {
				recordType: "event",
				...importOpts,
			});
			console.log(`\tsent ${comma(imported.success)} events\n`);
			importResults.events = imported;
		}
		if (userProfilesData) {
			console.log(`importing user profiles to mixpanel...`);
			const imported = await mp(creds, userProfilesData, {
				recordType: "user",
				...importOpts,
			});
			console.log(`\tsent ${comma(imported.success)} user profiles\n`);
			importResults.users = imported;
		}
		if (groupProfilesData) {
			for (const groupProfiles of groupProfilesData) {
				const groupKey = groupProfiles.key;
				const data = groupProfiles.data;
				console.log(`importing ${groupKey} profiles to mixpanel...`);
				const imported = await mp({ token, groupKey }, data, {
					recordType: "group",
					...importOpts,
				});
				console.log(`\tsent ${comma(imported.success)} ${groupKey} profiles\n`);
				importResults.groups.push(imported);
			}
		}
		console.log(`\n\n`);
	}
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

function makeEvent(
	distinct_id,
	earliestTime,
	events,
	superProps,
	groupKeys,
	isFirstEvent = false
) {
	let chosenEvent = events.pickOne();
	if (typeof chosenEvent === "string")
		chosenEvent = { event: chosenEvent, properties: {} };
	const event = {
		event: chosenEvent.event,
		distinct_id,
		$source: "AK's fake data generator",
	};

	if (isFirstEvent) event.time = earliestTime;
	if (!isFirstEvent) event.time = customTimeDistribution(earliestTime, now, PEAK_DAYS);

	const props = { ...chosenEvent.properties, ...superProps };

	//iterate through custom properties
	for (const key in props) {
		try {
			event[key] = choose(props[key]);
		} catch (e) {
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
	const current = dayjs.utc().format("MM-DD-HH");
	let writeDir = "./";
	if (config.writeToDisk) writeDir = mkdir("./data");

	const writePaths = {
		eventFiles: [path.join(writeDir, `events-${current}.${extension}`)],
		userFiles: [path.join(writeDir, `users-${current}.${extension}`)],
		scdFiles: [path.join(writeDir, `scd-${current}.${extension}`)],
		groupFiles: [],
		lookupFiles: [],
		folder: writeDir,
	};

	for (const groupPair of groupKeys) {
		const groupKey = groupPair[0];
		writePaths.groupFiles.push(
			path.join(writeDir, `group-${groupKey}-${current}.${extension}`)
		);
	}

	for (const lookupTable of lookupTables) {
		const { key } = lookupTable;
		writePaths.lookupFiles.push(
			path.join(writeDir, `lookup-${key}-${current}.${extension}`)
		);
	}

	return writePaths;
}

/**
 * Generates a random timestamp with higher likelihood on peak days and typical business hours.
 * @param {number} earliestTime - The earliest timestamp in Unix format.
 * @param {number} latestTime - The latest timestamp in Unix format.
 * @param {Array} peakDays - Array of Unix timestamps representing the start of peak days.
 * @returns {number} - The generated event timestamp in Unix format.
 */
function customTimeDistribution(earliestTime, latestTime, peakDays) {
	// Define business hours
	const peakStartHour = 8; // 8 AM
	const peakEndHour = 18; // 6 PM
	const likelihoodOfPeakDay = chance.integer({ min: integer(5, 42), max: integer(43, 69) }); // Randomize likelihood with CHAOS!~~

	// Select a day, with a preference for peak days
	let selectedDay;
	if (chance.bool({ likelihood: likelihoodOfPeakDay })) { // Randomized likelihood to pick a peak day
		selectedDay = peakDays.length > 0 ? chance.pickone(peakDays) : integer(earliestTime, latestTime);
	} else {
		// Introduce minor peaks by allowing some events to still occur during business hours
		selectedDay = chance.bool({ likelihood: 20 }) // 20% chance to simulate a minor peak on a non-peak day
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
		eventTime = chance.normal({ mean: (businessEnd + businessStart) / 2, dev: (businessEnd - businessStart) / 8 });
	} else {
		// For non-peak days, use a uniform distribution to add noise
		eventTime = integer(businessStart, businessEnd);
	}
	eventTime = Math.min(Math.max(eventTime, businessStart), businessEnd); // Ensure time is within business hours

	return eventTime;
}



// this is for CLI
if (require.main === module) {
	const args = cliParams();
	const { token, seed, format, numDays, numUsers, numEvents, region } = args;
	const suppliedConfig = args._[0];

	//if the user specifics an separate config file
	let config = null;
	if (suppliedConfig) {
		console.log(`using ${suppliedConfig} for data\n`);
		config = require(path.resolve(suppliedConfig));
	} else {
		console.log(`... using default configuration ...\n`);
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

	main(config)
		.then((data) => {
			console.log(`------------------SUMMARY------------------`);
			const { events, groups, users } = data.import;
			const files = data.files;
			const folder = files.pop();
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
			console.log(`\nfiles written to ${folder}...`);
			console.log("\t" + files.flat().join("\n\t"));
			console.log(`\n------------------SUMMARY------------------\n\n\n`);
		})
		.catch((e) => {
			console.log(`------------------ERROR------------------`);
			console.error(e);
			console.log(`------------------ERROR------------------`);
			debugger;
		})
		.finally(() => {
			console.log("have a wonderful day :)");
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
