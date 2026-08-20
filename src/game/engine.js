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
    bossDefeated: false
  }));
  const start = findToken(floorStates[0].map, 'S');
  if (!start) throw new Error('Start tile not found.');
  floorStates[0].map[start.y][start.x] = '.';

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
    relics: { codex: false, compass: false, lucky: false, ward: false, holy: false },
    relicNames: [],
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
  if (!state.stats || !state.cards || !state.relics) return false;
  return true;
}

export function serializeState(state) {
  return JSON.stringify(state);
}

export function deserializeState(serialized) {
  const state = JSON.parse(serialized);
  if (!validateStateShape(state)) throw new Error('存档版本不兼容或内容损坏。');
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

export function calculateBattle(stats, enemy, relics = {}) {
  const heroDamage = stats.atk - enemy.def;
  if (heroDamage <= 0) {
    return {
      winnable: false,
      reason: '攻击不足，无法破防',
      heroDamage: 0,
      enemyDamage: 0,
      rounds: Infinity,
      counterAttacks: Infinity,
      totalDamage: Infinity,
      remainingHp: stats.hp
    };
  }

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
    const triGateId = FLOORS[state.floor].puzzles?.triGate;
    if (parsed.id === triGateId) {
      const missing = Object.entries(state.cards).filter(([, value]) => value <= 0).map(([key]) => CARD_LABELS[key]);
      if (missing.length > 0) {
        result.blocked = true;
        result.reason = `三相结界需要日、月、星卡各 1 张；缺少：${missing.join('、')}。`;
        return result;
      }
      state.cards.sun -= 1;
      state.cards.moon -= 1;
      state.cards.star -= 1;
      setTile(state, x, y, '.');
      moveTo(state, x, y);
      addLog(state, '三相卡片共鸣，虚影结界解除。');
      result.moved = true;
      result.events.push({ type: 'triGate' });
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
    const battle = calculateBattle(state.stats, enemy, state.relics);
    result.battle = { enemyId: parsed.id, enemy, ...battle };
    if (!battle.winnable) {
      result.blocked = true;
      result.reason = battle.reason;
      addLog(state, `未与「${enemy.name}」交战：${battle.reason}。`);
      return result;
    }

    state.stats.hp -= battle.totalDamage;
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

    setTile(state, x, y, '.');
    moveTo(state, x, y);
    result.moved = true;

    if (enemy.reward) {
      applyEffect(state, enemy.reward);
      addLog(state, `回收「${enemy.core}」：生命、攻击与防御得到强化。`);
    }

    if (enemy.boss) {
      getFloorState(state).bossDefeated = true;
      result.bossDefeated = true;
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

export function buyShopUpgrade(state, optionId) {
  const option = SHOP_OPTIONS.find((candidate) => candidate.id === optionId);
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
    previews.push({ enemyId: parsed.id, enemy, x, y, ...calculateBattle(state.stats, enemy, state.relics) });
  }
  return previews;
}

export function getCodexEntries(state) {
  const currentFloor = FLOORS[state.floor].number;
  const ids = Object.keys(ENEMIES).filter((id) => {
    const enemy = ENEMIES[id];
    return state.seenEnemies.includes(id) || enemy.floor <= currentFloor;
  });
  return ids.map((enemyId) => ({ enemyId, enemy: ENEMIES[enemyId], ...calculateBattle(state.stats, ENEMIES[enemyId], state.relics) }));
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
