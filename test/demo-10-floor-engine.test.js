import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, RELIC_LABELS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });

const {
  cloneState,
  createInitialState,
  deserializeState,
  getShopEffectMultiplier,
  getShopOptions,
  getProgressPercent,
  serializeState,
  tryMove,
  validateStateShape,
  buyShopUpgrade
} = await import('../src/game/engine.js');
const { buildMapUnitHoverPreview } = await import('../src/game/tactical-interaction.js');

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

test('10F demo initial relics and tiered shops use source engine semantics', () => {
  const state = createInitialState();
  assert.deepEqual(state.relics, { codex: true, compass: true, lucky: false, ward: false, holy: false });
  assert.deepEqual(state.relicNames, [RELIC_LABELS.codex, RELIC_LABELS.compass]);
  assert.ok(!state.floorStates.some((floorState) => floorState.map.some((row) => row.includes('item:codex') || row.includes('item:compass'))));
  assert.deepEqual(deserializeState(serializeState(state)).relics, state.relics);
  assert.deepEqual(deserializeState(serializeState(state)).relicNames, state.relicNames);

  const shopEffect = (floorIndex, optionId) => {
    state.floor = floorIndex;
    return getShopOptions(state).find((option) => option.id === optionId).effect;
  };
  assert.equal(getShopEffectMultiplier({ ...state, floor: 1 }), 1, 'floors without a multiplier must remain at base value');
  assert.equal(getShopEffectMultiplier({ ...state, floor: 0 }), 1);
  assert.equal(getShopEffectMultiplier({ ...state, floor: 4 }), 1.15);
  assert.equal(getShopEffectMultiplier({ ...state, floor: 8 }), 1.3);
  assert.deepEqual(shopEffect(0, 'hp'), { hp: 900, maxHp: 900 });
  assert.deepEqual(shopEffect(4, 'atk'), { atk: 6 });
  assert.deepEqual(shopEffect(8, 'def'), { def: 7 });
  assert.deepEqual(shopEffect(8, 'hp'), { hp: 1170, maxHp: 1170 });

  state.floor = 4;
  state.stats.gold = 45;
  const purchase = buyShopUpgrade(state, 'atk');
  assert.equal(purchase.ok, true);
  assert.equal(state.stats.atk, 20, 'F5 purchase must apply the source-authoritative +6 effect');

  const shopY = state.floorStates[4].map.findIndex((row) => row.includes('shop'));
  const shopX = state.floorStates[4].map[shopY].indexOf('shop');
  const hover = buildMapUnitHoverPreview({ ...state, floor: 4 }, shopX, shopY);
  assert.equal(hover.kind, 'shop');
  assert.equal(hover.badge, '效率 +15%');
  assert.ok(hover.details.some((detail) => detail.value === '攻击永久 +6'));
});

test('10F topology applies distinct reward and stair guardian groups through the authoritative engine', () => {
  const state = createInitialState();

  state.floor = 1;
  state.x = 1;
  state.y = 3;
  let result = tryMove(state, 0, -1);
  assert.equal(result.blocked, true);
  assert.deepEqual(result.missingGuardians, ['catBoss', 'foxBoss']);

  state.floorStates[1].defeatedBossIds = ['catBoss', 'foxBoss'];
  result = tryMove(state, 0, -1);
  assert.equal(result.moved, true);
  assert.ok(result.events.some((event) => event.type === 'guardianGate'));

  state.floor = 4;
  state.x = 8;
  state.y = 1;
  state.floorStates[4].defeatedBossIds = ['whaleBoss'];
  result = tryMove(state, 1, 0);
  assert.equal(result.blocked, true);
  assert.deepEqual(result.remainingExitGuardians, ['swordBoss', 'dragonBoss']);

  state.floorStates[4].defeatedBossIds = ['whaleBoss', 'swordBoss', 'dragonBoss'];
  result = tryMove(state, 1, 0);
  assert.equal(result.floorChanged, true);
  assert.equal(state.floor, 5);

  state.floor = 6;
  state.x = 8;
  state.y = 1;
  state.floorStates[6].defeatedBossIds = ['astralBoss', 'shadowBoss', 'shadowWardBlade'];
  result = tryMove(state, 1, 0);
  assert.equal(result.blocked, true);
  assert.deepEqual(result.remainingExitGuardians, ['shadowWardCantor']);
});
