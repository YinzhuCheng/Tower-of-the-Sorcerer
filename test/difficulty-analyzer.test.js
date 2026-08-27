import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIFFICULTY_TARGETS,
  portfolioRouteDistance,
  quantile
} from '../src/analyzer/difficulty.js';
import { analyzeDifficultyV2 } from '../src/analyzer/difficulty-v2.js';
import { analyzeSinglePurchaseCounterfactuals } from '../src/analyzer/purchase-counterfactuals.js';
import { findBestGreedyIncumbent, findBestKnownIncumbent } from '../src/solver/tower-incumbent.js';

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

test('difficulty v2 uses best-known pressure and exact single-purchase counterfactuals', { timeout: 30_000 }, () => {
  const portfolio = findBestGreedyIncumbent();
  const known = findBestKnownIncumbent({ portfolio });
  const counterfactuals = analyzeSinglePurchaseCounterfactuals({ bestEntry: known.best });
  const report = analyzeDifficultyV2({
    portfolio,
    representativeEntry: known.best,
    counterfactuals
  });

  assert.equal(report.schemaVersion, 2);
  assert.equal(report.model, 'tower-difficulty-hybrid-v0.2');
  assert.equal(report.provisional, true);
  assert.equal(report.representative.strategyId, 'purchase-1opt-v1');
  assert.equal(report.representative.terminalHp, 26_041);
  assert.equal(report.representative.exactGlobalOptimal, false);

  assert.equal(report.dimensions.P.confidence, 'authoritative-best-known-route');
  assert.equal(report.dimensions.P.battleCount, 72);
  assert.ok(report.dimensions.P.minNormalizedHpMargin >= 0);
  assert.equal(report.dimensions.P.byFloor.length, 8);
  assert.ok(report.dimensions.P.tightestBattle?.enemyId);

  assert.equal(report.dimensions.R.confidence, 'authoritative-single-purchase-counterfactual');
  assert.equal(report.dimensions.R.exactActionRegret, false);
  assert.equal(report.dimensions.R.exactSinglePurchaseRegret, true);
  assert.equal(report.dimensions.R.testedMutations, 60);
  assert.equal(report.dimensions.R.locallyOneOptimal, true);
  assert.equal(report.dimensions.R.improvedMutationCount, 0);

  assert.equal(report.dimensions.T.exactSinglePurchaseCatastrophicRate, true);
  assert.equal(report.dimensions.F.exactSinglePurchaseRecovery, true);
  assert.ok(report.dimensions.F.policyRecoveryRate >= 0 && report.dimensions.F.policyRecoveryRate <= 1);

  // The old 36-policy portfolio tops out at 12,536, far below the promoted
  // 26,041 plan. It remains useful as a broad policy-family sample, but cannot
  // honestly be called a near-optimal W/V sample anymore.
  assert.equal(report.dimensions.V.coverageSufficientForNearOptimalClaims, false);
  assert.ok(report.dimensions.V.bestKnownCoverageRatio < 0.90);
  assert.equal(report.dimensions.W.coverageSufficientForNearOptimalClaims, false);
  assert.ok(report.provisionalLoss.excluded.strategyCount);
  assert.ok(report.provisionalLoss.excluded.routeDistance);

  assert.equal(report.dimensions.K.measured, false);
  assert.equal(report.dimensions.C.measured, false);
  assert.ok(Number.isFinite(report.provisionalLoss.total));
  assert.ok(report.diagnostics.some((entry) => entry.code === 'near_optimal_coverage_insufficient'));

  console.log(`TOWER_DIFFICULTY_V2_PROFILE ${JSON.stringify({
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
      highRegretStrategyRate: report.dimensions.R.highRegretStrategyRate,
      medianNormalizedRegret: report.dimensions.R.medianNormalizedRegret,
      p90NormalizedRegret: report.dimensions.R.p90NormalizedRegret,
      maxNormalizedRegret: report.dimensions.R.maxNormalizedRegret,
      locallyOneOptimal: report.dimensions.R.locallyOneOptimal,
      mostSensitivePurchases: report.dimensions.R.mostSensitivePurchases.slice(0, 5)
    },
    T: report.dimensions.T,
    F: report.dimensions.F,
    W: {
      effectiveStrategyCount: report.dimensions.W.effectiveStrategyCount,
      bestKnownCoverageRatio: report.dimensions.W.bestKnownCoverageRatio,
      coverageSufficient: report.dimensions.W.coverageSufficientForNearOptimalClaims
    },
    V: {
      nearOptimalStrategyCount: report.dimensions.V.nearOptimalStrategyCount,
      minNearOptimalRouteDistance: report.dimensions.V.minNearOptimalRouteDistance,
      bestKnownCoverageRatio: report.dimensions.V.bestKnownCoverageRatio,
      coverageSufficient: report.dimensions.V.coverageSufficientForNearOptimalClaims
    },
    diagnostics: report.diagnostics,
    provisionalLoss: report.provisionalLoss
  })}`);
});
