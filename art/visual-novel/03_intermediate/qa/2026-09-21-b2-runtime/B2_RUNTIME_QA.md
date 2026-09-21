# B2 Standee Runtime QA · 2026-09-21

## Verdict

- B2 formal candidate slots: **25/25 PASS**
- Supplemental guide expressions (`watchful`, `lament`): **2/2 PASS**
- Runtime promotion set: **27/27**
- Rerender required: **0**

## QA gates

Every promoted source was reviewed against its Canon neutral standee and expression board.

- identity / hair / face / costume / signature prop consistency
- 1024×1536 portrait-stage dimensions
- real RGBA transparency; no baked checkerboard
- full-body crop suitable for GAL stage
- no pseudo-text / watermark
- no cross-character contamination
- requested expression/action remains readable at GAL scale

The runtime encoder validates every output with `webpinfo`.
Runtime files use a new namespaced directory instead of overwriting historical
standees, so previous audit manifests remain traceable.

## Runtime policy

`src/game/anime-portraits.js` now points authored GAL expressions to
`/assets/anime/characters/b2-20260921/*`.

Compact HUD/codex avatars remain separate by design; this promotion concerns
the full GAL standing layer.

## Encoder

`cwebp -q 94 -m 6 -alpha_q 100 -exact -metadata none`
