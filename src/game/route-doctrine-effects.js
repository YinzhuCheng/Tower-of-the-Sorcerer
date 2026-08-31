/**
 * Route-specific authored effects.
 *
 * These are deliberately small, visible rule changes rather than hidden
 * numerical discounts.  The shadow route spends two moon cards and commits
 * to the entire F16 vault; in exchange the prism itself becomes a prepared
 * expedition supply line.  All values are deterministic and exposed by the
 * free route briefing before the F11 commitment.
 */

import { isAllianceBonded } from './alliance-bonds.js';

export const SHADOW_PRISM_EXPEDITION = Object.freeze({
  gateId: 'f16PrismThreshold',
  firstGuardianId: 'mirrorDuelist',
  floorIndex: 15,
  allyId: 'yayu',
  hpRestore: 14_000,
  maxMpBonus: 120,
  label: '棱镜续航：恢复 14000 HP，最大 MP +120 并完全补满；击败第一名镜卫后再次补满 MP。'
});

function isShadowRoute(state) {
  return state?.doctrine?.selectedId === 'shadow' && state?.doctrine?.legacyOpen !== true;
}

function prismIsOpened(state) {
  const map = state?.floorStates?.[SHADOW_PRISM_EXPEDITION.floorIndex]?.map;
  return Array.isArray(map) && !map.some((row) => row.includes(`gate:${SHADOW_PRISM_EXPEDITION.gateId}`));
}

function restoreToCurrentCap(state) {
  state.magic.mp = state.magic.maxMp;
}

/** Apply the single preparation effect when the paid prism threshold opens. */
export function applyRouteDoctrineGateEffect(state, gateId) {
  if (!isShadowRoute(state) || gateId !== SHADOW_PRISM_EXPEDITION.gateId) return null;
  const before = { hp: state.stats.hp, maxMp: state.magic.maxMp, mp: state.magic.mp };
  state.stats.hp = Math.min(state.stats.maxHp, state.stats.hp + SHADOW_PRISM_EXPEDITION.hpRestore);
  state.magic.maxMp += SHADOW_PRISM_EXPEDITION.maxMpBonus;
  restoreToCurrentCap(state);
  return Object.freeze({
    id: 'shadow-prism-supply',
    label: SHADOW_PRISM_EXPEDITION.label,
    before,
    after: Object.freeze({ hp: state.stats.hp, maxMp: state.magic.maxMp, mp: state.magic.mp })
  });
}

/** The first mirror guardian is a published refill checkpoint, not a random
 * proc.  It makes the two mandatory guardian fights a sequencing problem:
 * spend enough MP to pass the duelist, then decide how much of the returned
 * budget to keep for the cantor and the next floor. */
export function applyRouteDoctrineEnemyDefeatEffect(state, enemyId) {
  if (!isShadowRoute(state)
    || enemyId !== SHADOW_PRISM_EXPEDITION.firstGuardianId
    || !prismIsOpened(state)) return null;
  const beforeMp = state.magic.mp;
  restoreToCurrentCap(state);
  return Object.freeze({
    id: 'shadow-mirror-refill',
    label: '镜卫残响回灌：MP 恢复至当前上限。',
    beforeMp,
    afterMp: state.magic.mp
  });
}

/** Shadow is not allowed to pocket the prism supply and skip the high-risk
 * vault.  The ordinary campaign keeps every other return route available. */
export function getRouteDoctrineExitBlocker(state) {
  if (!isShadowRoute(state) || state.floor !== SHADOW_PRISM_EXPEDITION.floorIndex) return null;
  if (isAllianceBonded(state, SHADOW_PRISM_EXPEDITION.allyId)) return null;
  return '影线路线已开启双镜宝库；必须完成双镜宝库、击败双镜守卫并取得镜泉信物后才能离开 F16。';
}
