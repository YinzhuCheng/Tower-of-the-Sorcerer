import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode, DEMO10_HARD_ROUTE_PROOF } from '../src/game/demo-10-floor-hard-mode.js';
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

// Build the accepted Act I witness before installing the Act II transition.
// It is intentionally replayed only after the transition is present below:
// that regression exercises the phase-changing Queen -> Core -> revealed-U
// state that an actual 20-floor continuation must compact correctly.
const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const F10_ROUTE_WITNESS = runGreedyShopStrategy({
  ...DEMO10_HARD_ROUTE_PROOF,
  traceActions: true,
  maxIterations: 8_000
});
assert.equal(F10_ROUTE_WITNESS.failure, null);
assert.ok(F10_ROUTE_WITNESS.routeSteps.length > 0);

applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const {
  buyShopUpgrade,
  createInitialState,
  getShopOptions,
  getTile,
  tryMove,
  validateStateShape
} = await import('../src/game/engine.js');
const { createTowerAdapter } = await import('../src/solver/tower-adapter.js');
const { replayTowerStepSkeletonToState } = await import('../src/solver/replay.js');

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

test('the Act I witness compacts through the revealed F10 stair and exposes an Act II continuation', () => {
  const adapter = createTowerAdapter();
  const bridge = replayTowerStepSkeletonToState(F10_ROUTE_WITNESS.routeSteps, {
    adapter,
    requireGoal: false
  });

  assert.equal(bridge.ok, true);
  assert.equal(bridge.goal, false);
  assert.equal(bridge.final.floor, 9);
  assert.deepEqual(bridge.final.magic, { unlocked: true, mp: 100, maxMp: 100, tier: 0 });

  const engineState = adapter.materializeState(bridge.state);
  assert.equal(getTile(engineState, 5, 1, 9), 'U');
  const stair = adapter.enumerateActions(bridge.state).find((action) => action.token === 'U');
  assert.ok(stair, 'the dynamic U must remain a legal solver action');
  const ascent = adapter.applyAction(bridge.state, stair);
  assert.equal(ascent.ok, true);
  assert.equal(adapter.summarizeState(ascent.state).floor, 10);

  const landed = adapter.normalize(ascent.state);
  const lunarGate = adapter.enumerateActions(landed.state)
    .find((action) => action.token === 'gate:f11LunarTrace');
  assert.ok(lunarGate, 'named Act II card gates must be visible to the solver');
  const openedGate = adapter.applyAction(adapter.cloneState(landed.state), lunarGate);
  assert.equal(openedGate.ok, true);
  assert.equal(getTile(adapter.materializeState(openedGate.state), 9, 2, 10), '.');
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
