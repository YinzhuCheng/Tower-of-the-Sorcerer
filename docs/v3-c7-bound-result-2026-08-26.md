# V3 c7 fixed-purchase bound decomposition result — 2026-08-26

This document records the first `v3-c7-fixed-purchase-bound-diagnostics-v0.1` run at commit `36d3b67ac3517783639f312abae8c93f2057834d`.

The diagnostic independently reconstructed the current proof-level fixed-purchase upper bound and matched `adapter.objectiveUpperBound()` exactly on every representative bridge. It did **not** modify the proof bound.

## Max-upper p21 bridge

```text
current HP / Gold / p      3912 / 1101 / 21
cards                      4 / 4 / 1
proof upper bound          4930
reference threshold        4459
slack                       471
```

Relaxation:

```text
remaining flat HP          3400
remaining flat ATK           18
remaining flat DEF           22
remaining enemy Gold        5470
remaining enemies             22
remaining items               12
optimistic additional buys     9
optimistic base HP           7312
optimistic base ATK           224
optimistic base DEF           190
```

Best fixed-purchase scenario:

```text
7 future buys, all HP
purchase cost               4515
free Gold before enemies    1101
required enemy Gold         3414
fractional harvest damage      0
HP before final             8362
final-boss damage LB        3432
upper bound                 4930
```

Thus the 471 HP slack is not a stale-overlay or arithmetic bug. It is primarily the combination of all four remaining F8 `hpLarge` rewards credited for free, enough optimistic Gold to fund seven fixed-policy HP purchases, zero fractional harvest damage for the required enemy Gold under maximum future combat stats, and the final-boss damage lower bound.

## Min-upper p21 bridge

```text
HP / Gold / p             3622 / 1281 / 21
cards                     5 / 5 / 4
proof upper               4729
slack                      270
```

Its best scenario uses eight HP buys. The fractional Gold-harvest lower bound is 61, and final-boss damage remains 3432.

## Card-rich p21 bridge

```text
HP / Gold / p             3912 / 1101 / 21
cards                     5 / 6 / 4
proof upper               4930
```

Its upper-bound decomposition is identical to the max-upper p21 bridge. Additional retained cards therefore do not currently tighten the generic fixed-purchase upper bound.

## High-Gold p20 bridge

```text
HP / Gold / p             3762 / 1646 / 20
cards                     5 / 5 / 4
proof upper               4930
slack                      471
```

Best scenario uses eight future buys, again with zero fractional harvest damage and the same 3432 final-boss damage lower bound.

## Consequence

The bound slack is not dominated by an obviously erroneous Gold or final-boss formula. The next sound tightening candidate is topology-aware access to the 3400 flat F8 HP credit: the existing bound assumes every remaining HP item can be credited without paying any access combat damage.

Any access tightening must preserve the option to skip a costly pickup and must not double-count combat already represented by the fractional Gold-harvest lower bound. A safe single-pure-HP constraint is therefore evaluated next as a diagnostic preview before changing `tower-bounds.js`.
