

const isDebugMode = process.env.NODE_OPTIONS?.includes('--inspect') || process.env.NODE_OPTIONS?.includes('--inspect-brk');

/** @type {import('jest').Config} */
const jestConfig = {
	verbose: isDebugMode,
	watch: false,	
	projects: [
		{
			"displayName": "cli",
			"testMatch": [
				"<rootDir>/tests/cli.test.js"
			],
			maxWorkers: 1
		},
		{
			"displayName": "e2e",
			"testMatch": [
				"<rootDir>/tests/e2e.test.js"
			],		
			// @ts-ignore
			maxWorkers: 1

			
		},
		{
			displayName: "unit",
			testMatch: [
				"<rootDir>/tests/unit.test.js"
			],
			// @ts-ignore
			maxWorkers: "50%"
		},		
		{
			displayName: "integration",
			testMatch: [
				"<rootDir>/tests/int.test.js"
			],
			// @ts-ignore
			maxWorkers: "50%"
		},		
	],
	coverageDirectory: "./tests/coverage",
};

module.exports = jestConfig;
