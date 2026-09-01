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

const { collectItem, createInitialState, deserializeState, serializeState, tryMove } = await import('../src/game/engine.js');
const {
  ROUTE_DOCTRINES,
  getRouteDoctrineBriefing,
  routeDoctrineGateAccess,
  selectRouteDoctrine
} = await import('../src/game/route-doctrines.js');
const { createTowerAdapter } = await import('../src/solver/tower-adapter.js');
const { replayTowerStepSkeletonToState } = await import('../src/solver/replay.js');

function atF11() {
  const state = createInitialState();
  state.floor = 10;
  state.x = 9;
  state.y = 2;
  return state;
}

test('F11 requires a public doctrine before ascent, with no resource price', () => {
  const state = atF11();
  const before = serializeState(state);
  const blocked = tryMove(state, 0, -1);
  assert.equal(blocked.openDoctrine, true);
  assert.match(blocked.reason, /见证契约/);
  assert.equal(serializeState(state), before, 'the blocked prompt must not mutate a save or charge scouting resources');

  const signed = selectRouteDoctrine(state, 'ember');
  assert.equal(signed.ok, true);
  assert.equal(state.doctrine.selectedId, 'ember');
  assert.deepEqual(state.stats, JSON.parse(before).stats);
  assert.deepEqual(state.cards, JSON.parse(before).cards);
  assert.deepEqual(state.magic, JSON.parse(before).magic);
});

test('specialist gates are mutually exclusive while the selected route keeps its authored card cost', () => {
  const red = atF11();
  assert.equal(selectRouteDoctrine(red, 'ember').ok, true);
  assert.equal(routeDoctrineGateAccess(red, 'f15ArchiveSeal').ok, true);
  assert.equal(routeDoctrineGateAccess(red, 'f13StarConduit').ok, false);
  assert.equal(routeDoctrineGateAccess(red, 'f16PrismThreshold').ok, false);

  const tide = atF11();
  assert.equal(selectRouteDoctrine(tide, 'tide').ok, true);
  tide.floor = 12; // F13
  tide.x = 3;
  tide.y = 2;
  tide.cards.star = 2;
  const opened = tryMove(tide, 1, 0);
  assert.equal(opened.moved, true);
  assert.equal(tide.cards.star, 0, 'the doctrine permits but never waives the public star-card price');

  const locked = atF11();
  assert.equal(selectRouteDoctrine(locked, 'shadow').ok, true);
  locked.floor = 12;
  locked.x = 3;
  locked.y = 2;
  locked.cards.star = 2;
  const denied = tryMove(locked, 1, 0);
  assert.equal(denied.blocked, true);
  assert.match(denied.reason, /影线公开/);
});

test('only the selected specialist relic can create a doctrine bond, while legacy saves retain their former access', () => {
  const tide = atF11();
  assert.equal(selectRouteDoctrine(tide, 'tide').ok, true);
  const tideItem = collectItem(tide, 'conduitCodex');
  assert.equal(tideItem.allianceBond.completed, true);
  assert.equal(tide.alliance.bonds.lanin, true);

  const skipped = collectItem(tide, 'arcaneBattery');
  assert.equal(skipped.allianceBond.skipped, true);
  assert.equal(tide.alliance.bonds.yanli, false);

  const legacy = { ...createInitialState(), version: 5 };
  delete legacy.doctrine;
  const restored = deserializeState(JSON.stringify(legacy));
  assert.deepEqual(restored.doctrine, { selectedId: null, legacyOpen: true });
  assert.equal(routeDoctrineGateAccess(restored, 'f15ArchiveSeal').ok, true);
});

test('solver actions, compact state and read-only intelligence all retain the doctrine axis', () => {
  const state = atF11();
  const before = serializeState(state);
  const briefing = getRouteDoctrineBriefing(state);
  assert.equal(briefing.free, true);
  assert.deepEqual(briefing.entries.map((entry) => entry.id), ROUTE_DOCTRINES.map((entry) => entry.id));
  assert.equal(serializeState(state), before);

  const adapter = createTowerAdapter();
  const compact = adapter.compactState(state);
  const action = adapter.enumerateActions(compact).find((entry) => entry.kind === 'doctrine' && entry.doctrineId === 'shadow');
  assert.ok(action);
  const applied = adapter.applyAction(compact, action);
  assert.equal(applied.ok, true);
  assert.equal(adapter.materializeState(applied.state).doctrine.selectedId, 'shadow');
  const replay = replayTowerStepSkeletonToState(applied.steps, { adapter, initialState: compact });
  assert.equal(replay.ok, true);
  assert.equal(replay.final.doctrine.selectedId, 'shadow');
});
