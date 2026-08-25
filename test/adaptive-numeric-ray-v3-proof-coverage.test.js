import test from 'node:test';
import assert from 'node:assert/strict';
import { strengthenHolyEvidence } from '../src/tuner/adaptive-numeric-ray-v3.js';

function baseReport(alternatives) {
  return {
    hardChecks: {
      bracketed: true,
      converged: true,
      adaptedRouteSolvable: true,
      localOneOptimal: true,
      holyPolicyBestResponse: true,
      exactExistence: true,
      pressureTarget: true,
      recovery: true,
      catastrophic: true
    },
    holyPolicyAnalysis: {
      selectedHolyPolicy: 'immediate',
      attemptedPolicies: 4,
      optimizedPolicies: 1,
      allOptimizedLocalOptimal: true,
      stableWithinSeedPortfolio: true,
      alternatives
    },
    best: {
      holyPolicy: 'immediate',
      holyPolicyAnalysis: {
        selectedHolyPolicy: 'immediate',
        attemptedPolicies: 4,
        optimizedPolicies: 1,
        allOptimizedLocalOptimal: true,
        stableWithinSeedPortfolio: true,
        alternatives
      }
    }
  };
}

const cut = { type: 'STATIC_CUT', certificateHash: 'cut-1' };

test('v3 accepts one optimized policy plus three sound infeasibility-covered policies', () => {
  const report = strengthenHolyEvidence(baseReport([
    { holyPolicy: 'immediate', status: 'optimized', bestTerminalHp: 1000, localOptimal: true },
    { holyPolicy: 'after-core-6', status: 'infeasible-proven', infeasibilityProof: cut },
    { holyPolicy: 'after-core-7', status: 'infeasible-proven', infeasibilityProof: cut },
    { holyPolicy: 'before-final', status: 'infeasible-proven', infeasibilityProof: cut }
  ]));
  assert.equal(report.holyPolicyAnalysis.coverageComplete, true);
  assert.equal(report.holyPolicyAnalysis.provenInfeasiblePolicies, 3);
  assert.equal(report.holyPolicyAnalysis.coveredPolicies, 4);
  assert.equal(report.holyPolicyAnalysis.policyCoverageRatio, 1);
  assert.deepEqual(report.holyPolicyAnalysis.uncoveredPolicies, []);
  assert.equal(report.holyPolicyAnalysis.stableWithCompleteCoverage, true);
  assert.equal(report.hardChecks.holyPolicyBestResponse, true);
  assert.equal(report.acceptedHardConstraints, true);
});

test('v3 still blocks a bounded/heuristic uncovered policy', () => {
  const report = strengthenHolyEvidence(baseReport([
    { holyPolicy: 'immediate', status: 'optimized', bestTerminalHp: 1000, localOptimal: true },
    { holyPolicy: 'after-core-6', status: 'infeasible-proven', infeasibilityProof: cut },
    { holyPolicy: 'after-core-7', status: 'infeasible-proven', infeasibilityProof: cut },
    { holyPolicy: 'before-final', status: 'uncovered' }
  ]));
  assert.equal(report.holyPolicyAnalysis.coverageComplete, false);
  assert.deepEqual(report.holyPolicyAnalysis.uncoveredPolicies, ['before-final']);
  assert.equal(report.hardChecks.holyPolicyBestResponse, false);
  assert.equal(report.acceptedHardConstraints, false);
});
