# V3 cross-floor late-shop A/B result — 2026-08-27

## Decision

Affordable fixed-policy purchase timing is **valid but not the terminal-search bottleneck**. Do not increase the late-shop suffix budget as the next solver step.

The dedicated six-family A/B run completed successfully on head `0fe49b4db8205caa3dd4949b5acdbed53de09df7`:

- workflow: `V3 C6 Cross-Floor Late Shop Counterexample Hunt`
- push run: `33004789858`
- job: `98295524362`
- artifact: `v3-c6-cross-floor-late-shop-counterexample-hunt`, artifact id `9620361326`
- V3 reference terminal HP: `4459`
- reference semantic fingerprint: `f7471edbeb30498d`
- result: `coverage-incomplete`, `exploitFound=false`

This is a dry-run counterexample search. It is not an exact no-exploit proof.

## Shop-normalization validation

All six scheduled raw c7 bridges had the same combat/economy resources before the late-shop closure:

```text
shopPurchases  21
HP             6328
Gold           1359
```

The fixed V3 policy permits two immediately affordable HP purchases at this point. Every bridge therefore normalized to:

```text
shopPurchases  23
HP             6628
Gold            194
```

For all six bridges:

- `shopPurchases` forced by normalization: `2`
- extra local zero-damage kills: `0`
- extra cross-floor zero-damage teleports: `0`
- extra shop teleports: `0`
- normalization replay on the ordinary fixed-purchase adapter: `true`
- normalized resources equal replay resources: `true`
- normalized structural key equals replay structural key: `true`
- normalization failures: `0`

The fixed-policy affordable-shop closure is therefore behaving as intended on this portfolio; failure to find a counterexample is not caused by wrapper/replay drift.

## Search result

The raw and post-normalization tight terminal upper bound remained `7001`, so the admissible bound did not close any bridge. All six suffixes then hit the same finite search cap:

```text
expanded / bridge = 3000
prunedBound        = 0
stoppedReason      = maxExpanded
```

No suffix reached the threshold goal, so there was no terminal certificate and no combined exploit witness to replay.

Per-bridge post-normalization search telemetry:

| family | generated | structural states | travel generated ratio | late-floor expanded ratio |
| --- | ---: | ---: | ---: | ---: |
| `001d55b4cf7c2e3a` | 22,942 | 8,506 | 71.41% | 36.80% |
| `0337b49abda0a9cb` | 21,083 | 7,107 | 72.47% | 33.50% |
| `0638b3afcff7329f` | 19,761 | 6,795 | 72.23% | 30.03% |
| `0766d2dd9776b94e` | 19,365 | 7,531 | 70.03% | 26.37% |
| `1b6fbea7095eed70` | 26,952 | 10,768 | 69.80% | 52.87% |
| `3870bee4f31cdb0d` | 24,325 | 8,924 | 71.06% | 41.33% |

The preceding cross-floor zero-damage hunt without late-shop normalization had roughly 2.4k structural states per 3000 expansions and about 65–68% generated travel actions. Early purchase normalization therefore strengthened the hero enough to expose substantially more legal actions; it increased, rather than reduced, the finite suffix search width.

## Consequence

The next structural reduction should target **travel-node permutation**, not resource or event-history equivalence:

1. keep all card inventories and dynamic event history exact;
2. keep ordinary stairs available, because Compass teleport lands at a floor's `D` anchor while a downward stair can land at its `U` anchor and those components are not assumed equivalent;
3. replace pure Compass-teleport search nodes with certificate-visible remote meaningful-action macros:
   - authoritative `teleport(targetFloor)`;
   - authoritative wrapped normalization on the target;
   - one ordinary non-teleport action on that target;
4. if the target normalization itself performs productive automatic events, expose a `teleport + normalize` macro so those side effects are not lost;
5. if teleport normalization is empty and the next action would only be another teleport, the first teleport is redundant and can be skipped;
6. every macro must expand back into the exact ordinary teleport/normalization/action steps in the Solver certificate.

This transformation attacks the measured 65–72% travel action share without quotienting card counts, event states, or U/D entry components.
