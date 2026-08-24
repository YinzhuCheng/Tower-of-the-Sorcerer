import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateProtectedBalanceCandidate } from '../src/tuner/numeric-evaluator.js';

function evaluate(value) {
  return evaluateProtectedBalanceCandidate({
    id: `shop-hp-window-${value}`,
    edits: [
      { target: 'shop', id: 'hp', field: 'effect.hp', value },
      { target: 'shop', id: 'hp', field: 'effect.maxHp', value }
    ],
    maxExpanded: 5_000,
    maxGenerated: 50_000
  });
}

test('shop HP 270 reaches the protected pressure target while 180 is no safer', { timeout: 30_000 }, () => {
  const target = evaluate(270);
  assert.equal(target.acceptedHardConstraints, true, target.failure ?? target.rejection ?? '270 must remain solvable');
  assert.equal(target.pressure.status, 'target');
  assert.ok(target.pressure.minNormalizedHpMargin >= 0.08);
  assert.ok(target.pressure.minNormalizedHpMargin <= 0.25);
  assert.equal(target.solver.solvable, true);
  assert.equal(target.solver.exact, true);

  const harder = evaluate(180);
  if (harder.acceptedHardConstraints) {
    assert.ok(harder.pressure.minNormalizedHpMargin <= target.pressure.minNormalizedHpMargin);
  } else {
    assert.ok(['protected_route_failed', 'existence_not_proven'].includes(harder.rejection));
  }

  console.log(`TOWER_SHOP_HP_TARGET_WINDOW ${JSON.stringify({
    target: {
      value: 270,
      hard: target.acceptedHardConstraints,
      finalHp: target.route.final.hp,
      pressure: target.pressure,
      solver: target.solver,
      objective: target.objective
    },
    harder: {
      value: 180,
      hard: harder.acceptedHardConstraints,
      rejection: harder.rejection,
      failure: harder.failure ?? null,
      finalHp: harder.route?.final?.hp ?? null,
      pressure: harder.pressure,
      solver: harder.solver ?? null,
      objective: harder.objective ?? null
    }
  })}`);
});
