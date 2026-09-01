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
  getEffectiveEnemy,
  getFloorState,
  getShopEffectMultiplier,
  getShopOptions,
  getTile,
  parseToken
} from './engine.js';
import {
  getCardGateRequirements,
  getMissingCards,
  getMissingGuardianIds,
  getRemainingExitGuardianIds
} from './progression-rules.js';
import { combatRuleCopy } from './player-copy.js';
import { getBossProtocolBriefing } from './boss-protocols.js';
import { getAct3HandoffForEnemy, getSelectedAct3Handoff } from './act3-handoff-priorities.js';
import { getRouteDoctrineExitBlocker } from './route-doctrine-effects.js';

const AUTO_SAVE_KEY = 'lost-magic-tower:auto:v1';
const MANUAL_SAVE_KEY = 'lost-magic-tower:manual:v1';

function formatNumber(value) {
  return Number.isFinite(value) ? Math.round(value).toLocaleString('zh-CN') : '∞';
}

function specialLabel(enemy) {
  return combatRuleCopy(enemy, { compact: true });
}

function detail(label, value) {
  return { label, value };
}

const ROMAN_LINKS = Object.freeze(['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ']);
const LETTER_LINKS = Object.freeze(['A', 'B', 'C', 'D', 'E', 'F']);

const SWITCH_PUZZLE_NAMES = Object.freeze({
  vine: Object.freeze({ switch: '藤蔓机关', gate: '藤蔓封锁' }),
  tide: Object.freeze({ switch: '潮汐机关', gate: '潮汐封锁' }),
  ember: Object.freeze({ switch: '赤焰机关', gate: '赤焰封锁' }),
  forge: Object.freeze({ switch: '锻炉机关', gate: '锻炉封锁' }),
  hush: Object.freeze({ switch: '静默机关', gate: '静默封锁' }),
  mirror: Object.freeze({ switch: '镜序机关', gate: '镜序封锁' }),
  tri: Object.freeze({ switch: '三相机关', gate: '三相封锁' }),
  blackstar: Object.freeze({ switch: '黯星机关', gate: '黯星封锁' })
});

function puzzleName(gateId, part) {
  return SWITCH_PUZZLE_NAMES[gateId]?.[part] ?? (part === 'switch' ? '魔力机关' : '机关封锁');
}

function linkCodeForSwitchGate(floor, gateId) {
  const index = Object.keys(floor?.puzzles?.switches ?? {}).indexOf(gateId);
  return LETTER_LINKS[index] ?? `M${index + 1}`;
}

function guardianGateName(gateId, rewardIds) {
  if (gateId === 'dualKeyVault' && rewardIds.includes('lucky')) return '招财星币宝库封印';
  return rewardIds.length > 0 ? '守护宝库封印' : '守护封锁结界';
}

function formatCardRequirement(requirements) {
  return Object.entries(requirements ?? {})
    .map(([card, amount]) => `${CARD_LABELS[card] ?? card} ×${amount}`)
    .join('、');
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

function enemyRuleText(state, enemyId, enemy) {
  const floor = currentFloor(state);
  let eventText = null;
  if (floor?.number === 18 && enemyId === 'voidHerald') {
    const protocol = getBossProtocolBriefing(state).find((entry) => entry.id === 'void-audit');
    eventText = protocol?.active
      ? '虚空审计已完成：回声摄政官的生命与魔法伤害已降低。'
      : '击败后：回声摄政官生命 -18%，每次魔法伤害 -45。';
  }

  const handoff = floor?.number === 27 ? getAct3HandoffForEnemy(enemyId) : null;
  if (handoff) {
    const selected = getSelectedAct3Handoff(state);
    eventText = !selected
      ? `若它是首个被击败的校场守卫：锁定「${handoff.title}」；${handoff.payoff} 另外两项支援本轮不再获得。`
      : selected.id === handoff.id
        ? `已锁定「${selected.title}」：${selected.payoff}`
        : `本轮已锁定「${selected.title}」；「${handoff.title}」不再获得。`;
  }
  const modifierLabels = [
    ...(enemy?.protocolLabels ?? []),
    ...(enemy?.councilLabels ?? []),
    ...(enemy?.charterLabels ?? []),
    ...(enemy?.handoffLabels ?? [])
  ];
  const modifierText = modifierLabels.length ? `当前已生效：${modifierLabels.join('；')}。` : null;
  return [eventText, modifierText].filter(Boolean).join(' ');
}

export function buildEnemyHoverPreview(state, enemyId) {
  const enemy = getEffectiveEnemy(state, enemyId);
  if (!state || !enemy) return null;
  const battle = calculateBattle(state.stats, enemy, state.relics, state.magic);
  const tone = battle.heroDamage <= 0 || !battle.winnable ? 'danger' : battle.totalDamage === 0 ? 'perfect' : 'safe';
  const damageText = battle.heroDamage <= 0
    ? '无法破防'
    : battle.magicAffordable === false
      ? `需要 ${formatNumber(battle.magicCost)} MP`
      : `${formatNumber(battle.totalDamage)} HP`;
  const remainingText = battle.heroDamage <= 0
    ? '需要提高攻击后再交战'
    : battle.magicAffordable === false
      ? `本战不能开始：${battle.reason}。请降低附刃档位或恢复 MP。`
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
    ruleText: enemyRuleText(state, enemyId, enemy),
    ...battle
  };
}

function buildHeroHoverPreview(state) {
  return {
    kind: 'hero',
    title: '绫星·璃',
    badge: '主角',
    tone: 'info',
    description: '固定数值战斗：敌人悬停信息会显示预计耗血与战后生命。',
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
  const floor = currentFloor(state);
  const optionalNote = floor?.number === 4 && itemId === 'weapon'
    ? '可选奖励；不影响上行阶梯。'
    : null;
  const badge = item.kind === 'card' ? '结界卡牌' : item.kind === 'relic' ? '宝物' : '成长宝物';
  const details = [];
  if (item.kind === 'card') {
    details.push(detail('当前持有', `${state.cards[item.card] ?? 0} 张`));
    details.push(detail('用途', '穿过对应颜色结界时立刻消耗 1 张'));
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
    description: [item.description, optionalNote].filter(Boolean).join(' '),
    primaryLabel: item.kind === 'card' ? '拾取' : '效果',
    primaryValue: item.kind === 'card' ? `+${item.amount ?? 1} 张` : item.description,
    details: [...details, ...(optionalNote ? [detail('上行关系', optionalNote)] : [])]
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
      ? `本层购买效果额外 +${bonus}%；每次购买后下一次价格会上升。`
      : '购买后立刻永久成长；每次购买后下一次价格会上升。',
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
    description: '穿过时立刻消耗 1 张对应结界卡。',
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
      title: '魔力机关',
      badge: '机关',
      tone: activated ? 'safe' : 'info',
      description: '踏上后触发本层机关。',
      primaryLabel: '状态',
      primaryValue: activated ? '已经激活' : '尚未激活',
      details: []
    };
  }
  const activeCount = puzzle.requirements.filter((id) => floorState.switches.includes(id)).length;
  const linkIndex = Object.keys(floor?.puzzles?.switches ?? {}).indexOf(puzzle.gateId);
  const linkCode = LETTER_LINKS[linkIndex] ?? `M${linkIndex + 1}`;
  return {
    kind: 'switch',
    title: puzzleName(puzzle.gateId, 'switch'),
    badge: '机关',
    tone: activated ? 'safe' : 'info',
    description: `本组共有 ${puzzle.requirements.length} 枚机关；全部激活后，${linkCode} 封锁会解除。`,
    primaryLabel: '机关进度',
    primaryValue: `${activeCount} / ${puzzle.requirements.length}`,
    details: [
      detail('关联标记', `${linkCode} → ${puzzleName(puzzle.gateId, 'gate')}`),
      detail('本开关', activated ? '已经激活' : '踏上后激活')
    ]
  };
}

function buildGateHoverPreview(state, gateId) {
  const floor = currentFloor(state);
  const floorState = getFloorState(state);
  const cardRequirements = getCardGateRequirements(floor, gateId);
  if (cardRequirements) {
    const missing = getMissingCards(state.cards, cardRequirements);
    const ready = missing.length === 0;
    const voidAudit = gateId === 'f18StarChannel'
      ? getBossProtocolBriefing(state).find((entry) => entry.id === 'void-audit')
      : null;
    return {
      kind: 'gate',
      title: voidAudit ? '星渠封锁结界' : '卡牌封锁结界',
      badge: '卡牌结界',
      tone: ready ? 'safe' : 'warning',
      description: voidAudit
        ? '穿过时消耗星蚀卡 ×2；后方的虚空先驱会决定回声摄政官的终局数值。'
        : '穿过时按下列条件一次性消耗对应结界卡。',
      primaryLabel: '开启条件',
      primaryValue: formatCardRequirement(cardRequirements),
      details: [
        detail('当前持有', `日 ${state.cards.sun} · 月 ${state.cards.moon} · 星 ${state.cards.star}`),
        detail('状态', ready ? '可以开启' : `还缺 ${formatCardRequirement(Object.fromEntries(missing.map(({ card, missing: amount }) => [card, amount])))}`),
        ...(voidAudit ? [detail('完成效果', voidAudit.active ? '虚空审计已完成' : '击败虚空先驱后：回声摄政官生命 -18%，每次魔法伤害 -45')] : [])
      ]
    };
  }

  const switchRequirements = floor?.puzzles?.switches?.[gateId];
  if (switchRequirements) {
    const activeCount = switchRequirements.filter((id) => floorState.switches.includes(id)).length;
    return {
      kind: 'gate',
      title: puzzleName(gateId, 'gate'),
      badge: '机关结界',
      tone: 'warning',
      description: `全部 ${linkCodeForSwitchGate(floor, gateId)} 机关激活后，封锁自动解除。`,
      primaryLabel: '机关进度',
      primaryValue: `${activeCount} / ${switchRequirements.length}`,
      details: [
        detail('关联标记', `${linkCodeForSwitchGate(floor, gateId)} → ${puzzleName(gateId, 'switch')}`),
        detail('剩余', `${Math.max(0, switchRequirements.length - activeCount)} 枚机关`)
      ]
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
      description: `按固定顺序踩符文：${order}。`,
      primaryLabel: '当前进度',
      primaryValue: `${sequence.progress} / ${sequence.order.length}`,
      details: [detail('下一步', next)]
    };
  }

  const guardianRequirements = floor?.puzzles?.guardianGates?.[gateId];
  if (guardianRequirements) {
    const missing = getMissingGuardianIds(floorState, floor, gateId);
    const complete = guardianRequirements.length - missing.length;
    const linkIndex = Object.keys(floor?.puzzles?.guardianGates ?? {}).indexOf(gateId);
    const linkCode = ROMAN_LINKS[linkIndex] ?? `G${linkIndex + 1}`;
    const rewardIds = floor?.puzzles?.visualLinks?.guardianRewards?.[gateId] ?? [];
    return {
      kind: 'gate',
      title: guardianGateName(gateId, rewardIds),
      badge: `关联 ${linkCode}`,
      tone: missing.length === 0 ? 'safe' : 'warning',
      description: rewardIds.length > 0
        ? '击败同编号守护者后解除封印，领取同编号奖励。'
        : '击败同编号守护者后，封印会自动解除。',
      primaryLabel: '守护进度',
      primaryValue: `${complete} / ${guardianRequirements.length}`,
      details: [
        detail('剩余守卫', missing.length ? missing.map((id) => ENEMIES[id]?.name ?? id).join('、') : '全部已击败'),
        ...(rewardIds.length ? [detail('关联奖励', rewardIds.map((id) => ITEMS[id]?.name ?? id).join('、'))] : [])
      ]
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
    description: `顺序：${sequence.order.map((id) => sequence.labelFor(id)).join(' → ')}。踩错会重置进度，不消耗资源。`,
    primaryLabel: '序列位置',
    primaryValue: index >= 0 ? `第 ${index + 1} / ${sequence.order.length} 步` : '特殊符文',
    details: [
      detail('当前进度', `${sequence.progress} / ${sequence.order.length}`),
      detail('下一步', expectedLabel)
    ]
  };
}

function upstairsCondition(state, floor, remainingGuardians) {
  if (floor?.number === 11 && !state.doctrine?.selectedId && state.doctrine?.legacyOpen !== true) {
    return '离开前需要签署一份见证契约；选择本身不消耗资源。';
  }
  if (floor?.number === 21 && !state.charter?.selectedId && state.charter?.legacyOpen !== true) {
    return '离开前需要选择一份修复章程；选择本身不消耗资源。';
  }
  const doctrineBlocker = getRouteDoctrineExitBlocker(state);
  if (doctrineBlocker) return doctrineBlocker;
  if (remainingGuardians.length > 0) {
    const guardianNames = remainingGuardians.map((id) => ENEMIES[id]?.name ?? id).join('、');
    return `上行结界仍由 ${remainingGuardians.length} 名守护者维持：${guardianNames}`;
  }
  return '传送通路已开放';
}

function buildStairHoverPreview(state, direction) {
  const targetId = direction === 'up' ? state.floor + 1 : state.floor - 1;
  const target = FLOORS[targetId];
  const floor = currentFloor(state);
  if (!target) return null;
  const remainingGuardians = direction === 'up'
    ? getRemainingExitGuardianIds(getFloorState(state), floor)
    : [];
  const condition = direction === 'up' ? upstairsCondition(state, floor, remainingGuardians) : '传送通路已开放';
  const locked = direction === 'up' && condition !== '传送通路已开放';
  return {
    kind: 'stairs',
    title: direction === 'up' ? '上行楼层传送阵' : '下行楼层传送阵',
    badge: '楼层传送',
    tone: locked ? 'warning' : 'safe',
    description: direction === 'up' ? '通往下一层。' : '返回已经到达的上一层。',
    primaryLabel: '前往',
    primaryValue: `第 ${target.number} 阵 · ${target.title}`,
    details: [
      detail('状态', condition)
    ]
  };
}

function buildCouncilHoverPreview(state) {
  const complete = state.council?.completed === true;
  return {
    kind: 'council',
    title: '王座前共鸣会战',
    badge: '会战部署',
    tone: complete ? 'safe' : 'warning',
    description: complete
      ? '会战已经完成，王座前的封锁已解除。'
      : '踏入后打开部署面板：面板会列出敌方顺序、可出战盟友、可分配 MP 与预演结果。',
    primaryLabel: '状态',
    primaryValue: complete ? '已经完成' : '尚未部署',
    details: complete ? [] : [detail('确认条件', '只有预演为胜利的部署才能确认；查看与预演不消耗资源。')]
  };
}

function attachRelationHint(state, x, y, preview) {
  if (!preview || (preview.kind !== 'enemy' && preview.kind !== 'item')) return preview;
  const codes = [...getInteractionLinkCodesAt(state, x, y)];
  if (!codes.length) return preview;
  const hint = `关联 ${codes.join('、')}：同标记的单位会同时高亮。`;
  if (preview.kind === 'enemy') return { ...preview, relationText: hint };
  return { ...preview, details: [...(preview.details ?? []), detail('关联标记', hint)] };
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
  if (token === 'council') return buildCouncilHoverPreview(state);
  if (parsed.type === 'enemy') return attachRelationHint(state, x, y, buildEnemyHoverPreview(state, parsed.id));
  if (parsed.type === 'item') return attachRelationHint(state, x, y, buildItemHoverPreview(state, parsed.id));
  if (parsed.type === 'door') return buildDoorHoverPreview(state, parsed.id);
  if (parsed.type === 'switch') return buildSwitchHoverPreview(state, parsed.id);
  if (parsed.type === 'gate') return buildGateHoverPreview(state, parsed.id);
  if (parsed.type === 'rune') return buildRuneHoverPreview(state, parsed.id);
  return null;
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

function tilesMatching(state, token) {
  const matches = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (getTile(state, x, y) === token) matches.push({ x, y });
    }
  }
  return matches;
}

/**
 * Map labels are deliberately short identifiers, not lines crossing the maze.
 * The same identifier on a guardian, switch, seal and reward is the durable
 * spatial explanation; the hover card supplies the detailed rule on demand.
 */
export function listInteractionMarkers(state) {
  if (!state) return [];
  const floor = currentFloor(state);
  const floorState = getFloorState(state);
  const guardianCodes = new Map();
  const markers = [];

  for (const [index, [gateId, guardianIds]] of Object.entries(floor?.puzzles?.guardianGates ?? {}).entries()) {
    const code = ROMAN_LINKS[index] ?? `G${index + 1}`;
    const missing = getMissingGuardianIds(floorState, floor, gateId);
    for (const enemyId of guardianIds) guardianCodes.set(enemyId, code);
    for (const { x, y } of tilesMatching(state, `gate:${gateId}`)) {
      markers.push({ x, y, label: `${code} · ${guardianIds.length - missing.length}/${guardianIds.length}`, kind: 'guardian-gate', linkCode: code });
    }
    for (const itemId of floor?.puzzles?.visualLinks?.guardianRewards?.[gateId] ?? []) {
      for (const { x, y } of tilesMatching(state, `item:${itemId}`)) {
        markers.push({ x, y, label: `${code} · 奖`, kind: 'guardian-reward', linkCode: code });
      }
    }
  }

  for (const [index, [gateId, switchIds]] of Object.entries(floor?.puzzles?.switches ?? {}).entries()) {
    const code = LETTER_LINKS[index] ?? `M${index + 1}`;
    const active = switchIds.filter((id) => floorState.switches.includes(id)).length;
    for (const switchId of switchIds) {
      for (const { x, y } of tilesMatching(state, `switch:${switchId}`)) {
        markers.push({ x, y, label: code, kind: 'switch', linkCode: code });
      }
    }
    for (const { x, y } of tilesMatching(state, `gate:${gateId}`)) {
      markers.push({ x, y, label: `${code} · ${active}/${switchIds.length}`, kind: 'switch-gate', linkCode: code });
    }
  }

  for (const marker of listGuardianMarkers(state)) {
    markers.push({
      ...marker,
      label: guardianCodes.get(marker.enemyId) ?? marker.label,
      kind: guardianCodes.has(marker.enemyId) ? 'guardian' : 'guardian-default',
      linkCode: guardianCodes.get(marker.enemyId) ?? null
    });
  }
  return markers;
}

export function getInteractionLinkCodesAt(state, x, y) {
  return new Set(
    listInteractionMarkers(state)
      .filter((marker) => marker.x === x && marker.y === y && marker.linkCode)
      .map((marker) => marker.linkCode)
  );
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
  detailText.textContent = preview.heroDamage <= 0 || preview.magicAffordable === false
    ? preview.reason ?? preview.specialText
    : `${preview.rounds} 回合 · 每次反击 ${formatNumber(preview.enemyDamage)} · ${combatRuleCopy(preview.enemy)}`;

  card.append(stats, damage, result, detailText);
  if (preview.magicTier > 0) {
    const magic = document.createElement('p');
    magic.className = 'enemy-hover-detail';
    magic.textContent = `当前附刃 ${preview.magicTier} 档：本战开始时消耗 ${formatNumber(preview.magicCost)} MP。`;
    card.append(magic);
  }
  if (preview.ruleText) {
    const rule = document.createElement('p');
    rule.className = 'enemy-hover-event';
    rule.textContent = preview.ruleText;
    card.append(rule);
  }
  if (preview.relationText) {
    const relation = document.createElement('p');
    relation.className = 'enemy-hover-event';
    relation.textContent = preview.relationText;
    card.append(relation);
  }
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

function renderGuardianMarkers(layer, canvas, state, { focusedCodes = new Set(), flashedCodes = new Set(), flashMarkers = [] } = {}) {
  if (!canvas.isConnected || !state) {
    layer.replaceChildren();
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const markers = listInteractionMarkers(state);
  const haloKeys = new Set();
  const halos = [...markers, ...flashMarkers].flatMap((marker) => {
    const active = marker.linkCode && (focusedCodes.has(marker.linkCode) || flashedCodes.has(marker.linkCode));
    const key = `${marker.x}:${marker.y}`;
    if (!active || haloKeys.has(key)) return [];
    haloKeys.add(key);
    const halo = document.createElement('div');
    halo.className = `interaction-map-halo interaction-map-halo-${marker.kind ?? 'guardian-default'}${focusedCodes.has(marker.linkCode) ? ' relation-focused' : ''}${flashedCodes.has(marker.linkCode) ? ' relation-flashed' : ''}`;
    halo.style.left = `${rect.left + (marker.x / GRID_SIZE) * rect.width}px`;
    halo.style.top = `${rect.top + (marker.y / GRID_SIZE) * rect.height}px`;
    halo.style.width = `${rect.width / GRID_SIZE}px`;
    halo.style.height = `${rect.height / GRID_SIZE}px`;
    return [halo];
  });
  const nodes = markers.map((marker) => {
    const node = document.createElement('div');
    node.className = `guardian-map-marker interaction-marker interaction-marker-${marker.kind ?? 'guardian-default'}${marker.linkCode && focusedCodes.has(marker.linkCode) ? ' relation-focused' : ''}${marker.linkCode && flashedCodes.has(marker.linkCode) ? ' relation-flashed' : ''}`;
    node.dataset.enemyId = marker.enemyId;
    if (marker.linkCode) node.dataset.linkCode = marker.linkCode;
    node.textContent = marker.label;
    node.style.left = `${rect.left + ((marker.x + 0.5) / GRID_SIZE) * rect.width}px`;
    // Anchor to the cell's top edge, then CSS lifts the entire pill above it.
    // This keeps the marker outside the enemy portrait instead of covering art.
    node.style.top = `${rect.top + (marker.y / GRID_SIZE) * rect.height}px`;
    return node;
  });
  layer.replaceChildren(...halos, ...nodes);
}

export async function installTacticalInteractionLayer() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null;
  const canvas = await waitForCanvas();
  if (!canvas || canvas.dataset.tacticalInteraction === 'installed') return null;
  canvas.dataset.tacticalInteraction = 'installed';
  canvas.setAttribute('aria-description', '鼠标悬停地图单位可查看功能、资源需求与战斗耗血；触摸时第一次只查看，再次触摸同一格才行动。键盘玩家可按 V 打开四邻对象说明。');

  const tooltip = createTooltip();
  const markerLayer = createMarkerLayer();
  let touchHideTimer = null;
  let touchArmedTile = null;
  let focusedCodes = new Set();
  let lastRelationSnapshot = null;
  const flashUntil = new Map();
  const flashMarkersByCode = new Map();

  const relationSnapshot = (currentState) => {
    if (!currentState) return null;
    const markers = listInteractionMarkers(currentState);
    const byCode = new Map();
    for (const marker of markers) {
      if (!marker.linkCode) continue;
      const entry = `${marker.kind}:${marker.label}:${marker.x}:${marker.y}`;
      byCode.set(marker.linkCode, [...(byCode.get(marker.linkCode) ?? []), entry]);
    }
    return {
      floor: currentState.floor,
      markers,
      byCode: new Map([...byCode].map(([code, entries]) => [code, entries.sort().join('|')]))
    };
  };

  const refreshRelationFeedback = (currentState) => {
    const next = relationSnapshot(currentState);
    if (next && lastRelationSnapshot?.floor === next.floor) {
      const codes = new Set([...lastRelationSnapshot.byCode.keys(), ...next.byCode.keys()]);
      for (const code of codes) {
        if (lastRelationSnapshot.byCode.get(code) !== next.byCode.get(code)) {
          flashUntil.set(code, Date.now() + 1400);
          flashMarkersByCode.set(code, [
            ...lastRelationSnapshot.markers.filter((marker) => marker.linkCode === code),
            ...next.markers.filter((marker) => marker.linkCode === code)
          ]);
        }
      }
    }
    lastRelationSnapshot = next;
  };

  const activeFlashCodes = () => {
    const now = Date.now();
    for (const [code, until] of flashUntil) {
      if (until <= now) flashUntil.delete(code);
      if (until <= now) flashMarkersByCode.delete(code);
    }
    return new Set(flashUntil.keys());
  };

  const activeFlashMarkers = () => [...flashMarkersByCode.entries()]
    .filter(([code]) => flashUntil.has(code))
    .flatMap(([, markers]) => markers);

  const updateMarkers = () => {
    const currentState = readCurrentState();
    refreshRelationFeedback(currentState);
    renderGuardianMarkers(markerLayer, canvas, currentState, {
      focusedCodes,
      flashedCodes: activeFlashCodes(),
      flashMarkers: activeFlashMarkers()
    });
  };

  const setFocus = (currentState, tile) => {
    const next = tile ? getInteractionLinkCodesAt(currentState, tile.x, tile.y) : new Set();
    const changed = next.size !== focusedCodes.size || [...next].some((code) => !focusedCodes.has(code));
    if (!changed) return;
    focusedCodes = next;
    updateMarkers();
  };

  const hideTooltip = () => {
    tooltip.classList.add('hidden');
    canvas.style.cursor = '';
    touchArmedTile = null;
    setFocus(null, null);
  };

  const previewAtEvent = (event, persistForTouch = false) => {
    const state = readCurrentState();
    const tile = pointerTile(canvas, event);
    const preview = tile && state ? buildMapUnitHoverPreview(state, tile.x, tile.y) : null;
    setFocus(state, tile);
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
    if (event.pointerType === 'mouse') return;
    const state = readCurrentState();
    const tile = pointerTile(canvas, event);
    const preview = tile && state ? buildMapUnitHoverPreview(state, tile.x, tile.y) : null;
    if (!preview) {
      touchArmedTile = null;
      return;
    }
    const now = Date.now();
    const confirming = touchArmedTile
      && touchArmedTile.x === tile.x
      && touchArmedTile.y === tile.y
      && touchArmedTile.until > now;
    if (confirming) {
      clearTimeout(touchHideTimer);
      hideTooltip();
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    touchArmedTile = { x: tile.x, y: tile.y, until: now + 1900 };
    previewAtEvent(event, true);
  };
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('pointerdown', onPointerDownCapture, { capture: true });
  window.addEventListener('resize', updateMarkers);
  window.addEventListener('scroll', updateMarkers, { passive: true });
  const markerTimer = window.setInterval(updateMarkers, 250);
  updateMarkers();

  return () => {
    clearTimeout(touchHideTimer);
    touchArmedTile = null;
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
