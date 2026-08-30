import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyDemoTenFloorProgressionTopology,
  DEMO10_PROGRESSION_TOPOLOGY,
  DEMO10_PROGRESSION_TOPOLOGY_ID,
  DEMO10_ACT_I_SHOP_FLOORS,
  coreBearerIdsByFloor,
  validateDemoTenFloorProgressionTopology
} from '../src/game/demo-10-floor-progression-topology.js';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';

function createFixture() {
  const enemies = structuredClone(ENEMIES);
  const floors = structuredClone(FLOORS);
  const dialogues = structuredClone(DIALOGUES);
  applyDemoTenFloorContent({ enemies, floors, dialogues, gridSize: GRID_SIZE });
  return { enemies, floors, dialogues };
}

test('10F topology lock clusters cores and reserves true bossless floors', () => {
  const report = validateDemoTenFloorProgressionTopology();

  assert.equal(report.ok, true, report.violations.join(', '));
  assert.equal(DEMO10_PROGRESSION_TOPOLOGY.id, DEMO10_PROGRESSION_TOPOLOGY_ID);
  assert.deepEqual(coreBearerIdsByFloor(), {
    2: ['catBoss', 'foxBoss'],
    5: ['whaleBoss', 'swordBoss', 'dragonBoss'],
    7: ['astralBoss', 'shadowBoss']
  });
  assert.deepEqual(DEMO10_PROGRESSION_TOPOLOGY.bosslessFloors, [1, 3, 4, 6]);
  assert.deepEqual(DEMO10_ACT_I_SHOP_FLOORS, [5]);
});

test('10F topology lock distinguishes reward groups from stair groups', () => {
  const { floors } = DEMO10_PROGRESSION_TOPOLOGY;

  assert.deepEqual(floors[2].exitGuardians, []);
  assert.deepEqual(floors[2].guardianGates.dualKeyVault, ['catBoss', 'foxBoss']);
  assert.deepEqual(floors[5].exitGuardians, ['whaleBoss', 'swordBoss', 'dragonBoss']);
  assert.deepEqual(floors[7].exitGuardians, ['astralBoss', 'shadowBoss', 'shadowWardBlade', 'shadowWardCantor']);
  assert.deepEqual(floors[8].exitGuardians, ['palaceWarden']);
  assert.deepEqual(floors[8].guardianGates.hushVault, ['hushVaultBlade', 'hushVaultCantor']);
});

test('topology validator rejects a changed guardian group before map or numeric work starts', () => {
  const changed = structuredClone(DEMO10_PROGRESSION_TOPOLOGY);
  changed.floors[7].exitGuardians.pop();

  const report = validateDemoTenFloorProgressionTopology(changed);
  assert.equal(report.ok, false);
  assert.ok(report.violations.includes('exit-guardian-group-f7'));
});

test('topology validator rejects any extra Act I conversion node', () => {
  const changed = structuredClone(DEMO10_PROGRESSION_TOPOLOGY);
  changed.shopFloors.push(9);

  const report = validateDemoTenFloorProgressionTopology(changed);
  assert.equal(report.ok, false);
  assert.ok(report.violations.includes('act-i-shop-floor-set'));
});

test('demo topology overlay assigns multi-guardian stair groups without touching the 8F baseline', () => {
  const fixture = createFixture();
  const result = applyDemoTenFloorProgressionTopology(fixture);
  const byFloor = Object.fromEntries(fixture.floors.map((floor) => [floor.number, floor]));

  assert.equal(result.applied, true);
  assert.deepEqual(byFloor[1].exitGuardians, []);
  assert.deepEqual(byFloor[2].puzzles.guardianGates.dualKeyVault, ['catBoss', 'foxBoss']);
  assert.deepEqual(byFloor[5].exitGuardians, ['whaleBoss', 'swordBoss', 'dragonBoss']);
  assert.deepEqual(byFloor[7].exitGuardians, ['astralBoss', 'shadowBoss', 'shadowWardBlade', 'shadowWardCantor']);
  assert.equal(fixture.enemies.catBoss.floor, 2);
  assert.equal(fixture.enemies.whaleBoss.floor, 5);
  assert.equal(fixture.enemies.astralBoss.floor, 7);
  assert.equal(fixture.enemies.shadowWardBlade.boss, true);
  assert.equal(fixture.enemies.shadowWardCantor.boss, true);
  assert.equal(FLOORS[0].boss, 'catBoss', 'canonical eight-floor data must remain unchanged.');

  assert.equal(applyDemoTenFloorProgressionTopology(fixture).applied, false);
});
