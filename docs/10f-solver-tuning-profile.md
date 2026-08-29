# 10F topology-locked solver tuning profile

The 10F campaign topology is now deployed and is the only baseline for this
pass. The first solver pass tunes the game the player will actually play; it
does not resume roomization or reopen campaign structure.

## Immutable during this pass

- Core bearers and the `2 + 3 + 2` core distribution.
- F2 dual-key vault, F5 three-guardian stair, F7 four-guardian stair, F8
  optional vault, F9 stair seal and F10 Queen-to-Core finale.
- All key relics, cards, doors, switches, runes, stairs and guardian positions.
- The complete numeric records of critical guardians and the two final phases.

`src/tuner/demo-10-floor-solver-profile.js` captures these anchors before each
candidate replay and throws if a candidate changes one. A viable greedy replay
does not excuse an anchor violation.

## Mutable surface

The initial finite catalog allows only:

1. small `ATK` or fixed-magic deltas on named ordinary enemies;
2. swaps between named ordinary-enemy encounter slots on F7–F9;
3. swaps between named ordinary `ATK`/`DEF` reward slots on F7–F9.

It explicitly excludes boss/guardian deltas, cards, doors, runes, switches,
stairs, cross-floor exchanges and key-relic movement. The exact mutation IDs
are the reviewable whitelist in `DEMO10_SOLVER_TUNING_PROFILE`.

## Player and acceptance contract

`npm run tune:demo10:portfolio` evaluates every bounded candidate through the
authoritative engine using all six recurring shop builds. The release gate
requires 4–5 winning builds, F9 shop use, meaningful F8–F10 pressure, a
non-brittle weakest win and no overly forgiving best win. Guardian-first and
frozen no-HP routes remain diagnostic telemetry; they cannot silently rewrite
the release target.

The search is heuristic and has `productionWriteAllowed: false`. It returns a
ranked, replayable portfolio for human review; nothing is applied to game data
until a selected candidate also passes the full test suite, release validation,
build and browser/screenshot checks.
