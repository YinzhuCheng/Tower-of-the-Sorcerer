import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeTightBoundBridgeScreen } from '../src/analyzer/event-order-core-bridge-tight-bound-screen.js';

test('tight bridge screen summarizes proof-prunable and residual bridges by purchase stratum', () => {
  const entries = [
    { shopPurchases: 21, oldUpperBound: 4930, tightUpperBound: 4580, tightening: 350 },
    { shopPurchases: 21, oldUpperBound: 4729, tightUpperBound: 4440, tightening: 289 },
    { shopPurchases: 20, oldUpperBound: 4930, tightUpperBound: 4500, tightening: 430 },
    { shopPurchases: 20, oldUpperBound: 4800, tightUpperBound: 4400, tightening: 400 }
  ];
  const summary = summarizeTightBoundBridgeScreen(entries, 4459);
  assert.equal(summary.total, 4);
  assert.equal(summary.prunable, 2);
  assert.equal(summary.residual, 2);
  assert.deepEqual(summary.oldUpper, { min: 4729, max: 4930 });
  assert.deepEqual(summary.tightUpper, { min: 4400, max: 4580 });
  assert.equal(summary.byPurchase['21'].total, 2);
  assert.equal(summary.byPurchase['21'].prunable, 1);
  assert.equal(summary.byPurchase['20'].prunable, 1);
});

test('tight bridge screen handles an empty representative set', () => {
  const summary = summarizeTightBoundBridgeScreen([], 4459);
  assert.equal(summary.total, 0);
  assert.equal(summary.prunable, 0);
  assert.deepEqual(summary.tightUpper, { min: null, max: null });
});
