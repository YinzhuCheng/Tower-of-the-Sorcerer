import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSinglePurchaseCounterfactuals } from '../src/analyzer/purchase-counterfactuals.js';
import { findBestKnownIncumbent, verifyGreedyIncumbentWitness } from '../src/solver/tower-incumbent.js';

test('promoted 26k purchase plan replays and is 1-opt stable', { timeout: 30_000 }, () => {
  const known = findBestKnownIncumbent();
  const incumbent = known.best;

  assert.equal(incumbent.id, 'purchase-1opt-v1');
  assert.equal(incumbent.source, 'promoted-plan');
  assert.equal(incumbent.result.final.hp, 26_041);
  assert.equal(incumbent.shopPlan.length, 30);

  const verification = verifyGreedyIncumbentWitness(incumbent.witness);
  assert.equal(verification.ok, true);
  assert.equal(verification.value, 26_041);

  const neighborhood = analyzeSinglePurchaseCounterfactuals({ bestEntry: incumbent });
  assert.equal(neighborhood.totalMutations, 60);
  assert.equal(neighborhood.improvedMutationCount, 0);
  assert.ok(neighborhood.bestMutation?.terminalHp <= 26_041);
  assert.equal(neighborhood.bestImprovementWitness, null);

  console.log(`TOWER_PROMOTED_INCUMBENT ${JSON.stringify({
    id: incumbent.id,
    terminalHp: incumbent.result.final.hp,
    purchaseCounts: incumbent.result.purchaseCounts,
    bestNeighbor: neighborhood.bestMutation,
    recoveryRate: neighborhood.recoveryRate,
    catastrophicRate: neighborhood.catastrophicRate,
    highRegretRate: neighborhood.highRegretRate,
    p90NormalizedRegret: neighborhood.p90NormalizedRegret,
    plan: incumbent.shopPlan
  })}`);
});
