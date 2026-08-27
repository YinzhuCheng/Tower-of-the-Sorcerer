import { optimizeEventOrderWitnessPurchases } from '../analyzer/event-order-purchase-local-search.js';
import { analyzeEventOrderWitnessPurchaseRecovery } from '../analyzer/event-order-purchase-recovery.js';
import { analyzeEventOrderWitnessPurchaseCounterfactuals } from '../analyzer/event-order-witness-counterfactuals.js';
import { replayTowerStepSkeleton } from '../solver/replay.js';
import { createTowerAdapter } from '../solver/tower-adapter.js';
import {
  listNumericMutationParameters,
  materializeNumericMutation
} from './numeric-mutation-space.js';
import { withBalanceEdits } from './balance-overlay.js';
import { mergeBalanceEditSets } from './v2-localized-repair-search.js';
import { cloneV2LocalRepairSeed } from './v2-local-repair-seed.js';
import { rebuildDistributedPressureV2Reference } from './review-candidate-v2-rebuild.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from './review-candidates.js';
import { eventOrderWitnessPurchasePlan } from './review-candidate-reference.js';

function alignDown(value, step) {
  return Math.floor(value / step) * step;
}

function compactCounterfactuals(report) {
  return report ? {
    totalMutations: report.totalMutations,
    catastrophicMutations: report.catastrophicMutations,
    catastrophicRate: report.catastrophicRate,
    recoveryRate: report.recoveryRate,
    highRegretRate: report.highRegretRate,
    improvedMutationCount: report.improvedMutationCount,
    bestMutation: report.bestMutation
  } : null;
}

function compactRecovery(report) {
  return report ? {
    totalMutations: report.totalMutations,
    recoveredMutations: report.recoveredMutations,
    exactUnrecoverableMutations: report.exactUnrecoverableMutations,
    unknownMutations: report.unknownMutations,
    fixedEventOrderRecoveryRate: report.fixedEventOrderRecoveryRate,
    fixedEventOrderUnrecoverableRate: report.fixedEventOrderUnrecoverableRate,
    exactUnrecoverableExamples: report.exactUnrecoverableExamples
  } : null;
}

function pressureDistance(value, [low, high]) {
  if (!Number.isFinite(value)) return Number.POSITIVE_INFINITY;
  if (value < low) return low - value;
  if (value > high) return value - high;
  return 0;
}

function relativeEdit(originalValue, value) {
  return Math.abs(value - originalValue) / Math.max(1, Math.abs(originalValue));
}

export function listLatePressureCompensationParameters({
  minFloor = 6,
  parameters = listNumericMutationParameters()
} = {}) {
  if (!Number.isInteger(minFloor) || minFloor < 1) throw new Error('minFloor must be positive.');
  return parameters.filter((parameter) =>
    parameter.family === 'enemy'
    && parameter.role === 'hazard'
    && Number(parameter.floor) >= minFloor
    && parameter.fields.length === 1
    && ['hp', 'atk', 'def', 'magicPower'].includes(parameter.fields[0])
  );
}

/**
 * Search a single hazard field on a fixed replayable witness.
 *
 * Hardening a late enemy hazard is monotone for this fixed event skeleton:
 * increasing HP/ATK/DEF/magicPower cannot make a failed battle become legal.
 * We first locate the largest replayable value, then (inside that replayable
 * interval) locate the smallest hardening that brings the minimum battle margin
 * to or below the requested upper pressure target.
 */
export function findFixedWitnessCompensationBoundary({
  parameter,
  originalValue,
  maxValue,
  pressureUpper,
  evaluate
} = {}) {
  if (!parameter || !Number.isFinite(parameter.roundTo) || parameter.roundTo <= 0) {
    throw new Error('Compensation boundary requires a numeric parameter step.');
  }
  if (!Number.isFinite(originalValue) || !Number.isFinite(maxValue) || maxValue <= originalValue) {
    throw new Error('Compensation boundary requires maxValue > originalValue.');
  }
  if (!Number.isFinite(pressureUpper) || pressureUpper <= 0) throw new Error('pressureUpper must be positive.');
  if (typeof evaluate !== 'function') throw new Error('Compensation boundary requires an evaluator.');

  const step = parameter.roundTo;
  const maxIndex = Math.floor((maxValue - originalValue) / step);
  if (maxIndex < 1) return null;
  const atBase = evaluate(originalValue);
  if (!atBase?.replayOk) throw new Error('Compensation seed witness is not replayable at the original value.');

  // Largest replayable hardening index.
  let low = 0;
  let high = maxIndex;
  let maxReplayableIndex = 0;
  let maxReplayable = atBase;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const value = originalValue + mid * step;
    const result = evaluate(value);
    if (result?.replayOk) {
      maxReplayableIndex = mid;
      maxReplayable = result;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (maxReplayableIndex === 0 || !Number.isFinite(maxReplayable.minNormalizedHpMargin)) {
    return {
      targetReachable: false,
      maxReplayableValue: originalValue,
      maxReplayable,
      boundary: null
    };
  }
  if (maxReplayable.minNormalizedHpMargin > pressureUpper) {
    return {
      targetReachable: false,
      maxReplayableValue: originalValue + maxReplayableIndex * step,
      maxReplayable,
      boundary: null
    };
  }

  // Smallest hardening index that reaches the pressure upper bound. Every point
  // in [0,maxReplayableIndex] is replayable by the monotone legality argument.
  low = 1;
  high = maxReplayableIndex;
  let bestIndex = maxReplayableIndex;
  let best = maxReplayable;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const value = originalValue + mid * step;
    const result = evaluate(value);
    if (Number.isFinite(result?.minNormalizedHpMargin)
        && result.minNormalizedHpMargin <= pressureUpper) {
      bestIndex = mid;
      best = result;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return {
    targetReachable: true,
    maxReplayableValue: originalValue + maxReplayableIndex * step,
    maxReplayable,
    boundary: {
      value: originalValue + bestIndex * step,
      evaluation: best
    }
  };
}

function parameterOriginalValue(parameter) {
  return Number(parameter.baseline);
}

function buildCompensationFrontier({
  sourceCandidate,
  repairSeed,
  repairWitness,
  pressureBand,
  maxRelativeHardening,
  minCompensationFloor,
  maxParameters
}) {
  const parameters = listLatePressureCompensationParameters({ minFloor: minCompensationFloor });
  const reports = [];
  for (const parameter of parameters) {
    const originalValue = parameterOriginalValue(parameter);
    const maxByRelative = originalValue + Math.max(
      parameter.roundTo,
      Math.ceil(originalValue * maxRelativeHardening / parameter.roundTo) * parameter.roundTo
    );
    const maxValue = alignDown(Math.min(parameter.max, maxByRelative), parameter.roundTo);
    if (maxValue <= originalValue) continue;
    const cache = new Map();
    const evaluate = (value) => {
      if (!cache.has(value)) {
        const compensationEdits = materializeNumericMutation(parameter, value);
        const fullEdits = mergeBalanceEditSets(
          sourceCandidate.edits,
          [...repairSeed.repairEdits, ...compensationEdits]
        );
        cache.set(value, withBalanceEdits(fullEdits, () => {
          const adapter = createTowerAdapter();
          const replay = replayTowerStepSkeleton(repairWitness.steps, { adapter });
          return {
            replayOk: replay.ok,
            terminalHp: replay.objective,
            minNormalizedHpMargin: replay.minNormalizedHpMargin,
            failure: replay.failures?.[0] ?? null
          };
        }));
      }
      return cache.get(value);
    };
    const boundary = findFixedWitnessCompensationBoundary({
      parameter,
      originalValue,
      maxValue,
      pressureUpper: pressureBand[1],
      evaluate
    });
    const boundaryValue = boundary?.boundary?.value ?? null;
    const gainAtMax = Number.isFinite(boundary?.maxReplayable?.minNormalizedHpMargin)
      ? repairSeed.observedEvidence.minNormalizedHpMargin - boundary.maxReplayable.minNormalizedHpMargin
      : 0;
    reports.push({
      parameterKey: parameter.key,
      target: parameter.target,
      id: parameter.id,
      field: parameter.fields[0],
      floor: parameter.floor,
      boss: parameter.boss,
      special: parameter.special,
      originalValue,
      maxValue,
      targetReachable: boundary?.targetReachable === true,
      boundaryValue,
      boundaryReplay: boundary?.boundary?.evaluation ?? null,
      maxReplayableValue: boundary?.maxReplayableValue ?? originalValue,
      maxReplayable: boundary?.maxReplayable ?? null,
      relativeEdit: boundaryValue == null ? Number.POSITIVE_INFINITY : relativeEdit(originalValue, boundaryValue),
      pressureGainAtMax: gainAtMax,
      evaluatedValues: [...cache.keys()].sort((a, b) => a - b),
      parameter
    });
  }
  return reports.sort((a, b) => {
    if (a.targetReachable !== b.targetReachable) return a.targetReachable ? -1 : 1;
    if (a.relativeEdit !== b.relativeEdit) return a.relativeEdit - b.relativeEdit;
    if (a.pressureGainAtMax !== b.pressureGainAtMax) return b.pressureGainAtMax - a.pressureGainAtMax;
    return a.parameterKey.localeCompare(b.parameterKey);
  }).slice(0, Math.max(maxParameters, 1));
}

function evaluateCompensationCandidate({
  sourceCandidate,
  repairSeed,
  repairWitness,
  frontierEntry,
  pressureBand,
  targetCatastrophicCount,
  recoveryMaxActiveLabels,
  highRegretRelative,
  maxPurchasePasses
}) {
  if (!frontierEntry.targetReachable || frontierEntry.boundaryValue == null) return null;
  const compensationEdits = materializeNumericMutation(frontierEntry.parameter, frontierEntry.boundaryValue);
  const fullEdits = mergeBalanceEditSets(
    sourceCandidate.edits,
    [...repairSeed.repairEdits, ...compensationEdits]
  );
  return withBalanceEdits(fullEdits, () => {
    const adapter = createTowerAdapter();
    const local = optimizeEventOrderWitnessPurchases({
      witness: repairWitness,
      adapter,
      maxPasses: maxPurchasePasses
    });
    if (!local.bestReplay?.ok) {
      return {
        id: `${frontierEntry.parameterKey}@${frontierEntry.boundaryValue}`,
        compensationEdits,
        fullEdits,
        localOptimal: false,
        stoppedReason: local.stoppedReason,
        localGatePassed: false
      };
    }
    const counterfactuals = analyzeEventOrderWitnessPurchaseCounterfactuals({
      witness: local.bestWitness,
      adapter,
      highRegretRelative
    });
    const recovery = analyzeEventOrderWitnessPurchaseRecovery({
      witness: local.bestWitness,
      adapter,
      noRecourseReport: counterfactuals,
      maxActiveLabels: recoveryMaxActiveLabels
    });
    const margin = local.bestReplay.minNormalizedHpMargin;
    const pressureInBand = Number.isFinite(margin)
      && margin >= pressureBand[0]
      && margin <= pressureBand[1];
    const localGatePassed = Boolean(
      local.localOptimal
      && pressureInBand
      && counterfactuals.catastrophicMutations <= targetCatastrophicCount
      && counterfactuals.improvedMutationCount === 0
      && recovery.unknownMutations === 0
    );
    return {
      id: `${frontierEntry.parameterKey}@${frontierEntry.boundaryValue}`,
      parameterKey: frontierEntry.parameterKey,
      compensationEdits,
      fullEdits,
      compensationRelativeEdit: frontierEntry.relativeEdit,
      seedBoundaryReplay: frontierEntry.boundaryReplay,
      localOptimal: local.localOptimal,
      stoppedReason: local.stoppedReason,
      improvementPasses: local.improvementPasses,
      evaluatedMutations: local.evaluatedMutations,
      terminalHp: local.bestTerminalHp,
      minNormalizedHpMargin: margin,
      pressureInBand,
      purchasePlan: eventOrderWitnessPurchasePlan(local.bestWitness),
      witnessHash: local.bestWitness.witnessHash,
      semanticFingerprint: local.bestWitness.semanticFingerprint,
      counterfactuals: compactCounterfactuals(counterfactuals),
      recovery: compactRecovery(recovery),
      localGatePassed,
      witness: local.bestWitness
    };
  });
}

function rankCandidates(candidates, { pressureBand, targetCatastrophicCount }) {
  return [...candidates].sort((a, b) => {
    const aPass = a.localGatePassed ? 0 : 1;
    const bPass = b.localGatePassed ? 0 : 1;
    if (aPass !== bPass) return aPass - bPass;
    const aCat = a.counterfactuals?.catastrophicMutations ?? Number.POSITIVE_INFINITY;
    const bCat = b.counterfactuals?.catastrophicMutations ?? Number.POSITIVE_INFINITY;
    const aCatMiss = Math.max(0, aCat - targetCatastrophicCount);
    const bCatMiss = Math.max(0, bCat - targetCatastrophicCount);
    if (aCatMiss !== bCatMiss) return aCatMiss - bCatMiss;
    const aPressure = pressureDistance(a.minNormalizedHpMargin, pressureBand);
    const bPressure = pressureDistance(b.minNormalizedHpMargin, pressureBand);
    if (aPressure !== bPressure) return aPressure - bPressure;
    if (a.compensationRelativeEdit !== b.compensationRelativeEdit) {
      return a.compensationRelativeEdit - b.compensationRelativeEdit;
    }
    return a.id.localeCompare(b.id);
  });
}

/**
 * Couple the repository-selected F5 forgiveness seed with a strictly-late enemy
 * pressure compensation field. This remains a local player-response search, not
 * a review/promotion proof.
 */
export function searchV2CoupledRepairCompensation({
  maxPurchasePasses = 12,
  recoveryMaxActiveLabels = 50_000,
  highRegretRelative = 0.20,
  minCompensationFloor = 6,
  maxRelativeHardening = 1.50,
  maxFrontierParameters = 18,
  refineTopK = 8,
  targetCatastrophicCount = 4
} = {}) {
  if (!Number.isInteger(minCompensationFloor) || minCompensationFloor < 6) {
    throw new Error('Compensation must begin at floor 6 or later for the current F5 failure-core split.');
  }
  if (!Number.isFinite(maxRelativeHardening) || maxRelativeHardening <= 0) {
    throw new Error('maxRelativeHardening must be positive.');
  }
  if (!Number.isInteger(maxFrontierParameters) || maxFrontierParameters < 1) {
    throw new Error('maxFrontierParameters must be positive.');
  }
  if (!Number.isInteger(refineTopK) || refineTopK < 1) throw new Error('refineTopK must be positive.');

  const sourceCandidate = cloneReviewCandidate(REVIEW_CANDIDATES.distributedPressureV2);
  const repairSeed = cloneV2LocalRepairSeed();
  const pressureBand = [...sourceCandidate.expectedEvidence.pressureTarget];
  const rebuilt = rebuildDistributedPressureV2Reference({ maxPurchasePasses });
  const repairFullEdits = mergeBalanceEditSets(sourceCandidate.edits, repairSeed.repairEdits);
  const repairLocal = withBalanceEdits(repairFullEdits, () => {
    const adapter = createTowerAdapter();
    return optimizeEventOrderWitnessPurchases({
      witness: rebuilt.witness,
      adapter,
      maxPasses: maxPurchasePasses
    });
  });
  if (!repairLocal.bestReplay?.ok || !repairLocal.bestWitness) {
    throw new Error('Could not reconstruct the repository-selected localized repair witness.');
  }
  const repairWitness = repairLocal.bestWitness;
  const repairObserved = {
    terminalHp: repairLocal.bestTerminalHp,
    minNormalizedHpMargin: repairLocal.bestReplay.minNormalizedHpMargin,
    localOptimal: repairLocal.localOptimal,
    witnessHash: repairWitness.witnessHash,
    semanticFingerprint: repairWitness.semanticFingerprint,
    purchasePlan: eventOrderWitnessPurchasePlan(repairWitness)
  };

  const frontier = buildCompensationFrontier({
    sourceCandidate,
    repairSeed: {
      ...repairSeed,
      observedEvidence: {
        ...repairSeed.observedEvidence,
        minNormalizedHpMargin: repairObserved.minNormalizedHpMargin
      }
    },
    repairWitness,
    pressureBand,
    maxRelativeHardening,
    minCompensationFloor,
    maxParameters: maxFrontierParameters
  });
  const targetable = frontier.filter((entry) => entry.targetReachable).slice(0, refineTopK);
  const evaluations = targetable
    .map((entry) => evaluateCompensationCandidate({
      sourceCandidate,
      repairSeed,
      repairWitness,
      frontierEntry: entry,
      pressureBand,
      targetCatastrophicCount,
      recoveryMaxActiveLabels,
      highRegretRelative,
      maxPurchasePasses
    }))
    .filter(Boolean);
  const ranked = rankCandidates(evaluations, { pressureBand, targetCatastrophicCount });
  const selected = ranked[0] ?? null;

  return {
    schemaVersion: 1,
    model: 'v2-coupled-forgiveness-pressure-compensation-v0.1',
    confidence: 'authoritative-fixed-event-order-coupled-local-screen',
    productionWriteAllowed: false,
    publishable: false,
    sourceCandidateId: sourceCandidate.id,
    repairSeed: {
      id: repairSeed.id,
      repairEdits: repairSeed.repairEdits,
      reconstructed: repairObserved
    },
    configuration: {
      pressureBand,
      targetCatastrophicCount,
      minCompensationFloor,
      maxRelativeHardening,
      maxFrontierParameters,
      refineTopK
    },
    compensationFrontier: frontier.map(({ parameter, ...entry }) => entry),
    candidates: ranked.map((candidate) => ({ ...candidate, witness: undefined })),
    selected: selected ? {
      ...selected,
      witness: selected.witness,
      productionWriteAllowed: false,
      interpretation: selected.localGatePassed
        ? 'coupled_local_seed_clears_fixed-event-order_pressure_and_robustness_gate_but_requires_global_v3_validation'
        : 'best_single-late-hazard_compensation_remains_blocked_before_global_v3_validation'
    } : null,
    interpretation: selected?.localGatePassed
      ? 'coupled_forgiveness_and_late_pressure_search_found_a_dry-run_v3_seed'
      : 'no_single_late_hazard_compensation_cleared_the_coupled_local_gate'
  };
}
