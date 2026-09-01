import assert from 'node:assert/strict';
import test from 'node:test';

import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent } from '../src/game/demo-30-floor-content.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
applyDemoThirtyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

function sceneText(ids) {
  return ids.flatMap((id) => DIALOGUES[id]?.turns ?? []).map((turn) => turn.text).join('\n');
}

test('the 30-floor dialogue tells a complete, skippable three-act story', () => {
  const introIds = ['prologue', 'floor2', 'floor3', 'floor4', 'floor5', 'floor6', 'floor7', 'floor8', 'floor9', 'floor10'];
  const middleIds = ['floor11', 'floor12', 'floor13', 'floor14', 'floor15', 'floor16', 'floor17', 'floor18', 'floor19', 'floor20'];
  const endingIds = ['floor21', 'floor22', 'floor23', 'floor24', 'floor25', 'floor26', 'floor27', 'floor28', 'floor29', 'floor30', 'ending'];
  const actOneEvidence = [...introIds, 'bossWhalePostDemo', 'bossAstralPostDemo', 'bossBlackSealPostDemo', 'bossQueenPostDemo'];

  for (const id of [...introIds, ...middleIds, ...endingIds]) {
    const turns = DIALOGUES[id]?.turns;
    assert.ok(Array.isArray(turns) && turns.length >= 2 && turns.length <= 5, `${id} needs a compact Gal scene`);
    assert.ok(turns.every((turn) => turn.speaker && turn.text), `${id} needs complete dialogue turns`);
  }

  assert.match(sceneText(actOneEvidence), /灰港撤离/);
  assert.match(sceneText(actOneEvidence), /离港确认/);
  assert.match(sceneText(middleIds), /三日后必须撤销/);
  assert.match(sceneText(middleIds), /主权签名/);
  assert.match(sceneText(middleIds), /死亡名簿/);
  assert.match(sceneText(endingIds), /三套修复章程/);
  assert.match(sceneText(endingIds), /归档模式/);
  assert.match(sceneText(endingIds), /记录留下，命令结束/);
});
