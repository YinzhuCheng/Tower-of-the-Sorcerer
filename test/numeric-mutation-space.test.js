import test from 'node:test';
import assert from 'node:assert/strict';
import {
  listNumericMutationParameters,
  materializeNumericMutation,
  proposeDirectionalMutation
} from '../src/tuner/numeric-mutation-space.js';

function byKey(parameters, key) {
  const found = parameters.find((entry) => entry.key === key);
  assert.ok(found, `Missing numeric parameter: ${key}`);
  return found;
}

test('numeric catalogue keeps semantic HP pairs coupled and excludes generic card/relic mutation', () => {
  const parameters = listNumericMutationParameters();
  const shopHp = byKey(parameters, 'shop:hp:effect.hp+effect.maxHp');
  const itemHp = byKey(parameters, 'item:hp:hp+maxHp');
  const voidMagic = byKey(parameters, 'enemy:voidCore:magicPower');

  assert.deepEqual(shopHp.fields, ['effect.hp', 'effect.maxHp']);
  assert.deepEqual(itemHp.fields, ['hp', 'maxHp']);
  assert.equal(voidMagic.role, 'hazard');
  assert.equal(parameters.some((entry) => entry.id === 'sun' && entry.target === 'item'), false);
  assert.equal(parameters.some((entry) => entry.id === 'holy' && entry.target === 'item'), false);
});

test('harder direction raises hazards and reduces supplies', () => {
  const parameters = listNumericMutationParameters();
  const shopHp = byKey(parameters, 'shop:hp:effect.hp+effect.maxHp');
  const voidMagic = byKey(parameters, 'enemy:voidCore:magicPower');

  const lessHp = proposeDirectionalMutation(shopHp, { relativeStep: 0.10, direction: 'harder' });
  const moreMagic = proposeDirectionalMutation(voidMagic, { relativeStep: 0.10, direction: 'harder' });

  assert.ok(lessHp.value < shopHp.baseline);
  assert.ok(moreMagic.value > voidMagic.baseline);
  assert.equal(lessHp.edits.length, 2);
  assert.deepEqual(
    materializeNumericMutation(shopHp, lessHp.value).map((edit) => edit.field),
    ['effect.hp', 'effect.maxHp']
  );
});
