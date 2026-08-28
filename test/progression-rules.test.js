import test from 'node:test';
import assert from 'node:assert/strict';

import { FLOORS } from '../src/game/data.js';
import {
  createInitialState,
  getTile,
  setTile,
  tryMove
} from '../src/game/engine.js';
import {
  areFloorExitGuardiansDefeated,
  getCardGateRequirements,
  getRemainingExitGuardianIds,
  recordDefeatedBoss
} from '../src/game/progression-rules.js';

function withFloorPatch(index, patch, fn) {
  const floor = FLOORS[index];
  const snapshot = {};
  for (const key of Object.keys(patch)) snapshot[key] = floor[key];
  Object.assign(floor, patch);
  try {
    return fn(floor);
  } finally {
    for (const key of Object.keys(patch)) {
      if (snapshot[key] === undefined) delete floor[key];
      else floor[key] = snapshot[key];
    }
  }
}

test('exit guardian rules support zero, one and grouped guardians', () => {
  const floorState = { defeatedBossIds: [], bossDefeated: false };
  assert.equal(areFloorExitGuardiansDefeated(floorState, {}), true, 'bossless floors should not be globally sealed');

  const floor = { boss: 'alpha', exitGuardians: ['alpha', 'beta'] };
  assert.deepEqual(getRemainingExitGuardianIds(floorState, floor), ['alpha', 'beta']);
  assert.deepEqual(recordDefeatedBoss(floorState, floor, 'alpha'), ['beta']);
  assert.equal(floorState.bossDefeated, false);
  assert.deepEqual(recordDefeatedBoss(floorState, floor, 'beta'), []);
  assert.equal(floorState.bossDefeated, true);
});

test('legacy tri gate remains a compatibility card gate', () => {
  assert.deepEqual(getCardGateRequirements({ puzzles: { triGate: 'tri' } }, 'tri'), {
    sun: 1,
    moon: 1,
    star: 1
  });
});

test('upper stairs require every configured exit guardian', () => {
  withFloorPatch(0, { exitGuardians: ['catBoss', 'foxBoss'] }, () => {
    const state = createInitialState();
    state.x = 1;
    state.y = 1;
    setTile(state, 2, 1, 'U');
    state.floorStates[0].defeatedBossIds = ['catBoss'];

    const blocked = tryMove(state, 1, 0);
    assert.equal(blocked.blocked, true);
    assert.deepEqual(blocked.remainingExitGuardians, ['foxBoss']);

    state.floorStates[0].defeatedBossIds.push('foxBoss');
    const opened = tryMove(state, 1, 0);
    assert.equal(opened.floorChanged, true);
    assert.equal(state.floor, 1);
  });
});

test('one card gate can open a wide multi-tile seal with a single payment', () => {
  withFloorPatch(0, { puzzles: { cardGates: { throne: { sun: 1 } } } }, () => {
    const state = createInitialState();
    state.x = 1;
    state.y = 1;
    setTile(state, 2, 1, 'gate:throne');
    setTile(state, 2, 2, 'gate:throne');
    setTile(state, 2, 3, 'gate:throne');

    let result = tryMove(state, 1, 0);
    assert.equal(result.blocked, true);
    assert.equal(state.cards.sun, 0);

    state.cards.sun = 1;
    result = tryMove(state, 1, 0);
    assert.equal(result.moved, true);
    assert.equal(state.cards.sun, 0);
    assert.equal(result.events[0].type, 'cardGate');
    assert.equal(result.events[0].opened, 3);
    assert.equal(getTile(state, 2, 1), '.');
    assert.equal(getTile(state, 2, 2), '.');
    assert.equal(getTile(state, 2, 3), '.');
  });
});

test('guardian gates can protect treasure rooms independently of the stairs', () => {
  withFloorPatch(0, { puzzles: { guardianGates: { vault: ['catBoss', 'foxBoss'] } } }, () => {
    const state = createInitialState();
    state.x = 1;
    state.y = 1;
    setTile(state, 2, 1, 'gate:vault');

    let result = tryMove(state, 1, 0);
    assert.equal(result.blocked, true);
    assert.deepEqual(result.missingGuardians, ['catBoss', 'foxBoss']);

    state.floorStates[0].defeatedBossIds = ['catBoss', 'foxBoss'];
    result = tryMove(state, 1, 0);
    assert.equal(result.moved, true);
    assert.equal(result.events[0].type, 'guardianGate');
  });
});
