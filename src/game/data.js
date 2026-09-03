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
        text: '三年前的停战夜，魔力风暴逼近海港避难城“灰港”。高塔本该为撤离船导航，最后一艘船驶出后，塔门却再也没有打开。'
      },
      {
        kind: 'narration',
        speaker: '旁白',
        text: '灰港建在低于海堤的旧船坞里。战乱中的伤员、失去住处的孩子和来不及返回故乡的船工都暂住在那里；风暴一旦越过堤岸，海水与失控魔力会先灌进他们的屋子。'
      },
      {
        kind: 'narration',
        speaker: '旁白',
        text: '因此高塔承担了撤离的全部联络：月白门廊清点登船者，森罗回廊保管名册，深蓝导航台为船队引路。最后一艘船抵达北岸后，船长必须把带有船号、人数与时间的回执送回塔内，登记网才会宣布救援结束。'
      },
      {
        kind: 'narration',
        speaker: '旁白',
        text: '如今风暴早已散去，港口也重建了。只有塔里的警钟还停在那一夜，像是从未听见船队离岸后的回答。'
      },
      {
        speaker: '绫星·璃',
        portrait: 'hero', expression: 'guarded',
        text: '北岸的纪念册上连最后一艘船的乘员都在，说明撤离成功了。可塔里的名单仍把他们写成“下落未确认”。同一群人不可能既已经抵达，又仍困在港里。'
      },
      {
        speaker: '残响精灵·纱雾',
        portrait: 'guide', expression: 'watchful',
        text: '塔的守护者诺克缇娅没等到“全员离港”的回执。她以为灰港还有人求救，便把紧急登记网和整座塔一起封住。'
      },
      {
        speaker: '残响精灵·纱雾',
        portrait: 'guide', expression: 'watchful',
        text: '她先下令封门，是为了阻止魔力风暴追着船队进入塔内；这本来只该持续到回执抵达。问题在于回执明明进入了导航回路，却没有完成最后的结案。'
      },
      {
        speaker: '残响精灵·纱雾',
        portrait: 'guide', expression: 'gentle',
        text: '重建后的港务档案能证明船队抵达了北岸，可高塔只承认当夜带签名的原始回执。那份回执进过塔，却在登记网里失去了踪影。'
      },
      {
        speaker: '残响精灵·纱雾',
        portrait: 'guide', expression: 'lament',
        text: '你当时赶来接应，她却强行拆走你的七段咏唱，做成七枚魔力核心维持封锁。如今七名守护者都被绑在命令里，靠近的人一律会被当成入侵者。'
      },
      {
        speaker: '残响精灵·纱雾',
        portrait: 'guide', expression: 'lament',
        text: '那套咏唱原本是一首完整的护航术：月影辨认来者，森罗记住姓名，潮汐传递回音，锋刃保护通道，赤焰维持避难所，天穹校验记录，虚影追踪权限。诺克缇娅把七段分别嵌进七层阵眼，登记网才得以在她耗尽魔力后继续运转。'
      },
      {
        kind: 'narration',
        speaker: '旁白',
        text: '七枚核心也把七名守护者锁进了各自的职责。她们仍能说话、记得璃，甚至知道命令已经错了；可只要登记网判定有人妨碍救援，核心就会接管她们的手脚，逼她们迎战。'
      },
      {
        speaker: '绫星·璃',
        portrait: 'hero', expression: 'stern',
        text: '我还记得那一下。声音、火焰、星光都被从身体里扯走，分别锁进七层阵眼。她不是想杀我，她只是急着找来足够的魔力，让登记网永远别停。'
      },
      {
        kind: 'narration',
        speaker: '旁白',
        text: '璃把手按在喉间。那里没有伤口，但她至今无法唱完当年的护航咏唱；每当她试着接上缺失的音节，塔内七层便会依次传来微弱回声。'
      },
      {
        speaker: '绫星·璃',
        portrait: 'hero', expression: 'guarded',
        text: '所以我不是来屠塔的。我要逐层解开守卫的强制契约，收回七枚核心，再拿着灰港的真正回执去见女王。'
      },
      {
        speaker: '绫星·璃',
        portrait: 'hero', expression: 'guarded',
        text: '每取回一段咏唱，我也会得到那一层保存的记录。我要按时间把事情重新拼起来：谁发出了撤离确认，谁删掉了封锁的终止时间，又是谁让诺克缇娅连想停都停不下来。'
      },
      {
        speaker: '绫星·璃',
        portrait: 'hero', expression: 'resolve',
        text: '第一枚月影核心就在楼上。卡牌、药露和每场战斗的耗血都要先看清；走错一步，后面就可能没有力量救人。',
        choices: [
          { label: '“先确认每场战斗的损伤。”', response: '璃握紧剑柄：看清代价，再决定这一击值不值得。' },
          { label: '“先找能回收的资源。”', response: '璃抬头望向塔顶：力量要留给真正无法绕开的地方。' }
        ]
      }
    ]
  },
  floor2: {
    title: '第二阵：森罗双钥',
    turns: [
      { speaker: '旁白', portrait: null, text: '月影核心回到璃手中，一段被封了三年的录音也随之响起：“灰港撤离船已全部出发，请确认名单。”' },
      { speaker: '旁白', portrait: null, text: '森罗回廊的藤叶随录音亮起，却唯独空出名册最后一页。璃伸手碰去，叶面只留下“等待船队回签”几个淡字。' },
      { speaker: '旁白', portrait: null, text: '回廊两侧摆着当年用过的登船牌。前六艘船的木牌都被翻到绿色一面，只有“北辰七号”仍朝外露着红漆；牌下却压着一张北岸发来的平安信，日期正是撤离后的第二天。' },
      { speaker: '残响精灵·纱雾', portrait: 'guide', expression: 'watchful', text: '有人发出了离港消息，登记网却没有把它当成“撤离完成”。原定三日的封锁，就这样重复了三年。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'guarded', text: '米露留下的是“船已出发”，这里缺的是“船已抵达”。两份记录不是一回事。只有找到北辰七号船长的回签，才能证明最后一批人没有留在风暴里。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'guarded', text: '月影核心证明灰港确实撤离过。下一枚森罗核心管理门锁和人员名册，我要查清是回执丢了，还是被人拦了。' },
      { speaker: '残响精灵·纱雾', portrait: 'guide', expression: 'gentle', text: '森罗回廊的藤门要先踩亮开关。日曜、月辉卡只开对应的门，别把退路用掉。' }
    ]
  },
  floor3: {
    title: '第三阵：深蓝回廊',
    turns: [
      { speaker: '旁白', portrait: null, text: '深蓝回廊曾是灰港的导航台。如今撤离号角一遍遍重播，真正的船队回答却被鲸歌压在水声下。' },
      { speaker: '深蓝歌姬·澜音', portrait: 'whale_boss', text: '我听得见船长在回话，可术式命令我继续发出警报。它说，只要歌停了，没被找到的人就会被遗忘。' },
      { speaker: '深蓝歌姬·澜音', portrait: 'whale_boss', text: '北辰七号离开礁群时，船长先报了船号，又报了四十七名乘员。她说第三遍时，潮汐回路忽然把最后半句切走，只留下“等待复核”。这三年，我每唱一次导航歌，那半句就被水声压下一次。' },
      { speaker: '旁白', portrait: null, text: '澜音每说一个字，脚下水纹便收紧一圈。她按住喉咙，下一声警报仍不由自主地从回廊深处响起。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'guarded', text: '你不是忘了回话，是潮汐核心不许你把它唱完。等我收回核心，先把原音交给森罗名册，再去查是谁把复核状态钉在封锁令上。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'stern', text: '你的歌本来是带人回家的，不是拿来盖住回答。我会解开潮汐门，取回第三枚核心，让船长的原话重新响起。' },
      { speaker: '残响精灵·纱雾', portrait: 'guide', expression: 'focus', text: '两枚潮汐开关都要激活。这一层能找到层间罗盘，以后可以回已打通的楼层补拿资源。' }
    ]
  },
  floor4: {
    title: '第四阵：锋刃庭院',
    turns: [
      { speaker: '旁白', portrait: null, text: '剑痕把庭院分成数条狭路。墙上的旧告示仍写着：“撤离期间，巡卫护送伤者下塔。”' },
      { speaker: '剑圣·塞蕾娜', portrait: 'sword_boss', text: '我曾教她们如何护住伤者。封塔后，指令被改成“阻止任何人上楼”，却没有写终止时间。' },
      { speaker: '剑圣·塞蕾娜', portrait: 'sword_boss', text: '原命令有两段：风暴期间阻止无关人员上行，撤离确认后护送巡卫下塔。后半段还在原件上，登记网交给我的副本却只剩前半段。' },
      { speaker: '旁白', portrait: null, text: '塞蕾娜侧身让出半步，锋刃核心却立刻在她腕上勒出光痕。她只能重新横剑，封住通往上层的路。' },
      { speaker: '旁白', portrait: null, text: '璃看见她握剑的指节已经磨出旧伤。塞蕾娜显然尝试过无数次放人通过，而核心也无数次把剑重新塞回她手里。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'embers', text: '潮汐核心里的船长已经回答了，所以这道封锁本该结束。塞蕾娜，我会取回锋刃核心，再查出是谁删掉了终止栏。' },
      { speaker: '残响精灵·纱雾', portrait: 'guide', expression: 'focus', text: '先开启锻炉机关。辉月魔刃能永久提升攻击，但取它的路也要付出耗血和卡牌。' }
    ]
  },
  floor5: {
    title: '第五阵：赤焰龙脉',
    turns: [
      { speaker: '旁白', portrait: null, text: '赤焰龙脉为灰港的避难屋供暖。三年过去，管道仍然滚烫，出口处却没有一个等待领取热食的人。' },
      { speaker: '龙姬·焰璃', portrait: 'dragon_boss', text: '登记网说避难者仍在等待，所以炉火不准熄。我每天问一次“还有谁在？”，回答永远只有上一天的名单。' },
      { speaker: '龙姬·焰璃', portrait: 'dragon_boss', text: '我不敢直接停炉。万一真的还有伤员躲在没有传讯的房间里，骤冷会先要了她的命。于是我逐间敲门、逐段检查管道，三年里没有得到过一次回应。' },
      { speaker: '旁白', portrait: null, text: '焰璃踢开一只空汤锅，火星沿铁壁滚落。她望着整齐摆放、却三年无人触碰的碗，尾音比炉火低了下去。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'guarded', text: '所以不能只拔掉核心让炉子骤停。我先斩断强制契约，你再把空屋的阀门逐一关小。炉心的能耗日志会告诉我们，登记网从什么时候开始给不存在的人供暖。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'guarded', text: '炉火没有错，是名单没有收到结案。我会解开两道龙焰封锁，拿回第五枚核心，找到那份被压住的回执。' },
      { speaker: '龙姬·焰璃', portrait: 'dragon_boss', text: '那就别只说好听的话。站到我面前，证明你有力气把答案带回来。' }
    ]
  },
  floor6: {
    title: '第六阵：星镜书库',
    turns: [
      { speaker: '旁白', portrait: null, text: '星镜书库保存着塔的运行记录。一面面镜子里，都是同一天的灰港：船已出港，警报仍在鸣响。' },
      { speaker: '天穹魔女·露米', portrait: 'astral_boss', text: '我演算过一千次。关闭登记网，旧程序会把灰港档案一起清空；维持它，守卫就会继续攻击所有来人。' },
      { speaker: '天穹魔女·露米', portrait: 'astral_boss', text: '诺克缇娅看到的也是这两种结果。她问我有没有第三种，我当时只能摇头。因为每次演算走到“单独保存档案”，起源魔源都会拒绝访问，仿佛有人提前锁死了归档权限。' },
      { speaker: '旁白', portrait: null, text: '露米挥手散去演算。镜中一边是被抹成空白的姓名，一边是倒在门前的守卫；她已经看过这两个结局太多次。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'guarded', text: '潮汐原音证明最后一船抵达，锋刃记录证明终止栏被改，赤焰日志证明塔一直在为无人使用的房间供能。把三份证据放进同一次演算，再追查是谁拒绝了归档。' },
      { speaker: '绫星·璃', portrait: 'hero', expression: 'resolve', text: '诺克缇娅怕删掉档案，所以选择不关。但如果能让记录留下、错误命令结束，就不必再拿守卫去填这道二选一。' },
      { speaker: '残响精灵·纱雾', portrait: 'guide', expression: 'focus', text: '按新月、半月、满月的顺序启动星镜。第六枚核心会告诉我们，是谁把离港回执标成了“不可结案”。' }
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
