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
      dialogueTurn('残响精灵·纱雾', 'guide', '璃，黯星阵的十重封印已经解除；但它曾连接过一座更老的应急登记库。起源魔源正在替失去主人的阵列继续发号施令。'),
      dialogueTurn('绫星·璃', 'hero', '所以魔力回来了，选择却还没有。你一直知道这件事？'),
      dialogueTurn('残响精灵·纱雾', 'guide', '我写过“紧急登记”——灾难时把结界与治疗先分给最需要的人，三日后必须撤销。诺克缇娅把它变成永久剥夺；而我选择了沉默。'),
      dialogueTurn('绫星·璃', 'hero', '那就别再替别人决定。附刃由我在战前自己设定，风险也由我自己承担。')
    ]),
    floor12: dialogueSequence('第十二阵：双谱温室', [
      dialogueTurn('绫星·璃', 'hero', '这两扇门不问我有没有资格，只问我愿意为哪条路付出资源。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '双谱宝库能扩充魔力上限，但不是通行税。保留生命、卡片与 MP，都不是怯懦，而是你在决定未来还能保留多少选择。')
    ]),
    floor13: dialogueSequence('第十三阵：脉冲锻炉', [
      dialogueTurn('残响精灵·纱雾', 'guide', '起源系统把卡片当成许可额度：谁握着卡，谁就有权决定哪一条回路能活。'),
      dialogueTurn('绫星·璃', 'hero', '卡片可以是门钥匙，不该是替别人盖章的权力。这里的每一张，我都要看清自己放弃了什么。')
    ]),
    floor14: dialogueSequence('第十四阵：三矢竞技场', [
      dialogueTurn('残响精灵·纱雾', 'guide', '三名裁定者把旧城的灾难复刻成考试：护盾、武器、药剂，三者只能先救一个。'),
      dialogueTurn('绫星·璃', 'hero', '排序救援并不等于拥有永远排序人的资格。我要打碎的是那份不必解释、也不能反驳的授权。')
    ]),
    floor15: dialogueSequence('第十五阵：折页档案馆', [
      dialogueTurn('残响精灵·纱雾', 'guide', '档案里不是抽象的“损失”。每一笔延期治疗、每一道拒绝通行，都有人的名字。'),
      dialogueTurn('绫星·璃', 'hero', '我不会假装魔法没有风险。但规则应当公开，执行规则的人也必须面对自己留下的后果。')
    ]),
    floor16: dialogueSequence('第十六阵：镜轮双殿', [
      dialogueTurn('绫星·璃', 'hero', '镜泉给出两种未来：把魔力全留给自己，或带着更少的把握继续前进。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '自由不是保证每次都选对；是允许你看见代价，再由你作出选择。')
    ]),
    floor17: dialogueSequence('第十七阵：三冠阶庭', [
      dialogueTurn('残响精灵·纱雾', 'guide', '刃、咏、法三冠各自握有一段总授权。单独击败任何一个都无济于事。'),
      dialogueTurn('绫星·璃', 'hero', '这倒像一条正确的规则：没有一个人能独自关掉世界。区别只在于，它也不能独自把世界关起来。')
    ]),
    floor18: dialogueSequence('第十八阵：澄空航渠', [
      dialogueTurn('绫星·璃', 'hero', '日桥直通上行，星渠藏着更危险的回报。终局前保留卡片和保留 MP 一样，都是主动的选择。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '你开始明白了：不把所有资源押进最快的路，也是一种承担。')
    ]),
    floor19: dialogueSequence('第十九阵：回响王庭', [
      dialogueTurn('回声摄政官', 'echo_regent', '我签过避难城的死亡名簿。没有执照，强者优先；有了执照，至少孩子先得到结界。你把这叫控制，我把它叫责任。'),
      dialogueTurn('绫星·璃', 'hero', '责任不是把所有人变成记录。账本可以公开，决定必须能被质问、被更正。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '这套系统最初的谎言由我写下：我承诺它只是临时措施，然后允许它不再归还。'),
      dialogueTurn('回声摄政官', 'echo_regent', '灾难没有结束前，“临时”就是必要。若你废除主权，谁为下一场火负责？')
    ]),
    floor20: dialogueSequence('第二十阵：起源魔源', [
      dialogueTurn('奥术主权者', 'arcane_sovereign', '我见过一座城因无节制的术式而消失。于是我建立授权、配给与强制停机；每一步都有人得救。'),
      dialogueTurn('绫星·璃', 'hero', '也有人从此失去被询问的资格。你把紧急权力做成王座，再把所有恐惧当成它永不归还的理由。'),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '那你准备拿什么替代命令？别把“自由”当成逃避后果的好听名字。'),
      dialogueTurn('绫星·璃', 'hero', '公开的规则、能被拒绝的同意、共同承担的后果。它不完美，但没有任何人可以躲在完美的命令后面。')
    ]),
    bossEchoRegentPost: dialogueSequence('回响王庭：执照碎裂', [
      dialogueTurn('回声摄政官', 'echo_regent', '你没有消灭危险，只是让权力也暴露在危险之下。'),
      dialogueTurn('绫星·璃', 'hero', '对。没有人能免于风险；包括替别人作决定的人。')
    ]),
    bossArcaneSovereignPost: dialogueSequence('主权封印解除', [
      dialogueTurn('奥术主权者', 'arcane_sovereign', '主权并非力量本身，而是把选择从别人手中夺走。我曾以为只有我能承担那份重量。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '承担不是独占。我们都曾把恐惧交给一座看似不会犯错的王座。'),
      dialogueTurn('绫星·璃', 'hero', '那就让起源核心留下记录，不再留下命令。')
    ]),
    bossOriginCorePost: dialogueSequence('终章：魔源再临', [
      dialogueTurn('绫星·璃', 'hero', '起源核心安静下来。它保存灾难的记录，却不再替任何人下达命令。'),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '若下一场灾难再来，别让自由成为拒绝伸手的借口。'),
      dialogueTurn('绫星·璃', 'hero', '也别让保护成为夺走选择的借口。魔法会有代价，但承担它的人应该有名字、有声音。')
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
