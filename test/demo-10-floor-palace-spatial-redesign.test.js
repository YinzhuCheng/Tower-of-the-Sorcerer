import test from 'node:test';
import assert from 'node:assert/strict';

import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import {
  applyDemoTenFloorPalaceSpatialRedesign,
  DEMO10_PALACE_SPATIAL_REDESIGN_ID
} from '../src/game/demo-10-floor-palace-spatial-redesign.js';

function createFixture() {
  const enemies = structuredClone(ENEMIES);
  const floors = structuredClone(FLOORS);
  const dialogues = structuredClone(DIALOGUES);
  applyDemoTenFloorContent({ enemies, floors, dialogues, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionTopology({ enemies, floors });
  applyDemoTenFloorSpatialRedesign({ floors, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionGrammar({ floors, enemies, dialogues });
  return floors;
}

function interactiveInventory(floor) {
  return floor.map.flat().filter((token) => token !== '#' && token !== '.').sort();
}

test('palace room pass preserves all F8–F10 content while assigning distinct rooms', () => {
  const floors = createFixture();
  const before = new Map(floors.filter((floor) => floor.number >= 8)
    .map((floor) => [floor.number, interactiveInventory(floor)]));

  const result = applyDemoTenFloorPalaceSpatialRedesign({ floors, gridSize: GRID_SIZE });
  assert.equal(result.applied, true);
  assert.equal(result.id, DEMO10_PALACE_SPATIAL_REDESIGN_ID);

  for (const floor of floors.filter((entry) => entry.number >= 8)) {
    assert.equal(floor.demoPalaceSpatialRedesignId, DEMO10_PALACE_SPATIAL_REDESIGN_ID);
    assert.ok(floor.roomPlan.length >= 5, `F${floor.number} must have named palace rooms.`);
    assert.deepEqual(interactiveInventory(floor), before.get(floor.number), `F${floor.number} must preserve content.`);
  }
});

test('palace room pass is idempotent after progression grammar installs vault and throne seal', () => {
  const floors = createFixture();
  applyDemoTenFloorPalaceSpatialRedesign({ floors, gridSize: GRID_SIZE });
  const before = structuredClone(floors.slice(7).map((floor) => floor.map));
  const second = applyDemoTenFloorPalaceSpatialRedesign({ floors, gridSize: GRID_SIZE });
  assert.equal(second.applied, false);
  assert.deepEqual(floors.slice(7).map((floor) => floor.map), before);
});
