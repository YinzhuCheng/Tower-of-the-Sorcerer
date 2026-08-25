# V2 witness-threshold core transition proof

Status: 2026-08-25, `solver-phase1-pareto`.

This note defines the staged event-order proof used after the distributed-pressure V2 candidate produced a replay-verified 4,578-HP player witness but the whole-game threshold search remained incomplete.

## 1. Why whole-game search is no longer the best next question

The V2 fixed-purchase event-order threshold search asks:

```text
Does any canonical route under the V2 purchase policy finish with HP > 4,578?
```

At the current 50,000-expanded budget it found no exploit, but it did not exhaust the queue. Profiling showed the search is dominated by `cores == 6` states. Raising the global budget would mostly enumerate more c6 permutations before answering the mandatory structural question:

```text
Can any threshold-relevant c6 state reach c7 while still retaining terminal-HP upper bound > 4,578?
```

Every winning route must cross that transition, so it is a valid proof decomposition boundary.

## 2. Reference trust

V1 core-transition analysis originally assumed the reference came from the deterministic greedy runner. V2 does not: its threshold is defined by a 241-step event-order witness produced by witness-aware numeric continuation.

The analyzer now uses one reference resolver for both generations:

```text
resolveReviewCandidateReference(candidate, adapter, referenceWitness)
```

For V2, boundary search cannot start unless all of the following replay under the active V2 numeric overlay:

```text
witness hash            = 8623f0ba330d21b3
terminal HP             = 4,578
minimum HP margin       = 14.945652%
purchase count          = 29
actual shop sequence    = persisted V2 purchase policy
Holy collected          = true
canonical engine replay = PASS
```

A stale or mismatched witness produces `candidate-snapshot-drift`; it can never silently supply a proof threshold.

## 3. Threshold relaxation

The fixed-purchase Tower adapter is wrapped by:

```text
createObjectiveThresholdAdapter(threshold = 4578)
```

A state is a proof-level dead end when its admissible optimistic terminal-HP upper bound is `<= 4578`.

This is safe because the bound is an overestimate of every continuation from that state. The bound is overlay-aware: mutable shop/item/enemy values are read from the current candidate rather than cached baseline constants.

Therefore only states that could still theoretically beat the reference survive into the c6 frontier.

## 4. From-core boundary

The first stage collects replay-verified states with:

```text
cores >= 6
objectiveUpperBound > 4578
```

using `collectGoalFrontier()` and `createCoreBoundaryAdapter()`.

A finite `maxGoals` or expansion budget is a discovery budget only. It can provide useful transition seeds, but incomplete boundary coverage cannot prove absence of an exploit.

Every emitted boundary certificate is authoritatively replayed back into an exact compact continuation state before stage two.

## 5. c6 -> c7 continuation

For each scheduled c6 state, a fresh existence Solver asks whether it can reach:

```text
cores >= 7
objectiveUpperBound > 4578
```

under the same V2 purchase policy and canonical game rules.

A successful continuation must satisfy all of:

```text
solver says solvable
continuation certificate replays
replayed state has cores >= 7
replayed state upper bound > 4578
```

One such bridge is enough to prove that the threshold-relevant space survives the c6→c7 transition. It does **not** yet prove a final HP>4578 exploit; the next stage would continue from that bridge to terminal victory.

## 6. Scheduling versus proof

Boundary seeds are ranked by optimistic terminal upper bound, then HP, for existence hunting. Scheduling may change attempt order only.

The exact no-transition condition is deliberately stronger:

```text
no winning transition
AND complete c6 boundary coverage
AND every threshold-relevant verified c6 seed attempted
AND every one of those continuation searches ended exact-no-transition
```

Implementation:

```text
classifyThresholdCoreTransitionEvidence()
```

Regression tests explicitly cover:

- transition found under incomplete boundary => existence witness allowed;
- partial seed scheduling => exact no-transition forbidden;
- incomplete boundary => exact no-transition forbidden;
- one bounded continuation => exact no-transition forbidden;
- complete boundary + all exact failures => exact no-transition allowed.

This preserves the project-wide rule:

```text
budget exhausted != infeasible
unscheduled != dominated
```

## 7. Current profile budget

The dedicated V2 profile starts with:

```text
boundary max expanded  = 8,000
boundary max generated = 100,000
boundary max goals     = 64
scheduled continuations= 8
transition max expanded= 5,000 per seed
transition max generated=70,000 per seed
```

These are diagnostic/existence-hunt budgets, not proof completeness claims.

The report exposes:

```text
boundary.verifiedRelevantGoals
boundary.coverageExact
schedule.scheduledSeedCount
schedule.verifiedRelevantSeedCount
schedule.attemptedAllVerified
attempts[*].prefixUpperBound
attempts[*].transitionFound
attempts[*].exactNoTransition
attempts[*].solver telemetry
```

so later budget/scheduler changes can be evidence-driven.

## 8. Decision rule

After the first V2 c6→c7 profile:

- **bridge found**: immediately continue the replayed bridge toward terminal HP>4578; do not spend time proving other c6 seeds first;
- **no bridge, incomplete boundary or bounded continuations**: status stays `coverage-incomplete`; inspect stage telemetry before increasing raw budgets;
- **complete boundary + all exact failures**: the c6→c7 transition is closed for HP>4578, which proves no full-game fixed-purchase exploit can exist through that mandatory transition;
- **candidate snapshot drift**: repair reference evidence before any search interpretation.

## 9. Relationship to the V2 trap result

This proof axis is independent of the six exact early-purchase traps.

V2 currently has two separate design/proof issues:

1. the first three ATK purchases are exact fixed-event-order hard traps under one-error recovery analysis;
2. the stronger event-order player space above 4,578 HP is not yet closed.

The next numeric candidate should repair the early attack-breakpoint brittleness, but event-order decomposition remains valuable because a softer candidate must still be evaluated against a stronger player.

## 10. Production boundary

This module is proof/search infrastructure only.

```text
productionWriteAllowed = false
```

No numeric candidate, placement mutation, or topology mutation is automatically written to canonical game data from this analysis.
