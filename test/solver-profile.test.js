import test from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../src/solver/search.js';
import { replayTowerCertificate } from '../src/solver/replay.js';
import { createTowerSearchAdapter } from '../src/solver/tower-search-adapter.js';

test('Tower solver emits bounded eight-floor profiling telemetry', { timeout: 60_000 }, () => {
  const adapter = createTowerSearchAdapter();
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

  assert.match(report.stateEncoding, /^event-vector-v1\+travel-fold-v1$/);
  assert.ok(report.expandedStates > 50);
  assert.ok(report.profile.structuralKeyChars.max < 1_600);
  assert.ok(report.profile.branching.max > 0);
  assert.ok(Object.keys(report.profile.expandedByStage).length > 0);
  assert.equal(report.profile.generatedByAction.teleport, undefined, 'pure teleport edges must be folded');
  assert.ok(
    Object.keys(report.profile.generatedByAction).some((key) => key.startsWith('travel/')),
    'folded cross-floor macro events should be visible in telemetry'
  );
  assert.ok(report.certificate, 'existence profile should reach a real goal certificate');
  const replay = replayTowerCertificate(report.certificate, { adapter });
  assert.equal(replay.ok, true, JSON.stringify(replay.failures));
});
