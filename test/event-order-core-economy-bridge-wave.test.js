import test from 'node:test';
import assert from 'node:assert/strict';
import { selectPurchaseLagBridge } from '../src/analyzer/event-order-core-economy-bridge-wave.js';

test('purchase-lag selector chooses the nearest lower purchase stratum instead of another high-progress bridge', () => {
  const bridges = [
    { id: 'p21-a', shopPurchases: 21, upperBound: 4930, resources: { hp: 3912, gold: 1100 } },
    { id: 'p21-b', shopPurchases: 21, upperBound: 4930, resources: { hp: 3912, gold: 1000 } },
    { id: 'p20-low', shopPurchases: 20, upperBound: 4930, resources: { hp: 3762, gold: 1300 } },
    { id: 'p20-high', shopPurchases: 20, upperBound: 4930, resources: { hp: 3762, gold: 1600 } }
  ];
  assert.equal(selectPurchaseLagBridge(bridges).id, 'p20-high');
});

test('purchase-lag selector chooses one stratum behind maximum even when older strata exist', () => {
  const bridges = [
    { id: 'p22', shopPurchases: 22, upperBound: 4900, resources: { hp: 4000, gold: 800 } },
    { id: 'p21', shopPurchases: 21, upperBound: 4890, resources: { hp: 3900, gold: 1200 } },
    { id: 'p19', shopPurchases: 19, upperBound: 5000, resources: { hp: 3500, gold: 2500 } }
  ];
  assert.equal(selectPurchaseLagBridge(bridges).id, 'p21');
});

test('purchase-lag selector falls back to the strongest bridge when only one purchase stratum exists', () => {
  const bridges = [
    { id: 'low', shopPurchases: 21, upperBound: 4930, resources: { hp: 3912, gold: 1000 } },
    { id: 'high', shopPurchases: 21, upperBound: 4930, resources: { hp: 3912, gold: 1200 } }
  ];
  assert.equal(selectPurchaseLagBridge(bridges).id, 'high');
});

test('purchase-lag selector handles an empty family', () => {
  assert.equal(selectPurchaseLagBridge([]), null);
});
