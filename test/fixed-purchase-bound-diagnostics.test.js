import test from 'node:test';
import assert from 'node:assert/strict';
import { selectBoundDiagnosticBridges } from '../src/analyzer/event-order-core-bridge-bound-diagnostics.js';
import { createFixedPurchasePolicyTowerAdapter } from '../src/solver/fixed-purchase-policy-adapter.js';
import { explainFixedPurchaseTerminalHpUpperBound } from '../src/solver/fixed-purchase-bound-diagnostics.js';

test('fixed-purchase bound explanation exactly matches the proof adapter on a real Tower state', () => {
  const policy = {
    shopPlan: ['def', 'atk', 'hp'],
    shopCycle: ['def', 'atk', 'hp']
  };
  const adapter = createFixedPurchasePolicyTowerAdapter(policy);
  const state = adapter.createInitialState();
  const report = explainFixedPurchaseTerminalHpUpperBound({
    adapter,
    state,
    ...policy
  });
  assert.equal(report.exactMatch, true);
  assert.equal(report.explainedUpperBound, adapter.objectiveUpperBound(state));
  assert.ok(report.scenarios.length > 0);
  assert.equal(report.best.upperBound, report.explainedUpperBound);
  assert.ok(report.relaxation.remainingEnemyCount > 0);
});

test('bound diagnostic bridge selector covers upper-bound, card-rich and purchase-lag roles without duplicates', () => {
  const bridges = [
    { id: 'max', shopPurchases: 21, upperBound: 4930, resources: { hp: 3912, gold: 1100, sun: 4, moon: 4, star: 1 } },
    { id: 'min', shopPurchases: 21, upperBound: 4729, resources: { hp: 3622, gold: 1300, sun: 4, moon: 4, star: 3 } },
    { id: 'cards', shopPurchases: 21, upperBound: 4800, resources: { hp: 3700, gold: 1200, sun: 5, moon: 6, star: 4 } },
    { id: 'p20', shopPurchases: 20, upperBound: 4930, resources: { hp: 3762, gold: 1646, sun: 5, moon: 5, star: 4 } }
  ];
  const selected = selectBoundDiagnosticBridges(bridges);
  assert.deepEqual(selected.map((entry) => entry.role), [
    'p21-max-upper',
    'p21-min-upper',
    'p21-card-rich',
    'p20-high-gold'
  ]);
  assert.deepEqual(selected.map((entry) => entry.bridge.id), ['max', 'min', 'cards', 'p20']);
});

test('bound diagnostic selector deduplicates roles that resolve to the same bridge', () => {
  const bridges = [
    { id: 'one', shopPurchases: 21, upperBound: 4930, resources: { hp: 3912, gold: 1100, sun: 5, moon: 6, star: 4 } },
    { id: 'p20', shopPurchases: 20, upperBound: 4930, resources: { hp: 3762, gold: 1600, sun: 4, moon: 4, star: 3 } }
  ];
  const selected = selectBoundDiagnosticBridges(bridges);
  assert.deepEqual(selected.map((entry) => entry.bridge.id), ['one', 'p20']);
});
