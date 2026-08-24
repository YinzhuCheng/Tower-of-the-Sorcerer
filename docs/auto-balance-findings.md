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

### Player-adaptive ray

After purchase-plan best response was put back into the loop, the ray automatically increased to:

- final ray strength: **0.6453125**
- bracket: `0.6388671875 .. 0.6453125`
- bracket width: **0.0064453125**
- observed best-response monotonicity violations: **0**

The concrete candidate edits are:

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

## Comparison

| Signal | Final-pressure concentration | Distributed 3-lever ray |
| --- | ---: | ---: |
| minimum HP margin | 16.57% | 11.62% |
| exact existence within current budget | no | **yes** |
| generated states | 50,000 cap | **13,665** |
| recovery rate | 93.33% | 93.33% |
| catastrophic rate | 6.67% | 6.67% |
| high-regret rate | 60.71% | **0%** |
| improving one-purchase neighbor | 0 | 0 |

The distributed candidate is therefore the current preferred **review candidate**. It reaches the desired pressure band while preserving much smoother local purchase regret and a substantially easier exact existence proof.

This does **not** mean the candidate is ready for unattended production deployment. Current W/V near-optimal strategy coverage is still insufficient, and player best response currently optimizes purchases only.

## Current review candidate status

`balance-proposal-v3.js` accepts arbitrary explicit numeric edits rather than being hard-coded to shop HP + final magic. A candidate can become `ready_for_review` only if:

- adaptive search converged;
- adapted route survives;
- final single-purchase neighborhood has no improving neighbor;
- exact existence is proven;
- pressure is inside the target band;
- recovery and catastrophic gates pass;
- all proposed edits are explicit finite numeric edits.

Even then:

```text
productionWriteAllowed = false
```

The production block remains until near-optimal/global exploit coverage is materially stronger.

## Next evidence required

1. Expand player best response beyond purchases: Holy timing, optional enemies, card-door spending, pickup timing, and cross-floor recovery.
2. Add semantic pickup logging so item parameters can participate in measured leverage ranking.
3. Extract a better epsilon-good route family from Pareto search so W/V can stop relying on the under-covered 36-policy portfolio.
4. Re-run the generic review candidate after each new player-response axis; if a new strategy exploits the candidate, the tuner must retarget before any production write is considered.
