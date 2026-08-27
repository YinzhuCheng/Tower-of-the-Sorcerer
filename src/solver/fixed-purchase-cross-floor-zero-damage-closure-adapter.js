import { stableStringify } from './state.js';
import { createFixedPurchaseZeroDamageClosureAdapter } from './fixed-purchase-zero-damage-closure-adapter.js';

function cloneWith(adapter, state) {
  return typeof adapter.cloneState === 'function' ? adapter.cloneState(state) : structuredClone(state);
}

function teleportAction(targetFloor) {
  return {
    kind: 'teleport',
    eventId: `teleport:f${targetFloor + 1}`,
    targetFloor
  };
}

function automaticize(steps = [], rule = 'compass-cross-floor-zero-damage-v1') {
  return steps.map((step) => ({
    ...step,
    automatic: true,
    normalizationRule: rule
  }));
}

/**
 * Compass always returns to the target floor's D anchor. A cross-floor detour is
 * therefore order-safe only when returning to the current floor lands in the
 * same zero-cost connected component as the current compact state.
 *
 * We probe this with the authoritative wrapped teleport transition on a clone;
 * no synthetic path/connectivity implementation is introduced.
 */
export function canCompassRoundTripWithoutComponentLoss(baseAdapter, state) {
  if (!state?.relics?.lucky || !state?.relics?.compass) return false;
  if (!Number.isInteger(state.floor)) return false;
  const applied = baseAdapter.applyAction(
    cloneWith(baseAdapter, state),
    teleportAction(state.floor)
  );
  if (!applied?.ok || !applied.state) return false;
  return applied.state.floor === state.floor
    && stableStringify(applied.state.componentAnchor) === stableStringify(state.componentAnchor);
}

/**
 * Fixed-purchase search normalization that extends the local Lucky zero-damage
 * closure across already visited floors when Compass round-trips preserve the
 * current component.
 *
 * A target-floor visit is committed only if the ordinary local normalization on
 * that floor performs at least one proven-safe automatic event. The trip itself,
 * every target-floor event, the return teleport, and any newly exposed home-floor
 * events stay in the Solver certificate.
 */
export function createFixedPurchaseCrossFloorZeroDamageClosureAdapter({
  baseAdapter,
  maxAutomaticTrips = 128
} = {}) {
  if (!baseAdapter?.fixedPurchasePolicy) {
    throw new Error('Cross-floor zero-damage closure requires a fixed-purchase policy adapter.');
  }
  if (!Number.isInteger(maxAutomaticTrips) || maxAutomaticTrips < 1) {
    throw new Error('maxAutomaticTrips must be a positive integer.');
  }
  if (typeof baseAdapter.applyAction !== 'function' || typeof baseAdapter.normalize !== 'function') {
    throw new Error('Cross-floor zero-damage closure requires applyAction/normalize.');
  }

  const localClosure = createFixedPurchaseZeroDamageClosureAdapter({ baseAdapter });

  return {
    ...baseAdapter,
    normalize(state) {
      let normalized = localClosure.normalize(state);
      let working = normalized.state;
      const steps = [...(normalized.steps ?? [])];
      const homeFloor = working.floor;
      let trips = 0;

      while (trips < maxAutomaticTrips) {
        if (!canCompassRoundTripWithoutComponentLoss(baseAdapter, working)) break;

        const targets = [...new Set(working.visitedFloors ?? [])]
          .filter((floor) => Number.isInteger(floor) && floor !== homeFloor)
          .sort((a, b) => a - b);
        let chosen = null;

        for (const targetFloor of targets) {
          const outbound = baseAdapter.applyAction(
            cloneWith(baseAdapter, working),
            teleportAction(targetFloor)
          );
          if (!outbound?.ok || !outbound.state) continue;

          const targetNormalized = localClosure.normalize(outbound.state);
          if (!targetNormalized?.state || !(targetNormalized.steps?.length > 0)) continue;

          const inbound = baseAdapter.applyAction(
            cloneWith(baseAdapter, targetNormalized.state),
            teleportAction(homeFloor)
          );
          if (!inbound?.ok || !inbound.state) continue;

          chosen = { outbound, targetNormalized, inbound };
          break;
        }

        if (!chosen) break;
        steps.push(...automaticize(chosen.outbound.steps));
        steps.push(...(chosen.targetNormalized.steps ?? []));
        steps.push(...automaticize(chosen.inbound.steps));
        working = chosen.inbound.state;

        normalized = localClosure.normalize(working);
        working = normalized.state;
        steps.push(...(normalized.steps ?? []));
        trips += 1;
      }

      if (trips >= maxAutomaticTrips) {
        throw new Error('Compass cross-floor zero-damage closure exceeded safety limit.');
      }
      return { state: working, steps };
    },
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+compass-cross-floor-zero-damage-closure-v1`;
    },
    crossFloorZeroDamageClosure: Object.freeze({
      version: 1,
      requiresLucky: true,
      requiresCompass: true,
      preservesHomeComponent: true,
      maxAutomaticTrips
    })
  };
}
