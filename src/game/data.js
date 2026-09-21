export const GAME_VERSION = 10;
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
    name: '藤冠祭司', portrait: 'vine_druid', faction: '森罗术派', floor: 2,
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
    name: '贝甲鲸娘', portrait: 'shell_guard', faction: '潮汐学派', floor: 3,
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
    name: '双刃祷姬', portrait: 'blade_priestess', faction: '锋刃庭院', floor: 4,
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
    name: '熔甲龙卫', portrait: 'dragon_guard', faction: '赤焰龙脉', floor: 5,
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
    name: '彗矢术姬', portrait: 'comet_archer', faction: '天穹术派', floor: 6,
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
    name: '暮色龙娘', portrait: 'dusk_dragon', faction: '虚影术派', floor: 7,
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
    name: '王冠剑姬', portrait: 'crown_knight', faction: '无声王庭', floor: 8,
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
    title: '序章：被夺去的咏唱',
    turns: [
      {
        kind: 'narration',
        speaker: '旁白',
        cg: '/assets/anime/cg/liyue-prologue-tower-cg.webp',
        cgHold: 6,
        text: '三年前，长期战争刚刚停火，海港避难城“灰港”却没有等来真正的平静。停战当夜，一场混着海潮与失控魔力的风暴从外海逼近。灰港建在低于海堤的旧船坞里，那里挤着伤员、失去住处的孩子、船工和来不及返乡的人；一旦海堤失守，最先被淹没的就是他们。'
      },
      {
        kind: 'narration',
        speaker: '旁白',
        text: '灰港没有能力单独组织数千人的撤离。城边的高塔因此临时接管了整场行动：门廊辨认来者，名册记录谁上了哪艘船，导航台引船穿过风暴，巡卫保护通道，炉心给避难屋供暖，星镜核对记录，权限网则负责确认每一道命令由谁发出、何时应该结束。'
      },
      {
        kind: 'narration',
        speaker: '旁白',
        text: '这套系统原本只是为了撑过一个夜晚。最后一艘撤离船抵达北岸后，船长应当把一份带有船号、人数、抵达时间和本人签名的回执送回高塔。所谓“回执”，并不是一句“我们出发了”，而是目的地真正回答“我们已经收到这批人”。高塔收到它，才有资格宣布救援结束。'
      },
      {
        kind: 'narration',
        speaker: '旁白',
        text: '船队最终离开了灰港，北岸也在第二天收容了最后一批撤离者。三年后的今天，港口早已重建，旧船坞变成了新码头，孩子们也已经长大。可高塔的门始终没有打开，里面的警钟仍按三年前的频率鸣响，仿佛那一夜从未结束。'
      },
      {
        kind: 'narration',
        speaker: '旁白',
        text: '站在塔门前的少女叫绫星·璃。三年前，她是护送撤离队伍的魔术师之一。她的拿手术式不是单纯用来攻击的咒文，而是一套七段式护航咏唱：七个段落分别帮助高塔辨认来者、整理名册、传递航路回音、保护通道、稳定供能、校验记录和追踪权限。'
      },
      {
        speaker: '绫星·璃',
        portrait: 'hero', expression: 'guarded',
        text: '我最后一次站在这里时，灰港还在下雨。门外全是等船的人，塔里每一层都在喊不同的数字。我负责把七段咏唱接在一起，让这些系统至少能互相听懂。那时候我以为，只要最后一艘船离港，一切就会结束。'
      },
      {
        kind: 'narration',
        speaker: '旁白',
        text: '事情没有按她想的结束。高塔的守护者——无声女王·诺克缇娅——在风暴最猛烈的时候封闭了塔门。这个决定一开始并不是为了囚禁谁：她担心失控魔力沿着开放通道追上撤离船，也担心通讯中断后仍有人被漏在灰港。'
      },
      {
        kind: 'narration',
        speaker: '旁白',
        text: '真正的问题发生在封锁之后。诺克缇娅一直没有收到她认定有效的“全员安全”回执。她看到的登记网仍有四十七个人处在“等待确认”，于是她不敢结束紧急状态。她害怕警报一停，旧程序就会把这些未结案的名字一起清掉。'
      },
      {
        speaker: '绫星·璃',
        portrait: 'hero', expression: 'guarded',
        text: '北岸的纪念册里有北辰七号的完整乘员名单，连当年最后四十七个人后来住在哪个街区都能查到。外面的世界知道他们到了；只有塔里的记录还坚持说，他们“下落未确认”。这不是普通的资料缺失，是同一件事被两个系统写成了相反的结果。'
      },
      {
        kind: 'narration',
        speaker: '旁白',
        text: '璃身边漂着一名银蓝色的小小精灵。她叫纱雾，是高塔旧通讯术式留下的“残响精灵”。战争结束后，大部分通讯精灵都随线路停机消散；纱雾却因为长期记录璃的护航咏唱和塔内回声，保留了自我意识。'
      },
      {
        speaker: '残响精灵·纱雾',
        portrait: 'guide', expression: 'gentle',
        text: '先说明一件事：我不是一本会自己回答问题的全知档案。普通线路、低权限回声、哪一层还有残留记录，我大多能读；王庭以上被封存的原始签名和主权命令，我读不到。要是我什么都知道，我们就不用再进塔了。'
      },
      {
        speaker: '残响精灵·纱雾',
        portrait: 'guide', expression: 'watchful',
        text: '我能确定的是，最后一艘船的回执并非从未出现。它进入过高塔的导航回路，却没有完成最后的结案。所谓“结案”，只是根据证据说明每个人后来怎样，并停止紧急命令继续驱使守卫和资源；它本来不等于删掉档案。'
      },
      {
        speaker: '残响精灵·纱雾',
        portrait: 'guide', expression: 'watchful',
        text: '诺克缇娅当年看到的却像是只有两个选择：继续救援，或者撤销登记。她把“撤销登记”理解成“让未确认的人从记录里消失”，所以一直选择前者。最初是为了等一份可能迟到的回答，后来即使她已经看见守卫们在受苦，也不敢亲手按下停止。'
      },
      {
        speaker: '绫星·璃',
        portrait: 'hero', expression: 'stern',
        text: '她的害怕有来由，但不能因此把三年里发生的一切都说成“没有办法”。米露她们被迫攻击来访者，炉火给空屋供暖，警报每天重播。诺克缇娅必须为她继续维持这套命令负责；我也要弄清，是谁让她看到的选择只剩那两个。'
      },
      {
        speaker: '残响精灵·纱雾',
        portrait: 'guide', expression: 'lament',
        cg: '/assets/anime/cg/liyue-seven-cantos-severed-cg-audit-v3.webp',
        cgHold: 6,
        text: '还有你自己。三年前你赶来接应时，诺克缇娅已经快耗尽维持登记网的魔力。她没有杀你，而是强行把你的七段护航咏唱从魔力回路里拆开，分别嵌进七层阵眼。七段咏唱变成七枚核心，替她继续支撑整座塔。'
      },
      {
        speaker: '残响精灵·纱雾',
        portrait: 'guide', expression: 'focus',
        text: '七段原本各有很具体的作用：月影负责辨认来者，森罗负责姓名与船号，潮汐传递船队回音，锋刃保护撤离通道，赤焰维持避难屋供能，天穹核对不同记录是否一致，虚影追踪一道命令究竟从谁的权限流出。它们被拆开后，每一层只剩自己的职责，却失去了彼此纠错的能力。'
      },
      {
        kind: 'narration',
        speaker: '旁白',
        text: '七枚核心还被分别交给七名守护者。她们不是失去记忆的傀儡：她们仍记得璃，也知道灰港已经过去了三年，甚至能清楚说出命令哪里不合理。可只要登记网判定有人在妨碍“仍未结束的救援”，核心就会接管她们的动作，逼她们继续执行旧职责。'
      },
      {
        speaker: '绫星·璃',
        portrait: 'hero', expression: 'guarded',
        text: '也就是说，我面对的不是七个想杀我的敌人，而是七个被工作和命令绑住的人。我要做的第一件事，是把核心从她们身上取回来，让她们重新能决定自己的手该不该挥下去。'
      },
      {
        speaker: '残响精灵·纱雾',
        portrait: 'guide', expression: 'gentle',
        text: '而每拿回一枚核心，你不仅会恢复一段魔力，也会得到那一层保存的原始记录。第一层可能只有一段出发录音，第二层可能只有一页名单；单看都不足以结论，可把它们按时间接起来，就能重新回答“那一夜到底发生了什么”。'
      },
      {
        speaker: '绫星·璃',
        portrait: 'hero', expression: 'guarded',
        text: '所以我的目标不是一路打到王座，再逼诺克缇娅说一句“我错了”。我要确认最后一艘船什么时候出发、什么时候抵达，封锁原本应该什么时候结束，命令后来被谁改过，又是谁让真正的回执没能抵达她手里。'
      },
      {
        kind: 'narration',
        speaker: '旁白',
        text: '璃抬手碰了碰喉间。那里没有伤口，却像缺了七个音节。三年来，她无法再唱完整的护航术；每当她试着接上缺失的部分，塔内七层就会依次回响，像七个人在不同房间里同时回答。'
      },
      {
        speaker: '绫星·璃',
        portrait: 'hero', expression: 'resolve',
        text: '我会收回七段咏唱，解开七名守护者的强制契约，把她们保存的证据一份份带到王座前。若诺克缇娅仍坚持封塔，我会阻止她；若她也是被错误记录困住的人，我会让她亲眼看见哪里出了错。两件事并不冲突。'
      },
      {
        speaker: '残响精灵·纱雾',
        portrait: 'guide', expression: 'focus',
        text: '第一层是月白门廊。它原本负责确认“谁进了塔、谁离开了塔”，守护者米露也在那里。进入以后先别急着清掉所有敌人：卡牌只能开对应的门，药露和属性碎片数量有限，每场战斗损失的生命都会带到下一层。'
      },
      {
        speaker: '绫星·璃',
        portrait: 'hero', expression: 'resolve',
        text: '那就从最简单的问题开始：三年前，灰港最后一批人究竟有没有离开。先把第一枚月影核心带回来，再顺着它留下的记录往上查。',
        choices: [
          { label: '“先确认每场战斗的损伤。”', response: '璃点了点头：先看清代价。能绕开的战斗就绕开，把力量留给真正必须打破的契约。' },
          { label: '“先找能回收的资源。”', response: '璃抬头望向塔内：先看门、卡牌和补给的位置。资源不是清图奖励，是让我们有余力把人救出来的东西。' }
        ]
      }
    ]
  },
  floor2: {
    title: '第二阵：森罗双钥',
    turns: [
      { speaker: '旁白', portrait: null, text: '月影核心离开米露的铃铛后，第一段咏唱回到璃体内。它带回的不是“所有人已经安全”，而是一段更早的录音：“灰港撤离船已全部出发，请确认名单。”这句话只证明船离开了码头，还不能证明它们安全抵达。' },
      { speaker: '旁白', portrait: null, text: '第二层的森罗回廊负责保管名册。所谓名册，不是一张只写总人数的表，而是逐人记录姓名、登船号码和临时去向的清单。撤离时如果有人换船、受伤或与家人分开，这里都应留下对应记录。' },
      { speaker: '旁白', portrait: null, text: '回廊两侧挂满叶片状的登记牌。前六艘船的人名已经全部归档，只有“北辰七号”仍停在红色的“等待回签”。牌下却压着一封第二天从北岸寄来的平安信，说明至少有人已经知道那艘船到了。' },
      { speaker: '残响精灵·纱雾', portrait: 'guide', expression: 'watchful', text: '这就是我们第一次看到的矛盾：外面的世界已经收到北辰七号的人，高塔内部却还把四十七个人当成没有下落。问题可能不是“没人回答”，而是回答没有进入正确的记录位置。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'guarded', text: '米露保存的是“船已出发”，森罗名册保存的是“谁在船上”。接下来还缺第三件事：那艘船抵达北岸后，船长有没有把结果回给塔里。只有三件对上，我们才能说四十七个人真的完成了撤离。' },
      { speaker: '残响精灵·纱雾', portrait: 'guide', expression: 'gentle', text: '高塔把这种抵达后的签名回复叫“回签”或“回执”。以后再看到这两个词，就把它理解成：目的地确认“人已经到了”，并把这个事实送回最初发出任务的地方。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'guarded', text: '第二枚森罗核心掌管名单和门钥。如果回执曾经经过这一层，它至少会留下“从哪里转走”的痕迹。我不需要它替我们下结论，只要它告诉我下一份证据去了哪里。' },
      { speaker: '旁白', portrait: null, text: '藤门在前方交错闭合。三年前它们用来控制不同避难区的人流，如今仍照旧规则认日曜、月辉等卡牌。核心没有意识到避难者早已离开，只会继续按旧路线开门、关门。' },
      { speaker: '残响精灵·纱雾', portrait: 'guide', expression: 'focus', text: '先看清开关与卡牌的对应关系。我们不是为了把每扇门都打开而来；真正目标是抵达绯叶和森罗核心，确认最后一页名册以及回执的去向。' }
    ]
  },
  floor3: {
    title: '第三阵：深蓝回廊',
    turns: [
      { speaker: '旁白', portrait: null, text: '森罗核心确认了一件重要的事：北辰七号的四十七个名字一个不少，全都写在最后一页。名册没有漏人；缺失的是船抵达北岸后的那份回执。记录还显示，那一页曾被转交给第三层的潮汐导航台。' },
      { speaker: '旁白', portrait: null, text: '深蓝回廊原本负责在风暴中给船队指路。航船离开灰港后，导航员会继续监听，直到船长报告抵达；收到报告后，潮汐回路再把原音送回名册和王庭，让整个系统知道“这条航线已经完成”。' },
      { speaker: '深蓝歌姬·澜音', portrait: 'whale_boss', text: '我就是负责这件事的人。我的鲸歌不是为了好听，它会在雾里给船标出方向，也会把船长的回答一段不漏地送回塔里。北辰七号离开时，我从第一座浮标听到最后一座。' },
      { speaker: '深蓝歌姬·澜音', portrait: 'whale_boss', text: '船长先报船号，再报四十七名乘员，最后说“已抵达北岸，请结束紧急登记”。我听见了全部内容。可回路把最后一句压成“等待复核”，然后命令我继续发警报，好像那艘船从未靠岸。' },
      { speaker: '旁白', portrait: null, text: '澜音按住喉咙，脚下水纹却越收越紧。她想停唱，潮汐核心便把警报重新灌回她体内。她知道真正的回答是什么，却无法让自己的声音把它完整说出去。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'guarded', text: '第一层告诉我们“船离开了”，第二层告诉我们“四十七个人确实在船上”。如果这里能恢复“船抵达了”的原音，灰港最后一批人是否安全这件事就不再需要猜。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'resolve', text: '澜音，我会先取回潮汐核心。不是让你忘掉三年前的歌，而是把它从只能重复警报的命令里解出来。等你能自己停下，我们一起把船长真正说过的话送回名册。' },
      { speaker: '残响精灵·纱雾', portrait: 'guide', expression: 'focus', text: '两枚潮汐开关都要激活。这层还能找到层间罗盘，之后可以回已经打通的楼层补拿遗漏资源。先把罗盘和通路看清，再去找澜音。' }
    ]
  },
  floor4: {
    title: '第四阵：锋刃庭院',
    turns: [
      { speaker: '旁白', portrait: null, text: '潮汐核心恢复后，船长的原音终于完整响起：北辰七号四十七人全部抵达北岸，请结束紧急登记。到这里，灰港最后一批人是否撤离已经有了完整证据。新的问题变成了：既然回执已经到过高塔，封锁为什么没有结束。' },
      { speaker: '旁白', portrait: null, text: '第四层锋刃庭院负责保护撤离通道，也保存巡卫实际执行的命令副本。墙上仍挂着原始告示：“风暴期间阻止无关人员上行；撤离确认后，护送巡卫与伤者下塔。”' },
      { speaker: '剑圣·塞蕾娜', portrait: 'sword_boss', text: '我是锋刃庭院的训练官。那一夜，我让巡卫挡住逆行的人，是为了别让慌乱的人群堵死伤员通道。这个命令从来不是“永远不许任何人上楼”。' },
      { speaker: '剑圣·塞蕾娜', portrait: 'sword_boss', text: '问题出在我们后来实际收到的工作副本。原命令最后一句写着“收到撤离确认后解除封锁”，副本里却只剩前半段。告诉我们什么时候停手的那句话，被整段挖掉了。' },
      { speaker: '旁白', portrait: null, text: '塞蕾娜试着侧身让路，手腕上的锋刃印立刻亮起。她的剑像被另一只手握住般重新抬高。她知道命令已经过期，却无法让身体承认这一点。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'guarded', text: '这解释了守卫为什么还在战斗：她们不是不知道风暴结束，而是各自拿着一份永远没有“停止”两个字的工作副本。我们现在要找的，就是谁改了那份副本，以及修改发生在回执抵达之前还是之后。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'embers', text: '塞蕾娜，我已经带回船长原音。按原命令，你现在本该收剑。既然核心不让你停，我就先把第四段咏唱从它手里取回来，再读它保存的编辑记录。' },
      { speaker: '残响精灵·纱雾', portrait: 'guide', expression: 'focus', text: '庭院的锻炉机关会影响路线。辉月魔刃能永久提升攻击，但取它仍要付出卡牌和战斗代价。目标不是清空庭院，而是让璃有足够资源走到塞蕾娜面前。' }
    ]
  },
  floor5: {
    title: '第五阵：赤焰龙脉',
    turns: [
      { speaker: '旁白', portrait: null, text: '锋刃核心留下的编辑记录证明：终止栏确实被改过，而且改动后的副本由第五层赤焰龙脉持续供能。于是璃沿着供能记录来到一排早已空下来的避难屋。' },
      { speaker: '旁白', portrait: null, text: '赤焰龙脉原本负责在风暴里维持热水、照明和治疗用的炉火。三年过去，管道仍然滚烫，厨房每天仍按旧名单准备食物；可出口处没有一个人来领取。这里把三年前的“等待救援”当成了今天仍然存在的需求。' },
      { speaker: '龙姬·焰璃', portrait: 'dragon_boss', text: '我叫焰璃，赤焰龙脉的守护者。那一夜我的职责很简单：只要还有一间避难屋有人，我就不能让炉火熄掉。伤员比文件重要，这条原则我到现在也不后悔。' },
      { speaker: '龙姬·焰璃', portrait: 'dragon_boss', text: '可登记网三年来每天把同一份名单送给我。它不告诉我“这些人昨天已经离开”，只说“仍有四十七人等待确认”。我逐间敲门、逐段查管道，没有一次得到回应；核心却把沉默解释成“可能有人无法回答”。' },
      { speaker: '旁白', portrait: null, text: '焰璃踢开一只空汤锅。锅底被反复洗得发亮，旁边的四十七只碗却从未被拿走。她不是不知道房间已经空了，而是不敢把一次判断错误的代价押在可能存在的伤员身上。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'guarded', text: '所以我们不能用“把核心拔掉、让整层停电”来证明事情结束。若真有一处管道还连着需要供暖的人，突然停炉会先伤到她。正确做法是先解除你的强制契约，再逐间确认空屋，让供能状态跟着现实改变。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'guarded', text: '更重要的是，炉心日志会记录什么时候收到“继续救援”的覆盖命令。船长回执已经证明四十七人到岸，如果回执之后供能还被强制提高，就说明有人在证据已经出现后仍让旧命令继续生效。' },
      { speaker: '龙姬·焰璃', portrait: 'dragon_boss', text: '如果你只是想让我相信一份纸，我不会停火。但你已经带回澜音的原音，也让塞蕾娜的剑停过一次。先斩断赤焰核心，战斗结束后我亲自和你逐屋确认。' }
    ]
  },
  floor6: {
    title: '第六阵：星镜书库',
    turns: [
      { speaker: '旁白', portrait: null, text: '赤焰日志把时间线又补完整了一段：北辰七号的回执先进入高塔，随后王庭收到一条“继续救援”的覆盖指令，供暖、警戒和登记因此没有转入结束阶段。第六层星镜书库保存的，正是这些命令彼此冲突时的校验记录。' },
      { speaker: '旁白', portrait: null, text: '天穹魔女·露米是书库的守护者，也是王庭的演算员。她的职责不是替女王决定对错，而是把不同选择会造成的后果算给她看。三年来，她的星镜里反复出现同样的两个结局。' },
      { speaker: '天穹魔女·露米', portrait: 'astral_boss', text: '第一条路：停止登记网。旧程序会把所有“未结案”的名字当成临时数据清掉。第二条路：继续登记网。名字留下，但守卫、炉火、警报和门锁也会继续服从救援状态。' },
      { speaker: '天穹魔女·露米', portrait: 'astral_boss', text: '诺克缇娅三年前问过我，能不能只保存姓名和证据，不再继续让守卫战斗。我尝试建立只读档案，每一次演算走到“把记录单独保存”这一步，起源魔源都会拒绝访问。于是我只能给她看那两个都很糟的结果。' },
      { speaker: '旁白', portrait: null, text: '一面星镜把四十七个名字烧成空白，另一面则映着一次又一次重复的战斗。露米已经把这两个结局看了上千遍。她知道两边都在伤人，却一直找不到被系统允许的第三条路。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'guarded', text: '这就是我们现在必须分开的两件事：“保存记录”和“继续执行救援命令”本来不该是同一个开关。诺克缇娅害怕关掉命令会删掉名字，所以一直不敢关；真正该查的是，谁让归档权限被锁死，逼她只能在这两个结果里选。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'resolve', text: '我们已经有船长原音、完整名册、被改过的封锁副本和异常供能日志。把这些放在同一条时间线上，星镜就能看出哪一道更高权限是在回执出现之后插进来的。' },
      { speaker: '残响精灵·纱雾', portrait: 'guide', expression: 'focus', text: '按新月、半月、满月的顺序启动星镜。第六枚天穹核心不仅能恢复璃的校验咏唱，也会开放被隐藏的权限记录。等我们知道“谁不让归档”，第七层才能继续追那道命令从哪里来。' }
    ]
  },
  floor7: {
    title: '第七阵：虚影织界',
    turns: [
      { speaker: '旁白', portrait: null, text: '第六枚核心恢复后，星镜显示了一条被遮住的批注：“离港确认有效，结案权限被上层锁定。”' },
      { speaker: '影织姬·鸦羽', portrait: 'shadow_boss', text: '陛下听见“撤销登记”时，以为那些名字也会一起消失。她划掉自己的离塔许可，留在王座上等一份永远不会送到的答复。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'stern', text: '她想守住灰港的名字，却让活着的守卫成了命令的工具。我要取回第七枚核心，让王庭的门承认我们带来的证据。' },
      { speaker: '影织姬·鸦羽', portrait: 'shadow_boss', text: '那就带着月辉卡和星蚀卡来解双相结界。日曜卡留好——女王的王座只认它。' }
    ]
  },
  floor8: {
    title: '终阵：无声王座',
    turns: [
      { speaker: '旁白', portrait: null, text: '七枚核心的光在王座前汇拢。灰港的姓名铺满墙面，每个名字后都闪着同一句：“等待确认。”' },
      { speaker: '无声女王·诺克缇娅', portrait: 'final_queen', expression: 'grave', text: '我没有忘记他们。如果关掉登记，旧程序就会删掉所有没有结案的名字。我不能让灰港消失第二次。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'embers', text: '七枚核心已经证明，人们离港了，回执是被更高权限拦下的。你守住的是记录，不是一道必须永远执行的求援令。' },
      { speaker: '残响精灵·纱雾', portrait: 'guide', expression: 'gentle', text: '诺克缇娅，让我们查读原始签名。只要找到归档方式，记录可以留下，命令也可以结束。' }
    ]
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
    speaker: '无声女王·诺克缇娅', portrait: 'final_queen', expression: 'cold', title: '最终术式展开',
    text: '女王与黯星核心融合。核心的魔法反击无视防御。\n\n第二阶段紧接着开始，战前请确认生命和附刃档位。'
  },
  ending: {
    speaker: '绫星·璃', portrait: 'hero', expression: 'guarded', title: '终章：魔法重新被选择',
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
