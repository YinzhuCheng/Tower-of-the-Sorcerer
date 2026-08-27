import { buildEventOrderStepWitness } from './event-order-witness.js';
import { summarizeSuffixSearchTelemetry } from './event-order-core-transition-chain.js';
import { schedulePrefixRoundRobinBridges } from './event-order-core-transition-multibridge.js';
import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { proveFixedPurchaseBridgeBelowThreshold } from '../solver/fixed-purchase-bridge-tight-bound.js';
import { FrontierIndex } from '../solver/frontier.js';
import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { createLateGameThresholdPriorityAdapter } from '../solver/late-game-threshold-priority-adapter.js';
import { createLateGameZeroDamageHarvestAdapter } from '../solver/late-game-zero-damage-harvest-adapter.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import {
  replayTowerCertificate,
  replayTowerCertificateToState,
  replayTowerStepSkeleton
} from '../solver/replay.js';
import { solve } from '../solver/search.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { resolveReviewCandidateReference } from '../tuner/review-candidate-reference.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';

function certificateHash(certificate) {
  return certificate?.certificateHash ?? null;
}

function compactGoalFrontier(report) {
  return {
    hasGoals: report.hasGoals,
    coverageExact: report.coverageExact,
    stoppedReason: report.stoppedReason,
    discoveredGoals: report.goals.length,
    activeGoalLabels: report.activeGoalLabels,
    expandedStates: report.expandedStates,
    generatedStates: report.generatedStates,
    prunedDominated: report.prunedDominated,
    structuralStates: report.structuralStates,
    profile: report.profile
  };
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
    telemetry: summarizeSuffixSearchTelemetry(report, { lateFloorFrom: 7 }),
    certificateHash: report.certificate?.certificateHash ?? null,
    certificateSteps: report.certificate?.steps?.length ?? 0
  };
}

function bridgeSort(left, right) {
  return right.oldUpperBound - left.oldUpperBound
    || right.tightUpperBound - left.tightUpperBound
    || (right.resources?.hp ?? 0) - (left.resources?.hp ?? 0)
    || (right.resources?.gold ?? 0) - (left.resources?.gold ?? 0)
    || String(left.id).localeCompare(String(right.id));
}

function range(values) {
  const finite = values.map(Number).filter(Number.isFinite);
  return finite.length
    ? { min: Math.min(...finite), max: Math.max(...finite) }
    : { min: null, max: null };
}

export function summarizeTightFilteredBridges(bridges = [], threshold) {
  const summarize = (entries) => ({
    total: entries.length,
    boundClosed: entries.filter((entry) => entry.boundProof?.provesNoExploit).length,
    residual: entries.filter((entry) => !entry.boundProof?.provesNoExploit).length,
    oldUpperBound: range(entries.map((entry) => entry.oldUpperBound)),
    tightUpperBound: range(entries.map((entry) => entry.tightUpperBound)),
    tightening: range(entries.map((entry) => entry.boundProof?.tightening)),
    tightSlack: range(entries.map((entry) => entry.tightUpperBound - threshold))
  });
  const byPurchase = {};
  for (const bridge of bridges) {
    const key = String(bridge.shopPurchases);
    if (!byPurchase[key]) byPurchase[key] = [];
    byPurchase[key].push(bridge);
  }
  return {
    ...summarize(bridges),
    byPurchase: Object.fromEntries(
      Object.entries(byPurchase)
        .sort((a, b) => Number(b[0]) - Number(a[0]))
        .map(([key, entries]) => [key, summarize(entries)])
    )
  };
}

/**
 * Exact-no-exploit can close only when every upstream and bridge obligation is
 * resolved. Tight-bound-closed bridges are proof-complete individually; every
 * residual active bridge must still receive an exact no-exploit suffix.
 */
export function classifyTightFilteredMultiBridgeEvidence({
  exploitFound = false,
  fromBoundaryCoverageExact = false,
  verifiedPrefixCount = 0,
  scheduledPrefixCount = 0,
  prefixAttempts = [],
  activeBridgeCount = 0,
  boundClosedBridgeCount = 0,
  residualBridgeCount = 0,
  scheduledResidualBridgeCount = 0,
  suffixAttempts = []
} = {}) {
  if (exploitFound) {
    return {
      status: 'exploit-found',
      exactNoExploit: false,
      prefixCoverageExact: false,
      attemptedAllResidualBridges: false,
      allResidualSuffixesExactNoExploit: false,
      allActiveBridgesResolved: false
    };
  }
  const attemptedAllPrefixes = scheduledPrefixCount === verifiedPrefixCount
    && prefixAttempts.length === verifiedPrefixCount;
  const allPrefixBridgeFrontiersExact = attemptedAllPrefixes
    && prefixAttempts.every((attempt) => attempt.bridgeFrontier?.coverageExact === true);
  const prefixCoverageExact = fromBoundaryCoverageExact
    && attemptedAllPrefixes
    && allPrefixBridgeFrontiersExact;

  const bridgePartitionComplete = boundClosedBridgeCount + residualBridgeCount === activeBridgeCount;
  const attemptedAllResidualBridges = scheduledResidualBridgeCount === residualBridgeCount
    && suffixAttempts.length === residualBridgeCount;
  const allResidualSuffixesExactNoExploit = attemptedAllResidualBridges
    && suffixAttempts.every((attempt) => attempt.exactNoExploit === true);
  const allActiveBridgesResolved = bridgePartitionComplete
    && boundClosedBridgeCount <= activeBridgeCount
    && allResidualSuffixesExactNoExploit;
  const exactNoExploit = prefixCoverageExact && allActiveBridgesResolved;

  return {
    status: exactNoExploit ? 'no-exploit-tight-filtered-multibridge-exact' : 'coverage-incomplete',
    exactNoExploit,
    prefixCoverageExact,
    bridgePartitionComplete,
    attemptedAllResidualBridges,
    allResidualSuffixesExactNoExploit,
    allActiveBridgesResolved
  };
}

/**
 * Multi-bridge staged event-order analysis with a sound bridge-level bound
 * filter. The discrete/access DP is evaluated once per replay-verified c7 bridge,
 * never inside the whole-game Solver hot path.
 */
export function analyzeThresholdCoreTightFilteredMultiBridgeChain({
  candidate = REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness = null,
  fromCores = 6,
  toCores = 7,
  fromBoundaryMaxExpanded = 8_000,
  fromBoundaryMaxGenerated = 100_000,
  fromBoundaryMaxGoals = 64,
  maxPrefixSeeds = 6,
  bridgeMaxExpandedPerPrefix = 6_000,
  bridgeMaxGeneratedPerPrefix = 90_000,
  bridgeMaxGoalsPerPrefix = 32,
  maxSuffixBridges = 6,
  suffixMaxExpandedPerBridge = 3_000,
  suffixMaxGeneratedPerBridge = 50_000,
  suffixPrioritySlackBucket = 500,
  lateGameZeroDamageClosure = true
} = {}) {
  const snapshot = cloneReviewCandidate(candidate);
  for (const [name, value] of Object.entries({
    fromCores,
    toCores,
    fromBoundaryMaxExpanded,
    fromBoundaryMaxGenerated,
    fromBoundaryMaxGoals,
    maxPrefixSeeds,
    bridgeMaxExpandedPerPrefix,
    bridgeMaxGeneratedPerPrefix,
    bridgeMaxGoalsPerPrefix,
    maxSuffixBridges,
    suffixMaxExpandedPerBridge,
    suffixMaxGeneratedPerBridge,
    suffixPrioritySlackBucket
  })) {
    if (!Number.isInteger(value) || value < 1) throw new Error(`${name} must be a positive integer.`);
  }
  if (toCores <= fromCores) throw new Error('toCores must be greater than fromCores.');

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
        schemaVersion: 1,
        model: 'event-order-core-tight-filtered-multibridge-v0.1',
        candidateId: snapshot.id,
        productionWriteAllowed: false,
        status: 'candidate-snapshot-drift',
        exploitFound: false,
        exactNoExploit: false,
        reference: {
          terminalHp: reference.terminalHp ?? null,
          expectedTerminalHp: snapshot.expectedEvidence?.terminalHp ?? null,
          failures: reference.failures ?? ['reference_resolution_failed']
        }
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
    const toBoundaryAdapter = createCoreBoundaryAdapter({
      targetCores: toCores,
      baseAdapter: thresholdAdapter
    });

    const fromFrontier = collectGoalFrontier({
      adapter: fromBoundaryAdapter,
      maxExpanded: fromBoundaryMaxExpanded,
      maxGenerated: fromBoundaryMaxGenerated,
      maxGoals: fromBoundaryMaxGoals,
      solverVersion: `fixed-purchase-core${fromCores}-tight-filter-prefix-v0.1`
    });
    const verifiedPrefixes = fromFrontier.goals.map((goal) => {
      const replay = replayTowerCertificateToState(goal.certificate, { adapter: fromBoundaryAdapter });
      if (!replay.ok || !replay.state) return null;
      const oldUpperBound = fixedAdapter.objectiveUpperBound(replay.state);
      if (!Number.isFinite(oldUpperBound) || oldUpperBound <= referenceHp) return null;
      return {
        goal,
        state: replay.state,
        resources: fixedAdapter.resources(replay.state),
        shopPurchases: replay.state.shopPurchases,
        oldUpperBound
      };
    }).filter(Boolean).sort((a, b) => b.oldUpperBound - a.oldUpperBound
      || (b.resources?.gold ?? 0) - (a.resources?.gold ?? 0)
      || String(certificateHash(a.goal.certificate)).localeCompare(String(certificateHash(b.goal.certificate))));
    const scheduledPrefixes = verifiedPrefixes.slice(0, maxPrefixSeeds);

    const bridgeIndex = new FrontierIndex({ fields: fixedAdapter.resourceFields ?? null });
    const bridgeLabels = [];
    const prefixAttempts = [];
    let discoveredReplayableBridges = 0;
    let crossPrefixDominatedBridges = 0;

    for (const prefix of scheduledPrefixes) {
      const prefixCertificateHash = certificateHash(prefix.goal.certificate);
      const bridgeFrontier = collectGoalFrontier({
        adapter: toBoundaryAdapter,
        initialState: prefix.state,
        maxExpanded: bridgeMaxExpandedPerPrefix,
        maxGenerated: bridgeMaxGeneratedPerPrefix,
        maxGoals: bridgeMaxGoalsPerPrefix,
        solverVersion: `fixed-purchase-core${fromCores}-to-core${toCores}-tight-filter-frontier-v0.1-g${bridgeMaxGoalsPerPrefix}`
      });
      let replayable = 0;
      let thresholdRelevant = 0;
      let acceptedPareto = 0;
      for (const goal of bridgeFrontier.goals) {
        const replay = replayTowerCertificateToState(goal.certificate, {
          adapter: toBoundaryAdapter,
          initialState: prefix.state
        });
        if (!replay.ok || !replay.state) continue;
        replayable += 1;
        discoveredReplayableBridges += 1;
        const oldUpperBound = fixedAdapter.objectiveUpperBound(replay.state);
        if (!Number.isFinite(oldUpperBound) || oldUpperBound <= referenceHp) continue;
        thresholdRelevant += 1;
        const structuralKey = fixedAdapter.structuralKey(replay.state);
        const label = {
          id: `${prefixCertificateHash}:${certificateHash(goal.certificate)}`,
          prefixCertificateHash,
          transitionCertificateHash: certificateHash(goal.certificate),
          active: true,
          key: structuralKey,
          state: replay.state,
          resources: fixedAdapter.resources(replay.state),
          shopPurchases: replay.state.shopPurchases,
          oldUpperBound,
          prefixCertificate: prefix.goal.certificate,
          transitionCertificate: goal.certificate
        };
        const insertion = bridgeIndex.insert(structuralKey, label);
        bridgeLabels.push(label);
        if (insertion.accepted) {
          acceptedPareto += 1;
          crossPrefixDominatedBridges += insertion.removed.length;
        } else {
          crossPrefixDominatedBridges += 1;
        }
      }
      prefixAttempts.push({
        prefixCertificateHash,
        prefixResources: prefix.resources,
        prefixShopPurchases: prefix.shopPurchases,
        prefixUpperBound: prefix.oldUpperBound,
        bridgeFrontier: compactGoalFrontier(bridgeFrontier),
        replayableGoals: replayable,
        thresholdRelevantGoals: thresholdRelevant,
        acceptedParetoGoals: acceptedPareto
      });
    }

    const activeBridges = bridgeLabels.filter((bridge) => bridge.active);
    for (const bridge of activeBridges) {
      bridge.boundProof = proveFixedPurchaseBridgeBelowThreshold({
        adapter: fixedAdapter,
        state: bridge.state,
        threshold: referenceHp,
        shopPlan: policy.shopPlan,
        shopCycle: policy.shopCycle,
        pureHpFloorId: 7
      });
      bridge.tightUpperBound = bridge.boundProof.tightUpperBound;
    }
    activeBridges.sort(bridgeSort);
    const boundClosedBridges = activeBridges.filter((bridge) => bridge.boundProof.provesNoExploit);
    const residualBridges = activeBridges.filter((bridge) => !bridge.boundProof.provesNoExploit);
    const scheduledResidualBridges = schedulePrefixRoundRobinBridges(residualBridges, {
      maxBridges: Math.min(maxSuffixBridges, residualBridges.length)
    });

    const harvestedSuffixBaseAdapter = lateGameZeroDamageClosure
      ? createLateGameZeroDamageHarvestAdapter({
          baseAdapter: fixedAdapter,
          minCores: toCores,
          requireLucky: true
        })
      : fixedAdapter;
    const orderedSuffixBaseAdapter = createLateGameThresholdPriorityAdapter({
      baseAdapter: harvestedSuffixBaseAdapter,
      threshold: referenceHp,
      minCores: toCores,
      slackBucket: suffixPrioritySlackBucket
    });
    const suffixThresholdAdapter = createObjectiveThresholdAdapter({
      threshold: referenceHp,
      baseAdapter: orderedSuffixBaseAdapter
    });

    const suffixAttempts = [];
    let exploit = null;
    for (const bridge of scheduledResidualBridges) {
      const solver = solve({
        adapter: suffixThresholdAdapter,
        initialState: bridge.state,
        mode: 'existence',
        maxExpanded: suffixMaxExpandedPerBridge,
        maxGenerated: suffixMaxGeneratedPerBridge,
        solverVersion: `fixed-purchase-core${toCores}-tight-filter-suffix-v0.1-b${suffixPrioritySlackBucket}`
      });
      const suffixCertificate = solver.certificate;
      const replay = suffixCertificate
        ? replayTowerCertificate(suffixCertificate, {
            adapter: suffixThresholdAdapter,
            initialState: bridge.state
          })
        : null;
      const suffixExploit = solver.solvable === true
        && replay?.ok === true
        && Number.isFinite(replay.objective)
        && replay.objective > referenceHp;
      const exactNoExploit = solver.solvable === false && solver.exact === true;
      suffixAttempts.push({
        bridgeId: bridge.id,
        prefixCertificateHash: bridge.prefixCertificateHash,
        transitionCertificateHash: bridge.transitionCertificateHash,
        resources: bridge.resources,
        shopPurchases: bridge.shopPurchases,
        oldUpperBound: bridge.oldUpperBound,
        tightUpperBound: bridge.tightUpperBound,
        tightThresholdSlack: bridge.tightUpperBound - referenceHp,
        solver: compactSolver(solver),
        replay: replay ? {
          ok: replay.ok,
          failures: replay.failures,
          objective: replay.objective,
          final: replay.final
        } : null,
        exploit: suffixExploit,
        exactNoExploit
      });
      if (!suffixExploit) continue;

      const witness = buildEventOrderStepWitness({
        candidateId: snapshot.id,
        referenceTerminalHp: referenceHp,
        expectedTerminalHp: replay.objective,
        certificates: [bridge.prefixCertificate, bridge.transitionCertificate, suffixCertificate]
      });
      const witnessReplay = replayTowerStepSkeleton(witness.steps, { adapter: fixedAdapter });
      exploit = {
        bridgeId: bridge.id,
        terminalHp: replay.objective,
        deltaHp: replay.objective - referenceHp,
        relativeGain: (replay.objective - referenceHp) / Math.max(1, referenceHp),
        chain: {
          prefixCertificateHash: bridge.prefixCertificateHash,
          transitionCertificateHash: bridge.transitionCertificateHash,
          suffixCertificateHash: certificateHash(suffixCertificate)
        },
        witness,
        witnessReplay: {
          ok: witnessReplay.ok,
          failures: witnessReplay.failures,
          objective: witnessReplay.objective,
          minNormalizedHpMargin: witnessReplay.minNormalizedHpMargin,
          final: witnessReplay.final
        }
      };
      break;
    }

    const evidence = classifyTightFilteredMultiBridgeEvidence({
      exploitFound: Boolean(exploit),
      fromBoundaryCoverageExact: fromFrontier.coverageExact,
      verifiedPrefixCount: verifiedPrefixes.length,
      scheduledPrefixCount: scheduledPrefixes.length,
      prefixAttempts,
      activeBridgeCount: activeBridges.length,
      boundClosedBridgeCount: boundClosedBridges.length,
      residualBridgeCount: residualBridges.length,
      scheduledResidualBridgeCount: scheduledResidualBridges.length,
      suffixAttempts
    });

    return {
      schemaVersion: 1,
      model: 'event-order-core-tight-filtered-multibridge-v0.1',
      candidateId: snapshot.id,
      fromCores,
      toCores,
      productionWriteAllowed: false,
      status: evidence.status,
      exploitFound: Boolean(exploit),
      exactNoExploit: evidence.exactNoExploit,
      reference: {
        terminalHp: referenceHp,
        minNormalizedHpMargin: reference.minNormalizedHpMargin,
        referenceWitnessHash: reference.referenceWitnessHash ?? null,
        purchaseCount: reference.purchaseCount ?? null
      },
      fromBoundary: compactGoalFrontier(fromFrontier),
      prefixSchedule: {
        verifiedRelevantPrefixCount: verifiedPrefixes.length,
        scheduledPrefixCount: scheduledPrefixes.length,
        attemptedAllVerified: scheduledPrefixes.length === verifiedPrefixes.length
      },
      prefixAttempts,
      bridgeProof: {
        soundOverApproximation: true,
        model: 'fixed-purchase-bridge-tight-bound-proof-v0.1',
        oldProofBoundRetainedAsCrossCheck: true,
        proofRunsOncePerReplayVerifiedC7Bridge: true,
        summary: summarizeTightFilteredBridges(activeBridges, referenceHp),
        boundClosedCount: boundClosedBridges.length,
        residualCount: residualBridges.length,
        boundClosed: boundClosedBridges.map((bridge) => ({
          id: bridge.id,
          prefixCertificateHash: bridge.prefixCertificateHash,
          transitionCertificateHash: bridge.transitionCertificateHash,
          resources: bridge.resources,
          shopPurchases: bridge.shopPurchases,
          oldUpperBound: bridge.oldUpperBound,
          tightUpperBound: bridge.tightUpperBound,
          tightening: bridge.boundProof.tightening,
          proof: bridge.boundProof
        })),
        residual: residualBridges.map((bridge) => ({
          id: bridge.id,
          prefixCertificateHash: bridge.prefixCertificateHash,
          transitionCertificateHash: bridge.transitionCertificateHash,
          resources: bridge.resources,
          shopPurchases: bridge.shopPurchases,
          oldUpperBound: bridge.oldUpperBound,
          tightUpperBound: bridge.tightUpperBound,
          tightening: bridge.boundProof.tightening,
          tightThresholdSlack: bridge.tightUpperBound - referenceHp
        }))
      },
      suffix: {
        scheduledResidualCount: scheduledResidualBridges.length,
        scheduledPrefixFamilies: [...new Set(scheduledResidualBridges.map((bridge) => bridge.prefixCertificateHash))],
        priorityMode: 'late-game-threshold',
        slackBucket: suffixPrioritySlackBucket,
        maxExpandedPerBridge: suffixMaxExpandedPerBridge,
        maxGeneratedPerBridge: suffixMaxGeneratedPerBridge,
        attempts: suffixAttempts
      },
      evidence,
      exploit,
      interpretation: exploit
        ? (exploit.witnessReplay.ok && exploit.witnessReplay.objective === exploit.terminalHp
            ? 'tight_filtered_multibridge_search_found_and_authoritatively_replayed_a_threshold_exploit'
            : 'tight_filtered_suffix_found_an_exploit_but_combined_witness_replay_needs_attention')
        : evidence.exactNoExploit
          ? 'every_relevant_bridge_is_closed_by_a_sound_tight_bound_or_exact_suffix_under_complete_upstream_coverage'
          : 'sound_tight_bridge_bounds_close_part_of_the_sampled_c7_frontier_while_residual_or_upstream_proof_obligations_remain'
    };
  });
}
