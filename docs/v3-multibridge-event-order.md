# V3 multi-bridge c7 event-order continuation

## Motivation

The coupled V3 candidate now passes every current numeric / solvability / purchase-robustness gate except global event-order closure:

```text
reference HP               4459
reference margin           24.545%
independent existence      exact / replayed
catastrophic               4/58
recovery unknown           0
whole-game threshold 50k   no exploit, coverage-incomplete
```

The existing staged chain finds one replay-verified c6->c7 bridge with terminal upper bound 4930, then spends an 8k suffix budget from only that bridge. No exploit is found, but that one bridge is not an exhaustive representation of every threshold-relevant c7 state.

## Algorithm

`analyzeThresholdCoreMultiBridgeChain()` adds another decomposition layer without changing gameplay or proof pruning.

### 1. c6 threshold frontier

Collect a Pareto goal frontier at `cores >= 6` under the same fixed purchase policy and objective-threshold adapter. Every retained prefix is authoritative-replayed and must still have terminal HP upper bound above the V3 reference.

A bounded `maxPrefixSeeds` only schedules existence hunting. Unscheduled prefixes keep global exactness false.

### 2. c7 bridge frontier per prefix

Instead of calling an existence Solver that stops at the first c7 state, each scheduled c6 prefix runs `collectGoalFrontier()` with the c7 boundary adapter. This can retain multiple nondominated c7 bridge states from the same prefix.

Each c7 bridge certificate is replayed from its exact c6 compact state before it becomes eligible for suffix search.

### 3. Cross-prefix Pareto reduction

Different c6 prefixes can converge to the same authoritative structural c7 state with different resource vectors. The analyzer reuses the Solver's resource-dominance rule only when `structuralKey` is identical.

A bridge that is resource-dominated at the same structural state is unnecessary: under the same fixed purchase policy, its dominator can execute every future action available to it with weakly more resources. This is the same monotonicity assumption used by the main Pareto Solver.

`ParetoFrontier.insert()` now explicitly marks rejected labels `active=false`, so analyzers retaining provenance arrays cannot accidentally schedule a dominated label later.

### 4. Equal-budget terminal suffixes

Active c7 Pareto bridges are ordered for existence hunting by optimistic terminal upper bound / HP / Gold. The first `maxSuffixBridges` each receive an independent terminal threshold suffix with:

```text
late zero-damage harvest closure
+
late-game threshold queue priority
+
500 HP slack bucket
```

The default profile uses 4,000 expansions per bridge instead of blindly increasing one bridge from 8k to a much larger budget.

If any suffix produces terminal HP > 4459, the prefix + transition + suffix certificates are converted into one numeric-agnostic event-order witness and replayed from the canonical engine start. That witness is the counterexample to persist before retuning.

## Exactness rule

The multi-bridge analyzer may claim exact no-exploit only when **all** of the following hold:

1. the complete c6 threshold boundary exhausts exactly;
2. every verified threshold-relevant c6 prefix is scheduled;
3. every scheduled prefix's c7 goal frontier exhausts exactly;
4. every active cross-prefix Pareto c7 bridge is suffix-searched;
5. every suffix exhausts exactly with no exploit.

Any max-goal / max-expanded / max-generated / scheduling limit keeps status `coverage-incomplete`.

This strict classifier is unit-tested independently. Finding one exploit short-circuits the no-exploit obligations because a replayed counterexample is sufficient to defeat the candidate.

## Initial repository profile

The first GitHub profile is intentionally an exploit hunt / coverage measurement rather than an exact proof run:

```text
c6 boundary             8000 expanded / 64 goals
scheduled c6 prefixes   6
c7 per-prefix frontier  2500 expanded / 8 goals
scheduled c7 suffixes   4
suffix per bridge       4000 expanded / 60000 generated
slack bucket            500
```

The resulting report records every prefix frontier, active c7 Pareto bridge, per-bridge resources/upper bound and suffix telemetry. If no exploit is found, the evidence is used to decide whether the next bottleneck is bridge diversity, suffix ordering, or an upper-bound relaxation rather than merely raising one scalar budget.
