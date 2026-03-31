/**
 * Mixpanel Sender Orchestrator module
 * Handles sending all data types to Mixpanel
 */

/** @typedef {import('../../types').Context} Context */

import dayjs from "dayjs";
import path from "path";
import { comma, ls, rm } from "ak-tools";
import * as u from "../utils/utils.js";
import mp from "mixpanel-import";

/**
 * Sends the data to Mixpanel
 * @param {Context} context - Context object containing config, storage, etc.
 * @returns {Promise<Object>} Import results for all data types
 */
export async function sendToMixpanel(context) {
	const { config, storage } = context;
	const {
		adSpendData,
		eventData,
		groupProfilesData,
		lookupTableData,
		mirrorEventData,
		scdTableData,
		userProfilesData,
		groupEventData
	} = storage;

	const {
		token,
		region,
		writeToDisk = true,
		format,
		serviceAccount,
		projectId,
		serviceSecret
	} = config;

	const importResults = { events: {}, users: {}, groups: [] };
	const isBATCH_MODE = context.isBatchMode();
	const NODE_ENV = process.env.NODE_ENV || "unknown";

	/** @type {import('mixpanel-import').Creds} */
	const creds = { token };
	const mpImportFormat = format === "json" ? "jsonl" : "csv";

	const isDev = NODE_ENV !== 'production';

	/** @type {import('mixpanel-import').Options} */
	const commonOpts = {
		region,
		fixData: true,
		verbose: isDev,
		forceStream: true,
		strict: true,
		epochEnd: dayjs().unix(),
		dryRun: false,
		abridged: false,
		fixJson: false,
		showProgress: isDev,
		streamFormat: mpImportFormat,
		workers: 35
	};

	// Import events
	if (eventData?.length > 0 || isBATCH_MODE) {
		log(`importing events to mixpanel...\n`);
		let eventDataToImport = u.deepClone(eventData);
		// Check if we need to read from disk files instead of memory
		const shouldReadFromFiles = isBATCH_MODE || (writeToDisk && eventData && eventData.length === 0);
		if (shouldReadFromFiles && eventData?.getWriteDir) {
			const writeDir = eventData.getWriteDir();
			const files = await ls(writeDir);
			// @ts-ignore
			eventDataToImport = files.filter(f => f.includes('-EVENTS'));
		}
		const imported = await mp(creds, eventDataToImport, {
			recordType: "event",
			...commonOpts,
		});
		log(`\tsent ${comma(imported.success)} events\n`);
		importResults.events = imported;
	}

	// Import user profiles
	if (userProfilesData?.length > 0 || isBATCH_MODE) {
		log(`importing user profiles to mixpanel...\n`);
		let userProfilesToImport = u.deepClone(userProfilesData);
		// Check if we need to read from disk files instead of memory
		const shouldReadFromFiles = isBATCH_MODE || (writeToDisk && userProfilesData && userProfilesData.length === 0);
		if (shouldReadFromFiles && userProfilesData?.getWriteDir) {
			const writeDir = userProfilesData.getWriteDir();
			const files = await ls(writeDir);
			// @ts-ignore
			userProfilesToImport = files.filter(f => f.includes('-USERS'));
		}
		const imported = await mp(creds, userProfilesToImport, {
			recordType: "user",
			...commonOpts,
		});
		log(`\tsent ${comma(imported.success)} user profiles\n`);
		importResults.users = imported;
	}

	// Import ad spend data
	if (adSpendData?.length > 0 || isBATCH_MODE) {
		log(`importing ad spend data to mixpanel...\n`);
		let adSpendDataToImport = u.deepClone(adSpendData);
		// Check if we need to read from disk files instead of memory
		const shouldReadFromFiles = isBATCH_MODE || (writeToDisk && adSpendData && adSpendData.length === 0);
		if (shouldReadFromFiles && adSpendData?.getWriteDir) {
			const writeDir = adSpendData.getWriteDir();
			const files = await ls(writeDir);
			// @ts-ignore
			adSpendDataToImport = files.filter(f => f.includes('-ADSPEND'));
		}
		const imported = await mp(creds, adSpendDataToImport, {
			recordType: "event",
			...commonOpts,
		});
		log(`\tsent ${comma(imported.success)} ad spend events\n`);
		importResults.adSpend = imported;
	}

	// Import group profiles
	if (groupProfilesData && Array.isArray(groupProfilesData) && groupProfilesData.length > 0) {
		for (const groupEntity of groupProfilesData) {
			if (!groupEntity || groupEntity.length === 0) continue;
			const groupKey = groupEntity?.groupKey;
			log(`importing ${groupKey} profiles to mixpanel...\n`);
			let groupProfilesToImport = u.deepClone(groupEntity);
			// Check if we need to read from disk files instead of memory
			const shouldReadFromFiles = isBATCH_MODE || (writeToDisk && groupEntity.length === 0);
			if (shouldReadFromFiles && groupEntity?.getWriteDir) {
				const writeDir = groupEntity.getWriteDir();
				const files = await ls(writeDir);
				// @ts-ignore
				groupProfilesToImport = files.filter(f => f.includes(`-${groupKey}-GROUPS`));
			}
			const imported = await mp({ token, groupKey }, groupProfilesToImport, {
				recordType: "group",
				...commonOpts,
				groupKey,
			});
			log(`\tsent ${comma(imported.success)} ${groupKey} profiles\n`);
			importResults.groups.push(imported);
		}
	}

	// Import group events
	if (groupEventData?.length > 0) {
		log(`importing group events to mixpanel...\n`);
		let groupEventDataToImport = u.deepClone(groupEventData);
		// Check if we need to read from disk files instead of memory
		const shouldReadFromFiles = isBATCH_MODE || (writeToDisk && groupEventData.length === 0);
		if (shouldReadFromFiles && groupEventData?.getWriteDir) {
			const writeDir = groupEventData.getWriteDir();
			const files = await ls(writeDir);
			// @ts-ignore
			groupEventDataToImport = files.filter(f => f.includes('-GROUP-EVENTS'));
		}
		const imported = await mp(creds, groupEventDataToImport, {
			recordType: "event",
			...commonOpts,
			strict: false
		});
		log(`\tsent ${comma(imported.success)} group events\n`);
		importResults.groupEvents = imported;
	}

	// Import SCD data (requires service account)
	if (serviceAccount && projectId && serviceSecret) {
		if (scdTableData && Array.isArray(scdTableData) && scdTableData.length > 0) {
			log(`importing SCD data to mixpanel...\n`);
			for (const scdEntity of scdTableData) {
				const scdKey = scdEntity?.scdKey;
				const entityType = scdEntity?.entityType || 'user';
				log(`importing ${scdKey} SCD data to mixpanel...\n`);
				let scdDataToImport = u.deepClone(scdEntity);
				// Check if we need to read from disk files instead of memory
				const shouldReadFromFiles = isBATCH_MODE || (writeToDisk && scdEntity && scdEntity.length === 0);
				if (shouldReadFromFiles && scdEntity?.getWriteDir) {
					const writeDir = scdEntity.getWriteDir();
					const files = await ls(writeDir);
					// @ts-ignore
					scdDataToImport = files.filter(f => f.includes(`-${scdKey}-SCD`))?.pop();

				}

				// Derive the data type from the actual SCD data
				// todo: we can do better type inference here we don't need to visit the file
				/** @type {"string" | "number" | "boolean"} */
			let scdType = 'string'; // default to string
				const scdExamplesValues = context.config.scdProps[Object.keys(context.config.scdProps).find(k => k === scdKey)].values;
				if (scdExamplesValues) {
					if (typeof scdExamplesValues[0] === 'number') {
						scdType = 'number';
					} else if (typeof scdExamplesValues[0] === 'boolean') {
						scdType = 'boolean';
					}
				}



				/** @type {import('mixpanel-import').Options} */
				const options = {
					recordType: "scd",
					scdKey,
					scdType,
					scdLabel: `${scdKey}`,
					fixData: true,
					...commonOpts,
				};

				// For group SCDs, add the groupKey
				if (entityType !== "user") {
					options.groupKey = entityType;
				}

				// SCD data is sketch and it shouldn't fail the whole import
				try {
					const imported = await mp(
						{
							token,
							acct: serviceAccount,
							pass: serviceSecret,
							project: projectId
						},
						scdDataToImport,
						options
					);
					log(`\tsent ${comma(imported.success)} ${scdKey} SCD data\n`);
					importResults[`${scdKey}_scd`] = imported;
				} catch (err) {
					log(`\tfailed to import ${scdKey} SCD data: ${err.message}\n`);
					importResults[`${scdKey}_scd`] = { success: 0, failed: 0, error: err.message };
				}
			}
		}
	}

	// Clean up batch files if needed
	if (!writeToDisk && isBATCH_MODE) {
		const writeDir = eventData?.getWriteDir?.() || userProfilesData?.getWriteDir?.();
		if (writeDir) {
			const listDir = await ls(writeDir);
			// @ts-ignore
			const files = listDir.filter(f =>
				f.includes('-EVENTS') ||
				f.includes('-USERS') ||
				f.includes('-ADSPEND') ||
				f.includes('-GROUPS') ||
				f.includes('-GROUP-EVENTS')
			);
			for (const file of files) {
				await rm(file);
			}
		}
	}

	return importResults;
}

/**
 * Simple logging function
 * @param {string} message - Message to log
 */
function log(message) {
	console.log(message);
}