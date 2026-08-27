import { runGreedyShopStrategy } from './greedy-strategy.js';

export const EXPERT_NO_HP_STRATEGY_ID = 'expert:def-threshold-no-hp';
const EXPERT_OPTIONS = Object.freeze(['def', 'atk']);
const LATE_BOSSES = new Set(['palaceWarden', 'blackSealKeeper', 'finalQueen', 'voidCore']);

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

/**
 * Coarse downstream utility for generation-time planning.
 * Progress dominates everything; once two continuations reach the same stage,
 * retained HP and lower battle damage decide. DEF wins near-ties outside this
 * score, so ATK is selected only when it creates a meaningful threshold gain.
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

function simulatePlan({ plan, holyPolicy, maxIterations }) {
  return runGreedyShopStrategy({
    shopCycle: ['def'],
    shopPlan: plan,
    holyPolicy,
    maxIterations
  });
}

function bestContinuation({ prefix, horizon, holyPolicy, maxIterations }) {
  const candidates = enumeratePatterns(horizon).map((pattern) => {
    const plan = [...prefix, ...pattern];
    const report = simulatePlan({ plan, holyPolicy, maxIterations });
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
    if (!existing || candidate.score > existing.score) bestByFirst[candidate.first] = candidate;
  }
  return bestByFirst;
}

/**
 * Build a receding-horizon shop plan that never buys HP.
 *
 * Default behavior is intentionally defensive: future purchases fall back to
 * DEF and ATK must beat the best DEF-first continuation by a material amount.
 * A two-purchase horizon lets the planner see common +10 ATK breakpoints even
 * when a single +5 purchase would not yet change a battle result.
 */
export function buildExpertNoHpShopPlan({
  holyPolicy = 'immediate',
  maxIterations = 8_000,
  horizon = 2,
  maxDecisions = 48,
  attackAdvantageRequired = 2_000
} = {}) {
  if (!Number.isInteger(horizon) || horizon < 1 || horizon > 4) {
    throw new Error('expert strategy horizon must be an integer from 1 to 4.');
  }
  if (!Number.isInteger(maxDecisions) || maxDecisions < 1) {
    throw new Error('expert strategy maxDecisions must be a positive integer.');
  }

  const shopPlan = [];
  const decisions = [];
  let probe = simulatePlan({ plan: shopPlan, holyPolicy, maxIterations });

  for (let decision = 0; decision < maxDecisions; decision += 1) {
    if (probe.purchases <= shopPlan.length) break;

    const best = bestContinuation({
      prefix: shopPlan,
      horizon,
      holyPolicy,
      maxIterations
    });
    const defCandidate = best.def;
    const atkCandidate = best.atk;

    let selected = 'def';
    if (!defCandidate && atkCandidate) {
      selected = 'atk';
    } else if (atkCandidate && defCandidate
      && atkCandidate.score > defCandidate.score + attackAdvantageRequired) {
      selected = 'atk';
    }

    const selectedCandidate = best[selected];
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
      projectedFloor: selectedCandidate?.report?.floor ?? null,
      projectedSolvable: Boolean(selectedCandidate?.report?.solvable)
    });

    probe = simulatePlan({ plan: shopPlan, holyPolicy, maxIterations });
  }

  return {
    strategyId: EXPERT_NO_HP_STRATEGY_ID,
    shopPlan,
    decisions,
    horizon,
    maxDecisions,
    attackAdvantageRequired,
    planningProbe: probe
  };
}

export function runExpertNoHpStrategy(options = {}) {
  const {
    holyPolicy = 'immediate',
    maxIterations = 8_000
  } = options;
  const planning = buildExpertNoHpShopPlan(options);
  const report = simulatePlan({
    plan: planning.shopPlan,
    holyPolicy,
    maxIterations
  });

  return {
    ...report,
    strategyId: EXPERT_NO_HP_STRATEGY_ID,
    strategy: {
      shopHpAllowed: false,
      defaultInvestment: 'def',
      attackRule: 'select ATK only when bounded downstream lookahead beats DEF by the configured threshold',
      horizon: planning.horizon,
      attackAdvantageRequired: planning.attackAdvantageRequired
    },
    planning: {
      shopPlan: [...planning.shopPlan],
      decisions: planning.decisions
    }
  };
}
