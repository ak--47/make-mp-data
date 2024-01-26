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
	integer,
	pick,
	weightedRange,
	progress,
	person,
	choose,
	openFinder
} = require("./utils.js");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const cliParams = require('./cli.js');


dayjs.extend(utc);
Array.prototype.pickOne = pick;
const now = dayjs().unix();
const dayInSec = 86400;



const args = cliParams();
const {
	token,
	seed,
	format,
	numDays,
	numUsers,
	numEvents,
	region
} = args;
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


//our main program
async function main(config) {

	const {
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
	} = config;

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
			for (let i = 0; i < event.weight; i++) {
				acc.push(event);
			}
			return acc;
		}, [])
		.filter((e) => e.weight > 0)
		.filter((e) => !e.isFirstEvent);

	const firstEvents = events.filter((e) => e.isFirstEvent);
	const eventData = [];
	const userProfilesData = [];
	const scdTableData = [];
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

		if (firstEvents) {
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
				$distinct_id: i
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
	const { eventFiles, userFiles, scdFiles, groupFiles, lookupFiles, folder } = buildFileNames(config);
	const pairs = [
		[eventFiles, eventData],
		[userFiles, userProfilesData],
		[scdFiles, scdTableData],
		[groupFiles, groupProfilesData],
		[lookupFiles, lookupTableData],
	];
	console.log("\n");
	//write the files
	for (const pair of pairs) {
		const [paths, data] = pair;
		for (const path of paths) {
			if (format === "csv") {
				console.log(`writing ${path}`);
				const csv = Papa.unparse(data, {});
				await touch(path, csv);
				console.log(`\tdone\n`);
			} else {
				await touch(path, data, true);
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
		region

	};
	//send to mixpanel
	if (token) {
		if (eventData) {
			console.log(`importing events to mixpanel...`);
			const imported = await mp(creds, eventData, { recordType: "event", ...importOpts });
			console.log(`\tsent ${comma(imported.success)} events\n`);
			importResults.events = imported;
		}
		if (userProfilesData) {
			console.log(`importing user profiles to mixpanel...`);
			const imported = await mp(creds, userProfilesData, { recordType: "user", ...importOpts });
			console.log(`\tsent ${comma(imported.success)} user profiles\n`);
			importResults.users = imported;
		}
		if (groupProfilesData) {

			for (const groupProfiles of groupProfilesData) {
				const groupKey = groupProfiles.key;
				const data = groupProfiles.data;
				console.log(`importing ${groupKey} profiles to mixpanel...`);
				const imported = await mp({ token, groupKey }, data, { recordType: "group", ...importOpts });
				console.log(`\tsent ${comma(imported.success)} ${groupKey} profiles\n`);
				importResults.groups.push(imported);
			}
		}
		console.log(`\n\n`);
	}
	return { import: importResults, files: [eventFiles, userFiles, scdFiles, groupFiles, lookupFiles, folder] };
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

function makeEvent(distinct_id, earliestTime, events, superProps, groupKeys, isFirstEvent = false) {
	let chosenEvent = events.pickOne();
	if (typeof chosenEvent === "string")
		chosenEvent = { event: chosenEvent, properties: {} };
	const event = {
		event: chosenEvent.event,
		distinct_id,
		$source: "AK's fake data generator",
	};

	if (isFirstEvent) event.time = earliestTime;
	if (!isFirstEvent) event.time = integer(earliestTime, now);

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
	const writeDir = mkdir('./data');

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

//that's all folks :)
main(config)
	.then((data) => {
		console.log(`------------------SUMMARY------------------`);
		const { events, groups, users } = data.import;
		const files = data.files;
		const folder = files.pop();
		const groupBytes = groups.reduce((acc, group) => { return acc + group.bytes; }, 0);
		const groupSuccess = groups.reduce((acc, group) => { return acc + group.success; }, 0);
		const bytes = events.bytes + groupBytes + users.bytes;
		const stats = {
			events: comma(events.success || 0),
			users: comma(users.success || 0),
			groups: comma(groupSuccess || 0),
			bytes: bytesHuman(bytes || 0)
		};
		console.table(stats);
		console.log(`\nfiles written to ${folder}...`);
		console.log("\t" + files.flat().join('\t\n'));
		console.log(`------------------SUMMARY------------------\n\n\n`);
	})
	.catch((e) => {
		console.log(`------------------ERROR------------------`);
		console.error(e);
		console.log(`------------------ERROR------------------`);
		debugger;
	})
	.finally(() => {
		console.log('have a wonderful day :)');
		openFinder(path.resolve("./data"));
	});
