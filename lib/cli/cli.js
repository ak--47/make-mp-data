import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/** @typedef {import('../../types').Dungeon} Config */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.join(__dirname, '../../package.json');
const { version } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const hero = String.raw`
                        
┏┳┓┏┓  ┏┫┏┓╋┏┓  ┏┓┏┓┏┓┏┓┏┓┏┓╋┏┓┏┓
┛┗┗┣┛  ┗┻┗┻┗┗┻  ┗┫┗ ┛┗┗ ┛ ┗┻┗┗┛┛ 
   ┛             ┛               
makes all the things for mixpanel (v${version || 1})
by ak@mixpanel.com
-----------------------------------------
   `;



function cliParams() {
	console.log(hero);
	const args = yargs(process.argv.splice(2))
		.scriptName("make-mp-data")
		.usage(`\nusage:\nnpx $0 [dataModel.js] [options]

		examples:
npx $0                                    (uses simple data model by default)
npx $0 --complex                          (full enterprise data model)
npx $0 --token 1234 --u 100 --e 1000     (send data to mixpanel)
npx $0 myDataConfig.js                    (use custom config)

DOCS: https://github.com/ak--47/make-mp-data
DATA MODEL: https://github.com/ak--47/make-mp-data/blob/main/default.js
`)
		.command('$0', 'model mixpanel data', () => { })
		.option("token", {
			demandOption: false,
			alias: 't',
			describe: 'project token; if supplied data will be sent to mixpanel',
			type: 'string'
		})
		.option("batchSize", {
			demandOption: false,
			alias: 'b',
			describe: 'batch size for chunking data',
			type: 'number'
		})
		.option("seed", {
			demandOption: false,
			alias: 's',
			describe: 'randomness seed; used to create distinct_ids',
			type: 'string'
		})
		.option("format", {
			demandOption: false,
			alias: 'f',
			describe: 'csv or json',
			type: 'string'
		})
		.option("numDays", {
			demandOption: false,
			alias: 'd',
			describe: 'number of days in past to model',
			type: 'number',
		})
		.option("numUsers", {
			demandOption: false,
			alias: 'u',
			describe: 'number of users to model',
			type: 'number',
		})
		.option("numEvents", {
			demandOption: false,
			alias: 'e',
			describe: 'number of events to model',
			type: 'number',
		})
		.option("epochStart", {
			alias: 'start',
			demandOption: false,
			describe: 'start epoch time',
			type: 'number',
		})
		.option("epochEnd", {
			alias: 'end',
			demandOption: false,
			describe: 'end epoch time',
			type: 'number',
		})
		.option("region", {
			demandOption: false,
			default: 'US',
			alias: 'r',
			describe: 'either US or EU or IN',
			type: 'string'
		})
		.option('concurrency', {
			alias: 'conn',
			default: 10,
			demandOption: false,
			describe: 'concurrency level for data generation',
			type: 'number'
		})
		.options("complex", {
			demandOption: false,
			default: false,
			describe: 'use complex data model (model all entities)',
			alias: 'c',
			type: 'boolean',
			coerce: boolCoerce
		})
		.options("simple", {
			demandOption: false,
			default: false,
			describe: 'use simple data model (basic events and users)',
			alias: 'simp',
			type: 'boolean',
			coerce: boolCoerce
		})
		.option("writeToDisk", {
			demandOption: false,
			default: true,
			describe: 'write data to disk',
			alias: 'w',
			type: 'boolean',
			coerce: boolCoerce
		})
		.option("hasSessionIds", {
			demandOption: false,
			default: false,
			describe: 'create session ids in the data',
			alias: 'sid',
			type: 'boolean',
			coerce: boolCoerce
		})
		.option("hasAnonIds", {
			demandOption: false,
			default: false,
			describe: 'create anonymous ids in the data',
			alias: 'aid',
			type: 'boolean',
			coerce: boolCoerce
		})
		.option("verbose", {
			alias: 'v',
			demandOption: false,
			describe: 'enable verbose logging',
			type: 'boolean',
			coerce: boolCoerce
		})
		.option("makeChart", {
			alias: 'mc',
			demandOption: false,
			describe: 'create a PNG chart from data',
			type: 'boolean',
			coerce: boolCoerce
		})
		.option("hasAdSpend", {
			alias: 'ads',
			demandOption: false,
			describe: 'include ad spend data',
			type: 'boolean',
			coerce: boolCoerce
		})
		.option("hasCampaigns", {
			alias: 'camp',
			demandOption: false,
			describe: 'include campaign data',
			type: 'boolean',
			coerce: boolCoerce
		})
		.option("hasLocation", {
			alias: 'loc',
			demandOption: false,
			describe: 'include location data',
			type: 'boolean',
			coerce: boolCoerce
		})
		.option("isAnonymous", {
			alias: 'anon',
			demandOption: false,
			describe: 'generate anonymous data',
			type: 'boolean',
			coerce: boolCoerce
		})
		.option("hasBrowser", {
			alias: 'browser',
			demandOption: false,
			describe: 'include browser data',
			type: 'boolean',
			coerce: boolCoerce
		})
		.option("hasAndroidDevices", {
			alias: 'android',
			demandOption: false,
			describe: 'include Android device data',
			type: 'boolean',
			coerce: boolCoerce
		})
		.option("hasDesktopDevices", {
			alias: 'desktop',
			demandOption: false,
			describe: 'include desktop device data',
			type: 'boolean',
			coerce: boolCoerce
		})
		.option("hasIOSDevices", {
			alias: 'ios',
			demandOption: false,
			describe: 'include iOS device data',
			type: 'boolean',
			coerce: boolCoerce
		})

		.help()
		.wrap(null)
		.argv;

	//cli is always verbose mode:
	args.verbose = true;

	return args;

}


function boolCoerce(value, foo) {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string') {
		return value.toLowerCase() === 'true';
	}
	return value;

}


export default cliParams;