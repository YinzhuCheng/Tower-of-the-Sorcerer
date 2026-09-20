# Runtime CG Publish · 2026-09-21

## Status

- R4 accepted masters: **19/19**
- Runtime WebP export: **19/19**
- Encoder: `cwebp`
- Fixed parameters: `-q 92 -m 6 -sharp_yuv -metadata none`
- Runtime paths are unchanged, so existing game and `/art-audit` mappings remain valid.

## Source of truth

- `05_manifests/cg-r4-accepted-20260921-v1.json`
- `05_manifests/cg-runtime-publish-20260921-v1.json`
- `04_cg/working/R3-scene/2026-09-21/CG_*_R3_accepted_v1.png`

## Runtime destination

The 19 accepted CGs overwrite the existing files under:

`public/assets/anime/cg/`

using the established `runtime_target` paths from
`05_manifests/cg-current-best-20260921-v1.json`.

## Validation gate

Publication is allowed only after:

1. every source PNG SHA matches the R4 manifest;
2. every generated WebP passes `webpinfo`;
3. the focused CG/art-audit regression suite passes;
4. `node scripts/build.mjs` passes; the standard main CI remains the full-project gate.

After merge/push, use `/art-audit` for final human runtime review.
