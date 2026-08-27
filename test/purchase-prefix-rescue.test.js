import test from 'node:test';
import assert from 'node:assert/strict';
import {
  comparePurchaseRescueAttempts,
  rescuePurchasePrefixForHolyPolicy
} from '../src/analyzer/purchase-prefix-rescue.js';

function attempt({ id, solvable = false, cores = 0, holy = false, battles = 0, floor = 1, purchases = 0, hp = 1 }) {
  return {
    id,
    cycle: ['def', 'atk', 'hp'],
    shopPlan: [],
    holyPolicy: 'after-core-6',
    result: {
      solvable,
      cores,
      relics: { holy },
      battles,
      floor,
      purchases,
      turns: battles,
      final: { hp, atk: 1, def: 1 }
    }
  };
}

test('purchase rescue ranking prefers strategic progress before residual HP', () => {
  const moreCores = attempt({ id: 'cores', cores: 5, hp: 10 });
  const moreHp = attempt({ id: 'hp', cores: 4, hp: 10_000 });
  assert.ok(comparePurchaseRescueAttempts(moreCores, moreHp) < 0);

  const victory = attempt({ id: 'win', solvable: true, cores: 7, hp: 2 });
  assert.ok(comparePurchaseRescueAttempts(victory, moreCores) < 0);
});

test('purchase-prefix rescue validates bounded search parameters before engine work', () => {
  assert.throws(() => rescuePurchasePrefixForHolyPolicy({ holyPolicy: 'after-core-6', cycles: [] }));
  assert.throws(() => rescuePurchasePrefixForHolyPolicy({
    holyPolicy: 'after-core-6',
    cycles: [['def']],
    maxDepth: 0
  }));
});
