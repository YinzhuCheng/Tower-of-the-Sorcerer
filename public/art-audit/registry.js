export const AUDIT_VERSION = '2026-09-04-art-audit-repair-v3';

export const KNOWN_SIGNALS = Object.freeze({});

// These are combat mechanisms rather than living or character-like units.
// They remain in the game manifests, but are deliberately outside the human
// identity review requested for protagonist, enemies and visible NPCs.
export const NON_LIVING_UNIT_PORTRAITS = Object.freeze([
  'void_core',
  'origin_core',
  'act3_errata_core'
]);

export const CG_SCENES = Object.freeze([
  {
    id: 'critical',
    title: '危急战斗预演',
    path: '/assets/anime/cg/liyue-critical-cg.webp',
    cast: ['hero'],
    scenes: ['战斗：可胜但剩余生命 ≤ 30%'],
    role: 'battle-cg'
  },
  {
    id: 'defeat',
    title: '战败预演',
    path: '/assets/anime/cg/liyue-defeat-cg.webp',
    cast: ['hero'],
    scenes: ['战斗：不可胜'],
    role: 'battle-cg'
  },
  {
    id: 'prologue-tower',
    title: '序章：被夺去的咏唱',
    path: '/assets/anime/cg/liyue-prologue-tower-cg.webp',
    cast: ['hero'],
    scenes: ['prologue · 01/03'],
    role: 'story-cg'
  },
  {
    id: 'noctia-truth',
    title: '十阵真相对谈',
    path: '/assets/anime/cg/liyue-noctia-truth-cg-audit-v3.webp',
    cast: ['hero', 'final_queen'],
    scenes: ['bossQueenPreDemo'],
    role: 'story-cg'
  },
  {
    id: 'northstar-arrival',
    title: '三阵：北辰七号抵岸原音',
    path: '/assets/anime/cg/liyue-lanyin-northstar-arrival-cg-v8.webp',
    cast: ['hero', 'whale_boss'],
    scenes: ['bossWhalePostDemo'],
    role: 'story-cg'
  },
  {
    id: 'noctia-afterlight',
    title: '终章：摘下警报石',
    path: '/assets/anime/cg/liyue-noctia-afterlight-cg.webp',
    cast: ['hero', 'final_queen'],
    scenes: ['ending'],
    role: 'story-cg'
  },
  {
    id: 'noctia-seal',
    title: '十阵共同破封',
    path: '/assets/anime/cg/liyue-noctia-seal-cg-audit-v3.webp',
    cast: ['hero', 'final_queen'],
    scenes: ['queenPhaseDemo'],
    role: 'story-cg'
  },
  {
    id: 'echo-ledger',
    title: '十九阵名簿归还',
    path: '/assets/anime/cg/liyue-echo-ledger-cg-audit-v3.webp',
    cast: ['hero', 'final_queen', 'echo_regent'],
    scenes: ['floor19 · 03/05'],
    role: 'story-cg'
  },
  {
    id: 'seventeen-minute-splice',
    title: '十七阵：确认时序错位',
    path: '/assets/anime/cg/liyue-lumi-seventeen-minute-splice-cg-v8.webp',
    cast: ['hero', 'astral_boss'],
    scenes: ['floor17'],
    role: 'story-cg'
  },
  {
    id: 'noctia-sovereign',
    title: '二十阵签名承担',
    path: '/assets/anime/cg/liyue-noctia-sovereign-cg-audit-v3.webp',
    cast: ['hero', 'final_queen', 'arcane_sovereign'],
    scenes: ['floor20 · 05/05'],
    role: 'story-cg'
  },
  {
    id: 'lighthouse-archive',
    title: '终章灯塔归档',
    path: '/assets/anime/cg/liyue-lighthouse-archive-cg.webp',
    cast: ['hero', 'guide', 'final_queen'],
    scenes: ['ending · 01/04'],
    role: 'story-cg'
  },
  {
    id: 'seven-cantos-severed',
    title: '序章：七段咏唱被拆分',
    path: '/assets/anime/cg/liyue-seven-cantos-severed-cg-audit-v3.webp',
    cast: ['hero', 'guide'],
    scenes: ['prologue'],
    role: 'story-cg'
  },
  {
    id: 'seven-core-network',
    title: '七阵：七核契约网络',
    path: '/assets/anime/cg/liyue-yayu-seven-core-network-cg-audit-v3.webp',
    cast: ['hero', 'shadow_boss'],
    scenes: ['floor7'],
    role: 'story-cg'
  },
  {
    id: 'missing-fourth-step',
    title: '十一阵：缺失的第四步',
    path: '/assets/anime/cg/liyue-noctia-missing-fourth-step-cg-audit-v3.webp',
    cast: ['hero', 'final_queen'],
    scenes: ['floor11'],
    role: 'story-cg'
  },
  {
    id: 'intercepted-receipt',
    title: '十八阵：截留回执',
    path: '/assets/anime/cg/liyue-yayu-intercepted-receipt-cg-audit-v3.webp',
    cast: ['hero', 'shadow_boss'],
    scenes: ['floor18'],
    role: 'story-cg'
  },
  {
    id: 'missing-page-restored',
    title: '二十五阵：归档缺页复原',
    path: '/assets/anime/cg/liyue-noctia-missing-page-cg-audit-v3.webp',
    cast: ['hero', 'final_queen', 'arcane_sovereign'],
    scenes: ['floor25'],
    role: 'story-cg'
  },
  {
    id: 'letters-held-in-storm',
    title: '二十八阵：风暴中护住原信',
    path: '/assets/anime/cg/liyue-noctia-archive-storm-cg-audit-v3.webp',
    cast: ['hero', 'final_queen'],
    scenes: ['floor28'],
    role: 'story-cg'
  },
  {
    id: 'originals-enter-lighthouse',
    title: '三十阵：原卷进入灯塔',
    path: '/assets/anime/cg/liyue-archive-warden-entry-cg-audit-v3.webp',
    cast: ['hero', 'final_queen', 'arcane_sovereign'],
    scenes: ['floor30'],
    role: 'story-cg'
  },
  {
    id: 'traceable-revocation',
    title: '灯塔：可追溯撤销写入',
    path: '/assets/anime/cg/liyue-traceable-revocation-cg-audit-v3.webp',
    cast: ['guide', 'final_queen', 'arcane_sovereign'],
    scenes: ['bossArchiveWardenPost'],
    role: 'story-cg'
  }
]);

export const BACKDROPS = Object.freeze([
  { id: 'forest-approach', title: '森林进塔口', path: '/assets/anime/themes/theme-forest-approach.webp', usage: '序章、1–4F、早期守护者' },
  { id: 'forest-sanctuary', title: '森林视觉主题', path: '/assets/anime/themes/theme-forest-sanctuary.webp', usage: '玩法森林主题环境层' },
  { id: 'red-vein', title: '赤脉炉室', path: '/assets/anime/themes/theme-red-vein.webp', usage: '5F、13F、焰璃场景' },
  { id: 'ocean-archive', title: '潮汐档案', path: '/assets/anime/themes/theme-ocean-archive.webp', usage: '3F、16F、18F、澜音场景' },
  { id: 'star-mirror', title: '星镜档案', path: '/assets/anime/themes/theme-star-mirror.webp', usage: '6–7F、星图与影织场景' },
  { id: 'night-tower', title: '暗夜王庭', path: '/assets/anime/themes/theme-night-tower.webp', usage: '8–10F、女王场景' },
  { id: 'sun-sanctum', title: '日轮圣所', path: '/assets/anime/themes/theme-sun-sanctum.webp', usage: '11F、14F、17F' },
  { id: 'echo-court', title: '回响王庭', path: '/assets/anime/themes/theme-echo-court.webp', usage: '19F' },
  { id: 'origin-core', title: '起源魔源', path: '/assets/anime/themes/theme-origin-core.webp', usage: '20F' },
  { id: 'ash-registry', title: '余烬登记库', path: '/assets/anime/themes/theme-ash-registry.webp', usage: '21F' },
  { id: 'night-shelter', title: '夜航侧库', path: '/assets/anime/themes/theme-night-shelter-v8.webp', usage: '22F' },
  { id: 'audit-chamber', title: '逐页校验室', path: '/assets/anime/themes/theme-audit-chamber-v8.webp', usage: '23F' },
  { id: 'relay-gallery', title: '灯塔接力室', path: '/assets/anime/themes/theme-relay-gallery-v8.webp', usage: '24F' },
  { id: 'triage-index', title: '归档作业庭', path: '/assets/anime/themes/theme-triage-index-v8.webp', usage: '25F、27F' },
  { id: 'archive-storm', title: '档案风暴', path: '/assets/anime/themes/theme-archive-storm.webp', usage: '28F' },
  { id: 'ember-lighthouse', title: '余烬灯塔外景', path: '/assets/anime/themes/theme-ember-lighthouse.webp', usage: '终章出门' },
  { id: 'moon-white-vestibule', title: '月白门廊', path: '/assets/anime/themes/theme-moon-white-vestibule.webp', usage: '米露战前／战后' },
  { id: 'twin-score-greenhouse', title: '双谱温室', path: '/assets/anime/themes/theme-twin-score-greenhouse.webp', usage: '12F、米露信物' },
  { id: 'folded-archive-market', title: '折页档案与折角集市', path: '/assets/anime/themes/theme-folded-archive-market.webp', usage: '15F、26F' },
  { id: 'final-index-room', title: '最后索引室', path: '/assets/anime/themes/theme-final-index-room.webp', usage: '29F' },
  { id: 'ember-lighthouse-writein', title: '余烬灯塔写入口', path: '/assets/anime/themes/theme-ember-lighthouse-writein.webp', usage: '30F、终章室内' }
]);

export const TRANSITIONS = Object.freeze([
  { id: 'witness-entry', title: '见证场进入／返回', path: '/assets/anime/transitions/witness-entry.webp', usage: '普通 GAL 场景切入与返回' },
  { id: 'seal-shatter', title: 'Boss 封印解锁', path: '/assets/anime/transitions/seal-shatter.webp', usage: '守护者、破封与高潮场景切入' }
]);
