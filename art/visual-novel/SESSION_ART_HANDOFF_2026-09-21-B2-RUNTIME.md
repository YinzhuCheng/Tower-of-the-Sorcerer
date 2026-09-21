# B2 GAL Runtime Handoff · 2026-09-21

## Accepted state

- B2 formal slots: **25/25 accepted**
- Supplemental guide expressions: **2/2 accepted**
- Runtime standees exported: **27/27**
- Rerender required: **0**
- Runtime namespace: `public/assets/anime/characters/b2-20260921/`

## GAL mapping

`src/game/anime-portraits.js` now points the authored GAL stage expressions to the B2 runtime namespace.

This includes the recurring leads and the reviewed supporting cast. Historical standee files are retained; they were not overwritten.

## Source of truth

- `art/visual-novel/05_manifests/b2-runtime-accepted-20260921-v1.json`
- `art/visual-novel/03_intermediate/qa/2026-09-21-b2-runtime/B2_RUNTIME_QA.md`
- `art/visual-novel/04_cg/working/2026-09-20-b2-standees/`

## Review route

Use `/gal-only/` for sequential GAL-only review.

The GAL-only route uses the same production renderer and runtime art as the game, but does not boot the tower canvas or write game saves.
