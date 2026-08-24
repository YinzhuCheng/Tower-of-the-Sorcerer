import test from 'node:test';
import assert from 'node:assert/strict';
import {
  downwardTeleportIsProductive,
  pruneEmptyCompassTargets
} from '../src/solver/tower-bounds.js';

function fakeTravelAdapter() {
  return {
    cloneState: (state) => ({ ...state, relics: { ...state.relics } }),
    applyAction: (state, action) => {
      if (action.kind === 'teleport') {
        state.floor = action.targetFloor;
        return { ok: true, state, steps: [] };
      }
      if (action.kind === 'tile' && action.token === 'U') {
        state.floor += 1;
        return { ok: true, state, steps: [] };
      }
      return { ok: false, state };
    },
    normalize: (state) => ({ state, steps: [] }),
    enumerateActions: (state) => {
      if (state.floor === 0) return [{ kind: 'tile', token: 'U' }];
      if (state.floor === 1) return [{ kind: 'shop' }, { kind: 'tile', token: 'U' }];
      if (state.floor === 2) return [{ kind: 'tile', token: 'U' }];
      return [];
    }
  };
}

test('productive teleport probe keeps remote events and drops pure travel loops', () => {
  const base = fakeTravelAdapter();
  const state = { floor: 3, relics: { compass: true } };
  const toFloor0 = { kind: 'teleport', targetFloor: 0, id: 'to0' };
  const toFloor1 = { kind: 'teleport', targetFloor: 1, id: 'to1' };
  const toFloor2 = { kind: 'teleport', targetFloor: 2, id: 'to2' };

  assert.equal(downwardTeleportIsProductive(base, state, toFloor0), true);
  assert.equal(downwardTeleportIsProductive(base, state, toFloor1), true);
  assert.equal(downwardTeleportIsProductive(base, state, toFloor2), false);

  const filtered = pruneEmptyCompassTargets(base, state, [
    toFloor0,
    toFloor1,
    toFloor2,
    { kind: 'tile', token: 'enemy:test', id: 'enemy' }
  ]);
  assert.deepEqual(filtered.map((action) => action.id), ['to0', 'to1', 'enemy']);
});

test('automatic closure makes a remote floor productive', () => {
  const base = fakeTravelAdapter();
  base.normalize = (state) => ({
    state,
    steps: state.floor === 2 ? [{ eventId: 'auto:item' }] : []
  });
  const state = { floor: 3, relics: { compass: true } };
  assert.equal(
    downwardTeleportIsProductive(base, state, { kind: 'teleport', targetFloor: 2 }),
    true
  );
});
