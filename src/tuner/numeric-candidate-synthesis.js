import { evaluateProtectedBalanceCandidate, rankBalanceCandidates } from './numeric-evaluator.js';

function mechanismOf(probe) {
  if (probe.parameter.family === 'shop') return 'shop-supply';
  if (probe.parameter.family === 'item') return 'item-supply';
  const field = probe.parameter.fields[0];
  if (field === 'gold') return 'enemy-economy';
  if (field === 'atk' || field === 'magicPower') return 'enemy-damage';
  if (field === 'hp' || field === 'def') return 'enemy-survivability';
  return 'enemy-other';
}

function entityKey(probe) {
  return `${probe.parameter.target}:${probe.parameter.id}`;
}

function canAddProbe(probe, selected, {
  maxPerEntity,
  maxPerFloor,
  editBudget
}) {
  if (!probe.mutation || probe.cliffAtProbe || probe.routeSolvable !== true) return false;
  if (!(probe.targetImprovement > 0) || !(probe.screenScore > 0)) return false;
  const nextBudget = selected.reduce((sum, entry) => sum + entry.mutation.relativeEdit, 0) + probe.mutation.relativeEdit;
  if (nextBudget > editBudget + 1e-12) return false;

  const entityCount = selected.filter((entry) => entityKey(entry) === entityKey(probe)).length;
  if (entityCount >= maxPerEntity) return false;

  const floor = probe.parameter.floor;
  if (floor != null) {
    const floorCount = selected.filter((entry) => entry.parameter.floor === floor).length;
    if (floorCount >= maxPerFloor) return false;
  }
  return true;
}

function buildCandidate(selected, index) {
  const edits = selected.flatMap((probe) => probe.mutation.edits.map((edit) => ({ ...edit })));
  const leverKeys = selected.map((probe) => probe.parameter.key);
  const budgetUsed = selected.reduce((sum, probe) => sum + probe.mutation.relativeEdit, 0);
  const rawImprovement = selected.reduce((sum, probe) => sum + probe.targetImprovement, 0);
  const mechanisms = [...new Set(selected.map(mechanismOf))];
  // Finite differences are not assumed additive. Discount the summed estimate as
  // the candidate grows; the estimate is for ordering only and never a proof.
  const synergyDiscount = 1 / Math.sqrt(selected.length);
  return {
    id: `numeric-combo-${String(index + 1).padStart(2, '0')}`,
    edits,
    leverKeys,
    mechanisms,
    parameterCount: selected.length,
    editBudgetUsed: budgetUsed,
    estimatedTargetImprovement: rawImprovement * synergyDiscount,
    evidence: selected.map((probe) => ({
      parameterKey: probe.parameter.key,
      traceScore: probe.traceScore,
      screenScore: probe.screenScore,
      targetImprovement: probe.targetImprovement,
      pressureGain: probe.pressureGain,
      mutation: {
        baseline: probe.mutation.baseline,
        value: probe.mutation.value,
        relativeEdit: probe.mutation.relativeEdit
      }
    }))
  };
}

/**
 * Builds diverse multi-parameter candidates from an already-authoritative
 * finite-difference screen. Diversity caps intentionally prevent the first
 * synthesis pass from stacking HP/DEF/magic changes on one monster or floor.
 */
export function synthesizeBudgetedNumericCandidates({
  screenReport,
  maxCandidates = 8,
  minParameters = 2,
  maxParameters = 3,
  editBudget = 0.30,
  maxPerEntity = 1,
  maxPerFloor = 1,
  sourcePoolSize = 10
} = {}) {
  if (!screenReport?.probes) throw new Error('Candidate synthesis requires a numeric lever screen report.');
  if (!Number.isInteger(maxCandidates) || maxCandidates <= 0) throw new Error('maxCandidates must be a positive integer.');
  if (!Number.isInteger(minParameters) || minParameters <= 0) throw new Error('minParameters must be a positive integer.');
  if (!Number.isInteger(maxParameters) || maxParameters < minParameters) throw new Error('maxParameters must be >= minParameters.');
  if (!Number.isFinite(editBudget) || editBudget <= 0) throw new Error('editBudget must be positive.');

  const eligible = screenReport.probes
    .filter((probe) =>
      probe.mutation &&
      probe.routeSolvable === true &&
      !probe.cliffAtProbe &&
      probe.targetImprovement > 0 &&
      probe.screenScore > 0
    )
    .slice(0, sourcePoolSize);

  const signatures = new Set();
  const candidates = [];
  for (let start = 0; start < eligible.length && candidates.length < maxCandidates; start += 1) {
    const selected = [];
    const order = [eligible[start], ...eligible.filter((_, index) => index !== start)];
    for (const probe of order) {
      if (selected.length >= maxParameters) break;
      if (!canAddProbe(probe, selected, { maxPerEntity, maxPerFloor, editBudget })) continue;
      selected.push(probe);
    }
    if (selected.length < minParameters) continue;
    const signature = selected.map((probe) => probe.parameter.key).sort().join('|');
    if (signatures.has(signature)) continue;
    signatures.add(signature);
    candidates.push(buildCandidate(selected, candidates.length));
  }

  return candidates.sort((a, b) =>
    b.estimatedTargetImprovement - a.estimatedTargetImprovement ||
    a.editBudgetUsed - b.editBudgetUsed ||
    a.id.localeCompare(b.id)
  );
}

/**
 * Protected-route + exact-existence evaluation for synthesized candidates.
 * This is still a screening layer: an adaptive player best response and the
 * review promotion gate remain mandatory before any production proposal.
 */
export function evaluateSynthesizedNumericCandidates({
  candidates,
  maxExpanded = 5_000,
  maxGenerated = 50_000,
  editPenaltyWeight = 0.05
} = {}) {
  if (!Array.isArray(candidates)) throw new Error('Candidate evaluation requires an array.');
  const evaluated = candidates.map((candidate) => ({
    candidate,
    evaluation: evaluateProtectedBalanceCandidate({
      id: candidate.id,
      edits: candidate.edits,
      maxExpanded,
      maxGenerated,
      editPenaltyWeight
    })
  }));
  const rankedEvaluations = rankBalanceCandidates(evaluated.map((entry) => entry.evaluation));
  const byId = new Map(evaluated.map((entry) => [entry.candidate.id, entry]));
  return rankedEvaluations.map((evaluation) => ({
    ...byId.get(evaluation.id),
    evaluation
  }));
}
