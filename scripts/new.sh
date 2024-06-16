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
const u = require("../core/utils");
const v = require("ak-tools");
const chance = u.initChance(SEED);

/** @type {import("../types").Config} */
const config = {
    token: "",
    seed: SEED,
    numDays: 100, //how many days worth of data
    numEvents: 100000, //how many events
    numUsers: 1000, //how many users    
    format: "csv", //csv or json
    region: "US",
    makeChart: false,
    hasAnonIds: false,
    hasSessionIds: false,
    writeToDisk: false,
    events: [],
    superProps: {},
    userProps: {},
    scdProps: {},
    mirrorProps: {},
    groupKeys: [],
    groupProps: {},
    lookupTables: [],
    hook: function(record, type, meta) {
        return record;
    }
};

module.exports = config;'

# Write the initial text to the new file
echo "$initial_text" > "$random_file_name"

# Output the name of the created file
echo "File created: $random_file_name"
