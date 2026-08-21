const MANIFEST_URL = '/assets/anime/enemies/manifest.json';
const DEFAULT_BASE_PATH = '/assets/anime/';

const entries = new Map();
const urls = new Map();
const images = new Map();
let manifestPromise = null;
let preloadPromise = null;
let basePath = DEFAULT_BASE_PATH;

function normalizeBasePath(value) {
  const path = typeof value === 'string' && value ? value : DEFAULT_BASE_PATH;
  return path.endsWith('/') ? path : `${path}/`;
}

async function fetchText(url) {
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`素材加载失败：${url} (HTTP ${response.status})`);
  return (await response.text()).trim();
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

function resolvePath(path) {
  if (/^(?:https?:|data:|\/)/.test(path)) return path;
  return `${basePath}${path}`;
}

async function loadManifest() {
  if (manifestPromise) return manifestPromise;
  manifestPromise = fetch(MANIFEST_URL, { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`敌人素材清单加载失败：HTTP ${response.status}`);
      return response.json();
    })
    .then((manifest) => {
      basePath = normalizeBasePath(manifest?.basePath);
      for (const [portrait, meta] of Object.entries(manifest?.assets ?? {})) {
        if (!meta || (!meta.file && !meta.base64File && !meta.bundle)) continue;
        entries.set(portrait, Object.freeze({ ...meta }));
      }
      return manifest;
    })
    .catch((error) => {
      console.warn(error);
      return { version: 2, assets: {} };
    });
  return manifestPromise;
}

async function resolveUrls() {
  await loadManifest();
  const bundlePromises = new Map();

  await Promise.all([...entries].map(async ([portrait, meta]) => {
    try {
      if (meta.file) {
        urls.set(portrait, resolvePath(meta.file));
        return;
      }

      if (meta.base64File) {
        const base64 = await fetchText(resolvePath(meta.base64File));
        urls.set(portrait, `data:${meta.mime ?? 'image/webp'};base64,${base64}`);
        return;
      }

      if (meta.bundle) {
        const bundleUrl = resolvePath(meta.bundle);
        if (!bundlePromises.has(bundleUrl)) {
          bundlePromises.set(bundleUrl, fetchText(bundleUrl).then(JSON.parse));
        }
        const payload = await bundlePromises.get(bundleUrl);
        const base64 = payload?.[meta.key];
        if (typeof base64 === 'string' && base64) {
          urls.set(portrait, `data:${meta.mime ?? 'image/webp'};base64,${base64}`);
        }
      }
    } catch (error) {
      console.warn(`敌人素材 ${portrait} 加载失败，将使用旧贴图。`, error);
    }
  }));
}

export async function preloadEnemyAssets() {
  if (preloadPromise) return preloadPromise;
  preloadPromise = (async () => {
    await resolveUrls();
    await Promise.all([...urls].map(async ([portrait, url]) => {
      const image = await loadImage(url);
      if (image) images.set(portrait, image);
      else console.warn(`敌人素材 ${portrait} 解码失败，将使用旧贴图。`);
    }));
    return images;
  })();
  return preloadPromise;
}

export function getEnemyAsset(portrait) {
  return images.get(portrait) ?? null;
}

export function getEnemyAssetUrl(portrait) {
  return urls.get(portrait) ?? null;
}

export function getEnemyAssetMeta(portrait) {
  return entries.get(portrait) ?? null;
}

export function hasEnemyAsset(portrait) {
  return entries.has(portrait);
}
