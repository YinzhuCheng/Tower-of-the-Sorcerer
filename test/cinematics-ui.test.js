import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

import { createInitialState, tryMove } from '../src/game/engine.js';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent } from '../src/game/demo-30-floor-content.js';
import { DIALOGUE_CAST, dialoguePresentation } from '../src/game/anime-portraits.js';

test('battle results retain an authoritative pre-combat hero snapshot for the cinematic layer', () => {
  const state = createInitialState();
  const before = { ...state.stats };
  // Place the test state beside F1's low-risk rune mote; this bypasses only
  // walking and leaves the authoritative battle calculation untouched.
  state.x = 4;
  state.y = 9;
  const result = tryMove(state, 1, 0);

  assert.ok(result.battle, 'the first floor starts beside a battle target');
  assert.equal(result.battle.hero.hp, before.hp);
  assert.equal(result.battle.hero.maxHp, before.maxHp);
  assert.equal(result.battle.hero.atk, before.atk);
  assert.equal(result.battle.hero.def, before.def);
});

test('cinematic UI ships working Gal controls, story CGs, character expressions, and authored theme environments', async () => {
  const [html, main, css, critical, defeat, prologue, truth, afterlight, night, sun, ocean, forest, liyue, noctia, shawu] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../ui-v10-cinematics.css', import.meta.url), 'utf8'),
    stat(new URL('../public/assets/anime/cg/liyue-critical-cg.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/cg/liyue-defeat-cg.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/cg/liyue-prologue-tower-cg.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/cg/liyue-noctia-truth-cg.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/cg/liyue-noctia-afterlight-cg.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/themes/theme-night-tower.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/themes/theme-sun-sanctum.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/themes/theme-ocean-archive.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/themes/theme-forest-sanctuary.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/characters/liyue-dialogue-resolve.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/characters/noctia-dialogue-sorrow.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/characters/shawu-dialogue-gentle.webp', import.meta.url))
  ]);

  assert.match(html, /ui-v10-cinematics\.css/);
  assert.match(main, /跳过叙事/);
  for (const label of ['历史', '自动', '快进', '隐藏', 'data-gal-control']) assert.match(main, new RegExp(label));
  assert.match(main, /跳过战斗演出/);
  assert.match(main, /gal-choices/);
  assert.match(main, /gal-dialogue-footer/);
  assert.match(main, /gal-cg/);
  assert.match(main, /galActorHtml/);
  assert.match(main, /gal-speaker-avatar/);
  assert.match(main, /galNameplateHtml/);
  assert.match(main, /preloadGalDialogueArt/);
  assert.match(main, /image\.fetchPriority = 'high'/);
  assert.match(css, /\.gal-dialogue/);
  assert.match(css, /\.gal-cg/);
  assert.match(css, /\.gal-toolbar/);
  assert.match(css, /\.gal-backlog/);
  assert.match(css, /\.gal-portrait-left/);
  assert.match(css, /\.gal-portrait-right/);
  assert.match(css, /\.gal-speaker-avatar/);
  assert.match(css, /\.gal-dialogue-footer\{display:grid/);
  assert.match(css, /\.gal-root \.gal-typewriter\{min-height:0/);
  assert.match(css, /\.gal-root \.gal-textbox\{[\s\S]*?min-height:0/);
  assert.match(css, /height:100svh/);
  assert.match(css, /\.battle-cinematic/);
  assert.ok(critical.size > 80_000, 'critical-health CG should be a real runtime asset');
  assert.ok(defeat.size > 80_000, 'defeat CG should be a real runtime asset');
  for (const cg of [prologue, truth, afterlight]) assert.ok(cg.size > 100_000, 'story CG should be a real runtime asset');
  for (const environment of [night, sun, ocean, forest]) assert.ok(environment.size > 90_000, 'every theme needs a real environment image');
  for (const expression of [liyue, noctia, shawu]) assert.ok(expression.size > 100_000, 'every lead dialogue expression should be a real runtime asset');
  for (const filename of ['theme-night-tower.webp', 'theme-sun-sanctum.webp', 'theme-ocean-archive.webp', 'theme-forest-sanctuary.webp']) {
    assert.match(css, new RegExp(filename.replace('.', '\\.')));
  }
});

test('production build publishes the isolated Gal stylesheet and scene input lock', async () => {
  const [html, main, css, build] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../ui-v10-cinematics.css', import.meta.url), 'utf8'),
    readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8')
  ]);

  assert.match(html, /ui-v10-cinematics\.css\?v=15/);
  assert.match(build, /copyFile\(join\(root, 'ui-v10-cinematics\.css'\), join\(root, 'dist\/ui-v10-cinematics\.css'\)\)/);
  assert.match(main, /document\.body\.classList\.add\('gal-active'\)/);
  assert.match(main, /\$\('#app-shell'\)\.inert = true/);
  assert.match(main, /dialogueRoot\.addEventListener\('click'/);
  assert.match(main, /const openingDialogueActive = initialGalDialogue\(startCanvasAssets\)/);
  assert.match(main, /createCanvasTowerScene\(bridge, undefined, \{ autoStart: !openingDialogueActive \}\)/);
  assert.match(css, /body\.gal-active\{height:100%;overflow:hidden/);
  assert.match(css, /\.gal-root\{[\s\S]*?position:fixed/);
});

test('every speaking character receives a shipped Gal avatar and a declared expression state', async () => {
  applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
  applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
  applyDemoThirtyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

  const speakers = new Set(Object.values(DIALOGUES)
    .flatMap((dialogue) => dialogue.turns ?? [dialogue])
    .map((turn) => turn.portrait)
    .filter(Boolean));

  assert.equal(speakers.size, 15, 'the shipped 30F story has fifteen named speakers');
  for (const portrait of speakers) {
    assert.ok(DIALOGUE_CAST[portrait], `${portrait} needs a dialogue avatar + expression definition`);
    assert.ok(DIALOGUE_CAST[portrait].expression, `${portrait} needs an expression key`);
    assert.ok(DIALOGUE_CAST[portrait].label, `${portrait} needs a localized expression label`);
    assert.match(DIALOGUE_CAST[portrait].avatar, /^\/assets\/anime\/avatars\/.+\.webp$/, `${portrait} needs a dedicated avatar art file`);
    const avatar = await stat(new URL(`../public${DIALOGUE_CAST[portrait].avatar}`, import.meta.url));
    assert.ok(avatar.size > 8_000, `${portrait} avatar should be a real image, not a placeholder`);
  }
});

test('the three narrative leads switch to distinct painted facial expressions', async () => {
  const variants = [
    ['hero', 'resolve'], ['hero', 'stern'], ['hero', 'guarded'], ['hero', 'embers'],
    ['guide', 'gentle'], ['guide', 'watchful'], ['guide', 'lament'], ['guide', 'focus'],
    ['final_queen', 'sorrow'], ['final_queen', 'grave'], ['final_queen', 'knowing'], ['final_queen', 'cold']
  ].map(([id, expression]) => dialoguePresentation(id, expression));

  assert.equal(new Set(variants.map((variant) => variant.avatar)).size, variants.length);
  for (const variant of variants) {
    assert.ok(variant.hasAvatarArt, `${variant.id}:${variant.expression} needs painted avatar art`);
    assert.ok(variant.hasPaintedExpression, `${variant.id}:${variant.expression} needs a stage presentation`);
    const avatar = await stat(new URL(`../public${variant.avatar}`, import.meta.url));
    assert.ok(avatar.size > 10_000, `${variant.id}:${variant.expression} avatar should be a real image`);
  }
});
