# Delayed-Holy STATIC_CUT proof

Status: 2026-08-25, `solver-phase1-pareto`.

This note records the proof that resolves the delayed-Holy coverage gap. The proof is repository-resident and does not depend on VM scratch state, CI timeouts, combat heuristics, or numeric balance values.

## Claim

Under the current canonical map and engine rules, the sixth-floor boss `astralBoss` cannot be reached before collecting `item:holy`.

Therefore the following player policies are exactly infeasible:

- `after-core-6`
- `after-core-7`
- `before-final`

The `immediate` policy remains feasible and is optimized normally.

This means Holy-policy coverage is now interpreted as:

```text
1 optimized policy
+ 3 proven-infeasible policies
= 4 / 4 covered policies
```

A proven-infeasible policy counts as covered, but it does not receive a fake terminal-HP value and is never treated as an optimized route.

## Why the old search result was only `unknown`

Earlier constrained Solver runs attempted to obtain core 6 while suppressing Holy. They repeatedly exhausted bounded search budgets. That was correctly reported as `unknown`, not infeasible.

Later decomposition proved that F6/core5/no-Holy itself is reachable and extremely wide: thousands of replay-verified boundary states exist. Seed scheduling and continuation-priority experiments improved the search substantially but still did not reach `astralBoss`.

The key observation is structural rather than numeric: the boss corridor has two possible sides, and both are blocked before the boss is defeated:

1. the left approach passes through `item:holy`;
2. the right approach is the floor `U` stair, which `engine.js` blocks until the current floor boss is defeated.

Thus the delayed-Holy search was trying to solve a topologically impossible requirement.

## Proof construction

Implemented in:

- `src/analyzer/pre-holy-static-cut.js`
- `test/pre-holy-static-cut.test.js`

The proof computes an **optimistic reachability relaxation** on F6.

The graph deliberately makes the real game easier:

- every ordinary enemy is free to cross;
- every door is free to cross;
- every switch/gate/rune puzzle is free to cross;
- every ordinary item is free to cross;
- HP / ATK / DEF / Gold / cards / shop affordability are ignored.

Only three blocker classes are retained:

```text
immutable walls
policy-forbidden item:holy
boss-locked U stair
```

The target is any tile adjacent to `enemy:astralBoss`.

If no path exists even in this optimistic graph, no legal real-game path can exist either.

The canonical F6 result is:

```text
allowHoly = false
unlockUpperStair = false
boss adjacency reachable = false
```

Two minimality witnesses are also generated:

```text
allowHoly = true  -> boss adjacency becomes reachable
unlockUpperStair = true -> boss adjacency becomes reachable
```

These witnesses explain the cut rather than merely reporting a disconnected graph.

## Entry-anchor argument

All legal pre-boss entries to F6 reduce to the `D` anchor:

- normal upward traversal from F5 enters F6 at `D`;
- Compass teleport uses `teleportToFloor()`, which also places the player at the target floor's `D` token;
- the F6 `U` stair cannot provide a pre-boss entry from F7 because the engine's boss-stair lock prevents leaving F6 upward until `astralBoss` is defeated.

Therefore repeated travel cannot bypass the cut by changing the F6 entry component.

## Why this proof survives numeric tuning

The STATIC_CUT proof is intentionally independent of:

- enemy HP / ATK / DEF / magicPower / gold;
- item stat values;
- shop effects and prices;
- player resource totals;
- combat order.

Numeric balance overlays cannot invalidate the proof unless they also change topology or the relevant engine rule semantics.

For that reason `holy-policy-best-response.js` may safely use the STATIC_CUT certificate during numeric candidate evaluation.

## Best-response semantics after the proof

The Holy-axis player model remains:

```text
max over modeled Holy policies
    purchase local-1opt under feasible policy
```

but response statuses now have three distinct meanings:

- `optimized`: a feasible policy with a locally optimized purchase plan;
- `infeasible-proven`: a sound policy-level certificate proves the policy impossible;
- `uncovered`: no sufficient evidence either way.

Promotion requires every modeled policy to be either `optimized` or `infeasible-proven`. `uncovered` still blocks promotion.

## Trust boundary

The STATIC_CUT certificate is proof-level only because the graph is an over-approximation of legal movement. A heuristic or restricted search that removes legal edges could not support the same inference.

General rule:

```text
failure in a relaxed superset graph -> safe infeasibility proof
failure in a reduced/subsampled graph -> only unknown
```

This distinction is required for future topology mutation work. If F6 topology, Holy placement, boss placement, stair placement, or boss-stair semantics change, the certificate must be recomputed against the mutated content before it can be reused.
