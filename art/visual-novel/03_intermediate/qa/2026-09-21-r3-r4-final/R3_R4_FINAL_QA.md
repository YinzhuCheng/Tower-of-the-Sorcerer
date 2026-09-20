# R3 / R4 Final QA · 2026-09-21

## Verdict

- R3 scene pass: **19/19 accepted**.
- R4 final QA: **19/19 accepted**.
- **No R4 rerender is required.** The accepted R3 bytes are admitted directly as final masters after R4 inspection.

## R4 inspection gates

- hands / fingers / limbs / faces
- edges and silhouette cleanup
- pseudo-text and watermark scan
- duplicate or count-sensitive props
- cross-character contamination
- line/style consistency
- color, noise, depth of field and lighting

## Per-CG results

| CG | R3 | R4 | QA note |
|---|---|---|---|
| `CG_001_critical` | PASS | PASS | R3: single hero, conscious, right-hand sword support, no enemy. R4: hands/legs/face/edges clean; no pseudo-text/watermark. |
| `CG_002_defeat` | PASS | PASS | R3: exhausted but conscious, safe silhouette, sword on character-right side, no enemy. R4: anatomy and edges clean; no sexualized damage/text. |
| `CG_003_prologue-tower` | PASS | PASS | R3: tower-dominant storm shot, hero small/back-facing, seven restrained core lights. R4: architecture/weather/lighting clean. |
| `CG_004_seven-cantos-severed` | PASS | PASS | R3: exactly seven separated light segments and exactly three queen seal tablets; hero conscious. R4: faces/hands/energy edges clean; counts readable. |
| `CG_005_northstar-arrival` | PASS | PASS | R3: five-string shell harp, human legs, calm evidence water mirror with distant ship/harbor lights. R4: hand/string region inspected; no readable text or extra instrument. |
| `CG_006_seven-core-network` | PASS | PASS | R3 previously accepted: exactly seven paths, one shared lock, shadow-boss owns needle/spool. R4: anatomy/lighting/edges clean; no readable UI. |
| `CG_007_noctia-truth` | PASS | PASS | R3: non-attacking dialogue, lowered hero sword, queen sorrow/fading distress light, low throne. R4: cast identity and anatomy clean; no extra props/text. |
| `CG_008_noctia-seal` | PASS | PASS | R3: cooperation clear; exactly seven cores, exactly three seal tablets, central gap readable. R4: count crop inspected; faces unobscured, no queen sword/text. |
| `CG_009_missing-fourth-step` | PASS | PASS | R3 previously accepted: exactly four positions with fourth missing, queen hand stops before gap. R4: no text/UI/anatomy defect. |
| `CG_010_seventeen-minute-splice` | PASS | PASS | R3 previously accepted: three evidence columns, two shift together, one remains original. R4: hands/astrolabe/lighting clean; no readable text. |
| `CG_011_intercepted-receipt` | PASS | PASS | R3: interceptor clearly nonhuman mechanism, receipt visibly attached to chest, shadow-boss controls line. R4: mechanism/anatomy/edges clean; no readable letter/extra weapons. |
| `CG_012_echo-ledger` | PASS | PASS | R3: three witnesses, one green status light, single tag/evidence, black ledger beside regent. R4: hands/face/props clean; no duplicate books or pseudo-text. |
| `CG_013_noctia-sovereign` | PASS | PASS | R3: sovereign male, right hand presents cracked signet, blue broken restraint on same wrist, three witnesses. R4: hands/ring/restraint clean; no extra rings/text. |
| `CG_014_missing-page-restored` | PASS | PASS | R3 previously accepted: one missing final page, clean mechanical separation, three witnesses. R4: anatomy/page edges/lighting clean; no readable legal text. |
| `CG_015_letters-held-in-storm` | PASS | PASS | R3: cooperative windbreak, ordered letters pinned down, queen crown retained, paper flow clear and faces unobscured. R4: hands/fabric/rain/edges clean; no text/watermark. |
| `CG_016_originals-enter-lighthouse` | PASS | PASS | R3: four characters, hero leads track, queen+sovereign share heavy source volume, custodian operates rear key station. R4: cast/anatomy/depth/lighting clean; no random books/text. |
| `CG_017_traceable-revocation` | PASS | PASS | R3 previously accepted: guide owns light pen and full-ring astrolabe; old/new record layers coexist; three characters. R4: anatomy clean; holographic marks remain abstract/non-readable. |
| `CG_018_noctia-afterlight` | PASS | PASS | Accepted without rerender from the R2 bytes after direct R3/R4 inspection: quiet pause, one alarm stone, mail crate between pair, final volume foreground, queen crown preserved; hands/stone/box/edges clean; no extra jewels/text. |
| `CG_019_lighthouse-archive` | PASS | PASS | R3 previously accepted: four distinct tasks, calm dawn, wet road, unarmed driver. R4: blank form remains blank; hands/boxes/lighting clean. |

## Count-sensitive checks explicitly re-verified

- `CG_004`: seven separated light segments + three queen seal tablets.
- `CG_005`: five-string shell harp; human legs; no second instrument.
- `CG_008`: seven cores + three seal tablets + clear central gap; cooperative action.
- `CG_012`: one green status light; one evidence/tag arrangement; no duplicate ledger.
- `CG_018`: one alarm stone; one mail crate; final volume present.

## Notes

- `CG_017` contains abstract holographic record glyphs, but they are non-readable decorative/evidence marks rather than pseudo-language; accepted under the no-readable-UI rule.
- Background heraldic/celestial symbols across the set are treated as established environment motifs, not text.
- This QA does not promote files into `public/assets/anime/cg/`; runtime export should occur only after manifest/mapping update and regression checks.
