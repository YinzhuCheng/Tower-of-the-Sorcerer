---
name: tower-transparent-map-art
description: Generate clean, true-alpha, single-tile fantasy RPG map assets for Tower of the Sorcerer. Use for enemies, bosses, relics, weapons, gates, mechanisms, portals, cards, and other map units that must remain readable around 58x58 pixels without dirty borders, background residue, fog, or fake transparency.
---

# Tower Transparent Map Art

Use this skill when creating or replacing map-unit artwork for **Tower of the Sorcerer / 失落魔法阵：少女魔塔**.

The target is not a standalone illustration. The target is a **production game asset** that will be composited directly over the map floor.

## Core visual contract

Every generated asset must satisfy all of these requirements:

1. **True RGBA alpha transparency**
   - Transparent means real alpha, not white, black, gray, blue, or checkerboard painted into the image.
   - Except for the subject and explicitly requested tightly attached effects, all remaining pixels must have `alpha = 0`.

2. **No contaminated canvas edges**
   - All four canvas edges must be fully transparent.
   - No horizontal lines, vertical lines, crop marks, scan lines, borders, UI frames, text fragments, watermarks, or isolated dirty pixels.

3. **Transparent safety margin**
   - Keep roughly **10% transparent margin** on every side.
   - Do not crop ears, hair, weapon tips, tails, crowns, skirts, dangling gems, or gate ornaments.

4. **Readable at map scale**
   - The production map displays units at roughly **58×58 px**.
   - Prefer a strong silhouette and clear large shapes over microscopic detail.
   - Avoid excessive darkness, thin details, motion blur, depth-of-field blur, or noisy particles.

5. **No environment baked into the sprite**
   - No floor, wall, room, scenery, inventory slot, card backing, pedestal, square plate, circular UI panel, or decorative picture frame unless the requested object itself is a physical frame/gate.

6. **No large external VFX cloud**
   - No broad fog, smoke, haze, shadow pool, afterimage, aura curtain, environmental light cloud, or long particle trail around characters.
   - Small magical light is allowed only when it hugs the subject closely and remains readable after downscaling.

7. **Clean feet / lower edge for characters**
   - The region below the feet or skirt must be especially clean.
   - Do not add ground shadows, black smears, purple stains, duplicate feet, reflections, or trailing ghost pixels.

## Version-selection rule

When the same asset is generated multiple times:

- Use the **latest user-approved generation** by default.
- Only keep an older generation when the user explicitly pins or prefers it.
- Never mix visual pieces from different generations unless explicitly requested.

## Recommended output shape

- Aspect ratio: **1:1**.
- One subject per image.
- High-resolution source is preferred; runtime may downscale it.
- Center the subject while respecting the transparent safety margin.
- For ordinary items, target about 60–72% canvas occupancy.
- For gates/mechanisms, target about 70–80% occupancy.
- For full-body enemies/Bosses, maximize silhouette readability without touching the canvas border.

## Prompt construction template

Start with the semantic role, then appearance, then map-scale constraints, then the transparency contract.

```text
Generate one standalone game asset for a 2D top-down fantasy RPG magic-tower map: [ASSET NAME / ROLE].

[Describe the object or character, palette, silhouette, equipment, pose, and gameplay meaning.]

The asset must remain clearly readable when scaled to approximately 58×58 pixels. Keep the composition centered and compact.

Output requirements: true transparent RGBA background. Keep only the subject and, if necessary, a very small amount of effect tightly attached to the subject. All other pixels must have alpha=0. No floor, wall, scenery, square backing, inventory slot, UI frame, text, numbers, watermark, crop marks, border lines, large fog, smoke, shadow pool, afterimage, or isolated dirty pixels. Keep all four canvas edges fully transparent and leave about 10% transparent safety margin. Do not crop the subject.
```

## Category-specific rules

### Enemy / Boss

- Full body, clear head–torso–legs silhouette.
- Weapons must remain distinguishable at small scale.
- Effects should be attached to a hand, staff, weapon, or body rather than floating far away.
- Boss complexity should come from costume/shape hierarchy, not a giant background aura.

### Item / Relic / Weapon

- Treat it as a single compact inventory-quality object **without an inventory background**.
- Do not generate a square icon plate.
- Avoid large bloom that expands the effective alpha bounds.
- For weapons, keep blade tip and handle safely inside the canvas.

### Gate / Barrier / Mechanism

- The gameplay meaning should be readable from silhouette and motif.
- A barrier must look like a blocked passage, not accidentally like an open teleport portal.
- Never render explanatory text inside a gate asset.
- Mirror/energy material may be opaque or translucent inside the physical gate shape; everything outside that shape must remain transparent.

## Ten validated reference prompts

These prompts correspond to the first ten replacement assets audited in the 10F demo.

### 1. F2 森罗藤蔓结界 — `gate:vine`

```text
Generate a single-tile “森罗藤蔓结界” for a 2D top-down fantasy RPG magic tower. Orthographic/top-down presentation, centered for one map tile. Form a compact blockade from deep-green and cyan-green magical vines interwoven from the sides toward a bright emerald forest-rune core. It must clearly read as a blocked path that disappears after its mechanism is activated. Anime fantasy RPG asset style, refined but not realistic, with a strong silhouette and about 70–80% canvas occupancy.

True transparent RGBA background. Outside the vine barrier, all pixels alpha=0. No floor, wall, base plate, square backing, black/blue background, text, letters, numbers, UI, border, crop line, watermark, broad green mist, smoke, or residual pixels. Only a very slight glow tightly attached to the vines is allowed. Leave about 10% transparent margin on all sides.
```

### 2. F2 狐祝·绯叶 — `foxBoss / fox_boss`

```text
Generate the Boss “狐祝·绯叶” as a full-body small-scale anime fantasy RPG map character. Young adult female fox shrine mystic, elegant and imposing, long warm red-brown hair, clear fox ears, several graceful fox tails with distinct silhouettes. Mix shrine-maiden, forest-mystic, white/red/deep-green clothing with a little gold. She may hold paper charms, a ritual wand, or a small forest staff. Head, hands, tails, and body must remain readable around 58×58 pixels.

True transparent RGBA. Keep only the character and at most tiny magic light hugging her body. No forest scene, leaf background, green haze, magic cloud, environment glow curtain, aura pedestal, ground, broad shadow, square/gradient backing, UI, text, frame, white/green/gray fringe, color bleed, or trailing pixels below the feet. Leave transparent safety margin around the full character.
```

### 3. F4 辉月魔刃 — `item:weapon`

```text
Generate the high-rank weapon relic “辉月魔刃”: one elegant magic longsword/light moon blade. Slender silver-white or moonlit blue-white blade, dark blue/deep violet handle, restrained gold metal decoration, optional thin pale-blue moonlight energy line. Use a slight diagonal composition so it stays obvious as a sword at small size. Occupy roughly 65–72% of the square canvas.

True transparent RGBA. Only one complete weapon. No black square backing, equipment slot, icon frame, card slot, horizontal/vertical line, crop guide, UI, text, number, watermark, smoke, or broad shadow. Only a slight glow hugging the blade is allowed. Keep tip and handle away from canvas edges.
```

### 4. F4 招财星币 — `item:lucky`

```text
Generate the permanent relic “招财星币”: a compact magical lucky coin, optionally with two or three smaller coins naturally stacked. Warm gold metal, readable star/moon-star/luck emblem, clear highlights and shadows, premium relic feel. It must read immediately as a special lucky coin rather than a bag or chest when reduced to about 58×58 pixels. Occupy roughly 60–68% of the canvas.

True transparent RGBA. No square backing, circular UI panel, icon/card frame, edge lines, corner marks, text, price, watermark, crop guide, or rectangular shadow. The top and right edges in particular must remain fully transparent. A tiny natural contact shadow directly under the coin is acceptable only if it cannot become a dirty border.
```

### 5. F5 龙鳞护符 — `item:shield`

```text
Generate the defensive relic “龙鳞护符”: a small magical shield-shaped pendant rather than a battlefield shield. Deep blue, blue-violet, and silver palette; a clear blue dragon-scale motif or abstract dragon sigil in the center; simple silver rim; optionally a tiny gem clasp or dangling ornament. Dignified, sturdy, draconic, compact, readable at about 58×58 pixels, roughly 62–70% canvas occupancy.

True transparent RGBA. Keep only the talisman. No blue square backing, equipment-slot plate, rectangular border, top/right residual lines, UI frame, text, numbers, watermark, crop marks, isolated blue/black pixels, broad glow, or circular pedestal. Leave at least 10% fully transparent safety margin.
```

### 6. F6 星镜序列门 — `gate:mirror`

```text
Generate the “星镜序列门 / 星镜结界” for the sixth-floor star-mirror library. A compact purple-blue mirror barrier that opens only after the crescent/half/full-moon sequence is solved. Deep-purple oval or circular mirror-space in the center, silver-blue physical frame, three simple moon-phase motifs for crescent, half moon, and full moon. It must read as a sealed magical passage rather than an ordinary open portal. Purple, deep blue, silver, and restrained pale-cyan highlights. About 75% canvas occupancy.

True transparent RGBA. Absolutely no text of any language, no explanatory labels, no UI, square background, picture border, scan line, crop line, or watermark. The mirror interior may be purple; everything outside the actual gate shape must be transparent. Any glow must hug the frame and never form a square backdrop. Keep transparent margin around the gate.
```

### 7. F6 星图魔女 — `starWitch / cometArcher -> star_witch`

```text
Generate “星图魔女”, a young adult female star-magic caster in anime fantasy style, full-body small-scale RPG map character. Dark purple/night-blue long hair, small elegant witch/astrologer hat, dark purple/indigo/black-blue outfit, restrained silver star motifs and violet accents. Hold a short staff, star-chart device, or magic book. Light but hostile stance. A few tiny star points may hug the hand or staff. Keep legs and feet complete and the silhouette readable at 58×58 pixels.

True transparent RGBA. No purple stain under the feet, trailing smear, semi-transparent ghosting, black-purple ground smoke, reflection, broad shadow, starfield background, magic-circle floor base, square backing, UI, text, or watermark. Remove isolated pixels separated from the body. Keep the feet region especially clean.
```

### 8. F7 影缝忍姬 — `shadowNinja / shadow_ninja`

```text
Generate “影缝忍姬”, a young adult female ninja/dark assassin in anime fantasy RPG style. Full body, black or very dark purple-black hair in a high/side ponytail, compact black-purple light armor with a few dark-red or brighter violet accents, holding a short ninja sword/kunai in an obvious combat-ready pose. Prioritize a strong readable head–torso–legs–weapon silhouette at 58×58 pixels. Use restrained brighter violet accents only to separate dark forms.

True transparent RGBA. No large black smoke, purple fog, shadow cloud, afterimage, speed trail, shadow puddle, or background magic circle. Outside the character all pixels alpha=0. No blur, low-resolution look, heavy depth of field, or motion blur. Edges must remain crisp and there must be no broad black-purple dirty fringe.
```

### 9. F8 王庭执剑姬 / 剑圣级单位 — shared `sword_boss`

```text
Generate a high-rank female swordswoman usable as “王庭执剑姬 / 剑圣级单位”. Young adult anime fantasy RPG woman, full-body small-scale map character, black/deep blue-black long hair, calm cold expression, dark blue-black and silver royal swordswoman or magical-knight outfit, with only restrained white/violet/gold decoration. Hold a slender silver magic sword in a clear battle-ready stance. Keep the design generic enough for a sword saint, crown swordswoman, and silent-court blade officer. Legs and sword tip must remain complete and readable at 58×58 pixels.

True transparent RGBA. No ink smear beneath the feet, ghosting, black drag trail, blue-violet smoke, broad shadow, aura pedestal, scenery, square backing, UI, text, or watermark. Everything outside the character alpha=0. Keep feet/hem especially clean and avoid white/gray/blue fringe.
```

### 10. F10 无声女王·诺克缇娅 — `finalQueen / final_queen`

```text
Generate the final Boss “无声女王·诺克缇娅”. Young adult dark-magic queen in anime fantasy style, full-body small-scale map Boss, silver-violet/pale-purple/cool-white long hair, magnificent dark-purple/black-purple/silver royal gown, exquisite crown, eclipse motif, restrained dark-star ornamentation. Solemn, cold, oppressive pose. She may hold a magic scepter or control a small amount of dark-violet magic close to her body. The design must feel clearly above ordinary enemies but retain a strong readable silhouette at 58×58 pixels.

True transparent RGBA. A very small amount of dark-purple/magenta flame or dark-star runes may hug the character, but no broad purple cloud, trailing smear below the skirt, black-purple smoke bed, long-distance afterimage, floor magic circle, giant halo, throne/palace background, square backing, UI, text, or watermark. Any clearly separated pixels must be alpha=0. Keep the skirt-bottom region clean. Crown, skirt, and scepter must fit fully inside transparent margins.
```

## Pre-integration quality-control checklist

Before committing generated artwork, verify each file:

- [ ] Image has an alpha channel.
- [ ] Canvas corners and four outer edges are transparent.
- [ ] No visible rectangular backing when composited over both light-blue floor and dark wall colors.
- [ ] No leftover text, watermark, crop line, border, or atlas residue.
- [ ] No detached halo/fog/afterimage that becomes obvious at map scale.
- [ ] Character feet/skirt bottom are clean.
- [ ] Object remains understandable at ~58×58 px.
- [ ] Subject is not cropped.
- [ ] Filename and runtime semantic key match the intended unit.
- [ ] If multiple generations exist, the selected file is the latest user-approved version.

## Integration guidance for this repository

Prefer **independent clean image assets** over extracting contaminated cells from legacy atlases.

Current replacement-style semantic keys follow patterns such as:

```text
gate:vine
gate:mirror
item:weapon
item:lucky
item:shield
enemy:fox_boss
enemy:star_witch
enemy:shadow_ninja
enemy:sword_boss
enemy:final_queen
```

Keep generation semantics and runtime semantics aligned. Do not reuse a visually unrelated portal as a fallback for a vine, forge, mirror, hush, or other specialized barrier when a dedicated asset exists.

When an artifact looks dirty in-game, determine the root cause before regenerating:

1. **Bad source alpha** → regenerate or clean the source asset.
2. **Wrong semantic mapping** → fix the mapping; do not waste generation quota.
3. **Atlas crop contamination** → prefer an independent clean asset or fix the crop pipeline.
4. **Runtime scale/position problem** → fix renderer metadata rather than regenerating.

The goal is consistent visual semantics, true transparency, and clean compositing across all ten floors.