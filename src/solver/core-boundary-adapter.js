/**
 * Turns any Tower-like adapter into a core-count boundary collector without
 * changing its transitions, resources, dominance relation or action set.
 *
 * This is used for proof/search decomposition: a replay-verified boundary
 * certificate is converted back into an exact compact state before a suffix
 * Solver begins. A finite boundary discovery budget can prove existence of a
 * bridge, but incomplete boundary coverage must never be used as infeasibility
 * evidence.
 */
export function createCoreBoundaryAdapter({
  targetCores,
  baseAdapter
} = {}) {
  if (!Number.isInteger(targetCores) || targetCores < 1) {
    throw new Error('targetCores must be a positive integer.');
  }
  if (!baseAdapter || typeof baseAdapter.enumerateActions !== 'function') {
    throw new Error('core boundary adapter requires a Tower-like base adapter.');
  }

  return {
    ...baseAdapter,
    isGoal(state) {
      return (state?.cores ?? 0) >= targetCores;
    },
    stageKey(state) {
      const base = baseAdapter.stageKey ? baseAdapter.stageKey(state) : 'all';
      return `${base}/boundary:c${targetCores}`;
    },
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+core-boundary:${targetCores}`;
    },
    boundaryTargetCores: targetCores
  };
}
