import { buildEventOrderStepWitness } from './event-order-witness.js';
import { summarizeSuffixSearchTelemetry } from './event-order-core-transition-chain.js';
import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
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

function bridgePreference(left, right) {
  return right.upperBound - left.upperBound
    || (right.resources?.gold ?? 0) - (left.resources?.gold ?? 0)
    || (right.resources?.hp ?? 0) - (left.resources?.hp ?? 0)
    || String(left.id).localeCompare(String(right.id));
}

/**
 * Select one c7 bridge from the economic stage immediately behind the most
 * purchase-progressed bridge in one prefix family.
 *
 * Example: if a family contains p21 and p20 bridges, this chooses the strongest
 * p20 bridge (upper bound first, then Gold). The p20 state keeps the next fixed
 * purchase inside the terminal suffix, so it probes a different purchase-timing
 * subproblem than the already-profiled p21 wave.
 *
 * This is existence-hunt scheduling only. The selected bridge never contributes
 * to an exact-no-exploit claim.
 */
export function selectPurchaseLagBridge(bridges = []) {
  if (!Array.isArray(bridges) || bridges.length === 0) return null;
  const purchaseCounts = [...new Set(bridges
    .map((bridge) => Number(bridge.shopPurchases))
    .filter(Number.isFinite))]
    .sort((a, b) => b - a);
  if (purchaseCounts.length === 0) return [...bridges].sort(bridgePreference)[0] ?? null;
  const targetPurchaseCount = purchaseCounts.length >= 2
    ? purchaseCounts[1]
    : purchaseCounts[0];
  return bridges
    .filter((bridge) => Number(bridge.shopPurchases) === targetPurchaseCount)
    .sort(bridgePreference)[0] ?? null;
}

/**
 * Diagnostic existence wave over one purchase-lag/high-Gold c7 bridge from each
 * scheduled c6 prefix family. The analyzer intentionally never returns exact
 * no-exploit: bounded prefix/frontier/suffix sampling is only a counterexample
 * hunt and coverage diagnostic.
 */
export function analyzeThresholdCoreEconomyBridgeWave({
  candidate = REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness = null,
  fromCores = 6,
  toCores = fromCores + 1,
  fromBoundaryMaxExpanded = 8_000,
  fromBoundaryMaxGenerated = 100_000,
  fromBoundaryMaxGoals = 64,
  maxPrefixSeeds = 6,
  bridgeMaxExpandedPerPrefix = 2_500,
  bridgeMaxGeneratedPerPrefix = 35_000,
  bridgeMaxGoalsPerPrefix = 8,
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
        model: 'event-order-core-economy-bridge-wave-v0.1',
        candidateId: snapshot.id,
        productionWriteAllowed: false,
        status: 'candidate-snapshot-drift',
        exploitFound: false,
        exactNoExploit: false,
        reference: {
          terminalHp: reference.terminalHp ?? null,
          expectedTerminalHp: snapshot.expectedEvidence?.terminalHp ?? null,
          failures: reference.failures ?? ['reference_resolution_failed']
        },
        interpretation: 'reference_failed_before_economy_bridge_wave'
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
      solverVersion: `fixed-purchase-core${fromCores}-economy-wave-prefix-v0.1`
    });
    const verifiedPrefixes = fromFrontier.goals.map((goal) => {
      const replay = replayTowerCertificateToState(goal.certificate, { adapter: fromBoundaryAdapter });
      if (!replay.ok || !replay.state) return null;
      const upperBound = fixedAdapter.objectiveUpperBound(replay.state);
      if (!Number.isFinite(upperBound) || upperBound <= referenceHp) return null;
      return {
        goal,
        state: replay.state,
        resources: fixedAdapter.resources(replay.state),
        shopPurchases: replay.state.shopPurchases,
        upperBound
      };
    }).filter(Boolean).sort((a, b) => b.upperBound - a.upperBound
      || (b.resources?.hp ?? 0) - (a.resources?.hp ?? 0)
      || (b.resources?.gold ?? 0) - (a.resources?.gold ?? 0)
      || String(certificateHash(a.goal.certificate)).localeCompare(String(certificateHash(b.goal.certificate))));
    const scheduledPrefixes = verifiedPrefixes.slice(0, maxPrefixSeeds);

    const prefixAttempts = [];
    const selectedBridges = [];
    for (const prefix of scheduledPrefixes) {
      const prefixCertificateHash = certificateHash(prefix.goal.certificate);
      const bridgeFrontier = collectGoalFrontier({
        adapter: toBoundaryAdapter,
        initialState: prefix.state,
        maxExpanded: bridgeMaxExpandedPerPrefix,
        maxGenerated: bridgeMaxGeneratedPerPrefix,
        maxGoals: bridgeMaxGoalsPerPrefix,
        solverVersion: `fixed-purchase-core${fromCores}-to-core${toCores}-economy-wave-v0.1`
      });
      const replayable = [];
      for (const goal of bridgeFrontier.goals) {
        const replay = replayTowerCertificateToState(goal.certificate, {
          adapter: toBoundaryAdapter,
          initialState: prefix.state
        });
        if (!replay.ok || !replay.state) continue;
        const upperBound = fixedAdapter.objectiveUpperBound(replay.state);
        if (!Number.isFinite(upperBound) || upperBound <= referenceHp) continue;
        replayable.push({
          id: `${prefixCertificateHash}:${certificateHash(goal.certificate)}`,
          prefixCertificateHash,
          transitionCertificateHash: certificateHash(goal.certificate),
          prefixCertificate: prefix.goal.certificate,
          transitionCertificate: goal.certificate,
          state: replay.state,
          resources: fixedAdapter.resources(replay.state),
          shopPurchases: replay.state.shopPurchases,
          upperBound
        });
      }
      const selected = selectPurchaseLagBridge(replayable);
      if (selected) selectedBridges.push(selected);
      const purchaseHistogram = {};
      for (const bridge of replayable) {
        const key = String(bridge.shopPurchases);
        purchaseHistogram[key] = (purchaseHistogram[key] ?? 0) + 1;
      }
      prefixAttempts.push({
        prefixCertificateHash,
        prefixResources: prefix.resources,
        prefixShopPurchases: prefix.shopPurchases,
        prefixUpperBound: prefix.upperBound,
        bridgeFrontier: compactGoalFrontier(bridgeFrontier),
        replayableThresholdRelevantBridges: replayable.length,
        purchaseHistogram,
        selectedBridge: selected ? {
          id: selected.id,
          transitionCertificateHash: selected.transitionCertificateHash,
          resources: selected.resources,
          shopPurchases: selected.shopPurchases,
          upperBound: selected.upperBound,
          thresholdSlack: selected.upperBound - referenceHp
        } : null
      });
    }

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
    for (const bridge of selectedBridges) {
      const solver = solve({
        adapter: suffixThresholdAdapter,
        initialState: bridge.state,
        mode: 'existence',
        maxExpanded: suffixMaxExpandedPerBridge,
        maxGenerated: suffixMaxGeneratedPerBridge,
        solverVersion: `fixed-purchase-core${toCores}-economy-wave-threshold-suffix-v0.1-b${suffixPrioritySlackBucket}`
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
      const attempt = {
        bridgeId: bridge.id,
        prefixCertificateHash: bridge.prefixCertificateHash,
        transitionCertificateHash: bridge.transitionCertificateHash,
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
        exploit: suffixExploit
      };
      suffixAttempts.push(attempt);
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

    return {
      schemaVersion: 1,
      model: 'event-order-core-economy-bridge-wave-v0.1',
      candidateId: snapshot.id,
      fromCores,
      toCores,
      productionWriteAllowed: false,
      status: exploit ? 'exploit-found' : 'coverage-incomplete',
      exploitFound: Boolean(exploit),
      exactNoExploit: false,
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
        attemptedAllVerified: scheduledPrefixes.length === verifiedPrefixes.length
      },
      prefixAttempts,
      selectedBridges: selectedBridges.map((bridge) => ({
        id: bridge.id,
        prefixCertificateHash: bridge.prefixCertificateHash,
        transitionCertificateHash: bridge.transitionCertificateHash,
        resources: bridge.resources,
        shopPurchases: bridge.shopPurchases,
        upperBound: bridge.upperBound,
        thresholdSlack: bridge.upperBound - referenceHp
      })),
      suffix: {
        diagnosticOnly: true,
        scheduleMode: 'one-purchase-lag-high-gold-per-prefix',
        priorityMode: 'late-game-threshold',
        slackBucket: suffixPrioritySlackBucket,
        maxExpandedPerBridge: suffixMaxExpandedPerBridge,
        maxGeneratedPerBridge: suffixMaxGeneratedPerBridge,
        attempts: suffixAttempts
      },
      exploit,
      interpretation: exploit
        ? (exploit.witnessReplay.ok && exploit.witnessReplay.objective === exploit.terminalHp
            ? 'purchase-lag_economy_bridge_wave_found_and_authoritatively_replayed_a_threshold_exploit'
            : 'economy_bridge_suffix_found_an_exploit_but_combined_step_witness_replay_needs_attention')
        : 'purchase-lag_economy_bridges_were_sampled_without_an_exploit_but_global_threshold_coverage_remains_incomplete'
    };
  });
}
