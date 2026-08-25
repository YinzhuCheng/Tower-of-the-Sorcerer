import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import { replayTowerCertificate, replayTowerCertificateToState } from '../solver/replay.js';
import { solve } from '../solver/search.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';

function referenceRoute(candidate) {
  const policy = candidate.purchasePolicy;
  return runGreedyShopStrategy({
    shopCycle: [...policy.shopCycle],
    shopPlan: [...policy.shopPlan],
    holyPolicy: policy.referenceHolyPolicy ?? 'immediate'
  });
}

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
 * Decompose a terminal exploit proof at a mandatory core transition.
 *
 * Under the current game rules every victory must collect the next layer core.
 * Therefore a state at `fromCores` can contribute to an HP>threshold exploit only
 * if it can reach some `toCores` state whose admissible terminal-HP upper bound is
 * still above the reference. We can ask that smaller exact existence question
 * before exploring any later-floor cleanup/permutation space.
 *
 * Composition:
 *
 *   fixed purchase policy
 *     -> objective threshold dead-end (upper <= reference)
 *     -> from-core boundary discovery
 *     -> exact/bounded to-core existence from replayed bridge
 *
 * A transition certificate proves only that a threshold-relevant next-core bridge
 * exists. Exact failure from one bridge eliminates that bridge. Global no-exploit
 * through this transition requires complete from-core boundary coverage plus exact
 * failure from every relevant replay-verified bridge.
 */
export function analyzeThresholdCoreTransition({
  candidate = REVIEW_CANDIDATES.distributedPressureV1,
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

  return withBalanceEdits(snapshot.edits, (normalizedEdits) => {
    const reference = referenceRoute(snapshot);
    const referenceHp = reference.solvable ? reference.final.hp : null;
    const expectedHp = snapshot.expectedEvidence?.terminalHp ?? null;
    if (!reference.solvable || (Number.isFinite(expectedHp) && referenceHp !== expectedHp)) {
      return {
        schemaVersion: 1,
        model: 'event-order-core-transition-threshold-v0.1',
        candidateId: snapshot.id,
        status: 'candidate-snapshot-drift',
        coverageExact: false,
        transitionFound: false,
        exactNoTransition: false,
        reference: {
          terminalHp: referenceHp,
          expectedTerminalHp: expectedHp,
          failure: reference.failure
        }
      };
    }

    const policy = snapshot.purchasePolicy;
    const fixedAdapter = createFixedPurchasePolicyTowerAdapter({
      shopPlan: policy.shopPlan,
      shopCycle: policy.shopCycle
    });
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
      solverVersion: `fixed-purchase-core${fromCores}-threshold-boundary-v0.1`
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
        solverVersion: `fixed-purchase-core${fromCores}-to-core${toCores}-threshold-v0.1`
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

    const attemptedAllVerified = scheduled.length === verifiedSeeds.length;
    const allAttemptsExactNoTransition = attempts.length === verifiedSeeds.length
      && attempts.every((attempt) => attempt.exactNoTransition);
    const exactNoTransition = !winningTransition
      && frontier.coverageExact
      && attemptedAllVerified
      && allAttemptsExactNoTransition;
    const status = winningTransition
      ? 'threshold-relevant-transition-found'
      : exactNoTransition
        ? 'no-threshold-relevant-transition-exact'
        : 'coverage-incomplete';

    return {
      schemaVersion: 1,
      model: 'event-order-core-transition-threshold-v0.1',
      candidateId: snapshot.id,
      fromCores,
      toCores,
      status,
      productionWriteAllowed: false,
      transitionFound: Boolean(winningTransition),
      exactNoTransition,
      coverageExact: exactNoTransition,
      reference: {
        terminalHp: referenceHp,
        minNormalizedHpMargin: reference.minNormalizedHpMargin
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
        : exactNoTransition
          ? 'complete_from_core_boundary_and_exact_transition_failures_prove_no_threshold_relevant_next_core_bridge'
          : 'no_threshold_relevant_next_core_bridge_found_within_current_boundary_or_transition_budget'
    };
  });
}
