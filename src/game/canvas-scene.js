import { createCanvasTowerScene as createBaseCanvasTowerScene } from './anime-canvas-scene.js';
import { ENEMIES, ITEMS, TILE_SIZE } from './data.js';
import { parseToken } from './engine.js';
import { portraitIndex } from './anime-portraits.js';
import { getMapAsset } from './map-assets.js';
import { applyWallMaterialV6 } from './wall-material-v6.js';

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

const VAULT_GATE_IDS = new Set(['dualKeyVault', 'hushVault', 'twinChordVault', 'mirrorReservoirVault']);
const SINGLE_SWITCH_GATE_IDS = new Set(['forge', 'hush']);
const DUAL_SWITCH_GATE_IDS = new Set(['tide', 'ember']);
const SEQUENCE_GATE_IDS = new Set(['mirror', 'tri', 'blackstar']);

const INTERACTABLE_ITEM_ASSET = Object.freeze({
  lucky: 'relic-lucky-coin',
  weapon: 'relic-moon-blade',
  shield: 'relic-dragon-scale-talisman',
  ward: 'relic-silent-ward-earring',
  aetherPrism: 'relic-aether-prism',
  conduitCodex: 'relic-conduit-codex',
  arcaneBattery: 'relic-arcane-battery',
  mirrorReservoir: 'relic-mirror-reservoir',
  crownCapacitor: 'relic-crown-capacitor',
  originFocus: 'relic-origin-focus',
  shelterAegis: 'relic-shelter-aegis',
  auditLedger: 'relic-audit-ledger',
  relayCapacitor: 'relic-relay-capacitor'
});

const ACCEPTED_RESOURCE_ASSET = Object.freeze({
  act3Atk: 'gem-atk-v10',
  act3Def: 'gem-def-v10',
  act3Dual: 'gem-atk-v10',
  act3Hp: 'potion-red-v10',
  act3Restorative: 'potion-red-v10',
  act3Mana: 'potion-blue-v10'
});

function gateVisualFor(gateId) {
  if (VAULT_GATE_IDS.has(gateId)) return { asset: 'seal-guardian-vault', scale: 1.02 };
  if (gateId === 'vine') return { asset: 'seal-vine', scale: 1.04 };
  if (SINGLE_SWITCH_GATE_IDS.has(gateId)) return { asset: 'seal-switch-single', scale: 1.0 };
  if (DUAL_SWITCH_GATE_IDS.has(gateId)) return { asset: 'seal-switch-dual', scale: 1.0 };
  if (SEQUENCE_GATE_IDS.has(gateId)) return { asset: 'seal-rune-sequence', scale: 1.0 };
  return { asset: 'seal-archive-index', scale: 1.0 };
}

const WALL_BITS = Object.freeze({
  north: 1,
  east: 2,
  south: 4,
  west: 8
});

function countBits(mask) {
  let n = mask & 15;
  let count = 0;
  while (n) { count += n & 1; n >>= 1; }
  return count;
}

function colorWithAlpha(value, alpha = 1) {
  if (typeof value === 'number') {
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  if (typeof value === 'string') {
    const hex = value.trim().match(/^#([0-9a-f]{6})$/i);
    if (hex) {
      const n = Number.parseInt(hex[1], 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
    }
    const shortHex = value.trim().match(/^#([0-9a-f]{3})$/i);
    if (shortHex) {
      const [r, g, b] = shortHex[1].split('').map((digit) => Number.parseInt(`${digit}${digit}`, 16));
      return `rgba(${r},${g},${b},${alpha})`;
    }
    return value;
  }

  return `rgba(150,125,220,${alpha})`;
}

function wallExposures(mask) {
  return {
    north: (mask & WALL_BITS.north) === 0,
    east: (mask & WALL_BITS.east) === 0,
    south: (mask & WALL_BITS.south) === 0,
    west: (mask & WALL_BITS.west) === 0
  };
}

function drawStructuralEdge(scene, side, px, py, floor) {
  const ctx = scene.ctx;
  const rim = 7;
  const outer = colorWithAlpha(floor.theme.wall, 0.68);
  const glow = colorWithAlpha(floor.theme.glow, 0.82);
  const inner = 'rgba(7,5,22,.46)';

  ctx.save();

  // A broad shadow is thrown into the walkable side. This creates physical
  // separation between floor and wall before any decorative art is applied.
  ctx.strokeStyle = 'rgba(2,1,12,.58)';
  ctx.lineWidth = 8;
  ctx.lineCap = 'square';
  ctx.shadowColor = 'rgba(0,0,0,.58)';
  ctx.shadowBlur = 7;
  ctx.shadowOffsetX = side === 'west' ? -3 : side === 'east' ? 3 : 0;
  ctx.shadowOffsetY = side === 'north' ? -3 : side === 'south' ? 3 : 0;
  ctx.beginPath();
  if (side === 'north') { ctx.moveTo(px, py + 0.5); ctx.lineTo(px + TILE_SIZE, py + 0.5); }
  if (side === 'east') { ctx.moveTo(px + TILE_SIZE - 0.5, py); ctx.lineTo(px + TILE_SIZE - 0.5, py + TILE_SIZE); }
  if (side === 'south') { ctx.moveTo(px, py + TILE_SIZE - 0.5); ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE - 0.5); }
  if (side === 'west') { ctx.moveTo(px + 0.5, py); ctx.lineTo(px + 0.5, py + TILE_SIZE); }
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // The bevel band is inside the blocked cell, so adjacent wall cells remain
  // seamless while the corridor-facing contour reads as a thick raised wall.
  ctx.fillStyle = outer;
  if (side === 'north') ctx.fillRect(px, py, TILE_SIZE, rim);
  if (side === 'east') ctx.fillRect(px + TILE_SIZE - rim, py, rim, TILE_SIZE);
  if (side === 'south') ctx.fillRect(px, py + TILE_SIZE - rim, TILE_SIZE, rim);
  if (side === 'west') ctx.fillRect(px, py, rim, TILE_SIZE);

  ctx.fillStyle = inner;
  if (side === 'north') ctx.fillRect(px, py + rim - 2, TILE_SIZE, 2);
  if (side === 'east') ctx.fillRect(px + TILE_SIZE - rim, py, 2, TILE_SIZE);
  if (side === 'south') ctx.fillRect(px, py + TILE_SIZE - rim, TILE_SIZE, 2);
  if (side === 'west') ctx.fillRect(px + rim - 2, py, 2, TILE_SIZE);

  ctx.strokeStyle = glow;
  ctx.lineWidth = 1.4;
  ctx.shadowColor = colorWithAlpha(floor.theme.glow, 0.42);
  ctx.shadowBlur = 5;
  ctx.beginPath();
  if (side === 'north') { ctx.moveTo(px + 1, py + 1); ctx.lineTo(px + TILE_SIZE - 1, py + 1); }
  if (side === 'east') { ctx.moveTo(px + TILE_SIZE - 1, py + 1); ctx.lineTo(px + TILE_SIZE - 1, py + TILE_SIZE - 1); }
  if (side === 'south') { ctx.moveTo(px + 1, py + TILE_SIZE - 1); ctx.lineTo(px + TILE_SIZE - 1, py + TILE_SIZE - 1); }
  if (side === 'west') { ctx.moveTo(px + 1, py + 1); ctx.lineTo(px + 1, py + TILE_SIZE - 1); }
  ctx.stroke();
  ctx.restore();
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

function drawFeaturedProp(scene, assetName, x, y, scale, shadowWidth = 0.5, alpha = 1, filter = 'none') {
  const image = getMapAsset(assetName);
  if (!image) return false;
  const cx = scene.center(x);
  const cy = scene.center(y);
  scene.ctx.save();
  scene.ctx.filter = filter;
  scene.drawSoftShadow(cx, cy + TILE_SIZE * 0.29, TILE_SIZE * shadowWidth, 0.2);
  scene.drawMapImage(image, cx, cy, TILE_SIZE * scale, TILE_SIZE * scale, 0, alpha);
  scene.ctx.restore();
  return true;
}

function wallAssetForMask(mask) {
  const count = countBits(mask);

  // Long runs and fully surrounded wall cells are structure, not decoration.
  // Their visible wall shape is provided by the continuous masonry + bevel pass.
  if (mask === 10 || mask === 5 || count === 4) return null;

  if (count === 1 || count === 3 || count === 0) {
    return { asset: 'wall-pillar-v4', rotation: 0, scale: 0.76, alpha: 0.56 };
  }

  if (count === 2) {
    const rotations = { 3: Math.PI, 6: -Math.PI / 2, 12: 0, 9: Math.PI / 2 };
    return { asset: 'wall-outer-corner-v4', rotation: rotations[mask] ?? 0, scale: 0.82, alpha: 0.58 };
  }

  return null;
}

export function createCanvasTowerScene(bridge, parent = document.getElementById('game-container')) {
  const scene = createBaseCanvasTowerScene(bridge, parent);
  const cleanedItemCells = new Map();
  const cleanedChibiCells = new Map();
  const cleanedTileCells = new Map();

  scene.canvas.dataset.artPipeline = 'moonlit-v4';
  scene.canvas.dataset.assetRevision = '2026-08-22-v4';
  scene.canvas.dataset.wallPipeline = 'continuous-structure-v5';

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

  // Structural wall pass: every blocked cell contributes to one seamless dark
  // masonry mass. No per-tile frame or decorative image is needed to make it
  // read as a wall.
  scene.drawWallBase = (x, y, floor) => {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    const ctx = scene.ctx;
    ctx.fillStyle = '#211b3c';
    ctx.fillRect(px - 0.5, py - 0.5, TILE_SIZE + 1, TILE_SIZE + 1);
    ctx.fillStyle = colorWithAlpha(floor.theme.wall, 0.18);
    ctx.fillRect(px - 0.5, py - 0.5, TILE_SIZE + 1, TILE_SIZE + 1);
  };

  // Only corridor-facing edges receive wall thickness, highlight and shadow.
  // Adjacent wall cells never draw a seam between themselves.
  scene.drawWallBoundary = (state, x, y, floor) => {
    const mask = scene.wallMask(state, x, y);
    const exposed = wallExposures(mask);
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    if (exposed.north) drawStructuralEdge(scene, 'north', px, py, floor);
    if (exposed.east) drawStructuralEdge(scene, 'east', px, py, floor);
    if (exposed.south) drawStructuralEdge(scene, 'south', px, py, floor);
    if (exposed.west) drawStructuralEdge(scene, 'west', px, py, floor);
  };

  const legacyWallOrnament = scene.drawWallOrnament.bind(scene);
  scene.drawWallOrnament = (state, x, y) => {
    const mask = scene.wallMask(state, x, y);
    const visual = wallAssetForMask(mask);
    if (!visual) return;

    const image = getMapAsset(visual.asset);
    if (!image) return legacyWallOrnament(state, x, y);

    scene.drawMapImage(
      image,
      scene.center(x),
      scene.center(y),
      TILE_SIZE * visual.scale,
      TILE_SIZE * visual.scale,
      visual.rotation,
      visual.alpha
    );
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
      const asset = INTERACTABLE_ITEM_ASSET[parsed.id];
      if (asset && drawFeaturedProp(scene, asset, x, y, 0.78, 0.44)) return;
      const acceptedAsset = ACCEPTED_RESOURCE_ASSET[parsed.id];
      if (acceptedAsset && drawFeaturedProp(scene, acceptedAsset, x, y, 0.72, 0.4)) return;
      if (parsed.id === 'codex' && drawFeaturedProp(scene, 'featured-codex-shrine', x, y, 0.9, 0.48)) return;
      if (parsed.id === 'holy' && drawFeaturedProp(scene, 'featured-treasure', x, y, 0.88, 0.52)) return;
    }
    if (parsed.type === 'switch' && drawFeaturedProp(scene, 'switch-vine', x, y, 0.8, 0.44)) return;
    if (parsed.type === 'gate') {
      const visual = gateVisualFor(parsed.id);
      if (drawFeaturedProp(scene, visual.asset, x, y, visual.scale, 0.52)) return;
    }
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

  applyWallMaterialV6(scene);
  return scene;
}
