import { ENEMIES, ITEMS, findToken } from '../game/data.js';
import { calculateBattle, parseToken } from '../game/engine.js';

function cellKey(x, y) {
  return `${x},${y}`;
}

function optimisticEnemyDamage(enemyId, { atk, def, wardAvailable }) {
  const enemy = ENEMIES[enemyId];
  if (!enemy) return Number.POSITIVE_INFINITY;
  const battle = calculateBattle(
    { hp: Number.MAX_SAFE_INTEGER, atk, def },
    enemy,
    { ward: wardAvailable }
  );
  return Number.isFinite(battle.totalDamage)
    ? Math.max(0, battle.totalDamage)
    : Number.POSITIVE_INFINITY;
}

/**
 * Minimum optimistic combat damage from one floor's entrance D to one target
 * cell, preserving walls while relaxing every non-enemy rule/token to free
 * transit. Enemy entry costs use the maximum future combat stats from the
 * existing fixed-purchase upper-bound relaxation.
 *
 * Because this graph only removes constraints (doors/cards/gates/runes/boss-lock
 * semantics) and weakens combat, its path cost is a lower bound on the damage an
 * authoritative route must pay to reach that target before collecting it.
 */
export function relaxedFloorAccessDamageLowerBound({
  materialized,
  floorId,
  targetX,
  targetY,
  atk,
  def,
  wardAvailable
} = {}) {
  const map = materialized?.floorStates?.[floorId]?.map;
  if (!Array.isArray(map) || map.length === 0) return Number.POSITIVE_INFINITY;
  const start = findToken(map, 'D');
  if (!start) return Number.POSITIVE_INFINITY;
  if (!Number.isFinite(atk) || !Number.isFinite(def)) {
    throw new Error('Relaxed access bound requires finite optimistic ATK/DEF.');
  }

  const height = map.length;
  const width = Math.max(...map.map((row) => row.length));
  const distances = new Map([[cellKey(start.x, start.y), 0]]);
  const visited = new Set();

  while (true) {
    let currentKey = null;
    let currentDistance = Number.POSITIVE_INFINITY;
    for (const [key, distance] of distances.entries()) {
      if (visited.has(key)) continue;
      if (distance < currentDistance) {
        currentDistance = distance;
        currentKey = key;
      }
    }
    if (currentKey == null) break;
    visited.add(currentKey);
    const [x, y] = currentKey.split(',').map(Number);
    if (x === targetX && y === targetY) return currentDistance;

    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const token = map[ny]?.[nx] ?? '#';
      if (token === '#') continue;
      const parsed = parseToken(token);
      const entryCost = parsed.type === 'enemy'
        ? optimisticEnemyDamage(parsed.id, { atk, def, wardAvailable })
        : 0;
      if (!Number.isFinite(entryCost)) continue;
      const nextDistance = currentDistance + entryCost;
      const nextKey = cellKey(nx, ny);
      if (nextDistance < (distances.get(nextKey) ?? Number.POSITIVE_INFINITY)) {
        distances.set(nextKey, nextDistance);
      }
    }
  }
  return Number.POSITIVE_INFINITY;
}

function pureHpItem(item) {
  return item?.kind === 'stat'
    && Number(item.hp ?? 0) > 0
    && Number(item.atk ?? 0) === 0
    && Number(item.def ?? 0) === 0
    && Number(item.gold ?? 0) === 0;
}

export function remainingPureHpItemsOnFloor(materialized, floorId) {
  const map = materialized?.floorStates?.[floorId]?.map ?? [];
  const result = [];
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      const parsed = parseToken(map[y][x]);
      if (parsed.type !== 'item') continue;
      const item = ITEMS[parsed.id];
      if (!pureHpItem(item)) continue;
      result.push({
        floorId,
        x,
        y,
        itemId: parsed.id,
        hp: Number(item.hp ?? 0),
        maxHp: Number(item.maxHp ?? 0)
      });
    }
  }
  return result;
}

/**
 * Sound preview tightening for one already-explained fixed-purchase bound.
 *
 * For one pure-HP reward credited for free by the old relaxation, any real route
 * either skips the reward (losing its credited HP contribution r) or collects it
 * (paying at least access-cost c). Existing fractional Gold-harvest damage h may
 * be the same combat, so the additional independent reduction is only:
 *
 *   min(r, max(0, c - h))
 *
 * Taking the strongest single-item constraint avoids summing potentially shared
 * access paths. Applying it independently to every purchase-count scenario and
 * then maximizing again preserves the original max-over-scenarios structure.
 */
export function previewPureHpAccessTightening({
  adapter,
  state,
  boundExplanation,
  floorId = 7
} = {}) {
  if (!adapter || typeof adapter.materializeState !== 'function') {
    throw new Error('Pure-HP access preview requires materializeState().');
  }
  if (!boundExplanation?.exactMatch || !Array.isArray(boundExplanation.scenarios)) {
    throw new Error('Pure-HP access preview requires a cross-checked bound explanation.');
  }
  const relaxation = boundExplanation.relaxation ?? {};
  const materialized = adapter.materializeState(state);
  const items = remainingPureHpItemsOnFloor(materialized, floorId).map((item) => {
    const accessDamageLowerBound = relaxedFloorAccessDamageLowerBound({
      materialized,
      floorId,
      targetX: item.x,
      targetY: item.y,
      atk: relaxation.maxHarvestAtk,
      def: relaxation.maxHarvestDef,
      wardAvailable: relaxation.wardAvailable
    });
    return {
      ...item,
      creditedObjectiveHp: item.hp * Number(relaxation.holyMultiplier ?? 1),
      accessDamageLowerBound
    };
  });

  const scenarios = boundExplanation.scenarios.map((scenario) => {
    const harvest = Number(scenario.fractionalHarvestDamage ?? 0);
    const constraints = items.map((item) => {
      const accessBeyondHarvest = Math.max(0, item.accessDamageLowerBound - harvest);
      const additionalPenalty = Math.min(item.creditedObjectiveHp, accessBeyondHarvest);
      return {
        itemId: item.itemId,
        x: item.x,
        y: item.y,
        creditedObjectiveHp: item.creditedObjectiveHp,
        accessDamageLowerBound: item.accessDamageLowerBound,
        harvestDamageLowerBound: harvest,
        accessBeyondHarvest,
        additionalPenalty
      };
    }).sort((a, b) => b.additionalPenalty - a.additionalPenalty
      || b.accessDamageLowerBound - a.accessDamageLowerBound
      || `${a.y},${a.x}`.localeCompare(`${b.y},${b.x}`));
    const strongest = constraints[0] ?? null;
    const additionalPenalty = strongest?.additionalPenalty ?? 0;
    return {
      purchaseCount: scenario.purchaseCount,
      oldUpperBound: scenario.upperBound,
      harvestDamageLowerBound: harvest,
      strongestConstraint: strongest,
      additionalPenalty,
      previewUpperBound: scenario.upperBound - additionalPenalty
    };
  }).sort((a, b) => b.previewUpperBound - a.previewUpperBound
    || a.purchaseCount - b.purchaseCount);

  const best = scenarios[0] ?? null;
  const previewUpperBound = best?.previewUpperBound ?? boundExplanation.explainedUpperBound;
  if (previewUpperBound > boundExplanation.explainedUpperBound + 1e-9) {
    throw new Error('Pure-HP access preview unexpectedly weakened the old upper bound.');
  }
  return {
    schemaVersion: 1,
    model: 'pure-hp-access-upper-bound-preview-v0.1',
    soundSingleRewardConstraint: true,
    proofBoundModified: false,
    floorId,
    items,
    oldUpperBound: boundExplanation.explainedUpperBound,
    previewUpperBound,
    tightening: boundExplanation.explainedUpperBound - previewUpperBound,
    best,
    scenarios
  };
}
