# Delayed-Holy proof decomposition

Status: 2026-08-25, `solver-phase1-pareto`.

This note records the current proof bottleneck and the reason for the next Solver optimization. It is intentionally repository-resident: the design must not depend on VM scratch state or transient CI logs.

## Problem

The Holy-aware player model currently requires evidence for four acquisition policies:

- `immediate`
- `after-core-6`
- `after-core-7`
- `before-final`

`immediate` has a feasible deterministic seed. The three delayed policies remain uncovered by deterministic purchase-prefix rescue.

A policy-constrained exact existence adapter was added so that seed failure would not be misreported as policy infeasibility. At the current diagnostic budget (`25,000 expanded / 250,000 generated`), all three delayed policies stop with:

```text
solvable = unknown
exact = false
stoppedReason = maxExpanded
```

The same result appears even in a shared pre-Holy stage query that terminates before the delayed policies diverge.

## Baseline pre-Holy stage profile

For both `preBoss` and `core6` stage goals, the raw adapter produced the same profile:

```text
expanded = 25,000
generated = 207,663
structuralStates = 50,013
queuePeak = 37,475
```

Expanded states were concentrated at:

```text
F5 / core5:  9,185
F6 / core5: 11,461
F4 / core5:  4,292
```

Generated actions were dominated by free travel:

```text
teleport = 124,778
D        =  24,322
U        =  17,575
```

`teleport + D` alone accounts for roughly 72% of generated actions. This strongly indicates travel-cycle multiplicity rather than a lack of forward reachability signal.

## First optimization: reuse canonical-travel-v1

`tower-bounds.js` already contains a history-free canonicalization used by optimize mode:

- after the compass exists, keep only downward teleports;
- remove `D` traversal, because a direct downward teleport is resource-equivalent;
- upward return remains expressible through permanently opened `U` traversal.

The proof argument depends on the boss-stair lock and monotonic map clearing:

1. visiting an upper floor proves the required lower-floor boss was defeated;
2. doors and enemies do not re-close/reappear;
3. therefore the opened `D -> U` return route remains available;
4. free upward teleport is replaceable by repeated `U` traversal;
5. free `D` traversal is replaceable by downward teleport.

This is not a new heuristic prune. It is an already-tested equivalence/canonicalization rule.

The pre-Holy stage adapter and Holy-policy constrained adapter now default to `createBoundedTowerAdapter()` so existence search reuses:

- compact frontier keys;
- canonical compass travel.

Existence mode ignores the bounded adapter's HP objective upper bound, so no optimization-only bound participates in feasibility proof.

## Why stage decomposition remains useful

Even after travel canonicalization, delayed Holy should not be attacked as three unrelated whole-game searches.

The common prefix is:

```text
start
  -> reach F6 without Holy
  -> make astralBoss legally fightable
  -> optionally defeat astralBoss / obtain core 6
```

Only after that do policy semantics diverge.

The intended proof stack is therefore:

```text
shared pre-Holy stage existence
  -> replayed stage certificate/state
  -> policy-specific continuation
  -> Holy acquisition
  -> victory
```

This has two advantages:

1. expensive prefix work is shared across delayed policies;
2. failure can be localized: prefix unreachable, continuation unreachable, or merely budget-limited.

## Next step if canonical travel is not sufficient

Do **not** immediately raise search budgets.

The next safe optimization should change ordering/representation before adding stronger pruning:

1. add stage-specific priority that distinguishes forward F6 event progress from old-floor cleanup;
2. preserve all legal actions unless an equivalence proof exists;
3. profile `expandedByStage` and `generatedByAction` after each change;
4. only introduce a new prune when its dominance/equivalence argument is documented and regression-tested.

A likely second decomposition is a replayable stage frontier: collect a bounded Pareto set of F6/core5 pre-Holy states, then launch `astralBoss` affordability/continuation analysis from those states instead of repeatedly searching the full prefix.

That frontier must retain resource trade-offs (`HP / ATK / DEF / gold / cards`) and cannot be reduced to one greedy state.

## Evidence vocabulary

- `uncovered`: current deterministic player model found no feasible seed; not infeasible.
- `unknown`: exact Solver budget exhausted; not infeasible.
- `stage reached`: exact existence found a stage certificate.
- `policy feasible`: policy-constrained Solver found a victory certificate and authoritative replay succeeded.
- `policy infeasible exact`: queue exhausted under the constrained rules with no goal.

These distinctions are part of the automatic-promotion safety boundary.
