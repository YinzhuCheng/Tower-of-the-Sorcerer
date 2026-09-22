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
  15: '这里是上层最后一处商店；星卡封卷通向可选书库。',
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
      dialogueTurn('旁白', null, '绫星·璃踏入复苏环廊。墙上并排着三幅已经褪色的旧壁图：航路记船去了哪里，补给记东西交给了谁，名簿则记每个人最后去了哪里。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '这里就是当年所有记录最后会汇到一起的地方。导航台说船去了哪儿，补给席记东西交给了谁，名簿则要回答一个更难的问题：这个人后来究竟是离港、罹难，还是还没有查清。三年前通讯断掉以后，高塔就是靠这些零碎答案拼出整场撤离。', { expression: 'focus' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '那套规矩允许大家先救人，再慢慢补手续——风暴里没人会因为少一枚印就把伤员挡在门外。但它也写得很清楚：最后一艘船离港以后，只再留三天补回执、对名字。三天一过，强制命令就该撤下，剩下的工作交给档案慢慢做。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '可王庭当时只给我两枚印：一枚写“继续救援”，一枚写“撤销登记”。', { cg: '/assets/anime/cg/liyue-noctia-missing-fourth-step-cg-audit-v3.webp', cgHold: 3, expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '第二枚旁边还刻着一句——未结案者将被清除。我看着那句话，以为停下命令，就是亲手把灰港的人再抹掉一次。', { expression: 'sorrow' }),
      dialogueTurn('旁白', null, '诺克缇娅伸手碰向墙上的第四格。本该写着“封存原件”的位置只剩一道撕裂的白痕，她的手指悬在那里，许久没有收回。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '原来完整的收尾顺序不是“继续执行或全部删除”。它本该先把回执、补给账和每个人的现况封存，再撤下强制命令。有人把中间的归档步骤拆掉了。', { expression: 'resolve' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '前十层已经给了我们两件确定的事：北辰七号四十七人确实全部抵达北岸，女王也不是无限延长令的签署人。黯印下面的主权签名属于奥术主权者。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '王庭能封门、能让守卫行动，却不能凭我的一句话改掉更上层的命令。奥术主权者管着起源魔源，断联时确实有权先把救援延长；可那只是临时权宜。事后航路、补给、名簿三席都要看到同一份命令，分别点头，它才算真正成立。', { expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '可送到我面前的，只有一枚已经亮起来的总印。它写着“三席同意”，却没有任何人的原话，也没有时间。我那时太想相信终于有人替我确认了方向——于是我把一枚印，当成了三个人真正看过、真正同意过。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '那就不靠总印猜过去。我们沿着实物账、供能记录和三席的原始时序往上查，找出命令怎样被改、回执怎样被拦，再把“停止执行”和“保留记录”重新分开。', { expression: 'resolve' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '离开环廊前，还要决定由谁陪我们追一条更深的证据线。见证契约不是替谁提前定罪，而是让一位真正经历过那一夜的人，亲自把她看见的部分查到底，并在最后把那段经历写进记录里。无论选谁，其余调查都不会因此被封死。', { expression: 'gentle' }),
      dialogueTurn('绫星·璃', 'hero', '选中的人也不会有人替她签上名字。我会当面问她是否愿意，会战时也要让她活着走完自己的那一段。先去双谱温室；墙上最新的错误命令，正把药品送往那里。', { expression: 'resolve' })
    ]),
    floor12: dialogueSequence('第十二阵：双谱温室', [
      dialogueTurn('旁白', null, '玻璃穹顶下，两排藤蔓沿着不同的刻度开花。左边是补给席使用的避难名单，右边是航路席发来的船次；只有姓名、船号和时间同时对上，温室才该配药。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '可此刻左边的藤叶绿得刺眼，右边却一片灰白。机械花苞每隔几息便吐出一支新药，地上的药瓶已经滚到门边。', { kind: 'narration' }),
      dialogueTurn('猫卫长·米露', 'cat_boss', '我循着药味找上来的。第一层的卫队一直收到补给，我以为这证明灰港还有人。要是求援者真的活着，我就不能丢下他们。'),
      dialogueTurn('猫卫长·米露', 'cat_boss', '可你们看这只瓶子。标签写着“第七船，需配药二十四人”，受领人栏有姓名，对面的航次栏却是空的。药方像是在给一群没有船、也没有去处的人反复续命。'),
      dialogueTurn('旁白', null, '米露用指甲刮开瓶底的蜡。下面不是一张新处方，而是同一张处方的日期层层相叠：连续三年，每天都被盖上“未结案，重新配发”。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '这不是新求援。每支药的人数、剂量和船次标记都一模一样，只有重印日期在变。登记网把“总账没有结算”当成了“人还在等药”。'),
      dialogueTurn('猫卫长·米露', 'cat_boss', '所以我们三年里吃掉的补给、守住的空门，还有被我抓伤的每一个闯入者，都不是为了某个仍在等药的孩子……只是在供养一张不肯合上的旧账。'),
      dialogueTurn('旁白', null, '她的耳朵压了下去，却没有把瓶子摔掉。米露一支一支将药放回架上，按标签排好，像是不愿让自己的错判再毁掉另一份证据。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '温室的主路保存配药编号和魔力来源。通过前方的守卫后，我们就能带走这批记录，去脉冲锻炉对照它们何时获得供能。', { expression: 'focus' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '双谱宝库另外收着一枚月镜。它能复写航路席防护术式的节奏，也可以成为米露在会战中的信物。那是所有路线都可以选的绕路，不走也不影响继续追查。', { expression: 'gentle' }),
      dialogueTurn('猫卫长·米露', 'cat_boss', '把第七船的药品编号交给我一份。我要记住，补给只能证明有人下过命令，不能单独证明那个人此刻仍在受困。下次我会先找到收货的人。'),
      dialogueTurn('绫星·璃', 'hero', '我们也带上一支完整的重印药瓶。它会向锻炉证明：温室没收到灰港的新求援，只收到了旧指令每天重印出来的新日期。', { expression: 'resolve' })
    ]),
    floor13: dialogueSequence('第十三阵：脉冲锻炉', [
      dialogueTurn('旁白', null, '穿过温室的阵列后，绫星·璃取得了完整的配药流向。其中每一笔魔力都来自同一个地方：脉冲锻炉；每次发放间隔也与“重新配发”的日期完全一致。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '越靠近炉心，地板的震动越像急促心跳。星、月两条回路仍向已经无人领取物资的灰港旧区送去热量和魔力。', { kind: 'narration' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '我认得这个节奏。最后一船出港那晚，我是锻炉的值守人。我把火力抬到最高，好让码头的引导灯在风暴里多亮三天。'),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '这三天不是判断人该不该被忘记的期限，而是供能部门的安全约定：三日后必须停止满载，先检修炉管，再转为只留档案、只维持一线微火的值守。可我等了三年，计时从没到过终点。'),
      dialogueTurn('旁白', null, '焰璃把长枪插进传能缝隙，挑出一条焦黑的铜带。上面的供能曲线在最后一船回执到达前一刻骤然抬满，此后再没下降。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '温室的账对上了。每当锻炉将旧命令当成新一天的救援，温室就会把同一张处方重印一次。温室和锻炉并不是各自出了不同的错，它们在忠实执行同一道错误指令。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '铜带里的改动不只删掉了三日时限。它还把“归档待机”改成“持续救援”，封死了现场停炉的手段，并写下“未确认全员安全前，即使熄灭也要自行复燃”。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '现场值守人做不到同时改时限、改运转方式、封死停炉手段。这段写入绕过了女王的王庭，带着起源魔源的主权印权。这枚主权印留下了清楚的来路，不是我们的推测。', { expression: 'resolve' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '我一直以为炉火还亮着，就说明码头还有人需要它。所以我不让任何人靠近炉心，还把每次试图断能都当成破坏救援。'),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '现在我终于看懂了：火不是因为有人回答才亮，而是命令不允许它熄灭。我这三年烧掉的不只是矿石；温室靠它重复配药，楼下的守卫也靠它反复站起来。'),
      dialogueTurn('旁白', null, '焰璃没有立刻熄炉。她先切断通往空管道的支路，又保留了档案环的微光。火声慢慢从咆哮降成均匀的呼吸，墙上第一次显出了那道改令的完整时刻。', { kind: 'narration' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '改令记录随后被送往三矢竞技场，由航路、补给、名簿三席的代理守卫核验。那三枚印一定记得谁先写入，谁后回答。'),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '去把三段时序全部取回来。我会守在这里压住炉火，不让它继续喂养旧阵列，也不会关掉那条保存记录的微火。这次，我等的是你们把回答带回来。')
    ]),
    floor14: dialogueSequence('第十四阵：三矢竞技场', [
      dialogueTurn('旁白', null, '锻炉铜带上的去向签将一行人引到三矢竞技场。这里并非为观众表演武技，而是在断讯时仍能保住原始回答的核验场。即使高塔的主传讯线后来被改写，航路、补给、名簿三席当时的答复也会分开留存。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '三条石路在中央封台前汇合。左路守卫胸前是船舵，代表航路席；右路是药瓶，代表补给席；中路是合起的名簿，代表名簿席。', { kind: 'narration' }),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '这三名代理守卫不是当年的签署人，也不会替他们辩解。他们的职责只有一个：在来者有能力完整带走记录之前，不交出任何一段原始时序。'),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '这三枚分印本来就是为了防止一个人一句话把整座塔拖着走。主权者可以先提出延长，但航路、补给、名簿三席得分别看到同一段文字、同一个目的、同一段时间，再各自回答。少任何一个，都不该算数。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '问题在于，王庭收到的总印只显示“三席同意”，不显示每一席回答的原文和时间。单看任何一枚分印，又会被总印的结论覆盖。只有三枚同时回到中央封台，我们才能不经过总印读原文。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '当年我一直以为，总印发亮就意味着三个部门都看过那道“无限延长”。我没有看到他们的文字，却用他们的名义让整座塔继续执行。', { expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我还不知道，是有人有意挪用了他们的回答，还是旧规自己把不同的问题拼到了一起。但不管答案是什么，我不会再把“我以为”当成他们的证言。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '也不逼这些守卫替当年的人改口。我们要赢的是三份原始记录，不是三份对我们有利的口供。它们写了什么，我们就带走什么。', { expression: 'resolve' }),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '三名代理守卫全部落败后，他们的分印才会同时回到中央封台，把三份原始回答并排展开。上行结界也会在那时解除。他们按旧规不会留手，你也不必把破坏印记当成捷径。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '三名守卫的打法完全不同：一个抢先手，一个用术式穿过护甲，一个靠连续攻击压住喘息。别只想着赢眼前这一场；我们还要带着足够的体力和魔力走到下一道门。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '取得三枚印后，我们就带去折页档案馆。那里的物资原账有交付对象和实际时间，能告诉我们三席的回答是在什么情况下按下的。', { expression: 'resolve' })
    ]),
    floor15: dialogueSequence('第十五阵：折页档案馆', [
      dialogueTurn('旁白', null, '三名代理守卫相继倒下后，中央封台展开了三段未经总印改写的时序。第一段留着主权签名与“无限延长”，后两段则记着三席各自盖下确认印的时刻。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '先别急着给这十七分钟下结论。能确定的只有顺序：主权者先签，三席后答。至于三席当时到底看见了什么，我们还没拿到原文。时间差是线索，不是判决。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '折页档案馆保存实际交货、扣账和停电记录。我们要用它还原那十七分钟里发生了什么，而不是给三枚印编一个方便的故事。', { expression: 'resolve' }),
      dialogueTurn('旁白', null, '档案馆里没有史书，只有一排排送货单、药瓶封签和空箱回条。红封账本每翻过一轮，远处的货架就发出一声空洞的扣货响。', { kind: 'narration' }),
      dialogueTurn('阵间商人·珂珂', 'merchant', '别碰那本红皮账。它每翻一页，就从我名下扣掉又一批药。三年前我是灰港的供应商，最后那批二十四人份的药，是我亲手送上第七船的。'),
      dialogueTurn('阵间商人·珂珂', 'merchant', '船长当场点过五只药箱，还笑我把止痛药捆得像贵重珠宝。她在这张纸单上盖了收货印，又将副本交给航站。我没有可能把同一批药在三年后每天交付一次。'),
      dialogueTurn('旁白', null, '珂珂从柜台夹层抽出一张磨起毛边的单据。船号、五只药箱、二十四名需配药者、船长签名和交接时刻一应俱全；唯独高塔总账的“结清”栏始终空白。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '实物已经交付，船上的人签了收货，商人也留着原件。只有高塔总账因为缺少航站回执而拒绝结算。所以温室不断重做，锻炉不断供能，珂珂的库存却不断消失。'),
      dialogueTurn('阵间商人·珂珂', 'merchant', '最初几天，我以为是航站忙乱，还真的按新订单重新装箱。后来我发现订单上连船长笔迹的折角都一样，才知道它只是把旧纸当新纸。'),
      dialogueTurn('阵间商人·珂珂', 'merchant', '我只好把空箱放在扣货口，把真药藏进柜台，免得后来真的伤员一瓶都买不到。我不敢停账，因为页面警告我：“终止配送将放弃未救助人员。”'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '又是同样的恐吓。它对我说“停下就会删掉名字”，对你说“停货就是放弃伤员”。它只把人最害怕失去的东西摆在眼前，却不让我们看见彼此已经做过什么。', { expression: 'sorrow' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '停电账补上了缺的那一块。主权签名出现十七分钟后，主传讯线断了。三席那时只能看见各自岗位上的问询镜亮起现场问题，读不到主权者先前写下的“无限延长”。这就解释了为什么同一个“是”，可能回答的是完全不同的问题。', { expression: 'focus' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '三席在停电中按下的很可能只是“临时继续”，用来撑到供电恢复。但要看到它们当时的完整文本，还需要上层三冠阶庭保存的原始问答记录。', { expression: 'focus' }),
      dialogueTurn('阵间商人·珂珂', 'merchant', '把这张原单带上。我不是什么大人物，但我记得那批药交给了谁，也记得自己为什么害怕停手。这些小事如果没人留下，又会被一枚大印盖过去。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '星卡封卷里还留着原始配送回执和赤焰蓄能信物。只有与焰璃签下“赤焰裂印”见证契约，封卷才会认人开门；不进那间书库，也不妨碍我们继续查主卷。若要补给，就在上行前买齐；再往上没有第二处商店。', { expression: 'gentle' }),
      dialogueTurn('绫星·璃', 'hero', '我们先带着原单上镜轮双殿。旧记录告诉我们当年的答案怎样被挪用；镜轮要做的，是让今天愿意作证的人亲口说话。', { expression: 'resolve' })
    ]),
    floor16: dialogueSequence('第十六阵：镜轮双殿', [
      dialogueTurn('旁白', null, '珂珂的交货原单被放进镜轮双殿中央。左镜照出说话者此刻的容貌与动作，右镜同时留下她的声音、时间和眼前的证据。两面镜子都不会照着旧名册替人填名，也不接受代签。', { kind: 'narration' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '我们已经有当年的物证，可起源核心还要听见活着的人亲口说明今天要怎样收尾。新的证词不会盖过旧原件，只会补上一句：命令到此为止，记录仍然留下。'),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '米露看见补给怎样被重复发放；我听见最后航船的回答；焰璃知道炉火为什么一直不停；鸦羽看得见回执被截去了哪里。四种声音各有边界，没有谁能替另外三个人说完。'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '为什么不由我来？封塔命令是我亲手下达的，这三年的伤人也都发生在我的王庭之下。如果要有人在新记录里承认责任，我不应该站在别人后面。', { expression: 'sorrow' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '陛下，你会作为执行人留下一份完整说明：你收到了什么、相信了什么、又下达了什么。可是你不能同时代表航路、补给和名簿说“事实就是这样”。'),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '当年的错，就是一枚总印替三个人说了话。今天若还让发令者替所有人一起回答，不过是在旧错上再盖一层新印。'),
      dialogueTurn('旁白', null, '诺克缇娅望向镜中的自己。她下意识地想去扶王冠，手抬到一半又放了下来。“执行人”四个字没有让她逃开责任，只是把她的责任放回了正确的位置。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '四名候选人都可以说“不”，也可以在会战前改变主意。到了起源魔源前的会战，我们只能选三人上场；只有亲自回答、并且活着走完会战的人，才能把自己的那份见证亲手送进誊录台。', { expression: 'resolve' }),
      dialogueTurn('绫星·璃', 'hero', '在复苏环廊签下的契约，只决定我们陪澜音、焰璃或鸦羽中的一人把她亲历的那段查到底；米露的月镜则另有一条人人都能去的支路。拿到信物还不算完，当事人必须愿意作证，也必须亲自走过最后的会战，那份见证才真正成立。', { expression: 'resolve' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '那我先说自己能证明的部分。我当年负责用鲸歌为第七船导航，亲耳听到船长报告“北辰七号，四十七人，全部抵达北岸”。今天，我又亲眼核对了珂珂手里的船号、人数和收货时间。'),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '我不能证明每一个人后来都平安，也不会替灰港的人原谅任何人。我只证明：那条航线完成了它的最后一次撤离，回答确实发出，不应被当成从未存在。我愿意为这些作证。'),
      dialogueTurn('旁白', null, '左镜记下澜音说话时没有移开的目光，右镜则将她的每一句话连同珂珂的单据编成一枚水色镜印。它没有写“澜音同意一切”，只逐字保留了她刚才说过的范围。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '这样才算见证。她说自己亲眼看见的，也把自己不能证明的部分留空。我们不用谁替整件事作答。接下来去三冠阶庭，把旧三席真正回答过的话读出来。', { expression: 'focus' })
    ]),
    floor17: dialogueSequence('第十七阵：三冠阶庭', [
      dialogueTurn('旁白', null, '三冠阶庭的拱顶下悬着三只原始问答镜。三矢竞技场取得的分印被逐一放入后，水晶镜面上的一枚总印分解成三列文字。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '三列时间原本被显示为同一刻。露米将折页档案馆的停电记录叠上去，其中两列突然向后滑动了十七分钟。那不是无足轻重的误差，而是一道命令与三次回答之间的真实先后。', { cg: '/assets/anime/cg/liyue-lumi-seventeen-minute-splice-cg-v8.webp', cgHold: 4, kind: 'narration' }),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '第一条发生在主传讯线尚未中断时。奥术主权者看见一则未完整的求援，担心仍有人留在风暴中，便用主权印删掉了三日截止，写下“在全员安全前，无限延长”。'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '他的签名是真的，删去期限也是他主动做的。但在那一刻，航路、补给、名簿三席还没有见过这道新命令，更不可能已经表示同意。'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '第二条发生在十七分钟后。高塔因风暴断电，航路、补给和名簿三席各自岗位上的问询镜同时亮起同一个问题：“主传讯线中断，是否在恢复供电前临时继续现场救援？”'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '三个席位都回答了“是”。航路席要让引导灯继续亮，补给席不肯让伤员断药，名簿席则想等最后一轮点名结束。他们答应的是“先撑到复明”，不是“无限延长”。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '第三条没有人为操作。起源核心在复电后发现，主权延长令缺少三席回复，而旧镜里正好留着三个“临时继续”。它没有核对两次问题是不是同一句，只看见答话的人相同、结果都是“是”。', { expression: 'focus' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '核心于是把三个真实的回答从它们原本的问题下面剪下，粘到了先前的“无限延长”下面，最后盖成了“三席同意”的总印。签名没有伪造，但签名所回答的问题被换了。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我认得名簿席那次回答，因为当时就是我守在王庭的问询镜前。灯火全灭，下面的人还在报名字。我只想让镜面再亮一会儿，等他们把最后几个人说完。', { expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我没有看过“无限延长”那六个字，也没有同意让整座塔运行三年。但后来我又看见总印发亮，就选择相信它。那份错信不是别人替我做的。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '先把顺序钉死。主权者先删期限；十七分钟后，三席答应的只是“停电时先别收队”；最后，是起源核心把那三个“是”挪到了前一道命令下面。不是三个人一起签错了一张纸，是三个不同时间的动作被硬缝成了一件事。', { expression: 'resolve' }),
      dialogueTurn('绫星·璃', 'hero', '这够我们拆掉“三席同意”这层假壳，还不够让警报停。手续错了是一回事，灰港到底有没有到可以结案的那一步，是另一回事。下一份证据要回答后者。', { expression: 'resolve' }),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '航路席的原始记录说，最后一船的抵达回执已经进入澄空航渠，却被一道“全员安全前不得结案”的命令引走。去把回执找回来。那是下一段证据，不是这一段时序能替代的东西。')
    ]),
    floor18: dialogueSequence('第十八阵：澄空航渠', [
      dialogueTurn('旁白', null, '澄空航渠没有水，只有一条条流动的光带。蓝色代表抵达，绿色代表离港，灰色代表暂时失联；它们本该把船只去向送往高塔各席，如今却在同一处湾道不断绕回最后一夜。', { kind: 'narration' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '别踩那条最亮的绿线。它看起来直通总账，实际上在第三个弯口潜入主权封印。每一封结案回执进去以后，都会被改标为“待全员安全后复核”。'),
      dialogueTurn('绫星·璃', 'hero', '又是“全员安全前”。锻炉靠这句话熄了又会重新燃起，这条航渠则靠它把回执拐走。主权者删掉的不只是截止期，他还顺手把“什么算结束”写成了一个永远等不到的答案。'),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '我在第七层看到的那枚陌生主权印，就是在这里把影线分成了两股。当时我以为只要找到藏起印的人，就能把回执抢回来。现在看来，这里没有一个躲在暗处收信的人。'),
      dialogueTurn('旁白', null, '鸦羽将紫线一根根探入光流，又忽然合掌收紧。一只几乎透明的虚空先驱从绿光中跌出，胸口像信箱一样半开，里面卡着一枚带船长印记的回执。', { cg: '/assets/anime/cg/liyue-yayu-intercepted-receipt-cg-audit-v3.webp', cgHold: 3, kind: 'narration' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '找到了。不是人在偷信，是这东西。顺序别弄反：回执比无限延长更早进塔，只是当时还在受风暴干扰的潮汐航渠里向王庭上送。后来断讯、上层新令生效，这东西才接过航渠，把“请结束紧急登记”改成“等待复核”，再把原件拖进主权封印。它不读信，只认那句：“全员安全前，任何结案回执均不可信。”三年来，一直如此。'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我在王庭等不到回执，以为是风暴吞掉了它。所以每次问询镜再亮起“是否继续等待”，我都选了“是”。原来回执早已进塔，只是被藏在我看不见的上层封印里。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '问题就在“全员安全”这四个字。有人已经离港，有人已经罹难，也有人到今天还只能写“待核实”。真实世界不会给出一个整整齐齐、人人都能盖成“安全”的答案。拿它当结案条件，等于从一开始就没打算让警报结束。'),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '它先把回执判成无效，再拿“没有有效回执”证明警报不能停。自己制造缺口，再拿缺口证明自己正确。不是阴谋，反而更麻烦——因为没人需要每天重新下令。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '击败虚空先驱，就能从它胸口取回第七船的原始回执。日曜卡开启主航桥，这是上行必经之路；星蚀卡则能打开旁侧星渠。那里的结界会把能削弱摄政官哪一种术式写在门上，去不去由我们自己决定。', { expression: 'focus' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '这份抵达回执能证明北辰七号那四十七人全部到岸，却不能替整场灰港灾难里的每一个名字作答。还有其他船次、罹难者和待核实者。若我们拿着最后一船的好消息就说“所有人都没事”，一样是在把看不见的人从纸上擦掉。'),
      dialogueTurn('绫星·璃', 'hero', '先把回执拿回来。然后去回响王庭。船单只能告诉我们谁离港，不能替死者、失联者和还没查清的人说话。下一步，把整本名簿重新分清：谁已经抵达安全地，谁已经罹难，谁仍然只能写“待核实”。', { expression: 'resolve' })
    ]),
    floor19: dialogueSequence('第十九阵：回响王庭', [
      dialogueTurn('旁白', null, '虚空先驱倒下后，鸦羽从它胸口取出原始抵达回执。船长印、北岸港钟、抵达时刻、四十七名乘员中那二十四人的配药记录，与澜音记得的最后一句报告全部相符：北辰七号四十七人确已抵达北岸。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '回响王庭中没有王座，只有数百块悬在月光里的玻璃名牌。有的写着船号，有的系着黑带，还有的只留下“最后见于北码头，待家属确认”。', { kind: 'narration' }),
      dialogueTurn('回声摄政官', 'echo_regent', '停在门外。先分清一件事：北辰七号那四十七人已经由回执证明全部到岸；这本册子记的却是整场灰港灾难里所有登记过的人，不只最后一船。人们叫它“死亡名簿”，其实并不只记死者：已有到岸证据的人记航次和抵达地，罹难者记发现地与确认人，暂时失联者则保留最后线索与复查日期。', { expression: 'grave' }),
      dialogueTurn('回声摄政官', 'echo_regent', '我是名簿的保管人，不是死亡的宣告人。没有抵达回执，我不能把某人写成平安离港；没有可核实的信息，我也不能因为三年没有消息，就把某人写成罹难。', { expression: 'grave' }),
      dialogueTurn('绫星·璃', 'hero', '所以你一直拒绝交出名簿。你不是要用死者继续发动命令，而是害怕任何一方拿着不完整的证据，为了方便结案，就把待核实者统统判成离港或罹难。'),
      dialogueTurn('回声摄政官', 'echo_regent', '是。过去有人对我说：“灰港早就空了，把所有人都盖成离港吧。”也有人说：“失踪三年不可能还活着，都放进死者页吧。”两种做法都能让数字变得整齐，也都可能把某个真实的人写错。', { expression: 'grave' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我却把“仍有待核实者”理解成“整座灰港仍在求援”。我为了不让一个名字被草率划掉，反而让每一个已离开、已经罹难、仍待确认的人，都被困在了同一句“等待确认”里。', { cg: '/assets/anime/cg/liyue-echo-ledger-cg-audit-v3.webp', expression: 'knowing' }),
      dialogueTurn('旁白', null, '她蹲下身，将一块写着第七船的名牌对准回执。名牌里的灰光变成绿色，旁边一块系着黑带的牌子却没有随之消失。归类一个人，并不需要覆盖另一个人。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '现在回执能为第七船的登船者补上抵达记载，死者页保留已核实的罹难者，待核实页也继续保留最后线索。结案不是宣布“所有人都平安”，而是不再用一句模糊的“等待确认”替所有人作答。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '我们要带上的不是整本原件，而是一份能逐项核对的副本：每个人当前的判断、证据来源和最后一次改动时间。原件留在你这里，起源核心不能拿它继续驱使活人，我们也不会将它当成战利品。', { expression: 'resolve' }),
      dialogueTurn('回声摄政官', 'echo_regent', '还差一项证明。想取得通往起源魔源的王座执照，你必须在我和守卫阵的攻击下保住这份副本。这不是要决定谁配被记住，而是确认你们不会为了打开上层的门，就在战斗中丢掉不方便的页。', { expression: 'grave' }),
      dialogueTurn('回声摄政官', 'echo_regent', '两枚月辉卡可以开启王座执照的封柜。柜门打开后，我会亲自守在上行口。胜过我，执照与名簿核验副本便由你们带走。', { expression: 'grave' }),
      dialogueTurn('绫星·璃', 'hero', '我们会把它们带到起源魔源。那里等着的是奥术主权者——删去三日期限的原签署人。回执、名簿和三席时序都已经到齐，下一个回答必须由他亲自给出。', { expression: 'resolve' })
    ]),
    floor20: dialogueSequence('第二十阵：起源魔源', [
      dialogueTurn('旁白', null, '起源魔源是整座高塔上层命令汇聚的中枢；“魔源”指的是这间中枢本身，悬在中央、真正执行命令的那枚晶核才叫起源核心。一枚破裂印戒浮在核心上方，每转一圈，整座塔就响起一次“灰港紧急登记，无限延长”。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '绫星·璃没有立即拔剑。她先将四份证据依次放在誊录台上：三席的原始时序、珂珂的交付账、第七船的抵达回执、死亡名簿的分类核验副本。它们分别回答“谁同意”、“物资交给了谁”、“最后一船是否抵达北岸”与“整场灾难里每个人最后去了哪里”。', { kind: 'narration' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '你们带来的东西，我都看见了：最后一船的回执，补给的交付账，死亡名簿，还有三个席位的真正时序。你们查得比我当年仔细。', { expression: 'regret' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '回答我，主权者。你是否先签了命令，再让核心把我们临时的“继续救援”补成同意？', { expression: 'grave' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '是。通讯在灰港撤离最混乱时中断，我怕三日期限到了以后，仍有求援会被当成旧信。所以我先删掉期限，让延长令临时生效，打算等通讯恢复后再让航路、补给和名簿三席逐一确认。', { expression: 'regret' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '我当时看到的是一封只传来半句的信：“北堤还有……”我不知道后半句是“还有人”还是“还有一船”。我没有等三席复核，因为我觉得，多开几天的代价总比少救一个人轻。', { expression: 'regret' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '我以为只是多等几天。后来我才知道，抵达回执其实比我的延长令更早进塔，只是还没送到王庭。等我的命令生效，核心反而把那份尚在航渠里的回执判成冲突，拖进了上层封印。再想撤令时，我自己的主权印也已经被锁进其中。', { expression: 'regret' }),
      dialogueTurn('旁白', null, '奥术主权者说完后将手放在印戒下方。破裂的光环立刻沿着他的手腕收紧，晶核发出冰冷提示：“原签署人与命令共同封存，禁止单方撤回。”', { cg: '/assets/anime/cg/liyue-noctia-sovereign-cg-audit-v3.webp', cgHold: 5, kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '你是怕漏掉一个求援者，但你没有先确认三席的回答，也没给别人留下正常撤销的方法。结果是所有人都被困在你那一刻的害怕里。', { expression: 'resolve' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '我不会再拿“当时只是想多救一个人”替自己开脱。那句话听起来善良，可真正被它锁住的人并没有替我同意这份代价。现在这套旧法只认一种交接：主权者必须在决斗中把改令权交出去。我若自己解封，核心只会把它当成又一次越权篡改。', { expression: 'acceptance' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '我已经试过强行拔掉自己的印。每次尝试，核心都会照上层命令抄本重刻一枚新印，同时将新回执继续判为冲突。赢下决斗不会证明你们的历史更真，它只是这扇旧门唯一肯承认的交接方式。', { expression: 'acceptance' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '那就按它听得懂的方式打开门。回执、名簿和三位真正的见证者都已到场；我们取回的只是撤下错误命令的印权，不会删去灰港。', { expression: 'grave' }),
      dialogueTurn('绫星·璃', 'hero', '顺序很清楚。先让三名见证者带着自己的证词活着穿过前庭；再从主权者手里拿到改令权；最后面对起源核心，只停命令，不碰回执和名簿原件。共鸣池怎么分，开战前再算。', { expression: 'resolve' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '即使这三步全部成功，也只是让起源核心停下强制命令。更高处仍存着命令抄本、未投递的信匣和缺失的归档条款，还没有处理。那些是更高处仍要完成的事，不能用今天这场战斗一并解决。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '那就一步一步做完。我不再要一枚告诉我“所有问题已经解决”的总印。先让这里的命令停下，再带着没有解决的那些东西继续上行。', { expression: 'grave' }),
    ]),
    bondMilu: dialogueSequence('月镜复写', [
      dialogueTurn('猫卫长·米露', 'cat_boss', '月镜还能在最后的交接里替队伍挡下一次反击。让我带着它。三年前我没能护住那些回信，这一次至少让我替她们守住回程。'),
      dialogueTurn('绫星·璃', 'hero', '好。会战时把你安排上场。')
    ]),
    bondLanin: dialogueSequence('潮汐导管', [
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '潮汐导管能在最后那段魔法冲击里替我们削掉一次反击。我想亲手把真正的航线接回去——不是为了赢得漂亮，而是让那句“已经抵达”终于走到该去的地方。'),
      dialogueTurn('绫星·璃', 'hero', '我会把你排进阵列。但那句“已经抵达”，得由你自己活着送到最后。')
    ]),
    bondYanli: dialogueSequence('赤焰蓄能', [
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '赤焰蓄能可以提前削弱核心的维持层。炉火已经白烧了三年，这一次我想让它真正替活着的人开路。让我去。'),
      dialogueTurn('绫星·璃', 'hero', '那就跟上。别把自己先烧空在前庭。')
    ]),
    bondYayu: dialogueSequence('影线校准', [
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '影线校正能让起源核心失去二连击。我会把伪造的命令线一根根拆开。'),
      dialogueTurn('绫星·璃', 'hero', '那就活着走到核心面前。你的线，要由你自己拆。')
    ]),
    warCouncil: dialogueSequence('王座前：共鸣会战', [
      dialogueTurn('旁白', null, '通往主权封印的前庭上，三道银白轨迹并排伸向门内。每条轨迹尽头都站着一名被旧命令定额强化的忠诚守卫，他们将所有新见证视为对无限延长令的入侵。', { kind: 'narration' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '起源核心不允许我们站在门外把三枚镜印送进去。三名见证者必须亲自穿过会战，让镜轮连续记下她们在压力下仍没有撤回的回答。'),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '候选人有米露、我、焰璃和鸦羽四位，前庭却只有三个席位。未上场的人不是被判定不可信，只是这次交接放不下四份见证。谁没站上去，就没人替她签名。'),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '三个人，顺序不变：铁卫先挡，咏唱者穿甲，执刑官抢先手。我们的人怎么排，谁就去接谁。'),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '前庭有一百二十点共鸣，一人最多接六十。先在阵里试配；试错不会烧掉璃自己的魔力。'),
      dialogueTurn('猫卫长·米露', 'cat_boss', '所以别凭谁看起来最能打就把所有共鸣都压在她身上。前庭阵列能把每一种分配先推演给我们看：谁会撑住、谁会倒下，活下来的人又能给后面的两场战斗带去什么帮助。先把结果算清楚，不用拿我们的命去试错。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '每个活着穿过会战的人，都会把自己的术式带进后面的战斗。一路取得的月镜、潮汐导管、赤焰蓄能和影线校正，还能再多帮一把；多数信物都得由主人亲自活着带过去，只有米露的月镜只要真正上场，就能把护幕复写下来。', { expression: 'focus' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '我们不需要三个人交替说同一句话。米露能证明补给如何被重复发放，澜音能证明北岸的抵达回答确实发出，我能证明供能怎样被强制续上，鸦羽能证明回执被什么线路截留。选上的人只说自己知道的那一部分。'),
      dialogueTurn('绫星·璃', 'hero', '那就先让阵列推演几次，把出场顺序和共鸣储量都排到每个人能活着走完为止。等方案定下，我们就照同一套顺序一次执行到底；这里没有靠运气赌过去的余地。', { expression: 'resolve' }),
      dialogueTurn('绫星·璃', 'hero', '我们要带进誊录台的，不是三个人整齐的“同意”，而是三份有不同内容、不同边界的本人见证。准备好后再开战。')
    ]),
    bossEchoRegentPost: dialogueSequence('回响王庭：执照归还', [
      dialogueTurn('回声摄政官', 'echo_regent', '你们证明了能保住名簿。王座执照归还，它不该再属于任何一个人。', { expression: 'release' }),
      dialogueTurn('回声摄政官', 'echo_regent', '死亡名簿会留在这里作为原件，不再拿来驱使活着的人。', { expression: 'release' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我会带着它的核验副本上行。灰港的每一页都会有明确去处。', { expression: 'knowing' }),
      dialogueTurn('绫星·璃', 'hero', '起源魔源就在上面。回执和名簿已经到齐，下一个回答的是签署人。', { expression: 'resolve' })
    ]),
    bossArcaneSovereignPost: dialogueSequence('主权封印解除', [
      dialogueTurn('奥术主权者', 'arcane_sovereign', '主权封印已经解除。可起源核心仍把“无限延长”当作最高命令。', { expression: 'acceptance' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '旧规只认两条路：继续救援，或者删除登记。它从没给“停下命令、留下记录”留过位置。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '所以我们才带来三份本人见证。用回执和名簿证明，归档不等于遗忘。', { expression: 'grave' }),
      dialogueTurn('绫星·璃', 'hero', '接下来只停强制命令，不碰记录。把誊录台打开。', { expression: 'resolve' })
    ]),
    bossOriginCorePost: dialogueSequence('起源之后：仍未投递', [
      dialogueTurn('绫星·璃', 'hero', '起源核心安静下来了。强制命令停了，记录还在。先别庆祝——这只说明我们终于能动手收拾残局，还不是已经结束。', { expression: 'resolve' }),
      dialogueTurn('旁白', null, '奥术主权者手腕上的蓝色束缚松开了。那枚裂开的主权印没有消失，他也没有把它摘下来，只用另一只手扶住还在发抖的指节。', { kind: 'narration' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '别替我把这当成赎罪。写下无限延长的是我，今天只不过终于有人把我从那道命令里拖出来，让我能亲手去收拾它留下的东西。', { expression: 'acceptance' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我不会替你说“已经够了”。也不会把自己做过的事算到你的签名下面。我们各自有要回答的部分——既然还没回答完，就一起上去。', { expression: 'grave' }),
      dialogueTurn('旁白', null, '两人第一次并肩站在没有王座、也没有封印隔开的地方。谁也没有伸手和解。升降梯却已经在她们身后重新亮起。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '还不能离开。上方的余烬登记库仍有未投递的信，也保留着旧命令的副本。只要那些抄本还能重新送出，今天停下的旧命令就可能被再次拼回来。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '那就去找真正的归档方式。我要亲眼确认，警报停止以后，那些名字仍然有地方留下。', { expression: 'sorrow' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '登记库里留着护送、校验、接力三套旧修复章程。再往上是余烬灯塔——只有那里能把最终结案真正送出高塔。方案是我参与设计的，哪里会卡住，我会告诉你们。', { expression: 'acceptance' }),
      dialogueTurn('绫星·璃', 'hero', '好。继续上行。再往上，我们不再追问“谁做错了什么”，而是把已经查清的错误一件件修掉：让记录有去处，让命令真的结束，让外面的人收到回答。', { expression: 'resolve' })
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
