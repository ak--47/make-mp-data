import generate from '../index.js';
import path from 'path';

const dungeonPath = process.argv[2];
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
  name: "verify-hooks",
  concurrency: 1,
});

console.log(JSON.stringify({
  eventCount: results.eventCount,
  userCount: results.userCount,
  files: results.files,
  duration: results.time?.human || results.time?.delta + 'ms'
}));
