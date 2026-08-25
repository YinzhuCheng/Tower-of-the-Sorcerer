import { analyzeThresholdCoreTransitionChain } from './event-order-core-transition-chain.js';
import { optimizeEventOrderWitnessPurchases } from './event-order-purchase-local-search.js';
import { createTowerAdapter } from '../solver/tower-adapter.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';

/**
 * Joint local player response around a replay-proven event-order exploit.
 *
 * Phase A proves/generates an event-order step witness through the staged
 * threshold certificate chain. Phase B freezes that topology/action order and
 * performs purchase 1-opt by substituting each existing shop action with the two
 * alternative shop choices, replaying the full skeleton through engine.js.
 *
 * This does not claim a joint global optimum: event insertion/deletion and new
 * event-order changes are outside the local neighborhood.
 */
export function analyzeEventOrderJointBestResponse({
  candidate = REVIEW_CANDIDATES.distributedPressureV1,
  maxPurchasePasses = 12,
  ...chainOptions
} = {}) {
  const snapshot = cloneReviewCandidate(candidate);
  const chain = analyzeThresholdCoreTransitionChain({
    candidate: snapshot,
    ...chainOptions
  });
  const witness = chain.exploit?.witness ?? null;
  if (!witness || chain.exploit?.witnessReplay?.ok !== true) {
    return {
      schemaVersion: 1,
      model: 'event-order-joint-best-response-v0.1',
      candidateId: snapshot.id,
      productionWriteAllowed: false,
      chain,
      jointPurchaseResponse: null,
      bestKnownTerminalHp: chain.exploit?.terminalHp ?? snapshot.expectedEvidence?.terminalHp ?? null,
      interpretation: chain.exploitFound
        ? 'event_order_exploit_exists_but_numeric_agnostic_witness_is_not_replayable_for_joint_local_search'
        : 'event_order_exploit_witness_not_found_within_chain_budget'
    };
  }

  return withBalanceEdits(snapshot.edits, () => {
    const adapter = createTowerAdapter();
    const local = optimizeEventOrderWitnessPurchases({
      witness,
      adapter,
      maxPasses: maxPurchasePasses
    });
    const bestKnownTerminalHp = Math.max(
      chain.exploit?.terminalHp ?? Number.NEGATIVE_INFINITY,
      local.bestTerminalHp ?? Number.NEGATIVE_INFINITY
    );
    return {
      schemaVersion: 1,
      model: 'event-order-joint-best-response-v0.1',
      candidateId: snapshot.id,
      productionWriteAllowed: false,
      chain,
      jointPurchaseResponse: local,
      bestKnownTerminalHp: Number.isFinite(bestKnownTerminalHp) ? bestKnownTerminalHp : null,
      improvementOverReference: Number.isFinite(bestKnownTerminalHp)
        ? bestKnownTerminalHp - snapshot.expectedEvidence.terminalHp
        : null,
      interpretation: local.localOptimal
        ? 'event_order_exploit_purchase_choices_are_one_substitution_locally_optimal'
        : 'event_order_exploit_purchase_local_search_stopped_before_one_substitution_optimality'
    };
  });
}
