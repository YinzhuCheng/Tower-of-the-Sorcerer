import { replayTowerStepSkeleton } from '../solver/replay.js';
import { hashValue } from '../solver/state.js';
import { eventOrderWitnessSemanticFingerprint } from './event-order-witness.js';

const SHOP_OPTIONS = Object.freeze(['atk', 'def', 'hp']);

function cloneWitness(witness) {
  return {
    ...witness,
    sourceCertificateHashes: [...(witness.sourceCertificateHashes ?? [])],
    steps: witness.steps.map((step) => ({
      ...step,
      location: Array.isArray(step.location) ? [...step.location] : null,
      path: [...(step.path ?? [])],
      action: step.action ? structuredClone(step.action) : null
    }))
  };
}

function shopEventIdWithOption(eventId, optionId) {
  const parts = String(eventId).split(':');
  if (parts.length === 0) return String(eventId);
  parts[parts.length - 1] = optionId;
  return parts.join(':');
}

export function mutateEventOrderWitnessShopChoice(witness, stepIndex, optionId) {
  if (!SHOP_OPTIONS.includes(optionId)) throw new Error(`Unknown shop option: ${optionId}`);
  if (!Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex >= witness.steps.length) {
    throw new Error('Invalid event-order witness step index.');
  }
  const result = cloneWitness(witness);
  const step = result.steps[stepIndex];
  if (step.kind !== 'shop') throw new Error(`Step ${stepIndex} is not a shop action.`);
  step.action = { ...step.action, optionId };
  step.eventId = shopEventIdWithOption(step.eventId, optionId);
  const payload = { ...result };
  delete payload.witnessHash;
  delete payload.semanticFingerprint;
  result.witnessHash = hashValue(payload);
  result.semanticFingerprint = eventOrderWitnessSemanticFingerprint(result);
  return result;
}

function shopStepIndices(witness) {
  const indices = [];
  for (let index = 0; index < witness.steps.length; index += 1) {
    if (witness.steps[index].kind === 'shop') indices.push(index);
  }
  return indices;
}

function replaySummary(replay) {
  return {
    ok: replay.ok,
    objective: replay.objective,
    minNormalizedHpMargin: replay.minNormalizedHpMargin,
    final: replay.final,
    failures: replay.failures,
    battles: replay.battleLog?.length ?? 0
  };
}

function betterReplay(candidate, current) {
  if (!candidate?.ok) return false;
  if (!current?.ok) return true;
  if (candidate.objective !== current.objective) return candidate.objective > current.objective;
  const a = Number.isFinite(candidate.minNormalizedHpMargin)
    ? candidate.minNormalizedHpMargin
    : Number.NEGATIVE_INFINITY;
  const b = Number.isFinite(current.minNormalizedHpMargin)
    ? current.minNormalizedHpMargin
    : Number.NEGATIVE_INFINITY;
  return a > b;
}

/**
 * Purchase 1-opt on a fixed, already replayable event-order skeleton.
 *
 * Every shop substitution has the same canonical price at that purchase index;
 * only the chosen stat effect changes. The full action skeleton is replayed from
 * the canonical initial state for each neighbor, so a mutation that makes a
 * later fight illegal is rejected by `engine.js` naturally.
 *
 * This is still local search: it changes one existing shop choice at a time and
 * does not insert/delete purchases or change event order. `localOptimal=true`
 * means only that none of those one-shop substitutions improves terminal HP.
 */
export function optimizeEventOrderWitnessPurchases({
  witness,
  adapter,
  maxPasses = 12
} = {}) {
  if (!witness?.steps?.length) throw new Error('Event-order purchase search requires a witness.');
  if (!adapter) throw new Error('Event-order purchase search requires an adapter.');
  if (!Number.isInteger(maxPasses) || maxPasses < 1) throw new Error('maxPasses must be positive.');

  let bestWitness = cloneWitness(witness);
  let bestReplay = replayTowerStepSkeleton(bestWitness.steps, { adapter });
  if (!bestReplay.ok) {
    return {
      schemaVersion: 1,
      model: 'event-order-purchase-local-1opt-v0.1',
      seedReplay: replaySummary(bestReplay),
      localOptimal: false,
      stoppedReason: 'seed_witness_not_replayable',
      improvementPasses: 0,
      evaluatedMutations: 0,
      seedTerminalHp: null,
      bestTerminalHp: null,
      totalImprovement: null,
      bestWitness,
      bestReplay: replaySummary(bestReplay),
      improvements: []
    };
  }

  const seedTerminalHp = bestReplay.objective;
  let evaluatedMutations = 0;
  let improvementPasses = 0;
  const improvements = [];
  let localOptimal = false;

  while (improvementPasses < maxPasses) {
    let bestNeighbor = null;
    let bestNeighborReplay = null;
    let bestMutation = null;

    for (const stepIndex of shopStepIndices(bestWitness)) {
      const currentOption = bestWitness.steps[stepIndex].action?.optionId;
      for (const optionId of SHOP_OPTIONS) {
        if (optionId === currentOption) continue;
        const candidateWitness = mutateEventOrderWitnessShopChoice(bestWitness, stepIndex, optionId);
        const candidateReplay = replayTowerStepSkeleton(candidateWitness.steps, { adapter });
        evaluatedMutations += 1;
        if (!betterReplay(candidateReplay, bestNeighborReplay)) continue;
        bestNeighbor = candidateWitness;
        bestNeighborReplay = candidateReplay;
        bestMutation = {
          stepIndex,
          purchaseIndex: shopStepIndices(bestWitness).indexOf(stepIndex),
          fromOptionId: currentOption,
          toOptionId: optionId,
          terminalHp: candidateReplay.ok ? candidateReplay.objective : null,
          minNormalizedHpMargin: candidateReplay.ok ? candidateReplay.minNormalizedHpMargin : null
        };
      }
    }

    if (!bestNeighborReplay?.ok || bestNeighborReplay.objective <= bestReplay.objective) {
      localOptimal = true;
      break;
    }

    improvements.push({
      pass: improvementPasses + 1,
      beforeTerminalHp: bestReplay.objective,
      afterTerminalHp: bestNeighborReplay.objective,
      deltaHp: bestNeighborReplay.objective - bestReplay.objective,
      mutation: bestMutation
    });
    bestWitness = bestNeighbor;
    bestReplay = bestNeighborReplay;
    improvementPasses += 1;
  }

  bestWitness.expectedTerminalHp = bestReplay.objective;
  const payload = { ...bestWitness };
  delete payload.witnessHash;
  delete payload.semanticFingerprint;
  bestWitness.witnessHash = hashValue(payload);
  bestWitness.semanticFingerprint = eventOrderWitnessSemanticFingerprint(bestWitness);

  return {
    schemaVersion: 1,
    model: 'event-order-purchase-local-1opt-v0.1',
    localOptimal,
    stoppedReason: localOptimal ? 'one_purchase_neighborhood_exhausted' : 'max_passes',
    shopSteps: shopStepIndices(bestWitness).length,
    improvementPasses,
    evaluatedMutations,
    seedTerminalHp,
    bestTerminalHp: bestReplay.objective,
    totalImprovement: bestReplay.objective - seedTerminalHp,
    bestWitness,
    bestReplay: replaySummary(bestReplay),
    improvements
  };
}
