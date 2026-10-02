import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/game/engine.js';
import { getHiddenWitnessEnding } from '../src/game/hidden-witnesses.js';
import { selectRouteDoctrine } from '../src/game/route-doctrines.js';

function selectedWitnessState(doctrineId) {
  const state = createInitialState();
  state.floor = 10;
  assert.equal(selectRouteDoctrine(state, doctrineId).ok, true);
  return state;
}

test('a hidden witness ending appears automatically only for the selected route, completed bond and surviving ally', () => {
  const state = selectedWitnessState('ember');
  state.alliance.bonds.yanli = true;
  state.council.outcome = { survivors: [{ id: 'yanli', name: '龙姬·焰璃' }] };

  const witness = getHiddenWitnessEnding(state);
  assert.equal(witness?.id, 'ember');
  assert.match(witness?.title ?? '', /赤焰/);
  assert.match(witness?.text ?? '', /焰璃/);
});

test('an unmet route or a different council survivor remains a normal ending and creates no hidden witness', () => {
  const state = selectedWitnessState('tide');
  state.alliance.bonds.lanin = true;
  state.council.outcome = { survivors: [{ id: 'yanli', name: '龙姬·焰璃' }] };
  assert.equal(getHiddenWitnessEnding(state), null);

  state.council.outcome = { survivors: [{ id: 'lanin', name: '深蓝歌姬·澜音' }] };
  state.alliance.bonds.lanin = false;
  assert.equal(getHiddenWitnessEnding(state), null);
});
