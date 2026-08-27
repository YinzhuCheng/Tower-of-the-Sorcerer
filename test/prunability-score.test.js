import test from 'node:test';
import assert from 'node:assert/strict';
import {
  prunabilityMetrics,
  scorePrunabilityEvidence,
  scoreTowerCodesignCandidate
} from '../src/tuner/prunability-score.js';

function proofFriendlyEvidence() {
  return {
    search: {
      expandedStates: 2_000,
      maxExpanded: 10_000,
      generatedStates: 10_000,
      maxGenerated: 50_000,
      prunedBound: 400,
      prunedDominated: 2_000
    },
    boundary: {
      activeGoalLabels: 4,
      goalStructuralStates: 8,
      actionSurfaceStructuralStates: 4
    },
    bridge: { boundClosed: 20, residual: 4 },
    suffix: { travelRatio: 0.20 },
    routePortfolio: { paretoWidth: 4 }
  };
}

function proofHostileEvidence() {
  return {
    search: {
      expandedStates: 10_000,
      maxExpanded: 10_000,
      generatedStates: 50_000,
      maxGenerated: 50_000,
      prunedBound: 0,
      prunedDominated: 0
    },
    boundary: {
      activeGoalLabels: 128,
      goalStructuralStates: 512,
      actionSurfaceStructuralStates: 12
    },
    bridge: { boundClosed: 0, residual: 184 },
    suffix: { travelRatio: 0.70 },
    routePortfolio: { paretoWidth: 128 }
  };
}

test('prunability score prefers a small meaningful Pareto family with effective pruning', () => {
  const good = scorePrunabilityEvidence(proofFriendlyEvidence());
  const bad = scorePrunabilityEvidence(proofHostileEvidence());
  assert.ok(good.score < bad.score);
  assert.ok(good.metrics.boundPruneRate > bad.metrics.boundPruneRate);
  assert.ok(good.metrics.historyInflation < bad.metrics.historyInflation);
  assert.ok(good.metrics.travelRatio < bad.metrics.travelRatio);
});

test('prunability metrics expose history inflation separately from current action surfaces', () => {
  const metrics = prunabilityMetrics({
    boundary: {
      activeGoalLabels: 512,
      goalStructuralStates: 512,
      actionSurfaceStructuralStates: 12
    }
  });
  assert.equal(metrics.goalStructuralStates, 512);
  assert.equal(metrics.actionSurfaceStructuralStates, 12);
  assert.ok(metrics.historyInflation > 40);
});

test('co-design generation requires a replay-verified witness but not exact proof closure', () => {
  const rejected = scoreTowerCodesignCandidate({
    qualityLoss: 0,
    funLoss: 0,
    solvabilityWitnessVerified: false,
    prunabilityEvidence: proofFriendlyEvidence()
  });
  assert.equal(rejected.score, Infinity);

  const accepted = scoreTowerCodesignCandidate({
    qualityLoss: 0.1,
    funLoss: 0.1,
    editLoss: 0.1,
    solvabilityWitnessVerified: true,
    prunabilityEvidence: proofFriendlyEvidence()
  });
  assert.ok(Number.isFinite(accepted.score));
});
