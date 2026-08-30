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
 * Return the exact equivalence class of one authoritative Compass transition.
 *
 * A Tower Compass teleport reads neither the current floor nor the connected
 * component that contains the hero. It deterministically moves the hero to the
 * requested visited floor's Compass anchor. Therefore two normalized states
 * with the same global world state and resources, but different source
 * locations, have exactly the same successor for the same target floor.
 *
 * This is deliberately narrower than a heuristic "useful teleport" rule. The
 * key retains every global structural axis supplied by the Tower adapter
 * (dynamic event vector, puzzle meta, relics, purchases, visited floors and
 * victory) as well as every resource axis. Only the two source axes ignored by
 * `teleportToFloor()` are removed.
 */
export function towerTeleportTransitionEquivalenceKey(baseAdapter, state, targetFloor) {
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
 * Solve-scoped exact transition memo for the ordinary Tower adapter.
 *
 * The first `(global state, full resources, target floor)` teleport is emitted
 * normally. An equal teleport generated from another source floor/component is
 * omitted because authoritative teleport plus deterministic normalization
 * reaches the identical solver-relevant successor. No card, event, shop,
 * relic, puzzle or combat branch is quotiented.
 *
 * Create a fresh adapter per `solve()` invocation. The memo must not be shared
 * between independent search roots. `minCores` is a performance scheduling
 * knob only: it delays an exact merge; it never changes its equivalence rule.
 */
export function createTowerTeleportTransitionMemoAdapter({
  baseAdapter,
  minCores = 0
} = {}) {
  if (typeof baseAdapter?.enumerateActions !== 'function'
    || typeof baseAdapter?.structuralKey !== 'function'
    || typeof baseAdapter?.resources !== 'function') {
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
        const key = towerTeleportTransitionEquivalenceKey(baseAdapter, state, action.targetFloor);
        if (generatedTeleportClasses.has(key)) {
          omittedEquivalentTeleports += 1;
          continue;
        }

        // Solver expands one returned action list synchronously. If its global
        // generation budget stops the loop mid-list, it terminates this solve;
        // no later label can depend on an unattempted marked action. Tower
        // teleport actions are legal and deterministic by construction.
        generatedTeleportClasses.add(key);
        firstTeleportClasses += 1;
        filtered.push(action);
      }
      return filtered;
    },
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+teleport-transition-memo-v2:c${minCores}`;
    },
    teleportTransitionMemo: Object.freeze({
      version: 2,
      fixedPolicyOnly: false,
      solveScoped: true,
      minCores,
      sourceAxesIgnored: Object.freeze(['floor', 'component']),
      successorRule: 'authoritative-teleport-plus-deterministic-normalization'
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
