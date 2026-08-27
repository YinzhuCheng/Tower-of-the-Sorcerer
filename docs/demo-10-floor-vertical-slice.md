# 10-floor playable demo vertical slice

Branch: `demo-10-floor-codesign`

This branch prioritizes a playable product slice over proving the old eight-floor candidate globally optimal.

## Content boundary

- F1-F7: retain the established seven-core campaign and mechanics.
- F8 `静默前庭`: two-switch palace checkpoint + outer-court boss.
- F9 `倒悬星桥`: ordered rune checkpoint + pre-throne boss.
- F10 `无声王座`: existing Queen -> voidCore final battle, moved intact from the former F8.
- Exactly seven magic cores remain in the game; F8/F9 bosses do not grant cores.

The browser applies the 10F content overlay before creating the first authoritative engine state. Node Solver/test imports retain the eight-floor research baseline unless they explicitly apply the demo overlay. This lets the playable demo move quickly without invalidating the existing proof/witness corpus in the same change set.

## Validation contract

`npm run validate:demo10` is a generation-time solvability check, not an optimality proof. It:

1. applies the 10F content overlay;
2. runs several deterministic heuristic shop policies;
3. executes every movement, door, puzzle, shop and battle through `engine.js`;
4. requires at least one victory witness on floor 10 with seven recovered cores and positive HP.

The demo may use heuristic/approximate player models. Final promotion still requires stronger replay/proof gates later.

## Co-design target

The next balancing loop should optimize the tower as a puzzle-setter problem:

- preserve a replayable completion witness;
- target roughly 2-8 meaningful Pareto strategies at major checkpoints;
- penalize large history-only frontiers and cross-floor micro-order permutations;
- relocate pressure to optional branch guards when that improves dominance/bound pruning;
- use beam search / bounded best-response for generation, then spend exact Solver budget only on shortlisted candidates.

## Known intentional debt

- F8/F9 reuse existing art portraits for the first demo; unique enemy art is a later polish task.
- 10F balance is initially tuned for playability, not final difficulty.
- Browser demo saves are structurally incompatible with old 8F saves because the floor-state count differs; the engine rejects incompatible state shapes.
- The old eight-floor Solver corpus remains a research baseline until a dedicated 10F proof model is promoted.
