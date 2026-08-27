import test from 'node:test';
import assert from 'node:assert/strict';
import { runGreedyShopStrategy } from '../src/solver/greedy-strategy.js';

test('greedy battle checkpoints expose authoritative strategic state before and after combat', () => {
  const report = runGreedyShopStrategy({
    shopCycle: ['def', 'atk', 'hp'],
    holyPolicy: 'immediate',
    maxIterations: 5_000
  });
  assert.ok(report.battleLog.length > 0);
  const checkpoint = report.battleLog[0];
  assert.deepEqual(Object.keys(checkpoint.cardsBefore).sort(), ['moon', 'star', 'sun']);
  assert.equal(Number.isInteger(checkpoint.coresBefore), true);
  assert.equal(Number.isInteger(checkpoint.purchasesBefore), true);
  assert.deepEqual(Object.keys(checkpoint.relicsBefore).sort(), ['compass', 'holy', 'lucky', 'ward']);
  assert.equal(checkpoint.positionBefore.floor, checkpoint.floor);
  assert.deepEqual(Object.keys(checkpoint.cardsAfter).sort(), ['moon', 'star', 'sun']);
  assert.equal(Number.isInteger(checkpoint.coresAfter), true);
  assert.equal(Number.isInteger(checkpoint.purchasesAfter), true);
  assert.deepEqual(Object.keys(checkpoint.relicsAfter).sort(), ['compass', 'holy', 'lucky', 'ward']);
});
