import { GRID_SIZE, ITEMS, TILE_SIZE } from './data.js';
import { parseToken } from './engine.js';
import { portraitIndex } from './anime-portraits.js';
import { getMapAsset } from './map-assets.js';

const THEME_KEY = 'lost-magic-tower:theme:v8';
const THEMES = Object.freeze([
  { id: 'night', label: '暗夜' },
  { id: 'sun', label: '日光' },
  { id: 'ocean', label: '深海' },
  { id: 'forest', label: '森林' }
]);

const CARD_STYLE = Object.freeze({
  sun: { rgb: '243,194,76', edge: '#fff1a8', symbol: '☀' },
  moon: { rgb: '91,181,235', edge: '#dff4ff', symbol: '☾' },
  star: { rgb: '214,103,194', edge: '#ffe1f5', symbol: '✦' }
});

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

function installV81Styles() {
  if (document.querySelector('style[data-visual-theme-v81]')) return;
  const style = document.createElement('style');
  style.dataset.visualThemeV81 = '1';
  style.textContent = `
    #game-container{
      background:
        radial-gradient(circle at 9% 14%,rgba(210,235,255,.72) 0 1px,transparent 1.4px) 0 0/109px 109px,
        radial-gradient(circle at 72% 21%,rgba(112,188,255,.66) 0 1px,transparent 1.5px) 0 0/151px 151px,
        radial-gradient(circle at 31% 76%,rgba(255,255,255,.5) 0 1px,transparent 1.35px) 0 0/83px 83px,
        radial-gradient(ellipse at 24% 18%,rgba(42,111,169,.32),transparent 38%),
        radial-gradient(ellipse at 83% 72%,rgba(65,78,157,.2),transparent 34%),
        linear-gradient(145deg,#0b2941 0%,#081d31 48%,#071522 100%)!important;
    }
  `;
  document.head.append(style);
}

function setTheme(themeId) {
  const theme = THEMES.find((entry) => entry.id === themeId) ?? THEMES[0];
  document.body.dataset.theme = theme.id;
  const button = document.getElementById('btn-theme');
  if (button) button.textContent = `主题·${theme.label}`;
  try { localStorage.setItem(THEME_KEY, theme.id); } catch {}
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
    const next = THEMES[(current + 1 + THEMES.length) % THEMES.length];
    setTheme(next.id);
  });
}

export function installV8VisualLayer() {
  if (document.body.dataset.visualThemeV8 === '1') return;
  document.body.dataset.visualThemeV8 = '1';
  installV81Styles();
  bindThemeButton();
  installDialogueObserver();
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

function drawFloorV81(scene) {
  const ctx = scene.ctx;
  const size = GRID_SIZE * TILE_SIZE;
  const base = ctx.createLinearGradient(0, 0, size, size);
  base.addColorStop(0, '#79b9d0');
  base.addColorStop(0.48, '#67a9c3');
  base.addColorStop(1, '#4f8da9');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // V8.1 deliberately avoids reusing any decorative/altar asset as a floor.
  // A restrained stone-slab texture keeps the corridor light and readable.
  ctx.save();
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;
      ctx.fillStyle = (x + y) % 2 === 0 ? 'rgba(225,246,252,.035)' : 'rgba(18,72,98,.028)';
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

      ctx.strokeStyle = 'rgba(219,242,250,.12)';
      ctx.lineWidth = 0.7;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

      const seed = (x * 17 + y * 31) % 11;
      ctx.strokeStyle = 'rgba(27,89,115,.10)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      if (seed % 2 === 0) {
        ctx.moveTo(px + TILE_SIZE * 0.18, py + TILE_SIZE * (0.32 + (seed % 3) * 0.12));
        ctx.lineTo(px + TILE_SIZE * 0.46, py + TILE_SIZE * (0.38 + (seed % 2) * 0.09));
        ctx.lineTo(px + TILE_SIZE * 0.67, py + TILE_SIZE * (0.29 + (seed % 4) * 0.07));
      } else {
        ctx.moveTo(px + TILE_SIZE * 0.62, py + TILE_SIZE * 0.18);
        ctx.lineTo(px + TILE_SIZE * 0.57, py + TILE_SIZE * 0.42);
        ctx.lineTo(px + TILE_SIZE * 0.73, py + TILE_SIZE * 0.61);
      }
      ctx.stroke();
    }
  }
  ctx.restore();

  const light = ctx.createRadialGradient(size * 0.48, size * 0.43, 12, size * 0.48, size * 0.48, size * 0.72);
  light.addColorStop(0, 'rgba(226,249,255,.18)');
  light.addColorStop(0.58, 'rgba(146,213,235,.06)');
  light.addColorStop(1, 'rgba(19,60,82,.18)');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, size, size);
}

function drawWallBaseV81(scene, x, y) {
  const ctx = scene.ctx;
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  ctx.fillStyle = '#272c32';
  ctx.fillRect(px - 0.5, py - 0.5, TILE_SIZE + 1, TILE_SIZE + 1);

  const wall = filteredAsset(scene, 'wall-surface-v6', 'grayscale(.92) saturate(.18) brightness(.64) contrast(1.18)');
  if (!wall) return;
  scene.wallV81Pattern ??= ctx.createPattern(wall, 'repeat');
  if (!scene.wallV81Pattern) return;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = scene.wallV81Pattern;
  ctx.fillRect(px - 0.5, py - 0.5, TILE_SIZE + 1, TILE_SIZE + 1);
  ctx.restore();
}

function wallExposures(scene, state, x, y) {
  return {
    north: !scene.isWall(state, x, y - 1),
    east: !scene.isWall(state, x + 1, y),
    south: !scene.isWall(state, x, y + 1),
    west: !scene.isWall(state, x - 1, y)
  };
}

function perimeterExposures(x, y) {
  const max = GRID_SIZE - 1;
  return { north: y === 0, east: x === max, south: y === max, west: x === 0 };
}

function drawBand(ctx, side, px, py, thickness, color) {
  ctx.fillStyle = color;
  if (side === 'north') ctx.fillRect(px, py, TILE_SIZE, thickness);
  if (side === 'east') ctx.fillRect(px + TILE_SIZE - thickness, py, thickness, TILE_SIZE);
  if (side === 'south') ctx.fillRect(px, py + TILE_SIZE - thickness, TILE_SIZE, thickness);
  if (side === 'west') ctx.fillRect(px, py, thickness, TILE_SIZE);
}

function drawWallEdgeV81(scene, side, px, py, perimeter = false) {
  const ctx = scene.ctx;
  const edgeInset = perimeter ? TILE_SIZE * 0.11 : TILE_SIZE * 0.085;
  let cx = px + TILE_SIZE / 2;
  let cy = py + TILE_SIZE / 2;
  let rotation = 0;
  if (side === 'north') cy = py + edgeInset;
  if (side === 'south') { cy = py + TILE_SIZE - edgeInset; rotation = Math.PI; }
  if (side === 'east') { cx = px + TILE_SIZE - edgeInset; rotation = Math.PI / 2; }
  if (side === 'west') { cx = px + edgeInset; rotation = -Math.PI / 2; }

  if (perimeter) {
    // The tower exterior gets its own navy-blue architectural trim.
    drawBand(ctx, side, px, py, TILE_SIZE * 0.16, 'rgba(8,39,68,.96)');
    const blueEdge = filteredAsset(scene, 'wall-edge-horizontal-v6', 'grayscale(.45) sepia(.12) saturate(2.15) hue-rotate(157deg) brightness(.72) contrast(1.22)');
    if (blueEdge) scene.drawMapImage(blueEdge, cx, cy, TILE_SIZE * 1.03, TILE_SIZE * 0.29, rotation, 0.88);

    ctx.save();
    ctx.strokeStyle = 'rgba(89,157,207,.58)';
    ctx.lineWidth = 1.2;
    ctx.shadowColor = 'rgba(49,124,185,.35)';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    if (side === 'north' || side === 'south') { ctx.moveTo(px + 3, cy); ctx.lineTo(px + TILE_SIZE - 3, cy); }
    else { ctx.moveTo(cx, py + 3); ctx.lineTo(cx, py + TILE_SIZE - 3); }
    ctx.stroke();
    ctx.restore();
    return;
  }

  const image = filteredAsset(scene, 'wall-edge-horizontal-v6', 'grayscale(.88) saturate(.22) brightness(.69) contrast(1.16)');
  if (image) scene.drawMapImage(image, cx, cy, TILE_SIZE * 1.03, TILE_SIZE * 0.27, rotation, 0.72);
}

function cornerPlacement(x, y) {
  const max = GRID_SIZE - 1;
  if (x === 0 && y === 0) return true;
  if (x === max && y === 0) return true;
  if (x === max && y === max) return true;
  if (x === 0 && y === max) return true;
  return false;
}

function drawCornerV81(scene, x, y) {
  if (!cornerPlacement(x, y)) return false;
  const ctx = scene.ctx;
  const cx = scene.center(x);
  const cy = scene.center(y);
  const size = TILE_SIZE * 0.7;

  // Symmetric cap: no source-art orientation can be wrong at a map corner.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(7,34,60,.98)';
  ctx.strokeStyle = 'rgba(90,157,207,.78)';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'rgba(35,112,174,.35)';
  ctx.shadowBlur = 5;
  roundRectPath(ctx, -size / 2, -size / 2, size, size, 7);
  ctx.fill();
  ctx.stroke();

  ctx.rotate(Math.PI / 4);
  ctx.strokeStyle = 'rgba(170,214,240,.52)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-size * 0.22, -size * 0.22, size * 0.44, size * 0.44);
  ctx.fillStyle = 'rgba(91,178,231,.78)';
  ctx.beginPath();
  ctx.arc(0, 0, 3.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return true;
}

function buildSafeLegacyCell(scene, id) {
  scene.visualThemeV81LegacyCells ??= new Map();
  if (scene.visualThemeV81LegacyCells.has(id)) return scene.visualThemeV81LegacyCells.get(id);
  const sheet = scene.images?.get(scene.chibiSheet);
  if (!sheet) return null;
  const index = portraitIndex(id);
  const cols = 4;
  const rows = 3;
  const sw = Math.floor(sheet.naturalWidth / cols);
  const sh = Math.floor(sheet.naturalHeight / rows);
  if (!sw || !sh) return null;

  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(sheet, (index % cols) * sw, Math.floor(index / cols) * sh, sw, sh, 0, 0, sw, sh);
  const frame = ctx.getImageData(0, 0, sw, sh);
  const pixels = frame.data;
  const count = sw * sh;
  const visited = new Uint8Array(count);
  const queue = new Int32Array(count);
  let head = 0;
  let tail = 0;
  const isBackdrop = (p) => {
    const i = p * 4;
    if (pixels[i + 3] <= 6) return true;
    return pixels[i] <= 22 && pixels[i + 1] <= 22 && pixels[i + 2] <= 30;
  };
  const enqueue = (p) => {
    if (p < 0 || p >= count || visited[p] || !isBackdrop(p)) return;
    visited[p] = 1;
    queue[tail++] = p;
  };
  for (let xx = 0; xx < sw; xx += 1) { enqueue(xx); enqueue((sh - 1) * sw + xx); }
  for (let yy = 0; yy < sh; yy += 1) { enqueue(yy * sw); enqueue(yy * sw + sw - 1); }
  while (head < tail) {
    const p = queue[head++];
    const xx = p % sw;
    const yy = Math.floor(p / sw);
    if (xx > 0) enqueue(p - 1);
    if (xx + 1 < sw) enqueue(p + 1);
    if (yy > 0) enqueue(p - sw);
    if (yy + 1 < sh) enqueue(p + sw);
  }
  for (let p = 0; p < count; p += 1) if (visited[p]) pixels[p * 4 + 3] = 0;
  ctx.putImageData(frame, 0, 0);
  scene.visualThemeV81LegacyCells.set(id, canvas);
  return canvas;
}

function drawCardDropV8(scene, x, y, kind) {
  const style = CARD_STYLE[kind];
  if (!style) return false;
  const ctx = scene.ctx;
  const cx = scene.center(x);
  const cy = scene.center(y);
  const width = TILE_SIZE * 0.46;
  const height = TILE_SIZE * 0.63;
  const t = (scene.idleClock || performance.now()) / 700;
  const bob = Math.sin(t + x * 0.7 + y * 0.9) * 1.2;

  scene.drawSoftShadow(cx, cy + TILE_SIZE * 0.25, TILE_SIZE * 0.38, 0.24);
  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.rotate(-0.06);
  ctx.shadowColor = `rgba(${style.rgb},.72)`;
  ctx.shadowBlur = 11;
  const gradient = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
  gradient.addColorStop(0, `rgba(${style.rgb},.95)`);
  gradient.addColorStop(0.5, `rgba(${style.rgb},.58)`);
  gradient.addColorStop(1, 'rgba(10,15,28,.96)');
  roundRectPath(ctx, -width / 2, -height / 2, width, height, 5);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.shadowBlur = 3;
  ctx.strokeStyle = style.edge;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.globalAlpha = 0.38;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.8;
  roundRectPath(ctx, -width * 0.36, -height * 0.39, width * 0.72, height * 0.78, 3);
  ctx.stroke();
  ctx.globalAlpha = 1;

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
  const previousRenderToken = scene.renderToken.bind(scene);
  const previousLegacySprite = scene.drawLegacySprite.bind(scene);

  scene.drawFloorLayer = () => drawFloorV81(scene);
  scene.drawWallBase = (x, y) => drawWallBaseV81(scene, x, y);
  scene.drawWallBoundary = (state, x, y) => {
    const exposed = wallExposures(scene, state, x, y);
    const perimeter = perimeterExposures(x, y);
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    if (exposed.north || perimeter.north) drawWallEdgeV81(scene, 'north', px, py, perimeter.north);
    if (exposed.east || perimeter.east) drawWallEdgeV81(scene, 'east', px, py, perimeter.east);
    if (exposed.south || perimeter.south) drawWallEdgeV81(scene, 'south', px, py, perimeter.south);
    if (exposed.west || perimeter.west) drawWallEdgeV81(scene, 'west', px, py, perimeter.west);
  };
  scene.drawWallOrnament = (state, x, y) => { drawCornerV81(scene, x, y); };

  // The older black-background cleanup was intentionally permissive and could
  // erase dark skirts/boots. V8.1 only removes near-black pixels connected to
  // the sprite-sheet border, preserving the complete character silhouette.
  scene.drawLegacySprite = (id, cx, cy, size, alpha = 1) => {
    const cell = buildSafeLegacyCell(scene, id);
    if (!cell) return previousLegacySprite(id, cx, cy, size, alpha);
    scene.ctx.save();
    scene.ctx.globalAlpha = alpha;
    scene.ctx.drawImage(cell, cx - size / 2, cy - size / 2, size, size);
    scene.ctx.restore();
    return true;
  };

  scene.renderToken = (x, y, token) => {
    const parsed = parseToken(token);
    if (parsed.type === 'item') {
      const item = ITEMS[parsed.id];
      if (item?.kind === 'card' && drawCardDropV8(scene, x, y, item.card)) return;
    }
    previousRenderToken(x, y, token);
  };

  scene.canvas.dataset.visualTheme = 'v8.1-graywall-lightbluefloor';
  scene.canvas.dataset.cardPipeline = 'programmatic-card-v8';
  scene.canvas.dataset.outerWallTrim = 'navy-perimeter-v8.1';
  scene.canvas.dataset.cornerPipeline = 'symmetric-caps-v8.1';
  scene.canvas.dataset.legacySpriteCleanup = 'strict-border-only-v8.1';
  scene.canvas.dataset.uiThemes = THEMES.map((theme) => theme.id).join(',');
  return scene;
}
