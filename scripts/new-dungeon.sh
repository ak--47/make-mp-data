#!/bin/bash

# Ensure the ./path directory exists
mkdir -p ./dungeons

# Generate a random file name with .js extension
random_file_name=$(mktemp ./dungeons/my-file-XXXXXXXX.js)

# Initial text to write to the file
initial_text='
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import "dotenv/config";
import * as u from "../lib/utils/utils.js";
import * as v from "ak-tools";

const SEED = "my-seed";
dayjs.extend(utc);
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

export default config;'

# Write the initial text to the new file
echo "$initial_text" > "$random_file_name"

# Output the name of the created file
echo "File created: $random_file_name"
