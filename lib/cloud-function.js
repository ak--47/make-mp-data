/**
 * Cloud Function Entry Point
 * Provides a clean interface for Google Cloud Functions deployment
 */

/** @typedef {import('../types').Dungeon} Config */

import functions from '@google-cloud/functions-framework';
import { handleCloudFunctionEntry } from './orchestrators/worker-manager.js';
import main from '../index.js';

/**
 * Cloud Function HTTP entry point
 * Handles distributed data generation across multiple workers
 */
functions.http('entry', async (req, res) => {
    await handleCloudFunctionEntry(req, res, main);
});

export { handleCloudFunctionEntry, main };