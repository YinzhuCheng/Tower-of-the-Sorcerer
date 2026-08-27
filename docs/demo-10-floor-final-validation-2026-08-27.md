# 10F playable demo — final validation snapshot — 2026-08-27

Validated branch head: `469af49a0394e29df19740e90010519931d8b19e`

Dedicated workflow: `10F Playable Demo`, run `33059719582`.

This snapshot records the first ten-floor vertical slice that simultaneously satisfies the research-regression, authoritative-playability and real-browser boot gates.

## Content

```text
F1-F7  established seven-core campaign
F8     静默前庭       two-switch palace checkpoint
F9     倒悬星桥       ordered-rune checkpoint + pre-throne shop
F10    无声王座       finalQueen -> voidCore
cores  exactly 7; all recovered by F7
```

F8/F9 are palace defenses and do not introduce extra cores. The F9 shop is a deliberate resource-convergence checkpoint: late Gold is converted into an explicit final-build decision instead of forcing Compass backtracking permutations.

## Regression gate

```text
node tests: 277
passed:     277
failed:       0
```

The default Node/Solver path still uses the eight-floor research baseline unless the 10F demo overlay is explicitly installed.

## Authoritative heuristic portfolio

`npm run validate:demo10` executes complete routes through `engine.js` after applying the demo overlay.

```text
simple build cycle   result    terminal HP   min normalized battle margin
DEF-ATK-HP           win              3670   30.87%
ATK-DEF-HP           win              1618    2.93%
DEF-HP-ATK           win              3642   30.60%
ATK-HP-DEF           F9 fail          ----   ----
```

Quality gate:

```text
tested simple builds         4
required solvable builds     3
actual solvable builds       3
best-build margin band       [15%, 55%]
best-build actual margin     30.87%
terminal-HP spread            2052
```

Best simple witness:

```text
terminal HP    3670 / 43650
ATK            250
DEF            260
Gold           308
purchases       39
battles         90
turns         2655
cores            7
floor            10
```

This is a generation/playability result, not a claim of optimality.

## Real browser gate

The workflow starts the source checkout with a local static server and launches headless Chrome against the real `index.html` / `demo-main.js` path.

```text
10F_BROWSER_SMOKE {
  demo_header:      true,
  game_container:   true,
  hud_floor_number: true,
  hud_floor_title:  true,
  renderer_canvas:  true,
  no_boot_failure:  true
}
```

The browser demo explicitly chooses the repository-local Canvas renderer because the page CSP disallows third-party script CDNs. `engine.js` remains the sole gameplay transition system.

## Source-checkout art resilience

Legacy generated anime `.b64` sheets are optional in a source checkout. If absent, `src/game/anime-assets.js` now provides a deterministic procedural inline-SVG fallback instead of rejecting module initialization. High-resolution manifest-driven enemy/map assets continue to load independently.

This fallback exists to keep the playable source demo bootable; it does not change game rules or proof semantics.

## Promotion status

- playable 10F demo: **yes**
- authoritative completion witness: **yes**
- multiple simple viable builds: **yes (3/4)**
- real browser Canvas boot: **yes**
- exact 10F optimum/proof closure: **not claimed**
- production balance promotion: **not performed**
- automatic merge: **not allowed**

Next development should use this 10F slice as the product target while the eight-floor corpus remains a research baseline: add checkpoint Pareto diagnostics, bounded/beam player portfolios and proof-friendly tower mutation before migrating the exact Solver corpus to ten floors.
