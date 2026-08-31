import { ENEMIES, FLOORS, ITEMS } from '../game/data.js';
import { ACT3_CHARTERS } from '../game/act3-charters.js';
import { DEMO30_NUMERIC_BASELINE } from '../game/demo-30-floor-content.js';
import { refreshTowerAdapterCodec } from '../solver/tower-adapter.js';
import { createSemanticTopologyMutationCatalog } from './semantic-topology-mutations.js';

/**
 * Act III exposes several independent pressure axes to the tuner. Story
 * contracts remain frozen, while optional encounter placement, resource yield
 * and non-destructive maze shape can be explored reversibly.
 */
export const DEMO30_MUTATION_SCOPE = Object.freeze({
  editable: Object.freeze([
    'enemy.hp', 'enemy.atk', 'enemy.def', 'enemy.magicPower',
    'item.hp', 'item.maxHp', 'item.atk', 'item.def', 'item.mp', 'item.maxMp',
    'floor.shopEffectMultiplier', 'card-gate.requirements',
    'map.semantic-wall-floor-swap', 'map.optional-enemy-relocation', 'map.optional-enemy-insertion'
  ]),
  locked: Object.freeze([
    'chapter-contracts', 'charter-items', 'handoff-order', 'final-phase-order',
    'required-guardian-identity', 'stairs', 'story-dialogue'
  ])
});

// Full campaign replays are intentionally expensive. Two independent edits
// already cover a resource axis plus one layout axis; a deeper tree would
// create thousands of combinations without improving author feedback.
export const DEMO30_MUTATION_MAX_EDITS = 2;

function scale(value, factor) { return Math.max(1, Math.round(Number(value ?? 0) * factor)); }
function unique(values) { return [...new Set(values)]; }
function mutation(id, group, kind, payload, touches) {
  return Object.freeze({ id, group, kind, ...payload, touches: Object.freeze(unique(touches)) });
}
function enemyPatch(id, fields) { return Object.freeze({ id, fields: Object.freeze({ ...fields }) }); }
function floorByNumber(floorNumber, floors = FLOORS) {
  const floor = floors.find((entry) => entry.number === floorNumber);
  if (!floor) throw new Error(`Unknown Act III floor ${floorNumber}.`);
  return floor;
}
function locationKey(floor, point) { return `map:f${floor}:${point.x},${point.y}`; }
function mapToken(floor, point) { return floor.map[point.y]?.[point.x]; }

function act3BossIdsByFloor(enemies = ENEMIES) {
  const result = {};
  for (const [id, enemy] of Object.entries(enemies)) {
    if (!enemy?.boss || !Number.isInteger(enemy.floor) || enemy.floor < 21 || enemy.floor > 30) continue;
    (result[enemy.floor] ??= []).push(id);
  }
  return result;
}

function numericCatalog() {
  return [
    mutation('act3-final-hp-plus4', 'final-hp', 'enemy-patch', { patches: Object.freeze([
      enemyPatch('archiveWarden', { hp: scale(DEMO30_NUMERIC_BASELINE.archiveWarden.hp, 1.04) }),
      enemyPatch('errataCore', { hp: scale(DEMO30_NUMERIC_BASELINE.errataCore.hp, 1.04) })
    ]) }, ['enemy:archiveWarden.hp', 'enemy:errataCore.hp']),
    mutation('act3-final-pressure-plus3', 'final-pressure', 'enemy-patch', { patches: Object.freeze([
      enemyPatch('archiveWarden', { atk: scale(DEMO30_NUMERIC_BASELINE.archiveWarden.atk, 1.03), magicPower: scale(DEMO30_NUMERIC_BASELINE.archiveWarden.magicPower, 1.03) }),
      enemyPatch('errataCore', { atk: scale(DEMO30_NUMERIC_BASELINE.errataCore.atk, 1.03) })
    ]) }, ['enemy:archiveWarden.atk', 'enemy:archiveWarden.magicPower', 'enemy:errataCore.atk']),
    mutation('act3-checkpoint-guard-plus4', 'checkpoint-guard', 'enemy-patch', { patches: Object.freeze([
      enemyPatch('archiveMarshal', { hp: scale(DEMO30_NUMERIC_BASELINE.archiveMarshal.hp, 1.04), atk: scale(DEMO30_NUMERIC_BASELINE.archiveMarshal.atk, 1.04) }),
      enemyPatch('lastCustodian', { hp: scale(DEMO30_NUMERIC_BASELINE.lastCustodian.hp, 1.04), atk: scale(DEMO30_NUMERIC_BASELINE.lastCustodian.atk, 1.04) })
    ]) }, ['enemy:archiveMarshal.hp', 'enemy:archiveMarshal.atk', 'enemy:lastCustodian.hp', 'enemy:lastCustodian.atk']),
    mutation('act3-handoff-frontline-plus3', 'handoff-frontline', 'enemy-patch', { patches: Object.freeze([
      enemyPatch('marginDuelist', { atk: scale(DEMO30_NUMERIC_BASELINE.marginDuelist.atk, 1.03) }),
      enemyPatch('errataCantor', { magicPower: scale(DEMO30_NUMERIC_BASELINE.errataCantor.magicPower, 1.03) }),
      enemyPatch('archiveMarshal', { atk: scale(DEMO30_NUMERIC_BASELINE.archiveMarshal.atk, 1.03) })
    ]) }, ['enemy:marginDuelist.atk', 'enemy:errataCantor.magicPower', 'enemy:archiveMarshal.atk'])
  ];
}

function resourceCatalog(items = ITEMS, floors = FLOORS) {
  const catalog = [];
  if (Number.isFinite(items.act3Mana?.mp)) {
    catalog.push(mutation('act3-mana-cache-minus10', 'mana-cache', 'item-patch', {
      itemId: 'act3Mana', fields: Object.freeze({ mp: Math.max(0, items.act3Mana.mp - 10) })
    }, ['item:act3Mana.mp']));
  }
  if (Number.isFinite(items.relayCapacitor?.mp)) {
    catalog.push(mutation('act3-relay-capacitor-minus20', 'relay-capacitor', 'item-patch', {
      itemId: 'relayCapacitor', fields: Object.freeze({ mp: Math.max(0, items.relayCapacitor.mp - 20) })
    }, ['item:relayCapacitor.mp']));
  }
  const market = floorByNumber(26, floors);
  if (Number.isFinite(market.shopEffectMultiplier)) {
    catalog.push(mutation('act3-f26-market-output-minus5', 'f26-market', 'floor-patch', {
      floor: 26, fields: Object.freeze({ shopEffectMultiplier: Number((market.shopEffectMultiplier * 0.95).toFixed(2)) })
    }, ['floor:26.shopEffectMultiplier']));
  }
  const missingSeal = floorByNumber(25, floors).puzzles?.cardGates?.f25MissingSeal;
  if (missingSeal && Number.isFinite(missingSeal.moon)) {
    catalog.push(mutation('act3-f25-extra-moon-reserve', 'f25-missing-seal', 'card-gate-patch', {
      floor: 25, gateId: 'f25MissingSeal', requirements: Object.freeze({ ...missingSeal, moon: missingSeal.moon + 1 })
    }, ['card-gate:f25MissingSeal']));
  }
  return catalog;
}

function topologyCatalog(floors = FLOORS, enemies = ENEMIES) {
  const generated = createSemanticTopologyMutationCatalog(floors, {
    floorNumbers: [28, 29], bossIdsByFloor: act3BossIdsByFloor(enemies), maxPerFloor: 2,
    maxClosures: 12, maxOpenings: 12, minHardeningGain: 0, maxStepIncrease: 10,
    maxDiversityLoss: 0.18, maxChamberScoreLoss: 0.03
  });
  return generated.map((entry) => mutation(`act3-${entry.id}`, `topology-f${entry.floor}`, 'topology-swap', {
    floor: entry.floor,
    close: Object.freeze({ x: entry.close.x, y: entry.close.y }),
    open: Object.freeze({ x: entry.open.x, y: entry.open.y }),
    preview: entry.preview,
    generator: entry.generator
  }, [locationKey(entry.floor, entry.close), locationKey(entry.floor, entry.open)]));
}

function layoutCatalog(floors = FLOORS) {
  const catalog = [];
  const f29 = floorByNumber(29, floors);
  // Release already fronts indexBeast and leaves ledgerMage as the lower
  // guard. The next bounded probe tests a distinct placement decision rather
  // than reintroducing the pre-release layout.
  const move = { from: { x: 5, y: 7 }, to: { x: 3, y: 3 }, token: 'enemy:ledgerMage' };
  if (mapToken(f29, move.from) === move.token && mapToken(f29, move.to) === '.') {
    catalog.push(mutation('act3-f29-ledger-forward', 'f29-ledger-position', 'enemy-relocate', {
      floor: 29, ...move
    }, [locationKey(29, move.from), locationKey(29, move.to)]));
  }
  // This probe depends on the relocation clearing the original square, so a
  // candidate search cannot insert two actors into the same slot by accident.
  const insertion = { x: 5, y: 7 };
  if (mapToken(f29, insertion) === 'enemy:ledgerMage') {
    catalog.push(mutation('act3-f29-triage-ambush-after-ledger-move', 'f29-triage-ambush', 'enemy-insert-after-relocate', {
      floor: 29, requiresMutationId: 'act3-f29-ledger-forward', at: insertion, token: 'enemy:triageKnight'
    }, [locationKey(29, insertion)]));
  }
  return catalog;
}

/** The catalogue has one meaningful probe per resource axis and at most two
 * topology candidates.  This is a bounded tree, not every possible map edit. */
export function createDemoThirtyFloorMutationCatalog({ floors = FLOORS, enemies = ENEMIES, items = ITEMS } = {}) {
  return Object.freeze([...numericCatalog(), ...resourceCatalog(items, floors), ...topologyCatalog(floors, enemies), ...layoutCatalog(floors)]);
}

function catalogById(catalog) { return new Map((catalog ?? []).map((entry) => [entry.id, entry])); }
function overlaps(left, right) { const seen = new Set(left); return right.some((value) => seen.has(value)); }
function canShareTouchedSlot(selected, entry) {
  // The only deliberate overlap is moving a guard away and then replacing
  // its old square with the authored ambush.  It is an ordered composition, not
  // two entities being placed on the same map tile.
  return entry.kind === 'enemy-insert-after-relocate'
    && selected.some((candidate) => candidate.id === entry.requiresMutationId);
}

/** Candidate expansion is a bounded mutation-tree search. A branch may make
 * two independent commitments only; overlapping semantic groups and map slots
 * are rejected before the expensive replay solver runs. */
export function expandDemoThirtyFloorCandidate(candidate = {}, catalog = [], { maxEdits = DEMO30_MUTATION_MAX_EDITS } = {}) {
  const selectedIds = [...(candidate.mutationIds ?? [])];
  if (selectedIds.length >= maxEdits) return Object.freeze([]);
  const byId = catalogById(catalog);
  const selected = selectedIds.map((id) => byId.get(id)).filter(Boolean);
  const groups = new Set(selected.map((entry) => entry.group));
  const touches = selected.flatMap((entry) => entry.touches ?? []);
  return Object.freeze(catalog
    .filter((entry) => !selectedIds.includes(entry.id) && !groups.has(entry.group)
      && (!overlaps(touches, entry.touches ?? []) || canShareTouchedSlot(selected, entry))
      && (!entry.requiresMutationId || selectedIds.includes(entry.requiresMutationId)))
    .map((entry) => Object.freeze({ mutationIds: Object.freeze([...selectedIds, entry.id].sort()) })));
}

function applyEnemyPatch(entry, undo, { enemies }) {
  for (const patch of entry.patches ?? []) {
    const enemy = enemies[patch.id];
    if (!enemy) throw new Error(`Act III mutation references unknown enemy '${patch.id}'.`);
    for (const [field, value] of Object.entries(patch.fields ?? {})) {
      const before = enemy[field];
      undo.push(() => { enemy[field] = before; });
      enemy[field] = value;
    }
  }
}
function applyItemPatch(entry, undo, { items }) {
  const item = items[entry.itemId];
  if (!item) throw new Error(`Act III mutation references unknown item '${entry.itemId}'.`);
  for (const [field, value] of Object.entries(entry.fields ?? {})) {
    const before = item[field]; undo.push(() => { item[field] = before; }); item[field] = value;
  }
}
function applyFloorPatch(entry, undo, { floors }) {
  const floor = floorByNumber(entry.floor, floors);
  for (const [field, value] of Object.entries(entry.fields ?? {})) {
    const before = floor[field]; undo.push(() => { floor[field] = before; }); floor[field] = value;
  }
}
function applyCardGatePatch(entry, undo, { floors }) {
  const gates = floorByNumber(entry.floor, floors).puzzles?.cardGates;
  if (!gates?.[entry.gateId]) throw new Error(`Act III mutation references unknown card gate '${entry.gateId}'.`);
  const before = gates[entry.gateId]; undo.push(() => { gates[entry.gateId] = before; }); gates[entry.gateId] = { ...entry.requirements };
}
function applyTopologySwap(entry, undo, { floors }) {
  const floor = floorByNumber(entry.floor, floors);
  const closeToken = mapToken(floor, entry.close); const openToken = mapToken(floor, entry.open);
  if (closeToken !== '.' || openToken !== '#') throw new Error(`Act III topology slot drift for ${entry.id}: ${closeToken}/${openToken}`);
  undo.push(() => { floor.map[entry.close.y][entry.close.x] = closeToken; floor.map[entry.open.y][entry.open.x] = openToken; });
  floor.map[entry.close.y][entry.close.x] = '#'; floor.map[entry.open.y][entry.open.x] = '.';
}
function applyEnemyRelocation(entry, undo, { floors }) {
  const floor = floorByNumber(entry.floor, floors);
  const from = mapToken(floor, entry.from); const to = mapToken(floor, entry.to);
  if (from !== entry.token || to !== '.') throw new Error(`Act III enemy relocation drift for ${entry.id}: ${from}/${to}`);
  undo.push(() => { floor.map[entry.from.y][entry.from.x] = from; floor.map[entry.to.y][entry.to.x] = to; });
  floor.map[entry.from.y][entry.from.x] = '.'; floor.map[entry.to.y][entry.to.x] = entry.token;
}
function applyEnemyInsertAfterRelocate(entry, undo, { floors }) {
  const floor = floorByNumber(entry.floor, floors); const before = mapToken(floor, entry.at);
  if (before !== '.') throw new Error(`Act III enemy insertion requires an empty slot for ${entry.id}; found ${before}.`);
  undo.push(() => { floor.map[entry.at.y][entry.at.x] = before; }); floor.map[entry.at.y][entry.at.x] = entry.token;
}
function needsCodecRefresh(entry) { return ['topology-swap', 'enemy-relocate', 'enemy-insert-after-relocate'].includes(entry.kind); }
function applyMutation(entry, undo, source) {
  if (entry.kind === 'enemy-patch') return applyEnemyPatch(entry, undo, source);
  if (entry.kind === 'item-patch') return applyItemPatch(entry, undo, source);
  if (entry.kind === 'floor-patch') return applyFloorPatch(entry, undo, source);
  if (entry.kind === 'card-gate-patch') return applyCardGatePatch(entry, undo, source);
  if (entry.kind === 'topology-swap') return applyTopologySwap(entry, undo, source);
  if (entry.kind === 'enemy-relocate') return applyEnemyRelocation(entry, undo, source);
  if (entry.kind === 'enemy-insert-after-relocate') return applyEnemyInsertAfterRelocate(entry, undo, source);
  throw new Error(`Unknown Act III mutation kind '${entry.kind}'.`);
}

/** Applies a candidate only for `evaluate`, then restores every field/token.
 * A map edit rebuilds the compact-state codec on both sides so stale event
 * slots can never hide a topology or encounter-layout mutation. */
export function withDemoThirtyFloorCandidate(candidate, catalog, evaluate, dependencies = {}) {
  if (typeof evaluate !== 'function') throw new Error('Act III candidate evaluation callback is required.');
  const source = { enemies: ENEMIES, floors: FLOORS, items: ITEMS, ...dependencies };
  const byId = catalogById(catalog);
  const selected = [...(candidate?.mutationIds ?? [])].map((id) => {
    const entry = byId.get(id); if (!entry) throw new Error(`Unknown Act III mutation '${id}'.`); return entry;
  });
  if (selected.length > DEMO30_MUTATION_MAX_EDITS) {
    throw new Error(`Act III mutation candidates are capped at ${DEMO30_MUTATION_MAX_EDITS} edits.`);
  }
  // A dependent layout mutation must be applied after the relocation that
  // creates its empty tile, regardless of how a CLI or a test ordered IDs.
  const ordered = [...selected].sort((left, right) => {
    if (left.requiresMutationId === right.id) return 1;
    if (right.requiresMutationId === left.id) return -1;
    return left.id.localeCompare(right.id);
  });
  const groups = new Set(); const touches = []; const selectedIds = new Set(selected.map((entry) => entry.id)); const undo = [];
  const refresh = selected.some(needsCodecRefresh);
  try {
    for (const entry of ordered) {
      if (groups.has(entry.group) || (overlaps(touches, entry.touches ?? []) && !canShareTouchedSlot(selected, entry))) throw new Error(`Conflicting Act III mutation '${entry.id}'.`);
      if (entry.requiresMutationId && !selectedIds.has(entry.requiresMutationId)) throw new Error(`Act III mutation '${entry.id}' requires '${entry.requiresMutationId}'.`);
      groups.add(entry.group); touches.push(...(entry.touches ?? [])); applyMutation(entry, undo, source);
    }
    if (refresh) refreshTowerAdapterCodec();
    return evaluate();
  } finally {
    for (let index = undo.length - 1; index >= 0; index -= 1) undo[index]();
    if (refresh) refreshTowerAdapterCodec();
  }
}

/** A hardening candidate is accepted only if every mutually-exclusive chapter
 * and F27 handoff route survives authoritative replay. */
export function evaluateDemoThirtyFloorMutationCandidate({ candidate, catalog, evaluatePortfolio, dependencies = {} }) {
  if (typeof evaluatePortfolio !== 'function') throw new Error('Act III mutation evaluation requires a portfolio evaluator.');
  const portfolio = withDemoThirtyFloorCandidate(candidate, catalog, evaluatePortfolio, dependencies);
  const entries = portfolio?.entries ?? [];
  const ids = new Set(entries.map((entry) => entry.id));
  const complete = ACT3_CHARTERS.every((charter) => ids.has(charter.id) && entries.find((entry) => entry.id === charter.id)?.completed === true);
  const handoffComplete = !portfolio?.handoffPortfolio || portfolio.handoffPortfolio.entries.every((entry) => entry.completed === true);
  return Object.freeze({
    candidate: Object.freeze({ mutationIds: Object.freeze([...(candidate?.mutationIds ?? [])]) }),
    portfolio,
    publishable: Boolean(portfolio?.publishable && complete && handoffComplete),
    scope: DEMO30_MUTATION_SCOPE
  });
}
