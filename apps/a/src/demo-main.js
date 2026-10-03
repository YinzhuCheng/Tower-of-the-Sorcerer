import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS, SHOP_OPTIONS } from './game/data.js';
import { applyDemoTwentyFloorContent, DEMO20_CONTENT_ID } from './game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent, DEMO30_CONTENT_ID } from './game/demo-30-floor-content.js';
import { applyDemoTenFloorContent } from './game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode, DEMO10_HARD_MODE_ID } from './game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorProgressionGrammar } from './game/demo-10-floor-progression.js';
import { applyDemoTenFloorProgressionTopology } from './game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from './game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorSpatialRedesign } from './game/demo-10-floor-spatial-redesign.js';
import { chooseDifficulty, showDifficultyBootFailure } from './game/difficulty-entry.js';
import { applyDifficultyProfile } from './game/difficulty-profiles.js';

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
applyDemoThirtyFloorContent({
  enemies: ENEMIES,
  floors: FLOORS,
  items: ITEMS,
  dialogues: DIALOGUES
});

try {
const bootParams = new URLSearchParams(window.location.search);
const presentationOnly = bootParams.has('gal-preview') || bootParams.get('gal-only') === '1';
if (!presentationOnly) {
  const session = await chooseDifficulty();
  applyDifficultyProfile({ ENEMIES, FLOORS, ITEMS, SHOP_OPTIONS }, session.profile.id);
}
// Presentation routes never configure a gameplay identity or touch its slots.
window.addEventListener('pageshow', event => { if (event.persisted) window.location.reload(); });
const documentUrl = window.location.href;
window.addEventListener('popstate', () => { if (window.location.href !== documentUrl) window.location.reload(); });

globalThis.__TOWER_DEMO_CONTENT__ = Object.freeze({
  id: DEMO30_CONTENT_ID,
  mode: DEMO10_HARD_MODE_ID,
  floors: FLOORS.length,
  progression: progressionGrammar
});

globalThis.__TOWER_FORCE_CANVAS__ = true;
const { getCurrentGameState } = await import('./main.js');
if (!presentationOnly) {
  const { installTacticalInteractionLayer } = await import('./game/tactical-interaction.js');
  void installTacticalInteractionLayer({ getState: getCurrentGameState }).catch((error) => console.warn('Tactical interaction layer failed:', error));
}

} catch (error) {
  console.error('Difficulty startup failed:', error);
  showDifficultyBootFailure(error);
}
