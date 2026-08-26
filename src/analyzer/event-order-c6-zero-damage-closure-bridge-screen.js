import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { createFixedPurchaseZeroDamageClosureAdapter } from '../solver/fixed-purchase-zero-damage-closure-adapter.js';
import { proveFixedPurchaseBridgeBelowThreshold } from '../solver/fixed-purchase-bridge-tight-bound.js';
import { FrontierIndex } from '../solver/frontier.js';
import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import { replayTowerCertificateToState } from '../solver/replay.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { resolveReviewCandidateReference } from '../tuner/review-candidate-reference.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';

function certificateHash(certificate) {
  return certificate?.certificateHash ?? null;
}

function forcedKillCount(certificate) {
  return (certificate?.steps ?? []).filter((step) =>
    step.normalizationRule === 'lucky-zero-damage-enemy-v1'
  ).length;
}

function range(values) {
  const finite = values.map(Number).filter(Number.isFinite);
  return finite.length ? { min: Math.min(...finite), max: Math.max(...finite) } : { min: null, max: null };
}

function histogram(values) {
  const out = {};
  for (const value of values) out[String(value)] = (out[String(value)] ?? 0) + 1;
  return out;
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

/**
 * Diagnostic bridge screen after promoting the Lucky zero-damage closure into
 * the fixed-policy staged search model. Reference identity remains resolved by
 * the ordinary fixed adapter; only counterexample/proof search is normalized.
 */
export function analyzeV3C6ZeroDamageClosureBridgeScreen({
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
  bridgeMaxGoalsPerPrefix = 32
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
        model: 'v3-c6-zero-damage-closure-bridge-screen-v0.1',
        status: 'candidate-snapshot-drift',
        productionWriteAllowed: false,
        exactNoExploit: false,
        referenceFailures: reference.failures ?? ['reference_resolution_failed']
      };
    }

    const threshold = reference.terminalHp;
    const searchAdapter = createFixedPurchaseZeroDamageClosureAdapter({ baseAdapter: fixedAdapter });
    const thresholdAdapter = createObjectiveThresholdAdapter({ threshold, baseAdapter: searchAdapter });
    const fromBoundaryAdapter = createCoreBoundaryAdapter({ targetCores: fromCores, baseAdapter: thresholdAdapter });
    const toBoundaryAdapter = createCoreBoundaryAdapter({ targetCores: toCores, baseAdapter: thresholdAdapter });

    const fromFrontier = collectGoalFrontier({
      adapter: fromBoundaryAdapter,
      maxExpanded: fromBoundaryMaxExpanded,
      maxGenerated: fromBoundaryMaxGenerated,
      maxGoals: fromBoundaryMaxGoals,
      solverVersion: `v3-closure-core${fromCores}-bridge-screen-prefix-v0.1`
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
        forcedKills: forcedKillCount(goal.certificate)
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
        solverVersion: `v3-closure-core${fromCores}-to-core${toCores}-bridge-screen-v0.1-g${bridgeMaxGoalsPerPrefix}`
      });
      let replayable = 0;
      let thresholdRelevant = 0;
      let acceptedPareto = 0;
      let forcedTransitionKills = 0;

      for (const goal of bridgeFrontier.goals) {
        const replay = replayTowerCertificateToState(goal.certificate, {
          adapter: toBoundaryAdapter,
          initialState: prefix.state
        });
        if (!replay.ok || !replay.state) continue;
        replayable += 1;
        const oldUpperBound = fixedAdapter.objectiveUpperBound(replay.state);
        if (!(oldUpperBound > threshold)) continue;
        thresholdRelevant += 1;
        forcedTransitionKills += forcedKillCount(goal.certificate);
        const key = fixedAdapter.structuralKey(replay.state);
        const label = {
          id: `${prefixCertificateHash}:${certificateHash(goal.certificate)}`,
          prefixCertificateHash,
          transitionCertificateHash: certificateHash(goal.certificate),
          active: true,
          key,
          state: replay.state,
          resources: fixedAdapter.resources(replay.state),
          shopPurchases: replay.state.shopPurchases,
          oldUpperBound,
          forcedKills: prefix.forcedKills + forcedKillCount(goal.certificate)
        };
        const insertion = bridgeIndex.insert(key, label);
        bridgeLabels.push(label);
        if (insertion.accepted) acceptedPareto += 1;
      }

      prefixAttempts.push({
        prefixCertificateHash,
        prefixResources: prefix.resources,
        prefixShopPurchases: prefix.shopPurchases,
        prefixUpperBound: prefix.oldUpperBound,
        prefixForcedKills: prefix.forcedKills,
        bridgeFrontier: compactFrontier(bridgeFrontier),
        replayableGoals: replayable,
        thresholdRelevantGoals: thresholdRelevant,
        acceptedParetoGoals: acceptedPareto,
        forcedTransitionKills
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
    const boundClosed = activeBridges.filter((bridge) => bridge.boundProof.provesNoExploit);
    const residual = activeBridges.filter((bridge) => !bridge.boundProof.provesNoExploit);

    return {
      schemaVersion: 1,
      model: 'v3-c6-zero-damage-closure-bridge-screen-v0.1',
      status: 'diagnostic-complete',
      productionWriteAllowed: false,
      exactNoExploit: false,
      reference: {
        terminalHp: threshold,
        minNormalizedHpMargin: reference.minNormalizedHpMargin
      },
      fromBoundary: compactFrontier(fromFrontier),
      prefixSchedule: {
        verifiedRelevantPrefixCount: verifiedPrefixes.length,
        scheduledPrefixCount: scheduledPrefixes.length,
        attemptedAllVerified: scheduledPrefixes.length === verifiedPrefixes.length,
        purchaseHistogram: histogram(verifiedPrefixes.map((prefix) => prefix.shopPurchases)),
        forcedKillRange: range(verifiedPrefixes.map((prefix) => prefix.forcedKills))
      },
      prefixAttempts,
      bridges: {
        discoveredLabels: bridgeLabels.length,
        activePareto: activeBridges.length,
        structuralStates: bridgeIndex.structuralStates,
        boundClosed: boundClosed.length,
        residual: residual.length,
        purchaseHistogram: histogram(activeBridges.map((bridge) => bridge.shopPurchases)),
        oldUpperBound: range(activeBridges.map((bridge) => bridge.oldUpperBound)),
        tightUpperBound: range(activeBridges.map((bridge) => bridge.tightUpperBound)),
        forcedKillRange: range(activeBridges.map((bridge) => bridge.forcedKills)),
        residualByPurchase: histogram(residual.map((bridge) => bridge.shopPurchases))
      },
      residual: residual.map((bridge) => ({
        id: bridge.id,
        prefixCertificateHash: bridge.prefixCertificateHash,
        transitionCertificateHash: bridge.transitionCertificateHash,
        resources: bridge.resources,
        shopPurchases: bridge.shopPurchases,
        oldUpperBound: bridge.oldUpperBound,
        tightUpperBound: bridge.tightUpperBound,
        tightSlack: bridge.tightUpperBound - threshold,
        forcedKills: bridge.forcedKills
      })),
      interpretation: 'closure_search_normalization_screened_c6_to_c7_bridges_without_running_terminal_suffixes'
    };
  });
}
