import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

test('merchant canon repair keeps its accepted master, native alpha and exact runtime bytes', async () => {
  const m = JSON.parse(await readFile(new URL('art/visual-novel/05_manifests/merchant-canon-runtime-repair-20260930.json', root), 'utf8'));
  const runtime = await readFile(new URL(m.runtime, root));
  const master = await readFile(new URL(m.source, root));
  assert.equal(m.qa.status, 'accepted');
  assert.equal(m.qa.reviewers, 2);
  assert.equal(digest(runtime), m.sha256);
  assert.deepEqual(runtime, master);
  assert.equal(runtime.readUInt32BE(16), 1024);
  assert.equal(runtime.readUInt32BE(20), 1536);
  assert.equal(runtime[25], 6, 'PNG retains native RGBA, not a painted background');
  await readFile(new URL(m.prompt, root));
});

test('Lumi crescent astrolabe repair retains a verified source and runtime export', async () => {
  const m = JSON.parse(await readFile(new URL('art/visual-novel/05_manifests/cg010-canon-runtime-repair-20260930.json', root), 'utf8'));
  const runtime = await readFile(new URL(m.runtime, root));
  const master = await readFile(new URL(m.source, root));
  assert.equal(m.qa.status, 'accepted');
  assert.equal(m.qa.reviewers, 2);
  assert.equal(digest(runtime), m.runtime_sha256);
  assert.equal(digest(master), m.source_sha256);
  assert.equal(runtime.subarray(0, 4).toString(), 'RIFF');
  assert.equal(runtime.subarray(8, 12).toString(), 'WEBP');
  assert.deepEqual([master.readUInt32BE(16), master.readUInt32BE(20)], m.dimensions);
  await readFile(new URL(m.prompt, root));
});
