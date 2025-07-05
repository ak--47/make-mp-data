/**
 * User Loop Orchestrator module
 * Manages user generation and event creation workflow
 */

import dayjs from "dayjs";
import pLimit from 'p-limit';
import * as u from "../utils/utils.js";
import * as t from 'ak-tools';
import { makeEvent } from "../generators/events.js";
import { makeFunnel } from "../generators/funnels.js";
import { makeUserProfile } from "../generators/profiles.js";
import { makeSCD } from "../generators/scd.js";

/**
 * Main user generation loop that creates users, their profiles, events, and SCDs
 * @param {Object} context - Context object containing config, defaults, storage, etc.
 * @param {number} [concurrency=1] - Concurrency limit for user processing
 * @returns {Promise<void>}
 */
export async function userLoop(context, concurrency = 1) {
    const { config, storage, defaults } = context;
    const chance = u.getChance();
    const USER_CONN = pLimit(concurrency);
    
    const {
        verbose,
        numUsers,
        numEvents,
        isAnonymous,
        hasAvatar,
        hasAnonIds,
        hasSessionIds,
        hasLocation,
        funnels,
        userProps,
        scdProps,
        numDays,
        percentUsersBornInDataset = 5,
    } = config;
    
    const { eventData, userProfilesData, scdTableData } = storage;
    const avgEvPerUser = numEvents / numUsers;
    const startTime = Date.now();

    for (let i = 0; i < numUsers; i++) {
        await USER_CONN(async () => {
            context.incrementUserCount();
            const eps = Math.floor(context.getEventCount() / ((Date.now() - startTime) / 1000));
            
            if (verbose) {
                u.progress([
                    ["users", context.getUserCount()], 
                    ["events", context.getEventCount()], 
                    ["eps", eps]
                ]);
            }
            
            const userId = chance.guid();
            const user = u.generateUser(userId, { numDays, isAnonymous, hasAvatar, hasAnonIds, hasSessionIds });
            const { distinct_id, created } = user;
            const userIsBornInDataset = chance.bool({ likelihood: percentUsersBornInDataset });
            let numEventsPreformed = 0;
            
            if (!userIsBornInDataset) delete user.created;
            
            // Calculate time adjustments
            const daysShift = context.getDaysShift();
            const adjustedCreated = userIsBornInDataset 
                ? dayjs(created).subtract(daysShift, 'd') 
                : dayjs.unix(global.FIXED_BEGIN);

            if (hasLocation) {
                const location = u.shuffleArray(u.choose(defaults.locationsUsers)).pop();
                for (const key in location) {
                    user[key] = location[key];
                }
            }

            // Profile creation
            const profile = await makeUserProfile(context, userProps, user);

            // SCD creation
            const scdUserTables = t.objFilter(scdProps, (scd) => scd.type === 'user' || !scd.type);
            const scdTableKeys = Object.keys(scdUserTables);

            const userSCD = {};
            for (const [index, key] of scdTableKeys.entries()) {
                const { max = 100 } = scdProps[key];
                const mutations = chance.integer({ min: 1, max });
                const changes = await makeSCD(context, scdProps[key], key, distinct_id, mutations, created);
                userSCD[key] = changes;
                
                await config.hook(changes, "scd-pre", { 
                    profile, 
                    type: 'user', 
                    scd: { [key]: scdProps[key] }, 
                    config, 
                    allSCDs: userSCD 
                });
            }

            let numEventsThisUserWillPreform = Math.floor(chance.normal({
                mean: avgEvPerUser,
                dev: avgEvPerUser / u.integer(u.integer(2, 5), u.integer(2, 7))
            }) * 0.714159265359);

            // Power users and low-activity users logic
            chance.bool({ likelihood: 20 }) ? numEventsThisUserWillPreform *= 5 : null;
            chance.bool({ likelihood: 15 }) ? numEventsThisUserWillPreform *= 0.333 : null;
            numEventsThisUserWillPreform = Math.round(numEventsThisUserWillPreform);

            let userFirstEventTime;

            const firstFunnels = funnels.filter((f) => f.isFirstFunnel).reduce(u.weighFunnels, []);
            const usageFunnels = funnels.filter((f) => !f.isFirstFunnel).reduce(u.weighFunnels, []);

            const secondsInDay = 86400;
            const noise = () => chance.integer({ min: 0, max: secondsInDay });
            let usersEvents = [];

            if (firstFunnels.length && userIsBornInDataset) {
                const firstFunnel = chance.pickone(firstFunnels, user);
                const firstTime = adjustedCreated.subtract(noise(), 'seconds').unix();
                const [data, userConverted] = await makeFunnel(context, firstFunnel, user, firstTime, profile, userSCD);
                
                const timeShift = context.getTimeShift();
                userFirstEventTime = dayjs(data[0].time).subtract(timeShift, 'seconds').unix();
                numEventsPreformed += data.length;
                usersEvents.push(...data);
                
                if (!userConverted) {
                    if (verbose) {
                        u.progress([["users", context.getUserCount()], ["events", context.getEventCount()]]);
                    }
                    return;
                }
            } else {
                userFirstEventTime = adjustedCreated.subtract(noise(), 'seconds').unix();
            }

            while (numEventsPreformed < numEventsThisUserWillPreform) {
                if (usageFunnels.length) {
                    const currentFunnel = chance.pickone(usageFunnels);
                    const [data, userConverted] = await makeFunnel(context, currentFunnel, user, userFirstEventTime, profile, userSCD);
                    numEventsPreformed += data.length;
                    usersEvents.push(...data);
                } else {
                    const data = await makeEvent(context, distinct_id, userFirstEventTime, u.pick(config.events), user.anonymousIds, user.sessionIds, {}, config.groupKeys, true);
                    numEventsPreformed++;
                    usersEvents.push(data);
                }
            }

            // Hook for processing all user events
            if (config.hook) {
                const newEvents = await config.hook(usersEvents, "everything", { 
                    profile, 
                    scd: userSCD, 
                    config, 
                    userIsBornInDataset 
                });
                if (Array.isArray(newEvents)) usersEvents = newEvents;
            }

            // Store all user data
            await userProfilesData.hookPush(profile);

            if (Object.keys(userSCD).length) {
                for (const [key, changesArray] of Object.entries(userSCD)) {
                    for (const changes of changesArray) {
                        try {
                            const target = scdTableData.filter(arr => arr.scdKey === key).pop();
                            await target.hookPush(changes, { profile, type: 'user' });
                        }
                        catch (e) {
                            // This is probably a test
                            const target = scdTableData[0];
                            await target.hookPush(changes, { profile, type: 'user' });
                        }
                    }
                }
            }
            
            await eventData.hookPush(usersEvents, { profile });

            if (verbose) {
                u.progress([["users", context.getUserCount()], ["events", context.getEventCount()]]);
            }
        });
    }
}