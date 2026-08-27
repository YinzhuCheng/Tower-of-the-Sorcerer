import { ENEMIES } from '../game/data.js';
import { analyzeSinglePurchaseCounterfactuals } from '../analyzer/purchase-counterfactuals.js';
import { optimizePurchasePlanLocally } from '../analyzer/purchase-local-search.js';
import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { solve } from '../solver/search.js';
import { createTowerAdapter } from '../solver/tower-adapter.js';
import { PROMOTED_PURCHASE_PLANS } from '../solver/tower-incumbent.js';
import { withBalanceEdits } from './balance-overlay.js';
import { PRESSURE_TARGET_BAND } from './numeric-evaluator.js';
import {
  PRESSURE_TARGET_MIDPOINT,
  deriveFinalMagicPower
} from './final-pressure-tuner.js';

function promotedPlan() {
  const plan = PROMOTED_PURCHASE_PLANS[0];
  if (!plan) throw new Error('Adaptive tuner requires a promoted purchase plan.');
  return plan;
}

function runPlan({ cycle, shopPlan, holyPolicy }) {
  return runGreedyShopStrategy({
    shopCycle: [...cycle],
    shopPlan: [...shopPlan],
    holyPolicy
  });
}

function voidCoreCheckpoint(route) {
  return route.battleLog.find((entry) => entry.enemyId === 'voidCore') ?? null;
}

function pressureStatus(margin) {
  if (!Number.isFinite(margin)) return 'unknown';
  if (margin < PRESSURE_TARGET_BAND[0]) return 'too_harsh';
  if (margin > PRESSURE_TARGET_BAND[1]) return 'too_forgiving';
  return 'target';
}

function hpEdits(hpReward) {
  return [
    { target: 'shop', id: 'hp', field: 'effect.hp', value: hpReward },
    { target: 'shop', id: 'hp', field: 'effect.maxHp', value: hpReward }
  ];
}

function fullEdits(hpReward, magicPower) {
  return [
    ...hpEdits(hpReward),
    { target: 'enemy', id: 'voidCore', field: 'magicPower', value: magicPower }
  ];
}

function optimizePlanUnderOverlay({
  hpReward,
  magicPower,
  seedPlan,
  maxLocalPasses
}) {
  return withBalanceEdits(fullEdits(hpReward, magicPower), () => {
    const seedResult = runPlan(seedPlan);
    if (!seedResult.solvable) {
      return {
        ok: false,
        reason: 'seed_plan_failed',
        failure: seedResult.failure,
        seedResult
      };
    }

    const seedEntry = {
      id: `adaptive-seed-hp${hpReward}-m${magicPower}`,
      cycle: [...seedPlan.cycle],
      holyPolicy: seedPlan.holyPolicy,
      result: seedResult
    };
    const localSearch = optimizePurchasePlanLocally({
      seedEntry,
      maxPasses: maxLocalPasses
    });
    const route = localSearch.bestResult;
    const checkpoint = voidCoreCheckpoint(route);
    if (!checkpoint) {
      return {
        ok: false,
        reason: 'void_core_not_reached',
        localSearch,
        route
      };
    }

    return {
      ok: true,
      localSearch,
      route,
      checkpoint,
      plan: {
        cycle: [...seedPlan.cycle],
        shopPlan: [...localSearch.bestPlan],
        holyPolicy: seedPlan.holyPolicy
      }
    };
  });
}

/**
 * Finds a fixed point between game balance and a locally adapting player.
 *
 * The candidate designer changes two knobs (shop HP reward and final-core magic
 * power). The player then performs authoritative 1-opt purchase-plan search.
 * We retarget final magic power from the player's new HP/round profile and repeat
 * until the boss parameter stabilizes or the outer iteration limit is reached.
 */
export function adaptFinalPressureCandidate({
  hpReward,
  targetMargin = PRESSURE_TARGET_MIDPOINT,
  maxOuterIterations = 6,
  maxLocalPasses = 12,
  maxExpanded = 5_000,
  maxGenerated = 50_000,
  highRegretRelative = 0.20
} = {}) {
  if (!Number.isFinite(hpReward) || hpReward <= 0) throw new Error('Adaptive tuner requires a positive hpReward.');
  const promoted = promotedPlan();
  let plan = {
    cycle: [...promoted.cycle],
    shopPlan: [...promoted.shopPlan],
    holyPolicy: promoted.holyPolicy
  };

  // First derive from the protected route under the new HP reward, while using
  // the current canonical boss magic value.
  const initialProbe = withBalanceEdits(hpEdits(hpReward), () => runPlan(plan));
  if (!initialProbe.solvable) {
    return {
      schemaVersion: 1,
      model: 'adaptive-final-pressure-v0.1',
      hpReward,
      acceptedHardConstraints: false,
      rejection: 'protected_plan_failed_before_magic_tuning',
      failure: initialProbe.failure,
      iterations: []
    };
  }
  const initialCheckpoint = voidCoreCheckpoint(initialProbe);
  if (!initialCheckpoint) throw new Error('Initial adaptive probe did not reach voidCore.');
  let derived = deriveFinalMagicPower({
    hpBefore: initialCheckpoint.statsBefore.hp,
    counterAttacks: initialCheckpoint.battle.counterAttacks,
    ward: initialProbe.relics.ward,
    targetMargin,
    minMagicPower: ENEMIES.voidCore.magicPower
  });
  let magicPower = derived.magicPower;
  const iterations = [];
  let converged = false;
  let latest = null;

  for (let outer = 1; outer <= maxOuterIterations; outer += 1) {
    latest = optimizePlanUnderOverlay({
      hpReward,
      magicPower,
      seedPlan: plan,
      maxLocalPasses
    });
    if (!latest.ok) {
      return {
        schemaVersion: 1,
        model: 'adaptive-final-pressure-v0.1',
        hpReward,
        magicPower,
        targetMargin,
        acceptedHardConstraints: false,
        rejection: latest.reason,
        failure: latest.failure ?? latest.route?.failure ?? null,
        iterations
      };
    }

    const checkpoint = latest.checkpoint;
    const actualMargin = checkpoint.normalizedHpMargin;
    derived = deriveFinalMagicPower({
      hpBefore: checkpoint.statsBefore.hp,
      counterAttacks: checkpoint.battle.counterAttacks,
      ward: latest.route.relics.ward,
      targetMargin,
      minMagicPower: ENEMIES.voidCore.magicPower
    });
    iterations.push({
      outer,
      magicPower,
      nextMagicPower: derived.magicPower,
      terminalHp: latest.route.final.hp,
      minNormalizedHpMargin: latest.route.minNormalizedHpMargin,
      voidCoreMargin: actualMargin,
      voidCoreHpBefore: checkpoint.statsBefore.hp,
      voidCoreCounterAttacks: checkpoint.battle.counterAttacks,
      purchaseCounts: { ...latest.route.purchaseCounts },
      localImprovementPasses: latest.localSearch.improvementPasses,
      localOptimal: latest.localSearch.localOptimal,
      shopPlan: [...latest.plan.shopPlan]
    });

    plan = latest.plan;
    if (derived.magicPower === magicPower) {
      converged = true;
      break;
    }
    magicPower = derived.magicPower;
  }

  // Re-run the final plan under the final parameter pair and gather proof-level
  // existence plus one-purchase robustness metrics.
  const finalEvaluation = withBalanceEdits(fullEdits(hpReward, magicPower), () => {
    const route = runPlan(plan);
    if (!route.solvable) return { route, solverReport: null, counterfactuals: null };

    const adapter = createTowerAdapter();
    const solverReport = solve({
      adapter,
      mode: 'existence',
      maxExpanded,
      maxGenerated
    });
    const bestEntry = {
      id: `adaptive-hp${hpReward}-m${magicPower}`,
      cycle: [...plan.cycle],
      holyPolicy: plan.holyPolicy,
      source: 'adaptive-balance-response',
      result: route
    };
    const counterfactuals = analyzeSinglePurchaseCounterfactuals({
      bestEntry,
      highRegretRelative
    });
    return { route, solverReport, counterfactuals };
  });

  const route = finalEvaluation.route;
  const solverReport = finalEvaluation.solverReport;
  const counterfactuals = finalEvaluation.counterfactuals;
  const pressureMargin = route?.minNormalizedHpMargin ?? null;
  const pressure = pressureStatus(pressureMargin);
  const hardChecks = {
    adaptedRouteSolvable: Boolean(route?.solvable),
    exactExistence: solverReport?.solvable === true && solverReport?.exact === true,
    pressureTarget: pressure === 'target',
    recovery: (counterfactuals?.recoveryRate ?? 0) >= 0.60,
    catastrophic: (counterfactuals?.catastrophicRate ?? 1) <= 0.10
  };
  const acceptedHardConstraints = Object.values(hardChecks).every(Boolean);

  return {
    schemaVersion: 1,
    model: 'adaptive-final-pressure-v0.1',
    hpReward,
    magicPower,
    targetMargin,
    converged,
    iterations,
    acceptedHardConstraints,
    hardChecks,
    rejection: acceptedHardConstraints ? null : 'adaptive_hard_constraints_failed',
    plan: {
      cycle: [...plan.cycle],
      shopPlan: [...plan.shopPlan],
      holyPolicy: plan.holyPolicy
    },
    route: route ? {
      solvable: route.solvable,
      final: { ...route.final },
      purchases: route.purchases,
      purchaseCounts: { ...route.purchaseCounts },
      minNormalizedHpMargin: route.minNormalizedHpMargin,
      tightestBattle: [...route.battleLog]
        .sort((a, b) => a.normalizedHpMargin - b.normalizedHpMargin)[0] ?? null
    } : null,
    solver: solverReport ? {
      solvable: solverReport.solvable,
      exact: solverReport.exact,
      stoppedReason: solverReport.stoppedReason,
      expandedStates: solverReport.expandedStates,
      generatedStates: solverReport.generatedStates,
      certificateHash: solverReport.certificate?.certificateHash ?? null
    } : null,
    counterfactuals: counterfactuals ? {
      totalMutations: counterfactuals.totalMutations,
      recoveryRate: counterfactuals.recoveryRate,
      catastrophicRate: counterfactuals.catastrophicRate,
      highRegretRate: counterfactuals.highRegretRate,
      medianNormalizedRegret: counterfactuals.medianNormalizedRegret,
      p90NormalizedRegret: counterfactuals.p90NormalizedRegret,
      maxNormalizedRegret: counterfactuals.maxNormalizedRegret,
      improvedMutationCount: counterfactuals.improvedMutationCount,
      bestMutation: counterfactuals.bestMutation,
      mostSensitivePurchases: counterfactuals.mostSensitivePurchases
    } : null
  };
}
