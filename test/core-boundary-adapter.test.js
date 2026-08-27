import test from 'node:test';
import assert from 'node:assert/strict';
import { createCoreBoundaryAdapter } from '../src/solver/core-boundary-adapter.js';

test('core boundary adapter changes only goal/stage semantics', () => {
  const actions = [{ kind: 'tile', eventId: 'x' }];
  const base = {
    enumerateActions: () => actions,
    applyAction: () => ({ ok: true }),
    cloneState: (state) => ({ ...state }),
    resources: (state) => ({ hp: state.hp }),
    structuralKey: () => 'k',
    isGoal: () => false,
    stageKey: (state) => `f${state.floor + 1}/c${state.cores}`,
    rulesVersion: () => 'fake-v1'
  };
  const adapter = createCoreBoundaryAdapter({ targetCores: 7, baseAdapter: base });

  assert.equal(adapter.enumerateActions({ cores: 6 }), actions);
  assert.equal(adapter.isGoal({ cores: 6 }), false);
  assert.equal(adapter.isGoal({ cores: 7 }), true);
  assert.equal(adapter.isGoal({ cores: 8 }), true);
  assert.equal(adapter.stageKey({ floor: 6, cores: 6 }), 'f7/c6/boundary:c7');
  assert.equal(adapter.rulesVersion(), 'fake-v1+core-boundary:7');
});

test('core boundary adapter rejects invalid targets', () => {
  assert.throws(() => createCoreBoundaryAdapter({ targetCores: 0, baseAdapter: {} }), /positive integer/);
});
