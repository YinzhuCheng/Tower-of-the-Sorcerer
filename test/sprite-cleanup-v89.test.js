import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('V8.9 preserves legacy enemy silhouettes while removing only edge-connected backdrop', async () => {
  const patch = await readFile(join(root, 'src/game/visual-patch-v83.js'), 'utf8');

  assert.match(patch, /import \{ portraitIndex \} from '\.\/anime-portraits\.js'/);
  assert.match(patch, /const CONSERVATIVE_KEY_TOLERANCE = 24/);
  assert.match(patch, /const INTRINSIC_ALPHA_RATIO = 0\.008/);
  assert.match(patch, /transparentCount \/ count >= INTRINSIC_ALPHA_RATIO/);
  assert.match(patch, /Only delete pixels that are both backdrop-colored and connected to the cell edge/);
  assert.doesNotMatch(patch, /Math\.min\(pixels\[p \* 4 \+ 3\], 72\)/);
  assert.doesNotMatch(patch, /tolerance\s*=\s*52/);
  assert.match(patch, /scene\.drawLegacySprite = \(id, cx, cy, size, alpha = 1\) =>/);
  assert.match(patch, /scene\.canvas\.dataset\.spriteCleanup = 'conservative-edge-key-v8\.9'/);
});
