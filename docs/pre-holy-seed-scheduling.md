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

The v0.4 decomposition is:

```text
start
  -> boundary discovery pool (F6/core5/no-Holy)
  -> authoritative replay of every emitted seed
  -> boss-affordability scheduling
  -> preBoss: make astralBoss a legal combat action
  -> authoritative replayed preBoss bridge
  -> core6: defeat astralBoss without Holy
  -> authoritative replayed core6 bridge
  -> policy-specific constrained Solver
  -> Holy acquisition
  -> victory
```

Reports distinguish:

```text
boundary.seedCount
seedSchedule.candidateCount
seedSchedule.scheduledCount
preBoss.reached
core6.reached
core6.scheduledSeedCount
```

so discovery coverage, preparation reachability, boss transition and expensive continuation budget cannot be confused.

## 512 -> 12 A/B result

The first affordability-scheduled profile discovered and replay-verified 512 F6/core5 seeds, then attempted 12 continuations.

The scheduler materially improved the attempted resource pool. Examples included:

```text
HP 1364 / ATK 104 / DEF 100 / Gold 2903 / optimistic boss margin 10646
HP 1076 / ATK 104 / DEF 100 / Gold 3043 / optimistic boss margin 10358
```

The previous first-goal schedule was concentrated around lower-Gold entries such as 2375–2667 Gold. Therefore discovery-order bias was real and the scheduler is retained.

However, no verified core6 bridge was found at `4000 expanded / 40000 generated` per seed. The correct conclusion remains:

```text
core6 reachability = unknown
```

not infeasible.

## Continuation queue diagnosis

Per-seed continuation telemetry showed another stronger bottleneck. Before floor-neutral priority, typical 4000-state runs generated roughly:

```text
teleport = 16k–18k
enemy    = 2k–4k
door     = 0.6k–2.1k
U        = 2k–3k
shop     = effectively absent from the expanded region
```

This was inconsistent with the scheduler relaxation: the selected seeds often have enough Gold that one or a few legal purchases would make astralBoss affordable, yet the bounded search rarely reached shop actions.

The cause was queue ordering. Generic Tower priority contains:

```text
floor * 1e10
```

which is appropriate for ordinary upward progress. After the F6/core5 boundary, however, a delayed-Holy route may have to travel down to an already visited shop or remaining resource before returning to F6. Those downward states lose the large floor bonus and were systematically postponed behind F6-local permutations.

## Continuation priority v1

`src/solver/pre-holy-stage-adapter.js` now uses a stage-specific queue priority for `preBoss/core6` while `cores == 5`:

- floor is intentionally removed from the ordering signal;
- equal-resource free travel therefore competes on equal priority regardless of floor;
- HP / ATK / DEF / Gold improvements increase queue priority;
- reaching core6 returns to the normal higher-core priority naturally.

This is another ordering-only change:

```text
no action removed
no frontier key changed
no dominance rule changed
no feasibility bound added
```

Therefore a miss remains `unknown`; only a replay-verified certificate proves success.

### Floor-neutral A/B result

With the same 512 -> 12 schedule and the same `4000 expanded` continuation cap, shop actions finally entered the expanded region:

```text
shop = 42–717 generated actions per scheduled seed
```

Teleport generation fell to roughly:

```text
7.9k–10.2k per seed
```

for most scheduled seeds, compared with the previous ~16k–18k range. The most shop-heavy scheduled continuation produced:

```text
shop     = 717
teleport = 9917
U        = 3776
enemy    = 974
door     = 1580
```

No core6 bridge was found at the same cap. This result is still useful: the previous floor-starvation diagnosis was correct, but the remaining problem is now inside preparation-state search rather than inability to descend to shops at all.

## Why v0.4 adds a preBoss bridge

The direct `core6` stage bundled two logically distinct questions:

1. can the current F6/core5/no-Holy state be prepared until astralBoss becomes a legal combat action?
2. once legal, can the authoritative boss transition produce core6?

For existence proof, the first question is the expensive one. The second should be a short deterministic continuation. Keeping them under one 4000-state target obscures where the search fails and may postpone a boss-ready state before it is popped as part of the broader core6 queue.

v0.4 therefore makes `preBoss` an explicit certificate boundary. Every successful chain is:

```text
boundary certificate
  -> replayed boundary state
  -> preBoss certificate
  -> replayed preBoss state
  -> short core6 certificate
  -> replayed core6 state
```

No bridge is reconstructed from lossy resource summaries.

## Next decision rule

After the v0.4 preBoss/core6 A/B profile:

- if `preBoss=true` and `core6=true`, continue immediately into all three delayed-Holy policy continuations;
- if `preBoss=true` but `core6=false`, inspect only the short Boss transition because preparation has been proven;
- if `preBoss=false` but shop actions remain visible, use scheduler data only as a queue hint for purchase-option ordering; never treat its optimistic allocation as a legal witness;
- if teleport remains dominant despite floor-neutral ordering, move toward a continuation-specific cross-floor free-movement quotient rather than history-dependent travel pruning;
- if a policy continuation succeeds, feed its certificate/shop plan back into the Holy-policy best-response portfolio;
- status remains `unknown` until a verified success or exhaustive proof exists.
