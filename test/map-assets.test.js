import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const mapRoot = join(root, 'public/assets/anime/map');
const manifestPath = join(mapRoot, 'manifest.json');

async function decodeChunks(paths) {
  const parts = await Promise.all(paths.map(async (path) => (await readFile(join(mapRoot, path), 'utf8')).trim()));
  return Buffer.from(parts.join(''), 'base64');
}

test('moonlit star map manifest packs 20 environment assets and four hero directions', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const entries = Object.entries(manifest.assets);
  assert.equal(entries.length, 24);
  assert.equal(entries.filter(([, meta]) => meta.role !== 'hero').length, 20);
  assert.deepEqual(['hero-down', 'hero-up', 'hero-left', 'hero-right'].map((name) => Boolean(manifest.assets[name])), [true, true, true, true]);

  for (const [atlasName, atlas] of Object.entries(manifest.atlases)) {
    assert.ok(atlas.base64Chunks.length >= 2, `${atlasName} should be split into safe small chunks`);
    const buffer = await decodeChunks(atlas.base64Chunks);
    assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF');
    assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP');
  }
});
