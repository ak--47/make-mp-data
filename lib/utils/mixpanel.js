/**
 * Server-side Mixpanel wrapper for AI observability
 *
 * Provides a clean interface for tracking AI job events and usage metrics.
 * Non-blocking - tracking failures are logged but don't affect application flow.
 */

import Mixpanel from 'mixpanel';
import { serverLogger as logger } from './logger.js';

const MIXPANEL_TOKEN = '7608bedf7495b09ac092209387facb52';
const { NODE_ENV = 'unknown' } = process.env;

// Initialize Mixpanel
let mixpanel = null;
try {
	mixpanel = Mixpanel.init(MIXPANEL_TOKEN);
	logger.debug('Mixpanel initialized for server-side tracking');
} catch (error) {
	logger.error({ err: error }, 'Failed to initialize Mixpanel');
}

/**
 * Track an event to Mixpanel (server-side)
 * @param {string} eventName - Event name
 * @param {object} properties - Event properties
 * @param {string} [userId] - Optional user ID for distinct_id
 */
export function track(eventName, properties = {}, userId = null) {
	if (!mixpanel) {
		logger.warn({ eventName }, 'Mixpanel not initialized, skipping track');
		return;
	}

	try {
		const trackProps = {
			...properties,
			distinct_id: userId || 'anonymous',
			source: 'dm4-server',
			$insert_id: `${eventName}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
		};

		mixpanel.track(eventName, trackProps);
	} catch (error) {
		// Non-blocking - log but don't throw
		logger.error({ err: error, eventName }, 'Failed to track Mixpanel event');
	}
}

/**
 * Track an AI job completion event with structured metadata
 * @param {object} params - AI job parameters
 * @param {string} params.component - AI component (schema, hooks, refine, funnels, generic)
 * @param {string} params.prompt - The prompt sent to the AI
 * @param {object|string} params.response - The AI response
 * @param {number} params.duration_ms - Duration in milliseconds
 * @param {boolean} params.success - Whether the job succeeded
 * @param {string} [params.error] - Error message if failed
 * @param {object} [params.usage] - Token usage from ai.getLastUsage()
 * @param {string} [params.user_id] - User ID for distinct_id
 */
export function trackAIJob(params) {
	const {
		component,
		prompt,
		response,
		duration_ms,
		success,
		error = null,
		usage = null,
		user_id = null
	} = params;

	const responseStr = typeof response === 'string' ? response : JSON.stringify(response);

	const eventProps = {
		component: `ai-${component}`,
		prompt_preview: prompt?.substring(0, 200) || '',
		prompt_length: prompt?.length || 0,
		output_length: responseStr?.length || 0,
		duration_ms,
		duration_human: `${(duration_ms / 1000).toFixed(2)} seconds`,
		runtime: process.env.RUNTIME_CONTEXT || 'dm4',
		environment: NODE_ENV,
		success,
		error,
		// Token usage (all fields from getLastUsage)
		...(usage && {
			promptTokens: usage.promptTokens,
			responseTokens: usage.responseTokens,
			totalTokens: usage.totalTokens,
			attempts: usage.attempts,
			modelVersion: usage.modelVersion,
			requestedModel: usage.requestedModel,
		}),
	};

	track('AI Job', eventProps, user_id);
}

export default { track, trackAIJob };
