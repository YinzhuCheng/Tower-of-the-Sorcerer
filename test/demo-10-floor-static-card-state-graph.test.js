import test from 'node:test';
import assert from 'node:assert/strict';

import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { buildStaticCardTopologyGraph } from '../src/tuner/static-card-topology.js';

function createFixture() {
  const enemies = structuredClone(ENEMIES);
  const floors = structuredClone(FLOORS);
  const dialogues = structuredClone(DIALOGUES);
  applyDemoTenFloorContent({ enemies, floors, dialogues, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionTopology({ enemies, floors });
  applyDemoTenFloorSpatialRedesign({ floors, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionGrammar({ floors, enemies, dialogues });
  applyDemoTenFloorPalaceSpatialRedesign({ floors, gridSize: GRID_SIZE });
  return floors;
}

function barrier(report, id) {
  const result = report.barriers.find((entry) => entry.id === id);
  assert.ok(result, `Missing static card barrier ${id}.`);
  return result;
}

function hasAnchor(result, token) {
  return result.utilityAnchors.some((anchor) => anchor.token === token);
}

test('10F static card state graph keeps every card spend meaningful and viable', () => {
  const report = buildStaticCardTopologyGraph(createFixture());
  assert.equal(report.valid, true, report.violations.join(', '));
  assert.deepEqual(report.ledger.final, { star: 9, moon: 4, sun: 0 });
  assert.equal(report.barriers.length, 19);
  assert.ok(report.barriers.every((entry) => entry.utilityAnchors.length > 0));
  assert.ok(report.ledger.states.every((entry) => entry.viable));
});

test('late palace card graph names the rooms and permissions each card unlocks', () => {
  const report = buildStaticCardTopologyGraph(createFixture());

  assert.ok(hasAnchor(barrier(report, 'F8:door:star'), 'switch:hushB'));
  assert.ok(hasAnchor(barrier(report, 'F8:door:moon'), 'switch:hushA'));
  assert.ok(hasAnchor(barrier(report, 'F9:door:star'), 'rune:C'));
  assert.ok(hasAnchor(barrier(report, 'F9:door:moon'), 'shop'));
  assert.ok(hasAnchor(barrier(report, 'F10:door:moon'), 'item:dual'));
  assert.ok(hasAnchor(barrier(report, 'F10:gate:throneSeal'), 'enemy:finalQueen'));
});
