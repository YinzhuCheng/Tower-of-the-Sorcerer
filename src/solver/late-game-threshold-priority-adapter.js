import { getShopCost } from '../game/data.js';

const PRIORITY_MODE = 'late-game-threshold-priority-v1';

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function floorMetaAt(state, floor) {
  const floorMeta = Array.isArray(state?.floorMeta) ? state.floorMeta : [];
  return floorMeta[floor] ?? {};
}

/**
 * Queue ordering for the late fixed-purchase threshold suffix only.
 *
 * This function is deliberately NOT a proof bound and never removes an action or
 * state. It exists to stop finite-budget c7->terminal searches from spending most
 * of their expansions on equivalent-looking F1-F4 Compass/stair travel states.
 *
 * Ordering is coarse-lexicographic:
 *   1. retain states in the strongest objective-upper-bound slack corridor;
 *   2. surface states that can immediately afford the next fixed shop purchase;
 *   3. prefer the terminal floor / terminal puzzle progress;
 *   4. prefer more completed purchases and fewer floors of backwards travel;
 *   5. use combat resources only as a final tie-breaker.
 *
 * The slack is bucketed instead of compared point-for-point. That allows a state
 * with the same broad terminal potential but materially better irreversible
 * progress to outrank a pure-travel state with one extra optimistic HP of bound.
 */
export function lateGameThresholdSuffixPriority(state, {
  baseAdapter,
  threshold,
  minCores = 7,
  slackBucket = 25
} = {}) {
  if (!baseAdapter || typeof baseAdapter.objectiveUpperBound !== 'function') {
    throw new Error('Late-game threshold priority requires objectiveUpperBound().');
  }
  if (!Number.isFinite(threshold)) throw new Error('Late-game threshold priority requires a finite threshold.');
  if (!Number.isInteger(minCores) || minCores < 1) throw new Error('minCores must be positive.');
  if (!Number.isFinite(slackBucket) || slackBucket <= 0) throw new Error('slackBucket must be positive.');

  const floorMeta = Array.isArray(state?.floorMeta) ? state.floorMeta : [];
  const terminalFloor = Math.max(0, floorMeta.length - 1);
  const floor = Math.max(0, finiteNumber(state?.floor));
  const cores = Math.max(0, finiteNumber(state?.cores));
  if (cores < minCores) {
    return typeof baseAdapter.priority === 'function' ? baseAdapter.priority(state) : 0;
  }
  const targetFloor = terminalFloor;
  const targetMeta = floorMetaAt(state, targetFloor);
  const currentMeta = floorMetaAt(state, floor);
  const floorDistance = Math.max(0, targetFloor - floor);
  const onTargetFloor = floor >= targetFloor ? 1 : 0;

  const upperBound = finiteNumber(baseAdapter.objectiveUpperBound(state), threshold);
  const slack = Math.max(0, upperBound - threshold);
  const slackBand = Math.floor(slack / slackBucket);
  const slackRemainder = slack - slackBand * slackBucket;

  const stats = state?.stats ?? {};
  const shopPurchases = Math.max(0, finiteNumber(state?.shopPurchases));
  const gold = Math.max(0, finiteNumber(stats.gold));
  const shopAffordable = gold >= getShopCost({ shopPurchases }) ? 1 : 0;
  const targetBossProgress = targetMeta.bossDefeated ? 1 : 0;
  const targetSwitches = Array.isArray(targetMeta.switches) ? targetMeta.switches.length : 0;
  const targetSequenceProgress = Math.max(0, finiteNumber(targetMeta.sequenceProgress));
  const currentBossProgress = currentMeta.bossDefeated ? 1 : 0;
  const currentSwitches = Array.isArray(currentMeta.switches) ? currentMeta.switches.length : 0;
  const currentSequenceProgress = Math.max(0, finiteNumber(currentMeta.sequenceProgress));

  // Keep the largest term < 1e15 for the expected Tower ranges so comparisons
  // remain stable in JS Number space. These weights define queue order only.
  return slackBand * 1e12
    + shopAffordable * 5e10
    + onTargetFloor * 3e10
    + targetBossProgress * 2e10
    + shopPurchases * 5e8
    + targetSwitches * 5e7
    + targetSequenceProgress * 2e7
    + currentBossProgress * 1e7
    + currentSwitches * 2e6
    + currentSequenceProgress * 1e6
    - floorDistance * 2e8
    + slackRemainder * 1e5
    + Math.max(0, finiteNumber(stats.atk)) * 1e3
    + Math.max(0, finiteNumber(stats.def)) * 10
    + Math.min(Math.max(0, finiteNumber(stats.hp)), 9_999) / 10_000;
}

/**
 * Priority-only adapter for the late threshold suffix. All transition,
 * normalization, dominance and admissible-bound semantics are inherited intact.
 */
export function createLateGameThresholdPriorityAdapter({
  baseAdapter,
  threshold,
  minCores = 7,
  slackBucket = 25
} = {}) {
  if (!baseAdapter || typeof baseAdapter.enumerateActions !== 'function'
      || typeof baseAdapter.applyAction !== 'function') {
    throw new Error('Late-game threshold priority adapter requires a Tower-like base adapter.');
  }
  if (typeof baseAdapter.objectiveUpperBound !== 'function') {
    throw new Error('Late-game threshold priority adapter requires objectiveUpperBound().');
  }
  if (!Number.isFinite(threshold)) throw new Error('threshold must be finite.');
  if (!Number.isInteger(minCores) || minCores < 1) throw new Error('minCores must be positive.');
  if (!Number.isFinite(slackBucket) || slackBucket <= 0) throw new Error('slackBucket must be positive.');

  return {
    ...baseAdapter,
    priority(state) {
      return lateGameThresholdSuffixPriority(state, {
        baseAdapter,
        threshold,
        minCores,
        slackBucket
      });
    },
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+${PRIORITY_MODE}:t${threshold}:c${minCores}:b${slackBucket}`;
    },
    lateGameThresholdPriority: Object.freeze({
      mode: PRIORITY_MODE,
      threshold,
      minCores,
      slackBucket,
      correctnessRole: 'queue-order-only'
    })
  };
}
