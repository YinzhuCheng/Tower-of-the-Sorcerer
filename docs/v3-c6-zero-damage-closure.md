# V3 c6 Lucky zero-damage enemy closure

The c6 factorization audit shows that 512 replay-verified threshold goals remain structurally distinct even after safe puzzle-history canonicalization, while every goal still contains 11–16 ordinary enemies that are exact zero-damage fights after Lucky is owned. This motivates a narrow dominance-preserving normalization instead of deleting event-history fields.

## Forced-action proof gate

A reachable enemy may be forced only when all conditions hold:

1. Lucky is already owned after the ordinary item/switch normalization pass.
2. The action is an ordinary enemy tile action.
3. The enemy is not a boss, final boss, or phase-changing enemy.
4. Authoritative `calculateBattle()` reports `winnable=true` and `totalDamage===0` under the current exact stats/relics.
5. Enemy Gold is finite and nonnegative.
6. Any direct `enemy.reward` contains only `hp`, `maxHp`, `atk`, `def`, or `gold`, all finite and nonnegative. Unknown fields and `core` progress reject the closure.

Under these conditions, executing the kill now cannot reduce any modeled resource or future option: HP is unchanged, Lucky Gold is not forfeited, positive stats/resources arrive earlier, and removing an ordinary enemy only expands walkable topology. The current fixed-purchase subproblem gives Gold no non-shop use, but the closure intentionally does not auto-buy anything.

## Certificate semantics

The wrapper does not mutate compact event vectors directly. It calls the existing adapter's `applyAction()`, which executes the macro through authoritative `engine.js::tryMove()`. The resulting battle/path/resource/structural step is marked automatic and returned from `normalize()`, so Solver certificates retain and authoritative replay re-executes every forced kill.

After each forced kill the ordinary safe item/switch normalization runs again. The process repeats to a fixed point, with deterministic event-id ordering and a hard safety limit.

## Scope

The adapter requires an already-created fixed-purchase policy adapter. It is not enabled in the unrestricted Tower solver and it does not alter objective upper bounds, action enumeration, or explicit shop choice rules.

## A/B gate before proof promotion

`analyzeV3C6ZeroDamageClosureGrowth()` reruns the same c6 boundary ladder used by the baseline:

```text
64 -> 128 -> 256 -> 512 goals
```

For each cap it reports structural/search cardinality plus how many forced zero-damage kills appear in replay-verified goal certificates. This workflow is diagnostic only; V3 remains `productionWriteAllowed=false` and event-order closure remains blocked until the reduction is shown useful and then integrated into the staged proof path with the same exactness requirements.
