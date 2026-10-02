import test from 'node:test';
import assert from 'node:assert/strict';

import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { analyzeCardEconomy } from '../src/tuner/card-economy.js';

function createFixture() {
  const enemies = structuredClone(ENEMIES);
  const floors = structuredClone(FLOORS);
  const dialogues = structuredClone(DIALOGUES);
  applyDemoTenFloorContent({ enemies, floors, dialogues, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionTopology({ enemies, floors });
  applyDemoTenFloorSpatialRedesign({ floors, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionGrammar({ floors, enemies, dialogues });
  applyDemoTenFloorPalaceSpatialRedesign({ floors, gridSize: GRID_SIZE });
  return { floors };
}

test('10F room-card topology preserves card choices instead of stripping cards away', () => {
  const { floors } = createFixture();
  const economy = analyzeCardEconomy(floors);

  assert.deepEqual(economy.supply, { star: 18, moon: 14, sun: 1 });
  assert.deepEqual(economy.demand, { star: 9, moon: 10, sun: 1 });
  assert.deepEqual(economy.net, { star: 9, moon: 4, sun: 0 });

  // Star and Moon remain broad route resources, but more than half of each
  // campaign supply now has a declared door or card-gate use. Sun remains the
  // unique final permission rather than an ordinary-route consumable.
  assert.ok(economy.demand.star >= economy.supply.star / 2);
  assert.ok(economy.demand.moon > economy.supply.moon / 2);
  assert.equal(economy.demand.sun, economy.supply.sun);
});

test('each late campaign phase spends both ordinary card types on named paths', () => {
  const { floors } = createFixture();
  const economy = analyzeCardEconomy(floors);
  const byFloor = new Map(economy.perFloor.map((entry) => [entry.floor, entry]));

  const expectedDemand = new Map([
    [1, { star: 1, moon: 1 }],
    [3, { star: 1, moon: 1 }],
    [4, { star: 1, moon: 1 }],
    [5, { star: 1, moon: 1 }],
    [6, { star: 1, moon: 1 }],
    [7, { star: 2, moon: 2 }],
    [8, { star: 1, moon: 1 }],
    [9, { star: 1, moon: 1 }],
    [10, { star: 0, moon: 1, sun: 1 }]
  ]);

  for (const [floor, expected] of expectedDemand) {
    assert.deepEqual(byFloor.get(floor)?.demand, { star: 0, moon: 0, sun: 0, ...expected }, `F${floor}`);
  }
});
