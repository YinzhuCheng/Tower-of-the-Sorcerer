import { ENEMIES } from '../game/data.js';
import { calculateBattle } from '../game/engine.js';

const SAFE_REWARD_KEYS = new Set(['hp', 'maxHp', 'atk', 'def', 'gold']);

function directRewardIsMonotone(reward) {
  if (!reward) return true;
  for (const [key, raw] of Object.entries(reward)) {
    if (!SAFE_REWARD_KEYS.has(key)) return false;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return false;
  }
  return true;
}

/**
 * Proof gate for one enemy action that may be forced by normalization.
 *
 * Lucky must already be owned so killing now cannot forfeit the Gold multiplier.
 * Boss/final/phase enemies are excluded even if their numeric fight happens to
 * cost zero HP because they have stage/story semantics. Direct rewards are
 * accepted only when every recognized numeric effect is nonnegative and no
 * `core`/unknown field is present.
 */
export function isProvablyMonotoneLuckyZeroDamageEnemyAction(state, action, {
  enemies = ENEMIES,
  battleCalculator = calculateBattle
} = {}) {
  if (!state?.relics?.lucky) return false;
  if (action?.kind !== 'tile' || action?.parsed?.type !== 'enemy') return false;
  const enemy = enemies[action.parsed.id];
  if (!enemy) return false;
  if (enemy.boss || enemy.finalBoss || enemy.phaseNext) return false;
  if (!Number.isFinite(Number(enemy.gold)) || Number(enemy.gold) < 0) return false;
  if (!directRewardIsMonotone(enemy.reward)) return false;

  const battle = battleCalculator(state.stats, enemy, state.relics);
  return Boolean(
    battle?.winnable
    && Number.isFinite(battle.totalDamage)
    && Number(battle.totalDamage) === 0
  );
}

function automaticize(steps = []) {
  return steps.map((step) => ({
    ...step,
    automatic: true,
    normalizationRule: 'lucky-zero-damage-enemy-v1'
  }));
}

/**
 * Add a dominance-preserving zero-damage enemy closure to an already restricted
 * fixed-purchase Tower adapter.
 *
 * The wrapper does not alter enumerateActions/applyAction/upper bounds. It only
 * canonicalizes states by repeatedly forcing the lexicographically first
 * currently reachable enemy satisfying the proof gate above, then rerunning the
 * ordinary item/switch normalization. Every forced kill is still executed by
 * the base adapter and therefore by authoritative `engine.js`; the returned
 * steps stay inside Solver certificates and replay normally.
 */
export function createFixedPurchaseZeroDamageClosureAdapter({ baseAdapter } = {}) {
  if (!baseAdapter?.fixedPurchasePolicy) {
    throw new Error('Zero-damage enemy closure requires a fixed-purchase policy adapter.');
  }
  if (typeof baseAdapter.normalize !== 'function'
    || typeof baseAdapter.enumerateActions !== 'function'
    || typeof baseAdapter.applyAction !== 'function') {
    throw new Error('Zero-damage enemy closure requires normalize/enumerateActions/applyAction.');
  }

  const baseNormalize = baseAdapter.normalize.bind(baseAdapter);
  const baseEnumerate = baseAdapter.enumerateActions.bind(baseAdapter);
  const baseApply = baseAdapter.applyAction.bind(baseAdapter);

  return {
    ...baseAdapter,
    normalize(state) {
      const first = baseNormalize(state);
      let current = first.state;
      const steps = [...(first.steps ?? [])];
      let forcedKills = 0;

      while (forcedKills < 512) {
        const candidates = baseEnumerate(current)
          .filter((action) => isProvablyMonotoneLuckyZeroDamageEnemyAction(current, action))
          .sort((a, b) => String(a.eventId).localeCompare(String(b.eventId)));
        if (!candidates.length) break;

        const working = typeof baseAdapter.cloneState === 'function'
          ? baseAdapter.cloneState(current)
          : structuredClone(current);
        const applied = baseApply(working, candidates[0]);
        if (!applied?.ok || !applied.state) {
          throw new Error(`Lucky zero-damage closure failed at ${candidates[0].eventId}: ${applied?.reason ?? 'unknown'}`);
        }
        steps.push(...automaticize(applied.steps));
        forcedKills += 1;

        const normalized = baseNormalize(applied.state);
        current = normalized.state;
        steps.push(...(normalized.steps ?? []));
      }

      if (forcedKills >= 512) {
        throw new Error('Lucky zero-damage enemy closure exceeded safety limit.');
      }
      return { state: current, steps };
    },
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+lucky-zero-damage-enemy-closure-v1`;
    },
    zeroDamageEnemyClosure: Object.freeze({
      version: 1,
      requiresLucky: true,
      excludesBoss: true,
      excludesPhase: true
    })
  };
}
