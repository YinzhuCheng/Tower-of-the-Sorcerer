# Delayed-Holy boundary seed scheduling

Status: 2026-08-25, `solver-phase1-pareto`.

This note records the scheduling layer between the replay-verified F6/core5 boundary frontier and expensive no-Holy `core6` continuation searches. The scheduler is repository code, not VM scratch logic.

## Why scheduling exists

The shared delayed-Holy prefix already proves that F6/core5/no-Holy is reachable. A full diagnostic run produced thousands of authoritative replay-verified boundary states before the prefix frontier was complete.

The first staged proof used:

```text
boundary maxGoals = maxBoundarySeeds = 12
```

That means the prefix collector stopped as soon as the first 12 active boundary labels were discovered. Sorting those 12 afterward cannot recover resource families that were never discovered.

This is a discovery-order bias, not evidence about delayed-Holy feasibility.

The fix is to separate two budgets:

```text
boundaryDiscoveryGoals
    -> how many verified F6/core5 seeds to discover

maxBoundarySeeds
    -> how many expensive core6 continuations to attempt
```

Current profile default:

```text
boundaryDiscoveryGoals = 512
maxBoundarySeeds       = 12
```

A finite discovery pool remains incomplete coverage. It can prove existence if one scheduled chain succeeds, but it cannot prove infeasibility.

## Scheduler trust boundary

The scheduler is heuristic-only.

It MAY:

- rank replay-verified boundary seeds;
- reserve diversity anchors;
- choose which seed is attempted first under a bounded continuation budget.

It MUST NOT:

- delete a boundary state from the proof frontier;
- turn an unscheduled seed into a dominated seed;
- participate in a global exact-infeasibility claim;
- claim that optimistic shop reachability is a legal path witness.

Therefore:

```text
scheduler miss -> unknown
verified continuation success -> existence proof
```

Exact infeasibility still requires complete boundary coverage and exact failure from every relevant verified continuation.

## Boss-affordability relaxation

`src/analyzer/pre-holy-seed-scheduler.js` scores a verified seed against `astralBoss`.

The score performs a cheap optimistic relaxation:

1. read current HP / ATK / DEF / Gold and `shopPurchases` from the replayed seed;
2. compute how many future shop purchases are affordable under the canonical increasing-price rule;
3. enumerate all ATK / DEF / HP allocations for up to that purchase count;
4. evaluate `astralBoss` using the authoritative `engine.js::calculateBattle()` formula;
5. keep the allocation with the largest projected survival margin.

The relaxation intentionally assumes the affordable purchases can be made before the boss. That assumption is optimistic and may be false because of map/event accessibility. This is acceptable only because the value is used for ordering, never proof.

The scheduler records:

```text
optimisticBossMargin
optimisticWinnable
maxAffordablePurchases
optimisticAllocation
optimisticBattle
```

for every scheduled seed so CI can audit why it was selected.

## Diversity anchors

Pure affordability ranking can collapse onto many near-identical resource labels. Before filling by score, the scheduler reserves several orthogonal extremes when available:

- best optimistic boss margin;
- maximum current ATK;
- maximum current DEF;
- maximum current HP;
- maximum current Gold;
- minimum current `shopPurchases` index;
- maximum Star cards;
- maximum Moon cards.

Remaining slots are filled first by coarse resource-class diversity and then by pure affordability rank.

This is still only an attempt-order heuristic. Structural-key differences remain intact in the actual Solver frontier.

## Why the shop relaxation is useful

The sixth-floor boss is a normal deterministic combat breakpoint rather than a hidden stochastic system. A boundary state that looks weak in raw HP may be much stronger if it carries more Gold and a lower shop-purchase index; conversely, a state with high current HP may have already spent the cheap purchases.

Ranking by raw terminal HP or generic Tower priority therefore misses an important conversion channel:

```text
Gold + purchase index
    -> future ATK / DEF / HP allocation
    -> discrete boss rounds and damage
```

The relaxation captures that interaction while remaining cheap enough to evaluate hundreds of boundary seeds before launching exact continuations.

## Current staged proof shape

```text
start
  -> boundary discovery pool (F6/core5/no-Holy)
  -> authoritative replay of every emitted seed
  -> boss-affordability scheduling
  -> bounded exact core6 continuation attempts
  -> replayed core6 bridge, if found
  -> policy-specific constrained Solver
  -> Holy acquisition
  -> victory
```

Reports distinguish:

```text
boundary.seedCount
seedSchedule.candidateCount
seedSchedule.scheduledCount
core6.scheduledSeedCount
```

so discovery coverage and expensive continuation budget cannot be confused.

## Next decision rule

After the 512 -> 12 A/B profile:

- if a verified core6 bridge is found, continue immediately into all three delayed-Holy policy continuations;
- if no bridge is found but the scheduled seeds have materially stronger affordability scores than the old first-12 set, inspect continuation search telemetry before increasing budgets;
- if scheduled seeds still cluster in one resource family, improve diversity selection rather than widening raw search;
- if continuation expansions are dominated by shop-order permutations, add a continuation-specific shop macro/POR only after proving its equivalence conditions;
- status remains `unknown` until a verified success or exhaustive proof exists.
