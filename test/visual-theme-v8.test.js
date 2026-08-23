import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('V8 installs four UI themes and keeps the compact HUD structure', async () => {
  const html = await readFile(join(root, 'index.html'), 'utf8');
  const css = await readFile(join(root, 'anime.css'), 'utf8');
  const main = await readFile(join(root, 'src/main.js'), 'utf8');

  assert.match(html, /id="btn-theme"/);
  assert.match(html, /data-theme="night"/);
  assert.doesNotMatch(html, /visual-cleanup-v7\.js/);
  assert.match(html, /v8-atlas-fetch-shim\.js/);
  assert.match(main, /installV8VisualLayer/);
  assert.match(main, /applySceneThemeV8/);

  for (const theme of ['night', 'sun', 'ocean', 'forest']) {
    assert.match(css, new RegExp(`body\\[data-theme="${theme}"\\]`));
  }

  assert.match(css, /\.stat-grid>div\{display:flex/);
  assert.match(css, /\.card-token\+\.card-token\{border-left/);
});

test('V8.2 uses generated floor, exterior and UI assets with keyed transparency cleanup', async () => {
  const source = await readFile(join(root, 'src/game/visual-theme-v8.js'), 'utf8');
  const shim = await readFile(join(root, 'src/game/v8-atlas-fetch-shim.js'), 'utf8');
  const chunkPaths = [1, 2, 3, 4, 5, 6].map((index) =>
    join(root, 'public/assets/anime/map/atlases/v8', `generated-v8-${String(index).padStart(2, '0')}.b64`)
  );
  const chunks = await Promise.all(chunkPaths.map((path) => readFile(path, 'utf8')));
  const atlas = chunks.map((chunk) => chunk.trim()).join('');

  assert.ok(atlas.length > 40000, 'generated V8 atlas chunks must reconstruct the complete asset atlas');
  assert.match(shim, /generated-v8-06\.b64/);
  assert.match(shim, /parts\.join\(''\)/);
  assert.match(source, /GENERATED_ATLAS_URL/);
  assert.match(source, /generated-v8-01\.b64/);
  assert.match(source, /floor-main-v8/);
  assert.match(source, /floor-alt-v8/);
  assert.match(source, /outer-wall-trim-v8/);
  assert.match(source, /outer-pillar-v8/);
  assert.match(source, /ui-corner-v8/);
  assert.match(source, /ui-divider-v8/);

  assert.match(source, /#86bed2/);
  assert.match(source, /#272c32/);
  assert.match(source, /drawOuterWallTrim/);
  assert.match(source, /drawCornerPillarV82/);
  assert.match(source, /decorateUiPanels/);
  assert.match(source, /edge-keyed-transparent-v8\.2/);
  assert.match(source, /keyedTransparentCell/);
  assert.match(source, /closeToBackdrop/);
  assert.doesNotMatch(source, /floor-main-v4/);
  assert.doesNotMatch(source, /getMapAsset\('wall-outer-corner-v6'\)/);

  assert.match(source, /programmatic-card-v8/);
  assert.match(source, /sun: \{ rgb:/);
  assert.match(source, /moon: \{ rgb:/);
  assert.match(source, /star: \{ rgb:/);
  assert.match(source, /fillText\(style\.symbol/);
  assert.doesNotMatch(source, /state\.x\s*[+\-]=/);
  assert.doesNotMatch(source, /state\.y\s*[+\-]=/);
});
