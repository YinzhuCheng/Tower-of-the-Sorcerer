import { ENEMIES, GRID_SIZE } from './data.js';
import { calculateBattle, deserializeState, getTile, parseToken } from './engine.js';

const AUTO_SAVE_KEY = 'lost-magic-tower:auto:v1';
const MANUAL_SAVE_KEY = 'lost-magic-tower:manual:v1';

function formatNumber(value) {
  return Number.isFinite(value) ? Math.round(value).toLocaleString('zh-CN') : '∞';
}

function specialLabel(enemy) {
  if (enemy.special === 'magic') return `魔法伤害 ${enemy.magicPower ?? enemy.atk}/次`;
  if (enemy.special === 'firstStrike') return '先制攻击';
  if (enemy.special === 'doubleHit') return '二连击';
  return '普通攻击';
}

export function guardianMarkerLabel(enemy) {
  if (!enemy?.boss) return null;
  return enemy.finalBoss ? '最终守护者' : '结界守护者';
}

export function buildEnemyHoverPreview(state, enemyId) {
  const enemy = ENEMIES[enemyId];
  if (!state || !enemy) return null;
  const battle = calculateBattle(state.stats, enemy, state.relics);
  const tone = battle.heroDamage <= 0 || !battle.winnable ? 'danger' : battle.totalDamage === 0 ? 'perfect' : 'safe';
  const damageText = battle.heroDamage <= 0 ? '无法破防' : `${formatNumber(battle.totalDamage)} HP`;
  const remainingText = battle.heroDamage <= 0
    ? '需要提高攻击后再交战'
    : battle.winnable
      ? `战后剩余 ${formatNumber(Math.max(0, battle.remainingHp))} HP`
      : '当前生命不足，会战败';

  return {
    enemyId,
    enemy,
    guardian: guardianMarkerLabel(enemy),
    tone,
    damageText,
    remainingText,
    specialText: specialLabel(enemy),
    ...battle
  };
}

export function getEnemyHoverAt(state, x, y) {
  if (!state || !Number.isInteger(x) || !Number.isInteger(y)) return null;
  const parsed = parseToken(getTile(state, x, y));
  if (parsed.type !== 'enemy') return null;
  return buildEnemyHoverPreview(state, parsed.id);
}

export function listGuardianMarkers(state) {
  if (!state) return [];
  const markers = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const parsed = parseToken(getTile(state, x, y));
      if (parsed.type !== 'enemy') continue;
      const enemy = ENEMIES[parsed.id];
      const label = guardianMarkerLabel(enemy);
      if (!label) continue;
      markers.push({ x, y, enemyId: parsed.id, enemy, label });
    }
  }
  return markers;
}

function readCurrentState() {
  try {
    const serialized = localStorage.getItem(AUTO_SAVE_KEY) ?? localStorage.getItem(MANUAL_SAVE_KEY);
    return serialized ? deserializeState(serialized) : null;
  } catch {
    return null;
  }
}

function waitForCanvas(timeoutMs = 12_000) {
  const existing = document.querySelector('#game-container canvas');
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const canvas = document.querySelector('#game-container canvas');
      if (!canvas) return;
      observer.disconnect();
      clearTimeout(timeout);
      resolve(canvas);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timeout = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeoutMs);
  });
}

function createTooltip() {
  const card = document.createElement('aside');
  card.className = 'enemy-hover-card hidden';
  card.setAttribute('role', 'status');
  card.setAttribute('aria-live', 'polite');
  document.body.append(card);
  return card;
}

function renderTooltip(card, preview) {
  card.replaceChildren();
  card.dataset.tone = preview.tone;

  const header = document.createElement('div');
  header.className = 'enemy-hover-header';
  const title = document.createElement('strong');
  title.textContent = preview.enemy.name;
  header.append(title);
  if (preview.guardian) {
    const badge = document.createElement('span');
    badge.className = 'enemy-hover-guardian';
    badge.textContent = preview.guardian;
    header.append(badge);
  }

  const stats = document.createElement('p');
  stats.className = 'enemy-hover-stats';
  stats.textContent = `HP ${formatNumber(preview.enemy.hp)} · ATK ${formatNumber(preview.enemy.atk)} · DEF ${formatNumber(preview.enemy.def)}`;

  const damage = document.createElement('div');
  damage.className = 'enemy-hover-damage';
  const damageLabel = document.createElement('span');
  damageLabel.textContent = '预计耗血';
  const damageValue = document.createElement('strong');
  damageValue.textContent = preview.damageText;
  damage.append(damageLabel, damageValue);

  const result = document.createElement('p');
  result.className = 'enemy-hover-result';
  result.textContent = preview.remainingText;

  const detail = document.createElement('p');
  detail.className = 'enemy-hover-detail';
  detail.textContent = preview.heroDamage <= 0
    ? preview.reason ?? preview.specialText
    : `${preview.rounds} 回合 · 敌方每次反击 ${formatNumber(preview.enemyDamage)} · ${preview.specialText}`;

  card.append(header, stats, damage, result, detail);
}

function positionTooltip(card, event) {
  const margin = 10;
  const width = 276;
  const height = 154;
  const left = Math.max(margin, Math.min(event.clientX + 16, window.innerWidth - width - margin));
  const top = Math.max(margin, Math.min(event.clientY + 16, window.innerHeight - height - margin));
  card.style.left = `${left}px`;
  card.style.top = `${top}px`;
}

function pointerTile(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const x = Math.floor(((event.clientX - rect.left) / rect.width) * GRID_SIZE);
  const y = Math.floor(((event.clientY - rect.top) / rect.height) * GRID_SIZE);
  if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return null;
  return { x, y };
}

function createMarkerLayer() {
  const layer = document.createElement('div');
  layer.className = 'guardian-marker-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
  return layer;
}

function renderGuardianMarkers(layer, canvas, state) {
  if (!canvas.isConnected || !state) {
    layer.replaceChildren();
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const markers = listGuardianMarkers(state);
  const nodes = markers.map((marker) => {
    const node = document.createElement('div');
    node.className = 'guardian-map-marker';
    node.dataset.enemyId = marker.enemyId;
    node.textContent = marker.label;
    node.style.left = `${rect.left + ((marker.x + 0.5) / GRID_SIZE) * rect.width}px`;
    node.style.top = `${rect.top + ((marker.y + 0.5) / GRID_SIZE) * rect.height}px`;
    return node;
  });
  layer.replaceChildren(...nodes);
}

export async function installTacticalInteractionLayer() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null;
  const canvas = await waitForCanvas();
  if (!canvas || canvas.dataset.tacticalInteraction === 'installed') return null;
  canvas.dataset.tacticalInteraction = 'installed';
  canvas.setAttribute('aria-description', '鼠标悬停敌方单位可查看预计耗血；地图会以文字标出当前楼层守护者位置。');

  const tooltip = createTooltip();
  const markerLayer = createMarkerLayer();
  let touchHideTimer = null;

  const hideTooltip = () => {
    tooltip.classList.add('hidden');
    canvas.style.cursor = '';
  };

  const previewAtEvent = (event, persistForTouch = false) => {
    const state = readCurrentState();
    const tile = pointerTile(canvas, event);
    const preview = tile && state ? getEnemyHoverAt(state, tile.x, tile.y) : null;
    if (!preview) {
      hideTooltip();
      return;
    }
    renderTooltip(tooltip, preview);
    positionTooltip(tooltip, event);
    tooltip.classList.remove('hidden');
    canvas.style.cursor = 'help';
    if (persistForTouch) {
      clearTimeout(touchHideTimer);
      touchHideTimer = setTimeout(hideTooltip, 1500);
    }
  };

  const onPointerMove = (event) => previewAtEvent(event, false);
  const onPointerLeave = () => hideTooltip();
  const onPointerDownCapture = (event) => {
    if (event.pointerType !== 'mouse') previewAtEvent(event, true);
  };
  const updateMarkers = () => renderGuardianMarkers(markerLayer, canvas, readCurrentState());

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('pointerdown', onPointerDownCapture, { capture: true });
  window.addEventListener('resize', updateMarkers);
  window.addEventListener('scroll', updateMarkers, { passive: true });
  const markerTimer = window.setInterval(updateMarkers, 250);
  updateMarkers();

  return () => {
    clearTimeout(touchHideTimer);
    clearInterval(markerTimer);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    canvas.removeEventListener('pointerdown', onPointerDownCapture, { capture: true });
    window.removeEventListener('resize', updateMarkers);
    window.removeEventListener('scroll', updateMarkers);
    tooltip.remove();
    markerLayer.remove();
    delete canvas.dataset.tacticalInteraction;
  };
}
