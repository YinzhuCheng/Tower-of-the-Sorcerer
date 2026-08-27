# V3 cross-floor Compass meaningful-action macro A/B

The late-shop A/B established that legal early purchases do not solve the c7 -> terminal search-width problem. They increased the six-family suffix structural width to roughly 6.8k–10.8k states at 3000 expansions, while 69.8–72.5% of generated actions were still pure travel (`teleport` plus stairs).

This experiment attacks the measured travel-node permutation directly without changing the c6 -> c7 bridge portfolio or quotienting card/event history.

## Suffix action model

At `cores >= 7`, when Compass is owned, ordinary pure `teleport` actions are removed from the search action list. For every already visited remote floor the wrapper authoritatively computes:

```text
teleport(targetFloor)
wrapped normalize(targetFloor)
```

It then exposes:

1. `teleport + normalize` when normalization performs at least one automatic event;
2. `teleport + normalize + first non-teleport action` for every ordinary action available after normalization.

The inner action may be `U` or `D`. This is required because Compass lands at the target floor's `D` anchor, while a downward stair can land at the next floor's `U` anchor. Those components are not assumed equivalent.

If target normalization is empty and the next action would be another teleport, the first teleport is redundant: every destination was already visited, so the second teleport can be taken directly from the original state. If normalization is productive, the dedicated normalize macro preserves its side effects before later travel.

`applyAction()` re-executes each macro through the wrapped authoritative adapter. Solver edge steps are the exact ordinary teleport, normalization and inner-action steps. Structural keys, frontier keys, card inventories, event signatures and admissible bounds are inherited unchanged.

## A/B profile

The c6 and c6 -> c7 stages remain the existing fixed-purchase + Compass cross-floor zero-damage search:

```text
c6 goal cap                    64
scheduled c6 prefixes           6
c7 goal cap / prefix           32
residual suffix portfolio       6, prefix-round-robin
suffix expanded / bridge     3000
suffix generated / bridge   50000
late priority slack bucket     500 HP
```

Only the c7 -> terminal action expansion changes.

## Acceptance boundary

A macro-search threshold crossing is accepted only when:

- its macro certificate replays successfully from the selected c7 bridge; and
- the combined c6 prefix + c7 transition + expanded suffix step skeleton replays from the canonical start on the ordinary fixed-purchase adapter / authoritative engine; and
- terminal HP is strictly greater than the V3 reference `4459`.

The experiment remains `productionWriteAllowed=false` and cannot by itself establish exact no-exploit coverage.
