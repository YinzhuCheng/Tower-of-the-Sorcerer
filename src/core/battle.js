// Extracted without arithmetic changes from game/engine.js v10. Shared by A/B/C.
import { describeMagicTier } from '../game/magic-blade.js';

export function calculateBattle(stats, enemy, relics = {}, magic = {}) {
  // Magical damage augments a physical hit; it never opens an otherwise
  // impossible defense breakpoint. This preserves the fundamental 魔塔
  // attack/defense puzzle and leaves "magic pierce" available for an explicit
  // future relic rather than smuggling it into the base system.
  const physicalDamage = stats.atk - enemy.def;
  const magicStatus = describeMagicTier(magic);
  const magicTier = magicStatus.tier;
  const magicCost = magicStatus.cost;
  if (physicalDamage <= 0) {
    return {
      winnable: false,
      reason: '攻击不足，无法破防',
      heroDamage: 0,
      physicalDamage: 0,
      magicTier,
      magicCost,
      magicBonusPerHit: 0,
      magicAffordable: magicStatus.affordable,
      enemyDamage: 0,
      rounds: Infinity,
      counterAttacks: Infinity,
      totalDamage: Infinity,
      remainingHp: stats.hp
    };
  }

  if (!magicStatus.affordable) {
    return {
      winnable: false,
      reason: `当前魔力不足以维持 ${magicTier} 档魔力附刃`,
      heroDamage: physicalDamage,
      physicalDamage,
      magicTier,
      magicCost,
      magicBonusPerHit: magicCost,
      magicAffordable: false,
      enemyDamage: 0,
      rounds: Infinity,
      counterAttacks: Infinity,
      totalDamage: Infinity,
      remainingHp: stats.hp
    };
  }

  const heroDamage = physicalDamage + magicCost;
  const rounds = Math.ceil(enemy.hp / heroDamage);
  let counterAttacks = Math.max(0, rounds - 1);
  if (enemy.special === 'firstStrike') counterAttacks += 1;

  // Bonded council survivors can alter a final battle's authored rule rather
  // than only shaving numbers.  These guards are deterministic and visible in
  // the same preview that calculates all other fixed damage.
  const councilRules = enemy.councilRules ?? {};
  counterAttacks = Math.max(0, counterAttacks - Math.max(0, Math.floor(councilRules.counterattackGuard ?? 0)));
  if (enemy.special === 'magic') {
    counterAttacks = Math.max(0, counterAttacks - Math.max(0, Math.floor(councilRules.magicCounterattackGuard ?? 0)));
  }

  let enemyDamage;
  if (enemy.special === 'magic') {
    enemyDamage = enemy.magicPower ?? enemy.atk;
    if (relics.ward) enemyDamage = Math.ceil(enemyDamage * 0.8);
  } else {
    enemyDamage = Math.max(0, enemy.atk - stats.def);
    if (enemy.special === 'doubleHit') enemyDamage *= 2;
  }

  const totalDamage = enemyDamage * counterAttacks;
  return {
    winnable: totalDamage < stats.hp,
    reason: totalDamage < stats.hp ? null : '预计损伤会使生命归零',
    heroDamage,
    physicalDamage,
    magicTier,
    magicCost,
    magicBonusPerHit: magicCost,
    magicAffordable: true,
    enemyDamage,
    rounds,
    counterAttacks,
    totalDamage,
    remainingHp: stats.hp - totalDamage
  };
}
