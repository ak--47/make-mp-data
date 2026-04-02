#!/usr/bin/env node

/**
 * Converts a frontend JSON dungeon file to a proper JavaScript dungeon file
 * Usage: node scripts/json-to-dungeon.js <input.json> [output-name]
 */

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('❌ Error: Please provide an input JSON file');
    console.log('Usage: node scripts/json-to-dungeon.js <input.json> [output-name]');
    console.log('Example: node scripts/json-to-dungeon.js /path/to/dungeon.json my-dungeon');
    process.exit(1);
}

const inputPath = path.resolve(args[0]);
const outputName = args[1] || path.basename(inputPath, '.json');

try {
    // Read the JSON file
    console.log(`📖 Reading ${inputPath}...`);
    const jsonContent = readFileSync(inputPath, 'utf-8');
    const dungeonData = JSON.parse(jsonContent);

    // Extract schema and hooks
    const schema = dungeonData.schema || dungeonData;
    const hooksString = dungeonData.hooks || null;

    // Convert to JavaScript
    console.log('🔄 Converting to JavaScript module...');
    const jsContent = convertToJavaScript(schema, hooksString, outputName);

    // Write to same directory as input file
    const outputPath = path.join(path.dirname(inputPath), `${outputName}.js`);
    writeFileSync(outputPath, jsContent, 'utf-8');

    console.log(`✅ Successfully created ${outputPath}`);
    console.log(`\n💡 You can now import and use this dungeon:`);
    console.log(`   import config from '${path.relative(process.cwd(), outputPath)}';`);

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

/**
 * Convert JSON schema to JavaScript module string
 */
function convertToJavaScript(schema, hooksString, name) {
    const lines = [];

    // File header
    lines.push(`/**`);
    lines.push(` * Generated dungeon: ${name}`);
    lines.push(` * Created: ${new Date().toISOString()}`);
    lines.push(` * Source: Converted from frontend JSON`);
    lines.push(` */`);
    lines.push('');

    // Imports
    lines.push(`import Chance from 'chance';`);
    lines.push(`let chance = new Chance();`);
    lines.push(`import dayjs from "dayjs";`);
    lines.push(`import utc from "dayjs/plugin/utc.js";`);
    lines.push(`dayjs.extend(utc);`);
    lines.push(`import { uid, comma } from 'ak-tools';`);
    lines.push(`import {
	pickAWinner, weighNumRange, date, integer, weighChoices,
	choose, range, exhaust, maybe, takeSome, randomElement, randomInt,
	weighArray
} from "../lib/utils/utils.js";`);
    lines.push(`import { createTextGenerator, generateBatch } from "../lib/generators/text.js";`);
    lines.push('');

    // Config object
    lines.push(`/** @type {import('../types').Dungeon} */`);
    lines.push(`const config = ${convertValueToJS(schema, 1)};`);
    lines.push('');

    // Hook function (if exists)
    if (hooksString) {
        lines.push(`// Apply the hook function`);
        lines.push(`config.hook = ${hooksString};`);
        lines.push('');
    }

    // Export
    lines.push(`export default config;`);
    lines.push('');

    return lines.join('\n');
}

/**
 * Convert a JavaScript value to its source code representation
 */
function convertValueToJS(value, indentLevel = 0) {
    const indent = '\t'.repeat(indentLevel);
    const nextIndent = '\t'.repeat(indentLevel + 1);

    // Null
    if (value === null || value === undefined) {
        return 'null';
    }

    // Boolean
    if (typeof value === 'boolean') {
        return String(value);
    }

    // Number
    if (typeof value === 'number') {
        return String(value);
    }

    // String
    if (typeof value === 'string') {
        // Handle multi-line strings
        if (value.includes('\n')) {
            return '`' + value.replace(/`/g, '\\`') + '`';
        }
        // Use double quotes for regular strings
        return '"' + value.replace(/"/g, '\\"') + '"';
    }

    // Function (stored as object with functionName and args)
    if (value && typeof value === 'object' && value.functionName) {
        const funcName = value.functionName;
        const args = value.args || [];
        const argsStr = args.map(arg => convertValueToJS(arg, 0)).join(', ');

        // Handle arrow functions
        if (funcName === 'arrow') {
            return value.body || '() => {}';
        }

        // Handle chance bindings
        if (funcName.startsWith('chance.')) {
            return `${funcName}.bind(chance)`;
        }

        // Regular function calls
        return `${funcName}(${argsStr})`;
    }

    // Array
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return '[]';
        }

        // Check if it's a simple array (all primitives)
        const allPrimitives = value.every(v =>
            v === null ||
            typeof v === 'boolean' ||
            typeof v === 'number' ||
            typeof v === 'string'
        );

        if (allPrimitives && value.length <= 5) {
            // Inline simple arrays
            const items = value.map(v => convertValueToJS(v, 0));
            return `[${items.join(', ')}]`;
        }

        // Multi-line arrays
        const items = value.map(v => `${nextIndent}${convertValueToJS(v, indentLevel + 1)}`);
        return `[\n${items.join(',\n')}\n${indent}]`;
    }

    // Object
    if (typeof value === 'object') {
        const keys = Object.keys(value);

        if (keys.length === 0) {
            return '{}';
        }

        const entries = keys.map(key => {
            const val = convertValueToJS(value[key], indentLevel + 1);
            // Use quotes for keys with special characters or spaces
            const needsQuotes = /[^a-zA-Z0-9_$]/.test(key) || /^\d/.test(key);
            const keyStr = needsQuotes ? `"${key}"` : key;
            return `${nextIndent}${keyStr}: ${val}`;
        });

        return `{\n${entries.join(',\n')}\n${indent}}`;
    }

    // Fallback
    return 'null';
}
