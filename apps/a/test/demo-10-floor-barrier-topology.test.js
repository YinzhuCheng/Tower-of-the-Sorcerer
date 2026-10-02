import test from 'node:test';
import assert from 'node:assert/strict';

import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';

const DIRECTIONS = Object.freeze([[1, 0], [-1, 0], [0, 1], [0, -1]]);

function createFixture() {
  const enemies = structuredClone(ENEMIES);
  const floors = structuredClone(FLOORS);
  const dialogues = structuredClone(DIALOGUES);
  applyDemoTenFloorContent({ enemies, floors, dialogues, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionTopology({ enemies, floors });
  applyDemoTenFloorSpatialRedesign({ floors, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionGrammar({ floors, enemies, dialogues });
  applyDemoTenFloorPalaceSpatialRedesign({ floors, gridSize: GRID_SIZE });
  applyDemoTenFloorHardMode({ enemies });
  return { floors };
}

function isBarrier(token) {
  return /^(door|gate):/.test(String(token));
}

function findFloor(floors, number) {
  const floor = floors.find((entry) => entry.number === number);
  if (!floor) throw new Error(`Missing F${number}.`);
  return floor;
}

function findToken(floor, token) {
  for (let y = 0; y < floor.map.length; y += 1) {
    for (let x = 0; x < floor.map[y].length; x += 1) {
      if (floor.map[y][x] === token) return { x, y };
    }
  }
  throw new Error(`F${floor.number} is missing ${token}.`);
}

function openBarrier(floor, barrierToken) {
  for (let y = 0; y < floor.map.length; y += 1) {
    for (let x = 0; x < floor.map[y].length; x += 1) {
      if (floor.map[y][x] === barrierToken) floor.map[y][x] = '.';
    }
  }
}

function walkable(floor, x, y) {
  return x >= 0
    && y >= 0
    && y < floor.map.length
    && x < floor.map[0].length
    && floor.map[y][x] !== '#'
    && !isBarrier(floor.map[y][x]);
}

function entryPoint(floor) {
  for (const token of ['S', 'D']) {
    try {
      return findToken(floor, token);
    } catch {
      // F10 only has a down stair, and F1 only has a start; continue searching.
    }
  }
  throw new Error(`F${floor.number} has no entry point.`);
}

function reachableCells(floor) {
  const start = entryPoint(floor);
  const visited = new Set([`${start.x},${start.y}`]);
  const queue = [[start.x, start.y]];
  while (queue.length) {
    const [x, y] = queue.shift();
    for (const [dx, dy] of DIRECTIONS) {
      const nextX = x + dx;
      const nextY = y + dy;
      const key = `${nextX},${nextY}`;
      if (!walkable(floor, nextX, nextY) || visited.has(key)) continue;
      visited.add(key);
      queue.push([nextX, nextY]);
    }
  }
  return visited;
}

function isNonCombatTransit(token) {
  return token === 'S'
    || token === 'D'
    || token === '.'
    || token === 'shop'
    || String(token).startsWith('item:');
}

function nonCombatReachableCells(floor) {
  const start = entryPoint(floor);
  const visited = new Set([`${start.x},${start.y}`]);
  const queue = [[start.x, start.y]];
  while (queue.length) {
    const [x, y] = queue.shift();
    for (const [dx, dy] of DIRECTIONS) {
      const nextX = x + dx;
      const nextY = y + dy;
      const token = floor.map[nextY]?.[nextX];
      const key = `${nextX},${nextY}`;
      if (!isNonCombatTransit(token) || visited.has(key)) continue;
      visited.add(key);
      queue.push([nextX, nextY]);
    }
  }
  return visited;
}

function barrierNeighborComponents(floor) {
  const labels = new Map();
  let label = 0;
  for (let y = 0; y < floor.map.length; y += 1) {
    for (let x = 0; x < floor.map[y].length; x += 1) {
      const firstKey = `${x},${y}`;
      if (!walkable(floor, x, y) || labels.has(firstKey)) continue;
      const queue = [[x, y]];
      labels.set(firstKey, label);
      while (queue.length) {
        const [currentX, currentY] = queue.shift();
        for (const [dx, dy] of DIRECTIONS) {
          const nextX = currentX + dx;
          const nextY = currentY + dy;
          const key = `${nextX},${nextY}`;
          if (!walkable(floor, nextX, nextY) || labels.has(key)) continue;
          labels.set(key, label);
          queue.push([nextX, nextY]);
        }
      }
      label += 1;
    }
  }

  const report = [];
  for (let y = 0; y < floor.map.length; y += 1) {
    for (let x = 0; x < floor.map[y].length; x += 1) {
      const token = floor.map[y][x];
      if (!isBarrier(token)) continue;
      const neighbors = DIRECTIONS
        .map(([dx, dy]) => [x + dx, y + dy])
        .filter(([nextX, nextY]) => walkable(floor, nextX, nextY))
        .map(([nextX, nextY]) => labels.get(`${nextX},${nextY}`));
      report.push({ token, x, y, componentCount: new Set(neighbors).size });
    }
  }
  return report;
}

test('every remaining 10F visual barrier separates two distinct regions', () => {
  const { floors } = createFixture();
  const nonSeparating = floors.flatMap((floor) => barrierNeighborComponents(floor)
    .filter((barrier) => barrier.componentCount < 2)
    .map((barrier) => `F${floor.number}:${barrier.token}@${barrier.x},${barrier.y}`));
  assert.deepEqual(nonSeparating, []);
});

test('critical rooms, card costs and finale remain unreachable until their named barrier opens', () => {
  const protectedTargets = [
    [1, 'door:star', 'item:def', 4, 9],
    [1, 'door:moon', 'U', 9, 1],
    [2, 'gate:dualKeyVault', 'item:lucky', 1, 1],
    [3, 'door:star', 'switch:tideA', 2, 5],
    [3, 'door:moon', 'switch:tideB', 8, 5],
    [3, 'gate:tide', 'U', 5, 1],
    [4, 'door:moon', 'switch:forge', 3, 5],
    [4, 'gate:forge', 'item:weapon', 5, 1],
    [4, 'door:star', 'U', 9, 1],
    [5, 'gate:ember', 'item:shield', 2, 1],
    [5, 'door:star', 'enemy:whaleBoss', 1, 5],
    [5, 'door:moon', 'enemy:swordBoss', 9, 3],
    [6, 'gate:mirror', 'item:holy', 2, 1],
    [6, 'door:star', 'rune:C', 9, 6],
    [6, 'door:moon', 'U', 7, 1],
    [7, 'door:star', 'enemy:shadowWardBlade', 1, 4],
    [7, 'gate:tri', 'item:ward', 5, 5],
    [7, 'door:moon', 'enemy:shadowWardCantor', 9, 4],
    [8, 'door:star', 'switch:hushB', 4, 7],
    [8, 'door:moon', 'switch:hushA', 8, 7],
    [8, 'gate:hush', 'item:hpLarge', 5, 1],
    [8, 'gate:hush', 'enemy:palaceWarden', 8, 1],
    [8, 'gate:hushVault', 'item:dual', 9, 9],
    [9, 'gate:blackstar', 'item:dual', 3, 1],
    [9, 'door:star', 'rune:C', 3, 7],
    [9, 'door:moon', 'rune:B', 8, 7],
    [9, 'gate:blackstar', 'enemy:blackSealKeeper', 8, 1],
    [10, 'door:moon', 'item:dual', 4, 7],
    [10, 'gate:throneSeal', 'enemy:finalQueen', 5, 1]
  ];

  for (const [number, barrier, target, x, y] of protectedTargets) {
    const { floors } = createFixture();
    const floor = findFloor(floors, number);
    assert.equal(floor.map[y][x], target, `F${number} target position must remain stable.`);
    assert.equal(
      reachableCells(floor).has(`${x},${y}`),
      false,
      `F${number} must keep ${target} behind ${barrier}.`
    );
    openBarrier(floor, barrier);
    assert.equal(
      reachableCells(floor).has(`${x},${y}`),
      true,
      `F${number} must make ${target} reachable when ${barrier} opens.`
    );
  }
});

test('the sole Act I shop is reachable from F5 entry without paying a combat or gate tax', () => {
  const { floors } = createFixture();
  const floor = findFloor(floors, 5);
  const shop = findToken(floor, 'shop');
  assert.ok(
    nonCombatReachableCells(floor).has(`${shop.x},${shop.y}`),
    'F5 shop must be a genuine conversion checkpoint, not an enemy-gated rescue loop.'
  );
});
