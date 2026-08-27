# V3 global validation result — 2026-08-26

This document records the first successful global validation run of the coupled `distributed-pressure-v3` reference after fixing its deterministic two-stage reconstruction at commit `771d72e2813c91a11a9d1a2a311b348140e4269d`.

The candidate remains **BLOCKED** and `productionWriteAllowed=false`. The important change from V2 is that every current hard gate except global event-order closure now passes.

## Deterministic V3 reference rebuild

The correct repository-owned reconstruction is:

```text
V2 semantic witness
  -> F5 forgiveness overlay
  -> purchase 1-opt
  -> full V3 overlay including F6 compensation
  -> purchase 1-opt
```

Directly applying the full V3 overlay to the original V2 purchase plan is invalid because the deliberately harder F6 hazard can make that old purchase seed non-replayable before purchase adaptation. The two-stage continuation matches the discovery procedure and reconstructs the reference without relying on CI artifacts.

Rebuilt evidence:

```text
terminal HP                    4459
minimum normalized HP margin   0.24545454545454545
witness hash                   5f2eaa7dcee33508
semantic fingerprint           f7471edbeb30498d
purchase local optimal         true
```

All reference checks pass:

```text
sourceEditsMatch        true
terminalHpMatch         true
marginMatch             true
referenceIdentityMatch  true
purchasePlanMatch       true
purchaseCountMatch      true
localOptimal            true
witnessStepsMatch       true
```

## Independent existence is now exactly closed

Unlike V2, the independent canonical existence oracle closes within the current 10k budget:

```text
solvable        true
exact           true
authoritative replay true
expanded        2685
generated       20656
stop            goalFound
```

This removes the old `exactExistence` blocker for V3.

## Purchase robustness

All 58 single-purchase mutations were rechecked around the V3 reference:

```text
no-recourse recovery rate      0.9310344827586207
catastrophic rate              0.06896551724137931  = 4/58
improving single mutation      0
```

Recovery-aware exact DP:

```text
recovered mutations            54
exact unrecoverable             4
unknown                         0
exact unrecoverable rate        0.06896551724137931
```

Thus both the original <=10% catastrophic gate and the stronger recovery-aware <=10% interpretation pass without loosening either threshold.

## Whole-game event-order threshold

The remaining blocker is global player-response coverage:

```text
reference threshold   4459 HP
expanded             50000
generated           245856
exploitFound          false
exactNoExploit        false
status                coverage-incomplete
```

This is not a safety proof. `budget exhausted != infeasible` remains binding.

Current V3 validation status:

```text
status   blocked
failures eventOrderBestResponse
```

## c6 -> c7 -> terminal staged chain

The replay-verified staged analysis also remains open:

```text
reference             4459
c6->c7 transition     threshold-relevant-transition-found
c7 bridge upper bound 4930
```

Using the repository-selected late suffix ordering with a 500 HP slack bucket:

```text
expanded              8000
generated            64189
prunedBound           8689
travel ratio          0.6980012151614763
F7/F8 expansion ratio 0.383625
exploitFound          false
exact                 false
stop                   maxExpanded
```

Again, this is coverage-incomplete rather than proof of no exploit.

## Next proof work

The next step should not simply multiply the same suffix budget. The current transition analyzer stops after the first replay-verified c7 bridge that remains threshold-relevant. Other c7 bridge states can have different HP/Gold/purchase/resource distributions and may expose a terminal exploit much sooner.

Next implementation target:

```text
complete/large c6 threshold-relevant boundary
  -> collect several replay-verified c7 bridge states
  -> deduplicate / Pareto-rank bridges
  -> run equal-budget b500 terminal suffixes per bridge
  -> persist any replayable >4459 exploit immediately
```

Global exact no-exploit remains impossible to claim until the boundary/bridge/suffix obligations are exhaustively closed or replaced by a sound over-approximation proof.