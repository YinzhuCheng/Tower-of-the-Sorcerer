import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '/src/game/data.js';
import { applyDemoTwentyFloorContent } from '/src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent } from '/src/game/demo-30-floor-content.js';
import { applyDemoTenFloorContent } from '/src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '/src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorProgressionGrammar } from '/src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorProgressionTopology } from '/src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '/src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorSpatialRedesign } from '/src/game/demo-10-floor-spatial-redesign.js';

applyDemoTenFloorContent({
  enemies: ENEMIES,
  floors: FLOORS,
  dialogues: DIALOGUES,
  gridSize: GRID_SIZE
});
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });
applyDemoThirtyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const $ = (selector) => document.querySelector(selector);
const sceneList = $('#scene-list');
const sceneSearch = $('#scene-search');
const frame = $('#gal-frame');
const frameLoading = $('#frame-loading');
const sceneId = $('#scene-id');
const sceneTitle = $('#scene-title');
const sceneMeta = $('#scene-meta');
const progressLabel = $('#progress-label');
const progressBar = $('#progress-bar');
const autoNext = $('#auto-next');
const prevButton = $('#prev-scene');
const replayButton = $('#replay-scene');
const nextButton = $('#next-scene');
const openScene = $('#open-scene');

function dialogueTurns(dialogue) {
  if (Array.isArray(dialogue?.turns) && dialogue.turns.length) return dialogue.turns;
  return [{
    speaker: dialogue?.speaker ?? '旁白',
    portrait: dialogue?.portrait ?? null,
    text: dialogue?.text ?? '',
    cg: dialogue?.cg ?? null
  }];
}

const scenes = Object.entries(DIALOGUES)
  .filter(([, dialogue]) => dialogue && (dialogue.title || dialogue.text || dialogue.turns?.length))
  .map(([id, dialogue], sourceIndex) => {
    const turns = dialogueTurns(dialogue);
    const speakers = [...new Set(turns.map((turn) => turn.speaker).filter(Boolean))];
    const cgCount = new Set(turns.map((turn) => turn.cg).filter(Boolean)).size;
    const floorMatch = id.match(/floor(\d+)/i);
    const boss = /^boss|queenPhase/i.test(id);
    const category = id === 'prologue'
      ? '序章'
      : id === 'ending'
        ? '终章'
        : boss
          ? '守护者'
          : floorMatch
            ? `第 ${floorMatch[1]} 阵`
            : '剧情';
    return {
      id,
      title: dialogue.title ?? id,
      turns: turns.length,
      speakers,
      cgCount,
      category,
      sourceIndex,
      searchText: [id, dialogue.title, category, ...speakers, ...turns.map((turn) => turn.text)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
    };
  });

let currentIndex = 0;
let filteredSceneIds = new Set(scenes.map(({ id }) => id));

function previewUrl(id) {
  const params = new URLSearchParams({ 'gal-preview': id, 'gal-only': '1' });
  return `/?${params.toString()}`;
}

function syncUrl(id) {
  const url = new URL(window.location.href);
  url.searchParams.set('scene', id);
  history.replaceState(null, '', url);
}

function renderSceneList() {
  sceneList.replaceChildren();
  for (const [index, scene] of scenes.entries()) {
    if (!filteredSceneIds.has(scene.id)) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `scene-entry${index === currentIndex ? ' is-active' : ''}`;
    button.dataset.sceneId = scene.id;
    button.innerHTML = `
      <span class="scene-entry-copy">
        <small>${scene.category} · ${scene.id}</small>
        <strong>${scene.title}</strong>
        <em>${scene.speakers.join(' · ') || '旁白'}</em>
      </span>
      <span class="scene-entry-meta">${scene.turns} 句${scene.cgCount ? ` · CG ${scene.cgCount}` : ''}</span>
    `;
    button.addEventListener('click', () => loadScene(index));
    sceneList.append(button);
  }
  sceneList.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' });
}

function loadScene(index, { keepUrl = false } = {}) {
  if (!scenes.length) return;
  currentIndex = (index + scenes.length) % scenes.length;
  const scene = scenes[currentIndex];
  frameLoading.hidden = false;
  frame.src = previewUrl(scene.id);
  sceneId.textContent = scene.id;
  sceneTitle.textContent = scene.title;
  sceneMeta.textContent = `${scene.category} · ${scene.turns} 句 · ${scene.speakers.join(' / ') || '旁白'}${scene.cgCount ? ` · ${scene.cgCount} 个 CG 节点` : ''}`;
  progressLabel.textContent = `${currentIndex + 1} / ${scenes.length}`;
  progressBar.style.width = `${((currentIndex + 1) / scenes.length) * 100}%`;
  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === scenes.length - 1;
  openScene.href = previewUrl(scene.id);
  if (!keepUrl) syncUrl(scene.id);
  renderSceneList();
}

function moveScene(delta) {
  const target = currentIndex + delta;
  if (target < 0 || target >= scenes.length) return;
  loadScene(target);
}

sceneSearch.addEventListener('input', () => {
  const query = sceneSearch.value.trim().toLowerCase();
  filteredSceneIds = new Set(
    scenes
      .filter((scene) => !query || scene.searchText.includes(query))
      .map(({ id }) => id)
  );
  renderSceneList();
});

prevButton.addEventListener('click', () => moveScene(-1));
nextButton.addEventListener('click', () => moveScene(1));
replayButton.addEventListener('click', () => loadScene(currentIndex));

frame.addEventListener('load', () => {
  frameLoading.hidden = true;
});

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;
  const payload = event.data;
  if (!payload || payload.type !== 'tower-gal-only-finished') return;
  if (payload.dialogueId !== scenes[currentIndex]?.id) return;
  if (autoNext.checked && currentIndex < scenes.length - 1) {
    loadScene(currentIndex + 1);
  }
});

window.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLInputElement) return;
  if (event.key === '[' || event.key === 'PageUp') {
    event.preventDefault();
    moveScene(-1);
  } else if (event.key === ']' || event.key === 'PageDown') {
    event.preventDefault();
    moveScene(1);
  } else if (event.key.toLowerCase() === 'r') {
    event.preventDefault();
    loadScene(currentIndex);
  }
});

const requestedId = new URLSearchParams(window.location.search).get('scene');
const requestedIndex = requestedId ? scenes.findIndex(({ id }) => id === requestedId) : -1;
loadScene(requestedIndex >= 0 ? requestedIndex : 0, { keepUrl: requestedIndex >= 0 });
