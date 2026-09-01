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

function dialogueSequence(title, turns) {
  return Object.freeze({ title, turns: Object.freeze(turns) });
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
        dialogueTurn('影织姬·鸦羽', 'shadow_boss', '女王听见“撤销登记”时，以为那些名字也会一起消失。于是她封住了整座塔。'),
        dialogueTurn('绫星·璃', 'hero', '她想守住名字，却让活着的人变成了工具。王庭里，我会亲口告诉她。')
      ]
    },
    floor8: {
      title: '第八阵：静默前庭',
      turns: [
        dialogueTurn('残响精灵·纱雾', 'guide', '七枚核心归位后，登记网露出了一条更高的回路：起源魔源仍在为它供能。', { expression: 'gentle' }),
        dialogueTurn('绫星·璃', 'hero', '先到王座，问女王是谁把临时登记接成了永不停机的系统。', { expression: 'resolve' })
      ]
    },
    floor9: {
      title: '第九阵：倒悬星桥',
      turns: [
        dialogueTurn('旁白', null, '星桥的封印记录着当年的签署顺序：撤离、封塔、延长紧急登记。'),
        dialogueTurn('绫星·璃', 'hero', '不是女王一个人把事情变成这样。我要把签署人和源头都找出来。', { expression: 'resolve' })
      ]
    },
    floor10: {
      title: '第十阵：无声王座',
      turns: [
        dialogueTurn('无声女王·诺克缇娅', 'final_queen', '三年里，我每天都听见同一句求援。若我关掉它，谁来记得灰港的人？', { cg: '/assets/anime/cg/liyue-noctia-truth-cg.webp', expression: 'sorrow' }),
        dialogueTurn('绫星·璃', 'hero', '我会记得。但让守卫永远互相伤害，不会把任何人送回家。', { expression: 'resolve' }),
        dialogueTurn('无声女王·诺克缇娅', 'final_queen', '那就证明给我看：你能让记录留下，也能让命令结束。', { expression: 'sorrow' })
      ]
    },

    bossCatPreDemo: dialogueSequence('第一阵守护者：猫卫长·米露', [
      dialogueTurn('猫卫长·米露', 'cat_boss', '昨夜起，塔门把每位来客都登记成敌人。我知道不对，却停不下爪子。'),
      dialogueTurn('绫星·璃', 'hero', '我不是来夺你的意志。让我斩断术式，带回属于我的核心。')
    ]),
    bossCatPostDemo: dialogueSequence('月影核心回收', [
      dialogueTurn('猫卫长·米露', 'cat_boss', '结界解除了。女王封塔前，一直在等灰港撤离的最后确认。'),
      dialogueTurn('绫星·璃', 'hero', '那份确认我会找出来。你先休息。')
    ]),
    bossFoxPreDemo: dialogueSequence('第二阵守护者：狐祝·绯叶', [
      dialogueTurn('狐祝·绯叶', 'fox_boss', '森罗结界会记下每一把钥匙和每一滴血。女王说，代价必须被保存。'),
      dialogueTurn('绫星·璃', 'hero', '记录代价是为了避免重犯，不是让人永远为旧日受罚。')
    ]),
    bossFoxPostDemo: dialogueSequence('森罗核心回收', [
      dialogueTurn('狐祝·绯叶', 'fox_boss', '你没有把钥匙和生命随手花掉。也许女王该看见这种选择。'),
      dialogueTurn('绫星·璃', 'hero', '等她肯听，我会把选择还给所有人。')
    ]),
    bossWhalePreDemo: dialogueSequence('第三阵守护者：深蓝歌姬·澜音', [
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '我的鲸歌本该指引最后一艘避难船。术式却要我把它唱成警报。'),
      dialogueTurn('绫星·璃', 'hero', '那就让它停下。真正的航线，不能被旧警报淹没。')
    ]),
    bossWhalePostDemo: dialogueSequence('潮汐核心回收', [
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '鲸歌停下了。我听见船长的原话：全员已离港。'),
      dialogueTurn('绫星·璃', 'hero', '女王从没收到这句确认。有人让登记网只收不结。')
    ]),
    bossSwordPreDemo: dialogueSequence('第四阵守护者：剑圣·塞蕾娜', [
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '封锁令只该维持到撤离结束。可它没有终止栏，我只能继续执行。'),
      dialogueTurn('绫星·璃', 'hero', '那就由我走到终止栏前，把这条命令补完。')
    ]),
    bossSwordPostDemo: dialogueSequence('锋刃核心回收', [
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '你看懂了规则，也没把它当借口。上层有供暖炉的记录。'),
      dialogueTurn('绫星·璃', 'hero', '我会追着记录走。')
    ]),
    bossDragonPreDemo: dialogueSequence('第五阵守护者：龙姬·焰璃', [
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '炉火烧了三年，连空屋都不准断热。登记网说：避难者可能归来。'),
      dialogueTurn('绫星·璃', 'hero', '“可能”不能成为永远消耗所有人的理由。')
    ]),
    bossDragonPostDemo: dialogueSequence('赤焰核心回收', [
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '强制契约断了。避难者的最后记录在星镜书库。'),
      dialogueTurn('绫星·璃', 'hero', '我会带着它去见女王。')
    ]),
    bossAstralPreDemo: dialogueSequence('第六阵守护者：天穹魔女·露米', [
      dialogueTurn('天穹魔女·露米', 'astral_boss', '我算过两条路：停止会遗失档案，继续会伤害守卫。女王选了后者。'),
      dialogueTurn('绫星·璃', 'hero', '那是被迫接受的两难，不是唯一答案。我要找出被藏掉的第三条。')
    ]),
    bossAstralPostDemo: dialogueSequence('天穹核心回收', [
      dialogueTurn('天穹魔女·露米', 'astral_boss', '演算更新：离港确认是真的，却被标成“不可结案”。'),
      dialogueTurn('绫星·璃', 'hero', '有人在女王之外，给系统加了更高的权限。')
    ]),
    bossShadowPreDemo: dialogueSequence('第七阵守护者：影织姬·鸦羽', [
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '我亲眼看见女王删掉自己的离塔许可。她宁可困住自己，也不肯结案。'),
      dialogueTurn('绫星·璃', 'hero', '她害怕停下后，灰港会被当作从未存在。我会让她看见真相。')
    ]),
    bossShadowPostDemo: dialogueSequence('虚影核心回收', [
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '七枚核心齐了。王庭能告诉你谁签了延长命令。'),
      dialogueTurn('绫星·璃', 'hero', '我不会再只问女王一个人。')
    ]),
    bossPalacePreDemo: dialogueSequence('第八阵守护者：静默执剑官·维拉', [
      dialogueTurn('静默执剑官·维拉', 'sword_boss', '王庭封的是起源魔源的访问权。没有它，女王也无法修改底层登记。'),
      dialogueTurn('绫星·璃', 'hero', '那我就先解除访问权，再让她亲手看完结案记录。')
    ]),
    bossPalacePostDemo: dialogueSequence('王庭外环解除', [
      dialogueTurn('静默执剑官·维拉', 'sword_boss', '外环解除。上层观测官保管着延长令的黯印。'),
      dialogueTurn('绫星·璃', 'hero', '我要那枚印，也要签署人的名字。')
    ]),
    bossBlackSealPreDemo: dialogueSequence('第九阵守护者：黯印观测官·塞芙', [
      dialogueTurn('黯印观测官·塞芙', 'astral_boss', '延长令的黯印来自王座之外。女王只能执行，不能撤销。'),
      dialogueTurn('绫星·璃', 'hero', '那我会带着印上去，让她知道自己并非唯一的罪人。')
    ]),
    bossBlackSealPostDemo: dialogueSequence('黯星通行印解除', [
      dialogueTurn('黯印观测官·塞芙', 'astral_boss', '许可印解除。签名写着：奥术主权者，紧急登记无限延长。'),
      dialogueTurn('绫星·璃', 'hero', '王座就在上面。真相还没结束。')
    ]),
    bossQueenPreDemo: dialogueSequence('第十阵：无声女王', [
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我收到的最后一条讯息是“等待确认”。我不敢让它被结案。', { expression: 'sorrow' }),
      dialogueTurn('绫星·璃', 'hero', '离港确认早就到了，却被更高权限拦下。你不必再替那条命令伤害所有人。', { expression: 'resolve' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '若你说得是真的，就用你的力量让我面对它。', { expression: 'sorrow' })
    ]),
    queenPhaseDemo: dialogueSequence('最终术式展开', [
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '黯星核心保管着原始签名。它不会允许任何人读取。'),
      dialogueTurn('绫星·璃', 'hero', '那就由我打破封锁，把记录取出来。')
    ]),
    bossQueenPostDemo: dialogueSequence('终章：魔法重新被选择', [
      dialogueTurn('绫星·璃', 'hero', '黯星核心碎了。原始签名指向起源魔源，那里才是延长令的根。', { expression: 'resolve' }),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '我会一起去。我要亲眼确认灰港的每个名字都还在。', { expression: 'sorrow' }),
      dialogueTurn('残响精灵·纱雾', 'guide', '王座开启通往上层的阶梯。十层并非终点。', { expression: 'gentle' })
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
