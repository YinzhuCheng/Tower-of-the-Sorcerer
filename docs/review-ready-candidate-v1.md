# First review-ready adaptive balance candidate

Status: 2026-08-25, `solver-phase1-pareto`.

This note supersedes older interim statements that the distributed numeric candidate was blocked by incomplete Holy coverage. Those statements remain useful as experiment history, but the evidence gap has now been closed by a sound STATIC_CUT certificate.

## Candidate

Repository snapshot: `src/tuner/review-candidates.js` → `distributedPressureV1`.

Dry-run edits:

```text
whaleSinger.magicPower: 34 -> 56
shop.hp.effect.hp:       900 -> 320
shop.hp.effect.maxHp:    900 -> 320
flameCaster.def:          38 -> 63
```

The two shop HP fields are one semantic lever and must remain coupled.

The candidate is **not** written into canonical `src/game/data.js`.

## Current player response

Explicit 30-purchase policy:

```text
DEF x3
ATK x4
DEF x1
ATK x3
HP  x8
ATK x1
HP  x10
```

Counts:

```text
DEF 4
ATK 8
HP  18
```

Authoritative deterministic replay:

- terminal HP: `7083`
- minimum normalized HP margin: `0.11616650532429816`
- selected Holy policy: `immediate`
- no improving one-purchase neighbor

The explicit plan is persisted in `src/tuner/review-candidates.js` so future exploit searches do not depend on transient CI artifacts.

## Holy coverage is now complete

The Holy best-response axis has four modeled policies.

```text
immediate      -> optimized
after-core-6   -> infeasible-proven (STATIC_CUT)
after-core-7   -> infeasible-proven (STATIC_CUT)
before-final   -> infeasible-proven (STATIC_CUT)
```

Coverage semantics:

```text
1 optimized + 3 proven-infeasible = 4 / 4 covered
```

The three infeasibility results are not Solver timeout interpretations. They come from the optimistic structural proof documented in `pre-holy-static-cut-proof.md`.

## Current hard-gate evidence

Adaptive numeric ray result:

- ray strength: `0.6453125`
- bracket: `0.6388671875 .. 0.6453125`
- observed best-response monotonicity violations: `0`
- pressure target: PASS
- purchase 1-opt: PASS
- exact existence: PASS
- exact existence expanded states: `1736`
- exact existence generated actions: `13665`
- single-purchase recovery: `0.9333333333333333`
- catastrophic single-purchase rate: `0.06666666666666667`
- high-regret single-purchase rate: `0`
- Holy coverage complete: PASS

`balance-proposal-v3` therefore reports:

```text
status = ready_for_review
```

## Why production writes are still disabled

`ready_for_review` means the candidate passes the **currently modeled** hard gates. It does not mean the player model is globally closed.

The deterministic route generator still fixes a particular map-event priority. A stronger player may reorder optional fights, pickups, doors, puzzle events or cross-floor recovery and obtain materially more HP under the same purchase policy.

Therefore:

```text
productionWriteAllowed = false
```

remains mandatory.

## Next response layer

The next model is the fixed-purchase event-order best response:

```text
fixed explicit purchase policy
+ free authoritative macro-event order
+ optimize terminal HP
```

Implementation is documented in `event-order-best-response.md`.

This search intentionally leaves Holy's microscopic pickup timing free. The STATIC_CUT proof only removes impossible core6-or-later policies; it does not assume all pre-core6 pickup timings are equivalent.

Evidence interpretation:

- a replayed route above 7083 HP is an immediate exploit witness;
- exhaustive queue completion is an exact optimum only under the fixed purchase policy;
- a budget stop with no exploit is coverage-incomplete, not proof of safety.

Only after this axis is sufficiently covered should the project consider joint purchase/event-order neighborhoods or position/topology mutation.
