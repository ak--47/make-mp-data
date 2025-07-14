/**
 * Quick test to verify Phase 1 improvements work correctly
 * Small test to ensure the parallel batch processing works without errors
 */

import main from "../../index.js";
import simple from '../../dungeons/simple.js';
import os from 'os';

/** @typedef {import('../../types').Dungeon} Config */

const quickConfig = {
    ...simple,
    numUsers: 200,
    numEvents: 4000,
    writeToDisk: false,
    verbose: true,
    concurrency: os.cpus().length * 2  // Use new default
};

console.log('🧪 Running quick test of Phase 1 improvements...');
console.log(`📊 Config: ${quickConfig.numUsers} users, ${quickConfig.numEvents} events`);
console.log(`⚡ Concurrency: ${quickConfig.concurrency} (${os.cpus().length} CPU cores * 2)`);
console.log('');

try {
    const result = await main(quickConfig);
    
    console.log('\n✅ Quick test completed successfully!');
    console.log(`📈 Generated ${result.eventCount} events for ${result.userCount} users`);
    console.log(`⏱️  Time: ${result.time.human}`);
    console.log(`🚀 EPS: ${Math.floor(result.eventCount / (result.time.delta / 1000))}`);
    
    // Basic validation
    if (result.userCount !== quickConfig.numUsers) {
        throw new Error(`Expected ${quickConfig.numUsers} users, got ${result.userCount}`);
    }
    
    if (result.eventCount === 0) {
        throw new Error('No events were generated');
    }
    
    console.log('\n🎉 All validations passed! Phase 1 improvements are working correctly.');
    
} catch (error) {
    console.error('\n❌ Quick test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
}