import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from './game/data.js';
import { applyDemoTenFloorContent } from './game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from './game/demo-10-floor-hard-mode.js';

applyDemoTenFloorContent({
  enemies: ENEMIES,
  floors: FLOORS,
  dialogues: DIALOGUES,
  gridSize: GRID_SIZE
});
applyDemoTenFloorHardMode({ enemies: ENEMIES });

const params = new URLSearchParams(location.search);
const requested = Number(params.get('floor') ?? 1);
const floorNumber = Number.isInteger(requested) && requested >= 1 && requested <= FLOORS.length ? requested : 1;
const floorId = floorNumber - 1;

function firstAuditPosition(map) {
  const priorities = ['.', 'D', 'S', 'shop', 'U'];
  for (const token of priorities) {
    for (let y = 0; y < map.length; y += 1) {
      for (let x = 0; x < map[y].length; x += 1) {
        if (map[y][x] === token) return { x, y };
      }
    }
  }
  return { x: 1, y: 1 };
}

try {
  const [{ createInitialState }, { createCanvasTowerScene }, { applySceneThemeV8 }, { applyV83RenderFixes }] = await Promise.all([
    import('./game/engine.js'),
    import('./game/canvas-scene.js'),
    import('./game/visual-theme-v8.js'),
    import('./game/visual-patch-v83.js')
  ]);

  const state = createInitialState();
  state.floor = floorId;
  const position = firstAuditPosition(state.floorStates[floorId].map);
  state.x = position.x;
  state.y = position.y;
  state.logs = [];

  const floor = FLOORS[floorId];
  document.getElementById('audit-label').textContent = `F${String(floorNumber).padStart(2, '0')} · ${floor.title} · VISUAL AUDIT`;

  const bridge = {
    getState: () => state,
    canMove: () => false,
    onResult: () => {},
    onReady: (scene) => {
      applySceneThemeV8(scene);
      applyV83RenderFixes(scene);
      scene.refresh?.();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        document.body.dataset.visualAuditReady = 'true';
        globalThis.__TOWER_VISUAL_AUDIT_READY__ = true;
      }));
    }
  };

  createCanvasTowerScene(bridge, document.getElementById('game-container'));
} catch (error) {
  console.error(error);
  document.getElementById('audit-error').textContent = `VISUAL AUDIT FAILED\n${error?.stack ?? error}`;
  document.body.dataset.visualAuditFailed = 'true';
}
