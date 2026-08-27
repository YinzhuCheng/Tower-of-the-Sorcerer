import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { createFixedPurchaseZeroDamageClosureAdapter } from '../solver/fixed-purchase-zero-damage-closure-adapter.js';
import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import { replayTowerCertificateToState } from '../solver/replay.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { resolveReviewCandidateReference } from '../tuner/review-candidate-reference.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';
import { normalizeGoalCaps } from './event-order-c6-boundary-growth.js';

function histogram(values) {
  const out = {};
  for (const value of values) out[String(value)] = (out[String(value)] ?? 0) + 1;
  return out;
}

/**
 * Re-run the c6 boundary ladder under the proof-preserving current-floor Lucky
 * zero-damage enemy normalization. This is the A/B test required before the
 * closure is used by any staged V3 event-order proof workflow.
 */
export function analyzeV3C6ZeroDamageClosureGrowth({
  candidate = REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness = null,
  targetCores = 6,
  goalCaps = [64, 128, 256, 512],
  maxExpanded = 50_000,
  maxGenerated = 700_000
} = {}) {
  const snapshot = cloneReviewCandidate(candidate);
  const caps = normalizeGoalCaps(goalCaps);
  return withBalanceEdits(snapshot.edits, () => {
    const fixedAdapter = createFixedPurchasePolicyTowerAdapter({
      shopPlan: snapshot.purchasePolicy.shopPlan,
      shopCycle: snapshot.purchasePolicy.shopCycle
    });
    const reference = resolveReviewCandidateReference({
      candidate: snapshot,
      adapter: fixedAdapter,
      referenceWitness
    });
    if (!reference.ok || !Number.isFinite(reference.terminalHp)) {
      return {
        schemaVersion: 1,
        model: 'v3-c6-zero-damage-closure-growth-v0.1',
        status: 'candidate-snapshot-drift',
        productionWriteAllowed: false,
        exactNoExploit: false,
        referenceFailures: reference.failures ?? ['reference_resolution_failed']
      };
    }

    const closureAdapter = createFixedPurchaseZeroDamageClosureAdapter({ baseAdapter: fixedAdapter });
    const threshold = reference.terminalHp;
    const thresholdAdapter = createObjectiveThresholdAdapter({ threshold, baseAdapter: closureAdapter });
    const boundaryAdapter = createCoreBoundaryAdapter({ targetCores, baseAdapter: thresholdAdapter });
    const rounds = [];

    for (const maxGoals of caps) {
      const frontier = collectGoalFrontier({
        adapter: boundaryAdapter,
        maxExpanded,
        maxGenerated,
        maxGoals,
        solverVersion: `v3-c6-zero-damage-closure-growth-v0.1-g${maxGoals}`
      });
      let replayVerifiedGoals = 0;
      let thresholdRelevantGoals = 0;
      let automaticClosureKillSteps = 0;
      const automaticKillsPerGoal = [];
      const purchaseCounts = [];

      for (const goal of frontier.goals) {
        const replay = replayTowerCertificateToState(goal.certificate, { adapter: boundaryAdapter });
        if (!replay.ok || !replay.state) continue;
        replayVerifiedGoals += 1;
        const upperBound = fixedAdapter.objectiveUpperBound(replay.state);
        if (!(upperBound > threshold)) continue;
        thresholdRelevantGoals += 1;
        purchaseCounts.push(replay.state.shopPurchases);
        const kills = (goal.certificate.steps ?? []).filter((step) =>
          step.normalizationRule === 'lucky-zero-damage-enemy-v1'
        ).length;
        automaticClosureKillSteps += kills;
        automaticKillsPerGoal.push(kills);
      }

      rounds.push({
        maxGoals,
        coverageExact: frontier.coverageExact,
        stoppedReason: frontier.stoppedReason,
        activeGoalLabels: frontier.activeGoalLabels,
        goalStructuralStates: frontier.goalStructuralStates,
        replayVerifiedGoals,
        thresholdRelevantGoals,
        purchaseHistogram: histogram(purchaseCounts),
        automaticClosureKillSteps,
        automaticKillsPerGoalHistogram: histogram(automaticKillsPerGoal),
        expandedStates: frontier.expandedStates,
        generatedStates: frontier.generatedStates,
        prunedDominated: frontier.prunedDominated,
        stalePops: frontier.stalePops,
        structuralStates: frontier.structuralStates,
        activeSearchLabels: frontier.activeSearchLabels,
        profile: frontier.profile
      });
      if (frontier.coverageExact) break;
    }

    const last = rounds.at(-1);
    return {
      schemaVersion: 1,
      model: 'v3-c6-zero-damage-closure-growth-v0.1',
      status: 'diagnostic-complete',
      productionWriteAllowed: false,
      exactNoExploit: false,
      reference: {
        terminalHp: threshold,
        minNormalizedHpMargin: reference.minNormalizedHpMargin
      },
      targetCores,
      caps,
      closure: closureAdapter.zeroDamageEnemyClosure,
      rounds,
      exactBoundaryFound: Boolean(last?.coverageExact),
      interpretation: last?.coverageExact
        ? 'current_floor_zero_damage_enemy_closure_makes_the_c6_threshold_boundary_exact_within_the_profiled_ladder'
        : 'current_floor_zero_damage_enemy_closure_remains_non_exact_and_its_cardinality_effect_should_be_compared_with_the_baseline_before_any_stronger_cross_floor_closure'
    };
  });
}
