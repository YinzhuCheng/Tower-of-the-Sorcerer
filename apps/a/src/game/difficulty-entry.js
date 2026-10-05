import { PROFILES, LEGACY_PROFILES, getDifficultyProfile, configureDifficultySession } from './difficulty-session.js';
import { createDifficultyPersistence, inspectDifficultyStorage } from './difficulty-storage.js';
export const LEGACY_FORGIVING_ID = 'forgiving-r1';
export function legacyForgivingExports(storage) {
  const snapshot = inspectDifficultyStorage(storage, LEGACY_FORGIVING_ID);
  const exports = ['auto', 'manual'].flatMap(slot => typeof snapshot.slots[slot].raw === 'string'
    ? [{ slot, raw: snapshot.slots[slot].raw, label: `旧版${slot === 'auto' ? '自动' : '手动'}存档（原始文件）` }] : []);
  try {
    const persistence = createDifficultyPersistence(storage, LEGACY_FORGIVING_ID, snapshot, { locks: null });
    for (const backup of persistence.listBackups()) exports.push({ ...backup, label: `旧版备份：${backup.label}` });
  } catch { /* Unreadable archives must never stop the independent current slots. */ }
  return { snapshot, exports };
}
function exportOriginalSave(raw, filename, document, window) {
  const url = window.URL.createObjectURL(new window.Blob([raw], { type: 'application/json;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = filename;
  document.body.append(link);
  try { link.click(); } finally { link.remove(); window.setTimeout(() => window.URL.revokeObjectURL(url), 1000); }
}
const escape = text => String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function chooseDifficulty({ document = globalThis.document, window = globalThis.window, storage = null } = {}) {
  if (!storage) {
    try { storage = window.localStorage; } catch (error) { storage = { getItem() { throw error; } }; }
  }
  const requested = new URL(window.location.href).searchParams.get('difficulty');
  const initial = Object.fromEntries(Object.keys({ ...PROFILES, ...LEGACY_PROFILES }).map(id => [id, inspectDifficultyStorage(storage,id)]));
  const start = async (id, mode, isCurrent = () => true) => {
    // Inspect again, at the instant of the explicit decision. No stale picker snapshot writes.
    const profile = getDifficultyProfile(id);
    if (!profile) throw Error('未知难度，原存档未改动。');
    if (profile.resumeOnly && mode !== 'continue') throw Error('旧版宽容仅用于继续原存档。');
    const snapshot = inspectDifficultyStorage(storage,id);
    const persistence = createDifficultyPersistence(storage,id,snapshot);
    const selected = snapshot.slots.auto.status === 'valid' ? snapshot.slots.auto : snapshot.slots.manual.status === 'valid' ? snapshot.slots.manual : null;
    if (mode === 'continue' && !selected) throw Error('没有可继续的兼容存档。');
    if (mode === 'new') await persistence.prepareNew({ isCurrent });
    if (!isCurrent()) throw Error('启动已取消，原存档未改动。');
    const session = configureDifficultySession({ profileId:id, mode, serialized:mode === 'continue' ? selected.raw : null, persistence });
    const url = new URL(window.location.href); url.searchParams.set('difficulty',id);
    window.history.replaceState(null,'',url);
    document.documentElement.dataset.difficulty = id;
    return session;
  };
  // A profile URL means resume that profile only, never silently begin/reset a run.
  if (getDifficultyProfile(requested) && initial[requested].hasSave) return Promise.resolve(start(requested,'continue'));
  return new Promise(resolve => {
    let started = false, confirmation = null, generation = 0, legacyExports = [];
    const root = document.createElement('section');
    root.id = 'difficulty-entry'; root.className = 'difficulty-entry'; root.setAttribute('role','dialog'); root.setAttribute('aria-modal','true'); root.setAttribute('aria-label','选择魔塔难度');
    let notice = requested && !getDifficultyProfile(requested) ? '链接中的难度无法识别。请选择有效难度；已有存档未改动。' : '';
    const render = () => {
      const legacy = legacyForgivingExports(storage);
      legacyExports = legacy.exports;
      const legacyPanel = p => p.id !== 'forgiving' || !(legacy.snapshot.hasSave || legacy.snapshot.blocked || legacyExports.length) ? '' : `<div class="difficulty-legacy"><p>检测到旧版宽容 r1 的进度或备份。继续旧档仍使用旧版参数；新版 r2 另存，不会转换或覆盖旧档。</p>${legacy.snapshot.blocked ? '<p>旧版有不兼容、损坏或无法读取的存档；可读取的原始文件仍可导出，有效进度仅只读继续。</p>' : ''}<div class="difficulty-actions"><button data-action="continue" data-id="${LEGACY_FORGIVING_ID}" ${legacy.snapshot.hasSave ? '' : 'disabled'}>继续旧版宽容 r1</button></div>${legacyExports.length ? `<details><summary>导出旧版原始存档与备份（${legacyExports.length}）</summary>${legacyExports.map((save,index) => `<button data-action="export-legacy" data-index="${index}">${escape(save.label)}</button>`).join('')}</details>` : ''}</div>`;
      root.innerHTML = `<div class="difficulty-card"><span class="eyebrow">LOST MAGIC TOWER · A</span><h1>选择这一轮的难度</h1><p>三档共享完整剧情、地图与准确战斗预判。难度在本轮启动时确定。</p><p class="difficulty-notice" role="status">${escape(notice)}</p>${started ? `<h2>正在安全启动……</h2><p>等待存档写锁，原进度尚未替换。</p><button data-action="cancel">取消启动</button>` : confirmation ? `<h2>开始${PROFILES[confirmation].label}新游戏？</h2><p>该档原自动与手动存档将先备份，再开始新的自动进度。手动存档保留到你再次手动保存；其它难度不变。</p><div class="difficulty-actions"><button data-action="cancel">取消</button><button class="primary" data-action="confirm" data-id="${confirmation}">备份并开始新游戏</button></div>` : `<div class="difficulty-options">${Object.values(PROFILES).map(p=> {
        const s=inspectDifficultyStorage(storage,p.id); const valid=s.slots.auto.status === 'valid' ? s.slots.auto : s.slots.manual;
        return `<section class="difficulty-option${requested===p.id?' selected':''}"><h2>${p.label}</h2><p>${p.description}</p><p class="difficulty-save-status">${s.hasSave ? `已有进度：第 ${valid.state.floor+1} 层${s.blocked?'（只读）':''}` : '尚无可继续的进度'}${s.blocked ? '<br>检测到不兼容或损坏存档，已保护原内容；禁止新局覆盖。':''}</p><div class="difficulty-actions"><button data-action="continue" data-id="${p.id}" ${!s.hasSave?'disabled':''}>继续${p.label}</button><button data-action="new" data-id="${p.id}" ${s.blocked?'disabled':''}>新游戏</button></div>${legacyPanel(p)}</section>`;
      }).join('')}</div><p class="difficulty-footnote">宽容新版 r2、旧版 r1 与挑战各自保存。旧版 r1 只供继续原档；经典可读取原有魔塔存档。这里的选择和取消不会写入进度。使用前请关闭旧版魔塔标签页；旧版不参与本版的多标签写锁。</p>`}</div>`;
      root.querySelector('button:not([disabled])')?.focus();
    };
    root.addEventListener('click',async event => {
      const button=event.target.closest('button[data-action]'); if (!button || button.disabled) return;
      const {action,id}=button.dataset;
      if (action === 'export-legacy') {
        const item = legacyExports[Number(button.dataset.index)];
        if (!item) return;
        try { exportOriginalSave(item.raw, `魔塔-旧版宽容-r1-${item.slot}-${Number(button.dataset.index) + 1}.json`, document, window); }
        catch (error) { notice = `导出未完成，原存档未改动：${error.message}`; render(); }
        return;
      }
      if (action==='cancel') { generation++; started=false; confirmation=null; notice='已取消，存档未改动。'; render(); return; }
      if (started) return;
      if (action==='new' && inspectDifficultyStorage(storage,id).hasSave) { confirmation=id; render(); return; }
      const token = ++generation;
      try {
        started=true; render();
        const session=await start(id,action==='continue'?'continue':'new', () => token === generation);
        root.remove(); document.documentElement.classList.remove('difficulty-boot'); resolve(session);
      } catch(error) { if (token !== generation) return; started=false; confirmation=null; notice=error.message; render(); }
    });
    root.addEventListener('keydown',event => { if(event.key==='Escape' && (confirmation || started)) {event.preventDefault();generation++;started=false;confirmation=null;notice='已取消，存档未改动。';render();} });
    for (const event of ['pagehide','beforeunload','popstate']) window.addEventListener(event, () => { generation++; started=false; });
    document.documentElement.classList.add('difficulty-boot'); document.body.append(root); render();
  });
}
export function difficultyEntryUrl(href) { const url=new URL(href); for(const key of ['difficulty','gal-only','gal-preview'])url.searchParams.delete(key); return url.href; }

export function showDifficultyBootFailure(error, { document = globalThis.document, window = globalThis.window } = {}) {
  document.querySelector('#difficulty-entry')?.remove();
  const root = document.createElement('section'); root.className = 'difficulty-entry'; root.id = 'difficulty-boot-error';
  const card = document.createElement('div'); card.className = 'difficulty-card';
  const title = document.createElement('h1'); title.textContent = '启动未完成';
  const note = document.createElement('p'); note.textContent = `游戏模块加载失败。请回到入口重试；此错误页不会清除或重写存档。${error?.message ?? ''}`;
  const back = document.createElement('button'); back.textContent = '返回入口'; back.addEventListener('click', () => window.location.assign(difficultyEntryUrl(window.location.href)));
  card.append(title,note,back); root.append(card); document.body.append(root);
}
