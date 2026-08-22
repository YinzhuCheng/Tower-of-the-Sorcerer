import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'public/assets/anime/map/manifest.json');
const atlasRoot = join(root, 'public/assets/anime/map');

async function reconstruct(atlas) {
  const chunks = await Promise.all(atlas.base64Chunks.map(async (p) => (await readFile(join(atlasRoot, p), 'utf8')).trim()));
  const base64 = chunks.join('');
  return { base64, data: Buffer.from(base64, 'base64') };
}

function assertWebpAlpha(data) {
  assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(data.includes(Buffer.from('ALPH')), 'WebP must retain alpha');
}

test('v4 combined art atlas is complete and transparent', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.equal(manifest.revision, 'environment-ui-v4');
  const { base64, data } = await reconstruct(manifest.atlases.v4Combined);
  assert.equal(base64.length, 54348);
  assert.equal(data.length, 40760);
  assertWebpAlpha(data);
  assert.equal(createHash('sha256').update(data).digest('hex'), 'ce3b4b76672fa30731fa2b327c65c7501bb556ef5dab415358e8136a46912fbf');
  const expected = ['wall-body-v4','wall-outer-corner-v4','wall-inner-corner-v4','wall-pillar-v4','floor-main-v4','floor-altar-v4','gate-sun-v4','gate-moon-v4','gate-star-v4','stairs-up-v4','stairs-down-v4','gate-boss-v4','card-sun-drop-v4','card-moon-drop-v4','card-star-drop-v4','card-sun-ui-v4','card-moon-ui-v4','card-star-ui-v4'];
  expected.forEach((name, index) => {
    assert.equal(manifest.assets[name]?.atlas, 'v4Combined');
    assert.equal(manifest.assets[name]?.index, index);
  });
});

test('v4 hero portrait is complete and transparent', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const { base64, data } = await reconstruct(manifest.atlases.heroPortraitV4);
  assert.equal(base64.length, 18152);
  assert.equal(data.length, 13612);
  assertWebpAlpha(data);
  assert.equal(createHash('sha256').update(data).digest('hex'), '6276bcf3cea56b8ef39e690ac1198e33005146c59e05b0e55e63aff2387f7f93');
  assert.equal(manifest.assets['hero-portrait-v4']?.atlas, 'heroPortraitV4');
});

test('v4 render hooks use card art, high-res portrait and stationary idle animation', async () => {
  const canvas = await readFile(join(root, 'src/game/canvas-scene.js'), 'utf8');
  const portraits = await readFile(join(root, 'src/game/anime-portraits.js'), 'utf8');
  assert.match(canvas, /moonlit-v4/);
  assert.match(canvas, /requestAnimationFrame/);
  assert.match(canvas, /card-sun-drop-v4/);
  assert.match(canvas, /gate-boss-v4/);
  assert.doesNotMatch(canvas, /state\.x\s*[+\-]=/);
  assert.doesNotMatch(canvas, /state\.y\s*[+\-]=/);
  assert.match(portraits, /hero-portrait-v4/);
  assert.match(portraits, /card-sun-ui-v4/);
});
