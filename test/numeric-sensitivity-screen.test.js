import test from 'node:test';
import assert from 'node:assert/strict';
import { listNumericMutationParameters } from '../src/tuner/numeric-mutation-space.js';
import { screenNumericLevers } from '../src/tuner/numeric-sensitivity-screen.js';

function pick(parameters, key) {
  const found = parameters.find((entry) => entry.key === key);
  assert.ok(found, `Missing numeric parameter: ${key}`);
  return found;
}

test('finite-difference screen probes only shortlisted authoritative numeric levers', { timeout: 30_000 }, () => {
  const catalogue = listNumericMutationParameters();
  const parameters = [
    pick(catalogue, 'shop:hp:effect.hp+effect.maxHp'),
    pick(catalogue, 'enemy:voidCore:magicPower')
  ];
  const report = screenNumericLevers({
    parameters,
    staticTopK: 2,
    probeRelativeStep: 0.10
  });

  assert.equal(report.publishable, false);
  assert.equal(report.catalogueSize, 2);
  assert.equal(report.probes.length, 2);
  assert.ok(report.traceRanking.every((entry) => entry.traceScore > 0));

  for (const probe of report.probes) {
    assert.ok(probe.mutation);
    if (probe.routeSolvable) {
      assert.ok(
        probe.mutated.minNormalizedHpMargin <= report.baseline.minNormalizedHpMargin + 1e-12,
        `${probe.parameter.key} should not make the protected route easier in the harder direction`
      );
    } else {
      assert.equal(probe.cliffAtProbe, true);
    }
  }
});
