# V3 c6 tight-bound screen result — 2026-08-26

The c6 prefix screen was intentionally run before integrating the c7 tight-bound proof at another proof layer.

Result:

```text
c6 active threshold goals sampled  128
frontier stop                      maxGoals
frontier exact                     false
tight-bound closed prefixes        0
```

Thus the current discrete enemy-harvest + single pure-HP access bound has **no immediate c6 prefix-closing value** on the sampled V3 boundary. Earlier c6 states retain too much legitimate optimistic future resource slack for this late-game topology/harvest tightening to push their terminal upper bound down to the 4459 threshold.

Decision: do not place this dynamic-programming bound at c6 or in the whole-game hot path. Keep it c7-only, where the remaining resource envelope is narrow enough to close sampled bridge obligations. The next proof-efficiency target is c7 goal collection itself: already-closed c7 goals should not consume the same finite residual-goal quota as bridges that still require suffix analysis.