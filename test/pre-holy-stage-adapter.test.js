import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPreHolyStageAdapter,
  filterPreHolyActions
} from '../src/solver/pre-holy-stage-adapter.js';

const holy = { kind: 'tile', parsed: { type: 'item', id: 'holy' } };
const boss = { kind: 'tile', parsed: { type: 'enemy', id: 'astralBoss' } };
const mote = { kind: 'tile', parsed: { type: 'enemy', id: 'mote' } };

function fakeBase(actions = []) {
  return {
    enumerateActions: () => actions,
    isGoal: () => false,
    priority: (state) => state.cores * 100,
    stageKey: (state) => `f${state.floor + 1}/c${state.cores}`,
    rulesVersion: () => 'fake-v1'
  };
}

test('pre-Holy action filter removes Holy but preserves other actions', () => {
  assert.deepEqual(filterPreHolyActions([holy, mote, boss]), [mote, boss]);
});

test('F6 entry boundary requires floor 6, five cores and no Holy', () => {
  const adapter = createPreHolyStageAdapter({ stage: 'f6Entry', baseAdapter: fakeBase([]) });
  assert.equal(adapter.isGoal({ cores: 5, floor: 5, relics: { holy: false } }), true);
  assert.equal(adapter.isGoal({ cores: 4, floor: 5, relics: { holy: false } }), false);
  assert.equal(adapter.isGoal({ cores: 5, floor: 4, relics: { holy: false } }), false);
  assert.equal(adapter.isGoal({ cores: 5, floor: 5, relics: { holy: true } }), false);
});

test('preBoss stage requires a currently legal astralBoss action without Holy', () => {
  const adapter = createPreHolyStageAdapter({ stage: 'preBoss', baseAdapter: fakeBase([boss]) });
  assert.equal(adapter.isGoal({ cores: 5, floor: 5, relics: { holy: false } }), true);
  assert.equal(adapter.isGoal({ cores: 5, floor: 5, relics: { holy: true } }), false);

  const blocked = createPreHolyStageAdapter({ stage: 'preBoss', baseAdapter: fakeBase([mote]) });
  assert.equal(blocked.isGoal({ cores: 5, floor: 5, relics: { holy: false } }), false);
});

test('core6 stage requires sixth core before Holy', () => {
  const adapter = createPreHolyStageAdapter({ stage: 'core6', baseAdapter: fakeBase([]) });
  assert.equal(adapter.isGoal({ cores: 5, floor: 5, relics: { holy: false } }), false);
  assert.equal(adapter.isGoal({ cores: 6, floor: 5, relics: { holy: false } }), true);
  assert.equal(adapter.isGoal({ cores: 6, floor: 5, relics: { holy: true } }), false);
});

test('default pre-Holy stage proof reuses the proven canonical-travel adapter', () => {
  const adapter = createPreHolyStageAdapter({ stage: 'core6' });
  const rules = adapter.rulesVersion();
  assert.match(rules, /canonical-travel-v1/);
  assert.match(rules, /pre-holy-stage:core6/);
  assert.equal(typeof adapter.frontierKey, 'function');
});
