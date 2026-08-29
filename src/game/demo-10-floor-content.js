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

function dialogueTurn(speaker, portrait, text) {
  return Object.freeze({ speaker, portrait, text });
}

function dialogueSequence(title, turns) {
  return Object.freeze({ title, turns: Object.freeze(turns) });
}

// A topology revision needs an isolated save scope: older v1 saves contain
// their own mutable map copies, including the former decorative barriers.
export const DEMO_TEN_FLOOR_ID = 'demo-10f-v2-barrier-topology';

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

  // Production demo economy: only F1 / F5 / F9 contain shops. Later shops
  // expose stronger conversion multipliers while the eight-floor research
  // baseline remains untouched unless this overlay is explicitly installed.
  for (const floor of floors.slice(0, 7)) {
    if (![1, 5].includes(floor.number)) removeShops(floor.map);
  }
  ensureShop(floors[0].map, { x: 6, y: 7 });
  ensureShop(floors[4].map, { x: 5, y: 7 });
  Object.assign(floors[0], {
    objective: '使用初始魔眼图鉴判断损伤，击败猫卫长米露并回收月影核心。',
    initialRelics: Object.freeze(['codex', 'compass']),
    shopEffectMultiplier: 1,
    shopTierLabel: '基础咏唱'
  });
  Object.assign(floors[4], {
    shopEffectMultiplier: 1.15,
    shopTierLabel: '中层强化'
  });

  Object.assign(enemies, {
    muteGuard: {
      name: '缄默近卫', portrait: 'silence_guard', faction: '无声王庭·外环', floor: 8,
      hp: 1000, atk: 205, def: 82, gold: 155,
      description: '王庭外环的实体防线，专门惩罚只堆生命、不补防御的路线。'
    },
    hushCantor: {
      name: '止声咏唱者', portrait: 'eclipse_mage', faction: '无声王庭·外环', floor: 8,
      hp: 900, atk: 198, def: 76, gold: 170, special: 'magic', magicPower: 145,
      description: '以静默波绕过普通防御，让后期生命储备仍然具有真实价值。'
    },
    outerCrown: {
      name: '外环冠剑姬', portrait: 'sword_boss', faction: '无声王庭·外环', floor: 8,
      hp: 1180, atk: 212, def: 90, gold: 190, special: 'firstStrike',
      description: '先制剑压守住侧翼资源，制造是否绕路取宝的真实成本。'
    },
    palaceWarden: {
      name: '静默执剑官·维拉', portrait: 'sword_boss', faction: '无声王庭·外环', floor: 8,
      hp: 2250, atk: 205, def: 92, gold: 520, boss: true, special: 'magic', magicPower: 240,
      description: '守在王庭外环的执剑官。她不持有魔力核心，以高压静默剑域检验七核回收后的资源配置。'
    },
    starSentinel: {
      name: '逆星守望者', portrait: 'mirror_doll', faction: '倒悬星桥', floor: 9,
      hp: 1200, atk: 220, def: 92, gold: 185,
      description: '以倒悬星轨校准来客的进退路线，迫使防御路线真正兑现价值。'
    },
    nullCantor: {
      name: '空谱咏唱者', portrait: 'void_priestess', faction: '倒悬星桥', floor: 9,
      hp: 1000, atk: 205, def: 82, gold: 180, special: 'magic', magicPower: 170,
      description: '将咏唱压缩成高强度空谱波，限制无成本回收整层资源。'
    },
    crownShade: {
      name: '冠影巡猎姬', portrait: 'shadow_ninja', faction: '倒悬星桥', floor: 9,
      hp: 1100, atk: 225, def: 88, gold: 195, special: 'firstStrike',
      description: '在星桥阴影中先制截击，逼迫入侵者为路线选择付出成本。'
    },
    blackSealKeeper: {
      name: '黯印观测官·塞芙', portrait: 'astral_boss', faction: '王座前厅', floor: 9,
      hp: 2700, atk: 215, def: 95, gold: 600, boss: true, special: 'magic', magicPower: 160,
      description: '掌管王座前最后一道黯星许可印。王座前强化商店允许更高效的最终资源转换，因此她承担更高的终盘压力。'
    },
    silenceGuard: { ...enemies.silenceGuard, floor: 10 },
    eclipseMage: { ...enemies.eclipseMage, floor: 10 },
    crownKnight: { ...enemies.crownKnight, floor: 10 },
    finalQueen: { ...enemies.finalQueen, floor: 10 },
    voidCore: { ...enemies.voidCore, floor: 10 }
  });

  Object.assign(dialogues, {
    floor7: {
      speaker: '影织姬·鸦羽', portrait: 'shadow_boss', title: '第七阵：虚影织界',
      text: '“把日、月、星三张卡都带来。三相结界只认完整的魔力光谱。”\n\n这是最后一道核心阵。穿过它之后，七枚核心会全部回到你体内，但王庭本身还有两道防线。'
    },
    floor8: {
      speaker: '残响精灵·纱雾', portrait: 'guide', title: '第八阵：静默前庭',
      text: '七枚核心已经齐全。接下来不再有核心奖励，只有王庭为了筛掉错误路线设置的静默防线。两枚静默开关共同控制外环闸门。'
    },
    floor9: {
      speaker: '绫星·璃', portrait: 'hero', title: '第九阵：倒悬星桥',
      text: '王座就在上方。这里的星序不是力量测试，而是路线测试：依次踏过“月蚀、晨辉、星落”，才能打开黯星门。这里也是最后一座强化商店。'
    },
    floor10: {
      speaker: '无声女王·诺克缇娅', portrait: 'final_queen', title: '第十阵：无声王座',
      text: '“你已经证明自己能把无数选择收束成答案。但我仍认为，最安全的世界是不允许任何人选择。”\n\n七枚核心同时回应。璃踏入最后的王座。'
    },

    bossCatPreDemo: dialogueSequence('第一阵守护者：猫卫长·米露', [
      dialogueTurn('猫卫长·米露', 'cat_boss', '停下。强制术式要求我守住月影核心——哪怕我知道这命令并不属于我。'),
      dialogueTurn('绫星·璃', 'hero', '那我就把命令和核心一起斩开。先说好，我只取回属于我的魔力。')
    ]),
    bossCatPostDemo: dialogueSequence('月影核心回收', [
      dialogueTurn('猫卫长·米露', 'cat_boss', '结界命令解除了……原来输掉这一战，反而能让我重新听见自己的想法。'),
      dialogueTurn('绫星·璃', 'hero', '休息吧。下一层的强制术式，我会继续拆掉。')
    ]),
    bossFoxPreDemo: dialogueSequence('第二阵守护者：狐祝·绯叶', [
      dialogueTurn('狐祝·绯叶', 'fox_boss', '森罗结界会记录你的每一张卡、每一次取舍。让我看看你是不是只会凭力量往前撞。'),
      dialogueTurn('绫星·璃', 'hero', '固定数值已经把代价写清楚了。我来这里就是为了对自己的选择负责。')
    ]),
    bossFoxPostDemo: dialogueSequence('森罗核心回收', [
      dialogueTurn('狐祝·绯叶', 'fox_boss', '判断合格。你没有把钥匙和生命当成可以随便浪费的东西。'),
      dialogueTurn('绫星·璃', 'hero', '因为真正的魔法不是“能不能做”，而是“值不值得做”。')
    ]),
    bossWhalePreDemo: dialogueSequence('第三阵守护者：深蓝歌姬·澜音', [
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '鲸歌会直接穿过防御。若你的生命储备只是表面漂亮，现在就会被它揭穿。'),
      dialogueTurn('绫星·璃', 'hero', '那就让伤害结算说话。我的路线能不能撑住，不需要运气回答。')
    ]),
    bossWhalePostDemo: dialogueSequence('潮汐核心回收', [
      dialogueTurn('深蓝歌姬·澜音', 'whale_boss', '鲸歌停下了……谢谢你没有把我的失控当成罪。'),
      dialogueTurn('绫星·璃', 'hero', '控制你的人才该为这场战斗负责。')
    ]),
    bossSwordPreDemo: dialogueSequence('第四阵守护者：剑圣·塞蕾娜', [
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '不破防，就没有侥幸；防得住，就没有额外伤害。这一阵只承认计算与执行。'),
      dialogueTurn('绫星·璃', 'hero', '正合我意。让每一点攻击和防御都承担它该承担的结果。')
    ]),
    bossSwordPostDemo: dialogueSequence('锋刃核心回收', [
      dialogueTurn('剑圣·塞蕾娜', 'sword_boss', '你赢的不是数值本身，而是对数值的理解。'),
      dialogueTurn('绫星·璃', 'hero', '数值只是规则。选择才是玩家真正留下的痕迹。')
    ]),
    bossDragonPreDemo: dialogueSequence('第五阵守护者：龙姬·焰璃', [
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '这里有第二座商店，也有更重的龙火。把金币换成什么，就是你接下来几层要背负的答案。'),
      dialogueTurn('绫星·璃', 'hero', '我不会为了眼前轻松，把后面的路卖掉。来吧。')
    ]),
    bossDragonPostDemo: dialogueSequence('赤焰核心回收', [
      dialogueTurn('龙姬·焰璃', 'dragon_boss', '强制契约断了。再往上，敌人不会因为你走到高层就手下留情。'),
      dialogueTurn('绫星·璃', 'hero', '最好如此。太轻的胜利证明不了任何东西。')
    ]),
    bossAstralPreDemo: dialogueSequence('第六阵守护者：天穹魔女·露米', [
      dialogueTurn('天穹魔女·露米', 'astral_boss', '星图给出的结果很简单：错误顺序会归零，错误配点会留下永久代价。'),
      dialogueTurn('绫星·璃', 'hero', '所以我先解序列，再解你。把不可逆的风险留到最后。')
    ]),
    bossAstralPostDemo: dialogueSequence('天穹核心回收', [
      dialogueTurn('天穹魔女·露米', 'astral_boss', '演算更新：你的胜率已经从异常值变成主分支。'),
      dialogueTurn('绫星·璃', 'hero', '那就继续观察。我还没走到结论。')
    ]),
    bossShadowPreDemo: dialogueSequence('第七阵守护者：影织姬·鸦羽', [
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '三相结界之后就是王庭。到那里，不会再有核心奖励替你修正错误。'),
      dialogueTurn('绫星·璃', 'hero', '所以这一战之后，我只靠之前做过的选择。很好。')
    ]),
    bossShadowPostDemo: dialogueSequence('虚影核心回收', [
      dialogueTurn('影织姬·鸦羽', 'shadow_boss', '七枚核心齐了。女王真正害怕的不是你的力量，是你证明力量可以被选择。'),
      dialogueTurn('绫星·璃', 'hero', '那我就把这个答案带到她面前。')
    ]),
    bossPalacePreDemo: dialogueSequence('第八阵守护者：静默执剑官·维拉', [
      dialogueTurn('静默执剑官·维拉', 'sword_boss', '七核齐全不代表合格。王庭外环只检查一件事：你的资源配置能不能承受真实压力。'),
      dialogueTurn('绫星·璃', 'hero', '不用给我保底。让我看看前七层的选择到底值多少。')
    ]),
    bossPalacePostDemo: dialogueSequence('王庭外环解除', [
      dialogueTurn('静默执剑官·维拉', 'sword_boss', '固定数值已经给出了答案。你不是靠偶然性站在这里。'),
      dialogueTurn('绫星·璃', 'hero', '下一道门也一样。')
    ]),
    bossBlackSealPreDemo: dialogueSequence('第九阵守护者：黯印观测官·塞芙', [
      dialogueTurn('黯印观测官·塞芙', 'astral_boss', '最后一座商店的咏唱效率更高。你可以把积攒的金币一次性转成战力——但我的阈值也因此更高。'),
      dialogueTurn('绫星·璃', 'hero', '高收益对应高门槛。公平。现在检查我的最终配置吧。')
    ]),
    bossBlackSealPostDemo: dialogueSequence('黯星通行印解除', [
      dialogueTurn('黯印观测官·塞芙', 'astral_boss', '许可印解除。王座已无中间层，也没有下一家商店。'),
      dialogueTurn('绫星·璃', 'hero', '足够了。剩下的数值就是我自己的答案。')
    ]),
    bossQueenPreDemo: dialogueSequence('第十阵：无声女王', [
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '你把钥匙、金币和生命都变成了选择，却仍然把这种不确定性称为自由？'),
      dialogueTurn('绫星·璃', 'hero', '自由不是没有代价。自由是代价写清楚以后，仍然由自己决定。'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '那就用最后一战证明，你愿意承担这个答案。')
    ]),
    queenPhaseDemo: dialogueSequence('最终术式展开', [
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '人形只是最后一层限制。现在，七层魔阵会一起向你结算。'),
      dialogueTurn('绫星·璃', 'hero', '那就一起算。这里没有随机数，也没有借口。')
    ]),
    bossQueenPostDemo: dialogueSequence('终章：魔法重新被选择', [
      dialogueTurn('绫星·璃', 'hero', '黯星核心破碎了。你已经不能再替所有人决定要不要拥有魔法。'),
      dialogueTurn('无声女王·诺克缇娅', 'final_queen', '也许我真正害怕的，从来不是魔法失控……而是别人做出我无法控制的选择。'),
      dialogueTurn('残响精灵·纱雾', 'guide', '十重阵列解除。咏唱是否响起，再次回到每个人自己手中。')
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
      # . # # gate:hush # . # # . #
      # switch:hushB # enemy:muteGuard . item:atk . # item:star enemy:hushCantor #
      # . # . # # # # . # #
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
    objective: '按月蚀、晨辉、星落的顺序校准星桥，在王座前强化商店完成最后资源转换并击败塞芙。',
    intro: 'floor9',
    boss: 'blackSealKeeper',
    demoContentId: DEMO_TEN_FLOOR_ID,
    shopEffectMultiplier: 1.3,
    shopTierLabel: '王座强化',
    theme: { floor: 0x1a1838, floorAlt: 0x292151, wall: 0x62528f, glow: 0xc5a3ff, fog: 0x0f0c23 },
    map: parseDemoMap(`
      # # # # # # # # # # #
      # . enemy:starSentinel # item:dual # item:hpLarge enemy:nullCantor enemy:blackSealKeeper U #
      # . # # gate:blackstar # . # # . #
      # rune:C # enemy:crownShade . item:def . # item:star enemy:nullCantor #
      # . # . # # # # . # #
      # item:hpLarge enemy:nullCantor . rune:A item:atk . enemy:starSentinel . # #
      # # # . # . # # . # #
      # item:sun . . enemy:crownShade . # rune:B item:def . #
      # . # # # # # . # . #
      # D . item:moon . enemy:starSentinel item:atk shop item:hp . #
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
