export const DEMO10_HARD_MODE_ID = 'demo-10f-hard-v1';

export const DEMO10_HARD_MODE_PRESSURE = Object.freeze({
  palaceWardenMagicPower: 240,
  blackSealKeeperMagicPower: 270,
  blackSealKeeperDef: 100
});

/**
 * Hard-mode pressure overlay for the 10F browser/demo slice.
 *
 * The base 10F content module still owns topology, rewards and enemy identity.
 * This bounded overlay only restores the sharper late-game boss thresholds that
 * were previously relaxed to rescue HP-first shop cycles.
 */
export function applyDemoTenFloorHardMode({ enemies } = {}) {
  if (!enemies?.palaceWarden || !enemies?.blackSealKeeper) {
    throw new Error('10F hard mode requires the demo late-game enemies to be installed first.');
  }

  enemies.palaceWarden.magicPower = DEMO10_HARD_MODE_PRESSURE.palaceWardenMagicPower;
  enemies.blackSealKeeper.magicPower = DEMO10_HARD_MODE_PRESSURE.blackSealKeeperMagicPower;
  enemies.blackSealKeeper.def = DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef;
  enemies.blackSealKeeper.description = '掌管王座前最后一道黯星许可印。高压版本要求把金币优先转换为防御，并在破防或击杀回合阈值出现时补攻击；错误的生命投资不再受到保底。';

  return {
    id: DEMO10_HARD_MODE_ID,
    pressure: { ...DEMO10_HARD_MODE_PRESSURE }
  };
}
