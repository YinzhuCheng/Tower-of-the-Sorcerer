import test from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../src/solver/search.js';
import { replayTowerCertificate } from '../src/solver/replay.js';
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
  assert.ok(report.profile.structuralKeyChars.max < 1_600);
  assert.ok(report.profile.branching.max > 0);
  assert.ok(Object.keys(report.profile.expandedByStage).length > 0);
  assert.ok(report.profile.generatedByAction.teleport > 0, 'lazy teleport states are part of the current exact baseline');

  const stages = Object.values(report.profile.stageTelemetry);
  assert.ok(stages.length > 1, 'structural telemetry should span multiple floor/core stages');
  assert.ok(stages.every((stage) => Number.isInteger(stage.expanded) && stage.expanded >= 0));
  assert.ok(stages.every((stage) => Number.isInteger(stage.generated) && stage.generated >= 0));
  assert.ok(stages.every((stage) => Number.isInteger(stage.accepted) && stage.accepted >= 0));
  assert.ok(stages.every((stage) => Number.isInteger(stage.paretoFrontierPeak) && stage.paretoFrontierPeak >= 0));
  assert.ok(stages.some((stage) => stage.paretoFrontierPeak > 0));
  assert.ok(stages.some((stage) => stage.branching.samples > 0 && stage.branching.max > 0));

  assert.ok(report.certificate, 'existence profile should reach a real goal certificate');
  const replay = replayTowerCertificate(report.certificate, { adapter });
  assert.equal(replay.ok, true, JSON.stringify(replay.failures));
});
