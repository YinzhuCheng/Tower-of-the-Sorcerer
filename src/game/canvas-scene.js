import { ENEMIES, FLOORS, GRID_SIZE, ITEMS, TILE_SIZE } from './data.js';
import { DIRECTIONS, getTile, parseToken, tryMove } from './engine.js';
import { portraitUrl } from './portraits.js';

const SIZE = GRID_SIZE * TILE_SIZE;
const CARD_COLORS = {
  sun: '#f4c95d',
  moon: '#67bdf5',
  star: '#f06a9f'
};

function cssColor(value, alpha = 1) {
  if (typeof value === 'string') return value;
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function roundRectPath(ctx, x, y, width, height, radius = 7) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function polygonPath(ctx, cx, cy, points) {
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(cx + x, cy + y);
    else ctx.lineTo(cx + x, cy + y);
  });
  ctx.closePath();
}

function drawCenteredText(ctx, text, x, y, options = {}) {
  const {
    size = 19,
    color = '#ffffff',
    weight = 700,
    family = 'Inter, system-ui, "Noto Sans SC", sans-serif'
  } = options;
  ctx.save();
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawCircle(ctx, x, y, radius, fill, stroke = null, lineWidth = 1) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

/**
 * Dependency-free rendering fallback. The deterministic game engine remains the
 * same; only visual rendering changes when Phaser cannot be downloaded.
 */
export function createCanvasTowerScene(bridge, parent = document.getElementById('game-container')) {
  return new CanvasTowerScene(bridge, parent);
}

class CanvasTowerScene {
  constructor(bridge, parent) {
    this.bridge = bridge;
    this.parent = parent;
    this.images = new Map();
    this.canvas = document.createElement('canvas');
    this.canvas.width = SIZE;
    this.canvas.height = SIZE;
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', '失落魔法阵游戏地图。可使用方向键、WASD 或点击相邻格移动。');
    this.canvas.tabIndex = 0;
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.parent.replaceChildren(this.canvas);

    this.handleKeydown = this.handleKeydown.bind(this);
    this.handlePointer = this.handlePointer.bind(this);
    window.addEventListener('keydown', this.handleKeydown);
    this.canvas.addEventListener('pointerdown', this.handlePointer);

    this.start();
  }

  async start() {
    await this.loadPortraits();
    this.renderFloor();
    this.bridge.onReady(this);
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeydown);
    this.canvas.removeEventListener('pointerdown', this.handlePointer);
    this.canvas.remove();
  }

  async loadPortraits() {
    const portraits = new Set(['hero', 'merchant', 'guide']);
    Object.values(ENEMIES).forEach((enemy) => portraits.add(enemy.portrait));
    await Promise.allSettled([...portraits].map((portrait) => new Promise((resolve) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        this.images.set(portrait, image);
        resolve();
      };
      image.onerror = resolve;
      image.src = portraitUrl(portrait);
    })));
  }

  handleKeydown(event) {
    if (event.repeat) return;
    const direction = {
      arrowup: 'up', w: 'up',
      arrowdown: 'down', s: 'down',
      arrowleft: 'left', a: 'left',
      arrowright: 'right', d: 'right'
    }[event.key.toLowerCase()];
    if (!direction) return;
    event.preventDefault();
    this.move(direction);
  }

  handlePointer(event) {
    if (!this.bridge.canMove()) return;
    const rect = this.canvas.getBoundingClientRect();
    const pointerX = (event.clientX - rect.left) * (this.canvas.width / rect.width);
    const pointerY = (event.clientY - rect.top) * (this.canvas.height / rect.height);
    const state = this.bridge.getState();
    const x = Math.floor(pointerX / TILE_SIZE);
    const y = Math.floor(pointerY / TILE_SIZE);
    const dx = x - state.x;
    const dy = y - state.y;
    if (Math.abs(dx) + Math.abs(dy) !== 1) return;
    const direction = Object.entries(DIRECTIONS)
      .find(([, vector]) => vector.dx === dx && vector.dy === dy)?.[0];
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
    window.setTimeout(() => this.canvas.classList.remove('battle-flash'), 180);
  }

  center(value) {
    return value * TILE_SIZE + TILE_SIZE / 2;
  }

  drawBaseTile(x, y, floor, token) {
    const ctx = this.ctx;
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    const cx = this.center(x);
    const cy = this.center(y);

    if (token === '#') {
      ctx.fillStyle = cssColor(floor.theme.wall);
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = 'rgba(255,255,255,.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
      ctx.fillStyle = cssColor(floor.theme.fog, 0.4);
      ctx.fillRect(px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);
      ctx.strokeStyle = cssColor(floor.theme.glow, 0.22);
      ctx.strokeRect(px + 6.5, py + 6.5, TILE_SIZE - 13, TILE_SIZE - 13);
      polygonPath(ctx, cx, cy, [[0, -10], [10, 0], [0, 10], [-10, 0]]);
      ctx.fillStyle = cssColor(floor.theme.glow, 0.11);
      ctx.fill();
      return;
    }

    ctx.fillStyle = cssColor((x + y) % 2 === 0 ? floor.theme.floor : floor.theme.floorAlt);
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = cssColor(floor.theme.glow, 0.15);
    ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
    drawCircle(ctx, cx, cy, 2, cssColor(floor.theme.glow, 0.2));
  }

  renderDoor(x, y, card) {
    const ctx = this.ctx;
    const cx = this.center(x);
    const cy = this.center(y);
    const color = CARD_COLORS[card];
    roundRectPath(ctx, cx - 24, cy - 26, 48, 53, 5);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.84;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,.58)';
    ctx.lineWidth = 3;
    ctx.stroke();
    roundRectPath(ctx, cx - 18, cy - 21, 36, 42, 4);
    ctx.fillStyle = 'rgba(20,20,36,.76)';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    drawCenteredText(ctx, { sun: '日', moon: '月', star: '星' }[card], cx, cy, { size: 20, color });
  }

  renderCard(x, y, card) {
    const ctx = this.ctx;
    const cx = this.center(x);
    const cy = this.center(y);
    roundRectPath(ctx, cx - 17, cy - 22, 34, 44, 6);
    ctx.fillStyle = CARD_COLORS[card];
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawCenteredText(ctx, { sun: '日', moon: '月', star: '星' }[card], cx, cy, { size: 17, color: '#151322' });
  }

  renderGem(x, y, kind) {
    const ctx = this.ctx;
    const cx = this.center(x);
    const cy = this.center(y);
    const color = kind === 'atk' ? '#ff6f8e' : kind === 'def' ? '#66c7ff' : '#d598ff';
    const points = kind === 'dual'
      ? [[0, -20], [18, -5], [11, 19], [-11, 19], [-18, -5]]
      : [[0, -20], [16, 0], [0, 20], [-16, 0]];
    polygonPath(ctx, cx, cy, points);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.72)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy - 8);
    ctx.lineTo(cx + 7, cy + 8);
    ctx.strokeStyle = 'rgba(255,255,255,.4)';
    ctx.stroke();
  }

  renderPotion(x, y, large = false) {
    const ctx = this.ctx;
    const cx = this.center(x);
    const cy = this.center(y);
    roundRectPath(ctx, cx - (large ? 16 : 13), cy - 13, large ? 32 : 26, large ? 36 : 31, 7);
    ctx.fillStyle = large ? '#75d5ff' : '#ff83b4';
    ctx.globalAlpha = 0.92;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,.68)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#d9e8ff';
    ctx.fillRect(cx - 7, cy - 22, 14, 10);
    drawCircle(ctx, cx - 6, cy + 2, 4, 'rgba(255,255,255,.45)');
  }

  renderRelic(x, y, itemId) {
    const ctx = this.ctx;
    const cx = this.center(x);
    const cy = this.center(y);
    const labels = { codex: '眼', compass: '盘', lucky: '金', ward: '静', holy: '圣', weapon: '刃', shield: '盾' };
    const colors = {
      codex: '#c798ff', compass: '#73ddff', lucky: '#ffd36c', ward: '#e394ff',
      holy: '#ffefad', weapon: '#ff9b7c', shield: '#83c9ff'
    };
    const color = colors[itemId] ?? '#ffffff';
    drawCircle(ctx, cx, cy, 21, `${color}38`, color, 3);
    drawCenteredText(ctx, labels[itemId] ?? '宝', cx, cy, { size: 17, color });
  }

  renderPortrait(portrait, x, y, size) {
    const image = this.images.get(portrait);
    if (image?.complete && image.naturalWidth > 0) {
      this.ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
      return;
    }
    drawCircle(this.ctx, x, y, size * 0.36, '#6e5ca7', 'rgba(255,255,255,.5)', 2);
    drawCenteredText(this.ctx, '姬', x, y, { size: Math.round(size * 0.34) });
  }

  renderEnemy(x, y, enemyId) {
    const ctx = this.ctx;
    const enemy = ENEMIES[enemyId];
    if (!enemy) return;
    const cx = this.center(x);
    const cy = this.center(y);
    const borderColor = enemy.finalBoss ? '#ffd35f' : enemy.boss ? '#ff8fc8' : '#b3a6ff';
    roundRectPath(ctx, cx - 26, cy - 26, 52, 52, 8);
    ctx.fillStyle = 'rgba(17,17,30,.94)';
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.globalAlpha = enemy.boss ? 0.96 : 0.62;
    ctx.lineWidth = enemy.boss ? 3 : 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
    this.renderPortrait(enemy.portrait, cx, cy, 48);
    if (enemy.boss) {
      drawCircle(ctx, cx + 19, cy - 19, 9, borderColor, 'rgba(255,255,255,.8)', 1);
      drawCenteredText(ctx, '★', cx + 19, cy - 19, { size: 10, color: '#201425' });
    }
  }

  renderPortal(x, y, direction, glow) {
    const ctx = this.ctx;
    const cx = this.center(x);
    const cy = this.center(y);
    ctx.beginPath();
    ctx.arc(cx, cy, 22, -Math.PI / 2, Math.PI * 1.2);
    ctx.strokeStyle = cssColor(glow, 0.92);
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 14, -Math.PI / 4, Math.PI * 1.55);
    ctx.strokeStyle = 'rgba(255,255,255,.72)';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawCenteredText(ctx, direction === 'up' ? '▲' : '▼', cx, cy, { size: 17 });
  }

  renderSwitch(x, y, glow) {
    const ctx = this.ctx;
    const cx = this.center(x);
    const cy = this.center(y);
    polygonPath(ctx, cx, cy, [[0, -21], [16, -4], [10, 19], [-10, 19], [-16, -4]]);
    ctx.fillStyle = cssColor(glow, 0.9);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.68)';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawCenteredText(ctx, '启', cx, cy + 2, { size: 14, color: '#161425' });
  }

  renderGate(x, y, id, glow) {
    const ctx = this.ctx;
    const cx = this.center(x);
    const cy = this.center(y);
    roundRectPath(ctx, cx - 25, cy - 26, 50, 52, 5);
    ctx.fillStyle = cssColor(glow, 0.17);
    ctx.fill();
    ctx.strokeStyle = cssColor(glow, 0.88);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.save();
    roundRectPath(ctx, cx - 25, cy - 26, 50, 52, 5);
    ctx.clip();
    for (let offset = -32; offset <= 32; offset += 9) {
      ctx.beginPath();
      ctx.moveTo(cx + offset, cy - 27);
      ctx.lineTo(cx - offset, cy + 27);
      ctx.strokeStyle = cssColor(glow, 0.7);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
    drawCenteredText(ctx, id === 'tri' ? '三相' : '封', cx, cy, { size: id === 'tri' ? 12 : 17 });
  }

  renderRune(x, y, id, glow) {
    const ctx = this.ctx;
    const cx = this.center(x);
    const cy = this.center(y);
    drawCircle(ctx, cx, cy, 22, cssColor(glow, 0.12), cssColor(glow, 0.92), 2);
    drawCenteredText(ctx, { A: '◔', B: '◑', C: '●' }[id] ?? id, cx, cy, { size: 22 });
  }

  renderShop(x, y) {
    const ctx = this.ctx;
    const cx = this.center(x);
    const cy = this.center(y);
    roundRectPath(ctx, cx - 26, cy - 26, 52, 52, 8);
    ctx.fillStyle = 'rgba(37,48,37,.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,211,109,.82)';
    ctx.lineWidth = 2;
    ctx.stroke();
    this.renderPortrait('merchant', cx, cy, 48);
    drawCircle(ctx, cx + 19, cy + 18, 9, '#ffd36d', 'rgba(255,255,255,.72)', 1);
    drawCenteredText(ctx, '店', cx + 19, cy + 18, { size: 9, color: '#231a12' });
  }

  renderToken(x, y, token, floor) {
    if (token === '#' || token === '.' || token === 'S' || token === 'D' || token === 'U') {
      if (token === 'U') this.renderPortal(x, y, 'up', floor.theme.glow);
      if (token === 'D') this.renderPortal(x, y, 'down', floor.theme.glow);
      return;
    }
    if (token === 'shop') {
      this.renderShop(x, y);
      return;
    }
    const parsed = parseToken(token);
    if (parsed.type === 'door') this.renderDoor(x, y, parsed.id);
    if (parsed.type === 'enemy') this.renderEnemy(x, y, parsed.id);
    if (parsed.type === 'switch') this.renderSwitch(x, y, floor.theme.glow);
    if (parsed.type === 'gate') this.renderGate(x, y, parsed.id, floor.theme.glow);
    if (parsed.type === 'rune') this.renderRune(x, y, parsed.id, floor.theme.glow);
    if (parsed.type === 'item') {
      const item = ITEMS[parsed.id];
      if (item?.kind === 'card') this.renderCard(x, y, item.card);
      else if (['atk', 'def', 'dual'].includes(parsed.id)) this.renderGem(x, y, parsed.id);
      else if (parsed.id === 'hp' || parsed.id === 'hpLarge') this.renderPotion(x, y, parsed.id === 'hpLarge');
      else this.renderRelic(x, y, parsed.id);
    }
  }

  renderHero(state, floor) {
    const ctx = this.ctx;
    const cx = this.center(state.x);
    const cy = this.center(state.y);
    drawCircle(ctx, cx, cy, 25, cssColor(floor.theme.glow, 0.17), 'rgba(255,255,255,.34)', 2);
    this.renderPortrait('hero', cx, cy, TILE_SIZE - 9);
    roundRectPath(ctx, cx - 26.5, cy - 26.5, 53, 53, 8);
    ctx.strokeStyle = 'rgba(255,255,255,.86)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  renderFloor() {
    const state = this.bridge.getState();
    const floor = FLOORS[state.floor];
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = cssColor(floor.theme.fog);
    ctx.fillRect(0, 0, SIZE, SIZE);

    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        this.drawBaseTile(x, y, floor, getTile(state, x, y));
      }
    }
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        this.renderToken(x, y, getTile(state, x, y), floor);
      }
    }
    this.renderHero(state, floor);
    ctx.restore();
  }
}
