import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import { weighNumRange, range, date, initChance, exhaust, choose, integer, decimal } from "../../lib/utils/utils.js";

dayjs.extend(utc);

/**
 * Dungeon template for AI-generated configurations
 * This template provides the structure and standard configuration
 * AI-generated content will be injected into the placeholders
 */

export function createDungeonTemplate({
    seed = "ai-generated-seed",
    numUsers = 1000,
    numDays = 100,
    events = [],
    funnels = [],
    superProps = {},
    userProps = {},
    scdProps = {},
    mirrorProps = {},
    groupKeys = [],
    groupProps = {},
    lookupTables = [],
    hookFunction = null
}) {
    const chance = u.initChance(seed);
    const numEvents = numUsers * 100;

    /** @typedef  {import("../../types.d.ts").Dungeon} Config */

    /** @type {Config} */
    const config = {
        token: "",
        seed: seed,
        numDays: numDays, 
        numEvents: numEvents, 
        numUsers: numUsers, 
        hasAnonIds: false, 
        hasSessionIds: false, 
        format: "json",
        alsoInferFunnels: true,
        hasLocation: true,
        hasAndroidDevices: true,
        hasIOSDevices: true,
        hasDesktopDevices: true,
        hasBrowser: true,
        hasCampaigns: true,
        isAnonymous: false,
        hasAdSpend: true,
        
        hasAvatar: true,
        makeChart: false,

        batchSize: 1_500_000,
        concurrency: 1,
        writeToDisk: false,
        
        // AI-generated content will be injected here
        funnels: funnels,
        events: events,
        superProps: superProps,
        userProps: userProps,
        scdProps: scdProps,
        mirrorProps: mirrorProps,
        groupKeys: groupKeys,
        groupProps: groupProps,
        lookupTables: lookupTables,
        
        hook: hookFunction || function (record, type, meta) {
            // const NOW = dayjs();

			// CALLED AFTER EACH EVENT IS CREATED
            if (type === "event") {
                // const EVENT_TIME = dayjs(record.time);
            }

			// CALLED ONCE FOR EACH USER AND DEFINES THEIR PROPS
            if (type === "user") {

            }

			// CALLED AFTER FUNNELS EVENTS ARE CHOSEN
            if (type === "funnel-post") {
                
            }

			// CALLED BEFORE FUNNELS EVENTS ARE CHOSEN
            if (type === "funnel-pre") {

            }

			// CALLED BEFORE SCD EVENTS ARE CHOSEN
            if (type === "scd-pre") {

            }

			// CALLED AT THE END WHEN A USERS ENTIRE HISTORY EXISTS
            if (type === "everything") {
            
            }

            return record;
        }
    };

    return config;
}