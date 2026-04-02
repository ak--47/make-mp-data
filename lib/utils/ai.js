/**
 * AI Cache Module - Pre-warmed AI transformer instances for Cloud Run
 *
 * This module follows Google Cloud Run best practices for caching expensive objects.
 * AI transformers are initialized at module load time (container cold-start) and
 * reused across all requests to minimize latency.
 */

import AITransformer from 'ak-gemini';
import * as u from "ak-tools";
import 'dotenv/config';
import { aiLogger as logger } from './logger.js';
import { trackAIJob } from './mixpanel.js';

const { NODE_ENV = "unknown", GOOGLE_CLOUD_PROJECT = "mixpanel-gtm-training" } = process.env;
// Uses Vertex AI with Application Default Credentials by default
// GEMINI_API_KEY is no longer required

const MAX_OUTPUT_TOKENS = 50_000;
const DEFAULT_MODEL = 'gemini-2.5-flash';

// Supported models for validation
const SUPPORTED_MODELS = [
	'gemini-2.5-flash',
	'gemini-2.5-pro',
	'gemini-3-flash-preview',
	'gemini-3-pro-preview'
];

/**
 * Format a number with commas for readability (e.g., 31395 -> "31,395")
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
	return num.toLocaleString('en-US');
}

/**
 * Estimate token count from text using Google's rough approximation
 * (1 token ~= 4 characters, 100 tokens ~= 60-80 English words)
 * @param {string} text - Text to estimate tokens for
 * @returns {number} Estimated token count
 */
function estimateTokens(text) {
	if (!text) return 0;
	return Math.ceil(text.length / 4);
}

/**
 * Log structured AI call metrics
 * In production, outputs JSON for Cloud Logging ingestion
 * @param {object} params - Logging parameters
 * @param {string} params.component - AI component name (schema, hooks, refine, funnels)
 * @param {string} params.prompt - Original user prompt
 * @param {any} params.response - AI response
 * @param {number} params.duration_ms - Call duration in milliseconds
 * @param {boolean} params.success - Whether the call succeeded
 * @param {string} [params.error] - Error message if failed
 * @param {string} [params.model] - Model used
 * @param {object} [params.usage] - Token usage from ai.getLastUsage()
 */
function logAICallStructured(params) {
	const { component, prompt, response, duration_ms, success, error, model, usage } = params;

	const structuredLog = {
		message: "AI Response",
		component,
		model: model || DEFAULT_MODEL,
		prompt_preview: prompt?.substring(0, 200) || '',
		prompt_length: prompt?.length || 0,
		output_length: response ? JSON.stringify(response).length : 0,
		duration_ms,
		duration_human: `${(duration_ms / 1000).toFixed(2)} seconds`,
		success,
		error: error || null,
		environment: NODE_ENV,
		// Token usage from ak-gemini library
		...(usage && {
			promptTokens: usage.promptTokens,
			responseTokens: usage.responseTokens,
			totalTokens: usage.totalTokens,
			attempts: usage.attempts,
			modelVersion: usage.modelVersion,
			requestedModel: usage.requestedModel
		})
	};

	// In production, output structured JSON for Cloud Logging
	if (NODE_ENV === 'production') {
		console.log(JSON.stringify(structuredLog));
	} else {
		// In dev/test, use the logger with structured data
		if (success) {
			logger.debug(structuredLog, `AI ${component} call completed`);
		} else {
			logger.error(structuredLog, `AI ${component} call failed`);
		}
	}

	return structuredLog;
}

// ========== VALIDATION FUNCTIONS FOR SELF-HEALING ==========

/**
 * Validates AI-generated schema meets minimum requirements.
 * Used with transformWithValidation for self-healing.
 * @param {object} payload - AI response payload
 * @returns {Promise<object>} Validated payload
 * @throws {Error} If validation fails (triggers AI retry)
 */
async function validateSchemaOutput(payload) {
	const errors = [];

	if (!Array.isArray(payload.events) || payload.events.length < 8) {
		errors.push(`events: expected array with at least 8 items, got ${payload.events?.length || 0}`);
	}

	if (!Array.isArray(payload.funnels) || payload.funnels.length < 3) {
		errors.push(`funnels: expected array with at least 3 items, got ${payload.funnels?.length || 0}`);
	}

	if (!payload.superProps || typeof payload.superProps !== 'object' ||
		Array.isArray(payload.superProps) || Object.keys(payload.superProps).length < 2) {
		errors.push(`superProps: expected object with at least 2 keys, got ${Object.keys(payload.superProps || {}).length}`);
	}

	if (!payload.userProps || typeof payload.userProps !== 'object' ||
		Array.isArray(payload.userProps) || Object.keys(payload.userProps).length < 6) {
		errors.push(`userProps: expected object with at least 6 keys, got ${Object.keys(payload.userProps || {}).length}`);
	}

	if (Array.isArray(payload.events)) {
		payload.events.forEach((event, i) => {
			if (!event.event || typeof event.event !== 'string') {
				errors.push(`events[${i}]: missing or invalid 'event' name`);
			}
		});
	}

	if (Array.isArray(payload.funnels)) {
		payload.funnels.forEach((funnel, i) => {
			if (!Array.isArray(funnel.sequence) || funnel.sequence.length < 2) {
				errors.push(`funnels[${i}]: sequence must have at least 2 events`);
			}
			if (typeof funnel.conversionRate !== 'number' ||
				funnel.conversionRate < 0 || funnel.conversionRate > 100) {
				errors.push(`funnels[${i}]: conversionRate must be integer between 0 and 100`);
			}
		});
	}

	if (errors.length > 0) {
		throw new Error(`Schema validation failed:\n${errors.join('\n')}\n\nPlease fix these issues and return the COMPLETE corrected schema (all fields: events, funnels, superProps, userProps, etc).`);
	}

	return payload;
}

/**
 * Creates a funnels validator with schema context for semantic validation.
 * @param {object} schema - The current schema (for event name validation)
 * @returns {(payload: any) => Promise<any>} Validator function
 */
function createFunnelsValidator(schema) {
	return async function validateFunnelsOutput(payload) {
		const errors = [];

		if (!Array.isArray(payload.funnels) || payload.funnels.length < 2) {
			errors.push(`funnels: expected array with at least 2 items, got ${payload.funnels?.length || 0}`);
		}

		const validEventNames = new Set(
			(schema?.events || []).map(e => e.event).filter(Boolean)
		);

		if (Array.isArray(payload.funnels)) {
			payload.funnels.forEach((funnel, i) => {
				if (!Array.isArray(funnel.sequence) || funnel.sequence.length < 2) {
					errors.push(`funnels[${i}]: sequence must have at least 2 events`);
				}
				if (typeof funnel.conversionRate !== 'number' ||
					funnel.conversionRate < 0 || funnel.conversionRate > 100) {
					errors.push(`funnels[${i}]: conversionRate must be integer between 0 and 100`);
				}

				if (Array.isArray(funnel.sequence) && validEventNames.size > 0) {
					funnel.sequence.forEach((eventName, j) => {
						if (!validEventNames.has(eventName)) {
							const available = [...validEventNames].slice(0, 5).join(', ');
							errors.push(`funnels[${i}].sequence[${j}]: "${eventName}" is not a valid event. Available: ${available}...`);
						}
					});
				}
			});
		}

		if (errors.length > 0) {
			throw new Error(`Funnels validation failed:\n${errors.join('\n')}\n\nPlease fix these issues and return the COMPLETE corrected funnels object with all funnels.`);
		}

		return payload;
	};
}

/**
 * Validates AI-generated hook code.
 * @param {string} code - Hook function code
 * @returns {Promise<string>} Validated code
 * @throws {Error} If validation fails
 */
async function validateHookOutput(code) {
	const errors = [];

	if (typeof code !== 'string' || !code.trim()) {
		throw new Error('Hook must be a non-empty string. Please return only the function code starting with: function(record, type, meta) { ... }');
	}

	const trimmed = code.trim();

	if (!trimmed.startsWith('function(record, type, meta)') &&
		!trimmed.startsWith('function (record, type, meta)')) {
		errors.push('Hook must start with: function(record, type, meta)');
	}

	if (!trimmed.includes('return record')) {
		errors.push('Hook must include "return record" statement');
	}

	try {
		new Function('return ' + trimmed);
	} catch (e) {
		errors.push(`Invalid JavaScript syntax: ${e.message}`);
	}

	if (errors.length > 0) {
		throw new Error(`Hook validation failed:\n${errors.join('\n')}\n\nPlease return the COMPLETE corrected hook function code only (no markdown, no explanations).`);
	}

	return code;
}

// Initialization state tracking
const initState = {
	schema: { initialized: false, initializing: false, instance: null, error: null, instructions: null },
	hooks: { initialized: false, initializing: false, instance: null, error: null, instructions: null },
	refine: { initialized: false, initializing: false, instance: null, error: null, instructions: null },
	funnels: { initialized: false, initializing: false, instance: null, error: null, instructions: null }
};

let cachedTemplates = null;

/**
 * Load and cache instruction templates
 * @returns {Promise<object>} Cached templates
 */
async function loadTemplates() {
	if (cachedTemplates) return cachedTemplates;

	const [INSTRUCTIONS, TYPES, HOOKS_INSTRUCTIONS, REFINE_INSTRUCTIONS, HOOK_EXAMPLES, FUNNELS_INSTRUCTIONS] = await Promise.all([
		u.load('./lib/templates/schema-instructions.txt', false),
		u.load('./lib/templates/schema.d.ts', false),
		u.load('./lib/templates/hooks-instructions.txt', false),
		u.load('./lib/templates/refine-instructions.txt', false),
		u.load('./lib/templates/hook-examples.json', true),
		u.load('./lib/templates/funnels-instructions.txt', false)
	]);

	const transformedExamples = HOOK_EXAMPLES.examples.map(ex => ({
		PROMPT: { prompt: ex.prompt },
		ANSWER: { hook: ex.response },
		EXPLANATION: ex.useCase,
		CONTEXT: {
			hookTypes: ex.hookTypes,
			patterns: ex.patterns,
			complexity: ex.complexity
		}
	}));

	cachedTemplates = {
		schemaInstructions: INSTRUCTIONS.replace(/<TYPES>/g, TYPES),
		hooksInstructions: HOOKS_INSTRUCTIONS,
		refineInstructions: REFINE_INSTRUCTIONS.replace(/<TYPES>/g, TYPES),
		funnelsInstructions: FUNNELS_INSTRUCTIONS,
		types: TYPES,
		hookExamples: transformedExamples
	};

	return cachedTemplates;
}

/**
 * Initialize schema generation AI transformer
 * @returns {Promise<AITransformer>} Initialized AI instance
 */
async function initSchemaAI() {
	if (initState.schema.initialized) return initState.schema.instance;
	if (initState.schema.initializing) {
		while (initState.schema.initializing) {
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		if (initState.schema.error) throw initState.schema.error;
		return initState.schema.instance;
	}

	initState.schema.initializing = true;

	try {
		const templates = await loadTemplates();
		initState.schema.instructions = templates.schemaInstructions?.trim();

		const instructionChars = initState.schema.instructions?.length || 0;
		const instructionTokens = estimateTokens(initState.schema.instructions);
		logger.debug({ component: 'schema', instructionChars, instructionTokens }, `Schema instructions: ${formatNumber(instructionChars)} chars (~${formatNumber(instructionTokens)} tokens)`);

		const ai = new AITransformer({
			vertexai: true,
			maxOutputTokens: MAX_OUTPUT_TOKENS,
			project: GOOGLE_CLOUD_PROJECT,
			onlyJSON: true,
			systemInstructions: null,
			modelName: DEFAULT_MODEL,
			logLevel: "none",
			labels: {
				"app": "dm4",
				"component": "schema"
			}
		});

		await ai.init();

		initState.schema.instance = ai;
		initState.schema.initialized = true;

		// @ts-ignore
		return ai;
	} catch (error) {
		initState.schema.error = error;
		logger.error({ err: error }, 'Failed to initialize schema AI');
		throw error;
	} finally {
		initState.schema.initializing = false;
	}
}

/**
 * Initialize hooks generation AI transformer
 * @returns {Promise<AITransformer>} Initialized AI instance
 */
async function initHooksAI() {
	if (initState.hooks.initialized) return initState.hooks.instance;
	if (initState.hooks.initializing) {
		while (initState.hooks.initializing) {
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		if (initState.hooks.error) throw initState.hooks.error;
		return initState.hooks.instance;
	}

	initState.hooks.initializing = true;

	try {
		const templates = await loadTemplates();
		initState.hooks.instructions = templates.hooksInstructions?.trim();

		const instructionChars = initState.hooks.instructions?.length || 0;
		const instructionTokens = estimateTokens(initState.hooks.instructions);
		logger.debug({ component: 'hooks', instructionChars, instructionTokens }, `Hooks instructions: ${formatNumber(instructionChars)} chars (~${formatNumber(instructionTokens)} tokens)`);

		const ai = new AITransformer({
			vertexai: true,
			project: GOOGLE_CLOUD_PROJECT,
			maxOutputTokens: MAX_OUTPUT_TOKENS,
			onlyJSON: false,
			systemInstructions: null,
			modelName: DEFAULT_MODEL,
			logLevel: "none",
			exampleData: templates.hookExamples,
			promptKey: 'PROMPT',
			answerKey: 'ANSWER',
			contextKey: 'CONTEXT',
			explanationKey: 'EXPLANATION',
			labels: {
				"app": "dm4",
				"component": "hooks"
			}
		});

		await ai.init();

		initState.hooks.instance = ai;
		initState.hooks.initialized = true;

		// @ts-ignore
		return ai;
	} catch (error) {
		initState.hooks.error = error;
		logger.error({ err: error }, 'Failed to initialize hooks AI');
		throw error;
	} finally {
		initState.hooks.initializing = false;
	}
}

/**
 * Initialize refine AI transformer
 * @returns {Promise<AITransformer>} Initialized AI instance
 */
async function initRefineAI() {
	if (initState.refine.initialized) return initState.refine.instance;
	if (initState.refine.initializing) {
		while (initState.refine.initializing) {
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		if (initState.refine.error) throw initState.refine.error;
		return initState.refine.instance;
	}

	initState.refine.initializing = true;

	try {
		const templates = await loadTemplates();
		initState.refine.instructions = templates.refineInstructions?.trim();

		const instructionChars = initState.refine.instructions?.length || 0;
		const instructionTokens = estimateTokens(initState.refine.instructions);
		logger.debug({ component: 'refine', instructionChars, instructionTokens }, `Refine instructions: ${formatNumber(instructionChars)} chars (~${formatNumber(instructionTokens)} tokens)`);

		const ai = new AITransformer({
			vertexai: true,
			project: GOOGLE_CLOUD_PROJECT,
			maxOutputTokens: MAX_OUTPUT_TOKENS,
			onlyJSON: true,
			systemInstructions: null,
			modelName: DEFAULT_MODEL,
			chatConfig: { temperature: 0.1 },
			logLevel: "none",
			labels: {
				"app": "dm4",
				"component": "refine"
			}
		});

		await ai.init();

		initState.refine.instance = ai;
		initState.refine.initialized = true;

		// @ts-ignore
		return ai;
	} catch (error) {
		initState.refine.error = error;
		logger.error({ err: error }, 'Failed to initialize refine AI');
		throw error;
	} finally {
		initState.refine.initializing = false;
	}
}

/**
 * Initialize funnels generation AI transformer
 * @returns {Promise<AITransformer>} Initialized AI instance
 */
async function initFunnelsAI() {
	if (initState.funnels.initialized) return initState.funnels.instance;
	if (initState.funnels.initializing) {
		while (initState.funnels.initializing) {
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		if (initState.funnels.error) throw initState.funnels.error;
		return initState.funnels.instance;
	}

	initState.funnels.initializing = true;

	try {
		const templates = await loadTemplates();
		initState.funnels.instructions = templates.funnelsInstructions?.trim();

		const instructionChars = initState.funnels.instructions?.length || 0;
		const instructionTokens = estimateTokens(initState.funnels.instructions);
		logger.debug({ component: 'funnels', instructionChars, instructionTokens }, `Funnels instructions: ${formatNumber(instructionChars)} chars (~${formatNumber(instructionTokens)} tokens)`);

		const ai = new AITransformer({
			vertexai: true,
			project: GOOGLE_CLOUD_PROJECT,
			maxOutputTokens: MAX_OUTPUT_TOKENS,
			onlyJSON: true,
			systemInstructions: null,
			modelName: DEFAULT_MODEL,
			logLevel: "none",
			labels: {
				"app": "dm4",
				"component": "funnels"
			}
		});

		await ai.init();

		initState.funnels.instance = ai;
		initState.funnels.initialized = true;

		// @ts-ignore
		return ai;
	} catch (error) {
		initState.funnels.error = error;
		logger.error({ err: error }, 'Failed to initialize funnels AI');
		throw error;
	} finally {
		initState.funnels.initializing = false;
	}
}

/**
 * Pre-warm all AI instances (called at module load)
 */
async function prewarmAllAI() {
	const startTime = Date.now();

	try {
		const results = await Promise.allSettled([
			initSchemaAI(),
			initHooksAI(),
			initRefineAI(),
			initFunnelsAI()
		]);

		const elapsed = Date.now() - startTime;

		const failures = results.filter(r => r.status === 'rejected');
		if (failures.length > 0) {
			logger.warn({ failures: failures.length, elapsed }, `Pre-warming completed with ${failures.length} failures in ${elapsed}ms`);
			failures.forEach((f, i) => logger.error({ component: ['Schema', 'Hooks', 'Refine', 'Funnels'][i], err: f.reason }));
		} else {
			logger.info({ elapsed }, `AI transformers pre-warmed in ${elapsed}ms`);
		}
	} catch (error) {
		logger.error({ err: error }, 'Critical error during pre-warming');
	}
}

/**
 * Generate AI schema using cached transformer
 * @param {object} params - Parameters object
 * @param {string} params.prompt - User's prompt
 * @param {string} [params.user_id] - User ID for tracking
 * @param {string} [params.model] - Model to use
 * @returns {Promise<object>} Generated schema
 */
export async function generateAISchema(params) {
	const { prompt, user_id, model } = params;
	if (!prompt) throw new Error("Please provide a prompt");

	const ai = await initSchemaAI();

	const selectedModel = SUPPORTED_MODELS.includes(model) ? model : DEFAULT_MODEL;
	ai.modelName = selectedModel;

	const fullPrompt = `${initState.schema.instructions}\n\n---\n\nUSER REQUEST:\n${prompt}`;

	const startTime = Date.now();
	logger.debug({ model: selectedModel }, 'Starting AI schema generation');

	let response = null;
	let success = false;
	let errorMessage = null;

	try {
		// @ts-ignore
		response = await ai.transformWithValidation(
			{ prompt: fullPrompt },
			{ maxRetries: 2 },
			validateSchemaOutput
		);
		success = true;
	} catch (error) {
		errorMessage = error.message;
		throw error;
	} finally {
		const duration_ms = Date.now() - startTime;
		const usage = ai.getLastUsage?.() || null;

		logAICallStructured({
			component: 'schema', prompt, response, duration_ms,
			success, error: errorMessage, model: selectedModel, usage
		});

		trackAIJob({
			component: 'schema', prompt, response, duration_ms,
			success, error: errorMessage, usage, user_id
		});
	}

	return response;
}

/**
 * Generate AI hooks using cached transformer
 * @param {object} params - Parameters object
 * @param {string} params.prompt - User's description of desired trends
 * @param {object} params.currentSchema - The existing dungeon schema
 * @param {string} [params.user_id] - User ID for tracking
 * @param {string} [params.model] - Model to use
 * @returns {Promise<string>} Generated hook function code
 */
export async function generateAIHooks(params) {
	const { prompt, currentSchema, user_id, model } = params;
	if (!prompt) throw new Error("Please provide a prompt describing the trends you want");
	if (!currentSchema) throw new Error("Please provide the current schema");

	const ai = await initHooksAI();

	const selectedModel = SUPPORTED_MODELS.includes(model) ? model : DEFAULT_MODEL;
	ai.modelName = selectedModel;

	const schemaString = JSON.stringify(currentSchema, null, 2);
	const instructionsWithSchema = initState.hooks.instructions
		.replace(/<CURRENT_SCHEMA>/g, schemaString);

	const fullPrompt = `${instructionsWithSchema}\n\n---\n\nUSER REQUEST:\n${prompt}`;

	const startTime = Date.now();
	logger.debug({ model: selectedModel }, 'Starting AI hooks generation');

	let response = null;
	let hookCode = null;
	let success = false;
	let errorMessage = null;

	try {
		// @ts-ignore
		response = /** @type {string | {hook: string}} */ (await ai.message({ prompt: fullPrompt }));

		if (typeof response === 'string') {
			hookCode = response.trim();
		} else if (response && typeof response === 'object' && 'hook' in response) {
			hookCode = response.hook.trim();
		} else {
			throw new Error('AI did not return a valid hook function');
		}

		hookCode = hookCode
			.replace(/^```javascript\s*/g, '')
			.replace(/^```js\s*/g, '')
			.replace(/^```\s*/g, '')
			.replace(/```$/g, '')
			.trim();

		await validateHookOutput(hookCode);

		success = true;
		logger.info('Hook function validated successfully');
	} catch (error) {
		errorMessage = error.message;
		throw error;
	} finally {
		const duration_ms = Date.now() - startTime;
		const usage = ai.getLastUsage?.() || null;

		logAICallStructured({
			component: 'hooks', prompt, response: hookCode, duration_ms,
			success, error: errorMessage, model: selectedModel, usage
		});

		trackAIJob({
			component: 'hooks', prompt, response: hookCode, duration_ms,
			success, error: errorMessage, usage, user_id
		});
	}

	return hookCode;
}

/**
 * Refine existing schema using cached transformer
 * @param {object} params - Parameters object
 * @param {string} params.prompt - User's description of changes
 * @param {object} params.currentSchema - The existing dungeon schema to refine
 * @param {string} [params.user_id] - User ID for tracking
 * @param {string} [params.model] - Model to use
 * @returns {Promise<object>} Refined dungeon schema
 */
export async function generateAIRefine(params) {
	const { prompt, currentSchema, user_id, model } = params;
	if (!prompt) throw new Error("Please provide a description of the changes you want");
	if (!currentSchema) throw new Error("Please provide the current schema to refine");

	const ai = await initRefineAI();

	const selectedModel = SUPPORTED_MODELS.includes(model) ? model : DEFAULT_MODEL;
	ai.modelName = selectedModel;

	const templates = await loadTemplates();
	const schemaString = JSON.stringify(currentSchema, null, 2);
	const instructionsWithSchema = initState.refine.instructions
		.replace(/<CURRENT_SCHEMA>/g, schemaString)
		.replace(/<TYPES>/g, templates.types);

	const fullPrompt = `${instructionsWithSchema}\n\n---\n\nUSER REQUEST:\n${prompt}`;

	const startTime = Date.now();
	logger.debug({ model: selectedModel }, 'Starting AI refine operation');

	let response = null;
	let success = false;
	let errorMessage = null;

	try {
		// @ts-ignore
		response = await ai.transformWithValidation(
			{ prompt: fullPrompt },
			{ maxRetries: 2 },
			validateSchemaOutput
		);
		success = true;
	} catch (error) {
		errorMessage = error.message;
		throw error;
	} finally {
		const duration_ms = Date.now() - startTime;
		const usage = ai.getLastUsage?.() || null;

		logAICallStructured({
			component: 'refine', prompt, response, duration_ms,
			success, error: errorMessage, model: selectedModel, usage
		});

		trackAIJob({
			component: 'refine', prompt, response, duration_ms,
			success, error: errorMessage, usage, user_id
		});
	}

	return response;
}

/**
 * Generate AI funnels using cached transformer
 * @param {object} params - Parameters object
 * @param {string} params.prompt - User's description of user journeys
 * @param {object} params.currentSchema - The existing dungeon schema
 * @param {string} [params.user_id] - User ID for tracking
 * @param {string} [params.model] - Model to use
 * @returns {Promise<object>} Generated funnels object
 */
export async function generateAIFunnels(params) {
	const { prompt, currentSchema, user_id, model } = params;
	if (!prompt) throw new Error("Please provide a prompt describing user journeys");
	if (!currentSchema) throw new Error("Please provide the current schema");

	const ai = await initFunnelsAI();

	const selectedModel = SUPPORTED_MODELS.includes(model) ? model : DEFAULT_MODEL;
	ai.modelName = selectedModel;

	const schemaString = JSON.stringify(currentSchema, null, 2);
	const instructionsWithSchema = initState.funnels.instructions
		.replace(/<CURRENT_SCHEMA>/g, schemaString);

	const fullPrompt = `${instructionsWithSchema}\n\n---\n\nUSER REQUEST:\n${prompt}`;

	const startTime = Date.now();
	logger.debug({ model: selectedModel }, 'Starting AI funnels generation');

	const validateFunnels = createFunnelsValidator(currentSchema);

	let response = null;
	let success = false;
	let errorMessage = null;

	try {
		// @ts-ignore
		response = await ai.transformWithValidation(
			{ prompt: fullPrompt },
			{ maxRetries: 2 },
			validateFunnels
		);
		success = true;
	} catch (error) {
		errorMessage = error.message;
		throw error;
	} finally {
		const duration_ms = Date.now() - startTime;
		const usage = ai.getLastUsage?.() || null;

		logAICallStructured({
			component: 'funnels', prompt, response, duration_ms,
			success, error: errorMessage, model: selectedModel, usage
		});

		trackAIJob({
			component: 'funnels', prompt, response, duration_ms,
			success, error: errorMessage, usage, user_id
		});
	}

	return response;
}

/**
 * Get initialization status for monitoring
 * @returns {object} Current initialization state of all AI instances
 */
export function getInitStatus() {
	return {
		schema: { ready: initState.schema.initialized, error: initState.schema.error?.message },
		hooks: { ready: initState.hooks.initialized, error: initState.hooks.error?.message },
		refine: { ready: initState.refine.initialized, error: initState.refine.error?.message },
		funnels: { ready: initState.funnels.initialized, error: initState.funnels.error?.message }
	};
}

// Start pre-warming immediately when module loads (container cold-start)
if (NODE_ENV !== 'test') {
	prewarmAllAI().catch(error => {
		logger.error({ err: error }, 'Failed to pre-warm AI transformers');
	});
}

/**
 * Generic AI question
 * @param {string} question - The question to ask
 * @param {string} [user_id] - User ID for tracking
 * @returns {Promise<string>} The AI response
 */
export async function ask(question, user_id = null) {
	const prompt = question;
	const ai = new AITransformer({
		vertexai: true,
		project: GOOGLE_CLOUD_PROJECT,
		maxOutputTokens: MAX_OUTPUT_TOKENS,
		onlyJSON: false,
		responseSchema: {
			type: "string"
		},
		modelName: "gemini-2.5-flash-lite",
		labels: {
			"app": "dm4",
			"component": "generic"
		}
	});

	const startTime = Date.now();
	await ai.init();

	let response = null;
	let success = false;
	let errorMessage = null;

	try {
		response = await ai.message({ prompt });
		success = true;
	} catch (error) {
		errorMessage = error.message;
		throw error;
	} finally {
		const duration_ms = Date.now() - startTime;
		const usage = ai.getLastUsage?.() || null;

		const logData = {
			component: 'ai-generic',
			prompt_preview: prompt.substring(0, 200),
			prompt_length: prompt.length,
			output_length: response?.toString()?.length || 0,
			duration_ms,
			duration_human: `${(duration_ms / 1000).toFixed(2)} seconds`,
			user_id: user_id || 'anonymous',
			success,
			error: errorMessage,
			...(usage && {
				promptTokens: usage.promptTokens,
				responseTokens: usage.responseTokens,
				totalTokens: usage.totalTokens,
				attempts: usage.attempts,
				modelVersion: usage.modelVersion,
				requestedModel: usage.requestedModel
			}),
		};

		if (success) {
			logger.info(logData, `AI ask completed in ${duration_ms}ms`);
		} else {
			logger.error(logData, `AI ask failed after ${duration_ms}ms`);
		}

		trackAIJob({
			component: 'generic', prompt, response: response?.toString(),
			duration_ms, success, error: errorMessage, usage, user_id
		});
	}

	return response?.toString()?.trim();
}

export default generateAISchema;
