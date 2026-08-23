import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('V8.8 uses repository V4 stair art and pillarless barrier rendering', async () => {
  const patch = await readFile(join(root, 'src/game/visual-patch-v83.js'), 'utf8');
  const manifest = await readFile(join(root, 'public/assets/anime/map/manifest.json'), 'utf8');

  assert.match(manifest, /"stairs-up-v4"/);
  assert.match(manifest, /"stairs-down-v4"/);
  assert.match(patch, /getMapAsset/);
  assert.match(patch, /stairs-up-v4/);
  assert.match(patch, /stairs-down-v4/);
  assert.match(patch, /drawStairAsset/);
  assert.match(patch, /v4-stair-art-v8\.8/);

  assert.match(patch, /drawBarrierWithoutPillars/);
  assert.match(patch, /parsed\.type === 'door'/);
  assert.match(patch, /pillarless-energy-v8\.8/);
  assert.doesNotMatch(patch, /wall-end-pillar-v6/);
  assert.doesNotMatch(patch, /wall-pillar-v4/);
});
