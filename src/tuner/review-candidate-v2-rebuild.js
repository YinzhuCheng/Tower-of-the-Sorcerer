import { analyzeEventOrderJointBestResponse } from '../analyzer/event-order-joint-best-response.js';
import { screenNumericLevers } from './numeric-sensitivity-screen.js';
import { synthesizeBudgetedNumericCandidates } from './numeric-candidate-synthesis.js';
import {
  DISTRIBUTED_PRESSURE_LEVER_KEYS,
  evaluateEventOrderWitnessRayStep,
  findNumericRayCandidateByLeverKeys
} from './event-order-witness-ray.js';
import { REVIEW_CANDIDATES } from './review-candidates.js';

/**
 * Rebuild the V2 event-order reference witness entirely from repository code.
 * No CI artifact or VM-local 241-step constant is required.
 */
export function rebuildDistributedPressureV2Reference({
  maxPurchasePasses = 12,
  sourceRayStep = REVIEW_CANDIDATES.distributedPressureV2.sourceRayStep
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

  const sample = evaluateEventOrderWitnessRayStep({
    screenReport: screen,
    candidate: direction,
    relativeStep: sourceRayStep,
    seedWitness,
    maxPurchasePasses,
    targetMargin: 0.165
  });
  if (!sample.solvable || !sample.bestWitness || sample.localSearch?.localOptimal !== true) {
    throw new Error('V2 source ray step did not rebuild a replayable purchase-1opt witness.');
  }

  return {
    schemaVersion: 1,
    model: 'distributed-pressure-v2-reference-rebuild-v0.1',
    sourceRayStep,
    sourceDirectionId: direction.id,
    sourceLeverKeys: [...direction.leverKeys],
    sourceJointTerminalHp: joint.jointPurchaseResponse.bestTerminalHp,
    sourceJointWitnessHash: joint.jointPurchaseResponse.bestWitness.witnessHash,
    terminalHp: sample.finalHp,
    minNormalizedHpMargin: sample.margin,
    witnessHash: sample.bestWitness.witnessHash,
    localOptimal: sample.localSearch.localOptimal,
    edits: sample.edits,
    witness: sample.bestWitness,
    localSearch: sample.localSearch
  };
}
