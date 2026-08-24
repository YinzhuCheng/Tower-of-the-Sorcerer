# Player best-response model

This document records the player-side optimization model used by automatic balance tuning. It exists separately from the game-value mutation model because the two sides have different trust and complexity problems.

Status: 2026-08-25, `solver-phase1-pareto`.

## 1. Why a frozen player is not a valid balance oracle

If the game changes while the player route is held fixed, the tuner will overfit the frozen route. A player can respond to new numbers by changing:

- shop purchases;
- Holy acquisition timing;
- optional enemy order / skips;
- card-door spending;
- pickup timing;
- cross-floor recovery / backtracking.

Therefore every balance candidate must eventually be evaluated against a **best-response model**, not only against the route that generated the sensitivity signal.

The model is intentionally expanded one strategy axis at a time so each addition has an explicit witness representation, replay path, confidence statement, and computational budget.

## 2. Layer 1 — purchase-plan 1-opt

The first player-response axis is the ordered shop purchase sequence.

`optimizePurchasePlanLocally()` repeatedly enumerates every single purchase replacement (`ATK`, `DEF`, `HP`) around the current explicit plan, replays each candidate through the authoritative engine, accepts the strongest improving neighbor, and repeats until no one-purchase improvement remains or the configured pass budget is reached.

A result with `localOptimal=true` means:

> no single shop-purchase replacement around that explicit plan improves terminal HP under the same game values and Holy policy.

It does **not** mean global optimality over all purchase sequences or all player actions.

The promoted 26,041 HP route is a verified purchase 1-opt local optimum under `Holy=immediate`.

## 3. Layer 2 — Holy timing × purchase 1-opt

`HOLY_POLICIES` is a small discrete strategy axis:

```text
immediate
after-core-6
after-core-7
before-final
```

A correct Holy comparison cannot replay one fixed purchase plan under four timings and choose the best. A purchase plan that is feasible for one Holy timing may die under another timing even though a different purchase sequence would survive and outperform it.

The Holy-aware best response therefore solves:

```text
max over Holy policy
    local-1opt over purchase plan under that policy
```

This is implemented by `src/analyzer/holy-policy-best-response.js`.

### 3.1 Feasible seed portfolio

Purchase local search needs a feasible starting route. For each Holy policy we first try a cheap deterministic seed portfolio:

1. the nearest known plan for this Holy policy from a previous adaptive-ray sample, when available;
2. the promoted explicit purchase plan with the Holy policy swapped;
3. all canonical deterministic shop-cycle strategies already associated with that Holy policy.

All seeds are authoritative engine replays. The strongest feasible seed enters purchase 1-opt.

This is deliberately a **seed search**, not an infeasibility proof.

If no seed survives, the policy is reported as:

```text
status = uncovered
```

It must **not** be described as "proven impossible". An unmodeled purchase sequence or action order could still make that policy feasible.

### 3.2 Policy stability claim

For policies with a feasible seed, each purchase search must reach `localOptimal=true` before the Holy response is considered stable within the current model.

`stableWithinSeedPortfolio=true` means:

- at least one Holy policy produced a feasible optimized response;
- every Holy policy that received a feasible seed reached purchase 1-opt;
- the selected response has the highest terminal HP among those optimized responses.

It does not erase the `uncoveredPolicies` list. Seed coverage is reported separately.

### 3.3 Why policy plans are carried across ray samples

A balance ray changes continuously while the player response can jump at thresholds. Re-starting every Holy policy from the same baseline plan at every ray strength would waste computation and increase local-basin instability.

Each adaptive sample therefore stores the best explicit plan found for every optimized Holy policy. The next ray sample uses the nearest previously observed sample as the preferred seed set, while still retaining the promoted plan and canonical cycle portfolio as fallbacks.

This is continuation / warm-starting, not evidence reuse: every route is replayed again under the new numeric overlay.

## 4. Holy-aware adaptive numeric ray

`src/tuner/adaptive-numeric-ray-v2.js` extends the numeric adaptive loop.

At each ray strength:

```text
materialize explicit numeric edits
  -> apply synchronous balance overlay
  -> for each Holy policy:
       find feasible seed
       run purchase 1-opt
  -> select highest-terminal-HP Holy response
  -> measure pressure on that adapted route
  -> restore canonical game data
```

The outer ray search then moves harder or softer using the adapted pressure, not the protected-route pressure.

The response curve is not assumed smooth. The report records monotonicity violations if a stronger ray unexpectedly increases the best-response HP margin, for example because the selected Holy policy or purchase basin changes.

## 5. Final proof and robustness layers

After the adaptive ray selects its best observed target-band sample, the tuner separately runs:

1. authoritative replay of the selected Holy policy + explicit purchase plan;
2. independent exact-existence Solver search;
3. all one-purchase counterfactuals around the final selected plan.

The Holy-policy search itself is not used to prove exact existence.

The final hard checks now include:

- ray bracket found;
- pressure convergence;
- adapted route survives;
- final purchase plan is one-purchase stable;
- Holy policy response is stable within the feasible seed portfolio;
- exact existence is proven;
- pressure lies inside the target band;
- purchase-error recovery and catastrophic-rate gates pass.

`balance-proposal-v3.js` now requires Holy best-response evidence. A legacy purchase-only adaptive report can no longer receive the same `ready_for_review` status after the player model has been upgraded.

Production writes remain disabled even if all these checks pass.

## 6. Computational budget

Holy timing has only four discrete values, so exhaustive policy enumeration is appropriate. The expensive part is purchase local search inside each policy.

To keep ordinary development fast:

- pure ranking / gate semantics are unit-tested in normal CI;
- full `4 x purchase-1opt x ray-samples` optimization runs only in `Adaptive Balance Profile`;
- artifacts preserve full evidence; concise logs expose headline diagnostics;
- algorithms and confidence semantics live in repository source/docs, never only in CI artifacts.

## 7. Next player-response axes

The next axes should **not** be introduced as one giant Cartesian product. Each needs a local move generator and continuation strategy so the best-response search remains layered.

Recommended order:

### 7.1 Optional enemy order / skip decisions

Represent a local route policy as an explicit set/order of optional combat events. Introduce small mutations such as:

- skip one optional enemy;
- insert one reachable optional enemy;
- swap the order of two independent optional fights.

Use stable semantic event IDs before this enters the promotion gate.

### 7.2 Card-door spending

Card decisions are discrete resources with strong future coupling. Model one-card reassignment / door-choice counterfactuals rather than globally permuting all doors.

Hard requirement: replay must distinguish a genuinely optional door from a progression-critical door.

### 7.3 Pickup timing

First add semantic pickup logs. Only then optimize delayed/early pickup decisions. The current numeric lever screen intentionally refuses to invent item leverage without this instrumentation.

### 7.4 Cross-floor recovery

Compass travel creates a large action space. Reuse canonical travel and event-level state representation; optimize visits to productive events rather than raw movement paths.

## 8. Confidence vocabulary

Use these terms consistently:

- **authoritative replay** — the route was actually executed by `engine.js`;
- **purchase 1-opt** — no one-purchase replacement improves the current plan;
- **Holy stable within seed portfolio** — highest result across independently optimized seeded Holy policies;
- **uncovered Holy policy** — no deterministic feasible seed was found; not an infeasibility proof;
- **exact existence** — the Solver proved that at least one victory route exists;
- **global optimum** — only when the optimization search is mathematically closed; local player best response is never sufficient for this label.

These distinctions are part of the safety boundary of automatic level generation, not documentation niceties.
