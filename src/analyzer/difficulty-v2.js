import { DIFFICULTY_TARGETS, analyzeDifficulty, quantile } from './difficulty.js';

function finite(values) {
  return values.filter(Number.isFinite);
}

function mean(values) {
  const filtered = finite(values);
  return filtered.length ? filtered.reduce((sum, value) => sum + value, 0) / filtered.length : null;
}

function strategyId(entry) {
  return entry?.id ?? entry?.baseId ?? 'unnamed';
}

function distanceToBand(value, [low, high]) {
  if (!Number.isFinite(value)) return 0;
  const scale = Math.max(1e-9, high - low);
  if (value < low) return (low - value) / scale;
  if (value > high) return (value - high) / scale;
  return 0;
}

function distanceToMinimum(value, minimum) {
  if (!Number.isFinite(value) || value >= minimum) return 0;
  return (minimum - value) / Math.max(1e-9, minimum);
}

function distanceToMaximum(value, maximum) {
  if (!Number.isFinite(value) || value <= maximum) return 0;
  return (value - maximum) / Math.max(1e-9, maximum);
}

function bandStatus(value, [low, high]) {
  if (!Number.isFinite(value)) return 'unknown';
  if (value < low) return 'too_harsh';
  if (value > high) return 'too_forgiving';
  return 'target';
}

function pressureByFloor(battles) {
  const groups = new Map();
  for (const battle of battles) {
    const group = groups.get(battle.floor) ?? [];
    group.push(battle);
    groups.set(battle.floor, group);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([floor, entries]) => {
      const margins = entries.map((entry) => entry.normalizedHpMargin);
      const tightest = [...entries].sort((a, b) => a.normalizedHpMargin - b.normalizedHpMargin)[0] ?? null;
      return {
        floor,
        battles: entries.length,
        minNormalizedHpMargin: margins.length ? Math.min(...margins) : null,
        p10NormalizedHpMargin: quantile(margins, 0.10),
        meanDamageRatio: mean(entries.map((entry) => entry.battle.totalDamage / Math.max(1, entry.statsBefore.hp))),
        tightestBattle: tightest ? {
          enemyId: tightest.enemyId,
          enemyName: tightest.enemyName,
          normalizedHpMargin: tightest.normalizedHpMargin,
          totalDamage: tightest.battle.totalDamage,
          hpBefore: tightest.statsBefore.hp
        } : null
      };
    });
}

function analyzeRepresentativePressure(representativeEntry) {
  const result = representativeEntry?.result;
  const battles = result?.battleLog ?? [];
  const purchases = result?.purchaseLog ?? [];
  const margins = battles.map((entry) => entry.normalizedHpMargin);
  const tightestBattle = [...battles].sort((a, b) => a.normalizedHpMargin - b.normalizedHpMargin)[0] ?? null;
  const tightestPurchase = [...purchases].sort((a, b) => a.goldSlack - b.goldSlack)[0] ?? null;
  const minMargin = margins.length ? Math.min(...margins) : null;

  return {
    confidence: 'authoritative-best-known-route',
    measured: battles.length > 0,
    exactGlobalOptimalRoute: false,
    representativeStrategyId: strategyId(representativeEntry),
    terminalHp: result?.final?.hp ?? null,
    battleCount: battles.length,
    minNormalizedHpMargin: minMargin,
    p10NormalizedHpMargin: quantile(margins, 0.10),
    medianNormalizedHpMargin: quantile(margins, 0.50),
    lowMarginBattleCount: margins.filter((value) => value < 0.25).length,
    criticalMarginBattleCount: margins.filter((value) => value < 0.10).length,
    minAtkMargin: battles.length ? Math.min(...battles.map((entry) => entry.atkMargin)) : null,
    minDefMargin: (() => {
      const values = battles.map((entry) => entry.defMargin).filter(Number.isFinite);
      return values.length ? Math.min(...values) : null;
    })(),
    minGoldSlack: tightestPurchase?.goldSlack ?? null,
    minNormalizedGoldSlack: tightestPurchase?.normalizedGoldSlack ?? null,
    tightestBattle: tightestBattle ? {
      floor: tightestBattle.floor,
      enemyId: tightestBattle.enemyId,
      enemyName: tightestBattle.enemyName,
      normalizedHpMargin: tightestBattle.normalizedHpMargin,
      hpMargin: tightestBattle.hpMargin,
      totalDamage: tightestBattle.battle.totalDamage,
      hpBefore: tightestBattle.statsBefore.hp,
      atkMargin: tightestBattle.atkMargin,
      defMargin: tightestBattle.defMargin
    } : null,
    tightestPurchase: tightestPurchase ? {
      floor: tightestPurchase.floor,
      purchase: tightestPurchase.purchase,
      optionId: tightestPurchase.optionId,
      cost: tightestPurchase.cost,
      goldBefore: tightestPurchase.before.gold,
      goldSlack: tightestPurchase.goldSlack
    } : null,
    byFloor: pressureByFloor(battles),
    targetBand: DIFFICULTY_TARGETS.minNormalizedHpMargin,
    status: bandStatus(minMargin, DIFFICULTY_TARGETS.minNormalizedHpMargin)
  };
}

function analyzeCounterfactualRegret(counterfactuals) {
  if (!counterfactuals) {
    return { confidence: 'not-measured', measured: false, reason: 'No single-purchase counterfactual report supplied.' };
  }
  return {
    confidence: 'authoritative-single-purchase-counterfactual',
    measured: true,
    exactActionRegret: false,
    exactSinglePurchaseRegret: true,
    representativeStrategyId: counterfactuals.representativeStrategyId,
    baselineTerminalHp: counterfactuals.baselineTerminalHp,
    testedMutations: counterfactuals.totalMutations,
    highRegretThresholdRelative: counterfactuals.highRegretThresholdRelative,
    highRegretStrategyRate: counterfactuals.highRegretRate,
    catastrophicStrategyRate: counterfactuals.catastrophicRate,
    medianNormalizedRegret: counterfactuals.medianNormalizedRegret,
    p90NormalizedRegret: counterfactuals.p90NormalizedRegret,
    maxNormalizedRegret: counterfactuals.maxNormalizedRegret,
    improvedMutationCount: counterfactuals.improvedMutationCount,
    locallyOneOptimal: counterfactuals.improvedMutationCount === 0,
    bestMutation: counterfactuals.bestMutation,
    mostSensitivePurchases: counterfactuals.mostSensitivePurchases,
    targetBand: DIFFICULTY_TARGETS.highRegretRate
  };
}

function analyzeCounterfactualTrap(counterfactuals) {
  if (!counterfactuals) return { confidence: 'not-measured', measured: false };
  return {
    confidence: 'authoritative-single-purchase-counterfactual',
    measured: true,
    exactTrapRate: false,
    exactSinglePurchaseCatastrophicRate: true,
    testedMutations: counterfactuals.totalMutations,
    catastrophicStrategyRate: counterfactuals.catastrophicRate,
    highRegretStrategyRate: counterfactuals.highRegretRate,
    catastrophicExamples: counterfactuals.catastrophicExamples,
    targetMaximum: DIFFICULTY_TARGETS.maxCatastrophicRate
  };
}

function analyzeCounterfactualForgiveness(counterfactuals) {
  if (!counterfactuals) return { confidence: 'not-measured', measured: false };
  const solvable = counterfactuals.mutations.filter((entry) => entry.solvable);
  const retention = solvable.map((entry) => entry.terminalHp / Math.max(1, counterfactuals.baselineTerminalHp));
  return {
    confidence: 'authoritative-single-purchase-counterfactual',
    measured: true,
    exactSingleErrorRecovery: false,
    exactSinglePurchaseRecovery: true,
    testedMutations: counterfactuals.totalMutations,
    recoverableMutations: counterfactuals.solvableMutations,
    policyRecoveryRate: counterfactuals.recoveryRate,
    medianTerminalHpRetention: quantile(retention, 0.50),
    minTerminalHpRetention: retention.length ? Math.min(...retention) : null,
    catastrophicMutations: counterfactuals.catastrophicMutations,
    targetMinimum: DIFFICULTY_TARGETS.minRecoveryRate
  };
}

function qualifyPortfolioDimensions(base, portfolio, representativeEntry) {
  const portfolioBest = portfolio?.best?.result?.final?.hp ?? null;
  const bestKnown = representativeEntry?.result?.final?.hp ?? null;
  const coverageRatio = Number.isFinite(portfolioBest) && Number.isFinite(bestKnown) && bestKnown > 0
    ? portfolioBest / bestKnown
    : null;
  const sufficient = Number.isFinite(coverageRatio) && coverageRatio >= 0.90;
  const shared = {
    portfolioBestTerminalHp: portfolioBest,
    bestKnownTerminalHp: bestKnown,
    bestKnownCoverageRatio: coverageRatio,
    coverageSufficientForNearOptimalClaims: sufficient
  };
  return {
    W: {
      ...base.dimensions.W,
      confidence: sufficient ? 'portfolio-proxy' : 'portfolio-proxy-insufficient-best-known-coverage',
      ...shared
    },
    V: {
      ...base.dimensions.V,
      confidence: sufficient ? base.dimensions.V.confidence : 'portfolio-proxy-insufficient-best-known-coverage',
      ...shared
    },
    sufficient
  };
}

function makeDiagnostics({ P, R, T, F, W, V }) {
  const diagnostics = [];
  if (Number.isFinite(P.minNormalizedHpMargin)) {
    if (P.minNormalizedHpMargin > DIFFICULTY_TARGETS.minNormalizedHpMargin[1]) {
      diagnostics.push({ code: 'pressure_too_low', dimension: 'P', severity: P.minNormalizedHpMargin - DIFFICULTY_TARGETS.minNormalizedHpMargin[1], message: 'Best-known route keeps far more HP margin than the target band.' });
    } else if (P.minNormalizedHpMargin < DIFFICULTY_TARGETS.minNormalizedHpMargin[0]) {
      diagnostics.push({ code: 'pressure_too_high', dimension: 'P', severity: DIFFICULTY_TARGETS.minNormalizedHpMargin[0] - P.minNormalizedHpMargin, message: 'Best-known route crosses the intended minimum HP safety margin.' });
    }
  }
  if (Number.isFinite(R.highRegretStrategyRate)) {
    const [low, high] = DIFFICULTY_TARGETS.highRegretRate;
    if (R.highRegretStrategyRate < low) diagnostics.push({ code: 'single_purchase_regret_too_flat', dimension: 'R', severity: low - R.highRegretStrategyRate, message: 'Single purchase mistakes are too cheap relative to the target regret band.' });
    if (R.highRegretStrategyRate > high) diagnostics.push({ code: 'single_purchase_regret_too_spiky', dimension: 'R', severity: R.highRegretStrategyRate - high, message: 'Too many single purchase mistakes carry high terminal regret.' });
  }
  if (Number.isFinite(T.catastrophicStrategyRate) && T.catastrophicStrategyRate > DIFFICULTY_TARGETS.maxCatastrophicRate) {
    diagnostics.push({ code: 'single_purchase_catastrophic_rate_high', dimension: 'T', severity: T.catastrophicStrategyRate - DIFFICULTY_TARGETS.maxCatastrophicRate, message: 'Too many single purchase mistakes create a dead route.' });
  }
  if (Number.isFinite(F.policyRecoveryRate) && F.policyRecoveryRate < DIFFICULTY_TARGETS.minRecoveryRate) {
    diagnostics.push({ code: 'single_purchase_recovery_low', dimension: 'F', severity: DIFFICULTY_TARGETS.minRecoveryRate - F.policyRecoveryRate, message: 'Too few one-purchase deviations remain solvable.' });
  }
  if (!V.coverageSufficientForNearOptimalClaims) {
    diagnostics.push({ code: 'near_optimal_coverage_insufficient', dimension: 'V', severity: 1 - (V.bestKnownCoverageRatio ?? 0), message: 'The 36-policy portfolio is too far below the best-known plan to support near-optimal W/V claims.' });
  } else {
    if (Number.isFinite(W.effectiveStrategyCount)) {
      const [low, high] = DIFFICULTY_TARGETS.effectiveStrategyCount;
      if (W.effectiveStrategyCount < low) diagnostics.push({ code: 'strategy_collapse_proxy', dimension: 'V', severity: low - W.effectiveStrategyCount, message: 'Effective near-optimal strategy count is below target.' });
      if (W.effectiveStrategyCount > high) diagnostics.push({ code: 'strategy_width_high_proxy', dimension: 'W', severity: W.effectiveStrategyCount - high, message: 'Effective near-optimal strategy count is above target.' });
    }
    if (Number.isFinite(V.minNearOptimalRouteDistance) && V.minNearOptimalRouteDistance < DIFFICULTY_TARGETS.minNearOptimalRouteDistance) {
      diagnostics.push({ code: 'near_optimal_routes_too_similar_proxy', dimension: 'V', severity: DIFFICULTY_TARGETS.minNearOptimalRouteDistance - V.minNearOptimalRouteDistance, message: 'Near-optimal routes are behaviorally too similar.' });
    }
  }
  return diagnostics;
}

function provisionalLoss({ P, R, T, F, W, V }) {
  const terms = {
    pressure: distanceToBand(P.minNormalizedHpMargin, DIFFICULTY_TARGETS.minNormalizedHpMargin) ** 2,
    regret: distanceToBand(R.highRegretStrategyRate, DIFFICULTY_TARGETS.highRegretRate) ** 2,
    catastrophic: distanceToMaximum(T.catastrophicStrategyRate, DIFFICULTY_TARGETS.maxCatastrophicRate) ** 2,
    forgiveness: distanceToMinimum(F.policyRecoveryRate, DIFFICULTY_TARGETS.minRecoveryRate) ** 2
  };
  const excluded = {};
  if (V.coverageSufficientForNearOptimalClaims) {
    terms.strategyCount = distanceToBand(W.effectiveStrategyCount, DIFFICULTY_TARGETS.effectiveStrategyCount) ** 2;
    terms.routeDistance = distanceToMinimum(V.minNearOptimalRouteDistance, DIFFICULTY_TARGETS.minNearOptimalRouteDistance) ** 2;
  } else {
    excluded.strategyCount = 'insufficient portfolio coverage of best-known route';
    excluded.routeDistance = 'insufficient portfolio coverage of best-known route';
  }
  return {
    total: Object.values(terms).reduce((sum, value) => sum + value, 0),
    terms,
    excluded
  };
}

export function analyzeDifficultyV2({
  portfolio,
  representativeEntry,
  counterfactuals = null,
  solverReport = null,
  epsilonRelative = 0.10,
  epsilonAbsolute = 1_000,
  temperatureRelative = 0.05,
  highRegretRelative = 0.20
} = {}) {
  if (!portfolio?.best) throw new Error('analyzeDifficultyV2() requires the policy portfolio.');
  if (!representativeEntry?.result?.solvable) throw new Error('analyzeDifficultyV2() requires a feasible best-known representative entry.');

  const base = analyzeDifficulty({
    portfolio,
    solverReport,
    epsilonRelative,
    epsilonAbsolute,
    temperatureRelative,
    highRegretRelative
  });
  const P = analyzeRepresentativePressure(representativeEntry);
  const R = analyzeCounterfactualRegret(counterfactuals);
  const T = analyzeCounterfactualTrap(counterfactuals);
  const F = analyzeCounterfactualForgiveness(counterfactuals);
  const qualified = qualifyPortfolioDimensions(base, portfolio, representativeEntry);
  const W = qualified.W;
  const V = qualified.V;
  const diagnostics = makeDiagnostics({ P, R, T, F, W, V });
  const loss = provisionalLoss({ P, R, T, F, W, V });

  return {
    ...base,
    schemaVersion: 2,
    model: 'tower-difficulty-hybrid-v0.2',
    representative: {
      strategyId: strategyId(representativeEntry),
      source: representativeEntry.source ?? 'best-known',
      exactGlobalOptimal: false,
      holyPolicy: representativeEntry.holyPolicy ?? representativeEntry.result.holyPolicy,
      terminalHp: representativeEntry.result.final.hp,
      purchases: representativeEntry.result.purchases,
      purchaseCounts: representativeEntry.result.purchaseCounts,
      battles: representativeEntry.result.battles
    },
    dimensions: {
      ...base.dimensions,
      P,
      R,
      W,
      T,
      F,
      V
    },
    diagnostics,
    provisionalLoss: loss,
    counterfactualCoverage: counterfactuals ? {
      model: counterfactuals.model,
      mutations: counterfactuals.totalMutations,
      baselineTerminalHp: counterfactuals.baselineTerminalHp,
      locallyOneOptimal: counterfactuals.improvedMutationCount === 0
    } : null,
    nextMeasurements: [
      'generate near-optimal explicit purchase plans around the promoted best-known witness for W/V',
      'extend single-error replay beyond shop purchases to door/resource decisions for R/F/T',
      'annotate hidden-information and hint dependencies for K',
      'prove or improve the 26,041 best-known route with exact bounded optimization'
    ]
  };
}
