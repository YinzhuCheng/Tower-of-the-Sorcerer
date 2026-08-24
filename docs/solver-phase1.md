# Solver Phase 1 — Macro-event Pareto oracle

This phase adds the first executable solver foundation described by the 2026-08-25 research pack. It intentionally does **not** change combat, map, item, shop, puzzle, save, or rendering rules.

## Architecture

- `src/solver/search.js`: generic multi-label graph search.
- `src/solver/frontier.js`: Pareto antichain per structural key `K`.
- `src/solver/state.js`: deterministic structural serialization/checksums and resource comparisons.
- `src/solver/tower-adapter.js`: current Tower mechanics adapter. All irreversible actions are executed through the canonical `engine.js` functions.
- `src/solver/replay.js`: replays a winning certificate through the canonical engine and checks every resource/structural snapshot.
- `scripts/analyze-game.mjs`: CLI for existence or terminal-HP optimization runs.

## Current structural key

The compatibility adapter uses a deliberately conservative `K`:

- current floor and zero-cost reachable component signature;
- all mutable floor maps;
- switch sets and rune sequence progress;
- boss-defeated flags;
- relic ownership;
- cores, shop purchase count and visited floors;
- victory state.

This is larger than the eventual compact bitset representation, but it is safe: variables are only projected out when they do not affect future legality/cost/reward.

## Resource label

`R = (HP, MaxHP, ATK, DEF, Gold, Sun, Moon, Star)`.

All coordinates are monotone-more-is-better under current mechanics, so componentwise Pareto dominance is valid for equal `K`.

## Safe normalization

The adapter automatically collects only the current whitelist of reachable zero-cost, order-safe monotone items and activates zero-cost monotone switches. `Holy` is **not** in that whitelist: the multiplier is a strategic timing event because later shop HP or other additive HP can make delaying it better. Unknown future item kinds also remain explicit until their commutation proof is documented.

It never auto-executes `Holy`, enemies, card doors, tri-gates, rune choices, shop purchases, stairs, or teleports.

## Exactness semantics

- Existence mode: one authoritative replayable winning certificate is a complete proof of solvability.
- Optimize mode: terminal HP is only marked exact after the search frontier is exhausted. If a state/generation limit is hit, the report explicitly says `exact: false`.
- No heuristic search priority is treated as a proof bound.

## Event IDs

The compatibility adapter currently derives provisional IDs from floor/token/coordinate. These are sufficient for same-version replay, but they are **not yet** the stable semantic IDs required for map-edit-resistant certificates. Before placement/topology generation is enabled, event identity will move into canonical content data and remain stable when coordinates change.

## CLI

```bash
node scripts/analyze-game.mjs --mode=existence --max-expanded=100000
node scripts/analyze-game.mjs --mode=optimize --max-expanded=250000 --json
```

The existing `scripts/validate-game.mjs` remains unchanged as the fast greedy regression/incumbent path.

## Next phase

1. Run the oracle on the full 8-floor baseline and profile frontier growth.
2. Replace conservative full-map structural serialization with stable event bitsets and canonical semantic event IDs.
3. Add safe resource/card/breakpoint bounds and partial-order reduction.
4. Extract epsilon-near-optimal route families and the `P/R/W/T/F/V/K/C` analyzer.
5. Only then expose numeric/placement mutations to an outer optimizer.
