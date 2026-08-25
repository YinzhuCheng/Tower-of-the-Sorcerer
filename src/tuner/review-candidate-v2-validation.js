import { analyzeEventOrderWitnessPurchaseCounterfactuals } from '../analyzer/event-order-witness-counterfactuals.js';
import { analyzeEventOrderThresholdAgainstReferenceWitness } from '../analyzer/event-order-witness-threshold-proof.js';
import { provePreHolyCore6StaticCut } from '../analyzer/pre-holy-static-cut.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { replayTowerCertificate } from '../solver/replay.js';
import { solve } from '../solver/search.js';
import { createTowerAdapter } from '../solver/tower-adapter.js';
import { withBalanceEdits } from './balance-overlay.js';
import { rebuildDistributedPressureV2Reference } from './review-candidate-v2-rebuild.js';
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
 * Independent dry-run validation for distributed-pressure-v2.
 *
 * The 4,578-HP threshold is rebuilt from repository algorithms and replayed
 * under the V2 overlay before any proof uses it. The rebuilt witness shop
 * sequence is also compared against the persisted fixed-purchase policy; matching
 * HP/hash without matching policy is candidate snapshot drift, not valid proof
 * evidence. Numeric/Holy/purchase/robustness gates are evaluated separately from
 * the event-order closure gate so a bounded no-exploit search cannot be mistaken
 * for review readiness.
 */
export function validateDistributedPressureV2({
  maxPurchasePasses = 12,
  existenceMaxExpanded = 10_000,
  existenceMaxGenerated = 120_000,
  eventOrderMaxExpanded = 50_000,
  eventOrderMaxGenerated = 400_000,
  highRegretRelative = 0.20
} = {}) {
  const candidate = cloneReviewCandidate(REVIEW_CANDIDATES.distributedPressureV2);
  const rebuilt = rebuildDistributedPressureV2Reference({ maxPurchasePasses });
  const expected = candidate.expectedEvidence;
  const purchasePolicyComparison = compareReferenceWitnessPurchasePolicy(
    rebuilt.witness,
    candidate.purchasePolicy
  );
  const rebuildChecks = {
    sourceEditsMatch: sameEdits(rebuilt.edits, candidate.edits),
    terminalHpMatch: rebuilt.terminalHp === expected.terminalHp,
    marginMatch: Math.abs(rebuilt.minNormalizedHpMargin - expected.minNormalizedHpMargin) <= 1e-12,
    witnessHashMatch: rebuilt.witnessHash === expected.referenceWitnessHash,
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
      solverVersion: 'distributed-pressure-v2-existence-v0.1'
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
      holyCoverage: holyCoverage.coverageComplete
    };

    return {
      reference,
      existence: compactExistence(existenceSolver, existenceReplay),
      counterfactuals,
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
    schemaVersion: 2,
    model: 'distributed-pressure-v2-validation-v0.2-purchase-plan-consistency',
    candidateId: candidate.id,
    productionWriteAllowed: false,
    status: overallPassed ? 'ready_for_review' : 'blocked',
    candidate: {
      edits: candidate.edits,
      purchasePolicy: candidate.purchasePolicy,
      expectedEvidence: candidate.expectedEvidence
    },
    rebuild: {
      sourceRayStep: rebuilt.sourceRayStep,
      terminalHp: rebuilt.terminalHp,
      minNormalizedHpMargin: rebuilt.minNormalizedHpMargin,
      witnessHash: rebuilt.witnessHash,
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
      ? 'v2_reference_is_replay_verified_and_fixed_purchase_event_order_space_is_exactly_closed_above_it'
      : eventOrder.exploitFound
        ? 'v2_is_beaten_by_a_stronger_fixed_purchase_event_order_response'
        : eventOrder.status === 'coverage-incomplete'
          ? 'v2_passes_available_numeric_player_checks_but_event_order_closure_is_still_incomplete'
          : 'v2_failed_one_or_more_numeric_player_or_proof_checks'
  };
}
