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

### A/B result

With exactly the same `25,000 expanded / 250,000 generated` diagnostic budget, canonical travel changed the shared stage profile from:

```text
generated = 207,663
```

to:

```text
generated = 165,596
```

This is a reduction of roughly **20.3%**. The `after-core-6` whole-policy constrained search showed the same generated count, confirming that the reduction applies before policy-specific divergence.

However, both `preBoss` and `core6` still ended at `maxExpanded=25,000` without a certificate. Therefore:

- canonical travel is a useful proven-safe reduction and stays enabled;
- free-travel multiplicity was material but not the only bottleneck;
- increasing the raw search budget is still not the next move.

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

## Second optimization: F6/core5 boundary Pareto frontier

Canonical travel reduced action multiplicity but did not make a single first-goal stage search reach `preBoss`. The next layer is therefore a **boundary frontier**, not another scalar priority tweak.

Boundary definition for the first implementation:

```text
floor == F6
cores == 5
Holy not acquired
```

The collector stops expanding a label once it crosses that boundary. It does not require `astralBoss` to be immediately winnable. This deliberately separates:

1. expensive F1–F5 route/resource accumulation;
2. F6 local cleanup, shopping, astralBoss affordability and delayed-Holy continuation.

### Why this must be Pareto, not one greedy state

A single F6 entry can have more HP but less ATK, more DEF but less gold, or different remaining cards/events. None of those states is necessarily a valid substitute for another.

The frontier therefore keeps the same resource dimensions used by the main Solver:

```text
HP / maxHP / ATK / DEF / gold / sun / moon / star
```

and applies dominance only under the same structural key. States with different remaining event structure are **not** merged merely because their numeric resources look better.

The boundary collector may discard a state only when an existing label with the same continuation-relevant structural key dominates/equates it under the normal resource relation.

### Exactness semantics

A boundary frontier has two independent questions:

- `hasBoundaryStates`: at least one verified F6/core5 entry was found;
- `coverageExact`: the prefix queue was exhausted, so all nondominated boundary entries under the model were enumerated.

A budget-limited frontier can be useful as a seed source, but it must not be called complete. Automatic promotion cannot interpret an incomplete frontier as exhaustive Holy-policy coverage.

### Replayable bridges

The Solver replay layer now supports certificate replay from an explicit `initialState` and verifies `certificate.initialStateHash` before any transition. A separate bridge helper exposes the exact compact terminal state only after authoritative replay succeeds.

This enables the intended chain:

```text
prefix certificate
  -> authoritative replay
  -> exact compact bridge state
  -> continuation Solver(initialState=bridge)
  -> continuation certificate
  -> authoritative replay from the same bridge hash
```

No continuation may reconstruct its starting state from `certificate.final` or another lossy summary.

## Next step after the boundary collector

1. profile how quickly the F6/core5 frontier appears and how wide it is;
2. replay every emitted active boundary certificate before treating it as a continuation seed;
3. launch an `astralBoss`/core6 continuation from boundary entries, prioritizing but not assuming any one resource trade-off;
4. only after obtaining a verified core6 bridge split into `after-core-6`, `after-core-7`, and `before-final` continuations;
5. if the boundary itself remains expensive, improve ordering/representation before adding any stronger prune.

A likely later optimization is to rank boundary seeds for scheduling, but ranking must never delete nondominated seeds unless a separate proof establishes continuation dominance.

## Evidence vocabulary

- `uncovered`: current deterministic player model found no feasible seed; not infeasible.
- `unknown`: exact Solver budget exhausted; not infeasible.
- `stage reached`: exact existence found a stage certificate.
- `boundary found`: at least one replayable boundary seed exists; frontier may still be incomplete.
- `boundary coverage exact`: prefix search exhausted and the boundary Pareto set is complete under the adapter.
- `policy feasible`: policy-constrained Solver found a victory certificate and authoritative replay succeeded.
- `policy infeasible exact`: queue exhausted under the constrained rules with no goal.

These distinctions are part of the automatic-promotion safety boundary.
