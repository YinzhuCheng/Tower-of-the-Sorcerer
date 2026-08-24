import { ENEMIES, ITEMS, SHOP_OPTIONS } from '../game/data.js';

const ENEMY_FIELDS = Object.freeze(['hp', 'atk', 'def', 'gold', 'magicPower']);
const ITEM_FIELDS = Object.freeze(['hp', 'maxHp', 'atk', 'def']);
const SHOP_FIELDS = Object.freeze(['hp', 'maxHp', 'atk', 'def']);

function roundPolicy(target, field, baseline) {
  if (field.includes('hp') || (target === 'enemy' && field === 'hp')) {
    return Math.abs(baseline) >= 100 ? 10 : 1;
  }
  return 1;
}

function roundToStep(value, step) {
  return Math.round(value / step) * step;
}

function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

function boundsFor(target, field, baseline) {
  const low = field === 'hp' && target === 'enemy' ? 1 : 0;
  const magnitude = Math.max(1, Math.abs(baseline));
  return {
    min: low,
    max: Math.max(low + 1, baseline + magnitude * 2)
  };
}

function parameter({ target, id, fields, baseline, role, metadata = {} }) {
  const canonicalField = fields[0];
  const step = roundPolicy(target, canonicalField.replace(/^effect\./, ''), baseline);
  const bounds = boundsFor(target, canonicalField.replace(/^effect\./, ''), baseline);
  return Object.freeze({
    key: `${target}:${id}:${fields.join('+')}`,
    target,
    id,
    fields: Object.freeze([...fields]),
    baseline: Number(baseline),
    role,
    harderDirection: role === 'hazard' ? 1 : -1,
    roundTo: step,
    min: bounds.min,
    max: bounds.max,
    ...metadata
  });
}

function enemyParameters() {
  const output = [];
  for (const [id, enemy] of Object.entries(ENEMIES)) {
    for (const field of ENEMY_FIELDS) {
      if (!Number.isFinite(enemy[field])) continue;
      output.push(parameter({
        target: 'enemy',
        id,
        fields: [field],
        baseline: enemy[field],
        role: field === 'gold' ? 'supply' : 'hazard',
        metadata: {
          family: 'enemy',
          floor: enemy.floor ?? null,
          boss: Boolean(enemy.boss),
          special: enemy.special ?? null,
          label: `${enemy.name ?? id}.${field}`
        }
      }));
    }
  }
  return output;
}

function itemParameters() {
  const output = [];
  for (const [id, item] of Object.entries(ITEMS)) {
    if (item.kind !== 'stat') continue;

    if (Number.isFinite(item.hp) && Number.isFinite(item.maxHp) && item.hp === item.maxHp) {
      output.push(parameter({
        target: 'item',
        id,
        fields: ['hp', 'maxHp'],
        baseline: item.hp,
        role: 'supply',
        metadata: {
          family: 'item',
          itemKind: item.kind,
          label: `${item.name ?? id}.hp+maxHp`
        }
      }));
    }

    for (const field of ITEM_FIELDS) {
      if (field === 'hp' || field === 'maxHp') continue;
      if (!Number.isFinite(item[field])) continue;
      output.push(parameter({
        target: 'item',
        id,
        fields: [field],
        baseline: item[field],
        role: 'supply',
        metadata: {
          family: 'item',
          itemKind: item.kind,
          label: `${item.name ?? id}.${field}`
        }
      }));
    }
  }
  return output;
}

function shopParameters() {
  const output = [];
  for (const option of SHOP_OPTIONS) {
    const effect = option.effect ?? {};
    if (Number.isFinite(effect.hp) && Number.isFinite(effect.maxHp) && effect.hp === effect.maxHp) {
      output.push(parameter({
        target: 'shop',
        id: option.id,
        fields: ['effect.hp', 'effect.maxHp'],
        baseline: effect.hp,
        role: 'supply',
        metadata: {
          family: 'shop',
          label: `${option.name ?? option.id}.hp+maxHp`
        }
      }));
    }

    for (const field of SHOP_FIELDS) {
      if (field === 'hp' || field === 'maxHp') continue;
      if (!Number.isFinite(effect[field])) continue;
      output.push(parameter({
        target: 'shop',
        id: option.id,
        fields: [`effect.${field}`],
        baseline: effect[field],
        role: 'supply',
        metadata: {
          family: 'shop',
          label: `${option.name ?? option.id}.${field}`
        }
      }));
    }
  }
  return output;
}

/**
 * Canonical numeric mutation catalogue.
 *
 * This catalogue intentionally excludes topology, card counts, boss reward
 * objects and relic semantics. Those require stronger structural invariants and
 * should not enter the numeric tuner through an accidental generic object walk.
 */
export function listNumericMutationParameters() {
  return [
    ...enemyParameters(),
    ...itemParameters(),
    ...shopParameters()
  ].sort((a, b) => a.key.localeCompare(b.key));
}

export function materializeNumericMutation(parameterSpec, value) {
  if (!parameterSpec || !Array.isArray(parameterSpec.fields) || parameterSpec.fields.length === 0) {
    throw new Error('Numeric mutation requires a parameter specification.');
  }
  if (!Number.isFinite(value)) throw new Error('Numeric mutation requires a finite value.');
  return parameterSpec.fields.map((field) => ({
    target: parameterSpec.target,
    id: parameterSpec.id,
    field,
    value: Number(value)
  }));
}

export function proposeDirectionalMutation(parameterSpec, {
  relativeStep = 0.10,
  direction = 'harder'
} = {}) {
  if (!Number.isFinite(relativeStep) || relativeStep <= 0) {
    throw new Error('relativeStep must be a positive finite number.');
  }
  const sign = direction === 'harder'
    ? parameterSpec.harderDirection
    : direction === 'softer'
      ? -parameterSpec.harderDirection
      : null;
  if (sign == null) throw new Error(`Unknown mutation direction: ${direction}`);

  const absoluteStep = Math.max(parameterSpec.roundTo, Math.abs(parameterSpec.baseline) * relativeStep);
  let value = parameterSpec.baseline + sign * absoluteStep;
  value = roundToStep(value, parameterSpec.roundTo);
  value = clamp(value, parameterSpec.min, parameterSpec.max);

  if (value === parameterSpec.baseline) {
    value = clamp(
      parameterSpec.baseline + sign * parameterSpec.roundTo,
      parameterSpec.min,
      parameterSpec.max
    );
  }
  if (value === parameterSpec.baseline) return null;

  return {
    id: `${parameterSpec.key}@${direction}:${value}`,
    parameterKey: parameterSpec.key,
    direction,
    baseline: parameterSpec.baseline,
    value,
    relativeEdit: Math.abs(value - parameterSpec.baseline) / Math.max(1, Math.abs(parameterSpec.baseline)),
    edits: materializeNumericMutation(parameterSpec, value)
  };
}

export function generateDirectionalMutations({
  parameters = listNumericMutationParameters(),
  relativeSteps = [0.05, 0.10, 0.20],
  direction = 'harder'
} = {}) {
  const output = [];
  const seen = new Set();
  for (const spec of parameters) {
    for (const relativeStep of relativeSteps) {
      const mutation = proposeDirectionalMutation(spec, { relativeStep, direction });
      if (!mutation) continue;
      const key = `${mutation.parameterKey}:${mutation.value}`;
      if (seen.has(key)) continue;
      seen.add(key);
      output.push({ ...mutation, parameter: spec });
    }
  }
  return output;
}
