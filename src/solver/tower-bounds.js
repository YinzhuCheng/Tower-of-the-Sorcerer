import { ENEMIES, FLOORS, ITEMS, getShopCost } from '../game/data.js';
import { createInitialState, parseToken } from '../game/engine.js';
import { createTowerAdapter } from './tower-adapter.js';
import { createTowerStateCodec } from './tower-codec.js';

const BOUND_CODEC = createTowerStateCodec({
  baseState: createInitialState(),
  floors: FLOORS,
  enemies: ENEMIES
});

const TOKEN_CONTRIBUTIONS = Array.from({ length: BOUND_CODEC.tokenVocabularySize }, (_, code) => {
  const token = BOUND_CODEC.tokenForCode(code);
  const parsed = parseToken(token);
  if (parsed.type === 'item') {
    const item = ITEMS[parsed.id];
    return {
      hpGain: Math.max(0, item?.hp ?? 0),
      gold: 0,
      lucky: item?.relicKey === 'lucky',
      holy: item?.relicKey === 'holy'
    };
  }
  if (parsed.type === 'enemy') {
    const enemy = ENEMIES[parsed.id];
    return {
      hpGain: Math.max(0, enemy?.reward?.hp ?? 0),
      gold: Math.max(0, enemy?.gold ?? 0),
      lucky: false,
      holy: false
    };
  }
  return { hpGain: 0, gold: 0, lucky: false, holy: false };
});

function scanCompactRemainder(baseAdapter, state) {
  const compact = Array.isArray(state.eventStates) ? state : baseAdapter.compactState(state);
  let flatHpGain = 0;
  let baseEnemyGold = 0;
  let luckyStillAvailable = false;
  let holyStillAvailable = false;

  for (const code of compact.eventStates) {
    const contribution = TOKEN_CONTRIBUTIONS[code];
    if (!contribution) throw new Error(`Missing optimistic contribution for event token code ${code}.`);
    flatHpGain += contribution.hpGain;
    baseEnemyGold += contribution.gold;
    luckyStillAvailable ||= contribution.lucky;
    holyStillAvailable ||= contribution.holy;
  }

  return { compact, flatHpGain, baseEnemyGold, luckyStillAvailable, holyStillAvailable };
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
function compactFrontierKey(baseAdapter, state) {
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
export function optimisticTerminalHpUpperBound(baseAdapter, state) {
  const remainder = scanCompactRemainder(baseAdapter, state);
  const compact = remainder.compact;
  if (compact.victory) return compact.stats.hp;

  const luckyMultiplier = compact.relics.lucky || remainder.luckyStillAvailable ? 2 : 1;
  const optimisticGold = compact.stats.gold + remainder.baseEnemyGold * luckyMultiplier;
  const additionalPurchases = optimisticAdditionalPurchases(compact, optimisticGold);
  const shopHpGain = additionalPurchases * 900;

  let upper = compact.stats.hp + remainder.flatHpGain + shopHpGain;
  if (!compact.relics.holy && remainder.holyStillAvailable) upper *= 2;
  return upper;
}

export function createBoundedTowerAdapter() {
  const base = createTowerAdapter();
  return {
    ...base,
    // Frontier identity is exact but compact; structuralKey remains the
    // verbose audit representation used by certificate hashes and replay.
    frontierKey: (state) => compactFrontierKey(base, state),
    // Victory is an absorbing state in engine.js. Do not run the automatic
    // item/switch closure after the final boss has set victory=true.
    normalize: (state) => base.isGoal(state)
      ? { state: base.cloneState(state), steps: [] }
      : base.normalize(state),
    // This upper bound reads only the numeric event vector. It never clones or
    // scans the eight materialized maps during search.
    objectiveUpperBound: (state) => optimisticTerminalHpUpperBound(base, state)
  };
}
