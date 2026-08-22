import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('wall renderer uses continuous structural masonry instead of per-cell wall art', async () => {
  const source = await readFile(join(root, 'src/game/canvas-scene.js'), 'utf8');
  assert.match(source, /continuous-structure-v5/);
  assert.match(source, /scene\.drawWallBase\s*=/);
  assert.match(source, /scene\.drawWallBoundary\s*=/);
  assert.match(source, /wallExposures\(mask\)/);
  assert.match(source, /drawStructuralEdge/);
  assert.match(source, /shadowOffsetX/);
  assert.match(source, /shadowOffsetY/);
  assert.match(source, /if \(mask === 10 \|\| mask === 5 \|\| count === 4\) return null/);
  assert.doesNotMatch(source, /state\.x\s*[+\-]=/);
  assert.doesNotMatch(source, /state\.y\s*[+\-]=/);
});
