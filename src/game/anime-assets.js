const ASSET_NAMES = Object.freeze([
  'portraits',
  'chibi',
  'items',
  'tiles',
  'hero-down',
  'hero-up',
  'hero-left',
  'hero-right'
]);
const urls = new Map();

export async function preloadAnimeAssets() {
  await Promise.all(ASSET_NAMES.map(loadAnimeAsset));
}

export async function loadAnimeAsset(name) {
  if (urls.has(name)) return urls.get(name);
  if (!ASSET_NAMES.includes(name)) throw new Error(`Unknown anime asset sheet: ${name}`);
  const response = await fetch(`/assets/anime/b64/${name}.b64`, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`素材加载失败：${name}`);
  const base64 = (await response.text()).trim();
  const url = `data:image/webp;base64,${base64}`;
  urls.set(name, url);
  return url;
}

export function getAnimeAsset(name) {
  const url = urls.get(name);
  if (!url) throw new Error(`Anime asset '${name}' was used before preload.`);
  return url;
}
