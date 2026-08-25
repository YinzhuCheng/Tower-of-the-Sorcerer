import test from 'node:test';
import assert from 'node:assert/strict';
import {
  replayTowerCertificate,
  replayTowerCertificateToState
} from '../src/solver/replay.js';
import { hashValue } from '../src/solver/state.js';

function fakeAdapter() {
  return {
    compactState: (state) => ({ ...state, stats: { ...state.stats } }),
    cloneState: (state) => ({ ...state, stats: { ...state.stats } }),
    materializeState: (state) => ({ ...state, stats: { ...state.stats } }),
    summarizeState: (state) => ({ node: state.node, floor: state.floor, stats: { ...state.stats } }),
    resources: (state) => ({ hp: state.stats.hp }),
    structuralKey: (state) => JSON.stringify({ node: state.node }),
    isGoal: (state) => state.node === 'bridge',
    objectiveValue: (state) => state.stats.hp
  };
}

function bridgeCertificate(initial) {
  return {
    initialStateHash: hashValue(fakeAdapter().summarizeState(initial)),
    steps: []
  };
}

test('certificate replay rejects the wrong bridge state before executing steps', () => {
  const adapter = fakeAdapter();
  const expected = { node: 'bridge', floor: 5, stats: { hp: 100 } };
  const wrong = { node: 'bridge', floor: 5, stats: { hp: 99 } };
  const replay = replayTowerCertificate(bridgeCertificate(expected), {
    adapter,
    initialState: wrong
  });
  assert.equal(replay.ok, false);
  assert.equal(replay.failures[0]?.reason, 'Certificate initial state hash mismatch.');
  assert.equal(replay.failures[0]?.index, -1);
});

test('validated bridge replay exposes an isolated exact continuation state', () => {
  const adapter = fakeAdapter();
  const initial = { node: 'bridge', floor: 5, stats: { hp: 100 } };
  const replay = replayTowerCertificateToState(bridgeCertificate(initial), {
    adapter,
    initialState: initial
  });
  assert.equal(replay.ok, true);
  assert.deepEqual(replay.state, initial);
  assert.notEqual(replay.state, initial);
  assert.notEqual(replay.state.stats, initial.stats);
  replay.state.stats.hp = 1;
  assert.equal(initial.stats.hp, 100);
});
