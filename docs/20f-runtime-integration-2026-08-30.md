# 20F Runtime Integration — 2026-08-30

## What is now live

- F10 is an Act-I transition, not the ending: defeating `voidCore` restores
  the hero to `100/100 MP`, unlocks Magic Blade, and turns the core's arena
  tile into the only stair to F11.
- F11–F20 consume the accepted semantic and spatial topology records without
  moving a gate, key relic, Boss group, card payment, room plan, or stair.
- F15 is the sole Act-II shop.  It keeps the normal three conversion choices
  and adds explicit `mpRestore` and `maxMp` options; it does not create another
  shop floor.
- F20 has a true two-stage final: `arcaneSovereign` opens the sovereign seal;
  only `originCore` has `finalBoss` and can set `victory`.

## Freeze boundary

Before runtime code writes content it runs both topology validators.  The
following remain fixed for the numeric pass:

| Axis | Locked rule |
| --- | --- |
| Rooms | F11–F20 use the ten authored five-room plans unchanged. |
| Barriers | Every declared card/Boss barrier remains a true cut with its original protected target. |
| Boss cadence | F12/F14/F16/F17/F20 are clusters; F11/F13/F15/F18 stay bossless; F19 has its single stair guardian. |
| Economy | F5 and F15 are the only shop floors. |
| Critical content | MP relic IDs, locations, gate groups, final-phase IDs, and stair locations are immutable. |

## Numeric boundary

`src/game/demo-20-floor-content.js` owns the temporary playable table
`DEMO20_NUMERIC_BASELINE` and `DEMO20_MAGIC_RELIC_EFFECTS`.  It is intentionally
the only Act-II numeric surface.  It is **not** a difficulty certificate and no
solver/mutator result has been promoted from it yet.

The next pass must build an Act-II adapter around the real engine and mutate
only this table (and the two F15 MP option effects if necessary).  A candidate
may be promoted only after it:

1. Replays at least one complete 20F engine witness.
2. Preserves the static topology/card-state proofs exactly.
3. Treats heuristic route families as diagnostics, never as a requirement for
   release.
4. Uses mutation pressure to prune broad branches before an expensive exact
   search, while retaining a reproducible winning witness.
