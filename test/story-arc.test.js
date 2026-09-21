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

test('the 30-floor dialogue tells a complete fantasy three-act story', () => {
  const introIds = ['prologue', 'floor2', 'floor3', 'floor4', 'floor5', 'floor6', 'floor7', 'floor8', 'floor9', 'floor10'];
  const middleIds = ['floor11', 'floor12', 'floor13', 'floor14', 'floor15', 'floor16', 'floor17', 'floor18', 'floor19', 'floor20'];
  const endingIds = ['floor21', 'floor22', 'floor23', 'floor24', 'floor25', 'floor26', 'floor27', 'floor28', 'floor29', 'floor30', 'ending'];
  const actOneEvidence = [...introIds, 'bossWhalePostDemo', 'bossAstralPostDemo', 'bossBlackSealPostDemo', 'bossQueenPostDemo'];

  const mainSceneIds = [...introIds, ...middleIds, ...endingIds];
  for (const id of mainSceneIds) {
    const turns = DIALOGUES[id]?.turns;
    assert.ok(Array.isArray(turns) && turns.length > 0, `${id} needs a readable Gal scene`);
    assert.ok(turns.every((turn) => turn.speaker && turn.text), `${id} needs complete dialogue turns`);
    assert.ok(turns.some((turn) => turn.kind === 'narration' || turn.speaker === '旁白'), `${id} needs scene-setting narration`);
  }

  assert.match(sceneText(actOneEvidence), /北辰七号/);
  assert.match(sceneText(actOneEvidence), /(七段咏唱|七声|七枚核心)/);
  assert.match(sceneText(actOneEvidence), /(续夜之印|守夜)/);

  assert.match(sceneText(middleIds), /十七分钟/);
  assert.match(sceneText(middleIds), /归航/);
  assert.match(sceneText(middleIds), /(记忆晶|旧夜残响)/);
  assert.match(sceneText(middleIds), /(万名灯殿|灯海)/);
  assert.match(sceneText(middleIds), /(七灯同时熄灭|守夜终仪|归航钟)/);

  assert.match(sceneText(endingIds), /(月影|护信)/);
  assert.match(sceneText(endingIds), /(星镜|辨真)/);
  assert.match(sceneText(endingIds), /(赤焰|传火)/);
  assert.match(sceneText(endingIds), /(书页风暴|未寄|家书)/);
  assert.match(sceneText(endingIds), /(余烬灯塔|灯塔)/);
  assert.match(sceneText(endingIds), /(守夜已终|名字长存)/);
});
test('the rewritten story keeps every act readable without procedural exposition bloat', () => {
  const acts = [
    ['prologue', 'floor2', 'floor3', 'floor4', 'floor5', 'floor6', 'floor7', 'floor8', 'floor9', 'floor10'],
    ['floor11', 'floor12', 'floor13', 'floor14', 'floor15', 'floor16', 'floor17', 'floor18', 'floor19', 'floor20'],
    ['floor21', 'floor22', 'floor23', 'floor24', 'floor25', 'floor26', 'floor27', 'floor28', 'floor29', 'floor30', 'ending']
  ];

  acts.forEach((ids, actIndex) => {
    const turns = ids.flatMap((id) => DIALOGUES[id].turns);
    assert.ok(turns.length >= ids.length * 3, `Act ${actIndex + 1} needs enough authored beats to remain readable`);
    assert.ok(ids.every((id) => DIALOGUES[id].turns.some((turn) => turn.kind === 'narration' || turn.speaker === '旁白')), `Act ${actIndex + 1} floor scenes need environmental or action narration`);
  });

  const playerFacing = acts.flat().flatMap((id) => DIALOGUES[id].turns).map((turn) => turn.text).join('\n');
  assert.doesNotMatch(playerFacing, /(写入口|原始解析器|缓存|终端弹出|登记库立即报错|未授权篡改|三套修复章程)/);
});
