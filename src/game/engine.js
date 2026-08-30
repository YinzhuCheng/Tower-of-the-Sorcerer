import {
  CARD_LABELS,
  DIALOGUES,
  ENEMIES,
  FLOORS,
  GAME_VERSION,
  ITEMS,
  RELIC_LABELS,
  SHOP_OPTIONS,
  findToken,
  getShopCost
} from './data.js';
import {
  consumeCardRequirements,
  getCardGateRequirements,
  getGuardianGateRequirements,
  getMissingCards,
  getMissingGuardianIds,
  getRemainingExitGuardianIds,
  recordDefeatedBoss
} from './progression-rules.js';
import {
  applyMagicEffect,
  awakenMagic,
  canAffordMagicTier,
  createDormantMagicState,
  describeMagicTier,
  normalizeMagicState,
  setMagicTier as setMagicTierState
} from './magic-blade.js';

export const DIRECTIONS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 }
};

export function cloneMap(map) {
  return map.map((row) => [...row]);
}

export function createInitialState() {
  const floorStates = FLOORS.map((floor) => ({
    map: cloneMap(floor.map),
    switches: [],
    sequenceProgress: 0,
    defeatedBossIds: [],
    bossDefeated: false
  }));
  const start = findToken(floorStates[0].map, 'S');
  if (!start) throw new Error('Start tile not found.');
  floorStates[0].map[start.y][start.x] = '.';

  const initialRelics = new Set(FLOORS[0]?.initialRelics ?? []);
  if (initialRelics.size > 0) {
    const duplicatePickupTokens = new Set([...initialRelics].map((key) => `item:${key}`));
    for (const floorState of floorStates) {
      for (const row of floorState.map) {
        for (let x = 0; x < row.length; x += 1) {
          if (duplicatePickupTokens.has(row[x])) row[x] = '.';
        }
      }
    }
  }
  const initialRelicNames = [...initialRelics].map((key) => RELIC_LABELS[key]).filter(Boolean);

  return {
    version: GAME_VERSION,
    floor: 0,
    x: start.x,
    y: start.y,
    start,
    stats: {
      hp: 1200,
      maxHp: 1200,
      atk: 14,
      def: 12,
      gold: 0
    },
    cards: { sun: 0, moon: 0, star: 0 },
    magic: createDormantMagicState(),
    relics: {
      codex: initialRelics.has('codex'),
      compass: initialRelics.has('compass'),
      lucky: initialRelics.has('lucky'),
      ward: initialRelics.has('ward'),
      holy: initialRelics.has('holy')
    },
    relicNames: initialRelicNames,
    cores: 0,
    shopPurchases: 0,
    floorStates,
    visitedFloors: [0],
    storySeen: [],
    seenEnemies: [],
    turns: 0,
    battles: 0,
    victory: false,
    logs: ['进入第一重魔法阵。固定数值不会因随机数改变。']
  };
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

export function validateStateShape(state) {
  if (!state || state.version !== GAME_VERSION) return false;
  if (!Number.isInteger(state.floor) || state.floor < 0 || state.floor >= FLOORS.length) return false;
  if (!Array.isArray(state.floorStates) || state.floorStates.length !== FLOORS.length) return false;
  if (!state.stats || !state.cards || !state.relics || !state.magic) return false;
  if (!Number.isFinite(state.magic.mp) || !Number.isFinite(state.magic.maxMp)) return false;
  return true;
}

export function serializeState(state) {
  return JSON.stringify(state);
}

export function deserializeState(serialized) {
  const state = migrateState(JSON.parse(serialized));
  if (!validateStateShape(state)) throw new Error('存档版本不兼容或内容损坏。');
  return state;
}

/**
 * V1 saves predate player magic. Their map shape is still checked against the
 * active content after this narrow, deterministic data migration. A later
 * 10F→20F content migration can extend this function without weakening the
 * validation contract.
 */
export function migrateState(state) {
  if (!state || typeof state !== 'object') return state;
  if (state.version === GAME_VERSION) {
    state.magic = normalizeMagicState(state.magic);
    return state;
  }
  if (state.version === 1) {
    return {
      ...state,
      version: GAME_VERSION,
      magic: createDormantMagicState()
    };
  }
  return state;
}

export function getFloorState(state, floorId = state.floor) {
  return state.floorStates[floorId];
}

export function getTile(state, x, y, floorId = state.floor) {
  const map = getFloorState(state, floorId).map;
  return map[y]?.[x] ?? '#';
}

export function setTile(state, x, y, token, floorId = state.floor) {
  getFloorState(state, floorId).map[y][x] = token;
}

export function parseToken(token) {
  const separator = token.indexOf(':');
  if (separator < 0) return { type: token, id: null };
  return { type: token.slice(0, separator), id: token.slice(separator + 1) };
}

export function calculateBattle(stats, enemy, relics = {}, magic = {}) {
  // Magical damage augments a physical hit; it never opens an otherwise
  // impossible defense breakpoint. This preserves the fundamental 魔塔
  // attack/defense puzzle and leaves "magic pierce" available for an explicit
  // future relic rather than smuggling it into the base system.
  const physicalDamage = stats.atk - enemy.def;
  const magicStatus = describeMagicTier(magic);
  const magicTier = magicStatus.tier;
  const magicCost = magicStatus.cost;
  if (physicalDamage <= 0) {
    return {
      winnable: false,
      reason: '攻击不足，无法破防',
      heroDamage: 0,
      physicalDamage: 0,
      magicTier,
      magicCost,
      magicBonusPerHit: 0,
      magicAffordable: magicStatus.affordable,
      enemyDamage: 0,
      rounds: Infinity,
      counterAttacks: Infinity,
      totalDamage: Infinity,
      remainingHp: stats.hp
    };
  }

  if (!magicStatus.affordable) {
    return {
      winnable: false,
      reason: `当前魔力不足以维持 ${magicTier} 档魔力附刃`,
      heroDamage: physicalDamage,
      physicalDamage,
      magicTier,
      magicCost,
      magicBonusPerHit: magicCost,
      magicAffordable: false,
      enemyDamage: 0,
      rounds: Infinity,
      counterAttacks: Infinity,
      totalDamage: Infinity,
      remainingHp: stats.hp
    };
  }

  const heroDamage = physicalDamage + magicCost;
  const rounds = Math.ceil(enemy.hp / heroDamage);
  let counterAttacks = Math.max(0, rounds - 1);
  if (enemy.special === 'firstStrike') counterAttacks += 1;

  let enemyDamage;
  if (enemy.special === 'magic') {
    enemyDamage = enemy.magicPower ?? enemy.atk;
    if (relics.ward) enemyDamage = Math.ceil(enemyDamage * 0.8);
  } else {
    enemyDamage = Math.max(0, enemy.atk - stats.def);
    if (enemy.special === 'doubleHit') enemyDamage *= 2;
  }

  const totalDamage = enemyDamage * counterAttacks;
  return {
    winnable: totalDamage < stats.hp,
    reason: totalDamage < stats.hp ? null : '预计损伤会使生命归零',
    heroDamage,
    physicalDamage,
    magicTier,
    magicCost,
    magicBonusPerHit: magicCost,
    magicAffordable: true,
    enemyDamage,
    rounds,
    counterAttacks,
    totalDamage,
    remainingHp: stats.hp - totalDamage
  };
}

export function addLog(state, message) {
  state.logs.unshift(message);
  state.logs = state.logs.slice(0, 12);
}

export function applyEffect(state, effect = {}) {
  if (effect.maxHp) state.stats.maxHp += effect.maxHp;
  if (effect.hp) state.stats.hp = Math.min(state.stats.maxHp, state.stats.hp + effect.hp);
  if (effect.atk) state.stats.atk += effect.atk;
  if (effect.def) state.stats.def += effect.def;
  if (effect.gold) state.stats.gold += effect.gold;
  if (effect.core) state.cores += effect.core;
  applyMagicEffect(state, effect);
}

export function setMagicTier(state, tier) {
  const result = setMagicTierState(state, tier);
  if (result.ok) addLog(state, result.tier > 0
    ? `魔力附刃调整为 ${result.tier} 档：下一场战斗将消耗 ${result.cost} MP。`
    : '魔力附刃已关闭。');
  return result;
}

export function collectItem(state, itemId) {
  const item = ITEMS[itemId];
  if (!item) throw new Error(`Unknown item: ${itemId}`);

  if (item.kind === 'card') {
    state.cards[item.card] += item.amount;
  } else if (item.kind === 'stat') {
    applyEffect(state, item);
    if (item.relic && !state.relicNames.includes(item.relic)) state.relicNames.push(item.relic);
  } else if (item.kind === 'relic') {
    if (!state.relics[item.relicKey]) {
      state.relics[item.relicKey] = true;
      if (!state.relicNames.includes(item.relic)) state.relicNames.push(item.relic);
      if (item.relicKey === 'holy') {
        state.stats.maxHp *= 2;
        state.stats.hp *= 2;
      }
    }
  }
  addLog(state, `获得「${item.name}」：${item.description}`);
  return item;
}

function openGateTiles(state, gateId) {
  const floorState = getFloorState(state);
  let opened = 0;
  for (let y = 0; y < floorState.map.length; y += 1) {
    for (let x = 0; x < floorState.map[y].length; x += 1) {
      if (floorState.map[y][x] === `gate:${gateId}`) {
        floorState.map[y][x] = '.';
        opened += 1;
      }
    }
  }
  if (opened > 0) addLog(state, `机关响应：${opened} 道封锁结界解除。`);
  return opened;
}

function openSatisfiedGuardianGates(state) {
  const floor = FLOORS[state.floor];
  const floorState = getFloorState(state);
  const guardianGates = floor.puzzles?.guardianGates ?? {};
  let opened = 0;
  const gateIds = [];
  for (const gateId of Object.keys(guardianGates)) {
    if (getMissingGuardianIds(floorState, floor, gateId).length > 0) continue;
    const count = openGateTiles(state, gateId);
    if (count > 0) gateIds.push(gateId);
    opened += count;
  }
  return { opened, gateIds };
}

function handleSwitch(state, switchId) {
  const floor = FLOORS[state.floor];
  const floorState = getFloorState(state);
  if (!floorState.switches.includes(switchId)) floorState.switches.push(switchId);

  const gates = floor.puzzles?.switches ?? {};
  let opened = 0;
  for (const [gateId, requirements] of Object.entries(gates)) {
    if (requirements.every((id) => floorState.switches.includes(id))) {
      opened += openGateTiles(state, gateId);
    }
  }
  return opened;
}

function handleRune(state, runeId) {
  const sequence = FLOORS[state.floor].puzzles?.sequence;
  if (!sequence) return { completed: false, progress: 0, expected: null };
  const floorState = getFloorState(state);
  const expected = sequence.order[floorState.sequenceProgress];

  // A rune that has already been activated is a lit floor tile, not a new
  // input.  Treating it as a failed input made authored layouts that require
  // crossing back over B after activating B → A impossible to finish.  Keep
  // the token on the map for rendering while making revisiting it inert.
  if (sequence.order.slice(0, floorState.sequenceProgress).includes(runeId)) {
    return {
      completed: floorState.sequenceProgress >= sequence.order.length,
      progress: floorState.sequenceProgress,
      expected: sequence.order[floorState.sequenceProgress] ?? null
    };
  }

  if (runeId === expected) {
    floorState.sequenceProgress += 1;
    const completed = floorState.sequenceProgress >= sequence.order.length;
    if (completed) {
      openGateTiles(state, sequence.gate);
      addLog(state, `星序完成：${sequence.order.map((id) => sequence.labels?.[id] ?? id).join(' → ')}。`);
    } else {
      const next = sequence.order[floorState.sequenceProgress];
      addLog(state, `星序正确：下一枚为「${sequence.labels?.[next] ?? next}」。`);
    }
    return { completed, progress: floorState.sequenceProgress, expected: sequence.order[floorState.sequenceProgress] ?? null };
  }

  floorState.sequenceProgress = runeId === sequence.order[0] ? 1 : 0;
  addLog(state, '星序错误，镜面序列归零。');
  return { completed: false, progress: floorState.sequenceProgress, expected: sequence.order[floorState.sequenceProgress] };
}

function markSeenEnemy(state, enemyId) {
  if (!state.seenEnemies.includes(enemyId)) state.seenEnemies.push(enemyId);
}

function moveTo(state, x, y) {
  state.x = x;
  state.y = y;
  state.turns += 1;
}

function enterFloor(state, targetFloor, direction) {
  state.floor = targetFloor;
  if (!state.visitedFloors.includes(targetFloor)) state.visitedFloors.push(targetFloor);
  const targetMap = getFloorState(state, targetFloor).map;
  const anchor = direction === 'up'
    ? findToken(targetMap, 'D') ?? state.start
    : findToken(targetMap, 'U') ?? state.start;
  state.x = anchor.x;
  state.y = anchor.y;
  state.turns += 1;
  const introId = FLOORS[targetFloor].intro;
  const dialogue = introId && !state.storySeen.includes(introId) ? introId : null;
  if (dialogue) state.storySeen.push(dialogue);
  addLog(state, `进入第 ${FLOORS[targetFloor].number} 阵「${FLOORS[targetFloor].title}」。`);
  return dialogue;
}

function formatCardRequirement(requirements) {
  return Object.entries(requirements)
    .map(([card, amount]) => `${CARD_LABELS[card] ?? card}×${amount}`)
    .join('、');
}

export function initialDialogue(state) {
  const id = FLOORS[state.floor].intro;
  if (!id || state.storySeen.includes(id)) return null;
  state.storySeen.push(id);
  return id;
}

export function tryMove(state, dx, dy) {
  if (state.victory) return { moved: false, blocked: true, reason: '游戏已经通关。', events: [] };

  const x = state.x + dx;
  const y = state.y + dy;
  const token = getTile(state, x, y);
  const parsed = parseToken(token);
  const result = { moved: false, blocked: false, reason: null, events: [], token, x, y };

  if (token === '#') {
    result.blocked = true;
    result.reason = '墙壁阻挡了道路。';
    return result;
  }

  if (token === '.' || token === 'S') {
    moveTo(state, x, y);
    result.moved = true;
    return result;
  }

  if (token === 'U') {
    if (state.floor >= FLOORS.length - 1) {
      result.blocked = true;
      result.reason = '这里没有更高层。';
      return result;
    }
    const floor = FLOORS[state.floor];
    const remainingGuardians = getRemainingExitGuardianIds(getFloorState(state), floor);
    if (remainingGuardians.length > 0) {
      result.blocked = true;
      result.remainingExitGuardians = remainingGuardians;
      result.reason = remainingGuardians.length === 1
        ? '本层阵眼尚未解除，必须先击败守护者。'
        : `上楼结界仍由 ${remainingGuardians.length} 名守卫维持，必须全部击败。`;
      return result;
    }
    result.dialogue = enterFloor(state, state.floor + 1, 'up');
    result.floorChanged = true;
    result.moved = true;
    return result;
  }

  if (token === 'D') {
    if (state.floor <= 0) {
      result.blocked = true;
      result.reason = '这里没有更低层。';
      return result;
    }
    result.dialogue = enterFloor(state, state.floor - 1, 'down');
    result.floorChanged = true;
    result.moved = true;
    return result;
  }

  if (token === 'shop') {
    moveTo(state, x, y);
    result.moved = true;
    result.openShop = true;
    return result;
  }

  if (parsed.type === 'item') {
    const item = collectItem(state, parsed.id);
    setTile(state, x, y, '.');
    moveTo(state, x, y);
    result.moved = true;
    result.item = item;
    result.events.push({ type: 'item', itemId: parsed.id, item });
    return result;
  }

  if (parsed.type === 'door') {
    if (!(parsed.id in state.cards)) throw new Error(`Unknown door card: ${parsed.id}`);
    if (state.cards[parsed.id] <= 0) {
      result.blocked = true;
      result.reason = `缺少${CARD_LABELS[parsed.id]}。`;
      return result;
    }
    state.cards[parsed.id] -= 1;
    setTile(state, x, y, '.');
    moveTo(state, x, y);
    addLog(state, `消耗 1 张${CARD_LABELS[parsed.id]}，解除结界。`);
    result.moved = true;
    result.events.push({ type: 'door', card: parsed.id });
    return result;
  }

  if (parsed.type === 'switch') {
    setTile(state, x, y, '.');
    moveTo(state, x, y);
    const opened = handleSwitch(state, parsed.id);
    addLog(state, `激活机关「${parsed.id}」。`);
    result.moved = true;
    result.events.push({ type: 'switch', switchId: parsed.id, opened });
    return result;
  }

  if (parsed.type === 'rune') {
    moveTo(state, x, y);
    const sequence = handleRune(state, parsed.id);
    result.moved = true;
    result.events.push({ type: 'rune', runeId: parsed.id, sequence });
    return result;
  }

  if (parsed.type === 'gate') {
    const floor = FLOORS[state.floor];
    const cardRequirements = getCardGateRequirements(floor, parsed.id);
    if (cardRequirements) {
      const missing = getMissingCards(state.cards, cardRequirements);
      if (missing.length > 0) {
        result.blocked = true;
        result.reason = `结界需要：${formatCardRequirement(cardRequirements)}。`;
        result.missingCards = missing;
        return result;
      }
      consumeCardRequirements(state.cards, cardRequirements);
      const opened = openGateTiles(state, parsed.id);
      moveTo(state, x, y);
      addLog(state, `卡片共鸣：消耗 ${formatCardRequirement(cardRequirements)}。`);
      result.moved = true;
      result.events.push({ type: 'cardGate', gateId: parsed.id, requirements: cardRequirements, opened });
      return result;
    }

    const guardianRequirements = getGuardianGateRequirements(floor, parsed.id);
    if (guardianRequirements) {
      const missingGuardians = getMissingGuardianIds(getFloorState(state), floor, parsed.id);
      if (missingGuardians.length > 0) {
        result.blocked = true;
        result.missingGuardians = missingGuardians;
        result.reason = `守护结界仍由 ${missingGuardians.length} 名守卫维持。`;
        return result;
      }
      const opened = openGateTiles(state, parsed.id);
      moveTo(state, x, y);
      result.moved = true;
      result.events.push({ type: 'guardianGate', gateId: parsed.id, opened });
      return result;
    }

    result.blocked = true;
    result.reason = '机关结界尚未解除。';
    return result;
  }

  if (parsed.type === 'enemy') {
    const enemy = ENEMIES[parsed.id];
    if (!enemy) throw new Error(`Unknown enemy: ${parsed.id}`);
    markSeenEnemy(state, parsed.id);
    const battle = calculateBattle(state.stats, enemy, state.relics, state.magic);
    result.battle = { enemyId: parsed.id, enemy, ...battle };
    if (!battle.winnable) {
      result.blocked = true;
      result.reason = battle.reason;
      addLog(state, `未与「${enemy.name}」交战：${battle.reason}。`);
      return result;
    }

    state.stats.hp -= battle.totalDamage;
    if (battle.magicCost > 0) {
      state.magic.mp -= battle.magicCost;
      addLog(state, `魔力附刃消耗 ${battle.magicCost} MP（${battle.magicTier} 档）。`);
    }
    state.battles += 1;
    const earnedGold = enemy.gold * (state.relics.lucky ? 2 : 1);
    state.stats.gold += earnedGold;
    addLog(state, `击败「${enemy.name}」，损失 ${battle.totalDamage} 生命，获得 ${earnedGold} 金币。`);

    if (enemy.phaseNext) {
      setTile(state, x, y, `enemy:${enemy.phaseNext}`);
      result.moved = false;
      result.phaseChanged = true;
      result.dialogue = enemy.phaseDialogue ?? null;
      if (result.dialogue && !state.storySeen.includes(result.dialogue)) state.storySeen.push(result.dialogue);
      return result;
    }

    // A transition boss may turn its own arena tile into an upward stair.
    // This keeps the map contract honest: the stair cannot exist before the
    // required boss is defeated, and it is never a decorative bypass.
    const revealsStair = enemy.revealStair === true;
    setTile(state, x, y, revealsStair ? 'U' : '.');
    moveTo(state, x, y);
    result.moved = true;

    if (revealsStair) {
      result.stairRevealed = true;
      result.events.push({ type: 'stairRevealed', floor: FLOORS[state.floor]?.number ?? state.floor + 1 });
      addLog(state, '终局核心崩解，上行阶梯在原地显现。');
    }

    if (enemy.reward) {
      applyEffect(state, enemy.reward);
      addLog(state, `回收「${enemy.core}」：生命、攻击与防御得到强化。`);
    }

    if (enemy.awakenMagic) {
      const awakened = awakenMagic(state, enemy.awakenMagic === true ? {} : enemy.awakenMagic);
      result.magicAwakened = true;
      result.events.push({ type: 'magicAwakened', mp: awakened.mp, maxMp: awakened.maxMp });
      addLog(state, `沉睡的魔力苏醒：MP 恢复至 ${awakened.mp}/${awakened.maxMp}，可在战前调整魔力附刃档位。`);
    }

    if (enemy.boss) {
      const floor = FLOORS[state.floor];
      const floorState = getFloorState(state);
      const remainingExitGuardians = recordDefeatedBoss(floorState, floor, parsed.id);
      const guardianGateResult = openSatisfiedGuardianGates(state);
      result.bossDefeated = true;
      result.defeatedBossId = parsed.id;
      result.remainingExitGuardians = remainingExitGuardians;
      result.floorExitUnlocked = remainingExitGuardians.length === 0;
      if (guardianGateResult.opened > 0) {
        result.events.push({
          type: 'guardianGatesOpened',
          gateIds: guardianGateResult.gateIds,
          opened: guardianGateResult.opened
        });
      }
      result.dialogue = enemy.defeatDialogue ?? null;
      if (result.dialogue && !state.storySeen.includes(result.dialogue)) state.storySeen.push(result.dialogue);
    }

    if (enemy.finalBoss) {
      state.victory = true;
      result.victory = true;
    }
    return result;
  }

  result.blocked = true;
  result.reason = `无法识别的阵列元素：${token}`;
  return result;
}

export function getShopEffectMultiplier(state) {
  const multiplier = FLOORS[state?.floor]?.shopEffectMultiplier;
  return Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
}

function describeScaledShopOption(option, effect) {
  if (option.id === 'hp') return `生命上限与当前生命 +${effect.maxHp ?? effect.hp ?? 0}`;
  if (option.id === 'atk') return `攻击永久 +${effect.atk ?? 0}`;
  if (option.id === 'def') return `防御永久 +${effect.def ?? 0}`;
  if (effect.maxMp && effect.mp) return `魔力上限 +${effect.maxMp}，并恢复 ${effect.mp} MP`;
  if (effect.maxMp) return `魔力上限 +${effect.maxMp}`;
  if (effect.mp) return `恢复 ${effect.mp} MP`;
  return option.description;
}

export function getShopOptions(state) {
  const multiplier = getShopEffectMultiplier(state);
  const permittedIds = FLOORS[state?.floor]?.shopOptionIds;
  const options = Array.isArray(permittedIds)
    ? SHOP_OPTIONS.filter((option) => permittedIds.includes(option.id))
    : SHOP_OPTIONS.filter((option) => !option.magicOnly);
  return options.map((option) => {
    const effect = Object.fromEntries(Object.entries(option.effect).map(([key, value]) => [
      key,
      Number.isFinite(value) ? Math.ceil(value * multiplier) : value
    ]));
    return {
      ...option,
      effect,
      multiplier,
      description: describeScaledShopOption(option, effect)
    };
  });
}

export function buyShopUpgrade(state, optionId) {
  const option = getShopOptions(state).find((candidate) => candidate.id === optionId);
  if (!option) return { ok: false, reason: '未知升级。' };
  const cost = getShopCost(state);
  if (state.stats.gold < cost) return { ok: false, reason: `金币不足，需要 ${cost}。`, cost };
  state.stats.gold -= cost;
  state.shopPurchases += 1;
  applyEffect(state, option.effect);
  addLog(state, `商店购买「${option.label}」，花费 ${cost} 金币。`);
  return { ok: true, option, cost, nextCost: getShopCost(state) };
}

export function teleportToFloor(state, targetFloor) {
  if (!state.relics.compass) return { ok: false, reason: '尚未获得层间罗盘。' };
  if (!state.visitedFloors.includes(targetFloor)) return { ok: false, reason: '该楼层尚未到达。' };
  if (targetFloor < 0 || targetFloor >= FLOORS.length) return { ok: false, reason: '楼层不存在。' };
  state.floor = targetFloor;
  const map = getFloorState(state, targetFloor).map;
  const anchor = targetFloor === 0 ? state.start : findToken(map, 'D') ?? state.start;
  state.x = anchor.x;
  state.y = anchor.y;
  state.turns += 1;
  addLog(state, `层间罗盘将璃传送到第 ${FLOORS[targetFloor].number} 阵。`);
  return { ok: true };
}

export function getAdjacentEnemyPreviews(state) {
  const previews = [];
  for (const { dx, dy } of Object.values(DIRECTIONS)) {
    const x = state.x + dx;
    const y = state.y + dy;
    const parsed = parseToken(getTile(state, x, y));
    if (parsed.type !== 'enemy') continue;
    const enemy = ENEMIES[parsed.id];
    markSeenEnemy(state, parsed.id);
    previews.push({ enemyId: parsed.id, enemy, x, y, ...calculateBattle(state.stats, enemy, state.relics, state.magic) });
  }
  return previews;
}

export function getCodexEntries(state) {
  const currentFloor = FLOORS[state.floor].number;
  const ids = Object.keys(ENEMIES).filter((id) => {
    const enemy = ENEMIES[id];
    return state.seenEnemies.includes(id) || enemy.floor <= currentFloor;
  });
  return ids.map((enemyId) => ({ enemyId, enemy: ENEMIES[enemyId], ...calculateBattle(state.stats, ENEMIES[enemyId], state.relics, state.magic) }));
}

export function getRelicLabels(state) {
  const standard = Object.entries(state.relics)
    .filter(([, owned]) => owned)
    .map(([key]) => RELIC_LABELS[key]);
  return [...new Set([...standard, ...state.relicNames])];
}

export function getDialogue(id) {
  return DIALOGUES[id] ?? null;
}

export function getProgressPercent(state) {
  return Math.min(100, Math.round((state.cores / 7) * 100));
}
