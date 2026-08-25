# Event-order threshold proof chain

Status: 2026-08-25, `solver-phase1-pareto`.

This note records the current proof decomposition for the review candidate's event-order best response. It is repository-resident so the reasoning does not depend on transient CI logs or VM state.

## Question

The current review candidate authoritative-replays to **7,083 terminal HP** under its purchase-1opt policy. The event-order safety question is not "what is the exact best route?" yet; the immediate safety question is:

```text
Does any legal route with this fixed purchase policy finish with HP > 7083?
```

This is converted into an exact existence problem by `createObjectiveThresholdAdapter()`. Any state whose admissible terminal-HP upper bound is `<= 7083` is a proof-level dead end.

## Why whole-game search was decomposed

A 50,000-expanded threshold run did not find an exploit and did not exhaust the queue. Its expansions were overwhelmingly concentrated at core 6:

```text
f1/c6  18,731
f2/c6  15,143
f3/c6   9,323
f4/c6   3,429
f5/c6   1,675
f7/c6     930
f6/c6     692
```

Total:

```text
expanded  = 50,000
generated = 241,855
bound-pruned = 2,415
status = coverage-incomplete
```

Therefore increasing the same whole-game budget is not the preferred next step. Every victory must pass the mandatory `core6 -> core7` transition, so the threshold question can be decomposed there.

## Threshold-relevant c6 boundary

The transition analyzer first collects replay-verified c6 states under the fixed purchase policy and threshold dead-end rule.

A state is relevant only when:

```text
objectiveUpperBound(state) > 7083
```

A finite discovery pool can prove existence of a useful bridge but cannot prove its absence. Exact no-transition requires:

1. complete c6 boundary coverage;
2. every threshold-relevant boundary certificate replayed successfully;
3. every relevant seed attempted;
4. exact failure of every c6->c7 continuation.

This exactness condition is encoded in `src/analyzer/event-order-core-transition-proof.js`.

## Measured c6 -> c7 bridge

The first dedicated profile used:

```text
boundaryMaxGoals        = 64
maxTransitionSeeds      = 8
transitionMaxExpanded   = 5,000
transitionMaxGenerated  = 70,000
```

It found a replay-verified threshold-relevant bridge immediately:

```text
boundary discovered = 64 / 64 relevant
boundary expanded   = 789
boundary generated  = 4,487

selected c6 seed:
HP             = 4,058
Gold           = 878
shopPurchases  = 16
terminal UB    = 8,702

c6 -> c7 continuation:
expanded       = 27
generated      = 264
status         = goalFound
c7 terminal UB = 7,822
```

Because `7,822 > 7,083`, the candidate cannot be cleared by arguing that every potentially superior route dies before core 7.

This is an **existence bridge**, not an exploit by itself. Upper bound 7,822 is optimistic; the route still has to realize more than 7,083 HP at victory.

## Three-certificate chain

The next proof layer is implemented in:

- `src/analyzer/event-order-core-transition-chain.js`
- `scripts/analyze-event-order-core-transition-chain.mjs`
- `test/event-order-core-transition-chain.test.js`

The evidence is deliberately kept as three certificates rather than flattening different initial-state certificates into one synthetic object:

```text
canonical start
  -- prefix certificate --> threshold-relevant c6 state
  -- transition certificate --> threshold-relevant c7 state
  -- suffix certificate --> victory with HP > 7083
```

For each continuation:

1. the prior certificate is authoritatively replayed;
2. the exact compact terminal state becomes the next initial state;
3. the next certificate must match that initial-state hash;
4. the final suffix uses the same objective-threshold dead-end rule.

Only a replayed suffix goal with `terminal HP > 7083` is an event-order exploit.

## Exactness rule

The asymmetry is important:

```text
one replayed 3-stage success
    -> exploit proven
```

but:

```text
one c7 bridge whose suffix exhausts with no exploit
    -> only that bridge eliminated
    -> global status still coverage-incomplete
```

Global exact no-exploit can be inherited from this decomposition only if the mandatory transition itself is eliminated exactly through complete c6 boundary coverage and exact failure of every relevant c6->c7 continuation.

This rule is regression-tested so a local suffix failure cannot accidentally become a global safety claim.

## Production boundary

Even if this fixed-purchase event-order layer eventually proves no route above 7,083, unattended production writes remain disabled. The broader player model still needs joint purchase/event-order neighborhoods and stronger near-optimal route-family coverage before numeric changes can be written automatically.

Current rule remains:

```text
productionWriteAllowed = false
```
