import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISTRIBUTED_PRESSURE_LEVER_KEYS,
  classifyEventOrderWitnessRaySample,
  findNumericRayCandidateByLeverKeys
} from '../src/tuner/event-order-witness-ray.js';

test('numeric ray candidate selection matches lever sets rather than unstable IDs', () => {
  const candidates = [
    { id: 'numeric-combo-99', leverKeys: ['other:a', 'other:b'] },
    {
      id: 'renumbered-candidate',
      leverKeys: [
        DISTRIBUTED_PRESSURE_LEVER_KEYS[2],
        DISTRIBUTED_PRESSURE_LEVER_KEYS[0],
        DISTRIBUTED_PRESSURE_LEVER_KEYS[1]
      ]
    }
  ];
  const selected = findNumericRayCandidateByLeverKeys(candidates);
  assert.equal(selected.id, 'renumbered-candidate');
});

test('event-order witness ray classification treats route failure as hard-side evidence only', () => {
  assert.equal(classifyEventOrderWitnessRaySample({ solvable: false, margin: null }), 'too_hard_or_failed');
  assert.equal(classifyEventOrderWitnessRaySample({ solvable: true, margin: 0.40 }, 0.165), 'too_easy');
  assert.equal(classifyEventOrderWitnessRaySample({ solvable: true, margin: 0.10 }, 0.165), 'too_hard');
  assert.equal(classifyEventOrderWitnessRaySample({ solvable: true, margin: 0.165 }, 0.165), 'target');
});

test('lever set selection rejects partial overlap', () => {
  const selected = findNumericRayCandidateByLeverKeys([
    {
      id: 'partial',
      leverKeys: DISTRIBUTED_PRESSURE_LEVER_KEYS.slice(0, 2)
    }
  ]);
  assert.equal(selected, null);
});
