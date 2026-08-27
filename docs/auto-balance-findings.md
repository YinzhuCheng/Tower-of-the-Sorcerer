# Auto-balance empirical findings

This file records current evidence that materially changed the balance-search direction. It complements [`auto-balance-architecture.md`](./auto-balance-architecture.md): the architecture document explains the trust model, while this file records concrete measurements that justify current choices.

All values below come from authoritative engine replay. Solver claims are stated separately from route replay claims.

## Baseline best-known route

Promoted purchase 1-opt route:

```text
DEF x4 -> HP x15 -> ATK x1 -> HP x10
```

- terminal HP: **26,041**
- purchase counts: `ATK 1 / DEF 4 / HP 25`
- minimum normalized HP margin: **0.7945564947**
- all 60 one-purchase neighbors replayed; none improves terminal HP
- status: verified purchase **1-opt local optimum**, not proven global optimum

## Experiment A — concentrate pressure in the final fight

Legacy adaptive-final candidate used:

- shop HP reward: `900 -> 90`
- `voidCore.magicPower -> 592`

After the player re-optimized purchases:

- terminal HP: **2,261**
- purchase counts: `ATK 15 / DEF 6 / HP 9`
- minimum normalized HP margin: **0.1657255995**
- adaptive fixed point: converged
- single-purchase recovery: **0.9333333333**
- catastrophic single-purchase rate: **0.0666666667**
- high-regret single-purchase rate: **0.6071428571**
- improving one-purchase neighbors: **0**

Independent existence search at the configured proof budget did **not** finish:

- expanded states: **4,257**
- generated states: **50,000**
- stopped at generated-state budget
- exact existence: **not proven at this budget**

Interpretation: concentrated final pressure can hit the target margin, but it makes the local decision landscape sharply punishing and substantially increases proof search cost.

## Experiment B — distribute pressure across economy and intermediate enemies

General numeric screening automatically selected the protected ray `numeric-combo-04`:

```text
whaleSinger.magicPower
+ shop HP reward
+ flameCaster.def
```

### Protected-route ray

Before allowing the player to adapt, the protected ray found a target-band scale near **0.59375** with exact existence. This established that three distributed levers already provide enough control authority; there is no need to add more simultaneous parameters merely to create pressure.

### Purchase-adaptive ray

After purchase-plan best response was put back into the loop, the ray automatically increased to:

- final ray strength: **0.6453125**
- bracket: `0.6388671875 .. 0.6453125`
- bracket width: **0.0064453125**
- observed best-response monotonicity violations: **0**

Concrete candidate edits:

```text
whaleSinger.magicPower: 34 -> 56
shop.hp.effect.hp:       900 -> 320
shop.hp.effect.maxHp:    900 -> 320
flameCaster.def:          38 -> 63
```

The HP and max-HP shop fields are one semantic lever and must stay coupled.

Player response at this candidate:

- terminal HP: **7,083**
- purchase counts: `ATK 8 / DEF 4 / HP 18`
- minimum normalized HP margin: **0.1161665053**
- pressure target 0.08–0.25: **PASS**
- player purchase 1-opt: **PASS**
- improving one-purchase neighbors: **0**

Robustness:

- single-purchase recovery: **0.9333333333**
- catastrophic single-purchase rate: **0.0666666667**
- high-regret single-purchase rate: **0**
- P90 normalized regret: **0.0415078357**
- maximum normalized regret: **0.1712551179**

Independent exact existence proof:

- solvable: **true**
- exact: **true**
- expanded states: **1,736**
- generated states: **13,665**
- certificate hash: `3879ae99ebfd3d25`

## Comparison before adding Holy timing to the player model

| Signal | Final-pressure concentration | Distributed 3-lever ray |
| --- | ---: | ---: |
| minimum HP margin | 16.57% | 11.62% |
| exact existence within current budget | no | **yes** |
| generated states | 50,000 cap | **13,665** |
| recovery rate | 93.33% | 93.33% |
| catastrophic rate | 6.67% | 6.67% |
| high-regret rate | 60.71% | **0%** |
| improving one-purchase neighbor | 0 | 0 |

This established the distributed candidate as the better **numeric design direction**. It did not establish complete player best-response coverage.

## Experiment C — add Holy timing as a player-response axis

The player model was expanded from purchase-only 1-opt to:

```text
max over Holy policy
    purchase local-1opt under that policy
```

Modeled policies:

- `immediate`
- `after-core-6`
- `after-core-7`
- `before-final`

For every policy, the analyzer first tries deterministic feasible seeds and then purchase 1-opt. Missing seeds are not treated as infeasibility proofs.

### First Holy-aware profile

At the same distributed candidate, the selected route remained:

- Holy policy: `immediate`
- terminal HP: **7,083**
- minimum normalized HP margin: **0.1161665053**
- exact existence: **true**
- purchase 1-opt: **true**

However Holy policy seed coverage was only:

```text
optimized = 1 / 4
coverage = 25%
```

Only `immediate` had a feasible deterministic seed. The other three delayed policies were `uncovered`.

This is an **evidence gap**, not evidence that delayed Holy is impossible.

### Bounded purchase-prefix rescue

A bounded beam search over early explicit purchase prefixes was added for uncovered Holy policies.

At the distributed candidate, all three delayed policies remained uncovered after **252** rescue evaluations each. The rescue did not hit its configured 2,000-evaluation budget, so blindly raising that budget is not currently justified.

The proposal gate was therefore tightened:

```text
complete Holy coverage + local 1-opt for all modeled Holy policies
```

is now required for `ready_for_review`.

The same numeric candidate is consequently **blocked**, despite continuing to pass its numeric pressure, purchase robustness, and exact-existence checks.

## Holy-policy constrained Solver seed extraction

The next seed layer is now implemented in the repository:

- `src/solver/holy-policy-adapter.js`
- `src/analyzer/holy-policy-solver-seed.js`
- `scripts/analyze-holy-policy-solver-seeds.mjs`

The constrained Solver prevents Holy pickup before a requested policy trigger and requires Holy to have been acquired at the victory goal.

For each delayed policy it can distinguish:

1. policy feasible with an exact Solver certificate;
2. policy infeasible under the constrained Solver rules after exhaustive search;
3. feasibility unknown because the Solver budget was reached.

When a feasible certificate exists, its ordered shop choices are extracted and replayed through the deterministic runner. This separates two questions that must not be conflated:

- **Does some route exist under this Holy timing?**
- **Can the current greedy route model express a useful seed using only the certificate's shop sequence?**

The canonical-balance Solver-seed diagnostic is currently running in the dedicated `Adaptive Balance Profile`. Its result will determine whether the next bridge should be certificate-derived shop seeds or a richer certificate/event-order player policy.

## Current review status

The distributed three-lever values remain the strongest **numeric candidate** found so far, but current review status is:

```text
blocked
```

Reason: incomplete Holy best-response coverage.

`balance-proposal-v3.js` now requires:

- adaptive search converged;
- adapted route survives;
- final single-purchase neighborhood has no improving neighbor;
- complete Holy policy seed coverage;
- every covered Holy policy reaches purchase local-1opt;
- exact existence is proven;
- pressure is inside target band;
- recovery and catastrophic gates pass;
- all proposed edits are explicit finite numeric edits.

Even if all gates later pass:

```text
productionWriteAllowed = false
```

The production block remains until near-optimal/global exploit coverage is materially stronger and additional player-response axes are modeled.

## Next evidence required

1. Finish constrained-Solver feasibility diagnosis for all delayed Holy policies.
2. If Solver certificates are feasible and shop-plan replay works, use those plans as strong Holy seeds and re-run purchase 1-opt.
3. If Solver certificates are feasible but shop-only replay fails, add a richer event-order witness bridge rather than mislabeling the policy impossible.
4. After Holy coverage is resolved, expand player best response to optional enemy order/skip decisions.
5. Add semantic pickup logging so item parameters can participate in measured leverage ranking.
6. Extract a better epsilon-good route family from Pareto search so W/V can stop relying on the under-covered 36-policy portfolio.
