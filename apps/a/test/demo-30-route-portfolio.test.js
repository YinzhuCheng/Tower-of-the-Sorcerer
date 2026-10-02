import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEMO30_HANDOFF_DECISION_MATRIX_SPECS,
  summarizeAct3HandoffDecisionMatrix
} from '../src/tuner/demo-30-route-portfolio.js';

test('Act III decision matrix covers every charter and first-guardian pair', () => {
  assert.equal(DEMO30_HANDOFF_DECISION_MATRIX_SPECS.length, 9);
  assert.equal(new Set(DEMO30_HANDOFF_DECISION_MATRIX_SPECS.map((entry) => entry.id)).size, 9);
  assert.deepEqual(
    [...DEMO30_HANDOFF_DECISION_MATRIX_SPECS.filter((entry) => entry.charterId === 'audit').map((entry) => entry.handoffId)].sort(),
    ['beacon', 'escort', 'proofread']
  );
});

test('Act III decision matrix separates coverage, failed choices, and pressure margins', () => {
  const failedIndex = DEMO30_HANDOFF_DECISION_MATRIX_SPECS.findIndex((entry) => entry.id === 'audit-beacon');
  const entries = DEMO30_HANDOFF_DECISION_MATRIX_SPECS.map((entry, index) => ({
    ...entry,
    completed: index !== failedIndex,
    minNormalizedHpMargin: index === failedIndex ? null : (index + 1) / 100
  }));
  const report = summarizeAct3HandoffDecisionMatrix({ entries });

  assert.equal(report.expectedCells, 9);
  assert.equal(report.evaluatedCells, 9);
  assert.equal(report.coverageComplete, true);
  assert.equal(report.completedCells, 8);
  assert.equal(report.blockedCells, 1);
  assert.equal(report.minCompletedMargin, 0.01);
  assert.equal(report.maxCompletedMargin, 0.09);
  const auditEntries = entries.filter((entry) => entry.charterId === 'audit' && entry.completed);
  const beaconEntries = entries.filter((entry) => entry.handoffId === 'beacon' && entry.completed);
  assert.deepEqual(report.byCharter.find((entry) => entry.id === 'audit'), {
    id: 'audit', total: 3, completed: 2, blocked: 1,
    minCompletedMargin: Math.min(...auditEntries.map((entry) => entry.minNormalizedHpMargin)),
    maxCompletedMargin: Math.max(...auditEntries.map((entry) => entry.minNormalizedHpMargin))
  });
  assert.deepEqual(report.byHandoff.find((entry) => entry.id === 'beacon'), {
    id: 'beacon', total: 3, completed: 2, blocked: 1,
    minCompletedMargin: Math.min(...beaconEntries.map((entry) => entry.minNormalizedHpMargin)),
    maxCompletedMargin: Math.max(...beaconEntries.map((entry) => entry.minNormalizedHpMargin))
  });
});
