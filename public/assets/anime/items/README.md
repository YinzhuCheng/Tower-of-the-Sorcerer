# Runtime anime item assets

Files under this directory are optimized transparent WebP images used by the map renderer. The source illustrations are generated at high resolution; runtime copies are downsampled for the 58px map tiles to reduce download cost while keeping sharp rendering.

`manifest.json` is the stable integration point. The current dedicated set covers the mana flask, moon compass, astral codex, and holy elixir; these must not be remapped to the legacy item sheet or generic treasure props.

`source-map.json` records the matching high-resolution master name. Masters are deliberately kept outside the deploy bundle; runtime files stay at 512px WebP with alpha to retain detail without inflating initial map downloads.
