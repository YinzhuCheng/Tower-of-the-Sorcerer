import test from 'node:test';
import assert from 'node:assert/strict';
import { createTowerAdapter } from '../src/solver/tower-adapter.js';

test('Tower adapter stores labels as compact event-vector states', () => {
  const adapter = createTowerAdapter();
  const raw = adapter.createInitialState();
  assert.equal(adapter.stateEncoding, 'event-vector-v1');
  assert.equal(raw.floorStates, undefined, 'solver labels must not retain eight full dynamic maps');
  assert.ok(Array.isArray(raw.eventStates));
  assert.ok(raw.eventStates.length > 0);

  const materialized = adapter.materializeState(raw);
  assert.ok(Array.isArray(materialized.floorStates));
  assert.equal(adapter.structuralKey(materialized), adapter.structuralKey(raw));
});

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
    normalized.steps.some((step) => step.eventId.includes(':item:holy')),
    false
  );

  const actions = adapter.enumerateActions(normalized.state);
  assert.ok(actions.length > 0, 'initial macro frontier should not be empty');
  assert.ok(actions.every((action) => typeof action.eventId === 'string' && action.eventId.length > 0));

  const applied = adapter.applyAction(adapter.cloneState(normalized.state), actions[0]);
  assert.equal(applied.ok, true, `enumerated action should be legal: ${applied.reason ?? ''}`);
  assert.ok(applied.steps.length > 0);
});

test('Tower event catalog uses coordinate-free certificate identifiers', () => {
  const adapter = createTowerAdapter();
  const catalog = adapter.eventCatalog();
  assert.equal(catalog.schemaVersion, 1);
  assert.ok(catalog.dynamicSlots > 50);
  assert.ok(catalog.events.every((event) => !event.eventId.includes(`${event.x},${event.y}`)));
  assert.ok(catalog.counts.enemy > 0);
  assert.ok(catalog.counts.item > 0);
});
