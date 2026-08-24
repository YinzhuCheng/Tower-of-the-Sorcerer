import test from 'node:test';
import assert from 'node:assert/strict';
import { listNumericMutationParameters } from '../src/tuner/numeric-mutation-space.js';
import { screenNumericLevers } from '../src/tuner/numeric-sensitivity-screen.js';
import { searchProtectedPressureRay } from '../src/tuner/numeric-ray-search.js';

function pick(catalogue, key) {
  const found = catalogue.find((entry) => entry.key === key);
  assert.ok(found, `Missing parameter ${key}`);
  return found;
}

test('protected pressure ray evaluates stronger scales without claiming publishability', { timeout: 30_000 }, () => {
  const catalogue = listNumericMutationParameters();
  const parameters = [
    pick(catalogue, 'shop:hp:effect.hp+effect.maxHp'),
    pick(catalogue, 'enemy:whaleSinger:def')
  ];
  const screen = screenNumericLevers({ parameters, staticTopK: 2, probeRelativeStep: 0.10 });
  const candidate = {
    id: 'ray-smoke',
    leverKeys: parameters.map((entry) => entry.key)
  };
  const report = searchProtectedPressureRay({
    screenReport: screen,
    candidate,
    targetMargin: 0.165,
    coarseSteps: [0.10, 0.20],
    refineIterations: 0,
    exactFinal: false
  });

  assert.equal(report.publishable, false);
  assert.equal(report.samples.length, 2);
  assert.ok(report.best);
  assert.equal(report.exactEvaluation, null);
  const bestDistance = Math.min(...report.samples.filter((entry) => entry.solvable).map((entry) => entry.targetDistance));
  assert.equal(report.best.targetDistance, bestDistance);
});
