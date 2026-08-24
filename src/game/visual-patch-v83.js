import { ITEMS, TILE_SIZE } from './data.js';
import { parseToken } from './engine.js';
import { portraitIndex } from './anime-portraits.js';
import { getMapAsset } from './map-assets.js';

const CONSERVATIVE_KEY_TOLERANCE = 24;
const INTRINSIC_ALPHA_RATIO = 0.008;

const CARD_ASSET = Object.freeze({
  sun: 'card-sun-v10',
  moon: 'card-moon-v10',
  star: 'card-star-v10'
});

const BARRIER_ASSET = Object.freeze({
  sun: 'barrier-sun-v10',
  moon: 'barrier-moon-v10',
  star: 'barrier-star-v10'
});

function installStyle() {
  if (document.querySelector('style[data-visual-patch-v83]')) return;
  const style = document.createElement('style');
  style.dataset.visualPatchV83 = '1';
  style.textContent = `
    .ui-frame-v82.corner{width:30px!important;height:30px!important;opacity:.28!important}
    .ui-frame-v82.corner.tl{left:1px!important;top:1px!important;transform:scale(.78)!important}
    .ui-frame-v82.corner.tr{right:1px!important;top:1px!important;transform:scaleX(-1) scale(.78)!important}
    .ui-frame-v82.corner.bl{left:1px!important;bottom:1px!important;transform:scaleY(-1) scale(.78)!important}
    .ui-frame-v82.corner.br{right:1px!important;bottom:1px!important;transform:scale(-1) scale(.78)!important}
    .ui-frame-v82.edge{left:31px!important;right:31px!important;height:5px!important;opacity:.16!important}
    .stats-panel>.ui-frame-v82,.intel-panel>.ui-frame-v82,.modal-card>.ui-frame-v82{filter:saturate(.82) brightness(.9)}
    #game-container>.ui-frame-v82{display:none!important}
    .panel{box-shadow:0 16px 48px rgba(0,0,0,.2),inset 0 0 0 1px rgba(145,198,232,.025)!important}
  `;
  document.head.append(style);
}

export function installV83UiFixes() {
  installStyle();
}

function drawGeneratedAsset(scene, assetName, x, y, scale = 0.72, options = {}) {
  const image = getMapAsset(assetName);
  if (!image) return false;
  const cx = scene.center(x) + (options.offsetX ?? 0) * TILE_SIZE;
  const cy = scene.center(y) + (options.offsetY ?? 0) * TILE_SIZE;
  const alpha = options.alpha ?? 1;
  const shadowWidth = options.shadowWidth ?? Math.min(scale * 0.56, 0.42);
  const shadowAlpha = options.shadowAlpha ?? 0.16;
  if (shadowWidth > 0) scene.drawSoftShadow(cx, cy + TILE_SIZE * 0.23, TILE_SIZE * shadowWidth, shadowAlpha);
  return scene.drawMapImage(image, cx, cy, TILE_SIZE * scale, TILE_SIZE * scale, options.rotation ?? 0, alpha);
}

function drawDualGem(scene, x, y) {
  const red = getMapAsset('gem-atk-v10');
  const blue = getMapAsset('gem-def-v10');
  if (!red || !blue) return false;
  const cx = scene.center(x);
  const cy = scene.center(y);
  scene.drawSoftShadow(cx, cy + TILE_SIZE * 0.23, TILE_SIZE * 0.42, 0.17);
  scene.drawMapImage(red, cx - TILE_SIZE * 0.095, cy + TILE_SIZE * 0.015, TILE_SIZE * 0.53, TILE_SIZE * 0.53, -0.08, 0.96);
  scene.drawMapImage(blue, cx + TILE_SIZE * 0.095, cy - TILE_SIZE * 0.015, TILE_SIZE * 0.53, TILE_SIZE * 0.53, 0.08, 0.96);
  return true;
}

function drawGeneratedStatDrop(scene, x, y, id) {
  if (id === 'atk') return drawGeneratedAsset(scene, 'gem-atk-v10', x, y, 0.62, { shadowWidth: 0.36 });
  if (id === 'def') return drawGeneratedAsset(scene, 'gem-def-v10', x, y, 0.62, { shadowWidth: 0.36 });
  if (id === 'dual') return drawDualGem(scene, x, y);
  if (id === 'hp') return drawGeneratedAsset(scene, 'potion-red-v10', x, y, 0.61, { shadowWidth: 0.34 });
  if (id === 'hpLarge') return drawGeneratedAsset(scene, 'potion-blue-v10', x, y, 0.69, { shadowWidth: 0.38 });
  return false;
}

function drawGeneratedCard(scene, x, y, kind) {
  const asset = CARD_ASSET[kind];
  if (!asset) return false;
  const t = (scene.idleClock || performance.now()) / 800;
  const bob = Math.sin(t + x * 0.53 + y * 0.71) * 0.018;
  return drawGeneratedAsset(scene, asset, x, y, 0.72, {
    offsetY: -0.02 + bob,
    rotation: -0.035,
    shadowWidth: 0.38,
    shadowAlpha: 0.2
  });
}

function drawGeneratedBarrier(scene, x, y, kind) {
  const barrier = BARRIER_ASSET[kind];
  const runeFloor = getMapAsset('rune-floor-barrier-v10');
  const barrierImage = barrier ? getMapAsset(barrier) : null;
  if (!runeFloor || !barrierImage) return false;

  const cx = scene.center(x);
  const cy = scene.center(y);
  scene.ctx.save();
  scene.ctx.globalAlpha = 0.96;
  scene.ctx.drawImage(runeFloor, cx - TILE_SIZE / 2, cy - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
  scene.ctx.restore();

  scene.drawSoftShadow(cx, cy + TILE_SIZE * 0.2, TILE_SIZE * 0.56, 0.15);
  const t = (scene.idleClock || performance.now()) / 950;
  const pulse = 0.86 + Math.sin(t + x + y * 0.7) * 0.018;
  scene.drawMapImage(barrierImage, cx, cy - TILE_SIZE * 0.035, TILE_SIZE * pulse, TILE_SIZE * pulse, 0, 0.93);
  return true;
}

function drawGeneratedStair(scene, x, y, direction) {
  const asset = direction === 'up' ? 'rune-stairs-up-v10' : 'rune-stairs-down-v10';
  const image = getMapAsset(asset);
  if (!image) return false;
  const cx = scene.center(x);
  const cy = scene.center(y);
  scene.drawSoftShadow(cx, cy + TILE_SIZE * 0.24, TILE_SIZE * 0.5, 0.12);
  scene.ctx.save();
  scene.ctx.globalAlpha = 0.99;
  scene.ctx.drawImage(image, cx - TILE_SIZE / 2, cy - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
  scene.ctx.restore();
  return true;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function buildConservativeLegacyCell(scene, id) {
  const image = scene.images?.get(scene.chibiSheet);
  if (!image) return null;
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const sw = Math.floor(imageWidth / 4);
  const sh = Math.floor(imageHeight / 3);
  if (!sw || !sh) return null;

  const index = portraitIndex(id);
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, (index % 4) * sw, Math.floor(index / 4) * sh, sw, sh, 0, 0, sw, sh);

  const frame = ctx.getImageData(0, 0, sw, sh);
  const pixels = frame.data;
  const count = sw * sh;
  let transparentCount = 0;
  for (let p = 0; p < count; p += 1) if (pixels[p * 4 + 3] < 245) transparentCount += 1;

  // Preserve native alpha exactly; generated enemy art (including Mote V10) is
  // now loaded through the enemy manifest and should never pass through keying.
  if (transparentCount / count >= INTRINSIC_ALPHA_RATIO) return canvas;

  const rs = [];
  const gs = [];
  const bs = [];
  const sample = (x, y) => {
    const i = (y * sw + x) * 4;
    if (pixels[i + 3] <= 6) return;
    rs.push(pixels[i]);
    gs.push(pixels[i + 1]);
    bs.push(pixels[i + 2]);
  };
  const edgeInset = Math.max(1, Math.min(3, Math.floor(Math.min(sw, sh) * 0.03)));
  for (let offset = 0; offset <= edgeInset; offset += 1) {
    sample(offset, offset);
    sample(sw - 1 - offset, offset);
    sample(offset, sh - 1 - offset);
    sample(sw - 1 - offset, sh - 1 - offset);
  }
  if (!rs.length) return canvas;

  const br = median(rs);
  const bg = median(gs);
  const bb = median(bs);
  const toleranceSq = CONSERVATIVE_KEY_TOLERANCE * CONSERVATIVE_KEY_TOLERANCE;
  const visited = new Uint8Array(count);
  const queue = new Int32Array(count);
  let head = 0;
  let tail = 0;

  const isBackdrop = (p) => {
    const i = p * 4;
    if (pixels[i + 3] <= 6) return true;
    const dr = pixels[i] - br;
    const dg = pixels[i + 1] - bg;
    const db = pixels[i + 2] - bb;
    return dr * dr + dg * dg + db * db <= toleranceSq;
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

  for (let p = 0; p < count; p += 1) if (visited[p]) pixels[p * 4 + 3] = 0;
  ctx.putImageData(frame, 0, 0);
  return canvas;
}

function installConservativeLegacySprites(scene) {
  const previousDrawLegacySprite = scene.drawLegacySprite.bind(scene);
  const cache = new Map();
  scene.drawLegacySprite = (id, cx, cy, size, alpha = 1) => {
    const key = portraitIndex(id);
    let cell = cache.get(key);
    if (!cell) {
      cell = buildConservativeLegacyCell(scene, id);
      if (cell) cache.set(key, cell);
    }
    if (!cell) return previousDrawLegacySprite(id, cx, cy, size, alpha);

    const ctx = scene.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(cell, cx - size / 2, cy - size / 2, size, size);
    ctx.restore();
    return true;
  };
}

export function applyV83RenderFixes(scene) {
  if (!scene?.ctx || scene.visualPatchV83Applied) return scene;
  scene.visualPatchV83Applied = true;
  installConservativeLegacySprites(scene);
  const previousRenderToken = scene.renderToken.bind(scene);
  scene.renderToken = (x, y, token) => {
    if (token === 'U' && drawGeneratedStair(scene, x, y, 'up')) return;
    if (token === 'D' && drawGeneratedStair(scene, x, y, 'down')) return;

    const parsed = parseToken(token);
    if (parsed.type === 'door' && drawGeneratedBarrier(scene, x, y, parsed.id)) return;
    if (parsed.type === 'item') {
      const item = ITEMS[parsed.id];
      if (item?.kind === 'card' && drawGeneratedCard(scene, x, y, item.card)) return;
      if (drawGeneratedStatDrop(scene, x, y, parsed.id)) return;
    }
    previousRenderToken(x, y, token);
  };
  scene.canvas.dataset.statItemPipeline = 'generated-items-v10';
  scene.canvas.dataset.cardPipeline = 'generated-cards-v10';
  scene.canvas.dataset.barrierPipeline = 'generated-barrier-rune-v10';
  scene.canvas.dataset.stairPipeline = 'generated-rune-stairs-v10';
  scene.canvas.dataset.spriteCleanup = 'native-alpha-first-v10';
  return scene;
}
