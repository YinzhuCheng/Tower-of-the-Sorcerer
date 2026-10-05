import { CAMPAIGN_ID, getDifficultyProfile, parseProfileSave, profileIdentity, validateProfileSave } from './difficulty-session.js';
export function difficultyStorageKeys(id) {
  profileIdentity(id);
  const storageId = id === 'forgiving-r1' ? 'forgiving' : id;
  const revision = id === 'forgiving' ? ':revision:r2' : '';
  const scope = `lost-magic-tower:${CAMPAIGN_ID}${id === 'classic' ? '' : `:difficulty:${storageId}${revision}`}`;
  return Object.freeze({ auto: `${scope}:auto:v1`, manual: `${scope}:manual:v1`, backup: `${scope}:backup:before-new:v1` });
}
export function inspectDifficultyStorage(storage, id) {
  const keys = difficultyStorageKeys(id), slots = {};
  for (const slot of ['auto', 'manual']) {
    try {
      const raw = storage.getItem(keys[slot]);
      if (raw === null) slots[slot] = { raw, status: 'empty' };
      else { const state = parseProfileSave(raw, id); slots[slot] = { raw, status: 'valid', state }; }
    } catch (error) { slots[slot] = { raw: (() => { try { return storage.getItem(keys[slot]); } catch { return undefined; } })(), status: 'blocked', error: error.message }; }
  }
  return { keys, slots, blocked: Object.values(slots).some(s => s.status === 'blocked'), hasSave: Object.values(slots).some(s => s.status === 'valid') };
}
export function createDifficultyPersistence(storage, id, initial = inspectDifficultyStorage(storage, id), { locks = globalThis.navigator?.locks } = {}) {
  const keys = difficultyStorageKeys(id);
  const expected = Object.fromEntries(Object.entries(initial.slots).map(([k,v]) => [k,v.raw]));
  let blocked = initial.blocked || typeof locks?.request !== 'function';
  const assertWritable = () => {
    if (blocked) throw Error('原存档含不兼容内容或存储不可用，本次只读；请先导出保存。');
    for (const slot of ['auto','manual']) {
      const raw = storage.getItem(keys[slot]);
      if (raw !== expected[slot]) { blocked = true; throw Error('另一标签页已更新存档，本页停止写入。请回到入口重新载入。'); }
      if (raw !== null) parseProfileSave(raw, id);
    }
  };
  const withWriteLock = operation => {
    if (typeof locks?.request !== 'function') throw Error('浏览器不支持安全的多标签存档锁；本页只读。请在 HTTPS 的新版浏览器中打开。');
    try {
      const result = locks.request(`${keys.auto}:writer-lock`, { mode: 'exclusive' }, () => {
        assertWritable();
        return operation();
      });
      return result?.catch ? result.catch(error => { blocked = true; throw error; }) : result;
    } catch (error) { blocked = true; throw error; }
  };
  return Object.freeze({
    keys,
    get readOnly() { return blocked; },
    read(slot) { const raw = storage.getItem(keys[slot]); if (raw === null) return null; parseProfileSave(raw, id); return raw; },
    listBackups() {
      const results = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (typeof key !== 'string' || !key.startsWith(`${keys.backup}:`)) continue;
        const raw = storage.getItem(key);
        if (typeof raw !== 'string') continue;
        const fallback = () => results.push({ key, slot: 'archive', savedAt: '', floor: null, raw, compatible: false, label: '原始备份容器 · 格式未知或损坏（仅导出）' });
        try {
          const saved = JSON.parse(raw);
          if (!saved || saved.format !== 'tower-before-new-backup-v1' || Object.keys(saved).some(k => !['format','identity','savedAt','auto','manual'].includes(k)) || JSON.stringify(saved.identity) !== JSON.stringify(profileIdentity(id))) { fallback(); continue; }
          const savedAt = typeof saved.savedAt === 'string' && saved.savedAt.length <= 50 ? saved.savedAt : '';
          let recognized = false;
          for (const slot of ['auto','manual']) if (typeof saved[slot] === 'string') {
            recognized = true;
            try {
              const state = parseProfileSave(saved[slot],id);
              results.push({ key, slot, savedAt, floor: state.floor, raw: saved[slot], compatible: true, label: `${savedAt || '日期未知'} · ${slot === 'auto' ? '自动' : '手动'} · 第 ${state.floor + 1} 层` });
            } catch {
              results.push({ key, slot, savedAt, floor: null, raw: saved[slot], compatible: false, label: `${savedAt || '日期未知'} · ${slot === 'auto' ? '自动' : '手动'} · 内容不兼容（仅导出）` });
            }
          }
          if (!recognized || ['auto','manual'].some(slot => saved[slot] !== null && typeof saved[slot] !== 'string')) fallback();
        } catch { fallback(); }
      }
      return results.sort((a,b) => b.savedAt.localeCompare(a.savedAt));
    },
    serialize(state) { validateProfileSave(state,id); return JSON.stringify({ ...state, profileIdentity: profileIdentity(id) }); },
    write(slot, state) {
      if (!['auto','manual'].includes(slot)) throw Error('Invalid save slot');
      // Capture exactly the state the caller chose, before waiting for the lock.
      const raw = this.serialize(state);
      return withWriteLock(() => {
        storage.setItem(keys[slot], raw); expected[slot] = raw;
      });
    },
    prepareNew({ isCurrent = () => true } = {}) {
      if (getDifficultyProfile(id).resumeOnly) throw Error('旧版宽容仅用于继续原存档，不能新建或覆盖。');
      return withWriteLock(() => {
      if (!isCurrent()) throw Error('启动已取消，原存档未改动。');
      // Back up original bytes first. Quota failure aborts without touching saves.
      if (expected.auto !== null || expected.manual !== null) {
        const backup = JSON.stringify({ format: 'tower-before-new-backup-v1', identity: profileIdentity(id), savedAt: new Date().toISOString(), auto: expected.auto, manual: expected.manual });
        // Never replace a prior backup. Each confirmed new game retains its own pair.
        let key = `${keys.backup}:${Date.now()}`, n = 0;
        while (storage.getItem(key) !== null) key = `${keys.backup}:${Date.now()}:${++n}`;
        storage.setItem(key, backup);
      }
      return true;
      });
    }
  });
}
