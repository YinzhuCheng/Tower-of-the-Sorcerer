import { analyzeSinglePurchaseCounterfactuals } from '../analyzer/purchase-counterfactuals.js';
import { optimizePurchasePlanLocally } from '../analyzer/purchase-local-search.js';
import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { solve } from '../solver/search.js';
import { createTowerAdapter } from '../solver/tower-adapter.js';
import { PROMOTED_PURCHASE_PLANS } from '../solver/tower-incumbent.js';
import { withBalanceEdits } from './balance-overlay.js';
import { PRESSURE_TARGET_BAND } from './numeric-evaluator.js';
import {
  materializeCandidateRayEdits,
  searchProtectedPressureRay
} from './numeric-ray-search.js';

function promotedPlan() {
  const plan = PROMOTED_PURCHASE_PLANS[0];
  if (!plan) throw new Error('Adaptive numeric ray requires a promoted purchase plan.');
  return {
    id: plan.id,
    cycle: [...plan.cycle],
    shopPlan: [...plan.shopPlan],
    holyPolicy: plan.holyPolicy
  };
}

function runPlan(plan) {
  return runGreedyShopStrategy({
    shopCycle: [...plan.cycle],
    shopPlan: [...plan.shopPlan],
    holyPolicy: plan.holyPolicy
  });
}

function tightestBattle(route) {
  return [...(route?.battleLog ?? [])]
    .filter((entry) => Number.isFinite(entry.normalizedHpMargin))
    .sort((a, b) => a.normalizedHpMargin - b.normalizedHpMargin)[0] ?? null;
}

function pressureStatus(margin) {
  if (!Number.isFinite(margin)) return 'unknown';
  if (margin < PRESSURE_TARGET_BAND[0]) return 'too_harsh';
  if (margin > PRESSURE_TARGET_BAND[1]) return 'too_forgiving';
  return 'target';
}

function sampleDistance(sample, targetMargin) {
  return sample?.solvable && Number.isFinite(sample.margin)
    ? Math.abs(sample.margin - targetMargin)
    : Number.POSITIVE_INFINITY;
}

function planFromLocal(seedPlan, localSearch) {
  return {
    id: `${seedPlan.id ?? 'adaptive-ray'}@response`,
    cycle: [...seedPlan.cycle],
    shopPlan: [...localSearch.bestPlan],
    holyPolicy: seedPlan.holyPolicy
  };
}

/**
 * Runs one locally adapting player response at a fixed ray strength.
 * The entire local search stays inside one synchronous balance overlay so every
 * counterfactual replay sees the same candidate game data.
 */
export function evaluateAdaptiveRayStep({
  screenReport,
  candidate,
  relativeStep,
  seedPlan = promotedPlan(),
  maxLocalPasses = 12,
  highRegretRelative = 0.20,
  targetMargin = 0.165
} = {}) {
  const materialized = materializeCandidateRayEdits({
    screenReport,
    candidate,
    relativeStep
  });

  return withBalanceEdits(materialized.edits, () => {
    let seedResult = runPlan(seedPlan);
    let effectiveSeed = seedPlan;
    if (!seedResult.solvable && seedPlan.id !== promotedPlan().id) {
      effectiveSeed = promotedPlan();
      seedResult = runPlan(effectiveSeed);
    }
    if (!seedResult.solvable) {
      return {
        relativeStep,
        signature: materialized.signature,
        edits: materialized.edits,
        mutations: materialized.mutations,
        solvable: false,
        failure: seedResult.failure ?? 'seed_plan_failed',
        margin: null,
        targetDistance: Number.POSITIVE_INFINITY,
        plan: effectiveSeed,
        localSearch: null
      };
    }

    const localSearch = optimizePurchasePlanLocally({
      seedEntry: {
        id: `${candidate.id}@adaptive-${relativeStep.toFixed(4)}`,
        cycle: [...effectiveSeed.cycle],
        holyPolicy: effectiveSeed.holyPolicy,
        result: seedResult
      },
      maxPasses: maxLocalPasses,
      highRegretRelative
    });
    const route = localSearch.bestResult;
    const tightest = tightestBattle(route);
    const margin = tightest?.normalizedHpMargin ?? null;

    return {
      relativeStep,
      signature: materialized.signature,
      edits: materialized.edits,
      mutations: materialized.mutations,
      solvable: true,
      failure: null,
      margin,
      targetDistance: Number.isFinite(margin)
        ? Math.abs(margin - targetMargin)
        : Number.POSITIVE_INFINITY,
      finalHp: route.final.hp,
      pressureStatus: pressureStatus(margin),
      tightestBattle: tightest ? {
        floor: tightest.floor,
        enemyId: tightest.enemyId,
        enemyName: tightest.enemyName,
        normalizedHpMargin: tightest.normalizedHpMargin
      } : null,
      purchaseCounts: { ...route.purchaseCounts },
      plan: planFromLocal(effectiveSeed, localSearch),
      localSearch: {
        localOptimal: localSearch.localOptimal,
        improvementPasses: localSearch.improvementPasses,
        evaluatedMutations: localSearch.evaluatedMutations,
        seedTerminalHp: localSearch.seedTerminalHp,
        bestTerminalHp: localSearch.bestTerminalHp,
        totalImprovement: localSearch.totalImprovement
      }
    };
  });
}

export function classifyAdaptiveRaySample(sample, targetMargin = 0.165) {
  if (!sample?.solvable || !Number.isFinite(sample.margin)) return 'too_hard_or_failed';
  if (sample.margin > targetMargin) return 'too_easy';
  if (sample.margin < targetMargin) return 'too_hard';
  return 'target';
}

export function nextAdaptiveRayStep(lowStep, highStep) {
  if (!Number.isFinite(lowStep) || !Number.isFinite(highStep) || !(highStep > lowStep)) {
    throw new Error('Adaptive ray bracket requires highStep > lowStep.');
  }
  return (lowStep + highStep) / 2;
}

function bestObservedSample(samples, targetMargin) {
  return samples
    .filter((sample) => sample.solvable && Number.isFinite(sample.margin))
    .sort((a, b) =>
      sampleDistance(a, targetMargin) - sampleDistance(b, targetMargin) ||
      a.relativeStep - b.relativeStep
    )[0] ?? null;
}

function nearestSeedPlan(samples, step, fallbackPlan) {
  return samples
    .filter((sample) => sample.solvable && sample.plan)
    .sort((a, b) =>
      Math.abs(a.relativeStep - step) - Math.abs(b.relativeStep - step)
    )[0]?.plan ?? fallbackPlan;
}

function monotonicViolations(samples, epsilon = 1e-9) {
  const ordered = samples
    .filter((sample) => sample.solvable && Number.isFinite(sample.margin))
    .sort((a, b) => a.relativeStep - b.relativeStep);
  const violations = [];
  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    if (current.margin > previous.margin + epsilon) {
      violations.push({
        lowerStep: previous.relativeStep,
        lowerMargin: previous.margin,
        higherStep: current.relativeStep,
        higherMargin: current.margin
      });
    }
  }
  return violations;
}

function finalProofEvaluation({
  sample,
  candidate,
  maxExpanded,
  maxGenerated,
  highRegretRelative
}) {
  return withBalanceEdits(sample.edits, () => {
    const route = runPlan(sample.plan);
    if (!route.solvable) {
      return {
        route,
        solverReport: null,
        counterfactuals: null
      };
    }
    const adapter = createTowerAdapter();
    const solverReport = solve({
      adapter,
      mode: 'existence',
      maxExpanded,
      maxGenerated
    });
    const counterfactuals = analyzeSinglePurchaseCounterfactuals({
      bestEntry: {
        id: `${candidate.id}@adaptive-ray-final`,
        cycle: [...sample.plan.cycle],
        holyPolicy: sample.plan.holyPolicy,
        result: route
      },
      highRegretRelative
    });
    return { route, solverReport, counterfactuals };
  });
}

/**
 * General player/game co-adaptation on one diverse numeric ray.
 *
 * The outer search only chooses the scalar ray strength. At every sampled
 * strength the player re-optimizes the purchase plan by authoritative 1-opt.
 * Binary refinement is a scale-finding heuristic, not a proof of monotonicity;
 * observed non-monotonic best-response jumps are reported explicitly.
 */
export function adaptNumericRayCandidate({
  screenReport,
  candidate,
  targetMargin = 0.165,
  marginTolerance = 0.02,
  stepTolerance = 0.01,
  maxAdaptiveIterations = 6,
  maxLocalPasses = 12,
  highRegretRelative = 0.20,
  maxExpanded = 5_000,
  maxGenerated = 50_000
} = {}) {
  if (!screenReport?.probes) throw new Error('Adaptive numeric ray requires a numeric lever screen.');
  if (!candidate?.leverKeys?.length) throw new Error('Adaptive numeric ray requires a candidate.');
  if (!Number.isFinite(targetMargin) || targetMargin <= 0 || targetMargin >= 1) {
    throw new Error('targetMargin must be inside (0, 1).');
  }
  if (!Number.isInteger(maxAdaptiveIterations) || maxAdaptiveIterations < 1) {
    throw new Error('maxAdaptiveIterations must be a positive integer.');
  }

  const basePlan = promotedPlan();
  const baselineRoute = runPlan(basePlan);
  if (!baselineRoute.solvable) throw new Error('Promoted baseline route is not solvable.');
  const baselineTightest = tightestBattle(baselineRoute);
  const baseline = {
    relativeStep: 0,
    signature: 'baseline',
    edits: [],
    mutations: [],
    solvable: true,
    failure: null,
    margin: baselineTightest?.normalizedHpMargin ?? null,
    targetDistance: Math.abs((baselineTightest?.normalizedHpMargin ?? 1) - targetMargin),
    finalHp: baselineRoute.final.hp,
    pressureStatus: pressureStatus(baselineTightest?.normalizedHpMargin ?? null),
    plan: basePlan,
    localSearch: {
      localOptimal: true,
      source: 'promoted-1opt-regression'
    }
  };

  const protectedRay = searchProtectedPressureRay({
    screenReport,
    candidate,
    targetMargin,
    refineIterations: 4,
    exactFinal: false
  });
  const initialStep = protectedRay.best?.relativeStep ?? 0.50;
  const samples = [baseline];
  const seenSignatures = new Set(['baseline']);

  function sample(step) {
    const seedPlan = nearestSeedPlan(samples, step, basePlan);
    const result = evaluateAdaptiveRayStep({
      screenReport,
      candidate,
      relativeStep: step,
      seedPlan,
      maxLocalPasses,
      highRegretRelative,
      targetMargin
    });
    if (!seenSignatures.has(result.signature)) {
      samples.push(result);
      seenSignatures.add(result.signature);
    }
    return result;
  }

  let first = sample(initialStep);
  let low = baseline;
  let high = null;

  if (classifyAdaptiveRaySample(first, targetMargin) === 'too_easy') {
    low = first;
    const escalationSteps = [
      initialStep + (0.80 - initialStep) * 0.5,
      0.80,
      0.90,
      0.95,
      0.975
    ]
      .filter((step) => step > initialStep + 1e-6 && step < 1)
      .sort((a, b) => a - b);
    for (const step of escalationSteps) {
      const result = sample(step);
      const classification = classifyAdaptiveRaySample(result, targetMargin);
      if (classification === 'too_easy') {
        low = result;
      } else {
        high = result;
        break;
      }
    }
  } else {
    high = first;
  }

  let iterations = 0;
  if (high) {
    while (iterations < maxAdaptiveIterations && high.relativeStep - low.relativeStep > stepTolerance) {
      const best = bestObservedSample(samples, targetMargin);
      if (best && best.targetDistance <= marginTolerance && pressureStatus(best.margin) === 'target') break;
      const step = nextAdaptiveRayStep(low.relativeStep, high.relativeStep);
      const result = sample(step);
      const classification = classifyAdaptiveRaySample(result, targetMargin);
      if (classification === 'too_easy') low = result;
      else high = result;
      iterations += 1;
    }
  }

  const best = bestObservedSample(samples, targetMargin);
  const violations = monotonicViolations(samples);
  if (!best) {
    return {
      schemaVersion: 1,
      model: 'adaptive-numeric-ray-v0.1',
      publishable: false,
      candidateId: candidate.id,
      leverKeys: [...candidate.leverKeys],
      targetMargin,
      bracketed: Boolean(high),
      converged: false,
      acceptedHardConstraints: false,
      rejection: 'no_solvable_adaptive_sample',
      protectedRay,
      samples,
      monotonicViolations: violations
    };
  }

  const proof = finalProofEvaluation({
    sample: best,
    candidate,
    maxExpanded,
    maxGenerated,
    highRegretRelative
  });
  const route = proof.route;
  const solverReport = proof.solverReport;
  const counterfactuals = proof.counterfactuals;
  const finalTightest = tightestBattle(route);
  const finalMargin = finalTightest?.normalizedHpMargin ?? null;
  const bracketWidth = high ? high.relativeStep - low.relativeStep : null;
  const converged = pressureStatus(finalMargin) === 'target' && (
    Math.abs(finalMargin - targetMargin) <= marginTolerance ||
    (Number.isFinite(bracketWidth) && bracketWidth <= stepTolerance)
  );

  const hardChecks = {
    bracketed: Boolean(high),
    converged,
    adaptedRouteSolvable: route?.solvable === true,
    localOneOptimal: counterfactuals?.improvedMutationCount === 0,
    exactExistence: solverReport?.solvable === true && solverReport?.exact === true,
    pressureTarget: pressureStatus(finalMargin) === 'target',
    recovery: (counterfactuals?.recoveryRate ?? 0) >= 0.60,
    catastrophic: (counterfactuals?.catastrophicRate ?? 1) <= 0.10
  };
  const acceptedHardConstraints = Object.values(hardChecks).every(Boolean);

  return {
    schemaVersion: 1,
    model: 'adaptive-numeric-ray-v0.1',
    publishable: false,
    productionWriteAllowed: false,
    candidateId: candidate.id,
    leverKeys: [...candidate.leverKeys],
    targetMargin,
    initialStep,
    bracketed: Boolean(high),
    bracket: high ? {
      lowStep: low.relativeStep,
      lowMargin: low.margin,
      highStep: high.relativeStep,
      highMargin: high.margin,
      highSolvable: high.solvable,
      width: bracketWidth
    } : null,
    adaptiveIterations: iterations,
    converged,
    acceptedHardConstraints,
    hardChecks,
    rejection: acceptedHardConstraints ? null : 'adaptive_ray_hard_constraints_failed',
    best: {
      relativeStep: best.relativeStep,
      signature: best.signature,
      edits: best.edits,
      margin: finalMargin,
      targetDistance: Math.abs((finalMargin ?? 1) - targetMargin),
      finalHp: route?.final?.hp ?? null,
      pressureStatus: pressureStatus(finalMargin),
      tightestBattle: finalTightest ? {
        floor: finalTightest.floor,
        enemyId: finalTightest.enemyId,
        enemyName: finalTightest.enemyName,
        normalizedHpMargin: finalTightest.normalizedHpMargin
      } : null,
      plan: best.plan,
      localSearch: best.localSearch
    },
    protectedRay,
    samples: samples.map((sampleEntry) => ({
      relativeStep: sampleEntry.relativeStep,
      signature: sampleEntry.signature,
      solvable: sampleEntry.solvable,
      failure: sampleEntry.failure,
      margin: sampleEntry.margin,
      targetDistance: sampleEntry.targetDistance,
      finalHp: sampleEntry.finalHp ?? null,
      purchaseCounts: sampleEntry.purchaseCounts ?? null,
      localSearch: sampleEntry.localSearch ?? null
    })),
    monotonicViolations: violations,
    solver: solverReport ? {
      solvable: solverReport.solvable,
      exact: solverReport.exact,
      stoppedReason: solverReport.stoppedReason,
      expandedStates: solverReport.expandedStates,
      generatedStates: solverReport.generatedStates,
      certificateHash: solverReport.certificate?.certificateHash ?? null
    } : null,
    counterfactuals: counterfactuals ? {
      totalMutations: counterfactuals.totalMutations,
      recoveryRate: counterfactuals.recoveryRate,
      catastrophicRate: counterfactuals.catastrophicRate,
      highRegretRate: counterfactuals.highRegretRate,
      medianNormalizedRegret: counterfactuals.medianNormalizedRegret,
      p90NormalizedRegret: counterfactuals.p90NormalizedRegret,
      maxNormalizedRegret: counterfactuals.maxNormalizedRegret,
      improvedMutationCount: counterfactuals.improvedMutationCount,
      bestMutation: counterfactuals.bestMutation,
      mostSensitivePurchases: counterfactuals.mostSensitivePurchases
    } : null
  };
}
