import test from 'node:test';
import assert from 'node:assert/strict';
import { createFixedPurchasePolicyTowerAdapter } from '../src/solver/fixed-purchase-policy-adapter.js';
import { proveFixedPurchaseBridgeBelowThreshold } from '../src/solver/fixed-purchase-bridge-tight-bound.js';

test('bridge tight-bound proof never exceeds the existing admissible fixed-purchase bound', () => {
  const policy = {
    shopPlan: ['def', 'atk', 'hp'],
    shopCycle: ['def', 'atk', 'hp']
  };
  const adapter = createFixedPurchasePolicyTowerAdapter(policy);
  const state = adapter.createInitialState();
  const proof = proveFixedPurchaseBridgeBelowThreshold({
    adapter,
    state,
    threshold: 0,
    ...policy
  });
  assert.equal(proof.soundOverApproximation, true);
  assert.ok(proof.tightUpperBound <= proof.oldUpperBound);
  assert.equal(proof.provesNoExploit, false);
});

test('bridge tight-bound proof closes exactly the strict-greater-than question when tight UB is at threshold', () => {
  const policy = {
    shopPlan: ['def', 'atk', 'hp'],
    shopCycle: ['def', 'atk', 'hp']
  };
  const adapter = createFixedPurchasePolicyTowerAdapter(policy);
  const state = adapter.createInitialState();
  const open = proveFixedPurchaseBridgeBelowThreshold({ adapter, state, threshold: 0, ...policy });
  const closed = proveFixedPurchaseBridgeBelowThreshold({
    adapter,
    state,
    threshold: open.tightUpperBound,
    ...policy
  });
  assert.equal(closed.provesNoExploit, true);
  assert.ok(closed.tightUpperBound <= closed.threshold.strictGreaterThan);
});

test('bridge tight-bound proof does not close when even the tightened UB remains above threshold', () => {
  const policy = {
    shopPlan: ['def', 'atk', 'hp'],
    shopCycle: ['def', 'atk', 'hp']
  };
  const adapter = createFixedPurchasePolicyTowerAdapter(policy);
  const state = adapter.createInitialState();
  const base = proveFixedPurchaseBridgeBelowThreshold({ adapter, state, threshold: 0, ...policy });
  const threshold = base.tightUpperBound - 1;
  const result = proveFixedPurchaseBridgeBelowThreshold({ adapter, state, threshold, ...policy });
  assert.equal(result.provesNoExploit, false);
  assert.ok(result.tightUpperBound > threshold);
});
