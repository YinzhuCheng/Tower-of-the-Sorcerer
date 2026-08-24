import test from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../src/solver/search.js';
import { createTowerAdapter } from '../src/solver/tower-adapter.js';

test('Tower solver emits bounded eight-floor profiling telemetry', { timeout: 60_000 }, () => {
  const adapter = createTowerAdapter();
  const report = solve({
    adapter,
    mode: 'existence',
    maxExpanded: 5_000,
    maxGenerated: 80_000
  });

  const summary = {
    solvable: report.solvable,
    stoppedReason: report.stoppedReason,
    expanded: report.expandedStates,
    generated: report.generatedStates,
    structuralStates: report.structuralStates,
    activeLabels: report.activeLabels,
    frontierPeak: report.frontierPeak,
    profile: report.profile
  };
  console.log(`TOWER_SOLVER_PROFILE ${JSON.stringify(summary)}`);

  assert.equal(report.stateEncoding, 'event-vector-v1');
  assert.ok(report.expandedStates > 100);
  assert.ok(report.profile.structuralKeyChars.max < 1_200);
  assert.ok(report.profile.branching.max > 0);
  assert.ok(Object.keys(report.profile.expandedByStage).length > 0);
});
