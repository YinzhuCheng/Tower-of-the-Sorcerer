import { ENEMIES } from '../game/data.js';
import { calculateBattle } from '../game/engine.js';
import { runGreedyShopStrategy } from './greedy-strategy.js';

export const EXPERT_NO_HP_STRATEGY_ID = 'expert:def-threshold-no-hp';
const EXPERT_OPTIONS = Object.freeze(['def', 'atk']);
const LATE_BOSSES = new Set(['palaceWarden', 'blackSealKeeper', 'finalQueen', 'voidCore']);
const REQUIRED_GUARDIAN_FAILURE = /^Required exit guardian unresolved on floor (\d+): (.+)\.$/;

function enumeratePatterns(length, prefix = []) {
  if (prefix.length >= length) return [prefix];
  return EXPERT_OPTIONS.flatMap((optionId) => enumeratePatterns(length, [...prefix, optionId]));
}

function finiteBattleDamage(report) {
  return (report.battleLog ?? []).reduce((sum, entry) => {
    const damage = entry?.battle?.totalDamage;
    return sum + (Number.isFinite(damage) ? damage : 0);
  }, 0);
}

function defeatedLateBosses(report) {
  return (report.battleLog ?? []).filter((entry) => LATE_BOSSES.has(entry.enemyId)).length;
}

function guardianIdsFromFailure(report) {
  const match = REQUIRED_GUARDIAN_FAILURE.exec(report?.failure ?? '');
  if (!match) return null;
  const guardianIds = match[2]
    .split(', ')
    .map((detail) => detail.slice(0, detail.indexOf(':')))
    .filter(Boolean);
  if (!guardianIds.length) return null;
  return {
    floor: Number(match[1]),
    guardianIds: [...new Set(guardianIds)].sort()
  };
}

/**
 * Measure the authoritative combat shortfall at the current mandatory guardian
 * frontier. This is deliberately computed from the final replay state instead
 * of trusting text such as `needs-N-more-hp-equivalent`, so strategy ranking
 * stays coupled to the engine battle formula.
 */
export function requiredGuardianFailurePressure(report) {
  if (!report || report.solvable) return null;
  const parsed = guardianIdsFromFailure(report);
  if (!parsed || !report.final || !report.relics) return null;

  const deficits = parsed.guardianIds.map((enemyId) => {
    const enemy = ENEMIES[enemyId];
    if (!enemy) return { enemyId, deficit: Number.POSITIVE_INFINITY };
    const battle = calculateBattle(report.final, enemy, report.relics);
    if (battle.winnable) return { enemyId, deficit: 0 };
    if (!Number.isFinite(battle.totalDamage)) {
      return { enemyId, deficit: Number.POSITIVE_INFINITY };
    }
    return {
      enemyId,
      deficit: Math.max(0, battle.totalDamage - report.final.hp + 1)
    };
  });

  const hasInfinite = deficits.some((entry) => !Number.isFinite(entry.deficit));
  return {
    floor: parsed.floor,
    guardianIds: parsed.guardianIds,
    signature: `${parsed.floor}:${parsed.guardianIds.join('+')}`,
    deficits,
    totalDeficit: hasInfinite
      ? Number.POSITIVE_INFINITY
      : deficits.reduce((sum, entry) => sum + entry.deficit, 0),
    maxDeficit: hasInfinite
      ? Number.POSITIVE_INFINITY
      : Math.max(0, ...deficits.map((entry) => entry.deficit))
  };
}

/**
 * Find the next ATK threshold that changes authoritative damage against the
 * current mandatory guardian frontier. ATK is discrete in this game: several
 * purchases can appear worthless until `ceil(enemy.hp / heroDamage)` drops by
 * one round. Tracking the distance to that breakpoint gives bounded planning a
 * useful potential function without hard-coding magic enemies or floor ids.
 */
export function requiredGuardianAttackBreakpoint(report) {
  if (!report || report.solvable) return null;
  const parsed = guardianIdsFromFailure(report);
  if (!parsed || !report.final || !report.relics) return null;

  const breakpoints = parsed.guardianIds.map((enemyId) => {
    const enemy = ENEMIES[enemyId];
    if (!enemy) {
      return {
        enemyId,
        currentRounds: null,
        requiredAtk: null,
        atkGap: Number.POSITIVE_INFINITY,
        damageSaved: 0
      };
    }

    const battle = calculateBattle(report.final, enemy, report.relics);
    if (battle.winnable) {
      return {
        enemyId,
        currentRounds: battle.rounds,
        requiredAtk: report.final.atk,
        atkGap: 0,
        damageSaved: 0
      };
    }

    if (!Number.isFinite(battle.rounds) || battle.heroDamage <= 0) {
      const requiredAtk = enemy.def + 1;
      return {
        enemyId,
        currentRounds: null,
        requiredAtk,
        atkGap: Math.max(0, requiredAtk - report.final.atk),
        damageSaved: 0
      };
    }

    if (battle.rounds <= 1 || !Number.isFinite(battle.enemyDamage) || battle.enemyDamage <= 0) {
      return {
        enemyId,
        currentRounds: battle.rounds,
        requiredAtk: null,
        atkGap: Number.POSITIVE_INFINITY,
        damageSaved: 0
      };
    }

    const targetRounds = battle.rounds - 1;
    const requiredHeroDamage = Math.ceil(enemy.hp / targetRounds);
    const requiredAtk = enemy.def + requiredHeroDamage;
    const atkGap = Math.max(0, requiredAtk - report.final.atk);
    const improvedBattle = calculateBattle(
      { ...report.final, atk: requiredAtk },
      enemy,
      report.relics
    );
    const damageSaved = Number.isFinite(improvedBattle.totalDamage)
      ? Math.max(0, battle.totalDamage - improvedBattle.totalDamage)
      : 0;

    return {
      enemyId,
      currentRounds: battle.rounds,
      targetRounds,
      requiredAtk,
      atkGap,
      damageSaved
    };
  });

  const useful = breakpoints
    .filter((entry) => Number.isFinite(entry.atkGap))
    .sort((a, b) => a.atkGap - b.atkGap || b.damageSaved - a.damageSaved || a.enemyId.localeCompare(b.enemyId));

  return {
    floor: parsed.floor,
    guardianIds: parsed.guardianIds,
    signature: `${parsed.floor}:${parsed.guardianIds.join('+')}`,
    breakpoints,
    next: useful[0] ?? null,
    minAtkGap: useful[0]?.atkGap ?? Number.POSITIVE_INFINITY,
    nextDamageSaved: useful[0]?.damageSaved ?? 0
  };
}

function sameStrategicStage(left, right) {
  return Boolean(left && right)
    && Boolean(left.solvable) === Boolean(right.solvable)
    && Number(left.floor ?? 0) === Number(right.floor ?? 0)
    && Number(left.cores ?? 0) === Number(right.cores ?? 0)
    && defeatedLateBosses(left) === defeatedLateBosses(right);
}

/**
 * Compare two reports only when they are stalled at the same mandatory guardian
 * frontier. Actual HP-equivalent deficit is primary. When neither continuation
 * changes damage materially yet, distance to the next ATK round breakpoint is
 * the potential-function tie breaker; this prevents a short horizon from
 * abandoning a strategically necessary run of ATK purchases between thresholds.
 * Returns +1 when `left` is better, -1 when `right` is better, otherwise 0.
 */
export function compareRequiredGuardianFrontier(left, right, minimumAdvantage = 0) {
  if (!sameStrategicStage(left, right)) return 0;
  const leftPressure = requiredGuardianFailurePressure(left);
  const rightPressure = requiredGuardianFailurePressure(right);
  if (!leftPressure || !rightPressure || leftPressure.signature !== rightPressure.signature) return 0;

  const leftGap = leftPressure.totalDeficit;
  const rightGap = rightPressure.totalDeficit;
  if (Number.isFinite(leftGap) && !Number.isFinite(rightGap)) return 1;
  if (!Number.isFinite(leftGap) && Number.isFinite(rightGap)) return -1;
  if (Number.isFinite(leftGap) && Number.isFinite(rightGap)) {
    if (rightGap - leftGap > minimumAdvantage) return 1;
    if (leftGap - rightGap > minimumAdvantage) return -1;
  }

  const leftBreakpoint = requiredGuardianAttackBreakpoint(left);
  const rightBreakpoint = requiredGuardianAttackBreakpoint(right);
  if (!leftBreakpoint || !rightBreakpoint || leftBreakpoint.signature !== rightBreakpoint.signature) return 0;

  const leftAtkGap = leftBreakpoint.minAtkGap;
  const rightAtkGap = rightBreakpoint.minAtkGap;
  if (Number.isFinite(leftAtkGap) && !Number.isFinite(rightAtkGap)) return 1;
  if (!Number.isFinite(leftAtkGap) && Number.isFinite(rightAtkGap)) return -1;
  if (Number.isFinite(leftAtkGap) && Number.isFinite(rightAtkGap)) {
    if (leftAtkGap < rightAtkGap) return 1;
    if (rightAtkGap < leftAtkGap) return -1;
    if (leftBreakpoint.nextDamageSaved > rightBreakpoint.nextDamageSaved) return 1;
    if (rightBreakpoint.nextDamageSaved > leftBreakpoint.nextDamageSaved) return -1;
  }
  return 0;
}

/**
 * Coarse downstream utility for generation-time planning.
 * Progress dominates everything; once two continuations reach the same stage,
 * retained HP and lower battle damage decide. Mandatory-guardian deficit and
 * ATK breakpoints are handled separately by compareRequiredGuardianFrontier.
 */
export function scoreExpertStrategyReport(report) {
  const margin = Number.isFinite(report.minNormalizedHpMargin) ? report.minNormalizedHpMargin : -1;
  return (report.solvable ? 1e12 : 0)
    + Number(report.floor ?? 0) * 1e10
    + Number(report.cores ?? 0) * 1e9
    + defeatedLateBosses(report) * 1e8
    + Number(report.battleLog?.length ?? 0) * 1e6
    + Number(report.final?.hp ?? 0) * 10
    + margin * 1_000
    - finiteBattleDamage(report) * 0.01;
}

function simulatePlan({ plan, holyPolicy, progressionPriority, maxIterations }) {
  return runGreedyShopStrategy({
    shopCycle: ['def'],
    shopPlan: plan,
    holyPolicy,
    progressionPriority,
    maxIterations
  });
}

function candidateBeatsExisting(candidate, existing) {
  if (!existing) return true;
  const frontier = compareRequiredGuardianFrontier(candidate.report, existing.report, 0);
  if (frontier !== 0) return frontier > 0;
  return candidate.score > existing.score;
}

function bestContinuation({ prefix, horizon, holyPolicy, progressionPriority, maxIterations }) {
  const candidates = enumeratePatterns(horizon).map((pattern) => {
    const plan = [...prefix, ...pattern];
    const report = simulatePlan({ plan, holyPolicy, progressionPriority, maxIterations });
    return {
      first: pattern[0],
      pattern,
      score: scoreExpertStrategyReport(report),
      report
    };
  });

  const bestByFirst = {};
  for (const candidate of candidates) {
    const existing = bestByFirst[candidate.first];
    if (candidateBeatsExisting(candidate, existing)) bestByFirst[candidate.first] = candidate;
  }
  return bestByFirst;
}

function lateDefPurchaseIndices(plan, report, maxFlips) {
  const indicesByRecency = (report.purchaseLog ?? [])
    .map((entry) => ({
      index: Number(entry.purchase) - 1,
      floor: Number(entry.floor ?? 0)
    }))
    .filter((entry) => Number.isInteger(entry.index)
      && entry.index >= 0
      && entry.index < plan.length
      && plan[entry.index] === 'def')
    .sort((a, b) => b.floor - a.floor || b.index - a.index);

  const indices = [];
  const seen = new Set();
  for (const entry of indicesByRecency) {
    if (seen.has(entry.index)) continue;
    seen.add(entry.index);
    indices.push(entry.index);
    if (indices.length >= maxFlips) break;
  }
  return indices;
}

/**
 * Cross discrete combat valleys without expanding the receding horizon.
 *
 * Starting from a complete no-HP plan, this bounded pass progressively converts
 * the latest DEF purchases into ATK and evaluates every cumulative allocation.
 * Late purchases are tested first because they preserve the early physical
 * survival investment while allowing several consecutive ATK buys to cross a
 * guardian round breakpoint. Every candidate is replayed through the same
 * authoritative greedy route and ranked by strategic progress / mandatory
 * guardian pressure before residual HP.
 */
export function optimizeLateGuardianAttackReallocation({
  plan,
  report,
  holyPolicy = 'immediate',
  progressionPriority = 'legacy-clear',
  maxIterations = 8_000,
  maxFlips = 14
}) {
  if (!Array.isArray(plan)) throw new Error('guardian reallocation plan must be an array.');
  if (!Number.isInteger(maxFlips) || maxFlips < 0 || maxFlips > 24) {
    throw new Error('guardian reallocation maxFlips must be an integer from 0 to 24.');
  }

  const baselinePlan = [...plan];
  const baselineReport = report ?? simulatePlan({
    plan: baselinePlan,
    holyPolicy,
    progressionPriority,
    maxIterations
  });
  const baseline = {
    plan: baselinePlan,
    report: baselineReport,
    score: scoreExpertStrategyReport(baselineReport),
    flippedIndices: []
  };

  const candidateIndices = lateDefPurchaseIndices(baselinePlan, baselineReport, maxFlips);
  let best = baseline;
  const evaluations = [];
  const working = [...baselinePlan];
  const flippedIndices = [];

  for (const index of candidateIndices) {
    working[index] = 'atk';
    flippedIndices.push(index);
    const candidatePlan = [...working];
    const candidateReport = simulatePlan({
      plan: candidatePlan,
      holyPolicy,
      progressionPriority,
      maxIterations
    });
    const candidate = {
      plan: candidatePlan,
      report: candidateReport,
      score: scoreExpertStrategyReport(candidateReport),
      flippedIndices: [...flippedIndices]
    };
    const pressure = requiredGuardianFailurePressure(candidateReport);
    evaluations.push({
      flips: candidate.flippedIndices.length,
      flippedIndices: [...candidate.flippedIndices],
      solvable: candidateReport.solvable,
      floor: candidateReport.floor,
      cores: candidateReport.cores,
      purchases: candidateReport.purchases,
      atk: candidateReport.final?.atk ?? null,
      def: candidateReport.final?.def ?? null,
      hp: candidateReport.final?.hp ?? null,
      guardianSignature: pressure?.signature ?? null,
      guardianDeficit: pressure?.totalDeficit ?? null
    });
    if (candidateBeatsExisting(candidate, best)) best = candidate;
  }

  return {
    attempted: candidateIndices.length > 0,
    candidateIndices,
    candidatesEvaluated: evaluations.length,
    evaluations,
    baselinePressure: requiredGuardianFailurePressure(baselineReport),
    selectedPressure: requiredGuardianFailurePressure(best.report),
    selectedFlips: [...best.flippedIndices],
    improved: best !== baseline,
    plan: [...best.plan],
    report: best.report
  };
}

/**
 * Build a receding-horizon shop plan that never buys HP.
 *
 * Default behavior remains defensive, but a continuation stalled at the same
 * required guardian may select ATK either because it already reduces the exact
 * authoritative combat deficit or because it moves closer to the next
 * round-reduction breakpoint. A final bounded late-purchase reallocation pass
 * can then cross multi-buy valleys without increasing the combinatorial horizon.
 */
export function buildExpertNoHpShopPlan({
  holyPolicy = 'immediate',
  progressionPriority = 'legacy-clear',
  maxIterations = 8_000,
  horizon = 2,
  maxDecisions = 48,
  attackAdvantageRequired = 2_000,
  guardianDeficitAdvantageRequired = 8,
  guardianRescueMaxFlips = 14
} = {}) {
  if (!Number.isInteger(horizon) || horizon < 1 || horizon > 4) {
    throw new Error('expert strategy horizon must be an integer from 1 to 4.');
  }
  if (!Number.isInteger(maxDecisions) || maxDecisions < 1) {
    throw new Error('expert strategy maxDecisions must be a positive integer.');
  }
  if (!Number.isFinite(guardianDeficitAdvantageRequired) || guardianDeficitAdvantageRequired < 0) {
    throw new Error('guardianDeficitAdvantageRequired must be a non-negative finite number.');
  }
  if (!Number.isInteger(guardianRescueMaxFlips) || guardianRescueMaxFlips < 0 || guardianRescueMaxFlips > 24) {
    throw new Error('guardianRescueMaxFlips must be an integer from 0 to 24.');
  }

  const shopPlan = [];
  const decisions = [];
  let probe = simulatePlan({ plan: shopPlan, holyPolicy, progressionPriority, maxIterations });

  for (let decision = 0; decision < maxDecisions; decision += 1) {
    if (probe.purchases <= shopPlan.length) break;

    const best = bestContinuation({
      prefix: shopPlan,
      horizon,
      holyPolicy,
      progressionPriority,
      maxIterations
    });
    const defCandidate = best.def;
    const atkCandidate = best.atk;

    let selected = 'def';
    let guardianFrontierPreference = 0;
    if (!defCandidate && atkCandidate) {
      selected = 'atk';
    } else if (atkCandidate && defCandidate) {
      guardianFrontierPreference = compareRequiredGuardianFrontier(
        atkCandidate.report,
        defCandidate.report,
        guardianDeficitAdvantageRequired
      );
      if (guardianFrontierPreference > 0) {
        selected = 'atk';
      } else if (guardianFrontierPreference === 0
        && atkCandidate.score > defCandidate.score + attackAdvantageRequired) {
        selected = 'atk';
      }
    }

    const selectedCandidate = best[selected];
    const defPressure = requiredGuardianFailurePressure(defCandidate?.report);
    const atkPressure = requiredGuardianFailurePressure(atkCandidate?.report);
    const defBreakpoint = requiredGuardianAttackBreakpoint(defCandidate?.report);
    const atkBreakpoint = requiredGuardianAttackBreakpoint(atkCandidate?.report);
    shopPlan.push(selected);
    decisions.push({
      purchase: shopPlan.length - 1,
      selected,
      defScore: defCandidate?.score ?? null,
      atkScore: atkCandidate?.score ?? null,
      scoreAdvantage: selected === 'atk' && defCandidate
        ? selectedCandidate.score - defCandidate.score
        : defCandidate && atkCandidate
          ? defCandidate.score - atkCandidate.score
          : null,
      guardianFrontierPreference,
      defGuardianDeficit: defPressure?.totalDeficit ?? null,
      atkGuardianDeficit: atkPressure?.totalDeficit ?? null,
      defAtkGapToBreakpoint: defBreakpoint?.minAtkGap ?? null,
      atkAtkGapToBreakpoint: atkBreakpoint?.minAtkGap ?? null,
      guardianSignature: defPressure?.signature === atkPressure?.signature
        ? defPressure?.signature ?? null
        : null,
      projectedFloor: selectedCandidate?.report?.floor ?? null,
      projectedSolvable: Boolean(selectedCandidate?.report?.solvable)
    });

    probe = simulatePlan({ plan: shopPlan, holyPolicy, progressionPriority, maxIterations });
  }

  let guardianRescue = {
    attempted: false,
    candidateIndices: [],
    candidatesEvaluated: 0,
    evaluations: [],
    baselinePressure: requiredGuardianFailurePressure(probe),
    selectedPressure: requiredGuardianFailurePressure(probe),
    selectedFlips: [],
    improved: false,
    plan: [...shopPlan],
    report: probe
  };

  if (progressionPriority === 'guardian-first'
      && guardianRescueMaxFlips > 0
      && !probe.solvable
      && requiredGuardianFailurePressure(probe)) {
    guardianRescue = optimizeLateGuardianAttackReallocation({
      plan: shopPlan,
      report: probe,
      holyPolicy,
      progressionPriority,
      maxIterations,
      maxFlips: guardianRescueMaxFlips
    });
    shopPlan.splice(0, shopPlan.length, ...guardianRescue.plan);
    probe = guardianRescue.report;
  }

  return {
    strategyId: EXPERT_NO_HP_STRATEGY_ID,
    shopPlan,
    decisions,
    guardianRescue,
    horizon,
    maxDecisions,
    attackAdvantageRequired,
    guardianDeficitAdvantageRequired,
    guardianRescueMaxFlips,
    progressionPriority,
    planningProbe: probe
  };
}

export function runExpertNoHpStrategy(options = {}) {
  const {
    holyPolicy = 'immediate',
    progressionPriority = 'legacy-clear',
    maxIterations = 8_000
  } = options;
  const planning = buildExpertNoHpShopPlan(options);
  const report = planning.planningProbe;

  return {
    ...report,
    strategyId: EXPERT_NO_HP_STRATEGY_ID,
    strategy: {
      shopHpAllowed: false,
      defaultInvestment: 'def',
      progressionPriority,
      attackRule: 'prefer ATK when bounded lookahead reduces the same required-guardian deficit or advances toward its next authoritative round breakpoint; in guardian-first demo mode, also test a bounded cumulative late DEF-to-ATK reallocation to cross multi-buy valleys',
      horizon: planning.horizon,
      attackAdvantageRequired: planning.attackAdvantageRequired,
      guardianDeficitAdvantageRequired: planning.guardianDeficitAdvantageRequired,
      guardianRescueMaxFlips: planning.guardianRescueMaxFlips
    },
    planning: {
      shopPlan: [...planning.shopPlan],
      decisions: planning.decisions,
      guardianRescue: planning.guardianRescue
    }
  };
}
