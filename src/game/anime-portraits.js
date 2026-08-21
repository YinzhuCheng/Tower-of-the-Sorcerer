import { getAnimeAsset, preloadAnimeAssets } from './anime-assets.js';

await preloadAnimeAssets();

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

function archetype(id) {
  return PORTRAITS[id]?.[1] ?? 'hero';
}

export function portraitIndex(id) {
  return ARCHETYPES[archetype(id)] ?? 0;
}

export function portraitUrl(id) {
  const key = archetype(id);
  if (urlCache.has(key)) return urlCache.get(key);
  const index = ARCHETYPES[key] ?? 0;
  const col = index % 4;
  const row = Math.floor(index / 4);
  const sheet = getAnimeAsset('portraits');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><image href="${sheet}" x="${-col * 80}" y="${-row * 80}" width="320" height="240" preserveAspectRatio="none"/></svg>`;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  urlCache.set(key, url);
  return url;
}

export function portraitStyle() {
  return 'object-fit:cover;object-position:center top;';
}

export function hydratePortraits(root = document) {
  root.querySelectorAll('[data-portrait]').forEach((image) => {
    const id = image.dataset.portrait;
    if (id) image.src = portraitUrl(id);
  });
}

export function portraitName(id) {
  return PORTRAITS[id]?.[0] ?? id;
}
