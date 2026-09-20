# R3 / R4 Final Art Handoff · 2026-09-21

## Current accepted state

- Canon: unchanged; continue using the existing Canon-first reference chain.
- CG R0: **19/19 accepted**.
- CG R1: **19/19 accepted**.
- CG R2: **19/19 accepted**.
- CG R3: **19/19 accepted**.
- CG R4 final QA: **19/19 accepted**.
- R4 rerender: **not required**; the accepted R3 masters passed the final inspection gate.

## Authoritative files

- `03_intermediate/qa/2026-09-21-r3-r4-final/R3_R4_FINAL_QA.md`
- `03_intermediate/qa/2026-09-21-r3-r4-final/R3_R4_FINAL_19_CONTACT_SHEET.jpg`
- `05_manifests/cg-r3-accepted-20260921-v2.json`
- `05_manifests/cg-r4-accepted-20260921-v1.json`
- `04_cg/working/R3-scene/2026-09-21/CG_*_R3_accepted_v1.png`

## Important runtime boundary

These accepted final masters are still production-source assets. They should **not** overwrite `public/assets/anime/cg/*` until deterministic WebP export, mapping update, regression tests and final `/art-audit` are completed.

## Next step

1. Export runtime WebP deterministically from the R4-accepted masters.
2. Update runtime CG mappings.
3. Run regression tests.
4. Open `/art-audit` for final human acceptance.
5. Only then publish/deploy runtime replacements.
