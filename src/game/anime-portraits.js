import { getAnimeAsset, legacyAnimeFallbackUrl } from './anime-assets.js';
import { getMapAsset } from './map-assets.js';

const ARCHETYPES = {
  hero: 0, merchant: 1, cat_guard: 2, fox_shrine: 3,
  whale_girl: 4, swordswoman: 5, dragon_girl: 6, star_witch: 7,
  shadow_assassin: 8, moon_priestess: 9, puppet_master: 10, final_boss: 11
};

const PORTRAITS = {
  hero: ['绫星·璃', 'hero'], mote: ['符文软泥娘', 'puppet_master'],
  cat_scout: ['月影猫娘', 'cat_guard'], cat_mage: ['铃术猫娘', 'cat_guard'], cat_boss: ['猫卫长·米露', 'cat_guard'],
  fox_acolyte: ['青叶狐巫', 'fox_shrine'], fox_archer: ['赤羽狐弓', 'fox_shrine'], fox_boss: ['狐祝·绯叶', 'fox_shrine'], vine_druid: ['藤冠祭司', 'fox_shrine'],
  whale_singer: ['鲸歌术士', 'whale_girl'], tide_lancer: ['潮汐枪姬', 'whale_girl'], whale_boss: ['深蓝歌姬·澜音', 'whale_girl'], shell_guard: ['贝甲鲸娘', 'whale_girl'],
  sword_apprentice: ['银锋学徒', 'swordswoman'], sword_knight: ['蔷薇剑士', 'swordswoman'], sword_boss: ['剑圣·塞蕾娜', 'swordswoman'], blade_priestess: ['双刃祷姬', 'swordswoman'], crown_knight: ['王冠剑姬', 'swordswoman'],
  dragon_whelp: ['幼焰龙娘', 'dragon_girl'], flame_caster: ['赤炎术姬', 'dragon_girl'], dragon_boss: ['龙姬·焰璃', 'dragon_girl'], dragon_guard: ['熔甲龙卫', 'dragon_girl'], dusk_dragon: ['暮色龙娘', 'dragon_girl'],
  star_witch: ['星图魔女', 'star_witch'], mirror_doll: ['镜界人偶', 'puppet_master'], astral_boss: ['天穹魔女·露米', 'star_witch'], comet_archer: ['彗矢术姬', 'star_witch'],
  shadow_ninja: ['影缝忍姬', 'shadow_assassin'], void_priestess: ['虚空祭司', 'moon_priestess'], shadow_boss: ['影织姬·鸦羽', 'shadow_assassin'],
  silence_guard: ['寂静近卫', 'swordswoman'], eclipse_mage: ['蚀月法师', 'moon_priestess'],
  final_queen: ['无声女王·诺克缇娅', 'final_boss'], void_core: ['黯星魔阵核心', 'final_boss'],
  palace_warden_v2: ['静默执剑官·维拉', 'swordswoman'], black_seal_keeper_v2: ['黯印观测官·塞芙', 'star_witch'],
  outer_crown: ['外环冠剑姬', 'swordswoman'], shadow_ward_blade: ['影仪近卫·断棱', 'swordswoman'], hush_vault_blade: ['寂光双卫·刃', 'swordswoman'],
  star_sentinel: ['逆星守望者', 'puppet_master'], crown_shade: ['冠影巡猎姬', 'shadow_assassin'], null_cantor: ['空谱咏唱者', 'moon_priestess'],
  shadow_ward_cantor: ['影仪近卫·残歌', 'moon_priestess'], mute_guard: ['缄默近卫', 'swordswoman'], hush_cantor: ['止声咏唱者', 'moon_priestess'], hush_vault_cantor: ['寂光双卫·咏', 'moon_priestess'],
  merchant: ['阵间商人·珂珂', 'merchant'], guide: ['残响精灵·纱雾', 'moon_priestess'],
  echo_regent: ['回声摄政官', 'final_boss'],
  arcane_sovereign: ['奥术主权者', 'final_boss'],
  act3_cinder_scribe: ['余烬抄写员', 'puppet_master'],
  act3_ash_custodian: ['灰烬保管人', 'final_boss'],
  act3_shelter_warden: ['夜航守柜人', 'final_boss'],
  act3_audit_bailiff: ['持簿执行官', 'moon_priestess'],
  act3_relay_runner: ['接力信使', 'shadow_assassin'],
  act3_relay_conductor: ['接力导体', 'star_witch'],
  act3_ledger_mage: ['账页术士', 'moon_priestess'],
  act3_archive_lancer: ['折页枪卫', 'swordswoman'],
  act3_shelf_warden: ['书架守卫', 'final_boss'],
  act3_triage_knight: ['分诊骑士', 'swordswoman'],
  act3_margin_duelist: ['边注决斗者', 'swordswoman'],
  act3_errata_cantor: ['勘误咏唱者', 'moon_priestess'],
  act3_archive_marshal: ['接力总管', 'final_boss'],
  act3_index_beast: ['索引兽', 'final_boss'],
  act3_last_custodian: ['最后保管人', 'final_boss'],
  act3_archive_warden: ['档案守望者', 'final_boss'],
  act3_errata_core: ['勘误核心', 'final_boss']
};

const urlCache = new Map();
const cardUiAssets = Object.freeze({ sun: 'card-sun-v10', moon: 'card-moon-v10', star: 'card-star-v10' });
// Dialogue art is intentionally served as ordinary WebP files instead of
// Base64 text blobs.  The high-resolution masters stay outside the gameplay
// repository; these 256×384 WebPs are only used by dialogue, codex, and HUD
// portraits.  Map pieces keep their dedicated transparent sprite pipeline.
const RUNTIME_PORTRAITS = Object.freeze({
  hero: '/assets/anime/avatars/liyue-avatar-embers-cel.webp',
  guide: '/assets/anime/characters/shawu-runtime.webp',
  final_queen: '/assets/anime/portraits/v1/final-queen-combat-portrait-runtime.webp',
  echo_regent: '/assets/anime/characters/echo-regent-dialogue-grave.webp',
  arcane_sovereign: '/assets/anime/characters/arcane-sovereign-dialogue-regret.webp',
  void_core: '/assets/anime/enemies/v2/void-core-map-384.webp',
  palace_warden_v2: '/assets/anime/enemies/v2/palace-warden-map-384.webp',
  black_seal_keeper_v2: '/assets/anime/enemies/v2/black-seal-keeper-map-384.webp',
  vine_druid: '/assets/anime/enemies/v3/vine-druid-map-384.webp',
  shell_guard: '/assets/anime/enemies/v3/shell-guard-map-384.webp',
  blade_priestess: '/assets/anime/enemies/v3/blade-priestess-map-384.webp',
  crown_knight: '/assets/anime/enemies/v3/crown-knight-map-384.webp',
  dragon_guard: '/assets/anime/enemies/v3/dragon-guard-map-384.webp',
  dusk_dragon: '/assets/anime/enemies/v3/dusk-dragon-map-384.webp',
  comet_archer: '/assets/anime/enemies/v3/comet-archer-map-384.webp',
  shadow_ward_blade: '/assets/anime/enemies/v3/shadow-ward-blade-map-384.webp',
  hush_vault_blade: '/assets/anime/enemies/v3/hush-vault-blade-map-384.webp',
  star_sentinel: '/assets/anime/enemies/v3/star-sentinel-map-384.webp',
  crown_shade: '/assets/anime/enemies/v3/crown-shade-map-384.webp',
  null_cantor: '/assets/anime/enemies/v3/null-cantor-map-384.webp',
  shadow_ward_cantor: '/assets/anime/enemies/v3/shadow-ward-cantor-map-384.webp',
  mute_guard: '/assets/anime/enemies/v3/mute-guard-map-384.webp',
  hush_vault_cantor: '/assets/anime/enemies/v3/hush-vault-cantor-map-384.webp',
  act3_cinder_scribe: '/assets/anime/enemies/act3/cinder-scribe-map-384.webp',
  act3_ash_custodian: '/assets/anime/enemies/act3/ash-custodian-map-384.webp',
  act3_shelter_warden: '/assets/anime/enemies/act3/shelter-warden-map-384.webp',
  act3_audit_bailiff: '/assets/anime/enemies/act3/audit-bailiff-map-384.webp',
  act3_relay_runner: '/assets/anime/enemies/act3/relay-runner-map-384.webp',
  act3_relay_conductor: '/assets/anime/enemies/act3/relay-conductor-map-384.webp',
  act3_ledger_mage: '/assets/anime/enemies/act3/ledger-mage-map-384.webp',
  act3_archive_lancer: '/assets/anime/enemies/act3/archive-lancer-map-384.webp',
  act3_shelf_warden: '/assets/anime/enemies/act3/shelf-warden-map-384.webp',
  act3_triage_knight: '/assets/anime/enemies/act3/triage-knight-map-384.webp',
  act3_margin_duelist: '/assets/anime/enemies/act3/margin-duelist-map-384.webp',
  act3_errata_cantor: '/assets/anime/enemies/act3/errata-cantor-map-384.webp',
  act3_archive_marshal: '/assets/anime/enemies/act3/archive-marshal-map-384.webp',
  act3_index_beast: '/assets/anime/enemies/act3/index-beast-map-384.webp',
  act3_last_custodian: '/assets/anime/enemies/act3/last-custodian-map-384.webp',
  act3_archive_warden: '/assets/anime/characters/archive-warden-dialogue-duty.webp',
  act3_errata_core: '/assets/anime/enemies/act3/errata-core-map-384.webp',
  mana_wisp: '/assets/anime/portraits/v1/mana-wisp-portrait-runtime.webp',
  aether_warden: '/assets/anime/portraits/v1/aether-warden-portrait-runtime.webp',
  rune_cantor: '/assets/anime/portraits/v1/rune-cantor-portrait-runtime.webp',
  spellblade_duelist: '/assets/anime/portraits/v1/spellblade-duelist-portrait-runtime.webp',
  mana_sentinel: '/assets/anime/portraits/v1/mana-sentinel-portrait-runtime.webp',
  prism_archivist: '/assets/anime/portraits/v1/prism-archivist-portrait-runtime.webp',
  mirror_huntress: '/assets/anime/portraits/v1/mirror-huntress-portrait-runtime.webp',
  void_herald: '/assets/anime/portraits/v1/void-herald-portrait-runtime.webp',
  liyue_awakened: '/assets/anime/portraits/v1/liyue-awakened-portrait-runtime.webp',
  origin_core: '/assets/anime/portraits/v1/origin-core-portrait-runtime.webp',
  resonance_blade: '/assets/anime/portraits/v1/resonance-blade-portrait-runtime.webp',
  resonance_cantor: '/assets/anime/portraits/v1/resonance-cantor-portrait-runtime.webp',
  arcane_gatekeeper: '/assets/anime/portraits/v1/arcane-gatekeeper-portrait-runtime.webp',
  spectrum_marshal: '/assets/anime/portraits/v1/spectrum-marshal-portrait-runtime.webp',
  triune_arbiter: '/assets/anime/portraits/v1/triune-arbiter-portrait-runtime.webp',
  mirror_duelist: '/assets/anime/portraits/v1/mirror-duelist-portrait-runtime.webp',
  mirror_cantor: '/assets/anime/portraits/v1/mirror-cantor-portrait-runtime.webp',
  crown_blade: '/assets/anime/portraits/v1/crown-blade-portrait-runtime.webp',
  crown_cantor: '/assets/anime/portraits/v1/crown-cantor-portrait-runtime.webp',
  crown_magus: '/assets/anime/portraits/v1/crown-magus-portrait-runtime.webp',
  mote: '/assets/anime/portraits/v1/mote-portrait-runtime.webp',
  cat_scout: '/assets/anime/portraits/v1/cat-scout-portrait-runtime.webp',
  cat_mage: '/assets/anime/portraits/v1/cat-mage-portrait-runtime.webp',
  cat_boss: '/assets/anime/portraits/v1/cat-boss-portrait-runtime.webp',
  fox_acolyte: '/assets/anime/portraits/v1/fox-acolyte-portrait-runtime.webp',
  fox_archer: '/assets/anime/portraits/v1/fox-archer-portrait-runtime.webp',
  fox_boss: '/assets/anime/portraits/v1/fox-boss-portrait-runtime.webp',
  whale_singer: '/assets/anime/portraits/v1/whale-singer-portrait-runtime.webp',
  tide_lancer: '/assets/anime/portraits/v1/tide-lancer-portrait-runtime.webp',
  whale_boss: '/assets/anime/portraits/v1/whale-boss-portrait-runtime.webp',
  sword_apprentice: '/assets/anime/portraits/v1/sword-apprentice-portrait-runtime.webp',
  sword_knight: '/assets/anime/portraits/v1/sword-knight-portrait-runtime.webp',
  sword_boss: '/assets/anime/portraits/v1/sword-boss-portrait-runtime.webp',
  dragon_whelp: '/assets/anime/portraits/v1/dragon-whelp-portrait-runtime.webp',
  flame_caster: '/assets/anime/portraits/v1/flame-caster-portrait-runtime.webp',
  dragon_boss: '/assets/anime/portraits/v1/dragon-boss-portrait-runtime.webp',
  star_witch: '/assets/anime/portraits/v1/star-witch-portrait-runtime.webp',
  mirror_doll: '/assets/anime/portraits/v1/mirror-doll-portrait-runtime.webp',
  shadow_ninja: '/assets/anime/portraits/v1/shadow-ninja-portrait-runtime.webp',
  void_priestess: '/assets/anime/portraits/v1/void-priestess-portrait-runtime.webp',
  silence_guard: '/assets/anime/portraits/v1/silence-guard-portrait-runtime.webp',
  eclipse_mage: '/assets/anime/portraits/v1/eclipse-mage-portrait-runtime.webp',
  hush_cantor: '/assets/anime/enemies/v3/hush-cantor-map-384.webp',
  outer_crown: '/assets/anime/enemies/v3/outer-crown-map-384.webp',
  palace_warden: '/assets/anime/portraits/v1/palace-warden-portrait-runtime.webp',
  black_seal_keeper: '/assets/anime/portraits/v1/black-seal-keeper-portrait-runtime.webp',
  astral_boss: '/assets/anime/portraits/v1/astral-boss-portrait-runtime.webp',
  shadow_boss: '/assets/anime/characters/yayu-dialogue-guarded.webp',
  merchant: '/assets/anime/portraits/v1/merchant-keke-portrait-runtime.webp'
});

// The gameplay portrait is intentionally stable, while the visual-novel
// layer may request an authored expression. Keeping this mapping separate
// means every other HUD/codex consumer continues to use the compact runtime
// portrait without paying for a full character illustration.
const DIALOGUE_EXPRESSIONS = Object.freeze({
  'hero:resolve': '/assets/anime/characters/liyue-dialogue-resolve.webp',
  'hero:stern': '/assets/anime/characters/liyue-dialogue-resolve.webp',
  'hero:guarded': '/assets/anime/characters/liyue-dialogue-guarded-v2.webp',
  'hero:embers': '/assets/anime/characters/liyue-dialogue-embers-v2.webp',
  'guide:gentle': '/assets/anime/characters/shawu-dialogue-gentle.webp',
  'guide:watchful': '/assets/anime/characters/shawu-dialogue-gentle.webp',
  'guide:lament': '/assets/anime/characters/shawu-dialogue-gentle.webp',
  'guide:focus': '/assets/anime/characters/shawu-dialogue-focus.webp',
  'final_queen:sorrow': '/assets/anime/characters/noctia-dialogue-sorrow.webp',
  'final_queen:grave': '/assets/anime/characters/noctia-dialogue-sorrow.webp',
  'final_queen:knowing': '/assets/anime/characters/noctia-dialogue-knowing-v2.webp',
  'final_queen:cold': '/assets/anime/characters/noctia-dialogue-cold-v2.webp',
  'final_queen:resolve': '/assets/anime/characters/noctia-dialogue-resolve.webp',
  // Key witness encounters receive true visual-novel standing art.  These
  // remain distinct from the small combat/codex portraits below, so bringing
  // a Boss onto the Gal stage never scales a 58px map token into a sprite.
  'cat_boss:alert': '/assets/anime/characters/milu-dialogue-alert-v8.webp',
  'fox_boss:watchful': '/assets/anime/characters/feiye-dialogue-watchful-v8.webp',
  'whale_boss:lament': '/assets/anime/characters/lanyin-dialogue-lament-v8.webp',
  'sword_boss:stern': '/assets/anime/characters/serena-dialogue-stern-v8.webp',
  'dragon_boss:embers': '/assets/anime/characters/yanli-dialogue-embers.webp',
  'astral_boss:focus': '/assets/anime/characters/lumi-dialogue-focus-v8.webp',
  'shadow_boss:guarded': '/assets/anime/characters/yayu-dialogue-guarded.webp',
  'echo_regent:grave': '/assets/anime/characters/echo-regent-dialogue-grave.webp',
  'echo_regent:release': '/assets/anime/characters/echo-regent-dialogue-release.webp',
  'arcane_sovereign:regret': '/assets/anime/characters/arcane-sovereign-dialogue-regret.webp',
  'arcane_sovereign:acceptance': '/assets/anime/characters/arcane-sovereign-dialogue-acceptance.webp',
  'act3_archive_warden:duty': '/assets/anime/characters/archive-warden-dialogue-duty.webp',
  'palace_warden_v2:duty': '/assets/anime/characters/vela-dialogue-duty.webp',
  'black_seal_keeper_v2:watchful': '/assets/anime/characters/seph-dialogue-watchful.webp',
  'act3_last_custodian:grave': '/assets/anime/characters/last-custodian-dialogue-release.webp',
  'act3_last_custodian:release': '/assets/anime/characters/last-custodian-dialogue-release.webp'
});

// The three recurring leads use a real painted face for each dialogue state,
// not one neutral avatar dressed up with a different text label.
const LEAD_EXPRESSION_AVATARS = Object.freeze({
  'hero:resolve': { label: '决意', avatar: '/assets/anime/avatars/liyue-avatar-resolve-cel.webp' },
  'hero:stern': { label: '警觉', avatar: '/assets/anime/avatars/liyue-avatar-stern-cel.webp' },
  'hero:guarded': { label: '克制', avatar: '/assets/anime/avatars/liyue-avatar-guarded-cel.webp' },
  'hero:embers': { label: '战意', avatar: '/assets/anime/avatars/liyue-avatar-embers-cel.webp' },
  'guide:gentle': { label: '温柔', avatar: '/assets/anime/avatars/shawu-avatar-gentle-cel.webp' },
  'guide:watchful': { label: '担忧', avatar: '/assets/anime/avatars/shawu-avatar-watchful-cel.webp' },
  'guide:lament': { label: '低回', avatar: '/assets/anime/avatars/shawu-avatar-lament-cel.webp' },
  'guide:focus': { label: '凝神', avatar: '/assets/anime/avatars/shawu-avatar-focus-cel.webp' },
  'final_queen:sorrow': { label: '哀伤', avatar: '/assets/anime/avatars/noctia-avatar-sorrow-cel.webp' },
  'final_queen:grave': { label: '威仪', avatar: '/assets/anime/avatars/noctia-avatar-grave-cel.webp' },
  'final_queen:knowing': { label: '了然', avatar: '/assets/anime/avatars/noctia-avatar-knowing-cel.webp' },
  'final_queen:cold': { label: '冷峻', avatar: '/assets/anime/avatars/noctia-avatar-cold-cel.webp' },
  'final_queen:resolve': { label: '决意', avatar: '/assets/anime/avatars/noctia-avatar-cold-cel.webp' }
});

const EXPRESSION_LABELS = Object.freeze({
  resolve: '决意',
  gentle: '温柔',
  sorrow: '哀伤',
  release: '放手',
  acceptance: '承担'
});

// Dialogue is not a smaller version of the enemy codex.  Every person who
// speaks owns a compact face avatar, a readable expression label, and a
// default emotional state for turns that predate the visual-novel layer.
// The three recurring leads have dedicated painted expression files above;
// the supporting cast deliberately keeps its authored runtime portrait while
// the stage supplies its expression lighting and state treatment.
export const DIALOGUE_CAST = Object.freeze({
  hero: { expression: 'resolve', label: '决意', avatar: '/assets/anime/avatars/liyue-avatar-resolve-cel.webp' },
  guide: { expression: 'gentle', label: '温柔', avatar: '/assets/anime/avatars/shawu-avatar-gentle-cel.webp' },
  final_queen: { expression: 'sorrow', label: '哀伤', avatar: '/assets/anime/avatars/noctia-avatar-sorrow-cel.webp' },
  cat_boss: { expression: 'alert', label: '警惕', avatar: '/assets/anime/avatars/cat-boss-avatar-alert-v8.webp' },
  fox_boss: { expression: 'watchful', label: '审视', avatar: '/assets/anime/avatars/fox-boss-avatar-watchful-v8.webp' },
  whale_boss: { expression: 'lament', label: '低回', avatar: '/assets/anime/avatars/whale-boss-avatar-lament-v8.webp' },
  sword_boss: { expression: 'stern', label: '肃然', avatar: '/assets/anime/avatars/sword-boss-avatar-stern-v8.webp' },
  dragon_boss: { expression: 'embers', label: '炽烈', avatar: '/assets/anime/avatars/dragon-boss-avatar-embers-v7.webp' },
  astral_boss: { expression: 'focus', label: '推演', avatar: '/assets/anime/avatars/astral-boss-avatar-focus.webp' },
  shadow_boss: { expression: 'guarded', label: '戒备', avatar: '/assets/anime/avatars/shadow-boss-avatar-guarded.webp' },
  merchant: { expression: 'knowing', label: '了然', avatar: '/assets/anime/avatars/merchant-avatar-knowing.webp' },
  echo_regent: { expression: 'grave', label: '肃穆', avatar: '/assets/anime/avatars/echo-regent-avatar-grave.webp' },
  arcane_sovereign: { expression: 'regret', label: '愧悔', avatar: '/assets/anime/avatars/arcane-sovereign-avatar-regret.webp' },
  palace_warden_v2: { expression: 'duty', label: '校验', avatar: '/assets/anime/avatars/palace-warden-avatar-duty.webp' },
  black_seal_keeper_v2: { expression: 'watchful', label: '观测', avatar: '/assets/anime/avatars/black-seal-keeper-avatar-watchful.webp' },
  act3_last_custodian: { expression: 'grave', label: '固守', avatar: '/assets/anime/avatars/last-custodian-avatar-grave.webp' },
  act3_archive_warden: { expression: 'duty', label: '执行', avatar: '/assets/anime/avatars/archive-warden-avatar-duty.webp' }
});

function archetype(id) { return PORTRAITS[id]?.[1] ?? 'hero'; }

export function portraitIndex(id) { return ARCHETYPES[archetype(id)] ?? 0; }

function canvasUrl(canvas) {
  try { return canvas?.toDataURL?.('image/webp', 0.94) ?? null; } catch { return null; }
}

export function portraitUrl(id, expression = null) {
  const runtime = DIALOGUE_EXPRESSIONS[`${id}:${expression}`] ?? RUNTIME_PORTRAITS[id];
  if (runtime) return runtime;
  const key = archetype(id);
  if (urlCache.has(key)) return urlCache.get(key);
  if (key === 'hero') {
    const hero = canvasUrl(getMapAsset('hero-portrait-v4'));
    if (hero) { urlCache.set(key, hero); return hero; }
  }
  const index = ARCHETYPES[key] ?? 0;
  const col = index % 4;
  const row = Math.floor(index / 4);
  let sheet;
  try { sheet = getAnimeAsset('portraits'); }
  catch { sheet = legacyAnimeFallbackUrl('portraits'); }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><image href="${sheet}" x="${-col * 80}" y="${-row * 80}" width="320" height="240" preserveAspectRatio="none"/></svg>`;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  urlCache.set(key, url);
  return url;
}

/**
 * Shared dialogue presentation for the stage portrait and the framed avatar
 * next to the nameplate.  Keeping this in the asset module makes every new
 * dialogue character automatically receive the Galgame treatment instead of
 * requiring markup forks in every floor's narrative data.
 */
export function dialoguePresentation(id, requestedExpression = null) {
  const cast = DIALOGUE_CAST[id] ?? { expression: 'neutral', label: '平静' };
  const expression = requestedExpression ?? cast.expression;
  const key = `${id}:${expression}`;
  const leadExpression = LEAD_EXPRESSION_AVATARS[key];
  return Object.freeze({
    id,
    expression,
    label: leadExpression?.label ?? (expression === cast.expression ? cast.label : (EXPRESSION_LABELS[expression] ?? '平静')),
    avatar: leadExpression?.avatar ?? cast.avatar ?? portraitUrl(id, expression),
    stage: portraitUrl(id, expression),
    hasAvatarArt: Boolean(leadExpression?.avatar ?? cast.avatar),
    hasPaintedExpression: Boolean(DIALOGUE_EXPRESSIONS[key])
  });
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
