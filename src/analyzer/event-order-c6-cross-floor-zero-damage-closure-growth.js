import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { createFixedPurchaseCrossFloorZeroDamageClosureAdapter } from '../solver/fixed-purchase-cross-floor-zero-damage-closure-adapter.js';
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

function stepCounts(certificate) {
  const steps = certificate?.steps ?? [];
  return {
    localZeroDamageKills: steps.filter((step) => step.normalizationRule === 'lucky-zero-damage-enemy-v1').length,
    crossFloorTeleports: steps.filter((step) => step.normalizationRule === 'compass-cross-floor-zero-damage-v1').length
  };
}

/** A/B the Compass-assisted cross-floor closure against the same c6 goal ladder. */
export function analyzeV3C6CrossFloorZeroDamageClosureGrowth({
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
        model: 'v3-c6-cross-floor-zero-damage-closure-growth-v0.1',
        status: 'candidate-snapshot-drift',
        productionWriteAllowed: false,
        exactNoExploit: false,
        referenceFailures: reference.failures ?? ['reference_resolution_failed']
      };
    }

    const closureAdapter = createFixedPurchaseCrossFloorZeroDamageClosureAdapter({ baseAdapter: fixedAdapter });
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
        solverVersion: `v3-c6-cross-floor-zero-damage-closure-growth-v0.1-g${maxGoals}`
      });
      let replayVerifiedGoals = 0;
      let thresholdRelevantGoals = 0;
      const purchases = [];
      const localKillsPerGoal = [];
      const crossTeleportsPerGoal = [];

      for (const goal of frontier.goals) {
        const replay = replayTowerCertificateToState(goal.certificate, { adapter: boundaryAdapter });
        if (!replay.ok || !replay.state) continue;
        replayVerifiedGoals += 1;
        const upperBound = fixedAdapter.objectiveUpperBound(replay.state);
        if (!(upperBound > threshold)) continue;
        thresholdRelevantGoals += 1;
        purchases.push(replay.state.shopPurchases);
        const counts = stepCounts(goal.certificate);
        localKillsPerGoal.push(counts.localZeroDamageKills);
        crossTeleportsPerGoal.push(counts.crossFloorTeleports);
      }

      rounds.push({
        maxGoals,
        coverageExact: frontier.coverageExact,
        stoppedReason: frontier.stoppedReason,
        activeGoalLabels: frontier.activeGoalLabels,
        goalStructuralStates: frontier.goalStructuralStates,
        replayVerifiedGoals,
        thresholdRelevantGoals,
        purchaseHistogram: histogram(purchases),
        localZeroDamageKillsPerGoal: histogram(localKillsPerGoal),
        crossFloorTeleportsPerGoal: histogram(crossTeleportsPerGoal),
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
      model: 'v3-c6-cross-floor-zero-damage-closure-growth-v0.1',
      status: 'diagnostic-complete',
      productionWriteAllowed: false,
      exactNoExploit: false,
      reference: {
        terminalHp: threshold,
        minNormalizedHpMargin: reference.minNormalizedHpMargin
      },
      targetCores,
      caps,
      closure: closureAdapter.crossFloorZeroDamageClosure,
      rounds,
      exactBoundaryFound: Boolean(last?.coverageExact),
      interpretation: last?.coverageExact
        ? 'Compass cross-floor monotone closure makes the profiled c6 threshold boundary exact'
        : 'Compass cross-floor monotone closure remains non-exact; compare its search cardinality and purchase timing against the local-only closure'
    };
  });
}
