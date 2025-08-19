/**
 * Phase 1 Performance Benchmark Suite
 * Tests the performance improvements from parallel batch processing
 * Compares old sequential approach vs new parallel batch approach
 */

import main from "../../index.js";
import simple from '../../dungeons/simple.js';
import { timer } from 'ak-tools';
import os from 'os';

/** @typedef {import('../../types').Dungeon} Config */

/**
 * Benchmark configuration for different test scenarios
 */
const benchmarkConfigs = {
	small: {
		...simple,
		numUsers: 100,
		numEvents: 2_000,
		writeToDisk: false
	},
	medium: {
		...simple,
		numUsers: 1_000,
		numEvents: 20_000,
		writeToDisk: false
	},
	large: {
		...simple,
		numUsers: 5_000,
		numEvents: 100_000,
		writeToDisk: false
	},
	xlarge: {
		...simple,
		numUsers: 10_000,
		numEvents: 250_000,
		writeToDisk: false
	}
};

/**
 * Test different concurrency levels
 */
const concurrencyLevels = [
	1,                              // Sequential (old behavior)
	2,                              // Minimal parallelism
	os.cpus().length,               // Match CPU cores
	os.cpus().length * 2,           // 2x CPU cores (new default)
	os.cpus().length * 4,           // High parallelism
	Math.min(os.cpus().length * 8, 32) // Maximum reasonable parallelism
];

/**
 * Run a single benchmark test
 * @param {string} configName - Name of the config being tested
 * @param {Config} config - Configuration object
 * @param {number} concurrency - Concurrency level to test
 * @returns {Promise<Object>} Benchmark results
 */
async function runBenchmark(configName, config, concurrency) {
	const testConfig = {
		...config,
		concurrency,
		name: `bench-${configName}-c${concurrency}`
	};

	console.log(`\n🔄 Running ${configName} with concurrency ${concurrency}...`);

	const testTimer = timer('benchmark');
	testTimer.start();

	try {
		const result = await main({...testConfig, verbose: true});
		testTimer.stop(false);

		const { start, end, delta, human } = testTimer.report(false);
		const eps = Math.floor(result.eventCount / (delta / 1000));
		const usersPerSecond = Math.floor(result.userCount / (delta / 1000));

		const benchmark = {
			configName,
			concurrency,
			userCount: result.userCount,
			eventCount: result.eventCount,
			operations: result.operations,
			timeMs: delta,
			timeHuman: human,
			eps,
			usersPerSecond,
			avgTimePerUser: delta / result.userCount,
			avgTimePerEvent: delta / result.eventCount
		};

		console.log(`✅ ${configName} (c${concurrency}): ${eps} EPS, ${usersPerSecond} users/sec, ${human}`);

		return benchmark;

	} catch (error) {
		testTimer.stop(false);
		console.error(`❌ ${configName} (c${concurrency}) failed:`, error.message);

		return {
			configName,
			concurrency,
			error: error.message,
			timeMs: testTimer.report(false).delta,
			failed: true
		};
	}
}

/**
 * Run comprehensive benchmark suite
 */
async function runBenchmarkSuite() {
	console.log('🚀 Phase 1 Performance Benchmark Suite');
	console.log(`🖥️  CPU Cores Available: ${os.cpus().length}`);
	console.log(`🔧 Testing Concurrency Levels: ${concurrencyLevels.join(', ')}`);
	console.log(`📊 Test Configurations: ${Object.keys(benchmarkConfigs).join(', ')}`);

	const allResults = [];
	const suiteTimer = timer('suite');
	suiteTimer.start();

	// Test each configuration with each concurrency level
	for (const [configName, config] of Object.entries(benchmarkConfigs)) {
		console.log(`\n\n📋 Testing ${configName.toUpperCase()} configuration:`);
		console.log(`   Users: ${config.numUsers.toLocaleString()}, Events: ${config.numEvents.toLocaleString()}`);

		for (const concurrency of concurrencyLevels) {
			const result = await runBenchmark(configName, config, concurrency);
			allResults.push(result);

			// Brief pause between tests to let system stabilize
			await new Promise(resolve => setTimeout(resolve, 1000));
		}
	}

	suiteTimer.stop(false);

	// Generate comprehensive report
	generatePerformanceReport(allResults, suiteTimer.report(false));
}

/**
 * Generate a comprehensive performance report
 * @param {Array} results - Array of benchmark results
 * @param {Object} suiteTime - Total suite execution time
 */
function generatePerformanceReport(results, suiteTime) {
	console.log('\n\n📈 PHASE 1 PERFORMANCE BENCHMARK REPORT');
	console.log('=' * 80);

	const successfulResults = results.filter(r => !r.failed);
	const failedResults = results.filter(r => r.failed);

	if (failedResults.length > 0) {
		console.log(`\n❌ Failed Tests: ${failedResults.length}`);
		failedResults.forEach(r => {
			console.log(`   ${r.configName} (c${r.concurrency}): ${r.error}`);
		});
	}

	console.log(`\n✅ Successful Tests: ${successfulResults.length}`);
	console.log(`⏱️  Total Suite Time: ${suiteTime.human}`);

	// Group results by configuration
	const configGroups = groupBy(successfulResults, 'configName');

	for (const [configName, configResults] of Object.entries(configGroups)) {
		generateConfigReport(configName, configResults);
	}

	// Overall performance analysis
	generatePerformanceAnalysis(successfulResults);

	// Best configurations summary
	generateBestConfigsSummary(successfulResults);
}

/**
 * Generate report for a specific configuration
 * @param {string} configName - Configuration name
 * @param {Array} results - Results for this configuration
 */
function generateConfigReport(configName, results) {
	console.log(`\n\n📊 ${configName.toUpperCase()} Configuration Results:`);
	console.log('-'.repeat(60));

	// Sort by concurrency level
	results.sort((a, b) => a.concurrency - b.concurrency);

	console.log('Concurrency | EPS      | Users/s  | Time     | Per User | Per Event');
	console.log('----------- | -------- | -------- | -------- | -------- | ---------');

	results.forEach(r => {
		console.log(`${r.concurrency.toString().padStart(11)} | ${r.eps.toString().padStart(8)} | ${r.usersPerSecond.toString().padStart(8)} | ${r.timeHuman.padStart(8)} | ${r.avgTimePerUser.toFixed(1).padStart(8)}ms | ${r.avgTimePerEvent.toFixed(2).padStart(8)}ms`);
	});

	// Calculate performance improvements
	const baseline = results.find(r => r.concurrency === 1);
	if (baseline) {
		console.log('\nPerformance vs Sequential (concurrency=1):');
		results.forEach(r => {
			if (r.concurrency === 1) return;
			const speedup = r.eps / baseline.eps;
			const timeReduction = ((baseline.timeMs - r.timeMs) / baseline.timeMs * 100);
			console.log(`  c${r.concurrency}: ${speedup.toFixed(2)}x faster EPS, ${timeReduction.toFixed(1)}% time reduction`);
		});
	}
}

/**
 * Generate overall performance analysis
 * @param {Array} results - All successful results
 */
function generatePerformanceAnalysis(results) {
	console.log('\n\n🔍 PERFORMANCE ANALYSIS');
	console.log('-'.repeat(50));

	// Find optimal concurrency levels
	const concurrencyGroups = groupBy(results, 'concurrency');
	const concurrencyPerformance = [];

	for (const [concurrency, concResults] of Object.entries(concurrencyGroups)) {
		const avgEps = concResults.reduce((sum, r) => sum + r.eps, 0) / concResults.length;
		const avgUsersPerSec = concResults.reduce((sum, r) => sum + r.usersPerSecond, 0) / concResults.length;

		concurrencyPerformance.push({
			concurrency: parseInt(concurrency),
			avgEps,
			avgUsersPerSec,
			testCount: concResults.length
		});
	}

	concurrencyPerformance.sort((a, b) => b.avgEps - a.avgEps);

	console.log('\nConcurrency Performance Ranking (by average EPS):');
	concurrencyPerformance.forEach((cp, index) => {
		console.log(`${index + 1}. Concurrency ${cp.concurrency}: ${Math.round(cp.avgEps)} EPS avg (${cp.testCount} tests)`);
	});

	// Memory vs Performance trade-offs
	console.log('\nRecommended Concurrency Levels:');
	console.log(`💚 Conservative: ${os.cpus().length} (matches CPU cores)`);
	console.log(`⚡ Balanced: ${os.cpus().length * 2} (2x CPU cores - new default)`);
	console.log(`🚀 Aggressive: ${Math.min(os.cpus().length * 4, 16)} (4x CPU cores, max reasonable)`);
}

/**
 * Generate summary of best performing configurations
 * @param {Array} results - All successful results
 */
function generateBestConfigsSummary(results) {
	console.log('\n\n🏆 BEST PERFORMING CONFIGURATIONS');
	console.log('-'.repeat(50));

	// Find best EPS for each config
	const configGroups = groupBy(results, 'configName');

	for (const [configName, configResults] of Object.entries(configGroups)) {
		const bestResult = configResults.reduce((best, current) =>
			current.eps > best.eps ? current : best
		);

		console.log(`${configName.toUpperCase()}:`);
		console.log(`  Best: Concurrency ${bestResult.concurrency} → ${bestResult.eps} EPS (${bestResult.timeHuman})`);
		console.log(`  Configuration: ${bestResult.userCount.toLocaleString()} users, ${bestResult.eventCount.toLocaleString()} events`);
	}
}

/**
 * Group array by a specific property
 * @param {Array} array - Array to group
 * @param {string} key - Property to group by
 * @returns {Object} Grouped object
 */
function groupBy(array, key) {
	return array.reduce((groups, item) => {
		const groupKey = item[key];
		if (!groups[groupKey]) {
			groups[groupKey] = [];
		}
		groups[groupKey].push(item);
		return groups;
	}, {});
}

// Run the benchmark suite
console.log('Starting Phase 1 Performance Benchmark Suite...\n');
runBenchmarkSuite().catch(console.error);