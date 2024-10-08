#!/bin/bash

# Ensure the ./path directory exists
mkdir -p ./dungeons

# Generate a random file name with .js extension
random_file_name=$(mktemp ./dungeons/my-file-XXXXXXXX.js)

# Initial text to write to the file
initial_text='
const SEED = "my-seed";
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
require("dotenv").config();
const u = require("../components/utils");
const v = require("ak-tools");
const chance = u.initChance(SEED);
const num_users = 25_000
const days = 100

/** @typedef  {import("../types.d.ts").Dungeon} Config */

/** @type {Config} */
const config = {
    token: "",
    seed: SEED,
    numDays: days, 
    numEvents: num_users * 100, 
    numUsers: num_users, 
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
	
	funnels: [],
    events: [],
    superProps: {},
    userProps: {},
    scdProps: {},
    mirrorProps: {},
    groupKeys: [],
    groupProps: {},
    lookupTables: [],
	hook: function (record, type, meta) {
		const NOW = dayjs();

		if (type === "event") {
			const EVENT_TIME = dayjs(record.time);
		}

		if (type === "user") {

		}

		if (type === "funnel-post") {
			
		}

		if (type === "funnel-pre") {

		}

		if (type === "scd") {

		}

		if (type === "everything") {
		
		}

		return record;
	}
};

module.exports = config;'

# Write the initial text to the new file
echo "$initial_text" > "$random_file_name"

# Output the name of the created file
echo "File created: $random_file_name"
