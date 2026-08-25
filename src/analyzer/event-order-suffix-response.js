import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import { replayTowerCertificate, replayTowerCertificateToState } from '../solver/replay.js';
import { solve } from '../solver/search.js';
import { createVisitedFloorEventMacroAdapter } from '../solver/visited-floor-event-macro-adapter.js';
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

function compactSuffixSolver(report) {
  return {
    solvable: report.solvable,
    exact: report.exact,
    existenceExact: report.existenceExact,
    objectiveExact: report.objectiveExact,
    stoppedReason: report.stoppedReason,
    objective: { ...report.objective },
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

function seedUpperBound(adapter, state) {
  const value = adapter.objectiveUpperBound?.(state);
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

/**
 * Exploit-oriented decomposition of fixed-purchase event-order search.
 *
 * The suffix question is not ordinary optimization. A 7083-HP whole-route
 * witness is not a valid incumbent for an arbitrary core7 bridge, so installing
 * it as branch-and-bound state would be unsound. Instead we ask:
 *
 *     is there any victory reachable from this bridge with HP > referenceHp ?
 *
 * The threshold wrapper uses the admissible overlay-aware terminal-HP upper bound
 * to prove states with upperBound <= referenceHp irrelevant to that question.
 *
 * The core7 suffix additionally quotients free cross-floor travel. Whole-game
 * travel-fold experiments previously regressed because they multiplied early
 * branching. Here the wrapper is deliberately restricted to the measured late
 * cleanup bottleneck: once seven cores and Compass are present, it exposes the
 * first non-teleport event on every visited floor as one legal composite edge,
 * while certificate steps remain real teleport/closure/event operations.
 *
 * Flow:
 * 1. discover replay-verified core-count boundary states that still have an
 *    optimistic upper bound above the reference;
 * 2. rank them by that admissible upper bound;
 * 3. from each exact compact bridge, run threshold existence over the late-game
 *    visited-floor event quotient.
 *
 * One replayed prefix+suffix chain above the reference proves an exploit.
 * Failure is globally exact only if the filtered boundary frontier is complete
 * and every relevant suffix proves threshold infeasibility exactly.
 */
export function analyzeCoreSuffixEventOrder({
  candidate = REVIEW_CANDIDATES.distributedPressureV1,
  targetCores = 7,
  boundaryMaxExpanded = 8_000,
  boundaryMaxGenerated = 100_000,
  boundaryMaxGoals = 64,
  maxSuffixSeeds = 8,
  suffixMaxExpanded = 3_000,
  suffixMaxGenerated = 45_000
} = {}) {
  const snapshot = cloneReviewCandidate(candidate);
  if (!Number.isInteger(targetCores) || targetCores < 1) throw new Error('targetCores must be positive.');
  if (!Number.isInteger(boundaryMaxGoals) || boundaryMaxGoals < 1) throw new Error('boundaryMaxGoals must be positive.');
  if (!Number.isInteger(maxSuffixSeeds) || maxSuffixSeeds < 1) throw new Error('maxSuffixSeeds must be positive.');

  return withBalanceEdits(snapshot.edits, (normalizedEdits) => {
    const reference = referenceRoute(snapshot);
    const referenceHp = reference.solvable ? reference.final.hp : null;
    const expectedHp = snapshot.expectedEvidence?.terminalHp ?? null;
    if (!reference.solvable || (Number.isFinite(expectedHp) && referenceHp !== expectedHp)) {
      return {
        schemaVersion: 3,
        model: 'core-suffix-event-order-v0.3-travel-quotient',
        candidateId: snapshot.id,
        status: 'candidate-snapshot-drift',
        exploitFound: false,
        coverageExact: false,
        reference: {
          solvable: reference.solvable,
          failure: reference.failure,
          terminalHp: referenceHp,
          expectedTerminalHp: expectedHp
        }
      };
    }

    const policy = snapshot.purchasePolicy;
    const baseAdapter = createFixedPurchasePolicyTowerAdapter({
      shopPlan: policy.shopPlan,
      shopCycle: policy.shopCycle
    });

    // Prefix/boundary discovery keeps the existing whole-game action model. The
    // threshold is already safe here and discards prefixes incapable of beating
    // the reference, but the travel quotient is withheld until the core7 suffix.
    const boundaryExploitAdapter = createObjectiveThresholdAdapter({
      threshold: referenceHp,
      baseAdapter
    });
    const boundaryAdapter = createCoreBoundaryAdapter({
      targetCores,
      baseAdapter: boundaryExploitAdapter
    });
    const frontier = collectGoalFrontier({
      adapter: boundaryAdapter,
      maxExpanded: boundaryMaxExpanded,
      maxGenerated: boundaryMaxGenerated,
      maxGoals: boundaryMaxGoals,
      solverVersion: `fixed-purchase-core${targetCores}-exploit-boundary-v0.3`
    });

    const verifiedSeeds = frontier.goals.map((goal) => {
      const replay = replayTowerCertificateToState(goal.certificate, { adapter: boundaryAdapter });
      return {
        goal,
        replay,
        verified: replay.ok === true && replay.state != null,
        state: replay.ok ? replay.state : null,
        upperBound: replay.ok ? seedUpperBound(baseAdapter, replay.state) : Number.NEGATIVE_INFINITY
      };
    }).filter((seed) => seed.verified && seed.upperBound > referenceHp)
      .sort((a, b) => b.upperBound - a.upperBound
        || (b.goal.resources?.hp ?? 0) - (a.goal.resources?.hp ?? 0)
        || a.goal.certificate.certificateHash.localeCompare(b.goal.certificate.certificateHash));

    const scheduled = verifiedSeeds.slice(0, maxSuffixSeeds);
    const attempts = [];
    let bestExploit = null;

    // The suffix quotient is intentionally separate from boundary discovery so
    // we can A/B it independently and never silently alter earlier proof stages.
    const suffixMacroAdapter = createVisitedFloorEventMacroAdapter({
      baseAdapter,
      minCores: targetCores
    });
    const suffixExploitAdapter = createObjectiveThresholdAdapter({
      threshold: referenceHp,
      baseAdapter: suffixMacroAdapter
    });

    for (const seed of scheduled) {
      const solver = solve({
        adapter: suffixExploitAdapter,
        initialState: seed.state,
        mode: 'existence',
        maxExpanded: suffixMaxExpanded,
        maxGenerated: suffixMaxGenerated,
        solverVersion: `fixed-purchase-core${targetCores}-exploit-travel-quotient-v0.3`
      });
      const replay = solver.certificate
        ? replayTowerCertificate(solver.certificate, { adapter: suffixExploitAdapter, initialState: seed.state })
        : null;
      const exploit = solver.solvable === true
        && replay?.ok === true
        && Number.isFinite(replay.objective)
        && replay.objective > referenceHp;
      const exactNoExploit = solver.solvable === false && solver.exact === true;
      const attempt = {
        prefixCertificateHash: seed.goal.certificate?.certificateHash ?? null,
        bridgeInitialStateHash: solver.certificate?.initialStateHash ?? null,
        bridgeResources: { ...seed.goal.resources },
        bridgeShopPurchases: seed.state.shopPurchases,
        optimisticTerminalHpUpperBound: seed.upperBound,
        thresholdHp: referenceHp,
        prefixReplayOk: seed.replay.ok,
        suffix: compactSuffixSolver(solver),
        suffixReplay: replay ? {
          ok: replay.ok,
          failures: replay.failures,
          objective: replay.objective,
          final: replay.final
        } : null,
        exploit,
        exactNoExploit
      };
      attempts.push(attempt);

      if (exploit) {
        bestExploit = {
          referenceHp,
          terminalHp: replay.objective,
          deltaHp: replay.objective - referenceHp,
          relativeGain: (replay.objective - referenceHp) / Math.max(1, referenceHp),
          prefixCertificate: seed.goal.certificate,
          suffixCertificate: solver.certificate,
          prefixReplay: {
            ok: seed.replay.ok,
            final: seed.replay.final
          },
          suffixReplay: {
            ok: replay.ok,
            final: replay.final,
            objective: replay.objective
          }
        };
        break;
      }
    }

    const attemptedAllVerified = scheduled.length === verifiedSeeds.length;
    const allSuffixExactNoExploit = attempts.length === verifiedSeeds.length
      && attempts.every((attempt) => attempt.exactNoExploit);
    const coverageExact = !bestExploit
      && frontier.coverageExact
      && attemptedAllVerified
      && allSuffixExactNoExploit;
    const status = bestExploit
      ? 'exploit-found'
      : coverageExact
        ? 'core-suffix-no-exploit-exact'
        : 'coverage-incomplete';

    return {
      schemaVersion: 3,
      model: 'core-suffix-event-order-v0.3-travel-quotient',
      candidateId: snapshot.id,
      targetCores,
      status,
      productionWriteAllowed: false,
      exploitFound: Boolean(bestExploit),
      coverageExact,
      edits: normalizedEdits,
      reference: {
        terminalHp: referenceHp,
        minNormalizedHpMargin: reference.minNormalizedHpMargin,
        purchaseCounts: { ...reference.purchaseCounts }
      },
      threshold: {
        objective: 'terminal_hp',
        strictGreaterThan: referenceHp,
        proofRule: 'state is irrelevant when admissible terminal-HP upper bound <= threshold'
      },
      lateTravelQuotient: {
        enabledFromCores: targetCores,
        model: 'visited-floor-event-macro-v1',
        standaloneTeleportStates: false,
        frontierLocationQuotiented: true
      },
      boundary: {
        hasGoals: frontier.hasGoals,
        coverageExact: frontier.coverageExact,
        stoppedReason: frontier.stoppedReason,
        discoveredGoals: frontier.goals.length,
        verifiedGoals: verifiedSeeds.length,
        expandedStates: frontier.expandedStates,
        generatedStates: frontier.generatedStates,
        structuralStates: frontier.structuralStates,
        activeSearchLabels: frontier.activeSearchLabels,
        activeGoalLabels: frontier.activeGoalLabels,
        profile: frontier.profile
      },
      seedSchedule: {
        verifiedSeedCount: verifiedSeeds.length,
        scheduledSeedCount: scheduled.length,
        seeds: scheduled.map((seed) => ({
          certificateHash: seed.goal.certificate?.certificateHash ?? null,
          resources: { ...seed.goal.resources },
          shopPurchases: seed.state.shopPurchases,
          optimisticTerminalHpUpperBound: seed.upperBound,
          thresholdSlack: seed.upperBound - referenceHp
        }))
      },
      attempts,
      exploit: bestExploit,
      interpretation: bestExploit
        ? 'replay_verified_core_suffix_event_order_exploit_found'
        : coverageExact
          ? 'complete_threshold_relevant_core_boundary_and_exact_suffixes_prove_no_better_fixed_purchase_suffix'
          : 'travel_quotiented_threshold_suffix_found_no_exploit_but_boundary_or_suffix_coverage_is_incomplete'
    };
  });
}
