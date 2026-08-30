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

const {
  calculateBattle,
  collectItem,
  createInitialState,
  deserializeState,
  getEffectiveEnemy,
  serializeState
} = await import('../src/game/engine.js');
const { getRecommendedWarCouncilPlan, getWarCouncilAllies, simulateWarCouncil } = await import('../src/game/war-council.js');
const { createTowerAdapter } = await import('../src/solver/tower-adapter.js');

test('optional Act II relics complete allied bonds without a separate price or a lost resource', () => {
  const state = createInitialState();
  const statsBefore = { ...state.stats };
  const item = collectItem(state, 'aetherPrism');

  assert.equal(item.allianceBond.completed, true);
  assert.equal(item.allianceBond.bond.allyId, 'milu');
  assert.equal(state.alliance.bonds.milu, true);
  assert.deepEqual(state.stats, statsBefore, 'the bond flag must not smuggle an extra stat reward into the relic pickup');
  assert.equal(state.magic.maxMp, 20, 'the normal relic effect remains the only numeric pickup effect');
  assert.equal(state.magic.mp, 20);
  assert.deepEqual(deserializeState(serializeState(state)).alliance, state.alliance);
});

test('bonded survivors add deterministic finale rules and survive compact solver state transitions', () => {
  const state = createInitialState();
  for (const enemyId of ['catBoss', 'whaleBoss', 'dragonBoss', 'shadowBoss']) {
    state.floorStates[ENEMIES[enemyId].floor - 1].defeatedBossIds.push(enemyId);
  }
  state.alliance.bonds = { milu: true, lanin: true, yanli: true, yayu: true };
  const allies = getWarCouncilAllies(state);
  assert.ok(allies.every((ally) => ally.bonded), 'all four optional routes must be visible to the council UI and solver');
  const plan = getRecommendedWarCouncilPlan(state)?.plan;
  const council = simulateWarCouncil(state, plan);
  assert.equal(council.won, true);
  assert.equal(council.modifiers.counterattackGuard, 1, 'Milu’s bond remains meaningful after she holds the opening line');

  state.floor = 19;
  state.council = {
    completed: true,
    plan: null,
    outcome: {
      survivors: [],
      modifiers: {
        hpMultiplier: 1,
        atkPenalty: 0,
        defPenalty: 0,
        magicPenalty: 0,
        counterattackGuard: 1,
        magicCounterattackGuard: 1,
        disableDoubleHit: true,
        labels: []
      }
    }
  };
  const sovereign = getEffectiveEnemy(state, 'arcaneSovereign');
  const core = getEffectiveEnemy(state, 'originCore');
  const stats = { hp: 10_000, maxHp: 10_000, atk: 300, def: 250, gold: 0 };
  const sovereignBattle = calculateBattle(stats, sovereign);
  assert.equal(sovereignBattle.counterAttacks, 25, 'Milu plus Lanin remove one general and one magic retaliation');
  assert.equal(core.special, undefined, 'Yayu turns the core double-hit rule off instead of only lowering a stat');
  assert.equal(calculateBattle(stats, core).enemyDamage, 28, 'the disabled double-hit uses normal retaliation damage');

  const adapter = createTowerAdapter();
  const compact = adapter.compactState(state);
  const restored = adapter.materializeState(compact);
  assert.deepEqual(restored.alliance, state.alliance);
  const withoutBonds = adapter.cloneState(compact);
  withoutBonds.alliance.bonds = { milu: false, lanin: false, yanli: false, yayu: false };
  assert.notEqual(adapter.structuralKey(compact), adapter.structuralKey(withoutBonds), 'bond completion is a real solver state axis');
});
