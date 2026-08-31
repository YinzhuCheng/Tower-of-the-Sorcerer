import assert from 'node:assert/strict';
import test from 'node:test';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent } from '../src/game/demo-30-floor-content.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
applyDemoThirtyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const engine = await import('../src/game/engine.js');
const handoffs = await import('../src/game/act3-handoff-priorities.js');
const { createTowerAdapter } = await import('../src/solver/tower-adapter.js');
const { getFreeRouteIntel } = await import('../src/game/free-route-intel.js');

test('the first F27 guardian locks a public handoff rather than creating a free reward menu', () => {
  const state = engine.createInitialState();
  state.floor = 26;
  state.x = 1;
  state.y = 5;
  state.stats = { hp: 1_000_000, maxHp: 1_000_000, atk: 1_000_000, def: 1_000_000, gold: 0 };
  state.magic = { unlocked: true, mp: 400, maxMp: 400, tier: 0 };

  const result = engine.tryMove(state, 1, 0);

  assert.equal(result.bossDefeated, true);
  assert.equal(state.handoff.selectedId, 'escort');
  assert.equal(result.events.find((event) => event.type === 'act3HandoffSelected')?.handoff.id, 'escort');
  assert.equal(state.cards.sun + state.cards.moon + state.cards.star, 0, 'priority choice itself never spends a card');
});

test('each F27 priority changes only its published finale or delayed MP rule', () => {
  const proofread = engine.createInitialState();
  proofread.floor = 26;
  handoffs.selectAct3HandoffForEnemy(proofread, 'errataCantor');
  proofread.floor = 29;
  const warden = engine.getEffectiveEnemy(proofread, 'archiveWarden');
  const core = engine.getEffectiveEnemy(proofread, 'errataCore');
  assert.equal(warden.magicPower, ENEMIES.archiveWarden.magicPower - 95);
  assert.equal(core.special, undefined);

  const beacon = engine.createInitialState();
  beacon.floor = 26;
  beacon.magic = { unlocked: true, mp: 7, maxMp: 180, tier: 0 };
  handoffs.selectAct3HandoffForEnemy(beacon, 'archiveMarshal');
  const refill = handoffs.settleAct3HandoffAfterGuardians(beacon, []);
  assert.equal(refill.afterMp, 180);
  assert.equal(handoffs.settleAct3HandoffAfterGuardians(beacon, []), null, 'the F27 recovery cannot be farmed');
});

test('handoff state is serialized for replay and disclosed by free route intelligence', () => {
  const state = engine.createInitialState();
  state.floor = 26;
  handoffs.selectAct3HandoffForEnemy(state, 'errataCantor');
  const adapter = createTowerAdapter();
  const compact = adapter.compactState(state);
  const restored = adapter.materializeState(compact);
  assert.deepEqual(restored.handoff, state.handoff);
  assert.match(adapter.structuralKey(compact), /proofread/);

  const before = engine.serializeState(state);
  const intel = getFreeRouteIntel(state, { lookahead: 0 });
  assert.equal(intel.handoffs.selectedId, 'proofread');
  assert.equal(intel.handoffs.entries.length, 3);
  const core = intel.finale.finalEnemies.find((enemy) => enemy.id === 'errataCore');
  assert.equal(core.special, 'normal', 'intel must disclose that校验优先 removes the double-hit rule');
  assert.match(core.modifierLabels.join(' '), /校验优先/);
  assert.equal(engine.serializeState(state), before, 'intelligence must not alter the priority or resources');
});

test('v8 saves retain their historical Act III balance instead of receiving a retroactive F27 reward', () => {
  const state = engine.createInitialState();
  const legacy = { ...state, version: 8 };
  delete legacy.handoff;
  const restored = engine.deserializeState(JSON.stringify(legacy));
  assert.deepEqual(restored.handoff, { selectedId: null, beaconRefilled: false, legacyOpen: true });
});
