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

function sameStrategicStage(left, right) {
  return Boolean(left && right)
    && Boolean(left.solvable) === Boolean(right.solvable)
    && Number(left.floor ?? 0) === Number(right.floor ?? 0)
    && Number(left.cores ?? 0) === Number(right.cores ?? 0)
    && defeatedLateBosses(left) === defeatedLateBosses(right);
}

/**
 * Compare two reports only when they are stalled at the same mandatory guardian
 * frontier. Returns +1 when `left` is closer to clearing it, -1 when `right` is
 * closer, and 0 when the frontier is not comparable or the gap is below the
 * requested materiality threshold.
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
  if (!Number.isFinite(leftGap) || !Number.isFinite(rightGap)) return 0;
  if (rightGap - leftGap > minimumAdvantage) return 1;
  if (leftGap - rightGap > minimumAdvantage) return -1;
  return 0;
}

/**
 * Coarse downstream utility for generation-time planning.
 * Progress dominates everything; once two continuations reach the same stage,
 * retained HP and lower battle damage decide. Mandatory-guardian deficit is
 * handled separately by compareRequiredGuardianFrontier so magic bosses do not
 * get hidden behind accumulated DEF value.
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

/**
 * Build a receding-horizon shop plan that never buys HP.
 *
 * Default behavior remains defensive, but a continuation stalled at the same
 * required guardian may select ATK whenever it materially reduces that exact
 * authoritative combat deficit. This lets magic guardians correctly reward
 * shorter fights without hard-coding a particular floor or enemy id.
 */
export function buildExpertNoHpShopPlan({
  holyPolicy = 'immediate',
  progressionPriority = 'legacy-clear',
  maxIterations = 8_000,
  horizon = 2,
  maxDecisions = 48,
  attackAdvantageRequired = 2_000,
  guardianDeficitAdvantageRequired = 8
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
      guardianSignature: defPressure?.signature === atkPressure?.signature
        ? defPressure?.signature ?? null
        : null,
      projectedFloor: selectedCandidate?.report?.floor ?? null,
      projectedSolvable: Boolean(selectedCandidate?.report?.solvable)
    });

    probe = simulatePlan({ plan: shopPlan, holyPolicy, progressionPriority, maxIterations });
  }

  return {
    strategyId: EXPERT_NO_HP_STRATEGY_ID,
    shopPlan,
    decisions,
    horizon,
    maxDecisions,
    attackAdvantageRequired,
    guardianDeficitAdvantageRequired,
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
  const report = simulatePlan({
    plan: planning.shopPlan,
    holyPolicy,
    progressionPriority,
    maxIterations
  });

  return {
    ...report,
    strategyId: EXPERT_NO_HP_STRATEGY_ID,
    strategy: {
      shopHpAllowed: false,
      defaultInvestment: 'def',
      progressionPriority,
      attackRule: 'prefer ATK when bounded lookahead materially shrinks the same required-guardian combat deficit; otherwise require the configured downstream score advantage',
      horizon: planning.horizon,
      attackAdvantageRequired: planning.attackAdvantageRequired,
      guardianDeficitAdvantageRequired: planning.guardianDeficitAdvantageRequired
    },
    planning: {
      shopPlan: [...planning.shopPlan],
      decisions: planning.decisions
    }
  };
}
