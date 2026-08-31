import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, calculateBattle } from '../src/game/engine.js';
import { ENEMIES } from '../src/game/data.js';
import {
  buildEnemyHoverPreview,
  buildMapUnitHoverPreview,
  getInteractionLinkCodesAt,
  guardianMarkerLabel,
  listGuardianMarkers,
  listInteractionMarkers
} from '../src/game/tactical-interaction.js';
import { FLOORS } from '../src/game/data.js';

test('enemy hover preview reuses authoritative battle calculation', () => {
  const state = createInitialState();
  const preview = buildEnemyHoverPreview(state, 'catScout');
  const expected = calculateBattle(state.stats, ENEMIES.catScout, state.relics);
  assert.ok(preview);
  assert.equal(preview.totalDamage, expected.totalDamage);
  assert.equal(preview.winnable, expected.winnable);
  assert.equal(preview.heroDamage, expected.heroDamage);
  assert.match(preview.damageText, /HP|无法破防/);
});

test('map hover explains hero, treasure, shop, card barrier and floor transfer units', () => {
  const state = createInitialState();

  const hero = buildMapUnitHoverPreview(state, state.x, state.y);
  assert.equal(hero.kind, 'hero');
  assert.match(hero.primaryValue, /HP/);

  const potion = buildMapUnitHoverPreview(state, 2, 1);
  assert.equal(potion.kind, 'item');
  assert.equal(potion.title, '微光药露');
  assert.match(potion.description, /生命/);

  const shop = buildMapUnitHoverPreview(state, 7, 7);
  assert.equal(shop.kind, 'shop');
  assert.equal(shop.primaryValue, '45 金币');
  assert.ok(shop.details.some((entry) => entry.label === '锋芒咏唱'));

  const door = buildMapUnitHoverPreview(state, 4, 9);
  assert.equal(door.kind, 'door');
  assert.equal(door.tone, 'warning');
  assert.match(door.primaryValue, /日曜卡/);

  const stairs = buildMapUnitHoverPreview(state, 9, 1);
  assert.equal(stairs.kind, 'stairs');
  assert.equal(stairs.tone, 'warning');
  assert.match(stairs.primaryValue, /第 2 阵/);
  assert.match(stairs.details[0].value, /守护者/);

  state.floor = 1;
  state.x = 1;
  state.y = 9;
  const occupiedDownStairs = buildMapUnitHoverPreview(state, state.x, state.y);
  assert.equal(occupiedDownStairs.kind, 'stairs');
  assert.match(occupiedDownStairs.primaryValue, /第 1 阵/);
});

test('map hover exposes switch progress, rune order and composite gate requirements', () => {
  const state = createInitialState();

  state.floor = 1;
  const switchPreview = buildMapUnitHoverPreview(state, 6, 3);
  assert.equal(switchPreview.kind, 'switch');
  assert.equal(switchPreview.primaryValue, '0 / 1');

  state.floor = 5;
  const runePreview = buildMapUnitHoverPreview(state, 7, 7);
  assert.equal(runePreview.kind, 'rune');
  assert.equal(runePreview.title, '新月符文');
  assert.equal(runePreview.tone, 'safe');
  assert.match(runePreview.description, /新月 → 半月 → 满月/);

  state.floor = 6;
  const triGate = buildMapUnitHoverPreview(state, 4, 2);
  assert.equal(triGate.kind, 'gate');
  assert.equal(triGate.title, '卡牌封锁结界');
  assert.match(triGate.primaryValue, /日曜卡/);
});

test('guardian labels distinguish ordinary bosses from the final guardian', () => {
  assert.equal(guardianMarkerLabel({ boss: false }), null);
  assert.equal(guardianMarkerLabel({ boss: true }), '结界守护者');
  assert.equal(guardianMarkerLabel({ boss: true, finalBoss: true }), '最终守护者');
});

test('current floor guardian marker follows the live mutable map', () => {
  const state = createInitialState();
  const markers = listGuardianMarkers(state);
  const catBoss = markers.find((marker) => marker.enemyId === 'catBoss');
  assert.ok(catBoss, 'first floor boss should be marked as a guardian');
  assert.equal(catBoss.label, '结界守护者');

  state.floorStates[state.floor].map[catBoss.y][catBoss.x] = '.';
  assert.equal(listGuardianMarkers(state).some((marker) => marker.enemyId === 'catBoss'), false);
});

test('shared map markers bind a guardian vault, its reward and a switch seal with short codes', () => {
  const state = createInitialState();
  state.floor = 1;
  const floor = FLOORS[state.floor];
  const originalPuzzles = floor.puzzles;
  const originalMap = state.floorStates[state.floor].map;
  const map = Array.from({ length: 11 }, () => Array(11).fill('.'));
  map[1][1] = 'enemy:catBoss';
  map[1][3] = 'enemy:foxBoss';
  map[2][1] = 'gate:dualKeyVault';
  map[0][1] = 'item:lucky';
  map[4][4] = 'switch:vine';
  map[3][4] = 'gate:vine';

  floor.puzzles = {
    switches: { vine: ['vine'] },
    guardianGates: { dualKeyVault: ['catBoss', 'foxBoss'] },
    visualLinks: { guardianRewards: { dualKeyVault: ['lucky'] } }
  };
  state.floorStates[state.floor].map = map;
  try {
    const markers = listInteractionMarkers(state);
    assert.ok(markers.some((marker) => marker.enemyId === 'catBoss' && marker.label === 'Ⅰ'));
    assert.ok(markers.some((marker) => marker.enemyId === 'foxBoss' && marker.label === 'Ⅰ'));
    assert.ok(markers.some((marker) => marker.kind === 'guardian-gate' && marker.label === 'Ⅰ · 0/2'));
    assert.ok(markers.some((marker) => marker.kind === 'guardian-reward' && marker.label === 'Ⅰ · 奖'));
    assert.ok(markers.some((marker) => marker.kind === 'switch' && marker.label === 'A'));
    assert.ok(markers.some((marker) => marker.kind === 'switch-gate' && marker.label === 'A · 0/1'));
    assert.deepEqual([...getInteractionLinkCodesAt(state, 1, 1)], ['Ⅰ']);
    assert.deepEqual([...getInteractionLinkCodesAt(state, 4, 4)], ['A']);

    const vault = buildMapUnitHoverPreview(state, 1, 2);
    assert.equal(vault.title, '招财星币宝库封印');
    assert.match(vault.description, /同编号守护者/);
    assert.ok(vault.details.some((entry) => entry.label === '关联奖励' && entry.value === '招财星币'));

    const switchPreview = buildMapUnitHoverPreview(state, 4, 4);
    assert.equal(switchPreview.title, '藤蔓机关');
    assert.ok(switchPreview.details.some((entry) => entry.value === 'A → 藤蔓封锁'));

    const gate = buildMapUnitHoverPreview(state, 4, 3);
    assert.equal(gate.title, '藤蔓封锁');
    assert.ok(gate.details.some((entry) => entry.value === 'A → 藤蔓机关'));
  } finally {
    floor.puzzles = originalPuzzles;
    state.floorStates[state.floor].map = originalMap;
  }
});
