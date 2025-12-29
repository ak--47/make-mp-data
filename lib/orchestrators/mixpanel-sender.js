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
        serviceSecret,
        verbose = false
    } = config;

    const importResults = { events: {}, users: {}, groups: [] };
    const isBATCH_MODE = context.isBatchMode();
    const isCLI = context.isCLI();
    const NODE_ENV = process.env.NODE_ENV || "unknown";

    // Create verbose-aware log function
    const log = (message) => {
        if (verbose) console.log(message);
    };

    /** @type {import('mixpanel-import').Creds} */
    const creds = { token };
    const mpImportFormat = format === "json" ? "jsonl" : "csv";
    
    /** @type {import('mixpanel-import').Options} */
    const commonOpts = {
        region,
        fixData: true,
        verbose: false,
        forceStream: true,
        strict: true,
        epochEnd: dayjs().unix(),
        dryRun: false,
        abridged: false,
        fixJson: false,
        showProgress: verbose,
        streamFormat: mpImportFormat,
        workers: 35
    };

    // Import events
    if (eventData || isBATCH_MODE) {
        log(`importing events to mixpanel...\n`);
        let eventDataToImport = u.deepClone(eventData);
        if (isBATCH_MODE) {
            const writeDir = eventData.getWriteDir();
            const files = await ls(writeDir.split(path.basename(writeDir)).join(""));
            // @ts-ignore
            eventDataToImport = files.filter(f => f.includes('-EVENTS-'));
        }
        const imported = await mp(creds, eventDataToImport, {
            recordType: "event",
            ...commonOpts,
        });
        log(`\tsent ${comma(imported.success)} events\n`);
        importResults.events = imported;
    }

    // Import user profiles
    if (userProfilesData || isBATCH_MODE) {
        log(`importing user profiles to mixpanel...\n`);
        let userProfilesToImport = u.deepClone(userProfilesData);
        if (isBATCH_MODE) {
            const writeDir = userProfilesData.getWriteDir();
            const files = await ls(writeDir.split(path.basename(writeDir)).join(""));
            // @ts-ignore
            userProfilesToImport = files.filter(f => f.includes('-USERS-'));
        }
        const imported = await mp(creds, userProfilesToImport, {
            recordType: "user",
            ...commonOpts,
        });
        log(`\tsent ${comma(imported.success)} user profiles\n`);
        importResults.users = imported;
    }

    // Import ad spend data  
    if (adSpendData || isBATCH_MODE) {
        log(`importing ad spend data to mixpanel...\n`);
        let adSpendDataToImport = u.deepClone(adSpendData);
        if (isBATCH_MODE) {
            const writeDir = adSpendData.getWriteDir();
            const files = await ls(writeDir.split(path.basename(writeDir)).join(""));
            // @ts-ignore
            adSpendDataToImport = files.filter(f => f.includes('-AD-SPEND-'));
        }
        const imported = await mp(creds, adSpendDataToImport, {
            recordType: "event",
            ...commonOpts,
        });
        log(`\tsent ${comma(imported.success)} ad spend events\n`);
        importResults.adSpend = imported;
    }

    // Import group profiles
    if (groupProfilesData || isBATCH_MODE) {
        for (const groupEntity of groupProfilesData) {
            const groupKey = groupEntity?.groupKey;
            log(`importing ${groupKey} profiles to mixpanel...\n`);
            let groupProfilesToImport = u.deepClone(groupEntity);
            if (isBATCH_MODE) {
                const writeDir = groupEntity.getWriteDir();
                const files = await ls(writeDir.split(path.basename(writeDir)).join(""));
                // @ts-ignore
                groupProfilesToImport = files.filter(f => f.includes(`-GROUPS-${groupKey}`));
            }
            const imported = await mp({ token, groupKey }, groupProfilesToImport, {
                recordType: "group",
                ...commonOpts,
				groupKey,
				//dryRun: true
            });
            log(`\tsent ${comma(imported.success)} ${groupKey} profiles\n`);
            importResults.groups.push(imported);
        }
    }

    // Import group events
    if (groupEventData || isBATCH_MODE) {
        log(`importing group events to mixpanel...\n`);
        let groupEventDataToImport = u.deepClone(groupEventData);
        if (isBATCH_MODE) {
            const writeDir = groupEventData.getWriteDir();
            const files = await ls(writeDir.split(path.basename(writeDir)).join(""));
            // @ts-ignore
            groupEventDataToImport = files.filter(f => f.includes('-GROUP-EVENTS-'));
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
        if (scdTableData || isBATCH_MODE) {
            log(`importing SCD data to mixpanel...\n`);
            for (const scdEntity of scdTableData) {
                const scdKey = scdEntity?.scdKey;
                log(`importing ${scdKey} SCD data to mixpanel...\n`);
                let scdDataToImport = u.deepClone(scdEntity);
                if (isBATCH_MODE) {
                    const writeDir = scdEntity.getWriteDir();
                    const files = await ls(writeDir.split(path.basename(writeDir)).join(""));
                    // @ts-ignore
                    scdDataToImport = files.filter(f => f.includes(`-SCD-${scdKey}`));
                }

                /** @type {import('mixpanel-import').Options} */
                const options = {
                    recordType: "scd",
                    scdKey,
                    scdType: scdEntity.dataType,
                    scdLabel: `${scdKey}-scd`,
                    ...commonOpts,
                };

                if (scdEntity.entityType !== "user") options.groupKey = scdEntity.entityType;
                
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
            }
        }
    }

    // Clean up batch files if needed
    if (!writeToDisk && isBATCH_MODE) {
        const writeDir = eventData?.getWriteDir() || userProfilesData?.getWriteDir();
        const listDir = await ls(writeDir.split(path.basename(writeDir)).join(""));
        // @ts-ignore
        const files = listDir.filter(f => 
            f.includes('-EVENTS-') || 
            f.includes('-USERS-') || 
            f.includes('-AD-SPEND-') || 
            f.includes('-GROUPS-') || 
            f.includes('-GROUP-EVENTS-')
        );
        for (const file of files) {
            await rm(file);
        }
    }
    
    return importResults;
}

