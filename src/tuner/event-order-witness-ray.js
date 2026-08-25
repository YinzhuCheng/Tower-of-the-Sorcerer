import { optimizeEventOrderWitnessPurchases } from '../analyzer/event-order-purchase-local-search.js';
import { createTowerAdapter } from '../solver/tower-adapter.js';
import { withBalanceEdits } from './balance-overlay.js';
import { PRESSURE_TARGET_BAND } from './numeric-evaluator.js';
import { materializeCandidateRayEdits } from './numeric-ray-search.js';

export const DISTRIBUTED_PRESSURE_LEVER_KEYS = Object.freeze([
  'enemy:whaleSinger:magicPower',
  'shop:hp:effect.hp+effect.maxHp',
  'enemy:flameCaster:def'
]);

function sameSet(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
  const a = [...left].sort();
  const b = [...right].sort();
  return a.every((value, index) => value === b[index]);
}

export function findNumericRayCandidateByLeverKeys(candidates, leverKeys = DISTRIBUTED_PRESSURE_LEVER_KEYS) {
  if (!Array.isArray(candidates)) throw new Error('Numeric ray candidate list must be an array.');
  return candidates.find((candidate) => sameSet(candidate?.leverKeys, leverKeys)) ?? null;
}

export function classifyEventOrderWitnessRaySample(sample, targetMargin = 0.165) {
  if (!sample?.solvable || !Number.isFinite(sample.margin)) return 'too_hard_or_failed';
  if (sample.margin > targetMargin) return 'too_easy';
  if (sample.margin < targetMargin) return 'too_hard';
  return 'target';
}

function pressureStatus(margin) {
  if (!Number.isFinite(margin)) return 'unknown';
  if (margin < PRESSURE_TARGET_BAND[0]) return 'too_harsh';
  if (margin > PRESSURE_TARGET_BAND[1]) return 'too_forgiving';
  return 'target';
}

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

function compactLocal(local) {
  if (!local) return null;
  return {
    localOptimal: local.localOptimal,
    stoppedReason: local.stoppedReason,
    shopSteps: local.shopSteps,
    improvementPasses: local.improvementPasses,
    evaluatedMutations: local.evaluatedMutations,
    seedTerminalHp: local.seedTerminalHp,
    bestTerminalHp: local.bestTerminalHp,
    totalImprovement: local.totalImprovement,
    bestReplay: local.bestReplay,
    improvements: local.improvements
  };
}

/**
 * Evaluate one numeric-ray step against a replayable event-order player witness.
 * The player keeps the topology/action order but re-runs purchase 1-opt under the
 * new numeric overlay. Every neighbor is a full canonical engine replay.
 */
export function evaluateEventOrderWitnessRayStep({
  screenReport,
  candidate,
  relativeStep,
  seedWitness,
  maxPurchasePasses = 12,
  targetMargin = 0.165
} = {}) {
  if (!seedWitness?.steps?.length) throw new Error('Event-order witness ray requires a seed witness.');
  const materialized = materializeCandidateRayEdits({
    screenReport,
    candidate,
    relativeStep
  });

  return withBalanceEdits(materialized.edits, () => {
    const adapter = createTowerAdapter();
    const local = optimizeEventOrderWitnessPurchases({
      witness: seedWitness,
      adapter,
      maxPasses: maxPurchasePasses
    });
    const replay = local.bestReplay;
    const solvable = replay?.ok === true && Number.isFinite(local.bestTerminalHp);
    const margin = solvable ? replay.minNormalizedHpMargin : null;
    return {
      relativeStep,
      signature: materialized.signature,
      edits: materialized.edits,
      mutations: materialized.mutations,
      solvable,
      failure: solvable ? null : (replay?.failures?.[0]?.reason ?? local.stoppedReason ?? 'witness_failed'),
      margin,
      pressureStatus: pressureStatus(margin),
      targetDistance: Number.isFinite(margin)
        ? Math.abs(margin - targetMargin)
        : Number.POSITIVE_INFINITY,
      finalHp: solvable ? local.bestTerminalHp : null,
      witnessHash: local.bestWitness?.witnessHash ?? null,
      localSearch: compactLocal(local),
      bestWitness: solvable ? cloneWitness(local.bestWitness) : null
    };
  });
}

function sampleSummary(sample) {
  return {
    relativeStep: sample.relativeStep,
    signature: sample.signature,
    edits: sample.edits,
    solvable: sample.solvable,
    failure: sample.failure,
    margin: sample.margin,
    pressureStatus: sample.pressureStatus,
    targetDistance: sample.targetDistance,
    finalHp: sample.finalHp,
    witnessHash: sample.witnessHash,
    localSearch: sample.localSearch
  };
}

function bestSample(samples) {
  return samples
    .filter((sample) => sample.solvable && Number.isFinite(sample.targetDistance))
    .sort((a, b) => a.targetDistance - b.targetDistance || a.relativeStep - b.relativeStep)[0] ?? null;
}

function nearestWitness(samples, step, fallback) {
  return samples
    .filter((sample) => sample.solvable && sample.bestWitness)
    .sort((a, b) => Math.abs(a.relativeStep - step) - Math.abs(b.relativeStep - step))[0]
    ?.bestWitness ?? fallback;
}

function findCrossing(samples, targetMargin) {
  const ordered = [...samples]
    .filter((sample) => sample.relativeStep > 0)
    .sort((a, b) => a.relativeStep - b.relativeStep);
  for (let index = 1; index < ordered.length; index += 1) {
    const low = ordered[index - 1];
    const high = ordered[index];
    const lowClass = classifyEventOrderWitnessRaySample(low, targetMargin);
    const highClass = classifyEventOrderWitnessRaySample(high, targetMargin);
    if (lowClass === 'too_easy' && highClass !== 'too_easy') return { low, high };
  }
  return null;
}

function monotonicViolations(samples, epsilon = 1e-9) {
  const ordered = samples
    .filter((sample) => sample.solvable && Number.isFinite(sample.margin))
    .sort((a, b) => a.relativeStep - b.relativeStep);
  const violations = [];
  for (let index = 1; index < ordered.length; index += 1) {
    if (ordered[index].margin > ordered[index - 1].margin + epsilon) {
      violations.push({
        lowerStep: ordered[index - 1].relativeStep,
        lowerMargin: ordered[index - 1].margin,
        higherStep: ordered[index].relativeStep,
        higherMargin: ordered[index].margin
      });
    }
  }
  return violations;
}

/**
 * Retune the same numeric direction against the stronger event-order witness.
 *
 * This is a scale-search / player-response layer, not a proof of global player
 * optimality. It never assumes the best-response curve is monotone: a coarse
 * grid is always evaluated first, observed violations are reported, and binary
 * refinement is used only around an observed easy->hard crossing.
 */
export function searchEventOrderWitnessPressureRay({
  screenReport,
  candidate,
  seedWitness,
  referenceStep = 0.6453125,
  targetMargin = 0.165,
  marginTolerance = 0.02,
  stepTolerance = 0.005,
  coarseSteps = [0.6453125, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95, 0.975],
  refineIterations = 6,
  maxPurchasePasses = 12
} = {}) {
  if (!screenReport?.probes) throw new Error('Event-order witness ray requires a numeric screen report.');
  if (!candidate?.leverKeys?.length) throw new Error('Event-order witness ray requires a synthesized candidate.');
  if (!seedWitness?.steps?.length) throw new Error('Event-order witness ray requires a seed witness.');
  if (!Number.isFinite(referenceStep) || referenceStep <= 0 || referenceStep >= 1) {
    throw new Error('referenceStep must be inside (0, 1).');
  }

  const requestedSteps = [...new Set([referenceStep, ...coarseSteps])]
    .filter((step) => Number.isFinite(step) && step > 0 && step < 1)
    .sort((a, b) => a - b);
  const samples = [];
  const seenSignatures = new Set();

  function sample(step) {
    const warm = nearestWitness(samples, step, seedWitness);
    const result = evaluateEventOrderWitnessRayStep({
      screenReport,
      candidate,
      relativeStep: step,
      seedWitness: warm,
      maxPurchasePasses,
      targetMargin
    });
    if (!seenSignatures.has(result.signature)) {
      samples.push(result);
      seenSignatures.add(result.signature);
    }
    return result;
  }

  for (const step of requestedSteps) sample(step);

  let crossing = findCrossing(samples, targetMargin);
  let refinements = 0;
  while (crossing && refinements < refineIterations
      && crossing.high.relativeStep - crossing.low.relativeStep > stepTolerance) {
    const best = bestSample(samples);
    if (best && best.pressureStatus === 'target' && best.targetDistance <= marginTolerance) break;
    const step = (crossing.low.relativeStep + crossing.high.relativeStep) / 2;
    sample(step);
    crossing = findCrossing(samples, targetMargin);
    refinements += 1;
  }

  const best = bestSample(samples);
  const reference = samples.find((sample) => Math.abs(sample.relativeStep - referenceStep) < 1e-12) ?? null;
  const violations = monotonicViolations(samples);
  const finalCrossing = findCrossing(samples, targetMargin);
  const converged = Boolean(best && best.pressureStatus === 'target' && (
    best.targetDistance <= marginTolerance
    || (finalCrossing && finalCrossing.high.relativeStep - finalCrossing.low.relativeStep <= stepTolerance)
  ));

  return {
    schemaVersion: 1,
    model: 'event-order-witness-pressure-ray-v0.1',
    publishable: false,
    productionWriteAllowed: false,
    candidateId: candidate.id,
    leverKeys: [...candidate.leverKeys],
    referenceStep,
    targetMargin,
    targetBand: [...PRESSURE_TARGET_BAND],
    converged,
    refinements,
    bracket: finalCrossing ? {
      lowStep: finalCrossing.low.relativeStep,
      lowMargin: finalCrossing.low.margin,
      highStep: finalCrossing.high.relativeStep,
      highMargin: finalCrossing.high.margin,
      width: finalCrossing.high.relativeStep - finalCrossing.low.relativeStep
    } : null,
    reference: reference ? sampleSummary(reference) : null,
    samples: [...samples].sort((a, b) => a.relativeStep - b.relativeStep).map(sampleSummary),
    monotonicViolations: violations,
    best: best ? {
      ...sampleSummary(best),
      bestWitness: best.bestWitness
    } : null,
    interpretation: !best
      ? 'event_order_witness_family_has_no_replayable_sample_on_the_requested_ray'
      : converged
        ? 'stronger_event_order_purchase_response_has_been_retuned_into_the_pressure_target'
        : 'event_order_witness_ray_search_needs_more_scale_or_response_coverage'
  };
}
