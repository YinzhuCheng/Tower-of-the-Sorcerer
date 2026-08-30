import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS, SHOP_OPTIONS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode, DEMO10_HARD_ROUTE_PROOF } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import {
  assertDemoTwentyFloorSolverLocks,
  captureDemoTwentyFloorSolverLocks
} from '../src/tuner/demo-20-floor-solver-profile.js';
import {
  createDemoTwentyFloorMutationCatalog,
  withDemoTwentyFloorCandidate
} from '../src/tuner/demo-20-floor-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });

const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const F10_WITNESS = runGreedyShopStrategy({
  ...DEMO10_HARD_ROUTE_PROOF,
  traceActions: true,
  maxIterations: 8_000
});
assert.equal(F10_WITNESS.failure, null);
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const { createTowerAdapter } = await import('../src/solver/tower-adapter.js');
// The scout reuses replay.js, which owns a state codec. Load it only after the
// 20F runtime has been assembled so that codec captures the complete map.
const { createDemoTwentyFloorContinuationAdapter } = await import('../src/tuner/demo-20-floor-continuation-adapter.js');
const {
  createDemoTwentyFloorBridge,
  runDemoTwentyFloorMutationScout
} = await import('../src/tuner/demo-20-floor-mutation-scout.js');
const { runDemoTwentyFloorMilestones } = await import('../src/tuner/demo-20-floor-milestone-solver.js');
const dependencies = { floors: FLOORS, enemies: ENEMIES, items: ITEMS, shopOptions: SHOP_OPTIONS };
const locks = captureDemoTwentyFloorSolverLocks(dependencies);
const catalog = createDemoTwentyFloorMutationCatalog(dependencies);

test('Act II scout starts from the engine-replayed F10 bridge and excludes only frozen Act I returns', () => {
  const adapter = createTowerAdapter();
  const bridge = createDemoTwentyFloorBridge({ routeSteps: F10_WITNESS.routeSteps, adapter });
  assert.equal(bridge.final.floor, 9);
  assert.equal(bridge.final.magic.mp, 100);

  const continuation = createDemoTwentyFloorContinuationAdapter(adapter);
  const boundaryActions = continuation.enumerateActions(bridge.state);
  assert.deepEqual(boundaryActions.map((action) => action.token).filter(Boolean), ['U']);
  assert.equal(boundaryActions.some((action) => action.kind === 'teleport'), false);

  const ascent = continuation.applyAction(bridge.state, boundaryActions[0]);
  assert.equal(ascent.ok, true);
  const f11Actions = continuation.enumerateActions(ascent.state);
  assert.equal(f11Actions.some((action) => action.token === 'D'), false);
  assert.equal(f11Actions.some((action) => action.kind === 'teleport' && action.targetFloor < 10), false);

  const richF11 = continuation.cloneState(ascent.state);
  richF11.stats.gold = 10_000;
  const merchantMacros = continuation.enumerateActions(richF11)
    .filter((action) => action.kind === 'act1-shop-return');
  assert.deepEqual(merchantMacros.map((action) => action.optionId), ['atk', 'def', 'hp']);
  const purchase = continuation.applyAction(richF11, merchantMacros.find((action) => action.optionId === 'hp'));
  assert.equal(purchase.ok, true);
  assert.equal(continuation.summarizeState(purchase.state).floor, 10);
  assert.deepEqual(purchase.steps.map((step) => step.kind), ['teleport', 'shop', 'teleport']);
});

test('bounded numeric scout compares candidates without mutating locked authored content', { timeout: 30_000 }, () => {
  const adapter = createTowerAdapter();
  const result = runDemoTwentyFloorMutationScout({
    adapter,
    routeSteps: F10_WITNESS.routeSteps,
    catalog,
    locks,
    dependencies,
    candidates: [
      { mutationIds: [] },
      { mutationIds: ['f11to13-hp-harden6'] }
    ],
    maxExpanded: 120,
    maxGenerated: 2_000
  });

  assert.equal(result.bridge.final.floor, 9);
  assert.equal(result.reports.length, 2);
  assert.equal(result.reports[0].key, 'baseline');
  assert.equal(result.reports[1].pruning.hardeningFields, 1);
  assert.ok(result.reports.every((entry) => entry.report.generatedStates > 0));
  assert.ok(result.reports.every((entry) => entry.report.deepestFloor >= 11));
  assertDemoTwentyFloorSolverLocks(locks, dependencies);
});

test('a temporary numeric feasibility probe can produce a replayable F15 milestone without changing topology', { timeout: 30_000 }, () => {
  const adapter = createDemoTwentyFloorContinuationAdapter(createTowerAdapter());
  const feasibility = catalog.find((entry) => entry.id === 'f14-guardians-feasibility-soften');
  const result = withDemoTwentyFloorCandidate({ mutationIds: [feasibility.id] }, catalog, () => runDemoTwentyFloorMilestones({
    adapter,
    routeSteps: F10_WITNESS.routeSteps,
    milestones: [{ id: 'f15-arrival', floorIndex: 14, label: '抵达 F15 转换点' }],
    maxExpanded: 3_000,
    maxGenerated: 45_000
  }), { ...dependencies, locks });

  assert.equal(result.completed, true);
  assert.equal(result.milestones[0].reached, true);
  assert.ok(result.milestones[0].certificate);
  assert.ok(result.routeSteps.length > F10_WITNESS.routeSteps.length);
  assertDemoTwentyFloorSolverLocks(locks, dependencies);
});
