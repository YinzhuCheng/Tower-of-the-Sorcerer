# V3 c7 Compass macro v1 result and teleport-memo plan — 2026-08-27

## Compass meaningful-action macro v1: rejected as a search reduction

The v1 suffix adapter removed pure Compass teleport nodes by eagerly exposing all first non-teleport actions from every visited remote floor.

Unit tests passed 6/6 and the transformation kept certificate-visible authoritative teleport / normalization / inner-action steps. The problem was performance, not replay correctness.

### Main one-family probe

- head: `777cdc9e6abd4865670b7893df91ccb3b94149b0`
- run: `33005940913`
- job: `98299567406`
- artifact: `v3-c6-cross-floor-compass-macro-probe`, id `9620742523`
- reference HP: `4459`
- exploit: none

Suffix evidence:

```text
p=21
HP=6328
Gold=1359
tight upper bound=7001
expanded=1992
generated=50000
structuralStates=8508
activeLabels=8508
stop=maxGenerated
prunedBound=0
teleportGenerated=0
stairGenerated=13876
travelGeneratedRatio=27.752%
lateFloorExpandedRatio=37.149%
```

### Reduced microprobe

- head: `c41d8791179fac739fb799788c68ae3dc4458103`
- run: `33006539536`
- job: `98301637562`
- artifact id: `9620807829`

```text
suffix expanded=335
generated=10000
structuralStates=8062
stop=maxGenerated
teleportGenerated=0
stairGenerated=2341
travelGeneratedRatio=23.41%
lateFloorExpandedRatio=100%
```

The macro removed travel depth but replaced it with a very wide remote-action surface. The main probe generated about 25.1 successors per expansion; the microprobe generated about 29.9. Therefore the v1 macro must **not** be expanded to the six-family portfolio.

## Corrected ordinary-hub baseline

A reread of the successful prior cross-floor hunt artifact (`9619135636`) corrected an earlier shorthand description of its structural-state count. The six ordinary-hub suffixes at 3000 expansions had:

```text
generated        20,609 .. 24,650
structuralStates  8,291 .. 10,495
teleportGenerated 11,254 .. 14,293
stairGenerated     2,282 .. 2,441
travel ratio       65.42% .. 67.97%
```

Thus the important regression in macro v1 is not that 8508 structural states exceeds every old terminal count. It is that those states are reached after only 1992 expansions because eager remote flattening increases branching from roughly 6.9–8.2 attempted successors per ordinary-hub expansion to about 25.1.

## Next exact reduction: solve-scoped equivalent-teleport memo

Keep the ordinary Compass hub and its useful lazy expansion. Remove only duplicate teleport transitions that are guaranteed to have the same successor.

For the canonical Tower transition system, `teleportToFloor()` ignores the source floor/component and lands deterministically at the requested visited floor's Compass anchor. Therefore, for a fixed target floor, two normalized search states with identical:

- complete Solver resources, including card counts;
- dynamic event signature;
- puzzle/floor meta;
- relic set;
- shop purchase count;
- visited-floor mask;
- victory state;

but different **current source floor/component only** produce the same authoritative teleport successor and the same deterministic normalization successor.

The memo key is therefore:

```text
(targetFloor,
 structuralKey minus source floor/component,
 complete resources)
```

The first class member keeps its ordinary teleport action. Later members omit only that equivalent teleport action. Local actions and all first teleport targets remain unchanged.

The memo is solve-scoped: every independent c7 bridge suffix creates a fresh adapter instance. It is never shared across bridge starts.

Implementation:

- `src/solver/fixed-purchase-teleport-transition-memo-adapter.js`
- `test/fixed-purchase-teleport-transition-memo-adapter.test.js`
- `src/analyzer/event-order-c6-cross-floor-teleport-memo-counterexample-hunt.js`

This is intended to reduce the large number of teleport transitions that the ordinary search generates and then Pareto-prunes, without replacing the teleport hub with eager remote action flattening and without quotienting cards/events.
