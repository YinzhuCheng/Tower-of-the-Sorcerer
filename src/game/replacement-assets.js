const REPLACEMENT_ASSETS = Object.freeze({
  'gate:vine': { file: '/assets/anime/replacements/vine-gate.webp', scale: 0.98 },
  'gate:mirror': { file: '/assets/anime/replacements/star-mirror-gate.webp', scale: 0.98 },
  'item:weapon': { file: '/assets/anime/replacements/moon-blade.webp', scale: 0.94 },
  'item:lucky': { file: '/assets/anime/replacements/lucky-coin.webp', scale: 0.90 },
  'item:shield': { file: '/assets/anime/replacements/dragon-scale-talisman.webp', scale: 0.92 },
  'enemy:fox_boss': { file: '/assets/anime/replacements/fox-boss.webp', scale: 1.08 },
  'enemy:star_witch': { file: '/assets/anime/replacements/star-witch.webp', scale: 1.04 },
  'enemy:shadow_ninja': { file: '/assets/anime/replacements/shadow-ninja.webp', scale: 1.04 },
  'enemy:sword_boss': { file: '/assets/anime/replacements/royal-sword-saint.webp', scale: 1.04 },
  'enemy:final_queen': { file: '/assets/anime/replacements/final-queen.webp', scale: 1.04 }
});

const images = new Map();
let preloadPromise = null;

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export function getReplacementAssetMeta(key) {
  return REPLACEMENT_ASSETS[key] ?? null;
}

export function getReplacementAsset(key) {
  return images.get(key) ?? null;
}

export function hasReplacementAsset(key) {
  return Object.hasOwn(REPLACEMENT_ASSETS, key);
}

export async function preloadReplacementAssets() {
  if (preloadPromise) return preloadPromise;
  preloadPromise = Promise.all(Object.entries(REPLACEMENT_ASSETS).map(async ([key, meta]) => {
    const image = await loadImage(meta.file);
    if (image) images.set(key, image);
  })).then(() => images);
  return preloadPromise;
}

export const REPLACEMENT_ASSET_KEYS = Object.freeze(Object.keys(REPLACEMENT_ASSETS));
