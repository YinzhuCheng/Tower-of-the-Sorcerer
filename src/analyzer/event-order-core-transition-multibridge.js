import { buildEventOrderStepWitness } from './event-order-witness.js';
import { summarizeSuffixSearchTelemetry } from './event-order-core-transition-chain.js';
import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
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

function certificateHash(certificate) {
  return certificate?.certificateHash ?? null;
}

function bridgeSort(left, right) {
  return right.upperBound - left.upperBound
    || (right.resources?.hp ?? 0) - (left.resources?.hp ?? 0)
    || (right.resources?.gold ?? 0) - (left.resources?.gold ?? 0)
    || String(left.id).localeCompare(String(right.id));
}

function bridgePrefixKey(bridge) {
  return bridge.prefixCertificateHash
    ?? certificateHash(bridge.prefixCertificate)
    ?? String(bridge.id ?? '').split(':')[0];
}

/**
 * Existence-hunt scheduler that spends one suffix slot per c6 prefix family
 * before returning to a second c7 bridge from any family.
 *
 * Scheduling never participates in exact-no-exploit reasoning. Unscheduled
 * active bridges remain explicit proof obligations in the classifier.
 */
export function schedulePrefixRoundRobinBridges(bridges, {
  maxBridges = bridges?.length ?? 0
} = {}) {
  if (!Number.isInteger(maxBridges) || maxBridges < 0) throw new Error('maxBridges must be a non-negative integer.');
  const sorted = [...(bridges ?? [])].sort(bridgeSort);
  const groups = new Map();
  for (const bridge of sorted) {
    const key = bridgePrefixKey(bridge);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(bridge);
  }
  const orderedGroups = [...groups.entries()]
    .map(([prefixKey, entries]) => ({ prefixKey, entries: entries.sort(bridgeSort) }))
    .sort((left, right) => bridgeSort(left.entries[0], right.entries[0])
      || left.prefixKey.localeCompare(right.prefixKey));

  const selected = [];
  for (let round = 0; selected.length < maxBridges; round += 1) {
    let added = 0;
    for (const group of orderedGroups) {
      const bridge = group.entries[round];
      if (!bridge) continue;
      selected.push(bridge);
      added += 1;
      if (selected.length >= maxBridges) break;
    }
    if (added === 0) break;
  }
  return selected;
}

/**
 * Global exact no-exploit from the multi-bridge decomposition is intentionally
 * difficult to earn. Every relevant c6 prefix must be covered, every scheduled
 * prefix's c7 goal frontier must exhaust, every active Pareto c7 bridge must be
 * attempted, and every suffix must end in exact no-exploit.
 */
export function classifyMultiBridgeChainEvidence({
  exploitFound = false,
  fromBoundaryCoverageExact = false,
  verifiedPrefixCount = 0,
  scheduledPrefixCount = 0,
  prefixAttempts = [],
  activeBridgeCount = 0,
  scheduledBridgeCount = 0,
  suffixAttempts = []
} = {}) {
  if (exploitFound) {
    return {
      status: 'exploit-found',
      exactNoExploit: false,
      prefixCoverageExact: false,
      attemptedAllActiveBridges: false,
      allSuffixesExactNoExploit: false
    };
  }
  const attemptedAllPrefixes = scheduledPrefixCount === verifiedPrefixCount
    && prefixAttempts.length === verifiedPrefixCount;
  const allPrefixBridgeFrontiersExact = attemptedAllPrefixes
    && prefixAttempts.every((attempt) => attempt.bridgeFrontier?.coverageExact === true);
  const prefixCoverageExact = fromBoundaryCoverageExact
    && attemptedAllPrefixes
    && allPrefixBridgeFrontiersExact;
  const attemptedAllActiveBridges = scheduledBridgeCount === activeBridgeCount
    && suffixAttempts.length === activeBridgeCount;
  const allSuffixesExactNoExploit = attemptedAllActiveBridges
    && suffixAttempts.every((attempt) => attempt.exactNoExploit === true);
  const exactNoExploit = prefixCoverageExact
    && attemptedAllActiveBridges
    && allSuffixesExactNoExploit;
  return {
    status: exactNoExploit ? 'no-exploit-multibridge-exact' : 'coverage-incomplete',
    exactNoExploit,
    prefixCoverageExact,
    attemptedAllActiveBridges,
    allSuffixesExactNoExploit
  };
}

/**
 * Collect several replay-verified c7 Pareto bridges before running terminal
 * suffixes. This is an existence/coverage analyzer; no heuristic bridge
 * scheduling decision contributes to an infeasibility claim.
 *
 * Cross-prefix bridge reduction reuses the Solver's resource dominance relation
 * only when the authoritative structural key is identical. A resource-dominated
 * bridge at the same structural state cannot realize a suffix that its dominator
 * cannot also realize under the same fixed purchase policy.
 */
export function analyzeThresholdCoreMultiBridgeChain({
  candidate = REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness = null,
  fromCores = 6,
  toCores = fromCores + 1,
  fromBoundaryMaxExpanded = 8_000,
  fromBoundaryMaxGenerated = 100_000,
  fromBoundaryMaxGoals = 64,
  maxPrefixSeeds = 8,
  bridgeMaxExpandedPerPrefix = 3_000,
  bridgeMaxGeneratedPerPrefix = 45_000,
  bridgeMaxGoalsPerPrefix = 12,
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
        schemaVersion: 2,
        model: 'event-order-core-multibridge-chain-v0.2-prefix-round-robin',
        candidateId: snapshot.id,
        status: 'candidate-snapshot-drift',
        productionWriteAllowed: false,
        exploitFound: false,
        exactNoExploit: false,
        reference: {
          terminalHp: reference.terminalHp ?? null,
          expectedTerminalHp: snapshot.expectedEvidence?.terminalHp ?? null,
          failures: reference.failures ?? ['reference_resolution_failed']
        },
        interpretation: 'reference_failed_before_multibridge_search'
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
      solverVersion: `fixed-purchase-core${fromCores}-multibridge-prefix-v0.2`
    });
    const verifiedPrefixes = fromFrontier.goals.map((goal) => {
      const replay = replayTowerCertificateToState(goal.certificate, { adapter: fromBoundaryAdapter });
      if (!replay.ok || !replay.state) return null;
      const upperBound = fixedAdapter.objectiveUpperBound(replay.state);
      if (!Number.isFinite(upperBound) || upperBound <= referenceHp) return null;
      return {
        goal,
        replay,
        state: replay.state,
        upperBound,
        resources: fixedAdapter.resources(replay.state)
      };
    }).filter(Boolean).sort((a, b) => b.upperBound - a.upperBound
      || (b.resources.hp ?? 0) - (a.resources.hp ?? 0)
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
        solverVersion: `fixed-purchase-core${fromCores}-to-core${toCores}-bridge-frontier-v0.2`
      });
      let replayable = 0;
      let thresholdRelevant = 0;
      let acceptedPareto = 0;
      const bridgeIds = [];
      for (const goal of bridgeFrontier.goals) {
        const replay = replayTowerCertificateToState(goal.certificate, {
          adapter: toBoundaryAdapter,
          initialState: prefix.state
        });
        if (!replay.ok || !replay.state) continue;
        replayable += 1;
        discoveredReplayableBridges += 1;
        const upperBound = fixedAdapter.objectiveUpperBound(replay.state);
        if (!Number.isFinite(upperBound) || upperBound <= referenceHp) continue;
        thresholdRelevant += 1;
        const structuralKey = fixedAdapter.structuralKey(replay.state);
        const label = {
          id: `${prefixCertificateHash}:${certificateHash(goal.certificate)}`,
          prefixCertificateHash,
          active: true,
          key: structuralKey,
          state: replay.state,
          resources: fixedAdapter.resources(replay.state),
          shopPurchases: replay.state.shopPurchases,
          upperBound,
          prefixCertificate: prefix.goal.certificate,
          transitionCertificate: goal.certificate,
          prefixResources: prefix.resources,
          prefixUpperBound: prefix.upperBound,
          bridgeReplay: replay
        };
        const insertion = bridgeIndex.insert(structuralKey, label);
        bridgeLabels.push(label);
        if (insertion.accepted) {
          acceptedPareto += 1;
          bridgeIds.push(label.id);
          crossPrefixDominatedBridges += insertion.removed.length;
        } else {
          crossPrefixDominatedBridges += 1;
        }
      }
      prefixAttempts.push({
        prefixCertificateHash,
        prefixResources: prefix.resources,
        prefixShopPurchases: prefix.state.shopPurchases,
        prefixUpperBound: prefix.upperBound,
        bridgeFrontier: compactGoalFrontier(bridgeFrontier),
        replayableGoals: replayable,
        thresholdRelevantGoals: thresholdRelevant,
        acceptedParetoGoals: acceptedPareto,
        acceptedBridgeIds: bridgeIds
      });
    }

    const activeBridges = bridgeLabels.filter((bridge) => bridge.active).sort(bridgeSort);
    const scheduledBridges = schedulePrefixRoundRobinBridges(activeBridges, {
      maxBridges: Math.min(maxSuffixBridges, activeBridges.length)
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
    for (const bridge of scheduledBridges) {
      const solver = solve({
        adapter: suffixThresholdAdapter,
        initialState: bridge.state,
        mode: 'existence',
        maxExpanded: suffixMaxExpandedPerBridge,
        maxGenerated: suffixMaxGeneratedPerBridge,
        solverVersion: `fixed-purchase-core${toCores}-multibridge-threshold-suffix-v0.2-b${suffixPrioritySlackBucket}`
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
        transitionCertificateHash: certificateHash(bridge.transitionCertificate),
        resources: bridge.resources,
        shopPurchases: bridge.shopPurchases,
        upperBound: bridge.upperBound,
        thresholdSlack: bridge.upperBound - referenceHp,
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
        certificates: [
          bridge.prefixCertificate,
          bridge.transitionCertificate,
          suffixCertificate
        ]
      });
      const witnessReplay = replayTowerStepSkeleton(witness.steps, { adapter: fixedAdapter });
      exploit = {
        bridgeId: bridge.id,
        terminalHp: replay.objective,
        deltaHp: replay.objective - referenceHp,
        relativeGain: (replay.objective - referenceHp) / Math.max(1, referenceHp),
        chain: {
          prefixCertificateHash: bridge.prefixCertificateHash,
          transitionCertificateHash: certificateHash(bridge.transitionCertificate),
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

    const evidence = classifyMultiBridgeChainEvidence({
      exploitFound: Boolean(exploit),
      fromBoundaryCoverageExact: fromFrontier.coverageExact,
      verifiedPrefixCount: verifiedPrefixes.length,
      scheduledPrefixCount: scheduledPrefixes.length,
      prefixAttempts,
      activeBridgeCount: activeBridges.length,
      scheduledBridgeCount: scheduledBridges.length,
      suffixAttempts
    });

    return {
      schemaVersion: 2,
      model: 'event-order-core-multibridge-chain-v0.2-prefix-round-robin',
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
      threshold: { objective: 'terminal_hp', strictGreaterThan: referenceHp },
      fromBoundary: compactGoalFrontier(fromFrontier),
      prefixSchedule: {
        verifiedRelevantPrefixCount: verifiedPrefixes.length,
        scheduledPrefixCount: scheduledPrefixes.length,
        attemptedAllVerified: scheduledPrefixes.length === verifiedPrefixes.length,
        seeds: scheduledPrefixes.map((prefix) => ({
          certificateHash: certificateHash(prefix.goal.certificate),
          resources: prefix.resources,
          shopPurchases: prefix.state.shopPurchases,
          upperBound: prefix.upperBound,
          thresholdSlack: prefix.upperBound - referenceHp
        }))
      },
      prefixAttempts,
      bridges: {
        discoveredReplayable: discoveredReplayableBridges,
        crossPrefixDominated: crossPrefixDominatedBridges,
        activeParetoCount: activeBridges.length,
        scheduledSuffixCount: scheduledBridges.length,
        scheduleMode: 'prefix-round-robin',
        scheduledBridgeIds: scheduledBridges.map((bridge) => bridge.id),
        scheduledPrefixFamilies: [...new Set(scheduledBridges.map((bridge) => bridge.prefixCertificateHash))],
        activePareto: activeBridges.map((bridge) => ({
          id: bridge.id,
          prefixCertificateHash: bridge.prefixCertificateHash,
          transitionCertificateHash: certificateHash(bridge.transitionCertificate),
          resources: bridge.resources,
          shopPurchases: bridge.shopPurchases,
          upperBound: bridge.upperBound,
          thresholdSlack: bridge.upperBound - referenceHp
        }))
      },
      suffix: {
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
            ? 'prefix-diverse_multibridge_search_found_and_authoritatively_replayed_a_threshold_exploit'
            : 'multibridge_suffix_found_an_exploit_but_combined_step_witness_replay_needs_attention')
        : evidence.exactNoExploit
          ? 'complete_multibridge_decomposition_exactly_eliminates_all_threshold_exploits'
          : 'prefix-diverse_replay_verified_c7_bridges_were_explored_but_global_threshold_coverage_remains_incomplete'
    };
  });
}
