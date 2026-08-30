import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEMO20_SPATIAL_TOPOLOGY,
  DEMO20_SPATIAL_TOPOLOGY_ID,
  validateDemoTwentyFloorSpatialTopology
} from '../src/game/demo-20-floor-spatial-topology.js';

function floor(number) {
  const result = DEMO20_SPATIAL_TOPOLOGY.floors.find((entry) => entry.number === number);
  assert.ok(result, `Missing F${number}.`);
  return result;
}

function hasToken(number, token) {
  return floor(number).map.some((row) => row.includes(token));
}

test('Act II room maps pass the topology-only gate before combat and economy values exist', () => {
  const report = validateDemoTwentyFloorSpatialTopology();
  assert.equal(report.ok, true, report.violations.join(', '));
  assert.equal(report.id, DEMO20_SPATIAL_TOPOLOGY_ID);
  assert.equal(DEMO20_SPATIAL_TOPOLOGY.floors.length, 10);

  const plans = DEMO20_SPATIAL_TOPOLOGY.floors.map((entry) => entry.roomPlan.join('|'));
  assert.equal(new Set(plans).size, 10, 'each Act II floor needs its own room grammar');
  for (const current of DEMO20_SPATIAL_TOPOLOGY.floors) {
    assert.equal(current.map.length, 11, `F${current.number}`);
    assert.ok(current.map.every((row) => row.length === 11), `F${current.number}`);
    assert.ok(current.roomPlan.length >= 5, `F${current.number}`);
  }
});

test('Act II uses true gate cuts for every paid card branch and every Boss seal', () => {
  const report = validateDemoTwentyFloorSpatialTopology();
  assert.equal(report.cardTopology.valid, true, report.cardTopology.violations.join(', '));
  assert.ok(report.cardTopology.barriers.length >= 8);
  assert.ok(report.cardTopology.barriers.every((barrier) => barrier.utilityAnchors.length > 0));
  assert.ok(report.cardTopology.ledger.states.every((state) => state.viable));
  assert.deepEqual(report.cardTopology.ledger.final, { star: 4, moon: 7, sun: 0 });
});

test('Act II fixes concentrated guardian cadence, MP relic anchors, and the lone F15 shop', () => {
  assert.deepEqual(
    DEMO20_SPATIAL_TOPOLOGY.floors.filter((entry) => entry.map.some((row) => row.includes('shop'))).map((entry) => entry.number),
    [15]
  );
  for (const [number, units] of [
    [12, ['resonanceBlade', 'resonanceCantor']],
    [14, ['arcaneGatekeeper', 'spectrumMarshal', 'triuneArbiter']],
    [16, ['mirrorDuelist', 'mirrorCantor']],
    [17, ['crownBlade', 'crownCantor', 'crownMagus']],
    [19, ['echoRegent']],
    [20, ['arcaneSovereign', 'originCore']]
  ]) {
    for (const id of units) assert.equal(hasToken(number, `enemy:${id}`), true, `F${number}:${id}`);
  }
  for (const [number, relic] of [
    [11, 'manaFlask'], [12, 'aetherPrism'], [13, 'conduitCodex'], [15, 'arcaneBattery'],
    [16, 'mirrorReservoir'], [17, 'crownCapacitor'], [19, 'originFocus']
  ]) assert.equal(hasToken(number, `item:${relic}`), true, `F${number}:${relic}`);
});

test('spatial maps remain semantic: no numeric balance fields are introduced', () => {
  const serialized = JSON.stringify(DEMO20_SPATIAL_TOPOLOGY);
  for (const field of ['"hp"', '"atk"', '"def"', '"gold"', '"price"', '"maxMp"']) {
    assert.equal(serialized.includes(field), false, field);
  }
});
