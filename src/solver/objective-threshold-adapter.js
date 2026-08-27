/**
 * Convert an optimization problem into the exact existence question
 * "is there a goal with objective strictly above threshold?".
 *
 * The wrapper requires an admissible objective upper bound. Any state whose
 * upper bound is <= threshold is a proof-level dead end for this question even
 * when no feasible threshold-valued incumbent is known from the current bridge.
 * This is particularly useful for staged suffix exploit search, where a global
 * reference score cannot safely be installed as a branch-and-bound incumbent for
 * an arbitrary non-canonical bridge state.
 */
export function createObjectiveThresholdAdapter({
  threshold,
  baseAdapter
} = {}) {
  if (!Number.isFinite(threshold)) throw new Error('objective threshold must be finite.');
  if (!baseAdapter || typeof baseAdapter.objectiveValue !== 'function') {
    throw new Error('objective threshold adapter requires objectiveValue().');
  }
  if (typeof baseAdapter.objectiveUpperBound !== 'function') {
    throw new Error('objective threshold adapter requires an admissible objectiveUpperBound().');
  }

  const baseDeadEnd = typeof baseAdapter.provenDeadEnd === 'function'
    ? baseAdapter.provenDeadEnd.bind(baseAdapter)
    : null;

  return {
    ...baseAdapter,
    isGoal(state) {
      return baseAdapter.isGoal(state)
        && baseAdapter.objectiveValue(state) > threshold;
    },
    provenDeadEnd(state) {
      if (baseDeadEnd?.(state)) return true;
      const upper = baseAdapter.objectiveUpperBound(state);
      if (!Number.isFinite(upper)) return false;
      return upper <= threshold;
    },
    stageKey(state) {
      const base = baseAdapter.stageKey ? baseAdapter.stageKey(state) : 'all';
      return `${base}/objective>${threshold}`;
    },
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'adapter'}+objective-threshold:>${threshold}`;
    },
    objectiveThreshold: threshold
  };
}
