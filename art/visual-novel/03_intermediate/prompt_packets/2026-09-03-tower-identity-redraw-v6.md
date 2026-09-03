# Tower identity redraw v6 prompt packet

## Global style lock

- Clean Gal-game cel shading with broad, readable color blocks.
- Low visual noise: no micro-engraving, grain, painterly speckle, excessive jewelry, or tiny fabric filigree.
- Stable identity: preserve the named hair color and silhouette, eyes, face, costume palette, signature accessory, and weapon.
- No text, watermark, UI, frame, checkerboard preview, or baked transparency pattern.

## MAP-HERO-LIYUE-4DIR

References:

- `public/assets/anime/characters/liyue-runtime.webp` — canonical full-body identity and costume.
- `public/assets/anime/characters/liyue-dialogue-resolve.webp` — canonical face, hair, moon ornament, sword, and palette.
- `public/assets/anime/map/atlases/runtime/hero.webp` — layout only; identity must not be copied.

Prompt:

> Redraw a single 2-by-2 RPG map-character atlas of Lingxing Li / 绫星·璃. Four equal square cells in this exact order: front-facing, back-facing, left-facing, right-facing. The same adult young woman in every cell: very long midnight-blue hair with one bright white forelock, violet eyes where visible, silver crescent hair ornament, navy/black/white asymmetrical swordswoman coat, violet crystal accents, black thigh-highs, silver-black boots, and her blue-glowing sword. Compact super-deformed map proportions but not childlike; large readable silhouette, clean Gal-game cel shading, restrained detail, crisp edges. Identical costume and body proportions across all four directions. Center each figure with feet on the same baseline and leave safe transparent padding. Genuine transparent background with native alpha. No scenery, shadow rectangle, labels, borders, checkerboard, extra characters, duplicated limbs, or invented accessories.

Acceptance: square atlas; four coherent directions; canonical identity; real alpha; no baked grid; each quadrant contains exactly one figure.

## AVATAR-LANYIN-LAMENT-V6

Reference: `public/assets/anime/portraits/v1/whale-boss-portrait-runtime.webp`.

Prompt:

> Create a square head-and-shoulders Gal dialogue avatar of the exact same woman as the reference: long flowing midnight-blue hair, blue eyes, pearl-and-shell ocean ornaments, translucent cyan fin/veil motifs, blue-aqua dress. Quiet, melancholy expression with lowered energy but open eyes. Clean cel shading, broad shapes, restrained jewelry, low texture noise. Simple deep-ocean blue gradient background. Preserve face, hairline, ornaments, and costume identity exactly. No text, frame, watermark, extra hands, sea-creature face, or photorealistic detail.

Acceptance: 1:1 opaque avatar; matches standing portrait at a glance; no identity redesign.

## AVATAR-YANLI-EMBERS-V6

Reference: `public/assets/anime/characters/yanli-dialogue-embers.webp`.

Prompt:

> Create a square head-and-shoulders Gal dialogue avatar of the exact same woman as the reference: long flame-red hair, amber-red eyes, black-and-gold horned dragon crown, black/red/gold armor with the same white fur collar. Fierce but controlled ember-lit expression. Clean Gal cel shading, broad readable shapes, restrained armor detail, low texture noise. Simple dark ember-red gradient background. Preserve the face, horns, hair silhouette, fur collar, and armor identity exactly. No text, frame, watermark, extra horns, mask, photorealism, or excessive sparks.

Acceptance: 1:1 opaque avatar; immediately matches the canonical standing sprite.

## PORTRAIT-YAYU-COMBAT-V6

Reference: `public/assets/anime/characters/yayu-dialogue-guarded.webp`.

Prompt:

> Redraw a full-body transparent game/battle portrait of the exact same woman as the reference. Yayu / 影织姬·鸦羽 is an adult young woman with short raven-black hair with a subtle violet sheen, grey-violet eyes, and a guarded expression. Preserve her sleeveless black/plum/silver stealth dress, translucent violet ribbon panels, asymmetric thigh straps, slim high heels, and fine shadow-thread weapon held between her hands. Upright three-quarter combat-ready pose, full body visible from hair to shoes, centered with safe padding. Clean Gal-game cel shading, broad shapes, restrained detail and low noise. Genuine transparent background with native alpha. No hood, helmet, male body, heavy armor, cloak, bird mask, checkerboard, scenery, text, watermark, or extra limbs.

Acceptance: 2:3-ish full-body transparent portrait; female identity and canonical costume match; real alpha.
