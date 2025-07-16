#!/usr/bin/env node

/**
 * CLI entry point for make-mp-data
 * This file is only used when running via CLI/npx
 */

import main from './index.js';
import getCliParams from './lib/cli/cli.js';

(async () => {
    try {
        const cliConfig = getCliParams();

        // Load dungeon config - default to simple mode if no mode specified
        let finalConfig = cliConfig;
        if (cliConfig.complex) {
            const complexConfig = await import('./dungeons/complex.js');
            finalConfig = { ...complexConfig.default, ...cliConfig };
        } else if (cliConfig.simple || (!cliConfig.complex && !cliConfig.simple)) {
            // Default to simple mode when no flags or when --simple is explicitly set
            const simpleConfig = await import('./dungeons/simple.js');
            finalConfig = { ...simpleConfig.default, ...cliConfig };
        }

        const result = await main(finalConfig);
        
        console.log(`📊 Generated ${(result.eventCount || 0).toLocaleString()} events for ${(result.userCount || 0).toLocaleString()} users`);
        console.log(`⏱️  Total time: ${result.time?.human || 'unknown'}`);
        if (result.files?.length) {
            console.log(`📁 Files written: ${result.files.length}`);
            if (cliConfig.verbose) {
                result.files.forEach(file => console.log(`   ${file}`));
            }
        }
        console.log(`\n✅ Job completed successfully!`);
        process.exit(0);
    } catch (error) {
        console.error(`\n❌ Job failed: ${error.message}`);
        if (process.env.NODE_ENV === 'development') {
            console.error(error.stack);
        }
        process.exit(1);
    }
})();