import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeTightFilteredBridges } from '../src/analyzer/event-order-core-transition-tight-filter.js';

test('c6 screen summary distinguishes tight-bound closed and residual prefixes', () => {
  const entries = [
    { shopPurchases: 16, oldUpperBound: 5569, tightUpperBound: 4400, boundProof: { provesNoExploit: true, tightening: 1169 } },
    { shopPurchases: 16, oldUpperBound: 5569, tightUpperBound: 4700, boundProof: { provesNoExploit: false, tightening: 869 } }
  ];
  const summary = summarizeTightFilteredBridges(entries, 4459);
  assert.equal(summary.total, 2);
  assert.equal(summary.boundClosed, 1);
  assert.equal(summary.residual, 1);
  assert.equal(summary.byPurchase['16'].boundClosed, 1);
});
