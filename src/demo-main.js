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

// The page CSP intentionally disallows third-party scripts. The demo therefore
// skips Phaser CDN probes and boots the repository-local Canvas renderer
// immediately; engine.js remains the authoritative gameplay transition system.
globalThis.__TOWER_FORCE_CANVAS__ = true;

// Keep the bootstrap dependency-light: apply the content overlay first, then let
// canonical main.js own portrait/art initialization. This ensures the UI/render
// module is requested immediately instead of being delayed by demo preloads.
await import('./main.js');
