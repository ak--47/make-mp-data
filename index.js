#! /usr/bin/env node

/*
make fake mixpanel data easily!
by AK 
ak@mixpanel.com
*/

//todos: we are getting events before our start data
//todos: users are getting events before they are created


const RUNTIME = process.env.RUNTIME || "unspecified";
const mp = require("mixpanel-import");
const path = require("path");
const Chance = require("chance");
const chance = new Chance();
const { comma, bytesHuman, mkdir, makeName, md5, clone, tracker, uid } = require("ak-tools");
const u = require("./utils.js");
const AKsTimeSoup = require("./timesoup.js");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const cliParams = require("./cli.js");
const NOW = dayjs().unix();
let VERBOSE = false;
let isCLI = false;

const { version } = require('./package.json');
const os = require("os");
const metrics = tracker("make-mp-data", "db99eb8f67ae50949a13c27cacf57d41", os.userInfo().username);
function track(name, props, ...rest) {
	if (process.env.NODE_ENV === 'test') return;
	metrics(name, props, ...rest);
}

/** @typedef {import('./types.d.ts').Config} Config */
/** @typedef {import('./types.d.ts').EventConfig} EventConfig */
/** @typedef {import('./types.d.ts').Funnel} Funnel */
/** @typedef {import('./types.d.ts').Person} Person */
/** @typedef {import('./types.d.ts').SCDTableRow} SCDTableRow */
/** @typedef {import('./types.d.ts').UserProfile} UserProfile */

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
		funnels = [],
		userProps = {
			favoriteColor: ["red", "green", "blue", "yellow"],
			spiritAnimal: chance.animal.bind(chance),
		},
		scdProps = {},
		mirrorProps = {},
		groupKeys = [],
		groupProps = {},
		lookupTables = [],
		anonIds = false,
		sessionIds = false,
		format = "csv",
		token = null,
		region = "US",
		writeToDisk = false,
		verbose = false,
		hook = (record) => record,
	} = config;
	if (!config.superProps) config.superProps = superProps;
	if (!config.userProps || Object.keys(config?.userProps)) config.userProps = userProps;
	VERBOSE = verbose;
	config.simulationName = makeName();
	const { simulationName } = config;
	global.MP_SIMULATION_CONFIG = config;
	const uuidChance = new Chance(seed);
	const runId = uid(42);
	track('start simulation', {
		runId,
		seed,
		numEvents,
		numUsers,
		numDays,
		anonIds,
		sessionIds,
		format,
		targetToken: token,
		region,
		writeToDisk,
		isCLI,
		version
	});
	log(`------------------SETUP------------------`);
	log(`\nyour data simulation will heretofore be known as: \n\n\t${simulationName.toUpperCase()}...\n`);
	log(`and your configuration is:\n\n`, JSON.stringify({ seed, numEvents, numUsers, numDays, format, token, region, writeToDisk, anonIds, sessionIds }, null, 2));
	log(`------------------SETUP------------------`, "\n");





	//setup all the data structures we will push into
	const eventData = enrichArray([], { hook, type: "event", config });
	const userProfilesData = enrichArray([], { hook, type: "user", config });
	const scdTableKeys = Object.keys(scdProps);
	const scdTableData = [];
	for (const [index, key] of scdTableKeys.entries()) {
		scdTableData[index] = enrichArray([], { hook, type: "scd", config, scdKey: key });
	}
	const groupProfilesData = enrichArray([], { hook, type: "group", config });
	const lookupTableData = enrichArray([], { hook, type: "lookup", config });
	const avgEvPerUser = Math.ceil(numEvents / numUsers);

	//user loop
	log(`---------------SIMULATION----------------`, "\n\n");
	loopUsers: for (let i = 1; i < numUsers + 1; i++) {
		u.progress("users", i);
		const user = generateUser(uuidChance, numDays);
		const { distinct_id, $created, anonymousIds, sessionIds } = user;
		let numEventsPreformed = 0;

		// profile creation
		const profile = makeProfile(userProps, user);
		userProfilesData.hookPush(profile);

		//scd creation
		/** @type {Record<string, SCDTableRow[]>} */
		// @ts-ignore
		const userSCD = {};
		for (const [index, key] of scdTableKeys.entries()) {
			const mutations = chance.integer({ min: 1, max: 10 });
			const changes = makeSCD(scdProps[key], key, distinct_id, mutations, $created);
			// @ts-ignore
			userSCD[key] = changes;
			scdTableData[index].hookPush(changes);
		}

		let numEventsThisUserWillPreform = chance.normal({
			mean: avgEvPerUser,
			dev: avgEvPerUser / u.integer(u.integer(3, 5), u.integer(2, 7))
		}) * 1.242;
		// power users do 5x more events
		chance.bool({ likelihood: 20 }) ? numEventsThisUserWillPreform *= 5 : null;

		// shitty users do 1/2 as many events
		chance.bool({ likelihood: 15 }) ? numEventsThisUserWillPreform *= 0.5 : null;
		numEventsThisUserWillPreform = Math.round(numEventsThisUserWillPreform);

		if (funnels.length) {
			//first funnel
			const firstFunnels = funnels.filter((f) => f.isFirstFunnel).reduce(u.weighFunnels, []);
			const usageFunnels = funnels.filter((f) => !f.isFirstFunnel).reduce(u.weighFunnels, []);
			if (firstFunnels.length) {
				/** @type {Funnel} */
				const firstFunnel = chance.pickone(firstFunnels, user);

				const [data, userConverted] = makeFunnel(firstFunnel, user, profile, userSCD, config);
				numEventsPreformed += data.length;
				eventData.hookPush(data);
				if (!userConverted) continue loopUsers;


			}

			while (numEventsPreformed < numEventsThisUserWillPreform) {
				if (usageFunnels.length) {
					/** @type {Funnel} */
					const currentFunnel = chance.pickone(usageFunnels);
					const [data, userConverted] = makeFunnel(currentFunnel, user, profile, userSCD, config);
					numEventsPreformed += data.length;
					eventData.hookPush(data);
				}


			}

		}

		// we have no funnels, so we're just going to make a bunch of random events
		else {
			const weightedEvents = events
				.reduce((acc, event) => {
					const weight = event.weight || 1;
					for (let i = 0; i < weight; i++) {

						// @ts-ignore
						acc.push(event);
					}
					return acc;
				}, [])

				// @ts-ignore
				.filter((e) => !e.isFirstEvent);

			const firstEvents = events.filter((e) => e.isFirstEvent);
			// first event loop
			if (firstEvents.length) {
				eventData.hookPush(
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

			// all other event loop
			for (let j = 0; j < numEventsThisUserWillPreform; j++) {
				eventData.hookPush(
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
	}

	//flatten SCD
	scdTableData.forEach((table, index) => scdTableData[index] = table.flat());

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
			group["distinct_id"] = i;
			groupProfiles.push(group);
		}
		groupProfilesData.hookPush({ key: groupKey, data: groupProfiles });
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
		lookupTableData.hookPush({ key, data });
	}

	// deal with mirror props
	let mirrorEventData = [];
	const mirrorPropKeys = Object.keys(mirrorProps);
	if (mirrorPropKeys.length) {
		mirrorEventData = clone(eventData);
		for (const row of mirrorEventData) {
			for (const key of mirrorPropKeys) {
				if (mirrorProps[key]?.events?.includes(row?.event)) row[key] = hook(u.choose(mirrorProps[key]?.values), "mirror", { config, row, key });
				if (mirrorProps[key]?.events === "*") row[key] = hook(u.choose(mirrorProps[key]?.values), "mirror", { config, row, key });
			}
		}
	}

	const { eventFiles, userFiles, scdFiles, groupFiles, lookupFiles, mirrorFiles, folder } =
		buildFileNames(config);
	const pairs = [
		[eventFiles, [eventData]],
		[userFiles, [userProfilesData]],
		[scdFiles, scdTableData],
		[groupFiles, groupProfilesData],
		[lookupFiles, lookupTableData],
		[mirrorFiles, [mirrorEventData]],
	];
	log("\n");
	log(`---------------SIMULATION----------------`, "\n");

	if (!writeToDisk && !token) {
		track('end simulation', {
			runId,
			seed,
			numEvents,
			numUsers,
			numDays,
			anonIds,
			sessionIds,
			format,
			token,
			region,
			writeToDisk,
			isCLI
		});
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

	let writeFilePromises = [];
	if (writeToDisk) {
		if (verbose) log(`writing files... for ${simulationName}`);
		loopFiles: for (const ENTITY of pairs) {
			const [paths, data] = ENTITY;
			if (!data.length) continue loopFiles;
			for (const [index, path] of paths.entries()) {
				let TABLE;
				//group + lookup tables are structured differently
				if (data?.[index]?.["key"]) {
					TABLE = data[index].data;
				}
				else {
					TABLE = data[index];
				}

				log(`\twriting ${path}`);
				//if it's a lookup table, it's always a CSV
				if (format === "csv" || path.includes("-LOOKUP.csv")) {
					writeFilePromises.push(u.streamCSV(path, TABLE));
				}
				else {
					writeFilePromises.push(u.streamJSON(path, TABLE));
				}

			}
		}
	}
	const fileWriteResults = await Promise.all(writeFilePromises);

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
			strict: true,
			dryRun: false,
			abridged: false,
			fixJson: true,
		};

		if (eventData) {
			log(`importing events to mixpanel...`);
			const imported = await mp(creds, eventData, {
				recordType: "event",
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
	track('end simulation', {
		runId,
		seed,
		numEvents,
		numUsers,
		numDays,
		events,
		anonIds,
		sessionIds,
		format,
		targetToken: token,
		region,
		writeToDisk,
		isCLI,
		version
	});

	return {
		import: importResults,
		files: [eventFiles, userFiles, scdFiles, groupFiles, lookupFiles, mirrorFiles, folder],
	};
}


//the function which generates $distinct_id + $anonymous_ids, $session_ids, and $created, skewing towards the present
function generateUser(uuid, numDays) {
	const distinct_id = uuid.guid();
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

function makeProfile(props, defaults) {
	//build the spec
	const profile = {
		...defaults,
	};

	// anonymous and session ids
	if (!global.MP_SIMULATION_CONFIG?.anonIds) delete profile.anonymousIds;
	if (!global.MP_SIMULATION_CONFIG?.sessionIds) delete profile.sessionIds;

	for (const key in props) {
		try {
			profile[key] = u.choose(props[key]);
		} catch (e) {
			// debugger;
		}
	}

	return profile;
}

/**
 * @param  {import('./types.d.ts').ValueValid} prop
 * @param  {string} scdKey
 * @param  {string} distinct_id
 * @param  {number} mutations
 * @param  {string} $created
 */
function makeSCD(prop, scdKey, distinct_id, mutations, $created) {
	if (JSON.stringify(prop) === "{}") return {};
	if (JSON.stringify(prop) === "[]") return [];
	const scdEntries = [];
	let lastInserted = dayjs($created);
	const deltaDays = dayjs().diff(lastInserted, "day");

	for (let i = 0; i < mutations; i++) {
		if (lastInserted.isAfter(dayjs())) break;
		const scd = makeProfile({ [scdKey]: prop }, { distinct_id });
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
 * creates a funnel of events for a user
 * this is called multiple times for a user
 * @param  {Funnel} funnel
 * @param  {Person} user
 * @param  {UserProfile} profile
 * @param  {Record<string, SCDTableRow[]>} scd
 * @param  {Config} config
 * @return {[EventConfig[], Boolean]}
 */
function makeFunnel(funnel, user, profile, scd, config) {
	const { hook } = config;
	hook(funnel, "funnel-pre", { user, profile, scd, funnel, config });
	const { sequence, conversionRate = 50, order = 'sequential', timeToConvert = 1, props } = funnel;
	const { distinct_id, $created, anonymousIds, sessionIds } = user;
	const { superProps, groupKeys } = config;
	const { $name, $email } = profile;

	const chosenFunnelProps = { ...props, ...superProps };
	for (const key in props) {
		try {
			chosenFunnelProps[key] = u.choose(chosenFunnelProps[key]);
		} catch (e) {
			console.error(`error with ${key} in ${funnel.sequence.join(" > ")} funnel`, e);
			debugger;
		}
	}

	const funnelPossibleEvents = sequence.map((event) => {
		const foundEvent = config.events.find((e) => e.event === event);
		/** @type {EventConfig} */
		const eventSpec = foundEvent || { event, properties: {} };
		for (const key in eventSpec.properties) {
			try {
				eventSpec.properties[key] = u.choose(eventSpec.properties[key]);
			} catch (e) {
				console.error(`error with ${key} in ${eventSpec.event} event`, e);
				debugger;
			}
		}
		delete eventSpec.isFirstEvent;
		delete eventSpec.weight;
		eventSpec.properties = { ...eventSpec.properties, ...chosenFunnelProps };
		return eventSpec;
	});

	const doesUserConvert = chance.bool({ likelihood: conversionRate });
	let numStepsUserWillTake = sequence.length;
	if (!doesUserConvert) numStepsUserWillTake = u.integer(1, sequence.length - 1);
	const funnelTotalRelativeTimeInHours = timeToConvert / numStepsUserWillTake;
	const msInHour = 60000 * 60;

	let lastTimeJump = 0;
	const funnelActualEvents = funnelPossibleEvents.slice(0, numStepsUserWillTake)
		.map((event, index) => {
			if (index === 0) {
				event.relativeTimeMs = 0;
				return event;
			}

			// Calculate base increment for each step
			const baseIncrement = (timeToConvert * msInHour) / numStepsUserWillTake;

			// Introduce a random fluctuation factor
			const fluctuation = u.integer(-baseIncrement / u.integer(3, 5), baseIncrement / u.integer(3, 5));

			// Ensure the time increments are increasing and add randomness
			const previousTime = lastTimeJump;
			const currentTime = previousTime + baseIncrement + fluctuation;

			// Assign the calculated time to the event
			const chosenTime = Math.max(currentTime, previousTime + 1); // Ensure non-decreasing time
			lastTimeJump = chosenTime;
			event.relativeTimeMs = chosenTime;
			return event;
		});


	let funnelActualOrder = [];

	//todo
	switch (order) {
		case "sequential":
			funnelActualOrder = funnelActualEvents;
			break;
		case "random":
			funnelActualOrder = u.shuffleArray(funnelActualEvents);
			break;
		case "first-fixed":
			funnelActualOrder = u.shuffleExceptFirst(funnelActualEvents);
			break;
		case "last-fixed":
			funnelActualOrder = u.shuffleExceptLast(funnelActualEvents);
			break;
		case "first-and-last-fixed":
			funnelActualOrder = u.fixFirstAndLast(funnelActualEvents);
			break;
		case "middle-fixed":
			funnelActualOrder = u.shuffleOutside(funnelActualEvents);
			break;
		default:
			funnelActualOrder = funnelActualEvents;
			break;
	}
	let funnelStartTime;
	let finalEvents = funnelActualOrder
		.map((event, index) => {
			const newEvent = makeEvent(distinct_id, anonymousIds, sessionIds, dayjs($created).unix(), [event], {}, groupKeys);
			if (index === 0) {
				funnelStartTime = dayjs(newEvent.time);
				delete newEvent.relativeTimeMs;
				return newEvent;
			}
			newEvent.time = dayjs(funnelStartTime).add(event.relativeTimeMs, "milliseconds").toISOString();
			delete newEvent.relativeTimeMs;
			return newEvent;
		});


	hook(finalEvents, "funnel-post", { user, profile, scd, funnel, config });
	return [finalEvents, doesUserConvert];
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
		const groupEvents = groupPair[2] || [];

		// empty array for group events means all events
		if (!groupEvents.length) event[groupKey] = u.pick(u.weightedRange(1, groupCardinality));
		if (groupEvents.includes(event.event)) event[groupKey] = u.pick(u.weightedRange(1, groupCardinality));
	}

	//make $insert_id
	event.$insert_id = md5(JSON.stringify(event));

	return event;
}

function buildFileNames(config) {
	const { format = "csv", groupKeys = [], lookupTables = [], m } = config;
	let extension = "";
	extension = format === "csv" ? "csv" : "json";
	// const current = dayjs.utc().format("MM-DD-HH");
	const simName = config.simulationName;
	let writeDir = "./";
	if (config.writeToDisk) writeDir = mkdir("./data");
	if (typeof writeDir !== "string") throw new Error("writeDir must be a string");
	if (typeof simName !== "string") throw new Error("simName must be a string");

	const writePaths = {
		eventFiles: [path.join(writeDir, `${simName}-EVENTS.${extension}`)],
		userFiles: [path.join(writeDir, `${simName}-USERS.${extension}`)],
		scdFiles: [],
		mirrorFiles: [],
		groupFiles: [],
		lookupFiles: [],
		folder: writeDir,
	};

	//add SCD files
	const scdKeys = Object.keys(config?.scdProps || {});
	for (const key of scdKeys) {
		writePaths.scdFiles.push(
			path.join(writeDir, `${simName}-${key}-SCD.${extension}`)
		);
	}

	//add group files
	for (const groupPair of groupKeys) {
		const groupKey = groupPair[0];

		writePaths.groupFiles.push(
			path.join(writeDir, `${simName}-${groupKey}-GROUP.${extension}`)
		);
	}

	//add lookup files
	for (const lookupTable of lookupTables) {
		const { key } = lookupTable;
		writePaths.lookupFiles.push(
			//lookups are always CSVs
			path.join(writeDir, `${simName}-${key}-LOOKUP.csv`)
		);
	}

	//add mirror files
	const mirrorProps = config?.mirrorProps || {};
	if (Object.keys(mirrorProps).length) {
		writePaths.mirrorFiles.push(
			path.join(writeDir, `${simName}-MIRROR.${extension}`)
		);
	}

	return writePaths;
}

/** @typedef {import('./types').EnrichedArray} EnrichArray */
/** @typedef {import('./types').EnrichArrayOptions} EnrichArrayOptions */

/** 
 * @param  {any[]} arr
 * @param  {EnrichArrayOptions} opts
 * @returns {EnrichArray}}
 */
function enrichArray(arr = [], opts = {}) {
	const { hook = a => a, type = "", ...rest } = opts;

	function transformThenPush(item) {
		if (Array.isArray(item)) {
			for (const i of item) {
				arr.push(hook(i, type, rest));
			}
			return -1;
		}
		else {
			return arr.push(hook(item, type, rest));
		}

	}

	/** @type {EnrichArray} */
	// @ts-ignore
	const enrichedArray = arr;


	enrichedArray.hookPush = transformThenPush;


	return enrichedArray;
};



// this is for CLI
if (require.main === module) {
	isCLI = true;
	const args = cliParams();
	// @ts-ignore
	let { token, seed, format, numDays, numUsers, numEvents, region, writeToDisk, complex = false, sessionIds, anonIds } = args;
	// @ts-ignore
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
			config = require(path.resolve(__dirname, "./schemas/complex.js"));
		}
		else {
			console.log(`... using default SIMPLE configuration [events + users] ...\n`);
			console.log(`... for more complex data, use the --complex flag ...\n`);
			config = require(path.resolve(__dirname, "./schemas/simple.js"));
		}
	}

	//override config with cli params
	if (token) config.token = token;
	if (seed) config.seed = seed;
	if (format === "csv" && config.format === "json") format = "json";
	if (format) config.format = format;
	if (numDays) config.numDays = numDays;
	if (numUsers) config.numUsers = numUsers;
	if (numEvents) config.numEvents = numEvents;
	if (region) config.region = region;
	if (writeToDisk) config.writeToDisk = writeToDisk;
	if (writeToDisk === 'false') config.writeToDisk = false;
	if (sessionIds) config.sessionIds = sessionIds;
	if (anonIds) config.anonIds = anonIds;
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
	const cwd = process.cwd();  // Get the current working directory

	for (let i = 0; i < args.length; i++) {
		// Replace occurrences of the current working directory with "./" in string arguments
		if (typeof args[i] === 'string') {
			args[i] = args[i].replace(new RegExp(cwd, 'g'), ".");
		}
	}
	if (VERBOSE) console.log(...args);
}