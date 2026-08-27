import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from './game/data.js';
import { applyDemoTenFloorContent } from './game/demo-10-floor-content.js';

applyDemoTenFloorContent({
  enemies: ENEMIES,
  floors: FLOORS,
  dialogues: DIALOGUES,
  gridSize: GRID_SIZE
});

globalThis.__TOWER_DEMO_CONTENT__ = Object.freeze({
  id: 'demo-10f-v1',
  floors: FLOORS.length
});

await import('./main.js');
