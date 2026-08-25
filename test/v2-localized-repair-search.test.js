import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clusterExactRecoveryFailures,
  failureCoreEnemyId,
  findLeastSofteningBoundary,
  mergeBalanceEditSets
} from '../src/tuner/v2-localized-repair-search.js';

test('mergeBalanceEditSets replaces an existing candidate field instead of duplicating it', () => {
  const merged = mergeBalanceEditSets([
    { target: 'enemy', id: 'flameCaster', field: 'def', value: 70 },
    { target: 'shop', id: 'hp', field: 'effect.hp', value: 150 }
  ], [
    { target: 'enemy', id: 'flameCaster', field: 'def', value: 63 }
  ]);
  assert.equal(merged.length, 2);
  assert.deepEqual(merged.find((entry) => entry.id === 'flameCaster'), {
    target: 'enemy', id: 'flameCaster', field: 'def', value: 63
  });
});

test('failure-core semantic enemy IDs are parsed without depending on coordinates', () => {
  assert.equal(failureCoreEnemyId({ eventId: 'f5:enemy:dragonBoss#1' }), 'dragonBoss');
  assert.equal(failureCoreEnemyId({ eventId: 'teleport:f5' }), null);
});

test('exact unrecoverable mutations cluster by semantic failure event', () => {
  const report = {
    results: [
      {
        exact: true,
        recoverable: false,
        purchaseIndex: 0,
        purchaseNumber: 1,
        baselineOption: 'atk',
        forcedOptionId: 'def',
        failureCore: { eventId: 'f5:enemy:dragonBoss#1', stepIndex: 101, stepKind: 'tile' }
      },
      {
        exact: true,
        recoverable: false,
        purchaseIndex: 1,
        purchaseNumber: 2,
        baselineOption: 'atk',
        forcedOptionId: 'def',
        failureCore: { eventId: 'f5:enemy:dragonBoss#1', stepIndex: 101, stepKind: 'tile' }
      },
      {
        exact: true,
        recoverable: false,
        purchaseIndex: 0,
        purchaseNumber: 1,
        baselineOption: 'atk',
        forcedOptionId: 'hp',
        failureCore: { eventId: 'f5:enemy:flameCaster#3', stepIndex: 93, stepKind: 'tile' }
      },
      { exact: false, recoverable: false, failureCore: { eventId: 'f5:enemy:ignored#1' } }
    ]
  };
  const clusters = clusterExactRecoveryFailures(report);
  assert.equal(clusters.length, 2);
  assert.equal(clusters[0].enemyId, 'flameCaster');
  assert.equal(clusters[0].entries.length, 1);
  assert.equal(clusters[1].enemyId, 'dragonBoss');
  assert.equal(clusters[1].entries.length, 2);
});

test('monotone boundary search returns the least softening that reaches target rescue count', () => {
  const result = findLeastSofteningBoundary({
    originalValue: 20,
    lowerBound: 5,
    targetRescues: 2,
    evaluate(value) {
      return {
        rescuedCount: value <= 14 ? 2 : value <= 17 ? 1 : 0,
        marker: value
      };
    }
  });
  assert.equal(result.value, 14);
  assert.equal(result.evaluation.marker, 14);
});

test('monotone boundary search reports null when the configured softening budget cannot rescue enough cases', () => {
  const result = findLeastSofteningBoundary({
    originalValue: 20,
    lowerBound: 15,
    targetRescues: 2,
    evaluate(value) {
      return { rescuedCount: value <= 14 ? 2 : 1 };
    }
  });
  assert.equal(result, null);
});
