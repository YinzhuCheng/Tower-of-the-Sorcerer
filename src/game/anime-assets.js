// Legacy sheet loader. High-resolution hero, enemy and map art now use their
// own manifest-driven binary WebP loaders; these four sheets remain as safe
// fallbacks for portraits/items/older event icons.
const ASSET_NAMES = Object.freeze([
  'portraits',
  'chibi',
  'items',
  'tiles'
]);
const urls = new Map();

function fallbackDimensions(name) {
  if (name === 'portraits') return [320, 240];
  if (name === 'chibi') return [256, 192];
  if (name === 'items') return [256, 256];
  return [256, 256];
}

/**
 * Development/source checkouts may intentionally omit the legacy generated
 * `.b64` sheets. A missing optional fallback sheet must not prevent the local
 * Canvas renderer from booting. Keep a deterministic SVG sheet in memory so
 * callers still receive a valid image URL while high-resolution manifest assets
 * and procedural map rendering continue to load independently.
 */
export function legacyAnimeFallbackUrl(name) {
  if (!ASSET_NAMES.includes(name)) throw new Error(`Unknown anime asset sheet: ${name}`);
  const [width, height] = fallbackDimensions(name);
  const cell = name === 'portraits' ? 80 : 64;
  const cols = Math.max(1, Math.floor(width / cell));
  const rows = Math.max(1, Math.floor(height / cell));
  const blocks = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cell;
      const y = row * cell;
      const even = (row + col) % 2 === 0;
      blocks.push(`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="8" fill="${even ? '#243149' : '#312743'}"/>`);
      blocks.push(`<circle cx="${x + cell / 2}" cy="${y + cell * 0.38}" r="${cell * 0.18}" fill="#94a9c7" opacity=".72"/>`);
      blocks.push(`<path d="M${x + cell * 0.25} ${y + cell * 0.82} Q${x + cell / 2} ${y + cell * 0.55} ${x + cell * 0.75} ${y + cell * 0.82}" fill="#7187a8" opacity=".72"/>`);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#111827"/>${blocks.join('')}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function preloadAnimeAssets() {
  await Promise.all(ASSET_NAMES.map(loadAnimeAsset));
}

export async function loadAnimeAsset(name) {
  if (urls.has(name)) return urls.get(name);
  if (!ASSET_NAMES.includes(name)) throw new Error(`Unknown anime asset sheet: ${name}`);
  try {
    const response = await fetch(`/assets/anime/b64/${name}.b64`, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const base64 = (await response.text()).trim();
    if (!base64) throw new Error('empty payload');
    const url = `data:image/webp;base64,${base64}`;
    urls.set(name, url);
    return url;
  } catch (error) {
    const url = legacyAnimeFallbackUrl(name);
    urls.set(name, url);
    console.warn(`Legacy anime sheet '${name}' unavailable; using procedural fallback.`, error);
    return url;
  }
}

export function getAnimeAsset(name) {
  const url = urls.get(name);
  if (!url) throw new Error(`Anime asset '${name}' was used before preload.`);
  return url;
}
