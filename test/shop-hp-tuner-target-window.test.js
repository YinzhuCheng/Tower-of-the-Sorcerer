import test from 'node:test';
import assert from 'node:assert/strict';
import { runGreedyShopStrategy } from '../src/solver/greedy-strategy.js';
import { PROMOTED_PURCHASE_PLANS } from '../src/solver/tower-incumbent.js';
import { withBalanceEdits } from '../src/tuner/balance-overlay.js';

function replay(value) {
  const plan = PROMOTED_PURCHASE_PLANS[0];
  assert.ok(plan, 'promoted purchase plan is required');
  return withBalanceEdits([
    { target: 'shop', id: 'hp', field: 'effect.hp', value },
    { target: 'shop', id: 'hp', field: 'effect.maxHp', value }
  ], () => runGreedyShopStrategy({
    shopCycle: [...plan.cycle],
    shopPlan: [...plan.shopPlan],
    holyPolicy: plan.holyPolicy
  }));
}

test('HP-only tuning remains insufficient even after reducing shop reward to 90', () => {
  const hp270 = replay(270);
  const hp90 = replay(90);

  assert.equal(hp270.solvable, true);
  assert.equal(hp90.solvable, true);
  assert.ok(hp270.minNormalizedHpMargin > 0.25);
  assert.ok(hp90.minNormalizedHpMargin > 0.25);
  assert.ok(hp90.minNormalizedHpMargin < hp270.minNormalizedHpMargin);
  assert.ok(hp90.final.hp < hp270.final.hp);
});
