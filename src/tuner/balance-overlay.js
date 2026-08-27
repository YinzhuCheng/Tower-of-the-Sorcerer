import { ENEMIES, ITEMS, SHOP_OPTIONS } from '../game/data.js';

const ALLOWED_ENEMY_FIELDS = new Set(['hp', 'atk', 'def', 'gold', 'magicPower']);
const ALLOWED_ITEM_FIELDS = new Set(['hp', 'maxHp', 'atk', 'def', 'amount']);
const ALLOWED_SHOP_EFFECT_FIELDS = new Set(['hp', 'maxHp', 'atk', 'def']);
let overlayDepth = 0;

function shopOption(id) {
  const option = SHOP_OPTIONS.find((candidate) => candidate.id === id);
  if (!option) throw new Error(`Unknown shop option for balance edit: ${id}`);
  return option;
}

function resolveEdit(edit) {
  if (!edit || typeof edit !== 'object') throw new Error('Balance edit must be an object.');
  const { target, id, field } = edit;
  if (!Number.isFinite(edit.value)) throw new Error(`Balance edit ${target}:${id}:${field} requires a finite numeric value.`);

  if (target === 'enemy') {
    const enemy = ENEMIES[id];
    if (!enemy) throw new Error(`Unknown enemy for balance edit: ${id}`);
    if (!ALLOWED_ENEMY_FIELDS.has(field)) throw new Error(`Unsupported enemy balance field: ${field}`);
    return { object: enemy, field, current: enemy[field] ?? 0 };
  }

  if (target === 'item') {
    const item = ITEMS[id];
    if (!item) throw new Error(`Unknown item for balance edit: ${id}`);
    if (!ALLOWED_ITEM_FIELDS.has(field)) throw new Error(`Unsupported item balance field: ${field}`);
    return { object: item, field, current: item[field] ?? 0 };
  }

  if (target === 'shop') {
    const option = shopOption(id);
    if (!field.startsWith('effect.')) throw new Error(`Unsupported shop balance field: ${field}`);
    const effectField = field.slice('effect.'.length);
    if (!ALLOWED_SHOP_EFFECT_FIELDS.has(effectField)) throw new Error(`Unsupported shop effect field: ${effectField}`);
    return { object: option.effect, field: effectField, current: option.effect[effectField] ?? 0 };
  }

  throw new Error(`Unsupported balance edit target: ${target}`);
}

export function readBalanceValue(edit) {
  return resolveEdit({ ...edit, value: 0 }).current;
}

export function normalizeBalanceEdits(edits) {
  if (!Array.isArray(edits) || edits.length === 0) throw new Error('Balance edit set must be a non-empty array.');
  const seen = new Set();
  return edits.map((edit) => {
    const key = `${edit.target}:${edit.id}:${edit.field}`;
    if (seen.has(key)) throw new Error(`Duplicate balance edit target: ${key}`);
    seen.add(key);
    const resolved = resolveEdit(edit);
    return {
      target: edit.target,
      id: edit.id,
      field: edit.field,
      value: Number(edit.value),
      baseline: Number(resolved.current)
    };
  });
}

/**
 * Applies a temporary balance overlay to the canonical exported data objects.
 * `engine.js` imports those same object identities, so all transitions executed
 * inside the callback remain authoritative. The callback must be synchronous;
 * this deliberately prevents concurrent candidate evaluations from sharing
 * mutable balance state.
 */
export function withBalanceEdits(edits, callback) {
  if (typeof callback !== 'function') throw new Error('withBalanceEdits() requires a callback.');
  if (overlayDepth !== 0) throw new Error('Nested/concurrent balance overlays are not supported.');
  const normalized = normalizeBalanceEdits(edits);
  const snapshots = normalized.map((edit) => {
    const resolved = resolveEdit(edit);
    return { edit, object: resolved.object, field: resolved.field, previous: resolved.current };
  });

  overlayDepth += 1;
  try {
    for (const snapshot of snapshots) snapshot.object[snapshot.field] = snapshot.edit.value;
    const result = callback(normalized);
    if (result && typeof result.then === 'function') {
      throw new Error('Balance overlay callback must be synchronous.');
    }
    return result;
  } finally {
    for (let index = snapshots.length - 1; index >= 0; index -= 1) {
      const snapshot = snapshots[index];
      snapshot.object[snapshot.field] = snapshot.previous;
    }
    overlayDepth -= 1;
  }
}
