/**
 * Verify Runner — runs a dungeon at constrained params for hook verification.
 *
 * Usage: node scripts/verify-runner.mjs <dungeon-path> [run-name]
 *
 * Example: node scripts/verify-runner.mjs dungeons/streaming.js verify-streaming
 */
import generate from '../index.js';
import path from 'path';

const dungeonPath = process.argv[2];
if (!dungeonPath) {
	console.error('Usage: node scripts/verify-runner.mjs <dungeon-path> [run-name]');
	process.exit(1);
}

const runName = process.argv[3] || 'verify-hooks';
const absolutePath = path.isAbsolute(dungeonPath)
  ? dungeonPath
  : path.resolve(process.cwd(), dungeonPath);

const { default: config } = await import(absolutePath);

const results = await generate({
  ...config,
  token: "",
  numUsers: 1000,
  numEvents: 100_000,
  format: "json",
  gzip: false,
  writeToDisk: true,
  name: runName,
  concurrency: 1,
  verbose: false,
});

console.log(JSON.stringify({
  eventCount: results.eventCount,
  userCount: results.userCount,
  files: results.files,
  duration: results.time?.human || results.time?.delta + 'ms'
}));
