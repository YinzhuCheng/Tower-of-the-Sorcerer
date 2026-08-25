import { FLOORS, GAME_VERSION } from '../game/data.js';
import { hashValue } from '../solver/state.js';

export const PRE_HOLY_STATIC_CUT_MODEL = 'pre-holy-core6-static-cut-v1';
export const DELAYED_HOLY_POLICIES = Object.freeze(['after-core-6', 'after-core-7', 'before-final']);

function cloneMap(map) {
  return map.map((row) => [...row]);
}

function findCells(map, predicate) {
  const cells = [];
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < (map[y]?.length ?? 0); x += 1) {
      if (predicate(map[y][x], x, y)) cells.push({ x, y, token: map[y][x] });
    }
  }
  return cells;
}

function reconstructPath(previous, endKey) {
  const path = [];
  let cursor = endKey;
  while (cursor != null) {
    const [x, y] = cursor.split(',').map(Number);
    path.push([x, y]);
    cursor = previous.get(cursor) ?? null;
  }
  return path.reverse();
}

function optimisticPassable(token, {
  bossToken,
  forbiddenItemToken,
  allowForbiddenItem,
  lockUpperStair
}) {
  if (token === '#') return false;
  if (token === bossToken) return false;
  if (!allowForbiddenItem && token === forbiddenItemToken) return false;
  if (lockUpperStair && token === 'U') return false;
  // Everything else is deliberately relaxed to passable: enemies, doors,
  // gates, switches, runes, cards, other items, D, shop and ordinary floor.
  return true;
}

/**
 * Optimistic topology reachability to a tile adjacent to the target boss.
 *
 * This is a sound *necessary-condition* relaxation for the no-Holy core6 path:
 * all ordinary enemies/doors/gates/runes/resources are made easier (free to
 * cross), while only immutable walls and the two policy/rule blockers remain:
 * the forbidden Holy tile and the boss-locked upper stair.
 *
 * If even this optimistic graph has no path to a boss-adjacent tile, the real
 * game graph has no such path either.
 */
export function optimisticBossAdjacencyReachability({
  map,
  bossId = 'astralBoss',
  entryToken = 'D',
  forbiddenItemId = 'holy',
  allowForbiddenItem = false,
  lockUpperStair = true
} = {}) {
  if (!Array.isArray(map) || map.length === 0) throw new Error('Static-cut reachability requires a map.');
  const bossToken = `enemy:${bossId}`;
  const forbiddenItemToken = `item:${forbiddenItemId}`;
  const bosses = findCells(map, (token) => token === bossToken);
  if (bosses.length !== 1) throw new Error(`Expected exactly one ${bossToken}, found ${bosses.length}.`);
  const starts = findCells(map, (token) => token === entryToken);
  if (starts.length === 0) throw new Error(`Static-cut map has no ${entryToken} entry anchor.`);
  const boss = bosses[0];
  const targetAdjacentKeys = new Set([
    `${boss.x},${boss.y - 1}`,
    `${boss.x},${boss.y + 1}`,
    `${boss.x - 1},${boss.y}`,
    `${boss.x + 1},${boss.y}`
  ]);

  const queue = [];
  let head = 0;
  const previous = new Map();
  for (const start of starts) {
    const key = `${start.x},${start.y}`;
    if (previous.has(key)) continue;
    previous.set(key, null);
    queue.push({ x: start.x, y: start.y });
  }

  let reachedKey = null;
  while (head < queue.length) {
    const current = queue[head++];
    const currentKey = `${current.x},${current.y}`;
    if (targetAdjacentKeys.has(currentKey)) {
      reachedKey = currentKey;
      break;
    }
    const neighbors = [
      [current.x, current.y - 1],
      [current.x, current.y + 1],
      [current.x - 1, current.y],
      [current.x + 1, current.y]
    ];
    for (const [x, y] of neighbors) {
      if (y < 0 || y >= map.length || x < 0 || x >= (map[y]?.length ?? 0)) continue;
      const key = `${x},${y}`;
      if (previous.has(key)) continue;
      const token = map[y][x];
      if (!optimisticPassable(token, {
        bossToken,
        forbiddenItemToken,
        allowForbiddenItem,
        lockUpperStair
      })) continue;
      previous.set(key, currentKey);
      queue.push({ x, y });
    }
  }

  const blockedSpecialCells = findCells(map, (token) =>
    token === forbiddenItemToken || (lockUpperStair && token === 'U')
  ).map((cell) => ({
    ...cell,
    reason: cell.token === forbiddenItemToken
      ? 'policy_forbidden_holy_before_core6'
      : 'boss_locked_upper_stair_before_boss_defeat'
  }));

  return {
    reachable: reachedKey != null,
    path: reachedKey ? reconstructPath(previous, reachedKey) : null,
    reachableCellCount: previous.size,
    boss: { x: boss.x, y: boss.y, token: boss.token },
    targetAdjacent: [...targetAdjacentKeys].map((key) => key.split(',').map(Number)),
    starts: starts.map(({ x, y, token }) => ({ x, y, token })),
    blockedSpecialCells
  };
}

/**
 * Canonical proof that the sixth-floor boss cannot be reached before acquiring
 * Holy under the current map/rule semantics.
 *
 * The proof does not depend on HP/ATK/DEF/Gold, combat order, card counts or
 * search budget. It relaxes all of those constraints away. The only retained
 * blockers are walls, the policy-forbidden Holy tile, and U being sealed until
 * the current floor boss is defeated.
 */
export function provePreHolyCore6StaticCut({
  floorIndex = 5,
  bossId = 'astralBoss',
  forbiddenItemId = 'holy'
} = {}) {
  const floor = FLOORS[floorIndex];
  if (!floor) throw new Error(`Unknown static-cut floor index: ${floorIndex}`);
  if (floor.boss !== bossId) {
    throw new Error(`Floor ${floor.number} boss is ${floor.boss}, expected ${bossId}.`);
  }
  const map = cloneMap(floor.map);
  const strictRelaxation = optimisticBossAdjacencyReachability({
    map,
    bossId,
    forbiddenItemId,
    allowForbiddenItem: false,
    lockUpperStair: true
  });
  const holyAllowedWitness = optimisticBossAdjacencyReachability({
    map,
    bossId,
    forbiddenItemId,
    allowForbiddenItem: true,
    lockUpperStair: true
  });
  const stairUnlockedWitness = optimisticBossAdjacencyReachability({
    map,
    bossId,
    forbiddenItemId,
    allowForbiddenItem: false,
    lockUpperStair: false
  });

  const proven = strictRelaxation.reachable === false;
  const certificateBody = {
    type: 'STATIC_CUT',
    model: PRE_HOLY_STATIC_CUT_MODEL,
    gameVersion: GAME_VERSION,
    floorIndex,
    floorNumber: floor.number,
    floorTitle: floor.title,
    bossId,
    forbiddenItemId,
    policyCondition: 'Holy must remain unacquired until at least core6',
    relaxation: {
      freePassable: 'all non-wall tiles except target boss, forbidden Holy, and boss-locked U',
      ignoredConstraints: [
        'enemy combat damage and breakpoints',
        'door/card requirements',
        'gate/switch/sequence requirements',
        'ordinary item acquisition timing',
        'gold and shop affordability'
      ],
      retainedBlockers: ['walls', 'policy-forbidden Holy', 'boss-locked upper stair']
    },
    strictRelaxation,
    minimalityWitnesses: {
      allowHoly: {
        reachable: holyAllowedWitness.reachable,
        path: holyAllowedWitness.path
      },
      unlockUpperStair: {
        reachable: stairUnlockedWitness.reachable,
        path: stairUnlockedWitness.path
      }
    },
    appliesToPolicies: [...DELAYED_HOLY_POLICIES],
    proven
  };

  return {
    ...certificateBody,
    certificateHash: hashValue(certificateBody),
    interpretation: proven
      ? 'core6_before_holy_is_topologically_impossible_under_an_optimistic_relaxation'
      : 'static_cut_not_proven'
  };
}

export function staticCutAppliesToHolyPolicy(policy, certificate = null) {
  if (!DELAYED_HOLY_POLICIES.includes(policy)) return false;
  const proof = certificate ?? provePreHolyCore6StaticCut();
  return proof.proven === true && proof.appliesToPolicies.includes(policy);
}
