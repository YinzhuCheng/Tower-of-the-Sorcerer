// Presentation-only reading tools. Never receives a session/reducer/save writer.
// History is a snapshot of this resolved scene up to the displayed turn only.
export function forestGalReadRows(scene, turnIndex, choicePrompt = '') {
 if (!scene?.turns?.length) return [];
 const end = Math.max(0, Math.min(scene.turns.length - 1, Number.isInteger(turnIndex) ? turnIndex : 0));
 return scene.turns.slice(0, end + 1).map((turn, index) => ({
  id: turn.id, index, speaker: turn.speaker || '旁白',
  text: turn.kind === 'choice-prompt' ? choicePrompt : turn.text,
  response: turn.choiceResolved ? turn.choices?.find(choice => choice.id === turn.choiceResolved)?.label || '' : '',
  current: index === end
 }));
}

// The in-flow hint cannot cover dialogue or leave the dialog viewport. Touch
// users may hold an icon to inspect it without triggering its normal action.
export function createForestGalTooltips(body, { schedule = (fn, ms) => setTimeout(fn, ms), cancel = id => clearTimeout(id) } = {}) {
 const hint = body.querySelector?.('#story-tool-help');
 if (!hint) return Object.freeze({ reset() {} });
 const buttons = [...body.querySelectorAll('[data-story-help]')];
 let active = null, hovered = null, focused = null, timer = null, press = null, suppressClick = null;
 const stopTimer = () => { if (timer != null) cancel(timer); timer = null; };
 function hide() {
  active?.removeAttribute('aria-describedby'); active = null;
  hint.hidden = true; hint.textContent = '';
 }
 function show(button) {
  hide();
  if (!button || button.disabled || body.hidden || body.inert) return;
  active = button; hint.textContent = button.dataset.storyHelp; hint.hidden = false;
  button.setAttribute('aria-describedby', hint.id);
 }
 function reset() { stopTimer(); press = suppressClick = hovered = focused = null; hide(); }
 body.addEventListener?.('pointerdown', event => { if (!event.target?.closest?.('[data-story-help]')) reset(); });
 for (const button of buttons) {
  button.addEventListener('pointerenter', event => { if (event.pointerType === 'touch') return; hovered = button; show(button); });
  button.addEventListener('pointerleave', event => { if (event.pointerType === 'touch') return; hovered = null; show(focused); });
  button.addEventListener('focus', () => { focused = button; show(button); });
  button.addEventListener('blur', () => { focused = null; show(hovered); });
  button.addEventListener('pointerdown', event => {
   stopTimer(); suppressClick = null;
   if (event.pointerType !== 'touch' || button.disabled) return;
   press = { button, x: event.clientX, y: event.clientY };
   timer = schedule(() => { timer = null; if (press?.button === button) { suppressClick = button; show(button); } }, 450);
  });
  button.addEventListener('pointermove', event => {
   if (press?.button === button && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) { stopTimer(); press = null; suppressClick = button; hide(); }
  });
  button.addEventListener('pointerup', () => { stopTimer(); press = null; });
  // Keep the canceled gesture disarmed until its trailing click is consumed.
  // A fresh pointerdown or keydown starts a new intentional activation.
  button.addEventListener('pointercancel', () => { stopTimer(); press = null; suppressClick = button; hide(); });
  button.addEventListener('keydown', () => { stopTimer(); press = suppressClick = null; });
  button.addEventListener('contextmenu', event => { if (press?.button === button || suppressClick === button) event.preventDefault(); });
  button.addEventListener('click', event => {
   if (suppressClick !== button) return;
   suppressClick = null; event.preventDefault(); event.stopImmediatePropagation();
  }, true);
 }
 return Object.freeze({ reset });
}

export function createForestGalReader(nodes, { createElement = tag => document.createElement(tag) } = {}) {
 const { dialog, stage, body, historyButton, historyPanel, historyEntries, historyClose, hideButton, restoreButton, historyTitle } = nodes;
 const tooltips = createForestGalTooltips(body);
 let mode = 'reading', currentScene = null, rows = [];
 const focus = node => node?.focus?.({ preventScroll: true });
 function setMode(next, { returnFocus = true } = {}) {
  tooltips.reset();
  const previous = mode;
  mode = next;
  dialog.dataset.readerMode = mode;
  const history = mode === 'history', artOnly = mode === 'art';
  body.hidden = artOnly;
  body.inert = history;
  stage.inert = history || artOnly;
  historyPanel.hidden = !history;
  restoreButton.hidden = !artOnly;
  historyButton.setAttribute('aria-expanded', String(history));
  hideButton.setAttribute('aria-pressed', String(artOnly));
  // In pure-art mode the hidden dialogue must not be announced as a description.
  if (artOnly || history) dialog.removeAttribute('aria-describedby');
  else dialog.setAttribute('aria-describedby', 'story-copy');
  if (history) focus(historyClose);
  else if (artOnly) focus(restoreButton);
  else if (returnFocus && previous !== 'reading') focus(previous === 'history' ? historyButton : hideButton);
 }
 function drawHistory() {
  historyEntries.replaceChildren();
  for (const row of rows) {
   const item = createElement('li'), name = createElement('span'), text = createElement('p');
   item.dataset.turnId = row.id;
   if (row.current) item.setAttribute('aria-current', 'true');
   name.className = 'story-history-speaker'; name.textContent = row.speaker;
   text.textContent = row.text; item.append(name, text);
   if (row.response) { const response = createElement('p'); response.className = 'story-history-response'; response.textContent = `已选：${row.response}`; item.append(response); }
   historyEntries.append(item);
  }
  historyEntries.scrollTop = historyEntries.scrollHeight;
 }
 // Handle the nested view before the native dialog close request. Escape
 // is caught at the owning document because native Tab may focus BODY while
 // the modal remains open. Only this open modal's nested view is intercepted.
 const escapeTarget = dialog.ownerDocument || dialog;
 let escapeHeld = false;
 escapeTarget.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (dialog.open === false) { escapeHeld = false; return; }
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
  if (!escapeHeld && mode === 'reading') return;
  event.preventDefault(); event.stopPropagation?.();
  if (escapeHeld || event.repeat) return;
  escapeHeld = true; setMode('reading');
 }, true);
 escapeTarget.addEventListener('keyup', event => { if (event.key === 'Escape') escapeHeld = false; }, true);
 // Window deactivation can lose keyup; never carry that old gesture into a new focus session.
 dialog.ownerDocument?.defaultView?.addEventListener?.('blur', () => { escapeHeld = false; });
 dialog.addEventListener('cancel', event => {
  if (!escapeHeld) return; // System back/cancel still uses the existing app route.
  event.preventDefault(); event.stopImmediatePropagation?.();
 }, true);
 historyButton.onclick = () => { setMode('history'); drawHistory(); };
 historyClose.onclick = () => setMode('reading');
 hideButton.onclick = () => setMode('art');
 restoreButton.onclick = () => setMode('reading');
 dialog.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target?.tagName || '') || event.target?.isContentEditable) return;
  if (event.key?.toLowerCase() === 'h' && mode !== 'history') {
   event.preventDefault(); event.stopPropagation?.(); setMode(mode === 'art' ? 'reading' : 'art');
  }
 });
 return Object.freeze({
  sync(scene, turnIndex, choicePrompt) {
   if (currentScene !== scene) { escapeHeld = false; currentScene = scene; setMode('reading', { returnFocus: false }); }
   rows = forestGalReadRows(scene, turnIndex, choicePrompt);
   historyTitle.textContent = scene?.title || '本段回顾';
   dialog.dataset.narration = String(!scene?.turns?.[turnIndex]?.portrait);
   if (mode === 'history') drawHistory();
  },
  dismiss() { if (mode === 'reading') return false; setMode('reading'); return true; },
  reset() { escapeHeld = false; currentScene = null; rows = []; setMode('reading', { returnFocus: false }); historyEntries.replaceChildren(); },
  get mode() { return mode; }
 });
}
