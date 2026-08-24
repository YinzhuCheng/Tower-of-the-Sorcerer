import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { PROMOTED_PURCHASE_PLANS } from '../solver/tower-incumbent.js';
import { withBalanceEdits } from './balance-overlay.js';
import { evaluateProtectedBalanceCandidate } from './numeric-evaluator.js';
import { proposeDirectionalMutation } from './numeric-mutation-space.js';

function protectedPlan() {
  const plan = PROMOTED_PURCHASE_PLANS[0];
  if (!plan) throw new Error('Numeric ray search requires a promoted purchase plan.');
  return plan;
}

function runPlan(plan) {
  return runGreedyShopStrategy({
    shopCycle: [...plan.cycle],
    shopPlan: [...plan.shopPlan],
    holyPolicy: plan.holyPolicy
  });
}

function minPressure(route) {
  return [...(route.battleLog ?? [])]
    .filter((entry) => Number.isFinite(entry.normalizedHpMargin))
    .sort((a, b) => a.normalizedHpMargin - b.normalizedHpMargin)[0] ?? null;
}

function editSignature(edits) {
  return edits
    .map((edit) => `${edit.target}:${edit.id}:${edit.field}=${edit.value}`)
    .sort()
    .join('|');
}

export function resolveCandidateRayParameters({ screenReport, candidate } = {}) {
  if (!screenReport?.probes) throw new Error('Ray parameter resolution requires the source numeric lever screen.');
  if (!candidate?.leverKeys?.length) throw new Error('Ray parameter resolution requires a synthesized candidate.');
  const probeByKey = new Map(screenReport.probes.map((probe) => [probe.parameter.key, probe]));
  return candidate.leverKeys.map((key) => {
    const probe = probeByKey.get(key);
    if (!probe) throw new Error(`Candidate lever is missing from screen report: ${key}`);
    return probe.parameter;
  });
}

/**
 * Materializes one scalar position along a multi-parameter "harder" ray.
 * All field semantics stay delegated to the canonical numeric mutation catalogue.
 */
export function materializeCandidateRayEdits({
  screenReport,
  candidate,
  relativeStep
} = {}) {
  if (!Number.isFinite(relativeStep) || relativeStep <= 0 || relativeStep >= 1) {
    throw new Error('relativeStep must be inside (0, 1).');
  }
  const parameters = resolveCandidateRayParameters({ screenReport, candidate });
  const edits = [];
  const mutations = [];
  for (const parameter of parameters) {
    const mutation = proposeDirectionalMutation(parameter, {
      relativeStep,
      direction: 'harder'
    });
    if (!mutation) continue;
    mutations.push(mutation);
    edits.push(...mutation.edits);
  }
  return {
    relativeStep,
    parameters,
    edits,
    mutations,
    signature: editSignature(edits)
  };
}

function evaluateStep({ plan, screenReport, candidate, relativeStep, targetMargin }) {
  const materialized = materializeCandidateRayEdits({ screenReport, candidate, relativeStep });
  const { edits, mutations, signature } = materialized;
  if (edits.length === 0) {
    return {
      relativeStep,
      edits,
      mutations,
      signature: '',
      solvable: false,
      failure: 'no_effective_edits',
      margin: null,
      targetDistance: Number.POSITIVE_INFINITY
    };
  }

  const route = withBalanceEdits(edits, () => runPlan(plan));
  if (!route.solvable) {
    return {
      relativeStep,
      edits,
      mutations,
      signature,
      solvable: false,
      failure: route.failure ?? 'route_failed',
      margin: null,
      targetDistance: Number.POSITIVE_INFINITY
    };
  }
  const tightest = minPressure(route);
  const margin = tightest?.normalizedHpMargin ?? null;
  return {
    relativeStep,
    edits,
    mutations,
    signature,
    solvable: true,
    failure: null,
    margin,
    targetDistance: Number.isFinite(margin) ? Math.abs(margin - targetMargin) : Number.POSITIVE_INFINITY,
    finalHp: route.final.hp,
    tightestBattle: tightest ? {
      floor: tightest.floor,
      enemyId: tightest.enemyId,
      enemyName: tightest.enemyName,
      normalizedHpMargin: tightest.normalizedHpMargin
    } : null
  };
}

function uniqueEvaluations(evaluations) {
  const bySignature = new Map();
  for (const evaluation of evaluations) {
    const key = evaluation.signature || `step:${evaluation.relativeStep}`;
    const existing = bySignature.get(key);
    if (!existing || evaluation.targetDistance < existing.targetDistance) bySignature.set(key, evaluation);
  }
  return [...bySignature.values()].sort((a, b) => a.relativeStep - b.relativeStep);
}

function bestSolvable(evaluations) {
  return evaluations
    .filter((entry) => entry.solvable && Number.isFinite(entry.targetDistance))
    .sort((a, b) =>
      a.targetDistance - b.targetDistance ||
      a.relativeStep - b.relativeStep
    )[0] ?? null;
}

/**
 * Searches a one-dimensional "harder" ray formed by several diverse levers.
 * This is a cheap scale search against the fixed protected route. It does not
 * assume finite differences are additive and does not claim player equilibrium.
 */
export function searchProtectedPressureRay({
  screenReport,
  candidate,
  targetMargin = 0.165,
  coarseSteps = [0.10, 0.20, 0.35, 0.50, 0.65, 0.80, 0.90, 0.95],
  refineIterations = 5,
  exactFinal = true,
  maxExpanded = 5_000,
  maxGenerated = 50_000
} = {}) {
  if (!Number.isFinite(targetMargin) || targetMargin <= 0 || targetMargin >= 1) {
    throw new Error('targetMargin must be inside (0, 1).');
  }
  resolveCandidateRayParameters({ screenReport, candidate });

  const plan = protectedPlan();
  const evaluations = coarseSteps.map((relativeStep) => evaluateStep({
    plan,
    screenReport,
    candidate,
    relativeStep,
    targetMargin
  }));

  for (let iteration = 0; iteration < refineIterations; iteration += 1) {
    const unique = uniqueEvaluations(evaluations);
    const best = bestSolvable(unique);
    if (!best) break;
    const index = unique.findIndex((entry) => entry.signature === best.signature);
    const left = unique[Math.max(0, index - 1)]?.relativeStep ?? 0;
    const right = unique[Math.min(unique.length - 1, index + 1)]?.relativeStep ?? 0.99;
    if (!(right > left + 1e-4)) break;
    const mids = [
      (left + best.relativeStep) / 2,
      (best.relativeStep + right) / 2
    ].filter((step) => step > 0 && step < 1);
    for (const relativeStep of mids) {
      evaluations.push(evaluateStep({ plan, screenReport, candidate, relativeStep, targetMargin }));
    }
  }

  const samples = uniqueEvaluations(evaluations);
  const best = bestSolvable(samples);
  const exactEvaluation = best && exactFinal
    ? evaluateProtectedBalanceCandidate({
        id: `${candidate.id}@ray-${best.relativeStep.toFixed(4)}`,
        edits: best.edits,
        maxExpanded,
        maxGenerated
      })
    : null;

  return {
    schemaVersion: 1,
    model: 'protected-pressure-ray-v0.1',
    publishable: false,
    candidateId: candidate.id,
    leverKeys: [...candidate.leverKeys],
    targetMargin,
    samples,
    best,
    exactEvaluation
  };
}

export function searchCandidatePressureRays({
  screenReport,
  candidates,
  targetMargin = 0.165,
  exactFinal = true,
  ...options
} = {}) {
  if (!Array.isArray(candidates)) throw new Error('searchCandidatePressureRays requires candidates.');
  const reports = candidates.map((candidate) => searchProtectedPressureRay({
    screenReport,
    candidate,
    targetMargin,
    exactFinal,
    ...options
  }));
  return reports.sort((a, b) => {
    const aHard = a.exactEvaluation?.acceptedHardConstraints === true;
    const bHard = b.exactEvaluation?.acceptedHardConstraints === true;
    if (aHard !== bHard) return aHard ? -1 : 1;
    const aDistance = a.best?.targetDistance ?? Number.POSITIVE_INFINITY;
    const bDistance = b.best?.targetDistance ?? Number.POSITIVE_INFINITY;
    return aDistance - bDistance || a.candidateId.localeCompare(b.candidateId);
  });
}
