# V3 c6 Lucky zero-damage closure A/B result — 2026-08-27

Final A/B head: `d1cab35ff30e8ba820ee94c9205eba89ae196e66`.

The closure unit tests and ordinary `npm run check` both passed. The c6 boundary remains non-exact at every tested goal cap, but the search-space reduction is large enough to promote the closure into a staged V3 search-model experiment.

## Baseline vs closure at 512 goals

```text
metric                 baseline     closure      change
expanded states          14,445       3,379       -76.6%
generated states        118,921      17,748       -85.1%
search structural        12,945       8,794       -32.1%
active c6 goals             512         512        same
goal structural             512         512        same
coverage exact              false       false       same
stop                         maxGoals    maxGoals    same
```

The reduction therefore removes a large amount of ordering work but does **not** close the c6 goal frontier itself.

## Full closure ladder

```text
cap    expanded   generated   search structural   active goals   exact
 64         483       2,544              1,747             64    false
128         844       4,572              2,864            128    false
256       1,737       9,119              5,087            256    false
512       3,379      17,748              8,794            512    false
```

Every round still stops at `maxGoals`, so budget exhaustion is not interpreted as no exploit.

## What the closure actually normalized

At 512 goals:

```text
total automatic Lucky zero-damage enemy steps = 7,132
kills per replay-verified c6 goal:
   5 ->   4 goals
  14 -> 508 goals
```

The corresponding purchase-count distribution changed materially because zero-damage Gold arrives earlier and is then consumed later when the route reaches its fixed-policy shop opportunity:

```text
shopPurchases 3   ->   4 goals
shopPurchases 16  ->   2 goals
shopPurchases 17  -> 506 goals
```

No shop action is itself forced by the closure.

## Interpretation

The factorization audit showed that all 512 sampled c6 goals retained 11–16 Lucky-safe zero-damage ordinary enemies somewhere in the remaining tower. The A/B result confirms that recursively forcing the currently reachable subset collapses a substantial amount of early/late-kill permutation work.

However:

```text
goalStructuralStates == maxGoals
```

still holds through 512. Therefore the closure is a useful **search normalization**, not a complete quotient of c6 continuation states.

## Next experiment

Enable this closure only inside the existing fixed-purchase staged V3 event-order search and rerun the same c6→c7 tight-filtered multi-bridge profile:

```text
c6 goal cap                 64
scheduled c6 prefix families 6
c7 goal cap / prefix        32
sound c7 tight-bound filter enabled
residual suffixes             6
suffix budget              3,000 each
```

Reference identity remains resolved with the baseline fixed-purchase adapter at terminal HP 4459. The closure is applied only to the counterexample/proof search space. Any exploit witness remains replayed against the ordinary authoritative fixed-purchase adapter.

Promotion still requires complete upstream coverage plus every active c7 bridge being closed by a sound bound or exact suffix. The A/B result alone does not change `productionWriteAllowed=false`.
