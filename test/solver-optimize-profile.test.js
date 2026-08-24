import test from 'node:test';
import assert from 'node:assert/strict';
import { runGreedyShopStrategy } from '../src/solver/greedy-strategy.js';
import { solve } from '../src/solver/search.js';
import { createBoundedTowerAdapter } from '../src/solver/tower-bounds.js';

test('Tower optimizer uses a verified incumbent and safe HP upper bound', { timeout: 60_000 }, () => {
  const incumbent = runGreedyShopStrategy({ shopCycle: ['def', 'atk', 'hp'] });
  assert.equal(incumbent.solvable, true, incumbent.failure ?? 'incumbent must be feasible');
  assert.equal(incumbent.final.hp, 12_536);

  const adapter = createBoundedTowerAdapter();
  const initial = adapter.createInitialState();
  const initialUpperBound = adapter.objectiveUpperBound(initial);
  assert.ok(initialUpperBound >= incumbent.final.hp, 'an admissible upper bound must cover a verified solution');
  assert.ok(initialUpperBound < 90_080, 'mandatory final-form damage should tighten the old zero-damage bound');

  const report = solve({
    adapter,
    mode: 'optimize',
    incumbentLowerBound: incumbent.final.hp,
    maxExpanded: 2_000,
    maxGenerated: 40_000
  });

  const summary = {
    incumbent: incumbent.final.hp,
    initialUpperBound,
    solvable: report.solvable,
    exact: report.exact,
    stoppedReason: report.stoppedReason,
    objective: report.objective,
    expanded: report.expandedStates,
    generated: report.generatedStates,
    prunedDominated: report.prunedDominated,
    prunedBound: report.prunedBound,
    structuralStates: report.structuralStates,
    activeLabels: report.activeLabels,
    frontierPeak: report.frontierPeak,
    profile: report.profile
  };
  console.log(`TOWER_OPTIMIZE_PROFILE ${JSON.stringify(summary)}`);

  assert.equal(report.mode, 'optimize');
  assert.equal(report.objective.seededLowerBound, 12_536);
  assert.ok(report.objective.best >= 12_536);
  assert.ok(report.generatedStates >= report.expandedStates);
  assert.ok(report.prunedDominated > 0);
  assert.ok(report.prunedBound > 0, 'verified incumbent should activate safe branch-and-bound pruning');
  assert.ok(report.profile.generatedByAction.shop > 0);
  if (report.stoppedReason !== null) {
    assert.equal(report.exact, false, 'a resource-bounded profile must not claim a global optimum');
  }
});
