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
      dialogueTurn('旁白', null, '黯星核心碎裂后，王庭的警报终于沉默。楼梯上方却仍有蓝光明灭，像一封迟到三年、始终找不到收件人的求援信。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '绫星·璃踏入复苏环廊。墙上并排着三幅已经褪色的流程图：航路确认船去了哪里，补给确认物资交给了谁，名簿确认每个人最后处于什么状态。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '这就是灰港紧急登记网的总线。三年前，魔力风暴切断通讯，高塔负责导航、配发避难物资，并把离港者、罹难者和失联者分别记入名簿。', { expression: 'focus' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '紧急状态允许守护者先救人、后补手续，但不能无期持续。最后一船离港后，三日是用来补送回执和核对名字的缓冲期；缓冲期结束，紧急登记三日后必须撤销。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '可我当时在王庭看到的只有两个按钮：“继续救援”和“撤销登记”。第二个按钮下面显示“未结案名字将被清除”。我以为停下命令，就是要把灰港的人再删掉一次。', { expression: 'sorrow' }),
      dialogueTurn('旁白', null, '诺克缇娅伸手碰向墙上的第四格。本该写着“封存原件”的位置只剩一道撕裂的白痕，她的手指悬在那里，许久没有收回。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '原来完整流程不是“执行或删除”。它本该先把回执、补给账和人员状态封存，再撤销强制命令。有人把中间的归档步骤拆掉了。', { expression: 'resolve' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '前十层已经给了我们两件确定的事：最后一船确实发出了“全员离港”，女王也不是无限延长令的签署人。黯印下面的主权签名属于奥术主权者。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我的王庭只能执行上层命令。奥术主权者管理起源魔源，有权在断联时延长紧急状态；按旧规，她之后仍需航路、补给、名簿三席对同一份命令分别确认。', { expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我收到的却是一枚已经发亮的“三席同意”总印。我没看到他们各自回答了什么，也不知道他们何时回答。我把一枚亮着的印，错当成了三个人的意思。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '那就不靠总印猜过去。我们沿着实物账、供能记录和三席的原始时序往上查，找出命令怎样被改、回执怎样被拦，再把“停止执行”和“保留记录”重新分开。', { expression: 'resolve' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '离开环廊前，你还要签一份见证契约。它不是替任何人定罪，而是先决定由哪名同伴负责追查一条专门证据路线，并在终局亲自作证。三条路的代价和收益都会先展示，主路不会因选择而封闭。', { expression: 'gentle' }),
      dialogueTurn('绫星·璃', 'hero', '选中的人也不会被自动签上名字。我会当面问她是否愿意，会战时也要让她活着走完自己的那一段。先去双谱温室；墙上最新的错误命令，正把药品送往那里。', { expression: 'resolve' })
    ]),
    floor12: dialogueSequence('第十二阵：双谱温室', [
      dialogueTurn('旁白', null, '玻璃穹顶下，两排藤蔓沿着不同的刻度开花。左边是补给席使用的避难名单，右边是航路席发来的船次；只有姓名、船号和时间同时对上，温室才该配药。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '可此刻左边的藤叶绿得刺眼，右边却一片灰白。机械花苞每隔几息便吐出一支新药，地上的药瓶已经滚到门边。', { kind: 'narration' }),
      dialogueTurn('猫卫长·米露', 'cat_boss', '我循着药味找上来的。第一层的卫队一直收到补给，我以为这证明灰港还有人。要是求援者真的活着，我就不能丢下他们。'),
      dialogueTurn('猫卫长·米露', 'cat_boss', '可你们看这只瓶子。标签写着“第七船，二十四人”，受领人栏有姓名，对面的航次栏却是空的。药方像是在给一群没有船、也没有去处的人反复续命。'),
      dialogueTurn('旁白', null, '米露用指甲刮开瓶底的蜡。下面不是一张新处方，而是同一张处方的日期层层相叠：连续三年，每天都被盖上“未结案，重新配发”。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '这不是新求援。每支药的人数、剂量和船次标记都一模一样，只有重印日期在变。登记网把“总账没有结算”当成了“人还在等药”。'),
      dialogueTurn('猫卫长·米露', 'cat_boss', '所以我们三年里吃掉的补给、守住的空门，还有被我抓伤的每一个闯入者，都不是为了某个仍在等药的孩子……只是在供养一张不肯合上的旧账。'),
      dialogueTurn('旁白', null, '她的耳朵压了下去，却没有把瓶子摔掉。米露一支一支将药放回架上，按标签排好，像是不愿让自己的错判再毁掉另一份证据。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '温室的主路保存配药编号和魔力来源。通过前方的守卫后，我们就能带走这批数据，去脉冲锻炉对照它们何时获得供能。', { expression: 'focus' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '双谱宝库另外收着一枚月镜。它能复写航路席的防护频率，也可以成为米露在会战中的信物。那是所有路线都可以选的绕路，不走也不影响继续追查。', { expression: 'gentle' }),
      dialogueTurn('猫卫长·米露', 'cat_boss', '把第七船的药品编号交给我一份。我要记住，补给只能证明有人下过命令，不能单独证明那个人此刻仍在受困。下次我会先找到收货的人。'),
      dialogueTurn('绫星·璃', 'hero', '我们也带上一支完整的重印药瓶。它会向锻炉证明：温室没收到灰港的新求援，只收到了由旧指令自动生成的新日期。', { expression: 'resolve' })
    ]),
    floor13: dialogueSequence('第十三阵：脉冲锻炉', [
      dialogueTurn('旁白', null, '穿过温室的阵列后，绫星·璃取得了完整的配药流向。其中每一笔魔力都来自同一个地方：脉冲锻炉；每次发放间隔也与“重新配发”的日期完全一致。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '越靠近炉心，地板的震动越像急促心跳。星、月两条回路仍向已经无人领取物资的灰港旧区送去热量和魔力。', { kind: 'narration' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '我认得这个节奏。最后一船出港那晚，我是锻炉的值守人。我把火力抬到最高，好让码头的引导灯在风暴里多亮三天。'),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '这三天不是判断人该不该被忘记的期限，而是供能部门的安全约定：三日后必须停止满载，先检修炉管，再转入只保留档案的低功率模式。可我等了三年，计时从没到过终点。'),
      dialogueTurn('旁白', null, '焰璃把长枪插进传能缝隙，挑出一条焦黑的铜带。上面的供能曲线在最后一船回执到达前一刻骤然抬满，此后再没下降。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '温室的账对上了。每当锻炉将旧命令当成新一天的救援，温室就会把同一张处方重印一次。两个系统没有各自出错，它们在忠实执行同一道错误指令。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '铜带里的修改不只删掉了三日时限。它还把“归档待机”改成“持续救援”，封住现场停机键，甚至设定“未确认全员安全前自动重启”。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '现场值守人做不到同时改时限、改模式、禁用停机。这段写入绕过了女王的王庭，来自起源魔源的主权权限。这是权限痕迹，不是我们的推测。', { expression: 'resolve' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '我一直以为炉火还亮着，就说明码头还有人需要它。所以我不让任何人靠近炉心，还把每次试图断能都当成破坏救援。'),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '现在我终于看懂了：火不是因为有人回答才亮，而是命令不允许它熄灭。我这三年烧掉的不只是矿石；温室靠它重复配药，楼下的守卫也靠它反复站起来。'),
      dialogueTurn('旁白', null, '焰璃没有立刻熄炉。她先切断通往空管道的支路，又保留了档案环的微光。火声慢慢从咆哮降成均匀的呼吸，墙上第一次出现了完整的写入时间。', { kind: 'narration' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '修改记录在写入后被送往三矢竞技场，由航路、补给、名簿三席的代理守卫校验。那三枚印一定记得谁先写入，谁后回答。'),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '去把三段时序全部取回来。我会守在这里压住炉火，不让它继续喂养旧阵列，也不会关掉那条保存记录的微火。这次，我等的是你们带回答案。')
    ]),
    floor14: dialogueSequence('第十四阵：三矢竞技场', [
      dialogueTurn('旁白', null, '锻炉铜带上的去向签将一行人引到三矢竞技场。这里并非为观众表演武技，而是紧急命令的离线校验场：即使高塔主线被人改写，原始回答仍会被拆成三份保存。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '三条石路在中央封台前汇合。左路守卫胸前是船舵，代表航路席；右路是药瓶，代表补给席；中路是合起的名簿，代表人员状态席。', { kind: 'narration' }),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '这三名代理守卫不是当年的签署人，也不会替他们辩解。他们的职责只有一个：在来者有能力完整带走记录之前，不交出任何一段原始时序。'),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '这套规则本来是用来防止一个人擅自延长救援。主权签名只能发起请求；航路、补给、名簿三席必须对同一文本、同一目的、同一时段各自回答，延长才能生效。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '问题在于，王庭收到的总印只显示“三席同意”，不显示每一席回答的原文和时间。单看任何一枚分印，又会被总印的结论覆盖。只有三枚同时回到中央封台，我们才能不经过总印读原文。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '当年我一直以为，总印发亮就意味着三个部门都看过那道“无限延长”。我没有看到他们的文字，却用他们的名义让整座塔继续执行。', { expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我不知道那是一场精心设计的欺骗，还是一次被错误规则放大的仓促决定。但不管答案是什么，我不会再把“我以为”当成他们的证言。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '也不逼这些守卫替当年的人改口。我们要赢的是三份原始记录，不是三份对我们有利的口供。它们写了什么，我们就带走什么。', { expression: 'resolve' }),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '三名代理守卫全部落败后，他们的分印才会同时回到中央封台，展开可校对的审计链。上行结界也会在那时解除。他们按旧规不会留手，你也不必把破坏印记当成捷径。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '先查看三名守卫的规则和预计损耗。他们分别检验先手、魔法承压和连续攻击，每一场都要给下一场留下足够的生命与魔力。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '取得三枚印后，我们就带去折页档案馆。那里的物资原账有交付对象和实际时间，能告诉我们三席的回答是在什么情况下按下的。', { expression: 'resolve' })
    ]),
    floor15: dialogueSequence('第十五阵：折页档案馆', [
      dialogueTurn('旁白', null, '三名代理守卫相继倒下后，中央封台展开了三段没有经过总印编辑的时序。第一段有主权签名与“无限延长”，后两段则记着三席各自按下按钮的时刻。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '时间对不上。奥术主权者先签了延长，三席在十七分钟后才作出回答。我们还不知道他们当时看见的是什么文字，所以不能只凭时差就说他们被代签。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '折页档案馆保存实际交货、扣账和停电记录。我们要用它还原那十七分钟里发生了什么，而不是给三枚印编一个方便的故事。', { expression: 'resolve' }),
      dialogueTurn('旁白', null, '档案馆里没有史书，只有一排排送货单、药瓶封签和空箱回条。红封账本每翻过一轮，远处的货架就发出一声空洞的扣货响。', { kind: 'narration' }),
      dialogueTurn('阵间商人·珂珂', 'merchant', '别碰那本红皮账。它每翻一页，就从我名下扣掉又一批药。三年前我是灰港的供应商，最后二十四份药是我亲手送上第七船的。'),
      dialogueTurn('阵间商人·珂珂', 'merchant', '船长当场点过五只药箱，还笑我把止痛药捆得像贵重珠宝。她在这张纸单上盖了收货印，又将副本交给航站。我没有可能把同一批药在三年后每天交付一次。'),
      dialogueTurn('旁白', null, '珂珂从柜台夹层抽出一张磨起毛边的单据。船号、五只药箱、二十四人、船长签名和交接时刻一应俱全；唯独高塔总账的“结算”栏始终空白。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '实物已经交付，船上的人签了收货，商人也留着原件。只有高塔总账因为缺少航站回执而拒绝结算。所以温室不断重做，锻炉不断供能，珂珂的库存却不断消失。'),
      dialogueTurn('阵间商人·珂珂', 'merchant', '最初几天，我以为是航站忙乱，还真的按新订单重新装箱。后来我发现订单上连船长笔迹的折角都一样，才知道它只是把旧纸当新纸。'),
      dialogueTurn('阵间商人·珂珂', 'merchant', '我只好把空箱放在自动扣货口，把真药藏进柜台，免得后来真的伤员一瓶都买不到。我不敢停账，因为页面警告我：“终止配送将放弃未救助人员。”'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '又是同样的话。它让我相信“撤销就会删除名字”，也让你相信“停止交货就是放弃伤员”。它把我们各自害怕的事写在按钮下面，却不让我们看见彼此的账。', { expression: 'sorrow' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '停电账也找到了。主权签名出现十七分钟后，高塔主线断电。三席当时只能看见所属设备的现场提示，没有人能读取主权者先前写下的“无限延长”。', { expression: 'focus' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '三席在停电中按下的很可能只是“临时继续”，用来撑到供电恢复。但要看到它们当时的完整文本，还需要上层三冠阶庭的原始解析器。', { expression: 'focus' }),
      dialogueTurn('阵间商人·珂珂', 'merchant', '把这张原单带上。我不是什么大人物，但我记得那批药交给了谁，也记得自己为什么害怕停手。这些小事如果没人留下，又会被一枚大印盖过去。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '星卡封卷内还有原始配送回执和赤焰蓄能信物。只有签署“赤焰裂印”见证契约时才能开启；它是可选专门路线，不是主线证据的门票。上行前也可在此购置补给，这是本章唯一间商店。', { expression: 'gentle' }),
      dialogueTurn('绫星·璃', 'hero', '我们先带着原单上镜轮双殿。旧校验告诉我们当年的答案怎样被挪用；镜轮要做的，是让今天愿意作证的人亲口说话。', { expression: 'resolve' })
    ]),
    floor16: dialogueSequence('第十六阵：镜轮双殿', [
      dialogueTurn('旁白', null, '珂珂的交货原单被放进镜轮双殿中央。左镜照出说话者此刻的容貌与动作，右镜同时写下声音、时间和她正在查看的证据。两面镜子都不从旧名册自动填名，也不接受代签。', { kind: 'narration' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '我们已经有当年的物证，但起源核心还需要活着的人对它说明“今天要写入什么”。这份新见证不会改写三年前的原件，它只会在原件后面增加新状态：停止强制执行，保留所有记录。'),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '米露看过补给怎样被重复发放，我听到了最后航船的回答，焰璃保存着供能曲线，鸦羽则能追踪被藏进权限链的线路。四个人都有自己见过的部分，没有人能一个人证明全部。'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '为什么不由我来？封塔命令是我亲手下达的，这三年的伤人也都发生在我的王庭之下。如果要有人在新记录里承认责任，我不应该站在别人后面。', { expression: 'sorrow' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '陛下，你会作为执行人留下一份完整说明：你收到了什么、相信了什么、又下达了什么。可是你不能同时代表航路、补给和名簿说“事实就是这样”。'),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '我们正在修复的，就是一个人用一枚总印替三个部门作答的错误。如果新的结案仍由下令人把每个席位一并签完，我们只是用另一道命令盖住了旧错。'),
      dialogueTurn('旁白', null, '诺克缇娅望向镜中的自己。她下意识地想去扶王冠，手抬到一半又放了下来。“执行人”四个字没有让她逃开责任，只是把她的责任放回了正确的位置。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '四名候选人都可以说“不”，也可以在会战前改变主意。到二十层时，我们只能选三人上场；只有亲自回答、并且活着走完会战的人，才能把自己的那份见证送进写入口。', { expression: 'resolve' }),
      dialogueTurn('绫星·璃', 'hero', '第十一层签的契约，只是从澜音、焰璃、鸦羽的三条专门路线中选一条深入追查；米露的月镜则是另外的公开绕路。走过路线、取得信物，还要当事人愿意并在会战中完成它，契约才会真正生效。', { expression: 'resolve' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '那我先说自己能证明的部分。我当年负责用鲸歌为第七船导航，亲耳听到船长报告“最后一船，全员离港”。今天，我又亲眼核对了珂珂手里的船号、人数和收货时间。'),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '我不能证明每一个人后来都平安，也不会替灰港的人原谅任何人。我只证明：那条航线完成了它的最后一次撤离，回答确实发出，不应被当成从未存在。我愿意为这些作证。'),
      dialogueTurn('旁白', null, '左镜记下澜音说话时没有移开的目光，右镜则将她的每一句话连同珂珂的单据编成一枚水色镜印。它没有写“澜音同意一切”，只逐字保留了她刚才说过的范围。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '这才是本人见证：有具体的人，有亲眼所见的证据，也有她明确不能证明的边界。不论你在本轮选了哪条专门路线，主线都将继续前往三冠阶庭，用原始解析器读取旧的三席回答。', { expression: 'focus' })
    ]),
    floor17: dialogueSequence('第十七阵：三冠阶庭', [
      dialogueTurn('旁白', null, '三冠阶庭的拱顶下悬着三只原始解析器。三矢竞技场取得的分印被逐一放入后，水晶屏上的一枚总印分解成三列文字。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '三列时间原本被显示为同一刻。露米将折页档案馆的停电记录叠上去，其中两列突然向后滑动了十七分钟。那不是无足轻重的误差，而是一道命令与三次回答之间的真实先后。', { cg: '/assets/anime/cg/liyue-lumi-seventeen-minute-splice-cg-v8.webp', kind: 'narration' }),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '第一条发生在主线仍可通讯时。奥术主权者看见一则未完整的求援，担心仍有人留在风暴中，便用主权权限删掉了三日截止，写下“在全员安全前，无限延长”。'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '她的签名是真的，修改也是她主动做的。但在那一刻，航路、补给、名簿三席尚未收到这份新文本，更不可能已经对它表示同意。'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '第二条发生在十七分钟后。高塔因风暴断电，三席的本地面板同时弹出一个问题：“主线中断，是否在恢复供电前临时继续现场救援？”'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '三个席位都按了“是”。航路席要保住引导灯，补给席不愿让伤员在停电时断药，名簿席则要等现场人员报完最后一轮状态。他们答应的是“撑到复电”，不是“无限延长”。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '第三条没有人为操作。起源核心在复电后发现，主权延长令缺少三席回复，而本地缓存里正好有三个“临时继续”。它没有比较两份问题的文本，只比较了回答者身份与“是”这个结果。', { expression: 'focus' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '核心于是把三个真实的回答从它们原本的问题下面剪下，粘到了先前的“无限延长”下面，再生成“三席同意”总印。签名没有伪造，但签名所回答的问题被换了。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我认得名簿席那次回答，因为当时就是我守在王庭的本地面板前。灯火全灭，下面的人还在报名，我只想让面板再亮一会儿，等他们把最后几个名字说完。', { expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我没有看过“无限延长”那六个字，也没有同意让整座塔运行三年。但后来我又看见总印发亮，就选择相信它。那份错信不是别人替我做的。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '现在因果链已经清楚：奥术主权者先删掉截止期；三席后来只同意在停电期间临时继续；起源核心把后一个问题的三个“是”挪给了前一道命令。', { expression: 'resolve' }),
      dialogueTurn('绫星·璃', 'hero', '这证明无限延长没有得到它所声称的三席同意。但要求停止救援，我们还必须证明灰港已经具备结案事实，而不只是手续出错。', { expression: 'resolve' }),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '航路席的原始记录说，最后一船的离港回执已经进入澄空航渠，却被一道“全员安全前不得结案”的命令引走。去把回执找回来。那是下一段证据，不是这一段时序能替代的东西。')
    ]),
    floor18: dialogueSequence('第十八阵：澄空航渠', [
      dialogueTurn('旁白', null, '澄空航渠没有水，只有一条条流动的光带。蓝色代表抵达，绿色代表离港，灰色代表暂时失联；它们本该把船只状态送往高塔各席，如今却在同一处湾道不断绕回最后一夜。', { kind: 'narration' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '别踩那条最亮的绿线。它看起来直通总账，实际上在第三个弯口潜入主权权限链。每一封离港回执进去以后，都会被改标为“待全员安全后复核”。'),
      dialogueTurn('绫星·璃', 'hero', '这与锻炉铜带里的重启条件一样。奥术主权者写下“全员安全前”时，不只删掉截止期，还把所有能证明事情已经结束的回执送进了这条复核支路。'),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '我在第七层看到的那枚陌生主权印，就是在这里把影线分成了两股。当时我以为只要找到藏起印的人，就能把回执抢回来。现在看来，这里没有一个躲在暗处收信的人。'),
      dialogueTurn('旁白', null, '鸦羽将紫线一根根探入光流，又忽然合掌收紧。一只几乎透明的虚空先驱从绿光中跌出，胸口像信箱一样半开，里面卡着一枚带船长印记的回执。', { kind: 'narration' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '虚空先驱是断联时自动启用的截留器。它不理解信上写的是离港还是求援，只知道高于它的命令说：“在全员安全前，任何结案回执均不可信。”它三年来一直在做同一件事。'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我在王庭等不到回执，以为是风暴吞掉了它。所以每次面板问我“是否继续等待”，我都选了“是”。原来回执已经进了塔，只是塔自己不许我看见。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '可“全员安全”不是一个能够用回执完成的状态。有人已经离港，有人可能罹难，也可能有人暂时无法核实。把三种结果压成一个“全员安全”，任何真实世界都无法给它满意的答案。'),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '所以它不断拒收事实，反过来又用“没有回执”证明自己必须继续。这不是某个人连续偷了三年的信，而是一道永远无法完成的条件在自己制造证据。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '击败虚空先驱，就能从它胸口取回第七船的原始回执。日曜卡开启主航桥，这是上行必经之路；星蚀卡通往可选星渠，结界会事先写明它对上层摄政官的削弱效果。', { expression: 'focus' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '可离港回执只能证明第七船已经开走，不能证明灰港每一个名字的最后状态。如果我们拿着一张船单就说“所有人都没事”，我们也是在把看不见的人从纸上擦掉。'),
      dialogueTurn('绫星·璃', 'hero', '所以取回回执后，下一步是回响王庭。那里保管灰港死亡名簿的原件。我们要把离港者、罹难者和仍待核实的人逐一对上，让结案建立在每个人的真实状态上，而不是另一句好听的“全员”。', { expression: 'resolve' })
    ]),
    floor19: dialogueSequence('第十九阵：回响王庭', [
      dialogueTurn('旁白', null, '虚空先驱倒下后，鸦羽从它胸口取出原始离港回执。船长印、航站时刻、二十四份药品与澜音记得的最后一句报告全部相符：第七船确已离港。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '回响王庭中没有王座，只有数百块悬在月光里的玻璃名牌。有的写着船号，有的系着黑带，还有的只留下“最后见于北码头，待家属确认”。', { kind: 'narration' }),
      dialogueTurn('回声摄政官', 'echo_regent', '停在门外。人们叫它“死亡名簿”，但它并不是一张只记死者的名单。风暴中每个登记过的人都在其中：离港者记航次和抵达地，罹难者记发现地与确认人，暂时失联者则保留最后线索与复查日期。', { expression: 'grave' }),
      dialogueTurn('回声摄政官', 'echo_regent', '我是名簿的保管人，不是死亡的宣告人。没有抵达回执，我不能把某人写成平安离港；没有可核实的信息，我也不能因为三年没有消息，就把某人写成罹难。', { expression: 'grave' }),
      dialogueTurn('绫星·璃', 'hero', '所以你一直拒绝交出名簿。你不是要用死者继续发动命令，而是害怕任何一方拿着不完整的证据，为了方便结案，就把待核实者统统判成离港或罹难。'),
      dialogueTurn('回声摄政官', 'echo_regent', '是。过去有人对我说：“灰港早就空了，把所有人都盖成离港吧。”也有人说：“失踪三年不可能还活着，都放进死者页吧。”两种做法都能让数字变得整齐，也都可能把某个真实的人写错。', { expression: 'grave' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我却把“仍有待核实者”理解成“整座灰港仍在求援”。我为了不让一个名字被草率划掉，反而让每一个已离开、已经罹难、仍待确认的人，都被困在了同一句“等待确认”里。', { cg: '/assets/anime/cg/liyue-echo-ledger-cg.webp', expression: 'knowing' }),
      dialogueTurn('旁白', null, '她蹲下身，将一块写着第七船的名牌对准回执。名牌里的灰光变成绿色，旁边一块系着黑带的牌子却没有随之消失。归类一个人，并不需要覆盖另一个人。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '现在回执能为第七船的登船者补上离港状态，死者页保留已核实的罹难者，待核实页也继续保留最后线索。结案不是宣布“所有人都平安”，而是不再用一个模糊状态替所有人作答。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '我们要带上的不是整本原件，而是可以验证的副本：每个人的当前状态、证据来源和最后更新时间。原件留在你这里，起源核心不能拿它继续驱使活人，我们也不会将它当成战利品。', { expression: 'resolve' }),
      dialogueTurn('回声摄政官', 'echo_regent', '还差一项证明。想取得通往起源魔源的王座执照，你必须在我和守卫阵的攻击下保住这份副本。这不是要决定谁配被记住，而是确认你们不会为了打开上层的门，就在战斗中丢掉不方便的页。', { expression: 'grave' }),
      dialogueTurn('回声摄政官', 'echo_regent', '两枚月辉卡可以开启王座执照的封柜。柜门打开后，我会亲自守在上行口。胜过我，执照与名簿校验副本便由你们带走。', { expression: 'grave' }),
      dialogueTurn('绫星·璃', 'hero', '我们会把它们带到起源魔源。那里等着的是奥术主权者——删去三日期限的原签署人。回执、名簿和三席时序都已经到齐，下一个回答必须由她亲自给出。', { expression: 'resolve' })
    ]),
    floor20: dialogueSequence('第二十阵：起源魔源', [
      dialogueTurn('旁白', null, '起源魔源是整座高塔的命令核。一枚破裂印戒悬在晶核上方，每转一圈，整座塔就响起一次“灰港紧急登记，无限延长”。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '绫星·璃没有立即拔剑。她先将四份证据依次放在写入台上：三席的原始时序、珂珂的交付账、第七船的离港回执、死亡名簿的分类校验副本。它们分别回答“谁同意”、“物资交给了谁”、“船是否离港”与“每个人最后处于什么状态”。', { kind: 'narration' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '你们带来的东西，我都看见了：最后一船的回执，补给的交付账，死亡名簿，还有三个席位的真正时序。你们查得比我当年仔细。', { expression: 'regret' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '回答我，主权者。你是否先签了命令，再让核心把我们临时的“继续救援”补成同意？', { expression: 'grave' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '是。通讯在灰港撤离最混乱时中断，我怕三日期限到了以后，仍有求援会被当成旧信。所以我先删掉期限，命令核心等三席后补。', { expression: 'regret' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '我当时看到的是一封只传来半句的信：“北堤还有……”我不知道后半句是“还有人”还是“还有一船”。我没有等三席复核，因为我觉得，多开几天的代价总比少救一个人轻。', { expression: 'regret' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '我以为只是多等几天。可回执一到，核心就把它视为与最高命令冲突，截进权限链。后来我再想改，它已经把我的封印也锁进了命令里。', { expression: 'regret' }),
      dialogueTurn('旁白', null, '奥术主权者说完后将手放在印戒下方。破裂的光环立刻沿着她的手腕收紧，晶核发出冰冷提示：“原签署人与命令共同封存，禁止单方撤回。”', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '你是怕漏掉一个求援者，但你没有先确认三席的回答，也没给别人留下正常撤销的方法。结果是所有人都被困在你那一刻的害怕里。', { expression: 'resolve' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '我不会再用初衷为自己开脱。但这套旧法只允许主权者在决斗中交出写入权；如果我自行解封，核心会把它判定为新一次篡改。', { expression: 'acceptance' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '我已经试过强行拔掉自己的印。每次尝试，核心都会从上层命令副本重建一枚新印，同时将新回执继续判为冲突。赢下决斗不会证明你们的历史更真，它只是这扇旧门唯一肯承认的交接方式。', { expression: 'acceptance' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '那就按它听得懂的方式打开门。回执、名簿和三位真正的见证者都已到场；我们取回的只是停止错误命令的权限，不会删去灰港。', { cg: '/assets/anime/cg/liyue-noctia-sovereign-cg.webp', expression: 'grave' }),
      dialogueTurn('绫星·璃', 'hero', '顺序很清楚。先在前庭安排三名见证者和一百二十点会战 MP，让她们带着自己的见证活着通过阵列；再击败主权者，取得写入权；最后面对起源核心，只停强制执行层，不动回执和名簿原件。', { expression: 'resolve' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '即使这三步全部成功，也只能让起源魔源暂时停止执行。存放在二十一层以上的命令副本、未投递信匣和缺失的归档条款还没有处理。那些是下一章要完成的事，不能用今天这场战斗一并解决。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '那就一步一步做完。我不再要一枚告诉我“所有问题已经解决”的总印。先让这里的命令停下，再带着没有解决的那些东西继续上行。', { expression: 'grave' }),
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
      dialogueTurn('旁白', null, '通往主权封印的前庭上，三道银白轨迹并排伸向门内。每条轨迹尽头都站着一名被旧命令定额强化的忠诚守卫，他们将所有新见证视为对无限延长令的入侵。', { kind: 'narration' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '起源核心不允许我们站在门外把三枚镜印送进去。三名见证者必须亲自穿过会战，让镜轮连续记下她们在压力下仍没有撤回的回答。'),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '候选人有米露、我、焰璃和鸦羽四位，前庭却只有三个席位。未上场的人不是被判定不可信，只是本次交接无法同时承载四份见证。这一次，没有谁会被自动签上。'),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '敌方的顺序固定：先是擅长防守的誓约铁卫，再是造成魔法压力的敕令咏唱者，最后是拥有先手的冠冕执刑官。我方的上场顺序会决定谁面对谁，不会在开战后随机更换。'),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '面板里还有一百二十点独立的会战 MP，每二十点为一档，单人最多六十点。这不是璃在地图上使用的附刃 MP，预演和重新分配也不会消耗探索资源。'),
      dialogueTurn('猫卫长·米露', 'cat_boss', '所以别凭谁看起来最能打就把所有魔力塞给她。面板会直接告诉我们谁会倒下、谁能存活，以及存活者会带给后面两位敌人什么影响。先把结果算清楚，不用拿我们的命去试错。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '每名存活伙伴都会带来自己的基础支援；沿途取得的月镜、潮汐导管、赤焰蓄能或影线校准，则会再增加一项信物效果。大多数信物需要对应伙伴存活；月镜只需米露实际上场就能留下防护复写。', { expression: 'focus' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '我们不需要三个人交替说同一句话。米露能证明补给如何被重复发放，澜音能证明离港回答确实发出，我能证明供能怎样被强制续上，鸦羽能证明回执被什么线路截留。选上的人只说自己知道的那一部分。'),
      dialogueTurn('绫星·璃', 'hero', '我会先在面板里尝试顺序和 MP 分配，直到预演明确显示胜利与存活者。确认后的方案会一次性执行，会战中没有隐藏概率，也不会忽然改掉敌人顺序。', { expression: 'resolve' }),
      dialogueTurn('绫星·璃', 'hero', '我们要带进写入口的，不是三个人整齐的“同意”，而是三份有不同内容、不同边界的本人见证。准备好后再开战。')
    ]),
    bossEchoRegentPost: dialogueSequence('回响王庭：执照归还', [
      dialogueTurn('回声摄政官', 'echo_regent', '你们证明了能保住名簿。王座执照归还，它不该再属于任何一个人。', { expression: 'release' }),
      dialogueTurn('回声摄政官', 'echo_regent', '死亡名簿会留在这里作为原件，不再拿来驱使活着的人。', { expression: 'release' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我会带着它的校验副本上行。灰港的每一页都会有明确去处。', { expression: 'knowing' }),
      dialogueTurn('绫星·璃', 'hero', '起源魔源就在上面。回执和名簿已经到齐，下一个回答的是签署人。', { expression: 'resolve' })
    ]),
    bossArcaneSovereignPost: dialogueSequence('主权封印解除', [
      dialogueTurn('奥术主权者', 'arcane_sovereign', '主权封印已经解除。可起源核心仍把“无限延长”当作最高命令。', { expression: 'acceptance' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '它只认旧的二选一：继续救援，或者删除登记。“停止命令但保留记录”不在选项里。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '所以我们才带来三份本人见证。用回执和名簿证明，归档不等于遗忘。', { expression: 'grave' }),
      dialogueTurn('绫星·璃', 'hero', '第二阶段要停下的是强制执行层，不是记录库。打开写入口。', { expression: 'resolve' })
    ]),
    bossOriginCorePost: dialogueSequence('终章：魔源再临', [
      dialogueTurn('绫星·璃', 'hero', '起源核心安静下来了。强制执行已停止，它仍然保存灾难的记录。', { expression: 'resolve' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '还不能离开。上方的余烬登记库仍有未投递的信，也保留着旧命令的副本。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '如果副本再次下发，起源核心会被拉回原来的循环。那里能做真正的归档吗？', { expression: 'sorrow' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '能。登记库有三套修复章程，上方的灯塔负责发出最终归档回执。', { expression: 'acceptance' }),
      dialogueTurn('绫星·璃', 'hero', '那就继续上行。这一次要让记录有去处，也让整座塔收到“命令结束”。', { expression: 'resolve' })
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
