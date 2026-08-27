import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyDemoTenFloorHardMode,
  DEMO10_HARD_MODE_PRESSURE,
  DEMO10_HIGH_FLOOR_SCALING
} from '../src/game/demo-10-floor-hard-mode.js';
import { buildExpertNoHpShopPlan, EXPERT_NO_HP_STRATEGY_ID } from '../src/solver/expert-strategy.js';

test('hard-mode pressure restores sharper late boss thresholds including final core', () => {
  const enemies = {
    palaceWarden: { magicPower: 160 },
    blackSealKeeper: { magicPower: 160, def: 95 },
    voidCore: { floor: 10, hp: 3400, atk: 205, def: 98, special: 'magic', magicPower: 164 }
  };
  const result = applyDemoTenFloorHardMode({ enemies });
  assert.equal(enemies.palaceWarden.magicPower, DEMO10_HARD_MODE_PRESSURE.palaceWardenMagicPower);
  assert.equal(enemies.blackSealKeeper.magicPower, DEMO10_HARD_MODE_PRESSURE.blackSealKeeperMagicPower);
  assert.equal(enemies.blackSealKeeper.def, DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef);
  assert.equal(enemies.voidCore.magicPower, DEMO10_HARD_MODE_PRESSURE.voidCoreMagicPower);
  assert.equal(result.pressure.blackSealKeeperMagicPower, 190);
  assert.equal(result.pressure.blackSealKeeperDef, 96);
  assert.equal(result.pressure.voidCoreMagicPower, 460);
});

test('tiered-shop hard mode ramps F6-F10 HP/ATK pressure without generic DEF cliffs', () => {
  const enemies = {
    floor6: { floor: 6, hp: 1000, atk: 100, def: 90 },
    floor9: { floor: 9, hp: 1000, atk: 100, def: 90, special: 'magic', magicPower: 100 },
    floor10: { floor: 10, hp: 1000, atk: 100, def: 90 },
    palaceWarden: { floor: 8, hp: 2000, atk: 200, def: 92, magicPower: 160, special: 'magic' },
    blackSealKeeper: { floor: 9, hp: 2500, atk: 210, def: 95, magicPower: 160, special: 'magic' }
  };
  applyDemoTenFloorHardMode({ enemies });

  assert.equal(enemies.floor6.hp, Math.round(1000 * DEMO10_HIGH_FLOOR_SCALING[6].hp));
  assert.equal(enemies.floor9.atk, Math.round(100 * DEMO10_HIGH_FLOOR_SCALING[9].atk));
  assert.equal(enemies.floor9.magicPower, Math.round(100 * DEMO10_HIGH_FLOOR_SCALING[9].magic));
  assert.equal(enemies.floor10.hp, Math.round(1000 * DEMO10_HIGH_FLOOR_SCALING[10].hp));
  assert.equal(enemies.floor6.def, 90);
  assert.equal(enemies.floor10.def, 90);
});

test('expert planner emits only DEF/ATK shop decisions and never HP', () => {
  const planning = buildExpertNoHpShopPlan({ horizon: 1, maxDecisions: 6, maxIterations: 5_000 });
  assert.equal(planning.strategyId, EXPERT_NO_HP_STRATEGY_ID);
  assert.ok(planning.shopPlan.length > 0);
  assert.ok(planning.shopPlan.every((optionId) => optionId === 'def' || optionId === 'atk'));
  assert.ok(!planning.shopPlan.includes('hp'));
});
