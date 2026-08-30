import {
  CARD_LABELS,
  ENEMIES,
  FLOORS,
  GRID_SIZE,
  ITEMS,
  getShopCost
} from './data.js';
import {
  calculateBattle,
  deserializeState,
  getFloorState,
  getShopEffectMultiplier,
  getShopOptions,
  getTile,
  parseToken
} from './engine.js';
import { getRemainingExitGuardianIds } from './progression-rules.js';

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

function detail(label, value) {
  return { label, value };
}

function currentFloor(state) {
  return FLOORS[state.floor] ?? null;
}

function switchPuzzleFor(floor, switchId) {
  const entries = Object.entries(floor?.puzzles?.switches ?? {});
  const match = entries.find(([, requirements]) => requirements.includes(switchId));
  if (!match) return null;
  return { gateId: match[0], requirements: match[1] };
}

function sequenceInfo(state) {
  const floor = currentFloor(state);
  const sequence = floor?.puzzles?.sequence;
  if (!sequence) return null;
  const progress = getFloorState(state).sequenceProgress ?? 0;
  return {
    ...sequence,
    progress,
    expected: sequence.order[progress] ?? null,
    labelFor(id) {
      return sequence.labels?.[id] ?? id;
    }
  };
}

export function guardianMarkerLabel(enemy) {
  if (!enemy?.boss) return null;
  return enemy.finalBoss ? '最终守护者' : '结界守护者';
}

export function buildEnemyHoverPreview(state, enemyId) {
  const enemy = ENEMIES[enemyId];
  if (!state || !enemy) return null;
  const battle = calculateBattle(state.stats, enemy, state.relics, state.magic);
  const tone = battle.heroDamage <= 0 || !battle.winnable ? 'danger' : battle.totalDamage === 0 ? 'perfect' : 'safe';
  const damageText = battle.heroDamage <= 0 ? '无法破防' : `${formatNumber(battle.totalDamage)} HP`;
  const remainingText = battle.heroDamage <= 0
    ? '需要提高攻击后再交战'
    : battle.winnable
      ? `战后剩余 ${formatNumber(Math.max(0, battle.remainingHp))} HP`
      : '当前生命不足，会战败';

  return {
    kind: 'enemy',
    enemyId,
    enemy,
    title: enemy.name,
    badge: guardianMarkerLabel(enemy) ?? '敌方单位',
    guardian: guardianMarkerLabel(enemy),
    tone,
    damageText,
    remainingText,
    specialText: specialLabel(enemy),
    ...battle
  };
}

function buildHeroHoverPreview(state) {
  return {
    kind: 'hero',
    title: '绫星·璃',
    badge: '主角',
    tone: 'info',
    description: '当前角色状态。固定数值战斗不会出现随机伤害。',
    primaryLabel: '生命',
    primaryValue: `${formatNumber(state.stats.hp)} / ${formatNumber(state.stats.maxHp)} HP`,
    details: [
      detail('攻击 / 防御', `${formatNumber(state.stats.atk)} / ${formatNumber(state.stats.def)}`),
      detail('金币', formatNumber(state.stats.gold)),
      detail('魔力', state.magic?.unlocked ? `${state.magic.mp} / ${state.magic.maxMp} · 附刃 ${state.magic.tier} 档` : '尚未苏醒'),
      detail('结界卡', `日 ${state.cards.sun} · 月 ${state.cards.moon} · 星 ${state.cards.star}`)
    ]
  };
}

function buildItemHoverPreview(state, itemId) {
  const item = ITEMS[itemId];
  if (!item) return null;
  const badge = item.kind === 'card' ? '结界卡牌' : item.kind === 'relic' ? '宝物' : '成长宝物';
  const details = [];
  if (item.kind === 'card') {
    details.push(detail('当前持有', `${state.cards[item.card] ?? 0} 张`));
    details.push(detail('用途', '通过对应颜色结界时消耗 1 张'));
  } else if (item.kind === 'relic') {
    const owned = Boolean(state.relics[item.relicKey]);
    details.push(detail('状态', owned ? '已经获得' : '拾取后永久生效'));
  } else {
    details.push(detail('状态', '拾取后立即永久生效'));
  }
  return {
    kind: 'item',
    itemId,
    title: item.name,
    badge,
    tone: 'info',
    description: item.description,
    primaryLabel: item.kind === 'card' ? '拾取' : '效果',
    primaryValue: item.kind === 'card' ? `+${item.amount ?? 1} 张` : item.description,
    details
  };
}

function buildShopHoverPreview(state) {
  const cost = getShopCost(state);
  const affordable = state.stats.gold >= cost;
  const multiplier = getShopEffectMultiplier(state);
  const bonus = Math.max(0, Math.round((multiplier - 1) * 100));
  const options = getShopOptions(state);
  return {
    kind: 'shop',
    title: `阵间商店 · ${FLOORS[state.floor]?.shopTierLabel ?? '基础咏唱'}`,
    badge: bonus > 0 ? `效率 +${bonus}%` : '商店',
    tone: affordable ? 'safe' : 'warning',
    description: bonus > 0
      ? `本层商店的永久成长效率提高约 ${bonus}%；每次购买后价格仍会全局上升。`
      : '把敌人掉落的金币转换为永久成长；每次购买后价格会上升。',
    primaryLabel: '下一次购买',
    primaryValue: `${formatNumber(cost)} 金币`,
    details: [
      detail('当前金币', `${formatNumber(state.stats.gold)} · ${affordable ? '可以购买' : '金币不足'}`),
      ...options.map((option) => detail(option.label, option.description))
    ]
  };
}

function buildDoorHoverPreview(state, cardId) {
  const name = CARD_LABELS[cardId] ?? cardId;
  const count = state.cards[cardId] ?? 0;
  const canOpen = count > 0;
  return {
    kind: 'door',
    title: `${name}结界`,
    badge: '卡牌结界',
    tone: canOpen ? 'safe' : 'warning',
    description: '通过时固定消耗 1 张对应结界卡。',
    primaryLabel: '开启条件',
    primaryValue: `1 张${name}`,
    details: [detail('当前持有', `${count} 张 · ${canOpen ? '可以开启' : '暂时无法开启'}`)]
  };
}

function buildSwitchHoverPreview(state, switchId) {
  const floor = currentFloor(state);
  const floorState = getFloorState(state);
  const puzzle = switchPuzzleFor(floor, switchId);
  const activated = floorState.switches.includes(switchId);
  if (!puzzle) {
    return {
      kind: 'switch',
      title: '魔力机关开关',
      badge: '机关',
      tone: activated ? 'safe' : 'info',
      description: '踏上后触发本层机关。',
      primaryLabel: '状态',
      primaryValue: activated ? '已经激活' : '尚未激活',
      details: []
    };
  }
  const activeCount = puzzle.requirements.filter((id) => floorState.switches.includes(id)).length;
  return {
    kind: 'switch',
    title: '魔力机关开关',
    badge: '机关',
    tone: activated ? 'safe' : 'info',
    description: `本组共有 ${puzzle.requirements.length} 枚开关，全部激活后解除关联封锁。`,
    primaryLabel: '机关进度',
    primaryValue: `${activeCount} / ${puzzle.requirements.length}`,
    details: [detail('本开关', activated ? '已经激活' : '踏上后激活')]
  };
}

function buildGateHoverPreview(state, gateId) {
  const floor = currentFloor(state);
  const floorState = getFloorState(state);
  if (floor?.puzzles?.triGate === gateId) {
    const ready = state.cards.sun > 0 && state.cards.moon > 0 && state.cards.star > 0;
    return {
      kind: 'gate',
      title: '三相结界',
      badge: '复合结界',
      tone: ready ? 'safe' : 'warning',
      description: '同时消耗日曜、月辉、星蚀卡各 1 张才能通过。',
      primaryLabel: '开启条件',
      primaryValue: '日 / 月 / 星各 1 张',
      details: [detail('当前持有', `日 ${state.cards.sun} · 月 ${state.cards.moon} · 星 ${state.cards.star}`)]
    };
  }

  const switchRequirements = floor?.puzzles?.switches?.[gateId];
  if (switchRequirements) {
    const activeCount = switchRequirements.filter((id) => floorState.switches.includes(id)).length;
    return {
      kind: 'gate',
      title: '机关封锁结界',
      badge: '机关结界',
      tone: 'warning',
      description: '必须先激活全部关联开关，结界才会从地图上解除。',
      primaryLabel: '机关进度',
      primaryValue: `${activeCount} / ${switchRequirements.length}`,
      details: [detail('剩余', `${Math.max(0, switchRequirements.length - activeCount)} 枚开关`)]
    };
  }

  const sequence = sequenceInfo(state);
  if (sequence?.gate === gateId) {
    const order = sequence.order.map((id) => sequence.labelFor(id)).join(' → ');
    const next = sequence.expected ? sequence.labelFor(sequence.expected) : '序列已完成';
    return {
      kind: 'gate',
      title: '星序封锁结界',
      badge: '顺序结界',
      tone: 'warning',
      description: `按固定顺序踏过符文：${order}。`,
      primaryLabel: '当前进度',
      primaryValue: `${sequence.progress} / ${sequence.order.length}`,
      details: [detail('下一步', next)]
    };
  }

  return {
    kind: 'gate',
    title: '封锁结界',
    badge: '结界',
    tone: 'warning',
    description: '当前仍处于封锁状态。寻找本层机关、符文或对应资源解除它。',
    primaryLabel: '状态',
    primaryValue: '尚未解除',
    details: []
  };
}

function buildRuneHoverPreview(state, runeId) {
  const sequence = sequenceInfo(state);
  if (!sequence) {
    return {
      kind: 'rune',
      title: '魔力符文',
      badge: '符文机关',
      tone: 'info',
      description: '踏上后触发本层符文机关。',
      primaryLabel: '状态',
      primaryValue: '等待触发',
      details: []
    };
  }
  const index = sequence.order.indexOf(runeId);
  const label = sequence.labelFor(runeId);
  const expectedLabel = sequence.expected ? sequence.labelFor(sequence.expected) : '序列已完成';
  const isExpected = sequence.expected === runeId;
  return {
    kind: 'rune',
    title: `${label}符文`,
    badge: '顺序机关',
    tone: isExpected ? 'safe' : sequence.expected ? 'warning' : 'perfect',
    description: `完整顺序：${sequence.order.map((id) => sequence.labelFor(id)).join(' → ')}。踏错会按规则重置序列。`,
    primaryLabel: '序列位置',
    primaryValue: index >= 0 ? `第 ${index + 1} / ${sequence.order.length} 步` : '特殊符文',
    details: [
      detail('当前进度', `${sequence.progress} / ${sequence.order.length}`),
      detail('下一步', expectedLabel)
    ]
  };
}

function buildStairHoverPreview(state, direction) {
  const targetId = direction === 'up' ? state.floor + 1 : state.floor - 1;
  const target = FLOORS[targetId];
  const floor = currentFloor(state);
  if (!target) return null;
  const remainingGuardians = direction === 'up'
    ? getRemainingExitGuardianIds(getFloorState(state), floor)
    : [];
  const locked = remainingGuardians.length > 0;
  const guardianNames = remainingGuardians
    .map((id) => ENEMIES[id]?.name ?? id)
    .join('、');
  return {
    kind: 'stairs',
    title: direction === 'up' ? '上行楼层传送阵' : '下行楼层传送阵',
    badge: '楼层传送',
    tone: locked ? 'warning' : 'safe',
    description: direction === 'up' ? '进入上一层魔法阵。' : '返回已经到达的下一层魔法阵。',
    primaryLabel: '目标',
    primaryValue: `第 ${target.number} 阵 · ${target.title}`,
    details: [
      detail('状态', locked
        ? `上行结界仍由 ${remainingGuardians.length} 名守护者维持：${guardianNames}`
        : '传送通路已开放')
    ]
  };
}

function buildFallbackHoverPreview(token) {
  const parsed = parseToken(token);
  return {
    kind: 'unit',
    title: '魔法阵交互单位',
    badge: '交互单位',
    tone: 'info',
    description: '靠近或踏上后会触发该地图单位。',
    primaryLabel: '类型',
    primaryValue: parsed.type === token ? '特殊阵列' : parsed.type,
    details: []
  };
}

export function buildMapUnitHoverPreview(state, x, y) {
  if (!state || !Number.isInteger(x) || !Number.isInteger(y)) return null;
  const token = getTile(state, x, y);

  // When the hero stands on a persistent interactive tile (shop/stairs/rune),
  // explain that tile rather than hiding it behind the hero overlay.
  if (x === state.x && y === state.y && (token === '.' || token === 'S')) {
    return buildHeroHoverPreview(state);
  }
  if (token === '#' || token === '.' || token === 'S') return null;
  if (token === 'shop') return buildShopHoverPreview(state);
  if (token === 'U') return buildStairHoverPreview(state, 'up');
  if (token === 'D') return buildStairHoverPreview(state, 'down');

  const parsed = parseToken(token);
  if (parsed.type === 'enemy') return buildEnemyHoverPreview(state, parsed.id);
  if (parsed.type === 'item') return buildItemHoverPreview(state, parsed.id);
  if (parsed.type === 'door') return buildDoorHoverPreview(state, parsed.id);
  if (parsed.type === 'switch') return buildSwitchHoverPreview(state, parsed.id);
  if (parsed.type === 'gate') return buildGateHoverPreview(state, parsed.id);
  if (parsed.type === 'rune') return buildRuneHoverPreview(state, parsed.id);
  return buildFallbackHoverPreview(token);
}

export function getEnemyHoverAt(state, x, y) {
  const preview = buildMapUnitHoverPreview(state, x, y);
  return preview?.kind === 'enemy' ? preview : null;
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

function renderHeader(card, preview) {
  const header = document.createElement('div');
  header.className = 'enemy-hover-header';
  const title = document.createElement('strong');
  title.textContent = preview.title;
  header.append(title);
  if (preview.badge) {
    const badge = document.createElement('span');
    badge.className = 'enemy-hover-guardian';
    badge.textContent = preview.badge;
    header.append(badge);
  }
  card.append(header);
}

function renderEnemyTooltip(card, preview) {
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

  const detailText = document.createElement('p');
  detailText.className = 'enemy-hover-detail';
  detailText.textContent = preview.heroDamage <= 0
    ? preview.reason ?? preview.specialText
    : `${preview.rounds} 回合 · 敌方每次反击 ${formatNumber(preview.enemyDamage)} · ${preview.specialText}`;

  card.append(stats, damage, result, detailText);
}

function renderUnitTooltip(card, preview) {
  if (preview.description) {
    const description = document.createElement('p');
    description.className = 'unit-hover-description';
    description.textContent = preview.description;
    card.append(description);
  }

  if (preview.primaryLabel || preview.primaryValue) {
    const primary = document.createElement('div');
    primary.className = 'unit-hover-primary';
    const label = document.createElement('span');
    label.textContent = preview.primaryLabel ?? '状态';
    const value = document.createElement('strong');
    value.textContent = preview.primaryValue ?? '';
    primary.append(label, value);
    card.append(primary);
  }

  if (preview.details?.length) {
    const details = document.createElement('div');
    details.className = 'unit-hover-details';
    preview.details.forEach((entry) => {
      const row = document.createElement('p');
      const label = document.createElement('span');
      label.textContent = entry.label;
      const value = document.createElement('strong');
      value.textContent = entry.value;
      row.append(label, value);
      details.append(row);
    });
    card.append(details);
  }
}

function renderTooltip(card, preview) {
  card.replaceChildren();
  card.dataset.tone = preview.tone ?? 'info';
  card.dataset.kind = preview.kind ?? 'unit';
  renderHeader(card, preview);
  if (preview.kind === 'enemy') renderEnemyTooltip(card, preview);
  else renderUnitTooltip(card, preview);
}

function positionTooltip(card, event) {
  const margin = 10;
  const width = card.offsetWidth || 294;
  const height = card.offsetHeight || 180;
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
    // Anchor to the cell's top edge, then CSS lifts the entire pill above it.
    // This keeps the marker outside the enemy portrait instead of covering art.
    node.style.top = `${rect.top + (marker.y / GRID_SIZE) * rect.height}px`;
    return node;
  });
  layer.replaceChildren(...nodes);
}

export async function installTacticalInteractionLayer() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null;
  const canvas = await waitForCanvas();
  if (!canvas || canvas.dataset.tacticalInteraction === 'installed') return null;
  canvas.dataset.tacticalInteraction = 'installed';
  canvas.setAttribute('aria-description', '鼠标悬停地图单位可查看功能、资源需求与战斗耗血；地图会以文字标出当前楼层守护者位置。');

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
    const preview = tile && state ? buildMapUnitHoverPreview(state, tile.x, tile.y) : null;
    if (!preview) {
      hideTooltip();
      return;
    }
    renderTooltip(tooltip, preview);
    tooltip.classList.remove('hidden');
    positionTooltip(tooltip, event);
    canvas.style.cursor = 'help';
    if (persistForTouch) {
      clearTimeout(touchHideTimer);
      touchHideTimer = setTimeout(hideTooltip, 1900);
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
