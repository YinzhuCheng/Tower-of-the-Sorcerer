import { GRID_SIZE, ITEMS, TILE_SIZE } from './data.js';
import { parseToken } from './engine.js';
import { portraitIndex } from './anime-portraits.js';
import { getMapAsset } from './map-assets.js';
import { loadImage } from './asset-loading.js';

const THEME_KEY = 'lost-magic-tower:theme:v8';
const GAL_ART_VERSION = '20260902-cel4';
const galArtUrl = (path) => `${path}?v=${GAL_ART_VERSION}`;
const GENERATED_ATLAS_URL = '/assets/anime/map/atlases/runtime/ui-v8.webp';
const GENERATED_COLS = 3;
const GENERATED_ROWS = 2;
const GENERATED_INDEX = Object.freeze({
  'floor-main-v8': 0,
  'floor-alt-v8': 1,
  'outer-wall-trim-v8': 2,
  'outer-pillar-v8': 3,
  'ui-corner-v8': 4,
  'ui-divider-v8': 5
});

const THEMES = Object.freeze([
  { id: 'night', label: '暗夜' },
  { id: 'sun', label: '日光' },
  { id: 'ocean', label: '深海' },
  { id: 'forest', label: '森林' }
]);

const THEME_ENVIRONMENT_URLS = Object.freeze({
  night: galArtUrl('/assets/anime/themes/theme-night-tower.webp'),
  sun: galArtUrl('/assets/anime/themes/theme-sun-sanctum.webp'),
  ocean: galArtUrl('/assets/anime/themes/theme-ocean-archive.webp'),
  forest: galArtUrl('/assets/anime/themes/theme-forest-sanctuary.webp')
});

const THEME_FLOOR_PALETTES = Object.freeze({
  night: { base: '#172542', veil: 'rgba(13,20,50,.42)', light: ['rgba(179,202,255,.16)', 'rgba(123,156,236,.05)', 'rgba(8,19,55,.26)'] },
  sun: { base: '#6d5328', veil: 'rgba(82,53,10,.4)', light: ['rgba(255,245,204,.17)', 'rgba(255,203,108,.055)', 'rgba(73,43,9,.28)'] },
  ocean: { base: '#123f53', veil: 'rgba(2,54,71,.42)', light: ['rgba(192,255,251,.16)', 'rgba(78,231,229,.055)', 'rgba(3,35,55,.28)'] },
  forest: { base: '#274c36', veil: 'rgba(7,50,26,.42)', light: ['rgba(222,255,202,.15)', 'rgba(127,229,153,.055)', 'rgba(7,36,18,.29)'] }
});

const CARD_STYLE = Object.freeze({
  sun: { rgb: '243,194,76', edge: '#fff1a8', symbol: '☀' },
  moon: { rgb: '91,181,235', edge: '#dff4ff', symbol: '☾' },
  star: { rgb: '214,103,194', edge: '#ffe1f5', symbol: '✦' }
});

const generatedAssets = new Map();
let generatedPromise = null;
const themeEnvironmentAssets = new Map();
let themeEnvironmentPromise = null;

function roundRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function activeThemeId() {
  return document.body?.dataset?.theme in THEME_ENVIRONMENT_URLS
    ? document.body.dataset.theme
    : 'night';
}

function preloadThemeEnvironmentAssets() {
  if (themeEnvironmentPromise) return themeEnvironmentPromise;
  themeEnvironmentPromise = Promise.all(Object.entries(THEME_ENVIRONMENT_URLS).map(async ([id, url]) => {
    const image = await loadImage(url);
    if (image) themeEnvironmentAssets.set(id, image);
  })).then(() => themeEnvironmentAssets);
  return themeEnvironmentPromise;
}

function cropAtlasCell(image, index) {
  const sw = image.naturalWidth / GENERATED_COLS;
  const sh = image.naturalHeight / GENERATED_ROWS;
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, (index % GENERATED_COLS) * sw, Math.floor(index / GENERATED_COLS) * sh, sw, sh, 0, 0, sw, sh);
  return canvas;
}

function trimTransparent(source, alphaThreshold = 20) {
  const ctx = source.getContext('2d', { willReadFrequently: true });
  const frame = ctx.getImageData(0, 0, source.width, source.height);
  const pixels = frame.data;
  let minX = source.width;
  let minY = source.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const alpha = pixels[(y * source.width + x) * 4 + 3];
      if (alpha < alphaThreshold) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxX < minX || maxY < minY) return source;
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(source, minX, minY, width, height, 0, 0, width, height);
  return canvas;
}

export async function preloadV8GeneratedAssets() {
  if (generatedPromise) return generatedPromise;
  generatedPromise = (async () => {
    const image = await loadImage(GENERATED_ATLAS_URL);
    if (!image) throw new Error('V8 生成素材图集无法解码');
    for (const [name, index] of Object.entries(GENERATED_INDEX)) {
      let cell = cropAtlasCell(image, index);
      if (!name.startsWith('floor-')) cell = trimTransparent(cell);
      generatedAssets.set(name, cell);
    }
    return generatedAssets;
  })().catch((error) => {
    console.error('[V8.2] 生成素材初始化失败，将使用程序化回退。', error);
    return generatedAssets;
  });
  return generatedPromise;
}

function generatedAsset(name) {
  return generatedAssets.get(name) ?? null;
}

function canvasUrl(source) {
  if (!source || typeof source.toDataURL !== 'function') return null;
  return source.toDataURL('image/png');
}

function installDialogueObserver() {
  const root = document.getElementById('modal-root');
  const body = document.getElementById('modal-body');
  const kicker = document.getElementById('modal-kicker');
  if (!root || !body || !kicker) return;
  const update = () => {
    const grid = body.querySelector('.dialogue-grid');
    if (!grid) return;
    const isShop = kicker.textContent.includes('商店') || kicker.textContent.includes('珂珂');
    grid.classList.toggle('story-dialogue', !isShop);
  };
  const observer = new MutationObserver(update);
  observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class'] });
  update();
}

function installV82Styles() {
  if (document.querySelector('style[data-visual-theme-v82]')) return;
  const style = document.createElement('style');
  style.dataset.visualThemeV82 = '1';
  style.textContent = `
    #game-container{position:relative!important;background:var(--theme-board-overlay),var(--theme-scene-image) center/cover!important}
    #game-container canvas{position:relative;z-index:1}
    .ui-frame-v82{position:absolute;pointer-events:none;z-index:4;background-repeat:no-repeat;background-position:center;background-size:contain;opacity:.52}
    .ui-frame-v82.corner{width:42px;height:42px}
    .ui-frame-v82.corner.tl{left:-2px;top:-2px;transform:scale(.82)}
    .ui-frame-v82.corner.tr{right:-2px;top:-2px;transform:scaleX(-1) scale(.82)}
    .ui-frame-v82.corner.bl{left:-2px;bottom:-2px;transform:scaleY(-1) scale(.82)}
    .ui-frame-v82.corner.br{right:-2px;bottom:-2px;transform:scale(-1) scale(.82)}
    .ui-frame-v82.edge{left:44px;right:44px;height:10px;background-size:100% 100%;opacity:.34}
    .ui-frame-v82.edge.top{top:-1px}
    .ui-frame-v82.edge.bottom{bottom:-1px;transform:scaleY(-1)}
    .panel,.modal-card{isolation:isolate}
    .stats-panel .ui-frame-v82,.intel-panel .ui-frame-v82{opacity:.38}
    #game-container .ui-frame-v82.corner{width:34px;height:34px;opacity:.48}
    #game-container .ui-frame-v82.edge{left:38px;right:38px;opacity:.25}
  `;
  document.head.append(style);
}

function setTheme(themeId) {
  const theme = THEMES.find((entry) => entry.id === themeId) ?? THEMES[0];
  document.body.dataset.theme = theme.id;
  const button = document.getElementById('btn-theme');
  if (button) button.textContent = `主题·${theme.label}`;
  try { localStorage.setItem(THEME_KEY, theme.id); } catch {}
  window.dispatchEvent(new Event('tower-theme-change'));
  return theme;
}

function bindThemeButton() {
  let stored = 'night';
  try { stored = localStorage.getItem(THEME_KEY) || 'night'; } catch {}
  setTheme(stored);
  const button = document.getElementById('btn-theme');
  if (!button || button.dataset.boundTheme === '1') return;
  button.dataset.boundTheme = '1';
  button.addEventListener('click', () => {
    const current = THEMES.findIndex((entry) => entry.id === document.body.dataset.theme);
    setTheme(THEMES[(current + 1 + THEMES.length) % THEMES.length].id);
  });
}

function decorateUiPanels() {
  const cornerUrl = canvasUrl(generatedAsset('ui-corner-v8'));
  const dividerUrl = canvasUrl(generatedAsset('ui-divider-v8'));
  if (!cornerUrl || !dividerUrl) return;
  for (const target of document.querySelectorAll('.stats-panel,.intel-panel,#game-container,.modal-card')) {
    target.querySelectorAll(':scope > .ui-frame-v82').forEach((node) => node.remove());
    for (const position of ['tl', 'tr', 'bl', 'br']) {
      const corner = document.createElement('i');
      corner.className = `ui-frame-v82 corner ${position}`;
      corner.style.backgroundImage = `url("${cornerUrl}")`;
      corner.setAttribute('aria-hidden', 'true');
      target.append(corner);
    }
    for (const position of ['top', 'bottom']) {
      const edge = document.createElement('i');
      edge.className = `ui-frame-v82 edge ${position}`;
      edge.style.backgroundImage = `url("${dividerUrl}")`;
      edge.setAttribute('aria-hidden', 'true');
      target.append(edge);
    }
  }
}

export function installV8VisualLayer() {
  if (document.body.dataset.visualThemeV8 === '1') return;
  document.body.dataset.visualThemeV8 = '1';
  installV82Styles();
  bindThemeButton();
  installDialogueObserver();
  preloadV8GeneratedAssets().then(decorateUiPanels);
}

function filteredAsset(scene, name, filter) {
  scene.visualThemeV8Cache ??= new Map();
  const key = `${name}|${filter}`;
  if (scene.visualThemeV8Cache.has(key)) return scene.visualThemeV8Cache.get(key);
  const source = getMapAsset(name);
  if (!source) return null;
  const width = source.width || source.naturalWidth;
  const height = source.height || source.naturalHeight;
  if (!width || !height) return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.filter = filter;
  ctx.drawImage(source, 0, 0, width, height);
  ctx.filter = 'none';
  scene.visualThemeV8Cache.set(key, canvas);
  return canvas;
}

function drawFloorTexture(ctx, image, x, y, size, alternate = false) {
  if (!image) return;
  const inset = alternate ? 0.12 : 0.18;
  const sx = image.width * inset;
  const sy = image.height * inset;
  const sw = image.width * (1 - inset * 2);
  const sh = image.height * (1 - inset * 2);
  ctx.drawImage(image, sx, sy, sw, sh, x, y, size, size);
}

function drawFloorV82(scene) {
  const ctx = scene.ctx;
  const mapSize = GRID_SIZE * TILE_SIZE;
  const themeId = activeThemeId();
  const palette = THEME_FLOOR_PALETTES[themeId] ?? THEME_FLOOR_PALETTES.night;
  const environment = themeEnvironmentAssets.get(themeId);
  const main = generatedAsset('floor-main-v8');
  const alt = generatedAsset('floor-alt-v8');
  ctx.fillStyle = palette.base;
  ctx.fillRect(0, 0, mapSize, mapSize);
  if (environment) {
    ctx.save();
    ctx.globalAlpha = 0.38;
    ctx.drawImage(environment, 0, 0, mapSize, mapSize);
    ctx.fillStyle = palette.veil;
    ctx.fillRect(0, 0, mapSize, mapSize);
    ctx.restore();
  }
  ctx.save();
  ctx.globalAlpha = 0.79;
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const alternate = ((x * 19 + y * 31) % 7) === 0;
      const image = alternate ? (alt ?? main) : (main ?? alt);
      if (image) drawFloorTexture(ctx, image, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, alternate);
      else {
        ctx.fillStyle = alternate ? palette.light[1] : palette.light[0];
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
  ctx.restore();
  const light = ctx.createRadialGradient(mapSize * 0.5, mapSize * 0.44, 10, mapSize * 0.5, mapSize * 0.48, mapSize * 0.72);
  light.addColorStop(0, palette.light[0]);
  light.addColorStop(0.6, palette.light[1]);
  light.addColorStop(1, palette.light[2]);
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, mapSize, mapSize);
}

function drawWallBaseV82(scene, x, y) {
  const ctx = scene.ctx;
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  ctx.fillStyle = '#272c32';
  ctx.fillRect(px - 0.5, py - 0.5, TILE_SIZE + 1, TILE_SIZE + 1);
  const wall = filteredAsset(scene, 'wall-surface-v6', 'grayscale(.92) saturate(.15) brightness(.63) contrast(1.2)');
  if (!wall) return;
  scene.wallV82Pattern ??= ctx.createPattern(wall, 'repeat');
  if (!scene.wallV82Pattern) return;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = scene.wallV82Pattern;
  ctx.fillRect(px - 0.5, py - 0.5, TILE_SIZE + 1, TILE_SIZE + 1);
  ctx.restore();
}

function wallExposures(scene, state, x, y) {
  return { north: !scene.isWall(state, x, y - 1), east: !scene.isWall(state, x + 1, y), south: !scene.isWall(state, x, y + 1), west: !scene.isWall(state, x - 1, y) };
}

function perimeterExposures(x, y) {
  const max = GRID_SIZE - 1;
  return { north: y === 0, east: x === max, south: y === max, west: x === 0 };
}

function drawInnerWallEdge(scene, side, px, py) {
  const ctx = scene.ctx;
  ctx.save();
  ctx.strokeStyle = 'rgba(141,161,174,.42)';
  ctx.lineWidth = 1.2;
  ctx.shadowColor = 'rgba(5,11,18,.62)';
  ctx.shadowBlur = 3;
  ctx.beginPath();
  if (side === 'north') { ctx.moveTo(px + 1, py + 1); ctx.lineTo(px + TILE_SIZE - 1, py + 1); }
  if (side === 'east') { ctx.moveTo(px + TILE_SIZE - 1, py + 1); ctx.lineTo(px + TILE_SIZE - 1, py + TILE_SIZE - 1); }
  if (side === 'south') { ctx.moveTo(px + 1, py + TILE_SIZE - 1); ctx.lineTo(px + TILE_SIZE - 1, py + TILE_SIZE - 1); }
  if (side === 'west') { ctx.moveTo(px + 1, py + 1); ctx.lineTo(px + 1, py + TILE_SIZE - 1); }
  ctx.stroke();
  ctx.restore();
}

function drawOuterWallTrim(scene, side, px, py) {
  const image = generatedAsset('outer-wall-trim-v8');
  const inset = TILE_SIZE * 0.085;
  let cx = px + TILE_SIZE / 2;
  let cy = py + TILE_SIZE / 2;
  let rotation = 0;
  if (side === 'north') cy = py + inset;
  if (side === 'south') { cy = py + TILE_SIZE - inset; rotation = Math.PI; }
  if (side === 'east') { cx = px + TILE_SIZE - inset; rotation = Math.PI / 2; }
  if (side === 'west') { cx = px + inset; rotation = -Math.PI / 2; }
  const ctx = scene.ctx;
  ctx.save();
  ctx.strokeStyle = 'rgba(33,91,139,.72)';
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  if (side === 'north' || side === 'south') { ctx.moveTo(px + 1, cy); ctx.lineTo(px + TILE_SIZE - 1, cy); }
  else { ctx.moveTo(cx, py + 1); ctx.lineTo(cx, py + TILE_SIZE - 1); }
  ctx.stroke();
  ctx.restore();
  if (image) scene.drawMapImage(image, cx, cy, TILE_SIZE * 1.08, TILE_SIZE * 0.22, rotation, 0.96);
}

function isMapCorner(x, y) {
  const max = GRID_SIZE - 1;
  return (x === 0 || x === max) && (y === 0 || y === max);
}

function drawCornerPillarV82(scene, x, y) {
  if (!isMapCorner(x, y)) return false;
  const ctx = scene.ctx;
  const cx = scene.center(x);
  const cy = scene.center(y);
  const image = generatedAsset('outer-pillar-v8');
  const radius = TILE_SIZE * 0.34;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  if (image) ctx.drawImage(image, cx - radius, cy - radius, radius * 2, radius * 2);
  else {
    const fallback = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, 2, cx, cy, radius);
    fallback.addColorStop(0, '#4bb4ef');
    fallback.addColorStop(0.45, '#145fa5');
    fallback.addColorStop(1, '#08294b');
    ctx.fillStyle = fallback;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  }
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = 'rgba(198,226,244,.82)';
  ctx.lineWidth = 1.4;
  ctx.shadowColor = 'rgba(66,158,220,.45)';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(38,103,155,.9)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  return true;
}

function keyedTransparentCell(image, index, cols, rows) {
  if (!image) return null;
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const sw = Math.floor(imageWidth / cols);
  const sh = Math.floor(imageHeight / rows);
  if (!sw || !sh) return null;
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, (index % cols) * sw, Math.floor(index / cols) * sh, sw, sh, 0, 0, sw, sh);
  const frame = ctx.getImageData(0, 0, sw, sh);
  const pixels = frame.data;
  const samples = [0, sw - 1, (sh - 1) * sw, sh * sw - 1, Math.min(sw - 1, 2), Math.max(0, sw - 3), Math.max(0, (sh - 3) * sw), Math.min(sh * sw - 1, (sh - 1) * sw + 2)];
  let br = 0, bg = 0, bb = 0, bn = 0;
  for (const p of samples) {
    const i = p * 4;
    if (pixels[i + 3] <= 6) continue;
    br += pixels[i]; bg += pixels[i + 1]; bb += pixels[i + 2]; bn += 1;
  }
  if (!bn) return canvas;
  br /= bn; bg /= bn; bb /= bn;
  const count = sw * sh;
  const visited = new Uint8Array(count);
  const queue = new Int32Array(count);
  let head = 0, tail = 0;
  const closeToBackdrop = (p, tolerance = 52) => {
    const i = p * 4;
    if (pixels[i + 3] <= 7) return true;
    const dr = pixels[i] - br, dg = pixels[i + 1] - bg, db = pixels[i + 2] - bb;
    return dr * dr + dg * dg + db * db <= tolerance * tolerance;
  };
  const enqueue = (p) => {
    if (p < 0 || p >= count || visited[p] || !closeToBackdrop(p)) return;
    visited[p] = 1;
    queue[tail++] = p;
  };
  for (let x = 0; x < sw; x += 1) { enqueue(x); enqueue((sh - 1) * sw + x); }
  for (let y = 0; y < sh; y += 1) { enqueue(y * sw); enqueue(y * sw + sw - 1); }
  while (head < tail) {
    const p = queue[head++];
    const x = p % sw;
    const y = Math.floor(p / sw);
    if (x > 0) enqueue(p - 1);
    if (x + 1 < sw) enqueue(p + 1);
    if (y > 0) enqueue(p - sw);
    if (y + 1 < sh) enqueue(p + sw);
  }
  for (let p = 0; p < count; p += 1) if (visited[p]) pixels[p * 4 + 3] = 0;
  for (let y = 1; y < sh - 1; y += 1) {
    for (let x = 1; x < sw - 1; x += 1) {
      const p = y * sw + x;
      if (visited[p] || !(visited[p - 1] || visited[p + 1] || visited[p - sw] || visited[p + sw])) continue;
      if (closeToBackdrop(p, 72)) pixels[p * 4 + 3] = Math.min(pixels[p * 4 + 3], 72);
    }
  }
  ctx.putImageData(frame, 0, 0);
  return canvas;
}

function drawCleanCell(scene, cell, cx, cy, size, alpha = 1) {
  if (!cell) return false;
  scene.ctx.save();
  scene.ctx.globalAlpha = alpha;
  scene.ctx.imageSmoothingEnabled = true;
  scene.ctx.imageSmoothingQuality = 'high';
  scene.ctx.drawImage(cell, cx - size / 2, cy - size / 2, size, size);
  scene.ctx.restore();
  return true;
}

function installCleanSpritePipeline(scene) {
  scene.visualThemeV82Cells ??= new Map();
  const oldLegacy = scene.drawLegacySprite.bind(scene);
  const oldItem = scene.drawItem.bind(scene);
  scene.drawLegacySprite = (id, cx, cy, size, alpha = 1) => {
    const key = `chibi:${id}`;
    let cell = scene.visualThemeV82Cells.get(key);
    if (!cell) {
      cell = keyedTransparentCell(scene.images?.get(scene.chibiSheet), portraitIndex(id), 4, 3);
      if (cell) scene.visualThemeV82Cells.set(key, cell);
    }
    return cell ? drawCleanCell(scene, cell, cx, cy, size, alpha) : oldLegacy(id, cx, cy, size, alpha);
  };
  scene.drawItem = (index, x, y, scale = 0.8) => {
    const key = `item:${index}`;
    let cell = scene.visualThemeV82Cells.get(key);
    if (!cell) {
      cell = keyedTransparentCell(scene.images?.get(scene.itemSheet), index, 6, 4);
      if (cell) scene.visualThemeV82Cells.set(key, cell);
    }
    const size = TILE_SIZE * scale;
    return cell ? drawCleanCell(scene, cell, scene.center(x), scene.center(y), size) : oldItem(index, x, y, scale);
  };
}

function drawCardDropV82(scene, x, y, kind) {
  const style = CARD_STYLE[kind];
  if (!style) return false;
  const ctx = scene.ctx;
  const cx = scene.center(x), cy = scene.center(y);
  const width = TILE_SIZE * 0.46, height = TILE_SIZE * 0.63;
  const t = (scene.idleClock || performance.now()) / 700;
  const bob = Math.sin(t + x * 0.7 + y * 0.9) * 1.2;
  scene.drawSoftShadow(cx, cy + TILE_SIZE * 0.25, TILE_SIZE * 0.38, 0.2);
  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.rotate(-0.05);
  ctx.shadowColor = `rgba(${style.rgb},.62)`;
  ctx.shadowBlur = 9;
  const gradient = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
  gradient.addColorStop(0, `rgba(${style.rgb},.92)`);
  gradient.addColorStop(0.52, `rgba(${style.rgb},.55)`);
  gradient.addColorStop(1, 'rgba(11,18,29,.95)');
  roundRectPath(ctx, -width / 2, -height / 2, width, height, 5);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = style.edge;
  ctx.lineWidth = 1.25;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.round(TILE_SIZE * 0.27)}px "Noto Serif SC", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(style.symbol, 0, 0);
  ctx.restore();
  return true;
}

export function applySceneThemeV8(scene) {
  if (!scene?.ctx || scene.visualThemeV8Applied) return scene;
  scene.visualThemeV8Applied = true;
  if (!generatedAssets.size) {
    preloadV8GeneratedAssets().then(() => {
      decorateUiPanels();
      scene.refresh?.();
    });
  }
  preloadThemeEnvironmentAssets().then(() => scene.refresh?.());
  const previousRenderToken = scene.renderToken.bind(scene);
  installCleanSpritePipeline(scene);
  scene.drawFloorLayer = () => drawFloorV82(scene);
  scene.drawWallBase = (x, y) => drawWallBaseV82(scene, x, y);
  scene.drawWallBoundary = (state, x, y) => {
    const exposed = wallExposures(scene, state, x, y);
    const perimeter = perimeterExposures(x, y);
    const px = x * TILE_SIZE, py = y * TILE_SIZE;
    for (const side of ['north', 'east', 'south', 'west']) {
      if (perimeter[side]) drawOuterWallTrim(scene, side, px, py);
      else if (exposed[side]) drawInnerWallEdge(scene, side, px, py);
    }
  };
  scene.drawWallOrnament = (state, x, y) => { drawCornerPillarV82(scene, x, y); };
  scene.renderToken = (x, y, token) => {
    const parsed = parseToken(token);
    if (parsed.type === 'item') {
      const item = ITEMS[parsed.id];
      if (item?.kind === 'card' && drawCardDropV82(scene, x, y, item.card)) return;
    }
    previousRenderToken(x, y, token);
  };
  decorateUiPanels();
  scene.canvas.dataset.visualTheme = 'v8.2-generated-floor-outer-trim';
  scene.canvas.dataset.cardPipeline = 'programmatic-card-v8';
  scene.canvas.dataset.spriteCleanup = 'edge-keyed-transparent-v8.2';
  scene.canvas.dataset.uiThemes = THEMES.map((theme) => theme.id).join(',');
  window.addEventListener('tower-theme-change', () => scene.refresh?.());
  return scene;
}
