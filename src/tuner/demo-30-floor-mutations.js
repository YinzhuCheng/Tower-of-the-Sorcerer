import { ENEMIES } from '../game/data.js';
import { ACT3_CHARTERS } from '../game/act3-charters.js';
import { DEMO30_NUMERIC_BASELINE } from '../game/demo-30-floor-content.js';

/**
 * Numeric-only stress probes for Act III.  Route commitments, gate prices,
 * map positions, enemy order and dialogue are deliberately absent: a mutation
 * is allowed to ask whether a number is too soft, never to erase a choice.
 */
export const DEMO30_MUTATION_SCOPE = Object.freeze({
  editable: Object.freeze(['enemy.hp', 'enemy.atk', 'enemy.def', 'enemy.magicPower']),
  locked: Object.freeze(['maps', 'charter-gates', 'charter-items', 'card-prices', 'enemy-order', 'final-phase-order'])
});

function scale(value, factor) {
  return Math.max(1, Math.round(Number(value ?? 0) * factor));
}

function enemyPatch(id, fields) {
  return Object.freeze({ id, fields: Object.freeze({ ...fields }) });
}

export function createDemoThirtyFloorMutationCatalog() {
  return Object.freeze([
    Object.freeze({ id: 'act3-final-hp-plus4', title: 'F30 双相生命 +4%', patches: Object.freeze([
      enemyPatch('archiveWarden', { hp: scale(DEMO30_NUMERIC_BASELINE.archiveWarden.hp, 1.04) }),
      enemyPatch('errataCore', { hp: scale(DEMO30_NUMERIC_BASELINE.errataCore.hp, 1.04) })
    ]) }),
    Object.freeze({ id: 'act3-final-pressure-plus3', title: 'F30 双相攻击/魔法 +3%', patches: Object.freeze([
      enemyPatch('archiveWarden', { atk: scale(DEMO30_NUMERIC_BASELINE.archiveWarden.atk, 1.03), magicPower: scale(DEMO30_NUMERIC_BASELINE.archiveWarden.magicPower, 1.03) }),
      enemyPatch('errataCore', { atk: scale(DEMO30_NUMERIC_BASELINE.errataCore.atk, 1.03) })
    ]) }),
    Object.freeze({ id: 'act3-checkpoint-guard-plus4', title: 'F27/F29 强制守卫 +4%', patches: Object.freeze([
      enemyPatch('archiveMarshal', { hp: scale(DEMO30_NUMERIC_BASELINE.archiveMarshal.hp, 1.04), atk: scale(DEMO30_NUMERIC_BASELINE.archiveMarshal.atk, 1.04) }),
      enemyPatch('lastCustodian', { hp: scale(DEMO30_NUMERIC_BASELINE.lastCustodian.hp, 1.04), atk: scale(DEMO30_NUMERIC_BASELINE.lastCustodian.atk, 1.04) })
    ]) })
  ]);
}

function catalogById(catalog) {
  return new Map((catalog ?? []).map((entry) => [entry.id, entry]));
}

/** Applies a candidate only for the duration of `evaluate`; restoration runs
 * even when a solver throws.  This keeps each portfolio route comparable. */
export function withDemoThirtyFloorCandidate(candidate, catalog, evaluate) {
  const selected = (candidate?.mutationIds ?? []).map((id) => catalogById(catalog).get(id)).filter(Boolean);
  const before = new Map();
  for (const mutation of selected) {
    for (const patch of mutation.patches) {
      const enemy = ENEMIES[patch.id];
      if (!enemy) throw new Error(`Act III mutation references unknown enemy '${patch.id}'.`);
      for (const [field, value] of Object.entries(patch.fields)) {
        const key = `${patch.id}:${field}`;
        if (!before.has(key)) before.set(key, enemy[field]);
        enemy[field] = value;
      }
    }
  }
  try {
    return evaluate();
  } finally {
    for (const [key, value] of before) {
      const [id, field] = key.split(':');
      ENEMIES[id][field] = value;
    }
  }
}

/** A hardening candidate is accepted only if every mutually-exclusive
 * charter still has a replayed route.  A challenge that invalidates a whole
 * route family is evidence of a bad tuning direction, not release content. */
export function evaluateDemoThirtyFloorMutationCandidate({ candidate, catalog, evaluatePortfolio }) {
  if (typeof evaluatePortfolio !== 'function') throw new Error('Act III mutation evaluation requires a portfolio evaluator.');
  const portfolio = withDemoThirtyFloorCandidate(candidate, catalog, evaluatePortfolio);
  const entries = portfolio?.entries ?? [];
  const ids = new Set(entries.map((entry) => entry.id));
  const complete = ACT3_CHARTERS.every((charter) => ids.has(charter.id)
    && entries.find((entry) => entry.id === charter.id)?.completed === true);
  return Object.freeze({
    candidate: Object.freeze({ mutationIds: [...(candidate?.mutationIds ?? [])] }),
    portfolio,
    publishable: Boolean(portfolio?.publishable && complete),
    scope: DEMO30_MUTATION_SCOPE
  });
}
