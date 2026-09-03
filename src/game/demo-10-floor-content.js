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
        dialogueTurn('旁白', null, '星镜里的批注一闪而过：离港确认有效，结案权限却被上层锁定。', { kind: 'narration' }),
        dialogueTurn('旁白', null, '第七层没有窗，只有成千上万根影线穿过墙壁。每根线都牵着一道权限，也牵着一名无法违令的守卫。', { kind: 'narration' }),
        dialogueTurn('旁白', null, '璃走近时，七束颜色不同的光从她胸前分向各层。那是尚未取回的最后一段咏唱在呼唤其余六段，也让她第一次看清：七名守护者的契约都系在同一个结案锁上。', { kind: 'narration' }),
        dialogueTurn('影织姬·鸦羽', 'shadow_boss', '女王以为“撤销登记”就是删掉名字。她把自己也留在塔里，一等就是三年。'),
        dialogueTurn('影织姬·鸦羽', 'shadow_boss', '我负责沿影线追查每道命令从哪里来。可延长令落下的那一刻，有人反过来借虚影核心遮住了源头；我明明看见异常，却连报告都送不出。', { expression: 'guarded' }),
        dialogueTurn('绫星·璃', 'hero', '她想守住灰港，却让守卫们成了命令的工具。我会带着证据去见她。', { expression: 'guarded' }),
        dialogueTurn('绫星·璃', 'hero', '月影留下出发录音，森罗留下乘员名单，潮汐带回抵达原音，锋刃和赤焰证明封锁被异常延长，天穹找到了上层锁。还差你的权限流向，七份记录才会连成完整证词。', { expression: 'resolve' }),
        dialogueTurn('残响精灵·纱雾', 'guide', '取回第七枚虚影核心，王庭就会承认七份见证。月、星卡开结界，日曜卡留给王座。', { expression: 'focus' })
      ]
    },
    floor8: {
      title: '第八阵：静默前庭',
      turns: [
        dialogueTurn('旁白', null, '七枚核心在门上投出七道签名。封了三年的王庭外环终于回应。', { kind: 'narration' }),
        dialogueTurn('旁白', null, '门缝里没有风，只有整齐重复的校验声。王庭外环并不判断谁善谁恶，它只比较证据是否一致；三年前没人能凑齐被拆散在七层的记录，于是门一直认定撤离尚未完成。', { kind: 'narration' }),
        dialogueTurn('残响精灵·纱雾', 'guide', '核心们证明回执是真的，也暴露了一条更高的回路：起源魔源还在为登记网供能。', { expression: 'watchful' }),
        dialogueTurn('残响精灵·纱雾', 'guide', '起源魔源在王庭上方，是整座塔最初的动力与档案库。诺克缇娅能调用它维持救援，却没有权限修改它写入底层的主权命令。', { expression: 'watchful' }),
        dialogueTurn('旁白', null, '璃试着推门，七枚核心同时发烫。门后传来的不是女王的声音，而是一道不容更改的底层命令。', { kind: 'narration' }),
        dialogueTurn('绫星·璃', 'hero', '所以取回魔力只是第一步。我得先解开王庭外环，再让女王亲眼看到离港证据。', { expression: 'resolve' }),
        dialogueTurn('残响精灵·纱雾', 'guide', '踩亮两枚静默开关、击败维拉就能上行。右侧双卫守的宝库是可选的，先算耗血。', { expression: 'focus' })
      ]
    },
    floor9: {
      title: '第九阵：倒悬星桥',
      turns: [
        dialogueTurn('旁白', null, '倒悬星桥记录着三道指令的先后：灰港撤离、女王封塔、紧急登记被无限延长。', { kind: 'narration' }),
        dialogueTurn('旁白', null, '三行时间依次亮起。船长的回执先抵达；一刻钟后，诺克缇娅因看不到回执而封塔；又过了七息，陌生权限把“临时”改成“无限”。顺序排开后，谁在因果链上做了什么终于不再混成一团。', { kind: 'narration' }),
        dialogueTurn('残响精灵·纱雾', 'guide', '最后一道指令使用了王座之外的黯星权限。诺克缇娅也许做错了选择，却不是唯一的签署人。', { expression: 'watchful' }),
        dialogueTurn('绫星·璃', 'hero', '她封塔、夺走我的咏唱，这些是她亲手做的；可有人明知她会害怕，仍把没有出口的命令递给了她。两件事都得说清。', { expression: 'guarded' }),
        dialogueTurn('绫星·璃', 'hero', '我不是去替她开脱。我要让她面对七名守护者受过的伤，也要把真正改写命令的人从黑印后面找出来。少说任何一半，三年前的事都会再次被说成一个人的错。', { expression: 'guarded' }),
        dialogueTurn('绫星·璃', 'hero', '塞芙守着黯星通行印。拿到它，我们才能穿过王座权限，读出延长令的真正签名。', { expression: 'resolve' }),
        dialogueTurn('残响精灵·纱雾', 'guide', '先用月辉卡进入校准台，再按月蚀、晨辉、星落的顺序踩亮符文。', { expression: 'focus' })
      ]
    },
    floor10: {
      title: '第十阵：无声王座',
      turns: [
        dialogueTurn('旁白', null, '王座上没有胜利庆典，只有一封不断重播的求援。七枚核心在璃身边同时亮起。', { kind: 'narration' }),
        dialogueTurn('旁白', null, '殿墙刻着灰港全部撤离者的名字。多数人已在北岸成家，有人经营面包房，有人成了领航员；可登记网不知道他们后来的生活，只把每个人冻结成三年前等待救援的一行字。', { kind: 'narration' }),
        dialogueTurn('无声女王·诺克缇娅', 'final_queen', '三年里，我每天都听见同一句“等待确认”。若我关掉它，谁来记得灰港的人？', { cg: '/assets/anime/cg/liyue-noctia-truth-cg.webp', expression: 'sorrow' }),
        dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我亲眼见过旧登记被关闭后整批档案化成空白。那天之后，我宁可让警钟继续，也不敢赌灰港会不会被抹掉。我知道这个选择困住了所有人，也知道自己没有勇气改。', { expression: 'sorrow' }),
        dialogueTurn('旁白', null, '诺克缇娅说得很轻，握剑的手却没有松开。黯星纹路正沿着她的手腕向上蔓延，替她拒绝一切结案请求。', { kind: 'narration' }),
        dialogueTurn('绫星·璃', 'hero', '七名守护者都记得。离港回执也存在，只是被更高的权限拦下了。', { expression: 'resolve' }),
        dialogueTurn('绫星·璃', 'hero', '我们已经找到另一种做法：把姓名、船号和抵达时间转进只读档案，保留记录；再从登记网中解除救援状态，停止命令。这样没有名字会消失，也没有守卫需要继续为一场早已结束的撤离流血。', { expression: 'resolve' }),
        dialogueTurn('绫星·璃', 'hero', '让她们永远互相伤害，不会把任何人送回家。我会留下记录，也会停下错误的命令。', { expression: 'embers' }),
        dialogueTurn('无声女王·诺克缇娅', 'final_queen', '那就带着日曜卡来到我面前。证明你的答案，不会再让一个名字消失。', { expression: 'sorrow' })
      ]
    },

    bossCatPreDemo: dialogueSequence('第一阵守护者：猫卫长·米露', [
      dialogueTurn('旁白', null, '月白门廊的地面遍布爪痕。猫卫长挡在楼梯前，手上的铃铛还在重复封塔警报。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '门廊原是撤离者进入高塔后的第一站。长桌上还摊着三年前的登记册，墨迹停在最后一页；靠墙的小凳高低不一，是米露特意为孩子们找来的。', { kind: 'narration' }),
      dialogueTurn('猫卫长·米露', 'cat_boss', '我的职责是核对进塔者、为避难者打开第一道门。可名单停在三年前，现在谁来都会被判成入侵者。'),
      dialogueTurn('猫卫长·米露', 'cat_boss', '璃，我认得你。可登记网把你标成“未登记的入塔者”，月影契约正逼我出爪。'),
      dialogueTurn('猫卫长·米露', 'cat_boss', '那一夜我送走最后一队老人，亲手把门牌翻成“已清空”。后来铃铛又把它翻了回去。从那以后，无论门外站的是送粮人还是旧同伴，我的手都会先攻击。'),
      dialogueTurn('旁白', null, '米露把持铃的手藏到身后，另一只手却已抬起利爪。她咬着牙，仍被核心一步步推向璃。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '击破契约就能收回月影核心，不会伤到她的意识。但你要先留足体力走到这里。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '我会攻击铃上接管你的月影术式，不会把剑刃对准你。核心离开后，你可能会突然脱力，退到长桌后面，别勉强站着。', { expression: 'guarded' }),
      dialogueTurn('绫星·璃', 'hero', '米露，别道歉。我会斩断术式，拿回属于我的第一段咏唱。', { expression: 'resolve' })
    ]),
    bossCatPostDemo: dialogueSequence('月影核心回收', [
      dialogueTurn('旁白', null, '月影铃落在地上，持续三年的警报第一次断了音。米露跪坐下来，怔怔看着终于不再自行挥动的手。', { kind: 'narration' }),
      dialogueTurn('猫卫长·米露', 'cat_boss', '爪子终于能停下了。女王封塔前一直在等灰港撤离的最后确认。'),
      dialogueTurn('猫卫长·米露', 'cat_boss', '我这里只收到两次消息。第一条说所有人已经登船，第二条说船队全部驶离灰港。照规程，还应有一条从北岸返回的“安全抵达”，可铃铛从没为它响过。'),
      dialogueTurn('旁白', null, '月影核心回到璃体内，带回一小段录音：“船队已出发，请核对名册。”', { kind: 'narration' }),
      dialogueTurn('旁白', null, '熟悉的第一段音阶重新落回璃的喉间。她听见门外每一个脚步的方位，也明白了月影核心原本用于辨认来者，而不是把所有陌生人判成敌人。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '第二层的森罗核心掌管人员名册。如果回执进过塔，那里一定留下记录。', { expression: 'watchful' }),
      dialogueTurn('绫星·璃', 'hero', '那就去森罗回廊。米露，你先把门廊的人叫醒，别再让她们互相伤害。', { expression: 'guarded' })
    ]),
    bossFoxPreDemo: dialogueSequence('第二阵守护者：狐祝·绯叶', [
      dialogueTurn('旁白', null, '森罗核心把当年的撤离名册化成叶片。叶脉里记着每一道门何时开启。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '璃从叶片间读到一个个普通备注：“需要拐杖”“与姐姐同船”“晕浪，请靠窗”。这不是一串用来计数的号码，而是门廊里真实走过的人。', { kind: 'narration' }),
      dialogueTurn('狐祝·绯叶', 'fox_boss', '我负责保管撤离名册和门钥。只有人名、船号与回签三项相合，我才能把最后一页归档。'),
      dialogueTurn('狐祝·绯叶', 'fox_boss', '前六艘船都已齐全。最后一页记录北辰七号四十七人，船号和姓名都在，唯独“安全抵达”一栏空着。登记网因此把四十七人连同负责她们的我们一起留在救援状态。'),
      dialogueTurn('狐祝·绯叶', 'fox_boss', '我守的不只是名字，还有为撤离付过的每一把钥匙、每一滴血。女王说代价不能被忘掉。'),
      dialogueTurn('绫星·璃', 'hero', '记住代价，是为了不再重犯。但把每个名字永远困在撤离那天，不是纪念。', { expression: 'guarded' }),
      dialogueTurn('旁白', null, '绯叶垂下眼，藤蔓却缠紧她的手腕，将法杖尖端强行对准璃。缺少回签的名册不允许她放任何人上楼。', { kind: 'narration' }),
      dialogueTurn('狐祝·绯叶', 'fox_boss', '我已经试过把自己的名字从守卫名单上划掉。森罗核心立刻又写了回来，还让藤蔓攻击替我递笔的人。你若靠近，它也会如此。'),
      dialogueTurn('狐祝·绯叶', 'fox_boss', '那就让我看看，你会不会为了省事，把所有卡牌和生命都丢在这里。')
    ]),
    bossFoxPostDemo: dialogueSequence('森罗核心回收', [
      dialogueTurn('狐祝·绯叶', 'fox_boss', '你没有把钥匙和生命随手花掉。女王若还肯看，她该看见人不是只会服从指令。'),
      dialogueTurn('旁白', null, '森罗核心里没有最后一页名册。记录显示，那一页被导航台的潮汐回路接走了。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '第二段咏唱回到璃体内，散落的叶片随之排成撤离顺序。名单没有缺人：北辰七号的四十七个名字全在，缺失的只有那艘船抵达北岸后的回签。', { kind: 'narration' }),
      dialogueTurn('狐祝·绯叶', 'fox_boss', '不是名册漏了人，是最后一艘船的回签没被送回来。澜音守着导航台，她那里一定听见过什么。'),
      dialogueTurn('绫星·璃', 'hero', '第一层证明船已离港，第二层证明所有人确实登上北辰七号。接下来只要找回船长的抵达原音，灰港无人滞留这件事就完整了。', { expression: 'guarded' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '潮汐回路在第三层。澜音曾负责引导灰港的最后一艘船。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '我们去听清楚那艘船的回答。绯叶，替我保管好这份名册。', { expression: 'resolve' })
    ]),
    bossWhalePreDemo: dialogueSequence('第三阵守护者：深蓝歌姬·澜音', [
      dialogueTurn('旁白', null, '澜音站在水纹阵中。鲸歌每绕行一周，都会把一段船长的回话压回水下。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '导航台的圆窗外并没有海，术式却把三年前的浪投在玻璃上。每当幻浪拍下，室内便闪过北辰七号驶过最后一座浮标的影像。', { kind: 'narration' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '我的职责是用潮汐歌标出航道，再把船长的回签送回森罗名册。最后一艘船离港时，我明明听见了她。'),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '我的歌本该引导最后一艘避难船。可术式要我不断报警，就像它从没有离港。'),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '她报出“北辰七号，全员四十七，已抵达北岸”。前半句被送进名册，最后四个字却在进入王庭前被改成“等待复核”。我想重放原音，潮汐核心就勒住我的喉咙。'),
      dialogueTurn('旁白', null, '水纹勒住澜音的脚踝。她试图停唱，潮汐核心却把警报灌回她的喉咙，卷起一道横在两人之间的浪墙。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '船长已经回话了，只是我们还没听完。澜音，让我把你从旧警报里拉回来。', { expression: 'resolve' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '那就穿过鲸歌。如果你还能站着，就替我听完那句被盖住的话。')
    ]),
    bossWhalePostDemo: dialogueSequence('潮汐核心回收', [
      dialogueTurn('旁白', null, '水墙退成一层薄雾。被鲸歌压住的女声终于穿过回廊，清楚得像是刚刚从港外传来。', { kind: 'narration' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '鲸歌停下了。我终于听见船长的原话：“灰港最后一船，全员已离港。”'),
      dialogueTurn('旁白', null, '第三段咏唱归位，璃听见被水声割开的完整原音：“北辰七号，四十七人，全员抵达北岸。灰港无滞留者，请结束紧急登记。”', { cg: '/assets/anime/cg/liyue-lanyin-northstar-arrival-cg-v8.webp', kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '回话时间比封塔早一刻钟。诺克缇娅本该收到，它却被标成了“等待复核”。', { expression: 'watchful' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '也就是说，失效的不是船长回执，而是王庭接收回执后的状态。我们已经证明撤离完成，下一步要查封锁为何没有按规定终止。', { expression: 'watchful' }),
      dialogueTurn('绫星·璃', 'hero', '女王不知道人们已经离开。下一层的锋刃庭院掌管封锁令，那里会有修改记录。', { expression: 'guarded' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '去吧。我会把这句回话保存好，等她愿意听的时候，再完整地唱一次。')
    ]),
    bossSwordPreDemo: dialogueSequence('第四阵守护者：剑圣·塞蕾娜', [
      dialogueTurn('旁白', null, '塞蕾娜的剑前摆着两份命令。原件写着“护送撤离”，副本只剩“禁止上行”。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '原件边缘还有巡卫们的签字和交班时间，最后一班写着“待北辰七号回签后解除”。副本在相同位置留下一块整齐的空白，像是有人把整句话连同墨水一起挖走。', { kind: 'narration' }),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '我的职责是分派巡卫、护住撤离通道。只要封锁令有效，锋刃核心就要求我把任何上行者逼回塔外。'),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '封锁令只该维持到撤离结束。可副本没有终止栏，锋刃核心命令我继续执行。'),
      dialogueTurn('绫星·璃', 'hero', '潮汐核心已经带回“全员离港”的回执。我会取回你身上的第四枚核心，把终止时间补回去。', { expression: 'resolve' }),
      dialogueTurn('旁白', null, '塞蕾娜看了一眼原件，像是想收剑。下一刻，锋刃印在她掌心亮起，她只能将剑锋重新抬到璃的眼前。', { kind: 'narration' }),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '三年来，我把剑锋偏开过很多次。核心会在下一击纠正角度，直到我无法避开。别把我的克制当成放行的承诺；进入战斗后，我的身体不会继续听我指挥。'),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '先证明你能穿过这道命令。我会尽力出剑，这是契约留给我最后的选择。')
    ]),
    bossSwordPostDemo: dialogueSequence('锋刃核心回收', [
      dialogueTurn('旁白', null, '最后一道剑光擦过璃的肩头，钉在那张无期副本上。塞蕾娜趁契约松动，亲手将剑从掌中放开。', { kind: 'narration' }),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '命令断了。你看懂规则，也没拿它当伤害别人的借口。锋刃核心应该归还你。'),
      dialogueTurn('旁白', null, '第四段咏唱进入剑脊，随后回到璃体内。被挖空的终止栏短暂复原：它原本引用潮汐回签自动结案，却在封塔后被替换成了没有结束条件的副本。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '核心中保存着封锁令的编辑记录。终止栏不是女王删的，她只能读到一份无期副本。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '诺克缇娅下达了临时封锁，但她看到的命令后来已经被人换过。她要为夺走我们的选择负责，改写终止栏的人也必须留下名字。', { expression: 'guarded' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '副本由赤焰龙脉持续供能。上层的供暖炉应该还保存着当年的能耗记录。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '如果避难者已经离开，炉火就不该还在烧。我们去找龙姬焰璃。', { expression: 'guarded' })
    ]),
    bossDragonPreDemo: dialogueSequence('第五阵守护者：龙姬·焰璃', 'redVein', [
      dialogueTurn('旁白', null, '锻炉的心跳隔着石墙传来。供暖管仍向一排早已空下来的避难屋送去热量。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '走廊里叠着洗净的汤碗，碗沿没有一点灰，显然每天都有人擦拭。焰璃仍按四十七人的份量烧水、煮汤，再在无人领取后将它们倒掉。', { kind: 'narration' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '我的职责是让避难屋有热水、让伤员撑过风暴。只要名单还有一人“等待确认”，赤焰核心就不许我降低炉温。', { expression: 'embers' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '第七百三十一次校验：无人应答。可登记网只给我一条结论——继续燃烧。', { expression: 'embers' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '我试过逐间关阀。每关一处，核心就把那间屋标成“伤员失温”，逼我用更大的火补回来。我知道屋里没人，可万一我的判断错一次，代价就是一条命。'),
      dialogueTurn('绫星·璃', 'hero', '我不会让你现在就熄火。先让我看清是谁把“等一等”写成了永远。', { expression: 'guarded' }),
      dialogueTurn('绫星·璃', 'hero', '战斗结束后你来操作阀门，我用取回的赤焰咏唱稳住炉温。我们一间一间关，不让管道骤冷，也不再为不存在的伤员继续烧空炉。', { expression: 'resolve' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '你若骗我，炉火会把你也列进待救名单。', { expression: 'embers' }),
      dialogueTurn('绫星·璃', 'hero', '那就用这一战，让我先斩断强制契约。', { expression: 'resolve' })
    ]),
    bossDragonPostDemo: dialogueSequence('赤焰核心回收', 'redVein', [
      dialogueTurn('旁白', null, '赤焰核心离开炉心，暴烈的火舌终于缩成温暖的灯焰。焰璃急忙调低阀门，而不是任由整座炉室骤冷。', { kind: 'narration' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '火候降下来了……原来我还记得该怎样让一盏灯只为正在等的人亮着。', { expression: 'embers' }),
      dialogueTurn('旁白', null, '第五段咏唱带着暖意回到璃体内。她与焰璃沿走廊逐一确认空屋，把供暖从四十七间降到守卫实际使用的三间；旧管道没有爆裂，也没有任何求救声被遗漏。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '炉心吐出一枚被压住的索引：最后一艘船的回执，被送往星镜书库。', { expression: 'watchful' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '能耗记录还显示，回执抵达后炉火本应自动转入低档，王庭却发来一条“维持救援”的覆盖指令。它不是我的命令，也不是锋刃庭院的副本。'),
      dialogueTurn('绫星·璃', 'hero', '前四层告诉我们回执是真的、终止栏被换了；赤焰日志现在证明替换发生后，整座塔仍被持续供能。去星镜书库，我们查覆盖指令的权限来源。', { expression: 'guarded' }),
      dialogueTurn('绫星·璃', 'hero', '焰璃，替我守住这盏灯。我们会把回执带回来。', { expression: 'guarded' })
    ]),
    bossAstralPreDemo: dialogueSequence('第六阵守护者：天穹魔女·露米', [
      dialogueTurn('旁白', null, '露米的星镜同时映出两幅景象：一边是空白的灰港名册，一边是永不停歇的战斗。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '镜框下堆满露米写过的演算稿。最上面一页只有两个结果：停止登记，四十七个名字被旧程序清空；保持登记，七名守护者继续把所有来者视作敌人。纸角被反复摩挲得发白。', { kind: 'narration' }),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '我负责保存运行记录，也替王座演算每次决策的后果。可天穹核心只准我在旧程序给出的选项里选择。'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '我算过两条路：停止会遗失档案，继续会伤害守卫。女王看完演算，选了后者。'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '她问过我：“能不能只把姓名留下，把求援关闭？”我尝试建立只读档案，演算每次都在访问起源魔源时被拒绝。不是方法不存在，是我们被禁止验证它。'),
      dialogueTurn('旁白', null, '露米抬手想关掉星镜，镜面却自行转向璃，成百道预演过的攻击同时亮起。她的叹息被淹没在术式的嗡鸣里。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '因为她宁可把自己困住，也不敢赌那些名字会不会消失。可这两条路都是旧程序给的。', { expression: 'guarded' }),
      dialogueTurn('绫星·璃', 'hero', '把月影录音、森罗名册、潮汐原音、锋刃编辑记录和赤焰能耗放进同一条时间线。若回执先到、覆盖命令后到，我们就能沿那次拒绝访问的痕迹向上追。', { expression: 'resolve' }),
      dialogueTurn('绫星·璃', 'hero', '我要取回天穹核心，读出离港回执的完整权限记录。那里一定藏着第三条路。', { expression: 'resolve' })
    ]),
    bossAstralPostDemo: dialogueSequence('天穹核心回收', [
      dialogueTurn('旁白', null, '失去天穹核心的星镜没有熄灭，只是停止攻击。露米第一次把演算拖回离港回执抵达的那一刻。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '六份记录在镜中对齐：北辰七号抵达，潮汐回执进入王庭，临时封锁本应解除；随后，一道来自王庭上方的权限将回执改成“不可结案”，又删除了封锁的终止条件。', { kind: 'narration' }),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '演算更新：离港确认是真的。但接收后一刻钟，它被更高权限标成“不可结案”。'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '第六段咏唱恢复后，我终于能计算第三条路：将姓名、船号、抵达时间写入只读档案，再解除名单的救援状态。记录会留下，命令可以停止。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '这道权限不属于女王。它从王庭之上接入，又把签名用虚影线藏了起来。', { expression: 'watchful' }),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '鸦羽管理虚影织界。她知道那条线穿过了谁的名字。'),
      dialogueTurn('绫星·璃', 'hero', '那就去第七层。收回最后一枚核心，我们就有七份证据去打开王庭。', { expression: 'resolve' })
    ]),
    bossShadowPreDemo: dialogueSequence('第七阵守护者：影织姬·鸦羽', 'starMirror', [
      dialogueTurn('旁白', null, '数十根影线在空中织出塔的轮廓；最上层有一根线，既不通向王座，也不通向任何守卫。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '其余影线都标着用途：门禁、名册、导航、巡卫、供暖与演算。唯独那根自上而下的黑线没有名称，它穿过所有系统，却故意绕开了诺克缇娅的王座签章。', { kind: 'narration' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '我负责追踪权限流向、藏起不该外泄的签名。如今虚影核心反过来蒙住我的眼，只准我维护这张网。', { expression: 'guarded' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '正常的遮蔽是保护撤离者姓名，不让敌人从名册追到北岸。可这根黑线遮住的是发令者自己。她借用了我的术式，让每一层都能执行延长令，却无人能看见命令从何而来。', { expression: 'guarded' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '我看见陛下划掉自己的离塔许可。她想留下来守住灰港，结果让所有人都陪她被困。', { expression: 'guarded' }),
      dialogueTurn('绫星·璃', 'hero', '那不是她一个人的罪。有人利用她的恐惧，把一份临时命令套在所有名字上。', { expression: 'guarded' }),
      dialogueTurn('旁白', null, '鸦羽指尖微动，影线便先一步缠上她的手臂。线结强迫她摆出迎战姿势，也把那枚陌生主权印藏得更深。', { kind: 'narration' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '别靠我的左侧。核心会先封住你的影子，再借影线刺向本体。我能提醒你的只有这些；开战后，连这点声音也会被它收走。', { expression: 'guarded' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '证明给我看。否则我会把你也钉在这张网里。', { expression: 'guarded' }),
      dialogueTurn('绫星·璃', 'hero', '好。等网断开，你来亲自作证。', { expression: 'resolve' })
    ]),
    bossShadowPostDemo: dialogueSequence('虚影核心回收', 'starMirror', [
      dialogueTurn('旁白', null, '虚影核心归位后，缠住鸦羽手臂的线结一一松开。她没有倒下，而是立刻抓住那根逃向上层的黑线。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '第七段咏唱回到璃体内，七个残缺音节终于接成完整旋律。月影辨认、森罗记名、潮汐传讯、锋刃护送、赤焰维生、天穹校验、虚影追踪——这首咏唱本来用于让撤离的每一步彼此作证。', { kind: 'narration' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '第七根影线回到了王庭外。尽头不是女王的签名，而是一枚被遮住的主权印。', { expression: 'guarded' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '我只能看见权限等级比王座更高，名称仍被黯星印覆盖。要揭开它，必须先用七枚核心通过王庭外环，再去第九层找观测官塞芙解除黑印。', { expression: 'guarded' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '七枚核心都回到璃身上了。它们保存的见证足以打开王庭，也能证明守卫无需再战斗。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '我们已经找回离港回执、封锁修改和上层权限。接下来要问的，是女王为什么愿意被它困住。', { expression: 'guarded' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '告诉她，我没有忘记灰港，也不愿意再替这道命令伤人。这是我自己的回答。', { expression: 'guarded' })
    ]),
    bossPalacePreDemo: dialogueSequence('第八阵守护者：静默执剑官·维拉', [
      dialogueTurn('旁白', null, '维拉站在王庭外环的密闭门前。门上的文字表明，它封锁的不是一间宫殿。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '七个凹槽围着门锁排列，恰好对应璃失去的七段咏唱。每个凹槽下都刻着一句旧规：“单一记录可以出错，彼此独立的见证必须核对。”', { kind: 'narration' }),
      dialogueTurn('静默执剑官·维拉', 'sword_boss', '我的职责是校验进入王庭的证据，防止有人伪造撤离结果、擅改起源魔源。你带来的七枚核心必须逐一应答。'),
      dialogueTurn('静默执剑官·维拉', 'sword_boss', '月影要证明谁经过门廊，森罗要证明名单完整，潮汐要复述船长原音；锋刃、赤焰、天穹与虚影则要说明回执进入王庭后发生了什么。任何一份时间不合，我都不能开门。'),
      dialogueTurn('静默执剑官·维拉', 'sword_boss', '这道门封住起源魔源的访问权。没有它，就连女王也只能维持登记，不能修改底层命令。'),
      dialogueTurn('绫星·璃', 'hero', '所以她不只是不愿意关闭，也没有真正的关闭权。但她封住所有人的选择，仍然必须回答。', { expression: 'guarded' }),
      dialogueTurn('旁白', null, '七枚核心依次亮起，门锁仍将维拉的剑推离剑鞘。校验完成以前，她同样没有让路的权限。', { kind: 'narration' }),
      dialogueTurn('静默执剑官·维拉', 'sword_boss', '我的剑会逐段检验咏唱。你若在中途倒下，外环会把证据重新判为无效；不是我怀疑你，而是这套校验只承认完整通过的结果。'),
      dialogueTurn('静默执剑官·维拉', 'sword_boss', '先让七枚核心通过我的剑。若它们的见证一致，我会把外环权限交给你。')
    ]),
    bossPalacePostDemo: dialogueSequence('王庭外环解除', [
      dialogueTurn('旁白', null, '维拉将剑插回门锁。七道光沿剑脊汇成同一个时间戳，密闭门随之退开半尺。', { kind: 'narration' }),
      dialogueTurn('静默执剑官·维拉', 'sword_boss', '七份见证完全一致：灰港撤离已完成。我解除王庭外环。'),
      dialogueTurn('旁白', null, '门上的“等待确认”逐字熄灭，换成清晰的结论：“北辰七号，四十七人，于停战夜抵达北岸；灰港撤离完成。”这是三年来，高塔第一次正式承认那场救援已经结束。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '我还是无法读取延长令的签名。有一枚黯星印遮住了发令者。', { expression: 'watchful' }),
      dialogueTurn('静默执剑官·维拉', 'sword_boss', '外环只能确认事实，不能解除高于王座的命令。现在我们知道灰港平安，也知道诺克缇娅收到的是被篡改后的结果；最后缺的是谁下令无限延长。'),
      dialogueTurn('静默执剑官·维拉', 'sword_boss', '第九层的观测官塞芙保管那枚印。她守的是进入王座前最后一道校准。'),
      dialogueTurn('绫星·璃', 'hero', '我要那枚印，也要签署人的名字。诺克缇娅不该继续替一个藏起来的人承担一切。', { expression: 'resolve' })
    ]),
    bossBlackSealPreDemo: dialogueSequence('第九阵守护者：黯印观测官·塞芙', [
      dialogueTurn('旁白', null, '黯星印悬在塞芙身后。印面将延长令的签名涂成一团黑色，只留下“无限”二字。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '塞芙脚边散着没有送出的异常报告。第一封写于封塔当天：“撤离回执早于封锁，状态冲突”；最后一封写于今晨，内容完全相同，纸张却已叠了厚厚一摞。', { kind: 'narration' }),
      dialogueTurn('黯印观测官·塞芙', 'astral_boss', '我负责观测上层指令是否越过王座，也守着唯一能揭开签名的通行印。三年来，它不许我向任何人交付异常报告。'),
      dialogueTurn('黯印观测官·塞芙', 'astral_boss', '我每天都记录同一个矛盾：灰港已经撤离，救援命令却仍有效。每当我把报告送向王庭，黯印就会将收件人改成我自己。诺克缇娅因此从未看见完整警告。'),
      dialogueTurn('黯印观测官·塞芙', 'astral_boss', '这枚印来自王座之外。它把延长令写进底层，女王可以继续执行，却无权撤销。'),
      dialogueTurn('绫星·璃', 'hero', '她仍然应该为封住守卫道歉，但她不应替真正的发令者背上全部责任。', { expression: 'guarded' }),
      dialogueTurn('旁白', null, '塞芙伸手触碰黯印，手指立刻被黑光弹开。她转而举起法杖——通行印只承认能击破校准术式的人。', { kind: 'narration' }),
      dialogueTurn('黯印观测官·塞芙', 'astral_boss', '开战后，黑印会把我的观察术改成攻击术。我会标出它最薄弱的三个校准点，但无法替你踩亮。击破它，报告和签名才能同时解封。'),
      dialogueTurn('绫星·璃', 'hero', '塞芙，把印交给我。我会带着它去见女王，让被藏起来的人也留下姓名。', { expression: 'resolve' })
    ]),
    bossBlackSealPostDemo: dialogueSequence('黯星通行印解除', [
      dialogueTurn('旁白', null, '黑光剥落，印面第一次显出完整字迹。塞芙没有立刻开口，只把三年前没能递出的异常报告交到璃手中。', { kind: 'narration' }),
      dialogueTurn('黯印观测官·塞芙', 'astral_boss', '黯印解除了。签名写着：奥术主权者；指令是“灰港紧急登记，无限延长”。'),
      dialogueTurn('黯印观测官·塞芙', 'astral_boss', '签署时间在诺克缇娅封塔后七息。她下的是临时命令，奥术主权者随后把它写入起源魔源，删除终止条件，并拦住所有异常报告。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '奥术主权者管理起源魔源，身份高于王座。可她现在不在这十层之内。', { expression: 'watchful' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '这个称号不是姓名。要知道她是谁、为什么把一次已完成的撤离无限延长，我们必须进入王座后的上层档案区。那会是下一段旅程，不是今晚在十层内能查完的答案。', { expression: 'watchful' }),
      dialogueTurn('绫星·璃', 'hero', '那就先去王座。女王必须看见离港回执和这枚印，才能明白自己守了什么。', { expression: 'resolve' }),
      dialogueTurn('黯印观测官·塞芙', 'astral_boss', '带好日曜卡。王座结界后没有商店，进去以后，你就得用现有的一切走到底。')
    ]),
    bossQueenPreDemo: dialogueSequence('第十阵：无声女王', 'night', [
      dialogueTurn('旁白', null, '王座前没有庆典，只有一封被反复播放、始终没有落款的求援讯息。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '诺克缇娅坐在灰尘未落的王座上，像三年前一样穿着停战礼服。她面前摆着四十七枚姓名牌，每一枚都被擦得干净；这三年她没有忘记任何人，也没有走出这间殿。', { kind: 'narration' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我收到的最后一句是“等待确认”。若我结案，旧程序就会删掉所有未确认的名字。', { expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '璃来接应时，我已经耗尽维持登记网的魔力。风暴还在撞门，名册上又有四十七个人没有回签。我怕网络一停，她们就会连求救过都无人知道，所以夺走了璃的咏唱，把七段分别交给七名守护者。'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我告诉自己只要再等片刻，回执就会到，随后我会亲自归还咏唱、向每个人道歉。可片刻变成一夜，一夜变成三年。我后来已经知道守卫在受苦，却仍不敢成为按下停止的人。', { expression: 'sorrow' }),
      dialogueTurn('旁白', null, '诺克缇娅看向七枚核心。米露的铃声、澜音的船长回话、露米的时间记录在殿中依次响起，她的剑尖第一次动摇。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '你害怕灰港像从未存在，所以留在这里。可离港回执是真的，是奥术主权者把它拦了。', { expression: 'guarded' }),
      dialogueTurn('绫星·璃', 'hero', '北辰七号的四十七人全部抵达北岸。米露保存了出发录音，绯叶保住了完整名单，澜音带回船长原音；塞蕾娜、焰璃、露米和鸦羽又证明，结案是在回执抵达后被上层权限截断的。'),
      dialogueTurn('绫星·璃', 'hero', '米露、绯叶、澜音和其他守护者都记得那一夜。保留名字，不等于逼她们永远受命。', { expression: 'resolve' }),
      dialogueTurn('绫星·璃', 'hero', '你先为救人封塔，后来却因为害怕失去记录，把所有人留在命令里。奥术主权者利用了你的恐惧，可夺走咏唱、拒绝面对守护者的痛苦，仍是你必须亲口承担的部分。', { expression: 'guarded' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我知道她们痛苦。可每次我准备停下，黯星核心都会让我看见名册化为灰烬。我不敢拿那些名字再赌一次。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '天穹核心已经算出第三条路。我们先把姓名、船号、人数和抵达时间写入只读档案，再解除救援状态。你不必靠永远重复求援来证明自己记得她们。', { expression: 'resolve' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我想相信你。可黯星核心不会接受话语，只会检验你能否打破它的命令。', { expression: 'sorrow' })
    ]),
    queenPhaseDemo: dialogueSequence('最终术式展开', 'night', [
      dialogueTurn('旁白', null, '女王的剑停了，黯星核心却从王座下升起。它用魔法反击将两人一同锁在阵中。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '核心把四十七枚姓名牌投成燃烧的幻象，又在每一枚下方写出“关闭即删除”。诺克缇娅下意识伸手护住它们，锁链便趁机缠上她的手腕。', { kind: 'narration' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '原来它从没有受我控制。它锁住原始签名，也不许我承认撤离已经结束。', { expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我仍然是做出封塔选择的人，但我不会再让这份恐惧替我挥剑。璃，姓名牌只是幻象，真正的档案已经由七枚核心保存。攻击核心。', { expression: 'resolve' }),
      dialogueTurn('旁白', null, '诺克缇娅反手将剑刺进束缚自己的黑纹，为璃撕开一道狭窄缺口。七枚核心沿缺口照亮黯星的裂缝。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '那就一起打破它。第二阶段的反击无视防御，我会用留下的生命撑过去。', { cg: '/assets/anime/cg/liyue-noctia-seal-cg.webp', expression: 'embers' })
    ]),
    bossQueenPostDemo: dialogueSequence('终章：魔法重新被选择', 'night', [
      dialogueTurn('旁白', null, '黯星核心碎裂，王庭的警报终于停下。墙上的灰港名字没有消失，只是不再闪烁。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '诺克缇娅逐个触碰那些名字。它们已被转入只读档案：可以被记住，却不会再向守卫下达命令。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '门廊的铃铛、导航台的鲸歌与锻炉的轰鸣也相继安静下来。七名守护者仍保有当夜的记忆，却不再被迫重复当夜的动作；她们第一次可以决定接下来要去哪里。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '七枚核心都已回收，守卫们也恢复了自由。可原始签名指向更高处的起源魔源。', { expression: 'resolve' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我封住了你们，还用你的魔力维持这一切。我会道歉，也会和你们一起找到真正的结案。', { expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我不会用“受人操纵”替自己开脱。等我们回来，我会把封塔经过、七名守护者遭受的强制契约和我作出的每个决定公开记录。她们愿不愿继续留在塔里，由她们自己选择。', { expression: 'sorrow' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '王座开启了上层阶梯。下一段路要查明奥术主权者为何签下无限延长，以及如何安全归档。', { expression: 'focus' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '十层之上的档案把“奥术主权者”与一座失联的魔源中枢相连。第二章要做三件事：确认签署者身份，查清她为何需要灰港永远处于紧急状态，再让只读归档脱离黯星核心也能长期保存。', { expression: 'watchful' }),
      dialogueTurn('旁白', null, '石阶在王座后方一节节亮起，通向从未出现在高塔图纸上的上层。璃回头看了一眼不再鸣警的十层：灰港的撤离终于结案，但篡改命令的人仍在更高处留下了一扇门。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '那就一起上去。这次不是追责后就算结束，我们要把三年前没做完的事真正做完。', { expression: 'resolve' })
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
