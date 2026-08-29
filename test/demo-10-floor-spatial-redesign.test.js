import test from 'node:test';
import assert from 'node:assert/strict';

import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
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
  return { enemies, floors, dialogues };
}

function eventHistogram(map) {
  const result = {};
  for (const row of map) {
    for (const token of row) {
      if (token === '#' || token === '.') continue;
      result[token] = (result[token] ?? 0) + 1;
    }
  }
  return result;
}

function locate(map, wanted) {
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      if (map[y][x] === wanted) return { x, y };
    }
  }
  return null;
}

function isReachable(map, blockedToken = null) {
  const start = locate(map, 'S');
  const exit = locate(map, 'U');
  assert.ok(start);
  assert.ok(exit);
  const queue = [start];
  const seen = new Set([`${start.x},${start.y}`]);
  for (let head = 0; head < queue.length; head += 1) {
    const { x, y } = queue[head];
    if (x === exit.x && y === exit.y) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nextX = x + dx;
      const nextY = y + dy;
      const token = map[nextY]?.[nextX];
      const key = `${nextX},${nextY}`;
      if (token == null || token === '#' || token === blockedToken || seen.has(key)) continue;
      seen.add(key);
      queue.push({ x: nextX, y: nextY });
    }
  }
  return false;
}

test('F1 spatial redesign turns the tutorial maze into rooms without changing its event economy', () => {
  const fixture = createFixture();
  const floor = fixture.floors[0];
  const before = eventHistogram(floor.map);

  const result = applyDemoTenFloorSpatialRedesign({ floors: fixture.floors, gridSize: GRID_SIZE });
  const spatial = analyzeFloorSpatialGrammar(floor, { bossIds: ['catBoss'] });

  assert.equal(result.applied, true);
  assert.equal(floor.demoSpatialRedesignId, DEMO10_SPATIAL_REDESIGN_ID);
  assert.deepEqual(eventHistogram(floor.map), before);
  assert.ok(isReachable(floor.map));
  assert.equal(isReachable(floor.map, 'enemy:catBoss'), false, 'F1 exit must not bypass the boss.');
  assert.ok(spatial.meaningfulRoomCount >= 5, 'F1 should expose several readable rooms.');
  assert.ok(spatial.treasureVaultCount >= 2, 'optional rewards should live in visible side rooms.');
  assert.ok(spatial.junctionRoomCount >= 1, 'the shop should sit in a central connector room.');
});

test('F1 spatial redesign is idempotent after the room map is installed', () => {
  const fixture = createFixture();
  applyDemoTenFloorSpatialRedesign({ floors: fixture.floors, gridSize: GRID_SIZE });
  const firstMap = fixture.floors[0].map.map((row) => [...row]);
  const second = applyDemoTenFloorSpatialRedesign({ floors: fixture.floors, gridSize: GRID_SIZE });

  assert.equal(second.applied, false);
  assert.deepEqual(fixture.floors[0].map, firstMap);
});
