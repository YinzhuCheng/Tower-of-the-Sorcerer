import { getAnimeAsset, preloadAnimeAssets } from './anime-assets.js';
import { getMapAsset, preloadMapAssets } from './map-assets.js';

await Promise.all([preloadAnimeAssets(), preloadMapAssets()]);

const ARCHETYPES = {
  hero: 0, merchant: 1, cat_guard: 2, fox_shrine: 3,
  whale_girl: 4, swordswoman: 5, dragon_girl: 6, star_witch: 7,
  shadow_assassin: 8, moon_priestess: 9, puppet_master: 10, final_boss: 11
};

const PORTRAITS = {
  hero: ['绫星·璃', 'hero'], mote: ['符文软泥娘', 'puppet_master'],
  cat_scout: ['月影猫娘', 'cat_guard'], cat_mage: ['铃术猫娘', 'cat_guard'], cat_boss: ['猫卫长·米露', 'cat_guard'],
  fox_acolyte: ['青叶狐巫', 'fox_shrine'], fox_archer: ['赤羽狐弓', 'fox_shrine'], fox_boss: ['狐祝·绯叶', 'fox_shrine'],
  whale_singer: ['鲸歌术士', 'whale_girl'], tide_lancer: ['潮汐枪姬', 'whale_girl'], whale_boss: ['深蓝歌姬·澜音', 'whale_girl'],
  sword_apprentice: ['银锋学徒', 'swordswoman'], sword_knight: ['蔷薇剑士', 'swordswoman'], sword_boss: ['剑圣·塞蕾娜', 'swordswoman'],
  dragon_whelp: ['幼焰龙娘', 'dragon_girl'], flame_caster: ['赤炎术姬', 'dragon_girl'], dragon_boss: ['龙姬·焰璃', 'dragon_girl'],
  star_witch: ['星图魔女', 'star_witch'], mirror_doll: ['镜界人偶', 'puppet_master'], astral_boss: ['天穹魔女·露米', 'star_witch'],
  shadow_ninja: ['影缝忍姬', 'shadow_assassin'], void_priestess: ['虚空祭司', 'moon_priestess'], shadow_boss: ['影织姬·鸦羽', 'shadow_assassin'],
  silence_guard: ['寂静近卫', 'swordswoman'], eclipse_mage: ['蚀月法师', 'moon_priestess'],
  final_queen: ['无声女王·诺克缇娅', 'final_boss'], void_core: ['黯星魔阵核心', 'final_boss'],
  merchant: ['阵间商人·珂珂', 'merchant'], guide: ['残响精灵·纱雾', 'moon_priestess']
};

const urlCache = new Map();
const cardUiAssets = Object.freeze({ sun: 'card-sun-v10', moon: 'card-moon-v10', star: 'card-star-v10' });

function archetype(id) { return PORTRAITS[id]?.[1] ?? 'hero'; }

export function portraitIndex(id) { return ARCHETYPES[archetype(id)] ?? 0; }

function canvasUrl(canvas) {
  try { return canvas?.toDataURL?.('image/webp', 0.94) ?? null; } catch { return null; }
}

export function portraitUrl(id) {
  const key = archetype(id);
  if (urlCache.has(key)) return urlCache.get(key);
  if (key === 'hero') {
    const hero = canvasUrl(getMapAsset('hero-portrait-v4'));
    if (hero) { urlCache.set(key, hero); return hero; }
  }
  const index = ARCHETYPES[key] ?? 0;
  const col = index % 4;
  const row = Math.floor(index / 4);
  const sheet = getAnimeAsset('portraits');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><image href="${sheet}" x="${-col * 80}" y="${-row * 80}" width="320" height="240" preserveAspectRatio="none"/></svg>`;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  urlCache.set(key, url);
  return url;
}

export function portraitStyle() { return 'object-fit:cover;object-position:center top;'; }

export function hydratePortraits(root = document) {
  root.querySelectorAll('[data-portrait]').forEach((image) => {
    const id = image.dataset.portrait;
    if (id) image.src = portraitUrl(id);
  });

  for (const [key, assetName] of Object.entries(cardUiAssets)) {
    const token = root.querySelector(`.card-token.${key}`);
    const asset = getMapAsset(assetName);
    if (!token || !asset || token.querySelector('.card-ui-art')) continue;
    const src = canvasUrl(asset);
    if (!src) continue;
    const art = document.createElement('img');
    art.className = 'card-ui-art';
    art.alt = `${key} card`;
    art.src = src;
    Object.assign(art.style, {
      width: '34px',
      height: '42px',
      objectFit: 'contain',
      flex: '0 0 auto',
      filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.4))'
    });
    // V10 card artwork already carries the sun/moon/star identity. Remove the
    // legacy emblem node instead of merely hiding it, so !important styles or
    // cached layout rules can never stack the circular symbol on top again.
    token.querySelector('.card-emblem')?.remove();
    token.prepend(art);
  }
}

export function portraitName(id) { return PORTRAITS[id]?.[0] ?? id; }
