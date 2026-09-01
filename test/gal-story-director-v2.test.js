import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent } from '../src/game/demo-30-floor-content.js';
import { dialoguePresentation } from '../src/game/anime-portraits.js';

const shippedScenes = [
  'theme-red-vein.webp',
  'theme-star-mirror.webp',
  'theme-echo-court.webp',
  'theme-origin-core.webp',
  'theme-ash-registry.webp',
  'theme-archive-storm.webp',
  'theme-ember-lighthouse.webp'
];

const keyStageStates = [
  ['dragon_boss', 'embers', 'yanli-dialogue-embers.webp'],
  ['shadow_boss', 'guarded', 'yayu-dialogue-guarded.webp'],
  ['echo_regent', 'grave', 'echo-regent-dialogue-grave.webp'],
  ['arcane_sovereign', 'regret', 'arcane-sovereign-dialogue-regret.webp'],
  ['act3_archive_warden', 'duty', 'archive-warden-dialogue-duty.webp']
];

test('witness-field story direction ships real scene art and stage art for the decisive Boss scenes', async () => {
  const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
  for (const filename of shippedScenes) {
    const asset = await stat(new URL(`../public/assets/anime/themes/${filename}`, import.meta.url));
    assert.ok(asset.size > 120_000, `${filename} must be a real Gal background`);
    assert.match(main, new RegExp(filename.replace('.', '\\.')));
  }

  for (const [id, expression, filename] of keyStageStates) {
    const presentation = dialoguePresentation(id, expression);
    assert.ok(presentation.hasPaintedExpression, `${id}:${expression} needs true standing art`);
    assert.match(presentation.stage, new RegExp(filename.replace('.', '\\.')));
    const asset = await stat(new URL(`../public${presentation.stage}`, import.meta.url));
    assert.ok(asset.size > 150_000, `${id}:${expression} must not be a scaled map token`);
  }

  for (const filename of ['liyue-echo-ledger-cg.webp', 'liyue-lighthouse-archive-cg.webp']) {
    const asset = await stat(new URL(`../public/assets/anime/cg/${filename}`, import.meta.url));
    assert.ok(asset.size > 200_000, `${filename} must be a real story CG`);
  }
});

test('F5, F19, F20 and F30 use authored long Gal scenes with visual beats', () => {
  applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
  applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
  applyDemoThirtyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

  const scenes = [
    ['bossDragonPreDemo', 'dragon_boss'],
    ['floor19', 'echo_regent'],
    ['floor20', 'arcane_sovereign'],
    ['floor30', 'act3_archive_warden']
  ];
  for (const [sceneId, witness] of scenes) {
    const turns = DIALOGUES[sceneId]?.turns ?? [];
    assert.ok(turns.length >= 4, `${sceneId} should be a real confrontation, not a two-line tooltip`);
    assert.ok(turns.some((turn) => turn.kind === 'narration'), `${sceneId} needs a visible scene beat`);
    assert.ok(turns.some((turn) => turn.portrait === witness), `${sceneId} must stage its decisive witness`);
  }

  assert.equal(DIALOGUES.floor19.turns.some((turn) => turn.cg === '/assets/anime/cg/liyue-echo-ledger-cg.webp'), true);
  assert.equal(DIALOGUES.ending.turns.some((turn) => turn.cg === '/assets/anime/cg/liyue-lighthouse-archive-cg.webp'), true);
});
