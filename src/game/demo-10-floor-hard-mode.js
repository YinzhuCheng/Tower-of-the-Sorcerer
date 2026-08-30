export const DEMO10_HARD_MODE_ID = 'demo-10f-hard-v3-route-compression';

// The single-shop topology deliberately reopens spatial design. These values
// are retained as the last numeric baseline, but are not evidence that the
// revised map is balanced. A new witness and mutator pass are required only
// after card gates, rooms and visual review are frozen again.
export const DEMO10_NUMERIC_REBASE_REQUIRED = true;

export const DEMO10_HARD_MODE_PRESSURE = Object.freeze({
  palaceWardenMagicPower: 245,
  blackSealKeeperMagicPower: 220,
  blackSealKeeperDef: 96,
  voidCoreMagicPower: 420
});

// These are deliberately *not* bosses, guardians, card gates, or key-relic
// owners.  The topology pass froze those anchors before this numeric pass.
// Together they are the smallest screened pressure bundle that removes nearly
// half of the forgiving route-family candidates while preserving three
// independently replayable ways through the frozen campaign.
export const DEMO10_HARD_MODE_ORDINARY_PRESSURE = Object.freeze({
  hushCantorMagicPower: 249,
  outerCrownAtk: 258,
  nullCantorMagicPower: 277,
  eclipseMageMagicPower: 151
});

// This is a release witness, not an assertion that every simple purchase
// cycle should win.  Its route is replayed against the authoritative engine in
// validation and production build checks.
export const DEMO10_HARD_ROUTE_PROOF = Object.freeze({
  shopCycle: Object.freeze(['atk', 'hp', 'hp']),
  holyPolicy: 'immediate',
  progressionPriority: 'guardian-first'
});

export const DEMO10_HIGH_FLOOR_SCALING = Object.freeze({
  6: Object.freeze({ hp: 1.01, atk: 1.01, magic: 1.01 }),
  7: Object.freeze({ hp: 1.02, atk: 1.01, magic: 1.02 }),
  8: Object.freeze({ hp: 1.04, atk: 1.02, magic: 1.03 }),
  9: Object.freeze({ hp: 1.06, atk: 1.03, magic: 1.04 }),
  10: Object.freeze({ hp: 1.08, atk: 1.04, magic: 1.06 })
});

function scaleStat(value, multiplier) {
  return Number.isFinite(value) ? Math.round(value * multiplier) : value;
}

/**
 * Production hard-mode pressure overlay for the 10F browser slice.
 *
 * This is the retained pre-single-shop numeric baseline. It does not move
 * rooms, cards, guardians, stairs or key relics. Its pressure must not be
 * tuned until the revised single-shop topology has passed static and visual
 * acceptance, at which point fresh route witnesses replace the old ones.
 */
export function applyDemoTenFloorHardMode({ enemies } = {}) {
  if (!enemies?.palaceWarden || !enemies?.blackSealKeeper) {
    throw new Error('10F hard mode requires the demo late-game enemies to be installed first.');
  }

  for (const enemy of Object.values(enemies)) {
    const profile = DEMO10_HIGH_FLOOR_SCALING[enemy?.floor];
    if (!profile) continue;
    enemy.hp = scaleStat(enemy.hp, profile.hp);
    enemy.atk = scaleStat(enemy.atk, profile.atk);
    if (enemy.special === 'magic' && Number.isFinite(enemy.magicPower)) {
      enemy.magicPower = scaleStat(enemy.magicPower, profile.magic);
    }
  }

  enemies.palaceWarden.magicPower = DEMO10_HARD_MODE_PRESSURE.palaceWardenMagicPower;
  enemies.blackSealKeeper.magicPower = DEMO10_HARD_MODE_PRESSURE.blackSealKeeperMagicPower;
  enemies.blackSealKeeper.def = DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef;
  if (enemies.voidCore) enemies.voidCore.magicPower = DEMO10_HARD_MODE_PRESSURE.voidCoreMagicPower;
  if (enemies.hushCantor) enemies.hushCantor.magicPower = DEMO10_HARD_MODE_ORDINARY_PRESSURE.hushCantorMagicPower;
  if (enemies.outerCrown) enemies.outerCrown.atk = DEMO10_HARD_MODE_ORDINARY_PRESSURE.outerCrownAtk;
  if (enemies.nullCantor) enemies.nullCantor.magicPower = DEMO10_HARD_MODE_ORDINARY_PRESSURE.nullCantorMagicPower;
  if (enemies.eclipseMage) enemies.eclipseMage.magicPower = DEMO10_HARD_MODE_ORDINARY_PRESSURE.eclipseMageMagicPower;
  enemies.palaceWarden.description = '王庭外环的高压执剑官。她保留上一版数值基线的固定魔法压力；单店制地图冻结后才会重新校准。';
  enemies.blackSealKeeper.description = '王座前最后一道黯星许可印。她保留上一版终盘阈值；单店制地图冻结后才会重新校准。';
  if (enemies.hushCantor) enemies.hushCantor.description = '外环的静默咏唱者。她以固定魔法压力压缩“随便拿资源也能过”的宽松路线，迫使玩家在王庭前完成有效配装。';
  if (enemies.outerCrown) enemies.outerCrown.description = '先制剑压守住外环侧翼。她不是门禁单位，但让绕路取宝与直奔主线都要支付清楚的战斗代价。';
  if (enemies.nullCantor) enemies.nullCantor.description = '倒悬星桥的空谱咏唱者。她是旧数值基线的一部分，等待单店制下的整体重算。';
  if (enemies.eclipseMage) enemies.eclipseMage.description = '蚀月术是王座前的最后一次普通敌人检查：迟到的生命投资与攻击投资都必须已经兑现。';
  if (enemies.voidCore) {
    enemies.voidCore.description = '女王与七重阵眼融合后的终局核心。当前数值是待重算的历史基线；终局压力将在单店制拓扑冻结后重新建立。';
  }

  return {
    id: DEMO10_HARD_MODE_ID,
    pressure: { ...DEMO10_HARD_MODE_PRESSURE },
    ordinaryPressure: { ...DEMO10_HARD_MODE_ORDINARY_PRESSURE },
    highFloorScaling: DEMO10_HIGH_FLOOR_SCALING,
    numericRebaseRequired: DEMO10_NUMERIC_REBASE_REQUIRED
  };
}
