# Automatic balance architecture

This document records the durable design decisions behind the solver-driven balance work. The VM, CI logs, and one-off profile artifacts are **not** authoritative design storage. Any assumption or algorithm that affects future tuning must live in `docs/`, `src/`, or tests in this repository.

Status: 2026-08-25, on `solver-phase1-pareto`.

## 1. Non-negotiable trust boundaries

1. `src/game/engine.js` remains the authoritative transition system.
2. A heuristic route, policy portfolio, local search, or finite-difference probe is never allowed to prove solvability or optimality by itself.
3. Hard constraints are evaluated before optimization score.
4. A numeric lower bound cannot prune the exact optimizer unless it comes from an engine-replayed witness or a goal found by the search itself.
5. Temporary balance candidates use `withBalanceEdits()` and must restore canonical data after synchronous evaluation.
6. Automatic production writes remain disabled until a promotion gate explicitly permits them. Current `balance-proposal-v2` still emits review-only proposals.

The intended trust ladder is:

```text
cheap trace heuristic
  < authoritative route replay
  < authoritative counterfactual replay
  < exact existence Solver proof
  < exhausted optimize proof / verified global bound
```

Higher-cost stages may reject a lower-cost candidate. Lower-cost stages may only shortlist work for higher-cost stages.

## 2. Why the player must adapt while the game adapts

A balance optimizer that changes game numbers against one frozen route will overfit that route. The player may respond by changing shop purchases, Holy timing, optional fights, card use, or backtracking, making the supposedly difficult candidate easy again.

The current numeric loop therefore models a best response:

```text
candidate balance values
  -> authoritative player route
  -> local purchase-plan improvement
  -> observe new bottleneck state
  -> retarget balance value
  -> repeat to a fixed point
  -> exact existence proof
  -> single-error counterfactuals
  -> promotion gate
```

`adaptive-final-pressure.js` is the first concrete version. It currently co-optimizes shop HP reward and final `voidCore.magicPower`, while the player responds with authoritative 1-opt purchase-plan search.

This is intentionally narrow. It proves the architecture before expanding the strategy response to doors, optional enemies, pickup timing, Holy timing, and inter-floor recovery.

## 3. Important empirical findings that changed the design

### 3.1 The original 12,536 HP route was not locally optimal

The first engine-verified policy portfolio found a 12,536 HP terminal route. Exhaustive one-purchase counterfactuals showed many single edits improved it, so the portfolio route could not be treated as a strong incumbent.

Repeated 1-opt local search converged to the promoted best-known plan:

```text
DEF x4 -> HP x15 -> ATK x1 -> HP x10
```

Terminal HP: **26,041**.

All 60 one-purchase neighbors of that 30-purchase plan were replayed. None improves terminal HP, so it is a verified **1-opt local optimum**, not a claimed global optimum.

This distinction is encoded in tests and in the promotion gate.

### 3.2 Shop HP reward alone cannot reach the pressure target

The protected 26,041 route was replayed with shop HP reward reduced from `+900` to values down to `+90`. Every tested candidate still had an exact existence proof. Even `+90` left roughly 46% normalized HP margin at the tightest battle, above the current target band of 8%-25%.

Conclusion: repeatedly turning the same HP-shop knob is not a useful search strategy. The tuner needs multi-parameter leverage discovery.

### 3.3 Near-optimal diversity claims are currently under-covered

The original 36 policy-family portfolio is far below the 26,041 promoted route. It remains useful as a coarse behavior sample, but it is not sufficiently close to the current best-known route to support strong W/V claims about the near-optimal solution family.

Until the exact/near-optimal search can extract a better solution family, W/V must remain lower-confidence than P and single-purchase R/T/F.

## 4. Difficulty signals used by the numeric tuner

Current target bands:

| Signal | Target / gate |
| --- | --- |
| minimum normalized HP margin | 0.08-0.25 |
| single-purchase high-regret rate | provisional 0.08-0.30 |
| catastrophic single-purchase rate | <= 0.10 |
| single-purchase recovery rate | >= 0.60 |
| exact existence | required |
| adaptive route solvable | required |
| player one-purchase stability | required before review |

Pressure is measured from authoritative battle traces, not from terminal HP alone.

Single-purchase R/T/F is stronger evidence than the old policy-family proxy because every alternative purchase is actually replayed through the engine.

## 5. Promotion gate

`balance-proposal-v2.js` is intentionally stricter than the candidate score.

A candidate is blocked unless all required checks pass, including:

- adaptive balance loop converged;
- adapted route survives;
- independent Solver returns exact existence;
- pressure is inside the target band;
- recovery and catastrophic-error gates pass;
- no one-purchase neighbor improves the adapted player response.

Even a passing proposal remains `productionWriteAllowed = false` today. Passing means **ready for review**, not "automatically modify data.js".

The next eventual production-write gate should additionally require stronger near-optimal strategy coverage or an exact optimization proof appropriate to the edited objective.

## 6. General numeric mutation space

`numeric-mutation-space.js` is the canonical whitelist for numeric edits.

Currently included:

- enemy `hp`, `atk`, `def`, `gold`, `magicPower`;
- stat-item `hp/maxHp`, `atk`, `def`;
- shop effect `hp/maxHp`, `atk`, `def`.

Semantic coupling is explicit. For example, an HP potion or HP shop option changes `hp` and `maxHp` together rather than allowing a generic object walker to split them accidentally.

Currently excluded on purpose:

- map topology and coordinates;
- card counts and door requirements;
- relic semantics;
- Boss reward objects;
- puzzle rules;
- save/schema versions.

Those are not "just more numeric fields". They require separate invariants and eventually semantic event IDs.

## 7. Two-stage leverage screening

Trying exact adaptive evaluation on every numeric field would multiply search cost unnecessarily. The general tuner therefore uses two screening stages.

### Stage A — trace ranking

`rankTraceNumericParameters()` scores the full mutation catalogue from already available authoritative traces.

Examples:

- enemy parameters receive leverage only if that enemy appears in the representative battle log;
- tighter and more damaging battles receive more weight;
- shop parameters are weighted by how often the representative plan buys that option;
- item parameters stay `catalog-only` until the runner exposes a semantic pickup log.

This score is **only a work-priority heuristic**.

### Stage B — authoritative finite difference

`screenNumericLevers()` takes only the Top-K trace parameters, applies a small "harder" mutation through `withBalanceEdits()`, and replays the same protected route through the authoritative engine.

It measures:

- change in minimum normalized HP margin;
- change in distance to the pressure target band;
- terminal HP change;
- pressure sensitivity per relative edit;
- whether the probe causes a solvability cliff.

The result is still `publishable: false`. It is a shortlist for expensive evaluation, not a final balance proposal.

This separation gives us a computational budget:

```text
hundreds of catalogue fields
  -> tens of trace-ranked fields
  -> ~10 authoritative finite differences
  -> a few adaptive-player candidates
  -> exact proof / robustness gates
```

## 8. Direction semantics

For the current goal of increasing difficulty:

- enemy HP / ATK / DEF / magicPower: increase;
- enemy gold: decrease;
- item stat supply: decrease;
- shop stat supply: decrease.

The direction is metadata in the mutation catalogue and is covered by tests. A future objective may request `softer`, which reverses the direction without changing field semantics.

## 9. What remains before structural generation

### Player best-response expansion

Purchase 1-opt is not enough for general level generation. Next strategy axes:

1. Holy acquisition timing;
2. optional enemy order / skip decisions;
3. card-door spending;
4. optional pickup timing;
5. inter-floor backtracking and resource recovery.

Each new axis needs a reproducible witness format and authoritative replay before it can enter the promotion gate.

### Better item instrumentation

The numeric catalogue already includes stat items, but the sensitivity screen deliberately gives them no fabricated trace leverage. Add semantic pickup IDs to the deterministic runner before using item parameters for Top-K ranking.

### Near-optimal solution families

Extract epsilon-good solution families from the Pareto search so W/V no longer depend on a policy portfolio whose best member is far below the promoted route.

### Structural mutation

Only after the numeric loop is stable should the generator mutate:

- enemy counts/locations;
- item/card locations;
- door locations or requirements;
- local puzzle structure;
- corridor/topology edits.

Structural mutation must use stable semantic event IDs and must run topology/softlock invariants before Solver evaluation.

## 10. Repository durability rule

For this project, intermediate research is considered durable if it changes one of:

- a safety invariant;
- a search/pruning rule;
- a difficulty metric;
- a promotion criterion;
- a mutation-space boundary;
- an empirical conclusion that redirects the search strategy.

Durable research must be committed to the repository as documentation, code, or a regression test. CI artifacts are evidence, but not the only copy of an algorithm or design decision.
