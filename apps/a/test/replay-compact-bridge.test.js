import test from 'node:test';
import assert from 'node:assert/strict';
import { replayTowerCertificate } from '../src/solver/replay.js';
import { createTowerAdapter } from '../src/solver/tower-adapter.js';
import { hashValue } from '../src/solver/state.js';

test('explicit compact bridge state is cloned directly instead of compacted twice', () => {
  const base = createTowerAdapter();
  const compact = base.createInitialState();
  compact.victory = true;
  compact.stats.hp = 1234;

  const engine = base.materializeState(base.cloneState(compact));
  assert.deepEqual(
    base.summarizeState(compact),
    base.summarizeState(engine),
    'compact and materialized bridge summaries must hash identically'
  );

  const certificate = {
    schemaVersion: 1,
    initialStateHash: hashValue(base.summarizeState(compact)),
    steps: []
  };
  const replay = replayTowerCertificate(certificate, {
    adapter: base,
    initialState: compact
  });

  assert.equal(replay.ok, true);
  assert.deepEqual(replay.failures, []);
  assert.equal(replay.objective, 1234);
});

test('explicit engine-shaped replay input remains supported by Tower cloneState', () => {
  const base = createTowerAdapter();
  const compact = base.createInitialState();
  compact.victory = true;
  const engine = base.materializeState(compact);

  const certificate = {
    schemaVersion: 1,
    initialStateHash: hashValue(base.summarizeState(engine)),
    steps: []
  };
  const replay = replayTowerCertificate(certificate, {
    adapter: base,
    initialState: engine
  });

  assert.equal(replay.ok, true);
  assert.deepEqual(replay.failures, []);
});
