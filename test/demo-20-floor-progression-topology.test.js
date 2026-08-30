import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACT2_RELIC_CATALOG,
  ACT2_UNIT_CATALOG,
  DEMO20_PROGRESSION_TOPOLOGY,
  DEMO20_PROGRESSION_TOPOLOGY_ID,
  validateDemoTwentyFloorProgressionTopology
} from '../src/game/demo-20-floor-progression-topology.js';

test('Act II topology contract freezes a concentrated Boss cadence before values or maps exist', () => {
  const report = validateDemoTwentyFloorProgressionTopology();
  assert.equal(report.ok, true, report.violations.join(', '));
  assert.equal(DEMO20_PROGRESSION_TOPOLOGY.id, DEMO20_PROGRESSION_TOPOLOGY_ID);
  assert.deepEqual(DEMO20_PROGRESSION_TOPOLOGY.bosslessFloors, [11, 13, 15, 18]);
  assert.deepEqual(report.guardianIds[14], ['arcaneGatekeeper', 'spectrumMarshal', 'triuneArbiter']);
  assert.deepEqual(report.guardianIds[17], ['crownBlade', 'crownCantor', 'crownMagus']);
  assert.deepEqual(DEMO20_PROGRESSION_TOPOLOGY.floors[20].finalPhases, ['arcaneSovereign', 'originCore']);
});

test('Act II keeps optional guardian vaults separate from stair guardians and reserves one MP shop', () => {
  const { floors } = DEMO20_PROGRESSION_TOPOLOGY;
  assert.deepEqual(floors[12].exitGuardians, []);
  assert.deepEqual(floors[12].guardianGates.twinChordVault, ['resonanceBlade', 'resonanceCantor']);
  assert.deepEqual(floors[16].exitGuardians, []);
  assert.deepEqual(floors[16].guardianGates.mirrorReservoirVault, ['mirrorDuelist', 'mirrorCantor']);
  assert.deepEqual(DEMO20_PROGRESSION_TOPOLOGY.mpShopFloors, [15]);
  for (const floor of DEMO20_PROGRESSION_TOPOLOGY.mpShopFloors) {
    assert.ok(floors[floor].shops.includes('mpRestore'));
    assert.ok(floors[floor].shops.includes('maxMp'));
  }
});

test('Act II keys contain semantic units and relic roles but no premature balance numbers', () => {
  assert.ok(Object.keys(ACT2_UNIT_CATALOG).length >= 20);
  assert.equal(ACT2_UNIT_CATALOG.arcaneSovereign.kind, 'boss');
  assert.equal(ACT2_UNIT_CATALOG.originCore.floor, 20);
  for (const relic of Object.values(ACT2_RELIC_CATALOG)) {
    assert.equal(typeof relic.effectRole, 'string');
    for (const field of ['hp', 'atk', 'def', 'gold', 'mp', 'maxMp', 'price']) assert.equal(field in relic, false);
  }
});

test('Act II topology validator rejects a moved guardian before spatial or numeric work starts', () => {
  const changed = structuredClone(DEMO20_PROGRESSION_TOPOLOGY);
  changed.floors[17].exitGuardians.pop();
  const report = validateDemoTwentyFloorProgressionTopology(changed);
  assert.equal(report.ok, false);
  assert.ok(report.violations.includes('exit-guardian-group-f17'));
});
