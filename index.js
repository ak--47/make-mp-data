#! /usr/bin/env node

/*
make fake mixpanel data easily!
by AK 
ak@mixpanel.com
*/

//todo: churn implementation
//todo: regular interval events (like 'card charged')
//todo: SCDs send to mixpanel
//todo: decent 'new dungeon' workflow


//TIME
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const FIXED_NOW = dayjs('2024-02-02').unix();
global.FIXED_NOW = FIXED_NOW;
// ^ this creates a FIXED POINT in time; we will shift it later
let FIXED_BEGIN = dayjs.unix(FIXED_NOW).subtract(90, 'd').unix();
const actualNow = dayjs();
const timeShift = actualNow.diff(dayjs.unix(FIXED_NOW), "seconds");
const daysShift = actualNow.diff(dayjs.unix(FIXED_NOW), "days");

// UTILS
const { existsSync } = require("fs");
const pLimit = require('p-limit');
const os = require("os");
const path = require("path");
const { comma, bytesHuman, makeName, md5, clone, tracker, uid, timer, ls, rm, touch, load, sLog } = require("ak-tools");
const jobTimer = timer('job');
const { generateLineChart } = require('./components/chart.js');
const { version } = require('./package.json');
const mp = require("mixpanel-import");
const u = require("./components/utils.js");
const getCliParams = require("./components/cli.js");
const metrics = tracker("make-mp-data", "db99eb8f67ae50949a13c27cacf57d41", os.userInfo().username);


//CLOUD
const functions = require('@google-cloud/functions-framework');

// DEFAULTS
const { campaigns, devices, locations } = require('./components/defaults.js');
let CAMPAIGNS;
let DEFAULTS;
/** @type {Storage} */
let STORAGE;
/** @type {Config} */
let CONFIG;
require('dotenv').config();

const { NODE_ENV = "unknown" } = process.env;




// RUN STATE
let VERBOSE = false;
let isCLI = false;
// if we are running in batch mode, we MUST write to disk before we can send to mixpanel
let isBATCH_MODE = false;
let BATCH_SIZE = 500_000;

//todo: these should be moved into the hookedArrays
let operations = 0;
let eventCount = 0;
let userCount = 0;



/**
 * generates fake mixpanel data
 * @param  {Config} config
 */
async function main(config) {
	jobTimer.start();
	const seedWord = process.env.SEED || config.seed || "hello friend!";
	config.seed = seedWord;
	const chance = u.initChance(seedWord);
	//seed the random number generator, get it with getChance()
	// ^ this is critical; same seed = same data; 
	// ^ seed can be passed in as an env var or in the config
	validateDungeonConfig(config);
	global.FIXED_BEGIN = dayjs.unix(FIXED_NOW).subtract(config.numDays, 'd').unix();

	//GLOBALS
	CONFIG = config;
	VERBOSE = config.verbose;
	CAMPAIGNS = campaigns;
	DEFAULTS = {
		locationsUsers: u.pickAWinner(clone(locations).map(l => { delete l.country; return l; }), 0),
		locationsEvents: u.pickAWinner(clone(locations).map(l => { delete l.country_code; return l; }), 0),
		iOSDevices: u.pickAWinner(devices.iosDevices, 0),
		androidDevices: u.pickAWinner(devices.androidDevices, 0),
		desktopDevices: u.pickAWinner(devices.desktopDevices, 0),
		browsers: u.pickAWinner(devices.browsers, 0),
		campaigns: u.pickAWinner(campaigns, 0),
	};


	//TRACKING
	const runId = uid(42);
	const { events, superProps, userProps, scdProps, groupKeys, groupProps, lookupTables, soup, hook, mirrorProps, ...trackingParams } = config;
	let { funnels } = config;
	trackingParams.runId = runId;
	trackingParams.version = version;
	delete trackingParams.funnels;

	//STORAGE
	const { simulationName, format } = config;
	const eventData = await makeHookArray([], { hook, type: "event", config, format, filepath: `${simulationName}-EVENTS` });
	const userProfilesData = await makeHookArray([], { hook, type: "user", config, format, filepath: `${simulationName}-USERS` });
	const adSpendData = await makeHookArray([], { hook, type: "ad-spend", config, format, filepath: `${simulationName}-AD-SPEND` });

	// SCDs, Groups, + Lookups may have multiple tables
	const scdTableKeys = Object.keys(scdProps);
	const scdTableData = await Promise.all(scdTableKeys.map(async (key) =>
		await makeHookArray([], { hook, type: "scd", config, format, scdKey: key, filepath: `${simulationName}-SCD-${key}` })
	));
	const groupTableKeys = Object.keys(groupKeys);
	const groupProfilesData = await Promise.all(groupTableKeys.map(async (key, index) => {
		const groupKey = groupKeys[index]?.slice()?.shift();
		return await makeHookArray([], { hook, type: "group", config, format, groupKey, filepath: `${simulationName}-GROUPS-${groupKey}` });
	}));

	const lookupTableKeys = Object.keys(lookupTables);
	const lookupTableData = await Promise.all(lookupTableKeys.map(async (key, index) => {
		const lookupKey = lookupTables[index].key;
		return await makeHookArray([], { hook, type: "lookup", config, format, lookupKey: lookupKey, filepath: `${simulationName}-LOOKUP-${lookupKey}` });
	}));

	const mirrorEventData = await makeHookArray([], { hook, type: "mirror", config, format, filepath: `${simulationName}-MIRROR` });

	STORAGE = { eventData, userProfilesData, scdTableData, groupProfilesData, lookupTableData, mirrorEventData, adSpendData };


	track('start simulation', trackingParams);
	log(`------------------SETUP------------------`);
	log(`\nyour data simulation will heretofore be known as: \n\n\t${config.simulationName.toUpperCase()}...\n`);
	log(`and your configuration is:\n\n`, JSON.stringify(trackingParams, null, 2));
	log(`------------------SETUP------------------`, "\n");



	//USERS
	log(`---------------SIMULATION----------------`, "\n\n");
	const { concurrency = 1 } = config;
	await userLoop(config, STORAGE, concurrency);
	const { hasAdSpend, epochStart, epochEnd } = config;

	// AD SPEND
	if (hasAdSpend) {
		const days = u.datesBetween(epochStart, epochEnd);
		for (const day of days) {
			const dailySpendData = await makeAdSpend(day);
			for (const spendEvent of dailySpendData) {
				await adSpendData.hookPush(spendEvent);
			}
		}

	}


	log("\n");

	//GROUP PROFILES
	for (const [index, groupPair] of groupKeys.entries()) {
		const groupKey = groupPair[0];
		const groupCardinality = groupPair[1];
		for (let i = 1; i < groupCardinality + 1; i++) {
			if (VERBOSE) u.progress([["groups", i]]);
			const props = await makeProfile(groupProps[groupKey]);
			const group = {
				[groupKey]: i,
				...props,
			};
			group["distinct_id"] = i.toString();
			await groupProfilesData[index].hookPush(group);
		}
	}
	log("\n");

	//LOOKUP TABLES
	for (const [index, lookupTable] of lookupTables.entries()) {
		const { key, entries, attributes } = lookupTable;
		for (let i = 1; i < entries + 1; i++) {
			if (VERBOSE) u.progress([["lookups", i]]);
			const props = await makeProfile(attributes);
			const item = {
				[key]: i,
				...props,
			};
			await lookupTableData[index].hookPush(item);
		}

	}
	log("\n");


	// MIRROR
	if (Object.keys(mirrorProps).length) await makeMirror(config, STORAGE);


	log("\n");
	log(`---------------SIMULATION----------------`, "\n");

	// draw charts
	const { makeChart } = config;
	if (makeChart) {
		const bornEvents = config.events?.filter((e) => e?.isFirstEvent)?.map(e => e.event) || [];
		const bornFunnels = config.funnels?.filter((f) => f.isFirstFunnel)?.map(f => f.sequence[0]) || [];
		const bornBehaviors = [...bornEvents, ...bornFunnels];
		const chart = await generateLineChart(eventData, bornBehaviors, makeChart);
	}
	const { writeToDisk, token } = config;
	if (!writeToDisk && !token) {
		jobTimer.stop(false);
		const { start, end, delta, human } = jobTimer.report(false);
		// this is awkward, but i couldn't figure out any other way to assert a type in jsdoc
		const i =  /** @type {any} */ (STORAGE);
		i.time = { start, end, delta, human };
		const j = /** @type {Result} */ (i);
		return j;

	}

	log(`-----------------WRITES------------------`, `\n\n`);

	// write to disk and/or send to mixpanel
	let files;
	if (writeToDisk) {
		for (const key in STORAGE) {
			const table = STORAGE[key];
			if (table.length && typeof table.flush === "function") {
				await table.flush();
			} else {
				if (Array.isArray(table) && typeof table[0]?.flush === "function") {
					for (const subTable of table) {
						await subTable.flush();
					}
				}
			}
		}
	}
	let importResults;
	if (token) importResults = await sendToMixpanel(config, STORAGE);


	log(`\n-----------------WRITES------------------`, "\n");
	track('end simulation', trackingParams);
	jobTimer.stop(false);
	const { start, end, delta, human } = jobTimer.report(false);

	return {
		...STORAGE,
		importResults,
		files,
		time: { start, end, delta, human },
	};
}



functions.http('entry', async (req, res) => {
	const reqTimer = timer('request');
	reqTimer.start();
	let response = {};
	let script = req.body;
	let writePath;
	try {
		sLog("DM4: start");
		const tempDir = NODE_ENV === "dev" ? path.join(__dirname, "tmp") : os.tmpdir();
		writePath = path.join(tempDir, `${makeName()}.js`);
		await touch(writePath, script);
		/** @type {Config} */
		const config = require(writePath);

		const { token } = config;
		if (!token) throw new Error("no token");

		/** @type {Config} */
		const optionsYouCantChange = {
			verbose: false,
			writeToDisk: false,

		};
		const result = await main({
			...config,
			...optionsYouCantChange,
		});
		await rm(writePath);
		reqTimer.stop(false);
		const { start, end, delta, human } = jobTimer.report(false);
		sLog(`DM4: end (${human})`, { ms: delta });
	}
	catch (e) {
		sLog("DM4: error", { error: e.message });
		response = { error: e.message };
		res.status(500);
		await rm(writePath);
	}
	finally {
		res.send(response);
	}
});


/*
------
MODELS
------
*/

/**
 * creates a mixpanel event with a flat shape
 * @param  {string} distinct_id
 * @param  {number} earliestTime
 * @param  {EventConfig} chosenEvent
 * @param  {string[]} [anonymousIds]
 * @param  {string[]} [sessionIds] 
 * @param  {Object} [superProps]
 * @param  {Object} [groupKeys]
 * @param  {Boolean} [isFirstEvent]
 * @return {Promise<EventSchema>}
 */
async function makeEvent(distinct_id, earliestTime, chosenEvent, anonymousIds, sessionIds, superProps, groupKeys, isFirstEvent) {
	operations++;
	eventCount++;
	if (!distinct_id) throw new Error("no distinct_id");
	if (!anonymousIds) anonymousIds = [];
	if (!sessionIds) sessionIds = [];
	if (!earliestTime) throw new Error("no earliestTime");
	if (!chosenEvent) throw new Error("no chosenEvent");
	if (!superProps) superProps = {};
	if (!groupKeys) groupKeys = [];
	if (!isFirstEvent) isFirstEvent = false;
	const chance = u.getChance();
	const { mean = 0, deviation = 2, peaks = 5 } = CONFIG?.soup || {};
	const {
		hasAndroidDevices = false,
		hasBrowser = false,
		hasCampaigns = false,
		hasDesktopDevices = false,
		hasIOSDevices = false,
		hasLocation = false
	} = CONFIG || {};

	//event model
	const eventTemplate = {
		event: chosenEvent.event,
		source: "dm4",
		time: "",
		insert_id: "",
	};

	let defaultProps = {};
	let devicePool = [];
	if (hasLocation) defaultProps.location = DEFAULTS.locationsEvents();
	if (hasBrowser) defaultProps.browser = DEFAULTS.browsers();
	if (hasAndroidDevices) devicePool.push(DEFAULTS.androidDevices());
	if (hasIOSDevices) devicePool.push(DEFAULTS.iOSDevices());
	if (hasDesktopDevices) devicePool.push(DEFAULTS.desktopDevices());
	// we don't always have campaigns, because of attribution
	if (hasCampaigns && chance.bool({ likelihood: 25 })) defaultProps.campaigns = DEFAULTS.campaigns();
	const devices = devicePool.flat();
	if (devices.length) defaultProps.device = devices;


	//event time
	// if (earliestTime > FIXED_NOW) {
	// 	earliestTime = dayjs(u.TimeSoup(global.FIXED_BEGIN)).unix();
	// };

	if (isFirstEvent) eventTemplate.time = dayjs.unix(earliestTime).toISOString();
	if (!isFirstEvent) eventTemplate.time = u.TimeSoup(earliestTime, FIXED_NOW, peaks, deviation, mean);
	// eventTemplate.time = u.TimeSoup(earliestTime, FIXED_NOW, peaks, deviation, mean);

	// anonymous and session ids
	if (anonymousIds.length) eventTemplate.device_id = chance.pickone(anonymousIds);
	if (sessionIds.length) eventTemplate.session_id = chance.pickone(sessionIds);

	//sometimes have a user_id
	if (!isFirstEvent && chance.bool({ likelihood: 42 })) eventTemplate.user_id = distinct_id;

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

	//iterate through default properties
	for (const key in defaultProps) {
		if (Array.isArray(defaultProps[key])) {
			const choice = u.choose(defaultProps[key]);
			if (typeof choice === "string") {
				if (!eventTemplate[key]) eventTemplate[key] = choice;
			}

			else if (Array.isArray(choice)) {
				for (const subChoice of choice) {
					if (!eventTemplate[key]) eventTemplate[key] = subChoice;
				}
			}

			else if (typeof choice === "object") {
				for (const subKey in choice) {
					if (typeof choice[subKey] === "string") {
						if (!eventTemplate[subKey]) eventTemplate[subKey] = choice[subKey];
					}
					else if (Array.isArray(choice[subKey])) {
						const subChoice = u.choose(choice[subKey]);
						if (!eventTemplate[subKey]) eventTemplate[subKey] = subChoice;
					}

					else if (typeof choice[subKey] === "object") {
						for (const subSubKey in choice[subKey]) {
							if (!eventTemplate[subSubKey]) eventTemplate[subSubKey] = choice[subKey][subSubKey];
						}
					}

				}
			}


		}
	}

	//iterate through groups
	for (const groupPair of groupKeys) {
		const groupKey = groupPair[0];
		const groupCardinality = groupPair[1];
		const groupEvents = groupPair[2] || [];

		// empty array for group events means all events
		if (!groupEvents.length) eventTemplate[groupKey] = u.pick(u.weighNumRange(1, groupCardinality));
		if (groupEvents.includes(eventTemplate.event)) eventTemplate[groupKey] = u.pick(u.weighNumRange(1, groupCardinality));
	}

	//make $insert_id
	eventTemplate.insert_id = md5(JSON.stringify(eventTemplate));

	// move time forward
	const timeShifted = dayjs(eventTemplate.time).add(timeShift, "seconds").toISOString();
	eventTemplate.time = timeShifted;


	return eventTemplate;
}

/**
 * takes a description of a funnel an generates successful and unsuccessful conversions
 * this is called MANY times per user
 * @param  {Funnel} funnel
 * @param  {Person} user
 * @param  {number} firstEventTime
 * @param  {UserProfile | Object} [profile]
 * @param  {Record<string, SCDSchema[]> | Object} [scd]
 * @param  {Config} [config]
 * @return {Promise<[EventSchema[], Boolean]>}
 */
async function makeFunnel(funnel, user, firstEventTime, profile, scd, config) {
	if (!funnel) throw new Error("no funnel");
	if (!user) throw new Error("no user");
	if (!profile) profile = {};
	if (!scd) scd = {};

	const chance = u.getChance();
	const { hook = async (a) => a } = config;
	await hook(funnel, "funnel-pre", { user, profile, scd, funnel, config });
	let {
		sequence,
		conversionRate = 50,
		order = 'sequential',
		timeToConvert = 1,
		props,
		requireRepeats = false,
	} = funnel;
	const { distinct_id, created, anonymousIds, sessionIds } = user;
	const { superProps, groupKeys } = config;


	//choose the properties for this funnel
	const chosenFunnelProps = { ...props, ...superProps };
	for (const key in props) {
		try {
			chosenFunnelProps[key] = u.choose(chosenFunnelProps[key]);
		} catch (e) {
			console.error(`error with ${key} in ${funnel.sequence.join(" > ")} funnel`, e);
			debugger;
		}
	}

	const funnelPossibleEvents = sequence
		.map((eventName) => {
			const foundEvent = config?.events?.find((e) => e.event === eventName);
			/** @type {EventConfig} */
			const eventSpec = clone(foundEvent) || { event: eventName, properties: {} };
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
		})
		.reduce((acc, step) => {
			if (!requireRepeats) {
				if (acc.find(e => e.event === step.event)) {
					if (chance.bool({ likelihood: 50 })) {
						conversionRate = Math.floor(conversionRate * 1.35); //increase conversion rate
						acc.push(step);
					}
					//A SKIPPED STEP!
					else {
						conversionRate = Math.floor(conversionRate * .70); //reduce conversion rate
						return acc; //early return to skip the step
					}
				}
				else {
					acc.push(step);
				}
			}
			else {
				acc.push(step);
			}
			return acc;
		}, []);

	let doesUserConvert = chance.bool({ likelihood: conversionRate });
	let numStepsUserWillTake = sequence.length;
	if (!doesUserConvert) numStepsUserWillTake = u.integer(1, sequence.length - 1);
	const funnelTotalRelativeTimeInHours = timeToConvert / numStepsUserWillTake;
	const msInHour = 60000 * 60;
	const funnelStepsUserWillTake = funnelPossibleEvents.slice(0, numStepsUserWillTake);

	let funnelActualOrder = [];

	switch (order) {
		case "sequential":
			funnelActualOrder = funnelStepsUserWillTake;
			break;
		case "random":
			funnelActualOrder = u.shuffleArray(funnelStepsUserWillTake);
			break;
		case "first-fixed":
			funnelActualOrder = u.shuffleExceptFirst(funnelStepsUserWillTake);
			break;
		case "last-fixed":
			funnelActualOrder = u.shuffleExceptLast(funnelStepsUserWillTake);
			break;
		case "first-and-last-fixed":
			funnelActualOrder = u.fixFirstAndLast(funnelStepsUserWillTake);
			break;
		case "middle-fixed":
			funnelActualOrder = u.shuffleOutside(funnelStepsUserWillTake);
			break;
		case "interrupted":
			const potentialSubstitutes = config?.events
				?.filter(e => !e.isFirstEvent)
				?.filter(e => !sequence.includes(e.event)) || [];
			funnelActualOrder = u.interruptArray(funnelStepsUserWillTake, potentialSubstitutes);
			break;
		default:
			funnelActualOrder = funnelStepsUserWillTake;
			break;
	}



	let lastTimeJump = 0;
	const funnelActualEventsWithOffset = funnelActualOrder
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


	const earliestTime = firstEventTime || dayjs(created).unix();
	let funnelStartTime;
	let finalEvents = await Promise.all(funnelActualEventsWithOffset
		.map(async (event, index) => {
			const newEvent = await makeEvent(distinct_id, earliestTime, event, anonymousIds, sessionIds, {}, groupKeys);
			if (index === 0) {
				funnelStartTime = dayjs(newEvent.time);
				delete newEvent.relativeTimeMs;
				return Promise.resolve(newEvent);
			}
			try {
				newEvent.time = dayjs(funnelStartTime).add(event.relativeTimeMs, "milliseconds").toISOString();
				delete newEvent.relativeTimeMs;
				return Promise.resolve(newEvent);
			}
			catch (e) {
				//shouldn't happen
				debugger;
			}
		}));


	await hook(finalEvents, "funnel-post", { user, profile, scd, funnel, config });
	return [finalEvents, doesUserConvert];
}

/**
 * a function that creates a profile (user or group)
 * @overload
 * @param  {{[key: string]: ValueValid}} props
 * @param  {{[key: string]: ValueValid}} [defaults]
 * @returns {Promise<UserProfile>}
 * 
 * @overload
 * @param  {{[key: string]: ValueValid}} props
 * @param  {{[key: string]: ValueValid}} [defaults]
 * @returns {Promise<GroupProfile>}
 */
async function makeProfile(props, defaults) {
	operations++;

	const profile = {
		...defaults,
	};

	for (const key in props) {
		try {
			profile[key] = u.choose(props[key]);
		} catch (e) {
			// never gets here
			// debugger;
		}
	}

	return profile;
}

/**
 * @param  {ValueValid} prop
 * @param  {string} scdKey
 * @param  {string} distinct_id
 * @param  {number} mutations
 * @param  {string} created
 * @return {Promise<SCDSchema[]>}
 */
async function makeSCD(prop, scdKey, distinct_id, mutations, created) {
	if (JSON.stringify(prop) === "{}" || JSON.stringify(prop) === "[]") return [];
	const scdEntries = [];
	let lastInserted = dayjs(created);
	const deltaDays = dayjs().diff(lastInserted, "day");

	for (let i = 0; i < mutations; i++) {
		if (lastInserted.isAfter(dayjs())) break;
		let scd = await makeProfile({ [scdKey]: prop }, { distinct_id });

		// Explicitly constructing SCDSchema object with all required properties
		const scdEntry = {
			...scd, // spread existing properties
			distinct_id: scd.distinct_id || distinct_id, // ensure distinct_id is set
			insertTime: lastInserted.add(u.integer(1, 1000), "seconds").toISOString(),
			startTime: lastInserted.toISOString()
		};

		// Ensure TypeScript sees all required properties are set
		if (scdEntry.hasOwnProperty('insertTime') && scdEntry.hasOwnProperty('startTime')) {
			scdEntries.push(scdEntry);
		}

		lastInserted = lastInserted
			.add(u.integer(0, deltaDays), "day")
			.subtract(u.integer(1, 1000), "seconds");
	}

	return scdEntries;
}


/**
 * creates ad spend events for a given day for all campaigns in default campaigns
 * @param  {string} day
 * @return {Promise<EventSchema[]>}
 */
async function makeAdSpend(day, campaigns = CAMPAIGNS) {
	operations++;
	const chance = u.getChance();
	const adSpendEvents = [];
	for (const network of campaigns) {
		const campaigns = network.utm_campaign;
		loopCampaigns: for (const campaign of campaigns) {
			if (campaign === "$organic") continue loopCampaigns;

			const CAC = u.integer(42, 420); //todo: get the # of users created in this day from eventData
			// Randomly generating cost
			const cost = chance.floating({ min: 10, max: 250, fixed: 2 });

			// Ensuring realistic CPC and CTR
			const avgCPC = chance.floating({ min: 0.33, max: 2.00, fixed: 4 });
			const avgCTR = chance.floating({ min: 0.05, max: 0.25, fixed: 4 });

			// Deriving impressions from cost and avg CPC
			const clicks = Math.floor(cost / avgCPC);
			const impressions = Math.floor(clicks / avgCTR);
			const views = Math.floor(impressions * avgCTR);

			//tags 
			const utm_medium = u.choose(u.pickAWinner(network.utm_medium)());
			const utm_content = u.choose(u.pickAWinner(network.utm_content)());
			const utm_term = u.choose(u.pickAWinner(network.utm_term)());
			//each of these is a campaign
			const id = network.utm_source[0] + '-' + campaign;
			const uid = md5(id);
			const adSpendEvent = {
				event: "$ad_spend",
				time: day,
				source: 'dm4',
				utm_campaign: campaign,
				campaign_id: id,
				insert_id: uid,
				network: network.utm_source[0].toUpperCase(),
				distinct_id: network.utm_source[0].toUpperCase(),
				utm_source: network.utm_source[0],
				utm_medium,
				utm_content,
				utm_term,


				clicks,
				views,
				impressions,
				cost,
				date: dayjs(day).format("YYYY-MM-DD"),
			};
			adSpendEvents.push(adSpendEvent);
		}


	}
	return adSpendEvents;
}

/**
 * takes event data and creates mirror datasets in a future state
 * depending on the mirror strategy
 * @param {Config} config
 * @param {Storage} storage
 * @return {Promise<void>}
 */
async function makeMirror(config, storage) {
	const { mirrorProps } = config;
	const { eventData, mirrorEventData } = storage;
	const now = dayjs();

	for (const oldEvent of eventData) {
		let newEvent;
		const eventTime = dayjs(oldEvent.time);
		const delta = now.diff(eventTime, "day");

		for (const mirrorProp in mirrorProps) {
			const prop = mirrorProps[mirrorProp];
			const { daysUnfilled = 7, events = "*", strategy = "create", values = [] } = prop;
			if (events === "*" || events.includes(oldEvent.event)) {
				if (!newEvent) newEvent = clone(oldEvent);

				switch (strategy) {
					case "create":
						newEvent[mirrorProp] = u.choose(values);
						break;
					case "delete":
						delete newEvent[mirrorProp];
						break;
					case "fill":
						if (delta >= daysUnfilled) oldEvent[mirrorProp] = u.choose(values);
						newEvent[mirrorProp] = u.choose(values);
						break;
					case "update":
						if (!oldEvent[mirrorProp]) {
							newEvent[mirrorProp] = u.choose(values);
						}
						else {
							newEvent[mirrorProp] = oldEvent[mirrorProp];
						}
						break;
					default:
						throw new Error(`strategy ${strategy} is unknown`);
				}


			}
		}

		const mirrorDataPoint = newEvent ? newEvent : oldEvent;
		await mirrorEventData.hookPush(mirrorDataPoint);

	}
}


/*
--------------
ORCHESTRATORS
--------------
*/


/**
 * a loop that creates users and their events; the loop is inside this function
 * @param  {Config} config
 * @param  {Storage} storage
 * @param  {number} [concurrency]
 * @return {Promise<void>}
 */
async function userLoop(config, storage, concurrency = 1) {
	const chance = u.getChance();
	const USER_CONN = pLimit(concurrency);
	const {
		verbose,
		numUsers,
		numEvents,
		isAnonymous,
		hasAvatar,
		hasAnonIds,
		hasSessionIds,
		hasLocation,
		funnels,
		userProps,
		scdProps,
		numDays,
	} = config;
	const { eventData, userProfilesData, scdTableData } = storage;
	const avgEvPerUser = numEvents / numUsers;

	for (let i = 0; i < numUsers; i++) {
		await USER_CONN(async () => {
			userCount++;
			if (verbose) u.progress([["users", userCount], ["events", eventCount]]);
			const userId = chance.guid();
			const user = u.generateUser(userId, { numDays, isAnonymous, hasAvatar, hasAnonIds, hasSessionIds });
			const { distinct_id, created } = user;
			const userIsBornInDataset = chance.bool({ likelihood: 5 });
			let numEventsPreformed = 0;
			if (!userIsBornInDataset) delete user.created;
			const adjustedCreated = userIsBornInDataset ? dayjs(created).subtract(daysShift, 'd') : dayjs.unix(global.FIXED_BEGIN);

			if (hasLocation) {
				const location = u.choose(DEFAULTS.locationsUsers);
				for (const key in location) {
					user[key] = location[key];
				}
			}

			// Profile creation
			const profile = await makeProfile(userProps, user);
			await userProfilesData.hookPush(profile);

			// SCD creation
			const scdTableKeys = Object.keys(scdProps);
			const userSCD = {};
			for (const [index, key] of scdTableKeys.entries()) {
				const mutations = chance.integer({ min: 1, max: 10 }); //todo: configurable mutations?
				const changes = await makeSCD(scdProps[key], key, distinct_id, mutations, created);
				userSCD[key] = changes;
				await scdTableData[index].hookPush(changes);
			}

			let numEventsThisUserWillPreform = Math.floor(chance.normal({
				mean: avgEvPerUser,
				dev: avgEvPerUser / u.integer(u.integer(2, 5), u.integer(2, 7))
			}) * 0.714159265359);

			// Power users and Shitty users logic...
			chance.bool({ likelihood: 20 }) ? numEventsThisUserWillPreform *= 5 : null;
			chance.bool({ likelihood: 15 }) ? numEventsThisUserWillPreform *= 0.333 : null;
			numEventsThisUserWillPreform = Math.round(numEventsThisUserWillPreform);

			let userFirstEventTime;

			const firstFunnels = funnels.filter((f) => f.isFirstFunnel).reduce(u.weighFunnels, []);
			const usageFunnels = funnels.filter((f) => !f.isFirstFunnel).reduce(u.weighFunnels, []);

			const secondsInDay = 86400;
			const noise = () => chance.integer({ min: 0, max: secondsInDay });

			if (firstFunnels.length && userIsBornInDataset) {
				const firstFunnel = chance.pickone(firstFunnels, user);

				const firstTime = adjustedCreated.subtract(noise(), 'seconds').unix();
				const [data, userConverted] = await makeFunnel(firstFunnel, user, firstTime, profile, userSCD, config);
				userFirstEventTime = dayjs(data[0].time).subtract(timeShift, 'seconds').unix();
				numEventsPreformed += data.length;
				await eventData.hookPush(data);
				if (!userConverted) {
					if (verbose) u.progress([["users", userCount], ["events", eventCount]]);
					return;
				}
			} else {
				// userFirstEventTime = dayjs(created).unix();
				// userFirstEventTime = global.FIXED_BEGIN;
				userFirstEventTime = adjustedCreated.subtract(noise(), 'seconds').unix();
			}

			while (numEventsPreformed < numEventsThisUserWillPreform) {
				if (usageFunnels.length) {
					const currentFunnel = chance.pickone(usageFunnels);
					const [data, userConverted] = await makeFunnel(currentFunnel, user, userFirstEventTime, profile, userSCD, config);
					numEventsPreformed += data.length;
					await eventData.hookPush(data);
				} else {
					const data = await makeEvent(distinct_id, userFirstEventTime, u.choose(config.events), user.anonymousIds, user.sessionIds, {}, config.groupKeys, true);
					numEventsPreformed++;
					await eventData.hookPush(data);
				}
			}

			if (verbose) u.progress([["users", userCount], ["events", eventCount]]);
		});
	}

}


/**
 * sends the data to mixpanel
 * todo: this needs attention
 * @param  {Config} config
 * @param  {Storage} storage
 */
async function sendToMixpanel(config, storage) {
	const { adSpendData, eventData, groupProfilesData, lookupTableData, mirrorEventData, scdTableData, userProfilesData } = storage;
	const { token, region, writeToDisk } = config;
	const importResults = { events: {}, users: {}, groups: [] };

	/** @type {import('mixpanel-import').Creds} */
	const creds = { token };
	const { format } = config;
	const mpImportFormat = format === "json" ? "jsonl" : "csv";
	/** @type {import('mixpanel-import').Options} */
	const commonOpts = {
		region,
		fixData: true,
		verbose: false,
		forceStream: true,
		strict: false,
		dryRun: false,
		abridged: false,
		fixJson: true,
		showProgress: NODE_ENV === "dev" ? true : false,
		streamFormat: mpImportFormat
	};



	if (eventData || isBATCH_MODE) {
		log(`importing events to mixpanel...\n`);
		let eventDataToImport = clone(eventData);
		if (isBATCH_MODE) {
			const writeDir = eventData.getWriteDir();
			const files = await ls(writeDir.split(path.basename(writeDir)).join(""));
			eventDataToImport = files.filter(f => f.includes('-EVENTS-'));
		}
		const imported = await mp(creds, eventDataToImport, {
			recordType: "event",
			...commonOpts,
		});
		log(`\tsent ${comma(imported.success)} events\n`);
		importResults.events = imported;
	}
	if (userProfilesData || isBATCH_MODE) {
		log(`importing user profiles to mixpanel...\n`);
		let userProfilesToImport = clone(userProfilesData);
		if (isBATCH_MODE) {
			const writeDir = userProfilesData.getWriteDir();
			const files = await ls(writeDir.split(path.basename(writeDir)).join(""));
			userProfilesToImport = files.filter(f => f.includes('-USERS-'));
		}
		const imported = await mp(creds, userProfilesToImport, {
			recordType: "user",
			...commonOpts,
		});
		log(`\tsent ${comma(imported.success)} user profiles\n`);
		importResults.users = imported;
	}
	if (adSpendData || isBATCH_MODE) {
		log(`importing ad spend data to mixpanel...\n`);
		let adSpendDataToImport = clone(adSpendData);
		if (isBATCH_MODE) {
			const writeDir = adSpendData.getWriteDir();
			const files = await ls(writeDir.split(path.basename(writeDir)).join(""));
			adSpendDataToImport = files.filter(f => f.includes('-AD-SPEND-'));
		}
		const imported = await mp(creds, adSpendDataToImport, {
			recordType: "event",
			...commonOpts,
		});
		log(`\tsent ${comma(imported.success)} ad spend events\n`);
		importResults.adSpend = imported;
	}
	if (groupProfilesData || isBATCH_MODE) {
		for (const groupEntity of groupProfilesData) {
			const groupKey = groupEntity?.groupKey;
			log(`importing ${groupKey} profiles to mixpanel...\n`);
			let groupProfilesToImport = clone(groupEntity);
			if (isBATCH_MODE) {
				const writeDir = groupEntity.getWriteDir();
				const files = await ls(writeDir.split(path.basename(writeDir)).join(""));
				groupProfilesToImport = files.filter(f => f.includes(`-GROUPS-${groupKey}`));
			}
			const imported = await mp({ token, groupKey }, groupProfilesToImport, {
				recordType: "group",
				...commonOpts,

			});
			log(`\tsent ${comma(imported.success)} ${groupKey} profiles\n`);

			importResults.groups.push(imported);
		}
	}

	//if we are in batch mode, we need to delete the files
	if (!writeToDisk && isBATCH_MODE) {
		const writeDir = eventData?.getWriteDir() || userProfilesData?.getWriteDir();
		const listDir = await ls(writeDir.split(path.basename(writeDir)).join(""));
		const files = listDir.filter(f => f.includes('-EVENTS-') || f.includes('-USERS-') || f.includes('-AD-SPEND-') || f.includes('-GROUPS-'));
		for (const file of files) {
			await rm(file);
		}
	}
	return importResults;
}

/*
----
META
----
*/


/**
 * ensures that the config is valid and has all the necessary fields
 * also adds some defaults
 * @param  {Config} config
 */
function validateDungeonConfig(config) {
	const chance = u.getChance();
	let {
		seed,
		numEvents = 100_000,
		numUsers = 1000,
		numDays = 30,
		epochStart = 0,
		epochEnd = dayjs().unix(),
		events = [{ event: "foo" }, { event: "bar" }, { event: "baz" }],
		superProps = { luckyNumber: [2, 2, 4, 4, 42, 42, 42, 2, 2, 4, 4, 42, 42, 42, 420] },
		funnels = [],
		userProps = {
			spiritAnimal: chance.animal.bind(chance),
		},
		scdProps = {},
		mirrorProps = {},
		groupKeys = [],
		groupProps = {},
		lookupTables = [],
		hasAnonIds = false,
		hasSessionIds = false,
		format = "csv",
		token = null,
		region = "US",
		writeToDisk = false,
		verbose = false,
		makeChart = false,
		soup = {},
		hook = (record) => record,
		hasAdSpend = false,
		hasCampaigns = false,
		hasLocation = false,
		hasAvatar = false,
		isAnonymous = false,
		hasBrowser = false,
		hasAndroidDevices = false,
		hasDesktopDevices = false,
		hasIOSDevices = false,
		alsoInferFunnels = false,
		name = "",
		batchSize = 500_000,
		concurrency = 500
	} = config;

	//ensuring default for deep objects
	if (!config.superProps) config.superProps = superProps;
	if (!config.userProps || Object.keys(config?.userProps)) config.userProps = userProps;

	//setting up "TIME"
	if (epochStart && !numDays) numDays = dayjs.unix(epochEnd).diff(dayjs.unix(epochStart), "day");
	if (!epochStart && numDays) epochStart = dayjs.unix(epochEnd).subtract(numDays, "day").unix();
	if (epochStart && numDays) { } //noop
	if (!epochStart && !numDays) debugger; //never happens	

	config.simulationName = name || makeName();
	config.name = config.simulationName;

	//max batch size
	if (batchSize > 0) BATCH_SIZE = batchSize;

	// funnels

	// FUNNEL INFERENCE
	if (!funnels || !funnels.length) {
		funnels = inferFunnels(events);
	}

	if (alsoInferFunnels) {
		const inferredFunnels = inferFunnels(events);
		funnels = [...funnels, ...inferredFunnels];
	}

	config.concurrency = concurrency;
	config.funnels = funnels;
	config.batchSize = batchSize;
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
	config.hasAnonIds = hasAnonIds;
	config.hasSessionIds = hasSessionIds;
	config.format = format;
	config.token = token;
	config.region = region;
	config.writeToDisk = writeToDisk;
	config.verbose = verbose;
	config.makeChart = makeChart;
	config.soup = soup;
	config.hook = hook;
	config.hasAdSpend = hasAdSpend;
	config.hasCampaigns = hasCampaigns;
	config.hasLocation = hasLocation;
	config.hasAvatar = hasAvatar;
	config.isAnonymous = isAnonymous;
	config.hasBrowser = hasBrowser;
	config.hasAndroidDevices = hasAndroidDevices;
	config.hasDesktopDevices = hasDesktopDevices;
	config.hasIOSDevices = hasIOSDevices;

	//event validation 
	const validatedEvents = u.validateEventConfig(events);
	events = validatedEvents;
	config.events = validatedEvents;

	return config;
}

/** 
 * our meta programming function which lets you mutate items as they are pushed into an array
 * it also does batching and writing to disk
 * it kind of is a class - as it produces new objects - but it's not a class
 * @param  {Object} arr
 * @param  {hookArrayOptions} opts
 * @returns {Promise<hookArray>}
 */
async function makeHookArray(arr = [], opts = {}) {
	const { hook = a => a, type = "", filepath = "./defaultFile", format = "csv", concurrency = 1, ...rest } = opts;
	const FILE_CONN = pLimit(concurrency); // concurrent file writes
	let batch = 0;
	let writeDir;
	const dataFolder = path.resolve("./data");
	if (existsSync(dataFolder)) writeDir = dataFolder;
	else writeDir = path.resolve("./");

	if (NODE_ENV === "prod") writeDir = path.resolve(os.tmpdir());

	function getWritePath() {
		if (isBATCH_MODE) {
			return path.join(writeDir, `${filepath}-part-${batch.toString()}.${format}`);
		}
		else {
			return path.join(writeDir, `${filepath}.${format}`);
		}
	}

	function getWriteDir() {
		return path.join(writeDir, `${filepath}.${format}`);
	}

	async function transformThenPush(item) {
		if (item === null || item === undefined) return false;
		if (typeof item === 'object' && Object.keys(item).length === 0) return false;

		if (Array.isArray(item)) {
			for (const i of item) {
				try {
					const enriched = await hook(i, type, rest);
					if (Array.isArray(enriched)) enriched.forEach(e => arr.push(e));
					else arr.push(enriched);
				} catch (e) {
					console.error(`\n\nyour hook had an error\n\n`, e);
					arr.push(i);
				}
			}
		} else {
			try {
				const enriched = await hook(item, type, rest);
				if (Array.isArray(enriched)) enriched.forEach(e => arr.push(e));
				else arr.push(enriched);
			} catch (e) {
				console.error(`\n\nyour hook had an error\n\n`, e);
				arr.push(item);
			}
		}

		if (arr.length > BATCH_SIZE) {
			isBATCH_MODE = true;
			batch++;
			const writePath = getWritePath();
			const writeResult = await FILE_CONN(() => writeToDisk(arr, { writePath }));
			return writeResult;
		} else {
			return Promise.resolve(false);
		}
	}

	async function writeToDisk(data, options) {
		const { writePath } = options;
		let writeResult;
		if (VERBOSE) log(`\n\n\twriting ${writePath}\n\n`);
		switch (format) {
			case "csv":
				writeResult = await u.streamCSV(writePath, data);
				break;
			case "json":
				writeResult = await u.streamJSON(writePath, data);
				break;
			default:
				throw new Error(`format ${format} is not supported`);
		}
		if (isBATCH_MODE) data.length = 0;
		return writeResult;
	}

	async function flush() {
		if (arr.length > 0) {
			batch++;
			const writePath = getWritePath();
			await FILE_CONN(() => writeToDisk(arr, { writePath }));
			if (isBATCH_MODE) arr.length = 0; // free up memory for batch mode
		}
	}

	const enrichedArray = arr;

	enrichedArray.hookPush = transformThenPush;
	enrichedArray.flush = flush;
	enrichedArray.getWriteDir = getWriteDir;
	enrichedArray.getWritePath = getWritePath;

	for (const key in rest) {
		enrichedArray[key.toString()] = rest[key];
	}

	return enrichedArray;
}


/**
 * create funnels out of random events
 * @param {EventConfig[]} events
 */
function inferFunnels(events) {
	const createdFunnels = [];
	const firstEvents = events.filter((e) => e.isFirstEvent).map((e) => e.event);
	const usageEvents = events.filter((e) => !e.isFirstEvent).map((e) => e.event);
	const numFunnelsToCreate = Math.ceil(usageEvents.length);
	/** @type {Funnel} */
	const funnelTemplate = {
		sequence: [],
		conversionRate: 50,
		order: 'sequential',
		requireRepeats: false,
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

	return createdFunnels;

}


/*
----
CLI
----
*/

if (NODE_ENV !== "prod") {
	if (require.main === module) {
		isCLI = true;
		const args = /** @type {Config} */ (getCliParams());
		let { token, seed, format, numDays, numUsers, numEvents, region, writeToDisk, complex = false, hasSessionIds, hasAnonIds } = args;
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
		if (hasSessionIds) config.hasSessionIds = hasSessionIds;
		if (hasAnonIds) config.hasAnonIds = hasAnonIds;
		config.verbose = true;

		main(config)
			.then((data) => {
				//todo: rethink summary
				log(`-----------------SUMMARY-----------------`);
				const d = { success: 0, bytes: 0 };
				const darr = [d];
				const { events = d, groups = darr, users = d } = data?.importResults || {};
				const files = data.files;
				const folder = files?.[0]?.split(path.basename(files?.[0]))?.shift();
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
				log("enjoy your data! :)");
				u.openFinder(path.resolve("./data"));
			});
	} else {
		main.generators = { makeEvent, makeFunnel, makeProfile, makeSCD, makeAdSpend, makeMirror };
		main.orchestrators = { userLoop, validateDungeonConfig, sendToMixpanel };
		main.meta = { inferFunnels, hookArray: makeHookArray };
		module.exports = main;
	}
}



/*
----
HELPERS
----
*/

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

function track(name, props, ...rest) {
	if (process.env.NODE_ENV === 'test') return;
	metrics(name, props, ...rest);
}


/** @typedef {import('./types.js').Config} Config */
/** @typedef {import('./types.js').AllData} AllData */
/** @typedef {import('./types.js').EventConfig} EventConfig */
/** @typedef {import('./types.js').Funnel} Funnel */
/** @typedef {import('./types.js').Person} Person */
/** @typedef {import('./types.js').SCDSchema} SCDSchema */
/** @typedef {import('./types.js').UserProfile} UserProfile */
/** @typedef {import('./types.js').EventSchema} EventSchema */
/** @typedef {import('./types.js').Storage} Storage */
/** @typedef {import('./types.js').Result} Result */
/** @typedef {import('./types.js').ValueValid} ValueValid */
/** @typedef {import('./types.js').HookedArray} hookArray */
/** @typedef {import('./types.js').hookArrayOptions} hookArrayOptions */
/** @typedef {import('./types.js').GroupProfileSchema} GroupProfile */