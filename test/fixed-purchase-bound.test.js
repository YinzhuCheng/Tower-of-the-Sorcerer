import test from 'node:test';
import assert from 'node:assert/strict';
import { runGreedyShopStrategy } from '../src/solver/greedy-strategy.js';
import { fixedPurchaseOptionAt } from '../src/solver/fixed-purchase-policy-adapter.js';
import { createTowerAdapter } from '../src/solver/tower-adapter.js';
import {
  optimisticFixedPurchaseTerminalHpUpperBound,
  optimisticTerminalHpUpperBound
} from '../src/solver/tower-bounds.js';
import { withBalanceEdits } from '../src/tuner/balance-overlay.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../src/tuner/review-candidates.js';

function fixedBound(base, state, policy) {
  return optimisticFixedPurchaseTerminalHpUpperBound(
    base,
    state,
    (purchaseIndex) => fixedPurchaseOptionAt(purchaseIndex, policy)
  );
}

test('fixed purchase upper bound is no looser than unrestricted future purchase allocation', () => {
  const candidate = cloneReviewCandidate(REVIEW_CANDIDATES.distributedPressureV1);
  const base = createTowerAdapter();
  const state = base.createInitialState();

  withBalanceEdits(candidate.edits, () => {
    const generic = optimisticTerminalHpUpperBound(base, state);
    const fixed = fixedBound(base, state, candidate.purchasePolicy);
    assert.ok(fixed <= generic, `expected fixed bound ${fixed} <= generic bound ${generic}`);
  });
});

test('fixed purchase upper bound stays above the authoritative review-ready route', () => {
  const candidate = cloneReviewCandidate(REVIEW_CANDIDATES.distributedPressureV1);
  const base = createTowerAdapter();
  const state = base.createInitialState();

  withBalanceEdits(candidate.edits, () => {
    const route = runGreedyShopStrategy({
      shopCycle: [...candidate.purchasePolicy.shopCycle],
      shopPlan: [...candidate.purchasePolicy.shopPlan],
      holyPolicy: candidate.purchasePolicy.referenceHolyPolicy
    });
    assert.equal(route.solvable, true);
    assert.equal(route.final.hp, candidate.expectedEvidence.terminalHp);

    const upper = fixedBound(base, state, candidate.purchasePolicy);
    assert.ok(
      upper >= route.final.hp,
      `admissible fixed-policy bound ${upper} must cover replayed route ${route.final.hp}`
    );
  });
});

test('fixed purchase upper bound reads current shop HP overlay values', () => {
  const candidate = cloneReviewCandidate(REVIEW_CANDIDATES.distributedPressureV1);
  const base = createTowerAdapter();
  const state = base.createInitialState();

  const low = withBalanceEdits([
    { target: 'shop', id: 'hp', field: 'effect.hp', value: 100 },
    { target: 'shop', id: 'hp', field: 'effect.maxHp', value: 100 }
  ], () => fixedBound(base, state, candidate.purchasePolicy));

  const high = withBalanceEdits([
    { target: 'shop', id: 'hp', field: 'effect.hp', value: 1_200 },
    { target: 'shop', id: 'hp', field: 'effect.maxHp', value: 1_200 }
  ], () => fixedBound(base, state, candidate.purchasePolicy));

  assert.ok(high > low, `expected higher HP overlay to raise fixed bound: ${high} > ${low}`);
});
