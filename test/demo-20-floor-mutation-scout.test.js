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
const { createDemoTwentyFloorForwardWitnessAdapter } = await import('../src/tuner/demo-20-floor-forward-witness-adapter.js');
const { createDemoTwentyFloorConversionWitnessAdapter } = await import('../src/tuner/demo-20-floor-conversion-witness-adapter.js');
const {
  createDemoTwentyFloorBridge,
  runDemoTwentyFloorMutationScout
} = await import('../src/tuner/demo-20-floor-mutation-scout.js');
const { replayTowerStepSkeletonToState } = await import('../src/solver/replay.js');
const { runDemoTwentyFloorMilestones } = await import('../src/tuner/demo-20-floor-milestone-solver.js');
const {
  DEMO20_F14_GUARDIAN_FEASIBILITY_ENDPOINT,
  materializeDemoTwentyFloorF14GuardianRay,
  scanDemoTwentyFloorF14GuardianRay,
  withDemoTwentyFloorF14GuardianRay
} = await import('../src/tuner/demo-20-floor-f14-ray.js');
const {
  DEMO20_F17_CROWN_FEASIBILITY_ENDPOINT,
  materializeDemoTwentyFloorF17CrownRay,
  withDemoTwentyFloorF17CrownRay
} = await import('../src/tuner/demo-20-floor-f17-ray.js');
const {
  DEMO20_LATE_GAME_FEASIBILITY_ENDPOINTS,
  materializeDemoTwentyFloorLateGameRay,
  withDemoTwentyFloorLateGameRays
} = await import('../src/tuner/demo-20-floor-late-game-ray.js');
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

test('forward numerical witness policy removes only optional return churn and keeps F5 macro purchases', () => {
  const adapter = createDemoTwentyFloorForwardWitnessAdapter(createTowerAdapter());
  const bridge = createDemoTwentyFloorBridge({ routeSteps: F10_WITNESS.routeSteps, adapter });
  const ascent = adapter.applyAction(bridge.state, adapter.enumerateActions(bridge.state).find((action) => action.token === 'U'));
  assert.equal(ascent.ok, true);

  const richF11 = adapter.cloneState(ascent.state);
  richF11.stats.gold = 10_000;
  const actions = adapter.enumerateActions(richF11);
  assert.equal(actions.some((action) => action.kind === 'teleport'), false);
  assert.equal(actions.some((action) => action.token === 'D'), false);
  assert.deepEqual(
    actions.filter((action) => action.kind === 'act1-shop-return').map((action) => action.optionId),
    ['atk', 'def', 'hp']
  );
  assert.equal(adapter.continuationPolicy.impossibilityClaimsAllowed, false);
});

test('F15 conversion witness keeps F5 investment before conversion and closes only its later macro branch', () => {
  const adapter = createDemoTwentyFloorConversionWitnessAdapter(createTowerAdapter());
  const bridge = createDemoTwentyFloorBridge({ routeSteps: F10_WITNESS.routeSteps, adapter });
  const ascent = adapter.applyAction(bridge.state, adapter.enumerateActions(bridge.state).find((action) => action.token === 'U'));
  const richF11 = adapter.cloneState(ascent.state);
  richF11.stats.gold = 10_000;
  assert.equal(adapter.enumerateActions(richF11).some((action) => action.kind === 'act1-shop-return'), true);

  const postConversion = adapter.cloneState(richF11);
  postConversion.floor = 15;
  assert.equal(adapter.enumerateActions(postConversion).some((action) => action.kind === 'act1-shop-return'), false);
  assert.equal(adapter.continuationPolicy.impossibilityClaimsAllowed, false);
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

test('F14 guardian ray preserves locks, restores values, and labels its F15 sample as non-publishable', { timeout: 30_000 }, () => {
  const baseline = ENEMIES.arcaneGatekeeper.hp;
  const endpoint = materializeDemoTwentyFloorF14GuardianRay(1, dependencies);
  assert.equal(
    endpoint.find((change) => change.enemyId === 'arcaneGatekeeper' && change.field === 'hp').value,
    DEMO20_F14_GUARDIAN_FEASIBILITY_ENDPOINT.arcaneGatekeeper.hp
  );
  withDemoTwentyFloorF14GuardianRay(1, () => {
    assert.equal(ENEMIES.arcaneGatekeeper.hp, DEMO20_F14_GUARDIAN_FEASIBILITY_ENDPOINT.arcaneGatekeeper.hp);
  }, { ...dependencies, locks });
  assert.equal(ENEMIES.arcaneGatekeeper.hp, baseline);

  const report = scanDemoTwentyFloorF14GuardianRay({
    adapter: createDemoTwentyFloorContinuationAdapter(createTowerAdapter()),
    routeSteps: F10_WITNESS.routeSteps,
    strengths: [1],
    dependencies: { ...dependencies, locks },
    maxExpanded: 3_000,
    maxGenerated: 45_000
  });
  assert.equal(report.publishable, false);
  assert.equal(report.samples[0].reachedF15, true);
  assert.equal(report.leastSoftenedSuccessfulSample.strength, 1);
  assertDemoTwentyFloorSolverLocks(locks, dependencies);
});

test('F17 crown ray is numeric-only, reversible, and can be composed with the F14 bridge probe', () => {
  const baseline = ENEMIES.crownBlade.hp;
  const endpoint = materializeDemoTwentyFloorF17CrownRay(1, dependencies);
  assert.equal(
    endpoint.find((change) => change.enemyId === 'crownBlade' && change.field === 'hp').value,
    DEMO20_F17_CROWN_FEASIBILITY_ENDPOINT.crownBlade.hp
  );
  withDemoTwentyFloorF17CrownRay(1, () => {
    assert.equal(ENEMIES.crownBlade.hp, DEMO20_F17_CROWN_FEASIBILITY_ENDPOINT.crownBlade.hp);
  }, { ...dependencies, locks });
  assert.equal(ENEMIES.crownBlade.hp, baseline);
  assertDemoTwentyFloorSolverLocks(locks, dependencies);
});

test('late-game rays compose without changing authored locks and restore each numeric field', () => {
  const baselineRegent = ENEMIES.echoRegent.hp;
  const baselineCore = ENEMIES.originCore.hp;
  const f19 = materializeDemoTwentyFloorLateGameRay('f19Regent', 1, dependencies);
  assert.equal(f19[0].value, DEMO20_LATE_GAME_FEASIBILITY_ENDPOINTS.f19Regent.echoRegent.hp);
  withDemoTwentyFloorLateGameRays([
    { id: 'f19Regent', strength: 1 },
    { id: 'f20Final', strength: 1 }
  ], () => {
    assert.equal(ENEMIES.echoRegent.hp, DEMO20_LATE_GAME_FEASIBILITY_ENDPOINTS.f19Regent.echoRegent.hp);
    assert.equal(ENEMIES.originCore.hp, DEMO20_LATE_GAME_FEASIBILITY_ENDPOINTS.f20Final.originCore.hp);
  }, { ...dependencies, locks });
  assert.equal(ENEMIES.echoRegent.hp, baselineRegent);
  assert.equal(ENEMIES.originCore.hp, baselineCore);
  assertDemoTwentyFloorSolverLocks(locks, dependencies);
});

test('frozen Act II numeric baseline has an engine-replayed F1-to-F20 victory certificate', { timeout: 30_000 }, () => {
  const planner = createDemoTwentyFloorForwardWitnessAdapter(createTowerAdapter());
  const result = runDemoTwentyFloorMilestones({
    adapter: planner,
    routeSteps: F10_WITNESS.routeSteps,
    milestones: [
      { id: 'f15-arrival', floorIndex: 14, label: '抵达 F15 转换点' },
      { id: 'victory', floorIndex: null, label: '击败起源核心' }
    ],
    maxExpanded: 3_000,
    maxGenerated: 45_000
  });
  assert.equal(result.completed, true);
  const replay = replayTowerStepSkeletonToState(result.routeSteps, {
    adapter: createTowerAdapter(),
    requireGoal: true
  });
  assert.equal(replay.ok, true);
  assert.equal(replay.final.victory, true);
  assert.ok(replay.final.stats.hp > 0);
  assertDemoTwentyFloorSolverLocks(locks, dependencies);
});
