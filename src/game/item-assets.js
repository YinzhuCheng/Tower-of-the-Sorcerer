const MANIFEST_URL = '/assets/anime/items/manifest.json';
const DEFAULT_BASE_PATH = '/assets/anime/items/';

const entries = new Map();
const images = new Map();
let manifestPromise = null;
let preloadPromise = null;
let basePath = DEFAULT_BASE_PATH;

function normalizeBasePath(value) {
  const path = typeof value === 'string' && value ? value : DEFAULT_BASE_PATH;
  return path.endsWith('/') ? path : `${path}/`;
}

function resolvePath(path) {
  if (/^(?:https?:|data:|\/)/.test(path)) return path;
  return `${basePath}${path}`;
}

function loadImage(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

async function loadManifest() {
  if (manifestPromise) return manifestPromise;
  manifestPromise = fetch(MANIFEST_URL, { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`物品素材清单加载失败：HTTP ${response.status}`);
      return response.json();
    })
    .then((manifest) => {
      basePath = normalizeBasePath(manifest?.basePath);
      for (const [id, meta] of Object.entries(manifest?.assets ?? {})) {
        if (meta?.file) entries.set(id, Object.freeze({ ...meta }));
      }
      return manifest;
    })
    .catch((error) => {
      console.warn(error);
      return { version: 1, assets: {} };
    });
  return manifestPromise;
}

export async function preloadItemAssets() {
  if (preloadPromise) return preloadPromise;
  preloadPromise = (async () => {
    await loadManifest();
    await Promise.all([...entries].map(async ([id, meta]) => {
      const image = await loadImage(resolvePath(meta.file));
      if (image) images.set(id, image);
      else console.warn(`物品素材 ${id} 解码失败，将使用旧贴图。`);
    }));
    return images;
  })();
  return preloadPromise;
}

export function getItemAsset(id) {
  return images.get(id) ?? null;
}

export function getItemAssetMeta(id) {
  return entries.get(id) ?? null;
}

export function hasItemAsset(id) {
  return entries.has(id);
}
