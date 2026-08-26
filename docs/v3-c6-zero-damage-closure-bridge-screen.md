# V3 c6→c7 closure bridge screen

The current-floor Lucky zero-damage closure reduces the 512-cap c6 search by 76.6% expanded states and 85.1% generated states, but the c6 goal frontier still hits its configured goal cap. Before integrating the closure into the full staged event-order proof, this diagnostic isolates its effect on the next proof layer.

## Search model

Reference identity and the 4459 terminal-HP threshold are resolved with the ordinary V3 fixed-purchase adapter. The counterexample/proof search then wraps that same adapter with `createFixedPurchaseZeroDamageClosureAdapter()`.

The screen runs:

```text
c6 goal cap                   64
scheduled c6 prefix families   6
c7 goal cap per prefix         32
```

All c6 and c7 certificates are authoritative-replayed with the closure search adapter. Each active cross-prefix c7 Pareto bridge is then evaluated by the existing sound fixed-purchase bridge tight bound using the ordinary fixed adapter.

No terminal suffix search is run in this diagnostic. Its purpose is to measure whether the search normalization reduces:

- c6 prefix search work;
- c7 frontier work per prefix;
- active cross-prefix c7 bridges;
- residual bridges after the sound discrete-harvest / pure-HP access bound.

## Trust boundary

The closure does not modify the V3 reference route, canonical game data, objective upper bound, or tight-bound proof. It changes only the representative order of provably monotone Lucky-owned exact-zero-damage ordinary enemy actions in the fixed-purchase search model.

A non-exact c6 or c7 frontier remains `coverage-incomplete`. A bridge closed by the tight bound is individually proved below threshold; a residual bridge remains a proof obligation. This screen can therefore justify integrating the closure into the existing staged analyzer, but cannot itself set `exactNoExploit=true`.
