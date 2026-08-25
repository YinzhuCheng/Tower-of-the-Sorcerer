import test from 'node:test';
import assert from 'node:assert/strict';
import { referenceWitnessMatchesPurchasePolicy } from '../src/tuner/review-candidate-reference.js';
import { REVIEW_CANDIDATES } from '../src/tuner/review-candidates.js';

function witness(options) {
  return {
    steps: options.map((optionId, index) => ({
      kind: 'shop',
      eventId: `shop:${index}:${optionId}`,
      action: { optionId }
    }))
  };
}

test('distributed-pressure V2 is repository-resident event-order witness evidence', () => {
  const candidate = REVIEW_CANDIDATES.distributedPressureV2;
  assert.equal(candidate.expectedEvidence.referenceMode, 'event-order-step-witness');
  assert.equal(candidate.expectedEvidence.terminalHp, 4578);
  assert.equal(candidate.expectedEvidence.referenceWitnessHash, '8623f0ba330d21b3');
  assert.equal(candidate.purchasePolicy.shopPlan.length, 29);
  assert.deepEqual(candidate.edits, [
    { target: 'enemy', id: 'whaleSinger', field: 'magicPower', value: 62 },
    { target: 'shop', id: 'hp', field: 'effect.hp', value: 150 },
    { target: 'shop', id: 'hp', field: 'effect.maxHp', value: 150 },
    { target: 'enemy', id: 'flameCaster', field: 'def', value: 70 }
  ]);
});

test('reference witness purchase sequence must match the fixed candidate policy', () => {
  const policy = REVIEW_CANDIDATES.distributedPressureV2.purchasePolicy;
  assert.equal(referenceWitnessMatchesPurchasePolicy(witness(policy.shopPlan), policy), true);
  const changed = [...policy.shopPlan];
  changed[3] = changed[3] === 'atk' ? 'def' : 'atk';
  assert.equal(referenceWitnessMatchesPurchasePolicy(witness(changed), policy), false);
});

test('reference witness may end before cycle fallback but cannot disagree with any used purchase', () => {
  const policy = { shopPlan: ['atk'], shopCycle: ['def', 'hp'] };
  assert.equal(referenceWitnessMatchesPurchasePolicy(witness(['atk']), policy), true);
  assert.equal(referenceWitnessMatchesPurchasePolicy(witness(['atk', 'hp', 'def']), policy), true);
  assert.equal(referenceWitnessMatchesPurchasePolicy(witness(['atk', 'def']), policy), false);
});
