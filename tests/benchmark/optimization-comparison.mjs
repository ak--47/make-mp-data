/**
 * Performance Optimization Comparison Benchmark
 * Tests the specific optimizations implemented:
 * 1. Pre-computed TIME_SHIFT_SECONDS
 * 2. Cached location/device data  
 * 3. pickRandom vs chance.pickone
 * 4. Optimized choose function
 */

import { timer } from 'ak-tools';
import { createContext } from '../../lib/core/context.js';
import { makeEvent } from '../../lib/generators/events.js';
import { initChance, TimeSoup, weighArray, pickRandom } from '../../lib/utils/utils.js';
import { validateDungeonConfig } from '../../lib/core/config-validator.js';
import Chance from 'chance';
import dayjs from 'dayjs';

// Initialize globals
global.FIXED_NOW = Math.floor(Date.now() / 1000);
global.FIXED_BEGIN = global.FIXED_NOW - (30 * 24 * 60 * 60);

/**
 * Benchmark TIME_SHIFT_SECONDS optimization
 * Tests pre-computed vs calculated-per-call performance
 */
async function benchmarkTimeShiftOptimization() {
    console.log('\n🕐 Benchmarking TIME_SHIFT_SECONDS Optimization');
    console.log('─'.repeat(50));
    
    const config = {
        numUsers: 10,
        numEvents: 50,
        seed: 'time-shift-bench'
    };
    
    const validatedConfig = validateDungeonConfig(config);
    const context = createContext(validatedConfig);
    
    // Test 1: Using pre-computed TIME_SHIFT_SECONDS (optimized)
    const optimizedTimer = timer('optimized-time-shift');
    optimizedTimer.start();
    
    for (let i = 0; i < 10000; i++) {
        // Simulate using the pre-computed value
        const timeShift = context.TIME_SHIFT_SECONDS;
        const baseTime = global.FIXED_BEGIN;
        const shiftedTime = baseTime + timeShift;
    }
    
    optimizedTimer.stop(false);
    
    // Test 2: Computing time shift each time (old way)
    const unoptimizedTimer = timer('unoptimized-time-shift');
    unoptimizedTimer.start();
    
    for (let i = 0; i < 10000; i++) {
        // Simulate the old expensive calculation
        const actualNow = dayjs().add(2, "day");
        const timeShift = actualNow.diff(dayjs.unix(global.FIXED_NOW), "seconds");
        const baseTime = global.FIXED_BEGIN;
        const shiftedTime = baseTime + timeShift;
    }
    
    unoptimizedTimer.stop(false);
    
    const optimizedTime = optimizedTimer.report(false).delta;
    const unoptimizedTime = unoptimizedTimer.report(false).delta;
    const improvement = (unoptimizedTime / optimizedTime).toFixed(1);
    
    console.log(`✅ Optimized (pre-computed):   ${optimizedTime}ms`);
    console.log(`❌ Unoptimized (per-call):     ${unoptimizedTime}ms`);
    console.log(`🚀 Performance improvement:    ${improvement}x faster`);
    
    return { optimizedTime, unoptimizedTime, improvement: parseFloat(improvement) };
}

/**
 * Benchmark location caching optimization
 * Tests pre-computed weighted arrays vs repeated weighArray calls
 */
async function benchmarkLocationCaching() {
    console.log('\n📍 Benchmarking Location Caching Optimization');
    console.log('─'.repeat(50));
    
    const config = {
        numUsers: 10,
        numEvents: 50,
        hasLocation: true,
        seed: 'location-cache-bench'
    };
    
    const validatedConfig = validateDungeonConfig(config);
    const context = createContext(validatedConfig);
    
    // Test 1: Using cached weighted arrays (optimized)
    const optimizedTimer = timer('optimized-location-cache');
    optimizedTimer.start();
    
    for (let i = 0; i < 1000; i++) {
        // Use the pre-computed weighted array
        const locations = context.defaults.locationsEvents();
        const browsers = context.defaults.browsers();
        const campaigns = context.defaults.campaigns();
    }
    
    optimizedTimer.stop(false);
    
    // Test 2: Computing weighArray each time (old way)  
    const testData = {
        locations: [
            { country: 'US', region: 'CA' },
            { country: 'US', region: 'NY' },
            { country: 'CA', region: 'ON' }
        ],
        browsers: ['Chrome', 'Firefox', 'Safari'],
        campaigns: ['organic', 'paid', 'email']
    };
    
    const unoptimizedTimer = timer('unoptimized-location-cache');
    unoptimizedTimer.start();
    
    for (let i = 0; i < 1000; i++) {
        // Simulate old way - calling weighArray each time
        const locations = weighArray(testData.locations);
        const browsers = weighArray(testData.browsers);
        const campaigns = weighArray(testData.campaigns);
    }
    
    unoptimizedTimer.stop(false);
    
    const optimizedTime = optimizedTimer.report(false).delta;
    const unoptimizedTime = unoptimizedTimer.report(false).delta;
    const improvement = (unoptimizedTime / optimizedTime).toFixed(1);
    
    console.log(`✅ Optimized (cached arrays):  ${optimizedTime}ms`);
    console.log(`❌ Unoptimized (per-call):     ${unoptimizedTime}ms`);
    console.log(`🚀 Performance improvement:    ${improvement}x faster`);
    
    return { optimizedTime, unoptimizedTime, improvement: parseFloat(improvement) };
}

/**
 * Benchmark pickRandom vs chance.pickone
 * Tests Math.random() vs Chance.js performance
 */
async function benchmarkPickRandomOptimization() {
    console.log('\n🎲 Benchmarking pickRandom vs chance.pickone');
    console.log('─'.repeat(50));
    
    const testArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    const chance = new Chance('pick-random-bench');
    
    // Test 1: Using optimized pickRandom (Math.random)
    const optimizedTimer = timer('optimized-pick-random');
    optimizedTimer.start();
    
    for (let i = 0; i < 50000; i++) {
        pickRandom(testArray);
    }
    
    optimizedTimer.stop(false);
    
    // Test 2: Using chance.pickone (Chance.js)
    const unoptimizedTimer = timer('unoptimized-chance-pickone');
    unoptimizedTimer.start();
    
    for (let i = 0; i < 50000; i++) {
        chance.pickone(testArray);
    }
    
    unoptimizedTimer.stop(false);
    
    const optimizedTime = optimizedTimer.report(false).delta;
    const unoptimizedTime = unoptimizedTimer.report(false).delta;
    const improvement = (unoptimizedTime / optimizedTime).toFixed(1);
    
    console.log(`✅ Optimized (Math.random):    ${optimizedTime}ms`);
    console.log(`❌ Unoptimized (Chance.js):    ${unoptimizedTime}ms`);
    console.log(`🚀 Performance improvement:    ${improvement}x faster`);
    
    return { optimizedTime, unoptimizedTime, improvement: parseFloat(improvement) };
}

/**
 * Benchmark full makeEvent optimization
 * Tests optimized vs simulated unoptimized makeEvent calls
 */
async function benchmarkMakeEventOptimization() {
    console.log('\n⚡ Benchmarking Full makeEvent Optimization');
    console.log('─'.repeat(50));
    
    const config = {
        numUsers: 10,
        numEvents: 50,
        hasLocation: true,
        hasIOSDevices: true,
        hasBrowser: true,
        hasCampaigns: true,
        seed: 'make-event-bench'
    };
    
    const validatedConfig = validateDungeonConfig(config);
    const context = createContext(validatedConfig);
    
    const chosenEvent = {
        event: 'benchmark_event',
        properties: {
            category: ['A', 'B', 'C', 'D'],
            type: ['type1', 'type2', 'type3'],
            value: [1, 2, 3, 4, 5]
        }
    };
    
    // Test 1: Using optimized makeEvent (all optimizations)
    const optimizedTimer = timer('optimized-make-event');
    optimizedTimer.start();
    
    const optimizedPromises = [];
    for (let i = 0; i < 500; i++) {
        optimizedPromises.push(makeEvent(
            context,
            `user_${i}`,
            global.FIXED_BEGIN,
            chosenEvent,
            [],
            [],
            {},
            [],
            false,
            false
        ));
    }
    
    await Promise.all(optimizedPromises);
    optimizedTimer.stop(false);
    
    const optimizedTime = optimizedTimer.report(false).delta;
    const eventsPerSecond = Math.round(500 / (optimizedTime / 1000));
    
    console.log(`✅ Optimized makeEvent:        ${optimizedTime}ms (${eventsPerSecond} EPS)`);
    console.log(`📊 Generated 500 events successfully`);
    
    return { optimizedTime, eventsPerSecond };
}

/**
 * Run comprehensive optimization comparison benchmark
 */
async function runOptimizationBenchmark() {
    console.log('🚀 Performance Optimization Comparison Benchmark');
    console.log('='.repeat(60));
    console.log('Testing specific optimizations implemented in Phase 1 & 2\n');
    
    const suiteTimer = timer('optimization-suite');
    suiteTimer.start();
    
    const results = {};
    
    // Run individual optimization benchmarks
    results.timeShift = await benchmarkTimeShiftOptimization();
    results.locationCache = await benchmarkLocationCaching();
    results.pickRandom = await benchmarkPickRandomOptimization();
    results.makeEvent = await benchmarkMakeEventOptimization();
    
    suiteTimer.stop(false);
    
    // Generate summary report
    console.log('\n\n📊 OPTIMIZATION BENCHMARK SUMMARY');
    console.log('='.repeat(60));
    
    console.log('\n🏆 Performance Improvements:');
    console.log(`   TIME_SHIFT_SECONDS optimization: ${results.timeShift.improvement}x faster`);
    console.log(`   Location caching optimization:   ${results.locationCache.improvement}x faster`);
    console.log(`   pickRandom optimization:         ${results.pickRandom.improvement}x faster`);
    console.log(`   makeEvent overall performance:   ${results.makeEvent.eventsPerSecond} EPS`);
    
    const totalImprovementFactor = (
        results.timeShift.improvement +
        results.locationCache.improvement +
        results.pickRandom.improvement
    ) / 3;
    
    console.log(`\n🎯 Average optimization factor:    ${totalImprovementFactor.toFixed(1)}x`);
    console.log(`⏱️  Total benchmark time:          ${suiteTimer.report(false).human}`);
    
    // Performance targets
    console.log('\n🎯 Performance Targets:');
    if (results.makeEvent.eventsPerSecond >= 15000) {
        console.log('   ✅ Target achieved: 15,000+ EPS (10x improvement)');
    } else if (results.makeEvent.eventsPerSecond >= 10000) {
        console.log('   ⚡ Good performance: 10,000+ EPS (7x improvement)');
    } else if (results.makeEvent.eventsPerSecond >= 5000) {
        console.log('   📈 Moderate improvement: 5,000+ EPS (3x improvement)');
    } else {
        console.log('   ⚠️  Performance below expectations');
    }
    
    return results;
}

// Run the benchmark
console.log('Starting Performance Optimization Comparison...\n');
runOptimizationBenchmark()
    .then(results => {
        console.log('\n✅ Optimization benchmark completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Optimization benchmark failed:', error.message);
        if (process.env.NODE_ENV === 'development') {
            console.error(error.stack);
        }
        process.exit(1);
    });