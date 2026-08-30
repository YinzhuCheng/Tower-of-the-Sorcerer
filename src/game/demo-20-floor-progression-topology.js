/**
 * Act II is intentionally a semantic contract only.  It freezes what each
 * room must mean before a map, a combat number, a shop price, or an art asset
 * is committed.  The future content/spatial overlays consume these IDs.
 */
const FLOOR_CONTRACTS = Object.freeze({
  10: Object.freeze({
    roomGrammar: '王座终局 → 魔力觉醒转场',
    transitionBoss: 'voidCore',
    exitGuardians: Object.freeze(['voidCore']),
    transition: 'awakenMagic',
    protectedOutcome: '通往 F11 的上楼梯与 MP=100/100 的魔力附刃觉醒'
  }),
  11: Object.freeze({
    roomGrammar: '复苏环廊：入口、校准壁龛、回返环、上行门槛',
    exitGuardians: Object.freeze([]),
    cardGates: Object.freeze(['f11LunarTrace']),
    keyRelics: Object.freeze(['manaFlask']),
    protectedOutcome: '首次可控 MP 回复与附刃回合断点教学'
  }),
  12: Object.freeze({
    roomGrammar: '双谱温室：主路温室、调律枢纽、双卫宝库',
    exitGuardians: Object.freeze([]),
    guardianGates: Object.freeze({ twinChordVault: Object.freeze(['resonanceBlade', 'resonanceCantor']) }),
    keyRelics: Object.freeze(['aetherPrism']),
    protectedOutcome: '首个可选双 Boss 投资，换取最大 MP 权限；不在早期追加例行商店'
  }),
  13: Object.freeze({
    roomGrammar: '脉冲锻炉：双回路、熔铸室、封印前庭',
    exitGuardians: Object.freeze([]),
    cardGates: Object.freeze(['f13StarConduit', 'f13MoonBypass']),
    keyRelics: Object.freeze(['conduitCodex']),
    protectedOutcome: '用卡片选择回路，并取得后续附刃容量锚点'
  }),
  14: Object.freeze({
    roomGrammar: '三矢竞技场：三翼战场、中央封台、上行结界',
    exitGuardians: Object.freeze(['arcaneGatekeeper', 'spectrumMarshal', 'triuneArbiter']),
    protectedOutcome: '三名守卫全部落败后才开放 F15 楼梯'
  }),
  15: Object.freeze({
    roomGrammar: '折页档案馆：阅览中庭、页间侧室、蓄能书库',
    exitGuardians: Object.freeze([]),
    cardGates: Object.freeze(['f15ArchiveSeal']),
    shops: Object.freeze(['mpRestore', 'maxMp']),
    keyRelics: Object.freeze(['arcaneBattery']),
    protectedOutcome: '中章商店与高价值蓄能遗物，不以 Boss 结尾'
  }),
  16: Object.freeze({
    roomGrammar: '镜轮双殿：外环、双镜殿、可选共鸣宝库',
    exitGuardians: Object.freeze([]),
    guardianGates: Object.freeze({ mirrorReservoirVault: Object.freeze(['mirrorDuelist', 'mirrorCantor']) }),
    cardGates: Object.freeze(['f16PrismThreshold']),
    keyRelics: Object.freeze(['mirrorReservoir']),
    protectedOutcome: '可选双 Boss 与多门卡账本的并行资源决策'
  }),
  17: Object.freeze({
    roomGrammar: '三冠阶庭：三座阶庭、汇合王阶、封顶上行',
    exitGuardians: Object.freeze(['crownBlade', 'crownCantor', 'crownMagus']),
    keyRelics: Object.freeze(['crownCapacitor']),
    protectedOutcome: '三名冠庭守卫共同解除 F18 上楼结界'
  }),
  18: Object.freeze({
    roomGrammar: '澄空航渠：供能渠、交叉桥、补给停泊室、前厅',
    exitGuardians: Object.freeze([]),
    cardGates: Object.freeze(['f18SunBridge', 'f18StarChannel']),
    protectedOutcome: '终局前的卡片分流与 MP 资源保留层'
  }),
  19: Object.freeze({
    roomGrammar: '回响王庭：入口厅、回声前庭、王座门',
    exitGuardians: Object.freeze(['echoRegent']),
    cardGates: Object.freeze(['f19ThroneLicense']),
    keyRelics: Object.freeze(['originFocus']),
    protectedOutcome: '回声摄政官是 F20 的唯一楼梯守卫；终局前不再提供无代价转换'
  }),
  20: Object.freeze({
    roomGrammar: '起源魔源：门厅、相位前庭、双相终局室',
    finalPhases: Object.freeze(['arcaneSovereign', 'originCore']),
    protectedOutcome: '唯一最终 Boss 两阶段战；只有 originCore 触发胜利'
  })
});

export const DEMO20_PROGRESSION_TOPOLOGY_ID = 'demo-20f-magic-act2-topology-v1';

/** New encounter identities, deliberately without combat numbers. */
export const ACT2_UNIT_CATALOG = Object.freeze({
  manaWisp: Object.freeze({ kind: 'enemy', floorRange: Object.freeze([11, 13]), portrait: 'mana_wisp', role: '轻型附刃教学单位' }),
  aetherWarden: Object.freeze({ kind: 'enemy', floorRange: Object.freeze([11, 16]), portrait: 'aether_warden', role: '高防阈值单位' }),
  runeCantor: Object.freeze({ kind: 'enemy', floorRange: Object.freeze([12, 18]), portrait: 'rune_cantor', role: '固定魔法伤害单位' }),
  spellbladeDuelist: Object.freeze({ kind: 'enemy', floorRange: Object.freeze([13, 19]), portrait: 'spellblade_duelist', role: '先制型附刃取舍单位' }),
  manaSentinel: Object.freeze({ kind: 'enemy', floorRange: Object.freeze([14, 20]), portrait: 'mana_sentinel', role: '中后段厚重守卫' }),
  prismArchivist: Object.freeze({ kind: 'enemy', floorRange: Object.freeze([15, 18]), portrait: 'prism_archivist', role: '卡片与宝物侧室守卫' }),
  mirrorHuntress: Object.freeze({ kind: 'enemy', floorRange: Object.freeze([16, 19]), portrait: 'mirror_huntress', role: '镜界机动威胁' }),
  voidHerald: Object.freeze({ kind: 'enemy', floorRange: Object.freeze([18, 20]), portrait: 'void_herald', role: '终局前魔法高压单位' }),
  resonanceBlade: Object.freeze({ kind: 'boss', floor: 12, portrait: 'spellblade_duelist', role: '双谱宝库近战守卫' }),
  resonanceCantor: Object.freeze({ kind: 'boss', floor: 12, portrait: 'rune_cantor', role: '双谱宝库咏唱守卫' }),
  arcaneGatekeeper: Object.freeze({ kind: 'boss', floor: 14, portrait: 'aether_gatekeeper', role: '三矢竞技场守门人' }),
  spectrumMarshal: Object.freeze({ kind: 'boss', floor: 14, portrait: 'spectrum_marshal', role: '三矢竞技场中翼统领' }),
  triuneArbiter: Object.freeze({ kind: 'boss', floor: 14, portrait: 'triune_arbiter', role: '三矢竞技场裁定者' }),
  mirrorDuelist: Object.freeze({ kind: 'boss', floor: 16, portrait: 'mirror_duelist', role: '镜轮宝库剑卫' }),
  mirrorCantor: Object.freeze({ kind: 'boss', floor: 16, portrait: 'mirror_cantor', role: '镜轮宝库咏唱卫' }),
  crownBlade: Object.freeze({ kind: 'boss', floor: 17, portrait: 'crown_blade', role: '三冠阶庭刃冠' }),
  crownCantor: Object.freeze({ kind: 'boss', floor: 17, portrait: 'crown_cantor', role: '三冠阶庭咏冠' }),
  crownMagus: Object.freeze({ kind: 'boss', floor: 17, portrait: 'crown_magus', role: '三冠阶庭法冠' }),
  echoRegent: Object.freeze({ kind: 'boss', floor: 19, portrait: 'echo_regent', role: '回响王庭楼梯守卫' }),
  arcaneSovereign: Object.freeze({ kind: 'boss', floor: 20, portrait: 'arcane_sovereign', role: '终局第一相' }),
  originCore: Object.freeze({ kind: 'boss', floor: 20, portrait: 'origin_core', role: '终局第二相与唯一胜利触发器' })
});

/**
 * Key MP objects are role locks, not numeric balance objects. The later
 * numeric pass supplies their exact restore/capacity values and shop prices.
 */
export const ACT2_RELIC_CATALOG = Object.freeze({
  manaFlask: Object.freeze({ floor: 11, portrait: 'mana_flask', effectRole: 'restoreMp', critical: false }),
  aetherPrism: Object.freeze({ floor: 12, portrait: 'mana_crystal', effectRole: 'increaseMaxMp', critical: true }),
  conduitCodex: Object.freeze({ floor: 13, portrait: 'conduit_codex', effectRole: 'increaseMaxMp', critical: true }),
  arcaneBattery: Object.freeze({ floor: 15, portrait: 'arcane_battery', effectRole: 'restoreAndIncreaseMaxMp', critical: true }),
  mirrorReservoir: Object.freeze({ floor: 16, portrait: 'mirror_reservoir', effectRole: 'increaseMaxMp', critical: true }),
  crownCapacitor: Object.freeze({ floor: 17, portrait: 'crown_capacitor', effectRole: 'increaseMaxMp', critical: true }),
  originFocus: Object.freeze({ floor: 19, portrait: 'origin_focus', effectRole: 'restoreMp', critical: true })
});

export const DEMO20_PROGRESSION_TOPOLOGY = Object.freeze({
  id: DEMO20_PROGRESSION_TOPOLOGY_ID,
  floors: FLOOR_CONTRACTS,
  units: ACT2_UNIT_CATALOG,
  relics: ACT2_RELIC_CATALOG,
  bosslessFloors: Object.freeze([11, 13, 15, 18]),
  clusteredGuardianFloors: Object.freeze([12, 14, 16, 17, 20]),
  // One decisive conversion point per ten-floor act: F5 is the planned 10F
  // shop, and F15 is the planned Act II shop. Extra shops create repeatable
  // buy/teleport loops instead of meaningful spatial decisions.
  mpShopFloors: Object.freeze([15])
});

function unique(values = []) {
  return new Set(values).size === values.length;
}

function guardianIds(contract) {
  return [
    ...(contract?.exitGuardians ?? []),
    ...Object.values(contract?.guardianGates ?? {}).flat()
  ];
}

export function validateDemoTwentyFloorProgressionTopology(topology = DEMO20_PROGRESSION_TOPOLOGY) {
  const violations = [];
  const floors = topology?.floors ?? {};
  if (topology?.id !== DEMO20_PROGRESSION_TOPOLOGY_ID) violations.push('unexpected-topology-id');
  for (let floor = 10; floor <= 20; floor += 1) {
    if (!floors[floor]?.roomGrammar) violations.push(`missing-room-grammar-f${floor}`);
    if (!floors[floor]?.protectedOutcome) violations.push(`missing-protected-outcome-f${floor}`);
  }
  const expectedBossless = [11, 13, 15, 18];
  if (!unique(topology?.bosslessFloors) || topology?.bosslessFloors?.join(',') !== expectedBossless.join(',')) {
    violations.push('bossless-cadence');
  }
  for (const floor of expectedBossless) {
    if ((floors[floor]?.exitGuardians ?? []).length > 0) violations.push(`bossless-floor-f${floor}`);
  }

  const expectedExitGroups = {
    10: ['voidCore'],
    14: ['arcaneGatekeeper', 'spectrumMarshal', 'triuneArbiter'],
    17: ['crownBlade', 'crownCantor', 'crownMagus'],
    19: ['echoRegent']
  };
  for (const [floor, ids] of Object.entries(expectedExitGroups)) {
    const actual = floors[floor]?.exitGuardians ?? [];
    if (actual.join(',') !== ids.join(',')) violations.push(`exit-guardian-group-f${floor}`);
  }
  const expectedVaults = {
    12: ['resonanceBlade', 'resonanceCantor'],
    16: ['mirrorDuelist', 'mirrorCantor']
  };
  for (const [floor, ids] of Object.entries(expectedVaults)) {
    const actual = Object.values(floors[floor]?.guardianGates ?? {}).flat();
    if (actual.join(',') !== ids.join(',')) violations.push(`optional-guardian-vault-f${floor}`);
  }
  if (floors[20]?.finalPhases?.join(',') !== 'arcaneSovereign,originCore') violations.push('f20-final-phases');
  if (floors[10]?.transition !== 'awakenMagic' || floors[10]?.transitionBoss !== 'voidCore') violations.push('f10-magic-transition');
  if (topology?.mpShopFloors?.join(',') !== '15') violations.push('mp-shop-cadence');
  for (const floor of topology?.mpShopFloors ?? []) {
    const capabilities = floors[floor]?.shops ?? [];
    if (!capabilities.includes('mpRestore') || !capabilities.includes('maxMp')) violations.push(`mp-shop-capabilities-f${floor}`);
  }

  const unitIds = Object.keys(topology?.units ?? {});
  if (!unique(unitIds) || unitIds.length < 20) violations.push('unit-catalogue');
  for (const ids of Object.values(expectedExitGroups).concat(Object.values(expectedVaults))) {
    // voidCore belongs to the already-frozen F10 contract; every other ID is
    // new Act II content and must be declared here before maps are authored.
    for (const id of ids) if (id !== 'voidCore' && !topology?.units?.[id]) violations.push(`missing-unit-${id}`);
  }
  if (!topology?.units?.originCore || topology.units.originCore.floor !== 20) violations.push('origin-core');
  for (const [id, relic] of Object.entries(topology?.relics ?? {})) {
    if (!relic?.effectRole || !Number.isInteger(relic.floor)) violations.push(`invalid-relic-${id}`);
    // No combat or economy numbers are allowed into a topology lock.
    if (['hp', 'atk', 'def', 'gold', 'mp', 'maxMp', 'price'].some((field) => field in relic)) violations.push(`numeric-relic-${id}`);
  }

  return Object.freeze({
    id: topology?.id,
    ok: violations.length === 0,
    violations: Object.freeze(violations),
    guardianIds: Object.freeze(Object.fromEntries(
      Object.entries(floors).map(([floor, contract]) => [floor, Object.freeze(guardianIds(contract))])
    ))
  });
}
