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

export const DEMO20_CONTENT_ID = 'demo-20f-magic-act2-runtime-v1';
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
  11: '以新苏醒的魔力附刃穿过校准回廊；月痕结界是前往 F12 的唯一门槛。',
  12: '主路上行；可选挑战共鸣双卫，打开宝库取得以太棱镜。',
  13: '管理星、月卡片账本，在双回路中选择投资与绕行。',
  14: '三名竞技场守卫全部落败后，三矢封印才会开放 F15 楼梯。',
  15: '在本章唯一商店选择属性、补魔或扩容，取得蓄能书库的关键遗物。',
  16: '越过棱镜门槛；双镜殿是可选的高价值 MP 宝库。',
  17: '三冠守卫共同维持上行封印，必须全部击败。',
  18: '在日桥与星渠之间分配卡片，保留终局前的魔力资源。',
  19: '先取得王座执照、击败回声摄政官，才可进入起源魔源。',
  20: '穿过主权者封印，依次击败奥术主权者与起源核心。'
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

function installActTwoItems(items) {
  for (const [id, relic] of Object.entries(ACT2_RELIC_CATALOG)) {
    if (items[id]) continue;
    const effect = DEMO20_MAGIC_RELIC_EFFECTS[id];
    items[id] = {
      name: relic.effectRole === 'restoreMp' ? '魔力回响器' : '以太容量遗物',
      kind: 'stat',
      relic: id,
      ...cloneEffect(effect),
      description: relic.effectRole === 'restoreMp'
        ? '恢复魔力；具体数值由第二章数值收敛配置统一管理。'
        : '提升魔力容量或恢复魔力；具体数值由第二章数值收敛配置统一管理。'
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
      description: `${semantic.role}。其战斗数值属于待收敛的第二章基线。`
    };
  }

  // F20's two authored arenas are a strict two-phase encounter: the first
  // Boss opens the core seal; only the core claims the final victory.
  enemies.arcaneSovereign.defeatDialogue = 'bossArcaneSovereignPost';
  enemies.originCore.finalBoss = true;
  enemies.originCore.defeatDialogue = 'bossOriginCorePost';
}

function installActTwoDialogues(dialogues) {
  Object.assign(dialogues, {
    floor11: { speaker: '残响精灵·纱雾', portrait: 'guide', title: '第十一阵：复苏环廊', text: '黯星核心已经解除，璃的魔力以 100/100 的状态归来。\n\n附刃只能在战前调整：每档消耗 10 MP，并在每次命中时附加同等伤害。它不会穿透敌人的防御阈值。' },
    floor12: { speaker: '绫星·璃', portrait: 'hero', title: '第十二阵：双谱温室', text: '主路已经开放，但双谱宝库仍被两名守卫维持。是否投入生命与魔力，换取更高的魔力上限，由我自己决定。' },
    floor13: { speaker: '残响精灵·纱雾', portrait: 'guide', title: '第十三阵：脉冲锻炉', text: '卡片不是单纯的钥匙。星导管和月相旁路分别锁住不同收益与风险，花错一张，后续的附刃容量也会失去。' },
    floor14: { speaker: '三矢裁定者', portrait: 'triune_arbiter', title: '第十四阵：三矢竞技场', text: '三座战场共同供能。击败其中一人不会打开上楼结界；所有守卫都必须解除。' },
    floor15: { speaker: '档案馆主机', portrait: 'guide', title: '第十五阵：折页档案馆', text: '本章唯一一次转换机会：属性、补魔与扩容不能全部购买。留下什么资源，决定你面对后半程时有多少种解法。' },
    floor16: { speaker: '绫星·璃', portrait: 'hero', title: '第十六阵：镜轮双殿', text: '镜泉宝库不是主线必经。它把风险、魔力容量与未来的容错放在同一笔交易中。' },
    floor17: { speaker: '残响精灵·纱雾', portrait: 'guide', title: '第十七阵：三冠阶庭', text: '刃、咏、法三冠共同维持上行封印。这里没有单点捷径。' },
    floor18: { speaker: '绫星·璃', portrait: 'hero', title: '第十八阵：澄空航渠', text: '日桥通向上行，星渠则通向虚空先驱。保留卡片与保留 MP 一样，都是终局前的主动选择。' },
    floor19: { speaker: '回声摄政官', portrait: 'echo_regent', title: '第十九阵：回响王庭', text: '王座执照、摄政官与上行封印依次锁住通路。终局不会因为你看见楼梯就允许你通过。' },
    floor20: { speaker: '奥术主权者', portrait: 'arcane_sovereign', title: '第二十阵：起源魔源', text: '你夺回了魔法，但并未学会支配它。来吧，让每一次附刃和每一张卡片证明你的选择。' },
    bossArcaneSovereignPost: { speaker: '奥术主权者', portrait: 'arcane_sovereign', title: '主权封印解除', text: '主权并非力量本身，而是把选择从别人手中夺走。你已经证明它不该属于我。' },
    bossOriginCorePost: { speaker: '绫星·璃', portrait: 'hero', title: '终章：魔源再临', text: '起源核心安静下来。魔法不再是任何王座的命令，而是每个人可以承担后果的选择。' }
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
  floor10.objective = '击败无声女王与黯星核心；核心崩解后将恢复 100/100 MP，并在王座显现通往第二章的上楼阶。';
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
