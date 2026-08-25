# Delayed-Holy search experiments and retained decisions

Status: 2026-08-25, branch `solver-phase1-pareto`.

This file exists so search experiments that changed our engineering direction are not lost in CI logs or VM scratch. Only retained algorithms belong in the active stage adapter; negative A/B results remain documented here to prevent future agents from repeating them without new evidence.

## Baseline problem

Delayed Holy policies (`after-core-6`, `after-core-7`, `before-final`) remain **unknown**, not infeasible.

The shared prefix can reach replay-verified F6/core5/no-Holy states. A bounded full frontier run found thousands of such states, proving the semantic prefix exists while also showing that exact coverage is not yet complete.

The expensive question is what happens after that boundary:

```text
F6/core5/no-Holy
  -> resolve F6 corridor events
  -> obtain enough resources for astralBoss
  -> defeat astralBoss (core6)
  -> continue under the requested Holy timing policy
```

Every successful bridge must be reconstructed from authoritative Solver certificates and replayed through `engine.js`.

## Retained: 512 -> 12 boundary scheduling

The first staged proof accidentally coupled boundary discovery and continuation budget: it discovered only the first 12 boundary labels and then attempted those 12.

The retained model separates:

```text
boundaryDiscoveryGoals = 512
maxBoundarySeeds       = 12
```

`pre-holy-seed-scheduler.js` orders replay-verified seeds using an optimistic astralBoss/shop affordability relaxation plus resource-diversity anchors.

This materially improved attempted seed quality. Example scheduled states include roughly:

```text
HP 1364 / ATK 104 / DEF 100 / Gold 2903 / shop index 2
HP 1076 / ATK 104 / DEF 100 / Gold 3043 / shop index 2
```

The scheduler is ordering-only. Unscheduled seeds remain part of the proof frontier conceptually, and a bounded scheduler miss never means infeasible.

## Retained: floor-neutral core5 preparation priority

Generic Tower priority strongly rewards the current floor number. During delayed-Holy preparation that starved legal routes that descended to an already visited shop/resource and later returned to F6.

The retained `preHolyContinuationPriority()` removes the floor term while `cores == 5` during `preBoss/core6` preparation and instead orders mainly by current ATK/DEF/HP/Gold.

A/B evidence:

Before floor-neutral ordering, a typical 4000-state continuation produced about:

```text
teleport = 16k–18k
shop     = near zero
```

After the change, shop actions appeared in the expanded region:

```text
shop = 42–717 generated actions/seed
```

and teleport generation fell substantially in the first A/B. The change did not by itself find a core6 bridge, but it fixed a real starvation effect and remains in the active adapter.

## Negative A/B: direct-return-to-F6 canonical travel

Experiment:

```text
lower floor
  -> replace repeated U traversal
  -> direct legal compass teleport back to F6
```

The engine semantics were checked first: teleporting to a visited floor and entering it through U both land on that floor's D anchor. The experiment therefore had a plausible equivalence argument for this stage.

Result under the same bounded continuation profile:

- `preBoss` still not found;
- teleport generation increased to about 13k/seed;
- total generated states did not improve enough to justify the extra representation rule.

Decision: **reverted**. The code is not in the active adapter. Git history retains the experiment.

## Negative A/B: relaxed blocker-count topology priority

Experiment: materialize F6 and rank states by a relaxed 0/1 minimum blocker count to astralBoss, with enemies/doors/gates as cost 1 and free floor as cost 0.

Result:

- `preBoss` still not found at 4000 expanded/seed;
- candidate generation generally increased to roughly 20k–21k on many scheduled seeds;
- runtime increased because more F6 event permutations were promoted.

Decision: **reverted**. A generic blocker count did not sufficiently distinguish a path that was topologically close but too costly in fixed combat damage.

## Negative A/B: relaxed damage-to-boss priority

Follow-up experiment replaced blocker count with an optimistic Dijkstra score whose enemy-edge costs used authoritative `calculateBattle()` fixed damage and whose target included astralBoss damage.

This was semantically closer to fixed-number Magic Tower and slightly reduced generated states on some seeds, but:

- `preBoss` remained false for all 12 scheduled seeds;
- profile runtime increased because a small Dijkstra was recomputed for many F6 queue states;
- the result still mixed two different questions: opening the corridor and preparing resources for the boss.

Decision: **not retained** in the active adapter. We stopped stacking queue heuristics and moved to proof decomposition instead.

## v0.4 result: preBoss/core6 split

v0.4 separated:

```text
boundary -> preBoss -> core6
```

where `preBoss` means astralBoss is a currently legal/winnable authoritative enemy action.

This proved that the short boss transition was not the current bottleneck: at 4000 expanded/seed, `preBoss` itself remained unknown.

## Current v0.5: exact corridor waypoint before resource readiness

v0.5 separates the remaining preparation problem:

```text
boundary
  -> corridorOpen
  -> preBoss
  -> core6
  -> policy continuation
```

`corridorOpen` is **not** a relaxed topology score. It is an exact property of one current dynamic engine state:

- materialize the authoritative state;
- use the same zero-event transit grammar as `tower-adapter.js` (`.`, `S`, `shop`);
- test whether the current free component reaches a tile adjacent to astralBoss;
- event tiles (items, runes, doors, gates, enemies) remain blockers until actually processed by legal engine actions.

### Local existence-hunt restriction

The first unrestricted corridor profile still spent its 1500-state budget considering cross-floor travel even though the waypoint itself is a local F6 structural goal.

Current `corridorOpen` therefore uses an explicit existence-hunt subgraph:

```text
remove teleport
remove U/D
keep every local F6 event action
```

Trust boundary:

```text
local corridor success -> valid authoritative existence witness
local corridor failure -> UNKNOWN
```

It is **never** allowed to prove global infeasibility, because the restricted subgraph intentionally omits routes that might first change resources elsewhere.

This restriction is encoded in the adapter as:

```text
proofRestriction = local_floor_existence_witness_only
```

and staged proof v0.5 globally reports:

```text
provesExistence = true
provesGlobalInfeasibility = false
```

because it continues only the first corridor witness found per boundary seed rather than all corridor-open frontier states.

## Why corridor-first is a reasonable witness hunt

The strongest scheduled F6/core5 seeds already carry multiple Moon/Star cards and substantial HP. Direct combat arithmetic shows that the final boss is not the only cost: the right-side route can also contain normal F6 enemies before astralBoss. A pure shop-affordability relaxation therefore overestimates readiness.

The corridor waypoint asks the simpler first question:

> Can one replay-verified boundary seed legally clear a boss-adjacent free corridor before Holy?

If yes, only then do we search cross-floor resource preparation from that replayed corridor state. This prevents early shop permutations from being interleaved with every possible F6 corridor-clearing order.

## Decision rules going forward

For the local-corridor A/B:

- `corridorOpen=true`: keep the waypoint and inspect `preBoss` resource preparation from the replayed corridor bridge;
- `corridorOpen=true, preBoss=true, core6=true`: continue all three delayed-Holy policy solvers immediately;
- `corridorOpen=false`: status remains unknown; inspect local F6 event/action telemetry before increasing budgets;
- do not revive direct-return, blocker-count, or damage-Dijkstra priority without new evidence that addresses their measured failure modes;
- do not weaken proposal v3 Holy coverage gate because of any bounded miss.

All production numeric writes remain disabled while delayed-Holy best-response coverage is incomplete.
