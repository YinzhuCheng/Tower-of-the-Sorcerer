import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSinglePurchaseCounterfactuals } from '../src/analyzer/purchase-counterfactuals.js';
import { findBestGreedyIncumbent, verifyGreedyIncumbentWitness } from '../src/solver/tower-incumbent.js';

test('all one-purchase deviations from the representative route replay authoritatively', { timeout: 30_000 }, () => {
  const portfolio = findBestGreedyIncumbent();
  const report = analyzeSinglePurchaseCounterfactuals({ bestEntry: portfolio.best });

  assert.equal(report.baselineTerminalHp, 12_536);
  assert.equal(report.baselinePurchaseCount, 30);
  assert.equal(report.totalMutations, 60);
  assert.equal(report.solvableMutations + report.catastrophicMutations, 60);
  assert.ok(report.recoveryRate >= 0 && report.recoveryRate <= 1);
  assert.ok(report.catastrophicRate >= 0 && report.catastrophicRate <= 1);
  assert.ok(report.highRegretRate >= 0 && report.highRegretRate <= 1);
  assert.equal(report.mostSensitivePurchases.length, 10);

  if (report.bestImprovementWitness) {
    const verification = verifyGreedyIncumbentWitness(report.bestImprovementWitness);
    assert.equal(verification.ok, true);
    assert.ok(verification.value > report.baselineTerminalHp);
  }

  console.log(`TOWER_SINGLE_PURCHASE_PROFILE ${JSON.stringify({
    baselineTerminalHp: report.baselineTerminalHp,
    totalMutations: report.totalMutations,
    solvableMutations: report.solvableMutations,
    catastrophicMutations: report.catastrophicMutations,
    recoveryRate: report.recoveryRate,
    catastrophicRate: report.catastrophicRate,
    highRegretRate: report.highRegretRate,
    medianNormalizedRegret: report.medianNormalizedRegret,
    p90NormalizedRegret: report.p90NormalizedRegret,
    maxNormalizedRegret: report.maxNormalizedRegret,
    improvedMutationCount: report.improvedMutationCount,
    bestMutation: report.bestMutation,
    mostSensitivePurchases: report.mostSensitivePurchases,
    catastrophicExamples: report.catastrophicExamples
  })}`);
});
