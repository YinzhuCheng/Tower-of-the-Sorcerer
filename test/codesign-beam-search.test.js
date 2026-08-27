import test from 'node:test';
import assert from 'node:assert/strict';
import { runTowerCodesignBeamSearch } from '../src/tuner/codesign-beam-search.js';

function evidence(prunability) {
  const hostile = prunability > 0.5;
  return {
    search: {
      expandedStates: hostile ? 100 : 10,
      maxExpanded: 100,
      generatedStates: hostile ? 1_000 : 100,
      maxGenerated: 1_000,
      prunedBound: hostile ? 0 : 30,
      prunedDominated: hostile ? 0 : 50
    },
    boundary: {
      activeGoalLabels: hostile ? 64 : 4,
      goalStructuralStates: hostile ? 128 : 4,
      actionSurfaceStructuralStates: hostile ? 4 : 4
    },
    bridge: { residual: hostile ? 64 : 2 },
    suffix: { travelRatio: hostile ? 0.7 : 0.2 },
    routePortfolio: { paretoWidth: hostile ? 64 : 4 }
  };
}

test('beam search may use heuristic evidence and keeps more prunable solvable variants', () => {
  const report = runTowerCodesignBeamSearch({
    seeds: [{ id: 'seed', x: 0 }],
    beamWidth: 2,
    rounds: 2,
    keyOf: (candidate) => candidate.id,
    expand(candidate, round) {
      if (candidate.id === 'seed') return [
        { id: `hostile-${round}`, x: 10 },
        { id: `friendly-${round}`, x: 1 }
      ];
      return [];
    },
    evaluate(candidate) {
      return {
        solvabilityWitnessVerified: true,
        qualityLoss: candidate.x / 100,
        funLoss: 0.1,
        editLoss: candidate.x / 100,
        prunabilityEvidence: evidence(candidate.x > 5 ? 1 : 0)
      };
    }
  });

  assert.equal(report.heuristicOnly, true);
  assert.equal(report.productionWriteAllowed, false);
  assert.ok(report.best);
  assert.notEqual(report.best.candidate.id, 'hostile-1');
});

test('beam search drops variants without replay-verified solvability witness', () => {
  const report = runTowerCodesignBeamSearch({
    seeds: [{ id: 'dead' }, { id: 'live' }],
    beamWidth: 2,
    rounds: 0,
    keyOf: (candidate) => candidate.id,
    expand: () => [],
    evaluate(candidate) {
      return {
        solvabilityWitnessVerified: candidate.id === 'live',
        qualityLoss: 0,
        funLoss: 0,
        editLoss: 0,
        prunabilityEvidence: evidence(0)
      };
    }
  });
  assert.deepEqual(report.portfolio.map((entry) => entry.candidate.id), ['live']);
});

test('beam expansion receives the already-computed parent evaluation', () => {
  const observed = [];
  const report = runTowerCodesignBeamSearch({
    seeds: [{ id: 'seed', x: 1 }],
    beamWidth: 1,
    rounds: 1,
    keyOf: (candidate) => candidate.id,
    expand(candidate, round, parentEvaluation) {
      observed.push({ candidate: candidate.id, round, marker: parentEvaluation.marker });
      return [{ id: 'child', x: 0 }];
    },
    evaluate(candidate) {
      return {
        marker: `eval:${candidate.id}`,
        solvabilityWitnessVerified: true,
        qualityLoss: candidate.x / 100,
        funLoss: 0,
        editLoss: 0,
        prunabilityEvidence: evidence(0)
      };
    }
  });
  assert.deepEqual(observed, [{ candidate: 'seed', round: 1, marker: 'eval:seed' }]);
  assert.equal(report.best.candidate.id, 'child');
});
