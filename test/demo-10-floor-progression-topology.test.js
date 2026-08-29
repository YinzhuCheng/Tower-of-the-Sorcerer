import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEMO10_PROGRESSION_TOPOLOGY,
  DEMO10_PROGRESSION_TOPOLOGY_ID,
  coreBearerIdsByFloor,
  validateDemoTenFloorProgressionTopology
} from '../src/game/demo-10-floor-progression-topology.js';

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
