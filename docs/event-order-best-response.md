# Event-order player best response

Status: 2026-08-25, `solver-phase1-pareto`.

This note defines the next player-response layer after purchase 1-opt and Holy-policy coverage. The purpose is to detect whether a balance candidate that looks fair under the deterministic runner becomes too easy when the player changes the order of legal map events.

## Why this layer is needed

The current review-ready numeric candidate passes:

- authoritative route replay;
- purchase one-step local optimality;
- complete Holy coverage (`1 optimized + 3 STATIC_CUT proven-infeasible`);
- exact existence;
- pressure and single-purchase robustness gates.

However `runGreedyShopStrategy()` still chooses map events with a deterministic priority: items, switches, doors, then low-damage non-boss enemies, then stairs. That ordering is a useful constructive route generator, not a best-response proof.

A stronger player may choose to:

- kill an optional enemy now, later, or never;
- collect a resource before or after another fight;
- spend a card on a different reachable door first;
- delay/advance puzzle progress;
- revisit an older floor before a later fight;
- change Holy's precise pickup position inside the only feasible `immediate` policy class.

A candidate must therefore be tested against event-order adaptation before production writes or topology mutation are considered safe.

## Fixed-purchase sub-problem

The first event-order layer deliberately holds the already optimized purchase policy fixed:

```text
shopPlan[p] ?? shopCycle[p mod cycle.length]
```

while allowing the Solver to choose every other canonical macro action.

Implementation:

- `src/solver/fixed-purchase-policy-adapter.js`
- `src/analyzer/event-order-best-response.js`
- `scripts/analyze-event-order-response.mjs`
- `src/tuner/review-candidates.js`

The persisted review candidate is evidence/configuration only. It does not modify `src/game/data.js`.

## What remains free

The fixed-purchase adapter removes only shop actions that disagree with the modeled purchase policy. It leaves untouched:

- enemy actions;
- items;
- doors and tri-gates;
- switches and rune sequence actions;
- stairs;
- Compass travel after canonical travel normalization;
- Holy pickup timing.

Therefore the optimize search is stronger than a hand-written optional-enemy swap neighborhood: one Solver run can discover mixed event-order exploits across several categories.

## Incumbent trust rule

The 7083-HP deterministic route is useful as a feasible lower bound, but only if its purchase policy exactly matches the fixed-purchase sub-problem.

`fixed-purchase-policy-adapter.js` therefore rejects an incumbent witness unless both arrays match exactly:

```text
witness.shopPlan  == fixed.shopPlan
witness.shopCycle == fixed.shopCycle
```

This check happens before the base Tower adapter verifies the witness. An otherwise legal route from a different purchase policy must never raise the branch-and-bound lower bound for this sub-problem.

## Evidence semantics

The analyzer reports one of four important statuses.

### `exploit-found`

The Solver found a terminal-HP goal strictly above the reference route and the generated certificate replayed successfully through the authoritative engine.

This is sufficient evidence that the current player model was under-optimized. It does **not** require queue exhaustion.

### `fixed-purchase-event-order-optimal`

Optimize mode exhausted the entire fixed-purchase event-order search and no better objective exists. This is an exact optimum only for this restricted purchase policy.

It is not a global player optimum because other purchase policies may still interact with event order.

### `coverage-incomplete`

No better replayable route was found before `maxExpanded` / `maxGenerated` stopped the search.

This means only:

```text
no exploit found within this proof budget
```

It must not be converted into an optimality claim or used to unlock unattended production writes.

### `candidate-snapshot-drift`

The repository-resident candidate no longer authoritative-replays to its expected reference HP. Search is aborted because the stored evidence is stale under the current rules/content.

## Holy timing interaction

The event-order Solver does not fix a micro-level Holy pickup step. The separate STATIC_CUT certificate proves that policies requiring Holy at core6 or later are impossible, but it does not imply that every legal pre-core6 pickup order has equal value.

Leaving Holy as an ordinary explicit Solver event correctly includes this remaining timing freedom in event-order best response.

## Why the purchase policy is fixed first

Searching purchase choices and all map-event permutations simultaneously is much larger. The staged response stack is intentionally incremental:

```text
purchase 1-opt
  -> Holy policy proof coverage
  -> fixed-purchase event-order optimize
  -> joint local purchase + event-order response
```

If fixed-purchase event order already finds a large exploit, there is no value in paying for a larger joint search before understanding and repairing that exploit.

## Production boundary

Even a completed fixed-purchase event-order optimum is not enough to enable production writes. The next review condition should require either:

1. no material exploit under a sufficiently strong event-order coverage run, followed by a joint purchase/event-order neighborhood; or
2. a discovered exploit to be fed back into the tuner as a new player witness and the candidate re-optimized.

`productionWriteAllowed=false` remains unchanged.
