/**
 * Cloud Worker Manager module
 * Handles distributed processing across multiple cloud function workers
 */

import pLimit from 'p-limit';
import { GoogleAuth } from 'google-auth-library';
import { timer, uid, sLog } from 'ak-tools';

const CONCURRENCY = 1_000;
let RUNTIME_URL = "https://dm4-lmozz6xkha-uc.a.run.app";

/**
 * Spawn multiple cloud function workers to process data generation in parallel
 * @param {number} numberWorkers - Number of worker instances to spawn
 * @param {string} payload - Script payload to execute on each worker
 * @param {Object} params - Parameters for the job execution
 * @returns {Promise<Object>} Results summary with success/failure counts
 */
export async function spawnFileWorkers(numberWorkers, payload, params) {
    const auth = new GoogleAuth();
    let client;
    
    if (RUNTIME_URL.includes('localhost')) {
        client = await auth.getClient();
    } else {
        client = await auth.getIdTokenClient(RUNTIME_URL);
    }
    
    const limit = pLimit(CONCURRENCY);
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const requestPromises = Array.from({ length: numberWorkers }, async (_, index) => {
        index = index + 1;
        await delay(index * 108); // Stagger requests to avoid thundering herd
        return limit(() => buildRequest(client, payload, index, params, numberWorkers));
    });
    
    const complete = await Promise.allSettled(requestPromises);
    const results = {
        jobs_success: complete.filter((p) => p.status === "fulfilled").length,
        jobs_fail: complete.filter((p) => p.status === "rejected").length
    };

    return results;
}

/**
 * Build and execute a single worker request
 * @param {Object} client - Authenticated Google Cloud client
 * @param {string} payload - Script payload to send
 * @param {number} index - Worker index number
 * @param {Object} params - Job parameters
 * @param {number} total - Total number of workers
 * @returns {Promise<Object>} Worker response data
 */
async function buildRequest(client, payload, index, params, total) {
    let retryAttempt = 0;
    sLog(`DM4: summoning worker #${index} of ${total}`, params);
    
    try {
        const req = await client.request({
            url: RUNTIME_URL + `?replicate=1&is_replica=true&runId=${params.runId || "no run id"}`,
            method: "POST",
            data: payload,
            headers: {
                "Content-Type": "text/plain",
            },
            timeout: 3600 * 1000 * 10, // 10 hours timeout
            retryConfig: {
                retry: 3,
                onRetryAttempt: (error) => {
                    const statusCode = error?.response?.status?.toString() || "";
                    retryAttempt++;
                    sLog(`DM4: summon worker ${index} retry #${retryAttempt}`, { 
                        statusCode, 
                        message: error.message, 
                        stack: error.stack, 
                        ...params 
                    }, "DEBUG");
                },
                retryDelay: 1000,
                shouldRetry: (error) => {
                    if (error.code === 'ECONNRESET') return true;
                    const statusCode = error?.response?.status;
                    if (statusCode >= 500) return true;
                    if (statusCode === 429) return true;
                    return false;
                }
            },
        });
        
        sLog(`DM4: worker #${index} responded`, params);
        const { data } = req;
        return data;
    } catch (error) {
        sLog(`DM4: worker #${index} failed to respond`, { 
            message: error.message, 
            stack: error.stack, 
            code: error.code, 
            retries: retryAttempt, 
            ...params 
        }, "ERROR");
        return {};
    }
}

/**
 * Handle cloud function HTTP entry point
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @param {Function} mainFunction - Main data generation function to execute
 * @returns {Promise<void>}
 */
export async function handleCloudFunctionEntry(req, res, mainFunction) {
    const reqTimer = timer('request');
    reqTimer.start();
    let response = {};
    let script = req.body || "";
    const params = { 
        replicate: 1, 
        is_replica: "false", 
        runId: "", 
        seed: "", 
        ...req.query 
    };
    
    const replicate = Number(params.replicate);
    
    // Parse boolean parameters
    if (params?.is_replica === "true") params.is_replica = true;
    else params.is_replica = false;
    
    const isReplica = params.is_replica;
    
    if (!params.runId) params.runId = uid(42);
    
    try {
        if (!script) throw new Error("no script");

        /** @type {Config} */
        const config = eval(script);
        
        if (isReplica) {
            // Generate unique seed for replica workers
            const newSeed = (Math.random() / Math.random() / Math.random() / Math.random() / Math.random() / Math.random()).toString();
            config.seed = newSeed;
            params.seed = newSeed;
        }

        /** @type {Config} */
        const optionsYouCantChange = {
            verbose: false
        };

        if (replicate <= 1 || isReplica) {
            if (isReplica) sLog("DM4: worker start", params);
            
            const { files = [], operations = 0, eventCount = 0, userCount = 0 } = await mainFunction({
                ...config,
                ...optionsYouCantChange,
            });
            
            reqTimer.stop(false);
            response = { files, operations, eventCount, userCount };
        } else {
            sLog(`DM4: job start (${replicate} workers)`, params);
            const results = await spawnFileWorkers(replicate, script, params);
            response = results;
        }
    } catch (e) {
        sLog("DM4: error", { error: e.message, stack: e.stack }, "ERROR");
        response = { error: e.message };
        res.status(500);
    } finally {
        reqTimer.stop(false);
        const { start, end, delta, human } = reqTimer.report(false);
        
        if (!isReplica) {
            sLog(`DM4: job end (${human})`, { human, delta, ...params, ...response });
        }
        
        if (isReplica) {
            const eps = Math.floor(((response?.eventCount || 0) / delta) * 1000);
            sLog(`DM4: worker end (${human})`, { human, delta, eps, ...params, ...response });
        }
        
        response = { ...response, start, end, delta, human, ...params };
        res.send(response);
        return;
    }
}

/**
 * Set the runtime URL for the cloud function service
 * @param {string} url - The runtime URL
 */
export function setRuntimeUrl(url) {
    RUNTIME_URL = url;
}