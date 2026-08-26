import { stableStringify } from './state.js';

function parsedStructuralKey(baseAdapter, state) {
  const raw = baseAdapter.structuralKey(state);
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : structuredClone(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Teleport transition memo requires an object-like structural key.');
  }
  if (!Object.hasOwn(parsed, 'floor') || !Object.hasOwn(parsed, 'component')) {
    throw new Error('Teleport transition memo requires Tower structural key axes floor/component.');
  }
  return parsed;
}

/**
 * Build the source equivalence class for one authoritative Compass teleport.
 *
 * `teleportToFloor()` ignores the current floor/component and deterministically
 * lands at the requested target floor's canonical Compass anchor. Therefore two
 * normalized Tower states with identical global structural axes and complete
 * resources, differing only in current floor/component, produce the same target
 * state for the same `targetFloor`. The wrapped deterministic normalization then
 * also produces the same successor.
 *
 * Cards are included through `adapter.resources()`. Dynamic events, puzzle meta,
 * relics, purchases, visited floors and victory are retained through the Tower
 * structural key. Only the source location axes are removed.
 */
export function fixedPurchaseTeleportTransitionEquivalenceKey(baseAdapter, state, targetFloor) {
  if (!Number.isInteger(targetFloor) || targetFloor < 0) {
    throw new Error('Teleport transition equivalence requires a non-negative targetFloor.');
  }
  const structural = parsedStructuralKey(baseAdapter, state);
  delete structural.floor;
  delete structural.component;
  return stableStringify({
    targetFloor,
    structural,
    resources: baseAdapter.resources(state)
  });
}

/**
 * Solve-scoped exact transition memo for fixed-policy Compass searches.
 *
 * The first teleport in an equivalence class is returned normally and marks the
 * `(global state, full resources, target floor)` class as generated. Later
 * teleports from another current floor/component in the same class are omitted:
 * their authoritative teleport + deterministic normalization successor is byte-
 * for-byte equivalent in every Solver-relevant structural/resource axis.
 *
 * The memo is intentionally held inside this adapter instance. Create a fresh
 * adapter for every `solve()` call; never share one instance across independent
 * bridge suffix solves. Before `minCores` it is inert.
 *
 * This preserves the ordinary teleport hub and its lazy action expansion. It is
 * distinct from the rejected v1 meaningful-action macro, which eagerly flattened
 * all remote first actions and multiplied branching.
 */
export function createFixedPurchaseTeleportTransitionMemoAdapter({
  baseAdapter,
  minCores = 7
} = {}) {
  if (!baseAdapter?.fixedPurchasePolicy) {
    throw new Error('Teleport transition memo requires a fixed-purchase policy adapter.');
  }
  if (typeof baseAdapter.enumerateActions !== 'function'
    || typeof baseAdapter.structuralKey !== 'function'
    || typeof baseAdapter.resources !== 'function') {
    throw new Error('Teleport transition memo requires enumerateActions/structuralKey/resources.');
  }
  if (!Number.isInteger(minCores) || minCores < 0) {
    throw new Error('minCores must be a non-negative integer.');
  }

  const generatedTeleportClasses = new Set();
  let omittedEquivalentTeleports = 0;
  let firstTeleportClasses = 0;

  return {
    ...baseAdapter,
    enumerateActions(state) {
      const actions = baseAdapter.enumerateActions(state);
      if (!state?.relics?.compass || Number(state.cores ?? 0) < minCores) return actions;

      const filtered = [];
      for (const action of actions) {
        if (action?.kind !== 'teleport') {
          filtered.push(action);
          continue;
        }
        const key = fixedPurchaseTeleportTransitionEquivalenceKey(
          baseAdapter,
          state,
          action.targetFloor
        );
        if (generatedTeleportClasses.has(key)) {
          omittedEquivalentTeleports += 1;
          continue;
        }

        // Mark on enumeration rather than application because Solver expands an
        // enumerated action list synchronously. The only way the loop can stop
        // before reaching a later action is the configured maxGenerated budget,
        // which terminates this solve immediately; no future state can depend on
        // an unattempted marked class. Canonical Tower teleport actions emitted by
        // the base adapter are deterministic and legal by construction.
        generatedTeleportClasses.add(key);
        firstTeleportClasses += 1;
        filtered.push(action);
      }
      return filtered;
    },
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+teleport-transition-memo-v1:c${minCores}`;
    },
    teleportTransitionMemo: Object.freeze({
      version: 1,
      fixedPolicyOnly: true,
      solveScoped: true,
      minCores,
      sourceAxesIgnored: Object.freeze(['floor', 'component'])
    }),
    teleportTransitionMemoStats() {
      return {
        firstTeleportClasses,
        omittedEquivalentTeleports,
        memoSize: generatedTeleportClasses.size
      };
    }
  };
}
