import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

test('GAL-only review route reuses the production dialogue renderer without booting tower gameplay', async () => {
  const [html, app, main, cinematicCss] = await Promise.all([
    readFile(new URL('../public/gal-only/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../public/gal-only/app.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../ui-v10-cinematics.css', import.meta.url), 'utf8')
  ]);

  assert.match(html, /GAL ONLY/);
  assert.match(html, /id="gal-frame"/);
  assert.match(html, /id="scene-list"/);
  assert.match(html, /id="prev-scene"/);
  assert.match(html, /id="next-scene"/);
  assert.match(html, /href="\/art-audit\//);

  // The review shell hydrates the same authored content pipeline as demo-main,
  // rather than maintaining a second hand-written list of scenes.
  assert.match(app, /applyDemoTenFloorContent/);
  assert.match(app, /applyDemoTwentyFloorContent/);
  assert.match(app, /applyDemoThirtyFloorContent/);
  assert.match(app, /new URLSearchParams\(\{ 'gal-preview': id, 'gal-only': '1' \}\)/);
  assert.match(app, /tower-gal-only-finished/);
  assert.match(app, /Object\.entries\(DIALOGUES\)/);

  assert.match(main, /function requestedGalOnlyMode\(\)/);
  assert.match(main, /get\('gal-only'\) === '1'/);
  assert.match(main, /type: 'tower-gal-only-finished'/);
  assert.match(main, /if \(galOnlyPreview\) \{[\s\S]*elements\.loading\.classList\.add\('hidden'\);[\s\S]*return;/);

  assert.match(cinematicCss, /body\.gal-only-preview #app-shell/);
  assert.match(cinematicCss, /body\.gal-only-preview #gal-root/);

  await access(new URL('../public/gal-only/styles.css', import.meta.url));
});

test('production build automatically publishes the GAL-only route from public/', async () => {
  const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');
  assert.match(build, /cp\(join\(root, 'public'\), outDir, \{ recursive: true \}\)/);
});
