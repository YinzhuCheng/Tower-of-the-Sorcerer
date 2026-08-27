import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import { replayTowerCertificateToState } from '../solver/replay.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { resolveReviewCandidateReference } from '../tuner/review-candidate-reference.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';

export function normalizeGoalCaps(goalCaps = [64, 128, 256, 512]) {
  const caps = [...new Set(goalCaps.map(Number).filter((value) => Number.isInteger(value) && value > 0))]
    .sort((a, b) => a - b);
  if (!caps.length) throw new Error('At least one positive c6 goal cap is required.');
  return caps;
}

/**
 * Pure boundary-coverage diagnostic. It intentionally does not run tight-bound
 * DP, c7 continuation, or terminal suffixes. Each cap is a fresh deterministic
 * c6 threshold-frontier run and later rounds stop automatically after exact
 * exhaustion is observed.
 */
export function analyzeV3C6BoundaryGrowth({
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
        model: 'v3-c6-boundary-growth-v0.1',
        status: 'candidate-snapshot-drift',
        productionWriteAllowed: false,
        exactNoExploit: false,
        referenceFailures: reference.failures ?? ['reference_resolution_failed']
      };
    }
    const threshold = reference.terminalHp;
    const thresholdAdapter = createObjectiveThresholdAdapter({ threshold, baseAdapter: fixedAdapter });
    const boundaryAdapter = createCoreBoundaryAdapter({ targetCores, baseAdapter: thresholdAdapter });
    const rounds = [];
    for (const maxGoals of caps) {
      const frontier = collectGoalFrontier({
        adapter: boundaryAdapter,
        maxExpanded,
        maxGenerated,
        maxGoals,
        solverVersion: `v3-c6-boundary-growth-v0.1-g${maxGoals}`
      });
      let replayVerifiedGoals = 0;
      let thresholdRelevantGoals = 0;
      const purchaseHistogram = {};
      for (const goal of frontier.goals) {
        const replay = replayTowerCertificateToState(goal.certificate, { adapter: boundaryAdapter });
        if (!replay.ok || !replay.state) continue;
        replayVerifiedGoals += 1;
        const upper = fixedAdapter.objectiveUpperBound(replay.state);
        if (!(upper > threshold)) continue;
        thresholdRelevantGoals += 1;
        const key = String(replay.state.shopPurchases);
        purchaseHistogram[key] = (purchaseHistogram[key] ?? 0) + 1;
      }
      rounds.push({
        maxGoals,
        coverageExact: frontier.coverageExact,
        stoppedReason: frontier.stoppedReason,
        activeGoalLabels: frontier.activeGoalLabels,
        goalStructuralStates: frontier.goalStructuralStates,
        goalFrontierPeak: frontier.goalFrontierPeak,
        replayVerifiedGoals,
        thresholdRelevantGoals,
        purchaseHistogram,
        expandedStates: frontier.expandedStates,
        generatedStates: frontier.generatedStates,
        prunedDominated: frontier.prunedDominated,
        stalePops: frontier.stalePops,
        structuralStates: frontier.structuralStates,
        activeSearchLabels: frontier.activeSearchLabels,
        frontierPeak: frontier.frontierPeak,
        profile: frontier.profile
      });
      if (frontier.coverageExact) break;
    }
    const last = rounds.at(-1);
    const deltas = rounds.slice(1).map((round, index) => {
      const previous = rounds[index];
      return {
        fromCap: previous.maxGoals,
        toCap: round.maxGoals,
        goalDelta: round.activeGoalLabels - previous.activeGoalLabels,
        structuralDelta: round.goalStructuralStates - previous.goalStructuralStates,
        expandedDelta: round.expandedStates - previous.expandedStates,
        generatedDelta: round.generatedStates - previous.generatedStates
      };
    });
    return {
      schemaVersion: 1,
      model: 'v3-c6-boundary-growth-v0.1',
      status: 'diagnostic-complete',
      productionWriteAllowed: false,
      exactNoExploit: false,
      reference: {
        terminalHp: threshold,
        minNormalizedHpMargin: reference.minNormalizedHpMargin
      },
      targetCores,
      caps,
      rounds,
      deltas,
      exactBoundaryFound: Boolean(last?.coverageExact),
      interpretation: last?.coverageExact
        ? 'c6_threshold_boundary_exhausted_exactly_within_the_profiled_goal_cap_ladder'
        : 'c6_threshold_boundary_continues_to_hit_the_configured_goal_caps_and_needs_state_factorization_or_a_larger_justified_coverage_step'
    };
  });
}
