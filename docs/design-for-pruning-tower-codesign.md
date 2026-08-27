# Tower–Solver co-design: design for pruning

Date: 2026-08-27

## Decision

We are **not** solving an arbitrary fixed tower first and only then asking whether it is fun.
We are the puzzle setter. The tower and the player-response solver are co-designed.

Approximate / heuristic search is allowed during generation. Exact or sound proof is reserved for final promotion.

The optimization problem therefore changes from:

```text
given tower T:
    prove best_route(T)
```

to:

```text
choose tower T:
    fun(T)
    difficulty(T)
    solvable_witness(T)
    prunability(T)
    proof_cost(T)
```

A tower that is fun but produces millions of nearly-equivalent route histories is an inferior generated puzzle when another small edit produces the same player experience with a much smaller proof frontier.

## Two trust levels

### Generation / exploration

Allowed:

- beam search;
- best-first heuristic search;
- weighted A*;
- MCTS;
- genetic / evolutionary mutation;
- simulated annealing;
- local neighborhood search;
- capped Pareto frontiers;
- approximate player best-response portfolios.

Minimum hard gate during generation:

```text
an authoritative replay-verified solvability witness exists
```

Generation-time `coverage-incomplete` is not a failure by itself.

### Promotion

Final candidates still require the repository's strict trust boundary:

- authoritative engine replay;
- exact or sound-over-approximation statements only;
- no `budget exhausted => infeasible` conversion;
- no heuristic prune promoted as proof;
- explicit event-order exploit replay;
- `productionWriteAllowed=false` until promotion gates pass.

## Controlled ambiguity, not a single forced path

The goal is not to collapse the game to one route.

At each semantic checkpoint we want roughly:

```text
2..8 meaningful Pareto-nondominated macro strategies
```

while eliminating hundreds of low-value permutations inside each macro strategy.

Examples of permutations that should usually collapse:

- collect safe reward A then B vs B then A;
- return to old floor 3 then 4 vs 4 then 3;
- buy an already-affordable fixed-policy upgrade now vs several events later;
- two histories that reach the same checkpoint with the same actionable choices and dominated resources.

Examples of meaningful choices that should remain:

- spend a card for a stat branch vs preserve it for a later shortcut;
- take a positive-damage optional reward now vs avoid the tax;
- ATK-oriented vs DEF/HP-oriented route that remains Pareto-nondominated at the next checkpoint.

## Prunability objective

`src/tuner/prunability-score.js` turns bounded search diagnostics into a design loss. Current axes include:

- Pareto width outside the desired 2..8 band;
- residual proof obligations;
- history inflation: many structural histories / few current action surfaces;
- teleport/backtrack permutation ratio;
- weak admissible-bound pruning;
- weak dominance pruning;
- search budget pressure.

This is a **design score**, not proof evidence.

A candidate can therefore beat another candidate because it has comparable difficulty/fun but is much easier for the solver to collapse.

## Setter-side mutation families

`src/tuner/proof-friendly-mutations.js` maps proof-hostility diagnostics to mutation families.

### 1. Checkpoint reconvergence

If many historical states expose the same small action surface:

- merge corridors before the next boss/core/shop;
- move non-decision pickups after the merge;
- canonicalize card inventory before the checkpoint;
- make zero-risk cleanup occur before the checkpoint.

### 2. Reduce cross-floor permutation

If teleport/backtracking dominates search:

- move old-floor rewards before Compass acquisition;
- delay Compass until after the relevant cleanup;
- gate late re-entry;
- convert scattered safe harvest into a checkpoint reward.

Do not globally remove backtracking; preserve it only where it creates a real strategic tradeoff.

### 3. Tighten optimistic slack by design

If the sound upper bound remains thousands of HP above the reference:

- put large HP behind unavoidable positive damage;
- reduce zero-damage Gold harvest;
- move HP behind a checkpoint tax;
- increase mandatory late damage while compensating earlier forgiveness if needed.

This makes whole families of branches provably irrelevant sooner.

### 4. Separate near-tie branches

If dozens of routes remain Pareto-nondominated by tiny margins, use small localized edits:

- enemy ATK/DEF/HP delta;
- branch reward delta;
- door/card cost delta;
- move a reward across the reconvergence point.

The intent is to make most branches strictly resource-dominated at the next checkpoint while keeping a small controlled Pareto set.

### 5. Canonical shop timing

If many routes differ only in when an already-affordable purchase occurs:

- place the shop at a semantic checkpoint;
- tune Gold thresholds so purchase count is nearly deterministic at checkpoints;
- reduce redundant shop access.

The actual game need not auto-buy. A proof sub-model may use monotone auto-purchase only when its assumptions are proven.

## Heuristic outer loop

`src/tuner/codesign-beam-search.js` implements the generic outer beam:

```text
seed tower(s)
    ↓
local mutations
    ↓
cheap/heuristic player model
    ↓
authoritative witness replay
    ↓
difficulty + fun + prunability score
    ↓
keep best K towers
    ↓
repeat
```

Only the final small portfolio receives expensive exact/sound validation.

A practical iteration is:

```text
for generation round:
    1. run heuristic player search; keep top K route families
    2. cluster routes at semantic checkpoints
    3. measure checkpoint Pareto width and history inflation
    4. diagnose why residual branches survive
    5. instantiate 20..100 local tower mutations
    6. reject candidates without replay-verified victory witness
    7. score difficulty/fun/prunability/edit distance
    8. keep beam of 4..12 candidates

periodically:
    run deeper bounded player response
    add any exploit routes to the counterexample bank

final portfolio:
    run sound bounds / staged exact proof / robustness gates
```

## Recommended target profile for generated towers

These are design targets, not proof axioms:

```text
checkpoint Pareto width             2..8
history/action-surface inflation    <= 4x preferred
cross-floor/travel generated ratio  <= 35% preferred
residual bridge obligations         <= 32 preferred
bound-prune rate                     >= 12% preferred in late search
catastrophic mistake rate            roughly 3..8%
terminal pressure                    8..25%
```

The targets can evolve from empirical data.

## Immediate implication for V3

The present V3 is useful as a diagnostic source, but it no longer deserves unlimited proof engineering.

Current evidence has already shown proof-hostile features:

- hundreds of c6 structural histories;
- a tiny number of immediate action surfaces relative to historical states;
- large cross-floor permutation cost;
- c7 bridges with very large optimistic HP slack;
- suffix searches spending thousands of expansions with almost no bound pruning.

Instead of proving this exact V3 at all costs, the next tuner generation should mutate V3 into **V4 proof-friendly candidates**. The solver is now an oracle that tells the setter *what to change in the tower*.

The first V4 neighborhood should prioritize:

1. checkpoint/shop timing canonicalization around F6/F7;
2. reducing old-floor zero-risk harvest permutations;
3. making F7/F8 large-HP rewards carry explicit unavoidable cost;
4. small branch cost/reward deltas that shrink checkpoint Pareto width;
5. preserving at least two meaningful macro route families.

No V4 edit should be written to canonical `src/game/data.js` until the candidate passes the usual promotion gates.
