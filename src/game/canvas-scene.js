import { createCanvasTowerScene as createBaseCanvasTowerScene } from './anime-canvas-scene.js';
import { ENEMIES, ITEMS, TILE_SIZE } from './data.js';
import { parseToken } from './engine.js';
import { portraitIndex } from './anime-portraits.js';
import { getMapAsset } from './map-assets.js';

const FEATURED_ENEMY_ASSET = Object.freeze({
  catScout: 'featured-cat-scout',
  catMage: 'featured-cat-mage',
  catBoss: 'featured-cat-boss',
  swordApprentice: 'featured-sword-apprentice'
});

const CARD_DROP_ASSET = Object.freeze({
  sun: 'card-sun-drop-v4',
  moon: 'card-moon-drop-v4',
  star: 'card-star-drop-v4'
});

const DUAL_GATE_IDS = new Set(['tide', 'ember']);
const SEQUENCE_GATE_IDS = new Set(['mirror', 'tri']);

function countBits(mask) {
  let n = mask & 15;
  let count = 0;
  while (n) { count += n & 1; n >>= 1; }
  return count;
}

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
    if (pixels[i + 3] <= 6) return true;
    return pixels[i] <= 52 && pixels[i + 1] <= 52 && pixels[i + 2] <= 68;
  };
  const enqueue = (p) => {
    if (p < 0 || p >= count || visited[p] || !isBackdrop(p)) return;
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
      if (visited[p]) continue;
      const i = p * 4;
      const dark = pixels[i] < 76 && pixels[i + 1] < 76 && pixels[i + 2] < 92;
      if (dark && (visited[p - 1] || visited[p + 1] || visited[p - sw] || visited[p + sw])) {
        pixels[i + 3] = Math.min(pixels[i + 3], 128);
      }
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
  scene.drawMapImage(image, cx, cy + TILE_SIZE * (enemy.boss ? -0.015 : 0.01), size, size);
  return true;
}

function drawFeaturedProp(scene, assetName, x, y, scale, shadowWidth = 0.5, alpha = 1) {
  const image = getMapAsset(assetName);
  if (!image) return false;
  const cx = scene.center(x);
  const cy = scene.center(y);
  scene.drawSoftShadow(cx, cy + TILE_SIZE * 0.29, TILE_SIZE * shadowWidth, 0.2);
  scene.drawMapImage(image, cx, cy, TILE_SIZE * scale, TILE_SIZE * scale, 0, alpha);
  return true;
}

function wallAssetForMask(mask) {
  const count = countBits(mask);
  if (mask === 10) return { asset: 'wall-body-v4', rotation: 0, scale: 1.24, alpha: 0.9 };
  if (mask === 5) return { asset: 'wall-body-v4', rotation: Math.PI / 2, scale: 1.24, alpha: 0.9 };
  if (count === 1) return { asset: 'wall-pillar-v4', rotation: 0, scale: 1.06, alpha: 0.92 };
  if (count === 2) {
    const rotations = { 3: Math.PI, 6: -Math.PI / 2, 12: 0, 9: Math.PI / 2 };
    return { asset: 'wall-outer-corner-v4', rotation: rotations[mask] ?? 0, scale: 1.12, alpha: 0.93 };
  }
  if (count === 3) return { asset: 'wall-inner-corner-v4', rotation: 0, scale: 1.08, alpha: 0.88 };
  if (count === 4) return { asset: 'wall-body-v4', rotation: 0, scale: 1.02, alpha: 0.48 };
  return { asset: 'wall-pillar-v4', rotation: 0, scale: 1.02, alpha: 0.9 };
}

export function createCanvasTowerScene(bridge, parent = document.getElementById('game-container')) {
  const scene = createBaseCanvasTowerScene(bridge, parent);
  const cleanedItemCells = new Map();
  const cleanedChibiCells = new Map();
  const cleanedTileCells = new Map();

  scene.canvas.dataset.artPipeline = 'moonlit-v4';
  scene.canvas.dataset.assetRevision = '2026-08-22-v4';

  const legacyDrawItem = scene.drawItem.bind(scene);
  scene.drawItem = (index, x, y, scale = 0.8) => {
    let cell = cleanedItemCells.get(index);
    if (!cell) {
      cell = buildTransparentCell(scene.images.get(scene.itemSheet), index, 6, 4);
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
      cell = buildTransparentCell(scene.images.get(scene.chibiSheet), index, 4, 3);
      if (cell) cleanedChibiCells.set(index, cell);
    }
    if (!cell) return legacyDrawLegacySprite(id, cx, cy, size, alpha);
    return drawCell(scene, cell, cx, cy, size, alpha);
  };

  const legacyDrawTileIcon = scene.drawTileIcon.bind(scene);
  scene.drawTileIcon = (index, x, y, scale = 0.9, alpha = 1) => {
    let cell = cleanedTileCells.get(index);
    if (!cell) {
      cell = buildTransparentCell(scene.images.get(scene.tileSheet), index, 5, 5);
      if (cell) cleanedTileCells.set(index, cell);
    }
    if (!cell) return legacyDrawTileIcon(index, x, y, scale, alpha);
    return drawCell(scene, cell, scene.center(x), scene.center(y), TILE_SIZE * scale, alpha, 0.27);
  };

  const legacyWallOrnament = scene.drawWallOrnament.bind(scene);
  scene.drawWallOrnament = (state, x, y) => {
    const mask = scene.wallMask(state, x, y);
    const visual = wallAssetForMask(mask);
    const image = getMapAsset(visual.asset);
    if (!image) return legacyWallOrnament(state, x, y);
    if ((mask === 10 || mask === 5) && ((x + y) & 1)) return;
    scene.drawMapImage(image, scene.center(x), scene.center(y), TILE_SIZE * visual.scale, TILE_SIZE * visual.scale, visual.rotation, visual.alpha);
  };

  const legacyRenderEnemy = scene.renderEnemy.bind(scene);
  scene.renderEnemy = (x, y, enemyId) => {
    const enemy = ENEMIES[enemyId];
    if (!enemy) return;
    const cx = scene.center(x);
    const cy = scene.center(y);

    if (enemy.boss) {
      const gate = getMapAsset('gate-boss-v4');
      if (gate) scene.drawMapImage(gate, cx, cy - TILE_SIZE * 0.03, TILE_SIZE * 1.2, TILE_SIZE * 1.2, 0, 0.42);
    }

    const t = scene.idleClock || performance.now();
    const phase = (x * 1.71 + y * 2.13 + enemyId.length * 0.47);
    const bob = Math.sin(t / 520 + phase) * (enemy.boss ? 0.8 : 1.25);
    const breathe = 1 + Math.sin(t / 760 + phase * 0.7) * (enemy.boss ? 0.008 : 0.014);

    scene.ctx.save();
    scene.ctx.translate(cx, cy + bob);
    scene.ctx.scale(breathe, breathe);
    scene.ctx.translate(-cx, -cy);
    const featured = FEATURED_ENEMY_ASSET[enemyId];
    if (!(featured && drawFeaturedEnemy(scene, x, y, enemyId, featured))) legacyRenderEnemy(x, y, enemyId);
    scene.ctx.restore();
  };

  const legacyRenderToken = scene.renderToken.bind(scene);
  scene.renderToken = (x, y, token) => {
    if (token === 'U' && drawFeaturedProp(scene, 'stairs-up-v4', x, y, 1.02, 0.58)) return;
    if (token === 'D' && drawFeaturedProp(scene, 'stairs-down-v4', x, y, 1.02, 0.58)) return;
    if (token === 'shop' && drawFeaturedProp(scene, 'featured-shop', x, y, 1.02, 0.62)) return;

    const parsed = parseToken(token);
    if (parsed.type === 'door') {
      const asset = { sun: 'gate-sun-v4', moon: 'gate-moon-v4', star: 'gate-star-v4' }[parsed.id];
      if (asset && drawFeaturedProp(scene, asset, x, y, 1.03, 0.54)) return;
    }
    if (parsed.type === 'item') {
      const item = ITEMS[parsed.id];
      if (item?.kind === 'card') {
        const asset = CARD_DROP_ASSET[item.card];
        if (asset && drawFeaturedProp(scene, asset, x, y, 0.76, 0.42)) return;
      }
      if (parsed.id === 'codex' && drawFeaturedProp(scene, 'featured-codex-shrine', x, y, 0.9, 0.48)) return;
      if (parsed.id === 'holy' && drawFeaturedProp(scene, 'featured-treasure', x, y, 0.88, 0.52)) return;
    }
    if (parsed.type === 'switch' && drawFeaturedProp(scene, 'featured-switch-single', x, y, 0.8, 0.44)) return;
    if (parsed.type === 'gate' && DUAL_GATE_IDS.has(parsed.id) && drawFeaturedProp(scene, 'featured-switch-dual', x, y, 0.86, 0.5)) return;
    if (parsed.type === 'gate' && SEQUENCE_GATE_IDS.has(parsed.id) && drawFeaturedProp(scene, 'featured-rune-sequence', x, y, 0.88, 0.5)) return;
    return legacyRenderToken(x, y, token);
  };

  let frame = 0;
  let lastPaint = 0;
  const tick = (time) => {
    if (!scene.canvas.isConnected) return;
    if (scene.itemSheet && time - lastPaint >= 90) {
      scene.idleClock = time;
      scene.renderFloor();
      lastPaint = time;
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  const legacyDestroy = scene.destroy.bind(scene);
  scene.destroy = () => {
    cancelAnimationFrame(frame);
    legacyDestroy();
  };

  return scene;
}
