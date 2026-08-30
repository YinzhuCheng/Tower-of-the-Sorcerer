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
import { applyDemoThirtyFloorContent, validateDemoThirtyFloorContent } from '../src/game/demo-30-floor-content.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
applyDemoThirtyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const engine = await import('../src/game/engine.js');
const charters = await import('../src/game/act3-charters.js');
const { createTowerAdapter } = await import('../src/solver/tower-adapter.js');
const { getFreeRouteIntel } = await import('../src/game/free-route-intel.js');

function reachable(map, fromToken, toToken, { blocked = new Set() } = {}) {
  const width = map[0].length;
  const flat = map.flat();
  const start = flat.indexOf(fromToken);
  const end = flat.indexOf(toToken);
  const queue = [start];
  const seen = new Set(queue);
  while (queue.length) {
    const index = queue.shift();
    if (index === end) return true;
    const x = index % width;
    const y = Math.floor(index / width);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nextX = x + dx;
      const nextY = y + dy;
      const next = nextY * width + nextX;
      if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= map.length || seen.has(next) || map[nextY][nextX] === '#' || blocked.has(map[nextY][nextX])) continue;
      seen.add(next);
      queue.push(next);
    }
  }
  return false;
}

test('Act III creates a real F20 transition and a new F30 final boss', () => {
  const validation = validateDemoThirtyFloorContent({ floors: FLOORS, enemies: ENEMIES, items: ITEMS });
  assert.equal(validation.ok, true);
  assert.equal(FLOORS.length, 30);
  assert.equal(ENEMIES.originCore.finalBoss, false);
  assert.equal(ENEMIES.originCore.revealStair, true);
  assert.equal(ENEMIES.errataCore.finalBoss, true);
  assert.equal(FLOORS[29].map.flat().includes('U'), false);
  for (const floor of FLOORS.slice(20)) {
    for (const guardianId of floor.exitGuardians ?? []) {
      assert.equal(ENEMIES[guardianId]?.boss, true, `F${floor.number} guardian ${guardianId} must unlock the exit when defeated`);
    }
  }

  const state = engine.createInitialState();
  state.floor = 19;
  state.x = 4;
  state.y = 1;
  state.stats = { hp: 1_000_000, maxHp: 1_000_000, atk: 1_000_000, def: 1_000_000, gold: 0 };
  const cleared = engine.tryMove(state, 1, 0);
  assert.equal(cleared.stairRevealed, true);
  assert.equal(state.victory, false);
  assert.equal(state.floorStates[19].map[1][5], 'U');
});

test('F21 charter is free but mutually seals the two other annexes', () => {
  const state = engine.createInitialState();
  state.floor = 20;
  assert.equal(charters.selectAct3Charter(state, 'audit').ok, true);
  assert.equal(state.charter.selectedId, 'audit');
  assert.equal(charters.act3CharterGateAccess(state, 'f23AuditAnnex').ok, true);
  assert.equal(charters.act3CharterGateAccess(state, 'f22ShelterAnnex').ok, false);
  assert.equal(charters.act3CharterGateAccess(state, 'f24RelayAnnex').ok, false);
  assert.equal(state.cards.sun + state.cards.moon + state.cards.star, 0, 'selecting a charter never spends a card');
});

test('each charter annex is a reachable detour once its public gate opens', () => {
  for (const charter of charters.ACT3_CHARTERS) {
    const floor = FLOORS.find((entry) => entry.map.flat().includes(`gate:${charter.gateId}`));
    assert.ok(floor, `${charter.id} has a map gate`);
    assert.equal(reachable(floor.map, 'D', `item:${charter.itemId}`, { blocked: new Set([`gate:${charter.gateId}`]) }), false, `${charter.id} gate protects its reward`);
    assert.equal(reachable(floor.map, 'D', `item:${charter.itemId}`), true, `${charter.id} reward is reachable behind its gate`);
  }
});

test('charter completion changes only its published deterministic outcome', () => {
  const shelter = engine.createInitialState();
  shelter.floor = 20;
  charters.selectAct3Charter(shelter, 'shelter');
  engine.collectItem(shelter, 'shelterAegis');
  const sheltered = charters.applyAct3CharterFinaleModifier(shelter, 'errataCore', ENEMIES.errataCore);
  assert.equal(sheltered.councilRules.counterattackGuard, 3);

  const audit = engine.createInitialState();
  audit.floor = 20;
  charters.selectAct3Charter(audit, 'audit');
  engine.collectItem(audit, 'auditLedger');
  const audited = charters.applyAct3CharterFinaleModifier(audit, 'archiveWarden', ENEMIES.archiveWarden);
  assert.ok(audited.hp < ENEMIES.archiveWarden.hp);
  assert.equal(audited.def, ENEMIES.archiveWarden.def - 15);

  const relay = engine.createInitialState();
  relay.floor = 20;
  relay.magic = { unlocked: true, mp: 0, maxMp: 180, tier: 0 };
  charters.selectAct3Charter(relay, 'relay');
  engine.collectItem(relay, 'relayCapacitor');
  relay.magic.mp = 7;
  const refill = charters.applyAct3CharterEnemyDefeatEffect(relay, 'archiveMarshal');
  assert.equal(refill.afterMp, relay.magic.maxMp);
  assert.equal(charters.applyAct3CharterEnemyDefeatEffect(relay, 'archiveMarshal'), null, 'the relay cannot be farmed');
});

test('free final intel shows the selected charter modifier without charging for information', () => {
  const state = engine.createInitialState();
  state.floor = 20;
  charters.selectAct3Charter(state, 'audit');
  engine.collectItem(state, 'auditLedger');
  state.floor = 29;
  const intel = getFreeRouteIntel(state, { lookahead: 0 });
  const warden = intel.finale.finalEnemies.find((enemy) => enemy.id === 'archiveWarden');
  assert.ok(warden.hp < ENEMIES.archiveWarden.hp);
  assert.match(warden.modifierLabels.join(' '), /逐页校验/);
  assert.equal(state.cards.sun + state.cards.moon + state.cards.star, 0, 'consulting intel has no resource cost');
});

test('compact solver states retain the irreversible charter axis', () => {
  const adapter = createTowerAdapter();
  const state = engine.createInitialState();
  state.floor = 20;
  charters.selectAct3Charter(state, 'relay');
  engine.collectItem(state, 'relayCapacitor');
  const compact = adapter.compactState(state);
  const restored = adapter.materializeState(compact);
  assert.deepEqual(restored.charter, state.charter);
  assert.match(adapter.structuralKey(compact), /relay/);
});
