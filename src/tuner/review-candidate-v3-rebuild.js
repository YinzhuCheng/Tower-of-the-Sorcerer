import { eventOrderWitnessSemanticFingerprint } from '../analyzer/event-order-witness.js';
import { optimizeEventOrderWitnessPurchases } from '../analyzer/event-order-purchase-local-search.js';
import { createTowerAdapter } from '../solver/tower-adapter.js';
import { withBalanceEdits } from './balance-overlay.js';
import { eventOrderWitnessPurchasePlan } from './review-candidate-reference.js';
import { rebuildDistributedPressureV2Reference } from './review-candidate-v2-rebuild.js';
import { REVIEW_CANDIDATES } from './review-candidates.js';

/**
 * Deterministically rebuild the coupled V3 reference from the repository-owned
 * V2 semantic witness, then let the player re-optimize purchases under the V3
 * overlay. No persisted VM/CI artifact is required for reconstruction.
 */
export function rebuildDistributedPressureV3Reference({
  maxPurchasePasses = 12
} = {}) {
  const candidate = REVIEW_CANDIDATES.distributedPressureV3;
  const source = rebuildDistributedPressureV2Reference({ maxPurchasePasses });
  const local = withBalanceEdits(candidate.edits, () => {
    const adapter = createTowerAdapter();
    return optimizeEventOrderWitnessPurchases({
      witness: source.witness,
      adapter,
      maxPasses: maxPurchasePasses
    });
  });
  if (!local.bestReplay?.ok || !local.bestWitness) {
    throw new Error('V3 coupled reference did not rebuild a replayable witness.');
  }
  if (local.localOptimal !== true) {
    throw new Error(`V3 purchase local search did not close: ${local.stoppedReason}.`);
  }
  const purchasePlan = eventOrderWitnessPurchasePlan(local.bestWitness);
  if (purchasePlan.some((optionId) => typeof optionId !== 'string')) {
    throw new Error('V3 rebuilt witness contains an invalid shop action.');
  }
  const semanticFingerprint = local.bestWitness.semanticFingerprint
    ?? eventOrderWitnessSemanticFingerprint(local.bestWitness);

  return {
    schemaVersion: 1,
    model: 'distributed-pressure-v3-reference-rebuild-v0.1-coupled',
    sourceCandidateId: candidate.sourceCandidateId,
    sourceV2TerminalHp: source.terminalHp,
    sourceV2WitnessHash: source.witnessHash,
    sourceV2SemanticFingerprint: source.semanticFingerprint,
    terminalHp: local.bestTerminalHp,
    minNormalizedHpMargin: local.bestReplay.minNormalizedHpMargin,
    witnessHash: local.bestWitness.witnessHash,
    semanticFingerprint,
    purchasePlan,
    purchaseCount: purchasePlan.length,
    localOptimal: local.localOptimal,
    edits: candidate.edits.map((edit) => ({ ...edit })),
    witness: local.bestWitness,
    localSearch: local
  };
}
