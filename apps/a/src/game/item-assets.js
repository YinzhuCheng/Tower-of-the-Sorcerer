import { loadImage, fetchAsset } from './asset-loading.js';

const MANIFEST_URL = '/assets/anime/items/manifest.json';
const DEFAULT_BASE_PATH = '/assets/anime/items/';

const entries = new Map();
const images = new Map();
let manifestPromise = null;
const pending = new Map();
let basePath = DEFAULT_BASE_PATH;

function normalizeBasePath(value) {
  const path = typeof value === 'string' && value ? value : DEFAULT_BASE_PATH;
  return path.endsWith('/') ? path : `${path}/`;
}

function resolvePath(path) {
  if (/^(?:https?:|data:|\/)/.test(path)) return path;
  return `${basePath}${path}`;
}

async function loadManifest() {
  if (manifestPromise) return manifestPromise;
  manifestPromise = fetchAsset(MANIFEST_URL, { cache: 'no-cache' })
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
      manifestPromise = null;
      throw error;
    });
  return manifestPromise;
}

export async function preloadItemAssets(names = null, { strict = false } = {}) {
  await loadManifest();
  const tasks = [...new Set(names ?? entries.keys())].map(id => {
    if (images.has(id)) return images.get(id);
    if (pending.has(id)) return pending.get(id);
    const task = (async () => {
      const meta = entries.get(id);
      if (!meta) throw new Error(`物品素材未登记：${id}`);
      const image = await loadImage(resolvePath(meta.file));
      if (!image) throw new Error(`物品素材无法解码：${id}`);
      images.set(id, image);
      return image;
    })().finally(() => pending.delete(id));
    pending.set(id, task);
    return task;
  });
  if (strict) await Promise.all(tasks);
  else await Promise.allSettled(tasks);
  return images;
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
