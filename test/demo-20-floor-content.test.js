import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import {
  applyDemoTwentyFloorContent,
  DEMO20_CONTENT_ID,
  DEMO20_MAGIC_RELIC_EFFECTS,
  DEMO20_NUMERIC_BASELINE
} from '../src/game/demo-20-floor-content.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const {
  buyShopUpgrade,
  createInitialState,
  getShopOptions,
  getTile,
  tryMove,
  validateStateShape
} = await import('../src/game/engine.js');

test('Act II turns the frozen 11–20 topology into a complete runtime campaign', () => {
  const state = createInitialState();
  assert.equal(FLOORS.length, 20);
  assert.equal(state.floorStates.length, 20);
  assert.equal(validateStateShape(state), true);
  assert.equal(FLOORS[19].demoContentId, DEMO20_CONTENT_ID);
  assert.deepEqual(FLOORS[13].exitGuardians, ['arcaneGatekeeper', 'spectrumMarshal', 'triuneArbiter']);
  assert.deepEqual(FLOORS[13].puzzles.guardianGates.f14TriuneSeal, FLOORS[13].exitGuardians);
  assert.deepEqual(FLOORS[19].puzzles.guardianGates.f20SovereignSeal, ['arcaneSovereign']);
  assert.equal(ENEMIES.originCore.finalBoss, true);
  assert.equal(ENEMIES.arcaneSovereign.finalBoss, undefined);

  for (const [id, values] of Object.entries(DEMO20_NUMERIC_BASELINE)) {
    assert.equal(ENEMIES[id].hp, values.hp, `${id} must use the isolated Act II baseline`);
    assert.ok(Number.isFinite(ENEMIES[id].atk) && Number.isFinite(ENEMIES[id].def));
  }
  for (const [id, effect] of Object.entries(DEMO20_MAGIC_RELIC_EFFECTS)) {
    assert.deepEqual(
      Object.fromEntries(Object.keys(effect).map((key) => [key, ITEMS[id][key]])),
      effect,
      `${id} must retain its frozen magic role`
    );
  }
});

test('F10 core restores 100 MP, reveals a real stair, and transfers into F11 without declaring victory', () => {
  const state = createInitialState();
  const floor10 = state.floorStates[9];
  // Isolate the transition cell from the authored throne seals so this checks
  // the engine result, not the F10 route solver.
  floor10.map[1][4] = '.';
  floor10.map[1][5] = 'enemy:voidCore';
  state.floor = 9;
  state.x = 4;
  state.y = 1;
  state.stats = { hp: 100_000, maxHp: 100_000, atk: 10_000, def: 10_000, gold: 0 };

  const result = tryMove(state, 1, 0);
  assert.equal(result.moved, true);
  assert.equal(result.victory, undefined);
  assert.equal(result.magicAwakened, true);
  assert.equal(result.stairRevealed, true);
  assert.deepEqual(state.magic, { unlocked: true, mp: 100, maxMp: 100, tier: 0 });
  assert.equal(state.victory, false);
  assert.equal(getTile(state, 5, 1, 9), 'U');

  assert.equal(tryMove(state, -1, 0).moved, true);
  const ascent = tryMove(state, 1, 0);
  assert.equal(ascent.floorChanged, true);
  assert.equal(state.floor, 10);
  assert.equal(FLOORS[state.floor].number, 11);
});

test('F15 is the only Act II shop and exposes explicit MP actions alongside the normal conversion choices', () => {
  const state = createInitialState();
  const shopFloors = FLOORS.filter((floor) => floor.map.flat().includes('shop')).map((floor) => floor.number);
  assert.deepEqual(shopFloors, [5, 15]);

  state.floor = 14;
  state.magic = { unlocked: true, mp: 0, maxMp: 100, tier: 0 };
  state.stats.gold = 10_000;
  const optionIds = getShopOptions(state).map((option) => option.id);
  assert.deepEqual(optionIds, ['hp', 'atk', 'def', 'mpRestore', 'maxMp']);
  const purchase = buyShopUpgrade(state, 'maxMp');
  assert.equal(purchase.ok, true);
  assert.equal(state.magic.maxMp, 120);
  assert.equal(state.magic.mp, 20);
});
