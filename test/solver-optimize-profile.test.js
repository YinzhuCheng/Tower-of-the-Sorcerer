import test from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../src/solver/search.js';
import { createTowerAdapter } from '../src/solver/tower-adapter.js';

test('Tower optimizer exposes a bounded full-game search profile', { timeout: 60_000 }, () => {
  const adapter = createTowerAdapter();
  const report = solve({
    adapter,
    mode: 'optimize',
    maxExpanded: 2_000,
    maxGenerated: 40_000
  });

  const summary = {
    solvable: report.solvable,
    exact: report.exact,
    stoppedReason: report.stoppedReason,
    objective: report.objective,
    expanded: report.expandedStates,
    generated: report.generatedStates,
    prunedDominated: report.prunedDominated,
    structuralStates: report.structuralStates,
    activeLabels: report.activeLabels,
    frontierPeak: report.frontierPeak,
    profile: report.profile
  };
  console.log(`TOWER_OPTIMIZE_PROFILE ${JSON.stringify(summary)}`);

  assert.equal(report.mode, 'optimize');
  assert.equal(report.exact, false, 'a bounded profile must not claim a global optimum');
  assert.ok(report.expandedStates >= 500);
  assert.ok(report.generatedStates > report.expandedStates);
  assert.ok(report.prunedDominated > 0);
  assert.ok(report.profile.generatedByAction.shop > 0);
});
