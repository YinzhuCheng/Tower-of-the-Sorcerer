import test from 'node:test';
import assert from 'node:assert/strict';

import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { runGreedyShopStrategy } from '../src/solver/greedy-strategy.js';
import {
  createDemoTenFloorRouteDiscoveryPolicies,
  describeDemoTenFloorRouteFamily,
  demoTenFloorRouteFamilyDistance,
  selectIndependentDemoTenFloorRoutes
} from '../src/solver/demo-10f-route-families.js';

function installFrozenDemo() {
  applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
  applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
  applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
  applyDemoTenFloorHardMode({ enemies: ENEMIES });
}

function attempt(policy, { createTowerAdapter, replayTowerStepSkeleton }) {
  const route = runGreedyShopStrategy({ ...policy, traceActions: true, maxIterations: 8_000 });
  const replay = replayTowerStepSkeleton(route.routeSteps, { adapter: createTowerAdapter(), requireGoal: true });
  return {
    id: `${policy.shopCycle.join('-')}/${policy.holyPolicy}/${policy.progressionPriority}`,
    route,
    replay,
    family: describeDemoTenFloorRouteFamily(route, replay)
  };
}

test('10F route-family discovery explores policies without equating policies to families', () => {
  const policies = createDemoTenFloorRouteDiscoveryPolicies({ maxCycleLength: 3 });
  assert.equal(policies.length, (3 ** 2 + 3 ** 3) * 4 * 2);
  assert.ok(policies.every((policy) => policy.shopCycle.length >= 2));
});

test('frozen 10F certifies three replayed routes with different campaign decisions', async () => {
  installFrozenDemo();
  const { createTowerAdapter } = await import('../src/solver/tower-adapter.js');
  const { replayTowerStepSkeleton } = await import('../src/solver/replay.js');
  const tools = { createTowerAdapter, replayTowerStepSkeleton };
  const attempts = [
    attempt({ shopCycle: ['atk', 'hp', 'hp'], holyPolicy: 'immediate', progressionPriority: 'guardian-first' }, tools),
    attempt({ shopCycle: ['atk', 'hp', 'atk'], holyPolicy: 'after-core-7', progressionPriority: 'legacy-clear' }, tools),
    attempt({ shopCycle: ['hp', 'atk'], holyPolicy: 'before-final', progressionPriority: 'guardian-first' }, tools)
  ];
  assert.ok(attempts.every((entry) => entry.route.solvable && entry.replay.ok));
  assert.deepEqual(attempts.map((entry) => entry.family.decisions.f8Vault), [false, true, false]);
  assert.deepEqual(attempts.map((entry) => entry.family.decisions.holyTiming), ['early', 'late', 'late']);
  assert.deepEqual(attempts.map((entry) => entry.family.decisions.shopStyle), ['vitality', 'assault', 'hybrid']);
  assert.ok(demoTenFloorRouteFamilyDistance(attempts[0].family, attempts[1].family) >= 3);
  assert.ok(demoTenFloorRouteFamilyDistance(attempts[1].family, attempts[2].family) >= 2);

  const selection = selectIndependentDemoTenFloorRoutes(attempts, { targetFamilies: 3, minDistance: 2 });
  assert.equal(selection.complete, true);
  assert.equal(selection.selected.length, 3);
});
