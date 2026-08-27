import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from './game/data.js';
import { applyDemoTenFloorContent, DEMO_TEN_FLOOR_ID } from './game/demo-10-floor-content.js';
import { installContentStorageScope } from './game/content-storage-scope.js';

applyDemoTenFloorContent({
  enemies: ENEMIES,
  floors: FLOORS,
  dialogues: DIALOGUES,
  gridSize: GRID_SIZE
});

installContentStorageScope({ contentId: DEMO_TEN_FLOOR_ID });

globalThis.__TOWER_DEMO_CONTENT__ = Object.freeze({
  id: DEMO_TEN_FLOOR_ID,
  floors: FLOORS.length
});

// The page CSP intentionally disallows third-party scripts. The demo therefore
// skips Phaser CDN probes and boots the repository-local Canvas renderer
// immediately; engine.js remains the authoritative gameplay transition system.
globalThis.__TOWER_FORCE_CANVAS__ = true;

// Keep the bootstrap dependency-light: apply the content overlay and save scope
// first, then let canonical main.js own portrait/art initialization.
await import('./main.js');
