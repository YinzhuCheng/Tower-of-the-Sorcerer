import { ENEMIES, FLOORS, GRID_SIZE, getShopCost } from '../game/data.js';
import {
  DIRECTIONS,
  buyShopUpgrade,
  calculateBattle,
  createInitialState,
  getFloorState,
  getTile,
  parseToken,
  teleportToFloor,
  tryMove
} from '../game/engine.js';
import {
  getCardGateRequirements,
  getGuardianGateRequirements,
  getMissingCards,
  getMissingGuardianIds,
  getRemainingExitGuardianIds
} from '../game/progression-rules.js';

const DIR_LIST = Object.entries(DIRECTIONS).map(([name, vector]) => ({ name, ...vector }));
export const HOLY_POLICIES = ['immediate', 'after-core-6', 'after-core-7', 'before-final'];
export const SHOP_TRAVEL_POLICIES = ['current-only', 'stall-recovery'];
export const PROGRESSION_PRIORITIES = ['legacy-clear', 'guardian-first'];
const SHOP_OPTION_IDS = ['atk', 'def', 'hp'];

function defaultShopTravelPolicy() {
  const shopCount = FLOORS.filter((floor) => floor.map?.some((row) => row.includes('shop'))).length;
  const initialCompass = FLOORS[0]?.initialRelics?.includes('compass');
  return shopCount <= 3 && initialCompass ? 'stall-recovery' : 'current-only';
}

function tileIsTransit(token, { allowRunes = false, completedRunes = [] } = {}) {
  if (token === '.' || token === 'shop') return true;
  const parsed = parseToken(token);
  return parsed.type === 'rune' && (allowRunes || completedRunes.includes(parsed.id));
}

function reconstructPath(previous, previousDir, endKey) {
  const path = [];
  let cursor = endKey;
  while (previous.get(cursor) !== null) {
    path.push(previousDir.get(cursor));
    cursor = previous.get(cursor);
  }
  return path.reverse();
}

function pathToAdjacent(state, targetX, targetY, options = {}) {
  const queue = [{ x: state.x, y: state.y }];
  let head = 0;
  const startKey = `${state.x},${state.y}`;
  const previous = new Map([[startKey, null]]);
  const previousDir = new Map();

  while (head < queue.length) {
    const current = queue[head++];
    if (Math.abs(current.x - targetX) + Math.abs(current.y - targetY) === 1) {
      return reconstructPath(previous, previousDir, `${current.x},${current.y}`);
    }
    for (const dir of DIR_LIST) {
      const x = current.x + dir.dx;
      const y = current.y + dir.dy;
      if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) continue;
      const key = `${x},${y}`;
      if (previous.has(key)) continue;
      if (!tileIsTransit(getTile(state, x, y), options)) continue;
      previous.set(key, `${current.x},${current.y}`);
      previousDir.set(key, dir.name);
      queue.push({ x, y });
    }
  }
  return null;
}

function pathToExactTransit(state, targetX, targetY, options = {}) {
  if (state.x === targetX && state.y === targetY) return [];
  const queue = [{ x: state.x, y: state.y }];
  let head = 0;
  const startKey = `${state.x},${state.y}`;
  const previous = new Map([[startKey, null]]);
  const previousDir = new Map();
  while (head < queue.length) {
    const current = queue[head++];
    for (const dir of DIR_LIST) {
      const x = current.x + dir.dx;
      const y = current.y + dir.dy;
      if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) continue;
      const key = `${x},${y}`;
      if (previous.has(key)) continue;
      if (!tileIsTransit(getTile(state, x, y), options)) continue;
      previous.set(key, `${current.x},${current.y}`);
      previousDir.set(key, dir.name);
      if (x === targetX && y === targetY) return reconstructPath(previous, previousDir, key);
      queue.push({ x, y });
    }
  }
  return null;
}

function completedRunesForState(state) {
  const sequence = FLOORS[state.floor]?.puzzles?.sequence;
  if (!sequence) return [];
  const progress = getFloorState(state).sequenceProgress;
  return sequence.order.slice(0, progress);
}

function executePath(state, path) {
  for (const name of path) {
    const dir = DIRECTIONS[name];
    const result = tryMove(state, dir.dx, dir.dy);
    if (result.blocked || result.floorChanged) {
      return { ok: false, reason: result.reason ?? 'Transit path unexpectedly changed floor.' };
    }
  }
  return { ok: true };
}

function reachableActions(state) {
  const actions = [];
  const floorState = getFloorState(state);
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const token = floorState.map[y][x];
      if (token === '#' || token === '.' || token === 'shop' || token === 'D') continue;
      const path = pathToAdjacent(state, x, y, {
        completedRunes: completedRunesForState(state)
      });
      if (!path) continue;
      actions.push({ x, y, token, parsed: parseToken(token), path });
    }
  }
  return actions;
}

function actOn(state, action, routeSteps = null) {
  const floorBefore = state.floor;
  const step = routeSteps ? {
    kind: 'tile',
    floorBefore,
    path: [...action.path],
    location: [action.x, action.y],
    action: { token: action.token }
  } : null;
  const transit = executePath(state, action.path);
  if (!transit.ok) return transit;
  const dx = action.x - state.x;
  const dy = action.y - state.y;
  if (Math.abs(dx) + Math.abs(dy) !== 1) return { ok: false, reason: 'Target is no longer adjacent.' };
  const result = tryMove(state, dx, dy);
  if (result.blocked) return { ok: false, reason: result.reason };
  if (step) routeSteps.push(step);
  return { ok: true, result };
}

function reachableShop(state) {
  const map = getFloorState(state).map;
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (map[y][x] !== 'shop') continue;
      const path = pathToExactTransit(state, x, y, {
        completedRunes: completedRunesForState(state)
      });
      if (path) return { x, y, path };
    }
  }
  return null;
}

function buyAvailableUpgrades(state, shopCycle, shopPlan, purchaseCounts, purchaseLog, routeSteps = null) {
  // A failed purchase must not silently reposition the player at a remote shop:
  // that makes a policy route non-replayable and smuggles free navigation into
  // the heuristic. Wait until the player can actually spend gold.
  if (state.stats.gold < getShopCost(state)) return { ok: true, count: 0 };
  const shop = reachableShop(state);
  if (!shop) return { ok: true, count: 0 };
  const floorBefore = state.floor;
  const transit = executePath(state, shop.path);
  if (!transit.ok) return transit;

  let count = 0;
  while (state.stats.gold >= getShopCost(state) && count < 128) {
    const optionId = shopPlan?.[state.shopPurchases]
      ?? shopCycle[state.shopPurchases % shopCycle.length];
    const before = { ...state.stats };
    const result = buyShopUpgrade(state, optionId);
    if (!result.ok) return { ok: false, reason: result.reason };
    purchaseCounts[optionId] = (purchaseCounts[optionId] ?? 0) + 1;
    purchaseLog.push({
      purchase: state.shopPurchases,
      floor: state.floor + 1,
      optionId,
      cost: result.cost,
      goldSlack: before.gold - result.cost,
      normalizedGoldSlack: (before.gold - result.cost) / Math.max(1, result.cost),
      before,
      after: { ...state.stats }
    });
    if (routeSteps) {
      routeSteps.push({
        kind: 'shop',
        floorBefore,
        path: count === 0 ? [...shop.path] : [],
        action: { optionId }
      });
    }
    count += 1;
  }
  return { ok: true, count };
}

function floorContainsShop(state, floorIndex) {
  return getFloorState(state, floorIndex).map.some((row) => row.includes('shop'));
}

function buyVisitedShopRecovery(state, shopCycle, shopPlan, purchaseCounts, purchaseLog, shopTravelPolicy, routeSteps = null) {
  if (shopTravelPolicy !== 'stall-recovery') return { ok: true, count: 0, visitedFloor: null };
  if (!state.relics.compass || state.stats.gold < getShopCost(state)) {
    return { ok: true, count: 0, visitedFloor: null };
  }

  const originFloor = state.floor;
  const candidates = [...state.visitedFloors]
    .filter((floorIndex) => floorIndex !== originFloor && floorContainsShop(state, floorIndex))
    .sort((a, b) => b - a);

  for (const floorIndex of candidates) {
    const floorBeforeTravel = state.floor;
    const travel = teleportToFloor(state, floorIndex);
    if (!travel.ok) continue;
    if (routeSteps) routeSteps.push({ kind: 'teleport', floorBefore: floorBeforeTravel, action: { targetFloor: floorIndex } });
    const bought = buyAvailableUpgrades(state, shopCycle, shopPlan, purchaseCounts, purchaseLog, routeSteps);
    const floorBeforeReturn = state.floor;
    const returnTrip = teleportToFloor(state, originFloor);
    if (!returnTrip.ok) return { ok: false, reason: returnTrip.reason };
    if (routeSteps) routeSteps.push({ kind: 'teleport', floorBefore: floorBeforeReturn, action: { targetFloor: originFloor } });
    if (!bought.ok) return bought;
    if (bought.count > 0) return { ok: true, count: bought.count, visitedFloor: floorIndex + 1 };
  }

  if (state.floor !== originFloor) {
    const floorBeforeReturn = state.floor;
    const returnTrip = teleportToFloor(state, originFloor);
    if (!returnTrip.ok) return { ok: false, reason: returnTrip.reason };
    if (routeSteps) routeSteps.push({ kind: 'teleport', floorBefore: floorBeforeReturn, action: { targetFloor: originFloor } });
  }
  return { ok: true, count: 0, visitedFloor: null };
}

function solveSequenceIfPossible(state, routeSteps = null) {
  const sequence = FLOORS[state.floor].puzzles?.sequence;
  if (!sequence) return { ok: true, changed: false };
  const floorState = getFloorState(state);
  if (!floorState.map.some((row) => row.includes(`gate:${sequence.gate}`))) {
    return { ok: true, changed: false };
  }

  const originalProgress = floorState.sequenceProgress;
  const deferred = () => ({
    ok: true,
    changed: floorState.sequenceProgress !== originalProgress,
    deferred: true
  });

  for (let index = originalProgress; index < sequence.order.length; index += 1) {
    const runeId = sequence.order[index];
    let rune = null;
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        if (floorState.map[y][x] === `rune:${runeId}`) rune = { x, y };
      }
    }
    if (!rune) return deferred();
    const path = pathToAdjacent(state, rune.x, rune.y, {
      // Do not walk across an unlit rune: that would be a real sequence
      // input. Previously lit runes are inert and safe to use as floor tiles.
      completedRunes: sequence.order.slice(0, index)
    });
    if (!path) return deferred();
    const applied = actOn(state, {
      x: rune.x,
      y: rune.y,
      token: `rune:${runeId}`,
      path
    }, routeSteps);
    if (!applied.ok) return deferred();
  }
  return { ok: true, changed: floorState.sequenceProgress !== originalProgress, deferred: false };
}

function localHolyAllowed(state, holyPolicy) {
  if (holyPolicy === 'immediate') return true;
  if (holyPolicy === 'after-core-6') return state.cores >= 6;
  if (holyPolicy === 'after-core-7') return state.cores >= 7;
  return false;
}

function gateIsUsable(state, action) {
  if (action?.parsed?.type !== 'gate') return false;
  const floor = FLOORS[state.floor];
  const floorState = getFloorState(state);
  const gateId = action.parsed.id;
  const cardRequirements = getCardGateRequirements(floor, gateId);
  if (cardRequirements) return getMissingCards(state.cards, cardRequirements).length === 0;
  const guardianRequirements = getGuardianGateRequirements(floor, gateId);
  if (guardianRequirements) {
    return getMissingGuardianIds(floorState, floor, gateId).length === 0;
  }
  return false;
}

function remainingExitGuardianIds(state) {
  return getRemainingExitGuardianIds(getFloorState(state), FLOORS[state.floor]);
}

/**
 * The 10F demo preserves the first seven canonical floors as the resource-building
 * campaign spine. `guardian-first` therefore accelerates only the demo-added
 * palace floors (F8+), where optional side rooms and vaults are intentional.
 * This prevents the automation from leaving F1-F7 the instant a boss becomes
 * barely winnable while still letting late-game validation skip optional rooms.
 */
export function guardianPriorityAppliesToFloor(state, progressionPriority = 'legacy-clear') {
  return progressionPriority === 'guardian-first' && Boolean(FLOORS[state.floor]?.demoContentId);
}

function chooseAction(state, actions, holyPolicy, progressionPriority) {
  const items = actions.filter((action) =>
    action.parsed.type === 'item' && (action.parsed.id !== 'holy' || localHolyAllowed(state, holyPolicy))
  );
  if (items.length) {
    const priority = ['atk', 'def', 'dual', 'weapon', 'shield', 'hpLarge', 'hp', 'codex', 'compass', 'lucky', 'ward', 'holy', 'sun', 'moon', 'star'];
    items.sort((a, b) => priority.indexOf(a.parsed.id) - priority.indexOf(b.parsed.id));
    return items[0];
  }

  const remainingGuardians = new Set(remainingExitGuardianIds(state));
  const guardianFirst = guardianPriorityAppliesToFloor(state, progressionPriority);
  const up = actions.find((action) => action.token === 'U');
  if (guardianFirst && up && remainingGuardians.size === 0) return up;

  const switches = actions.filter((action) => action.parsed.type === 'switch');
  if (switches.length) return switches[0];

  const gate = actions.find((action) => gateIsUsable(state, action));
  if (gate) return gate;

  const doors = actions.filter((action) =>
    action.parsed.type === 'door' && state.cards[action.parsed.id] > 0
  );
  if (doors.length) {
    doors.sort((a, b) => state.cards[b.parsed.id] - state.cards[a.parsed.id]);
    return doors[0];
  }

  const enemies = actions
    .filter((action) => action.parsed.type === 'enemy')
    .map((action) => ({
      ...action,
      battle: calculateBattle(state.stats, ENEMIES[action.parsed.id], state.relics),
      requiredGuardian: remainingGuardians.has(action.parsed.id)
    }))
    .filter((action) => action.battle.winnable)
    .sort((a, b) => {
      if (guardianFirst && a.requiredGuardian !== b.requiredGuardian) {
        return a.requiredGuardian ? -1 : 1;
      }
      const bossA = ENEMIES[a.parsed.id].boss ? 1 : 0;
      const bossB = ENEMIES[b.parsed.id].boss ? 1 : 0;
      return bossA - bossB || a.battle.totalDamage - b.battle.totalDamage;
    });
  if (enemies.length) return enemies[0];

  return up ?? null;
}

function holyTriggerReached(state, holyPolicy, actions = []) {
  if (state.relics.holy || holyPolicy === 'immediate') return false;
  if (holyPolicy === 'after-core-6') return state.cores >= 6;
  if (holyPolicy === 'after-core-7') return state.cores >= 7;
  if (holyPolicy === 'before-final') {
    return actions.some((action) =>
      action.parsed?.type === 'enemy' && ['finalQueen', 'voidCore'].includes(action.parsed.id)
    );
  }
  return false;
}

function collectDeferredHoly(state, routeSteps = null) {
  if (state.relics.holy) return { ok: true, collected: false };
  if (!state.relics.compass) return { ok: false, reason: 'Deferred Holy policy requires the floor compass.' };
  if (!state.visitedFloors.includes(5)) return { ok: false, reason: 'Holy floor has not been visited yet.' };

  const returnFloor = state.floor;
  if (state.floor !== 5) {
    const floorBeforeTravel = state.floor;
    const travel = teleportToFloor(state, 5);
    if (!travel.ok) return { ok: false, reason: travel.reason };
    if (routeSteps) routeSteps.push({ kind: 'teleport', floorBefore: floorBeforeTravel, action: { targetFloor: 5 } });
  }

  const holy = reachableActions(state).find((action) =>
    action.parsed.type === 'item' && action.parsed.id === 'holy'
  );
  if (!holy) {
    if (returnFloor !== 5) teleportToFloor(state, returnFloor);
    return { ok: false, reason: 'Deferred Holy is no longer reachable from the floor anchor.' };
  }

  const applied = actOn(state, holy, routeSteps);
  if (!applied.ok) return applied;
  const acquisition = {
    floor: 6,
    cores: state.cores,
    purchases: state.shopPurchases,
    stats: { ...state.stats }
  };

  if (returnFloor !== 5) {
    const floorBeforeReturn = state.floor;
    const travelBack = teleportToFloor(state, returnFloor);
    if (!travelBack.ok) return { ok: false, reason: travelBack.reason };
    if (routeSteps) routeSteps.push({ kind: 'teleport', floorBefore: floorBeforeReturn, action: { targetFloor: returnFloor } });
  }

  return { ok: true, collected: true, acquisition };
}

function checkpointRelics(state) {
  return {
    holy: Boolean(state.relics.holy),
    ward: Boolean(state.relics.ward),
    lucky: Boolean(state.relics.lucky),
    compass: Boolean(state.relics.compass)
  };
}

function battleCheckpoint(state, action) {
  if (action.parsed?.type !== 'enemy') return null;
  const enemy = ENEMIES[action.parsed.id];
  if (!enemy) return null;
  const statsBefore = { ...state.stats };
  const battle = calculateBattle(statsBefore, enemy, state.relics);
  return {
    floor: state.floor + 1,
    enemyId: action.parsed.id,
    enemyName: enemy.name,
    boss: Boolean(enemy.boss),
    finalBoss: Boolean(enemy.finalBoss),
    special: enemy.special ?? null,
    statsBefore,
    cardsBefore: { ...state.cards },
    coresBefore: state.cores,
    purchasesBefore: state.shopPurchases,
    relicsBefore: checkpointRelics(state),
    positionBefore: { floor: state.floor + 1, x: state.x, y: state.y },
    battle: {
      winnable: battle.winnable,
      heroDamage: battle.heroDamage,
      enemyDamage: battle.enemyDamage,
      rounds: battle.rounds,
      counterAttacks: battle.counterAttacks,
      totalDamage: battle.totalDamage,
      remainingHp: battle.remainingHp
    },
    hpMargin: statsBefore.hp - battle.totalDamage - 1,
    normalizedHpMargin: (statsBefore.hp - battle.totalDamage - 1) / Math.max(1, statsBefore.hp),
    atkMargin: statsBefore.atk - enemy.def - 1,
    defMargin: enemy.special === 'magic' ? null : statsBefore.def - enemy.atk
  };
}

function finishBattleCheckpoint(checkpoint, state) {
  if (!checkpoint) return null;
  return {
    ...checkpoint,
    statsAfter: { ...state.stats },
    cardsAfter: { ...state.cards },
    coresAfter: state.cores,
    purchasesAfter: state.shopPurchases,
    relicsAfter: checkpointRelics(state),
    positionAfter: { floor: state.floor + 1, x: state.x, y: state.y },
    goldGain: state.stats.gold - checkpoint.statsBefore.gold
  };
}

function describeBlockedExit(state) {
  const remaining = remainingExitGuardianIds(state);
  if (!remaining.length) return null;
  const details = remaining.map((enemyId) => {
    const enemy = ENEMIES[enemyId];
    if (!enemy) return `${enemyId}:missing-data`;
    const battle = calculateBattle(state.stats, enemy, state.relics);
    if (battle.winnable) return `${enemyId}:not-reachable`;
    if (!Number.isFinite(battle.totalDamage)) return `${enemyId}:atk-below-def`;
    return `${enemyId}:needs-${Math.max(1, battle.totalDamage - state.stats.hp + 1)}-more-hp-equivalent`;
  });
  return `Required exit guardian unresolved on floor ${state.floor + 1}: ${details.join(', ')}.`;
}

export function runGreedyShopStrategy({
  shopCycle = ['atk', 'def', 'hp'],
  shopPlan = null,
  holyPolicy = 'immediate',
  shopTravelPolicy = defaultShopTravelPolicy(),
  progressionPriority = 'legacy-clear',
  traceActions = false,
  maxIterations = 5_000
} = {}) {
  if (!Array.isArray(shopCycle) || shopCycle.length === 0) throw new Error('shopCycle must not be empty.');
  for (const optionId of shopCycle) {
    if (!SHOP_OPTION_IDS.includes(optionId)) throw new Error(`Unknown shop option in cycle: ${optionId}`);
  }
  if (shopPlan != null) {
    if (!Array.isArray(shopPlan)) throw new Error('shopPlan must be an array or null.');
    for (const optionId of shopPlan) {
      if (!SHOP_OPTION_IDS.includes(optionId)) throw new Error(`Unknown shop option in plan: ${optionId}`);
    }
  }
  if (!HOLY_POLICIES.includes(holyPolicy)) throw new Error(`Unknown Holy policy: ${holyPolicy}`);
  if (!SHOP_TRAVEL_POLICIES.includes(shopTravelPolicy)) throw new Error(`Unknown shop travel policy: ${shopTravelPolicy}`);
  if (!PROGRESSION_PRIORITIES.includes(progressionPriority)) {
    throw new Error(`Unknown progression priority: ${progressionPriority}`);
  }

  const state = createInitialState();
  const purchaseCounts = { atk: 0, def: 0, hp: 0 };
  const purchaseLog = [];
  const battleLog = [];
  const actionTrace = [];
  const routeSteps = [];
  let holyAcquisition = null;
  let iterations = 0;
  let failure = null;

  while (!state.victory && iterations < maxIterations) {
    iterations += 1;

    const bought = buyAvailableUpgrades(state, shopCycle, shopPlan, purchaseCounts, purchaseLog, traceActions ? routeSteps : null);
    if (!bought.ok) {
      failure = bought.reason;
      break;
    }

    if (holyPolicy !== 'before-final' && holyTriggerReached(state, holyPolicy)) {
      const holy = collectDeferredHoly(state, traceActions ? routeSteps : null);
      if (!holy.ok) {
        failure = holy.reason;
        break;
      }
      if (holy.collected) holyAcquisition = holy.acquisition;
    }

    const sequence = solveSequenceIfPossible(state, traceActions ? routeSteps : null);
    if (traceActions && (sequence.changed || state.floor + 1 >= 9)) {
      actionTrace.push({
        iteration: iterations,
        kind: 'sequence',
        floor: state.floor + 1,
        progress: getFloorState(state).sequenceProgress,
        changed: sequence.changed,
        deferred: Boolean(sequence.deferred)
      });
    }
    if (!sequence.ok) {
      failure = sequence.reason;
      break;
    }

    const actions = reachableActions(state);
    if (holyPolicy === 'before-final' && holyTriggerReached(state, holyPolicy, actions)) {
      const holy = collectDeferredHoly(state, traceActions ? routeSteps : null);
      if (!holy.ok) {
        failure = holy.reason;
        break;
      }
      if (holy.collected) holyAcquisition = holy.acquisition;
      continue;
    }

    const action = chooseAction(state, actions, holyPolicy, progressionPriority);
    const exitLocked = action?.token === 'U' && remainingExitGuardianIds(state).length > 0;

    if (!action || exitLocked) {
      const recovery = buyVisitedShopRecovery(
        state,
        shopCycle,
        shopPlan,
        purchaseCounts,
        purchaseLog,
        shopTravelPolicy,
        traceActions ? routeSteps : null
      );
      if (!recovery.ok) {
        failure = recovery.reason;
        break;
      }
      if (recovery.count > 0) continue;
    }

    if (exitLocked) {
      failure = describeBlockedExit(state) ?? `No reachable progress action on floor ${state.floor + 1}.`;
      break;
    }

    if (!action) {
      const retry = buyAvailableUpgrades(state, shopCycle, shopPlan, purchaseCounts, purchaseLog, traceActions ? routeSteps : null);
      if (!retry.ok) {
        failure = retry.reason;
        break;
      }
      if (retry.count > 0) continue;
      failure = describeBlockedExit(state) ?? `No reachable progress action on floor ${state.floor + 1}.`;
      break;
    }

    const checkpoint = battleCheckpoint(state, action);
    const applied = actOn(state, action, traceActions ? routeSteps : null);
    if (!applied.ok) {
      failure = applied.reason;
      break;
    }
    const completedBattle = finishBattleCheckpoint(checkpoint, state);
    if (completedBattle) battleLog.push(completedBattle);
    if (traceActions) {
      actionTrace.push({
        iteration: iterations,
        kind: 'action',
        floor: state.floor + 1,
        token: action.token,
        location: { x: action.x, y: action.y },
        cards: { ...state.cards },
        sequenceProgress: getFloorState(state).sequenceProgress
      });
    }

    if (action.parsed?.type === 'item' && action.parsed.id === 'holy' && !holyAcquisition) {
      holyAcquisition = {
        floor: state.floor + 1,
        cores: state.cores,
        purchases: state.shopPurchases,
        stats: { ...state.stats }
      };
    }
  }

  if (!state.victory && !failure && iterations >= maxIterations) failure = 'Iteration limit reached.';

  const hpMargins = battleLog.map((entry) => entry.normalizedHpMargin).filter(Number.isFinite);
  return {
    solvable: state.victory,
    failure,
    shopCycle: [...shopCycle],
    shopPlan: shopPlan ? [...shopPlan] : null,
    holyPolicy,
    shopTravelPolicy,
    progressionPriority,
    holyAcquisition,
    iterations,
    purchases: state.shopPurchases,
    purchaseCounts,
    purchaseLog,
    battleLog,
    minNormalizedHpMargin: hpMargins.length ? Math.min(...hpMargins) : null,
    cores: state.cores,
    floor: state.floor + 1,
    final: { ...state.stats },
    cards: { ...state.cards },
    relics: { ...state.relics },
    battles: state.battles,
    turns: state.turns,
    actionTrace: traceActions ? actionTrace : null,
    routeSteps: traceActions ? routeSteps : null
  };
}
