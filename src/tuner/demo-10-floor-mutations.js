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
  ['f8-card-star-lower-moon-swap', 'f8-card-route', 8, [8, 3], [2, 9]],
  ['f8-card-sun-lower-moon-swap', 'f8-card-route', 8, [8, 7], [2, 9]],
  ['f8-enemy-upper-swap', 'f8-enemy-upper', 8, [2, 1], [7, 1]],
  ['f8-enemy-lower-swap', 'f8-enemy-lower', 8, [4, 7], [5, 9]],
  ['f8-door-upper-moon-sun-swap', 'f8-door-colors', 8, [3, 6], [8, 8]],
  ['f8-door-lower-moon-sun-swap', 'f8-door-colors', 8, [4, 9], [8, 8]],
  ['f9-reward-side-cache-swap', 'f9-reward-side-cache', 9, [1, 1], [6, 1]],
  ['f9-reward-mid-stat-swap', 'f9-reward-mid-stat', 9, [5, 3], [5, 5]],
  ['f9-card-route-swap', 'f9-card-route', 9, [8, 3], [1, 7]],
  ['f9-card-star-moon-swap', 'f9-card-route', 9, [8, 3], [2, 9]],
  ['f9-card-sun-moon-swap', 'f9-card-route', 9, [1, 7], [2, 9]],
  ['f9-enemy-upper-swap', 'f9-enemy-upper', 9, [2, 1], [7, 1]],
  ['f9-enemy-mid-swap', 'f9-enemy-mid', 9, [3, 3], [7, 5]],
  ['f9-door-star-moon-swap', 'f9-door-colors', 9, [3, 6], [8, 8]],
  ['f9-door-star-sun-swap', 'f9-door-colors', 9, [3, 6], [4, 9]],
  ['f9-door-moon-sun-swap', 'f9-door-colors', 9, [8, 8], [4, 9]],
  ['f9-rune-c-a-swap', 'f9-rune-placement', 9, [1, 3], [4, 5]],
  ['f9-rune-c-b-swap', 'f9-rune-placement', 9, [1, 3], [7, 7]],
  ['f9-rune-a-b-swap', 'f9-rune-placement', 9, [4, 5], [7, 7]]
]);

const CROSS_FLOOR_EXCHANGE_SPECS = Object.freeze([
  ['cross-stat-f8-def-f9-atk', 'cross-stat-timing', [8, 5, 5], [9, 5, 5]],
  ['cross-stat-f8-atk-f9-def', 'cross-stat-timing', [8, 5, 3], [9, 8, 7]],
  ['cross-hp-f8-large-f9-atk', 'cross-resource-timing', [8, 1, 5], [9, 5, 5]],
  ['cross-card-f8-star-f9-moon', 'cross-card-timing', [8, 8, 3], [9, 2, 9]],
  ['cross-card-f8-sun-f9-star', 'cross-card-timing', [8, 8, 7], [9, 8, 3]]
]);

function floorByNumber(number) {
  const floor = FLOORS.find((entry) => entry.number === number);
  if (!floor) throw new Error(`10F mutation requires floor ${number}.`);
  return floor;
}

function tokenAt(floor, [x, y]) {
  return floor.map[y]?.[x];
}

function slotTouch(floor, x, y) {
  return `slot:f${floor}:${x},${y}`;
}

function numericTouch(enemyId, field) {
  return `enemy:${enemyId}.${field}`;
}

function touchesOverlap(a = [], b = []) {
  const set = new Set(a);
  return b.some((touch) => set.has(touch));
}

export function createDemoTenFloorMutationCatalog() {
  const numeric = NUMERIC_SPECS.map(([id, group, enemyId, field, delta]) => {
    const enemy = ENEMIES[enemyId];
    if (!enemy || !Number.isFinite(enemy[field])) {
      throw new Error(`10F mutation field unavailable: ${enemyId}.${field}`);
    }
    return Object.freeze({
      id, group, kind: 'enemy-delta', enemyId, field, delta,
      baseline: Number(enemy[field]),
      touches: Object.freeze([numericTouch(enemyId, field)])
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
      b: Object.freeze({ x: b[0], y: b[1], baselineToken: tokenB }),
      touches: Object.freeze([slotTouch(floorNumber, a[0], a[1]), slotTouch(floorNumber, b[0], b[1])])
    });
  });
  const crossFloor = CROSS_FLOOR_EXCHANGE_SPECS.map(([id, group, a, b]) => {
    const [floorA, xA, yA] = a;
    const [floorB, xB, yB] = b;
    const sourceA = floorByNumber(floorA);
    const sourceB = floorByNumber(floorB);
    const tokenA = tokenAt(sourceA, [xA, yA]);
    const tokenB = tokenAt(sourceB, [xB, yB]);
    if (!tokenA || !tokenB || tokenA === '#' || tokenB === '#') {
      throw new Error(`10F cross-floor mutation slot unavailable: ${id}`);
    }
    return Object.freeze({
      id, group, kind: 'cross-floor-swap',
      a: Object.freeze({ floor: floorA, x: xA, y: yA, baselineToken: tokenA }),
      b: Object.freeze({ floor: floorB, x: xB, y: yB, baselineToken: tokenB }),
      touches: Object.freeze([slotTouch(floorA, xA, yA), slotTouch(floorB, xB, yB)])
    });
  });
  return Object.freeze([...numeric, ...swaps, ...crossFloor]);
}

export function demoTenFloorCandidateKey(candidate = {}) {
  const ids = [...(candidate.mutationIds ?? [])].sort();
  return ids.length ? ids.join('+') : 'baseline';
}

export function expandDemoTenFloorCandidate(candidate, catalog, { maxEdits = 2 } = {}) {
  const mutationIds = [...(candidate?.mutationIds ?? [])];
  if (mutationIds.length >= maxEdits) return [];
  const byId = new Map(catalog.map((mutation) => [mutation.id, mutation]));
  const used = mutationIds.map((id) => byId.get(id)).filter(Boolean);
  const usedGroups = new Set(used.map((mutation) => mutation.group));
  const usedTouches = used.flatMap((mutation) => mutation.touches ?? []);
  return catalog
    .filter((mutation) => (
      !mutationIds.includes(mutation.id)
      && !usedGroups.has(mutation.group)
      && !touchesOverlap(usedTouches, mutation.touches ?? [])
    ))
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
    } else if (mutation.kind === 'cross-floor-swap') {
      loss += 0.15;
    } else {
      loss += 0.12;
    }
  }
  return Math.min(1, loss);
}

function applySlotExchange(mutation, undo, floorA, a, floorB, b) {
  const tokenA = floorA.map[a.y]?.[a.x];
  const tokenB = floorB.map[b.y]?.[b.x];
  if (tokenA !== a.baselineToken || tokenB !== b.baselineToken) {
    throw new Error(`10F slot drift detected for ${mutation.id}: ${tokenA}/${tokenB}`);
  }
  undo.push(() => {
    floorA.map[a.y][a.x] = tokenA;
    floorB.map[b.y][b.x] = tokenB;
  });
  floorA.map[a.y][a.x] = tokenB;
  floorB.map[b.y][b.x] = tokenA;
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
    applySlotExchange(mutation, undo, floor, mutation.a, floor, mutation.b);
    return;
  }
  if (mutation.kind === 'cross-floor-swap') {
    applySlotExchange(
      mutation,
      undo,
      floorByNumber(mutation.a.floor),
      mutation.a,
      floorByNumber(mutation.b.floor),
      mutation.b
    );
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
  const touches = [];
  const undo = [];
  try {
    for (const id of ids) {
      const mutation = byId.get(id);
      if (!mutation) throw new Error(`Unknown 10F mutation: ${id}`);
      if (groups.has(mutation.group)) throw new Error(`Conflicting 10F mutation group: ${mutation.group}`);
      if (touchesOverlap(touches, mutation.touches ?? [])) {
        throw new Error(`Overlapping 10F mutation slots: ${mutation.id}`);
      }
      groups.add(mutation.group);
      touches.push(...(mutation.touches ?? []));
      applyMutation(mutation, undo);
    }
    return evaluate();
  } finally {
    for (let index = undo.length - 1; index >= 0; index -= 1) undo[index]();
  }
}
