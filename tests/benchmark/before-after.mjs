/**
 * Before/After Performance Comparison
 * Simulates old vs new behavior for direct comparison
 */

import main from "../../index.js";
import simple from '../../dungeons/simple.js';
import { timer } from 'ak-tools';
import os from 'os';

/** @typedef {import('../../types').Dungeon} Config */

// Test configuration (smaller for manageable comparison)
const testConfig = {
    ...simple,
    numUsers: 200,
    numEvents: 4_000,
    writeToDisk: false,
    verbose: false
};

/**
 * Simulates old sequential behavior (concurrency = 1)
 */
async function testOldBehavior() {
    console.log('🔄 Testing OLD behavior (sequential, concurrency=1)...');
    
    const config = {
        ...testConfig,
        concurrency: 1,
        simulationName: 'old-behavior'
    };
    
    const timer1 = timer('old');
    timer1.start();
    
    const result = await main(config);
    
    timer1.stop(false);
    const time = timer1.report(false);
    
    return {
        behavior: 'OLD (Sequential)',
        ...result,
        ...time,
        eps: Math.floor(result.eventCount / (time.delta / 1000)),
        usersPerSec: Math.floor(result.userCount / (time.delta / 1000))
    };
}

/**
 * Tests new parallel batch behavior
 */
async function testNewBehavior() {
    console.log('⚡ Testing NEW behavior (parallel batches, optimal concurrency)...');
    
    const config = {
        ...testConfig,
        concurrency: os.cpus().length * 2, // New default
        simulationName: 'new-behavior'
    };
    
    const timer2 = timer('new');
    timer2.start();
    
    const result = await main(config);
    
    timer2.stop(false);
    const time = timer2.report(false);
    
    return {
        behavior: 'NEW (Parallel Batches)',
        ...result,
        ...time,
        eps: Math.floor(result.eventCount / (time.delta / 1000)),
        usersPerSec: Math.floor(result.userCount / (time.delta / 1000))
    };
}

/**
 * Run comparison and generate report
 */
async function runComparison() {
    console.log('🚀 BEFORE/AFTER PERFORMANCE COMPARISON');
    console.log('='* 50);
    console.log(`📊 Test Config: ${testConfig.numUsers.toLocaleString()} users, ${testConfig.numEvents.toLocaleString()} events`);
    console.log(`🖥️  Available CPU Cores: ${os.cpus().length}`);
    console.log('');
    
    // Run tests
    const oldResult = await testOldBehavior();
    console.log('');
    
    const newResult = await testNewBehavior();
    console.log('');
    
    // Generate comparison report
    console.log('📈 RESULTS COMPARISON');
    console.log('-'.repeat(70));
    
    console.log('Metric                  | OLD (c=1)    | NEW (c=' + (os.cpus().length * 2) + ')     | Improvement');
    console.log('-'.repeat(70));
    
    const metrics = [
        {
            name: 'Events Per Second (EPS)',
            old: oldResult.eps,
            new: newResult.eps,
            format: (v) => v.toLocaleString()
        },
        {
            name: 'Users Per Second',
            old: oldResult.usersPerSec,
            new: newResult.usersPerSec,
            format: (v) => v.toLocaleString()
        },
        {
            name: 'Total Time',
            old: oldResult.delta,
            new: newResult.delta,
            format: (v) => (v / 1000).toFixed(1) + 's',
            inverse: true // Lower is better
        },
        {
            name: 'Time per User',
            old: oldResult.delta / oldResult.userCount,
            new: newResult.delta / newResult.userCount,
            format: (v) => v.toFixed(1) + 'ms',
            inverse: true
        },
        {
            name: 'Time per Event',
            old: oldResult.delta / oldResult.eventCount,
            new: newResult.delta / newResult.eventCount,
            format: (v) => v.toFixed(2) + 'ms',
            inverse: true
        }
    ];
    
    metrics.forEach(metric => {
        const improvement = metric.inverse 
            ? ((metric.old - metric.new) / metric.old * 100)
            : ((metric.new - metric.old) / metric.old * 100);
        
        const improvementStr = improvement > 0 
            ? `+${improvement.toFixed(1)}%`
            : `${improvement.toFixed(1)}%`;
        
        const oldStr = metric.format(metric.old).padStart(12);
        const newStr = metric.format(metric.new).padStart(12);
        const improvStr = improvementStr.padStart(12);
        
        console.log(`${metric.name.padEnd(22)} | ${oldStr} | ${newStr} | ${improvStr}`);
    });
    
    console.log('');
    
    // Summary
    const speedupEPS = newResult.eps / oldResult.eps;
    const timeReduction = ((oldResult.delta - newResult.delta) / oldResult.delta * 100);
    
    console.log('🎯 PERFORMANCE SUMMARY');
    console.log('-'.repeat(30));
    console.log(`⚡ Events Per Second: ${speedupEPS.toFixed(2)}x faster`);
    console.log(`⏱️  Time Reduction: ${timeReduction.toFixed(1)}% faster`);
    console.log(`🚀 Overall Speedup: ${speedupEPS.toFixed(1)}x performance improvement`);
    
    if (speedupEPS > 2) {
        console.log('✅ EXCELLENT: Major performance improvement achieved!');
    } else if (speedupEPS > 1.5) {
        console.log('✅ GOOD: Significant performance improvement achieved!');
    } else if (speedupEPS > 1.1) {
        console.log('⚠️  MODEST: Some performance improvement achieved.');
    } else {
        console.log('❌ POOR: Little to no performance improvement.');
    }
    
    console.log('');
    console.log('📋 Technical Details:');
    console.log(`   Old: Sequential processing, 1 user at a time`);
    console.log(`   New: Parallel batch processing, ${os.cpus().length * 2} concurrent operations`);
    console.log(`   Test: ${testConfig.numUsers} users generating ${testConfig.numEvents} events`);
}

// Run the comparison
runComparison().catch(console.error);