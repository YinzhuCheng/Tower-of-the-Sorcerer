import { createCanvasTowerScene as createBaseCanvasTowerScene } from './anime-canvas-scene.js';
import { ENEMIES, TILE_SIZE } from './data.js';
import { parseToken } from './engine.js';
import { portraitIndex } from './anime-portraits.js';
import { getMapAsset } from './map-assets.js';

const FEATURED_ENEMY_ASSET = Object.freeze({
  catScout: 'featured-cat-scout',
  catMage: 'featured-cat-mage',
  catBoss: 'featured-cat-boss',
  swordApprentice: 'featured-sword-apprentice'
});

const DUAL_GATE_IDS = new Set(['tide', 'ember']);
const SEQUENCE_GATE_IDS = new Set(['mirror', 'tri']);

function buildTransparentCell(image, index, cols, rows) {
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
  const sx = (index % cols) * sw;
  const sy = Math.floor(index / cols) * sh;
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);

  const frame = ctx.getImageData(0, 0, sw, sh);
  const pixels = frame.data;
  const count = sw * sh;
  const visited = new Uint8Array(count);
  const queue = new Int32Array(count);
  let head = 0;
  let tail = 0;

  const isBackdrop = (p) => {
    const i = p * 4;
    const a = pixels[i + 3];
    if (a <= 6) return true;
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    return r <= 52 && g <= 52 && b <= 68;
  };

  const enqueue = (p) => {
    if (p < 0 || p >= count || visited[p] || !isBackdrop(p)) return;
    visited[p] = 1;
    queue[tail++] = p;
  };

  for (let x = 0; x < sw; x += 1) {
    enqueue(x);
    enqueue((sh - 1) * sw + x);
  }
  for (let y = 0; y < sh; y += 1) {
    enqueue(y * sw);
    enqueue(y * sw + sw - 1);
  }

  while (head < tail) {
    const p = queue[head++];
    const x = p % sw;
    const y = Math.floor(p / sw);
    if (x > 0) enqueue(p - 1);
    if (x + 1 < sw) enqueue(p + 1);
    if (y > 0) enqueue(p - sw);
    if (y + 1 < sh) enqueue(p + sw);
  }

  for (let p = 0; p < count; p += 1) {
    if (visited[p]) pixels[p * 4 + 3] = 0;
  }

  for (let y = 1; y < sh - 1; y += 1) {
    for (let x = 1; x < sw - 1; x += 1) {
      const p = y * sw + x;
      if (visited[p]) continue;
      const i = p * 4;
      const dark = pixels[i] < 76 && pixels[i + 1] < 76 && pixels[i + 2] < 92;
      if (!dark) continue;
      const touchesClear = visited[p - 1] || visited[p + 1] || visited[p - sw] || visited[p + sw];
      if (touchesClear) pixels[i + 3] = Math.min(pixels[i + 3], 128);
    }
  }

  ctx.putImageData(frame, 0, 0);
  return canvas;
}

function drawCell(scene, cell, cx, cy, size, alpha = 1, cropBottom = 0) {
  if (!cell) return false;
  const sourceHeight = cell.height * (1 - cropBottom);
  scene.ctx.save();
  scene.ctx.globalAlpha = alpha;
  scene.ctx.imageSmoothingEnabled = true;
  scene.ctx.imageSmoothingQuality = 'high';
  scene.ctx.drawImage(cell, 0, 0, cell.width, sourceHeight, cx - size / 2, cy - size / 2, size, size);
  scene.ctx.restore();
  return true;
}

function drawFeaturedEnemy(scene, x, y, enemyId, assetName) {
  const enemy = ENEMIES[enemyId];
  const image = getMapAsset(assetName);
  if (!enemy || !image) return false;

  const cx = scene.center(x);
  const cy = scene.center(y);
  const size = TILE_SIZE * (enemy.boss ? 1.12 : 0.96);
  scene.drawSoftShadow(cx, cy + TILE_SIZE * 0.3, TILE_SIZE * (enemy.boss ? 0.58 : 0.48), 0.25);

  if (enemy.boss) {
    scene.ctx.save();
    scene.ctx.globalAlpha = 0.55;
    scene.ctx.strokeStyle = '#ff9bd4';
    scene.ctx.shadowColor = '#ff9bd4';
    scene.ctx.shadowBlur = 12;
    scene.ctx.lineWidth = 1.5;
    scene.ctx.beginPath();
    scene.ctx.ellipse(cx, cy + TILE_SIZE * 0.08, TILE_SIZE * 0.43, TILE_SIZE * 0.37, 0, 0, Math.PI * 2);
    scene.ctx.stroke();
    scene.ctx.restore();
  }

  scene.drawMapImage(image, cx, cy + TILE_SIZE * (enemy.boss ? -0.015 : 0.01), size, size);
  return true;
}

function drawFeaturedProp(scene, assetName, x, y, scale, shadowWidth = 0.5) {
  const image = getMapAsset(assetName);
  if (!image) return false;
  const cx = scene.center(x);
  const cy = scene.center(y);
  scene.drawSoftShadow(cx, cy + TILE_SIZE * 0.29, TILE_SIZE * shadowWidth, 0.2);
  scene.drawMapImage(image, cx, cy, TILE_SIZE * scale, TILE_SIZE * scale);
  return true;
}

export function createCanvasTowerScene(bridge, parent = document.getElementById('game-container')) {
  const scene = createBaseCanvasTowerScene(bridge, parent);
  const cleanedItemCells = new Map();
  const cleanedChibiCells = new Map();
  const cleanedTileCells = new Map();

  scene.canvas.dataset.artPipeline = 'transparent-v2';
  scene.canvas.dataset.assetRevision = '2026-08-22';

  const legacyDrawItem = scene.drawItem.bind(scene);
  scene.drawItem = (index, x, y, scale = 0.8) => {
    let cell = cleanedItemCells.get(index);
    if (!cell) {
      const sheet = scene.images.get(scene.itemSheet);
      cell = buildTransparentCell(sheet, index, 6, 4);
      if (cell) cleanedItemCells.set(index, cell);
    }
    if (!cell) return legacyDrawItem(index, x, y, scale);
    return drawCell(scene, cell, scene.center(x), scene.center(y), TILE_SIZE * scale);
  };

  const legacyDrawLegacySprite = scene.drawLegacySprite.bind(scene);
  scene.drawLegacySprite = (id, cx, cy, size, alpha = 1) => {
    const index = portraitIndex(id);
    let cell = cleanedChibiCells.get(index);
    if (!cell) {
      const sheet = scene.images.get(scene.chibiSheet);
      cell = buildTransparentCell(sheet, index, 4, 3);
      if (cell) cleanedChibiCells.set(index, cell);
    }
    if (!cell) return legacyDrawLegacySprite(id, cx, cy, size, alpha);
    return drawCell(scene, cell, cx, cy, size, alpha);
  };

  const legacyDrawTileIcon = scene.drawTileIcon.bind(scene);
  scene.drawTileIcon = (index, x, y, scale = 0.9, alpha = 1) => {
    let cell = cleanedTileCells.get(index);
    if (!cell) {
      const sheet = scene.images.get(scene.tileSheet);
      cell = buildTransparentCell(sheet, index, 5, 5);
      if (cell) cleanedTileCells.set(index, cell);
    }
    if (!cell) return legacyDrawTileIcon(index, x, y, scale, alpha);
    return drawCell(scene, cell, scene.center(x), scene.center(y), TILE_SIZE * scale, alpha, 0.27);
  };

  const legacyRenderEnemy = scene.renderEnemy.bind(scene);
  scene.renderEnemy = (x, y, enemyId) => {
    const featured = FEATURED_ENEMY_ASSET[enemyId];
    if (featured && drawFeaturedEnemy(scene, x, y, enemyId, featured)) return;
    return legacyRenderEnemy(x, y, enemyId);
  };

  const legacyRenderToken = scene.renderToken.bind(scene);
  scene.renderToken = (x, y, token) => {
    if (token === 'shop' && drawFeaturedProp(scene, 'featured-shop', x, y, 1.02, 0.62)) return;

    const parsed = parseToken(token);
    if (parsed.type === 'item' && parsed.id === 'codex') {
      if (drawFeaturedProp(scene, 'featured-codex-shrine', x, y, 0.9, 0.48)) return;
    }
    if (parsed.type === 'item' && parsed.id === 'holy') {
      if (drawFeaturedProp(scene, 'featured-treasure', x, y, 0.88, 0.52)) return;
    }
    if (parsed.type === 'switch') {
      if (drawFeaturedProp(scene, 'featured-switch-single', x, y, 0.8, 0.44)) return;
    }
    if (parsed.type === 'gate' && DUAL_GATE_IDS.has(parsed.id)) {
      if (drawFeaturedProp(scene, 'featured-switch-dual', x, y, 0.86, 0.5)) return;
    }
    if (parsed.type === 'gate' && SEQUENCE_GATE_IDS.has(parsed.id)) {
      if (drawFeaturedProp(scene, 'featured-rune-sequence', x, y, 0.88, 0.5)) return;
    }

    return legacyRenderToken(x, y, token);
  };

  return scene;
}
