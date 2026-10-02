/**
 * F27 接力校场的先后手承诺。
 *
 * 三名守卫仍然全部是上行刚需；区别在于第一名被击败的守卫会决定
 * 校场把哪一种备用程序移交给主角。这里不加入随机数、隐藏门或第二
 * 套货币：玩家在开战前就能看到三种后果，真正的代价是第一场战斗的
 * 伤害、MP 和错失的另外两种残局支援。
 */

export const ACT3_HANDOFFS_ID = 'afterlight-handoff-priorities-v1';

export const ACT3_HANDOFFS = Object.freeze([
  Object.freeze({
    id: 'escort',
    triggerEnemyId: 'marginDuelist',
    title: '护送优先',
    route: 'F27 首先击败边注决斗者（先制）',
    cost: '第一战打先制决斗者；本轮放弃校验与接力支援。',
    payoff: 'F30 两个阶段各少结算 2 次反击。',
    risk: '不补 MP，也不会移除勘误核心的二连击。',
    finale: Object.freeze({ counterattackGuard: 2, label: '护送优先：最终每阶段少结算 2 次反击' })
  }),
  Object.freeze({
    id: 'proofread',
    triggerEnemyId: 'errataCantor',
    title: '校验优先',
    route: 'F27 首先击败勘误咏唱者（魔法）',
    cost: '第一战打无视防御的魔法敌人；本轮放弃护送与接力支援。',
    payoff: '档案守望者魔法伤害 -95；勘误核心失去二连击。',
    risk: '不提供反击减免或 MP 回充。',
    finale: Object.freeze({ magicPenalty: 95, disableDoubleHit: true, label: '校验优先：守望者魔法 -95，勘误核心失去二连击' })
  }),
  Object.freeze({
    id: 'beacon',
    triggerEnemyId: 'archiveMarshal',
    title: '接力优先',
    route: 'F27 首先击败接力总管（高生命）',
    cost: '第一战打生命最高的总管；本轮放弃护送与校验支援。',
    payoff: '三名守卫全部清除后，MP 恢复至当前上限。',
    risk: '不削弱 F30；必须清完另外两名守卫才回充。',
    finale: Object.freeze({ label: '接力优先：F27 清场后 MP 恢复至上限' })
  })
]);

const HANDOFF_BY_ID = new Map(ACT3_HANDOFFS.map((handoff) => [handoff.id, handoff]));
const HANDOFF_BY_ENEMY = new Map(ACT3_HANDOFFS.map((handoff) => [handoff.triggerEnemyId, handoff]));

export function createAct3HandoffState() {
  return { selectedId: null, beaconRefilled: false, legacyOpen: false };
}

export function createLegacyAct3HandoffState() {
  return { selectedId: null, beaconRefilled: false, legacyOpen: true };
}

export function normalizeAct3HandoffState(value) {
  const selectedId = HANDOFF_BY_ID.has(value?.selectedId) ? value.selectedId : null;
  return {
    selectedId,
    beaconRefilled: selectedId === 'beacon' && value?.beaconRefilled === true,
    legacyOpen: value?.legacyOpen === true
  };
}

export function getAct3Handoff(id) {
  return HANDOFF_BY_ID.get(id) ?? null;
}

export function getAct3HandoffForEnemy(enemyId) {
  return HANDOFF_BY_ENEMY.get(enemyId) ?? null;
}

export function getSelectedAct3Handoff(state) {
  return getAct3Handoff(state?.handoff?.selectedId);
}

/** Called from the authoritative combat result. It has no action button: the
 * first F27 guardian actually defeated is the player's public commitment. */
export function selectAct3HandoffForEnemy(state, enemyId) {
  if (state?.handoff?.legacyOpen === true || state?.handoff?.selectedId) return null;
  if (state?.floor !== 26) return null; // zero-based F27
  const handoff = HANDOFF_BY_ENEMY.get(enemyId);
  if (!handoff) return null;
  state.handoff = { selectedId: handoff.id, beaconRefilled: false, legacyOpen: false };
  return Object.freeze({
    id: handoff.id,
    handoff,
    label: `校场优先级锁定为「${handoff.title}」：${handoff.payoff}`
  });
}

/** The beacon is deliberately delayed until the full guardian gate opens. A
 * player cannot spend the recovered MP on the two remaining mandatory fights. */
export function settleAct3HandoffAfterGuardians(state, remainingGuardians = []) {
  const handoff = getSelectedAct3Handoff(state);
  if (!handoff || handoff.id !== 'beacon' || state?.handoff?.beaconRefilled) return null;
  if (state.floor !== 26 || remainingGuardians.length > 0) return null;
  const beforeMp = state.magic.mp;
  state.magic.mp = state.magic.maxMp;
  state.handoff = { ...state.handoff, beaconRefilled: true };
  return Object.freeze({
    id: 'handoff-beacon-refill',
    handoff,
    beforeMp,
    afterMp: state.magic.mp,
    label: `接力优先兑现：校场清场后 MP 从 ${beforeMp} 恢复至 ${state.magic.mp}/${state.magic.maxMp}。`
  });
}

export function applyAct3HandoffFinaleModifier(state, enemyId, enemy) {
  if (!enemy || (enemyId !== 'archiveWarden' && enemyId !== 'errataCore')) return enemy;
  const handoff = getSelectedAct3Handoff(state);
  if (!handoff) return enemy;
  const effect = handoff.finale ?? {};
  const inheritedRules = enemy.councilRules ?? {};
  const modified = {
    ...enemy,
    magicPower: enemyId === 'archiveWarden'
      ? Math.max(0, (enemy.magicPower ?? 0) - (effect.magicPenalty ?? 0))
      : enemy.magicPower,
    special: enemyId === 'errataCore' && effect.disableDoubleHit ? undefined : enemy.special,
    councilRules: {
      ...inheritedRules,
      counterattackGuard: Math.max(0, (inheritedRules.counterattackGuard ?? 0) + (effect.counterattackGuard ?? 0))
    },
    handoffLabels: Object.freeze([effect.label])
  };
  return Object.freeze(modified);
}

export function getAct3HandoffBriefing(state) {
  const selected = getSelectedAct3Handoff(state);
  return Object.freeze({
    id: ACT3_HANDOFFS_ID,
    free: true,
    selectedId: selected?.id ?? null,
    selectedAfter: 'F27 第一名被击败的校场守卫',
    beaconRefilled: state?.handoff?.beaconRefilled === true,
    entries: Object.freeze(ACT3_HANDOFFS.map((handoff) => Object.freeze({
      ...handoff,
      selected: selected?.id === handoff.id,
      locked: Boolean(selected && selected.id !== handoff.id)
    })))
  });
}
