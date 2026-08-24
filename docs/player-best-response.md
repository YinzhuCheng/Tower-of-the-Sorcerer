# Player best-response model

This document records the player-side optimization model used by automatic balance tuning. It exists separately from the game-value mutation model because the two sides have different trust and complexity problems.

Status: 2026-08-25, `solver-phase1-pareto`.

## 1. Why a frozen player is not a valid balance oracle

If the game changes while the player route is held fixed, the tuner will overfit the frozen route. A player can respond to new numbers by changing shop purchases, Holy timing, optional fights, card spending, pickup timing, or backtracking.

Every balance candidate must therefore be evaluated against an explicit **best-response model**. The model is expanded one strategy axis at a time so each axis has a replayable witness, confidence statement, and computational budget.

## 2. Layer 1 — purchase-plan 1-opt

`optimizePurchasePlanLocally()` enumerates all one-purchase replacements around the current explicit shop plan, authoritative-replays every candidate, accepts the strongest improving neighbor, and repeats.

`localOptimal=true` means only:

> no single shop-purchase replacement improves this plan under the same game values and Holy policy.

It is not a global purchase optimum and not a global player optimum.

The promoted 26,041 HP route is a verified purchase 1-opt local optimum under `Holy=immediate`.

## 3. Layer 2 — Holy timing × purchase 1-opt

Modeled Holy policies:

```text
immediate
after-core-6
after-core-7
before-final
```

The response objective is:

```text
max over Holy policy
    purchase local-1opt under that policy
```

A fixed purchase plan cannot be reused as the comparison itself: a plan that dies with delayed Holy does not prove that another purchase sequence could not survive.

Implementation: `src/analyzer/holy-policy-best-response.js`.

### 3.1 Feasible seed portfolio

For every Holy policy, first try authoritative deterministic seeds:

1. nearest known plan for that policy from a nearby adaptive-ray sample;
2. promoted explicit purchase plan with the policy swapped;
3. canonical deterministic shop cycles associated with that policy.

The best feasible seed enters purchase 1-opt.

### 3.2 Purchase-prefix rescue beam

If the deterministic seed portfolio has no survivor, `src/analyzer/purchase-prefix-rescue.js` runs a bounded beam search over **early explicit shop-purchase prefixes**.

The rescue search:

- keeps the Holy policy fixed;
- retains a fallback shop cycle;
- expands `ATK / DEF / HP` only when the failed route actually reached the next purchase slot;
- ranks failed routes by strategic progress before residual HP (`cores`, Holy acquisition, battles, floor, purchases, etc.);
- stops on the first beam depth that yields a feasible route, or at configured depth/evaluation bounds.

The rescue exists only to create a feasible local-search seed. It is **not** an infeasibility proof and does not replace purchase 1-opt.

A rescue failure remains:

```text
status = uncovered
```

not “policy impossible”.

### 3.3 Coverage semantics

Two different stability concepts are reported:

- `stableWithinSeedPortfolio`: every Holy policy that received a feasible seed reached purchase 1-opt, and the selected response is best among those optimized policies.
- `stableWithCompleteCoverage`: all modeled Holy policies received feasible seeds **and** all reached purchase 1-opt.

The first is useful diagnostic evidence. The second is now required for `ready_for_review`.

A 1/4 policy coverage result is therefore allowed to guide search, but it cannot pass the review gate.

### 3.4 Warm starts across ray samples

Each adaptive sample stores the best explicit purchase plan found for each optimized Holy policy. The next ray sample uses plans from the nearest known ray strength as preferred seeds, while retaining promoted/cycle fallbacks and rescue search.

This is computational continuation only. Every route is replayed under the new overlay.

## 4. Holy-aware adaptive numeric ray

`adaptive-numeric-ray-v2.js` performs the Holy-aware player search at each numeric ray strength.

`adaptive-numeric-ray-v3.js` adds the stricter evidence rule: complete Holy seed coverage is required before the adaptive report can satisfy the Holy hard check.

At one sampled ray strength:

```text
materialize numeric edits
  -> apply synchronous overlay
  -> for each Holy policy
       deterministic seed portfolio
       -> bounded purchase-prefix rescue if needed
       -> purchase 1-opt if feasible
  -> choose highest-terminal-HP policy response
  -> measure adapted pressure
  -> restore canonical data
```

The outer ray search moves harder/softer using the **adapted** pressure.

Player-response curves are not assumed smooth. Policy changes or purchase thresholds can create discontinuities, so monotonicity violations are reported explicitly.

## 5. Final proof and robustness

After selecting a target-band sample, the tuner separately runs:

1. authoritative replay of selected Holy policy + explicit purchase plan;
2. independent exact-existence Solver search;
3. all one-purchase counterfactuals around the selected final plan.

Current adaptive hard checks include:

- ray bracket found;
- pressure convergence;
- adapted route survives;
- final purchase plan is one-purchase stable;
- **complete Holy policy seed coverage + local-1opt stability**;
- exact existence;
- pressure target;
- recovery and catastrophic-error gates.

`balance-proposal-v3.js` independently re-checks complete Holy coverage. A stale purchase-only or 25%-coverage report is blocked even if its numeric pressure looks attractive.

Production writes remain disabled.

## 6. Computational budget

Holy has only four discrete values, so exhaustive policy enumeration is reasonable. Rescue beam + purchase local search is expensive, so it lives only in `Adaptive Balance Profile`.

Normal CI tests:

- response ranking semantics;
- complete-coverage gate semantics;
- rescue ranking/boundary behavior;
- other pure safety invariants.

Heavy engine replay stays out of ordinary unit CI.

## 7. Next player-response axes

Do not add future axes as one Cartesian product. Each should get a local move generator and warm-start strategy.

### 7.1 Optional enemy order / skip decisions

Use stable semantic event IDs and local moves such as skip/insert one optional fight or swap independent fights.

### 7.2 Card-door spending

Model one-card reassignment / door-choice changes rather than permuting every door globally. Progress-critical versus optional doors must be distinguished by replay/topology evidence.

### 7.3 Pickup timing

Add semantic pickup logging first. Only then optimize early/delayed pickups or use item pickups for measured leverage ranking.

### 7.4 Cross-floor recovery

Optimize productive semantic events rather than raw compass movement paths. Reuse canonical travel and event-level state representation.

## 8. Confidence vocabulary

- **authoritative replay** — executed by `engine.js`.
- **purchase 1-opt** — no one-purchase replacement improves current plan.
- **Holy stable within seed portfolio** — best among seeded policies after local search.
- **complete Holy coverage** — all modeled Holy policies obtained feasible seeds.
- **uncovered Holy policy** — deterministic + bounded rescue found no seed; not an infeasibility proof.
- **exact existence** — Solver proved at least one victory route.
- **global optimum** — only after mathematical optimization closure; never inferred from local best response.

These distinctions are part of the safety boundary of automatic generation, not merely terminology.
