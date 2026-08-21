import { createCanvasTowerScene as createAnimeCanvasTowerScene } from './anime-canvas-scene.js';
import { getAnimeAsset, preloadAnimeAssets } from './anime-assets.js';
import { GRID_SIZE } from './data.js';

await preloadAnimeAssets();

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

  // Enemies continue using the shared chibi sheet. The protagonist is rendered
  // as a dedicated transparent directional sprite layered over the canvas.
  const drawSprite = scene.drawSprite.bind(scene);
  scene.drawSprite = (id, ...args) => {
    if (id === 'hero') return;
    return drawSprite(id, ...args);
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
