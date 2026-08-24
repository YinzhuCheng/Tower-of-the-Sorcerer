import test from 'node:test';
import assert from 'node:assert/strict';
import { synthesizeBudgetedNumericCandidates } from '../src/tuner/numeric-candidate-synthesis.js';

function probe({ key, target, id, floor, family = 'enemy', fields = ['def'], screenScore, improvement, relativeEdit = 0.1 }) {
  return {
    parameter: { key, target, id, floor, family, fields },
    mutation: {
      baseline: 100,
      value: 110,
      relativeEdit,
      edits: [{ target, id, field: fields[0], value: 110 }]
    },
    cliffAtProbe: false,
    routeSolvable: true,
    targetImprovement: improvement,
    pressureGain: improvement,
    screenScore,
    traceScore: screenScore
  };
}

test('budgeted synthesis does not stack multiple fields from the same entity/floor by default', () => {
  const screenReport = {
    probes: [
      probe({ key: 'shop:hp', target: 'shop', id: 'hp', floor: null, family: 'shop', fields: ['effect.hp'], screenScore: 10, improvement: 0.4 }),
      probe({ key: 'enemy:whale:def', target: 'enemy', id: 'whaleSinger', floor: 3, screenScore: 8, improvement: 0.3 }),
      probe({ key: 'enemy:whale:hp', target: 'enemy', id: 'whaleSinger', floor: 3, fields: ['hp'], screenScore: 7, improvement: 0.25 }),
      probe({ key: 'enemy:flame:def', target: 'enemy', id: 'flameCaster', floor: 5, screenScore: 6, improvement: 0.2 }),
      probe({ key: 'enemy:star:magic', target: 'enemy', id: 'starWitch', floor: 6, fields: ['magicPower'], screenScore: 5, improvement: 0.15 })
    ]
  };

  const candidates = synthesizeBudgetedNumericCandidates({
    screenReport,
    maxCandidates: 5,
    maxParameters: 3,
    editBudget: 0.3
  });

  assert.ok(candidates.length > 0);
  for (const candidate of candidates) {
    assert.ok(candidate.parameterCount >= 2);
    assert.ok(candidate.parameterCount <= 3);
    assert.ok(candidate.editBudgetUsed <= 0.3 + 1e-12);
    assert.equal(new Set(candidate.leverKeys).size, candidate.leverKeys.length);
    assert.equal(
      candidate.leverKeys.filter((key) => key.includes('enemy:whale')).length <= 1,
      true,
      'one candidate should not stack multiple whaleSinger fields'
    );
  }
});
