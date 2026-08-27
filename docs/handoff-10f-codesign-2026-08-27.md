# 10F Co-design Handoff — 2026-08-27

This document is the repository-resident checkpoint for continuing automatic Tower design in a new conversation.

## Repository / PR state

- Repository: `YinzhuCheng/Tower-of-the-Sorcerer`
- Working branch: `demo-10-floor-codesign`
- Pull request: **#16** — `Demo: 10F v1 playable vertical slice with automated quality gates`
- Base branch: `solver-phase1-pareto`
- PR state at handoff: **open, draft, unmerged**
- Functionally validated code head: **`c416c7f8e49ca49c3eb773ff5cd1fc48961ab038`**
- This handoff is committed after that validated code head and is documentation-only.

Do **not** merge PR #16, PR #15, or PR #14 without explicit approval.

## Trust boundary

The following constraints remain hard:

1. `src/game/engine.js` is the sole authoritative transition system.
2. Co-design / tuner candidates are generation-time dry runs only.
3. `productionWriteAllowed` must remain `false` for the current co-design and topology searches.
4. Do not write heuristic candidates into canonical `src/game/data.js`.
5. Do not weaken quality or proof gates merely to make a candidate pass.
6. A bounded Solver miss is coverage-incomplete / unknown, not a proof of infeasibility.
7. The 10F demo content remains isolated through `src/game/demo-10-floor-content.js`.
8. Exact/sound Solver work is reserved for shortlisted variants; generation-time heuristic evidence must not be presented as a global optimality proof.

## Current 10-floor product baseline

```text
F1-F7  existing seven-core campaign
F8     静默前庭       two-switch palace checkpoint
F9     倒悬星桥       ordered-rune checkpoint + pre-throne shop
F10    无声王座       finalQueen -> voidCore
```

The campaign still contains exactly seven recoverable magic cores. F8/F9 are palace defenses rather than extra core floors.

Selected late-game v1 pressure values remain:

```text
palaceWarden.magicPower      240
blackSealKeeper.magicPower   270
```

### Hard six-build quality portfolio

```text
DEF-ATK-HP   win F10   HP 4198   min margin 36.47%
ATK-DEF-HP   win F10   HP 2146   min margin 12.47%
DEF-HP-ATK   win F10   HP 4170   min margin 36.24%
ATK-HP-DEF   win F10   HP 1846   min margin  7.35%
HP-DEF-ATK   F9 fail   HP 3153
HP-ATK-DEF   F9 fail   HP 2881
```

The hard contract still requires:

- 4–5 of 6 recurring ATK/DEF/HP build permutations finish;
- strongest winning simple-build margin stays in 15–50%;
- weakest winning simple-build margin is at least 5%;
- winning terminal-HP spread is at least 900;
- every winning build has battle + boss coverage on F8/F9/F10;
- F9 shop coverage among winners is at least 75%;
- late-floor mean margin above 60% is rejected;
- seven cores, F10 completion, positive HP, and final `voidCore` defeat are required.

The current baseline continues to pass this contract with 4/6 finishes and terminal-HP spread 2352.

## Player-side diagnostic model

Generation-time co-design now uses **33 policies**:

- 6 public recurring quality-gate cycles;
- 27 diagnostic policies, including prefix-biased routes, pure ATK/DEF/HP extremes, and early one-purchase perturbations of public winning builds.

Only the original six recurring cycles define the hard product quality contract. The additional 27 policies are heuristic probes for hidden route/resource diversity.

### Authoritative checkpoint telemetry

`greedy-strategy` now records real pre/post-battle strategic state, including cards, cores, purchases, and relics. The checkpoint analyzer therefore reads authoritative strategic resources rather than reconstructing those fields from floor-number heuristics.

### Current 33-policy checkpoint widths

The measured baseline Pareto widths are:

```text
F1   3
F2  10
F3  13
F4  13
F5  12
F6  12
F7  16
F8  12
F9  11
F10  6
```

For the current target floors F2–F9:

```text
checkpointChoiceLoss  0.546875
maxParetoWidth        16
meanParetoWidth       12.375
```

These values are intentionally **not** forced back into the earlier 2–8 diagnostic band by weakening the band. The broader player model exposed real additional resource tradeoffs.

### Important measurement correction

`policyMultiplicity` means multiple sampled diagnostic policies arrived at the same resource state. It is **not** Solver/event-order history inflation.

The checkpoint analyzer therefore no longer feeds policy multiplicity into proof-state `historyInflation`. Genuine Solver structural/history inflation remains unmeasured/null until structural-key/frontier evidence is collected from the Solver itself.

This distinction must be preserved; otherwise the setter can be driven to simplify nonexistent proof-state explosion.

## Evidence-driven numeric / placement co-design

Relevant files:

- `src/analyzer/demo-10-floor-checkpoints.js`
- `src/tuner/demo-10-floor-adaptive-mutations.js`
- `src/tuner/demo-10-floor-mutations.js`
- `src/tuner/codesign-beam-search.js`
- `scripts/search-demo-10f-codesign.mjs`

The mutation layer currently has 39 white-listed numeric / enemy / reward / card / door / rune / cross-floor timing mutations for F8/F9. Semantic slots are used rather than naked coordinates.

The beam expander receives the already-computed parent evaluation, so mutation families can be selected from checkpoint evidence instead of blindly enumerating every mutation for every parent.

Current result: **baseline remains the preferred candidate; no numeric/placement mutation is promoted.**

The broader 33-policy evidence currently identifies oversized checkpoints on F2–F9, while the existing setter catalog only has semantic mutation surfaces for F8/F9. Therefore the important diagnostic is:

```text
unhandledFloors = [2, 3, 4, 5, 6, 7]
```

Do not mutate unrelated F8/F9 content merely to compensate for evidence originating on F2–F7.

## Constrained topology wave 1

Wave 1 introduced safe local topology mutation for F8/F9 only.

Relevant files:

- `src/analyzer/demo-10-floor-topology.js`
- `src/tuner/demo-10-floor-topology-mutations.js`
- `src/tuner/demo-10-floor-topology-validator.js`
- `scripts/search-demo-10f-topology.mjs`
- `test/demo-10-floor-topology.test.js`

### Mutation semantics

There are exactly **32** candidates. Each candidate swaps one semantic wall slot `#` with one semantic floor slot `.` on a single floor.

Wave 1 deliberately does **not** move:

- enemies;
- rewards/items;
- doors;
- switches/runes/gates;
- D/U stairs;
- event token coordinates.

The mutation preserves the passable-tile budget. Static validation runs before any expensive authoritative player evaluation.

### Baseline graph contract

```text
F8: passable=52 edges=55 cycleRank=4 deadEnds=0 branchNodes=6 D->U=16
F9: passable=53 edges=57 cycleRank=5 deadEnds=0 branchNodes=7 D->U=16
```

The static contract also checks map dimensions, boundary walls, exactly one D and U, event signature, semantic-slot anchors, connectivity, passable budget, cycle rank, branching, dead ends, and D→U distance.

### Fixed checkpoint gate

An earlier topology script incorrectly required the broader 33-policy baseline to have `choiceLoss === 0`. That was an obsolete assumption, not a gameplay failure.

The validated implementation now uses:

`baseline-relative-no-regression`

A topology candidate may tie or improve the measured nonzero baseline, but it must not worsen:

1. aggregate checkpoint choice loss;
2. maximum Pareto width;
3. any individual target-floor Pareto width.

This is implemented by `compareDemoTenFloorCheckpointPortfolio(...)` and covered by tests for both nonzero-baseline ties/improvements and aggregate/per-floor regressions.

### Fresh wave-1 result on validated code head

GitHub Actions evidence:

- workflow run: **`33075612715`**
- job: **`98528975192`**
- model: `demo-10f-constrained-topology-wave1-v0.2-relative-checkpoint`
- `heuristicOnly=true`
- `productionWriteAllowed=false`
- `checkpointGate=baseline-relative-no-regression`

Exact candidate accounting:

```text
catalog                    32
static rejected            20
hard-quality rejected       8
checkpoint rejected         1
accepted shortlist          3
```

The single checkpoint-rejected candidate was:

```text
f8-topology-wallNwBridge-floorNorthCenter
reason: f2:pareto-width-regression
```

Its aggregate `choiceLoss` and `maxParetoWidth` happened to remain unchanged, so this rejection is useful evidence that the **per-floor no-regression gate is active** rather than merely checking aggregate metrics.

### Accepted shortlist

1. `f8-topology-wallMidWest-floorLowerCenter`
   - score `0.1095`
   - structuralLoss `0.2875`
   - checkpointGain `0`
   - F8 becomes: passable52 / edges54 / cycleRank3 / deadEnds0 / branchNodes4 / D→U16

2. `f8-topology-wallMidLower-floorMidCenter`
   - score `0.1345`
   - structuralLoss `0.4125`
   - checkpointGain `0`
   - F8 becomes: passable52 / edges53 / cycleRank2 / deadEnds0 / branchNodes4 / D→U16

3. `f9-topology-wallMidEast-floorMidCenter`
   - score `0.2345`
   - structuralLoss `0.9125`
   - checkpointGain `0`
   - F9 becomes: passable53 / edges60 / cycleRank8 / deadEnds0 / branchNodes8 / D→U16

For all three accepted alternatives:

```text
solvableBuilds       4
choiceLoss           0.546875
maxParetoWidth       16
checkpointGain       0
terminalHpSpread     2352
bestMargin           36.47%
weakestMargin         7.35%
```

### Wave-1 decision

**Do not promote any topology mutation.**

The three accepted variants prove that the constrained topology machinery works and can preserve the hard quality contract, but none improves the 33-policy checkpoint diagnostics. They are feasibility examples, not better designs.

The current F8/F9 baseline remains the product-facing 10F v1 map.

## Validation at the functional code head

Functionally validated code head:

`c416c7f8e49ca49c3eb773ff5cd1fc48961ab038`

At that head:

- repository CI: **success**;
- `10F Playable Demo`: **success**;
- `Tuner Profile`: **success**;
- `10F Co-design Profile`: **success**;
- Node test suite: **301 passed, 0 failed**;
- six-build 10F quality gate: **passed**;
- browser Canvas smoke: **passed**;
- numeric/placement search remained dry-run;
- topology wave1 remained dry-run.

Useful commands:

```bash
npm run check
npm run validate:demo10
npm run tune:demo10:late
npm run search:demo10:codesign
npm run search:demo10:topology
```

## Recommended next work

The next conversation should continue from this order rather than restarting broad manual tuning.

### P0 — Add mutation surface where the evidence is largest

Start with **F7**, because its current diagnostic Pareto width is **16**, the largest checkpoint. Add semantic design slots and tightly white-listed mutation families for F7 before considering more F8/F9 changes.

Then expand based on evidence:

```text
F3/F4  width 13
F5/F6  width 12
F2     width 10
```

Do not add all floors at once. Introduce one floor/family at a time with slot-anchor tests and restoration tests.

### P1 — Add genuine Solver structural checkpoint telemetry

Player-policy Pareto width and Solver proof-state width are different quantities. Instrument real Solver boundary/frontier checkpoints so co-design can observe, per semantic checkpoint:

- structural-key count;
- active Pareto labels;
- queue/frontier width;
- action branching;
- travel/action class counts;
- pruning by dominance / admissible bound;
- event-order/history variants that survive canonicalization.

Only after this exists should `historyInflation` influence topology/proof-friendly mutation selection.

### P2 — Continue CEGIS-style co-design

Use this loop:

```text
diagnostic counterexample / oversized checkpoint
  -> local semantic mutation family
  -> static semantic + topology invariants
  -> authoritative six-build hard quality gate
  -> 33-policy diagnostic portfolio
  -> exact/sound Solver work only on shortlist
  -> witness/failure evidence returned to setter
```

This is the intended route toward automatic adjustment of enemy values, rewards, doors/cards/items, mechanisms, and later topology without manual per-number tuning.

### P3 — Do not expand topology too aggressively yet

Do not jump directly to arbitrary two-wall or free-form maze generation. Wave 1 showed that F8/F9 single-wall changes can be safe but currently provide zero diagnostic gain.

Only introduce topology wave 2 after local-floor evidence indicates topology is the limiting variable. Keep semantic event identities stable and retain the static graph contract.

### Promotion rule

A dry-run candidate should be considered for product promotion only when it demonstrates a measurable benefit over baseline, survives hard gameplay gates, and does not create a new proof/coverage regression. No shortlist item in the current wave satisfies the “measurable benefit” condition.

## Clean handoff state

At this breakpoint:

- the unfinished topology wave from the prior session is completed;
- the obsolete zero-choice-loss assertion is removed;
- topology wave1 has a fresh, successful, fully accounted 32-candidate run;
- no inferior candidate was written back into the game;
- all functional validation is green at `c416c7f8e49ca49c3eb773ff5cd1fc48961ab038`;
- PR #16 remains draft/unmerged;
- the next high-value implementation target is F7 semantic mutation coverage plus real Solver structural checkpoint telemetry.
