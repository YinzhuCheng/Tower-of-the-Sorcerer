import { ENEMIES, FLOORS, GRID_SIZE, ITEMS, TILE_SIZE } from './data.js';
import { DIRECTIONS, getTile, parseToken, tryMove } from './engine.js';
import { portraitUrl } from './portraits.js';

const CARD_COLORS = {
  sun: 0xf4c95d,
  moon: 0x67bdf5,
  star: 0xf06a9f
};

function numberColor(hex) {
  return `#${hex.toString(16).padStart(6, '0')}`;
}

export function createMagicTowerScene(Phaser, bridge) {
  return class MagicTowerScene extends Phaser.Scene {
    constructor() {
      super('MagicTowerScene');
      this.rendered = [];
      this.portalObjects = [];
    }

    preload() {
      const portraits = new Set(['hero', 'merchant', 'guide']);
      Object.values(ENEMIES).forEach((enemy) => portraits.add(enemy.portrait));
      portraits.forEach((portrait) => {
        this.load.image(`portrait:${portrait}`, portraitUrl(portrait));
      });
    }

    create() {
      this.cameras.main.setRoundPixels(true);
      this.input.keyboard.on('keydown', (event) => {
        if (event.repeat) return;
        const key = event.key.toLowerCase();
        const direction = {
          arrowup: 'up', w: 'up',
          arrowdown: 'down', s: 'down',
          arrowleft: 'left', a: 'left',
          arrowright: 'right', d: 'right'
        }[key];
        if (direction) {
          event.preventDefault();
          this.move(direction);
        }
      });

      this.input.on('pointerdown', (pointer) => {
        if (!bridge.canMove()) return;
        const state = bridge.getState();
        const x = Math.floor(pointer.x / TILE_SIZE);
        const y = Math.floor(pointer.y / TILE_SIZE);
        const dx = x - state.x;
        const dy = y - state.y;
        if (Math.abs(dx) + Math.abs(dy) !== 1) return;
        const direction = Object.entries(DIRECTIONS).find(([, vector]) => vector.dx === dx && vector.dy === dy)?.[0];
        if (direction) this.move(direction);
      });

      this.renderFloor();
      bridge.onReady(this);
    }

    move(direction) {
      if (!bridge.canMove()) return;
      const vector = DIRECTIONS[direction];
      if (!vector) return;
      const state = bridge.getState();
      const result = tryMove(state, vector.dx, vector.dy);
      if (!result.blocked) {
        if (result.battle) this.cameras.main.flash(110, 255, 120, 165, false);
        this.renderFloor();
      }
      bridge.onResult(result);
    }

    refresh() {
      this.renderFloor();
    }

    addRendered(object) {
      this.rendered.push(object);
      return object;
    }

    clearRendered() {
      this.tweens.killTweensOf(this.rendered);
      this.rendered.forEach((object) => object?.destroy?.());
      this.rendered.length = 0;
      this.portalObjects.length = 0;
    }

    tileCenter(value) {
      return value * TILE_SIZE + TILE_SIZE / 2;
    }

    addText(x, y, text, style = {}) {
      return this.addRendered(this.add.text(x, y, text, {
        fontFamily: 'Inter, system-ui, "Noto Sans SC", sans-serif',
        fontSize: '19px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        ...style
      }).setOrigin(0.5));
    }

    drawBaseTile(x, y, floor, token) {
      const cx = this.tileCenter(x);
      const cy = this.tileCenter(y);
      if (token === '#') {
        const wall = this.addRendered(this.add.rectangle(cx, cy, TILE_SIZE, TILE_SIZE, floor.theme.wall));
        wall.setStrokeStyle(1, 0xffffff, 0.12);
        const inset = this.addRendered(this.add.rectangle(cx, cy, TILE_SIZE - 12, TILE_SIZE - 12, floor.theme.fog, 0.25));
        inset.setStrokeStyle(1, floor.theme.glow, 0.18);
        this.addRendered(this.add.polygon(cx, cy, [0, -10, 10, 0, 0, 10, -10, 0], floor.theme.glow, 0.09));
        return;
      }

      const color = (x + y) % 2 === 0 ? floor.theme.floor : floor.theme.floorAlt;
      const tile = this.addRendered(this.add.rectangle(cx, cy, TILE_SIZE, TILE_SIZE, color));
      tile.setStrokeStyle(1, floor.theme.glow, 0.12);
      const dot = this.addRendered(this.add.circle(cx, cy, 2, floor.theme.glow, 0.16));
      dot.setBlendMode(Phaser.BlendModes.ADD);
    }

    renderDoor(x, y, card) {
      const cx = this.tileCenter(x);
      const cy = this.tileCenter(y);
      const color = CARD_COLORS[card];
      const panel = this.addRendered(this.add.rectangle(cx, cy, TILE_SIZE - 10, TILE_SIZE - 5, color, 0.84));
      panel.setStrokeStyle(3, 0xffffff, 0.55);
      this.addRendered(this.add.rectangle(cx, cy, TILE_SIZE - 22, TILE_SIZE - 14, 0x141424, 0.72).setStrokeStyle(2, color, 0.9));
      const glyph = { sun: '日', moon: '月', star: '星' }[card];
      this.addText(cx, cy, glyph, { fontSize: '20px', color: numberColor(color) });
    }

    renderCard(x, y, card) {
      const cx = this.tileCenter(x);
      const cy = this.tileCenter(y);
      const color = CARD_COLORS[card];
      const cardRect = this.addRendered(this.add.rectangle(cx, cy, 33, 43, color, 0.95));
      cardRect.setRounded?.(6);
      cardRect.setStrokeStyle(2, 0xffffff, 0.65);
      this.addText(cx, cy, { sun: '日', moon: '月', star: '星' }[card], {
        fontSize: '17px', color: '#151322'
      });
    }

    renderGem(x, y, kind) {
      const cx = this.tileCenter(x);
      const cy = this.tileCenter(y);
      const color = kind === 'atk' ? 0xff6f8e : kind === 'def' ? 0x66c7ff : 0xd598ff;
      const points = kind === 'dual'
        ? [0, -20, 18, -5, 11, 19, -11, 19, -18, -5]
        : [0, -20, 16, 0, 0, 20, -16, 0];
      const gem = this.addRendered(this.add.polygon(cx, cy, points, color, 0.95));
      gem.setStrokeStyle(2, 0xffffff, 0.7);
      this.addRendered(this.add.line(cx, cy, -7, -8, 7, 8, 0xffffff, 0.38).setLineWidth(2));
    }

    renderPotion(x, y, large = false) {
      const cx = this.tileCenter(x);
      const cy = this.tileCenter(y);
      const bottle = this.addRendered(this.add.rectangle(cx, cy + 4, large ? 32 : 26, large ? 35 : 30, large ? 0x75d5ff : 0xff83b4, 0.9));
      bottle.setStrokeStyle(2, 0xffffff, 0.65);
      this.addRendered(this.add.rectangle(cx, cy - 17, 13, 10, 0xd9e8ff, 0.9));
      this.addRendered(this.add.circle(cx - 6, cy + 2, 4, 0xffffff, 0.45));
    }

    renderRelic(x, y, itemId) {
      const cx = this.tileCenter(x);
      const cy = this.tileCenter(y);
      const labels = {
        codex: '眼', compass: '盘', lucky: '金', ward: '静', holy: '圣', weapon: '刃', shield: '盾'
      };
      const colors = {
        codex: 0xc798ff, compass: 0x73ddff, lucky: 0xffd36c, ward: 0xe394ff,
        holy: 0xffefad, weapon: 0xff9b7c, shield: 0x83c9ff
      };
      const color = colors[itemId] ?? 0xffffff;
      const ring = this.addRendered(this.add.circle(cx, cy, 21, color, 0.25));
      ring.setStrokeStyle(3, color, 0.9);
      this.addText(cx, cy, labels[itemId] ?? '宝', { fontSize: '17px', color: numberColor(color) });
    }

    renderEnemy(x, y, enemyId) {
      const enemy = ENEMIES[enemyId];
      const cx = this.tileCenter(x);
      const cy = this.tileCenter(y);
      const borderColor = enemy.finalBoss ? 0xffd35f : enemy.boss ? 0xff8fc8 : 0xb3a6ff;
      const frame = this.addRendered(this.add.rectangle(cx, cy, TILE_SIZE - 6, TILE_SIZE - 6, 0x11111e, 0.92));
      frame.setStrokeStyle(enemy.boss ? 3 : 2, borderColor, enemy.boss ? 0.95 : 0.58);
      this.addRendered(this.add.image(cx, cy, `portrait:${enemy.portrait}`).setDisplaySize(TILE_SIZE - 10, TILE_SIZE - 10));
      if (enemy.boss) {
        const badge = this.addRendered(this.add.circle(cx + 19, cy - 19, 9, borderColor, 0.95));
        badge.setStrokeStyle(1, 0xffffff, 0.75);
        this.addText(cx + 19, cy - 19, '★', { fontSize: '10px', color: '#201425' });
      }
    }

    renderPortal(x, y, direction, glow) {
      const cx = this.tileCenter(x);
      const cy = this.tileCenter(y);
      const outer = this.addRendered(this.add.arc(cx, cy, 22, 0, 290, false, glow, 0.12));
      outer.setStrokeStyle(4, glow, 0.9);
      const inner = this.addRendered(this.add.arc(cx, cy, 14, 25, 330, false, glow, 0.08));
      inner.setStrokeStyle(2, 0xffffff, 0.7);
      this.addText(cx, cy, direction === 'up' ? '▲' : '▼', { fontSize: '17px', color: '#ffffff' });
      this.portalObjects.push(outer, inner);
      this.tweens.add({ targets: outer, angle: 360, duration: 5000, repeat: -1 });
      this.tweens.add({ targets: inner, angle: -360, duration: 4200, repeat: -1 });
    }

    renderSwitch(x, y, id, glow) {
      const cx = this.tileCenter(x);
      const cy = this.tileCenter(y);
      const crystal = this.addRendered(this.add.polygon(cx, cy, [0, -21, 16, -4, 10, 19, -10, 19, -16, -4], glow, 0.9));
      crystal.setStrokeStyle(2, 0xffffff, 0.65);
      this.addText(cx, cy + 2, '启', { fontSize: '14px', color: '#161425' });
      crystal.setData('switchId', id);
    }

    renderGate(x, y, id, glow) {
      const cx = this.tileCenter(x);
      const cy = this.tileCenter(y);
      const panel = this.addRendered(this.add.rectangle(cx, cy, TILE_SIZE - 8, TILE_SIZE - 6, glow, 0.17));
      panel.setStrokeStyle(3, glow, 0.85);
      for (let offset = -16; offset <= 16; offset += 8) {
        this.addRendered(this.add.line(cx, cy, offset, -22, -offset, 22, glow, 0.65).setLineWidth(2));
      }
      const label = id === 'tri' ? '三相' : '封';
      this.addText(cx, cy, label, { fontSize: id === 'tri' ? '12px' : '17px', color: '#ffffff' });
    }

    renderRune(x, y, id, glow) {
      const cx = this.tileCenter(x);
      const cy = this.tileCenter(y);
      const circle = this.addRendered(this.add.circle(cx, cy, 22, glow, 0.12));
      circle.setStrokeStyle(2, glow, 0.9);
      const label = { A: '◔', B: '◑', C: '●' }[id] ?? id;
      this.addText(cx, cy, label, { fontSize: '22px', color: '#ffffff' });
    }

    renderShop(x, y) {
      const cx = this.tileCenter(x);
      const cy = this.tileCenter(y);
      const frame = this.addRendered(this.add.rectangle(cx, cy, TILE_SIZE - 6, TILE_SIZE - 6, 0x253025, 0.9));
      frame.setStrokeStyle(2, 0xffd36d, 0.8);
      this.addRendered(this.add.image(cx, cy, 'portrait:merchant').setDisplaySize(TILE_SIZE - 10, TILE_SIZE - 10));
      const badge = this.addRendered(this.add.circle(cx + 19, cy + 18, 9, 0xffd36d, 0.98));
      badge.setStrokeStyle(1, 0xffffff, 0.7);
      this.addText(cx + 19, cy + 18, '店', { fontSize: '9px', color: '#231a12' });
    }

    renderCouncil(x, y, glow) {
      const cx = this.tileCenter(x);
      const cy = this.tileCenter(y);
      const ring = this.addRendered(this.add.circle(cx, cy, 23, glow, 0.16));
      ring.setStrokeStyle(3, 0xffffff, 0.88);
      this.addRendered(this.add.circle(cx, cy, 13, 0x20142f, 0.82).setStrokeStyle(2, glow, 0.9));
      this.addText(cx, cy, '盟', { fontSize: '16px', color: '#ffffff' });
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
      if (token === 'council') {
        this.renderCouncil(x, y, floor.theme.glow);
        return;
      }
      const parsed = parseToken(token);
      if (parsed.type === 'door') this.renderDoor(x, y, parsed.id);
      if (parsed.type === 'enemy') this.renderEnemy(x, y, parsed.id);
      if (parsed.type === 'switch') this.renderSwitch(x, y, parsed.id, floor.theme.glow);
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

    renderFloor() {
      this.clearRendered();
      const state = bridge.getState();
      const floor = FLOORS[state.floor];
      this.cameras.main.setBackgroundColor(floor.theme.fog);

      for (let y = 0; y < GRID_SIZE; y += 1) {
        for (let x = 0; x < GRID_SIZE; x += 1) {
          const token = getTile(state, x, y);
          this.drawBaseTile(x, y, floor, token);
        }
      }
      for (let y = 0; y < GRID_SIZE; y += 1) {
        for (let x = 0; x < GRID_SIZE; x += 1) {
          this.renderToken(x, y, getTile(state, x, y), floor);
        }
      }

      const heroX = this.tileCenter(state.x);
      const heroY = this.tileCenter(state.y);
      const aura = this.addRendered(this.add.circle(heroX, heroY, 25, floor.theme.glow, 0.16).setDepth(900));
      aura.setStrokeStyle(2, 0xffffff, 0.3);
      const hero = this.addRendered(this.add.image(heroX, heroY, 'portrait:hero').setDisplaySize(TILE_SIZE - 9, TILE_SIZE - 9).setDepth(901));
      const frame = this.addRendered(this.add.rectangle(heroX, heroY, TILE_SIZE - 5, TILE_SIZE - 5, 0xffffff, 0).setDepth(902));
      frame.setStrokeStyle(3, 0xffffff, 0.82);
      this.tweens.add({ targets: [hero, aura, frame], y: '-=2', duration: 750, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  };
}
