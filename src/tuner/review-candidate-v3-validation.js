import { analyzeEventOrderWitnessPurchaseCounterfactuals } from '../analyzer/event-order-witness-counterfactuals.js';
import { analyzeEventOrderWitnessPurchaseRecovery } from '../analyzer/event-order-purchase-recovery.js';
import { analyzeEventOrderThresholdAgainstReferenceWitness } from '../analyzer/event-order-witness-threshold-proof.js';
import { provePreHolyCore6StaticCut } from '../analyzer/pre-holy-static-cut.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { replayTowerCertificate } from '../solver/replay.js';
import { solve } from '../solver/search.js';
import { createTowerAdapter } from '../solver/tower-adapter.js';
import { withBalanceEdits } from './balance-overlay.js';
import { rebuildDistributedPressureV3Reference } from './review-candidate-v3-rebuild.js';
import { compareReferenceWitnessPurchasePolicy, resolveReviewCandidateReference } from './review-candidate-reference.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from './review-candidates.js';

function stableEdits(edits) {
  return [...(edits ?? [])]
    .map((entry) => ({ target: entry.target, id: entry.id, field: entry.field, value: entry.value }))
    .sort((a, b) => `${a.target}:${a.id}:${a.field}`.localeCompare(`${b.target}:${b.id}:${b.field}`));
}

function sameEdits(left, right) {
  return JSON.stringify(stableEdits(left)) === JSON.stringify(stableEdits(right));
}

function compactExistence(solver, replay) {
  return {
    solvable: solver.solvable,
    exact: solver.exact,
    stoppedReason: solver.stoppedReason,
    expandedStates: solver.expandedStates,
    generatedStates: solver.generatedStates,
    prunedDominated: solver.prunedDominated,
    prunedBound: solver.prunedBound,
    certificateHash: solver.certificate?.certificateHash ?? null,
    replayOk: replay?.ok ?? null,
    replayFailures: replay?.failures ?? []
  };
}

/**
 * Global dry-run validation for the first coupled V3 seed.
 *
 * This deliberately keeps V2's strict independent-existence and whole-game
 * event-order closure requirements. A local coupled-search pass is only a seed;
 * it does not weaken any global promotion gate.
 */
export function validateDistributedPressureV3({
  maxPurchasePasses = 12,
  existenceMaxExpanded = 10_000,
  existenceMaxGenerated = 120_000,
  eventOrderMaxExpanded = 50_000,
  eventOrderMaxGenerated = 400_000,
  recoveryMaxActiveLabels = 50_000,
  highRegretRelative = 0.20
} = {}) {
  const candidate = cloneReviewCandidate(REVIEW_CANDIDATES.distributedPressureV3);
  const rebuilt = rebuildDistributedPressureV3Reference({ maxPurchasePasses });
  const expected = candidate.expectedEvidence;
  const purchasePolicyComparison = compareReferenceWitnessPurchasePolicy(
    rebuilt.witness,
    candidate.purchasePolicy
  );
  const semanticPinned = typeof expected.referenceSemanticFingerprint === 'string'
    && expected.referenceSemanticFingerprint.length > 0;
  const rawWitnessHashMatch = rebuilt.witnessHash === expected.referenceWitnessHash;
  const semanticFingerprintMatch = semanticPinned
    ? rebuilt.semanticFingerprint === expected.referenceSemanticFingerprint
    : null;
  const referenceIdentityMatch = semanticPinned
    ? semanticFingerprintMatch
    : rawWitnessHashMatch;
  const rebuildChecks = {
    sourceEditsMatch: sameEdits(rebuilt.edits, candidate.edits),
    terminalHpMatch: rebuilt.terminalHp === expected.terminalHp,
    marginMatch: Math.abs(rebuilt.minNormalizedHpMargin - expected.minNormalizedHpMargin) <= 1e-12,
    referenceIdentityMatch,
    purchasePlanMatch: purchasePolicyComparison.ok,
    purchaseCountMatch: rebuilt.purchaseCount === expected.purchaseCount,
    localOptimal: rebuilt.localOptimal === true,
    witnessStepsMatch: rebuilt.witness.steps.length === expected.witnessSteps
  };

  const numeric = withBalanceEdits(candidate.edits, () => {
    const fixedAdapter = createFixedPurchasePolicyTowerAdapter({
      shopPlan: candidate.purchasePolicy.shopPlan,
      shopCycle: candidate.purchasePolicy.shopCycle
    });
    const reference = resolveReviewCandidateReference({
      candidate,
      adapter: fixedAdapter,
      referenceWitness: rebuilt.witness
    });

    const existenceAdapter = createTowerAdapter();
    const existenceSolver = solve({
      adapter: existenceAdapter,
      mode: 'existence',
      maxExpanded: existenceMaxExpanded,
      maxGenerated: existenceMaxGenerated,
      solverVersion: 'distributed-pressure-v3-existence-v0.1-coupled'
    });
    const existenceReplay = existenceSolver.certificate
      ? replayTowerCertificate(existenceSolver.certificate, { adapter: existenceAdapter })
      : null;
    const counterfactuals = reference.ok
      ? analyzeEventOrderWitnessPurchaseCounterfactuals({
          witness: rebuilt.witness,
          adapter: existenceAdapter,
          highRegretRelative
        })
      : null;
    const recoveryAwareCounterfactuals = counterfactuals
      ? analyzeEventOrderWitnessPurchaseRecovery({
          witness: rebuilt.witness,
          adapter: existenceAdapter,
          noRecourseReport: counterfactuals,
          maxActiveLabels: recoveryMaxActiveLabels
        })
      : null;
    const staticCut = provePreHolyCore6StaticCut();
    const holyCoverage = {
      immediateFeasible: reference.ok && reference.holyCollected,
      delayedPoliciesProvenInfeasible: staticCut.proven === true
        ? [...staticCut.appliesToPolicies]
        : [],
      staticCutCertificateHash: staticCut.proven ? staticCut.certificateHash : null,
      coverageComplete: Boolean(
        reference.ok
        && reference.holyCollected
        && staticCut.proven
        && staticCut.appliesToPolicies.length === 3
      )
    };

    const pressureBand = expected.pressureTarget ?? [0.08, 0.25];
    const recoveryTotal = recoveryAwareCounterfactuals?.totalMutations ?? 0;
    const recoveryUnrecoverableRate = recoveryTotal > 0
      ? (recoveryAwareCounterfactuals.exactUnrecoverableMutations ?? recoveryTotal) / recoveryTotal
      : 1;
    const hardChecks = {
      referenceRebuilt: Object.values(rebuildChecks).every(Boolean),
      referenceReplay: reference.ok === true,
      exactExistence: existenceSolver.solvable === true
        && existenceSolver.exact === true
        && existenceReplay?.ok === true,
      pressureTarget: Number.isFinite(reference.minNormalizedHpMargin)
        && reference.minNormalizedHpMargin >= pressureBand[0]
        && reference.minNormalizedHpMargin <= pressureBand[1],
      purchaseOneOptimal: counterfactuals?.improvedMutationCount === 0,
      recovery: (counterfactuals?.recoveryRate ?? 0) >= 0.60,
      catastrophic: (counterfactuals?.catastrophicRate ?? 1) <= 0.10,
      recoveryAwareExact: recoveryAwareCounterfactuals?.unknownMutations === 0,
      recoveryAwareCatastrophic: recoveryUnrecoverableRate <= 0.10,
      holyCoverage: holyCoverage.coverageComplete
    };

    return {
      reference,
      existence: compactExistence(existenceSolver, existenceReplay),
      counterfactuals,
      recoveryAwareCounterfactuals,
      recoveryUnrecoverableRate,
      holyCoverage,
      hardChecks,
      baseHardPassed: Object.values(hardChecks).every(Boolean)
    };
  });

  const eventOrder = analyzeEventOrderThresholdAgainstReferenceWitness({
    candidate,
    referenceWitness: rebuilt.witness,
    maxExpanded: eventOrderMaxExpanded,
    maxGenerated: eventOrderMaxGenerated
  });
  const eventOrderBestResponse = eventOrder.exactNoExploit === true;
  const overallPassed = numeric.baseHardPassed && eventOrderBestResponse;

  return {
    schemaVersion: 1,
    model: 'distributed-pressure-v3-validation-v0.1-coupled',
    candidateId: candidate.id,
    productionWriteAllowed: false,
    status: overallPassed ? 'ready_for_review' : 'blocked',
    candidate: {
      edits: candidate.edits,
      purchasePolicy: candidate.purchasePolicy,
      expectedEvidence: candidate.expectedEvidence
    },
    rebuild: {
      sourceV2TerminalHp: rebuilt.sourceV2TerminalHp,
      sourceV2SemanticFingerprint: rebuilt.sourceV2SemanticFingerprint,
      terminalHp: rebuilt.terminalHp,
      minNormalizedHpMargin: rebuilt.minNormalizedHpMargin,
      witnessHash: rebuilt.witnessHash,
      semanticFingerprint: rebuilt.semanticFingerprint,
      expectedWitnessHash: expected.referenceWitnessHash ?? null,
      expectedSemanticFingerprint: expected.referenceSemanticFingerprint ?? null,
      semanticPinned,
      rawWitnessHashMatch,
      semanticFingerprintMatch,
      witnessSteps: rebuilt.witness.steps.length,
      purchasePlan: [...rebuilt.purchasePlan],
      expectedPurchasePlan: [...purchasePolicyComparison.expectedPlan],
      purchasePolicyMismatch: purchasePolicyComparison.firstMismatch,
      localOptimal: rebuilt.localOptimal,
      checks: rebuildChecks
    },
    reference: numeric.reference,
    existence: numeric.existence,
    holyCoverage: numeric.holyCoverage,
    counterfactuals: numeric.counterfactuals,
    recoveryAwareCounterfactuals: numeric.recoveryAwareCounterfactuals,
    recoveryUnrecoverableRate: numeric.recoveryUnrecoverableRate,
    hardChecks: {
      ...numeric.hardChecks,
      eventOrderBestResponse
    },
    eventOrder,
    failures: [
      ...Object.entries(numeric.hardChecks).filter(([, ok]) => !ok).map(([key]) => key),
      ...(eventOrderBestResponse ? [] : ['eventOrderBestResponse'])
    ],
    interpretation: overallPassed
      ? 'v3_coupled_reference_passes_all_current_global_review_gates'
      : eventOrder.exploitFound
        ? 'v3_is_beaten_by_a_stronger_fixed_purchase_event_order_response'
        : eventOrder.status === 'coverage-incomplete'
          ? 'v3_local_coupled_seed_is_valid_but_global_event_order_closure_is_incomplete'
          : 'v3_failed_one_or_more_global_numeric_player_or_proof_checks'
  };
}
