# 2026-09-03 tower identity redraw v6

## Human-audit scope

The second exported audit contains five explicit `issue` records and two still-pending records with unambiguous mismatch notes. All seven were treated as actionable:

- Li: redraw all four map directions from the current GAL identity.
- Lanyin and Yanli: redraw dialogue avatars from their canonical standing sprites.
- Yayu: replace the hooded male battle identity with her canonical female GAL identity.
- Echo Regent, Arcane Sovereign, and Archive Warden: derive map portraits directly from their accepted GAL standing sprites.

## Map clarity upgrade

All 48 legacy `enemies/v1/*-map-128.webp` entries have a matching transparent `portraits/v1/*-portrait-runtime.webp` source. Runtime loading now prefers the 320×480 source and keeps the old 128×128 token only as a decode fallback. Tall portraits are aspect-preserving and foot-aligned instead of being stretched into a square.

The three later identity corrections use 512×768 derivatives. This avoids loading 1024×1536 stage art into every map while preserving the approved identity.

## Internal acceptance

- Li atlas: four coherent directions in the required order; 1024×1024; native alpha with measured range `0..1`; no checkerboard or opaque canvas.
- Yayu battle portrait: correct short-haired female identity; 512×768; native alpha `0..1`; no hood, armor swap, or rectangular glow background.
- Lanyin avatar: canonical hair, eyes, ocean ornaments and dress; 512×512 opaque avatar; clean cel shading.
- Yanli avatar: canonical horns, face, red hair, white fur collar and armor; 512×512 opaque avatar; clean cel shading.
- Echo Regent, Arcane Sovereign, Archive Warden: pixel-derived from the accepted canonical GAL sprites; 512×768; native alpha.
- Non-living cores remain excluded from the human identity audit.

Automated coverage is in `test/tower-identity-redraw-assets.test.js` and `test/art-audit-page.test.js`.
