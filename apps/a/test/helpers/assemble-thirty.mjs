import * as data from '../../src/game/data.js';
import { applyDemoTenFloorContent } from '../../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode } from '../../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTwentyFloorContent } from '../../src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent } from '../../src/game/demo-30-floor-content.js';
let phase = 0;
export function assemble10() {
  if (phase !== 0) throw Error('Campaign already installed');
  const {ENEMIES:enemies,FLOORS:floors,DIALOGUES:dialogues,GRID_SIZE:gridSize}=data;
  applyDemoTenFloorContent({enemies,floors,dialogues,gridSize});
  applyDemoTenFloorProgressionTopology({enemies,floors});
  applyDemoTenFloorSpatialRedesign({floors,gridSize});
  applyDemoTenFloorProgressionGrammar({enemies,floors,dialogues});
  applyDemoTenFloorPalaceSpatialRedesign({floors,gridSize});
  applyDemoTenFloorHardMode({enemies}); phase=10;
  return data;
}
export function extend30() {
  if(phase!==10) throw Error('Need exact installed 10F prefix');
  const {ENEMIES:enemies,FLOORS:floors,DIALOGUES:dialogues,ITEMS:items}=data;
  applyDemoTwentyFloorContent({enemies,floors,items,dialogues});
  applyDemoThirtyFloorContent({enemies,floors,items,dialogues}); phase=30;
  return data;
}
export function assemble30(){assemble10();return extend30();}
export function snapshot(){return {enemies:data.ENEMIES,floors:data.FLOORS,items:data.ITEMS,dialogues:data.DIALOGUES,shop:data.SHOP_OPTIONS};}
export function installPureData(result){
  if(phase!==30)throw Error('Only complete 30F data may receive the offline overlay');
  for(const [k,v]of Object.entries(result.data.enemies))data.ENEMIES[k]=structuredClone(v);
  for(const [k,v]of Object.entries(result.data.items))data.ITEMS[k]=structuredClone(v);
}
