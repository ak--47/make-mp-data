#!/usr/bin/env node
import { fork } from 'child_process';
import path from 'path';
import dotenv from "dotenv";
dotenv.config();
const { NODE_ENV = "unknown" } = process.env;

import main from "../index.js";
import simple from '../dungeons/simple.js';
import complex from '../dungeons/complex.js';
import gaming from '../dungeons/customers/gaming.js';
import big from '../dungeons/big.js';

import Chance from 'chance';
const chance = new Chance();
const twentyFivePercent = () => chance.bool({ likelihood: 25 });

// --- shared options ---
let divisor = 1;
if (NODE_ENV === "dev") divisor = 1000;

const commonOptions = {
	numEvents: 10_000_000 / divisor,
	numUsers: 10_000_000 / 100 / divisor,
	batchSize: 200_000,
	hasAdSpend: false,
	hasAnonIds: true,
	hasSessionIds: true,
	format: "json",
	hasDesktopDevices: true,
	hasIOSDevices: true,
	hasAndroidDevices: true,
	hasBrowser: true,
	hasCampaigns: true,
	verbose: true,
	makeChart: false,
	writeToDisk: true
};




const allSpecs = {
	"simple-spec": { ...simple, ...commonOptions, name: "simple-spec" },
	"complex-spec": { ...complex, ...commonOptions, name: "complex-spec" },
	"meta-spec": { ...big, ...commonOptions, name: "meta-spec" },
	"fun-spec": { ...gaming, ...commonOptions, name: "fun-spec" },
	"bad-spec": {
		...big, ...commonOptions, name: "bad-data-spec",
		hook: function (record, type, meta) {
			if (type === "event") {
				if (twentyFivePercent()) delete record.event;
				if (twentyFivePercent()) delete record.user_id;
				if (twentyFivePercent()) delete record.session_id;
				if (twentyFivePercent()) delete record.device_id;
				if (twentyFivePercent()) delete record.time;
				if (twentyFivePercent()) delete record.insert_id;
			}
			return record;
		}
	}
};

for (const [name, spec] of Object.entries(allSpecs)) {
	delete spec.groupEvents;
	delete spec.scdProps;
	delete spec.lookupTables;
	delete spec.groupKeys;
	delete spec.groupProps;
	delete spec.mirrorProps;
	delete spec.token;
	delete spec.secret;
}

const simulations = Object.entries(allSpecs).map(([name, spec]) => ({ name, spec }));

// 1. If this process is a CHILD, just run the spec!
if (process.env.__SIM_CHILD) {
	const name = process.env.__SIM_NAME;
	const spec = allSpecs[name];
	(async () => {
		const result = await main(spec);
		// Send result to parent
		if (process.send) process.send(result);
		else console.log(JSON.stringify(result));
		process.exit(0);
	})();
} else {
	// 2. PARENT: fork a child for each simulation
	const { promisify } = await import('util');
	const limit = 5; // parallelism limit
	let running = 0, idx = 0, results = [];

	function runOne(sim) {
		return new Promise((resolve, reject) => {
			const child = fork(process.argv[1], [], {
				env: { ...process.env, __SIM_CHILD: "1", __SIM_NAME: sim.name },
				stdio: ['inherit', 'inherit', 'inherit', 'ipc']
			});
			child.on('message', (result) => resolve({ name: sim.name, result }));
			child.on('error', reject);
			child.on('exit', (code) => {
				if (code !== 0) reject(new Error(`Child ${sim.name} exited code ${code}`));
			});
		});
	}

	const queue = [...simulations];
	const resultsList = [];
	async function runNext() {
		while (running < limit && queue.length > 0) {
			const sim = queue.shift();
			running++;
			runOne(sim)
				.then(res => resultsList.push(res))
				.catch(e => console.error("Sim error:", e))
				.finally(() => {
					running--;
					runNext();
				});
		}
	}
	runNext();

	// Wait until all are done
	const wait = () => new Promise(resolve => {
		const check = () => {
			if (resultsList.length === simulations.length) resolve(resultsList);
			else setTimeout(check, 100);
		};
		check();
	});
	(await wait()).forEach(res => {
		console.log(`Finished simulation: ${res.name}`);
		// optionally: console.log(res.result);
	});
}
