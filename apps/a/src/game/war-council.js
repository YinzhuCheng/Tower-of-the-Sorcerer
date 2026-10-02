/**
 * 王座前共鸣会战
 *
 * This is deliberately a deterministic, self-contained tactics layer.  It
 * does not borrow the heroine's exploration MP: the point is to contrast the
 * Sovereign's pre-assigned command budget with a party budget the player can
 * inspect and allocate before the fight.  Keeping the simulation pure makes
 * the UI preview, engine, solver and balance tooling agree exactly.
 */

import { getAllianceBond, isAllianceBonded } from './alliance-bonds.js';

export const WAR_COUNCIL_ID = 'throne-resonance-council-v1';
export const WAR_COUNCIL_MP_STEP = 20;
export const WAR_COUNCIL_MP_POOL = 120;
export const WAR_COUNCIL_MAX_MP_PER_ALLY = 60;

// Intentionally mutable only through the bounded Act II numeric mutator.
// It is not exposed to browser controls and is restored after every candidate
// evaluation, just like the existing enemy/relic numeric overlays.
// 22 / 240 legal plans win at this baseline: deliberately demanding, but not
// a single-solution trap.  The release gate enforces that healthy window.
export const WAR_COUNCIL_TUNING = Object.seal({ loyalistScale: 1.035 });

export const WAR_COUNCIL_ALLIES = Object.freeze([
  Object.freeze({
    id: 'milu', enemyId: 'catBoss', name: '猫卫长·米露', portrait: 'cat_boss', role: '结界护卫',
    hp: 1480, atk: 278, def: 246,
    mpGrowth: Object.freeze({ hp: 150, atk: 7, def: 18 }),
    finale: Object.freeze({ atkPenalty: 20, label: '月影护幕：最终敌人攻击 -20' })
  }),
  Object.freeze({
    id: 'lanin', enemyId: 'whaleBoss', name: '深蓝歌姬·澜音', portrait: 'whale_boss', role: '潮汐咏唱',
    hp: 1210, atk: 292, def: 212,
    mpGrowth: Object.freeze({ hp: 70, atk: 22, def: 5, arcane: 8 }),
    finale: Object.freeze({ magicPenalty: 32, label: '潮汐回响：最终敌人魔法伤害 -32' })
  }),
  Object.freeze({
    id: 'yanli', enemyId: 'dragonBoss', name: '龙姬·焰璃', portrait: 'dragon_boss', role: '赤焰突击',
    hp: 1300, atk: 318, def: 219,
    mpGrowth: Object.freeze({ hp: 80, atk: 30, def: 4 }),
    finale: Object.freeze({ hpMultiplier: 0.92, label: '赤焰裂印：最终敌人生命 -8%' })
  }),
  Object.freeze({
    id: 'yayu', enemyId: 'shadowBoss', name: '影织姬·鸦羽', portrait: 'shadow_boss', role: '影线策应',
    hp: 1260, atk: 300, def: 232,
    mpGrowth: Object.freeze({ hp: 90, atk: 16, def: 13 }),
    finale: Object.freeze({ defPenalty: 16, label: '虚影拆解：最终敌人防御 -16' })
  })
]);

// The order and every enemy allocation are public information.  Their three
// roles ask different questions: a resilient opener, a magic-pressure middle
// and an initiative finisher.  This is a planning puzzle, never a dice roll.
export const WAR_COUNCIL_LOYALISTS = Object.freeze([
  Object.freeze({
    id: 'oathGuard', name: '誓约铁卫·艾冯', portrait: 'crown_blade', role: '定额护卫',
    hp: 1680, atk: 286, def: 245, mp: 20,
    mpGrowth: Object.freeze({ hp: 90, atk: 8, def: 15 })
  }),
  Object.freeze({
    id: 'edictCantor', name: '敕令咏唱者·希娅', portrait: 'rune_cantor', role: '定额咏唱',
    hp: 1260, atk: 278, def: 218, mp: 60,
    mpGrowth: Object.freeze({ hp: 40, atk: 13, def: 5, arcane: 11 })
  }),
  Object.freeze({
    id: 'crownBlade', name: '冠冕执刑官·蕾欧', portrait: 'sword_boss', role: '定额先遣',
    hp: 1460, atk: 324, def: 228, mp: 40, firstStrike: true,
    mpGrowth: Object.freeze({ hp: 65, atk: 22, def: 8 })
  })
]);

const ALLY_BY_ID = new Map(WAR_COUNCIL_ALLIES.map((entry) => [entry.id, entry]));

function finiteWhole(value, fallback = 0) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function scale(value) {
  return Math.max(0, Math.round(value * WAR_COUNCIL_TUNING.loyalistScale));
}

function empowered(unit, mp = 0, { loyalist = false } = {}) {
  const tiers = finiteWhole(mp) / WAR_COUNCIL_MP_STEP;
  const growth = unit.mpGrowth ?? {};
  const base = loyalist
    ? { hp: scale(unit.hp), atk: scale(unit.atk), def: scale(unit.def), arcane: scale(unit.arcane ?? 0) }
    : { hp: unit.hp, atk: unit.atk, def: unit.def, arcane: unit.arcane ?? 0 };
  return {
    id: unit.id,
    name: unit.name,
    portrait: unit.portrait,
    role: unit.role,
    mp: finiteWhole(mp),
    hp: base.hp + finiteWhole(growth.hp) * tiers,
    maxHp: base.hp + finiteWhole(growth.hp) * tiers,
    atk: base.atk + finiteWhole(growth.atk) * tiers,
    def: base.def + finiteWhole(growth.def) * tiers,
    arcane: base.arcane + finiteWhole(growth.arcane) * tiers,
    firstStrike: Boolean(unit.firstStrike),
    finale: unit.finale ? { ...unit.finale } : null,
    bonded: unit.bonded === true,
    bondFinale: unit.bondFinale ? { ...unit.bondFinale } : null,
    bondActivation: unit.bondActivation ?? 'survive'
  };
}

function strikeDamage(attacker, defender) {
  return Math.max(1, attacker.atk - defender.def) + attacker.arcane;
}

/** A complete one-on-one fixed-numeric duel. Left attacks first unless the
 * right combatant has the authored first-strike flag. */
export function simulateCouncilDuel(leftSource, rightSource) {
  const left = { ...leftSource };
  const right = { ...rightSource };
  const log = [];
  let attacker = right.firstStrike ? right : left;
  let defender = attacker === left ? right : left;
  let exchanges = 0;

  while (left.hp > 0 && right.hp > 0 && exchanges < 200) {
    const damage = strikeDamage(attacker, defender);
    defender.hp -= damage;
    exchanges += 1;
    log.push(Object.freeze({ attacker: attacker.id, defender: defender.id, damage, remaining: Math.max(0, defender.hp) }));
    if (defender.hp <= 0) break;
    [attacker, defender] = [defender, attacker];
  }
  if (exchanges >= 200) throw new Error('War council duel exceeded deterministic exchange guard.');

  const leftWon = left.hp > 0;
  const winner = leftWon ? left : right;
  const loser = leftWon ? right : left;
  return Object.freeze({
    left: Object.freeze({ ...left, hp: Math.max(0, left.hp) }),
    right: Object.freeze({ ...right, hp: Math.max(0, right.hp) }),
    winnerId: winner.id,
    loserId: loser.id,
    leftWon,
    exchanges,
    log: Object.freeze(log)
  });
}

function defeatedBosses(state) {
  return new Set((state?.floorStates ?? []).flatMap((floor) => floor?.defeatedBossIds ?? []));
}

export function getWarCouncilAllies(state) {
  const defeated = defeatedBosses(state);
  return WAR_COUNCIL_ALLIES
    .filter((ally) => defeated.has(ally.enemyId))
    .map((ally) => {
      const bond = getAllianceBond(ally.id);
      const bonded = isAllianceBonded(state, ally.id);
      return Object.freeze({
        ...ally,
        bonded,
        bondTitle: bond?.title ?? null,
        bondRoute: bond?.route ?? null,
        bondEffect: bonded ? bond?.finale?.label ?? null : null,
        bondActivation: bond?.activation ?? 'survive',
        bondFinale: bonded && bond?.finale ? { ...bond.finale } : null
      });
    });
}

export function createWarCouncilState() {
  return { completed: false, plan: null, outcome: null };
}

export function normalizeWarCouncilState(value) {
  if (!value || typeof value !== 'object') return createWarCouncilState();
  if (!value.completed) return createWarCouncilState();
  return {
    completed: true,
    plan: value.plan ? clone(value.plan) : null,
    outcome: value.outcome ? clone(value.outcome) : null
  };
}

function allocationFor(plan, id) {
  return finiteWhole(plan?.allocations?.[id]);
}

export function validateWarCouncilPlan(state, plan) {
  if (state?.council?.completed) return { ok: false, reason: '王座前的共鸣会战已经结束。' };
  const available = getWarCouncilAllies(state);
  const availableIds = new Set(available.map((entry) => entry.id));
  const order = Array.isArray(plan?.order) ? plan.order : [];
  if (order.length !== 3 || new Set(order).size !== 3 || order.some((id) => !availableIds.has(id))) {
    return { ok: false, reason: '需要从已解放的盟友中选择 3 名，且不得重复。' };
  }
  const allocations = Object.fromEntries(order.map((id) => [id, allocationFor(plan, id)]));
  const values = Object.values(allocations);
  if (values.some((mp) => mp % WAR_COUNCIL_MP_STEP !== 0 || mp > WAR_COUNCIL_MAX_MP_PER_ALLY)) {
    return { ok: false, reason: `每位盟友只能分配 0–${WAR_COUNCIL_MAX_MP_PER_ALLY} MP，步长为 ${WAR_COUNCIL_MP_STEP}。` };
  }
  const totalMp = values.reduce((sum, mp) => sum + mp, 0);
  if (totalMp !== WAR_COUNCIL_MP_POOL) {
    return { ok: false, reason: `必须分配全部 ${WAR_COUNCIL_MP_POOL} 点共鸣 MP（当前 ${totalMp}）。` };
  }
  return { ok: true, order: [...order], allocations, totalMp, available };
}

function finaleModifiers(survivors, deployed) {
  let hpMultiplier = 1;
  let atkPenalty = 0;
  let defPenalty = 0;
  let magicPenalty = 0;
  let counterattackGuard = 0;
  let magicCounterattackGuard = 0;
  let disableDoubleHit = false;
  const labels = [];
  for (const survivor of survivors) {
    const effect = survivor.finale;
    if (!effect) continue;
    hpMultiplier *= effect.hpMultiplier ?? 1;
    atkPenalty += effect.atkPenalty ?? 0;
    defPenalty += effect.defPenalty ?? 0;
    magicPenalty += effect.magicPenalty ?? 0;
    counterattackGuard += effect.counterattackGuard ?? 0;
    magicCounterattackGuard += effect.magicCounterattackGuard ?? 0;
    disableDoubleHit ||= effect.disableDoubleHit === true;
    if (effect.label) labels.push(effect.label);
  }
  const activatedBonds = [
    ...deployed.filter((ally) => ally.bonded && ally.bondActivation === 'deployed'),
    ...survivors.filter((ally) => ally.bonded && ally.bondActivation !== 'deployed')
  ];
  for (const ally of activatedBonds) {
    const effect = ally.bondFinale;
    if (effect) {
      hpMultiplier *= effect.hpMultiplier ?? 1;
      atkPenalty += effect.atkPenalty ?? 0;
      defPenalty += effect.defPenalty ?? 0;
      magicPenalty += effect.magicPenalty ?? 0;
      counterattackGuard += effect.counterattackGuard ?? 0;
      magicCounterattackGuard += effect.magicCounterattackGuard ?? 0;
      disableDoubleHit ||= effect.disableDoubleHit === true;
      if (effect.label) labels.push(effect.label);
    }
  }
  return Object.freeze({
    hpMultiplier,
    atkPenalty,
    defPenalty,
    magicPenalty,
    counterattackGuard,
    magicCounterattackGuard,
    disableDoubleHit,
    labels: Object.freeze(labels)
  });
}

/** Simulate all three ordered fights.  The winning combatant keeps remaining
 * HP and immediately faces the next opponent, which is what makes deployment
 * order and MP distribution jointly meaningful. */
export function simulateWarCouncil(state, plan) {
  const validation = validateWarCouncilPlan({ ...state, council: { completed: false } }, plan);
  if (!validation.ok) return Object.freeze(validation);
  const availableById = new Map(validation.available.map((ally) => [ally.id, ally]));
  const allies = validation.order.map((id) => empowered(availableById.get(id) ?? ALLY_BY_ID.get(id), validation.allocations[id]));
  const loyalists = WAR_COUNCIL_LOYALISTS.map((unit) => empowered(unit, unit.mp, { loyalist: true }));
  const records = [];
  const remainingHpByAlly = new Map(allies.map((ally) => [ally.id, 0]));
  let allyIndex = 0;
  let loyalistIndex = 0;
  let activeAlly = allies[0];
  let activeLoyalist = loyalists[0];

  while (activeAlly && activeLoyalist) {
    const duel = simulateCouncilDuel(activeAlly, activeLoyalist);
    records.push(duel);
    if (duel.leftWon) {
      activeAlly = { ...duel.left };
      remainingHpByAlly.set(activeAlly.id, activeAlly.hp);
      loyalistIndex += 1;
      activeLoyalist = loyalists[loyalistIndex] ? { ...loyalists[loyalistIndex] } : null;
    } else {
      activeLoyalist = { ...duel.right };
      remainingHpByAlly.set(activeAlly.id, 0);
      allyIndex += 1;
      activeAlly = allies[allyIndex] ? { ...allies[allyIndex] } : null;
    }
  }

  const won = loyalistIndex >= loyalists.length;
  const survivors = won
    ? allies.map((ally) => ({ ...ally, hp: remainingHpByAlly.get(ally.id) ?? 0 }))
      .filter((ally) => ally.hp > 0)
    : [];
  const modifiers = finaleModifiers(survivors, allies);
  const remainingAllyHp = survivors.reduce((sum, unit) => sum + unit.hp, 0);
  const score = (won ? 1_000_000 : 0) + survivors.length * 10_000 + remainingAllyHp
    + modifiers.atkPenalty * 60 + modifiers.defPenalty * 80 + modifiers.magicPenalty * 70
    + Math.round((1 - modifiers.hpMultiplier) * 100_000)
    + modifiers.counterattackGuard * 2_000 + modifiers.magicCounterattackGuard * 1_500
    + (modifiers.disableDoubleHit ? 3_000 : 0);
  return Object.freeze({
    ok: true,
    won,
    plan: Object.freeze({ order: [...validation.order], allocations: { ...validation.allocations }, totalMp: validation.totalMp }),
    allies: Object.freeze(allies.map((unit) => Object.freeze({ ...unit }))),
    loyalists: Object.freeze(loyalists.map((unit) => Object.freeze({ ...unit }))),
    records: Object.freeze(records),
    survivors: Object.freeze(survivors.map((unit) => Object.freeze({ ...unit }))),
    modifiers,
    remainingAllyHp,
    score
  });
}

function permutations(values, length, prefix = [], output = []) {
  if (prefix.length === length) {
    output.push(prefix);
    return output;
  }
  for (const value of values) {
    if (!prefix.includes(value)) permutations(values, length, [...prefix, value], output);
  }
  return output;
}

function allocationsFor(order, remaining = WAR_COUNCIL_MP_POOL, prefix = [], output = []) {
  if (prefix.length === order.length) {
    if (remaining === 0) output.push(Object.fromEntries(order.map((id, index) => [id, prefix[index]])));
    return output;
  }
  for (let mp = 0; mp <= Math.min(WAR_COUNCIL_MAX_MP_PER_ALLY, remaining); mp += WAR_COUNCIL_MP_STEP) {
    allocationsFor(order, remaining - mp, [...prefix, mp], output);
  }
  return output;
}

export function enumerateWarCouncilPlans(state, { winningOnly = false, limit = null } = {}) {
  const ids = getWarCouncilAllies(state).map((ally) => ally.id);
  const plans = [];
  for (const order of permutations(ids, 3)) {
    for (const allocations of allocationsFor(order)) {
      const report = simulateWarCouncil(state, { order, allocations });
      if (report.ok && (!winningOnly || report.won)) plans.push(report);
    }
  }
  plans.sort((a, b) => b.score - a.score || a.plan.order.join(',').localeCompare(b.plan.order.join(',')));
  return Object.freeze(limit == null ? plans : plans.slice(0, limit));
}

export function getRecommendedWarCouncilPlan(state) {
  return enumerateWarCouncilPlans(state, { winningOnly: true, limit: 1 })[0] ?? null;
}

export function getWarCouncilBalanceReport(state) {
  const all = enumerateWarCouncilPlans(state);
  const wins = all.filter((entry) => entry.won);
  return Object.freeze({
    totalPlans: all.length,
    winningPlans: wins.length,
    winRate: all.length ? wins.length / all.length : 0,
    best: wins[0] ?? null,
    hardestWinningScore: wins.at(-1)?.score ?? null
  });
}

export function applyWarCouncilFinaleModifier(enemy, council) {
  if (!council?.completed || !council?.outcome?.modifiers) return enemy;
  const modifiers = council.outcome.modifiers;
  const counterattackGuard = finiteWhole(modifiers.counterattackGuard);
  const magicCounterattackGuard = finiteWhole(modifiers.magicCounterattackGuard);
  const disableDoubleHit = modifiers.disableDoubleHit === true;
  const special = disableDoubleHit && enemy.special === 'doubleHit' ? undefined : enemy.special;
  return {
    ...enemy,
    hp: Math.max(1, Math.ceil(enemy.hp * (modifiers.hpMultiplier ?? 1))),
    atk: Math.max(0, enemy.atk - (modifiers.atkPenalty ?? 0)),
    def: Math.max(0, enemy.def - (modifiers.defPenalty ?? 0)),
    magicPower: Number.isFinite(enemy.magicPower)
      ? Math.max(0, enemy.magicPower - (modifiers.magicPenalty ?? 0))
      : enemy.magicPower,
    special,
    councilRules: Object.freeze({ counterattackGuard, magicCounterattackGuard, disableDoubleHit }),
    councilLabels: Object.freeze([...(modifiers.labels ?? [])]),
    councilModified: true
  };
}
