import { eventOrderWitnessSemanticFingerprint } from '../analyzer/event-order-witness.js';
import { optimizeEventOrderWitnessPurchases } from '../analyzer/event-order-purchase-local-search.js';
import { createTowerAdapter } from '../solver/tower-adapter.js';
import { withBalanceEdits } from './balance-overlay.js';
import { eventOrderWitnessPurchasePlan } from './review-candidate-reference.js';
import { rebuildDistributedPressureV2Reference } from './review-candidate-v2-rebuild.js';
import { REVIEW_CANDIDATES } from './review-candidates.js';
import { mergeBalanceEditSets } from './v2-localized-repair-search.js';
import { cloneV2LocalRepairSeed } from './v2-local-repair-seed.js';

/**
 * Deterministically rebuild the coupled V3 reference through the same two-stage
 * continuation that discovered it:
 *
 *   V2 semantic witness
 *     -> apply the repository-pinned F5 forgiveness repair
 *     -> purchase 1-opt to obtain a replayable repaired continuation
 *     -> apply the complete V3 overlay (including late compensation)
 *     -> purchase 1-opt again.
 *
 * The intermediate repair stage is necessary. The original V2 purchase plan is
 * not guaranteed to remain replayable after a deliberately harder F6+ hazard,
 * while the repair-stage witness is exactly the warm start used by the coupled
 * compensation search. Rebuilding through this chain keeps the reference
 * repository-owned and deterministic without relying on an Actions artifact.
 */
export function rebuildDistributedPressureV3Reference({
  maxPurchasePasses = 12
} = {}) {
  const candidate = REVIEW_CANDIDATES.distributedPressureV3;
  const sourceCandidate = REVIEW_CANDIDATES.distributedPressureV2;
  const repairSeed = cloneV2LocalRepairSeed();
  const source = rebuildDistributedPressureV2Reference({ maxPurchasePasses });
  const repairEdits = mergeBalanceEditSets(sourceCandidate.edits, repairSeed.repairEdits);

  const repairLocal = withBalanceEdits(repairEdits, () => {
    const adapter = createTowerAdapter();
    return optimizeEventOrderWitnessPurchases({
      witness: source.witness,
      adapter,
      maxPasses: maxPurchasePasses
    });
  });
  if (!repairLocal.bestReplay?.ok || !repairLocal.bestWitness) {
    throw new Error('V3 rebuild could not reconstruct the replayable F5 repair continuation.');
  }
  if (repairLocal.localOptimal !== true) {
    throw new Error(`V3 repair-stage purchase search did not close: ${repairLocal.stoppedReason}.`);
  }

  const local = withBalanceEdits(candidate.edits, () => {
    const adapter = createTowerAdapter();
    return optimizeEventOrderWitnessPurchases({
      witness: repairLocal.bestWitness,
      adapter,
      maxPasses: maxPurchasePasses
    });
  });
  if (!local.bestReplay?.ok || !local.bestWitness) {
    throw new Error('V3 coupled reference did not rebuild a replayable compensated witness.');
  }
  if (local.localOptimal !== true) {
    throw new Error(`V3 compensated purchase local search did not close: ${local.stoppedReason}.`);
  }
  const purchasePlan = eventOrderWitnessPurchasePlan(local.bestWitness);
  if (purchasePlan.some((optionId) => typeof optionId !== 'string')) {
    throw new Error('V3 rebuilt witness contains an invalid shop action.');
  }
  const semanticFingerprint = local.bestWitness.semanticFingerprint
    ?? eventOrderWitnessSemanticFingerprint(local.bestWitness);

  return {
    schemaVersion: 2,
    model: 'distributed-pressure-v3-reference-rebuild-v0.2-two-stage-coupled',
    sourceCandidateId: candidate.sourceCandidateId,
    sourceV2TerminalHp: source.terminalHp,
    sourceV2WitnessHash: source.witnessHash,
    sourceV2SemanticFingerprint: source.semanticFingerprint,
    repairStage: {
      seedId: repairSeed.id,
      edits: repairSeed.repairEdits.map((edit) => ({ ...edit })),
      terminalHp: repairLocal.bestTerminalHp,
      minNormalizedHpMargin: repairLocal.bestReplay.minNormalizedHpMargin,
      witnessHash: repairLocal.bestWitness.witnessHash,
      semanticFingerprint: repairLocal.bestWitness.semanticFingerprint
        ?? eventOrderWitnessSemanticFingerprint(repairLocal.bestWitness),
      purchasePlan: eventOrderWitnessPurchasePlan(repairLocal.bestWitness),
      localOptimal: repairLocal.localOptimal
    },
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
