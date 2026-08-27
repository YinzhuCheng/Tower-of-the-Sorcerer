import { analyzeSinglePurchaseCounterfactuals } from '../analyzer/purchase-counterfactuals.js';
import { optimizePurchasePlanAcrossHolyPolicies } from '../analyzer/holy-policy-best-response.js';
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
import {
  classifyAdaptiveRaySample,
  nextAdaptiveRayStep
} from './adaptive-numeric-ray.js';

function promotedPlan() {
  const plan = PROMOTED_PURCHASE_PLANS[0];
  if (!plan) throw new Error('Holy-aware adaptive numeric ray requires a promoted purchase plan.');
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
    shopPlan: plan.shopPlan ? [...plan.shopPlan] : null,
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

function bestObservedSample(samples, targetMargin) {
  return samples
    .filter((sample) => sample.solvable && Number.isFinite(sample.margin))
    .sort((a, b) =>
      sampleDistance(a, targetMargin) - sampleDistance(b, targetMargin)
      || a.relativeStep - b.relativeStep
    )[0] ?? null;
}

function preferredPlansFromResponse(response) {
  const plans = {};
  for (const entry of response?.responses ?? []) {
    if (entry.status !== 'optimized' || !entry.bestPlan) continue;
    plans[entry.holyPolicy] = {
      ...entry.bestPlan,
      cycle: [...entry.bestPlan.cycle],
      shopPlan: entry.bestPlan.shopPlan ? [...entry.bestPlan.shopPlan] : null
    };
  }
  return plans;
}

function compactHolyAnalysis(response) {
  if (!response) return null;
  return {
    model: response.model,
    selectedHolyPolicy: response.best?.holyPolicy ?? null,
    selectedTerminalHp: response.best?.bestTerminalHp ?? null,
    attemptedPolicies: response.attemptedPolicies,
    optimizedPolicies: response.optimizedPolicies,
    uncoveredPolicies: [...(response.uncoveredPolicies ?? [])],
    seedCoverageRatio: response.seedCoverageRatio,
    allOptimizedLocalOptimal: response.allOptimizedLocalOptimal,
    stableWithinSeedPortfolio: response.stableWithinSeedPortfolio,
    alternatives: (response.alternatives ?? []).map((entry) => ({ ...entry }))
  };
}

function nearestPreferredPlans(samples, step, fallbackPlans) {
  return samples
    .filter((sample) => sample.solvable && sample.policyPlans)
    .sort((a, b) => Math.abs(a.relativeStep - step) - Math.abs(b.relativeStep - step))[0]
    ?.policyPlans ?? fallbackPlans;
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
        lowerHolyPolicy: previous.holyPolicy ?? null,
        higherStep: current.relativeStep,
        higherMargin: current.margin,
        higherHolyPolicy: current.holyPolicy ?? null
      });
    }
  }
  return violations;
}

function evaluatePlayerResponse({
  preferredPlans,
  maxLocalPasses,
  highRegretRelative
}) {
  const response = optimizePurchasePlanAcrossHolyPolicies({
    preferredPlans,
    maxPasses: maxLocalPasses,
    highRegretRelative
  });
  const best = response.best;
  if (!best?.bestResult?.solvable || !best.bestPlan) {
    return {
      ok: false,
      response,
      reason: 'no_holy_policy_feasible_seed'
    };
  }
  return {
    ok: true,
    response,
    route: best.bestResult,
    plan: best.bestPlan,
    localSearch: best.localSearch
  };
}

/**
 * Evaluates one numeric-ray strength after the player best-responds across all
 * modeled Holy timings and purchase 1-opt within each policy.
 */
export function evaluateHolyAwareAdaptiveRayStep({
  screenReport,
  candidate,
  relativeStep,
  preferredPlans = {},
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
    const player = evaluatePlayerResponse({
      preferredPlans,
      maxLocalPasses,
      highRegretRelative
    });
    if (!player.ok) {
      return {
        relativeStep,
        signature: materialized.signature,
        edits: materialized.edits,
        mutations: materialized.mutations,
        solvable: false,
        failure: player.reason,
        margin: null,
        targetDistance: Number.POSITIVE_INFINITY,
        holyPolicy: null,
        plan: null,
        policyPlans: preferredPlans,
        holyPolicyAnalysis: compactHolyAnalysis(player.response),
        localSearch: null
      };
    }

    const route = player.route;
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
      holyPolicy: player.plan.holyPolicy,
      plan: {
        ...player.plan,
        cycle: [...player.plan.cycle],
        shopPlan: player.plan.shopPlan ? [...player.plan.shopPlan] : null
      },
      policyPlans: preferredPlansFromResponse(player.response),
      holyPolicyAnalysis: compactHolyAnalysis(player.response),
      localSearch: player.localSearch ? { ...player.localSearch } : null
    };
  });
}

function evaluateBaseline({ maxLocalPasses, highRegretRelative, targetMargin }) {
  const basePlan = promotedPlan();
  const preferredPlans = { [basePlan.holyPolicy]: basePlan };
  const player = evaluatePlayerResponse({
    preferredPlans,
    maxLocalPasses,
    highRegretRelative
  });
  if (!player.ok) throw new Error('Holy-aware baseline found no feasible player response.');
  const tightest = tightestBattle(player.route);
  const margin = tightest?.normalizedHpMargin ?? null;
  return {
    relativeStep: 0,
    signature: 'baseline-holy-aware',
    edits: [],
    mutations: [],
    solvable: true,
    failure: null,
    margin,
    targetDistance: Number.isFinite(margin) ? Math.abs(margin - targetMargin) : Number.POSITIVE_INFINITY,
    finalHp: player.route.final.hp,
    pressureStatus: pressureStatus(margin),
    purchaseCounts: { ...player.route.purchaseCounts },
    holyPolicy: player.plan.holyPolicy,
    plan: player.plan,
    policyPlans: preferredPlansFromResponse(player.response),
    holyPolicyAnalysis: compactHolyAnalysis(player.response),
    localSearch: player.localSearch ? { ...player.localSearch } : null
  };
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
      return { route, solverReport: null, counterfactuals: null };
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
        id: `${candidate.id}@holy-aware-adaptive-ray-final`,
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
 * General numeric-ray co-adaptation with two modeled player-response axes:
 * discrete Holy timing and purchase 1-opt.
 */
export function adaptNumericRayCandidateHolyAware({
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
  if (!screenReport?.probes) throw new Error('Holy-aware adaptive ray requires a numeric lever screen.');
  if (!candidate?.leverKeys?.length) throw new Error('Holy-aware adaptive ray requires a candidate.');
  if (!Number.isFinite(targetMargin) || targetMargin <= 0 || targetMargin >= 1) {
    throw new Error('targetMargin must be inside (0, 1).');
  }
  if (!Number.isInteger(maxAdaptiveIterations) || maxAdaptiveIterations < 1) {
    throw new Error('maxAdaptiveIterations must be a positive integer.');
  }

  const baseline = evaluateBaseline({ maxLocalPasses, highRegretRelative, targetMargin });
  const protectedRay = searchProtectedPressureRay({
    screenReport,
    candidate,
    targetMargin,
    refineIterations: 4,
    exactFinal: false
  });
  const initialStep = protectedRay.best?.relativeStep ?? 0.50;
  const samples = [baseline];
  const seenSignatures = new Set([baseline.signature]);
  const fallbackPlans = baseline.policyPlans;

  function sample(step) {
    const preferredPlans = nearestPreferredPlans(samples, step, fallbackPlans);
    const result = evaluateHolyAwareAdaptiveRayStep({
      screenReport,
      candidate,
      relativeStep: step,
      preferredPlans,
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

  const first = sample(initialStep);
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
      if (classification === 'too_easy') low = result;
      else {
        high = result;
        break;
      }
    }
  } else {
    high = first;
  }

  let adaptiveIterations = 0;
  if (high) {
    while (adaptiveIterations < maxAdaptiveIterations && high.relativeStep - low.relativeStep > stepTolerance) {
      const best = bestObservedSample(samples, targetMargin);
      if (best && best.targetDistance <= marginTolerance && pressureStatus(best.margin) === 'target') break;
      const step = nextAdaptiveRayStep(low.relativeStep, high.relativeStep);
      const result = sample(step);
      const classification = classifyAdaptiveRaySample(result, targetMargin);
      if (classification === 'too_easy') low = result;
      else high = result;
      adaptiveIterations += 1;
    }
  }

  const best = bestObservedSample(samples, targetMargin);
  const violations = monotonicViolations(samples);
  if (!best) {
    return {
      schemaVersion: 2,
      model: 'adaptive-numeric-ray-v0.2-holy-aware',
      publishable: false,
      productionWriteAllowed: false,
      candidateId: candidate.id,
      leverKeys: [...candidate.leverKeys],
      targetMargin,
      bracketed: Boolean(high),
      converged: false,
      acceptedHardConstraints: false,
      rejection: 'no_solvable_holy_aware_sample',
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
    Math.abs(finalMargin - targetMargin) <= marginTolerance
    || (Number.isFinite(bracketWidth) && bracketWidth <= stepTolerance)
  );
  const holyPolicyAnalysis = best.holyPolicyAnalysis;
  const holyPolicyBestResponse = holyPolicyAnalysis?.stableWithinSeedPortfolio === true
    && holyPolicyAnalysis?.allOptimizedLocalOptimal === true
    && holyPolicyAnalysis?.selectedHolyPolicy === best.holyPolicy;

  const hardChecks = {
    bracketed: Boolean(high),
    converged,
    adaptedRouteSolvable: route?.solvable === true,
    localOneOptimal: counterfactuals?.improvedMutationCount === 0,
    holyPolicyBestResponse,
    exactExistence: solverReport?.solvable === true && solverReport?.exact === true,
    pressureTarget: pressureStatus(finalMargin) === 'target',
    recovery: (counterfactuals?.recoveryRate ?? 0) >= 0.60,
    catastrophic: (counterfactuals?.catastrophicRate ?? 1) <= 0.10
  };
  const acceptedHardConstraints = Object.values(hardChecks).every(Boolean);

  return {
    schemaVersion: 2,
    model: 'adaptive-numeric-ray-v0.2-holy-aware',
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
    adaptiveIterations,
    converged,
    acceptedHardConstraints,
    hardChecks,
    rejection: acceptedHardConstraints ? null : 'holy_aware_adaptive_ray_hard_constraints_failed',
    best: {
      relativeStep: best.relativeStep,
      signature: best.signature,
      edits: best.edits,
      margin: finalMargin,
      targetDistance: Math.abs((finalMargin ?? 1) - targetMargin),
      finalHp: route?.final?.hp ?? null,
      pressureStatus: pressureStatus(finalMargin),
      holyPolicy: best.holyPolicy,
      tightestBattle: finalTightest ? {
        floor: finalTightest.floor,
        enemyId: finalTightest.enemyId,
        enemyName: finalTightest.enemyName,
        normalizedHpMargin: finalTightest.normalizedHpMargin
      } : null,
      plan: best.plan,
      localSearch: best.localSearch,
      holyPolicyAnalysis
    },
    holyPolicyAnalysis,
    protectedRay,
    samples: samples.map((entry) => ({
      relativeStep: entry.relativeStep,
      signature: entry.signature,
      solvable: entry.solvable,
      failure: entry.failure,
      margin: entry.margin,
      targetDistance: entry.targetDistance,
      finalHp: entry.finalHp ?? null,
      purchaseCounts: entry.purchaseCounts ?? null,
      holyPolicy: entry.holyPolicy ?? null,
      holyPolicyAnalysis: entry.holyPolicyAnalysis ?? null,
      localSearch: entry.localSearch ?? null
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
