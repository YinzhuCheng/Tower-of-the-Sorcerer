# Distributed pressure V2 candidate

Status: 2026-08-25, `solver-phase1-pareto`.

This note records the first numeric candidate retuned against the stronger event-order + purchase player response. It is a dry-run review candidate; canonical `src/game/data.js` is unchanged.

## Why V2 exists

V1 used:

```text
whaleSinger.magicPower = 56
shop HP reward         = 320
flameCaster.def         = 63
```

and appeared balanced under greedy event order + purchase 1-opt (7,083 HP, 11.62% minimum margin). Event-order search then found a 7,187 route, and purchase 1-opt on that event skeleton reached **7,687 HP with a 42.63% minimum margin**. Therefore V1 is too forgiving under the stronger player model.

## Witness-aware ray result

The same three semantic levers were retuned against the replayable 241-step event-order witness. At every ray sample the player re-ran purchase 1-opt on that skeleton.

| ray step | terminal HP | minimum margin | status |
| ---: | ---: | ---: | --- |
| 0.6453125 | 7,687 | 42.63% | too forgiving |
| 0.70 | 6,655 | 42.28% | too forgiving |
| 0.75 | 5,667 | 29.70% | too forgiving |
| 0.80 | 5,126 | 25.92% | too forgiving |
| 0.825 | 4,784 | 20.15% | target |
| **0.8375** | **4,578** | **14.95%** | **target** |
| 0.85 | 4,442 | 13.42% | target |
| 0.90 | — | — | witness route fails |

No best-response monotonicity violation was observed. The current preferred scale is **0.8375**.

## V2 edits

```text
whaleSinger.magicPower: 34 -> 62
shop HP reward:         900 -> 150
flameCaster.def:         38 -> 70
```

HP and max-HP shop effects remain one semantically coupled lever.

The V2 reference witness has:

```text
terminal HP          = 4,578
minimum margin       = 14.945652%
purchase count       = 29
step count           = 241
purchase 1-opt       = true
witness hash         = 8623f0ba330d21b3
```

The purchase policy is stored in `src/tuner/review-candidates.js`. The 241-step topology/action witness is not hard-coded there; repository algorithms regenerate it.

## Continuation is part of reproducibility

A failed first V2 validation exposed an important property of the player model: **the 0.8375 witness cannot be reconstructed by jumping the 7,687 V1 witness directly from ray step 0.6453125 to 0.8375.** Under the harder numbers, that old action skeleton can become illegal before purchase 1-opt has a chance to recover it.

The successful discovery used continuation/warm starts:

```text
0.6453125
 -> 0.70
 -> 0.75
 -> 0.80
 -> 0.825
 -> 0.8375
```

Each sampled game re-optimizes purchases on the nearest previously legal event-order witness. This continuation is therefore **algorithmic state**, not merely a performance optimization.

V2 stores both:

```text
sourceContinuationStartStep = 0.6453125
sourceRayStep               = 0.8375
```

`review-candidate-v2-rebuild.js` must rerun the complete `searchEventOrderWitnessPressureRay()` continuation and require that the rebuilt best sample still lands at the stored source step. If the best step changes, reconstruction fails as candidate drift rather than silently accepting a different player response.

This rule matters for future generated candidates: a topology/action witness is only a warm start. Large numeric changes may invalidate it even when a sequence of locally adapted witnesses connects the two parameter settings.

## Reference trust model

V2 uses:

```text
referenceMode = event-order-step-witness
```

A stored HP/hash is insufficient. Before 4,578 can be used as a threshold, validation must:

1. rebuild the V1 joint event-order witness from repository algorithms;
2. rerun the stored continuation path through the numeric ray;
3. require the selected step to remain 0.8375;
4. match the rebuilt witness hash and purchase sequence to the V2 snapshot;
5. apply the V2 numeric overlay;
6. replay every action through canonical `engine.js`;
7. verify terminal HP and minimum margin.

Only then may an event-order threshold proof ask whether a stronger route exists.

## Validation stack

`review-candidate-v2-validation.js` runs four independent layers:

1. **reference reconstruction/replay** — validates the continuation-derived 4,578 witness;
2. **exact existence** — ordinary Tower Solver must still produce a replayed victory certificate;
3. **Holy coverage + robustness** — immediate Holy is witnessed, the three delayed policies remain covered by the numeric-independent STATIC_CUT, and all 58 single-purchase mutations of the fixed event skeleton are replayed;
4. **whole-game fixed-purchase event-order threshold** — asks whether any route under the same 29-step purchase policy can finish with HP > 4,578.

A bounded failure to find a stronger event order remains `coverage-incomplete`; it is not review readiness. Exact queue exhaustion is required to close that axis.

## Next decision rule

- If the threshold search finds `HP > 4578`, persist that exploit witness and retune again.
- If numeric/Holy/robustness checks fail, reject V2 independently of event-order coverage.
- If all base checks pass but event-order search hits budget, keep V2 `blocked` and decompose at the dominant core transition as done for V1.
- Only exact no-exploit on the modeled event-order subproblem can clear the V4 event-order gate.

## Production boundary

V2 is evidence/configuration only.

```text
productionWriteAllowed = false
```
