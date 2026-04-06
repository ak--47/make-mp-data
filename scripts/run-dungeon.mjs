#!/usr/bin/env node

import path from 'path';
import generate from '../index.js';
const { NODE_ENV = "unknown" } = process.env;

// Get the dungeon file path from command line arguments
const dungeonPath = process.argv[2];

if (!dungeonPath) {
	console.error('❌ Error: No dungeon file specified');
	console.error('Usage: node run-dungeon.js <path-to-dungeon.js>');
	process.exit(1);
}

// Resolve the absolute path
const absolutePath = path.isAbsolute(dungeonPath)
	? dungeonPath
	: path.resolve(process.cwd(), dungeonPath);

// Handle Ctrl+C gracefully — let user-loop finish current user, then exit
process.on('SIGINT', () => {
	// Second Ctrl+C forces immediate exit
	process.on('SIGINT', () => process.exit(1));
});

console.log(`\n🎲 Running dungeon: ${path.basename(absolutePath)}\n`);

try {
	// Dynamically import the dungeon configuration
	const { default: config } = await import(absolutePath);

	if (!config) {
		console.error('❌ Error: Dungeon file must export a default configuration object');
		process.exit(1);
	}

	// Run the dungeon
	const results = await generate(config);

	// Display results
	console.log('\n✅ Dungeon run complete!');
	console.log('═'.repeat(50));
	console.log(`📊 Results:`);
	console.log(`   Users: ${results.userCount.toLocaleString()}`);
	console.log(`   Events: ${results.eventCount.toLocaleString()}`);
	if (results.groupCount) {
		console.log(`   Groups: ${results.groupCount.toLocaleString()}`);
	}
	if (results.time) {
		console.log(`   Duration: ${results.time.human || results.time.delta + 'ms'}`);
	}

	if (results.avgEPS) {
		console.log(`   Avg EPS: ${results.avgEPS.toLocaleString()}`);
	}

	if (results.files && results.files.length > 0) {
		console.log(`\n📁 Files written:`);
		results.files.forEach(file => {
			console.log(`   - ${file}`);
		});
	}

	console.log('═'.repeat(50) + '\n');

	// if (NODE_ENV === 'dev') debugger;



} catch (error) {
	console.error('❌ Error running dungeon:', error.message);
	console.error(error.stack);
	process.exit(1);
}
