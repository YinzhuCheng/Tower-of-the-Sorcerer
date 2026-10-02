/**
 * Player magic is deliberately modelled as a battle choice, not as a new
 * permanent combat stat.  That distinction keeps the map/critical-content
 * pass independent from the later numeric pass and gives the solver a small,
 * well-defined action frontier.
 */
export const MAGIC_TIER_STEP = 10;

function finiteWhole(value, fallback = 0) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;
}

export function createDormantMagicState() {
  return { unlocked: false, mp: 0, maxMp: 0, tier: 0 };
}

export function getMagicTierCapacity(magic = {}) {
  if (!magic?.unlocked) return 0;
  return Math.floor(finiteWhole(magic.maxMp) / MAGIC_TIER_STEP);
}

export function getMagicTierCost(tier = 0) {
  return finiteWhole(tier) * MAGIC_TIER_STEP;
}

export function normalizeMagicState(magic = {}) {
  if (!magic?.unlocked) return createDormantMagicState();
  const maxMp = finiteWhole(magic.maxMp);
  const mp = Math.min(maxMp, finiteWhole(magic.mp));
  const tier = Math.min(getMagicTierCapacity({ unlocked: true, maxMp }), finiteWhole(magic.tier));
  return { unlocked: true, mp, maxMp, tier };
}

export function canAffordMagicTier(magic, tier = magic?.tier ?? 0) {
  if (!magic?.unlocked) return finiteWhole(tier) === 0;
  const normalized = normalizeMagicState(magic);
  const requested = finiteWhole(tier);
  return requested <= getMagicTierCapacity(normalized)
    && getMagicTierCost(requested) <= normalized.mp;
}

/**
 * The selected tier may be retained even after MP has been spent; this lets a
 * player see exactly why the next encounter is unavailable and lower it in a
 * free-action menu.  Battle resolution therefore checks affordability rather
 * than silently changing a selection.
 */
export function setMagicTier(state, tier) {
  if (!state?.magic?.unlocked) return { ok: false, reason: '魔力尚未苏醒。' };
  const normalized = normalizeMagicState(state.magic);
  const nextTier = finiteWhole(tier);
  const capacity = getMagicTierCapacity(normalized);
  if (nextTier > capacity) {
    return { ok: false, reason: `魔力附刃最高只能设为 ${capacity} 档。`, capacity };
  }
  state.magic = { ...normalized, tier: nextTier };
  return {
    ok: true,
    tier: nextTier,
    cost: getMagicTierCost(nextTier),
    affordable: canAffordMagicTier(state.magic, nextTier),
    capacity
  };
}

export function awakenMagic(state, { maxMp = 100, restore = true } = {}) {
  const previous = normalizeMagicState(state?.magic);
  const nextMaxMp = Math.max(previous.maxMp, finiteWhole(maxMp));
  state.magic = {
    unlocked: true,
    maxMp: nextMaxMp,
    mp: restore ? nextMaxMp : previous.mp,
    tier: 0
  };
  return state.magic;
}

export function applyMagicEffect(state, effect = {}) {
  if (!state) return { mpGained: 0, maxMpGained: 0 };
  const previous = normalizeMagicState(state.magic);
  const maxMpGained = finiteWhole(effect.maxMp);
  const mpGained = finiteWhole(effect.mp);
  if (maxMpGained === 0 && mpGained === 0) return { mpGained: 0, maxMpGained: 0 };

  const maxMp = previous.maxMp + maxMpGained;
  const mp = Math.min(maxMp, previous.mp + mpGained);
  state.magic = {
    ...previous,
    maxMp,
    mp,
    tier: Math.min(previous.tier, Math.floor(maxMp / MAGIC_TIER_STEP))
  };
  return { mpGained: mp - previous.mp, maxMpGained };
}

export function describeMagicTier(magic = {}) {
  const normalized = normalizeMagicState(magic);
  const tier = normalized.tier;
  return {
    ...normalized,
    capacity: getMagicTierCapacity(normalized),
    cost: getMagicTierCost(tier),
    bonusPerHit: getMagicTierCost(tier),
    affordable: canAffordMagicTier(normalized, tier)
  };
}
