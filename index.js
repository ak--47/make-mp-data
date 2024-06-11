#! /usr/bin/env node

/*
make fake mixpanel data easily!
by AK 
ak@mixpanel.com
*/

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const NOW = dayjs('2024-02-02').unix(); //this is a FIXED POINT and we will shift it later
global.NOW = NOW;
const mp = require("mixpanel-import");
const path = require("path");
const { comma, bytesHuman, makeName, md5, clone, tracker, uid } = require("ak-tools");
const { generateLineChart } = require('./chart.js');
const { version } = require('./package.json');
const os = require("os");
const metrics = tracker("make-mp-data", "db99eb8f67ae50949a13c27cacf57d41", os.userInfo().username);


const u = require("./utils.js");
const cliParams = require("./cli.js");

let VERBOSE = false;
let isCLI = false;
let CONFIG;
require('dotenv').config();


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
/** @typedef {import('./types.d.ts').EventSpec} EventSpec */

/**
 * generates fake mixpanel data
 * @param  {Config} config
 */
async function main(config) {
	//PARAMS
	const seedWord = process.env.SEED || config.seed || "hello friend!";
	config.seed = seedWord;
	u.initChance(seedWord);
	const chance = u.getChance();
	config.chance = chance;
	let {
		seed,
		numEvents = 100000,
		numUsers = 1000,
		numDays = 30,
		epochStart = 0,
		epochEnd = dayjs().unix(),
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
		makeChart = false,
		soup = {},
		hook = (record) => record,
	} = config;
	if (!config.superProps) config.superProps = superProps;
	if (!config.userProps || Object.keys(config?.userProps)) config.userProps = userProps;
	VERBOSE = verbose;
	config.simulationName = makeName();
	const { simulationName } = config;
	if (epochStart && !numDays) numDays = dayjs.unix(epochEnd).diff(dayjs.unix(epochStart), "day");
	if (!epochStart && numDays) epochStart = dayjs.unix(epochEnd).subtract(numDays, "day").unix();
	if (epochStart && numDays) { } //noop
	if (!epochStart && !numDays) debugger; //never happens	
	config.seed = seed;
	config.numEvents = numEvents;
	config.numUsers = numUsers;
	config.numDays = numDays;
	config.epochStart = epochStart;
	config.epochEnd = epochEnd;
	config.events = events;
	config.superProps = superProps;
	config.funnels = funnels;
	config.userProps = userProps;
	config.scdProps = scdProps;
	config.mirrorProps = mirrorProps;
	config.groupKeys = groupKeys;
	config.groupProps = groupProps;
	config.lookupTables = lookupTables;
	config.anonIds = anonIds;
	config.sessionIds = sessionIds;
	config.format = format;
	config.token = token;
	config.region = region;
	config.writeToDisk = writeToDisk;
	config.verbose = verbose;
	config.makeChart = makeChart;
	config.soup = soup;
	config.hook = hook;

	//event validation 
	const validatedEvents = validateEvents(events);
	events = validatedEvents;
	config.events = validatedEvents;
	global.MP_SIMULATION_CONFIG = config;
	CONFIG = config;
	const runId = uid(42);
	let trackingParams = { runId, seed, numEvents, numUsers, numDays, anonIds, sessionIds, format, targetToken: token, region, writeToDisk, isCLI, version };
	track('start simulation', trackingParams);

	log(`------------------SETUP------------------`);
	log(`\nyour data simulation will heretofore be known as: \n\n\t${simulationName.toUpperCase()}...\n`);
	log(`and your configuration is:\n\n`, JSON.stringify({ seed, numEvents, numUsers, numDays, format, token, region, writeToDisk, anonIds, sessionIds }, null, 2));
	log(`------------------SETUP------------------`, "\n");

	//setup all the data structures we will push into
	const eventData = u.enrichArray([], { hook, type: "event", config });
	const userProfilesData = u.enrichArray([], { hook, type: "user", config });
	const scdTableKeys = Object.keys(scdProps);
	const scdTableData = [];
	for (const [index, key] of scdTableKeys.entries()) {
		scdTableData[index] = u.enrichArray([], { hook, type: "scd", config, scdKey: key });
	}
	const groupProfilesData = u.enrichArray([], { hook, type: "group", config });
	const lookupTableData = u.enrichArray([], { hook, type: "lookup", config });
	const avgEvPerUser = Math.ceil(numEvents / numUsers);

	// if no funnels, make some out of events...
	if (!funnels || !funnels.length) {
		const createdFunnels = [];
		const firstEvents = events.filter((e) => e.isFirstEvent).map((e) => e.event);
		const usageEvents = events.filter((e) => !e.isFirstEvent).map((e) => e.event);
		const numFunnelsToCreate = Math.ceil(usageEvents.length);
		/** @type {Funnel} */
		const funnelTemplate = {
			sequence: [],
			conversionRate: 50,
			order: 'sequential',
			props: {},
			timeToConvert: 1,
			isFirstFunnel: false,
			weight: 1
		};
		if (firstEvents.length) {
			for (const event of firstEvents) {
				createdFunnels.push({ ...clone(funnelTemplate), sequence: [event], isFirstFunnel: true, conversionRate: 100 });
			}
		}

		//at least one funnel with all usage events
		createdFunnels.push({ ...clone(funnelTemplate), sequence: usageEvents });

		//for the rest, make random funnels
		followUpFunnels: for (let i = 1; i < numFunnelsToCreate; i++) {
			/** @type {Funnel} */
			const funnel = { ...clone(funnelTemplate) };
			funnel.conversionRate = u.integer(25, 75);
			funnel.timeToConvert = u.integer(1, 10);
			funnel.weight = u.integer(1, 10);
			const sequence = u.shuffleArray(usageEvents).slice(0, u.integer(2, usageEvents.length));
			funnel.sequence = sequence;
			funnel.order = 'random';
			createdFunnels.push(funnel);
		}

		funnels = createdFunnels;
		config.funnels = funnels;
		CONFIG = config;

	}

	//user loop
	log(`---------------SIMULATION----------------`, "\n\n");
	loopUsers: for (let i = 1; i < numUsers + 1; i++) {
		u.progress("users", i);
		const userId = chance.guid();
		// const user = u.generateUser(userId, numDays, amp, freq, skew);
		const user = u.generateUser(userId, numDays);
		const { distinct_id, created, anonymousIds, sessionIds } = user;
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
			const changes = makeSCD(scdProps[key], key, distinct_id, mutations, created);
			// @ts-ignore
			userSCD[key] = changes;
			scdTableData[index].hookPush(changes);
		}

		let numEventsThisUserWillPreform = Math.floor(chance.normal({
			mean: avgEvPerUser,
			dev: avgEvPerUser / u.integer(u.integer(2, 5), u.integer(2, 7))
		}) * 0.714159265359);

		// power users do 5x more events
		chance.bool({ likelihood: 20 }) ? numEventsThisUserWillPreform *= 5 : null;

		// shitty users do 1/3 as many events
		chance.bool({ likelihood: 15 }) ? numEventsThisUserWillPreform *= 0.333 : null;

		numEventsThisUserWillPreform = Math.round(numEventsThisUserWillPreform);

		let userFirstEventTime;

		//first funnel
		const firstFunnels = funnels.filter((f) => f.isFirstFunnel).reduce(u.weighFunnels, []);
		const usageFunnels = funnels.filter((f) => !f.isFirstFunnel).reduce(u.weighFunnels, []);
		const userIsBornInDataset = chance.bool({ likelihood: 30 });
		if (firstFunnels.length && userIsBornInDataset) {
			/** @type {Funnel} */
			const firstFunnel = chance.pickone(firstFunnels, user);

			const [data, userConverted] = makeFunnel(firstFunnel, user, profile, userSCD, null, config);
			userFirstEventTime = dayjs(data[0].time).unix();
			numEventsPreformed += data.length;
			eventData.hookPush(data);
			if (!userConverted) continue loopUsers;
		}

		while (numEventsPreformed < numEventsThisUserWillPreform) {
			if (usageFunnels.length) {
				/** @type {Funnel} */
				const currentFunnel = chance.pickone(usageFunnels);
				const [data, userConverted] = makeFunnel(currentFunnel, user, profile, userSCD, userFirstEventTime, config);
				numEventsPreformed += data.length;
				eventData.hookPush(data);
			}
		}
		// end individual user loop
	}

	//flatten SCD tables
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

	// SHIFT TIME
	const actualNow = dayjs();
	const fixedNow = dayjs.unix(global.NOW);
	const timeShift = actualNow.diff(fixedNow, "second");

	eventData.forEach((event) => {
		try {
			const newTime = dayjs(event.time).add(timeShift, "second");
			event.time = newTime.toISOString();
			if (epochStart && newTime.unix() < epochStart) event = {};
			if (epochEnd && newTime.unix() > epochEnd) event = {};
		}
		catch (e) {
			//noop
		}
	});

	// const dayShift = actualNow.diff(global.NOW, "day");
	// userProfilesData.forEach((profile) => {
	// 	const newTime = dayjs(profile.created).add(dayShift, "day");
	// 	profile.created = newTime.toISOString();
	// });


	// draw charts
	if (makeChart) {
		const bornEvents = config.events?.filter((e) => e.isFirstEvent)?.map(e => e.event) || [];
		const bornFunnels = config.funnels?.filter((f) => f.isFirstFunnel)?.map(f => f.sequence[0]) || [];
		const bornBehaviors = [...bornEvents, ...bornFunnels];
		const chart = await generateLineChart(eventData, bornBehaviors, makeChart);
	}

	// create mirrorProps
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
		u.buildFileNames(config);
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
		track('end simulation', trackingParams);
		return {
			eventData,
			userProfilesData,
			scdTableData,
			groupProfilesData,
			lookupTableData,
			mirrorEventData,
			importResults: {},
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
			showProgress: true
		};

		if (eventData) {
			log(`importing events to mixpanel...\n`);
			const imported = await mp(creds, eventData, {
				recordType: "event",
				...commonOpts,
			});
			log(`\tsent ${comma(imported.success)} events\n`);
			importResults.events = imported;
		}
		if (userProfilesData) {
			log(`importing user profiles to mixpanel...\n`);
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
				log(`importing ${groupKey} profiles to mixpanel...\n`);
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
	track('end simulation', trackingParams);

	return {
		importResults,
		files: [eventFiles, userFiles, scdFiles, groupFiles, lookupFiles, mirrorFiles, folder],
		eventData,
		userProfilesData,
		scdTableData,
		groupProfilesData,
		lookupTableData,
		mirrorEventData,
	};
}

/**
 * creates a random event
 * @param  {string} distinct_id
 * @param  {string[]} anonymousIds
 * @param  {string[]} sessionIds
 * @param  {number} earliestTime
 * @param  {EventConfig} chosenEvent
 * @param  {Object} superProps
 * @param  {Object} groupKeys
 * @param  {Boolean} isFirstEvent=false
 */
function makeEvent(distinct_id, anonymousIds, sessionIds, earliestTime, chosenEvent, superProps, groupKeys, isFirstEvent = false) {
	const { mean = 0, dev = 2, peaks = 5 } = CONFIG.soup;
	//event model
	const eventTemplate = {
		event: chosenEvent.event,
		source: "dm4",
	};

	//event time
	if (earliestTime > NOW) {
		earliestTime = dayjs.unix(NOW).subtract(2, 'd').unix();
	};

	if (isFirstEvent) eventTemplate.time = dayjs.unix(earliestTime).toISOString();
	if (!isFirstEvent) eventTemplate.time = u.TimeSoup(earliestTime, NOW, peaks, dev, mean);

	// anonymous and session ids
	if (CONFIG?.anonIds) eventTemplate.device_id = CONFIG.chance.pickone(anonymousIds);
	if (CONFIG?.sessionIds) eventTemplate.session_id = CONFIG.chance.pickone(sessionIds);

	//sometimes have a user_id
	if (!isFirstEvent && CONFIG.chance.bool({ likelihood: 42 })) eventTemplate.user_id = distinct_id;

	// ensure that there is a user_id or device_id
	if (!eventTemplate.user_id && !eventTemplate.device_id) eventTemplate.user_id = distinct_id;

	const props = { ...chosenEvent.properties, ...superProps };

	//iterate through custom properties
	for (const key in props) {
		try {
			eventTemplate[key] = u.choose(props[key]);
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
		if (!groupEvents.length) eventTemplate[groupKey] = u.pick(u.weightedRange(1, groupCardinality));
		if (groupEvents.includes(eventTemplate.event)) eventTemplate[groupKey] = u.pick(u.weightedRange(1, groupCardinality));
	}

	//make $insert_id
	eventTemplate.insert_id = md5(JSON.stringify(eventTemplate));

	return eventTemplate;
}

/**
 * creates a funnel of events for a user
 * this is called multiple times for a user
 * @param  {Funnel} funnel
 * @param  {Person} user
 * @param  {UserProfile} profile
 * @param  {Record<string, SCDTableRow[]>} scd
 * @param  {number} firstEventTime
 * @param  {Config} config
 * @return {[EventSpec[], Boolean]}
 */
function makeFunnel(funnel, user, profile, scd, firstEventTime, config) {
	const { hook } = config;
	hook(funnel, "funnel-pre", { user, profile, scd, funnel, config });
	const { sequence, conversionRate = 50, order = 'sequential', timeToConvert = 1, props } = funnel;
	const { distinct_id, created, anonymousIds, sessionIds } = user;
	const { superProps, groupKeys } = config;
	const { name, email } = profile;

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

	const doesUserConvert = config.chance.bool({ likelihood: conversionRate });
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

	const earliestTime = firstEventTime || dayjs(created).unix();
	let funnelStartTime;
	let finalEvents = funnelActualOrder
		.map((event, index) => {
			const newEvent = makeEvent(distinct_id, anonymousIds, sessionIds, earliestTime, event, {}, groupKeys);
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


function makeProfile(props, defaults) {
	//build the spec
	const profile = {
		...defaults,
	};

	// anonymous and session ids
	if (!CONFIG?.anonIds) delete profile.anonymousIds;
	if (!CONFIG?.sessionIds) delete profile.sessionIds;

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
 * @param  {string} created
 */
function makeSCD(prop, scdKey, distinct_id, mutations, created) {
	if (JSON.stringify(prop) === "{}") return {};
	if (JSON.stringify(prop) === "[]") return [];
	const scdEntries = [];
	let lastInserted = dayjs(created);
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
 * @param  {EventConfig[] | string[]} events
 */
function validateEvents(events) {
	if (!Array.isArray(events)) throw new Error("events must be an array");
	const cleanEventConfig = [];
	for (const event of events) {
		if (typeof event === "string") {
			/** @type {EventConfig} */
			const eventTemplate = {
				event,
				isFirstEvent: false,
				properties: {},
				weight: u.integer(1, 5)
			};
			cleanEventConfig.push(eventTemplate);
		}
		if (typeof event === "object") {
			cleanEventConfig.push(event);
		}
	}
	return cleanEventConfig;
}







// this is for CLI
if (require.main === module) {
	isCLI = true;
	const args = cliParams();
	// @ts-ignore
	let { token, seed, format, numDays, numUsers, numEvents, region, writeToDisk, complex = false, sessionIds, anonIds } = args;
	// @ts-ignore
	const suppliedConfig = args._[0];

	//if the user specifies an separate config file
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
			const { events = d, groups = darr, users = d } = data.importResults;
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