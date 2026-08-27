# 10F playable demo validation result — 2026-08-27

Branch: `demo-10-floor-codesign`

Playable checkpoint commit: `cafacd4555f1fcbeebae5886a83730b4ae27e865`.

The dedicated `10F Playable Demo` workflow completed successfully after adding an F9 pre-throne shop checkpoint. The ordinary eight-floor research regression suite remained green, while the demo-specific validator applied the 10F browser content overlay and executed complete heuristic routes through the authoritative engine.

## Structural slice

```text
F1-F7  established seven-core campaign
F8     静默前庭       two-switch palace checkpoint
F9     倒悬星桥       ordered-rune checkpoint + pre-throne shop
F10    无声王座       finalQueen -> voidCore
cores  exactly 7, all recovered by F7
```

F8/F9 bosses are palace defenses and do not grant additional cores.

## Why the F9 shop is structural, not a free bailout

The first hardened F8/F9 profile sent simple routes to the F9 boss with roughly 7k Gold but no reachable shop. That created a resource-conversion cliff: accumulated Gold was strategically dead exactly where the route needed to resolve into a final build.

Adding one transit-compatible F9 shop before the throne converts that deferred resource into an explicit checkpoint decision. It also reduces the need for future Solver/player models to permute late Compass returns solely to choose when to spend Gold.

## Authoritative heuristic portfolio

Four deterministic simple shop cycles were tested. Three complete the full ten-floor game:

```text
cycle          result   terminal HP
DEF-ATK-HP     win          3670
ATK-DEF-HP     win          1618
DEF-HP-ATK     win          3642
ATK-HP-DEF     F9 fail      4778 at failure state
```

Best simple build:

```text
terminal HP                 3670
max HP                     43650
ATK                          250
DEF                          260
Gold                         308
purchases                     39
battles                       90
turns                       2655
minimum normalized margin   30.87%
```

This is substantially tighter than the first permissive 10F slice, whose best simple route ended around 17.5k HP with an ~81% minimum normalized margin.

## Demo quality gate

The demo validator now requires:

- exactly ten floors;
- exactly seven recoverable cores;
- final Queen/core on F10;
- at least three of four simple deterministic build cycles to produce an authoritative victory witness;
- the strongest simple build's minimum normalized battle margin to remain in `[0.15, 0.55]`.

These are generation/playability gates, not optimality claims. Later co-design tuning may replace the four simple policies with a broader bounded/beam player portfolio while preserving authoritative replay.

## Trust boundary

- `engine.js` remains the sole transition system.
- Browser demo content is injected before the first engine state is created.
- Node Solver imports retain the eight-floor research baseline unless the demo overlay is explicitly applied.
- Old eight-floor save shapes are rejected by the 10F engine state-shape check.
- No demo changes are merged into PR #15 automatically.
