import { adaptNumericRayCandidateHolyAware } from './adaptive-numeric-ray-v2.js';

function policyCoverageFromAlternatives(holy) {
  const attempted = Number.isFinite(holy?.attemptedPolicies) ? holy.attemptedPolicies : 0;
  const alternatives = Array.isArray(holy?.alternatives) ? holy.alternatives : [];
  const optimizedPolicies = alternatives.filter((entry) => entry.status === 'optimized').length;
  const proven = alternatives.filter((entry) => entry.status === 'infeasible-proven');
  const uncovered = alternatives.filter((entry) =>
    entry.status !== 'optimized' && entry.status !== 'infeasible-proven'
  );
  const alternativesComplete = attempted > 0
    && alternatives.length === attempted
    && optimizedPolicies + proven.length === attempted;
  return {
    attemptedPolicies: attempted,
    optimizedPolicies: Number.isFinite(holy?.optimizedPolicies)
      ? holy.optimizedPolicies
      : optimizedPolicies,
    provenInfeasiblePolicies: proven.length,
    provenInfeasiblePolicyIds: proven.map((entry) => entry.holyPolicy),
    coveredPolicies: optimizedPolicies + proven.length,
    uncoveredPolicies: uncovered.map((entry) => entry.holyPolicy),
    policyCoverageRatio: attempted > 0 ? (optimizedPolicies + proven.length) / attempted : 0,
    coverageComplete: alternativesComplete
  };
}

export function strengthenHolyEvidence(report) {
  const holy = report?.holyPolicyAnalysis ?? null;
  const coverage = holy ? policyCoverageFromAlternatives(holy) : null;
  const coverageComplete = Boolean(coverage?.coverageComplete);
  const stableWithCompleteCoverage = Boolean(
    coverageComplete
    && holy?.allOptimizedLocalOptimal === true
    && holy?.stableWithinSeedPortfolio === true
  );
  const holyPolicyAnalysis = holy ? {
    ...holy,
    ...coverage,
    coverageComplete,
    stableWithCompleteCoverage
  } : null;
  const hardChecks = {
    ...(report?.hardChecks ?? {}),
    holyPolicyBestResponse: stableWithCompleteCoverage
  };
  const acceptedHardConstraints = Object.values(hardChecks).every(Boolean);

  return {
    ...report,
    schemaVersion: 3,
    model: 'adaptive-numeric-ray-v0.3-complete-holy-coverage',
    holyPolicyAnalysis,
    best: report?.best ? {
      ...report.best,
      holyPolicyAnalysis: report.best.holyPolicyAnalysis ? {
        ...report.best.holyPolicyAnalysis,
        ...coverage,
        coverageComplete,
        stableWithCompleteCoverage
      } : null
    } : report?.best,
    hardChecks,
    acceptedHardConstraints,
    rejection: acceptedHardConstraints ? null : 'adaptive_ray_hard_constraints_failed_v3'
  };
}

/**
 * V3 keeps V2's Holy-aware player search but tightens review evidence: every
 * modeled Holy policy must be covered either by an authoritative feasible
 * best-response that reached purchase local-1opt OR by a sound policy-level
 * infeasibility certificate. Bounded/heuristic misses remain uncovered and still
 * block review.
 */
export function adaptNumericRayCandidateCompleteHolyCoverage(options = {}) {
  return strengthenHolyEvidence(adaptNumericRayCandidateHolyAware(options));
}
