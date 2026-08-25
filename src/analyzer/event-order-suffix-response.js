import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { collectGoalFrontier } from '../solver/goal-frontier.js';
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

function compactSuffixSolver(report) {
  return {
    solvable: report.solvable,
    exact: report.exact,
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
 * 1. discover replay-verified `cores >= targetCores` boundary states;
 * 2. rank them by the admissible terminal-HP upper bound;
 * 3. run a bounded optimize suffix from a small number of exact bridge states.
 *
 * One replayed prefix+suffix chain above the reference HP proves an exploit.
 * Failure to find one is only exact if the boundary frontier is complete and all
 * relevant suffix searches exhaust exactly. Discovery mode therefore remains
 * conservative by default.
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
        schemaVersion: 1,
        model: 'core-suffix-event-order-v0.1',
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
    const boundaryAdapter = createCoreBoundaryAdapter({ targetCores, baseAdapter });
    const frontier = collectGoalFrontier({
      adapter: boundaryAdapter,
      maxExpanded: boundaryMaxExpanded,
      maxGenerated: boundaryMaxGenerated,
      maxGoals: boundaryMaxGoals,
      solverVersion: `fixed-purchase-core${targetCores}-boundary-v0.1`
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
    }).filter((seed) => seed.verified)
      .sort((a, b) => b.upperBound - a.upperBound
        || (b.goal.resources?.hp ?? 0) - (a.goal.resources?.hp ?? 0)
        || a.goal.certificate.certificateHash.localeCompare(b.goal.certificate.certificateHash));

    const scheduled = verifiedSeeds.slice(0, maxSuffixSeeds);
    const attempts = [];
    let bestExploit = null;

    for (const seed of scheduled) {
      const solver = solve({
        adapter: baseAdapter,
        initialState: seed.state,
        mode: 'optimize',
        maxExpanded: suffixMaxExpanded,
        maxGenerated: suffixMaxGenerated,
        solverVersion: `fixed-purchase-core${targetCores}-suffix-v0.1`
      });
      const replay = solver.certificate
        ? replayTowerCertificate(solver.certificate, { adapter: baseAdapter, initialState: seed.state })
        : null;
      const searchBest = solver.objective?.searchBest;
      const exploit = Number.isFinite(searchBest)
        && searchBest > referenceHp
        && replay?.ok === true
        && replay.objective === searchBest;
      const attempt = {
        prefixCertificateHash: seed.goal.certificate?.certificateHash ?? null,
        bridgeInitialStateHash: solver.certificate?.initialStateHash ?? null,
        bridgeResources: { ...seed.goal.resources },
        bridgeShopPurchases: seed.state.shopPurchases,
        optimisticTerminalHpUpperBound: seed.upperBound,
        prefixReplayOk: seed.replay.ok,
        suffix: compactSuffixSolver(solver),
        suffixReplay: replay ? {
          ok: replay.ok,
          failures: replay.failures,
          objective: replay.objective,
          final: replay.final
        } : null,
        exploit
      };
      attempts.push(attempt);

      if (exploit) {
        bestExploit = {
          referenceHp,
          terminalHp: searchBest,
          deltaHp: searchBest - referenceHp,
          relativeGain: (searchBest - referenceHp) / Math.max(1, referenceHp),
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
    const allSuffixExact = attempts.length === verifiedSeeds.length
      && attempts.every((attempt) => attempt.suffix.objectiveExact === true);
    const coverageExact = frontier.coverageExact && attemptedAllVerified && allSuffixExact;
    const status = bestExploit
      ? 'exploit-found'
      : coverageExact
        ? 'core-suffix-optimal-over-complete-boundary'
        : 'coverage-incomplete';

    return {
      schemaVersion: 1,
      model: 'core-suffix-event-order-v0.1',
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
          optimisticTerminalHpUpperBound: seed.upperBound
        }))
      },
      attempts,
      exploit: bestExploit,
      interpretation: bestExploit
        ? 'replay_verified_core_suffix_event_order_exploit_found'
        : coverageExact
          ? 'complete_core_boundary_and_exact_suffixes_prove_no_better_fixed_purchase_suffix'
          : 'staged_suffix_search_found_no_exploit_but_boundary_or_suffix_coverage_is_incomplete'
    };
  });
}
