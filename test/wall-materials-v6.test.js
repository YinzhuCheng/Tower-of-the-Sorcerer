import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mapRoot = join(root, 'public/assets/anime/map');
const manifestPath = join(mapRoot, 'manifest.json');

const WALL_ASSETS = [
  'wall-surface-v6',
  'wall-edge-horizontal-v6',
  'wall-edge-vertical-v6',
  'wall-outer-corner-v6',
  'wall-inner-corner-v6',
  'wall-end-pillar-v6'
];

test('V6 wall material atlas reconstructs the verified transparent WebP', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.equal(manifest.wallRevision, 'wall-materials-v6');
  const atlas = manifest.atlases.wallMaterialsV6;
  assert.equal(atlas.cols, 3);
  assert.equal(atlas.rows, 2);
  assert.equal(atlas.base64Chunks.length, 12);

  const chunks = await Promise.all(
    atlas.base64Chunks.map(async (relativePath) => (await readFile(join(mapRoot, relativePath), 'utf8')).trim())
  );
  const base64 = chunks.join('');
  assert.equal(base64.length, 67424);

  const data = Buffer.from(base64, 'base64');
  assert.equal(data.length, 50566);
  assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(data.includes(Buffer.from('ALPH')), 'wall material atlas must preserve alpha');
  assert.equal(
    createHash('sha256').update(data).digest('hex'),
    '1b1e50afdc51456c72370ff48f4b6cc8370529990446d2547b72560363c28184'
  );

  WALL_ASSETS.forEach((name, index) => {
    assert.equal(manifest.assets[name]?.atlas, 'wallMaterialsV6');
    assert.equal(manifest.assets[name]?.index, index);
  });
});

test('V6 material layer preserves V5 geometry and uses all six generated wall roles', async () => {
  const entry = await readFile(join(root, 'src/game/canvas-scene.js'), 'utf8');
  const material = await readFile(join(root, 'src/game/wall-material-v6.js'), 'utf8');
  assert.match(entry, /continuous-structure-v5/);
  assert.match(entry, /applyWallMaterialV6/);
  assert.match(material, /material-overlay-v6/);
  assert.match(material, /wall-surface-v6/);
  assert.match(material, /wall-edge-horizontal-v6/);
  assert.match(material, /wall-edge-vertical-v6/);
  assert.match(material, /wall-outer-corner-v6/);
  assert.match(material, /wall-inner-corner-v6/);
  assert.match(material, /wall-end-pillar-v6/);
  assert.match(material, /createPattern\(surface, 'repeat'\)/);
  assert.doesNotMatch(material, /state\.x\s*[+\-]=/);
  assert.doesNotMatch(material, /state\.y\s*[+\-]=/);
});
