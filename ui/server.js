import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import generateAISchema, { generateAIHooks } from '../lib/utils/ai.js';
import main from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure tmp directory exists on startup
const tmpDir = path.join(__dirname, '..', 'tmp');
fs.mkdir(tmpDir, { recursive: true }).catch(console.error);

// Middleware
app.use(express.json({ limit: '10mb' })); // Increase limit for large schemas
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to generate dungeon schema
app.post('/api/generate', async (req, res) => {
	try {
		const { prompt, context } = req.body;

		if (!prompt || !prompt.trim()) {
			return res.status(400).json({
				error: 'Please provide a prompt'
			});
		}

		// Build the full prompt with context if iterating
		let fullPrompt = prompt;
		if (context && context.originalPrompt && context.currentSchema) {
			console.log('🔄 Iterating on existing schema...');
			fullPrompt = `
ORIGINAL REQUEST: ${context.originalPrompt}

CURRENT SCHEMA (as JSON):
${JSON.stringify(context.currentSchema, null, 2)}

NEW INSTRUCTIONS: ${prompt}

Please update the schema based on the new instructions above. Keep all existing properties unless specifically asked to change or remove them. Return the complete updated schema.
			`.trim();
		} else {
			console.log('🤖 Generating new AI schema for prompt:', prompt.substring(0, 100) + '...');
		}

		// Call the AI generation function
		const aiResponse = await generateAISchema({ prompt: fullPrompt });

		if (!aiResponse) {
			return res.status(500).json({
				error: 'Failed to generate AI schema'
			});
		}

		console.log('✅ AI schema generated successfully');

		// Return the AI response as JSON
		res.json({
			success: true,
			schema: aiResponse,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('❌ Error generating schema:', error.message);
		res.status(500).json({
			error: error.message || 'Internal server error'
		});
	}
});

// API endpoint to generate hooks
app.post('/api/generate-hooks', async (req, res) => {
	try {
		const { prompt, currentSchema } = req.body;

		if (!prompt || !prompt.trim()) {
			return res.status(400).json({
				error: 'Please provide a prompt describing the trends you want'
			});
		}

		if (!currentSchema) {
			return res.status(400).json({
				error: 'Current schema is required for hooks generation'
			});
		}

		console.log('🔧 Generating hooks for trends:', prompt.substring(0, 100) + '...');

		// Call the hooks generation function
		const hooksCode = await generateAIHooks({
			prompt,
			currentSchema
		});

		if (!hooksCode) {
			return res.status(500).json({
				error: 'Failed to generate hooks'
			});
		}

		console.log('✅ Hooks generated successfully');

		// Return the hooks code
		res.json({
			success: true,
			hooks: hooksCode,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('❌ Error generating hooks:', error.message);
		res.status(500).json({
			error: error.message || 'Internal server error'
		});
	}
});

/**
 * Helper function to convert JSON config to valid JS file with imports
 * Based on parseAIResponse from create-dungeon.mjs
 */
function createDungeonJSFile(jsonConfig, dungeonName) {
	const timestamp = Date.now();
	const seed = `${dungeonName}-${timestamp}`;

	// Custom replacer function for JSON.stringify to handle functions
	function replacer(_key, value) {
		if (typeof value === 'string') {
			const functionPatterns = [
				/^\(\)\s*=>\s*`[^`]+`$/,
				/^\(\)\s*=>\s*'[^']+'$/,
				/^\(\)\s*=>\s*"[^"]+"$/,
				/^chance\.[a-zA-Z]+\.bind\(chance\)$/,
				/^(range|weighNumRange|date|chance\.[a-zA-Z]+|createGenerator|generateBatch|choose|integer|exhaust)\([^)]*\)$/
			];

			for (const pattern of functionPatterns) {
				if (pattern.test(value)) {
					return `__FUNC_START__${value}__FUNC_END__`;
				}
			}
		}
		return value;
	}

	// Stringify with custom replacer
	let jsonString = JSON.stringify(jsonConfig, replacer, 2);

	// Replace function markers, removing quotes
	jsonString = jsonString.replace(/"__FUNC_START__(.*?)__FUNC_END__"/g, '$1');

	// Remove quotes from property keys
	jsonString = jsonString.replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)"\s*:/g, '$1:');

	// Remove outer braces and add trailing comma
	const configContent = jsonString.slice(1, -1).trim() + ',';

	// Create complete dungeon file
	const fileContent = `
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import { weighNumRange, range, date, initChance, exhaust, choose, integer } from "../lib/utils/utils.js";
import { createGenerator, generateBatch } from "../lib/generators/text.js";

const SEED = "${seed}";
dayjs.extend(utc);
const chance = initChance(SEED);

/** @typedef  {import("../types.d.ts").Dungeon} Dungeon */

/** @type {Dungeon} */
const dungeon = {
	seed: SEED,
	batchSize: 2500000, // Hardcoded for UI
	${configContent}
};

export default dungeon;
`;

	return fileContent;
}

// API endpoint to run dungeon simulation
app.post('/api/run', async (req, res) => {
	let tmpFilePath = null;

	try {
		const { config } = req.body;

		if (!config) {
			return res.status(400).json({
				error: 'Configuration is required'
			});
		}

		// Generate filename
		const dungeonName = config.name || 'dungeon';
		const timestamp = Date.now();
		const filename = `dungeon-${dungeonName}-${timestamp}.js`;
		tmpFilePath = path.join(tmpDir, filename);

		console.log('🎲 Running dungeon simulation:', dungeonName);

		// Create JS file with imports
		const fileContent = createDungeonJSFile(config, dungeonName);

		// Write to tmp directory
		await fs.writeFile(tmpFilePath, fileContent, 'utf8');
		console.log('📝 Dungeon file created:', tmpFilePath);

		// Dynamically import the dungeon config
		const dungeonModule = await import(`file://${tmpFilePath}`);
		const dungeonConfig = dungeonModule.default;

		// Run the main generation function
		console.log('⚡ Starting data generation...');
		const result = await main(dungeonConfig);

		console.log('✅ Data generation complete!');

		// Clean up tmp file
		try {
			await fs.unlink(tmpFilePath);
			console.log('🗑️  Cleaned up tmp file');
		} catch (cleanupError) {
			console.warn('Warning: Could not delete tmp file:', cleanupError.message);
		}

		// Return results
		res.json({
			success: true,
			result: {
				eventCount: result.eventCount || 0,
				userCount: result.userCount || 0,
				files: result.files || [],
				config: dungeonConfig.name || 'dungeon'
			},
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('❌ Error running dungeon:', error.message);

		// Clean up tmp file on error
		if (tmpFilePath) {
			try {
				await fs.unlink(tmpFilePath);
			} catch {}
		}

		res.status(500).json({
			error: error.message || 'Failed to run dungeon simulation',
			stack: process.env.NODE_ENV === 'dev' ? error.stack : undefined
		});
	}
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok', service: 'Dungeon Master 4' });
});

app.listen(PORT, () => {
	console.log(`\n🎲 Dungeon Master 4 is running on http://localhost:${PORT}\n`);
});
