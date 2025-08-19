#!/usr/bin/env node
import { fork } from 'child_process';
import path from 'path';
import dotenv from "dotenv";
dotenv.config();
const { NODE_ENV = "unknown" } = process.env;

import main from "../index.js";
import simple from '../dungeons/simple.js';
import Chance from 'chance';
const chance = new Chance();

/** @typedef {import('../types.d.ts').Dungeon} Spec */


// --- shared options ---
let divisor = 1;
if (NODE_ENV === "dev") divisor = 1000;

/** @type {Spec} */
const commonOptions = {
	verbose: true,
	writeToDisk: true,
	...simple,
}

/** @type {Spec} */
const twoFiftyKOptions = {
	numEvents: 250_000 / divisor,
	numUsers: 250_000 / 100 / divisor,
	...commonOptions
}

/** @type {Spec} */
const oneMillionOptions = {
	numEvents: 1_000_000 / divisor,
	numUsers: 1_000_000 / 100 / divisor,
	...commonOptions
}

/** @type {Object.<string, Spec>} */
const allSpecs = {
	"csv-250k": { ...twoFiftyKOptions, format: "csv" },
	"csv-1m": { ...oneMillionOptions, format: "csv" },
	"csv-gz-250k": {...twoFiftyKOptions, format: "csv", gzip: true },
	"csv-gz-1m": {...oneMillionOptions, format: "csv", gzip: true },
	"json-250k": { ...twoFiftyKOptions, format: "json" },
	"json-1m": { ...oneMillionOptions, format: "json" },
	"json-gz-250k": {...twoFiftyKOptions, format: "json", gzip: true },
	"json-gz-1m": {...oneMillionOptions, format: "json", gzip: true },
	"parquet-250k": { ...twoFiftyKOptions, format: "parquet" },
	"parquet-1m": { ...oneMillionOptions, format: "parquet" },
	"parquet-gz-250k": {...twoFiftyKOptions, format: "parquet", gzip: true },
	"parquet-gz-1m": {...oneMillionOptions, format: "parquet", gzip: true }
};



function getSimulations(specs) {
    const sims = [];
    for (const [name, spec] of Object.entries(specs)) {
        spec.name = name;
		sims.push({ name, spec });
    }
    return sims;
}

const simulations = getSimulations(allSpecs);
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
	// @ts-ignore
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
	// @ts-ignore
	(await wait()).forEach(res => {
		console.log(`Finished simulation: ${res.name}`);
		// optionally: console.log(res.result);
	});
}
