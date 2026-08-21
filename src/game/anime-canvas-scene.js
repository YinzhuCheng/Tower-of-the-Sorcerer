import { ENEMIES, FLOORS, GRID_SIZE, ITEMS, TILE_SIZE } from './data.js';
import { DIRECTIONS, getTile, parseToken, tryMove } from './engine.js';
import { getAnimeAsset, preloadAnimeAssets } from './anime-assets.js';
import { portraitIndex } from './anime-portraits.js';
import { getEnemyAsset, getEnemyAssetMeta, preloadEnemyAssets } from './enemy-assets.js';
import { getMapAsset, preloadMapAssets } from './map-assets.js';
import { WALL_BITS, selectWallVisual } from './autotile.js';

const SIZE = GRID_SIZE * TILE_SIZE;

const ITEM_INDEX = {
  sun: 0, moon: 1, star: 2,
  hp: 6, hpLarge: 7,
  atk: 8, def: 9, dual: 8,
  lucky: 10, treasure: 11,
  weapon: 12, shield: 13, codex: 14, compass: 15,
  ward: 16, holy: 21
};

const TILE_INDEX = {
  floor: 0, wall: 1, void: 2,
  sunDoor: 3, moonDoor: 4, starDoor: 5,
  openGate: 6, portal: 7, up: 8, down: 9,
  shop: 10, treasure: 11, boss: 12, enemy: 13, event: 14,
  singleSwitch: 15, dualSwitch: 16, sequenceSwitch: 17,
  rune: 18, panel: 19
};

const HERO_ASSET = Object.freeze({
  down: 'hero-down',
  up: 'hero-up',
  left: 'hero-left',
  right: 'hero-right'
});

function cssColor(value, alpha = 1) {
  if (typeof value === 'string') return value;
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function imagePromise(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export function createCanvasTowerScene(bridge, parent = document.getElementById('game-container')) {
  return new AnimeCanvasTowerScene(bridge, parent);
}

class AnimeCanvasTowerScene {
  constructor(bridge, parent) {
    this.bridge = bridge;
    this.parent = parent;
    this.images = new Map();
    this.direction = 'down';
    this.canvas = document.createElement('canvas');
    this.canvas.width = SIZE;
    this.canvas.height = SIZE;
    this.canvas.tabIndex = 0;
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', '二次元少女魔塔地图。可使用方向键、WASD 或点击相邻格移动。');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.parent.replaceChildren(this.canvas);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handlePointer = this.handlePointer.bind(this);
    window.addEventListener('keydown', this.handleKeydown);
    this.canvas.addEventListener('pointerdown', this.handlePointer);
    this.start();
  }

  async start() {
    await Promise.all([
      preloadAnimeAssets(),
      preloadEnemyAssets(),
      preloadMapAssets()
    ]);

    this.itemSheet = getAnimeAsset('items');
    this.tileSheet = getAnimeAsset('tiles');
    this.chibiSheet = getAnimeAsset('chibi');
    const urls = new Set([this.itemSheet, this.tileSheet, this.chibiSheet]);
    await Promise.all([...urls].map(async (url) => {
      const image = await imagePromise(url);
      if (image) this.images.set(url, image);
    }));

    this.renderFloor();
    this.bridge.onReady(this);
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeydown);
    this.canvas.removeEventListener('pointerdown', this.handlePointer);
    this.canvas.remove();
  }

  center(value) {
    return value * TILE_SIZE + TILE_SIZE / 2;
  }

  handleKeydown(event) {
    if (event.repeat) return;
    const direction = {
      arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down',
      arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right'
    }[event.key.toLowerCase()];
    if (!direction) return;
    event.preventDefault();
    this.move(direction);
  }

  handlePointer(event) {
    if (!this.bridge.canMove()) return;
    const rect = this.canvas.getBoundingClientRect();
    const px = (event.clientX - rect.left) * (this.canvas.width / rect.width);
    const py = (event.clientY - rect.top) * (this.canvas.height / rect.height);
    const state = this.bridge.getState();
    const x = Math.floor(px / TILE_SIZE);
    const y = Math.floor(py / TILE_SIZE);
    const dx = x - state.x;
    const dy = y - state.y;
    if (Math.abs(dx) + Math.abs(dy) !== 1) return;
    const direction = Object.entries(DIRECTIONS).find(([, v]) => v.dx === dx && v.dy === dy)?.[0];
    if (direction) this.move(direction);
  }

  move(direction) {
    if (!this.bridge.canMove()) return;
    const vector = DIRECTIONS[direction];
    if (!vector) return;

    // Facing changes even when movement is blocked, matching classic tile RPGs.
    this.direction = direction;
    const result = tryMove(this.bridge.getState(), vector.dx, vector.dy);
    this.renderFloor();
    if (!result.blocked && result.battle) this.flashBattle();
    this.bridge.onResult(result);
    return result;
  }

  refresh() {
    this.renderFloor();
  }

  flashBattle() {
    this.canvas.classList.remove('battle-flash');
    void this.canvas.offsetWidth;
    this.canvas.classList.add('battle-flash');
    setTimeout(() => this.canvas.classList.remove('battle-flash'), 180);
  }

  drawSheet(src, cols, rows, index, x, y, w, h, options = {}) {
    const image = this.images.get(src);
    if (!image) return false;
    const col = index % cols;
    const row = Math.floor(index / cols);
    const cellW = image.naturalWidth / cols;
    const cellH = image.naturalHeight / rows;
    const cropTop = options.cropTop ?? 0;
    const cropBottom = options.cropBottom ?? 0;
    const sx = col * cellW;
    const sy = row * cellH + cellH * cropTop;
    const sh = cellH * (1 - cropTop - cropBottom);
    this.ctx.save();
    this.ctx.globalAlpha = options.alpha ?? 1;
    this.ctx.drawImage(image, sx, sy, cellW, sh, x, y, w, h);
    this.ctx.restore();
    return true;
  }

  drawLegacySprite(id, cx, cy, size, alpha = 1) {
    const image = this.images.get(this.chibiSheet);
    if (!image) return false;
    const index = portraitIndex(id);
    const col = index % 4;
    const row = Math.floor(index / 4);
    const sw = image.naturalWidth / 4;
    const sh = image.naturalHeight / 3;
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.drawImage(image, col * sw, row * sh, sw, sh, cx - size / 2, cy - size / 2, size, size);
    this.ctx.restore();
    return true;
  }

  drawMapImage(image, cx, cy, width, height = width, rotation = 0, alpha = 1) {
    if (!image) return false;
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.translate(cx, cy);
    this.ctx.rotate(rotation);
    this.ctx.drawImage(image, -width / 2, -height / 2, width, height);
    this.ctx.restore();
    return true;
  }

  drawMapAsset(name, x, y, scale = 1, rotation = 0, alpha = 1, offsetY = 0) {
    const image = getMapAsset(name);
    if (!image) return false;
    const size = TILE_SIZE * scale;
    return this.drawMapImage(image, this.center(x), this.center(y) + offsetY * TILE_SIZE, size, size, rotation, alpha);
  }

  isWall(state, x, y) {
    if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return false;
    return getTile(state, x, y) === '#';
  }

  wallMask(state, x, y) {
    let mask = 0;
    if (this.isWall(state, x, y - 1)) mask |= WALL_BITS.north;
    if (this.isWall(state, x + 1, y)) mask |= WALL_BITS.east;
    if (this.isWall(state, x, y + 1)) mask |= WALL_BITS.south;
    if (this.isWall(state, x - 1, y)) mask |= WALL_BITS.west;
    return mask;
  }

  drawFloorLayer(floor) {
    const base = this.ctx.createRadialGradient(SIZE * 0.5, SIZE * 0.44, 20, SIZE * 0.5, SIZE * 0.5, SIZE * 0.78);
    base.addColorStop(0, cssColor(floor.theme.floorAlt ?? floor.theme.floor));
    base.addColorStop(1, cssColor(floor.theme.fog));
    this.ctx.fillStyle = base;
    this.ctx.fillRect(0, 0, SIZE, SIZE);

    const texture = getMapAsset(floor.number % 2 === 0 ? 'floor-alt' : 'floor-main') ?? getMapAsset('floor-main');
    if (texture) {
      const pattern = this.ctx.createPattern(texture, 'repeat');
      if (pattern) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.72;
        this.ctx.fillStyle = pattern;
        this.ctx.fillRect(0, 0, SIZE, SIZE);
        this.ctx.restore();
      }
    }

    // One continuous vignette instead of one outline per logical tile.
    const vignette = this.ctx.createRadialGradient(SIZE / 2, SIZE / 2, SIZE * 0.22, SIZE / 2, SIZE / 2, SIZE * 0.72);
    vignette.addColorStop(0, 'rgba(8,7,28,0)');
    vignette.addColorStop(1, 'rgba(3,2,16,.34)');
    this.ctx.fillStyle = vignette;
    this.ctx.fillRect(0, 0, SIZE, SIZE);
  }

  drawWallBase(x, y, floor) {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    this.ctx.fillStyle = cssColor(floor.theme.wall);
    this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

    // Subtle continuous magical depth; no per-cell stroke or panel frame.
    const cx = px + TILE_SIZE / 2;
    const cy = py + TILE_SIZE / 2;
    const glow = this.ctx.createRadialGradient(cx, cy, 2, cx, cy, TILE_SIZE * 0.72);
    glow.addColorStop(0, cssColor(floor.theme.glow, 0.13));
    glow.addColorStop(1, 'rgba(5,4,24,0)');
    this.ctx.fillStyle = glow;
    this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
  }

  drawWallOrnament(state, x, y) {
    const visual = selectWallVisual(this.wallMask(state, x, y));
    if (this.drawMapAsset(visual.asset, x, y, visual.scale, visual.rotation, 0.9)) return;

    // Old wall art is only a resilience fallback when the new manifest is missing.
    this.drawSheet(this.tileSheet, 5, 5, TILE_INDEX.wall, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE, {
      cropBottom: 0.26,
      alpha: 0.42
    });
  }

  drawWallBoundary(state, x, y, floor) {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    const right = px + TILE_SIZE;
    const bottom = py + TILE_SIZE;
    this.ctx.save();
    this.ctx.strokeStyle = cssColor(floor.theme.glow, 0.54);
    this.ctx.lineWidth = 1.35;
    this.ctx.lineCap = 'round';
    this.ctx.shadowColor = cssColor(floor.theme.glow, 0.45);
    this.ctx.shadowBlur = 5;
    this.ctx.beginPath();
    if (!this.isWall(state, x, y - 1)) { this.ctx.moveTo(px + 1, py + 0.7); this.ctx.lineTo(right - 1, py + 0.7); }
    if (!this.isWall(state, x + 1, y)) { this.ctx.moveTo(right - 0.7, py + 1); this.ctx.lineTo(right - 0.7, bottom - 1); }
    if (!this.isWall(state, x, y + 1)) { this.ctx.moveTo(px + 1, bottom - 0.7); this.ctx.lineTo(right - 1, bottom - 0.7); }
    if (!this.isWall(state, x - 1, y)) { this.ctx.moveTo(px + 0.7, py + 1); this.ctx.lineTo(px + 0.7, bottom - 1); }
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawTileIcon(index, x, y, scale = 0.9, alpha = 1) {
    const size = TILE_SIZE * scale;
    const cx = this.center(x);
    const cy = this.center(y);
    this.drawSheet(this.tileSheet, 5, 5, index, cx - size / 2, cy - size / 2, size, size, {
      cropBottom: 0.27,
      alpha
    });
  }

  drawItem(index, x, y, scale = 0.8) {
    const size = TILE_SIZE * scale;
    const cx = this.center(x);
    const cy = this.center(y);
    this.drawSheet(this.itemSheet, 6, 4, index, cx - size / 2, cy - size / 2, size, size);
  }

  drawSoftShadow(cx, cy, width, alpha = 0.22) {
    this.ctx.save();
    this.ctx.filter = 'blur(2px)';
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, width / 2, width * 0.13, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(3,2,16,${alpha})`;
    this.ctx.fill();
    this.ctx.restore();
  }

  renderEnemy(x, y, enemyId) {
    const enemy = ENEMIES[enemyId];
    if (!enemy) return;
    const cx = this.center(x);
    const cy = this.center(y);
    const image = getEnemyAsset(enemy.portrait);
    const meta = getEnemyAssetMeta(enemy.portrait) ?? {};
    const baseSize = enemy.boss ? TILE_SIZE * 0.98 : TILE_SIZE * 0.88;
    const scale = Number.isFinite(meta.scale) ? meta.scale : 1;
    const size = baseSize * scale;
    const offsetX = Number.isFinite(meta.offsetX) ? meta.offsetX * baseSize : 0;
    const offsetY = Number.isFinite(meta.offsetY) ? meta.offsetY * baseSize : 0;

    this.drawSoftShadow(cx, cy + TILE_SIZE * 0.27, TILE_SIZE * 0.48, 0.24);

    if (enemy.boss) {
      const aura = enemy.finalBoss ? '#ffe08a' : '#ff9bd4';
      this.ctx.save();
      this.ctx.strokeStyle = aura;
      this.ctx.globalAlpha = 0.52;
      this.ctx.lineWidth = 1.6;
      this.ctx.shadowColor = aura;
      this.ctx.shadowBlur = 12;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy + 1, TILE_SIZE * 0.39, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    if (image) {
      this.drawMapImage(image, cx + offsetX, cy + offsetY, size, size);
    } else {
      this.drawLegacySprite(enemy.portrait, cx, cy + 1, enemy.boss ? 54 : 50);
    }

    if (enemy.boss) {
      this.ctx.beginPath();
      this.ctx.arc(cx + TILE_SIZE * 0.32, cy - TILE_SIZE * 0.32, 6.5, 0, Math.PI * 2);
      this.ctx.fillStyle = enemy.finalBoss ? '#ffe08a' : '#ff9bd4';
      this.ctx.fill();
      this.ctx.fillStyle = '#25142e';
      this.ctx.font = '700 8px system-ui';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('★', cx + TILE_SIZE * 0.32, cy - TILE_SIZE * 0.32);
    }
  }

  renderHero(state) {
    const cx = this.center(state.x);
    const cy = this.center(state.y);
    const image = getMapAsset(HERO_ASSET[this.direction]) ?? getMapAsset('hero-down');
    this.drawSoftShadow(cx, cy + TILE_SIZE * 0.3, TILE_SIZE * 0.5, 0.28);

    if (image) {
      const size = TILE_SIZE * 1.13;
      // Anchor on the feet: shift the sprite down slightly while keeping the
      // visual body centered over its logical tile.
      this.drawMapImage(image, cx, cy + TILE_SIZE * 0.035, size, size);
      return;
    }

    // Last-resort fallback if the real binary WebP assets fail to load.
    this.drawLegacySprite('hero', cx, cy, TILE_SIZE * 0.94);
  }

  renderToken(x, y, token) {
    if (token === '#' || token === '.' || token === 'S') return;
    if (token === 'U') {
      if (!this.drawMapAsset('stairs-up', x, y, 0.98)) this.drawTileIcon(TILE_INDEX.up, x, y, 0.92);
      return;
    }
    if (token === 'D') {
      if (!this.drawMapAsset('stairs-down', x, y, 0.98)) this.drawTileIcon(TILE_INDEX.down, x, y, 0.92);
      return;
    }
    if (token === 'shop') {
      this.drawTileIcon(TILE_INDEX.shop, x, y, 0.9);
      return;
    }

    const parsed = parseToken(token);
    if (parsed.type === 'enemy') {
      this.renderEnemy(x, y, parsed.id);
      return;
    }
    if (parsed.type === 'door') {
      if (!this.drawMapAsset(`gate-${parsed.id}`, x, y, 0.96)) {
        const index = { sun: TILE_INDEX.sunDoor, moon: TILE_INDEX.moonDoor, star: TILE_INDEX.starDoor }[parsed.id];
        this.drawTileIcon(index ?? TILE_INDEX.panel, x, y, 0.96);
      }
      return;
    }
    if (parsed.type === 'switch') {
      this.drawTileIcon(TILE_INDEX.singleSwitch, x, y, 0.76);
      return;
    }
    if (parsed.type === 'gate') {
      if (!this.drawMapAsset('portal-transfer', x, y, 0.9)) {
        this.drawTileIcon(parsed.id === 'tri' ? TILE_INDEX.sequenceSwitch : TILE_INDEX.panel, x, y, 0.86);
      }
      return;
    }
    if (parsed.type === 'rune') {
      this.drawTileIcon(TILE_INDEX.rune, x, y, 0.78);
      return;
    }
    if (parsed.type === 'item') {
      const item = ITEMS[parsed.id];
      if (item?.kind === 'card') {
        this.drawItem(ITEM_INDEX[item.card], x, y, 0.68);
        return;
      }
      const index = ITEM_INDEX[parsed.id];
      if (index !== undefined) {
        this.drawItem(index, x, y, parsed.id === 'hpLarge' ? 0.76 : 0.66);
        return;
      }
      this.drawTileIcon(TILE_INDEX.treasure, x, y, 0.7);
    }
  }

  renderFloor() {
    const state = this.bridge.getState();
    const floor = FLOORS[state.floor];
    if (!floor) return;

    this.ctx.save();
    this.drawFloorLayer(floor);

    // Pass 1: one continuous dark magical mass for all walls. No internal grid.
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        if (this.isWall(state, x, y)) this.drawWallBase(x, y, floor);
      }
    }

    // Pass 2: adjacency-driven ornaments and only the exposed maze boundary.
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        if (!this.isWall(state, x, y)) continue;
        this.drawWallOrnament(state, x, y);
        this.drawWallBoundary(state, x, y, floor);
      }
    }

    // Pass 3: map objects. Their transparent PNG/WebP silhouettes sit directly
    // on the continuous floor instead of inside a square panel.
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) this.renderToken(x, y, getTile(state, x, y));
    }

    // Hero is deliberately last: it can never be hidden under an event, wall
    // decoration, enemy aura, or the old Canvas fallback sprite.
    this.renderHero(state);
    this.ctx.restore();
  }
}
