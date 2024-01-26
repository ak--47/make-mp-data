/*
make fake mixpanel data easily!
by AK 
ak@mixpanel.com
*/

const mp = require('mixpanel-import');
const path = require('path');
const args = process.argv.slice(2);
const readline = require('readline');
const Chance = require('chance');
const chance = new Chance();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const { date, fakeIp, integer, pick, range, makeProducts, progress, person, choose } = require('./utils.js');
const { touch, load, mkdir } = require('ak-tools');
const Papa = require('papaparse');
Array.prototype.pickOne = pick;
const now = dayjs().unix();
const dayInSec = 86400;

//if the user specifics an separate config file
const suppliedConfig = args[0];
let config = null;
if (suppliedConfig) {
	console.log(`using ${suppliedConfig} for data\n`);
	config = require(path.resolve(suppliedConfig));
} else {
	console.log(`using default config`);
	config = require(path.resolve('./default.js'));
}


//our main program
async function main(config) {	
	const {
		seed = "micturated upon",
		numEvents = 100000,
		numUsers = 1000,
		numDays = 30,
		events = [{ event: "foo" }, { event: "bar" }, { event: "baz" }],
		superProps = { platform: ["web", "iOS", "Android"] },
		userProps = { favoriteColor: ["red", "green", "blue", "yellow"], spiritAnimal: chance.animal },
		scdProps = { NPS: range(0, 10, 150, 1.6) },
		groupKeys = [],
		groupProps = {},
		lookupTables = [],
		format = 'csv'
	} = config;
	
	const uuidChance = new Chance(seed);

	//the function which generates $distinct_id
	function uuid() {
		const distinct_id = uuidChance.guid();
		const daysAgoBorn = chance.integer({ min: 1, max: numDays });
		return {
			distinct_id,
			...person(daysAgoBorn)

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
		.filter(e => e.weight > 0)
		.filter(e => !e.isFirstEvent);
	
	const firstEvents = events.filter(e => e.isFirstEvent);

	const { eventFile, userFile, scdFile, groupFile, lookupFile } = buildFileNames(format);
	const eventData = [];
	const userProfiles = [];
	const scdTable = [];
	const groupProfiles = [];
	const lookupTableData = [];
	const avgEvPerUser = Math.floor(numEvents / numUsers);
	
	//user loop
	for (let i = 1; i < numUsers + 1; i++) {
		progress('users', i);
		const user = uuid();
		const { distinct_id, $created } = user;
		userProfiles.push(makeProfile(userProps, user));
		const mutations = chance.integer({ min: 1, max: 20 });
		scdTable.push(makeSCD(scdProps, distinct_id, mutations, $created));
		const numEventsThisUser = Math.round(chance.normal({ mean: avgEvPerUser, dev: avgEvPerUser / 4 }));

		if (firstEvents) {
			eventData.push(
				makeEvent(
					distinct_id,
					dayjs($created).unix(),
					firstEvents,
					superProps,
					groupKeys,
					true
				));
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
	console.log('\n');

	// make group profiles
	for (const groupPair of groupKeys) {
		const groupKey = groupPair[0];
		const groupCardinality = groupPair[1];
		for (let i = 1; i < groupCardinality + 1; i++) {
			progress('groups', i);
			const group = {
				[groupKey]: i,
				...makeProfile(groupProps[groupKey])
			};
			groupProfiles.push(group);
		}

	}
	console.log('\n');

	const pairs = [
		[eventFile, eventData],
		[userFile, userProfiles],
		[scdFile, scdTable],
		[groupFile, groupProfiles],
		[lookupFile, lookupTableData]
	];

	//write the files


	//send to mixpanel



	debugger;
	return eventData;

}



function makeProfile(props, defaults) {
	//build the spec
	const profile = {
		...defaults
	};

	for (const key in props) {
		try {
			profile[key] = choose(props[key]);
		}
		catch (e) {
			// debugger;
		}
	}

	return profile;
}

function makeSCD(props, distinct_id, mutations, $created) {
	const scdEntries = [];
	let lastInserted = dayjs($created);
	const deltaDays = dayjs().diff(lastInserted, 'day');

	for (let i = 0; i < mutations; i++) {
		if (lastInserted.isAfter(dayjs())) break;
		const scd = makeProfile(props, { distinct_id });
		scd.startTime = lastInserted.toISOString();
		lastInserted = lastInserted.add(integer(1, 1000), 'seconds');
		scd.insertTime = lastInserted.toISOString();
		scdEntries.push({ ...scd });
		lastInserted = lastInserted.add(integer(0, deltaDays), 'day').subtract(integer(1, 1000), "seconds");


	}

	return scdEntries;

}


function makeEvent(distinct_id, earliestTime, events, superProps, groupKeys, isFirstEvent = false) {
	let chosenEvent = events.pickOne();
	if (typeof chosenEvent === 'string') chosenEvent = { event: chosenEvent, properties: {} };
	const event = {
		event: chosenEvent.event,
		distinct_id,
		$source: "make-mp-data"
	};

	if (isFirstEvent) event.time = earliestTime;
	if (!isFirstEvent) event.time = integer(earliestTime, now);

	const props = { ...chosenEvent.properties, ...superProps };

	//iterate through custom properties
	for (const key in props) {
		try {
			event[key] = choose(props[key]);
		}
		catch (e) {
			debugger;
		}
	}

	//iterate through groups
	for (const groupPair of groupKeys) {
		const groupKey = groupPair[0];
		const groupCardinality = groupPair[1];
		event[groupKey] = range(1, groupCardinality).pickOne();
	}

	return event;
}


function buildFileNames(extension = 'csv') {
	const current = dayjs.utc().format('YYYY-MM-DD-HH-mm-ss');
	const cwd = path.resolve("./");
	const dataDir = path.join(cwd, 'data');
	const writeDir = mkdir(dataDir);

	return {
		eventFile: path.join(writeDir, `eventData-${current}.${extension}`),
		userFile: path.join(writeDir, `userProfiles-${current}.${extension}`),
		scdFile: path.join(writeDir, `scdData-${current}.${extension}`),
		groupFile: path.join(writeDir, `groupProfiles-${current}.${extension}`),
		lookupFile: path.join(writeDir, `lookupTables-${current}.csv`),
	};

}



//that's all folks :)
main(config)
	.then((data) => {

	})
	.catch((e) => {
		console.log(`------------------ERROR------------------`)
		console.error(e);
		console.log(`------------------ERROR------------------`)
		debugger;
	})
	.finally(() => {

	});