import { ENEMIES } from '../game/data.js';
import { calculateBattle } from '../game/engine.js';

function cloneWith(baseAdapter, state) {
  return typeof baseAdapter.cloneState === 'function'
    ? baseAdapter.cloneState(state)
    : structuredClone(state);
}

function normalizeWith(baseAdapter, state) {
  if (typeof baseAdapter.normalize !== 'function') {
    return { state: cloneWith(baseAdapter, state), steps: [] };
  }
  const result = baseAdapter.normalize(cloneWith(baseAdapter, state));
  if (!result?.state) throw new Error('Late-game harvest base normalize() must return { state, steps }.');
  return { state: result.state, steps: result.steps ?? [] };
}

function rewardIsMonotone(enemy) {
  if (!enemy || enemy.boss || enemy.finalBoss || enemy.phaseNext) return false;
  if (Number(enemy.gold ?? 0) < 0) return false;
  const reward = enemy.reward ?? {};
  for (const field of ['hp', 'maxHp', 'atk', 'def', 'gold', 'core']) {
    if (Number(reward[field] ?? 0) < 0) return false;
  }
  return true;
}

/**
 * Sound late-game automatic-enemy condition.
 *
 * Once Lucky is already owned, a non-boss enemy that currently deals exactly
 * zero authoritative damage and has only non-negative rewards is a monotone
 * positive event: killing it cannot reduce HP, cannot reduce future gold, opens
 * rather than closes map space, and only increases resources. The player may
 * always ignore the extra gold/reward later, so delaying or skipping that kill
 * cannot create a state that is better in any canonical resource dimension.
 *
 * This predicate is intentionally conservative. It is not used before `minCores`
 * and never applies to bosses, phase enemies, negative rewards, or positive-damage
 * fights.
 */
export function isLateGameZeroDamageHarvestAction(state, action, {
  minCores = 7,
  requireLucky = true
} = {}) {
  if ((state?.cores ?? 0) < minCores) return false;
  if (requireLucky && state?.relics?.lucky !== true) return false;
  if (action?.kind !== 'tile' || action?.parsed?.type !== 'enemy') return false;
  const enemy = ENEMIES[action.parsed.id];
  if (!rewardIsMonotone(enemy)) return false;
  const battle = calculateBattle(state.stats, enemy, state.relics ?? {});
  return battle.winnable === true && battle.totalDamage === 0;
}

/**
 * Normalize replay-safe zero-damage optional enemies after the late-game core
 * boundary. This wrapper changes only canonical representative order; every
 * automatic kill is still executed by the wrapped Tower adapter and therefore
 * produces ordinary certificate steps that authoritative replay can validate.
 *
 * It is deliberately a suffix-only reduction. Earlier in the game Lucky timing,
 * boss rewards, and positive combat damage make enemy timing strategic.
 */
export function createLateGameZeroDamageHarvestAdapter({
  baseAdapter,
  minCores = 7,
  requireLucky = true,
  maxAutomaticKills = 256
} = {}) {
  if (!baseAdapter || typeof baseAdapter.enumerateActions !== 'function'
      || typeof baseAdapter.applyAction !== 'function') {
    throw new Error('Late-game zero-damage harvest adapter requires a Tower-like base adapter.');
  }
  if (!Number.isInteger(minCores) || minCores < 1) throw new Error('minCores must be positive.');
  if (!Number.isInteger(maxAutomaticKills) || maxAutomaticKills < 1) {
    throw new Error('maxAutomaticKills must be positive.');
  }

  return {
    ...baseAdapter,
    normalize(state) {
      let normalized = normalizeWith(baseAdapter, state);
      let working = normalized.state;
      const steps = [...normalized.steps];
      let kills = 0;

      while (kills < maxAutomaticKills) {
        const action = baseAdapter.enumerateActions(working)
          .filter((candidate) => isLateGameZeroDamageHarvestAction(working, candidate, {
            minCores,
            requireLucky
          }))
          .sort((a, b) => String(a.eventId).localeCompare(String(b.eventId)))[0];
        if (!action) break;

        const applied = baseAdapter.applyAction(cloneWith(baseAdapter, working), action);
        if (!applied?.ok) {
          throw new Error(`Late-game zero-damage harvest failed for ${action.eventId}: ${applied?.reason ?? 'unknown'}`);
        }
        working = applied.state;
        steps.push(...(applied.steps ?? []).map((step) => ({ ...step, automatic: true })));
        kills += 1;

        normalized = normalizeWith(baseAdapter, working);
        working = normalized.state;
        steps.push(...normalized.steps);
      }

      if (kills >= maxAutomaticKills) {
        const remains = baseAdapter.enumerateActions(working)
          .some((candidate) => isLateGameZeroDamageHarvestAction(working, candidate, {
            minCores,
            requireLucky
          }));
        if (remains) throw new Error('Late-game zero-damage harvest exceeded safety limit.');
      }

      return { state: working, steps };
    },
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+late-game-zero-damage-harvest:c${minCores}:lucky${requireLucky ? 1 : 0}`;
    },
    lateGameZeroDamageHarvest: Object.freeze({ minCores, requireLucky })
  };
}
