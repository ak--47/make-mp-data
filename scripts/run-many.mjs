#!/usr/bin/env node
import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import main from "../index.js";
const CONCURRENCY = 10

/**
 * Run multiple dungeons concurrently from the command line.
 *
 * Usage:
 *   node scripts/run-many.mjs dungeons/gaming.js dungeons/media.js dungeons/food.js
 *   node scripts/run-many.mjs dungeons/harness-*.js
 */

const args = process.argv.slice(2);

if (process.env.__SIM_CHILD) {
	// CHILD: run the assigned dungeon
	const dungeonPath = process.env.__SIM_PATH;
	(async () => {
		try {
			const mod = await import(path.resolve(dungeonPath));
			const spec = mod.default;
			spec.name = path.basename(dungeonPath, '.js');
			const result = await main(spec);
			const summary = { eventCount: result.eventCount, userCount: result.userCount, time: result.time };
			if (process.send) process.send({ name: spec.name, success: true, summary }, undefined, undefined, () => process.exit(0));
			else process.exit(0);
		} catch (err) {
			console.error(`[${dungeonPath}] Error:`, err.message);
			if (process.send) process.send({ name: dungeonPath, success: false, error: err.message });
			process.exit(1);
		}
	})();
} else {
	// PARENT: fork children with concurrency limit
	if (args.length === 0) {
		console.error("Usage: node scripts/run-many.mjs <dungeon1.js> <dungeon2.js> ...");
		process.exit(1);
	}

	const limit = CONCURRENCY;
	let running = 0;
	const queue = args.map(p => ({ path: p, name: path.basename(p, '.js') }));
	const results = [];
	const total = queue.length;

	console.log(`\n${"═".repeat(60)}`);
	console.log(`🎲 Running ${total} dungeon(s) with concurrency ${limit}`);
	console.log(`${"═".repeat(60)}\n`);

	function runOne(dungeon) {
		return new Promise((resolve, reject) => {
			console.log(`▶ Starting: ${dungeon.name}`);
			const startTime = Date.now();
			const child = fork(__filename, [], {
				env: { ...process.env, __SIM_CHILD: "1", __SIM_PATH: dungeon.path },
				stdio: ['inherit', 'inherit', 'inherit', 'ipc']
			});
			child.on('message', (msg) => {
				const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
				if (msg.success) {
					console.log(`✅ Finished: ${dungeon.name} (${elapsed}s)`);
				} else {
					console.error(`❌ Failed: ${dungeon.name} - ${msg.error} (${elapsed}s)`);
				}
				resolve(msg);
			});
			child.on('error', (err) => {
				console.error(`❌ Fork error: ${dungeon.name}`, err.message);
				reject(err);
			});
			child.on('exit', (code) => {
				if (code !== 0 && code !== null) {
					reject(new Error(`${dungeon.name} exited with code ${code}`));
				}
			});
		});
	}

	function runNext() {
		while (running < limit && queue.length > 0) {
			const dungeon = queue.shift();
			running++;
			runOne(dungeon)
				.then(res => results.push(res))
				.catch(e => results.push({ name: dungeon.name, success: false, error: e.message }))
				.finally(() => { running--; runNext(); });
		}
	}
	runNext();

	const wait = () => new Promise(resolve => {
		const check = () => {
			if (results.length === total) resolve(results);
			else setTimeout(check, 250);
		};
		check();
	});

	const all = await wait();
	const succeeded = all.filter(r => r.success).length;
	const failed = all.filter(r => !r.success).length;

	console.log(`\n${"═".repeat(60)}`);
	console.log(`🏁 Done: ${succeeded} succeeded, ${failed} failed out of ${total}`);
	console.log(`${"═".repeat(60)}\n`);

	if (failed > 0) process.exit(1);
}
