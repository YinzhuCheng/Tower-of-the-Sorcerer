/**
 * Public, map-level Boss rules.  These are deterministic route consequences,
 * not surprise modifiers: the same record is visible in free intelligence and
 * in the enemy preview before a player commits cards or HP.
 */

import { FLOORS } from './data.js';

export const BOSS_PROTOCOLS_ID = 'act2-boss-protocols-v1';

export const BOSS_PROTOCOLS = Object.freeze([
  Object.freeze({
    id: 'void-audit',
    title: '虚空审计',
    trigger: 'F18 星渠（星蚀卡 ×2）后击败虚空先驱',
    targetEnemyId: 'echoRegent',
    reward: '回声摄政官生命 -18%，每次魔法伤害 -45',
    hpMultiplier: 0.82,
    magicPenalty: 45
  })
]);

const VOID_AUDIT = BOSS_PROTOCOLS[0];

function floorIndex(number) {
  return FLOORS.findIndex((floor) => floor.number === number);
}

/** The F18 herald is unique. Its cleared map tile is an authoritative,
 * save-serialized proof that the optional audit was actually completed. */
export function isVoidAuditComplete(state) {
  const index = floorIndex(18);
  if (index < 0) return false;
  const map = state?.floorStates?.[index]?.map;
  return Array.isArray(map) && !map.some((row) => row.includes('enemy:voidHerald'));
}

export function getBossProtocolBriefing(state) {
  const active = isVoidAuditComplete(state);
  return Object.freeze(BOSS_PROTOCOLS.map((protocol) => Object.freeze({
    ...protocol,
    active
  })));
}

/** Applies only to the authored target. The clone keeps base data immutable,
 * allowing battle previews, solver simulation and mutation probes to agree. */
export function applyBossProtocolModifier(state, enemyId, enemy) {
  if (!enemy || enemyId !== VOID_AUDIT.targetEnemyId || !isVoidAuditComplete(state)) return enemy;
  return Object.freeze({
    ...enemy,
    hp: Math.max(1, Math.round(enemy.hp * VOID_AUDIT.hpMultiplier)),
    magicPower: Math.max(0, (enemy.magicPower ?? 0) - VOID_AUDIT.magicPenalty),
    protocolModified: true,
    protocolLabels: Object.freeze([`虚空审计：生命 -18%，魔法伤害 -${VOID_AUDIT.magicPenalty}`])
  });
}

export function getProtocolDefeatLog(floorNumber, enemyId) {
  if (floorNumber === 18 && enemyId === 'voidHerald') {
    return '虚空审计完成：回声摄政官生命 -18%，魔法伤害 -45。';
  }
  return null;
}
