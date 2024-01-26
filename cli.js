const yargs = require('yargs');
const { version } = require('./package.json');

const hero = String.raw`
                        
┏┳┓┏┓  ┏┫┏┓╋┏┓  ┏┓┏┓┏┓┏┓┏┓┏┓╋┏┓┏┓
┛┗┗┣┛  ┗┻┗┻┗┗┻  ┗┫┗ ┛┗┗ ┛ ┗┻┗┗┛┛ 
   ┛             ┛               
makes all the things for mixpanel (v${version || 1})
by ak@mixpanel.com
   `;

console.log(hero);

function cliParams() {
	const args = yargs(process.argv.splice(2))
		.scriptName("make-mp-data")
		.usage(`\nusage:\nnpx $0 [dataModel.js] [options]
ex:
npx $0 --token 1234 --events 1000000
npx $0 myDataOutline.js --token 1234 --days 90

DOCS: https://github.com/ak--47/make-mp-data`)
		.command('$0', 'model mixpanel data', () => { })
		.option("token", {
			demandOption: false,
			describe: 'project token; if supplied data will be sent to mixpanel',
			type: 'string'
		})
		.option("seed", {
			demandOption: false,
			describe: 'randomness seed; used to create distinct_ids',
			type: 'string'
		})
		.option("format", {
			demandOption: false,
			default: 'csv',
			describe: 'csv or json',
			type: 'string'
		})
		.option("numDays", {
			demandOption: false,
			describe: 'number of days in past to model',
			type: 'number',
		})
		.option("numUsers", {
			demandOption: false,
			describe: 'number of users to model',
			type: 'number',
		})
		.option("numEvents", {
			demandOption: false,
			describe: 'number of events to model',
			type: 'number',
		})
		.option("region", {
			demandOption: false,
			default: 'US',
			describe: 'either US or EU',
			type: 'string'
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