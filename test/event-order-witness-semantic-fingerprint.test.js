import test from 'node:test';
import assert from 'node:assert/strict';
import { eventOrderWitnessSemanticFingerprint } from '../src/analyzer/event-order-witness.js';

function witness({ source = ['cert-a'], firstPath = ['UP'], shop = 'atk', reverse = false } = {}) {
  const steps = [
    {
      eventId: 'f1:enemy:mote#1', kind: 'tile', automatic: false, floorBefore: 0,
      location: [2, 2], path: firstPath, action: { token: 'enemy:mote', parsed: { type: 'enemy', id: 'mote' }, path: firstPath }
    },
    {
      eventId: `f1:shop:shop#1:${shop}`, kind: 'shop', automatic: false, floorBefore: 0,
      location: [7, 7], path: ['RIGHT'], action: { optionId: shop, path: ['RIGHT'] }
    }
  ];
  return {
    type: 'event-order-step-skeleton-v1',
    sourceCertificateHashes: source,
    steps: reverse ? [...steps].reverse() : steps
  };
}

test('semantic witness fingerprint ignores proof provenance and zero-cost movement paths', () => {
  const a = eventOrderWitnessSemanticFingerprint(witness());
  const b = eventOrderWitnessSemanticFingerprint(witness({
    source: ['different-cert', 'another-cert'],
    firstPath: ['LEFT', 'DOWN', 'RIGHT']
  }));
  assert.equal(a, b);
});

test('semantic witness fingerprint changes when a strategic shop choice changes', () => {
  const a = eventOrderWitnessSemanticFingerprint(witness({ shop: 'atk' }));
  const b = eventOrderWitnessSemanticFingerprint(witness({ shop: 'def' }));
  assert.notEqual(a, b);
});

test('semantic witness fingerprint changes when macro event order changes', () => {
  const a = eventOrderWitnessSemanticFingerprint(witness());
  const b = eventOrderWitnessSemanticFingerprint(witness({ reverse: true }));
  assert.notEqual(a, b);
});
