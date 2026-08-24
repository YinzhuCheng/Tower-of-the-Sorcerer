import { ENEMIES, ITEMS, getShopCost } from '../game/data.js';
import { parseToken } from '../game/engine.js';
import { createTowerAdapter } from './tower-adapter.js';

function scanOptimisticRemainder(engineState) {
  let flatHpGain = 0;
  let baseEnemyGold = 0;
  let luckyStillAvailable = false;
  let holyStillAvailable = false;

  for (const floorState of engineState.floorStates) {
    for (const row of floorState.map) {
      for (const token of row) {
        const parsed = parseToken(token);
        if (parsed.type === 'item') {
          const item = ITEMS[parsed.id];
          if (!item) continue;
          if (item.hp > 0) flatHpGain += item.hp;
          if (item.relicKey === 'lucky') luckyStillAvailable = true;
          if (item.relicKey === 'holy') holyStillAvailable = true;
          continue;
        }
        if (parsed.type !== 'enemy') continue;
        const enemy = ENEMIES[parsed.id];
        if (!enemy) continue;
        baseEnemyGold += Math.max(0, enemy.gold ?? 0);
        if (enemy.reward?.hp > 0) flatHpGain += enemy.reward.hp;
      }
    }
  }

  return { flatHpGain, baseEnemyGold, luckyStillAvailable, holyStillAvailable };
}

function optimisticAdditionalPurchases(state, optimisticFutureGold) {
  let gold = Math.max(0, optimisticFutureGold);
  let purchases = 0;
  let shopPurchases = state.shopPurchases;
  // The current game cannot approach this limit; it is only a guard against
  // malformed future content making a proof helper loop forever.
  while (purchases < 10_000) {
    const cost = getShopCost({ shopPurchases });
    if (gold < cost) break;
    gold -= cost;
    shopPurchases += 1;
    purchases += 1;
  }
  return purchases;
}

function bitMask(values, predicate) {
  let mask = 0;
  for (let index = 0; index < values.length; index += 1) {
    if (predicate(values[index])) mask += 2 ** index;
  }
  return mask;
}

/**
 * Exact compact encoding of the same K dimensions used by tower-adapter.js.
 * This is not a hash: every event-state code and every mechanism bit remains
 * present, so frontier equality does not depend on probabilistic collision.
 */
function compactStructuralKey(baseAdapter, state) {
  const compact = Array.isArray(state.eventStates) ? state : baseAdapter.compactState(state);
  const relicKeys = Object.keys(compact.relics).sort();
  const relicMask = bitMask(relicKeys, (key) => compact.relics[key]);
  const visitedMask = bitMask(
    compact.floorMeta.map((_, index) => index),
    (index) => compact.visitedFloors.includes(index)
  );
  const events = compact.eventStates.map((code) => Number(code).toString(36)).join('.');
  const floorMeta = compact.floorMeta.map((meta) => {
    const switches = [...meta.switches].sort().join(',');
    return `${switches}/${meta.sequenceProgress}/${meta.bossDefeated ? 1 : 0}`;
  }).join('|');

  return [
    compact.floor.toString(36),
    compact.componentAnchor.toString(36),
    events,
    floorMeta,
    relicMask.toString(36),
    compact.shopPurchases.toString(36),
    visitedMask.toString(36),
    compact.victory ? '1' : '0'
  ].join(';');
}

/**
 * Safe optimistic terminal-HP bound.
 *
 * Deliberately assumes an impossible best case:
 * - every remaining enemy deals zero damage;
 * - every remaining HP item / boss HP reward is collected;
 * - every remaining enemy can be farmed for gold;
 * - Lucky, when still obtainable, is acquired before every remaining enemy;
 * - all affordable future shop purchases are HP purchases;
 * - when Holy is still obtainable, every future HP gain happens before Holy
 *   and is therefore doubled.
 *
 * These relaxations can only overestimate achievable terminal HP, making the
 * result safe for branch-and-bound pruning.
 */
export function optimisticTerminalHpUpperBound(baseAdapter, compactState) {
  const engineState = baseAdapter.materializeState(compactState);
  if (engineState.victory) return engineState.stats.hp;

  const remainder = scanOptimisticRemainder(engineState);
  const luckyMultiplier = engineState.relics.lucky || remainder.luckyStillAvailable ? 2 : 1;
  const optimisticGold = engineState.stats.gold + remainder.baseEnemyGold * luckyMultiplier;
  const additionalPurchases = optimisticAdditionalPurchases(engineState, optimisticGold);
  const shopHpGain = additionalPurchases * 900;

  let upper = engineState.stats.hp + remainder.flatHpGain + shopHpGain;
  if (!engineState.relics.holy && remainder.holyStillAvailable) upper *= 2;
  return upper;
}

export function createBoundedTowerAdapter() {
  const base = createTowerAdapter();
  return {
    ...base,
    // The optimizing frontier uses an exact compact K encoding. Certificates
    // from the base adapter keep the more verbose structural representation.
    structuralKey: (state) => compactStructuralKey(base, state),
    // Victory is an absorbing state in engine.js. Do not run the automatic
    // item/switch closure after the final boss has set victory=true.
    normalize: (state) => base.isGoal(state)
      ? { state: base.cloneState(state), steps: [] }
      : base.normalize(state),
    objectiveUpperBound: (state) => optimisticTerminalHpUpperBound(base, state)
  };
}
