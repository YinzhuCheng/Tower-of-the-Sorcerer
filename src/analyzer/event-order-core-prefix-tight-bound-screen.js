import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { proveFixedPurchaseBridgeBelowThreshold } from '../solver/fixed-purchase-bridge-tight-bound.js';
import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import { replayTowerCertificateToState } from '../solver/replay.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { resolveReviewCandidateReference } from '../tuner/review-candidate-reference.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';
import { summarizeTightFilteredBridges } from './event-order-core-transition-tight-filter.js';

function certificateHash(certificate) {
  return certificate?.certificateHash ?? null;
}

/**
 * Diagnostic-only screen of replay-verified c6 threshold boundary goals with the
 * same sound fixed-purchase tight bound used at c7. A closed c6 prefix would
 * eliminate all of its future c7/suffix descendants before bridge enumeration.
 *
 * This analyzer does not alter the c6 goal-frontier collector. It therefore
 * cannot claim exact no-exploit from a capped boundary even if every sampled
 * prefix is tight-bound closed.
 */
export function analyzeV3C6TightBoundScreen({
  candidate = REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness = null,
  targetCores = 6,
  boundaryMaxExpanded = 20_000,
  boundaryMaxGenerated = 250_000,
  boundaryMaxGoals = 128
} = {}) {
  const snapshot = cloneReviewCandidate(candidate);
  for (const [name, value] of Object.entries({
    targetCores,
    boundaryMaxExpanded,
    boundaryMaxGenerated,
    boundaryMaxGoals
  })) {
    if (!Number.isInteger(value) || value < 1) throw new Error(`${name} must be a positive integer.`);
  }

  return withBalanceEdits(snapshot.edits, () => {
    const policy = snapshot.purchasePolicy;
    const fixedAdapter = createFixedPurchasePolicyTowerAdapter({
      shopPlan: policy.shopPlan,
      shopCycle: policy.shopCycle
    });
    const reference = resolveReviewCandidateReference({
      candidate: snapshot,
      adapter: fixedAdapter,
      referenceWitness
    });
    if (!reference.ok || !Number.isFinite(reference.terminalHp)) {
      return {
        schemaVersion: 1,
        model: 'v3-c6-tight-bound-screen-v0.1',
        status: 'candidate-snapshot-drift',
        productionWriteAllowed: false,
        exactNoExploit: false,
        referenceFailures: reference.failures ?? ['reference_resolution_failed']
      };
    }
    const threshold = reference.terminalHp;
    const thresholdAdapter = createObjectiveThresholdAdapter({
      threshold,
      baseAdapter: fixedAdapter
    });
    const boundaryAdapter = createCoreBoundaryAdapter({
      targetCores,
      baseAdapter: thresholdAdapter
    });
    const frontier = collectGoalFrontier({
      adapter: boundaryAdapter,
      maxExpanded: boundaryMaxExpanded,
      maxGenerated: boundaryMaxGenerated,
      maxGoals: boundaryMaxGoals,
      solverVersion: `v3-c6-tight-bound-screen-v0.1-g${boundaryMaxGoals}`
    });

    const entries = [];
    let replayFailures = 0;
    let oldBoundClosed = 0;
    for (const goal of frontier.goals) {
      const replay = replayTowerCertificateToState(goal.certificate, {
        adapter: boundaryAdapter
      });
      if (!replay.ok || !replay.state) {
        replayFailures += 1;
        continue;
      }
      const oldUpperBound = fixedAdapter.objectiveUpperBound(replay.state);
      if (!Number.isFinite(oldUpperBound) || oldUpperBound <= threshold) {
        oldBoundClosed += 1;
        continue;
      }
      const proof = proveFixedPurchaseBridgeBelowThreshold({
        adapter: fixedAdapter,
        state: replay.state,
        threshold,
        shopPlan: policy.shopPlan,
        shopCycle: policy.shopCycle,
        pureHpFloorId: 7
      });
      entries.push({
        id: certificateHash(goal.certificate),
        certificateHash: certificateHash(goal.certificate),
        resources: fixedAdapter.resources(replay.state),
        shopPurchases: replay.state.shopPurchases,
        oldUpperBound,
        tightUpperBound: proof.tightUpperBound,
        boundProof: proof
      });
    }

    const summary = summarizeTightFilteredBridges(entries, threshold);
    return {
      schemaVersion: 1,
      model: 'v3-c6-tight-bound-screen-v0.1',
      status: 'diagnostic-complete',
      productionWriteAllowed: false,
      proofBoundaryModified: false,
      exactNoExploit: false,
      reference: {
        terminalHp: threshold,
        minNormalizedHpMargin: reference.minNormalizedHpMargin
      },
      frontier: {
        coverageExact: frontier.coverageExact,
        stoppedReason: frontier.stoppedReason,
        activeGoalLabels: frontier.activeGoalLabels,
        goalStructuralStates: frontier.goalStructuralStates,
        expandedStates: frontier.expandedStates,
        generatedStates: frontier.generatedStates,
        prunedDominated: frontier.prunedDominated,
        structuralStates: frontier.structuralStates,
        activeSearchLabels: frontier.activeSearchLabels
      },
      replayFailures,
      oldBoundClosed,
      screenedCount: entries.length,
      summary,
      entries,
      interpretation: summary.boundClosed > 0
        ? 'sound_tight_bounds_close_some_sampled_c6_prefixes_before_any_c7_bridge_enumeration'
        : 'sampled_c6_prefixes_remain_above_threshold_after_the_current_tight_bound_so_c6_filtering_has_no_immediate_value'
    };
  });
}
