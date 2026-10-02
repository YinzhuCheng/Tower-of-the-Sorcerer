import { ENEMIES, ITEMS, SHOP_OPTIONS } from '../game/data.js';
import { ACT2_UNIT_CATALOG } from '../game/demo-20-floor-progression-topology.js';
import { DEMO20_MAGIC_RELIC_EFFECTS, DEMO20_NUMERIC_BASELINE } from '../game/demo-20-floor-content.js';
import { WAR_COUNCIL_TUNING } from '../game/war-council.js';
import {
  assertDemoTwentyFloorSolverLocks,
  DEMO20_SOLVER_TUNING_PROFILE,
  isDemoTwentyFloorNumericField
} from './demo-20-floor-solver-profile.js';

const ENEMY_BANDS = Object.freeze({
  f11to13: Object.freeze(['manaWisp', 'aetherWarden', 'runeCantor', 'spellbladeDuelist']),
  f14Guardians: Object.freeze(['arcaneGatekeeper', 'spectrumMarshal', 'triuneArbiter']),
  f14to17: Object.freeze(['manaSentinel', 'prismArchivist', 'mirrorHuntress']),
  f18to19: Object.freeze(['voidHerald']),
  clusters: Object.freeze(['resonanceBlade', 'resonanceCantor', 'arcaneGatekeeper', 'spectrumMarshal', 'triuneArbiter', 'mirrorDuelist', 'mirrorCantor', 'crownBlade', 'crownCantor', 'crownMagus', 'echoRegent', 'arcaneSovereign', 'originCore'])
});

function touchEnemy(id, field) {
  return `enemy:${id}.${field}`;
}

function touchRelic(id, field) {
  return `relic:${id}.${field}`;
}

function touchShop(id, field) {
  return `shop:${id}.${field}`;
}

function touchCouncil(field) {
  return `council:${field}`;
}

function unique(values) {
  return [...new Set(values)];
}

function mutation(id, group, kind, payload, touches) {
  return Object.freeze({ id, group, kind, ...payload, touches: Object.freeze(unique(touches)) });
}

/**
 * A deliberately compact numeric-only mutation surface. It contains no map
 * coordinates and no token swaps, so candidates cannot use "difficulty" as an
 * excuse to move a door, card, Boss, relic, stair, or room boundary.
 */
export function createDemoTwentyFloorMutationCatalog({ enemies = ENEMIES, items = ITEMS, shopOptions = SHOP_OPTIONS } = {}) {
  const catalog = [];
  for (const [band, ids] of Object.entries(ENEMY_BANDS)) {
    const fields = band === 'f14Guardians' ? ['hp', 'atk', 'def'] : ['hp', 'atk'];
    for (const field of fields) {
      const applicable = ids.filter((id) => Number.isFinite(enemies[id]?.[field]));
      for (const direction of [-1, 1]) {
        const scale = direction < 0 ? 0.94 : 1.06;
        const id = `${band}-${field}-${direction < 0 ? 'soften' : 'harden'}6`;
        catalog.push(mutation(id, `${band}-${field}`, 'enemy-scale', { enemyIds: applicable, field, scale }, applicable.map((enemyId) => touchEnemy(enemyId, field))));
      }
    }
  }
  for (const id of Object.keys(ACT2_UNIT_CATALOG).filter((enemyId) => Number.isFinite(enemies[enemyId]?.magicPower))) {
    for (const delta of [-20, 20]) {
      catalog.push(mutation(
        `${id}-magic-${delta < 0 ? 'soften' : 'harden'}20`,
        `${id}-magic`,
        'enemy-delta',
        { enemyId: id, field: 'magicPower', delta },
        [touchEnemy(id, 'magicPower')]
      ));
    }
  }
  // A coarse, reversible feasibility probe for the first compulsory Act II
  // Boss cluster. It is intentionally not a production recommendation: it
  // answers the narrow question "can a full F14 guardian set be reached at
  // all?" before the later ray search chooses a tighter pressure window.
  const f14FeasibilityChanges = [
    ['arcaneGatekeeper', 'hp', 0.20], ['arcaneGatekeeper', 'atk', 0.75], ['arcaneGatekeeper', 'def', 0.85],
    ['spectrumMarshal', 'hp', 0.20], ['spectrumMarshal', 'atk', 0.75], ['spectrumMarshal', 'def', 0.85], ['spectrumMarshal', 'magicPower', -200],
    ['triuneArbiter', 'hp', 0.20], ['triuneArbiter', 'atk', 0.75], ['triuneArbiter', 'def', 0.85]
  ].map(([enemyId, field, value]) => ({
    enemyId,
    field,
    ...(field === 'magicPower' ? { delta: value } : { scale: value })
  }));
  if (f14FeasibilityChanges.every(({ enemyId, field }) => Number.isFinite(enemies[enemyId]?.[field]))) {
    catalog.push(mutation(
      'f14-guardians-feasibility-soften',
      'f14-guardians-feasibility',
      'enemy-profile',
      { changes: Object.freeze(f14FeasibilityChanges.map((entry) => Object.freeze({ ...entry }))) },
      f14FeasibilityChanges.map(({ enemyId, field }) => touchEnemy(enemyId, field))
    ));
  }
  for (const [relicId, effect] of Object.entries(DEMO20_MAGIC_RELIC_EFFECTS)) {
    for (const field of Object.keys(effect)) {
      const delta = field === 'maxMp' ? 10 : 20;
      for (const direction of [-1, 1]) {
        catalog.push(mutation(
          `${relicId}-${field}-${direction < 0 ? 'soften' : 'boost'}${delta}`,
          `${relicId}-${field}`,
          'relic-delta',
          { relicId, field, delta: direction * delta },
          [touchRelic(relicId, field)]
        ));
      }
    }
  }
  for (const optionId of ['mpRestore', 'maxMp']) {
    const option = shopOptions.find((entry) => entry.id === optionId);
    if (!option) throw new Error(`20F mutation profile requires F15 shop option ${optionId}.`);
    for (const field of Object.keys(option.effect)) {
      const delta = field === 'maxMp' ? 10 : 20;
      for (const direction of [-1, 1]) {
        catalog.push(mutation(
          `f15-${optionId}-${field}-${direction < 0 ? 'soften' : 'boost'}${delta}`,
          `f15-${optionId}-${field}`,
          'shop-delta',
          { optionId, field, delta: direction * delta },
          [touchShop(optionId, field)]
        ));
      }
    }
  }
  // The final pre-Boss council is a fixed-numeric puzzle in its own right.
  // Keep its tuning surface narrow and reversible; maps, roster identities,
  // enemy order and published enemy MP allocations remain immutable.
  for (const value of [WAR_COUNCIL_TUNING.loyalistScale - 0.01, WAR_COUNCIL_TUNING.loyalistScale + 0.01]) {
    const rounded = Number(value.toFixed(3));
    catalog.push(mutation(
      `council-loyalists-${rounded < WAR_COUNCIL_TUNING.loyalistScale ? 'soften' : 'harden'}10`,
      'council-loyalists',
      'council-scale',
      { value: rounded },
      [touchCouncil('loyalistScale')]
    ));
  }
  return Object.freeze(catalog);
}

export function demoTwentyFloorCandidateKey(candidate = {}) {
  const ids = [...(candidate.mutationIds ?? [])].sort();
  return ids.length ? ids.join('+') : 'baseline';
}

function overlaps(a, b) {
  const seen = new Set(a);
  return b.some((value) => seen.has(value));
}

export function expandDemoTwentyFloorCandidate(candidate = {}, catalog = [], { maxEdits = DEMO20_SOLVER_TUNING_PROFILE.maxEdits } = {}) {
  const selectedIds = [...(candidate.mutationIds ?? [])];
  if (selectedIds.length >= maxEdits) return [];
  const byId = new Map(catalog.map((entry) => [entry.id, entry]));
  const selected = selectedIds.map((id) => byId.get(id)).filter(Boolean);
  const groups = new Set(selected.map((entry) => entry.group));
  const touches = selected.flatMap((entry) => entry.touches);
  return catalog
    .filter((entry) => !selectedIds.includes(entry.id) && !groups.has(entry.group) && !overlaps(touches, entry.touches))
    .map((entry) => ({ mutationIds: [...selectedIds, entry.id].sort() }));
}

function applyMutation(entry, undo, { enemies, items, shopOptions, councilTuning = WAR_COUNCIL_TUNING }) {
  if (entry.kind === 'enemy-scale') {
    for (const enemyId of entry.enemyIds) {
      const enemy = enemies[enemyId];
      if (!enemy || !isDemoTwentyFloorNumericField(entry.field)) throw new Error(`Unavailable Act II enemy field: ${enemyId}.${entry.field}`);
      const before = enemy[entry.field];
      undo.push(() => { enemy[entry.field] = before; });
      enemy[entry.field] = Math.max(1, Math.round(before * entry.scale));
    }
    return;
  }
  if (entry.kind === 'enemy-delta') {
    const enemy = enemies[entry.enemyId];
    if (!enemy || !isDemoTwentyFloorNumericField(entry.field)) throw new Error(`Unavailable Act II enemy field: ${entry.enemyId}.${entry.field}`);
    const before = enemy[entry.field];
    undo.push(() => { enemy[entry.field] = before; });
    enemy[entry.field] = Math.max(0, before + entry.delta);
    return;
  }
  if (entry.kind === 'enemy-profile') {
    for (const change of entry.changes ?? []) {
      const enemy = enemies[change.enemyId];
      if (!enemy || !isDemoTwentyFloorNumericField(change.field)) {
        throw new Error(`Unavailable Act II enemy profile field: ${change.enemyId}.${change.field}`);
      }
      const before = enemy[change.field];
      undo.push(() => { enemy[change.field] = before; });
      if (Number.isFinite(change.scale)) enemy[change.field] = Math.max(1, Math.round(before * change.scale));
      else if (Number.isFinite(change.delta)) enemy[change.field] = Math.max(0, before + change.delta);
      else throw new Error(`Invalid Act II enemy profile change: ${change.enemyId}.${change.field}`);
    }
    return;
  }
  if (entry.kind === 'relic-delta') {
    const item = items[entry.relicId];
    if (!item) throw new Error(`Unavailable Act II relic field: ${entry.relicId}.${entry.field}`);
    const before = item[entry.field];
    undo.push(() => { item[entry.field] = before; });
    item[entry.field] = Math.max(0, before + entry.delta);
    return;
  }
  if (entry.kind === 'shop-delta') {
    const option = shopOptions.find((candidate) => candidate.id === entry.optionId);
    if (!option) throw new Error(`Unavailable Act II shop field: ${entry.optionId}.${entry.field}`);
    const before = option.effect[entry.field];
    undo.push(() => { option.effect[entry.field] = before; });
    option.effect[entry.field] = Math.max(0, before + entry.delta);
    return;
  }
  if (entry.kind === 'council-scale') {
    const before = councilTuning.loyalistScale;
    undo.push(() => { councilTuning.loyalistScale = before; });
    councilTuning.loyalistScale = entry.value;
    return;
  }
  throw new Error(`Unknown Act II mutation kind: ${entry.kind}`);
}

/** Apply one numeric-only candidate and always restore it before returning. */
export function withDemoTwentyFloorCandidate(candidate, catalog, evaluate, dependencies = {}) {
  if (typeof evaluate !== 'function') throw new Error('20F candidate evaluation callback is required.');
  const source = { enemies: ENEMIES, items: ITEMS, shopOptions: SHOP_OPTIONS, councilTuning: WAR_COUNCIL_TUNING, ...dependencies };
  const byId = new Map(catalog.map((entry) => [entry.id, entry]));
  const selected = [...(candidate?.mutationIds ?? [])].map((id) => {
    const entry = byId.get(id);
    if (!entry) throw new Error(`Unknown 20F mutation: ${id}`);
    return entry;
  });
  const groups = new Set();
  const touches = [];
  const undo = [];
  try {
    for (const entry of selected) {
      if (groups.has(entry.group) || overlaps(touches, entry.touches)) throw new Error(`Conflicting 20F mutation: ${entry.id}`);
      groups.add(entry.group);
      touches.push(...entry.touches);
      applyMutation(entry, undo, source);
    }
    if (dependencies.locks) assertDemoTwentyFloorSolverLocks(dependencies.locks, dependencies);
    return evaluate();
  } finally {
    for (let index = undo.length - 1; index >= 0; index -= 1) undo[index]();
  }
}

/**
 * Cheap, solver-free ordering metric.  It promotes hardening candidates that
 * affect many ordinary encounters before costly exact search, but it never
 * declares a candidate playable or deletes a state.
 */
export function scoreDemoTwentyFloorPruningCandidate(candidate, catalog = []) {
  const byId = new Map(catalog.map((entry) => [entry.id, entry]));
  const entries = [...(candidate.mutationIds ?? [])].map((id) => byId.get(id)).filter(Boolean);
  const hardenedEnemyFields = entries.filter((entry) => (
    (entry.kind === 'enemy-scale' && entry.scale > 1) || (entry.kind === 'enemy-delta' && entry.delta > 0)
  ));
  const affectedEnemies = unique(hardenedEnemyFields.flatMap((entry) => entry.enemyIds ?? [entry.enemyId]));
  const softening = entries.filter((entry) => entry.id.includes('soften')).length;
  return Object.freeze({
    key: demoTwentyFloorCandidateKey(candidate),
    affectedEnemies: affectedEnemies.length,
    hardeningFields: hardenedEnemyFields.length,
    softeningFields: softening,
    scoutPriority: hardenedEnemyFields.length * 10 + affectedEnemies.length - softening * 8
  });
}
