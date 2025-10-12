import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import generateAISchema, { generateAIHooks } from '../lib/utils/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', service: 'Dungeon Master 4' });
});

app.listen(PORT, () => {
	console.log(`\n🎲 Dungeon Master 4 is running on http://localhost:${PORT}\n`);
});
