import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { CG_SCENES } from '../public/art-audit/registry.js';

const root = new URL('../', import.meta.url);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

test('all 19 audit CG casts and runtime paths match source-grounded main scene cards', async () => {
  const folder = new URL('art/visual-novel/03_intermediate/scene_cards/', root);
  const files = (await readdir(folder)).filter((name) => /^CG_\d{3}_.*\.json$/.test(name));
  assert.equal(files.length, 19);
  const cards = await Promise.all(files.map(async (file) => JSON.parse(await readFile(new URL(file, folder), 'utf8'))));
  for (const scene of CG_SCENES) {
    const card = cards.find(({ semantic_id }) => semantic_id === scene.id);
    assert.ok(card, `${scene.id} has an authoritative scene card`);
    assert.deepEqual([...scene.cast].sort(), [...card.cast].sort(), `${scene.id} cast is the depicted scene, not only its narrator`);
    assert.equal(`public${scene.path}`, card.runtime_target, `${scene.id} active path matches source card`);
  }
});

test('five September 30 CG corrections have accepted matching source and runtime hashes', async () => {
  for (const id of ['004', '006', '008', '010', '015']) {
    const manifest = JSON.parse(await readFile(new URL(`art/visual-novel/05_manifests/cg${id}-canon-runtime-repair-20260930.json`, root), 'utf8'));
    assert.equal(manifest.status, 'accepted');
    assert.equal(manifest.qa.status, 'accepted');
    assert.ok(manifest.qa.reviewers >= 2);
    assert.deepEqual(manifest.dimensions, [1672, 941]);
    assert.notEqual(manifest.previous_sha256, manifest.runtime_sha256);
    const [source, runtime] = await Promise.all([readFile(new URL(manifest.source, root)), readFile(new URL(manifest.runtime, root))]);
    assert.equal(sha256(source), manifest.source_sha256, `CG${id} source SHA`);
    assert.equal(sha256(runtime), manifest.runtime_sha256, `CG${id} runtime SHA`);
    assert.equal(source.subarray(1, 4).toString('ascii'), 'PNG');
    assert.equal(source.readUInt32BE(16), 1672);
    assert.equal(source.readUInt32BE(20), 941);
    assert.equal(runtime.subarray(0, 4).toString('ascii'), 'RIFF');
    assert.equal(runtime.subarray(8, 12).toString('ascii'), 'WEBP');
  }
});
