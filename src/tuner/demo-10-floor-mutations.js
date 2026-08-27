import { ENEMIES, FLOORS } from '../game/data.js';

const NUMERIC_SPECS = Object.freeze([
  ['f8-warden-magic-down10', 'f8-warden-magic', 'palaceWarden', 'magicPower', -10],
  ['f8-warden-magic-up10', 'f8-warden-magic', 'palaceWarden', 'magicPower', 10],
  ['f8-hush-magic-down10', 'f8-hush-magic', 'hushCantor', 'magicPower', -10],
  ['f8-hush-magic-up10', 'f8-hush-magic', 'hushCantor', 'magicPower', 10],
  ['f8-outer-atk-down6', 'f8-outer-atk', 'outerCrown', 'atk', -6],
  ['f8-outer-atk-up6', 'f8-outer-atk', 'outerCrown', 'atk', 6],
  ['f9-seal-magic-down10', 'f9-seal-magic', 'blackSealKeeper', 'magicPower', -10],
  ['f9-seal-magic-up10', 'f9-seal-magic', 'blackSealKeeper', 'magicPower', 10],
  ['f9-null-magic-down10', 'f9-null-magic', 'nullCantor', 'magicPower', -10],
  ['f9-null-magic-up10', 'f9-null-magic', 'nullCantor', 'magicPower', 10],
  ['f9-crown-atk-down6', 'f9-crown-atk', 'crownShade', 'atk', -6],
  ['f9-crown-atk-up6', 'f9-crown-atk', 'crownShade', 'atk', 6]
]);

const SWAP_SPECS = Object.freeze([
  ['f8-reward-side-cache-swap', 'f8-reward-side-cache', 8, [1, 1], [6, 1]],
  ['f8-reward-mid-stat-swap', 'f8-reward-mid-stat', 8, [5, 3], [5, 5]],
  ['f8-card-route-swap', 'f8-card-route', 8, [8, 3], [1, 7]],
  ['f8-enemy-upper-swap', 'f8-enemy-upper', 8, [2, 1], [7, 1]],
  ['f8-enemy-lower-swap', 'f8-enemy-lower', 8, [4, 7], [5, 9]],
  ['f9-reward-side-cache-swap', 'f9-reward-side-cache', 9, [1, 1], [6, 1]],
  ['f9-reward-mid-stat-swap', 'f9-reward-mid-stat', 9, [5, 3], [5, 5]],
  ['f9-card-route-swap', 'f9-card-route', 9, [8, 3], [1, 7]],
  ['f9-enemy-upper-swap', 'f9-enemy-upper', 9, [2, 1], [7, 1]],
  ['f9-enemy-mid-swap', 'f9-enemy-mid', 9, [3, 3], [7, 5]]
]);

function floorByNumber(number) {
  const floor = FLOORS.find((entry) => entry.number === number);
  if (!floor) throw new Error(`10F mutation requires floor ${number}.`);
  return floor;
}

function tokenAt(floor, [x, y]) {
  return floor.map[y]?.[x];
}

export function createDemoTenFloorMutationCatalog() {
  const numeric = NUMERIC_SPECS.map(([id, group, enemyId, field, delta]) => {
    const enemy = ENEMIES[enemyId];
    if (!enemy || !Number.isFinite(enemy[field])) {
      throw new Error(`10F mutation field unavailable: ${enemyId}.${field}`);
    }
    return Object.freeze({
      id, group, kind: 'enemy-delta', enemyId, field, delta,
      baseline: Number(enemy[field])
    });
  });
  const swaps = SWAP_SPECS.map(([id, group, floorNumber, a, b]) => {
    const floor = floorByNumber(floorNumber);
    const tokenA = tokenAt(floor, a);
    const tokenB = tokenAt(floor, b);
    if (!tokenA || !tokenB || tokenA === '#' || tokenB === '#') {
      throw new Error(`10F mutation slot unavailable: ${id}`);
    }
    return Object.freeze({
      id, group, kind: 'slot-swap', floor: floorNumber,
      a: Object.freeze({ x: a[0], y: a[1], baselineToken: tokenA }),
      b: Object.freeze({ x: b[0], y: b[1], baselineToken: tokenB })
    });
  });
  return Object.freeze([...numeric, ...swaps]);
}

export function demoTenFloorCandidateKey(candidate = {}) {
  const ids = [...(candidate.mutationIds ?? [])].sort();
  return ids.length ? ids.join('+') : 'baseline';
}

export function expandDemoTenFloorCandidate(candidate, catalog, { maxEdits = 2 } = {}) {
  const mutationIds = [...(candidate?.mutationIds ?? [])];
  if (mutationIds.length >= maxEdits) return [];
  const byId = new Map(catalog.map((mutation) => [mutation.id, mutation]));
  const usedGroups = new Set(mutationIds.map((id) => byId.get(id)?.group).filter(Boolean));
  return catalog
    .filter((mutation) => !mutationIds.includes(mutation.id) && !usedGroups.has(mutation.group))
    .map((mutation) => ({ mutationIds: [...mutationIds, mutation.id].sort() }));
}

export function demoTenFloorCandidateEditLoss(candidate, catalog) {
  const byId = new Map(catalog.map((mutation) => [mutation.id, mutation]));
  let loss = 0;
  for (const id of candidate?.mutationIds ?? []) {
    const mutation = byId.get(id);
    if (!mutation) throw new Error(`Unknown 10F mutation: ${id}`);
    if (mutation.kind === 'enemy-delta') {
      loss += Math.abs(mutation.delta) / Math.max(1, Math.abs(mutation.baseline));
    } else {
      loss += 0.12;
    }
  }
  return Math.min(1, loss);
}

function applyMutation(mutation, undo) {
  if (mutation.kind === 'enemy-delta') {
    const enemy = ENEMIES[mutation.enemyId];
    if (!enemy) throw new Error(`Unknown 10F enemy: ${mutation.enemyId}`);
    const before = enemy[mutation.field];
    undo.push(() => { enemy[mutation.field] = before; });
    enemy[mutation.field] = mutation.baseline + mutation.delta;
    return;
  }
  if (mutation.kind === 'slot-swap') {
    const floor = floorByNumber(mutation.floor);
    const tokenA = floor.map[mutation.a.y]?.[mutation.a.x];
    const tokenB = floor.map[mutation.b.y]?.[mutation.b.x];
    if (tokenA !== mutation.a.baselineToken || tokenB !== mutation.b.baselineToken) {
      throw new Error(`10F slot drift detected for ${mutation.id}: ${tokenA}/${tokenB}`);
    }
    undo.push(() => {
      floor.map[mutation.a.y][mutation.a.x] = tokenA;
      floor.map[mutation.b.y][mutation.b.x] = tokenB;
    });
    floor.map[mutation.a.y][mutation.a.x] = tokenB;
    floor.map[mutation.b.y][mutation.b.x] = tokenA;
    return;
  }
  throw new Error(`Unsupported 10F mutation kind: ${mutation.kind}`);
}

/**
 * Apply an experimental 10F setter candidate for one synchronous evaluation and
 * always restore the demo baseline. No candidate is a production write.
 */
export function withDemoTenFloorCandidate(candidate, catalog, evaluate) {
  if (typeof evaluate !== 'function') throw new Error('10F candidate evaluation callback is required.');
  const byId = new Map(catalog.map((mutation) => [mutation.id, mutation]));
  const ids = [...(candidate?.mutationIds ?? [])];
  const groups = new Set();
  const undo = [];
  try {
    for (const id of ids) {
      const mutation = byId.get(id);
      if (!mutation) throw new Error(`Unknown 10F mutation: ${id}`);
      if (groups.has(mutation.group)) throw new Error(`Conflicting 10F mutation group: ${mutation.group}`);
      groups.add(mutation.group);
      applyMutation(mutation, undo);
    }
    return evaluate();
  } finally {
    for (let index = undo.length - 1; index >= 0; index -= 1) undo[index]();
  }
}
