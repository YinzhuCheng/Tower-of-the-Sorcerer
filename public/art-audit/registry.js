export const AUDIT_VERSION = '2026-09-03-tower-units-v6';

export const KNOWN_SIGNALS = Object.freeze({
  'tower-unit:hero': Object.freeze([
    '人工已知：主角的魔塔地图形象与当前 GAL 身份基准存在明显漂移，请重点核对发色、服装、武器与年龄感。'
  ])
});

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
    path: '/assets/anime/cg/liyue-noctia-truth-cg.webp',
    cast: ['hero', 'final_queen'],
    scenes: ['bossQueenPreDemo'],
    role: 'story-cg'
  },
  {
    id: 'noctia-afterlight',
    title: '黎明余光候选帧',
    path: '/assets/anime/cg/liyue-noctia-afterlight-cg.webp',
    cast: ['hero', 'final_queen'],
    scenes: ['当前无运行时剧情引用'],
    role: 'candidate-cg',
    referenced: false
  },
  {
    id: 'noctia-seal',
    title: '十阵共同破封',
    path: '/assets/anime/cg/liyue-noctia-seal-cg.webp',
    cast: ['hero', 'final_queen'],
    scenes: ['queenPhaseDemo'],
    role: 'story-cg'
  },
  {
    id: 'echo-ledger',
    title: '十九阵名簿归还',
    path: '/assets/anime/cg/liyue-echo-ledger-cg.webp',
    cast: ['hero', 'final_queen', 'echo_regent'],
    scenes: ['floor19 · 03/05'],
    role: 'story-cg'
  },
  {
    id: 'noctia-sovereign',
    title: '二十阵签名承担',
    path: '/assets/anime/cg/liyue-noctia-sovereign-cg.webp',
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
  }
]);

export const BACKDROPS = Object.freeze([
  { id: 'forest-approach', title: '森林进塔口', path: '/assets/anime/themes/theme-forest-approach.webp', usage: '序章、1–4F、早期守护者' },
  { id: 'forest-sanctuary', title: '森林视觉主题', path: '/assets/anime/themes/theme-forest-sanctuary.webp', usage: '玩法森林主题环境层' },
  { id: 'red-vein', title: '赤脉炉室', path: '/assets/anime/themes/theme-red-vein.webp', usage: '5F、13F、焰璃场景' },
  { id: 'ocean-archive', title: '潮汐档案', path: '/assets/anime/themes/theme-ocean-archive.webp', usage: '6F、16F、18F、澜音场景' },
  { id: 'star-mirror', title: '星镜档案', path: '/assets/anime/themes/theme-star-mirror.webp', usage: '7F、15F、星图与影织场景' },
  { id: 'night-tower', title: '暗夜王庭', path: '/assets/anime/themes/theme-night-tower.webp', usage: '8–10F、女王场景' },
  { id: 'sun-sanctum', title: '日轮圣所', path: '/assets/anime/themes/theme-sun-sanctum.webp', usage: '11F、12F、14F、17F' },
  { id: 'echo-court', title: '回响王庭', path: '/assets/anime/themes/theme-echo-court.webp', usage: '19F' },
  { id: 'origin-core', title: '起源魔源', path: '/assets/anime/themes/theme-origin-core.webp', usage: '20F' },
  { id: 'ash-registry', title: '余烬登记库', path: '/assets/anime/themes/theme-ash-registry.webp', usage: '21–27F' },
  { id: 'archive-storm', title: '档案风暴', path: '/assets/anime/themes/theme-archive-storm.webp', usage: '28–29F' },
  { id: 'ember-lighthouse', title: '余烬灯塔', path: '/assets/anime/themes/theme-ember-lighthouse.webp', usage: '30F、终章' }
]);

export const TRANSITIONS = Object.freeze([
  { id: 'witness-entry', title: '见证场进入／返回', path: '/assets/anime/transitions/witness-entry.webp', usage: '普通 GAL 场景切入与返回' },
  { id: 'seal-shatter', title: 'Boss 封印解锁', path: '/assets/anime/transitions/seal-shatter.webp', usage: '守护者、破封与高潮场景切入' }
]);
