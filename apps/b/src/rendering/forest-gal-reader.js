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

export function createForestGalReader(nodes, { createElement = tag => document.createElement(tag) } = {}) {
 const { dialog, stage, body, historyButton, historyPanel, historyEntries, historyClose, hideButton, restoreButton, historyTitle } = nodes;
 let mode = 'reading', currentScene = null, rows = [];
 const focus = node => node?.focus?.({ preventScroll: true });
 function setMode(next, { returnFocus = true } = {}) {
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
   if (currentScene !== scene) { currentScene = scene; setMode('reading', { returnFocus: false }); }
   rows = forestGalReadRows(scene, turnIndex, choicePrompt);
   historyTitle.textContent = scene?.title || '本段回顾';
   dialog.dataset.narration = String(!scene?.turns?.[turnIndex]?.portrait);
   if (mode === 'history') drawHistory();
  },
  dismiss() { if (mode === 'reading') return false; setMode('reading'); return true; },
  reset() { currentScene = null; rows = []; setMode('reading', { returnFocus: false }); historyEntries.replaceChildren(); },
  get mode() { return mode; }
 });
}
