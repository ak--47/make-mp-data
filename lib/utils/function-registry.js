/**
 * Registry of valid functions that can be called in dungeon configurations
 * This replaces the old string-based function parsing with a clean JSON structure
 */

import { dataLogger as logger } from './logger.js';

export const FUNCTION_REGISTRY = {
	// Utility functions from utils.js
	weighNumRange: {
		minArgs: 2,
		maxArgs: 3,
		description: 'Generate weighted random number in range'
	},
	range: {
		minArgs: 2,
		maxArgs: 2,
		description: 'Generate array of numbers in range'
	},
	date: {
		minArgs: 1,
		maxArgs: 3,
		description: 'Generate date string'
	},
	choose: {
		minArgs: 1,
		maxArgs: 1,
		description: 'Choose from array'
	},
	integer: {
		minArgs: 1,
		maxArgs: 2,
		description: 'Generate random integer'
	},
	exhaust: {
		minArgs: 1,
		maxArgs: 1,
		description: 'Exhaust values from array'
	},

	// Additional utility functions
	maybe: {
		minArgs: 1,
		maxArgs: 2,
		description: 'Return value or null based on probability'
	},
	takeSome: {
		minArgs: 1,
		maxArgs: 3,
		description: 'Take random subset from array'
	},
	randomElement: {
		minArgs: 1,
		maxArgs: 1,
		description: 'Return random element from array'
	},
	randomInt: {
		minArgs: 2,
		maxArgs: 2,
		description: 'Generate random integer'
	},

	// Text generation functions
	createTextGenerator: {
		minArgs: 1,
		maxArgs: 1,
		description: 'Create text generator with config'
	},
	generateBatch: {
		minArgs: 2,
		maxArgs: 2,
		description: 'Generate batch of text'
	},

	// Chance.js functions (using dot notation)
	'chance.word': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random word'
	},
	'chance.sentence': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random sentence'
	},
	'chance.paragraph': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random paragraph'
	},
	'chance.name': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random name'
	},
	'chance.first': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random first name'
	},
	'chance.last': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random last name'
	},
	'chance.email': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random email'
	},
	'chance.company': {
		minArgs: 0,
		maxArgs: 0,
		description: 'Generate random company name'
	},
	'chance.profession': {
		minArgs: 0,
		maxArgs: 0,
		description: 'Generate random profession'
	},
	'chance.industry': {
		minArgs: 0,
		maxArgs: 0,
		description: 'Generate random industry'
	},
	'chance.country': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random country'
	},
	'chance.city': {
		minArgs: 0,
		maxArgs: 0,
		description: 'Generate random city'
	},
	'chance.state': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random state'
	},
	'chance.address': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random address'
	},
	'chance.phone': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random phone number'
	},
	'chance.url': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random URL'
	},
	'chance.domain': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random domain'
	},
	'chance.ip': {
		minArgs: 0,
		maxArgs: 0,
		description: 'Generate random IP address'
	},
	'chance.guid': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random GUID'
	},
	'chance.hash': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random hash'
	},
	'chance.integer': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random integer with options'
	},
	'chance.floating': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random float'
	},
	'chance.bool': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random boolean'
	},
	'chance.character': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random character'
	},
	'chance.string': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate random string'
	},
	'chance.pick': {
		minArgs: 1,
		maxArgs: 2,
		description: 'Pick random element from array'
	},
	'chance.pickone': {
		minArgs: 1,
		maxArgs: 1,
		description: 'Pick one random element from array'
	},
	'chance.pickset': {
		minArgs: 2,
		maxArgs: 2,
		description: 'Pick set of random elements from array'
	},
	'chance.cc': {
		minArgs: 0,
		maxArgs: 1,
		description: 'Generate credit card number'
	},
	'chance.android_id': {
		minArgs: 0,
		maxArgs: 0,
		description: 'Generate Android device ID'
	},

	// Commonly used utility functions from dungeons
	pickAWinner: {
		minArgs: 1,
		maxArgs: 2,
		description: 'Pick from array with power-law weighting (most common values first)'
	},
	weighChoices: {
		minArgs: 1,
		maxArgs: 1,
		description: 'Weight choices by frequency in array (more duplicates = higher weight)'
	},
	decimal: {
		minArgs: 0,
		maxArgs: 3,
		description: 'Generate random decimal (min, max, fixed decimal places)'
	},

	// Special function for arrow functions
	arrow: {
		minArgs: 1,
		maxArgs: 1,
		description: 'Raw arrow function with body',
		special: true
	}
};

/**
 * Validate a function call structure
 * @param {Object} funcCall - The function call object with functionName and args
 * @returns {boolean} - Whether the function call is valid
 */
export function validateFunctionCall(funcCall) {
	if (!funcCall || typeof funcCall !== 'object') {
		return false;
	}

	const { functionName, args, body } = funcCall;

	if (!functionName || typeof functionName !== 'string') {
		return false;
	}

	// Special handling for arrow functions
	if (functionName === 'arrow') {
		return typeof body === 'string' && body.length > 0;
	}

	const funcDef = FUNCTION_REGISTRY[functionName];
	if (!funcDef) {
		logger.warn({ functionName }, `Unknown function: ${functionName}`);
		return false;
	}

	// Check args
	if (!Array.isArray(args)) {
		if (funcDef.minArgs === 0 && !args) {
			return true; // No args required and none provided
		}
		return false;
	}

	if (args.length < funcDef.minArgs || args.length > funcDef.maxArgs) {
		logger.warn({ functionName, expected: `${funcDef.minArgs}-${funcDef.maxArgs}`, actual: args.length }, `Function ${functionName} expects ${funcDef.minArgs}-${funcDef.maxArgs} args, got ${args.length}`);
		return false;
	}

	return true;
}

/**
 * Get list of all valid function names
 * @returns {string[]} Array of function names
 */
export function getValidFunctionNames() {
	return Object.keys(FUNCTION_REGISTRY);
}
