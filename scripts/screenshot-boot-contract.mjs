// DOM-only readiness contract for the synthetic floor-overview capture job.
// The opening GAL intentionally defers construction of the tactical canvas.
export function captureBootState(document, storage, autoSaveKey) {
  const canvas = document.querySelector('#game-container canvas');
  const gal = document.querySelector('#gal-root');
  const skip = document.querySelector('#gal-root [data-gal-control="skip"]');
  const loading = document.querySelector('#loading-note');
  const shell = document.querySelector('#app-shell');
  let saveValid = false;
  try {
    const saved = JSON.parse(storage.getItem(autoSaveKey) ?? 'null');
    saveValid = Boolean(saved && Array.isArray(saved.floorStates) && saved.floorStates.length >= 10);
  } catch { /* Return a failed readiness check, never erase a malformed save. */ }
  const canvasReady = Boolean(canvas && canvas.width > 0 && canvas.height > 0);
  const galVisible = Boolean(gal && !gal.classList.contains('hidden'));
  const loadingHidden = Boolean(loading?.classList.contains('hidden'));
  const shellActive = Boolean(shell && !shell.inert);
  return {
    canvasReady, saveValid, galVisible, loadingHidden, shellActive,
    openingCanSkip: Boolean(galVisible && skip && !skip.disabled),
    ready: Boolean(canvasReady && saveValid && !galVisible && loadingHidden && shellActive),
    loadingText: loading?.textContent?.slice(0, 240) ?? null
  };
}

export function captureBootExpression(autoSaveKey) {
  return `(${captureBootState.toString()})(document, localStorage, ${JSON.stringify(autoSaveKey)})`;
}

// Invoke the game's own finish callback; hiding a DOM panel never releases boot.
export const SKIP_OPENING_EXPRESSION = `(() => {
  const gal = document.querySelector('#gal-root');
  const skip = document.querySelector('#gal-root [data-gal-control="skip"]');
  if (!gal || gal.classList.contains('hidden') || !skip || skip.disabled) return false;
  skip.click();
  return true;
})()`;
