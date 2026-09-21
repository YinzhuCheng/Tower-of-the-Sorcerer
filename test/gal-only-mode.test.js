import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

test('GAL-only is a continuous prologue-to-ending reader using the production renderer', async () => {
  const [html, app, main, shellCss, cinematicCss] = await Promise.all([
    readFile(new URL('../public/gal-only/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../public/gal-only/app.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/gal-only/styles.css', import.meta.url), 'utf8'),
    readFile(new URL('../ui-v10-cinematics.css', import.meta.url), 'utf8')
  ]);

  assert.match(html, /完整 GAL/);
  assert.match(html, /id="gal-frame"/);
  assert.match(html, /id="story-start"/);
  assert.match(html, /id="story-toc"/);
  assert.match(html, /id="prev-scene"/);
  assert.match(html, /id="next-scene"/);
  assert.doesNotMatch(html, /review-sidebar|id="scene-list"|scene-search/);

  // The reader owns one canonical main-story order instead of relying on
  // Object.entries(DIALOGUES), whose insertion order mixes optional/review
  // scenes with the playable chronology.
  assert.match(app, /const STORY_ORDER = Object\.freeze\(\[/);
  assert.match(app, /'prologue'/);
  assert.match(app, /'bossCatPreDemo', 'bossCatPostDemo'/);
  assert.match(app, /'floor20', 'warCouncil', 'bossArcaneSovereignPost', 'bossOriginCorePost'/);
  assert.match(app, /'floor30', 'bossArchiveWardenPost', 'ending'/);
  assert.doesNotMatch(app, /Object\.entries\(DIALOGUES\)/);
  assert.match(app, /tower-gal-only-finished/);
  assert.match(app, /loadScene\(currentIndex \+ 1\)/);
  assert.match(app, /sessionStorage\.removeItem\(GAL_HISTORY_STORAGE_KEY\)/);

  // The iframe still uses the real production dialogue renderer and does not
  // boot the tower canvas underneath review mode.
  assert.match(app, /new URLSearchParams\(\{ 'gal-preview': id, 'gal-only': '1' \}\)/);
  assert.match(main, /function requestedGalOnlyMode\(\)/);
  assert.match(main, /get\('gal-only'\) === '1'/);
  assert.match(main, /type: 'tower-gal-only-finished'/);
  assert.match(main, /if \(galOnlyPreview\) restoreGalOnlyHistory\(\)/);
  assert.match(main, /persistGalOnlyHistory\(\)/);
  assert.match(main, /GAL_HISTORY_LIMIT = .*\? 600 : 80/);
  assert.match(main, /if \(galOnlyPreview\) \{[\s\S]*elements\.loading\.classList\.add\('hidden'\);[\s\S]*return;/);

  assert.match(shellCss, /\.story-shell/);
  assert.match(shellCss, /\.story-toc/);
  assert.doesNotMatch(shellCss, /\.review-sidebar/);

  assert.match(cinematicCss, /V14 — continuous-reading typography/);
  assert.match(cinematicCss, /\.gal-root \.gal-typewriter\{[\s\S]*text-align:left;[\s\S]*text-indent:2em/);
  assert.match(cinematicCss, /\.gal-root \.gal-history-list\{[\s\S]*display:block/);
  assert.match(cinematicCss, /\.gal-root \.gal-history-entry\{[\s\S]*border:0;[\s\S]*border-bottom:/);
  assert.match(cinematicCss, /\.gal-root \.gal-history-entry p\{[\s\S]*text-align:left;[\s\S]*text-indent:2em/);

  // A dialogue turn may rebuild its text controls, but unchanged scene art
  // must not replay background/CG reveals. Standee entrance is reserved for
  // a real actor insertion on that side.
  assert.match(main, /let previousVisual = null/);
  assert.match(main, /backdropChanged \? 'is-new-backdrop' : 'is-continuing-backdrop'/);
  assert.match(main, /cgChanged \? 'is-new-cg' : 'is-continuing-cg'/);
  assert.match(main, /leftEntering = Boolean\(visual\.left\)/);
  assert.match(main, /rightEntering = Boolean\(visual\.right\)/);
  assert.match(main, /entering \? 'is-entering' : 'is-continuing'/);
  assert.match(cinematicCss, /\.gal-root \.gal-dialogue\.is-new-backdrop \.gal-backdrop\{[\s\S]*animation:galBackdropReveal/);
  assert.match(cinematicCss, /\.gal-root \.gal-dialogue\.is-continuing-backdrop \.gal-backdrop\{[\s\S]*transform:scale\(1\.025\)/);
  assert.match(cinematicCss, /\.gal-root \.gal-dialogue\.is-new-cg \.gal-cg\{[\s\S]*animation:galCgReveal/);
  assert.match(cinematicCss, /\.gal-root \.gal-actor\.is-entering \.gal-standing\{[\s\S]*animation:galStandingEnter/);

  await access(new URL('../public/gal-only/styles.css', import.meta.url));
});

test('production build automatically publishes the GAL-only route from public/', async () => {
  const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');
  assert.match(build, /cp\(join\(root, 'public'\), outDir, \{ recursive: true \}\)/);
});
