import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from './game/data.js';
import { applyDemoTenFloorContent, DEMO_TEN_FLOOR_ID } from './game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode, DEMO10_HARD_MODE_ID } from './game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorProgressionGrammar } from './game/demo-10-floor-progression.js';
import { applyDemoTenFloorSpatialRedesign } from './game/demo-10-floor-spatial-redesign.js';
import { installContentStorageScope } from './game/content-storage-scope.js';

applyDemoTenFloorContent({
  enemies: ENEMIES,
  floors: FLOORS,
  dialogues: DIALOGUES,
  gridSize: GRID_SIZE
});
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
const progressionGrammar = applyDemoTenFloorProgressionGrammar({
  enemies: ENEMIES,
  floors: FLOORS,
  dialogues: DIALOGUES
});
applyDemoTenFloorHardMode({ enemies: ENEMIES });

installContentStorageScope({ contentId: DEMO_TEN_FLOOR_ID });

globalThis.__TOWER_DEMO_CONTENT__ = Object.freeze({
  id: DEMO_TEN_FLOOR_ID,
  mode: DEMO10_HARD_MODE_ID,
  floors: FLOORS.length,
  progression: progressionGrammar
});

globalThis.__TOWER_FORCE_CANVAS__ = true;
await import('./main.js');
const { installTacticalInteractionLayer } = await import('./game/tactical-interaction.js');
void installTacticalInteractionLayer().catch((error) => console.warn('Tactical interaction layer failed:', error));
