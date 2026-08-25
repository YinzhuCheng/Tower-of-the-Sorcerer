import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import { replayTowerCertificate, replayTowerStepSkeleton } from '../solver/replay.js';
import { solve } from '../solver/search.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { resolveReviewCandidateReference } from '../tuner/review-candidate-reference.js';
import { cloneReviewCandidate } from '../tuner/review-candidates.js';

function compactSolver(report) {
  return {
    solvable: report.solvable,
    exact: report.exact,
    stoppedReason: report.stoppedReason,
    expandedStates: report.expandedStates,
    generatedStates: report.generatedStates,
    prunedDominated: report.prunedDominated,
    prunedBound: report.prunedBound,
    structuralStates: report.structuralStates,
    activeLabels: report.activeLabels,
    frontierPeak: report.frontierPeak,
    certificateHash: report.certificate?.certificateHash ?? null,
    certificateSteps: report.certificate?.steps?.length ?? 0,
    profile: report.profile
  };
}

/**
 * Whole-game fixed-purchase threshold proof whose reference is an explicitly
 * replayed player witness rather than a greedy route.
 *
 * The threshold is trusted only after `resolveReviewCandidateReference()` has
 * matched witness hash/purchase policy and replayed the skeleton under the
 * current candidate overlay. Search then asks whether any legal event order with
 * the same fixed purchase policy can finish strictly above that HP.
 */
export function analyzeEventOrderThresholdAgainstReferenceWitness({
  candidate,
  referenceWitness,
  maxExpanded = 50_000,
  maxGenerated = 400_000
} = {}) {
  const snapshot = cloneReviewCandidate(candidate);
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
    if (!reference.ok) {
      return {
        schemaVersion: 1,
        model: 'event-order-witness-threshold-proof-v0.1',
        candidateId: snapshot.id,
        status: 'candidate-reference-drift',
        productionWriteAllowed: false,
        reference,
        exploitFound: false,
        exactNoExploit: false,
        solver: null,
        exploit: null
      };
    }

    const thresholdAdapter = createObjectiveThresholdAdapter({
      threshold: reference.terminalHp,
      baseAdapter: fixedAdapter
    });
    const solver = solve({
      adapter: thresholdAdapter,
      mode: 'existence',
      maxExpanded,
      maxGenerated,
      solverVersion: `event-order-witness-threshold:${snapshot.id}:v0.1`
    });
    const replay = solver.certificate
      ? replayTowerCertificate(solver.certificate, { adapter: thresholdAdapter })
      : null;
    const exploitFound = solver.solvable === true
      && replay?.ok === true
      && replay.objective > reference.terminalHp;
    const exactNoExploit = solver.solvable === false && solver.exact === true;
    const exploitSkeletonReplay = exploitFound
      ? replayTowerStepSkeleton(solver.certificate.steps, { adapter: fixedAdapter })
      : null;

    return {
      schemaVersion: 1,
      model: 'event-order-witness-threshold-proof-v0.1',
      candidateId: snapshot.id,
      status: exploitFound
        ? 'exploit-found'
        : exactNoExploit
          ? 'exact-no-exploit'
          : 'coverage-incomplete',
      productionWriteAllowed: false,
      threshold: {
        objective: 'terminal_hp',
        strictGreaterThan: reference.terminalHp
      },
      reference: {
        mode: reference.mode,
        terminalHp: reference.terminalHp,
        minNormalizedHpMargin: reference.minNormalizedHpMargin,
        witnessHash: reference.referenceWitnessHash,
        purchaseCount: reference.purchaseCount,
        holyCollected: reference.holyCollected
      },
      exploitFound,
      exactNoExploit,
      solver: compactSolver(solver),
      exploit: exploitFound ? {
        terminalHp: replay.objective,
        deltaHp: replay.objective - reference.terminalHp,
        relativeGain: (replay.objective - reference.terminalHp) / Math.max(1, reference.terminalHp),
        certificateHash: solver.certificate?.certificateHash ?? null,
        authoritativeReplay: replay.ok,
        skeletonReplay: exploitSkeletonReplay ? {
          ok: exploitSkeletonReplay.ok,
          objective: exploitSkeletonReplay.objective,
          minNormalizedHpMargin: exploitSkeletonReplay.minNormalizedHpMargin,
          failures: exploitSkeletonReplay.failures
        } : null,
        final: replay.final
      } : null,
      interpretation: exploitFound
        ? 'authoritative_fixed_purchase_event_order_route_beats_the_replayed_reference_witness'
        : exactNoExploit
          ? 'whole_fixed_purchase_event_order_space_exhausted_above_replayed_reference_threshold'
          : 'no_superior_event_order_found_within_current_whole_game_threshold_budget'
    };
  });
}
