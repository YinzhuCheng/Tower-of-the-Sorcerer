import { ENEMIES } from '../game/data.js';
import { optimizeEventOrderWitnessPurchases } from '../analyzer/event-order-purchase-local-search.js';
import { analyzeEventOrderWitnessPurchaseRecovery, solveFixedEventOrderPurchaseRecovery } from '../analyzer/event-order-purchase-recovery.js';
import { analyzeEventOrderWitnessPurchaseCounterfactuals } from '../analyzer/event-order-witness-counterfactuals.js';
import { replayTowerStepSkeleton } from '../solver/replay.js';
import { hashValue } from '../solver/state.js';
import { createTowerAdapter } from '../solver/tower-adapter.js';
import { readBalanceValue, withBalanceEdits } from './balance-overlay.js';
import { rebuildDistributedPressureV2Reference } from './review-candidate-v2-rebuild.js';
import { eventOrderWitnessPurchasePlan } from './review-candidate-reference.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from './review-candidates.js';

function editKey(edit) {
  return `${edit.target}:${edit.id}:${edit.field}`;
}

export function mergeBalanceEditSets(baseEdits = [], overrideEdits = []) {
  const merged = new Map();
  for (const edit of [...baseEdits, ...overrideEdits]) {
    if (!edit || typeof edit !== 'object') throw new Error('Balance edit must be an object.');
    merged.set(editKey(edit), {
      target: edit.target,
      id: edit.id,
      field: edit.field,
      value: Number(edit.value)
    });
  }
  return [...merged.values()].sort((a, b) => editKey(a).localeCompare(editKey(b)));
}

export function effectiveCandidateBalanceValue(candidate, { target, id, field }) {
  const key = `${target}:${id}:${field}`;
  const existing = [...(candidate?.edits ?? [])].reverse().find((edit) => editKey(edit) === key);
  if (existing) return Number(existing.value);
  return Number(readBalanceValue({ target, id, field, value: 0 }));
}

export function failureCoreEnemyId(failureCore) {
  const eventId = String(failureCore?.eventId ?? '');
  const match = /^f\d+:enemy:([^#]+)#\d+$/.exec(eventId);
  return match?.[1] ?? null;
}

export function clusterExactRecoveryFailures(recoveryReport) {
  const clusters = new Map();
  for (const entry of recoveryReport?.results ?? []) {
    if (!entry?.exact || entry.recoverable || !entry.failureCore) continue;
    const enemyId = failureCoreEnemyId(entry.failureCore);
    if (!enemyId) continue;
    const key = `${enemyId}:${entry.failureCore.eventId}`;
    const cluster = clusters.get(key) ?? {
      key,
      enemyId,
      eventId: entry.failureCore.eventId,
      stepIndex: entry.failureCore.stepIndex,
      stepKind: entry.failureCore.stepKind,
      entries: []
    };
    cluster.entries.push(entry);
    clusters.set(key, cluster);
  }
  return [...clusters.values()]
    .map((cluster) => ({
      ...cluster,
      entries: [...cluster.entries].sort((a, b) => a.purchaseIndex - b.purchaseIndex
        || String(a.forcedOptionId).localeCompare(String(b.forcedOptionId)))
    }))
    .sort((a, b) => a.stepIndex - b.stepIndex || a.key.localeCompare(b.key));
}

export function inferEnemyRepairFields(enemyId) {
  const enemy = ENEMIES[enemyId];
  if (!enemy) throw new Error(`Unknown failure-core enemy: ${enemyId}`);
  if (enemy.special === 'magic' && Number.isFinite(enemy.magicPower)) {
    return ['magicPower', 'def', 'hp'];
  }
  return ['atk', 'def', 'hp'];
}

function minimumEnemyFieldValue(field) {
  if (field === 'hp' || field === 'atk') return 1;
  return 0;
}

/**
 * Given a monotone softening evaluator, find the highest (least softened)
 * integer value that reaches the requested rescue count.
 */
export function findLeastSofteningBoundary({
  originalValue,
  lowerBound,
  targetRescues,
  evaluate
} = {}) {
  if (!Number.isInteger(originalValue) || !Number.isInteger(lowerBound) || lowerBound >= originalValue) {
    throw new Error('Softening boundary requires integer lowerBound < originalValue.');
  }
  if (!Number.isInteger(targetRescues) || targetRescues < 1) throw new Error('targetRescues must be positive.');
  if (typeof evaluate !== 'function') throw new Error('Softening boundary requires an evaluator.');

  const atLower = evaluate(lowerBound);
  if ((atLower?.rescuedCount ?? 0) < targetRescues) return null;

  let low = lowerBound;
  let high = originalValue - 1;
  let bestValue = lowerBound;
  let bestEvaluation = atLower;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const result = evaluate(mid);
    if ((result?.rescuedCount ?? 0) >= targetRescues) {
      bestValue = mid;
      bestEvaluation = result;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return { value: bestValue, evaluation: bestEvaluation };
}

function compactRecoveryCase(result, source) {
  return {
    purchaseIndex: source.purchaseIndex,
    purchaseNumber: source.purchaseNumber,
    baselineOption: source.baselineOption,
    forcedOptionId: source.forcedOptionId,
    exact: result.exact,
    recoverable: result.recoverable,
    terminalHp: result.terminalHp,
    stoppedReason: result.stoppedReason,
    failureCore: result.failureCore ?? null
  };
}

function compactCounterfactuals(report) {
  if (!report) return null;
  return {
    baselineTerminalHp: report.baselineTerminalHp,
    baselineMinNormalizedHpMargin: report.baselineMinNormalizedHpMargin,
    totalMutations: report.totalMutations,
    solvableMutations: report.solvableMutations,
    catastrophicMutations: report.catastrophicMutations,
    recoveryRate: report.recoveryRate,
    catastrophicRate: report.catastrophicRate,
    highRegretRate: report.highRegretRate,
    improvedMutationCount: report.improvedMutationCount,
    bestMutation: report.bestMutation
  };
}

function compactRecovery(report) {
  if (!report) return null;
  return {
    totalMutations: report.totalMutations,
    recoveredMutations: report.recoveredMutations,
    exactUnrecoverableMutations: report.exactUnrecoverableMutations,
    unknownMutations: report.unknownMutations,
    fixedEventOrderRecoveryRate: report.fixedEventOrderRecoveryRate,
    fixedEventOrderUnrecoverableRate: report.fixedEventOrderUnrecoverableRate,
    exactUnrecoverableExamples: report.exactUnrecoverableExamples
  };
}

function pressureDistance(value, [low, high]) {
  if (!Number.isFinite(value)) return Number.POSITIVE_INFINITY;
  if (value < low) return low - value;
  if (value > high) return value - high;
  const center = (low + high) / 2;
  return Math.abs(value - center) * 0.05;
}

function repairRelativeEdit(edit, baselineValue) {
  return Math.abs(Number(baselineValue) - Number(edit.value)) / Math.max(1, Math.abs(Number(baselineValue)));
}

function evaluateClusterRepair({
  candidate,
  witness,
  cluster,
  field,
  value,
  recoveryMaxActiveLabels
}) {
  const repairEdit = { target: 'enemy', id: cluster.enemyId, field, value };
  const fullEdits = mergeBalanceEditSets(candidate.edits, [repairEdit]);
  return withBalanceEdits(fullEdits, () => {
    const adapter = createTowerAdapter();
    const cases = cluster.entries.map((source) => {
      const result = solveFixedEventOrderPurchaseRecovery({
        witness,
        adapter,
        forcedPurchaseIndex: source.purchaseIndex,
        forcedOptionId: source.forcedOptionId,
        maxActiveLabels: recoveryMaxActiveLabels
      });
      return compactRecoveryCase(result, source);
    });
    return {
      rescuedCount: cases.filter((entry) => entry.exact && entry.recoverable).length,
      unknownCount: cases.filter((entry) => !entry.exact).length,
      cases
    };
  });
}

function buildClusterFrontier({
  candidate,
  witness,
  cluster,
  maxRelativeSoftening,
  recoveryMaxActiveLabels
}) {
  const fields = inferEnemyRepairFields(cluster.enemyId);
  const fieldReports = [];

  for (const field of fields) {
    const originalValue = effectiveCandidateBalanceValue(candidate, {
      target: 'enemy', id: cluster.enemyId, field
    });
    if (!Number.isInteger(originalValue) || originalValue <= 0) continue;
    const absoluteBudget = Math.max(1, Math.ceil(originalValue * maxRelativeSoftening));
    const lowerBound = Math.max(minimumEnemyFieldValue(field), originalValue - absoluteBudget);
    if (lowerBound >= originalValue) continue;
    const cache = new Map();
    const evaluate = (value) => {
      if (!cache.has(value)) {
        cache.set(value, evaluateClusterRepair({
          candidate,
          witness,
          cluster,
          field,
          value,
          recoveryMaxActiveLabels
        }));
      }
      return cache.get(value);
    };

    const thresholds = [];
    for (let targetRescues = 1; targetRescues <= cluster.entries.length; targetRescues += 1) {
      const boundary = findLeastSofteningBoundary({
        originalValue,
        lowerBound,
        targetRescues,
        evaluate
      });
      if (!boundary) continue;
      const edit = { target: 'enemy', id: cluster.enemyId, field, value: boundary.value };
      thresholds.push({
        targetRescues,
        rescuedCount: boundary.evaluation.rescuedCount,
        unknownCount: boundary.evaluation.unknownCount,
        edit,
        originalValue,
        delta: boundary.value - originalValue,
        relativeEdit: repairRelativeEdit(edit, originalValue),
        cases: boundary.evaluation.cases
      });
    }
    fieldReports.push({
      field,
      originalValue,
      lowerBound,
      thresholds,
      evaluatedValues: [...cache.keys()].sort((a, b) => b - a)
    });
  }

  return {
    cluster: {
      key: cluster.key,
      enemyId: cluster.enemyId,
      eventId: cluster.eventId,
      stepIndex: cluster.stepIndex,
      size: cluster.entries.length,
      forcedMutations: cluster.entries.map((entry) => ({
        purchaseNumber: entry.purchaseNumber,
        baselineOption: entry.baselineOption,
        forcedOptionId: entry.forcedOptionId
      }))
    },
    fields: fieldReports
  };
}

function clusterRepairOptions(frontier) {
  const options = [];
  for (const fieldReport of frontier.fields) {
    for (const threshold of fieldReport.thresholds) {
      if (threshold.unknownCount !== 0) continue;
      options.push({
        clusterKey: frontier.cluster.key,
        enemyId: frontier.cluster.enemyId,
        field: fieldReport.field,
        targetRescues: threshold.targetRescues,
        rescuedCount: threshold.rescuedCount,
        edit: threshold.edit,
        originalValue: threshold.originalValue,
        relativeEdit: threshold.relativeEdit
      });
    }
  }
  return options.sort((a, b) => a.relativeEdit - b.relativeEdit
    || b.rescuedCount - a.rescuedCount
    || `${a.enemyId}:${a.field}`.localeCompare(`${b.enemyId}:${b.field}`));
}

function cartesianRepairOptions(optionGroups, index = 0, prefix = [], output = []) {
  if (index >= optionGroups.length) {
    output.push(prefix);
    return output;
  }
  for (const option of optionGroups[index]) {
    cartesianRepairOptions(optionGroups, index + 1, [...prefix, option], output);
  }
  return output;
}

function synthesizeRepairCombinations(frontiers, {
  minimumRescuesPerCluster,
  minimumTotalRescues,
  maxCandidateCombinations
}) {
  const groups = frontiers.map((frontier) => clusterRepairOptions(frontier)
    .filter((option) => option.rescuedCount >= minimumRescuesPerCluster));
  if (groups.some((group) => group.length === 0)) return [];
  const combinations = cartesianRepairOptions(groups)
    .map((options) => {
      const repairEdits = mergeBalanceEditSets([], options.map((option) => option.edit));
      const predictedRescues = options.reduce((sum, option) => sum + option.rescuedCount, 0);
      const relativeEdit = options.reduce((sum, option) => sum + option.relativeEdit, 0);
      return {
        id: `localized-repair-${hashValue(repairEdits).slice(0, 12)}`,
        options,
        repairEdits,
        predictedRescues,
        relativeEdit
      };
    })
    .filter((candidate) => candidate.predictedRescues >= minimumTotalRescues)
    .sort((a, b) => a.relativeEdit - b.relativeEdit
      || b.predictedRescues - a.predictedRescues
      || a.id.localeCompare(b.id));

  const deduped = [];
  const seen = new Set();
  for (const candidate of combinations) {
    const key = JSON.stringify(candidate.repairEdits);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(candidate);
    if (deduped.length >= maxCandidateCombinations) break;
  }
  return deduped;
}

function evaluateCoarseCandidate({
  sourceCandidate,
  witness,
  repairCandidate,
  recoveryMaxActiveLabels,
  highRegretRelative
}) {
  const fullEdits = mergeBalanceEditSets(sourceCandidate.edits, repairCandidate.repairEdits);
  return withBalanceEdits(fullEdits, () => {
    const adapter = createTowerAdapter();
    const replay = replayTowerStepSkeleton(witness.steps, { adapter });
    if (!replay.ok) {
      return {
        ...repairCandidate,
        fullEdits,
        seedReplayOk: false,
        seedFailure: replay.failures?.[0] ?? null,
        counterfactuals: null,
        recovery: null,
        coarsePassed: false
      };
    }
    const counterfactuals = analyzeEventOrderWitnessPurchaseCounterfactuals({
      witness,
      adapter,
      highRegretRelative
    });
    const recovery = analyzeEventOrderWitnessPurchaseRecovery({
      witness,
      adapter,
      noRecourseReport: counterfactuals,
      maxActiveLabels: recoveryMaxActiveLabels
    });
    return {
      ...repairCandidate,
      fullEdits,
      seedReplayOk: true,
      seedTerminalHp: replay.objective,
      seedMinNormalizedHpMargin: replay.minNormalizedHpMargin,
      counterfactuals: compactCounterfactuals(counterfactuals),
      recovery: compactRecovery(recovery),
      coarsePassed: recovery.unknownMutations === 0
    };
  });
}

function refineCandidate({
  sourceCandidate,
  witness,
  coarse,
  maxPurchasePasses,
  recoveryMaxActiveLabels,
  highRegretRelative,
  targetCatastrophicCount,
  pressureBand
}) {
  return withBalanceEdits(coarse.fullEdits, () => {
    const adapter = createTowerAdapter();
    const local = optimizeEventOrderWitnessPurchases({
      witness,
      adapter,
      maxPasses: maxPurchasePasses
    });
    if (!local.bestReplay?.ok) {
      return {
        ...coarse,
        refinement: {
          localOptimal: false,
          stoppedReason: local.stoppedReason,
          seedReplay: local.seedReplay,
          localGatePassed: false
        }
      };
    }
    const bestWitness = local.bestWitness;
    const counterfactuals = analyzeEventOrderWitnessPurchaseCounterfactuals({
      witness: bestWitness,
      adapter,
      highRegretRelative
    });
    const recovery = analyzeEventOrderWitnessPurchaseRecovery({
      witness: bestWitness,
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
      ...coarse,
      refinement: {
        localOptimal: local.localOptimal,
        stoppedReason: local.stoppedReason,
        improvementPasses: local.improvementPasses,
        evaluatedMutations: local.evaluatedMutations,
        seedTerminalHp: local.seedTerminalHp,
        bestTerminalHp: local.bestTerminalHp,
        totalImprovement: local.totalImprovement,
        minNormalizedHpMargin: margin,
        pressureInBand,
        counterfactuals: compactCounterfactuals(counterfactuals),
        recovery: compactRecovery(recovery),
        witnessHash: bestWitness.witnessHash,
        semanticFingerprint: bestWitness.semanticFingerprint,
        purchasePlan: eventOrderWitnessPurchasePlan(bestWitness),
        localGatePassed,
        witness: bestWitness
      }
    };
  });
}

function rankCoarseCandidates(candidates, { targetCatastrophicCount, pressureBand }) {
  return [...candidates].sort((a, b) => {
    const aCat = a.counterfactuals?.catastrophicMutations ?? Number.POSITIVE_INFINITY;
    const bCat = b.counterfactuals?.catastrophicMutations ?? Number.POSITIVE_INFINITY;
    const aTargetMiss = Math.max(0, aCat - targetCatastrophicCount);
    const bTargetMiss = Math.max(0, bCat - targetCatastrophicCount);
    if (aTargetMiss !== bTargetMiss) return aTargetMiss - bTargetMiss;
    const aPressure = pressureDistance(a.seedMinNormalizedHpMargin, pressureBand);
    const bPressure = pressureDistance(b.seedMinNormalizedHpMargin, pressureBand);
    if (aPressure !== bPressure) return aPressure - bPressure;
    if (a.relativeEdit !== b.relativeEdit) return a.relativeEdit - b.relativeEdit;
    return a.id.localeCompare(b.id);
  });
}

function rankRefinedCandidates(candidates, { targetCatastrophicCount, pressureBand }) {
  return [...candidates].sort((a, b) => {
    const aPass = a.refinement?.localGatePassed === true ? 0 : 1;
    const bPass = b.refinement?.localGatePassed === true ? 0 : 1;
    if (aPass !== bPass) return aPass - bPass;
    const aCat = a.refinement?.counterfactuals?.catastrophicMutations ?? Number.POSITIVE_INFINITY;
    const bCat = b.refinement?.counterfactuals?.catastrophicMutations ?? Number.POSITIVE_INFINITY;
    const aTargetMiss = Math.max(0, aCat - targetCatastrophicCount);
    const bTargetMiss = Math.max(0, bCat - targetCatastrophicCount);
    if (aTargetMiss !== bTargetMiss) return aTargetMiss - bTargetMiss;
    const aPressure = pressureDistance(a.refinement?.minNormalizedHpMargin, pressureBand);
    const bPressure = pressureDistance(b.refinement?.minNormalizedHpMargin, pressureBand);
    if (aPressure !== bPressure) return aPressure - bPressure;
    if (a.relativeEdit !== b.relativeEdit) return a.relativeEdit - b.relativeEdit;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Failure-core-guided V2 repair search.
 *
 * This is a candidate generator, not a promotion proof. Every finite-difference
 * transition and purchase recovery is authoritative, but event order remains the
 * V2 semantic skeleton (plus purchase 1-opt for final local refinement).
 */
export function searchV2LocalizedRepairs({
  maxPurchasePasses = 12,
  recoveryMaxActiveLabels = 50_000,
  highRegretRelative = 0.20,
  maxRelativeSoftening = 0.50,
  minimumRescuesPerCluster = 1,
  minimumTotalRescues = 2,
  targetCatastrophicCount = 4,
  maxCandidateCombinations = 12,
  refineTopK = 4
} = {}) {
  if (!Number.isFinite(maxRelativeSoftening) || maxRelativeSoftening <= 0 || maxRelativeSoftening > 0.90) {
    throw new Error('maxRelativeSoftening must be in (0, 0.90].');
  }
  for (const [name, value] of Object.entries({
    minimumRescuesPerCluster,
    minimumTotalRescues,
    targetCatastrophicCount,
    maxCandidateCombinations,
    refineTopK
  })) {
    if (!Number.isInteger(value) || value < 1) throw new Error(`${name} must be a positive integer.`);
  }

  const sourceCandidate = cloneReviewCandidate(REVIEW_CANDIDATES.distributedPressureV2);
  const rebuilt = rebuildDistributedPressureV2Reference({ maxPurchasePasses });
  const witness = rebuilt.witness;
  const pressureBand = [...(sourceCandidate.expectedEvidence.pressureTarget ?? [0.08, 0.25])];

  const baseline = withBalanceEdits(sourceCandidate.edits, () => {
    const adapter = createTowerAdapter();
    const replay = replayTowerStepSkeleton(witness.steps, { adapter });
    if (!replay.ok) throw new Error(`V2 repair seed witness is not replayable: ${replay.failures?.[0]?.reason ?? 'unknown'}`);
    const counterfactuals = analyzeEventOrderWitnessPurchaseCounterfactuals({
      witness,
      adapter,
      highRegretRelative
    });
    const recovery = analyzeEventOrderWitnessPurchaseRecovery({
      witness,
      adapter,
      noRecourseReport: counterfactuals,
      maxActiveLabels: recoveryMaxActiveLabels
    });
    return {
      replay: {
        terminalHp: replay.objective,
        minNormalizedHpMargin: replay.minNormalizedHpMargin
      },
      counterfactuals,
      recovery
    };
  });

  const clusters = clusterExactRecoveryFailures(baseline.recovery);
  if (clusters.length === 0) throw new Error('V2 localized repair search found no exact failure-core clusters.');
  const frontiers = clusters.map((cluster) => buildClusterFrontier({
    candidate: sourceCandidate,
    witness,
    cluster,
    maxRelativeSoftening,
    recoveryMaxActiveLabels
  }));
  const combinations = synthesizeRepairCombinations(frontiers, {
    minimumRescuesPerCluster,
    minimumTotalRescues,
    maxCandidateCombinations
  });
  if (combinations.length === 0) throw new Error('No localized repair combination met the requested rescue coverage.');

  const coarseEvaluations = combinations.map((repairCandidate) => evaluateCoarseCandidate({
    sourceCandidate,
    witness,
    repairCandidate,
    recoveryMaxActiveLabels,
    highRegretRelative
  }));
  const rankedCoarse = rankCoarseCandidates(coarseEvaluations, {
    targetCatastrophicCount,
    pressureBand
  });
  const refined = rankedCoarse.slice(0, Math.min(refineTopK, rankedCoarse.length)).map((coarse) => refineCandidate({
    sourceCandidate,
    witness,
    coarse,
    maxPurchasePasses,
    recoveryMaxActiveLabels,
    highRegretRelative,
    targetCatastrophicCount,
    pressureBand
  }));
  const rankedRefined = rankRefinedCandidates(refined, {
    targetCatastrophicCount,
    pressureBand
  });
  const selected = rankedRefined[0] ?? null;

  return {
    schemaVersion: 1,
    model: 'v2-failure-core-localized-repair-search-v0.1',
    confidence: 'authoritative-fixed-event-order-local-repair-screen',
    productionWriteAllowed: false,
    publishable: false,
    sourceCandidateId: sourceCandidate.id,
    sourceReference: {
      terminalHp: rebuilt.terminalHp,
      minNormalizedHpMargin: rebuilt.minNormalizedHpMargin,
      witnessHash: rebuilt.witnessHash,
      semanticFingerprint: rebuilt.semanticFingerprint,
      purchasePlan: [...rebuilt.purchasePlan]
    },
    configuration: {
      maxRelativeSoftening,
      minimumRescuesPerCluster,
      minimumTotalRescues,
      targetCatastrophicCount,
      maxCandidateCombinations,
      refineTopK,
      pressureBand
    },
    baseline: {
      replay: baseline.replay,
      counterfactuals: compactCounterfactuals(baseline.counterfactuals),
      recovery: compactRecovery(baseline.recovery),
      failureClusters: clusters.map((cluster) => ({
        key: cluster.key,
        enemyId: cluster.enemyId,
        eventId: cluster.eventId,
        stepIndex: cluster.stepIndex,
        size: cluster.entries.length,
        mutations: cluster.entries.map((entry) => ({
          purchaseNumber: entry.purchaseNumber,
          baselineOption: entry.baselineOption,
          forcedOptionId: entry.forcedOptionId,
          failureCore: entry.failureCore
        }))
      }))
    },
    frontiers,
    coarseCandidates: rankedCoarse,
    refinedCandidates: rankedRefined.map((candidate) => ({
      ...candidate,
      refinement: candidate.refinement ? {
        ...candidate.refinement,
        witness: undefined
      } : null
    })),
    selected: selected ? {
      id: selected.id,
      repairEdits: selected.repairEdits,
      fullEdits: selected.fullEdits,
      relativeEdit: selected.relativeEdit,
      predictedRescues: selected.predictedRescues,
      refinement: selected.refinement,
      productionWriteAllowed: false,
      interpretation: selected.refinement?.localGatePassed
        ? 'localized_candidate_clears_the_internal_fixed-event-order_repair_screen_but_still_requires_global_v3_validation'
        : 'best_localized_candidate_remains_blocked_even_before_global_v3_validation'
    } : null,
    interpretation: selected?.refinement?.localGatePassed
      ? 'failure-core-guided_repair_found_a_local_v3_seed_for_stronger_player_and_exact-proof_validation'
      : 'localized_repair_search_did_not_yet_find_a_candidate_that_clears_the_internal_local_gate'
  };
}
