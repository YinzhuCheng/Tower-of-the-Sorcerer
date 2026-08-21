import { ENEMIES, FLOORS, GRID_SIZE, ITEMS, TILE_SIZE } from './data.js';
import { DIRECTIONS, getTile, parseToken, tryMove } from './engine.js';
import { getAnimeAsset } from './anime-assets.js';
import { portraitIndex } from './anime-portraits.js';

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

function cssColor(value, alpha = 1) {
  if (typeof value === 'string') return value;
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundedRect(ctx, x, y, w, h, radius = 8) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
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
    this.canvas = document.createElement('canvas');
    this.canvas.width = SIZE;
    this.canvas.height = SIZE;
    this.canvas.tabIndex = 0;
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', '二次元少女魔塔地图。可使用方向键、WASD 或点击相邻格移动。');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.parent.replaceChildren(this.canvas);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handlePointer = this.handlePointer.bind(this);
    window.addEventListener('keydown', this.handleKeydown);
    this.canvas.addEventListener('pointerdown', this.handlePointer);
    this.start();
  }

  async start() {
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
    const result = tryMove(this.bridge.getState(), vector.dx, vector.dy);
    if (!result.blocked) {
      this.renderFloor();
      if (result.battle) this.flashBattle();
    }
    this.bridge.onResult(result);
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

  drawSprite(id, cx, cy, size, alpha = 1) {
    const image = this.images.get(this.chibiSheet);
    if (!image) return;
    const index = portraitIndex(id);
    const col = index % 4;
    const row = Math.floor(index / 4);
    const sw = image.naturalWidth / 4;
    const sh = image.naturalHeight / 3;
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.drawImage(image, col * sw, row * sh, sw, sh, cx - size / 2, cy - size / 2, size, size);
    this.ctx.restore();
  }

  drawBaseTile(x, y, floor, token) {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    const isWall = token === '#';
    this.ctx.fillStyle = cssColor(isWall ? floor.theme.wall : floor.theme.floor);
    this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    this.drawSheet(this.tileSheet, 5, 5, isWall ? TILE_INDEX.wall : TILE_INDEX.floor, px, py, TILE_SIZE, TILE_SIZE, {
      cropBottom: 0.26,
      alpha: isWall ? 0.76 : 0.58
    });
    this.ctx.strokeStyle = cssColor(floor.theme.glow, isWall ? 0.2 : 0.27);
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
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

  renderEnemy(x, y, enemyId) {
    const enemy = ENEMIES[enemyId];
    if (!enemy) return;
    const cx = this.center(x);
    const cy = this.center(y);
    const glow = enemy.finalBoss ? '#ffe08a' : enemy.boss ? '#ff9bd4' : '#9c8cff';
    this.ctx.save();
    this.ctx.shadowColor = glow;
    this.ctx.shadowBlur = enemy.boss ? 14 : 7;
    roundedRect(this.ctx, cx - 25, cy - 25, 50, 50, 10);
    this.ctx.fillStyle = 'rgba(9,7,25,.52)';
    this.ctx.fill();
    this.ctx.strokeStyle = glow;
    this.ctx.lineWidth = enemy.boss ? 2.4 : 1.3;
    this.ctx.stroke();
    this.ctx.restore();
    this.drawSprite(enemy.portrait, cx, cy + 1, enemy.boss ? 54 : 50);
    if (enemy.boss) {
      this.ctx.beginPath();
      this.ctx.arc(cx + 19, cy - 19, 7, 0, Math.PI * 2);
      this.ctx.fillStyle = glow;
      this.ctx.fill();
      this.ctx.fillStyle = '#25142e';
      this.ctx.font = '700 9px system-ui';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('★', cx + 19, cy - 19);
    }
  }

  renderHero(state, floor) {
    const cx = this.center(state.x);
    const cy = this.center(state.y);
    this.ctx.save();
    this.ctx.shadowColor = cssColor(floor.theme.glow);
    this.ctx.shadowBlur = 18;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 23, 0, Math.PI * 2);
    this.ctx.fillStyle = cssColor(floor.theme.glow, 0.2);
    this.ctx.fill();
    this.ctx.restore();
    this.drawSprite('hero', cx, cy, 54);
  }

  renderToken(x, y, token, floor) {
    if (token === '#' || token === '.' || token === 'S') return;
    if (token === 'U') {
      this.drawTileIcon(TILE_INDEX.up, x, y, 0.92);
      return;
    }
    if (token === 'D') {
      this.drawTileIcon(TILE_INDEX.down, x, y, 0.92);
      return;
    }
    if (token === 'shop') {
      this.drawTileIcon(TILE_INDEX.shop, x, y, 0.96);
      return;
    }

    const parsed = parseToken(token);
    if (parsed.type === 'enemy') {
      this.renderEnemy(x, y, parsed.id);
      return;
    }
    if (parsed.type === 'door') {
      const index = { sun: TILE_INDEX.sunDoor, moon: TILE_INDEX.moonDoor, star: TILE_INDEX.starDoor }[parsed.id];
      this.drawTileIcon(index ?? TILE_INDEX.panel, x, y, 0.96);
      return;
    }
    if (parsed.type === 'switch') {
      this.drawTileIcon(TILE_INDEX.singleSwitch, x, y, 0.84);
      return;
    }
    if (parsed.type === 'gate') {
      this.drawTileIcon(parsed.id === 'tri' ? TILE_INDEX.sequenceSwitch : TILE_INDEX.panel, x, y, 0.92);
      return;
    }
    if (parsed.type === 'rune') {
      this.drawTileIcon(TILE_INDEX.rune, x, y, 0.86);
      return;
    }
    if (parsed.type === 'item') {
      const item = ITEMS[parsed.id];
      if (item?.kind === 'card') {
        this.drawItem(ITEM_INDEX[item.card], x, y, 0.78);
        return;
      }
      const index = ITEM_INDEX[parsed.id];
      if (index !== undefined) {
        this.drawItem(index, x, y, parsed.id === 'hpLarge' ? 0.86 : 0.76);
        return;
      }
      this.drawTileIcon(TILE_INDEX.treasure, x, y, 0.78);
    }
  }

  renderFloor() {
    const state = this.bridge.getState();
    const floor = FLOORS[state.floor];
    this.ctx.save();
    const gradient = this.ctx.createRadialGradient(SIZE * 0.5, SIZE * 0.46, 30, SIZE * 0.5, SIZE * 0.5, SIZE * 0.75);
    gradient.addColorStop(0, cssColor(floor.theme.floorAlt ?? floor.theme.floor));
    gradient.addColorStop(1, cssColor(floor.theme.fog));
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, SIZE, SIZE);

    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) this.drawBaseTile(x, y, floor, getTile(state, x, y));
    }
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) this.renderToken(x, y, getTile(state, x, y), floor);
    }
    this.renderHero(state, floor);
    this.ctx.restore();
  }
}
