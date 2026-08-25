# Late-game zero-damage harvest closure

Status: 2026-08-25, `solver-phase1-pareto`.

This note records a suffix-only canonicalization used by the fixed-purchase event-order exploit search. The algorithm lives in `src/solver/late-game-zero-damage-harvest-adapter.js`; this document records the proof conditions and why it must not be generalized blindly to earlier floors.

## Motivation from the c7 threshold bridge

The first replay-verified `core6 -> core7` threshold bridge for the review candidate has:

```text
cores          = 7
HP             = 6,204
ATK / DEF      = 181 / 163
Gold           = 1,304
shopPurchases  = 20
Lucky          = true
Ward           = true
Holy           = true
terminal UB    = 7,822
threshold      = 7,083
```

A suffix search from that exact bridge used 8,000 expanded / 48,765 generated states without finding an exploit or exhausting the queue. Generated actions were dominated by old-floor recovery:

```text
teleport = 18,155
enemy    = 14,076
door     =  8,695
U        =  7,815
shop     =      8
boss     =     13
```

Only 23 expanded states were on F8; most work returned to F1-F5. This indicates optional old-enemy ordering, not shop-choice branching, as the next reduction target.

## Safe automatic event

After the late-game boundary, a currently reachable enemy is normalized automatically only when every condition holds:

1. `cores >= minCores` (current chain uses 7);
2. Lucky is already owned;
3. the action is an ordinary non-boss enemy, with no phase transition;
4. all configured enemy rewards are non-negative;
5. `engine.js::calculateBattle()` says the fight is winnable;
6. authoritative `totalDamage === 0` **right now**.

The actual kill is still executed by the wrapped Tower adapter, so certificate resources, event consumption and map mutation remain canonical-engine transitions.

## Why the transformation is monotone

Under those conditions, executing the enemy now rather than later cannot make any modeled future state worse:

- HP does not decrease;
- Lucky is already owned, so delaying cannot increase the gold multiplier;
- gold and reward stats only increase;
- the enemy tile becomes free floor, so movement possibilities only expand;
- gold has no non-shop sink in current rules;
- the player is never forced to spend the extra gold.

Therefore any route that skips/delays such an enemy can be transformed into one that kills it immediately and then follows the same later decisions with resources that weakly dominate the original route.

This is a representative-order canonicalization, not a heuristic prune.

## Why the rule is suffix-only

The same transformation is **not** enabled globally.

Earlier in the game:

- Lucky may still be unowned, so killing before Lucky can lose future gold;
- positive-damage fights make timing strategic;
- bosses/core rewards change progression semantics;
- future mechanics may attach non-monotone side effects to enemies.

The adapter therefore has explicit `minCores` and `requireLucky` guards, excludes bosses/phase enemies, and checks current authoritative damage on every normalization pass.

## Certificate semantics

Automatic kills are recorded as ordinary Solver certificate steps with `automatic=true`. Authoritative replay does not trust the label; it executes the same path and enemy transition through `engine.js` and checks resource/structural snapshots.

The c6 prefix and c6->c7 transition certificates are replayed under the original adapter stack. Only the c7->terminal suffix uses this closure, so the reduction cannot retroactively alter an already certified bridge.

## Exactness boundary

The closure preserves the suffix state space up to the proven monotone transformation, but exact failure from **one** c7 bridge still does not prove global no-exploit. Other threshold-relevant c7 bridges may exist.

The three-certificate chain keeps the existing asymmetric evidence rule:

```text
one replayed suffix > 7083
    -> exploit proven

one exact non-exploiting c7 suffix
    -> that bridge eliminated only
```

Global exact no-exploit still requires complete relevant bridge coverage or another sound global proof.

## Production boundary

This optimization only strengthens event-order analysis. It does not enable automatic writes to canonical game balance data.

```text
productionWriteAllowed = false
```
