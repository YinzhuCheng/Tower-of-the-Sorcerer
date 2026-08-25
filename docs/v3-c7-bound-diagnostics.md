# V3 c7 fixed-purchase upper-bound diagnostics

## Purpose

Representative V3 c7 bridges still carry admissible terminal-HP upper bounds between 4729 and 4930 while the current reference threshold is 4459. Before spending another large suffix wave, we need to understand where that 270..471 HP proof slack comes from.

This diagnostic explains the **existing** fixed-purchase proof bound. It does not replace, weaken, or tighten the bound by itself.

## Cross-checked reconstruction

`explainFixedPurchaseTerminalHpUpperBound()` independently reconstructs the same relaxation from the adapter's materialized remaining map:

- all remaining positive HP/ATK/DEF rewards are credited for free;
- current + free item Gold is available immediately;
- every remaining enemy's Gold is available with optimistic Lucky timing;
- the exact fixed future shop sequence is respected;
- only as many purchases as optimistic total Gold can fund are considered;
- required enemy Gold pays a fractional-knapsack lower bound on harvest combat damage;
- harvest combat uses maximum optimistic future ATK/DEF;
- Ward/Holy use the same optimistic availability rules as the proof bound;
- final-boss damage uses the same optimistic final combat calculation.

The diagnostic computes every candidate future purchase count and selects the maximum terminal-HP relaxation exactly like the proof bound.

Crucially, it then requires:

```text
explainedUpperBound == adapter.objectiveUpperBound(state)
```

within numerical tolerance. A mismatch throws and invalidates the diagnostic instead of emitting potentially stale proof explanations.

The real Tower initial state is covered by a regression test, in addition to representative c7 bridge reports.

## Representative c7 states

From one 32-goal threshold-relevant c7 frontier the analyzer selects, without pruning anything:

1. `p21-max-upper` — highest proof upper bound among p21 states;
2. `p21-min-upper` — lowest proof upper bound among p21 states;
3. `p21-card-rich` — largest retained card count among p21 states;
4. `p20-high-gold` — highest retained Gold in the purchase-lag p20 stratum.

Roles that resolve to the same bridge are deduplicated.

For every representative the report records:

```text
current HP / Gold / cards / purchases
proof upper bound and threshold slack
remaining free HP / ATK / DEF credits
remaining item and enemy Gold
optimistic additional fixed purchases
best purchase-count scenario
required enemy Gold
fractional harvest damage lower bound
final-boss damage lower bound
HP before final fight
```

## Decision rule for the next algorithm

The decomposition is intended to choose between two directions.

### Bound-relaxation dominated slack

If the best scenario's excess over 4459 is mostly caused by a specific optimistic credit that can be constrained with a sound static/resource argument, implement that tighter admissible bound first. A proof-level improvement helps every structural/card bridge simultaneously.

### Structurally irreducible slack

If the bound is already mostly explained by legitimately available HP/Gold/purchases and combat lower bounds, do not tighten it heuristically. Instead spend the next existence-hunt budget on a resource/card-diverse p21 bridge portfolio from the expanded frontier.

No result from this diagnostic changes `productionWriteAllowed=false` or V3's current `eventOrderBestResponse` blocker.
