import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import { replayTowerCertificateToState } from '../solver/replay.js';
import { solve } from '../solver/search.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { resolveReviewCandidateReference } from '../tuner/review-candidate-reference.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';

function compactSolver(report) {
  return {
    solvable: report.solvable,
    exact: report.exact,
    existenceExact: report.existenceExact,
    stoppedReason: report.stoppedReason,
    expandedStates: report.expandedStates,
    generatedStates: report.generatedStates,
    prunedDominated: report.prunedDominated,
    prunedBound: report.prunedBound,
    structuralStates: report.structuralStates,
    activeLabels: report.activeLabels,
    frontierPeak: report.frontierPeak,
    profile: report.profile,
    certificateHash: report.certificate?.certificateHash ?? null,
    certificateSteps: report.certificate?.steps?.length ?? 0
  };
}

/**
 * Pure evidence classifier used by the core-transition proof and unit tests.
 *
 * A bounded scheduler may choose any prefix seeds first for existence hunting,
 * but `exactNoTransition` is allowed only when the complete from-core boundary is
 * known, every threshold-relevant verified seed was actually attempted, and each
 * of those continuation searches ended in an exact no-transition result.
 */
export function classifyThresholdCoreTransitionEvidence({
  transitionFound = false,
  boundaryCoverageExact = false,
  verifiedRelevantSeedCount = 0,
  scheduledSeedCount = 0,
  attempts = []
} = {}) {
  const attemptedAllVerified = scheduledSeedCount === verifiedRelevantSeedCount
    && attempts.length === verifiedRelevantSeedCount;
  const allAttemptsExactNoTransition = attemptedAllVerified
    && attempts.every((attempt) => attempt.exactNoTransition === true);
  const exactNoTransition = !transitionFound
    && boundaryCoverageExact
    && attemptedAllVerified
    && allAttemptsExactNoTransition;
  return {
    attemptedAllVerified,
    allAttemptsExactNoTransition,
    exactNoTransition,
    status: transitionFound
      ? 'threshold-relevant-transition-found'
      : exactNoTransition
        ? 'no-threshold-relevant-transition-exact'
        : 'coverage-incomplete'
  };
}

/**
 * Decompose a terminal exploit proof at a mandatory core transition.
 *
 * Under the current game rules every victory must collect the next layer core.
 * Therefore a state at `fromCores` can contribute to an HP>threshold exploit only
 * if it can reach some `toCores` state whose admissible terminal-HP upper bound is
 * still above the reference. We can ask that smaller exact existence question
 * before exploring any later-floor cleanup/permutation space.
 *
 * Reference trust is unified across review-candidate generations:
 *
 * - a greedy-reference candidate is rebuilt/replayed by the deterministic runner;
 * - an event-order-reference candidate must supply its rebuilt step witness, whose
 *   hash, purchase policy, terminal HP and margin are revalidated by
 *   `resolveReviewCandidateReference()` under the candidate overlay.
 *
 * A transition certificate proves only that a threshold-relevant next-core bridge
 * exists. Exact failure from one bridge eliminates that bridge. Global no-exploit
 * through this transition requires complete from-core boundary coverage plus exact
 * failure from every relevant replay-verified bridge.
 */
export function analyzeThresholdCoreTransition({
  candidate = REVIEW_CANDIDATES.distributedPressureV1,
  referenceWitness = null,
  fromCores = 6,
  toCores = fromCores + 1,
  boundaryMaxExpanded = 8_000,
  boundaryMaxGenerated = 100_000,
  boundaryMaxGoals = 64,
  maxTransitionSeeds = 8,
  transitionMaxExpanded = 3_000,
  transitionMaxGenerated = 45_000
} = {}) {
  const snapshot = cloneReviewCandidate(candidate);
  if (!Number.isInteger(fromCores) || fromCores < 1) throw new Error('fromCores must be positive.');
  if (!Number.isInteger(toCores) || toCores <= fromCores) throw new Error('toCores must be greater than fromCores.');
  if (!Number.isInteger(boundaryMaxGoals) || boundaryMaxGoals < 1) throw new Error('boundaryMaxGoals must be positive.');
  if (!Number.isInteger(maxTransitionSeeds) || maxTransitionSeeds < 1) throw new Error('maxTransitionSeeds must be positive.');

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
    const referenceHp = reference.ok ? reference.terminalHp : null;
    if (!reference.ok || !Number.isFinite(referenceHp)) {
      return {
        schemaVersion: 2,
        model: 'event-order-core-transition-threshold-v0.2-reference-aware',
        candidateId: snapshot.id,
        status: 'candidate-snapshot-drift',
        coverageExact: false,
        transitionFound: false,
        exactNoTransition: false,
        reference: {
          mode: reference.mode ?? snapshot.expectedEvidence?.referenceMode ?? null,
          terminalHp: reference.terminalHp ?? null,
          expectedTerminalHp: snapshot.expectedEvidence?.terminalHp ?? null,
          referenceWitnessHash: reference.referenceWitnessHash ?? null,
          failures: reference.failures ?? ['reference_resolution_failed']
        },
        interpretation: 'reference_witness_or_candidate_snapshot_failed_before_threshold_boundary_search'
      };
    }

    const thresholdAdapter = createObjectiveThresholdAdapter({
      threshold: referenceHp,
      baseAdapter: fixedAdapter
    });
    const fromBoundaryAdapter = createCoreBoundaryAdapter({
      targetCores: fromCores,
      baseAdapter: thresholdAdapter
    });
    const frontier = collectGoalFrontier({
      adapter: fromBoundaryAdapter,
      maxExpanded: boundaryMaxExpanded,
      maxGenerated: boundaryMaxGenerated,
      maxGoals: boundaryMaxGoals,
      solverVersion: `fixed-purchase-core${fromCores}-threshold-boundary-v0.2`
    });

    const verifiedSeeds = frontier.goals.map((goal) => {
      const replay = replayTowerCertificateToState(goal.certificate, { adapter: fromBoundaryAdapter });
      if (!replay.ok || !replay.state) return null;
      const upper = fixedAdapter.objectiveUpperBound(replay.state);
      return {
        goal,
        replay,
        state: replay.state,
        upperBound: upper
      };
    }).filter((seed) => seed && Number.isFinite(seed.upperBound) && seed.upperBound > referenceHp)
      .sort((a, b) => b.upperBound - a.upperBound
        || (b.goal.resources?.hp ?? 0) - (a.goal.resources?.hp ?? 0)
        || a.goal.certificate.certificateHash.localeCompare(b.goal.certificate.certificateHash));

    // Scheduling is existence-hunt ordering only. Unscheduled relevant seeds remain
    // part of the exactness obligation below.
    const scheduled = verifiedSeeds.slice(0, maxTransitionSeeds);
    const toBoundaryAdapter = createCoreBoundaryAdapter({
      targetCores: toCores,
      baseAdapter: thresholdAdapter
    });
    const attempts = [];
    let winningTransition = null;

    for (const seed of scheduled) {
      const solver = solve({
        adapter: toBoundaryAdapter,
        initialState: seed.state,
        mode: 'existence',
        maxExpanded: transitionMaxExpanded,
        maxGenerated: transitionMaxGenerated,
        solverVersion: `fixed-purchase-core${fromCores}-to-core${toCores}-threshold-v0.2`
      });
      const replay = solver.certificate
        ? replayTowerCertificateToState(solver.certificate, {
            adapter: toBoundaryAdapter,
            initialState: seed.state
          })
        : null;
      const transitionFound = solver.solvable === true
        && replay?.ok === true
        && replay.state != null
        && (replay.state.cores ?? 0) >= toCores
        && fixedAdapter.objectiveUpperBound(replay.state) > referenceHp;
      const exactNoTransition = solver.solvable === false && solver.exact === true;
      const nextUpper = transitionFound ? fixedAdapter.objectiveUpperBound(replay.state) : null;
      const attempt = {
        prefixCertificateHash: seed.goal.certificate?.certificateHash ?? null,
        prefixResources: { ...seed.goal.resources },
        prefixShopPurchases: seed.state.shopPurchases,
        prefixUpperBound: seed.upperBound,
        solver: compactSolver(solver),
        replay: replay ? {
          ok: replay.ok,
          failures: replay.failures,
          final: replay.final,
          nextStateUpperBound: nextUpper
        } : null,
        transitionFound,
        exactNoTransition
      };
      attempts.push(attempt);
      if (transitionFound) {
        winningTransition = {
          fromCores,
          toCores,
          prefixCertificate: seed.goal.certificate,
          transitionCertificate: solver.certificate,
          prefixReplay: { ok: seed.replay.ok, final: seed.replay.final },
          transitionReplay: {
            ok: replay.ok,
            final: replay.final,
            nextStateUpperBound: nextUpper
          }
        };
        break;
      }
    }

    const evidence = classifyThresholdCoreTransitionEvidence({
      transitionFound: Boolean(winningTransition),
      boundaryCoverageExact: frontier.coverageExact,
      verifiedRelevantSeedCount: verifiedSeeds.length,
      scheduledSeedCount: scheduled.length,
      attempts
    });

    return {
      schemaVersion: 2,
      model: 'event-order-core-transition-threshold-v0.2-reference-aware',
      candidateId: snapshot.id,
      fromCores,
      toCores,
      status: evidence.status,
      productionWriteAllowed: false,
      transitionFound: Boolean(winningTransition),
      exactNoTransition: evidence.exactNoTransition,
      coverageExact: evidence.exactNoTransition,
      reference: {
        mode: reference.mode,
        terminalHp: referenceHp,
        minNormalizedHpMargin: reference.minNormalizedHpMargin,
        referenceWitnessHash: reference.referenceWitnessHash ?? null,
        purchaseCount: reference.purchaseCount ?? null,
        failures: reference.failures ?? []
      },
      threshold: {
        objective: 'terminal_hp',
        strictGreaterThan: referenceHp
      },
      boundary: {
        hasGoals: frontier.hasGoals,
        coverageExact: frontier.coverageExact,
        stoppedReason: frontier.stoppedReason,
        discoveredGoals: frontier.goals.length,
        verifiedRelevantGoals: verifiedSeeds.length,
        expandedStates: frontier.expandedStates,
        generatedStates: frontier.generatedStates,
        structuralStates: frontier.structuralStates,
        activeGoalLabels: frontier.activeGoalLabels,
        profile: frontier.profile
      },
      schedule: {
        verifiedRelevantSeedCount: verifiedSeeds.length,
        scheduledSeedCount: scheduled.length,
        attemptedAllVerified: evidence.attemptedAllVerified,
        seeds: scheduled.map((seed) => ({
          certificateHash: seed.goal.certificate?.certificateHash ?? null,
          resources: { ...seed.goal.resources },
          shopPurchases: seed.state.shopPurchases,
          upperBound: seed.upperBound,
          thresholdSlack: seed.upperBound - referenceHp
        }))
      },
      attempts,
      transition: winningTransition,
      interpretation: winningTransition
        ? 'replay_verified_threshold_relevant_next_core_bridge_found'
        : evidence.exactNoTransition
          ? 'complete_from_core_boundary_and_exact_transition_failures_prove_no_threshold_relevant_next_core_bridge'
          : 'no_threshold_relevant_next_core_bridge_found_within_current_boundary_or_transition_budget'
    };
  });
}
