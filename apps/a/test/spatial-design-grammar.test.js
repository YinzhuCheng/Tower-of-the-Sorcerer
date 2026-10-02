import test from 'node:test';
import assert from 'node:assert/strict';

import {
  analyzeFloorSpatialGrammar,
  analyzeTowerPressureGrammar
} from '../src/tuner/spatial-design-grammar.js';

function parseMap(text) {
  return text.trim().split('\n').map((row) => row.trim().split(/\s+/));
}

test('room grammar distinguishes open chambers from one-tile corridors', () => {
  const chamber = {
    number: 1,
    map: parseMap(`
      # # # # # # #
      # S . . . . #
      # # . . . . #
      # # . . . . #
      # # # # . U #
      # # # # # # #
    `)
  };
  const corridor = {
    number: 2,
    map: parseMap(`
      # # # # # # #
      # S . . # # #
      # # # . # # #
      # # # . . . #
      # # # # # U #
      # # # # # # #
    `)
  };

  const roomStats = analyzeFloorSpatialGrammar(chamber);
  const corridorStats = analyzeFloorSpatialGrammar(corridor);
  assert.ok(roomStats.meaningfulRoomCount >= 1);
  assert.ok(roomStats.roomCoreCoverage > 0.4);
  assert.ok(roomStats.chamberScore > corridorStats.chamberScore);
  assert.equal(corridorStats.roomCoreTiles, 0);
  assert.ok(corridorStats.corridorCoverage > roomStats.corridorCoverage);
});

test('reward-dense gated chambers are recognized as treasure vault candidates', () => {
  const floor = {
    number: 3,
    map: parseMap(`
      # # # # # # # #
      # S . gate:vault # # # #
      # # # . item:moon item:atk item:def #
      # # # . item:star item:weapon item:hpLarge #
      # # # . . . . #
      # # # # # # U #
      # # # # # # # #
    `)
  };
  const stats = analyzeFloorSpatialGrammar(floor);
  assert.ok(stats.treasureVaultCount >= 1);
  assert.ok(stats.rooms.some((room) => room.rewardValue >= 4));
});

test('pressure grammar rewards concentration rather than assuming one boss per floor', () => {
  const enemies = {
    a: { boss: true },
    b: { boss: true },
    c: { boss: true }
  };
  const floors = [
    { number: 1, map: parseMap('# # #\n# S U\n# # #') },
    { number: 2, exitGuardians: ['a', 'b'], map: parseMap('# # # #\n# enemy:a enemy:b U #\n# # # #') },
    { number: 3, map: parseMap('# # #\n# enemy:c U\n# # #') }
  ];
  const pressure = analyzeTowerPressureGrammar(floors, enemies);
  assert.equal(pressure.bosslessFloorCount, 1);
  assert.equal(pressure.multiBossFloorCount, 1);
  assert.equal(pressure.maxBossesOnFloor, 2);
  assert.deepEqual(pressure.perFloor[1].exitGuardians, ['a', 'b']);
});
