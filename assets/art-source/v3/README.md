# Enemy identity masters — v3

This pack removes all unintended portrait reuse among the early-game and palace enemy roster, including their late-palace
variants.

- `enemy-identity-portable-masters/` contains seventeen 1024×1024 transparent,
  high-quality WebP source masters: the seven base variants plus outer crown,
  shadow-ward blade, hush-vault blade, star sentinel, crown shade, null cantor,
  shadow-ward cantor, mute guard, hush cantor, and hush-vault cantor.
- Each master has a matching 384×384 alpha-preserving WebP derivative in
  `public/assets/anime/enemies/v3/`.

The runtime derivatives are the only files loaded by the game. Keep source
masters out of the browser bundle; regenerate a WebP from its matching source
when updating an illustration.
