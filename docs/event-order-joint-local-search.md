# Joint event-order + purchase local response

Status: 2026-08-25, `solver-phase1-pareto`.

After the staged event-order proof found a 7,187-HP route, the next player-response layer keeps that event/action order fixed and re-optimizes its existing shop choices.

## Neighborhood

The event-order witness currently contains 241 replayable action steps, including 29 shop purchases. One local move is:

```text
choose one existing shop step
  -> replace its option with one of the other two choices
  -> replay the entire 241-step route through engine.js
```

All 2×29 one-step neighbors are tested each pass. If any legal neighbor has higher terminal HP, the strongest improving neighbor is accepted and the full neighborhood is tested again. Search stops when no one-shop substitution improves terminal HP or when the configured pass cap is reached.

Implementation:

- `src/analyzer/event-order-purchase-local-search.js`
- `src/analyzer/event-order-joint-best-response.js`
- `scripts/analyze-event-order-core-transition-chain.mjs`

## Why this is stronger than the earlier purchase 1-opt

The earlier 7,083 purchase local optimum was evaluated under the deterministic greedy event order. The 7,187 exploit proves that event order changes the resource trajectory. A purchase choice that was locally optimal under the old trajectory need not remain locally optimal after fights, pickups and backtracking are reordered.

Therefore the correct hierarchy is:

```text
greedy event order + purchase 1-opt
    < fixed improved event order + purchase 1-opt
    < joint event-order/purchase search
```

The current layer reaches only the middle level.

## Soundness and confidence

Every neighbor is a complete canonical-engine replay. A mutation is rejected if any later path, fight or purchase becomes illegal.

`localOptimal=true` means only:

> no single replacement among the witness's existing shop purchases improves terminal HP while the event order is held fixed.

It does NOT cover:

- inserting an additional purchase;
- deleting a purchase;
- moving a purchase to a different shop visit;
- changing event order again after a purchase mutation;
- multi-purchase changes that require crossing a worsening intermediate state.

Those remain later player-response axes.

## Tuner use

Once this local search stabilizes, its best step skeleton becomes the preferred warm-start route for the next numeric-ray tuning iteration. The tuner should evaluate both its existing Holy/purchase response and this stronger event-order witness under each numeric overlay, then optimize against the stronger legal player response.

## Production boundary

This layer improves the player oracle only. It does not authorize writing balance values into canonical game data.

```text
productionWriteAllowed = false
```
