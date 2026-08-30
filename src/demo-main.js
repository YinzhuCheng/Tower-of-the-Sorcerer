import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from './game/data.js';
import { applyDemoTwentyFloorContent, DEMO20_CONTENT_ID } from './game/demo-20-floor-content.js';
import { applyDemoTenFloorContent } from './game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode, DEMO10_HARD_MODE_ID } from './game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorProgressionGrammar } from './game/demo-10-floor-progression.js';
import { applyDemoTenFloorProgressionTopology } from './game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from './game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorSpatialRedesign } from './game/demo-10-floor-spatial-redesign.js';
import { installContentStorageScope } from './game/content-storage-scope.js';

applyDemoTenFloorContent({
  enemies: ENEMIES,
  floors: FLOORS,
  dialogues: DIALOGUES,
  gridSize: GRID_SIZE
});
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
const progressionGrammar = applyDemoTenFloorProgressionGrammar({
  enemies: ENEMIES,
  floors: FLOORS,
  dialogues: DIALOGUES
});
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
applyDemoTwentyFloorContent({
  enemies: ENEMIES,
  floors: FLOORS,
  items: ITEMS,
  dialogues: DIALOGUES
});

installContentStorageScope({ contentId: DEMO20_CONTENT_ID });

globalThis.__TOWER_DEMO_CONTENT__ = Object.freeze({
  id: DEMO20_CONTENT_ID,
  mode: DEMO10_HARD_MODE_ID,
  floors: FLOORS.length,
  progression: progressionGrammar
});

globalThis.__TOWER_FORCE_CANVAS__ = true;
await import('./main.js');
const { installTacticalInteractionLayer } = await import('./game/tactical-interaction.js');
void installTacticalInteractionLayer().catch((error) => console.warn('Tactical interaction layer failed:', error));
