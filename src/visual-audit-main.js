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
const exportAll = params.get('all') === '1';
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

function placeAuditHero(state, id) {
  state.floor = id;
  const position = firstAuditPosition(state.floorStates[id].map);
  state.x = position.x;
  state.y = position.y;
}

function captureAllFloors(scene, state) {
  const output = document.createElement('div');
  output.id = 'visual-audit-export';
  output.hidden = true;
  document.body.append(output);

  for (let id = 0; id < FLOORS.length; id += 1) {
    placeAuditHero(state, id);
    scene.refresh?.();
    const image = document.createElement('img');
    image.dataset.auditFloor = String(id + 1);
    image.alt = `F${String(id + 1).padStart(2, '0')} ${FLOORS[id].title}`;
    image.src = scene.canvas.toDataURL('image/png');
    output.append(image);
  }

  document.body.dataset.visualAuditExportCount = String(FLOORS.length);
}

try {
  const [{ createInitialState }, { createCanvasTowerScene }, { applySceneThemeV8 }, { applyV83RenderFixes }] = await Promise.all([
    import('./game/engine.js'),
    import('./game/canvas-scene.js'),
    import('./game/visual-theme-v8.js'),
    import('./game/visual-patch-v83.js')
  ]);

  const state = createInitialState();
  placeAuditHero(state, floorId);
  state.logs = [];

  const floor = FLOORS[floorId];
  document.getElementById('audit-label').textContent = exportAll
    ? 'F01–F10 · PRODUCTION VISUAL AUDIT EXPORT'
    : `F${String(floorNumber).padStart(2, '0')} · ${floor.title} · VISUAL AUDIT`;

  const bridge = {
    getState: () => state,
    canMove: () => false,
    onResult: () => {},
    onReady: (scene) => {
      applySceneThemeV8(scene);
      applyV83RenderFixes(scene);
      scene.refresh?.();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (exportAll) captureAllFloors(scene, state);
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
