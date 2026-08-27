function parseDemoMap(text, gridSize = 11) {
  const rows = text.trim().split('\n').map((row) => row.trim().split(/\s+/));
  if (rows.length !== gridSize || rows.some((row) => row.length !== gridSize)) {
    const widths = rows.map((row) => row.length).join(',');
    throw new Error(`Invalid demo map dimensions: ${rows.length} rows, widths ${widths}`);
  }
  return rows;
}

export const DEMO_TEN_FLOOR_ID = 'demo-10f-v1';

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
      hp: 2250, atk: 205, def: 92, gold: 520, boss: true, special: 'magic', magicPower: 260,
      defeatDialogue: 'bossPalaceWarden',
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
      hp: 2700, atk: 215, def: 100, gold: 600, boss: true, special: 'magic', magicPower: 280,
      defeatDialogue: 'bossBlackSeal',
      description: '掌管王座前最后一道黯星许可印。她不持有核心，而是把前九层积累转化为最终压力测试。'
    },
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
      text: '王座就在上方。这里的星序不是力量测试，而是路线测试：依次踏过“月蚀、晨辉、星落”，才能打开黯星门。'
    },
    floor10: {
      speaker: '无声女王·诺克缇娅', portrait: 'final_queen', title: '第十阵：无声王座',
      text: '“你已经证明自己能把无数选择收束成答案。但我仍认为，最安全的世界是不允许任何人选择。”\n\n七枚核心同时回应。璃踏入最后的王座。'
    },
    bossPalaceWarden: {
      speaker: '静默执剑官·维拉', portrait: 'sword_boss', title: '王庭外环解除',
      text: '维拉收剑退到墙边：“我只负责确认你不是依赖偶然性走到这里。固定数值已经给出了答案——继续向上。”'
    },
    bossBlackSeal: {
      speaker: '黯印观测官·塞芙', portrait: 'astral_boss', title: '黯星通行印解除',
      text: '倒悬星桥停止旋转。塞芙撤去最后一道许可印：“王座已无中间层。下一场战斗，只剩你与女王的选择。”'
    }
  });

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
      # item:dual enemy:outerCrown . . # item:hpLarge enemy:hushCantor enemy:palaceWarden U #
      # . # # gate:hush # . # # . #
      # switch:hushB # enemy:muteGuard . item:atk . # item:star enemy:hushCantor #
      # . # . # # # # . # #
      # item:hpLarge enemy:hushCantor . # item:def . enemy:outerCrown . # #
      # # # door:moon # . # # . # #
      # item:moon . . enemy:muteGuard . # switch:hushA item:sun . #
      # . # # # # # . # door:sun #
      # D . item:moon door:moon enemy:outerCrown item:def . item:hp . #
      # # # # # # # # # # #
    `, gridSize),
    puzzles: { switches: { hush: ['hushA', 'hushB'] } }
  };

  const floor9 = {
    id: 8,
    number: 9,
    title: '倒悬星桥',
    objective: '按月蚀、晨辉、星落的顺序校准星桥，在高压守卫间选择资源路径并击败塞芙。',
    intro: 'floor9',
    boss: 'blackSealKeeper',
    demoContentId: DEMO_TEN_FLOOR_ID,
    theme: { floor: 0x1a1838, floorAlt: 0x292151, wall: 0x62528f, glow: 0xc5a3ff, fog: 0x0f0c23 },
    map: parseDemoMap(`
      # # # # # # # # # # #
      # item:dual enemy:starSentinel . . # item:hpLarge enemy:nullCantor enemy:blackSealKeeper U #
      # . # # gate:blackstar # . # # . #
      # rune:C # enemy:crownShade . item:def . # item:star enemy:nullCantor #
      # . # . # # # # . # #
      # item:hpLarge enemy:nullCantor . rune:A item:atk . enemy:starSentinel . # #
      # # # door:star # . # # . # #
      # item:sun . . enemy:crownShade . # rune:B item:def . #
      # . # # # # # . # door:moon #
      # D . item:moon door:sun enemy:starSentinel item:atk . item:hp . #
      # # # # # # # # # # #
    `, gridSize),
    puzzles: {
      sequence: {
        order: ['B', 'A', 'C'],
        gate: 'blackstar',
        labels: { A: '晨辉', B: '月蚀', C: '星落' }
      }
    }
  };

  const floor10 = {
    ...finalFloor,
    id: 9,
    number: 10,
    title: '无声王座',
    objective: '突破最后近卫，击败无声女王及其黯星核心。',
    intro: 'floor10',
    boss: 'voidCore',
    demoContentId: DEMO_TEN_FLOOR_ID,
    map: finalFloor.map.map((row) => [...row])
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
