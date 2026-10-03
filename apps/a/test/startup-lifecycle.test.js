import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('story starts independently but tactical readiness requires decoded artwork', async () => {
  const [main, portraits, baseCanvas, canvas, loader, html] = await Promise.all([
    readFile(join(root, 'src/main.js'), 'utf8'),
    readFile(join(root, 'src/game/anime-portraits.js'), 'utf8'),
    readFile(join(root, 'src/game/anime-canvas-scene.js'), 'utf8'),
    readFile(join(root, 'src/game/canvas-scene.js'), 'utf8'),
    readFile(join(root, 'src/game/asset-loading.js'), 'utf8'),
    readFile(join(root, 'index.html'), 'utf8')
  ]);

  assert.doesNotMatch(portraits, /^await Promise\.all/m, 'portrait module evaluation must not block application boot');
  assert.match(baseCanvas, /if \(notifyReady\) this\.bridge\.onReady\(this\);\s*if \(autoStart\) void this\.start\(\)\.catch/);
  assert.match(baseCanvas, /Promise\.allSettled\(\[/);
  assert.match(canvas, /createBaseCanvasTowerScene\(bridge, parent, \{ autoStart: false, notifyReady: false \}\)/);
  assert.match(canvas, /applyWallMaterialV6\(scene\);\s*bridge\.onReady\(scene\);\s*if \(autoStart\) void scene\.start\(\)\.catch/);
  assert.match(main, /createTacticalStartup\([\s\S]*?const startTacticalScene = \(\) => tacticalStartup\.start\(\)[\s\S]*?initialGalDialogue\(releaseIntoTower\)/);
  assert.match(main, /onReady: \(\) => \{ elements\.loading\.classList\.add\('hidden'\)/);
  assert.doesNotMatch(main, /onReady:[\s\S]*?readyScene\.refresh\?\.\(\);[\s\S]*?onAssetsReady:/);
  assert.match(loader, /ASSET_LOAD_TIMEOUT_MS = 20_000/);
  assert.doesNotMatch(html, /v8-atlas-fetch-shim\.js/);
});
