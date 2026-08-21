import { createCanvasTowerScene as createAnimeCanvasTowerScene } from './anime-canvas-scene.js';
import { getAnimeAsset, preloadAnimeAssets } from './anime-assets.js';
import { getEnemyAsset, getEnemyAssetMeta, preloadEnemyAssets } from './enemy-assets.js';
import { GRID_SIZE } from './data.js';

await Promise.all([preloadAnimeAssets(), preloadEnemyAssets()]);

const HERO_DIRECTION_ASSET = Object.freeze({
  down: 'hero-down',
  up: 'hero-up',
  left: 'hero-left',
  right: 'hero-right'
});

export function createCanvasTowerScene(bridge, parent = document.getElementById('game-container')) {
  const scene = createAnimeCanvasTowerScene(bridge, parent);
  let direction = 'down';

  parent.style.position = 'relative';

  // Enemy art is manifest-driven. If an entry is missing or fails to load, the
  // original chibi sheet remains the fail-safe, so art updates cannot break play.
  const drawSprite = scene.drawSprite.bind(scene);
  scene.drawSprite = (id, cx, cy, size, alpha = 1) => {
    if (id === 'hero') return;
    const image = getEnemyAsset(id);
    if (!image) return drawSprite(id, cx, cy, size, alpha);

    const meta = getEnemyAssetMeta(id) ?? {};
    const scale = Number.isFinite(meta.scale) ? meta.scale : 1;
    const offsetX = Number.isFinite(meta.offsetX) ? meta.offsetX * size : 0;
    const offsetY = Number.isFinite(meta.offsetY) ? meta.offsetY * size : 0;
    const drawSize = size * scale;

    scene.ctx.save();
    scene.ctx.globalAlpha = alpha;
    scene.ctx.imageSmoothingEnabled = true;
    scene.ctx.imageSmoothingQuality = 'high';
    scene.ctx.drawImage(
      image,
      cx - drawSize / 2 + offsetX,
      cy - drawSize / 2 + offsetY,
      drawSize,
      drawSize
    );
    scene.ctx.restore();
  };

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
