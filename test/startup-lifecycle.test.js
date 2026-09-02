import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('story and controls initialize before optional artwork finishes loading', async () => {
  const [main, portraits, canvas, loader, html] = await Promise.all([
    readFile(join(root, 'src/main.js'), 'utf8'),
    readFile(join(root, 'src/game/anime-portraits.js'), 'utf8'),
    readFile(join(root, 'src/game/anime-canvas-scene.js'), 'utf8'),
    readFile(join(root, 'src/game/asset-loading.js'), 'utf8'),
    readFile(join(root, 'index.html'), 'utf8')
  ]);

  assert.doesNotMatch(portraits, /^await Promise\.all/m, 'portrait module evaluation must not block application boot');
  assert.match(canvas, /this\.renderFloor\(\);\s*this\.bridge\.onReady\(this\);\s*void this\.start\(\);/);
  assert.match(canvas, /Promise\.allSettled\(\[/);
  assert.match(main, /initialGalDialogue\(\);[\s\S]*?await ensurePhaser\(\)/);
  assert.match(main, /onAssetsReady:[\s\S]*?elements\.loading\.classList\.add\('hidden'\)/);
  assert.match(loader, /ASSET_LOAD_TIMEOUT_MS = 20_000/);
  assert.doesNotMatch(html, /v8-atlas-fetch-shim\.js/);
});
