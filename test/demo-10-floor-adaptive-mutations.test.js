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
      7: { policyMultiplicity: 8, eventOrderHistoryInflation: null },
      8: { policyMultiplicity: 1, eventOrderHistoryInflation: null },
      9: { policyMultiplicity: 1, eventOrderHistoryInflation: null }
    },
    prunabilityEvidence: {
      routePortfolio: { paretoWidth: 4 },
      boundary: { activeGoalLabels: 4, goalStructuralStates: 4, actionSurfaceStructuralStates: 4 }
    },
    ...overrides
  };
}

test('healthy evidence ignores high policy multiplicity when event-order history is unmeasured', () => {
  const plan = proposeDemoTenFloorAdaptiveMutations(checkpoints(), catalog);
  assert.deepEqual(plan.selectedMutationIds, []);
  assert.deepEqual(plan.issueFloors, []);
  assert.equal(plan.policyMultiplicityIgnored, true);
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

test('measured event-order history inflation can still request reconvergence mutations', () => {
  const data = checkpoints();
  data.floors[9].eventOrderHistoryInflation = 5;
  const plan = proposeDemoTenFloorAdaptiveMutations(data, catalog);
  assert.deepEqual(plan.issueFloors, [9]);
  assert.ok(plan.reasons.includes('event-history-inflated:9'));
  assert.ok(plan.selectedMutationIds.includes('f9-door'));
  assert.ok(plan.selectedMutationIds.includes('cross'));
});

test('unhandled checkpoint floor is reported instead of mutating an unrelated late floor', () => {
  const plan = proposeDemoTenFloorAdaptiveMutations(checkpoints({ oversizedCheckpoints: [7] }), catalog);
  assert.deepEqual(plan.unhandledFloors, [7]);
  assert.deepEqual(plan.selectedMutationIds, []);
});

test('bounded F7 reward/enemy families resolve an F7 checkpoint issue when present', () => {
  const f7Catalog = [
    ...catalog,
    { id: 'f7-reward', kind: 'slot-swap', group: 'f7-reward-mid-stat', floor: 7 },
    { id: 'f7-enemy', kind: 'slot-swap', group: 'f7-enemy-mid', floor: 7 }
  ];
  const plan = proposeDemoTenFloorAdaptiveMutations(
    checkpoints({ oversizedCheckpoints: [7] }),
    f7Catalog
  );
  assert.deepEqual(plan.unhandledFloors, []);
  assert.ok(plan.selectedMutationIds.includes('f7-reward'));
  assert.ok(plan.selectedMutationIds.includes('f7-enemy'));
  assert.equal(plan.productionWriteAllowed, false);
});
