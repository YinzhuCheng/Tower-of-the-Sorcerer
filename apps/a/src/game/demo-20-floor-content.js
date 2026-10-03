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
      dialogueTurn('残响精灵·纱雾', 'guide', '三年前断讯以后，找不到船的人来问航路席，缺药的人找补给席。最后，这些消息都得送回名簿，家属才知道该去哪里等。', { expression: 'focus' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '看这道旧刻痕：最后一船离港后，留三天补齐回执，再撤下强制命令。没查清的名字继续留在档案里，值守人接着找。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '可王庭当时只给我两枚印：一枚写“继续救援”，一枚写“撤销登记”。', { cg: '/assets/anime/cg/liyue-noctia-missing-fourth-step-cg-audit-v3.webp', cgHold: 3, expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '第二枚旁边还刻着一句——未结案者将被清除。我看着那句话，以为停下命令，就是亲手把灰港的人再抹掉一次。', { expression: 'sorrow' }),
      dialogueTurn('旁白', null, '诺克缇娅抬手遮住“撤销登记”，指尖却碰到旁边撕裂的白痕。她挪开手，让璃看那道缺口：第四格只剩下“封存原件”几个残字。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '这里原来还有一步。先把回执和名簿收好，命令才能停下。陛下，你当时看见的那两枚印，少给了你这一页。', { expression: 'resolve' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '北辰七号四十七人已经到了北岸。无限延长上的签名也看清了，是奥术主权者；我们要带着这些记录去找他。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '他管着起源魔源，断讯时可以暂时延长救援。可后面还得让航路、补给、名簿三席看过同一道命令，分别确认。我的王庭改不动他的印。', { expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '总印送来时，写着“三席同意”。我连他们说了什么都没问，就让王庭继续封着……那时我多想有人告诉我，还能继续救。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '把这处缺口记下来。我们带上手里的原件往上走，先查药去了哪里，再找当年回答过的人。', { expression: 'resolve' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '离开前选一份见证契约吧。我们能陪一位亲历者沿她的线索继续查；她愿意留下的话，也会收进最后的记录。其余线索仍可以继续找。', { expression: 'gentle' }),
      dialogueTurn('绫星·璃', 'hero', '我会记得答应陪她查的事。眼下先去双谱温室，墙上的新命令还在往那里送药。', { expression: 'resolve' })
    ]),
    floor12: dialogueSequence('第十二阵：双谱温室', [
      dialogueTurn('旁白', null, '玻璃穹顶下，两排藤蔓沿着不同的刻度开花。左边是补给席使用的避难名单，右边是航路席发来的船次；只有姓名、船号和时间同时对上，温室才该配药。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '可此刻左边的藤叶绿得刺眼，右边却一片灰白。机械花苞每隔几息便吐出一支新药，地上的药瓶已经滚到门边。', { kind: 'narration' }),
      dialogueTurn('猫卫长·米露', 'cat_boss', '我循着药味找上来的。第一层的卫队一直收到补给，我以为这证明灰港还有人。要是求援者真的活着，我就不能丢下他们。'),
      dialogueTurn('猫卫长·米露', 'cat_boss', '你看，“第七船，需配药二十四人”。受领人的名字写满了，船次那边却空着。这批药到底要送给谁？'),
      dialogueTurn('旁白', null, '米露刮开瓶底的蜡，又刮开一层。三年的日期叠在同一张处方上，最上面那枚“重新配发”的印还没有干。她的指甲停了下来。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '人数、剂量，连船次记号都一样。这是三年前那张处方，每天换一个日期。总账没结清，温室就一直给它配药。'),
      dialogueTurn('猫卫长·米露', 'cat_boss', '我还以为，只要每天有药送来，门后就一定有人在等。有人来问，我却先亮爪子……他们当时是不是也拿着这样的旧瓶子？'),
      dialogueTurn('旁白', null, '米露把药瓶放回架上，手指抖了一下，险些碰倒旁边的一支。她扶住它，把标签朝外摆好，低头清出被药瓶堵住的门口。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '主路守卫后面有配药编号和供能记录。把它们带去脉冲锻炉，就能查这三年是谁一直在给温室送魔力。', { expression: 'focus' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '双谱宝库另外收着一枚月镜。它能复写航路席防护术式的节奏，也可以成为米露在会战中的信物。那是所有路线都可以选的绕路，不走也不影响继续追查。', { expression: 'gentle' }),
      dialogueTurn('猫卫长·米露', 'cat_boss', '编号给我留一份。下次再有人来问，我先听她说药送到了哪儿。'),
      dialogueTurn('绫星·璃', 'hero', '这一支瓶子也带上，底下三年的日期都还在。去锻炉找相同的时刻。', { expression: 'resolve' })
    ]),
    floor13: dialogueSequence('第十三阵：脉冲锻炉', [
      dialogueTurn('旁白', null, '穿过温室的阵列后，绫星·璃取得了完整的配药流向。其中每一笔魔力都来自同一个地方：脉冲锻炉；每次发放间隔也与“重新配发”的日期完全一致。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '越靠近炉心，地板的震动越像急促心跳。星、月两条回路仍向已经无人领取物资的灰港旧区送去热量和魔力。', { kind: 'narration' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '我认得这个节奏。最后一船出港那晚，我是锻炉的值守人。我把火力抬到最高，好让码头的引导灯在风暴里多亮三天。'),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '满载最多只能烧三天，再久炉管会裂。按约定，我们该停下来检修，给档案留一线微火。可计时每次快走完，又被拨回去了。'),
      dialogueTurn('旁白', null, '焰璃把长枪插进传能缝隙，挑出一条焦黑的铜带。上面的供能曲线在最后一船回执到达前一刻骤然抬满，此后再没下降。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '你看，铜带每抬一次火，温室就多印一个日期。同一批药重配了三年，这里的火也跟着烧了三年。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '铜带里的改动不只删掉了三日时限。它还把“归档待机”改成“持续救援”，封死了现场停炉的手段，并写下“未确认全员安全前，即使熄灭也要自行复燃”。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '印记的来路写在这里：起源魔源。它越过王庭，直接锁住了停炉处。焰璃，你当时解不开这道锁。', { expression: 'resolve' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '我试过，刚关好的阀又会被扳开。可等我拦下别人时，嘴里说的还是“有人会冷”。说得太久，我连停手都怕了。'),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '温室吃着我的火，楼下的守卫也靠它重新站起来。空屋和管道我都查过，可每次听见警报，还是怕自己漏听了一声呼救。'),
      dialogueTurn('旁白', null, '焰璃没有立刻熄炉。她先切断通往空管道的支路，又保留了档案环的微光。火声慢慢从咆哮降成均匀的呼吸，墙上第一次显出了那道改令的完整时刻。', { kind: 'narration' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '铜带末尾有去向：三矢竞技场。改令送到那里以后，要经过三名代理守卫，他们各留了一枚印。'),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '把那三枚印带回来。这边我压着，空管不再供能，档案的微火也不会灭。你们上去时，留点力气。')
    ]),
    floor14: dialogueSequence('第十四阵：三矢竞技场', [
      dialogueTurn('旁白', null, '三矢竞技场藏着断讯那夜的原始答复。锻炉铜带的去向签停在门前，三名守卫却没有退开；他们胸口各嵌着一枚分印。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '三条石路在中央封台前汇合。左路守卫胸前是船舵，代表航路席；右路是药瓶，代表补给席；中路是合起的名簿，代表名簿席。', { kind: 'narration' }),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '别用总印命令他们。三枚分印各收着一段旧回答，得胜过守卫，才能把记录完整带出来。'),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '延长多久、为了什么，三席当时都该亲眼看过，再各自点头。如今总印只剩一句“三席同意”，我要知道被省掉的那些话是什么。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '一枚单独亮起，就会被总印盖回去。三枚一起放到中央封台，才能读到原文。璃，都得带回来。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我曾拿着那枚总印，命令整座塔继续守下去。连他们答话的时刻，我都没看见。', { expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '这次让我站在封台旁等。等三份回答都展开以后，我再开口。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '好。塞蕾娜，替我看着封台。我去取印，三份都带回来。', { expression: 'resolve' }),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '三名代理守卫全部落败后，他们的分印才会同时回到中央封台，把三份原始回答并排展开。上行结界也会在那时解除。他们按旧规不会留手，你也不必把破坏印记当成捷径。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '三名守卫的打法完全不同：一个抢先手，一个用术式穿过护甲，一个靠连续攻击压住喘息。别只想着赢眼前这一场；我们还要带着足够的体力和魔力走到下一道门。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '下一站是折页档案馆。把印上的时刻和交货单放到一起，才能知道他们那时正在忙什么。', { expression: 'resolve' })
    ]),
    floor15: dialogueSequence('第十五阵：折页档案馆', [
      dialogueTurn('旁白', null, '三名代理守卫相继倒下后，中央封台展开了三段未经总印改写的时序。第一段留着主权签名与“无限延长”，后两段则记着三席各自盖下确认印的时刻。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '差了十七分钟。主权者先签，三席后答，可镜面还没展开他们看见的问题。珂珂这里有那一夜的停电账，先找出来。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '这排是交货单，那排是扣账，停电记录应该也在。小心红皮账，别让它又翻过去了。', { expression: 'resolve' }),
      dialogueTurn('旁白', null, '档案馆里没有史书，只有一排排送货单、药瓶封签和空箱回条。红封账本每翻过一轮，远处的货架就发出一声空洞的扣货响。', { kind: 'narration' }),
      dialogueTurn('阵间商人·珂珂', 'merchant', '别碰那本红皮账。它每翻一页，就从我名下扣掉又一批药。三年前我是灰港的供应商，最后那批二十四人份的药，是我亲手送上第七船的。'),
      dialogueTurn('阵间商人·珂珂', 'merchant', '船长当场点过五只药箱，还笑我把止痛药捆得像贵重珠宝。她在这张纸单上盖了收货印，又将副本交给航站。我没有可能把同一批药在三年后每天交付一次。'),
      dialogueTurn('旁白', null, '珂珂从柜台夹层抽出一张磨起毛边的单据。船号、五只药箱、二十四名需配药者、船长签名和交接时刻一应俱全；唯独高塔总账的“结清”栏始终空白。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '船长早就收了这五箱药。总账还空着，温室和锻炉就每天再做一遍；扣走的却一直是你的货。'),
      dialogueTurn('阵间商人·珂珂', 'merchant', '最初几天，我以为是航站忙乱，还真的按新订单重新装箱。后来我发现订单上连船长笔迹的折角都一样，才知道它只是把旧纸当新纸。'),
      dialogueTurn('阵间商人·珂珂', 'merchant', '我只好把空箱放在扣货口，把真药藏进柜台，免得后来真的伤员一瓶都买不到。我不敢停账，因为页面警告我：“终止配送将放弃未救助人员。”'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我也见过这样的警告。“停下就会删掉名字。”珂珂，把真药留好；我曾听了它三年，知道那句话有多难违抗。', { expression: 'sorrow' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '找到了。主权签名落下十七分钟后，主传讯线停电。三席盖印时，亮着的是各自岗位的问询镜，主权者那道延长令送不过去。', { expression: 'focus' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '他们到底看见什么问题，还得去三冠阶庭读原镜。先把这张停电账夹进去，时刻已经对上了。', { expression: 'focus' }),
      dialogueTurn('阵间商人·珂珂', 'merchant', '原单你们带走。看见船长签名那道折角了吗？以后再有人说我欠着这五箱药，就把它拿给他看。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '星卡封卷里还留着原始配送回执和赤焰蓄能信物。只有与焰璃签下“赤焰裂印”见证契约，封卷才会认人开门；不进那间书库，也不妨碍我们继续查主卷。若要补给，就在上行前买齐；再往上没有第二处商店。', { expression: 'gentle' }),
      dialogueTurn('绫星·璃', 'hero', '原单收好了。去镜轮双殿吧，澜音还有船长的回话要留下。', { expression: 'resolve' })
    ]),
    floor16: dialogueSequence('第十六阵：镜轮双殿', [
      dialogueTurn('旁白', null, '璃把珂珂那张磨旧的交货单放到双镜之间。左镜照着她按住纸角的手，右镜亮起，等着有人开口。澜音走近时，诺克缇娅也向镜面伸出了手。', { kind: 'narration' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '陛下，先让我说完。船长那句话，我守了三年；今天终于能把它留在这里。'),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '米露看见补给怎样被重复发放；我听见最后航船的回答；焰璃知道炉火为什么一直不停；鸦羽看得见回执被截去了哪里。四种声音各有边界，没有谁能替另外三个人说完。'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '封塔的命令是我下的。你们受过的伤，都发生在我的王庭之下。镜子若要一个人回答，为什么还要你先站过去？', { expression: 'sorrow' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '因为你没有在那条船的航线上。你可以告诉它，你怎样封了塔；请把船长的声音留给我。'),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '那晚我唱完引航的最后一段，听见她报人数。我正要回答，警报就响了。陛下，今天请你等我把那句话听完。'),
      dialogueTurn('旁白', null, '诺克缇娅的手停在镜前，随后慢慢垂下。澜音吸了一口气，起音却轻轻断开。璃把卷起的纸角压平，等她重新开口。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '四名候选人都可以说“不”，也可以在会战前改变主意。到了起源魔源前的会战，我们只能选三人上场；只有亲自回答、并且活着走完会战的人，才能把自己的那份见证亲手送进誊录台。', { expression: 'resolve' }),
      dialogueTurn('绫星·璃', 'hero', '在复苏环廊签下的契约，只决定我们陪澜音、焰璃或鸦羽中的一人把她亲历的那段查到底；米露的月镜则另有一条人人都能去的支路。拿到信物还不算完，当事人必须愿意作证，也必须亲自走过最后的会战，那份见证才真正成立。', { expression: 'resolve' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '我叫澜音，当年用鲸歌为第七船导航。我亲耳听见船长说：“北辰七号，四十七人，全部抵达北岸。”珂珂交来的原单上，船号、人数和收货时间也都对上了。'),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '这四十七个人到了岸。船长说完时还在喘气，可每个字都说得很清楚。请把她的回话收好；其他船上的人后来怎样，我还不知道。'),
      dialogueTurn('旁白', null, '右镜将那句话完整地收了进去，水色的光停在珂珂的船长签名旁。澜音等了一会儿，确认没有警报盖上来，才松开一直攥着的衣袖。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '水镜已经收好了。璃，把原单带上；三冠阶庭还有当年三席的问答镜，等我们去打开。', { expression: 'focus' })
    ]),
    floor17: dialogueSequence('第十七阵：三冠阶庭', [
      dialogueTurn('旁白', null, '三冠阶庭的拱顶下悬着三只原始问答镜。三矢竞技场取得的分印被逐一放入后，水晶镜面上的一枚总印分解成三列文字。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '露米将停电账压在三面镜前。原本挤在同一刻的文字渐渐分开，其中两列向后移了十七分钟。诺克缇娅贴近镜面，手指停在自己的回答旁。', { cg: '/assets/anime/cg/liyue-lumi-seventeen-minute-splice-cg-v8.webp', cgHold: 4, kind: 'narration' }),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '第一条发生在主传讯线尚未中断时。奥术主权者看见一则未完整的求援，担心仍有人留在风暴中，便用主权印删掉了三日截止，写下“在全员安全前，无限延长”。'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '他的签名是真的，删去期限也是他主动做的。但在那一刻，航路、补给、名簿三席还没有见过这道新命令，更不可能已经表示同意。'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '第二条发生在十七分钟后。高塔因风暴断电，航路、补给和名簿三席各自岗位上的问询镜同时亮起同一个问题：“主传讯线中断，是否在恢复供电前临时继续现场救援？”'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '航路席要灯继续亮，补给席怕伤员断药，名簿席还没点完名。三个“是”都留在这道问题下面：先撑到恢复供电。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '看最后这段，已经复电了。起源核心找不到延长令的答复，就从旧镜里找到了这三个“是”。它只认说话的人和答复，没有再读上面的问题。', { expression: 'focus' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '它把回答挪过去了。原来的签名还在，底下的问题却换成“无限延长”……总印就是这样亮起来的。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我认得名簿席那次回答，因为当时就是我守在王庭的问询镜前。灯火全灭，下面的人还在报名字。我只想让镜面再亮一会儿，等他们把最后几个人说完。', { expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '镜里这一声“是”，是我说的。我想等下面的人报完名字。后来总印亮起来，我又信了它，让王庭一直封了下去。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '别收镜。把那三个回答留在原来的问题下面，连同十七分钟的间隔一起带走。她们那晚说过的话，不能再被挪开。', { expression: 'resolve' }),
      dialogueTurn('绫星·璃', 'hero', '这里查清了，可船长的回执还扣在上面。我们去把它找回来，送到一直等着它的人手里。', { expression: 'resolve' }),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '航路记录指向澄空航渠。原件已经进过塔，被“全员安全前不得结案”这道命令引进了封印。沿着这条去向找。')
    ]),
    floor18: dialogueSequence('第十八阵：澄空航渠', [
      dialogueTurn('旁白', null, '澄空航渠没有水，只有一条条流动的光带。蓝色代表抵达，绿色代表离港，灰色代表暂时失联；它们本该把船只去向送往高塔各席，如今却在同一处湾道不断绕回最后一夜。', { kind: 'narration' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '别踩那条最亮的绿线。它看起来直通总账，实际上在第三个弯口潜入主权封印。每一封结案回执进去以后，都会被改标为“待全员安全后复核”。'),
      dialogueTurn('绫星·璃', 'hero', '锻炉上也留着这条命令，火一熄就催着再烧。这一句也刻进了航渠，连船长送来的回话都曾被它扣下。'),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '第七层那枚主权印把影线岔开了。绿线通向封印，蓝线折回主桥；当年的回执就是沿着这几个弯道，被拖离了去王庭的路。'),
      dialogueTurn('旁白', null, '鸦羽将紫线一根根探入光流，又忽然合掌收紧。一只几乎透明的虚空先驱从绿光中跌出，胸口像信箱一样半开，里面卡着一枚带船长印记的回执。', { cg: '/assets/anime/cg/liyue-yayu-intercepted-receipt-cg-audit-v3.webp', cgHold: 3, kind: 'narration' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '找到了。不是人在偷信，是这东西。顺序别弄反：回执比无限延长更早进塔，只是当时还在受风暴干扰的潮汐航渠里向王庭上送。后来断讯、上层新令生效，这东西才接过航渠，把“请结束紧急登记”改成“等待复核”，再把原件拖进主权封印。它不读信，只认那句：“全员安全前，任何结案回执均不可信。”三年来，一直如此。'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '每次等不到回执，我都以为船还在风里。我一次次按下“继续等待”，它却一直离王庭这么近……', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '这份上写着四十七人到岸，旁边那条灰线却还没有下落。难道只要有一个名字没查清，已经到岸的人也得永远困在这里？'),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '它先把回执判成无效，再拿“没有有效回执”证明警报不能停。自己制造缺口，再拿缺口证明自己正确。不是阴谋，反而更麻烦——因为没人需要每天重新下令。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '击败虚空先驱，就能从它胸口取回第七船的原始回执。日曜卡开启主航桥，这是上行必经之路；星蚀卡则能打开旁侧星渠。那里的结界会把能削弱摄政官哪一种术式写在门上，去不去由我们自己决定。', { expression: 'focus' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '先护住手里这一份。四十七人到岸，写得清清楚楚；其他船次还有罹难和失联的人，要去名簿里找。别让光流把它重新卷走。'),
      dialogueTurn('绫星·璃', 'hero', '先把回执拿回来。然后去回响王庭。船单只能告诉我们谁离港，不能替死者、失联者和还没查清的人说话。下一步，把整本名簿重新分清：谁已经抵达安全地，谁已经罹难，谁仍然只能写“待核实”。', { expression: 'resolve' })
    ]),
    floor19: dialogueSequence('第十九阵：回响王庭', [
      dialogueTurn('旁白', null, '虚空先驱倒下后，鸦羽从它胸口取出原始抵达回执。船长印、北岸港钟、抵达时刻、四十七名乘员中那二十四人的配药记录，与澜音记得的最后一句报告全部相符：北辰七号四十七人确已抵达北岸。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '回响王庭中没有王座，只有数百块悬在月光里的玻璃名牌。有的写着船号，有的系着黑带，还有的只留下“最后见于北码头，待家属确认”。', { kind: 'narration' }),
      dialogueTurn('回声摄政官', 'echo_regent', '停在门外，把回执放到月光下。这里的“死亡名簿”也收着活人的去向：到岸的记航次和地方，罹难的记确认人，还有这些只有最后线索、等着复查的名字。', { expression: 'grave' }),
      dialogueTurn('回声摄政官', 'echo_regent', '这一页三年没有新消息。有人叫我直接划到死者页，可最后见过她的人还没找到。我不能动这一笔。', { expression: 'grave' }),
      dialogueTurn('绫星·璃', 'hero', '所以你护着这些空着的地方。有人只想让名簿合上，你还在等最后一个能回答的人。'),
      dialogueTurn('回声摄政官', 'echo_regent', '也有人让我全写成平安抵达，说灰港已经空了。她们若回来问家人在哪儿，我拿什么指路？', { expression: 'grave' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '而我一听还有名字没查清，就让全塔继续救援。人已经在北岸生活，名字却还困在求援里；翻到罹难者那一页，我也只会继续等。', { cg: '/assets/anime/cg/liyue-echo-ledger-cg-audit-v3.webp', expression: 'knowing' }),
      dialogueTurn('旁白', null, '诺克缇娅蹲下，把第七船的名牌对准回执。灰光转绿时，旁边一块黑带牌轻轻碰上桌沿。她伸手扶住它，读完名字，才将它放回原处。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '四十七人的到岸时刻补上了。这几页黑带牌和后面的待核实记录，我另外夹好，原来的线索都留着。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '原册留给你。请给我一份核验副本，连同每一笔凭什么写、何时改过都带上。我会把它护到起源魔源。', { expression: 'resolve' }),
      dialogueTurn('回声摄政官', 'echo_regent', '那就把副本收稳。我和守卫阵会拦在前面；你得在攻击下保住每一页，才能带着王座执照上去。', { expression: 'grave' }),
      dialogueTurn('回声摄政官', 'echo_regent', '两枚月辉卡可以开启王座执照的封柜。柜门打开后，我会亲自守在上行口。胜过我，执照与名簿核验副本便由你们带走。', { expression: 'grave' }),
      dialogueTurn('绫星·璃', 'hero', '我们会带着副本去见奥术主权者。三日期限是他删的，我要把这些名字放到他面前。', { expression: 'resolve' })
    ]),
    floor20: dialogueSequence('第二十阵：起源魔源', [
      dialogueTurn('旁白', null, '起源魔源的门一打开，璃就听见各层传令管同时震响。中央悬着起源核心，破裂的印戒绕着它旋转，每转一圈，都重读一遍：“灰港紧急登记，无限延长。”', { kind: 'narration' }),
      dialogueTurn('旁白', null, '璃把珂珂那张起毛的交货单压在誊录台最前面。船长的签名已被人摸得发淡。她又放好回执、名簿核验副本和三席时序，抬头看向印戒下的人。', { kind: 'narration' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '这道船长印……我当年没有看见。你们把它带到这里来了。', { expression: 'regret' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '命令是你先签的，核心后来才把我们的临时回答补了上去。告诉我，你下笔时究竟看见了什么？', { expression: 'grave' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '撤离那时，通讯已经断断续续。我怕三日期限一到，仍在风里的求援会被当成旧信，便先删掉期限。原想等通讯恢复，再请三席逐一确认。', { expression: 'regret' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '我当时看到的是一封只传来半句的信：“北堤还有……”我不知道后半句是“还有人”还是“还有一船”。我没有等三席复核，因为我觉得，多开几天的代价总比少救一个人轻。', { expression: 'regret' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '我以为只是多等几天。后来我才知道，抵达回执其实比我的延长令更早进塔，只是还没送到王庭。等我的命令生效，核心反而把那份尚在航渠里的回执判成冲突，拖进了上层封印。再想撤令时，我自己的主权印也已经被锁进其中。', { expression: 'regret' }),
      dialogueTurn('旁白', null, '奥术主权者说完后将手放在印戒下方。破裂的光环立刻沿着他的手腕收紧，晶核发出冰冷提示：“原签署人与命令共同封存，禁止单方撤回。”', { cg: '/assets/anime/cg/liyue-noctia-sovereign-cg-audit-v3.webp', cgHold: 5, kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '珂珂等了三年，架上的药被一箱箱扣空；焰璃守着停不下的炉火。你说“多开几天”的时候，想过让谁来撑这几天吗？', { expression: 'resolve' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '没有。我只盯着那半封信。现在要把改令权交给你，得按旧法决斗；我自己动这道封印，核心就会再次锁住它。', { expression: 'acceptance' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '我拔过自己的印。刚拔下来，上面的抄本就刻出一枚新的，回执照旧被退回。璃，击败我，接过印权，才有办法走到核心面前。', { expression: 'acceptance' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '那就按它听得懂的方式打开门。回执、名簿和三位真正的见证者都已到场；我们取回的只是撤下错误命令的印权，不会删去灰港。', { expression: 'grave' }),
      dialogueTurn('绫星·璃', 'hero', '顺序很清楚。先让三名见证者带着自己的证词活着穿过前庭；再从主权者手里拿到改令权；最后面对起源核心，只停命令，不碰回执和名簿原件。共鸣池怎么分，开战前再算。', { expression: 'resolve' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '上面的传令管还亮着，旧抄本和未投递的信都在那里。先让眼前的核心停下，再去查它们，别让抄本把命令重新送回来。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我会把纸页护好。眼前这道门打开以后，剩下的路也一起走。', { expression: 'grave' }),
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
      dialogueTurn('残响精灵·纱雾', 'guide', '两枚旧印还亮着，“继续救援”和“删除登记”。璃，先压住回执，我来找誊录台的开口。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '所以我们才带来三份本人见证。用回执和名簿证明，归档不等于遗忘。', { expression: 'grave' }),
      dialogueTurn('绫星·璃', 'hero', '我按住了。把台打开，回执和名簿副本一起放进去。', { expression: 'resolve' })
    ]),
    bossOriginCorePost: dialogueSequence('起源之后：仍未投递', [
      dialogueTurn('绫星·璃', 'hero', '停了。先扶好受伤的人，纸页交给我。上面的传令管还在亮，我们喘口气再走。', { expression: 'resolve' }),
      dialogueTurn('旁白', null, '奥术主权者手腕上的蓝色束缚松开了。那枚裂开的主权印没有消失，他也没有把它摘下来，只用另一只手扶住还在发抖的指节。', { kind: 'narration' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '手能动了……这枚印我留着。卷册给我，我自己带着；我的那道命令也放在里面。', { expression: 'acceptance' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '这一卷最重，你抱好。我带另一卷。封塔的经过也在里面，到了上面，我自己说。', { expression: 'grave' }),
      dialogueTurn('旁白', null, '两人第一次并肩站在没有王座、也没有封印隔开的地方。谁也没有伸手和解。升降梯却已经在两人身后重新亮起。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '升降梯已经亮了。余烬登记库里还留着命令抄本，它们再送出来，旧警报就可能重响。未投递的信也都在上面。', { expression: 'focus' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '那就去找真正的归档方式。我要亲眼确认，警报停止以后，那些名字仍然有地方留下。', { expression: 'sorrow' }),
      dialogueTurn('奥术主权者', 'arcane_sovereign', '登记库里留着护送、校验、接力三套旧修复章程。再往上是余烬灯塔——只有那里能把最终结案真正送出高塔。方案是我参与设计的，哪里会卡住，我会告诉你们。', { expression: 'acceptance' }),
      dialogueTurn('绫星·璃', 'hero', '那就走。卷册贴着里侧拿，别让升降梯的风把散页卷走。', { expression: 'resolve' })
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
