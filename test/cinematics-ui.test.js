import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

import { createInitialState, tryMove } from '../src/game/engine.js';

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

test('cinematic UI ships skip controls, story CGs, and authored theme environments', async () => {
  const [html, main, css, critical, defeat, prologue, truth, afterlight, night, sun, ocean, forest] = await Promise.all([
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
    stat(new URL('../public/assets/anime/themes/theme-forest-sanctuary.webp', import.meta.url))
  ]);

  assert.match(html, /ui-v10-cinematics\.css/);
  assert.match(main, /跳过叙事/);
  assert.match(main, /跳过战斗演出/);
  assert.match(main, /gal-choices/);
  assert.match(main, /gal-cg/);
  assert.match(css, /\.gal-dialogue/);
  assert.match(css, /\.gal-cg/);
  assert.match(css, /\.battle-cinematic/);
  assert.ok(critical.size > 80_000, 'critical-health CG should be a real runtime asset');
  assert.ok(defeat.size > 80_000, 'defeat CG should be a real runtime asset');
  for (const cg of [prologue, truth, afterlight]) assert.ok(cg.size > 100_000, 'story CG should be a real runtime asset');
  for (const environment of [night, sun, ocean, forest]) assert.ok(environment.size > 90_000, 'every theme needs a real environment image');
  for (const filename of ['theme-night-tower.webp', 'theme-sun-sanctum.webp', 'theme-ocean-archive.webp', 'theme-forest-sanctuary.webp']) {
    assert.match(css, new RegExp(filename.replace('.', '\\.')));
  }
});
