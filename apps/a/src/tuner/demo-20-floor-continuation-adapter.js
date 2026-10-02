export const DEMO20_CONTINUATION_POLICY_ID = 'demo-20f-act1-shop-macro-witness-v2';

/**
 * Restricts a witness search to the already-replayed F10 boundary and the
 * authored second act.  It is deliberately a search policy, never a gameplay
 * rule and never an impossibility proof: a route found through it is replayed
 * by engine.js and is therefore a real full-game witness, while a failure only
 * says this particular forward continuation did not find one.
 *
 * All Act I map exploration has already been fixed by the accepted F10
 * prefix.  F5's merchant remains a real strategic resource, however: every
 * legal revisit is represented as one exact engine-replayed teleport → buy →
 * return macro instead of re-enumerating every old room. Act II backtracking
 * (including revisiting F15) remains legal.
 */
export function createDemoTwentyFloorContinuationAdapter(baseAdapter, {
  firstActLastFloorIndex = 9,
  firstActTwoFloorIndex = 10,
  firstActShopFloorIndex = 4
} = {}) {
  if (!baseAdapter || typeof baseAdapter.enumerateActions !== 'function') {
    throw new Error('20F continuation adapter requires an action-enumerating base adapter.');
  }
  if (!Number.isInteger(firstActLastFloorIndex) || !Number.isInteger(firstActTwoFloorIndex)
    || !Number.isInteger(firstActShopFloorIndex)
    || firstActTwoFloorIndex !== firstActLastFloorIndex + 1) {
    throw new Error('20F continuation adapter requires consecutive F10/F11 boundary indices and an F5 shop index.');
  }

  function permitted(state, action) {
    // Compass can otherwise re-open all F1–F10 rooms and the F5 shop.  The
    // boundary witness has already committed those decisions.
    if (action.kind === 'teleport') return action.targetFloor >= firstActTwoFloorIndex;

    // A down stair on F10 returns to F9; a down stair on F11 returns to F10.
    // Both cross the fixed-prefix boundary.  Downstairs from F12 onward are
    // kept so the F15 shop remains a real Act II decision point.
    if (action.kind === 'tile' && action.token === 'D') {
      return state.floor > firstActTwoFloorIndex;
    }
    return true;
  }

  function actOneShopReturnActions(state) {
    if (state.floor < firstActTwoFloorIndex) return [];
    const departure = baseAdapter.applyAction(baseAdapter.cloneState(state), {
      kind: 'teleport',
      eventId: `teleport:f${firstActShopFloorIndex + 1}`,
      targetFloor: firstActShopFloorIndex
    });
    if (!departure?.ok) return [];

    const shopActions = baseAdapter.enumerateActions(departure.state)
      .filter((action) => action.kind === 'shop');
    return shopActions.map((shop) => ({
      kind: 'act1-shop-return',
      eventId: `act1-shop-return:f${state.floor + 1}:p${state.shopPurchases}:${shop.optionId}`,
      returnFloor: state.floor,
      optionId: shop.optionId
    }));
  }

  function applyActOneShopReturn(state, action) {
    const departure = baseAdapter.applyAction(baseAdapter.cloneState(state), {
      kind: 'teleport',
      eventId: `teleport:f${firstActShopFloorIndex + 1}`,
      targetFloor: firstActShopFloorIndex
    });
    if (!departure?.ok) return departure;

    const shop = baseAdapter.enumerateActions(departure.state)
      .find((candidate) => candidate.kind === 'shop' && candidate.optionId === action.optionId);
    if (!shop) return { ok: false, reason: `F5 shop option is no longer available: ${action.optionId}`, state };
    const purchase = baseAdapter.applyAction(departure.state, shop);
    if (!purchase?.ok) return purchase;

    const returned = baseAdapter.applyAction(purchase.state, {
      kind: 'teleport',
      eventId: `teleport:f${action.returnFloor + 1}`,
      targetFloor: action.returnFloor
    });
    if (!returned?.ok) return returned;
    return {
      ok: true,
      state: returned.state,
      // The solver certificate records only primitive, replayable actions.
      // No special macro support is required by the authoritative replayer.
      steps: [...(departure.steps ?? []), ...(purchase.steps ?? []), ...(returned.steps ?? [])]
    };
  }

  return {
    ...baseAdapter,
    continuationPolicy: Object.freeze({
      id: DEMO20_CONTINUATION_POLICY_ID,
      firstActLastFloorIndex,
      firstActTwoFloorIndex,
      firstActShopFloorIndex,
      witnessOnly: true,
      preservesActTwoBacktracking: true,
      preservesF5ShopChoicesAsMacros: true
    }),
    enumerateActions(state) {
      return [
        ...baseAdapter.enumerateActions(state).filter((action) => permitted(state, action)),
        ...actOneShopReturnActions(state)
      ].sort((left, right) => left.eventId.localeCompare(right.eventId));
    },
    applyAction(state, action) {
      if (action?.kind === 'act1-shop-return') return applyActOneShopReturn(state, action);
      return baseAdapter.applyAction(state, action);
    },
    actionClass(action) {
      return action?.kind === 'act1-shop-return'
        ? 'act1-shop-return'
        : baseAdapter.actionClass?.(action) ?? action?.kind ?? 'unknown';
    }
  };
}
