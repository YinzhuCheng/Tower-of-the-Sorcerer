import { ENEMIES, SHOP_OPTIONS } from '../game/data.js';
import { calculateBattle } from '../game/engine.js';

const DEFAULT_BOSS_ID = 'astralBoss';
const SHOP_EFFECTS = Object.freeze(Object.fromEntries(
  SHOP_OPTIONS.map((option) => [option.id, Object.freeze({ ...option.effect })])
));

function shopCostAt(purchaseIndex) {
  return 45 + 25 * purchaseIndex;
}

function maxAffordablePurchases(gold, purchaseIndex) {
  let remaining = Math.max(0, Number(gold) || 0);
  let index = Math.max(0, Number(purchaseIndex) || 0);
  let count = 0;
  let spent = 0;
  // Defensive cap only protects diagnostics from malformed future data. Current
  // Tower gold/shop values are far below this bound.
  while (count < 64) {
    const cost = shopCostAt(index);
    if (remaining < cost) break;
    remaining -= cost;
    spent += cost;
    count += 1;
    index += 1;
  }
  return { count, spent, remaining };
}

function statsAfterAllocation(base, { atk = 0, def = 0, hp = 0 } = {}) {
  const atkEffect = SHOP_EFFECTS.atk?.atk ?? 0;
  const defEffect = SHOP_EFFECTS.def?.def ?? 0;
  const hpEffect = SHOP_EFFECTS.hp?.hp ?? 0;
  const maxHpEffect = SHOP_EFFECTS.hp?.maxHp ?? 0;
  return {
    hp: base.hp + hp * hpEffect,
    maxHp: base.maxHp + hp * maxHpEffect,
    atk: base.atk + atk * atkEffect,
    def: base.def + def * defEffect,
    gold: base.gold
  };
}

/**
 * Cheap scheduling-only relaxation for a replay-verified F6/core5 seed.
 *
 * The relaxation assumes all currently affordable shop purchases can be made
 * before astralBoss and enumerates their ATK/DEF/HP allocation. That assumption
 * is intentionally optimistic and is NOT a feasibility proof. The resulting
 * score may only change seed attempt order; it may never delete a seed or
 * participate in an exact-infeasibility claim.
 */
export function scorePreHolyBoundarySeed(seed, { bossId = DEFAULT_BOSS_ID } = {}) {
  const boss = ENEMIES[bossId];
  if (!boss) throw new Error(`Unknown delayed-Holy scheduling boss: ${bossId}`);
  if (!seed?.verified || !seed?.state || !seed?.resources) {
    return {
      schedulable: false,
      reason: 'seed_not_replay_verified',
      optimisticBossMargin: Number.NEGATIVE_INFINITY,
      optimisticWinnable: false
    };
  }

  const resources = seed.resources;
  const purchaseIndex = seed.state.shopPurchases ?? 0;
  const affordable = maxAffordablePurchases(resources.gold, purchaseIndex);
  let best = null;

  for (let total = 0; total <= affordable.count; total += 1) {
    for (let atk = 0; atk <= total; atk += 1) {
      for (let def = 0; def <= total - atk; def += 1) {
        const hp = total - atk - def;
        const stats = statsAfterAllocation(resources, { atk, def, hp });
        const battle = calculateBattle(stats, boss, seed.state.relics ?? {});
        const margin = Number.isFinite(battle.totalDamage)
          ? stats.hp - battle.totalDamage - 1
          : Number.NEGATIVE_INFINITY;
        const candidate = {
          totalPurchases: total,
          allocation: { atk, def, hp },
          stats: { hp: stats.hp, maxHp: stats.maxHp, atk: stats.atk, def: stats.def },
          battle: {
            winnable: battle.winnable,
            heroDamage: battle.heroDamage,
            enemyDamage: battle.enemyDamage,
            rounds: battle.rounds,
            counterAttacks: battle.counterAttacks,
            totalDamage: battle.totalDamage
          },
          margin
        };
        if (!best
          || candidate.margin > best.margin
          || (candidate.margin === best.margin && candidate.totalPurchases < best.totalPurchases)) {
          best = candidate;
        }
      }
    }
  }

  const currentBattle = calculateBattle(resources, boss, seed.state.relics ?? {});
  return {
    schedulable: true,
    reason: null,
    bossId,
    purchaseIndex,
    maxAffordablePurchases: affordable.count,
    maxAffordableSpend: affordable.spent,
    current: {
      atkBreak: resources.atk - boss.def,
      defGap: boss.atk - resources.def,
      hp: resources.hp,
      atk: resources.atk,
      def: resources.def,
      gold: resources.gold,
      battleDamage: currentBattle.totalDamage,
      winnable: currentBattle.winnable
    },
    optimisticBossMargin: best?.margin ?? Number.NEGATIVE_INFINITY,
    optimisticWinnable: Boolean(best?.battle?.winnable),
    optimistic: best,
    certificateHash: seed.certificate?.certificateHash ?? null
  };
}

function candidateKey(candidate) {
  return candidate.seed.certificate?.certificateHash
    ?? candidate.seed.structuralKey
    ?? JSON.stringify(candidate.seed.resources);
}

function diversitySignature(candidate) {
  const r = candidate.seed.resources ?? {};
  const p = candidate.seed.state?.shopPurchases ?? 0;
  return [r.atk, r.def, p, r.moon, r.star].join('|');
}

function compareCandidates(a, b) {
  const am = a.metrics.optimisticBossMargin;
  const bm = b.metrics.optimisticBossMargin;
  if (am !== bm) return bm - am;
  if (a.metrics.maxAffordablePurchases !== b.metrics.maxAffordablePurchases) {
    return b.metrics.maxAffordablePurchases - a.metrics.maxAffordablePurchases;
  }
  const ar = a.seed.resources;
  const br = b.seed.resources;
  return br.atk - ar.atk
    || br.def - ar.def
    || br.gold - ar.gold
    || br.hp - ar.hp
    || String(candidateKey(a)).localeCompare(String(candidateKey(b)));
}

function bestBy(candidates, selector, direction = 1) {
  let best = null;
  let bestValue = null;
  for (const candidate of candidates) {
    const value = selector(candidate);
    if (!Number.isFinite(value)) continue;
    if (best == null || direction * value > direction * bestValue) {
      best = candidate;
      bestValue = value;
    }
  }
  return best;
}

/**
 * Schedules a bounded subset of verified boundary seeds for existence hunting.
 *
 * This function is deliberately a scheduler, not a reducer. `candidateCount`
 * reports every verified seed supplied to it, and callers must retain the full
 * frontier when reasoning about exact infeasibility.
 */
export function schedulePreHolyBoundarySeeds(seeds, {
  limit = 12,
  bossId = DEFAULT_BOSS_ID
} = {}) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error('Seed schedule limit must be a positive integer.');
  const candidates = (seeds ?? [])
    .filter((seed) => seed?.verified && seed?.state)
    .map((seed) => ({ seed, metrics: scorePreHolyBoundarySeed(seed, { bossId }) }))
    .filter((candidate) => candidate.metrics.schedulable)
    .sort(compareCandidates);

  const selected = [];
  const selectedKeys = new Set();
  function add(candidate, reason) {
    if (!candidate || selected.length >= limit) return;
    const key = candidateKey(candidate);
    if (selectedKeys.has(key)) return;
    selectedKeys.add(key);
    selected.push({ ...candidate, selectionReason: reason });
  }

  // First reserve a few orthogonal resource extremes. This prevents the
  // affordability score from collapsing the schedule onto one near-duplicate
  // resource family while keeping all choices heuristic-only.
  add(bestBy(candidates, (c) => c.metrics.optimisticBossMargin), 'best_optimistic_boss_margin');
  add(bestBy(candidates, (c) => c.seed.resources.atk), 'max_atk');
  add(bestBy(candidates, (c) => c.seed.resources.def), 'max_def');
  add(bestBy(candidates, (c) => c.seed.resources.hp), 'max_hp');
  add(bestBy(candidates, (c) => c.seed.resources.gold), 'max_gold');
  add(bestBy(candidates, (c) => c.seed.state.shopPurchases ?? 0, -1), 'min_shop_purchase_index');
  add(bestBy(candidates, (c) => c.seed.resources.star), 'max_star_cards');
  add(bestBy(candidates, (c) => c.seed.resources.moon), 'max_moon_cards');

  // Then take the best affordability candidate from each coarse resource class.
  const seenSignatures = new Set();
  for (const candidate of candidates) {
    if (selected.length >= limit) break;
    const signature = diversitySignature(candidate);
    if (seenSignatures.has(signature)) continue;
    seenSignatures.add(signature);
    add(candidate, 'diverse_affordability_rank');
  }

  // Finally fill any remaining slots by pure affordability rank.
  for (const candidate of candidates) {
    if (selected.length >= limit) break;
    add(candidate, 'affordability_rank');
  }

  return {
    scheduler: 'astral-boss-affordability-v1',
    bossId,
    candidateCount: candidates.length,
    scheduledCount: selected.length,
    scheduled: selected.map((entry) => entry.seed),
    diagnostics: selected.map((entry) => ({
      selectionReason: entry.selectionReason,
      certificateHash: entry.metrics.certificateHash,
      resources: { ...entry.seed.resources },
      shopPurchases: entry.seed.state.shopPurchases ?? 0,
      optimisticBossMargin: entry.metrics.optimisticBossMargin,
      optimisticWinnable: entry.metrics.optimisticWinnable,
      maxAffordablePurchases: entry.metrics.maxAffordablePurchases,
      optimisticAllocation: entry.metrics.optimistic?.allocation ?? null,
      optimisticBattle: entry.metrics.optimistic?.battle ?? null
    }))
  };
}
