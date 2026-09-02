import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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
  assert.doesNotMatch(html, /v8-atlas-fetch-shim\.js/);
  assert.match(main, /installV8VisualLayer/);
  assert.match(main, /applySceneThemeV8/);
  assert.match(main, /installV83UiFixes/);
  assert.match(main, /applyV83RenderFixes/);

  for (const theme of ['night', 'sun', 'ocean', 'forest']) {
    assert.match(css, new RegExp(`body\\[data-theme="${theme}"\\]`));
  }

  assert.match(css, /\.stat-grid>div\{display:flex/);
  assert.match(css, /\.card-token\+\.card-token\{border-left/);
});

test('V8 generated UI atlas remains exact while V10 supplies gameplay pickups and cards', async () => {
  const source = await readFile(join(root, 'src/game/visual-theme-v8.js'), 'utf8');
  const patch = await readFile(join(root, 'src/game/visual-patch-v83.js'), 'utf8');
  const chunkNames = [
    'generated-v8-01a.b64',
    'generated-v8-01b.b64',
    'generated-v8-02a.b64',
    'generated-v8-02b.b64',
    'generated-v8-03.b64',
    'generated-v8-04.b64',
    'generated-v8-05.b64',
    'generated-v8-06.b64'
  ];
  const chunks = await Promise.all(chunkNames.map((name) =>
    readFile(join(root, 'public/assets/anime/map/atlases/v8', name), 'utf8')
  ));
  const atlas = chunks.map((chunk) => chunk.trim()).join('');
  assert.equal(atlas.length, 43152);
  const data = Buffer.from(atlas, 'base64');
  assert.equal(data.length, 32362);
  assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.equal(
    createHash('sha256').update(data).digest('hex'),
    '857a56998c8d6c625f1a343bf9bac29084b899be04f19cc2d77a3678d246e4ec'
  );
  const runtime = await readFile(join(root, 'public/assets/anime/map/atlases/runtime/ui-v8.webp'));
  assert.deepEqual(runtime, data);
  assert.match(source, /atlases\/runtime\/ui-v8\.webp/);
  assert.doesNotMatch(source, /decodeBase64Bytes|atob\(/);

  assert.match(source, /floor-main-v8/);
  assert.match(source, /floor-alt-v8/);
  assert.match(source, /outer-wall-trim-v8/);
  assert.match(source, /outer-pillar-v8/);
  assert.match(source, /ui-corner-v8/);
  assert.match(source, /ui-divider-v8/);
  assert.match(source, /drawFloorV82/);
  assert.match(source, /drawOuterWallTrim/);
  assert.match(source, /decorateUiPanels/);
  assert.match(source, /THEME_ENVIRONMENT_URLS/);
  assert.match(source, /preloadThemeEnvironmentAssets/);
  assert.match(source, /tower-theme-change/);

  assert.match(patch, /generated-items-v10/);
  assert.match(patch, /generated-cards-v10/);
  assert.match(patch, /gem-atk-v10/);
  assert.match(patch, /gem-def-v10/);
  assert.match(patch, /potion-red-v10/);
  assert.match(patch, /potion-blue-v10/);
  assert.match(patch, /card-sun-v10/);
  assert.match(patch, /card-moon-v10/);
  assert.match(patch, /card-star-v10/);
  assert.match(patch, /drawGeneratedStatDrop/);
  assert.match(patch, /drawGeneratedCard/);
  assert.doesNotMatch(patch, /function drawGem/);
  assert.doesNotMatch(patch, /function drawPotion/);

  assert.match(source, /programmatic-card-v8/);
  assert.doesNotMatch(source, /state\.x\s*[+\-]=/);
  assert.doesNotMatch(source, /state\.y\s*[+\-]=/);
});
