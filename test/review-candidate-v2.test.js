import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compareReferenceWitnessPurchasePolicy,
  eventOrderWitnessPurchasePlan,
  referenceWitnessMatchesPurchasePolicy
} from '../src/tuner/review-candidate-reference.js';
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

const V2_WITNESSED_PURCHASE_PLAN = [
  'atk', 'atk', 'atk',
  'def', 'def',
  'atk', 'atk',
  'def',
  'atk', 'atk', 'atk',
  'def',
  'atk', 'atk', 'atk', 'atk',
  'def',
  'hp', 'hp',
  'atk',
  'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp'
];

test('distributed-pressure V2 stores the continuation contract for witness reconstruction', () => {
  const candidate = REVIEW_CANDIDATES.distributedPressureV2;
  assert.equal(candidate.sourceContinuationStartStep, 0.6453125);
  assert.equal(candidate.sourceRayStep, 0.8375);
  assert.equal(candidate.expectedEvidence.referenceMode, 'event-order-step-witness');
  assert.equal(candidate.expectedEvidence.terminalHp, 4578);
  assert.equal(candidate.expectedEvidence.referenceWitnessHash, '8623f0ba330d21b3');
  assert.equal(candidate.purchasePolicy.shopPlan.length, 29);
  assert.deepEqual(candidate.purchasePolicy.shopPlan, V2_WITNESSED_PURCHASE_PLAN);
  assert.deepEqual(candidate.edits, [
    { target: 'enemy', id: 'whaleSinger', field: 'magicPower', value: 62 },
    { target: 'shop', id: 'hp', field: 'effect.hp', value: 150 },
    { target: 'shop', id: 'hp', field: 'effect.maxHp', value: 150 },
    { target: 'enemy', id: 'flameCaster', field: 'def', value: 70 }
  ]);
});

test('reference witness exposes its actual purchase sequence and mismatch index', () => {
  const policy = REVIEW_CANDIDATES.distributedPressureV2.purchasePolicy;
  const exactWitness = witness(V2_WITNESSED_PURCHASE_PLAN);
  assert.deepEqual(eventOrderWitnessPurchasePlan(exactWitness), V2_WITNESSED_PURCHASE_PLAN);
  const exact = compareReferenceWitnessPurchasePolicy(exactWitness, policy);
  assert.equal(exact.ok, true);
  assert.equal(exact.firstMismatch, null);

  const changed = [...V2_WITNESSED_PURCHASE_PLAN];
  changed[11] = 'atk';
  const mismatch = compareReferenceWitnessPurchasePolicy(witness(changed), policy);
  assert.equal(mismatch.ok, false);
  assert.deepEqual(mismatch.firstMismatch, {
    index: 11,
    actual: 'atk',
    expected: 'def',
    reason: 'option_mismatch'
  });
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
