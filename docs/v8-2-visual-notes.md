# V8.2 visual integration

- Added the six newly generated assets as a compact split WebP atlas: corridor main/alternate stone tiles, deep-blue exterior trim, blue corner pillar cap, UI corner, and UI divider.
- Corridor rendering now uses the generated light-blue stone textures with a low-frequency alternate tile instead of the previous flat/incorrect repeated floor art.
- Exterior walls keep the dark-gray masonry body and receive a dedicated deep-blue decorative trim only on the map perimeter.
- The four map corners now render as symmetric blue pillar cross-sections instead of directional corner-tower pieces.
- Legacy chibi and item sheets now use edge-connected background color keying so enemy/NPC black squares and potion/gem backing frames are removed without erasing dark clothing or lower-body pixels.
- Compact HUD structure and the four UI palettes remain intact; generated UI corner/divider art is layered lightly over panels rather than creating more nested cards.
