import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const { createInitialState, getEffectiveEnemy } = await import('../src/game/engine.js');
const { getBossProtocolBriefing, isVoidAuditComplete } = await import('../src/game/boss-protocols.js');

test('F18 void audit is a visible card-and-battle tradeoff that deterministically weakens Echo Regent', () => {
  const state = createInitialState();
  const base = getEffectiveEnemy(state, 'echoRegent');
  assert.equal(isVoidAuditComplete(state), false);
  assert.equal(getBossProtocolBriefing(state)[0].active, false);

  const f18 = state.floorStates.findIndex((floor, index) => FLOORS[index].number === 18);
  for (const row of state.floorStates[f18].map) {
    const index = row.indexOf('enemy:voidHerald');
    if (index >= 0) row[index] = '.';
  }
  const audited = getEffectiveEnemy(state, 'echoRegent');
  assert.equal(isVoidAuditComplete(state), true);
  assert.equal(audited.protocolModified, true);
  assert.equal(audited.hp, Math.round(base.hp * 0.82));
  assert.equal(audited.magicPower, base.magicPower - 45);
  assert.equal(getBossProtocolBriefing(state)[0].active, true);
});
