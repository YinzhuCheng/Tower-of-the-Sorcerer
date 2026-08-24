# Phase 2 — Difficulty diagnostics

Phase 2 turns the authoritative solver/strategy traces into machine-readable difficulty signals for later automatic mutation and tuning.

The target vector follows the research pack:

`D = (P, R, W, T, F, V, K, C)`

The first implementation is intentionally mixed-confidence. Metrics that are not yet mathematically exact are marked as proxies rather than being presented as proof-level facts.

## Confidence levels

- **P — Pressure:** `authoritative-representative-route`. Computed directly from fixed-damage battles replayed by `engine.js` on the best verified portfolio route.
- **R — Regret:** `authoritative-portfolio-proxy`. Terminal regret across the 36 verified shop-order × Holy-timing policies. This is not yet exact state-action regret.
- **W — Choice width:** `portfolio-proxy`. Uses epsilon-good strategy count and entropy-derived effective strategy count. This is not yet the exact near-optimal strategy DAG.
- **T — Trap:** `portfolio-proxy`. Uses infeasible/high-regret policy-family rates. Exact catastrophic state-action trap rate remains pending.
- **F — Forgiveness:** `portfolio-policy-proxy`. Measures whether one-axis policy variants remain solvable. Exact single-action recovery is pending.
- **V — Variety:** `authoritative-portfolio-proxy`. Uses weighted strategy entropy plus behavioral distance between purchase/Holy traces.
- **K — Knowledge:** not measured until hidden-information and hint annotations exist.
- **C — Complexity:** direct solver telemetry when a solver report is supplied.

## Pressure trace

`runGreedyShopStrategy()` records every authoritative battle:

- floor and enemy ID;
- pre/post stats;
- fixed total damage and combat rounds;
- `hpMargin = HP_before - damage - 1`;
- normalized HP margin;
- attack/defense threshold margins.

Each shop purchase also records remaining gold slack after paying its cost.

This lets the analyzer report the exact floor/enemy that forms the tightest checkpoint instead of inferring difficulty from terminal HP.

## Provisional targets

The initial bands are taken from the research pack:

| Metric | Initial target |
| --- | --- |
| representative minimum normalized HP margin | 0.08–0.25 |
| effective strategy count | 2–5 |
| high-regret rate | 0.08–0.30 |
| catastrophic rate | ≤ 0.10 |
| recovery rate | ≥ 0.60 |
| near-optimal route minimum distance | > 0.20 |

`provisionalLoss` combines only the currently measurable/proxy dimensions. It is suitable for ranking candidate mutations later, but it must never override hard constraints such as authoritative replay, solvability, or exact regression checks.

## CLI

Fast portfolio-only diagnostics:

```bash
node scripts/analyze-difficulty.mjs
```

JSON output:

```bash
node scripts/analyze-difficulty.mjs --json
```

Include bounded optimize telemetry for `C`:

```bash
node scripts/analyze-difficulty.mjs --with-solver --max-expanded=2000 --max-generated=40000
```

## Next accuracy upgrades

1. Replay single-purchase counterfactuals around the best witness to replace the first R/F/T proxy with concrete single-error regret/recovery statistics.
2. Extract epsilon-optimal solution families from the Pareto search to replace the W/V portfolio proxy.
3. Annotate hidden walls, hints, and future-information dependencies before implementing K.
4. Feed the resulting measured vector into the constrained local tuner: hard constraints first, then distance-to-band loss, edit penalty, and collapse/fairness barriers.
