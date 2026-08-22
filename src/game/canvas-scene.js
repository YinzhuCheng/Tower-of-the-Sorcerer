import { createCanvasTowerScene as createBaseCanvasTowerScene } from './anime-canvas-scene.js';
import { ENEMIES, TILE_SIZE } from './data.js';
import { parseToken } from './engine.js';
import { getMapAsset } from './map-assets.js';

const FEATURED_ENEMY_ASSET = Object.freeze({
  catScout: 'featured-cat-scout',
  catMage: 'featured-cat-mage',
  catBoss: 'featured-cat-boss',
  swordApprentice: 'featured-sword-apprentice'
});

function buildTransparentItemCell(image, index, cols = 6, rows = 4) {
  if (!image) return null;
  const sw = Math.floor(image.naturalWidth / cols);
  const sh = Math.floor(image.naturalHeight / rows);
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
    return r <= 48 && g <= 48 && b <= 62;
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

  // Soften the one-pixel dark fringe left by old atlas anti-aliasing.
  for (let y = 1; y < sh - 1; y += 1) {
    for (let x = 1; x < sw - 1; x += 1) {
      const p = y * sw + x;
      if (visited[p]) continue;
      const i = p * 4;
      const dark = pixels[i] < 72 && pixels[i + 1] < 72 && pixels[i + 2] < 88;
      if (!dark) continue;
      const touchesClear = visited[p - 1] || visited[p + 1] || visited[p - sw] || visited[p + sw];
      if (touchesClear) pixels[i + 3] = Math.min(pixels[i + 3], 128);
    }
  }

  ctx.putImageData(frame, 0, 0);
  return canvas;
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

  scene.canvas.dataset.artPipeline = 'transparent-v2';

  const legacyDrawItem = scene.drawItem.bind(scene);
  scene.drawItem = (index, x, y, scale = 0.8) => {
    let cell = cleanedItemCells.get(index);
    if (!cell) {
      const sheet = scene.images.get(scene.itemSheet);
      cell = buildTransparentItemCell(sheet, index);
      if (cell) cleanedItemCells.set(index, cell);
    }
    if (!cell) return legacyDrawItem(index, x, y, scale);

    const size = TILE_SIZE * scale;
    const cx = scene.center(x);
    const cy = scene.center(y);
    scene.ctx.save();
    scene.ctx.imageSmoothingEnabled = true;
    scene.ctx.imageSmoothingQuality = 'high';
    scene.ctx.drawImage(cell, cx - size / 2, cy - size / 2, size, size);
    scene.ctx.restore();
    return true;
  };

  const legacyRenderEnemy = scene.renderEnemy.bind(scene);
  scene.renderEnemy = (x, y, enemyId) => {
    const featured = FEATURED_ENEMY_ASSET[enemyId];
    if (featured && drawFeaturedEnemy(scene, x, y, enemyId, featured)) return;
    return legacyRenderEnemy(x, y, enemyId);
  };

  const legacyRenderToken = scene.renderToken.bind(scene);
  scene.renderToken = (x, y, token) => {
    if (token === 'shop' && drawFeaturedProp(scene, 'featured-shop', x, y, 1.12, 0.62)) return;

    const parsed = parseToken(token);
    if (parsed.type === 'item' && parsed.id === 'codex') {
      if (drawFeaturedProp(scene, 'featured-codex-shrine', x, y, 0.92, 0.48)) return;
    }
    if (parsed.type === 'item' && parsed.id === 'holy') {
      if (drawFeaturedProp(scene, 'featured-treasure', x, y, 0.9, 0.52)) return;
    }
    if (parsed.type === 'switch') {
      if (drawFeaturedProp(scene, 'featured-switch-single', x, y, 0.8, 0.44)) return;
    }
    if (parsed.type === 'gate') {
      const asset = parsed.id === 'tri' ? 'featured-rune-sequence' : 'featured-switch-dual';
      const scale = parsed.id === 'tri' ? 0.88 : 0.86;
      if (drawFeaturedProp(scene, asset, x, y, scale, 0.5)) return;
    }

    return legacyRenderToken(x, y, token);
  };

  return scene;
}
