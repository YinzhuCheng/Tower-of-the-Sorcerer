import {
  ACT2_RELIC_CATALOG,
  ACT2_UNIT_CATALOG,
  DEMO20_PROGRESSION_TOPOLOGY,
  validateDemoTwentyFloorProgressionTopology
} from './demo-20-floor-progression-topology.js';
import {
  DEMO20_SPATIAL_TOPOLOGY,
  validateDemoTwentyFloorSpatialTopology
} from './demo-20-floor-spatial-topology.js';
import { getAllianceBondByItem } from './alliance-bonds.js';

export const DEMO20_CONTENT_ID = 'demo-20f-magic-act2-runtime-v2-council';
export const DEMO20_NUMERIC_BASELINE_ID = 'demo-20f-replayed-numeric-baseline-v2';

// This is the first full engine-replayed playable baseline. The
// topology/key-unit/card lock remains accepted; later balance work may only
// tune this table through a bounded, replay-verified pass. Keeping every new
// combat number here gives that pass one small, auditable mutation surface.
export const DEMO20_NUMERIC_BASELINE = Object.freeze({
  manaWisp: Object.freeze({ hp: 1288, atk: 251, def: 193, gold: 210 }),
  aetherWarden: Object.freeze({ hp: 1990, atk: 269, def: 216, gold: 250 }),
  runeCantor: Object.freeze({ hp: 1508, atk: 244, def: 203, gold: 230, special: 'magic', magicPower: 138 }),
  spellbladeDuelist: Object.freeze({ hp: 1650, atk: 271, def: 211, gold: 260, special: 'firstStrike' }),
  manaSentinel: Object.freeze({ hp: 2530, atk: 290, def: 223, gold: 310 }),
  prismArchivist: Object.freeze({ hp: 1820, atk: 265, def: 211, gold: 285, special: 'magic', magicPower: 155 }),
  mirrorHuntress: Object.freeze({ hp: 2090, atk: 284, def: 217, gold: 300, special: 'firstStrike' }),
  voidHerald: Object.freeze({ hp: 2630, atk: 302, def: 226, gold: 340, special: 'magic', magicPower: 191 }),
  resonanceBlade: Object.freeze({ hp: 4600, atk: 305, def: 228, gold: 600, special: 'firstStrike' }),
  resonanceCantor: Object.freeze({ hp: 4300, atk: 292, def: 222, gold: 600, special: 'magic', magicPower: 220 }),
  arcaneGatekeeper: Object.freeze({ hp: 3016, atk: 272, def: 215, gold: 750, special: 'firstStrike' }),
  spectrumMarshal: Object.freeze({ hp: 2860, atk: 265, def: 213, gold: 750, special: 'magic', magicPower: 130 }),
  triuneArbiter: Object.freeze({ hp: 3328, atk: 279, def: 218, gold: 850, special: 'doubleHit' }),
  mirrorDuelist: Object.freeze({ hp: 6800, atk: 340, def: 244, gold: 900, special: 'firstStrike' }),
  mirrorCantor: Object.freeze({ hp: 6400, atk: 326, def: 240, gold: 900, special: 'magic', magicPower: 290 }),
  crownBlade: Object.freeze({ hp: 3180, atk: 284, def: 218, gold: 1050, special: 'firstStrike' }),
  crownCantor: Object.freeze({ hp: 3020, atk: 272, def: 216, gold: 1050, special: 'magic', magicPower: 160 }),
  crownMagus: Object.freeze({ hp: 3280, atk: 280, def: 220, gold: 1100, special: 'doubleHit' }),
  echoRegent: Object.freeze({ hp: 4130, atk: 316, def: 223, gold: 1400, special: 'magic', magicPower: 180 }),
  arcaneSovereign: Object.freeze({ hp: 2880, atk: 272, def: 197, gold: 0, special: 'magic', magicPower: 85 }),
  originCore: Object.freeze({ hp: 3440, atk: 278, def: 202, gold: 0, special: 'doubleHit' })
});

// MP valuables are separate from combat numbers.  They are the authored
// capacity/recovery cadence specified by the Act II semantic lock; their later
// magnitudes may be mutation targets, but their floor, purpose and uniqueness
// are not.
export const DEMO20_MAGIC_RELIC_EFFECTS = Object.freeze({
  manaFlask: Object.freeze({ mp: 100 }),
  aetherPrism: Object.freeze({ maxMp: 20, mp: 20 }),
  conduitCodex: Object.freeze({ maxMp: 20 }),
  arcaneBattery: Object.freeze({ maxMp: 30, mp: 60 }),
  mirrorReservoir: Object.freeze({ maxMp: 30, mp: 30 }),
  crownCapacitor: Object.freeze({ maxMp: 30, mp: 30 }),
  originFocus: Object.freeze({ mp: 150 })
});

const ACT2_THEMES = Object.freeze([
  Object.freeze({ floor: 0x1c2941, floorAlt: 0x304763, wall: 0x586f87, glow: 0x79d9ff, fog: 0x0d1728 }),
  Object.freeze({ floor: 0x213846, floorAlt: 0x315c61, wall: 0x5d8e89, glow: 0x8fffd1, fog: 0x101e23 }),
  Object.freeze({ floor: 0x3c2c27, floorAlt: 0x634635, wall: 0x9f7250, glow: 0xffb46d, fog: 0x23140f }),
  Object.freeze({ floor: 0x25233e, floorAlt: 0x39345f, wall: 0x69679c, glow: 0xcbbaff, fog: 0x151327 }),
  Object.freeze({ floor: 0x26314a, floorAlt: 0x3b4f74, wall: 0x66789c, glow: 0x9bc9ff, fog: 0x111a2d }),
  Object.freeze({ floor: 0x293044, floorAlt: 0x47506f, wall: 0x838eb5, glow: 0xe3dcff, fog: 0x151827 }),
  Object.freeze({ floor: 0x3c2b40, floorAlt: 0x624264, wall: 0x9f719f, glow: 0xffb8e7, fog: 0x271627 }),
  Object.freeze({ floor: 0x25364a, floorAlt: 0x3b5b6b, wall: 0x6e9ba2, glow: 0x9dfff2, fog: 0x11242b }),
  Object.freeze({ floor: 0x321f3c, floorAlt: 0x59315d, wall: 0x8e5d98, glow: 0xffa8e4, fog: 0x210f27 }),
  Object.freeze({ floor: 0x291b37, floorAlt: 0x4a2c5e, wall: 0x805b9c, glow: 0xffd17a, fog: 0x180c24 })
]);

const ACT2_TITLES = Object.freeze({
  11: '复苏环廊', 12: '双谱温室', 13: '脉冲锻炉', 14: '三矢竞技场', 15: '折页档案馆',
  16: '镜轮双殿', 17: '三冠阶庭', 18: '澄空航渠', 19: '回响王庭', 20: '起源魔源'
});

const ACT2_OBJECTIVES = Object.freeze({
  11: '附刃已可用；离开前签署一份见证契约。',
  12: '共鸣双卫宝库为可选奖励；入口与上行封锁会各自显示解除条件。',
  13: '星卡开导管，月卡开旁路；两者都不是上行必需。',
  14: '三名竞技场守卫全部落败后才能上行。',
  15: '本章唯一商店；星卡封卷通向可选书库。',
  16: '棱镜门与双镜宝库只会在对应见证契约路线中开放。',
  17: '三冠守卫全部落败后才能上行。',
  18: '日曜卡开上行；星蚀卡开可选星渠。',
  19: '月辉卡 ×2 开王座执照；击败摄政官后上行。',
  20: '先完成会战，再击败主权者与起源核心。'
});

function copyMap(map) {
  return map.map((row) => [...row]);
}

function unitName(id) {
  const role = ACT2_UNIT_CATALOG[id]?.role ?? id;
  return role.replace(/(单位|守卫|统领|裁定者|剑卫|咏唱卫|刃冠|咏冠|法冠|楼梯守卫|第一相|唯一胜利触发器)$/u, '') || id;
}

function cloneEffect(effect) {
  return Object.freeze({ ...effect });
}

function magicRelicDescription(effect, bond) {
  const parts = [];
  if (effect.maxMp) parts.push(`最大 MP +${effect.maxMp}`);
  if (effect.mp) parts.push(`恢复 ${effect.mp} MP（不超过当前上限）`);
  return `${parts.join('；')}。${bond ? ` 同时完成「${bond.title}」。` : ''}`;
}

function installActTwoItems(items) {
  for (const [id, relic] of Object.entries(ACT2_RELIC_CATALOG)) {
    if (items[id]) continue;
    const effect = DEMO20_MAGIC_RELIC_EFFECTS[id];
    const bond = getAllianceBondByItem(id);
    items[id] = {
      name: relic.effectRole === 'restoreMp' ? '魔力回响器' : '以太容量遗物',
      kind: 'stat',
      relic: id,
      allyBond: bond?.allyId,
      ...cloneEffect(effect),
      description: magicRelicDescription(effect, bond)
    };
  }
}

function installActTwoEnemies(enemies) {
  for (const [id, semantic] of Object.entries(ACT2_UNIT_CATALOG)) {
    if (enemies[id]) continue;
    const numeric = DEMO20_NUMERIC_BASELINE[id];
    if (!numeric) throw new Error(`Act II numeric baseline is missing ${id}.`);
    const floor = semantic.floor ?? semantic.floorRange?.[0];
    enemies[id] = {
      name: unitName(id),
      portrait: semantic.portrait,
      faction: '魔源回响阵列',
      floor,
      ...numeric,
      boss: semantic.kind === 'boss',
      description: `${semantic.role}。悬停即可查看战斗规则、当前数值和预计耗血。`
    };
  }

  // F20's two authored arenas are a strict two-phase encounter: the first
  // Boss opens the core seal; only the core claims the final victory.
  enemies.echoRegent.defeatDialogue = 'bossEchoRegentPost';
  enemies.arcaneSovereign.defeatDialogue = 'bossArcaneSovereignPost';
  enemies.originCore.finalBoss = true;
  enemies.originCore.defeatDialogue = 'bossOriginCorePost';
}

function dialogueTurn(speaker, portrait, text) {
  return Object.freeze({ speaker, portrait, text });
}

function dialogueSequence(title, turns) {
  return Object.freeze({ title, turns: Object.freeze(turns) });
}

function installActTwoDialogues(dialogues) {
  Object.assign(dialogues, {
    floor11: dialogueSequence('第十一阵：复苏环廊', [
      dialogueTurn('残响精灵·纱雾', 'guide', '高塔上方还有起源魔源。紧急登记本该三日后必须撤销，阵列却仍在执行旧命令。'),
      dialogueTurn('绫星·璃', 'hero', '附刃已经恢复。接下来，每场战斗前都由我自己设档。')
    ]),
    floor12: dialogueSequence('第十二阵：双谱温室', [
      dialogueTurn('绫星·璃', 'hero', '双谱宝库是可选奖励；入口和上行封锁会显示各自的解除条件。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '宝库能提高 MP 上限，但不拿也能通关。')
    ]),
    floor13: dialogueSequence('第十三阵：脉冲锻炉', [
      dialogueTurn('残响精灵·纱雾', 'guide', '这里的两条回路都要卡牌，但只有一条给 MP 容量。'),
      dialogueTurn('绫星·璃', 'hero', '先看门，再决定花不花。')
    ]),
    floor14: dialogueSequence('第十四阵：三矢竞技场', [
      dialogueTurn('残响精灵·纱雾', 'guide', '三名守卫一起维持上行结界。'),
      dialogueTurn('绫星·璃', 'hero', '那就分别算清三场战斗。')
    ]),
    floor15: dialogueSequence('第十五阵：折页档案馆', [
      dialogueTurn('残响精灵·纱雾', 'guide', '本章唯一商店在这里。星卡封卷后是可选书库。'),
      dialogueTurn('绫星·璃', 'hero', '先决定要不要为书库留两张星卡。')
    ]),
    floor16: dialogueSequence('第十六阵：镜轮双殿', [
      dialogueTurn('绫星·璃', 'hero', '双镜殿的收益很高，但只会在对应见证契约路线中开放。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '打开后必须打完双镜守卫才能离开。')
    ]),
    floor17: dialogueSequence('第十七阵：三冠阶庭', [
      dialogueTurn('残响精灵·纱雾', 'guide', '刃、咏、法三冠全部落败，上行才会开。'),
      dialogueTurn('绫星·璃', 'hero', '先算哪一场最该先打。')
    ]),
    floor18: dialogueSequence('第十八阵：澄空航渠', [
      dialogueTurn('绫星·璃', 'hero', '日桥通向上行；星渠要两张星蚀卡，后方还有虚空先驱。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '击败虚空先驱会削弱回声摄政官；星渠结界会写明具体效果。')
    ]),
    floor19: dialogueSequence('第十九阵：回响王庭', [
      dialogueTurn('回声摄政官', 'echo_regent', '我保管过避难城的死亡名簿。王座执照要两张月辉卡；没有它，你到不了起源魔源。'),
      dialogueTurn('绫星·璃', 'hero', '我带来了。先把门打开。')
    ]),
    floor20: dialogueSequence('第二十阵：起源魔源', [
      dialogueTurn('奥术主权者', 'arcane_sovereign', '先过会战。剩下的两相由我和起源核心守住。'),
      dialogueTurn('绫星·璃', 'hero', '所有数值都公开。轮到我选部署。')
    ]),
    bondMilu: dialogueSequence('月镜复写', [
      dialogueTurn('猫卫长·米露', 'cat_boss', '月镜能在终局每阶段挡下一次反击。让我带上它。'),
      dialogueTurn('绫星·璃', 'hero', '好。会战时把你安排上场。')
    ]),
    bondLanin: dialogueSequence('潮汐导管', [
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '潮汐导管能让魔法终局阶段少一次反击。'),
      dialogueTurn('绫星·璃', 'hero', '会战里让你活下来，就能用上。')
    ]),
    bondYanli: dialogueSequence('赤焰蓄能', [
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '赤焰蓄能会削减终局生命。让我去会战。'),
      dialogueTurn('绫星·璃', 'hero', '那就为你留一格。')
    ]),
    bondYayu: dialogueSequence('影线校准', [
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '影线校准能让起源核心失去二连击。'),
      dialogueTurn('绫星·璃', 'hero', '会战时保持存活，就能兑现。')
    ]),
    warCouncil: dialogueSequence('王座前：共鸣会战', [
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '敌方顺序和 MP 配额都在面板里。'),
      dialogueTurn('绫星·璃', 'hero', '那就预演后再确认。')
    ]),
    bossEchoRegentPost: dialogueSequence('回响王庭：执照碎裂', [
      dialogueTurn('回声摄政官', 'echo_regent', '执照碎了。上行门已经打开。'),
      dialogueTurn('绫星·璃', 'hero', '起源魔源就在上面。')
    ]),
    bossArcaneSovereignPost: dialogueSequence('主权封印解除', [
      dialogueTurn('奥术主权者', 'arcane_sovereign', '我的封印解除了，核心会接着战斗。'),
      dialogueTurn('绫星·璃', 'hero', '那就打完第二阶段。')
    ]),
    bossOriginCorePost: dialogueSequence('终章：魔源再临', [
      dialogueTurn('绫星·璃', 'hero', '起源核心安静下来了。它保存灾难的记录；上面还有一座登记库。'),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '去把最后的命令也关掉。')
    ])
  });
}

function runtimePuzzles(number, spatialFloor, contract) {
  const puzzles = { ...(spatialFloor.puzzles ?? {}) };
  const guardianGates = { ...(contract.guardianGates ?? {}) };
  if (spatialFloor.exitBarrier && contract.exitGuardians?.length) {
    guardianGates[spatialFloor.exitBarrier.replace('gate:', '')] = [...contract.exitGuardians];
  }
  if (number === 20) guardianGates.f20SovereignSeal = ['arcaneSovereign'];
  if (Object.keys(guardianGates).length) puzzles.guardianGates = guardianGates;
  return puzzles;
}

function buildRuntimeFloor(spatialFloor, index) {
  const number = spatialFloor.number;
  const contract = DEMO20_PROGRESSION_TOPOLOGY.floors[number];
  return {
    id: number - 1,
    number,
    title: ACT2_TITLES[number],
    objective: ACT2_OBJECTIVES[number],
    intro: `floor${number}`,
    boss: number === 20 ? 'originCore' : undefined,
    exitGuardians: [...(contract.exitGuardians ?? [])],
    finalPhases: contract.finalPhases ? [...contract.finalPhases] : undefined,
    roomPlan: [...spatialFloor.roomPlan],
    puzzles: runtimePuzzles(number, spatialFloor, contract),
    shopOptionIds: number === 15 ? ['hp', 'atk', 'def', 'mpRestore', 'maxMp'] : undefined,
    theme: { ...ACT2_THEMES[index] },
    map: copyMap(spatialFloor.map),
    demoContentId: DEMO20_CONTENT_ID,
    demoProgressionTopologyId: DEMO20_PROGRESSION_TOPOLOGY.id,
    demoSpatialTopologyId: DEMO20_SPATIAL_TOPOLOGY.id
  };
}

function installF10Transition(floors, enemies) {
  const floor10 = floors.find((floor) => floor.number === 10);
  if (!floor10 || !enemies.voidCore) throw new Error('Act II runtime requires the assembled F10 void core.');
  floor10.exitGuardians = ['voidCore'];
  floor10.objective = '击败无声女王与黯星核心；胜利后解锁附刃并上行。';
  floor10.demoActTwoTransition = 'awakenMagic';
  delete enemies.voidCore.finalBoss;
  enemies.voidCore.awakenMagic = { maxMp: 100, restore: true };
  enemies.voidCore.revealStair = true;
  enemies.voidCore.defeatDialogue = 'bossQueenPostDemo';
  enemies.voidCore.description = '第一章终局核心。击败后恢复 100/100 MP、解锁可调档的魔力附刃，并显现前往复苏环廊的阶梯。';
}

/**
 * Turns the frozen Act II semantic/spatial records into one playable 20-floor
 * campaign.  Topology validators run before any mutable content is written;
 * combat tuning is intentionally isolated in DEMO20_NUMERIC_BASELINE.
 */
export function applyDemoTwentyFloorContent({ enemies, floors, items, dialogues } = {}) {
  if (!enemies || !Array.isArray(floors) || !items || !dialogues) {
    throw new Error('20F runtime content requires enemies, floors, items and dialogues.');
  }
  if (floors.length === 20 && floors[19]?.demoContentId === DEMO20_CONTENT_ID) {
    return Object.freeze({ applied: false, id: DEMO20_CONTENT_ID, floors });
  }
  if (floors.length !== 10 || floors[9]?.number !== 10) {
    throw new Error('20F runtime content expects a fully assembled ten-floor first act.');
  }
  const progression = validateDemoTwentyFloorProgressionTopology();
  const spatial = validateDemoTwentyFloorSpatialTopology();
  if (!progression.ok || !spatial.ok) {
    throw new Error(`20F topology lock rejected: ${[...progression.violations, ...spatial.violations].join(', ')}`);
  }

  installF10Transition(floors, enemies);
  installActTwoItems(items);
  installActTwoEnemies(enemies);
  installActTwoDialogues(dialogues);

  const actTwoFloors = DEMO20_SPATIAL_TOPOLOGY.floors.map((floor, index) => buildRuntimeFloor(floor, index));
  floors.push(...actTwoFloors);

  return Object.freeze({
    applied: true,
    id: DEMO20_CONTENT_ID,
    numericBaselineId: DEMO20_NUMERIC_BASELINE_ID,
    floors: Object.freeze(actTwoFloors),
    transition: Object.freeze({ floor: 10, boss: 'voidCore', mp: 100, maxMp: 100, stair: 'revealed-on-defeat' })
  });
}
