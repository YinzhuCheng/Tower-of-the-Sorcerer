import { adaptNumericRayCandidateHolyAware } from './adaptive-numeric-ray-v2.js';

function strengthenHolyEvidence(report) {
  const holy = report?.holyPolicyAnalysis ?? null;
  const coverageComplete = Boolean(
    holy
    && Number.isFinite(holy.attemptedPolicies)
    && holy.attemptedPolicies > 0
    && holy.optimizedPolicies === holy.attemptedPolicies
  );
  const stableWithCompleteCoverage = Boolean(
    coverageComplete
    && holy?.allOptimizedLocalOptimal === true
    && holy?.stableWithinSeedPortfolio === true
  );
  const holyPolicyAnalysis = holy ? {
    ...holy,
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
 * V3 keeps V2's Holy-aware player search but tightens the review evidence:
 * every modeled Holy policy must obtain a feasible seed and reach purchase
 * local-1opt. Uncovered policies remain visible evidence gaps instead of being
 * silently treated as impossible.
 */
export function adaptNumericRayCandidateCompleteHolyCoverage(options = {}) {
  return strengthenHolyEvidence(adaptNumericRayCandidateHolyAware(options));
}

export { strengthenHolyEvidence };
