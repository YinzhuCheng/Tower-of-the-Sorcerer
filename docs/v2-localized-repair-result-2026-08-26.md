# V2 localized repair result — 2026-08-26

This file records the first repository-run result of `v2-failure-core-localized-repair-search-v0.1` at commit `11f5ebc479b8d49d1168f4ff35d05d32d7d7f90f`.

The result is a **negative local-gate result with useful failure-frontier evidence**. It is not a V3 candidate and it does not authorize any production balance write.

## Baseline

```text
V2 reference HP                4578
minimum normalized HP margin   0.14945652173913043
single-purchase mutations      58
catastrophic                   6 / 58
exact unrecoverable            6
recovery unknown               0
```

## Failure-core rescue frontiers

### `f5:enemy:flameCaster#3`

All three `ATK -> HP` early mistakes belong to this cluster.

The exact full-continuation recovery search found:

```text
magicPower: no rescue boundary within configured 50% softening
hp:         no rescue boundary within configured 50% softening
def:
  rescue >= 1 mutation: 70 -> 44
```

This is materially different from a one-battle arithmetic estimate. A value such as `def=63` can make the immediate failing fight survivable for one state, but the complete fixed-event-order continuation still dies later. The tuner therefore correctly requires `def=44` before at least one of these forced mistakes is globally recoverable within the modeled continuation.

### `f5:enemy:dragonBoss#1`

All three `ATK -> DEF` early mistakes belong to this cluster.

Exact rescue boundaries:

```text
atk:
  rescue >= 1: 114 -> 111
  rescue >= 2: 114 -> 108
  rescue >= 3: 114 -> 107

def:
  rescue >= 1: 52 -> 43
  rescue >= 2: 52 -> 36
  rescue >= 3: 52 -> 29

hp:
  rescue >= 1: 1280 -> 1080
  rescue >= 2: 1280 -> 945
  rescue >= 3: 1280 -> 855
```

The lowest relative edit for this cluster is the ATK reduction, so the combination search prefers it over HP/DEF reductions.

## Best localized combinations after purchase 1-opt

The lowest-cost candidate was:

```text
flameCaster.def: 70 -> 44
dragonBoss.atk:  114 -> 111
```

After authoritative replay, purchase 1-opt and all 58 counterfactual/recovery checks:

```text
terminal HP                  7627
minimum normalized HP margin 0.667199148029819
catastrophic                 3 / 58
exact unrecoverable          3
recovery unknown             0
purchase local optimal       true
local gate                   FAIL
semantic fingerprint         f7471edbeb30498d
```

Other refined candidates were similarly too soft:

```text
dragonBoss.atk 108 + flameCaster.def 44 -> HP 7843, margin 66.72%, catastrophic 3

dragonBoss.hp 1080 + flameCaster.def 44 -> HP 7531, margin 66.72%, catastrophic 3

dragonBoss.def 43 + flameCaster.def 44 -> HP 7551, margin 66.72%, catastrophic 3
```

The catastrophic objective improves, but the pressure target `[0.08, 0.25]` is destroyed. Therefore no first-pass localized repair is accepted as a V3 seed.

## Design conclusion

The evidence rejects the strategy:

```text
soften the F5 failure points only
```

The next tuner stage must solve a coupled problem:

```text
forgiveness repair at/before the failure cores
+
pressure compensation strictly after those failure cores
```

The compensation search must preserve the rescued early mistakes while restoring the locally optimized reference margin into the target band. Candidate compensation levers should therefore be restricted to later semantic events (preferably F6-F8 / terminal encounters or rewards) so they do not recreate the same F5 unrecoverability.

A candidate that clears this coupled local gate must still undergo the normal stronger checks: deterministic semantic reference rebuild, whole-game fixed-purchase event-order threshold search, staged c6->c7->terminal suffix search, and independent solvability evidence. `productionWriteAllowed=false` remains mandatory.