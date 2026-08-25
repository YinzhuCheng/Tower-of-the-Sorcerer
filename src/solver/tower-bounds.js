import { ENEMIES, FLOORS, ITEMS, SHOP_OPTIONS, getShopCost } from '../game/data.js';
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

// Cache token identity only. Numeric contribution values MUST be read from the
// current canonical data objects at evaluation time because balance overlays
// mutate those same identities during candidate analysis.
const TOKEN_DESCRIPTORS = Array.from({ length: BOUND_CODEC.tokenVocabularySize }, (_, code) => {
  const token = BOUND_CODEC.tokenForCode(code);
  return { token, parsed: parseToken(token) };
});

function optimisticContributionForCode(code) {
  const descriptor = TOKEN_DESCRIPTORS[code];
  if (!descriptor) throw new Error(`Missing optimistic descriptor for event token code ${code}.`);
  const { parsed } = descriptor;
  if (parsed.type === 'item') {
    const item = ITEMS[parsed.id];
    return {
      hpGain: Math.max(0, item?.hp ?? 0),
      atkGain: Math.max(0, item?.atk ?? 0),
      defGain: Math.max(0, item?.def ?? 0),
      freeGold: Math.max(0, item?.gold ?? 0),
      lucky: item?.relicKey === 'lucky',
      holy: item?.relicKey === 'holy',
      ward: item?.relicKey === 'ward',
      enemyId: null
    };
  }
  if (parsed.type === 'enemy') {
    const enemy = ENEMIES[parsed.id];
    return {
      // Reward stats remain completely free in the relaxation even if the enemy
      // is not selected for gold harvesting. That is intentionally optimistic.
      hpGain: Math.max(0, enemy?.reward?.hp ?? 0),
      atkGain: Math.max(0, enemy?.reward?.atk ?? 0),
      defGain: Math.max(0, enemy?.reward?.def ?? 0),
      freeGold: 0,
      lucky: false,
      holy: false,
      ward: false,
      enemyId: parsed.id
    };
  }
  return {
    hpGain: 0,
    atkGain: 0,
    defGain: 0,
    freeGold: 0,
    lucky: false,
    holy: false,
    ward: false,
    enemyId: null
  };
}

function shopOption(id) {
  return SHOP_OPTIONS.find((option) => option.id === id) ?? null;
}

function currentShopGains() {
  return {
    atk: Math.max(0, shopOption('atk')?.effect?.atk ?? 0),
    hp: Math.max(0, shopOption('hp')?.effect?.hp ?? 0)
  };
}

function scanCompactRemainder(baseAdapter, state) {
  const compact = Array.isArray(state.eventStates) ? state : baseAdapter.compactState(state);
  let flatHpGain = 0;
  let flatAtkGain = 0;
  let flatDefGain = 0;
  let freeGold = 0;
  let luckyStillAvailable = false;
  let holyStillAvailable = false;
  let wardStillAvailable = false;
  const remainingEnemyIds = [];

  for (const code of compact.eventStates) {
    const contribution = optimisticContributionForCode(code);
    flatHpGain += contribution.hpGain;
    flatAtkGain += contribution.atkGain;
    flatDefGain += contribution.defGain;
    freeGold += contribution.freeGold;
    luckyStillAvailable ||= contribution.lucky;
    holyStillAvailable ||= contribution.holy;
    wardStillAvailable ||= contribution.ward;
    if (contribution.enemyId) remainingEnemyIds.push(contribution.enemyId);
  }

  return {
    compact,
    flatHpGain,
    flatAtkGain,
    flatDefGain,
    freeGold,
    luckyStillAvailable,
    holyStillAvailable,
    wardStillAvailable,
    remainingEnemyIds
  };
}

function enemyKillGold(enemy, luckyMultiplier) {
  return Math.max(0, enemy?.gold ?? 0) * luckyMultiplier
    + Math.max(0, enemy?.reward?.gold ?? 0);
}

function optimisticEnemyGold(remainder, luckyMultiplier) {
  return remainder.remainingEnemyIds.reduce((sum, enemyId) =>
    sum + enemyKillGold(ENEMIES[enemyId], luckyMultiplier), 0
  );
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

function futurePurchaseCost(state, count) {
  let total = 0;
  for (let offset = 0; offset < count; offset += 1) {
    total += getShopCost({ shopPurchases: state.shopPurchases + offset });
  }
  return total;
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

function optimisticBoundContext(baseAdapter, state) {
  const remainder = scanCompactRemainder(baseAdapter, state);
  const compact = remainder.compact;
  const luckyMultiplier = compact.relics.lucky || remainder.luckyStillAvailable ? 2 : 1;
  const enemyGold = optimisticEnemyGold(remainder, luckyMultiplier);
  const optimisticGold = compact.stats.gold + remainder.freeGold + enemyGold;
  const additionalPurchases = optimisticAdditionalPurchases(compact, optimisticGold);
  return {
    remainder,
    compact,
    luckyMultiplier,
    enemyGold,
    additionalPurchases,
    holyMultiplier: !compact.relics.holy && remainder.holyStillAvailable ? 2 : 1,
    wardAvailable: compact.relics.ward || remainder.wardStillAvailable,
    optimisticBaseAtk: compact.stats.atk + remainder.flatAtkGain,
    optimisticBaseDef: compact.stats.def + remainder.flatDefGain,
    optimisticBaseHp: compact.stats.hp + remainder.flatHpGain
  };
}

function fixedPurchaseGains(compact, count, purchaseOptionAt) {
  const gains = { atk: 0, def: 0, hp: 0 };
  for (let offset = 0; offset < count; offset += 1) {
    const purchaseIndex = compact.shopPurchases + offset;
    const optionId = purchaseOptionAt(purchaseIndex);
    const option = shopOption(optionId);
    if (!option) throw new Error(`Unknown fixed purchase option in upper bound: ${optionId}`);
    gains.atk += Math.max(0, option.effect?.atk ?? 0);
    gains.def += Math.max(0, option.effect?.def ?? 0);
    gains.hp += Math.max(0, option.effect?.hp ?? 0);
  }
  return gains;
}

function createFractionalCostCurve(entries) {
  const useful = entries
    .filter((entry) => Number.isFinite(entry.value) && entry.value > 0
      && Number.isFinite(entry.cost) && entry.cost >= 0)
    .sort((a, b) => (a.cost / a.value) - (b.cost / b.value)
      || b.value - a.value
      || a.cost - b.cost);
  const prefixValue = [0];
  const prefixCost = [0];
  for (const entry of useful) {
    prefixValue.push(prefixValue[prefixValue.length - 1] + entry.value);
    prefixCost.push(prefixCost[prefixCost.length - 1] + entry.cost);
  }

  return {
    totalValue: prefixValue[prefixValue.length - 1],
    minimumCost(requiredValue) {
      if (!(requiredValue > 0)) return 0;
      if (requiredValue > this.totalValue) return 0; // impossible request: stay optimistic rather than over-prune
      let low = 1;
      let high = useful.length;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (prefixValue[mid] >= requiredValue) high = mid;
        else low = mid + 1;
      }
      const index = low;
      const priorValue = prefixValue[index - 1];
      const priorCost = prefixCost[index - 1];
      const entry = useful[index - 1];
      const fraction = Math.max(0, Math.min(1, (requiredValue - priorValue) / entry.value));
      // The fractional relaxation can only be cheaper than an integral enemy
      // subset. Floor once more to avoid floating-point roundoff ever increasing
      // the damage lower bound by a fraction of one HP.
      return Math.max(0, Math.floor(priorCost + entry.cost * fraction + 1e-9));
    }
  };
}

/** Pure fractional-knapsack lower bound used by tests and diagnostics. */
export function fractionalMinimumCostForValue(entries, requiredValue) {
  return createFractionalCostCurve(entries).minimumCost(requiredValue);
}

function optimisticGoldHarvestCurve(context, maxFixedGains) {
  const atk = context.optimisticBaseAtk + maxFixedGains.atk;
  const def = context.optimisticBaseDef + maxFixedGains.def;
  const offers = context.remainder.remainingEnemyIds.map((enemyId) => {
    const enemy = ENEMIES[enemyId];
    const value = enemyKillGold(enemy, context.luckyMultiplier);
    const battle = calculateBattle(
      { hp: Number.MAX_SAFE_INTEGER, atk, def },
      enemy,
      { ward: context.wardAvailable }
    );
    // If even the globally optimistic stats cannot produce a finite fight, leave
    // the gold available at zero cost. This is looser than reality, never tighter.
    const cost = Number.isFinite(battle.totalDamage) ? Math.max(0, battle.totalDamage) : 0;
    return { value, cost };
  });
  return createFractionalCostCurve(offers);
}

/**
 * Admissible terminal-HP upper bound under the CURRENT canonical data objects.
 *
 * Balance overlays mutate ITEMS / ENEMIES / SHOP_OPTIONS in place. Reading every
 * numeric contribution dynamically is therefore a soundness requirement, not a
 * micro-optimization: a stale lower shop/item/gold value could underestimate the
 * reachable objective and make branch-and-bound prune the true optimum.
 *
 * The generic bound deliberately relaxes future shop choice: every affordable
 * purchase may be allocated to ATK or HP in whichever split maximizes terminal
 * HP. This is correct for the unrestricted Tower problem but unnecessarily loose
 * for a fixed-purchase-policy sub-problem.
 */
export function optimisticTerminalHpUpperBound(baseAdapter, state) {
  const context = optimisticBoundContext(baseAdapter, state);
  const { compact } = context;
  if (compact.victory) return compact.stats.hp;
  const shopGains = currentShopGains();

  let upper = Number.NEGATIVE_INFINITY;
  for (let atkPurchases = 0; atkPurchases <= context.additionalPurchases; atkPurchases += 1) {
    const hpPurchases = context.additionalPurchases - atkPurchases;
    const atk = context.optimisticBaseAtk + atkPurchases * shopGains.atk;
    const finalDamage = finalBossDamageLowerBound(atk, context.wardAvailable);
    if (!Number.isFinite(finalDamage)) continue;
    const hpBeforeFinal = (context.optimisticBaseHp + hpPurchases * shopGains.hp) * context.holyMultiplier;
    upper = Math.max(upper, hpBeforeFinal - finalDamage);
  }

  return upper;
}

/**
 * Tighter admissible bound for a fixed purchase-policy sub-problem.
 *
 * In addition to respecting the exact fixed purchase sequence, this bound no
 * longer treats enemy gold as completely free. For each possible number of
 * future purchases, it asks how much enemy gold is required after current/free
 * gold, then subtracts a fractional-knapsack lower bound on the combat damage
 * needed to harvest that much gold.
 *
 * The harvest damage remains aggressively optimistic:
 *
 * - every remaining stat/HP reward is granted for free even if its enemy is skipped;
 * - combat uses maximum possible future ATK/DEF from ALL affordable fixed buys;
 * - Ward is assumed available whenever it can still be collected;
 * - fractional enemies are allowed, making gold acquisition cheaper than any
 *   real integral subset;
 * - the harvest damage is applied after Holy while HP rewards/purchases may be
 *   credited before Holy.
 *
 * Therefore the deducted cost cannot exceed the damage a real route must pay to
 * fund the same purchase count. This tightens optional-resource exploitation
 * without changing the proof role of the value as an upper bound.
 */
export function optimisticFixedPurchaseTerminalHpUpperBound(baseAdapter, state, purchaseOptionAt) {
  if (typeof purchaseOptionAt !== 'function') {
    throw new Error('fixed-purchase upper bound requires purchaseOptionAt(index).');
  }
  const context = optimisticBoundContext(baseAdapter, state);
  const { compact } = context;
  if (compact.victory) return compact.stats.hp;

  const maxFixedGains = fixedPurchaseGains(compact, context.additionalPurchases, purchaseOptionAt);
  const harvestCurve = optimisticGoldHarvestCurve(context, maxFixedGains);
  const freeGoldBeforeKills = compact.stats.gold + context.remainder.freeGold;
  let upper = Number.NEGATIVE_INFINITY;

  for (let purchaseCount = 0; purchaseCount <= context.additionalPurchases; purchaseCount += 1) {
    const gains = fixedPurchaseGains(compact, purchaseCount, purchaseOptionAt);
    const requiredGold = Math.max(0, futurePurchaseCost(compact, purchaseCount) - freeGoldBeforeKills);
    const harvestDamage = harvestCurve.minimumCost(requiredGold);
    const atk = context.optimisticBaseAtk + gains.atk;
    const finalDamage = finalBossDamageLowerBound(atk, context.wardAvailable);
    if (!Number.isFinite(finalDamage)) continue;
    const hpBeforeFinal = (context.optimisticBaseHp + gains.hp) * context.holyMultiplier;
    upper = Math.max(upper, hpBeforeFinal - harvestDamage - finalDamage);
  }

  return upper;
}

/**
 * Canonicalize free inter-floor travel once the compass exists.
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
    rulesVersion: () => `${base.rulesVersion()}+boss-stair-lock-v1+canonical-travel-v1+overlay-aware-bound-v2-harvest`
  };
}
