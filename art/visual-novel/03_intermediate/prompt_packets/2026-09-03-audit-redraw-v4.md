# 2026-09-03 人工审计重绘 · 提示词包 v4

## series_style_lock

Japanese 2D anime cel-shaded visual novel art, shoujo Galgame aesthetic. Clean economical line art, broad flat color shapes, restrained two-step cel shading, readable silhouettes, soft atmospheric depth, controlled highlights, smooth color fields, very low visual noise. No photorealism, no 3D render, no painterly concept art, no micro-textures, no grain, no speckled brushwork, no excessive costume filigree, no bloom, no oversharpening, no text, no logo, no watermark.

## CHAR-01 · Noctia clean transparent standing sprite

- Use case: background-extraction / identity-preserve
- Reference role: existing `noctia-dialogue-sorrow.webp` is the sole identity, costume, pose and expression authority.
- Request: redraw the same regal young woman as a clean production Galgame standing sprite; very long black hair, crimson eyes, delicate dark crown, black-and-burgundy royal gown, restrained chained red crystal sigils, austere sorrow.
- Composition: full body, head and feet visible, three-quarter front, all hair and ornaments contained in canvas.
- Output: genuinely transparent RGBA; no pale matte, white halo, checkerboard, floor or shadow.
- Invariants: same person, hairstyle, crown, dress silhouette and sorrowful expression.

## CHAR-02 · Lumi female transparent standing sprite

- Use case: stylized-concept
- Reference role: `yayu-dialogue-guarded.webp` supplies only the project’s clean Galgame line/shading language; do not copy her face, hair or outfit.
- Identity lock: young adult female astrologer; ash-violet medium-long hair with soft straight fringe; bright gold-violet eyes; indigo-and-ivory scholar-witch dress; small crescent astrolabe; two or three simple star-chart sheets.
- Composition: full body, three-quarter front, feet visible, focused analytical expression, astrolabe and papers inside canvas.
- Output: genuinely transparent RGBA; no floor/shadow/background.
- Avoid: male body or face, beard, masculine suit, oversized hat, excessive jewelry, text, constellations resembling writing.

## CG output contract

- Existing CG is a blocking/narrative reference, not a rendering-style reference.
- Character sprite files are identity/costume references.
- Theme file is the environment-geometry reference.
- Redraw rather than filter: simplify every surface into clear animation-friendly color fields.
- Landscape 16:9; leave the bottom 24% relatively quiet for the dialogue UI.

### CG-01

No people. Cold ceasefire night, quiet forest road leading to a sealed obsidian tower arch, small brass registration seals, blue-white index lamps and one hairline violet fracture. Seven restrained floating core lights, not text. Wide establishing shot; large calm shapes and low detail.

### CG-02

In the silent throne court, Liyue lowers her silver-blue sword instead of attacking. Noctia gently supports a fading blue-white distress light. They face one another across open floor. Preserve both identities and costumes; clear blue/black versus burgundy/black color grouping.

### CG-03

At first light above the tower, Liyue and Noctia stand side by side looking toward the pale horizon and distant architecture. Quiet aftermath, mutual responsibility rather than romance or celebration. Simple dawn gradient and readable silhouettes.

### CG-04

Dynamic but clean action: Liyue releases one broad cobalt sword arc while Noctia casts one broad crimson seal ribbon. The two forces break one central black registration sigil into a few large fragments. No particle storm, no tiny shards.

### CG-05

Echo Regent opens and releases a sealed ledger in the moonlit echo court; a few blank luminous pages rise as broad shapes. Liyue and Noctia witness from either side. The ledger is the single focus; no readable text.

### CG-06

Arcane Sovereign, with long dark-teal hair and black/ivory magistrate coat, holds a cracked signet ring at center. Liyue and Noctia face him from the sides. Stable three-person triangle in the origin-core chamber; accountability, fatigue and restraint.

### CG-07

Back view of Liyue, Shawu and Noctia watching the ember lighthouse and calm gray harbor at dawn. Characters occupy the middle ground and keep canonical hair/costume color silhouettes. Quiet humane closure; no fireworks or triumph pose.
