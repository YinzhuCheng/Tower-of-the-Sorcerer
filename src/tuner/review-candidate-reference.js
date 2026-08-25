import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { fixedPurchaseOptionAt } from '../solver/fixed-purchase-policy-adapter.js';
import { replayTowerStepSkeleton } from '../solver/replay.js';

function witnessShopSequence(witness) {
  return (witness?.steps ?? [])
    .filter((step) => step.kind === 'shop')
    .map((step) => step.action?.optionId ?? null);
}

export function referenceWitnessMatchesPurchasePolicy(witness, purchasePolicy) {
  if (!witness?.steps?.length || !purchasePolicy?.shopCycle?.length) return false;
  const sequence = witnessShopSequence(witness);
  if (sequence.some((optionId) => typeof optionId !== 'string')) return false;
  return sequence.every((optionId, index) =>
    optionId === fixedPurchaseOptionAt(index, purchasePolicy)
  );
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
 * current balance overlay before its expected HP/margin is accepted. A stored
 * HP or witness hash alone is never sufficient evidence.
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
      purchaseCount: route.purchases,
      holyCollected: route.relics?.holy === true,
      route,
      failures: [
        ...(route.solvable ? [] : [`greedy_reference_failed:${route.failure ?? 'unknown'}`]),
        ...(hpMatches ? [] : [`terminal_hp_mismatch:${terminalHp}!=${expected.terminalHp}`]),
        ...(marginMatches ? [] : [`margin_mismatch:${route.minNormalizedHpMargin}!=${expected.minNormalizedHpMargin}`])
      ]
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
      purchaseCount: null,
      holyCollected: false,
      route: null,
      failures: ['event_order_reference_witness_missing']
    };
  }

  const failures = [];
  if (expected.referenceWitnessHash && referenceWitness.witnessHash !== expected.referenceWitnessHash) {
    failures.push(`witness_hash_mismatch:${referenceWitness.witnessHash}!=${expected.referenceWitnessHash}`);
  }
  if (!referenceWitnessMatchesPurchasePolicy(referenceWitness, candidate.purchasePolicy)) {
    failures.push('witness_purchase_policy_mismatch');
  }
  const purchaseCount = witnessShopSequence(referenceWitness).length;
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
    purchaseCount,
    holyCollected,
    route: replay,
    failures
  };
}
