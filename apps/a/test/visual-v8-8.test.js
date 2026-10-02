import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('V10 uses generated rune stair tiles and generated barrier art', async () => {
  const patch = await readFile(join(root, 'src/game/visual-patch-v83.js'), 'utf8');
  const manifest = await readFile(join(root, 'public/assets/anime/map/manifest.json'), 'utf8');

  for (const asset of [
    'rune-stairs-up-v10', 'rune-stairs-down-v10', 'rune-floor-barrier-v10',
    'barrier-sun-v10', 'barrier-moon-v10', 'barrier-star-v10'
  ]) assert.match(manifest, new RegExp(`"${asset}"`));

  assert.match(patch, /drawGeneratedStair/);
  assert.match(patch, /rune-stairs-up-v10/);
  assert.match(patch, /rune-stairs-down-v10/);
  assert.match(patch, /drawGeneratedBarrier/);
  assert.match(patch, /rune-floor-barrier-v10/);
  assert.match(patch, /generated-barrier-rune-v10/);
  assert.match(patch, /generated-rune-stairs-v10/);
  assert.match(patch, /parsed\.type === 'door'/);
  assert.doesNotMatch(patch, /wall-end-pillar-v6/);
  assert.doesNotMatch(patch, /drawBarrierWithoutPillars/);
});
