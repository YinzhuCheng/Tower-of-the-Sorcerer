import test from 'node:test';
import assert from 'node:assert/strict';
import { mutateEventOrderWitnessShopChoice } from '../src/analyzer/event-order-purchase-local-search.js';

function witness() {
  return {
    type: 'event-order-step-skeleton-v1',
    witnessHash: 'old',
    steps: [
      {
        eventId: 'f4:shop:p7:def',
        kind: 'shop',
        automatic: false,
        floorBefore: 3,
        location: [6, 7],
        path: ['up'],
        action: { optionId: 'def' }
      },
      {
        eventId: 'f4:enemy:mote#1',
        kind: 'tile',
        automatic: false,
        floorBefore: 3,
        location: [5, 5],
        path: [],
        action: { token: 'enemy:mote' }
      }
    ]
  };
}

test('shop mutation changes only selected purchase action and updates witness hash', () => {
  const source = witness();
  const changed = mutateEventOrderWitnessShopChoice(source, 0, 'hp');
  assert.equal(source.steps[0].action.optionId, 'def');
  assert.equal(changed.steps[0].action.optionId, 'hp');
  assert.equal(changed.steps[0].eventId, 'f4:shop:p7:hp');
  assert.deepEqual(changed.steps[1], source.steps[1]);
  assert.notEqual(changed.witnessHash, 'old');
});

test('shop mutation rejects non-shop steps', () => {
  assert.throws(() => mutateEventOrderWitnessShopChoice(witness(), 1, 'atk'), /not a shop/);
});
