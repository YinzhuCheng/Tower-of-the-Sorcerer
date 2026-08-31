export const GAME_VERSION = 9;
export const GRID_SIZE = 11;
export const TILE_SIZE = 58;

export const CARD_LABELS = {
  sun: '日曜卡',
  moon: '月辉卡',
  star: '星蚀卡'
};

export const ITEMS = {
  sun: { name: '日曜卡', kind: 'card', card: 'sun', amount: 1, description: '解除一道金色日曜结界。' },
  moon: { name: '月辉卡', kind: 'card', card: 'moon', amount: 1, description: '解除一道蓝色月辉结界。' },
  star: { name: '星蚀卡', kind: 'card', card: 'star', amount: 1, description: '解除一道红色星蚀结界。' },
  atk: { name: '绯晶碎片', kind: 'stat', atk: 4, description: '攻击永久 +4。' },
  def: { name: '苍晶碎片', kind: 'stat', def: 4, description: '防御永久 +4。' },
  dual: { name: '双色魔晶', kind: 'stat', atk: 7, def: 7, description: '攻击、防御永久 +7。' },
  hp: { name: '微光药露', kind: 'stat', hp: 320, maxHp: 320, description: '生命上限与当前生命 +320。' },
  hpLarge: { name: '星泉药剂', kind: 'stat', hp: 850, maxHp: 850, description: '生命上限与当前生命 +850。' },
  weapon: { name: '辉月魔刃', kind: 'stat', atk: 12, relic: '辉月魔刃', description: '攻击永久 +12。' },
  shield: { name: '龙鳞护符', kind: 'stat', def: 12, relic: '龙鳞护符', description: '防御永久 +12。' },
  codex: { name: '魔眼图鉴', kind: 'relic', relicKey: 'codex', relic: '魔眼图鉴', description: '解锁完整敌人图鉴；敌人的数值和预计耗血始终可直接悬停查看。' },
  compass: { name: '层间罗盘', kind: 'relic', relicKey: 'compass', relic: '层间罗盘', description: '可在已到达且上下通路开放的楼层间传送。' },
  lucky: { name: '招财星币', kind: 'relic', relicKey: 'lucky', relic: '招财星币', description: '此后击败敌人获得的金币翻倍。' },
  ward: { name: '静谧耳坠', kind: 'relic', relicKey: 'ward', relic: '静谧耳坠', description: '受到的无视防御魔法伤害降低 20%。' },
  holy: { name: '圣辉原液', kind: 'relic', relicKey: 'holy', relic: '圣辉原液', description: '立即使生命上限与当前生命翻倍。' }
};

export const ENEMIES = {
  mote: {
    name: '符文软泥娘', portrait: 'mote', faction: '无属性使魔', floor: 1,
    hp: 45, atk: 14, def: 1, gold: 4,
    description: '以微弱符文凝成的人形使魔。'
  },
  catScout: {
    name: '月影猫娘', portrait: 'cat_scout', faction: '月影眷属', floor: 1,
    hp: 95, atk: 22, def: 5, gold: 9,
    description: '行动迅捷，但正面防御较弱。'
  },
  catMage: {
    name: '铃术猫娘', portrait: 'cat_mage', faction: '月影眷属', floor: 1,
    hp: 90, atk: 24, def: 4, gold: 12, special: 'magic', magicPower: 18,
    description: '铃音冲击无视普通防御。'
  },
  catBoss: {
    name: '猫卫长·米露', portrait: 'cat_boss', faction: '第一阵守护者', floor: 1,
    hp: 240, atk: 32, def: 10, gold: 42, boss: true, core: '月影核心',
    reward: { hp: 360, maxHp: 360, atk: 5, def: 5, core: 1 },
    defeatDialogue: 'bossCat', description: '守护月白门廊的猫娘卫长。'
  },
  foxAcolyte: {
    name: '青叶狐巫', portrait: 'fox_acolyte', faction: '森罗术派', floor: 2,
    hp: 150, atk: 36, def: 12, gold: 16,
    description: '将木灵咒附着在护身符上。'
  },
  foxArcher: {
    name: '赤羽狐弓', portrait: 'fox_archer', faction: '森罗术派', floor: 2,
    hp: 130, atk: 38, def: 9, gold: 20, special: 'firstStrike',
    description: '先制射击：战斗开始前先攻击一次。'
  },
  vineDruid: {
    name: '藤冠祭司', portrait: 'fox_acolyte', faction: '森罗术派', floor: 2,
    hp: 185, atk: 40, def: 15, gold: 23, special: 'magic', magicPower: 28,
    description: '藤咒造成无视防御的固定魔法伤害。'
  },
  foxBoss: {
    name: '狐祝·绯叶', portrait: 'fox_boss', faction: '第二阵守护者', floor: 2,
    hp: 410, atk: 51, def: 20, gold: 86, boss: true, core: '森罗核心',
    reward: { hp: 420, maxHp: 420, atk: 5, def: 5, core: 1 },
    defeatDialogue: 'bossFox', description: '操纵森罗结界的九尾候补巫祝。'
  },
  whaleSinger: {
    name: '鲸歌术士', portrait: 'whale_singer', faction: '潮汐学派', floor: 3,
    hp: 230, atk: 58, def: 23, gold: 30, special: 'magic', magicPower: 34,
    description: '鲸歌会穿透铠甲，形成稳定的音压伤害。'
  },
  tideLancer: {
    name: '潮汐枪姬', portrait: 'tide_lancer', faction: '潮汐学派', floor: 3,
    hp: 270, atk: 64, def: 25, gold: 34,
    description: '攻守均衡的潮汐近卫。'
  },
  shellGuard: {
    name: '贝甲鲸娘', portrait: 'whale_singer', faction: '潮汐学派', floor: 3,
    hp: 330, atk: 56, def: 33, gold: 39,
    description: '高防御单位，适合在提升攻击后处理。'
  },
  whaleBoss: {
    name: '深蓝歌姬·澜音', portrait: 'whale_boss', faction: '第三阵守护者', floor: 3,
    hp: 660, atk: 70, def: 29, gold: 130, boss: true, core: '潮汐核心',
    reward: { hp: 500, maxHp: 500, atk: 6, def: 6, core: 1 },
    defeatDialogue: 'bossWhale', description: '以鲸歌维持深蓝回廊的阵眼。'
  },
  swordApprentice: {
    name: '银锋学徒', portrait: 'sword_apprentice', faction: '锋刃庭院', floor: 4,
    hp: 350, atk: 77, def: 31, gold: 44,
    description: '基础扎实的魔法剑士。'
  },
  swordKnight: {
    name: '蔷薇剑士', portrait: 'sword_knight', faction: '锋刃庭院', floor: 4,
    hp: 390, atk: 83, def: 34, gold: 50, special: 'firstStrike',
    description: '以居合获得先制攻击。'
  },
  bladePriestess: {
    name: '双刃祷姬', portrait: 'sword_knight', faction: '锋刃庭院', floor: 4,
    hp: 370, atk: 72, def: 32, gold: 56, special: 'doubleHit',
    description: '每次反击会连续造成两段伤害。'
  },
  swordBoss: {
    name: '剑圣·塞蕾娜', portrait: 'sword_boss', faction: '第四阵守护者', floor: 4,
    hp: 920, atk: 90, def: 39, gold: 180, boss: true, core: '锋刃核心',
    reward: { hp: 600, maxHp: 600, atk: 6, def: 6, core: 1 },
    defeatDialogue: 'bossSword', description: '以纯粹剑理封锁魔力流动的剑圣。'
  },
  dragonWhelp: {
    name: '幼焰龙娘', portrait: 'dragon_whelp', faction: '赤焰龙脉', floor: 5,
    hp: 470, atk: 99, def: 42, gold: 64,
    description: '以龙鳞抵消低强度攻击。'
  },
  flameCaster: {
    name: '赤炎术姬', portrait: 'flame_caster', faction: '赤焰龙脉', floor: 5,
    hp: 420, atk: 104, def: 38, gold: 70, special: 'magic', magicPower: 48,
    description: '火咒造成无视防御的固定伤害。'
  },
  dragonGuard: {
    name: '熔甲龙卫', portrait: 'dragon_whelp', faction: '赤焰龙脉', floor: 5,
    hp: 560, atk: 101, def: 49, gold: 76,
    description: '高生命、高防御的阵线守卫。'
  },
  dragonBoss: {
    name: '龙姬·焰璃', portrait: 'dragon_boss', faction: '第五阵守护者', floor: 5,
    hp: 1280, atk: 114, def: 52, gold: 250, boss: true, core: '赤焰核心',
    reward: { hp: 720, maxHp: 720, atk: 7, def: 7, core: 1 },
    defeatDialogue: 'bossDragon', description: '赤焰龙脉的继承者，正被魔阵强制驱动。'
  },
  starWitch: {
    name: '星图魔女', portrait: 'star_witch', faction: '天穹术派', floor: 6,
    hp: 560, atk: 122, def: 51, gold: 86, special: 'magic', magicPower: 58,
    description: '星辉术式无视普通防御。'
  },
  mirrorDoll: {
    name: '镜界人偶', portrait: 'mirror_doll', faction: '天穹术派', floor: 6,
    hp: 650, atk: 116, def: 58, gold: 92,
    description: '镜面装甲拥有较高防御。'
  },
  cometArcher: {
    name: '彗矢术姬', portrait: 'star_witch', faction: '天穹术派', floor: 6,
    hp: 520, atk: 128, def: 48, gold: 96, special: 'firstStrike',
    description: '彗矢会在正式交锋前命中。'
  },
  astralBoss: {
    name: '天穹魔女·露米', portrait: 'astral_boss', faction: '第六阵守护者', floor: 6,
    hp: 1650, atk: 137, def: 64, gold: 330, boss: true, core: '天穹核心',
    reward: { hp: 850, maxHp: 850, atk: 8, def: 8, core: 1 },
    defeatDialogue: 'bossAstral', description: '维护星图演算的首席魔女。'
  },
  shadowNinja: {
    name: '影缝忍姬', portrait: 'shadow_ninja', faction: '虚影术派', floor: 7,
    hp: 640, atk: 143, def: 59, gold: 112, special: 'firstStrike',
    description: '从阴影中发动先制突袭。'
  },
  voidPriestess: {
    name: '虚空祭司', portrait: 'void_priestess', faction: '虚影术派', floor: 7,
    hp: 700, atk: 151, def: 64, gold: 120, special: 'magic', magicPower: 72,
    description: '虚空咏唱无视普通防御。'
  },
  duskDragon: {
    name: '暮色龙娘', portrait: 'dragon_whelp', faction: '虚影术派', floor: 7,
    hp: 850, atk: 148, def: 73, gold: 132,
    description: '被影术侵染的高防御龙娘。'
  },
  shadowBoss: {
    name: '影织姬·鸦羽', portrait: 'shadow_boss', faction: '第七阵守护者', floor: 7,
    hp: 2180, atk: 161, def: 76, gold: 450, boss: true, core: '虚影核心',
    reward: { hp: 1000, maxHp: 1000, atk: 9, def: 9, core: 1 },
    defeatDialogue: 'bossShadow', description: '替女王编织无声结界的影术统领。'
  },
  silenceGuard: {
    name: '寂静近卫', portrait: 'silence_guard', faction: '无声王庭', floor: 8,
    hp: 920, atk: 169, def: 76, gold: 150,
    description: '最终阵列的银甲近卫。'
  },
  eclipseMage: {
    name: '蚀月法师', portrait: 'eclipse_mage', faction: '无声王庭', floor: 8,
    hp: 820, atk: 176, def: 70, gold: 165, special: 'magic', magicPower: 86,
    description: '蚀月术造成高额固定魔法伤害。'
  },
  crownKnight: {
    name: '王冠剑姬', portrait: 'sword_boss', faction: '无声王庭', floor: 8,
    hp: 1080, atk: 181, def: 84, gold: 185, special: 'firstStrike',
    description: '最后的近卫剑姬，拥有先制攻击。'
  },
  finalQueen: {
    name: '无声女王·诺克缇娅', portrait: 'final_queen', faction: '魔阵主宰', floor: 8,
    hp: 2850, atk: 186, def: 90, gold: 800, boss: true, phaseNext: 'voidCore',
    phaseDialogue: 'queenPhase', description: '夺走璃全部魔力、试图冻结世界咏唱的女王。'
  },
  voidCore: {
    name: '黯星魔阵核心', portrait: 'void_core', faction: '最终形态', floor: 8,
    hp: 3400, atk: 205, def: 98, gold: 0, boss: true, finalBoss: true,
    special: 'magic', magicPower: 164, defeatDialogue: 'ending',
    description: '女王与七重阵眼融合后的纯粹魔法核心。'
  }
};

export const DIALOGUES = {
  prologue: {
    speaker: '残响精灵·纱雾', portrait: 'guide',
    title: '序章：被夺去的咏唱',
    text: '无声女王夺走了璃的魔力，并把七枚核心锁进高塔。守卫被术式操控，但仍有清醒的一面。\n\n所有战斗都是固定数值。靠近或悬停敌人，就能先看到预计耗血。'
  },
  floor2: {
    speaker: '绫星·璃', portrait: 'hero', title: '第二阵：森罗双钥',
    text: '月影核心让璃重新感到魔力。狐巫们同样被操控。\n\n相同的Ⅰ标记连接守卫、宝库封印与招财星币；A 机关全部激活后会解除同标记的藤蔓封锁。'
  },
  floor3: {
    speaker: '残响精灵·纱雾', portrait: 'guide', title: '第三阵：深蓝回廊',
    text: '两枚水纹开关同时控制上行门。\n\n这里开始出现魔法反击：它无视防御，战前请看预计耗血。'
  },
  floor4: {
    speaker: '绫星·璃', portrait: 'hero', title: '第四阵：锋刃庭院',
    text: '这里的剑士只看攻防。攻击不够就无法破防；防御足够可让普通反击归零。\n\n锻炉里的魔刃会直接提高攻击。'
  },
  floor5: {
    speaker: '龙姬·焰璃', portrait: 'dragon_boss', title: '第五阵：赤焰龙脉',
    text: '“上层的火不会让路。想过去，就证明你的判断。”\n\n这里有阵间商店：购买效果与下一次价格都写在商店面板里。'
  },
  floor6: {
    speaker: '天穹魔女·露米', portrait: 'astral_boss', title: '第六阵：星镜书库',
    text: '星镜只接受顺序：新月 → 半月 → 满月。\n\n踩错只会重置进度，不消耗卡牌或生命。'
  },
  floor7: {
    speaker: '影织姬·鸦羽', portrait: 'shadow_boss', title: '第七阵：虚影织界',
    text: '“三相结界要日、月、星各一张卡。”\n\n穿过后是王庭；最后一张日曜卡还要留给王座。'
  },
  floor8: {
    speaker: '无声女王·诺克缇娅', portrait: 'final_queen', title: '终阵：无声王座',
    text: '“你拿回了核心，但王座不会因此打开。”\n\n悬停守卫可查看数值与预计耗血；王座封印会显示仍需解除的条件。'
  },
  bossCat: {
    speaker: '猫卫长·米露', portrait: 'cat_boss', title: '月影核心回收',
    text: '“命令解除了。核心归你。”\n\n璃取回第一枚核心，也重新感到微弱的魔力。'
  },
  bossFox: {
    speaker: '狐祝·绯叶', portrait: 'fox_boss', title: '森罗核心回收',
    text: '“钥匙该用在何处，你已经自己判断过了。”'
  },
  bossWhale: {
    speaker: '深蓝歌姬·澜音', portrait: 'whale_boss', title: '潮汐核心回收',
    text: '鲸歌停下。潮汐核心回到璃手中，魔力回路又稳了一些。'
  },
  bossSword: {
    speaker: '剑圣·塞蕾娜', portrait: 'sword_boss', title: '锋刃核心回收',
    text: '“规则写在数值里。你看清了，也承担了。”\n\n塞蕾娜收剑，让出通路。'
  },
  bossDragon: {
    speaker: '龙姬·焰璃', portrait: 'dragon_boss', title: '赤焰核心回收',
    text: '龙火熄灭，强制契约断裂。焰璃把赤焰核心交给璃：“上去吧，别让她替所有人下结论。”'
  },
  bossAstral: {
    speaker: '天穹魔女·露米', portrait: 'astral_boss', title: '天穹核心回收',
    text: '“结果修正：你已经有胜算。”\n\n露米解除星图封锁，交出第六枚核心。'
  },
  bossShadow: {
    speaker: '影织姬·鸦羽', portrait: 'shadow_boss', title: '虚影核心回收',
    text: '影线一根根断开。鸦羽低声说：“她怕的不是你的力量，是你还能自己选择。”'
  },
  queenPhase: {
    speaker: '无声女王·诺克缇娅', portrait: 'final_queen', title: '最终术式展开',
    text: '女王与黯星核心融合。核心的魔法反击无视防御。\n\n第二阶段紧接着开始，战前请确认生命和附刃档位。'
  },
  ending: {
    speaker: '绫星·璃', portrait: 'hero', title: '终章：魔法重新被选择',
    text: '黯星核心破碎，守卫们恢复意识。\n\n璃没有夺走任何人的魔力；高塔的命令终于失效。'
  }
};

function parseMap(text) {
  const rows = text.trim().split('\n').map((row) => row.trim().split(/\s+/));
  if (rows.length !== GRID_SIZE || rows.some((row) => row.length !== GRID_SIZE)) {
    const widths = rows.map((row) => row.length).join(',');
    throw new Error(`Invalid map dimensions: ${rows.length} rows, widths ${widths}`);
  }
  return rows;
}

export const FLOORS = [
  {
    id: 0,
    number: 1,
    title: '月白门廊',
    objective: '查看敌人耗血，击败猫卫长米露并回收月影核心。',
    intro: 'prologue',
    boss: 'catBoss',
    theme: { floor: 0x20203b, floorAlt: 0x29264a, wall: 0x504873, glow: 0xb9a8ff, fog: 0x171528 },
    map: parseMap(`
      # # # # # # # # # # #
      # . item:hp enemy:mote . # item:atk enemy:catScout enemy:catBoss U #
      # . # # door:sun # . # # . #
      # item:sun # enemy:catScout . . item:def # item:moon enemy:catMage #
      # . # . # # # # . # #
      # . enemy:mote . # item:codex . enemy:catScout . # #
      # # # door:sun # . # # . # #
      # item:hp item:sun . enemy:mote . # shop item:sun . #
      # . # # # # # . # . #
      # S . item:sun door:sun enemy:mote item:def . item:hp . #
      # # # # # # # # # # #
    `)
  },
  {
    id: 1,
    number: 2,
    title: '森罗回廊',
    objective: '激活藤蔓开关，击败狐祝绯叶并回收森罗核心。',
    intro: 'floor2',
    boss: 'foxBoss',
    theme: { floor: 0x18362d, floorAlt: 0x20463a, wall: 0x42694c, glow: 0x8af0b3, fog: 0x10251f },
    map: parseMap(`
      # # # # # # # # # # #
      # item:def enemy:foxArcher . . # item:atk enemy:foxAcolyte enemy:foxBoss U #
      # . # # door:sun # . # # . #
      # item:moon # enemy:foxAcolyte . . switch:vine # item:hp enemy:foxArcher #
      # . # . # # # # gate:vine # #
      # . enemy:vineDruid . # item:atk . enemy:foxArcher . # #
      # # # door:moon # . # # . # #
      # item:moon . . enemy:foxAcolyte . # shop item:sun . #
      # . # # # # # . # . #
      # D . item:sun door:sun enemy:foxAcolyte item:def . item:hp . #
      # # # # # # # # # # #
    `),
    puzzles: { switches: { vine: ['vine'] } }
  },
  {
    id: 2,
    number: 3,
    title: '深蓝回廊',
    objective: '同时激活两枚潮汐开关，穿过水纹门并回收潮汐核心。',
    intro: 'floor3',
    boss: 'whaleBoss',
    theme: { floor: 0x143650, floorAlt: 0x1b4767, wall: 0x356c8c, glow: 0x7fddff, fog: 0x0c2538 },
    map: parseMap(`
      # # # # # # # # # # #
      # item:atk enemy:shellGuard . . # item:hp enemy:whaleSinger enemy:whaleBoss U #
      # . # # door:moon # gate:tide # # . #
      # switch:tideB # enemy:tideLancer . item:def . # item:moon enemy:whaleSinger #
      # . # . # # # # . # #
      # item:compass enemy:whaleSinger . # item:hpLarge . enemy:shellGuard . # #
      # # # door:sun # . # # . # #
      # item:sun . . enemy:tideLancer . # switch:tideA item:def . #
      # . # # # # # . # . #
      # D . item:moon door:moon enemy:whaleSinger item:atk . item:hp . #
      # # # # # # # # # # #
    `),
    puzzles: { switches: { tide: ['tideA', 'tideB'] } }
  },
  {
    id: 3,
    number: 4,
    title: '锋刃庭院',
    objective: '开启锻炉机关，取得辉月魔刃并击败剑圣塞蕾娜。',
    intro: 'floor4',
    boss: 'swordBoss',
    theme: { floor: 0x2d303a, floorAlt: 0x383b48, wall: 0x686b78, glow: 0xffd7a3, fog: 0x1a1c23 },
    map: parseMap(`
      # # # # # # # # # # #
      # item:hp enemy:swordKnight . . # item:weapon enemy:swordBoss U . #
      # . # # door:moon # . # # . #
      # item:def # enemy:bladePriestess . item:atk . # item:moon enemy:swordApprentice #
      # . # . # # # # . # #
      # . enemy:swordApprentice . switch:forge item:hpLarge . enemy:swordKnight . # #
      # # # gate:forge # . # # . # #
      # item:star . . enemy:swordKnight . # door:star item:lucky item:sun #
      # . # # # # # . # . #
      # D . item:sun door:sun enemy:swordApprentice item:def . item:hp . #
      # # # # # # # # # # #
    `),
    puzzles: { switches: { forge: ['forge'] } }
  },
  {
    id: 4,
    number: 5,
    title: '赤焰龙脉',
    objective: '解除双重龙焰封锁，取得龙鳞护符并解放龙姬焰璃。',
    intro: 'floor5',
    boss: 'dragonBoss',
    theme: { floor: 0x431b18, floorAlt: 0x59251d, wall: 0x843b28, glow: 0xff9a5c, fog: 0x2a100e },
    map: parseMap(`
      # # # # # # # # # # #
      # item:dual enemy:dragonGuard . . # item:shield enemy:flameCaster enemy:dragonBoss U #
      # . # # gate:ember # . # # . #
      # switch:emberB # enemy:dragonWhelp . item:atk . # item:moon enemy:flameCaster #
      # . # . # # # # . # #
      # item:hpLarge enemy:flameCaster . # item:def . enemy:dragonGuard . # #
      # # # door:moon # . # # . # #
      # item:star . . enemy:dragonWhelp . # switch:emberA item:atk . #
      # . # # # # # . # door:star #
      # D . item:moon door:moon enemy:dragonWhelp item:def . item:hp . #
      # # # # # # # # # # #
    `),
    puzzles: { switches: { ember: ['emberA', 'emberB'] } }
  },
  {
    id: 5,
    number: 6,
    title: '星镜书库',
    objective: '依次踏过新月、半月、满月符文，开启星镜门并击败露米。',
    intro: 'floor6',
    boss: 'astralBoss',
    theme: { floor: 0x211b4b, floorAlt: 0x302464, wall: 0x5c4d91, glow: 0xc18cff, fog: 0x14102d },
    map: parseMap(`
      # # # # # # # # # # #
      # item:dual enemy:mirrorDoll . . # item:holy enemy:starWitch enemy:astralBoss U #
      # . # # gate:mirror # . # # . #
      # rune:C # enemy:cometArcher . item:def . # item:star enemy:starWitch #
      # . # . # # # # . # #
      # item:hpLarge enemy:starWitch . rune:B item:atk . enemy:mirrorDoll . # #
      # # # door:star # . # # . # #
      # item:moon . . enemy:cometArcher . # rune:A item:def . #
      # . # # # # # . # door:moon #
      # D . item:star door:star enemy:mirrorDoll item:atk . item:hp . #
      # # # # # # # # # # #
    `),
    puzzles: { sequence: { order: ['A', 'B', 'C'], gate: 'mirror', labels: { A: '新月', B: '半月', C: '满月' } } }
  },
  {
    id: 6,
    number: 7,
    title: '虚影织界',
    objective: '集齐日、月、星三张卡，穿过三相结界并击败影织姬鸦羽。',
    intro: 'floor7',
    boss: 'shadowBoss',
    theme: { floor: 0x201526, floorAlt: 0x2d1c36, wall: 0x59345f, glow: 0xff77b7, fog: 0x120c17 },
    map: parseMap(`
      # # # # # # # # # # #
      # item:ward enemy:duskDragon . . # item:dual enemy:voidPriestess enemy:shadowBoss U #
      # . # # gate:tri # . # # . #
      # item:sun # enemy:shadowNinja . item:def . # item:star enemy:voidPriestess #
      # . # . # # # # . # #
      # item:hpLarge enemy:voidPriestess . # item:atk . enemy:duskDragon . # #
      # # # door:moon # . # # . # #
      # item:moon . . enemy:shadowNinja . # shop item:star . #
      # . # # # # # . # door:star #
      # D . item:moon door:moon enemy:duskDragon item:atk . item:hp . #
      # # # # # # # # # # #
    `),
    puzzles: { triGate: 'tri' }
  },
  {
    id: 7,
    number: 8,
    title: '无声王座',
    objective: '突破王庭近卫，击败无声女王及其黯星核心。',
    intro: 'floor8',
    boss: 'voidCore',
    theme: { floor: 0x211526, floorAlt: 0x301b35, wall: 0x6b3b63, glow: 0xff8fcf, fog: 0x100a13 },
    map: parseMap(`
      # # # # # # # # # # #
      # item:dual enemy:crownKnight . enemy:eclipseMage . item:hpLarge enemy:finalQueen . . #
      # . # # door:star # . # # . #
      # item:hpLarge # enemy:silenceGuard . item:atk . # item:star enemy:eclipseMage #
      # . # . # # # # . # #
      # item:def enemy:eclipseMage . # item:dual . enemy:crownKnight . # #
      # # # door:moon # . # # . # #
      # item:moon . . enemy:silenceGuard . # shop item:hpLarge . #
      # . # # # # # . # door:sun #
      # D . item:sun door:sun enemy:crownKnight item:def . item:hpLarge . #
      # # # # # # # # # # #
    `)
  }
];

export const RELIC_LABELS = {
  codex: '魔眼图鉴',
  compass: '层间罗盘',
  lucky: '招财星币',
  ward: '静谧耳坠',
  holy: '圣辉原液'
};

export const SHOP_OPTIONS = [
  { id: 'hp', label: '生命咏唱', description: '生命上限与当前生命 +900', effect: { hp: 900, maxHp: 900 } },
  { id: 'atk', label: '锋芒咏唱', description: '攻击永久 +5', effect: { atk: 5 } },
  { id: 'def', label: '守护咏唱', description: '防御永久 +5', effect: { def: 5 } },
  { id: 'mpRestore', label: '回响补魔', description: '恢复 100 MP', effect: { mp: 100 }, magicOnly: true },
  { id: 'maxMp', label: '以太扩容', description: '魔力上限 +20，并恢复 20 MP', effect: { maxMp: 20, mp: 20 }, magicOnly: true }
];

export function getShopCost(state) {
  return 45 + state.shopPurchases * 25;
}

export function findToken(map, token) {
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      if (map[y][x] === token) return { x, y };
    }
  }
  return null;
}
