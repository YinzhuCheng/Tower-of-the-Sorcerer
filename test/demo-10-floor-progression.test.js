import test from 'node:test';
import assert from 'node:assert/strict';

import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import {
  applyDemoTenFloorProgressionGrammar,
  DEMO10_F8_VAULT_GUARDIANS,
  DEMO10_F8_VAULT_ID,
  DEMO10_FINAL_SUN_SEAL_ID
} from '../src/game/demo-10-floor-progression.js';
import { validateDemoTenFloorCardHierarchy } from '../src/tuner/card-economy.js';

function createFixture() {
  const enemies = structuredClone(ENEMIES);
  const floors = structuredClone(FLOORS);
  const dialogues = structuredClone(DIALOGUES);
  applyDemoTenFloorContent({ enemies, floors, dialogues, gridSize: GRID_SIZE });
  return { enemies, floors, dialogues };
}

function tokens(floors, wanted) {
  const hits = [];
  for (const floor of floors) {
    for (let y = 0; y < floor.map.length; y += 1) {
      for (let x = 0; x < floor.map[y].length; x += 1) {
        if (floor.map[y][x] === wanted) hits.push({ floor: floor.number, x, y });
      }
    }
  }
  return hits;
}

function reachableWithoutSeal(floor, startToken, targetToken, sealId) {
  let start = null;
  let target = null;
  for (let y = 0; y < floor.map.length; y += 1) {
    for (let x = 0; x < floor.map[y].length; x += 1) {
      if (floor.map[y][x] === startToken) start = { x, y };
      if (floor.map[y][x] === targetToken) target = { x, y };
    }
  }
  assert.ok(start);
  assert.ok(target);
  const queue = [start];
  const seen = new Set([`${start.x},${start.y}`]);
  for (let head = 0; head < queue.length; head += 1) {
    const current = queue[head];
    if (current.x === target.x && current.y === target.y) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = current.x + dx;
      const y = current.y + dy;
      const token = floor.map[y]?.[x];
      const key = `${x},${y}`;
      if (seen.has(key) || token == null || token === '#' || token === `gate:${sealId}`) continue;
      seen.add(key);
      queue.push({ x, y });
    }
  }
  return false;
}

test('10F demo progression enforces Star > Moon > one Sun and reserves Sun for the throne', () => {
  const fixture = createFixture();
  const report = applyDemoTenFloorProgressionGrammar(fixture);
  const hierarchy = validateDemoTenFloorCardHierarchy(fixture.floors);

  assert.equal(hierarchy.valid, true, hierarchy.violations.join(','));
  assert.equal(report.supply.sun, 1);
  assert.ok(report.supply.star > report.supply.moon);
  assert.ok(report.supply.moon > report.supply.sun);
  assert.deepEqual(tokens(fixture.floors, 'item:sun'), [report.uniqueSunLocation]);
  assert.equal(report.uniqueSunLocation.floor, 9, 'the unique Sun permission should appear late, before the throne');
  assert.equal(tokens(fixture.floors, 'door:sun').length, 0, 'Sun must not be consumed by ordinary doors');
});

test('F7 becomes a Moon+Star strategic gate instead of consuming the unique Sun card', () => {
  const fixture = createFixture();
  applyDemoTenFloorProgressionGrammar(fixture);
  const floor7 = fixture.floors.find((floor) => floor.number === 7);
  assert.ok(floor7);
  assert.equal(floor7.puzzles.triGate, undefined);
  assert.deepEqual(floor7.puzzles.cardGates.tri, { moon: 1, star: 1 });
});

test('F8 uses two optional guardians to protect a real reward chamber without locking the stairs', () => {
  const fixture = createFixture();
  const report = applyDemoTenFloorProgressionGrammar(fixture);
  const floor8 = fixture.floors.find((floor) => floor.number === 8);

  assert.ok(floor8);
  assert.equal(report.guardianVault.gateId, DEMO10_F8_VAULT_ID);
  assert.deepEqual(report.guardianVault.guardians, DEMO10_F8_VAULT_GUARDIANS);
  assert.equal(new Set(DEMO10_F8_VAULT_GUARDIANS).size, 2, 'vault guardians must have distinct semantic ids');
  assert.deepEqual(floor8.puzzles.guardianGates[DEMO10_F8_VAULT_ID], [...DEMO10_F8_VAULT_GUARDIANS]);
  assert.equal(tokens([floor8], `gate:${DEMO10_F8_VAULT_ID}`).length, 2, 'the chamber should read as a wide synchronized seal');
  for (const enemyId of DEMO10_F8_VAULT_GUARDIANS) assert.equal(fixture.enemies[enemyId].boss, true);
  assert.equal(floor8.boss, 'palaceWarden', 'optional vault guardians must not become stair guardians');
  assert.equal(reachableWithoutSeal(floor8, 'D', 'U', DEMO10_F8_VAULT_ID), true, 'main route must remain available when the vault is treated as closed');
  assert.deepEqual(
    report.guardianVault.rewardTiles.map(({ x, y }) => floor8.map[y][x]).sort(),
    ['item:def', 'item:hp', 'item:moon', 'item:star'].sort()
  );
});

test('F10 uses one Sun payment to unlock a multi-tile audience seal around the visible final boss', () => {
  const fixture = createFixture();
  const beforeRewardCount = fixture.floors[9].map.flat().filter((token) => String(token).startsWith('item:')).length;
  const report = applyDemoTenFloorProgressionGrammar(fixture);
  const floor10 = fixture.floors.find((floor) => floor.number === 10);
  const sealTiles = tokens(fixture.floors, `gate:${DEMO10_FINAL_SUN_SEAL_ID}`).filter((entry) => entry.floor === 10);
  const afterRewardCount = floor10.map.flat().filter((token) => String(token).startsWith('item:')).length;

  assert.equal(report.throneSeal.encounter.enemyId, 'finalQueen');
  assert.ok(sealTiles.length >= 2, 'final encounter should read as a spatial seal, not a single ordinary door');
  assert.deepEqual(floor10.puzzles.cardGates[DEMO10_FINAL_SUN_SEAL_ID], { sun: 1 });
  assert.equal(afterRewardCount, beforeRewardCount, 'installing the seal must relocate, not delete, adjacent rewards');
  assert.equal(reachableWithoutSeal(floor10, 'D', 'enemy:finalQueen', DEMO10_FINAL_SUN_SEAL_ID), false);
});
