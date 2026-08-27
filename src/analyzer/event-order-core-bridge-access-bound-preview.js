import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { explainFixedPurchaseTerminalHpUpperBound } from '../solver/fixed-purchase-bound-diagnostics.js';
import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import { previewPureHpAccessTightening } from '../solver/relaxed-pure-hp-access-bound.js';
import { replayTowerCertificateToState } from '../solver/replay.js';
import { hashValue } from '../solver/state.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { resolveReviewCandidateReference } from '../tuner/review-candidate-reference.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';
import { selectBoundDiagnosticBridges } from './event-order-core-bridge-bound-diagnostics.js';

function certificateHash(certificate) {
  return certificate?.certificateHash ?? null;
}

/**
 * Diagnostic-only preview of one sound topology-aware tightening on representative
 * V3 c7 bridges. The proof adapter itself is not modified here.
 */
export function analyzeV3C7PureHpAccessBoundPreview({
  candidate = REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness = null,
  fromCores = 6,
  toCores = 7,
  fromBoundaryMaxExpanded = 8_000,
  fromBoundaryMaxGenerated = 100_000,
  fromBoundaryMaxGoals = 64,
  bridgeMaxExpanded = 6_000,
  bridgeMaxGenerated = 90_000,
  bridgeMaxGoals = 32
} = {}) {
  const snapshot = cloneReviewCandidate(candidate);
  return withBalanceEdits(snapshot.edits, () => {
    const fixedAdapter = createFixedPurchasePolicyTowerAdapter({
      shopPlan: snapshot.purchasePolicy.shopPlan,
      shopCycle: snapshot.purchasePolicy.shopCycle
    });
    const reference = resolveReviewCandidateReference({
      candidate: snapshot,
      adapter: fixedAdapter,
      referenceWitness
    });
    if (!reference.ok || !Number.isFinite(reference.terminalHp)) {
      return {
        schemaVersion: 1,
        model: 'v3-c7-pure-hp-access-bound-preview-v0.1',
        status: 'candidate-snapshot-drift',
        productionWriteAllowed: false,
        proofBoundModified: false,
        exactNoExploit: false,
        referenceFailures: reference.failures ?? ['reference_resolution_failed']
      };
    }
    const referenceHp = reference.terminalHp;
    const thresholdAdapter = createObjectiveThresholdAdapter({
      threshold: referenceHp,
      baseAdapter: fixedAdapter
    });
    const fromAdapter = createCoreBoundaryAdapter({ targetCores: fromCores, baseAdapter: thresholdAdapter });
    const toAdapter = createCoreBoundaryAdapter({ targetCores: toCores, baseAdapter: thresholdAdapter });

    const fromFrontier = collectGoalFrontier({
      adapter: fromAdapter,
      maxExpanded: fromBoundaryMaxExpanded,
      maxGenerated: fromBoundaryMaxGenerated,
      maxGoals: fromBoundaryMaxGoals,
      solverVersion: 'v3-access-preview-c6-prefix-v0.1'
    });
    const prefixes = fromFrontier.goals.map((goal) => {
      const replay = replayTowerCertificateToState(goal.certificate, { adapter: fromAdapter });
      if (!replay.ok || !replay.state) return null;
      const upperBound = fixedAdapter.objectiveUpperBound(replay.state);
      if (!(upperBound > referenceHp)) return null;
      return {
        certificate: goal.certificate,
        state: replay.state,
        resources: fixedAdapter.resources(replay.state),
        upperBound
      };
    }).filter(Boolean).sort((a, b) => b.upperBound - a.upperBound
      || (b.resources?.gold ?? 0) - (a.resources?.gold ?? 0)
      || String(certificateHash(a.certificate)).localeCompare(String(certificateHash(b.certificate))));
    const prefix = prefixes[0];
    if (!prefix) {
      return {
        schemaVersion: 1,
        model: 'v3-c7-pure-hp-access-bound-preview-v0.1',
        status: 'no-threshold-relevant-prefix',
        productionWriteAllowed: false,
        proofBoundModified: false,
        exactNoExploit: false
      };
    }

    const bridgeFrontier = collectGoalFrontier({
      adapter: toAdapter,
      initialState: prefix.state,
      maxExpanded: bridgeMaxExpanded,
      maxGenerated: bridgeMaxGenerated,
      maxGoals: bridgeMaxGoals,
      solverVersion: `v3-access-preview-c7-frontier-v0.1-g${bridgeMaxGoals}`
    });
    const bridges = bridgeFrontier.goals.map((goal) => {
      const replay = replayTowerCertificateToState(goal.certificate, {
        adapter: toAdapter,
        initialState: prefix.state
      });
      if (!replay.ok || !replay.state) return null;
      const upperBound = fixedAdapter.objectiveUpperBound(replay.state);
      if (!(upperBound > referenceHp)) return null;
      return {
        id: `${certificateHash(prefix.certificate)}:${certificateHash(goal.certificate)}`,
        certificateHash: certificateHash(goal.certificate),
        state: replay.state,
        resources: fixedAdapter.resources(replay.state),
        shopPurchases: replay.state.shopPurchases,
        upperBound,
        structuralKeyHash: hashValue(fixedAdapter.structuralKey(replay.state))
      };
    }).filter(Boolean);

    const representatives = selectBoundDiagnosticBridges(bridges).map(({ role, bridge }) => {
      const explanation = explainFixedPurchaseTerminalHpUpperBound({
        adapter: fixedAdapter,
        state: bridge.state,
        shopPlan: snapshot.purchasePolicy.shopPlan,
        shopCycle: snapshot.purchasePolicy.shopCycle
      });
      const accessPreview = previewPureHpAccessTightening({
        adapter: fixedAdapter,
        state: bridge.state,
        boundExplanation: explanation,
        floorId: 7
      });
      return {
        role,
        id: bridge.id,
        certificateHash: bridge.certificateHash,
        structuralKeyHash: bridge.structuralKeyHash,
        resources: bridge.resources,
        shopPurchases: bridge.shopPurchases,
        threshold: referenceHp,
        oldUpperBound: bridge.upperBound,
        oldThresholdSlack: bridge.upperBound - referenceHp,
        oldBoundExactMatch: explanation.exactMatch,
        accessPreview,
        previewUpperBound: accessPreview.previewUpperBound,
        tightening: accessPreview.tightening,
        previewThresholdSlack: accessPreview.previewUpperBound - referenceHp,
        previewWouldPruneThreshold: accessPreview.previewUpperBound <= referenceHp
      };
    });

    return {
      schemaVersion: 1,
      model: 'v3-c7-pure-hp-access-bound-preview-v0.1',
      status: 'diagnostic-complete',
      productionWriteAllowed: false,
      proofBoundModified: false,
      exactNoExploit: false,
      reference: {
        terminalHp: referenceHp,
        minNormalizedHpMargin: reference.minNormalizedHpMargin
      },
      prefix: {
        certificateHash: certificateHash(prefix.certificate),
        resources: prefix.resources,
        upperBound: prefix.upperBound
      },
      bridgeFrontier: {
        goals: bridgeFrontier.goals.length,
        activeGoalLabels: bridgeFrontier.activeGoalLabels,
        stoppedReason: bridgeFrontier.stoppedReason,
        coverageExact: bridgeFrontier.coverageExact,
        expandedStates: bridgeFrontier.expandedStates,
        generatedStates: bridgeFrontier.generatedStates
      },
      bridgeCount: bridges.length,
      representatives,
      maxPreviewTightening: Math.max(0, ...representatives.map((entry) => entry.tightening)),
      previewPrunableRepresentativeCount: representatives.filter((entry) => entry.previewWouldPruneThreshold).length,
      interpretation: representatives.some((entry) => entry.tightening > 0)
        ? 'single_pure_hp_access_constraints_soundly_tighten_representative_bound_previews_without_modifying_the_proof_adapter'
        : 'representative_bound_slack_is_not_reduced_by_the_current_single_pure_hp_access_constraint'
    };
  });
}
