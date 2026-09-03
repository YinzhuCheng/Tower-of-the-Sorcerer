# 2026-09-03 GAL audit redraw v5

## Scope

This batch resolves all 13 issue records from the 2026-09-03 human art audit:

- two standing-character identity/background failures;
- four additional avatar identity failures plus Lumi's matching avatar;
- seven CGs marked as too detailed or noisy for the requested Gal cel-shaded direction.

## Identity anchors

- Noctia: black hair with deep-crimson ends, red-violet eyes, thorn crown, black/crimson regalia.
- Lumi: ash-violet hair, gold-violet eyes, indigo/ivory scholar-witch dress, crescent astrolabe and star charts.
- Yayu: short raven hair with violet sheen, grey-violet eyes, black/plum/silver stealth dress.
- Echo Regent: pale ash-blond long hair, muted violet eyes, charcoal coat, blue-black sash and sealed ledger.
- Arcane Sovereign: long dark-teal hair, tired gold eyes, black/ivory magistrate coat and cobalt details.
- Archive Warden: silver-black braid, cyan eyes, dark archivist uniform and copper clasps.

## Acceptance results

- Both large standing sprites and both runtime derivatives contain native WebP alpha chunks.
- Alpha extrema measured from accepted PNG masters: Noctia `0..1`; Lumi `0..0.996078`.
- No checkerboard, white canvas or striped preview background is baked into the accepted standing sprites.
- Five replacement avatars match their character anchors and contain no text or watermark.
- All seven CGs are exactly `1672x941`, use opaque scene backgrounds, preserve declared cast, and avoid UI text.
- The lighthouse ending CG received a final simplification pass after human review: broad dawn gradient, grouped harbor silhouettes, and substantially reduced cloud, costume and masonry micro-detail.
- Noctia's ordinary runtime portrait and Lumi's map sprite were regenerated from the same accepted masters.
- Every replaced file is archived with its original Git blob SHA.

## Runtime verification contract

`test/gal-audit-redraw-assets.test.js` enforces replacement hashes, dimensions, required alpha chunks, source/final presence, derivative mappings and archive traceability. The GAL art cache version is `20260903-audit-redraw-v5`.
