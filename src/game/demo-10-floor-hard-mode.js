export const DEMO10_HARD_MODE_ID = 'demo-10f-hard-v4-single-shop-rebase';

// The single-shop map, card graph, key relics and guardian cadence are now
// frozen.  This marks the first permitted numeric pass over that topology.
export const DEMO10_NUMERIC_REBASE_REQUIRED = false;

// F3–F4 are the bridge from the two early core holders to the single F5
// conversion checkpoint. They deliberately contain no new core or stair
// anchors, so their *ordinary* opponents are the lawful surface for the first
// rebase.  These values came from a bounded mutation sweep and a replayed
// engine witness; Bosses, guardian groups, cards, gates and key relics remain
// outside this table by contract.
export const DEMO10_SINGLE_SHOP_EARLY_RAMP = Object.freeze({
  tideLancer: Object.freeze({ hp: 176, atk: 42, def: 16 }),
  whaleSinger: Object.freeze({ hp: 150, atk: 38, def: 15, magicPower: 22 }),
  shellGuard: Object.freeze({ hp: 215, atk: 36, def: 21 }),
  swordApprentice: Object.freeze({ hp: 193, atk: 42, def: 17 }),
  swordKnight: Object.freeze({ hp: 215, atk: 46, def: 19 }),
  bladePriestess: Object.freeze({ hp: 204, atk: 40, def: 18 })
});

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
  shopCycle: Object.freeze(['atk', 'def', 'hp']),
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
 * This numeric overlay does not move rooms, cards, guardians, stairs or key
 * relics. F3–F4 use the replayed single-shop bridge values; F6–F10 retain the
 * late-game pressure ramp for the Boss-cluster endgame.
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

  for (const [enemyId, values] of Object.entries(DEMO10_SINGLE_SHOP_EARLY_RAMP)) {
    if (enemies[enemyId]) Object.assign(enemies[enemyId], values);
  }

  enemies.palaceWarden.magicPower = DEMO10_HARD_MODE_PRESSURE.palaceWardenMagicPower;
  enemies.blackSealKeeper.magicPower = DEMO10_HARD_MODE_PRESSURE.blackSealKeeperMagicPower;
  enemies.blackSealKeeper.def = DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef;
  if (enemies.voidCore) enemies.voidCore.magicPower = DEMO10_HARD_MODE_PRESSURE.voidCoreMagicPower;
  if (enemies.hushCantor) enemies.hushCantor.magicPower = DEMO10_HARD_MODE_ORDINARY_PRESSURE.hushCantorMagicPower;
  if (enemies.outerCrown) enemies.outerCrown.atk = DEMO10_HARD_MODE_ORDINARY_PRESSURE.outerCrownAtk;
  if (enemies.nullCantor) enemies.nullCantor.magicPower = DEMO10_HARD_MODE_ORDINARY_PRESSURE.nullCantorMagicPower;
  if (enemies.eclipseMage) enemies.eclipseMage.magicPower = DEMO10_HARD_MODE_ORDINARY_PRESSURE.eclipseMageMagicPower;
  enemies.palaceWarden.description = '王庭外环的高压执剑官。她以固定魔法压力检验玩家是否在唯一的 F5 转换点完成有效配装。';
  enemies.blackSealKeeper.description = '王座前最后一道黯星许可印。她保留终盘阈值，要求玩家把 F5 的资源转换兑现到最后。';
  if (enemies.hushCantor) enemies.hushCantor.description = '外环的静默咏唱者。她以固定魔法压力压缩“随便拿资源也能过”的宽松路线，迫使玩家在王庭前完成有效配装。';
  if (enemies.outerCrown) enemies.outerCrown.description = '先制剑压守住外环侧翼。她不是门禁单位，但让绕路取宝与直奔主线都要支付清楚的战斗代价。';
  if (enemies.nullCantor) enemies.nullCantor.description = '倒悬星桥的空谱咏唱者。她是旧数值基线的一部分，等待单店制下的整体重算。';
  if (enemies.eclipseMage) enemies.eclipseMage.description = '蚀月术是王座前的最后一次普通敌人检查：迟到的生命投资与攻击投资都必须已经兑现。';
  if (enemies.voidCore) {
    enemies.voidCore.description = '女王与七重阵眼融合后的终局核心。她保留终局魔法压力，要求玩家以正确的 F5 配装穿过王庭。';
  }

  return {
    id: DEMO10_HARD_MODE_ID,
    pressure: { ...DEMO10_HARD_MODE_PRESSURE },
    earlyRamp: structuredClone(DEMO10_SINGLE_SHOP_EARLY_RAMP),
    ordinaryPressure: { ...DEMO10_HARD_MODE_ORDINARY_PRESSURE },
    highFloorScaling: DEMO10_HIGH_FLOOR_SCALING,
    numericRebaseRequired: DEMO10_NUMERIC_REBASE_REQUIRED
  };
}
