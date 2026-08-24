import test from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../src/solver/search.js';
import { canonicalizeCompassTravel, createBoundedTowerAdapter } from '../src/solver/tower-bounds.js';
import { findBestGreedyIncumbent } from '../src/solver/tower-incumbent.js';

test('compass travel canonicalization removes only redundant travel directions', () => {
  const actions = [
    { kind: 'teleport', targetFloor: 1, id: 'down' },
    { kind: 'teleport', targetFloor: 5, id: 'up' },
    { kind: 'tile', token: 'D', id: 'stairs-down' },
    { kind: 'tile', token: 'U', id: 'stairs-up' },
    { kind: 'tile', token: 'enemy:test', id: 'enemy' }
  ];
  const withoutCompass = canonicalizeCompassTravel({ floor: 4, relics: { compass: false } }, actions);
  assert.equal(withoutCompass.length, actions.length);

  const withCompass = canonicalizeCompassTravel({ floor: 4, relics: { compass: true } }, actions);
  assert.deepEqual(withCompass.map((action) => action.id), ['down', 'stairs-up', 'enemy']);
});

test('Tower incumbent witness cannot be reused for a different initial state', () => {
  const portfolio = findBestGreedyIncumbent();
  const adapter = createBoundedTowerAdapter();
  const mutatedInitial = adapter.createInitialState();
  mutatedInitial.stats.hp += 1;
  assert.throws(
    () => solve({
      adapter,
      initialState: mutatedInitial,
      mode: 'optimize',
      incumbentWitness: portfolio.best.witness,
      maxExpanded: 1
    }),
    /canonical initial state/
  );
});

test('Tower optimizer uses an engine-verified incumbent witness and safe HP upper bound', { timeout: 60_000 }, () => {
  const portfolio = findBestGreedyIncumbent();
  const incumbent = portfolio.best;
  assert.ok(incumbent, 'incumbent portfolio must contain a feasible strategy');
  assert.equal(incumbent.result.final.hp, 12_536);

  const adapter = createBoundedTowerAdapter();
  const initial = adapter.createInitialState();
  const initialUpperBound = adapter.objectiveUpperBound(initial);
  assert.ok(initialUpperBound >= incumbent.result.final.hp, 'an admissible upper bound must cover a verified solution');
  assert.ok(initialUpperBound < 90_080, 'mandatory final-form damage should tighten the old zero-damage bound');

  const report = solve({
    adapter,
    mode: 'optimize',
    incumbentWitness: incumbent.witness,
    maxExpanded: 2_000,
    maxGenerated: 40_000
  });

  const summary = {
    incumbent: incumbent.result.final.hp,
    initialUpperBound,
    verification: report.incumbentVerification,
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
  assert.equal(report.solvable, true, 'verified witness proves feasibility even before search re-discovers a goal');
  assert.equal(report.incumbentVerification.ok, true);
  assert.equal(report.incumbentVerification.value, 12_536);
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
