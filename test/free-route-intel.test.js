import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const { createInitialState, serializeState } = await import('../src/game/engine.js');
const { FREE_ROUTE_INTEL_ID, getFreeRouteIntel } = await import('../src/game/free-route-intel.js');

test('free route intel exposes the F18-to-F20 plan before card spending without mutating play state', () => {
  const state = createInitialState();
  state.floor = 17; // F18
  state.x = 1;
  state.y = 9;
  state.cards = { sun: 0, moon: 0, star: 0 };
  state.stats.gold = 0;
  state.magic = { unlocked: true, mp: 0, maxMp: 100, tier: 0 };
  const before = serializeState(state);

  const intel = getFreeRouteIntel(state);

  assert.equal(intel.id, FREE_ROUTE_INTEL_ID);
  assert.equal(intel.free, true);
  assert.equal(intel.current.number, 18);
  assert.equal(intel.current.gates.find((gate) => gate.id === 'f18SunBridge')?.requirement, '日曜卡×1');
  assert.equal(intel.current.gates.find((gate) => gate.id === 'f18StarChannel')?.requirement, '星蚀卡×2');
  assert.equal(intel.upcoming.find((floor) => floor.number === 19)?.gates.find((gate) => gate.id === 'f19ThroneLicense')?.requirement, '月辉卡×2');
  assert.equal(intel.upcoming.find((floor) => floor.number === 20)?.mandatory.length, 0);
  assert.deepEqual(intel.finale.loyalists.map((unit) => unit.mp), [20, 60, 40]);
  assert.equal('contracts' in intel.finale, false, 'hidden witness conditions are not route-intel objectives');
  assert.equal(intel.doctrines.free, true);
  assert.equal(intel.doctrines.entries.length, 3);
  assert.match(intel.notice, /不会消耗卡片、金币、HP、MP 或回合/);
  assert.equal(serializeState(state), before, 'viewing intelligence must not change any save-state field');
});

test('free route intel exposes current enemy numbers and final facts, not a hidden reward or alternate economy', () => {
  const state = createInitialState();
  state.floor = 10; // F11 unlocks the public endgame briefing.
  const intel = getFreeRouteIntel(state, { lookahead: 0 });

  assert.equal(intel.current.number, 11);
  assert.ok(intel.current.threats.some((enemy) => enemy.id === 'manaWisp' && enemy.hp === ENEMIES.manaWisp.hp));
  assert.ok(intel.finale.finalEnemies.some((enemy) => enemy.id === 'originCore' && enemy.hp === ENEMIES.originCore.hp));
  assert.equal('effect' in intel, false);
  assert.equal('cost' in intel, false);
  assert.equal('contracts' in intel.finale, false);
});
