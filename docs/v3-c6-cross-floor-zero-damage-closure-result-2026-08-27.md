# V3 Compass cross-floor zero-damage closure A/B result — 2026-08-27

Final A/B head: `ffd1dfb4135a94c0b146000b6197312a9940534f`.

The dedicated round-trip/component tests and ordinary repository CI passed. The cross-floor closure further reduces c6 search work beyond the local-only Lucky zero-damage closure, but the c6 goal frontier remains capped and non-exact.

## 512-goal comparison

```text
metric                 baseline    local closure   cross-floor closure
expanded states          14,445        3,379              2,451
generated states        118,921       17,748             13,666
search structural        12,945        8,794              7,380
active c6 goals             512          512                512
goal structural             512          512                512
coverage exact              false        false              false
stop                         maxGoals     maxGoals           maxGoals
```

Relative to local-only closure, Compass cross-floor normalization reduces:

```text
expanded states    ~27.5%
generated states   ~23.0%
search structural  ~16.1%
```

It still does not reduce the goal-frontier cardinality itself.

## Full ladder

```text
cap    expanded   generated   search structural   active goals   exact
 64         311       1,810              1,297             64    false
128         534       3,214              2,145            128    false
256       1,152       6,656              3,991            256    false
512       2,451      13,666              7,380            512    false
```

## What normalized

At cap512:

```text
local Lucky zero-damage kills / goal     15 for all 512 goals
cross-floor automatic teleport steps     14 for 508 goals
                                         12 for   4 goals
shopPurchases                             17 for 508 goals
                                          3 for   4 goals
```

The cross-floor closure therefore reaches and consumes additional monotone resources that current-floor normalization leaves behind. The round-trip component invariant prevents this from abandoning the current reachable component.

## Decision

This closure is valuable as a **counterexample/search canonicalizer**. It is not a c6 quotient: `goalStructuralStates == maxGoals` still holds through 512.

Do not spend more c6 goal-cap budget on this branch. The next experiment should use the cross-floor closure in the staged c6→c7→terminal counterexample hunt. This directly tests whether removing the remaining cross-floor harvest ordering allows the high-resource p21/p22 states exposed by local closure to reach terminal HP >4459 within the same bounded suffix budget.

Any terminal exploit must still be converted to a combined event-order step witness and replayed against the ordinary V3 fixed-purchase adapter / authoritative engine before it is accepted. No result here changes `productionWriteAllowed=false`.
