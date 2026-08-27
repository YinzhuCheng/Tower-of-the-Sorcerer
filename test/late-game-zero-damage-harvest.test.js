import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/game/data.js';
import { calculateBattle } from '../src/game/engine.js';
import {
  createLateGameZeroDamageHarvestAdapter,
  isLateGameZeroDamageHarvestAction
} from '../src/solver/late-game-zero-damage-harvest-adapter.js';

function state({ lucky = true, stats = null } = {}) {
  return {
    cores: 7,
    relics: { lucky },
    stats: stats ?? { hp: 10_000, maxHp: 10_000, atk: 999, def: 999, gold: 0 },
    enemies: ['mote', 'catBoss']
  };
}

function fakeBase() {
  return {
    cloneState(value) { return structuredClone(value); },
    normalize(value) { return { state: structuredClone(value), steps: [] }; },
    enumerateActions(value) {
      return value.enemies.map((enemyId) => ({
        kind: 'tile',
        eventId: `enemy:${enemyId}`,
        parsed: { type: 'enemy', id: enemyId },
        token: `enemy:${enemyId}`
      }));
    },
    applyAction(value, action) {
      const next = structuredClone(value);
      next.enemies = next.enemies.filter((id) => id !== action.parsed.id);
      const enemy = ENEMIES[action.parsed.id];
      next.stats.gold += Number(enemy.gold ?? 0) * (next.relics.lucky ? 2 : 1);
      return {
        ok: true,
        state: next,
        steps: [{ eventId: action.eventId, automatic: false }]
      };
    },
    rulesVersion: () => 'fake-v1'
  };
}

test('late-game predicate accepts Lucky-owned zero-damage ordinary enemies only', () => {
  const value = state();
  const mote = { kind: 'tile', eventId: 'enemy:mote', parsed: { type: 'enemy', id: 'mote' } };
  const boss = { kind: 'tile', eventId: 'enemy:catBoss', parsed: { type: 'enemy', id: 'catBoss' } };
  assert.equal(isLateGameZeroDamageHarvestAction(value, mote), true);
  assert.equal(isLateGameZeroDamageHarvestAction(value, boss), false);
  assert.equal(isLateGameZeroDamageHarvestAction(state({ lucky: false }), mote), false);
  assert.equal(isLateGameZeroDamageHarvestAction({ ...value, cores: 6 }, mote), false);
});

test('positive-damage ordinary enemy remains explicit', () => {
  const enemy = ENEMIES.mote;
  const value = state({
    stats: {
      hp: 10_000,
      maxHp: 10_000,
      atk: enemy.def + 1,
      def: 0,
      gold: 0
    }
  });
  const battle = calculateBattle(value.stats, enemy, value.relics);
  assert.ok(battle.totalDamage > 0, 'test fixture must actually take damage');
  const mote = { kind: 'tile', eventId: 'enemy:mote', parsed: { type: 'enemy', id: 'mote' } };
  assert.equal(isLateGameZeroDamageHarvestAction(value, mote), false);
});

test('normalization auto-kills zero-damage ordinary enemy but leaves boss explicit', () => {
  const adapter = createLateGameZeroDamageHarvestAdapter({ baseAdapter: fakeBase() });
  const result = adapter.normalize(state());
  assert.deepEqual(result.state.enemies, ['catBoss']);
  assert.ok(result.state.stats.gold > 0);
  assert.deepEqual(result.steps.map((step) => step.eventId), ['enemy:mote']);
  assert.equal(result.steps[0].automatic, true);
});
