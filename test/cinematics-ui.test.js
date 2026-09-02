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

function webpDimensions(buffer) {
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF', 'asset must be RIFF');
  assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP', 'asset must be WebP');
  const chunk = buffer.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8 ') {
    assert.equal(buffer.subarray(23, 26).toString('hex'), '9d012a', 'VP8 frame header missing');
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    assert.equal(buffer[20], 0x2f, 'VP8L signature missing');
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') {
    return { width: buffer.readUIntLE(24, 3) + 1, height: buffer.readUIntLE(27, 3) + 1 };
  }
  throw new Error(`unsupported WebP chunk ${JSON.stringify(chunk)}`);
}

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
    readFile(new URL('../public/assets/anime/cg/liyue-critical-cg.webp', import.meta.url)),
    readFile(new URL('../public/assets/anime/cg/liyue-defeat-cg.webp', import.meta.url)),
    readFile(new URL('../public/assets/anime/cg/liyue-prologue-tower-cg.webp', import.meta.url)),
    readFile(new URL('../public/assets/anime/cg/liyue-noctia-truth-cg.webp', import.meta.url)),
    readFile(new URL('../public/assets/anime/cg/liyue-noctia-afterlight-cg.webp', import.meta.url)),
    readFile(new URL('../public/assets/anime/themes/theme-night-tower.webp', import.meta.url)),
    readFile(new URL('../public/assets/anime/themes/theme-sun-sanctum.webp', import.meta.url)),
    readFile(new URL('../public/assets/anime/themes/theme-ocean-archive.webp', import.meta.url)),
    readFile(new URL('../public/assets/anime/themes/theme-forest-sanctuary.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/characters/liyue-dialogue-resolve.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/characters/noctia-dialogue-sorrow.webp', import.meta.url)),
    stat(new URL('../public/assets/anime/characters/shawu-dialogue-gentle.webp', import.meta.url))
  ]);

  assert.match(html, /ui-v10-cinematics\.css/);
  assert.match(main, /跳过叙事/);
  for (const label of ['历史', '自动', '快进', '隐藏对话框', 'data-gal-control']) assert.match(main, new RegExp(label));
  assert.match(main, /跳过战斗演出/);
  assert.match(main, /gal-choice-overlay/);
  assert.match(main, /gal-textbox-close/);
  assert.match(main, /data-tooltip/);
  assert.match(main, /displaySource = choice\.response/);
  assert.doesNotMatch(main, /gal-choice-response/);
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
  assert.match(css, /\.gal-root \.gal-choice-overlay\{position:absolute/);
  assert.match(css, /\.gal-root \.gal-icon-button::after\{content:attr\(data-tooltip\)/);
  assert.match(css, /\.gal-root \.gal-text-actions \.gal-icon-button\{width:18px/);
  assert.doesNotMatch(css, /gal-choice-response/);
  assert.match(css, /\.gal-root \.gal-actor\{[\s\S]*?bottom:0/);
  assert.match(css, /\.gal-root \.gal-typewriter\{min-height:0/);
  assert.match(css, /\.gal-root \.gal-textbox\{[\s\S]*?min-height:0/);
  assert.match(css, /height:100svh/);
  assert.match(css, /\.battle-cinematic/);
  for (const [filename, asset] of [
    ['liyue-critical-cg.webp', critical],
    ['liyue-defeat-cg.webp', defeat],
    ['liyue-prologue-tower-cg.webp', prologue],
    ['liyue-noctia-truth-cg.webp', truth],
    ['liyue-noctia-afterlight-cg.webp', afterlight],
    ['theme-night-tower.webp', night],
    ['theme-sun-sanctum.webp', sun],
    ['theme-ocean-archive.webp', ocean],
    ['theme-forest-sanctuary.webp', forest]
  ]) {
    const { width, height } = webpDimensions(asset);
    assert.ok(asset.length > 10_000, `${filename} must contain substantive art`);
    assert.ok(width >= 1600 && height >= 900, `${filename} must be at least 1600x900, got ${width}x${height}`);
  }
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

  assert.match(html, /ui-v10-cinematics\.css\?v=17/);
  assert.match(build, /copyFile\(join\(root, 'ui-v10-cinematics\.css'\), join\(root, 'dist\/ui-v10-cinematics\.css'\)\)/);
  assert.match(main, /document\.body\.classList\.add\('gal-active'\)/);
  assert.match(main, /\$\('#app-shell'\)\.inert = true/);
  assert.match(main, /dialogueRoot\.addEventListener\('click'/);
  assert.match(main, /const previewDialogueId = requestedGalPreviewDialogue\(\)/);
  assert.match(main, /: initialGalDialogue\(startCanvasAssets\)/);
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
