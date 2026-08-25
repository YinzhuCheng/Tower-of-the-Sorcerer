# V3 c7 bridge-frontier growth diagnostic

## Why this diagnostic exists

V3 now has two equal-budget terminal suffix waves over the current 8-goal c7 sample:

```text
p21 / completed-next-purchase wave: no exploit, F7/F8 expansion about 40.9%..44.9%
p20 / purchase-lag high-Gold wave:   no exploit, F7/F8 expansion about 47.2%..47.7%
```

Both remain bounded and non-exact. The next visible bottleneck is upstream: every per-prefix c7 frontier stops exactly at `maxGoals=8` with a perfectly balanced four p20 / four p21 sample.

Before allocating much more terminal suffix budget, we need to know what lies beyond the first eight active c7 goals.

## Diagnostic

`analyzeThresholdCoreBridgeFrontierGrowth()` keeps the same V3 threshold and fixed purchase policy, but spends its budget on deeper bridge discovery rather than terminal suffixes.

For a small number of representative threshold-relevant c6 prefixes it runs:

```text
c7 goal frontier maxGoals      32
maxExpanded per prefix       6000
maxGenerated per prefix     90000
```

Every emitted c7 certificate is authoritative-replayed from its exact c6 prefix state and must retain optimistic terminal upper bound >4459 before it enters the diversity report.

## Diversity dimensions

The report groups replay-verified c7 bridges by `shopPurchases` and records:

- purchase-progress strata (p19/p20/p21/p22/...);
- bridge count per stratum;
- authoritative structural-state count;
- card-vector count and explicit `sun/moon/star` vectors;
- Gold range;
- HP/maxHP range;
- optimistic terminal upper-bound range;
- representative certificate/resource samples.

Structural identity is hashed only for compact telemetry. It does not merge or prune states in this diagnostic.

## Interpretation

The diagnostic can reveal three qualitatively different cases.

### A. New purchase strata appear

Example:

```text
p22 / p21 / p20 / p19
```

Then the next terminal existence wave should target the newly exposed purchase-timing strata, not spend more budget on already-sampled p20/p21 states.

### B. Only p20/p21 remain, but cards/resources/structures diversify

Then purchase timing is not the remaining missing axis. The next bridge scheduler should explicitly sample novel card/structural families within p20/p21, or the Solver should tighten the terminal upper bound if the new states still share the same loose 4930 UB.

### C. Representative c7 frontiers exhaust exactly before 32

Then those prefix families have locally complete c7 boundary coverage and future proof work can shift toward additional c6 prefixes / terminal suffix closure. This still does not establish global exact no-exploit by itself.

## Correctness role

This analyzer is diagnostic-only:

```text
status = diagnostic-complete
exactNoExploit = false
```

It does not run terminal suffixes and cannot promote V3. Its purpose is to decide where the next expensive search budget has the highest information value.
