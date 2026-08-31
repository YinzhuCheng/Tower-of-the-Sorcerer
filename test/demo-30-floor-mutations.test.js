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
import { applyDemoThirtyFloorContent, DEMO30_NUMERIC_BASELINE, DEMO30_NUMERIC_BASELINE_ID } from '../src/game/demo-30-floor-content.js';
import { createTowerAdapter, refreshTowerAdapterCodec } from '../src/solver/tower-adapter.js';
import {
  DEMO30_MUTATION_SCOPE,
  createDemoThirtyFloorMutationCatalog,
  expandDemoThirtyFloorCandidate,
  evaluateDemoThirtyFloorMutationCandidate,
  withDemoThirtyFloorCandidate
} from '../src/tuner/demo-30-floor-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
applyDemoThirtyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
refreshTowerAdapterCodec();
// Constructed before the layout candidate on purpose: map mutations must
// refresh its captured compact-state methods as well as the global codec.
const adapter = createTowerAdapter();

test('Act III mutator restores numeric pressure and keeps story contracts locked', () => {
  const catalog = createDemoThirtyFloorMutationCatalog();
  const baseline = ENEMIES.errataCore.hp;
  const observed = withDemoThirtyFloorCandidate({ mutationIds: ['act3-final-hp-plus4'] }, catalog, () => ENEMIES.errataCore.hp);
  assert.ok(observed > baseline);
  assert.equal(ENEMIES.errataCore.hp, baseline);
  assert.deepEqual(DEMO30_MUTATION_SCOPE.locked, [
    'chapter-contracts', 'charter-items', 'handoff-order', 'final-phase-order',
    'required-guardian-identity', 'stairs', 'story-dialogue'
  ]);
});

test('Act III mutator supports bounded MP, card, topology and encounter-layout probes', () => {
  const catalog = createDemoThirtyFloorMutationCatalog();
  assert.ok(catalog.some((entry) => entry.kind === 'item-patch'));
  assert.ok(catalog.some((entry) => entry.kind === 'card-gate-patch'));
  assert.ok(catalog.some((entry) => entry.kind === 'topology-swap'));
  assert.ok(catalog.some((entry) => entry.kind === 'enemy-relocate'));
  assert.ok(catalog.some((entry) => entry.kind === 'enemy-insert-after-relocate'));

  const mp = ITEMS.act3Mana.mp;
  const observedMp = withDemoThirtyFloorCandidate(
    { mutationIds: ['act3-mana-cache-minus10'] }, catalog, () => ITEMS.act3Mana.mp
  );
  assert.equal(observedMp, mp - 10);
  assert.equal(ITEMS.act3Mana.mp, mp);
  assert.throws(
    () => withDemoThirtyFloorCandidate({ mutationIds: [
      'act3-mana-cache-minus10', 'act3-relay-capacitor-minus20', 'act3-f26-market-output-minus5'
    ] }, catalog, () => null),
    /capped at 2 edits/
  );

  const topology = catalog.find((entry) => entry.kind === 'topology-swap');
  const topologyFloor = FLOORS.find((floor) => floor.number === topology.floor);
  const beforeMap = topologyFloor.map.map((row) => [...row]);
  const observed = withDemoThirtyFloorCandidate({ mutationIds: [topology.id] }, catalog, () => ({
    closed: topologyFloor.map[topology.close.y][topology.close.x],
    opened: topologyFloor.map[topology.open.y][topology.open.x]
  }));
  assert.deepEqual(observed, { closed: '#', opened: '.' });
  assert.deepEqual(topologyFloor.map, beforeMap);
});

test('dependent encounter composition is a bounded, ordered branch', () => {
  const catalog = createDemoThirtyFloorMutationCatalog();
  const relocation = catalog.find((entry) => entry.kind === 'enemy-relocate');
  const insertion = catalog.find((entry) => entry.kind === 'enemy-insert-after-relocate');
  const expansions = expandDemoThirtyFloorCandidate({ mutationIds: [relocation.id] }, catalog);
  assert.ok(expansions.some((candidate) => candidate.mutationIds.includes(insertion.id)));

  const f29 = FLOORS.find((floor) => floor.number === 29);
  const beforeMap = f29.map.map((row) => [...row]);
  withDemoThirtyFloorCandidate(
    { mutationIds: [insertion.id, relocation.id] }, catalog,
    () => {
      assert.equal(f29.map[insertion.at.y][insertion.at.x], insertion.token);
      const engineState = adapter.materializeState(adapter.createInitialState());
      assert.equal(engineState.floorStates.length, 30);
      assert.equal(engineState.floorStates[28].map[insertion.at.y][insertion.at.x], insertion.token);
      assert.equal(engineState.floorStates[28].map[relocation.to.y][relocation.to.x], relocation.token);
      assert.ok(adapter.eventCatalog().events.some((entry) => entry.floor === 28
        && entry.x === insertion.at.x && entry.y === insertion.at.y && entry.semanticId === insertion.token.slice('enemy:'.length)));
    }
  );
  assert.deepEqual(f29.map, beforeMap);
});

test('solver prunes only a provable deficit at an unavoidable card gate', () => {
  const f25 = FLOORS.find((floor) => floor.number === 25);
  const before = f25.puzzles.cardGates.f25MissingSeal;
  assert.equal(adapter.provenDeadEnd(adapter.createInitialState()), false);
  try {
    f25.puzzles.cardGates.f25MissingSeal = { ...before, moon: 99 };
    assert.equal(adapter.provenDeadEnd(adapter.createInitialState()), true);
  } finally {
    f25.puzzles.cardGates.f25MissingSeal = before;
  }
});

test('Act III release baseline keeps the certified F27 and F30 pressure', () => {
  assert.equal(DEMO30_NUMERIC_BASELINE_ID, 'demo-30f-afterlight-route-baseline-v2');
  assert.equal(DEMO30_NUMERIC_BASELINE.marginDuelist.atk, 381);
  assert.equal(DEMO30_NUMERIC_BASELINE.errataCantor.magicPower, 294);
  assert.equal(DEMO30_NUMERIC_BASELINE.archiveMarshal.atk, 385);
  assert.deepEqual(
    DEMO30_NUMERIC_BASELINE.archiveWarden,
    { hp: 13_728, atk: 400, def: 310, gold: 0, boss: true, special: 'magic', magicPower: 443, phaseNext: 'errataCore' }
  );
  assert.deepEqual(
    DEMO30_NUMERIC_BASELINE.errataCore,
    { hp: 16_016, atk: 515, def: 310, gold: 0, boss: true, finalBoss: true, special: 'doubleHit' }
  );
});

test('Act III hardening refuses a portfolio that loses any charter route', () => {
  const catalog = createDemoThirtyFloorMutationCatalog();
  const result = evaluateDemoThirtyFloorMutationCandidate({
    candidate: { mutationIds: ['act3-final-hp-plus4'] },
    catalog,
    evaluatePortfolio: () => ({
      publishable: false,
      entries: [{ id: 'shelter', completed: true }, { id: 'audit', completed: true }, { id: 'relay', completed: false }]
    })
  });
  assert.equal(result.publishable, false);
});
