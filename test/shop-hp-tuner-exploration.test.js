import test from 'node:test';
import assert from 'node:assert/strict';
import { dryRunShopHpTuning } from '../src/tuner/shop-hp-tuner.js';

test('protected shop HP tuner ranks authoritative dry-run candidates', { timeout: 60_000 }, () => {
  const report = dryRunShopHpTuning({
    multipliers: [1, 0.8, 0.6, 0.45, 0.3, 0.2, 0.1],
    maxExpanded: 5_000,
    maxGenerated: 50_000
  });

  assert.equal(report.dryRun, true);
  assert.equal(report.baseline, 900);
  assert.equal(report.candidates.length, 7);
  const baseline = report.candidates.find((entry) => entry.value === 900);
  assert.ok(baseline);
  assert.equal(baseline.evaluation.acceptedHardConstraints, true);
  assert.equal(baseline.evaluation.pressure.status, 'too_forgiving');
  assert.ok(report.candidates.some((entry) =>
    entry.evaluation.acceptedHardConstraints
      && entry.evaluation.pressure.minNormalizedHpMargin < baseline.evaluation.pressure.minNormalizedHpMargin
  ));

  console.log(`TOWER_SHOP_HP_TUNER ${JSON.stringify({
    baseline: report.baseline,
    best: report.bestAccepted ? {
      id: report.bestAccepted.id,
      value: report.bestAccepted.value,
      evaluation: report.bestAccepted.evaluation
    } : null,
    candidates: report.candidates.map((entry) => ({
      id: entry.id,
      value: entry.value,
      multiplier: entry.multiplier,
      acceptedHardConstraints: entry.evaluation.acceptedHardConstraints,
      rejection: entry.evaluation.rejection,
      finalHp: entry.evaluation.route?.final?.hp ?? null,
      pressure: entry.evaluation.pressure,
      solver: entry.evaluation.solver,
      objective: entry.evaluation.objective ?? null,
      score: entry.evaluation.score
    }))
  })}`);
});
