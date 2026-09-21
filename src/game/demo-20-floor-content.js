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
  11: '复苏环廊', 12: '双生温室', 13: '赤焰锻炉', 14: '三誓竞技场', 15: '折页旧库',
  16: '镜轮双殿', 17: '三冠星庭', 18: '澄空航渠', 19: '万名灯殿', 20: '起源魔源'
});

const ACT2_OBJECTIVES = Object.freeze({
  11: '追随七灯余响；离开前选择一位同行者深入追寻旧夜。',
  12: '共鸣双卫宝库为可选奖励；主路继续追查重复绽放的药草。',
  13: '星卡开导管，月卡开旁路；查明是谁让守夜之火永不熄灭。',
  14: '击败三名守誓者，取回他们各自保存的一段旧夜残响。',
  15: '本章唯一商店；从实物与旧信中补全那一夜发生的事。',
  16: '棱镜门与双镜宝库只会在对应同行路线中开放。',
  17: '让三段残响在星庭中重新分开，听清每个人当时真正说了什么。',
  18: '穿过澄空航渠，追上三年前未能抵达王庭的归航钟声。',
  19: '进入万名灯殿，让每个名字回到它真正的灯火之下。',
  20: '完成守夜终仪，面对续夜施印者与起源魔源。'
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
      dialogueTurn('旁白', null, '王庭上方没有庆典。七盏魔灯的火沿着石壁向更高处延伸，像七条不肯睡去的河。诺克缇娅第一次以同行者的身份走在璃身后。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '七灯只是松开了守护者，还没有真正熄灭。续夜之印的根仍在起源魔源里。想拔掉它，我们得先找回三年前没传到王庭的最后一声。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我记得那一夜最后听见的是四十七个人还没有回音。之后所有声音都断了。若北辰七号真的已经靠岸……我守了三年的，就是一个没有听完的夜晚。', { expression: 'sorrow' }),
      dialogueTurn('旁白', null, '环廊墙上原本刻着守夜誓的四幅壁画：点灯、记名、守望，以及最后一幅被整块凿去的空白。', { cg: '/assets/anime/cg/liyue-noctia-missing-fourth-step-cg-audit-v3.webp', cgHold: 4, kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '有人不只延长了守夜，还把“怎么结束”一起拿走了。我们从那块空白开始追。', { expression: 'resolve' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '离开前可以请澜音、焰璃或鸦羽中的一人陪我们追一条更深的旧夜残响。那只是同行誓，不会堵死主路。', { expression: 'gentle' })
    ]),
    floor12: dialogueSequence('第十二阵：双生温室', [
      dialogueTurn('旁白', null, '温室里开满三年前同一天的药花。每一朵花凋谢后，根部的红色符文都会再次亮起，于是同样的花又从灰烬里长出来。', { kind: 'narration' }),
      dialogueTurn('猫卫长·米露', 'cat_boss', '这些是给北辰七号最后四十七个人准备的退烧草。我亲手搬过第一批。可船都走了，它们为什么还每天重新开？'),
      dialogueTurn('残响精灵·纱雾', 'guide', '花根只听见“守夜未终”。对它来说，只要誓言还在，昨天的伤员就和今天一样需要药。', { expression: 'focus' }),
      dialogueTurn('猫卫长·米露', 'cat_boss', '那就别跟花讲道理。先找到是谁一直给根添火。'),
      dialogueTurn('绫星·璃', 'hero', '锻炉在下一层。药花不是问题的源头，它们只是一直被迫活在同一个晚上。', { expression: 'resolve' })
    ]),
    floor13: dialogueSequence('第十三阵：赤焰锻炉', [
      dialogueTurn('旁白', null, '赤焰锻炉的炉门已经烧成白色。焰璃把长枪插进火脉，挑出一条焦黑的铜带；铜带上缠着与第九层相同的蓝色续夜纹。', { kind: 'narration' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '我早就想熄火。可每次炉心暗下去，这条蓝纹就把整座塔的火重新拖起来。它不是在救谁，它只是在遵守一句“还不能停”。'),
      dialogueTurn('绫星·璃', 'hero', '温室因此重复开花，空屋因此一直供暖，守卫也因此一次次醒来。续夜之印把“担心还有人”变成了整座塔都不能休息。', { expression: 'resolve' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '铜带最后通向三誓竞技场。那里封着三名旧守誓者留下的记忆晶。去把它们取回来；我守住炉火，不让它再往下层灌。')
    ]),
    floor14: dialogueSequence('第十四阵：三誓竞技场', [
      dialogueTurn('旁白', null, '竞技场中央悬着三枚记忆晶：船舵、药瓶与名簿。古誓规定，灾夜里最重要的决定必须由三位守誓者各留一份声音，免得后来只剩王者的一句话。', { kind: 'narration' }),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '三名守卫不替过去辩解。他们只守着三枚记忆晶。想带走旧夜，就用今天的剑证明你带得住。'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '当年送到我面前的只有一枚合在一起的总印。我从没听过这三个人各自说了什么。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '那这次不让任何人替他们说。三枚晶石里有什么，我们就听什么。', { expression: 'resolve' })
    ]),
    floor15: dialogueSequence('第十五阵：折页旧库', [
      dialogueTurn('旁白', null, '三枚记忆晶展开后，只能听见三个模糊的“愿意”。它们发生在续夜之印之后，却听不清当时究竟在回答什么。折页旧库里保存着那一夜没有被魔法改动过的纸、货物与钟表。', { kind: 'narration' }),
      dialogueTurn('阵间商人·珂珂', 'merchant', '别只盯着那些会发光的东西。最后五箱药是我亲手装上北辰七号的，船长还嫌我把止痛药捆得像珠宝。'),
      dialogueTurn('旁白', null, '珂珂摊开一张磨毛的纸单。船号、五只药箱、四十七人的份量、船长蜡印与交接时刻都还在。', { kind: 'narration' }),
      dialogueTurn('阵间商人·珂珂', 'merchant', '后来高塔每天又来要同样五箱。我不敢真给，只好拿空箱应付。三年下来，我最怕的不是欠账，是哪天真的有人受伤时，我柜台里什么都没剩。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '这张纸告诉我们：至少在风暴断声以前，北辰七号已经带着最后一批药离开。下一层的镜轮能让亲历者把自己的那一段记忆留下。', { expression: 'focus' })
    ]),
    floor16: dialogueSequence('第十六阵：镜轮双殿', [
      dialogueTurn('旁白', null, '双殿中央立着两面古镜。左镜只照说话者本人，右镜只照她亲眼见过的事。任何人若试图替别人补上一句，镜面就会立刻暗下去。', { kind: 'narration' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '这样就够了。米露能说自己守过谁，焰璃能说火怎样被强行点亮，鸦羽能说黑线从哪里穿过。我只说我听见的海。'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我也会留下自己的那一段：我没听见归航钟，所以选择继续守。那不是借口，只是事实。', { expression: 'grave' }),
      dialogueTurn('绫星·璃', 'hero', '我们不需要一个人把整夜讲完。把每个人真正见过的那一小块拼起来就够了。', { expression: 'resolve' }),
      dialogueTurn('旁白', null, '镜轮把几人的声音凝成水色薄片。它们不是判词，只是彼此不重叠的记忆。', { kind: 'narration' })
    ]),
    floor17: dialogueSequence('第十七阵：三冠星庭', [
      dialogueTurn('旁白', null, '三枚记忆晶被放上星庭。露米把星光拉成三条细线，原本挤在一起的三个“愿意”终于分开。', { cg: '/assets/anime/cg/liyue-lumi-seventeen-minute-splice-cg-v8.webp', cgHold: 4, kind: 'narration' }),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '第一道声音来自续夜之印之前。第二、第三道却晚了十七分钟——那时风暴已经切断王庭与下层。'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '船舵席说“愿意再亮一会引航灯”；补给席说“愿意撑到炉火恢复”；名簿席说“愿意等现场报完最后几个名字”。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '起源魔源听见了三个相同的“愿意”，却没有听懂它们分别答应了什么。于是它把三声都缠到了先前的续夜誓上。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我后来只看见三道光同时亮起，就以为所有人都同意永远等下去。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '现在至少知道了：没人答应永夜。可要让七灯熄灭，我们还得把真正的归航声带回起源魔源。', { expression: 'resolve' })
    ]),
    floor18: dialogueSequence('第十八阵：澄空航渠', [
      dialogueTurn('旁白', null, '澄空航渠里流动的不是水，而是声音。三年前的鲸歌、港钟与船长呼喊在光带中回旋，每次快要冲向王庭时，都会被一条黑色影流拽回深处。', { kind: 'narration' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '找到了。就是这条东西在吃消息。它不管信里写什么，只要带着“守夜可以结束”的气息，就往黑线里拖。'),
      dialogueTurn('旁白', null, '鸦羽把影刃刺进黑流，一张被折得发白的船长信符从里面翻出来。其上残留的鲸歌与北岸钟声仍在颤动。', { cg: '/assets/anime/cg/liyue-yayu-intercepted-receipt-cg-audit-v3.webp', cgHold: 4, kind: 'narration' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '就是这一声。北岸的第三次钟响之后，船长喊的是：“全员到岸，灰港无人滞留。”'),
      dialogueTurn('绫星·璃', 'hero', '把它带上。三年前没能走完的最后一段路，现在由我们走。', { expression: 'resolve' })
    ]),
    floor19: dialogueSequence('第十九阵：万名灯殿', [
      dialogueTurn('旁白', null, '回响王庭的旧名簿已经变成一座灯海。每个进入灰港的人都有一盏小灯：归航者是蓝火，死者是白火，仍无消息者只留一粒银星。最后四十七盏却一直燃着求救时的猩红。', { kind: 'narration' }),
      dialogueTurn('回声摄政官', 'echo_regent', '我守着这些灯，因为谁也没有资格为了让故事好看，就把不知道的名字随便涂成平安或死亡。'),
      dialogueTurn('绫星·璃', 'hero', '那就一个也不猜。我们带来了北辰七号的钟声，只替真正登上那艘船的人换灯。其余的人照旧保留。', { expression: 'resolve' }),
      dialogueTurn('旁白', null, '澜音放出归航声。灯海里四十七点猩红一盏接一盏褪成深蓝；白灯没有熄，银星也没有被强迫改变。', { cg: '/assets/anime/cg/liyue-echo-ledger-cg-audit-v3.webp', cgHold: 5, kind: 'narration' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '原来停止守夜，从来不等于让名字消失。是我把这两件事绑在了一起。', { expression: 'sorrow' }),
      dialogueTurn('回声摄政官', 'echo_regent', '带着这四十七盏蓝火的余光去吧。起源魔源该听见最后的答案了。')
    ]),
    floor20: dialogueSequence('第二十阵：起源魔源', [
      dialogueTurn('旁白', null, '起源魔源像一颗倒悬的星。七条灵脉围着它旋转，中央悬着那枚裂开的蓝色印戒。每转一圈，塔里就会重新响起一句：“最后一人归来以前，守夜不得结束。”', { kind: 'narration' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '不用再追了。续夜之印是我刻的。', { expression: 'regret' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '那一夜求救突然断掉。我怕那不是平安，而是所有人都死在了风暴里。我以为多等一天，只是多烧几盏灯。'),
      dialogueTurn('旁白', null, '他抬起手腕。蓝色裂纹从掌心一直爬到袖口，和晶核上的印一模一样。', { cg: '/assets/anime/cg/liyue-noctia-sovereign-cg-audit-v3.webp', cgHold: 4, kind: 'narration' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '你给了我一个永远不会自己结束的答案。我又因为害怕，把它守了三年。我们谁都不能把这三年推给那枚印。', { expression: 'grave' }),
      dialogueTurn('绫星·璃', 'hero', '归航钟找到了，七段咏唱也在这里。把你刻下的那句话收回去。然后让高塔把最后一声听完。', { expression: 'resolve' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '起源魔源不会轻易放手。它已经把守夜当成自己的存在。想让它接受终仪，我们得先从它手里抢回七条灵脉。', { expression: 'regret' })
    ]),
    bondMilu: dialogueSequence('月影护信', [
      dialogueTurn('猫卫长·米露', 'cat_boss', '把要带走的信匣交给我。我会记住谁抱过它、从哪条路过，不是为了查谁的错，是为了真有人丢了它时，我们知道该往哪里找。')
    ]),
    bondLanin: dialogueSequence('潮汐留声', [
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '我会把北岸的钟、船长的声音和我的鲸歌一起封进水镜。以后再有人说“我没听见”，就让他自己来听。')
    ]),
    bondYanli: dialogueSequence('赤焰留火', [
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '我留一簇火给你。不是让它永远烧，而是该照路时照路，该熄时就熄。')
    ]),
    bondYayu: dialogueSequence('虚影追痕', [
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '黑线最会装成没人碰过的样子。我替你盯住它；谁再想把自己的手藏起来，我就把影子钉在墙上。')
    ]),
    warCouncil: dialogueSequence('王座前：七声会战', [
      dialogueTurn('旁白', null, '七条灵脉在起源魔源前交织成战场。同行者们依次踏入光环，不再替任何古誓说话，只把自己的那一段力量交给璃。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '不用说同一句誓词。守住你们各自知道的那一部分就够了。', { expression: 'resolve' })
    ]),
    bossEchoRegentPost: dialogueSequence('万名灯殿：蓝火归位', [
      dialogueTurn('回声摄政官', 'echo_regent', '四十七盏蓝火已经归位。白灯与银星也都还在。去吧，让起源魔源看看：记住一个人，并不需要把灾难永远重复下去。', { expression: 'grave' })
    ]),
    bossArcaneSovereignPost: dialogueSequence('续夜之印松动', [
      dialogueTurn('旁白', null, '奥术主权者败下阵来，手腕上的蓝纹第一次出现断口。七条灵脉从裂缝中透出自己的颜色。', { kind: 'narration' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '我收回续夜之誓。不是因为当年的害怕可笑，而是因为现在终于有人把那一夜的最后一声带到了这里。', { expression: 'acceptance' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '还差最后一步。让起源魔源亲耳听见。', { expression: 'grave' })
    ]),
    bossOriginCorePost: dialogueSequence('终章：归航钟响', [
      dialogueTurn('旁白', null, '起源魔源的外壳碎裂。璃没有继续挥剑，而是将船长信符放进七条灵脉交汇的中央。', { kind: 'narration' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '听好了。这是北岸的钟。'),
      dialogueTurn('旁白', null, '第一声，月影灯熄灭。第二声，森罗与潮汐的火变成安静的蓝。第三声落下时，船长三年前的声音终于穿过整座高塔：“北辰七号，全员到岸。”', { kind: 'narration' }),
      dialogueTurn('旁白', null, '七灯同时熄灭。没有名字消失，也没有亡者被忘记。高塔只是终于从三年前的暴风夜里醒了过来。', { kind: 'narration' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '三年……原来只差这一声。', { expression: 'acceptance' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '不。还差我们愿意听完它。', { expression: 'sorrow' }),
      dialogueTurn('旁白', null, '就在众人以为一切结束时，熄灭的灯架上传来纸张摩擦的声音。成千上万封被守夜誓困住的信，从塔顶一直落向下方。它们有的报平安，有的告别，有的只写着一个名字。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '灯灭了，但这些话还没有回家。', { expression: 'resolve' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '上方还有余烬灯塔。三年前没能寄出的东西，可以从那里重新送出去。', { expression: 'gentle' })
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
