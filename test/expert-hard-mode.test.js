import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDemoTenFloorHardMode, DEMO10_HARD_MODE_PRESSURE } from '../src/game/demo-10-floor-hard-mode.js';
import { buildExpertNoHpShopPlan, EXPERT_NO_HP_STRATEGY_ID } from '../src/solver/expert-strategy.js';

test('hard-mode pressure restores the sharper F9 boss thresholds', () => {
  const enemies = { palaceWarden: { magicPower: 160 }, blackSealKeeper: { magicPower: 160, def: 95 } };
  const result = applyDemoTenFloorHardMode({ enemies });
  assert.equal(enemies.palaceWarden.magicPower, DEMO10_HARD_MODE_PRESSURE.palaceWardenMagicPower);
  assert.equal(enemies.blackSealKeeper.magicPower, DEMO10_HARD_MODE_PRESSURE.blackSealKeeperMagicPower);
  assert.equal(enemies.blackSealKeeper.def, DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef);
  assert.equal(result.pressure.blackSealKeeperMagicPower, 270);
});

test('expert planner emits only DEF/ATK shop decisions and never HP', () => {
  const planning = buildExpertNoHpShopPlan({ horizon: 1, maxDecisions: 6, maxIterations: 5_000 });
  assert.equal(planning.strategyId, EXPERT_NO_HP_STRATEGY_ID);
  assert.ok(planning.shopPlan.length > 0);
  assert.ok(planning.shopPlan.every((optionId) => optionId === 'def' || optionId === 'atk'));
  assert.ok(!planning.shopPlan.includes('hp'));
});
