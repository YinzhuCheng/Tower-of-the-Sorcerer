import { loadImage, fetchAsset } from './asset-loading.js';

const MANIFEST_URL = '/assets/anime/map/manifest.json';
const DEFAULT_BASE_PATH = '/assets/anime/map/';

const entries = new Map();
const atlases = new Map();
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

async function fetchText(url) {
  const response = await fetchAsset(url, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`地图素材加载失败：${url} (HTTP ${response.status})`);
  return (await response.text()).trim();
}

function decodeBase64Bytes(payload) {
  const binary = atob(payload.replace(/\s+/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function trimRiffWebP(bytes) {
  if (bytes.length < 12) return bytes;
  const isRiff = String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF';
  const isWebp = String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP';
  if (!isRiff || !isWebp) return bytes;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const declaredLength = view.getUint32(4, true) + 8;
  if (declaredLength >= 12 && declaredLength <= bytes.length) return bytes.slice(0, declaredLength);
  return bytes;
}

async function loadBase64Image(payload, mime = 'image/webp') {
  const bytes = trimRiffWebP(decodeBase64Bytes(payload));
  const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
  try {
    return await loadImage(blobUrl);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

async function decodeAtlas(meta) {
  if (meta.file) return loadImage(resolvePath(meta.file));
  if (meta.base64File) {
    const payload = await fetchText(resolvePath(meta.base64File));
    return loadBase64Image(payload, meta.mime ?? 'image/webp');
  }
  if (Array.isArray(meta.base64Chunks) && meta.base64Chunks.length) {
    const parts = await Promise.all(meta.base64Chunks.map((path) => fetchText(resolvePath(path))));
    return loadBase64Image(parts.join(''), meta.mime ?? 'image/webp');
  }
  return null;
}

function cropAtlasCell(image, cols, rows, index) {
  const cellW = image.naturalWidth / cols;
  const cellH = image.naturalHeight / rows;
  const col = index % cols;
  const row = Math.floor(index / cols);
  const canvas = document.createElement('canvas');
  canvas.width = cellW;
  canvas.height = cellH;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, col * cellW, row * cellH, cellW, cellH, 0, 0, cellW, cellH);
  return canvas;
}

async function loadManifest() {
  if (manifestPromise) return manifestPromise;
  manifestPromise = fetchAsset(MANIFEST_URL, { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`地图素材清单加载失败：HTTP ${response.status}`);
      return response.json();
    })
    .then((manifest) => {
      basePath = normalizeBasePath(manifest?.basePath);
      for (const [name, meta] of Object.entries(manifest?.atlases ?? {})) atlases.set(name, Object.freeze({ ...meta }));
      for (const [name, meta] of Object.entries(manifest?.assets ?? {})) {
        const isDirectImage = typeof meta?.file === 'string' && meta.file.length > 0;
        const isAtlasCell = Boolean(meta?.atlas) && Number.isInteger(meta.index);
        if (!isDirectImage && !isAtlasCell) continue;
        entries.set(name, Object.freeze({ ...meta }));
      }
      return manifest;
    })
    .catch((error) => {
      manifestPromise = null;
      throw error;
    });
  return manifestPromise;
}

const atlasPending = new Map();
async function loadMapAsset(name) {
  if (images.has(name)) return images.get(name);
  if (pending.has(name)) return pending.get(name);
  const task = (async () => {
    const meta = entries.get(name);
    if (!meta) throw new Error(`地图素材未登记：${name}`);
    let image;
    if (meta.file) image = await loadImage(resolvePath(meta.file));
    else {
      const atlasMeta = atlases.get(meta.atlas);
      if (!atlasMeta) throw new Error(`地图图集未登记：${meta.atlas}`);
      if (!atlasPending.has(meta.atlas)) {
        const loading = decodeAtlas(atlasMeta).then(value => {
          if (!value) throw new Error(`地图图集无法解码：${meta.atlas}`);
          return value;
        }).catch(error => { atlasPending.delete(meta.atlas); throw error; });
        atlasPending.set(meta.atlas, loading);
      }
      image = cropAtlasCell(await atlasPending.get(meta.atlas), atlasMeta.cols, atlasMeta.rows, meta.index);
    }
    if (!image) throw new Error(`地图素材无法解码：${name}`);
    images.set(name, image);
    return image;
  })().finally(() => pending.delete(name));
  pending.set(name, task);
  return task;
}

export async function preloadMapAssets(names = null, { strict = false } = {}) {
  await loadManifest();
  const tasks = [...new Set(names ?? entries.keys())].map(loadMapAsset);
  if (strict) await Promise.all(tasks);
  else await Promise.allSettled(tasks);
  return images;
}

export function getMapAsset(name) {
  return images.get(name) ?? null;
}

export function getMapAssetMeta(name) {
  return entries.get(name) ?? null;
}

export function hasMapAsset(name) {
  return entries.has(name);
}
