import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIFFICULTY_TARGETS,
  analyzeDifficulty,
  portfolioRouteDistance,
  quantile
} from '../src/analyzer/difficulty.js';
import { findBestGreedyIncumbent } from '../src/solver/tower-incumbent.js';

test('difficulty math helpers are deterministic and bounded', () => {
  assert.equal(quantile([0, 10, 20, 30], 0.5), 15);
  assert.equal(quantile([], 0.5), null);

  const makeEntry = (sequence, cores, purchases) => ({
    result: {
      purchaseLog: sequence.map((optionId) => ({ optionId })),
      holyAcquisition: { cores, purchases },
      purchases: sequence.length
    }
  });
  const a = makeEntry(['atk', 'def', 'hp'], 5, 1);
  const b = makeEntry(['atk', 'hp', 'def'], 7, 3);
  const distance = portfolioRouteDistance(a, b);
  assert.ok(distance > 0 && distance <= 1);
  assert.deepEqual(DIFFICULTY_TARGETS.minNormalizedHpMargin, [0.08, 0.25]);
});

test('authoritative portfolio produces a provisional P/R/W/T/F/V/C difficulty report', { timeout: 20_000 }, () => {
  const portfolio = findBestGreedyIncumbent();
  const report = analyzeDifficulty({ portfolio });

  assert.equal(report.provisional, true);
  assert.equal(report.representative.strategyId, 'def-atk-hp');
  assert.equal(report.representative.terminalHp, 12_536);

  assert.equal(report.dimensions.P.confidence, 'authoritative-representative-route');
  assert.equal(report.dimensions.P.battleCount, 72);
  assert.ok(report.dimensions.P.minNormalizedHpMargin >= 0);
  assert.equal(report.dimensions.P.byFloor.length, 8);
  assert.ok(report.dimensions.P.tightestBattle?.enemyId);

  assert.equal(report.dimensions.R.exactActionRegret, false);
  assert.equal(report.dimensions.R.attemptedStrategies, 36);
  assert.ok(report.dimensions.R.feasibleStrategies >= 8);
  assert.ok(report.dimensions.R.catastrophicStrategyRate >= 0 && report.dimensions.R.catastrophicStrategyRate <= 1);

  assert.equal(report.dimensions.V.exactNearOptimalDag, false);
  assert.ok(report.dimensions.V.effectiveStrategyCount >= 1);
  assert.ok(report.dimensions.W.epsilonGoodStrategyCount >= 1);

  assert.equal(report.dimensions.F.exactSingleErrorRecovery, false);
  assert.ok(report.dimensions.F.policyRecoveryRate >= 0 && report.dimensions.F.policyRecoveryRate <= 1);

  assert.equal(report.dimensions.K.measured, false);
  assert.equal(report.dimensions.C.measured, false);
  assert.ok(Number.isFinite(report.provisionalLoss.total));
  assert.ok(Array.isArray(report.diagnostics));

  console.log(`TOWER_DIFFICULTY_PROFILE ${JSON.stringify({
    representative: report.representative,
    P: {
      minNormalizedHpMargin: report.dimensions.P.minNormalizedHpMargin,
      p10NormalizedHpMargin: report.dimensions.P.p10NormalizedHpMargin,
      minAtkMargin: report.dimensions.P.minAtkMargin,
      minDefMargin: report.dimensions.P.minDefMargin,
      minGoldSlack: report.dimensions.P.minGoldSlack,
      tightestBattle: report.dimensions.P.tightestBattle,
      status: report.dimensions.P.status
    },
    R: {
      catastrophicStrategyRate: report.dimensions.R.catastrophicStrategyRate,
      highRegretStrategyRate: report.dimensions.R.highRegretStrategyRate,
      bestVsSecondGap: report.dimensions.R.bestVsSecondGap,
      topHolySensitivity: report.dimensions.R.holyTimingSensitivity[0]
    },
    W: report.dimensions.W,
    F: report.dimensions.F,
    V: {
      nearOptimalStrategyCount: report.dimensions.V.nearOptimalStrategyCount,
      effectiveStrategyCount: report.dimensions.V.effectiveStrategyCount,
      minNearOptimalRouteDistance: report.dimensions.V.minNearOptimalRouteDistance,
      meanNearOptimalRouteDistance: report.dimensions.V.meanNearOptimalRouteDistance
    },
    diagnostics: report.diagnostics,
    provisionalLoss: report.provisionalLoss
  })}`);
});
