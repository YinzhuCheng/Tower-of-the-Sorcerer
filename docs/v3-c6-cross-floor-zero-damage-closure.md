# V3 Compass cross-floor zero-damage closure

The local Lucky zero-damage normalization cuts c6 search work sharply, but terminal counterexample suffixes still spend nearly all of their budget on travel / optional-harvest orderings. The factorization audit shows that every sampled c6 goal retains 11–16 Lucky-safe exact-zero-damage ordinary enemies somewhere in the remaining tower, while only a small subset is immediately reachable on the current floor.

This extension uses Compass only when a round trip cannot lose the current reachable component.

## Round-trip invariant

Compass teleport returns to the target floor's `D` anchor. Before any automatic cross-floor trip, the wrapper applies an authoritative self-teleport to a cloned compact state and requires:

```text
returned floor == current floor
returned componentAnchor == current componentAnchor
```

If the anchors differ, the closure does nothing. This prevents a forced detour from abandoning a component that Compass cannot return to.

## Productive trips only

Eligible target floors are already present in `visitedFloors`. A target trip is committed only if ordinary safe normalization plus the local Lucky zero-damage closure performs at least one event on that floor. Empty travel is discarded.

Actual committed order:

```text
home state
→ authoritative Compass teleport to target
→ ordinary safe item/switch normalization
→ local Lucky exact-zero-damage enemy closure
→ authoritative Compass teleport back home
→ ordinary/local closure on home
→ repeat to fixed point
```

Every teleport and forced event remains in the Solver certificate. No synthetic state edit or custom combat transition is used.

## Scope and proof role

The adapter requires a fixed-purchase policy adapter and both Lucky and Compass. It does not auto-buy shop upgrades, does not consume Holy automatically, does not modify bounds, and does not change the unrestricted Tower solver.

A separate `64→128→256→512` c6 growth workflow compares this stronger normalization against both the baseline and current-floor-only closure before it is used by staged V3 proof/counterexample search.
