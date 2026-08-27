export const DIFFICULTY_TARGETS = Object.freeze({
  minNormalizedHpMargin: [0.08, 0.25],
  effectiveStrategyCount: [2, 5],
  highRegretRate: [0.08, 0.30],
  maxCatastrophicRate: 0.10,
  minRecoveryRate: 0.60,
  minNearOptimalRouteDistance: 0.20
});

function finite(values) {
  return values.filter(Number.isFinite);
}

export function quantile(values, q) {
  const sorted = finite(values).sort((a, b) => a - b);
  if (!sorted.length) return null;
  if (sorted.length === 1) return sorted[0];
  const position = Math.min(1, Math.max(0, q)) * (sorted.length - 1);
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  const weight = position - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function mean(values) {
  const filtered = finite(values);
  return filtered.length ? filtered.reduce((sum, value) => sum + value, 0) / filtered.length : null;
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

function bandStatus(value, [low, high], { below = 'too_hard', above = 'too_easy' } = {}) {
  if (!Number.isFinite(value)) return 'unknown';
  if (value < low) return below;
  if (value > high) return above;
  return 'target';
}

function strategyId(entry) {
  return entry.id ?? entry.baseId ?? 'unnamed';
}

function battleFloorSummary(battles) {
  const byFloor = new Map();
  for (const battle of battles) {
    const current = byFloor.get(battle.floor) ?? [];
    current.push(battle);
    byFloor.set(battle.floor, current);
  }
  return [...byFloor.entries()]
    .sort(([a], [b]) => a - b)
    .map(([floor, entries]) => {
      const margins = entries.map((entry) => entry.normalizedHpMargin);
      const damageRatios = entries.map((entry) =>
        entry.battle.totalDamage / Math.max(1, entry.statsBefore.hp)
      );
      const tightest = [...entries].sort((a, b) => a.normalizedHpMargin - b.normalizedHpMargin)[0] ?? null;
      return {
        floor,
        battles: entries.length,
        minNormalizedHpMargin: margins.length ? Math.min(...margins) : null,
        p10NormalizedHpMargin: quantile(margins, 0.10),
        meanDamageRatio: mean(damageRatios),
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

function analyzePressure(bestEntry) {
  const battles = bestEntry?.result?.battleLog ?? [];
  const purchases = bestEntry?.result?.purchaseLog ?? [];
  const hpMargins = battles.map((entry) => entry.normalizedHpMargin);
  const attackMargins = battles.map((entry) => entry.atkMargin);
  const defenseMargins = battles.map((entry) => entry.defMargin).filter(Number.isFinite);
  const tightestBattle = [...battles].sort((a, b) => a.normalizedHpMargin - b.normalizedHpMargin)[0] ?? null;
  const tightestPurchase = [...purchases].sort((a, b) => a.goldSlack - b.goldSlack)[0] ?? null;
  const minMargin = hpMargins.length ? Math.min(...hpMargins) : null;

  return {
    confidence: 'authoritative-representative-route',
    measured: battles.length > 0,
    representativeStrategyId: bestEntry ? strategyId(bestEntry) : null,
    battleCount: battles.length,
    minNormalizedHpMargin: minMargin,
    p10NormalizedHpMargin: quantile(hpMargins, 0.10),
    medianNormalizedHpMargin: quantile(hpMargins, 0.50),
    lowMarginBattleCount: hpMargins.filter((value) => value < 0.25).length,
    criticalMarginBattleCount: hpMargins.filter((value) => value < 0.10).length,
    minAtkMargin: attackMargins.length ? Math.min(...attackMargins) : null,
    minDefMargin: defenseMargins.length ? Math.min(...defenseMargins) : null,
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
    byFloor: battleFloorSummary(battles),
    targetBand: DIFFICULTY_TARGETS.minNormalizedHpMargin,
    status: bandStatus(minMargin, DIFFICULTY_TARGETS.minNormalizedHpMargin, {
      below: 'too_harsh',
      above: 'too_forgiving'
    })
  };
}

function groupSensitivity(entries, groupKey) {
  const groups = new Map();
  for (const entry of entries) {
    const key = groupKey(entry);
    const current = groups.get(key) ?? [];
    current.push(entry);
    groups.set(key, current);
  }
  return [...groups.entries()].map(([key, group]) => {
    const feasible = group.filter((entry) => entry.result.solvable);
    if (!feasible.length) return { key, feasible: 0, range: null, normalizedRange: null };
    const hp = feasible.map((entry) => entry.result.final.hp);
    const best = Math.max(...hp);
    const worst = Math.min(...hp);
    return {
      key,
      feasible: feasible.length,
      best,
      worst,
      range: best - worst,
      normalizedRange: best > 0 ? (best - worst) / best : null,
      bestStrategyId: strategyId(feasible.find((entry) => entry.result.final.hp === best)),
      worstStrategyId: strategyId(feasible.find((entry) => entry.result.final.hp === worst))
    };
  }).sort((a, b) => (b.range ?? -1) - (a.range ?? -1));
}

function analyzeRegret(portfolio, bestEntry, { highRegretRelative = 0.20 } = {}) {
  const entries = portfolio?.results ?? [];
  const feasible = entries.filter((entry) => entry.result.solvable);
  const bestValue = bestEntry?.result?.final?.hp ?? null;
  const regrets = feasible.map((entry) => {
    const delta = bestValue - entry.result.final.hp;
    return {
      strategyId: strategyId(entry),
      baseId: entry.baseId ?? strategyId(entry),
      holyPolicy: entry.holyPolicy ?? entry.result.holyPolicy ?? 'unknown',
      terminalHp: entry.result.final.hp,
      regret: delta,
      normalizedRegret: bestValue > 0 ? delta / bestValue : null
    };
  });
  const highRegret = regrets.filter((entry) => entry.normalizedRegret >= highRegretRelative);
  const ordered = [...feasible].sort((a, b) => b.result.final.hp - a.result.final.hp);
  const second = ordered[1]?.result.final.hp ?? null;

  return {
    confidence: 'authoritative-portfolio-proxy',
    measured: feasible.length > 0,
    exactActionRegret: false,
    bestTerminalHp: bestValue,
    feasibleStrategies: feasible.length,
    attemptedStrategies: entries.length,
    catastrophicStrategyRate: entries.length ? (entries.length - feasible.length) / entries.length : null,
    highRegretThresholdRelative: highRegretRelative,
    highRegretStrategyRate: feasible.length ? highRegret.length / feasible.length : null,
    medianNormalizedRegret: quantile(regrets.map((entry) => entry.normalizedRegret), 0.50),
    p90NormalizedRegret: quantile(regrets.map((entry) => entry.normalizedRegret), 0.90),
    bestVsSecondGap: second == null ? null : bestValue - second,
    bestVsSecondGapNormalized: second == null || bestValue <= 0 ? null : (bestValue - second) / bestValue,
    largestStrategyRegrets: [...regrets]
      .sort((a, b) => b.regret - a.regret)
      .slice(0, 8),
    holyTimingSensitivity: groupSensitivity(entries, (entry) => entry.baseId ?? strategyId(entry)).slice(0, 8),
    shopOrderingSensitivity: groupSensitivity(entries, (entry) => entry.holyPolicy ?? entry.result.holyPolicy ?? 'unknown').slice(0, 8),
    targetBand: DIFFICULTY_TARGETS.highRegretRate
  };
}

function normalizedPurchaseDistance(left, right) {
  const a = left.result.purchaseLog?.map((entry) => entry.optionId) ?? [];
  const b = right.result.purchaseLog?.map((entry) => entry.optionId) ?? [];
  const length = Math.max(a.length, b.length);
  if (!length) return 0;
  let differences = 0;
  for (let index = 0; index < length; index += 1) {
    if (a[index] !== b[index]) differences += 1;
  }
  return differences / length;
}

function holyStage(entry) {
  const acquisition = entry.result.holyAcquisition;
  if (!acquisition) return null;
  return {
    cores: acquisition.cores / 7,
    purchases: acquisition.purchases / Math.max(1, entry.result.purchases)
  };
}

function holyStageDistance(left, right) {
  const a = holyStage(left);
  const b = holyStage(right);
  if (!a && !b) return 0;
  if (!a || !b) return 1;
  return Math.min(1, (Math.abs(a.cores - b.cores) + Math.abs(a.purchases - b.purchases)) / 2);
}

export function portfolioRouteDistance(left, right) {
  return normalizedPurchaseDistance(left, right) * 0.8 + holyStageDistance(left, right) * 0.2;
}

function analyzeVariety(portfolio, bestEntry, {
  epsilonRelative = 0.10,
  epsilonAbsolute = 1_000,
  temperatureRelative = 0.05
} = {}) {
  const feasible = (portfolio?.results ?? []).filter((entry) => entry.result.solvable);
  const bestValue = bestEntry?.result?.final?.hp ?? null;
  if (!Number.isFinite(bestValue) || !feasible.length) {
    return { confidence: 'authoritative-portfolio-proxy', measured: false, exactNearOptimalDag: false };
  }

  const epsilon = Math.max(epsilonAbsolute, bestValue * epsilonRelative);
  const nearOptimal = feasible.filter((entry) => bestValue - entry.result.final.hp <= epsilon);
  const tau = Math.max(1, bestValue * temperatureRelative);
  const rawWeights = feasible.map((entry) => Math.exp(-(bestValue - entry.result.final.hp) / tau));
  const weightSum = rawWeights.reduce((sum, value) => sum + value, 0);
  const probabilities = rawWeights.map((value) => value / Math.max(Number.MIN_VALUE, weightSum));
  const entropy = -probabilities.reduce((sum, probability) =>
    probability > 0 ? sum + probability * Math.log(probability) : sum, 0
  );
  const effectiveStrategyCount = Math.exp(entropy);

  const distances = [];
  for (let left = 0; left < nearOptimal.length; left += 1) {
    for (let right = left + 1; right < nearOptimal.length; right += 1) {
      distances.push(portfolioRouteDistance(nearOptimal[left], nearOptimal[right]));
    }
  }

  return {
    confidence: 'authoritative-portfolio-proxy',
    measured: true,
    exactNearOptimalDag: false,
    feasibleStrategies: feasible.length,
    epsilon,
    epsilonRelative,
    epsilonAbsolute,
    nearOptimalStrategyCount: nearOptimal.length,
    nearOptimalStrategyIds: nearOptimal.map(strategyId),
    temperature: tau,
    entropy,
    effectiveStrategyCount,
    minNearOptimalRouteDistance: distances.length ? Math.min(...distances) : null,
    meanNearOptimalRouteDistance: mean(distances),
    maxNearOptimalRouteDistance: distances.length ? Math.max(...distances) : null,
    effectiveStrategyTargetBand: DIFFICULTY_TARGETS.effectiveStrategyCount,
    routeDistanceTargetMinimum: DIFFICULTY_TARGETS.minNearOptimalRouteDistance
  };
}

function analyzeForgiveness(portfolio, bestEntry) {
  if (!bestEntry) return { confidence: 'portfolio-policy-proxy', measured: false, exactSingleErrorRecovery: false };
  const entries = portfolio?.results ?? [];
  const bestBase = bestEntry.baseId ?? strategyId(bestEntry);
  const bestHoly = bestEntry.holyPolicy ?? bestEntry.result.holyPolicy;
  const bestCycleLength = bestEntry.cycle?.length ?? bestEntry.result.shopCycle?.length ?? 0;

  const neighbors = entries.filter((entry) => {
    if (entry === bestEntry || strategyId(entry) === strategyId(bestEntry)) return false;
    const sameBase = (entry.baseId ?? strategyId(entry)) === bestBase;
    const sameHoly = (entry.holyPolicy ?? entry.result.holyPolicy) === bestHoly;
    const cycleLength = entry.cycle?.length ?? entry.result.shopCycle?.length ?? 0;
    const balancedShopNeighbor = sameHoly && cycleLength === bestCycleLength;
    return sameBase || balancedShopNeighbor;
  });
  const recoverable = neighbors.filter((entry) => entry.result.solvable);
  const retention = recoverable.map((entry) => entry.result.final.hp / Math.max(1, bestEntry.result.final.hp));

  return {
    confidence: 'portfolio-policy-proxy',
    measured: neighbors.length > 0,
    exactSingleErrorRecovery: false,
    neighborCount: neighbors.length,
    recoverableNeighborCount: recoverable.length,
    policyRecoveryRate: neighbors.length ? recoverable.length / neighbors.length : null,
    medianTerminalHpRetention: quantile(retention, 0.50),
    minTerminalHpRetention: retention.length ? Math.min(...retention) : null,
    catastrophicNeighbors: neighbors
      .filter((entry) => !entry.result.solvable)
      .map(strategyId),
    targetMinimum: DIFFICULTY_TARGETS.minRecoveryRate
  };
}

function analyzeComplexity(solverReport) {
  if (!solverReport) {
    return {
      confidence: 'solver-telemetry',
      measured: false,
      reason: 'No solver report supplied.'
    };
  }
  return {
    confidence: 'solver-telemetry',
    measured: true,
    exact: Boolean(solverReport.exact),
    expandedStates: solverReport.expandedStates,
    generatedStates: solverReport.generatedStates,
    structuralStates: solverReport.structuralStates,
    activeLabels: solverReport.activeLabels,
    frontierPeak: solverReport.frontierPeak,
    queuePeak: solverReport.profile?.queuePeak ?? null,
    branchingMean: solverReport.profile?.branching?.mean ?? null,
    branchingMax: solverReport.profile?.branching?.max ?? null,
    prunedDominated: solverReport.prunedDominated,
    prunedBound: solverReport.prunedBound,
    dominatedPruneRate: solverReport.generatedStates
      ? solverReport.prunedDominated / solverReport.generatedStates
      : null,
    boundPruneRate: solverReport.generatedStates
      ? solverReport.prunedBound / solverReport.generatedStates
      : null
  };
}

function makeDiagnostics({ pressure, regret, variety, forgiveness }) {
  const diagnostics = [];
  if (Number.isFinite(pressure.minNormalizedHpMargin)) {
    if (pressure.minNormalizedHpMargin > DIFFICULTY_TARGETS.minNormalizedHpMargin[1]) {
      diagnostics.push({
        code: 'pressure_too_low',
        dimension: 'P',
        severity: pressure.minNormalizedHpMargin - DIFFICULTY_TARGETS.minNormalizedHpMargin[1],
        message: 'Representative route keeps more HP margin than the target band.'
      });
    } else if (pressure.minNormalizedHpMargin < DIFFICULTY_TARGETS.minNormalizedHpMargin[0]) {
      diagnostics.push({
        code: 'pressure_too_high',
        dimension: 'P',
        severity: DIFFICULTY_TARGETS.minNormalizedHpMargin[0] - pressure.minNormalizedHpMargin,
        message: 'Representative route crosses the intended minimum HP safety margin.'
      });
    }
  }

  if (Number.isFinite(variety.effectiveStrategyCount)) {
    if (variety.effectiveStrategyCount < DIFFICULTY_TARGETS.effectiveStrategyCount[0]) {
      diagnostics.push({ code: 'strategy_collapse_proxy', dimension: 'V', severity: 1, message: 'Portfolio effective strategy count is below target.' });
    } else if (variety.effectiveStrategyCount > DIFFICULTY_TARGETS.effectiveStrategyCount[1]) {
      diagnostics.push({ code: 'strategy_width_high_proxy', dimension: 'W', severity: 1, message: 'Portfolio effective strategy count is above target.' });
    }
  }

  if (Number.isFinite(variety.minNearOptimalRouteDistance)
    && variety.minNearOptimalRouteDistance < DIFFICULTY_TARGETS.minNearOptimalRouteDistance) {
    diagnostics.push({ code: 'near_optimal_routes_too_similar_proxy', dimension: 'V', severity: 1, message: 'Near-optimal portfolio routes are behaviorally too similar.' });
  }

  if (Number.isFinite(regret.catastrophicStrategyRate)
    && regret.catastrophicStrategyRate > DIFFICULTY_TARGETS.maxCatastrophicRate) {
    diagnostics.push({ code: 'catastrophic_policy_rate_high_proxy', dimension: 'T', severity: 1, message: 'Too many tested policy families fail to finish.' });
  }

  if (Number.isFinite(regret.highRegretStrategyRate)) {
    const [low, high] = DIFFICULTY_TARGETS.highRegretRate;
    if (regret.highRegretStrategyRate < low) {
      diagnostics.push({ code: 'regret_too_flat_proxy', dimension: 'R', severity: 1, message: 'Tested strategy choices are too similar in value.' });
    } else if (regret.highRegretStrategyRate > high) {
      diagnostics.push({ code: 'regret_too_spiky_proxy', dimension: 'R', severity: 1, message: 'Too many tested strategy families suffer large terminal regret.' });
    }
  }

  if (Number.isFinite(forgiveness.policyRecoveryRate)
    && forgiveness.policyRecoveryRate < DIFFICULTY_TARGETS.minRecoveryRate) {
    diagnostics.push({ code: 'forgiveness_low_proxy', dimension: 'F', severity: 1, message: 'Too few one-axis policy perturbations remain solvable.' });
  }

  return diagnostics;
}

function provisionalLoss({ pressure, regret, variety, forgiveness }) {
  const terms = {
    pressure: distanceToBand(pressure.minNormalizedHpMargin, DIFFICULTY_TARGETS.minNormalizedHpMargin) ** 2,
    regret: distanceToBand(regret.highRegretStrategyRate, DIFFICULTY_TARGETS.highRegretRate) ** 2,
    catastrophic: distanceToMaximum(regret.catastrophicStrategyRate, DIFFICULTY_TARGETS.maxCatastrophicRate) ** 2,
    forgiveness: distanceToMinimum(forgiveness.policyRecoveryRate, DIFFICULTY_TARGETS.minRecoveryRate) ** 2,
    strategyCount: distanceToBand(variety.effectiveStrategyCount, DIFFICULTY_TARGETS.effectiveStrategyCount) ** 2,
    routeDistance: distanceToMinimum(variety.minNearOptimalRouteDistance, DIFFICULTY_TARGETS.minNearOptimalRouteDistance) ** 2
  };
  return {
    total: Object.values(terms).reduce((sum, value) => sum + value, 0),
    terms
  };
}

export function analyzeDifficulty({
  portfolio,
  solverReport = null,
  epsilonRelative = 0.10,
  epsilonAbsolute = 1_000,
  temperatureRelative = 0.05,
  highRegretRelative = 0.20
} = {}) {
  if (!portfolio?.best) throw new Error('analyzeDifficulty() requires a portfolio with a feasible best strategy.');
  const bestEntry = portfolio.best;
  const pressure = analyzePressure(bestEntry);
  const regret = analyzeRegret(portfolio, bestEntry, { highRegretRelative });
  const variety = analyzeVariety(portfolio, bestEntry, {
    epsilonRelative,
    epsilonAbsolute,
    temperatureRelative
  });
  const forgiveness = analyzeForgiveness(portfolio, bestEntry);
  const complexity = analyzeComplexity(solverReport);
  const diagnostics = makeDiagnostics({ pressure, regret, variety, forgiveness });
  const loss = provisionalLoss({ pressure, regret, variety, forgiveness });

  return {
    schemaVersion: 1,
    model: 'tower-difficulty-proxy-v0.1',
    provisional: true,
    targets: DIFFICULTY_TARGETS,
    representative: {
      strategyId: strategyId(bestEntry),
      baseId: bestEntry.baseId ?? strategyId(bestEntry),
      holyPolicy: bestEntry.holyPolicy ?? bestEntry.result.holyPolicy,
      terminalHp: bestEntry.result.final.hp,
      purchases: bestEntry.result.purchases,
      battles: bestEntry.result.battles
    },
    dimensions: {
      P: pressure,
      R: regret,
      W: {
        confidence: 'portfolio-proxy',
        measured: variety.measured,
        exactChoiceWidth: false,
        epsilonGoodStrategyCount: variety.nearOptimalStrategyCount ?? null,
        effectiveStrategyCount: variety.effectiveStrategyCount ?? null
      },
      T: {
        confidence: 'portfolio-proxy',
        measured: regret.measured,
        exactTrapRate: false,
        catastrophicStrategyRate: regret.catastrophicStrategyRate ?? null,
        highRegretStrategyRate: regret.highRegretStrategyRate ?? null
      },
      F: forgiveness,
      V: variety,
      K: {
        confidence: 'not-measured',
        measured: false,
        reason: 'Knowledge/hint counterfactuals require explicit hidden-information annotations.'
      },
      C: complexity
    },
    diagnostics,
    provisionalLoss: loss,
    nextMeasurements: [
      'exact near-optimal strategy DAG for W/V',
      'single-purchase counterfactuals for R/F/T',
      'hidden-information annotations and hint counterfactuals for K'
    ]
  };
}
