import { ENEMIES, FLOORS, ITEMS, getShopCost } from '../game/data.js';
import { calculateBattle, createInitialState, parseToken } from '../game/engine.js';
import { createTowerAdapter } from './tower-adapter.js';
import { createTowerStateCodec } from './tower-codec.js';

const BOUND_CODEC = createTowerStateCodec({
  baseState: createInitialState(),
  floors: FLOORS,
  enemies: ENEMIES
});

const FINAL_BOSS_ENTRY = Object.entries(ENEMIES).find(([, enemy]) => enemy.finalBoss);
if (!FINAL_BOSS_ENTRY) throw new Error('Tower bounds require a finalBoss enemy.');
const [, FINAL_BOSS] = FINAL_BOSS_ENTRY;

const TOKEN_CONTRIBUTIONS = Array.from({ length: BOUND_CODEC.tokenVocabularySize }, (_, code) => {
  const token = BOUND_CODEC.tokenForCode(code);
  const parsed = parseToken(token);
  if (parsed.type === 'item') {
    const item = ITEMS[parsed.id];
    return {
      hpGain: Math.max(0, item?.hp ?? 0),
      atkGain: Math.max(0, item?.atk ?? 0),
      gold: 0,
      lucky: item?.relicKey === 'lucky',
      holy: item?.relicKey === 'holy',
      ward: item?.relicKey === 'ward'
    };
  }
  if (parsed.type === 'enemy') {
    const enemy = ENEMIES[parsed.id];
    return {
      hpGain: Math.max(0, enemy?.reward?.hp ?? 0),
      atkGain: Math.max(0, enemy?.reward?.atk ?? 0),
      gold: Math.max(0, enemy?.gold ?? 0),
      lucky: false,
      holy: false,
      ward: false
    };
  }
  return { hpGain: 0, atkGain: 0, gold: 0, lucky: false, holy: false, ward: false };
});

function scanCompactRemainder(baseAdapter, state) {
  const compact = Array.isArray(state.eventStates) ? state : baseAdapter.compactState(state);
  let flatHpGain = 0;
  let flatAtkGain = 0;
  let baseEnemyGold = 0;
  let luckyStillAvailable = false;
  let holyStillAvailable = false;
  let wardStillAvailable = false;

  for (const code of compact.eventStates) {
    const contribution = TOKEN_CONTRIBUTIONS[code];
    if (!contribution) throw new Error(`Missing optimistic contribution for event token code ${code}.`);
    flatHpGain += contribution.hpGain;
    flatAtkGain += contribution.atkGain;
    baseEnemyGold += contribution.gold;
    luckyStillAvailable ||= contribution.lucky;
    holyStillAvailable ||= contribution.holy;
    wardStillAvailable ||= contribution.ward;
  }

  return {
    compact,
    flatHpGain,
    flatAtkGain,
    baseEnemyGold,
    luckyStillAvailable,
    holyStillAvailable,
    wardStillAvailable
  };
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
 * Lower bound on the raw damage that the mandatory final form must still deal.
 *
 * The bound intentionally gives the hero impossible advantages: effectively
 * infinite DEF, every remaining ATK gain, optional Ward, and any chosen future
 * shop ATK purchases. The final boss is magic, so DEF cannot erase its damage;
 * only raising ATK can shorten the number of counterattacks. Any real route
 * therefore loses at least this much HP to the final form.
 */
function finalBossDamageLowerBound(atk, wardAvailable) {
  const battle = calculateBattle(
    { hp: Number.MAX_SAFE_INTEGER, atk, def: Number.MAX_SAFE_INTEGER },
    FINAL_BOSS,
    { ward: wardAvailable }
  );
  return Number.isFinite(battle.totalDamage) ? battle.totalDamage : Number.POSITIVE_INFINITY;
}

/**
 * Safe optimistic terminal-HP bound.
 *
 * Deliberately assumes an impossible best case:
 * - every non-final remaining enemy deals zero damage;
 * - every remaining HP/ATK item and boss reward is collected;
 * - every remaining enemy can be farmed for gold;
 * - Lucky, when still obtainable, is acquired before every remaining enemy;
 * - every affordable future shop purchase can be allocated optimally between
 *   HP (+900) and ATK (+5); DEF is granted for free by the relaxation;
 * - when Holy is still obtainable, every future HP gain happens before Holy
 *   and is therefore doubled;
 * - Ward, when still obtainable, is active for the mandatory final form.
 *
 * Unlike the earlier zero-damage bound, this version subtracts the unavoidable
 * final-form magic damage and explicitly optimizes the HP-vs-ATK shop tradeoff.
 * All other assumptions remain optimistic, so the result can only overestimate
 * achievable terminal HP and is safe for branch-and-bound pruning.
 */
export function optimisticTerminalHpUpperBound(baseAdapter, state) {
  const remainder = scanCompactRemainder(baseAdapter, state);
  const compact = remainder.compact;
  if (compact.victory) return compact.stats.hp;

  const luckyMultiplier = compact.relics.lucky || remainder.luckyStillAvailable ? 2 : 1;
  const optimisticGold = compact.stats.gold + remainder.baseEnemyGold * luckyMultiplier;
  const additionalPurchases = optimisticAdditionalPurchases(compact, optimisticGold);
  const holyMultiplier = !compact.relics.holy && remainder.holyStillAvailable ? 2 : 1;
  const wardAvailable = compact.relics.ward || remainder.wardStillAvailable;
  const optimisticBaseAtk = compact.stats.atk + remainder.flatAtkGain;
  const optimisticBaseHp = compact.stats.hp + remainder.flatHpGain;

  let upper = Number.NEGATIVE_INFINITY;
  for (let atkPurchases = 0; atkPurchases <= additionalPurchases; atkPurchases += 1) {
    const hpPurchases = additionalPurchases - atkPurchases;
    const atk = optimisticBaseAtk + atkPurchases * 5;
    const finalDamage = finalBossDamageLowerBound(atk, wardAvailable);
    if (!Number.isFinite(finalDamage)) continue;

    const hpBeforeFinal = (optimisticBaseHp + hpPurchases * 900) * holyMultiplier;
    upper = Math.max(upper, hpBeforeFinal - finalDamage);
  }

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
