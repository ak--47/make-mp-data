/**
 * Ad Spend generator module
 * Creates realistic advertising spend events with UTM parameters and metrics
 */

import dayjs from "dayjs";
import { md5 } from "ak-tools";
import * as u from "../utils/utils.js";

/**
 * Creates ad spend events for a given day and campaign configurations
 * @param {Object} context - Context object containing config, defaults, etc.
 * @param {string} day - ISO date string for the ad spend day
 * @param {Array} campaigns - Array of campaign configurations (optional, uses context.campaigns if not provided)
 * @returns {Promise<Array>} Array of ad spend event objects
 */
export async function makeAdSpend(context, day, campaigns = null) {
    // Update operation counter
    context.incrementOperations();
    
    // Use campaigns from context if not provided
    const campaignConfigs = campaigns || context.campaigns;
    
    if (!campaignConfigs || campaignConfigs.length === 0) {
        return [];
    }
    
    const chance = u.getChance();
    const adSpendEvents = [];
    
    for (const network of campaignConfigs) {
        const networkCampaigns = network.utm_campaign;
        
        for (const campaign of networkCampaigns) {
            // Skip organic campaigns
            if (campaign === "$organic") continue;

            // Generate realistic ad spend metrics
            const adSpendEvent = createAdSpendEvent(network, campaign, day, chance);
            adSpendEvents.push(adSpendEvent);
        }
    }

    return adSpendEvents;
}

/**
 * Creates a single ad spend event with realistic metrics
 * @param {Object} network - Network configuration object
 * @param {string} campaign - Campaign name
 * @param {string} day - ISO date string
 * @param {Object} chance - Chance.js instance
 * @returns {Object} Ad spend event object
 */
function createAdSpendEvent(network, campaign, day, chance) {
    // Generate realistic cost
    const cost = chance.floating({ min: 10, max: 250, fixed: 2 });

    // Generate realistic CPC and CTR
    const avgCPC = chance.floating({ min: 0.33, max: 2.00, fixed: 4 });
    const avgCTR = chance.floating({ min: 0.05, max: 0.25, fixed: 4 });

    // Calculate derived metrics
    const clicks = Math.floor(cost / avgCPC);
    const impressions = Math.floor(clicks / avgCTR);
    const views = Math.floor(impressions * avgCTR);

    // Generate UTM parameters
    const utm_medium = u.choose(u.pickAWinner(network.utm_medium)());
    const utm_content = u.choose(u.pickAWinner(network.utm_content)());
    const utm_term = u.choose(u.pickAWinner(network.utm_term)());

    // Create unique identifiers
    const id = network.utm_source[0] + '-' + campaign;
    const uid = md5(id);

    return {
        event: "$ad_spend",
        time: day,
        source: 'dm4',
        utm_campaign: campaign,
        campaign_id: id,
        insert_id: uid,
        network: network.utm_source[0].toUpperCase(),
        distinct_id: network.utm_source[0].toUpperCase(),
        utm_source: network.utm_source[0],
        utm_medium,
        utm_content,
        utm_term,
        clicks,
        views,
        impressions,
        cost,
        date: dayjs(day).format("YYYY-MM-DD"),
    };
}

/**
 * Validates campaign configuration
 * @param {Array} campaigns - Campaign configurations to validate
 * @returns {boolean} True if valid, throws error if invalid
 */
export function validateCampaigns(campaigns) {
    if (!Array.isArray(campaigns)) {
        throw new Error("Campaigns must be an array");
    }
    
    for (const network of campaigns) {
        if (!network.utm_source || !Array.isArray(network.utm_source)) {
            throw new Error("Each campaign network must have utm_source array");
        }
        
        if (!network.utm_campaign || !Array.isArray(network.utm_campaign)) {
            throw new Error("Each campaign network must have utm_campaign array");
        }
        
        if (!network.utm_medium || !Array.isArray(network.utm_medium)) {
            throw new Error("Each campaign network must have utm_medium array");
        }
        
        if (!network.utm_content || !Array.isArray(network.utm_content)) {
            throw new Error("Each campaign network must have utm_content array");
        }
        
        if (!network.utm_term || !Array.isArray(network.utm_term)) {
            throw new Error("Each campaign network must have utm_term array");
        }
    }
    
    return true;
}