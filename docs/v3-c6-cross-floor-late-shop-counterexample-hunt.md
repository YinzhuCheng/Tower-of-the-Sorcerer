# V3 cross-floor late-shop counterexample hunt

The full c6 search with affordable-shop closure is intentionally not the primary A/B experiment. Applying the shop closure at every c6/c7 search node can increase runtime because earlier fixed purchases improve combat stats and make more actions feasible.

This experiment keeps the already profiled Compass cross-floor zero-damage c6 -> c7 search unchanged and applies affordable fixed-policy purchase normalization only after the residual c7 bridge portfolio has been selected.

## Why this is a useful counterexample test

The prior cross-floor hunt produced six scheduled c7 bridges with the same combat/economy resources:

```text
HP             6328
ATK             206
DEF             168
Gold           1359
shopPurchases     21
```

Their card inventories differ, so they remain distinct bridges. At purchase index 21 the V3 policy is already in its late HP run. The next costs are 570 and 595, so the known bridge Gold can fund two immediate fixed-policy purchases before any further combat.

The late-shop hunt therefore answers a narrow question efficiently: does removing only the purchase-timing permutations from these same legal c7 bridge families expose a terminal HP > 4459 route?

## Trust boundary

1. c6 and c6 -> c7 use the existing fixed-purchase + Compass cross-floor zero-damage adapter.
2. The same round-robin residual c7 bridge portfolio is selected before shop normalization.
3. Each selected bridge is normalized once with the affordable-shop wrapper.
4. Every normalization step is replayed from the raw bridge on the ordinary fixed-purchase adapter. Resource and structural states must match before suffix search is allowed.
5. Terminal suffix search may continue using the shop closure as new Gold arrives.
6. Any threshold crossing is accepted only if the complete prefix + transition + late-shop normalization + suffix skeleton replays from the canonical start on the ordinary fixed-purchase adapter / authoritative engine.

The profile remains a dry-run counterexample search and never writes production balance data.
