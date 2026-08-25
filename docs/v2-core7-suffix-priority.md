# V2 c7 -> terminal suffix priority experiment

## Scope

This experiment addresses the current V2 event-order blocker without changing gameplay, balance values, transition semantics, dominance, or proof pruning.

The replay-verified c6 -> c7 bridge has:

```text
reference terminal HP = 4578
bridge HP             = 3881
bridge Gold           = 1304
bridge purchases      = 20
bridge terminal UB    = 5049
```

The historical 8k suffix profile is coverage-incomplete. Its budget is dominated by cross-floor recovery/travel rather than terminal progress:

```text
expanded                    8000
generated                   34986
queue peak                   7585
pruned by admissible bound   2097
teleport generated          16665
U generated                  7623
travel generated            24288  (69.42%)
F7 + F8 expanded              592  (7.40%)
F1 + F2 + F3 + F4 expanded   6392 (79.90%)
```

`budget exhausted != infeasible`; the baseline result remains unknown rather than a proof of no exploit.

## New algorithm

`createLateGameThresholdPriorityAdapter()` is a queue-order-only wrapper used after the replay-verified c7 bridge.

It ranks states by coarse tiers:

1. objective-upper-bound slack corridor above the reference threshold;
2. ability to afford the next fixed-policy shop purchase;
3. terminal-floor and terminal-puzzle progress;
4. completed shop purchases and distance from the terminal floor;
5. ATK/DEF/HP tie-breakers.

Upper-bound slack is bucketed (default 25 HP) instead of compared point-for-point. This prevents a pure travel state with a trivial optimistic-bound advantage from automatically outranking a state with materially better irreversible progress.

## Correctness boundary

The adapter must remain search ordering only.

It does **not**:

- delete or filter actions;
- change `structuralKey` or Pareto dominance;
- change `objectiveUpperBound`;
- introduce `provenDeadEnd` rules;
- change engine transitions or normalization;
- treat budget exhaustion as infeasibility.

Therefore exactness semantics are unchanged. If the queue exhausts under sound existing pruning, the modeled result is exact; if `maxExpanded`/`maxGenerated` fires, the result is still coverage-incomplete.

## A/B telemetry

`.github/workflows/v2-core7-suffix-priority-profile.yml` runs the same V2 bridge and identical suffix budgets in two independent jobs:

```text
baseline
late-game-threshold
```

Both reports expose:

- `expandedStates`
- `generatedStates`
- `queuePeak`
- `prunedBound`
- `travelGenerated` and ratio
- teleport / stair generation
- F7+ late-floor expansions and ratio
- earlier-floor expansions and ratio
- exploit witness/replay if found

The experiment is successful if the priority mode either:

1. finds an authoritative-replayable route with terminal HP > 4578; or
2. materially shifts equal-budget coverage toward F7/F8 / terminal progress while reducing travel pressure or queue growth.

A discovered exploit must be persisted as a semantic witness/counterexample before any balance retune. If no exploit is found, the result is not promoted to `exactNoExploit` unless the suffix queue actually exhausts.

## Follow-up

After this ordering experiment stabilizes:

1. evaluate several replay-verified c7 bridges rather than one bridge only;
2. tighten the threshold corridor with additional admissible suffix bounds if 5049 remains materially loose;
3. instrument early-purchase recovery failure cores for the six V2 catastrophic mutations;
4. feed both event-order exploits and recovery failures into the future CEGIS witness bank.
