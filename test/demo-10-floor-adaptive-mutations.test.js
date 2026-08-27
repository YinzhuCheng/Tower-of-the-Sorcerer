import test from 'node:test';
import assert from 'node:assert/strict';
import { proposeDemoTenFloorAdaptiveMutations } from '../src/tuner/demo-10-floor-adaptive-mutations.js';

const catalog = [
  { id: 'f8-pressure', kind: 'enemy-delta', group: 'f8-pressure' },
  { id: 'f8-rune', kind: 'slot-swap', group: 'f8-rune-placement', floor: 8 },
  { id: 'f9-door', kind: 'slot-swap', group: 'f9-door-colors', floor: 9 },
  { id: 'cross', kind: 'cross-floor-swap', group: 'cross-card-timing', a: { floor: 8 }, b: { floor: 9 } }
];

function checkpoints(overrides = {}) {
  return {
    choiceTargetFloors: [7, 8, 9],
    oversizedCheckpoints: [],
    collapsedCheckpoints: [],
    floors: {
      7: { historyInflation: 1 },
      8: { historyInflation: 1 },
      9: { historyInflation: 1 }
    },
    prunabilityEvidence: {
      routePortfolio: { paretoWidth: 4 },
      boundary: { activeGoalLabels: 4, goalStructuralStates: 4, actionSurfaceStructuralStates: 4 }
    },
    ...overrides
  };
}

test('healthy 10F checkpoint evidence is allowed to request no setter mutation', () => {
  const plan = proposeDemoTenFloorAdaptiveMutations(checkpoints(), catalog);
  assert.deepEqual(plan.selectedMutationIds, []);
  assert.deepEqual(plan.issueFloors, []);
  assert.equal(plan.productionWriteAllowed, false);
});

test('oversized F9 checkpoint selects relevant pressure/door/timing families only', () => {
  const plan = proposeDemoTenFloorAdaptiveMutations(checkpoints({
    oversizedCheckpoints: [9],
    prunabilityEvidence: {
      routePortfolio: { paretoWidth: 12 },
      boundary: { activeGoalLabels: 12, goalStructuralStates: 12, actionSurfaceStructuralStates: 12 }
    }
  }), catalog);
  assert.ok(plan.selectedMutationIds.includes('f9-door'));
  assert.ok(plan.selectedMutationIds.includes('cross'));
  assert.ok(!plan.selectedMutationIds.includes('f8-rune'));
});

test('unhandled checkpoint floor is reported instead of mutating an unrelated late floor', () => {
  const plan = proposeDemoTenFloorAdaptiveMutations(checkpoints({ oversizedCheckpoints: [7] }), catalog);
  assert.deepEqual(plan.unhandledFloors, [7]);
  assert.deepEqual(plan.selectedMutationIds, []);
});
