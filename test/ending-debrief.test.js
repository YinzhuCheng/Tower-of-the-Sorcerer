import test from 'node:test';
import assert from 'node:assert/strict';
import { getEndingDebrief } from '../src/game/ending-debrief.js';

test('a bonded council survivor selects a specific epilogue without changing victory state', () => {
  const state = {
    victory: true,
    alliance: { bonds: { milu: false, lanin: false, yanli: false, yayu: true } },
    council: {
      outcome: {
        survivors: [{ id: 'yayu', name: '影织姬·鸦羽' }],
        modifiers: { labels: ['虚影拆解：最终敌人防御 -16', '影线错位：起源核心失去二连击'] }
      }
    }
  };
  const ending = getEndingDebrief(state);
  assert.equal(ending.kind, 'bonded-survivor');
  assert.equal(ending.title, '影线公开准则');
  assert.equal(ending.completedBondCount, 1);
  assert.match(ending.text, /公开档案/);
  assert.equal(state.victory, true, 'ending lookup is read-only');
});

test('an unbonded survivor receives a distinct but non-punitive open-future epilogue', () => {
  const ending = getEndingDebrief({
    alliance: { bonds: { milu: false, lanin: false, yanli: false, yayu: false } },
    council: { outcome: { survivors: [{ id: 'yanli', name: '龙姬·焰璃' }], modifiers: { labels: [] } } }
  });
  assert.equal(ending.kind, 'open-future');
  assert.equal(ending.title, '仍在练习的自由');
  assert.match(ending.text, /龙姬·焰璃/);
});

test('a completed route and matching council survivor append a hidden witness without changing the main ending', () => {
  const ending = getEndingDebrief({
    doctrine: { selectedId: 'ember', legacyOpen: false },
    alliance: { bonds: { milu: false, lanin: false, yanli: true, yayu: false } },
    council: { outcome: { survivors: [{ id: 'yanli', name: '龙姬·焰璃' }], modifiers: { labels: [] } } }
  });
  assert.equal(ending.kind, 'bonded-survivor');
  assert.equal(ending.hiddenWitness?.id, 'ember');
  assert.match(ending.hiddenWitness?.title ?? '', /赤焰/);
});
