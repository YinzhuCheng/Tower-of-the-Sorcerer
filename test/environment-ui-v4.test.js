import test from 'node:test';
import assert from 'node:assert/strict';
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

function canonicalRiffWebP(data, label) {
  assert.ok(data.length > 1000, `${label} must not be truncated`);
  assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF', `${label} must have RIFF header`);
  assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP', `${label} must be WebP`);
  const declaredLength = data.readUInt32LE(4) + 8;
  assert.ok(declaredLength >= 12 && declaredLength <= data.length, `${label} RIFF declared size must fit actual bytes`);
  assert.ok(data.length - declaredLength <= 4, `${label} may contain only a tiny transport tail`);
  return data.subarray(0, declaredLength);
}

function assertWebpAlpha(data, label) {
  const riff = canonicalRiffWebP(data, label);
  let offset = 12;
  const chunkNames = [];
  while (offset + 8 <= riff.length) {
    const name = riff.subarray(offset, offset + 4).toString('ascii');
    const size = riff.readUInt32LE(offset + 4);
    chunkNames.push(name);
    offset += 8 + size + (size & 1);
    assert.ok(offset <= riff.length, `${label} contains a truncated ${name} chunk`);
  }
  assert.equal(offset, riff.length, `${label} RIFF chunks must end exactly at declared EOF`);
  assert.ok(chunkNames.includes('ALPH') || chunkNames.includes('VP8L'), `${label} must retain transparency-capable WebP data`);
}

test('v4 combined art atlas is complete and transparent', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.equal(manifest.revision, 'environment-ui-v4');
  const { base64, data } = await reconstruct(manifest.atlases.v4Combined);
  assert.ok(base64.length > 50000, 'combined atlas base64 payload must be complete');
  assertWebpAlpha(data, 'v4 combined atlas');
  const expected = ['wall-body-v4','wall-outer-corner-v4','wall-inner-corner-v4','wall-pillar-v4','floor-main-v4','floor-altar-v4','gate-sun-v4','gate-moon-v4','gate-star-v4','stairs-up-v4','stairs-down-v4','gate-boss-v4','card-sun-drop-v4','card-moon-drop-v4','card-star-drop-v4','card-sun-ui-v4','card-moon-ui-v4','card-star-ui-v4'];
  expected.forEach((name, index) => {
    assert.equal(manifest.assets[name]?.atlas, 'v4Combined');
    assert.equal(manifest.assets[name]?.index, index);
  });
});

test('v4 hero portrait is complete and transparent', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const { base64, data } = await reconstruct(manifest.atlases.heroPortraitV4);
  assert.ok(base64.length > 16000, 'hero portrait payload must be complete');
  assertWebpAlpha(data, 'v4 hero portrait');
  assert.equal(manifest.assets['hero-portrait-v4']?.atlas, 'heroPortraitV4');
});

test('v4 render hooks use card art, high-res portrait and stationary idle animation', async () => {
  const canvas = await readFile(join(root, 'src/game/canvas-scene.js'), 'utf8');
  const portraits = await readFile(join(root, 'src/game/anime-portraits.js'), 'utf8');
  const loader = await readFile(join(root, 'src/game/map-assets.js'), 'utf8');
  assert.match(canvas, /moonlit-v4/);
  assert.match(canvas, /requestAnimationFrame/);
  assert.match(canvas, /card-sun-drop-v4/);
  assert.match(canvas, /gate-boss-v4/);
  assert.doesNotMatch(canvas, /state\.x\s*[+\-]=/);
  assert.doesNotMatch(canvas, /state\.y\s*[+\-]=/);
  assert.match(portraits, /hero-portrait-v4/);
  assert.match(portraits, /card-sun-ui-v4/);
  assert.match(loader, /trimRiffWebP/);
});
