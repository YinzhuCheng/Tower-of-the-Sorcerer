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

const CORE_ENVIRONMENT = [
  'wall-body','wall-edge','wall-outer-corner-alt','wall-inner-corner-alt','floor-main',
  'gate-sun','gate-moon','gate-star','stairs-legacy','portal-transfer',
  'wall-horizontal','wall-vertical','wall-outer-corner','wall-inner-corner','wall-t-junction',
  'wall-end-cap','wall-pillar','stairs-up','stairs-down','floor-alt'
];
const HERO_DIRECTIONS = ['hero-down', 'hero-up', 'hero-left', 'hero-right'];

test('moonlit star map manifest preserves the core environment and hero assets while allowing extensions', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.ok(Object.keys(manifest.assets).length >= 24, 'manifest may grow but must retain the original core assets');
  for (const name of [...CORE_ENVIRONMENT, ...HERO_DIRECTIONS]) {
    assert.ok(manifest.assets[name], `missing core map asset: ${name}`);
  }

  for (const [atlasName, atlas] of Object.entries(manifest.atlases)) {
    assert.ok(Array.isArray(atlas.base64Chunks) && atlas.base64Chunks.length >= 2, `${atlasName} should be split into safe chunks`);
    const buffer = await decodeChunks(atlas.base64Chunks);
    assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF', `${atlasName} must decode as RIFF`);
    assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP', `${atlasName} must decode as WEBP`);
  }
});
