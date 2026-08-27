# V3 c7 bridge-frontier growth result — 2026-08-26

This document records `event-order-core-bridge-frontier-growth-v0.1` at commit `c5ef2ba40ae78fe7fa1187ed7256b885d6189fd2`.

The diagnostic completed successfully and confirms that increasing the c7 goal cap from 8 to 32 does **not** reveal new purchase-progress strata. The newly exposed space is structural/card/resource diversity inside the existing p20/p21 strata.

## Representative prefixes

Three threshold-relevant c6 prefixes were expanded to 32 active c7 goals each. All three c7 frontiers still stopped at `maxGoals=32` after only about 310 expansions / 2.1k generated states, so the frontier is still substantially larger than this diagnostic sample.

Global purchase strata:

```text
[21, 20]
new stratum beyond p20/p21: false
```

### Prefix `195cea28580e1d84`

```text
active c7 goals       32
replayable relevant   32
unique structures     32
unique card vectors   10
Gold range            1101..1646
```

p21:

```text
count                 28
unique structures     28
unique card vectors   10
Gold                  1101..1341
HP                    3622..3912
maxHP                 23740
upper bound           4729..4930
card vectors:
4/4/1, 4/4/2, 4/4/3, 4/5/2, 4/5/3,
5/5/2, 5/5/3, 5/5/4, 5/6/3, 5/6/4
```

p20:

```text
count                  4
unique structures      4
unique card vectors    3
Gold                  1382..1646
HP                    3762
maxHP                 23590
upper bound           4930
card vectors          4/4/3, 5/5/3, 5/5/4
```

### Prefix `fafd32a2e95db4d7`

Same qualitative shape:

```text
p21 28 states, 10 card vectors, Gold1047..1287, HP3622..3912, UB4729..4930
p20  4 states,  3 card vectors, Gold1328..1592, HP3762,       UB4930
```

### Prefix `1568cc8d8ef8de1f`

Again the same shape:

```text
p21 28 states, 10 card vectors, Gold1041..1281, HP3622..3912, UB4729..4930
p20  4 states,  3 card vectors, Gold1322..1586, HP3762,       UB4930
```

## Consequence

The earlier 8-goal frontier was not hiding p19/p22 purchase timing. Increasing the cap exposes a broad p21 structural/card frontier instead:

```text
8-goal sample:  4 x p21 + 4 x p20
32-goal sample: 28 x p21 + 4 x p20
```

Therefore another purchase-stratum wave would be low-information.

Two higher-value next axes remain:

1. **bound quality** — explain why structurally different p21 bridges retain UB up to4930 and whether the remaining 471 HP slack is dominated by a safely-tightenable relaxation;
2. **structural/card portfolio** — if the bound is already close to irreducible, sample p21 bridges across distinct card/resource vectors rather than only the highest-UB/high-HP representative.

The next repository diagnostic should inspect the fixed-purchase upper-bound decomposition on representative max-UB, min-UB and purchase-lag bridges before spending another terminal suffix wave.
