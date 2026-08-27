# V2 core7 suffix priority sweep — 2026-08-25

## Purpose

This note persists the equal-budget GitHub Actions evidence for the V2 c7 -> terminal suffix search. It is repository evidence, not a CI-only artifact.

All profiles used the same replay-verified c6 -> c7 bridge, V2 reference threshold `terminal HP > 4578`, fixed purchase policy, authoritative replay path, and suffix budget:

```text
maxExpanded  = 8000
maxGenerated = 100000
```

The only experimental variable is queue ordering. No action is deleted, no dominance relation is changed, no new proof prune is introduced, and canonical balance remains untouched.

## Sweep result

```text
profile          generated  structural  prunedBound  queuePeak  travel%  F7+F8%  exploit
baseline            34986       15585        2097       7585     69.42     7.40   false
threshold-b25       57694       22269           0      14277     70.03    34.56   false
threshold-b100      64781       27334           0      19335     66.51    38.01   false
threshold-b250      66698       22049           0      19360     68.47    40.23   false
threshold-b500      64189       18730        8689      10949     69.80    38.36   false
```

Every profile stopped at `maxExpanded`; therefore every result remains `coverage-incomplete`. `exploit=false` here means no exploit was found in the finite budget, not that no exploit exists.

## Selection

`threshold-b500` is the current Pareto choice for the V2 suffix experiment:

- F7/F8 expansion share rises from `7.40%` to `38.36%` (~5.18x baseline).
- Structural states rise from `15,585` to `18,730` (~20.2%), substantially less than b100.
- Queue peak is `10,949`, far below b25/b100/b250.
- Existing admissible-bound pruning recovers strongly to `8,689`; b25/b100/b250 all drove `prunedBound` to zero.
- No tested profile found an authoritative-replayable route above 4,578 HP.

The V2 analysis script therefore uses a 500-HP slack corridor as its default **experimental queue-order parameter**. This does not change exactness semantics, does not set `productionWriteAllowed=true`, and does not authorize writing V2 edits into `src/game/data.js`.

## Consequence for the next algorithm step

The sweep rejects two tempting but unsound development shortcuts:

1. blindly increase whole-game search budgets;
2. treat higher late-floor expansion share alone as solver progress.

The next useful work is staged coverage: run the selected b500 ordering over multiple replay-verified c7 bridge seeds and/or tighten admissible late-game upper bounds so more of the `5049 -> 4578` optimistic slack can be eliminated before expansion.

Separately, the six early-purchase V2 catastrophic cases still need failure-core instrumentation. That work should report the first event where all recovery branches die and the local resource deficit, rather than only `all_branches_dead`, before any numeric V3 repair is proposed.
