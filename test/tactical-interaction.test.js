import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, calculateBattle } from '../src/game/engine.js';
import { ENEMIES } from '../src/game/data.js';
import {
  buildEnemyHoverPreview,
  guardianMarkerLabel,
  listGuardianMarkers
} from '../src/game/tactical-interaction.js';

test('enemy hover preview reuses authoritative battle calculation', () => {
  const state = createInitialState();
  const preview = buildEnemyHoverPreview(state, 'catScout');
  const expected = calculateBattle(state.stats, ENEMIES.catScout, state.relics);
  assert.ok(preview);
  assert.equal(preview.totalDamage, expected.totalDamage);
  assert.equal(preview.winnable, expected.winnable);
  assert.equal(preview.heroDamage, expected.heroDamage);
  assert.match(preview.damageText, /HP|无法破防/);
});

test('guardian labels distinguish ordinary bosses from the final guardian', () => {
  assert.equal(guardianMarkerLabel({ boss: false }), null);
  assert.equal(guardianMarkerLabel({ boss: true }), '结界守护者');
  assert.equal(guardianMarkerLabel({ boss: true, finalBoss: true }), '最终守护者');
});

test('current floor guardian marker follows the live mutable map', () => {
  const state = createInitialState();
  const markers = listGuardianMarkers(state);
  const catBoss = markers.find((marker) => marker.enemyId === 'catBoss');
  assert.ok(catBoss, 'first floor boss should be marked as a guardian');
  assert.equal(catBoss.label, '结界守护者');

  state.floorStates[state.floor].map[catBoss.y][catBoss.x] = '.';
  assert.equal(listGuardianMarkers(state).some((marker) => marker.enemyId === 'catBoss'), false);
});
