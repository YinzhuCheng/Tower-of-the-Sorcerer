import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from './game/data.js';
import { applyDemoTenFloorContent } from './game/demo-10-floor-content.js';
import { hydratePortraits } from './game/portraits.js';

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

// The current demo branch intentionally keeps main.js close to the existing UI
// while the 10F content remains isolated. Expose the canonical portrait hydrator
// before importing main.js so the browser boot path retains the original portrait
// initialization even when the demo shim is applied first.
globalThis.hydratePortraits = hydratePortraits;

await import('./main.js');
