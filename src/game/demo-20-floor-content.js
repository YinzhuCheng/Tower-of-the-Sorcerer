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

function dialogueTurn(speaker, portrait, text, extras = {}) {
  return Object.freeze({ speaker, portrait, text, ...extras });
}

function dialogueSequence(title, turns) {
  return Object.freeze({ title, turns: Object.freeze(turns) });
}

function installActTwoDialogues(dialogues) {
  Object.assign(dialogues, {
    floor11: dialogueSequence('第十一阵：复苏环廊', [
      dialogueTurn('残响精灵·纱雾', 'guide', '高塔上方还有起源魔源。紧急登记本该三日后必须撤销，阵列却仍在执行旧命令。', { expression: 'gentle' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '黯星留下的副本显示：延长令需要主权签名和三位见证者。我从未见过完整副本。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '那就去起源魔源找签名，再找出能保留记录的关闭方法。', { expression: 'resolve' })
    ]),
    floor12: dialogueSequence('第十二阵：双谱温室', [
      dialogueTurn('猫卫长·米露', 'cat_boss', '温室的补给簿还在按三年前的名单配药，可离港确认后的船舱早已空了。'),
      dialogueTurn('绫星·璃', 'hero', '系统没分清“可能有人归来”和“有人仍被困住”。这不是你们的错。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '双谱宝库记录了见证者之一的行踪；要不要绕路，由你决定。')
    ]),
    floor13: dialogueSequence('第十三阵：脉冲锻炉', [
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '锻炉保存着那夜的供能曲线。撤离结束后，主回路本该降到归档模式。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '可有人把“归档”改成“持续救援”，连关闭按钮也一并封住。'),
      dialogueTurn('绫星·璃', 'hero', '改动一定留下了权限痕迹。继续上行。')
    ]),
    floor14: dialogueSequence('第十四阵：三矢竞技场', [
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '三冠守卫原是三位见证者的代理。每一冠各保管延长令的一段校验。'),
      dialogueTurn('绫星·璃', 'hero', '所以不是打倒谁就能改写过去；我要把三段校验全部拿齐。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '集齐后，签署记录才会显示完整。')
    ]),
    floor15: dialogueSequence('第十五阵：折页档案馆', [
      dialogueTurn('阵间商人·珂珂', 'merchant', '我给灰港送过最后一批药。船走后，订单却仍在自动扣货，好像谁都没离开。'),
      dialogueTurn('绫星·璃', 'hero', '登记网把“未结案”当成“仍在现场”，难怪整座塔都在替它耗尽。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '星卡封卷里有原始配送回执，能证明最后一船已离港。')
    ]),
    floor16: dialogueSequence('第十六阵：镜轮双殿', [
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '我们四人曾是见证者候补。若系统被修正，我们愿意为新的结案共同作证。'),
      dialogueTurn('绫星·璃', 'hero', '这次不让任何人替所有人签字。你们愿意，就把名字写进新协议。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '镜轮会记录这份见证契约，并在会战中回应它。')
    ]),
    floor17: dialogueSequence('第十七阵：三冠阶庭', [
      dialogueTurn('天穹魔女·露米', 'astral_boss', '三冠的校验拼合后显示：主权签名在前，三位见证者的自动同意在后。'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '自动同意？我只记得自己按下“继续救援”，从未同意无限延长。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '有人把临时许可伪装成共识。证据终于完整了。', { expression: 'resolve' })
    ]),
    floor18: dialogueSequence('第十八阵：澄空航渠', [
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '虚空先驱截住了离港回执，才让登记网永远等不到“全员安全”。'),
      dialogueTurn('绫星·璃', 'hero', '它不是意外遗失，是被封进了权限链。先驱之后就是保管死亡名簿的人。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '星渠的结界会显示削弱摄政官的具体效果。')
    ]),
    floor19: dialogueSequence('第十九阵：回响王庭', [
      dialogueTurn('旁白', null, '月光落进王庭，地上的玻璃名牌逐一亮起。它们没有命令，只有被扣住的最后记录。', { kind: 'narration' }),
      dialogueTurn('回声摄政官', 'echo_regent', '我保管过避难城的死亡名簿。灰港没有被抹掉：离港者、罹难者、仍在等待的人，都有最后记录。', { expression: 'grave' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '原来我守着的不是失踪者，而是一道故意不让人结案的门。', { cg: '/assets/anime/cg/liyue-echo-ledger-cg.webp', expression: 'knowing' }),
      dialogueTurn('绫星·璃', 'hero', '把名簿留在这里，交还给该被记住的人。然后把王座执照交给我们。', { expression: 'resolve' }),
      dialogueTurn('回声摄政官', 'echo_regent', '执照归还。签署人就在起源魔源；这一次，别让任何人替所有人作答。', { expression: 'release' })
    ]),
    floor20: dialogueSequence('第二十阵：起源魔源', [
      dialogueTurn('旁白', null, '起源晶核把一枚破裂的印戒悬在半空。每一道光环都重复着同一句旧命令，却已经听不清声音。', { kind: 'narration' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '是我签了无限延长。战乱时我怕漏掉一个求援者，便删去了终止期限。', { expression: 'regret' }),
      dialogueTurn('绫星·璃', 'hero', '害怕不是罪；把恐惧写成所有人的永久命令，才是。先交出起源权限。', { expression: 'resolve' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '主权者，和我一起看完灰港的结案。不是为了宽恕你，而是为了终于让它停止。', { expression: 'grave' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '封印由我开启，核心却仍会反抗。请把“归档”写进它能听懂的地方。', { cg: '/assets/anime/cg/liyue-noctia-sovereign-cg.webp', expression: 'acceptance' })
    ]),
    bondMilu: dialogueSequence('月镜复写', [
      dialogueTurn('猫卫长·米露', 'cat_boss', '月镜能在终局每阶段挡下一次反击。让我带上它，替夜航的人守住回程。'),
      dialogueTurn('绫星·璃', 'hero', '好。会战时把你安排上场。')
    ]),
    bondLanin: dialogueSequence('潮汐导管', [
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '潮汐导管能让魔法终局阶段少一次反击。我想让真正的航线重新响起。'),
      dialogueTurn('绫星·璃', 'hero', '会战里让你活下来，就能用上。')
    ]),
    bondYanli: dialogueSequence('赤焰蓄能', [
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '赤焰蓄能会削减终局生命。炉火不该再白烧，我去会战。'),
      dialogueTurn('绫星·璃', 'hero', '那就为你留一格。')
    ]),
    bondYayu: dialogueSequence('影线校准', [
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '影线校准能让起源核心失去二连击。我会把伪造的权限线一根根拆开。'),
      dialogueTurn('绫星·璃', 'hero', '会战时保持存活，就能兑现。')
    ]),
    warCouncil: dialogueSequence('王座前：共鸣会战', [
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '这一次，谁上场、谁保留力量，都由你们自己决定。'),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '敌方顺序和 MP 配额都在面板里。'),
      dialogueTurn('绫星·璃', 'hero', '那就预演后再确认。')
    ]),
    bossEchoRegentPost: dialogueSequence('回响王庭：执照归还', [
      dialogueTurn('回声摄政官', 'echo_regent', '执照不该再属于任何一个人。名簿会留在这里，不再拿来驱使活着的人。', { expression: 'release' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我会亲自把灰港的每一页放回归档。', { expression: 'knowing' }),
      dialogueTurn('绫星·璃', 'hero', '起源魔源就在上面。下一页，轮到签署人回答。', { expression: 'resolve' })
    ]),
    bossArcaneSovereignPost: dialogueSequence('主权封印解除', [
      dialogueTurn('奥术主权者', 'arcane_sovereign', '我的封印解除了。起源核心仍把“无限延长”当作最高命令。', { expression: 'acceptance' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '核心只能读取旧的二选一。归档模式需要活着的见证一起写入。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '那就打完第二阶段，夺回它的解释权。', { expression: 'resolve' })
    ]),
    bossOriginCorePost: dialogueSequence('终章：魔源再临', [
      dialogueTurn('绫星·璃', 'hero', '起源核心安静下来了。它保存灾难的记录；上面还有一座未投递登记库。'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '那里能把记录转为归档，而不是删除吗？', { expression: 'sorrow' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '能。去把最后的命令关掉。')
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
