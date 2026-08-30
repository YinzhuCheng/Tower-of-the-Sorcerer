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

const { createInitialState, deserializeState, serializeState, tryMove } = await import('../src/game/engine.js');
const {
  SHADOW_PRISM_EXPEDITION,
  applyRouteDoctrineEnemyDefeatEffect,
  getRouteDoctrineExitBlocker
} = await import('../src/game/route-doctrine-effects.js');

test('shadow prism support is public, deterministic, and cannot be pocketed before leaving F16', () => {
  const state = createInitialState();
  state.floor = 15;
  state.doctrine.selectedId = 'shadow';
  state.stats.hp = 500;
  state.stats.maxHp = 20_000;
  state.magic = { unlocked: true, mp: 0, maxMp: 100, tier: 0 };
  state.cards.moon = 2;
  // The threshold is at (4, 6); enter from the right-hand transit tile.
  state.x = 5;
  state.y = 6;

  const opened = tryMove(state, -1, 0);
  assert.equal(opened.moved, true);
  assert.equal(state.cards.moon, 0);
  assert.equal(state.stats.hp, 500 + SHADOW_PRISM_EXPEDITION.hpRestore);
  assert.equal(state.magic.maxMp, 220);
  assert.equal(state.magic.mp, 220);
  assert.equal(opened.events.some((event) => event.type === 'routeDoctrineEffect'), true);

  state.magic.mp = 17;
  const refill = applyRouteDoctrineEnemyDefeatEffect(state, 'mirrorDuelist');
  assert.equal(refill.afterMp, 220);
  assert.equal(state.magic.mp, 220);
  assert.match(getRouteDoctrineExitBlocker(state), /必须完成双镜宝库/);
  state.x = 9;
  state.y = 2;
  const lockedExit = tryMove(state, 0, -1);
  assert.equal(lockedExit.blocked, true);
  assert.match(lockedExit.reason, /必须完成双镜宝库/);
  state.alliance.bonds.yayu = true;
  assert.equal(getRouteDoctrineExitBlocker(state), null);
});

test('v6 saves move the impossible mirror gate without resetting route progress', () => {
  const state = createInitialState();
  state.version = 6;
  state.doctrine.selectedId = 'shadow';
  const map = state.floorStates[15].map;
  map[1][2] = '.';
  map[2][1] = '.';
  map[2][4] = 'gate:mirrorReservoirVault';

  const migrated = deserializeState(serializeState(state));
  assert.equal(migrated.version, 8);
  assert.equal(migrated.doctrine.selectedId, 'shadow');
  assert.equal(migrated.floorStates[15].map[1][2], 'gate:mirrorReservoirVault');
  assert.equal(migrated.floorStates[15].map[2][1], '#');
  assert.equal(migrated.floorStates[15].map[2][4], '.');
});
