import test from 'node:test';
import assert from 'node:assert/strict';
import { optimizePurchasePlanLocally } from '../src/analyzer/purchase-local-search.js';
import { findBestGreedyIncumbent, verifyGreedyIncumbentWitness } from '../src/solver/tower-incumbent.js';

test('authoritative 1-opt purchase search reaches a stable local optimum', { timeout: 60_000 }, () => {
  const portfolio = findBestGreedyIncumbent();
  const search = optimizePurchasePlanLocally({ seedEntry: portfolio.best, maxPasses: 24 });

  assert.equal(search.seedTerminalHp, 12_536);
  assert.ok(search.bestTerminalHp >= 21_200);
  assert.ok(search.totalImprovement > 0);
  assert.ok(search.improvementPasses >= 8);
  assert.equal(search.bestPlan.length, 30);

  const verification = verifyGreedyIncumbentWitness(search.bestWitness);
  assert.equal(verification.ok, true);
  assert.equal(verification.value, search.bestTerminalHp);

  console.log(`TOWER_PURCHASE_LOCAL_SEARCH ${JSON.stringify({
    seedTerminalHp: search.seedTerminalHp,
    bestTerminalHp: search.bestTerminalHp,
    totalImprovement: search.totalImprovement,
    improvementPasses: search.improvementPasses,
    evaluatedMutations: search.evaluatedMutations,
    localOptimal: search.localOptimal,
    history: search.history,
    bestPlan: search.bestPlan
  })}`);
});
