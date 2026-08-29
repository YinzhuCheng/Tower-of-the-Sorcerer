import test from 'node:test';
import assert from 'node:assert/strict';

import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import {
  applyDemoTenFloorSpatialRedesign,
  DEMO10_SPATIAL_REDESIGN_ID
} from '../src/game/demo-10-floor-spatial-redesign.js';
import { analyzeFloorSpatialGrammar } from '../src/tuner/spatial-design-grammar.js';

function createFixture() {
  const enemies = structuredClone(ENEMIES);
  const floors = structuredClone(FLOORS);
  const dialogues = structuredClone(DIALOGUES);
  applyDemoTenFloorContent({ enemies, floors, dialogues, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionTopology({ enemies, floors });
  return { enemies, floors, dialogues };
}

function hasToken(floor, token) {
  return floor.map.some((row) => row.includes(token));
}

function floor(floors, number) {
  return floors.find((entry) => entry.number === number);
}

test('room redesign materializes the locked boss cadence across F1–F7', () => {
  const fixture = createFixture();
  const result = applyDemoTenFloorSpatialRedesign({ floors: fixture.floors, gridSize: GRID_SIZE });

  assert.equal(result.applied, true);
  for (const floorNumber of [1, 2, 3, 4, 5, 6, 7]) {
    const current = floor(fixture.floors, floorNumber);
    assert.equal(current.demoSpatialRedesignId, DEMO10_SPATIAL_REDESIGN_ID);
    assert.equal(current.map.length, GRID_SIZE);
    assert.ok(current.map.every((row) => row.length === GRID_SIZE));
    assert.equal(current.roomPlan.length, 5);
  }

  const f1 = floor(fixture.floors, 1);
  assert.deepEqual(f1.exitGuardians, []);
  assert.equal(hasToken(f1, 'enemy:catBoss'), false);
  assert.ok(hasToken(f1, 'shop'));

  const f2 = floor(fixture.floors, 2);
  assert.deepEqual(f2.exitGuardians, []);
  for (const token of ['enemy:catBoss', 'enemy:foxBoss', 'gate:dualKeyVault', 'item:lucky']) {
    assert.ok(hasToken(f2, token), `F2 must contain ${token}`);
  }

  const f5 = floor(fixture.floors, 5);
  assert.deepEqual(f5.exitGuardians, ['whaleBoss', 'swordBoss', 'dragonBoss']);
  for (const token of ['enemy:whaleBoss', 'enemy:swordBoss', 'enemy:dragonBoss', 'shop']) {
    assert.ok(hasToken(f5, token), `F5 must contain ${token}`);
  }

  const f7 = floor(fixture.floors, 7);
  assert.deepEqual(f7.exitGuardians, ['astralBoss', 'shadowBoss', 'shadowWardBlade', 'shadowWardCantor']);
  for (const token of ['enemy:astralBoss', 'enemy:shadowBoss', 'enemy:shadowWardBlade', 'enemy:shadowWardCantor']) {
    assert.ok(hasToken(f7, token), `F7 must contain ${token}`);
  }
});

test('room redesign produces named chambers instead of a shared maze template', () => {
  const fixture = createFixture();
  applyDemoTenFloorSpatialRedesign({ floors: fixture.floors, gridSize: GRID_SIZE });

  const plans = [1, 2, 3, 4, 5, 6, 7].map((number) => floor(fixture.floors, number).roomPlan.join('|'));
  assert.equal(new Set(plans).size, 7, 'each redesigned floor needs its own readable spatial role.');

  const f2Spatial = analyzeFloorSpatialGrammar(floor(fixture.floors, 2), { bossIds: ['catBoss', 'foxBoss'] });
  assert.ok(f2Spatial.meaningfulRoomCount >= 1);
});

test('topology-locked room redesign is idempotent', () => {
  const fixture = createFixture();
  applyDemoTenFloorSpatialRedesign({ floors: fixture.floors, gridSize: GRID_SIZE });
  const firstMaps = fixture.floors.slice(0, 7).map((entry) => entry.map.map((row) => [...row]));
  const second = applyDemoTenFloorSpatialRedesign({ floors: fixture.floors, gridSize: GRID_SIZE });

  assert.equal(second.applied, false);
  assert.deepEqual(fixture.floors.slice(0, 7).map((entry) => entry.map), firstMaps);
});
