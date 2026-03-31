/**
 * Structured logger using Pino
 *
 * Pretty-printed in development, JSON in production for Cloud Run
 */

import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';
const isTest = process.env.NODE_ENV === 'test';

// Create the logger with appropriate transport
// In production, use 'message' instead of 'msg' for GCP Cloud Logging compatibility
const logger = pino({
    level: process.env.LOG_LEVEL || (isTest ? 'silent' : isDev ? 'warn' : 'info'),
    // Use 'message' instead of 'msg' for GCP Cloud Logging
    messageKey: isDev ? 'msg' : 'message',
    transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss.l',
                ignore: 'pid,hostname',
                messageFormat: '{msg}',
                errorLikeObjectKeys: ['err', 'error']
            }
        }
        : undefined // JSON output in production for Cloud Run
});

// Add child loggers for different components
export const serverLogger = logger.child({ component: 'server' });
export const aiLogger = logger.child({ component: 'ai' });
export const dataLogger = logger.child({ component: 'data' });
export const importLogger = logger.child({ component: 'import' });

export default logger;
