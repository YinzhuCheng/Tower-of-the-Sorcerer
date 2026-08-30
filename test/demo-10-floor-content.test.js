import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDemoTenFloorContent, DEMO_TEN_FLOOR_ID } from '../src/game/demo-10-floor-content.js';

function baseFixture() {
  const emptyMap = Array.from({ length: 11 }, () => Array(11).fill('.'));
  return {
    enemies: {
      finalQueen: { floor: 8, boss: true, phaseNext: 'voidCore' },
      voidCore: { floor: 8, boss: true, finalBoss: true }
    },
    floors: Array.from({ length: 8 }, (_, index) => ({
      id: index,
      number: index + 1,
      title: `F${index + 1}`,
      map: emptyMap.map((row) => [...row]),
      ...(index === 7 ? { boss: 'voidCore', intro: 'floor8' } : {})
    })),
    dialogues: {}
  };
}

test('10F overlay preserves seven baseline floors and inserts two palace floors before final', () => {
  const fixture = baseFixture();
  const result = applyDemoTenFloorContent(fixture);
  assert.equal(result.applied, true);
  assert.equal(fixture.floors.length, 10);
  assert.deepEqual(fixture.floors.slice(0, 7).map((floor) => floor.number), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(fixture.floors[7].title, '静默前庭');
  assert.equal(fixture.floors[7].boss, 'palaceWarden');
  assert.equal(fixture.floors[8].title, '倒悬星桥');
  assert.equal(fixture.floors[8].boss, 'blackSealKeeper');
  assert.equal(fixture.floors[9].title, '无声王座');
  assert.equal(fixture.floors[9].boss, 'voidCore');
  assert.equal(fixture.floors[9].demoContentId, DEMO_TEN_FLOOR_ID);
  assert.equal(fixture.enemies.finalQueen.floor, 10);
  assert.equal(fixture.enemies.voidCore.floor, 10);
});

test('inserted demo maps are 11x11 and provide boss-locked upward stairs on F8/F9', () => {
  const fixture = baseFixture();
  applyDemoTenFloorContent(fixture);
  for (const floor of fixture.floors.slice(7, 9)) {
    assert.equal(floor.map.length, 11);
    assert.ok(floor.map.every((row) => row.length === 11));
    assert.ok(floor.map.some((row) => row.includes('U')));
    assert.ok(floor.map.some((row) => row.includes('D')));
    assert.ok(floor.map.some((row) => row.includes(`enemy:${floor.boss}`)));
  }
});

test('production demo keeps one Act I shop on F5 before the guardian cluster', () => {
  const fixture = baseFixture();
  applyDemoTenFloorContent(fixture);
  const shopFloors = fixture.floors
    .filter((floor) => floor.map.some((row) => row.includes('shop')))
    .map((floor) => floor.number);

  assert.deepEqual(shopFloors, [5]);
  assert.deepEqual(fixture.floors[0].initialRelics, ['codex', 'compass']);
  assert.equal(fixture.floors[4].shopEffectMultiplier, 2.25);
  assert.equal(fixture.floors[0].shopEffectMultiplier, undefined);
  assert.equal(fixture.floors[8].shopEffectMultiplier, undefined);
  assert.ok(!fixture.floors[9].map.some((row) => row.includes('shop')));
});

test('F8/F9 expose distinct checkpoint mechanics without reintroducing a late shop', () => {
  const fixture = baseFixture();
  applyDemoTenFloorContent(fixture);
  const floor8 = fixture.floors[7];
  const floor9 = fixture.floors[8];

  assert.deepEqual(floor8.puzzles?.switches?.hush, ['hushA', 'hushB']);
  assert.deepEqual(floor9.puzzles?.sequence?.order, ['B', 'A', 'C']);
  assert.ok(!floor9.map.some((row) => row.includes('shop')), 'F9 must remain a permission puzzle, not a late conversion checkpoint.');

  const lateEnemyIds = [
    'muteGuard', 'hushCantor', 'outerCrown', 'palaceWarden',
    'starSentinel', 'nullCantor', 'crownShade', 'blackSealKeeper'
  ];
  assert.ok(lateEnemyIds.every((id) => fixture.enemies[id]), 'Every F8/F9 demo enemy must resolve.');
  assert.equal(fixture.enemies.palaceWarden.reward?.core ?? 0, 0);
  assert.equal(fixture.enemies.blackSealKeeper.reward?.core ?? 0, 0);
});

test('every boss encounter dialogue sequence stays interactive and within five turns', () => {
  const fixture = baseFixture();
  applyDemoTenFloorContent(fixture);
  const sequences = Object.entries(fixture.dialogues)
    .filter(([id, dialogue]) => id.endsWith('Demo') && Array.isArray(dialogue?.turns));

  assert.ok(sequences.length >= 20);
  for (const [id, dialogue] of sequences) {
    assert.ok(dialogue.turns.length >= 2, `${id} should contain at least two turns.`);
    assert.ok(dialogue.turns.length <= 5, `${id} must stay within the five-turn interaction limit.`);
    assert.ok(dialogue.turns.every((turn) => turn.speaker && turn.portrait && turn.text), `${id} turns must be complete.`);
  }
  assert.equal(fixture.enemies.finalQueen.preBattleDialogue, 'bossQueenPreDemo');
  assert.equal(fixture.enemies.finalQueen.phaseDialogue, 'queenPhaseDemo');
  assert.equal(fixture.enemies.voidCore.defeatDialogue, 'bossQueenPostDemo');
});

test('10F overlay is idempotent', () => {
  const fixture = baseFixture();
  applyDemoTenFloorContent(fixture);
  const second = applyDemoTenFloorContent(fixture);
  assert.equal(second.applied, false);
  assert.equal(fixture.floors.length, 10);
});
