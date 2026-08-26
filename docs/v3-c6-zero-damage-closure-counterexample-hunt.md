# V3 zero-damage-closure counterexample hunt

The closure bridge screen changed the c7 proof frontier qualitatively:

```text
baseline tight-filter screen:
  active c7 bridges   192
  bound closed         72
  residual            120
  purchase strata     p20 / p21
  old UB max          4930
  tight UB max        4735

Lucky zero-damage closure screen:
  active c7 bridges   185
  bound closed          0
  residual            185
  purchase strata     p21 / p22
  old UB max          6810
  tight UB max        6465
```

The closure is therefore more than a runtime optimization. By forcing exact-zero-damage Lucky enemies as soon as they become reachable, their Gold can fund the fixed purchase sequence earlier. In particular, an HP purchase completed before Holy is strictly more valuable than the same purchase completed after Holy. Those dominant orderings were legal in the original fixed-policy player model but were difficult for the branching search to surface.

This makes counterexample search higher priority than additional proof compression.

## Profile

The hunt reconstructs the same closure c6/c7 staged frontiers:

```text
c6 goal cap                  64
scheduled c6 families         6
c7 goal cap / family         32
residual suffix portfolio     6, prefix-round-robin
suffix expanded / bridge   3000
suffix generated / bridge 50000
```

The terminal suffix uses the same closure search adapter plus the existing late-game threshold priority. Every suffix certificate is replayed under that search adapter. A threshold crossing is accepted only after prefix + transition + suffix are converted to an event-order step witness and replayed again with the ordinary V3 fixed-purchase adapter, which delegates to authoritative `engine.js`.

## Interpretation

- A replayed terminal HP >4459 is a real V3 event-order counterexample and must be persisted and fed back to the tuner before further proof work.
- Failure to find an exploit in six bounded suffixes is only `coverage-incomplete`.
- This diagnostic never sets `exactNoExploit=true` and never changes `productionWriteAllowed=false`.
