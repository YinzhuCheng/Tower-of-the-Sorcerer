# V3 c6 threshold-boundary growth diagnostic

The current c6 boundary is a remaining global proof blocker. A 128-goal screen is still capped and the late-game tight bound closes zero sampled c6 prefixes, so adding the c7 discrete/access DP at c6 would only add cost.

This diagnostic therefore removes every downstream variable and profiles the c6 goal frontier alone at:

```text
64 -> 128 -> 256 -> 512 active goals
```

Each round is a fresh deterministic `collectGoalFrontier()` run under the same V3 fixed purchase policy and `terminal HP >4459` threshold adapter. Every emitted goal is authoritative-replayed; the report records active/structural goal counts, purchase histogram, search expansion/generation and whether the boundary actually exhausts.

The ladder stops immediately if exact coverage is reached. If every round simply hits its goal cap with roughly proportional structural growth, the next algorithm should be state factorization/canonicalization rather than an even larger blind cap. If growth saturates and one round becomes exact at a moderate cap, that cap can be promoted into the staged proof workflow with evidence.