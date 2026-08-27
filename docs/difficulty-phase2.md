# Phase 2 — Difficulty diagnostics

Phase 2 turns authoritative solver and strategy traces into machine-readable difficulty signals for automatic mutation and tuning.

The target vector remains:

`D = (P, R, W, T, F, V, K, C)`

The implementation now has two confidence tiers: some dimensions are measured by concrete authoritative counterfactuals, while others remain portfolio/search proxies. Do not collapse them into one false notion of "exact difficulty".

For the full auto-balance trust model, adaptive-player loop, mutation-space boundaries, and promotion rules, see [`auto-balance-architecture.md`](./auto-balance-architecture.md).

## Current confidence levels

- **P — Pressure:** `authoritative-best-known-route`. Computed from every battle in the engine-replayed promoted route. The tightest battle is reported explicitly.
- **R — Regret:** `authoritative-single-purchase-counterfactual` for shop decisions around the promoted route. Exact all-action regret is still pending.
- **T — Trap:** exact for the tested one-purchase neighborhood; not yet exact across all state/action mistakes.
- **F — Forgiveness:** exact for the tested one-purchase neighborhood; not yet exact across every possible single player error.
- **W — Choice width:** still a lower-confidence strategy-family/search proxy because the old 36-policy portfolio is far below the promoted 26,041 route.
- **V — Variety:** still a lower-confidence strategy-family/search proxy for the same coverage reason.
- **K — Knowledge:** not measured until hints/hidden-information dependencies are annotated.
- **C — Complexity:** direct Solver telemetry when a Solver report is supplied.

## Best-known representative route

The old 12,536 HP portfolio-best route was superseded after authoritative single-purchase analysis found improving neighbors.

Repeated 1-opt purchase-plan search converged to:

```text
DEF x4 -> HP x15 -> ATK x1 -> HP x10
```

with terminal HP **26,041**.

All 60 one-purchase neighbors of its 30 purchase decisions have been replayed and none improves terminal HP. This makes it a verified 1-opt local optimum, not a proven global optimum.

## Pressure trace

`runGreedyShopStrategy()` records authoritative battle data including:

- floor and enemy ID;
- pre/post stats;
- fixed total damage and combat rounds/counter-attacks;
- `hpMargin = HP_before - damage - 1`;
- normalized HP margin;
- attack/defense threshold margins.

Each shop purchase also records its decision and resource state.

This lets the analyzer identify the actual constraint-forming enemy instead of inferring difficulty from terminal HP.

## Current targets

| Metric | Initial target / gate |
| --- | --- |
| representative minimum normalized HP margin | 0.08–0.25 |
| high-regret single-purchase rate | provisional 0.08–0.30 |
| catastrophic single-purchase rate | ≤ 0.10 |
| single-purchase recovery rate | ≥ 0.60 |
| exact existence | required for promoted candidates |
| locally stable player response | required before balance review |
| effective strategy count | 2–5, currently lower-confidence |
| near-optimal route minimum distance | > 0.20, currently lower-confidence |

The loss function may rank candidates only after hard constraints pass. It must never override authoritative replay, exact existence, or promotion-gate failures.

## CLI

Difficulty report:

```bash
node scripts/analyze-difficulty.mjs
```

JSON:

```bash
node scripts/analyze-difficulty.mjs --json
```

Include bounded optimize telemetry for `C`:

```bash
node scripts/analyze-difficulty.mjs --with-solver --max-expanded=2000 --max-generated=40000
```

General numeric leverage screen:

```bash
node scripts/rank-numeric-levers.mjs --top-k=16 --relative-step=0.10
```

The leverage screen is intentionally `publishable: false`; it only identifies parameters worth sending to the expensive adaptive-player and exact-Solver layers.

## Next accuracy upgrades

1. Add semantic pickup logging so item parameters can receive measured trace leverage rather than `catalog-only` priority.
2. Expand player best response beyond purchase 1-opt: Holy timing, optional fights, door/card spending, pickup timing, and backtracking.
3. Extract epsilon-optimal solution families from the Pareto search to replace W/V portfolio proxies.
4. Use the general numeric mutation catalogue plus finite-difference screen to select Top-K parameters for adaptive candidate synthesis.
5. Only after the numeric loop is stable, introduce structural mutation with semantic event IDs and explicit softlock/topology invariants.
