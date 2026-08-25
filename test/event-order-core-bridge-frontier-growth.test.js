import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeBridgeFrontierDiversity } from '../src/analyzer/event-order-core-bridge-frontier-growth.js';

test('bridge frontier diversity separates purchase strata and card/structural variants', () => {
  const summary = summarizeBridgeFrontierDiversity([
    {
      certificateHash: 'a', shopPurchases: 21, upperBound: 4930,
      resources: { hp: 3912, maxHp: 23740, gold: 1050, sun: 2, moon: 1, star: 1 },
      structuralKeyHash: 's1'
    },
    {
      certificateHash: 'b', shopPurchases: 21, upperBound: 4930,
      resources: { hp: 3912, maxHp: 23740, gold: 1000, sun: 2, moon: 2, star: 1 },
      structuralKeyHash: 's2'
    },
    {
      certificateHash: 'c', shopPurchases: 20, upperBound: 4930,
      resources: { hp: 3762, maxHp: 23590, gold: 1600, sun: 2, moon: 1, star: 1 },
      structuralKeyHash: 's3'
    }
  ]);

  assert.equal(summary.bridgeCount, 3);
  assert.deepEqual(summary.purchaseCounts, [21, 20]);
  assert.equal(summary.purchaseStrataCount, 2);
  assert.equal(summary.uniqueStructuralStates, 3);
  assert.equal(summary.uniqueCardVectors, 2);
  assert.deepEqual(summary.gold, { min: 1000, max: 1600 });
  assert.equal(summary.strata[0].shopPurchases, 21);
  assert.equal(summary.strata[0].count, 2);
  assert.equal(summary.strata[0].uniqueCardVectors, 2);
  assert.equal(summary.strata[1].shopPurchases, 20);
  assert.deepEqual(summary.strata[1].hp, { min: 3762, max: 3762 });
});

test('bridge frontier diversity handles an empty frontier', () => {
  const summary = summarizeBridgeFrontierDiversity([]);
  assert.equal(summary.bridgeCount, 0);
  assert.equal(summary.purchaseStrataCount, 0);
  assert.deepEqual(summary.purchaseCounts, []);
  assert.deepEqual(summary.gold, { min: null, max: null });
});
