import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createHolyPolicyTowerAdapter,
  extractShopPlanFromSolverCertificate,
  filterHolyPolicyActions,
  holyPolicyTriggerReached
} from '../src/solver/holy-policy-adapter.js';

const holy = { kind: 'tile', parsed: { type: 'item', id: 'holy' }, eventId: 'holy' };
const enemy = (id) => ({ kind: 'tile', parsed: { type: 'enemy', id }, eventId: id });
const shop = (optionId) => ({ kind: 'shop', action: { optionId } });

test('Holy policy filter blocks early pickup and releases it at the policy trigger', () => {
  const early = { cores: 5, relics: { holy: false } };
  assert.equal(holyPolicyTriggerReached(early, 'after-core-6', [holy]), false);
  assert.deepEqual(filterHolyPolicyActions(early, [holy, enemy('mote')], 'after-core-6'), [enemy('mote')]);

  const six = { cores: 6, relics: { holy: false } };
  assert.equal(holyPolicyTriggerReached(six, 'after-core-6', [holy]), true);
  assert.equal(filterHolyPolicyActions(six, [holy], 'after-core-6').length, 1);

  const beforeFinal = { cores: 7, relics: { holy: false } };
  assert.equal(holyPolicyTriggerReached(beforeFinal, 'before-final', [holy, enemy('mote')]), false);
  assert.equal(holyPolicyTriggerReached(beforeFinal, 'before-final', [holy, enemy('finalQueen')]), true);
});

test('certificate shop-plan extraction preserves purchase order', () => {
  const certificate = {
    steps: [
      { kind: 'tile', action: { token: 'item:atk' } },
      shop('def'),
      shop('hp'),
      { kind: 'enemy', action: { token: 'enemy:mote' } },
      shop('atk')
    ]
  };
  assert.deepEqual(extractShopPlanFromSolverCertificate(certificate), ['def', 'hp', 'atk']);
});

test('default Holy-policy proof reuses canonical-travel frontier semantics', () => {
  const adapter = createHolyPolicyTowerAdapter({ holyPolicy: 'after-core-6' });
  assert.match(adapter.rulesVersion(), /canonical-travel-v1/);
  assert.match(adapter.rulesVersion(), /holy-policy:after-core-6/);
  assert.equal(typeof adapter.frontierKey, 'function');
});
