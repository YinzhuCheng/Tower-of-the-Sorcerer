import { GRID_SIZE, ITEMS, TILE_SIZE } from './data.js';
import { parseToken } from './engine.js';
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

function drawFloorV8(scene) {
  const ctx = scene.ctx;
  const size = GRID_SIZE * TILE_SIZE;
  const base = ctx.createLinearGradient(0, 0, size, size);
  base.addColorStop(0, '#173548');
  base.addColorStop(0.48, '#102b3e');
  base.addColorStop(1, '#081723');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const floor = filteredAsset(scene, 'floor-main-v4', 'grayscale(.35) saturate(1.35) hue-rotate(150deg) brightness(1.22) contrast(.95)')
    ?? filteredAsset(scene, 'floor-main', 'grayscale(.35) saturate(1.3) hue-rotate(150deg) brightness(1.18)');
  if (floor) {
    const pattern = ctx.createPattern(floor, 'repeat');
    if (pattern) {
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, size, size);
      ctx.restore();
    }
  }

  const light = ctx.createRadialGradient(size * 0.48, size * 0.45, 10, size * 0.48, size * 0.48, size * 0.7);
  light.addColorStop(0, 'rgba(111,205,240,.18)');
  light.addColorStop(0.55, 'rgba(65,145,193,.08)');
  light.addColorStop(1, 'rgba(2,9,18,.28)');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, size, size);
}

function drawWallBaseV8(scene, x, y) {
  const ctx = scene.ctx;
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  ctx.fillStyle = '#242a31';
  ctx.fillRect(px - 0.5, py - 0.5, TILE_SIZE + 1, TILE_SIZE + 1);

  const wall = filteredAsset(scene, 'wall-surface-v6', 'grayscale(.88) saturate(.32) brightness(.68) contrast(1.16)');
  if (!wall) return;
  scene.wallV8Pattern ??= ctx.createPattern(wall, 'repeat');
  if (!scene.wallV8Pattern) return;
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = scene.wallV8Pattern;
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

function drawWallEdgeV8(scene, side, px, py, perimeter = false) {
  const image = filteredAsset(scene, 'wall-edge-horizontal-v6', 'grayscale(.82) saturate(.35) brightness(.76) contrast(1.18)');
  const ctx = scene.ctx;
  const edgeInset = perimeter ? TILE_SIZE * 0.13 : TILE_SIZE * 0.09;
  let cx = px + TILE_SIZE / 2;
  let cy = py + TILE_SIZE / 2;
  let rotation = 0;
  if (side === 'north') cy = py + edgeInset;
  if (side === 'south') { cy = py + TILE_SIZE - edgeInset; rotation = Math.PI; }
  if (side === 'east') { cx = px + TILE_SIZE - edgeInset; rotation = Math.PI / 2; }
  if (side === 'west') { cx = px + edgeInset; rotation = -Math.PI / 2; }

  ctx.save();
  ctx.strokeStyle = 'rgba(1,6,10,.78)';
  ctx.lineWidth = 5;
  ctx.shadowColor = 'rgba(0,0,0,.5)';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  if (side === 'north' || side === 'south') { ctx.moveTo(px + 2, cy); ctx.lineTo(px + TILE_SIZE - 2, cy); }
  else { ctx.moveTo(cx, py + 2); ctx.lineTo(cx, py + TILE_SIZE - 2); }
  ctx.stroke();
  ctx.restore();

  if (image) scene.drawMapImage(image, cx, cy, TILE_SIZE * 1.04, TILE_SIZE * 0.3, rotation, 0.82);
}

function cornerPlacement(x, y) {
  const max = GRID_SIZE - 1;
  if (x === 0 && y === 0) return { rotation: 0, dx: 0.08, dy: 0.08 };
  if (x === max && y === 0) return { rotation: Math.PI / 2, dx: -0.08, dy: 0.08 };
  if (x === max && y === max) return { rotation: Math.PI, dx: -0.08, dy: -0.08 };
  if (x === 0 && y === max) return { rotation: -Math.PI / 2, dx: 0.08, dy: -0.08 };
  return null;
}

function drawCornerV8(scene, x, y) {
  const placement = cornerPlacement(x, y);
  if (!placement) return false;
  const image = filteredAsset(scene, 'wall-outer-corner-v6', 'grayscale(.78) saturate(.42) brightness(.78) contrast(1.08)');
  if (!image) return false;
  scene.drawMapImage(
    image,
    scene.center(x) + placement.dx * TILE_SIZE,
    scene.center(y) + placement.dy * TILE_SIZE,
    TILE_SIZE * 1.08,
    TILE_SIZE * 1.08,
    placement.rotation,
    0.92
  );
  return true;
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

  scene.drawFloorLayer = () => drawFloorV8(scene);
  scene.drawWallBase = (x, y) => drawWallBaseV8(scene, x, y);
  scene.drawWallBoundary = (state, x, y) => {
    const exposed = wallExposures(scene, state, x, y);
    const perimeter = perimeterExposures(x, y);
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    if (exposed.north || perimeter.north) drawWallEdgeV8(scene, 'north', px, py, perimeter.north);
    if (exposed.east || perimeter.east) drawWallEdgeV8(scene, 'east', px, py, perimeter.east);
    if (exposed.south || perimeter.south) drawWallEdgeV8(scene, 'south', px, py, perimeter.south);
    if (exposed.west || perimeter.west) drawWallEdgeV8(scene, 'west', px, py, perimeter.west);
  };
  scene.drawWallOrnament = (state, x, y) => { drawCornerV8(scene, x, y); };
  scene.renderToken = (x, y, token) => {
    const parsed = parseToken(token);
    if (parsed.type === 'item') {
      const item = ITEMS[parsed.id];
      if (item?.kind === 'card' && drawCardDropV8(scene, x, y, item.card)) return;
    }
    previousRenderToken(x, y, token);
  };

  scene.canvas.dataset.visualTheme = 'v8-graywall-bluefloor';
  scene.canvas.dataset.cardPipeline = 'programmatic-card-v8';
  scene.canvas.dataset.uiThemes = THEMES.map((theme) => theme.id).join(',');
  return scene;
}
