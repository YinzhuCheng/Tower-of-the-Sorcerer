import { ENEMIES, FLOORS } from '../game/data.js';

const NUMERIC_SPECS = Object.freeze([
  ['f3-whale-singer-magic-down4', 'f3-whale-singer-magic', 'whaleSinger', 'magicPower', -4],
  ['f3-whale-singer-magic-up4', 'f3-whale-singer-magic', 'whaleSinger', 'magicPower', 4],
  ['f5-flame-caster-magic-down5', 'f5-flame-caster-magic', 'flameCaster', 'magicPower', -5],
  ['f5-flame-caster-magic-up5', 'f5-flame-caster-magic', 'flameCaster', 'magicPower', 5],
  ['f6-star-witch-magic-down6', 'f6-star-witch-magic', 'starWitch', 'magicPower', -6],
  ['f6-star-witch-magic-up6', 'f6-star-witch-magic', 'starWitch', 'magicPower', 6],
  ['f7-void-priestess-magic-down6', 'f7-void-priestess-magic', 'voidPriestess', 'magicPower', -6],
  ['f7-void-priestess-magic-up6', 'f7-void-priestess-magic', 'voidPriestess', 'magicPower', 6],
  ['f7-dusk-dragon-atk-down5', 'f7-dusk-dragon-atk', 'duskDragon', 'atk', -5],
  ['f7-dusk-dragon-atk-up5', 'f7-dusk-dragon-atk', 'duskDragon', 'atk', 5],
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
  ['f9-crown-atk-up6', 'f9-crown-atk', 'crownShade', 'atk', 6],
  ['f10-eclipse-mage-magic-down6', 'f10-eclipse-mage-magic', 'eclipseMage', 'magicPower', -6],
  ['f10-eclipse-mage-magic-up6', 'f10-eclipse-mage-magic', 'eclipseMage', 'magicPower', 6],
  ['f10-crown-knight-atk-down5', 'f10-crown-knight-atk', 'crownKnight', 'atk', -5],
  ['f10-crown-knight-atk-up5', 'f10-crown-knight-atk', 'crownKnight', 'atk', 5]
]);

// The spatial redesign deliberately owns these local, ordinary-content slots.
// They are captured here rather than inherited from the older content overlay:
// after rooms were frozen, its coordinate-only codesignSlots no longer named
// the tiles actually visible to the player.  None of these slots is a card
// gate, a core bearer, a key relic, a guardian, or a stair.
const AUTHORED_SLOT_SPECS = Object.freeze({
  7: Object.freeze({
    rewardMidAtk: Object.freeze({ x: 6, y: 9, expected: 'item:atk' }),
    rewardMidDef: Object.freeze({ x: 9, y: 9, expected: 'item:def' })
  }),
  8: Object.freeze({
    rewardNorthwest: Object.freeze({ x: 3, y: 1, expected: 'item:hp' }),
    rewardNortheast: Object.freeze({ x: 5, y: 1, expected: 'item:hpLarge' }),
    rewardMidAtk: Object.freeze({ x: 3, y: 3, expected: 'item:atk' }),
    rewardMidDef: Object.freeze({ x: 7, y: 3, expected: 'item:def' }),
    rewardHpWest: Object.freeze({ x: 1, y: 5, expected: 'item:hpLarge' }),
    cardStarEast: Object.freeze({ x: 3, y: 8, expected: 'item:star' }),
    cardMoonWest: Object.freeze({ x: 2, y: 9, expected: 'item:moon' }),
    cardMoonSouth: Object.freeze({ x: 4, y: 9, expected: 'item:moon' }),
    enemyOuterNorthwest: Object.freeze({ x: 1, y: 1, expected: 'enemy:outerCrown' }),
    enemyHushNorth: Object.freeze({ x: 6, y: 1, expected: 'enemy:hushCantor' }),
    enemyMuteWest: Object.freeze({ x: 8, y: 5, expected: 'enemy:muteGuard' }),
    enemyOuterSouth: Object.freeze({ x: 7, y: 5, expected: 'enemy:outerCrown' })
  }),
  9: Object.freeze({
    rewardNorthwest: Object.freeze({ x: 3, y: 1, expected: 'item:dual' }),
    rewardNortheast: Object.freeze({ x: 5, y: 1, expected: 'item:hpLarge' }),
    rewardMidAtk: Object.freeze({ x: 3, y: 5, expected: 'item:atk' }),
    rewardMidDef: Object.freeze({ x: 5, y: 3, expected: 'item:def' }),
    rewardDefSouth: Object.freeze({ x: 6, y: 9, expected: 'item:def' }),
    rewardHpWest: Object.freeze({ x: 1, y: 3, expected: 'item:hpLarge' }),
    cardStarEast: Object.freeze({ x: 8, y: 9, expected: 'item:star' }),
    cardSunWest: Object.freeze({ x: 5, y: 7, expected: 'item:sun' }),
    cardMoonSouth: Object.freeze({ x: 2, y: 9, expected: 'item:moon' }),
    enemySentinelNorthwest: Object.freeze({ x: 1, y: 1, expected: 'enemy:starSentinel' }),
    enemyNullNorth: Object.freeze({ x: 6, y: 1, expected: 'enemy:nullCantor' }),
    enemyCrownMid: Object.freeze({ x: 8, y: 3, expected: 'enemy:crownShade' }),
    enemySentinelMid: Object.freeze({ x: 1, y: 5, expected: 'enemy:starSentinel' }),
    runeC: Object.freeze({ x: 3, y: 7, expected: 'rune:C' }),
    runeA: Object.freeze({ x: 4, y: 5, expected: 'rune:A' }),
    runeB: Object.freeze({ x: 6, y: 7, expected: 'rune:B' })
  })
});

const SWAP_SPECS = Object.freeze([
  ['f7-reward-mid-stat-swap', 'f7-reward-mid-stat', 7, 'rewardMidDef', 'rewardMidAtk'],
  ['f8-reward-side-cache-swap', 'f8-reward-side-cache', 8, 'rewardNorthwest', 'rewardNortheast'],
  ['f8-reward-mid-stat-swap', 'f8-reward-mid-stat', 8, 'rewardMidAtk', 'rewardMidDef'],
  ['f8-card-route-swap', 'f8-card-route', 8, 'cardStarEast', 'cardMoonWest'],
  ['f8-card-star-lower-moon-swap', 'f8-card-route', 8, 'cardStarEast', 'cardMoonSouth'],
  ['f8-enemy-upper-swap', 'f8-enemy-upper', 8, 'enemyOuterNorthwest', 'enemyHushNorth'],
  ['f8-enemy-lower-swap', 'f8-enemy-lower', 8, 'enemyMuteWest', 'enemyOuterSouth'],
  ['f9-reward-side-cache-swap', 'f9-reward-side-cache', 9, 'rewardNorthwest', 'rewardNortheast'],
  ['f9-reward-mid-stat-swap', 'f9-reward-mid-stat', 9, 'rewardMidDef', 'rewardMidAtk'],
  ['f9-card-route-swap', 'f9-card-route', 9, 'cardStarEast', 'cardSunWest'],
  ['f9-card-star-moon-swap', 'f9-card-route', 9, 'cardStarEast', 'cardMoonSouth'],
  ['f9-card-sun-moon-swap', 'f9-card-route', 9, 'cardSunWest', 'cardMoonSouth'],
  ['f9-enemy-upper-swap', 'f9-enemy-upper', 9, 'enemySentinelNorthwest', 'enemyNullNorth'],
  ['f9-enemy-mid-swap', 'f9-enemy-mid', 9, 'enemyCrownMid', 'enemySentinelMid'],
  ['f9-rune-c-a-swap', 'f9-rune-placement', 9, 'runeC', 'runeA'],
  ['f9-rune-c-b-swap', 'f9-rune-placement', 9, 'runeC', 'runeB'],
  ['f9-rune-a-b-swap', 'f9-rune-placement', 9, 'runeA', 'runeB']
]);

const CROSS_FLOOR_EXCHANGE_SPECS = Object.freeze([
  ['cross-stat-f8-def-f9-atk', 'cross-stat-timing', [8, 'rewardMidDef'], [9, 'rewardMidAtk']],
  ['cross-stat-f8-atk-f9-def', 'cross-stat-timing', [8, 'rewardMidAtk'], [9, 'rewardDefSouth']],
  ['cross-hp-f8-large-f9-atk', 'cross-resource-timing', [8, 'rewardHpWest'], [9, 'rewardMidAtk']],
  ['cross-card-f8-star-f9-moon', 'cross-card-timing', [8, 'cardStarEast'], [9, 'cardMoonSouth']]
]);

function floorByNumber(number) {
  const floor = FLOORS.find((entry) => entry.number === number);
  if (!floor) throw new Error(`10F mutation requires floor ${number}.`);
  return floor;
}

function resolveSemanticSlot(floorNumber, slotId) {
  const floor = floorByNumber(floorNumber);
  const slot = AUTHORED_SLOT_SPECS[floorNumber]?.[slotId] ?? floor.codesignSlots?.[slotId];
  if (!slot) throw new Error(`10F semantic slot unavailable: f${floorNumber}.${slotId}`);
  const actual = floor.map[slot.y]?.[slot.x];
  if (actual !== slot.expected) {
    throw new Error(`10F semantic slot drift: f${floorNumber}.${slotId} expected ${slot.expected}, got ${actual}`);
  }
  return Object.freeze({
    floor: floorNumber,
    slotId,
    x: slot.x,
    y: slot.y,
    baselineToken: actual
  });
}

function slotTouch(slot) {
  return `slot:f${slot.floor}:${slot.slotId}`;
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
  const swaps = SWAP_SPECS.map(([id, group, floorNumber, slotA, slotB]) => {
    const a = resolveSemanticSlot(floorNumber, slotA);
    const b = resolveSemanticSlot(floorNumber, slotB);
    return Object.freeze({
      id, group, kind: 'slot-swap', floor: floorNumber, a, b,
      touches: Object.freeze([slotTouch(a), slotTouch(b)])
    });
  });
  const crossFloor = CROSS_FLOOR_EXCHANGE_SPECS.map(([id, group, specA, specB]) => {
    const a = resolveSemanticSlot(specA[0], specA[1]);
    const b = resolveSemanticSlot(specB[0], specB[1]);
    return Object.freeze({
      id, group, kind: 'cross-floor-swap', a, b,
      touches: Object.freeze([slotTouch(a), slotTouch(b)])
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

function applySlotExchange(mutation, undo, a, b) {
  const floorA = floorByNumber(a.floor);
  const floorB = floorByNumber(b.floor);
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
  if (mutation.kind === 'slot-swap' || mutation.kind === 'cross-floor-swap') {
    applySlotExchange(mutation, undo, mutation.a, mutation.b);
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
