#!/usr/bin/env node

/**
 * Automated dungeon creation script
 * Prompts user for a description, generates AI schema, and creates complete dungeon file
 */
let INJECT_PROMPT;
INJECT_PROMPT = ``;


import readline from 'readline';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import generateAISchema, { ask } from '../lib/utils/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the customers directory exists
const customersDir = path.join(__dirname, '..', 'customers');
await fs.mkdir(customersDir, { recursive: true });

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


/**
 * Takes the AI-generated object and converts it into a formatted string for file injection.
 * It specifically finds and removes quotes around known function calls and arrow functions.
 *
 * @param {object} aiResponseObject - The parsed object from the AI's response.
 * @returns {string} A formatted string of the object's contents, ready for injection.
 */
function parseAIResponse(aiResponseObject) {
	// Custom replacer function for JSON.stringify
	function replacer(key, value) {
		// Check if the value is a string that represents a function
		if (typeof value === 'string') {
			// List of function patterns to check
			const functionPatterns = [
				// Arrow functions with template literals
				/^\(\)\s*=>\s*`[^`]+`$/,
				// Arrow functions with single quotes
				/^\(\)\s*=>\s*'[^']+'$/,
				// Arrow functions with double quotes
				/^\(\)\s*=>\s*"[^"]+"$/,
				// Method bindings (e.g., chance.first.bind(chance))
				/^chance\.[a-zA-Z]+\.bind\(chance\)$/,
				// Function calls: range, weighNumRange, date, chance methods
				/^(range|weighNumRange|date|chance\.[a-zA-Z]+)\([^)]*\)$/
			];

			// Check if the value matches any function pattern
			for (const pattern of functionPatterns) {
				if (pattern.test(value)) {
					// Return a special marker that we'll replace later
					return `__FUNC_START__${value}__FUNC_END__`;
				}
			}
		}
		return value;
	}

	// 1. Stringify the object with the custom replacer
	let jsonString = JSON.stringify(aiResponseObject, replacer, 2);

	// 2. Replace the function markers, removing the quotes
	jsonString = jsonString.replace(/"__FUNC_START__(.*?)__FUNC_END__"/g, '$1');

	// 3. Remove quotes from property keys that are valid JavaScript identifiers
	// This regex matches quoted property names that don't need quotes
	jsonString = jsonString.replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)"\s*:/g, '$1:');

	// 4. Format the final string to match your template requirements:
	//    - Remove the opening and closing curly braces.
	//    - Add a trailing comma.
	return jsonString.slice(1, -1).trim() + ',';
}


function createDungeonFile(aiSchema, fileName, userPrompt) {
	const seed = `${fileName?.replace(".js", "")}-${Date.now()}`;


	// Create the complete dungeon file content
	const fileContent = `

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import { weighNumRange, range, date, initChance, exhaust, choose, integer  } from "../lib/utils/utils.js";

const SEED = "${seed}";
dayjs.extend(utc);
const chance = initChance(SEED);
const num_users = 1_000;
const days = 100;

/** @typedef  {import("../types.d.ts").Dungeon} Dungeon */

/** @type {Dungeon} */
const dungeon = {
    token: "",
    seed: SEED,
    numDays: days, 
    numEvents: num_users * 100, 
    numUsers: num_users, 
    hasAnonIds: false, 
    hasSessionIds: false, 
    format: "json",
    alsoInferFunnels: false,
    hasLocation: true,
    hasAndroidDevices: false,
    hasIOSDevices: false,
    hasDesktopDevices: true,
    hasBrowser: true,
    hasCampaigns: true,
    isAnonymous: false,
    hasAdSpend: true,
    
    hasAvatar: true,
    makeChart: false,

    batchSize: 1_500_000,
    concurrency: 50,
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

        if (type === "scd-pre") {

        }

        if (type === "everything") {
        
        }

        return record;
    }
};

export default dungeon;`;

	return fileContent;
}

async function main() {
	try {
		console.log('\n🎲 AI-Powered Dungeon Generator\n');
		console.log('This will create a new dungeon configuration using AI.');
		console.log('Describe the type of data you want to generate.\n');

		let userPrompt = await askQuestion('Enter your prompt for the dungeon (describe events, user behavior, etc...):\n\n> ');
		if (INJECT_PROMPT) userPrompt = INJECT_PROMPT;
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
		const dungeonSchema = parseAIResponse(aiResponse);

		// Generate file name
		// const fileName = generateRandomFileName();
		let fileName = "";
		try {
			fileName = await ask(`this is the spec of our dataset\n\n${userPrompt}\n\ni need you to come up with a short slug name for this dungeon; all lowercase letters and hyphens, no spaces or special characters`);
			fileName = fileName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
			fileName += "-" + Math.random().toString(36).substring(2, 8);
			if (!fileName.endsWith('.js')) fileName += '.js';
		}
		catch {
			fileName = generateRandomFileName();
		}
		const filePath = path.join(customersDir, fileName);

		// Create the complete dungeon file
		const fileContent = createDungeonFile(dungeonSchema, fileName, userPrompt);

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