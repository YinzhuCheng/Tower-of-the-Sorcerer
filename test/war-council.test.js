import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const { createInitialState, getEffectiveEnemy, getTile, resolveWarCouncil } = await import('../src/game/engine.js');
const {
  enumerateWarCouncilPlans,
  getRecommendedWarCouncilPlan,
  WAR_COUNCIL_LOYALISTS,
  WAR_COUNCIL_TUNING
} = await import('../src/game/war-council.js');
const { evaluateWarCouncilBalance } = await import('../src/tuner/war-council-balance.js');
const { createDemoTwentyFloorMutationCatalog, withDemoTwentyFloorCandidate } = await import('../src/tuner/demo-20-floor-mutations.js');
const { createTowerAdapter } = await import('../src/solver/tower-adapter.js');

function preparedState() {
  const state = createInitialState();
  for (const enemyId of ['catBoss', 'whaleBoss', 'dragonBoss', 'shadowBoss']) {
    state.floorStates[ENEMIES[enemyId].floor - 1].defeatedBossIds.push(enemyId);
  }
  state.floor = 19;
  state.x = 5;
  state.y = 6;
  return state;
}

test('council exposes all loyalist MP allocations and retains a hard but non-single-solution plan window', () => {
  const state = preparedState();
  assert.deepEqual(WAR_COUNCIL_LOYALISTS.map((entry) => entry.mp), [20, 60, 40]);
  const all = enumerateWarCouncilPlans(state);
  const wins = all.filter((entry) => entry.won);
  assert.equal(all.length, 240);
  assert.ok(wins.length >= 12 && wins.length <= 36, `expected release window, got ${wins.length}`);
  assert.equal(evaluateWarCouncilBalance({ state }).publishable, true);
});

test('winning council plan is authoritative, clears its spatial blocker, and modifies only F20 final phases', () => {
  const state = preparedState();
  const plan = getRecommendedWarCouncilPlan(state)?.plan;
  assert.ok(plan);
  const result = resolveWarCouncil(state, plan);
  assert.equal(result.ok, true);
  assert.equal(state.council.completed, true);
  assert.equal(getTile(state, 5, 5, 19), '.');
  const sovereign = getEffectiveEnemy(state, 'arcaneSovereign');
  assert.equal(sovereign.councilModified, true);
  state.floor = 18;
  assert.equal(getEffectiveEnemy(state, 'arcaneSovereign').councilModified, undefined);
});

test('solver enumerates replayable council plans as first-class F20 actions', () => {
  const state = preparedState();
  const adapter = createTowerAdapter();
  const compact = adapter.compactState(state);
  const action = adapter.enumerateActions(compact).find((entry) => entry.kind === 'council');
  assert.ok(action);
  const applied = adapter.applyAction(compact, action);
  assert.equal(applied.ok, true);
  const replayed = adapter.materializeState(applied.state);
  assert.equal(replayed.council.completed, true);
  assert.equal(getTile(replayed, 5, 5, 19), '.');
});

test('numeric mutator probes the council without changing its order, roster, or runtime baseline', () => {
  const baseline = WAR_COUNCIL_TUNING.loyalistScale;
  const catalog = createDemoTwentyFloorMutationCatalog();
  const harden = catalog.find((entry) => entry.id === 'council-loyalists-harden10');
  assert.ok(harden);
  assert.deepEqual(harden.touches, ['council:loyalistScale']);

  const report = withDemoTwentyFloorCandidate(
    { mutationIds: [harden.id] },
    catalog,
    () => evaluateWarCouncilBalance({ state: preparedState() })
  );
  assert.equal(report.tuning.loyalistScale, Number((baseline + 0.01).toFixed(3)));
  assert.equal(report.status, 'too-hard');
  assert.equal(WAR_COUNCIL_TUNING.loyalistScale, baseline, 'candidate evaluation must restore the release baseline');
});
