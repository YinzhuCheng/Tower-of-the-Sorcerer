# V3 c7 tight-filtered multi-bridge proof

## Scope

V3 currently passes the numeric, independent-existence, purchase-robustness and Holy-policy gates. Its remaining promotion blocker is event-order coverage.

Earlier multi-bridge profiles established that replay-verified c7 bridge diversity is real. Separate bound diagnostics then identified a sound bridge-level tightening based on:

1. indivisible 0/1 enemy Gold harvest instead of fractional enemy kills;
2. one relaxed-topology pure-HP pickup access constraint with overlap-safe accounting.

This analyzer promotes that tightening only at the **replay-verified c7 bridge boundary**. It does not place the dynamic program in the whole-game Solver hot path and does not modify canonical gameplay or balance.

## Bridge proof

For every active Pareto c7 bridge, `proveFixedPurchaseBridgeBelowThreshold()` performs:

```text
existing fixed-purchase proof UB
  -> independently reconstruct and require exact equality
  -> discrete enemy-harvest damage lower bound
  -> strongest non-overlapping single pure-HP access constraint
  -> tight admissible UB
```

A bridge is proof-closed iff:

```text
tightUB <= V3 reference threshold 4459
```

Because the threshold question is strictly `terminal HP > 4459`, equality is sufficient to eliminate the bridge.

A bridge with `tightUB >4459` is not classified as exploitable or safe. It remains a residual proof obligation and is eligible for the existing b500 terminal suffix search.

## Multi-bridge partition

After authoritative c6 prefix and c7 bridge replay plus same-structural-state Pareto reduction:

```text
active c7 bridges
  -> bound-closed bridges
  -> residual bridges
```

Only residual bridges consume suffix budgets. Residual scheduling keeps the prefix-family round-robin policy so finite-budget exploit hunting does not collapse onto one c6 family.

## Exactness rule

Global exact no-exploit is still deliberately hard to earn.

The analyzer may return `exactNoExploit=true` only when all of the following hold:

1. the c6 threshold boundary exhausts exactly;
2. every verified threshold-relevant c6 prefix is scheduled;
3. every scheduled prefix's c7 goal frontier exhausts exactly;
4. every active c7 bridge is either:
   - closed by the sound tight bridge bound, or
   - suffix-searched to exact no-exploit;
5. no replayable threshold exploit is found.

A bounded c6 frontier, capped c7 frontier, unscheduled residual bridge or bounded residual suffix keeps status `coverage-incomplete`.

Finding one authoritative-replayable exploit immediately defeats the candidate regardless of incomplete no-exploit obligations.

## Initial profile

The first profile uses:

```text
c6 boundary goal cap           64
scheduled c6 prefixes           6
c7 goal cap per prefix          32
bridge tight proof              all active sampled Pareto bridges
residual suffix slots            6
suffix expanded per residual  3000
suffix generated per residual 50000
late priority bucket           500 HP
```

The report records closure counts overall and by purchase stratum, old/tight UB ranges, every bound-closed bridge proof, residual bridge slack, and per-residual suffix telemetry.

This profile is expected to remain globally `coverage-incomplete` because the c6 and c7 frontiers are capped. Its purpose is to measure how much of the sampled c7 proof obligation can be eliminated soundly before expensive terminal search.

## Promotion boundary

`productionWriteAllowed=false` remains mandatory. Closing a material fraction of sampled c7 bridges is proof-infrastructure progress, not permission to write V3 into `src/game/data.js`.
