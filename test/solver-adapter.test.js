import test from 'node:test';
import assert from 'node:assert/strict';
import { createTowerAdapter } from '../src/solver/tower-adapter.js';

test('Tower adapter compiles canonical mechanics into a macro state', () => {
  const adapter = createTowerAdapter();
  const raw = adapter.createInitialState();
  const normalized = adapter.normalize(adapter.cloneState(raw));

  const key = adapter.structuralKey(normalized.state);
  assert.doesNotThrow(() => JSON.parse(key));
  assert.ok(adapter.contentHash());
  assert.match(adapter.rulesVersion(), /^game-v\d+$/);

  // Resource-only improvements must remain in R rather than accidentally
  // changing the structural key K.
  const resourceOnly = adapter.cloneState(normalized.state);
  resourceOnly.stats.hp += 1;
  assert.equal(adapter.structuralKey(resourceOnly), key);

  const structuralChange = adapter.cloneState(normalized.state);
  structuralChange.shopPurchases += 1;
  assert.notEqual(adapter.structuralKey(structuralChange), key);

  // Holy is strategically order-sensitive and may never disappear into the
  // automatic closure.
  assert.equal(
    normalized.steps.some((step) => step.eventId.includes(':item:holy:')),
    false
  );

  const actions = adapter.enumerateActions(normalized.state);
  assert.ok(actions.length > 0, 'initial macro frontier should not be empty');
  assert.ok(actions.every((action) => typeof action.eventId === 'string' && action.eventId.length > 0));

  const applied = adapter.applyAction(adapter.cloneState(normalized.state), actions[0]);
  assert.equal(applied.ok, true, `enumerated action should be legal: ${applied.reason ?? ''}`);
  assert.ok(applied.steps.length > 0);
});
