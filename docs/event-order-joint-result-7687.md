# Event-order joint response result: 7,687 HP

Status: 2026-08-25, `solver-phase1-pareto`.

This note records the measured result of running purchase 1-opt on top of the replay-proven event-order exploit. It changes the numeric tuning target materially and is therefore repository-resident rather than a CI-only observation.

## Starting point

The distributed-pressure candidate was originally tuned against a deterministic event order and purchase 1-opt route:

```text
terminal HP              = 7,083
minimum normalized margin = 11.62%
```

A fixed-purchase event-order threshold search then proved a stronger legal route:

```text
terminal HP = 7,187
```

That proof is a three-certificate authoritative chain and is documented in `event-order-exploit-7187.md`.

## Purchase response on the improved event order

The 7,187 proof route was stripped to a numeric-agnostic 241-step action skeleton and replayed independently from the canonical start. The route contains 29 shop actions.

`event-order-purchase-local-search.js` then enumerated both alternative shop choices at every existing shop step and accepted the strongest improving one-shop mutation until the neighborhood was exhausted.

Measured result:

```text
seed terminal HP       = 7,187
best terminal HP       = 7,687
total improvement      = +500
improvement vs 7,083   = +604 (+8.53%)
shop steps             = 29
improvement passes     = 3
evaluated mutations    = 232
localOptimal           = true
best witness hash      = 34a27dcc2d368edf
minimum HP margin      = 42.63%
```

Accepted mutations:

```text
purchase 1   DEF -> ATK   +197 HP
purchase 3   ATK -> DEF   +277 HP
purchase 11  HP  -> DEF    +26 HP
```

The final fixed-order purchase sequence is:

```text
def, atk, def, def,
atk, atk, atk, def,
atk, atk, atk, def,
hp, hp, hp, hp, hp, hp, hp,
atk,
hp, hp, hp, hp, hp, hp, hp, hp, hp
```

Every tested neighbor is a complete `engine.js` replay. A mutation that makes a later fight/path/purchase illegal is rejected naturally.

## Consequence for difficulty interpretation

This result is not a small correction to the 7,083 route. The strongest known route under the expanded player model has:

```text
minimum normalized HP margin = 42.63%
```

against the intended chapter target:

```text
8% .. 25%
```

Therefore the current three-parameter balance direction remains useful, but the **ray strength is materially too soft once event order and purchase response are combined**.

The next tuner objective is no longer:

```text
retune against greedy event order
```

It is:

```text
same numeric direction
  -> replay event-order witness under each numeric overlay
  -> purchase 1-opt that witness under the overlay
  -> measure the stronger player's pressure
  -> move the numeric ray until that response reaches the target band
```

Implementation of this next layer lives in `src/tuner/event-order-witness-ray.js` and `scripts/analyze-event-order-witness-ray.mjs`.

## Confidence boundary

`7,687` is stronger evidence than the prior 7,083/7,187 routes, but it is still not a joint global optimum.

`localOptimal=true` means only:

> holding this event/action order fixed, no single replacement among the existing 29 shop choices improves terminal HP.

Not covered yet:

- a new event-order change after one of those purchase mutations;
- purchase insertion/deletion/re-timing;
- multi-purchase moves requiring a worsening intermediate step;
- all globally near-optimal routes.

The event-order proof and the purchase-local result therefore remain separate evidence objects.

## Review / production status

Review gate v4 correctly blocks the old candidate because a stronger event-order response is known. Numeric tuning may continue in dry-run mode, but canonical balance data remains untouched.

```text
productionWriteAllowed = false
```
