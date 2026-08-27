import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });

const {
  cloneState,
  createInitialState,
  deserializeState,
  getProgressPercent,
  serializeState,
  validateStateShape
} = await import('../src/game/engine.js');

test('10F browser content creates an authoritative engine state with ten floor states', () => {
  const state = createInitialState();
  assert.equal(FLOORS.length, 10);
  assert.equal(state.floorStates.length, 10);
  assert.equal(validateStateShape(state), true);
  assert.equal(getProgressPercent({ ...state, cores: 7 }), 100);
});

test('10F demo save data round-trips and rejects an old eight-floor shape', () => {
  const state = createInitialState();
  state.stats.gold = 777;
  const loaded = deserializeState(serializeState(state));
  assert.equal(loaded.floorStates.length, 10);
  assert.equal(loaded.stats.gold, 777);

  const oldShape = cloneState(state);
  oldShape.floorStates = oldShape.floorStates.slice(0, 8);
  assert.equal(validateStateShape(oldShape), false);
  assert.throws(() => deserializeState(serializeState(oldShape)), /存档版本不兼容|内容损坏/);
});
