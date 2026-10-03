// A separate, cancellable tactical lifecycle. It never edits story markers,
// gameplay state, difficulty identity, or persistence sessions.
export const TACTICAL_STARTUP_TIMEOUT_MS = 25_000;

export function createTacticalStartup({ createScene, prepareVisuals, prepareFrame = async () => {}, onReady, onCancel, timeoutMs = TACTICAL_STARTUP_TIMEOUT_MS }) {
  const shell = document.querySelector('#app-shell');
  const root = document.querySelector('#tactical-loading');
  const title = root.querySelector('[data-loading-title]');
  const copy = root.querySelector('[data-loading-copy]');
  const retry = root.querySelector('[data-loading-retry]');
  let phase = 'idle', generation = 0, promise = null, scene = null, timer = null;
  let rejectCancelled = null;
  const isCurrent = id => generation === id && phase === 'loading';
  const conceal = () => {
    shell.inert = true;
    shell.setAttribute('aria-busy', 'true');
    document.documentElement.classList.add('tactical-loading');
    root.hidden = false;
  };
  const cleanup = () => {
    window.clearTimeout(timer);
    timer = null;
    scene?.destroy?.();
    scene = null;
  };
  const start = () => {
    if (phase === 'loading' || phase === 'ready') return promise;
    if (phase === 'cancelled') return Promise.resolve(false);
    phase = 'loading';
    const id = ++generation;
    conceal();
    root.dataset.phase = 'loading';
    title.textContent = '塔影渐明';
    copy.textContent = '正在准备眼前这一层…';
    retry.hidden = true;
    const cancelled = new Promise((_, reject) => { rejectCancelled = reject; });
    const deadline = new Promise((_, reject) => {
      timer = window.setTimeout(() => reject(new Error('加载时间较长，请检查连接后重试')), timeoutMs);
    });
    promise = (async () => {
      try {
        const work = (async () => {
          const created = await createScene();
          if (!isCurrent(id)) { created?.destroy?.(); return; }
          scene = created;
          await Promise.all([scene.start(), prepareVisuals()]);
          if (isCurrent(id)) await prepareFrame(created);
        })();
        await Promise.race([work, deadline, cancelled]);
        if (!isCurrent(id)) return false;
        // All renderer wrappers and decoded pixels are in place before this
        // final hidden paint. There is no artificial minimum loading duration.
        scene.refresh?.();
        onReady?.(scene);
        if (!isCurrent(id)) return false;
        window.clearTimeout(timer);
        phase = 'ready';
        root.dataset.phase = 'ready';
        shell.removeAttribute('aria-busy');
        // Do not unlock an unrelated/new GAL opened while requests were pending.
        shell.inert = !document.querySelector('#gal-root').classList.contains('hidden');
        document.documentElement.classList.remove('tactical-loading');
        document.documentElement.classList.add('tactical-entered');
        root.hidden = true;
        return true;
      } catch (error) {
        if (!isCurrent(id)) return false;
        cleanup();
        phase = 'error';
        root.dataset.phase = 'error';
        title.textContent = '这一层还没准备好';
        copy.textContent = `必要画面未能完整载入。${error.message}。可以重试，或返回入口；当前进度不会因重试被重置。`;
        retry.hidden = false;
        retry.focus({ preventScroll: true });
        return false;
      } finally {
        if (generation === id) rejectCancelled = null;
      }
    })();
    return promise;
  };
  const cancel = () => {
    if (phase === 'cancelled') return;
    phase = 'cancelled';
    generation += 1;
    rejectCancelled?.(new Error('加载已取消'));
    rejectCancelled = null;
    cleanup();
    // A same-URL history event or a cancelled navigation must not leave a
    // blank map or an endless spinner. Only explicit return navigation remains.
    {
      conceal();
      root.dataset.phase = 'cancelled';
      title.textContent = '加载已取消';
      copy.textContent = '当前进度保留。返回入口后可以重新继续。';
      retry.hidden = true;
    }
    onCancel?.();
  };
  retry.addEventListener('click', () => { void start(); });
  root.querySelector('[data-loading-exit]').addEventListener('click', cancel);
  for (const event of ['pagehide', 'beforeunload', 'popstate']) window.addEventListener(event, cancel);
  return { start, cancel, get phase() { return phase; }, get blocked() { return phase !== 'idle' && phase !== 'ready'; } };
}
