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
const frame = $('#gal-frame');
const frameLoading = $('#frame-loading');
const sceneTitle = $('#scene-title');
const sceneMeta = $('#scene-meta');
const progressLabel = $('#progress-label');
const progressBar = $('#progress-bar');
const startButton = $('#story-start');
const prevButton = $('#prev-scene');
const replayButton = $('#replay-scene');
const nextButton = $('#next-scene');
const toc = $('#story-toc');
const tocToggle = $('#toc-toggle');
const tocClose = $('#toc-close');
const tocList = $('#toc-list');
const storyEnd = $('#story-end');
const restartEnding = $('#restart-ending');

const GAL_HISTORY_STORAGE_KEY = 'lost-magic-tower:gal-only-history:v1';

const STORY_ORDER = Object.freeze([
  'prologue',
  'bossCatPreDemo', 'bossCatPostDemo',
  'floor2', 'bossFoxPreDemo', 'bossFoxPostDemo',
  'floor3', 'bossWhalePreDemo', 'bossWhalePostDemo',
  'floor4', 'bossSwordPreDemo', 'bossSwordPostDemo',
  'floor5', 'bossDragonPreDemo', 'bossDragonPostDemo',
  'floor6', 'bossAstralPreDemo', 'bossAstralPostDemo',
  'floor7', 'bossShadowPreDemo', 'bossShadowPostDemo',
  'floor8', 'bossPalacePreDemo', 'bossPalacePostDemo',
  'floor9', 'bossBlackSealPreDemo', 'bossBlackSealPostDemo',
  'floor10', 'bossQueenPreDemo', 'queenPhaseDemo', 'bossQueenPostDemo',
  'floor11', 'floor12', 'floor13', 'floor14', 'floor15',
  'floor16', 'floor17', 'floor18',
  'floor19', 'bossEchoRegentPost',
  'floor20', 'warCouncil', 'bossArcaneSovereignPost', 'bossOriginCorePost',
  'floor21', 'floor22', 'floor23', 'floor24', 'floor25',
  'floor26', 'floor27', 'floor28', 'floor29',
  'floor30', 'bossArchiveWardenPost', 'ending'
]);

function dialogueTurns(dialogue) {
  if (Array.isArray(dialogue?.turns) && dialogue.turns.length) return dialogue.turns;
  return [{
    speaker: dialogue?.speaker ?? '旁白',
    portrait: dialogue?.portrait ?? null,
    text: dialogue?.text ?? '',
    cg: dialogue?.cg ?? null
  }];
}

function categoryFor(id) {
  if (id === 'prologue') return '序章';
  if (id === 'ending') return '终章';
  const floor = id.match(/^floor(\d+)$/i);
  if (floor) {
    const n = Number(floor[1]);
    if (n <= 10) return `第一幕 · 第 ${n} 阵`;
    if (n <= 20) return `第二幕 · 第 ${n} 阵`;
    return `第三幕 · 第 ${n} 阵`;
  }
  if (id === 'warCouncil') return '第二幕 · 会战';
  if (/^boss|queenPhase/i.test(id)) return '守护者 / 关键事件';
  return '剧情';
}

const scenes = STORY_ORDER
  .filter((id) => DIALOGUES[id])
  .map((id, index) => {
    const dialogue = DIALOGUES[id];
    const turns = dialogueTurns(dialogue);
    const speakers = [...new Set(turns.map((turn) => turn.speaker).filter(Boolean))];
    const cgCount = new Set(turns.map((turn) => turn.cg).filter(Boolean)).size;
    return {
      id,
      title: dialogue.title ?? id,
      turns: turns.length,
      speakers,
      cgCount,
      category: categoryFor(id),
      index
    };
  });

let currentIndex = 0;
let advancing = false;

function previewUrl(id) {
  const params = new URLSearchParams({ 'gal-preview': id, 'gal-only': '1' });
  return `/?${params.toString()}`;
}

function syncUrl(id) {
  const url = new URL(window.location.href);
  url.searchParams.set('scene', id);
  history.replaceState(null, '', url);
}

function renderToc() {
  tocList.replaceChildren();
  for (const [index, scene] of scenes.entries()) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `toc-row${index === currentIndex ? ' is-active' : ''}`;
    button.innerHTML = `
      <span>${String(index + 1).padStart(2, '0')}</span>
      <strong>${scene.title}</strong>
      <small>${scene.category}</small>
    `;
    button.addEventListener('click', () => {
      toc.close();
      loadScene(index);
    });
    tocList.append(button);
  }
  tocList.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' });
}

function loadScene(index, { keepUrl = false, transitionLabel = null } = {}) {
  if (!scenes.length) return;
  currentIndex = Math.max(0, Math.min(index, scenes.length - 1));
  const scene = scenes[currentIndex];
  advancing = false;
  storyEnd.hidden = true;
  frameLoading.hidden = false;
  frameLoading.textContent = transitionLabel ?? (currentIndex === 0 ? '正在进入序章…' : '正在进入下一幕…');
  frame.src = previewUrl(scene.id);

  sceneTitle.textContent = scene.title;
  sceneMeta.textContent = `${scene.category} · ${scene.turns} 句${scene.cgCount ? ` · ${scene.cgCount} 个 CG 节点` : ''}`;
  progressLabel.textContent = `完整剧情 ${currentIndex + 1} / ${scenes.length}`;
  progressBar.style.width = `${((currentIndex + 1) / scenes.length) * 100}%`;
  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === scenes.length - 1;

  if (!keepUrl) syncUrl(scene.id);
  renderToc();
}

function moveScene(delta) {
  const target = currentIndex + delta;
  if (target < 0 || target >= scenes.length) return;
  loadScene(target);
}

function finishStory() {
  storyEnd.hidden = false;
  progressLabel.textContent = `完整剧情 ${scenes.length} / ${scenes.length} · 已结束`;
  progressBar.style.width = '100%';
}

startButton.addEventListener('click', () => {
  window.sessionStorage.removeItem(GAL_HISTORY_STORAGE_KEY);
  loadScene(0, { transitionLabel: '正在返回序章…' });
});
prevButton.addEventListener('click', () => moveScene(-1));
nextButton.addEventListener('click', () => moveScene(1));
replayButton.addEventListener('click', () => loadScene(currentIndex, { transitionLabel: '正在重播本幕…' }));
restartEnding.addEventListener('click', () => {
  window.sessionStorage.removeItem(GAL_HISTORY_STORAGE_KEY);
  loadScene(0, { transitionLabel: '正在返回序章…' });
});
tocToggle.addEventListener('click', () => toc.showModal());
tocClose.addEventListener('click', () => toc.close());
toc.addEventListener('click', (event) => {
  if (event.target === toc) toc.close();
});

frame.addEventListener('load', () => {
  frameLoading.hidden = true;
});

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;
  const payload = event.data;
  if (!payload || payload.type !== 'tower-gal-only-finished') return;
  if (payload.dialogueId !== scenes[currentIndex]?.id || advancing) return;

  if (currentIndex >= scenes.length - 1) {
    finishStory();
    return;
  }

  advancing = true;
  frameLoading.hidden = false;
  frameLoading.textContent = '进入下一幕…';
  window.setTimeout(() => loadScene(currentIndex + 1), 260);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toc.open) {
    toc.close();
    return;
  }
  if (event.key === '[' || event.key === 'PageUp') {
    event.preventDefault();
    moveScene(-1);
  } else if (event.key === ']' || event.key === 'PageDown') {
    event.preventDefault();
    moveScene(1);
  } else if (event.key.toLowerCase() === 'r') {
    event.preventDefault();
    loadScene(currentIndex, { transitionLabel: '正在重播本幕…' });
  } else if (event.key.toLowerCase() === 'i') {
    event.preventDefault();
    toc.open ? toc.close() : toc.showModal();
  }
});

const requestedId = new URLSearchParams(window.location.search).get('scene');
const requestedIndex = requestedId ? scenes.findIndex(({ id }) => id === requestedId) : -1;
if (requestedIndex < 0) window.sessionStorage.removeItem(GAL_HISTORY_STORAGE_KEY);
loadScene(requestedIndex >= 0 ? requestedIndex : 0, { keepUrl: requestedIndex >= 0 });
