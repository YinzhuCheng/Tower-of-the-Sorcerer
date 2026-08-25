import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { fixedPurchaseOptionAt } from '../solver/fixed-purchase-policy-adapter.js';
import { replayTowerStepSkeleton } from '../solver/replay.js';
import { eventOrderWitnessSemanticFingerprint } from '../analyzer/event-order-witness.js';

export function eventOrderWitnessPurchasePlan(witness) {
  return (witness?.steps ?? [])
    .filter((step) => step.kind === 'shop')
    .map((step) => step.action?.optionId ?? null);
}

/**
 * Compare the shop actions that an event-order witness actually used against a
 * fixed purchase-policy sub-problem. The returned expected plan is materialized
 * only for the purchases present in the witness, so cycle fallback remains part
 * of the comparison contract.
 */
export function compareReferenceWitnessPurchasePolicy(witness, purchasePolicy) {
  const actualPlan = eventOrderWitnessPurchasePlan(witness);
  if (!witness?.steps?.length || !purchasePolicy?.shopCycle?.length) {
    return {
      ok: false,
      actualPlan,
      expectedPlan: [],
      firstMismatch: {
        index: 0,
        actual: actualPlan[0] ?? null,
        expected: null,
        reason: 'missing_witness_or_purchase_cycle'
      }
    };
  }

  const expectedPlan = actualPlan.map((_, index) => fixedPurchaseOptionAt(index, purchasePolicy));
  let firstMismatch = null;
  for (let index = 0; index < actualPlan.length; index += 1) {
    const actual = actualPlan[index];
    const expected = expectedPlan[index];
    if (typeof actual !== 'string' || actual !== expected) {
      firstMismatch = {
        index,
        actual,
        expected,
        reason: typeof actual === 'string' ? 'option_mismatch' : 'invalid_witness_shop_option'
      };
      break;
    }
  }

  return {
    ok: firstMismatch == null,
    actualPlan,
    expectedPlan,
    firstMismatch
  };
}

export function referenceWitnessMatchesPurchasePolicy(witness, purchasePolicy) {
  return compareReferenceWitnessPurchasePolicy(witness, purchasePolicy).ok;
}

function closeEnough(left, right, epsilon = 1e-12) {
  return Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) <= epsilon;
}

/**
 * Resolve the authoritative reference route used to define a review-candidate
 * threshold.
 *
 * `greedy-strategy` preserves V1 behavior. `event-order-step-witness` requires a
 * caller-supplied numeric-agnostic witness and replays every action under the
 * current balance overlay before its expected HP/margin is accepted.
 *
 * Event-order candidate identity has two layers:
 *
 * - `witnessHash`: exact generated skeleton provenance. It intentionally changes
 *   when source certificate hashes or free movement paths are reconstructed.
 * - `referenceSemanticFingerprint`: stable ordered macro-event identity. Once a
 *   candidate opts into this field it becomes the hard identity check, while a
 *   raw hash mismatch is retained only as provenance diagnostic evidence.
 *
 * Candidates without a semantic fingerprint keep the legacy raw-hash hard check
 * until they are explicitly migrated.
 */
export function resolveReviewCandidateReference({
  candidate,
  adapter,
  referenceWitness = null
} = {}) {
  if (!candidate?.purchasePolicy || !candidate?.expectedEvidence) {
    throw new Error('Candidate reference resolution requires purchasePolicy and expectedEvidence.');
  }
  const expected = candidate.expectedEvidence;
  const mode = expected.referenceMode ?? 'greedy-strategy';

  if (mode === 'greedy-strategy') {
    const policy = candidate.purchasePolicy;
    const route = runGreedyShopStrategy({
      shopCycle: [...policy.shopCycle],
      shopPlan: [...policy.shopPlan],
      holyPolicy: policy.referenceHolyPolicy ?? 'immediate'
    });
    const terminalHp = route.solvable ? route.final.hp : null;
    const hpMatches = !Number.isFinite(expected.terminalHp) || terminalHp === expected.terminalHp;
    const marginMatches = !Number.isFinite(expected.minNormalizedHpMargin)
      || closeEnough(route.minNormalizedHpMargin, expected.minNormalizedHpMargin);
    return {
      ok: route.solvable === true && hpMatches && marginMatches,
      mode,
      terminalHp,
      minNormalizedHpMargin: route.minNormalizedHpMargin,
      referenceWitnessHash: null,
      referenceSemanticFingerprint: null,
      rawWitnessHashMatches: null,
      purchaseCount: route.purchases,
      purchasePolicyComparison: null,
      holyCollected: route.relics?.holy === true,
      route,
      failures: [
        ...(route.solvable ? [] : [`greedy_reference_failed:${route.failure ?? 'unknown'}`]),
        ...(hpMatches ? [] : [`terminal_hp_mismatch:${terminalHp}!=${expected.terminalHp}`]),
        ...(marginMatches ? [] : [`margin_mismatch:${route.minNormalizedHpMargin}!=${expected.minNormalizedHpMargin}`])
      ],
      provenanceWarnings: []
    };
  }

  if (mode !== 'event-order-step-witness') {
    throw new Error(`Unknown review candidate reference mode: ${mode}`);
  }
  if (!referenceWitness?.steps?.length) {
    return {
      ok: false,
      mode,
      terminalHp: null,
      minNormalizedHpMargin: null,
      referenceWitnessHash: referenceWitness?.witnessHash ?? null,
      referenceSemanticFingerprint: null,
      rawWitnessHashMatches: null,
      purchaseCount: null,
      purchasePolicyComparison: null,
      holyCollected: false,
      route: null,
      failures: ['event_order_reference_witness_missing'],
      provenanceWarnings: []
    };
  }

  const failures = [];
  const provenanceWarnings = [];
  const semanticFingerprint = referenceWitness.semanticFingerprint
    ?? eventOrderWitnessSemanticFingerprint(referenceWitness);
  const semanticPinned = typeof expected.referenceSemanticFingerprint === 'string'
    && expected.referenceSemanticFingerprint.length > 0;
  const rawHashMatches = !expected.referenceWitnessHash
    || referenceWitness.witnessHash === expected.referenceWitnessHash;

  if (semanticPinned) {
    if (semanticFingerprint !== expected.referenceSemanticFingerprint) {
      failures.push(`witness_semantic_fingerprint_mismatch:${semanticFingerprint}!=${expected.referenceSemanticFingerprint}`);
    }
    if (!rawHashMatches) {
      provenanceWarnings.push(`witness_hash_changed:${referenceWitness.witnessHash}!=${expected.referenceWitnessHash}`);
    }
  } else if (!rawHashMatches) {
    failures.push(`witness_hash_mismatch:${referenceWitness.witnessHash}!=${expected.referenceWitnessHash}`);
  }

  const purchasePolicyComparison = compareReferenceWitnessPurchasePolicy(
    referenceWitness,
    candidate.purchasePolicy
  );
  if (!purchasePolicyComparison.ok) {
    const mismatch = purchasePolicyComparison.firstMismatch;
    failures.push('witness_purchase_policy_mismatch');
    if (mismatch) {
      failures.push(
        `witness_purchase_policy_first_mismatch:${mismatch.index}:${mismatch.actual ?? 'null'}!=${mismatch.expected ?? 'null'}`
      );
    }
  }
  const purchaseCount = purchasePolicyComparison.actualPlan.length;
  if (Number.isFinite(expected.purchaseCount) && purchaseCount !== expected.purchaseCount) {
    failures.push(`purchase_count_mismatch:${purchaseCount}!=${expected.purchaseCount}`);
  }

  const replay = replayTowerStepSkeleton(referenceWitness.steps, { adapter });
  const hpMatches = !Number.isFinite(expected.terminalHp) || replay.objective === expected.terminalHp;
  const marginMatches = !Number.isFinite(expected.minNormalizedHpMargin)
    || closeEnough(replay.minNormalizedHpMargin, expected.minNormalizedHpMargin);
  if (!replay.ok) failures.push(`witness_replay_failed:${replay.failures?.[0]?.reason ?? 'unknown'}`);
  if (!hpMatches) failures.push(`terminal_hp_mismatch:${replay.objective}!=${expected.terminalHp}`);
  if (!marginMatches) failures.push(`margin_mismatch:${replay.minNormalizedHpMargin}!=${expected.minNormalizedHpMargin}`);
  const holyCollected = referenceWitness.steps.some((step) =>
    step.action?.token === 'item:holy'
  );
  if (!holyCollected) failures.push('reference_witness_does_not_collect_holy');

  return {
    ok: failures.length === 0,
    mode,
    terminalHp: replay.ok ? replay.objective : null,
    minNormalizedHpMargin: replay.minNormalizedHpMargin,
    referenceWitnessHash: referenceWitness.witnessHash ?? null,
    referenceSemanticFingerprint: semanticFingerprint,
    rawWitnessHashMatches: rawHashMatches,
    purchaseCount,
    purchasePolicyComparison,
    holyCollected,
    route: replay,
    failures,
    provenanceWarnings
  };
}
