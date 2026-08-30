export const DEMO10_HARD_MODE_ID = 'demo-10f-hard-v3-route-compression';

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
 * Shops now exist only on F1/F5/F9, and the F5/F9 shops convert Gold more
 * efficiently. To keep that stronger late conversion from flattening the end
 * game, ordinary enemies and bosses from F6 onward receive a gradual HP/ATK
 * pressure ramp. DEF is deliberately left stable to avoid creating surprise
 * hard breakpoints. Late magic bosses keep explicit threshold values, while
 * the final core carries the sharpest fixed-damage check so weak shop-order
 * choices remain meaningfully punishable even after the 130% F9 shop.
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
  enemies.palaceWarden.description = '王庭外环的高压执剑官。分层商店让中后期资源转换更有效，因此她用更高的固定魔法压力检查前七层的资源配置。';
  enemies.blackSealKeeper.description = '王座前最后一道黯星许可印。F9 强化商店提高最终配点效率，她因此使用更高的魔法阈值与破防阈值，错误投资不会获得保底。';
  if (enemies.hushCantor) enemies.hushCantor.description = '外环的静默咏唱者。她以固定魔法压力压缩“随便拿资源也能过”的宽松路线，迫使玩家在王庭前完成有效配装。';
  if (enemies.outerCrown) enemies.outerCrown.description = '先制剑压守住外环侧翼。她不是门禁单位，但让绕路取宝与直奔主线都要支付清楚的战斗代价。';
  if (enemies.nullCantor) enemies.nullCantor.description = '倒悬星桥的空谱咏唱者。高强度魔法波要求玩家把 F9 的金币转成真正承受得住终局的资源。';
  if (enemies.eclipseMage) enemies.eclipseMage.description = '蚀月术是王座前的最后一次普通敌人检查：迟到的生命投资与攻击投资都必须已经兑现。';
  if (enemies.voidCore) {
    enemies.voidCore.description = '女王与七重阵眼融合后的终局核心。F9 的 130% 强化商店能制造更高终盘战力，因此核心以极高固定魔法伤害检验玩家是否把金币转成了真正可承受的最终配置。';
  }

  return {
    id: DEMO10_HARD_MODE_ID,
    pressure: { ...DEMO10_HARD_MODE_PRESSURE },
    ordinaryPressure: { ...DEMO10_HARD_MODE_ORDINARY_PRESSURE },
    highFloorScaling: DEMO10_HIGH_FLOOR_SCALING
  };
}
