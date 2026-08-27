import { buildEventOrderStepWitness } from './event-order-witness.js';
import { summarizeSuffixSearchTelemetry } from './event-order-core-transition-chain.js';
import { schedulePrefixRoundRobinBridges } from './event-order-core-transition-multibridge.js';
import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchaseAffordableShopClosureAdapter } from '../solver/fixed-purchase-affordable-shop-closure-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { createFixedPurchaseCrossFloorZeroDamageClosureAdapter } from '../solver/fixed-purchase-cross-floor-zero-damage-closure-adapter.js';
import { proveFixedPurchaseBridgeBelowThreshold } from '../solver/fixed-purchase-bridge-tight-bound.js';
import { FrontierIndex } from '../solver/frontier.js';
import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { createLateGameThresholdPriorityAdapter } from '../solver/late-game-threshold-priority-adapter.js';
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

function compactFrontier(report) {
  return {
    coverageExact: report.coverageExact,
    stoppedReason: report.stoppedReason,
    activeGoalLabels: report.activeGoalLabels,
    goalStructuralStates: report.goalStructuralStates,
    expandedStates: report.expandedStates,
    generatedStates: report.generatedStates,
    structuralStates: report.structuralStates,
    prunedDominated: report.prunedDominated
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
    telemetry: summarizeSuffixSearchTelemetry(report, { lateFloorFrom: 7 }),
    certificateHash: certificateHash(report.certificate),
    certificateSteps: report.certificate?.steps?.length ?? 0
  };
}

function bridgeSort(left, right) {
  return right.tightUpperBound - left.tightUpperBound
    || right.oldUpperBound - left.oldUpperBound
    || (right.resources?.hp ?? 0) - (left.resources?.hp ?? 0)
    || (right.resources?.gold ?? 0) - (left.resources?.gold ?? 0)
    || String(left.id).localeCompare(String(right.id));
}

function normalizationCounts(certificate) {
  const steps = certificate?.steps ?? [];
  return {
    localKills: steps.filter((step) => step.normalizationRule === 'lucky-zero-damage-enemy-v1').length,
    crossTeleports: steps.filter((step) => step.normalizationRule === 'compass-cross-floor-zero-damage-v1').length,
    shopPurchases: steps.filter((step) => step.normalizationRule === 'fixed-purchase-affordable-shop-v1').length,
    shopTeleports: steps.filter((step) => step.normalizationRule === 'fixed-purchase-affordable-shop-cross-floor-v1').length
  };
}

/**
 * Counterexample-first V3 search with two independent monotone canonicalizers:
 * Lucky/Compass zero-damage harvest closure and fixed-policy affordable-purchase
 * closure. Threshold crossings are accepted only after the combined action
 * skeleton replays on the ordinary fixed-purchase adapter / authoritative engine.
 */
export function analyzeV3C6CrossFloorShopClosureCounterexampleHunt({
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
  suffixPrioritySlackBucket = 500
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
        model: 'v3-c6-cross-floor-shop-closure-counterexample-hunt-v0.1',
        status: 'candidate-snapshot-drift',
        productionWriteAllowed: false,
        exploitFound: false,
        exactNoExploit: false,
        referenceFailures: reference.failures ?? ['reference_resolution_failed']
      };
    }

    const threshold = reference.terminalHp;
    const zeroDamageAdapter = createFixedPurchaseCrossFloorZeroDamageClosureAdapter({
      baseAdapter: fixedAdapter
    });
    const searchAdapter = createFixedPurchaseAffordableShopClosureAdapter({
      baseAdapter: zeroDamageAdapter
    });
    const thresholdAdapter = createObjectiveThresholdAdapter({ threshold, baseAdapter: searchAdapter });
    const fromBoundaryAdapter = createCoreBoundaryAdapter({ targetCores: fromCores, baseAdapter: thresholdAdapter });
    const toBoundaryAdapter = createCoreBoundaryAdapter({ targetCores: toCores, baseAdapter: thresholdAdapter });

    const fromFrontier = collectGoalFrontier({
      adapter: fromBoundaryAdapter,
      maxExpanded: fromBoundaryMaxExpanded,
      maxGenerated: fromBoundaryMaxGenerated,
      maxGoals: fromBoundaryMaxGoals,
      solverVersion: `v3-cross-floor-shop-hunt-core${fromCores}-prefix-v0.1`
    });
    const verifiedPrefixes = fromFrontier.goals.map((goal) => {
      const replay = replayTowerCertificateToState(goal.certificate, { adapter: fromBoundaryAdapter });
      if (!replay.ok || !replay.state) return null;
      const oldUpperBound = fixedAdapter.objectiveUpperBound(replay.state);
      if (!(oldUpperBound > threshold)) return null;
      return {
        goal,
        state: replay.state,
        resources: fixedAdapter.resources(replay.state),
        shopPurchases: replay.state.shopPurchases,
        oldUpperBound,
        normalization: normalizationCounts(goal.certificate)
      };
    }).filter(Boolean).sort((a, b) => b.oldUpperBound - a.oldUpperBound
      || (b.resources?.gold ?? 0) - (a.resources?.gold ?? 0)
      || String(certificateHash(a.goal.certificate)).localeCompare(String(certificateHash(b.goal.certificate))));
    const scheduledPrefixes = verifiedPrefixes.slice(0, maxPrefixSeeds);

    const bridgeIndex = new FrontierIndex({ fields: fixedAdapter.resourceFields ?? null });
    const bridgeLabels = [];
    const prefixAttempts = [];
    for (const prefix of scheduledPrefixes) {
      const prefixCertificateHash = certificateHash(prefix.goal.certificate);
      const bridgeFrontier = collectGoalFrontier({
        adapter: toBoundaryAdapter,
        initialState: prefix.state,
        maxExpanded: bridgeMaxExpandedPerPrefix,
        maxGenerated: bridgeMaxGeneratedPerPrefix,
        maxGoals: bridgeMaxGoalsPerPrefix,
        solverVersion: `v3-cross-floor-shop-hunt-core${fromCores}-to-core${toCores}-v0.1-g${bridgeMaxGoalsPerPrefix}`
      });
      let replayable = 0;
      let relevant = 0;
      for (const goal of bridgeFrontier.goals) {
        const replay = replayTowerCertificateToState(goal.certificate, {
          adapter: toBoundaryAdapter,
          initialState: prefix.state
        });
        if (!replay.ok || !replay.state) continue;
        replayable += 1;
        const oldUpperBound = fixedAdapter.objectiveUpperBound(replay.state);
        if (!(oldUpperBound > threshold)) continue;
        relevant += 1;
        const key = fixedAdapter.structuralKey(replay.state);
        const label = {
          id: `${prefixCertificateHash}:${certificateHash(goal.certificate)}`,
          prefixCertificateHash,
          transitionCertificateHash: certificateHash(goal.certificate),
          prefixCertificate: prefix.goal.certificate,
          transitionCertificate: goal.certificate,
          active: true,
          key,
          state: replay.state,
          resources: fixedAdapter.resources(replay.state),
          shopPurchases: replay.state.shopPurchases,
          oldUpperBound,
          normalization: {
            prefix: prefix.normalization,
            transition: normalizationCounts(goal.certificate)
          }
        };
        bridgeIndex.insert(key, label);
        bridgeLabels.push(label);
      }
      prefixAttempts.push({
        prefixCertificateHash,
        prefixResources: prefix.resources,
        prefixShopPurchases: prefix.shopPurchases,
        prefixUpperBound: prefix.oldUpperBound,
        prefixNormalization: prefix.normalization,
        bridgeFrontier: compactFrontier(bridgeFrontier),
        replayableGoals: replayable,
        thresholdRelevantGoals: relevant
      });
    }

    const activeBridges = bridgeLabels.filter((bridge) => bridge.active);
    for (const bridge of activeBridges) {
      bridge.boundProof = proveFixedPurchaseBridgeBelowThreshold({
        adapter: fixedAdapter,
        state: bridge.state,
        threshold,
        shopPlan: policy.shopPlan,
        shopCycle: policy.shopCycle,
        pureHpFloorId: 7
      });
      bridge.tightUpperBound = bridge.boundProof.tightUpperBound;
    }
    activeBridges.sort(bridgeSort);
    const residualBridges = activeBridges.filter((bridge) => !bridge.boundProof.provesNoExploit);
    const scheduledResidualBridges = schedulePrefixRoundRobinBridges(residualBridges, {
      maxBridges: Math.min(maxSuffixBridges, residualBridges.length)
    });

    const orderedSuffixBaseAdapter = createLateGameThresholdPriorityAdapter({
      baseAdapter: searchAdapter,
      threshold,
      minCores: toCores,
      slackBucket: suffixPrioritySlackBucket
    });
    const suffixThresholdAdapter = createObjectiveThresholdAdapter({
      threshold,
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
        solverVersion: `v3-cross-floor-shop-hunt-core${toCores}-suffix-v0.1-b${suffixPrioritySlackBucket}`
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
        && replay.objective > threshold;
      suffixAttempts.push({
        bridgeId: bridge.id,
        prefixCertificateHash: bridge.prefixCertificateHash,
        transitionCertificateHash: bridge.transitionCertificateHash,
        resources: bridge.resources,
        shopPurchases: bridge.shopPurchases,
        oldUpperBound: bridge.oldUpperBound,
        tightUpperBound: bridge.tightUpperBound,
        tightThresholdSlack: bridge.tightUpperBound - threshold,
        normalization: bridge.normalization,
        solver: compactSolver(solver),
        replay: replay ? {
          ok: replay.ok,
          failures: replay.failures,
          objective: replay.objective,
          final: replay.final
        } : null,
        exploit: suffixExploit
      });
      if (!suffixExploit) continue;

      const witness = buildEventOrderStepWitness({
        candidateId: snapshot.id,
        referenceTerminalHp: threshold,
        expectedTerminalHp: replay.objective,
        certificates: [bridge.prefixCertificate, bridge.transitionCertificate, suffixCertificate]
      });
      const witnessReplay = replayTowerStepSkeleton(witness.steps, { adapter: fixedAdapter });
      exploit = {
        bridgeId: bridge.id,
        terminalHp: replay.objective,
        deltaHp: replay.objective - threshold,
        relativeGain: (replay.objective - threshold) / Math.max(1, threshold),
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
      model: 'v3-c6-cross-floor-shop-closure-counterexample-hunt-v0.1',
      status: exploit ? 'exploit-found' : 'coverage-incomplete',
      productionWriteAllowed: false,
      exploitFound: Boolean(exploit),
      exactNoExploit: false,
      reference: {
        terminalHp: threshold,
        minNormalizedHpMargin: reference.minNormalizedHpMargin
      },
      fromBoundary: compactFrontier(fromFrontier),
      prefixSchedule: {
        verifiedRelevantPrefixCount: verifiedPrefixes.length,
        scheduledPrefixCount: scheduledPrefixes.length,
        attemptedAllVerified: scheduledPrefixes.length === verifiedPrefixes.length
      },
      prefixAttempts,
      bridgeSummary: {
        activePareto: activeBridges.length,
        boundClosed: activeBridges.length - residualBridges.length,
        residual: residualBridges.length,
        scheduledResidual: scheduledResidualBridges.length,
        scheduledFamilies: [...new Set(scheduledResidualBridges.map((bridge) => bridge.prefixCertificateHash))]
      },
      suffix: {
        maxExpandedPerBridge: suffixMaxExpandedPerBridge,
        maxGeneratedPerBridge: suffixMaxGeneratedPerBridge,
        attempts: suffixAttempts
      },
      exploit,
      interpretation: exploit
        ? (exploit.witnessReplay.ok && exploit.witnessReplay.objective === exploit.terminalHp
            ? 'Affordable fixed-policy shop closure exposed a stronger legal V3 route and the combined witness replayed on the ordinary authoritative fixed-purchase adapter'
            : 'shop-closure suffix found a threshold exploit but ordinary combined witness replay needs attention')
        : 'Affordable fixed-policy purchase timing was canonicalized but the sampled residual suffix portfolio still did not find a replayable V3 exploit'
    };
  });
}
