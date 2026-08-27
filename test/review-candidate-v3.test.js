import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compareReferenceWitnessPurchasePolicy,
  referenceWitnessMatchesPurchasePolicy
} from '../src/tuner/review-candidate-reference.js';
import { REVIEW_CANDIDATES } from '../src/tuner/review-candidates.js';

function shopWitness(options) {
  return {
    steps: options.map((optionId, index) => ({
      kind: 'shop',
      eventId: `shop:${index}:${optionId}`,
      action: { optionId }
    }))
  };
}

const V3_PLAN = [
  'def', 'def', 'def',
  'atk', 'atk', 'atk', 'atk',
  'def',
  'atk', 'atk', 'atk',
  'def',
  'atk', 'atk', 'atk', 'atk', 'atk',
  'hp', 'hp',
  'atk',
  'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp'
];

test('distributed-pressure V3 persists the coupled local-pass seed without enabling production writes', () => {
  const candidate = REVIEW_CANDIDATES.distributedPressureV3;
  assert.equal(candidate.productionWriteAllowed, false);
  assert.equal(candidate.sourceCandidateId, 'distributed-pressure-v2');
  assert.equal(candidate.sourceRepairSeedId, 'v2-local-repair-seed-2026-08-26');
  assert.deepEqual(candidate.edits, [
    { target: 'enemy', id: 'whaleSinger', field: 'magicPower', value: 62 },
    { target: 'shop', id: 'hp', field: 'effect.hp', value: 150 },
    { target: 'shop', id: 'hp', field: 'effect.maxHp', value: 150 },
    { target: 'enemy', id: 'flameCaster', field: 'def', value: 44 },
    { target: 'enemy', id: 'dragonBoss', field: 'atk', value: 111 },
    { target: 'enemy', id: 'cometArcher', field: 'atk', value: 200 }
  ]);
  assert.equal(candidate.expectedEvidence.terminalHp, 4459);
  assert.equal(candidate.expectedEvidence.minNormalizedHpMargin, 0.24545454545454545);
  assert.equal(candidate.expectedEvidence.referenceWitnessHash, '5f2eaa7dcee33508');
  assert.equal(candidate.expectedEvidence.referenceSemanticFingerprint, 'f7471edbeb30498d');
  assert.equal(candidate.expectedEvidence.localCatastrophicMutations, 4);
  assert.deepEqual(candidate.purchasePolicy.shopPlan, V3_PLAN);
});

test('V3 fixed purchase policy exactly matches its local-pass reference plan', () => {
  const candidate = REVIEW_CANDIDATES.distributedPressureV3;
  const witness = shopWitness(V3_PLAN);
  const comparison = compareReferenceWitnessPurchasePolicy(witness, candidate.purchasePolicy);
  assert.equal(comparison.ok, true);
  assert.equal(referenceWitnessMatchesPurchasePolicy(witness, candidate.purchasePolicy), true);
});
