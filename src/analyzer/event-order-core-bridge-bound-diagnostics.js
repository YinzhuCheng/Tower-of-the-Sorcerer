import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { explainFixedPurchaseTerminalHpUpperBound } from '../solver/fixed-purchase-bound-diagnostics.js';
import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import { replayTowerCertificateToState } from '../solver/replay.js';
import { hashValue } from '../solver/state.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { resolveReviewCandidateReference } from '../tuner/review-candidate-reference.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';

function certificateHash(certificate) {
  return certificate?.certificateHash ?? null;
}

function cardTotal(resources = {}) {
  return Number(resources.sun ?? 0) + Number(resources.moon ?? 0) + Number(resources.star ?? 0);
}

function strongest(entries) {
  return [...entries].sort((a, b) => b.upperBound - a.upperBound
    || (b.resources?.gold ?? 0) - (a.resources?.gold ?? 0)
    || (b.resources?.hp ?? 0) - (a.resources?.hp ?? 0)
    || a.id.localeCompare(b.id))[0] ?? null;
}

/** Select a small set of bridge states whose bound decompositions are materially different. */
export function selectBoundDiagnosticBridges(bridges = []) {
  const p21 = bridges.filter((bridge) => Number(bridge.shopPurchases) === 21);
  const p20 = bridges.filter((bridge) => Number(bridge.shopPurchases) === 20);
  const candidates = [];

  const maxUpperP21 = strongest(p21);
  if (maxUpperP21) candidates.push({ role: 'p21-max-upper', bridge: maxUpperP21 });

  const minUpperP21 = [...p21].sort((a, b) => a.upperBound - b.upperBound
    || (a.resources?.hp ?? 0) - (b.resources?.hp ?? 0)
    || (b.resources?.gold ?? 0) - (a.resources?.gold ?? 0)
    || a.id.localeCompare(b.id))[0] ?? null;
  if (minUpperP21) candidates.push({ role: 'p21-min-upper', bridge: minUpperP21 });

  const cardRichP21 = [...p21].sort((a, b) => cardTotal(b.resources) - cardTotal(a.resources)
    || b.upperBound - a.upperBound
    || (b.resources?.gold ?? 0) - (a.resources?.gold ?? 0)
    || a.id.localeCompare(b.id))[0] ?? null;
  if (cardRichP21) candidates.push({ role: 'p21-card-rich', bridge: cardRichP21 });

  const highGoldP20 = [...p20].sort((a, b) => (b.resources?.gold ?? 0) - (a.resources?.gold ?? 0)
    || b.upperBound - a.upperBound
    || a.id.localeCompare(b.id))[0] ?? null;
  if (highGoldP20) candidates.push({ role: 'p20-high-gold', bridge: highGoldP20 });

  const seen = new Set();
  return candidates.filter(({ bridge }) => {
    if (seen.has(bridge.id)) return false;
    seen.add(bridge.id);
    return true;
  });
}

/**
 * Explain the proof-level fixed-purchase upper bound on representative V3 c7
 * bridges before attempting another heuristic suffix wave.
 */
export function analyzeV3C7FixedPurchaseBoundDiagnostics({
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
        model: 'v3-c7-fixed-purchase-bound-diagnostics-v0.1',
        status: 'candidate-snapshot-drift',
        productionWriteAllowed: false,
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
      solverVersion: 'v3-bound-diagnostic-c6-prefix-v0.1'
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
        model: 'v3-c7-fixed-purchase-bound-diagnostics-v0.1',
        status: 'no-threshold-relevant-prefix',
        productionWriteAllowed: false,
        exactNoExploit: false
      };
    }

    const bridgeFrontier = collectGoalFrontier({
      adapter: toAdapter,
      initialState: prefix.state,
      maxExpanded: bridgeMaxExpanded,
      maxGenerated: bridgeMaxGenerated,
      maxGoals: bridgeMaxGoals,
      solverVersion: `v3-bound-diagnostic-c7-frontier-v0.1-g${bridgeMaxGoals}`
    });
    const bridges = bridgeFrontier.goals.map((goal) => {
      const replay = replayTowerCertificateToState(goal.certificate, {
        adapter: toAdapter,
        initialState: prefix.state
      });
      if (!replay.ok || !replay.state) return null;
      const upperBound = fixedAdapter.objectiveUpperBound(replay.state);
      if (!(upperBound > referenceHp)) return null;
      const structuralKey = fixedAdapter.structuralKey(replay.state);
      return {
        id: `${certificateHash(prefix.certificate)}:${certificateHash(goal.certificate)}`,
        certificateHash: certificateHash(goal.certificate),
        state: replay.state,
        resources: fixedAdapter.resources(replay.state),
        shopPurchases: replay.state.shopPurchases,
        upperBound,
        structuralKeyHash: hashValue(structuralKey)
      };
    }).filter(Boolean);

    const representatives = selectBoundDiagnosticBridges(bridges).map(({ role, bridge }) => {
      const explanation = explainFixedPurchaseTerminalHpUpperBound({
        adapter: fixedAdapter,
        state: bridge.state,
        shopPlan: snapshot.purchasePolicy.shopPlan,
        shopCycle: snapshot.purchasePolicy.shopCycle
      });
      return {
        role,
        id: bridge.id,
        certificateHash: bridge.certificateHash,
        structuralKeyHash: bridge.structuralKeyHash,
        resources: bridge.resources,
        shopPurchases: bridge.shopPurchases,
        threshold: referenceHp,
        upperBound: bridge.upperBound,
        thresholdSlack: bridge.upperBound - referenceHp,
        explanation
      };
    });

    return {
      schemaVersion: 1,
      model: 'v3-c7-fixed-purchase-bound-diagnostics-v0.1',
      status: 'diagnostic-complete',
      productionWriteAllowed: false,
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
      interpretation: 'representative_c7_upper_bounds_were_decomposed_and_cross_checked_against_the_proof_adapter'
    };
  });
}
