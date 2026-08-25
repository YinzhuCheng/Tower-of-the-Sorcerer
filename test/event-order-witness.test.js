import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEventOrderStepWitness,
  EVENT_ORDER_STEP_SKELETON_TYPE,
  extractEventOrderStepSkeleton
} from '../src/analyzer/event-order-witness.js';

function certificate(hash, steps) {
  return { certificateHash: hash, steps };
}

const step = (eventId, resourceHp) => ({
  eventId,
  kind: 'tile',
  automatic: false,
  floorBefore: 0,
  location: [1, 1],
  path: ['up'],
  action: { token: 'enemy:mote' },
  resourcesAfter: { hp: resourceHp },
  structuralAfter: `struct-${resourceHp}`
});

test('event-order skeleton strips numeric snapshots while preserving action order', () => {
  const result = extractEventOrderStepSkeleton([
    certificate('a', [step('first', 100)]),
    certificate('b', [step('second', 50)])
  ]);
  assert.deepEqual(result.certificateHashes, ['a', 'b']);
  assert.deepEqual(result.steps.map((entry) => entry.eventId), ['first', 'second']);
  assert.equal('resourcesAfter' in result.steps[0], false);
  assert.equal('structuralAfter' in result.steps[0], false);
  assert.deepEqual(result.steps[0].path, ['up']);
  assert.deepEqual(result.steps[0].action, { token: 'enemy:mote' });
});

test('event-order witness hash covers the numeric-agnostic action skeleton', () => {
  const witness = buildEventOrderStepWitness({
    candidateId: 'candidate',
    referenceTerminalHp: 7083,
    expectedTerminalHp: 7187,
    certificates: [certificate('a', [step('first', 100)])]
  });
  assert.equal(witness.type, EVENT_ORDER_STEP_SKELETON_TYPE);
  assert.equal(witness.expectedTerminalHp, 7187);
  assert.equal(typeof witness.witnessHash, 'string');
  assert.ok(witness.witnessHash.length > 0);
});
