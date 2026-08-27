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

### Full-profile result: the boundary is reachable and extremely wide

The first F6/core5 frontier profile used the same `25,000 expanded / 250,000 generated` cap and produced:

```text
hasBoundaryStates = true
coverageExact     = false
stoppedReason     = maxExpanded
expanded          = 25,000
generated         = 145,091
goalStructural    = 8,210
activeGoalLabels  = 8,210
verifiedSeeds     = 8,210 / 8,210
```

Every emitted boundary certificate passed authoritative replay. This changes the diagnosis materially:

- reaching F6/core5 without Holy is **proven feasible**;
- the previous `preBoss/core6` timeout was not evidence that the shared prefix was inaccessible;
- the real difficulty is the very large continuation-relevant F6 entry set;
- a single greedy F6 representative would be especially unsafe because thousands of structurally distinct/resource-incomparable entries already exist before frontier completion.

Representative verified seeds include trade-offs such as:

```text
HP 1054 / ATK 104 / DEF 96  / gold 2375 / cards 4-5-2
HP 1004 / ATK 104 / DEF 96  / gold 2527 / cards 4-5-2
HP 1374 / ATK 104 / DEF 100 / gold 2463 / cards 4-5-2
```

The frontier was still growing at the 25k cap, so **8,210 is a lower bound on active boundary width**, not a complete count.

### Discovery mode versus exhaustive mode

Because existence proof needs only one verified continuation chain, waiting for a complete F6 frontier before trying `astralBoss` is wasteful. `goal-frontier` therefore has two explicit modes under one exactness vocabulary:

- exhaustive mode: no `maxGoals`; attempts to enumerate the complete Pareto boundary;
- discovery mode: stop once `maxGoals` active boundary labels exist.

Discovery stop is reported as:

```text
stoppedReason = maxGoals
coverageExact = false
```

The emitted certificates remain valid replayable seeds; only completeness is unknown. This separation is fundamental:

```text
one verified seed chain -> sufficient for existence
complete boundary + exact failure of every continuation -> required for exact infeasibility
```

The staged delayed-Holy proof currently uses discovery mode (small verified seed set) for fast existence hunting, while the standalone boundary profile remains available for frontier-width/completeness research.

### Replayable bridges

The Solver replay layer supports certificate replay from an explicit `initialState` and verifies `certificate.initialStateHash` before any transition. A separate bridge helper exposes the exact compact terminal state only after authoritative replay succeeds.

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

## Staged continuation semantics

The current staged proof does:

```text
F6/core5 verified boundary seed
  -> no-Holy core6 continuation
  -> verified core6 bridge
  -> after-core-6 / after-core-7 / before-final continuation
```

Existence and infeasibility have deliberately asymmetric requirements:

- one replay-verified successful chain proves policy feasibility;
- exact failure from one core6 bridge does **not** prove global policy infeasibility, because another nondominated core6 bridge may succeed;
- global core6 infeasibility requires complete F6 boundary coverage and exact failure from every verified boundary continuation;
- until those conditions hold, failure remains `unknown`.

This avoids turning seed scheduling or an incomplete frontier into an accidental proof assumption.

## Next optimization if discovery seeds do not reach core6 quickly

The next safe lever is **seed scheduling**, not seed deletion.

The F6 frontier is now known to contain thousands of valid states. Generic Tower priority is unlikely to order those states optimally for `astralBoss`. A continuation scheduler may therefore rank verified seeds by a documented boss-affordability/proximity score, for example:

- current `ATK - astralBoss.DEF` threshold;
- current/projected boss damage;
- gold available for shop conversion;
- DEF threshold effects;
- HP survival margin after an optimistic legal purchase relaxation.

Such a score may change which verified seeds are attempted first. It must **not** delete nondominated seeds or participate in an exact-infeasibility claim.

If a scheduling heuristic fails to find a bridge, the correct status remains unknown.

## Evidence vocabulary

- `uncovered`: current deterministic player model found no feasible seed; not infeasible.
- `unknown`: exact Solver budget exhausted; not infeasible.
- `stage reached`: exact existence found a stage certificate.
- `boundary found`: at least one replayable boundary seed exists; frontier may still be incomplete.
- `boundary coverage exact`: prefix search exhausted and the boundary Pareto set is complete under the adapter.
- `boundary discovery complete`: requested seed count reached; **not** frontier-complete.
- `policy feasible`: policy-constrained Solver found a victory certificate and authoritative replay succeeded.
- `policy infeasible exact`: exhaustive prerequisites were satisfied and all relevant continuations failed exactly.

These distinctions are part of the automatic-promotion safety boundary.
