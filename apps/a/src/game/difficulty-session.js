// One immutable runtime identity per document. This module imports no engine.
export const CANDIDATE_VERSION = 'tower-three-tiers-r1';
export const CAMPAIGN_ID = 'demo-30f-afterlight-registry-v1';
export const PROFILES = Object.freeze({
  forgiving: Object.freeze({ id: 'forgiving', label: '宽容', revisionLabel: '宽容 · 新版 r2', candidateVersion: 'tower-forgiving-r2', contentHash: '52bf838bcf879eb1', dataChecksum: '228fcff017b15f83', description: '第一幕静咏者的魔法消耗降低，第二幕两处普通敌人的消耗略低。新版进度独立保存。' }),
  classic: Object.freeze({ id: 'classic', label: '经典', contentHash: 'bce284f9326a5f58', dataChecksum: '0c3618a149596c7a', description: '保留当前经典数值与已有存档，适合完整体验路线规划。' }),
  challenge: Object.freeze({ id: 'challenge', label: '挑战', contentHash: '731b5e972791ef4d', dataChecksum: '5175a7771022a90f', description: '第三幕生命补给略少，需要重新规划后段资源。' })
});
// Compatibility data only: one engine, three new-game choices, no save migration.
export const LEGACY_PROFILES = Object.freeze({
  'forgiving-r1': Object.freeze({ id: 'forgiving-r1', identityProfileId: 'forgiving', label: '宽容（旧版 r1）', resumeOnly: true, candidateVersion: CANDIDATE_VERSION, contentHash: '6f9bbbad0bb58045', dataChecksum: 'b0feb01841ebb867' })
});
export function getDifficultyProfile(id) {
  return Object.hasOwn(PROFILES, id) ? PROFILES[id] : Object.hasOwn(LEGACY_PROFILES, id) ? LEGACY_PROFILES[id] : null;
}
export function profileIdentity(id) {
  const p = getDifficultyProfile(id);
  if (!p) throw Error('未知难度，原存档未改动。');
  return Object.freeze({ format: 'tower-profile-identity-v1', campaignId: CAMPAIGN_ID, profileId: p.identityProfileId ?? p.id, candidateVersion: p.candidateVersion ?? CANDIDATE_VERSION, contentHash: p.contentHash, gameVersion: 10 });
}
let session = null;
export function configureDifficultySession({ profileId, mode, serialized = null, persistence = null }) {
  if (session) throw Error('本页难度已经确定，请回到入口重新选择。');
  if (!['new', 'continue'].includes(mode)) throw Error('未知启动方式。');
  const identity = profileIdentity(profileId), profile = getDifficultyProfile(profileId);
  if (profile.resumeOnly && mode !== 'continue') throw Error('旧版宽容仅用于继续原存档；新游戏请选择新版宽容。');
  if (mode === 'continue') parseProfileSave(serialized, profileId);
  session = Object.freeze({ profile, identity, mode, serialized, persistence });
  return session;
}
export const getDifficultySession = () => session;

const STATE_KEYS = new Set('version floor x y start stats cards magic council alliance doctrine charter handoff relics relicNames cores shopPurchases floorStates visitedFloors storySeen galSeen seenEnemies turns battles victory logs challenge profileIdentity'.split(' '));
const exactObject = (a, b) => a && typeof a === 'object' && !Array.isArray(a) && Object.keys(a).length === Object.keys(b).length && Object.entries(b).every(([k,v]) => a[k] === v);
export function validateProfileSave(state, id) {
  const identity = profileIdentity(id);
  if (!state || typeof state !== 'object' || Array.isArray(state)) throw Error('存档内容损坏。');
  if (Object.keys(state).some(key => !STATE_KEYS.has(key))) throw Error('存档含未知元数据，已保护原文件。');
  if (!Number.isInteger(state.version) || state.version < 1 || state.version > 10) throw Error('存档版本不受支持。');
  if (Object.hasOwn(state, 'profileIdentity')) {
    if (!exactObject(state.profileIdentity, identity) || state.version !== 10) throw Error('存档难度、版本或内容身份不匹配。');
  } else if (id !== 'classic') throw Error('无难度标记的旧存档只能在经典中读取。');
  const count = state.floorStates?.length;
  if (!Array.isArray(state.floorStates) || !(state.version === 10 ? count === 30 : [8,10,20,30].includes(count))) throw Error('存档不是受支持的魔塔战役。');
  if (!Number.isInteger(state.floor) || state.floor < 0 || state.floor >= count) throw Error('存档楼层无效。');
  if (!Number.isInteger(state.x) || !Number.isInteger(state.y) || state.x < 0 || state.y < 0 || state.x >= 11 || state.y >= 11) throw Error('存档位置无效。');
  if (!state.stats || !['hp','maxHp','atk','def','gold'].every(k => Number.isFinite(state.stats[k]) && state.stats[k] >= 0)) throw Error('存档资源损坏。');
  if (!state.cards || !['sun','moon','star'].every(k => Number.isFinite(state.cards[k]) && state.cards[k] >= 0)) throw Error('存档卡牌损坏。');
  if (!state.relics || !Array.isArray(state.logs) || !Array.isArray(state.storySeen)) throw Error('存档状态缺失。');
  for (const key of ['turns','battles','cores','shopPurchases']) {
    if (!Number.isSafeInteger(state[key]) || state[key] < 0 || state[key] > 1_000_000_000) throw Error('存档计数损坏。');
  }
  for (const key of ['logs','storySeen','galSeen','seenEnemies','relicNames']) {
    if (state[key] !== undefined && (!Array.isArray(state[key]) || state[key].some(value => typeof value !== 'string' || value.length > 20_000))) throw Error('存档文字字段损坏。');
  }
  if (!Array.isArray(state.visitedFloors) || state.visitedFloors.some(value => !Number.isInteger(value) || value < 0 || value >= count)) throw Error('存档到达楼层损坏。');
  if (!state.floorStates.every(f => Array.isArray(f?.map) && f.map.length === 11 && f.map.every(row => Array.isArray(row) && row.length === 11 && row.every(t => typeof t === 'string')))) throw Error('存档地图损坏。');
  return state;
}
export function parseProfileSave(serialized, id) { return validateProfileSave(JSON.parse(serialized), id); }
export function validateActiveSave(state) {
  if (session) validateProfileSave(state, session.profile.id);
  return state;
}
