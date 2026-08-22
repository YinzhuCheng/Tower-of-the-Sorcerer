const MANIFEST_URL = '/assets/anime/map/manifest.json';
const DEFAULT_BASE_PATH = '/assets/anime/map/';

const entries = new Map();
const atlases = new Map();
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

async function fetchText(url) {
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`地图素材加载失败：${url} (HTTP ${response.status})`);
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
  manifestPromise = fetch(MANIFEST_URL, { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`地图素材清单加载失败：HTTP ${response.status}`);
      return response.json();
    })
    .then((manifest) => {
      basePath = normalizeBasePath(manifest?.basePath);
      for (const [name, meta] of Object.entries(manifest?.atlases ?? {})) atlases.set(name, Object.freeze({ ...meta }));
      for (const [name, meta] of Object.entries(manifest?.assets ?? {})) {
        if (!meta?.atlas || !Number.isInteger(meta.index)) continue;
        entries.set(name, Object.freeze({ ...meta }));
      }
      return manifest;
    })
    .catch((error) => {
      console.warn(error);
      return { version: 2, atlases: {}, assets: {} };
    });
  return manifestPromise;
}

export async function preloadMapAssets() {
  if (preloadPromise) return preloadPromise;
  preloadPromise = (async () => {
    await loadManifest();
    const loadedAtlases = new Map();
    await Promise.all([...atlases].map(async ([name, meta]) => {
      try {
        const image = await decodeAtlas(meta);
        if (image) loadedAtlases.set(name, image);
        else console.warn(`地图图集 ${name} 解码失败，将使用程序化回退。`);
      } catch (error) {
        console.warn(`地图图集 ${name} 加载失败，将使用程序化回退。`, error);
      }
    }));

    for (const [name, meta] of entries) {
      const atlasMeta = atlases.get(meta.atlas);
      const atlasImage = loadedAtlases.get(meta.atlas);
      if (!atlasMeta || !atlasImage) continue;
      images.set(name, cropAtlasCell(atlasImage, atlasMeta.cols, atlasMeta.rows, meta.index));
    }
    return images;
  })();
  return preloadPromise;
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
