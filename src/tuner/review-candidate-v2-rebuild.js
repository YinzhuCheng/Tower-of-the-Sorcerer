import { analyzeEventOrderJointBestResponse } from '../analyzer/event-order-joint-best-response.js';
import { screenNumericLevers } from './numeric-sensitivity-screen.js';
import { synthesizeBudgetedNumericCandidates } from './numeric-candidate-synthesis.js';
import {
  DISTRIBUTED_PRESSURE_LEVER_KEYS,
  findNumericRayCandidateByLeverKeys,
  searchEventOrderWitnessPressureRay
} from './event-order-witness-ray.js';
import { eventOrderWitnessPurchasePlan } from './review-candidate-reference.js';
import { REVIEW_CANDIDATES } from './review-candidates.js';

function sameStep(left, right, epsilon = 1e-12) {
  return Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) <= epsilon;
}

/**
 * Rebuild the V2 event-order reference witness entirely from repository code.
 *
 * Important: V2 was not discovered by jumping the V1 joint witness directly to
 * ray step 0.8375. The player adapted continuously through intermediate numeric
 * samples and each sample warm-started from the nearest previously legal witness.
 * A large direct jump can make the old 241-step route illegal even though a
 * continuation of locally adapted witnesses remains legal. Therefore that
 * continuation schedule is part of the reproducible player-response algorithm.
 *
 * The actual shop sequence used by the rebuilt witness is returned as first-class
 * evidence. Candidate validation must compare this sequence with the persisted
 * fixed-purchase policy before using the witness as a proof threshold.
 */
export function rebuildDistributedPressureV2Reference({
  maxPurchasePasses = 12,
  sourceRayStep = REVIEW_CANDIDATES.distributedPressureV2.sourceRayStep,
  continuationStartStep = REVIEW_CANDIDATES.distributedPressureV2.sourceContinuationStartStep
} = {}) {
  const v1 = REVIEW_CANDIDATES.distributedPressureV1;
  const joint = analyzeEventOrderJointBestResponse({
    candidate: v1,
    maxPurchasePasses,
    boundaryMaxExpanded: 8_000,
    boundaryMaxGenerated: 100_000,
    boundaryMaxGoals: 64,
    maxTransitionSeeds: 8,
    transitionMaxExpanded: 5_000,
    transitionMaxGenerated: 70_000,
    suffixMaxExpanded: 8_000,
    suffixMaxGenerated: 100_000
  });
  const seedWitness = joint.jointPurchaseResponse?.bestWitness ?? null;
  if (!seedWitness || joint.jointPurchaseResponse?.bestReplay?.ok !== true) {
    throw new Error('Could not rebuild the V1 joint event-order seed witness.');
  }

  const screen = screenNumericLevers({ staticTopK: 16, probeRelativeStep: 0.10 });
  const candidates = synthesizeBudgetedNumericCandidates({
    screenReport: screen,
    maxCandidates: 8,
    editBudget: 0.30,
    maxParameters: 3,
    sourcePoolSize: 12
  });
  const direction = findNumericRayCandidateByLeverKeys(candidates, DISTRIBUTED_PRESSURE_LEVER_KEYS);
  if (!direction) throw new Error('Distributed-pressure numeric direction is no longer available from the current screen.');

  const ray = searchEventOrderWitnessPressureRay({
    screenReport: screen,
    candidate: direction,
    seedWitness,
    referenceStep: continuationStartStep,
    targetMargin: 0.165,
    marginTolerance: 0.02,
    stepTolerance: 0.005,
    refineIterations: 6,
    maxPurchasePasses
  });
  const sample = ray.best;
  if (!sample?.solvable || !sample.bestWitness || sample.localSearch?.localOptimal !== true) {
    throw new Error('V2 witness-aware continuation did not rebuild a replayable purchase-1opt best sample.');
  }
  if (!sameStep(sample.relativeStep, sourceRayStep)) {
    throw new Error(`V2 candidate drift: rebuilt best ray step ${sample.relativeStep} != stored ${sourceRayStep}.`);
  }

  const purchasePlan = eventOrderWitnessPurchasePlan(sample.bestWitness);
  if (purchasePlan.some((optionId) => typeof optionId !== 'string')) {
    throw new Error('V2 rebuilt witness contains an invalid shop action.');
  }

  return {
    schemaVersion: 3,
    model: 'distributed-pressure-v2-reference-rebuild-v0.3-purchase-plan-evidence',
    continuationStartStep,
    sourceRayStep,
    sourceDirectionId: direction.id,
    sourceLeverKeys: [...direction.leverKeys],
    sourceJointTerminalHp: joint.jointPurchaseResponse.bestTerminalHp,
    sourceJointWitnessHash: joint.jointPurchaseResponse.bestWitness.witnessHash,
    terminalHp: sample.finalHp,
    minNormalizedHpMargin: sample.margin,
    witnessHash: sample.bestWitness.witnessHash,
    purchasePlan,
    purchaseCount: purchasePlan.length,
    localOptimal: sample.localSearch.localOptimal,
    edits: sample.edits,
    witness: sample.bestWitness,
    localSearch: sample.localSearch,
    continuation: {
      converged: ray.converged,
      bracket: ray.bracket,
      monotonicViolations: ray.monotonicViolations,
      samples: ray.samples.map((entry) => ({
        relativeStep: entry.relativeStep,
        solvable: entry.solvable,
        finalHp: entry.finalHp,
        margin: entry.margin,
        pressureStatus: entry.pressureStatus,
        witnessHash: entry.witnessHash,
        localOptimal: entry.localSearch?.localOptimal ?? null
      }))
    }
  };
}
