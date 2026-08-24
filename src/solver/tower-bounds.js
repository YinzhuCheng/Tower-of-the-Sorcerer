import { ENEMIES, FLOORS, ITEMS, getShopCost } from '../game/data.js';
import { calculateBattle, createInitialState, parseToken } from '../game/engine.js';
import { createTowerAdapter } from './tower-adapter.js';
import { createTowerStateCodec } from './tower-codec.js';
import { verifyGreedyIncumbentWitness } from './tower-incumbent.js';
import { stableStringify } from './state.js';

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

function finalBossDamageLowerBound(atk, wardAvailable) {
  const battle = calculateBattle(
    { hp: Number.MAX_SAFE_INTEGER, atk, def: Number.MAX_SAFE_INTEGER },
    FINAL_BOSS,
    { ward: wardAvailable }
  );
  return Number.isFinite(battle.totalDamage) ? battle.totalDamage : Number.POSITIVE_INFINITY;
}

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

/**
 * Canonicalize free inter-floor travel once the compass exists.
 *
 * After the boss-stair lock, every visited upper floor proves that the lower
 * floor's boss was defeated and that at least one D→U route was permanently
 * opened. Doors/enemies never re-close. Therefore any upward teleport can be
 * replaced by repeated U traversal at zero resource cost, while any D traversal
 * can be replaced by a direct downward teleport. Keeping only downward
 * teleports removes travel cycles without making legal actions depend on path
 * history, so Pareto labels remain history-free.
 */
export function canonicalizeCompassTravel(state, actions) {
  if (!state.relics?.compass) return actions;
  return actions.filter((action) => {
    if (action.kind === 'teleport') return action.targetFloor < state.floor;
    if (action.kind === 'tile' && action.token === 'D') return false;
    return true;
  });
}

function verifyTowerIncumbent(baseAdapter, witness, { initialState = null } = {}) {
  const canonicalInitial = baseAdapter.createInitialState();
  const candidateInitial = initialState ?? canonicalInitial;
  if (stableStringify(candidateInitial) !== stableStringify(canonicalInitial)) {
    return {
      ok: false,
      reason: 'Greedy Tower incumbent witnesses are only valid from the canonical initial state.'
    };
  }
  return verifyGreedyIncumbentWitness(witness);
}

export function createBoundedTowerAdapter() {
  const base = createTowerAdapter();
  const upperBoundCache = new WeakMap();
  const upperBound = (state) => {
    if (state && typeof state === 'object' && upperBoundCache.has(state)) {
      return upperBoundCache.get(state);
    }
    const value = optimisticTerminalHpUpperBound(base, state);
    if (state && typeof state === 'object') upperBoundCache.set(state, value);
    return value;
  };

  return {
    ...base,
    frontierKey: (state) => compactFrontierKey(base, state),
    normalize: (state) => base.isGoal(state)
      ? { state: base.cloneState(state), steps: [] }
      : base.normalize(state),
    enumerateActions: (state) => canonicalizeCompassTravel(state, base.enumerateActions(state)),
    objectiveUpperBound: upperBound,
    verifyIncumbent: (witness, context) => verifyTowerIncumbent(base, witness, context),
    rulesVersion: () => `${base.rulesVersion()}+boss-stair-lock-v1+canonical-travel-v1`
  };
}
