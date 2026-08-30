/**
 * 自愿见证契约
 *
 * These are deliberately records of a stricter, fully-public objective, not
 * a second reward economy.  A player may sign one after reaching Act II; the
 * ordinary campaign remains winnable whether it is completed or missed.
 *
 * Every requirement is exposed before the player spends a resource.  In
 * particular, a contract never asks for hidden enemy data or a blind route.
 */

import { getAllianceBond, isAllianceBonded } from './alliance-bonds.js';
import { enumerateWarCouncilPlans } from './war-council.js';

export const CHALLENGE_CONTRACTS_ID = 'witness-contracts-v1';

export const CHALLENGE_CONTRACTS = Object.freeze([
  Object.freeze({
    id: 'red-witness',
    title: '赤焰见证',
    allyId: 'yanli',
    difficulty: '严苛',
    summary: '完成「赤焰蓄能」，并让龙姬·焰璃成为会战幸存者。',
    detail: 'F15 档案封卷后的蓄能书库是可选路线；会战必须在公开 MP 题中留下焰璃。'
  }),
  Object.freeze({
    id: 'tide-witness',
    title: '潮汐见证',
    allyId: 'lanin',
    difficulty: '极严苛',
    summary: '完成「潮汐导管」，并让深蓝歌姬·澜音成为会战幸存者。',
    detail: 'F13 星导管需要预先保留星蚀卡；会战中的澜音残局窗口比常规胜利更窄。'
  }),
  Object.freeze({
    id: 'shadow-witness',
    title: '影线见证',
    allyId: 'yayu',
    difficulty: '极严苛',
    summary: '完成「影线校准」，并让影织姬·鸦羽成为会战幸存者。',
    detail: '签署影线路线后，F16 镜泉宝库会成为必须完成的高压远征；会战必须把鸦羽保留到最后的支援位。'
  })
]);

const CONTRACT_BY_ID = new Map(CHALLENGE_CONTRACTS.map((contract) => [contract.id, contract]));

function cloneResult(result) {
  if (!result || typeof result !== 'object') return null;
  if (result.status !== 'completed' && result.status !== 'missed') return null;
  return {
    status: result.status,
    bondComplete: result.bondComplete === true,
    survivorPresent: result.survivorPresent === true,
    missing: Array.isArray(result.missing) ? [...new Set(result.missing.filter(Boolean))] : []
  };
}

export function createChallengeState() {
  return { selectedId: null, result: null };
}

export function normalizeChallengeState(value) {
  const selectedId = CONTRACT_BY_ID.has(value?.selectedId) ? value.selectedId : null;
  return {
    selectedId,
    result: selectedId ? cloneResult(value?.result) : null
  };
}

export function getChallengeContract(id) {
  return CONTRACT_BY_ID.get(id) ?? null;
}

export function getSelectedChallengeContract(state) {
  return getChallengeContract(state?.challenge?.selectedId);
}

/** A signed contract is intentionally irrevocable for this run.  This keeps
 * it a real replay goal, while a missed contract never blocks the normal
 * campaign or consumes cards, gold, HP, MP, turns or items. */
export function selectChallengeContract(state, contractId) {
  const contract = getChallengeContract(contractId);
  if (!contract) return { ok: false, reason: '未知的见证契约。' };
  if (!Number.isInteger(state?.floor) || state.floor < 10) {
    return { ok: false, reason: '见证契约在第十一阵进入第二章后才可签署。' };
  }
  if (state?.council?.completed) return { ok: false, reason: '王座前会战已经结束，不能再签署见证契约。' };
  if (state?.challenge?.selectedId) return { ok: false, reason: '本轮已经签署见证契约；它会在王座前会战后结算。' };
  state.challenge = { selectedId: contract.id, result: null };
  return { ok: true, contract };
}

function resultFor(state, contract) {
  const bond = getAllianceBond(contract.allyId);
  const survivors = state?.council?.outcome?.survivors ?? [];
  const bondComplete = isAllianceBonded(state, contract.allyId);
  const survivorPresent = survivors.some((unit) => unit?.id === contract.allyId);
  const missing = [
    ...(bondComplete ? [] : [`未完成「${bond?.title ?? '盟友信物'}」`]),
    ...(survivorPresent ? [] : [`${bond?.allyId === 'yanli' ? '焰璃' : bond?.allyId === 'lanin' ? '澜音' : '鸦羽'}未在会战中存活`])
  ];
  return {
    status: bondComplete && survivorPresent ? 'completed' : 'missed',
    bondComplete,
    survivorPresent,
    missing
  };
}

/** Pure council-preview counterpart to settlement.  It lets the player see
 * whether the currently displayed order and MP allocation would satisfy the
 * signed record before confirming the encounter. */
export function previewChallengeContract(state, councilReport) {
  const contract = getSelectedChallengeContract(state);
  if (!contract) return null;
  const bond = getAllianceBond(contract.allyId);
  const bondComplete = isAllianceBonded(state, contract.allyId);
  const survivorPresent = Boolean(councilReport?.won)
    && (councilReport?.survivors ?? []).some((unit) => unit?.id === contract.allyId);
  const missing = [
    ...(bondComplete ? [] : [`未完成「${bond?.title ?? '盟友信物'}」`]),
    ...(survivorPresent ? [] : [`${bond?.allyId === 'yanli' ? '焰璃' : bond?.allyId === 'lanin' ? '澜音' : '鸦羽'}不会作为会战幸存者`])
  ];
  return Object.freeze({
    contract,
    status: bondComplete && survivorPresent ? 'would-complete' : 'would-miss',
    bondComplete,
    survivorPresent,
    missing: Object.freeze(missing)
  });
}

/** Called by the authoritative council resolver only after a winning result.
 * It records an already-achieved condition and never changes combat values. */
export function settleChallengeContract(state) {
  const contract = getSelectedChallengeContract(state);
  if (!contract) return null;
  const result = resultFor(state, contract);
  state.challenge = { selectedId: contract.id, result };
  return { contract, result };
}

/** Read-only briefing for the contract board and the free route intel. */
export function getChallengeContractBriefing(state) {
  const selected = getSelectedChallengeContract(state);
  const plans = enumerateWarCouncilPlans(state, { winningOnly: true });
  const entries = CHALLENGE_CONTRACTS.map((contract) => {
    const bond = getAllianceBond(contract.allyId);
    const matchingPlanCount = plans.filter((report) => report.survivors.some((unit) => unit.id === contract.allyId)).length;
    return Object.freeze({
      ...contract,
      bondTitle: bond?.title ?? null,
      bondRoute: bond?.route ?? null,
      bondComplete: isAllianceBonded(state, contract.allyId),
      matchingPlanCount,
      totalWinningPlanCount: plans.length,
      selected: selected?.id === contract.id,
      result: selected?.id === contract.id ? cloneResult(state?.challenge?.result) : null
    });
  });
  return Object.freeze({
    id: CHALLENGE_CONTRACTS_ID,
    free: true,
    locked: Boolean(state?.council?.completed || selected),
    selectedId: selected?.id ?? null,
    entries: Object.freeze(entries)
  });
}
