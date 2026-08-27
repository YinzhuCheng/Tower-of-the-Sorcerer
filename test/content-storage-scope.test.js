import test from 'node:test';
import assert from 'node:assert/strict';
import { contentScopedStorageKey, installContentStorageScope } from '../src/game/content-storage-scope.js';

test('content storage scope rewrites only game-state save keys', () => {
  assert.equal(
    contentScopedStorageKey('lost-magic-tower:manual:v1', 'demo-10f-v1'),
    'lost-magic-tower:demo-10f-v1:manual:v1'
  );
  assert.equal(
    contentScopedStorageKey('lost-magic-tower:auto:v1', 'demo-10f-v1'),
    'lost-magic-tower:demo-10f-v1:auto:v1'
  );
  assert.equal(
    contentScopedStorageKey('lost-magic-tower:theme:v1', 'demo-10f-v1'),
    'lost-magic-tower:theme:v1'
  );
});

test('installed storage scope keeps canonical keys isolated behind the prototype', () => {
  const backing = new Map();
  const fakeStoragePrototype = {
    getItem(key) { return backing.has(key) ? backing.get(key) : null; },
    setItem(key, value) { backing.set(key, String(value)); },
    removeItem(key) { backing.delete(key); }
  };
  const storage = Object.create(fakeStoragePrototype);

  const installed = installContentStorageScope({
    contentId: 'demo-10f-v1',
    storagePrototype: fakeStoragePrototype
  });
  assert.equal(installed.installed, true);

  storage.setItem('lost-magic-tower:manual:v1', 'ten-floor-state');
  storage.setItem('lost-magic-tower:theme:v1', 'night');

  assert.equal(backing.get('lost-magic-tower:demo-10f-v1:manual:v1'), 'ten-floor-state');
  assert.equal(backing.has('lost-magic-tower:manual:v1'), false);
  assert.equal(backing.get('lost-magic-tower:theme:v1'), 'night');
  assert.equal(storage.getItem('lost-magic-tower:manual:v1'), 'ten-floor-state');

  storage.removeItem('lost-magic-tower:manual:v1');
  assert.equal(backing.has('lost-magic-tower:demo-10f-v1:manual:v1'), false);

  const repeated = installContentStorageScope({
    contentId: 'demo-10f-v1',
    storagePrototype: fakeStoragePrototype
  });
  assert.equal(repeated.installed, false);
});
