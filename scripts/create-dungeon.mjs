#!/usr/bin/env node

/**
 * Automated dungeon creation script
 * Prompts user for a description, generates AI schema, and creates complete dungeon file
 */

import readline from 'readline';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import generateAISchema from '../lib/utils/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the dungeons directory exists
const dungeonsDir = path.join(__dirname, '..', 'dungeons');
await fs.mkdir(dungeonsDir, { recursive: true });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

function generateRandomFileName() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ai-dungeon-${timestamp}-${random}.js`;
}

function parseAIResponse(aiResponse) {
    try {
        // Handle case where aiResponse might be an object (convert to string first)
        let responseStr = typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse, null, 2);
        
        // Try to extract individual dungeon properties from AI response
        const patterns = {
            events: /events\s*:\s*(\[[\s\S]*?\](?=\s*[,}]))/,
            funnels: /funnels\s*:\s*(\[[\s\S]*?\](?=\s*[,}]))/,
            userProps: /userProps\s*:\s*(\{[\s\S]*?\}(?=\s*[,}]))/,
            superProps: /superProps\s*:\s*(\{[\s\S]*?\}(?=\s*[,}]))/,
            scdProps: /scdProps\s*:\s*(\{[\s\S]*?\}(?=\s*[,}]))/,
            mirrorProps: /mirrorProps\s*:\s*(\{[\s\S]*?\}(?=\s*[,}]))/,
            groupKeys: /groupKeys\s*:\s*(\[[\s\S]*?\](?=\s*[,}]))/,
            groupProps: /groupProps\s*:\s*(\{[\s\S]*?\}(?=\s*[,}]))/,
            lookupTables: /lookupTables\s*:\s*(\[[\s\S]*?\](?=\s*[,}]))/
        };
        
        let extractedProps = {};
        let foundAny = false;
        
        for (const [prop, pattern] of Object.entries(patterns)) {
            const match = responseStr.match(pattern);
            if (match) {
                extractedProps[prop] = match[1];
                foundAny = true;
            }
        }
        
        if (foundAny) {
            // Build the properties string
            const propsArray = [];
            for (const [prop, value] of Object.entries(extractedProps)) {
                propsArray.push(`${prop}: ${value}`);
            }
            return propsArray.join(',\n    ');
        }
        
        // Fallback: try to extract a complete object
        const objectMatch = responseStr.match(/(?:const\s+\w+\s*=\s*)?(\{[\s\S]*\})/);
        if (objectMatch) {
            let objectStr = objectMatch[1];
            // Remove any trailing commas and clean up
            objectStr = objectStr.replace(/,(\s*[}\]])/g, '$1');
            return objectStr;
        }
        
        // Last resort: return the response as a comment with empty defaults
        return `/* AI Response:\n${responseStr}\n*/\n    events: [],\n    funnels: [],\n    superProps: {},\n    userProps: {},\n    scdProps: {},\n    mirrorProps: {},\n    groupKeys: [],\n    groupProps: {},\n    lookupTables: []`;
        
    } catch (error) {
        console.warn('Could not parse AI response, using fallback:', error.message);
        return `/* Error parsing AI response: ${error.message}\n*/\n    events: [],\n    funnels: [],\n    superProps: {},\n    userProps: {},\n    scdProps: {},\n    mirrorProps: {},\n    groupKeys: [],\n    groupProps: {},\n    lookupTables: []`;
    }
}

function createDungeonFile(aiSchema, fileName, userPrompt) {
    const seed = `ai-generated-${Date.now()}`;
    const comment = `// Generated from prompt: ${userPrompt}`;
    
    // Create the complete dungeon file content
    const fileContent = `${comment}

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "${seed}";
dayjs.extend(utc);
const chance = u.initChance(SEED);
const num_users = 1_000;
const days = 100;

/** @typedef  {import("../types.d.ts").Dungeon} Config */

/** @type {Config} */
const config = {
    token: "",
    seed: SEED,
    numDays: days, 
    numEvents: num_users * 100, 
    numUsers: num_users, 
    hasAnonIds: false, 
    hasSessionIds: false, 
    format: "json",
    alsoInferFunnels: true,
    hasLocation: true,
    hasAndroidDevices: true,
    hasIOSDevices: true,
    hasDesktopDevices: true,
    hasBrowser: true,
    hasCampaigns: true,
    isAnonymous: false,
    hasAdSpend: true,
    
    hasAvatar: true,
    makeChart: false,

    batchSize: 1_500_000,
    concurrency: 1,
    writeToDisk: false,
    
    // AI-generated schema content:
    ${aiSchema}
    
    hook: function (record, type, meta) {
        const NOW = dayjs();

        if (type === "event") {
            const EVENT_TIME = dayjs(record.time);
        }

        if (type === "user") {

        }

        if (type === "funnel-post") {
            
        }

        if (type === "funnel-pre") {

        }

        if (type === "scd") {

        }

        if (type === "everything") {
        
        }

        return record;
    }
};

export default config;`;

    return fileContent;
}

async function main() {
    try {
        console.log('\n🎲 AI-Powered Dungeon Generator\n');
        console.log('This will create a new dungeon configuration using AI.');
        console.log('Describe the type of data you want to generate.\n');
        
        const userPrompt = await askQuestion('Enter your prompt for the dungeon (describe events, user behavior, etc...):\n\n> ');
        
        if (!userPrompt.trim()) {
            console.log('❌ Please provide a prompt');
            rl.close();
            return;
        }
        
        console.log('\n🤖 Generating AI schema...');
        
        // Call the AI generation function
        const aiResponse = await generateAISchema({ prompt: userPrompt });
        
        if (!aiResponse) {
            console.log('❌ Failed to generate AI schema');
            rl.close();
            return;
        }
        
        console.log('✅ AI schema generated successfully');
        
        // Parse the AI response
        // const parsedSchema = parseAIResponse(aiResponse);
		const stringifiedSchema = JSON.stringify(aiResponse, null, 2).slice(1, -1) + ',';
        
        // Generate file name
        const fileName = generateRandomFileName();
        const filePath = path.join(dungeonsDir, fileName);
        
        // Create the complete dungeon file
        const fileContent = createDungeonFile(stringifiedSchema, fileName, userPrompt);
        
        // Write the file
        await fs.writeFile(filePath, fileContent, 'utf8');
        
        console.log('\n✅ Dungeon created successfully!');
        console.log(`📁 File: ${filePath}`);
        console.log('\n📋 AI Generated Schema:');
        console.log('---');
        console.log(aiResponse);
        console.log('---\n');
        
        console.log('🎯 Next steps:');
        console.log('1. Review and customize the generated dungeon');
        console.log('2. Test it with: node index.js ' + fileName.replace('.js', ''));
        console.log('3. Adjust the configuration as needed\n');
        
    } catch (error) {
        console.error('❌ Error creating dungeon:', error.message);
        if (process.env.NODE_ENV === 'dev') {
            console.error(error);
        }
    } finally {
        rl.close();
    }
}

// Run the script
main();