import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const shard = Number.parseInt(process.argv[2] ?? '', 10);
const shardCount = Number.parseInt(process.argv[3] ?? '', 10);

if (!Number.isInteger(shard) || !Number.isInteger(shardCount) || shard < 0 || shard >= shardCount || shardCount < 1) {
  console.error('usage: node scripts/run-test-shard.mjs <shard-index> <shard-count>');
  process.exit(2);
}

const entries = (await readdir('test'))
  .filter((name) => name.endsWith('.test.js'))
  .sort();

const files = entries
  .filter((_, index) => index % shardCount === shard)
  .map((name) => join('test', name));

if (!files.length) {
  console.error(`test shard ${shard}/${shardCount} selected no files`);
  process.exit(2);
}

console.log(`Running test shard ${shard + 1}/${shardCount}: ${files.length} files`);
for (const file of files) console.log(`  ${file}`);

const child = spawnSync(
  process.execPath,
  ['--test', '--test-concurrency=1', ...files],
  { stdio: 'inherit' }
);

if (child.error) throw child.error;
process.exit(child.status ?? 1);
