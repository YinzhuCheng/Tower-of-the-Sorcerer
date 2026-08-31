/**
 * Act III: the Afterlight Registry.
 *
 * The old tower ends with a command engine going quiet.  The last ten floors
 * ask a less ceremonial question: what do you repair first when the archive
 * is still holding people and wards in an unfinished emergency loop?
 *
 * A charter is deliberately a route promise, not a paid hint.  Its complete
 * price, detour and final consequence are exposed before F21's stair is used.
 * Only the chosen charter's annex can be opened in one run, so the player
 * cannot collect every late-game safety valve by patiently backtracking.
 */

export const ACT3_CHARTERS_ID = 'afterlight-registry-charters-v1';

export const ACT3_CHARTERS = Object.freeze([
  Object.freeze({
    id: 'shelter',
    title: '夜航护送章程',
    gateId: 'f22ShelterAnnex',
    itemId: 'shelterAegis',
    difficulty: '生命型终局',
    route: 'F22 夜航侧库（消耗月辉卡 ×2）',
    cost: '月辉卡 ×2，并击败夜航守柜人。',
    payoff: '获得大幅生命与防御；F30 的每个阶段少结算 3 次反击。',
    risk: '本轮无法获得校验削弱或接力补魔。',
    finale: Object.freeze({ counterattackGuard: 3, label: '夜航护送：最终每阶段少结算 3 次反击' })
  }),
  Object.freeze({
    id: 'audit',
    title: '逐页校验章程',
    gateId: 'f23AuditAnnex',
    itemId: 'auditLedger',
    difficulty: '削弱型终局',
    route: 'F23 逐页校验室（消耗星蚀卡 ×2）',
    cost: '星蚀卡 ×2，并击败持簿执行官。',
    payoff: '提高攻防；F30 两阶段生命 -21%、防御 -15、魔法伤害 -55。',
    risk: '要打魔法执行官；本轮没有夜航减击或接力补魔。',
    finale: Object.freeze({ hpMultiplier: 0.79, defPenalty: 15, magicPenalty: 55, label: '逐页校验：最终生命 -21%、防御 -15、魔法伤害 -55' })
  }),
  Object.freeze({
    id: 'relay',
    title: '灯塔接力章程',
    gateId: 'f24RelayAnnex',
    itemId: 'relayCapacitor',
    difficulty: 'MP 型终局',
    route: 'F24 灯塔接力室（消耗日曜卡 ×1、月辉卡 ×1）',
    cost: '日曜卡 ×1、月辉卡 ×1；第二次回充在 F27 后触发。',
    payoff: '最大 MP +60、立即补满；击败 F27 接力总管后再补满一次。',
    risk: '不直接削弱终局；F27 后的 MP 要留给 F30。',
    relayEnemyId: 'archiveMarshal',
    finale: Object.freeze({ label: '灯塔接力：F27 后 MP 补满一次' })
  })
]);

const CHARTER_BY_ID = new Map(ACT3_CHARTERS.map((charter) => [charter.id, charter]));
const CHARTER_BY_GATE = new Map(ACT3_CHARTERS.map((charter) => [charter.gateId, charter]));
const CHARTER_BY_ITEM = new Map(ACT3_CHARTERS.map((charter) => [charter.itemId, charter]));

export function createAct3CharterState() {
  return { selectedId: null, completedId: null, relayRefilled: false, legacyOpen: false };
}

export function createLegacyAct3CharterState() {
  return { selectedId: null, completedId: null, relayRefilled: false, legacyOpen: true };
}

export function normalizeAct3CharterState(value) {
  const selectedId = CHARTER_BY_ID.has(value?.selectedId) ? value.selectedId : null;
  const completedId = value?.completedId === selectedId ? selectedId : null;
  return {
    selectedId,
    completedId,
    relayRefilled: completedId === 'relay' && value?.relayRefilled === true,
    legacyOpen: value?.legacyOpen === true
  };
}

export function getAct3Charter(id) {
  return CHARTER_BY_ID.get(id) ?? null;
}

export function getAct3CharterForGate(gateId) {
  return CHARTER_BY_GATE.get(gateId) ?? null;
}

export function getSelectedAct3Charter(state) {
  return getAct3Charter(state?.charter?.selectedId);
}

export function canSelectAct3Charter(state) {
  return Number.isInteger(state?.floor)
    && state.floor === 20
    && !state?.charter?.selectedId
    && state?.charter?.legacyOpen !== true;
}

export function selectAct3Charter(state, charterId) {
  const charter = getAct3Charter(charterId);
  if (!charter) return { ok: false, reason: '未知的修复章程。' };
  if (!canSelectAct3Charter(state)) {
    return { ok: false, reason: '修复章程只能在 F21 的入口阶梯前公开签署一次。' };
  }
  state.charter = { selectedId: charter.id, completedId: null, relayRefilled: false, legacyOpen: false };
  return { ok: true, charter };
}

export function act3CharterGateAccess(state, gateId) {
  const charter = getAct3CharterForGate(gateId);
  if (!charter || state?.charter?.legacyOpen === true) return { ok: true, charter: null };
  const selected = getSelectedAct3Charter(state);
  if (selected?.id === charter.id) return { ok: true, charter };
  return {
    ok: false,
    charter,
    reason: selected
      ? `本轮已签署「${selected.title}」；「${charter.title}」的侧库会保留给下一轮。`
      : '必须先在 F21 公开签署一份修复章程。'
  };
}

export function completeAct3CharterForItem(state, itemId) {
  const charter = CHARTER_BY_ITEM.get(itemId);
  if (!charter || state?.charter?.selectedId !== charter.id) return null;
  const alreadyCompleted = state.charter?.completedId === charter.id;
  state.charter = {
    ...normalizeAct3CharterState(state.charter),
    completedId: charter.id
  };
  return { charter, completed: !alreadyCompleted, alreadyCompleted };
}

export function isAct3CharterCompleted(state, charterId = state?.charter?.selectedId) {
  return Boolean(charterId && state?.charter?.completedId === charterId);
}

/** Applies only to the authored F30 pair; other enemies retain their exact
 * published values.  The clone makes previews, replay and the solver agree. */
export function applyAct3CharterFinaleModifier(state, enemyId, enemy) {
  if (!enemy || (enemyId !== 'archiveWarden' && enemyId !== 'errataCore')) return enemy;
  const charter = getSelectedAct3Charter(state);
  if (!charter || !isAct3CharterCompleted(state, charter.id)) return enemy;
  const effect = charter.finale ?? {};
  if (charter.id === 'relay') return Object.freeze({ ...enemy, charterLabels: Object.freeze([effect.label]) });
  const inheritedRules = enemy.councilRules ?? {};
  return Object.freeze({
    ...enemy,
    hp: Math.max(1, Math.round(enemy.hp * (effect.hpMultiplier ?? 1))),
    atk: Math.max(0, enemy.atk - (effect.atkPenalty ?? 0)),
    def: Math.max(0, enemy.def - (effect.defPenalty ?? 0)),
    magicPower: Math.max(0, (enemy.magicPower ?? 0) - (effect.magicPenalty ?? 0)),
    councilRules: {
      ...inheritedRules,
      counterattackGuard: Math.max(0, (inheritedRules.counterattackGuard ?? 0) + (effect.counterattackGuard ?? 0)),
      magicCounterattackGuard: Math.max(0, (inheritedRules.magicCounterattackGuard ?? 0) + (effect.magicCounterattackGuard ?? 0))
    },
    charterLabels: Object.freeze([effect.label])
  });
}

/** The relay is a public *timing* effect.  It does not refill on pickup a
 * second time; it refills exactly after the F27 relay boss if the player kept
 * the annex commitment alive. */
export function applyAct3CharterEnemyDefeatEffect(state, enemyId) {
  const charter = getSelectedAct3Charter(state);
  if (!charter || charter.id !== 'relay' || !isAct3CharterCompleted(state, 'relay')) return null;
  if (enemyId !== charter.relayEnemyId || state.charter?.relayRefilled) return null;
  const before = state.magic.mp;
  state.magic.mp = state.magic.maxMp;
  state.charter = { ...state.charter, relayRefilled: true };
  return Object.freeze({
    id: 'relay-refill',
    label: `灯塔接力完成：MP 从 ${before} 恢复至 ${state.magic.mp}/${state.magic.maxMp}。`,
    beforeMp: before,
    afterMp: state.magic.mp
  });
}

export function getAct3CharterBriefing(state) {
  const selected = getSelectedAct3Charter(state);
  return Object.freeze({
    id: ACT3_CHARTERS_ID,
    free: true,
    requiredBeforeF21Exit: !state?.charter?.legacyOpen,
    selectedId: selected?.id ?? null,
    completedId: state?.charter?.completedId ?? null,
    entries: Object.freeze(ACT3_CHARTERS.map((charter) => Object.freeze({
      ...charter,
      selected: selected?.id === charter.id,
      completed: state?.charter?.completedId === charter.id,
      locked: Boolean(selected && selected.id !== charter.id)
    })))
  });
}
