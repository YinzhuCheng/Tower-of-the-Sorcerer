/**
 * 第二章路线盟约
 *
 * Act II deliberately has three expensive specialist vaults.  Leaving all
 * three simultaneously open turned them into a checklist: a patient player
 * could collect every late-game answer and erase the route puzzle.  At F11
 * the player now publicly commits to one doctrine.  The other two specialist
 * routes become sealed, while the normal ascent and the F12 generalist vault
 * remain available.
 *
 * This is not a hidden restriction.  The complete lock table, card spend,
 * reward and intended council survivor are exposed by free route intelligence
 * before F11's exit can be used.
 */

import { getAllianceBond, isAllianceBonded } from './alliance-bonds.js';

export const ROUTE_DOCTRINES_ID = 'act2-route-doctrines-v1';

export const ROUTE_DOCTRINES = Object.freeze([
  Object.freeze({
    id: 'ember',
    title: '赤焰裂印路线',
    allyId: 'yanli',
    difficulty: '爆发型',
    route: 'F15 档案封卷 → 赤焰蓄能',
    cardPressure: '星蚀卡 ×2',
    risk: 'MP 回充较晚；F15 后的附刃 MP 要留给高压战。',
    payoff: '焰璃在会战存活时：最终两相生命 -6%。',
    councilGoal: '会战后让龙姬·焰璃存活。',
    gateIds: Object.freeze(['f15ArchiveSeal'])
  }),
  Object.freeze({
    id: 'tide',
    title: '潮汐预唱路线',
    allyId: 'lanin',
    difficulty: '容量型',
    route: 'F13 星导管 → 潮汐导管',
    cardPressure: '星蚀卡 ×2',
    risk: '早拿容量，但后段 MP 回充较少。',
    payoff: '澜音在会战存活时：魔法终局阶段少 1 次反击。',
    councilGoal: '会战后让深蓝歌姬·澜音存活。',
    gateIds: Object.freeze(['f13StarConduit'])
  }),
  Object.freeze({
    id: 'shadow',
    title: '影线公开路线',
    allyId: 'yayu',
    difficulty: '高风险镜殿',
    route: 'F16 棱镜门槛 → 双镜宝库 → 影线校准',
    cardPressure: '月辉卡 ×2，外加双 Boss 战',
    risk: '保留月卡到 F16；一旦开启，必须打完双镜宝库才能离开。',
    midgameSupport: '开门：HP +14000、最大 MP +120、MP 补满；首名镜卫后再补满一次。',
    payoff: '鸦羽在会战存活时：起源核心失去二连击。',
    councilGoal: '会战后让影织姬·鸦羽存活。',
    gateIds: Object.freeze(['f16PrismThreshold', 'mirrorReservoirVault'])
  })
]);

const DOCTRINE_BY_ID = new Map(ROUTE_DOCTRINES.map((doctrine) => [doctrine.id, doctrine]));
const DOCTRINE_BY_GATE = new Map(ROUTE_DOCTRINES.flatMap((doctrine) => doctrine.gateIds.map((gateId) => [gateId, doctrine])));
const DOCTRINE_BY_ALLY = new Map(ROUTE_DOCTRINES.map((doctrine) => [doctrine.allyId, doctrine]));

export function createRouteDoctrineState() {
  return { selectedId: null, legacyOpen: false };
}

export function createLegacyRouteDoctrineState() {
  return { selectedId: null, legacyOpen: true };
}

export function normalizeRouteDoctrineState(value) {
  return {
    selectedId: DOCTRINE_BY_ID.has(value?.selectedId) ? value.selectedId : null,
    legacyOpen: value?.legacyOpen === true
  };
}

export function getRouteDoctrine(id) {
  return DOCTRINE_BY_ID.get(id) ?? null;
}

export function getRouteDoctrineForGate(gateId) {
  return DOCTRINE_BY_GATE.get(gateId) ?? null;
}

export function getSelectedRouteDoctrine(state) {
  return getRouteDoctrine(state?.doctrine?.selectedId);
}

export function isRouteDoctrineLegacyOpen(state) {
  return state?.doctrine?.legacyOpen === true;
}

export function canSelectRouteDoctrine(state) {
  return Number.isInteger(state?.floor)
    && state.floor === 10
    && !state?.doctrine?.selectedId
    && !isRouteDoctrineLegacyOpen(state);
}

/** This call changes only a declared strategy axis.  It grants no resource,
 * takes no turn and is irrevocable for the run. */
export function selectRouteDoctrine(state, doctrineId) {
  const doctrine = getRouteDoctrine(doctrineId);
  if (!doctrine) return { ok: false, reason: '未知的第二章路线。' };
  if (!canSelectRouteDoctrine(state)) {
    return { ok: false, reason: '路线盟约只能在第十一阵、离开复苏环廊前签署一次。' };
  }
  state.doctrine = { selectedId: doctrine.id, legacyOpen: false };
  return { ok: true, doctrine };
}

/** A specialist barrier is visible but only its chosen doctrine can open it.
 * The F12 generalist vault remains deliberately shared. */
export function routeDoctrineGateAccess(state, gateId) {
  const doctrine = getRouteDoctrineForGate(gateId);
  if (!doctrine || isRouteDoctrineLegacyOpen(state)) return { ok: true, doctrine: null };
  const selected = getSelectedRouteDoctrine(state);
  if (selected?.id === doctrine.id) return { ok: true, doctrine };
  return {
    ok: false,
    doctrine,
    reason: selected
      ? `已签署「${selected.title}」；「${doctrine.title}」的专家回路在本轮保持封印。`
      : `必须先在第十一阵签署路线盟约，才能决定是否开启「${doctrine.title}」。`
  };
}

/** Mí露的 F12 月镜支线是公开的通用防护；三位专家盟友则必须与
 * the chosen doctrine agree. */
export function canCompleteAllianceBondForDoctrine(state, allyId) {
  const doctrine = DOCTRINE_BY_ALLY.get(allyId);
  if (!doctrine || isRouteDoctrineLegacyOpen(state)) return true;
  return getSelectedRouteDoctrine(state)?.id === doctrine.id;
}

export function isRouteDoctrineCompleted(state) {
  const doctrine = getSelectedRouteDoctrine(state);
  return Boolean(doctrine && isAllianceBonded(state, doctrine.allyId));
}

export function getRouteDoctrineBriefing(state) {
  const selected = getSelectedRouteDoctrine(state);
  return Object.freeze({
    id: ROUTE_DOCTRINES_ID,
    free: true,
    requiredBeforeF11Exit: !isRouteDoctrineLegacyOpen(state),
    selectedId: selected?.id ?? null,
    entries: Object.freeze(ROUTE_DOCTRINES.map((doctrine) => {
      const bond = getAllianceBond(doctrine.allyId);
      return Object.freeze({
        ...doctrine,
        bondTitle: bond?.title ?? null,
        completed: isAllianceBonded(state, doctrine.allyId),
        selected: selected?.id === doctrine.id,
        locked: Boolean(selected && selected.id !== doctrine.id)
      });
    }))
  });
}
