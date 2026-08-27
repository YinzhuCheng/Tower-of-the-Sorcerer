# 10F Demo v1 quality baseline — 2026-08-27

This document freezes the first product-facing quality baseline for the ten-floor vertical slice.

Validated gameplay head: `984e6bae674c0f3b9eca1a8d88d34b0822ca5d2e`.

The target is a **playable and tunable demo**, not an exact global-optimality claim. `src/game/engine.js` remains the only authoritative transition system.

## Product structure

| Floor | Role | Main decision surface |
| --- | --- | --- |
| F1–F7 | Existing seven-core campaign | fixed-number combat, cards, relics, puzzles, shop timing |
| F8 静默前庭 | palace outer checkpoint | two switches, side-resource cost, physical/first-strike/magic pressure |
| F9 倒悬星桥 | pre-throne build checkpoint | ordered runes, late shop conversion, high magic boss pressure |
| F10 无声王座 | final checkpoint | finalQueen → voidCore terminal fight |

There are still exactly **seven recoverable magic cores**. F8/F9 bosses are palace defenses and do not add cores.

## Automated late-game tuning

`npm run tune:demo10:late` scans F8/F9 boss magic-pressure pairs against all six recurring ATK/DEF/HP shop permutations.

The selected and independently re-recommended v1 pair is:

```text
F8  palaceWarden.magicPower       = 240
F9  blackSealKeeper.magicPower    = 270
```

The tuner reported:

```text
valid candidate             true
quality violations          0
solvable simple builds      4 / 6
terminal HP spread          2352
best winning margin         36.47%
weakest winning margin       7.35%
F8 boss mean margin         54.94%
F9 boss mean margin         23.13%
F10 mean margin             49.84%
F9 shop coverage           100.00%
```

The quality model is intentionally not a single terminal-HP objective. It simultaneously constrains strategy coverage, brittle wins, overly forgiving wins, late-floor pressure, F9 resource conversion and outcome spread.

## Six-build authoritative portfolio

Every route below is executed through the authoritative game engine after applying the 10F content overlay.

| Shop cycle | Result | Terminal / stopping HP | Minimum normalized battle margin | F9 purchases |
| --- | --- | ---: | ---: | ---: |
| DEF → ATK → HP | Win F10 | 4198 | 36.47% | 10 |
| ATK → DEF → HP | Win F10 | 2146 | 12.47% | 10 |
| DEF → HP → ATK | Win F10 | 4170 | 36.24% | 10 |
| ATK → HP → DEF | Win F10 | 1846 | 7.35% | 10 |
| HP → DEF → ATK | F9 boss block | 3153 | 32.95% before failure | 9 |
| HP → ATK → DEF | F9 boss block | 2881 | 29.92% before failure | 9 |

This produces a useful demo boundary: four ordinary build orders remain viable, while the two HP-first recurring builds fail at the pre-throne checkpoint instead of every strategy trivially winning.

## Checkpoint telemetry

### F8 — 静默前庭

Across the four winning builds:

```text
battle coverage             4 / 4
boss coverage               4 / 4
minimum margin              48.94%
mean minimum margin         54.94%
mean boss margin            54.94%
total damage                8192 per winning build
```

F8 is the introduction to palace pressure. It is intentionally safer than F9: the player has just completed the seven-core arc and should be able to understand the new enemy mix before the real build check.

### F9 — 倒悬星桥

Across the four winning builds:

```text
battle coverage             4 / 4
boss coverage               4 / 4
shop coverage               4 / 4
minimum margin               7.35%
mean minimum margin         23.13%
mean boss margin            23.13%
total damage range          8356–8392
purchases on F9             10 per winning build
```

F9 is the primary late-game build discriminator. The shop is not decorative: every winning simple build converts accumulated Gold there before the throne, while the two HP-first cycles still fail the F9 boss gate.

### F10 — 无声王座

Across the four winning builds:

```text
battle coverage             4 / 4
voidCore coverage           4 / 4
minimum margin              38.84%
mean minimum margin         49.84%
total damage                3732 per winning build
```

F10 is the terminal confirmation fight after F9 has already differentiated viable and non-viable recurring builds.

## Hard CI quality contract

`src/game/demo-10-floor-quality.js` and `scripts/validate-demo-10f.mjs` enforce:

- six simple shop-cycle permutations are tested;
- 4–5 of 6 must be solvable;
- strongest winning simple build margin must be 15–50%;
- weakest winning simple build margin must be at least 5%;
- winning terminal-HP spread must be at least 900;
- all winning builds must fight on F8/F9/F10 and defeat each checkpoint boss;
- F9 shop coverage among winning builds must be at least 75%;
- late-floor mean minimum margin above 60% is rejected;
- every winning route must recover seven cores, finish F10 with positive HP, and defeat `palaceWarden`, `blackSealKeeper`, and `voidCore`.

These are demo-generation gates. They do not imply exact optimality or complete strategy-space coverage.

## Save isolation

The 10F browser bootstrap installs a content-scoped save namespace before canonical `main.js` starts.

```text
8F baseline manual    lost-magic-tower:manual:v1
10F demo manual       lost-magic-tower:demo-10f-v1:manual:v1
8F baseline auto      lost-magic-tower:auto:v1
10F demo auto         lost-magic-tower:demo-10f-v1:auto:v1
```

Non-state preferences such as the UI theme remain shared. This allows the 8F research baseline and 10F product demo to coexist in the same browser without overwriting one another.

## Validation evidence

Dedicated `10F Playable Demo` workflow on the validated gameplay head passed all stages:

```text
Preserve eight-floor research regression suite      success
Profile late-game pressure candidates               success
Validate ten-floor six-build quality portfolio      success
Smoke-test real browser Canvas boot                  success
```

Node regression result:

```text
tests   279
pass    279
fail      0
```

Real browser smoke:

```text
demo_header       true
game_container    true
hud_floor_number  true
hud_floor_title   true
renderer_canvas   true
no_boot_failure   true
```

## Next development contract

The 10F slice is now the product-facing sandbox for automated co-design. Future numeric, placement, door/card, treasure and topology mutations should be evaluated against this baseline first, then strengthened with checkpoint Pareto-width/action-surface diagnostics and more capable player portfolios.

Do not weaken these gates merely to make a candidate pass. If a future candidate violates them, repair the candidate or explicitly revise the product target with new evidence.
