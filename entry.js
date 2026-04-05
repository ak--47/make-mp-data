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
        // CLI always writes to disk unless explicitly disabled
        let finalConfig = cliConfig;
        if (cliConfig.complex) {
            const complexConfig = await import('./dungeons/complex.js');
            finalConfig = { ...complexConfig.default, writeToDisk: true, ...cliConfig };
        }
		else if (cliConfig.sanity) {
			const sanityConfig = await import('./dungeons/sanity.js');
			finalConfig = { ...sanityConfig.default, writeToDisk: true, ...cliConfig };
		}
		else if (cliConfig.simple || (!cliConfig.complex && !cliConfig.simple)) {
            // Default to simple mode when no flags or when --simple is explicitly set
            const simpleConfig = await import('./dungeons/simple.js');
            finalConfig = { ...simpleConfig.default, writeToDisk: true, ...cliConfig };
        }

		
		
        const result = await main(finalConfig);        
        console.log(`📊 Generated ${(result.eventCount || 0).toLocaleString()} events for ${(result.userCount || 0).toLocaleString()} users`);
        console.log(`⏱️  Total time: ${result.time?.human || 'unknown'}`);
		const recordsPerSecond = result.eventCount / result.time.delta * 1000;
		console.log(`⚡ Records per second: ${recordsPerSecond.toFixed(2)}`);
		
		// @ts-ignore
		if (result.errors?.length) {
			// @ts-ignore
			console.error(`\n❗ Errors encountered: ${result.errors.length}`);
			if (cliConfig.verbose) {
				// @ts-ignore
				result.errors.forEach(err => console.error(`   ${err}`));
			}
		} else {
			console.log(`\n🙌 No errors encountered.`);
		}

		if (result.files?.length) {
            console.log(`📁 Files written: ${result.files.length}`);
            if (cliConfig.verbose) {
                result.files.forEach(file => console.log(`   ${file}`));
            }
        }
        console.log(`\n👋 Job completed successfully!\n`);
        process.exit(0);
    } catch (error) {
        console.error(`\n❌ Job failed: ${error.message}`);
        if (process.env.NODE_ENV === 'development') {
            console.error(error.stack);
        }
        process.exit(1);
    }
})();