#!/usr/bin/env node

/**
 * Converts a JavaScript dungeon file to JSON that can be loaded into the UI
 * Usage: node scripts/dungeon-to-json.js <input.js> [output-name]
 */

import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('❌ Error: Please provide an input JavaScript file');
    console.log('Usage: node scripts/dungeon-to-json.js <input.js> [output-name]');
    console.log('Example: node scripts/dungeon-to-json.js ./dungeons/my-dungeon.js my-dungeon');
    process.exit(1);
}

const inputPath = path.resolve(args[0]);
const outputName = args[1] || path.basename(inputPath, '.js');

try {
    // Import the JavaScript module
    console.log(`📖 Loading ${inputPath}...`);
    const module = await import(`file://${inputPath}`);
    const config = module.default;

    if (!config) {
        throw new Error('No default export found in the module');
    }

    // Extract hooks if they exist
    const hooksFunction = config.hook;
    const hooksString = hooksFunction ? hooksFunction.toString() : null;

    // Create a clean config without the hook function
    const cleanConfig = { ...config };
    delete cleanConfig.hook;

    // Convert to JSON-serializable format
    console.log('🔄 Converting to JSON format...');
    const schema = convertToJSON(cleanConfig);

    // Create the dungeon state object (same format as UI saves)
    const dungeonState = {
        schema,
        hooks: hooksString,
        timestamp: new Date().toISOString(),
        version: '4.0'
    };

    // Write to JSON file
    const outputPath = path.join(path.dirname(inputPath), `${outputName}.json`);
    writeFileSync(outputPath, JSON.stringify(dungeonState, null, 2), 'utf-8');

    console.log(`✅ Successfully created ${outputPath}`);
    console.log(`\n💡 You can now load this file in the DM4 UI:`);
    console.log(`   Click "Load" and select ${outputName}.json`);

} catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
}

/**
 * Convert JavaScript config to JSON-serializable format
 * Detects functions and converts them to object representation
 */
function convertToJSON(value) {
    // Null/undefined
    if (value === null || value === undefined) {
        return null;
    }

    // Primitives
    if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
        return value;
    }

    // Functions - convert to object representation
    if (typeof value === 'function') {
        return convertFunctionToObject(value);
    }

    // Arrays
    if (Array.isArray(value)) {
        return value.map(item => convertToJSON(item));
    }

    // Objects
    if (typeof value === 'object') {
        const result = {};
        for (const [key, val] of Object.entries(value)) {
            result[key] = convertToJSON(val);
        }
        return result;
    }

    // Fallback
    return null;
}

/**
 * Convert a function to its object representation
 * Tries to detect the function type and extract parameters
 */
function convertFunctionToObject(func) {
    const funcString = func.toString();

    // Arrow function
    if (funcString.startsWith('(') || funcString.startsWith('_') || funcString.includes('=>')) {
        return {
            functionName: 'arrow',
            body: funcString
        };
    }

    // Bound chance methods (e.g., chance.name.bind(chance))
    if (funcString.includes('.bind(')) {
        const match = funcString.match(/chance\.(\w+)\.bind/);
        if (match) {
            return {
                functionName: `chance.${match[1]}`,
                args: []
            };
        }
    }

    // Try to detect common utility functions
    // This is a best-effort approach - some complex functions might not be detected
    const commonFunctions = [
        'weighNumRange',
        'weighArray',
        'weighChoices',
        'pickAWinner',
        'date',
        'integer',
        'uid',
        'comma'
    ];

    for (const fnName of commonFunctions) {
        if (funcString.includes(fnName)) {
            // Extract args (this is simplified - real parsing would be more complex)
            return {
                functionName: fnName,
                args: [] // Args would need to be extracted, but that's complex
            };
        }
    }

    // Generic function - just store as arrow function
    return {
        functionName: 'arrow',
        body: funcString
    };
}
