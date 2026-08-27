import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { solve } from '../solver/search.js';
import { createTowerAdapter } from '../solver/tower-adapter.js';
import { PROMOTED_PURCHASE_PLANS } from '../solver/tower-incumbent.js';
import { withBalanceEdits } from './balance-overlay.js';

export const PRESSURE_TARGET_BAND = Object.freeze([0.08, 0.25]);

function distanceToBand(value, [low, high] = PRESSURE_TARGET_BAND) {
  if (!Number.isFinite(value)) return Number.POSITIVE_INFINITY;
  const scale = Math.max(1e-9, high - low);
  if (value < low) return (low - value) / scale;
  if (value > high) return (value - high) / scale;
  return 0;
}

function editDistance(edits) {
  if (!edits.length) return 0;
  return edits.reduce((sum, edit) =>
    sum + Math.abs(edit.value - edit.baseline) / Math.max(1, Math.abs(edit.baseline)), 0
  ) / edits.length;
}

function protectedPlan() {
  const plan = PROMOTED_PURCHASE_PLANS[0];
  if (!plan) throw new Error('Numeric tuner requires a promoted protected purchase plan.');
  return plan;
}

function runProtectedRoute(plan) {
  return runGreedyShopStrategy({
    shopCycle: [...plan.cycle],
    shopPlan: [...plan.shopPlan],
    holyPolicy: plan.holyPolicy
  });
}

function pressureSummary(route) {
  const battles = route.battleLog ?? [];
  const tightest = [...battles]
    .filter((entry) => Number.isFinite(entry.normalizedHpMargin))
    .sort((a, b) => a.normalizedHpMargin - b.normalizedHpMargin)[0] ?? null;
  return {
    minNormalizedHpMargin: tightest?.normalizedHpMargin ?? null,
    status: !tightest
      ? 'unknown'
      : tightest.normalizedHpMargin < PRESSURE_TARGET_BAND[0]
        ? 'too_harsh'
        : tightest.normalizedHpMargin > PRESSURE_TARGET_BAND[1]
          ? 'too_forgiving'
          : 'target',
    tightestBattle: tightest ? {
      floor: tightest.floor,
      enemyId: tightest.enemyId,
      enemyName: tightest.enemyName,
      hpBefore: tightest.statsBefore.hp,
      totalDamage: tightest.battle.totalDamage,
      hpMargin: tightest.hpMargin,
      normalizedHpMargin: tightest.normalizedHpMargin
    } : null
  };
}

/**
 * Phase-3 screening evaluator.
 *
 * Hard constraints are checked before scoring:
 * 1. the promoted 26k route must still replay to victory under the overlay;
 * 2. the macro solver must independently produce an exact existence proof.
 *
 * This deliberately protects a known certificate-like route during the first
 * numeric tuning phase. Later phases may allow the protected witness to break,
 * but only after a replacement witness has been found and replayed.
 */
export function evaluateProtectedBalanceCandidate({
  id,
  edits,
  maxExpanded = 5_000,
  maxGenerated = 50_000,
  editPenaltyWeight = 0.05
} = {}) {
  if (!id) throw new Error('Balance candidate requires an id.');
  const plan = protectedPlan();

  return withBalanceEdits(edits, (normalizedEdits) => {
    const route = runProtectedRoute(plan);
    const pressure = pressureSummary(route);
    const normalizedEditDistance = editDistance(normalizedEdits);

    if (!route.solvable) {
      return {
        id,
        acceptedHardConstraints: false,
        rejection: 'protected_route_failed',
        failure: route.failure,
        edits: normalizedEdits,
        route: {
          solvable: false,
          floor: route.floor,
          cores: route.cores,
          final: route.final
        },
        pressure,
        score: Number.POSITIVE_INFINITY
      };
    }

    const adapter = createTowerAdapter();
    const solverReport = solve({
      adapter,
      mode: 'existence',
      maxExpanded,
      maxGenerated
    });
    if (solverReport.solvable !== true || solverReport.exact !== true) {
      return {
        id,
        acceptedHardConstraints: false,
        rejection: 'existence_not_proven',
        edits: normalizedEdits,
        route: {
          solvable: true,
          final: route.final,
          cores: route.cores
        },
        pressure,
        solver: {
          solvable: solverReport.solvable,
          exact: solverReport.exact,
          stoppedReason: solverReport.stoppedReason,
          expandedStates: solverReport.expandedStates,
          generatedStates: solverReport.generatedStates
        },
        score: Number.POSITIVE_INFINITY
      };
    }

    const pressureLoss = distanceToBand(pressure.minNormalizedHpMargin);
    const editPenalty = normalizedEditDistance * editPenaltyWeight;
    return {
      id,
      acceptedHardConstraints: true,
      rejection: null,
      edits: normalizedEdits,
      contentHash: adapter.contentHash(),
      route: {
        solvable: true,
        final: { ...route.final },
        cores: route.cores,
        purchases: route.purchases,
        purchaseCounts: { ...route.purchaseCounts },
        minNormalizedHpMargin: route.minNormalizedHpMargin
      },
      pressure,
      solver: {
        solvable: solverReport.solvable,
        exact: solverReport.exact,
        stoppedReason: solverReport.stoppedReason,
        expandedStates: solverReport.expandedStates,
        generatedStates: solverReport.generatedStates,
        certificateHash: solverReport.certificate?.certificateHash ?? null
      },
      objective: {
        pressureLoss,
        editDistance: normalizedEditDistance,
        editPenalty,
        total: pressureLoss + editPenalty
      },
      score: pressureLoss + editPenalty
    };
  });
}

export function rankBalanceCandidates(candidates) {
  return [...candidates].sort((a, b) => {
    if (a.acceptedHardConstraints !== b.acceptedHardConstraints) {
      return a.acceptedHardConstraints ? -1 : 1;
    }
    return a.score - b.score || a.id.localeCompare(b.id);
  });
}
