/**
 * JSON Evaluator for converting JSON function call format to JavaScript
 * Replaces the old regex-based string parsing approach
 */

import { validateFunctionCall } from './function-registry.js';

/**
 * Evaluate a value that might contain function calls
 * @param {any} value - The value to evaluate (could be object with functionName, array, or primitive)
 * @returns {string} - JavaScript code string
 */
export function evaluateValue(value) {
	// Handle function call objects
	if (typeof value === 'object' && value !== null && 'functionName' in value) {
		return evaluateFunctionCall(value);
	}

	// Handle arrays (return as-is)
	if (Array.isArray(value)) {
		return JSON.stringify(value);
	}

	// Handle nested objects (recursively evaluate)
	if (typeof value === 'object' && value !== null) {
		const entries = Object.entries(value).map(([key, val]) => {
			const evaluatedVal = evaluateValue(val);
			// Use quotes for keys that need them
			const quotedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
			return `${quotedKey}: ${evaluatedVal}`;
		});
		return `{${entries.join(', ')}}`;
	}

	// Handle primitives
	return JSON.stringify(value);
}

/**
 * Evaluate a function call object to JavaScript code
 * @param {Object} funcCall - Object with functionName and args/body
 * @returns {string} - JavaScript function call string
 */
export function evaluateFunctionCall(funcCall) {
	if (!validateFunctionCall(funcCall)) {
		throw new Error(`Invalid function call: ${JSON.stringify(funcCall)}`);
	}

	const { functionName, args, body } = funcCall;

	// Special handling for arrow functions
	if (functionName === 'arrow') {
		return `() => ${body}`;
	}

	// Handle chance.* functions
	if (functionName.startsWith('chance.')) {
		const method = functionName.split('.')[1];
		if (!args || args.length === 0) {
			return `chance.${method}.bind(chance)`;
		} else if (args.length === 1 && typeof args[0] === 'object') {
			// For methods that take an options object
			return `() => chance.${method}(${JSON.stringify(args[0])})`;
		} else {
			// For methods with regular arguments
			const argsStr = args.map(arg => evaluateValue(arg)).join(', ');
			return `() => chance.${method}(${argsStr})`;
		}
	}

	// Handle regular functions
	if (!args || args.length === 0) {
		return `${functionName}()`;
	}

	// Evaluate each argument
	const evaluatedArgs = args.map(arg => {
		// If arg is an object with functionName, evaluate it as a function call
		if (typeof arg === 'object' && arg !== null && 'functionName' in arg) {
			return evaluateFunctionCall(arg);
		}
		// For primitive values (strings, numbers, booleans), use JSON.stringify
		// but strings need special handling to avoid double-escaping
		if (typeof arg === 'string') {
			return `"${arg}"`;
		}
		// For other primitives and arrays, use JSON.stringify
		return JSON.stringify(arg);
	});

	return `${functionName}(${evaluatedArgs.join(', ')})`;
}

/**
 * Convert a complete dungeon config from JSON to JavaScript
 * @param {Object} config - The dungeon configuration object
 * @returns {Object} - Configuration with function strings
 */
export function convertDungeonConfig(config) {
	const converted = {};

	for (const [key, value] of Object.entries(config)) {
		// Skip certain keys that shouldn't be processed
		if (key === 'seed' || key === 'name' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
			converted[key] = value;
			continue;
		}

		// Special handling for groupKeys - preserve as array of arrays
		if (key === 'groupKeys' && Array.isArray(value)) {
			converted[key] = value;
			continue;
		}

		// Process arrays of objects (like events)
		if (Array.isArray(value)) {
			converted[key] = value.map(item => {
				if (typeof item === 'object' && item !== null) {
					return processConfigObject(item);
				}
				return item;
			});
		}
		// Process objects
		else if (typeof value === 'object' && value !== null) {
			converted[key] = processConfigObject(value);
		}
		else {
			converted[key] = value;
		}
	}

	return converted;
}

/**
 * Process a configuration object, converting function calls
 * @param {Object} obj - Object to process
 * @returns {Object} - Processed object
 */
function processConfigObject(obj) {
	const processed = {};

	for (const [key, value] of Object.entries(obj)) {
		// Check if this is a function call
		if (typeof value === 'object' && value !== null && 'functionName' in value) {
			// Store as string for the JS file generation
			processed[key] = evaluateFunctionCall(value);
		}
		// Process nested arrays
		else if (Array.isArray(value)) {
			processed[key] = value.map(item => {
				if (typeof item === 'object' && item !== null && 'functionName' in item) {
					return evaluateFunctionCall(item);
				}
				if (typeof item === 'object' && item !== null) {
					return processConfigObject(item);
				}
				return item;
			});
		}
		// Process nested objects
		else if (typeof value === 'object' && value !== null) {
			processed[key] = processConfigObject(value);
		}
		else {
			processed[key] = value;
		}
	}

	return processed;
}
