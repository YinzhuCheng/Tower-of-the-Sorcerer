import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRESSURE_TARGET_MIDPOINT,
  deriveFinalMagicPower,
  predictedFinalMargin
} from '../src/tuner/final-pressure-tuner.js';

test('final-magic derivation targets the requested protected margin', () => {
  const derived = deriveFinalMagicPower({
    hpBefore: 12_523,
    counterAttacks: 51,
    ward: true,
    targetMargin: PRESSURE_TARGET_MIDPOINT
  });
  assert.equal(derived.winnable, true);
  assert.ok(Math.abs(derived.normalizedHpMargin - PRESSURE_TARGET_MIDPOINT) < 0.01);
  assert.ok(derived.magicPower > 164);

  const recomputed = predictedFinalMargin({
    hpBefore: 12_523,
    counterAttacks: 51,
    magicPower: derived.magicPower,
    ward: true
  });
  assert.equal(recomputed.totalDamage, derived.totalDamage);
  assert.equal(recomputed.normalizedHpMargin, derived.normalizedHpMargin);
});

test('higher magic power monotonically reduces final HP margin with fixed rounds', () => {
  const low = predictedFinalMargin({ hpBefore: 20_000, counterAttacks: 40, magicPower: 164, ward: true });
  const high = predictedFinalMargin({ hpBefore: 20_000, counterAttacks: 40, magicPower: 260, ward: true });
  assert.ok(high.totalDamage > low.totalDamage);
  assert.ok(high.normalizedHpMargin < low.normalizedHpMargin);
});
