import test from 'node:test';
import assert from 'node:assert/strict';
import { proposeProofFriendlyMutations } from '../src/tuner/proof-friendly-mutations.js';

function ids(suggestions) {
  return new Set(suggestions.map((entry) => entry.id));
}

test('proof-hostile event-order evidence proposes convergence, travel and bound mutations', () => {
  const suggestions = proposeProofFriendlyMutations({
    search: {
      expandedStates: 3_000,
      maxExpanded: 3_000,
      generatedStates: 22_000,
      maxGenerated: 50_000,
      prunedBound: 0,
      prunedDominated: 100
    },
    boundary: {
      activeGoalLabels: 512,
      goalStructuralStates: 512,
      actionSurfaceStructuralStates: 12
    },
    bridge: { residual: 184, boundClosed: 0 },
    suffix: { travelRatio: 0.70 },
    routePortfolio: { paretoWidth: 64, nearTieCount: 20 },
    purchaseTiming: { deferredAffordablePurchases: 2 }
  });
  const found = ids(suggestions);
  assert.equal(found.has('checkpoint-reconvergence'), true);
  assert.equal(found.has('reduce-cross-floor-permutation'), true);
  assert.equal(found.has('tighten-optimistic-slack-by-design'), true);
  assert.equal(found.has('separate-near-tie-branches'), true);
  assert.equal(found.has('break-objective-near-ties'), true);
  assert.equal(found.has('checkpoint-shop-timing'), true);
});

test('small proof-friendly portfolio does not request destructive simplification', () => {
  const suggestions = proposeProofFriendlyMutations({
    search: {
      expandedStates: 500,
      maxExpanded: 10_000,
      generatedStates: 2_000,
      maxGenerated: 50_000,
      prunedBound: 100,
      prunedDominated: 500
    },
    boundary: {
      activeGoalLabels: 4,
      goalStructuralStates: 6,
      actionSurfaceStructuralStates: 4
    },
    bridge: { residual: 2, boundClosed: 10 },
    suffix: { travelRatio: 0.20 },
    routePortfolio: { paretoWidth: 4, nearTieCount: 2 },
    purchaseTiming: { deferredAffordablePurchases: 0 }
  });
  assert.equal(suggestions.some((entry) => entry.id === 'checkpoint-reconvergence'), false);
  assert.equal(suggestions.some((entry) => entry.id === 'reduce-cross-floor-permutation'), false);
  assert.equal(suggestions.some((entry) => entry.id === 'separate-near-tie-branches'), false);
});
