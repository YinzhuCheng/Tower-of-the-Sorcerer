import { ENEMIES, ITEMS, SHOP_OPTIONS, getShopCost } from '../game/data.js';
import { calculateBattle, parseToken } from '../game/engine.js';
import { fixedPurchaseOptionAt } from './fixed-purchase-policy-adapter.js';
import { fractionalMinimumCostForValue } from './tower-bounds.js';

const FINAL_BOSS_ENTRY = Object.entries(ENEMIES).find(([, enemy]) => enemy.finalBoss);
if (!FINAL_BOSS_ENTRY) throw new Error('Fixed-purchase bound diagnostics require a finalBoss enemy.');
const [FINAL_BOSS_ID, FINAL_BOSS] = FINAL_BOSS_ENTRY;

function shopOption(id) {
  return SHOP_OPTIONS.find((option) => option.id === id) ?? null;
}

function remainingTokens(adapter, state) {
  if (typeof adapter.materializeState !== 'function') {
    throw new Error('Bound diagnostics require materializeState().');
  }
  const materialized = adapter.materializeState(state);
  const tokens = [];
  for (let floor = 0; floor < materialized.floorStates.length; floor += 1) {
    const map = materialized.floorStates[floor]?.map ?? [];
    for (let y = 0; y < map.length; y += 1) {
      for (let x = 0; x < map[y].length; x += 1) {
        tokens.push({ floor, x, y, token: map[y][x] });
      }
    }
  }
  return { materialized, tokens };
}

function scanRemainder(adapter, state) {
  const { materialized, tokens } = remainingTokens(adapter, state);
  let flatHpGain = 0;
  let flatAtkGain = 0;
  let flatDefGain = 0;
  let freeGold = 0;
  let luckyStillAvailable = false;
  let holyStillAvailable = false;
  let wardStillAvailable = false;
  const remainingEnemyIds = [];
  const remainingItems = [];

  for (const entry of tokens) {
    const parsed = parseToken(entry.token);
    if (parsed.type === 'item') {
      const item = ITEMS[parsed.id];
      if (!item) continue;
      flatHpGain += Math.max(0, item.hp ?? 0);
      flatAtkGain += Math.max(0, item.atk ?? 0);
      flatDefGain += Math.max(0, item.def ?? 0);
      freeGold += Math.max(0, item.gold ?? 0);
      luckyStillAvailable ||= item.relicKey === 'lucky';
      holyStillAvailable ||= item.relicKey === 'holy';
      wardStillAvailable ||= item.relicKey === 'ward';
      remainingItems.push({ floor: entry.floor + 1, id: parsed.id });
    } else if (parsed.type === 'enemy') {
      const enemy = ENEMIES[parsed.id];
      if (!enemy) continue;
      flatHpGain += Math.max(0, enemy.reward?.hp ?? 0);
      flatAtkGain += Math.max(0, enemy.reward?.atk ?? 0);
      flatDefGain += Math.max(0, enemy.reward?.def ?? 0);
      remainingEnemyIds.push(parsed.id);
    }
  }

  return {
    materialized,
    flatHpGain,
    flatAtkGain,
    flatDefGain,
    freeGold,
    luckyStillAvailable,
    holyStillAvailable,
    wardStillAvailable,
    remainingEnemyIds,
    remainingItems
  };
}

function enemyKillGold(enemy, luckyMultiplier) {
  return Math.max(0, enemy?.gold ?? 0) * luckyMultiplier
    + Math.max(0, enemy?.reward?.gold ?? 0);
}

function optimisticEnemyGold(enemyIds, luckyMultiplier) {
  return enemyIds.reduce((sum, enemyId) => sum + enemyKillGold(ENEMIES[enemyId], luckyMultiplier), 0);
}

function optimisticAdditionalPurchases(shopPurchases, optimisticFutureGold) {
  let gold = Math.max(0, optimisticFutureGold);
  let count = 0;
  let purchaseIndex = shopPurchases;
  while (count < 10_000) {
    const cost = getShopCost({ shopPurchases: purchaseIndex });
    if (gold < cost) break;
    gold -= cost;
    purchaseIndex += 1;
    count += 1;
  }
  return count;
}

function futurePurchaseCost(shopPurchases, count) {
  let total = 0;
  for (let offset = 0; offset < count; offset += 1) {
    total += getShopCost({ shopPurchases: shopPurchases + offset });
  }
  return total;
}

function fixedPurchaseGains(shopPurchases, count, policy) {
  const gains = { atk: 0, def: 0, hp: 0 };
  const options = [];
  for (let offset = 0; offset < count; offset += 1) {
    const purchaseIndex = shopPurchases + offset;
    const optionId = fixedPurchaseOptionAt(purchaseIndex, policy);
    const option = shopOption(optionId);
    if (!option) throw new Error(`Unknown fixed purchase option in bound diagnostic: ${optionId}`);
    options.push(optionId);
    gains.atk += Math.max(0, option.effect?.atk ?? 0);
    gains.def += Math.max(0, option.effect?.def ?? 0);
    gains.hp += Math.max(0, option.effect?.hp ?? 0);
  }
  return { gains, options };
}

function finalBossDamageLowerBound(atk, wardAvailable) {
  const battle = calculateBattle(
    { hp: Number.MAX_SAFE_INTEGER, atk, def: Number.MAX_SAFE_INTEGER },
    FINAL_BOSS,
    { ward: wardAvailable }
  );
  return Number.isFinite(battle.totalDamage) ? battle.totalDamage : Number.POSITIVE_INFINITY;
}

function minimumFractionalHarvestDamage({ enemyIds, luckyMultiplier, atk, def, wardAvailable, requiredGold }) {
  const offers = enemyIds.map((enemyId) => {
    const enemy = ENEMIES[enemyId];
    const value = enemyKillGold(enemy, luckyMultiplier);
    const battle = calculateBattle(
      { hp: Number.MAX_SAFE_INTEGER, atk, def },
      enemy,
      { ward: wardAvailable }
    );
    const cost = Number.isFinite(battle.totalDamage) ? Math.max(0, battle.totalDamage) : 0;
    return { value, cost };
  });
  return fractionalMinimumCostForValue(offers, requiredGold);
}

/**
 * Explain the CURRENT fixed-purchase admissible upper bound without changing it.
 *
 * The diagnostic independently reconstructs the exact relaxation from the
 * materialized remaining map, then asserts that its maximum equals the adapter's
 * proof-level objectiveUpperBound(). If this equality fails, callers must discard
 * the decomposition rather than reason from stale diagnostic math.
 */
export function explainFixedPurchaseTerminalHpUpperBound({
  adapter,
  state,
  shopPlan = [],
  shopCycle = ['def', 'atk', 'hp']
} = {}) {
  if (!adapter || typeof adapter.objectiveUpperBound !== 'function') {
    throw new Error('Bound diagnostics require an adapter with objectiveUpperBound().');
  }
  const policy = { shopPlan: [...shopPlan], shopCycle: [...shopCycle] };
  const remainder = scanRemainder(adapter, state);
  const materialized = remainder.materialized;
  const stats = materialized.stats;
  const shopPurchases = materialized.shopPurchases;
  if (materialized.victory) {
    const adapterUpperBound = adapter.objectiveUpperBound(state);
    return {
      schemaVersion: 1,
      model: 'fixed-purchase-upper-bound-explain-v0.1',
      exactMatch: adapterUpperBound === stats.hp,
      adapterUpperBound,
      explainedUpperBound: stats.hp,
      best: null,
      scenarios: []
    };
  }

  const luckyMultiplier = materialized.relics.lucky || remainder.luckyStillAvailable ? 2 : 1;
  const enemyGold = optimisticEnemyGold(remainder.remainingEnemyIds, luckyMultiplier);
  const optimisticGold = stats.gold + remainder.freeGold + enemyGold;
  const additionalPurchases = optimisticAdditionalPurchases(shopPurchases, optimisticGold);
  const holyMultiplier = !materialized.relics.holy && remainder.holyStillAvailable ? 2 : 1;
  const wardAvailable = materialized.relics.ward || remainder.wardStillAvailable;
  const optimisticBaseAtk = stats.atk + remainder.flatAtkGain;
  const optimisticBaseDef = stats.def + remainder.flatDefGain;
  const optimisticBaseHp = stats.hp + remainder.flatHpGain;
  const maxFixed = fixedPurchaseGains(shopPurchases, additionalPurchases, policy);
  const maxHarvestAtk = optimisticBaseAtk + maxFixed.gains.atk;
  const maxHarvestDef = optimisticBaseDef + maxFixed.gains.def;
  const freeGoldBeforeKills = stats.gold + remainder.freeGold;

  const scenarios = [];
  for (let purchaseCount = 0; purchaseCount <= additionalPurchases; purchaseCount += 1) {
    const fixed = fixedPurchaseGains(shopPurchases, purchaseCount, policy);
    const purchaseCost = futurePurchaseCost(shopPurchases, purchaseCount);
    const requiredEnemyGold = Math.max(0, purchaseCost - freeGoldBeforeKills);
    const harvestDamage = minimumFractionalHarvestDamage({
      enemyIds: remainder.remainingEnemyIds,
      luckyMultiplier,
      atk: maxHarvestAtk,
      def: maxHarvestDef,
      wardAvailable,
      requiredGold: requiredEnemyGold
    });
    const atk = optimisticBaseAtk + fixed.gains.atk;
    const finalDamage = finalBossDamageLowerBound(atk, wardAvailable);
    if (!Number.isFinite(finalDamage)) continue;
    const hpBeforeFinal = (optimisticBaseHp + fixed.gains.hp) * holyMultiplier;
    scenarios.push({
      purchaseCount,
      purchaseOptions: fixed.options,
      gains: fixed.gains,
      purchaseCost,
      freeGoldBeforeKills,
      requiredEnemyGold,
      fractionalHarvestDamage: harvestDamage,
      atkBeforeFinal: atk,
      finalBossDamageLowerBound: finalDamage,
      hpBeforeFinal,
      upperBound: hpBeforeFinal - harvestDamage - finalDamage
    });
  }

  scenarios.sort((a, b) => b.upperBound - a.upperBound || a.purchaseCount - b.purchaseCount);
  const best = scenarios[0] ?? null;
  const explainedUpperBound = best?.upperBound ?? Number.NEGATIVE_INFINITY;
  const adapterUpperBound = adapter.objectiveUpperBound(state);
  const exactMatch = Object.is(explainedUpperBound, adapterUpperBound)
    || Math.abs(explainedUpperBound - adapterUpperBound) <= 1e-9;
  if (!exactMatch) {
    throw new Error(`Fixed-purchase bound diagnostic mismatch: explained ${explainedUpperBound}, adapter ${adapterUpperBound}.`);
  }

  return {
    schemaVersion: 1,
    model: 'fixed-purchase-upper-bound-explain-v0.1',
    exactMatch,
    adapterUpperBound,
    explainedUpperBound,
    state: {
      floor: materialized.floor + 1,
      cores: materialized.cores,
      shopPurchases,
      stats: { ...stats },
      cards: { ...materialized.cards },
      relics: { ...materialized.relics }
    },
    relaxation: {
      finalBossId: FINAL_BOSS_ID,
      flatHpGain: remainder.flatHpGain,
      flatAtkGain: remainder.flatAtkGain,
      flatDefGain: remainder.flatDefGain,
      freeItemGold: remainder.freeGold,
      remainingEnemyCount: remainder.remainingEnemyIds.length,
      remainingEnemyGold: enemyGold,
      remainingItemCount: remainder.remainingItems.length,
      luckyMultiplier,
      holyMultiplier,
      wardAvailable,
      optimisticBaseHp,
      optimisticBaseAtk,
      optimisticBaseDef,
      optimisticGold,
      additionalPurchases,
      maxHarvestAtk,
      maxHarvestDef
    },
    best,
    scenarios
  };
}
