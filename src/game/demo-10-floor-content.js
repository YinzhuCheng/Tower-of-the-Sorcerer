function parseDemoMap(text, gridSize = 11) {
  const rows = text.trim().split('\n').map((row) => row.trim().split(/\s+/));
  if (rows.length !== gridSize || rows.some((row) => row.length !== gridSize)) {
    const widths = rows.map((row) => row.length).join(',');
    throw new Error(`Invalid demo map dimensions: ${rows.length} rows, widths ${widths}`);
  }
  return rows;
}

function slot(x, y, expected) {
  return Object.freeze({ x, y, expected });
}

function removeShops(map) {
  let removed = 0;
  for (const row of map) {
    for (let x = 0; x < row.length; x += 1) {
      if (row[x] !== 'shop') continue;
      row[x] = '.';
      removed += 1;
    }
  }
  return removed;
}

function ensureShop(map, { x, y }) {
  if (map.some((row) => row.includes('shop'))) return;
  if (map[y]?.[x] !== '.') throw new Error(`Demo shop slot ${x},${y} is not free.`);
  map[y][x] = 'shop';
}

function dialogueTurn(speaker, portrait, text, extras = {}) {
  return Object.freeze({ speaker, portrait, text, ...extras });
}

function dialogueSequence(title, backdropOrTurns, maybeTurns = null) {
  const backdrop = Array.isArray(backdropOrTurns) ? null : backdropOrTurns;
  const turns = Array.isArray(backdropOrTurns) ? backdropOrTurns : maybeTurns;
  return Object.freeze({ title, ...(backdrop ? { backdrop } : {}), turns: Object.freeze(turns) });
}

// A topology revision needs an isolated save scope: older v1 saves contain
// their own mutable map copies, including the former decorative barriers.
export const DEMO_TEN_FLOOR_ID = 'demo-10f-v3-single-shop-topology';

/**
 * Browser/demo content overlay.
 *
 * This deliberately mutates the canonical exported ENEMIES/FLOORS/DIALOGUES
 * object identities before the first engine state is created. engine.js keeps
 * using those same objects, so every transition remains authoritative. Node
 * Solver/test imports do not apply this overlay and retain the eight-floor
 * research baseline.
 */
export function applyDemoTenFloorContent({ enemies, floors, dialogues, gridSize = 11 } = {}) {
  if (!enemies || !Array.isArray(floors) || !dialogues) {
    throw new Error('10F demo overlay requires enemies, floors and dialogues.');
  }
  if (floors.length === 10 && floors[9]?.demoContentId === DEMO_TEN_FLOOR_ID) {
    return { applied: false, id: DEMO_TEN_FLOOR_ID, floors };
  }
  if (floors.length !== 8 || floors[7]?.number !== 8) {
    throw new Error(`10F demo overlay expects the eight-floor baseline, got ${floors.length} floors.`);
  }

  const finalFloor = floors[7];

  // Act I deliberately has one resource-conversion node. F5 is placed before
  // its clustered guardian challenge; F1 and F9 are navigation / permission
  // rooms rather than free extra purchase loops. The eight-floor research
  // baseline remains untouched unless this overlay is explicitly installed.
  for (const floor of floors.slice(0, 7)) {
    if (floor.number !== 5) removeShops(floor.map);
  }
  ensureShop(floors[4].map, { x: 5, y: 7 });
  Object.assign(floors[0], {
    objective: '查看敌人耗血，击败猫卫长米露并回收月影核心。',
    initialRelics: Object.freeze(['codex', 'compass'])
  });
  Object.assign(floors[4], {
    shopEffectMultiplier: 2.25,
    shopTierLabel: '中层强化'
  });

  Object.assign(enemies, {
    muteGuard: {
      name: '缄默近卫', portrait: 'mute_guard', faction: '无声王庭·外环', floor: 8,
      hp: 1000, atk: 205, def: 82, gold: 155,
      description: '王庭外环的实体防线，专门惩罚只堆生命、不补防御的战法。'
    },
    hushCantor: {
      name: '止声咏唱者', portrait: 'hush_cantor', faction: '无声王庭·外环', floor: 8,
      hp: 900, atk: 198, def: 76, gold: 170, special: 'magic', magicPower: 145,
      description: '以静默波绕过普通防御，让后期生命储备仍然具有真实价值。'
    },
    outerCrown: {
      name: '外环冠剑姬', portrait: 'outer_crown', faction: '无声王庭·外环', floor: 8,
      hp: 1180, atk: 212, def: 90, gold: 190, special: 'firstStrike',
      description: '先制剑压守住侧翼资源，制造是否绕路取宝的真实成本。'
    },
    palaceWarden: {
      name: '静默执剑官·维拉', portrait: 'palace_warden_v2', faction: '无声王庭·外环', floor: 8,
      hp: 2250, atk: 205, def: 92, gold: 520, boss: true, special: 'magic', magicPower: 240,
      description: '守在王庭外环的执剑官。她不持有魔力核心，以高压静默剑域检验七核回收后的资源配置。'
    },
    starSentinel: {
      name: '逆星守望者', portrait: 'star_sentinel', faction: '倒悬星桥', floor: 9,
      hp: 1200, atk: 220, def: 92, gold: 185,
      description: '以倒悬星轨校准来客的进退，迫使防御取舍真正兑现价值。'
    },
    nullCantor: {
      name: '空谱咏唱者', portrait: 'null_cantor', faction: '倒悬星桥', floor: 9,
      hp: 1000, atk: 205, def: 82, gold: 180, special: 'magic', magicPower: 170,
      description: '将咏唱压缩成高强度空谱波，限制无成本回收整层资源。'
    },
    crownShade: {
      name: '冠影巡猎姬', portrait: 'crown_shade', faction: '倒悬星桥', floor: 9,
      hp: 1100, atk: 225, def: 88, gold: 195, special: 'firstStrike',
      description: '在星桥阴影中先制截击，逼迫入侵者为选择付出成本。'
    },
    blackSealKeeper: {
      name: '黯印观测官·塞芙', portrait: 'black_seal_keeper_v2', faction: '王座前厅', floor: 9,
      hp: 2700, atk: 215, def: 95, gold: 600, boss: true, special: 'magic', magicPower: 160,
      description: '掌管王座前最后一道黯星许可印。她守住的是不可替代的校准权限，而不是另一处可反复购买的补救点。'
    },
    silenceGuard: { ...enemies.silenceGuard, floor: 10 },
    eclipseMage: { ...enemies.eclipseMage, floor: 10 },
    crownKnight: { ...enemies.crownKnight, floor: 10 },
    finalQueen: { ...enemies.finalQueen, floor: 10 },
    voidCore: { ...enemies.voidCore, floor: 10 }
  });

  Object.assign(dialogues, {
    floor7: {
      title: '第七阵：虚影织界',
      turns: [
        dialogueTurn('旁白', null, '第七层没有窗，只有七道灵脉从墙中穿过。六道分别回应璃已经取回的咏唱，最后一道却被黑色丝线缠住，一直延伸到王庭上方。', { kind: 'narration' }),
        dialogueTurn('旁白', null, '璃靠近时，七束光同时亮起。旧日所谓的“七核回路”，在鸦羽眼里其实是一张守夜誓网：每一段咏唱都牵着一位守护者，也牵着灰港那一夜留下的一份承诺。', { cg: '/assets/anime/cg/liyue-yayu-seven-core-network-cg-audit-v3.webp', cgHold: 4, kind: 'narration' }),
        dialogueTurn('影织姬·鸦羽', 'shadow_boss', '这根黑线不是我的手笔。我的影线会藏住逃难者的名字，却不会藏住发誓的人。有人借了虚影的壳，把自己的印藏在七灯后面。', { expression: 'guarded' }),
        dialogueTurn('绫星·璃', 'hero', '那就把它从影子里拖出来。前六段咏唱已经回来了，最后这一段也该回到我手里。', { expression: 'resolve' }),
        dialogueTurn('残响精灵·纱雾', 'guide', '取回虚影核心以后，七段咏唱会重新彼此听见。王庭外的静默门只认完整旋律，不认任何人的身份。', { expression: 'focus' })
      ]
    },
    floor8: {
      title: '第八阵：静默前庭',
      turns: [
        dialogueTurn('旁白', null, '七枚核心在静默门前依次发声：月影、森罗、潮汐、锋刃、赤焰、天穹、虚影。七个音节合在一起，门上三年前冻结的星纹终于开始融化。', { kind: 'narration' }),
        dialogueTurn('静默执剑官·维拉', 'palace_warden_v2', '我守的不是王命，是古誓。七灯若不能彼此应答，任何人都不得把“救援已经结束”带进王庭。'),
        dialogueTurn('静默执剑官·维拉', 'palace_warden_v2', '三年前，七段咏唱被拆散之后，再没有人能把它们同时带到这里。于是这扇门只听见求救，从没听见归航。'),
        dialogueTurn('绫星·璃', 'hero', '那今天就让它听完整。维拉，让开；如果古誓一定要用剑来听，我就用剑把七声送过去。', { expression: 'resolve' }),
        dialogueTurn('残响精灵·纱雾', 'guide', '主路上的守卫仍会照旧阻拦。右侧宝库是可选绕路，别为了多拿一件东西把自己耗空。', { expression: 'focus' })
      ]
    },
    floor9: {
      title: '第九阵：倒悬星桥',
      turns: [
        dialogueTurn('旁白', null, '倒悬星桥把那一夜的三道残光照在穹顶：最先亮起的是北辰七号的归航星；一刻钟后，王庭封门；又过七息，一枚陌生的蓝色印记压在七灯之上。', { kind: 'narration' }),
        dialogueTurn('黯印观测官·塞芙', 'black_seal_keeper_v2', '我守了三年，就是等有人带着完整七声走到这里。黑印遮住了名字，却遮不住施术的手法——这是“续夜之印”。'),
        dialogueTurn('黯印观测官·塞芙', 'black_seal_keeper_v2', '它把原本只守到晨钟的誓言改成了：最后一个求救者归来以前，七灯不得熄灭。'),
        dialogueTurn('绫星·璃', 'hero', '可最后一艘船比封塔更早离港。有人在不知道结果的时候，把“再等一会”写成了永远。', { expression: 'guarded' }),
        dialogueTurn('残响精灵·纱雾', 'guide', '塞芙的黯星印能揭开施术者留下的真名。再上一层，就是诺克缇娅。', { expression: 'watchful' })
      ]
    },
    floor10: {
      title: '第十阵：无声王座',
      turns: [
        dialogueTurn('旁白', null, '王座前的七盏魔灯已经烧了三年。火焰里没有新的求救，只有旧夜留下的声音一次次重来。', { kind: 'narration' }),
        dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我知道你想问什么。为什么不熄灯？因为我从来没有听见最后的归航钟。', { cg: '/assets/anime/cg/liyue-noctia-truth-cg-audit-v3.webp', cgHold: 3, expression: 'sorrow' }),
        dialogueTurn('无声女王·诺克缇娅', 'final_queen', '那一夜，求救声忽然断了。我不知道那意味着他们得救，还是已经没人能再喊。于是我把你的七段咏唱交给七名守护者，让她们替我继续守。'),
        dialogueTurn('无声女王·诺克缇娅', 'final_queen', '最初我只想多等一个晚上。后来我听见米露还在守门、焰璃还在烧炉，我却越来越不敢承认：也许应该先停下的人，一直是我。', { expression: 'sorrow' }),
        dialogueTurn('绫星·璃', 'hero', '澜音听见过北辰七号的最后一段鲸歌，星桥也看见归航星先亮。我们缺的不是更多守夜的人，是那声没能传到这里的钟。', { expression: 'resolve' }),
        dialogueTurn('无声女王·诺克缇娅', 'final_queen', '那就来。若你能穿过王座前的封印，我会亲手把七灯交还给你。然后我们一起去找那声迟了三年的钟。', { expression: 'grave' })
      ]
    },

    bossCatPreDemo: dialogueSequence('第一阵守护者：猫卫长·米露', [
      dialogueTurn('旁白', null, '月白门廊还保持着撤离那一夜的模样。小凳、湿披风和半碗冷掉的汤都没有被收走，只有门上的月影灯仍在不停摇响。', { kind: 'narration' }),
      dialogueTurn('猫卫长·米露', 'cat_boss', '璃，我认得你。可这盏灯不认。它只知道守夜还没结束，只知道任何从外面闯进来的人都可能把门后的孩子带走。'),
      dialogueTurn('猫卫长·米露', 'cat_boss', '我已经违抗它很多次了。再拖下去，月影会直接扯着我的爪子扑向你。要拿回第一段咏唱，就打赢我。')
    ]),
    bossCatPostDemo: dialogueSequence('月影咏唱归还', [
      dialogueTurn('旁白', null, '月影核心从米露铃铛里飞出，化作第一段咏唱回到璃胸前。门上的警铃第一次停了一息。', { kind: 'narration' }),
      dialogueTurn('猫卫长·米露', 'cat_boss', '那一夜最后离开的孩子把一颗糖塞给我，说等船靠岸就回来拿。糖早化了，人也没回来——可也许她只是早就到了很远的地方。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '第二段森罗咏唱记着所有进入高塔的名字。去找绯叶。', { expression: 'watchful' })
    ]),
    bossFoxPreDemo: dialogueSequence('第二阵守护者：狐祝·绯叶', [
      dialogueTurn('旁白', null, '森罗庭里长着成千上万片刻名叶。多数叶片已经变成柔和的青色，只有最后四十七片仍泛着求救时留下的红光。', { kind: 'narration' }),
      dialogueTurn('狐祝·绯叶', 'fox_boss', '我记得每一个进塔的人。最后四十七个名字属于北辰七号，可她们离开以后，我再也没有收到能让这些叶子安睡的声音。'),
      dialogueTurn('狐祝·绯叶', 'fox_boss', '想取走森罗核心，就别只告诉我“她们大概没事”。把真正的归航声带回来。')
    ]),
    bossFoxPostDemo: dialogueSequence('森罗咏唱归还', [
      dialogueTurn('旁白', null, '第二段咏唱落入璃掌心。四十七片红叶仍未褪色，却不再攻击靠近的人。', { kind: 'narration' }),
      dialogueTurn('狐祝·绯叶', 'fox_boss', '名字我替你守着。你去找澜音，她是最后一个听见北辰七号的人。')
    ]),
    bossWhalePreDemo: dialogueSequence('第三阵守护者：深蓝歌姬·澜音', [
      dialogueTurn('旁白', null, '潮汐殿里没有海，却回荡着三年前的浪声。澜音的鲸歌每唱到同一个地方，就会被一道黑色杂音硬生生截断。', { kind: 'narration' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '我替北辰七号唱过最后一段引航歌。船长确实回答了我，可那句话只剩前半截留在这里。'),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '潮汐核心把断掉的后半声藏在更深处。先让我看看，你有没有力气把它从风暴里带出去。')
    ]),
    bossWhalePostDemo: dialogueSequence('潮汐咏唱归还', [
      dialogueTurn('旁白', null, '第三段咏唱归位。破碎的水镜忽然映出三年前的北岸：北辰七号撞开风浪靠上石堤，船员们在雨里敲响归航钟。', { cg: '/assets/anime/cg/liyue-lanyin-northstar-arrival-cg-v8.webp', cgHold: 4, kind: 'narration' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '我听见了。船长说的是：“北辰七号，全员到岸。”'),
      dialogueTurn('残响精灵·纱雾', 'guide', '可王庭没有听见这句话。有人在潮声离开这里以后截住了它。', { expression: 'watchful' })
    ]),
    bossSwordPreDemo: dialogueSequence('第四阵守护者：剑圣·塞蕾娜', [
      dialogueTurn('旁白', null, '锋刃庭院的石碑上刻着旧誓：“最后一船归航以前，剑不得入鞘。”碑文最后一行却像被火烧过，只剩半句。', { kind: 'narration' }),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '我知道船可能已经回来了。可这把剑只听石碑上的誓。最后一行不回来，我就不能替它猜。'),
      dialogueTurn('绫星·璃', 'hero', '那我先把剑拿回来，再去找是谁烧掉了最后一行。', { expression: 'resolve' })
    ]),
    bossSwordPostDemo: dialogueSequence('锋刃咏唱归还', [
      dialogueTurn('旁白', null, '第四段咏唱回到璃体内，焦黑碑面短暂亮起原文：“闻归航钟三响，守剑者即可收刃。”', { kind: 'narration' }),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '原来结束从来不是背叛。是有人把“如何结束”从誓里拿走了。')
    ]),
    bossDragonPreDemo: dialogueSequence('第五阵守护者：龙姬·焰璃', [
      dialogueTurn('旁白', null, '赤焰炉烧得过亮。明明四周早已没有伤员，火舌仍沿着管道向空房间输送热量。', { kind: 'narration' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '我管火，不管大道理。有人发冷，我就烧；屋里没人，我就该熄。可三年来，每次我压低炉心，那道蓝印就把火重新点满。', { expression: 'embers' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '想拿赤焰核心，就先替我把这团不肯死的火压下去。')
    ]),
    bossDragonPostDemo: dialogueSequence('赤焰咏唱归还', [
      dialogueTurn('旁白', null, '第五段咏唱离开炉心。三年来第一次，焰璃身后的火从白炽退回温暖的橙红。', { kind: 'narration' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '火会记住添柴的人。蓝印的魔力来自更高处，不是诺克缇娅的王座。去找露米，她能从星光里看见它从哪儿落下来。')
    ]),
    bossAstralPreDemo: dialogueSequence('第六阵守护者：天穹魔女·露米', [
      dialogueTurn('旁白', null, '天穹星镜里反复出现两幅未来：熄灯，名字随黑暗沉下去；继续守夜，七名守护者永远留在原地。镜面之外却有一条细得几乎看不见的第三道星路。', { kind: 'narration' }),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '三年前我只看见前两条路，所以我告诉诺克缇娅：两边都会有人受伤。她选择继续等。'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '现在第三条星路出现了——名字可以留下，守夜也可以结束。可它通向被遮住的第七段咏唱。')
    ]),
    bossAstralPostDemo: dialogueSequence('天穹咏唱归还', [
      dialogueTurn('旁白', null, '第六段咏唱落回璃身上，星镜的第三道星路终于完整：七束光在第七层汇合，再一起指向王庭上方。', { kind: 'narration' }),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '去找鸦羽。有人用她的影术藏住了续夜之印的来处。')
    ]),
    bossShadowPreDemo: dialogueSequence('第七阵守护者：影织姬·鸦羽', [
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '你已经看见那根黑线了。很好，省得我再解释。它借我的影子遮脸，我忍了三年。'),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '把我打醒，虚影核心就是你的。之后我们一起去看看，谁那么怕自己的名字被人看见。', { expression: 'guarded' })
    ]),
    bossShadowPostDemo: dialogueSequence('虚影咏唱归还', [
      dialogueTurn('旁白', null, '第七段咏唱归位，七声终于合成完整旋律。黑线被共鸣震开一瞬，尽头浮出一枚从未属于王座的蓝色主权印。', { kind: 'narration' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '抓到了。真正动过古誓的人在王庭上面。先过静默门，再去找塞芙揭名。')
    ]),
    bossPalacePreDemo: dialogueSequence('第八阵守护者：静默执剑官·维拉', [
      dialogueTurn('静默执剑官·维拉', 'palace_warden_v2', '七声齐了。我会听它们各自的来处；只要有一声被强行捏成别人的声音，我的剑就不会收。'),
      dialogueTurn('绫星·璃', 'hero', '不用替我相信。你亲自听。', { expression: 'resolve' })
    ]),
    bossPalacePostDemo: dialogueSequence('王庭外环解除', [
      dialogueTurn('旁白', null, '维拉收剑。七段咏唱同时穿过门缝，静默门像长久屏住呼吸的人一样缓缓打开。', { kind: 'narration' }),
      dialogueTurn('静默执剑官·维拉', 'palace_warden_v2', '七声都是真的。黑印在第九层，去吧。')
    ]),
    bossBlackSealPreDemo: dialogueSequence('第九阵守护者：黯印观测官·塞芙', [
      dialogueTurn('旁白', null, '塞芙身后的黯星印像一轮没有光的月。它遮住续夜之印的主人，也把她三年来写下的警告压在石桥下。', { kind: 'narration' }),
      dialogueTurn('黯印观测官·塞芙', 'black_seal_keeper_v2', '我不能直接把名字交给任何一个闯入者。赢我，黯印会自己认你。')
    ]),
    bossBlackSealPostDemo: dialogueSequence('黯星通行印解除', [
      dialogueTurn('旁白', null, '黑月裂开，蓝色印记终于露出真形。印主只有一个名字：奥术主权者。', { kind: 'narration' }),
      dialogueTurn('黯印观测官·塞芙', 'black_seal_keeper_v2', '他在封塔后七息刻下续夜之印，把晨钟时限改成“最后一人归来以前”。'),
      dialogueTurn('绫星·璃', 'hero', '先去见诺克缇娅。她必须亲眼看见这枚印，也必须亲口告诉我们，她那一夜到底听见了什么。', { expression: 'resolve' })
    ]),
    bossQueenPreDemo: dialogueSequence('第十阵：无声女王', [
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '你把七段咏唱都带回来了，也带来了那个名字。可我仍然没有听见归航钟。只凭你们说“结束了”，我做不到熄灯。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '那就别凭我。跟我一起去找钟。先把你缠在王座上的封印斩断。', { expression: 'resolve' })
    ]),
    queenPhaseDemo: dialogueSequence('最终术式展开', [
      dialogueTurn('旁白', null, '诺克缇娅抬手时，七盏灯骤然变成苍白。不是她在施术，而是续夜之印感到王座想要松手，强行收紧了三年来的束缚。', { cg: '/assets/anime/cg/liyue-noctia-seal-cg-audit-v3.webp', cgHold: 4, kind: 'narration' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '原来连我也只是它留下的一盏灯。璃——把它斩开。', { expression: 'sorrow' })
    ]),
    bossQueenPostDemo: dialogueSequence('终章：守夜者同行', [
      dialogueTurn('旁白', null, '封印断裂，七盏灯没有熄灭，却第一次不再逼迫任何人举剑。诺克缇娅从王座上走下来，把王冠留在台阶上。', { kind: 'narration' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '封塔是我做的，夺走你的咏唱也是我做的。找到真正施印的人，不会把这些事变成没发生。'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '但我不再坐在这里等答案。我要亲自去找那声归航钟，也要亲眼看着七灯熄灭。', { expression: 'grave' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '王庭上方还有十层。续夜之印的根扎在起源魔源里；我们要一路追过去。', { expression: 'watchful' }),
      dialogueTurn('绫星·璃', 'hero', '走吧。三年前没能传回来的最后一声，我们这次把它带回来。', { expression: 'resolve' })
    ])
  });

  const bossDialogueBindings = {
    catBoss: ['bossCatPreDemo', 'bossCatPostDemo'],
    foxBoss: ['bossFoxPreDemo', 'bossFoxPostDemo'],
    whaleBoss: ['bossWhalePreDemo', 'bossWhalePostDemo'],
    swordBoss: ['bossSwordPreDemo', 'bossSwordPostDemo'],
    dragonBoss: ['bossDragonPreDemo', 'bossDragonPostDemo'],
    astralBoss: ['bossAstralPreDemo', 'bossAstralPostDemo'],
    shadowBoss: ['bossShadowPreDemo', 'bossShadowPostDemo'],
    palaceWarden: ['bossPalacePreDemo', 'bossPalacePostDemo'],
    blackSealKeeper: ['bossBlackSealPreDemo', 'bossBlackSealPostDemo']
  };
  for (const [enemyId, [preBattleDialogue, defeatDialogue]] of Object.entries(bossDialogueBindings)) {
    if (!enemies[enemyId]) continue;
    enemies[enemyId].preBattleDialogue = preBattleDialogue;
    enemies[enemyId].defeatDialogue = defeatDialogue;
  }
  enemies.finalQueen.preBattleDialogue = 'bossQueenPreDemo';
  enemies.finalQueen.phaseDialogue = 'queenPhaseDemo';
  enemies.voidCore.defeatDialogue = 'bossQueenPostDemo';

  const floor8 = {
    id: 7,
    number: 8,
    title: '静默前庭',
    objective: '激活两枚静默开关，权衡侧翼宝物成本，打开外环闸门并击败执剑官维拉。',
    intro: 'floor8',
    boss: 'palaceWarden',
    demoContentId: DEMO_TEN_FLOOR_ID,
    theme: { floor: 0x1e2636, floorAlt: 0x283449, wall: 0x52627a, glow: 0x8ec9ff, fog: 0x111826 },
    map: parseDemoMap(`
      # # # # # # # # # # #
      # . enemy:outerCrown # item:dual # item:hpLarge enemy:hushCantor enemy:palaceWarden U #
      # . # # gate:hush # gate:hush # # gate:hush #
      # switch:hushB # enemy:muteGuard . item:atk . # item:star enemy:hushCantor #
      # door:star # . # # # # . # #
      # item:hpLarge enemy:hushCantor . # item:def . enemy:outerCrown . # #
      # # # . # . # # . # #
      # item:moon . . enemy:muteGuard . # switch:hushA item:sun . #
      # . # # # # # . # door:sun #
      # D . item:moon door:moon enemy:outerCrown item:def . item:hp . #
      # # # # # # # # # # #
    `, gridSize),
    puzzles: { switches: { hush: ['hushA', 'hushB'] } },
    codesignSlots: Object.freeze({
      rewardNorthwest: slot(4, 1, 'item:dual'),
      rewardNortheast: slot(6, 1, 'item:hpLarge'),
      rewardMidAtk: slot(5, 3, 'item:atk'),
      rewardMidDef: slot(5, 5, 'item:def'),
      rewardHpWest: slot(1, 5, 'item:hpLarge'),
      cardStarEast: slot(8, 3, 'item:star'),
      cardMoonWest: slot(1, 7, 'item:moon'),
      cardSunEast: slot(8, 7, 'item:sun'),
      cardMoonSouth: slot(3, 9, 'item:moon'),
      enemyOuterNorthwest: slot(2, 1, 'enemy:outerCrown'),
      enemyHushNorth: slot(7, 1, 'enemy:hushCantor'),
      enemyMuteWest: slot(4, 7, 'enemy:muteGuard'),
      enemyOuterSouth: slot(5, 9, 'enemy:outerCrown'),
      doorSunEast: slot(9, 8, 'door:sun'),
      doorMoonSouth: slot(4, 9, 'door:moon')
    })
  };

  const floor9 = {
    id: 8,
    number: 9,
    title: '倒悬星桥',
    objective: '用月卡进入月蚀校准台，按月蚀、晨辉、星落的顺序校准星桥并击败塞芙。',
    intro: 'floor9',
    boss: 'blackSealKeeper',
    demoContentId: DEMO_TEN_FLOOR_ID,
    theme: { floor: 0x1a1838, floorAlt: 0x292151, wall: 0x62528f, glow: 0xc5a3ff, fog: 0x0f0c23 },
    map: parseDemoMap(`
      # # # # # # # # # # #
      # . enemy:starSentinel # item:dual # item:hpLarge enemy:nullCantor enemy:blackSealKeeper U #
      # . # # gate:blackstar # gate:blackstar # # gate:blackstar #
      # rune:C # enemy:crownShade . item:def . # item:star enemy:nullCantor #
      # door:star # . # # # # . # #
      # item:hpLarge enemy:nullCantor . rune:A item:atk . enemy:starSentinel . # #
      # # # . # . # # . # #
      # item:sun . . enemy:crownShade . # rune:B item:def . #
      # . # # # # # door:moon # # #
      # D . item:moon . enemy:starSentinel # . item:hp item:atk #
      # # # # # # # # # # #
    `, gridSize),
    puzzles: {
      sequence: {
        order: ['B', 'A', 'C'],
        gate: 'blackstar',
        labels: { A: '晨辉', B: '月蚀', C: '星落' }
      }
    },
    codesignSlots: Object.freeze({
      rewardNorthwest: slot(4, 1, 'item:dual'),
      rewardNortheast: slot(6, 1, 'item:hpLarge'),
      rewardMidDef: slot(5, 3, 'item:def'),
      rewardMidAtk: slot(5, 5, 'item:atk'),
      rewardHpWest: slot(1, 5, 'item:hpLarge'),
      rewardDefSouth: slot(8, 7, 'item:def'),
      cardStarEast: slot(8, 3, 'item:star'),
      cardSunWest: slot(1, 7, 'item:sun'),
      cardMoonSouth: slot(3, 9, 'item:moon'),
      enemySentinelNorthwest: slot(2, 1, 'enemy:starSentinel'),
      enemyNullNorth: slot(7, 1, 'enemy:nullCantor'),
      enemyCrownMid: slot(3, 3, 'enemy:crownShade'),
      enemySentinelMid: slot(7, 5, 'enemy:starSentinel'),
      runeC: slot(1, 3, 'rune:C'),
      runeA: slot(4, 5, 'rune:A'),
      runeB: slot(7, 7, 'rune:B')
    })
  };

  const floor10Map = finalFloor.map.map((row) => [...row]);
  // The canonical 8F source retains its historical decorative doors. The 10F
  // overlay removes the three that do not separate any region, so visual
  // barriers never promise a route lock they fail to provide.
  for (const [x, y] of [[4, 2], [9, 8], [4, 9]]) floor10Map[y][x] = '.';
  removeShops(floor10Map);
  const floor10 = {
    ...finalFloor,
    id: 9,
    number: 10,
    title: '无声王座',
    objective: '突破最后近卫，击败无声女王及其黯星核心。这里没有商店，也没有后续补救。',
    intro: 'floor10',
    boss: 'voidCore',
    demoContentId: DEMO_TEN_FLOOR_ID,
    map: floor10Map
  };

  floors.splice(7, 1, floor8, floor9, floor10);

  return {
    applied: true,
    id: DEMO_TEN_FLOOR_ID,
    floors,
    addedEnemyIds: [
      'muteGuard', 'hushCantor', 'outerCrown', 'palaceWarden',
      'starSentinel', 'nullCantor', 'crownShade', 'blackSealKeeper'
    ]
  };
}
