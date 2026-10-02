import assert from 'node:assert/strict';
import test from 'node:test';
import { rankActionsByStrategicIntuition, summarizeStrategicDecision } from '../src/solver/decision-intuition.js';
import { solve } from '../src/solver/search.js';

function adapter() {
  return {
    resourceFields: ['hp', 'gold', 'sun', 'moon', 'star'],
    createInitialState: () => ({ node: 'start', hp: 100, gold: 50, sun: 1, moon: 1, star: 0 }),
    cloneState: (state) => ({ ...state }),
    resources: (state) => ({ hp: state.hp, gold: state.gold, sun: state.sun, moon: state.moon, star: state.star }),
    structuralKey: (state) => state.node,
    summarizeState: (state) => ({ ...state }),
    enumerateActions: (state) => state.node === 'start'
      ? [
          { kind: 'tile', eventId: 'battle', token: 'enemy:guard', parsed: { type: 'enemy', id: 'guard' } },
          { kind: 'charter', eventId: 'commit' }
        ]
      : [],
    applyAction: (state, action) => {
      if (state.node !== 'start') return { ok: false, reason: 'finished' };
      if (action.eventId === 'battle') return { ok: true, state: { ...state, node: 'battle', hp: 70 }, steps: [] };
      if (action.eventId === 'commit') return { ok: true, state: { ...state, node: 'goal', moon: 0 }, steps: [] };
      return { ok: false, reason: 'unknown' };
    },
    isGoal: (state) => state.node === 'goal',
    priority: (state) => state.node === 'goal' ? 10 : 0
  };
}

test('strategic intuition previews legal branches but keeps every action', () => {
  const subject = adapter();
  const state = subject.createInitialState();
  const ranked = rankActionsByStrategicIntuition({ adapter: subject, state, actions: subject.enumerateActions(state) });
  assert.equal(ranked.length, 2);
  assert.equal(ranked[0].action.eventId, 'commit');
  assert.ok(ranked.every((entry) => entry.previewed));
  assert.equal(ranked.find((entry) => entry.action.eventId === 'battle').spend.hp, 30);
  const note = summarizeStrategicDecision(ranked);
  assert.equal(note.selectedEventId, 'commit');
  assert.equal(note.alternatives.length, 2);
  assert.equal(note.critical, true);
  assert.equal(note.criticalReason, '不可逆路线承诺');
});

test('strategic action ordering remains a proof-safe ordering hint', () => {
  const report = solve({
    adapter: adapter(),
    mode: 'existence',
    actionOrdering: 'strategic-intuition',
    maxExpanded: 10,
    maxGenerated: 20
  });
  assert.equal(report.solvable, true);
  assert.equal(report.actionOrdering.mode, 'strategic-intuition');
  assert.ok(report.actionOrdering.previewedActions >= 2);
  assert.equal(report.actionOrdering.proofRole, 'ordering-only');
});
