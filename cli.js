const yargs = require('yargs');
const { version } = require('./package.json');

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
npx $0
npx $0 --token 1234 --u 100 --e 1000 --d 7 --w false
npx $0 myDataConfig.js

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
		.option("seed", {
			demandOption: false,
			alias: 's',
			describe: 'randomness seed; used to create distinct_ids',
			type: 'string'
		})
		.option("format", {
			demandOption: false,
			default: 'csv',
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
		.option("region", {
			demandOption: false,
			default: 'US',
			alias: 'r',
			describe: 'either US or EU',
			type: 'string'
		})
		.options("complex", {
			demandOption: false,
			default: false,
			describe: 'use complex data model (model all entities)',
			alias: 'c',
			type: 'boolean',
			coerce: (value) => {
				if (typeof value === 'boolean') return value;
				if (value === 'true') {
					return true;
				}
				if (value === 'false') {
					return false;
				}

				return true;
			}
		})
		.option("writeToDisk", {
			demandOption: false,
			default: true,
			describe: 'write data to disk',
			alias: 'w',
			type: 'boolean',
			coerce: (value) => {
				if (typeof value === 'string') {
					return value.toLowerCase() === 'true';
				}
				return value;
			}
		})
		.help()
		.wrap(null)
		.argv;

	// if (args._.length === 0 && !args.type?.toLowerCase()?.includes('export')) {
	// 	yargs.showHelp();
	// 	process.exit();
	// }
	return args;
}


module.exports = cliParams;