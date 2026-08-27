import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { PROMOTED_PURCHASE_PLANS } from '../solver/tower-incumbent.js';
import { withBalanceEdits } from './balance-overlay.js';
import { PRESSURE_TARGET_BAND } from './numeric-evaluator.js';
import {
  listNumericMutationParameters,
  proposeDirectionalMutation
} from './numeric-mutation-space.js';

function protectedPlan() {
  const plan = PROMOTED_PURCHASE_PLANS[0];
  if (!plan) throw new Error('Numeric sensitivity screening requires a promoted purchase plan.');
  return plan;
}

function runPlan(plan) {
  return runGreedyShopStrategy({
    shopCycle: [...plan.cycle],
    shopPlan: [...plan.shopPlan],
    holyPolicy: plan.holyPolicy
  });
}

function routePressure(route) {
  const battle = [...(route.battleLog ?? [])]
    .filter((entry) => Number.isFinite(entry.normalizedHpMargin))
    .sort((a, b) => a.normalizedHpMargin - b.normalizedHpMargin)[0] ?? null;
  return {
    minNormalizedHpMargin: battle?.normalizedHpMargin ?? null,
    tightestBattle: battle
  };
}

function distanceToBand(value, [low, high] = PRESSURE_TARGET_BAND) {
  if (!Number.isFinite(value)) return Number.POSITIVE_INFINITY;
  const width = Math.max(1e-9, high - low);
  if (value < low) return (low - value) / width;
  if (value > high) return (value - high) / width;
  return 0;
}

function battleUrgency(entry) {
  const margin = Number.isFinite(entry.normalizedHpMargin) ? entry.normalizedHpMargin : 1;
  return 1 / Math.max(0.08, 0.08 + Math.max(0, margin));
}

function battleDamageShare(entry) {
  const hpBefore = entry.statsBefore?.hp ?? 0;
  const damage = entry.battle?.totalDamage ?? 0;
  if (!Number.isFinite(hpBefore) || hpBefore <= 0 || !Number.isFinite(damage)) return 0;
  return Math.max(0, damage / hpBefore);
}

function enemyFieldWeight(field) {
  if (field === 'magicPower') return 1.35;
  if (field === 'atk') return 1.10;
  if (field === 'def') return 1.00;
  if (field === 'hp') return 0.95;
  if (field === 'gold') return 0.30;
  return 0.50;
}

function shopFieldWeight(fields) {
  const joined = fields.join('+');
  if (joined.includes('hp')) return 1.30;
  if (joined.includes('atk')) return 1.05;
  if (joined.includes('def')) return 1.05;
  return 0.75;
}

/**
 * Cheap, trace-only priority estimate. It is deliberately not a balance score:
 * its only job is to decide which parameters deserve an authoritative finite
 * difference probe before expensive adaptive-player / exact-solver work.
 */
export function rankTraceNumericParameters({
  route,
  parameters = listNumericMutationParameters()
} = {}) {
  if (!route?.solvable) throw new Error('Trace ranking requires a solvable authoritative route.');
  const battlesByEnemy = new Map();
  for (const battle of route.battleLog ?? []) {
    const list = battlesByEnemy.get(battle.enemyId) ?? [];
    list.push(battle);
    battlesByEnemy.set(battle.enemyId, list);
  }
  const purchaseTotal = Math.max(1, route.purchases ?? 0);

  return parameters.map((parameter) => {
    let traceScore = 0;
    let confidence = 'catalog-only';
    let observations = 0;
    let reason = 'No representative-route observation is available yet.';

    if (parameter.family === 'enemy') {
      const battles = battlesByEnemy.get(parameter.id) ?? [];
      observations = battles.length;
      if (battles.length > 0) {
        confidence = 'authoritative-battle-trace';
        const field = parameter.fields[0];
        const signal = battles.reduce((sum, battle) => {
          const urgency = battleUrgency(battle);
          const damage = battleDamageShare(battle);
          return sum + (0.20 + damage) * (0.75 + urgency);
        }, 0);
        traceScore = signal * enemyFieldWeight(field);
        reason = `${battles.length} authoritative battle observation(s); field=${field}.`;
      }
    } else if (parameter.family === 'shop') {
      const purchases = route.purchaseCounts?.[parameter.id] ?? 0;
      observations = purchases;
      if (purchases > 0) {
        confidence = 'authoritative-purchase-trace';
        traceScore = (purchases / purchaseTotal) * shopFieldWeight(parameter.fields) * 4;
        reason = `${purchases}/${purchaseTotal} representative purchases use this option.`;
      }
    } else if (parameter.family === 'item') {
      // The deterministic runner does not yet expose a pickup log with semantic
      // item IDs. Keep item parameters in the mutation catalogue, but do not
      // invent leverage until that instrumentation exists.
      confidence = 'catalog-only';
      traceScore = 0;
      reason = 'Item pickup leverage awaits semantic pickup-log instrumentation.';
    }

    return {
      parameter,
      traceScore,
      confidence,
      observations,
      reason
    };
  }).sort((a, b) =>
    b.traceScore - a.traceScore || a.parameter.key.localeCompare(b.parameter.key)
  );
}

function probeOne({ plan, baselineRoute, baselinePressure, ranked, relativeStep }) {
  const mutation = proposeDirectionalMutation(ranked.parameter, {
    relativeStep,
    direction: 'harder'
  });
  if (!mutation) {
    return {
      ...ranked,
      mutation: null,
      skipped: true,
      reason: 'Parameter is already at its directional bound.'
    };
  }

  const mutatedRoute = withBalanceEdits(mutation.edits, () => runPlan(plan));
  if (!mutatedRoute.solvable) {
    return {
      ...ranked,
      mutation,
      skipped: false,
      cliffAtProbe: true,
      routeSolvable: false,
      failure: mutatedRoute.failure ?? null,
      screenScore: Number.NEGATIVE_INFINITY,
      pressureGain: null,
      targetImprovement: null,
      terminalHpDelta: null
    };
  }

  const mutatedPressure = routePressure(mutatedRoute);
  const beforeMargin = baselinePressure.minNormalizedHpMargin;
  const afterMargin = mutatedPressure.minNormalizedHpMargin;
  const pressureGain = Number.isFinite(beforeMargin) && Number.isFinite(afterMargin)
    ? beforeMargin - afterMargin
    : 0;
  const beforeDistance = distanceToBand(beforeMargin);
  const afterDistance = distanceToBand(afterMargin);
  const targetImprovement = beforeDistance - afterDistance;
  const relativeEdit = Math.max(1e-9, mutation.relativeEdit);
  const screenScore = targetImprovement / relativeEdit;

  return {
    ...ranked,
    mutation,
    skipped: false,
    cliffAtProbe: false,
    routeSolvable: true,
    failure: null,
    baseline: {
      finalHp: baselineRoute.final.hp,
      minNormalizedHpMargin: beforeMargin,
      targetDistance: beforeDistance
    },
    mutated: {
      finalHp: mutatedRoute.final.hp,
      minNormalizedHpMargin: afterMargin,
      targetDistance: afterDistance,
      tightestBattle: mutatedPressure.tightestBattle ? {
        floor: mutatedPressure.tightestBattle.floor,
        enemyId: mutatedPressure.tightestBattle.enemyId,
        enemyName: mutatedPressure.tightestBattle.enemyName
      } : null
    },
    pressureGain,
    targetImprovement,
    terminalHpDelta: mutatedRoute.final.hp - baselineRoute.final.hp,
    pressureSensitivityPerRelativeEdit: pressureGain / relativeEdit,
    screenScore
  };
}

/**
 * Two-stage numeric lever screening:
 * 1. rank the full catalogue using existing authoritative traces;
 * 2. finite-difference only the Top-K using temporary authoritative overlays.
 *
 * The result is a shortlist, not a publishable balance proposal. No independent
 * solver proof or adaptive-player best response is performed here.
 */
export function screenNumericLevers({
  staticTopK = 16,
  probeRelativeStep = 0.10,
  parameters = listNumericMutationParameters()
} = {}) {
  if (!Number.isInteger(staticTopK) || staticTopK <= 0) throw new Error('staticTopK must be a positive integer.');
  if (!Number.isFinite(probeRelativeStep) || probeRelativeStep <= 0) {
    throw new Error('probeRelativeStep must be a positive finite number.');
  }

  const plan = protectedPlan();
  const baselineRoute = runPlan(plan);
  if (!baselineRoute.solvable) {
    throw new Error(`Protected route is not solvable before sensitivity screening: ${baselineRoute.failure ?? 'unknown failure'}`);
  }
  const baselinePressure = routePressure(baselineRoute);
  const traceRanking = rankTraceNumericParameters({ route: baselineRoute, parameters });
  const selected = traceRanking
    .filter((entry) => entry.traceScore > 0)
    .slice(0, staticTopK);
  const probes = selected.map((ranked) => probeOne({
    plan,
    baselineRoute,
    baselinePressure,
    ranked,
    relativeStep: probeRelativeStep
  })).sort((a, b) => {
    if (a.cliffAtProbe !== b.cliffAtProbe) return a.cliffAtProbe ? 1 : -1;
    const scoreA = Number.isFinite(a.screenScore) ? a.screenScore : Number.NEGATIVE_INFINITY;
    const scoreB = Number.isFinite(b.screenScore) ? b.screenScore : Number.NEGATIVE_INFINITY;
    return scoreB - scoreA || b.traceScore - a.traceScore || a.parameter.key.localeCompare(b.parameter.key);
  });

  return {
    schemaVersion: 1,
    model: 'numeric-lever-screen-v0.1',
    confidence: 'authoritative-representative-route-finite-difference',
    publishable: false,
    baseline: {
      strategyId: plan.id,
      finalHp: baselineRoute.final.hp,
      minNormalizedHpMargin: baselinePressure.minNormalizedHpMargin,
      pressureTargetBand: [...PRESSURE_TARGET_BAND]
    },
    catalogueSize: parameters.length,
    staticTopK,
    probeRelativeStep,
    traceRanking,
    probes
  };
}
