import { ENEMIES, FLOORS, GRID_SIZE, TILE_SIZE, getShopCost } from './game/data.js';
import {
  buyShopUpgrade,
  createInitialState,
  deserializeState,
  getAdjacentEnemyPreviews,
  getCodexEntries,
  getDialogue,
  getProgressPercent,
  getRelicLabels,
  getShopEffectMultiplier,
  getShopOptions,
  initialDialogue,
  resolveWarCouncil,
  serializeState,
  setMagicTier,
  teleportToFloor
} from './game/engine.js';
import {
  getRouteDoctrineBriefing,
  getSelectedRouteDoctrine,
  selectRouteDoctrine
} from './game/route-doctrines.js';
import {
  getAct3CharterBriefing,
  getSelectedAct3Charter,
  selectAct3Charter
} from './game/act3-charters.js';
import { describeMagicTier, getMagicTierCapacity, getMagicTierCost } from './game/magic-blade.js';
import {
  getWarCouncilAllies,
  simulateWarCouncil,
  WAR_COUNCIL_LOYALISTS,
  WAR_COUNCIL_MAX_MP_PER_ALLY,
  WAR_COUNCIL_MP_POOL,
  WAR_COUNCIL_MP_STEP
} from './game/war-council.js';
import { getEndingDebrief } from './game/ending-debrief.js';
import { combatRuleCopy, HELP_SECTIONS } from './game/player-copy.js';
import { createMagicTowerScene } from './game/scene.js';
import { createCanvasTowerScene } from './game/canvas-scene.js';
import { dialoguePresentation, hydratePortraits, portraitUrl } from './game/portraits.js';
import { applySceneThemeV8, installV8VisualLayer } from './game/visual-theme-v8.js';
import { applyV83RenderFixes, installV83UiFixes } from './game/visual-patch-v83.js';

const MANUAL_SAVE_KEY = 'lost-magic-tower:manual:v1';
const AUTO_SAVE_KEY = 'lost-magic-tower:auto:v1';

const $ = (selector) => document.querySelector(selector);
const elements = {
  loading: $('#loading-note'),
  floorNumber: $('#floor-number'),
  floorTitle: $('#floor-title'),
  hp: $('#stat-hp'),
  atk: $('#stat-atk'),
  def: $('#stat-def'),
  gold: $('#stat-gold'),
  sun: $('#card-sun'),
  moon: $('#card-moon'),
  star: $('#card-star'),
  magicTitle: $('#magic-title'),
  magicTierButton: $('#btn-magic-tier'),
  relicList: $('#relic-list'),
  preview: $('#battle-preview'),
  logList: $('#log-list'),
  doctrineButton: $('#btn-doctrine'),
  codexButton: $('#btn-codex'),
  teleportButton: $('#btn-teleport'),
  magicButton: $('#btn-magic'),
  modalRoot: $('#modal-root'),
  modalKicker: $('#modal-kicker'),
  modalTitle: $('#modal-title'),
  modalBody: $('#modal-body'),
  modalActions: $('#modal-actions'),
  modalClose: $('#modal-close'),
  galRoot: $('#gal-root')
};

let state = createInitialState();
let scene = null;
let modalClosable = true;
let toastTimer = null;
let cinematicCleanup = null;
let cinematicControls = null;
let galTransitionTimer = null;
const GAL_HISTORY_LIMIT = 80;
const galHistory = [];
const galImagePreloads = new Map();
const galSettings = { auto: false, fast: false };
const KEYBOARD_DIRECTIONS = Object.freeze({
  arrowup: 'up', w: 'up',
  arrowdown: 'down', s: 'down',
  arrowleft: 'left', a: 'left',
  arrowright: 'right', d: 'right'
});

const GAL_BACKDROPS = Object.freeze({
  night: '/assets/anime/themes/theme-night-tower.webp',
  sun: '/assets/anime/themes/theme-sun-sanctum.webp',
  ocean: '/assets/anime/themes/theme-ocean-archive.webp',
  forest: '/assets/anime/themes/theme-forest-approach.webp',
  redVein: '/assets/anime/themes/theme-red-vein.webp',
  starMirror: '/assets/anime/themes/theme-star-mirror.webp',
  echoCourt: '/assets/anime/themes/theme-echo-court.webp',
  originCore: '/assets/anime/themes/theme-origin-core.webp',
  ashRegistry: '/assets/anime/themes/theme-ash-registry.webp',
  archiveStorm: '/assets/anime/themes/theme-archive-storm.webp',
  emberLighthouse: '/assets/anime/themes/theme-ember-lighthouse.webp'
});

const GAL_TRANSITIONS = Object.freeze({
  witness: '/assets/anime/transitions/witness-entry.webp',
  boss: '/assets/anime/transitions/seal-shatter.webp',
  return: '/assets/anime/transitions/witness-entry.webp'
});

const GAL_BOSS_SCENES = new Set([
  'bossCatPreDemo', 'bossCatPostDemo', 'bossFoxPreDemo', 'bossFoxPostDemo',
  'bossWhalePreDemo', 'bossWhalePostDemo', 'bossSwordPreDemo', 'bossSwordPostDemo',
  'bossDragonPreDemo', 'bossDragonPostDemo', 'bossAstralPreDemo', 'bossAstralPostDemo',
  'bossShadowPreDemo', 'bossShadowPostDemo', 'bossPalacePreDemo', 'bossPalacePostDemo',
  'bossBlackSealPreDemo', 'bossBlackSealPostDemo', 'bossQueenPreDemo', 'queenPhaseDemo',
  'bossQueenPostDemo', 'floor19', 'bossEchoRegentPost', 'floor20',
  'bossArcaneSovereignPost', 'bossOriginCorePost', 'floor30', 'bossArchiveWardenPost'
]);

const GAL_DIALOGUE_BACKDROPS = Object.freeze({
  prologue: 'night',
  ending: 'emberLighthouse',
  bossCatPreDemo: 'forest', bossCatPostDemo: 'forest',
  bossFoxPreDemo: 'forest', bossFoxPostDemo: 'forest',
  bossWhalePreDemo: 'ocean', bossWhalePostDemo: 'ocean',
  bossSwordPreDemo: 'forest', bossSwordPostDemo: 'forest',
  bossDragonPreDemo: 'redVein', bossDragonPostDemo: 'redVein',
  bossAstralPreDemo: 'starMirror', bossAstralPostDemo: 'starMirror',
  bossShadowPreDemo: 'starMirror', bossShadowPostDemo: 'starMirror',
  bossPalacePreDemo: 'night', bossPalacePostDemo: 'night',
  bossBlackSealPreDemo: 'night', bossBlackSealPostDemo: 'night',
  bossQueenPreDemo: 'night', queenPhaseDemo: 'night', bossQueenPostDemo: 'night',
  bossEchoRegentPost: 'echoCourt',
  bossArcaneSovereignPost: 'originCore', bossOriginCorePost: 'originCore',
  bossArchiveWardenPost: 'emberLighthouse'
});

// A floor is a chapter of the same physical Tower, not a random world map.
// This table makes that rule executable: each witness-field owns one specific
// visual-novel scene, while stairs and the usual tower anchors bridge scenes.
const GAL_FLOOR_BACKDROPS = Object.freeze({
  1: 'forest', 2: 'forest', 3: 'forest', 4: 'forest',
  5: 'redVein', 6: 'ocean', 7: 'starMirror', 8: 'night', 9: 'night', 10: 'night',
  11: 'sun', 12: 'sun', 13: 'redVein', 14: 'sun', 15: 'starMirror', 16: 'ocean', 17: 'sun',
  18: 'ocean', 19: 'echoCourt', 20: 'originCore',
  21: 'ashRegistry', 22: 'ashRegistry', 23: 'ashRegistry', 24: 'ashRegistry', 25: 'ashRegistry',
  26: 'ashRegistry', 27: 'ashRegistry', 28: 'archiveStorm', 29: 'archiveStorm', 30: 'emberLighthouse'
});

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatNumber(value) {
  return Number.isFinite(value) ? Math.round(value).toLocaleString('zh-CN') : '∞';
}

function specialLabel(enemy) {
  return combatRuleCopy(enemy, { compact: true });
}

function showToast(message, duration = 1700) {
  clearTimeout(toastTimer);
  elements.loading.textContent = message;
  elements.loading.classList.remove('hidden');
  toastTimer = setTimeout(() => elements.loading.classList.add('hidden'), duration);
}

function initialGalDialogue(after = null) {
  const dialogueId = initialDialogue(state);
  if (!dialogueId) return false;
  // Persist the presentation marker immediately.  Otherwise a refresh after
  // the first line would make the prologue look randomly absent or replay it.
  autoSave();
  showDialogue(dialogueId, after);
  return true;
}

function editableKeyTarget(target) {
  return target instanceof Element
    && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function clearCinematic() {
  window.clearTimeout(galTransitionTimer);
  galTransitionTimer = null;
  cinematicCleanup?.();
  cinematicCleanup = null;
  cinematicControls = null;
  elements.modalRoot.classList.remove('gal-ui-hidden');
  elements.galRoot.classList.remove('is-entering', 'is-exiting');
  elements.galRoot.classList.add('hidden');
  elements.galRoot.classList.remove('gal-ui-hidden');
  document.body.classList.remove('gal-active');
  $('#app-shell').inert = false;
  delete elements.galRoot.dataset.transition;
  elements.galRoot.replaceChildren();
}

function galTransitionFor(dialogueId, dialogue) {
  if (dialogue.transition && GAL_TRANSITIONS[dialogue.transition]) return dialogue.transition;
  return GAL_BOSS_SCENES.has(dialogueId) ? 'boss' : 'witness';
}

function beginGalScene(transition) {
  window.clearTimeout(galTransitionTimer);
  galTransitionTimer = null;
  elements.galRoot.dataset.transition = transition;
  document.body.classList.add('gal-active');
  $('#app-shell').inert = true;
  elements.galRoot.classList.remove('hidden', 'is-exiting');
  elements.galRoot.classList.add('is-entering');
  galTransitionTimer = window.setTimeout(() => {
    elements.galRoot.classList.remove('is-entering');
    galTransitionTimer = null;
  }, 760);
}

function closeGalScene(after = null) {
  if (elements.galRoot.classList.contains('hidden')) {
    clearCinematic();
    after?.();
    return;
  }
  window.clearTimeout(galTransitionTimer);
  galTransitionTimer = null;
  cinematicCleanup?.();
  cinematicCleanup = null;
  cinematicControls = null;
  elements.galRoot.dataset.transition = 'return';
  elements.galRoot.classList.remove('is-entering', 'gal-ui-hidden');
  elements.galRoot.classList.add('is-exiting');
  galTransitionTimer = window.setTimeout(() => {
    galTransitionTimer = null;
    clearCinematic();
    after?.();
  }, 620);
}

function closeModal() {
  if (!modalClosable) return;
  clearCinematic();
  elements.modalRoot.classList.add('hidden');
  delete elements.modalRoot.dataset.variant;
  elements.modalBody.replaceChildren();
  elements.modalActions.replaceChildren();
}

function openModal({ kicker = '', title, body = '', actions = [], closable = true, afterOpen = null, variant = '' }) {
  clearCinematic();
  modalClosable = closable;
  if (variant) elements.modalRoot.dataset.variant = variant;
  else delete elements.modalRoot.dataset.variant;
  elements.modalKicker.textContent = kicker;
  elements.modalTitle.textContent = title;
  elements.modalBody.innerHTML = body;
  elements.modalActions.replaceChildren();
  elements.modalClose.style.visibility = closable ? 'visible' : 'hidden';

  for (const action of actions) {
    const button = document.createElement('button');
    button.textContent = action.label;
    if (action.className) button.className = action.className;
    button.disabled = Boolean(action.disabled);
    button.addEventListener('click', () => {
      if (action.close !== false) {
        modalClosable = true;
        closeModal();
      }
      action.onClick?.();
    });
    elements.modalActions.append(button);
  }

  elements.modalRoot.classList.remove('hidden');
  afterOpen?.();
}

function textToHtml(text) {
  return escapeHtml(text).replaceAll('\n', '<br>');
}

function rememberGalLine(key, speaker, text, choice = '') {
  const existing = galHistory.find((entry) => entry.key === key);
  const entry = { key, speaker, text, choice };
  if (existing) Object.assign(existing, entry);
  else {
    galHistory.push(entry);
    if (galHistory.length > GAL_HISTORY_LIMIT) galHistory.splice(0, galHistory.length - GAL_HISTORY_LIMIT);
  }
}

function galBackdropFor(dialogueId, dialogue, turn) {
  const explicit = turn.backdrop ?? dialogue.backdrop ?? GAL_DIALOGUE_BACKDROPS[dialogueId];
  if (explicit && GAL_BACKDROPS[explicit]) return GAL_BACKDROPS[explicit];
  const floor = Number((dialogueId.match(/\d+/) ?? [])[0]);
  if (GAL_FLOOR_BACKDROPS[floor]) return GAL_BACKDROPS[GAL_FLOOR_BACKDROPS[floor]];
  if (floor >= 1 && floor <= 4) return GAL_BACKDROPS.forest;
  if (floor >= 5 && floor <= 7) return GAL_BACKDROPS.ocean;
  if (floor >= 8 && floor <= 10) return GAL_BACKDROPS.night;
  if (floor >= 11 && floor <= 17) return GAL_BACKDROPS.sun;
  if (floor >= 18 && floor <= 24) return GAL_BACKDROPS.ocean;
  if (floor >= 25) return GAL_BACKDROPS.forest;
  return GAL_BACKDROPS[document.body.dataset.theme] ?? GAL_BACKDROPS.night;
}

function galSideFor(portrait, turn) {
  if (turn.side === 'left' || turn.side === 'right') return turn.side;
  return portrait === 'hero' ? 'left' : 'right';
}

function preloadGalImage(url) {
  if (!url || galImagePreloads.has(url)) return;
  const image = new Image();
  image.decoding = 'async';
  image.fetchPriority = 'high';
  image.src = url;
  galImagePreloads.set(url, image);
}

function preloadGalDialogueArt(dialogueId, dialogue, turns) {
  const urls = new Set([GAL_TRANSITIONS[galTransitionFor(dialogueId, dialogue)]]);
  for (const turn of turns) {
    urls.add(galBackdropFor(dialogueId, dialogue, turn));
    if (typeof turn.cg === 'string') urls.add(turn.cg);
    if (!turn.portrait) continue;
    const visual = dialoguePresentation(turn.portrait, turn.expression);
    urls.add(visual.stage);
    urls.add(visual.avatar);
  }
  // The heroine remains on the left side of every spoken scene, including
  // turns where the guide speaks first.
  if (turns.some((turn) => turn.portrait)) {
    const heroine = dialoguePresentation('hero');
    urls.add(heroine.stage);
    urls.add(heroine.avatar);
  }
  urls.forEach(preloadGalImage);
}

function galActorHtml(side, actor, speakerId, speakerName) {
  if (!actor) return '';
  const speaking = actor.id === speakerId;
  const visual = dialoguePresentation(actor.id, actor.expression);
  return `<figure class="gal-actor gal-actor-${side} expression-${escapeHtml(visual.expression)} ${visual.hasPaintedExpression ? 'has-painted-expression' : ''} ${speaking ? 'is-speaking' : 'is-listening'}" data-expression="${escapeHtml(visual.expression)}">
    <img class="gal-standing" src="${visual.stage}" alt="${escapeHtml(speaking ? speakerName : '')}" decoding="async" fetchpriority="high" />
  </figure>`;
}

function galNameplateHtml(turn, speakerName, isNarration) {
  if (isNarration) {
    return `<div class="gal-nameplate gal-nameplate-narration"><span class="gal-nameplate-kicker">NARRATION</span><strong>${escapeHtml(speakerName)}</strong></div>`;
  }
  const visual = dialoguePresentation(turn.portrait, turn.expression);
  return `<div class="gal-nameplate" data-expression="${escapeHtml(visual.expression)}">
    <span class="gal-speaker-avatar ${visual.hasAvatarArt ? 'has-avatar-art' : ''} ${visual.hasPaintedExpression ? 'has-painted-expression' : ''}" aria-hidden="true"><img src="${visual.avatar}" alt="" decoding="async" fetchpriority="high" /></span>
    <span class="gal-nameplate-copy"><small>${escapeHtml(visual.label)} · DIALOGUE</small><strong>${escapeHtml(speakerName)}</strong></span>
  </div>`;
}

function dialogueTurns(dialogue) {
  if (Array.isArray(dialogue.turns) && dialogue.turns.length > 0) return dialogue.turns;
  return [{
    speaker: dialogue.speaker ?? '旁白',
    portrait: dialogue.portrait ?? null,
    text: dialogue.text ?? '',
    kind: dialogue.kind ?? 'dialogue'
  }];
}

function showDialogue(dialogueId, after = null, { finalLabel = null } = {}) {
  const dialogue = getDialogue(dialogueId);
  if (!dialogue) return;
  const turns = dialogueTurns(dialogue);
  preloadGalDialogueArt(dialogueId, dialogue, turns);
  let index = 0;
  let finished = false;
  let historyOpen = false;
  let sceneOpened = false;
  const transition = galTransitionFor(dialogueId, dialogue);
  // Keep the player on stage. A new speaker replaces only their own side,
  // which creates the familiar two-character visual-novel rhythm without
  // requiring every content row to repeat cast metadata.
  const stage = { left: { id: 'hero', expression: null }, right: null };

  const finish = () => {
    if (finished) return;
    finished = true;
    closeGalScene(after);
  };

  const renderTurn = () => {
    cinematicCleanup?.();
    cinematicCleanup = null;
    cinematicControls = null;
    const turn = turns[index];
    const finalTurn = index === turns.length - 1;
    const isNarration = turn.kind === 'narration' || !turn.portrait;
    const choices = Array.isArray(turn.choices) ? turn.choices : [];
    let revealed = false;
    let chosen = null;
    const narratorName = turn.speaker ?? '旁白';
    const cg = typeof turn.cg === 'string' && turn.cg ? turn.cg : null;
    const backdrop = galBackdropFor(dialogueId, dialogue, turn);
    if (!isNarration) {
      stage[galSideFor(turn.portrait, turn)] = {
        id: turn.portrait,
        expression: turn.expression ?? null
      };
    }
    const historyKey = `${dialogueId}:${index}`;
    rememberGalLine(historyKey, narratorName, String(turn.text ?? ''));
    const portraits = isNarration
      ? '<div class="gal-narration-mark" aria-hidden="true">✦</div>'
      : `${galActorHtml('left', stage.left, turn.portrait, narratorName)}${galActorHtml('right', stage.right, turn.portrait, narratorName)}`;
    const nameplate = galNameplateHtml(turn, narratorName, isNarration);
    const historyMarkup = () => galHistory.slice(-16).reverse().map((entry) => `
      <article class="gal-history-entry">
        <strong>${escapeHtml(entry.speaker)}</strong>
        <p>${textToHtml(entry.text)}</p>
        ${entry.choice ? `<small>${escapeHtml(entry.choice)}</small>` : ''}
      </article>`).join('') || '<p class="gal-history-empty">尚未记录对话。</p>';

    elements.galRoot.classList.remove('gal-ui-hidden');
    elements.galRoot.innerHTML = `
      <div class="gal-shell">
        <section class="gal-dialogue ${isNarration ? 'is-narration' : ''} ${cg ? 'has-cg' : ''}" aria-label="${escapeHtml(narratorName)}的对话" style="--gal-backdrop:url('${escapeHtml(backdrop)}')">
          <div class="gal-backdrop" aria-hidden="true"></div>
          <div class="gal-stage">
            ${cg ? `<div class="gal-cg" style="--gal-cg:url('${escapeHtml(cg)}')" aria-hidden="true"></div>` : ''}
            ${portraits}
            <div class="gal-lens"></div>
          </div>
          <div class="gal-witness-transition" aria-hidden="true" style="--gal-transition-enter:url('${escapeHtml(GAL_TRANSITIONS[transition])}');--gal-transition-return:url('${escapeHtml(GAL_TRANSITIONS.return)}')">
            <div class="gal-witness-transition-copy"><small>塔内档案接续</small><strong>${escapeHtml(transition === 'boss' ? '封印正在解锁' : '进入见证场')}</strong></div>
          </div>
          <div class="gal-scene-label" aria-hidden="true"><span>LOST MAGIC TOWER</span><strong>${escapeHtml(dialogue.title)}</strong><small>SCENE ${String(index + 1).padStart(2, '0')} / ${String(turns.length).padStart(2, '0')}</small></div>
          <nav class="gal-toolbar" aria-label="剧情控制">
            <button type="button" data-gal-control="backlog" aria-pressed="false">历史</button>
            <button type="button" data-gal-control="auto" aria-pressed="false">自动</button>
            <button type="button" data-gal-control="fast" aria-pressed="false">快进</button>
            <button type="button" data-gal-control="hide">隐藏</button>
            <button type="button" data-gal-control="skip" class="gal-skip">跳过叙事</button>
          </nav>
          <article class="gal-textbox" role="button" tabindex="0" aria-label="点击显示全文或继续">
            ${nameplate}
            <p class="gal-typewriter"></p>
            ${choices.length ? `<div class="gal-choices">${choices.map((choice, choiceIndex) => `<button class="gal-choice" data-dialogue-choice="${choiceIndex}">${escapeHtml(choice.label)}</button>`).join('')}</div><p class="gal-choice-response" aria-live="polite"></p>` : ''}
            <div class="gal-dialogue-footer">
              <div class="gal-advance-hint">点击舞台 / 空格 / Enter　·　B 历史　A 自动　H 隐藏</div>
              <div class="gal-text-actions">
                <button type="button" class="gal-previous" ${index === 0 ? 'disabled' : ''}>上一句</button>
                <button type="button" class="primary gal-advance">${choices.length ? '选择一句回应' : '显示全文'}</button>
              </div>
            </div>
          </article>
          <aside class="gal-backlog" aria-label="对话历史" ${historyOpen ? '' : 'hidden'}>
            <header><span>BACKLOG · 已读记录</span><button type="button" data-gal-control="backlog-close" aria-label="关闭历史">×</button></header>
            <div class="gal-history-list">${historyMarkup()}</div>
          </aside>
          <button type="button" class="gal-ui-restore" aria-label="显示对话界面">点击任意位置显示界面</button>
        </section>
      </div>`;
    if (!sceneOpened) {
      sceneOpened = true;
      beginGalScene(transition);
    } else {
      elements.galRoot.classList.remove('hidden');
    }
    {
        const textNode = elements.galRoot.querySelector('.gal-typewriter');
        const textbox = elements.galRoot.querySelector('.gal-textbox');
        const dialogueRoot = elements.galRoot.querySelector('.gal-dialogue');
        const advanceButton = elements.galRoot.querySelector('.gal-advance');
        const previousButton = elements.galRoot.querySelector('.gal-previous');
        const backlog = elements.galRoot.querySelector('.gal-backlog');
        const source = String(turn.text ?? '');
        let count = 0;
        let timer = null;
        let autoTimer = null;

        const setAdvanceLabel = () => {
          if (!advanceButton) return;
          if (choices.length && !chosen) advanceButton.textContent = '选择一句回应';
          else if (!revealed) advanceButton.textContent = '显示全文';
          else advanceButton.textContent = finalTurn
            ? (finalLabel ?? (state.victory ? '查看通关结算' : '结束对话'))
            : '下一句';
          advanceButton.disabled = Boolean(choices.length && !chosen);
        };
        const renderText = () => { textNode.innerHTML = textToHtml(source.slice(0, count)); };
        const clearAutoAdvance = () => {
          window.clearTimeout(autoTimer);
          autoTimer = null;
        };
        const scheduleAutoAdvance = () => {
          clearAutoAdvance();
          if (!revealed || (choices.length && !chosen) || (!galSettings.auto && !galSettings.fast)) return;
          autoTimer = window.setTimeout(() => advance(), galSettings.fast ? 230 : 1850);
        };
        const revealAll = () => {
          if (revealed) return;
          clearInterval(timer);
          timer = null;
          count = source.length;
          revealed = true;
          renderText();
          setAdvanceLabel();
          scheduleAutoAdvance();
        };
        const advance = () => {
          clearAutoAdvance();
          if (choices.length && !chosen) return;
          if (!revealed) { revealAll(); return; }
          if (finalTurn) finish();
          else { index += 1; renderTurn(); }
        };
        const toggleBacklog = (force = null) => {
          historyOpen = force ?? !historyOpen;
          backlog.hidden = !historyOpen;
          const button = elements.galRoot.querySelector('[data-gal-control="backlog"]');
          button?.classList.toggle('is-active', historyOpen);
          button?.setAttribute('aria-pressed', String(historyOpen));
          if (historyOpen) backlog.querySelector('[data-gal-control="backlog-close"]')?.focus();
        };
        const refreshToolbar = () => {
          const autoButton = elements.galRoot.querySelector('[data-gal-control="auto"]');
          const fastButton = elements.galRoot.querySelector('[data-gal-control="fast"]');
          autoButton.textContent = galSettings.auto ? '自动·开' : '自动';
          fastButton.textContent = galSettings.fast ? '快进·开' : '快进';
          autoButton.classList.toggle('is-active', galSettings.auto);
          fastButton.classList.toggle('is-active', galSettings.fast);
          autoButton.setAttribute('aria-pressed', String(galSettings.auto));
          fastButton.setAttribute('aria-pressed', String(galSettings.fast));
        };
        const toggleAuto = () => {
          galSettings.auto = !galSettings.auto;
          if (galSettings.auto) galSettings.fast = false;
          refreshToolbar();
          scheduleAutoAdvance();
        };
        const toggleFast = () => {
          galSettings.fast = !galSettings.fast;
          if (galSettings.fast) {
            galSettings.auto = false;
            revealAll();
          }
          refreshToolbar();
          scheduleAutoAdvance();
        };
        const toggleUi = (force = null) => {
          const hidden = force ?? !dialogueRoot.classList.contains('ui-hidden');
          dialogueRoot.classList.toggle('ui-hidden', hidden);
          elements.galRoot.classList.toggle('gal-ui-hidden', hidden);
          if (!hidden) textbox.focus({ preventScroll: true });
        };

        timer = window.setInterval(() => {
          count += galSettings.fast ? 12 : 2;
          if (count >= source.length) revealAll();
          else renderText();
        }, galSettings.fast ? 5 : 16);
        renderText();
        setAdvanceLabel();
        refreshToolbar();

        textbox.addEventListener('click', (event) => {
          if (event.target.closest('button')) return;
          advance();
        });
        dialogueRoot.addEventListener('click', (event) => {
          if (event.target.closest('.gal-textbox, .gal-toolbar, .gal-backlog, .gal-ui-restore')) return;
          advance();
        });
        textbox.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            advance();
          }
        });
        previousButton?.addEventListener('click', () => {
          clearAutoAdvance();
          if (index > 0) { index -= 1; renderTurn(); }
        });
        advanceButton?.addEventListener('click', advance);
        elements.galRoot.querySelectorAll('[data-gal-control]').forEach((button) => {
          button.addEventListener('click', () => {
            const control = button.dataset.galControl;
            if (control === 'backlog') toggleBacklog();
            if (control === 'backlog-close') toggleBacklog(false);
            if (control === 'auto') toggleAuto();
            if (control === 'fast') toggleFast();
            if (control === 'hide') toggleUi(true);
            if (control === 'skip') finish();
          });
        });
        elements.galRoot.querySelector('.gal-ui-restore')?.addEventListener('click', () => toggleUi(false));
        elements.galRoot.querySelectorAll('[data-dialogue-choice]').forEach((button) => {
          button.addEventListener('click', () => {
            const choice = choices[Number(button.dataset.dialogueChoice)];
            if (!choice || chosen) return;
            chosen = choice;
            elements.galRoot.querySelectorAll('.gal-choice').forEach((item) => {
              item.disabled = true;
              item.classList.toggle('selected', item === button);
            });
            const response = elements.galRoot.querySelector('.gal-choice-response');
            if (response) response.textContent = choice.response ?? '璃记下这句话，迈向高塔深处。';
            rememberGalLine(historyKey, narratorName, source, choice.label);
            revealAll();
            setAdvanceLabel();
          });
        });
        cinematicCleanup = () => {
          clearInterval(timer);
          clearAutoAdvance();
        };
        cinematicControls = { advance, skip: finish, toggleBacklog, toggleAuto, toggleFast, toggleUi };
        window.requestAnimationFrame(() => textbox.focus({ preventScroll: true }));
    }
  };

  renderTurn();
}

function combatHpBar(value, maximum) {
  const safeMaximum = Math.max(1, maximum);
  return `${Math.max(0, Math.min(100, value / safeMaximum * 100)).toFixed(2)}%`;
}

function showBattleCinematic(battle, after = null) {
  const { enemy } = battle;
  const hero = battle.hero ?? { hp: Math.max(1, state.stats.hp + (battle.totalDamage || 0)), maxHp: state.stats.maxHp };
  const predictedDefeat = !battle.winnable;
  const critical = !predictedDefeat && battle.remainingHp / Math.max(1, hero.maxHp) <= 0.3;
  const cg = predictedDefeat
    ? '/assets/anime/cg/liyue-defeat-cg.webp'
    : critical
      ? '/assets/anime/cg/liyue-critical-cg.webp'
      : null;
  const special = specialLabel(enemy);
  const heroStart = Math.max(0, hero.hp);
  const enemyStart = Math.max(1, enemy.hp);
  const events = [];
  let finishBattle = () => {};
  if (battle.heroDamage > 0 && battle.magicAffordable !== false) {
    if (enemy.special === 'firstStrike') {
      events.push({ side: 'enemy', damage: battle.enemyDamage, label: '先制斩击' });
    }
    for (let round = 0; round < battle.rounds; round += 1) {
      events.push({ side: 'hero', damage: battle.heroDamage, label: round + 1 === battle.rounds ? '终结一击' : '剑技命中' });
      if (round < battle.rounds - 1) events.push({ side: 'enemy', damage: battle.enemyDamage, label: enemy.special === 'magic' ? '魔法反击' : enemy.special === 'doubleHit' ? '二连反击' : '反击' });
    }
  }

  openModal({
    kicker: predictedDefeat ? 'BATTLE FORECAST · 战败预演' : `BATTLE SEQUENCE · ${battle.rounds} 回合`,
    title: predictedDefeat ? `无法战胜「${enemy.name}」` : `与「${enemy.name}」交锋`,
    closable: false,
    variant: 'battle',
    body: `
      <section class="battle-cinematic ${predictedDefeat ? 'is-defeat' : critical ? 'is-critical' : ''}" ${cg ? `style="--battle-cg:url('${cg}')"` : ''}>
        <div class="battle-cg" aria-hidden="true"></div>
        <div class="battle-vignette" aria-hidden="true"></div>
        <div class="battle-combatants">
          <article class="battle-combatant hero-combatant">
            <div class="battle-portrait"><img src="${portraitUrl('hero')}" alt="绫星·璃" /></div>
            <div class="battle-name"><span>PLAYER</span><strong>绫星·璃</strong></div>
            <div class="battle-hp"><span class="battle-hero-fill" style="width:${combatHpBar(heroStart, hero.maxHp)}"></span></div>
            <b class="battle-hp-number">${formatNumber(heroStart)} / ${formatNumber(hero.maxHp)}</b>
          </article>
          <div class="battle-center" aria-live="polite">
            <span class="battle-round">预演准备</span>
            <strong class="battle-callout">${predictedDefeat ? '生命不足' : '交锋开始'}</strong>
            <span class="battle-rule">${escapeHtml(special)}</span>
            <span class="battle-damage" aria-hidden="true"></span>
          </div>
          <article class="battle-combatant enemy-combatant">
            <div class="battle-portrait"><img src="${portraitUrl(enemy.portrait)}" alt="${escapeHtml(enemy.name)}" /></div>
            <div class="battle-name"><span>${enemy.boss ? 'BOSS' : 'ENEMY'}</span><strong>${escapeHtml(enemy.name)}</strong></div>
            <div class="battle-hp"><span class="battle-enemy-fill" style="width:100%"></span></div>
            <b class="battle-enemy-number">${formatNumber(enemyStart)} / ${formatNumber(enemyStart)}</b>
          </article>
        </div>
        <p class="battle-summary">${predictedDefeat
          ? `预估损伤 ${formatNumber(battle.totalDamage)} HP，会使生命归零。本次行动未消耗任何资源。`
          : `预计损失 ${formatNumber(battle.totalDamage)} HP${battle.magicCost ? ` · 消耗 ${formatNumber(battle.magicCost)} MP` : ''}。`}</p>
      </section>
    `,
    actions: [
      {
        label: '跳过战斗演出',
        className: 'battle-skip',
        close: false,
        onClick: () => finishBattle(true)
      },
      {
        label: predictedDefeat ? '调整后再试' : '继续',
        className: 'primary battle-continue',
        disabled: true,
        close: false,
        onClick: () => finishBattle(false)
      }
    ],
    afterOpen: () => {
      const heroFill = elements.modalBody.querySelector('.battle-hero-fill');
      const heroNumber = elements.modalBody.querySelector('.battle-hp-number');
      const enemyFill = elements.modalBody.querySelector('.battle-enemy-fill');
      const enemyNumber = elements.modalBody.querySelector('.battle-enemy-number');
      const round = elements.modalBody.querySelector('.battle-round');
      const callout = elements.modalBody.querySelector('.battle-callout');
      const damage = elements.modalBody.querySelector('.battle-damage');
      const continueButton = elements.modalActions.querySelector('.battle-continue');
      let heroHp = heroStart;
      let enemyHp = enemyStart;
      let step = 0;
      let settled = false;
      let timer = null;

      const render = (event = null) => {
        heroFill.style.width = combatHpBar(heroHp, hero.maxHp);
        enemyFill.style.width = combatHpBar(enemyHp, enemyStart);
        heroNumber.textContent = `${formatNumber(Math.max(0, heroHp))} / ${formatNumber(hero.maxHp)}`;
        enemyNumber.textContent = `${formatNumber(Math.max(0, enemyHp))} / ${formatNumber(enemyStart)}`;
        if (!event) return;
        round.textContent = `回合 ${Math.min(battle.rounds, Math.ceil((step + 1) / 2))} / ${battle.rounds}`;
        callout.textContent = event.label;
        damage.textContent = `-${formatNumber(event.damage)}`;
        damage.className = `battle-damage show ${event.side}`;
        window.setTimeout(() => damage.classList.remove('show'), 140);
      };
      const settle = () => {
        if (settled) return;
        settled = true;
        clearInterval(timer);
        if (predictedDefeat) heroHp = 0;
        else {
          heroHp = Math.max(0, battle.remainingHp);
          enemyHp = 0;
        }
        render();
        callout.textContent = predictedDefeat ? '预演中止 · 调整配置' : critical ? '险胜 · 璃仍能前进' : '胜利';
        round.textContent = predictedDefeat ? '本次没有发生实际战斗' : `结算 · ${battle.rounds} 回合`;
        continueButton.disabled = false;
        cinematicControls = { advance: () => finishBattle(false), skip: () => finishBattle(true) };
      };
      const playStep = () => {
        const event = events[step];
        if (!event) { settle(); return; }
        if (event.side === 'hero') enemyHp = Math.max(0, enemyHp - event.damage);
        else heroHp = Math.max(0, heroHp - event.damage);
        render(event);
        step += 1;
      };
      finishBattle = (skip) => {
        settle();
        modalClosable = true;
        closeModal();
        if (skip) showToast(predictedDefeat ? '战败预演已跳过：本次没有消耗资源。' : '已跳过战斗演出。', 1400);
        after?.();
      };

      // Unwinnable battles deliberately remain a forecast; fixed-number play
      // never commits an opaque death.  The CG still gives that warning weight.
      if (predictedDefeat || events.length === 0) settle();
      else {
        playStep();
        timer = window.setInterval(playStep, 118);
      }
      cinematicCleanup = () => clearInterval(timer);
      cinematicControls = { advance: () => finishBattle(false), skip: () => finishBattle(true) };
    }
  });
}

function updateBattlePreview() {
  const previews = getAdjacentEnemyPreviews(state);
  if (previews.length === 0) {
    elements.preview.className = 'battle-preview muted';
    elements.preview.textContent = '相邻格没有敌人。移动到敌人旁边即可查看固定损伤。';
    return;
  }
  const preview = previews[0];
  const { enemy } = preview;
  const lossClass = preview.winnable ? 'safe' : 'danger';
  const magicBlocked = preview.magicAffordable === false;
  const lossText = preview.heroDamage <= 0
    ? '无法破防'
    : magicBlocked
      ? `MP 不足（需 ${formatNumber(preview.magicCost)}）`
      : `${formatNumber(preview.totalDamage)} HP`;
  const magicText = preview.magicTier > 0
    ? ` · 附刃 ${preview.magicTier} 档（每击 +${preview.magicBonusPerHit}，本战 -${preview.magicCost} MP）`
    : '';
  elements.preview.className = 'battle-preview';
  elements.preview.innerHTML = `
    <div class="preview-enemy">
      <img src="${portraitUrl(enemy.portrait)}" alt="${escapeHtml(enemy.name)}" />
      <div>
        <h4>${escapeHtml(enemy.name)}</h4>
        <p>HP ${formatNumber(enemy.hp)} · ATK ${formatNumber(enemy.atk)} · DEF ${formatNumber(enemy.def)}</p>
        <p>${escapeHtml(specialLabel(enemy))}${magicText}${previews.length > 1 ? ` · 相邻还有 ${previews.length - 1} 名敌人` : ''}</p>
      </div>
    </div>
    <div class="preview-damage">
      <span>${magicBlocked ? '本战不能开始' : '这场会损失'}</span>
      <strong class="${lossClass}">${lossText}</strong>
    </div>
  `;
}

function updateHud() {
  const floor = FLOORS[state.floor];
  elements.floorNumber.textContent = `第 ${floor.number} 阵`;
  elements.floorTitle.textContent = floor.title;
  elements.hp.textContent = `${formatNumber(state.stats.hp)} / ${formatNumber(state.stats.maxHp)}`;
  elements.atk.textContent = formatNumber(state.stats.atk);
  elements.def.textContent = formatNumber(state.stats.def);
  elements.gold.textContent = formatNumber(state.stats.gold);
  elements.sun.textContent = state.cards.sun;
  elements.moon.textContent = state.cards.moon;
  elements.star.textContent = state.cards.star;
  const magic = describeMagicTier(state.magic);
  elements.magicTitle.textContent = magic.unlocked
    ? `魔力 ${magic.mp} / ${magic.maxMp} · 附刃 ${magic.tier} 档`
    : `魔力回收率 ${getProgressPercent(state)}%`;
  elements.magicTierButton.disabled = !magic.unlocked;
  elements.magicButton.disabled = !magic.unlocked;
  elements.doctrineButton.disabled = FLOORS[state.floor].number < 11;
  elements.doctrineButton.textContent = FLOORS[state.floor].number >= 21 ? '修复章程' : '见证契约';

  const relics = getRelicLabels(state);
  elements.relicList.innerHTML = relics.length
    ? relics.map((name) => `<span class="relic-badge">${escapeHtml(name)}</span>`).join('')
    : '<span class="muted">尚未获得</span>';

  elements.logList.innerHTML = state.logs.map((message) => `<li>${escapeHtml(message)}</li>`).join('');
  elements.codexButton.disabled = !state.relics.codex;
  elements.teleportButton.disabled = !state.relics.compass;
  updateBattlePreview();
}

function autoSave() {
  try {
    localStorage.setItem(AUTO_SAVE_KEY, serializeState(state));
  } catch (error) {
    console.warn('Autosave failed:', error);
  }
}

function saveGame() {
  try {
    localStorage.setItem(MANUAL_SAVE_KEY, serializeState(state));
    showToast('手动存档已写入浏览器。');
  } catch (error) {
    showToast(`存档失败：${error.message}`);
  }
}

function loadGame() {
  const serialized = localStorage.getItem(MANUAL_SAVE_KEY) ?? localStorage.getItem(AUTO_SAVE_KEY);
  if (!serialized) {
    showToast('没有可读取的存档。');
    return;
  }
  try {
    state = deserializeState(serialized);
    scene?.refresh();
    updateHud();
    showToast('存档读取完成。');
  } catch (error) {
    showToast(`读档失败：${error.message}`);
  }
}

function showHelp() {
  openModal({
    kicker: 'HOW TO PLAY',
    title: '地图与选择说明',
    body: `
      <div class="copy-principles">
        ${HELP_SECTIONS.map((section) => `<section><h3>${escapeHtml(section.title)}</h3><ul>${section.lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul></section>`).join('')}
      </div>
      <details class="route-intel-threats">
        <summary>查看完整规则与快捷键</summary>
        <p><strong>伤害公式：</strong><code>(攻击所需回合 - 1) × max(敌方攻击 - 我方防御, 0)</code>。静谧耳坠会降低无视防御的魔法伤害。</p>
        <p><strong>附刃：</strong>第十阵后解锁。每档在下一场战斗开始时消耗 10 MP；该战每次主角攻击额外 +10 伤害，仍需先物理破防。</p>
        <p><strong>路线选择：</strong>F11 签署一份见证契约，选择一座路线宝库；F21 选择一座修复侧库。同一轮中其余同类区域不可进入。选择本身不消耗资源，卡牌和战斗代价会在区域内结算。</p>
        <p><strong>快捷键：</strong>方向键 / WASD 移动；R 见证契约或修复章程；E 图鉴；T 楼层罗盘；M 魔力附刃。触摸对象时，第一次只查看，再点同一格才行动。</p>
      </details>
    `,
    actions: [{ label: '返回游戏', className: 'primary' }]
  });
}

function showMagicBlade() {
  const magic = describeMagicTier(state.magic);
  if (!magic.unlocked) {
    showToast('第十阵黯星核心尚未解除，魔力附刃仍处于封印状态。');
    return;
  }
  const capacity = getMagicTierCapacity(state.magic);
  openModal({
    kicker: 'ARCANE BLADE',
    title: `魔力附刃 · 当前 MP ${magic.mp} / ${magic.maxMp}`,
    body: `
      <div class="dialogue-copy shop-intro" style="margin-bottom:16px">
        <p>档位只在<strong>下一场战斗开始时</strong>支付一次。每档消耗 10 MP，并使这一场中每次主角攻击额外造成 10 点伤害；仍须先以普通攻击破防。</p>
      </div>
      <div class="shop-grid magic-tier-grid">
        ${Array.from({ length: capacity + 1 }, (_, tier) => {
          const cost = getMagicTierCost(tier);
          const selected = tier === magic.tier;
          const affordable = cost <= magic.mp;
          return `
            <article class="shop-option ${selected ? 'selected-magic-tier' : ''}">
              <h3>${tier === 0 ? '关闭附刃' : `${tier} 档附刃`}</h3>
              <p>${tier === 0 ? '不消耗 MP，以基础攻击结算。' : `本战支付 ${cost} MP · 每次攻击额外 +${cost} 伤害。`}</p>
              <button data-magic-tier="${tier}" ${affordable ? '' : 'disabled'}>${selected ? '当前选择' : affordable ? '设为此档' : 'MP 不足'}</button>
            </article>`;
        }).join('')}
      </div>
    `,
    actions: [{ label: '返回游戏' }],
    afterOpen: () => {
      elements.modalBody.querySelectorAll('[data-magic-tier]').forEach((button) => {
        button.addEventListener('click', () => {
          const result = setMagicTier(state, Number(button.dataset.magicTier));
          if (!result.ok) {
            showToast(result.reason);
            return;
          }
          updateHud();
          autoSave();
          showMagicBlade();
        });
      });
    }
  });
}

function showWarCouncil() {
  const allies = getWarCouncilAllies(state);
  if (allies.length < 3) {
    showToast('可共鸣的守护者不足，无法启动王座前会战。');
    return;
  }

  let plan = {
    order: allies.slice(0, 3).map((ally) => ally.id),
    allocations: Object.fromEntries(allies.slice(0, 3).map((ally) => [ally.id, WAR_COUNCIL_MP_POOL / 3]))
  };

  const render = () => {
    const report = simulateWarCouncil(state, plan);
    const allocated = plan.order.reduce((sum, id) => sum + (Number(plan.allocations[id]) || 0), 0);
    const validPlan = report.ok && allocated === WAR_COUNCIL_MP_POOL;
    const forecast = report.ok
      ? `
        <div class="war-council-forecast ${report.won ? 'safe' : 'danger'}">
          <strong>${report.won ? '预演结果：可击破全部忠诚随从' : '预演结果：我方会战失败'}</strong>
          <p>${report.records.map((duel, index) => `${index + 1}. ${escapeHtml(duel.left.name)} vs ${escapeHtml(duel.right.name)} → ${escapeHtml(duel.leftWon ? duel.left.name : duel.right.name)}胜（${duel.exchanges} 次交锋）`).join('<br>')}</p>
          ${report.won ? `<p>可支援终局：${report.survivors.map((unit) => `${escapeHtml(unit.name)} ${formatNumber(unit.hp)}/${formatNumber(unit.maxHp)}`).join('；')}。</p>
          <p>${report.modifiers.labels.map(escapeHtml).join('<br>')}</p>` : '<p>调整出战顺序或 MP 配额后再试。敌方配置不会变化。</p>'}
        </div>`
      : `<div class="war-council-forecast danger"><strong>配置无效</strong><p>${escapeHtml(report.reason)}</p></div>`;

    openModal({
      kicker: 'WAR COUNCIL · 全信息固定数值',
      title: `共鸣 MP：${allocated} / ${WAR_COUNCIL_MP_POOL}`,
      body: `
        <div class="dialogue-copy war-council-intro">
          <p><strong>这里不会消耗主角 MP。</strong>选择 3 名盟友、决定出场顺序，并分完全部 ${WAR_COUNCIL_MP_POOL} 点共鸣 MP；下方预演会立刻显示结果。</p>
          <p>会战胜者会进入终局。已完成的盟友信物会按卡片列出的条件生效：有的只要上场，有的需要会战存活。</p>
        </div>
        <section class="war-council-enemy-list">
          <h3>敌方既定阵列</h3>
          ${WAR_COUNCIL_LOYALISTS.map((unit, index) => `<p>${index + 1}. <strong>${escapeHtml(unit.name)}</strong> · ${escapeHtml(unit.role)} · 固定 ${unit.mp} MP</p>`).join('')}
        </section>
        <section class="war-council-plan">
          <h3>我方部署</h3>
          ${plan.order.map((id, index) => `
            <article class="war-council-slot">
              <label>第 ${index + 1} 位
                <select data-council-slot="${index}">
                  ${allies.map((ally) => `<option value="${ally.id}" ${ally.id === id ? 'selected' : ''}>${escapeHtml(ally.name)} · ${escapeHtml(ally.role)}${ally.bonded ? ` · ${ally.bondActivation === 'deployed' ? '上场即生效' : '需会战存活'}` : ''}</option>`).join('')}
                </select>
              </label>
              <label>分配 MP
                <select data-council-mp="${id}">
                  ${Array.from({ length: WAR_COUNCIL_MAX_MP_PER_ALLY / WAR_COUNCIL_MP_STEP + 1 }, (_, step) => step * WAR_COUNCIL_MP_STEP)
                    .map((mp) => `<option value="${mp}" ${mp === plan.allocations[id] ? 'selected' : ''}>${mp} MP</option>`).join('')}
                </select>
              </label>
              ${allies.find((ally) => ally.id === id)?.bonded ? `<p class="war-council-bond">生效条件：${allies.find((ally) => ally.id === id).bondActivation === 'deployed' ? '上场即生效' : '会战存活'}；${escapeHtml(allies.find((ally) => ally.id === id).bondEffect)}</p>` : ''}
            </article>`).join('')}
        </section>
        ${forecast}
      `,
      actions: [
        { label: '稍后决定' },
        {
          label: '确认会战',
          className: 'primary',
          disabled: !validPlan || !report.won,
          close: false,
          onClick: () => {
            const result = resolveWarCouncil(state, plan);
            if (!result.ok) {
              showToast(result.reason);
              return;
            }
            modalClosable = true;
            closeModal();
            scene?.refresh();
            updateHud();
            autoSave();
            showToast('共鸣会战获胜：主权者的定额授权已被瓦解。', 2600);
          }
        }
      ],
      afterOpen: () => {
        elements.modalBody.querySelectorAll('[data-council-slot]').forEach((select) => {
          select.addEventListener('change', () => {
            const index = Number(select.dataset.councilSlot);
            const next = select.value;
            const previous = plan.order[index];
            const occupied = plan.order.indexOf(next);
            if (occupied >= 0) [plan.order[index], plan.order[occupied]] = [plan.order[occupied], plan.order[index]];
            else {
              plan.order[index] = next;
              plan.allocations[next] = plan.allocations[previous] ?? 0;
              delete plan.allocations[previous];
            }
            render();
          });
        });
        elements.modalBody.querySelectorAll('[data-council-mp]').forEach((select) => {
          select.addEventListener('change', () => {
            plan.allocations[select.dataset.councilMp] = Number(select.value);
            render();
          });
        });
      }
    });
  };
  render();
}

function showShop() {
  const cost = getShopCost(state);
  const multiplier = getShopEffectMultiplier(state);
  const bonus = Math.max(0, Math.round((multiplier - 1) * 100));
  const options = getShopOptions(state);
  const tier = FLOORS[state.floor]?.shopTierLabel ?? '基础咏唱';
  openModal({
    kicker: `阵间商店 · ${tier}`,
    title: `下一次咏唱需要 ${cost} 金币`,
    body: `
      <div class="dialogue-copy shop-intro" style="margin-bottom:16px">
        <p>每次购买都会立刻获得下列永久效果，并让<strong>下一次价格上升</strong>。本层效果为基础值的 <strong>${Math.round(multiplier * 100)}%</strong>${bonus > 0 ? `（额外 +${bonus}%）` : ''}。</p>
      </div>
      <div class="shop-grid">
        ${options.map((option) => `
          <article class="shop-option">
            <h3>${escapeHtml(option.label)}</h3>
            <p>${escapeHtml(option.description)}</p>
            <button data-shop-option="${option.id}" ${state.stats.gold < cost ? 'disabled' : ''}>购买 · ${cost} 金币</button>
          </article>
        `).join('')}
      </div>
    `,
    actions: [{ label: '离开商店' }],
    afterOpen: () => {
      elements.modalBody.querySelectorAll('[data-shop-option]').forEach((button) => {
        button.addEventListener('click', () => {
          const result = buyShopUpgrade(state, button.dataset.shopOption);
          if (!result.ok) {
            showToast(result.reason);
            return;
          }
          updateHud();
          autoSave();
          showShop();
        });
      });
    }
  });
}

function showCodex() {
  if (!state.relics.codex) {
    showToast('尚未获得魔眼图鉴；敌人仍可直接悬停查看数值和预计耗血。');
    return;
  }
  const entries = getCodexEntries(state);
  openModal({
    kicker: 'TACTICAL CODEX',
    title: '敌人图鉴与当前损伤',
    body: `
      <div class="codex-grid">
        ${entries.map(({ enemy, winnable, totalDamage, heroDamage, magicTier, magicCost, magicBonusPerHit }) => `
          <article class="codex-entry">
            <img src="${portraitUrl(enemy.portrait)}" alt="${escapeHtml(enemy.name)}" />
            <div>
              <h3>${escapeHtml(enemy.name)}</h3>
              <p>HP ${formatNumber(enemy.hp)} · ATK ${formatNumber(enemy.atk)} · DEF ${formatNumber(enemy.def)} · 金币 ${enemy.gold}</p>
              <p>${escapeHtml(specialLabel(enemy))}</p>
              <p class="loss">${heroDamage <= 0 ? '当前无法破防' : `预计损伤 ${formatNumber(totalDamage)} · ${winnable ? '可胜' : '会战败'}`}${magicTier > 0 ? ` · 附刃 ${magicTier} 档：每击 +${magicBonusPerHit}，本战 -${magicCost} MP` : ''}</p>
            </div>
          </article>
        `).join('')}
      </div>
    `,
    actions: [{ label: '关闭图鉴', className: 'primary' }]
  });
}

function showAct3Charter() {
  const briefing = getAct3CharterBriefing(state);
  const selected = getSelectedAct3Charter(state);
  openModal({
    kicker: 'ACT III CHARTER · 信息公开',
    title: selected ? `修复章程 · ${selected.title}` : '签署第三幕修复章程',
    closable: Boolean(selected || state.charter?.legacyOpen),
    body: `
      <div class="dialogue-copy doctrine-intro">
        <p><strong>选择本身不消耗资源。</strong>本轮只会开启一个修复区域；另外两个区域无法进入。</p>
        <p>${selected ? (briefing.completedId ? '已完成。下方保留终局效果，方便复核。' : '已锁定。卡牌和战斗代价会在对应区域结算。') : state.charter?.legacyOpen ? '旧存档保留原有开放状态。' : '离开 F21 前必须选择一次，之后不能更换。'}</p>
      </div>
      <section class="doctrine-list">
        ${briefing.entries.map((charter) => `
          <article class="doctrine-card ${charter.selected ? 'selected-doctrine' : charter.locked ? 'locked-doctrine' : ''}">
            <div class="doctrine-heading"><h3>${escapeHtml(charter.title)}</h3><span>${escapeHtml(charter.difficulty)}</span></div>
            <p><strong>关联区域：</strong>${escapeHtml(charter.route)}</p>
            <p><strong>需要付出：</strong>${escapeHtml(charter.cost)}</p>
            <p><strong>你会失去：</strong>${escapeHtml(charter.risk)}</p>
            <p><strong>终局得到：</strong>${escapeHtml(charter.payoff)}</p>
            ${charter.completed ? '<p class="doctrine-complete">本轮已完成此章程。</p>' : ''}
            ${!selected && !state.charter?.legacyOpen ? `<button data-act3-charter="${escapeHtml(charter.id)}">选择此章程</button>` : charter.selected ? '<p class="doctrine-selected-label">本轮已选择</p>' : charter.locked ? '<p class="doctrine-locked-label">本轮不可进入</p>' : ''}
          </article>`).join('')}
      </section>
    `,
    actions: selected || state.charter?.legacyOpen ? [{ label: '返回游戏', className: 'primary' }] : [],
    afterOpen: () => {
      elements.modalBody.querySelectorAll('[data-act3-charter]').forEach((button) => {
        button.addEventListener('click', () => {
          const result = selectAct3Charter(state, button.dataset.act3Charter);
          if (!result.ok) { showToast(result.reason); return; }
          updateHud();
          autoSave();
          modalClosable = true;
          closeModal();
          showToast(`已选择「${result.charter.title}」。另外两个修复区域本轮不可进入。`, 2600);
        });
      });
    }
  });
}

function showRouteDoctrine() {
  if (FLOORS[state.floor].number >= 21) {
    showAct3Charter();
    return;
  }
  if (FLOORS[state.floor].number < 11) {
    showToast('见证契约会在第十一阵开放。');
    return;
  }
  const briefing = getRouteDoctrineBriefing(state);
  const selected = getSelectedRouteDoctrine(state);
  openModal({
    kicker: 'ACT II WITNESS PACT · 路线选择',
    title: selected ? `见证契约 · ${selected.title}` : '签署第二章见证契约',
    closable: Boolean(selected || state.doctrine?.legacyOpen),
    body: `
      <div class="dialogue-copy doctrine-intro">
        <p><strong>选择不扣资源。</strong>本轮会开启一座路线宝库；F12 月镜宝库不受此选择影响。</p>
        <p>${selected ? '已锁定。下方保留成本和终局效果，方便复核。' : state.doctrine?.legacyOpen ? '旧存档保留原有开放状态。' : '离开 F11 前必须选择一次，之后不能更换。'}</p>
      </div>
      <section class="doctrine-list">
        ${briefing.entries.map((doctrine) => `
          <article class="doctrine-card ${doctrine.selected ? 'selected-doctrine' : doctrine.locked ? 'locked-doctrine' : ''}">
            <div class="doctrine-heading"><h3>${escapeHtml(doctrine.title)}</h3><span>${escapeHtml(doctrine.difficulty)}</span></div>
            <p><strong>关联区域 / 卡牌：</strong>${escapeHtml(doctrine.route)} · ${escapeHtml(doctrine.cardPressure)}</p>
            <p><strong>进入后：</strong>${escapeHtml(doctrine.risk)}</p>
            ${doctrine.midgameSupport ? `<p><strong>中途得到：</strong>${escapeHtml(doctrine.midgameSupport)}</p>` : ''}
            <p><strong>终局效果：</strong>${escapeHtml(doctrine.payoff)}</p>
            <p><strong>生效条件：</strong>${escapeHtml(doctrine.councilGoal)}</p>
            ${doctrine.completed ? `<p class="doctrine-complete">已完成信物「${escapeHtml(doctrine.bondTitle ?? '')}」。</p>` : ''}
            ${!selected && !state.doctrine?.legacyOpen ? `<button data-route-doctrine="${escapeHtml(doctrine.id)}">选择这座宝库</button>` : doctrine.selected ? '<p class="doctrine-selected-label">本轮已选择</p>' : doctrine.locked ? '<p class="doctrine-locked-label">本轮不可进入</p>' : ''}
          </article>
        `).join('')}
      </section>
    `,
    actions: selected || state.doctrine?.legacyOpen ? [{ label: '返回游戏', className: 'primary' }] : [],
    afterOpen: () => {
      elements.modalBody.querySelectorAll('[data-route-doctrine]').forEach((button) => {
        button.addEventListener('click', () => {
          const result = selectRouteDoctrine(state, button.dataset.routeDoctrine);
          if (!result.ok) {
            showToast(result.reason);
            return;
          }
          updateHud();
          autoSave();
          modalClosable = true;
          closeModal();
          showToast(`已签署「${result.doctrine.title}」。其他路线宝库本轮不可进入。`, 2600);
        });
      });
    }
  });
}

function showTeleport() {
  if (!state.relics.compass) {
    showToast('尚未获得层间罗盘。');
    return;
  }
  const visited = [...state.visitedFloors].sort((a, b) => a - b);
  openModal({
    kicker: 'FLOOR COMPASS',
    title: '选择已到达楼层',
    body: `
      <div class="teleport-grid">
        ${visited.map((floorId) => `
          <button data-floor="${floorId}" ${floorId === state.floor ? 'disabled' : ''}>
            第 ${FLOORS[floorId].number} 阵 · ${escapeHtml(FLOORS[floorId].title)}
          </button>
        `).join('')}
      </div>
    `,
    actions: [{ label: '取消' }],
    afterOpen: () => {
      elements.modalBody.querySelectorAll('[data-floor]').forEach((button) => {
        button.addEventListener('click', () => {
          const result = teleportToFloor(state, Number(button.dataset.floor));
          if (!result.ok) {
            showToast(result.reason);
            return;
          }
          modalClosable = true;
          closeModal();
          scene?.refresh();
          updateHud();
          autoSave();
        });
      });
    }
  });
}

function showVictory() {
  const ending = getEndingDebrief(state);
  openModal({
    kicker: 'CLEAR',
    title: '余烬灯塔解除',
    body: `
      <h3 class="victory-title">${escapeHtml(ending.title)}</h3>
      <p class="ending-debrief">${escapeHtml(ending.text)}</p>
      ${ending.bondTitle ? `<p><strong>已生效盟友信物：</strong>${escapeHtml(ending.bondTitle)}</p>` : ''}
      ${ending.completedCharter ? `<p><strong>完成章程：</strong>${escapeHtml(ending.completedCharter)}</p>` : ''}
      ${ending.survivorName ? `<p><strong>会战幸存者：</strong>${escapeHtml(ending.survivorName)}</p>` : ''}
      ${ending.activatedRules.length ? `<p><strong>终局支援：</strong>${ending.activatedRules.map(escapeHtml).join('；')}</p>` : ''}
      ${ending.hiddenWitness ? `<section class="route-intel-floor hidden-witness"><h3>${escapeHtml(ending.hiddenWitness.title)}</h3><p>${escapeHtml(ending.hiddenWitness.text)}</p></section>` : ''}
      <p><strong>已完成盟友信物：</strong>${ending.completedBondCount} / 4</p>
      <p>通关生命：<strong>${formatNumber(state.stats.hp)} / ${formatNumber(state.stats.maxHp)}</strong></p>
      <p>最终攻击 / 防御：<strong>${formatNumber(state.stats.atk)} / ${formatNumber(state.stats.def)}</strong></p>
      <p>战斗次数：<strong>${state.battles}</strong>　行动次数：<strong>${state.turns}</strong></p>
      <p>已回收第一章核心：<strong>${state.cores} / 7</strong></p>
      <p class="muted">不同盟友信物、会战幸存者与部署方案会导向不同的战后叙事；它们不是高低排序。</p>
    `,
    actions: [
      { label: '保留结算', className: 'primary' },
      { label: '重新挑战', onClick: confirmReset }
    ]
  });
}

function confirmReset() {
  openModal({
    kicker: 'RESET',
    title: '确认重新开始？',
    body: '<p>当前自动存档与手动存档都会被清除，游戏将返回第一阵。</p>',
    actions: [
      { label: '取消' },
      {
        label: '清除并重开',
        className: 'primary',
        onClick: () => {
          localStorage.removeItem(MANUAL_SAVE_KEY);
          localStorage.removeItem(AUTO_SAVE_KEY);
          state = createInitialState();
          scene?.refresh();
          updateHud();
          autoSave();
          initialGalDialogue();
        }
      }
    ]
  });
}

function continueSceneResult(result) {
  if (result.blocked) showToast(result.reason ?? '无法行动。');
  if (result.openDoctrine) {
    showRouteDoctrine();
    return;
  }
  if (result.openCharter) {
    showAct3Charter();
    return;
  }
  if (result.openCouncil) {
    if (result.dialogue) showDialogue(result.dialogue, showWarCouncil);
    else showWarCouncil();
    return;
  }
  if (result.openShop) showShop();
  if (result.dialogue) {
    showDialogue(result.dialogue, result.victory ? showVictory : null);
  } else if (result.victory) {
    showVictory();
  }
  if (result.moved || result.battle || result.floorChanged) autoSave();
}

function handleSceneResult(result) {
  updateHud();
  if (result.battle) {
    showBattleCinematic(result.battle, () => continueSceneResult(result));
    return;
  }
  continueSceneResult(result);
}

async function loadScript(src, timeoutMs = 2500) {
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      script.remove();
      reject(new Error(`加载超时：${src}`));
    }, timeoutMs);
    script.src = src;
    script.async = true;
    script.onload = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      script.remove();
      reject(new Error(`加载失败：${src}`));
    };
    document.head.append(script);
  });
}

async function ensurePhaser() {
  if (globalThis.__TOWER_FORCE_CANVAS__ === true) return null;
  if (window.Phaser) return window.Phaser;
  const fallbacks = [
    'https://cdnjs.cloudflare.com/ajax/libs/phaser/3.90.0/phaser.min.js',
    'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js'
  ];
  for (const src of fallbacks) {
    try {
      await loadScript(src);
      if (window.Phaser) return window.Phaser;
    } catch (error) {
      console.warn(`Phaser fallback failed: ${src}`, error);
    }
  }
  return null;
}

function bindControls() {
  $('#btn-help').addEventListener('click', showHelp);
  $('#btn-save').addEventListener('click', saveGame);
  $('#btn-load').addEventListener('click', loadGame);
  $('#btn-reset').addEventListener('click', confirmReset);
  elements.codexButton.addEventListener('click', showCodex);
  elements.doctrineButton.addEventListener('click', showRouteDoctrine);
  elements.teleportButton.addEventListener('click', showTeleport);
  elements.magicButton.addEventListener('click', showMagicBlade);
  elements.magicTierButton.addEventListener('click', showMagicBlade);
  elements.modalClose.addEventListener('click', closeModal);
  elements.modalRoot.querySelector('.modal-backdrop').addEventListener('click', closeModal);

  document.querySelectorAll('[data-move]').forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      scene?.move(button.dataset.move);
    });
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (!elements.modalRoot.classList.contains('hidden') || !elements.galRoot.classList.contains('hidden')) {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape' && cinematicControls?.skip) {
        event.preventDefault();
        cinematicControls.skip();
      } else if (key === 'b' && cinematicControls?.toggleBacklog) {
        event.preventDefault();
        cinematicControls.toggleBacklog();
      } else if (key === 'a' && cinematicControls?.toggleAuto) {
        event.preventDefault();
        cinematicControls.toggleAuto();
      } else if (key === 's' && cinematicControls?.toggleFast) {
        event.preventDefault();
        cinematicControls.toggleFast();
      } else if (key === 'h' && cinematicControls?.toggleUi) {
        event.preventDefault();
        cinematicControls.toggleUi();
      } else if ((event.key === 'Enter' || event.key === ' ') && cinematicControls?.advance) {
        event.preventDefault();
        cinematicControls.advance();
      } else if (KEYBOARD_DIRECTIONS[key]) {
        // A Gal scene locks movement, but still consumes movement keys so
        // focused browser controls cannot scroll the page beneath it.
        event.preventDefault();
      }
      return;
    }
    if (editableKeyTarget(event.target)) return;
    const direction = KEYBOARD_DIRECTIONS[key];
    if (direction) {
      event.preventDefault();
      scene?.move(direction);
      return;
    }
    if (key === 'e') showCodex();
    if (key === 'r') showRouteDoctrine();
    if (key === 't') showTeleport();
    if (key === 'm') showMagicBlade();
  });
}

async function boot() {
  installV8VisualLayer();
  installV83UiFixes();
  hydratePortraits();
  bindControls();
  updateHud();
  autoSave();
  let canvasAssetsPending = false;
  let startCanvasAssetsNow = null;
  const startCanvasAssets = () => {
    if (startCanvasAssetsNow) startCanvasAssetsNow();
    else canvasAssetsPending = true;
  };
  const bridge = {
    getState: () => state,
    canMove: () => elements.modalRoot.classList.contains('hidden') && elements.galRoot.classList.contains('hidden') && !state.victory,
    onResult: handleSceneResult,
    onReady: (readyScene) => {
      scene = readyScene;
      if (readyScene?.ctx) {
        applySceneThemeV8(readyScene);
        applyV83RenderFixes(readyScene);
      }
    },
    onAssetsReady: (readyScene) => {
      hydratePortraits();
      readyScene?.refresh?.();
      elements.loading.classList.add('hidden');
    }
  };

  // Keep the procedural game frame available immediately, but do not let the
  // opening story compete with the bulk gameplay-art preload. The authored
  // atlases begin loading as soon as the prologue ends or is skipped.
  const openingDialogueActive = initialGalDialogue(startCanvasAssets);

  try {
    const Phaser = await ensurePhaser();
    if (Phaser) {
      const SceneClass = createMagicTowerScene(Phaser, bridge);
      new Phaser.Game({
        type: Phaser.AUTO,
        parent: 'game-container',
        width: GRID_SIZE * TILE_SIZE,
        height: GRID_SIZE * TILE_SIZE,
        backgroundColor: '#090914',
        render: { antialias: true, pixelArt: false, roundPixels: true },
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene: [SceneClass]
      });
      return;
    }
    console.info('Phaser CDN unavailable or Canvas explicitly requested; using the local Canvas renderer.');
    const canvasScene = createCanvasTowerScene(bridge, undefined, { autoStart: !openingDialogueActive });
    if (openingDialogueActive) {
      startCanvasAssetsNow = () => { void canvasScene.start(); };
      if (canvasAssetsPending) {
        canvasAssetsPending = false;
        startCanvasAssetsNow();
      }
    }
  } catch (error) {
    console.error(error);
    elements.loading.textContent = `启动失败：${error.message}`;
    elements.loading.classList.remove('hidden');
  }
}

boot();
