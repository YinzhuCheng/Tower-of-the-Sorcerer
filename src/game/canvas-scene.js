import { createCanvasTowerScene as createAnimeCanvasTowerScene } from './anime-canvas-scene.js';
import { getAnimeAsset, preloadAnimeAssets } from './anime-assets.js';
import { getEnemyAsset, preloadEnemyAssets } from './enemy-assets.js';
import { GRID_SIZE } from './data.js';

await Promise.all([preloadAnimeAssets(), preloadEnemyAssets()]);

const HERO_DIRECTION_ASSET = Object.freeze({
  down: 'hero-down',
  up: 'hero-up',
  left: 'hero-left',
  right: 'hero-right'
});

const HD_ENEMY_PORTRAITS = Object.freeze([
  'cat_scout', 'cat_mage', 'fox_acolyte', 'fox_archer', 'whale_singer',
  'tide_lancer', 'sword_apprentice', 'sword_knight', 'dragon_whelp', 'flame_caster',
  'void_priestess', 'shadow_boss', 'mirror_doll', 'astral_boss', 'cat_boss',
  'fox_boss', 'whale_boss', 'dragon_boss', 'silence_guard', 'eclipse_mage'
]);

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export function createCanvasTowerScene(bridge, parent = document.getElementById('game-container')) {
  const scene = createAnimeCanvasTowerScene(bridge, parent);
  let direction = 'down';
  const enemyImages = new Map();

  parent.style.position = 'relative';

  // The protagonist is a dedicated transparent directional sprite layered over
  // the canvas. Covered enemies use independent HD transparent sprites; any
  // enemy without a new asset falls back to the original shared chibi sheet.
  const drawSprite = scene.drawSprite.bind(scene);
  scene.drawSprite = (id, cx, cy, size, alpha = 1) => {
    if (id === 'hero') return;
    const image = enemyImages.get(id);
    if (!image) return drawSprite(id, cx, cy, size, alpha);

    scene.ctx.save();
    scene.ctx.globalAlpha = alpha;
    scene.ctx.imageSmoothingEnabled = true;
    scene.ctx.imageSmoothingQuality = 'high';
    scene.ctx.drawImage(image, cx - size / 2, cy - size / 2, size, size);
    scene.ctx.restore();
  };

  Promise.all(HD_ENEMY_PORTRAITS.map(async (portrait) => {
    const src = getEnemyAsset(portrait);
    if (!src) return;
    const image = await loadImage(src);
    if (image) enemyImages.set(portrait, image);
  })).then(() => scene.refresh());

  const hero = document.createElement('img');
  hero.alt = '';
  hero.setAttribute('aria-hidden', 'true');
  hero.className = 'directional-hero-sprite';
  Object.assign(hero.style, {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: '4',
    width: `${(100 / GRID_SIZE) * 0.96}%`,
    height: `${(100 / GRID_SIZE) * 0.96}%`,
    objectFit: 'contain',
    transform: 'translate(-50%, -50%)',
    transformOrigin: 'center',
    imageRendering: 'auto',
    filter: 'drop-shadow(0 0 5px rgba(187, 151, 255, .45))'
  });
  parent.append(hero);

  function syncHero() {
    const state = bridge.getState();
    hero.src = getAnimeAsset(HERO_DIRECTION_ASSET[direction]);
    hero.style.left = `${((state.x + 0.5) / GRID_SIZE) * 100}%`;
    hero.style.top = `${((state.y + 0.5) / GRID_SIZE) * 100}%`;
  }

  const move = scene.move.bind(scene);
  scene.move = (nextDirection) => {
    if (HERO_DIRECTION_ASSET[nextDirection]) direction = nextDirection;
    const result = move(nextDirection);
    syncHero();
    return result;
  };

  const refresh = scene.refresh.bind(scene);
  scene.refresh = (...args) => {
    const result = refresh(...args);
    syncHero();
    return result;
  };

  const destroy = scene.destroy.bind(scene);
  scene.destroy = (...args) => {
    hero.remove();
    return destroy(...args);
  };

  syncHero();
  return scene;
}
