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
        dialogueTurn('旁白', null, '星镜里的批注一闪而过：离港确认有效，结案的印权却被上层锁住。', { kind: 'narration' }),
        dialogueTurn('旁白', null, '第七层没有窗，只有成千上万根影线穿过墙壁。每根线都牵着一道命令的来路，也牵着一名无法违令的守卫。', { kind: 'narration' }),
        dialogueTurn('旁白', null, '璃走近时，七束颜色不同的光从她胸前分向各层。那是尚未取回的最后一段咏唱在呼唤其余六段，也让她第一次看清：七名守护者的契约都系在同一个结案锁上。', { cg: '/assets/anime/cg/liyue-yayu-seven-core-network-cg-audit-v3.webp', cgHold: 4, kind: 'narration' }),
        dialogueTurn('影织姬·鸦羽', 'shadow_boss', '女王以为“撤销登记”就是删掉名字。她把自己也留在塔里，一等就是三年。'),
        dialogueTurn('影织姬·鸦羽', 'shadow_boss', '我负责沿影线追查每道命令从哪里来。可延长令落下的那一刻，虚影核心反过来把发令的源头遮住了；我明明看见异常，却连报告都送不出。', { expression: 'guarded' }),
        dialogueTurn('绫星·璃', 'hero', '她想守住灰港，却让守卫们成了命令的工具。我会带着证据去见她。', { expression: 'guarded' }),
        dialogueTurn('绫星·璃', 'hero', '月影留下出发录音，森罗留下乘员名单，潮汐带回抵达原音，锋刃和赤焰证明封锁被异常延长，天穹找到了上层锁。还差你追到的发令来路，七份记录才会连成完整证词。', { expression: 'resolve' }),
        dialogueTurn('残响精灵·纱雾', 'guide', '取回第七枚虚影核心，王庭就会承认七份见证。月、星卡开结界，日曜卡留给王座。', { expression: 'focus' })
      ]
    },
    floor8: {
      title: '第八阵：静默前庭',
      turns: [
        dialogueTurn('旁白', null, '七枚核心在门上投出七道签名。封了三年的王庭外环终于回应。', { kind: 'narration' }),
        dialogueTurn('旁白', null, '门缝里没有风，只有整齐重复的核验声。王庭外环并不判断谁善谁恶，它只比较证据是否一致；三年前没人能凑齐被拆散在七层的记录，于是门一直认定撤离尚未完成。', { kind: 'narration' }),
        dialogueTurn('残响精灵·纱雾', 'guide', '核心们证明回执是真的，也暴露了一条更高的回路：起源魔源仍在维持整座登记网。', { expression: 'watchful' }),
        dialogueTurn('残响精灵·纱雾', 'guide', '起源魔源在王庭上方，是整座塔最初的动力与档案库。诺克缇娅能调用它维持救援，却改不了被写进塔基旧规里的主权命令。', { expression: 'watchful' }),
        dialogueTurn('旁白', null, '璃试着推门，七枚核心同时发烫。门后传来的不是女王的声音，而是一道被写进塔基旧规、任何人都不能单独撤销的命令。', { kind: 'narration' }),
        dialogueTurn('绫星·璃', 'hero', '所以取回魔力只是第一步。我得先解开王庭外环，再让女王亲眼看到离港证据。', { expression: 'resolve' }),
        dialogueTurn('残响精灵·纱雾', 'guide', '踩亮两枚静默开关、击败维拉就能上行。右侧双卫守着额外宝物，不是必经之路；先想清楚那场战斗值不值得挨。', { expression: 'focus' })
      ]
    },
    floor9: {
      title: '第九阵：倒悬星桥',
      turns: [
        dialogueTurn('旁白', null, '倒悬星桥记录着三道指令的先后：灰港撤离、女王封塔、紧急登记被无限延长。', { kind: 'narration' }),
        dialogueTurn('旁白', null, '三行时间依次亮起。船长的回执先进入高塔的潮汐回路，却没有送到王庭；一刻钟后，诺克缇娅因仍看不到回执而封塔；又过了七息，一道陌生的上层命令把“临时”改成“无限”。顺序排开后，谁在因果链上做了什么终于不再混成一团。', { kind: 'narration' }),
        dialogueTurn('残响精灵·纱雾', 'guide', '最后一道指令带着王座之外的黯星印权。诺克缇娅也许做错了选择，却不是唯一的签署人。', { expression: 'watchful' }),
        dialogueTurn('绫星·璃', 'hero', '她封塔、夺走我的咏唱，这些是她亲手做的；可在她之后，又有人把一道没有停止条件的命令写进了更高处。两件事都得说清。', { expression: 'guarded' }),
        dialogueTurn('绫星·璃', 'hero', '我不是去替她开脱。我要让她面对七名守护者受过的伤，也要把真正改写命令的人从黑印后面找出来。少说任何一半，三年前的事都会再次被说成一个人的错。', { expression: 'guarded' }),
        dialogueTurn('绫星·璃', 'hero', '塞芙守着黯星通行印。拿到它，我们才能越过王座封印，读出延长令的真正签名。', { expression: 'resolve' }),
        dialogueTurn('残响精灵·纱雾', 'guide', '先用月辉卡进入校准台，再按月蚀、晨辉、星落的顺序踩亮符文。', { expression: 'focus' })
      ]
    },
    floor10: {
      title: '第十阵：无声王座',
      turns: [
        dialogueTurn('旁白', null, '王座上没有胜利庆典，只有一封不断重播的求援。七枚核心在璃身边同时亮起。', { kind: 'narration' }),
        dialogueTurn('旁白', null, '殿墙刻着灰港撤离者的名字。塔外，有人已在北岸开店、成家、做了领航员；塔内，这些名字仍停在三年前的“等待确认”，像那场风暴从未过去。', { kind: 'narration' }),
        dialogueTurn('无声女王·诺克缇娅', 'final_queen', '三年里，我每天都听见同一句“等待确认”。你说他们已经到岸，那就把那句话带到我面前。', { cg: '/assets/anime/cg/liyue-noctia-truth-cg-audit-v3.webp', cgHold: 3, expression: 'sorrow' }),
        dialogueTurn('旁白', null, '她隔着长阶按住王座旁的封印链。黯星纹路沿手腕向上爬，像是在替她提醒：任何结案请求，都仍被这座王座视为威胁。', { kind: 'narration' }),
        dialogueTurn('绫星·璃', 'hero', '我带回了七枚核心，也带回北辰七号真正的回话。你等了三年的答案就在这座塔里。', { expression: 'resolve' }),
        dialogueTurn('无声女王·诺克缇娅', 'final_queen', '那就带着日曜卡走到王座前。别隔着长阶向我保证——让我亲眼看。', { expression: 'sorrow' })
      ]
    },

    bossCatPreDemo: dialogueSequence('第一阵守护者：猫卫长·米露', [
      dialogueTurn('旁白', null, '月白门廊的地面遍布爪痕。猫卫长挡在楼梯前，手上的铃铛还在重复封塔警报。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '门廊原是撤离者进入高塔后的第一站。长桌上还摊着三年前的登记册，墨迹停在最后一页；靠墙的小凳高低不一，是米露特意为孩子们找来的。', { kind: 'narration' }),
      dialogueTurn('猫卫长·米露', 'cat_boss', '那一夜，所有人进塔前都要先从我这里过。我认脸、核名字、给孩子找凳子，也替走不动的人把第一道门撑着。可名册停在三年前以后，这扇门就再也不会问“你是谁”，只会问“你是不是名单里的人”。'),
      dialogueTurn('猫卫长·米露', 'cat_boss', '璃，我当然认得你。你当年还把湿透的披风借给一个小孩。可登记网认不出这种事——它只看见你的名字不在三年前那一页上。月影契约已经在扯我的手了，我再拖下去，它会替我先扑过去。'),
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
      dialogueTurn('狐祝·绯叶', 'fox_boss', '名册归我保管，门钥也在我手里。那不是为了把人变成一排整齐数字；每一个名字后面都要有船号，也要有目的地回来的确认。三项对不上，我就不能擅自把最后一页合上。'),
      dialogueTurn('狐祝·绯叶', 'fox_boss', '前六艘船都已齐全。最后一页记录北辰七号四十七人，船号和姓名都在，唯独“安全抵达”一栏空着。登记网因此继续把四十七人连同负责她们的我们都当成等待救援。'),
      dialogueTurn('狐祝·绯叶', 'fox_boss', '我守的不只是名字，还有为撤离付过的每一把钥匙、每一滴血。女王说代价不能被忘掉。'),
      dialogueTurn('绫星·璃', 'hero', '记住代价，是为了不再重犯。但把每个名字永远困在撤离那天，不是纪念。', { expression: 'guarded' }),
      dialogueTurn('旁白', null, '绯叶垂下眼，藤蔓却缠紧她的手腕，将法杖尖端强行对准璃。缺少回签的名册不允许她放任何人上楼。', { kind: 'narration' }),
      dialogueTurn('狐祝·绯叶', 'fox_boss', '我已经试过把自己的名字从守卫名单上划掉。森罗核心立刻又写了回来，还让藤蔓攻击替我递笔的人。你若靠近，它也会如此。'),
      dialogueTurn('狐祝·绯叶', 'fox_boss', '那就让我看看，你会不会为了省事，把手里的钥匙和力气都耗在这里。')
    ]),
    bossFoxPostDemo: dialogueSequence('森罗核心回收', [
      dialogueTurn('狐祝·绯叶', 'fox_boss', '你没有把钥匙和力气随手耗掉。女王若还肯看，她该看见人不是只会服从指令。'),
      dialogueTurn('旁白', null, '森罗核心里没有最后一页名册。记录显示，那一页被第三层导航台接走了。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '第二段咏唱回到璃体内，散落的叶片随之排成撤离顺序。名单没有缺人：北辰七号的四十七个名字全在，缺失的只有那艘船抵达北岸后的回签。', { kind: 'narration' }),
      dialogueTurn('狐祝·绯叶', 'fox_boss', '不是名册漏了人，是最后一艘船的回签没被送回来。澜音守着导航台，她那里一定听见过什么。'),
      dialogueTurn('绫星·璃', 'hero', '第一层证明船已离港，第二层证明所有人确实登上北辰七号。接下来只要找回船长的抵达原音，灰港无人滞留这件事就完整了。', { expression: 'guarded' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '潮汐回路在第三层。澜音曾负责引导灰港的最后一艘船。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '我们去听清楚那艘船的回答。绯叶，替我保管好这份名册。', { expression: 'resolve' })
    ]),
    bossWhalePreDemo: dialogueSequence('第三阵守护者：深蓝歌姬·澜音', [
      dialogueTurn('旁白', null, '澜音站在水纹阵中。鲸歌每绕行一周，都会把一段船长的回话压回水下。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '导航台的圆窗外并没有海，术式却把三年前的浪投在玻璃上。每当幻浪拍下，室内便闪过北辰七号驶过最后一座浮标的影像。', { kind: 'narration' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '我唱歌不是为了给风暴添回声。潮汐歌会把航道一段一段点亮，也会把船长最后那句“我们到了”送回名册。北辰七号离港那晚，我一直听到她越过最后一座浮标——我很确定，我听见了她。'),
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
      dialogueTurn('残响精灵·纱雾', 'guide', '也就是说，失效的不是船长回执，而是王庭收到回执后给它下的判定。我们已经证明撤离完成，下一步要查封锁为何没有按规定终止。', { expression: 'watchful' }),
      dialogueTurn('绫星·璃', 'hero', '女王不知道人们已经离开。下一层的锋刃庭院掌管封锁令，那里会有修改记录。', { expression: 'guarded' }),
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '去吧。我会把这句回话保存好，等她愿意听的时候，再完整地唱一次。')
    ]),
    bossSwordPreDemo: dialogueSequence('第四阵守护者：剑圣·塞蕾娜', [
      dialogueTurn('旁白', null, '塞蕾娜的剑前摆着两份命令。原件写着“护送撤离”，副本只剩“禁止上行”。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '原件边缘还有巡卫们的签字和交班时间，最后一班写着“待北辰七号回签后解除”。副本在相同位置留下一块整齐的空白，像是有人把整句话连同墨水一起挖走。', { kind: 'narration' }),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '我训练巡卫，是为了在最乱的时候给伤员留出一条能走的路。封锁本来只是把逆行的人挡开，不是让所有人永远停在门外。可只要这份封锁令还被判定有效，锋刃核心就会把每一个上行者都当成会堵死通道的人。'),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '封锁令只该维持到撤离结束。可副本没有终止栏，锋刃核心命令我继续执行。'),
      dialogueTurn('绫星·璃', 'hero', '潮汐核心已经带回“全员离港”的回执。我会取回你身上的第四枚核心，把终止时间补回去。', { expression: 'resolve' }),
      dialogueTurn('旁白', null, '塞蕾娜看了一眼原件，像是想收剑。下一刻，锋刃印在她掌心亮起，她只能将剑锋重新抬到璃的眼前。', { kind: 'narration' }),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '三年来，我把剑锋偏开过很多次。核心会在下一击纠正角度，直到我无法避开。别把我的克制当成放行的承诺；进入战斗后，我的身体不会继续听我指挥。'),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '先证明你能穿过这道命令。我会尽力出剑，这是契约留给我最后的选择。')
    ]),
    bossSwordPostDemo: dialogueSequence('锋刃核心回收', [
      dialogueTurn('旁白', null, '最后一道剑光擦过璃的肩头，钉在那张无期副本上。塞蕾娜趁契约松动，亲手将剑从掌中放开。', { kind: 'narration' }),
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '命令断了。你看懂规则，也没拿它当伤害别人的借口。锋刃核心应该归还你。'),
      dialogueTurn('旁白', null, '第四段咏唱进入剑脊，随后回到璃体内。被挖空的终止栏短暂复原：它原本会在收到潮汐回签后自行结案，却在封塔后被替换成了没有结束条件的副本。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '核心中保存着封锁令的编辑记录。终止栏不是女王删的，她只能读到一份无期副本。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '诺克缇娅下达了临时封锁，但她看到的命令后来已经被人换过。她要为夺走我们的选择负责，改写终止栏的人也必须留下名字。', { expression: 'guarded' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '副本由赤焰龙脉持续供能。上层的供暖炉应该还保存着当年的能耗记录。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '如果避难者已经离开，炉火就不该还在烧。我们去找龙姬焰璃。', { expression: 'guarded' })
    ]),
    bossDragonPreDemo: dialogueSequence('第五阵守护者：龙姬·焰璃', 'redVein', [
      dialogueTurn('旁白', null, '锻炉的心跳隔着石墙传来。供暖管仍向一排早已空下来的避难屋送去热量。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '走廊里叠着洗净的汤碗，碗沿没有一点灰，显然每天都有人擦拭。焰璃仍按四十七人的份量烧水、煮汤，再在无人领取后将它们倒掉。', { kind: 'narration' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '我管的不是炉子，是炉子后面那些会发冷的人。那一夜有人发高烧、有人全身湿透，我只知道一件事：屋里还有人，就不能让火灭。可登记网只要还留着一个“等待确认”，赤焰核心就会把整排空屋都当成还住着伤员。', { expression: 'embers' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '又一次点名：无人应答。可登记网还是只给我一条结论——继续燃烧。', { expression: 'embers' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '我试过逐间关阀。每关一处，核心就把那间屋标成“伤员失温”，逼我用更大的火补回来。我知道屋里没人，可万一我的判断错一次，代价就是一条命。'),
      dialogueTurn('绫星·璃', 'hero', '我不会让你现在就熄火。先让我看清是谁把“等一等”写成了永远。', { expression: 'guarded' }),
      dialogueTurn('绫星·璃', 'hero', '战斗结束后你来操作阀门，我用取回的赤焰咏唱稳住炉温。我们一间一间关，不让管道骤冷，也不再为不存在的伤员继续烧空炉。', { expression: 'resolve' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '你若骗我，炉火会把你也列进待救名单。', { expression: 'embers' }),
      dialogueTurn('绫星·璃', 'hero', '那就用这一战，让我先斩断强制契约。', { expression: 'resolve' })
    ]),
    bossDragonPostDemo: dialogueSequence('赤焰核心回收', 'redVein', [
      dialogueTurn('旁白', null, '赤焰核心离开炉心，暴烈的火舌终于缩成温暖的灯焰。焰璃急忙调低阀门，而不是任由整座炉室骤冷。', { kind: 'narration' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '火候降下来了……原来我还记得该怎样让一盏灯只为正在等的人亮着。', { expression: 'embers' }),
      dialogueTurn('旁白', null, '第五段咏唱带着暖意回到璃体内。她与焰璃沿走廊逐一确认空屋，把整排无人居住的避难屋停掉，只留下守卫仍在使用的三间；旧管道没有爆裂，也没有任何求救声被遗漏。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '炉心吐出一枚被压住的去向签：最后一艘船的回执，被送往星镜书库。', { expression: 'watchful' }),
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '能耗记录还显示，回执抵达后炉火本应自行转入低档，王庭却发来一条“维持救援”的压过原令的新指令。它不是我的命令，也不是锋刃庭院的副本。'),
      dialogueTurn('绫星·璃', 'hero', '前四层告诉我们回执是真的、终止栏被换了；赤焰炉记现在证明改令发生后，整座塔仍被持续供能。去星镜书库，我们查这道压过原令的新指令究竟从谁手里来。', { expression: 'guarded' }),
      dialogueTurn('绫星·璃', 'hero', '焰璃，替我守住这盏灯。我们会把回执带回来。', { expression: 'guarded' })
    ]),
    bossAstralPreDemo: dialogueSequence('第六阵守护者：天穹魔女·露米', [
      dialogueTurn('旁白', null, '露米的星镜同时映出两幅景象：一边是空白的灰港名册，一边是永不停歇的战斗。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '镜框下堆满露米写过的演算稿。最上面一页只有两个结果：停止登记，四十七个名字被旧规抹去；保持登记，七名守护者继续把所有来者视作敌人。纸角被反复摩挲得发白。', { kind: 'narration' }),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '王座每做一个决定，最后都会先从我的星镜里走一遍。我会把它可能伤到谁、会留下什么后果算给诺克缇娅看。可三年前开始，天穹核心只肯给我看旧规承认的答案；我能算出两条路都很糟，却连第三条路的入口都碰不到。'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '我算过两条路：停止会遗失档案，继续会伤害守卫。女王看完演算，选了后者。'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '她问过我：“能不能只把姓名留下，把求援关闭？”我尝试建立不可涂改的档案，演算每次都在访问起源魔源时被拒绝。不是方法不存在，是起源魔源根本不许我把演算继续下去。'),
      dialogueTurn('旁白', null, '露米抬手想关掉星镜，镜面却自行转向璃，成百道预演过的攻击同时亮起。她的叹息被淹没在术式的嗡鸣里。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '因为她宁可把自己困住，也不敢赌那些名字会不会消失。可这两条路都是旧规逼出来的。', { expression: 'guarded' }),
      dialogueTurn('绫星·璃', 'hero', '把月影录音、森罗名册、潮汐原音、锋刃编辑记录和赤焰能耗放进同一条时间线。若回执先到、覆盖命令后到，我们就能沿那次拒绝访问的痕迹向上追。', { expression: 'resolve' }),
      dialogueTurn('绫星·璃', 'hero', '我要取回天穹核心，读出那份抵达回执完整的经手记录。那里一定藏着第三条路。', { expression: 'resolve' })
    ]),
    bossAstralPostDemo: dialogueSequence('天穹核心回收', [
      dialogueTurn('旁白', null, '失去天穹核心的星镜没有熄灭，只是停止攻击。露米第一次把演算拖回离港回执抵达的那一刻。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '六份记录在镜中对齐：北辰七号确已抵达北岸，潮汐回执也确实进入高塔，却在送到王庭前被截住。按原来的顺序，它本应继续上送并触发解封；随后，一道来自王庭上方的命令将这份回执判成“不可结案”，又删除了封锁的终止条件。', { kind: 'narration' }),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '演算更新：离港确认是真的。但接收后一刻钟，它被更高一层的印权改成了“不可结案”。'),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '第六段咏唱恢复后，我终于能计算第三条路：将姓名、船号、抵达时间写入不可涂改的档案，再从名单上撤下救援令。记录会留下，命令可以停止。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '这道印权不属于女王。它从王庭之上接入，经过虚影层时，签名也被黑线遮住了。', { expression: 'watchful' }),
      dialogueTurn('天穹魔女·露米', 'astral_boss', '鸦羽管理虚影织界。她知道那条线穿过了谁的名字。'),
      dialogueTurn('绫星·璃', 'hero', '那就去第七层。收回最后一枚核心，我们就有七份证据去打开王庭。', { expression: 'resolve' })
    ]),
    bossShadowPreDemo: dialogueSequence('第七阵守护者：影织姬·鸦羽', 'starMirror', [
      dialogueTurn('旁白', null, '数十根影线在空中织出塔的轮廓；最上层有一根线，既不通向王座，也不通向任何守卫。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '其余影线都标着用途：门禁、名册、导航、巡卫、供暖与演算。唯独那根自上而下的黑线没有名称。它穿过塔内所有职司，却绕开了诺克缇娅的王座签章。', { kind: 'narration' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '影线原本是用来找出“这道命令到底从谁手里来”的。该藏的签名我会藏，该追的源头我也会追。可现在虚影核心把最重要的那一段黑了下去，只准我继续维护这张网，却不许我看见是谁先把它织成现在这样。', { expression: 'guarded' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '正常的遮蔽是保护撤离者姓名，不让敌人从名册追到北岸。可这根黑线遮住的却是发令者。现在我只能确定：主权印经过虚影层以后，签名被挡住了。至于是签署者刻意遮名，还是上层旧规本来就不向王座公开，我还没有证据。', { expression: 'guarded' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '我看见陛下划掉自己的离塔许可。她想留下来守住灰港，结果让所有人都陪她被困。', { expression: 'guarded' }),
      dialogueTurn('绫星·璃', 'hero', '那不是她一个人的责任。她的恐惧让她不敢停手，而那道更高的命令又把“不能停”变成了整座塔都必须服从的旧规。', { expression: 'guarded' }),
      dialogueTurn('旁白', null, '鸦羽指尖微动，影线便先一步缠上她的手臂。线结强迫她摆出迎战姿势，也把那枚陌生主权印藏得更深。', { kind: 'narration' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '别靠我的左侧。核心会先封住你的影子，再借影线刺向本体。我能提醒你的只有这些；开战后，连这点声音也会被它收走。', { expression: 'guarded' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '证明给我看。否则我会把你也钉在这张网里。', { expression: 'guarded' }),
      dialogueTurn('绫星·璃', 'hero', '好。等网断开，你来亲自作证。', { expression: 'resolve' })
    ]),
    bossShadowPostDemo: dialogueSequence('虚影核心回收', 'starMirror', [
      dialogueTurn('旁白', null, '虚影核心归位后，缠住鸦羽手臂的线结一一松开。她没有倒下，而是立刻抓住那根逃向上层的黑线。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '第七段咏唱回到璃体内，七个残缺音节终于接成完整旋律。月影辨认、森罗记名、潮汐传讯、锋刃护送、赤焰维生、天穹核对、虚影追踪——这首咏唱本来用于让撤离的每一步彼此作证。', { kind: 'narration' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '第七根影线回到了王庭外。尽头不是女王的签名，而是一枚被遮住的主权印。', { expression: 'guarded' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '我只能看见印权高于王座，名称仍被黯星印覆盖。要揭开它，必须先用七枚核心通过王庭外环，再去第九层找观测官塞芙解除黑印。', { expression: 'guarded' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '七枚核心都回到璃身上了。它们保存的见证足以打开王庭，也能证明守卫无需再战斗。', { expression: 'focus' }),
      dialogueTurn('绫星·璃', 'hero', '我们已经找回抵达回执、封锁修改和上层命令。接下来要问的，是女王为什么一直不敢让它停下。', { expression: 'guarded' }),
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '告诉她，我没有忘记灰港，也不愿意再替这道命令伤人。这是我自己的回答。', { expression: 'guarded' })
    ]),
    bossPalacePreDemo: dialogueSequence('第八阵守护者：静默执剑官·维拉', [
      dialogueTurn('旁白', null, '维拉站在王庭外环的密闭门前。门上的文字表明，它封锁的不是一间宫殿。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '七个凹槽围着门锁排列，恰好对应璃失去的七段咏唱。每个凹槽下都刻着一句旧规：“单一记录可以出错，彼此独立的见证必须核对。”', { kind: 'narration' }),
      dialogueTurn('静默执剑官·维拉', 'palace_warden_v2', '我的职责是核验进入王庭的证据，防止有人伪造撤离结果、擅改起源魔源。你带来的七枚核心必须逐一应答。'),
      dialogueTurn('静默执剑官·维拉', 'palace_warden_v2', '月影要证明谁经过门廊，森罗要证明名单完整，潮汐要复述船长原音；锋刃、赤焰、天穹与虚影则要说明回执进入高塔后为什么没能到达王庭。任何一份时间不合，我都不能开门。'),
      dialogueTurn('静默执剑官·维拉', 'palace_warden_v2', '这道门封住起源魔源的访问权。没有它，就连女王也只能维持登记，不能修改塔基旧令。'),
      dialogueTurn('绫星·璃', 'hero', '所以她不只是不愿意关闭，也没有真正的关闭权。但她封住所有人的选择，仍然必须回答。', { expression: 'guarded' }),
      dialogueTurn('旁白', null, '七枚核心依次亮起，门锁仍将维拉的剑推离剑鞘。核验完成以前，她同样不能让路。', { kind: 'narration' }),
      dialogueTurn('静默执剑官·维拉', 'palace_warden_v2', '我的剑会逐段检验咏唱。你若在中途倒下，外环会把证据重新判为无效；不是我怀疑你，而是这道旧规只承认完整通过的结果。'),
      dialogueTurn('静默执剑官·维拉', 'palace_warden_v2', '先让七枚核心通过我的剑。若它们的见证一致，我会把外环通行印交给你。')
    ]),
    bossPalacePostDemo: dialogueSequence('王庭外环解除', [
      dialogueTurn('旁白', null, '维拉将剑插回门锁。七道光沿剑脊汇成同一个时间戳，密闭门随之退开半尺。', { kind: 'narration' }),
      dialogueTurn('静默执剑官·维拉', 'palace_warden_v2', '七份见证完全一致：灰港撤离已完成。我解除王庭外环。'),
      dialogueTurn('旁白', null, '门上的“等待确认”逐字熄灭，换成清晰的结论：“北辰七号，四十七人，于停战次日凌晨抵达北岸；灰港撤离完成。”这是三年来，高塔第一次正式承认那场救援已经结束。', { kind: 'narration' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '我还是无法读取延长令的签名。有一枚黯星印遮住了发令者。', { expression: 'watchful' }),
      dialogueTurn('静默执剑官·维拉', 'palace_warden_v2', '外环只能确认事实，不能解除高于王座的命令。现在我们知道灰港平安，也知道诺克缇娅收到的是被篡改后的结果；最后缺的是谁下令无限延长。'),
      dialogueTurn('静默执剑官·维拉', 'palace_warden_v2', '第九层的观测官塞芙保管那枚印。她守的是进入王座前最后一道校准。'),
      dialogueTurn('绫星·璃', 'hero', '我要那枚印，也要签署人的名字。诺克缇娅不该继续替那位尚未现身的签署者承担全部责任。', { expression: 'resolve' })
    ]),
    bossBlackSealPreDemo: dialogueSequence('第九阵守护者：黯印观测官·塞芙', [
      dialogueTurn('旁白', null, '黯星印悬在塞芙身后。印面将延长令的签名涂成一团黑色，只留下“无限”二字。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '塞芙脚边散着没有送出的异常报告。第一封写于封塔当天：“抵达回执早于封锁，记载冲突”；最后一封写于今晨，内容完全相同，纸张却已叠了厚厚一摞。', { kind: 'narration' }),
      dialogueTurn('黯印观测官·塞芙', 'black_seal_keeper_v2', '我负责观测上层指令是否越过王座，也守着唯一能揭开签名的通行印。三年来，它不许我向任何人交付异常报告。'),
      dialogueTurn('黯印观测官·塞芙', 'black_seal_keeper_v2', '我每天都记录同一个矛盾：灰港已经撤离，救援命令却仍有效。每当我把报告送向王庭，黯印就会将收件人改成我自己。诺克缇娅因此从未看见完整警告。'),
      dialogueTurn('黯印观测官·塞芙', 'black_seal_keeper_v2', '这枚印来自王座之外。它把延长令刻进塔基旧规，女王可以继续执行，却不能单独撤销。'),
      dialogueTurn('绫星·璃', 'hero', '她仍然应该为封住守卫道歉，但她不应替真正的发令者背上全部责任。', { expression: 'guarded' }),
      dialogueTurn('旁白', null, '塞芙伸手触碰黯印，手指立刻被黑光弹开。她转而举起法杖——通行印只承认能击破校准术式的人。', { kind: 'narration' }),
      dialogueTurn('黯印观测官·塞芙', 'black_seal_keeper_v2', '开战后，黑印会把我的观察术改成攻击术。我会标出它最薄弱的三个校准点，但无法替你踩亮。击破它，报告和签名才能同时解封。'),
      dialogueTurn('绫星·璃', 'hero', '塞芙，把印交给我。我会带着它去见女王，也让真正的签署人留下姓名。', { expression: 'resolve' })
    ]),
    bossBlackSealPostDemo: dialogueSequence('黯星通行印解除', [
      dialogueTurn('旁白', null, '黑光剥落，印面第一次显出完整字迹。塞芙没有立刻开口，只把三年前没能递出的异常报告交到璃手中。', { kind: 'narration' }),
      dialogueTurn('黯印观测官·塞芙', 'black_seal_keeper_v2', '黯印解除了。签名写着：奥术主权者；指令是“灰港紧急登记，无限延长”。'),
      dialogueTurn('黯印观测官·塞芙', 'black_seal_keeper_v2', '签署时间在诺克缇娅封塔后七息。她下的是临时命令，奥术主权者随后把它写入起源魔源，并删掉了终止条件。之后，这枚主权印又把所有与“无限延长”相冲的异常报告挡在王庭外——但仅凭这里的痕迹，还不能断定那是他亲手加上的封锁，还是高层旧规在自行保护这道命令。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '奥术主权者管理起源魔源，身份高于王座。可他现在不在这十层之内。', { expression: 'watchful' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '“奥术主权者”只告诉我们签令者在塔里的身份，并不能解释他当时看见了什么、为什么会删掉期限。要把这份责任说清，我们必须进入王座后的上层档案区，亲自找到签署人。今晚能做的，是先让诺克缇娅看见回执和这枚主权印。', { expression: 'watchful' }),
      dialogueTurn('绫星·璃', 'hero', '那就先去王座。女王必须看见抵达回执和这枚印，才能明白自己守了什么。', { expression: 'resolve' }),
      dialogueTurn('黯印观测官·塞芙', 'black_seal_keeper_v2', '带好日曜卡。王座结界后没有商店，进去以后，你就得用现有的一切走到底。')
    ]),
    bossQueenPreDemo: dialogueSequence('第十阵：无声女王', 'night', [
      dialogueTurn('旁白', null, '王座前没有庆典，只有一封被反复播放、始终没有落款的求援讯息。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '诺克缇娅坐在灰尘未落的王座上，像三年前一样穿着停战礼服。她面前摆着四十七枚姓名牌，每一枚都被擦得干净；这三年她没有忘记任何人，也没有走出这间殿。', { kind: 'narration' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我最后收到的，不是“人已到岸”，只有四个字——等待确认。王庭又一次次把同一个警告推到我眼前：一旦结案，所有还挂着“未确认”的名字都会被当成临时记录清掉。那四十七块名牌就在我面前，我没有勇气按下去。', { expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '璃来接应时，我已经耗尽维持登记网的魔力。风暴还在撞门，名册上又有四十七个人没有回签。我怕登记网一停，她们就会连求救过都无人知道，所以夺走了璃的咏唱，把七段分别交给七名守护者。'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '最开始，我真的只想再等一会儿。我想，等回执来了，我就把七段咏唱还给你，再去向米露她们一个个道歉。可一会儿变成一夜，一夜又变成一年、两年、三年。后来我已经知道她们在受苦，也知道自己正在把“再等等”变成新的伤害，可我越来越不敢承认，那个应该按下停止的人一直都是我。', { expression: 'sorrow' }),
      dialogueTurn('旁白', null, '诺克缇娅看向七枚核心。米露的铃声、澜音的船长回话、露米的时间记录在殿中依次响起，她的剑尖第一次动摇。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '你留下，不是因为舍不得王座，是怕承认救援结束以后，那些名字也会跟着消失。可人没有消失。真正没到你手里的，是北岸早就送回来的回答。', { expression: 'guarded' }),
      dialogueTurn('绫星·璃', 'hero', '北辰七号的四十七人全部抵达北岸。米露保存了出发录音，绯叶保住了完整名单，澜音带回船长原音；塞蕾娜、焰璃、露米和鸦羽又证明，结案是在回执抵达后被上层命令截断的。'),
      dialogueTurn('绫星·璃', 'hero', '米露、绯叶、澜音和其他守护者都记得那一夜。保留名字，不等于逼她们永远受命。', { expression: 'resolve' }),
      dialogueTurn('绫星·璃', 'hero', '你先为救人封塔，后来却因为害怕失去记录，把所有人留在命令里。奥术主权者留下的命令把你的恐惧固化成了整座塔的旧规；可夺走咏唱、迟迟不肯面对守护者的痛苦，仍是你必须亲口承担的部分。', { expression: 'guarded' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我听过米露的铃铛在夜里失控，也听过澜音把同一句警报唱到声音发抖。焰璃守着空炉，她们都来问过我什么时候才算结束。我没有回答。每次那些姓名牌在我眼前烧成灰，我就把她们再推回去守一晚——这一晚，是我亲手加上去的。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '天穹核心已经算出第三条路。我们先把姓名、船号、人数和抵达时间写入不可涂改的档案，再撤下救援令。你不必靠永远重复求援来证明自己记得她们。', { expression: 'resolve' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我想相信你，璃。可这三年里，我已经太多次把“我想相信”当成继续拖延的理由。黯星核心不听我们的解释，它只认那套旧命令。若我们真要走第三条路，就得先把它从王座下面拽出来。', { expression: 'sorrow' }),
      dialogueTurn('旁白', null, '诺克缇娅试着把剑放到地上。剑尖刚离开王座半尺，腕上的黯星纹便骤然收紧，像另一只手重新扣住她的五指。她咬住一声痛呼，剑锋仍被强行抬回璃面前。', { kind: 'narration' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '看见了吗？我已经可以说“停”，身体却还不能照做。先斩断缠在我手腕、王冠和王座之间的封印。别把剑锋让给我的脸，也别因为是我就收力——只有把这层束缚逼到崩裂，黯星核心才会离开我，露出真正的本体。', { expression: 'resolve' }),
      dialogueTurn('绫星·璃', 'hero', '明白。我斩的是封印，不是你。等核心出来，我们再一起把这场救援真正停下。', { expression: 'resolve' })
    ]),
    queenPhaseDemo: dialogueSequence('最终术式展开', 'night', [
      dialogueTurn('旁白', null, '女王的剑停了，黯星核心却从王座下升起。它用魔法反击将两人一同锁在阵中。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '核心把四十七枚姓名牌投成燃烧的幻象，又在每一枚下方写出“关闭即删除”。诺克缇娅下意识伸手护住它们，锁链便趁机缠上她的手腕。', { kind: 'narration' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '原来我一直只能借它的力量维持救援，却从没有真正握住让它停下的钥匙。它锁着原始签名，也不许我承认撤离已经结束。', { expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我仍然是做出封塔选择的人，但我不会再让这份恐惧替我挥剑。璃，眼前燃烧的姓名牌只是它拿来吓我的幻象；当夜的出发录音、名册、船长回话和改令痕迹都还分散保存在七枚核心里。攻击核心。', { expression: 'resolve' }),
      dialogueTurn('旁白', null, '诺克缇娅反手扯断束缚自己的黑纹，为璃撕开一道狭窄缺口。七枚核心沿缺口照亮黯星的裂缝。', { cg: '/assets/anime/cg/liyue-noctia-seal-cg-audit-v3.webp', cgHold: 2, kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '那就一起打破它。它的反击会穿过护甲；我会用上一战剩下的力气撑过去。', { expression: 'embers' })
    ]),
    bossQueenPostDemo: dialogueSequence('终章：魔法重新被选择', 'night', [
      dialogueTurn('旁白', null, '黯星核心碎裂，王庭的警报终于停下。墙上的灰港名字没有消失，只是不再闪烁。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '诺克缇娅逐个触碰那些名字。七枚核心先把四十七块名牌封进王庭卷册，让它们不再向守卫发令；这只是王庭层的临时封卷，还没有经过更上层的最终归档。', { kind: 'narration' }),
      dialogueTurn('旁白', null, '门廊的铃铛、导航台的鲸歌与锻炉的轰鸣也相继安静下来。七名守护者仍保有当夜的记忆，却不再被迫重复当夜的动作；她们第一次可以决定接下来要去哪里。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '七枚核心都已回收，守卫们也恢复了自由。可原始签名指向更高处的起源魔源。', { expression: 'resolve' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '封塔是我做的，把你的咏唱拆开也是我做的。哪怕后来有人篡改了命令，这两件事也不会因此变成别人的责任。我不能只说一句“对不起”就留在王座上等你们善后。接下来的路，我会一起走；等真正的结案完成，再由米露她们决定要不要接受我的道歉。', { expression: 'sorrow' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我不会用“上层命令也在逼我”替自己开脱。等我们回来，我会把封塔经过、七名守护者遭受的强制契约和我作出的每个决定公开记录。她们愿不愿继续留在塔里，由她们自己选择。', { expression: 'sorrow' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '王座后面的阶梯通向起源魔源。真正把“临时”改成“无限”的签名，就在那里。我们先找到签署人，再问他为什么这么做。', { expression: 'focus' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '还有一件事不能忘：就算黯星核心碎了，档案也必须能独立留下。否则我们只是换了一种方式，把那些名字绑在另一枚核心上。', { expression: 'watchful' }),
      dialogueTurn('旁白', null, '石阶在王座后方一节节亮起，通向从未出现在高塔图纸上的上层。璃回头看了一眼不再鸣警的十层：高塔终于承认北辰七号已经到岸，七名守护者也不再受旧命令驱使；可灰港的原卷还没有完成最终归档，真正的结案仍在更高处。', { kind: 'narration' }),
      dialogueTurn('绫星·璃', 'hero', '那就一起上去。找到签署人，撤下无限延长，也让这些档案不再依赖警报才能留下。三年前没收好的尾，我们这次一件件收完。', { expression: 'resolve' })
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
