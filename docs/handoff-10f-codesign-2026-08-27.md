# 10F Co-design Handoff — 2026-08-27

This document is the repository-resident checkpoint for continuing automatic Tower design in a new coding session.

## Repository / PR state

- Repository: `YinzhuCheng/Tower-of-the-Sorcerer`
- Working branch: `demo-10-floor-codesign`
- Pull request: **#16** — `Demo: 10F v1 playable vertical slice with automated quality gates`
- Base branch: `solver-phase1-pareto`
- PR state: **open, draft, unmerged**
- Functionally validated co-design code head: **`c416c7f8e49ca49c3eb773ff5cd1fc48961ab038`**
- Documentation checkpoint before this correction: `f5421ed524cd0181a36166e00ee5c78fbc0368a1`
- Latest full validation used for this handoff: PR workflow merge ref for `f5421ed...`; all four relevant workflows succeeded.

Do **not** merge PR #16, PR #15, or PR #14 without explicit approval.

## Trust boundary

The following constraints remain hard:

1. `src/game/engine.js` is the sole authoritative transition system.
2. Co-design / tuner candidates are generation-time dry runs only.
3. `productionWriteAllowed` must remain `false` for current co-design and topology searches.
4. Do not write heuristic candidates into canonical `src/game/data.js`.
5. Do not weaken quality or proof gates merely to make a candidate pass.
6. A bounded Solver miss is coverage-incomplete / unknown, not a proof of infeasibility.
7. The 10F demo content remains isolated through `src/game/demo-10-floor-content.js`.
8. Exact/sound Solver work is reserved for shortlisted variants; generation-time heuristic evidence must not be presented as a global optimality proof.

## Frozen 10F v1 gameplay baseline

The current product sandbox remains the 10-floor demo overlay:

```text
F1-F7  existing seven-core campaign
F8     静默前庭       two-switch palace checkpoint
F9     倒悬星桥       ordered-rune checkpoint + pre-throne shop
F10    无声王座       finalQueen -> voidCore
```

Late-game pressure values remain:

```text
palaceWarden.magicPower      240
blackSealKeeper.magicPower   270
```

Authoritative six-build contract:

```text
DEF-ATK-HP   win F10   HP 4198   min margin 36.47%
ATK-DEF-HP   win F10   HP 2146   min margin 12.47%
DEF-HP-ATK   win F10   HP 4170   min margin 36.24%
ATK-HP-DEF   win F10   HP 1846   min margin  7.35%
HP-DEF-ATK   F9 fail   HP 3153
HP-ATK-DEF   F9 fail   HP 2881
```

Quality summary:

- 4 / 6 simple recurring builds finish.
- Winning terminal-HP spread: **2352**.
- F9 shop coverage among winners: **100%**.
- Hard quality violations: **0**.
- No topology or numeric co-design candidate has been promoted into the v1 map.

## Current 33-policy checkpoint diagnostics

The generation-time player portfolio contains 33 policies: 6 hard quality policies plus 27 diagnostic policies.

Current baseline checkpoint Pareto widths:

| Floor | Pareto width |
| ---: | ---: |
| F2 | 10 |
| F3 | 13 |
| F4 | 13 |
| F5 | 12 |
| F6 | 12 |
| F7 | **16** |
| F8 | 12 |
| F9 | 11 |

Aggregate generation diagnostics:

- checkpoint choice loss: **0.546875**
- max Pareto width: **16**
- mean Pareto width: **12.375**
- oversized checkpoints: F2-F9
- current mutation planner reports unhandled floors: **F2-F7**
- measured event-order history inflation: **not yet available**

Important distinction: this checkpoint width is diversity in the sampled **player-policy/resource portfolio**. It is not yet direct Solver structural-frontier telemetry and must not be described as exact event-order state-space size.

## Numeric / placement co-design wave

Latest successful `10F Co-design Profile` run evaluated:

- model: `tower-solver-codesign-beam-v0.2-evidence-expansion`
- mutation catalogue: **39**
- player policies: **33**
- evaluated candidates: **197**
- heuristic-only: `true`
- `productionWriteAllowed=false`

Result: **baseline remains best**. No numeric, reward, card, door, enemy-placement, or cross-floor exchange mutation was promoted.

The round-2 beam still contains useful diagnostic alternatives such as:

- `f9-crown-atk-down6+f9-seal-magic-up10`
- `f8-outer-atk-up6+f9-crown-atk-down6`
- `f9-crown-atk-down6`
- `f8-warden-magic-up10+f9-crown-atk-down6`
- `f9-null-magic-down10+f9-seal-magic-up10`

They remain heuristic alternatives only.

## F8/F9 topology wave 1 — corrected final result

The constrained one-wall/one-floor topology search uses:

- model: `demo-10f-constrained-topology-wave1-v0.2-relative-checkpoint`
- catalogue size: **32**
- checkpoint gate: **baseline-relative-no-regression**
- heuristic-only: `true`
- `productionWriteAllowed=false`

Baseline topology:

| Floor | Nodes | Edges | Cycle rank | Dead ends | Branch nodes | D→U distance |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F8 | 52 | 55 | 4 | 0 | 6 | 16 |
| F9 | 53 | 57 | 5 | 0 | 7 | 16 |

Final candidate accounting:

```text
catalog                 32
static rejected         20
hard-quality rejected    8
checkpoint rejected      1
accepted shortlist       3
```

The single checkpoint-regression rejection is:

`f8-topology-wallEastLower-floorLowerEast`

because it changes:

- choice loss: `0.546875 -> 0.5625`
- delta: `+0.015625`
- and regresses F9 Pareto width.

This confirms that the relative checkpoint gate is active and can reject a topology mutation even when global max Pareto width remains 16.

### Accepted feasibility shortlist

All three accepted candidates preserve 4 / 6 solvable simple builds and do not worsen checkpoint choice loss or max Pareto width. None improves the checkpoint metric (`checkpointGain=0`).

1. `f8-topology-wallMidWest-floorLowerCenter`
   - score `0.18075570890340295`
   - choice loss `0.546875`
   - max Pareto width `16`
   - best margin `37.113%`
   - weakest winning margin `8.701%`
   - F8: 52 nodes, 55 edges, cycle rank 4, 2 dead ends, 7 branch nodes, D→U 16

2. `f9-topology-wallEastLower-floorLowerEast`
   - score `0.1878740587984261`
   - choice loss `0.546875`
   - max Pareto width `16`
   - best margin `36.474%`
   - weakest winning margin `7.349%`
   - F9: 53 nodes, 59 edges, cycle rank 7, 0 dead ends, 9 branch nodes, D→U 16

3. `f8-topology-wallMidLower-floorMidCenter`
   - score `0.18870254051743166`
   - choice loss `0.546875`
   - max Pareto width `16`
   - best margin `36.913%`
   - weakest winning margin `8.279%`
   - F8: 52 nodes, 55 edges, cycle rank 4, 2 dead ends, 8 branch nodes, D→U 16

### Topology decision

**Do not promote any wave-1 topology mutation.**

The shortlist demonstrates that constrained topology mutation can preserve playability, but this mutation surface did not reduce player checkpoint width or choice loss. Preserve the v1 F8/F9 maps and move the search effort to the actual diagnostic bottleneck instead of forcing a late-floor edit.

## Validation state

At documentation checkpoint `f5421ed524cd0181a36166e00ee5c78fbc0368a1`, all relevant PR workflows passed:

- `CI` — success
- `10F Playable Demo` — success
- `Tuner Profile` — success
- `10F Co-design Profile` — success

The co-design workflow itself reported:

```text
Node tests: 301 passed / 0 failed
validate:demo10: passed
numeric/placement co-design search: completed
F8/F9 topology search: completed
```

A documentation-only correction to this handoff may create a newer branch head after those runs. Treat `c416c7f8...` as the functionally validated code head and the latest handoff commit as the repository continuation pointer.

## Next coding-session priorities

### P0 — add F7 semantic mutation surface

F7 currently has the largest sampled player checkpoint Pareto width: **16**. The current adaptive mutation planner explicitly reports F2-F7 as unhandled, so the next mutation family should begin at F7 rather than continuing blind F8/F9 topology edits.

Candidate families should be semantic and reversible, for example:

- enemy position swaps within protected role classes;
- card / door timing swaps that conserve the campaign resource budget;
- reward placement swaps;
- local pressure adjustments coupled to the existing hard quality contract;
- only then narrowly constrained topology mutations if a structural reason is measured.

Every candidate must still run through authoritative engine replay and the existing 10F quality gate.

### P1 — add genuine Solver structural checkpoint telemetry

The current 33-policy diagnostic records player-policy/resource diversity. Add Solver-side checkpoint telemetry that measures the actual search frontier without conflating it with sampled policy multiplicity.

Useful measurements include, per semantic campaign checkpoint:

- unique Solver structural keys;
- active Pareto labels;
- frontier width / peak;
- generated and expanded states since previous checkpoint;
- action-family branching;
- event-order-history distinctions retained in keys;
- pruned-dominated / pruned-bound counts where applicable.

Do not use these diagnostics to weaken proof semantics. A bounded search remains unknown unless the existing exact classifier says otherwise.

### P2 — continue evidence-driven floor coverage

After F7, target the remaining unhandled floors by measured width:

1. F3 / F4 — width 13
2. F5 / F6 — width 12
3. F2 — width 10

The objective is not to force every floor to a tiny width. Preserve meaningful strategic trade-offs while eliminating accidental near-duplicate branches and proof-hostile state inflation.

### P3 — CEGIS-style automatic design loop

Continue toward the long-term goal:

```text
generate mutation
  -> static invariant screen
  -> authoritative multi-policy replay
  -> hard 10F quality gate
  -> player checkpoint diagnostics
  -> Solver structural diagnostics
  -> shortlist
  -> exact/sound Solver budget only on shortlist
  -> counterexample / failure-core feedback
  -> generate next mutation
```

Important algorithms, result documents, counterexamples, and validation evidence should be committed to GitHub rather than left only in a transient coding environment.

## Recommended commands

From the repository branch:

```bash
npm run check
npm run validate:demo10
npm run search:demo10:codesign
npm run search:demo10:topology
```

Use the dedicated GitHub workflows as the reproducible CI evidence source.

## New-session start instruction

A new coding session should begin by reading this file and PR #16, then:

1. confirm the current `demo-10-floor-codesign` head;
2. confirm PR #16 is still draft/unmerged;
3. preserve all trust-boundary rules above;
4. implement P0 F7 semantic mutation support and P1 Solver structural checkpoint telemetry;
5. run the hard 10F quality contract and relevant regression suite;
6. push important code, tests, docs, and evidence to GitHub;
7. do not promote a heuristic candidate or merge any protected PR without explicit approval.
