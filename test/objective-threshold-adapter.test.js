import test from 'node:test';
import assert from 'node:assert/strict';
import { createObjectiveThresholdAdapter } from '../src/solver/objective-threshold-adapter.js';

function baseAdapter() {
  const actions = [{ kind: 'tile', eventId: 'x' }];
  return {
    enumerateActions: () => actions,
    objectiveValue: (state) => state.value,
    objectiveUpperBound: (state) => state.upper,
    isGoal: (state) => Boolean(state.goal),
    provenDeadEnd: (state) => Boolean(state.baseDead),
    stageKey: () => 'base-stage',
    rulesVersion: () => 'base-v1'
  };
}

test('threshold goal requires a real base goal strictly above the reference', () => {
  const adapter = createObjectiveThresholdAdapter({ threshold: 100, baseAdapter: baseAdapter() });
  assert.equal(adapter.isGoal({ goal: true, value: 101 }), true);
  assert.equal(adapter.isGoal({ goal: true, value: 100 }), false);
  assert.equal(adapter.isGoal({ goal: false, value: 1000 }), false);
});

test('admissible upper bound proves states at or below threshold cannot be exploits', () => {
  const adapter = createObjectiveThresholdAdapter({ threshold: 100, baseAdapter: baseAdapter() });
  assert.equal(adapter.provenDeadEnd({ upper: 100 }), true);
  assert.equal(adapter.provenDeadEnd({ upper: 99 }), true);
  assert.equal(adapter.provenDeadEnd({ upper: 101 }), false);
  assert.equal(adapter.provenDeadEnd({ upper: Number.POSITIVE_INFINITY }), false);
  assert.equal(adapter.provenDeadEnd({ upper: 1000, baseDead: true }), true);
});

test('threshold wrapper preserves the base transition/action surface', () => {
  const base = baseAdapter();
  const adapter = createObjectiveThresholdAdapter({ threshold: 100, baseAdapter: base });
  const actions = adapter.enumerateActions({});
  assert.equal(actions, base.enumerateActions());
  assert.equal(adapter.stageKey({}), 'base-stage/objective>100');
  assert.match(adapter.rulesVersion(), /objective-threshold:>100/);
});

test('threshold wrapper refuses to make proof claims without an upper bound', () => {
  assert.throws(() => createObjectiveThresholdAdapter({
    threshold: 100,
    baseAdapter: { objectiveValue: () => 0 }
  }), /objectiveUpperBound/);
});
