/**
 * Optional ally bonds for the second act.
 *
 * Each bond is earned by reaching an existing optional relic route, never by
 * purchasing a hint or giving up an already-earned combat resource. The relic
 * still has its normal MP effect; the added story flag unlocks a deterministic
 * finale rule only if that ally also survives the council.
 */

export const ALLIANCE_BOND_ID = 'alliance-bonds-v1';

export const ALLIANCE_BONDS = Object.freeze([
  Object.freeze({
    allyId: 'milu',
    enemyId: 'catBoss',
    itemId: 'aetherPrism',
    title: '月镜复写',
    dialogue: 'bondMilu',
    route: 'F12 双谱宝库',
    activation: 'deployed',
    finale: Object.freeze({
      counterattackGuard: 1,
      label: '月镜誓护：每个终局阶段抵消 1 次反击'
    })
  }),
  Object.freeze({
    allyId: 'lanin',
    enemyId: 'whaleBoss',
    itemId: 'conduitCodex',
    title: '潮汐导管',
    dialogue: 'bondLanin',
    route: 'F13 星导管',
    activation: 'survive',
    finale: Object.freeze({
      magicCounterattackGuard: 1,
      label: '潮汐预唱：魔法终局阶段少结算 1 次反击'
    })
  }),
  Object.freeze({
    allyId: 'yanli',
    enemyId: 'dragonBoss',
    itemId: 'arcaneBattery',
    title: '赤焰蓄能',
    dialogue: 'bondYanli',
    route: 'F15 档案封卷',
    activation: 'survive',
    finale: Object.freeze({
      hpMultiplier: 0.94,
      label: '赤焰共振：终局敌人生命额外 -6%'
    })
  }),
  Object.freeze({
    allyId: 'yayu',
    enemyId: 'shadowBoss',
    itemId: 'mirrorReservoir',
    title: '影线校准',
    dialogue: 'bondYayu',
    route: 'F16 镜泉宝库',
    activation: 'survive',
    finale: Object.freeze({
      disableDoubleHit: true,
      label: '影线错位：起源核心失去二连击'
    })
  })
]);

const BOND_BY_ALLY = new Map(ALLIANCE_BONDS.map((bond) => [bond.allyId, bond]));
const BOND_BY_ITEM = new Map(ALLIANCE_BONDS.map((bond) => [bond.itemId, bond]));

export function createAllianceState() {
  return {
    bonds: Object.fromEntries(ALLIANCE_BONDS.map((bond) => [bond.allyId, false]))
  };
}

export function normalizeAllianceState(value) {
  const source = value?.bonds ?? {};
  return {
    bonds: Object.fromEntries(ALLIANCE_BONDS.map((bond) => [bond.allyId, source[bond.allyId] === true]))
  };
}

export function getAllianceBond(allyId) {
  return BOND_BY_ALLY.get(allyId) ?? null;
}

export function getAllianceBondByItem(itemId) {
  return BOND_BY_ITEM.get(itemId) ?? null;
}

export function isAllianceBonded(state, allyId) {
  return state?.alliance?.bonds?.[allyId] === true;
}

/** Marks a completed optional route exactly once. Returns metadata for UI and
 * dialogue plumbing; it does not change HP, cards, gold, MP or map state. */
export function completeAllianceBond(state, allyId) {
  const bond = getAllianceBond(allyId);
  if (!bond) return { ok: false, reason: `Unknown alliance bond '${allyId}'.` };
  state.alliance = normalizeAllianceState(state.alliance);
  const alreadyCompleted = state.alliance.bonds[allyId] === true;
  state.alliance.bonds[allyId] = true;
  return {
    ok: true,
    completed: !alreadyCompleted,
    alreadyCompleted,
    bond
  };
}
