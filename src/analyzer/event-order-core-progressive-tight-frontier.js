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

export function nextProgressiveResidualGoalCap({
  currentCap,
  maxCap,
  residualGoals,
  targetResidualGoals,
  coverageExact = false
} = {}) {
  if (coverageExact || residualGoals >= targetResidualGoals || currentCap >= maxCap) return null;
  return Math.min(maxCap, currentCap * 2);
}

function compactFrontier(report) {
  return {
    coverageExact: report.coverageExact,
    stoppedReason: report.stoppedReason,
    activeGoalLabels: report.activeGoalLabels,
    goalStructuralStates: report.goalStructuralStates,
    goalFrontierPeak: report.goalFrontierPeak,
    expandedStates: report.expandedStates,
    generatedStates: report.generatedStates,
    prunedDominated: report.prunedDominated,
    structuralStates: report.structuralStates,
    activeSearchLabels: report.activeSearchLabels
  };
}

/**
 * Re-run a c7 goal frontier with geometrically increasing goal caps only when
 * sound tight-bound filtering leaves fewer unresolved bridge goals than the
 * requested residual quota.
 *
 * Each round supersedes the previous round; no partial frontier is treated as
 * exhaustive. This is a diagnostic/scheduling layer over the existing exactness
 * semantics of collectGoalFrontier(), not a new prune inside the Solver.
 */
export function analyzeV3ProgressiveTightC7Frontier({
  candidate = REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness = null,
  fromCores = 6,
  toCores = 7,
  fromBoundaryMaxExpanded = 8_000,
  fromBoundaryMaxGenerated = 100_000,
  fromBoundaryMaxGoals = 64,
  maxPrefixSeeds = 3,
  bridgeMaxExpandedPerRound = 12_000,
  bridgeMaxGeneratedPerRound = 180_000,
  initialGoalCap = 32,
  maxGoalCap = 256,
  targetResidualGoals = 32
} = {}) {
  const snapshot = cloneReviewCandidate(candidate);
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
        model: 'v3-progressive-tight-c7-frontier-v0.1',
        status: 'candidate-snapshot-drift',
        productionWriteAllowed: false,
        exactNoExploit: false,
        referenceFailures: reference.failures ?? ['reference_resolution_failed']
      };
    }
    const threshold = reference.terminalHp;
    const thresholdAdapter = createObjectiveThresholdAdapter({ threshold, baseAdapter: fixedAdapter });
    const fromAdapter = createCoreBoundaryAdapter({ targetCores: fromCores, baseAdapter: thresholdAdapter });
    const toAdapter = createCoreBoundaryAdapter({ targetCores: toCores, baseAdapter: thresholdAdapter });
    const fromFrontier = collectGoalFrontier({
      adapter: fromAdapter,
      maxExpanded: fromBoundaryMaxExpanded,
      maxGenerated: fromBoundaryMaxGenerated,
      maxGoals: fromBoundaryMaxGoals,
      solverVersion: 'v3-progressive-tight-c6-v0.1'
    });
    const prefixes = fromFrontier.goals.map((goal) => {
      const replay = replayTowerCertificateToState(goal.certificate, { adapter: fromAdapter });
      if (!replay.ok || !replay.state) return null;
      const oldUpperBound = fixedAdapter.objectiveUpperBound(replay.state);
      return oldUpperBound > threshold
        ? { certificate: goal.certificate, state: replay.state, resources: fixedAdapter.resources(replay.state), oldUpperBound }
        : null;
    }).filter(Boolean).sort((a, b) => b.oldUpperBound - a.oldUpperBound
      || (b.resources?.gold ?? 0) - (a.resources?.gold ?? 0)
      || String(certificateHash(a.certificate)).localeCompare(String(certificateHash(b.certificate))))
      .slice(0, maxPrefixSeeds);

    const attempts = [];
    for (const prefix of prefixes) {
      const rounds = [];
      let cap = initialGoalCap;
      let finalEntries = [];
      let finalFrontier = null;
      while (true) {
        const frontier = collectGoalFrontier({
          adapter: toAdapter,
          initialState: prefix.state,
          maxExpanded: bridgeMaxExpandedPerRound,
          maxGenerated: bridgeMaxGeneratedPerRound,
          maxGoals: cap,
          solverVersion: `v3-progressive-tight-c7-v0.1-g${cap}`
        });
        const entries = [];
        let replayFailures = 0;
        for (const goal of frontier.goals) {
          const replay = replayTowerCertificateToState(goal.certificate, { adapter: toAdapter, initialState: prefix.state });
          if (!replay.ok || !replay.state) { replayFailures += 1; continue; }
          const oldUpperBound = fixedAdapter.objectiveUpperBound(replay.state);
          if (!(oldUpperBound > threshold)) continue;
          const proof = proveFixedPurchaseBridgeBelowThreshold({
            adapter: fixedAdapter,
            state: replay.state,
            threshold,
            shopPlan: policy.shopPlan,
            shopCycle: policy.shopCycle,
            pureHpFloorId: 7
          });
          entries.push({
            certificateHash: certificateHash(goal.certificate),
            resources: fixedAdapter.resources(replay.state),
            shopPurchases: replay.state.shopPurchases,
            oldUpperBound,
            tightUpperBound: proof.tightUpperBound,
            boundProof: proof
          });
        }
        const summary = summarizeTightFilteredBridges(entries, threshold);
        rounds.push({
          goalCap: cap,
          frontier: compactFrontier(frontier),
          replayFailures,
          summary
        });
        finalEntries = entries;
        finalFrontier = frontier;
        const next = nextProgressiveResidualGoalCap({
          currentCap: cap,
          maxCap: maxGoalCap,
          residualGoals: summary.residual,
          targetResidualGoals,
          coverageExact: frontier.coverageExact
        });
        if (next == null) break;
        cap = next;
      }
      const finalSummary = summarizeTightFilteredBridges(finalEntries, threshold);
      attempts.push({
        prefixCertificateHash: certificateHash(prefix.certificate),
        prefixResources: prefix.resources,
        prefixUpperBound: prefix.oldUpperBound,
        targetResidualGoals,
        finalGoalCap: rounds.at(-1)?.goalCap ?? initialGoalCap,
        finalFrontierExact: finalFrontier?.coverageExact ?? false,
        finalFrontierStop: finalFrontier?.stoppedReason ?? null,
        finalSummary,
        rounds
      });
    }

    return {
      schemaVersion: 1,
      model: 'v3-progressive-tight-c7-frontier-v0.1',
      status: 'diagnostic-complete',
      productionWriteAllowed: false,
      exactNoExploit: false,
      reference: { terminalHp: threshold, minNormalizedHpMargin: reference.minNormalizedHpMargin },
      fromBoundary: compactFrontier(fromFrontier),
      prefixCount: prefixes.length,
      initialGoalCap,
      maxGoalCap,
      targetResidualGoals,
      attempts,
      interpretation: attempts.some((attempt) => attempt.finalGoalCap > initialGoalCap)
        ? 'tight_bound_closures_triggered_goal_cap_growth_until_residual_bridge_quota_or_safety_cap'
        : 'initial_c7_goal_cap_already_supplied_the_requested_residual_bridge_quota'
    };
  });
}
