export const DEMO10_HARD_MODE_ID = 'demo-10f-hard-v2-tiered-shops';

export const DEMO10_HARD_MODE_PRESSURE = Object.freeze({
  palaceWardenMagicPower: 255,
  blackSealKeeperMagicPower: 290,
  blackSealKeeperDef: 102
});

export const DEMO10_HIGH_FLOOR_SCALING = Object.freeze({
  6: Object.freeze({ hp: 1.03, atk: 1.02, magic: 1.03 }),
  7: Object.freeze({ hp: 1.05, atk: 1.03, magic: 1.05 }),
  8: Object.freeze({ hp: 1.08, atk: 1.04, magic: 1.06 }),
  9: Object.freeze({ hp: 1.10, atk: 1.05, magic: 1.08 }),
  10: Object.freeze({ hp: 1.12, atk: 1.06, magic: 1.10 })
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
 * hard breakpoints; the two late magic bosses keep explicit threshold values.
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
  enemies.palaceWarden.description = '王庭外环的高压执剑官。分层商店让中后期资源转换更有效，因此她用更高的固定魔法压力检查前七层的资源配置。';
  enemies.blackSealKeeper.description = '王座前最后一道黯星许可印。F9 强化商店提高最终配点效率，她因此使用更高的魔法阈值与破防阈值，错误投资不会获得保底。';

  return {
    id: DEMO10_HARD_MODE_ID,
    pressure: { ...DEMO10_HARD_MODE_PRESSURE },
    highFloorScaling: DEMO10_HIGH_FLOOR_SCALING
  };
}
